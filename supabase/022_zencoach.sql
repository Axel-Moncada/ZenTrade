-- ZenCoach AI Chat: conversations and messages

CREATE TABLE IF NOT EXISTS ai_conversations (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id     UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  session_date   DATE NOT NULL DEFAULT CURRENT_DATE,
  summary        TEXT,
  trades_registered INTEGER DEFAULT 0,
  status         TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'closed')),
  started_at     TIMESTAMPTZ DEFAULT now(),
  closed_at      TIMESTAMPTZ,
  UNIQUE(user_id, account_id, session_date)
);

ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own conversations"
  ON ai_conversations FOR ALL
  USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS ai_messages (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
  role            TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content         TEXT NOT NULL,
  image_url       TEXT,
  metadata        JSONB,
  created_at      TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own messages"
  ON ai_messages FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM ai_conversations ac
      WHERE ac.id = ai_messages.conversation_id
        AND ac.user_id = auth.uid()
    )
  );
