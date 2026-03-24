"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Target,
  Calendar,
  User,
  Dumbbell,
  Home,
  Building2,
  Flame,
  Zap,
  ChevronLeft,
  ChevronRight,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { createFreeSubscription } from "@/lib/subscription";
import { profileSchema } from "@/lib/validations";

const goals = [
  {
    value: "muscle",
    label: "Muscle Building",
    description: "Increase muscle mass and improve physique",
    icon: Dumbbell,
  },
  {
    value: "strength",
    label: "Strength",
    description: "Maximize your strength and power output",
    icon: Zap,
  },
  {
    value: "fat_loss",
    label: "Fat Loss",
    description: "Reduce body fat while preserving muscle",
    icon: Flame,
  },
  {
    value: "general",
    label: "General Fitness",
    description: "Improve overall health, endurance, and well-being",
    icon: Target,
  },
];

const equipmentOptions = [
  { value: "gym", label: "Gym", description: "Full gym access", icon: Building2 },
  { value: "home", label: "Home", description: "Home equipment only", icon: Home },
  {
    value: "both",
    label: "Both",
    description: "Mix of gym and home",
    icon: Dumbbell,
  },
];

const levels = [
  {
    value: "beginner",
    label: "Beginner",
    description: "Less than 6 months of training",
  },
  {
    value: "intermediate",
    label: "Intermediate",
    description: "6 months to 2 years of training",
  },
  {
    value: "advanced",
    label: "Advanced",
    description: "Over 2 years of consistent training",
  },
];

const steps = [
  { label: "Training Goal", icon: Target },
  { label: "Schedule", icon: Calendar },
  { label: "Experience", icon: User },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState("");
  const [frequency, setFrequency] = useState([4]);
  const [equipment, setEquipment] = useState("");
  const [experience, setExperience] = useState("");
  const [availableTime, setAvailableTime] = useState([60]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canProceed =
    (step === 0 && goal !== "") ||
    (step === 1 && equipment !== "") ||
    (step === 2 && experience !== "");

  async function handleComplete() {
    setError("");

    const result = profileSchema.safeParse({
      goal,
      frequency: frequency[0],
      equipment,
      experience,
      available_time: availableTime[0],
    });

    if (!result.success) {
      const firstError = result.error.issues[0];
      setError(firstError?.message ?? "Invalid profile data.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("You must be signed in to complete onboarding.");
        setLoading(false);
        return;
      }

      const { error: upsertError } = await supabase.from("profiles").upsert(
        {
          id: user.id,
          ...result.data,
        },
        { onConflict: "id" }
      );

      if (upsertError) {
        setError(upsertError.message);
        setLoading(false);
        return;
      }

      await createFreeSubscription(supabase, user.id);

      router.push("/dashboard");
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8 py-4">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight">
          Set Up Your Training Profile
        </h1>
        <p className="text-muted-foreground">
          Tell us about yourself so we can create the perfect plan for you.
        </p>
      </div>

      {/* Step progress indicator */}
      <nav className="flex items-center gap-2">
        {steps.map((s, i) => (
          <div key={s.label} className="flex flex-1 flex-col items-center gap-1.5">
            <div
              className={`flex size-10 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors ${
                i < step
                  ? "border-primary bg-primary text-primary-foreground"
                  : i === step
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-muted text-muted-foreground"
              }`}
            >
              {i < step ? <Check className="size-5" /> : i + 1}
            </div>
            <span
              className={`text-xs font-medium ${
                i <= step ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {s.label}
            </span>
            {i < steps.length - 1 && (
              <div
                className={`absolute hidden h-0.5 w-full ${
                  i < step ? "bg-primary" : "bg-muted"
                }`}
              />
            )}
          </div>
        ))}
      </nav>

      {error && (
        <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Step 1: Training Goal */}
      {step === 0 && (
        <div className="space-y-4">
          <p className="text-center text-muted-foreground">
            What is your primary training goal?
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {goals.map((g) => (
              <Card
                key={g.value}
                className={`cursor-pointer transition-all ${
                  goal === g.value
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "hover:border-muted-foreground/30"
                }`}
                onClick={() => setGoal(g.value)}
              >
                <CardHeader className="items-center text-center">
                  <div
                    className={`flex size-12 items-center justify-center rounded-full ${
                      goal === g.value
                        ? "bg-primary/15 text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <g.icon className="size-6" />
                  </div>
                  <CardTitle className="text-base">{g.label}</CardTitle>
                  <CardDescription>{g.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Schedule */}
      {step === 1 && (
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base">Training Frequency</Label>
              <span className="text-sm font-semibold text-primary">
                {frequency[0]} days / week
              </span>
            </div>
            <Slider
              value={frequency}
              onValueChange={setFrequency}
              min={2}
              max={6}
              step={1}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>2 days</span>
              <span>6 days</span>
            </div>
          </div>

          <div className="space-y-4">
            <Label className="text-base">Equipment Access</Label>
            <div className="grid gap-4 sm:grid-cols-3">
              {equipmentOptions.map((e) => (
                <Card
                  key={e.value}
                  className={`cursor-pointer transition-all ${
                    equipment === e.value
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "hover:border-muted-foreground/30"
                  }`}
                  onClick={() => setEquipment(e.value)}
                >
                  <CardHeader className="items-center text-center">
                    <div
                      className={`flex size-10 items-center justify-center rounded-full ${
                        equipment === e.value
                          ? "bg-primary/15 text-primary"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <e.icon className="size-5" />
                    </div>
                    <CardTitle className="text-sm">{e.label}</CardTitle>
                    <CardDescription className="text-xs">
                      {e.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Experience */}
      {step === 2 && (
        <div className="space-y-8">
          <div className="space-y-4">
            <Label className="text-base">Training Experience</Label>
            <div className="grid gap-4 sm:grid-cols-3">
              {levels.map((l) => (
                <Card
                  key={l.value}
                  className={`cursor-pointer transition-all ${
                    experience === l.value
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "hover:border-muted-foreground/30"
                  }`}
                  onClick={() => setExperience(l.value)}
                >
                  <CardHeader className="text-center">
                    <CardTitle className="text-base">{l.label}</CardTitle>
                    <CardDescription>{l.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base">Available Time per Session</Label>
              <span className="text-sm font-semibold text-primary">
                {availableTime[0]} min
              </span>
            </div>
            <Slider
              value={availableTime}
              onValueChange={setAvailableTime}
              min={20}
              max={120}
              step={5}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>20 min</span>
              <span>120 min</span>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button
          variant="outline"
          onClick={() => setStep((s) => s - 1)}
          disabled={step === 0}
        >
          <ChevronLeft className="mr-1 size-4" />
          Back
        </Button>

        {step < steps.length - 1 ? (
          <Button
            onClick={() => setStep((s) => s + 1)}
            disabled={!canProceed}
          >
            Next
            <ChevronRight className="ml-1 size-4" />
          </Button>
        ) : (
          <Button onClick={handleComplete} disabled={!canProceed || loading}>
            {loading ? "Saving..." : "Complete"}
            {!loading && <Check className="ml-1 size-4" />}
          </Button>
        )}
      </div>
    </div>
  );
}
