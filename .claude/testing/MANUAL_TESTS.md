# Zentrade — Guía de Pruebas Manuales

> Usa esta guía para validar el flujo completo de la app en un entorno local.
> Servidor local: `npm run dev` → http://localhost:3000

---

## 0. Setup previo

- [ ] Tener Supabase corriendo (local o proyecto en la nube)
- [ ] Variables de entorno configuradas: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- [ ] RLS habilitado en todas las tablas: `accounts`, `trades`, `daily_entries`, `withdrawals`, `profiles`

---

## 1. Autenticación

### Registro
- [ ] Ir a `/` y hacer clic en "Comenzar gratis" (o similar)
- [ ] Registrar una nueva cuenta con email + contraseña
- [ ] Verificar que se redirige al dashboard tras el registro
- [ ] Verificar que en Supabase → Auth → Users aparece el nuevo usuario

### Login
- [ ] Cerrar sesión y volver a `/login`
- [ ] Hacer login con credenciales válidas → redirige a `/dashboard`
- [ ] Intentar login con contraseña incorrecta → mensaje de error visible (no stack trace)
- [ ] Intentar acceder a `/dashboard` sin sesión → redirige a `/login`

### Logout
- [ ] Hacer clic en "Cerrar sesión" en el sidebar → redirige a `/login`
- [ ] Verificar que intentar volver a `/dashboard` redirige al login

---

## 2. Aislamiento de datos (RLS)

> Requiere dos cuentas de usuario distintas.

- [ ] Con **Usuario A**: crear una cuenta de trading y un trade
- [ ] Con **Usuario B**: verificar que NO aparecen las cuentas ni trades del Usuario A en ninguna página
- [ ] Con **Usuario B**: intentar llamar `GET /api/accounts` → solo devuelve datos propios
- [ ] Con **Usuario B**: intentar llamar `GET /api/trades?account_id=<id_de_A>` → devuelve vacío o 403

---

## 3. Accounts (Cuentas)

### Crear cuenta
- [ ] Ir a `/dashboard/accounts` → botón "Nueva Cuenta"
- [ ] Llenar formulario con datos válidos → guardar → aparece en el listado
- [ ] Verificar que el balance inicial y drawdown se muestran correctamente
- [ ] Intentar guardar con nombre vacío → error de validación visible
- [ ] Intentar guardar con max_drawdown > initial_balance → error de validación visible
- [ ] Intentar guardar con fecha futura → error de validación visible

### Editar cuenta
- [ ] Hacer clic en editar desde el listado → formulario pre-rellenado con datos actuales
- [ ] Cambiar el nombre y guardar → listado actualizado correctamente
- [ ] Cambiar el status a "Fallida" → badge de estado actualizado

### Eliminar cuenta
- [ ] Eliminar una cuenta → desaparece del listado
- [ ] Verificar que los trades asociados también se eliminan (o se manejan apropiadamente)

### Account Selector
- [ ] En el Dashboard, Calendar y Trades: el selector de cuenta muestra solo las cuentas propias
- [ ] Cambiar la cuenta seleccionada → los datos de la página cambian según la cuenta

---

## 4. Trades

### Crear trade
- [ ] Ir a `/dashboard/trades` → botón "Nuevo Trade"
- [ ] Seleccionar cuenta, instrumento, fecha, contratos, lado (Long/Short), resultado
- [ ] Guardar → aparece en la tabla con todos los campos correctos
- [ ] Intentar guardar sin cuenta seleccionada → error de validación
- [ ] Intentar guardar con contratos = 0 → error de validación
- [ ] Verificar que el PNL del trade se muestra correctamente (positivo verde, negativo rojo)

### Editar trade
- [ ] Hacer clic en un trade → editar resultado → guardar → tabla actualizada

### Eliminar trade
- [ ] Eliminar un trade → desaparece de la tabla
- [ ] Verificar que las métricas del dashboard se actualizan al volver

### Filtros de trades
- [ ] Filtrar por instrumento → solo aparecen trades de ese instrumento
- [ ] Filtrar por rango de fechas → solo aparecen trades en ese rango
- [ ] Filtrar por lado (Long/Short) → filtro funciona correctamente
- [ ] Filtrar por exit reason → funciona correctamente
- [ ] Combinar varios filtros → todos los filtros actúan en conjunto (AND)
- [ ] Limpiar filtros → tabla vuelve a mostrar todos los trades

---

