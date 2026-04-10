-- Migration 013: Micro and macro photo paths for daily summaries

ALTER TABLE daily_summaries
  ADD COLUMN IF NOT EXISTS micro_photo_path TEXT,
  ADD COLUMN IF NOT EXISTS macro_photo_path TEXT;

COMMENT ON COLUMN daily_summaries.micro_photo_path IS 'Storage path in trade-screenshots bucket for micro/trade chart photo';
COMMENT ON COLUMN daily_summaries.macro_photo_path IS 'Storage path in trade-screenshots bucket for macro context chart photo';
