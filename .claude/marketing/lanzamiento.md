# Zentrade — Plan de Lanzamiento Oficial

**Fecha de lanzamiento: 22 de marzo de 2026**

---

## SECCIÓN 1 — ESTRATEGIA DE LANZAMIENTO

### Checklist de lanzamiento para hoy

#### Bloque técnico (completar antes de publicar el primer post)

- [x] ~~Verificar que el checkout de Wompi funciona end-to-end en producción~~ ✅ 2026-03-22
- [x] ~~Confirmar que el webhook de Wompi procesa correctamente y actualiza el plan en Supabase~~ ✅ Auditado 2026-03-22
- [ ] Confirmar que los emails de Resend llegan a bandeja de entrada (no spam) — DNS DKIM/SPF/DMARC pendientes
- [x] ~~Verificar que el cron de reporte semanal está activo en Vercel (`/api/cron/weekly-report`)~~ ✅
- [x] ~~Verificar que el cron de Radar de Mercado está activo (`/api/cron/market-preview`)~~ ✅
- [x] ~~Confirmar que RLS en Supabase está activo en todas las tablas críticas~~ ✅ Auditado 2026-03-22
- [ ] Probar flujo completo en producción: registro → crear cuenta → registrar trade → ver dashboard → upgrade a Starter
- [ ] Confirmar que la landing page carga correctamente en móvil (Google PageSpeed > 75)
- [x] ~~Activar el sistema de afiliados en producción y probar un link de referido~~ ✅ Sistema implementado y deployado
- [x] ~~Confirmar URL final del producto~~ ✅ zen-trader.com — SSL activo via Vercel

> **DEPLOY REALIZADO: 2026-03-22** — código en producción (`git push main`). Vercel despliega automáticamente.

#### Bloque marketing (ejecutar en este orden) — HOY 2026-03-22

- [ ] Publicar post de lanzamiento en X/Twitter (9:00 AM ET — ver copy en Sección 2)
- [ ] Publicar Stories de cuenta regresiva en Instagram → luego el post de lanzamiento principal
- [ ] Enviar email a lista de newsletter (usuarios que se suscribieron durante la campaña de expectativa)
- [ ] Publicar reel de tour del dashboard en Instagram
- [ ] Publicar video de lanzamiento en TikTok (tarde, 6 PM Colombia)
- [ ] Publicar post de LinkedIn con historia técnica del build (ver Sección 4)
- [ ] Activar los primeros 3-5 afiliados (notificarles que el producto está live y sus links activos)
- [ ] Compartir el lanzamiento en comunidades de trading en Discord y Telegram (ver Sección 6)

> **Nota semana del lanzamiento:** Sin features nuevas. Solo publicidad, feedback y escuchar usuarios.

---

### Orden de prioridad para las próximas 4 horas

**1. Primero (antes de publicar nada):** Ejecutar el flujo completo de compra en producción. Si el checkout falla, no hay lanzamiento — hay un soft launch silencioso mientras se resuelve. No publicar con el checkout roto.

**2. Segundo (09:00-10:00 AM ET):** Publicar el thread de X. Este es el canal de mayor velocidad de difusión para audiencia trader. El thread es la pieza ancla del día.

**3. Tercero (10:00 AM-12:00 PM):** Enviar el email a la lista de newsletter con el link directo al registro free y la oferta de early adopter. Los suscriptores del newsletter ya tienen intención — son los más propensos a convertir hoy.

**4. Cuarto (12:00 PM-6:00 PM):** LinkedIn y outreach a influencers (emails en Sección 3). Esto activa un canal de credibilidad diferente y siembra el canal de afiliados.

**5. Quinto (6:00 PM Colombia):** TikTok y Reel de Instagram. El algoritmo favorece el horario de tarde para audiencia LATAM.

---

### Quick wins para primeros clientes en 24-48h

**Quick win 1 — Oferta de early adopter (activar hoy)**
Los primeros 50 usuarios que se registren obtienen 30 días del plan Professional gratis, sin tarjeta de crédito. Esto elimina la fricción de compra y construye una base de usuarios activos que luego convierten a planes pagos. Mencionar en todos los posts del día de lanzamiento.

**Quick win 2 — DMs directos a traders conocidos**
Identifica entre 10 y 20 traders de futuros en LATAM que ya sigues en X o Instagram. Envíales un DM breve y directo (no el email de influencers — algo más corto): "Construí una herramienta para pasar pruebas de fondeo. Acabo de lanzarla. ¿Le darías un vistazo? Te doy acceso Pro gratis esta semana." No pedir nada a cambio. Solo visibilidad.

