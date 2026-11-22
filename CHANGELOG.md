# Changelog — Zentrade

Registro de cambios para que cualquier sesión de Claude (Claude Code, Claude web o la app) tenga el contexto real del producto.
**Regla**: cada sesión de trabajo que cambie código, estrategia o contenido agrega una entrada arriba (la más reciente primero).
Formato: fecha · qué se hizo · archivos clave · pendientes o decisiones.

---

## 2026-11-22 (tarde) — English-first fase 2: toda la app en inglés + reembolso en 7 días + fuera testimonios falsos

### Decisiones del fundador (tatuadas en CLAUDE.md)
- **English-first obligatorio**: un usuario de EE.UU. nunca ve español (UI, toasts, errores, emails, CSV, PDF, metadata, JSON-LD). Copy pensado para convertir, sin prometer nada que el código no haga.
- **Cobro desde el día 1, sin free trial.** El cliente puede **solicitar un reembolso por escrito** a support@zen-trader.com **dentro de 7 días** del primer pago y el fundador decide caso por caso. Prohibido escribir "free trial", "money-back guarantee" o "no questions asked" (con cobro desde el día 1 serían publicidad engañosa y disparan disputas en PayPal).

### Reembolsos y legal
- Política de reembolsos reescrita (ES/EN): PayPal (antes decía Wompi), ventana de solicitud de 7 días, excepciones (cobro duplicado, caída >72 h).
- Insignias del checkout: "15-day guarantee, no questions asked" → "7-day refund window · Request it by email". FAQ de pricing alineada.
- Wompi → PayPal en términos, privacidad y FAQ. Metadata de términos, privacidad, cookies, disclaimer y reembolsos en inglés.

### Testimonios y promesas falsas eliminadas (FTC)
- Hero: testimonio inventado "Marcus T." eliminado. Sección de solución: cita inventada "Carlos M." → frase de producto. Testimonios de ejemplo con fotos de pravatar: eliminados (sin reseñas reales aprobadas no se muestra la sección). Badge "The Only Futures Journal…" → sin superlativo.
- Tarjetas de precios: ZenMode ya no promete benchmark, coaching 1-a-1, soporte 24/7 ni alertas de tamaño de posición; ahora lista Copiloto de Disciplina, revenge trading, ZenCoach, reporte semanal y Radar. Ahorro anual de Starter corregido ($24, no $22).
- CTA final: "AI active immediately" y "revenge trading from day one" (solo es ZenMode) → beneficios reales del plan Free.
- `free-plan-welcome`: decía que Starter desbloquea import CSV, PDF y dashboard completo (es Pro). Corregido.

### Traducción de la app (bilingüe, inglés primero)
- Helpers nuevos: `lib/i18n/use-tr.ts` (`tr(es, en)`), `components/shared/t.tsx` (`<T es en />` para Server Components), `lib/constants/trade-labels.ts` (emociones y razones de salida bilingües; las claves de BD siguen en español).
- Labels bilingües: `types/accounts.ts` (tipo, estado, drawdown), `types/trading-plan.ts` (días), `lib/utils/date-helpers.ts` (meses/días con `locale`), `data/trading-quotes.json` (`quotes_en`).
- Traducidos: cuentas (tarjeta, formulario, selector), trades (formulario, tarjeta, lista, tabla, filtros, capturas, importador CSV), calendario (header, celdas, leyenda, modal del día, fotos), dashboard (gráficas, tablas, selector de fechas, stat cards), trading plan (formulario, página, **PDF**), retiros, backtesting, páginas del dashboard (cuentas, import, trading plan, perfil, backtesting, sesión en vivo), logout, 404, soporte, newsletter y preview del landing.
- **ZenCoach respondía siempre en español**: ahora responde en el idioma del usuario (inglés por defecto). El resumen de sesión también.
- Bugs de paso: el filtro de emociones ofrecía valores que nunca se guardan (`venganza`, `euforia`…), corregido con la lista compartida. `updateFilter` ya no usa `any`.

