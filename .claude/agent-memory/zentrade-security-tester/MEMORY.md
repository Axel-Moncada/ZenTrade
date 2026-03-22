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

## Tests pendientes de ejecutar

- [ ] RLS isolation test: Usuario A no puede ver datos de Usuario B
- [ ] Webhook spoofing test: payload con checksum inválido debe retornar 400
- [ ] Plan gating test: usuario Free no puede crear cuenta #2 vía API
- [ ] Subscription expiry test: suscripción vencida baja a Free correctamente
