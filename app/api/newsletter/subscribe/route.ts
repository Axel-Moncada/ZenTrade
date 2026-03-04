import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { resend, FROM_EMAIL } from "@/lib/resend/client";

const subscribeSchema = z.object({
  email: z.string().email("Email inválido"),
  name: z.string().max(100).optional(),
  source: z.enum(["landing_popup", "footer_form"]).optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const validation = subscribeSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { email, name, source } = validation.data;

    const { error: dbError } = await supabaseAdmin
      .from("newsletter_subscribers")
      .insert({ email, name: name ?? null, source: source ?? "landing_popup" });

    if (dbError) {
      // Email duplicado
      if (dbError.code === "23505") {
        return NextResponse.json(
          { error: "Este email ya está suscrito" },
          { status: 409 }
        );
      }
      console.error("[Newsletter] DB error:", dbError);
      return NextResponse.json({ error: "Error al suscribirse" }, { status: 500 });
    }

    // Email de confirmación
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: "¡Bienvenido a ZenTrade!",
      html: `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#0a0f0a;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0f0a;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#111c11;border-radius:12px;border:1px solid #1e3a1e;overflow:hidden;max-width:560px;">
        <tr>
          <td style="background:linear-gradient(135deg,#0d2010 0%,#112615 100%);padding:32px 40px;text-align:center;border-bottom:1px solid #1e3a1e;">
            <img src="https://rsunvtanukainhbtnmlu.supabase.co/storage/v1/object/public/logo/logo-hori-white.png" alt="ZenTrade" height="32" style="height:32px;">
          </td>
        </tr>
        <tr>
          <td style="padding:40px;">
            <h1 style="margin:0 0 16px;color:#f2f3f4;font-size:24px;font-weight:700;line-height:1.3;">
              ${name ? `¡Hola ${name}! Ya eres parte de ZenTrade.` : "¡Ya eres parte de ZenTrade!"}
            </h1>
            <p style="margin:0 0 24px;color:#a0b4a0;font-size:15px;line-height:1.6;font-weight:300;">
              Recibirás tips de trading, novedades del producto y acceso anticipado a las nuevas funciones antes que nadie.
            </p>
            <table cellpadding="0" cellspacing="0" style="margin:0 0 32px;">
              <tr>
                <td style="padding:8px 0;">
                  <span style="color:#00c17c;font-size:14px;font-weight:700;">✓</span>
                  <span style="color:#a0b4a0;font-size:14px;margin-left:8px;">Tips semanales de trading y gestión de riesgo</span>
                </td>
              </tr>
              <tr>
                <td style="padding:8px 0;">
                  <span style="color:#00c17c;font-size:14px;font-weight:700;">✓</span>
                  <span style="color:#a0b4a0;font-size:14px;margin-left:8px;">Novedades y nuevas funciones antes del lanzamiento</span>
                </td>
              </tr>
              <tr>
                <td style="padding:8px 0;">
                  <span style="color:#00c17c;font-size:14px;font-weight:700;">✓</span>
                  <span style="color:#a0b4a0;font-size:14px;margin-left:8px;">Descuentos exclusivos para suscriptores</span>
                </td>
              </tr>
            </table>
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="background:#00c17c;border-radius:8px;">
                  <a href="https://zen-trader.com" style="display:block;padding:14px 28px;color:#0a0f0a;font-size:15px;font-weight:700;text-decoration:none;">
                    Ver ZenTrade →
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 40px;border-top:1px solid #1e3a1e;text-align:center;">
            <p style="margin:0;color:#4a6a4a;font-size:12px;">ZenTrade · zen-trader.com</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
      `.trim(),
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("[Newsletter] Unexpected error:", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
