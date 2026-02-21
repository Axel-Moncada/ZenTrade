-- ============================================================
-- 008_billing.sql — Subscription billing tables for Zentrade
-- ============================================================

-- 1. Add Stripe customer ID to profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT UNIQUE;

-- 2. Plans (pricing tiers — seeded below)
CREATE TABLE IF NOT EXISTS plans (
  id                      UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  slug                    TEXT        UNIQUE NOT NULL,
  name                    TEXT        NOT NULL,
  price_monthly           DECIMAL(10,2) NOT NULL,
  price_annual            DECIMAL(10,2) NOT NULL,
  stripe_price_monthly_id TEXT        UNIQUE,
  stripe_price_annual_id  TEXT        UNIQUE,
  max_accounts            INTEGER,
  features                JSONB       DEFAULT '[]',
  is_active               BOOLEAN     DEFAULT TRUE,
  created_at              TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
  id                     UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  plan_id                UUID        REFERENCES plans(id),
  stripe_subscription_id TEXT        UNIQUE NOT NULL,
  stripe_customer_id     TEXT        NOT NULL,
  status                 TEXT        NOT NULL DEFAULT 'active',
  billing_interval       TEXT        NOT NULL DEFAULT 'month',
  current_period_start   TIMESTAMPTZ,
  current_period_end     TIMESTAMPTZ,
  cancel_at_period_end   BOOLEAN     DEFAULT FALSE,
  canceled_at            TIMESTAMPTZ,
  created_at             TIMESTAMPTZ DEFAULT NOW(),
  updated_at             TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Payments (invoice history)
CREATE TABLE IF NOT EXISTS payments (
  id                       UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                  UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  subscription_id          UUID        REFERENCES subscriptions(id),
  stripe_invoice_id        TEXT        UNIQUE NOT NULL,
  stripe_payment_intent_id TEXT,
  amount_cents             INTEGER     NOT NULL,
  currency                 TEXT        NOT NULL DEFAULT 'usd',
  status                   TEXT        NOT NULL,
  paid_at                  TIMESTAMPTZ,
  created_at               TIMESTAMPTZ DEFAULT NOW()
);

-- 5. RLS
ALTER TABLE plans         ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments      ENABLE ROW LEVEL SECURITY;

-- Plans: cualquiera puede leer (precios públicos)
CREATE POLICY "plans_public_read" ON plans
  FOR SELECT USING (TRUE);

-- Subscriptions: solo el dueño (service role bypassa RLS para webhooks)
CREATE POLICY "subscriptions_select_own" ON subscriptions
  FOR SELECT USING (user_id = auth.uid());

-- Payments: solo el dueño
CREATE POLICY "payments_select_own" ON payments
  FOR SELECT USING (user_id = auth.uid());

-- 6. Seed planes (idempotente)
INSERT INTO plans (slug, name, price_monthly, price_annual, max_accounts, features)
VALUES
  (
    'starter', 'Starter', 9.00, 86.00, 1,
    '["1 Cuenta de Trading","Dashboard básico","Métricas esenciales (Win Rate, PnL, Drawdown)","Calendario de trades","Soporte por email"]'
  ),
  (
    'professional', 'Professional', 29.00, 278.00, 3,
    '["3 Cuentas de trading","Import CSV automático","Dashboard analítico completo","Trading Plan PDF exportable","Export CSV/PDF/Excel","Soporte prioritario"]'
  ),
  (
    'zenmode', 'ZenMode', 59.00, 566.00, NULL,
    '["Todo en Professional","IA Coach personalizado","Reportes automáticos semanales","Análisis predictivo de patrones","Soporte 24/7","Coaching 1-a-1 mensual"]'
  )
ON CONFLICT (slug) DO NOTHING;

-- 7. Después de crear los Stripe Price IDs, ejecutar:
-- UPDATE plans SET stripe_price_monthly_id = 'price_xxx', stripe_price_annual_id = 'price_xxx' WHERE slug = 'starter';
-- UPDATE plans SET stripe_price_monthly_id = 'price_xxx', stripe_price_annual_id = 'price_xxx' WHERE slug = 'professional';
