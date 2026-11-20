-- 024_qa_fixes.sql — correcciones del QA del 2026-11-20
-- Ejecutar en Supabase (SQL Editor) o vía MCP. Es idempotente.

-- ── 1. Prueba gratis de ZenCoach controlada en el servidor ──────────────────
-- Antes el límite de 5 minutos vivía solo en localStorage: cualquier usuario
-- Free podía llamar /api/ai/chat/trial sin límite (costo de Gemini).
-- Tabla sin políticas RLS: solo el service role (API routes) la lee y escribe,
-- así el usuario no puede reiniciar su propia prueba.
create table if not exists public.zencoach_trials (
  user_id     uuid primary key references auth.users(id) on delete cascade,
  started_at  timestamptz not null default now(),
  messages    integer not null default 0
);
alter table public.zencoach_trials enable row level security;

-- ── 2. Seguridad: handle_new_user solo debe correr como trigger ─────────────
revoke execute on function public.handle_new_user() from anon, authenticated, public;

-- ── 3. search_path fijo en funciones (advisor 0011) ─────────────────────────
alter function public.handle_updated_at() set search_path = public;
alter function public.increment_affiliate_uses() set search_path = public;
alter function public.update_updated_at_column() set search_path = public;
alter function public.handle_new_user() set search_path = public;
alter function public.update_account_balance() set search_path = public;
alter function public.update_account_balance_on_adjustment() set search_path = public;
alter function public.update_daily_summary() set search_path = public;
alter function public.update_trading_plan_timestamp() set search_path = public;
