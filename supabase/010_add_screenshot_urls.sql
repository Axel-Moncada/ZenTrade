-- Migration 010: Screenshot URLs array + Supabase Storage bucket

-- Storage bucket (private, 5MB limit, images only)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'trade-screenshots',
  'trade-screenshots',
  false,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- RLS policies: users can only access files under their own user_id folder
CREATE POLICY "upload_own_screenshots"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'trade-screenshots' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "view_own_screenshots"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'trade-screenshots' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "delete_own_screenshots"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'trade-screenshots' AND (storage.foldername(name))[1] = auth.uid()::text);

-- New column in trades: array of storage paths (e.g. '{userId}/{filename}.png')
ALTER TABLE trades
  ADD COLUMN IF NOT EXISTS screenshot_urls TEXT[] DEFAULT '{}';

COMMENT ON COLUMN trades.screenshot_urls IS 'Storage paths in trade-screenshots bucket. Max 3. Pro/ZenMode only.';