**Quick win 3 — Publicar en grupos de Discord y Telegram de trading en español**
Canales objetivo: servidores de Discord de Apex, TopStep y FTMO en español; grupos de Telegram de trading de futuros LATAM. Mensaje auténtico, no spam: contar que eres el dev, que acaban de lanzar, y ofrecer acceso gratis a los primeros que lo prueben.

**Quick win 4 — Publicar en r/Forex, r/FuturesTrading y r/TradingView**
Post en inglés mostrando el dashboard con datos reales. No vender — mostrar. Los traders responden bien a screenshots de datos reales. CTA al final: "Free to try, link in bio."

**Quick win 5 — Activar afiliados inmediatamente**
Los 3-5 afiliados onboardeados antes del lanzamiento ya tienen sus links. El día del lanzamiento es cuando más momentum hay — es el día en que deben publicar su primer contenido con el link.

---

## SECCIÓN 2 — COPY PARA REDES SOCIALES

### X/Twitter — Post 1 (Thread de lanzamiento — publicar a las 9:00 AM ET)

---

**Tweet 1 (hook):**
Llevo meses construyendo algo para resolver el problema que me costó 3 evaluaciones de FTMO.

Hoy lo lanzo.

Hilo:

---

**Tweet 2:**
El problema no era mi estrategia.

El problema era que el 20% de mis trades — los que tomaba fuera de mi plan, con rabia, con prisa, con miedo — arruinaban lo que el 80% construía.

Revenge trading. Todos lo hacemos. Casi nadie lo mide.

---

**Tweet 3:**
Las empresas de fondeo miden 3 cosas que la mayoría de traders ignoran:

- Consistency rule (ningún día puede ser > X% de la ganancia total)
- Max daily loss (no solo el monto — el patrón del horario)
- Drawdown trailing (no es lo mismo que el drawdown de cuenta)

¿Cuántos fallan por no saberlo?

Más del 85%.

---

**Tweet 4:**
Construí Zentrade para que eso deje de pasarte.

- Journal de trading con IA
- Detecta revenge trading automáticamente
- Mide tu consistency rule en tiempo real
- Reporte semanal con análisis de IA por cuenta
- Radar de mercado cada domingo (Gemini 2.5 Flash)

Todo en español. Para LATAM.

---

**Tweet 5:**
El stack si te interesa el lado técnico:

- Next.js App Router + TypeScript
- Supabase (Auth + Postgres + RLS estricta)
- Gemini 2.5 Flash para análisis de IA
- Resend para email automation
- Vercel Cron para reportes automáticos
- Wompi para pagos en Colombia y LATAM

Un solo dev. Construido desde cero en semanas.

---

**Tweet 6:**
Oferta de early adopter: los primeros 50 usuarios obtienen 30 días del plan Professional gratis.

Sin tarjeta. Solo registro.

Si estás en proceso de evaluación de FTMO, Apex, TopStep, Tradoverse o Uprofit — esto es para ti.

[LINK]

---

**Tweet 7 (engagement):**
Una pregunta para los que han fallado evaluaciones:

¿Cuál fue la verdadera razón? ¿Estrategia, disciplina o algo más?

Respondo todos los comentarios.

---

**Hashtags para este thread:**
#propfirm #FTMO #TopStep #ApexTrader #futurestrading #fundedtrader #tradingjournal #buildinpublic #zentrade #tradingpsychology

---

**Por qué este enfoque:** El thread de lanzamiento mezcla historia personal (credibilidad), educación (dato del 85%), producto (features), y stack técnico (atrae devs y traders técnicos simultáneamente). Termina con pregunta de engagement para alimentar el algoritmo de X el día que más importa.

---

### X/Twitter — Post 2 (Pain point — publicar al mediodía o día siguiente)

---

Pasaste el profit target.

Cumpliste el drawdown.

Y aun así te rechazaron.

¿Sabes por qué?

La consistency rule.

Si un solo día representa más del 30% de tu ganancia total, muchas empresas de fondeo te desaprueban automáticamente.

La mayoría de traders ni sabe que esta regla existe hasta que les pasa.

Zentrade la mide en tiempo real mientras tradeas.

[LINK]

---

**Hashtags:**
#propfirm #FTMO #Uprofit #Tradovate #fundedtrader #futurestrading #tradingjournal #zentrade

---

### X/Twitter — Post 3 (Feature showcase — para el día 2 o 3)

---

Lo que Zentrade detecta que tú no ves en tiempo real:

- Tomaste un trade 18 minutos después de tu mayor pérdida del día
- Ese trade fue 2.4x tu tamaño promedio
- Fue tu cuarta pérdida consecutiva

