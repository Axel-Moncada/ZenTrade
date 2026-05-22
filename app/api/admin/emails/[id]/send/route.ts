import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { sendBroadcast } from '@/lib/resend/send-broadcast';

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? '').split(',').map(e => e.trim());

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !ADMIN_EMAILS.includes(user.email ?? '')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  const { data: email, error: fetchError } = await supabaseAdmin
    .from('scheduled_emails')
    .select('*')
    .eq('id', id)
    .neq('status', 'sent')
    .single();

  if (fetchError || !email) {
    return NextResponse.json({ error: 'Email no encontrado o ya enviado' }, { status: 404 });
  }

  const result = await sendBroadcast({
    emailId:    id,
    subjectEs:  email.subject_es,
    subjectEn:  email.subject_en,
    bodyHtmlEs: email.body_html_es,
    bodyHtmlEn: email.body_html_en,
    audience:   email.audience as 'all' | 'zenmode',
  });

  await supabaseAdmin
    .from('scheduled_emails')
    .update({
      status:          'sent',
      sent_at:         new Date().toISOString(),
      recipients_count: result.sent,
      updated_at:       new Date().toISOString(),
    })
    .eq('id', id);

  console.log(`[emails/send] "${email.subject_es}" → ${result.sent} enviados, ${result.failed} fallidos`);
  return NextResponse.json(result);
}
