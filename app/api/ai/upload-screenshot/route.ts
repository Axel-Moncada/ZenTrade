import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get('file');
  if (!(file instanceof File)) return NextResponse.json({ error: 'No file' }, { status: 400 });

  const ext = file.name.split('.').pop() ?? 'jpg';
  const path = `${user.id}/${Date.now()}.${ext}`;

  // Ensure bucket exists
  await supabaseAdmin.storage.createBucket('zencoach-screenshots', { public: true }).catch(() => {});

  const { error } = await supabaseAdmin.storage
    .from('zencoach-screenshots')
    .upload(path, file, { contentType: file.type, upsert: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: { publicUrl } } = supabaseAdmin.storage
    .from('zencoach-screenshots')
    .getPublicUrl(path);

  return NextResponse.json({ url: publicUrl });
}
