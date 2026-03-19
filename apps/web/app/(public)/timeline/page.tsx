/**
 * Timeline view.
 *
 * TimescaleDB time_bucket aggregations powering time-series charts.
 * Overlays major events (October 7, holidays, political events) as reference lines.
 * Source breakdown by color shows where data comes from.
 */
export default function TimelinePage() {
  return (
    <main className="min-h-screen p-8">
      <h1 className="text-2xl font-semibold mb-4">Timeline</h1>
      <p className="text-neutral-400">
        Time-series analysis of incidents across sources. Coming soon.
      </p>
    </main>
  );
}
