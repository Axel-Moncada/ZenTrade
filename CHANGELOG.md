# Changelog — Zentrade

Registro de cambios para que cualquier sesión de Claude (Claude Code, Claude web o la app) tenga el contexto real del producto.
**Regla**: cada sesión de trabajo que cambie código, estrategia o contenido agrega una entrada arriba (la más reciente primero).
Formato: fecha · qué se hizo · archivos clave · pendientes o decisiones.

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
