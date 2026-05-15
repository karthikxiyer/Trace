# Deploy Guide

## 1. Supabase — run all SQL migrations in order

Open **SQL Editor** in your Supabase project and run each file in sequence:

```
server/db/001_create_users.sql
server/db/002_create_links.sql
server/db/003_create_tags.sql
server/db/004_add_search.sql
server/db/005_add_content.sql
server/db/006_create_notes.sql
```

## 2. Upstash — create Redis database

1. Go to [upstash.com](https://upstash.com) → Create Database → select region closest to your Render server
2. Copy the **Redis URL** (starts with `rediss://`) from the REST API tab
3. Keep it handy for step 3

## 3. Render — deploy the API server

1. Go to [render.com](https://render.com) → New → Web Service
2. Connect your repo, set **Root Directory** to `server`
3. Build command: `npm install`
4. Start command: `npm start`
5. Add all environment variables:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | Supabase connection string (Session Pooler URI) |
| `JWT_SECRET` | A long random string (generate with `openssl rand -base64 32`) |
| `CLIENT_URL` | Your Vercel URL (e.g. `https://trace.vercel.app`) |
| `PORT` | `3001` |
| `REDIS_URL` | Upstash Redis URL from step 2 |

6. Deploy. Note your Render URL (e.g. `https://trace-api.onrender.com`)

## 4. Vercel — deploy the client

1. Go to [vercel.com](https://vercel.com) → New Project → import your repo
2. Set **Root Directory** to `client`
3. Framework preset: **Vite**
4. Add environment variable:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | Your Render URL (e.g. `https://trace-api.onrender.com`) |

5. Deploy. Note your Vercel URL.
6. Go back to Render → update `CLIENT_URL` to your Vercel URL → redeploy

## 5. Chrome extension — point to live API

Open `extension/popup.js` and `extension/background.js`. Change:

```js
const API_BASE = 'http://localhost:3001/api';
```

to:

```js
const API_BASE = 'https://trace-api.onrender.com/api';
```

Also update `manifest.json` → `host_permissions`:

```json
"host_permissions": ["https://trace-api.onrender.com/*"]
```

Reload the extension in `chrome://extensions`.

## 6. Verify

- [ ] `GET https://trace-api.onrender.com/health` returns `{"status":"ok"}`
- [ ] Register + login at your Vercel URL
- [ ] Save a link — card appears and populates with title/description
- [ ] Extension popup signs in and saves the current tab
- [ ] On mobile: install PWA → Share a page → Trace → link saved instantly
- [ ] Turn off network on desktop → feed loads from service worker cache

## Env var summary

### server/.env (local dev)
```
DATABASE_URL=...
JWT_SECRET=...
CLIENT_URL=http://localhost:5173
PORT=3001
REDIS_URL=rediss://...   # optional in dev
```

### client/.env.local (local dev)
```
VITE_API_URL=            # leave empty, Vite proxy handles it
```
