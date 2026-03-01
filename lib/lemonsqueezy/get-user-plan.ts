import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

type PlanKey = Database["public"]["Tables"]["subscriptions"]["Row"]["plan_key"];

export interface UserPlan {
  planKey: PlanKey;
  isActive: boolean;
  isFree: boolean;
  isStarter: boolean;
  isPro: boolean;
  isZenMode: boolean;
}

const ACTIVE_STATUSES = ["active", "on_trial"] as const;

/**
 * Obtiene el plan activo del usuario desde Supabase.
 * Usar solo en API Routes (server-side). Para UI usar usePlan().
 */
export async function getUserPlan(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<UserPlan> {
  const { data: subscription, error } = await supabase
    .from("subscriptions")
    .select("plan_key, status")
    .eq("user_id", userId)
    .in("status", ACTIVE_STATUSES)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !subscription) {
    return { planKey: "free", isActive: true, isFree: true, isStarter: false, isPro: false, isZenMode: false };
  }

  return {
    planKey: subscription.plan_key,
    isActive: true,
    isFree: false,
    isStarter: subscription.plan_key === "starter",
    isPro: subscription.plan_key === "pro",
    isZenMode: subscription.plan_key === "zenmode",
  };
}

/** Límite de cuentas por plan. null = sin límite */
export const ACCOUNT_LIMITS: Record<PlanKey, number | null> = {
  free: 1,
  starter: 2,
  pro: null,
  zenmode: null,
};
