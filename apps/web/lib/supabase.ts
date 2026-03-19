import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Supabase client for browser use.
 * Uses the anon key — all queries are filtered by RLS policies.
 * Public users see only confirmed/verified incidents with 72-hour delay.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Subscribe to real-time incident inserts.
 * Only fires for incidents that pass the user's RLS policy.
 */
export function subscribeToIncidents(
  onInsert: (incident: Record<string, unknown>) => void
) {
  return supabase
    .channel("live-incidents")
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "incidents",
        filter: "confidence=lte.2",
      },
      (payload) => {
        onInsert(payload.new);
      }
    )
    .subscribe();
}
