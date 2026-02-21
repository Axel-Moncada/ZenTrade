# Zentrade - Journal de Trading

Web app para gestión de journal de trading de futuros.

## Stack Técnico

- **Framework**: Next.js 15 (App Router)
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS + shadcn/ui
- **Auth & DB**: Supabase (Auth + Postgres + RLS)
- **Validación**: Zod

## Configuración Inicial

### 1. Instalar Dependencias

```bash
npm install
```

### 2. Configurar Supabase

1. Crea un proyecto en [Supabase](https://supabase.com)
2. Copia las credenciales de tu proyecto
3. Crea un archivo `.env.local`:

```bash
cp .env.example .env.local
```

4. Completa las variables en `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_de_supabase
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

5. Ejecuta las migrations de la base de datos:
   - Ve al dashboard de Supabase
   - Navega a SQL Editor
   - Copia y ejecuta el contenido de `supabase/migrations/001_accounts_setup.sql`
   - Copia y ejecuta el contenido de `supabase/migrations/002_daily_summaries.sql`
   - Copia y ejecuta el contenido de `supabase/migrations/003_trades_setup.sql`
   - Copia y ejecuta el contenido de `supabase/migrations/004_account_balance_trigger.sql`
   - Copia y ejecuta el contenido de `supabase/migrations/005_trading_plans.sql`
   - Esto creará las tablas necesarias con sus políticas RLS y triggers

### 3. Ejecutar en Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000)

## Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm start` - Inicia el servidor de producción
- `npm run lint` - Ejecuta el linter

## Fase 0 - Completa ✅

- ✅ Setup del proyecto (Next.js + TypeScript + Tailwind)
- ✅ Configuración de Supabase
- ✅ Sistema de autenticación (login/register/logout)
- ✅ Layout privado con sidebar
- ✅ Middleware para protección de rutas
- ✅ API Routes con validación Zod
- ✅ UI en español

## Fase 1 - Completa ✅

- ✅ Tabla `profiles` y `accounts` en Supabase
- ✅ Políticas RLS configuradas
- ✅ API Routes CRUD para cuentas (`/api/accounts`)
- ✅ Validación Zod para crear/actualizar cuentas
- ✅ Página lista de cuentas (`/dashboard/accounts`)
- ✅ Página crear cuenta (`/dashboard/accounts/new`)
- ✅ Página ver/editar cuenta (`/dashboard/accounts/[id]`)
- ✅ Componentes: AccountForm, AccountCard, AccountSelector
- ✅ Link "Cuentas" en sidebar

## Fase 2 - Completa ✅

- ✅ Tabla `daily_summaries` en Supabase
- ✅ Políticas RLS configuradas
- ✅ Trigger para auto-actualizar summaries (se activará en Fase 3)
- ✅ API Routes para summaries (`/api/daily-summaries`)
- ✅ Página calendario mensual (`/dashboard/calendar`)
- ✅ Componentes: MonthlyCalendar, DayCell, DayModal, CalendarHeader
- ✅ Selector de cuenta para filtrar calendario
- ✅ Navegación mes anterior/siguiente/hoy
- ✅ Modal día con métricas y notas editables
- ✅ Utils para manejo de fechas
- ✅ Link "Calendario" en sidebar

## Fase 3 - Completa ✅

- ✅ Tabla `instrument_specs` con instrumentos comunes (MNQ, NQ, ES, MES, etc.)
- ✅ Tabla `trades` simplificada con campos relevantes
- ✅ Campos para análisis: `exit_reason` (TP/SL/BE), `followed_plan`, `emotions`
- ✅ Trigger para cálculo automático de PNL (BEFORE INSERT/UPDATE)
- ✅ Trigger activado para actualizar `daily_summaries` automáticamente
- ✅ Políticas RLS configuradas para trades e instrumentos
- ✅ API Routes para instrumentos (`/api/instruments`)
- ✅ API Routes CRUD para trades (`/api/trades`, `/api/trades/[id]`)
- ✅ Validación Zod para crear/actualizar trades
- ✅ TradeCard rediseñado: información esencial y visual
- ✅ TradeForm mejorado: exit_reason, plan tracking, emotions
- ✅ Sistema de etiquetas para análisis psicológico
- ✅ Integración completa en DayModal
- ✅ Eliminación de trades con confirmación
- ✅ Actualización automática de métricas

### Información Mostrada en cada Trade

Cada trade se muestra de forma simple y directa con:
- **Instrumento**: Símbolo (MNQ, NQ, ES, etc.)
- **Dirección**: LONG (compra) o SHORT (venta)
- **PNL**: Valor total en verde (ganancia) o rojo (pérdida)
- **Contratos**: Cantidad operada
- **Razón de salida**: Take Profit, Stop Loss, Break Even, Manual, Timeout
- **Trading Plan**: ✓ Siguió el plan o ✗ No siguió el plan
- **Emociones**: Tags con emociones experimentadas (disciplinado, ansioso, miedo, etc.)
- **Notas**: Observaciones adicionales

### Razones de Salida Disponibles

- 🎯 **Take Profit**: Alcanzó objetivo de ganancia
- ⚠️ **Stop Loss**: Cortó pérdidas
- ➖ **Break Even**: Cerró en punto de equilibrio
- 🕐 **Manual**: Salida manual sin razón específica
- ⏱️ **Timeout**: Cerró por tiempo

### Emociones Rastreables

- disciplinado, confiado, paciente
- ansioso, miedo, codicia
- frustrado, eufórico
- revenge_trading, fomo

### Cálculo de PNL Automático

El sistema calcula el PNL automáticamente usando las especificaciones del instrumento:

```
Para LONG:
  points = (exit_price - entry_price) / tick_size
  gross_pnl = points * tick_value * contracts

Para SHORT:
  points = (entry_price - exit_price) / tick_size
  gross_pnl = points * tick_value * contracts

net_pnl = gross_pnl - commission
```

### Instrumentos Disponibles

- **Índices**: MNQ, NQ, MES, ES, MYM, YM, M2K, RTY
- **Energía**: MCL, CL
- **Metales**: MGC, GC

## Fase 4 - Completa ✅

- ✅ API Route para stats del dashboard (`/api/dashboard/stats`)
- ✅ Utilidades de cálculo de KPIs (dashboard-calculations.ts)
- ✅ Tipos TypeScript para dashboard (dashboard.ts)

### KPIs Implementados

**KPIs Principales:**
- Total PNL (periodo seleccionado)
- Win Rate %
- Total Trades
- Promedio por Trade

**KPIs Secundarios:**
- Profit Factor (ganancia bruta / pérdida bruta)
- Mayor Ganancia / Mayor Pérdida
- Racha Actual (ganadora/perdedora)
- Mejor Día con **alerta del 30%** (regla de fondeo)
- Peor Día

**Análisis de Trading:**
- Adherencia al Plan de Trading (%)
- Análisis de Emociones por frecuencia
- Distribución de Razones de Salida
- Estadísticas por Instrumento

### Gráficos con Recharts

- ✅ **Curva de Capital** (Line Chart): PNL acumulado por día
- ✅ **Ganadores vs Perdedores** (Bar Chart): Cantidad de trades ganadores vs perdedores por día
- ✅ **Análisis de Emociones** (Pie Chart): Frecuencia de emociones en trades
- ✅ **Razones de Salida** (Pie Chart): Distribución de exit reasons
- ✅ **Adherencia al Plan** (Donut Chart): % de trades que siguieron el plan

### Filtros Disponibles

- ✅ Selector de cuenta (AccountSelector)
- ✅ Rango de fechas con presets:
  - Últimos 7 días
  - Últimos 30 días (default)
  - Últimos 90 días
  - Este mes
  - Personalizado (fecha inicio y fin)

### Regla del 30% (Fondeo)

El dashboard muestra una **alerta amarilla** cuando el mejor día de trading supera el 30% del profit acumulado total. Esta es una regla común en cuentas de evaluación/fondeo para evitar trading agresivo o suerte excesiva en un solo día.

### Tabla de Instrumentos

Muestra estadísticas detalladas por cada instrumento operado:
- Símbolo y nombre completo
- Total de trades (con desglose W/L)
- Win Rate %
- PNL Total
- PNL Promedio por trade

### Componentes Creados

```
components/dashboard/
  stats-card.tsx              # Card reutilizable para KPIs
  equity-curve-chart.tsx      # Gráfico curva de capital
  wins-losses-chart.tsx       # Gráfico wins/losses
  emotions-chart.tsx          # Gráfico de emociones
  exit-reasons-chart.tsx      # Gráfico exit reasons
  plan-adherence-chart.tsx    # Gráfico adherencia al plan
  instrument-stats-table.tsx  # Tabla stats por instrumento
  date-range-selector.tsx     # Selector de rango fechas
```

## Fase 5: Trades, Export/Import y Trading Plan ✅

### Balance Automático 

El sistema actualiza automáticamente el balance de las cuentas cada vez que se agregan, modifican o eliminan trades:

- **Fórmula**: `current_balance = initial_balance + manual_adjustments + SUM(trades.result)`
- **Campo nuevo**: `manual_adjustments` para depósitos/retiros externos
- **Trigger**: Se ejecuta automáticamente en la base de datos
- **API**: Endpoint `/api/accounts/[id]/adjustments` para agregar ajustes manuales

### Tabla de Trades

Página nueva `/dashboard/trades` con vista completa de historial:

- ✅ **Tabla completa** con 14 columnas: Fecha, Instrumento, Lado, Cantidad, Precio Entrada, Precio Salida, Stop Loss, Take Profit, Comisión, Resultado, Razón Salida, Plan, Emoción, Notas
- ✅ **Filtros avanzados** (8 tipos):
  - Rango de fechas (inicio y fin)
  - Instrumento específico
  - Lado (long/short)
  - Razón de salida
  - Siguió el plan (sí/no)
  - Emoción
  - Solo ganadores/perdedores
- ✅ **Ordenamiento** por fecha, resultado o instrumento
- ✅ **Paginación**: 20 trades por página
- ✅ **Estadísticas en tiempo real**: Total trades, Ganadores, Perdedores, P&L Total
- ✅ **Badges activos** mostrando filtros aplicados

### Export de Trades (CSV)

- ✅ Botón "Exportar CSV" en página de trades
- ✅ Respeta todos los filtros activos
- ✅ 17 columnas exportadas con datos completos
- ✅ Filename automático: `zentrade-trades-{cuenta}-{fecha}.csv`
- ✅ API: `/api/trades/export` con query params para filtros

### Import de Trades (CSV)

Página nueva `/dashboard/trades/import` para importación masiva:

- ✅ **Botón descargar plantilla** con formato correcto
- ✅ **Drag & drop** para subir archivo CSV
- ✅ **Límite**: Máximo 50 trades por importación
- ✅ **Validación**: Verifica campos requeridos antes de importar
- ✅ **Preview**: Muestra primeros 5 trades antes de confirmar
- ✅ **Auto-creación**: Crea instrumentos automáticamente si no existen
- ✅ **Mapeo flexible**: Acepta headers en español o inglés
- ✅ API: `/api/trades/import` y `/api/trades/template`

### Trading Plan

Página nueva `/dashboard/trading-plan` para definir estrategia:

- ✅ **Plan editable**: Siempre puedes modificar tu plan activo
- ✅ **6 secciones**:
  1. **Objetivos y Límites**: Diarios, semanales, mensuales (profit/loss)
  2. **Reglas de Entrada y Salida**: Texto libre para tu estrategia
  3. **Gestión de Riesgo**: % máximo por trade, trades diarios, posiciones concurrentes, ratio R:R
  4. **Instrumentos Permitidos**: Lista de símbolos autorizados
  5. **Horarios de Trading**: Horario y días permitidos
  6. **Checklist Pre-Trade**: Lista de verificación antes de operar
- ✅ **Notas de estrategia**: Campo para documentar tu metodología
- ✅ **Vista resumen**: Visualización organizada del plan activo
- ✅ **Export PDF**: Botón para exportar plan completo e imprimible
- ✅ API: `/api/trading-plans` (GET, POST, PATCH)
- ✅ Constraint: Un plan activo por cuenta

### Componentes Creados

```
components/trades/
  trades-table.tsx           # Tabla completa con 14 columnas
  trades-filters.tsx         # Panel de 8 filtros con badges
  import-csv.tsx             # Drag & drop uploader con preview
  
components/trading-plan/
  trading-plan-form.tsx      # Formulario completo con 6 secciones
  export-plan-pdf.tsx        # Generador de PDF imprimible
  
components/shared/
  account-selector.tsx       # Selector de cuenta reutilizable
  
components/ui/
  alert.tsx                  # Componente de alertas
  table.tsx                  # Componente de tabla shadcn
```

### Dependencias Agregadas

```bash
npm install papaparse react-dropzone @types/papaparse jspdf jspdf-autotable
```

## Fase 6: Testing y Validación Completa ✅

### Objetivo

Verificar que todo el journey de trading funciona correctamente desde que se crea un trade hasta que se reflejan las estadísticas en el dashboard.

### Estructura de Testing

- ✅ **Guía completa de testing** (`TESTING_GUIDE.md`)
- ✅ **10 escenarios de prueba** end-to-end
- ✅ **Verificación de triggers** automáticos de balance
- ✅ **Validación de cálculos** de todas las métricas
- ✅ **Checklist visual** de colores y badges
- ✅ **Escenario real completo** de 1 semana de trading

### Sistema de Triggers Automáticos

El sistema utiliza triggers de PostgreSQL para mantener todos los datos sincronizados:

**1. Balance Automático** (`update_account_balance`):
```sql
-- Se ejecuta en: INSERT, UPDATE, DELETE de trades
-- Fórmula: current_balance = initial_balance + manual_adjustments + Σ(result)
-- Scope: Actualiza automáticamente el balance de la cuenta
```

**2. Daily Summary** (`update_daily_summary`):
```sql
-- Se ejecuta en: INSERT, UPDATE, DELETE de trades
-- Calcula: total_trades, winning_trades, losing_trades, gross_pnl, net_pnl
-- Scope: Actualiza resumen diario para el calendario
```

### Fórmulas de Cálculo

**Balance Actual:**
```
current_balance = initial_balance + manual_adjustments + Σ(trades.result)
```

**Win Rate:**
```
win_rate = (winning_trades / total_trades) × 100
```

**Profit Factor:**
```
profit_factor = total_gross_wins / abs(total_gross_losses)
Si no hay pérdidas: Infinity (∞)
```

**Average Per Trade:**
```
avg_per_trade = total_pnl / total_trades
```

### Flujo de Datos Completo

```
1. Usuario crea trade
   ↓
2. API valida con Zod schema
   ↓
3. INSERT en tabla trades
   ↓
4. Trigger update_daily_summary ejecuta
   → Actualiza daily_summaries
   ↓
5. Trigger update_account_balance ejecuta
   → Recalcula current_balance
   ↓
6. Frontend refresca datos
   ↓
7. Dashboard recalcula estadísticas
   → Win rate, profit factor, equity curve, etc.
```

### Tests Realizados

✅ **Test 1**: Balance con trades ganadores
✅ **Test 2**: Balance con trades perdedores  
✅ **Test 3**: Balance negativo (menor al inicial)
✅ **Test 4**: Editar trade y recalcular balance
✅ **Test 5**: Eliminar trade y ajustar balance
✅ **Test 6**: Múltiples trades en un día
✅ **Test 7**: Filtros de fecha en dashboard
✅ **Test 8**: Métricas por instrumento
✅ **Test 9**: Alertas de riesgo (regla 30%)
✅ **Test 10**: Import/Export CSV

### Verificaciones del Sistema

**Dashboard Metrics:**
- Total P&L actualizado en tiempo real
- Win Rate calcula correctamente
- Profit Factor maneja división por cero (∞)
- Equity Curve refleja progresión temporal
- Wins/Losses agrupados por día
- Emotions y Exit Reasons con distribución correcta

**Colores y Badges:**
- P&L positivo: Verde (#10b981)
- P&L negativo: Rojo (#ef4444)
- Win badge: Verde con ✓
- Loss badge: Rojo con ✗
- Win Rate ≥50%: Verde
- Win Rate <50%: Rojo

**Integridad de Datos:**
- Trades vinculados a cuentas correctas
- Instrumentos referenciados correctamente
- Fechas validadas y ordenadas
- Results positivos/negativos correctos
- Emotions como array de strings
- Exit reasons con enum validation

### Archivos Clave de Testing

```
TESTING_GUIDE.md                              # Guía completa paso a paso
lib/utils/dashboard-calculations.ts           # Lógica de cálculos
supabase/migrations/004_account_balance_trigger.sql  # Trigger de balance
supabase/migrations/003_trades_setup.sql      # Trigger de daily summary
app/api/dashboard/stats/route.ts              # Endpoint de estadísticas
```

### Problemas Comunes Resueltos

❌ **"El balance no se actualiza"**
✅ Solución: Trigger configurado correctamente, se ejecuta automáticamente

❌ **"Dashboard muestra 0 trades"**
✅ Solución: Verificar filtros de fecha y selector de cuenta

❌ **"Win Rate incorrecto"**
✅ Solución: Validación Zod asegura que `result` siempre tiene valor

❌ **"Equity Curve no se muestra"**
✅ Solución: Trades ordenados por fecha correctamente

### Escenario Real de Prueba

**1 Semana de Trading Completa:**
- Lunes: +205 (2 wins)
- Martes: -60 acumulado +145 (1 win, 1 loss)
- Miércoles: -100 acumulado +45 (1 loss)
- Jueves: +450 acumulado +495 (2 wins)  
- Viernes: -75 acumulado +420 (1 loss)

**Resultados Esperados:**
- Total Trades: 8
- Winning Trades: 5 (62.5% Win Rate)
- Total P&L: +$420
- Profit Factor: 2.16 (745/345)
- Avg/Trade: +$52.50

## Próximas Fases

- **Fase 7**: Análisis avanzado (best/worst instruments, time analysis)
- **Fase 8**: Optimización de rendimiento y UX final
- **Fase 9**: Deploy a producción
