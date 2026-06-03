import "server-only";
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";
import { isDevAuthBypass } from "@/lib/dev-auth";

/** Returns the signed-in user, or redirects to /login (skipped when local dev bypass is on). */
export async function requireUser(
  supabase: SupabaseClient,
): Promise<User | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) return user;
  if (isDevAuthBypass()) return null;
  redirect("/login");
}
