"use client";

import { useState, useMemo } from "react";
import { Search, Star, Filter } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Exercise } from "@/lib/exercise-substitution";

const EQUIPMENT_OPTIONS = [
  "barbell",
  "dumbbell",
  "machine",
  "cable",
  "bodyweight",
  "band",
] as const;

const MUSCLE_OPTIONS = [
  "chest",
  "back",
  "shoulders",
  "quads",
  "hamstrings",
  "glutes",
  "biceps",
  "triceps",
  "core",
  "calves",
  "forearms",
  "traps",
] as const;

const PATTERN_OPTIONS = [
  "push",
  "pull",
  "squat",
  "hinge",
  "carry",
  "core",
] as const;

function DifficultyStars({ level }: { level: number }) {
  return (
    <span className="inline-flex gap-0.5" aria-label={`Difficulty ${level} of 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`size-3 ${
            i < level
              ? "fill-amber-400 text-amber-400"
              : "fill-muted text-muted"
          }`}
        />
      ))}
    </span>
  );
}

function FilterChips({
  label,
  options,
  selected,
  onToggle,
}: {
  label: string;
  options: readonly string[];
  selected: Set<string>;
  onToggle: (value: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <div className="flex flex-wrap gap-1">
        {options.map((opt) => (
          <Badge
            key={opt}
            variant={selected.has(opt) ? "default" : "outline"}
            className="cursor-pointer select-none capitalize"
            onClick={() => onToggle(opt)}
          >
            {opt}
          </Badge>
        ))}
      </div>
    </div>
  );
}

interface ExerciseSelectorProps {
  exercises: Exercise[];
  onSelect: (exercise: Exercise) => void;
  trigger?: React.ReactNode;
}

export function ExerciseSelector({
  exercises,
  onSelect,
  trigger,
}: ExerciseSelectorProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Set<string>>(
    new Set()
  );
  const [selectedMuscles, setSelectedMuscles] = useState<Set<string>>(
    new Set()
  );
  const [selectedPatterns, setSelectedPatterns] = useState<Set<string>>(
    new Set()
  );

  function toggle(set: Set<string>, value: string): Set<string> {
    const next = new Set(set);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    return next;
  }

  const activeFilterCount =
    selectedEquipment.size + selectedMuscles.size + selectedPatterns.size;

  const filtered = useMemo(() => {
    return exercises.filter((ex) => {
      if (query && !ex.name.toLowerCase().includes(query.toLowerCase()))
        return false;
      if (selectedEquipment.size > 0 && !selectedEquipment.has(ex.equipment))
        return false;
      if (selectedMuscles.size > 0 && !selectedMuscles.has(ex.primary_muscle))
        return false;
      if (
        selectedPatterns.size > 0 &&
        !selectedPatterns.has(ex.movement_pattern)
      )
        return false;
      return true;
    });
  }, [exercises, query, selectedEquipment, selectedMuscles, selectedPatterns]);

  function handleSelect(exercise: Exercise) {
    onSelect(exercise);
    setOpen(false);
  }

  function clearFilters() {
    setSelectedEquipment(new Set());
    setSelectedMuscles(new Set());
    setSelectedPatterns(new Set());
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? <Button variant="outline">Select Exercise</Button>}
      </DialogTrigger>
      <DialogContent className="flex max-h-[85vh] flex-col sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Select Exercise</DialogTitle>
        </DialogHeader>

        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search exercises..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          <Button
            variant={showFilters ? "secondary" : "outline"}
            size="sm"
            onClick={() => setShowFilters((v) => !v)}
          >
            <Filter className="size-4" />
            Filters
            {activeFilterCount > 0 && (
              <Badge variant="default" className="ml-1 size-5 justify-center p-0 text-[10px]">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </div>

        {showFilters && (
          <div className="space-y-3 rounded-lg border p-3">
            <FilterChips
              label="Equipment"
              options={EQUIPMENT_OPTIONS}
              selected={selectedEquipment}
              onToggle={(v) => setSelectedEquipment(toggle(selectedEquipment, v))}
            />
            <FilterChips
              label="Muscle Group"
              options={MUSCLE_OPTIONS}
              selected={selectedMuscles}
              onToggle={(v) => setSelectedMuscles(toggle(selectedMuscles, v))}
            />
            <FilterChips
              label="Movement Pattern"
              options={PATTERN_OPTIONS}
              selected={selectedPatterns}
              onToggle={(v) => setSelectedPatterns(toggle(selectedPatterns, v))}
            />
            {activeFilterCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear all filters
              </Button>
            )}
          </div>
        )}

        <div className="flex-1 overflow-y-auto -mx-6 px-6">
          {filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No exercises match your criteria.
            </p>
          ) : (
            <ul className="divide-y">
              {filtered.map((ex) => (
                <li key={ex.id}>
                  <button
                    type="button"
                    className="flex w-full items-start gap-3 px-1 py-3 text-left transition-colors hover:bg-accent/50 rounded-md"
                    onClick={() => handleSelect(ex)}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium leading-tight">{ex.name}</p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                        <Badge variant="secondary" className="capitalize text-[11px]">
                          {ex.primary_muscle}
                        </Badge>
                        <Badge variant="outline" className="capitalize text-[11px]">
                          {ex.equipment}
                        </Badge>
                        <Badge variant="outline" className="capitalize text-[11px]">
                          {ex.movement_pattern}
                        </Badge>
                      </div>
                    </div>
                    <DifficultyStars level={ex.difficulty} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <p className="text-xs text-muted-foreground text-center pt-1">
          {filtered.length} exercise{filtered.length !== 1 ? "s" : ""}
        </p>
      </DialogContent>
    </Dialog>
  );
}
