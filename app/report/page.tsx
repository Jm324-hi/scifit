import type { Metadata } from "next";
import { redirect } from "next/navigation";
import {
  BarChart3,
  Trophy,
  Heart,
  TrendingUp,
  Calendar,
  Dumbbell,
  Lightbulb,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { getReadinessLevel } from "@/lib/recovery-engine";

export const metadata: Metadata = {
  title: "Weekly Report",
};

interface SessionSet {
  exercise_id: string;
  weight: number | null;
  reps: number | null;
  completed: boolean;
  exercises: { name: string } | null;
}

interface Session {
  id: string;
  started_at: string;
  completed_at: string | null;
  workout_sets: SessionSet[];
}

interface RecoveryLog {
  date: string;
  sleep: number;
  doms: number;
  stress: number;
  readiness: number;
}

function startOfWeek(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export default async function WeeklyReportPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const now = new Date();
  const weekStart = startOfWeek(now);
  const lastWeekStart = new Date(weekStart);
  lastWeekStart.setDate(lastWeekStart.getDate() - 7);

  const [sessionsRes, lastWeekSessionsRes, recoveryRes, prSessionsRes] =
    await Promise.all([
      supabase
        .from("workout_sessions")
        .select(
          "id, started_at, completed_at, workout_sets(exercise_id, weight, reps, completed, exercises(name))",
        )
        .eq("user_id", user.id)
        .eq("status", "completed")
        .gte("started_at", weekStart.toISOString())
        .order("started_at", { ascending: false }),
      supabase
        .from("workout_sessions")
        .select("id, started_at, completed_at, workout_sets(completed)")
        .eq("user_id", user.id)
        .eq("status", "completed")
        .gte("started_at", lastWeekStart.toISOString())
        .lt("started_at", weekStart.toISOString()),
      supabase
        .from("recovery_logs")
        .select("date, sleep, doms, stress, readiness")
        .eq("user_id", user.id)
        .gte("date", weekStart.toISOString().split("T")[0])
        .order("date", { ascending: false }),
      supabase
        .from("workout_sessions")
        .select(
          "id, started_at, workout_sets(exercise_id, weight, reps, completed, exercises(name))",
        )
        .eq("user_id", user.id)
        .eq("status", "completed")
        .order("started_at", { ascending: false })
        .limit(50),
    ]);

  const sessions = (sessionsRes.data ?? []) as unknown as Session[];
  const lastWeekSessions = lastWeekSessionsRes.data ?? [];
  const recoveryLogs = (recoveryRes.data ?? []) as RecoveryLog[];
  const allSessions = (prSessionsRes.data ?? []) as unknown as Session[];

  const thisWeekWorkouts = sessions.length;
  const lastWeekWorkouts = lastWeekSessions.length;

  let thisWeekSets = 0;
  let lastWeekSets = 0;
  const muscleVolume: Record<string, number> = {};

  for (const session of sessions) {
    for (const set of session.workout_sets ?? []) {
      if (!set.completed) continue;
      thisWeekSets++;
      const name = set.exercises?.name ?? "Unknown";
      muscleVolume[name] = (muscleVolume[name] ?? 0) + 1;
    }
  }

  for (const session of lastWeekSessions) {
    for (const set of (session as { workout_sets: { completed: boolean }[] }).workout_sets ?? []) {
      if (set.completed) lastWeekSets++;
    }
  }

  const prMap = new Map<
    string,
    { name: string; weight: number; reps: number; date: string }
  >();
  const oldPrMap = new Map<
    string,
    { weight: number; reps: number }
  >();

  for (const session of allSessions) {
    const isThisWeek = new Date(session.started_at) >= weekStart;
    for (const set of session.workout_sets ?? []) {
      if (!set.completed || set.weight == null || set.reps == null) continue;
      const existing = prMap.get(set.exercise_id);
      if (
        !existing ||
        set.weight > existing.weight ||
        (set.weight === existing.weight && set.reps > existing.reps)
      ) {
        if (!isThisWeek && !oldPrMap.has(set.exercise_id)) {
          if (existing) {
            oldPrMap.set(set.exercise_id, {
              weight: existing.weight,
              reps: existing.reps,
            });
          }
        }
        prMap.set(set.exercise_id, {
          name: set.exercises?.name ?? "Unknown",
          weight: set.weight,
          reps: set.reps,
          date: session.started_at,
        });
      }
    }
  }

  const newPRs: { name: string; weight: number; reps: number }[] = [];
  for (const [eid, pr] of prMap) {
    if (new Date(pr.date) >= weekStart) {
      newPRs.push({ name: pr.name, weight: pr.weight, reps: pr.reps });
    }
  }

  const avgReadiness =
    recoveryLogs.length > 0
      ? Math.round(
          recoveryLogs.reduce((sum, r) => sum + r.readiness, 0) /
            recoveryLogs.length,
        )
      : null;
  const avgSleep =
    recoveryLogs.length > 0
      ? (
          recoveryLogs.reduce((sum, r) => sum + r.sleep, 0) /
          recoveryLogs.length
        ).toFixed(1)
      : null;

  const readinessLevel = avgReadiness
    ? getReadinessLevel(avgReadiness)
    : null;

  const freqDelta = thisWeekWorkouts - lastWeekWorkouts;
  const setsDelta = thisWeekSets - lastWeekSets;

  const suggestions: string[] = [];
  if (thisWeekWorkouts < 3) {
    suggestions.push(
      "Try to hit at least 3 sessions next week for consistent progress.",
    );
  }
  if (avgReadiness != null && avgReadiness < 60) {
    suggestions.push(
      "Your average readiness was low — prioritize sleep and stress management.",
    );
  }
  if (newPRs.length > 0) {
    suggestions.push(
      "Great PRs this week! Consider a slight deload next week to consolidate gains.",
    );
  }
  if (suggestions.length === 0) {
    suggestions.push(
      "Keep up the consistency. Aim to slightly increase volume or intensity next week.",
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Weekly Report</h1>
        <Badge variant="secondary">
          Week of {formatDate(weekStart.toISOString())}
        </Badge>
      </div>

      {/* Completion & Volume */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Calendar className="size-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Workouts</p>
                <p className="text-2xl font-bold">{thisWeekWorkouts}</p>
                {freqDelta !== 0 && (
                  <p
                    className={`text-xs ${freqDelta > 0 ? "text-green-600" : "text-red-500"}`}
                  >
                    {freqDelta > 0 ? "+" : ""}
                    {freqDelta} vs last week
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Dumbbell className="size-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Total Sets</p>
                <p className="text-2xl font-bold">{thisWeekSets}</p>
                {setsDelta !== 0 && (
                  <p
                    className={`text-xs ${setsDelta > 0 ? "text-green-600" : "text-red-500"}`}
                  >
                    {setsDelta > 0 ? "+" : ""}
                    {setsDelta} vs last week
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Trophy className="size-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">New PRs</p>
                <p className="text-2xl font-bold">{newPRs.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Heart className="size-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Avg Readiness</p>
                <p className="text-2xl font-bold">
                  {avgReadiness ?? "—"}
                </p>
                {readinessLevel && (
                  <p className="text-xs text-muted-foreground">
                    {readinessLevel.label}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* PR Highlights */}
      {newPRs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="size-5 text-muted-foreground" />
              PR Highlights
            </CardTitle>
            <CardDescription>New personal records this week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {newPRs.map((pr) => (
                <div
                  key={pr.name}
                  className="flex items-center justify-between rounded-md border bg-primary/5 p-3"
                >
                  <span className="font-medium">{pr.name}</span>
                  <Badge variant="secondary">
                    {pr.weight}kg x {pr.reps}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recovery Summary */}
      {recoveryLogs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="size-5 text-muted-foreground" />
              Recovery Summary
            </CardTitle>
            <CardDescription>
              Average sleep: {avgSleep}h · {recoveryLogs.length} check-in
              {recoveryLogs.length !== 1 ? "s" : ""} logged
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recoveryLogs.map((log) => {
                const level = getReadinessLevel(log.readiness);
                return (
                  <div
                    key={log.date}
                    className="flex items-center justify-between rounded-md border p-3"
                  >
                    <span className="text-sm">{formatDate(log.date)}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm tabular-nums">
                        {log.readiness}
                      </span>
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          level.color === "green"
                            ? "text-green-600"
                            : level.color === "blue"
                              ? "text-blue-600"
                              : level.color === "yellow"
                                ? "text-yellow-600"
                                : "text-red-600"
                        }`}
                      >
                        {level.label}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Volume by Exercise */}
      {Object.keys(muscleVolume).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="size-5 text-muted-foreground" />
              Volume by Exercise
            </CardTitle>
            <CardDescription>
              Completed sets per exercise this week
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(muscleVolume)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 10)
                .map(([name, count]) => {
                  const maxSets = Math.max(
                    ...Object.values(muscleVolume),
                    1,
                  );
                  return (
                    <div key={name} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span>{name}</span>
                        <span className="text-muted-foreground">
                          {count} sets
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-muted">
                        <div
                          className="h-2 rounded-full bg-primary"
                          style={{
                            width: `${Math.max((count / maxSets) * 100, 8)}%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Next Week Suggestions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="size-5 text-muted-foreground" />
            Next Week
          </CardTitle>
          <CardDescription>
            Suggestions based on this week&apos;s data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {suggestions.map((s) => (
              <p key={s} className="text-sm text-muted-foreground">
                • {s}
              </p>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
