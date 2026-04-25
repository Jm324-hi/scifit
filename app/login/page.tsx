"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Mail,
  Lock,
  TrendingUp,
  Heart,
  Brain,
  Dumbbell,
} from "lucide-react";
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
import { signInAction } from "@/app/auth/actions";
import {
  callAction,
  isNetworkError,
  NETWORK_ERROR_MESSAGE,
} from "@/lib/call-action";

const highlights = [
  { icon: TrendingUp, text: "Progressive overload tracking" },
  { icon: Heart, text: "Recovery-driven training adjustments" },
  { icon: Brain, text: "AI-powered plan generation" },
  { icon: Dumbbell, text: "Complete workout logger" },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await callAction(() => signInAction(email, password));

      if (result.ok) {
        router.push("/dashboard");
        router.refresh();
        return;
      }

      setError(result.error);
      setLoading(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      setError(isNetworkError(msg) ? NETWORK_ERROR_MESSAGE : "Something went wrong. Please try again.");
      setLoading(false);
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
              Science-based smart training — plan, track, recover, and progress.
            </p>
          </div>
          <div className="space-y-3">
            {highlights.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <Icon className="size-4" />
                </div>
                <span className="text-sm text-muted-foreground">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Form side */}
        <Card className="w-full">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Mail className="size-5 text-primary" />
              <CardTitle className="text-xl">Sign In</CardTitle>
            </div>
            <CardDescription>
              Sign in to your Kineroz account
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
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9"
                    required
                  />
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-3">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </Button>
              <Link
                href="/forgot-password"
                className="text-center text-sm font-medium text-primary hover:underline"
              >
                Forgot password?
              </Link>
              <p className="text-center text-sm text-muted-foreground">
                Don&apos;t have an account?{" "}
                <Link
                  href="/register"
                  className="font-medium text-primary hover:underline"
                >
                  Sign Up
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
