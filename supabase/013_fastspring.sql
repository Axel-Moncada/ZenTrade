-- ============================================================
-- Migration 013 — FastSpring: renombrar columnas processor-agnostic
-- Ejecutar en: Supabase → SQL Editor
-- ============================================================

-- Renombrar columnas para ser agnósticas al procesador
ALTER TABLE public.subscriptions
  RENAME COLUMN lemon_squeezy_subscription_id TO processor_subscription_id;

ALTER TABLE public.subscriptions
  RENAME COLUMN lemon_squeezy_customer_id TO processor_customer_id;

-- Renombrar índice
ALTER INDEX IF EXISTS idx_subscriptions_ls_subscription_id
  RENAME TO idx_subscriptions_processor_subscription_id;

-- Asegurar que zenmode esté en el enum (por si no estaba)
DO $$ BEGIN
  ALTER TYPE plan_key_enum ADD VALUE IF NOT EXISTS 'zenmode';
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Actualizar comentarios
COMMENT ON TABLE  public.subscriptions IS 'Suscripciones activas — procesador: FastSpring';
COMMENT ON COLUMN public.subscriptions.processor_subscription_id IS 'ID de suscripción en el procesador de pagos (FastSpring subscription ID)';
COMMENT ON COLUMN public.subscriptions.processor_customer_id     IS 'ID de cuenta/cliente en el procesador de pagos (FastSpring account ID)';

-- Verificación:
-- SELECT column_name FROM information_schema.columns
-- WHERE table_name = 'subscriptions' ORDER BY ordinal_position;
