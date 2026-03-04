import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
  Row,
  Column,
} from "@react-email/components";

export interface WeeklyReportEmailProps {
  userName: string | null;
  accountName: string;
  weekStart: string;
  weekEnd: string;
  totalPnl: number;
  winRate: number;
  totalTrades: number;
  profitFactor: number;
  planAdherenceRate: number;
  bestDay: { date: string; pnl: number } | null;
  worstDay: { date: string; pnl: number } | null;
  topWin: { result: number; instrument: string; date: string } | null;
  topLoss: { result: number; instrument: string; date: string } | null;
  aiAnalysis: string | null;
  dashboardUrl: string;
  accountType: string;
  profitTarget: number | null;
  currentBalance: number;
  initialBalance: number;
}

// Dark header/footer palette
const DARK = {
  bg: "#112510",
  surface: "#061410",
  green: "#00C17C",
  greenDim: "rgba(0,193,124,0.15)",
  border: "#0F5132",
  text: "#F2F3F4",
  muted: "rgba(242,243,244,0.55)",
  dim: "rgba(242,243,244,0.25)",
  white: "#FFFFFF",
};

// Light content area palette
const LIGHT = {
  bg: "#ededed",
  surface: "#FFFFFF",
  border: "#D1E8DC",
  borderMid: "#A8D5BC",
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

function formatCurrency(value: number): string {
  const abs = Math.abs(value);
  const sign = value >= 0 ? "+" : "-";
  return `${sign}$${abs.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString("es-ES", { weekday: "short", day: "numeric", month: "short" });
}

function formatWeekRange(start: string, end: string): string {
  return `${formatDate(start)} – ${formatDate(end)}`;
}

function formatHour(hour: number): string {
  const ampm = hour < 12 ? "AM" : "PM";
  const h = hour % 12 === 0 ? 12 : hour % 12;
  return `${h}:00 ${ampm}`;
}

export function WeeklyReportEmail({
  userName,
  accountName,
  weekStart,
  weekEnd,
  totalPnl,
  winRate,
  totalTrades,
  profitFactor,
  planAdherenceRate,
  bestDay,
  worstDay,
  topWin,
  topLoss,
  aiAnalysis,
  dashboardUrl,
  profitTarget,
  currentBalance,
  initialBalance,
}: WeeklyReportEmailProps) {
  const firstName = userName?.split(" ")[0] ?? "Trader";
  const isPositiveWeek = totalPnl >= 0;
  const pnlColor = isPositiveWeek ? DARK.green : "#F87171";

  const progressPct = profitTarget
    ? Math.min(100, Math.max(0, ((currentBalance - initialBalance) / (profitTarget / 100)) * 100))
    : null;

  return (
    <Html lang="es">
      <Head />
      <Preview>
        {`Tu semana en ${accountName}: ${totalTrades} trades · ${winRate.toFixed(0)}% win rate · ${formatCurrency(totalPnl)}`}
      </Preview>

      <Body style={{ backgroundColor: LIGHT.bg, fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", margin: 0, padding: 0 }}>

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
              <Text style={{ color: DARK.green , fontSize: "11px", margin: 0, letterSpacing: "1.5px", textTransform: "uppercase" }}>
                Reporte semanal · {formatWeekRange(weekStart, weekEnd)}
              </Text>
            </Section>

            {/* PnL Hero */}
            <Section
              style={{
                backgroundColor: DARK.surface,
                border: `1px solid ${DARK.border}`,
                borderRadius: "16px 16px 16px 16px",
                padding: "36px 32px 32px",
                textAlign: "center",
              }}
            >
              <Text style={{ color: DARK.green, fontSize: "18px", fontWeight: "700", letterSpacing: "2.5px", textTransform: "uppercase", margin: "0 0 10px 0" }}>
                {accountName}
              </Text>

              <Text style={{ color: DARK.white, fontSize: "16px", margin: "0 0 4px 0", fontWeight: "400" }}>
                {isPositiveWeek ? `Hola ${firstName}, esta fue una buena semana.` : `Hola ${firstName}, esta semana fue desafiante.`}
              </Text>

              <Heading
                style={{
                  color: pnlColor,
                  fontSize: "56px",
                  fontWeight: "800",
                  margin: "8px 0 4px",
                  letterSpacing: "-2px",
                  lineHeight: "1",
                }}
              >
                {formatCurrency(totalPnl)}
              </Heading>

              <Text style={{ color: DARK.muted, fontSize: "13px", margin: "0 0 28px 0", fontWeight: "300" }}>
                {totalTrades} {totalTrades === 1 ? "trade registrado" : "trades registrados"} esta semana
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

            {/* Metrics band — continuation of dark card */}
            <Section
              style={{
                backgroundColor: LIGHT.surface,
                border: `1px solid ${LIGHT.border}`,
                borderTop: "none",
                borderRadius: "0 0 16px 16px",
                padding: "28px 32px",
                marginBottom: "20px",
              }}
            >
              <Row>
                <Column style={{ textAlign: "center", padding: "0 8px" }}>
                  <Text style={{ color: LIGHT.green, fontSize: "32px", fontWeight: "800", margin: "0 0 2px 0", letterSpacing: "-0.5px" }}>
                    {winRate.toFixed(0)}%
                  </Text>
                  <Text style={{ color: LIGHT.muted, fontSize: "11px", fontWeight: "600", letterSpacing: "1px", textTransform: "uppercase", margin: 0 }}>
                    Win rate
                  </Text>
                </Column>
                <Column style={{ textAlign: "center", padding: "0 8px", borderLeft: `1px solid ${LIGHT.border}`, borderRight: `1px solid ${LIGHT.border}` }}>
                  <Text style={{ color: LIGHT.text, fontSize: "32px", fontWeight: "800", margin: "0 0 2px 0", letterSpacing: "-0.5px" }}>
                    {profitFactor === Infinity ? "∞" : profitFactor.toFixed(2)}
                  </Text>
                  <Text style={{ color: LIGHT.muted, fontSize: "11px", fontWeight: "600", letterSpacing: "1px", textTransform: "uppercase", margin: 0 }}>
                    Profit factor
                  </Text>
                </Column>
                <Column style={{ textAlign: "center", padding: "0 8px" }}>
                  <Text style={{ color: LIGHT.text, fontSize: "32px", fontWeight: "800", margin: "0 0 2px 0", letterSpacing: "-0.5px" }}>
                    {planAdherenceRate.toFixed(0)}%
                  </Text>
                  <Text style={{ color: LIGHT.muted, fontSize: "11px", fontWeight: "600", letterSpacing: "1px", textTransform: "uppercase", margin: 0 }}>
                    Cumplimiento del Plan
                  </Text>
                </Column>
              </Row>
            </Section>

            {/* Mejor / Peor día */}
            {(bestDay || worstDay) && (
              <Section style={{ marginBottom: "20px" }}>
                <Row>
                  {bestDay && (
                    <Column style={{ paddingRight: "8px" }}>
                      <Section
                        style={{
                          backgroundColor: LIGHT.greenBg,
                          border: `1px solid ${LIGHT.greenBorder}`,
                          borderRadius: "12px",
                          padding: "18px 16px",
                          textAlign: "center",
                        }}
                      >
                        <Text style={{ color: LIGHT.green, fontSize: "16px", fontWeight: "700", letterSpacing: "1.5px", textTransform: "uppercase", margin: "0 0 6px 0" }}>
                          Mejor día
                        </Text>
                        <Text style={{ color: LIGHT.green, fontSize: "22px", fontWeight: "800", margin: "0 0 2px 0", letterSpacing: "-0.5px" }}>
                          {formatCurrency(bestDay.pnl)}
                        </Text>
                        <Text style={{ color: LIGHT.muted, fontSize: "12px", margin: 0 }}>
                          {formatDate(bestDay.date)}
                        </Text>
                      </Section>
                    </Column>
                  )}
                  {worstDay && (
                    <Column style={{ paddingLeft: bestDay ? "8px" : "0" }}>
                      <Section
                        style={{
                          backgroundColor: LIGHT.redBg,
                          border: `1px solid ${LIGHT.redBorder}`,
                          borderRadius: "12px",
                          padding: "18px 16px",
                          textAlign: "center",
                        }}
                      >
                        <Text style={{ color: LIGHT.red, fontSize: "16px", fontWeight: "700", letterSpacing: "1.5px", textTransform: "uppercase", margin: "0 0 6px 0" }}>
                          Peor día
                        </Text>
                        <Text style={{ color: LIGHT.red, fontSize: "22px", fontWeight: "800", margin: "0 0 2px 0", letterSpacing: "-0.5px" }}>
                          {formatCurrency(worstDay.pnl)}
                        </Text>
                        <Text style={{ color: LIGHT.muted, fontSize: "12px", margin: 0 }}>
                          {formatDate(worstDay.date)}
                        </Text>
                      </Section>
                    </Column>
                  )}
                </Row>
              </Section>
            )}

            {/* Top trades */}
            {(topWin || topLoss) && (
              <Section
                style={{
                  backgroundColor: LIGHT.surface,
                  border: `1px solid ${LIGHT.border}`,
                  borderRadius: "14px",
                  padding: "22px 24px",
                  marginBottom: "20px",
                }}
              >
                <Text style={{ color: LIGHT.text, fontSize: "13px", fontWeight: "700", margin: "0 0 14px 0", letterSpacing: "0.5px", textTransform: "uppercase" }}>
                  Trades de la semana
                </Text>
                {topWin && (
                  <Row style={{ marginBottom: "10px" }}>
                    <Column style={{ width: "28px" }}>
                      <Text style={{ color: LIGHT.green, fontSize: "16px", margin: 0, fontWeight: "700" }}>▲</Text>
                    </Column>
                    <Column>
                      <Text style={{ color: LIGHT.muted, fontSize: "13px", margin: 0, lineHeight: "1.4" }}>
                        Mejor trade:{" "}
                        <span style={{ color: LIGHT.green, fontWeight: "700", fontSize: "14px" }}>
                          {formatCurrency(topWin.result)}
                        </span>
                        {"  "}
                        <span style={{ color: LIGHT.text, fontWeight: "600" }}>{topWin.instrument}</span>
                        {"  ·  "}
                        <span>{formatDate(topWin.date)}</span>
                      </Text>
                    </Column>
                  </Row>
                )}
                {topLoss && (
                  <Row>
                    <Column style={{ width: "28px" }}>
                      <Text style={{ color: LIGHT.red, fontSize: "16px", margin: 0, fontWeight: "700" }}>▼</Text>
                    </Column>
                    <Column>
                      <Text style={{ color: LIGHT.muted, fontSize: "13px", margin: 0, lineHeight: "1.4" }}>
                        Peor trade:{" "}
                        <span style={{ color: LIGHT.red, fontWeight: "700", fontSize: "14px" }}>
                          {formatCurrency(topLoss.result)}
                        </span>
                        {"  "}
                        <span style={{ color: LIGHT.text, fontWeight: "600" }}>{topLoss.instrument}</span>
                        {"  ·  "}
                        <span>{formatDate(topLoss.date)}</span>
                      </Text>
                    </Column>
                  </Row>
                )}
              </Section>
            )}

            {/* Análisis IA (solo Pro/ZenMode) */}
            {aiAnalysis && (
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
                    <Text style={{ color: LIGHT.green, fontSize: "14px", fontWeight: "700", textTransform: "capitalize", margin: 0 }}>
                      Análisis de tu semana (IA)
                    </Text>
                  </Column>
                </Row>
                <div
                  dangerouslySetInnerHTML={{ __html: aiAnalysis }}
                  style={{ color: LIGHT.text, fontSize: "16px", lineHeight: "1.8", margin: 0, fontWeight: "400", fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
                />
              </Section>
            )}

            {/* Progreso hacia objetivo */}
            {progressPct !== null && profitTarget && (
              <Section
                style={{
                  backgroundColor: LIGHT.surface,
                  border: `1px solid ${LIGHT.border}`,
                  borderRadius: "14px",
                  padding: "20px 24px",
                  marginBottom: "24px",
                }}
              >
                <Row style={{ marginBottom: "10px" }}>
                  <Column>
                    <Text style={{ color: LIGHT.text, fontSize: "13px", fontWeight: "600", margin: 0 }}>
                      Progreso hacia objetivo
                    </Text>
                  </Column>
                  <Column style={{ textAlign: "right" }}>
                    <Text style={{ color: LIGHT.green, fontSize: "16px", fontWeight: "800", margin: 0 }}>
                      {progressPct.toFixed(0)}%
                    </Text>
                  </Column>
                </Row>
                {/* Progress bar */}
                <Section style={{ backgroundColor: LIGHT.border, borderRadius: "4px", height: "6px", overflow: "hidden" }}>
                  <Section
                    style={{
                      backgroundColor: LIGHT.green,
                      borderRadius: "4px",
                      height: "6px",
                      width: `${progressPct}%`,
                    }}
                  />
                </Section>
                <Text style={{ color: LIGHT.muted, fontSize: "12px", margin: "8px 0 0 0" }}>
                  Balance: ${currentBalance.toFixed(2)} · Objetivo: +${profitTarget.toFixed(0)}
                </Text>
              </Section>
            )}

          </Container>
        </Section>

        {/* ── DARK FOOTER ───────────────────────────────── */}
        <Section style={{ backgroundColor: DARK.bg, padding: "28px 24px 32px" }}>
          <Container style={{ maxWidth: "860px", margin: "0 auto" }}>
            <Hr style={{ borderColor: DARK.white, margin: "0 0 20px 0" }} />
            <Text style={{ color: DARK.white, fontSize: "16px", fontWeight: "500", textAlign: "center", margin: "0 0 6px 0" }}>
              Recibes este reporte cada lunes porque eres usuario de ZenTrade.
            </Text>
            
            <Text style={{ color: DARK.white, fontSize: "14px", textAlign: "center", margin: 0 }}>
              © {new Date().getFullYear()} ZenTrade · zen-trader.com
            </Text>
          </Container>
        </Section>

      </Body>
    </Html>
  );
}
