/**
 * Script de setup único para crear los planes de suscripción en PayPal.
 *
 * Uso:
 *   npx tsx scripts/paypal-setup-plans.ts sandbox
 *   npx tsx scripts/paypal-setup-plans.ts live
 *
 * Copia los IDs que imprime en .env.local y en Vercel env vars.
 */

import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const mode = process.argv[2] as 'sandbox' | 'live' | undefined;
if (!mode || !['sandbox', 'live'].includes(mode)) {
  console.error('Uso: npx tsx scripts/paypal-setup-plans.ts sandbox|live');
  process.exit(1);
}

const API_BASE       = mode === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';
const CLIENT_ID      = mode === 'live' ? process.env.PAYPAL_LIVE_CLIENT_ID!     : process.env.PAYPAL_SANDBOX_CLIENT_ID!;
const CLIENT_SECRET  = mode === 'live' ? process.env.PAYPAL_LIVE_CLIENT_SECRET! : process.env.PAYPAL_SANDBOX_CLIENT_SECRET!;
const ENV_PREFIX     = `PAYPAL_${mode.toUpperCase()}`;

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error(`Faltan credenciales: ${ENV_PREFIX}_CLIENT_ID / ${ENV_PREFIX}_CLIENT_SECRET`);
  process.exit(1);
}

const PLANS = [
  { key: 'starter', interval: 'monthly', price: '9.00',   label: 'Starter Mensual',      unit: 'MONTH' },
  { key: 'starter', interval: 'annual',  price: '84.00',  label: 'Starter Anual',         unit: 'YEAR'  },
  { key: 'pro',     interval: 'monthly', price: '29.00',  label: 'Professional Mensual',  unit: 'MONTH' },
  { key: 'pro',     interval: 'annual',  price: '249.00', label: 'Professional Anual',    unit: 'YEAR'  },
  { key: 'zenmode', interval: 'monthly', price: '59.00',  label: 'ZenMode Mensual',       unit: 'MONTH' },
  { key: 'zenmode', interval: 'annual',  price: '499.00', label: 'ZenMode Anual',         unit: 'YEAR'  },
] as const;

async function getToken(): Promise<string> {
  const res = await fetch(`${API_BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`,
    },
    body: 'grant_type=client_credentials',
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Auth error ${res.status}: ${err}`);
  }
  const data = await res.json() as { access_token: string };
  return data.access_token;
}

async function createProduct(token: string): Promise<string> {
  const res = await fetch(`${API_BASE}/v1/catalogs/products`, {
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
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Product error ${res.status}: ${err}`);
  }
  const data = await res.json() as { id: string };
  return data.id;
}

async function createPlan(
  token:     string,
  productId: string,
  plan:      typeof PLANS[number],
): Promise<string> {
  const res = await fetch(`${API_BASE}/v1/billing/plans`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      product_id:  productId,
      name:        `ZenTrade ${plan.label}`,
      description: `Suscripción ${plan.label} a ZenTrade`,
      status:      'ACTIVE',
      billing_cycles: [
        {
          frequency:      { interval_unit: plan.unit, interval_count: 1 },
          tenure_type:    'REGULAR',
          sequence:       1,
          total_cycles:   0,
          pricing_scheme: {
            fixed_price: { value: plan.price, currency_code: 'USD' },
          },
        },
      ],
      payment_preferences: {
        auto_bill_outstanding:     true,
        setup_fee_failure_action:  'CONTINUE',
        payment_failure_threshold: 3,
      },
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Plan error ${res.status}: ${err}`);
  }
  const data = await res.json() as { id: string };
  return data.id;
}

async function main() {
  console.log(`\n🚀 Creando planes PayPal — modo: ${mode!.toUpperCase()}\n`);

  const token     = await getToken();
  console.log('✓ Token obtenido');

  const productId = await createProduct(token);
  console.log(`✓ Producto creado: ${productId}\n`);
  console.log('📋 Creando planes...\n');

  const envLines: string[] = [];

  for (const plan of PLANS) {
    const planId = await createPlan(token, productId, plan);
    const key    = `${ENV_PREFIX}_${plan.key.toUpperCase()}_${plan.interval.toUpperCase()}_PLAN_ID`;
    envLines.push(`${key}=${planId}`);
    console.log(`  ✓ ${plan.label}: ${planId}`);
  }

  console.log('\n✅ Copia esto en tu .env.local:\n');
  console.log('─'.repeat(70));
  envLines.forEach(l => console.log(l));
  console.log('─'.repeat(70));
  console.log('\nY en Vercel → Settings → Environment Variables (Production)\n');
}

main().catch(err => {
  console.error('\n❌ Error:', err instanceof Error ? err.message : err);
  process.exit(1);
});
