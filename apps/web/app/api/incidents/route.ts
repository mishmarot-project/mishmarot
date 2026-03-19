import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const country = searchParams.get("country");
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const type = searchParams.get("type");
  const source = searchParams.get("source");
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "100"), 1000);
  const offset = parseInt(searchParams.get("offset") ?? "0");

  const supabase = getSupabase();
  let query = supabase
    .from("incidents")
    .select("*", { count: "exact" })
    .eq("is_retracted", false)
    .eq("is_canonical", true)
    .order("occurred_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (country) query = query.eq("country_iso", country.toUpperCase());
  if (from) query = query.gte("occurred_at", from);
  if (to) query = query.lte("occurred_at", to);
  if (type) query = query.eq("incident_type", type);
  if (source) query = query.eq("source_id", source);

  const { data, count, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    incidents: data,
    total: count,
    limit,
    offset,
  });
}