### Público / SEO
- `/about` reescrito en inglés para EE.UU. (con `<T>`, ES disponible).
- `/vs/tradezella` y `/vs/edgewonk` reescritos en inglés con componente compartido `components/vs/comparison-page.tsx`. Solo datos verificables y fechados: TradeZella $35/$59/$99 (desde 14-jul-2026, sin plan gratis); Edgewonk ~$197/año, sin plan gratis, garantía de 14 días. No se afirma que la competencia "no tiene" una feature.
- Versiones en español movidas a `/es/vs/*` (canonical + hreflang; precios corregidos; quitada la fila dudosa "Edgewonk = software desktop"). Sitemap actualizado.
- `/blog`: metadata e índice en inglés; los posts en español van en una sección "Artículos en español" al final. Categorías, fechas, callouts y "Related articles" según el idioma de cada post.
- Verificado con el build de producción: 13 páginas públicas sin texto ni metadata en español (control `/es/vs/tradezella`: 45 líneas en español).

### Pendientes
- **Demos en video del landing están en español** (YouTube): grabar demos en inglés para la pauta.
- Recorrido manual logueado con navegador en inglés (la zona autenticada no se pudo escanear automáticamente).
- Las páginas `/es/vs/*` conservan afirmaciones viejas sin verificar sobre features de la competencia ("No" en revenge trading, etc.): revisar o suavizar.
- Admin y herramientas internas de marketing siguen en español (solo las ve el fundador).
- `components/dashboard/zencoach/zen-coach-widget.tsx` es código muerto (no se importa): borrar.

---

## 2026-11-22 — English-first (fase 1): embudo de pago en inglés + promesas falsas corregidas

### Contexto y decisión
- Decisión del fundador: **toda la pauta va a EE.UU.**, así que el producto pasa a ser *English-first*. El español se mantiene como idioma secundario (rutas `/es/*`, posts en español, usuarios con el navegador en español), pero un usuario gringo no debe ver ni una palabra en español.
- Git: el pull desde el laptop había quedado a medias (merge en conflicto). `main` quedó igual a `origin/main`; los 2 commits viejos de PayPal del desktop se guardaron en la rama `backup/desktop-paypal-2026-11-19` (incluye `POST /api/admin/paypal-sync`, que no está en `main`).

### Promesas falsas encontradas (riesgo FTC y de chargebacks con la pauta)
- **"14-day free trial on all plans"** en hero, pricing, FAQ y la política de reembolsos. **No existe**: los planes de PayPal cobran desde el día 1 (`tenure_type: 'REGULAR'`). Copy cambiado a "Free plan forever" en ES y EN; la política de reembolsos ahora se apoya en el plan gratuito. **Decisión: implementar una prueba real** (ver ROADMAP).
- Importación desde **MT5 y TradingView**: no existe. Ahora dice NinjaTrader, Rithmic, Tradovate o cualquier plataforma con la plantilla CSV. "Tradoverse" aparecía como plataforma de import (es una prop firm): cambiado a Tradovate.
- Email de bienvenida y tabla de planes prometían "coaching 1-a-1", "análisis de horario óptimo" y "benchmark vs prop firm" como incluidos: en la tabla quedan como *Coming soon*; en el email se quitaron.
- Tarjeta de upgrade: el precio anual se calculaba como `mensual × 0.8` (Pro mostraba $23/mes en vez de $20.75). Ahora usa los precios reales y el % de ahorro de cada plan.

### Traducido / bilingüe
- **Emails**: bienvenida/upgrade (`lib/resend/send-welcome-email.ts`) 100% en inglés. Broadcasts y suscriptores del newsletter asumen `en` por defecto; el editor de emails del admin abre en EN.
- **API**: ~70 mensajes de error y validaciones Zod (`app/api/**`, `lib/validations/*`) en inglés. Las herramientas internas de marketing del admin (`app/api/agents/*`) siguen en español.
- **CSV**: plantilla de importación y export en inglés; el importador acepta encabezados en inglés y en español, y "Followed Plan" acepta yes/si/y/true.
- **Login/registro** (`app/login/page.tsx`) bilingüe. `/register` ahora abre el tab de registro (`/login?mode=register`). Botón de Google bilingüe.
- **SEO**: JSON-LD de la home (`app/page.tsx`) y `/pricing` (metadata, FAQ schema y encabezado) en inglés; `areaServed` prioriza EE.UU.
- **Billing** (`app/dashboard/billing/page.tsx`, `components/billing/*`): features por plan `{ es, en }`, toda la UI del dashboard de facturación, el modal de pago exitoso e insignias de confianza.
- `UpgradePrompt`: bilingüe y `message` acepta `{ es, en }` (actualizados sus 8 usos). `PlanFeatures`: bilingüe. Alerta de revenge trading: bilingüe. Sidebar: labels del admin.

