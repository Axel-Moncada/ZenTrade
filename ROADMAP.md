# ZenTrade — Roadmap hacia el lanzamiento

Última actualización: 2026-03-20

---

## Estado general

| Fase | Estado | Descripción |
|------|--------|-------------|
| Fase 0 | ✅ Completa | Setup, Auth, Layout privado |
| Fase 1 | ✅ Completa | Accounts CRUD |
| Fase 2 | ✅ Completa | Calendar + Daily entries |
| Fase 3 | ✅ Completa | Trades + cálculos + métricas básicas |
| Fase 4 | ✅ Completa | Dashboard + charts |
| Fase 5 | ✅ Completa | Reportes + export/import + Trading Plan |
| Fase 6 | ✅ Completa | Hardening: pricing, gating, UX de conversión, free-only mode |
| Fase 7 | 🔄 En progreso | ZenMode features (IA) — 3 de 6 completadas |
| Fase 8 | 🔴 Prioridad | QA, testing, pre-launch — **próximo paso** |
| Fase 9 | ⏳ Pendiente | Launch |

---

## Fase 6 — Hardening de pricing y conversión ✅ COMPLETA

### ✅ Completado
- [x] Feature matrix unificada en todos los archivos
- [x] Límites de cuentas correctos: Free=1, Starter=2, Pro=ilimitadas
- [x] Orden visual de planes corregido (ZenMode → Pro → Starter)
- [x] Toggle mensual/anual en landing con badges de ahorro
- [x] Upgrade prompts contextuales en 6 puntos del app
- [x] Guard en accounts/new antes del formulario
- [x] PLAN_LIMIT_REACHED handling en account-form
- [x] CSV import gated para Starter/Free
- [x] PDF export gated para Starter/Free
- [x] Select de `consistency_percent` editable por cuenta (20%–50%) en account-form
- [x] Regla de consistencia corregida — usa ganancia NETA (no suma de wins) como denominador
- [x] `withdrawal-account-card.tsx` — dark mode + light mode corregidos
- [x] `withdrawals/page.tsx` — rediseño completo dark/light mode con clases zen
- [x] Email de activación de cuenta — `supabase/templates/confirmation.html`
  - Tipografía Helvetica Neue con contraste de pesos (300 light / 700 bold)
  - Logo real desde Supabase Storage
  - Animaciones CSS (fadeUp + pulse en CTA)
  - Copy persuasivo con Goal-Gradient, Loss Aversion, Social Proof
  - Compatible Outlook (VML), Gmail, Apple Mail, iOS, Android
- [x] `skills/zentrade-email-design.md` — style guide completo para futuros emails
- [x] Integración Resend configurada vía SMTP custom en Supabase
- [x] Logo copiado a `public/assets/` para servir con URL absoluta

### ✅ Completado adicional (2026-03-21)
- [x] **Modo free-only** — blur overlay en pricing/billing + "Muy pronto" mientras se aprueba pasarela
- [x] **Upgrade prompts** — CTAs cambiados a "Muy pronto" (disabled) en las 3 variantes
- [x] **Sidebar** — badge "Pronto" en Facturación
- [x] **Limpieza de pasarelas muertas** — eliminados LemonSqueezy SDK, PayPal, MercadoPago, FastSpring
- [x] **Radar de Mercado (Market Preview)** — email semanal ZenMode con eventos de alto impacto (Gemini 2.5 Flash)
- [x] **Agent Teams** — ZenCoach, Support Agent, Marketing Agent via n8n + Telegram
- [x] **Wompi integrado** — checkout + webhook + cancelación + cron de expiración. Precios en COP ($38k/$120k/$250k mensual). Blur quitado de billing y landing.

---

## Fase 7 — ZenMode features (IA)

Prioridad de desarrollo basada en impacto percibido por el usuario:

### ✅ 7.1 Revenge Trading Detection (COMPLETADO 2026-03-04)
- Detecta trade perdedor → siguiente trade en < 30 min (mismo día)
- Detecta 3+ pérdidas consecutivas en el mismo día
- `lib/utils/revenge-trading.ts` — lógica pura de detección
- `app/api/trades/revenge-check/route.ts` — endpoint con agrupación por día
- `components/dashboard/revenge-trading-alert.tsx` — banner naranja dismissible
- Badge naranja pulsante en calendario (días con revenge trading)
- Gating: solo visible para ZenMode

