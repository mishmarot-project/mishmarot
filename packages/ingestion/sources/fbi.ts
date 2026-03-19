import { Job } from "bullmq";
import { BaseIngestionWorker } from "../base-worker.js";
import type { RawIncident } from "@mishmarot/shared";

const FBI_API_BASE = "https://api.usa.gov/crime/fbi/sapi";

/**
 * FBI Crime Data Explorer ingestion worker.
 *
 * Queries the FBI's UCR/NIBRS API for anti-Jewish bias hate crimes.
 * CC0 public domain license. Requires a free data.gov API key.
 *
 * Key characteristics:
 * - Annual data release with 9-12 month lag
 * - Anti-Jewish bias is a specific filterable code
 * - NIBRS provides incident-level detail (offense, victim, location type)
 * - Chronic underreporting: ~88% of agencies report zero hate crimes
 * - Runs daily to catch new data releases, but new data is rare
 */
export class FbiWorker extends BaseIngestionWorker {
  constructor(redisUrl: string) {
    super({
      sourceId: "fbi",
      queueName: "fbi-ingest",
      cronSchedule: "0 6 * * *", // Daily at 6 AM
      redisUrl,
    });
  }

  protected async fetch(_job: Job): Promise<RawIncident[]> {
    // TODO: Implement FBI Crime Data API integration
    // 1. Query /api/nibrs/hate-crime/offense/national with anti-Jewish bias filter
    // 2. Compare against last ingested data to find new records
    // 3. Parse NIBRS incident-level data into RawIncident format
    console.log("[fbi] FBI ingestion not yet implemented");
    return [];
  }
}
