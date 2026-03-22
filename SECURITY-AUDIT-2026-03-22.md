# Auditoría de Seguridad Pre-Lanzamiento — 2026-03-22

Auditoría completa ejecutada por `zentrade-security-tester` antes del deploy a producción (`zen-trader.com`).

---

## Resumen ejecutivo

| Área | Estado |
|------|--------|
| Webhook Wompi (checksum SHA256) | ✅ PASS |
| Checkout flow (auth + precios server-side) | ✅ PASS |
| Plan gating — Import CSV | ❌ **CRÍTICO → CORREGIDO** |
| Plan gating — resto de features | ✅ PASS |
| RLS Policies (Supabase) | ✅ PASS |
| Autenticación API Routes | ✅ PASS |
| Cron jobs (Bearer auth) | ✅ PASS |
| Sistema de afiliados — doble comisión | ❌ **CRÍTICO → CORREGIDO** |
| billing/cancel — cliente incorrecto | ⚠️ IMPORTANTE → CORREGIDO |
| Panel de Admin | ✅ PASS |
| Secretos hardcodeados | ✅ PASS |

---

## Issues encontrados y corregidos

### ❌ CRÍTICO 1 — Import CSV sin plan gating server-side
**Archivo**: `app/api/trades/import/route.ts`
**Descripción**: La ruta `POST /api/trades/import` verificaba autenticación pero **no verificaba el plan**. Cualquier usuario Free o Starter podía importar trades vía API directa, ignorando la restricción de plan que solo aparecía en la UI.
**Fix aplicado**: Se agregó `getUserPlan()` check al inicio de la ruta. Si el usuario no es `pro` ni `zenmode`, retorna `403` con código `UPGRADE_REQUIRED`.
**Archivos modificados**: `app/api/trades/import/route.ts`

---

### ❌ CRÍTICO 2 — Doble comisión de afiliados por retry de Wompi
**Archivo**: `app/api/webhooks/wompi/route.ts:135` + `supabase/016_affiliate_system.sql`
**Descripción**: Si Wompi hace un retry del webhook (comportamiento estándar cuando no recibe 200 a tiempo), el handler insertaba un segundo registro en `affiliate_conversions` para el mismo `transaction_id`. La tabla no tenía constraint `UNIQUE` en `transaction_id`.
**Fix aplicado**:
1. Cambio de `insert()` a `upsert({ onConflict: 'transaction_id', ignoreDuplicates: true })` en el webhook.
2. Nueva migración `supabase/017_affiliate_idempotency.sql` con `UNIQUE (transaction_id)`.
**Archivos modificados**: `app/api/webhooks/wompi/route.ts`, `supabase/017_affiliate_idempotency.sql` (nuevo)

---

### ⚠️ IMPORTANTE — billing/cancel usaba cliente de usuario para UPDATE en subscriptions
**Archivo**: `app/api/billing/cancel/route.ts`
**Descripción**: La ruta usaba el cliente Supabase con JWT del usuario para hacer `UPDATE` en la tabla `subscriptions`. La política RLS solo otorga `SELECT` a usuarios autenticados, por lo que el UPDATE fallaba silenciosamente (Supabase devuelve 200 sin filas afectadas, sin error).
**Fix aplicado**: Cambio a `supabaseAdmin` para el UPDATE (el `user.id` sigue verificándose desde el JWT en el mismo request).
**Archivos modificados**: `app/api/billing/cancel/route.ts`

---

### ⚠️ IMPORTANTE — `increment_affiliate_uses` sin SECURITY DEFINER
**Archivo**: `supabase/016_affiliate_system.sql`
**Descripción**: La función PostgreSQL corría como `SECURITY INVOKER`, sin protección si alguien la llamaba desde un contexto de menor privilegio.
**Fix aplicado**: `SECURITY DEFINER` + `SET search_path = public` en `supabase/017_affiliate_idempotency.sql`.

---

### ⚠️ Uso de `any` en Import route (violación de reglas del proyecto)
**Archivo**: `app/api/trades/import/route.ts:81,125`
**Fix aplicado**: Reemplazado `any` por `Record<string, unknown>` con casts explícitos.

---

## Lo que está bien ✅

### Webhook Wompi
- Validación de firma SHA256 correcta (algoritmo oficial de Wompi).
- Si `WOMPI_EVENTS_KEY` no está configurado, rechaza todo webhook.
- Verificación de monto cobrado vs. monto esperado — previene underpayment.
- Mapeo vía `pending_checkouts` creado server-side — previene reference manipulation.
- Escritura en `subscriptions` con `supabaseAdmin` (nunca JWT de usuario).

### Checkout
- Autenticación verificada antes de crear el payment link.
- Validación Zod del plan (`z.enum` — no se puede pasar un plan inválido o `free`).
- Precios definidos 100% server-side — el cliente no puede manipular montos.
- Verificación de límite de usos del código de afiliado antes de aplicar descuento.
- `allowedOrigins` restringe el `redirect_url` a dominios propios.

### Plan Gating
- `GET /api/accounts` verifica `getUserPlan()` + `ACCOUNT_LIMITS` server-side.
- `POST /api/accounts` verifica plan antes de insertar.
- `POST /api/agents/zencoach` verifica `plan.isZenMode` server-side.
- Import CSV ahora corregido (ver arriba).

### RLS Policies
- Tabla `subscriptions`: RLS habilitada, solo `SELECT` para usuarios autenticados, INSERT/UPDATE/DELETE solo service role.
- Tabla `pending_checkouts`: Solo service role.
- Tabla `affiliate_codes` y `affiliate_conversions`: Solo service role.
- Tabla `newsletter_subscribers`: INSERT anónimo permitido (correcto para formulario público), resto solo service role.
- `supabaseAdmin` (service role key) nunca expuesto en cliente ni componentes `'use client'`.

### Autenticación
- Todas las rutas de datos verifican `supabase.auth.getUser()` y retornan 401.
- Todos los cron jobs verifican `Authorization: Bearer ${CRON_SECRET}`.
- Agentes internos (n8n) verifican `SUPPORT_AGENT_SECRET` / `MARKETING_AGENT_SECRET`.
- Ruta `/api/dev/preview-email` retorna 404 en `NODE_ENV === 'production'`.

### Admin
- Doble check: Server Component + API route verifican `isAdmin(user.email)`.
- `isAdmin()` basado en `ADMIN_EMAILS` env var — no hay escalada de privilegios.
- Inputs validados con Zod en todos los endpoints admin.

### Secretos
- Sin valores hardcodeados — todas las claves usan `process.env.*`.
- Variables críticas presentes: `WOMPI_EVENTS_KEY`, `WOMPI_PRIVATE_KEY`, `WOMPI_INTEGRITY_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `CRON_SECRET`, `ADMIN_EMAILS`.

---

## Pendiente post-lanzamiento (no bloquea el deploy)

1. **Rate limiting en `/api/newsletter/subscribe`** — Sin rate limit, un bot puede llenar la tabla con emails falsos. Solución: middleware de rate limiting por IP o Cloudflare WAF rules.
2. **Migración documental del schema** — `supabase/006_subscriptions.sql` documenta `lemon_squeezy_subscription_id` pero el schema real usa `processor_subscription_id`. Crear una migración documentativa para futuros developers o entornos de staging.

---

*Auditoría ejecutada por `zentrade-security-tester` (claude-sonnet-4-6). Corregido por Claude Code el 2026-03-22.*
