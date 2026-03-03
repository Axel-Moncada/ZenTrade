# ZenTrade — Roadmap hacia el lanzamiento

Última actualización: 2026-03-03

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
| Fase 7 | ⏳ Pendiente | ZenMode features (IA) |
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

### 7.1 Revenge Trading Detection (PRIORIDAD 1 — gancho principal)
- Detectar cuando el usuario opera después de una pérdida dentro de la misma sesión
- Patrón: trade perdedor → siguiente trade en < 5 min
- Patrón: 3+ pérdidas consecutivas en el mismo día
- Implementación: análisis en `api/trades` al guardar, alertas en dashboard
- UI: badge rojo en calendario + notificación en dashboard

### 7.2 Alertas de reglas de riesgo (PRIORIDAD 2)
- Comparar trades del día vs límites del Trading Plan
  - Daily loss limit superado
  - Max trades por día superado
  - Position size fuera del rango
- Implementación: cross-reference entre `trades` y `trading_plans`
- UI: banner de alerta en dashboard diario

### 7.3 Reporte semanal automático por email (PRIORIDAD 3)
- Email automático cada lunes con resumen de la semana anterior
- Contenido: PnL, win rate, mejor/peor día, trade más rentable
- Implementación: cron job (Vercel cron o Supabase pg_cron) + Resend/Nodemailer
- Template: HTML email con estilo ZenTrade

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

1. Verificar DNS de Resend (mxtoolbox.com → `resend._domainkey.zen-trader.com`) — resolver spam
2. Pruebas end-to-end del flujo de pago (LemonSqueezy sandbox)
3. Verificar webhook con evento simulado
4. Empezar Fase 7.1 — Revenge Trading Detection (el gancho de ZenMode)
5. Continuar con 7.2 — Alertas de reglas de riesgo
6. 7.3 — Reporte semanal (email service ya configurado con Resend)



## Issues pendientes ##
1. ~~Implementar select en la consistencia~~ ✅ Resuelto (2026-03-03)
2. ~~Ajustar el mail de activacion de cuenta~~ ✅ Resuelto (2026-03-03)
3. Backtesting
4. Configurar DNS completos para Resend (DKIM/SPF/DMARC) — email llega a spam hasta que propaguen

---

## Cuándo lanzar el MVP

**El producto ya es un MVP funcional. Se puede lanzar en 5 días.**

El loop core de valor está completo:
> Registro → Crear cuenta → Registrar trades → Ver dashboard → Exportar Trading Plan → Importar CSV → Billing

### Solo 2 blockers reales antes de lanzar

**Blocker 1 — Verificar el flujo de pago end-to-end**
El checkout existe en código pero nunca se probó en producción real.
Si alguien paga y el webhook falla, queda en free plan. Eso no puede pasar.
- Probar sandbox → simular webhook → verificar plan en DB → pasar a modo LIVE

**Blocker 2 — Privacy Policy + Terms of Service**
Requerido legalmente para procesar pagos. LemonSqueezy también lo exige.
- Usar Termly o iubenda (~2 horas, no requiere abogado)

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

