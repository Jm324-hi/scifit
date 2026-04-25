"use server";

import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { createFreeSubscription } from "@/lib/subscription";

export type AuthResult = { ok: true } | { ok: false; error: string };

function mapAuthError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("invalid login credentials")) return "Email or password is incorrect.";
  if (lower.includes("email not confirmed")) return "Please confirm your email before signing in.";
  if (lower.includes("user already registered")) return "An account with this email already exists.";
  if (lower.includes("password should be at least")) return "Password is too short.";
  return message;
}

async function getOrigin(): Promise<string> {
  const envOrigin = process.env.NEXT_PUBLIC_SITE_URL;
  if (envOrigin) return envOrigin.replace(/\/$/, "");
  const h = await headers();
  const host = h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

export async function signInAction(
  email: string,
  password: string,
): Promise<AuthResult> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { ok: false, error: mapAuthError(error.message) };
  return { ok: true };
}

export async function signUpAction(
  email: string,
  password: string,
): Promise<AuthResult> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) return { ok: false, error: mapAuthError(error.message) };

  if (data.user) {
    try {
      await createFreeSubscription(supabase, data.user.id);
    } catch {
      // Non-fatal: subscription row will be created lazily on first read
    }
  }

  return { ok: true };
}

export async function forgotPasswordAction(email: string): Promise<AuthResult> {
  const supabase = await createClient();
  const origin = await getOrigin();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/reset-password`,
  });

  if (error) return { ok: false, error: mapAuthError(error.message) };
  return { ok: true };
}

export async function resetPasswordAction(password: string): Promise<AuthResult> {
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { ok: false, error: mapAuthError(error.message) };
  return { ok: true };
}
