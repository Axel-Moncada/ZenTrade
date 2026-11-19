# Auditoría GEO de Zentrade — noviembre 2026

Dominio confirmado: `https://www.zen-trader.com` (metadataBase en `app/layout.tsx`). Producción responde 200 en `/robots.txt`, `/llms.txt` y `/sitemap.xml`.

## Limitaciones de esta auditoría
- No pude obtener SERPs ni respuestas reales de ChatGPT, Perplexity o Google AIO. Bing devolvió resultados irrelevantes, DuckDuckGo y Google bloquean con captcha o error, Reddit bloquea el fetch, y G2 y TraderSync devuelven 403. No intenté saltar los captchas.
- Lo marcado "verificado" se comprobó con fetch directo. Lo marcado **[por verificar]** son destinos probables que hay que abrir a mano.
- No hay DataForSEO disponible, así que no hay datos de menciones en LLMs. Hay que medir a mano (acción 10).

## Score GEO: 58 / 100

| Dimensión | Peso | Nota | Aporte |
|---|---|---|---|
| Citabilidad | 25% | 62 | 15.5 |
| Legibilidad estructural | 20% | 78 | 15.6 |
| Contenido multimodal | 15% | 40 | 6.0 |
| Autoridad y marca | 20% | 30 | 6.0 |
| Accesibilidad técnica | 20% | 78 | 15.6 |
| **Total** | | | **58.7 (redondeado a 58 por prudencia)** |

Lectura: la parte técnica y el contenido on-site están bien. El cuello de botella está fuera del sitio: casi no hay menciones de terceros, que es lo que más pesa en las citas de IA (YouTube ~0.74, Reddit y Wikipedia altos; backlinks solo ~0.27).

### Estado de crawlers de IA (`app/robots.ts`)
| Crawler | Antes | Ahora |
|---|---|---|
| GPTBot | Permitido | Permitido |
| OAI-SearchBot | No listado (cubierto por `*`) | **Permitido explícito** |
| ChatGPT-User | No listado | **Permitido explícito** |
| ClaudeBot / anthropic-ai | Permitido | Permitido |
| Claude-SearchBot / Claude-User | No listado | **Permitido explícito** |
| PerplexityBot | Permitido | Permitido |
| Perplexity-User | No listado | **Permitido explícito** |
| Google-Extended | Permitido | Permitido |
| CCBot, cohere-ai, Applebot-Extended, Amazonbot, Diffbot, YouBot, FacebookBot | Permitido | Permitido |

Ningún bot estaba bloqueado. Googlebot y Bingbot caen en `*` (permitido; `/dashboard/` y `/api/` bloqueados). Decisión tuya: CCBot, cohere-ai y anthropic-ai son solo de entrenamiento; permitirlos es válido si quieres presencia en modelos base.

### llms.txt
- Antes: existía pero era incompleto e impreciso. Listaba solo 24 de los 50 posts, ponía el español primero (el mercado es EE.UU.), decía que Sierra Chart se importa (no existe en el código), listaba Tradovate sin matiz (el código lo marca como no verificado), atribuía el reporte semanal con IA solo a ZenMode (la lógica lo da a Pro y ZenMode) y declaraba "RSL 1.0" sin que exista una licencia RSL real (`robots.txt` no tiene `License:`).
- No existía `llms-full.txt`.

### Schema (revisado por grep, sin renderizar)
Presentes: Organization, WebSite con SearchAction, SoftwareApplication, Offer (x4), FAQPage (11), BreadcrumbList (10), HowTo, Article, AboutPage, Person, VideoObject (2), ItemList. Buena cobertura. Riesgos:
- `app/page.tsx` declara `AggregateRating` 4.9 con 87 valoraciones. No encontré un perfil de reseñas que lo respalde (Trustpilot `zen-trader.com` da 404). Si no son reseñas reales y visibles, hay riesgo de acción manual de Google y de pérdida de confianza. Quitarlo o respaldarlo con reseñas verificables.
- Confirmar `sameAs` en Organization hacia YouTube, LinkedIn y X, y enlazar el `Person` del fundador a LinkedIn.

