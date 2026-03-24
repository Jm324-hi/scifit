"use client";

import { ChevronUp, ChevronDown, Pencil, Trash2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExerciseSubstitute } from "@/components/ExerciseSubstitute";
import type { ItemWithExercise } from "./types";
import type { Exercise } from "@/lib/exercise-substitution";

interface PlanItemProps {
  item: ItemWithExercise;
  idx: number;
  totalItems: number;
  dayId: string;
  onMove: (dayId: string, itemId: string, direction: "up" | "down") => void;
  onSwap: (dayId: string, itemId: string, newExercise: Exercise) => void;
  onEdit: (item: ItemWithExercise) => void;
  onDelete: (dayId: string, itemId: string) => void;
  allExercises: Exercise[];
}

export function PlanItem({
  item,
  idx,
  totalItems,
  dayId,
  onMove,
  onSwap,
  onEdit,
  onDelete,
  allExercises,
}: PlanItemProps) {
  return (
    <div className="group flex items-start gap-3 rounded-md px-2 py-2 transition-colors hover:bg-accent/50">
      <span className="mt-0.5 w-5 shrink-0 text-center text-sm font-medium text-muted-foreground">
        {idx + 1}
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-medium leading-tight">{item.exercise.name}</p>
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          <span className="text-sm text-muted-foreground">
            {item.sets} × {item.rep_range_min}-{item.rep_range_max}
          </span>
          <Badge variant="outline" className="text-[11px]">
            RPE {item.target_rpe}
          </Badge>
          {item.notes && (
            <span className="text-xs italic text-muted-foreground">
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
          onClick={() => onMove(dayId, item.id, "up")}
        >
          <ChevronUp className="size-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          disabled={idx === totalItems - 1}
          onClick={() => onMove(dayId, item.id, "down")}
        >
          <ChevronDown className="size-3.5" />
        </Button>
        <ExerciseSubstitute
          exercise={item.exercise}
          allExercises={allExercises}
          onSwap={(ex) => onSwap(dayId, item.id, ex)}
          trigger={
            <Button variant="ghost" size="icon-sm">
              <RefreshCw className="size-3.5" />
            </Button>
          }
        />
        <Button variant="ghost" size="icon-sm" onClick={() => onEdit(item)}>
          <Pencil className="size-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          className="text-destructive hover:text-destructive"
          onClick={() => onDelete(dayId, item.id)}
        >
          <Trash2 className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}
