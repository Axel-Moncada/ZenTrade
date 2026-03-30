# 📋 Guía de Testing - Fase 6: Journey Completo de Trading

## 🎯 Objetivo
Verificar que todos los valores del journey de trading se actualicen correctamente desde que se registra un trade hasta que se reflejan las estadísticas en el dashboard.

---

## 🔄 Flujo Completo del Sistema

### 1. **Crear Trade** → 2. **Trigger de Balance** → 3. **Actualización Dashboard**

---

## ✅ Tests a Realizar

### Test 1: Balance Automático con Trades Ganadores

**Setup inicial:**
1. Ve a **Cuentas** y verifica el balance inicial de una cuenta
   - Ejemplo: Balance inicial = $10,000.00

**Acciones:**
1. Crea un trade **GANADOR**:
   - Cuenta: (la que verificaste)
   - Instrumento: MNQ
   - Fecha: Hoy
   - Lado: Long
   - Contratos: 2
   - **Resultado: +150.00** ✅
   - Exit Reason: Take Profit
   - Siguió plan: Sí
   - Emociones: Confiado
   - Notas: "Entrada perfecta"

**Verificaciones:**
- [ ] El trade aparece en **Historial de Trades**
- [ ] El trade aparece en **Calendario** en la fecha correcta
- [ ] En **Cuentas**, el balance actual = Balance inicial + 150.00 (ej: $10,150.00)

**Dashboard - Verificar:**
- [ ] **P&L Total**: +$150.00 (verde)
- [ ] **Total Trades**: 1
- [ ] **Win Rate**: 100%
- [ ] **Winning Trades**: 1
- [ ] **Losing Trades**: 0
- [ ] **Profit Factor**: ∞ (infinity, porque no hay pérdidas)
- [ ] **Avg/Trade**: +$150
- [ ] **Max Gain**: $150
- [ ] **Equity Curve**: Sube de 0 a +150
- [ ] **Plan Adherence**: 100%

---

### Test 2: Agregar Trade Perdedor

**Acciones:**
1. Crea un segundo trade **PERDEDOR**:
   - Instrumento: MNQ
   - Fecha: Hoy (misma fecha o día siguiente)
   - Lado: Short
   - Contratos: 1
   - **Resultado: -75.00** ❌
   - Exit Reason: Stop Loss
   - Siguió plan: Sí
   - Emociones: Frustrado
   - Notas: "SL respetado"

**Verificaciones:**
- [ ] Ahora hay **2 trades** en el historial
- [ ] Balance actual = Balance inicial + 150 - 75 = (ej: $10,075.00)

**Dashboard - Verificar:**
- [ ] **P&L Total**: +$75.00 (verde)
- [ ] **Total Trades**: 2
- [ ] **Win Rate**: 50% (1 ganador de 2 trades)
- [ ] **Winning Trades**: 1
- [ ] **Losing Trades**: 1
- [ ] **Profit Factor**: 2.00 (150/75 = 2)
- [ ] **Avg/Trade**: +$37.50
- [ ] **Max Gain**: $150
- [ ] **Max Loss**: -$75
- [ ] **Equity Curve**: Sube a +150, luego baja a +75
- [ ] **Wins/Losses Chart**: Muestra 1 verde y 1 rojo
- [ ] **Exit Reasons**: 50% Take Profit, 50% Stop Loss

---

### Test 3: Balance Negativo

**Acciones:**
1. Crea un tercer trade **PERDEDOR GRANDE**:
   - Instrumento: ES
   - Fecha: Hoy o mañana
   - Lado: Long
   - Contratos: 3
   - **Resultado: -200.00** ❌
   - Exit Reason: Stop Loss
   - Siguió plan: No
   - Emociones: Ansioso, Frustrado
   - Notas: "Rompí el plan, entrada emocional"

**Verificaciones:**
- [ ] **3 trades** totales
- [ ] Balance actual = Balance inicial + 150 - 75 - 200 = (ej: $9,875.00)
- [ ] El balance está ROJO (menor al inicial)

