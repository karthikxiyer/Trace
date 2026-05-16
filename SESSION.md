# Trace — Build Session Log

**Date:** 2026-05-09 to 2026-05-16  
**Stack:** Node.js + Express · React + Vite + Tailwind · PostgreSQL (Supabase) · Redis (Upstash)  
**Live:** API → https://trace-87d0.onrender.com · Client → https://trace-mysoresadadosa.vercel.app

---

## Phase 1 — Project scaffold + auth

### What was built
- `server/` — Express app with CORS, JWT auth, bcrypt password hashing
- `server/db/001_create_users.sql` — users table with UUID PK, email index
- `server/middleware/auth.js` — `verifyToken` middleware (Bearer token → `req.user`)
- `server/routes/auth.js` — POST /register, POST /login, GET /me
- `client/` — Vite + React + Tailwind, configured Vite proxy to forward `/api` → `localhost:3001`
- `client/src/api/auth.js` — fetch helpers for all auth endpoints
- Login/Register pages storing JWT in localStorage
- `ProtectedRoute` component redirecting to `/login` if no token

### Key decisions
- bcrypt cost factor 12
- JWT expiry 7 days
- Generic error message on login failure (prevents email enumeration)
- ES modules (`"type": "module"`) throughout server

### Verified
```
POST /api/auth/register → JWT ✓
POST /api/auth/login    → JWT ✓
GET  /api/auth/me       → user object ✓
```

---

## Phase 2 — Save + display links

### What was built
- `server/db/002_create_links.sql` — links table with UUID, user_id FK, url, domain, og_image, title, description, starred/archived/read flags
- `server/services/scraper.js` — fire-and-forget async scraper using node-fetch + cheerio; extracts og:title, og:description, og:image; falls back to URL slug if site blocks scraping
- `server/routes/links.js` — POST / (save + scrape), GET / (paginated), PATCH /:id (starred/archived/read), DELETE /:id
- All PATCH/DELETE routes verify ownership with `WHERE id = $1 AND user_id = $2`
- `client/src/api/links.js` — fetch helpers
- `LinkCard` component with og_image, favicon fallback, star/archive/delete actions
- `SaveLinkForm` using `useMutation` + `invalidateQueries`
- `Feed` page with 3s polling (stops once all titles populated) using `useEffect` + `useState`
- `SkeletonCard` loading state, empty state
- Pagination with page state

### Key decisions
- `scrapeMetadata()` called without `await` — response returns in ~0ms, scrape happens in background
- Polling fix: `refetchInterval` as state (`useState(false)`) driven by `useEffect` watching data — avoids the react-query v5 bug where function form evaluates before data loads
- Slug fallback: `things-have-jobs-...` → "Things Have Jobs..."
- Browser User-Agent headers to pass basic bot checks

### Verified
```
POST /api/links → 201 with partial link (title: null) ✓
GET  /api/links → links array with tags ✓
PATCH/DELETE    → ownership enforced ✓
Card auto-populates title/description after scrape ✓
```

---

## Phase 3 — Tags, search + filtering

### What was built
- `server/db/003_create_tags.sql` — tags table (id, user_id, name, color) + link_tags join table with composite PK
- `server/db/004_add_search.sql` — tsvector column on links, GIN index, trigger on title+description UPDATE
- `server/routes/tags.js` — GET /, POST /, DELETE /:id, POST /:tagId/links/:linkId, DELETE /:tagId/links/:linkId
- Updated GET /api/links — LEFT JOIN link_tags + tags, `json_agg` for tags array, dynamic WHERE clause for tag/starred/archived/unread filters
- Default feed hides archived links; `?archived=true` shows archive
- `server/routes/search.js` — prefix-matching tsquery (`word:*`), ts_rank ordering
- `client/src/api/tags.js` — fetch helpers
- `TagBadge` — colored pill with optional remove button
- `AddTagInput` — popover dropdown; filters existing tags; creates + applies new tag inline; auto-assigns color from palette
- `FilterSidebar` — tag list, starred/unread/archive quick filters, clear button; drives URL search params
- `SearchBar` — 300ms debounce, navigates to `/search?q=...`
- Updated `Dashboard` — two-column layout (sidebar + `<Outlet>`)
- Nested React Router routes: `/` (Feed), `/search`, `/archive`
- `Feed` reads filters from `useSearchParams`

