import { Worker, Queue, Job } from "bullmq";
import type { RawIncident } from "@mishmarot/shared";
import { SOURCE_TAXONOMY_MAP } from "@mishmarot/shared";
import { db, incidents, dataSources } from "@mishmarot/db";
import { eq, sql } from "drizzle-orm";

type IncidentInsert = typeof incidents.$inferInsert;

const EU_EEA_COUNTRIES = new Set([
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR",
  "DE", "GR", "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL",
  "PL", "PT", "RO", "SK", "SI", "ES", "SE", // EU-27
  "IS", "LI", "NO", // EEA non-EU
]);

export interface WorkerConfig {
  sourceId: string;
  queueName: string;
  cronSchedule: string;
  redisUrl: string;
  concurrency?: number;
}

/**
 * Base class for all ingestion workers.
 *
 * Each data source implements a concrete subclass that:
 * 1. Fetches raw data from the source API/endpoint
 * 2. Parses it into RawIncident[] format
 * 3. Returns the array for the base class to handle normalization and storage
 *
 * The base class handles:
 * - BullMQ queue and worker setup
 * - Cron scheduling
 * - Error handling and retry logic
 * - Source health reporting
 * - Metrics (job count, duration, errors)
 */
export abstract class BaseIngestionWorker {
  protected queue: Queue;
  protected worker: Worker;
  protected config: WorkerConfig;
  protected lastInsertCount = 0;

  constructor(config: WorkerConfig) {
    this.config = config;

    const connection = { url: config.redisUrl };

    this.queue = new Queue(config.queueName, {
      connection,
      defaultJobOptions: {
        removeOnComplete: { count: 100 },
        removeOnFail: { count: 500 },
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 5000,
        },
      },
    });

    this.worker = new Worker(
      config.queueName,
      async (job: Job) => {
        const startTime = Date.now();
        const jobType = job.name;

        try {
          this.lastInsertCount = 0;
          console.log(
            `[${config.sourceId}] Starting ${jobType} job ${job.id}`
          );

          const rawIncidents = await this.fetch(job);
          const count = rawIncidents.length;

          console.log(
            `[${config.sourceId}] Fetched ${count} raw incidents in ${Date.now() - startTime}ms`
          );

          if (count > 0) {
            await this.store(rawIncidents);
          }

          await this.updateSourceHealth(true);

          return { count, durationMs: Date.now() - startTime };
        } catch (error) {
          console.error(
            `[${config.sourceId}] Job ${job.id} failed:`,
            error
          );
          await this.updateSourceHealth(false, String(error));
          throw error;
        }
      },
      {
        connection,
        concurrency: config.concurrency ?? 1,
      }
    );

    this.worker.on("failed", (job, err) => {
      console.error(
        `[${config.sourceId}] Job ${job?.id} failed permanently:`,
        err.message
      );
    });
  }

  /**
   * Fetch raw incidents from the data source.
   * Implemented by each source-specific worker.
   */
  protected abstract fetch(job: Job): Promise<RawIncident[]>;

  /**
   * Store normalized incidents in the database.
   * Base implementation handles normalization, sanitization,
   * dedup checking, and insert.
   */
  protected async store(rawIncidents: RawIncident[]): Promise<void> {
    const rows = rawIncidents.map((raw) => this.normalize(raw));
    const inserted = await db
      .insert(incidents)
      .values(rows)
      .onConflictDoNothing()
      .returning({ id: incidents.id });
    this.lastInsertCount = inserted.length;
    console.log(
      `[${this.config.sourceId}] Stored ${inserted.length}/${rows.length} incidents (${rows.length - inserted.length} duplicates skipped)`
    );
  }

  private normalize(raw: RawIncident): IncidentInsert {
    const mapping = raw.sourceCategory
      ? SOURCE_TAXONOMY_MAP[raw.sourceId]?.[raw.sourceCategory]
      : undefined;

    const incidentType = mapping?.incidentType ?? "other";
    const severity = mapping?.severity ?? 3;

    const hasCoords = raw.lat != null && raw.lon != null;
    const geoPrecision = hasCoords ? 3 : raw.countryIso ? 5 : 5;
    const timePrecision = raw.occurredAt ? 2 : 4;

    return {
      sourceId: raw.sourceId,
      sourceRef: raw.sourceRef,
      occurredAt: raw.occurredAt ?? new Date(),
      reportedAt: raw.reportedAt,
      timePrecision,
      lat: raw.lat,
      lon: raw.lon,
      geoPrecision,
      countryIso: raw.countryIso,
      admin1: raw.admin1,
      locality: raw.locality,
      incidentType,
      severity,
      setting: null,
      manifestations: [],
      explicitness: "ambiguous",
      definitionFramework: "ihra",
      classificationTags: [],
      sourceClassification: raw.sourceCategory,
      confidence: this.getDefaultConfidence(),
      // TODO: NLP sanitization of raw summary
      summary: raw.rawSummary,
      sourceUrl: raw.sourceUrl,
      gdprReviewRequired: raw.countryIso
        ? EU_EEA_COUNTRIES.has(raw.countryIso)
        : false,
    };
  }

  protected getDefaultConfidence(): number {
    return 3; // credible — subclasses override for higher-verification sources
  }

  /**
   * Update the data_sources table with health status.
   */
  protected async updateSourceHealth(
    success: boolean,
    error?: string
  ): Promise<void> {
    try {
      if (success) {
        await db
          .update(dataSources)
          .set({
            lastSuccessAt: sql`now()`,
            lastIngestedAt: sql`now()`,
            incidentCount: sql`${dataSources.incidentCount} + ${this.lastInsertCount}`,
          })
          .where(eq(dataSources.id, this.config.sourceId));
      } else {
        await db
          .update(dataSources)
          .set({
            lastErrorAt: sql`now()`,
            lastError: error ?? "Unknown error",
          })
          .where(eq(dataSources.id, this.config.sourceId));
      }
    } catch (e) {
      console.error(
        `[${this.config.sourceId}] Failed to update source health:`,
        e
      );
    }
  }

  /**
   * Register the cron schedule for this worker.
   * Call once at startup.
   */
  async registerCron(): Promise<void> {
    await this.queue.upsertJobScheduler(
      `${this.config.sourceId}-scheduled`,
      { pattern: this.config.cronSchedule },
    );
    console.log(
      `[${this.config.sourceId}] Cron registered: ${this.config.cronSchedule}`
    );
  }

  /**
   * Trigger a manual fetch (for testing or backfill).
   */
  async triggerManual(): Promise<void> {
    await this.queue.add(`${this.config.sourceId}-manual`, {
      manual: true,
      triggeredAt: new Date().toISOString(),
    });
  }

  /**
   * Graceful shutdown.
   */
  async shutdown(): Promise<void> {
    await this.worker.close();
    await this.queue.close();
    console.log(`[${this.config.sourceId}] Worker shut down`);
  }
}
