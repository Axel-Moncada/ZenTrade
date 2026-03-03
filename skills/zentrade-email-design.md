# ZenTrade Email Design System

Guía de estilo para todos los emails transaccionales y de marketing de ZenTrade.
Úsala junto a `/frontend-design` y `/marketing-psychology` para generar emails consistentes.

---

## Filosofía de diseño

**Tono:** Minimal luxury para trading — oscuro, sofisticado, preciso.
**Audiencia:** Traders de futuros serios (LATAM + USA) que buscan pasar evaluaciones de prop firms.
**Promesa visual:** Cada email debe sentirse como un dashboard de trading, no como un newsletter genérico.
**Principio clave:** *Menos elementos, más impacto.* Cada bloque debe ganar su lugar.

---

## Paleta de colores (inline CSS)

| Nombre          | Hex        | Uso                                      |
|-----------------|------------|------------------------------------------|
| `rich-black`    | `#001B1F`  | Fondo exterior (body/wrapper)            |
| `deep-bg`       | `#000F12`  | Fondo body más oscuro para más contraste |
| `dark-green`    | `#002E21`  | Fondo de tarjetas / contenedor principal |
| `bangladesh`    | `#006A4E`  | Bordes, dividers, acentos secundarios    |
| `caribbean`     | `#00C17C`  | Acento primario, botones CTA, iconos     |
| `meadow`        | `#3DBB8F`  | Degradados, variante acento              |
| `anti-flash`    | `#F2F3F4`  | Texto principal                          |
| `text-muted`    | `rgba(242, 243, 244, 0.65)` | Subtítulos, cuerpo         |
| `text-dim`      | `rgba(242, 243, 244, 0.35)` | Texto secundario / placeholders|
| `text-ghost`    | `rgba(242, 243, 244, 0.18)` | Footer, meta-texto                |
| `danger`        | `#E5484D`  | Alertas, errores, advertencias           |

### Colores de fondo semánticos
```
Tarjeta principal:  background-color: #002E21; border: 1px solid rgba(0, 106, 78, 0.6)
Fondo sutil:        rgba(0, 0, 0, 0.15)
Acento verde tenue: rgba(0, 193, 124, 0.12); border: 1px solid rgba(0, 193, 124, 0.3)
Acento verde icono: rgba(0, 193, 124, 0.10); border: 1px solid rgba(0, 193, 124, 0.25)
```

---

## Tipografía (email-safe)

### Stack principal (body, UI)
```css
font-family: -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif;
```

### Stack display (headlines, logo)
```css
font-family: Georgia, 'Times New Roman', serif;
```
→ Georgia da personalidad editorial y contrasta bien con la sans-serif del cuerpo.

### Stack monospace (URLs, código)
```css
font-family: 'Courier New', Courier, monospace;
```

### Escala tipográfica
| Elemento         | Size  | Weight | Color            | Font stack  |
|------------------|-------|--------|------------------|-------------|
| Headline H1      | 32px  | 700    | `#F2F3F4`        | Georgia     |
| Acento headline  | 32px  | 700    | `#00C17C`        | Georgia     |
| Subheadline      | 16px  | 400    | muted (0.65)     | sans-serif  |
| Label / badge    | 11px  | 600    | `#00C17C`        | sans-serif  |
| Feature title    | 14px  | 600    | `#F2F3F4`        | sans-serif  |
| Feature desc     | 13px  | 400    | dim (0.5)        | sans-serif  |
| CTA button       | 15px  | 700    | `#001B1F`        | sans-serif  |
| Section label    | 11px  | 600    | ghost (0.4)      | sans-serif uppercase |
| Footer           | 11px  | 400    | ghost (0.25–0.35)| sans-serif  |
| Alt link URL     | 11px  | 400    | `rgba(0,193,124,0.6)` | monospace |

---

## Estructura del email (tabla base)

Todo el layout usa **tablas anidadas** — nunca flexbox o CSS grid.

