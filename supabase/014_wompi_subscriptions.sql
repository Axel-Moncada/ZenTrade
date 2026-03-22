-- Migración: soporte para suscripciones Wompi
-- Wompi no tiene subscriptions nativas: se usa payment_source_id (tokenización de tarjeta)
-- para cobrar automáticamente cada período.

ALTER TABLE subscriptions
  ADD COLUMN IF NOT EXISTS wompi_payment_source_id TEXT;

COMMENT ON COLUMN subscriptions.wompi_payment_source_id IS
  'ID del payment source tokenizado por Wompi (ps_xxx). Usado para cobros recurrentes automáticos.';
