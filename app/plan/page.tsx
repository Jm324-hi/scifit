"use client";

import { useState, useEffect } from "react";
import {
  ClipboardList,
  Loader2,
  RefreshCw,
  Pencil,
  Trash2,
  ChevronUp,
  ChevronDown,
  Plus,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
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
import { Paywall } from "@/components/Paywall";
import { createClient } from "@/lib/supabase/client";
import { generatePlan, isCompound } from "@/lib/plan-generator";
import { isPro as checkIsPro } from "@/lib/subscription";
import type { Exercise } from "@/lib/exercise-substitution";

/* ─── Types ─────────────────────────────────────────── */

interface PlanRow {
  id: string;
  user_id: string;
  name: string;
  goal: string;
  frequency: number;
  duration_weeks: number;
  split_type: string;
  is_active: boolean;
}

interface ItemRow {
  id: string;
  plan_day_id: string;
  exercise_id: string;
  order_index: number;
  sets: number;
  rep_range_min: number;
  rep_range_max: number;
  target_rpe: number;
  notes: string | null;
}

interface ItemWithExercise extends ItemRow {
  exercise: Exercise;
}

interface DayWithItems {
  id: string;
  plan_id: string;
  day_number: number;
  name: string;
  focus: string;
  items: ItemWithExercise[];
}

/* ─── Label maps ────────────────────────────────────── */

const SPLIT_LABELS: Record<string, string> = {
  full_body: "Full Body",
  upper_lower: "Upper / Lower",
  push_pull_legs: "Push / Pull / Legs",
};

const GOAL_LABELS: Record<string, string> = {
  muscle: "Muscle Building",
  strength: "Strength",
  fat_loss: "Fat Loss",
};

/* ─── Component ─────────────────────────────────────── */

export default function PlanPage() {
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [profile, setProfile] = useState<any>(null);
  const [plan, setPlan] = useState<PlanRow | null>(null);
  const [days, setDays] = useState<DayWithItems[]>([]);
  const [allExercises, setAllExercises] = useState<Exercise[]>([]);
  const [exMap, setExMap] = useState<Map<string, Exercise>>(new Map());

  const [generating, setGenerating] = useState(false);
  const [editItem, setEditItem] = useState<ItemWithExercise | null>(null);
  const [editSets, setEditSets] = useState(3);
  const [editRepMin, setEditRepMin] = useState(6);
  const [editRepMax, setEditRepMax] = useState(10);
  const [editRpe, setEditRpe] = useState(7);
  const [editNotes, setEditNotes] = useState("");
  const [showRegenerate, setShowRegenerate] = useState(false);
  const [userIsPro, setUserIsPro] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);

  /* ─── Data loading ─── */

  async function loadPlan(
    uid: string,
    exerciseMap: Map<string, Exercise>,
  ) {
    const { data: planData } = await supabase
      .from("plans")
      .select("*, plan_days(*, plan_items(*))")
      .eq("user_id", uid)
      .eq("is_active", true)
      .maybeSingle();

    if (planData) {
      setPlan({
        id: planData.id,
        user_id: planData.user_id,
        name: planData.name,
        goal: planData.goal,
        frequency: planData.frequency,
        duration_weeks: planData.duration_weeks,
        split_type: planData.split_type,
        is_active: planData.is_active,
      });

      const built: DayWithItems[] = (planData.plan_days ?? [])
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .sort((a: any, b: any) => a.day_number - b.day_number)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((d: any) => ({
          id: d.id,
          plan_id: d.plan_id,
          day_number: d.day_number,
          name: d.name,
          focus: d.focus,
          items: (d.plan_items ?? [])
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .sort((a: any, b: any) => a.order_index - b.order_index)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .map((item: any) => ({
              ...item,
              exercise: exerciseMap.get(item.exercise_id),
            }))
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .filter((item: any) => item.exercise),
        }));

      setDays(built);
    } else {
      setPlan(null);
      setDays([]);
    }
  }

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

      const { data: prof } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      if (!cancelled) setProfile(prof);

      const proStatus = await checkIsPro(supabase, user.id);
      if (!cancelled) setUserIsPro(proStatus);

      const { data: exData } = await supabase
        .from("exercises")
        .select("*")
        .order("name");
      const exercises = (exData ?? []) as Exercise[];
      const exerciseMap = new Map(exercises.map((e) => [e.id, e]));
      if (!cancelled) {
        setAllExercises(exercises);
        setExMap(exerciseMap);
      }

      await loadPlan(user.id, exerciseMap);
      if (!cancelled) setLoading(false);
    }

    init();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ─── Generate plan ─── */

  async function handleGenerate() {
    if (!userId || !profile) return;
    setGenerating(true);

    const generated = generatePlan(
      {
        goal: profile.goal,
        frequency: profile.frequency,
        equipment: profile.equipment,
        experience: profile.experience,
        available_time: profile.available_time,
      },
      allExercises,
    );

    await supabase
      .from("plans")
      .update({ is_active: false })
      .eq("user_id", userId)
      .eq("is_active", true);

    const { data: planRecord } = await supabase
      .from("plans")
      .insert({
        user_id: userId,
        name: generated.name,
        goal: generated.goal,
        frequency: generated.frequency,
        duration_weeks: generated.duration_weeks,
        split_type: generated.split_type,
        is_active: true,
      })
      .select()
      .single();

    if (!planRecord) {
      setGenerating(false);
      return;
    }

    const dayInserts = generated.days.map((d) => ({
      plan_id: planRecord.id,
      day_number: d.day_number,
      name: d.name,
      focus: d.focus,
    }));

    const { data: dayRecords } = await supabase
      .from("plan_days")
      .insert(dayInserts)
      .select();

    if (!dayRecords) {
      setGenerating(false);
      return;
    }

    dayRecords.sort(
      (a: { day_number: number }, b: { day_number: number }) =>
        a.day_number - b.day_number,
    );

    const itemInserts: {
      plan_day_id: string;
      exercise_id: string;
      order_index: number;
      sets: number;
      rep_range_min: number;
      rep_range_max: number;
      target_rpe: number;
      notes: string | null;
    }[] = [];

    for (let i = 0; i < generated.days.length; i++) {
      const genDay = generated.days[i];
      const dbDay = dayRecords[i];
      for (const item of genDay.items) {
        itemInserts.push({
          plan_day_id: dbDay.id,
          exercise_id: item.exercise_id,
          order_index: item.order_index,
          sets: item.sets,
          rep_range_min: item.rep_range_min,
          rep_range_max: item.rep_range_max,
          target_rpe: item.target_rpe,
          notes: item.notes,
        });
      }
    }

    if (itemInserts.length > 0) {
      await supabase.from("plan_items").insert(itemInserts);
    }

    await loadPlan(userId, exMap);
    setGenerating(false);
  }

  /* ─── Regenerate ─── */

  async function handleRegenerate() {
    if (!plan) return;
    setShowRegenerate(false);
    await supabase
      .from("plans")
      .update({ is_active: false })
      .eq("id", plan.id);
    setPlan(null);
    setDays([]);
    await handleGenerate();
  }

  /* ─── Edit item ─── */

  function openEdit(item: ItemWithExercise) {
    setEditItem(item);
    setEditSets(item.sets);
    setEditRepMin(item.rep_range_min);
    setEditRepMax(item.rep_range_max);
    setEditRpe(item.target_rpe);
    setEditNotes(item.notes ?? "");
  }

  async function handleSaveEdit() {
    if (!editItem) return;
    const updates = {
      sets: editSets,
      rep_range_min: editRepMin,
      rep_range_max: editRepMax,
      target_rpe: editRpe,
      notes: editNotes || null,
    };

    setDays((prev) =>
      prev.map((d) => ({
        ...d,
        items: d.items.map((i) =>
          i.id === editItem.id ? { ...i, ...updates } : i,
        ),
      })),
    );
    setEditItem(null);

    await supabase.from("plan_items").update(updates).eq("id", editItem.id);
  }

  /* ─── Delete item ─── */

  async function handleDeleteItem(dayId: string, itemId: string) {
    setDays((prev) =>
      prev.map((d) =>
        d.id === dayId
          ? { ...d, items: d.items.filter((i) => i.id !== itemId) }
          : d,
      ),
    );
    await supabase.from("plan_items").delete().eq("id", itemId);
  }

  /* ─── Add exercise ─── */

  async function handleAddExercise(dayId: string, exercise: Exercise) {
    const day = days.find((d) => d.id === dayId);
    if (!day) return;

    const maxOrder = day.items.reduce(
      (m, i) => Math.max(m, i.order_index),
      0,
    );
    const compound = isCompound(exercise);

    const { data: newItem } = await supabase
      .from("plan_items")
      .insert({
        plan_day_id: dayId,
        exercise_id: exercise.id,
        order_index: maxOrder + 1,
        sets: 3,
        rep_range_min: compound ? 6 : 8,
        rep_range_max: compound ? 10 : 15,
        target_rpe: 7,
        notes: null,
      })
      .select()
      .single();

    if (newItem) {
      setDays((prev) =>
        prev.map((d) =>
          d.id === dayId
            ? {
                ...d,
                items: [
                  ...d.items,
                  { ...(newItem as ItemRow), exercise },
                ],
              }
            : d,
        ),
      );
    }
  }

  /* ─── Swap exercise ─── */

  async function handleSwapExercise(
    dayId: string,
    itemId: string,
    newExercise: Exercise,
  ) {
    setDays((prev) =>
      prev.map((d) =>
        d.id === dayId
          ? {
              ...d,
              items: d.items.map((i) =>
                i.id === itemId
                  ? {
                      ...i,
                      exercise_id: newExercise.id,
                      exercise: newExercise,
                    }
                  : i,
              ),
            }
          : d,
      ),
    );
    await supabase
      .from("plan_items")
      .update({ exercise_id: newExercise.id })
      .eq("id", itemId);
  }

  /* ─── Move item ─── */

  async function handleMove(
    dayId: string,
    itemId: string,
    direction: "up" | "down",
  ) {
    const day = days.find((d) => d.id === dayId);
    if (!day) return;

    const sorted = [...day.items].sort(
      (a, b) => a.order_index - b.order_index,
    );
    const idx = sorted.findIndex((i) => i.id === itemId);
    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= sorted.length) return;

    const a = sorted[idx];
    const b = sorted[targetIdx];
    const orderA = a.order_index;
    const orderB = b.order_index;

    const newItems = day.items
      .map((i) => {
        if (i.id === a.id) return { ...i, order_index: orderB };
        if (i.id === b.id) return { ...i, order_index: orderA };
        return i;
      })
      .sort((x, y) => x.order_index - y.order_index);

    setDays((prev) =>
      prev.map((d) => (d.id === dayId ? { ...d, items: newItems } : d)),
    );

    await Promise.all([
      supabase
        .from("plan_items")
        .update({ order_index: orderB })
        .eq("id", a.id),
      supabase
        .from("plan_items")
        .update({ order_index: orderA })
        .eq("id", b.id),
    ]);
  }

  /* ─── Render: Loading ─── */

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  /* ─── Render: Empty state ─── */

  if (!plan) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">Training Plan</h1>
        <Card>
          <CardContent className="flex flex-col items-center gap-5 py-16 text-center">
            <ClipboardList className="size-12 text-muted-foreground/40" />
            <div className="space-y-1">
              <p className="font-medium">No training plan yet</p>
              <p className="text-sm text-muted-foreground">
                Generate a personalized plan based on your profile.
              </p>
            </div>
            <Button
              onClick={handleGenerate}
              size="lg"
              disabled={generating || !profile}
            >
              {generating ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Sparkles className="size-4" />
              )}
              {generating ? "Generating..." : "Generate Your Plan"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  /* ─── Render: Plan view ─── */

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">{plan.name}</h1>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">
              {SPLIT_LABELS[plan.split_type] ?? plan.split_type}
            </Badge>
            <Badge variant="outline">{plan.frequency}x / week</Badge>
            <Badge variant="outline">
              {GOAL_LABELS[plan.goal] ?? plan.goal}
            </Badge>
            <Badge variant="outline">{plan.duration_weeks} weeks</Badge>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <AiCoachDialog
            context="plan"
            contextData={{
              plan: {
                name: plan.name,
                goal: plan.goal,
                frequency: plan.frequency,
                duration_weeks: plan.duration_weeks,
                split_type: plan.split_type,
              },
              days: days.map((d) => ({
                day_number: d.day_number,
                name: d.name,
                focus: d.focus,
                items: d.items.map((item) => ({
                  exercise_name: item.exercise.name,
                  sets: item.sets,
                  rep_range_min: item.rep_range_min,
                  rep_range_max: item.rep_range_max,
                  target_rpe: item.target_rpe,
                  notes: item.notes,
                })),
              })),
              profile: profile
                ? {
                    goal: profile.goal,
                    frequency: profile.frequency,
                    equipment: profile.equipment,
                    experience: profile.experience,
                    available_time: profile.available_time,
                  }
                : {
                    goal: plan.goal,
                    frequency: plan.frequency,
                    equipment: "gym",
                    experience: "intermediate",
                    available_time: 60,
                  },
            }}
            isPro={userIsPro}
            trigger={
              <Button variant="outline" size="sm">
                <Sparkles className="size-4" />
                AI Plan Advisor
              </Button>
            }
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (!userIsPro) {
                setShowPaywall(true);
                return;
              }
              setShowRegenerate(true);
            }}
          >
            <RefreshCw className="size-4" />
            Regenerate
          </Button>
        </div>
      </div>

      {/* Day cards */}
      {days.map((day) => (
        <Card key={day.id}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                {day.day_number}
              </span>
              {day.name}
            </CardTitle>
            <CardDescription>{day.focus}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1">
            {day.items.length === 0 && (
              <p className="py-4 text-center text-sm text-muted-foreground">
                No exercises in this day.
              </p>
            )}

            {day.items.map((item, idx) => (
              <div
                key={item.id}
                className="group flex items-start gap-3 rounded-md px-2 py-2 transition-colors hover:bg-accent/50"
              >
                <span className="mt-0.5 w-5 shrink-0 text-center text-sm font-medium text-muted-foreground">
                  {idx + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium leading-tight">
                    {item.exercise.name}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5">
                    <span className="text-sm text-muted-foreground">
                      {item.sets} × {item.rep_range_min}-{item.rep_range_max}
                    </span>
                    <Badge
                      variant="outline"
                      className="text-[11px]"
                    >
                      RPE {item.target_rpe}
                    </Badge>
                    {item.notes && (
                      <span className="text-xs text-muted-foreground italic">
                        {item.notes}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    disabled={idx === 0}
                    onClick={() => handleMove(day.id, item.id, "up")}
                  >
                    <ChevronUp className="size-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    disabled={idx === day.items.length - 1}
                    onClick={() => handleMove(day.id, item.id, "down")}
                  >
                    <ChevronDown className="size-3.5" />
                  </Button>
                  <ExerciseSubstitute
                    exercise={item.exercise}
                    allExercises={allExercises}
                    onSwap={(ex) =>
                      handleSwapExercise(day.id, item.id, ex)
                    }
                    trigger={
                      <Button variant="ghost" size="icon-sm">
                        <RefreshCw className="size-3.5" />
                      </Button>
                    }
                  />
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => openEdit(item)}
                  >
                    <Pencil className="size-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDeleteItem(day.id, item.id)}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
            ))}

            <div className="pt-2">
              <ExerciseSelector
                exercises={allExercises}
                onSelect={(ex) => handleAddExercise(day.id, ex)}
                trigger={
                  <Button variant="ghost" size="sm" className="w-full">
                    <Plus className="size-3" />
                    Add Exercise
                  </Button>
                }
              />
            </div>
          </CardContent>
        </Card>
      ))}

      {/* ── Edit Dialog ── */}
      <Dialog
        open={editItem !== null}
        onOpenChange={(open) => {
          if (!open) setEditItem(null);
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Edit Exercise</DialogTitle>
            <DialogDescription>
              {editItem?.exercise.name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-4 items-center gap-3">
              <Label className="text-right">Sets</Label>
              <Input
                type="number"
                min={1}
                max={10}
                value={editSets}
                onChange={(e) => setEditSets(parseInt(e.target.value) || 1)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-3">
              <Label className="text-right">Reps</Label>
              <div className="col-span-3 flex items-center gap-2">
                <Input
                  type="number"
                  min={1}
                  max={50}
                  value={editRepMin}
                  onChange={(e) =>
                    setEditRepMin(parseInt(e.target.value) || 1)
                  }
                />
                <span className="text-muted-foreground">–</span>
                <Input
                  type="number"
                  min={1}
                  max={50}
                  value={editRepMax}
                  onChange={(e) =>
                    setEditRepMax(parseInt(e.target.value) || 1)
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-3">
              <Label className="text-right">RPE</Label>
              <Input
                type="number"
                min={1}
                max={10}
                value={editRpe}
                onChange={(e) => setEditRpe(parseInt(e.target.value) || 1)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-3">
              <Label className="text-right">Notes</Label>
              <Input
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="Optional notes..."
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditItem(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Regenerate Dialog ── */}
      <Dialog open={showRegenerate} onOpenChange={setShowRegenerate}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Regenerate Plan?</DialogTitle>
            <DialogDescription>
              This will replace your current plan with a new one generated
              from your profile settings. Any manual edits will be lost.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRegenerate(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleRegenerate}>
              <RefreshCw className="size-4" />
              Regenerate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Paywall
        open={showPaywall}
        onOpenChange={setShowPaywall}
        feature="unlimited_plans"
      />
    </div>
  );
}
