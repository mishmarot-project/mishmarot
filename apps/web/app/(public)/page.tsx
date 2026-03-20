import Link from "next/link";
import { Suspense } from "react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { SourceHealthBar } from "@/components/filters/source-health-bar";
import type { FeedFilters } from "@/lib/types";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;

  const filters: FeedFilters = {
    region: typeof params.region === "string" ? params.region : undefined,
    days: typeof params.days === "string" ? parseInt(params.days) : undefined,
    setting: typeof params.setting === "string" ? params.setting : undefined,
    severity: typeof params.severity === "string" ? params.severity : undefined,
    source: typeof params.source === "string" ? params.source : undefined,
  };

  return (
    <main className="flex flex-col h-screen overflow-hidden">
      <header className="flex items-center gap-3 px-4 py-2 border-b border-neutral-800 bg-neutral-900/80 backdrop-blur-sm shrink-0">
        <h1 className="text-lg font-semibold tracking-tight">Mishmarot</h1>
        <span className="text-xs text-neutral-400 hidden sm:inline">
          Global Antisemitism Situational Awareness
        </span>
        <nav className="ml-auto flex gap-1 bg-neutral-800/50 rounded-lg p-0.5">
          <Link
            href="/"
            className="px-3 py-1.5 text-sm font-medium text-neutral-100 bg-neutral-700 rounded-md"
          >
            Dashboard
          </Link>
          <Link
            href="/timeline"
            className="px-3 py-1.5 text-sm font-medium text-neutral-400 hover:text-neutral-100 rounded-md transition-colors"
          >
            Timeline
          </Link>
          <Link
            href="/sources"
            className="px-3 py-1.5 text-sm font-medium text-neutral-400 hover:text-neutral-100 rounded-md transition-colors"
          >
            Sources
          </Link>
        </nav>
      </header>

      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardLayout filters={filters} />
      </Suspense>

      <footer className="shrink-0">
        <SourceHealthBar />
      </footer>
    </main>
  );
}

function DashboardSkeleton() {
  return (
    <div className="flex-1 flex overflow-hidden">
      <div className="w-full lg:w-[420px] lg:border-r border-neutral-800 p-4 space-y-3">
        <div className="h-5 w-48 bg-neutral-800 rounded animate-pulse" />
        <div className="h-8 w-full bg-neutral-800 rounded animate-pulse" />
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-4 bg-neutral-800 rounded animate-pulse" />
        ))}
      </div>
      <div className="hidden lg:flex flex-1 items-center justify-center bg-neutral-950">
        <span className="text-neutral-600 text-sm">Loading map...</span>
      </div>
    </div>
  );
}