```
body (background: #000F12)
└── table.wrapper (width:100%, padding: 40px 16px 60px)
    └── table.email-container (max-width: 580px)
        ├── table.logo-header
        │   └── [Z] ZenTrade wordmark + accent line
        ├── table.main-card (bg: #002E21, border: bangladesh, border-radius: 16px)
        │   ├── tr.top-bar (height: 3px, gradient verde)
        │   ├── tr.hero (text-align: center)
        │   │   ├── .status-chip (badge pill)
        │   │   ├── h1.headline (Georgia, 32px)
        │   │   ├── p.subheadline
        │   │   └── table.cta-button
        │   ├── tr.divider
        │   ├── tr.features-section
        │   │   └── [icon rows × N]
        │   ├── tr.divider
        │   └── tr.social-proof (strip oscuro)
        ├── tr.alt-link (fallback URL)
        └── tr.footer
            ├── div.separator (gradient)
            ├── links (Privacy · Términos · Web)
            ├── copyright
            └── anti-spam note
```

---

## Componentes reutilizables

### Logo wordmark
El logo real está en `public/assets/logo-white.png` — siempre usar URL absoluta de producción.
```html
<a href="https://zen-trader.com" style="display: inline-block; text-decoration: none;">
  <img
    src="https://zen-trader.com/assets/logo-white.png"
    alt="ZenTrade"
    width="160"
    height="auto"
    style="display: block; border: 0; outline: none; text-decoration: none; max-width: 160px; height: auto;"
  />
</a>
<!-- Accent line debajo -->
<div style="width: 40px; height: 2px; background-color: #00C17C; border-radius: 1px; margin: 10px auto 0;"></div>
```
> **Nota:** Los clientes de email bloquean imágenes por defecto. El `alt="ZenTrade"` es el fallback.

### Status chip / badge
```html
<td style="background-color: rgba(0,193,124,0.12); border: 1px solid rgba(0,193,124,0.3); border-radius: 20px; padding: 6px 14px;">
  <span style="display: inline-block; width: 6px; height: 6px; background-color: #00C17C; border-radius: 50%; vertical-align: middle; margin-right: 7px;"></span>
  <span style="font-family: -apple-system, Helvetica, Arial, sans-serif; font-size: 11px; font-weight: 600; color: #00C17C; letter-spacing: 1.2px; text-transform: uppercase; vertical-align: middle;">TEXTO DEL CHIP</span>
</td>
```

### Botón CTA principal
```html
<!-- Siempre usar VML fallback para Outlook -->
<table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center">
  <tr>
    <td style="border-radius: 10px; background-color: #00C17C;">
      <!--[if mso]>
      <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="URL_AQUI" style="height:52px;v-text-anchor:middle;width:240px;" arcsize="19%" stroke="f" fillcolor="#00C17C">
        <w:anchorlock/>
        <center>
      <![endif]-->
      <a href="URL_AQUI" style="display: inline-block; font-family: -apple-system, Helvetica, Arial, sans-serif; font-size: 15px; font-weight: 700; color: #001B1F; text-decoration: none; padding: 16px 40px; border-radius: 10px; background-color: #00C17C; letter-spacing: 0.2px; min-width: 200px; text-align: center;">
        Texto del botón &rarr;
      </a>
      <!--[if mso]>
        </center>
      </v:roundrect>
      <![endif]-->
    </td>
  </tr>
</table>
```

### Feature row (icono + título + descripción)
```html
<tr>
  <td style="padding-bottom: 20px; vertical-align: top;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
      <tr>
        <td style="width: 36px; vertical-align: top;">
          <div style="width: 28px; height: 28px; background-color: rgba(0,193,124,0.1); border: 1px solid rgba(0,193,124,0.25); border-radius: 6px; text-align: center; line-height: 28px; font-size: 14px;">
            EMOJI
          </div>
        </td>
        <td style="padding-left: 14px; vertical-align: top;">
          <p style="margin: 0 0 3px; font-family: -apple-system, Helvetica, Arial, sans-serif; font-size: 14px; font-weight: 600; color: #F2F3F4;">Título del feature</p>
          <p style="margin: 0; font-family: -apple-system, Helvetica, Arial, sans-serif; font-size: 13px; color: rgba(242,243,244,0.5); line-height: 18px;">Descripción breve y concisa del beneficio.</p>
        </td>
      </tr>
    </table>
  </td>
</tr>
```

