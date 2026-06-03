"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import AnatomyHero from "./AnatomyHero";
import {
  Activity,
  ArrowRight,
  BarChart3,
  CalendarDays,
  ClipboardList,
  Dumbbell,
  Gauge,
  Heart,
  Layers,
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

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
};

const fittvp = [
  {
    letter: "F",
    name: "Frequency",
    icon: CalendarDays,
    short: "How often you train",
    detail:
      "Kineroz sets your weekly frequency from your schedule and goal, making sure every major muscle group is trained at least twice a week — the threshold most associated with meaningful gains.",
  },
  {
    letter: "I",
    name: "Intensity",
    icon: Gauge,
    short: "How hard each set is",
    detail:
      "Effort is tracked through RPE and load relative to your capacity, then automatically dialed up or down based on your daily readiness score.",
  },
  {
    letter: "T",
    name: "Time",
    icon: Activity,
    short: "Session duration",
    detail:
      "Plans fit the time you actually have. Volume is trimmed or expanded so a session stays realistic instead of aspirational.",
  },
  {
    letter: "T",
    name: "Type",
    icon: Dumbbell,
    short: "Exercise selection",
    detail:
      "Movements are chosen for your equipment, experience, and any areas you are protecting — with safer substitutions available at any time.",
  },
  {
    letter: "V",
    name: "Volume",
    icon: Layers,
    short: "Total work performed",
    detail:
      "Sets times reps, scaled to your goal — for example more weekly sets when the target is muscle growth — and pulled back when recovery dips.",
  },
  {
    letter: "P",
    name: "Progression",
    icon: TrendingUp,
    short: "How the plan advances",
    detail:
      "Progressive overload is applied gradually across weeks and eased during low-recovery periods, so you keep adapting without breaking down.",
  },
];

const continuum = [
  {
    stage: "Prevent",
    icon: Shield,
    text: "Build resilient capacity and address weak links before problems start.",
  },
  {
    stage: "Rehab",
    icon: Heart,
    text: "Reintroduce load safely after injury, guided by how you respond day to day.",
  },
  {
    stage: "Rebuild",
    icon: Repeat,
    text: "Restore strength and work capacity with structured, progressive loading.",
  },
  {
    stage: "Train",
    icon: Dumbbell,
    text: "Drive consistent, measurable gains with evidence-based programming.",
  },
  {
    stage: "Perform",
    icon: Target,
    text: "Peak, maintain, and keep training hard without setting yourself back.",
  },
];

const mappings = [
  {
    icon: ClipboardList,
    principle: "Evidence-based prescription (FITT-VP)",
    feature: "Smart Plan Generator",
    text: "Your plan is assembled from the same variables clinicians and coaches manipulate — not a fixed template.",
  },
  {
    icon: Heart,
    principle: "Autoregulation",
    feature: "Recovery check-in & readiness score",
    text: "A daily readiness score adjusts the day's load, the way a good coach would when you walk in tired.",
  },
  {
    icon: Dumbbell,
    principle: "Progressive overload",
    feature: "Workout logger & progression cues",
    text: "Every logged set feeds progression suggestions so the stimulus keeps climbing at a safe rate.",
  },
  {
    icon: BarChart3,
    principle: "Periodization",
    feature: "Plan phases & long-term tracking",
    text: "Structured phases and trend tracking keep you progressing across months, not just single sessions.",
  },
];

