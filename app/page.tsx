import Link from "next/link";
import {
  TrendingUp,
  Heart,
  Brain,
  ArrowRight,
  Dumbbell,
  UserPlus,
  ClipboardList,
  Zap,
  Shield,
  BarChart3,
  Clock,
  RefreshCw,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const features = [
  {
    icon: TrendingUp,
    title: "Scientific Progress Engine",
    description:
      "Automatically adjusts volume and intensity based on progressive overload principles. Every session is designed to drive measurable progress.",
  },
  {
    icon: Heart,
    title: "Recovery-Driven Training",
    description:
      "Tracks sleep, stress, and soreness to calculate a readiness score. Your workout intensity adapts to how recovered you actually are.",
  },
  {
    icon: Brain,
    title: "Smart Plan Generator",
    description:
      "Generates a periodized training plan based on your goals, schedule, equipment, and experience level — no guesswork required.",
  },
  {
    icon: Dumbbell,
    title: "Track Everything",
    description:
      "Log every set, rep, and RPE. View personal records, weekly trends, and training streaks — all in one place.",
  },
];

const steps = [
  {
    step: "01",
    icon: UserPlus,
    title: "Sign Up",
    description:
      "Create your free account and tell us about your training goals, experience, and available equipment.",
  },
  {
    step: "02",
    icon: ClipboardList,
    title: "Get Your Plan",
    description:
      "Our plan generator builds a science-backed program tailored to your profile — ready to start immediately.",
  },
  {
    step: "03",
    icon: Zap,
    title: "Train & Progress",
    description:
      "Follow your plan, log recovery, and let the progression engine guide you to consistent, measurable gains.",
  },
];

const trustSignals = [
  { icon: Shield, text: "Personalized plans" },
  { icon: Heart, text: "Recovery-aware" },
  { icon: TrendingUp, text: "Progressive overload logic" },
  { icon: Brain, text: "No guesswork" },
];

const demoPlan = [
  {
    day: "Day 1",
    name: "Upper Push",
    focus: "Chest, Shoulders, Triceps",
    exercises: ["Bench Press", "Overhead Press", "Incline DB Press", "Lateral Raise"],
  },
  {
    day: "Day 2",
    name: "Lower",
    focus: "Quads, Hamstrings, Glutes",
    exercises: ["Barbell Squat", "Romanian Deadlift", "Leg Press", "Walking Lunges"],
  },
  {
    day: "Day 3",
    name: "Upper Pull",
    focus: "Back, Biceps, Rear Delts",
    exercises: ["Barbell Row", "Pull-ups", "Face Pull", "Dumbbell Curl"],
  },
];

export default function Home() {
  return (
    <div className="space-y-28 py-8">
      {/* ── Hero ── */}
      <section className="grid items-center gap-12 lg:grid-cols-2">
        <div className="flex flex-col gap-6">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border bg-muted/50 px-4 py-1.5 text-sm text-muted-foreground">
            <Zap className="size-3.5" />
            Science-based training for real results
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            Train Smarter.{" "}
            <span className="text-primary">Progress Faster.</span>
          </h1>
          <p className="max-w-xl text-lg text-muted-foreground">
            Kineroz is your intelligent training assistant — grounded in
            exercise science, it builds adaptive plans, tracks progressive
            overload, and optimizes recovery so every effort counts.
          </p>
          <p className="text-sm text-muted-foreground">
            For beginners, busy lifters, and recovery-focused athletes.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="text-base">
              <Link href="/register">
                Start Free
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-base">
              <Link href="#demo">See Example Plan</Link>
            </Button>
          </div>
        </div>

        {/* Product Mockup */}
        <div className="relative hidden lg:block">
          <div className="rounded-2xl border bg-card p-5 shadow-xl">
            <div className="mb-4 flex items-center gap-2">
              <div className="size-3 rounded-full bg-red-400" />
              <div className="size-3 rounded-full bg-yellow-400" />
              <div className="size-3 rounded-full bg-green-400" />
              <span className="ml-2 text-xs text-muted-foreground">
                Dashboard
              </span>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-lg border bg-muted/30 p-3">
                  <p className="text-[10px] text-muted-foreground">Streak</p>
                  <p className="text-lg font-bold text-primary">6 weeks</p>
                </div>
                <div className="rounded-lg border bg-muted/30 p-3">
                  <p className="text-[10px] text-muted-foreground">This Week</p>
                  <p className="text-lg font-bold">4 workouts</p>
                </div>
                <div className="rounded-lg border bg-muted/30 p-3">
                  <p className="text-[10px] text-muted-foreground">Readiness</p>
                  <p className="text-lg font-bold text-green-600">82</p>
                </div>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-xs font-semibold">Next: Upper Push</p>
                <p className="text-[10px] text-muted-foreground">
                  Bench Press · OHP · Incline DB · Lateral Raise
                </p>
                <div className="mt-2 h-7 w-full rounded-md bg-primary/15 text-center text-xs font-medium leading-7 text-primary">
                  Start Workout
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border p-3">
                  <p className="text-[10px] text-muted-foreground">
                    Recovery Score
                  </p>
                  <div className="mt-1 flex items-end gap-1">
                    {[60, 72, 65, 80, 85, 78, 82].map((v, i) => (
                      <div
                        key={i}
                        className="w-full rounded-sm bg-primary/30"
                        style={{ height: `${v * 0.4}px` }}
                      />
                    ))}
                  </div>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-[10px] text-muted-foreground">PR Board</p>
                  <div className="mt-1 space-y-1">
                    <p className="text-[10px]">Bench: 80kg x 6</p>
                    <p className="text-[10px]">Squat: 100kg x 5</p>
                    <p className="text-[10px]">Deadlift: 120kg x 4</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute -bottom-4 -right-4 -z-10 h-full w-full rounded-2xl bg-primary/10" />
        </div>
      </section>

      {/* ── Trust Bar ── */}
      <section className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-muted-foreground">
        {trustSignals.map(({ icon: Icon, text }) => (
          <div key={text} className="flex items-center gap-2">
            <Icon className="size-4 text-primary" />
            {text}
          </div>
        ))}
      </section>

      {/* ── Features ── */}
      <section className="space-y-12">
        <div className="space-y-2 text-center">
          <h2 className="text-3xl font-bold tracking-tight">
            Everything you need to level up
          </h2>
          <p className="mx-auto max-w-xl text-muted-foreground">
            Built on exercise science principles — not hype. Kineroz gives you
            the tools that actually drive progress.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className="group relative overflow-hidden border-border/60 transition-all hover:border-primary/30 hover:shadow-md"
            >
              <CardHeader>
                <div className="flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
                  <feature.icon className="size-5" />
                </div>
                <CardTitle className="mt-3 text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* ── Example Plan Preview ── */}
      <section id="demo" className="scroll-mt-20 space-y-12">
        <div className="space-y-2 text-center">
          <h2 className="text-3xl font-bold tracking-tight">
            See what your plan looks like
          </h2>
          <p className="mx-auto max-w-xl text-muted-foreground">
            Here&apos;s an example 3-day Upper/Lower split generated by
            Kineroz. Your actual plan adapts to your goals, equipment, and
            recovery status.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-3">
          {demoPlan.map((day) => (
            <Card
              key={day.day}
              className="border-border/60 transition-all hover:shadow-md"
            >
              <CardHeader className="pb-3">
                <Badge variant="secondary" className="w-fit">
                  {day.day}
                </Badge>
                <CardTitle className="text-lg">{day.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{day.focus}</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {day.exercises.map((ex) => (
                    <li
                      key={ex}
                      className="flex items-center gap-2 text-sm"
                    >
                      <Dumbbell className="size-3.5 shrink-0 text-primary/60" />
                      {ex}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recovery Impact Demo */}
        <Card className="mx-auto max-w-2xl border-border/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <RefreshCw className="size-5 text-primary" />
              How recovery adapts your workout
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border bg-green-50 p-4 dark:bg-green-950/20">
                <p className="text-sm font-semibold text-green-700 dark:text-green-400">
                  Readiness: 85 (Optimal)
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Train as planned — full volume and intensity.
                </p>
                <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                  <p>Bench Press: 4 sets @ RPE 8</p>
                  <p>OHP: 3 sets @ RPE 7</p>
                </div>
              </div>
              <div className="rounded-lg border bg-yellow-50 p-4 dark:bg-yellow-950/20">
                <p className="text-sm font-semibold text-yellow-700 dark:text-yellow-400">
                  Readiness: 52 (Low)
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Auto-adjusted — reduced sets and lighter load.
                </p>
                <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                  <p>Bench Press: 3 sets @ RPE 6 (-10% load)</p>
                  <p>OHP: 2 sets @ RPE 6 (-10% load)</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* ── Product Screenshots ── */}
      <section className="space-y-12">
        <div className="space-y-2 text-center">
          <h2 className="text-3xl font-bold tracking-tight">
            Built for your daily training
          </h2>
          <p className="mx-auto max-w-xl text-muted-foreground">
            Plan, train, recover, and track — all in one place.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          {[
            {
              icon: ClipboardList,
              title: "Plan Builder",
              description:
                "Auto-generated periodized plan with full exercise swap, set/rep editing, and AI advisor.",
            },
            {
              icon: Dumbbell,
              title: "Workout Logger",
              description:
                "Log sets, weight, and RPE in real-time with rest timer, PR detection, and progression suggestions.",
            },
            {
              icon: Heart,
              title: "Recovery Tracker",
              description:
                "Daily check-in for sleep, soreness, and stress. Readiness score adapts your next workout.",
            },
            {
              icon: BarChart3,
              title: "Progress Dashboard",
              description:
                "PR board, weekly volume trends, training streaks, and muscle group balance.",
            },
          ].map((screen) => (
            <div
              key={screen.title}
              className="flex gap-4 rounded-xl border border-border/60 p-5 transition-all hover:shadow-md"
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <screen.icon className="size-5" />
              </div>
              <div>
                <p className="font-semibold">{screen.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {screen.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="space-y-12">
        <div className="space-y-2 text-center">
          <h2 className="text-3xl font-bold tracking-tight">How it works</h2>
          <p className="mx-auto max-w-xl text-muted-foreground">
            Get up and running in minutes — no complicated setup, no upfront
            cost.
          </p>
        </div>
        <div className="grid gap-8 sm:grid-cols-3">
          {steps.map((s) => (
            <div
              key={s.step}
              className="flex flex-col items-center gap-4 text-center"
            >
              <div className="relative flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <s.icon className="size-7" />
                <span className="absolute -right-2 -top-2 flex size-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {s.step}
                </span>
              </div>
              <h3 className="text-lg font-semibold">{s.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {s.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Why Science-Based ── */}
      <section className="space-y-12">
        <div className="space-y-2 text-center">
          <h2 className="text-3xl font-bold tracking-tight">
            Why science-based training?
          </h2>
          <p className="mx-auto max-w-xl text-muted-foreground">
            Every decision in Kineroz is backed by exercise science principles — not guesswork or trends.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: TrendingUp,
              title: "Progressive Overload",
              text: "Systematically increase stimulus over time — the most reliable driver of strength and hypertrophy gains.",
            },
            {
              icon: Heart,
              title: "Recovery Integration",
              text: "Training without accounting for recovery leads to plateaus. Kineroz adjusts load based on how you actually feel.",
            },
            {
              icon: Clock,
              title: "Periodization",
              text: "Structured training phases prevent burnout and ensure continuous adaptation across weeks and months.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="space-y-3 rounded-xl border border-border/60 p-6"
            >
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <item.icon className="size-5" />
              </div>
              <h3 className="font-semibold">{item.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section className="flex flex-col items-center gap-6 rounded-2xl border bg-muted/30 px-6 py-16 text-center">
        <h2 className="max-w-lg text-3xl font-bold tracking-tight">
          Ready to start training smarter?
        </h2>
        <p className="max-w-md text-muted-foreground">
          Join Kineroz for free and get a personalized, science-backed training
          plan in under two minutes.
        </p>
        <div className="flex items-center gap-3">
          {["Personalized plans", "Recovery-aware", "No credit card"].map(
            (t) => (
              <span
                key={t}
                className="flex items-center gap-1.5 text-sm text-muted-foreground"
              >
                <Check className="size-3.5 text-primary" />
                {t}
              </span>
            ),
          )}
        </div>
        <Button asChild size="lg" className="text-base">
          <Link href="/register">
            Start Free
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </section>
    </div>
  );
}
