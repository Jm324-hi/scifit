"use client";

import { useState, useEffect, useRef } from "react";
import {
  Plus,
  Dumbbell,
  Play,
  Clock,
  ClipboardList,
  TriangleAlert,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ExerciseSelector,
  Paywall,
} from "@/components/dynamic-imports";
import { WorkoutLoadingSkeleton } from "@/components/loading/page-skeletons";
import { RestTimer } from "@/components/workout/RestTimer";
import { ExerciseCard } from "@/components/workout/ExerciseCard";
import { FinishDialog } from "@/components/workout/FinishDialog";
import { SmartWarmupDialog } from "@/components/workout/SmartWarmupDialog";
import type { ExerciseGroup, SetRecord } from "@/components/workout/types";
import { createClient } from "@/lib/supabase/client";
import { findSubstitutes, type Exercise } from "@/lib/exercise-substitution";
import { useGymProfiles } from "@/lib/use-gym-profiles";
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
  const { activeProfile } = useGymProfiles();

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
  const [expressMode, setExpressMode] = useState(false);
  const [showWarmup, setShowWarmup] = useState(false);

  const [restExerciseId, setRestExerciseId] = useState<string | null>(null);
  const [restGroupIndex, setRestGroupIndex] = useState<number | null>(null);

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

      const [proStatus, recoveryRes, exercisesRes, activeRes] =
        await Promise.all([
          checkIsPro(supabase, user.id),
          supabase
            .from("recovery_logs")
            .select("sleep, doms, stress, readiness")
            .eq("user_id", user.id)
            .eq("date", getLocalDateKey())
            .maybeSingle(),
          supabase.from("exercises").select("*").order("name"),
          supabase
            .from("workout_sessions")
            .select("*")
            .eq("user_id", user.id)
            .eq("status", "in_progress")
            .order("started_at", { ascending: false })
            .limit(1)
            .maybeSingle(),
        ]);

      if (!cancelled) setUserIsPro(proStatus);
      if (!cancelled) {
        setTodayRecovery(
          (recoveryRes.data as RecoverySnapshot | null) ?? null,
        );
      }
      const exList = (exercisesRes.data ?? []) as Exercise[];
      if (!cancelled) setAllExercises(exList);

      const active = activeRes.data;

      if (active && !cancelled) {
        setSession(active);
        await Promise.all([
          restoreSession(active.id, exList),
          loadSessionPlanItems(active.plan_day_id),
        ]);
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
      const [planRes, countRes] = await Promise.all([
        supabase
          .from("plans")
          .select(
            "id, plan_days(id, day_number, name, focus, plan_items(exercise_id, order_index, sets, rep_range_min, rep_range_max, target_rpe, notes))",
          )
          .eq("user_id", uid)
          .eq("is_active", true)
          .maybeSingle(),
        supabase
          .from("workout_sessions")
          .select("*", { count: "exact", head: true })
          .eq("user_id", uid)
          .eq("status", "completed")
          .not("plan_day_id", "is", null),
      ]);

      const planData = planRes.data;
      const { count } = countRes;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (!planData || !(planData as any).plan_days?.length) return;

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
    let itemsForToday =
      readinessInfo && userIsPro
        ? adjustWorkoutForReadiness(nextPlanDay.items, readinessInfo.level)
        : nextPlanDay.items;

    if (expressMode) {
      const expressCount = Math.min(3, Math.ceil(itemsForToday.length / 2));
      itemsForToday = itemsForToday.slice(0, expressCount);
    }

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
      let exercise = allExercises.find((e) => e.id === item.exercise_id);
      if (!exercise) continue;

      // Smart substitution based on active Gym Profile
      const allowedEq = activeProfile?.equipment || [];
      const needsSwap =
        allowedEq.length > 0 &&
        exercise.equipment !== "bodyweight" &&
        !allowedEq.includes(exercise.equipment);

      if (needsSwap) {
        const subs = findSubstitutes(exercise, allExercises, allowedEq);
        if (subs.length > 0) {
          exercise = subs[0];
          item.exercise_id = exercise.id; // update for logging sets below
          item.notes = (item.notes ? item.notes + " " : "") + "(Auto-swapped for profile)";
        }
      }

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
    if (done) {
      setRestExerciseId(groups[gi].exercise.id);
      setRestGroupIndex(gi);
      startRest();
    }
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
    return <WorkoutLoadingSkeleton />;
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

                {nextPlanDay.items.length > 3 && (
                  <div className="flex items-center gap-3 rounded-md border bg-muted/30 p-2.5">
                    <button
                      type="button"
                      onClick={() => setExpressMode(false)}
                      className={`flex-1 rounded-md px-3 py-1.5 text-center text-xs font-medium transition-colors ${
                        !expressMode
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Full ({nextPlanDay.items.length} exercises)
                    </button>
                    <button
                      type="button"
                      onClick={() => setExpressMode(true)}
                      className={`flex-1 rounded-md px-3 py-1.5 text-center text-xs font-medium transition-colors ${
                        expressMode
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Express ({Math.min(3, Math.ceil(nextPlanDay.items.length / 2))})
                    </button>
                  </div>
                )}

                <Button
                  onClick={() => setShowWarmup(true)}
                  size="lg"
                  className="w-full"
                >
                  <Play className="size-4" />
                  {expressMode ? "Start Express Workout" : "Start Planned Workout"}
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

        {nextPlanDay && (
          <SmartWarmupDialog
            open={showWarmup}
            onOpenChange={setShowWarmup}
            plannedExercises={
              nextPlanDay.items
                .map((i) => allExercises.find((e) => e.id === i.exercise_id))
                .filter((e): e is Exercise => !!e)
            }
            onStartWorkout={startPlannedWorkout}
          />
        )}
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
        <ExerciseCard
          key={`${g.exercise.id}-${gi}`}
          group={g}
          groupIndex={gi}
          lastRecord={lastRecordsByExercise[g.exercise.id] ?? null}
          planItem={planItemsByExercise[g.exercise.id]}
          onToggleCollapse={toggleCollapse}
          onUpdateLocal={updateLocal}
          onSaveField={saveField}
          onToggleComplete={toggleComplete}
          onAddSet={handleAddSet}
          onSwap={handleSwap}
          allExercises={allExercises}
          userIsPro={userIsPro}
        />
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

      <RestTimer
        restDuration={restDuration}
        restRemaining={restRemaining}
        restActive={restActive}
        restDone={restDone}
        currentGroup={restGroupIndex !== null ? groups[restGroupIndex] : undefined}
        lastRecord={restExerciseId ? lastRecordsByExercise[restExerciseId] : null}
        planItem={restExerciseId ? planItemsByExercise[restExerciseId] : undefined}
        onPresetSelect={(t) => {
          setRestDuration(t);
          if (!restActive) setRestRemaining(t);
        }}
        onStart={() => {
          if (restRemaining === 0) setRestRemaining(restDuration);
          setRestActive(true);
          setRestDone(false);
        }}
        onPause={() => setRestActive(false)}
        onReset={() => {
          setRestActive(false);
          setRestRemaining(restDuration);
          setRestDone(false);
        }}
      />

      <FinishDialog
        open={showFinish}
        onOpenChange={setShowFinish}
        completedSets={completedSets}
        groupsLength={groups.length}
        finishNotes={finishNotes}
        onNotesChange={setFinishNotes}
        finishInsights={finishInsights}
        loadingFinishInsights={loadingFinishInsights}
        onFinish={finishWorkout}
        finishing={finishing}
      />

      {showPaywall && (
        <Paywall
          open={showPaywall}
          onOpenChange={setShowPaywall}
          feature="recovery_adjustment"
        />
      )}
    </div>
  );
}
