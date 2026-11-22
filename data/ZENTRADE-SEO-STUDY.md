# ZenTrade — Estudio SEO para Claude Code (v2, con datos reales)

> **Para:** Claude Code (repo de zen-trader.com, Next.js App Router + TS + Tailwind + Supabase)
> **De:** Axel (Founder) — 22 nov 2026
> **Fuentes:** Google Search Console (`sc-domain:zen-trader.com`, últimos 3 meses), GA4 (propiedad `530723145`, últimos 28 días), Google Ads (cuenta ZenTrader 245-445-5519, todo el período: 6 may–22 nov 2026), más investigación de la SERP de EE. UU. (nov 2026).

---

## 0. Conclusión principal

**El problema no es la falta de contenido. Google no está indexando el que ya existe.**

- El sitio tiene **~50 artículos de blog + páginas de firmas + comparativas**, pero Google indexó **solo 3 URLs**. Hay **68 sin indexar**: **52 en "Descubierta: actualmente sin indexar"**, es decir, Google las conoce pero no las ha querido rastrear.
- En 3 meses hubo **11 clics y 421 impresiones**, casi todo por búsquedas de marca ("zentrade" = 6 clics). **EE. UU.: 0 clics, 117 impresiones, posición media 38.**
- Las pocas páginas de blog que sí aparecen rankean **muy bien** (posición 2–5): `zentrade-vs-tradezella-comparison` (pos. 2.3), `mejor-journal-trading-futuros-2025` (pos. 2.8), `como-pasar-evaluacion-ftmo-journal-trading` (pos. 5.2). **El contenido sirve cuando Google lo indexa.**

➡️ **Prioridad absoluta: arreglar la indexación y consolidar lo que existe. Escribir artículos nuevos va después.** Publicar más URLs ahora solo agranda la cola de "descubierta sin indexar".

---

## 1. Datos de Search Console

### 1.1 Rendimiento (21 ago – 20 nov 2026)
| Métrica | Valor |
|---|---|
| Clics | 11 |
| Impresiones | 421 |
| CTR medio | 2.6 % |
| Posición media | 30.9 |

**Consultas:** 33 en total, **todas variantes de marca o confusiones de marca** ("zentrade", "zen trading", "zentrades", "zemmy trade", "zen trader", "zentrades reviews/login"). La única no-marca es `topstep cpi rules` (1 impresión, pos. 10).
→ Hoy no hay tráfico no-marca. Los nombres parecidos ("ZenTrades", "Zen Trading") compiten por la marca. Conviene usar "ZenTrade trading journal" en el title de la home.

**Páginas con impresiones:**
| URL | Impr. | Pos. |
|---|---|---|
| `/` | 418 | 31.1 |
| `/blog/zentrade-vs-tradezella-comparison` | 18 | **2.3** |
| `/blog/mejor-journal-trading-futuros-2025` | 15 | **2.8** |
| `/blog/como-pasar-evaluacion-ftmo-journal-trading` | 6 | **5.2** |

**Países:** EE. UU. 117 impr. / 0 clics / pos. 38.1; India 34; España 14; Reino Unido 13. Colombia y México tienen 2 impresiones cada uno.

### 1.2 Indexación
**Indexadas: 3. Sin indexar: 68.**

| Motivo | Nº | Qué significa / acción |
|---|---|---|
| Descubierta: actualmente sin indexar | **52** | Google no ve suficiente valor ni autoridad para rastrearlas. Ver §3. |
| Rastreada: actualmente sin indexar | 5 | La leyó y la descartó por calidad o duplicado: `/blog/como-pasar-evaluacion-ftmo-journal-trading`, `/blog/pasos-evaluacion-ftmo`, `/blog/drawdown-trailing-vs-estatico-prop-firms`, `/terms`, `/disclaimer` |
| Página con redirección | 6 | Normal (http→https, no-www→www), salvo `/blog/zentrade-vs-tradezella` y `zen-trader.com/blog/mejor-journal-trading-futuros-2025` |
| 404 | 4 | `/blog/reglas-riesgo-ftmo-futuros-drawdown-consistency`, `/blog/how-to-pass-ftmo-evaluation`, `/blog/best-trading-journal-prop-firms-2025` (www y no-www) → **poner redirect 301 al artículo equivalente** |
| noindex | 1 | `/login` (correcto) |

