# Vercel OAuth Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the manual Vercel API token paste with a one-click OAuth 2.0 "Connect with Vercel" flow so users never copy-paste a token.

**Architecture:** The OAuth backend (authorize + callback routes) is already built and functional. What's missing is: (1) token encryption at rest, (2) a `getValidVercelToken(userId)` helper consumed by the deploy and domain routes, (3) a "Connect with Vercel" gate UI in the generate page, and (4) wiring the generate-site route to use the user's OAuth token (falling back to the platform token). The old manual-paste endpoint (`save-token`) stays as-is for backward compat — it writes to the same column so existing users are unaffected.

**Tech Stack:** Next.js 16 App Router, Node.js `crypto` (AES-256-GCM), Neon PostgreSQL via `@neondatabase/serverless`, `jose` for session JWTs, React 18.

---

## Existing Infrastructure (do NOT re-create these)

- `app/api/auth/vercel/authorize/route.ts` — OAuth initiation (generates state, sets cookie, redirects to Vercel)
- `app/api/auth/vercel/callback/route.ts` — Token exchange, saves via `saveVercelAuth`, re-issues session
- `app/api/auth/vercel/save-token/route.ts` — Manual token paste (old flow, keep for compat)
- `app/api/auth/vercel/status/route.ts` — Diagnostic endpoint
- `lib/db.ts` → `saveVercelAuth(userId, accessToken, vercelUserId, teamId)` — already exists
- `users` table already has: `vercel_access_token`, `vercel_user_id`, `vercel_team_id`, `vercel_authorized`, `vercel_authorized_at`
- `/api/auth/me` already returns `vercelAuthorized: user.vercel_authorized ?? false`
- `.env.local` already has `VERCEL_OAUTH_CLIENT_ID`, `VERCEL_OAUTH_CLIENT_SECRET`, `VERCEL_OAUTH_REDIRECT_URI`, `NEXT_PUBLIC_URL`

---

## File Map

| Action   | File                                         | Responsibility                                      |
|----------|----------------------------------------------|-----------------------------------------------------|
| Create   | `lib/encryption.ts`                          | AES-256-GCM encryptToken / decryptToken             |
| Modify   | `lib/db.ts`                                  | Encrypt on save; add `getDecryptedVercelToken()`    |
| Modify   | `lib/vercel.ts`                              | Add `getValidVercelToken(userId)`                   |
| Modify   | `app/api/generate-site/route.ts`             | Pass user token to both new-site and re-deploy      |
| Modify   | `app/generate/page.tsx`                      | Add VercelGate after terms, handle callback params  |
| Modify   | `.env.example`                               | Document `TOKEN_ENCRYPTION_KEY`                     |

---

## Task 1: Encryption helpers

**Files:**
- Create: `lib/encryption.ts`

- [ ] **Step 1: Create `lib/encryption.ts`**

```ts
// lib/encryption.ts
import crypto from "crypto";

const ALGO = "aes-256-gcm";

function getKey(): Buffer {
  const key = process.env.TOKEN_ENCRYPTION_KEY;
  if (!key) throw new Error("TOKEN_ENCRYPTION_KEY is not set");
  const buf = Buffer.from(key, "hex");
  if (buf.length !== 32) throw new Error("TOKEN_ENCRYPTION_KEY must be 32 bytes (64 hex chars)");
  return buf;
}

// Returns "iv:authTag:ciphertext" (all hex)
export function encryptToken(plaintext: string): string {
  const key = getKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGO, key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted.toString("hex")}`;
}

// Returns null if decryption fails (plain-text legacy token, bad key, etc.)
export function decryptToken(ciphertext: string): string | null {
  try {
    const key = getKey();
    const parts = ciphertext.split(":");
    if (parts.length !== 3) return null;
    const iv = Buffer.from(parts[0], "hex");
    const authTag = Buffer.from(parts[1], "hex");
    const encrypted = Buffer.from(parts[2], "hex");
    const decipher = crypto.createDecipheriv(ALGO, key, iv);
    decipher.setAuthTag(authTag);
    return decipher.update(encrypted) + decipher.final("utf8");
  } catch {
    return null;
  }
}