### Divider / separador
```html
<!-- Sólido con padding -->
<tr>
  <td style="padding: 0 48px;">
    <div style="height: 1px; background-color: rgba(0, 106, 78, 0.4);"></div>
  </td>
</tr>

<!-- Degradado horizontal (para footer) -->
<div style="height: 1px; background: linear-gradient(90deg, transparent, rgba(0, 106, 78, 0.4), transparent);"></div>
```

### Social proof strip
```html
<tr>
  <td style="padding: 18px 48px; text-align: center; background-color: rgba(0,0,0,0.15);">
    <p style="margin: 0; font-family: -apple-system, Helvetica, Arial, sans-serif; font-size: 12px; color: rgba(242,243,244,0.4);">
      Usado por traders de futuros que operan en
      <span style="color: rgba(242,243,244,0.65); font-weight: 600;">FTMO · Apex · TopStep · Tradoverse · Uprofit</span>
    </p>
  </td>
</tr>
```

### Alerta / warning (para emails de riesgo/expiración)
```html
<td style="background-color: rgba(229,72,77,0.1); border: 1px solid rgba(229,72,77,0.3); border-radius: 8px; padding: 14px 18px;">
  <p style="margin: 0; font-family: -apple-system, Helvetica, Arial, sans-serif; font-size: 13px; color: rgba(229,72,77,0.9);">
    ⚠️ Texto de advertencia aquí
  </p>
</td>
```

---

## Animaciones CSS (soporte limitado)

Solo usar en `<style>` dentro del `<body>` — NO en `<head>` para máxima compatibilidad.

**Compatibilidad:**
- ✅ Gmail (web + Android)
- ✅ Apple Mail / iOS Mail
- ✅ Outlook.com (web)
- ❌ Outlook desktop (degrada silenciosamente — mantener legibilidad sin animación)

```css
/* Fade up de entrada — aplicar a .email-wrapper */
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0);    }
}

/* Pulso en botón CTA — aplicar a .cta-btn */
@keyframes pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(0, 193, 124, 0.3); }
  50%       { box-shadow: 0 0 0 8px rgba(0, 193, 124, 0);  }
}

/* Aplicación */
.email-wrapper { animation: fadeUp 0.7s cubic-bezier(0.22, 1, 0.36, 1) both; }
.cta-btn       { animation: pulse 2.5s ease-in-out 1s infinite; }
```

---

## Preheader (preview text en inbox)

Siempre incluir justo después de `<body>`. El relleno con espacios de zero-width previene que el cliente de email muestre contenido del email:

```html
<div style="display: none; max-height: 0; overflow: hidden; mso-hide: all;">
  TEXTO PREHEADER (50-90 chars)&nbsp;&#847;&zwj;&zwnj;&#847;&zwj;&zwnj;&#847;&zwj;&zwnj;&#847;&zwj;&zwnj;&#847;&zwj;&zwnj;
</div>
```

---

## Variables de Supabase

| Variable                | Uso                                     |
|-------------------------|-----------------------------------------|
| `{{ .ConfirmationURL }}` | URL de confirmación de email (activación) |
| `{{ .Token }}`          | Token raw (para magic links)            |
| `{{ .TokenHash }}`      | Hash del token                          |
| `{{ .SiteURL }}`        | URL base del sitio (zentrade.app)       |
| `{{ .RedirectTo }}`     | URL de redirección post-confirmación    |
| `{{ .Email }}`          | Email del usuario (para personalización)|

---

## Copywriting — Principios ZenTrade

### Tono de voz
- **Directo y preciso** — como un trader que no pierde tiempo
- **Confiado, no arrogante** — sabemos lo que hacemos, tú también
- **LATAM-friendly** — español neutro, sin regionalismos extremos
- **Orientado a resultados** — habla de métricas, pasar evaluaciones, ganar dinero real

### Principios de psicología aplicados

**Goal-Gradient Effect** ("estás a un paso")
> "Un clic para activar tu cuenta" / "Estás a un clic de tus primeras métricas"

