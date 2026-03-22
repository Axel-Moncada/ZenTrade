import crypto from 'crypto';
import type { BillingInterval, PlanKey } from '@/lib/lemonsqueezy/client';

// ── Entorno: detectado desde el prefijo de la clave privada ──────────────────
// prv_prod_ = producción | prv_test_ = sandbox

function getWompiApiBase(): string {
  const key = process.env.WOMPI_PRIVATE_KEY ?? '';
  return key.startsWith('prv_prod_')
    ? 'https://production.wompi.co/v1'
    : 'https://sandbox.wompi.co/v1';
}

// ── Precios en COP centavos (para el cobro en Wompi) ─────────────────────────
// USD → COP ~4200. Redondeado a número limpio.
// Mensual: $9→$38k | $29→$120k | $59→$250k
// Anual:   $84→$353k | $249→$1,050k | $499→$2,100k

export const WOMPI_PRICES_CENTS: Record<PlanKey, Record<BillingInterval, number>> = {
  starter: {
    monthly: 3_800_000,
    annual:  35_300_000,
  },
  pro: {
    monthly: 12_000_000,
    annual:  105_000_000,
  },
  zenmode: {
    monthly: 25_000_000,
    annual:  210_000_000,
  },
};

// ── Types ─────────────────────────────────────────────────────────────────────

export interface WompiPaymentLinkParams {
  plan: PlanKey;
  interval: BillingInterval;
  userId: string;
  userEmail: string;
  userName?: string;
  redirectUrl: string;
}

interface WompiPaymentLinkApiResponse {
  data: { id: string };
}

export interface CreatePaymentLinkResult {
  url: string;
  linkId: string;
}

interface WompiMerchantResponse {
  data: {
    presigned_acceptance: {
      acceptance_token: string;
      permalink: string;
    };
  };
}

export interface WompiWebhookPayload {
  event: string;
  data: {
    transaction: {
      id: string;
      reference: string;
      status: 'APPROVED' | 'DECLINED' | 'VOIDED' | 'ERROR' | 'PENDING';
      amount_in_cents: number;
      currency: string;
      customer_email: string;
      payment_source_id: string | null;
    };
  };
  sent_at: string;
  signature: {
    properties: string[];
    checksum: string;
  };
  timestamp: number;
}

// ── Reference ─────────────────────────────────────────────────────────────────
// Formato: ZT-{userId}-{plan}-{interval}-{timestamp}
// UUID (xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx) tiene 4 guiones internos → parseo desde el final

export function buildReference(
  userId: string,
  plan: PlanKey,
  interval: BillingInterval,
): string {
  return `ZT-${userId}-${plan}-${interval}-${Date.now()}`;
}

export function parseReference(
  reference: string,
): { userId: string; plan: PlanKey; interval: BillingInterval } | null {
  const parts = reference.split('-');
  // Mínimo: ['ZT', ...uuid(5 partes), plan, interval, timestamp] = 9 partes
  if (parts.length < 9 || parts[0] !== 'ZT') return null;

  const timestamp = parts[parts.length - 1];
  const interval  = parts[parts.length - 2] as BillingInterval;
  const plan      = parts[parts.length - 3] as PlanKey;
  const userId    = parts.slice(1, parts.length - 3).join('-');

  if (!/^\d+$/.test(timestamp)) return null;
  if (!['monthly', 'annual'].includes(interval)) return null;
  if (!['starter', 'pro', 'zenmode'].includes(plan)) return null;

  return { userId, plan, interval };
}

// ── Acceptance token (requerido por Wompi para toda transacción) ──────────────

export async function getAcceptanceToken(): Promise<string> {
  const publicKey = process.env.WOMPI_PUBLIC_KEY!;
  const base = getWompiApiBase();

  const res = await fetch(`${base}/merchants/${publicKey}`);
  if (!res.ok) throw new Error(`Wompi merchants error: ${res.status}`);

  const data = await res.json() as WompiMerchantResponse;
  return data.data.presigned_acceptance.acceptance_token;
}

// ── Integrity signature (SHA256 para transacciones directas) ──────────────────

export function computeIntegritySignature(
  reference: string,
  amountInCents: number,
): string {
  const integrityKey = process.env.WOMPI_INTEGRITY_KEY!;
  const toHash = `${reference}${amountInCents}COP${integrityKey}`;
  return crypto.createHash('sha256').update(toHash).digest('hex');
}

