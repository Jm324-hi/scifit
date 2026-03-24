"use client";

import { Timer, Play, Pause, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const REST_PRESETS = [60, 90, 120, 180];

function formatTimer(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
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
}: RestTimerProps) {
  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 border-t px-3 py-2.5 transition-colors sm:px-4 sm:py-3 ${
        restDone
          ? "border-green-300 bg-green-50 dark:border-green-800 dark:bg-green-950/40"
          : "border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80"
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
  );
}
