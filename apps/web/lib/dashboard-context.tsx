"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { IncidentFeedItem } from "./types";

interface DashboardContextValue {
  selectedIncidentId: string | null;
  setSelectedIncidentId: (id: string | null) => void;
  incidents: IncidentFeedItem[];
  setIncidents: (incidents: IncidentFeedItem[]) => void;
}

const DashboardContext = createContext<DashboardContextValue | null>(null);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);
  const [incidents, setIncidents] = useState<IncidentFeedItem[]>([]);

  return (
    <DashboardContext.Provider
      value={{ selectedIncidentId, setSelectedIncidentId, incidents, setIncidents }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error("useDashboard must be used within DashboardProvider");
  return ctx;
}
