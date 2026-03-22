import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

function isAdmin(email: string): boolean {
  const adminEmails = (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return adminEmails.includes(email.toLowerCase());
}

// GET — Listar todos los códigos con stats de conversiones
export async function GET(_req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user?.email || !isAdmin(user.email)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  const { data: codes, error } = await supabaseAdmin
    .from('affiliate_codes')
    .select('*, affiliate_conversions(id, commission_cents, discounted_amount_cents, created_at)')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: 'Error al obtener códigos' }, { status: 500 });
  }

  return NextResponse.json({ codes });
}

// POST — Crear nuevo código
const CreateSchema = z.object({
  code:               z.string().min(3).max(20).regex(/^[A-Z0-9_]+$/, 'Solo letras mayúsculas, números y guión bajo'),
  name:               z.string().min(1, 'Nombre requerido'),
  discount_percent:   z.number().int().min(0).max(100),
  commission_percent: z.number().int().min(0).max(100),
  max_uses:           z.number().int().positive().nullable(),
  notes:              z.string().optional(),
});

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user?.email || !isAdmin(user.email)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  const body = await req.json() as unknown;
  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Datos inválidos', details: parsed.error.issues },
      { status: 400 },
    );
  }

  const { data, error } = await supabaseAdmin
    .from('affiliate_codes')
    .insert(parsed.data)
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'El código ya existe' }, { status: 409 });
    }
    console.error('[admin/affiliates POST]', error);
    return NextResponse.json({ error: 'Error al crear código' }, { status: 500 });
  }

  return NextResponse.json({ code: data }, { status: 201 });
}
