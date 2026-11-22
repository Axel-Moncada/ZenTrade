# CLAUDE.md — Zentrade

Guía para Claude (Claude Code, Claude web y la app) al trabajar en este repositorio.

## 📌 Lee primero (contexto vivo)
1. **`CHANGELOG.md`**: qué se hizo, cuándo y por qué (lo más reciente arriba).
2. **`ROADMAP.md`**: estado actual, plan de 90 días, pendientes priorizados y preguntas abiertas.
3. `docs/seo/` (auditorías SEO y GEO) y `docs/marketing/` (calendario de contenido).

### Regla de documentación (obligatoria)
Al terminar una sesión que cambie código, estrategia o contenido:
- Agrega una entrada al principio de **`CHANGELOG.md`** (fecha, qué se hizo, archivos clave, decisiones y pendientes).
- Actualiza **`ROADMAP.md`**: marca lo completado, agrega pendientes nuevos y actualiza la fecha.
- Si cambian las reglas de trabajo o el estado general, actualiza este archivo.

---

## Producto (estado a 2026-11-22)
- SaaS **en producción**: https://www.zen-trader.com. Trading journal para traders de futuros que quieren **pasar evaluaciones de prop firms** (Apex, TopStep, FTMO, Tradoverse, Uprofit).
- **Mercado principal: EE.UU.** (desde 2026-05-28). LATAM es secundario (`/es/*` y posts en español).
- Cobro con **PayPal Subscriptions** (`lib/paypal/`). Hay clientes de pago reales.
- Planes: Free · Starter $9 · Professional $29 · ZenMode $59. La fuente de verdad de features es `components/shared/plan-features.tsx`; el gating está en `lib/lemonsqueezy/get-user-plan.ts` (`getUserPlan`, el nombre es histórico) y en `lib/hooks/usePlan.ts`.
- Features principales: cuentas, trades, calendario, dashboard, trading plan, importación CSV (NinjaTrader, Rithmic, Tradovate), ZenCoach (IA), revenge trading, reporte semanal con IA, Radar de mercado, **Copiloto de Disciplina en vivo** (`/dashboard/live-session`), **reseñas reales** (`/dashboard/review` y el admin), afiliados, email marketing desde el admin y blog (`data/blog/posts/*.json`).
- IA: Gemini 2.5 Flash (`lib/ai/`).

## Reglas obligatorias
- Stack: Next.js 15 (App Router) + TypeScript, Tailwind + shadcn/ui, Recharts, Supabase (Auth + Postgres + RLS), Zod.
- **Nunca uses TypeScript `any`**: usa tipos, interfaces o genéricos.
- **No uses Server Actions para lógica de backend**: usa API Routes en `app/api/...`.
- En páginas, obtén los datos en el servidor (Server Components) y apóyate en RLS.
- Valida el input de las API routes con **Zod**.
- **Seguridad**: RLS estricta; cada usuario solo ve sus datos. Las rutas de admin usan `ADMIN_EMAILS` + `supabaseAdmin`.
- Las rutas `route.ts` solo exportan handlers HTTP y config de Next. Los helpers van en `lib/`.
- **🇺🇸 ENGLISH-FIRST (regla tatuada, 2026-11-22)**: toda la pauta va a EE.UU. Un usuario gringo **nunca** debe ver una palabra en español: UI, errores de la API, toasts, emails, CSVs, PDFs, metadata y JSON-LD. El inglés es el idioma por defecto y la versión que se escribe primero, con copy nativo (no traducido) y pensado para **convertir**.
- **UI bilingüe ES/EN**: el español se mantiene como idioma secundario (`/es/*`, navegadores en español). Todo texto nuevo debe existir en ambos idiomas (`lib/i18n/translations.ts`, o un diccionario local `{ es, en }` dentro del componente). **Emails solo en inglés.**
- **Conversión sin mentiras**: todo cambio de UI o copy se piensa para convertir (CTA claro, fricción mínima, beneficio concreto), pero **nunca prometas algo que el código no hace**. Verifica cada feature, integración, precio o plazo antes de escribirlo; lo que no existe va como *Coming soon*. (FTC: publicidad engañosa = multas y chargebacks.)
- **Cobro y reembolsos**: se cobra **desde el día 1** (no hay free trial). El cliente puede **solicitar un reembolso por escrito** a support@zen-trader.com **dentro de los 7 días** siguientes a su primer pago y el fundador decide caso por caso. Nunca escribas "free trial", "money-back guarantee" ni "no questions asked". La frase aprobada: *"Not happy? Email us within 7 days of your first payment to request a refund."*
- Desktop-first, pero usable en móvil.
- Migraciones SQL en `supabase/NNN_nombre.sql` (numeración consecutiva; la última es `024_qa_fixes.sql`).
- **Nada de reseñas, ratings ni testimonios inventados** en el sitio ni en el schema (regla de la FTC de 2024 y política de Google). Solo datos reales (`lib/reviews/`).
- Prop firms: no inventes reglas ni estadísticas. Verifícalas y cita la fuente.

## Preferencias de usuario
- Timezone editable por usuario (default `America/Bogota`).
- Moneda editable por usuario (default `USD`).

## Flujo de trabajo
1. Antes de escribir código de una feature, entrega un **checklist + los archivos a crear o modificar**.
2. Implementa y luego entrega **cómo probarlo localmente + casos de prueba manual**.
3. Valida con `npx tsc --noEmit` y `npm run build`.
   - Nota: en Windows, `@vercel/og` falla al prerenderizar porque la ruta del proyecto tiene espacios. Deja esas rutas dinámicas.
4. No implementes features que no estén en el `ROADMAP.md` sin acordarlo antes.
5. Actualiza `CHANGELOG.md` y `ROADMAP.md` (ver la regla de documentación arriba).

## Tema visual (Dark/Light Mode)
- Dark mode es el **default**: no modifiques los estilos existentes de dark mode.
- Light mode es una capa adicional que se activa con la clase `.light-mode` en `<html>` (overrides en `app/globals.css`).
- Usa las clases `zen-*` (`bg-zen-surface`, `text-zen-anti-flash`, `zen-caribbean-green`, etc.); ya tienen su mapeo a light mode.
- El switch Dark/Light está en el sidebar del layout privado. La preferencia se guarda en `localStorage` con la key `zentrade-theme`.
- Transición suave: `transition-colors duration-300` en el root layout.
- Solo aplica dentro de la zona autenticada: no toques las páginas públicas ni las de auth.
- Light mode: moderno, colorido y profesional para trading (no genérico).
