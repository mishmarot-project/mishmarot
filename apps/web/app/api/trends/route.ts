import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const bucket = searchParams.get("bucket") ?? "month";
  const from = searchParams.get("from") ?? "2020-01-01";
  const to = searchParams.get("to");
  const country = searchParams.get("country");

  return NextResponse.json({
    bucket,
    from,
    to,
    country,
    data: [],
    message: "Trends aggregation not yet implemented",
  });
}
