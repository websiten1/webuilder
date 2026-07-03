# insixlive — Pre-launch Security & Correctness Audit

**Date:** 2026-07-03
**Scope:** Full codebase — API routes, libs, proxy (middleware), config, env usage, client components.
**Stack note:** The brief mentioned Prisma and Tailwind; the actual code uses raw SQL via `@neondatabase/serverless` (no Prisma schema, no migrations tooling) and mostly inline styles. Findings reference the real code. Routing middleware lives in `proxy.ts`, not `middleware.ts`.

Severity legend:
- **CRITICAL** — exploitable now for money, account takeover, or data compromise; must fix before launch.
- **HIGH** — serious security/reliability defect, exploitable with modest effort or guaranteed to bite in production.
- **MEDIUM** — real defect, lower blast radius or requires unusual conditions.
- **LOW** — hygiene, dead code, drift.

---

## CRITICAL

### C1. Stripe webhook accepts unverified events when secret/signature is absent
- **File:** `app/api/webhooks/stripe/route.ts:33-38`
- If `STRIPE_WEBHOOK_SECRET` is unset **or** the `stripe-signature` header is missing, the handler does `event = JSON.parse(body)` and trusts it. Anyone can POST a forged `checkout.session.completed` with any `userId` → `markUserPaid()` + free site generation (LLM + deploy costs) for arbitrary accounts.
- **Fix:** Require `STRIPE_WEBHOOK_SECRET` at startup; if the secret or signature is missing, return 400 unconditionally. Never parse the raw body as a trusted event.

### C2. `verify-session` issues a login session to anyone holding a Stripe checkout session id
- **File:** `app/api/checkout/verify-session/route.ts:29-57`
- Possession of a `session_id` string (present in success-page URLs, browser history, referrer headers, logs) is treated as proof of identity: the handler resolves a user (via metadata, then **current session**, then **Stripe email**) and calls `createSession(...)` for that user — full account takeover from a leaked URL. It also calls `markUserPaid` with no idempotency.
- **Fix:** Never mint an auth session from a checkout session id. Require an existing authenticated session and verify `checkoutSession.metadata.userId === session.userId`. If the browser session expired mid-checkout, send the user through login instead.

### C3. `/api/generate-site` performs no payment check in the session path — free unlimited generation
- **File:** `app/api/generate-site/route.ts:497-527` (auth) — no payment verification anywhere in the handler.
- Any authenticated (even never-paid) user can POST directly to this endpoint and trigger full Claude Opus generation (up to 32k output tokens, 3 retry attempts — `lib/anthropic.ts:144-190`) plus a Vercel deployment, in a loop. Combined with **zero rate limiting** (finding H10/M4), this is an open faucet on your Anthropic and Vercel bills.
- **Fix:** Enforce payment server-side: require a verified, single-use payment record (e.g. a `site_credits`/`orders` row created only by the verified webhook) that is atomically consumed when generation starts. Add per-user rate limiting on this route.

### C4. Checkout-session fallback auth in `generate-site` is a replayable bearer token
- **File:** `app/api/generate-site/route.ts:504-523`
- A request with only a `checkoutSessionId` (no cookie) authenticates as the paying user. Stripe session ids never expire from this check and are not marked consumed, so one leaked/paid session id = unlimited generations and deployments as that user (falls back to matching the user **by Stripe email**, which the attacker controls at checkout).
- **Fix:** Remove this fallback (see C2 fix — the success page will have a valid session after proper re-auth), or make it single-use: record the session id in an `orders` table with a `consumed_at` column, set it transactionally, and reject reuse. Never resolve the user by email alone.

### C5. Double generation per payment: webhook and success page both trigger, with no idempotency
- **Files:** `app/api/webhooks/stripe/route.ts:56-70` (fire-and-forget) and `app/checkout/success/page.tsx:54-58`
- A normal paid flow triggers generation **twice**: once from the webhook, once from the browser success page. Nothing deduplicates them → two Anthropic runs, two Vercel projects, two `sites` rows for one payment. Stripe also retries webhooks, adding more. Payment state and deployment state have no linking key at all (`sites` has no `stripe_session_id` column).
- **Fix:** Key generation on the checkout session id: store it on an order/site record with a unique constraint, claim it atomically (`INSERT ... ON CONFLICT DO NOTHING` or `UPDATE ... WHERE consumed_at IS NULL`) before generating, and make both entry points go through that claim. Also handle `checkout.session.async_payment_failed`/out-of-order events by checking `payment_status` from Stripe, not the event alone.

