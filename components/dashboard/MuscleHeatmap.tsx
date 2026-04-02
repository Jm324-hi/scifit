"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export type RecoveryLevel = "fresh" | "recovering" | "fatigued";

export interface MuscleRecoveryData {
  chest: RecoveryLevel;
  shoulders: RecoveryLevel;
  triceps: RecoveryLevel;
  back: RecoveryLevel;
  biceps: RecoveryLevel;
  traps: RecoveryLevel;
  forearms: RecoveryLevel;
  quads: RecoveryLevel;
  glutes: RecoveryLevel;
  hamstrings: RecoveryLevel;
  calves: RecoveryLevel;
  core: RecoveryLevel;
}

interface MuscleGroupConfig {
  id: keyof MuscleRecoveryData;
  label: string;
  // Approximation of where they are on the body (front/back)
  side: "front" | "back";
  cx: string;
  cy: string;
  r: string;
}

const MUSCLE_GROUPS: MuscleGroupConfig[] = [
  { id: "chest", label: "Chest", side: "front", cx: "50%", cy: "30%", r: "12%" },
  { id: "shoulders", label: "Shoulders", side: "front", cx: "50%", cy: "20%", r: "14%" },
  { id: "biceps", label: "Biceps", side: "front", cx: "25%", cy: "35%", r: "8%" },
  { id: "forearms", label: "Forearms", side: "front", cx: "18%", cy: "50%", r: "6%" },
  { id: "core", label: "Core", side: "front", cx: "50%", cy: "45%", r: "10%" },
  { id: "quads", label: "Quads", side: "front", cx: "50%", cy: "65%", r: "12%" },
  
  { id: "traps", label: "Traps", side: "back", cx: "50%", cy: "18%", r: "10%" },
  { id: "back", label: "Back", side: "back", cx: "50%", cy: "35%", r: "14%" },
  { id: "triceps", label: "Triceps", side: "back", cx: "75%", cy: "35%", r: "8%" },
  { id: "glutes", label: "Glutes", side: "back", cx: "50%", cy: "52%", r: "12%" },
  { id: "hamstrings", label: "Hamstrings", side: "back", cx: "50%", cy: "65%", r: "10%" },
  { id: "calves", label: "Calves", side: "back", cx: "50%", cy: "85%", r: "8%" },
];

const LEVEL_COLORS = {
  fresh: "fill-green-500",
  recovering: "fill-yellow-500",
  fatigued: "fill-red-500",
};

const BG_COLORS = {
  fresh: "bg-green-500",
  recovering: "bg-yellow-500",
  fatigued: "bg-red-500",
};

interface MuscleHeatmapProps {
  data: MuscleRecoveryData;
}

export function MuscleHeatmap({ data }: MuscleHeatmapProps) {
  const renderSide = (side: "front" | "back") => {
    const muscles = MUSCLE_GROUPS.filter((m) => m.side === side);
    
    return (
      <div className="relative w-full aspect-[1/2] max-w-[160px] mx-auto bg-muted/10 rounded-3xl border border-muted/20 overflow-hidden shadow-inner flex items-center justify-center">
        {/* Simple silhouette placeholder */}
        <svg
          viewBox="0 0 100 200"
          className="absolute inset-0 w-full h-full opacity-10 pointer-events-none"
        >
          <path
            d="M50 10 C58 10 65 18 65 25 C65 30 50 35 50 35 C50 35 35 30 35 25 C35 18 42 10 50 10 Z"
            fill="currentColor"
          />
          <path
            d="M35 35 C20 35 15 45 10 60 C5 80 10 95 15 100 C20 90 25 80 30 60 C30 60 40 85 40 90 C40 105 35 140 35 160 C35 180 40 190 45 190 C50 190 50 105 50 105 C50 105 50 190 55 190 C60 190 65 180 65 160 C65 140 60 105 60 90 C60 85 70 60 70 60 C75 80 80 90 85 100 C90 95 95 80 90 60 C85 45 80 35 65 35 Z"
            fill="currentColor"
          />
        </svg>

        <svg className="absolute inset-0 w-full h-full">
          <TooltipProvider>
            {muscles.map((muscle) => {
              const level = data[muscle.id] || "fresh";
              return (
                <Tooltip key={muscle.id}>
                  <TooltipTrigger asChild>
                    <circle
                      cx={muscle.cx}
                      cy={muscle.cy}
                      r={muscle.r}
                      className={`${LEVEL_COLORS[level]} opacity-70 hover:opacity-100 transition-opacity cursor-pointer blur-[6px] hover:blur-none`}
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="flex flex-col gap-1 text-xs">
                      <span className="font-semibold capitalize">{muscle.label}</span>
                      <span className="text-muted-foreground capitalize">Status: {level}</span>
                    </div>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </TooltipProvider>
        </svg>
        
        <div className="absolute bottom-2 font-semibold text-xs tracking-wider text-muted-foreground uppercase opacity-50">
          {side}
        </div>
      </div>
    );
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="size-5 text-muted-foreground" />
          Muscle Recovery
        </CardTitle>
        <CardDescription>Estimated based on recent training volume</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap sm:flex-nowrap justify-center gap-6">
          <div className="w-1/2">{renderSide("front")}</div>
          <div className="w-1/2">{renderSide("back")}</div>
        </div>

        <div className="mt-6 flex justify-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className={`size-3 rounded-full ${BG_COLORS.fresh}`} />
            <span>Recovered</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className={`size-3 rounded-full ${BG_COLORS.recovering}`} />
            <span>Recovering</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className={`size-3 rounded-full ${BG_COLORS.fatigued}`} />
            <span>Fatigued</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
