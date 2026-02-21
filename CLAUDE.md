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


# 🎨 SISTEMA DE DISEÑO OFICIAL — Zentrade (OBLIGATORIO)

Claude debe usar exclusivamente esta paleta.
No usar colores por defecto de Tailwind.
No usar clases como bg-green-500, text-gray-800, etc.
No hardcodear colores fuera de estos HEX.

------------------------------------------------------------
## ✍️ Tipografía

Fuente: Axiforma  
Pesos permitidos:
- 400 → Regular
- 500 → Medium
- 600 → SemiBold

Jerarquía:
- H1/H2 → 600
- Subtítulos → 500
- Texto base → 400

------------------------------------------------------------
## 🎨 PRIMARY COLORS (OFICIALES)

Rich Black  
HEX: #001B1F  

Dark Green  
HEX: #002E21  

Bangladesh Green  
HEX: #006A4E  

Mountain Meadow  
HEX: #3DBB8F  

Caribbean Green (PRIMARY CTA)  
HEX: #00C17C  

Anti-Flash White  
HEX: #F2F3F4  

------------------------------------------------------------
## 🌿 SECONDARY COLORS

Pine  
HEX: #0B3D2E  

Basil  
HEX: #1C5C45  

Forest  
HEX: #0F5132  

Frog  
HEX: #2E8B57  

Mint  
HEX: #2BBF8A  

Stone  
HEX: #7A7F7F  

Pistachio  
HEX: #93C572  

------------------------------------------------------------
## 🔴 COLOR PARA RESULTADOS NEGATIVOS (OBLIGATORIO)

Danger Red (PNL negativo, pérdidas, alertas críticas)  
HEX: #E5484D  

Reglas:
- PNL positivo → Caribbean Green (#00C17C)
- PNL negativo → Danger Red (#E5484D)
- Nunca usar rojo brillante tipo #FF0000
- No usar rojo Tailwind por defecto

------------------------------------------------------------
## 🧱 SISTEMA DE BACKGROUND

background: #001B1F  
surface: #002E21  
surface-elevated: #006A4E  

text-primary: #F2F3F4  
text-muted: rgba(255,255,255,0.6)

border-default: #0F5132  
border-soft: rgba(255,255,255,0.05)

------------------------------------------------------------


## Enfoque actual (UI/UX)
- Solo mejorar UI/UX, consistencia visual, layout, accesibilidad y copy.
- No modificar DB, RLS ni API routes salvo que sea estrictamente necesario para UI.

## Convenciones UI (semánticas)
- focus-ring: usar primary (#00C17C) con opacidad suave
- input-bg: surface (#002E21)
- input-border: border-soft (rgba(255,255,255,0.05))
- card-border: border-soft
- sidebar-bg: background (#001B1F)
- hover: usar primary-hover (#3DBB8F) o aclarar surface ligeramente


## 🎯 REGLAS VISUALES

- Aplicación Dark-first.
- Layout principal usa background.
- Cards usan surface.
- Modales y dropdowns usan surface-elevated.
- Botones primarios usan Caribbean Green.
- Hover usa Mountain Meadow.
- Resultados positivos usan Caribbean Green.
- Resultados negativos usan Danger Red.
- No usar azul.
- No usar grises default Tailwind.
- No inventar colores nuevos.
- Si se necesita nuevo color → proponer antes de usar.

------------------------------------------------------------
## 🧩 IMPLEMENTACIÓN TÉCNICA

- Definir estos colores como CSS variables en :root.
- Extender Tailwind theme con tokens semánticos.
- Usar clases como:
  bg-background
  bg-surface
  bg-primary
  text-positive
  text-negative
- Nunca usar HEX directamente en componentes.
- No usar colores inline.