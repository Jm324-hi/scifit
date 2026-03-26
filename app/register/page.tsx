"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, UserPlus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { createFreeSubscription } from "@/lib/subscription";

const benefits = [
  "Personalized training plans based on your profile",
  "Recovery-aware workout adjustments",
  "Progressive overload tracking & PR detection",
  "Complete workout logger with rest timer",
];

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function attemptSignUp(): Promise<{
    success: boolean;
    message?: string;
    userId?: string;
  }> {
    const supabase = createClient();

    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("timeout")), 15_000),
    );

    const { data: signUpData, error } = await Promise.race([
      supabase.auth.signUp({ email, password }),
      timeout,
    ]);

    if (error) return { success: false, message: error.message };

    if (signUpData?.user) {
      await Promise.race([
        createFreeSubscription(supabase, signUpData.user.id),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("timeout")), 5_000),
        ),
      ]).catch(() => {});
    }

    return { success: true };
  }

  function isNetworkError(msg?: string): boolean {
    if (!msg) return false;
    const lower = msg.toLowerCase();
    return lower.includes("failed to fetch") || lower.includes("load failed") || lower.includes("network") || lower.includes("timeout");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    const MAX_RETRIES = 2;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        const result = await attemptSignUp();

        if (result.success) {
          router.push("/onboarding");
          return;
        }

        if (!isNetworkError(result.message)) {
          setError(result.message ?? "Registration failed.");
          setLoading(false);
          return;
        }

        if (attempt < MAX_RETRIES - 1) continue;

        setError("Network connection failed. Please check your internet connection and try again.");
        setLoading(false);
        return;
      } catch (err) {
        if (attempt < MAX_RETRIES - 1) continue;

        const msg = err instanceof Error ? err.message : "";
        setError(
          isNetworkError(msg)
            ? "Network connection failed. Please check your internet connection and try again."
            : "Something went wrong. Please try again.",
        );
        setLoading(false);
      }
    }
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="grid w-full max-w-4xl gap-8 lg:grid-cols-2 lg:gap-12">
        {/* Brand side */}
        <div className="hidden flex-col justify-center gap-6 lg:flex">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-primary">
              Kineroz
            </h1>
            <p className="mt-2 text-lg text-muted-foreground">
              Your free, science-backed training assistant. Get started in under
              two minutes.
            </p>
          </div>
          <div className="space-y-3">
            {benefits.map((text) => (
              <div key={text} className="flex items-start gap-3">
                <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                  <Check className="size-3" />
                </div>
                <span className="text-sm text-muted-foreground">{text}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            No credit card required. Free plan includes full workout logging
            and plan generation.
          </p>
        </div>

        {/* Form side */}
        <Card className="w-full">
          <CardHeader>
            <div className="flex items-center gap-2">
              <UserPlus className="size-5 text-primary" />
              <CardTitle className="text-xl">Create Account</CardTitle>
            </div>
            <CardDescription>
              Start your training journey with Kineroz
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="Re-enter your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-9"
                    required
                    minLength={6}
                  />
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-3">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creating account..." : "Start Free"}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-medium text-primary hover:underline"
                >
                  Sign In
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
