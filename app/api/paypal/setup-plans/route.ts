/**
 * GET /api/paypal/setup-plans?secret=TU_CRON_SECRET
 *
 * Ruta temporal de setup — crea el producto y los 6 planes en PayPal.
 * Úsala UNA VEZ por entorno (sandbox y live), luego puedes borrar este archivo.
 *
 * Modo activo se toma de PAYPAL_MODE en .env.local
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAccessToken } from '@/lib/paypal/client';

const PLANS = [
  { key: 'starter', interval: 'monthly', price: '9.00',   label: 'Starter Mensual',     unit: 'MONTH' },
  { key: 'starter', interval: 'annual',  price: '84.00',  label: 'Starter Anual',        unit: 'YEAR'  },
  { key: 'pro',     interval: 'monthly', price: '29.00',  label: 'Professional Mensual', unit: 'MONTH' },
  { key: 'pro',     interval: 'annual',  price: '249.00', label: 'Professional Anual',   unit: 'YEAR'  },
  { key: 'zenmode', interval: 'monthly', price: '59.00',  label: 'ZenMode Mensual',      unit: 'MONTH' },
  { key: 'zenmode', interval: 'annual',  price: '499.00', label: 'ZenMode Anual',        unit: 'YEAR'  },
] as const;

function getApiBase() {
  return process.env.PAYPAL_MODE === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';
}

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret');
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const mode   = process.env.PAYPAL_MODE ?? 'sandbox';
  const base   = getApiBase();
  const token  = await getAccessToken();
  const prefix = `PAYPAL_${mode.toUpperCase()}`;

  // Crear producto
  const productRes = await fetch(`${base}/v1/catalogs/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      name:        'ZenTrade',
      description: 'Journal de trading para futuros con análisis IA',
      type:        'SERVICE',
      category:    'SOFTWARE',
      home_url:    'https://www.zen-trader.com',
    }),
  });

  if (!productRes.ok) {
    const err = await productRes.text();
    return NextResponse.json({ error: `Product: ${err}` }, { status: 500 });
  }

  const product = await productRes.json() as { id: string };
  const productId = product.id;

  // Crear los 6 planes
  const results: Record<string, string> = {};
  const envLines: string[] = [];

  for (const plan of PLANS) {
    const planRes = await fetch(`${base}/v1/billing/plans`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        product_id:  productId,
        name:        `ZenTrade ${plan.label}`,
        description: `Suscripción ${plan.label} a ZenTrade`,
        status:      'ACTIVE',
        billing_cycles: [{
          frequency:      { interval_unit: plan.unit, interval_count: 1 },
          tenure_type:    'REGULAR',
          sequence:       1,
          total_cycles:   0,
          pricing_scheme: {
            fixed_price: { value: plan.price, currency_code: 'USD' },
          },
        }],
        payment_preferences: {
          auto_bill_outstanding:     true,
          setup_fee_failure_action:  'CONTINUE',
          payment_failure_threshold: 3,
        },
      }),
    });

    if (!planRes.ok) {
      const err = await planRes.text();
      return NextResponse.json({ error: `Plan ${plan.label}: ${err}` }, { status: 500 });
    }

    const planData = await planRes.json() as { id: string };
    const envKey   = `${prefix}_${plan.key.toUpperCase()}_${plan.interval.toUpperCase()}_PLAN_ID`;
    results[envKey] = planData.id;
    envLines.push(`${envKey}=${planData.id}`);
  }

  return NextResponse.json({
    mode,
    productId,
    message: 'Copia estos valores en tu .env.local y en Vercel',
    envVars: results,
    envBlock: envLines.join('\n'),
  });
}
