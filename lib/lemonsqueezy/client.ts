import { lemonSqueezySetup } from "@lemonsqueezy/lemonsqueezy.js";

export function configureLemonSqueezy() {
  const apiKey = process.env.LEMONSQUEEZY_API_KEY;
  if (!apiKey) {
    throw new Error("LEMONSQUEEZY_API_KEY is not set");
  }

  lemonSqueezySetup({
    apiKey,
    onError(error) {
      console.error("[LemonSqueezy]", error);
    },
  });
}

export const LEMON_STORE_ID = process.env.LEMONSQUEEZY_STORE_ID!;

export type BillingInterval = "monthly" | "annual";
export type PlanKey = "starter" | "pro" | "zenmode";

export interface PlanVariant {
  variantId: string;
  name: string;
  price: number;
  interval: BillingInterval;
}

export const PLAN_VARIANTS: Record<PlanKey, Record<BillingInterval, PlanVariant>> = {
  starter: {
    monthly: {
      variantId: process.env.LEMONSQUEEZY_STARTER_MONTHLY_VARIANT_ID!,
      name: "Starter",
      price: 9,
      interval: "monthly",
    },
    annual: {
      variantId: process.env.LEMONSQUEEZY_STARTER_ANNUAL_VARIANT_ID!,
      name: "Starter",
      price: 7,
      interval: "annual",
    },
  },
  pro: {
    monthly: {
      variantId: process.env.LEMONSQUEEZY_PRO_MONTHLY_VARIANT_ID!,
      name: "Professional",
      price: 29,
      interval: "monthly",
    },
    annual: {
      variantId: process.env.LEMONSQUEEZY_PRO_ANNUAL_VARIANT_ID!,
      name: "Professional",
      price: 23,
      interval: "annual",
    },
  },
  zenmode: {
    monthly: {
      variantId: process.env.LEMONSQUEEZY_ZENMODE_MONTHLY_VARIANT_ID ?? "",
      name: "ZenMode",
      price: 59,
      interval: "monthly",
    },
    annual: {
      variantId: process.env.LEMONSQUEEZY_ZENMODE_ANNUAL_VARIANT_ID ?? "",
      name: "ZenMode",
      price: 42,
      interval: "annual",
    },
  },
};

/** Returns the plan key and interval from a variant ID, or null if not found */
export function getPlanFromVariantId(
  variantId: string
): { plan: PlanKey; interval: BillingInterval } | null {
  for (const [plan, intervals] of Object.entries(PLAN_VARIANTS) as [
    PlanKey,
    Record<BillingInterval, PlanVariant>,
  ][]) {
    for (const [interval, variant] of Object.entries(intervals) as [
      BillingInterval,
      PlanVariant,
    ][]) {
      if (variant.variantId === variantId) {
        return { plan, interval };
      }
    }
  }
  return null;
}
