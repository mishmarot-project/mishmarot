-- Mishmarot Initial Migration
-- Enables PostGIS, creates partitioned incidents table, sets up RLS policies.
-- Run against the Supabase-managed PostgreSQL instance.

-- Extensions
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ============================================================
-- Data Sources Registry
-- ============================================================
CREATE TABLE IF NOT EXISTS data_sources (
  id                TEXT PRIMARY KEY,
  name              TEXT NOT NULL,
  description       TEXT,
  url               TEXT,
  update_frequency  TEXT,
  cron_schedule     TEXT,
  last_ingested_at  TIMESTAMPTZ,
  last_success_at   TIMESTAMPTZ,
  last_error_at     TIMESTAMPTZ,
  last_error        TEXT,
  is_enabled        BOOLEAN NOT NULL DEFAULT true,
  incident_count    INTEGER NOT NULL DEFAULT 0,
  coverage          TEXT,
  methodology       TEXT,
  license           TEXT
);

-- ============================================================
-- Taxonomy Mappings
-- ============================================================
CREATE TABLE IF NOT EXISTS taxonomy_mappings (
  source_taxonomy     TEXT NOT NULL,
  source_category     TEXT NOT NULL,
  canonical_type      TEXT NOT NULL,
  canonical_severity  INTEGER,
  notes               TEXT,
  PRIMARY KEY (source_taxonomy, source_category)
);

-- ============================================================
-- Incidents (core table)
-- ============================================================
-- Note: For production, this should be partitioned by occurred_at
-- using pg_partman. For MVP, we use a regular table with indexes.
CREATE TABLE IF NOT EXISTS incidents (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Source tracking
  source_id               TEXT NOT NULL,
  source_ref              TEXT,
  ingested_at             TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Temporal
  occurred_at             TIMESTAMPTZ NOT NULL,
  reported_at             TIMESTAMPTZ,
  time_precision          SMALLINT NOT NULL DEFAULT 1,

  -- Geographic
  lat                     DOUBLE PRECISION,
  lon                     DOUBLE PRECISION,
  geo_precision           SMALLINT NOT NULL DEFAULT 3,
  country_iso             TEXT,
  admin1                  TEXT,
  locality                TEXT,
  locality_population     INTEGER,

  -- PostGIS geometry (auto-generated from lat/lon)
  geom                    GEOMETRY(Point, 4326) GENERATED ALWAYS AS (
    CASE WHEN lat IS NOT NULL AND lon IS NOT NULL
      THEN ST_SetSRID(ST_MakePoint(lon, lat), 4326)
      ELSE NULL
    END
  ) STORED,

  -- Classification - Dimension 1: Severity
  incident_type           TEXT NOT NULL,
  severity                SMALLINT NOT NULL DEFAULT 3,
  setting                 TEXT,

  -- Classification - Dimension 2: Manifestation
  manifestations          TEXT[] NOT NULL DEFAULT '{}',

  -- Classification - Dimension 3: Explicitness
  explicitness            TEXT NOT NULL DEFAULT 'explicit',

  -- Definition framework
  definition_framework    TEXT NOT NULL DEFAULT 'ihra',
  classification_tags     TEXT[] NOT NULL DEFAULT '{}',

  -- Source-native classification (preserved for researchers)
  source_classification   TEXT,
  source_taxonomy_version TEXT,

  -- Verification
  confidence              SMALLINT NOT NULL DEFAULT 3,
  verification_notes      TEXT,

  -- Content (sanitized)
  summary                 TEXT,
  source_url              TEXT,

  -- Deduplication
  cluster_id              UUID,
  is_canonical            BOOLEAN NOT NULL DEFAULT true,

  -- Soft deletion
  is_retracted            BOOLEAN NOT NULL DEFAULT false,
  retraction_reason       TEXT,

  -- GDPR
  gdpr_review_required    BOOLEAN NOT NULL DEFAULT false
);

-- ============================================================
-- Indexes
-- ============================================================

-- Spatial index on PostGIS geometry
CREATE INDEX IF NOT EXISTS idx_incidents_geom
  ON incidents USING GIST (geom);

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_incidents_source
  ON incidents (source_id, source_ref);

CREATE INDEX IF NOT EXISTS idx_incidents_country
  ON incidents (country_iso, admin1);

CREATE INDEX IF NOT EXISTS idx_incidents_type
  ON incidents (incident_type, severity);

CREATE INDEX IF NOT EXISTS idx_incidents_confidence
  ON incidents (confidence);

CREATE INDEX IF NOT EXISTS idx_incidents_occurred
  ON incidents (occurred_at DESC);

