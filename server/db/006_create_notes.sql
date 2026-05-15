CREATE TABLE IF NOT EXISTS notes (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  link_id    UUID NOT NULL REFERENCES links(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content    TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notes_link_id ON notes (link_id);
