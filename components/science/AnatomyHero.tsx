"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Body, { type Slug } from "react-muscle-highlighter";
import { cn } from "@/lib/utils";

type Group = {
  slug: Slug;
  name: string;
  side: "front" | "back";
  note: string;
};

const groups: Group[] = [
  { slug: "chest", name: "Chest", side: "front", note: "Pressing power — built with push patterns and progressive load." },
  { slug: "deltoids", name: "Shoulders", side: "front", note: "Trained for strength and protected with quality movement." },
  { slug: "biceps", name: "Biceps", side: "front", note: "Pulling and elbow strength, progressed gradually." },
  { slug: "abs", name: "Core", side: "front", note: "Stability for every lift — the base for safe loading." },
  { slug: "quadriceps", name: "Quads", side: "front", note: "Squat and knee strength, eased back carefully after layoffs." },
  { slug: "trapezius", name: "Traps", side: "back", note: "Posture and carry strength across the upper back." },
  { slug: "upper-back", name: "Back", side: "back", note: "Pulling foundation that keeps the shoulders healthy." },
  { slug: "gluteal", name: "Glutes", side: "back", note: "The engine for hinging, sprinting, and hip power." },
  { slug: "hamstring", name: "Hamstrings", side: "back", note: "Key for hip health and resilient, injury-resistant knees." },
  { slug: "calves", name: "Calves", side: "back", note: "Lower-leg drive and ankle stability." },
];

export default function AnatomyHero() {
  const [side, setSide] = useState<"front" | "back">("front");
  const [selected, setSelected] = useState<Slug | null>("chest");

  const selectedGroup = groups.find((g) => g.slug === selected) ?? null;

  function pick(g: Group) {
    setSide(g.side);
    setSelected(g.slug);
  }

  return (
    <div className="flex flex-col items-center gap-5">
      {/* front / back toggle */}
      <div className="inline-flex rounded-full border border-white/15 bg-white/5 p-1 text-sm backdrop-blur">
        {(["front", "back"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setSide(s)}
            className={cn(
              "rounded-full px-4 py-1 capitalize transition-colors",
              side === s
                ? "bg-sky-500 text-white"
                : "text-white/60 hover:text-white",
            )}
          >
            {s}
          </button>
        ))}
      </div>

      {/* figure */}
      <div className="relative flex h-[360px] items-center justify-center">
        <Body
          side={side}
          gender="male"
          scale={0.9}
          border="none"
          defaultFill="#6b7480"
          defaultStroke="#0b1220"
          defaultStrokeWidth={0.5}
          colors={["#38bdf8", "#0ea5e9"]}
          data={
            selected
              ? [{ slug: selected, intensity: 2, color: "#0ea5e9" }]
              : []
          }
          onBodyPartPress={(p) => {
            if (p.slug) setSelected(p.slug);
          }}
        />
      </div>

      {/* selected info */}
      <motion.div
        key={selectedGroup?.slug ?? "none"}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="min-h-[3.5rem] max-w-sm text-center"
      >
        {selectedGroup ? (
          <>
            <p className="font-semibold text-sky-300">{selectedGroup.name}</p>
            <p className="mt-0.5 text-sm leading-snug text-white/70">
              {selectedGroup.note}
            </p>
          </>
        ) : (
          <p className="text-sm text-white/60">
            Tap a muscle, or a label below, to explore.
          </p>
        )}
      </motion.div>

      {/* labels */}
      <div className="flex flex-wrap justify-center gap-2">
        {groups.map((g) => (
          <button
            key={g.slug}
            onClick={() => pick(g)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              selected === g.slug
                ? "border-sky-400 bg-sky-500/20 text-sky-200"
                : "border-white/15 text-white/55 hover:border-white/40 hover:text-white/80",
            )}
          >
            {g.name}
          </button>
        ))}
      </div>
    </div>
  );
}
