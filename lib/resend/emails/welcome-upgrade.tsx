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

export interface WelcomeUpgradeEmailProps {
  userName: string;
  userEmail: string;
  planName: string;
  billingInterval: "monthly" | "annual";
  nextSteps: { label: string; href: string }[];
  features: string[];
  dashboardUrl: string;
}

const COLORS = {
  bg: "#010E09",
  surface: "#002E21",
  border: "#0F5132",
  green: "#00C17C",
  greenDark: "#006A4E",
  text: "#F2F3F4",
  muted: "rgba(242,243,244,0.55)",
};

export function WelcomeUpgradeEmail({
  userName,
  planName,
  billingInterval,
  nextSteps,
  features,
  dashboardUrl,
}: WelcomeUpgradeEmailProps) {
  const intervalLabel = billingInterval === "annual" ? "anual" : "mensual";
  const firstName = userName?.split(" ")[0] || "trader";

  return (
    <Html lang="es">
      <Head />
      <Preview>¡Bienvenido al plan {planName}! Tu cuenta está activa en ZenTrade.</Preview>

      <Body style={{ backgroundColor: COLORS.bg, fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif", margin: 0 }}>
        <Container style={{ maxWidth: "560px", margin: "0 auto", padding: "32px 16px" }}>

          {/* ── Logo ── */}
          <Section style={{ textAlign: "center", marginBottom: "32px" }}>
            <Text style={{ color: COLORS.green, fontSize: "22px", fontWeight: "800", letterSpacing: "-0.5px", margin: 0 }}>
              ZenTrade
            </Text>
          </Section>

          {/* ── Hero ── */}
          <Section
            style={{
              backgroundColor: COLORS.surface,
              border: `1px solid ${COLORS.green}`,
              borderRadius: "16px",
              padding: "40px 32px",
              textAlign: "center",
              marginBottom: "24px",
            }}
          >
            {/* Emoji grande */}
            <Text style={{ fontSize: "48px", margin: "0 0 16px 0", lineHeight: "1" }}>
              🎉
            </Text>

            <Text
              style={{
                color: COLORS.green,
                fontSize: "11px",
                fontWeight: "700",
                letterSpacing: "2px",
                textTransform: "uppercase",
                margin: "0 0 8px 0",
              }}
            >
              ¡Pago exitoso!
            </Text>

            <Heading
              style={{
                color: COLORS.text,
                fontSize: "26px",
                fontWeight: "800",
                margin: "0 0 10px 0",
                lineHeight: "1.2",
              }}
            >
              Bienvenido al plan {planName}, {firstName}
            </Heading>

            <Text style={{ color: COLORS.muted, fontSize: "15px", margin: "0 0 28px 0", lineHeight: "1.5" }}>
              Tu suscripción {intervalLabel} está activa. Ya tienes acceso completo a todas las funciones de tu plan.
            </Text>

            <Button
              href={dashboardUrl}
              style={{
                backgroundColor: COLORS.green,
                color: "#001B1F",
                padding: "14px 32px",
                borderRadius: "10px",
                fontSize: "15px",
                fontWeight: "700",
                textDecoration: "none",
                display: "inline-block",
              }}
            >
              Ir al Dashboard →
            </Button>
          </Section>

          {/* ── Features desbloqueadas ── */}
          <Section
            style={{
              backgroundColor: COLORS.surface,
              border: `1px solid ${COLORS.border}`,
              borderRadius: "16px",
              padding: "28px 32px",
              marginBottom: "24px",
            }}
          >
            <Text
              style={{
                color: COLORS.text,
                fontSize: "16px",
                fontWeight: "700",
                margin: "0 0 16px 0",
              }}
            >
              Lo que desbloqueaste con {planName}
            </Text>

            {features.map((feature, i) => (
              <Row key={i} style={{ marginBottom: "10px" }}>
                <Column style={{ width: "24px", verticalAlign: "top" }}>
                  <Text style={{ color: COLORS.green, fontSize: "16px", margin: 0, lineHeight: "1.4" }}>✓</Text>
                </Column>
                <Column>
                  <Text style={{ color: COLORS.muted, fontSize: "14px", margin: 0, lineHeight: "1.4" }}>
                    {feature}
                  </Text>
                </Column>
              </Row>
            ))}
          </Section>

          {/* ── Próximos pasos ── */}
          <Section
            style={{
              backgroundColor: COLORS.surface,
              border: `1px solid ${COLORS.border}`,
              borderRadius: "16px",
              padding: "28px 32px",
              marginBottom: "32px",
            }}
          >
            <Text
              style={{
                color: COLORS.text,
                fontSize: "16px",
                fontWeight: "700",
                margin: "0 0 16px 0",
              }}
            >
              ¿Por dónde empezar?
            </Text>

            {nextSteps.map((step, i) => (
              <Section
                key={i}
                style={{
                  backgroundColor: "rgba(0,193,124,0.07)",
                  border: "1px solid rgba(0,193,124,0.2)",
                  borderRadius: "10px",
                  padding: "12px 16px",
                  marginBottom: "8px",
                }}
              >
                <Row>
                  <Column style={{ width: "28px", verticalAlign: "middle" }}>
                    <Text
                      style={{
                        backgroundColor: "rgba(0,193,124,0.2)",
                        color: COLORS.green,
                        fontSize: "11px",
                        fontWeight: "700",
                        borderRadius: "50%",
                        width: "20px",
                        height: "20px",
                        textAlign: "center",
                        lineHeight: "20px",
                        margin: 0,
                        display: "inline-block",
                      }}
                    >
                      {i + 1}
                    </Text>
                  </Column>
                  <Column style={{ verticalAlign: "middle" }}>
                    <Link
                      href={step.href}
                      style={{
                        color: COLORS.text,
                        fontSize: "14px",
                        textDecoration: "none",
                        fontWeight: "500",
                      }}
                    >
                      {step.label} →
                    </Link>
                  </Column>
                </Row>
              </Section>
            ))}
          </Section>

          {/* ── Footer ── */}
          <Hr style={{ borderColor: COLORS.border, margin: "0 0 24px 0" }} />

          <Text style={{ color: COLORS.muted, fontSize: "12px", textAlign: "center", lineHeight: "1.6", margin: 0 }}>
            Recibiste este email porque te suscribiste a ZenTrade.{"\n"}
            Puedes gestionar tu suscripción en{" "}
            <Link href={`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing`} style={{ color: COLORS.green }}>
              tu panel de facturación
            </Link>
            .
          </Text>

          <Text style={{ color: "rgba(242,243,244,0.25)", fontSize: "11px", textAlign: "center", marginTop: "12px" }}>
            © {new Date().getFullYear()} ZenTrade · zen-trader.com
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
