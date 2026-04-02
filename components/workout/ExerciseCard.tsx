"use client";

import { ChevronDown, ChevronRight, Plus, Check, Sparkles } from "lucide-react";
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
import { AiCoachDialog } from "@/components/dynamic-imports";
import { ExerciseSubstitute } from "@/components/ExerciseSubstitute";
import { ExerciseDemoDialog } from "@/components/workout/ExerciseDemoDialog";
import type { Exercise } from "@/lib/exercise-substitution";
import type { ExerciseGroup, SetRecord, LastRecord } from "./types";
import type { PlanItemTarget } from "@/lib/progression-engine";

function formatWeight(weight: number | null): string {
  if (weight == null) return "—";
  if (Number.isInteger(weight)) return `${weight.toFixed(0)}kg`;
  return `${weight.toFixed(2)}kg`;
}

interface ExerciseCardProps {
  group: ExerciseGroup;
  groupIndex: number;
  lastRecord: LastRecord | null;
  planItem: PlanItemTarget | undefined;
  onToggleCollapse: (gi: number) => void;
  onUpdateLocal: (
    gi: number,
    si: number,
    field: keyof SetRecord,
    value: unknown,
  ) => void;
  onSaveField: (setId: string, fields: Record<string, unknown>) => void;
  onToggleComplete: (gi: number, si: number) => void;
  onAddSet: (gi: number) => void;
  onSwap: (gi: number, newEx: Exercise) => void;
  allExercises: Exercise[];
  userIsPro: boolean;
}

export function ExerciseCard({
  group,
  groupIndex,
  lastRecord,
  planItem,
  onToggleCollapse,
  onUpdateLocal,
  onSaveField,
  onToggleComplete,
  onAddSet,
  onSwap,
  allExercises,
  userIsPro,
}: ExerciseCardProps) {
  const g = group;
  const gi = groupIndex;

  return (
    <Card key={`${g.exercise.id}-${gi}`}>
      <CardHeader>
        <CardTitle
          className="flex cursor-pointer items-center gap-2 select-none"
          onClick={() => onToggleCollapse(gi)}
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
          <ExerciseDemoDialog exercise={g.exercise} />
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
              planItem: planItem
                ? {
                    sets: g.sets.length,
                    rep_range_min: planItem.rep_range_min ?? 8,
                    rep_range_max: planItem.rep_range_max ?? 12,
                    target_rpe: planItem.target_rpe ?? 8,
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
            onSwap={(ex) => onSwap(gi, ex)}
          />
        </CardAction>
      </CardHeader>

      {!g.collapsed && (
        <CardContent className="space-y-2">
          {lastRecord && (
            <p className="text-xs text-muted-foreground">
              Last: {formatWeight(lastRecord.weight)} x {lastRecord.reps.join(",")}
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
                  onUpdateLocal(gi, si, "weight", v);
                }}
                onBlur={(e) => {
                  const v =
                    e.target.value === ""
                      ? null
                      : parseFloat(e.target.value);
                  onSaveField(set.id, { weight: v });
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
                  onUpdateLocal(gi, si, "reps", v);
                }}
                onBlur={(e) => {
                  const v =
                    e.target.value === ""
                      ? null
                      : parseInt(e.target.value, 10);
                  onSaveField(set.id, { reps: v });
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
                  onUpdateLocal(gi, si, "rpe", v);
                }}
                onBlur={(e) => {
                  const v =
                    e.target.value === ""
                      ? null
                      : parseInt(e.target.value, 10);
                  onSaveField(set.id, { rpe: v });
                }}
              />
              <button
                type="button"
                onClick={() => onToggleComplete(gi, si)}
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
            onClick={() => onAddSet(gi)}
          >
            <Plus className="size-3" />
            Add Set
          </Button>
        </CardContent>
      )}
    </Card>
  );
}
