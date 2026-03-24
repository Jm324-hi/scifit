import type { Metadata } from "next";
import {
  Dumbbell,
  Search,
  Target,
  Layers,
  Gauge,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Exercise Library",
  description:
    "Browse the full exercise library — organized by muscle group and movement pattern.",
};

interface Exercise {
  id: string;
  name: string;
  movement_pattern: string;
  primary_muscle: string;
  secondary_muscles: string[];
  equipment: string;
  difficulty: string;
  description: string | null;
  tips: string | null;
}

const PATTERN_LABELS: Record<string, string> = {
  push: "Push",
  pull: "Pull",
  squat: "Squat",
  hinge: "Hinge",
  core: "Core",
  carry: "Carry",
};

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: "text-green-600",
  intermediate: "text-blue-600",
  advanced: "text-orange-600",
};

function capitalize(s: string): string {
  return s
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export default async function ExerciseLibraryPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("exercises")
    .select("*")
    .order("name");

  const exercises = (data ?? []) as Exercise[];

  const byPattern = new Map<string, Exercise[]>();
  for (const ex of exercises) {
    const pattern = ex.movement_pattern;
    if (!byPattern.has(pattern)) byPattern.set(pattern, []);
    byPattern.get(pattern)!.push(ex);
  }

  const patterns = Object.keys(PATTERN_LABELS).filter((p) =>
    byPattern.has(p),
  );
  const otherPatterns = [...byPattern.keys()].filter(
    (p) => !PATTERN_LABELS[p],
  );

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Exercise Library</h1>
        <p className="text-muted-foreground">
          {exercises.length} exercises organized by movement pattern. Each
          exercise includes target muscles, equipment requirements, and
          difficulty level.
        </p>
      </div>

      {/* Quick stats */}
      <div className="flex flex-wrap gap-2">
        {[...patterns, ...otherPatterns].map((pattern) => (
          <Badge key={pattern} variant="outline">
            {PATTERN_LABELS[pattern] ?? capitalize(pattern)} (
            {byPattern.get(pattern)?.length ?? 0})
          </Badge>
        ))}
      </div>

      {/* Exercise groups */}
      {[...patterns, ...otherPatterns].map((pattern) => {
        const group = byPattern.get(pattern) ?? [];
        return (
          <section key={pattern} className="space-y-4">
            <h2 className="text-xl font-semibold tracking-tight">
              {PATTERN_LABELS[pattern] ?? capitalize(pattern)}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {group.map((ex) => (
                <Card
                  key={ex.id}
                  className="border-border/60 transition-all hover:shadow-md"
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Dumbbell className="size-4 shrink-0 text-primary/60" />
                      {ex.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex flex-wrap gap-1.5">
                      <Badge variant="secondary" className="gap-1 text-xs">
                        <Target className="size-3" />
                        {capitalize(ex.primary_muscle)}
                      </Badge>
                      {ex.equipment && (
                        <Badge variant="outline" className="text-xs">
                          {capitalize(ex.equipment)}
                        </Badge>
                      )}
                      <Badge
                        variant="outline"
                        className={`text-xs ${DIFFICULTY_COLORS[ex.difficulty] ?? ""}`}
                      >
                        <Gauge className="mr-0.5 size-3" />
                        {capitalize(ex.difficulty)}
                      </Badge>
                    </div>

                    {ex.secondary_muscles.length > 0 && (
                      <div className="flex items-start gap-2 text-xs text-muted-foreground">
                        <Layers className="mt-0.5 size-3 shrink-0" />
                        <span>
                          Also targets:{" "}
                          {ex.secondary_muscles.map(capitalize).join(", ")}
                        </span>
                      </div>
                    )}

                    {ex.description && (
                      <p className="text-xs leading-relaxed text-muted-foreground">
                        {ex.description}
                      </p>
                    )}

                    {ex.tips && (
                      <p className="text-xs italic text-muted-foreground/80">
                        Tip: {ex.tips}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