---

## HIGH

### H1. Debug instrumentation shipped in production code, client and server (24 call sites)
- **Files:** `app/api/generate-site/route.ts` (9), `app/components/GenerateWizard.tsx` (5), `app/generate.tsx` (5), `lib/vercel.ts` (3), `app/api/auth/me/route.ts:8-10` (1), `app/dashboard/_dash/OverviewPage.tsx:112-125` (1)
- Hardcoded `fetch('http://127.0.0.1:7469/ingest/...')` calls (left over from a debug session) run on every request/page view. Server-side they log `resolvedUserId`, `checkoutSessionId`, and raw error text to a local port (on Vercel, whatever listens on it); client-side every visitor's browser POSTs to *their own* localhost. Pure liability.
- **Fix:** Delete every `// #region agent log` block and the `useEffect` telemetry in `OverviewPage.tsx`.

### H2. Unauthenticated `/api/debug` leaks secret prefixes and environment layout
- **File:** `app/api/debug/route.ts:20-29`
- Public GET returns the first 15 chars of `ANTHROPIC_API_KEY`, which env vars are set, `cwd`, and the `.env.local` path.
- **Fix:** Delete the route (or gate behind an admin secret at minimum).

### H3. Unauthenticated `/api/db/migrate` runs DDL — and the schema it creates is incomplete
- **File:** `app/api/db/migrate/route.ts:6-75`
- Anyone can POST and execute DDL on your production database. Worse, the migration is badly out of date: it creates no `site_edits` or `wizard_drafts` tables and omits most columns the code depends on (`sites.vercel_project_id`, `deployment_status`, `pricing_tier`, `free_edits_remaining`, `custom_domain*`; `users.vercel_access_token`, `verification_code`, etc.). A fresh environment "migrated" by this route breaks at runtime.
- **Fix:** Remove the route from production. Move schema to real migration files (drizzle-kit, node-pg-migrate, or SQL files run in CI) that reflect the full current schema.

### H4. Vercel OAuth callback: state validation is optional (CSRF)
- **File:** `app/api/auth/vercel/callback/route.ts:24-39`
- The state check only runs `if (cookieRaw && state)`. If the cookie is absent (cross-site request), the code proceeds to exchange whatever `code` the attacker supplied and binds the **attacker's Vercel account** to the victim's logged-in session — future "your own Vercel" deployments (including site content) land in the attacker's account.
- **Fix:** Fail closed: if the state cookie or param is missing or mismatched, redirect to error. Delete the legacy plain-string fallback.

### H5. OAuth access token logged in plaintext
- **File:** `app/api/auth/vercel/callback/route.ts:80` — `console.log("Vercel token response:", tokenRes.status, tokenBody)`
- The full token-exchange response (containing `access_token`) goes to production logs, defeating the at-rest encryption in `lib/encryption.ts`.
- **Fix:** Remove the log line (log status only on failure).

### H6. Domain connect routes use the encrypted token blob as a Bearer token, and a hardcoded team id
- **Files:** `app/api/domains/auto-connect-purchased/route.ts:5,27-32`; `app/api/domains/add/route.ts:5,30-33`
- `auto-connect-purchased` sends `user.vercel_access_token` **raw from the DB** — that's the `iv:tag:ciphertext` string, never decrypted (`getDecryptedVercelToken` exists but isn't used) → always 403 for OAuth users, then it silently proceeds with the platform token. `domains/add` reads `site.user_vercel_token`, a field that does not exist on `Site` (hidden by an `as unknown as` cast) → always the platform token. Both hardcode `TEAM_ID = "team_f7GtKyI6RueAw15YIqyJz8qA"`, so customer domains get attached under your team even when the project lives in the user's account — guaranteed wrong-project/permission failures.
- **Fix:** Use `getDecryptedVercelToken(userId)` and the user's `teamId`; only fall back to the platform token for legacy platform-owned projects. Remove the hardcoded team id and the phantom-field cast.

### H7. Site URLs constructed from `vercel_project_id`, which is not a subdomain
- **Files:** `app/api/edits/process/route.ts:145-146`; `app/api/generate-site/route.ts:599-600` (regeneration path)
- `deployToVercel` stores Vercel's **project id** (`prj_…`) when available (`lib/vercel.ts:123-131`), but these paths build `https://${vercel_project_id}.vercel.app` → dead links saved to the DB and emailed to customers whenever `projectId` came back as `prj_…`. (The create path uses `projectName`, which is correct.)
- **Fix:** Store both `project_id` and `project_name`; build URLs from the deployment response's `url`/alias, never from the project id.

