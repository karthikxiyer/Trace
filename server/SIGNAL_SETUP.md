# Signal Bot Setup

## Step 1 — get a dedicated number

Options (do not use your personal number):
- **Google Voice** — free, US numbers only
- **Twilio** — ~$1/month, any country
- **Spare SIM** — easiest if you have one handy

## Step 2 — install signal-cli locally

Download the latest release from:
https://github.com/AsamK/signal-cli/releases

macOS with Homebrew:
```
brew install signal-cli
```

Or download the Linux tar.gz and extract it.

## Step 3 — register the bot number

```sh
signal-cli -a +1XXXXXXXXXX register
```

Signal will SMS a verification code to that number.

## Step 4 — verify

```sh
signal-cli -a +1XXXXXXXXXX verify 123-456
```

Replace `123-456` with the code you received.

## Step 5 — copy account data to Render

After verification, account data lives at:
```
~/.local/share/signal-cli/data/
```

On Render:
1. Add a **Persistent Disk** to your service at mount path `/signal-data` (1 GB is enough)
2. Upload the contents of `~/.local/share/signal-cli/data/` into `/signal-data/data/` on the disk

You can use Render Shell or rsync via SSH to transfer files.

## Step 6 — run the DB migrations

In your database (Supabase SQL editor or psql):
```sql
-- from server/db/010_signal_users.sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS signal_phone TEXT UNIQUE;
ALTER TABLE links ADD COLUMN IF NOT EXISTS content_type TEXT DEFAULT 'article';
ALTER TABLE links ADD COLUMN IF NOT EXISTS source_phone TEXT;
CREATE INDEX IF NOT EXISTS idx_users_signal_phone ON users(signal_phone);

-- from server/db/011_signal_tokens.sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE TABLE IF NOT EXISTS signal_tokens (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID REFERENCES users(id) ON DELETE CASCADE,
  token      TEXT UNIQUE NOT NULL,
  used       BOOLEAN DEFAULT false,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_signal_tokens_token ON signal_tokens(token);
```

## Step 7 — set env vars on Render

In your Render service environment:
```
SIGNAL_PHONE_NUMBER=+1XXXXXXXXXX
SIGNAL_RPC_URL=http://localhost:7583
ADMIN_USER_ID=<your user UUID from the users table>
```

In Vercel (for the login page hint):
```
VITE_SIGNAL_BOT_NUMBER=+1XXXXXXXXXX
```

## Step 8 — deploy with Docker

Render will build from `server/Dockerfile`. The `start.sh` script:
1. Starts signal-cli as a background process on port 7583
2. Waits 4 seconds for it to initialize
3. Starts the Node.js server

## Verification

- `GET /api/signal/status` should return `{ connected: true, number: "+1..." }`
- Send any URL to the bot — it should reply "Saving… ⏳" then "Saved ✓"
- Send `recent` — get your last 5 links
- Send `login` — get a magic link that logs you into the web app

## How multi-user works

Every Signal number that messages the bot gets its own Trace account automatically:
- A placeholder email (`signal_<digits>@trace.local`) is created — never shown to the user
- The user logs in exclusively via magic links sent by the bot
- Existing web users can connect their Signal number via `PUT /api/users/me/signal` (optional)
