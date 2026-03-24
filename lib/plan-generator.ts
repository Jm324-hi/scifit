import type { Exercise } from "@/lib/exercise-substitution";

/* ─── Public types ──────────────────────────────────── */

export interface PlanProfile {
  goal: string;
  frequency: number;
  equipment: string;
  experience: string;
  available_time: number;
}

export interface GeneratedItem {
  exercise_id: string;
  order_index: number;
  sets: number;
  rep_range_min: number;
  rep_range_max: number;
  target_rpe: number;
  notes: string | null;
}

export interface GeneratedDay {
  day_number: number;
  name: string;
  focus: string;
  items: GeneratedItem[];
}

export interface GeneratedPlan {
  name: string;
  goal: string;
  frequency: number;
  duration_weeks: number;
  split_type: string;
  days: GeneratedDay[];
}

/* ─── Internal types ────────────────────────────────── */

interface Slot {
  muscle: string;
  pattern?: string;
  compound: boolean;
  priority: number; // 1 = essential, 2 = important, 3 = accessory
}

interface DayTemplate {
  name: string;
  focus: string;
  slots: Slot[];
}

/* ─── Constants ─────────────────────────────────────── */

const EQUIPMENT_MAP: Record<string, string[]> = {
  gym: ["barbell", "dumbbell", "machine", "cable", "bodyweight"],
  home: ["dumbbell", "bodyweight", "band"],
  both: ["barbell", "dumbbell", "machine", "cable", "bodyweight", "band"],
};

const VOLUME: Record<
  string,
  { sets: number; rpeCompound: number; rpeIsolation: number }
> = {
  beginner: { sets: 3, rpeCompound: 7, rpeIsolation: 6 },
  intermediate: { sets: 3, rpeCompound: 8, rpeIsolation: 7 },
  advanced: { sets: 4, rpeCompound: 9, rpeIsolation: 8 },
};

const COMPOUND_REPS: Record<string, [number, number]> = {
  strength: [4, 6],
  muscle: [6, 10],
  fat_loss: [8, 12],
  general: [6, 12],
};

const ISOLATION_REPS: Record<string, [number, number]> = {
  strength: [8, 12],
  muscle: [8, 15],
  fat_loss: [12, 20],
  general: [10, 15],
};

/* ─── Slot templates ────────────────────────────────── */

const FB_A: Slot[] = [
  { muscle: "quads", pattern: "squat", compound: true, priority: 1 },
  { muscle: "chest", pattern: "push", compound: true, priority: 1 },
  { muscle: "back", pattern: "pull", compound: true, priority: 1 },
  { muscle: "hamstrings", pattern: "hinge", compound: true, priority: 2 },
  { muscle: "shoulders", compound: false, priority: 2 },
  { muscle: "core", compound: false, priority: 3 },
  { muscle: "biceps", compound: false, priority: 3 },
];

const FB_B: Slot[] = [
  { muscle: "hamstrings", pattern: "hinge", compound: true, priority: 1 },
  { muscle: "back", pattern: "pull", compound: true, priority: 1 },
  { muscle: "chest", pattern: "push", compound: true, priority: 1 },
  { muscle: "glutes", pattern: "hinge", compound: true, priority: 2 },
  { muscle: "triceps", compound: false, priority: 2 },
  { muscle: "core", compound: false, priority: 3 },
  { muscle: "shoulders", compound: false, priority: 3 },
];

const FB_C: Slot[] = [
  { muscle: "chest", pattern: "push", compound: true, priority: 1 },
  { muscle: "quads", pattern: "squat", compound: true, priority: 1 },
  { muscle: "back", pattern: "pull", compound: true, priority: 1 },
  { muscle: "shoulders", pattern: "push", compound: true, priority: 2 },
  { muscle: "glutes", pattern: "hinge", compound: true, priority: 2 },
  { muscle: "biceps", compound: false, priority: 3 },
  { muscle: "core", compound: false, priority: 3 },
];

