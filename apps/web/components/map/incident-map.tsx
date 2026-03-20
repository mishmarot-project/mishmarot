"use client";

import { useEffect, useMemo, useRef } from "react";
import maplibregl from "maplibre-gl";
import { MapboxOverlay } from "@deck.gl/mapbox";
import { ScatterplotLayer } from "@deck.gl/layers";
import { useDashboard } from "@/lib/dashboard-context";
import { formatTimeAgo, formatIncidentType, formatLocation } from "@/lib/format";
import type { IncidentFeedItem } from "@/lib/types";

const DARK_MATTER_STYLE =
  "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";

const SEVERITY_COLORS: Record<number, [number, number, number]> = {
  1: [239, 68, 68],   // red — extreme violence
  2: [249, 115, 22],  // orange — assault
  3: [234, 179, 8],   // yellow — targeted damage
  4: [59, 130, 246],  // blue — direct threat
  5: [163, 163, 163], // neutral — harassment/speech
};

const SEVERITY_LABELS: Record<number, string> = {
  1: "Extreme Violence",
  2: "Assault",
  3: "Targeted Damage",
  4: "Direct Threat",
  5: "Harassment / Speech",
};

const DEFAULT_CENTER: [number, number] = [15, 35];
const DEFAULT_ZOOM = 2;
const MARKER_RADIUS_PX = 6;
const SELECTED_RADIUS_PX = 12;

function plottableIncidents(incidents: IncidentFeedItem[]): IncidentFeedItem[] {
  return incidents.filter(
    (d) => d.lat != null && d.lon != null && d.geoPrecision !== 5
  );
}

export function IncidentMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const overlayRef = useRef<MapboxOverlay | null>(null);
  const popupRef = useRef<maplibregl.Popup | null>(null);
  const hasInitialFit = useRef(false);

  const { incidents, selectedIncidentId, setSelectedIncidentId } =
    useDashboard();

  const plottable = useMemo(() => plottableIncidents(incidents), [incidents]);

  // Effect 1: Map initialization
  useEffect(() => {
    if (!containerRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: DARK_MATTER_STYLE,
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      attributionControl: false,
    });

    map.addControl(
      new maplibregl.AttributionControl({ compact: true }),
      "bottom-left"
    );

    const overlay = new MapboxOverlay({ layers: [] });

    map.once("load", () => {
      map.addControl(overlay as unknown as maplibregl.IControl);
    });

    const popup = new maplibregl.Popup({
      closeButton: true,
      closeOnClick: false,
      maxWidth: "280px",
      className: "incident-popup",
    });

    mapRef.current = map;
    overlayRef.current = overlay;
    popupRef.current = popup;

    return () => {
      popup.remove();
      overlay.finalize();
      map.remove();
      mapRef.current = null;
      overlayRef.current = null;
      popupRef.current = null;
    };
  }, []);

  // Effect 2: Layer update
  useEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay) return;

    const layer = new ScatterplotLayer<IncidentFeedItem>({
      id: "incidents",
      data: plottable,
      getPosition: (d) => [d.lon!, d.lat!],
      getFillColor: (d) => {
        const rgb = SEVERITY_COLORS[d.severity] ?? SEVERITY_COLORS[5];
        const alpha = d.confidence === 2 ? 180 : 230;
        return [...rgb, alpha] as [number, number, number, number];
      },
      getRadius: (d) =>
        d.id === selectedIncidentId ? SELECTED_RADIUS_PX : MARKER_RADIUS_PX,
      radiusUnits: "pixels",
      pickable: true,
      autoHighlight: true,
      highlightColor: [255, 255, 255, 80],
      onClick: (info) => {
        if (info.object) {
          const d = info.object;
          setSelectedIncidentId(d.id);

          const map = mapRef.current;
          const popup = popupRef.current;
          if (map && popup && d.lon != null && d.lat != null) {
            const [r, g, b] = SEVERITY_COLORS[d.severity] ?? SEVERITY_COLORS[5];
            popup
              .setLngLat([d.lon, d.lat])
              .setHTML(
                `<div style="font-family:system-ui;font-size:13px;color:#e5e5e5">` +
                  `<div style="font-weight:600;margin-bottom:4px">${formatIncidentType(d.incidentType)}</div>` +
                  `<div style="color:#a3a3a3;font-size:12px;margin-bottom:6px">${formatLocation(d)}</div>` +
                  `<div style="display:flex;align-items:center;gap:6px;font-size:12px">` +
                    `<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:rgb(${r},${g},${b})"></span>` +
                    `<span style="color:#a3a3a3">${SEVERITY_LABELS[d.severity] ?? "Unknown"}</span>` +
                  `</div>` +
                  `<div style="color:#737373;font-size:11px;margin-top:4px">${formatTimeAgo(d.occurredAt)}</div>` +
                `</div>`
              )
              .addTo(map);
          }
        }
      },
      updateTriggers: {
        getRadius: selectedIncidentId,
        getFillColor: selectedIncidentId,
      },
    });

    overlay.setProps({ layers: [layer] });
  }, [plottable, selectedIncidentId, setSelectedIncidentId]);

  // Effect 3: Fly-to on selection
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedIncidentId) return;

    const incident = plottable.find((d) => d.id === selectedIncidentId);
    if (!incident || incident.lat == null || incident.lon == null) return;

    map.flyTo({
      center: [incident.lon, incident.lat],
      zoom: Math.max(map.getZoom(), 5),
      duration: 800,
    });
  }, [selectedIncidentId, plottable]);

  // Effect 4: Resize observer
  useEffect(() => {
    const container = containerRef.current;
    const map = mapRef.current;
    if (!container || !map) return;

    const observer = new ResizeObserver(() => {
      map.resize();
    });
    observer.observe(container);

    return () => observer.disconnect();
  }, []);

  // Effect 5: Initial fitBounds
  useEffect(() => {
    const map = mapRef.current;
    if (!map || plottable.length === 0 || hasInitialFit.current) return;

    hasInitialFit.current = true;

    const bounds = new maplibregl.LngLatBounds();
    for (const d of plottable) {
      bounds.extend([d.lon!, d.lat!]);
    }

    map.once("load", () => {
      map.fitBounds(bounds, { padding: 60, maxZoom: 8 });
    });

    if (map.loaded()) {
      map.fitBounds(bounds, { padding: 60, maxZoom: 8 });
    }
  }, [plottable]);

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full" />
      <div className="absolute bottom-6 right-3 bg-neutral-950/80 backdrop-blur-sm border border-neutral-800 rounded-lg px-3 py-2.5 text-xs pointer-events-none">
        <div className="text-neutral-400 font-medium mb-1.5">Severity</div>
        {Object.entries(SEVERITY_COLORS).map(([level, [r, g, b]]) => (
          <div key={level} className="flex items-center gap-2 py-0.5">
            <span
              className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
              style={{ background: `rgb(${r},${g},${b})` }}
            />
            <span className="text-neutral-400">
              {SEVERITY_LABELS[Number(level)]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
