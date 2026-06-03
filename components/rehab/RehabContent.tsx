"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CalendarCheck,
  Dumbbell,
  Heart,
  HeartPulse,
  Repeat,
  Shield,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import BodyPartSelector from "./BodyPartSelector";
import SorenessCheck from "./SorenessCheck";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
};

const continuum = [
  {
    stage: "Prevent",
    icon: Shield,
    text: "Build capacity before breakdown — address weak links early.",
    color: "bg-slate-500",
    hover: "hover:bg-slate-400",
    anchor: "#prevent",
  },
  {
    stage: "Rehab",
    icon: Heart,
    text: "Reintroduce load safely after injury, guided by daily response.",
    color: "bg-emerald-500",
    hover: "hover:bg-emerald-400",
    anchor: "#body-selector",
  },
  {
    stage: "Rebuild",
    icon: Repeat,
    text: "Restore strength and work capacity with structured progression.",
    color: "bg-sky-500",
    hover: "hover:bg-sky-400",
    anchor: "#templates",
  },
  {
    stage: "Train",
    icon: Dumbbell,
    text: "Consistent, measurable training — volume you can sustain.",
    color: "bg-indigo-500",
    hover: "hover:bg-indigo-400",
    anchor: "#soreness-check",
  },
  {
    stage: "Perform",
    icon: Target,
    text: "Return to sport and peak — without setting yourself back.",
    color: "bg-violet-500",
    hover: "hover:bg-violet-400",
    anchor: "#cta",
  },
];

const loadTemplates = [
  {
    title: "Achilles tendinopathy",
    subtitle: "Alfredson-style progression",
    accent: "border-l-amber-500",
    badge: "bg-amber-500/10 text-amber-800 dark:text-amber-300",
    phases: [
      { label: "Isometric holds", detail: "45 sec × 4–5, pain ≤ 4/10" },
      { label: "Bilateral eccentrics", detail: "3 × 15 off step, 3 sec down" },
      { label: "Single-leg strength", detail: "3 × 8–12, add load in backpack" },
      { label: "Plyo & run", detail: "Hop test clear → 10% weekly volume" },
    ],
  },
  {
    title: "Patellar tendinopathy",
    subtitle: "Heavy-slow resistance (HSR)",
    accent: "border-l-sky-500",
    badge: "bg-sky-500/10 text-sky-800 dark:text-sky-300",
    phases: [
      { label: "Isometrics", detail: "Spanish squat 45 sec × 3" },
      { label: "HSR loading", detail: "4 sec up/down, 4 × 6 at RPE 8" },
      { label: "Energy storage", detail: "Slow jumps, no sharp knee pain" },
      { label: "Sport return", detail: "Full training when morning pain ≤ 2" },
    ],
  },
  {
    title: "Rotator cuff",
    subtitle: "Band & scaption progression",
    accent: "border-l-violet-500",
    badge: "bg-violet-500/10 text-violet-800 dark:text-violet-300",
    phases: [
      { label: "Activation", detail: "Y-T-W + ER 2× daily" },
      { label: "Scaption & press", detail: "Below shoulder height first" },
      { label: "Overhead volume", detail: "Gradual load, no night pain" },
      { label: "Performance", detail: "Strength within 10% uninjured side" },
    ],
  },
];

// 4 weeks × 7 days — static adherence heatmap (0–3 intensity)
const heatmapWeeks = [
  [2, 3, 2, 3, 3, 1, 0],
  [3, 3, 2, 3, 2, 3, 1],
  [2, 3, 3, 3, 3, 2, 0],
  [3, 3, 2, 3, 3, 2, 1],
];

const heatmapIntensity: Record<number, string> = {
  0: "bg-muted",
  1: "bg-emerald-200 dark:bg-emerald-900/40",
  2: "bg-emerald-400/70 dark:bg-emerald-700/60",
  3: "bg-emerald-500 dark:bg-emerald-500",
};

function Section({
  children,
  className,
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <motion.section
      id={id}
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.section>
  );
}