**Dashboard - Verificar:**
- [ ] **P&L Total**: -$125.00 (rojo) ❌
- [ ] **Total Trades**: 3
- [ ] **Win Rate**: 33.3% (1 ganador de 3)
- [ ] **Winning Trades**: 1
- [ ] **Losing Trades**: 2
- [ ] **Profit Factor**: 0.75 (150/200 = 0.75, menor a 1)
- [ ] **Avg/Trade**: -$41.67
- [ ] **Max Loss**: -$200
- [ ] **Equity Curve**: +150 → +75 → -125 (línea descendente al final)
- [ ] **Plan Adherence**: 66.7% (2 de 3 siguieron plan)
- [ ] **Emotions**: Frustrado (2), Ansioso (1), Confiado (1)

---

### Test 4: Editar un Trade (Cambiar Resultado)

**Acciones:**
1. Edita el primer trade (el de +150):
   - Cambia resultado de **+150** a **+300**

**Verificaciones:**
- [ ] Balance se actualiza automáticamente:
   - Nuevo balance = inicial + 300 - 75 - 200 = (ej: $10,025.00)

**Dashboard - Verificar:**
- [ ] **P&L Total**: +$25.00 (verde) ✅
- [ ] **Max Gain**: $300 (actualizado)
- [ ] **Profit Factor**: 1.09 (300/275)
- [ ] **Avg/Trade**: +$8.33
- [ ] **Win Rate**: Sigue en 33.3%
- [ ] **Equity Curve**: Se ajusta automáticamente

---

### Test 5: Eliminar un Trade

**Acciones:**
1. Elimina el trade perdedor de -200

**Verificaciones:**
- [ ] Solo quedan **2 trades**
- [ ] Balance = inicial + 300 - 75 = (ej: $10,225.00)

**Dashboard - Verificar:**
- [ ] **P&L Total**: +$225.00 (verde)
- [ ] **Total Trades**: 2
- [ ] **Win Rate**: 50% (volvió a subir)
- [ ] **Losing Trades**: 1
- [ ] **Profit Factor**: 4.00 (300/75)
- [ ] **Equity Curve**: Ya no muestra la caída de -200

---

### Test 6: Múltiples Trades en un Día

**Acciones:**
1. Crea 3 trades en **la misma fecha**:
   - Trade 1: +50
   - Trade 2: +100
   - Trade 3: -30

**Verificaciones en Dashboard:**
- [ ] **Equity Curve**: Muestra un solo punto para ese día con P&L = +120
- [ ] **Wins/Losses Chart**: Muestra 2 wins y 1 loss para ese día
- [ ] **Daily Summary**: 3 trades ese día

---

### Test 7: Filtros de Fecha en Dashboard

**Acciones:**
1. En Dashboard, cambia el rango de fechas:
   - Prueba "Últimos 7 días"
   - Prueba "Este mes"
   - Prueba "Últimos 30 días"

**Verificaciones:**
- [ ] Las estadísticas se recalculan correctamente
- [ ] Solo se muestran trades dentro del rango
- [ ] El P&L Total refleja solo trades del período seleccionado
- [ ] Los gráficos se ajustan al período

---

### Test 8: Métricas por Instrumento

**Acciones:**
1. Crea trades en diferentes instrumentos:
   - 2 trades en MNQ (1 win, 1 loss)
   - 3 trades en ES (2 wins, 1 loss)

**Verificaciones en Dashboard:**
- [ ] **Instrument Stats Table** muestra 2 filas (MNQ y ES)
- [ ] Cada instrumento tiene:
   - Total Trades correcto
   - Win Rate correcto
   - Total P&L correcto
   - Avg P&L correcto

---

### Test 9: Alertas de Riesgo (Regla 30%)

**Escenario:**
1. Crea múltiples trades de diferentes valores
2. Haz que UN solo día represente más del 30% del P&L total

**Verificación:**
- [ ] Aparece alerta amarilla en Dashboard indicando concentración de riesgo
- [ ] El día con mayor ganancia está resaltado

---

### Test 10: Import/Export CSV

**Acciones:**
1. Descarga plantilla CSV
2. Rellena con 5 trades
3. Importa el archivo

**Verificaciones:**
- [ ] Los 5 trades se importan correctamente
- [ ] El balance se actualiza sumando los 5 resultados
- [ ] Las estadísticas del dashboard se recalculan
- [ ] Export CSV genera archivo con todos los trades

