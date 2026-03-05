"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Activity, Heart, Loader2, Moon, Sparkles, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import {
  adjustWorkoutForReadiness,
  calculateReadiness,
  getReadinessLevel,
} from "@/lib/recovery-engine";
import { isPro as checkIsPro } from "@/lib/subscription";
import { Paywall } from "@/components/Paywall";
import { AiCoachDialog } from "@/components/AiCoachDialog";
import { recoveryLogSchema } from "@/lib/validations";

interface PlanPreviewItem {
  id: string;
  exercise_id: string;
  exercise_name: string;
  order_index: number;
  sets: number;
  rep_range_min: number;
  rep_range_max: number;
  target_rpe: number;
  notes: string | null;
  load_adjustment_pct?: number;
}

interface RecoveryLog {
  sleep: number;
  doms: number;
  stress: number;
  readiness: number;
  notes: string | null;
}

function getLocalDateKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getColorClass(color: "green" | "blue" | "yellow" | "red"): string {
  if (color === "green") return "text-green-600";
  if (color === "blue") return "text-blue-600";
  if (color === "yellow") return "text-yellow-600";
  return "text-red-600";
}

function getStrokeClass(color: "green" | "blue" | "yellow" | "red"): string {
  if (color === "green") return "stroke-green-600";
  if (color === "blue") return "stroke-blue-600";
  if (color === "yellow") return "stroke-yellow-500";
  return "stroke-red-600";
}

function getRecoveryTips(level: "optimal" | "normal" | "reduced" | "rest"): string[] {
  if (level === "optimal") {
    return [
      "Keep hydration high before and during training.",
      "Use a full warm-up and push quality work sets.",
      "Aim for another 7-9 hours of sleep tonight.",
    ];
  }
  if (level === "normal") {
    return [
      "Train as planned and keep rest intervals consistent.",
      "Do 5-10 minutes of mobility after training.",
      "Prioritize protein and fluids across the day.",
    ];
  }
  if (level === "reduced") {
    return [
      "Reduce total training volume and keep reps clean.",
      "Add light stretching or easy walking post-workout.",
      "Get to bed earlier and avoid late caffeine.",
    ];
  }
  return [
    "Choose active recovery: light cardio, mobility, or walking.",
    "Skip hard sets and focus on tissue quality.",
    "Increase hydration and target 8+ hours of sleep tonight.",
  ];
}

function ReadinessGauge({
  score,
  color,
}: {
  score: number;
  color: "green" | "blue" | "yellow" | "red";
}) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const dash = (score / 100) * circumference;

  return (
    <div className="relative flex size-40 items-center justify-center">
      <svg viewBox="0 0 140 140" className="size-40 -rotate-90">
        <circle
          cx="70"
          cy="70"
          r={radius}
          strokeWidth="10"
          className="stroke-muted"
          fill="none"
        />
        <circle
          cx="70"
          cy="70"
          r={radius}
          strokeWidth="10"
          strokeDasharray={`${dash} ${circumference}`}
          strokeLinecap="round"
          className={getStrokeClass(color)}
          fill="none"
        />
      </svg>
      <p className={`absolute text-4xl font-bold tabular-nums ${getColorClass(color)}`}>
        {score}
      </p>
    </div>
  );
}

