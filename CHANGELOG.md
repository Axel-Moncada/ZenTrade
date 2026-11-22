# Changelog — Zentrade

Registro de cambios para que cualquier sesión de Claude (Claude Code, Claude web o la app) tenga el contexto real del producto.
**Regla**: cada sesión de trabajo que cambie código, estrategia o contenido agrega una entrada arriba (la más reciente primero).
Formato: fecha · qué se hizo · archivos clave · pendientes o decisiones.

---

## 2026-11-22 (cierre) — Pauta activada

- Merge de los PR #15 (posts de la semana), #16 (tracking) y #17 (emails CAN-SPAM). Smoke test en producción: la cookie `zt_attr` se crea con UTMs (90 días, Secure, HttpOnly), `/unsubscribed` responde 200 y la API de baja rechaza tokens inválidos (400).
- **Google Ads:** la cuenta importa conversiones desde GA4 (no hace falta el tag `AW-`). Se encontró que las 3 conversiones principales de "Registro" eran **cargas de página de `/dashboard`** con recuento "Todas", es decir, contaban cada visita de usuarios existentes. El fundador las pasó a secundarias e importó `sign_up` (recuento: una) y `purchase` (valor de GA4) como principales.
- Variables de Vercel: `COMPANY_POSTAL_ADDRESS` (obligatoria para enviar broadcasts). `NEXT_PUBLIC_GOOGLE_ADS_ID` no se usa por ahora.

---

## 2026-11-22 (noche, 6) — Emails de marketing: cumplimiento CAN-SPAM + emails de hoy

### Problema
El broadcast del admin no tenía link de baja, header de baja de un clic ni dirección postal (CAN-SPAM y requisitos de Gmail/Yahoo para envíos masivos), el footer estaba en español y `profiles.locale` tiene default `'es'`, así que usuarios de EE. UU. recibían la versión en español.

### Hecho
- **Migración `supabase/026_email_unsubscribes.sql`** (aplicar en producción): tabla `email_unsubscribes` (RLS sin políticas, solo service role) y default de `profiles.locale` → `'en'`.
- `lib/email/unsubscribe.ts`: token HMAC por email (`EMAIL_UNSUBSCRIBE_SECRET`; si falta, se deriva de la service key), URL de baja y registro (también marca `newsletter_subscribers.status = 'unsubscribed'`). Tests en `tests/unsubscribe.test.ts`.
- `/api/email/unsubscribe`: GET (link del footer → página `/unsubscribed`) y POST (baja de un clic, RFC 8058).
- `lib/resend/send-broadcast.ts`: **solo inglés**; filtra las bajas y la newsletter dada de baja; footer en inglés con link de baja por destinatario + dirección postal; headers `List-Unsubscribe` y `List-Unsubscribe-Post`. **Se niega a enviar si falta `COMPANY_POSTAL_ADDRESS`** (el admin ve el error).
- `docs/marketing/emails/2026-11-22.md`: newsletter "The trade after the loss" (`all`) y "Your prop firm rules, re-verified for 2026" (`paying`), con UTMs; envío recomendado el lunes 23 a las 8:00 AM ET.

### Pendientes del fundador
- Configurar `COMPANY_POSTAL_ADDRESS` (y opcionalmente `EMAIL_UNSUBSCRIBE_SECRET`) en Vercel. CAN-SPAM acepta un apartado postal o una dirección de buzón comercial.
- Aplicar la migración 026.

---

## 2026-11-22 (noche, 5) — Tracking para la pauta (PROMPT-TRACKING-PAUTA.md)

- **Migración `supabase/025_signup_attribution.sql`** (aplicar en producción): columnas `utm_*`, `gclid`, `fbclid`, `landing_path`, `country`, `signup_locale`, `signup_method` y `signup_tracked_at` en `profiles`. Los usuarios existentes quedan marcados como ya contados.
- **Cookie `zt_attr` (90 días, httpOnly) desde `middleware.ts`**: first-touch, salvo que llegue un gclid o fbclid nuevo; país desde `x-vercel-ip-country`. Lógica pura en `lib/analytics/attribution.ts` con tests (`tests/attribution.test.ts`). Se eliminó la captura en cliente (`attribution-capture.tsx` y `localStorage`).
- **Registro completado = callback de auth** (`/api/auth/callback`, que cubre la confirmación del email y Google OAuth): `lib/analytics/save-signup-attribution.ts` copia la atribución al perfil una sola vez (cookie o, si falta, `user_metadata` guardado al registrarse) y agrega `?signup=email|google`. `components/analytics/signup-tracker.tsx` dispara `sign_up` en el dashboard y limpia la URL. Ya no se dispara `sign_up` al enviar el formulario (antes contaba registros sin confirmar).
- **`begin_checkout`** al abrir el checkout y **`purchase`** al confirmar PayPal (valor según `PAYPAL_PRICES_USD`, `transaction_id` = ID de la suscripción para deduplicar). `/api/paypal/confirm` devuelve `interval` y `value`. Meta: `InitiateCheckout` / `Purchase` / `CompleteRegistration` si hay pixel.
- **Google Ads**: `NEXT_PUBLIC_GOOGLE_ADS_ID` (`AW-` + dígitos) carga el config con el mismo gtag; las conversiones se importan desde GA4.
- Pendiente: Measurement Protocol para `purchase` cuando solo llega el webhook (el usuario no vuelve a la página de billing).

