export type BillingInterval = "monthly" | "annual";
export type PlanKey = "starter" | "pro" | "zenmode";

export interface PayPalPlan {
  planId: string;
  name: string;
  priceUsd: number;
  interval: BillingInterval;
}

export const PAYPAL_PLANS: Record<PlanKey, Record<BillingInterval, PayPalPlan>> = {
  starter: {
    monthly: { planId: process.env.PAYPAL_STARTER_MONTHLY_PLAN_ID!, name: "Starter",       priceUsd: 9,   interval: "monthly" },
    annual:  { planId: process.env.PAYPAL_STARTER_ANNUAL_PLAN_ID!,  name: "Starter",       priceUsd: 84,  interval: "annual"  },
  },
  pro: {
    monthly: { planId: process.env.PAYPAL_PRO_MONTHLY_PLAN_ID!,     name: "Professional",  priceUsd: 29,  interval: "monthly" },
    annual:  { planId: process.env.PAYPAL_PRO_ANNUAL_PLAN_ID!,      name: "Professional",  priceUsd: 249, interval: "annual"  },
  },
  zenmode: {
    monthly: { planId: process.env.PAYPAL_ZENMODE_MONTHLY_PLAN_ID!, name: "ZenMode",       priceUsd: 59,  interval: "monthly" },
    annual:  { planId: process.env.PAYPAL_ZENMODE_ANNUAL_PLAN_ID!,  name: "ZenMode",       priceUsd: 499, interval: "annual"  },
  },
};

// Mapa inverso: planId → { plan, interval }
const PLAN_ID_TO_PLAN = new Map<string, { plan: PlanKey; interval: BillingInterval }>();
for (const [plan, intervals] of Object.entries(PAYPAL_PLANS) as [PlanKey, Record<BillingInterval, PayPalPlan>][]) {
  for (const [interval, variant] of Object.entries(intervals) as [BillingInterval, PayPalPlan][]) {
    if (variant.planId) {
      PLAN_ID_TO_PLAN.set(variant.planId, { plan, interval });
    }
  }
}

export function getPlanFromPayPalPlanId(
  planId: string
): { plan: PlanKey; interval: BillingInterval } | null {
  return PLAN_ID_TO_PLAN.get(planId) ?? null;
}

// ─── OAuth ────────────────────────────────────────────────────────────────────

const PAYPAL_BASE =
  process.env.PAYPAL_MODE === "sandbox"
    ? "https://api-m.sandbox.paypal.com"
    : "https://api-m.paypal.com";

interface PayPalTokenResponse {
  access_token: string;
  expires_in: number;
}

let cachedToken: { token: string; expiresAt: number } | null = null;

export async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.token;
  }

  const clientId = process.env.PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !secret) {
    throw new Error("PAYPAL_CLIENT_ID o PAYPAL_CLIENT_SECRET no configurados");
  }

  const credentials = Buffer.from(`${clientId}:${secret}`).toString("base64");

  const response = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    throw new Error(`PayPal OAuth error ${response.status}: ${await response.text()}`);
  }

  const data = (await response.json()) as PayPalTokenResponse;
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 60) * 1000,
  };

  return cachedToken.token;
}

// ─── Crear suscripción ────────────────────────────────────────────────────────

interface PayPalSubscriptionResponse {
  id: string;
  status: string;
  links: { href: string; rel: string; method: string }[];
}

/**
 * Crea una suscripción en PayPal y devuelve la URL de aprobación.
 * Usar solo en API Routes (server-side).
 */
export async function createSubscriptionUrl({
  planId,
  subscriberEmail,
  userId,
  returnUrl,
  cancelUrl,
}: {
  planId: string;
  subscriberEmail: string;
  userId: string;
  returnUrl: string;
  cancelUrl: string;
}): Promise<string> {
  const token = await getAccessToken();

  const body = {
    plan_id: planId,
    subscriber: {
      email_address: subscriberEmail,
    },
    custom_id: userId,
    application_context: {
      brand_name: "Zentrade",
      locale: "es-CO",
      shipping_preference: "NO_SHIPPING",
      user_action: "SUBSCRIBE_NOW",
      return_url: returnUrl,
      cancel_url: cancelUrl,
    },
  };

  const response = await fetch(`${PAYPAL_BASE}/v1/billing/subscriptions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify(body),
  });

  const responseText = await response.text();
  console.log(`[PayPal] POST /subscriptions ${response.status}:`, responseText);

  if (!response.ok) {
    throw new Error(`PayPal API error ${response.status}: ${responseText}`);
  }

  const data = JSON.parse(responseText) as PayPalSubscriptionResponse;
  const approveLink = data.links.find((l) => l.rel === "approve");

  if (!approveLink) {
    throw new Error("PayPal no retornó link de aprobación");
  }

  return approveLink.href;
}

export { PAYPAL_BASE };
