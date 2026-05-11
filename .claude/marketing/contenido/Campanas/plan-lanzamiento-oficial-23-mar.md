---
tipo: campana
plataforma: Todos
estado: listo
aprobado: true
periodo: 22-23 marzo 2026
angulo: Lanzamiento oficial — conversión primeros 50 usuarios
---

# Plan de Lanzamiento Oficial — ZenTrade
## Fecha: 22-23 de marzo de 2026

---

## Oferta de early adopter

- Los primeros 50 usuarios que se registren = 30 días del plan Professional gratis
- Sin tarjeta de crédito
- Cuando se acaben los cupos, se acaban
- Mencionar en TODOS los posts del día de lanzamiento

---

## Checklist técnico (completar antes de publicar)

- [x] Verificar que el checkout funciona end-to-end en producción
- [x] Confirmar que el webhook procesa correctamente y actualiza el plan en Supabase
- [x] Verificar que el cron de reporte semanal está activo en Vercel
- [x] Confirmar RLS en Supabase activo en todas las tablas críticas
- [x] Activar el sistema de afiliados en producción y probar un link de referido
- [x] Confirmar URL final: zen-trader.com — SSL activo via Vercel
- [ ] Probar flujo completo: registro → crear cuenta → registrar trade → ver dashboard → upgrade a Starter
- [ ] Confirmar que la landing page carga correctamente en móvil (Google PageSpeed > 75)

---

## Orden de publicación del día de lanzamiento

**Regla de oro: NO publicar nada si el checkout no funciona en producción.**
Si el checkout falla = soft launch silencioso mientras se resuelve.

**1. Primero (09:00-10:00 AM ET):** Thread de X/Twitter — mayor velocidad de difusión para audiencia trader. Es la pieza ancla del día.

**2. Segundo (10:00 AM-12:00 PM):** Email a lista de newsletter — los suscriptores ya tienen intención, son los más propensos a convertir el día 1.

**3. Tercero (12:00 PM-6:00 PM):** LinkedIn (post historia técnica) + outreach a influencers. Activa un canal de credibilidad diferente.

**4. Cuarto (6:00 PM Colombia):** TikTok y Reel de Instagram. El algoritmo favorece tarde para audiencia LATAM.

**5. También el día del lanzamiento:** Compartir en grupos de Discord y Telegram de trading en español.

---

## X/Twitter — Thread de lanzamiento (7 tweets — 9:00 AM ET)

**Tweet 1 (hook):**
Llevo meses construyendo algo para resolver el problema que me costó 3 evaluaciones de FTMO.

Hoy lo lanzo.

Hilo:

**Tweet 2:**
El problema no era mi estrategia.

El problema era que el 20% de mis trades — los que tomaba fuera de mi plan, con rabia, con prisa, con miedo — arruinaban lo que el 80% construía.

Revenge trading. Todos lo hacemos. Casi nadie lo mide.

**Tweet 3:**
Las empresas de fondeo miden 3 cosas que la mayoría de traders ignoran:

- Consistency rule (ningún día puede ser > X% de la ganancia total)
- Max daily loss (no solo el monto — el patrón del horario)
- Drawdown trailing (no es lo mismo que el drawdown de cuenta)

¿Cuántos fallan por no saberlo?

Más del 85%.

**Tweet 4:**
Construí Zentrade para que eso deje de pasarte.

- Journal de trading con IA
- Detecta revenge trading automáticamente
- Mide tu consistency rule en tiempo real
- Reporte semanal con análisis de IA por cuenta
- Radar de mercado cada domingo (Gemini 2.5 Flash)

Todo en español. Para LATAM.

**Tweet 5:**
El stack si te interesa el lado técnico:

- Next.js App Router + TypeScript
- Supabase (Auth + Postgres + RLS estricta)
- Gemini 2.5 Flash para análisis de IA
- Resend para email automation
- Vercel Cron para reportes automáticos
- Wompi para pagos en Colombia y LATAM

Un solo dev. Construido desde cero en semanas.

**Tweet 6:**
Oferta de early adopter: los primeros 50 usuarios obtienen 30 días del plan Professional gratis.

Sin tarjeta. Solo registro.

Si estás en proceso de evaluación de FTMO, Apex, TopStep, Tradoverse o Uprofit — esto es para ti.

[LINK]

**Tweet 7 (engagement):**
Una pregunta para los que han fallado evaluaciones:

