export type ProgressRecommendation = "increase" | "maintain" | "decrease";

export interface ProgressionSetInput {
  exercise_id?: string;
  weight: number | null;
  reps: number | null;
  rpe: number | null;
  completed?: boolean;
  performedAt?: string;
  isCurrentWorkout?: boolean;
}

export interface PlanItemTarget {
  rep_range_min?: number | null;
  rep_range_max?: number | null;
  target_rpe?: number | null;
}

export interface ProgressionResult {
  recommendation: ProgressRecommendation;
  newWeight: number | null;
  reason: string;
}

export interface PRMetric {
  weight: number;
  reps: number;
  value: number;
  performedAt?: string;
}

export interface PRDetectionResult {
  exerciseId: string;
  hasPR: boolean;
  hasNewWeightPR: boolean;
  hasNewVolumePR: boolean;
  maxWeightPR: PRMetric | null;
  maxVolumePR: PRMetric | null;
}

const DEFAULT_REP_MIN = 8;
const DEFAULT_REP_MAX = 12;
const DEFAULT_TARGET_RPE = 8;

function roundTo2(value: number): number {
  return Math.round(value * 100) / 100;
}

function formatKg(value: number): string {
  const rounded = roundTo2(value);
  if (Number.isInteger(rounded)) return `${rounded.toFixed(0)}kg`;
  return `${rounded.toFixed(2)}kg`;
}

function normalizeWorkingSets(sets: ProgressionSetInput[]): ProgressionSetInput[] {
  return sets.filter(
    (set) =>
      set.completed !== false &&
      set.weight != null &&
      set.weight > 0 &&
      set.reps != null &&
      set.reps > 0,
  );
}

export function calculateProgression(
  exerciseId: string,
  recentSets: ProgressionSetInput[],
  planItem?: PlanItemTarget | null,
): ProgressionResult {
  const repMin = planItem?.rep_range_min ?? DEFAULT_REP_MIN;
  const repMax = planItem?.rep_range_max ?? DEFAULT_REP_MAX;
  const targetRpe = planItem?.target_rpe ?? DEFAULT_TARGET_RPE;

  const workingSets = normalizeWorkingSets(recentSets).filter(
    (set) => !set.exercise_id || set.exercise_id === exerciseId,
  );

  if (workingSets.length === 0) {
    return {
      recommendation: "maintain",
      newWeight: null,
      reason: "Not enough completed working sets yet. Keep the same load next time.",
    };
  }

  const topWeight = Math.max(...workingSets.map((set) => set.weight ?? 0));
  const allHitRepMax = workingSets.every((set) => (set.reps ?? 0) >= repMax);
  const maxRpe = Math.max(...workingSets.map((set) => set.rpe ?? targetRpe));
  const anyBelowRepMin = workingSets.some((set) => (set.reps ?? 0) < repMin);
  const anyNearFailure = workingSets.some((set) => (set.rpe ?? 0) >= 10);

  if (anyBelowRepMin || anyNearFailure) {
    const dropPct = anyNearFailure ? 0.1 : 0.05;
    const lowered = roundTo2(Math.max(0, topWeight * (1 - dropPct)));
    return {
      recommendation: "decrease",
      newWeight: lowered,
      reason: `Performance was below target (${repMin}-${repMax} reps / RPE ${targetRpe}). Reduce load and rebuild clean reps.`,
    };
  }

  if (allHitRepMax && maxRpe <= targetRpe) {
    const increaseBy = Math.max(topWeight * 0.025, 1.25);
    const raised = roundTo2(topWeight + increaseBy);
    return {
      recommendation: "increase",
      newWeight: raised,
      reason: `All sets reached ${repMax} reps with controlled effort (RPE <= ${targetRpe}). Add load next session.`,
    };
  }

  if (allHitRepMax && maxRpe > targetRpe + 1) {
    return {
      recommendation: "maintain",
      newWeight: roundTo2(topWeight),
      reason: `Reps were achieved but effort was high (RPE ${maxRpe}). Keep the weight and stabilize execution.`,
    };
  }

  return {
    recommendation: "maintain",
    newWeight: roundTo2(topWeight),
    reason: `Keep ${formatKg(topWeight)} and continue progressing toward ${repMax} reps at RPE ${targetRpe}.`,
  };
}

export function detectPR(
  exerciseId: string,
  allSets: ProgressionSetInput[],
): PRDetectionResult {
  const relevant = normalizeWorkingSets(allSets).filter(
    (set) => !set.exercise_id || set.exercise_id === exerciseId,
  );

  if (relevant.length === 0) {
    return {
      exerciseId,
      hasPR: false,
      hasNewWeightPR: false,
      hasNewVolumePR: false,
      maxWeightPR: null,
      maxVolumePR: null,
    };
  }

  const maxWeightSet = relevant.reduce((best, set) => {
    const weight = set.weight ?? 0;
    const reps = set.reps ?? 0;
    if (!best) return set;
    const bestWeight = best.weight ?? 0;
    const bestReps = best.reps ?? 0;
    if (weight > bestWeight) return set;
    if (weight === bestWeight && reps > bestReps) return set;
    return best;
  }, null as ProgressionSetInput | null);

  const maxVolumeSet = relevant.reduce((best, set) => {
    const volume = (set.weight ?? 0) * (set.reps ?? 0);
    const bestVolume = best ? (best.weight ?? 0) * (best.reps ?? 0) : -1;
    if (!best || volume > bestVolume) return set;
    if (
      volume === bestVolume &&
      (set.weight ?? 0) > (best.weight ?? 0)
    ) {
      return set;
    }
    return best;
  }, null as ProgressionSetInput | null);

  const maxWeightBefore = relevant
    .filter((set) => !set.isCurrentWorkout)
    .reduce((best, set) => Math.max(best, set.weight ?? 0), 0);

  const maxVolumeBefore = relevant
    .filter((set) => !set.isCurrentWorkout)
    .reduce((best, set) => Math.max(best, (set.weight ?? 0) * (set.reps ?? 0)), 0);

  const maxWeightNow = relevant
    .filter((set) => set.isCurrentWorkout)
    .reduce((best, set) => Math.max(best, set.weight ?? 0), 0);

  const maxVolumeNow = relevant
    .filter((set) => set.isCurrentWorkout)
    .reduce((best, set) => Math.max(best, (set.weight ?? 0) * (set.reps ?? 0)), 0);

  const hasNewWeightPR = maxWeightNow > 0 && maxWeightNow > maxWeightBefore;
  const hasNewVolumePR = maxVolumeNow > 0 && maxVolumeNow > maxVolumeBefore;

  return {
    exerciseId,
    hasPR: hasNewWeightPR || hasNewVolumePR,
    hasNewWeightPR,
    hasNewVolumePR,
    maxWeightPR: maxWeightSet
      ? {
          weight: maxWeightSet.weight ?? 0,
          reps: maxWeightSet.reps ?? 0,
          value: maxWeightSet.weight ?? 0,
          performedAt: maxWeightSet.performedAt,
        }
      : null,
    maxVolumePR: maxVolumeSet
      ? {
          weight: maxVolumeSet.weight ?? 0,
          reps: maxVolumeSet.reps ?? 0,
          value: (maxVolumeSet.weight ?? 0) * (maxVolumeSet.reps ?? 0),
          performedAt: maxVolumeSet.performedAt,
        }
      : null,
  };
}
