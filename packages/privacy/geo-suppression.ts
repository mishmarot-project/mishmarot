import type { GeoPrecision } from "@mishmarot/shared";

const MINIMUM_POPULATION_THRESHOLD = 20_000;

/**
 * Downgrade geographic precision for public display.
 *
 * Implements the population-threshold approach used by Stop AAPI Hate:
 * localities below 20,000 population are suppressed to prevent
 * community identification. Coordinates are snapped to a grid
 * based on access tier.
 */
export function suppressGeography(
  lat: number | null,
  lon: number | null,
  geoPrecision: GeoPrecision,
  localityPopulation: number | null,
  accessTier: "public" | "researcher" | "partner" | "admin"
): { lat: number | null; lon: number | null; geoPrecision: GeoPrecision; locality: string | null } {
  if (lat === null || lon === null) {
    return { lat: null, lon: null, geoPrecision, locality: null };
  }

  switch (accessTier) {
    case "admin":
    case "partner":
      // Full precision
      return { lat, lon, geoPrecision, locality: null };

    case "researcher":
      // County-level: snap to ~11km grid
      return {
        lat: Math.round(lat * 10) / 10,
        lon: Math.round(lon * 10) / 10,
        geoPrecision: Math.max(geoPrecision, 3) as GeoPrecision,
        locality: localityPopulation && localityPopulation >= MINIMUM_POPULATION_THRESHOLD
          ? null // preserve — will be filled by caller
          : null,
      };

    case "public":
    default:
      // State/region level: snap to ~110km grid
      return {
        lat: Math.round(lat),
        lon: Math.round(lon),
        geoPrecision: Math.max(geoPrecision, 4) as GeoPrecision,
        locality: null, // always suppressed for public
      };
  }
}
