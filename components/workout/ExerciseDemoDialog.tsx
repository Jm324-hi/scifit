"use client";

import { PlayCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Exercise } from "@/lib/exercise-substitution";

interface ExerciseDemoDialogProps {
  exercise: Exercise;
}

export function ExerciseDemoDialog({ exercise }: ExerciseDemoDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon-sm" title="View Exercise Demo">
          <PlayCircle className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{exercise.name}</DialogTitle>
          <DialogDescription className="capitalize">
            {exercise.primary_muscle} · {exercise.equipment}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {exercise.video_id ? (
            <div className="relative aspect-video overflow-hidden rounded-lg bg-muted">
              <iframe
                src={`https://www.youtube.com/embed/${exercise.video_id}?autoplay=0`}
                title={`${exercise.name} demonstration`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 h-full w-full border-0"
              />
            </div>
          ) : (
            <div className="flex aspect-video items-center justify-center rounded-lg bg-muted text-sm text-muted-foreground">
              No video demonstration available yet.
            </div>
          )}

          <div className="space-y-3 text-sm">
            <div>
              <p className="font-semibold text-foreground">How to do it:</p>
              <p className="text-muted-foreground mt-1">{exercise.description}</p>
            </div>
            <div>
              <p className="font-semibold text-foreground">Coach&apos;s Tips:</p>
              <p className="text-muted-foreground mt-1">{exercise.tips}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