**Las 52 "descubiertas sin indexar"** incluyen casi todo el blog, `/about`, `/pricing`, `/blog`, `/apex-trader-funding`, `/topstep`, `/ftmo`, `/es/apex-trader-funding`, `/es/ftmo`, `/es/topstep`, `/vs/tradezella`, `/vs/edgewonk` y todos los artículos EN/ES (lista completa en el Anexo A).

### 1.3 Sitemap
- Enviado: `https://zen-trader.com/sitemap.xml` (**sin www**); el sitio canónico es `https://www.zen-trader.com`. Última lectura el 17 nov, 62 URLs, estado correcto.
- **Todas las URLs tienen `<lastmod>` = la fecha de hoy** (se genera con `new Date()`). Google aprende a ignorar ese lastmod y deja de usarlo como señal de cambio.

### 1.4 On-page (muestra: `/blog/how-to-avoid-revenge-trading-prop-firms`)
Está bien: title, description, un solo H1, canonical propio, `index, follow`, JSON-LD `Article`, ~2.000 palabras renderizadas en el servidor y 13 enlaces internos. **No le falta SEO on-page.** Le falta que Google lo rastree.
Falta: **`hreflang`** (ninguna página lo tiene, aunque casi todos los temas existen en EN y ES).

---

## 2. Datos de GA4 y Google Ads (afectan la medición SEO)

### 2.1 GA4 (25 oct – 21 nov 2026)
- 185 usuarios y 238 sesiones. Direct 159, **Organic Search 63**, Referral 14.
- **Usuarios por país:** EE. UU. 53 (los únicos con interacción real: 55 %), **Singapur 49 y China 14 con ~0 % de interacción → bots**. Colombia 3 (casi todo es uso interno).
- `/blog` tuvo 6 vistas. El blog no está trayendo tráfico.

### 2.2 🔴 La medición de conversiones está rota
- `registro_zentrader` se disparó **204 veces por 6 usuarios (34 por usuario)**. Se dispara en cada carga de página del dashboard, no cuando alguien se registra.
- Además hay **3 eventos duplicados** de conversión de Ads (`ads_conversion_Registro_Carga_de_p_gin_1/2/3`), con 181 disparos cada uno.
- Consecuencia: GA4 reporta 602 "eventos clave" en 28 días, y Google Ads registró **97 conversiones con 35 clics** (una búsqueda, "bot de trading gratis", tuvo 1 clic y 30 conversiones). **Performance Max optimizó con conversiones falsas.**

**Arreglo obligatorio (antes de cualquier pauta o análisis SEO):**
1. Disparar `sign_up` (o `registro_zentrader`) **una sola vez**: tras crear la cuenta con éxito en Supabase, en el callback de registro o en la primera carga con un flag `is_new_user`, guardando en `localStorage` o en la BD que ya se disparó.
2. Eliminar en Google Ads las 3 acciones de conversión "Registro – Carga de página" y crear **una** acción importada de GA4 (`sign_up`).
3. En GA4, marcar como evento clave solo `sign_up` (y `purchase` cuando exista).
4. Filtrar el tráfico de bots (Singapur/China con 0 s de interacción) con un segmento de comparación. Evaluar Vercel Firewall o el challenge de bots.

### 2.3 Lo que dicen los términos de búsqueda de Ads (PMax, 6 may – 22 nov)
- **205 términos, 35 clics, COP 90.385 de costo.** La mayoría tiene una intención equivocada: "como generar ingresos desde casa colombia" (8 clics), "invertir con inteligencia artificial", "app para invertir y ganar dinero", "como comprar acciones en colombia". Esa audiencia no compra un trading journal.
- **Términos con la intención correcta** (impresiones, casi sin clics): `apex` (15), `el sensei` (15), `plataformas de trading colombia` (10), `oscar fontecha` (9), `trading colombia` (8), `trading de futuros en vivo` (4), `mentalidad de trader` (3), `apex trader funding` (2), `topstep`, `tradeify`, `journal trading`, `disciplina trading`, `backtesting`, `futuros nasdaq`, `smart money concepts`.
- Lectura para SEO: **las marcas de empresas de fondeo (Apex, Topstep, Tradeify) y la psicología o disciplina** son los temas con intención real. Coincide con la investigación de la SERP (§5).
- Nota: la cuenta de Ads aparece **detenida por saldo**. La campaña `PropFirm Traders - EN - Search` no tiene impresiones.

