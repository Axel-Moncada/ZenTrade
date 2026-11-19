# Auditoría SEO técnica — Zentrade (19 nov 2026)

Dominio canónico: `https://www.zen-trader.com`. `metadataBase` en `app/layout.tsx:17` usa `SITE_URL` con www, no el apex. El apex `zen-trader.com` responde 301 a www y la configuración es consistente (sitemap, robots y canonicals usan www). Auditoría hecha sobre el código y el sitio en vivo (fetch con curl, 62 URLs en el sitemap, 50 posts).

## Score de salud: 58/100

| Categoría | Estado | Nota |
|---|---|---|
| Crawlability (robots, sitemap) | Aprobado con reservas | robots.txt correcto. El sitemap incluye una URL que redirige. |
| Indexabilidad / canonicals | Aprobado | Canonical autorreferenciado en todas las páginas revisadas. |
| hreflang | Falla | `<html lang="es">` en todo el sitio, incluidas las páginas en inglés. Un par roto y sin `x-default`. |
| Metadata (títulos, OG) | Falla | 16 títulos duplican "\| Zentrade". Las imágenes OG devuelven 500 o 404. |
| Structured data | Riesgo | AggregateRating sin reseñas verificables. SearchAction hacia una ruta que no existe. |
| Seguridad / headers | Aprobado con reservas | HSTS, X-Frame-Options y nosniff están. Falta CSP. |
| Enlazado interno | Falla | Hubs de prop firms y páginas /vs/* huérfanas desde nav y footer. |
| Core Web Vitals (por código) | Riesgo medio | Hero con imágenes externas y GA4 `afterInteractive`. |
| Rendering JS | Aprobado | SSR/SSG: H1, JSON-LD y enlaces están en el HTML inicial. |
| IndexNow | No implementado | Hay un archivo de verificación de 32 caracteres en `public/`. Hay que confirmar que es la clave de Bing y no de otro servicio. |

## Top 10 problemas por impacto

### 1. CRÍTICO — `<html lang="es">` fijo en un sitio mayormente en inglés
- Archivo: `app/layout.tsx:90`. Además `og:locale` es `es_ES` en `app/layout.tsx:51`.
- Evidencia en vivo: la home en inglés, `/ftmo`, `/topstep`, `/apex-trader-funding` y los posts `en` salen con `lang="es"`.
- Impacto: mezcla señales de idioma para Google y Bing y afecta la accesibilidad. Es el mercado principal (EE.UU.).
- Fix: en Next App Router el `lang` de `<html>` solo se fija en el root layout.
  - Opción A, la más rápida: cambiar a `lang="en"` en `app/layout.tsx:90`. El contenido en español ya declara `hreflang="es"` y `inLanguage`.
  - Opción B, la correcta: crear route groups `app/(en)/layout.tsx` y `app/(es)/layout.tsx`, cada uno con su `<html lang>`, y mover `es/*` y los posts en español.
  - En ambos casos, `openGraph.locale` por página: `en_US` en las EN, `es_ES` en las ES.

### 2. CRÍTICO — Sitemap con URL que redirige, hreflang roto y enlace interno hacia la redirección
- El sitemap incluye `/blog/zentrade-vs-tradezella`, que responde 308 a `/blog/zentrade-vs-tradezella-comparison` (`next.config.mjs:19`).
- El archivo `data/blog/posts/zentrade-vs-tradezella.json` sigue existiendo, por eso `getAllPosts()` lo emite.
- `lib/blog.ts:48` mapea ese slug muerto como el par ES de `zentrade-vs-tradezella-comparison`. Resultado: el `hreflang="es"` de la versión EN apunta a una URL que redirige, y Google lo ignora.
- `app/vs/tradezella/page.tsx` enlaza a `/blog/zentrade-vs-tradezella`, que es la redirección.
- Fix, en este orden:
  1. Decidir qué hacer con la versión ES. Si el contenido es distinto, renombrar el slug a `zentrade-vs-tradezella-es` y quitar el redirect de `next.config.mjs`. Si no, eliminar el par.
  2. Si se renombra, cambiar la línea 48 de `lib/blog.ts` a `"zentrade-vs-tradezella-es": "zentrade-vs-tradezella-comparison"`.
  3. Actualizar el enlace en `app/vs/tradezella/page.tsx`.
  4. Borrar o renombrar `zentrade-vs-tradezella.json`.

### 3. ALTO — Imágenes OG rotas
- `/blog/og/[slug]` devuelve 500 en los posts probados (`what-is-a-trading-journal`, `zentrade-vs-edgewonk`, `zentrade-vs-edgewonk-comparison`).
  - Código: `app/blog/og/[slug]/route.tsx` con `dynamic = "force-dynamic"`. Revisar los logs de Vercel para ver el error exacto, probablemente una fuente o una importación en `next/og`.
  - Todos los posts referencian esa URL en `og:image` y `twitter:image` (`app/blog/[slug]/page.tsx:41`).
- `/og-image.png` devuelve 404. La home y todas las páginas sin override lo usan (`app/layout.tsx:56`, `app/layout.tsx:69`). No existe `public/og-image.png`.
- `/manifest.json` devuelve 404 (`app/layout.tsx:80`). No hay manifest.
- Fix:
  - Subir `public/og-image.png` (1200x630).
  - Crear `app/manifest.ts`, o quitar la referencia.
  - Depurar la route OG y probar con `curl -I` tras el deploy.

### 4. ALTO — Páginas de alto valor huérfanas desde la navegación
- Nav y footer de la home no enlazan a `/ftmo`, `/topstep`, `/apex-trader-funding` ni `/vs/*`. La home solo enlaza a `/blog`, `/pricing`, `/about`, `/login`, `/register` y legales.
- Los hubs solo se descubren por el sitemap y `llms.txt`. Casi ningún post los enlaza.
- Las páginas `/vs/*` solo enlazan a blog, about y pricing. No se enlazan entre sí.
- Fix: añadir un bloque "Prop firms" y "Compare" en el footer del landing (`components/landing/`) con `/ftmo`, `/topstep`, `/apex-trader-funding`, `/vs/tradezella` y `/vs/edgewonk`. Enlazar las páginas `/es/*` desde el selector de idioma. Añadir enlaces contextuales hub -> posts y post -> hub en los 50 posts (campo `relatedSlugs` o un bloque CTA).

### 5. ALTO — Títulos duplicados con "| Zentrade | Zentrade"
- 16 posts tienen `seoTitle` con el sufijo "| Zentrade", y el `title.template` de `app/layout.tsx` (`%s | Zentrade`) lo vuelve a añadir.
- Ejemplos: `best-trading-journal-prop-firms-2025`, `como-operar-tradovate-prop-firm`, `profit-factor-trading-explained`, `drawdown-trailing-vs-estatico-prop-firms`.
- Fix exacto: `sed -i 's/ | Zentrade",$/",/' data/blog/posts/*.json` limitado a la línea `"seoTitle"`. Alternativa: usar `title: { absolute: title }` en `generateMetadata` de `app/blog/[slug]/page.tsx:~44`.

### 6. ALTO — Páginas /vs/* en español orientadas a LATAM, con títulos de 2025
- `app/vs/tradezella/page.tsx:12` y `app/vs/edgewonk/page.tsx:12`: "...2025: ¿Cuál es Mejor para Prop Firms en LATAM?".
- Estos son los titulares de mayor intención comercial. El mercado primario es EE.UU., y las queries "tradezella alternative" o "tradezella vs" son en inglés.
- Además compiten con los posts EN `zentrade-vs-tradezella-comparison` y `zentrade-vs-edgewonk-comparison` por la misma intención (canibalización).
- Fix:
  - Pasar `/vs/*` a inglés.
  - Mover la versión en español a `/es/vs/*`.
  - Declarar `alternates.languages` en ambas.
  - Canonicalizar o redirigir los posts `*-comparison` hacia `/vs/*`.
  - Actualizar el año a 2026.

### 7. MEDIO — hreflang de posts incompleto y sin x-default
- `HREFLANG_PAIRS` (`lib/blog.ts:47-59`) tiene 11 pares. Hay pares EN/ES sin declarar:
  - `psicologia-trading-futuros` y `trading-psychology-futures-traders`
  - `profit-factor-trading-que-es` y `profit-factor-trading-explained`
  - `que-es-una-empresa-de-fondeo` y su equivalente EN, si aplica
  - `como-pasar-uprofit-evaluacion` y su equivalente EN, si existe
- Ninguna página declara `x-default`. Añadirlo en `alternates.languages` con la versión EN (`app/blog/[slug]/page.tsx:74-81` y los hubs).
- Fix: completar el mapa y añadir `"x-default": enEnUrl`.
- El sitemap no lleva `xhtml:link`. Opcional: en `app/sitemap.ts` añadir `alternates: { languages: {...} }` a las entradas con par.

### 8. MEDIO — Schema JSON-LD con riesgo de acción manual o de ser ignorado
- `app/page.tsx:108`: `AggregateRating` 4.9 / 87 reseñas. Las reseñas no son verificables en la página, y el lanzamiento público es de 2026. Google puede penalizar el rich result por marcado engañoso. Fix: eliminarlo hasta tener reseñas reales y visibles.
- `app/page.tsx:227-231`: `SearchAction` con `/blog?q=` no está implementado (la página `/blog` no filtra por `q`). Fix: quitar el bloque `potentialAction`.
- La home emite 3 objetos `Organization`. Fix: unificar en un solo `@graph` con `@id`.
- `app/page.tsx:226` define `WebSite.inLanguage: "es"` mientras la home está en inglés. Cambiar a `"en"` o `["en","es"]`.
- Los testimonios del landing usan `https://i.pravatar.cc/...` (`components/landing/sections/benefits-section.tsx:58,77`) con nombres inventados ("Alejandro M.", "Laura R."). Riesgo de confianza y de política de reseñas. Hotlink externo además.
- Los hubs (`/ftmo`, etc.) usan `WebPage`, `BreadcrumbList` y `FAQPage`. Correcto. El `FAQPage` ya no genera rich result para sitios no gubernamentales o de salud, pero es válido para LLMs.

### 9. MEDIO — Metadata global en español y keywords de LATAM
- `app/layout.tsx:19-33`: título y descripción por defecto en español y la keyword "trading journal LATAM". Cualquier página sin metadata propia hereda eso (login, register, legales).
- `llms.txt` (`public/llms.txt`) está casi todo en español. El mercado primario es inglés.
- Fix: título y descripción por defecto en inglés. Duplicar `llms.txt` o reescribirlo en EN con el bloque ES al final.
- Confirmar que `/login` y `/register` tengan `noindex` (el comentario de `app/sitemap.ts:84` lo afirma). No lo verifiqué en el HTML en vivo.

### 10. MEDIO — Sitemap con `lastModified: new Date()` y datos de prioridad ignorados
- `app/sitemap.ts`: todas las páginas estáticas devuelven la fecha del build, que cambia sin cambios reales. Google deja de confiar en `lastmod`.
- `changeFrequency` y `priority` los ignoran Google y Bing.
- Faltan `/es` hubs en el sitemap con `alternates`, `/privacy`, `/terms`, `/disclaimer` (opcionales).
- Fix: usar fechas fijas por página (constantes) y `post.updatedAt` en los posts. Retirar la entrada del problema 2.

## Core Web Vitals (inspección de código y HTML)
- LCP: el hero carga `https://img.youtube.com/vi/HX9NFOZTj3U/maxresdefault.jpg` con `<img>` simple y como `Link: rel=preload`. Es un recurso de un tercero sin dimensiones ni `fetchpriority` revisable. También precarga `i.pravatar.cc` (dos avatares) por encima del fold. Fix: poster propio en `/public` con `next/image` y `priority`; quitar el preload de pravatar y alojar los avatares localmente.
- INP: HTML de la home de 139 KB, con GA4 y el `SupportChat` cargados globalmente. Diferir `SupportChat` con `dynamic(..., { ssr: false })` o cargarlo al primer clic.
- CLS: las imágenes del hero de YouTube y de avatares usan clases de tamaño pero no `width/height`. Añadir `aspect-video` al contenedor.
- La home se sirve con `Cache-Control: private, no-cache, no-store`, así que no hay caché en CDN. Si la home es estática, revisar por qué se marca como dinámica (posible uso de `cookies()` o `headers()`, o `force-dynamic` en el árbol). El HTML estático en CDN mejora TTFB.
- No medí métricas de campo (CrUX/PageSpeed). Conviene correr PageSpeed Insights sobre `/`, `/ftmo` y un post.

## Seguridad y headers
- Presentes: HSTS (2 años), X-Frame-Options DENY, nosniff, Referrer-Policy, Permissions-Policy.
- Faltan: `Content-Security-Policy` y `includeSubDomains`/`preload` en HSTS. Prioridad baja para SEO.
- 404 correcto para rutas inexistentes. Las URLs con barra final redirigen 308 a la versión sin barra: correcto.

## Quick wins (menos de 1 hora cada uno)
1. `lang="en"` y `og:locale` en `app/layout.tsx:90,51` (5 min, ver problema 1).
2. Quitar `/blog/zentrade-vs-tradezella` del origen: renombrar o borrar el JSON y corregir el enlace en `/vs/tradezella` (15 min, problema 2).
3. Subir `public/og-image.png` y crear `app/manifest.ts` (15 min).
4. Quitar el doble "| Zentrade" en los 16 `seoTitle` (10 min).
5. Eliminar `aggregateRating` y `SearchAction` de `app/page.tsx` (5 min).
6. Añadir `x-default` a los `alternates.languages` de hubs y posts (20 min).
7. Añadir un footer con enlaces a los hubs y a `/vs/*` (30 min).
8. Usar fechas fijas en `app/sitemap.ts` (15 min).
9. Revisar el log del 500 en `/blog/og/[slug]` en Vercel (30 min).
10. Verificar que el archivo `public/334f8cd99c5442168464de9b300f8483.txt` sea la clave de IndexNow y enviar el sitemap a Bing Webmaster Tools.

## 15 keywords y páginas nuevas de alta intención

| # | URL propuesta | Keyword objetivo | Intención |
|---|---|---|---|
| 1 | `/tradovate-trading-journal` | tradovate trading journal | Comercial, con import CSV de Tradovate |
| 2 | `/topstepx-journal` | topstepx journal | Comercial, TopstepX es la plataforma actual |
| 3 | `/tools/apex-consistency-rule-calculator` | apex consistency rule calculator | Herramienta gratuita, captura leads |
| 4 | `/tools/topstep-consistency-target-calculator` | topstep consistency target calculator | Herramienta |
| 5 | `/tools/prop-firm-trailing-drawdown-calculator` | trailing drawdown calculator apex | Herramienta |
| 6 | `/ninjatrader-trading-journal` | ninjatrader trading journal | Comercial (ya hay post ES; falta la landing EN) |
| 7 | `/vs/tradervue` | tradervue alternative | Comparativa |
| 8 | `/vs/tradesviz` | tradesviz alternative | Comparativa |
| 9 | `/vs/tradezilla-alternative` (renombrar `/vs/tradezella` a inglés) | tradezella alternative for futures | Comparativa |
| 10 | `/uprofit-trading-journal` | uprofit trading journal | Comercial, con hub EN y ES |
| 11 | `/tradeify-trading-journal` | tradeify journal | Comercial, firma de futuros en alza |
| 12 | `/my-funded-futures-journal` | my funded futures journal | Comercial |
| 13 | `/rithmic-trade-import` | rithmic trade export csv journal | Informacional + producto |
| 14 | `/blog/apex-trader-funding-payout-rules` | apex payout rules 2026 | Informacional, alto volumen |
| 15 | `/blog/prop-firm-trading-journal-template` | prop firm trading journal template (xlsx/Google Sheets) | Informacional, descarga con captura de email |

Notas de ejecución:
- Las 15 deben nacer en inglés, con versión `/es/...` solo para las 6 primeras.
- Cada una necesita canonical, `hreflang` con `x-default`, `BreadcrumbList` y `FAQPage`, y enlace desde el footer y desde 2 o 3 posts relacionados.
- Verificar con datos de volumen antes de producir. Los volúmenes de TopstepX, Tradeify y MyFundedFutures los asumo, no los medí.

## Qué no pude verificar
- Métricas de campo (CrUX / PageSpeed).
- Si `/login` y `/register` llevan `noindex` en el HTML en vivo.
- La causa exacta del 500 en la route OG (se necesita acceso a logs de Vercel).
- Indexación real en Search Console.
