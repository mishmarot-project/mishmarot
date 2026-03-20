import { NextRequest, NextResponse } from "next/server";
import { db, incidents } from "@mishmarot/db";
import { and, eq, gte, lte, lt, sql, SQL } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const days = parseInt(searchParams.get("days") ?? "7");
  const region = searchParams.get("region");

  const now = new Date();
  const periodStart = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  const priorStart = new Date(periodStart.getTime() - days * 24 * 60 * 60 * 1000);

  try {
    const baseConditions: SQL[] = [
      eq(incidents.isRetracted, false),
      eq(incidents.isCanonical, true),
      lte(incidents.confidence, 2),
    ];

    if (region) {
      baseConditions.push(eq(incidents.countryIso, region.toUpperCase()));
    }

    const [current, prior] = await Promise.all([
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(incidents)
        .where(and(...baseConditions, gte(incidents.occurredAt, periodStart), lte(incidents.occurredAt, now))),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(incidents)
        .where(and(...baseConditions, gte(incidents.occurredAt, priorStart), lt(incidents.occurredAt, periodStart))),
    ]);

    const count = current[0]?.count ?? 0;
    const priorCount = prior[0]?.count ?? 0;
    const percentChange =
      priorCount === 0
        ? count > 0
          ? 100
          : 0
        : Math.round(((count - priorCount) / priorCount) * 100);

    return NextResponse.json({
      count,
      priorCount,
      percentChange,
      periodDays: days,
    });
  } catch (error) {
    console.error("[trends] Query failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