**Reciprocity** (dar antes de pedir)
> Muestra features y valor ANTES del botón CTA. El usuario ya siente que recibió algo.

**Commitment & Consistency** (primer paso → siguiente)
> El email de activación es el primer commit. Terminarlo activa el patrón de consistencia.

**Loss Aversion** (miedo a perder)
> "Este enlace expira en 24 horas" — pequeño pero efectivo. No abusivo.

**Social Proof** (validación de pares)
> Footer strip con prop firms conocidas = "gente como yo ya lo usa"

**Peak-End Rule** (comienzo y final memorables)
> Abre fuerte con headline poético + verde. Cierra limpio con footer minimalista.

### Fórmulas de headline probadas
```
Forma 1: "[Objeto] te está esperando."          → "Tu diario de trading te está esperando."
Forma 2: "Un [acción] para [resultado]."         → "Un clic para empezar a pasar evaluaciones."
Forma 3: "Estás a [distancia] de [beneficio]."  → "Estás a un clic de tus primeras métricas."
Forma 4: "[Acción] y empieza a [resultado]."    → "Confirma y empieza a operar con datos."
```

### Subjects de email efectivos
```
Confirma tu cuenta — ZenTrade te espera
Un clic para activar tu diario de trading
Tu cuenta está lista, solo falta tú
Activa tu cuenta y empieza a pasar evaluaciones
```

---

## Tipos de email y variaciones

### 1. Activación de cuenta (`confirmation.html`)
- Status chip: "Activación pendiente"
- Headline: poético + acento verde
- CTA: "Confirmar mi cuenta →"
- Features: 3 beneficios clave
- Social proof: strip de prop firms

### 2. Recuperación de contraseña (`password-reset.html`)
- Status chip: "Solicitud de contraseña" (color neutro)
- Headline: directo, funcional
- CTA: "Restablecer contraseña →"
- Warning strip: "Si no fuiste tú, ignora este email"
- Sin features (contexto urgente)

### 3. Email de bienvenida post-activación (`welcome.html`)
- Hero más generoso, sin urgencia
- Onboarding steps (1 → 2 → 3)
- CTA: "Crear mi primera cuenta →"
- Tip del día o insight de trading

### 4. Notificación de plan (upgrade/downgrade) (`plan-change.html`)
- Estado nuevo del plan + fecha efectiva
- Tabla comparativa: antes → después
- CTA: "Ver mi nuevo plan →"

### 5. Email de retiro solicitado (`withdrawal.html`)
- Monto + cuenta
- Estado: pendiente
- CTA: "Ver detalles →"
- Warning de tiempo de procesamiento

---

## Checklist antes de enviar

- [ ] Preheader incluido (50-90 chars)
- [ ] Variables Supabase correctas (`{{ .ConfirmationURL }}` etc.)
- [ ] VML fallback en botones (compatibilidad Outlook)
- [ ] Alt text en todas las imágenes (si las hay)
- [ ] Enlace de texto alternativo debajo del botón CTA
- [ ] Anti-spam note en footer
- [ ] Mobile: columna única, padding reducido en breakpoint 600px
- [ ] Probado en: Gmail web, Apple Mail, Outlook web
- [ ] Subject line + preheader no se duplican visualmente

---

## Herramientas de preview y testing

- **Email on Acid** / **Litmus** — preview en todos los clientes
- **Mail Tester** — spam score
- **Putsmail** — send de prueba desde HTML
- Supabase Dashboard → Authentication → Email Templates (pegar HTML directo)

---

## Notas de implementación en Supabase

1. Ir a **Authentication → Email Templates** en el dashboard de Supabase
2. Seleccionar "Confirm signup"
3. **Subject:** `Confirma tu cuenta — ZenTrade`
4. Pegar el contenido de `supabase/templates/confirmation.html`
5. Guardar cambios

Para variables de entorno locales, usar `supabase/config.toml`:
```toml
[auth.email.template.confirmation]
subject = "Confirma tu cuenta — ZenTrade"
content_path = "./supabase/templates/confirmation.html"
```