### 7.2 Alertas de reglas de riesgo (PRIORIDAD 2)
- Comparar trades del día vs límites del Trading Plan
  - Daily loss limit superado
  - Max trades por día superado
  - Position size fuera del rango
- Implementación: cross-reference entre `trades` y `trading_plans`
- UI: banner de alerta en dashboard diario

### ✅ 7.3 Reporte semanal por email con IA (COMPLETADO 2026-03-04)

**Diseño:**
- Un reporte **por cuenta** (no uno por usuario con todas las cuentas mezcladas)
  - Ej: usuario con 3 cuentas recibe 3 emails separados, uno por cada cuenta
  - Subject: `"Tu semana en [nombre de la cuenta] — ZenTrade"`
- Frecuencia: semanal (lunes) + mensual (día 1 del mes)
- Incluye **capturas de trades** adjuntas inline — el usuario puede ver cada trade visualmente
- Análisis narrativo generado por IA (ver modelo abajo)

**Stack:**
- **Vercel Cron** — disparador semanal/mensual
- **Resend** — envío del email (ya configurado)
- **Template HTML** — estilo ZenTrade (Helvetica Neue, dark theme)
- **IA para el análisis** — ver selección de modelo abajo

**Modelo de IA — criterio: gratuito o casi gratuito:**

| Modelo | Costo | Free tier | Veredicto |
|--------|-------|-----------|-----------|
| **Gemini 2.0 Flash** (Google) | $0.075/M tokens | ✅ 1M tokens/día gratis | ⭐ Mejor opción |
| **Gemini 1.5 Flash** | $0.075/M tokens | ✅ Generoso free tier | ⭐ Alternativa |
| GPT-4o-mini (OpenAI) | $0.15/M input | ❌ No free tier | Barato pero no gratis |
| Groq + Llama 3.3 70B | $0.59/M tokens | ✅ Free tier generoso | Buena alternativa |
| Claude Haiku 4.5 | $0.80/M tokens | ❌ No free tier | Más caro |

**→ Usar Gemini 2.0 Flash via Google AI Studio API**
- Con ~1,500 tokens por reporte (datos de trades + análisis generado)
- Free tier aguanta ~650 reportes/día antes de cobrar
- Para el MVP con pocos usuarios: completamente gratis

**Contenido del reporte por cuenta:**
```
SEMANAL (cada lunes, semana anterior):
- PnL total de la semana | % vs semana anterior
- Win rate + cantidad de trades
- Mejor día / peor día
- Trade más rentable (con captura si existe)
- Trade con mayor pérdida (con captura si existe)
- IA: párrafo de análisis narrativo (2-3 frases)
  Ej: "Tu mejor rendimiento fue el miércoles. Los 3 trades
       perdedores ocurrieron entre 2-3pm — considera evitar ese horario."
- Progreso hacia objetivo de la cuenta (drawdown, profit target)

MENSUAL (día 1, mes anterior):
- Todo lo del reporte semanal pero agregado por mes
- Comparativa vs mes anterior
- Top 3 mejores trades con capturas
- Equity curve del mes (imagen generada server-side)
- IA: análisis más profundo — patrones, horarios, instrumentos
```

**Implementación:**
- `app/api/cron/weekly-report/route.ts` — endpoint del cron
- `lib/reports/generate-report.ts` — lógica de generación
- `lib/ai/gemini.ts` — cliente Gemini para el análisis narrativo
- `supabase/templates/weekly-report.html` — template email
- Vercel cron: `0 10 * * 1` (lunes 10am UTC)

**Plan gating:**
- Starter: recibe reporte semanal básico (sin IA narrativa, sin capturas)
- Professional: reporte semanal completo con IA + capturas
- ZenMode: semanal + mensual + análisis IA más profundo

### ✅ 7.4 Radar de Mercado — Market Preview (COMPLETADO 2026-03-20)
- Email semanal exclusivo ZenMode, domingos 19:00 UTC via Vercel Cron
- Gemini 2.5 Flash genera 4-6 eventos de alto impacto para la semana siguiente
- Una sola llamada a Gemini con todos los instrumentos de usuarios ZenMode combinados
- Badges por tipo (FED/EARNINGS/MACRO/INFLACIÓN/EMPLEO/GEOPOLÍTICA), left accent por impacto
- `lib/ai/gemini-market-news.ts` + `lib/resend/emails/market-preview-email.tsx` + `app/api/cron/market-preview/route.ts`