---

## 2026-11-22 (noche, 4) — Contenido de la semana del 23 al 29 de noviembre

- Los posts ya estaban programados por `publishedAt` (el blog revalida cada hora): `tradezella-alternatives-2026` (jue 26) y `apex-consistency-rule-explained-2026` (dom 29). El de TopstepX salió hoy.
- **`tradezella-alternatives-2026`**: decía que Edgewonk es "one-time license" (es un plan anual de ~$197, verificado en `/vs/edgewonk`). Se agregó TraderSync a la tabla (desde $29.95/mes) y el plan gratis de Tradervue. Las "AI discipline tools / risk rule alerts" pasan a ser las funciones reales de ZenMode (Copiloto, revenge trading, ZenCoach, reporte semanal). Enlaces a las 4 comparativas `/vs/*`.
- **`topstepx-trading-journal-track-topstep-combine`**: el Daily Loss Limit se presenta como opcional según la plataforma y lo elegido al comprar (antes afirmaba que no existe en TopstepX). "AI revenge trading detection" pasa a ser el Copiloto + revenge trading.
- El post de Apex se revisó y está bien (coincide con el hub verificado).
- Calendario: se corrigió el hilo de X de TradeZella (Edgewonk anual, no pago único).

---

## 2026-11-22 (noche, 3) — Sitio público solo en inglés + logos reales en los trust badges

