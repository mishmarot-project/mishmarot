import type {
  IncidentType,
  SeverityLevel,
  Manifestation,
  ExplicitnessLevel,
  Setting,
  ConfidenceTier,
  GeoPrecision,
  TimePrecision,
  DefinitionFramework,
} from "../constants/taxonomy.js";

export interface Incident {
  id: string;

  // Source tracking
  sourceId: string;
  sourceRef: string | null;
  ingestedAt: Date;

  // Temporal
  occurredAt: Date;
  reportedAt: Date | null;
  timePrecision: TimePrecision;

  // Geographic
  lat: number | null;
  lon: number | null;
  geoPrecision: GeoPrecision;
  countryIso: string | null;
  admin1: string | null;
  locality: string | null;
  localityPopulation: number | null;

  // Classification - Dimension 1: Severity
  incidentType: IncidentType;
  severity: SeverityLevel;
  setting: Setting | null;

  // Classification - Dimension 2: Manifestation
  manifestations: Manifestation[];

  // Classification - Dimension 3: Explicitness
  explicitness: ExplicitnessLevel;

  // Definition framework
  definitionFramework: DefinitionFramework;
  classificationTags: string[];

  // Source-native classification (preserved verbatim)
  sourceClassification: string | null;
  sourceTaxonomyVersion: string | null;

  // Verification
  confidence: ConfidenceTier;
  verificationNotes: string | null;

  // Content (sanitized)
  summary: string | null;
  sourceUrl: string | null;

  // Deduplication
  clusterId: string | null;
  isCanonical: boolean;

  // Soft deletion
  isRetracted: boolean;
  retractionReason: string | null;

  // GDPR
  gdprReviewRequired: boolean;
}

export interface IncidentInsert extends Omit<Incident, "id" | "ingestedAt"> {}

export interface IncidentPublic
  extends Omit<
    Incident,
    | "verificationNotes"
    | "clusterId"
    | "isCanonical"
    | "isRetracted"
    | "retractionReason"
    | "gdprReviewRequired"
    | "localityPopulation"
  > {}

/**
 * Raw incident from a source before normalization.
 * Each source adapter converts its native format into this shape,
 * then the normalizer maps it to the canonical Incident type.
 */
export interface RawIncident {
  sourceId: string;
  sourceRef: string;
  rawData: Record<string, unknown>;
  occurredAt: Date | null;
  reportedAt: Date | null;
  lat: number | null;
  lon: number | null;
  countryIso: string | null;
  admin1: string | null;
  locality: string | null;
  sourceCategory: string | null;
  rawSummary: string | null;
  sourceUrl: string | null;
}
