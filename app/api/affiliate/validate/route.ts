import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code')?.toUpperCase().trim();

  if (!code) {
    return NextResponse.json({ valid: false, error: 'Code is required' }, { status: 400 });
  }

  const { data } = await supabaseAdmin
    .from('affiliate_codes')
    .select('id, code, discount_percent, max_uses, uses_count')
    .eq('code', code)
    .eq('is_active', true)
    .maybeSingle();

  if (!data) {
    return NextResponse.json({ valid: false, error: 'Invalid or inactive code' });
  }

  if (data.max_uses !== null && data.uses_count >= data.max_uses) {
    return NextResponse.json({ valid: false, error: 'This code has reached its usage limit' });
  }

  return NextResponse.json({
    valid:            true,
    code:             data.code,
    discount_percent: data.discount_percent,
  });
}
