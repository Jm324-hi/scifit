"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dumbbell,
  Layers,
  Sparkles,
  TrendingUp,
  Wind,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  BODY_PARTS,
  type BodyPartId,
  type Difficulty,
  getBodyPart,
} from "./body-parts-data";

const difficultyVariant: Record<
  Difficulty,
  "default" | "secondary" | "outline"
> = {
  Beginner: "secondary",
  Intermediate: "default",
  Advanced: "outline",
};

function ExerciseRow({
  name,
  meta,
  tip,
  difficulty,
  borderClass,
}: {
  name: string;
  meta: string;
  tip: string;
  difficulty: Difficulty;
  borderClass: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border/60 border-l-4 bg-card p-4 transition-shadow hover:shadow-sm",
        borderClass,
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <p className="font-semibold">{name}</p>
        <Badge variant={difficultyVariant[difficulty]} className="text-xs">
          {difficulty}
        </Badge>
      </div>
      <p className="mt-1 text-sm text-primary/90">{meta}</p>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {tip}
      </p>
    </div>
  );
}

export default function BodyPartSelector() {
  const [selected, setSelected] = useState<BodyPartId>("knee");
  const part = getBodyPart(selected);
  const isAvailable = part?.available ?? false;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {BODY_PARTS.map((p) => {
          const active = selected === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => setSelected(p.id)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-all",
                active ? p.chipActive : p.chipColor,
                !p.available && !active && "opacity-60",
              )}
            >
              <p.icon className="size-3.5" />
              {p.label}
              {!p.available && (
                <span className="text-[10px] uppercase tracking-wide opacity-70">
                  soon
                </span>
              )}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {!isAvailable ? (
          <motion.div
            key="coming-soon"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="rounded-2xl border border-dashed bg-muted/30 px-6 py-14 text-center"
          >
            <Sparkles className="mx-auto size-8 text-muted-foreground" />
            <p className="mt-3 font-semibold">Coming soon</p>
            <p className="mt-1 text-sm text-muted-foreground">
              We&apos;re building guided protocols for {part?.label}. Try knee,
              shoulder, lower back, Achilles, or hip in the meantime.
            </p>
          </motion.div>
        ) : (
          <motion.div
            key={selected}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
          >
            <Card className="overflow-hidden border-border/60">
              <CardHeader className="border-b bg-muted/20">
                <div className="flex items-center gap-2">
                  {part && <part.icon className="size-5 text-primary" />}
                  <CardTitle className="text-xl">
                    {part?.label} — recovery playbook
                  </CardTitle>
                </div>
                <p className="text-sm text-muted-foreground">
                  Mobility first, then activation, then progressive loading — the
                  same order clinicians use in telerehab.
                </p>
              </CardHeader>
              <CardContent className="pt-6">
                <Tabs defaultValue="mobility" className="gap-4">
                  <TabsList className="grid h-auto w-full grid-cols-3 gap-1 p-1">
                    <TabsTrigger
                      value="mobility"
                      className="gap-1.5 data-[state=active]:border-amber-500/50 data-[state=active]:bg-amber-500/10"
                    >
                      <Wind className="size-3.5 text-amber-600 dark:text-amber-400" />
                      <span className="hidden sm:inline">Mobility</span>
                      <span className="sm:hidden">Release</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="activation"
                      className="gap-1.5 data-[state=active]:border-emerald-500/50 data-[state=active]:bg-emerald-500/10"
                    >
                      <Dumbbell className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                      Rehab
                    </TabsTrigger>
                    <TabsTrigger
                      value="progression"
                      className="gap-1.5 data-[state=active]:border-sky-500/50 data-[state=active]:bg-sky-500/10"
                    >
                      <TrendingUp className="size-3.5 text-sky-600 dark:text-sky-400" />
                      <span className="hidden sm:inline">Loading</span>
                      <span className="sm:hidden">Load</span>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="mobility" className="mt-4 space-y-3">
                    <div className="flex items-center gap-2 rounded-lg border-l-4 border-amber-500 bg-amber-500/5 px-3 py-2 text-sm text-muted-foreground">
                      <Wind className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
                      Foam roll, stretch, and nerve glides — prepare tissue
                      before loading.
                    </div>
                    {part?.mobility.map((ex) => (
                      <ExerciseRow
                        key={ex.name}
                        name={ex.name}
                        meta={ex.duration}
                        tip={ex.tip}
                        difficulty={ex.difficulty}
                        borderClass="border-l-amber-500"
                      />
                    ))}
                  </TabsContent>

                  <TabsContent value="activation" className="mt-4 space-y-3">
                    <div className="flex items-center gap-2 rounded-lg border-l-4 border-emerald-500 bg-emerald-500/5 px-3 py-2 text-sm text-muted-foreground">
                      <Dumbbell className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                      Low-load activation and isometrics — build capacity safely.
                    </div>
                    {part?.activation.map((ex) => (
                      <ExerciseRow
                        key={ex.name}
                        name={ex.name}
                        meta={`${ex.sets} · ${ex.duration}`}
                        tip={ex.tip}
                        difficulty={ex.difficulty}
                        borderClass="border-l-emerald-500"
                      />
                    ))}
                  </TabsContent>

                  <TabsContent value="progression" className="mt-4 space-y-3">
                    <div className="flex items-center gap-2 rounded-lg border-l-4 border-sky-500 bg-sky-500/5 px-3 py-2 text-sm text-muted-foreground">
                      <Layers className="size-4 shrink-0 text-sky-600 dark:text-sky-400" />
                      Progressive phases — advance only when criteria are met.
                    </div>
                    {part?.progression.map((ph, i) => (
                      <div
                        key={ph.phase}
                        className="relative rounded-xl border border-border/60 border-l-4 border-l-sky-500 p-4 pl-5"
                      >
                        <div className="absolute -left-3 top-4 flex size-6 items-center justify-center rounded-full bg-sky-500 text-xs font-bold text-white">
                          {i + 1}
                        </div>
                        <p className="font-semibold">{ph.phase}</p>
                        <p className="mt-1 text-sm text-primary/90">
                          {ph.load}
                        </p>
                        <p className="mt-2 text-sm text-muted-foreground">
                          {ph.criterion}
                        </p>
                      </div>
                    ))}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