### 7.5 Análisis de horario óptimo (PRIORIDAD 4)
- Calcular win rate y PnL promedio por hora del día
- Calcular win rate por día de la semana
- UI: heatmap o gráfica de barras en dashboard ZenMode
- Implementación: query SQL agrupando por hora de entry_time

### 7.6 Benchmark vs prop firm requirements (PRIORIDAD 5)
- Comparar métricas del usuario vs requisitos típicos de prop firms
  - FTMO: max DD 10%, profit target 10%, min 10 días, consistency rule
  - Apex: max DD 6%, profit target 9%
  - TopStep: max DD 6%, profit target 6%
- UI: tarjetas de evaluación con semáforo verde/amarillo/rojo
- Implementación: tabla `prop_firm_rules` + cálculo en dashboard

### 7.7 AI Journaling prompts (PRIORIDAD 6)
- Prompt contextual después de sesión con pérdidas
- Preguntas guiadas: "¿Seguiste el plan? ¿Cuál fue tu estado emocional?"
- Integración con calendario de notas existente
- Podría usar Claude API para generar preguntas personalizadas

---

## Fase 8 — QA y testing pre-launch 🔴 PRIORIDAD ACTUAL

> Usar `.claude/testing/TESTING_GUIDE.md` y `.claude/testing/MANUAL_TESTS.md` como guías.

### Tests manuales críticos — flujo core
- [ ] **Registro completo**: email → confirmación → login → dashboard
- [ ] **Primera cuenta**: crear cuenta evaluation → ver límite Free (1 cuenta)
- [ ] **Primer trade manual**: crear → verificar en historial + calendario + dashboard KPIs
- [ ] **Editar trade**: cambiar resultado → verificar que balance y KPIs se recalculan
- [ ] **Eliminar trade**: verificar que balance se revierte
- [ ] **Daily entry**: agregar nota del día + emoción → ver en calendario
- [ ] **Trading Plan**: crear plan → exportar PDF (solo Pro — ver "Muy pronto" para Free)
- [ ] **CSV import**: subir archivo NinjaTrader/Tradovate → verificar mapeo (solo Pro)
- [ ] **CSV export**: descargar trades filtrados por fecha
- [ ] **Withdrawals**: registrar retiro → verificar balance de cuenta

### Tests del modo free-only (crítico antes de lanzar)
- [ ] **Blur pricing landing**: sección de precios muestra overlay "Muy pronto" correctamente
- [ ] **Blur billing dashboard**: planes de pago bloqueados al entrar a /dashboard/billing
- [ ] **Upgrade prompts**: botones de upgrade muestran "Muy pronto" deshabilitado en los 6 puntos
- [ ] **Sidebar badge**: "Pronto" aparece junto a Facturación
- [ ] **Límite de cuentas Free**: intentar crear 2ª cuenta → ver prompt correcto

### Tests de email
- [ ] **Email activación**: registrarse con email nuevo → verificar que llega y tiene el diseño correcto
- [ ] **Reporte semanal**: llamar endpoint `/api/cron/weekly-report` con `?week_start=` → verificar email
- [ ] **Radar de Mercado**: llamar endpoint `/api/cron/market-preview` → verificar email ZenMode
- [ ] **Newsletter**: suscribirse desde popup y footer → verificar email de confirmación

### Tests de seguridad
- [ ] RLS: verificar que usuario A no puede ver datos de usuario B
- [ ] API routes: verificar que todas retornan 401 sin auth
- [ ] Plan gating: endpoints de features Pro/ZenMode deniegan correctamente a usuarios Free

### Performance
- [ ] Core Web Vitals landing page (LCP < 2.5s) — Vercel Analytics
- [ ] Dashboard con 200+ trades no se congela
- [ ] Import CSV de 500 trades funciona sin timeout

---

## Fase 9 — Launch checklist

### Pre-launch
- [ ] Dominio + SSL configurado
- [ ] Variables de entorno de producción completas
- [ ] Supabase en plan pago (no free tier) para producción
- [ ] Pasarela de pagos configurada en modo live (Paddle u otro cuando aprueben)
- [ ] Analytics configurado (Vercel Analytics o PostHog)
- [ ] Error monitoring (Sentry)
- [ ] Backup automatizado de DB

