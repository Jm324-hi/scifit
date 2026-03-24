"use client";

import { Loader2, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import type { ExerciseFinishInsight } from "./types";

interface FinishDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  completedSets: number;
  groupsLength: number;
  finishNotes: string;
  onNotesChange: (value: string) => void;
  finishInsights: ExerciseFinishInsight[];
  loadingFinishInsights: boolean;
  onFinish: () => void;
  finishing: boolean;
}

export function FinishDialog({
  open,
  onOpenChange,
  completedSets,
  groupsLength,
  finishNotes,
  onNotesChange,
  finishInsights,
  loadingFinishInsights,
  onFinish,
  finishing,
}: FinishDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Finish Workout?</DialogTitle>
          <DialogDescription>
            You completed {completedSets} set
            {completedSets !== 1 ? "s" : ""} across {groupsLength} exercise
            {groupsLength !== 1 ? "s" : ""}.
          </DialogDescription>
        </DialogHeader>
        <textarea
          className="min-h-20 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 outline-none"
          placeholder="Add notes about this workout (optional)..."
          value={finishNotes}
          onChange={(e) => onNotesChange(e.target.value)}
        />
        <div className="space-y-2">
          <p className="text-sm font-medium">Next Time Recommendations</p>
          {loadingFinishInsights ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Preparing progression insights...
            </div>
          ) : (
            <div className="space-y-2">
              {finishInsights.map((insight) => (
                <div
                  key={insight.exerciseId}
                  className="rounded-md border bg-muted/20 p-3"
                >
                  <p className="text-sm font-medium text-foreground">
                    {insight.recommendationText}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {insight.reason}
                  </p>
                  {insight.prText && (
                    <p className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-green-600">
                      <Trophy className="size-3.5" />
                      {insight.prText}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onFinish} disabled={finishing}>
            {finishing && <Loader2 className="size-4 animate-spin" />}
            Complete Workout
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