export default function RecoveryPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveState, setSaveState] = useState<string>("");

  const [userId, setUserId] = useState<string | null>(null);
  const [sleep, setSleep] = useState(7);
  const [doms, setDoms] = useState([3]);
  const [stress, setStress] = useState([3]);
  const [existingNotes, setExistingNotes] = useState<string | null>(null);
  const [hadWorkoutYesterday, setHadWorkoutYesterday] = useState(false);
  const [planItems, setPlanItems] = useState<PlanPreviewItem[]>([]);
  const [userIsPro, setUserIsPro] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [hasSavedToday, setHasSavedToday] = useState(false);
  const [lastWorkoutSummary, setLastWorkoutSummary] = useState<{
    date: string;
    exercises: { name: string; topWeight: number | null; totalSets: number; avgRpe: number | null }[];
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function init() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user || cancelled) {
        setLoading(false);
        return;
      }
      setUserId(user.id);

      const proStatus = await checkIsPro(supabase, user.id);
      if (!cancelled) setUserIsPro(proStatus);

      const todayKey = getLocalDateKey();
      const { data: todayLog } = await supabase
        .from("recovery_logs")
        .select("sleep, doms, stress, readiness, notes")
        .eq("user_id", user.id)
        .eq("date", todayKey)
        .maybeSingle<RecoveryLog>();

      if (todayLog && !cancelled) {
        setSleep(todayLog.sleep);
        setDoms([todayLog.doms]);
        setStress([todayLog.stress]);
        setExistingNotes(todayLog.notes);
        setHasSavedToday(true);
      }

      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const yesterdayStart = new Date(todayStart);
      yesterdayStart.setDate(todayStart.getDate() - 1);

      const { data: yesterdaySessions } = await supabase
        .from("workout_sessions")
        .select("id")
        .eq("user_id", user.id)
        .eq("status", "completed")
        .gte("started_at", yesterdayStart.toISOString())
        .lt("started_at", todayStart.toISOString())
        .limit(1);

      if (!cancelled) setHadWorkoutYesterday((yesterdaySessions ?? []).length > 0);

      const { data: activePlan } = await supabase
        .from("plans")
        .select("id")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .maybeSingle();

      if (activePlan) {
        const { data: planDays } = await supabase
          .from("plan_days")
          .select("id, day_number")
          .eq("plan_id", activePlan.id)
          .order("day_number");

        if (planDays && planDays.length > 0) {
          const { count: completedPlanned } = await supabase
            .from("workout_sessions")
            .select("*", { count: "exact", head: true })
            .eq("user_id", user.id)
            .eq("status", "completed")
            .not("plan_day_id", "is", null);

          const dayIndex = (completedPlanned ?? 0) % planDays.length;
          const nextDay = planDays[dayIndex];
          const { data: dayItems } = await supabase
            .from("plan_items")
            .select(
              "id, exercise_id, order_index, sets, rep_range_min, rep_range_max, target_rpe, notes",
            )
            .eq("plan_day_id", nextDay.id)
            .order("order_index");

          const exerciseIds = (dayItems ?? []).map((item) => item.exercise_id);
          const { data: exercises } = await supabase
            .from("exercises")
            .select("id, name")
            .in("id", exerciseIds);
          const nameMap = new Map((exercises ?? []).map((ex) => [ex.id, ex.name]));

          if (!cancelled) {
            setPlanItems(
              (dayItems ?? []).map((item) => ({
                ...item,
                exercise_name: nameMap.get(item.exercise_id) ?? "Unknown exercise",
              })),
            );
          }
        }
      }

      const { data: lastSession } = await supabase
        .from("workout_sessions")
        .select("id, started_at")
        .eq("user_id", user.id)
        .eq("status", "completed")
        .order("started_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (lastSession && !cancelled) {
        const { data: lastSets } = await supabase
          .from("workout_sets")
          .select("exercise_id, weight, reps, rpe, completed")
          .eq("session_id", lastSession.id)
          .eq("completed", true);

        if (lastSets && lastSets.length > 0) {
          const exerciseIds = [...new Set(lastSets.map((s) => s.exercise_id))];
          const { data: exNames } = await supabase
            .from("exercises")
            .select("id, name")
            .in("id", exerciseIds);
          const nameMap = new Map((exNames ?? []).map((e) => [e.id, e.name]));

          const grouped: Record<string, typeof lastSets> = {};
          for (const s of lastSets) {
            if (!grouped[s.exercise_id]) grouped[s.exercise_id] = [];
            grouped[s.exercise_id].push(s);
          }

          const exercises = Object.entries(grouped).map(([eid, sets]) => ({
            name: nameMap.get(eid) ?? "Unknown",
            topWeight: sets.reduce((max, s) => Math.max(max, s.weight ?? 0), 0) || null,
            totalSets: sets.length,
            avgRpe:
              sets.filter((s) => s.rpe != null).length > 0
                ? Math.round(
                    sets.filter((s) => s.rpe != null).reduce((sum, s) => sum + (s.rpe ?? 0), 0) /
                      sets.filter((s) => s.rpe != null).length,
                  )
                : null,
          }));

          setLastWorkoutSummary({
            date: new Date(lastSession.started_at).toLocaleDateString(),
            exercises,
          });
        }
      }

      if (!cancelled) setLoading(false);
    }

    void init();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const readiness = useMemo(
    () => calculateReadiness(sleep, doms[0], stress[0], hadWorkoutYesterday),
    [sleep, doms, stress, hadWorkoutYesterday],
  );
  const readinessLevel = getReadinessLevel(readiness);
  const adjustedPlan = adjustWorkoutForReadiness(planItems, readinessLevel.level);
  const tips = getRecoveryTips(readinessLevel.level);

  async function handleSave() {
    if (!userId) return;

    const validation = recoveryLogSchema.safeParse({
      sleep,
      doms: doms[0],
      stress: stress[0],
    });

    if (!validation.success) {
      const msg = validation.error.issues.map((e: { message: string }) => e.message).join(". ");
      setSaveState(msg);
      return;
    }

    setSaving(true);
    setSaveState("");

    try {
      const todayKey = getLocalDateKey();
      const { error } = await supabase.from("recovery_logs").upsert(
        {
          user_id: userId,
          date: todayKey,
          sleep: validation.data.sleep,
          doms: validation.data.doms,
          stress: validation.data.stress,
          readiness,
          notes: existingNotes,
        },
        { onConflict: "user_id,date" },
      );

      if (error) {
        setSaveState("Failed to save recovery log. Please try again.");
      } else {
        setSaveState("Recovery log saved for today.");
        setHasSavedToday(true);
      }
    } catch {
      setSaveState("Something went wrong. Please try again.");
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Recovery Readiness</h1>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="size-5 text-muted-foreground" />
              Recovery Input
            </CardTitle>
            <CardDescription>Log today&apos;s recovery and readiness factors</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="sleep">Sleep (hours)</Label>
              <Input
                id="sleep"
                type="number"
                inputMode="decimal"
                min={0}
                max={12}
                step={0.5}
                value={sleep}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  if (Number.isNaN(value)) return;
                  setSleep(Math.max(0, Math.min(12, value)));
                }}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Muscle Soreness (DOMS)</Label>
                <span className="text-sm font-medium tabular-nums text-muted-foreground">
                  {doms[0]} / 10
                </span>
              </div>
              <Slider
                value={doms}
                onValueChange={setDoms}
                min={0}
                max={10}
                step={1}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>No soreness</span>
                <span>Extreme soreness</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Stress / Fatigue</Label>
                <span className="text-sm font-medium tabular-nums text-muted-foreground">
                  {stress[0]} / 10
                </span>
              </div>
              <Slider
                value={stress}
                onValueChange={setStress}
                min={0}
                max={10}
                step={1}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Very relaxed</span>
                <span>Extremely stressed</span>
              </div>
            </div>

            <div className="rounded-md border bg-muted/20 p-3 text-sm">
              <p className="font-medium">Yesterday training load</p>
              <p className="text-muted-foreground">
                {hadWorkoutYesterday
                  ? "Completed workout detected yesterday (+10 load penalty)."
                  : "No completed workout detected yesterday."}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="size-5 text-muted-foreground" />
              Readiness Score
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4 py-6 text-center">
            <ReadinessGauge score={readiness} color={readinessLevel.color} />
            <Badge variant="outline" className={`${getColorClass(readinessLevel.color)}`}>
              {readinessLevel.label}
            </Badge>
            <p className="text-sm text-muted-foreground">{readinessLevel.description}</p>
            {hasSavedToday && (
              <AiCoachDialog
                context="recovery"
                contextData={{
                  readiness: {
                    score: readiness,
                    level: readinessLevel.label,
                    description: readinessLevel.description,
                  },
                  recoveryLog: {
                    sleep,
                    doms: doms[0],
                    stress: stress[0],
                  },
                  todayPlan: planItems.length > 0
                    ? {
                        day_name: "Today",
                        focus: "Planned workout",
                        items: planItems.map((item) => ({
                          exercise_name: item.exercise_name,
                          sets: item.sets,
                          rep_range_min: item.rep_range_min,
                          rep_range_max: item.rep_range_max,
                          target_rpe: item.target_rpe,
                        })),
                      }
                    : null,
                  lastWorkout: lastWorkoutSummary,
                }}
                isPro={userIsPro}
                trigger={
                  <Button variant="outline" size="sm">
                    <Sparkles className="size-4" />
                    AI Recovery Coach
                  </Button>
                }
              />
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="size-5 text-muted-foreground" />
            Training Recommendation
          </CardTitle>
          <CardDescription>
            Planned workout vs adjusted workout based on your readiness
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!planItems.length ? (
            <p className="text-sm text-muted-foreground">
              No active plan found. Generate a plan first to see readiness-based adjustments.
            </p>
          ) : (
            <>
              {readiness < 60 && (
                <div className="flex items-start gap-2 rounded-md border border-yellow-300 bg-yellow-50 p-3 text-sm text-yellow-900 dark:border-yellow-900 dark:bg-yellow-950/30 dark:text-yellow-200">
                  <TriangleAlert className="mt-0.5 size-4 shrink-0" />
                  <p>Your readiness is low. Today&apos;s planned workout should be adjusted.</p>
                </div>
              )}
              <div className="space-y-2">
                {planItems.map((item, idx) => {
                  const adjusted = adjustedPlan[idx];
                  return (
                    <div key={item.id} className="rounded-md border p-3">
                      <p className="font-medium">{item.exercise_name}</p>
                      <p className="text-sm text-muted-foreground">
                        Original: {item.sets} sets, {item.rep_range_min}-{item.rep_range_max} reps @
                        RPE {item.target_rpe}
                      </p>
                      <p className="text-sm">
                        Adjusted: {adjusted.sets} sets, {item.rep_range_min}-{item.rep_range_max} reps @
                        RPE {adjusted.target_rpe ?? "—"}
                        {adjusted.load_adjustment_pct != null && (
                          <span> , load {adjusted.load_adjustment_pct}%</span>
                        )}
                      </p>
                    </div>
                  );
                })}
              </div>
              {userIsPro ? (
                <Button asChild className="w-full">
                  <Link href="/workout">Apply to Today&apos;s Workout</Link>
                </Button>
              ) : (
                <Button
                  className="w-full"
                  onClick={() => setShowPaywall(true)}
                >
                  Apply to Today&apos;s Workout
                </Button>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Moon className="size-5 text-muted-foreground" />
            Recovery Guidance
          </CardTitle>
          <CardDescription>Practical recovery focus for your current readiness level</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            {tips.map((tip) => (
              <p key={tip} className="text-sm text-muted-foreground">
                • {tip}
              </p>
            ))}
          </div>
          {saveState && <p className="text-sm text-muted-foreground">{saveState}</p>}
          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving && <Loader2 className="size-4 animate-spin" />}
            Save
          </Button>
        </CardContent>
      </Card>

      <Paywall
        open={showPaywall}
        onOpenChange={setShowPaywall}
        feature="recovery_adjustment"
      />
    </div>
  );
}
