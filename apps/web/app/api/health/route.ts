import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Public health endpoint showing source freshness.
 * Displayed on the source health bar and available as a public API.
 * GET /api/health
 */
export async function GET() {
  const { data: sources, error } = await supabase
    .from("data_sources")
    .select("id, name, last_success_at, last_error_at, last_error, update_frequency, incident_count, is_enabled")
    .eq("is_enabled", true)
    .order("name");

  if (error) {
    return NextResponse.json({ error: "Failed to fetch source health" }, { status: 500 });
  }

  const health = sources.map((s) => ({
    sourceId: s.id,
    name: s.name,
    status: getStatus(s.last_success_at, s.last_error_at),
    lastUpdate: s.last_success_at,
    lastError: s.last_error_at ? { at: s.last_error_at, message: s.last_error } : null,
    expectedFrequency: s.update_frequency,
    incidentCount: s.incident_count,
  }));

  return NextResponse.json({ sources: health, checkedAt: new Date().toISOString() });
}

function getStatus(lastSuccess: string | null, lastError: string | null): string {
  if (!lastSuccess) return "no_data";
  const hoursSince = (Date.now() - new Date(lastSuccess).getTime()) / (1000 * 60 * 60);
  if (lastError && new Date(lastError) > new Date(lastSuccess)) return "error";
  if (hoursSince < 1) return "healthy";
  if (hoursSince < 24) return "healthy";
  if (hoursSince < 168) return "stale";
  return "stale";
}
