"use client";

import { useEffect, useRef, useState } from "react";
import { subscribeToIncidents } from "@/lib/supabase";

/**
 * Core map component using deck.gl + MapLibre GL JS.
 *
 * MVP implementation:
 * - MapLibre base layer with dark style
 * - deck.gl HexagonLayer for incident density aggregation
 * - Supabase Realtime subscription for live incident pulse animations
 * - Click handler for country → admin1 drill-down
 *
 * Dependencies (deck.gl, maplibre-gl) are heavy — this component
 * is client-only and lazy-loaded.
 */
export function IncidentMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [incidentCount, setIncidentCount] = useState(0);

  useEffect(() => {
    // Subscribe to real-time incidents
    const channel = subscribeToIncidents((incident) => {
      setIncidentCount((prev) => prev + 1);
      // TODO: Add incident to deck.gl layer with pulse animation
      console.log("New incident:", incident);
    });

    return () => {
      channel.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    // TODO: Initialize MapLibre + deck.gl
    // 1. Create MapLibre map with dark basestyle
    //    (e.g., https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json)
    // 2. Create deck.gl Deck instance with MapLibre as base
    // 3. Add HexagonLayer with incidents data
    // 4. Wire up viewport state for drill-down

    console.log("Map container ready — deck.gl initialization pending");
  }, []);

  return (
    <div ref={mapRef} className="absolute inset-0">
      {/* Placeholder until deck.gl is initialized */}
      <div className="absolute inset-0 flex items-center justify-center bg-neutral-950">
        <div className="text-center">
          <div className="text-4xl mb-4">🌍</div>
          <p className="text-neutral-400 text-sm">
            Initializing map...
          </p>
          {incidentCount > 0 && (
            <p className="text-neutral-500 text-xs mt-2">
              {incidentCount} incidents received via Realtime
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