---

## 🎨 Verificaciones Visuales

### Colores y Badges
- [ ] P&L positivo: Verde (#10b981)
- [ ] P&L negativo: Rojo (#ef4444)
- [ ] Win badge: Verde con ✓
- [ ] Loss badge: Rojo con ✗
- [ ] Win Rate ≥50%: Verde
- [ ] Win Rate <50%: Rojo

### Gráficos
- [ ] **Equity Curve**: Línea suave, correcta progresión temporal
- [ ] **Wins/Losses**: Barras apiladas, colores correctos
- [ ] **Emotions Pie Chart**: Distribución correcta
- [ ] **Exit Reasons**: Proporciones correctas

---

## 🔢 Fórmulas que el Sistema Usa

### Balance Actual
```
current_balance = initial_balance + manual_adjustments + Σ(result de todos los trades)
```

### Win Rate
```
win_rate = (winning_trades / total_trades) × 100
```

### Profit Factor
```
profit_factor = total_gross_wins / abs(total_gross_losses)
Si no hay pérdidas: Infinity (∞)
```

### Avg Per Trade
```
avg_per_trade = total_pnl / total_trades
```

---

## 🐛 Problemas Comunes

### ❌ "El balance no se actualiza"
- **Causa**: Trigger no activado
- **Solución**: Verifica que el trade tiene el campo `result` lleno

### ❌ "Dashboard muestra 0 trades pero existen"
- **Causa**: Filtros de fecha incorrectos
- **Solución**: Ajusta el rango de fechas o selecciona "Todo el tiempo"

### ❌ "Win Rate incorrecto"
- **Causa**: Trades con result = 0 o null
- **Solución**: Todos los trades deben tener `result` positivo o negativo (no 0)

### ❌ "Equity Curve no se muestra"
- **Causa**: No hay suficientes trades o están en fechas futuras
- **Solución**: Crea trades en fechas pasadas

---

## ✨ Checklist Final

- [ ] ✅ Balance se actualiza automáticamente al crear trade
- [ ] ✅ Balance se actualiza al editar trade
- [ ] ✅ Balance se actualiza al eliminar trade
- [ ] ✅ Dashboard muestra todas las métricas correctamente
- [ ] ✅ Win Rate se calcula correctamente
- [ ] ✅ Profit Factor se calcula correctamente
- [ ] ✅ Gráficos reflejan datos reales
- [ ] ✅ Filtros de fecha funcionan
- [ ] ✅ Historial de trades muestra todos los campos
- [ ] ✅ Import CSV funciona (máximo 50 trades)
- [ ] ✅ Export CSV descarga correctamente
- [ ] ✅ Trading Plan se puede exportar a PDF
- [ ] ✅ Calendario muestra trades en fechas correctas

---

## 🎯 Escenario Real Completo

```
Ejemplo de Journey de 1 Semana:

Lunes:
  - Trade 1: MNQ Long +125 (TP) ✅
  - Trade 2: MNQ Short +80 (TP) ✅
  → Balance: +205

Martes:
  - Trade 3: ES Long -150 (SL) ❌
  - Trade 4: MNQ Long +90 (TP) ✅
  → Balance día: -60 | Acumulado: +145

Miércoles:
  - Trade 5: MNQ Short -100 (SL) ❌
  → Balance día: -100 | Acumulado: +45

Jueves:
  - Trade 6: ES Long +300 (TP) ✅
  - Trade 7: MNQ Long +150 (TP) ✅
  → Balance día: +450 | Acumulado: +495

Viernes:
  - Trade 8: MNQ Short -75 (SL) ❌
  → Balance día: -75 | Acumulado: +420

RESULTADOS FINALES:
- Total Trades: 8
- Winning Trades: 5 (62.5% Win Rate)
- Losing Trades: 3
- Total P&L: +$420
- Profit Factor: 2.16 (745/345)
- Avg/Trade: +$52.50
- Max Gain: +$300
- Max Loss: -$150
- Mejor día: Jueves (+$450)
- Plan Adherence: Verificar individualmente
```

---

**¡Todos los valores deben coincidir! Si algo no cuadra, hay un bug que corregir.** 🔍