Revenge trading. Detectado. Registrado. Analizado.

El reporte del lunes te lo muestra antes de abrir el mercado.

Así es como se rompe el ciclo.

[LINK]

---

**Hashtags:**
#tradingpsychology #tradingmindset #propfirm #futurestrading #zentrade #fundedtrader #tradingjournal

---

### Instagram — Post 1: Carrusel (lanzamiento)

**Slide 1 — Solo tipografía, fondo oscuro:**
```
EL JOURNAL DE TRADING
QUE DETECTA LO QUE
TÚ NO QUIERES VER.

Zentrade — Ya está live.
```

**Slide 2 — Pain point visual:**
```
El 85% de los traders falla
evaluaciones de fondeo.

No por la estrategia.
Por los trades que tomaron
sabiendo que no debían.
```
Imagen de fondo: equity curve con un solo spike rojo hacia abajo al final.

**Slide 3 — La solución:**
```
Zentrade registra cada trade,
detecta tus patrones emocionales,
y te muestra exactamente dónde
estás saboteando tu evaluación.
```
Imagen: screenshot del dashboard con el banner de revenge trading alert.

**Slide 4 — Features principales:**
```
Lo que incluye:

/ Detección de revenge trading (IA)
/ Consistency rule en tiempo real
/ Reporte semanal con análisis IA
/ Radar de mercado cada domingo
/ Calendar de emociones y tags
/ Dashboard con equity curve
```
Diseño: lista con iconos simples sobre fondo oscuro.

**Slide 5 — Social proof / autoridad:**
```
Construido por un trader
que falló 3 evaluaciones
antes de entender el patrón.

Ahora lo mide.
Ahora lo controla.
```

**Slide 6 — CTA:**
```
30 días Professional gratis
para los primeros 50 usuarios.

Sin tarjeta. Solo registro.

zen-trader.com
```
Fondo con gradiente oscuro + logo Zentrade.

**Caption:**
Ya está live. Zentrade es el journal de trading con IA que detecta revenge trading, mide tu consistency rule en tiempo real y te manda un reporte de IA cada lunes antes de abrir el mercado.

Construido en Colombia, en español, para traders de LATAM que van en serio con las empresas de fondeo.

Los primeros 50 usuarios: 30 días Professional gratis. Sin tarjeta.

Link en bio.

**Hashtags:**
#propfirm #FTMO #TopStep #ApexTrader #Uprofit #futurestrading #fundedtrader #tradingjournal #tradingpsychology #tradingmindset #zentrade #journaldetrading #empresasdefondeo #tradinglatam

---

**Por qué este enfoque:** El carrusel sigue la estructura problema→solución→features→CTA. El slide 1 sin imágenes fuerza al usuario a deslizar para entender. El slide 5 con historia del fundador humaniza el producto antes del CTA de compra.

---

### Instagram — Post 2: Pain point (imagen de impacto — publicar día 2)

**Imagen sugerida:**
Fondo negro. Texto en blanco grande centrado. Sin elementos extra.

```
"Pasé el profit target.

Cumplí el drawdown.

Me rechazaron igual."

— Esto le pasa al 40% de traders
que pasa la Fase 1.

La razón: la consistency rule.
```

Debajo del texto, en pequeño: "Zentrade la mide en tiempo real. zen-trader.com"

**Caption:**
Si llegaste a la Fase 2 de tu evaluación y aun así te rechazaron, probablemente no fue lo que hiciste mal. Fue cómo distribuiste tus ganancias.

La consistency rule dice que ningún día puede representar más del 30% (o 25%, según la empresa) de tu ganancia total. Un día excelente puede hacerte reprobar.

Zentrade calcula esto automáticamente mientras tradeas. Sin matemáticas manuales. Sin sorpresas al final de la evaluación.

Link en bio — primeros 50 usuarios con 30 días Professional gratis.

**Hashtags:**
#propfirm #FTMO #Tradovate #TopStep #ApexTrader #fundedtrader #futurestrading #consistencyrule #zentrade #tradingjournal #tradinglatam

---

### Instagram — Post 3: Feature showcase (Reels/video — publicar día 3)

**Descripción del reel:**
Screen recording del dashboard de Zentrade mostrando, en 45-60 segundos:
- Vista del calendario con tags emocionales
- El banner de revenge trading alert activándose
- La sección de consistency rule con porcentaje en tiempo real
- El equity curve
- La pantalla del reporte semanal con análisis de IA

