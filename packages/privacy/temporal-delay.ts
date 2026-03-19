const PUBLIC_DELAY_HOURS = 72;

/**
 * Check whether an incident has passed the temporal delay
 * required for public display.
 *
 * Geographic data is subject to a minimum 72-hour delay
 * to prevent targeting of active response scenes.
 */
export function isWithinTemporalDelay(
  occurredAt: Date,
  accessTier: "public" | "researcher" | "partner" | "admin"
): boolean {
  if (accessTier !== "public") {
    return false; // no delay for authenticated tiers
  }

  const delayMs = PUBLIC_DELAY_HOURS * 60 * 60 * 1000;
  const cutoff = new Date(Date.now() - delayMs);
  return occurredAt > cutoff;
}
