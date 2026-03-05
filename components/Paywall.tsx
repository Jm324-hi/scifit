"use client";

import { useState } from "react";
import { Check, X, Crown, Lock } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import type { Feature } from "@/lib/subscription";

const FEATURE_LIST = [
  {
    label: "Training Plans",
    free: "1 active plan",
    pro: "Unlimited plans + regenerate",
  },
  {
    label: "Workout History",
    free: "Last 30 days",
    pro: "Unlimited + data export",
  },
  {
    label: "Recovery Readiness",
    free: "View score only",
    pro: "Auto-adjust workouts",
  },
  { label: "AI Assistance", free: "5 uses / day", pro: "Unlimited" },
  {
    label: "Progress Analytics",
    free: "PR Board only",
    pro: "Full stats + trends",
  },
];

const FEATURE_HIGHLIGHT: Record<Feature, string> = {
  unlimited_plans: "Training Plans",
  recovery_adjustment: "Recovery Readiness",
  unlimited_history: "Workout History",
  advanced_progress: "Progress Analytics",
  unlimited_ai: "AI Assistance",
  data_export: "Workout History",
};

interface PaywallProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feature?: Feature;
}

export function Paywall({ open, onOpenChange, feature }: PaywallProps) {
  const highlightLabel = feature ? FEATURE_HIGHLIGHT[feature] : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown className="size-5 text-yellow-500" />
            Upgrade to SciFit Pro
          </DialogTitle>
          <DialogDescription>
            Unlock the full potential of science-based training
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          {FEATURE_LIST.map((item) => {
            const isHighlighted = highlightLabel === item.label;
            return (
              <div
                key={item.label}
                className={`rounded-md border p-3 ${isHighlighted ? "border-yellow-400 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/30" : ""}`}
              >
                <p
                  className={`text-sm font-medium ${isHighlighted ? "text-yellow-800 dark:text-yellow-200" : ""}`}
                >
                  {item.label}
                </p>
                <div className="mt-1 grid grid-cols-2 gap-2 text-xs">
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <X className="size-3 shrink-0 text-red-400" />
                    {item.free}
                  </span>
                  <span className="flex items-center gap-1 text-foreground">
                    <Check className="size-3 shrink-0 text-green-500" />
                    {item.pro}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 p-4 text-center">
          <p className="text-2xl font-bold">
            $9.99
            <span className="text-sm font-normal text-muted-foreground">
              /month
            </span>
          </p>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button
            className="w-full"
            onClick={() => {
              toast.info("Payment integration coming soon");
              onOpenChange(false);
            }}
          >
            <Crown className="size-4" />
            Upgrade Now
          </Button>
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => onOpenChange(false)}
          >
            Maybe Later
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* Reusable lock overlay for gating sections (works inside server components) */
export function ProGate({
  locked,
  feature,
  children,
}: {
  locked: boolean;
  feature: Feature;
  children: React.ReactNode;
}) {
  const [showPaywall, setShowPaywall] = useState(false);

  if (!locked) return <>{children}</>;

  return (
    <div className="relative">
      <div className="pointer-events-none select-none blur-sm" aria-hidden>
        {children}
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-lg bg-background/60 backdrop-blur-[2px]">
        <Lock className="size-8 text-muted-foreground" />
        <p className="text-sm font-medium text-muted-foreground">
          Pro feature
        </p>
        <Button size="sm" onClick={() => setShowPaywall(true)}>
          Upgrade to Pro
        </Button>
      </div>
      <Paywall
        open={showPaywall}
        onOpenChange={setShowPaywall}
        feature={feature}
      />
    </div>
  );
}
