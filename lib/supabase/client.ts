import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser Supabase client.
 *
 * Requests are routed through the same-origin `/api/sb/*` proxy
 * (see `app/api/sb/[...path]/route.ts`) so the browser never
 * connects directly to `*.supabase.co`. This makes the app work
 * from networks that can't reach Supabase reliably (e.g. mainland
 * China without a VPN), while server-side code keeps using the
 * direct URL via `lib/supabase/server.ts` for full speed.
 */
export function createClient() {
  const fallback = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const url =
    typeof window !== "undefined" ? `${window.location.origin}/api/sb` : fallback;

  return createBrowserClient(
    url,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
