import { Worker, Queue, Job } from "bullmq";
import type { RawIncident } from "@mishmarot/shared";

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
    // TODO: Implement normalization pipeline
    // 1. Normalize each RawIncident → IncidentInsert via taxonomy mapping
    // 2. Sanitize summary (strip hateful content)
    // 3. Check for duplicates via source_id + source_ref
    // 4. Assign confidence tier
    // 5. Flag GDPR review if EU geography
    // 6. Insert into database
    console.log(
      `[${this.config.sourceId}] Would store ${rawIncidents.length} incidents (not yet implemented)`
    );
  }

  /**
   * Update the data_sources table with health status.
   */
  protected async updateSourceHealth(
    success: boolean,
    error?: string
  ): Promise<void> {
    // TODO: Update data_sources table via Supabase client
    console.log(
      `[${this.config.sourceId}] Health update: ${success ? "OK" : "ERROR"}`
    );
  }

  /**
   * Register the cron schedule for this worker.
   * Call once at startup.
   */
  async registerCron(): Promise<void> {
    await this.queue.upsertJobSchedulers([
      {
        name: `${this.config.sourceId}-scheduled`,
        pattern: this.config.cronSchedule,
      },
    ]);
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
