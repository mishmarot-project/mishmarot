import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Trends aggregation endpoint.
 * Returns time-bucketed incident counts for the timeline view.
 *
 * GET /api/trends?bucket=month&from=2023-01-01&country=US
 *
 * Note: This uses a server-side Supabase client with RPC calls
 * to PostgreSQL functions for time-bucket aggregation.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const bucket = searchParams.get("bucket") ?? "month";
  const from = searchParams.get("from") ?? "2020-01-01";
  const to = searchParams.get("to");
  const country = searchParams.get("country");

  // TODO: Implement as a PostgreSQL function called via Supabase RPC
  // For MVP, use a simple group-by query
  // SELECT date_trunc($bucket, occurred_at) as period, count(*), source_id
  // FROM incidents WHERE confidence <= 2 AND ...
  // GROUP BY period, source_id ORDER BY period

  return NextResponse.json({
    bucket,
    from,
    to,
    country,
    data: [], // Placeholder
    message: "Trends aggregation not yet implemented",
  });
}