---

## 3. Por qué Google no indexa (diagnóstico)

1. **Autoridad casi nula y muchas URLs de golpe.** Un dominio nuevo sin backlinks publicó ~50 artículos en poco tiempo. Google pone un presupuesto de rastreo bajo y deja la mayoría en "descubierta".
2. **Contenido duplicado o canibalizado:**
   - EN/ES del mismo tema sin `hreflang` (p. ej. `consistency-rule-prop-firm-explained` vs `consistency-rule-fondeo-explicada`, `what-is-drawdown-trading` vs `que-es-drawdown-trading`, `profit-factor-trading-explained` vs `profit-factor-trading-que-es`).
   - Duplicados directos: `blog/zentrade-vs-edgewonk` vs `blog/zentrade-vs-edgewonk-comparison` vs `vs/edgewonk`; `blog/zentrade-vs-tradezella-comparison` vs `vs/tradezella`; `/apex-trader-funding` vs `blog/how-to-pass-apex-trader-funding` vs `blog/como-pasar-apex-trader-funding` vs `blog/apex-trader-funding-trailing-drawdown-guia`.
   - Tres artículos sobre pasar FTMO (`como-pasar-evaluacion-ftmo-journal-trading`, `pasos-evaluacion-ftmo` y el 404 `how-to-pass-ftmo-evaluation`): Google rastreó dos y descartó ambos.
3. **Señales de frescura falsas:** el `lastmod` siempre es hoy y los slugs y titles dicen "2025" (`best-futures-trading-journal-2025`, `mejores-empresas-fondeo-futuros-2025`, `best-prop-firms-futures-traders-2025`) estando en noviembre de 2026.
4. **Sitemap en el host equivocado** (no-www) y 404 sin redirigir.
5. **Enlazado interno débil desde la home** hacia las páginas pilar (la home es la única URL con autoridad y casi todo el blog cuelga solo de `/blog`, que tampoco está indexado).

---

## 4. Plan de acción para Claude Code (en este orden)

### Fase 0 — Medición (1–2 días)
- [ ] Arreglar `registro_zentrader` / `sign_up` para que se dispare una sola vez (§2.2).
- [ ] Quitar las 3 conversiones duplicadas de Ads (lo hace Axel en la UI; Claude Code documenta el evento correcto).
- [ ] Activar Vercel Web Analytics (hoy está desactivado en el proyecto `zentrade`).
- [ ] Evento GA4 `tool_used` (`tool_name`) para las calculadoras futuras.

### Fase 1 — Higiene técnica de indexación (semana 1)
- [ ] **Sitemap:** generar `lastmod` desde la fecha real de publicación o edición del post (frontmatter o columna `updated_at`), nunca con `new Date()`. Solo URLs canónicas `https://www.zen-trader.com/...`, 200, indexables.
- [ ] Axel: en GSC, enviar `https://www.zen-trader.com/sitemap.xml` y quitar el sitemap sin www.
- [ ] **301** para los 4 404 y para cada URL que se consolide (ver abajo). Usar `next.config` `redirects()` o `middleware`.
- [ ] Quitar `/terms` y `/disclaimer` del sitemap (o dejarlos con `noindex, follow`); no aportan.
- [ ] **hreflang** en cada par EN/ES (`alternates.languages` en `generateMetadata` + `x-default` hacia EN). Construir un mapa `slugEN ↔ slugES` en un solo archivo.
- [ ] **Consolidar duplicados** (un tema = una URL por idioma):

