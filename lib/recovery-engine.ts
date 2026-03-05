export type ReadinessLevel = "optimal" | "normal" | "reduced" | "rest";

export interface ReadinessLevelInfo {
  level: ReadinessLevel;
  color: "green" | "blue" | "yellow" | "red";
  label: string;
  description: string;
}

export interface AdjustablePlanItem {
  sets: number;
  target_rpe?: number | null;
  notes?: string | null;
  order_index?: number;
  load_adjustment_pct?: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function calculateReadiness(
  sleep: number,
  doms: number,
  stress: number,
  hadIntenseWorkoutYesterday: boolean,
): number {
  const penaltySleep = Math.max(0, (7 - sleep) * 8);
  const penaltyDoms = doms * 4;
  const penaltyStress = stress * 3;
  const penaltyLoad = hadIntenseWorkoutYesterday ? 10 : 0;

  const readiness =
    100 - penaltySleep - penaltyDoms - penaltyStress - penaltyLoad;
  return clamp(Math.round(readiness), 0, 100);
}

export function getReadinessLevel(readiness: number): ReadinessLevelInfo {
  if (readiness >= 80) {
    return {
      level: "optimal",
      color: "green",
      label: "Optimal",
      description: "Full intensity, can add extra sets",
    };
  }
  if (readiness >= 60) {
    return {
      level: "normal",
      color: "blue",
      label: "Normal",
      description: "Train as planned",
    };
  }
  if (readiness >= 40) {
    return {
      level: "reduced",
      color: "yellow",
      label: "Reduced",
      description: "Lower volume by 20%",
    };
  }
  return {
    level: "rest",
    color: "red",
    label: "Recovery Day",
    description: "Active recovery or rest",
  };
}

function appendNote(notes: string | null | undefined, extra: string): string {
  if (!notes) return extra;
  if (notes.includes(extra)) return notes;
  return `${notes} | ${extra}`;
}

export function adjustWorkoutForReadiness<T extends AdjustablePlanItem>(
  planItems: T[],
  readinessLevel: ReadinessLevel,
): T[] {
  if (planItems.length === 0) return [];

  if (readinessLevel === "normal") {
    return planItems.map((item) => ({ ...item }));
  }

  if (readinessLevel === "optimal") {
    return planItems.map((item, idx) => {
      if (idx === planItems.length - 1) {
        return {
          ...item,
          sets: item.sets + 1,
          notes: appendNote(
            item.notes,
            "Optional: add 1 extra accessory set if form stays sharp.",
          ),
        };
      }
      return { ...item };
    });
  }

  if (readinessLevel === "reduced") {
    return planItems.map((item, idx) => {
      const loweredRpe =
        idx < 2 && item.target_rpe != null
          ? Math.max(1, item.target_rpe - 1)
          : item.target_rpe;
      return {
        ...item,
        sets: Math.max(2, item.sets - 1),
        target_rpe: loweredRpe,
        notes: appendNote(
          item.notes,
          "Reduced day: lower volume and keep effort controlled.",
        ),
      };
    });
  }

  return planItems.map((item) => ({
    ...item,
    sets: Math.max(1, Math.ceil(item.sets / 2)),
    target_rpe: item.target_rpe != null ? Math.max(1, item.target_rpe - 2) : null,
    load_adjustment_pct: -15,
    notes: appendNote(
      item.notes,
      "Recovery day: use ~15% lighter load, move with control, or switch to light cardio/stretching.",
    ),
  }));
}
