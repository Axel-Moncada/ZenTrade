# Zentrade — Roadmap

Última actualización: **2026-11-22**
Historial anterior (fases 0–9, marzo 2026): [`docs/archive/ROADMAP-2026-03.md`](docs/archive/ROADMAP-2026-03.md)
Detalle de cada cambio: [`CHANGELOG.md`](CHANGELOG.md)

---

## Estado actual del producto

- **En producción** en https://www.zen-trader.com (Vercel + Supabase).
- **Cobro**: PayPal Subscriptions (`lib/paypal/`, modo según `PAYPAL_MODE`). Hay clientes de pago reales: uno lleva ~4 meses pagando y subió a Pro el 2026-11-18.
- **Mercado objetivo**: traders de futuros en **EE.UU.** que buscan pasar evaluaciones de prop firms (Apex, TopStep, FTMO, Tradoverse, Uprofit). LATAM es secundario (rutas `/es/*`, posts en español).
- **Idiomas**: **English-first** (desde 2026-11-22). UI bilingüe ES/EN (`lib/i18n/translations.ts`, default `en`; el español solo si el navegador está en español). Emails y errores de la API en inglés.
- **Planes**: Free · Starter $9 · Professional $29 · ZenMode $59 (anual: $84 / $249 / $499).
- **Competidor de referencia**: TradeZella ($35/$59/$99 desde julio 2026). Sus quejas más comunes: sincronización con el broker rota, IA de auto-tagging poco fiable, no se puede probar gratis y renovaciones inesperadas.
- **Posicionamiento**: *"The trading journal built to help you pass your prop firm evaluation"*. Especialista en prop firms y a 1/3 del precio de TradeZella.

---

## QA 2026-11-20 — Bloqueantes antes de pautar

- [x] Pagos PayPal: confirmación al volver + reconciliación en el cron + cancelar suscripción anterior (rama `fix/qa-fase-1`)
- [x] ZenCoach: errores manejados, historial saneado, fecha actual, prueba gratis limitada en servidor
- [x] Importador NinjaTrader: orden MM/DD vs DD/MM
- [x] Signos negativos en dashboard y backtesting
- [x] Fechas corridas un día (zona horaria)
- [x] Drawdown trailing
- [x] Ejecutar `supabase/024_qa_fixes.sql` (aplicada en producción el 2026-11-20)
- [x] `PAYPAL_WEBHOOK_ID` = ID del webhook Live de la app **Zentrade** (`7H498690W16324910`), producción republicada
- [x] Gemini 503: reintentos + modelo de respaldo (`lib/ai/gemini-retry.ts`); ZenCoach recibe fecha y drawdown
- [x] Upgrades manuales protegidos de los eventos de PayPal (`resolvePlanWithOverride`)
- [ ] **Walter (alejandroth0810@gmail.com):** ligar su fila de `subscriptions` (manual, ZenMode hasta 2026-12-20) al ID `I-...` de su suscripción PayPal de $29, sin tocar `variant_id` (`manual_override`) ni `plan_key`
- [ ] **Walter:** cancelar en PayPal la suscripción de $9 del 2026-11-12 (sigue activa) y decidir reembolso
- [ ] No reenviar ("Resend") los webhooks viejos de Walter del 12 y 18 de nov: el del 12 lo dejaría en Starter
- [ ] Confirmar con el próximo pago real que el webhook llega como "Success" en PayPal → Webhook Events (app Zentrade)
- [ ] Fase 2: consistencia por día, gating del dashboard por plan, página de precios = producto real, limpiar instrumentos `custom` globales, i18n del importador
- [ ] Fase 3: `/register` abre "Registrarse", traducciones EN, nombres de emociones, hora de entrada en Sesión en Vivo, límite de cuentas en BD

---

## English-first — antes de pautar en EE.UU. (desde 2026-11-22)

