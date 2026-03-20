# Mishmarot Dashboard UX Specification

Version 1.0 — 2026-03-19

---

## 1. User Stories

### Security Director

- As a security director, I want to scan a chronological feed of verified incidents so I can brief leadership on the current threat landscape in under 5 minutes.
- As a security director, I want to filter by region and time range so I can focus on incidents relevant to the communities I protect.
- As a security director, I want to see trend direction (up/down vs. prior period) so I can justify resource allocation decisions with data.
- As a security director, I want to click an incident card and see it highlighted on the map so I can understand geographic clustering.

### Campus Professional

- As a campus professional, I want a feed-first view so I can quickly check what happened overnight without learning a map interface.
- As a campus professional, I want incident cards to show setting (campus, street, synagogue) so I can identify patterns relevant to my environment.
- As a campus professional, I want confidence badges on each card so I can distinguish confirmed reports from credible-but-unverified ones.

### Journalist

- As a journalist, I want source attribution and links on each incident so I can trace claims back to original reporting.
- As a journalist, I want to filter by incident type so I can research a specific category (e.g., campus incidents, violent attacks).
- As a journalist, I want trend data with percentage change so I can cite directional statistics in stories.

---

## 2. Landing Page Layout

### Desktop (>= 1024px): Dual-Panel

```
┌──────────────────────────────────────────────────────────┐
│  Mishmarot  Global Antisemitism SA   [Dashboard] Timeline Sources │
├───────────────────────┬──────────────────────────────────┤
│  12 incidents (7d)    │                                  │
│  ↑ 15% vs prior week  │                                  │
├───────────────────────┤                                  │
│  [Region ▾] 7d 30d All│         MAP PANEL                │
│  [+ More filters]     │         (flex-1)                 │
├───────────────────────┤                                  │
│                       │                                  │
│  ┌─────────────────┐  │                                  │
│  │ Incident Card   │  │                                  │
│  └─────────────────┘  │                                  │
│  ┌─────────────────┐  │                                  │
│  │ Incident Card   │  │                                  │
│  └─────────────────┘  │                                  │
│  ┌─────────────────┐  │                                  │
│  │ Incident Card   │  │                                  │
│  └─────────────────┘  │                                  │
│         ...           │                                  │
│  (overflow-y-auto)    │                                  │
├───────────────────────┴──────────────────────────────────┤
│  Sources: ● ADL 2m ago  ● CST 5h ago  ● RIAS 1d ago     │
└──────────────────────────────────────────────────────────┘

Feed panel: w-[420px], border-r border-neutral-800
Map panel: flex-1
```

### Mobile (< 1024px): Feed-First with Toggle

```
┌────────────────────────┐
│ Mishmarot              │
│ [Dashboard] Timeline   │
├────────────────────────┤
│  [Feed]  [Map]  ← tabs │
├────────────────────────┤
│  12 incidents (7d)     │
│  ↑ 15% vs prior week   │
├────────────────────────┤
│  [Region ▾] 7d 30d All│
├────────────────────────┤
│  ┌──────────────────┐  │
│  │ Incident Card    │  │
│  └──────────────────┘  │
│  ┌──────────────────┐  │
│  │ Incident Card    │  │
│  └──────────────────┘  │
│        ...             │
├────────────────────────┤
│  Sources: ● ADL  ● CST│
└────────────────────────┘

Feed is default tab. Map tab shows full-viewport map.
```

---

## 3. Incident Card

### Collapsed State (single row)

```
┌──────────────────────────────────────────┐
│ 3h ago · Brooklyn, NY · Assault · ●●     │
└──────────────────────────────────────────┘
```

Fields: time ago, location (via formatLocation), incident type label, confidence badge.

Confidence badges:
- `●●` (two filled) = Confirmed (tier 1)
- `●` (one filled) = Verified (tier 2)
- `○` (hollow) = Credible (tier 3, requires visual indicator)

### Expanded State (inline toggle on click)

```
┌──────────────────────────────────────────┐
│ 3h ago · Brooklyn, NY · Assault · ●●     │
│──────────────────────────────────────────│
│ A man was assaulted outside a synagogue  │
│ in Brooklyn after Friday evening         │
│ services.                                │
│                                          │
│ Severity 2 · Setting: Synagogue          │
│ Manifestations: religious, othering      │
│ Explicitness: explicit                   │
│ Source: ADL ↗                            │
└──────────────────────────────────────────┘
```

Fields: summary, severity level + label, manifestations (comma-joined), explicitness, setting, source name + external link.

---

## 4. Trend Indicator

Displayed at the top of the feed panel, above filters.

Format: `{count} incidents past {N} days ({arrow} {percent}% vs prior {N} days)`

Arrow and color:
- `↑ 15%` in `text-red-400` — increase
- `↓ 8%` in `text-emerald-400` — decrease
- `→ 0%` in `text-neutral-400` — no change

States:
- **Loading**: Skeleton bar with animate-pulse
- **Empty**: "No incidents in this period"
- **Data**: Full format as above

---

## 5. Filter Behavior

### Primary Filters (always visible)

| Filter | Control | URL Param | Default |
|--------|---------|-----------|---------|
| Region | Dropdown (country ISO codes) | `region` | All |
| Time range | Button group | `days` | 7 |

### Secondary Filters (behind "More filters" toggle)

| Filter | Control | URL Param | Default |
|--------|---------|-----------|---------|
| Setting | Dropdown | `setting` | All |
| Severity | Dropdown (1-5) | `severity` | All |
| Source | Dropdown | `source` | All |

URL example: `/?region=US&days=7&setting=campus`

Filter changes update URL via `router.push` without full page reload. Server component reads `await searchParams` on initial load and passes to client components.