| Tema | URL que se queda (EN) | Pareja ES | 301 desde |
|---|---|---|---|
| ZenTrade vs TradeZella | `/vs/tradezella` | `/es/vs/tradezella` | `/blog/zentrade-vs-tradezella-comparison`, `/blog/zentrade-vs-tradezella` |
| ZenTrade vs Edgewonk | `/vs/edgewonk` | `/es/vs/edgewonk` | `/blog/zentrade-vs-edgewonk`, `/blog/zentrade-vs-edgewonk-comparison` |
| Apex | `/apex-trader-funding` (hub) | `/es/apex-trader-funding` | `/blog/how-to-pass-apex-trader-funding`, `/blog/como-pasar-apex-trader-funding`, `/blog/apex-trader-funding-trailing-drawdown-guia` (fusionar su contenido en el hub) |
| Topstep | `/topstep` | `/es/topstep` | `/blog/how-to-pass-topstep-evaluation`, `/blog/como-pasar-topstep-evaluacion` |
| FTMO | `/ftmo` | `/es/ftmo` | `/blog/como-pasar-evaluacion-ftmo-journal-trading`, `/blog/pasos-evaluacion-ftmo`, `/blog/how-to-pass-ftmo-evaluation`, `/blog/regla-consistencia-ftmo-explicada` (si su contenido entra en el hub) |
| Best journal | `/blog/best-futures-trading-journal` (sin año) | `/es/blog/mejor-journal-trading-futuros` | `-2025` variantes, `/blog/best-trading-journal-prop-firms-2025` |
| Best prop firms | `/blog/best-futures-prop-firms` | `/es/blog/mejores-empresas-fondeo-futuros` | variantes `-2025` |

  ⚠️ `vs/tradezella` (pos. 2.3) y `mejor-journal-trading-futuros-2025` (pos. 2.8) **ya rankean**: al consolidar, conservar su contenido y title y hacer 301 hacia la URL final. No reescribirlos desde cero.
- [ ] Quitar "2025" de slugs y titles; usar "(2026)" solo en el title, no en el slug, y actualizar el contenido de verdad.
- [ ] **Home:** añadir una sección "Guides" con enlaces directos a 6–8 páginas pilar (consistency rule, Apex, Topstep, FTMO, revenge trading, drawdown, best journal, vs TradeZella). Footer con los hubs de firmas.
- [ ] Breadcrumbs con schema en el blog y en los hubs.

### Fase 2 — Pedir indexación con un lote pequeño (semana 2)
- [ ] Axel: en GSC, inspeccionar URL y **solicitar indexación** de 10 URLs prioritarias, en EN primero: home, `/vs/tradezella`, `/apex-trader-funding`, `/topstep`, `/ftmo`, `/blog/consistency-rule-prop-firm-explained`, `/blog/how-to-avoid-revenge-trading-prop-firms`, `/blog/what-is-drawdown-trading`, `/blog/best-futures-trading-journal`, `/pricing`.
- [ ] **Congelar publicaciones nuevas** hasta que más del 50 % del sitemap esté indexado.
- [ ] Backlinks iniciales (los hace Axel): perfil en Product Hunt, directorios de SaaS (AlternativeTo como alternativa a TradeZella/Edgewonk, SaaSHub), respuestas útiles en Reddit (r/FuturesTrading, r/Daytrading, r/propfirm) y foros como NexusFi, enlace desde el canal de YouTube de ZenTrade. Con 5–10 enlaces reales el presupuesto de rastreo cambia.

### Fase 3 — Contenido nuevo de alto valor (cuando la indexación responda)
Solo entonces, y en EN primero:
1. **`/tools/consistency-rule-calculator`**: P&L diario → mejor día vs. umbral, profit adicional necesario y presets por firma con `lastVerified`. Tema de moda: Apex subió su regla de consistencia del 30 % al 50 % en marzo de 2026 y mucho contenido sigue desactualizado.
2. **`/tools/trailing-drawdown-position-size-calculator`**: cuenta, tipo de drawdown, stop en ticks e instrumento (NQ, MNQ, ES, MES, GC, MGC, CL) → contratos máximos y % del colchón.
3. **`/integrations/tradovate`** e **`/integrations/ninjatrader`**: solo si el import existe. Ya hay `blog/como-operar-tradovate-prop-firm` y `blog/ninjatrader-journal-trading-futuros`: convertirlos en estas páginas con 301.
4. Hubs nuevos de firmas con intención real en Ads/SERP: **`/lucid-trading`**, **`/tradeify`**, **`/myfundedfutures`**.

Cada calculadora va enlazada desde el hub de cada firma y desde la home.

---

## 5. Contexto de la SERP (EE. UU., nov 2026)

