import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Progress",
};
import { Trophy, TrendingUp, Calendar, Dumbbell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { isPro as checkIsPro } from "@/lib/subscription";
import { ProGate } from "@/components/Paywall";

interface SessionSet {
  exercise_id: string;
  weight: number | null;
  reps: number | null;
  completed: boolean;
  exercises: {
    name: string;
    movement_pattern: string;
    primary_muscle: string;
  } | null;
}

interface SessionData {
  id: string;
  started_at: string;
  workout_sets: SessionSet[];
}

interface ExercisePR {
  exerciseId: string;
  name: string;
  pattern: string;
  weightPR: { weight: number; reps: number; date: string };
  volumePR: { value: number; weight: number; reps: number; date: string };
}

const PATTERN_ORDER = ["push", "pull", "squat", "hinge", "core", "carry"];

function startOfWeek(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

function weekKey(date: Date): string {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, "0");
  const d = `${date.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatShortDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function formatPattern(pattern: string): string {
  return pattern.charAt(0).toUpperCase() + pattern.slice(1);
}

export default async function ProgressPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const userIsPro = await checkIsPro(supabase, user.id);

  const { data } = await supabase
    .from("workout_sessions")
    .select(
      "id, started_at, workout_sets(exercise_id, weight, reps, completed, exercises(name, movement_pattern, primary_muscle))",
    )
    .eq("user_id", user.id)
    .eq("status", "completed")
    .order("started_at", { ascending: false });

  const sessions = ((data as SessionData[] | null) ?? []).filter(
    (session) => session.workout_sets?.length > 0,
  );

  const prMap = new Map<string, ExercisePR>();
  for (const session of sessions) {
    for (const set of session.workout_sets ?? []) {
      if (!set.completed || set.weight == null || set.reps == null) continue;
      const exName = set.exercises?.name ?? "Unknown";
      const pattern = set.exercises?.movement_pattern ?? "other";
      const volume = set.weight * set.reps;

      const existing = prMap.get(set.exercise_id);
      if (!existing) {
        prMap.set(set.exercise_id, {
          exerciseId: set.exercise_id,
          name: exName,
          pattern,
          weightPR: {
            weight: set.weight,
            reps: set.reps,
            date: session.started_at,
          },
          volumePR: {
            value: volume,
            weight: set.weight,
            reps: set.reps,
            date: session.started_at,
          },
        });
        continue;
      }

      if (
        set.weight > existing.weightPR.weight ||
        (set.weight === existing.weightPR.weight && set.reps > existing.weightPR.reps)
      ) {
        existing.weightPR = {
          weight: set.weight,
          reps: set.reps,
          date: session.started_at,
        };
      }

      if (
        volume > existing.volumePR.value ||
        (volume === existing.volumePR.value && set.weight > existing.volumePR.weight)
      ) {
        existing.volumePR = {
          value: volume,
          weight: set.weight,
          reps: set.reps,
          date: session.started_at,
        };
      }
    }
  }

  const prByPattern = new Map<string, ExercisePR[]>();
  for (const pr of prMap.values()) {
    if (!prByPattern.has(pr.pattern)) prByPattern.set(pr.pattern, []);
    prByPattern.get(pr.pattern)!.push(pr);
  }
  for (const [pattern, list] of prByPattern.entries()) {
    prByPattern.set(
      pattern,
      list.sort((a, b) => a.name.localeCompare(b.name)),
    );
  }

  const thisWeekStart = startOfWeek(new Date());
  const thisWeekKey = weekKey(thisWeekStart);
  const weekStarts: Date[] = [];
  for (let i = 3; i >= 0; i -= 1) {
    const d = new Date(thisWeekStart);
    d.setDate(thisWeekStart.getDate() - i * 7);
    weekStarts.push(d);
  }
  const weekKeys = weekStarts.map(weekKey);
  const weekRangeStart = weekStarts[0];

  const frequencyByWeek: Record<string, number> = {};
  const setsByWeek: Record<string, number> = {};
  const musclesThisWeek: Record<string, number> = {};
  for (const key of weekKeys) {
    frequencyByWeek[key] = 0;
    setsByWeek[key] = 0;
  }

  for (const session of sessions) {
    const started = new Date(session.started_at);
    if (started < weekRangeStart) continue;
    const wk = weekKey(startOfWeek(started));
    if (!(wk in frequencyByWeek)) continue;
    frequencyByWeek[wk] += 1;
    for (const set of session.workout_sets ?? []) {
      if (!set.completed) continue;
      setsByWeek[wk] += 1;
      if (wk === thisWeekKey) {
        const muscle = set.exercises?.primary_muscle ?? "other";
        musclesThisWeek[muscle] = (musclesThisWeek[muscle] ?? 0) + 1;
      }
    }
  }

  const thisWeekWorkouts = frequencyByWeek[thisWeekKey] ?? 0;
  const thisWeekSets = setsByWeek[thisWeekKey] ?? 0;
  const maxMuscleSets = Math.max(...Object.values(musclesThisWeek), 1);
  const maxTrendFreq = Math.max(...Object.values(frequencyByWeek), 1);
  const maxTrendSets = Math.max(...Object.values(setsByWeek), 1);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Training Progress</h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="size-5 text-muted-foreground" />
            PR Board
          </CardTitle>
          <CardDescription>
            Personal bests grouped by movement pattern
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {prMap.size === 0 ? (
            <p className="text-sm text-muted-foreground">
              Complete workouts to unlock your PR board.
            </p>
          ) : (
            PATTERN_ORDER.filter((pattern) => prByPattern.has(pattern)).map((pattern) => (
              <div key={pattern} className="space-y-2">
                <p className="text-sm font-semibold">{formatPattern(pattern)}</p>
                <div className="space-y-2">
                  {(prByPattern.get(pattern) ?? []).map((pr) => (
                    <div
                      key={pr.exerciseId}
                      className="rounded-md border bg-muted/20 p-3"
                    >
                      <p className="text-sm font-medium">{pr.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Best Weight: {pr.weightPR.weight}kg x {pr.weightPR.reps} (
                        {formatShortDate(pr.weightPR.date)})
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Best Volume: {pr.volumePR.weight}kg x {pr.volumePR.reps} ={" "}
                        {Math.round(pr.volumePR.value)} (
                        {formatShortDate(pr.volumePR.date)})
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <ProGate locked={!userIsPro} feature="advanced_progress">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="size-5 text-muted-foreground" />
              Weekly Stats
            </CardTitle>
            <CardDescription>This week at a glance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{thisWeekWorkouts} workouts</Badge>
              <Badge variant="outline">{thisWeekSets} total sets</Badge>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Sets by muscle group</p>
              {Object.keys(musclesThisWeek).length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No completed sets logged this week.
                </p>
              ) : (
                Object.entries(musclesThisWeek)
                  .sort((a, b) => b[1] - a[1])
                  .map(([muscle, count]) => (
                    <div key={muscle} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="capitalize">{muscle}</span>
                        <span>{count} sets</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted">
                        <div
                          className="h-2 rounded-full bg-primary"
                          style={{
                            width: `${Math.max((count / maxMuscleSets) * 100, 8)}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))
              )}
            </div>
          </CardContent>
        </Card>
      </ProGate>

      <ProGate locked={!userIsPro} feature="advanced_progress">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="size-5 text-muted-foreground" />
              Trend (Last 4 Weeks)
            </CardTitle>
            <CardDescription>Frequency and training volume trend</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <p className="text-sm font-medium">Weekly frequency</p>
              {weekStarts.map((start) => {
                const key = weekKey(start);
                const count = frequencyByWeek[key] ?? 0;
                return (
                  <div key={`${key}-freq`} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span>{formatShortDate(start.toISOString())}</span>
                      <span>{count} workouts</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted">
                      <div
                        className="h-2 rounded-full bg-blue-500"
                        style={{
                          width: `${Math.max((count / maxTrendFreq) * 100, 6)}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Weekly total sets</p>
              {weekStarts.map((start) => {
                const key = weekKey(start);
                const count = setsByWeek[key] ?? 0;
                return (
                  <div key={`${key}-sets`} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span>{formatShortDate(start.toISOString())}</span>
                      <span>{count} sets</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted">
                      <div
                        className="h-2 rounded-full bg-emerald-500"
                        style={{
                          width: `${Math.max((count / maxTrendSets) * 100, 6)}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Dumbbell className="size-3.5" />
              Keep consistency high to extend your progress trend.
            </div>
          </CardContent>
        </Card>
      </ProGate>
    </div>
  );
}
