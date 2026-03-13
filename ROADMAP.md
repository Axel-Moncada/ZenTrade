# ZenTrade — Roadmap hacia el lanzamiento

Última actualización: 2026-03-04

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
| Fase 6 | 🔄 En progreso | Hardening: pricing, gating, UX de conversión |
| Fase 7 | 🔄 En progreso | ZenMode features (IA) |
| Fase 8 | ⏳ Pendiente | QA, testing, pre-launch |
| Fase 9 | ⏳ Pendiente | Launch |

---

## Fase 6 — Hardening de pricing y conversión (EN PROGRESO)

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

### ⏳ Pendiente Fase 6
- [x] **Pruebas de flujo de pago end-to-end** — probar checkout LemonSqueezy Starter y Pro (mensual + anual)
- [x] **Probar webhook** — simular evento de pago exitoso y verificar que el plan se actualiza en DB
- [x] **Probar downgrade/cancelación** — verificar que RLS y límites se aplican al bajar de plan
- [x] **Verificar env vars de LemonSqueezy** — VARIANT_IDs configurados en producción
- [x] **Agregar ZenMode a `plan_key` en DB** — migration SQL para añadir "zenmode" al enum (cuando lance)
- [x] **usePlan.ts + get-user-plan.ts** — añadir `isZenMode` cuando el plan_key esté en DB
- [x] **`lib/lemonsqueezy/client.ts`** — añadir zenmode a PLAN_VARIANTS cuando tenga variant IDs
- [x] **Free plan onboarding** — mensaje de bienvenida claro explicando límites del plan free vs starter
- [x] **Stripe/LemonSqueezy portal** — enlace a portal de cliente para cambiar método de pago
- [x] **Página de éxito post-pago** — mensaje de confirmación claro con próximos pasos
- [x] **Email de bienvenida post-upgrade** — configurar en LemonSqueezy o con Resend

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

### ✅ 7.3 Reporte semanal y mensual por email con IA (COMPLETADO 2026-03-04)

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

### 7.4 Análisis de horario óptimo (PRIORIDAD 4)
- Calcular win rate y PnL promedio por hora del día
- Calcular win rate por día de la semana
- UI: heatmap o gráfica de barras en dashboard ZenMode
- Implementación: query SQL agrupando por hora de entry_time

### 7.5 Benchmark vs prop firm requirements (PRIORIDAD 5)
- Comparar métricas del usuario vs requisitos típicos de prop firms
  - FTMO: max DD 10%, profit target 10%, min 10 días, consistency rule
  - Apex: max DD 6%, profit target 9%
  - TopStep: max DD 6%, profit target 6%
- UI: tarjetas de evaluación con semáforo verde/amarillo/rojo
- Implementación: tabla `prop_firm_rules` + cálculo en dashboard

### 7.6 AI Journaling prompts (PRIORIDAD 6)
- Prompt contextual después de sesión con pérdidas
- Preguntas guiadas: "¿Seguiste el plan? ¿Cuál fue tu estado emocional?"
- Integración con calendario de notas existente
- Podría usar Claude API para generar preguntas personalizadas

---

## Fase 8 — QA y testing pre-launch

### Tests manuales críticos
- [ ] Flujo completo nuevo usuario: registro → onboarding → primera cuenta → primer trade
- [ ] Flujo de upgrade: Starter → Professional (mensual y anual)
- [ ] Flujo de límite: crear cuenta #3 con Starter → ver upgrade prompt → checkout → verificar que ya puede crear
- [ ] CSV import: subir archivo de Rithmic/NinjaTrader/Tradoverse → verificar mapeo
- [ ] PDF export Trading Plan: crear plan → exportar → verificar formato
- [ ] Dark mode / Light mode: verificar todas las páginas en ambos modos
- [ ] Responsive: verificar en 1280px, 1440px, 1920px (desktop-first)
- [ ] Landing: verificar toggle anual/mensual, orden de planes, CTAs

