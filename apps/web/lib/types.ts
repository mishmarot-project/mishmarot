import type {
  IncidentType,
  SeverityLevel,
  Manifestation,
  ExplicitnessLevel,
  Setting,
  ConfidenceTier,
  GeoPrecision,
} from "@mishmarot/shared";

export interface IncidentFeedItem {
  id: string;
  occurredAt: string;
  countryIso: string | null;
  admin1: string | null;
  locality: string | null;
  lat: number | null;
  lon: number | null;
  geoPrecision: GeoPrecision;
  incidentType: IncidentType;
  confidence: ConfidenceTier;
  severity: SeverityLevel;
  manifestations: Manifestation[];
  explicitness: ExplicitnessLevel;
  setting: Setting | null;
  summary: string | null;
  sourceId: string;
  sourceUrl: string | null;
}

export interface FeedFilters {
  region?: string;
  days?: number;
  setting?: string;
  severity?: string;
  source?: string;
}

export interface TrendData {
  count: number;
  priorCount: number;
  percentChange: number;
  periodDays: number;
}
