# Parish Calendar Module — Backend Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Let a customer enable an "Editable weekly calendar" add-on when creating a site. insixlive provisions admin credentials + the secrets the generated site needs, stores a tracking row, emails the priest setup instructions, and gives the customer a dashboard card to check Blob-connection status and resend credentials.

**Architecture:** This plan covers everything that runs **inside insixlive's own app** — the DB row, the wizard toggle, the generate-site hook, and the dashboard card. It deliberately stops at the boundary of the generated site itself (that's [2026-06-20-parish-calendar-generated-site.md](2026-06-20-parish-calendar-generated-site.md), which depends on this plan's outputs: the DB row shape and the two secrets baked into the generated site's env).

**Design correction vs. the original spec:** The spec describes Prisma; this codebase has no Prisma — it's raw SQL (Neon serverless) with hand-written TypeScript types in `lib/db.ts`, and tables are created via `app/api/db/migrate/route.ts`. This plan follows that existing pattern.

**Design decision (the spec asked to confirm before writing `/admin` code) — self-contained admin auth, Blob-backed, not env-var-backed:**
The spec suggested baking admin credentials into the generated site's "own minimal DB/env." Env vars don't work for this: Vercel env vars are baked in at *build* time, so a password change or a "resend credentials" action would require a full redeploy just to take effect — and this codebase's only deploy primitive re-runs the LLM generation, so a "redeploy" would silently regenerate the customer's page content as a side effect of a password reset. That's unacceptable.

Instead: the generated site stores its admin credentials in the **same Vercel Blob store as the calendar events** (`parish-admin.json`, alongside `parish-calendar.json`), which supports runtime reads/writes with zero redeploy. The only thing baked in at deploy time is `PARISH_BOOTSTRAP_SECRET` and `PARISH_SESSION_SECRET` — two env vars that never need to change again. This makes Blob connection a hard prerequisite for the *entire* module (including login, not just calendar content) — which is fine, because the manual-setup email and dashboard status card already communicate that clearly.

This also means insixlive never needs direct Blob API access: it authenticates to the generated site's own `/api/parish-admin/bootstrap` and `/api/parish-admin/admin-reset` endpoints using `PARISH_BOOTSTRAP_SECRET`, and the generated site does 100% of its own Blob reads/writes using its auto-injected `BLOB_READ_WRITE_TOKEN`. "Verify Blob is connected" and "provision the module" become the same action: insixlive calls `bootstrap`; success means both at once.

**Tech Stack:** Next.js 16 App Router, Neon PostgreSQL via `@neondatabase/serverless`, `bcryptjs` (already a dependency), `node:crypto`, Resend (`lib/email.ts`), existing `getValidVercelToken`/`getSession` helpers.

---

## Existing Infrastructure (do NOT re-create these)

- `lib/vercel.ts` → `getValidVercelToken(userId)` — returns `{ token, teamId } | null`, already handles decryption. Use, don't rebuild.
- `lib/vercel.ts` → `deployToVercel(projectName, code, options)` — deploys a new site. This plan does not call it again; it only adds a *new* helper for setting project env vars, used right after a NEW site's `deployToVercel` call already happened in `app/api/generate-site/route.ts`.
- `lib/encryption.ts` → `encrypt(plaintext): string` / `decrypt(ciphertext): string` — AES-256-GCM, used today for `vercel_access_token`. Reuse for `PARISH_BOOTSTRAP_SECRET`.
- `lib/session.ts` → `getSession()` — insixlive's own customer session (JWT via `jose`). Use this for authenticating the *insixlive dashboard* API routes in Task 6/7 below. (The generated site's *own* admin session in Plan 2 is a completely separate JWT secret/cookie — never reuse insixlive's `SESSION_SECRET` for that.)
- `lib/db.ts` → `getSiteById(id, userId)` pattern (ownership-scoped lookups joining through `sites.user_id`). Follow this exact pattern for the new table.
- `app/api/sites/[siteId]/route.ts` — reference example of the `getSession()` + ownership-scoped fetch pattern for a dashboard API route.
- `app/components/GenerateWizard.tsx` — `WizardData` type, `DEFAULT` value, `Step09Finishing` component (~line 1523), `Block`/`WizOptGrid` UI primitives, `tr(lang, ro, en)` localization helper.

---