¿Cuál fue la verdadera razón? ¿Estrategia, disciplina o algo más?

Respondo todos los comentarios.

**Hashtags para el thread:**
#propfirm #FTMO #TopStep #ApexTrader #futurestrading #fundedtrader #tradingjournal #buildinpublic #zentrade #tradingpsychology

---

## X/Twitter — Post 2: Pain point consistency rule (día 2 post-lanzamiento)

Pasaste el profit target.

Cumpliste el drawdown.

Y aun así te rechazaron.

¿Sabes por qué?

La consistency rule.

Si un solo día representa más del 30% de tu ganancia total, muchas empresas de fondeo te desaprueban automáticamente.

La mayoría de traders ni sabe que esta regla existe hasta que les pasa.

Zentrade la mide en tiempo real mientras tradeas.

[LINK]

**Hashtags:** #propfirm #FTMO #Uprofit #Tradovate #fundedtrader #futurestrading #tradingjournal #zentrade

---

## X/Twitter — Post 3: Feature showcase (día 3 post-lanzamiento)

Lo que Zentrade detecta que tú no ves en tiempo real:

- Tomaste un trade 18 minutos después de tu mayor pérdida del día
- Ese trade fue 2.4x tu tamaño promedio
- Fue tu cuarta pérdida consecutiva

Revenge trading. Detectado. Registrado. Analizado.

El reporte del lunes te lo muestra antes de abrir el mercado.

Así es como se rompe el ciclo.

[LINK]

**Hashtags:** #tradingpsychology #tradingmindset #propfirm #futurestrading #zentrade #fundedtrader #tradingjournal

---

## Instagram — Carrusel de lanzamiento (6 slides)

**Slide 1 — Solo tipografía (fondo oscuro):**
EL JOURNAL DE TRADING
QUE DETECTA LO QUE
TÚ NO QUIERES VER.

Zentrade — Ya está live.

**Slide 2 — Pain point visual:**
El 85% de los traders falla
evaluaciones de fondeo.

No por la estrategia.
Por los trades que tomaron
sabiendo que no debían.

Imagen de fondo: equity curve con un solo spike rojo hacia abajo al final.

**Slide 3 — La solución:**
Zentrade registra cada trade,
detecta tus patrones emocionales,
y te muestra exactamente dónde
estás saboteando tu evaluación.

Imagen: screenshot del dashboard con el banner de revenge trading alert.

**Slide 4 — Features principales:**
Lo que incluye:

/ Detección de revenge trading (IA)
/ Consistency rule en tiempo real
/ Reporte semanal con análisis IA
/ Radar de mercado cada domingo
/ Calendar de emociones y tags
/ Dashboard con equity curve

Diseño: lista con iconos simples sobre fondo oscuro.

**Slide 5 — Social proof / historia del fundador:**
Construido por un trader
que falló 3 evaluaciones
antes de entender el patrón.

Ahora lo mide.
Ahora lo controla.

**Slide 6 — CTA:**
30 días Professional gratis
para los primeros 50 usuarios.

Sin tarjeta. Solo registro.

zen-trader.com

Fondo con gradiente oscuro + logo Zentrade.

**Caption:**
Ya está live. Zentrade es el journal de trading con IA que detecta revenge trading, mide tu consistency rule en tiempo real y te manda un reporte de IA cada lunes antes de abrir el mercado.

Construido en Colombia, en español, para traders de LATAM que van en serio con las empresas de fondeo.

Los primeros 50 usuarios: 30 días Professional gratis. Sin tarjeta.

Link en bio.

**Hashtags:**
#propfirm #FTMO #TopStep #ApexTrader #Uprofit #futurestrading #fundedtrader #tradingjournal #tradingpsychology #tradingmindset #zentrade #journaldetrading #empresasdefondeo #tradinglatam

---

## Instagram — Post 2: Pain point consistency rule (imagen de impacto — día 2)

**Imagen sugerida:**
Fondo negro. Texto en blanco grande centrado. Sin elementos extra.

"Pasé el profit target.

Cumplí el drawdown.

Me rechazaron igual."

— Esto le pasa al 40% de traders
que pasa la Fase 1.

La razón: la consistency rule.

Debajo del texto, en pequeño: "Zentrade la mide en tiempo real. zen-trader.com"