const UP_A: Slot[] = [
  { muscle: "chest", pattern: "push", compound: true, priority: 1 },
  { muscle: "back", pattern: "pull", compound: true, priority: 1 },
  { muscle: "chest", pattern: "push", compound: true, priority: 1 },
  { muscle: "back", pattern: "pull", compound: false, priority: 2 },
  { muscle: "shoulders", compound: false, priority: 2 },
  { muscle: "triceps", compound: false, priority: 3 },
  { muscle: "biceps", compound: false, priority: 3 },
];

const UP_B: Slot[] = [
  { muscle: "back", pattern: "pull", compound: true, priority: 1 },
  { muscle: "chest", pattern: "push", compound: true, priority: 1 },
  { muscle: "shoulders", pattern: "push", compound: true, priority: 1 },
  { muscle: "back", pattern: "pull", compound: false, priority: 2 },
  { muscle: "biceps", compound: false, priority: 2 },
  { muscle: "triceps", compound: false, priority: 3 },
  { muscle: "shoulders", compound: false, priority: 3 },
];

const LO_A: Slot[] = [
  { muscle: "quads", pattern: "squat", compound: true, priority: 1 },
  { muscle: "hamstrings", pattern: "hinge", compound: true, priority: 1 },
  { muscle: "quads", compound: false, priority: 2 },
  { muscle: "glutes", pattern: "hinge", compound: true, priority: 2 },
  { muscle: "calves", compound: false, priority: 3 },
  { muscle: "core", compound: false, priority: 3 },
];

const LO_B: Slot[] = [
  { muscle: "hamstrings", pattern: "hinge", compound: true, priority: 1 },
  { muscle: "quads", pattern: "squat", compound: true, priority: 1 },
  { muscle: "glutes", pattern: "hinge", compound: true, priority: 2 },
  { muscle: "hamstrings", compound: false, priority: 2 },
  { muscle: "calves", compound: false, priority: 3 },
  { muscle: "core", compound: false, priority: 3 },
];

const PU_A: Slot[] = [
  { muscle: "chest", pattern: "push", compound: true, priority: 1 },
  { muscle: "chest", pattern: "push", compound: true, priority: 1 },
  { muscle: "shoulders", pattern: "push", compound: true, priority: 1 },
  { muscle: "shoulders", compound: false, priority: 2 },
  { muscle: "triceps", compound: false, priority: 2 },
  { muscle: "triceps", compound: false, priority: 3 },
];

const PU_B: Slot[] = [
  { muscle: "shoulders", pattern: "push", compound: true, priority: 1 },
  { muscle: "chest", pattern: "push", compound: true, priority: 1 },
  { muscle: "chest", pattern: "push", compound: true, priority: 1 },
  { muscle: "triceps", compound: true, priority: 2 },
  { muscle: "shoulders", compound: false, priority: 2 },
  { muscle: "triceps", compound: false, priority: 3 },
];

const PL_A: Slot[] = [
  { muscle: "back", pattern: "pull", compound: true, priority: 1 },
  { muscle: "back", pattern: "pull", compound: true, priority: 1 },
  { muscle: "back", pattern: "pull", compound: false, priority: 2 },
  { muscle: "shoulders", pattern: "pull", compound: false, priority: 2 },
  { muscle: "biceps", compound: false, priority: 2 },
  { muscle: "biceps", compound: false, priority: 3 },
];

const PL_B: Slot[] = [
  { muscle: "back", pattern: "pull", compound: true, priority: 1 },
  { muscle: "back", pattern: "pull", compound: true, priority: 1 },
  { muscle: "shoulders", pattern: "pull", compound: false, priority: 2 },
  { muscle: "biceps", compound: false, priority: 2 },
  { muscle: "back", pattern: "pull", compound: false, priority: 2 },
  { muscle: "biceps", compound: false, priority: 3 },
];