## Known existing issue (do not try to fix in this plan)

`app/api/db/migrate/route.ts` only creates `users` and `sites` with a handful of columns; `lib/db.ts`'s types reference many more columns (e.g. `sites.vercel_project_id`, `sites.pricing_tier`) and an entire `site_edits` table that aren't in the migrate script. The real production schema clearly drifted from this file via manual changes. **Do not attempt to reconcile that drift here** — it's out of scope and risky without DB access to diff against. This plan only *adds* a new, fully self-contained table (`parish_calendar_modules`) via the same `CREATE TABLE IF NOT EXISTS` idempotent pattern already used in that file, so it's safe to run regardless of what else has drifted.

---

### Task 1: Database table + `lib/db.ts` types and queries

**Files:**
- Modify: `app/api/db/migrate/route.ts`
- Modify: `lib/db.ts`

- [x] **Step 1: Add the table to the migrate route**

In `app/api/db/migrate/route.ts`, add this new `CREATE TABLE` call right after the existing `sites` table block (before the final `return NextResponse.json(...)`):

```ts
  await sql`
    CREATE TABLE IF NOT EXISTS parish_calendar_modules (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      site_id UUID UNIQUE REFERENCES sites(id) ON DELETE CASCADE,
      admin_email TEXT NOT NULL,
      admin_password_hash TEXT NOT NULL,
      must_change_password BOOLEAN DEFAULT TRUE,
      bootstrap_secret_encrypted TEXT NOT NULL,
      blob_connected BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
```

- [x] **Step 2: Verify the route file still parses**

Run: `npx tsc --noEmit -p .`
Expected: no errors mentioning `app/api/db/migrate/route.ts`.

- [x] **Step 3: Add the TypeScript type to `lib/db.ts`**

Add near the other type definitions (after the `SiteEdit` type, ~line 73):

```ts
export type ParishCalendarModule = {
  id: string;
  site_id: string;
  admin_email: string;
  admin_password_hash: string;
  must_change_password: boolean;
  bootstrap_secret_encrypted: string;
  blob_connected: boolean;
  created_at: Date;
  updated_at: Date;
};
```

- [x] **Step 4: Add the query functions to `lib/db.ts`**

Add after `getPaidEditsByUserId` (end of file is fine):

```ts
export async function createParishCalendarModule(
  siteId: string,
  adminEmail: string,
  adminPasswordHash: string,
  bootstrapSecretEncrypted: string
): Promise<ParishCalendarModule> {
  const sql = getDb();
  const rows = await sql`
    INSERT INTO parish_calendar_modules (site_id, admin_email, admin_password_hash, bootstrap_secret_encrypted)
    VALUES (${siteId}, ${adminEmail}, ${adminPasswordHash}, ${bootstrapSecretEncrypted})
    RETURNING *
  `;
  return rows[0] as ParishCalendarModule;
}

export async function getParishCalendarModuleBySiteId(
  siteId: string,
  userId: string
): Promise<ParishCalendarModule | null> {
  const sql = getDb();
  const rows = await sql`
    SELECT pcm.* FROM parish_calendar_modules pcm
    JOIN sites s ON s.id = pcm.site_id
    WHERE pcm.site_id = ${siteId} AND s.user_id = ${userId}
    LIMIT 1
  `;
  return (rows[0] as ParishCalendarModule) || null;
}

export async function setParishCalendarBlobConnected(siteId: string, connected: boolean): Promise<void> {
  const sql = getDb();
  await sql`
    UPDATE parish_calendar_modules
    SET blob_connected = ${connected}, updated_at = NOW()
    WHERE site_id = ${siteId}
  `;
}

export async function resetParishCalendarAdminPassword(
  siteId: string,
  newPasswordHash: string
): Promise<ParishCalendarModule> {
  const sql = getDb();
  const rows = await sql`
    UPDATE parish_calendar_modules
    SET admin_password_hash = ${newPasswordHash}, must_change_password = TRUE, updated_at = NOW()
    WHERE site_id = ${siteId}
    RETURNING *
  `;
  return rows[0] as ParishCalendarModule;
}
```

- [x] **Step 5: Typecheck**

Run: `npx tsc --noEmit -p .`
Expected: no errors.

- [x] **Step 6: Commit**

```bash
git add app/api/db/migrate/route.ts lib/db.ts
git commit -m "feat(parish-calendar): add parish_calendar_modules table and queries"
```

---

### Task 2: Email helper

**Files:**
- Modify: `lib/email.ts`

- [x] **Step 1: Add `sendParishCalendarSetupEmail`**

Add this function to `lib/email.ts`, following the exact style of `sendEditStartedEmail` (same file, ~line 160):

```ts
export async function sendParishCalendarSetupEmail(
  email: string,
  params: {
    siteName: string;
    adminUrl: string;
    adminEmail: string;
    tempPassword: string;
    vercelProjectName: string;
  }
): Promise<void> {
  const { siteName, adminUrl, adminEmail, tempPassword, vercelProjectName } = params;
  const storageTabUrl = `https://vercel.com/dashboard/stores?filter=${encodeURIComponent(vercelProjectName)}`;

  console.log(`\n[Email] Parish calendar setup for ${email}: ${siteName}`);

  const resend = getResend();
  const from = process.env.RESEND_FROM_EMAIL || "inSIXlive <onboarding@resend.dev>";

  const { error } = await resend.emails.send({
    from,
    to: email,
    subject: `One step left to activate your editable weekly schedule — ${siteName}`,
    html: `
<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#050510;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#ffffff;">
  <div style="max-width:520px;margin:48px auto;padding:0 24px;">
    <p style="font-size:18px;font-weight:700;letter-spacing:-0.02em;margin:0 0 4px;">inSIXlive</p>
    <div style="margin:32px 0;padding:32px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:16px;">
      <h1 style="font-size:20px;font-weight:700;margin:0 0 8px;">Your editable weekly schedule is almost ready</h1>
      <p style="color:rgba(255,255,255,0.55);margin:0 0 20px;font-size:14px;line-height:1.6;">
        ${siteName} now includes a "This Week" schedule page you can update yourself — no code, no redeploys. One quick one-time setup step is needed first.
      </p>
      <div style="background:rgba(99,102,241,0.08);border:1px solid rgba(99,102,241,0.15);border-radius:10px;padding:14px 16px;margin-bottom:20px;">
        <p style="margin:0 0 8px;font-weight:600;font-size:14px;">Step 1 — connect storage (about 2 minutes)</p>
        <ol style="margin:0;padding-left:18px;color:rgba(255,255,255,0.7);font-size:13px;line-height:1.7;">
          <li>Open your project's Storage tab: <a href="${storageTabUrl}" style="color:#a855f7;">${storageTabUrl}</a></li>
          <li>Click "Create Database" → choose "Blob" → name it anything.</li>
          <li>Connect it to the <b>${vercelProjectName}</b> project.</li>
        </ol>
      </div>
      <div style="background:rgba(255,255,255,0.04);border-radius:10px;padding:14px 16px;margin-bottom:20px;">
        <p style="margin:0 0 8px;font-weight:600;font-size:14px;">Step 2 — log in once storage is connected</p>
        <p style="margin:0 0 4px;font-size:13px;color:rgba(255,255,255,0.55);">Admin URL: <a href="${adminUrl}" style="color:#a855f7;">${adminUrl}</a></p>
        <p style="margin:0 0 4px;font-size:13px;color:rgba(255,255,255,0.55);">Email: <b style="color:#fff;">${adminEmail}</b></p>
        <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.55);">Temporary password: <b style="color:#fff;">${tempPassword}</b></p>
      </div>
      <p style="margin:0 0 20px;font-size:12px;color:rgba(255,255,255,0.4);">You'll be asked to set a new password the first time you log in. If you log in before Step 1 is done, it just won't work yet — finish the storage step and try again.</p>
      <a href="${adminUrl}" style="display:inline-block;background:linear-gradient(135deg,#6366f1,#a855f7);color:#fff;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:600;font-size:14px;">Open admin login</a>
    </div>
  </div>
</body></html>`,
  });
  if (error) console.error("Parish calendar setup email error:", error.message);
}
```

- [x] **Step 2: Typecheck**

Run: `npx tsc --noEmit -p .`
Expected: no errors.

- [x] **Step 3: Commit**

```bash
git add lib/email.ts
git commit -m "feat(parish-calendar): add setup-instructions email"
```

---

### Task 3: Wizard toggle

**Files:**
- Modify: `app/components/GenerateWizard.tsx`

- [x] **Step 1: Add the field to `WizardData`**

In the `pages` field of the `WizardData` type (~line 45), add `calendarModuleEnabled`:

```ts
  pages: { selected: string[]; primaryCTA: string; contentTone: string; specialFeatures: string[]; calendarModuleEnabled: boolean; additionalNotes: string; pageDescriptions: { [id: string]: PageDesc } };
```

- [x] **Step 2: Add the default value**

In the `DEFAULT` object's `pages` field (~line 70), add `calendarModuleEnabled: false`:

```ts
  pages: { selected: ["home","services","about","contact"], primaryCTA: "phone", contentTone: "professional-approachable", specialFeatures: [], calendarModuleEnabled: false, additionalNotes: "", pageDescriptions: {} },
```

- [x] **Step 3: Add the checkbox UI to `Step09Finishing`**

In `Step09Finishing` (~line 1523), add a new `Block` right after the "Use emojis" block (after the block closing at ~line 1554, before the "Website language" block):

```tsx
      <Block label={tr(lang,"Calendar săptămânal editabil","Editable weekly calendar")}
        note={tr(lang,"Pentru biserici, parohii sau orice afacere cu un program săptămânal recurent. Adaugă o pagină publică \"Săptămâna aceasta\" pe care o poți actualiza tu, fără cod.","For churches, parishes, or any business with a recurring weekly schedule. Adds a public \"This week\" page you can update yourself, with no code.")}>
        <WizOptGrid cols={2} options={[
          { id: "no",  name: tr(lang,"Nu am nevoie de asta","I don't need this") },
          { id: "yes", name: tr(lang,"Da, adaugă programul editabil","Yes, add the editable schedule") },
        ]} value={pg.calendarModuleEnabled ? "yes" : "no"}
          onChange={v => setPg("calendarModuleEnabled", v === "yes")} />
      </Block>
```

- [x] **Step 4: Surface it in the review step**

In `Step10Review` (~line 1568), find where other `pages.*` fields are shown (near `activePages`, ~line 1587) and add:

```tsx
  const calendarModuleLabel = data.pages.calendarModuleEnabled
    ? tr(lang, "Da", "Yes")
    : tr(lang, "Nu", "No");
```

Then render it as a review row alongside the other `dash(...)`-rendered fields in that component's JSX (follow the exact `<div>` row pattern already used for `ctaLabel`/`toneLabel` in that same render — match whatever row markup wraps those, just reuse it with `calendarModuleLabel` and a label `tr(lang,"Calendar editabil","Editable calendar")`).

- [x] **Step 5: Typecheck**

Run: `npx tsc --noEmit -p .`
Expected: no errors.

- [ ] **Step 6: Manual verification**

Run: `npm run dev`, open `/generate`, step through the wizard to "Finishing touches," toggle the new option on, reach the review step, confirm "Editable calendar: Yes" shows.

- [x] **Step 7: Commit**

```bash
git add app/components/GenerateWizard.tsx
git commit -m "feat(parish-calendar): add wizard toggle for editable weekly calendar"
```

---

### Task 4: Vercel project env var helper

**Files:**
- Modify: `lib/vercel.ts`

- [x] **Step 1: Add `setProjectEnvVars`**

Add this function to `lib/vercel.ts`, near `deployToVercel`:

```ts
export async function setProjectEnvVars(
  projectId: string,
  token: string,
  teamId: string | null | undefined,
  vars: { key: string; value: string }[]
): Promise<void> {
  const url = teamId
    ? `https://api.vercel.com/v10/projects/${projectId}/env?teamId=${teamId}&upsert=true`
    : `https://api.vercel.com/v10/projects/${projectId}/env?upsert=true`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(
      vars.map(v => ({
        key: v.key,
        value: v.value,
        type: "encrypted",
        target: ["production", "preview", "development"],
      }))
    ),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`Failed to set Vercel project env vars (${response.status}): ${text}`);
  }
}
```

- [x] **Step 2: Typecheck**

Run: `npx tsc --noEmit -p .`
Expected: no errors.

- [x] **Step 3: Commit**

```bash
git add lib/vercel.ts
git commit -m "feat(parish-calendar): add Vercel project env var helper"
```

---

### Task 5: Hook into site generation

**Files:**
- Modify: `app/api/generate-site/route.ts`

This task wires the toggle to real behavior. It depends on Task 1 (DB), Task 2 (email), and Task 4 (env var helper). Find the **new-site** branch (not the edit/regeneration branch) — the block around the `deployToVercel(projectName, websiteCode, ...)` call (~line 477) followed by `saveSiteWithVercel(...)` (~line 487).

- [x] **Step 1: Import the new helpers**

At the top of `app/api/generate-site/route.ts`, update the imports:

```ts
import { deployToVercel, getValidVercelToken, setProjectEnvVars } from "@/lib/vercel";
import { getUserById, saveSiteWithVercel, getSiteById, updateSiteAfterRegeneration, createParishCalendarModule } from "@/lib/db";
import { sendParishCalendarSetupEmail } from "@/lib/email";
import { encrypt } from "@/lib/encryption";
import crypto from "crypto";
import bcrypt from "bcryptjs";
```

- [x] **Step 2: Add the provisioning block after the new site is saved**

Right after the existing `const site = await saveSiteWithVercel(...)` call (~line 487) and before that branch's `return`, add:

```ts
    if (f.pages.calendarModuleEnabled) {
      try {
        const adminEmail = f.business.email?.trim() || user.email;
        const tempPassword = crypto.randomBytes(9).toString("base64").replace(/[^a-zA-Z0-9]/g, "").slice(0, 12);
        const passwordHash = await bcrypt.hash(tempPassword, 10);
        const bootstrapSecret = crypto.randomBytes(24).toString("hex");
        const sessionSecret = crypto.randomBytes(24).toString("hex");

        await setProjectEnvVars(site.vercel_project_id!, vercelToken.token, vercelToken.teamId, [
          { key: "PARISH_BOOTSTRAP_SECRET", value: bootstrapSecret },
          { key: "PARISH_SESSION_SECRET", value: sessionSecret },
        ]);

        await createParishCalendarModule(site.id, adminEmail, passwordHash, encrypt(bootstrapSecret));

        const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";
        await sendParishCalendarSetupEmail(adminEmail, {
          siteName: site.name,
          adminUrl: `${site.vercel_url}/admin`,
          adminEmail,
          tempPassword,
          vercelProjectName: projectName,
        });
      } catch (err) {
        console.error("Parish calendar module provisioning failed:", err);
        // Do not fail site generation if this add-on setup fails — the customer
        // already has a working website. They can retry from the dashboard.
      }
    }
