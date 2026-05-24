import { Resend } from 'resend';
import { supabaseAdmin } from '@/lib/supabase/admin';

const resend = new Resend(process.env.RESEND_API_KEY);

const LOGO_URL = 'https://rsunvtanukainhbtnmlu.supabase.co/storage/v1/object/public/logo/logo-hori-white.png';
const APP_URL  = 'https://www.zen-trader.com';

function wrapEmail(bodyHtml: string, subject: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background:#e8e8e8;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#e8e8e8;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0"
             style="max-width:600px;width:100%;border-radius:12px;overflow:hidden;border:1px solid #D4D4D4;box-shadow:0 2px 12px rgba(0,0,0,0.08);">

        <!-- HEADER -->
        <tr>
          <td style="background:#112510;padding:24px 40px;border-bottom:3px solid #00C17C;">
            <a href="${APP_URL}" style="text-decoration:none;">
              <img src="${LOGO_URL}" alt="ZenTrade" height="30" style="display:block;"/>
            </a>
          </td>
        </tr>

        <!-- BODY -->
        <tr>
          <td style="background:#ffffff;padding:40px;color:#1a1a1a;font-size:15px;line-height:1.75;">
            ${bodyHtml}
          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td style="background:#112510;padding:22px 40px;border-top:1px solid #1d3a28;text-align:center;">
            <p style="margin:0 0 6px;color:rgba(242,243,244,0.45);font-size:12px;">
              © ${new Date().getFullYear()} ZenTrade · <a href="${APP_URL}" style="color:#00C17C;text-decoration:none;">zen-trader.com</a>
            </p>
            <p style="margin:0;color:rgba(242,243,244,0.28);font-size:11px;">
              Recibes este email porque te suscribiste a ZenTrade.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export interface BroadcastResult {
  sent:   number;
  failed: number;
  errors: string[];
}

interface Recipient {
  email: string;
  name?: string;
  locale: 'es' | 'en';
}

async function getRecipients(audience: 'all' | 'zenmode'): Promise<Recipient[]> {
  const recipients: Recipient[] = [];
  const seen = new Set<string>();

  if (audience === 'all') {
    // Newsletter subscribers
    const { data: subs } = await supabaseAdmin
      .from('newsletter_subscribers')
      .select('email')
      .eq('confirmed', true);

    for (const s of subs ?? []) {
      if (!seen.has(s.email)) {
        seen.add(s.email);
        recipients.push({ email: s.email, locale: 'es' });
      }
    }

    // Registered users with their locale
    const { data: profiles } = await supabaseAdmin
      .from('profiles')
      .select('email:id, locale, full_name');

    // Get emails from auth.users via admin
    const { data: users } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
    for (const u of users?.users ?? []) {
      if (!u.email || seen.has(u.email)) continue;
      seen.add(u.email);
      const profile = profiles?.find(p => p.email === u.id);
      recipients.push({
        email:  u.email,
        name:   u.user_metadata?.full_name as string | undefined,
        locale: (profile?.locale as 'es' | 'en') ?? 'es',
      });
    }
  } else {
    // Solo usuarios ZenMode activos
    const { data: subs } = await supabaseAdmin
      .from('subscriptions')
      .select('user_id')
      .eq('plan_key', 'zenmode')
      .eq('status', 'active');

    if (!subs?.length) return [];

    const userIds = subs.map(s => s.user_id);
    const { data: users } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
    const { data: profiles } = await supabaseAdmin
      .from('profiles')
      .select('id, locale, full_name')
      .in('id', userIds);

    for (const userId of userIds) {
      const user = users?.users.find(u => u.id === userId);
      if (!user?.email || seen.has(user.email)) continue;
      seen.add(user.email);
      const profile = profiles?.find(p => p.id === userId);
      recipients.push({
        email:  user.email,
        name:   user.user_metadata?.full_name as string | undefined,
        locale: (profile?.locale as 'es' | 'en') ?? 'es',
      });
    }
  }

  return recipients;
}

export async function sendBroadcast(params: {
  emailId:      string;
  subjectEs:    string;
  subjectEn:    string;
  bodyHtmlEs:   string;
  bodyHtmlEn:   string;
  audience:     'all' | 'zenmode';
}): Promise<BroadcastResult> {
  const { emailId, subjectEs, subjectEn, bodyHtmlEs, bodyHtmlEn, audience } = params;

  const recipients = await getRecipients(audience);
  const result: BroadcastResult = { sent: 0, failed: 0, errors: [] };

  // Resend batch: máx 100 por llamada
  const BATCH = 50;
  for (let i = 0; i < recipients.length; i += BATCH) {
    const chunk = recipients.slice(i, i + BATCH);

    const emails = chunk.map(r => {
      const isEn      = r.locale === 'en' && subjectEn && bodyHtmlEn;
      const subject   = isEn ? subjectEn   : subjectEs;
      const bodyHtml  = isEn ? bodyHtmlEn  : bodyHtmlEs;
      return {
        from:    process.env.RESEND_FROM_EMAIL!,
        to:      r.email,
        subject,
        html:    wrapEmail(bodyHtml, subject),
        tags:    [{ name: 'email_id', value: emailId }],
      };
    });

    try {
      await resend.batch.send(emails);
      result.sent += chunk.length;
    } catch (err) {
      result.failed += chunk.length;
      result.errors.push(String(err));
      console.error('[broadcast] batch error:', err);
    }
  }

  return result;
}