- **Idioma por zona** (`lib/i18n/context.tsx`, `zoneLocale`): las páginas públicas siempre salen en inglés, `/es/*` en español y `/dashboard/*` según la preferencia guardada. Se quitó la auto-detección por `navigator.language`.
- Navbar público sin selector de idioma ni de tema (`LandingControls` sigue en el sidebar del dashboard).
- Trust badges: logo de PayPal y tira de logos de FTMO, Apex, Topstep, Tradoverse y Uprofit recortados del banner del fundador (`public/assets/paypal-badge.webp`, `public/assets/prop-firm-logos.webp`). Se mantiene "Built for the rules of" (el banner decía "Works with", y no hay integración) y se agrega el aviso "Trademarks belong to their owners. Zentrade is not affiliated with or endorsed by these firms.".
- CLAUDE.md: regla de idioma actualizada.
- YouTube: canal en inglés `@Zen-traderr` en el JSON-LD y en `llms.txt` (PR #13).

---

## 2026-11-22 (noche, 2) — Limpieza post-landing

- Se borró `components/landing/sections/preview-section.tsx` (demos de YouTube en español; ya no se usaba desde el PR #11).
- `components/shared/trust-badges.tsx`: el logo de PayPal (azul oscuro) era invisible sobre el fondo `#003087` → fondo blanco. "Works with / Compatible con" → "Built for the rules of / Hecho para las reglas de", porque no hay integración con FTMO, Apex, etc.: solo se configuran sus reglas.
- Se mantiene el enlace al canal de YouTube `@Zen-trade_Latam` en el JSON-LD y en `llms.txt` (es una señal de entidad de marca). Hay que cambiarlo cuando exista un canal en inglés.

---

## 2026-11-22 (noche) — Landing nueva para la pauta en EE. UU.: "Replay this day"

### Contexto
- Diseño hecho con Claude Design (carpeta local `secciones nuevas/`, sin commitear: prompt, prototipo y video). Objetivo: que el tráfico pagado sienta su dolor en 8 segundos (perdió la cuenta por el trade de venganza y tuvo que pagar el reset).

### Hecho
- **Orden nuevo de `app/page.tsx`**: ReplayHero → ResetCalculator → AdVideo → RulesShowcase → AI features → Features → Benefits (solo reseñas reales) → Pricing → FAQ → FinalCta. Salieron Hero, Problem, Solution, Preview (demos de YouTube en español) y el CTA viejo; los archivos se conservan.
- `components/landing/sections/replay-hero.tsx` + `components/landing/replay/replay-engine.ts`: gráfica SVG animada de un día FAIL (revenge → piso roto → "EVAL FAILED") y un día SAVE (alerta del Copiloto → cuenta viva). Cuenta demo de 50K con **trailing de $2,000** (regla verificada de Apex; el prototipo usaba $2,500). El texto de la alerta es el **real** del Copiloto (pausa de 15 min tras una pérdida + distancia al piso). Respeta `prefers-reduced-motion`, se pausa si la pestaña está oculta o la tarjeta sale de la pantalla, y aclara: "The Copilot reacts to the trades you log in Zentrade" + "Live Copilot included in ZenMode".
- `reset-calculator.tsx`: resets × precio → "Lost to resets" + "That's N months of ZenMode" ($59).
- `ad-video.tsx`: video comprimido de 16 MB → **2.2 MB** (`public/videos/zentrade-ad.mp4`) + poster WebP; `preload="none"`, carga y reproduce solo en viewport, botón de sonido. JSON-LD `VideoObject` del anuncio (reemplaza los dos videos en español).
- `rules-showcase.tsx`: scroll tipo Apple (bloques + panel sticky en desktop; tarjetas en móvil). Los paneles son **UI en código con datos demo** que replica los widgets reales (no había capturas en inglés; se pueden cambiar por `<Image>`).
- `final-cta.tsx`: "Same trader. Same strategy. One alert."
- **Medición**: `lib/analytics/track.ts` (`cta_click`, `replay_save_started`, `calculator_used`, `video_play`, `sign_up` → gtag y fbq si existen) y `lib/analytics/attribution.ts` (UTM + gclid + fbclid first-touch en localStorage/cookie). `/api/auth/register` guarda `attribution` y `signup_country` (header `x-vercel-ip-country`) en `user_metadata` (validado con Zod). El error 500 del registro ahora sale en inglés.
- Navbar: "Nosotros" fijo en español → "About" en inglés; el CTA ahora es "Start Free" y lleva a `/login?mode=register` (antes llevaba al login).
- Verificado: `tsc`, lint y build OK; sin scroll horizontal en 390, 768 y 1440 px (emulación con CDP).

### Pendientes
- Capturas reales en inglés para RulesShowcase (opcional) en `public/landing/rules/*.webp`.
- `sign_up` con Google OAuth no se mide (solo email): detectar el usuario nuevo en `/api/auth/callback`.
- Marcar `sign_up` como conversión en GA4 y Google Ads e importarla; agregar el Meta Pixel si se va a pautar en Meta.
- La sección AI features dice "The AI That Trades Alongside You": la IA no opera; revisar el copy.
- IndexNow devuelve 403 (`UserForbiddedToAccessSite`) aunque la clave se sirve bien: verificar el sitio en Bing Webmaster Tools.

---

## 2026-11-22 (tarde) — Guías "how to pass" (EN) con reglas verificadas + fix del deploy

### Hecho
- **Deploy de producción roto**: el merge del PR #9 falló en Vercel por `react/no-unescaped-entities` (dos `'` en `app/topstep/page.tsx`). Corregido con `&apos;`.
- `how-to-pass-apex-trader-funding`, `how-to-pass-ftmo-evaluation` y `how-to-pass-topstep-evaluation` reescritas con las mismas reglas verificadas de los hubs (22-nov-2026), callout con la fecha, enlace a la fuente oficial y al hub. `updatedAt` = 2026-11-22.
  - **Apex**: la tabla de 6 tamaños (trailing de $2,500 en la 50K, falso) se reemplazó por la de 50K verificada. El ejemplo del trailing ahora usa la 50K. Consistencia: ninguna en la evaluación y 50% en PA para payouts. Límite de 30 días y sin mínimo de días. Se quitó "keep up to 90%".
  - **FTMO**: el 2-Step no tiene consistencia (antes decía 30%). El mínimo es de 4 días (antes decía 10). El max loss es **estático** en el 2-Step y trailing EOD en el 1-Step (antes decía "trailing" en general). Best Day Rule del 50% en el 1-Step. Ejemplos con una cuenta de $100K. Se quitaron, por no estar verificados: el 80/20, "up to $200K", "Mentor program", "tens of millions", la cuenta de $50K y las reglas de overnight.
  - **TopStep**: consistency target del 55% que **sube el objetivo** (antes decía "30% y se anula"). Maximum Loss Limit trailing EOD (antes decía intraday). DLL opcional de $1,000 / $2,000 / $3,000. Se quitaron, por no estar verificados: la "prohibición de operar noticias", el split 90/100%, los fees mensuales y "sin mínimo de días". MLL de 100K y 150K = "Check Topstep" (no verificado). El dato del 16.8% lleva su enlace.
  - Afirmaciones falsas del producto y de la competencia: "AI-powered revenge trading detection… before you take the trade" (es por reglas: <30 min tras una pérdida o 3+ pérdidas seguidas, y solo ZenMode); "TradeZella no tiene consistency tracker" y "Edgewonk es de escritorio" (bloque eliminado).
- `components/accounts/account-form.tsx`: se agregó la opción **55%** al umbral de consistencia, porque los hubs prometen el check del 55% de TopStep y el selector llegaba solo a 50% (el esquema y la BD ya aceptaban hasta 100).

### Pendientes
- Decidir si se **fusionan** las guías "how to pass" con los hubs (`data/ZENTRADE-SEO-STUDY.md` §126 las marca como canibalización).
- Las guías en español (`como-pasar-*`, `pasos-evaluacion-ftmo`, `regla-consistencia-ftmo-explicada`…) siguen con las reglas viejas (FTMO 30%, etc.).
- Verificar el MLL de las cuentas TopStep de 100K y 150K y las reglas de noticias de TopStep (la consulta `topstep cpi rules` aparece en GSC).

---

## 2026-11-22 (mañana) — SEO: reglas 2026 verificadas en los hubs de Apex, TopStep y FTMO (PR #9)

### Hecho
- **Apex** (`app/apex-trader-funding`, `app/es/apex-trader-funding`): la consistencia del 50% aplica en las Performance Accounts para los payouts (antes decía "sin consistencia"; las cuentas viejas pueden seguir con el 30%). Cifras de la cuenta 50K en dólares: objetivo $3,000, trailing $2,000 y DLL de $1,000 solo en la evaluación EOD.
- **TopStep** (`app/topstep`, `app/es/topstep`): consistency target del 55% (actualizado en sep-2026; si se pasa, el objetivo sube a mejor día / 0.55), Maximum Loss Limit EOD trailing y Daily Loss Limit opcional.
- **FTMO** (`app/ftmo`, `app/es/ftmo`): el 2-Step no tiene consistencia; el 1-Step tiene la Best Day Rule del 50% y daily loss del 3%. Sin límite de tiempo.
- Cada hub muestra la fecha de verificación (22-nov-2026) y un enlace a la fuente oficial. Presets de `components/tools/consistency-calculator.tsx` alineados.
- Estudio SEO del fundador en `data/ZENTRADE-SEO-STUDY.md`.

### Pendientes
- Pasar estas mismas reglas a las guías "how to pass" del blog.

---

## 2026-11-22 (noche) — GEO/SEO: herramientas gratis, comparativas nuevas, posts sin "2025" y consolidación

### Contexto
- Prueba de búsqueda: los buscadores no devuelven nada para "Zentrade trading journal" y en "best trading journal for prop firms" aparecen TradeZella, TradesViz, TraderWaves, Silo y listicles de afiliados. Autoridad de marca = el cuello de botella (auditoría GEO: 30/100).
- TradeZella tiene **Prop Firm Sync** (sincroniza drawdown y límites con Apex, TopStep y FTMO): ya no se puede decir "el único journal con reglas de prop firm".

### Hecho
- `llms.txt` / `llms-full.txt`: ya no dicen "the app UI is currently in Spanish"; agregan Copiloto de Disciplina, ZenCoach, política de reembolso de 7 días, precios de TradeZella 2026, herramientas y comparativas nuevas (PR #7, pendiente de merge).
- **Herramientas gratis** (activos para enlaces y citas de IA): `/tools`, `/tools/consistency-rule-calculator` (`lib/tools/consistency.ts` + tests), `/tools/trailing-drawdown-calculator` (usa `lib/utils/drawdown.ts`), `/trading-journal-template` con la plantilla Excel/Sheets `public/downloads/zentrade-trading-journal-template.xlsx` (stats, piso trailing, consistencia y P&L diario con fórmulas). Schema WebApplication/DigitalDocument/HowTo/FAQ. Reglas de firmas como presets editables con "verifica con tu firma".
- **Comparativas nuevas**: `/vs/tradersync` y `/vs/tradervue` (componente `components/vs/comparison-page.tsx`). `/vs/tradezella` reconoce Prop Firm Sync y la sincronización con brokers.
- **Posts**:
  - `best-trading-journal-prop-firms` reescrito en formato GEO: precios verificados de nov-2026 con fuentes, 5 FAQ, "Key takeaways". Se quitaron las afirmaciones falsas: "the only journal", "TraderSync no tiene IA", "Edgewonk es de escritorio", "85% fail", "FTMO 30%", import desde MetaTrader.
  - `best-futures-trading-journal`: quitado Sierra Chart, la "queja más común" inventada y "Starter incluye import CSV" (es Pro).
  - `best-prop-firms-futures-traders`: título sin año y aviso de "verifica las reglas", porque las reglas de 2026 no se verificaron.
  - Las guías "how to pass" de Apex, FTMO y TopStep y la de max daily loss quedan sin año y con aviso. Los conceptuales también quedan sin año.
  - "85% fail" (sin fuente) → dato publicado por TopStep (16.8% de Combines completados en 2025) con enlace a `why-most-traders-fail-prop-firm-evaluations`.
- **301**: los 3 slugs con "-2025" pasan a slugs estables. Las comparativas del blog `zentrade-vs-tradezella-comparison` y `zentrade-vs-edgewonk-comparison` se consolidan en `/vs/*`, para evitar canibalización y precios viejos. Enlaces internos, `relatedSlugs`, hreflang y `llms` actualizados.
- `lang="es"` en las páginas `/es/*` y en los posts en español (el `<html>` sigue en `en`).
- Footer: columnas "Compare" (4 comparativas) y "Free tools". Sitemap con las URLs nuevas.
- **IndexNow**: clave `public/2d613df4c8ef3a57663c043917582bd0.txt` + `scripts/indexnow.mjs`. Correrlo después de cada deploy con contenido nuevo (`node scripts/indexnow.mjs`).

### Pendientes
- Hacer merge de los PR #7 y #8 y luego correr `node scripts/indexnow.mjs`.
- Posts en español con "2025" (12) y afirmaciones sin verificar en `/es/vs/*`.
- Verificar las reglas 2026 de Apex, TopStep y FTMO para refrescar las guías "how to pass" con fecha real.
- Fuera del sitio (lo que más pesa): YouTube en inglés, Reddit, Trustpilot/G2/Capterra/AlternativeTo/SourceForge, listicles y afiliados; medir 12 prompts al mes.

---

## 2026-11-22 (tarde) — English-first fase 2: toda la app en inglés + reembolso en 7 días + fuera testimonios falsos

### Decisiones del fundador (tatuadas en CLAUDE.md)
- **English-first obligatorio**: un usuario de EE.UU. nunca ve español (UI, toasts, errores, emails, CSV, PDF, metadata, JSON-LD). Copy pensado para convertir, sin prometer nada que el código no haga.
- **Cobro desde el día 1, sin free trial.** El cliente puede **solicitar un reembolso por escrito** a support@zen-trader.com **dentro de 7 días** del primer pago y el fundador decide caso por caso. Prohibido escribir "free trial", "money-back guarantee" o "no questions asked" (con cobro desde el día 1 serían publicidad engañosa y disparan disputas en PayPal).

### Reembolsos y legal
- Política de reembolsos reescrita (ES/EN): PayPal (antes decía Wompi), ventana de solicitud de 7 días, excepciones (cobro duplicado, caída >72 h).
- Insignias del checkout: "15-day guarantee, no questions asked" → "7-day refund window · Request it by email". FAQ de pricing alineada.
- Wompi → PayPal en términos, privacidad y FAQ. Metadata de términos, privacidad, cookies, disclaimer y reembolsos en inglés.

### Testimonios y promesas falsas eliminadas (FTC)
- Hero: testimonio inventado "Marcus T." eliminado. Sección de solución: cita inventada "Carlos M." → frase de producto. Testimonios de ejemplo con fotos de pravatar: eliminados (sin reseñas reales aprobadas no se muestra la sección). Badge "The Only Futures Journal…" → sin superlativo.
- Tarjetas de precios: ZenMode ya no promete benchmark, coaching 1-a-1, soporte 24/7 ni alertas de tamaño de posición; ahora lista Copiloto de Disciplina, revenge trading, ZenCoach, reporte semanal y Radar. Ahorro anual de Starter corregido ($24, no $22).
- CTA final: "AI active immediately" y "revenge trading from day one" (solo es ZenMode) → beneficios reales del plan Free.
- `free-plan-welcome`: decía que Starter desbloquea import CSV, PDF y dashboard completo (es Pro). Corregido.

### Traducción de la app (bilingüe, inglés primero)
- Helpers nuevos: `lib/i18n/use-tr.ts` (`tr(es, en)`), `components/shared/t.tsx` (`<T es en />` para Server Components), `lib/constants/trade-labels.ts` (emociones y razones de salida bilingües; las claves de BD siguen en español).
- Labels bilingües: `types/accounts.ts` (tipo, estado, drawdown), `types/trading-plan.ts` (días), `lib/utils/date-helpers.ts` (meses/días con `locale`), `data/trading-quotes.json` (`quotes_en`).
- Traducidos: cuentas (tarjeta, formulario, selector), trades (formulario, tarjeta, lista, tabla, filtros, capturas, importador CSV), calendario (header, celdas, leyenda, modal del día, fotos), dashboard (gráficas, tablas, selector de fechas, stat cards), trading plan (formulario, página, **PDF**), retiros, backtesting, páginas del dashboard (cuentas, import, trading plan, perfil, backtesting, sesión en vivo), logout, 404, soporte, newsletter y preview del landing.
- **ZenCoach respondía siempre en español**: ahora responde en el idioma del usuario (inglés por defecto). El resumen de sesión también.
- Bugs de paso: el filtro de emociones ofrecía valores que nunca se guardan (`venganza`, `euforia`…), corregido con la lista compartida. `updateFilter` ya no usa `any`.

### Público / SEO
- `/about` reescrito en inglés para EE.UU. (con `<T>`, ES disponible).
- `/vs/tradezella` y `/vs/edgewonk` reescritos en inglés con componente compartido `components/vs/comparison-page.tsx`. Solo datos verificables y fechados: TradeZella $35/$59/$99 (desde 14-jul-2026, sin plan gratis); Edgewonk ~$197/año, sin plan gratis, garantía de 14 días. No se afirma que la competencia "no tiene" una feature.
- Versiones en español movidas a `/es/vs/*` (canonical + hreflang; precios corregidos; quitada la fila dudosa "Edgewonk = software desktop"). Sitemap actualizado.
- `/blog`: metadata e índice en inglés; los posts en español van en una sección "Artículos en español" al final. Categorías, fechas, callouts y "Related articles" según el idioma de cada post.
- Verificado con el build de producción: 13 páginas públicas sin texto ni metadata en español (control `/es/vs/tradezella`: 45 líneas en español).

### Pendientes
- **Demos en video del landing están en español** (YouTube): grabar demos en inglés para la pauta.
- Recorrido manual logueado con navegador en inglés (la zona autenticada no se pudo escanear automáticamente).
- Las páginas `/es/vs/*` conservan afirmaciones viejas sin verificar sobre features de la competencia ("No" en revenge trading, etc.): revisar o suavizar.
- Admin y herramientas internas de marketing siguen en español (solo las ve el fundador).
- `components/dashboard/zencoach/zen-coach-widget.tsx` es código muerto (no se importa): borrar.

---

## 2026-11-22 — English-first (fase 1): embudo de pago en inglés + promesas falsas corregidas

### Contexto y decisión
- Decisión del fundador: **toda la pauta va a EE.UU.**, así que el producto pasa a ser *English-first*. El español se mantiene como idioma secundario (rutas `/es/*`, posts en español, usuarios con el navegador en español), pero un usuario gringo no debe ver ni una palabra en español.
- Git: el pull desde el laptop había quedado a medias (merge en conflicto). `main` quedó igual a `origin/main`; los 2 commits viejos de PayPal del desktop se guardaron en la rama `backup/desktop-paypal-2026-11-19` (incluye `POST /api/admin/paypal-sync`, que no está en `main`).

### Promesas falsas encontradas (riesgo FTC y de chargebacks con la pauta)
- **"14-day free trial on all plans"** en hero, pricing, FAQ y la política de reembolsos. **No existe**: los planes de PayPal cobran desde el día 1 (`tenure_type: 'REGULAR'`). Copy cambiado a "Free plan forever" en ES y EN; la política de reembolsos ahora se apoya en el plan gratuito. **Decisión: implementar una prueba real** (ver ROADMAP).
- Importación desde **MT5 y TradingView**: no existe. Ahora dice NinjaTrader, Rithmic, Tradovate o cualquier plataforma con la plantilla CSV. "Tradoverse" aparecía como plataforma de import (es una prop firm): cambiado a Tradovate.
- Email de bienvenida y tabla de planes prometían "coaching 1-a-1", "análisis de horario óptimo" y "benchmark vs prop firm" como incluidos: en la tabla quedan como *Coming soon*; en el email se quitaron.
- Tarjeta de upgrade: el precio anual se calculaba como `mensual × 0.8` (Pro mostraba $23/mes en vez de $20.75). Ahora usa los precios reales y el % de ahorro de cada plan.

### Traducido / bilingüe
- **Emails**: bienvenida/upgrade (`lib/resend/send-welcome-email.ts`) 100% en inglés. Broadcasts y suscriptores del newsletter asumen `en` por defecto; el editor de emails del admin abre en EN.
- **API**: ~70 mensajes de error y validaciones Zod (`app/api/**`, `lib/validations/*`) en inglés. Las herramientas internas de marketing del admin (`app/api/agents/*`) siguen en español.
- **CSV**: plantilla de importación y export en inglés; el importador acepta encabezados en inglés y en español, y "Followed Plan" acepta yes/si/y/true.
- **Login/registro** (`app/login/page.tsx`) bilingüe. `/register` ahora abre el tab de registro (`/login?mode=register`). Botón de Google bilingüe.
- **SEO**: JSON-LD de la home (`app/page.tsx`) y `/pricing` (metadata, FAQ schema y encabezado) en inglés; `areaServed` prioriza EE.UU.
- **Billing** (`app/dashboard/billing/page.tsx`, `components/billing/*`): features por plan `{ es, en }`, toda la UI del dashboard de facturación, el modal de pago exitoso e insignias de confianza.
- `UpgradePrompt`: bilingüe y `message` acepta `{ es, en }` (actualizados sus 8 usos). `PlanFeatures`: bilingüe. Alerta de revenge trading: bilingüe. Sidebar: labels del admin.

### Pendientes
- **Fase 2 del barrido**: ~33 componentes de la app no tienen ningún soporte de idioma (cuentas, trades, calendario, dashboard, trading plan, retiros, backtesting) y otros están a medias (`import-csv`, `zencoach-widget`, `day-modal`, `trading-plan-form`, `date-range-selector`).
- Páginas públicas aún en español: `/about`, `/vs/tradezella`, `/vs/edgewonk` (además con títulos de 2025).
- **Contradicción por resolver**: las insignias del checkout prometen "15-day guarantee, no questions asked" y la política de reembolsos dice "no refunds".
- `send-welcome-email.ts` ya no registra el email del usuario en los logs.

---

## 2026-11-20 (tarde) — PayPal: webhook ID y upgrades manuales

- `PAYPAL_WEBHOOK_ID` en Vercel actualizado al ID del webhook Live de la app **Zentrade** (`7H498690W16324910`) y producción republicada. Hay dos apps en PayPal (Zentrade y Activation_App); el sitio usa Zentrade.
- `lib/paypal/activate-subscription.ts`: si una suscripción tiene un upgrade manual del admin (`variant_id` empieza por `manual_override`), los eventos de PayPal extienden fechas pero no bajan el plan. Caso Walter: ZenMode regalado mientras paga Pro.
- Test: `tests/paypal-override.test.ts`.
- Pendiente: ligar la fila de Walter a su suscripción de PayPal de $29 (`I-...`) y cancelar en PayPal la de $9 (12-nov), que sigue activa.

---

## 2026-11-20 — QA end-to-end y correcciones de fase 1 (antes de pautar)

### Contexto
- QA completo plan por plan (Free → Starter → Pro → ZenMode) con una cuenta de prueba (`yigami5522@anonmart.com`), en el navegador y verificando en Supabase.
- Detonante: Walter (primer cliente) pagó el upgrade a Pro y su plan no cambió. Su fila en `subscriptions` era manual desde septiembre: **ningún pago de PayPal se ha registrado solo**.

### Correcciones (rama `fix/qa-fase-1`)
- **Pagos PayPal** — `lib/paypal/activate-subscription.ts` (nuevo, compartido por webhook y confirmación), `app/api/paypal/confirm/route.ts` (nuevo), `components/billing/billing-dashboard.tsx`, `app/dashboard/billing/page.tsx`:
  - Al volver de PayPal (`?subscription_id=I-...`) la app consulta PayPal y activa el plan. Ya no depende solo del webhook. Idempotente.
  - Al cambiar de plan se cancela en PayPal la suscripción anterior (antes quedaban dos cobros activos).
  - `cancel_url` usaba `cancelled` y la página leía `canceled`.
  - Cron `check-subscriptions` + `lib/paypal/reconcile.ts`: antes de expirar una suscripción de PayPal se consulta PayPal; si sigue ACTIVE (renovación cobrada, webhook perdido) se extiende.
- **ZenCoach** — `app/api/ai/chat/[id]/route.ts`, `app/api/ai/chat/trial/route.ts`, `lib/ai/zencoach-context.ts`, `lib/ai/zencoach-trial.ts` (nuevo), `components/zencoach/zencoach-widget.tsx`:
  - Errores de Gemini capturados (503 con código) en vez de 500 sin manejar.
  - Historial saneado para Gemini (empieza en `user`, roles alternados): un mensaje fallido dejaba el chat roto para siempre.
  - ZenCoach recibe la fecha y hora actual en la zona horaria del trader ("no tengo acceso a la fecha").
  - `[id]` verifica ZenMode en el servidor.
  - La prueba gratis se controla en el servidor (tabla `zencoach_trials`: 5 min + 15 mensajes). Antes era solo `localStorage` y el endpoint no tenía límite.
  - Mensajes claros por caso: prueba terminada, requiere ZenMode, sesión expirada, IA no disponible.
- **Importador CSV** — `lib/utils/csv-date.ts` (nuevo) + `components/trades/import-csv.tsx`: NinjaTrader en inglés (MM/DD) entraba como DD/MM (11/05 → 11 de mayo; 11/13 → mes 13). Ahora el orden se detecta por archivo y las fechas imposibles se descartan con aviso.
- **Signos negativos** — `lib/utils/format-money.ts` (nuevo) en dashboard, hero card y backtesting: P&L −220 salía "$220.00".
- **Fechas un día antes** — `parseISODate` para fechas `YYYY-MM-DD` en tabla de trades, curva de capital, W/L por día y tarjeta de cuenta (`new Date('2026-11-20')` es UTC → 19 nov en Bogotá).
- **Drawdown trailing** — `lib/utils/drawdown.ts` (nuevo), `app/api/accounts/route.ts` (`peak_balance`), `components/accounts/account-card.tsx`, `lib/live-session/*`: trailing se calculaba como estático. Ahora el piso sigue el pico de balance y se congela en el balance inicial.
- Tests nuevos: `tests/csv-date.test.ts`, `tests/format-money.test.ts`, `tests/drawdown.test.ts`.

### Migración
- `supabase/024_qa_fixes.sql`: tabla `zencoach_trials` (RLS sin políticas), `revoke execute` de `handle_new_user`, `search_path` fijo en 8 funciones. **Ejecutar antes o junto con el deploy.**

### Pendientes / decisiones
- Verificar `PAYPAL_WEBHOOK_ID` y la URL del webhook en el dashboard de PayPal (live): todo indica que nunca ha funcionado.
- Revisar si Walter tiene dos suscripciones activas en PayPal ($9 de septiembre + $29) y cancelar la vieja.
- Apex congela el trailing en balance inicial + $100: parametrizar por prop firm (verificar fuente).
- Regla de consistencia: hoy se mide por trade; Apex/Topstep la miden por día.
- Fase 2: gating del dashboard (Free/Starter ven todo), promesas de precios vs producto, instrumentos basura globales, importador bilingüe.

---

## 2026-11-19 — Copiloto de Disciplina, SEO/GEO, contenido y reseñas reales

### Contexto y estrategia
- Hay un cliente que lleva ~4 meses pagando y subió a Pro el 2026-11-18. No respondió a la solicitud de entrevista.
- Investigación de TradeZella: crece sobre todo con afiliados e influencers, comunidades y una marca fuerte (~72% de su tráfico es directo). Sus quejas: sincronización con el broker, auto-tagging con IA poco fiable, precio, no hay prueba gratis y renovaciones inesperadas.
- Idea del fundador: un copiloto con IA que vea la pantalla. Se cambió el enfoque a **disciplina en vez de señales**, para no competir con el AI Copilot de TradingView (oct 2026) ni dar asesoría de inversión no registrada (CFTC/NFA).
- Plan de 90 días en `ROADMAP.md`.

### Copiloto de Disciplina — "Sesión en Vivo" (ZenMode) · commit `6a113b0`
- Página `/dashboard/live-session` y enlace en el sidebar (ES/EN). Los usuarios que no son ZenMode ven el UpgradePrompt.
- Motor de reglas puro `lib/live-session/discipline-rules.ts`: límite diario (aviso al 70%, alto al 100%), objetivo diario, regla de consistencia, máximo de trades, racha de pérdidas, pausa de 15 min tras pérdida, horario y días del plan, instrumento permitido, drawdown restante y trade fuera del plan.
- Ventana flotante siempre encima con Document Picture-in-Picture (`lib/hooks/useDocumentPip.ts`), solo en Chrome y Edge.
- Registro rápido de trades (reutiliza `POST /api/trades`), pitido y notificación del navegador en las alertas rojas.
- `GET /api/live-session` con Zod, verificación de ZenMode y RLS. El cargador está en `lib/live-session/get-live-session-data.ts`.

### SEO, GEO y contenido · commit `05ef5a8`
- `html lang="en"`, metadata global en inglés, `public/og-image.png` (generado con PIL) y `app/manifest.ts`.
- Se eliminó el `AggregateRating` falso (4.9 / 87) y el `SearchAction` que no funcionaba. **Decisión: no usar ratings ni reseñas inventadas** (regla de la FTC de 2024 y política de Google).
- El post ES de TradeZella cambió a `zentrade-vs-tradezella-es`, porque la URL vieja redirigía y rompía el sitemap y el hreflang.
- Se quitó el "| Zentrade" duplicado en 16 `seoTitle` y se añadió `x-default` en el hreflang.
- Sitemap con fechas fijas y `revalidate` diario. Footer con enlaces a los hubs de prop firms y a `/vs/*`.
- Blog: ya no intenta crear carpetas en el filesystem de solo lectura de Vercel, y `outputFileTracingIncludes` incluye `data/blog/posts`.
- `robots.ts` con los crawlers de IA permitidos explícitamente; `public/llms.txt` reescrito y `public/llms-full.txt` nuevo.
- 6 posts en inglés programados: Tradovate journal (19 nov), TopstepX journal (22 nov), alternativas a TradeZella (26 nov), regla de consistencia de Apex (29 nov), por qué fallan las evaluaciones (3 dic), rutina de pérdida diaria (6 dic).
- Reportes: `docs/seo/2026-11-technical-audit.md` (58/100), `docs/seo/2026-11-geo-audit.md` (58/100). Calendario de redes: `docs/marketing/2026-11-content-calendar.md`.

### Sistema de reseñas reales
- Migración `supabase/023_reviews.sql`: tabla `reviews` (una por usuario; RLS: el usuario solo crea o edita la suya y siempre queda `pending`), `profiles.review_prompted_at` y la audiencia de email `paying`. **Hay que ejecutarla en Supabase.**
- Tarjeta flotante dentro de la app (`components/reviews/review-prompt.tsx`), montada en `app/dashboard/layout.tsx`. Aparece con 10 o más trades, 7 o más días de cuenta, sin reseña previa, y como máximo 1 vez cada 30 días.
  - 4–5 ⭐ → testimonio + permiso para publicarlo + Trustpilot (`NEXT_PUBLIC_TRUSTPILOT_REVIEW_URL`).
  - 1–3 ⭐ → feedback privado.
- Página `/dashboard/review` (para enlazar desde los emails).
- Admin `/dashboard/admin/reviews`: aprobar, rechazar y ver feedback.
- Landing: con 2 o más testimonios aprobados y públicos se reemplazan los de ejemplo. Con 5 o más reseñas recibidas, el `AggregateRating` vuelve al schema, calculado con **todas** las reseñas (rechazar no infla el promedio; regla de la FTC).
- Trustpilot se ofrece a todos los que envían su opinión, sin importar las estrellas (Trustpilot prohíbe el *review gating*).
- Emails del admin: nueva audiencia "Clientes de pago" (Starter, Pro y ZenMode activos).

### Recomendación pendiente — app móvil
- Corto plazo: **PWA** (el manifest ya existe) + **journaling por nota de voz** (MediaRecorder → Gemini, que convierte el audio en un trade estructurado con emociones). Funciona en iOS y Android sin pasar por las tiendas y sin la comisión de Apple/Google (15–30%) sobre las suscripciones.
- App nativa (Expo/React Native) solo si la PWA demuestra tracción. Ventaja: reseñas en las tiendas y notificaciones push más fiables en iOS.

---

## 2026-05 — Pagos, email marketing y contenido
- Pagos: de Wompi a PayPal Subscriptions (LemonSqueezy, MercadoPago y FastSpring rechazaron la cuenta colombiana).
- Email marketing desde el admin: editor rico, envíos programados (`scheduled_emails`, cron `send-scheduled-emails`), audiencias.
- ZenCoach (chat con IA), tour de onboarding, Trailing Stop como razón de salida.
- ~30 posts de blog, páginas `/vs/*` y hubs de prop firms (FTMO, Apex, TopStep).
- El 2026-05-28 el foco de mercado pasó de LATAM a EE.UU. y todos los emails quedaron en inglés.

## 2026-03 — Lanzamiento
- Deploy a producción en zen-trader.com (2026-03-22). Auditoría de seguridad: `SECURITY-AUDIT-2026-03-22.md`.
- Revenge trading detection, reporte semanal con IA y Radar de mercado (Gemini 2.5 Flash), newsletter, sistema de afiliados.
- Detalle completo: `docs/archive/ROADMAP-2026-03.md`.