```

Note: `user`, `vercelToken`, and `projectName` must already be in scope at this point in the function — confirm their exact variable names by reading the surrounding code (they're used by the preceding `deployToVercel` call) and adjust the names above to match exactly if they differ.

- [x] **Step 3: Typecheck**

Run: `npx tsc --noEmit -p .`
Expected: no errors. Fix any variable name mismatches found in Step 2.

- [ ] **Step 4: Manual verification**

Run `npm run dev`, run through the full wizard with the calendar toggle on, with a real `DATABASE_URL` and a connected Vercel account, and confirm:
1. Site generation still succeeds even if you temporarily break the provisioning block (e.g. comment out `setProjectEnvVars` to simulate a failure) — site creation must not fail because of this block.
2. With the block intact, query the DB directly (`SELECT * FROM parish_calendar_modules ORDER BY created_at DESC LIMIT 1;`) and confirm a row was created.
3. Confirm the setup email arrives (check Resend dashboard logs or your inbox if `RESEND_FROM_EMAIL` is verified).

- [x] **Step 5: Commit**

```bash
git add app/api/generate-site/route.ts
git commit -m "feat(parish-calendar): provision module on new site generation"
```

---

### Task 6: Verify-connection API route

**Files:**
- Create: `app/api/parish-calendar/[siteId]/verify/route.ts`

This calls the generated site's own `/api/parish-admin/bootstrap` endpoint (built in the companion plan). Until that companion plan ships, this route will get a 404 from the generated site — that's expected and handled below.

- [x] **Step 1: Write the route**

```ts
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getSiteById, getParishCalendarModuleBySiteId, setParishCalendarBlobConnected } from "@/lib/db";
import { decrypt } from "@/lib/encryption";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const { siteId } = await params;
  const site = await getSiteById(siteId, session.userId);
  if (!site) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const module_ = await getParishCalendarModuleBySiteId(siteId, session.userId);
  if (!module_) return NextResponse.json({ error: "Calendar module not enabled for this site." }, { status: 404 });

  const bootstrapSecret = decrypt(module_.bootstrap_secret_encrypted);

  try {
    const res = await fetch(`${site.vercel_url}/api/parish-admin/bootstrap`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-bootstrap-secret": bootstrapSecret },
      body: JSON.stringify({ email: module_.admin_email, passwordHash: module_.admin_password_hash }),
    });

    if (!res.ok) {
      await setParishCalendarBlobConnected(siteId, false);
      return NextResponse.json({ connected: false, reason: `Site responded ${res.status}` });
    }

    await setParishCalendarBlobConnected(siteId, true);
    return NextResponse.json({ connected: true });
  } catch (err) {
    await setParishCalendarBlobConnected(siteId, false);
    return NextResponse.json({ connected: false, reason: err instanceof Error ? err.message : "Unknown error" });
  }
}
```

- [x] **Step 2: Typecheck**

Run: `npx tsc --noEmit -p .`
Expected: no errors.

- [ ] **Step 3: Manual verification (will only fully pass after the companion plan ships)**

`curl -X POST http://localhost:3000/api/parish-calendar/<a real siteId>/verify -H "Cookie: <your session cookie>"` — for now expect `{"connected":false,"reason":"..."}` since the generated site has no `/api/parish-admin/bootstrap` yet. Confirm it does NOT throw a 500 — graceful `connected:false` is the correct behavior pre-companion-plan.

