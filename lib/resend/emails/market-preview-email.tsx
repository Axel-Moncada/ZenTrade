import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
  Row,
  Column,
} from "@react-email/components";
import type { MarketPreviewData, ImpactType, NewsItemType } from "@/lib/ai/gemini-market-news";

export interface MarketPreviewEmailProps {
  userName: string | null;
  weekStart: string;
  weekEnd: string;
  previewData: MarketPreviewData;
  dashboardUrl: string;
}

// ─── Paleta oscura (header/footer) ───────────────────────────────────────────
const DARK = {
  bg: "#112510",
  surface: "#061410",
  green: "#00C17C",
  border: "#0F5132",
  text: "#F2F3F4",
  muted: "rgba(242,243,244,0.55)",
  white: "#FFFFFF",
};

// ─── Paleta clara (contenido) ─────────────────────────────────────────────────
const LIGHT = {
  bg: "#ededed",
  surface: "#FFFFFF",
  border: "#D1E8DC",
  text: "#0D1F18",
  muted: "#637069",
  dim: "#9EADA6",
  green: "#007A4D",
  greenBg: "#E8F5EE",
  greenBorder: "#A8D5BC",
  red: "#C0392B",
  redBg: "#FDECEA",
  redBorder: "#F1A89A",
};

// ─── Badge de tipo de evento ──────────────────────────────────────────────────
const TYPE_BADGE: Record<NewsItemType, { bg: string; label: string }> = {
  FED:         { bg: "#7C3AED", label: "FED / FOMC" },
  EARNINGS:    { bg: "#1D4ED8", label: "EARNINGS" },
  MACRO:       { bg: "#0369A1", label: "MACRO" },
  INFLACIÓN:   { bg: "#B45309", label: "INFLACIÓN" },
  EMPLEO:      { bg: "#047857", label: "EMPLEO" },
  GEOPOLÍTICA: { bg: "#B91C1C", label: "GEOPOLÍTICA" },
  OTRO:        { bg: "#4B5563", label: "EVENTO" },
};

// ─── Estilo de impacto ────────────────────────────────────────────────────────
const IMPACT_STYLE: Record<ImpactType, { color: string; bg: string; label: string; accent: string }> = {
  "alcista":          { color: "#007A4D", bg: "#E8F5EE", label: "▲ Alcista",         accent: "#007A4D" },
  "bajista":          { color: "#C0392B", bg: "#FDECEA", label: "▼ Bajista",         accent: "#C0392B" },
  "alta volatilidad": { color: "#B45309", bg: "#FEF3C7", label: "⚡ Alta Volatilidad", accent: "#D97706" },
  "neutral":          { color: "#637069", bg: "#F3F4F6", label: "● Neutral",          accent: "#9EADA6" },
};

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString("es-ES", { weekday: "short", day: "numeric", month: "short" });
}

function formatWeekRange(start: string, end: string): string {
  return `${formatDate(start)} – ${formatDate(end)}`;
}