### Pendientes
- **Fase 2 del barrido**: ~33 componentes de la app no tienen ningún soporte de idioma (cuentas, trades, calendario, dashboard, trading plan, retiros, backtesting) y otros están a medias (`import-csv`, `zencoach-widget`, `day-modal`, `trading-plan-form`, `date-range-selector`).
- Páginas públicas aún en español: `/about`, `/vs/tradezella`, `/vs/edgewonk` (además con títulos de 2025).
- **Contradicción por resolver**: las insignias del checkout prometen "15-day guarantee, no questions asked" y la política de reembolsos dice "no refunds".
- `send-welcome-email.ts` ya no registra el email del usuario en los logs.

---

## 2026-11-20 (tarde) — PayPal: webhook ID y upgrades manuales

- `PAYPAL_WEBHOOK_ID` en Vercel actualizado al ID del webhook Live de la app **Zentrade** (`7H498690W16324910`) y producción republicada. Hay dos apps en PayPal (Zentrade y Activation_App); el sitio usa Zentrade.
- `lib/paypal/activate-subscription.ts`: si una suscripción tiene un upgrade manual del admin (`variant_id` empieza por `manual_override`), los eventos de PayPal extienden fechas pero no bajan el plan. Caso Walter: ZenMode regalado mientras paga Pro.
- Test: `tests/paypal-override.test.ts`.
- Pendiente: ligar la fila de Walter a su suscripción de PayPal de $29 (`I-...`) y cancelar en PayPal la de $9 (12-nov), que sigue activa.

---

## 2026-11-20 — QA end-to-end y correcciones de fase 1 (antes de pautar)

### Contexto
- QA completo plan por plan (Free → Starter → Pro → ZenMode) con una cuenta de prueba (`yigami5522@anonmart.com`), en el navegador y verificando en Supabase.
- Detonante: Walter (primer cliente) pagó el upgrade a Pro y su plan no cambió. Su fila en `subscriptions` era manual desde septiembre: **ningún pago de PayPal se ha registrado solo**.

### Correcciones (rama `fix/qa-fase-1`)
- **Pagos PayPal** — `lib/paypal/activate-subscription.ts` (nuevo, compartido por webhook y confirmación), `app/api/paypal/confirm/route.ts` (nuevo), `components/billing/billing-dashboard.tsx`, `app/dashboard/billing/page.tsx`:
  - Al volver de PayPal (`?subscription_id=I-...`) la app consulta PayPal y activa el plan. Ya no depende solo del webhook. Idempotente.
  - Al cambiar de plan se cancela en PayPal la suscripción anterior (antes quedaban dos cobros activos).
  - `cancel_url` usaba `cancelled` y la página leía `canceled`.
  - Cron `check-subscriptions` + `lib/paypal/reconcile.ts`: antes de expirar una suscripción de PayPal se consulta PayPal; si sigue ACTIVE (renovación cobrada, webhook perdido) se extiende.
- **ZenCoach** — `app/api/ai/chat/[id]/route.ts`, `app/api/ai/chat/trial/route.ts`, `lib/ai/zencoach-context.ts`, `lib/ai/zencoach-trial.ts` (nuevo), `components/zencoach/zencoach-widget.tsx`:
  - Errores de Gemini capturados (503 con código) en vez de 500 sin manejar.
  - Historial saneado para Gemini (empieza en `user`, roles alternados): un mensaje fallido dejaba el chat roto para siempre.
  - ZenCoach recibe la fecha y hora actual en la zona horaria del trader ("no tengo acceso a la fecha").
  - `[id]` verifica ZenMode en el servidor.
  - La prueba gratis se controla en el servidor (tabla `zencoach_trials`: 5 min + 15 mensajes). Antes era solo `localStorage` y el endpoint no tenía límite.
  - Mensajes claros por caso: prueba terminada, requiere ZenMode, sesión expirada, IA no disponible.