Texto superpuesto en cada pantalla:
- Calendario: "Registra cada trade con contexto emocional"
- Revenge alert: "La IA detecta cuando estás operando con rabia"
- Consistency: "Ve si tu evaluación está en riesgo antes de que sea tarde"
- Equity curve: "Visualiza tu progreso real"
- Reporte: "Cada lunes: un análisis completo de tu semana"

Música: instrumental lo-fi o dark ambient (sin letra, para evitar problemas de copyright).

**Caption:**
Tour completo del dashboard de Zentrade en 60 segundos.

Todo lo que ves aquí lo construí para resolver los mismos problemas que me hicieron fallar evaluaciones. Cada feature tiene una razón de existir.

30 días gratis para los primeros 50 — link en bio.

**Hashtags:**
#propfirm #futurestrading #tradingjournal #zentrade #fundedtrader #FTMO #TopStep #tradinglatam #tradingpsychology #journaldetrading

---

### TikTok/Reels — Script de lanzamiento (voiceover style, 45-60 seg)

**[0:00-0:05] HOOK**
*Texto superpuesto: "Fallé 3 evaluaciones de FTMO. Hoy lancé lo que hubiera necesitado."*
Voz: "Fallé tres evaluaciones de FTMO. No por la estrategia. Por esto."

**[0:05-0:15] PROBLEMA**
*Texto superpuesto: "Revenge trading — el 85% de traders no sabe que lo hace"*
Voz: "Cada vez que perdía un trade grande, tomaba otro inmediatamente para recuperar. No lo veía en el momento. Solo lo veía en el PnL al final del día."

**[0:15-0:30] PRODUCTO**
*Mostrar el dashboard — screen recording*
Voz: "Zentrade detecta eso automáticamente. Te muestra el patrón. Te da un reporte cada lunes con análisis de IA antes de abrir el mercado."
*Texto superpuesto mientras se muestra el dashboard: "IA detecta tus patterns emocionales"*

**[0:30-0:45] AUTORIDAD + FEATURES**
*Mostrar la sección de consistency rule*
Voz: "También mide tu consistency rule en tiempo real. Esa regla que te puede hacer reprobar aunque hayas cumplido el profit target."
*Texto superpuesto: "Consistency rule en tiempo real"*

**[0:45-0:55] CTA**
*Logo Zentrade en pantalla completa*
Voz: "Los primeros 50 usuarios: 30 días del plan Professional gratis. Sin tarjeta. Link en bio."
*Texto superpuesto grande: "Primeros 50 usuarios: 30 días PRO GRATIS"*

**Hashtags TikTok:**
#propfirm #FTMO #TopStep #futurestrading #fundedtrader #tradingjournal #zentrade #tradinglatam #tradingpsychology #buildinpublic

---

**Por qué este enfoque:** TikTok premia la retención en los primeros 3 segundos. El hook de "fallé 3 veces" activa la curiosidad y la identificación emocional simultáneamente. El texto superpuesto es obligatorio porque el 60-70% de TikToks se consume sin audio.

---

## SECCIÓN 3 — EMAIL PARA INFLUENCERS / CREADORES DE CONTENIDO

### Versión A — Para YouTubers/TikTokers de trading en LATAM

**Asunto:** Zentrade — construí algo que creo que tu audiencia necesita

**Preview text:** Te cuento en 2 minutos. Sin rodeos.

---

Hola [Nombre],

Soy Axel. Desarrollador full-stack de Colombia. Llevo meses construyendo Zentrade, un journal de trading con IA para traders de futuros que están pasando pruebas de fondeo.

Hoy lo lancé oficialmente.

Te escribo porque tu contenido sobre [empresa de fondeo / trading de futuros / psicología de trading] es de los más honestos que he visto. Tu audiencia son exactamente los traders para los que construí esto.

Lo que hace Zentrade que nadie más hace:
- Detección de revenge trading con IA (avisa cuando estás operando fuera de plan)
- Mide la consistency rule en tiempo real (esa regla que te reprueba aunque hayas pasado el profit target)
- Reporte semanal automatizado con análisis de Gemini 2.5 Flash por cuenta
- Radar de mercado cada domingo — eventos de alto impacto para la semana

Todo en español. Construido específicamente para LATAM.

No te pido que lo recomiendes. Te pido 20 minutos para mostrártelo. Si crees que le sirve a tu audiencia, hablamos de una colaboración con términos justos para ti.

Si no es lo tuyo, ningún problema. Igual te dejo acceso Pro gratis por un mes para que lo explores.

¿Tienes 20 minutos esta semana?

