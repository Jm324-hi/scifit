"use client";

import { Timer, Play, Pause, RotateCcw, Info, TrendingUp, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { ExerciseGroup, SetRecord } from "./types";
import type { PlanItemTarget } from "@/lib/progression-engine";

const REST_PRESETS = [60, 90, 120, 180];

function formatTimer(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

interface LastRecord {
  weight: number | null;
  reps: number[];
}

interface RestTimerProps {
  restDuration: number;
  restRemaining: number;
  restActive: boolean;
  restDone: boolean;
  onPresetSelect: (seconds: number) => void;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;

  // New props for Enhanced Info Panel
  currentGroup?: ExerciseGroup;
  lastRecord?: LastRecord | null;
  planItem?: PlanItemTarget;
}

export function RestTimer({
  restDuration,
  restRemaining,
  restActive,
  restDone,
  onPresetSelect,
  onStart,
  onPause,
  onReset,
  currentGroup,
  lastRecord,
  planItem,
}: RestTimerProps) {
  const showPanel = (restActive || restDone) && currentGroup;

  // Calculate dynamic suggestion based on last completed set
  let suggestion = null;
  if (currentGroup) {
    const completedSets = currentGroup.sets.filter((s) => s.completed && s.weight != null && s.reps != null);
    if (completedSets.length > 0) {
      const lastSet = completedSets[completedSets.length - 1];
      const targetRpe = planItem?.target_rpe || 8;
      const targetRepsMax = planItem?.rep_range_max || 12;

      if (lastSet.rpe && lastSet.rpe < targetRpe - 1) {
        suggestion = `RPE was ${lastSet.rpe}. Consider adding 2.5kg for the next set.`;
      } else if (lastSet.rpe && lastSet.rpe > targetRpe + 1) {
        suggestion = `RPE was ${lastSet.rpe}. Consider dropping weight to maintain form.`;
      } else if ((lastSet.reps || 0) >= targetRepsMax) {
        suggestion = `Hit top of rep range! Ready for a weight increase.`;
      }
    }
  }

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 border-t transition-colors ${
        restDone
          ? "border-green-300 dark:border-green-800"
          : "border-border"
      }`}
    >
      {/* Enhanced Info Panel */}
      {showPanel && (
        <div className="border-b px-4 py-3 bg-muted/20">
          <div className="mx-auto max-w-5xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">{currentGroup.exercise.name}</span>
              {planItem && (
                <span className="text-xs text-muted-foreground">
                  Target: {planItem.rep_range_min}-{planItem.rep_range_max} reps @ RPE {planItem.target_rpe}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {lastRecord && lastRecord.weight && (
                <div className="flex gap-2 text-xs rounded border p-2 bg-background/50">
                  <History className="size-4 shrink-0 text-blue-500" />
                  <div>
                    <p className="font-medium text-blue-500">Last Session PR</p>
                    <p className="text-muted-foreground">{lastRecord.weight}kg x {Math.max(...lastRecord.reps)}</p>
                  </div>
                </div>
              )}

              {suggestion && (
                <div className="flex gap-2 text-xs rounded border p-2 bg-background/50">
                  <TrendingUp className="size-4 shrink-0 text-orange-500" />
                  <div>
                    <p className="font-medium text-orange-500">AI Suggestion</p>
                    <p className="text-muted-foreground">{suggestion}</p>
                  </div>
                </div>
              )}

              {currentGroup.exercise.tips && (
                <div className="flex gap-2 text-xs rounded border p-2 bg-background/50 sm:col-span-2 lg:col-span-1">
                  <Info className="size-4 shrink-0 text-primary" />
                  <div>
                    <p className="font-medium text-primary">Form Tip</p>
                    <p className="text-muted-foreground truncate" title={currentGroup.exercise.tips}>
                      {currentGroup.exercise.tips}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Timer Controls */}
      <div
        className={`px-3 py-2.5 sm:px-4 sm:py-3 transition-colors ${
          restDone
            ? "bg-green-50 dark:bg-green-950/40"
            : "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80"
        }`}
      >
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-2 sm:gap-3">
          <div className="flex items-center gap-2">
            <Timer
              className={`size-5 shrink-0 ${restDone ? "text-green-600" : "text-muted-foreground"}`}
            />
            <span
              className={`font-mono text-2xl font-bold tabular-nums sm:text-3xl ${
                restDone
                  ? "text-green-600"
                  : restActive
                    ? "text-foreground"
                    : "text-muted-foreground"
              }`}
            >
              {formatTimer(restRemaining)}
            </span>
            {restDone && (
              <Badge className="hidden animate-pulse bg-green-600 text-white sm:inline-flex">
                Rest Complete!
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <div className="flex gap-0.5 sm:gap-1">
              {REST_PRESETS.map((t) => (
                <Button
                  key={t}
                  variant={restDuration === t ? "secondary" : "ghost"}
                  size="xs"
                  className="min-w-0 px-1.5 text-xs sm:px-2"
                  onClick={() => onPresetSelect(t)}
                >
                  {t >= 60 ? `${t / 60}m` : `${t}s`}
                </Button>
              ))}
            </div>

            {restActive ? (
              <Button variant="outline" size="icon-sm" onClick={onPause}>
                <Pause className="size-4" />
              </Button>
            ) : (
              <Button
                variant="outline"
                size="icon-sm"
                onClick={onStart}
              >
                <Play className="size-4" />
              </Button>
            )}
            <Button variant="ghost" size="icon-sm" onClick={onReset}>
              <RotateCcw className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