### Contenido
- [ ] Privacy Policy
- [ ] Terms of Service
- [ ] Landing en español (primary) + inglés (secondary)
- [ ] FAQ completo

### Marketing launch
- [ ] Landing page final revisada
- [ ] Post de lanzamiento en Twitter/X
- [ ] Post en r/Forex, r/FuturesTrading, r/PropFirms
- [ ] Video demo (Loom) del producto
- [ ] Producto en ProductHunt

---

## Decisiones técnicas tomadas

| Decisión | Razón |
|---------|-------|
| Lanzar con solo plan gratuito (2026-03-19) | Pasarelas de pago rechazadas por cuenta colombiana. Blur en pricing/billing hasta aprobación de Paddle. Permite salir al mercado y validar retención |
| ZenMode como "coming soon" en landing | No vender lo que no existe. Mantener como ancla de precio |
| Toggle anual visible pero no preseleccionado | Mostrar el ahorro como incentivo, no forzar |
| Orden ZenMode→Pro→Starter | Anchoring effect: ver el precio más alto primero |
| Upgrade prompts en 6 puntos | Cada fricción es un recordatorio de valor, no una frustración |
| Free plan = 1 cuenta | Lo suficiente para probar, no suficiente para operar en serio |
| Starter = 2 cuentas | 1 eval + 1 live. La 3ra = upgrade inevitable |

---

## Próxima sesión — por dónde empezar

**Recomendación de orden (sesión 2026-03-21):**

### 🔴 Paso 1 — Testing completo (Fase 8)
Ejecutar todos los tests de la sección de Fase 8, empezando por:
1. Flujo core: registro → cuenta → trade → dashboard
2. Modo free-only: blur en pricing/billing, upgrade prompts
3. Emails: activación, reporte semanal, radar de mercado

### 🟡 Paso 2 — Deploy a producción
1. Configurar env vars en Vercel (producción)
2. Deploy + smoke test en zen-trader.com
3. Verificar DNS de Resend (DKIM/SPF/DMARC) — los emails van a spam hasta que propaguen

### 🟢 Paso 3 — Lanzamiento blando
- Compartir con 5-10 traders conocidos
- Activar cuentas Pro manualmente en Supabase para embajadores/influencers
- Recopilar feedback

### ⏳ Después (cuando Wompi apruebe)
- Integrar Wompi en checkout + webhook
- Quitar blur overlays de billing y pricing
- Probar checkout end-to-end Colombia

### 💡 Backlog de features (de IDEAS.md)
Ver sección "Ideas — Backlog" al final de este archivo.



## Issues pendientes ##
1. ~~Implementar select en la consistencia~~ ✅ Resuelto (2026-03-03)
2. ~~Ajustar el mail de activacion de cuenta~~ ✅ Resuelto (2026-03-03)
3. ~~Páginas legales (Privacy, Terms, Refunds, Disclaimer)~~ ✅ Resuelto (2026-03-04)
4. ~~Newsletter popup + formulario footer~~ ✅ Resuelto (2026-03-04)
5. ~~Reporte semanal con IA (Gemini 2.5 Flash)~~ ✅ Resuelto (2026-03-04)
6. ~~Revenge Trading Detection~~ ✅ Resuelto (2026-03-04)
7. Backtesting
8. Configurar DNS completos para Resend (DKIM/SPF/DMARC) — email llega a spam hasta que propaguen
9. Pasarela de pagos — **Wompi en aprobación** (Colombia). Blur activo en billing/pricing hasta que aprueben
10. DNS Resend — DKIM/SPF/DMARC pendientes de propagación (emails van a spam)
11. i18n por URL — `/en` todo en inglés con flag en newsletter_subscribers para emails en el idioma correcto
12. Deploy a producción — Vercel con env vars reales


---

## Cuándo lanzar el MVP

**El producto ya es un MVP funcional. Se puede lanzar en 5 días.**

El loop core de valor está completo:
> Registro → Crear cuenta → Registrar trades → Ver dashboard → Exportar Trading Plan → Importar CSV → Billing

### Solo 2 blockers reales antes de lanzar

