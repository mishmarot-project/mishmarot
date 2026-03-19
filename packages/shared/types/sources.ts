export interface DataSource {
  id: string;
  name: string;
  description: string;
  url: string;
  updateFrequency: string; // cron expression or human-readable
  lastIngestedAt: Date | null;
  lastSuccessAt: Date | null;
  lastErrorAt: Date | null;
  lastError: string | null;
  isEnabled: boolean;
  incidentCount: number;
  coverage: string; // geographic scope description
  methodology: string | null;
  license: string | null;
}

export interface SourceHealth {
  sourceId: string;
  name: string;
  status: "healthy" | "degraded" | "stale" | "error";
  lastUpdate: Date | null;
  expectedFrequency: string;
  incidentCount: number;
}
