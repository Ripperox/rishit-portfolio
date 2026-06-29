# Live Features + Repositioning — Design

Date: 2026-06-29

## Goal
Make the portfolio (a) more genuinely interactive with real data, and (b) positioned
software-dev-first instead of blockchain-first.

## Architecture
Keep the Vite SPA; add Vercel serverless functions in a root `/api` folder (no Next.js).
Storage: Upstash Redis (free, via Vercel Marketplace integration). All API functions
**degrade gracefully** when Redis env vars are absent (site still works; live data
"activates" once Upstash is provisioned). GitHub proxy works with no DB.

### Endpoints
- `GET /api/visit` — geo from Vercel edge headers (`x-vercel-ip-latitude/longitude/city/country`),
  coords rounded to city-level (≈1 decimal), **no IP/PII stored**. Dedupe by salted
  hash(IP+UA) with 24h TTL so the counter is honest. Returns `{ total, yourNumber, recent[], you }`.
- `GET/POST /api/guestbook` — recent messages (filtered to last 48h on read); POST validates
  (name ≤24, msg ≤140, HTML-strip, profanity filter), rate-limited 1/30s per visitor-hash,
  geo attached. `DELETE ?key=ADMIN_KEY` clears (admin only).
- `GET /api/github` — server proxy to GitHub REST for `Ripperox` (repos, stars, top languages,
  recent pushes, last active), Redis-cached ~10 min. No DB required (cache optional).

## Frontend
### New "Live" section (`LiveSection`)
- `cobe` WebGL globe (~6KB): real markers at recent visitor locations, user's own highlighted,
  drag-to-spin + auto-rotate. `GLOBAL_PING: ACTIVE` + "You are visitor #N" (NumberFlow).
- Real **guestbook** beside it: live messages (name · city · relative time) + an input to post,
  which drops a marker on the globe.
### `GitHubActivity` section
- Real repo/star counts, recent pushes, top-language bar, "last commit X ago" — from `/api/github`.
### Repositioning (reframe, keep the best)
- Headline/About: lead with backend · distributed systems · realtime · full-stack; drop crypto framing.
- Alpharooms: reframed as a realtime-systems case study + explicit **"interactive demo"** label.
- Throughput Lab: explicit **"simulation"** label.
- Skills: replace Solana/TRON ecosystem panel with a **"Selected Work"** panel (LLM Gateway,
  cc-meter, FlavourScout, Solana Monitor); de-emphasize Solidity.
- Ticker: real dev signal (visitor count, GitHub stars, last deploy) instead of fake prices.

## Privacy & abuse
City-level coords only, no IPs/PII persisted; guestbook rate-limited, length-capped,
HTML-stripped, profanity-filtered, 48h expiry, admin kill-switch.

## New deps
`@upstash/redis`, `cobe`. Functions in `/api` (ESM). User provisions Upstash via Vercel 1-click.
