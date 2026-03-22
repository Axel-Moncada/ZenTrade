import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

function isAdmin(email: string): boolean {
  const adminEmails = (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return adminEmails.includes(email.toLowerCase());
}

// PATCH — Activar/desactivar código
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user?.email || !isAdmin(user.email)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json() as { is_active?: boolean };

  if (typeof body.is_active !== 'boolean') {
    return NextResponse.json({ error: 'is_active requerido' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('affiliate_codes')
    .update({ is_active: body.is_active })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: 'Error al actualizar código' }, { status: 500 });
  }

  return NextResponse.json({ code: data });
}
