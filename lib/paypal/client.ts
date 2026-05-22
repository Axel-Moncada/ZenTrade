import type { PlanKey, BillingInterval } from '@/lib/lemonsqueezy/client';

export const PAYPAL_PRICES_USD: Record<PlanKey, Record<BillingInterval, string>> = {
  starter: { monthly: '9.00',   annual: '84.00'  },
  pro:     { monthly: '29.00',  annual: '249.00' },
  zenmode: { monthly: '59.00',  annual: '499.00' },
};

// ── Config ────────────────────────────────────────────────────────────────────

function getApiBase(): string {
  return process.env.PAYPAL_MODE === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';
}

function getCredentials(): { clientId: string; clientSecret: string } {
  const isLive = process.env.PAYPAL_MODE === 'live';
  return {
    clientId:     (isLive ? process.env.PAYPAL_LIVE_CLIENT_ID     : process.env.PAYPAL_SANDBOX_CLIENT_ID)!,
    clientSecret: (isLive ? process.env.PAYPAL_LIVE_CLIENT_SECRET : process.env.PAYPAL_SANDBOX_CLIENT_SECRET)!,
  };
}

export function getPlanId(plan: PlanKey, interval: BillingInterval): string {
  const prefix = process.env.PAYPAL_MODE === 'live' ? 'PAYPAL_LIVE' : 'PAYPAL_SANDBOX';
  const id = process.env[`${prefix}_${plan.toUpperCase()}_${interval.toUpperCase()}_PLAN_ID`];
  if (!id) throw new Error(`Plan ID no encontrado: ${prefix}_${plan.toUpperCase()}_${interval.toUpperCase()}_PLAN_ID`);
  return id;
}

// ── Token (cached in memory) ──────────────────────────────────────────────────

let tokenCache: { token: string; expiresAt: number } | null = null;

export async function getAccessToken(): Promise<string> {
  if (tokenCache && Date.now() < tokenCache.expiresAt) return tokenCache.token;

  const { clientId, clientSecret } = getCredentials();
  const res = await fetch(`${getApiBase()}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
    },
    body: 'grant_type=client_credentials',
  });

  if (!res.ok) throw new Error(`PayPal auth error: ${res.status}`);
  const data = await res.json() as { access_token: string; expires_in: number };

  tokenCache = {
    token:     data.access_token,
    expiresAt: Date.now() + (data.expires_in - 60) * 1000,
  };
  return tokenCache.token;
}

// ── Create subscription ───────────────────────────────────────────────────────

export interface CreateSubscriptionParams {
  plan:      PlanKey;
  interval:  BillingInterval;
  userId:    string;
  userEmail: string;
  userName?: string;
  returnUrl: string;
  cancelUrl: string;
}

export interface CreateSubscriptionResult {
  subscriptionId: string;
  approvalUrl:    string;
}

export async function createSubscription(params: CreateSubscriptionParams): Promise<CreateSubscriptionResult> {
  const { plan, interval, userId, userEmail, userName, returnUrl, cancelUrl } = params;
  const token  = await getAccessToken();
  const planId = getPlanId(plan, interval);

  const nameParts  = (userName ?? '').split(' ');
  const givenName  = nameParts[0] ?? '';
  const surname    = nameParts.slice(1).join(' ') || givenName;

  const body = {
    plan_id:   planId,
    custom_id: `${userId}|${plan}|${interval}`,
    subscriber: {
      email_address: userEmail,
      ...(userName ? { name: { given_name: givenName, surname } } : {}),
    },
    application_context: {
      brand_name:          'ZenTrade',
      locale:              'es-CO',
      shipping_preference: 'NO_SHIPPING',
      user_action:         'SUBSCRIBE_NOW',
      payment_method: {
        payer_selected:  'PAYPAL',
        payee_preferred: 'IMMEDIATE_PAYMENT_REQUIRED',
      },
      return_url: returnUrl,
      cancel_url: cancelUrl,
    },
  };

  const res = await fetch(`${getApiBase()}/v1/billing/subscriptions`, {
    method: 'POST',
    headers: {
      'Content-Type':      'application/json',
      Authorization:       `Bearer ${token}`,
      'PayPal-Request-Id': `${userId}-${Date.now()}`,
      Prefer:              'return=representation',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`PayPal subscription error ${res.status}: ${err}`);
  }

  const data = await res.json() as { id: string; links: Array<{ href: string; rel: string }> };
  const approvalUrl = data.links.find(l => l.rel === 'approve')?.href;
  if (!approvalUrl) throw new Error('No approval URL en respuesta de PayPal');

  return { subscriptionId: data.id, approvalUrl };
}

// ── Get subscription ──────────────────────────────────────────────────────────

export interface PayPalSubscriptionDetails {
  id:           string;
  status:       string;
  custom_id:    string;
  subscriber:   { email_address: string; payer_id?: string };
  billing_info: { next_billing_time?: string };
}

export async function getSubscription(subscriptionId: string): Promise<PayPalSubscriptionDetails> {
  const token = await getAccessToken();
  const res = await fetch(`${getApiBase()}/v1/billing/subscriptions/${subscriptionId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`PayPal getSubscription error: ${res.status}`);
  return res.json() as Promise<PayPalSubscriptionDetails>;
}

// ── Cancel subscription ───────────────────────────────────────────────────────

export async function cancelSubscription(subscriptionId: string): Promise<void> {
  const token = await getAccessToken();
  const res = await fetch(`${getApiBase()}/v1/billing/subscriptions/${subscriptionId}/cancel`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization:  `Bearer ${token}`,
    },
    body: JSON.stringify({ reason: 'Cancelado por el usuario desde ZenTrade' }),
  });
  // 422 = ya estaba cancelada — no es error
  if (!res.ok && res.status !== 422) {
    throw new Error(`PayPal cancelSubscription error: ${res.status}`);
  }
}

// ── Webhook verification ──────────────────────────────────────────────────────

export interface PayPalWebhookEvent {
  id:         string;
  event_type: string;
  resource:   Record<string, unknown>;
}

export async function verifyWebhookSignature(
  headers: Record<string, string>,
  rawBody: string,
): Promise<boolean> {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  if (!webhookId) {
    console.error('[paypal] PAYPAL_WEBHOOK_ID no configurado');
    return false;
  }

  const token = await getAccessToken();
  const res = await fetch(`${getApiBase()}/v1/notifications/verify-webhook-signature`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization:  `Bearer ${token}`,
    },
    body: JSON.stringify({
      auth_algo:          headers['paypal-auth-algo'],
      cert_url:           headers['paypal-cert-url'],
      transmission_id:    headers['paypal-transmission-id'],
      transmission_sig:   headers['paypal-transmission-sig'],
      transmission_time:  headers['paypal-transmission-time'],
      webhook_id:         webhookId,
      webhook_event:      JSON.parse(rawBody) as unknown,
    }),
  });

  if (!res.ok) return false;
  const data = await res.json() as { verification_status: string };
  return data.verification_status === 'SUCCESS';
}