### H8. Partial-failure states leave orphans and charged-but-siteless customers
- **File:** `app/api/generate-site/route.ts:617-646` (deploy → then DB write), `727-752` (catch)
- If `saveSiteWithVercel` fails after a successful deploy, the user paid, a Vercel project exists, but the dashboard shows nothing — no retry, no cleanup, no reconciliation record. Same shape in the parish-calendar re-deploy block (L683-703). Conversely the webhook marks users paid even if generation never starts (fire-and-forget with only `.catch(console.error)`, `webhooks/stripe/route.ts:58-70`).
- **Fix:** Introduce a `generation_jobs`/orders table with states (`paid → generating → deployed → recorded`), write the row **before** deploying, and reconcile stuck jobs (retry or refund). Wrap deploy+DB in ordered steps with compensation (delete the Vercel project if the DB write ultimately fails).

### H9. Silent "emergency fallback" ships a generic non-AI page to paying customers
- **File:** `app/api/generate-site/route.ts:560-579` and `buildEmergencyWebsiteCode` (L179-260 region)
- When Anthropic credits are exhausted, the API quietly deploys a hardcoded template and returns success; `checkout/success/page.tsx` ignores `emergencyFallbackUsed`, so a customer pays €59.99 and receives a placeholder with no notice — refund/chargeback bait.
- **Fix:** Fail the generation with the 402 path (already present at L738-747), keep the payment credit unconsumed so the user can retry, and alert yourself (email/Slack) on credit exhaustion. If you keep a fallback, it must be explicit to the user and flagged for follow-up.

### H10. Verification codes: `Math.random()`, no attempt limit, no resend limit
- **Files:** `app/api/auth/signup/route.ts:7-9`; `app/api/auth/resend-verification/route.ts:5-7,24-30`; `app/api/auth/verify-code/route.ts` (no attempt counter)
- Codes come from `Math.random()` (not CSPRNG, statistically predictable), are valid 15 minutes, and `verify-code` allows unlimited guesses — a 6-digit space is brute-forceable, and success mints a session (`verify-code/route.ts:37-41`) → pre-verification account takeover. `resend-verification` also lets anyone spam Resend emails at your cost.
- **Fix:** Use `crypto.randomInt(100000, 1000000)`, cap attempts per code (e.g. 5, then invalidate), and rate-limit both endpoints per email/IP.

### H11. Raw internal errors returned to clients
- **File:** `app/api/generate-site/route.ts:749-752` (also `lib/vercel.ts:113-118` propagating full Vercel API bodies)
- The catch-all returns `error.message` verbatim — Anthropic billing messages with request ids (observed in production), Vercel API JSON, DB errors — to the browser.
- **Fix:** Log the full error server-side; return a generic message + stable error code to clients. Whitelist the few user-actionable cases (e.g. the 402 credits path).

### H12. Webhook-triggered generation is silently broken by config/contract drift
- **Files:** `app/api/webhooks/stripe/route.ts:62,68`; `app/api/generate-site/route.ts:491`
- `INTERNAL_SECRET` is absent from `.env.example` — if unset, the webhook sends `x-internal-secret: ""`, which fails the truthy check, and the request falls through to cookie auth (none) → 401 for every webhook-triggered generation. The webhook also sends `stripeSessionId`, but `generate-site` reads `checkoutSessionId`, so the fallback path can never engage from the webhook. The comparison is also not constant-time.
- **Fix:** Add `INTERNAL_SECRET` to env docs and fail fast at boot if missing; align the body key; compare with `crypto.timingSafeEqual`.

---

## MEDIUM

### M1. No input validation at API boundaries; unbounded image payloads
- **Files:** all routes (`await request.json()` destructured raw); notably `app/api/generate-site/route.ts:474-487` and `app/api/wizard/save-draft/route.ts:26-27`
- No zod/schema anywhere. `formData` (including arbitrarily many base64 gallery images) is accepted at any size — memory blowups, oversized Vercel deploy payloads, and junk in `design_preferences`. Only edit descriptions have length checks.
- **Fix:** Add zod schemas per route; enforce max image count/size (e.g. 10 images, 2MB each) and reject oversized bodies early.