### Citabilidad de los posts (`data/blog/posts/*.json`)
Sobre los 50 posts originales: 754 párrafos, 442 H2, 261 H3, 97 tablas, 50 FAQ (uno por post), 68 CTA.
Fortalezas:
- Abren con respuesta directa en negritas ("here's the direct answer: ...").
- Hay tablas comparativas y callouts de transparencia ("usamos Zentrade porque lo construimos").
Debilidades:
- Títulos y slugs "2025" en noviembre 2026 (`best-trading-journal-prop-firms-2025` y otros). Tradervue ya publica "Best Trading Journals 2026". Los motores con recencia (Perplexity, AIO) penalizan lo viejo. El último `updatedAt` de los 50 originales es 2026-05-23.
- Solo un FAQ por post; los H2 son mayormente afirmativos, pocos en forma de pregunta.
- Estadísticas sin fuente ("over 85% fail... community data"). Los motores prefieren datos con fuente enlazada.
- Sin vídeo incrustado ni capturas de producto etiquetadas.
- Las comparativas están duplicadas: `/vs/tradezella` y 2 posts de blog (más 2 de Edgewonk). Riesgo de canibalización y de cifras contradictorias (el post dice TradeZella $29/mes; tu brief dice ~$300/año; el post nuevo dice que subió precios en 2026).
- Otros agentes están añadiendo posts nuevos (`tradezella-alternatives-2026`, `apex-consistency-rule-explained-2026`, etc.). Ya los incluí en `llms.txt` al regenerarlo, pero hay que volver a generarlo cuando termine el trabajo en el blog.

### Señales de marca (no verificadas en vivo)
| Señal | Estado |
|---|---|
| YouTube | Canal `@Zen-trade_Latam` con 2 vídeos citados (nombre "Latam", en español; el mercado objetivo es EE.UU.) |
| Reddit | Sin evidencia de presencia **[por verificar]** |
| Wikipedia / Wikidata | Sin entidad |
| LinkedIn / X | Perfiles listados, actividad por verificar |
| Reseñas (Trustpilot, G2, Capterra) | No encontradas |
| Directorios (AlternativeTo, Product Hunt) | Sin confirmar (la URL de AlternativeTo que probé dio 404) |

### Qué fuentes ya citan las IA (lo que pude comprobar)
- Tradervue: `https://www.tradervue.com/blog/best-trading-journal`, "7 Best Trading Journals You Should Use in 2026": Tradervue, WingmanTracker, RizeTrade, TraderSync, Edgewonk, TradeZella, TradesViz. Zentrade no aparece. No nombra prop firms: hueco que Zentrade puede ocupar con contenido propio.
- TradeZella en Trustpilot: 4.8/5 con 1,086 reseñas (`https://www.trustpilot.com/review/tradezella.com`). El resumen IA de la página cita problemas de sync, fallos, esperas de soporte y renovaciones no deseadas. Respalda tu ángulo "TradeZella alternative".
- Patrón general (no verificado en esta sesión): las consultas "best trading journal" suelen alimentarse de listicles de los propios proveedores, blogs de afiliados de prop firms y hilos de Reddit.

