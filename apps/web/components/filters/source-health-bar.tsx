"use client";

import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";

interface SourceStatus {
  id: string;
  name: string;
  lastUpdate: string | null;
  updateFrequency: string | null;
}

/**
 * Transparent source health bar displayed at the bottom of the dashboard.
 * Shows when each data source was last updated — radical transparency
 * about data freshness builds trust and sets expectations.
 */
export function SourceHealthBar() {
  const [sources, setSources] = useState<SourceStatus[]>([]);

  useEffect(() => {
    async function fetchSources() {
      const { data } = await getSupabase()
        .from("data_sources")
        .select("id, name, last_success_at, update_frequency")
        .eq("is_enabled", true)
        .order("name");

      if (data) {
        setSources(
          data.map((s) => ({
            id: s.id,
            name: s.name,
            lastUpdate: s.last_success_at,
            updateFrequency: s.update_frequency,
          }))
        );
      }
    }
    fetchSources();
  }, []);

  return (
    <div className="bg-neutral-900/80 backdrop-blur-sm border-t border-neutral-800 px-4 py-2">
      <div className="flex items-center gap-6 overflow-x-auto text-xs">
        <span className="text-neutral-500 font-medium shrink-0">Sources:</span>
        {sources.map((source) => (
          <div key={source.id} className="flex items-center gap-2 shrink-0">
            <StatusDot lastUpdate={source.lastUpdate} frequency={source.updateFrequency} />
            <span className="text-neutral-300">{source.name}</span>
            <span className="text-neutral-500">
              {source.lastUpdate
                ? formatRelativeTime(new Date(source.lastUpdate))
                : "No data yet"}
            </span>
          </div>
        ))}
        {sources.length === 0 && (
          <span className="text-neutral-500">Loading source status...</span>
        )}
      </div>
    </div>
  );
}

function StatusDot({ lastUpdate, frequency }: { lastUpdate: string | null; frequency: string | null }) {
  const color = getStatusColor(lastUpdate, frequency);
  return <span className={`inline-block w-2 h-2 rounded-full ${color}`} />;
}

function getStatusColor(lastUpdate: string | null, _frequency: string | null): string {
  if (!lastUpdate) return "bg-neutral-600";
  const hoursSince = (Date.now() - new Date(lastUpdate).getTime()) / (1000 * 60 * 60);
  if (hoursSince < 1) return "bg-emerald-400";
  if (hoursSince < 24) return "bg-yellow-400";
  if (hoursSince < 168) return "bg-orange-400";
  return "bg-red-400";
}

function formatRelativeTime(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