const LE_A: Slot[] = [
  { muscle: "quads", pattern: "squat", compound: true, priority: 1 },
  { muscle: "hamstrings", pattern: "hinge", compound: true, priority: 1 },
  { muscle: "quads", pattern: "squat", compound: true, priority: 2 },
  { muscle: "glutes", pattern: "hinge", compound: true, priority: 2 },
  { muscle: "quads", compound: false, priority: 2 },
  { muscle: "hamstrings", compound: false, priority: 3 },
  { muscle: "calves", compound: false, priority: 3 },
  { muscle: "core", compound: false, priority: 3 },
];

const LE_B: Slot[] = [
  { muscle: "hamstrings", pattern: "hinge", compound: true, priority: 1 },
  { muscle: "quads", pattern: "squat", compound: true, priority: 1 },
  { muscle: "glutes", pattern: "hinge", compound: true, priority: 2 },
  { muscle: "quads", pattern: "squat", compound: true, priority: 2 },
  { muscle: "hamstrings", compound: false, priority: 2 },
  { muscle: "calves", compound: false, priority: 3 },
  { muscle: "core", compound: false, priority: 3 },
];

/* ─── Helpers ───────────────────────────────────────── */

export function isCompound(ex: Exercise): boolean {
  return ex.secondary_muscles.length >= 2;
}

function trimSlots(slots: Slot[], max: number): Slot[] {
  if (slots.length <= max) return slots;
  const indexed = slots.map((slot, i) => ({ slot, i }));
  indexed.sort((a, b) => a.slot.priority - b.slot.priority || a.i - b.i);
  const kept = indexed.slice(0, max);
  kept.sort((a, b) => a.i - b.i);
  return kept.map((k) => k.slot);
}

function pickExercise(
  slot: Slot,
  pool: Exercise[],
  dayUsed: Set<string>,
  globalUsed: Set<string>,
  experience: string,
): Exercise | null {
  let candidates = pool.filter((e) => {
    if (e.primary_muscle !== slot.muscle) return false;
    if (slot.pattern && e.movement_pattern !== slot.pattern) return false;
    if (dayUsed.has(e.id)) return false;
    return true;
  });

  if (candidates.length === 0) {
    candidates = pool.filter(
      (e) => e.primary_muscle === slot.muscle && !dayUsed.has(e.id),
    );
  }

  if (candidates.length === 0) {
    candidates = pool.filter((e) => e.primary_muscle === slot.muscle);
  }

  if (candidates.length === 0) return null;

  const typeMatch = candidates.filter((e) =>
    slot.compound ? isCompound(e) : !isCompound(e),
  );
  let working = typeMatch.length > 0 ? typeMatch : candidates;

  const fresh = working.filter((e) => !globalUsed.has(e.id));
  if (fresh.length > 0) working = fresh;

  const targetDiff =
    experience === "beginner" ? 2 : experience === "advanced" ? 4 : 3;
  working.sort(
    (a, b) =>
      Math.abs(a.difficulty - targetDiff) -
      Math.abs(b.difficulty - targetDiff),
  );

  const top = working.slice(0, Math.min(3, working.length));
  return top[Math.floor(Math.random() * top.length)];
}

function getSplitType(frequency: number): string {
  if (frequency <= 3) return "full_body";
  if (frequency === 4) return "upper_lower";
  return "push_pull_legs";
}

