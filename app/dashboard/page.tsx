import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Dashboard",
};
import {
  Dumbbell,
  Heart,
  TrendingUp,
  Target,
  Calendar,
  Clock,
  Play,
  Layers,
  CalendarDays,
  History,
  ClipboardList,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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

const goalLabels: Record<string, string> = {
  muscle: "Muscle Building",
  strength: "Strength",
  fat_loss: "Fat Loss",
  general: "General Fitness",
};

const equipmentLabels: Record<string, string> = {
  gym: "Gym",
  home: "Home",
  both: "Gym & Home",
};

const experienceLabels: Record<string, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

const splitLabels: Record<string, string> = {
  full_body: "Full Body",
  upper_lower: "Upper / Lower",
  push_pull_legs: "Push / Pull / Legs",
};

function formatDuration(start: string, end: string): string {
  const ms = new Date(end).getTime() - new Date(start).getTime();
  const minutes = Math.round(ms / 60000);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

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

function localDateKey(date = new Date()): string {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, "0");
  const d = `${date.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayISO = today.toISOString();

  const [
    profileRes,
    activePlanRes,
    todaySessionsRes,
    recentSessionsRes,
    progressSessionsRes,
    todayRecoveryLogRes,
    completedPlannedRes,
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase
      .from("plans")
      .select("id, name, split_type, frequency, goal")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .maybeSingle(),
    supabase
      .from("workout_sessions")
      .select(
        "id, started_at, completed_at, status, workout_sets(id, exercise_id, completed)",
      )
      .eq("user_id", user.id)
      .gte("started_at", todayISO)
      .order("started_at", { ascending: false }),
    supabase
      .from("workout_sessions")
      .select(
        "id, started_at, completed_at, workout_sets(id, exercise_id, completed)",
      )
      .eq("user_id", user.id)
      .eq("status", "completed")
      .order("started_at", { ascending: false })
      .limit(3),
    supabase
      .from("workout_sessions")
      .select(
        "id, started_at, workout_sets(exercise_id, weight, reps, completed)",
      )
      .eq("user_id", user.id)
      .eq("status", "completed")
      .order("started_at", { ascending: false }),
    supabase
      .from("recovery_logs")
      .select("sleep, doms, stress, readiness")
      .eq("user_id", user.id)
      .eq("date", localDateKey())
      .maybeSingle(),
    supabase
      .from("workout_sessions")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("status", "completed")
      .not("plan_day_id", "is", null),
  ]);

  const { data: profile } = profileRes;
  if (!profile) redirect("/onboarding");

  const { data: activePlan } = activePlanRes;
  const { data: todaySessions } = todaySessionsRes;
  const { data: recentSessions } = recentSessionsRes;
  const { data: progressSessions } = progressSessionsRes;
  const { data: todayRecoveryLog } = todayRecoveryLogRes;
  const { count: completedPlanned } = completedPlannedRes;

  let nextDayName = "";
  let nextDayFocus = "";
  let nextDayPreview: string[] = [];

  if (activePlan) {
    const { data: planDays } = await supabase
      .from("plan_days")
      .select("id, day_number, name, focus")
      .eq("plan_id", activePlan.id)
      .order("day_number");

    if (planDays && planDays.length > 0) {
      const dayIndex = (completedPlanned ?? 0) % planDays.length;
      const nextDay = planDays[dayIndex];
      nextDayName = nextDay.name;
      nextDayFocus = nextDay.focus;

      const { data: items } = await supabase
        .from("plan_items")
        .select("exercise_id")
        .eq("plan_day_id", nextDay.id)
        .order("order_index")
        .limit(4);

      if (items && items.length > 0) {
        const { data: exNames } = await supabase
          .from("exercises")
          .select("id, name")
          .in(
            "id",
            items.map((i: { exercise_id: string }) => i.exercise_id),
          );

        const nameMap = new Map(
          (exNames ?? []).map((e: { id: string; name: string }) => [
            e.id,
            e.name,
          ]),
        );
        nextDayPreview = items
          .map((i: { exercise_id: string }) =>
            nameMap.get(i.exercise_id) ?? "",
          )
          .filter(Boolean);
      }
    }
  }

  const inProgress = todaySessions?.find((s) => s.status === "in_progress");
  const completedToday = todaySessions?.find(
    (s) => s.status === "completed"
  );

  let todayExerciseCount = 0;
  let todaySetCount = 0;
  if (completedToday) {
    const sets = completedToday.workout_sets ?? [];
    const completedSets = sets.filter(
      (s: { completed: boolean }) => s.completed
    );
    todayExerciseCount = new Set(
      completedSets.map((s: { exercise_id: string }) => s.exercise_id)
    ).size;
    todaySetCount = completedSets.length;
  }

  const recentWorkouts = (recentSessions ?? []).map((s) => {
    const sets = s.workout_sets ?? [];
    const done = sets.filter(
      (ws: { completed: boolean }) => ws.completed
    );
    return {
      id: s.id,
      date: formatDate(s.started_at),
      duration: s.completed_at
        ? formatDuration(s.started_at, s.completed_at)
        : "—",
      exerciseCount: new Set(
        done.map((ws: { exercise_id: string }) => ws.exercise_id)
      ).size,
      setCount: done.length,
    };
  });

  const completedSessions = progressSessions ?? [];
  const exerciseWithData = new Set<string>();
  const weekTrainingSet = new Set<string>();
  const thisWeekKey = weekKey(startOfWeek(new Date()));

  for (const session of completedSessions) {
    const wk = weekKey(startOfWeek(new Date(session.started_at)));
    weekTrainingSet.add(wk);
    for (const set of session.workout_sets ?? []) {
      if (!set.completed || set.weight == null || set.reps == null) continue;
      exerciseWithData.add(set.exercise_id);
    }
  }

  const totalPRCount = exerciseWithData.size * 2;
  const thisWeekWorkouts = completedSessions.filter(
    (session) => weekKey(startOfWeek(new Date(session.started_at))) === thisWeekKey,
  ).length;

  let consecutiveTrainingWeeks = 0;
  const cursor = startOfWeek(new Date());
  for (let i = 0; i < 52; i += 1) {
    const key = weekKey(cursor);
    if (!weekTrainingSet.has(key)) break;
    consecutiveTrainingWeeks += 1;
    cursor.setDate(cursor.getDate() - 7);
  }

  const readinessInfo = todayRecoveryLog
    ? getReadinessLevel(todayRecoveryLog.readiness)
    : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <Badge variant="secondary">
          {goalLabels[profile.goal] ?? profile.goal}
        </Badge>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Today's Workout */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Dumbbell className="size-5 text-muted-foreground" />
              Today&apos;s Workout
            </CardTitle>
            <CardDescription>
              {goalLabels[profile.goal] ?? profile.goal} &middot;{" "}
              {profile.frequency}x / week
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4 py-6 text-center">
            {inProgress ? (
              <>
                <Badge variant="secondary" className="gap-1">
                  <Clock className="size-3" />
                  In Progress
                </Badge>
                <p className="text-sm text-muted-foreground">
                  You have an active workout session.
                </p>
                <Button asChild size="sm">
                  <Link href="/workout">
                    <Play className="size-4" />
                    Continue Workout
                  </Link>
                </Button>
              </>
            ) : completedToday ? (
              <>
                <Badge
                  variant="default"
                  className="gap-1 bg-green-600 text-white"
                >
                  Completed
                </Badge>
                <div className="flex flex-wrap justify-center gap-2">
                  <Badge variant="outline" className="gap-1">
                    <Dumbbell className="size-3" />
                    {todayExerciseCount} exercise
                    {todayExerciseCount !== 1 ? "s" : ""}
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    <Layers className="size-3" />
                    {todaySetCount} set{todaySetCount !== 1 ? "s" : ""}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Great work today!
                </p>
              </>
            ) : activePlan && nextDayName ? (
              <>
                <div className="w-full space-y-1.5 text-left">
                  <p className="text-sm font-semibold">{nextDayName}</p>
                  <p className="text-xs text-muted-foreground">
                    {nextDayFocus}
                  </p>
                  {nextDayPreview.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {nextDayPreview.map((name) => (
                        <Badge
                          key={name}
                          variant="outline"
                          className="text-[11px]"
                        >
                          {name}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <Button asChild size="sm">
                  <Link href="/workout">
                    <Play className="size-4" />
                    Start Today&apos;s Workout
                  </Link>
                </Button>
              </>
            ) : (
              <>
                <div className="flex flex-wrap justify-center gap-2">
                  <Badge variant="outline" className="gap-1">
                    <Target className="size-3" />
                    {goalLabels[profile.goal] ?? profile.goal}
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    <Calendar className="size-3" />
                    {profile.frequency} days / week
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    <Clock className="size-3" />
                    {profile.available_time} min
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  No workout yet today
                </p>
                <Button asChild variant="outline" size="sm">
                  <Link href="/workout">
                    <Play className="size-4" />
                    Start Workout
                  </Link>
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Your Plan */}
        {activePlan && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="size-5 text-muted-foreground" />
                Your Plan
              </CardTitle>
              <CardDescription>
                {splitLabels[activePlan.split_type] ?? activePlan.split_type}{" "}
                &middot; {activePlan.frequency}x / week
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4 py-6 text-center">
              <p className="text-lg font-semibold">{activePlan.name}</p>
              <div className="flex flex-wrap justify-center gap-2">
                <Badge variant="secondary">
                  {goalLabels[activePlan.goal] ?? activePlan.goal}
                </Badge>
                <Badge variant="outline">
                  {activePlan.frequency}x / week
                </Badge>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href="/plan">View Plan</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Recovery Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="size-5 text-muted-foreground" />
              Recovery Status
            </CardTitle>
            <CardDescription>How ready are you today?</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4 py-6 text-center">
            {todayRecoveryLog && readinessInfo ? (
              <>
                <p
                  className={`text-4xl font-bold ${
                    readinessInfo.color === "green"
                      ? "text-green-600"
                      : readinessInfo.color === "blue"
                        ? "text-blue-600"
                        : readinessInfo.color === "yellow"
                          ? "text-yellow-600"
                          : "text-red-600"
                  }`}
                >
                  {todayRecoveryLog.readiness}
                </p>
                <Badge
                  variant="outline"
                  className={`${
                    readinessInfo.color === "green"
                      ? "text-green-600"
                      : readinessInfo.color === "blue"
                        ? "text-blue-600"
                        : readinessInfo.color === "yellow"
                          ? "text-yellow-600"
                          : "text-red-600"
                  }`}
                >
                  {readinessInfo.label}
                </Badge>
                <p className="text-xs text-muted-foreground">
                  Sleep {todayRecoveryLog.sleep}h · DOMS {todayRecoveryLog.doms}/10 ·
                  Stress {todayRecoveryLog.stress}/10
                </p>
                <Button asChild variant="outline" size="sm">
                  <Link href="/recovery">Update Recovery</Link>
                </Button>
              </>
            ) : (
              <>
                <Heart className="size-10 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">
                  No recovery data logged today
                </p>
                <Button asChild variant="outline" size="sm">
                  <Link href="/recovery">Log your recovery</Link>
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Progress Summary */}
        <Link href="/progress" className="block">
          <Card className="h-full transition-colors hover:bg-muted/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="size-5 text-muted-foreground" />
                Progress Summary
              </CardTitle>
              <CardDescription>
                {experienceLabels[profile.experience] ?? profile.experience}{" "}
                &middot;{" "}
                {equipmentLabels[profile.equipment] ?? profile.equipment}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4 py-6 text-center">
              <div className="grid w-full gap-2 text-left sm:grid-cols-3">
                <div className="rounded-md border bg-muted/20 p-3">
                  <p className="text-xs text-muted-foreground">Total PRs</p>
                  <p className="text-lg font-semibold">{totalPRCount}</p>
                </div>
                <div className="rounded-md border bg-muted/20 p-3">
                  <p className="text-xs text-muted-foreground">This Week</p>
                  <p className="text-lg font-semibold">
                    {thisWeekWorkouts} workouts
                  </p>
                </div>
                <div className="rounded-md border bg-muted/20 p-3">
                  <p className="text-xs text-muted-foreground">Streak</p>
                  <p className="text-lg font-semibold">
                    {consecutiveTrainingWeeks} week
                    {consecutiveTrainingWeeks !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              <Badge variant="outline">Open Progress</Badge>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Workouts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="size-5 text-muted-foreground" />
            Recent Workouts
          </CardTitle>
          <CardDescription>Your last few training sessions</CardDescription>
        </CardHeader>
        <CardContent>
          {recentWorkouts.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <Dumbbell className="size-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">
                No completed workouts yet. Start training to see your history
                here.
              </p>
              <Button asChild variant="outline" size="sm">
                <Link href="/workout">Start Workout</Link>
              </Button>
            </div>
          ) : (
            <div className="divide-y">
              {recentWorkouts.map((w) => (
                <div
                  key={w.id}
                  className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
                >
                  <div className="flex items-center gap-3">
                    <CalendarDays className="size-4 shrink-0 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{w.date}</p>
                      <p className="text-xs text-muted-foreground">
                        {w.duration} &middot; {w.exerciseCount} exercise
                        {w.exerciseCount !== 1 ? "s" : ""} &middot;{" "}
                        {w.setCount} set{w.setCount !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                  <Button asChild variant="ghost" size="sm">
                    <Link href="/history">View</Link>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
