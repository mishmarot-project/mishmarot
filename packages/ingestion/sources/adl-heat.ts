import { Job } from "bullmq";
import { BaseIngestionWorker } from "../base-worker.js";
import type { RawIncident } from "@mishmarot/shared";

/**
 * ADL H.E.A.T. Map ingestion worker.
 *
 * Ingests incident data from the ADL's Hate, Extremism, Antisemitism,
 * Terrorism map. No official API — data is intercepted from client-side
 * JSON requests served by the H.E.A.T. Map frontend.
 *
 * Key characteristics:
 * - Highest-value US source: 9,354 verified incidents in 2024
 * - Categorized as assault, harassment, vandalism
 * - City-level geographic granularity
 * - Monthly updates to H.E.A.T. Map, annual Audit publication
 * - No official API or open-data license (partnership recommended)
 *
 * LEGAL NOTE: This worker ingests publicly accessible data from the
 * ADL website. A formal data-sharing agreement should be pursued in
 * Phase 2 to ensure compliance and mutual benefit.
 */
export class AdlHeatWorker extends BaseIngestionWorker {
  constructor(redisUrl: string) {
    super({
      sourceId: "adl_heat",
      queueName: "adl-heat-ingest",
      cronSchedule: "0 3 * * *", // Daily at 3 AM
      redisUrl,
    });
  }

  protected async fetch(_job: Job): Promise<RawIncident[]> {
    // TODO: Implement ADL H.E.A.T. Map ingestion
    // 1. Fetch client-side JSON from H.E.A.T. Map network requests
    // 2. Parse incident data (type, location, date, description)
    // 3. Map ADL categories to canonical taxonomy
    // 4. Convert to RawIncident format
    console.log("[adl_heat] ADL H.E.A.T. Map ingestion not yet implemented");
    return [];
  }
}