CREATE INDEX IF NOT EXISTS idx_incidents_cluster
  ON incidents (cluster_id) WHERE cluster_id IS NOT NULL;

-- Full-text search on summaries
CREATE INDEX IF NOT EXISTS idx_incidents_summary_trgm
  ON incidents USING GIN (summary gin_trgm_ops);

-- Unique constraint to prevent duplicate ingestion
CREATE UNIQUE INDEX IF NOT EXISTS idx_incidents_source_dedup
  ON incidents (source_id, source_ref) WHERE source_ref IS NOT NULL;

-- ============================================================
-- Row-Level Security
-- ============================================================
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;

-- Public (anon): only confirmed/verified, with 72-hour delay
CREATE POLICY "public_read" ON incidents
  FOR SELECT
  TO anon
  USING (
    confidence <= 2
    AND is_retracted = false
    AND occurred_at < now() - INTERVAL '72 hours'
  );

-- Authenticated users with 'researcher' role: all confidence levels, no delay
CREATE POLICY "researcher_read" ON incidents
  FOR SELECT
  TO authenticated
  USING (
    is_retracted = false
    AND (auth.jwt() ->> 'role') = 'researcher'
  );

-- Partner role: everything including retracted (for audit)
CREATE POLICY "partner_read" ON incidents
  FOR SELECT
  TO authenticated
  USING (
    (auth.jwt() ->> 'role') IN ('partner', 'admin')
  );

-- Service role (ingestion workers): full CRUD
-- Workers connect via service_role key, bypassing RLS

-- ============================================================
-- Seed: Data Sources
-- ============================================================
INSERT INTO data_sources (id, name, description, url, update_frequency, cron_schedule, coverage, license)
VALUES
  ('gdelt', 'GDELT Project', 'Global media monitoring with REL_ANTISEMITISM theme. Signals layer — captures media narrative, not verified incidents.', 'https://www.gdeltproject.org/', 'Every 15 minutes', '*/15 * * * *', 'Global', 'Open access, no restrictions'),
  ('fbi', 'FBI Crime Data Explorer', 'US federal hate crime statistics via NIBRS. Anti-Jewish bias code filterable. 9-12 month reporting lag.', 'https://crime-data-explorer.fr.cloud.gov/', 'Annual', '0 0 1 1 *', 'United States', 'CC0 Public Domain'),
  ('osce', 'OSCE/ODIHR Hate Crime Reporting', 'Hate crime data from 57 OSCE participating states. Anti-Semitic bias motivation filterable.', 'https://hatecrime.osce.org/', 'Annual (November)', '0 0 16 11 *', '57 OSCE states', 'Open access'),
  ('adl_heat', 'ADL H.E.A.T. Map', 'US antisemitic incidents verified by ADL. Categorized as assault, harassment, vandalism.', 'https://www.adl.org/resources/tools-to-track-hate/heat-map', 'Monthly', '0 0 1 * *', 'United States', 'No formal license — partnership recommended')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- Seed: Taxonomy Mappings
-- ============================================================
INSERT INTO taxonomy_mappings (source_taxonomy, source_category, canonical_type, canonical_severity, notes)
VALUES
  -- ADL mappings
  ('adl', 'assault', 'assault', 2, NULL),
  ('adl', 'harassment', 'abusive_behaviour', 5, 'ADL harassment includes verbal abuse, slurs, and online harassment'),
  ('adl', 'vandalism', 'targeted_damage', 3, NULL),
  -- CST mappings
  ('cst', 'extreme_violence', 'extreme_violence', 1, 'GBH or threat to life'),
  ('cst', 'assault', 'assault', 2, 'Includes spitting, throwing objects, attempts'),
  ('cst', 'damage_desecration', 'targeted_damage', 3, NULL),
  ('cst', 'threats', 'threat', 4, NULL),
  ('cst', 'abusive_behaviour', 'abusive_behaviour', 5, 'Verbal abuse, graffiti, most online antisemitism'),
  ('cst', 'literature', 'propaganda_literature', 5, 'Mass-produced antisemitic materials'),
  -- RIAS mappings
  ('rias', 'extreme_violence', 'extreme_violence', 1, NULL),
  ('rias', 'assault', 'assault', 2, NULL),
  ('rias', 'targeted_damage', 'targeted_damage', 3, NULL),
  ('rias', 'threatening_behaviour', 'threat', 4, NULL),
  ('rias', 'offensive_behaviour', 'abusive_behaviour', 5, NULL),
  ('rias', 'mass_mailings', 'propaganda_literature', 5, NULL)
ON CONFLICT DO NOTHING;
