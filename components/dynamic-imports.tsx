"use client";

import dynamic from "next/dynamic";

export const AiCoachDialog = dynamic(
  () =>
    import("@/components/AiCoachDialog").then((m) => ({
      default: m.AiCoachDialog,
    })),
  { ssr: false },
);

export const ExerciseSelector = dynamic(
  () =>
    import("@/components/ExerciseSelector").then((m) => ({
      default: m.ExerciseSelector,
    })),
  { ssr: false },
);

export const Paywall = dynamic(
  () => import("@/components/Paywall").then((m) => ({ default: m.Paywall })),
  { ssr: false },
);
