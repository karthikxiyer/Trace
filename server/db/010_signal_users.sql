ALTER TABLE users ADD COLUMN IF NOT EXISTS signal_phone TEXT UNIQUE;
ALTER TABLE links ADD COLUMN IF NOT EXISTS content_type TEXT DEFAULT 'article';
ALTER TABLE links ADD COLUMN IF NOT EXISTS source_phone TEXT;
CREATE INDEX IF NOT EXISTS idx_users_signal_phone ON users(signal_phone);
