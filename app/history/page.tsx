"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  History,
  ChevronDown,
  ChevronRight,
  Clock,
  Dumbbell,
  Layers,
  Loader2,
  CalendarDays,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { isPro as checkIsPro } from "@/lib/subscription";
import { Paywall } from "@/components/Paywall";
import { Lock } from "lucide-react";

interface SetData {
  id: string;
  exercise_id: string;
  set_number: number;
  weight: number | null;
  reps: number | null;
  rpe: number | null;
  completed: boolean;
  exercises: { name: string; primary_muscle: string; equipment: string } | null;
}

interface SessionData {
  id: string;
  started_at: string;
  completed_at: string | null;
  notes: string | null;
  workout_sets: SetData[];
}

function formatDuration(start: string, end: string): string {
  const ms = new Date(end).getTime() - new Date(start).getTime();
  const minutes = Math.round(ms / 60000);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

interface ExerciseDetail {
  name: string;
  primaryMuscle: string;
  sets: { set_number: number; weight: number | null; reps: number | null; rpe: number | null }[];
}

function groupSetsByExercise(sets: SetData[]): ExerciseDetail[] {
  const map = new Map<string, ExerciseDetail>();
  const order: string[] = [];

  for (const s of sets) {
    if (!s.completed) continue;
    const key = s.exercise_id;
    if (!map.has(key)) {
      map.set(key, {
        name: s.exercises?.name ?? "Unknown",
        primaryMuscle: s.exercises?.primary_muscle ?? "",
        sets: [],
      });
      order.push(key);
    }
    map.get(key)!.sets.push({
      set_number: s.set_number,
      weight: s.weight,
      reps: s.reps,
      rpe: s.rpe,
    });
  }

  return order.map((k) => map.get(k)!);
}

export default function HistoryPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [userIsPro, setUserIsPro] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || cancelled) {
        setLoading(false);
        return;
      }

      const proStatus = await checkIsPro(supabase, user.id);
      if (!cancelled) setUserIsPro(proStatus);

      const { data } = await supabase
        .from("workout_sessions")
        .select(
          "id, started_at, completed_at, notes, workout_sets(id, exercise_id, set_number, weight, reps, rpe, completed, exercises(name, primary_muscle, equipment))"
        )
        .eq("user_id", user.id)
        .eq("status", "completed")
        .order("started_at", { ascending: false });

      if (!cancelled) {
        setSessions((data as SessionData[] | null) ?? []);
        setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function toggle(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Workout History</h1>

      {sessions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
            <History className="size-12 text-muted-foreground/40" />
            <p className="text-muted-foreground">No workout records yet</p>
            <p className="text-sm text-muted-foreground">
              Complete a workout to see it here.
            </p>
            <Button asChild variant="outline">
              <Link href="/workout">Start Workout</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
        <div className="space-y-3">
          {sessions.map((s) => {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            const isLocked =
              !userIsPro && new Date(s.started_at) < thirtyDaysAgo;

            if (isLocked) {
              return (
                <Card key={s.id} className="opacity-60">
                  <CardHeader
                    className="cursor-pointer select-none"
                    onClick={() => setShowPaywall(true)}
                  >
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Lock className="size-4 shrink-0 text-muted-foreground" />
                      <CalendarDays className="size-4 shrink-0 text-muted-foreground" />
                      {formatDate(s.started_at)}
                    </CardTitle>
                    <CardDescription className="pl-6">
                      <span className="text-xs">
                        Upgrade to Pro to view history older than 30 days
                      </span>
                    </CardDescription>
                  </CardHeader>
                </Card>
              );
            }

            const isOpen = expanded.has(s.id);
            const completedSets = s.workout_sets.filter((ws) => ws.completed);
            const exerciseCount = new Set(
              completedSets.map((ws) => ws.exercise_id)
            ).size;
            const setCount = completedSets.length;
            const duration =
              s.completed_at
                ? formatDuration(s.started_at, s.completed_at)
                : "—";
            const details = isOpen
              ? groupSetsByExercise(s.workout_sets)
              : [];

            return (
              <Card key={s.id}>
                <CardHeader
                  className="cursor-pointer select-none"
                  onClick={() => toggle(s.id)}
                >
                  <CardTitle className="flex items-center gap-2 text-base">
                    {isOpen ? (
                      <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                    )}
                    <CalendarDays className="size-4 shrink-0 text-muted-foreground" />
                    {formatDate(s.started_at)}
                  </CardTitle>
                  <CardDescription className="flex flex-wrap items-center gap-3 pl-6">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="size-3" />
                      {duration}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Dumbbell className="size-3" />
                      {exerciseCount} exercise{exerciseCount !== 1 ? "s" : ""}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Layers className="size-3" />
                      {setCount} set{setCount !== 1 ? "s" : ""}
                    </span>
                  </CardDescription>
                </CardHeader>

                {isOpen && (
                  <CardContent className="space-y-4 pt-0">
                    {s.notes && (
                      <p className="rounded-md bg-muted/50 px-3 py-2 text-sm italic text-muted-foreground">
                        {s.notes}
                      </p>
                    )}

                    {details.map((ex, i) => (
                      <div key={i} className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium">{ex.name}</p>
                          <Badge
                            variant="outline"
                            className="capitalize text-[11px]"
                          >
                            {ex.primaryMuscle}
                          </Badge>
                        </div>
                        <div className="space-y-0.5 pl-2">
                          {ex.sets.map((set) => (
                            <p
                              key={set.set_number}
                              className="text-sm text-muted-foreground"
                            >
                              Set {set.set_number}:{" "}
                              <span className="font-medium text-foreground">
                                {set.weight ?? 0}kg × {set.reps ?? 0}
                              </span>
                              {set.rpe != null && (
                                <span className="text-muted-foreground">
                                  {" "}
                                  @ RPE {set.rpe}
                                </span>
                              )}
                            </p>
                          ))}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>

        <Paywall
          open={showPaywall}
          onOpenChange={setShowPaywall}
          feature="unlimited_history"
        />
        </>
      )}
    </div>
  );
}