### M2. Multi-step writes without transactions or idempotency
- **Files:** `app/api/edits/create-checkout/route.ts:35-44` (create edit → decrement free edits: concurrent requests can spend one credit twice); `app/api/edits/process/route.ts:60-89` (no guard against two concurrent `processing` runs for the same edit); `lib/db.ts` (every helper is a single standalone statement)
- **Fix:** Use conditional single-statement updates as locks (`UPDATE sites SET free_edits_remaining = free_edits_remaining - 1 WHERE id = $1 AND free_edits_remaining > 0 RETURNING *`; `UPDATE site_edits SET status='processing' WHERE id=$1 AND status IN ('pending','paid') RETURNING *`) and bail if 0 rows.

### M3. `/api/pexels` is an unauthenticated proxy for your Pexels key
- **File:** `app/api/pexels/route.ts:3-31`
- Anyone can burn your Pexels quota.
- **Fix:** Require a session; add basic per-user rate limiting.

### M4. Login: no rate limiting, timing-based user enumeration
- **File:** `app/api/auth/login/route.ts:17-31`
- Unknown-email requests return without a bcrypt compare (fast path) → enumeration; unlimited attempts → credential stuffing.
- **Fix:** Rate-limit per IP+email; always run a dummy bcrypt compare when the user is missing.

### M5. `deployToVercel` silently falls back to the platform token
- **File:** `lib/vercel.ts:26`
- If a user's OAuth token is missing/revoked mid-flow, their site deploys into **your** Vercel account with no warning — ownership desync that contradicts the "your own Vercel" promise, and revoked tokens surface only as opaque Vercel 403s.
- **Fix:** For user-owned flows, fail with a clear "reconnect Vercel" error (and detect 401/403 from Vercel to mark the connection broken via `clearVercelAuth`). Keep the platform token only for explicitly platform-owned legacy projects.

### M6. Prompt injection via wizard free-text
- **File:** `app/api/generate-site/route.ts` `buildPrompt()` (L272-470) interpolates raw user text (`description`, `aboutText`, `additionalNotes`, …) into the prompt
- A hostile user can override your "PERMANENT RULES" (e.g. demand external scripts/forms in generated code) — the generated site runs on their account, but your validation (`lib/anthropic.ts:33-64`) only checks syntax, not content.
- **Fix:** Accept as residual risk, but add output checks for the invariants you care about (no `<form>`, no external `<script>`/image hosts) before deploying.

### M7. `wizard_drafts`: DDL on every request, unbounded payload, never purged
- **File:** `app/api/wizard/save-draft/route.ts:11-37`
- `CREATE TABLE IF NOT EXISTS` runs on every save/read (needless round-trip, needs DDL rights); drafts hold full base64 image sets indefinitely (PII/cost retention); drafts aren't deleted after successful generation.
- **Fix:** Move DDL to migrations; strip or size-cap images in drafts; delete the draft when generation completes.

### M8. Missing indexes on hot query paths
- **Evidence:** `lib/db.ts` queries on `sites.user_id` (L334-354), `site_edits.site_id`/`user_id` (L275-308), `users.verification_code + email` (L371-384), `parish_calendar_modules.site_id` (has UNIQUE, ok)
- Only implicit PK/unique indexes exist (`db/migrate` creates none).
- **Fix:** `CREATE INDEX ON sites(user_id); CREATE INDEX ON site_edits(site_id); CREATE INDEX ON site_edits(user_id);` (verification-code lookups are fine once attempts are limited, but an index on `users(email)` already exists via UNIQUE).

### M9. Env documentation drift
- **File:** `.env.example`
- Missing: `SESSION_SECRET` (auth breaks without it), `STRIPE_WEBHOOK_SECRET`, `RESEND_API_KEY`, `PEXELS_API_KEY`, `INTERNAL_SECRET`, `DATABASE_URL` placeholder is also the "unconfigured" sentinel in code. Contains unused `NEXTAUTH_SECRET` and `GITHUB_BOT_TOKEN` (github lib is dead code).
- **Fix:** Sync `.env.example` with actual usage; add a boot-time env assertion module.

### M10. `readToken` silently falls back to plaintext on decryption failure
- **File:** `lib/encryption.ts:41-44`
- Intended for legacy rows, but it also masks a wrong/rotated `TOKEN_ENCRYPTION_KEY`: the ciphertext blob itself gets used as a bearer token → confusing downstream 403s (this is exactly the H6 bug shape).
- **Fix:** Distinguish "legacy plaintext" (no `:` separators) from "decryption failed" (log loudly / surface an error).

### M11. Unsafe casts hiding real bugs
- **Files:** `app/api/domains/add/route.ts:30` (`site as unknown as { user_vercel_token?: string }` — phantom field, see H6); `app/api/generate-site/route.ts:610,644` (`formData as unknown as Record<string, unknown>`)
- **Fix:** Remove the phantom-field cast; type `design_preferences` as `WizardData` end-to-end.