function Section({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.section
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

export default function ScienceContent() {
  const [active, setActive] = useState(0);
  const activeItem = fittvp[active];

  return (
    <div className="space-y-24 py-8">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden rounded-3xl border">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 90% at 80% 20%, #0e2e44 0%, #07182a 55%, #040d18 100%)",
          }}
        />
        <div className="relative grid items-center gap-8 px-6 py-12 sm:px-10 sm:py-16 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-sm text-white/70 backdrop-blur">
              <Sparkles className="size-3.5 text-sky-400" />
              The science behind Kineroz
            </div>
            <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
              Lab-grade methods,{" "}
              <span className="text-sky-400">made remote.</span>
            </h1>
            <p className="mt-4 max-w-md text-lg text-white/70">
              From recovery to performance — backed by science.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.15 }}
          >
            <AnatomyHero />
          </motion.div>
        </div>
      </section>

      {/* ── Principles ── */}
      <Section className="space-y-10">
        <div className="space-y-2 text-center">
          <h2 className="text-3xl font-bold tracking-tight">
            The principles we follow
          </h2>
          <p className="mx-auto max-w-xl text-muted-foreground">
            Four ideas underpin every plan, every adjustment, and every
            suggestion Kineroz makes.
          </p>
        </div>

        {/* FITT-VP interactive */}
        <Card className="overflow-hidden border-border/60">
          <CardHeader>
            <Badge variant="secondary" className="w-fit">
              Framework
            </Badge>
            <CardTitle className="text-xl">
              Evidence-based prescription: the FITT-VP model
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              The framework used to design exercise programs — Frequency,
              Intensity, Time, Type, Volume, and Progression. Tap each to see
              how Kineroz applies it.
            </p>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
              {fittvp.map((item, i) => {
                const selected = i === active;
                return (
                  <button
                    key={item.name}
                    onClick={() => setActive(i)}
                    className={cn(
                      "flex flex-col items-center gap-1 rounded-xl border p-3 text-center transition-all",
                      selected
                        ? "border-primary bg-primary/10 text-primary shadow-sm"
                        : "border-border/60 text-muted-foreground hover:border-primary/40 hover:bg-accent",
                    )}
                  >
                    <item.icon className="size-5" />
                    <span className="text-xl font-bold">{item.letter}</span>
                    <span className="text-[11px] font-medium leading-tight">
                      {item.name}
                    </span>
                  </button>
                );
              })}
            </div>

            <motion.div
              key={active}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="rounded-xl border bg-muted/30 p-5"
            >
              <p className="flex items-center gap-2 font-semibold">
                <activeItem.icon className="size-4 text-primary" />
                {activeItem.name}
                <span className="text-sm font-normal text-muted-foreground">
                  — {activeItem.short}
                </span>
              </p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {activeItem.detail}
              </p>
            </motion.div>
          </CardContent>
        </Card>

        {/* Other principles */}
        <div className="grid gap-6 sm:grid-cols-3">
          {[
            {
              icon: Heart,
              title: "Autoregulation",
              text: "Training load adapts to how recovered you actually are — the principle behind clinical telerehabilitation and return-to-train protocols.",
            },
            {
              icon: TrendingUp,
              title: "Progressive overload",
              text: "Gradually increasing the demand on your body over time is the most reliable driver of strength and resilience.",
            },
            {
              icon: BarChart3,
              title: "Periodization",
              text: "Organizing training into structured phases prevents burnout and re-injury while keeping adaptation continuous.",
            },
          ].map((p) => (
            <div
              key={p.title}
              className="space-y-3 rounded-xl border border-border/60 p-6"
            >
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <p.icon className="size-5" />
              </div>
              <h3 className="font-semibold">{p.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {p.text}
              </p>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Continuum ── */}
      <Section className="space-y-10">
        <div className="space-y-2 text-center">
          <h2 className="text-3xl font-bold tracking-tight">
            One continuum, from recovery to performance
          </h2>
          <p className="mx-auto max-w-xl text-muted-foreground">
            Most apps only cover the &quot;train harder&quot; part. Kineroz is
            built around the full arc — so getting hurt, or training around an
            issue, does not mean starting over.
          </p>
        </div>

        <div className="relative">
          <div className="absolute left-0 right-0 top-7 hidden h-0.5 bg-border sm:block" />
          <div className="grid gap-6 sm:grid-cols-5">
            {continuum.map((c, i) => (
              <motion.div
                key={c.stage}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.15, ease: "easeOut" }}
                className="relative flex flex-col items-center gap-3 text-center"
              >
                <div className="relative z-10 flex size-14 items-center justify-center rounded-2xl border-2 border-primary/30 bg-primary/10 text-primary">
                  <c.icon className="size-6" />
                </div>
                <h3 className="font-semibold">{c.stage}</h3>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {c.text}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── Principle → Product ── */}
      <Section className="space-y-10">
        <div className="space-y-2 text-center">
          <h2 className="text-3xl font-bold tracking-tight">
            How the science shows up in the product
          </h2>
          <p className="mx-auto max-w-xl text-muted-foreground">
            Principles only matter if they reach your training. Here is where
            each one lives inside Kineroz.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {mappings.map((m) => (
            <div
              key={m.principle}
              className="flex gap-4 rounded-xl border border-border/60 p-5 transition-all hover:shadow-md"
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <m.icon className="size-5" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {m.principle}
                </p>
                <p className="flex items-center gap-1.5 font-semibold">
                  {m.feature}
                  <ArrowRight className="size-3.5 text-primary" />
                </p>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {m.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Boundary statement ── */}
      <Section>
        <div className="rounded-2xl border bg-muted/30 p-6 text-sm leading-relaxed text-muted-foreground">
          <p className="mb-1 font-semibold text-foreground">
            A note on scope
          </p>
          Kineroz provides educational, general fitness guidance grounded in
          exercise-science principles. It is not a medical device and does not
          replace personalized advice from a physician, physical therapist, or
          other qualified healthcare professional — especially if you are
          recovering from an injury or managing a health condition. Always seek
          clearance before returning to training after an injury.
        </div>
      </Section>

      {/* ── CTA ── */}
      <Section className="flex flex-col items-center gap-6 rounded-2xl border bg-muted/30 px-6 py-16 text-center">
        <h2 className="max-w-lg text-3xl font-bold tracking-tight">
          Train on a foundation you can trust
        </h2>
        <p className="max-w-md text-muted-foreground">
          Get a personalized, science-backed plan that adapts to your recovery —
          and meets you wherever you are on the journey back to performance.
        </p>
        <Button asChild size="lg" className="text-base">
          <Link href="/register">
            Start Free
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </Section>
    </div>
  );
}
