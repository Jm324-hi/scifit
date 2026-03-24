import type { Exercise } from "@/lib/exercise-substitution";

export interface ItemRow {
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

export interface ItemWithExercise extends ItemRow {
  exercise: Exercise;
}

export interface DayWithItems {
  id: string;
  plan_id: string;
  day_number: number;
  name: string;
  focus: string;
  items: ItemWithExercise[];
}
