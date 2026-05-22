import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const ADMIN_EMAIL = 'axelemoncada@gmail.com';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://www.zen-trader.com';

/**
 * GET /api/cron/market-preview
 * Vercel Cron — domingos 19:00 UTC
 * Envía recordatorio al admin para escribir el ZenNews y el Newsletter de la semana.
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const editorUrl = `${APP_URL}/dashboard/admin/emails`;
  const today = new Date().toLocaleDateString('es-CO', {
    weekday: 'long', day: 'numeric', month: 'long', timeZone: 'America/Bogota',
  });

  await resend.emails.send({
    from:    process.env.RESEND_FROM_EMAIL!,
    to:      ADMIN_EMAIL,
    subject: `📬 Recordatorio — Escribe el ZenNews y Newsletter (${today})`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;">
        <h2 style="color:#00C17C;">📬 Es domingo — hora del contenido semanal</h2>
        <p>Recuerda crear y enviar los emails de esta semana:</p>
        <ul style="line-height:2;">
          <li><b>ZenNews</b> — Noticias económicas relevantes para traders ZenMode</li>
          <li><b>Newsletter</b> — Novedades y contenido de ZenTrade para todos los suscriptores</li>
        </ul>
        <a href="${editorUrl}"
           style="display:inline-block;margin-top:16px;padding:12px 24px;background:#00C17C;color:#000;font-weight:bold;border-radius:8px;text-decoration:none;">
          Abrir Editor de Emails →
        </a>
        <p style="margin-top:24px;color:#666;font-size:13px;">
          Este recordatorio llega todos los domingos a las 7pm UTC.
        </p>
      </div>
    `,
  });

  console.log('[market-preview] Recordatorio enviado al admin');
  return NextResponse.json({ ok: true });
}
