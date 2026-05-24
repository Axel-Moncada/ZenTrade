import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? '').split(',').map(e => e.trim());

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !ADMIN_EMAILS.includes(user.email ?? '')) return null;
  return user;
}

const CreateSchema = z.object({
  type:         z.enum(['newsletter', 'zennews']),
  subject_es:   z.string().default(''),
  subject_en:   z.string().default(''),
  body_html_es: z.string().default(''),
  body_html_en: z.string().default(''),
  audience:     z.enum(['all', 'zenmode']).default('all'),
  scheduled_at: z.string().datetime().nullable().optional(),
});

export async function GET() {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabaseAdmin
    .from('scheduled_emails')
    .select('id, type, subject_es, subject_en, audience, status, scheduled_at, sent_at, recipients_count, created_at')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json() as unknown;
  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { scheduled_at, ...rest } = parsed.data;
  const status = scheduled_at ? 'scheduled' : 'draft';

  const { data, error } = await supabaseAdmin
    .from('scheduled_emails')
    .insert({ ...rest, scheduled_at: scheduled_at ?? null, status })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