### Tests de seguridad
- [ ] RLS: verificar que usuario A no puede ver datos de usuario B
- [ ] API routes: verificar que todas retornan 401 sin auth
- [ ] Plan gating: verificar que endpoints no sirven features de plan superior sin suscripción activa

### Performance
- [ ] Core Web Vitals landing page (LCP < 2.5s)
- [ ] Dashboard con 500+ trades no se congela
- [ ] Import CSV de 1000 trades funciona

---

## Fase 9 — Launch checklist

### Pre-launch
- [ ] Dominio + SSL configurado
- [ ] Variables de entorno de producción completas
- [ ] Supabase en plan pago (no free tier) para producción
- [ ] LemonSqueezy en modo live (no test)
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
| ZenMode como "coming soon" en landing | No vender lo que no existe. Mantener como ancla de precio |
| Toggle anual visible pero no preseleccionado | Mostrar el ahorro como incentivo, no forzar |
| Orden ZenMode→Pro→Starter | Anchoring effect: ver el precio más alto primero |
| Upgrade prompts en 6 puntos | Cada fricción es un recordatorio de valor, no una frustración |
| Free plan = 1 cuenta | Lo suficiente para probar, no suficiente para operar en serio |
| Starter = 2 cuentas | 1 eval + 1 live. La 3ra = upgrade inevitable |

---

## Próxima sesión — por dónde empezar

**Recomendación de orden:**

1. **Fase 7.2 — Alertas de reglas de riesgo** (ZenMode, cross-reference trades vs trading_plans)
2. **Fase 7.4 — Análisis de horario óptimo** (heatmap por hora en dashboard ZenMode)
3. **i18n por URL** (`/en` → todo en inglés, flag en newsletter_subscribers)
4. Paddle: migrar billing cuando aprueben



## Issues pendientes ##
1. ~~Implementar select en la consistencia~~ ✅ Resuelto (2026-03-03)
2. ~~Ajustar el mail de activacion de cuenta~~ ✅ Resuelto (2026-03-03)
3. ~~Páginas legales (Privacy, Terms, Refunds, Disclaimer)~~ ✅ Resuelto (2026-03-04)
4. ~~Newsletter popup + formulario footer~~ ✅ Resuelto (2026-03-04)
5. ~~Reporte semanal con IA (Gemini 2.5 Flash)~~ ✅ Resuelto (2026-03-04)
6. ~~Revenge Trading Detection~~ ✅ Resuelto (2026-03-04)
7. Backtesting
8. Configurar DNS completos para Resend (DKIM/SPF/DMARC) — email llega a spam hasta que propaguen
9. Pasarela de pagos — pendiente de aprobación de Paddle
10. Manejo de idiomas con la URL www.zen-trader.com/en : todo deberia salir en ingles hasta el popup y que en la lista de suscribcion quede grabado que el usuario es de lenguaje ingles para enviarles los email en ingles, y biseversa con españól


---

## Cuándo lanzar el MVP

**El producto ya es un MVP funcional. Se puede lanzar en 5 días.**

El loop core de valor está completo:
> Registro → Crear cuenta → Registrar trades → Ver dashboard → Exportar Trading Plan → Importar CSV → Billing

### Solo 2 blockers reales antes de lanzar

**Blocker 1 — Pasarela de pagos** 🔄 EN ESPERA
- LemonSqueezy rechazó la cuenta (Colombia)
- Paddle: solicitud enviada — esperando aprobación
- El código de LemonSqueezy sigue en el repo, se adaptará a Paddle cuando aprueben
- **No bloquea el desarrollo de otras features**

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
Día 1-2  → Probar flujo de pago completo (sandbox → live)
           Verificar webhook + actualización de plan en DB
           Fix cualquier bug encontrado

Día 3    → Privacy Policy + Terms (2 horas)
           Configurar Vercel production con env vars reales
           LemonSqueezy en modo LIVE

Día 4    → Deploy a producción
           Prueba manual del flujo nuevo usuario completo
           Pago de prueba con tarjeta real

Día 5    → Lanzamiento blando
           Compartir con 5-10 traders conocidos
           Recopilar feedback directo
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

