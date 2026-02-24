# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## TypeScript & Next.js Conventions

### TypeScript Rules
- **Never use `any` type** - Always use proper typing with specific types, interfaces, or generics

### Next.js Architecture
- **Use API Routes for backend logic** - Don't use Server Actions for backend operations
  - Place backend logic in `pages/api/` or `app/api/` directories
  - Server Actions should not be used for database operations or business logic
- **Use server logic in pages** - Leverage `'use server'` directive for data fetching in page components
  - Fetch data directly in Server Components
  - Use `'use server'` for server-side operations within page components



  # Zentrade — Instrucciones para Claude (MODO PLAN primero)

## Reglas obligatorias
- UI y textos al usuario en español.
- Desktop-first.
- Stack obligatorio: Next.js (App Router) + TypeScript, Tailwind + shadcn/ui, Recharts, Supabase (Auth + Postgres + RLS), Zod.
- No uses TypeScript `any`.
- No uses Server Actions para lógica de backend; usa API Routes en `app/api/...`.
- Para consultas de datos en páginas, prioriza lógica de servidor (Server Components) y RLS.
- Validar input en API routes con Zod.
- Seguridad: RLS estricta, cada usuario solo ve sus datos.

## Preferencias de usuario
- timezone editable por usuario (default America/Bogota)
- currency editable por usuario (default USD)

## Objetivo del producto
Web app tipo TradeZella para journal de trading de futuros con:
- Auth (Supabase)
- Cuentas (Evaluation/Live) CRUD
- Registro diario por cuenta con calendario mensual
- Trades con cálculos PNL por instrumento y opción manual
- Dashboard KPIs + charts
- Tabla trades con filtros + export CSV
- Import CSV/Excel con mapeo (mínimo funcional)
- RLS estricta

## Flujo de trabajo (cómo debes proceder)
1) Trabaja por fases (Fase 0 a Fase 6).
2) Antes de escribir código de una fase, entrega: checklist + archivos a crear/modificar.
3) Implementa, luego entrega: cómo probarlo localmente + casos de prueba manual.
4) No implementes features futuras si no están en la fase actual.

## Fases
- Fase 0: setup + auth + layout privado
- Fase 1: accounts CRUD
- Fase 2: calendar + daily entries
- Fase 3: trades + cálculos + métricas básicas
- Fase 4: dashboard + charts
- Fase 5: reportes + export/import y creacion de seccion de trading plan 
- Fase 6: hardening (perf, caching, tests mínimos)

## Tema visual (Dark/Light Mode)

- Dark mode es el **default** — no modificar estilos existentes de dark mode
- Light mode es una capa adicional activada con clase `.light-mode` en el `<html>` o `body`
- El switch Dark/Light va en el menú/sidebar del layout privado (`app/(private)/layout.tsx` o similar)
- Persistir preferencia en `localStorage` con key `zentrade-theme`
- Transición suave: `transition-colors duration-300` en el root layout
- Solo aplica dentro de la zona autenticada — no tocar páginas públicas ni auth
- Light mode: moderno, colorido, profesional para trading (no genérico)