Axel Moncada
Fundador, Zentrade
[LINK DE CALENDLY O EMAIL DE RESPUESTA]
zen-trader.com

---

**Asunto alternativo (variante B):** "¿Cuántos de tus seguidores han fallado evaluaciones de fondeo por el mismo motivo?"

---

**Por qué este enfoque:** El email es corto, directo, y ofrece valor antes de pedir algo. El acceso Pro gratis sin compromiso elimina la fricción del "no sé si vale la pena mi tiempo." La pregunta de cierre es específica (20 minutos, esta semana) — no genérica. Los influencers reciben muchos pitches vagos; este tiene respuesta clara posible.

---

### Versión B — Para coaches de prop firms / traders con comunidad pequeña (1K-20K seguidores)

**Asunto:** Te traigo algo que tu comunidad puede usar desde hoy

**Preview text:** Con acceso gratis y comisiones recurrentes si quieres.

---

Hola [Nombre],

Soy Axel, desarrollador de Colombia. Hoy lancé Zentrade — un journal de trading con IA para traders de futuros que están pasando evaluaciones de fondeo.

Construí algo específico:
- Detecta revenge trading automáticamente
- Mide la consistency rule en tiempo real
- Manda un reporte de IA cada lunes con análisis por cuenta

Todo en español. Gratis para empezar.

Tengo un programa de afiliados activo desde hoy: 30% de comisión recurrente durante 12 meses por cada usuario que se suscriba con tu link. El usuario además recibe 20% de descuento.

No hay mínimos. No hay exclusividad. Es simplemente: si lo usas y te gusta, compártelo.

¿Quieres explorar Zentrade con acceso Pro gratis esta semana?

Axel
zen-trader.com

---

**Por qué este enfoque:** Para creadores más pequeños, la comisión recurrente es el diferencial — convierte su audiencia en un activo pasivo. El tono es más directo porque el objetivo es conversión inmediata al programa de afiliados, no una llamada exploratoria.

---

## SECCIÓN 4 — POST DE LINKEDIN (historia personal del fundador)

### Formato: post largo, storytelling, tono auténtico

---

Hoy lancé Zentrade. Y si alguna vez has construido algo solo, de cero, sabes lo que se siente este momento.

Permíteme contarte qué hay debajo del capó.

**El problema que resuelve**

El 85% de los traders falla las evaluaciones de empresas de fondeo. No por estrategia. Por el 20% de sus trades: los que toman con rabia, con prisa, con miedo, fuera del plan. Revenge trading. Un loop de comportamiento que casi nadie mide y casi todos repiten.

Fallé tres evaluaciones de FTMO antes de entenderlo.

Decidí construir la herramienta que hubiera necesitado.

**Lo que construí**

Zentrade es un journal de trading con IA para traders de futuros en LATAM y USA. En papel, suena simple. La arquitectura detrás no lo es.

Stack técnico completo:

- **Next.js App Router + TypeScript** — sin compromisos con el type system, cero `any`, API Routes para toda la lógica de negocio
- **Supabase** (Auth + Postgres + Row Level Security) — cada usuario solo ve sus propios datos, RLS estricta en cada tabla
- **Gemini 2.5 Flash** — dos implementaciones de IA: análisis semanal de trades por cuenta (detecta patrones, fortalezas, debilidades emocionales), y Radar de Mercado (eventos de alto impacto para la semana siguiente, personalizado por instrumentos de futuros del usuario)
- **Vercel Cron Jobs** — los reportes se envían automáticamente cada lunes a las 10 AM UTC. El Radar de Mercado sale cada domingo a las 7 PM UTC. Sin intervención humana.
- **Resend** — email automation completa: activación de cuenta, reportes semanales, newsletter. Templates en React con dark mode nativo.
- **Wompi** — pasarela de pago para Colombia y LATAM. Checkout, webhooks de suscripción, manejo de estados de pago. LemonSqueezy, Mercado Pago, FastSpring, y PayPal no funcionaron para Colombia. Wompi sí.
- **Algoritmo de Revenge Trading Detection** — función pura que analiza la secuencia de trades: si el siguiente entry ocurre menos de 30 minutos después de una pérdida, o si hay 3+ pérdidas consecutivas con tamaño creciente, el sistema lo detecta, lo registra, y lo incluye en el reporte.
- **Sistema de afiliados** — tracking de conversiones con links únicos, tiers de comisión, dashboard para afiliados.

Todo esto lo construí solo.

**Lo que aprendí**

Construir un SaaS B2C como solo founder es un ejercicio brutal de priorización. Cada feature compite contra el tiempo de go-to-market. Cada bug que resuelves a las 2 AM es una decisión entre hacerlo bien y hacerlo rápido.

