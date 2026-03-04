# ZenTrade — Email Design System

Referencia visual para todos los emails transaccionales y de marketing de ZenTrade.
Basado en el template aprobado: `lib/resend/emails/weekly-report-email.tsx`

---

## Estructura de 3 zonas (layout estándar)

```
┌─────────────────────────────────────┐
│  HEADER OSCURO  (#112510)           │  Logo + título + dato hero + CTA
│  Logo blanco, acento verde          │
├─────────────────────────────────────┤
│  CONTENIDO CLARO  (#ededed / #FFF)  │  Cards blancas, métricas, info
│  Fondo #ededed, cards #FFFFFF       │
├─────────────────────────────────────┤
│  FOOTER OSCURO  (#112510)           │  Links, copyright, legal
│  Texto blanco, mínimo              │
└─────────────────────────────────────┘
```

---

## Paleta de colores

### Header y Footer (dark)
```typescript
const DARK = {
  bg: "#112510",                        // fondo de header y footer
  surface: "#061410",                   // cards dentro del header
  green: "#00C17C",                     // acento principal (logos, CTA, texto destacado)
  greenDim: "rgba(0,193,124,0.15)",     // fondo tenue verde
  border: "#0F5132",                    // bordes oscuros
  text: "#F2F3F4",                      // texto principal
  muted: "rgba(242,243,244,0.55)",      // texto secundario
  dim: "rgba(242,243,244,0.25)",        // texto muy tenue
  white: "#FFFFFF",                     // blanco puro (footer)
};
```

### Contenido (light)
```typescript
const LIGHT = {
  bg: "#ededed",                        // fondo del área de contenido
  surface: "#FFFFFF",                   // cards blancas
  border: "#D1E8DC",                    // bordes suaves
  borderMid: "#A8D5BC",                 // bordes medios
  text: "#0D1F18",                      // texto principal oscuro
  muted: "#637069",                     // texto secundario
  dim: "#9EADA6",                       // texto terciario
  green: "#007A4D",                     // verde oscuro para contenido claro
  greenBg: "#E8F5EE",                   // fondo tenue verde
  greenBorder: "#A8D5BC",               // borde verde suave
  red: "#C0392B",                       // rojo para pérdidas
  redBg: "#FDECEA",                     // fondo tenue rojo
  redBorder: "#F1A89A",                 // borde rojo suave
};
```

---

## Tipografía

```typescript
fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif"
```

### Jerarquía de tamaños

| Uso | Tamaño | Peso | Color |
|-----|--------|------|-------|
| Dato hero (PnL) | 56px | 800 | DARK.green / rojo |
| Métricas clave (win rate, etc.) | 32px | 800 | LIGHT.green / LIGHT.text |
| Valores secundarios (mejor día) | 22px | 800 | LIGHT.green / LIGHT.red |
| CTA button | 14px | 700 | #001B1F |
| Labels y secciones | 11-13px | 700 | LIGHT.muted / DARK.muted |
| Cuerpo / análisis IA | 14px | 400 | LIGHT.text |
| Footer / notas | 12-14px | 400-500 | DARK.white |

### Detalles tipográficos
- Números grandes: `letterSpacing: "-0.5px"` a `"-2px"` (según tamaño)
- Labels en caps: `textTransform: "uppercase"`, `letterSpacing: "1-2.5px"`
- Line height para cuerpo: `lineHeight: "1.7"` o `"1.8"`

---

## Logo

```tsx
<Img
  src="https://rsunvtanukainhbtnmlu.supabase.co/storage/v1/object/public/logo/logo-hori-white.png"
  alt="ZenTrade"
  width="310"
  style={{ display: "block", margin: "0 auto 10px", height: "auto" }}
/>
```

- Usar siempre el logo blanco sobre fondo oscuro
- Centrado, width máximo 310px en header grande / 160px en header compacto

---

## Componentes reutilizables

### Header oscuro
```tsx
<Section style={{ backgroundColor: DARK.bg, padding: "32px 24px 0" }}>
  <Container style={{ maxWidth: "760px", margin: "0 auto" }}>
    {/* Logo */}
    {/* Hero card */}
  </Container>
</Section>
```

