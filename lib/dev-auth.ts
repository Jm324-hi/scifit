import type { User } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { NextRequest } from "next/server";

/**
 * Local-only auth bypass. Requires NODE_ENV=development, DEV_BYPASS_AUTH=true,
 * and request host localhost / 127.0.0.1. Never active in production builds.
 */
export function isDevAuthBypass(request?: NextRequest): boolean {
  if (process.env.NODE_ENV !== "development") return false;
  if (process.env.DEV_BYPASS_AUTH !== "true") return false;

  if (request) {
    const host = (request.headers.get("host") ?? "").split(":")[0];
    if (host !== "localhost" && host !== "127.0.0.1") return false;
  }

  return true;
}

/** Optional: sign in with a dev user from .env.local (create once in Supabase Auth). */
export async function tryDevAutoSignIn(
  supabase: SupabaseClient,
): Promise<User | null> {
  const email = process.env.DEV_EMAIL?.trim();
  const password = process.env.DEV_PASSWORD;
  if (!email || !password) return null;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error("[dev-auth] auto sign-in failed:", error.message);
    return null;
  }

  return data.user;
}
