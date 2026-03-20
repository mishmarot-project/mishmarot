import type { IncidentFeedItem } from "./types";

export function formatTimeAgo(date: string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function formatIncidentType(type: string): string {
  return type
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function formatLocation(incident: IncidentFeedItem): string {
  if (incident.locality && incident.admin1) {
    return `${incident.locality}, ${incident.admin1}`;
  }
  if (incident.admin1 && incident.countryIso) {
    return `${incident.admin1}, ${incident.countryIso}`;
  }
  if (incident.countryIso) {
    return incident.countryIso;
  }
  return "Location withheld";
}
