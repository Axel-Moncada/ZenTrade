-- ============================================================
-- Migration 006 — Subscriptions (Lemon Squeezy)
-- Ejecutar en: Supabase → SQL Editor
-- ============================================================

-- ─── 1. Enums ────────────────────────────────────────────────────────────────

DO $$ BEGIN
  CREATE TYPE plan_key_enum AS ENUM ('free', 'starter', 'pro');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE billing_interval_enum AS ENUM ('monthly', 'annual');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE subscription_status_enum AS ENUM (
    'active',
    'on_trial',
    'paused',
    'past_due',
    'unpaid',
    'cancelled',
    'expired'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ─── 2. Tabla subscriptions ───────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id                              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Identificadores de Lemon Squeezy
  lemon_squeezy_subscription_id   TEXT NOT NULL UNIQUE,
  lemon_squeezy_customer_id       TEXT NOT NULL,

  -- Plan
  variant_id                      TEXT NOT NULL,
  plan_key                        plan_key_enum NOT NULL DEFAULT 'free',
  billing_interval                billing_interval_enum NOT NULL DEFAULT 'monthly',

  -- Estado
  status                          subscription_status_enum NOT NULL DEFAULT 'active',
  current_period_end              TIMESTAMPTZ,

  -- Timestamps
  created_at                      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── 3. Índices ───────────────────────────────────────────────────────────────

-- Búsqueda por usuario (usePlan, getUserPlan)
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id
  ON public.subscriptions (user_id);

-- Búsqueda por subscription_id en webhook (upsert/update)
CREATE UNIQUE INDEX IF NOT EXISTS idx_subscriptions_ls_subscription_id
  ON public.subscriptions (lemon_squeezy_subscription_id);

-- Filtro por status activo
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_status
  ON public.subscriptions (user_id, status);

-- ─── 4. Trigger updated_at ───────────────────────────────────────────────────

-- Función reutilizable (puede que ya exista en tu proyecto)
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_subscriptions_updated_at ON public.subscriptions;

CREATE TRIGGER trg_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ─── 5. Row Level Security ────────────────────────────────────────────────────

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Los usuarios solo pueden leer sus propias suscripciones
CREATE POLICY "subscriptions_select_own"
  ON public.subscriptions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- INSERT/UPDATE/DELETE solo desde service_role (webhooks de Lemon Squeezy)
-- El cliente anon/authenticated nunca escribe directamente en esta tabla
CREATE POLICY "subscriptions_service_role_all"
  ON public.subscriptions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ─── 6. Comentarios de columnas ──────────────────────────────────────────────

COMMENT ON TABLE  public.subscriptions IS 'Suscripciones activas gestionadas por Lemon Squeezy';
COMMENT ON COLUMN public.subscriptions.lemon_squeezy_subscription_id IS 'ID de suscripción en Lemon Squeezy (data.id del webhook)';
COMMENT ON COLUMN public.subscriptions.lemon_squeezy_customer_id     IS 'ID de cliente en Lemon Squeezy (attributes.customer_id)';
COMMENT ON COLUMN public.subscriptions.variant_id                    IS 'ID de variante de producto en Lemon Squeezy';
COMMENT ON COLUMN public.subscriptions.plan_key                      IS 'Clave interna del plan: free | starter | pro';
COMMENT ON COLUMN public.subscriptions.billing_interval              IS 'Ciclo de facturación: monthly | annual';
COMMENT ON COLUMN public.subscriptions.status                        IS 'Estado sincronizado desde webhooks de Lemon Squeezy';
COMMENT ON COLUMN public.subscriptions.current_period_end            IS 'Fecha de renovación o expiración del período actual';

-- ─── 7. Verificación ─────────────────────────────────────────────────────────
-- Ejecuta esto al final para confirmar que todo quedó bien:
--
-- SELECT
--   table_name,
--   column_name,
--   data_type,
--   udt_name
-- FROM information_schema.columns
-- WHERE table_schema = 'public'
--   AND table_name   = 'subscriptions'
-- ORDER BY ordinal_position;
--
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd
-- FROM pg_policies
-- WHERE tablename = 'subscriptions';
