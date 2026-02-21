import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig  = request.headers.get('stripe-signature');

  if (!sig) {
    return NextResponse.json({ error: 'Missing stripe-signature' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error('[webhook] Signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  console.log(`[webhook] ${event.type} [${event.id}]`);

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await onCheckoutCompleted(event.data.object as Stripe.CheckoutSession);
        break;
      case 'invoice.paid':
        await onInvoicePaid(event.data.object as Stripe.Invoice);
        break;
      case 'invoice.payment_failed':
        await onInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;
      case 'customer.subscription.updated':
        await onSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
      case 'customer.subscription.deleted':
        await onSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      default:
        break;
    }
  } catch (err) {
    console.error(`[webhook] Handler error (${event.type}):`, err);
    return NextResponse.json({ error: 'Handler error' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

// ── Helpers ──────────────────────────────────────────────────────────────────

async function getUserId(customerId: string): Promise<string | null> {
  const { data } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single();
  return (data as { id: string } | null)?.id ?? null;
}

async function getPlanId(sub: Stripe.Subscription): Promise<string | null> {
  const priceId = sub.items.data[0]?.price?.id;

  if (priceId) {
    const { data } = await supabaseAdmin
      .from('plans')
      .select('id')
      .or(`stripe_price_monthly_id.eq.${priceId},stripe_price_annual_id.eq.${priceId}`)
      .maybeSingle();
    if (data) return (data as { id: string }).id;
  }

  // Fallback: plan_slug stored in subscription metadata at checkout
  const slug = sub.metadata?.plan_slug;
  if (slug) {
    const { data } = await supabaseAdmin
      .from('plans')
      .select('id')
      .eq('slug', slug)
      .single();
    return (data as { id: string } | null)?.id ?? null;
  }

  return null;
}

function strId(v: string | { id: string } | null): string | null {
  if (!v) return null;
  return typeof v === 'string' ? v : v.id;
}

// ── Handlers ─────────────────────────────────────────────────────────────────

async function onCheckoutCompleted(session: Stripe.CheckoutSession) {
  if (session.mode !== 'subscription' || !session.subscription || !session.customer) return;

  const customerId = strId(session.customer as string | { id: string })!;
  const stripeSubId = strId(session.subscription as string | { id: string })!;

  const userId = await getUserId(customerId);
  if (!userId) {
    console.error('[webhook] No user for customer:', customerId);
    return;
  }

  const sub = await stripe.subscriptions.retrieve(stripeSubId);
  const planId = await getPlanId(sub);

  await supabaseAdmin.from('subscriptions').upsert(
    {
      user_id:               userId,
      plan_id:               planId,
      stripe_subscription_id: sub.id,
      stripe_customer_id:    customerId,
      status:                sub.status,
      billing_interval:      sub.items.data[0]?.price?.recurring?.interval ?? 'month',
      current_period_start:  new Date(sub.current_period_start * 1000).toISOString(),
      current_period_end:    new Date(sub.current_period_end   * 1000).toISOString(),
      cancel_at_period_end:  sub.cancel_at_period_end,
      updated_at:            new Date().toISOString(),
    },
    { onConflict: 'stripe_subscription_id' }
  );
}

async function onInvoicePaid(invoice: Stripe.Invoice) {
  if (!invoice.subscription || !invoice.customer) return;

  const customerId = strId(invoice.customer as string | { id: string })!;
  const stripeSubId = strId(invoice.subscription as string | { id: string })!;

  const userId = await getUserId(customerId);
  if (!userId) return;

  const { data: sub } = await supabaseAdmin
    .from('subscriptions')
    .select('id')
    .eq('stripe_subscription_id', stripeSubId)
    .maybeSingle();

  await supabaseAdmin.from('payments').upsert(
    {
      user_id:                 userId,
      subscription_id:         (sub as { id: string } | null)?.id ?? null,
      stripe_invoice_id:       invoice.id!,
      stripe_payment_intent_id: strId(invoice.payment_intent as string | { id: string } | null),
      amount_cents:            invoice.amount_paid,
      currency:                invoice.currency,
      status:                  'paid',
      paid_at:                 invoice.status_transitions?.paid_at
                                 ? new Date(invoice.status_transitions.paid_at * 1000).toISOString()
                                 : new Date().toISOString(),
    },
    { onConflict: 'stripe_invoice_id' }
  );

  // Ensure subscription reflects active status
  await supabaseAdmin
    .from('subscriptions')
    .update({ status: 'active', updated_at: new Date().toISOString() })
    .eq('stripe_subscription_id', stripeSubId);
}

async function onInvoicePaymentFailed(invoice: Stripe.Invoice) {
  if (!invoice.subscription) return;
  const stripeSubId = strId(invoice.subscription as string | { id: string })!;

  await supabaseAdmin
    .from('subscriptions')
    .update({ status: 'past_due', updated_at: new Date().toISOString() })
    .eq('stripe_subscription_id', stripeSubId);

  if (!invoice.customer) return;
  const customerId = strId(invoice.customer as string | { id: string })!;
  const userId = await getUserId(customerId);
  if (!userId) return;

  const { data: sub } = await supabaseAdmin
    .from('subscriptions')
    .select('id')
    .eq('stripe_subscription_id', stripeSubId)
    .maybeSingle();

  await supabaseAdmin.from('payments').upsert(
    {
      user_id:                 userId,
      subscription_id:         (sub as { id: string } | null)?.id ?? null,
      stripe_invoice_id:       invoice.id!,
      stripe_payment_intent_id: strId(invoice.payment_intent as string | { id: string } | null),
      amount_cents:            invoice.amount_due,
      currency:                invoice.currency,
      status:                  'failed',
    },
    { onConflict: 'stripe_invoice_id' }
  );
}

async function onSubscriptionUpdated(sub: Stripe.Subscription) {
  const planId = await getPlanId(sub);

  await supabaseAdmin
    .from('subscriptions')
    .update({
      plan_id:              planId,
      status:               sub.status,
      billing_interval:     sub.items.data[0]?.price?.recurring?.interval ?? 'month',
      current_period_start: new Date(sub.current_period_start * 1000).toISOString(),
      current_period_end:   new Date(sub.current_period_end   * 1000).toISOString(),
      cancel_at_period_end: sub.cancel_at_period_end,
      canceled_at:          sub.canceled_at ? new Date(sub.canceled_at * 1000).toISOString() : null,
      updated_at:           new Date().toISOString(),
    })
    .eq('stripe_subscription_id', sub.id);
}

async function onSubscriptionDeleted(sub: Stripe.Subscription) {
  await supabaseAdmin
    .from('subscriptions')
    .update({
      status:              'canceled',
      cancel_at_period_end: false,
      canceled_at:         new Date().toISOString(),
      updated_at:          new Date().toISOString(),
    })
    .eq('stripe_subscription_id', sub.id);
}
