import { NextRequest, NextResponse } from "next/server";
import { db, incidents } from "@mishmarot/db";
import { and, desc, eq, gte, lte, lt, sql, SQL } from "drizzle-orm";
import { suppressGeography, isWithinTemporalDelay } from "@mishmarot/privacy";
import type { IncidentFeedItem } from "@/lib/types";
import type { GeoPrecision } from "@mishmarot/shared";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const country = searchParams.get("country");
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const type = searchParams.get("type");
  const source = searchParams.get("source");
  const settingParam = searchParams.get("setting");
  const severity = searchParams.get("severity");
  const days = searchParams.get("days");
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "100"), 1000);
  const offset = parseInt(searchParams.get("offset") ?? "0");

  const north = searchParams.get("north");
  const south = searchParams.get("south");
  const east = searchParams.get("east");
  const west = searchParams.get("west");

  try {
    const conditions: SQL[] = [
      eq(incidents.isRetracted, false),
      eq(incidents.isCanonical, true),
      lte(incidents.confidence, 2),
    ];

    if (country) conditions.push(eq(incidents.countryIso, country.toUpperCase()));
    if (from) conditions.push(gte(incidents.occurredAt, new Date(from)));
    if (to) conditions.push(lte(incidents.occurredAt, new Date(to)));
    if (type) conditions.push(eq(incidents.incidentType, type));
    if (source) conditions.push(eq(incidents.sourceId, source));
    if (settingParam) conditions.push(eq(incidents.setting, settingParam));
    if (severity) conditions.push(eq(incidents.severity, parseInt(severity)));

    if (days) {
      const cutoff = new Date(Date.now() - parseInt(days) * 24 * 60 * 60 * 1000);
      conditions.push(gte(incidents.occurredAt, cutoff));
    }

    if (north && south && east && west) {
      conditions.push(gte(incidents.lat, parseFloat(south)));
      conditions.push(lte(incidents.lat, parseFloat(north)));
      conditions.push(gte(incidents.lon, parseFloat(west)));
      conditions.push(lte(incidents.lon, parseFloat(east)));
    }

    const where = and(...conditions);

    const [rows, countResult] = await Promise.all([
      db
        .select({
          id: incidents.id,
          occurredAt: incidents.occurredAt,
          countryIso: incidents.countryIso,
          admin1: incidents.admin1,
          locality: incidents.locality,
          lat: incidents.lat,
          lon: incidents.lon,
          geoPrecision: incidents.geoPrecision,
          localityPopulation: incidents.localityPopulation,
          incidentType: incidents.incidentType,
          confidence: incidents.confidence,
          severity: incidents.severity,
          manifestations: incidents.manifestations,
          explicitness: incidents.explicitness,
          setting: incidents.setting,
          summary: incidents.summary,
          sourceId: incidents.sourceId,
          sourceUrl: incidents.sourceUrl,
        })
        .from(incidents)
        .where(where)
        .orderBy(desc(incidents.occurredAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(incidents)
        .where(where),
    ]);

    const feedItems = rows.map((row): IncidentFeedItem => {
      const geo = suppressGeography(
        row.lat,
        row.lon,
        row.geoPrecision as GeoPrecision,
        row.localityPopulation,
        "public"
      );

      const delayed = isWithinTemporalDelay(new Date(row.occurredAt), "public");

      return {
        id: row.id,
        occurredAt: row.occurredAt.toISOString(),
        countryIso: row.countryIso,
        admin1: delayed ? null : geo.geoPrecision <= 4 ? row.admin1 : null,
        locality: delayed ? null : geo.locality,
        lat: delayed ? null : geo.lat,
        lon: delayed ? null : geo.lon,
        geoPrecision: delayed ? (5 as GeoPrecision) : geo.geoPrecision,
        incidentType: row.incidentType as IncidentFeedItem["incidentType"],
        confidence: row.confidence as IncidentFeedItem["confidence"],
        severity: row.severity as IncidentFeedItem["severity"],
        manifestations: (row.manifestations ?? []) as IncidentFeedItem["manifestations"],
        explicitness: row.explicitness as IncidentFeedItem["explicitness"],
        setting: row.setting as IncidentFeedItem["setting"],
        summary: row.summary,
        sourceId: row.sourceId,
        sourceUrl: row.sourceUrl,
      };
    });

    return NextResponse.json({
      incidents: feedItems,
      total: countResult[0]?.count ?? 0,
      limit,
      offset,
    });
  } catch (error) {
    console.error("[incidents] Query failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
