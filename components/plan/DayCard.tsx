"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { ExerciseSelector } from "@/components/dynamic-imports";
import { PlanItem } from "./PlanItem";
import type { DayWithItems, ItemWithExercise } from "./types";
import type { Exercise } from "@/lib/exercise-substitution";

interface DayCardProps {
  day: DayWithItems;
  allExercises: Exercise[];
  onMove: (dayId: string, itemId: string, direction: "up" | "down") => void;
  onSwapExercise: (
    dayId: string,
    itemId: string,
    newExercise: Exercise,
  ) => void;
  onDeleteItem: (dayId: string, itemId: string) => void;
  onAddExercise: (dayId: string, exercise: Exercise) => void;
  onEditItem: (item: ItemWithExercise) => void;
}

export function DayCard({
  day,
  allExercises,
  onMove,
  onSwapExercise,
  onDeleteItem,
  onAddExercise,
  onEditItem,
}: DayCardProps) {
  return (
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
          <PlanItem
            key={item.id}
            item={item}
            idx={idx}
            totalItems={day.items.length}
            dayId={day.id}
            onMove={onMove}
            onSwap={onSwapExercise}
            onEdit={onEditItem}
            onDelete={onDeleteItem}
            allExercises={allExercises}
          />
        ))}

        <div className="pt-2">
          <ExerciseSelector
            exercises={allExercises}
            onSelect={(ex) => onAddExercise(day.id, ex)}
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
  );
}
