"use client";

import { useState, useMemo } from "react";
import { ArrowLeftRight, Star } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { findSubstitutes, type Exercise } from "@/lib/exercise-substitution";

function DifficultyStars({ level }: { level: number }) {
  return (
    <span className="inline-flex gap-0.5" aria-label={`Difficulty ${level} of 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`size-3 ${
            i < level
              ? "fill-amber-400 text-amber-400"
              : "fill-muted text-muted"
          }`}
        />
      ))}
    </span>
  );
}

interface ExerciseSubstituteProps {
  exercise: Exercise;
  allExercises: Exercise[];
  userEquipment?: string[];
  onSwap: (newExercise: Exercise) => void;
  trigger?: React.ReactNode;
}

export function ExerciseSubstitute({
  exercise,
  allExercises,
  userEquipment,
  onSwap,
  trigger,
}: ExerciseSubstituteProps) {
  const [open, setOpen] = useState(false);

  const substitutes = useMemo(
    () => findSubstitutes(exercise, allExercises, userEquipment),
    [exercise, allExercises, userEquipment]
  );

  function handleSwap(sub: Exercise) {
    onSwap(sub);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="ghost" size="sm">
            <ArrowLeftRight className="size-4" />
            Swap Exercise
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Swap Exercise</DialogTitle>
          <DialogDescription>
            Choose a substitute for{" "}
            <span className="font-semibold text-foreground">
              {exercise.name}
            </span>
          </DialogDescription>
        </DialogHeader>

        {substitutes.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No substitutes found for this exercise.
          </p>
        ) : (
          <ul className="divide-y -mx-6 px-6">
            {substitutes.map((sub) => (
              <li key={sub.id}>
                <button
                  type="button"
                  className="flex w-full items-center gap-3 py-3 px-1 text-left transition-colors hover:bg-accent/50 rounded-md"
                  onClick={() => handleSwap(sub)}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium leading-tight">{sub.name}</p>
                    <div className="mt-1 flex items-center gap-1.5">
                      <Badge
                        variant="outline"
                        className="capitalize text-[11px]"
                      >
                        {sub.equipment}
                      </Badge>
                      <DifficultyStars level={sub.difficulty} />
                    </div>
                  </div>
                  <ArrowLeftRight className="size-4 shrink-0 text-muted-foreground" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </DialogContent>
    </Dialog>
  );
}