// Reads a DB value that may be encrypted or legacy plain text.
export function readToken(dbValue: string): string {
  const decrypted = decryptToken(dbValue);
  return decrypted ?? dbValue; // fall back to plain text for legacy rows
}
```

- [ ] **Step 2: Verify the file compiles (no errors)**

```bash
cd /Users/andreiradu/websitebuilder && npx tsc --noEmit 2>&1 | head -30
```

Expected: no errors related to `lib/encryption.ts`.

- [ ] **Step 3: Commit**

```bash
git add lib/encryption.ts
git commit -m "feat: add AES-256-GCM token encryption helpers"
```

---

## Task 2: Update DB to encrypt on save and decrypt on read

**Files:**
- Modify: `lib/db.ts` (lines 325–342 `saveVercelAuth`, plus add `getDecryptedVercelToken`)

- [ ] **Step 1: Update `saveVercelAuth` to encrypt the token**

Find the existing `saveVercelAuth` function in `lib/db.ts` (lines 325–342) and replace it:

```ts
export async function saveVercelAuth(
  userId: string,
  accessToken: string,
  vercelUserId: string | null,
  teamId: string | null
): Promise<void> {
  const sql = getDb();
  // Import here to avoid circular deps; encryption is lazy so missing key fails at call time
  const { encryptToken } = await import("@/lib/encryption");
  const encrypted = encryptToken(accessToken);
  await sql`
    UPDATE users
    SET vercel_access_token = ${encrypted},
        vercel_user_id = ${vercelUserId},
        vercel_team_id = ${teamId},
        vercel_authorized = TRUE,
        vercel_authorized_at = NOW(),
        updated_at = NOW()
    WHERE id = ${userId}
  `;
}
```

- [ ] **Step 2: Add `getDecryptedVercelToken(userId)` to `lib/db.ts`**

Add this function after `saveVercelAuth`:

```ts
export async function getDecryptedVercelToken(
  userId: string
): Promise<{ token: string; teamId: string | null } | null> {
  const sql = getDb();
  const rows = await sql`
    SELECT vercel_access_token, vercel_team_id
    FROM users
    WHERE id = ${userId} AND vercel_authorized = TRUE
    LIMIT 1
  `;
  const row = rows[0] as { vercel_access_token: string | null; vercel_team_id: string | null } | undefined;
  if (!row?.vercel_access_token) return null;
  const { readToken } = await import("@/lib/encryption");
  return {
    token: readToken(row.vercel_access_token),
    teamId: row.vercel_team_id,
  };
}
```

- [ ] **Step 3: Check TypeScript**

```bash
cd /Users/andreiradu/websitebuilder && npx tsc --noEmit 2>&1 | head -30
```

Expected: no new type errors.

- [ ] **Step 4: Commit**

```bash
git add lib/db.ts
git commit -m "feat: encrypt Vercel tokens at rest, add getDecryptedVercelToken helper"
```

---

## Task 3: Add `getValidVercelToken` to `lib/vercel.ts`

**Files:**
- Modify: `lib/vercel.ts` (add helper, update `checkDeploymentStatus`)

- [ ] **Step 1: Add `getValidVercelToken(userId)` at the top of `lib/vercel.ts`**

Add this export before `deployToVercel`:

```ts
// Returns the user's decrypted Vercel OAuth token, or null if not connected.
export async function getValidVercelToken(
  userId: string
): Promise<{ token: string; teamId: string | null } | null> {
  const { getDecryptedVercelToken } = await import("@/lib/db");
  return getDecryptedVercelToken(userId);
}
```

- [ ] **Step 2: Update `checkDeploymentStatus` to accept an optional token**

Replace the existing `checkDeploymentStatus` signature and body:

```ts
export async function checkDeploymentStatus(
  deploymentId: string,
  userToken?: string
): Promise<{ state: string; url?: string }> {
  const token = userToken ?? process.env.VERCEL_API_TOKEN;

  if (!token) {
    throw new Error("No Vercel token available for checkDeploymentStatus");
  }

  try {
    const response = await fetch(
      `https://api.vercel.com/v13/deployments/${deploymentId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errBody = await response.json().catch(() => response.text());
      throw new Error(
        `Vercel API error: ${response.status} ${JSON.stringify(errBody)}`
      );
    }

    const data = await response.json();

    return {
      state: data.state,
      url: data.url,
    };
  } catch (error) {
    console.error("Error checking deployment status:", error);
    throw error;
  }
}
```

- [ ] **Step 3: TypeScript check**

```bash
cd /Users/andreiradu/websitebuilder && npx tsc --noEmit 2>&1 | head -30
```

- [ ] **Step 4: Commit**

```bash
git add lib/vercel.ts
git commit -m "feat: add getValidVercelToken helper, make checkDeploymentStatus accept optional token"
```

---

## Task 4: Wire `generate-site` route to use user's OAuth token

**Files:**
- Modify: `app/api/generate-site/route.ts`

The route already resolves `resolvedUserId` and fetches `user`. It calls `deployToVercel()` twice:
1. Line ~449: Update existing site (passes no userToken)
2. Line ~471: Create new site (passes no userToken)

Both need to pull the user's OAuth token and pass it as `userToken`. Fall back to platform token if not connected.

- [ ] **Step 1: Import `getValidVercelToken` and resolve the user's token early in the POST handler**

After the existing `const user = await getUserById(resolvedUserId);` line (around line 413), add:

```ts
    // Resolve user's OAuth token (falls back to platform token inside deployToVercel)
    const vercelAuth = await getValidVercelToken(resolvedUserId);
    const userVercelToken = vercelAuth?.token ?? undefined;
    const userTeamId = vercelAuth?.teamId ?? undefined;
```

Add the import at the top of the file:

```ts
import { deployToVercel, getValidVercelToken } from "@/lib/vercel";
```

(Replace the existing `import { deployToVercel } from "@/lib/vercel"` line.)

- [ ] **Step 2: Pass token to the "update existing site" deploy call**

Find the line around 449:
```ts
      const deployment = await deployToVercel(existingSite.vercel_project_id!, websiteCode, {
        staticImages,
      });
```

Replace with:
```ts
      const deployment = await deployToVercel(existingSite.vercel_project_id!, websiteCode, {
        staticImages,
        userToken: userVercelToken,
        teamId: userTeamId,
      });
```

- [ ] **Step 3: Pass token to the "create new site" deploy call**

Find the line around 471:
```ts
    const deployment = await deployToVercel(projectName, websiteCode, {
      staticImages,
    });
```

Replace with:
```ts
    const deployment = await deployToVercel(projectName, websiteCode, {
      staticImages,
      userToken: userVercelToken,
      teamId: userTeamId,
    });
```

- [ ] **Step 4: TypeScript check**

```bash
cd /Users/andreiradu/websitebuilder && npx tsc --noEmit 2>&1 | head -30
```

- [ ] **Step 5: Commit**

```bash
git add app/api/generate-site/route.ts
git commit -m "feat: wire generate-site to use user Vercel OAuth token when available"
```

---

## Task 5: "Connect with Vercel" gate in the generate page

**Files:**
- Modify: `app/generate/page.tsx`

The page currently has: `loading → terms → ready (wizard)`. We need to add a `vercel` gate between `terms` and `ready`.

The gate shows only if `user.vercelAuthorized` is `false`. It shows a "Connect with Vercel" button that navigates to `/api/auth/vercel/authorize`. On return (with `?vercel_authorized=true`), the gate passes. On error (`?error=vercel_denied` etc.), it shows a message and a retry button.

The existing `/api/auth/me` already returns `vercelAuthorized`. The authorize endpoint already redirects back to `/generate?vercel_authorized=true` on success.

- [ ] **Step 1: Update the Gate type and add `vercel` state**

In `app/generate/page.tsx`, find:
```ts
type Gate = "loading" | "terms" | "ready";
```

Replace with:
```ts
type Gate = "loading" | "terms" | "vercel" | "ready";
```

- [ ] **Step 2: Add `VercelGate` component**

Add this component after the `TermsGate` function and before `// ─── Main ───`:

```tsx
function VercelGate({ error }: { error: string | null }) {
  const errorMessages: Record<string, string> = {
    vercel_denied: "You cancelled the Vercel authorisation. Click below to try again.",
    vercel_state_mismatch: "Something went wrong with the authorisation flow. Please try again.",
    vercel_no_code: "Vercel did not return an authorisation code. Please try again.",
    vercel_callback_failed: "The Vercel authorisation failed. Please try again or contact support.",
    vercel_not_configured: "Vercel OAuth is not configured on this server. Please contact support.",
  };

  return (
    <Gate>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
        <div style={{ width: 32, height: 32, borderRadius: 9, background: C.ink, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontFamily: C.font, fontSize: 20, fontWeight: 800, color: C.accent, lineHeight: 1 }}>6</span>
        </div>
        <span style={{ fontSize: 17, fontWeight: 700, color: C.ink, letterSpacing: -0.4 }}>in<span style={{ color: C.accent }}>six</span>live</span>
      </div>

      <h1 style={{ fontSize: 22, fontWeight: 700, color: C.ink, letterSpacing: -0.5, marginBottom: 8 }}>Connect your Vercel account</h1>
      <p style={{ fontSize: 14.5, color: C.muted, lineHeight: 1.6, marginBottom: 20 }}>
        Your website will be deployed directly to your Vercel account. Click the button below to authorise access — it takes about 10 seconds.
      </p>

      {error && (
        <div style={{ background: "#FFF0EE", border: `1px solid rgba(255,90,31,.2)`, borderRadius: 10, padding: "12px 14px", marginBottom: 16, fontSize: 13.5, color: "#C43600", lineHeight: 1.5 }}>
          {errorMessages[error] ?? "Something went wrong. Please try again."}
        </div>
      )}

      <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 12, padding: "16px 18px", marginBottom: 20, display: "flex", flexDirection: "column", gap: 10 }}>
        {[
          { icon: "🔒", text: "We only request access to create and manage your deployments." },
          { icon: "⚡", text: "Your site goes live on your own Vercel account — you own it completely." },
          { icon: "🔗", text: "You can disconnect at any time from your Vercel dashboard." },
        ].map(({ icon, text }) => (
          <div key={text} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <span style={{ fontSize: 16, flexShrink: 0 }}>{icon}</span>
            <span style={{ fontSize: 13.5, color: C.ink, lineHeight: 1.5 }}>{text}</span>
          </div>
        ))}
      </div>

      <a href="/api/auth/vercel/authorize" style={{
        display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
        width: "100%", height: 48, borderRadius: 12, border: "none",
        background: C.ink, color: "#fff",
        fontFamily: C.font, fontSize: 15, fontWeight: 600,
        textDecoration: "none", cursor: "pointer",
      }}>
        <svg width="18" height="16" viewBox="0 0 76 65" fill="currentColor">
          <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" />
        </svg>
        Connect with Vercel
      </a>
    </Gate>
  );
}
```

- [ ] **Step 3: Update `GenerateContent` to check Vercel auth and handle URL params**

Replace the current `GenerateContent` function with:

```tsx
function GenerateContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editSiteId = searchParams.get("edit") ?? undefined;
  const vercelAuthorized = searchParams.get("vercel_authorized") === "true";
  const vercelError = searchParams.get("error") ?? null;
  const [gate, setGate] = useState<Gate>("loading");

  useEffect(() => {
    const termsAgreed = typeof window !== "undefined" && localStorage.getItem("terms_agreed") === "1";

    fetch("/api/auth/me")
      .then(r => r.json())
      .then(data => {
        if (!data.user) { router.push("/login"); return; }

        // Vercel just authorized — skip the gate even if vercelAuthorized isn't reflected in
        // the DB yet (callback already saved it; me endpoint would confirm on next load).
        const isVercelConnected = data.user.vercelAuthorized || vercelAuthorized;

        if (!termsAgreed) { setGate("terms"); return; }
        if (!isVercelConnected) { setGate("vercel"); return; }
        setGate("ready");
      })
      .catch(() => router.push("/login"));
  }, [router, vercelAuthorized]);

  const handleTermsAgree = () => {
    localStorage.setItem("terms_agreed", "1");
    setGate("ready"); // will be overridden below if Vercel not connected
    // Re-check if Vercel is also required
    fetch("/api/auth/me").then(r => r.json()).then(data => {
      if (data.user?.vercelAuthorized || vercelAuthorized) {
        setGate("ready");
      } else {
        setGate("vercel");
      }
    });
  };

  if (gate === "loading") return <Spinner />;
  if (gate === "terms")   return <TermsGate onAgree={handleTermsAgree} />;
  if (gate === "vercel")  return <VercelGate error={vercelError} />;
  return <GenerateWizard editSiteId={editSiteId} />;
}
```

- [ ] **Step 4: TypeScript check**

```bash
cd /Users/andreiradu/websitebuilder && npx tsc --noEmit 2>&1 | head -30
```

Expected: no new type errors.

- [ ] **Step 5: Commit**

```bash
git add app/generate/page.tsx
git commit -m "feat: add Connect with Vercel gate to generate page, handle OAuth callback params"
```

---

## Task 6: Update `.env.example` with new variables

**Files:**
- Modify: `.env.example`

- [ ] **Step 1: Add `TOKEN_ENCRYPTION_KEY` to `.env.example`**

Open `.env.example` and add these lines in the Vercel section (after existing Vercel vars):

```
# Vercel OAuth — register at vercel.com/account/applications → Create Integration
# Redirect URI to register: https://insixlive.com/api/auth/vercel/callback
VERCEL_OAUTH_CLIENT_ID=your_client_id_here
VERCEL_OAUTH_CLIENT_SECRET=your_client_secret_here
NEXT_PUBLIC_URL=https://insixlive.com

# Token encryption — generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
TOKEN_ENCRYPTION_KEY=64_hex_chars_here
```

- [ ] **Step 2: Add `TOKEN_ENCRYPTION_KEY` to your local `.env.local`**

Run to generate a key:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and add to `.env.local`:
```
TOKEN_ENCRYPTION_KEY=<output from above>
```

- [ ] **Step 3: Commit `.env.example` only (never commit `.env.local`)**

```bash
git add .env.example
git commit -m "docs: add TOKEN_ENCRYPTION_KEY to env example, document Vercel OAuth setup"
```

---

## Task 7: Smoke-test the full flow locally

- [ ] **Step 1: Start dev server**

```bash
cd /Users/andreiradu/websitebuilder && npm run dev
```

- [ ] **Step 2: Visit `/generate` as a logged-in user without Vercel connected**

Navigate to `http://localhost:3000/generate`.

Expected: after terms gate, see the "Connect with Vercel" gate with the Vercel logo button.

- [ ] **Step 3: Click "Connect with Vercel"**

Expected: redirected to `https://vercel.com/oauth/authorize?client_id=...&redirect_uri=...&state=...`.

If you have a real OAuth app registered, continue the flow. If not, verify the redirect URL is correct and includes `client_id`, `redirect_uri`, and `state`.

- [ ] **Step 4: Complete OAuth flow**

After authorising on Vercel, you should land back at `/generate?vercel_authorized=true`.

Expected: wizard loads (no Vercel gate), `vercel_authorized=true` param in URL.

- [ ] **Step 5: Verify token is saved encrypted**

```bash
# Connect to Neon and check the token value
# It should look like: "a1b2c3...:d4e5f6...:789abc..." (iv:authTag:ciphertext)
# NOT a plain Vercel token starting with a short alphanumeric string
```

- [ ] **Step 6: Verify generate-site uses user token**

Check server logs when triggering a generation — should see the user's token being used (or the platform token if the user hasn't connected yet, as fallback).

---

## Self-Review Checklist

### Spec coverage:
- [x] §1 Env vars documented in `.env.example` with Vercel OAuth setup instructions
- [x] §2 OAuth initiation endpoint — already exists at `/api/auth/vercel/authorize`
- [x] §3 OAuth callback — already exists; token now encrypted before saving
- [x] §4 Token refresh / `getValidVercelToken(userId)` — added to `lib/vercel.ts`
- [x] §5 UI "Connect with Vercel" button — `VercelGate` in `generate/page.tsx`
- [x] §6 All deploy calls use user token via `getValidVercelToken` — wired in `generate-site/route.ts`
- [x] §7 Backward compat — old plain-text tokens still work via `readToken` fallback in `lib/encryption.ts`

### What's NOT implemented (and why):
- **Refresh token**: Vercel OAuth does not issue refresh tokens in the `v2/oauth/token` response; access tokens are long-lived. No implementation needed.
- **Separate `/connect` endpoint**: The spec mentions this path but the existing `/authorize` endpoint does exactly the same thing. No duplicate needed.
- **"Disconnect" button**: Not in spec core requirements and not needed for the flow to work. Can be added as a separate task.
- **Vercel Integration Console registration**: Manual step (documented in `.env.example`). Cannot be automated.

### Manual steps required by the developer:
1. Go to [vercel.com/account/applications](https://vercel.com/account/applications) → Create Integration
2. Set the redirect URI to `https://insixlive.com/api/auth/vercel/callback` (and `http://localhost:3000/api/auth/vercel/callback` for local dev)
3. Copy Client ID and Client Secret into `.env.local` (and Vercel project environment variables for production)
4. Generate `TOKEN_ENCRYPTION_KEY` with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` and add to both `.env.local` and Vercel env vars