- [x] Emails, errores de la API, CSV, login/registro, home/pricing (SEO), billing y upgrade prompts en inglés
- [x] Toda la app autenticada bilingüe con inglés primero (cuentas, trades, calendario, dashboard, trading plan + PDF, retiros, backtesting, perfil)
- [x] ZenCoach responde en el idioma del usuario
- [x] `/about`, `/vs/*`, `/blog`, legales y 404 en inglés; ES movido a `/es/vs/*`
- [x] Quitar promesas falsas (prueba de 14 días, MT5/TradingView, features no construidas) y **testimonios inventados**
- [x] Reembolsos: cobro desde el día 1 + solicitud por email en 7 días (decisión del fundador; reemplaza la "garantía de 15 días")
- [ ] Recorrido manual con navegador en inglés: registro → cuenta → importar → dashboard → pagar
- [x] Landing nueva para la pauta: hero "Replay this day", calculadora de resets, video del anuncio en inglés, reglas en vivo, CTA final y medición UTM + eventos (2026-11-22)
- [x] Tracking de la pauta: atribución first-touch en `profiles` (migración 025), `sign_up`, `begin_checkout`, `purchase` (PR #16)
- [x] Google Ads importa `sign_up` (recuento: una) y `purchase` (valor de GA4) como conversiones principales; las 3 de "carga de página /dashboard" pasaron a secundarias porque contaban cada visita de usuarios existentes (2026-11-22)
- [x] Emails de marketing con baja de un clic, dirección postal y solo inglés (PR #17, migración 026)
- [ ] **Pauta activa desde 2026-11-22:** revisar en 3-4 días que los registros lleguen con `utm_source`/`gclid` en `profiles` y que `sign_up` salga de "Esperando conversiones"
- [ ] `purchase` desde el servidor (GA4 Measurement Protocol) para pagos que solo llegan por webhook
- [ ] Meta Pixel si se pauta en Meta
- [ ] Capturas reales en inglés para la sección de reglas (opcional) y revisar el copy "The AI That Trades Alongside You"
- [ ] Revisar afirmaciones sobre la competencia en `/es/vs/*`
- [ ] Borrar código muerto `components/dashboard/zencoach/zen-coach-widget.tsx`

## GEO — que Zentrade aparezca cuando alguien busca un journal (desde 2026-11-22)

**Diagnóstico:** los buscadores no conocen la marca; la autoridad fuera del sitio pesa más que el contenido propio.

### En el sitio
- [x] `llms.txt` actualizado, herramientas gratis, `/vs/tradersync` y `/vs/tradervue`, posts sin "2025", 301, IndexNow
- [ ] Correr `node scripts/indexnow.mjs` después de cada deploy con contenido (hoy da 403: verificar el sitio en Bing Webmaster Tools)
- [x] Reglas 2026 verificadas en los hubs de Apex, TopStep y FTMO (PR #9)
- [x] Guías "how to pass" en inglés (Apex, TopStep, FTMO) con las reglas 2026 verificadas y fecha real
- [ ] Guías en español (`como-pasar-*`, `pasos-evaluacion-ftmo`, `regla-consistencia-ftmo-explicada`) con reglas viejas: corregir
- [ ] Decidir si se fusionan las guías "how to pass" con los hubs (canibalización, ver `data/ZENTRADE-SEO-STUDY.md`)
- [ ] Verificar el MLL de TopStep en 100K y 150K, y sus reglas para operar noticias
- [ ] Posts en español con "2025" (12)
- [ ] Páginas de intención: "best trading journal for Apex" y "best trading journal for TopStep"
- [ ] **Pegar en Supabase (Auth → Email Templates) las 3 plantillas en inglés** de `supabase/templates/` (Confirm signup, Reset password, Change email address) con su asunto; revisar Magic link e Invite
- [ ] Unificar el nombre de marca (Zentrade / ZenTrade / zen-trader.com) para que las IA reconozcan una sola entidad

### Fuera del sitio (fundador)
- [ ] YouTube en inglés (canal de marca, no "Latam"): demos, "how to track Apex consistency rule", "TradeZella alternative"
- [ ] Reddit: participar con divulgación de fundador en r/FuturesTrading, r/Daytrading y hilos de "journal"
- [ ] Perfiles: Trustpilot, G2, Capterra, AlternativeTo, SourceForge, Product Hunt; pedir reseñas a clientes reales
- [ ] Listicles de "best trading journal" y afiliados de prop firms (sistema de afiliados con 40% recurrente)
- [ ] Medir cada mes los 12 prompts de `docs/seo/2026-11-geo-audit.md` en ChatGPT, Perplexity, Gemini y Claude

## Estrategia de crecimiento (plan de 90 días, desde 2026-11-19)

**Métrica norte**: % de usuarios Free que registran o importan su primer trade en las primeras 48 h.

### Mes 1 — Base y diferenciación
- [x] Copiloto de Disciplina en vivo (ZenMode) — 2026-11-19
- [x] Quick wins técnicos de SEO y GEO — 2026-11-19
- [x] 6 posts en inglés programados (19 nov – 6 dic) — 2026-11-19
- [x] 7 posts en inglés más programados (10 – 31 dic) + calendario social `docs/marketing/2026-12-content-calendar.md` — 2026-11-22
- [ ] Siguiente lote de posts (enero 2027) y publicar en redes según el calendario de diciembre
- [x] Sistema de reseñas reales (en la app + admin + landing) — 2026-11-19
- [ ] Importación desde **TopstepX / ProjectX** (Tradovate ya existe pero está marcada como "no verificada": hay que probarla con archivos reales)
- [ ] Prueba de Pro de 7 días + secuencia de 5 emails de onboarding para usuarios Free
- [x] Herramientas gratis: calculadora de consistencia, calculadora de trailing drawdown y plantilla de journal (2026-11-22)
- [ ] Email 3 días antes de cada renovación (genera confianza; es una de las quejas sobre TradeZella)

### Mes 2 — Distribución
- [ ] Reclutar 10–20 micro-influencers de futuros/prop firms con 40% recurrente (el sistema de afiliados ya existe)
- [ ] Precio para comunidades y mentores (Discord)
- [ ] 3 publicaciones por semana en X, TikTok y Reddit (calendario en `docs/marketing/`)

### Mes 3 — Lanzar el Copiloto
- [ ] Copiloto V2: compartir pantalla (`getDisplayMedia`) + Gemini Vision para leer el P&L y las posiciones
- [ ] Copiloto V3: API de Tradovate/ProjectX para posiciones en tiempo real
- [ ] Product Hunt + videos demo

---

## Pendientes técnicos (priorizados)

### SEO (ver `docs/seo/2026-11-technical-audit.md` y `docs/seo/2026-11-geo-audit.md`)
- [ ] **`<html lang>` por idioma**: el root layout fija `lang="en"`, así que las rutas `/es/*` y los posts en español también salen como inglés. Solución correcta: route groups `app/(en)` y `app/(es)`, cada uno con su `<html lang>`.
- [x] `/vs/*` en inglés; versión ES en `/es/vs/*` (2026-11-22).
- [x] Comparativas consolidadas en `/vs/*` con 301 (2026-11-22). Nuevas: `/vs/tradersync`, `/vs/tradervue`.
- [ ] Verificar después del deploy que `/blog/og/[slug]` ya no da 500.

### Producto
- [ ] Copiloto: en Safari y Firefox no hay ventana flotante (Document PiP es solo Chrome/Edge). Hoy el botón se desactiva con un aviso y el panel sigue funcionando dentro de la página. Alternativa futura: PWA o app móvil.
- [ ] Copiloto: el drawdown usa la fórmula simple de `account-card` y todavía no calcula el trailing real.
- [ ] La API de trades solo acepta horas en bloques de 30 min (`trade.schema.ts`); en el Copiloto la pausa se calcula con `created_at`.

### Deuda técnica
- [ ] Restos de pasarelas anteriores: los paquetes `mercadopago` y `@lemonsqueezy/lemonsqueezy.js`, la carpeta vacía `app/api/webhooks/wompi` y menciones a Wompi en las métricas del admin y en las traducciones. (`lib/lemonsqueezy/get-user-plan.ts` **sí está en uso**; renombrarlo, no borrarlo.)
- [ ] Faltan en el repo las migraciones 001–005 (esquema base: accounts, trades, etc.). Exportar con `supabase db dump --schema public`.
- [ ] `.claude/skills/email-design` y `marketing-psychology` son symlinks con ruta absoluta (`/d/Development/...`) que git en Windows no puede leer. Convertirlos en carpetas reales o quitarlos del repo.
- [ ] Discrepancia: `plan-features.tsx` dice que el reporte semanal con IA es solo de ZenMode, pero el código también se lo da a Pro.

---

## Fase 7 — Features de ZenMode

| # | Feature | Estado |
|---|---------|--------|
| 7.1 | Detección de revenge trading | ✅ 2026-03-04 |
| 7.2 | Alertas de reglas de riesgo | ✅ **Cubierto en la app por el Copiloto de Disciplina** (2026-11-19). Faltan alertas por email o push fuera de la app. |
| 7.3 | Reporte semanal con IA | ✅ 2026-03-04 |
| 7.4 | Radar de mercado (Market Preview) | ✅ 2026-03-20 |
| 7.5 | Análisis de horario óptimo | ⏳ Pendiente |
| 7.6 | Benchmark frente a los requisitos de la prop firm | ⏳ Pendiente |
| 7.7 | Prompts de journaling con IA | ⏳ Pendiente (podría unirse con las notas de voz) |

---

## Ideas en evaluación
- **App móvil / PWA + journaling por nota de voz**: el trader dicta *"perdí 200 en NQ, entré por FOMO"* y la IA lo convierte en un trade con emociones. Ver la recomendación en `CHANGELOG.md` (2026-11-19).
- Ver también `IDEAS.md` (local, no se sube al repo).

---

## Preguntas abiertas (para el fundador)
1. ¿PayPal está en `PAYPAL_MODE=live` en Vercel? Los clientes de pago indican que sí; falta confirmarlo.
2. ¿Dónde están las migraciones 001–005?
3. ¿Limpiamos ya los restos de LemonSqueezy, MercadoPago y Wompi?
4. URL de reseñas de Trustpilot para `NEXT_PUBLIC_TRUSTPILOT_REVIEW_URL` (hay que crear el perfil de empresa).