Lo que no se negocia: la seguridad de los datos del usuario y la confiabilidad de las automatizaciones. El reporte de IA del lunes tiene que llegar. El radar del domingo tiene que salir. Si eso falla, el producto no sirve.

Lo que aprendí a dejar para después: las optimizaciones prematuras, las features "cool", el perfeccionismo en el UI. Lo que el usuario necesita primero es que funcione.

**El stack de IA en detalle**

Uso Gemini 2.5 Flash (no GPT-4, no Claude en este caso) porque la ventana de contexto larga es crítica para analizar semanas completas de trades. El prompt incluye: datos del trade, emociones registradas por el usuario, horario de operación, y el trading plan personalizado de la cuenta. La respuesta viene en HTML básico que el email renderiza directamente.

Para el Radar de Mercado, la arquitectura fue diferente: una sola llamada a Gemini por semana con todos los instrumentos de usuarios ZenMode combinados, sin hacer N llamadas. Un email por usuario, personalizado por nombre e instrumentos.

**Por qué LATAM**

TradeZella (el líder del mercado) no tiene UI en español. Edgewonk es desktop y sin IA. Tradervue es complejo para traders nuevos. Ninguno está optimizado para las reglas específicas de las empresas de fondeo.

Hay millones de traders de futuros en Colombia, México, Argentina, Chile, y Perú que están pasando evaluaciones con herramientas en inglés que no entienden del todo. Zentrade es para ellos.

**El lanzamiento de hoy**

Plan gratis disponible. Los primeros 50 usuarios obtienen 30 días del plan Professional sin tarjeta de crédito.

Si conoces traders de futuros en LATAM — comparte. Cada compartir hoy tiene más peso que cien el mes que viene.

Y si construyes SaaS solo, me interesa tu historia. Respondo todos los comentarios.

[LINK]

#buildinpublic #saas #indiedev #nextjs #supabase #ai #gemini #futurestrading #propfirm #latam #Colombia #tradingjournal #zentrade

---

**Por qué este enfoque:** LinkedIn premia los posts largos con storytelling auténtico. El desglose técnico detallado posiciona a Axel como un developer full-stack completo, no solo un frontend o un "vibe coder." Mencionar los failures (pasarelas que no funcionaron, las evaluaciones falladas) construye credibilidad más que una narrativa perfecta. El CTA final es de comunidad, no de venta directa — LinkedIn convierte mejor así.

---

## SECCIÓN 5 — PLAN DE CONTENIDO SEMANA 1

### Día 1 — Domingo 22 de marzo (HOY — Lanzamiento)

| Red | Contenido | Horario |
|-----|-----------|---------|
| X/Twitter | Thread de lanzamiento (ver Sección 2, Post 1) | 9:00 AM ET |
| Instagram | Carrusel de lanzamiento (ver Sección 2, Post 1) | 12:00 PM Colombia |
| LinkedIn | Post personal de historia técnica (ver Sección 4) | 10:00 AM ET |
| Email | Envío a lista de newsletter con oferta early adopter | 10:00 AM ET |

**Objetivo del día:** Awareness masivo + activar la oferta de early adopter.

---

### Día 2 — Lunes 23 de marzo

| Red | Contenido | Horario |
|-----|-----------|---------|
| X/Twitter | Post de pain point — consistency rule (ver Sección 2, Post 2) | 9:00 AM ET |
| Instagram | Post imagen de impacto — consistency rule (ver Sección 2, Post 2) | 7:00 PM Colombia |
| TikTok | Video de lanzamiento — script voiceover (ver Sección 2, TikTok) | 6:00 PM Colombia |

**Objetivo del día:** Educación sobre pain point específico. Los usuarios que vieron el lanzamiento ayer necesitan un motivo adicional para registrarse.

---

### Día 3 — Martes 24 de marzo

| Red | Contenido | Horario |
|-----|-----------|---------|
| X/Twitter | Post feature showcase — revenge trading (ver Sección 2, Post 3) | 9:00 AM ET |
| Instagram | Reel tour del dashboard (ver Sección 2, Post 3) | 7:00 PM Colombia |

**Objetivo del día:** Mostrar el producto en acción. Convertir curiosidad en intención.

---

### Día 4 — Miércoles 25 de marzo

| Red | Contenido | Horario |
|-----|-----------|---------|
| X/Twitter | Pregunta de engagement: "¿Cuál fue la razón real por la que fallaste tu última evaluación?" — sin mención del producto | 1:00 PM ET |
| TikTok | Video educativo: "La consistency rule explicada en 60 segundos" — con visuales del dashboard | 6:00 PM Colombia |