export function MarketPreviewEmail({
  userName,
  weekStart,
  weekEnd,
  previewData,
  dashboardUrl,
}: MarketPreviewEmailProps) {
  const firstName = userName?.split(" ")[0] ?? "Trader";
  const { intro, newsItems, closingNote } = previewData;
  const weekRange = formatWeekRange(weekStart, weekEnd);

  // Estadísticas rápidas del preview
  const bullishCount = newsItems.filter((n) => n.potentialImpact === "alcista").length;
  const bearishCount = newsItems.filter((n) => n.potentialImpact === "bajista").length;
  const volatileCount = newsItems.filter((n) => n.potentialImpact === "alta volatilidad").length;

  return (
    <Html lang="es">
      <Head />
      <Preview>
        {`Radar de mercado: ${newsItems.length} eventos clave esta semana · ${weekRange}`}
      </Preview>

      <Body
        style={{
          backgroundColor: LIGHT.bg,
          fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
          margin: 0,
          padding: 0,
        }}
      >

        {/* ── DARK HEADER ───────────────────────────────── */}
        <Section style={{ backgroundColor: DARK.bg, padding: "32px 24px 0" }}>
          <Container style={{ maxWidth: "760px", margin: "0 auto" }}>

            {/* Logo + tagline */}
            <Section style={{ textAlign: "center", paddingBottom: "28px" }}>
              <Img
                src="https://rsunvtanukainhbtnmlu.supabase.co/storage/v1/object/public/logo/logo-hori-white.png"
                alt="ZenTrade"
                width="310"
                style={{ display: "block", margin: "0 auto 10px", height: "auto" }}
              />
              <Text
                style={{
                  color: DARK.green,
                  fontSize: "11px",
                  margin: 0,
                  letterSpacing: "1.5px",
                  textTransform: "uppercase",
                }}
              >
                Radar de Mercado · {weekRange}
              </Text>
            </Section>

            {/* Hero card */}
            <Section
              style={{
                backgroundColor: DARK.surface,
                border: `1px solid ${DARK.border}`,
                borderRadius: "16px 16px 16px 16px",
                padding: "36px 32px 32px",
                textAlign: "center",
              }}
            >
              <Text
                style={{
                  color: DARK.green,
                  fontSize: "13px",
                  fontWeight: "700",
                  letterSpacing: "2.5px",
                  textTransform: "uppercase",
                  margin: "0 0 10px 0",
                }}
              >
                Inteligencia de Mercado
              </Text>

              <Text
                style={{
                  color: DARK.white,
                  fontSize: "16px",
                  margin: "0 0 4px 0",
                  fontWeight: "400",
                }}
              >
                Hola {firstName}, prepárate para la semana.
              </Text>

              <Heading
                style={{
                  color: DARK.green,
                  fontSize: "64px",
                  fontWeight: "800",
                  margin: "8px 0 0",
                  letterSpacing: "-2px",
                  lineHeight: "1",
                }}
              >
                {newsItems.length}
              </Heading>

              <Text
                style={{
                  color: DARK.white,
                  fontSize: "18px",
                  fontWeight: "600",
                  margin: "6px 0 4px",
                  letterSpacing: "-0.3px",
                }}
              >
                eventos de alto impacto
              </Text>

              <Text
                style={{
                  color: DARK.muted,
                  fontSize: "13px",
                  margin: "0 0 28px 0",
                  fontWeight: "300",
                }}
              >
                {weekRange}
              </Text>

              <Button
                href={dashboardUrl}
                style={{
                  backgroundColor: DARK.green,
                  color: "#001B1F",
                  padding: "13px 32px",
                  borderRadius: "10px",
                  fontSize: "14px",
                  fontWeight: "700",
                  textDecoration: "none",
                  display: "inline-block",
                }}
              >
                Ver mi Dashboard →
              </Button>
            </Section>

          </Container>
        </Section>

        {/* ── LIGHT CONTENT AREA ────────────────────────── */}
        <Section style={{ backgroundColor: LIGHT.bg, padding: "0 24px" }}>
          <Container style={{ maxWidth: "860px", margin: "0 auto" }}>

            {/* Banda de resumen — continuación de la dark card */}
            <Section
              style={{
                backgroundColor: LIGHT.surface,
                border: `1px solid ${LIGHT.border}`,
                borderTop: "none",
                borderRadius: "0 0 16px 16px",
                padding: "20px 32px",
                marginBottom: "20px",
              }}
            >
              <Row>
                <Column style={{ textAlign: "center", padding: "0 8px" }}>
                  <Text
                    style={{
                      color: LIGHT.green,
                      fontSize: "28px",
                      fontWeight: "800",
                      margin: "0 0 2px 0",
                      letterSpacing: "-0.5px",
                    }}
                  >
                    {bullishCount}
                  </Text>
                  <Text
                    style={{
                      color: LIGHT.muted,
                      fontSize: "11px",
                      fontWeight: "600",
                      letterSpacing: "1px",
                      textTransform: "uppercase",
                      margin: 0,
                    }}
                  >
                    Alcistas
                  </Text>
                </Column>

                <Column
                  style={{
                    textAlign: "center",
                    padding: "0 8px",
                    borderLeft: `1px solid ${LIGHT.border}`,
                    borderRight: `1px solid ${LIGHT.border}`,
                  }}
                >
                  <Text
                    style={{
                      color: LIGHT.red,
                      fontSize: "28px",
                      fontWeight: "800",
                      margin: "0 0 2px 0",
                      letterSpacing: "-0.5px",
                    }}
                  >
                    {bearishCount}
                  </Text>
                  <Text
                    style={{
                      color: LIGHT.muted,
                      fontSize: "11px",
                      fontWeight: "600",
                      letterSpacing: "1px",
                      textTransform: "uppercase",
                      margin: 0,
                    }}
                  >
                    Bajistas
                  </Text>
                </Column>

                <Column style={{ textAlign: "center", padding: "0 8px" }}>
                  <Text
                    style={{
                      color: "#B45309",
                      fontSize: "28px",
                      fontWeight: "800",
                      margin: "0 0 2px 0",
                      letterSpacing: "-0.5px",
                    }}
                  >
                    {volatileCount}
                  </Text>
                  <Text
                    style={{
                      color: LIGHT.muted,
                      fontSize: "11px",
                      fontWeight: "600",
                      letterSpacing: "1px",
                      textTransform: "uppercase",
                      margin: 0,
                    }}
                  >
                    Alta Vol.
                  </Text>
                </Column>
              </Row>
            </Section>

            {/* Análisis IA (intro) */}
            {intro && (
              <Section
                style={{
                  backgroundColor: LIGHT.surface,
                  border: `2px solid ${LIGHT.greenBorder}`,
                  borderLeft: `4px solid ${LIGHT.green}`,
                  borderRadius: "14px",
                  padding: "24px",
                  marginBottom: "20px",
                }}
              >
                <Row style={{ marginBottom: "10px" }}>
                  <Column style={{ width: "20px" }}>
                    <Text style={{ fontSize: "16px", margin: 0 }}>✦</Text>
                  </Column>
                  <Column>
                    <Text
                      style={{
                        color: LIGHT.green,
                        fontSize: "14px",
                        fontWeight: "700",
                        textTransform: "capitalize",
                        margin: 0,
                      }}
                    >
                      Vista de mercado semanal (IA)
                    </Text>
                  </Column>
                </Row>
                <div
                  dangerouslySetInnerHTML={{ __html: intro }}
                  style={{
                    color: LIGHT.text,
                    fontSize: "15px",
                    lineHeight: "1.8",
                    margin: 0,
                    fontWeight: "400",
                    fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                  }}
                />
              </Section>
            )}

            {/* Label sección de eventos */}
            <Text
              style={{
                color: LIGHT.muted,
                fontSize: "11px",
                fontWeight: "700",
                letterSpacing: "1.5px",
                textTransform: "uppercase",
                margin: "0 0 12px 0",
              }}
            >
              Eventos de la semana
            </Text>

            {/* Cards de noticias */}
            {newsItems.map((item, idx) => {
              const badge = TYPE_BADGE[item.type] ?? TYPE_BADGE.OTRO;
              const impact = IMPACT_STYLE[item.potentialImpact] ?? IMPACT_STYLE.neutral;

              return (
                <Section
                  key={idx}
                  style={{
                    backgroundColor: LIGHT.surface,
                    border: `1px solid ${LIGHT.border}`,
                    borderLeft: `4px solid ${impact.accent}`,
                    borderRadius: "12px",
                    padding: "18px 20px",
                    marginBottom: "12px",
                  }}
                >
                  {/* Badge + Fecha */}
                  <Row style={{ marginBottom: "10px" }}>
                    <Column>
                      <span
                        style={{
                          backgroundColor: badge.bg,
                          color: "#FFFFFF",
                          fontSize: "10px",
                          fontWeight: "700",
                          letterSpacing: "1px",
                          padding: "3px 9px",
                          borderRadius: "4px",
                          textTransform: "uppercase",
                          display: "inline-block",
                          fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                        }}
                      >
                        {badge.label}
                      </span>
                    </Column>
                    <Column style={{ textAlign: "right" }}>
                      <Text
                        style={{
                          color: LIGHT.muted,
                          fontSize: "12px",
                          margin: 0,
                          fontStyle: "italic",
                        }}
                      >
                        {item.date}
                      </Text>
                    </Column>
                  </Row>

                  {/* Título */}
                  <Text
                    style={{
                      color: LIGHT.text,
                      fontSize: "16px",
                      fontWeight: "700",
                      margin: "0 0 6px 0",
                      lineHeight: "1.3",
                    }}
                  >
                    {item.title}
                  </Text>

                  {/* Descripción */}
                  <Text
                    style={{
                      color: LIGHT.muted,
                      fontSize: "14px",
                      margin: "0 0 14px 0",
                      lineHeight: "1.6",
                    }}
                  >
                    {item.description}
                  </Text>

                  {/* Impacto + Instrumentos */}
                  <Row>
                    <Column>
                      <span
                        style={{
                          backgroundColor: impact.bg,
                          color: impact.color,
                          fontSize: "11px",
                          fontWeight: "700",
                          padding: "3px 9px",
                          borderRadius: "4px",
                          display: "inline-block",
                          fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                        }}
                      >
                        {impact.label}
                      </span>
                    </Column>
                    {item.affectedInstruments?.length > 0 && (
                      <Column style={{ textAlign: "right" }}>
                        <Text
                          style={{
                            color: LIGHT.dim,
                            fontSize: "12px",
                            margin: 0,
                            fontWeight: "600",
                            letterSpacing: "0.5px",
                          }}
                        >
                          {item.affectedInstruments.join(" · ")}
                        </Text>
                      </Column>
                    )}
                  </Row>
                </Section>
              );
            })}

            {/* Cierre motivacional */}
            {closingNote && (
              <Section style={{ textAlign: "center", padding: "16px 0 28px" }}>
                <Text
                  style={{
                    color: LIGHT.muted,
                    fontSize: "14px",
                    fontStyle: "italic",
                    margin: 0,
                    lineHeight: "1.6",
                  }}
                >
                  {closingNote}
                </Text>
              </Section>
            )}

          </Container>
        </Section>

        {/* ── DARK FOOTER ───────────────────────────────── */}
        <Section style={{ backgroundColor: DARK.bg, padding: "28px 24px 32px" }}>
          <Container style={{ maxWidth: "860px", margin: "0 auto" }}>
            <Hr style={{ borderColor: DARK.white, margin: "0 0 20px 0" }} />
            <Text
              style={{
                color: DARK.white,
                fontSize: "16px",
                fontWeight: "500",
                textAlign: "center",
                margin: "0 0 6px 0",
              }}
            >
              Recibes este radar de mercado cada domingo porque tienes plan ZenMode.
            </Text>
            <Text
              style={{
                color: DARK.white,
                fontSize: "14px",
                textAlign: "center",
                margin: 0,
              }}
            >
              © {new Date().getFullYear()} ZenTrade · zen-trader.com
            </Text>
          </Container>
        </Section>

      </Body>
    </Html>
  );
}
