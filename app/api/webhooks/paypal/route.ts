import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { verifyWebhookSignature } from '@/lib/paypal/client';
import type { PayPalWebhookEvent } from '@/lib/paypal/client';
import { activatePayPalSubscription } from '@/lib/paypal/activate-subscription';
import type { PlanKey, BillingInterval } from '@/lib/lemonsqueezy/client';

const resend = new Resend(process.env.RESEND_API_KEY);

async function notifyAdmin(userId: string, plan: PlanKey, interval: BillingInterval, subscriptionId: string) {
  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to:   'axelemoncada@gmail.com',
    subject: `💰 Nueva suscripción — ${plan} ${interval}`,
    html: `
      <h2>Nueva suscripción activada en ZenTrade</h2>
      <p><b>Plan:</b> ${plan} (${interval})</p>
      <p><b>Usuario:</b> ${userId}</p>
      <p><b>Subscription ID:</b> ${subscriptionId}</p>
      <p><b>Hora:</b> ${new Date().toLocaleString('es-CO', { timeZone: 'America/Bogota' })}</p>
    `,
  });
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();

  const headers: Record<string, string> = {
    'paypal-auth-algo':        req.headers.get('paypal-auth-algo')        ?? '',
    'paypal-cert-url':         req.headers.get('paypal-cert-url')         ?? '',
    'paypal-transmission-id':  req.headers.get('paypal-transmission-id')  ?? '',
    'paypal-transmission-sig': req.headers.get('paypal-transmission-sig') ?? '',
    'paypal-transmission-time':req.headers.get('paypal-transmission-time')?? '',
  };

  const isValid = await verifyWebhookSignature(headers, rawBody);
  if (!isValid) {
    console.error('[paypal-webhook] firma inválida');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const event    = JSON.parse(rawBody) as PayPalWebhookEvent;
  const resource = event.resource;

  console.log(`[paypal-webhook] ${event.event_type}`);

  switch (event.event_type) {
    case 'BILLING.SUBSCRIPTION.ACTIVATED':
      await handleActivated(resource);
      break;
    case 'PAYMENT.SALE.COMPLETED':
      await handlePaymentCompleted(resource);
      break;
    case 'BILLING.SUBSCRIPTION.CANCELLED':
    case 'BILLING.SUBSCRIPTION.EXPIRED':
    case 'BILLING.SUBSCRIPTION.SUSPENDED':
      await handleEnded(resource, event.event_type);
      break;
    default:
      // Evento no manejado — ignorar silenciosamente
      break;
  }

  return NextResponse.json({ ok: true });
}

async function handleActivated(resource: Record<string, unknown>) {
  const subscriber  = resource.subscriber as { email_address?: string; payer_id?: string } | undefined;
  const billingInfo = resource.billing_info as { next_billing_time?: string } | undefined;
  const subscriptionId = resource.id as string;

  const result = await activatePayPalSubscription({
    subscriptionId,
    customId:        resource.custom_id as string | undefined,
    payerId:         subscriber?.payer_id ?? null,
    payerEmail:      subscriber?.email_address ?? null,
    nextBillingTime: billingInfo?.next_billing_time ?? null,
  });

  if (result.ok && !result.alreadyActive) {
    void notifyAdmin(result.userId, result.plan, result.interval, subscriptionId);
  }
}

async function handlePaymentCompleted(resource: Record<string, unknown>) {
  // billing_agreement_id = subscriptionId de PayPal en renovaciones
  const billingAgreementId = resource.billing_agreement_id as string | undefined;
  if (!billingAgreementId) return;

  const { data: sub } = await supabaseAdmin
    .from('subscriptions')
    .select('id, billing_interval')
    .eq('processor_subscription_id', billingAgreementId)
    .maybeSingle();

  if (!sub) {
    console.warn('[paypal-webhook] suscripción no encontrada para:', billingAgreementId);
    return;
  }

  const newEnd = new Date();
  newEnd.setDate(newEnd.getDate() + (sub.billing_interval === 'monthly' ? 30 : 365));

  await supabaseAdmin
    .from('subscriptions')
    .update({ status: 'active', current_period_end: newEnd.toISOString(), updated_at: new Date().toISOString() })
    .eq('id', sub.id);

  console.log(`[paypal-webhook] ✓ renovada ${billingAgreementId} hasta ${newEnd.toISOString()}`);
}

async function handleEnded(resource: Record<string, unknown>, eventType: string) {
  const subscriptionId = resource.id as string;
  const statusMap: Record<string, string> = {
    'BILLING.SUBSCRIPTION.CANCELLED':  'cancelled',
    'BILLING.SUBSCRIPTION.EXPIRED':    'expired',
    'BILLING.SUBSCRIPTION.SUSPENDED':  'past_due',
  };

  const { error } = await supabaseAdmin
    .from('subscriptions')
    .update({ status: statusMap[eventType] ?? 'cancelled', updated_at: new Date().toISOString() })
    .eq('processor_subscription_id', subscriptionId);

  if (error) console.error('[paypal-webhook] error actualizando estado:', error);
  else console.log(`[paypal-webhook] ✓ ${subscriptionId} → ${statusMap[eventType]}`);
}
