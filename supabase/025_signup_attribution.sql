-- Atribución de registros para la pauta (Google Ads / Meta).
-- First-touch: se llena una sola vez, al completar el registro (email confirmado o Google OAuth),
-- desde la cookie `zt_attr` que escribe el middleware. Solo se escribe con service role.

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS utm_source        TEXT CHECK (char_length(utm_source)   <= 200);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS utm_medium        TEXT CHECK (char_length(utm_medium)   <= 200);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS utm_campaign      TEXT CHECK (char_length(utm_campaign) <= 200);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS utm_term          TEXT CHECK (char_length(utm_term)     <= 200);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS utm_content       TEXT CHECK (char_length(utm_content)  <= 200);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS gclid             TEXT CHECK (char_length(gclid)        <= 200);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS fbclid            TEXT CHECK (char_length(fbclid)       <= 200);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS landing_path      TEXT CHECK (char_length(landing_path) <= 200);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS country           TEXT CHECK (char_length(country)      <= 2);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS signup_locale     TEXT CHECK (signup_locale IN ('en', 'es'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS signup_method     TEXT CHECK (signup_method IN ('email', 'google'));
-- Marca de "sign_up ya registrado": evita contar dos veces y no cuenta como registro el login de un usuario viejo
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS signup_tracked_at TIMESTAMPTZ;

-- Los usuarios que ya existen no son registros nuevos
UPDATE profiles SET signup_tracked_at = COALESCE(created_at, now()) WHERE signup_tracked_at IS NULL;

CREATE INDEX IF NOT EXISTS profiles_utm_campaign_idx ON profiles (utm_campaign) WHERE utm_campaign IS NOT NULL;