- **Importador CSV** — `lib/utils/csv-date.ts` (nuevo) + `components/trades/import-csv.tsx`: NinjaTrader en inglés (MM/DD) entraba como DD/MM (11/05 → 11 de mayo; 11/13 → mes 13). Ahora el orden se detecta por archivo y las fechas imposibles se descartan con aviso.
- **Signos negativos** — `lib/utils/format-money.ts` (nuevo) en dashboard, hero card y backtesting: P&L −220 salía "$220.00".
- **Fechas un día antes** — `parseISODate` para fechas `YYYY-MM-DD` en tabla de trades, curva de capital, W/L por día y tarjeta de cuenta (`new Date('2026-11-20')` es UTC → 19 nov en Bogotá).
- **Drawdown trailing** — `lib/utils/drawdown.ts` (nuevo), `app/api/accounts/route.ts` (`peak_balance`), `components/accounts/account-card.tsx`, `lib/live-session/*`: trailing se calculaba como estático. Ahora el piso sigue el pico de balance y se congela en el balance inicial.
- Tests nuevos: `tests/csv-date.test.ts`, `tests/format-money.test.ts`, `tests/drawdown.test.ts`.

### Migración
- `supabase/024_qa_fixes.sql`: tabla `zencoach_trials` (RLS sin políticas), `revoke execute` de `handle_new_user`, `search_path` fijo en 8 funciones. **Ejecutar antes o junto con el deploy.**

### Pendientes / decisiones
- Verificar `PAYPAL_WEBHOOK_ID` y la URL del webhook en el dashboard de PayPal (live): todo indica que nunca ha funcionado.
- Revisar si Walter tiene dos suscripciones activas en PayPal ($9 de septiembre + $29) y cancelar la vieja.
- Apex congela el trailing en balance inicial + $100: parametrizar por prop firm (verificar fuente).
- Regla de consistencia: hoy se mide por trade; Apex/Topstep la miden por día.
- Fase 2: gating del dashboard (Free/Starter ven todo), promesas de precios vs producto, instrumentos basura globales, importador bilingüe.

---

## 2026-11-19 — Copiloto de Disciplina, SEO/GEO, contenido y reseñas reales

### Contexto y estrategia
- Hay un cliente que lleva ~4 meses pagando y subió a Pro el 2026-11-18. No respondió a la solicitud de entrevista.
- Investigación de TradeZella: crece sobre todo con afiliados e influencers, comunidades y una marca fuerte (~72% de su tráfico es directo). Sus quejas: sincronización con el broker, auto-tagging con IA poco fiable, precio, no hay prueba gratis y renovaciones inesperadas.
- Idea del fundador: un copiloto con IA que vea la pantalla. Se cambió el enfoque a **disciplina en vez de señales**, para no competir con el AI Copilot de TradingView (oct 2026) ni dar asesoría de inversión no registrada (CFTC/NFA).
- Plan de 90 días en `ROADMAP.md`.

### Copiloto de Disciplina — "Sesión en Vivo" (ZenMode) · commit `6a113b0`
- Página `/dashboard/live-session` y enlace en el sidebar (ES/EN). Los usuarios que no son ZenMode ven el UpgradePrompt.
- Motor de reglas puro `lib/live-session/discipline-rules.ts`: límite diario (aviso al 70%, alto al 100%), objetivo diario, regla de consistencia, máximo de trades, racha de pérdidas, pausa de 15 min tras pérdida, horario y días del plan, instrumento permitido, drawdown restante y trade fuera del plan.
- Ventana flotante siempre encima con Document Picture-in-Picture (`lib/hooks/useDocumentPip.ts`), solo en Chrome y Edge.
- Registro rápido de trades (reutiliza `POST /api/trades`), pitido y notificación del navegador en las alertas rojas.
- `GET /api/live-session` con Zod, verificación de ZenMode y RLS. El cargador está en `lib/live-session/get-live-session-data.ts`.