**Caption:**
Si llegaste a la Fase 2 de tu evaluación y aun así te rechazaron, probablemente no fue lo que hiciste mal. Fue cómo distribuiste tus ganancias.

La consistency rule dice que ningún día puede representar más del 30% (o 25%, según la empresa) de tu ganancia total. Un día excelente puede hacerte reprobar.

Zentrade calcula esto automáticamente mientras tradeas. Sin matemáticas manuales. Sin sorpresas al final de la evaluación.

Link en bio — primeros 50 usuarios con 30 días Professional gratis.

**Hashtags:**
#propfirm #FTMO #Tradovate #TopStep #ApexTrader #fundedtrader #futurestrading #consistencyrule #zentrade #tradingjournal #tradinglatam

---

## LinkedIn — Post historia técnica del fundador (tarde del día de lanzamiento)

Hoy lancé Zentrade. Y si alguna vez has construido algo solo, de cero, sabes lo que se siente este momento.

**El problema que resuelve**

El 85% de los traders falla las evaluaciones de empresas de fondeo. No por estrategia. Por el 20% de sus trades: los que toman con rabia, con prisa, con miedo, fuera del plan. Revenge trading. Un loop de comportamiento que casi nadie mide y casi todos repiten.

Fallé tres evaluaciones de FTMO antes de entenderlo.

Decidí construir la herramienta que hubiera necesitado.

**Lo que construí**

Stack técnico completo:
- Next.js App Router + TypeScript — sin compromisos con el type system, cero `any`
- Supabase (Auth + Postgres + Row Level Security) — RLS estricta en cada tabla
- Gemini 2.5 Flash — análisis semanal de trades + Radar de Mercado semanal
- Vercel Cron Jobs — reportes automáticos cada lunes 10 AM UTC
- Resend — email automation completa con templates en React
- Wompi — pasarela de pago para Colombia y LATAM (LemonSqueezy, Mercado Pago, FastSpring y PayPal no funcionaron para Colombia — Wompi sí)
- Sistema de afiliados — tracking de conversiones, tiers de comisión, dashboard

Todo esto lo construí solo.

**Por qué LATAM**

TradeZella no tiene UI en español. Edgewonk es desktop y sin IA. Tradervue es complejo para nuevos traders. Ninguno está optimizado para las reglas específicas de las empresas de fondeo.

Hay millones de traders de futuros en Colombia, México, Argentina, Chile y Perú pasando evaluaciones con herramientas en inglés que no entienden del todo. Zentrade es para ellos.

Plan gratis disponible. Los primeros 50 usuarios obtienen 30 días del plan Professional sin tarjeta de crédito.

Si conoces traders de futuros en LATAM — comparte. Cada compartir hoy tiene más peso que cien el mes que viene.

Y si construyes SaaS solo, me interesa tu historia. Respondo todos los comentarios.

[LINK]

#buildinpublic #saas #indiedev #nextjs #supabase #ai #gemini #futurestrading #propfirm #latam #Colombia #tradingjournal #zentrade

---

## Comunidades objetivo para outreach manual

**Discord (en español):**
- Servidor de FTMO en español
- Servidor de Apex Trader Funding en español
- Servidor de TopStep en español
- Comunidades de trading de futuros LATAM

**Telegram (grupos activos):**
- Grupos de trading de futuros Colombia
- Grupos de trading México
- Grupos de trading Argentina

**Reddit:**
- r/Forex — post en inglés mostrando dashboard con datos reales
- r/FuturesTrading — mismo approach
- r/TradingView — mostrar, no vender

**Mensaje auténtico para comunidades:**
"Soy el dev de Zentrade, un journal de trading con IA que acabo de lanzar hoy. Está hecho para traders de LATAM que buscan pasar evaluaciones de fondeo — profit factor, consistency rule, revenge trading detection, reporte semanal IA. En español. Gratis para empezar. Los primeros 50 tienen 30 días Pro gratis. ¿Lo prueban?"

---

## Quick wins para primeros clientes en 24-48h

1. **Oferta early adopter activa** — mencionar en todos los posts
2. **DMs directos** a 10-20 traders conocidos — oferta de acceso Pro gratis esta semana sin pedir nada a cambio
3. **Activar afiliados** — los 3-5 afiliados deben publicar su primer contenido el mismo día del lanzamiento
4. **Grupos Discord/Telegram** — mensaje auténtico, no spam
5. **Reddit** — mostrar el dashboard con datos reales, CTA al final