- **TradeZella** domina con contenido de "best trading journal" y guías de prop firms. Las búsquedas comerciales de cabeza (best trading journal) quedan para largo plazo.
- **Medios y afiliados de prop firms** (propfirmmap, proptradingvibes, damnpropfirms, fundedtrading) dominan las búsquedas de reglas y comparativas.
- **Journals pequeños** (Aurafy, TradesViz, Tanto) ganan con **páginas por plataforma y por firma** y **calculadoras gratis**.
- Espacio para ZenTrade: **herramientas** (calculadoras) + **hubs por firma** + **psicología con dato** (revenge trading, que es el diferenciador del producto).

---

## 6. Reglas de contenido (obligatorias)

- **Nunca prometer rentabilidad** ni que ZenTrade "te hace pasar" una evaluación.
- Sin superlativos sin evidencia y sin emojis de cohete o gráficas.
- Ningún precio en copy que se reutilice en Google Ads.
- Datos de reglas de firmas con "Last verified" + enlace a la fuente oficial; si no se pueden verificar, no se publican.
- En español: "empresa de fondeo" / "prueba de fondeo", sin mezclar idiomas.
- Disclaimer de riesgo en las páginas learn y tools.

---

## 7. KPIs y revisión

| KPI | Hoy | Meta a 30 días | Meta a 60 días |
|---|---|---|---|
| URLs indexadas | 3 | 15 | 35 |
| Impresiones no-marca / mes | ~0 | 300 | 1.500 |
| Clics orgánicos EE. UU. / mes | 0 | 10 | 50 |
| `sign_up` con origen orgánico | sin medir (evento roto) | medido | — |

Revisar GSC (Indexación + Rendimiento filtrado por EE. UU., excluyendo búsquedas de marca con regex `zen`) cada 2 semanas.

---

## Anexo A — URLs en "Descubierta: actualmente sin indexar" (52)
`/about`, `/apex-trader-funding`, `/blog`, `/pricing`, `/topstep`, `/ftmo`, `/es/apex-trader-funding`, `/es/ftmo`, `/es/topstep`, `/vs/edgewonk`, `/vs/tradezella`, y en `/blog/`: `apex-trader-funding-trailing-drawdown-guia`, `best-futures-trading-journal-2025`, `best-prop-firms-futures-traders-2025`, `como-llevar-journal-trading-futuros`, `como-operar-nq-maximos-historicos-volatilidad`, `como-operar-tradovate-prop-firm`, `como-pasar-apex-trader-funding`, `como-pasar-topstep-evaluacion`, `como-pasar-uprofit-evaluacion`, `consistency-rule-fondeo-explicada`, `consistency-rule-prop-firm-explained`, `errores-comunes-evaluaciones-fondeo`, `ftmo-payout-reparto-ganancias`, `ftmo-swing-account-vs-regular-cuando-elegir`, `futures-trading-journal-template`, `how-to-avoid-revenge-trading-prop-firms`, `how-to-pass-apex-trader-funding`, `how-to-pass-topstep-evaluation`, `how-to-track-emotions-trading`, `max-daily-loss-como-respetar`, `max-daily-loss-fondeo-how-to-manage`, `mejores-empresas-fondeo-futuros-2025`, `mejores-instrumentos-futuros-principiantes`, `ninjatrader-journal-trading-futuros`, `nq-futures-trading-beginners-guide`, `profit-factor-trading-explained`, `profit-factor-trading-que-es`, `psicologia-trading-futuros`, `que-es-drawdown-trading`, `que-es-revenge-trading`, `que-es-un-trading-journal`, `que-es-una-empresa-de-fondeo`, `regla-consistencia-ftmo-explicada`, `reglas-riesgo-diario-fondeo`, `trading-psychology-futures-traders`, `trailing-drawdown-ftmo-vs-apex-vs-topstep`, `uprofit-colombia-empresa-fondeo`, `what-is-a-trading-journal`, `what-is-drawdown-trading`, `zentrade-vs-edgewonk`, `zentrade-vs-edgewonk-comparison`.

Nota: `max-daily-loss-fondeo-how-to-manage` mezcla español e inglés en el slug; renombrar al consolidar.

### Fuentes externas
- Apex 50 % consistency (mar 2026): https://propfirmsfinder.com/guides/consistency/ · https://damnpropfirms.com/glossary/consistency-rule/
- SERP "best trading journal": https://www.tradezella.com/blog/best-trading-journal-2026 · https://fundedtrading.com/best-trading-journal/
- Páginas por plataforma (competencia): https://w1337-cyber.github.io/aurafy-growth-assets/brokers/tradovate/