- [x] **Step 4: Commit**

```bash
git add app/api/parish-calendar/[siteId]/verify/route.ts
git commit -m "feat(parish-calendar): add verify-blob-connection endpoint"
```

---

### Task 7: Resend-credentials API route

**Files:**
- Create: `app/api/parish-calendar/[siteId]/resend-credentials/route.ts`

- [x] **Step 1: Write the route**

```ts
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getSiteById, getParishCalendarModuleBySiteId, resetParishCalendarAdminPassword } from "@/lib/db";
import { decrypt } from "@/lib/encryption";
import { sendParishCalendarSetupEmail } from "@/lib/email";
import crypto from "crypto";
import bcrypt from "bcryptjs";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const { siteId } = await params;
  const site = await getSiteById(siteId, session.userId);
  if (!site) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const module_ = await getParishCalendarModuleBySiteId(siteId, session.userId);
  if (!module_) return NextResponse.json({ error: "Calendar module not enabled for this site." }, { status: 404 });

  const tempPassword = crypto.randomBytes(9).toString("base64").replace(/[^a-zA-Z0-9]/g, "").slice(0, 12);
  const passwordHash = await bcrypt.hash(tempPassword, 10);
  const updated = await resetParishCalendarAdminPassword(siteId, passwordHash);

  if (updated.blob_connected) {
    const bootstrapSecret = decrypt(updated.bootstrap_secret_encrypted);
    try {
      await fetch(`${site.vercel_url}/api/parish-admin/admin-reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-bootstrap-secret": bootstrapSecret },
        body: JSON.stringify({ passwordHash }),
      });
    } catch (err) {
      console.error("Failed to push admin-reset to generated site:", err);
      return NextResponse.json({ error: "Could not reach the deployed site to reset the password. Try again in a moment." }, { status: 502 });
    }
  }

  await sendParishCalendarSetupEmail(updated.admin_email, {
    siteName: site.name,
    adminUrl: `${site.vercel_url}/admin`,
    adminEmail: updated.admin_email,
    tempPassword,
    vercelProjectName: site.repo_name || site.name,
  });

  return NextResponse.json({ success: true });
}
```

- [x] **Step 2: Typecheck**

Run: `npx tsc --noEmit -p .`
Expected: no errors.

- [x] **Step 3: Commit**

```bash
git add app/api/parish-calendar/[siteId]/resend-credentials/route.ts
git commit -m "feat(parish-calendar): add resend-credentials endpoint"
```

---

### Task 8: Dashboard card

**Files:**
- Create: `app/dashboard/_dash/ParishCalendarCard.tsx`
- Modify: wherever a single site's detail view is rendered in `app/dashboard/_dash/` (check `OverviewPage.tsx` or `DomainsPage.tsx` for the existing per-site card pattern, and follow the same mounting convention — e.g. if sites are rendered as a list of cards, this becomes one more conditional card per site).

- [x] **Step 1: Write the card component**

```tsx
"use client";

