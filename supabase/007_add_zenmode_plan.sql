-- ============================================================
-- Migration 007 — Añadir 'zenmode' al enum plan_key_enum
-- Ejecutar en: Supabase → SQL Editor
-- ============================================================

-- PostgreSQL permite añadir valores a enums existentes pero no eliminarlos.
-- IF NOT EXISTS hace el script idempotente (seguro de re-ejecutar).

ALTER TYPE plan_key_enum ADD VALUE IF NOT EXISTS 'zenmode';

-- ─── Verificación ─────────────────────────────────────────────────────────────
-- Ejecuta esto al final para confirmar:
--
-- SELECT enumlabel FROM pg_enum
-- WHERE enumtypid = 'plan_key_enum'::regtype
-- ORDER BY enumsortorder;
--
-- Resultado esperado: free | starter | pro | zenmode
