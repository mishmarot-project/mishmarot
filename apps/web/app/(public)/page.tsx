import { IncidentMap } from "@/components/map/incident-map";
import { SourceHealthBar } from "@/components/filters/source-health-bar";

/**
 * Default dashboard view: the live globe.
 *
 * Renders a full-viewport MapLibre + deck.gl map with:
 * - Hexbin aggregation at country level for public users
 * - GDELT signals streaming via Supabase Realtime
 * - Color encoding incident density over trailing 30 days
 * - Click-to-drill from country → admin1 where data supports it
 *
 * Source health bar at bottom shows data freshness per source.
 */
export default function DashboardPage() {
  return (
    <main className="relative h-screen w-screen overflow-hidden">
      {/* Header overlay */}
      <header className="absolute top-0 left-0 right-0 z-10 p-4 pointer-events-none">
        <div className="pointer-events-auto inline-flex items-center gap-3 bg-neutral-900/80 backdrop-blur-sm rounded-lg px-4 py-2 border border-neutral-800">
          <h1 className="text-lg font-semibold tracking-tight">Mishmarot</h1>
          <span className="text-xs text-neutral-400">
            Global Antisemitism Situational Awareness
          </span>
        </div>
        <nav className="pointer-events-auto inline-flex ml-4 gap-1 bg-neutral-900/80 backdrop-blur-sm rounded-lg border border-neutral-800">
          <a
            href="/"
            className="px-3 py-2 text-sm font-medium text-neutral-100 bg-neutral-800 rounded-lg"
          >
            Globe
          </a>
          <a
            href="/timeline"
            className="px-3 py-2 text-sm font-medium text-neutral-400 hover:text-neutral-100 transition-colors"
          >
            Timeline
          </a>
          <a
            href="/sources"
            className="px-3 py-2 text-sm font-medium text-neutral-400 hover:text-neutral-100 transition-colors"
          >
            Sources
          </a>
        </nav>
      </header>

      {/* Map */}
      <IncidentMap />

      {/* Source health bar */}
      <footer className="absolute bottom-0 left-0 right-0 z-10">
        <SourceHealthBar />
      </footer>
    </main>
  );
}
