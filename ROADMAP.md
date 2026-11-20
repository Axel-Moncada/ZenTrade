# Zentrade — Roadmap

Última actualización: **2026-11-20**
Historial anterior (fases 0–9, marzo 2026): [`docs/archive/ROADMAP-2026-03.md`](docs/archive/ROADMAP-2026-03.md)
Detalle de cada cambio: [`CHANGELOG.md`](CHANGELOG.md)

---

## Estado actual del producto

- **En producción** en https://www.zen-trader.com (Vercel + Supabase).
- **Cobro**: PayPal Subscriptions (`lib/paypal/`, modo según `PAYPAL_MODE`). Hay clientes de pago reales: uno lleva ~4 meses pagando y subió a Pro el 2026-11-18.
- **Mercado objetivo**: traders de futuros en **EE.UU.** que buscan pasar evaluaciones de prop firms (Apex, TopStep, FTMO, Tradoverse, Uprofit). LATAM es secundario (rutas `/es/*`, posts en español).
- **Idiomas**: UI bilingüe ES/EN (`lib/i18n/translations.ts`, default `en`). Emails en inglés.
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
- [ ] Ejecutar `supabase/024_qa_fixes.sql`
- [ ] Verificar webhook de PayPal en live (`PAYPAL_WEBHOOK_ID`, URL registrada)
- [ ] Fase 2: consistencia por día, gating del dashboard por plan, página de precios = producto real, limpiar instrumentos `custom` globales, i18n del importador
- [ ] Fase 3: `/register` abre "Registrarse", traducciones EN, nombres de emociones, hora de entrada en Sesión en Vivo, límite de cuentas en BD

---

## Estrategia de crecimiento (plan de 90 días, desde 2026-11-19)

**Métrica norte**: % de usuarios Free que registran o importan su primer trade en las primeras 48 h.

### Mes 1 — Base y diferenciación
- [x] Copiloto de Disciplina en vivo (ZenMode) — 2026-11-19
- [x] Quick wins técnicos de SEO y GEO — 2026-11-19
- [x] 6 posts en inglés programados (19 nov – 6 dic) — 2026-11-19
- [x] Sistema de reseñas reales (en la app + admin + landing) — 2026-11-19
- [ ] Importación desde **TopstepX / ProjectX** (Tradovate ya existe pero está marcada como "no verificada": hay que probarla con archivos reales)
- [ ] Prueba de Pro de 7 días + secuencia de 5 emails de onboarding para usuarios Free
- [ ] Herramienta gratis para atraer tráfico de Google: calculadora de la regla de consistencia y del trailing drawdown (Apex/TopStep)
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
- [ ] Páginas `/vs/*` en español con títulos de 2025: pasarlas a inglés, mover la versión ES a `/es/vs/*` y actualizar el año.
- [ ] Comparativas con TradeZella y Edgewonk duplicadas (posts `*-comparison` frente a `/vs/*`): elegir una URL canónica.
- [ ] Verificar después del deploy que `/blog/og/[slug]` ya no da 500.
- [ ] Testimonios de ejemplo en el landing (nombres inventados y fotos de pravatar). Se reemplazan solos cuando haya 2 o más reseñas reales aprobadas.

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