---

## 6. Map-Feed Linking

Interactions flow bidirectionally through `DashboardContext`:

| Action | Effect |
|--------|--------|
| Click incident card | Sets `selectedIncidentId` → map highlights marker |
| Click map cluster | Filters feed to incidents in that cluster's bounds |
| Hover incident card | (Future) Subtle map marker emphasis |

Shared state via `DashboardContext`:
- `selectedIncidentId: string | null`
- `setSelectedIncidentId: (id: string | null) => void`

Both panels read from and write to this context.

---

## 7. Color System

### Confidence (fill/outline pattern)

| Tier | Badge | Meaning |
|------|-------|---------|
| 1 — Confirmed | `●●` | LE-confirmed, multiple sources |
| 2 — Verified | `●` | Staff-verified, one independent source |
| 3 — Credible | `○` | Single credible report, pending |

### Source Health (status dots)

| Freshness | Color | Tailwind |
|-----------|-------|----------|
| < 1 hour | Green | `bg-emerald-400` |
| < 24 hours | Yellow | `bg-yellow-400` |
| < 7 days | Orange | `bg-orange-400` |
| > 7 days | Red | `bg-red-400` |
| No data | Gray | `bg-neutral-600` |

### Trend Arrow

| Direction | Color | Tailwind |
|-----------|-------|----------|
| Decrease | Emerald | `text-emerald-400` |
| Increase | Red | `text-red-400` |
| Flat | Neutral | `text-neutral-400` |

### Severity (future — card accent, map marker)

| Level | Meaning | Color |
|-------|---------|-------|
| 1 | Extreme violence | `red-500` |
| 2 | Assault | `orange-500` |
| 3 | Targeted damage | `yellow-500` |
| 4 | Direct threat | `blue-500` |
| 5 | Harassment/speech | `neutral-400` |

---

## 8. Data Flow

```
page.tsx (server component)
  │
  ├─ await searchParams → parse filters
  │
  └─ <DashboardLayout filters={filters}>
       │
       ├─ <IncidentFeed filters={filters}>
       │    ├─ fetch("/api/incidents?region=US&days=7")
       │    ├─ subscribe to Supabase Realtime (new inserts)
       │    ├─ <TrendIndicator> → fetch("/api/trends?days=7&region=US")
       │    ├─ <FilterBar> → useRouter + useSearchParams to sync URL
       │    └─ <IncidentCard> × N → click sets selectedIncidentId
       │
       └─ <IncidentMap>
            ├─ reads incidents + selectedIncidentId from context
            └─ highlights selected marker
```

API routes:
- `GET /api/incidents` — uses `getSupabase()` (anon key, RLS filters confidence <= 2), applies `suppressGeography()` and `isWithinTemporalDelay()` server-side
- `GET /api/trends` — uses `getServerSupabase()` (service role), queries incident counts for current and prior period

---

## 9. Privacy Constraints

All privacy enforcement happens **server-side** in API routes. The client never receives suppressed data.

| Constraint | Implementation | User-Facing |
|------------|---------------|-------------|
| Confidence filtering | RLS: anon key only sees confidence <= 2; API adds `.lte("confidence", 2)` as defense-in-depth | Unverified incidents never appear |
| Geographic suppression | `suppressGeography()` on each row: public tier gets 1° grid, locality nulled | Coarse coordinates only |
| Temporal delay | `isWithinTemporalDelay()`: incidents < 72h old get lat/lon/admin1/locality nulled | "Location pending" shown for recent incidents |
| Population threshold | Localities < 20,000 always suppressed for public | No small-town identification |

Realtime edge case: New incidents from Supabase Realtime arrive without server-side privacy processing. The feed shows them immediately with "Location pending" — they are only plotted on the map after the next API fetch confirms geographic data has cleared the delay.

---

## 10. Component Hierarchy

### New Components

| Component | Path | Responsibility |
|-----------|------|---------------|
| `DashboardLayout` | `components/dashboard/dashboard-layout.tsx` | Dual-panel layout, wraps DashboardContext provider |
| `MobileViewToggle` | `components/dashboard/mobile-view-toggle.tsx` | Feed/Map tab toggle, visible < 1024px |
| `IncidentFeed` | `components/feed/incident-feed.tsx` | Fetches incidents, manages Realtime, renders card list |
| `IncidentCard` | `components/feed/incident-card.tsx` | Collapsed/expanded incident display |
| `TrendIndicator` | `components/feed/trend-indicator.tsx` | Fetches and displays trend stats |
| `FilterBar` | `components/filters/filter-bar.tsx` | Region, time, secondary filters; syncs URL |
| `DashboardContext` | `lib/dashboard-context.tsx` | Shared selectedIncidentId state |

### New Utilities

| File | Path | Exports |
|------|------|---------|
| Types | `lib/types.ts` | `IncidentFeedItem`, `FeedFilters`, `TrendData` |
| Formatters | `lib/format.ts` | `formatTimeAgo`, `formatIncidentType`, `formatLocation` |

### Modified Components

| Component | Path | Changes |
|-----------|------|---------|
| `DashboardPage` | `app/(public)/page.tsx` | Server component with searchParams, renders DashboardLayout |
| `IncidentMap` | `components/map/incident-map.tsx` | Remove absolute positioning, accept context, remove Realtime |
| `/api/incidents` | `app/api/incidents/route.ts` | Add privacy filters, narrow select, bbox param |
| `/api/trends` | `app/api/trends/route.ts` | Implement real trend calculation |

### Unchanged Components

| Component | Path | Notes |
|-----------|------|-------|
| `SourceHealthBar` | `components/filters/source-health-bar.tsx` | Renders in footer, no changes needed |
