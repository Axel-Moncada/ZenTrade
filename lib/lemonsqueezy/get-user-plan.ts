import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

type SubscriptionRow = Pick<
  Database["public"]["Tables"]["subscriptions"]["Row"],
  "plan_key" | "status"
>;
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

// Si el usuario tiene varias suscripciones activas (ej: starter + zenmode),
// se elige la de mayor jerarquía. Orden: zenmode > pro > starter > free.
const PLAN_PRIORITY: Record<PlanKey, number> = {
  zenmode: 3,
  pro: 2,
  starter: 1,
  free: 0,
};

/**
 * Obtiene el plan activo del usuario desde Supabase.
 * Usar solo en API Routes (server-side). Para UI usar usePlan().
 */
export async function getUserPlan(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<UserPlan> {
  const { data: subscriptions, error } = await supabase
    .from("subscriptions")
    .select("plan_key, status")
    .eq("user_id", userId)
    .in("status", ACTIVE_STATUSES) as { data: SubscriptionRow[] | null; error: unknown };

  if (error || !subscriptions || subscriptions.length === 0) {
    return { planKey: "free", isActive: true, isFree: true, isStarter: false, isPro: false, isZenMode: false };
  }

  // Elegir el plan de mayor jerarquía entre las suscripciones activas
  const subscription = subscriptions.sort(
    (a, b) => PLAN_PRIORITY[b.plan_key] - PLAN_PRIORITY[a.plan_key]
  )[0];

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