## Qué cambié
1. `public/llms.txt`: reescrito. Inglés primero; bloque "Key facts" citable con precios y límites contrastados con `components/shared/plan-features.tsx` y `app/pricing/page.tsx`; todos los posts actuales (25 EN, 31 ES); enlaces a /pricing, /vs/*, hubs ES y legales. Eliminé Sierra Chart y el reclamo RSL. Tradovate figura como beta; los ítems de ZenMode no entregados figuran como roadmap.
2. `public/llms-full.txt`: nuevo. Referencia completa: tabla de planes, matriz de features, importación, reglas de prop firms, features de IA, resumen vs TradeZella (con cautelas sobre precios de terceros) y FAQ.
3. `app/robots.ts`: reglas Allow explícitas para OAI-SearchBot, ChatGPT-User, Claude-SearchBot, Claude-User y Perplexity-User. Nada más.

Puntos a confirmar contigo:
- Reporte semanal con IA: `plan-features.tsx` lo pone solo en ZenMode; la lógica del cron y `pricing/page.tsx` lo dan a Pro y ZenMode. Seguí el código ("Professional y ZenMode").
- `plan-features.tsx` no tiene columna Free; la columna Free de `llms-full.txt` se infiere de `pricing/page.tsx`.
- El precio de TradeZella viene de tu brief y de los posts; verifícalo antes de afirmarlo en público.

## Top 10 acciones priorizadas
| # | Acción | Impacto | Esfuerzo |
|---|---|---|---|
| 1 | Conseguir presencia en listicles "best trading journal" y en blogs de prop firms (lista abajo) | Muy alto | Medio, continuo |
| 2 | Reddit: participar de forma genuina en r/FuturesTrading, r/Daytrading y hilos "journal" o "TradeZella alternative", con divulgación de fundador y sin spam | Muy alto | Medio, 2-3 h/semana |
| 3 | Reseñas reales: abrir perfiles en Trustpilot, G2 y Capterra y pedir reseñas a usuarios activos. Quitar `AggregateRating` si no hay respaldo | Alto | Bajo-medio |
| 4 | Actualizar posts "2025" a 2026 (título, H1, `updatedAt`, 301 si cambia el slug) y refrescar cifras; mostrar "Last updated" | Alto | Bajo |
| 5 | YouTube en inglés para EE.UU. con canal de marca (no "Latam"): "Apex trailing drawdown tracker", "TradeZella alternative", "how to track consistency rule", con transcripción y enlaces | Alto (correlación más fuerte) | Alto |
| 6 | Consolidar comparativas: una URL canónica `/vs/tradezella` con tabla, datos y FAQ; los posts duplicados apuntan a ella | Medio-alto | Bajo |
| 7 | Páginas de intención: `/vs/tradervue`, `/vs/tradersync`, `/best-trading-journal-for-apex`, `/best-trading-journal-for-topstep` | Alto | Medio |
| 8 | Fuente y fecha para toda estadística o regla (enlace a las páginas oficiales de Apex, TopStep y FTMO) y datos propios agregados y anónimos | Medio-alto | Medio |
| 9 | Schema: validar en Rich Results Test; `sameAs`, `Person` del fundador, `dateModified` en Article, `ItemList` en comparativas; FAQ visible igual al JSON-LD. Considerar IndexNow para Bing | Medio | Bajo |
| 10 | Medir: lista fija de 20 prompts, ejecutada cada mes en ChatGPT, Perplexity, Gemini/AIO y Claude, registrando menciones y fuentes citadas | Medio (habilita lo demás) | Bajo |

## Puntuación por plataforma (estimada, sin medición en vivo)
| Plataforma | Score | Motivo |
|---|---|---|
| Google AI Overviews | 62 | Buen schema y estructura; falta autoridad y frescura |
| Perplexity | 55 | Rastreo abierto; necesita frescura y menciones en Reddit y listicles |
| Bing Copilot | 55 | Sitemap y SSR correctos; poca señal de marca |
| Claude | 52 | Accesible; favorece fuentes claras y con autoridad |
| ChatGPT (Search) | 50 | OAI-SearchBot ahora explícito; depende de menciones de terceros |

## Outreach: dónde necesitamos aparecer
**Listicles y comparativas de journals**
- https://www.tradervue.com/blog/best-trading-journal — verificado (7 journals, sin Zentrade, sin firmas nombradas). Es contenido del proveedor, difícil de entrar; sirve de referencia del formato que se cita.
- https://www.tradersync.com/blog/ **[por verificar]** (403 al fetch)
- https://www.edgewonk.com/blog **[por verificar]**
- https://www.tradezella.com/blog **[por verificar]** (la ruta que probé dio 404)
- https://www.tradesviz.com/blog/ **[por verificar]**
- https://www.rizetrade.com/blog **[por verificar]**
- https://www.wingmantracker.com **[por verificar]**
- https://alternativeto.net — crear ficha de Zentrade como alternativa a TradeZella, Edgewonk y Tradervue (ruta exacta por verificar)
- https://www.producthunt.com — lanzamiento centrado en "journal for Apex/TopStep traders"
- https://www.g2.com y https://www.capterra.com — crear ficha y pedir reseñas
- https://www.trustpilot.com — reclamar `zen-trader.com` (aún no existe). Referencia: https://www.trustpilot.com/review/tradezella.com (verificado, 4.8 con 1,086 reseñas)

**Reddit (buscar a mano "journal", "TradeZella", "Apex consistency")**
- https://www.reddit.com/r/FuturesTrading/
- https://www.reddit.com/r/Daytrading/
- https://www.reddit.com/r/Trading/
- https://www.reddit.com/r/Forex/ (menos relevante; útil para FTMO)
- https://www.reddit.com/r/FundedTrading/ **[por verificar]**
- https://www.reddit.com/r/Apextraderfunding/ **[por verificar]**
- https://www.reddit.com/r/TopStepTrader/ **[por verificar]**
- https://www.reddit.com/r/FTMO/ **[por verificar]**

Reglas: responder preguntas reales, divulgar que eres fundador, no pegar enlace en cada comentario.

**Prop firms y afiliados**
- Discord y foros de Apex Trader Funding, TopStep y Uprofit, y sus secciones de herramientas o partners **[por verificar]**.
- Blogs y comparadores de prop firms: proponer una sección "tools" o "journals" **[por verificar]**.

**YouTube y otros**
- Creadores de Apex y TopStep (buscar "Apex eval journal", "TopStep Combine review") para demos y menciones.
- LinkedIn (company page activa), X (@ZenTrader_IA), Medium, Substack y Quora ("best trading journal for prop firms"). Wikidata solo cuando existan fuentes secundarias fiables.

## Prompts de seguimiento (acción 10)
best trading journal for prop firm traders; TradeZella alternative; trading journal for Apex; trading journal for TopStep; how to track consistency rule; Apex trailing drawdown tracker; free trading journal for futures; cheapest trading journal for prop firm; TradeZella vs Edgewonk vs TraderSync; journal that detects revenge trading; best journal for NinjaTrader or Rithmic; FTMO consistency rule calculator.

## Recomendaciones de formato para posts futuros
1. Primeras 40-60 palabras de cada sección: respuesta directa y autocontenida, con la cifra o la conclusión.
2. Bloques de 134-167 palabras por respuesta citable; evitar párrafos que dependan del anterior.
3. H2 y H3 en forma de pregunta ("How do I track the consistency rule on Apex?"), alineados con los prompts reales.
4. 4-6 FAQs por post (hoy 1), con el mismo texto en JSON-LD y en pantalla.
5. Una tabla por post con criterios claros (precio, plan gratis, reglas de prop firm, importación, IA). Incluir siempre al competidor con sus puntos fuertes; los motores desconfían de comparativas unilaterales.
6. Toda cifra con fuente enlazada y fecha de consulta. Mostrar "Last updated" y autor con enlace a bio o LinkedIn.
7. Año solo en título y H1; slug estable (`best-trading-journal-prop-firms`).
8. Un canónico por intención; inglés para EE.UU. y `/es/` o `hreflang` para español.
9. Datos propios: capturas anotadas, ejemplos numéricos de consistency, calculadoras, y un vídeo corto incrustado con transcripción.
10. Cierre con "Key takeaways" de 3-5 viñetas.
11. No afirmar features sin contrastar con `components/shared/plan-features.tsx`; marcar lo no entregado como roadmap.

## Archivos
- `D:\Development\2 - Zentrade\public\llms.txt` (modificado)
- `D:\Development\2 - Zentrade\public\llms-full.txt` (nuevo)
- `D:\Development\2 - Zentrade\app\robots.ts` (modificado)
- `D:\Development\2 - Zentrade\docs\seo\2026-11-geo-audit.md` (este informe)