### M12. Billing history amounts are hardcoded guesses, not Stripe data
- **File:** `app/api/billing/history/route.ts:5-9,22-36`
- Prices (`49.99/59.99/10`) are inferred from tier constants; the wizard actually charges €59.99 via a hardcoded Payment Link (`GenerateWizard.tsx:76`) while `create-session` charges €59.99 and `create-payment-intent-site` €49.99 — three sources of truth. Lifetime spend shown to users can be wrong.
- **Fix:** Derive billing history from Stripe (customer payments list) or store the actual amount paid on the order row at webhook time.

---

## LOW

### L1. Dead code
- `app/generate.tsx` — legacy page component, not a route (only `page.tsx` files route); references a `data.repoName` flow that no longer exists. Delete.
- `lib/github.ts` — no imports anywhere (GitHub deploy flow was replaced by direct Vercel deploys). Delete along with `GITHUB_BOT_TOKEN` references (`app/api/debug/route.ts:23`).
- `app/api/auth/verify-email/route.ts` — legacy link-based verification; signup now uses 6-digit codes and creates users with `verification_token='unused'`/epoch expiry. Verify `/verify-email` page no longer calls it, then delete.
- `app/api/checkout/create-payment-intent-site/route.ts` — PaymentIntent flow (€49.99) appears superseded by the Payment Link + `create-session`; confirm `app/checkout/page.tsx` is unreachable, then delete both.
- `app/api/auth/vercel/status/route.ts` — diagnostic endpoint exposing config summary (client id, redirect URI); harmless-ish but should not ship.
- `saveSite`, `getSiteEditsBysite` (typo name) in `lib/db.ts` — unused helpers.

### L2. Dependency hygiene
- Both `framer-motion` **and** `motion` are installed (same library, two names).
- `@types/bcryptjs` sits in `dependencies` (bcryptjs ships its own types; move/remove).
- Verify and prune: `dotted-map`, `recharts`, `react-use-measure`, `@stripe/react-stripe-js`, `@stripe/stripe-js`, `lucide-react` — several appear only in marketing pages or not at all.
- `resend` is imported but `RESEND_API_KEY` is absent from `.env.example` (see M9).

### L3. Password policy inconsistency
- Signup requires ≥8 chars (`signup/route.ts:30`), change-password requires ≥10 (`change-password/route.ts:20`). Align (10+).

### L4. Session design quirks
- JWT expiry is 15 minutes with sliding refresh via `/api/auth/refresh` (`lib/session.ts:22,54-60`); the OAuth flow works around expiry by re-issuing sessions (`vercel/callback:101-105`). Consider a 7-day refresh cookie + short access token instead of the ad-hoc re-issue pattern; current design logs users out mid-wizard if the tab idles 15 minutes and misses a refresh.
- `proxy.ts:43` matcher exempts all of `/api` — fine since routes self-authenticate (verified), but worth a comment so nobody assumes middleware coverage.

### L5. Misc
- `app/api/webhooks/stripe/route.ts:56` — `NEXT_PUBLIC_URL` fallback to production domain means local webhook testing hits prod.
- `lib/anthropic.ts:9-21` — hand-parses `.env.local` as a fallback for the API key; surprising and unnecessary on Vercel.
- `app/api/domains/search/route.ts` — NS-lookup "availability" is a heuristic and will show false positives; label results as approximate in the UI.
- `success/[siteId]/page.tsx:100-104` — dead dark-theme styles/"WebBuilder" branding inconsistent with the rest of the product.

---

## Suggested fix order (Phase 2 batches)

1. **Security:** C1, C2, C4, H2, H3, H4, H5, H10, M3, M4 (+ H1 debug-log removal)
2. **Payments:** C3, C5, H12, M12
3. **Pipeline reliability:** H6, H7, H8, H9, M2, M5, M10
4. **Error handling & validation:** H11, M1, M6, M7
5. **Everything else:** M8, M9, M11, all LOW items

Items needing your explicit sign-off before implementation (behavior/schema changes):
- New `orders`/`generation_jobs` table + unique constraint on Stripe session id (C3/C5/H8) — schema migration.
- Removing the emergency fallback in favor of fail+retry (H9) — user-visible behavior change.
- Removing the checkout-session fallback auth (C2/C4) — changes the post-payment redirect flow.
- Session lifetime redesign (L4) — user-visible.
