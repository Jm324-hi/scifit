"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft } from "lucide-react";
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

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  function isNetworkError(msg?: string): boolean {
    if (!msg) return false;
    const lower = msg.toLowerCase();
    return (
      lower.includes("failed to fetch") ||
      lower.includes("network") ||
      lower.includes("timeout")
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const MAX_RETRIES = 2;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        const supabase = createClient();

        const timeout = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("timeout")), 10_000),
        );

        const siteUrl =
          typeof window !== "undefined" ? window.location.origin : "";

        const { error } = await Promise.race([
          supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${siteUrl}/auth/callback?next=/reset-password`,
          }),
          timeout,
        ]);

        if (error) {
          if (!isNetworkError(error.message)) {
            setError(error.message);
            setLoading(false);
            return;
          }
          if (attempt < MAX_RETRIES - 1) continue;
          setError(
            "Network connection failed. Please check your internet connection and try again.",
          );
          setLoading(false);
          return;
        }

        setSent(true);
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

  if (sent) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Mail className="size-5 text-primary" />
              <CardTitle className="text-xl">Check Your Email</CardTitle>
            </div>
            <CardDescription>
              We sent a password reset link to{" "}
              <span className="font-medium text-foreground">{email}</span>.
              Click the link in the email to reset your password.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex flex-col gap-3">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setSent(false);
                setEmail("");
              }}
            >
              Send again
            </Button>
            <Link
              href="/login"
              className="flex items-center justify-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              <ArrowLeft className="size-3" />
              Back to Sign In
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Mail className="size-5 text-primary" />
            <CardTitle className="text-xl">Forgot Password</CardTitle>
          </div>
          <CardDescription>
            Enter your email address and we&apos;ll send you a link to reset
            your password.
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
          </CardContent>

          <CardFooter className="flex flex-col gap-3">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Sending..." : "Send Reset Link"}
            </Button>
            <Link
              href="/login"
              className="flex items-center justify-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              <ArrowLeft className="size-3" />
              Back to Sign In
            </Link>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
