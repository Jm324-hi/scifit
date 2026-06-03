"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Moon, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { AVAILABLE_PARTS, type BodyPartId } from "./body-parts-data";

type Sleep = "poor" | "ok" | "good";

type CallLevel = "green" | "yellow" | "red";

const sleepOptions: { id: Sleep; label: string }[] = [
  { id: "poor", label: "Poor" },
  { id: "ok", label: "OK" },
  { id: "good", label: "Good" },
];

function getCall(pain: number, sleep: Sleep): {
  level: CallLevel;
  title: string;
  body: string;
  actions: string[];
} {
  let level: CallLevel = "green";
  if (pain >= 6) level = "red";
  else if (pain >= 3) level = "yellow";

  if (sleep === "poor" && level === "green") level = "yellow";
  if (sleep === "poor" && level === "yellow") level = "red";

  if (level === "green") {
    return {
      level,
      title: "Train as planned",
      body: "Pain is low and recovery looks adequate. Stick to your programmed session — log RPE so load stays honest.",
      actions: [
        "Complete planned sets at target RPE",
        "5 min mobility cooldown if tight",
        "Re-check pain tomorrow morning",
      ],
    };
  }
  if (level === "yellow") {
    return {
      level,
      title: "Modify — reduce load ~20%",
      body: "Some irritation or poor sleep — keep moving but protect tissue. Technique and tempo over weight.",
      actions: [
        "Drop sets or load by ~20%",
        "Swap impact for low-impact options",
        "Prioritize mobility tab for your area",
      ],
    };
  }
  return {
    level: "red",
    title: "Active recovery only",
    body: "Pain is elevated or recovery is compromised. Skip heavy training today — walk, breathe, gentle mobility.",
    actions: [
      "20–30 min easy walk or bike",
      "Mobility & foam roll only (no max effort)",
      "If pain persists >72h or worsens → clinician",
    ],
  };
}

const levelStyles: Record<
  CallLevel,
  { border: string; bg: string; title: string; dot: string }
> = {
  green: {
    border: "border-emerald-500/40",
    bg: "bg-emerald-500/5",
    title: "text-emerald-700 dark:text-emerald-400",
    dot: "bg-emerald-500",
  },
  yellow: {
    border: "border-amber-500/40",
    bg: "bg-amber-500/5",
    title: "text-amber-700 dark:text-amber-400",
    dot: "bg-amber-500",
  },
  red: {
    border: "border-red-500/40",
    bg: "bg-red-500/5",
    title: "text-red-700 dark:text-red-400",
    dot: "bg-red-500",
  },
};

export default function SorenessCheck() {
  const [part, setPart] = useState<BodyPartId>("knee");
  const [pain, setPain] = useState([2]);
  const [sleep, setSleep] = useState<Sleep>("ok");
  const [showResult, setShowResult] = useState(false);

  const painValue = pain[0] ?? 0;
  const result = useMemo(
    () => getCall(painValue, sleep),
    [painValue, sleep],
  );
  const styles = levelStyles[result.level];

  const sliderAccent =
    painValue <= 2
      ? "[&_[data-slot=slider-range]]:bg-emerald-500"
      : painValue <= 5
        ? "[&_[data-slot=slider-range]]:bg-amber-500"
        : "[&_[data-slot=slider-range]]:bg-red-500";

  return (
    <Card className="overflow-hidden border-border/60">
      <div className="border-b bg-gradient-to-r from-indigo-500/10 via-sky-500/10 to-violet-500/10 px-6 py-5">
        <div className="flex items-center gap-2">
          <Stethoscope className="size-5 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-lg font-semibold">Today&apos;s training call</h3>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Quick check — like a mini readiness screen. Rule-of-thumb only.
        </p>
      </div>

      <div className="space-y-6 p-6">
        <div className="space-y-2">
          <p className="text-sm font-medium">Area of focus</p>
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_PARTS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  setPart(p.id);
                  setShowResult(false);
                }}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium transition-all",
                  part === p.id ? p.chipActive : p.chipColor,
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Current pain (0–10)</p>
            <span
              className={cn(
                "rounded-md px-2 py-0.5 text-sm font-bold tabular-nums",
                painValue <= 2 && "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
                painValue >= 3 &&
                  painValue <= 5 &&
                  "bg-amber-500/15 text-amber-700 dark:text-amber-400",
                painValue >= 6 && "bg-red-500/15 text-red-700 dark:text-red-400",
              )}
            >
              {painValue}
            </span>
          </div>
          <Slider
            value={pain}
            onValueChange={(v) => {
              setPain(v);
              setShowResult(false);
            }}
            min={0}
            max={10}
            step={1}
            className={cn("py-2", sliderAccent)}
          />
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>None</span>
            <span>Moderate</span>
            <span>Severe</span>
          </div>
        </div>

        <div className="space-y-2">
          <p className="flex items-center gap-1.5 text-sm font-medium">
            <Moon className="size-3.5" />
            Last night&apos;s sleep
          </p>
          <div className="inline-flex rounded-lg border p-1">
            {sleepOptions.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  setSleep(opt.id);
                  setShowResult(false);
                }}
                className={cn(
                  "rounded-md px-4 py-1.5 text-sm font-medium transition-colors",
                  sleep === opt.id
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <Button
          className="w-full sm:w-auto"
          onClick={() => setShowResult(true)}
        >
          <Activity className="size-4" />
          Get today&apos;s call
        </Button>

        <AnimatePresence>
          {showResult && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className={cn(
                "overflow-hidden rounded-xl border p-5",
                styles.border,
                styles.bg,
              )}
            >
              <div className="flex items-center gap-2">
                <span
                  className={cn("size-2.5 rounded-full", styles.dot)}
                />
                <p className={cn("font-semibold", styles.title)}>
                  {result.title}
                </p>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {result.body}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Focus area:{" "}
                <span className="font-medium text-foreground">
                  {AVAILABLE_PARTS.find((p) => p.id === part)?.label}
                </span>
              </p>
              <ul className="mt-3 space-y-1.5">
                {result.actions.map((a) => (
                  <li
                    key={a}
                    className="flex gap-2 text-sm text-muted-foreground"
                  >
                    <span className="text-primary">•</span>
                    {a}
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>

        <p className="text-xs text-muted-foreground">
          Rule-of-thumb only — pain that lingers &gt;72h or worsens needs a
          clinician.
        </p>
      </div>
    </Card>
  );
}