function getTemplates(frequency: number): DayTemplate[] {
  switch (frequency) {
    case 2:
      return [
        { name: "Full Body A", focus: "Full Body", slots: FB_A },
        { name: "Full Body B", focus: "Full Body", slots: FB_B },
      ];
    case 3:
      return [
        { name: "Full Body A", focus: "Full Body", slots: FB_A },
        { name: "Full Body B", focus: "Full Body", slots: FB_B },
        { name: "Full Body C", focus: "Full Body", slots: FB_C },
      ];
    case 4:
      return [
        { name: "Upper A", focus: "Upper Body", slots: UP_A },
        { name: "Lower A", focus: "Lower Body", slots: LO_A },
        { name: "Upper B", focus: "Upper Body", slots: UP_B },
        { name: "Lower B", focus: "Lower Body", slots: LO_B },
      ];
    case 5:
      return [
        {
          name: "Push",
          focus: "Chest · Shoulders · Triceps",
          slots: PU_A,
        },
        { name: "Pull", focus: "Back · Biceps", slots: PL_A },
        {
          name: "Legs",
          focus: "Quads · Hamstrings · Glutes",
          slots: LE_A,
        },
        { name: "Upper", focus: "Upper Body", slots: UP_B },
        { name: "Lower", focus: "Lower Body", slots: LO_B },
      ];
    default:
      return [
        {
          name: "Push A",
          focus: "Chest · Shoulders · Triceps",
          slots: PU_A,
        },
        { name: "Pull A", focus: "Back · Biceps", slots: PL_A },
        {
          name: "Legs A",
          focus: "Quads · Hamstrings · Glutes",
          slots: LE_A,
        },
        {
          name: "Push B",
          focus: "Chest · Shoulders · Triceps",
          slots: PU_B,
        },
        { name: "Pull B", focus: "Back · Biceps", slots: PL_B },
        {
          name: "Legs B",
          focus: "Quads · Hamstrings · Glutes",
          slots: LE_B,
        },
      ];
  }
}

/* ─── Main Generator ────────────────────────────────── */

export function generatePlan(
  profile: PlanProfile,
  exercises: Exercise[],
): GeneratedPlan {
  const freq = Math.max(2, Math.min(6, profile.frequency));
  const allowedEq = EQUIPMENT_MAP[profile.equipment] ?? EQUIPMENT_MAP.gym;
  const pool = exercises.filter((e) => allowedEq.includes(e.equipment));

  const splitType = getSplitType(freq);
  const templates = getTemplates(freq);
  const vol = VOLUME[profile.experience] ?? VOLUME.intermediate;

  const maxPerDay = Math.max(
    4,
    Math.min(10, Math.floor(profile.available_time / 8)),
  );

  const globalUsed = new Set<string>();

  const days: GeneratedDay[] = templates.map((tmpl, dayIdx) => {
    const slots = trimSlots(tmpl.slots, maxPerDay);
    const dayUsed = new Set<string>();
    const items: GeneratedItem[] = [];

    for (const slot of slots) {
      const ex = pickExercise(
        slot,
        pool,
        dayUsed,
        globalUsed,
        profile.experience,
      );
      if (!ex) continue;

      dayUsed.add(ex.id);
      globalUsed.add(ex.id);

      const compound = isCompound(ex);
      const mainLift =
        compound && items.length === 0 && profile.goal === "strength";

      let sets = vol.sets;
      let repMin: number;
      let repMax: number;
      const rpe = compound ? vol.rpeCompound : vol.rpeIsolation;

      if (mainLift) {
        sets = vol.sets + 1;
        [repMin, repMax] = [3, 5];
      } else {
        [repMin, repMax] = compound
          ? (COMPOUND_REPS[profile.goal] ?? COMPOUND_REPS.muscle)
          : (ISOLATION_REPS[profile.goal] ?? ISOLATION_REPS.muscle);
      }

      let notes: string | null = null;
      if (
        profile.goal === "fat_loss" &&
        items.length > 0 &&
        items.length % 2 === 1
      ) {
        notes = "Superset with previous exercise";
      }

      items.push({
        exercise_id: ex.id,
        order_index: items.length + 1,
        sets,
        rep_range_min: repMin,
        rep_range_max: repMax,
        target_rpe: rpe,
        notes,
      });
    }

    return {
      day_number: dayIdx + 1,
      name: tmpl.name,
      focus: tmpl.focus,
      items,
    };
  });

  const goalLabel =
    profile.goal === "muscle"
      ? "Muscle Building"
      : profile.goal === "strength"
        ? "Strength"
        : profile.goal === "fat_loss"
          ? "Fat Loss"
          : profile.goal;

  return {
    name: `${freq}-Day ${goalLabel} Plan`,
    goal: profile.goal,
    frequency: freq,
    duration_weeks: 4,
    split_type: splitType,
    days,
  };
}
