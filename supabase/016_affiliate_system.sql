-- ── 016_affiliate_system.sql ──────────────────────────────────────────────────
-- Sistema de afiliados: códigos de descuento + tracking de conversiones

-- Tabla de códigos de afiliado
CREATE TABLE IF NOT EXISTS affiliate_codes (
  id                 UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  code               TEXT        UNIQUE NOT NULL,
  name               TEXT        NOT NULL,
  discount_percent   INTEGER     NOT NULL DEFAULT 0 CHECK (discount_percent >= 0 AND discount_percent <= 100),
  commission_percent INTEGER     NOT NULL DEFAULT 0 CHECK (commission_percent >= 0 AND commission_percent <= 100),
  is_active          BOOLEAN     NOT NULL DEFAULT true,
  max_uses           INTEGER     NULL,
  uses_count         INTEGER     NOT NULL DEFAULT 0,
  notes              TEXT        NULL,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabla de conversiones (un registro por pago aprobado con código)
CREATE TABLE IF NOT EXISTS affiliate_conversions (
  id                      UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_code_id       UUID        NOT NULL REFERENCES affiliate_codes(id),
  code                    TEXT        NOT NULL,
  user_id                 UUID        NOT NULL REFERENCES auth.users(id),
  plan_key                TEXT        NOT NULL,
  billing_interval        TEXT        NOT NULL,
  original_amount_cents   INTEGER     NOT NULL,
  discounted_amount_cents INTEGER     NOT NULL,
  commission_cents        INTEGER     NOT NULL,
  transaction_id          TEXT        NOT NULL,
  status                  TEXT        NOT NULL DEFAULT 'confirmed',
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Añadir campos de afiliado a pending_checkouts
ALTER TABLE pending_checkouts
  ADD COLUMN IF NOT EXISTS affiliate_code         TEXT    NULL,
  ADD COLUMN IF NOT EXISTS discounted_amount_cents INTEGER NULL;

-- RLS: Solo service_role (no acceso público — admin usa supabaseAdmin)
ALTER TABLE affiliate_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_conversions ENABLE ROW LEVEL SECURITY;

-- Índices
CREATE INDEX IF NOT EXISTS idx_affiliate_codes_code     ON affiliate_codes (code);
CREATE INDEX IF NOT EXISTS idx_affiliate_conv_code_id   ON affiliate_conversions (affiliate_code_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_conv_user_id   ON affiliate_conversions (user_id);

-- RPC: Incrementar uses_count de forma atómica (evita race conditions)
CREATE OR REPLACE FUNCTION increment_affiliate_uses(code_id UUID)
RETURNS void
LANGUAGE sql
AS $$
  UPDATE affiliate_codes SET uses_count = uses_count + 1 WHERE id = code_id;
$$;
