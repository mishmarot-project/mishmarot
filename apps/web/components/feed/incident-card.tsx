"use client";

import { useState } from "react";
import type { IncidentFeedItem } from "@/lib/types";
import { formatTimeAgo, formatIncidentType, formatLocation } from "@/lib/format";

const SEVERITY_HEX: Record<number, string> = {
  1: "#ef4444",
  2: "#f97316",
  3: "#eab308",
  4: "#3b82f6",
  5: "#a3a3a3",
};

function SeverityDot({ severity, confidence }: { severity: number; confidence: number }) {
  const color = SEVERITY_HEX[severity] ?? SEVERITY_HEX[5];
  const title = confidence === 1 ? "Confirmed" : confidence === 2 ? "Verified" : "Credible";

  if (confidence === 1) {
    return (
      <span title={title} style={{ color }}>●●</span>
    );
  }
  if (confidence === 2) {
    return (
      <span title={title} style={{ color }}>●</span>
    );
  }
  if (confidence === 3) {
    return (
      <span title={title} style={{ color, opacity: 0.7 }}>○</span>
    );
  }
  return null;
}

interface IncidentCardProps {
  incident: IncidentFeedItem;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

export function IncidentCard({ incident, isSelected, onSelect }: IncidentCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const location = formatLocation(incident);
  const isLocationPending = !incident.lat && !incident.lon && !incident.admin1 && !incident.locality;

  return (
    <button
      type="button"
      onClick={() => {
        setIsExpanded((prev) => !prev);
        onSelect(incident.id);
      }}
      className={`w-full text-left px-4 py-3 transition-colors border-l-2 ${
        isSelected
          ? "bg-neutral-900 border-blue-500"
          : "border-transparent hover:bg-neutral-900"
      }`}
    >
      <div className="flex items-center gap-2 text-sm">
        <span className="text-neutral-500 shrink-0">
          {formatTimeAgo(incident.occurredAt)}
        </span>
        <span className="text-neutral-600">·</span>
        <span className={`truncate ${isLocationPending ? "text-neutral-500 italic" : "text-neutral-300"}`}>
          {isLocationPending ? "Location pending" : location}
        </span>
        <span className="text-neutral-600">·</span>
        <span className="text-neutral-300 shrink-0">
          {formatIncidentType(incident.incidentType)}
        </span>
        <span className="ml-auto shrink-0">
          <SeverityDot severity={incident.severity} confidence={incident.confidence} />
        </span>
      </div>

      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-neutral-800 space-y-2 text-sm">
          {incident.summary && (
            <p className="text-neutral-300 leading-relaxed">{incident.summary}</p>
          )}
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-neutral-500">
            <span>Severity {incident.severity}</span>
            {incident.setting && (
              <span>Setting: {formatIncidentType(incident.setting)}</span>
            )}
            {incident.manifestations.length > 0 && (
              <span>
                {incident.manifestations.map(formatIncidentType).join(", ")}
              </span>
            )}
            <span>Explicitness: {incident.explicitness}</span>
          </div>
          {incident.sourceUrl && (
            <a
              href={incident.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
            >
              {incident.sourceId} ↗
            </a>
          )}
        </div>
      )}
    </button>
  );
}