### Card hero (dentro del header)
```tsx
<Section style={{
  backgroundColor: DARK.surface,
  border: `1px solid ${DARK.border}`,
  borderRadius: "16px",
  padding: "36px 32px 32px",
  textAlign: "center",
}}>
  {/* Etiqueta uppercase */}
  <Text style={{ color: DARK.green, fontSize: "18px", fontWeight: "700",
    letterSpacing: "2.5px", textTransform: "uppercase", margin: "0 0 10px 0" }}>
    {label}
  </Text>
  {/* Subtítulo */}
  <Text style={{ color: DARK.white, fontSize: "16px", margin: "0 0 4px 0" }}>
    {subtitle}
  </Text>
  {/* Dato principal */}
  <Heading style={{ color: DARK.green, fontSize: "56px", fontWeight: "800",
    margin: "8px 0 4px", letterSpacing: "-2px", lineHeight: "1" }}>
    {value}
  </Heading>
  {/* Dato secundario */}
  <Text style={{ color: DARK.muted, fontSize: "13px", margin: "0 0 28px 0", fontWeight: "300" }}>
    {secondary}
  </Text>
  {/* CTA */}
  <Button href={url} style={{
    backgroundColor: DARK.green, color: "#001B1F",
    padding: "13px 32px", borderRadius: "10px",
    fontSize: "14px", fontWeight: "700",
  }}>
    Texto del botón →
  </Button>
</Section>
```

### Área de contenido claro
```tsx
<Section style={{ backgroundColor: LIGHT.bg, padding: "0 24px" }}>
  <Container style={{ maxWidth: "860px", margin: "0 auto" }}>
    {/* Cards blancas aquí */}
  </Container>
</Section>
```

### Card blanca estándar
```tsx
<Section style={{
  backgroundColor: LIGHT.surface,
  border: `1px solid ${LIGHT.border}`,
  borderRadius: "14px",
  padding: "22px 24px",
  marginBottom: "20px",
}}>
  <Text style={{ color: LIGHT.text, fontSize: "13px", fontWeight: "700",
    margin: "0 0 14px 0", letterSpacing: "0.5px", textTransform: "uppercase" }}>
    Título sección
  </Text>
  {/* Contenido */}
</Section>
```

### Row de 3 métricas (con separadores verticales)
```tsx
<Row>
  <Column style={{ textAlign: "center", padding: "0 8px" }}>
    <Text style={{ color: LIGHT.green, fontSize: "32px", fontWeight: "800",
      margin: "0 0 2px 0", letterSpacing: "-0.5px" }}>
      {value}
    </Text>
    <Text style={{ color: LIGHT.muted, fontSize: "11px", fontWeight: "600",
      letterSpacing: "1px", textTransform: "uppercase", margin: 0 }}>
      Label
    </Text>
  </Column>
  <Column style={{ textAlign: "center", padding: "0 8px",
    borderLeft: `1px solid ${LIGHT.border}`, borderRight: `1px solid ${LIGHT.border}` }}>
    {/* métrica central */}
  </Column>
  <Column style={{ textAlign: "center", padding: "0 8px" }}>
    {/* métrica derecha */}
  </Column>
</Row>
```

### Cards dúo (verde / rojo) — Mejor día / Peor día
```tsx
<Row>
  <Column style={{ paddingRight: "8px" }}>
    <Section style={{
      backgroundColor: LIGHT.greenBg,
      border: `1px solid ${LIGHT.greenBorder}`,
      borderRadius: "12px", padding: "18px 16px", textAlign: "center",
    }}>
      <Text style={{ color: LIGHT.green, fontSize: "10px", fontWeight: "700",
        letterSpacing: "1.5px", textTransform: "uppercase", margin: "0 0 6px 0" }}>
        Etiqueta
      </Text>
      <Text style={{ color: LIGHT.green, fontSize: "22px", fontWeight: "800",
        margin: "0 0 2px 0", letterSpacing: "-0.5px" }}>
        {value}
      </Text>
      <Text style={{ color: LIGHT.muted, fontSize: "12px", margin: 0 }}>
        {sub}
      </Text>
    </Section>
  </Column>
  <Column style={{ paddingLeft: "8px" }}>
    {/* misma estructura con LIGHT.red / LIGHT.redBg / LIGHT.redBorder */}
  </Column>
</Row>
```

