import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { resend } from "@/lib/resend/client";

const contactSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email().max(200),
  message: z.string().min(10).max(2000),
  // honeypot
  website: z.string().max(0).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = contactSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }

    const { name, email, message, website } = result.data;

    // Honeypot check — bots fill the hidden "website" field
    if (website) {
      return NextResponse.json({ ok: true }); // silently accept
    }

    const { error } = await resend.emails.send({
      from: "Zentrade Support <noreply@zen-trader.com>",
      to: ["support@zen-trader.com"],
      replyTo: email,
      subject: `Consulta de ${name} — Zentrade`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
          <h2 style="color: #00c17c; margin-bottom: 4px;">Nueva consulta desde el chat</h2>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 16px 0;" />
          <p><strong>Nombre:</strong> ${name}</p>
          <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
          <p><strong>Mensaje:</strong></p>
          <blockquote style="border-left: 3px solid #00c17c; margin: 0; padding: 12px 16px; background: #f9fafb; color: #374151;">
            ${message.replace(/\n/g, "<br>")}
          </blockquote>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0 8px;" />
          <p style="color: #9ca3af; font-size: 12px;">Enviado desde el widget de soporte de zen-trader.com</p>
        </div>
      `,
    });

    if (error) {
      console.error("[support/contact] Resend error:", error);
      return NextResponse.json({ error: "Error al enviar" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[support/contact] Unexpected error:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
