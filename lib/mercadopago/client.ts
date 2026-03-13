export type BillingInterval = "monthly" | "annual";
export type PlanKey = "starter" | "pro" | "zenmode";

export interface PlanPreapproval {
  preapprovalPlanId: string;
  name: string;
  priceUsd: number;    // Precio de referencia en USD (para mostrar en UI)
  priceCop: number;    // Precio real cobrado en COP (configurado en MP)
  interval: BillingInterval;
  frequency: number;   // 1 = mensual, 12 = anual
  frequencyType: "months";
}

// Precios COP calculados a TRM ~$4.100 COP/USD
export const PLAN_PREAPPROVALS: Record<PlanKey, Record<BillingInterval, PlanPreapproval>> = {
  starter: {
    monthly: {
      preapprovalPlanId: process.env.MERCADO_PAGO_STARTER_MONTHLY_PLAN_ID!,
      name: "Starter",
      priceUsd: 9,
      priceCop: 37000,
      interval: "monthly",
      frequency: 1,
      frequencyType: "months",
    },
    annual: {
      preapprovalPlanId: process.env.MERCADO_PAGO_STARTER_ANNUAL_PLAN_ID!,
      name: "Starter",
      priceUsd: 84,
      priceCop: 345000,
      interval: "annual",
      frequency: 12,
      frequencyType: "months",
    },
  },
  pro: {
    monthly: {
      preapprovalPlanId: process.env.MERCADO_PAGO_PRO_MONTHLY_PLAN_ID!,
      name: "Professional",
      priceUsd: 29,
      priceCop: 119000,
      interval: "monthly",
      frequency: 1,
      frequencyType: "months",
    },
    annual: {
      preapprovalPlanId: process.env.MERCADO_PAGO_PRO_ANNUAL_PLAN_ID!,
      name: "Professional",
      priceUsd: 249,
      priceCop: 1021000,
      interval: "annual",
      frequency: 12,
      frequencyType: "months",
    },
  },
  zenmode: {
    monthly: {
      preapprovalPlanId: process.env.MERCADO_PAGO_ZENMODE_MONTHLY_PLAN_ID!,
      name: "ZenMode",
      priceUsd: 59,
      priceCop: 242000,
      interval: "monthly",
      frequency: 1,
      frequencyType: "months",
    },
    annual: {
      preapprovalPlanId: process.env.MERCADO_PAGO_ZENMODE_ANNUAL_PLAN_ID!,
      name: "ZenMode",
      priceUsd: 499,
      priceCop: 2046000,
      interval: "annual",
      frequency: 12,
      frequencyType: "months",
    },
  },
};

// Mapa inverso: preapprovalPlanId → { plan, interval }
const PLAN_ID_TO_PLAN = new Map<string, { plan: PlanKey; interval: BillingInterval }>();
for (const [plan, intervals] of Object.entries(PLAN_PREAPPROVALS) as [PlanKey, Record<BillingInterval, PlanPreapproval>][]) {
  for (const [interval, variant] of Object.entries(intervals) as [BillingInterval, PlanPreapproval][]) {
    if (variant.preapprovalPlanId) {
      PLAN_ID_TO_PLAN.set(variant.preapprovalPlanId, { plan, interval });
    }
  }
}

export function getPlanFromPreapprovalPlanId(
  planId: string
): { plan: PlanKey; interval: BillingInterval } | null {
  return PLAN_ID_TO_PLAN.get(planId) ?? null;
}

// ─── Checkout URL ─────────────────────────────────────────────────────────────

/**
 * Devuelve la URL de checkout de Mercado Pago para un plan dado.
 * MP Colombia no permite crear preapprovals vía API sin card_token,
 * por lo que redirigimos directamente al init_point del plan.
 * El user_id se pasa en back_url para recuperarlo tras el pago.
 */
export function createCheckoutUrl({
  preapprovalPlanId,
}: {
  preapprovalPlanId: string;
  payerEmail: string;
  userId: string;
  backUrl: string;
}): string {
  return `https://www.mercadopago.com.co/subscriptions/checkout?preapproval_plan_id=${preapprovalPlanId}`;
}