### Card de análisis IA
```tsx
<Section style={{
  backgroundColor: LIGHT.surface,
  border: `2px solid ${LIGHT.greenBorder}`,
  borderLeft: `4px solid ${LIGHT.green}`,   // ← borde izquierdo grueso = firma visual IA
  borderRadius: "14px",
  padding: "24px",
  marginBottom: "20px",
}}>
  <Row style={{ marginBottom: "10px" }}>
    <Column style={{ width: "20px" }}>
      <Text style={{ fontSize: "16px", margin: 0 }}>✦</Text>
    </Column>
    <Column>
      <Text style={{ color: LIGHT.green, fontSize: "11px", fontWeight: "700",
        letterSpacing: "2px", textTransform: "uppercase", margin: 0 }}>
        Análisis de tu semana (IA intelligence)
      </Text>
    </Column>
  </Row>
  <Text style={{ color: LIGHT.text, fontSize: "14px", lineHeight: "1.8", margin: 0 }}>
    {aiAnalysis}
  </Text>
</Section>
```

### Barra de progreso (email-safe)
```tsx
{/* Contenedor fondo */}
<Section style={{ backgroundColor: LIGHT.border, borderRadius: "4px", height: "6px", overflow: "hidden" }}>
  {/* Relleno dinámico */}
  <Section style={{
    backgroundColor: LIGHT.green,
    borderRadius: "4px", height: "6px",
    width: `${progressPct}%`,
  }} />
</Section>
```

### Footer oscuro
```tsx
<Section style={{ backgroundColor: DARK.bg, padding: "28px 24px 32px" }}>
  <Container style={{ maxWidth: "860px", margin: "0 auto" }}>
    <Hr style={{ borderColor: DARK.white, margin: "0 0 20px 0" }} />
    <Text style={{ color: DARK.white, fontSize: "16px", fontWeight: "500",
      textAlign: "center", margin: "0 0 6px 0" }}>
      Mensaje de contexto (por qué recibe el email)
    </Text>
    <Text style={{ color: DARK.white, fontSize: "14px", textAlign: "center", margin: 0 }}>
      © {new Date().getFullYear()} ZenTrade · zen-trader.com
    </Text>
  </Container>
</Section>
```

---

## Reglas de diseño

1. **Siempre logo blanco** — nunca versión oscura sobre fondo oscuro
2. **maxWidth del container**: 760px en header / 860px en contenido y footer
3. **marginBottom entre cards**: 20px estándar, 24px antes del footer
4. **borderRadius**: 16px para cards grandes, 14px para cards medianas, 12px para duo-cards
5. **Sin Google Fonts** — solo `'Helvetica Neue', Helvetica, Arial, sans-serif`
6. **Números grandes siempre con `letterSpacing` negativo** — mejor legibilidad
7. **Labels siempre en uppercase** con `letterSpacing: "1-2.5px"`
8. **Un solo CTA por email** — en el hero del header, color `DARK.green`, texto oscuro `#001B1F`
9. **Análisis IA**: siempre con borde izquierdo grueso (`4px solid`) y símbolo `✦`
10. **Cards positivas**: `LIGHT.greenBg` + `LIGHT.greenBorder` + texto `LIGHT.green`
11. **Cards negativas**: `LIGHT.redBg` + `LIGHT.redBorder` + texto `LIGHT.red`

---

## Preview text

```tsx
<Preview>
  {`Mensaje corto que aparece en inbox — máx 90 chars · incluye el dato más importante`}
</Preview>
```

---

## Imports estándar de @react-email/components

```typescript
import {
  Body, Button, Container, Head, Heading, Hr, Html,
  Img, Link, Preview, Section, Text, Row, Column,
} from "@react-email/components";
```

---

## Template de referencia

`lib/resend/emails/weekly-report-email.tsx` — aprobado en sesión 2026-03-04
