"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, ArrowLeft } from "lucide-react";
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

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();

      const timeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("timeout")), 10_000),
      );

      const { error } = await Promise.race([
        supabase.auth.updateUser({ password }),
        timeout,
      ]);

      if (error) {
        setError(
          isNetworkError(error.message)
            ? "Network connection failed. Please check your internet connection and try again."
            : error.message,
        );
        setLoading(false);
        return;
      }

      router.push("/dashboard");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      setError(
        isNetworkError(msg)
          ? "Network connection failed. Please check your internet connection and try again."
          : "Something went wrong. Please try again.",
      );
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lock className="size-5 text-primary" />
            <CardTitle className="text-xl">Reset Password</CardTitle>
          </div>
          <CardDescription>Enter your new password below.</CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
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
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="Re-enter your new password"
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
              {loading ? "Updating..." : "Update Password"}
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
