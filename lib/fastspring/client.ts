export type BillingInterval = "monthly" | "annual";
export type PlanKey = "starter" | "pro" | "zenmode";

export interface PlanVariant {
  productPath: string;
  name: string;
  price: number;
  interval: BillingInterval;
}

export const PLAN_VARIANTS: Record<PlanKey, Record<BillingInterval, PlanVariant>> = {
  starter: {
    monthly: { productPath: "starter-mensual",       name: "Starter",       price: 9,   interval: "monthly" },
    annual:  { productPath: "starter-anual",          name: "Starter",       price: 84,  interval: "annual"  },
  },
  pro: {
    monthly: { productPath: "professional-mensual",  name: "Professional",  price: 29,  interval: "monthly" },
    annual:  { productPath: "professional-anual",    name: "Professional",  price: 249, interval: "annual"  },
  },
  zenmode: {
    monthly: { productPath: "zenmode-mensual",       name: "ZenMode",       price: 59,  interval: "monthly" },
    annual:  { productPath: "zenmode-anual",         name: "ZenMode",       price: 499, interval: "annual"  },
  },
};

// Mapa inverso: productPath → { plan, interval }
const PATH_TO_PLAN = new Map<string, { plan: PlanKey; interval: BillingInterval }>();
for (const [plan, intervals] of Object.entries(PLAN_VARIANTS) as [PlanKey, Record<BillingInterval, PlanVariant>][]) {
  for (const [interval, variant] of Object.entries(intervals) as [BillingInterval, PlanVariant][]) {
    PATH_TO_PLAN.set(variant.productPath, { plan, interval });
  }
}

export function getPlanFromProductPath(
  path: string
): { plan: PlanKey; interval: BillingInterval } | null {
  return PATH_TO_PLAN.get(path) ?? null;
}

// ─── Session API ─────────────────────────────────────────────────────────────

interface FastSpringSessionResponse {
  id: string;
}

/**
 * Crea una sesión de checkout en FastSpring y devuelve la URL.
 * Usar solo en API Routes (server-side).
 */
export async function createCheckoutSession({
  email,
  firstName,
  lastName,
  productPath,
  userId,
}: {
  email: string;
  firstName?: string;
  lastName?: string;
  productPath: string;
  userId: string;
}): Promise<string> {
  const username = process.env.FASTSPRING_API_USERNAME;
  const password = process.env.FASTSPRING_API_PASSWORD;
  const storefront = process.env.FASTSPRING_STOREFRONT;

  if (!username || !password || !storefront) {
    throw new Error("FASTSPRING_API_USERNAME, FASTSPRING_API_PASSWORD o FASTSPRING_STOREFRONT no configurados");
  }

  const credentials = Buffer.from(`${username}:${password}`).toString("base64");

  // Intentar crear session via API
  const contact: { email: string; first?: string; last?: string } = { email };
  if (firstName) contact.first = firstName;
  if (lastName) contact.last = lastName;

  const body = {
    reset: true,
    account: { contact },
    items: [{ product: productPath, quantity: 1 }],
    tags: { user_id: userId },
  };

  try {
    const response = await fetch("https://api.fastspring.com/sessions", {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const responseText = await response.text();
    console.log(`[FastSpring] Session API ${response.status}:`, responseText);

    if (response.ok && responseText) {
      const data = JSON.parse(responseText) as FastSpringSessionResponse;
      if (data.id) {
        return `https://${storefront}/session/${data.id}`;
      }
    }
  } catch (err) {
    console.warn("[FastSpring] Session API falló, usando URL directa:", err);
  }

  // Fallback: URL directa (funciona siempre, sin API)
  const params = new URLSearchParams({ email });
  if (userId) params.set("tags.user_id", userId);
  console.log("[FastSpring] Usando URL directa para:", productPath);
  return `https://${storefront}/${productPath}?${params.toString()}`;
}
