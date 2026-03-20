"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { DashboardProvider } from "@/lib/dashboard-context";
import { IncidentFeed } from "@/components/feed/incident-feed";
import { MobileViewToggle } from "./mobile-view-toggle";
import type { FeedFilters } from "@/lib/types";

const IncidentMap = dynamic(
  () => import("@/components/map/incident-map").then((m) => m.IncidentMap),
  { ssr: false }
);

export function DashboardLayout({ filters }: { filters: FeedFilters }) {
  const [mobileView, setMobileView] = useState<"feed" | "map">("feed");

  return (
    <DashboardProvider>
      {/* Mobile toggle */}
      <MobileViewToggle activeView={mobileView} onToggle={setMobileView} />

      {/* Desktop: side-by-side */}
      <div className="flex-1 flex overflow-hidden">
        {/* Feed panel */}
        <div
          className={`${
            mobileView === "feed" ? "flex" : "hidden"
          } lg:flex flex-col w-full lg:w-[420px] lg:border-r border-neutral-800 overflow-hidden`}
        >
          <IncidentFeed filters={filters} />
        </div>

        {/* Map panel */}
        <div
          className={`${
            mobileView === "map" ? "flex" : "hidden"
          } lg:flex flex-1 relative`}
        >
          <IncidentMap />
        </div>
      </div>
    </DashboardProvider>
  );
}
