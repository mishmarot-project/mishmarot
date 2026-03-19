/**
 * Mishmarot Incident Taxonomy v1.0
 *
 * Two-dimensional classification aligned with:
 * - ADL Audit (US, 3-tier: assault/harassment/vandalism)
 * - CST (UK, 6-tier: extreme violence through abusive behaviour)
 * - RIAS/ENMA (Germany/EU, severity + manifestation)
 * - Decoding Antisemitism (King's College London, explicitness)
 *
 * See docs/taxonomy/v1.0.md for full documentation and mapping tables.
 */

// Dimension 1: Incident type (what happened)
export const INCIDENT_TYPES = [
  "extreme_violence",
  "assault",
  "targeted_damage",
  "desecration",
  "threat",
  "abusive_behaviour",
  "propaganda_literature",
  "online_abuse",
  "institutional",
  "other",
] as const;

export type IncidentType = (typeof INCIDENT_TYPES)[number];

// Severity scale (1 = most severe)
export const SEVERITY_LEVELS = {
  1: "extreme_violence", // Murder, attempted murder, bombing, arson with persons
  2: "assault", // Physical attack causing injury
  3: "targeted_damage", // Property destruction, arson without persons
  4: "direct_threat", // Credible threat of violence
  5: "harassment_speech", // Verbal/online abuse, propaganda, institutional
} as const;

export type SeverityLevel = keyof typeof SEVERITY_LEVELS;

// Dimension 2: Antisemitic manifestation (ideological content)
// Aligned with RIAS 5-type model + religious category
export const MANIFESTATIONS = [
  "modern", // Conspiracy myths, financial/power tropes
  "othering", // Marking as alien, exclusion
  "post_shoah", // Holocaust denial, distortion, trivialization
  "israel_related", // Demonization, delegitimization, double standards
  "religious", // Theological antisemitism, deicide accusations
] as const;

export type Manifestation = (typeof MANIFESTATIONS)[number];

// Dimension 3: Explicitness (Decoding Antisemitism framework)
export const EXPLICITNESS_LEVELS = [
  "explicit", // Openly hostile, no ambiguity
  "implicit", // Uses known tropes/stereotypes indirectly
  "coded", // Dog whistles, requires cultural knowledge to identify
  "ambiguous", // Context-dependent, reasonable disagreement possible
] as const;

export type ExplicitnessLevel = (typeof EXPLICITNESS_LEVELS)[number];

// Setting where incident occurred
export const SETTINGS = [
  "synagogue_jewish_institution",
  "campus",
  "street_public_space",
  "residence",
  "workplace",
  "school_k12",
  "online",
  "government_political",
  "cemetery_memorial",
  "transit",
  "other",
] as const;

export type Setting = (typeof SETTINGS)[number];

// Verification confidence tiers
export const CONFIDENCE_TIERS = {
  1: {
    label: "confirmed",
    description:
      "Law enforcement-confirmed with multiple independent sources and media corroboration",
    public_display: true,
  },
  2: {
    label: "verified",
    description:
      "Verified by trained staff or partner organization with at least one independent source",
    public_display: true,
  },
  3: {
    label: "credible",
    description:
      "Single credible report awaiting corroboration, displayed with visual indicator",
    public_display: true,
    requires_indicator: true,
  },
  4: {
    label: "unverified",
    description: "Self-reported and pending review, withheld from public display",
    public_display: false,
  },
} as const;

export type ConfidenceTier = keyof typeof CONFIDENCE_TIERS;

// Geographic precision levels
export const GEO_PRECISION = {
  1: "exact", // Exact coordinates known
  2: "street", // Street-level accuracy
  3: "city", // City/locality centroid
  4: "admin1", // State/province level
  5: "country", // Country centroid only
} as const;

export type GeoPrecision = keyof typeof GEO_PRECISION;

// Time precision levels
export const TIME_PRECISION = {
  1: "exact", // Exact date and time known
  2: "day", // Date known, time approximate
  3: "week", // Known to within a week
  4: "month", // Known to within a month
  5: "year", // Known to within a year
} as const;

export type TimePrecision = keyof typeof TIME_PRECISION;

// Definition frameworks for transparency
export const DEFINITION_FRAMEWORKS = [
  "ihra", // IHRA Working Definition (primary)
  "jda", // Jerusalem Declaration on Antisemitism
  "source_native", // Source's own classification, unmapped
] as const;

export type DefinitionFramework = (typeof DEFINITION_FRAMEWORKS)[number];

// Source taxonomy mapping table
// Used by normalizers to map source-native categories to canonical types
export const SOURCE_TAXONOMY_MAP: Record<
  string,
  Record<string, { incidentType: IncidentType; severity: SeverityLevel }>
> = {
  adl: {
    assault: { incidentType: "assault", severity: 2 },
    harassment: { incidentType: "abusive_behaviour", severity: 5 },
    vandalism: { incidentType: "targeted_damage", severity: 3 },
  },
  cst: {
    extreme_violence: { incidentType: "extreme_violence", severity: 1 },
    assault: { incidentType: "assault", severity: 2 },
    damage_desecration: { incidentType: "targeted_damage", severity: 3 },
    threats: { incidentType: "threat", severity: 4 },
    abusive_behaviour: { incidentType: "abusive_behaviour", severity: 5 },
    literature: { incidentType: "propaganda_literature", severity: 5 },
  },
  rias: {
    extreme_violence: { incidentType: "extreme_violence", severity: 1 },
    assault: { incidentType: "assault", severity: 2 },
    targeted_damage: { incidentType: "targeted_damage", severity: 3 },
    threatening_behaviour: { incidentType: "threat", severity: 4 },
    offensive_behaviour: { incidentType: "abusive_behaviour", severity: 5 },
    mass_mailings: { incidentType: "propaganda_literature", severity: 5 },
  },
  fbi: {
    anti_jewish: { incidentType: "other", severity: 3 }, // FBI doesn't sub-classify by type
  },
};
