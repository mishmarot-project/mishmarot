"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SETTINGS } from "@mishmarot/shared";
import type { FeedFilters } from "@/lib/types";

const REGIONS = [
  { value: "", label: "All regions" },
  { value: "US", label: "United States" },
  { value: "GB", label: "United Kingdom" },
  { value: "FR", label: "France" },
  { value: "DE", label: "Germany" },
  { value: "CA", label: "Canada" },
  { value: "AU", label: "Australia" },
  { value: "IL", label: "Israel" },
];

const TIME_RANGES = [
  { value: "7", label: "7d" },
  { value: "30", label: "30d" },
  { value: "90", label: "90d" },
  { value: "", label: "All" },
];

function formatSettingLabel(setting: string): string {
  return setting
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function FilterBar({ filters }: { filters: FeedFilters }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showMore, setShowMore] = useState(false);

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/?${params.toString()}`, { scroll: false });
  }

  return (
    <div className="px-4 py-3 border-b border-neutral-800 space-y-3">
      <div className="flex items-center gap-3 flex-wrap">
        <select
          value={filters.region ?? ""}
          onChange={(e) => updateFilter("region", e.target.value)}
          className="bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-sm text-neutral-200 focus:outline-none focus:border-neutral-600"
        >
          {REGIONS.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>

        <div className="flex rounded border border-neutral-700 overflow-hidden">
          {TIME_RANGES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => updateFilter("days", t.value)}
              className={`px-3 py-1 text-sm transition-colors ${
                String(filters.days ?? "") === t.value
                  ? "bg-neutral-700 text-neutral-100"
                  : "bg-neutral-800 text-neutral-400 hover:text-neutral-200"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setShowMore((prev) => !prev)}
          className="text-xs text-neutral-500 hover:text-neutral-300 transition-colors"
        >
          {showMore ? "− Less filters" : "+ More filters"}
        </button>
      </div>

      {showMore && (
        <div className="flex items-center gap-3 flex-wrap">
          <select
            value={filters.setting ?? ""}
            onChange={(e) => updateFilter("setting", e.target.value)}
            className="bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-sm text-neutral-200 focus:outline-none focus:border-neutral-600"
          >
            <option value="">All settings</option>
            {SETTINGS.map((s) => (
              <option key={s} value={s}>
                {formatSettingLabel(s)}
              </option>
            ))}
          </select>

          <select
            value={filters.severity ?? ""}
            onChange={(e) => updateFilter("severity", e.target.value)}
            className="bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-sm text-neutral-200 focus:outline-none focus:border-neutral-600"
          >
            <option value="">All severities</option>
            <option value="1">1 — Extreme violence</option>
            <option value="2">2 — Assault</option>
            <option value="3">3 — Targeted damage</option>
            <option value="4">4 — Direct threat</option>
            <option value="5">5 — Harassment/speech</option>
          </select>

          <select
            value={filters.source ?? ""}
            onChange={(e) => updateFilter("source", e.target.value)}
            className="bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-sm text-neutral-200 focus:outline-none focus:border-neutral-600"
          >
            <option value="">All sources</option>
            <option value="adl">ADL</option>
            <option value="cst">CST</option>
            <option value="rias">RIAS</option>
          </select>
        </div>
      )}
    </div>
  );
}
