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

const UpdateSchema = z.object({
  subject_es:   z.string().optional(),
  subject_en:   z.string().optional(),
  body_html_es: z.string().optional(),
  body_html_en: z.string().optional(),
  audience:     z.enum(['all', 'zenmode']).optional(),
  scheduled_at: z.string().datetime().nullable().optional(),
  status:       z.enum(['draft', 'scheduled']).optional(),
});

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const { data, error } = await supabaseAdmin
    .from('scheduled_emails')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json(data);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const body = await req.json() as unknown;
  const parsed = UpdateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const updates = {
    ...parsed.data,
    updated_at: new Date().toISOString(),
    ...(parsed.data.scheduled_at !== undefined
      ? { status: parsed.data.scheduled_at ? 'scheduled' : 'draft' }
      : {}),
  };

  const { data, error } = await supabaseAdmin
    .from('scheduled_emails')
    .update(updates)
    .eq('id', id)
    .neq('status', 'sent')
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const { error } = await supabaseAdmin
    .from('scheduled_emails')
    .delete()
    .eq('id', id)
    .neq('status', 'sent');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
