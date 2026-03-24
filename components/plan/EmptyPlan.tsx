"use client";

import { ClipboardList, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface EmptyPlanProps {
  generating: boolean;
  hasProfile: boolean;
  onGenerate: () => void;
}

export function EmptyPlan({
  generating,
  hasProfile,
  onGenerate,
}: EmptyPlanProps) {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Training Plan</h1>
      <Card>
        <CardContent className="flex flex-col items-center gap-5 py-16 text-center">
          <ClipboardList className="size-12 text-muted-foreground/40" />
          <div className="space-y-1">
            <p className="font-medium">No training plan yet</p>
            <p className="text-sm text-muted-foreground">
              Generate a personalized plan based on your profile.
            </p>
          </div>
          <Button
            onClick={onGenerate}
            size="lg"
            disabled={generating || !hasProfile}
          >
            {generating ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Sparkles className="size-4" />
            )}
            {generating ? "Generating..." : "Generate Your Plan"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
