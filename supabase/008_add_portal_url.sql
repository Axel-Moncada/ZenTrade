-- ============================================================
-- Migration 008 — Añadir customer_portal_url a subscriptions
-- Ejecutar en: Supabase → SQL Editor
-- ============================================================

ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS customer_portal_url TEXT;

COMMENT ON COLUMN public.subscriptions.customer_portal_url
  IS 'URL del portal de cliente de LemonSqueezy (attributes.urls.customer_portal del webhook)';

-- ─── Verificación ─────────────────────────────────────────────────────────────
-- SELECT column_name, data_type FROM information_schema.columns
-- WHERE table_name = 'subscriptions' AND table_schema = 'public'
-- ORDER BY ordinal_position;
