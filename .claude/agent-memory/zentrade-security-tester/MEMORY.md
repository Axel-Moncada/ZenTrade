# Zentrade Security Tester — Memoria Persistente

## Arquitectura de seguridad activa

- **Pagos**: Wompi production → payment links → webhook con SHA256 checksum
- **Webhook mapping**: `pending_checkouts` tabla (linkId → user_id + plan + interval)
  Wompi no respeta `reference` custom en payment links; usa su propio formato `{linkId}_{ts}_{random}`
- **Suscripciones**: tabla `subscriptions` con `wompi_payment_source_id` para cobros recurrentes
- **Auth en webhooks**: `validateWebhookChecksum()` en `lib/wompi/client.ts` — si `WOMPI_EVENTS_KEY` no está configurado, salta la validación (solo en dev)

## Hallazgos resueltos

- **2026-03-21**: Webhook retornaba 307 porque Wompi no sigue redirects. Fix: URL del webhook debe ser `www.zen-trader.com`, no `zen-trader.com` (Vercel redirige el apex domain).
- **2026-03-21**: `createPaymentLink()` ignoraba la `reference` custom. Fix: tabla `pending_checkouts` para mapear `linkId → usuario`.

## Patrones de RLS en Zentrade

Las tablas de usuario usan el patrón:
```sql
CREATE POLICY "users_own_data" ON tabla
  FOR ALL USING (auth.uid() = user_id);
```
Los webhooks y crons usan `supabaseAdmin` (service role) que bypasea RLS — correcto.

## Auditorías completadas

- **2026-03-22**: Auditoría pre-lanzamiento completa — ver `audit_2026-03-22.md`
  - CRÍTICO: Import CSV sin plan gating server-side
  - CRÍTICO: affiliate_conversions sin UNIQUE en transaction_id (doble comisión posible)
  - WARNING: billing/cancel usa user client (RLS puede bloquear UPDATE en prod)
  - WARNING: Migración 006 diverge del schema real (usar database.types.ts como fuente de verdad)

## Patrón crítico de plan gating (aprendido 2026-03-22)

**El bug más probable en Zentrade**: cheques de plan que dicen `plan.isPro` sin incluir `plan.isZenMode`.
- ZenMode hereda todas las features de Pro, por lo que cualquier check `isPro` debe ser `isPro || isZenMode`
- En API routes (server-side): `if (!plan.isPro && !plan.isZenMode)` para features Pro+
- En cliente (UI): `plan.isPro || plan.isZenMode` para mostrar/ocultar

**Fixes aplicados 2026-03-22 — auditoría de plan gating:**
1. `trading-plan/page.tsx` línea 86: botón Export PDF solo chequeaba `plan.isPro` → corregido a `plan.isPro || plan.isZenMode`
2. `trading-plan/page.tsx` línea 119: UpgradePrompt solo chequeaba `!plan.isPro` → corregido a `!plan.isPro && !plan.isZenMode`
3. `api/trades/revenge-check/route.ts`: sin plan gating server-side → agregado `getUserPlan` + check `!plan.isZenMode` (403)
4. `api/trades/template/route.ts`: sin auth ni plan gating → agregado auth check + `!plan.isPro && !plan.isZenMode` (403)
5. `profile/page.tsx`: highlightPlan no incluía ZenMode → corregido (bug de UX, no seguridad)

**APIs con plan gating correcto post-auditoría:**
- `POST /api/trades/import` — requiere `isPro || isZenMode` ✅
- `GET /api/trades/template` — requiere `isPro || isZenMode` ✅
- `POST /api/agents/zencoach` — requiere `isZenMode` ✅
- `GET /api/trades/revenge-check` — requiere `isZenMode` ✅

## Tests pendientes de ejecutar

- [ ] RLS isolation test: Usuario A no puede ver datos de Usuario B
- [ ] Webhook spoofing test: payload con checksum inválido debe retornar 400
- [ ] Plan gating test: usuario Free no puede importar trades vía API (POST /api/trades/import)
- [ ] Plan gating test: usuario Pro no puede usar /api/trades/revenge-check (debe retornar 403)
- [ ] Plan gating test: usuario Pro no puede descargar /api/trades/template (debe retornar 403)
- [ ] Subscription expiry test: suscripción vencida baja a Free correctamente
- [ ] billing/cancel test: verificar que UPDATE en subscriptions funciona con RLS en producción