### SEO, GEO y contenido · commit `05ef5a8`
- `html lang="en"`, metadata global en inglés, `public/og-image.png` (generado con PIL) y `app/manifest.ts`.
- Se eliminó el `AggregateRating` falso (4.9 / 87) y el `SearchAction` que no funcionaba. **Decisión: no usar ratings ni reseñas inventadas** (regla de la FTC de 2024 y política de Google).
- El post ES de TradeZella cambió a `zentrade-vs-tradezella-es`, porque la URL vieja redirigía y rompía el sitemap y el hreflang.
- Se quitó el "| Zentrade" duplicado en 16 `seoTitle` y se añadió `x-default` en el hreflang.
- Sitemap con fechas fijas y `revalidate` diario. Footer con enlaces a los hubs de prop firms y a `/vs/*`.
- Blog: ya no intenta crear carpetas en el filesystem de solo lectura de Vercel, y `outputFileTracingIncludes` incluye `data/blog/posts`.
- `robots.ts` con los crawlers de IA permitidos explícitamente; `public/llms.txt` reescrito y `public/llms-full.txt` nuevo.
- 6 posts en inglés programados: Tradovate journal (19 nov), TopstepX journal (22 nov), alternativas a TradeZella (26 nov), regla de consistencia de Apex (29 nov), por qué fallan las evaluaciones (3 dic), rutina de pérdida diaria (6 dic).
- Reportes: `docs/seo/2026-11-technical-audit.md` (58/100), `docs/seo/2026-11-geo-audit.md` (58/100). Calendario de redes: `docs/marketing/2026-11-content-calendar.md`.

### Sistema de reseñas reales
- Migración `supabase/023_reviews.sql`: tabla `reviews` (una por usuario; RLS: el usuario solo crea o edita la suya y siempre queda `pending`), `profiles.review_prompted_at` y la audiencia de email `paying`. **Hay que ejecutarla en Supabase.**
- Tarjeta flotante dentro de la app (`components/reviews/review-prompt.tsx`), montada en `app/dashboard/layout.tsx`. Aparece con 10 o más trades, 7 o más días de cuenta, sin reseña previa, y como máximo 1 vez cada 30 días.
  - 4–5 ⭐ → testimonio + permiso para publicarlo + Trustpilot (`NEXT_PUBLIC_TRUSTPILOT_REVIEW_URL`).
  - 1–3 ⭐ → feedback privado.
- Página `/dashboard/review` (para enlazar desde los emails).
- Admin `/dashboard/admin/reviews`: aprobar, rechazar y ver feedback.
- Landing: con 2 o más testimonios aprobados y públicos se reemplazan los de ejemplo. Con 5 o más reseñas recibidas, el `AggregateRating` vuelve al schema, calculado con **todas** las reseñas (rechazar no infla el promedio; regla de la FTC).
- Trustpilot se ofrece a todos los que envían su opinión, sin importar las estrellas (Trustpilot prohíbe el *review gating*).
- Emails del admin: nueva audiencia "Clientes de pago" (Starter, Pro y ZenMode activos).

### Recomendación pendiente — app móvil
- Corto plazo: **PWA** (el manifest ya existe) + **journaling por nota de voz** (MediaRecorder → Gemini, que convierte el audio en un trade estructurado con emociones). Funciona en iOS y Android sin pasar por las tiendas y sin la comisión de Apple/Google (15–30%) sobre las suscripciones.
- App nativa (Expo/React Native) solo si la PWA demuestra tracción. Ventaja: reseñas en las tiendas y notificaciones push más fiables en iOS.

---

## 2026-05 — Pagos, email marketing y contenido
- Pagos: de Wompi a PayPal Subscriptions (LemonSqueezy, MercadoPago y FastSpring rechazaron la cuenta colombiana).
- Email marketing desde el admin: editor rico, envíos programados (`scheduled_emails`, cron `send-scheduled-emails`), audiencias.
- ZenCoach (chat con IA), tour de onboarding, Trailing Stop como razón de salida.
- ~30 posts de blog, páginas `/vs/*` y hubs de prop firms (FTMO, Apex, TopStep).
- El 2026-05-28 el foco de mercado pasó de LATAM a EE.UU. y todos los emails quedaron en inglés.

## 2026-03 — Lanzamiento
- Deploy a producción en zen-trader.com (2026-03-22). Auditoría de seguridad: `SECURITY-AUDIT-2026-03-22.md`.
- Revenge trading detection, reporte semanal con IA y Radar de mercado (Gemini 2.5 Flash), newsletter, sistema de afiliados.
- Detalle completo: `docs/archive/ROADMAP-2026-03.md`.
