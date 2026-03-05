import type { SupabaseClient } from "@supabase/supabase-js";

export type PlanType = "free" | "pro";

export type Feature =
  | "unlimited_plans"
  | "recovery_adjustment"
  | "unlimited_history"
  | "advanced_progress"
  | "unlimited_ai"
  | "data_export";

export interface Subscription {
  user_id: string;
  plan_type: PlanType;
  status: string;
  current_period_start: string | null;
  current_period_end: string | null;
}

const PRO_FEATURES: Set<Feature> = new Set([
  "unlimited_plans",
  "recovery_adjustment",
  "unlimited_history",
  "advanced_progress",
  "unlimited_ai",
  "data_export",
]);

export const FREE_DAILY_AI_LIMIT = 5;

function getLocalDateKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export async function getUserSubscription(
  supabase: SupabaseClient,
  userId: string,
): Promise<Subscription> {
  const { data } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (data) return data as Subscription;

  return {
    user_id: userId,
    plan_type: "free",
    status: "active",
    current_period_start: null,
    current_period_end: null,
  };
}

export async function isPro(
  supabase: SupabaseClient,
  userId: string,
): Promise<boolean> {
  const sub = await getUserSubscription(supabase, userId);
  return sub.plan_type === "pro" && sub.status === "active";
}

export async function checkFeatureAccess(
  supabase: SupabaseClient,
  userId: string,
  feature: Feature,
): Promise<boolean> {
  if (!PRO_FEATURES.has(feature)) return true;
  return isPro(supabase, userId);
}

export async function getAiUsageToday(
  supabase: SupabaseClient,
  userId: string,
): Promise<number> {
  const today = getLocalDateKey();
  const { data } = await supabase
    .from("ai_usage")
    .select("count")
    .eq("user_id", userId)
    .eq("date", today)
    .maybeSingle();

  return data?.count ?? 0;
}

export async function incrementAiUsage(
  supabase: SupabaseClient,
  userId: string,
): Promise<{ allowed: boolean; count: number }> {
  const pro = await isPro(supabase, userId);
  const currentCount = await getAiUsageToday(supabase, userId);

  if (!pro && currentCount >= FREE_DAILY_AI_LIMIT) {
    return { allowed: false, count: currentCount };
  }

  const today = getLocalDateKey();
  const newCount = currentCount + 1;

  await supabase.from("ai_usage").upsert(
    { user_id: userId, date: today, count: newCount },
    { onConflict: "user_id,date" },
  );

  return { allowed: true, count: newCount };
}

export async function createFreeSubscription(
  supabase: SupabaseClient,
  userId: string,
): Promise<void> {
  await supabase.from("subscriptions").upsert(
    {
      user_id: userId,
      plan_type: "free",
      status: "active",
      current_period_start: new Date().toISOString(),
      current_period_end: null,
    },
    { onConflict: "user_id" },
  );
}