## 5. Dashboard (KPIs y gráficos)

- [ ] Con al menos 5 trades registrados en la cuenta seleccionada:
  - [ ] **PNL Total** coincide con la suma manual de todos los trades
  - [ ] **Win Rate** coincide con: (trades ganadores / total) × 100
  - [ ] **Profit Factor** coincide con: suma_ganancias / suma_pérdidas
  - [ ] **Promedio por trade** coincide con: PNL total / total trades
  - [ ] **Mejor ganancia** es el resultado más alto de un solo trade
  - [ ] **Peor pérdida** es el resultado más bajo de un solo trade
  - [ ] **Equity Curve** muestra línea ascendente/descendente con fechas correctas
  - [ ] **Racha actual** es consistente con los últimos trades
- [ ] Cambiar el rango de fechas → KPIs se actualizan correctamente
- [ ] Con cuenta sin trades → KPIs en 0, gráficos vacíos (sin errores en consola)

---

## 6. Calendario

- [ ] Ir a `/dashboard/calendar`
- [ ] Días con trades muestran marcador visual (verde/rojo según PNL del día)
- [ ] Clic en un día con trades → muestra resumen de trades de ese día
- [ ] Clic en un día sin trades → puede agregar notas o entrada diaria
- [ ] Guardar notas en una entrada → al recargar la página las notas persisten
- [ ] Navegar entre meses → datos cargados correctamente en cada mes

---

## 7. Withdrawals (Retiros)

- [ ] Ir a `/dashboard/withdrawals`
- [ ] Crear un retiro con monto, cuenta y fecha → aparece en el listado
- [ ] Intentar crear con monto negativo → error de validación
- [ ] Editar un retiro → cambios reflejados correctamente
- [ ] Eliminar un retiro → desaparece del listado

---

## 8. Perfil de usuario

- [ ] Ir a `/dashboard/profile` (clic en avatar en el sidebar)
- [ ] Verificar que se muestra: nombre, email, "Miembro desde"
- [ ] Hacer clic en "Editar Perfil" → formulario editable
- [ ] Cambiar el nombre completo → guardar → nombre actualizado en sidebar y perfil
- [ ] Cambiar timezone → guardar → valor guardado correctamente
- [ ] Cambiar currency a "EUR" → guardar → valor actualizado
- [ ] Intentar currency con 4 caracteres → campo trunca a 3 caracteres

---

## 9. Trading Plan

- [ ] Ir a `/dashboard/trading-plan`
- [ ] Agregar/editar el plan → guardado correctamente
- [ ] Recargar la página → el plan persiste

---

## 10. Tema y lenguaje

### Tema (Dark/Light Mode)
- [ ] Toggle de tema en el sidebar → cambia entre dark y light mode con transición suave
- [ ] Recargar la página → el tema persiste (localStorage `zentrade-theme`)
- [ ] En light mode: todo el contenido es legible (sin texto blanco sobre blanco)
- [ ] En light mode: los inputs, selects, y botones tienen estilos correctos
- [ ] La landing page (`/`) siempre se muestra en dark (no afectada por el toggle)

### Idioma (ES/EN)
- [ ] Toggle de idioma en el sidebar → textos del menú y páginas cambian al idioma seleccionado
- [ ] Recargar la página → el idioma persiste (localStorage `zentrade-locale`)
- [ ] Navegar entre páginas → idioma consistente en todas las secciones

---

## 11. Responsive / UX general

- [ ] Sidebar colapsado: solo muestra íconos, sin texto
- [ ] Sidebar expandido: muestra íconos + texto de navegación
- [ ] Toggle collapse → transición suave sin saltos de layout
- [ ] No hay errores en la consola del navegador durante el flujo normal
- [ ] No hay errores de red (404, 500) en el panel de Network para rutas válidas

---

## 12. Export CSV

- [ ] En la tabla de trades, hacer clic en "Exportar CSV"
- [ ] El archivo descargado contiene las columnas esperadas: fecha, instrumento, lado, contratos, resultado, etc.
- [ ] Los datos del CSV coinciden con los que se ven en la tabla (incluidos los filtros activos)
- [ ] El CSV se puede abrir en Excel/Google Sheets sin errores de formato

---

## Notas de regresión

Después de cada cambio significativo, re-verificar:

1. Login / logout
2. Crear trade + verificar dashboard KPIs
3. Toggle tema + toggle idioma
4. Filtros de trades
