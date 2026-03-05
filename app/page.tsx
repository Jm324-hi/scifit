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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";

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

export default function Home() {
  return (
    <div className="space-y-24 py-8">
      {/* Hero */}
      <section className="flex flex-col items-center gap-6 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border bg-muted/50 px-4 py-1.5 text-sm text-muted-foreground">
          <Zap className="size-3.5" />
          Science-based training for real results
        </div>
        <h1 className="max-w-3xl text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
          Train Smarter.{" "}
          <span className="text-primary">Progress Faster.</span>
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground sm:text-xl">
          SciFit is your intelligent training assistant — grounded in exercise
          science, it helps you plan workouts, track progressive overload, and
          optimize recovery so every effort counts.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg" className="text-base">
            <Link href="/register">
              Get Started Free
              <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="text-base">
            <Link href="/login">Sign In</Link>
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="space-y-10">
        <div className="space-y-2 text-center">
          <h2 className="text-3xl font-bold tracking-tight">
            Everything you need to level up
          </h2>
          <p className="mx-auto max-w-xl text-muted-foreground">
            Built on exercise science principles — not hype. SciFit gives you
            the tools that actually drive progress.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          {features.map((feature) => (
            <Card key={feature.title} className="relative overflow-hidden">
              <CardHeader>
                <div className="flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
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

      {/* How It Works */}
      <section className="space-y-10">
        <div className="space-y-2 text-center">
          <h2 className="text-3xl font-bold tracking-tight">
            How it works
          </h2>
          <p className="mx-auto max-w-xl text-muted-foreground">
            Get up and running in minutes — no complicated setup, no upfront
            cost.
          </p>
        </div>
        <div className="grid gap-8 sm:grid-cols-3">
          {steps.map((s) => (
            <div key={s.step} className="flex flex-col items-center gap-4 text-center">
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

      {/* Bottom CTA */}
      <section className="flex flex-col items-center gap-6 rounded-2xl border bg-muted/30 px-6 py-16 text-center">
        <h2 className="max-w-lg text-3xl font-bold tracking-tight">
          Ready to start training smarter?
        </h2>
        <p className="max-w-md text-muted-foreground">
          Join SciFit for free and get a personalized, science-backed training
          plan in under two minutes.
        </p>
        <Button asChild size="lg" className="text-base">
          <Link href="/register">
            Create Your Free Account
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </section>
    </div>
  );
}