### Key decisions
- PATCHABLE whitelist on tags route prevents user_id/url overwrite
- `json_agg(...) FILTER (WHERE t.id IS NOT NULL)` handles links with no tags (returns `[]` not `[null]`)
- FilterSidebar uses URL search params — filters are bookmarkable
- Search uses `word:*` prefix matching so partial words return results while typing

---

## Phase 4 — Browser extension + PWA

### Chrome extension (`/extension`)
- Manifest V3 with `activeTab`, `storage`, `tabs` permissions
- `popup.html/js` — login form (stores JWT in `chrome.storage.local`) or save button
- `background.js` service worker — handles `Alt+Shift+S` shortcut, saves silently, flashes badge green/red
- Keyboard shortcut: `Alt+Shift+S` (Chrome requires two modifiers; customize at `chrome://extensions/shortcuts`)
- Server CORS updated to allow `chrome-extension://` origins

### PWA (`/client`)
- `vite-plugin-pwa` with `registerType: autoUpdate`
- Web manifest: name, icons, `share_target` (action: `/save`, method: GET, params: `{ url: 'url' }`)
- Workbox: NetworkFirst for `/api/links`, CacheFirst for static assets
- `/save` route: reads `?url=` param, auto-saves and redirects to feed after 1.5s
- `InstallPrompt` component: listens for `beforeinstallprompt`, shows install banner
- Icons generated as solid indigo PNGs (192×192, 512×512) via Python

### Key decisions
- `/save` is a standalone route (outside Dashboard layout) for PWA share target UX
- Share target only works over HTTPS in production
- Extension popup uses plain HTML/JS (no bundler)

---

## Phase 5 — Polish + deploy

### Redis caching
- `server/services/cache.js` — ioredis wrapper; Redis optional (no-ops if `REDIS_URL` unset)
- Cache key: `links:{userId}:page=N:live|archived[:starred][:unread][:tag=X]`
- 60s TTL set with `SETEX`
- Invalidation uses `SCAN` (not `KEYS`) for production safety; clears all `links:{userId}:*` on any mutation
- Tags route also invalidates on add/remove
- Result: 8s (cold) → ~1s (cached) on live Render instance

### Reader mode
- `@mozilla/readability` + `jsdom` added to scraper
- `server/db/005_add_content.sql` — adds `content TEXT` column to links
- Scraper stores Readability-parsed article HTML after metadata extraction
- `GET /api/links/:id/content` route returns stored content
- `ReaderView` page: clean single-column layout, 680px max-width, scoped CSS for headings/blockquotes/code
- 📖 button on LinkCard navigates to `/reader/:id`

### Notes
- `server/db/006_create_notes.sql` — notes table (id, link_id CASCADE, user_id, content, created_at)
- `GET + POST /api/links/:id/notes` routes (ownership verified via links table)
- Collapsible notes section on LinkCard; lazy-loads notes on open (`enabled: notesOpen`)
- Notes rendered in yellow-tinted cards with relative timestamps

### Production deploy
- `VITE_API_URL` env var in client — empty in dev (Vite proxy), set to Render URL in prod
- `client/vercel.json` — SPA rewrite `/(.*) → /index.html`
- `server/package.json` — `"engines": { "node": ">=18" }`
- `DEPLOY.md` — step-by-step Supabase → Upstash → Render → Vercel → Extension

---

## Live URLs

| Service | URL |
|---------|-----|
| API (Render) | https://trace-87d0.onrender.com |
| Client (Vercel) | https://trace-mysoresadadosa.vercel.app |
| Database | Supabase (project: wdutplpxsvdxiwprfmdx) |
| Redis | Upstash |

## Environment variables

### server/.env
```
DATABASE_URL=postgresql://postgres.wdutplpxsvdxiwprfmdx:...@aws-1-ap-south-1.pooler.supabase.com:5432/postgres
JWT_SECRET=...
CLIENT_URL=https://trace-mysoresadadosa.vercel.app
PORT=3001
REDIS_URL=rediss://...
```

### client (Vercel env vars)
```
VITE_API_URL=https://trace-87d0.onrender.com
```

---

## SQL migrations (run in order)
```
001_create_users.sql
002_create_links.sql
003_create_tags.sql
004_add_search.sql
005_add_content.sql
006_create_notes.sql
```

---

## Git commits
```
98fad5b  Initial commit — Trace link archival app (Phases 1–5)
540df43  Point extension to live Render API
```
