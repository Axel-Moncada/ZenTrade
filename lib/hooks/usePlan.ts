"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database.types";

type Subscription = Database["public"]["Tables"]["subscriptions"]["Row"];
type PlanKey = Subscription["plan_key"];
type SubscriptionStatus = Subscription["status"];

export interface PlanInfo {
  planKey: PlanKey;
  status: SubscriptionStatus | null;
  billingInterval: Subscription["billing_interval"] | null;
  currentPeriodEnd: string | null;
  isActive: boolean;
  isFree: boolean;
  isStarter: boolean;
  isPro: boolean;
  isZenMode: boolean;
  loading: boolean;
  error: string | null;
}

const FREE_PLAN: Omit<PlanInfo, "loading" | "error"> = {
  planKey: "free",
  status: null,
  billingInterval: null,
  currentPeriodEnd: null,
  isActive: true,
  isFree: true,
  isStarter: false,
  isPro: false,
  isZenMode: false,
};

const ACTIVE_STATUSES: SubscriptionStatus[] = ["active", "on_trial"];

export function usePlan(): PlanInfo {
  const [info, setInfo] = useState<PlanInfo>({
    ...FREE_PLAN,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const supabase = createClient();
    let isMounted = true;

    async function fetchPlan() {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        if (isMounted) {
          setInfo({ ...FREE_PLAN, loading: false, error: null });
        }
        return;
      }

      const { data: subscription, error: subError } = await supabase
        .from("subscriptions")
        .select("plan_key, status, billing_interval, current_period_end")
        .eq("user_id", user.id)
        .in("status", ACTIVE_STATUSES)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (subError) {
        console.error("[usePlan] Error fetching subscription:", subError);
        if (isMounted) {
          setInfo({ ...FREE_PLAN, loading: false, error: subError.message });
        }
        return;
      }

      if (!subscription) {
        if (isMounted) {
          setInfo({ ...FREE_PLAN, loading: false, error: null });
        }
        return;
      }

      const isActive = ACTIVE_STATUSES.includes(subscription.status);

      if (isMounted) {
        setInfo({
          planKey: subscription.plan_key,
          status: subscription.status,
          billingInterval: subscription.billing_interval,
          currentPeriodEnd: subscription.current_period_end,
          isActive,
          isFree: false,
          isStarter: subscription.plan_key === "starter",
          isPro: subscription.plan_key === "pro",
          isZenMode: subscription.plan_key === "zenmode",
          loading: false,
          error: null,
        });
      }
    }

    fetchPlan();

    // Re-fetch cuando cambia la sesión (login/logout)
    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      fetchPlan();
    });

    return () => {
      isMounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  return info;
}
