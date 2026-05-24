import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { getUserPlan } from '@/lib/lemonsqueezy/get-user-plan';

const Body = z.object({ account_id: z.string().uuid() });

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const plan = await getUserPlan(supabase, user.id);
  if (plan.planKey !== 'zenmode') {
    return NextResponse.json({ error: 'ZenMode required' }, { status: 403 });
  }

  const body = await req.json() as unknown;
  const parsed = Body.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid body' }, { status: 400 });

  const { account_id } = parsed.data;
  const today = new Date().toISOString().slice(0, 10);

  // Verify account belongs to user
  const { data: account } = await supabase
    .from('accounts')
    .select('id, name')
    .eq('id', account_id)
    .eq('user_id', user.id)
    .single();

  if (!account) return NextResponse.json({ error: 'Account not found' }, { status: 404 });

  // Upsert today's conversation
  const { data: conv, error } = await supabase
    .from('ai_conversations')
    .upsert(
      { user_id: user.id, account_id, session_date: today, status: 'active' },
      { onConflict: 'user_id,account_id,session_date', ignoreDuplicates: false }
    )
    .select('id, status, trades_registered, summary, started_at')
    .single();

  if (error || !conv) return NextResponse.json({ error: error?.message ?? 'DB error' }, { status: 500 });

  // Load existing messages
  const { data: messages } = await supabase
    .from('ai_messages')
    .select('id, role, content, image_url, created_at')
    .eq('conversation_id', conv.id)
    .order('created_at', { ascending: true });

  return NextResponse.json({ conversation: conv, messages: messages ?? [] });
}
