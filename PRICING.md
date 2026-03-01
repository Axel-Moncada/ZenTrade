# ZenTrade — Planes y Precios

Última actualización: 2026-02-28

---

## Precios

| Plan | Mensual | Anual (total) | Equiv/mes anual | Ahorro |
|------|---------|---------------|-----------------|--------|
| **Free** | $0 | — | — | — |
| **Starter** | $9/mo | $84/año | $7/mo | $24/año |
| **Professional** | $29/mo | $249/año | $21/mo | $99/año |
| **ZenMode** | $59/mo | $499/año | $42/mo | $209/año |

---

## Funcionalidades por plan

| Funcionalidad | Free | Starter | Professional | ZenMode |
|---------------|------|---------|--------------|---------|
| **Cuentas** | 1 | 2 | Ilimitadas | Ilimitadas |
| **— CORE —** | | | | |
| Registro manual de trades | ✅ | ✅ | ✅ | ✅ |
| Dashboard básico | ✅ | ✅ | ✅ | ✅ |
| Calendario de trades | ✅ | ✅ | ✅ | ✅ |
| Export CSV | ✅ | ✅ | ✅ | ✅ |
| **— PROFESSIONAL —** | | | | |
| Import CSV automático | ❌ | ❌ | ✅ | ✅ |
| Export PDF / Excel | ❌ | ❌ | ✅ | ✅ |
| Dashboard analítico completo | ❌ | ❌ | ✅ | ✅ |
| Profit factor + consistency score | ❌ | ❌ | ✅ | ✅ |
| Equity curve | ❌ | ❌ | ✅ | ✅ |
| Filtros avanzados de trades | ❌ | ❌ | ✅ | ✅ |
| Trading Plan PDF | ❌ | ❌ | ✅ | ✅ |
| Calendario emociones + tags | ❌ | ❌ | ✅ | ✅ |
| **— ZENMODE (IA) —** | | | | |
| Revenge trading detection | ❌ | ❌ | ❌ | 🔨 |
| Alertas de reglas de riesgo | ❌ | ❌ | ❌ | 🔨 |
| Reporte semanal automático por email | ❌ | ❌ | ❌ | 🔨 |
| Análisis de horario óptimo (IA) | ❌ | ❌ | ❌ | 🔨 |
| Benchmark vs prop firm requirements | ❌ | ❌ | ❌ | 🔨 |
| AI Journaling prompts | ❌ | ❌ | ❌ | 🔨 |
| **— SOPORTE —** | | | | |
| Soporte por email | ❌ | ✅ | ✅ | ✅ |
| Soporte prioritario | ❌ | ❌ | ✅ | ✅ |
| Coaching 1-a-1 mensual | ❌ | ❌ | ❌ | 🔜 |
| Soporte 24/7 | ❌ | ❌ | ❌ | 🔜 |

> 🔨 = En desarrollo | 🔜 = Próximamente

---

## Variant IDs en LemonSqueezy (sandbox)

| Plan | Intervalo | Variant ID |
|------|-----------|------------|
| Starter | Mensual | 1352212 |
| Starter | Anual | 1352211 |
| Professional | Mensual | 1352216 |
| Professional | Anual | 1352215 |
| ZenMode | Mensual | 1354866 |
| ZenMode | Anual | 1354868 |

---

## Lógica de límites (código)

- `free` → 1 cuenta, sin upgrade prompts agresivos
- `starter` → 2 cuentas, al llegar al límite ve prompt de upgrade a Pro
- `pro` → ilimitadas, acceso a todas las features Professional
- `zenmode` → ilimitadas, acceso a todas las features IA (cuando estén listas)

Fuente de verdad en código: `lib/lemonsqueezy/get-user-plan.ts` → `ACCOUNT_LIMITS`
