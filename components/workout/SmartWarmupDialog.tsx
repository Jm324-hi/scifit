"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Play, Activity, Flame, ChevronRight, CheckCircle2 } from "lucide-react";
import type { Exercise } from "@/lib/exercise-substitution";
import { Badge } from "@/components/ui/badge";

interface SmartWarmupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plannedExercises: Exercise[];
  onStartWorkout: () => void;
}

interface WarmupMove {
  name: string;
  duration: string;
  reps: string;
  focus: string;
  description: string;
}

function generateWarmup(exercises: Exercise[]): WarmupMove[] {
  const moves: WarmupMove[] = [];
  const patterns = new Set(exercises.map((e) => e.movement_pattern));
  const primaryMuscles = new Set(exercises.map((e) => e.primary_muscle));

  // General cardiovascular/body temp
  moves.push({
    name: "Jumping Jacks or High Knees",
    duration: "2 mins",
    reps: "Continuous",
    focus: "body_temp",
    description: "Light cardio to raise core body temperature.",
  });

  if (patterns.has("squat") || primaryMuscles.has("quads") || primaryMuscles.has("glutes")) {
    moves.push({
      name: "Bodyweight Squats",
      duration: "1 min",
      reps: "15 reps",
      focus: "lower_body",
      description: "Focus on depth and opening the hips.",
    });
    moves.push({
      name: "Leg Swings (Front & Side)",
      duration: "1 min",
      reps: "10 per leg",
      focus: "mobility",
      description: "Dynamic stretching for the hip flexors and hamstrings.",
    });
  }

  if (patterns.has("hinge") || primaryMuscles.has("hamstrings")) {
    moves.push({
      name: "Hip Hinges / Good Mornings",
      duration: "1 min",
      reps: "15 reps",
      focus: "posterior_chain",
      description: "Push hips back until you feel a hamstring stretch.",
    });
  }

  if (patterns.has("push") || primaryMuscles.has("chest") || primaryMuscles.has("shoulders")) {
    moves.push({
      name: "Arm Circles & Arm Crosses",
      duration: "1 min",
      reps: "20 reps",
      focus: "shoulders",
      description: "Warm up the shoulder capsule.",
    });
    moves.push({
      name: "Push-up to Downward Dog",
      duration: "1 min",
      reps: "8-10 reps",
      focus: "chest_mobility",
      description: "Stretch the chest and engage the pressing muscles.",
    });
  }

  if (patterns.has("pull") || primaryMuscles.has("back")) {
    moves.push({
      name: "Band Pull-Aparts",
      duration: "1 min",
      reps: "15-20 reps",
      focus: "upper_back",
      description: "Activate the rear delts and rhomboids.",
    });
    moves.push({
      name: "Cat-Cow Stretch",
      duration: "1 min",
      reps: "10 cycles",
      focus: "spine_mobility",
      description: "Improve thoracic spine mobility.",
    });
  }

  // Core is always good
  moves.push({
    name: "Plank Walkouts",
    duration: "1 min",
    reps: "5-8 reps",
    focus: "core",
    description: "Activate the core and stabilize the spine.",
  });

  // Limit to 4-5 key moves
  return moves.slice(0, 5);
}

export function SmartWarmupDialog({
  open,
  onOpenChange,
  plannedExercises,
  onStartWorkout,
}: SmartWarmupDialogProps) {
  const [step, setStep] = useState<"intro" | "moves" | "ready">("intro");
  
  const moves = generateWarmup(plannedExercises);

  const handleNext = () => {
    if (step === "intro") setStep("moves");
    else if (step === "moves") setStep("ready");
    else {
      onOpenChange(false);
      onStartWorkout();
      // Reset after a delay
      setTimeout(() => setStep("intro"), 500);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => {
      onOpenChange(v);
      if (!v) setTimeout(() => setStep("intro"), 500);
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flame className="size-5 text-orange-500" />
            Smart Warm-up
          </DialogTitle>
          <DialogDescription>
            Dynamic preparation based on today&apos;s specific exercises.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {step === "intro" && (
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="rounded-full bg-orange-500/10 p-4">
                <Activity className="size-8 text-orange-500" />
              </div>
              <p className="text-sm">
                We&apos;ve analyzed your {plannedExercises.length} planned exercises for today and generated a specific warm-up routine to prevent injury and maximize performance.
              </p>
              <div className="flex flex-wrap justify-center gap-1 mt-2">
                {Array.from(new Set(plannedExercises.map((e) => e.primary_muscle))).map((m) => (
                  <Badge key={m} variant="secondary" className="capitalize">Target: {m}</Badge>
                ))}
              </div>
            </div>
          )}

          {step === "moves" && (
            <div className="space-y-4">
              <p className="text-sm font-medium mb-2">Perform these {moves.length} moves:</p>
              <div className="space-y-3">
                {moves.map((move, i) => (
                  <div key={i} className="flex gap-3 text-sm">
                    <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted font-semibold">
                      {i + 1}
                    </div>
                    <div>
                      <p className="font-semibold">{move.name}</p>
                      <p className="text-muted-foreground text-xs">{move.reps} &middot; {move.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === "ready" && (
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="rounded-full bg-green-500/10 p-4">
                <CheckCircle2 className="size-8 text-green-500" />
              </div>
              <p className="text-sm">
                You&apos;re warmed up and ready to crush your workout!
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-col gap-2">
          <Button onClick={handleNext} className="w-full">
            {step === "ready" ? (
              <>
                <Play className="size-4 mr-2" />
                Start Workout Now
              </>
            ) : (
              <>
                {step === "intro" ? "View Warm-up Routine" : "I'm Warm"}
                <ChevronRight className="size-4 ml-2" />
              </>
            )}
          </Button>
          {step !== "ready" && (
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => {
                onOpenChange(false);
                onStartWorkout();
              }}
            >
              Skip Warm-up
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