**Objetivo del día:** Engagement y escucha activa. Las respuestas a la pregunta son contenido futuro y validación de pain points. El TikTok educativo sin CTA agresivo construye confianza.

**Script TikTok Día 4 (consistency rule educativo):**
Hook: "Esta regla hace reprobar a traders que sí cumplen el profit target."
Desarrollo: Explicar en 40 segundos qué es la consistency rule con un ejemplo numérico simple. Mostrar cómo Zentrade la calcula en pantalla.
CTA suave: "Si quieres medirla en tiempo real, link en bio."

---

### Día 5 — Jueves 26 de marzo

| Red | Contenido | Horario |
|-----|-----------|---------|
| Instagram | Behind the scenes: foto/video del proceso de build. Caption: historia de por qué lo construiste | 7:00 PM Colombia |
| X/Twitter | Thread corto (3-4 tweets): "Lo que aprendí construyendo Zentrade solo en X semanas" — técnico | 9:00 AM ET |

**Objetivo del día:** Humanizar el producto. Contenido de build in public que genera comunidad de devs + traders simultáneamente.

**Thread X Día 5:**
Tweet 1: "Lo que aprendí construyendo un SaaS para traders de futuros solo. Hilo corto:"
Tweet 2: "El checkout es el punto de quiebre. LemonSqueezy me rechazó. Mercado Pago tiene restricciones para suscripciones. FastSpring igual. PayPal funcionó en sandbox pero el live es lento. Al final: Wompi para LATAM. La lección: testea tu pasarela de pago en producción antes de cualquier otra feature."
Tweet 3: "La IA más difícil no fue el análisis de trades. Fue calibrar el prompt para que no generara insights genéricos. Ahora incluye: emociones del usuario, horario de operación, trading plan personalizado, y el contexto del instrumento. Gemini 2.5 Flash con ventana larga fue la decisión correcta."
Tweet 4: "El feature que más tiempo tomó y menos se ve: RLS en Supabase. Cada tabla. Cada query. Cada edge case. Pero es el que más importa. Si los datos de un usuario se filtran al siguiente, no hay producto."

---

### Día 6 — Viernes 27 de marzo

| Red | Contenido | Horario |
|-----|-----------|---------|
| X/Twitter | Post de social proof: si ya hay primeros usuarios, publicar un dato o feedback real | 9:00 AM ET |
| TikTok | Video: "5 métricas que debes revisar antes de tu próxima sesión de trading" — educativo puro | 6:00 PM Colombia |
| Email | Seguimiento a influencers que no respondieron el día 1 | Durante el día |

**Objetivo del día:** Construir social proof con usuarios reales. Si no hay feedback todavía, publicar un dato del producto (número de trades registrados, usuarios registrados en la semana).

**Nota sobre social proof:** Si en los primeros 5 días hay aunque sea 3 usuarios que registraron trades, pide permiso para publicar un screenshot anónimo del dashboard con datos reales. Un dashboard con trades reales convierte más que cualquier copy.

---

### Día 7 — Sábado 28 de marzo

| Red | Contenido | Horario |
|-----|-----------|---------|
| TikTok | Video: "El revenge trading explicado con un ejemplo real" — narración en primera persona | 6:00 PM Colombia |
| Instagram | Stories: encuesta "¿Cuántas evaluaciones de fondeo has tomado?" | Durante el día |

**Objetivo del día:** Finalizar la semana con contenido de alto engagement. Las encuestas de Instagram generan datos cualitativos sobre la audiencia y alimentan el algoritmo.

---

### Resumen de la semana 1

| Métrica objetivo | Target |
|-----------------|--------|
| Usuarios registrados (free) | 30-50 |
| Usuarios en oferta early adopter (Pro gratis) | 20-30 |
| Conversiones a planes pagos | 3-5 |
| Seguidores nuevos en X | 100-200 |
| Views TikTok acumuladas | 5,000+ |
| Respuestas a emails de influencer | 3-5 |

---

## SECCIÓN 6 — RECOMENDACIONES ADICIONALES

### Cómo conseguir los primeros 10 usuarios de pago

**Usuario de pago 1-3: Tu red directa.**
Los primeros pagos siempre vienen de personas que ya te conocen. Contacta directamente a traders que conozcas personalmente — colegas, ex-compañeros de evaluaciones, traders de grupos donde participas. No vendas: muéstrate. "Lo lancé hoy. ¿Lo pruebas esta semana?" Un Loom de 5 minutos mostrando el dashboard vale más que cualquier landing page.

