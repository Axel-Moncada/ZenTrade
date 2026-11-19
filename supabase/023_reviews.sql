-- Reseñas reales de usuarios (testimonios + feedback privado)

CREATE TABLE IF NOT EXISTS reviews (
  id              UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         UUID        NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  rating          SMALLINT    NOT NULL CHECK (rating BETWEEN 1 AND 5),
  testimonial     TEXT        CHECK (char_length(testimonial) <= 600),
  display_name    TEXT        CHECK (char_length(display_name) <= 60),
  role_label      TEXT        CHECK (char_length(role_label) <= 80),
  allow_public    BOOLEAN     NOT NULL DEFAULT false,
  status          TEXT        NOT NULL DEFAULT 'pending'
                              CHECK (status IN ('pending', 'approved', 'rejected')),
  source          TEXT        NOT NULL DEFAULT 'in_app' CHECK (source IN ('in_app', 'email')),
  plan_key        TEXT,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS reviews_status_idx ON reviews (status);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- El usuario ve su propia reseña
CREATE POLICY "Users read own review"
  ON reviews FOR SELECT
  USING (auth.uid() = user_id);

-- El usuario crea/edita solo su reseña y SIEMPRE queda pendiente (no puede auto-aprobarse)
CREATE POLICY "Users insert own pending review"
  ON reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "Users update own pending review"
  ON reviews FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id AND status = 'pending');

-- Aprobación y lectura pública: solo vía service role (rutas admin y landing en servidor)

-- Control de frecuencia del prompt de reseña
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS review_prompted_at TIMESTAMPTZ;

-- Nueva audiencia para emails del admin: clientes de pago
ALTER TABLE scheduled_emails DROP CONSTRAINT IF EXISTS scheduled_emails_audience_check;
ALTER TABLE scheduled_emails ADD CONSTRAINT scheduled_emails_audience_check
  CHECK (audience IN ('all', 'zenmode', 'paying'));