import { useState } from "react";

export default function ParishCalendarCard({
  siteId,
  blobConnected,
}: {
  siteId: string;
  blobConnected: boolean;
}) {
  const [checking, setChecking] = useState(false);
  const [resending, setResending] = useState(false);
  const [connected, setConnected] = useState(blobConnected);
  const [message, setMessage] = useState<string | null>(null);

  const checkNow = async () => {
    setChecking(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/parish-calendar/${siteId}/verify`, { method: "POST" });
      const data = await res.json();
      setConnected(!!data.connected);
      setMessage(data.connected ? "Connected — your admin login now works." : "Not connected yet. Finish the Storage step in Vercel, then check again.");
    } catch {
      setMessage("Could not check right now. Try again in a moment.");
    } finally {
      setChecking(false);
    }
  };

  const resend = async () => {
    setResending(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/parish-calendar/${siteId}/resend-credentials`, { method: "POST" });
      if (res.ok) setMessage("New credentials sent to the admin email on file.");
      else setMessage("Could not resend credentials. Try again in a moment.");
    } catch {
      setMessage("Could not resend credentials. Try again in a moment.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div style={{ padding: 20, borderRadius: 14, background: "#fff", border: "1px solid #ececee" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: "#18181b" }}>Editable weekly calendar</span>
        <span style={{ fontSize: 12, fontWeight: 600, color: connected ? "#16a34a" : "#a1a1aa" }}>
          {connected ? "● Connected" : "● Manual setup needed"}
        </span>
      </div>
      <p style={{ fontSize: 13, color: "#71717a", margin: "0 0 14px", lineHeight: 1.5 }}>
        {connected
          ? "Storage is connected. The priest can log in and update the schedule without a redeploy."
          : "Connect a Blob store to this Vercel project to activate admin login. Setup steps were emailed when the site was created."}
      </p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button onClick={checkNow} disabled={checking} style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid #3f3f46", background: "#fff", color: "#18181b", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
          {checking ? "Checking…" : "I've connected it, check now"}
        </button>
        <button onClick={resend} disabled={resending} style={{ padding: "8px 14px", borderRadius: 8, border: "none", background: "#09090b", color: "#fff", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
          {resending ? "Sending…" : "Resend admin credentials"}
        </button>
      </div>
      {message && <p style={{ fontSize: 12, color: "#71717a", marginTop: 10 }}>{message}</p>}
    </div>
  );
}
```

- [x] **Step 2: Mount it conditionally per site**

Find the per-site rendering loop in the relevant `app/dashboard/_dash/*.tsx` file. You'll need each site's `calendarModuleEnabled`/`blobConnected` status from the API — check whatever route already returns the site list to the dashboard (likely `app/api/sites/route.ts`) and confirm whether it already joins in `parish_calendar_modules`. If not, add a left join there returning `blob_connected: boolean | null` per site (null = module not enabled, in which case don't render this card at all). Render `<ParishCalendarCard siteId={site.id} blobConnected={!!site.blob_connected} />` only when that field is non-null.

- [x] **Step 3: Typecheck**

Run: `npx tsc --noEmit -p .`
Expected: no errors.

- [ ] **Step 4: Manual verification**

`npm run dev`, log in, open the dashboard, confirm the card appears for a site with the module enabled and is absent for one without it. Click both buttons and confirm the loading/message states behave (the "check now" button will report "not connected" until the companion plan ships — that's expected).

- [x] **Step 5: Commit**

```bash
git add app/dashboard/_dash/ParishCalendarCard.tsx app/dashboard/_dash/*.tsx app/api/sites/route.ts
git commit -m "feat(parish-calendar): add dashboard status card"
```

---

## What this plan does NOT do (by design)

- Does not call any Vercel Storage/Blob creation API (automatic provisioning) — deferred, per the original spec's own build order, until this manual-only flow works end-to-end.
- Does not touch the generated site's files at all — see the companion plan for `pages/admin.tsx` and the `pages/api/parish-admin/*` routes that `verify`/`resend-credentials` call into.
- Does not support enabling the module on an *existing* site via the edit/regeneration flow — only at initial creation. Adding that later is a small, separate follow-up once this works.
