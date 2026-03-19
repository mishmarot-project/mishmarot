import { Job } from "bullmq";
import { BaseIngestionWorker } from "../base-worker.js";
import type { RawIncident } from "@mishmarot/shared";

/**
 * OSCE/ODIHR Hate Crime Reporting ingestion worker.
 *
 * Scrapes structured data from hatecrime.osce.org filtered by
 * anti-Semitic bias motivation. 57 participating states.
 *
 * Key characteristics:
 * - Annual publication (November 16)
 * - Country-level geographic precision
 * - Incident-level descriptions available for civil society reports
 * - ~33,000 civil society reports since 2016
 * - No formal API — data exportable through web portal
 */
export class OsceWorker extends BaseIngestionWorker {
  constructor(redisUrl: string) {
    super({
      sourceId: "osce",
      queueName: "osce-ingest",
      cronSchedule: "0 0 * * 1", // Weekly on Monday
      redisUrl,
    });
  }

  protected async fetch(_job: Job): Promise<RawIncident[]> {
    // TODO: Implement OSCE/ODIHR data export scraping
    // 1. Fetch export from hatecrime.osce.org with anti-Semitic filter
    // 2. Parse structured incident data
    // 3. Convert to RawIncident format with country-level precision
    console.log("[osce] OSCE ingestion not yet implemented");
    return [];
  }
}