**Blocker 1 — Pasarela de pagos** ⏳ EN ESPERA (Wompi)
- LemonSqueezy: rechazó la cuenta (Colombia)
- MercadoPago: requería aprobación especial (error SUB17)
- FastSpring: rechazado
- PayPal: sandbox funcionó, Live descartado por ahora
- Paddle: solicitud enviada — sin respuesta
- **Wompi (actual)**: pasarela colombiana, proceso de aprobación en curso — permite cobrar en Colombia mientras se resuelve una pasarela global. [wompi.com](https://wompi.com)
- **Decisión 2026-03-19**: lanzar con solo plan gratuito mientras se aprueba Wompi
  - Blur + "Muy pronto" en pricing/billing — **NO TOCAR hasta aprobación**
  - Para reactivar pagos cuando aprueben: quitar bloques marcados `/* quitar cuando pagos estén activos */`
    en `billing-dashboard.tsx` y `pricing-section.tsx`, y restaurar botones en `upgrade-prompt.tsx`
- Código de pasarelas muertas eliminado del repo
- **Largo plazo**: Stripe Atlas (LLC Delaware ~$500) → mejor cobertura USA + menores fees
- **No bloquea el lanzamiento — ya se puede salir al mercado con plan gratuito**

**Blocker 2 — Privacy Policy + Terms of Service** ✅ RESUELTO (2026-03-04)
Páginas implementadas en el proyecto:
- `/privacy` — Política de Privacidad (GDPR)
- `/terms` — Términos de Servicio
- `/refunds` — Política de Reembolsos
- `/disclaimer` — Aviso Legal

### Lo que NO es blocker para el MVP

| Feature | Por qué no bloquea |
|---------|-------------------|
| ZenMode features | Está como "Próximamente" — correcto |
| Reporte semanal email | Nadie lo espera en día 1 |
| Revenge trading detection | Feature premium desconocida aún |
| Tests automatizados | Pruebas manuales + lanzar, tests después |
| Error monitoring (Sentry) | Vercel logs cubren temporalmente |
| Benchmark vs prop firms | Nice to have, no MVP |

### Plan de 5 días para lanzar

```
Día 1    → Configurar Vercel production con env vars reales
           Deploy a producción
           Prueba manual del flujo nuevo usuario completo (registro → trade → dashboard)

Día 2    → Lanzamiento blando con plan gratuito
           Compartir con 5-10 traders conocidos
           Recopilar feedback directo

Cuando aprueben Wompi:
           Integrar Wompi en checkout + webhook
           Quitar blur overlays de billing y pricing
           Probar checkout end-to-end Colombia
```

### Las preguntas que solo los usuarios reales responden

Ninguna de estas hipótesis se valida con más código:

1. ¿El Import CSV es lo más usado, o prefieren registro manual?
2. ¿El Dashboard retiene usuarios, o entran, ven números y no vuelven?
3. ¿El límite de 2 cuentas en Starter convierte a Professional, o la gente abandona?
4. ¿El Trading Plan PDF lo usa alguien, o es feature de vitrina?

**Con 10 usuarios activos en 2 semanas se sabe exactamente qué construir.**
Eso vale más que cualquier feature desarrollada a ciegas.

> El MVP no es el producto perfecto. Es el producto más pequeño que genera aprendizaje real.

---

## Ideas — Backlog (de IDEAS.md)

> Ideas para después del lanzamiento, ordenadas por impacto estimado.

### 💡 Tablero de Motivación (Alto impacto)
- Espacio para que el trader suba sus metas, imágenes de sus sueños y cuentas pasadas
- Pop-ups contextuales según el estado del trader:
  - 4 días perdiendo → mostrar todas las evaluaciones que ha pasado
  - Racha de pérdidas → "Recuerda por qué empezaste" con sus imágenes y metas
  - Gran ganancia → celebración con logros históricos
- Etiquetas por etapa: evaluación, fondeado, en racha, en pérdida
- **Por qué es valioso**: diferenciador emocional — ningún journal tiene esto. Conecta con la psicología del trader

### 💡 Sistema de Códigos de Descuento + Afiliados (Alto impacto para adquisición)
- Códigos de descuento generables desde admin panel
- Códigos de afiliado para influencers traders: cada código trackea registros y conversiones
- Pago de comisión por conversión (% del plan mensual o pago único)
- Dashboard de afiliado: clicks, registros, pagos generados
- **Por qué es valioso**: canal de adquisición escalable — un influencer con 50k seguidores puede traer 200+ usuarios
- **Prerequisito**: pasarela de pagos activa

