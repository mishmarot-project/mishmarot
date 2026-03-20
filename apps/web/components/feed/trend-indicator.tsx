"use client";

import { useEffect, useState } from "react";
import type { TrendData, FeedFilters } from "@/lib/types";

type TrendState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "loaded"; data: TrendData };

export function TrendIndicator({ filters }: { filters: FeedFilters }) {
  const [state, setState] = useState<TrendState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams();
    if (filters.days) params.set("days", String(filters.days));
    if (filters.region) params.set("region", filters.region);

    fetch(`/api/trends?${params}`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setState({ status: "loaded", data });
      })
      .catch(() => {
        if (!cancelled) setState({ status: "error" });
      });

    return () => { cancelled = true; };
  }, [filters.days, filters.region]);

  if (state.status === "loading" || state.status === "error") {
    return (
      <div className="px-4 py-3 border-b border-neutral-800">
        <div className="h-5 w-48 bg-neutral-800 rounded animate-pulse" />
      </div>
    );
  }

  const trend = state.data;

  if (trend.count === 0 && trend.priorCount === 0) {
    return (
      <div className="px-4 py-3 border-b border-neutral-800">
        <span className="text-sm text-neutral-500">No incidents in this period</span>
      </div>
    );
  }

  const arrow =
    trend.percentChange > 0 ? "↑" : trend.percentChange < 0 ? "↓" : "→";
  const arrowColor =
    trend.percentChange > 0
      ? "text-red-400"
      : trend.percentChange < 0
        ? "text-emerald-400"
        : "text-neutral-400";

  return (
    <div className="px-4 py-3 border-b border-neutral-800">
      <span className="text-sm text-neutral-200">
        {trend.count} incident{trend.count !== 1 ? "s" : ""} past {trend.periodDays} days{" "}
      </span>
      <span className={`text-sm font-medium ${arrowColor}`}>
        {arrow} {Math.abs(trend.percentChange)}% vs prior {trend.periodDays} days
      </span>
    </div>
  );
}
