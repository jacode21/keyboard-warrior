# Keyboard Warrior: overnight review notes (Oct 19, 2026)

All times are America/New_York (EDT). Every production deploy below was preceded by the full suite in Chrome + WebKit:
`tools/all.sh` = KH 44/44 ×2, Arcade/Back Office 43/43 ×2, extras 16/16, mobile (iPhone 13 WebKit + Pixel 7 Chrome), plus live API tests against the preview deploy whenever the API changed.
Each deploy was verified with `tools/verify.sh`: apex + www 200 with the new build, AdSense script present, ads.txt = `google.com, pub-8691277458084963, DIRECT, f08c47fec0942fa0`.

## Ship 1: v5 (cca6be5)
Thematic copy pass ('80s trading floor), friendly-tight spacing (4/8 scale, 3px corners, 44px targets), KH on ← ↓ ↑ → + F2 (Space fallback),
3 original beats (Margin Call phonk 132, Short Squeeze jersey club 142, Bull Run sped-up pop 160), and the mobile touch desk (Quick Pick, contextual keypad, KH tap lanes + $ bar, touch Back Office).

## Ship 2: Big Board, analytics, Duel (87da6ff)
- **Big Board**: Pages Function `functions/api/[[path]].js` on **Workers KV** (`kw-lb` for production; preview now uses its own namespace, `kw-lb-preview`).
  D1 was refused by the token (`Authentication error [code 10000]`), so it needs **"Account → D1 → Edit"** if we ever move to D1. Not required: KV works.
  - Boards: all-time / weekly / today, for Arcade, Daily Tape, KH (per track + difficulty) and Back Office (per job), with separate keyboard and touch views.
  - `?desk=ACME` gives private office boards.
  - Anti-cheat: HMAC-signed run token (`LB_SECRET` Pages secret, generated, never printed), elapsed-time window per mode, single-use run ids, max-score and fill-rate sanity, and an 8/min rate limit keyed on a salted, truncated IP hash.
  - Names: max 16 characters, sanitized, profanity-filtered. Posting is opt-in, with an automatic option after the first post.
- **Analytics**: Cloudflare Web Analytics beacon (production hostnames only, so previews and tests don't count), plus aggregated per-day counts at `/api/stats` and a hidden `/stats.html` (noindex, not in the sitemap). The privacy page is updated.
- **Duel**: "Challenge a coworker" on every ticket builds a link carrying the seed and a per-second score trace. The opener gets the same tape and races a live "vs. NAME" ghost; the ending shows a WIN/LOSS stamp, the margin, and "Send it back".
  Arcade only for now. KH duel is not built.
- Live API tests passed (preview): signed token issued, early submit rejected (422), bad signature rejected (403), real 56s run accepted with rank "#N on the Street today", Big Board lists it, replayed run id rejected.
  I deleted my test rows from the production KV.

## Round 1 (Rubin: take away what fights the player)
**Critique.**
- KH Medium opened with six ↓ notes in a row: the cowbell hook repeats a pitch, so the pitch→lane map produced a "jackhammer". It reads as a bug in the first 10 seconds.
- Mobile Back Office hid three of the four arrow keys behind ⋯ (in a spreadsheet game!). It also showed a full job brief that the keypad then cut in half.

**Changes.**
- Chart rule: never 3+ notes in a row on one lane. A repeated pitch becomes a trill to the neighbouring lane. The rule is deterministic and uses no extra RNG, so charts stay derived from the music and note counts barely move: e.g. Margin Call Medium 224→228, Short Squeeze Hard 309→308.
- Mobile Back Office: a nav cluster row (← ↓ ↑ → Enter Tab Esc ⌫) plus an edit row (Del Home F2 F4 $ % . End). Closed checklist items fold away and the next one is tagged **NEXT**.
- Deployed to production.
