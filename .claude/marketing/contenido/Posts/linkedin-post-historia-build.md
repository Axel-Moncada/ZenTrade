---
tipo: post
plataforma: LinkedIn
estado: listo
aprobado: true
fecha_sugerida: 23 de marzo — tarde — 10:00 AM ET o 12:00 PM ET
tema: Historia técnica del build — fundador a fundadores y builders
formato: Post largo de LinkedIn con storytelling auténtico
nota: LinkedIn premia posts largos con historia auténtica. El desglose técnico convierte mejor que narrativa perfecta para esta audiencia.
---

# Post LinkedIn — Historia Técnica del Lanzamiento

---

## Copy completo

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
- **Wompi** — pasarela de pago para Colombia y LATAM. LemonSqueezy, Mercado Pago, FastSpring y PayPal no funcionaron para Colombia. Wompi sí.
- **Algoritmo de Revenge Trading Detection** — función pura que analiza la secuencia de trades: si el siguiente entry ocurre menos de 30 minutos después de una pérdida, o si hay 3+ pérdidas consecutivas, el sistema lo detecta, registra y analiza.
- **Sistema de afiliados** — tracking de conversiones con links únicos, tiers de comisión, dashboard para afiliados.

Todo esto lo construí solo.

**Lo que aprendí**

Construir un SaaS B2C como solo founder es un ejercicio brutal de priorización. Cada feature compite contra el tiempo de go-to-market. Cada bug que resuelves a las 2 AM es una decisión entre hacerlo bien y hacerlo rápido.

Lo que no se negocia: la seguridad de los datos del usuario y la confiabilidad de las automatizaciones. El reporte de IA del lunes tiene que llegar. El radar del domingo tiene que salir. Si eso falla, el producto no sirve.

Lo que aprendí a dejar para después: las optimizaciones prematuras, las features "cool", el perfeccionismo en el UI. Lo que el usuario necesita primero es que funcione.

**Por qué LATAM**

TradeZella (el líder del mercado) no tiene UI en español. Edgewonk es desktop y sin IA. Tradervue es complejo para traders nuevos. Ninguno está optimizado para las reglas específicas de las empresas de fondeo.

Hay millones de traders de futuros en Colombia, México, Argentina, Chile y Perú que están pasando evaluaciones con herramientas en inglés que no entienden del todo. Zentrade es para ellos.

**El lanzamiento de hoy**

Plan gratis disponible. Los primeros 50 usuarios obtienen 30 días del plan Professional sin tarjeta de crédito.

Si conoces traders de futuros en LATAM — comparte. Cada compartir hoy tiene más peso que cien el mes que viene.

Y si construyes SaaS solo, me interesa tu historia. Respondo todos los comentarios.

[LINK]

---

## Hashtags

#buildinpublic #saas #indiedev #nextjs #supabase #ai #gemini #futurestrading #propfirm #latam #Colombia #tradingjournal #zentrade

---

## Notas de estrategia

- Este post apunta a dos audiencias simultáneamente: traders de futuros (el buyer) y builders/founders (amplificadores que pueden compartir)
- El desglose de stack técnico detallado posiciona a Axel como un developer full-stack completo — construye credibilidad para la audiencia técnica de LinkedIn
- Mencionar los failures (pasarelas que no funcionaron, las evaluaciones falladas) construye credibilidad más que una narrativa perfecta
- El CTA final es de comunidad ("me interesa tu historia"), no de venta directa — LinkedIn convierte mejor con CTAs de conversación
- Publicar en horario de oficina (10:00 AM ET) para máximo alcance en LinkedIn
