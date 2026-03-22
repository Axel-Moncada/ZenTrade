-- ── 017_affiliate_idempotency.sql ───────────────────────────────────────────
-- Previene doble-comisión por retries del webhook de Wompi.
-- Si Wompi no recibe 200 a tiempo, reintenta el evento. Sin este UNIQUE,
-- cada retry insertaría un segundo registro en affiliate_conversions.

ALTER TABLE affiliate_conversions
  ADD CONSTRAINT affiliate_conversions_transaction_id_unique UNIQUE (transaction_id);

-- Asegurar SECURITY DEFINER en la función atómica de increment_affiliate_uses
-- para que no sea invocable desde contextos de menor privilegio.
CREATE OR REPLACE FUNCTION increment_affiliate_uses(code_id UUID)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE affiliate_codes SET uses_count = uses_count + 1 WHERE id = code_id;
$$;
