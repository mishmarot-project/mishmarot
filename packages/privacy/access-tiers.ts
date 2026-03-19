/**
 * Access tier definitions.
 *
 * These tiers are enforced at two levels:
 * 1. Database: Supabase RLS policies filter rows by tier
 * 2. Application: Geographic precision is downgraded per tier
 *
 * Cloudflare Access provides the authentication layer for
 * researcher and partner tiers.
 */
export type AccessTier = "public" | "researcher" | "partner" | "admin";

export interface TierCapabilities {
  maxGeoPrecision: number; // 1=exact through 5=country
  temporalDelayHours: number;
  canSeeRetracted: boolean;
  canExportBulk: boolean;
  canSeeUnverified: boolean;
  maxConfidenceTier: number; // 1-4, lower = higher confidence required
}

export const TIER_CAPABILITIES: Record<AccessTier, TierCapabilities> = {
  public: {
    maxGeoPrecision: 4, // state/region level
    temporalDelayHours: 72,
    canSeeRetracted: false,
    canExportBulk: false,
    canSeeUnverified: false,
    maxConfidenceTier: 2, // confirmed + verified only
  },
  researcher: {
    maxGeoPrecision: 3, // city level
    temporalDelayHours: 0,
    canSeeRetracted: false,
    canExportBulk: true,
    canSeeUnverified: false,
    maxConfidenceTier: 3, // includes credible
  },
  partner: {
    maxGeoPrecision: 1, // full precision
    temporalDelayHours: 0,
    canSeeRetracted: true,
    canExportBulk: true,
    canSeeUnverified: true,
    maxConfidenceTier: 4, // everything
  },
  admin: {
    maxGeoPrecision: 1,
    temporalDelayHours: 0,
    canSeeRetracted: true,
    canExportBulk: true,
    canSeeUnverified: true,
    maxConfidenceTier: 4,
  },
};
