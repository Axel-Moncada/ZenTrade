import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { sendBroadcast } from '@/lib/resend/send-broadcast'

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? '').split(',').map(e => e.trim())

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !ADMIN_EMAILS.includes(user.email ?? '')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date().toISOString()

  const { data: pending, error } = await supabaseAdmin
    .from('scheduled_emails')
    .select('*')
    .eq('status', 'scheduled')
    .lte('scheduled_at', now)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!pending?.length) return NextResponse.json({ sent: 0, emails: 0 })

  let totalSent = 0

  for (const email of pending) {
    const result = await sendBroadcast({
      emailId:    email.id,
      subjectEs:  email.subject_es,
      subjectEn:  email.subject_en,
      bodyHtmlEs: email.body_html_es,
      bodyHtmlEn: email.body_html_en,
      audience:   email.audience as 'all' | 'zenmode',
    })

    await supabaseAdmin
      .from('scheduled_emails')
      .update({
        status:           'sent',
        sent_at:          new Date().toISOString(),
        recipients_count: result.sent,
        updated_at:       new Date().toISOString(),
      })
      .eq('id', email.id)

    totalSent += result.sent
  }

  return NextResponse.json({ sent: totalSent, emails: pending.length })
}