export default function RehabContent() {
  const todayIndex = 26; // last cell in 4×7 grid as "today"

  return (
    <div className="space-y-24 py-8">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl border">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 90% at 80% 20%, #0e2e44 0%, #07182a 55%, #040d18 100%)",
          }}
        />
        <div className="relative px-6 py-12 sm:px-10 sm:py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-sm text-white/70 backdrop-blur">
              <HeartPulse className="size-3.5 text-sky-400" />
              Remote rehab & prevention
            </div>
            <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
              Recover smart.{" "}
              <span className="text-sky-400">Stay in the game.</span>
            </h1>
            <p className="mt-4 max-w-lg text-lg text-white/70">
              Evidence-based home rehab and injury prevention — guided remotely.
            </p>
          </motion.div>

          {/* Color continuum strip */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mt-10 grid grid-cols-2 gap-2 sm:grid-cols-5 sm:gap-0 sm:overflow-hidden sm:rounded-xl sm:border sm:border-white/10"
          >
            {continuum.map((c) => (
              <a
                key={c.stage}
                href={c.anchor}
                className={cn(
                  "group flex flex-col gap-2 rounded-lg p-3 text-white transition-transform sm:rounded-none sm:p-4",
                  c.color,
                  c.hover,
                  "sm:first:rounded-l-xl sm:last:rounded-r-xl",
                )}
              >
                <c.icon className="size-5 opacity-90" />
                <span className="text-sm font-bold">{c.stage}</span>
                <span className="text-[11px] leading-snug text-white/80 opacity-0 transition-opacity group-hover:opacity-100 sm:line-clamp-2">
                  {c.text}
                </span>
              </a>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Body part selector */}
      <Section id="body-selector" className="space-y-8">
        <div className="space-y-2 text-center">
          <h2 className="text-3xl font-bold tracking-tight">
            Where does it bother you?
          </h2>
          <p className="mx-auto max-w-xl text-muted-foreground">
            Pick an area — get foam rolling, activation, and loading steps in
            one place. Like a pocket rehab library.
          </p>
        </div>
        <BodyPartSelector />
      </Section>

      {/* Soreness check */}
      <Section id="soreness-check" className="space-y-8">
        <div className="space-y-2 text-center">
          <h2 className="text-3xl font-bold tracking-tight">
            Should you train today?
          </h2>
          <p className="mx-auto max-w-xl text-muted-foreground">
            Pain and sleep shape the call — no account needed, instant guidance.
          </p>
        </div>
        <SorenessCheck />
      </Section>

      {/* Load templates */}
      <Section id="templates" className="space-y-10">
        <div className="space-y-2 text-center">
          <h2 className="text-3xl font-bold tracking-tight">
            Progressive loading examples
          </h2>
          <p className="mx-auto max-w-xl text-muted-foreground">
            Classic telerehab progressions — illustrative only, not a prescription.
          </p>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          {loadTemplates.map((t) => (
            <Card
              key={t.title}
              className={cn(
                "overflow-hidden border-border/60 border-l-4",
                t.accent,
              )}
            >
              <CardHeader>
                <Badge className={cn("w-fit border-0", t.badge)}>
                  Illustrative example
                </Badge>
                <CardTitle className="text-lg">{t.title}</CardTitle>
                <p className="text-sm text-muted-foreground">{t.subtitle}</p>
              </CardHeader>
              <CardContent className="space-y-3">
                {t.phases.map((ph, i) => (
                  <div key={ph.label} className="flex gap-3">
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold">
                      {i + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{ph.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {ph.detail}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>

      {/* Adherence */}
      <Section id="prevent" className="space-y-8">
        <div className="space-y-2 text-center">
          <h2 className="text-3xl font-bold tracking-tight">
            Consistency beats intensity
          </h2>
          <p className="mx-auto max-w-xl text-muted-foreground">
            Small, frequent doses build resilient tissue — adherence matters as
            much as the exercises.
          </p>
        </div>
        <Card className="overflow-hidden border-border/60">
          <CardContent className="grid gap-8 p-6 sm:grid-cols-[1fr_auto] sm:p-8">
            <div>
              <p className="mb-3 text-sm font-medium text-muted-foreground">
                Last 4 weeks (example)
              </p>
              <div className="grid grid-cols-7 gap-1.5">
                {heatmapWeeks.flat().map((level, i) => (
                  <div
                    key={i}
                    className={cn(
                      "aspect-square rounded-sm",
                      heatmapIntensity[level],
                      i === todayIndex &&
                        "ring-2 ring-sky-500 ring-offset-2 ring-offset-background",
                    )}
                    title={i === todayIndex ? "Today" : undefined}
                  />
                ))}
              </div>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                Consistency beats intensity. Small, frequent doses build
                resilient tissue.
              </p>
            </div>
            <div className="flex flex-col gap-4 sm:min-w-[180px]">
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4">
                <CalendarCheck className="size-5 text-emerald-600 dark:text-emerald-400" />
                <p className="mt-2 text-2xl font-bold tabular-nums">12</p>
                <p className="text-xs text-muted-foreground">day streak</p>
              </div>
              <div className="rounded-xl border border-sky-500/30 bg-sky-500/5 p-4">
                <TrendingUp className="size-5 text-sky-600 dark:text-sky-400" />
                <p className="mt-2 text-2xl font-bold tabular-nums">87%</p>
                <p className="text-xs text-muted-foreground">adherence</p>
              </div>
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
                <Sparkles className="size-5 text-amber-600 dark:text-amber-400" />
                <p className="mt-2 text-2xl font-bold tabular-nums">4/5</p>
                <p className="text-xs text-muted-foreground">this week</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </Section>

      {/* Scope */}
      <Section>
        <div className="rounded-2xl border bg-muted/30 p-6 text-sm leading-relaxed text-muted-foreground">
          <p className="mb-1 font-semibold text-foreground">A note on scope</p>
          Kineroz provides educational, general fitness and rehab guidance grounded
          in exercise-science principles. It is not a medical device and does not
          replace personalized advice from a physician, physical therapist, or
          other qualified healthcare professional — especially if you are
          recovering from an injury. Always seek clearance before returning to
          training after an injury.
        </div>
      </Section>

      {/* CTA */}
      <Section
        id="cta"
        className="flex flex-col items-center gap-6 rounded-2xl border bg-muted/30 px-6 py-16 text-center"
      >
        <h2 className="max-w-lg text-3xl font-bold tracking-tight">
          Start your return-to-performance journey
        </h2>
        <p className="max-w-md text-muted-foreground">
          Get a plan that respects where you are today — and progresses when
          you&apos;re ready.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg" className="text-base">
            <Link href="/register">
              Start Free
              <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="text-base">
            <Link href="/science">
              Explore the science
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </Section>
    </div>
  );
}
