/**
 * Script de prueba para simular un webhook de Wompi con código de afiliado.
 *
 * Uso:
 *   node scripts/test-webhook-wompi.mjs
 *
 * Requiere que el servidor esté corriendo en localhost:3000
 * y que exista un pending_checkout con el linkId especificado abajo.
 */

import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

// Node 20.6+ tiene carga nativa de .env
process.loadEnvFile('.env.local');

const WOMPI_EVENTS_KEY    = process.env.WOMPI_EVENTS_KEY;
const SUPABASE_URL        = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const WEBHOOK_URL         = 'http://localhost:3000/api/webhooks/wompi';

// ── Configura estos valores ───────────────────────────────────────────────────
const LINK_ID         = 'TESTLINK001';  // ID del payment link simulado (sin underscores)
const USER_EMAIL      = 'deep.salamander.trpx@hidingmail.com';  // email del usuario de prueba
const PLAN            = 'starter';
const INTERVAL        = 'monthly';
const AMOUNT_CENTS    = 3_800_000;        // monto en COP (o el descontado si usaste código)
const AFFILIATE_CODE  = 'OSCAR';         // código de afiliado (o null si no usas)
// ─────────────────────────────────────────────────────────────────────────────

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function main() {
  // 1. Insertar pending_checkout de prueba
  console.log('📝 Insertando pending_checkout de prueba...');

  // Buscar el usuario por email
  const { data: users } = await supabase.auth.admin.listUsers();
  const user = users?.users?.find(u => u.email === USER_EMAIL);

  if (!user) {
    console.error(`❌ No se encontró usuario con email: ${USER_EMAIL}`);
    console.log('   Usa el email de tu cuenta de prueba en Supabase.');
    process.exit(1);
  }

  const discountedAmount = AFFILIATE_CODE
    ? Math.round(AMOUNT_CENTS * 0.85) // 15% descuento de ejemplo
    : null;

  const { error: insertError } = await supabase
    .from('pending_checkouts')
    .upsert({
      id:                      LINK_ID,
      user_id:                 user.id,
      plan_key:                PLAN,
      billing_interval:        INTERVAL,
      affiliate_code:          AFFILIATE_CODE ?? null,
      discounted_amount_cents: discountedAmount,
    });

  if (insertError) {
    console.error('❌ Error insertando pending_checkout:', insertError.message);
    process.exit(1);
  }

  console.log(`✅ Pending checkout creado: ${LINK_ID} → ${user.email} (${PLAN} ${INTERVAL})`);
  if (AFFILIATE_CODE) {
    console.log(`   Código de afiliado: ${AFFILIATE_CODE} | Monto descontado: ${discountedAmount} COP`);
  }

  // 2. Construir payload del webhook
  const transactionId  = `test_txn_${Date.now()}`;
  const reference      = `${LINK_ID}_${Date.now()}_ABCDEF`;
  const timestamp      = Math.floor(Date.now() / 1000);
  const finalAmount    = discountedAmount ?? AMOUNT_CENTS;

  const payload = {
    event: 'transaction.updated',
    data: {
      transaction: {
        id:                transactionId,
        reference,
        status:            'APPROVED',
        amount_in_cents:   finalAmount,
        currency:          'COP',
        customer_email:    user.email,
        payment_source_id: null,
      },
    },
    sent_at:   new Date().toISOString(),
    timestamp,
    signature: {
      properties: ['transaction.id', 'transaction.status', 'transaction.amount_in_cents', 'transaction.currency'],
      checksum:   '',
    },
  };

  // 3. Calcular checksum
  const values = [
    transactionId,
    'APPROVED',
    String(finalAmount),
    'COP',
    String(timestamp),
    WOMPI_EVENTS_KEY,
  ].join('');

  payload.signature.checksum = crypto
    .createHash('sha256')
    .update(values)
    .digest('hex');

  // 4. Enviar webhook
  console.log('\n📡 Enviando webhook simulado a', WEBHOOK_URL);
  console.log('   Transaction ID:', transactionId);
  console.log('   Monto:', finalAmount, 'COP');

  const res = await fetch(WEBHOOK_URL, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(payload),
  });

  const text = await res.text();
  if (res.ok) {
    console.log('\n✅ Webhook procesado correctamente:', text);
    console.log('\n🎉 Revisa:');
    console.log('   • /dashboard/billing   → suscripción activa');
    console.log('   • /dashboard/admin/affiliates → conversión registrada');
    console.log('   • Supabase → tabla subscriptions y affiliate_conversions');
  } else {
    console.error('\n❌ Error en webhook:', res.status, text);
  }
}

main().catch(console.error);
