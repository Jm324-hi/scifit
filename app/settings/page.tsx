"use client";

import { useState, useEffect } from "react";
import {
  User,
  Dumbbell,
  CreditCard,
  Info,
  Crown,
} from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import {
  getUserSubscription,
  type Subscription,
} from "@/lib/subscription";
import { Paywall } from "@/components/dynamic-imports";
import { SettingsLoadingSkeleton } from "@/components/loading/page-skeletons";
import { GymProfilesManager } from "@/components/settings/GymProfilesManager";

export default function SettingsPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function init() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || cancelled) {
        setLoading(false);
        return;
      }
      const sub = await getUserSubscription(supabase, user.id);
      if (!cancelled) setSubscription(sub);
      if (!cancelled) setLoading(false);
    }
    init();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return <SettingsLoadingSkeleton />;
  }

  const isPro =
    subscription?.plan_type === "pro" && subscription?.status === "active";

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Settings</h1>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="size-5 text-muted-foreground" />
              Account
            </CardTitle>
            <CardDescription>
              Manage your personal information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>Username: Not set</p>
              <p>Email: Not set</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Dumbbell className="size-5 text-muted-foreground" />
              Training Preferences
            </CardTitle>
            <CardDescription>
              Adjust your training goals and plan settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>Training Goal: Not set</p>
              <p>Weekly Frequency: Not set</p>
              <p>Equipment: Not set</p>
            </div>
          </CardContent>
        </Card>

        <GymProfilesManager />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="size-5 text-muted-foreground" />
              Subscription
            </CardTitle>
            <CardDescription>
              View and manage your subscription
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              {isPro ? (
                <>
                  <Badge className="bg-yellow-500 text-white hover:bg-yellow-600">
                    <Crown className="mr-1 size-3" />
                    Pro
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Full access to all features
                  </span>
                </>
              ) : (
                <>
                  <Badge variant="secondary">Free</Badge>
                  <span className="text-sm text-muted-foreground">
                    Basic features available
                  </span>
                </>
              )}
            </div>

            {isPro && subscription?.current_period_end && (
              <p className="text-sm text-muted-foreground">
                Current period ends:{" "}
                {new Date(subscription.current_period_end).toLocaleDateString(
                  "en-US",
                  { year: "numeric", month: "long", day: "numeric" },
                )}
              </p>
            )}

            {isPro ? (
              <Button
                variant="outline"
                onClick={() =>
                  toast.info("Subscription management coming soon")
                }
              >
                Manage Subscription
              </Button>
            ) : (
              <Button onClick={() => setShowPaywall(true)}>
                <Crown className="size-4" />
                Upgrade to Pro
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="size-5 text-muted-foreground" />
              About
            </CardTitle>
            <CardDescription>App information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>Kineroz v0.1.0</p>
              <p>Science-based smart training assistant</p>
            </div>
          </CardContent>
        </Card>

      </div>

      {showPaywall && (
        <Paywall open={showPaywall} onOpenChange={setShowPaywall} />
      )}
    </div>
  );
}
