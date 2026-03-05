"use client";

import { useState, useEffect, useRef } from "react";
import {
  Plus,
  ChevronDown,
  ChevronRight,
  Dumbbell,
  Timer,
  Check,
  Loader2,
  Play,
  Pause,
  RotateCcw,
  Clock,
  ClipboardList,
  Trophy,
  TriangleAlert,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardAction,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { ExerciseSelector } from "@/components/ExerciseSelector";
import { ExerciseSubstitute } from "@/components/ExerciseSubstitute";
import { AiCoachDialog } from "@/components/AiCoachDialog";
import { createClient } from "@/lib/supabase/client";
import type { Exercise } from "@/lib/exercise-substitution";
import {
  calculateProgression,
  detectPR,
  type PlanItemTarget,
  type ProgressionSetInput,
} from "@/lib/progression-engine";
import {
  adjustWorkoutForReadiness,
  getReadinessLevel,
} from "@/lib/recovery-engine";
import { isPro as checkIsPro } from "@/lib/subscription";
import { Paywall } from "@/components/Paywall";
import { workoutSetSchema } from "@/lib/validations";
import { toast } from "sonner";

interface WorkoutSession {
  id: string;
  user_id: string;
  plan_day_id: string | null;
  started_at: string;
  completed_at: string | null;
  notes: string | null;
  status: string;
}

interface SetRecord {
  id: string;
  session_id: string;
  exercise_id: string;
  set_number: number;
  weight: number | null;
  reps: number | null;
  rpe: number | null;
  completed: boolean;
  notes: string | null;
}

interface ExerciseGroup {
  exercise: Exercise;
  sets: SetRecord[];
  collapsed: boolean;
}

interface PlanDayPreview {
  id: string;
  name: string;
  focus: string;
  items: {
    exercise_id: string;
    order_index: number;
    sets: number;
    rep_range_min: number;
    rep_range_max: number;
    target_rpe: number;
    notes: string | null;
    load_adjustment_pct?: number;
  }[];
}

interface LastRecord {
  weight: number | null;
  reps: number[];
}

interface HistorySetRow {
  exercise_id: string;
  session_id: string;
  started_at: string;
  weight: number | null;
  reps: number | null;
  rpe: number | null;
}

interface ExerciseFinishInsight {
  exerciseId: string;
  exerciseName: string;
  recommendationText: string;
  reason: string;
  prText: string | null;
}

interface RecoverySnapshot {
  sleep: number;
  doms: number;
  stress: number;
  readiness: number;
}

const REST_PRESETS = [60, 90, 120, 180];

function formatTimer(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatWeight(weight: number | null): string {
  if (weight == null) return "—";
  if (Number.isInteger(weight)) return `${weight.toFixed(0)}kg`;
  return `${weight.toFixed(2)}kg`;
}

function getLocalDateKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function WorkoutPage() {
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [allExercises, setAllExercises] = useState<Exercise[]>([]);
  const [session, setSession] = useState<WorkoutSession | null>(null);
  const [groups, setGroups] = useState<ExerciseGroup[]>([]);

  const [restDuration, setRestDuration] = useState(90);
  const [restRemaining, setRestRemaining] = useState(0);
  const [restActive, setRestActive] = useState(false);
  const [restDone, setRestDone] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [showFinish, setShowFinish] = useState(false);
  const [finishNotes, setFinishNotes] = useState("");
  const [finishing, setFinishing] = useState(false);

  const [nextPlanDay, setNextPlanDay] = useState<PlanDayPreview | null>(null);
  const [planItemsByExercise, setPlanItemsByExercise] = useState<
    Record<string, PlanItemTarget>
  >({});
  const [lastRecordsByExercise, setLastRecordsByExercise] = useState<
    Record<string, LastRecord | null>
  >({});
  const [finishInsights, setFinishInsights] = useState<ExerciseFinishInsight[]>(
    [],
  );
  const [loadingFinishInsights, setLoadingFinishInsights] = useState(false);
  const [todayRecovery, setTodayRecovery] = useState<RecoverySnapshot | null>(null);
  const [userIsPro, setUserIsPro] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);

  /* ───────────── Init ───────────── */

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

      const { data: recovery } = await supabase
        .from("recovery_logs")
        .select("sleep, doms, stress, readiness")
        .eq("user_id", user.id)
        .eq("date", getLocalDateKey())
        .maybeSingle();
      if (!cancelled) {
        setTodayRecovery((recovery as RecoverySnapshot | null) ?? null);
      }

      const { data: exercises } = await supabase
        .from("exercises")
        .select("*")
        .order("name");
      const exList = (exercises ?? []) as Exercise[];
      if (!cancelled) setAllExercises(exList);

      const { data: active } = await supabase
        .from("workout_sessions")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "in_progress")
        .order("started_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (active && !cancelled) {
        setSession(active);
        await restoreSession(active.id, exList);
        await loadSessionPlanItems(active.plan_day_id);
      }

      if (!active && !cancelled) {
        await loadPlanDay(user.id);
        setPlanItemsByExercise({});
      }

      if (!cancelled) setLoading(false);
    }

    async function restoreSession(sessionId: string, exercises: Exercise[]) {
      const { data: sets } = await supabase
        .from("workout_sets")
        .select("*")
        .eq("session_id", sessionId)
        .order("set_number");

      if (!sets?.length) return;

      const map = new Map<string, SetRecord[]>();
      const order: string[] = [];
      for (const s of sets as SetRecord[]) {
        if (!map.has(s.exercise_id)) {
          map.set(s.exercise_id, []);
          order.push(s.exercise_id);
        }
        map.get(s.exercise_id)!.push(s);
      }

      const restored: ExerciseGroup[] = [];
      for (const eid of order) {
        const ex = exercises.find((e) => e.id === eid);
        if (ex)
          restored.push({ exercise: ex, sets: map.get(eid)!, collapsed: false });
      }
      setGroups(restored);
    }

    async function loadPlanDay(uid: string) {
      const { data: planData } = await supabase
        .from("plans")
        .select(
          "id, plan_days(id, day_number, name, focus, plan_items(exercise_id, order_index, sets, rep_range_min, rep_range_max, target_rpe, notes))",
        )
        .eq("user_id", uid)
        .eq("is_active", true)
        .maybeSingle();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (!planData || !(planData as any).plan_days?.length) return;

      const { count } = await supabase
        .from("workout_sessions")
        .select("*", { count: "exact", head: true })
        .eq("user_id", uid)
        .eq("status", "completed")
        .not("plan_day_id", "is", null);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sortedDays = [...(planData as any).plan_days].sort(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (a: any, b: any) => a.day_number - b.day_number,
      );
      const dayIdx = (count ?? 0) % sortedDays.length;
      const day = sortedDays[dayIdx];

      const items = (day.plan_items ?? [])
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .sort((a: any, b: any) => a.order_index - b.order_index);

      setNextPlanDay({
        id: day.id,
        name: day.name,
        focus: day.focus,
        items,
      });
    }

    init();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ───────────── Rest Timer ───────────── */

  useEffect(() => {
    if (restActive && restRemaining > 0) {
      timerRef.current = setInterval(() => {
        setRestRemaining((prev) => {
          if (prev <= 1) {
            setRestActive(false);
            setRestDone(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [restActive, restRemaining]);

  useEffect(() => {
    if (restDone) {
      const t = setTimeout(() => setRestDone(false), 5000);
      return () => clearTimeout(t);
    }
  }, [restDone]);

  function startRest() {
    setRestRemaining(restDuration);
    setRestActive(true);
    setRestDone(false);
  }

  async function loadSessionPlanItems(planDayId: string | null) {
    if (!planDayId) {
      setPlanItemsByExercise({});
      return;
    }
    const { data } = await supabase
      .from("plan_items")
      .select("exercise_id, rep_range_min, rep_range_max, target_rpe")
      .eq("plan_day_id", planDayId);
    const mapped: Record<string, PlanItemTarget> = {};
    for (const item of data ?? []) {
      mapped[item.exercise_id] = {
        rep_range_min: item.rep_range_min,
        rep_range_max: item.rep_range_max,
        target_rpe: item.target_rpe,
      };
    }
    setPlanItemsByExercise(mapped);
  }

  async function fetchHistorySetsForExercises(
    exerciseIds: string[],
  ): Promise<Record<string, HistorySetRow[]>> {
    if (!userId || exerciseIds.length === 0) return {};
    const { data } = await supabase
      .from("workout_sets")
      .select(
        "exercise_id, weight, reps, rpe, completed, set_number, workout_sessions!inner(id, user_id, status, started_at)",
      )
      .in("exercise_id", exerciseIds)
      .eq("completed", true)
      .eq("workout_sessions.user_id", userId)
      .eq("workout_sessions.status", "completed")
      .order("started_at", {
        ascending: false,
        foreignTable: "workout_sessions",
      })
      .order("set_number", { ascending: true });

    const rows = (data ?? []) as Array<{
      exercise_id: string;
      weight: number | null;
      reps: number | null;
      rpe: number | null;
      workout_sessions:
        | { id: string; started_at: string }
        | { id: string; started_at: string }[];
    }>;

    const grouped: Record<string, HistorySetRow[]> = {};
    for (const row of rows) {
      const session = Array.isArray(row.workout_sessions)
        ? row.workout_sessions[0]
        : row.workout_sessions;
      if (!session) continue;
      if (!grouped[row.exercise_id]) grouped[row.exercise_id] = [];
      grouped[row.exercise_id].push({
        exercise_id: row.exercise_id,
        session_id: session.id,
        started_at: session.started_at,
        weight: row.weight,
        reps: row.reps,
        rpe: row.rpe,
      });
    }

    return grouped;
  }

  function extractLastRecord(historyRows: HistorySetRow[]): LastRecord | null {
    if (!historyRows.length) return null;
    const latestSessionId = historyRows[0].session_id;
    const latestSets = historyRows.filter((row) => row.session_id === latestSessionId);
    if (!latestSets.length) return null;
    const topWeight = latestSets.reduce(
      (max, row) => Math.max(max, row.weight ?? 0),
      0,
    );
    return {
      weight: topWeight > 0 ? topWeight : null,
      reps: latestSets.map((row) => row.reps ?? 0),
    };
  }

  function buildRecommendationText(
    exerciseName: string,
    recommendation: ReturnType<typeof calculateProgression>,
    recentSets: SetRecord[],
    planItem?: PlanItemTarget,
  ) {
    const topWeight = recentSets.reduce(
      (max, set) => Math.max(max, set.weight ?? 0),
      0,
    );
    const repMax = planItem?.rep_range_max ?? 12;
    const maxRpe = recentSets.reduce((max, set) => Math.max(max, set.rpe ?? 0), 0);
    if (recommendation.recommendation === "increase" && recommendation.newWeight != null) {
      const delta = recommendation.newWeight - topWeight;
      return `${exerciseName}: +${formatWeight(delta)} next time (all sets hit ${repMax} reps at RPE ${maxRpe || "—"})`;
    }
    if (recommendation.recommendation === "decrease" && recommendation.newWeight != null) {
      return `${exerciseName}: reduce to ${formatWeight(recommendation.newWeight)} (performance dipped, rebuild quality reps)`;
    }
    const maintainWeight = recommendation.newWeight ?? (topWeight > 0 ? topWeight : null);
    return `${exerciseName}: maintain ${formatWeight(maintainWeight)} (stabilize execution first)`;
  }

  /* ───────────── Actions ───────────── */

  async function startWorkout() {
    if (!userId) return;
    try {
      const { data } = await supabase
        .from("workout_sessions")
        .insert({
          user_id: userId,
          started_at: new Date().toISOString(),
          status: "in_progress",
        })
        .select()
        .single();
      if (data) {
        setSession(data);
        setGroups([]);
        setPlanItemsByExercise({});
      }
    } catch {
      toast.error("Failed to start workout. Please try again.");
    }
  }

  async function startPlannedWorkout() {
    if (!userId || !nextPlanDay) return;
    const readinessInfo = todayRecovery
      ? getReadinessLevel(todayRecovery.readiness)
      : null;
    const itemsForToday =
      readinessInfo && userIsPro
        ? adjustWorkoutForReadiness(nextPlanDay.items, readinessInfo.level)
        : nextPlanDay.items;

    const { data: newSession } = await supabase
      .from("workout_sessions")
      .insert({
        user_id: userId,
        plan_day_id: nextPlanDay.id,
        started_at: new Date().toISOString(),
        status: "in_progress",
      })
      .select()
      .single();

    if (!newSession) return;
    setSession(newSession);
    const plannedMap: Record<string, PlanItemTarget> = {};
    for (const item of nextPlanDay.items) {
      plannedMap[item.exercise_id] = {
        rep_range_min: item.rep_range_min,
        rep_range_max: item.rep_range_max,
        target_rpe: item.target_rpe,
      };
    }
    setPlanItemsByExercise(plannedMap);

    const newGroups: ExerciseGroup[] = [];

    for (const item of itemsForToday) {
      const exercise = allExercises.find((e) => e.id === item.exercise_id);
      if (!exercise) continue;

      const setsData = Array.from({ length: item.sets }, (_, i) => ({
        session_id: newSession.id,
        exercise_id: item.exercise_id,
        set_number: i + 1,
        completed: false,
        notes: `Target: ${item.rep_range_min}-${item.rep_range_max} reps @ RPE ${item.target_rpe}`,
      }));

      const { data: newSets } = await supabase
        .from("workout_sets")
        .insert(setsData)
        .select();

      if (newSets) {
        newGroups.push({
          exercise,
          sets: (newSets as SetRecord[]).sort(
            (a, b) => a.set_number - b.set_number,
          ),
          collapsed: false,
        });
      }
    }

    setGroups(newGroups);
  }

  async function handleAddExercise(exercise: Exercise) {
    if (!session) return;
    const { data: newSet } = await supabase
      .from("workout_sets")
      .insert({
        session_id: session.id,
        exercise_id: exercise.id,
        set_number: 1,
        completed: false,
      })
      .select()
      .single();
    if (newSet) {
      setGroups((prev) => [
        ...prev,
        { exercise, sets: [newSet as SetRecord], collapsed: false },
      ]);
    }
  }

  async function handleAddSet(gi: number) {
    if (!session) return;
    const g = groups[gi];
    const { data: newSet } = await supabase
      .from("workout_sets")
      .insert({
        session_id: session.id,
        exercise_id: g.exercise.id,
        set_number: g.sets.length + 1,
        completed: false,
      })
      .select()
      .single();
    if (newSet) {
      setGroups((prev) => {
        const next = [...prev];
        next[gi] = {
          ...next[gi],
          sets: [...next[gi].sets, newSet as SetRecord],
        };
        return next;
      });
    }
  }

  function updateLocal(
    gi: number,
    si: number,
    field: keyof SetRecord,
    value: unknown,
  ) {
    setGroups((prev) => {
      const next = [...prev];
      const sets = [...next[gi].sets];
      sets[si] = { ...sets[si], [field]: value };
      next[gi] = { ...next[gi], sets };
      return next;
    });
  }

  async function saveField(setId: string, fields: Record<string, unknown>) {
    try {
      await supabase.from("workout_sets").update(fields).eq("id", setId);
    } catch {
      toast.error("Failed to save. Please try again.");
    }
  }

  async function toggleComplete(gi: number, si: number) {
    const set = groups[gi].sets[si];
    const done = !set.completed;

      if (done) {
      const result = workoutSetSchema.safeParse({
        weight: set.weight,
        reps: set.reps,
        rpe: set.rpe,
      });
      if (!result.success) {
        const msg = result.error.issues.map((e: { message: string }) => e.message).join(". ");
        toast.error(msg);
        return;
      }
    }

    updateLocal(gi, si, "completed", done);
    await saveField(set.id, { completed: done });
    if (done) startRest();
  }

  async function handleSwap(gi: number, newEx: Exercise) {
    const g = groups[gi];
    const ids = g.sets.map((s) => s.id);
    await supabase
      .from("workout_sets")
      .update({ exercise_id: newEx.id })
      .in("id", ids);
    setGroups((prev) => {
      const next = [...prev];
      next[gi] = {
        ...next[gi],
        exercise: newEx,
        sets: next[gi].sets.map((s) => ({ ...s, exercise_id: newEx.id })),
      };
      return next;
    });
  }

  function toggleCollapse(gi: number) {
    setGroups((prev) => {
      const next = [...prev];
      next[gi] = { ...next[gi], collapsed: !next[gi].collapsed };
      return next;
    });
  }

  useEffect(() => {
    async function loadLastRecords() {
      const ids = [...new Set(groups.map((g) => g.exercise.id))];
      const missing = ids.filter((id) => !(id in lastRecordsByExercise));
      if (!missing.length) return;

      const historyByExercise = await fetchHistorySetsForExercises(missing);
      setLastRecordsByExercise((prev) => {
        const next = { ...prev };
        for (const id of missing) {
          next[id] = extractLastRecord(historyByExercise[id] ?? []);
        }
        return next;
      });
    }

    if (session && groups.length > 0) {
      void loadLastRecords();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groups, session, userId]);

  async function prepareFinishInsights() {
    if (!session || groups.length === 0) return;
    setLoadingFinishInsights(true);
    const exerciseIds = [...new Set(groups.map((g) => g.exercise.id))];
    const historyByExercise = await fetchHistorySetsForExercises(exerciseIds);

    const insights: ExerciseFinishInsight[] = groups.map((group) => {
      const completedCurrentSets = group.sets.filter(
        (set) => set.completed && set.weight != null && set.reps != null,
      );
      const planItem = planItemsByExercise[group.exercise.id];
      const progression = calculateProgression(
        group.exercise.id,
        completedCurrentSets,
        planItem,
      );
      const recommendationText = buildRecommendationText(
        group.exercise.name,
        progression,
        completedCurrentSets,
        planItem,
      );

      const historicalInputs: ProgressionSetInput[] = (
        historyByExercise[group.exercise.id] ?? []
      ).map((row) => ({
        exercise_id: row.exercise_id,
        weight: row.weight,
        reps: row.reps,
        rpe: row.rpe,
        performedAt: row.started_at,
        isCurrentWorkout: false,
      }));

      const currentInputs: ProgressionSetInput[] = completedCurrentSets.map((set) => ({
        exercise_id: group.exercise.id,
        weight: set.weight,
        reps: set.reps,
        rpe: set.rpe,
        isCurrentWorkout: true,
        performedAt: new Date().toISOString(),
      }));

      const pr = detectPR(group.exercise.id, [...historicalInputs, ...currentInputs]);
      let prText: string | null = null;
      if (pr.hasNewWeightPR && pr.maxWeightPR) {
        prText = `New PR! ${group.exercise.name} ${formatWeight(pr.maxWeightPR.weight)} x ${pr.maxWeightPR.reps}`;
      } else if (pr.hasNewVolumePR && pr.maxVolumePR) {
        prText = `New Volume PR! ${group.exercise.name} ${formatWeight(pr.maxVolumePR.weight)} x ${pr.maxVolumePR.reps}`;
      }

      return {
        exerciseId: group.exercise.id,
        exerciseName: group.exercise.name,
        recommendationText,
        reason: progression.reason,
        prText,
      };
    });

    setFinishInsights(insights);
    setLoadingFinishInsights(false);
  }

  async function openFinishDialog() {
    setShowFinish(true);
    await prepareFinishInsights();
  }

  async function finishWorkout() {
    if (!session) return;
    setFinishing(true);
    try {
      await supabase
        .from("workout_sessions")
        .update({
          completed_at: new Date().toISOString(),
          status: "completed",
          notes: finishNotes || null,
        })
        .eq("id", session.id);

      setSession(null);
      setGroups([]);
      setShowFinish(false);
      setFinishNotes("");
      setFinishInsights([]);
      setRestActive(false);
      setRestRemaining(0);
      setLastRecordsByExercise({});
      setPlanItemsByExercise({});
    } catch {
      toast.error("Failed to finish workout. Please try again.");
    }
    setFinishing(false);
  }

  const completedSets = groups.reduce(
    (a, g) => a + g.sets.filter((s) => s.completed).length,
    0,
  );

  /* ───────────── Render ───────────── */

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!session) {
    const readinessInfo = todayRecovery
      ? getReadinessLevel(todayRecovery.readiness)
      : null;
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">Workout</h1>
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
            <Dumbbell className="size-12 text-muted-foreground/40" />
            <p className="text-muted-foreground">Ready to train?</p>

            {todayRecovery && readinessInfo && (
              <div className="w-full max-w-sm rounded-lg border bg-muted/20 p-4 text-left">
                <p className="text-sm font-semibold">Today&apos;s readiness</p>
                <p
                  className={`text-2xl font-bold ${
                    readinessInfo.color === "green"
                      ? "text-green-600"
                      : readinessInfo.color === "blue"
                        ? "text-blue-600"
                        : readinessInfo.color === "yellow"
                          ? "text-yellow-600"
                          : "text-red-600"
                  }`}
                >
                  {todayRecovery.readiness} - {readinessInfo.label}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {readinessInfo.description}
                </p>
                {todayRecovery.readiness < 60 && userIsPro && (
                  <p className="mt-2 flex items-start gap-2 rounded-md border border-yellow-300 bg-yellow-50 p-2 text-xs text-yellow-900 dark:border-yellow-900 dark:bg-yellow-950/30 dark:text-yellow-200">
                    <TriangleAlert className="mt-0.5 size-3.5 shrink-0" />
                    Your readiness is low. Workout has been auto-adjusted.
                  </p>
                )}
                {!userIsPro && todayRecovery.readiness < 60 && (
                  <button
                    type="button"
                    onClick={() => setShowPaywall(true)}
                    className="mt-2 flex w-full items-start gap-2 rounded-md border border-primary/30 bg-primary/5 p-2 text-left text-xs text-primary hover:bg-primary/10"
                  >
                    <TriangleAlert className="mt-0.5 size-3.5 shrink-0" />
                    Auto-adjustment is a Pro feature. Tap to upgrade.
                  </button>
                )}
              </div>
            )}

            {nextPlanDay && (
              <div className="w-full max-w-sm space-y-3 rounded-lg border p-4 text-left">
                <div>
                  <div className="flex items-center gap-2">
                    <ClipboardList className="size-4 text-primary" />
                    <p className="font-semibold">{nextPlanDay.name}</p>
                  </div>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {nextPlanDay.focus}
                  </p>
                </div>
                <div className="flex flex-wrap gap-1">
                  {nextPlanDay.items.slice(0, 4).map((item) => {
                    const ex = allExercises.find(
                      (e) => e.id === item.exercise_id,
                    );
                    return ex ? (
                      <Badge
                        key={item.exercise_id}
                        variant="outline"
                        className="text-xs"
                      >
                        {ex.name}
                      </Badge>
                    ) : null;
                  })}
                  {nextPlanDay.items.length > 4 && (
                    <Badge variant="outline" className="text-xs">
                      +{nextPlanDay.items.length - 4} more
                    </Badge>
                  )}
                </div>
                <Button
                  onClick={startPlannedWorkout}
                  size="lg"
                  className="w-full"
                >
                  <Play className="size-4" />
                  Start Planned Workout
                </Button>
              </div>
            )}

            <Button
              onClick={startWorkout}
              variant={nextPlanDay ? "outline" : "default"}
              size="lg"
            >
              <Plus className="size-4" />
              Start Empty Workout
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-28">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Workout</h1>
        <Badge variant="secondary" className="gap-1">
          <Clock className="size-3" />
          In Progress
        </Badge>
      </div>

      {/* Exercise groups */}
      {groups.map((g, gi) => (
        <Card key={`${g.exercise.id}-${gi}`}>
          <CardHeader>
            <CardTitle
              className="flex cursor-pointer items-center gap-2 select-none"
              onClick={() => toggleCollapse(gi)}
            >
              {g.collapsed ? (
                <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
              ) : (
                <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
              )}
              <span className="truncate">{g.exercise.name}</span>
              <Badge
                variant="outline"
                className="ml-1 shrink-0 capitalize text-[11px]"
              >
                {g.exercise.primary_muscle}
              </Badge>
            </CardTitle>
            <CardAction className="flex items-center gap-1">
              <AiCoachDialog
                context="workout"
                contextData={{
                  exercise: {
                    name: g.exercise.name,
                    primary_muscle: g.exercise.primary_muscle,
                    secondary_muscles: g.exercise.secondary_muscles,
                    equipment: g.exercise.equipment,
                    movement_pattern: g.exercise.movement_pattern,
                    difficulty: g.exercise.difficulty,
                    description: g.exercise.description,
                    tips: g.exercise.tips,
                  },
                  recentSets: g.sets
                    .filter((s) => s.completed)
                    .map((s) => ({
                      weight: s.weight,
                      reps: s.reps,
                      rpe: s.rpe,
                      set_number: s.set_number,
                    })),
                  planItem: planItemsByExercise[g.exercise.id]
                    ? {
                        sets: g.sets.length,
                        rep_range_min: planItemsByExercise[g.exercise.id].rep_range_min ?? 8,
                        rep_range_max: planItemsByExercise[g.exercise.id].rep_range_max ?? 12,
                        target_rpe: planItemsByExercise[g.exercise.id].target_rpe ?? 8,
                      }
                    : null,
                }}
                isPro={userIsPro}
                trigger={
                  <Button variant="ghost" size="icon-sm">
                    <Sparkles className="size-4" />
                  </Button>
                }
              />
              <ExerciseSubstitute
                exercise={g.exercise}
                allExercises={allExercises}
                onSwap={(ex) => handleSwap(gi, ex)}
              />
            </CardAction>
          </CardHeader>

          {!g.collapsed && (
            <CardContent className="space-y-2">
              {lastRecordsByExercise[g.exercise.id] && (
                <p className="text-xs text-muted-foreground">
                  Last: {formatWeight(lastRecordsByExercise[g.exercise.id]!.weight)} x{" "}
                  {lastRecordsByExercise[g.exercise.id]!.reps.join(",")}
                </p>
              )}
              <div className="grid grid-cols-[1.5rem_1fr_1fr_1fr_2.5rem] gap-1.5 px-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground sm:grid-cols-[2rem_1fr_1fr_1fr_2.5rem] sm:gap-2">
                <span>Set</span>
                <span>kg</span>
                <span>Reps</span>
                <span>RPE</span>
                <span className="text-center">✓</span>
              </div>

              {g.sets.map((set, si) => (
                <div
                  key={set.id}
                  className={`grid grid-cols-[1.5rem_1fr_1fr_1fr_2.5rem] items-center gap-1.5 rounded-md px-1 py-0.5 transition-colors sm:grid-cols-[2rem_1fr_1fr_1fr_2.5rem] sm:gap-2 ${
                    set.completed ? "bg-primary/5" : ""
                  }`}
                >
                  <span className="text-center text-sm font-medium text-muted-foreground">
                    {set.set_number}
                  </span>
                  <Input
                    type="number"
                    inputMode="decimal"
                    min={0}
                    step="any"
                    value={set.weight ?? ""}
                    placeholder="0"
                    className="h-9 text-sm sm:h-8"
                    onChange={(e) => {
                      const v =
                        e.target.value === ""
                          ? null
                          : parseFloat(e.target.value);
                      updateLocal(gi, si, "weight", v);
                    }}
                    onBlur={(e) => {
                      const v =
                        e.target.value === ""
                          ? null
                          : parseFloat(e.target.value);
                      saveField(set.id, { weight: v });
                    }}
                  />
                  <Input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    value={set.reps ?? ""}
                    placeholder="0"
                    className="h-9 text-sm sm:h-8"
                    onChange={(e) => {
                      const v =
                        e.target.value === ""
                          ? null
                          : parseInt(e.target.value, 10);
                      updateLocal(gi, si, "reps", v);
                    }}
                    onBlur={(e) => {
                      const v =
                        e.target.value === ""
                          ? null
                          : parseInt(e.target.value, 10);
                      saveField(set.id, { reps: v });
                    }}
                  />
                  <Input
                    type="number"
                    inputMode="numeric"
                    min={1}
                    max={10}
                    value={set.rpe ?? ""}
                    placeholder="—"
                    className="h-9 text-sm sm:h-8"
                    onChange={(e) => {
                      const v =
                        e.target.value === ""
                          ? null
                          : parseInt(e.target.value, 10);
                      updateLocal(gi, si, "rpe", v);
                    }}
                    onBlur={(e) => {
                      const v =
                        e.target.value === ""
                          ? null
                          : parseInt(e.target.value, 10);
                      saveField(set.id, { rpe: v });
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => toggleComplete(gi, si)}
                    className={`mx-auto flex size-7 items-center justify-center rounded-md border transition-colors ${
                      set.completed
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-input hover:bg-accent"
                    }`}
                  >
                    {set.completed && <Check className="size-4" />}
                  </button>
                </div>
              ))}

              <Button
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={() => handleAddSet(gi)}
              >
                <Plus className="size-3" />
                Add Set
              </Button>
            </CardContent>
          )}
        </Card>
      ))}

      {/* Add Exercise */}
      <ExerciseSelector
        exercises={allExercises}
        onSelect={handleAddExercise}
        trigger={
          <Button variant="outline" className="w-full">
            <Plus className="size-4" />
            Add Exercise
          </Button>
        }
      />

      {/* Finish Workout */}
      {groups.length > 0 && (
        <Button
          variant="destructive"
          className="w-full"
          onClick={openFinishDialog}
        >
          Finish Workout
        </Button>
      )}

      {/* ── Rest Timer (sticky bottom) ── */}
      <div
        className={`fixed inset-x-0 bottom-0 z-40 border-t px-3 py-2.5 transition-colors sm:px-4 sm:py-3 ${
          restDone
            ? "border-green-300 bg-green-50 dark:border-green-800 dark:bg-green-950/40"
            : "border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80"
        }`}
      >
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-2 sm:gap-3">
          <div className="flex items-center gap-2">
            <Timer
              className={`size-5 shrink-0 ${restDone ? "text-green-600" : "text-muted-foreground"}`}
            />
            <span
              className={`font-mono text-2xl font-bold tabular-nums sm:text-3xl ${
                restDone
                  ? "text-green-600"
                  : restActive
                    ? "text-foreground"
                    : "text-muted-foreground"
              }`}
            >
              {formatTimer(restRemaining)}
            </span>
            {restDone && (
              <Badge className="hidden animate-pulse bg-green-600 text-white sm:inline-flex">
                Rest Complete!
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <div className="flex gap-0.5 sm:gap-1">
              {REST_PRESETS.map((t) => (
                <Button
                  key={t}
                  variant={restDuration === t ? "secondary" : "ghost"}
                  size="xs"
                  className="min-w-0 px-1.5 text-xs sm:px-2"
                  onClick={() => {
                    setRestDuration(t);
                    if (!restActive) setRestRemaining(t);
                  }}
                >
                  {t >= 60 ? `${t / 60}m` : `${t}s`}
                </Button>
              ))}
            </div>

            {restActive ? (
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() => setRestActive(false)}
              >
                <Pause className="size-4" />
              </Button>
            ) : (
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() => {
                  if (restRemaining === 0) setRestRemaining(restDuration);
                  setRestActive(true);
                  setRestDone(false);
                }}
              >
                <Play className="size-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => {
                setRestActive(false);
                setRestRemaining(restDuration);
                setRestDone(false);
              }}
            >
              <RotateCcw className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* ── Finish Dialog ── */}
      <Dialog open={showFinish} onOpenChange={setShowFinish}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Finish Workout?</DialogTitle>
            <DialogDescription>
              You completed {completedSets} set
              {completedSets !== 1 ? "s" : ""} across {groups.length} exercise
              {groups.length !== 1 ? "s" : ""}.
            </DialogDescription>
          </DialogHeader>
          <textarea
            className="min-h-20 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 outline-none"
            placeholder="Add notes about this workout (optional)..."
            value={finishNotes}
            onChange={(e) => setFinishNotes(e.target.value)}
          />
          <div className="space-y-2">
            <p className="text-sm font-medium">Next Time Recommendations</p>
            {loadingFinishInsights ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                Preparing progression insights...
              </div>
            ) : (
              <div className="space-y-2">
                {finishInsights.map((insight) => (
                  <div
                    key={insight.exerciseId}
                    className="rounded-md border bg-muted/20 p-3"
                  >
                    <p className="text-sm font-medium">{insight.recommendationText}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{insight.reason}</p>
                    {insight.prText && (
                      <p className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-green-600">
                        <Trophy className="size-3.5" />
                        {insight.prText}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFinish(false)}>
              Cancel
            </Button>
            <Button onClick={finishWorkout} disabled={finishing}>
              {finishing && <Loader2 className="size-4 animate-spin" />}
              Complete Workout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Paywall
        open={showPaywall}
        onOpenChange={setShowPaywall}
        feature="recovery_adjustment"
      />
    </div>
  );
}