// ── Create payment link (primera suscripción) ─────────────────────────────────

const PLAN_NAMES: Record<PlanKey, string> = {
  starter: 'Starter',
  pro:     'Professional',
  zenmode: 'ZenMode',
};

const INTERVAL_NAMES: Record<BillingInterval, string> = {
  monthly: 'Mensual',
  annual:  'Anual',
};

export async function createPaymentLink(params: WompiPaymentLinkParams): Promise<CreatePaymentLinkResult> {
  const { plan, interval, userId, userEmail, userName, redirectUrl } = params;

  const base           = getWompiApiBase();
  const amountInCents  = WOMPI_PRICES_CENTS[plan][interval];
  const reference      = buildReference(userId, plan, interval);
  const privateKey     = process.env.WOMPI_PRIVATE_KEY!;

  const body: Record<string, unknown> = {
    name:             `ZenTrade ${PLAN_NAMES[plan]} - ${INTERVAL_NAMES[interval]}`,
    description:      `Suscripción ${INTERVAL_NAMES[interval].toLowerCase()} a ZenTrade ${PLAN_NAMES[plan]}`,
    single_use:       true,
    collect_shipping: false,
    currency:         'COP',
    amount_in_cents:  amountInCents,
    redirect_url:     redirectUrl,
    reference,
    customer_data: {
      customer_email: userEmail,
      ...(userName ? { customer_full_name: userName } : {}),
    },
  };

  const res = await fetch(`${base}/payment_links`, {
    method:  'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization:  `Bearer ${privateKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Wompi API ${res.status}: ${err}`);
  }

  const data = await res.json() as WompiPaymentLinkApiResponse;
  return {
    url:    `https://checkout.wompi.co/l/${data.data.id}`,
    linkId: data.data.id,
  };
}

// ── Charge payment source (cobro recurrente) ──────────────────────────────────
// Usa el payment_source_id guardado en la primera transacción para cobrar automáticamente.

interface ChargeResult {
  transactionId: string;
  status: 'APPROVED' | 'DECLINED' | 'VOIDED' | 'ERROR' | 'PENDING';
}

export async function chargePaymentSource(params: {
  paymentSourceId: string;
  plan: PlanKey;
  interval: BillingInterval;
  userId: string;
  customerEmail: string;
}): Promise<ChargeResult> {
  const { paymentSourceId, plan, interval, userId, customerEmail } = params;

  const base          = getWompiApiBase();
  const privateKey    = process.env.WOMPI_PRIVATE_KEY!;
  const amountInCents = WOMPI_PRICES_CENTS[plan][interval];
  const reference     = buildReference(userId, plan, interval);
  const acceptanceToken = await getAcceptanceToken();
  const signature       = computeIntegritySignature(reference, amountInCents);

  const body = {
    payment_source_id: paymentSourceId,
    amount_in_cents:   amountInCents,
    currency:          'COP',
    customer_email:    customerEmail,
    reference,
    acceptance_token:  acceptanceToken,
    signature: { integrity: signature },
  };

  const res = await fetch(`${base}/transactions`, {
    method:  'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization:  `Bearer ${privateKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Wompi charge error ${res.status}: ${err}`);
  }

  const data = await res.json() as { data: { id: string; status: ChargeResult['status'] } };
  return { transactionId: data.data.id, status: data.data.status };
}

// ── Webhook checksum validation ───────────────────────────────────────────────

export function validateWebhookChecksum(payload: WompiWebhookPayload): boolean {
  const eventsKey = process.env.WOMPI_EVENTS_KEY;
  if (!eventsKey) {
    console.warn('[wompi] WOMPI_EVENTS_KEY no configurado — saltando validación');
    return true;
  }

  const { properties, checksum } = payload.signature;

  const values = properties.map((prop) => {
    const keys = prop.split('.');
    let value: unknown = payload.data;
    for (const key of keys) {
      value = (value as Record<string, unknown>)?.[key];
    }
    return value != null ? String(value) : '';
  });

  const toHash  = [...values, payload.timestamp, eventsKey].join('');
  const computed = crypto.createHash('sha256').update(toHash).digest('hex');

  return computed === checksum;
}
