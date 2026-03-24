import type { Exercise } from "@/lib/exercise-substitution";
import type { PlanItemTarget } from "@/lib/progression-engine";

export interface SetRecord {
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

export interface ExerciseGroup {
  exercise: Exercise;
  sets: SetRecord[];
  collapsed: boolean;
}

export interface LastRecord {
  weight: number | null;
  reps: number[];
}

export interface ExerciseFinishInsight {
  exerciseId: string;
  exerciseName: string;
  recommendationText: string;
  reason: string;
  prText: string | null;
}

export type { Exercise, PlanItemTarget };