**Usuario de pago 4-6: Comunidades de Discord y Telegram.**
Los servidores en español de FTMO, Apex, TopStep y Tradoverse tienen usuarios activos buscando herramientas. El mensaje correcto: "Soy el dev. Lo construí porque fallé evaluaciones. Los primeros 50 tienen 30 días Pro gratis. ¿Quién lo prueba?" Auténtico, sin spam, con acceso de valor real.

**Usuario de pago 7-10: Primer afiliado activo.**
Si uno de tus afiliados tiene aunque sea 500 seguidores comprometidos en TikTok o Instagram, un video auténtico de "estoy usando Zentrade en mi rutina" puede traer 5-10 usuarios pagos en 48h. Este es el canal de mayor ROI a corto plazo.

---

### Comunidades y grupos de trading en LATAM para atacar primero

**Prioridad 1 — Discord:**
- Servidores oficiales o no-oficiales de FTMO en español
- Apex Trader Funding Discord (hay usuarios hispanohablantes activos)
- TopStep Discord (mismo caso)
- Servidores de trading de futuros en español (buscar "futuros trading" o "NinjaTrader español" en Discord)

**Prioridad 2 — Telegram:**
- Grupos de trading de futuros en Colombia, México, Argentina
- Canales de traders de NES/MES, NQ/MNQ (los instrumentos más comunes en LATAM)
- Grupos de evaluaciones de fondeo en español

**Prioridad 3 — Facebook Groups:**
- "Traders de Futuros LATAM"
- "FTMO en Español"
- Grupos de trading en Colombia, México, Argentina (buscar por país + "trading futuros")

**Prioridad 4 — Reddit:**
- r/FuturesTrading — post en inglés con screenshot del dashboard
- r/Forex — mismo enfoque
- r/TradingView — mostrar la equity curve o el reporte de IA

**Estrategia de entrada a comunidades:** No entrar a vender. Entrar a responder preguntas sobre consistency rule, revenge trading, o métricas de prop firms. Construir presencia durante 3-5 días antes de mencionar el producto. La mención luego es orgánica: "yo tenía el mismo problema, por eso construí esto."

---

### Pricing: recomendación de oferta de early adopter

**Recomendación: sí a la oferta, con dos condiciones.**

La oferta de 30 días Professional gratis para los primeros 50 usuarios es correcta porque:
1. Elimina la barrera de precio en el momento de menor confianza (producto nuevo, sin reviews)
2. Genera una cohorte de usuarios activos que puedes convertir a plan pago en 30 días
3. Crea urgencia real con el número 50 — escasez verificable

Las dos condiciones para que funcione:
- **No extender la oferta.** Si en 7 días llegas a 50, ciérrala. Si no llegas, ciérrala de todas formas a los 14 días. La escasez pierde credibilidad si se extiende indefinidamente.
- **Onboarding activo.** Escríbele a cada uno de los 50 usuarios en los primeros 3 días. Un mensaje personal (no automatizado) preguntando cómo va su prueba de fondeo. Esto construye la relación que convierte a plan pago al día 30.

**Sobre el plan Starter ($9/mes):** No ofrecer descuento en Starter. El precio es bajo suficiente para no necesitar descuento. El descuento en planes bajos devalúa el producto sin aumentar conversiones de forma significativa.

**Sobre el plan Professional ($29/mes) a largo plazo:** A partir del mes 2, considerar un descuento de 20% anual explícito en la landing — no el descuento que ya existe, sino comunicarlo como "ahorra $99 al año" en lugar de "equivale a $21/mes." El ahorro en número absoluto convierte mejor que el porcentaje.

---

### KPIs de la semana 1 para tomar decisiones

Estos son los únicos números que importan esta semana:

| KPI | Qué indica | Umbral de acción |
|-----|------------|-----------------|
| Usuarios registrados en 7 días | Interés inicial real | <20 = revisar el hook de la landing |
| % free→Pro (early adopter) | Calidad del tráfico | <30% = el mensaje no está alineado con el perfil correcto |
| Checkout completion rate | Fricción de pago | <60% = problema técnico en el flujo de Wompi |
| Emails de influencers respondidos | Calidad del outreach | <20% = revisar asunto del email |
| Trades registrados por usuario activo | Activación real | <3 trades en 7 días = problema de onboarding |

Si el checkout completion rate está por debajo de 60%, es una señal técnica, no de marketing. Revisar el flujo de Wompi antes de invertir más en adquisición.

---

*Documento generado: 22 de marzo de 2026*
*Para uso interno — Zentrade / Axel Moncada*
