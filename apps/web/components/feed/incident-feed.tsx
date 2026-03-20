"use client";

import { useEffect, useRef, useState } from "react";
import { subscribeToIncidents } from "@/lib/supabase";
import { useDashboard } from "@/lib/dashboard-context";
import type { FeedFilters, IncidentFeedItem } from "@/lib/types";
import { TrendIndicator } from "./trend-indicator";
import { FilterBar } from "@/components/filters/filter-bar";
import { IncidentCard } from "./incident-card";

export function IncidentFeed({ filters }: { filters: FeedFilters }) {
  const { selectedIncidentId, setSelectedIncidentId, setIncidents } = useDashboard();
  const [feedItems, setFeedItems] = useState<IncidentFeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const fetchIdRef = useRef(0);

  useEffect(() => {
    const fetchId = ++fetchIdRef.current;
    const params = new URLSearchParams();
    if (filters.region) params.set("country", filters.region);
    if (filters.days) params.set("days", String(filters.days));
    if (filters.setting) params.set("setting", filters.setting);
    if (filters.severity) params.set("severity", filters.severity);
    if (filters.source) params.set("source", filters.source);

    fetch(`/api/incidents?${params}`)
      .then((res) => res.json())
      .then((data) => {
        if (fetchId !== fetchIdRef.current) return;
        setFeedItems(data.incidents ?? []);
        setIncidents(data.incidents ?? []);
        setLoading(false);
      })
      .catch(() => {
        if (fetchId !== fetchIdRef.current) return;
        setFeedItems([]);
        setIncidents([]);
        setLoading(false);
      });
  }, [filters, setIncidents]);

  useEffect(() => {
    const channel = subscribeToIncidents((payload) => {
      const realtimeItem: IncidentFeedItem = {
        id: (payload as Record<string, unknown>).id as string,
        occurredAt: (payload as Record<string, unknown>).occurred_at as string,
        countryIso: (payload as Record<string, unknown>).country_iso as string | null,
        admin1: null,
        locality: null,
        lat: null,
        lon: null,
        geoPrecision: 5 as IncidentFeedItem["geoPrecision"],
        incidentType: (payload as Record<string, unknown>).incident_type as IncidentFeedItem["incidentType"],
        confidence: (payload as Record<string, unknown>).confidence as IncidentFeedItem["confidence"],
        severity: (payload as Record<string, unknown>).severity as IncidentFeedItem["severity"],
        manifestations: ((payload as Record<string, unknown>).manifestations ?? []) as IncidentFeedItem["manifestations"],
        explicitness: (payload as Record<string, unknown>).explicitness as IncidentFeedItem["explicitness"],
        setting: (payload as Record<string, unknown>).setting as IncidentFeedItem["setting"],
        summary: (payload as Record<string, unknown>).summary as string | null,
        sourceId: (payload as Record<string, unknown>).source_id as string,
        sourceUrl: (payload as Record<string, unknown>).source_url as string | null,
      };
      setFeedItems((prev) => [realtimeItem, ...prev]);
    });

    return () => {
      channel.unsubscribe();
    };
  }, []);

  return (
    <div className="flex flex-col h-full">
      <TrendIndicator filters={filters} />
      <FilterBar filters={filters} />

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="space-y-1">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="px-4 py-3">
                <div className="h-4 bg-neutral-800 rounded animate-pulse" />
              </div>
            ))}
          </div>
        ) : feedItems.length === 0 ? (
          <div className="flex items-center justify-center h-48 text-neutral-500 text-sm">
            No incidents match your filters
          </div>
        ) : (
          <div className="divide-y divide-neutral-800/50">
            {feedItems.map((incident) => (
              <IncidentCard
                key={incident.id}
                incident={incident}
                isSelected={selectedIncidentId === incident.id}
                onSelect={setSelectedIncidentId}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
