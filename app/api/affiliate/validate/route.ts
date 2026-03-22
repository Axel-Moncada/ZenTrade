import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code')?.toUpperCase().trim();

  if (!code) {
    return NextResponse.json({ valid: false, error: 'Código requerido' }, { status: 400 });
  }

  const { data } = await supabaseAdmin
    .from('affiliate_codes')
    .select('id, code, discount_percent, max_uses, uses_count')
    .eq('code', code)
    .eq('is_active', true)
    .maybeSingle();

  if (!data) {
    return NextResponse.json({ valid: false, error: 'Código inválido o inactivo' });
  }

  if (data.max_uses !== null && data.uses_count >= data.max_uses) {
    return NextResponse.json({ valid: false, error: 'Este código ya alcanzó su límite de usos' });
  }

  return NextResponse.json({
    valid:            true,
    code:             data.code,
    discount_percent: data.discount_percent,
  });
}
