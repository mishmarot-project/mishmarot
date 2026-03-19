import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
} from "drizzle-orm/pg-core";

/**
 * Registry of all data sources feeding into the platform.
 * Used for source health monitoring and the public transparency dashboard.
 */
export const dataSources = pgTable("data_sources", {
  id: text("id").primaryKey(), // e.g., 'gdelt', 'fbi', 'osce', 'adl_heat'
  name: text("name").notNull(),
  description: text("description"),
  url: text("url"),
  updateFrequency: text("update_frequency"), // human-readable, e.g., "Every 15 minutes"
  cronSchedule: text("cron_schedule"), // machine-readable, e.g., "*/15 * * * *"
  lastIngestedAt: timestamp("last_ingested_at", { withTimezone: true }),
  lastSuccessAt: timestamp("last_success_at", { withTimezone: true }),
  lastErrorAt: timestamp("last_error_at", { withTimezone: true }),
  lastError: text("last_error"),
  isEnabled: boolean("is_enabled").notNull().default(true),
  incidentCount: integer("incident_count").notNull().default(0),
  coverage: text("coverage"), // geographic scope
  methodology: text("methodology"),
  license: text("license"),
});

/**
 * Source taxonomy mapping table.
 * Maps source-native categories to the canonical Mishmarot taxonomy.
 * Versioned so researchers can track mapping changes over time.
 */
export const taxonomyMappings = pgTable("taxonomy_mappings", {
  sourceTaxonomy: text("source_taxonomy").notNull(), // e.g., 'adl', 'cst', 'rias'
  sourceCategory: text("source_category").notNull(), // e.g., 'harassment'
  canonicalType: text("canonical_type").notNull(), // our incident_type value
  canonicalSeverity: integer("canonical_severity"),
  notes: text("notes"),
});
