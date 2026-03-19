import {
  pgTable,
  uuid,
  text,
  timestamp,
  smallint,
  doublePrecision,
  boolean,
  integer,
  index,
} from "drizzle-orm/pg-core";

/**
 * Core incidents table.
 *
 * This is the canonical data model for all antisemitic incidents
 * regardless of source. Each ingestion worker normalizes source-native
 * data into this schema.
 *
 * Geographic data is stored as lat/lon rather than PostGIS geometry
 * in the ORM layer. A generated column and spatial index are created
 * in the migration SQL for PostGIS queries.
 *
 * Partitioned by occurred_at (monthly) via pg_partman in migrations.
 */
export const incidents = pgTable(
  "incidents",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    // Source tracking
    sourceId: text("source_id").notNull(),
    sourceRef: text("source_ref"),
    ingestedAt: timestamp("ingested_at", { withTimezone: true })
      .notNull()
      .defaultNow(),

    // Temporal
    occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull(),
    reportedAt: timestamp("reported_at", { withTimezone: true }),
    timePrecision: smallint("time_precision").notNull().default(1),

    // Geographic
    lat: doublePrecision("lat"),
    lon: doublePrecision("lon"),
    geoPrecision: smallint("geo_precision").notNull().default(3),
    countryIso: text("country_iso"),
    admin1: text("admin1"),
    locality: text("locality"),
    localityPopulation: integer("locality_population"),

    // Classification - Dimension 1: Severity
    incidentType: text("incident_type").notNull(),
    severity: smallint("severity").notNull().default(3),
    setting: text("setting"),

    // Classification - Dimension 2: Manifestation (stored as text array)
    manifestations: text("manifestations")
      .array()
      .notNull()
      .default([]),

    // Classification - Dimension 3: Explicitness
    explicitness: text("explicitness").notNull().default("explicit"),

    // Definition framework transparency
    definitionFramework: text("definition_framework")
      .notNull()
      .default("ihra"),
    classificationTags: text("classification_tags")
      .array()
      .notNull()
      .default([]),

    // Source-native classification (preserved verbatim for researchers)
    sourceClassification: text("source_classification"),
    sourceTaxonomyVersion: text("source_taxonomy_version"),

    // Verification
    confidence: smallint("confidence").notNull().default(3),
    verificationNotes: text("verification_notes"),

    // Content (sanitized — never store raw hateful content)
    summary: text("summary"),
    sourceUrl: text("source_url"),

    // Deduplication
    clusterId: uuid("cluster_id"),
    isCanonical: boolean("is_canonical").notNull().default(true),

    // Soft deletion
    isRetracted: boolean("is_retracted").notNull().default(false),
    retractionReason: text("retraction_reason"),

    // GDPR
    gdprReviewRequired: boolean("gdpr_review_required")
      .notNull()
      .default(false),
  },
  (table) => [
    index("idx_incidents_source").on(table.sourceId, table.sourceRef),
    index("idx_incidents_country").on(table.countryIso, table.admin1),
    index("idx_incidents_type").on(table.incidentType, table.severity),
    index("idx_incidents_confidence").on(table.confidence),
    index("idx_incidents_occurred").on(table.occurredAt),
    index("idx_incidents_cluster").on(table.clusterId),
  ]
);
