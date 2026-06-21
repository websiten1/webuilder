# Parish Calendar Module — Generated Site Additions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** When a customer enables the calendar module, their generated site gets a public "This Week" section plus a self-contained `/admin` page where the priest can log in and manage events — with zero dependency on insixlive's own uptime, and zero redeploys for any calendar-content edit.

**Architecture:** Generated customer sites are currently a single static `pages/index.tsx` (Pages Router, Next 14.2) plus a fixed `package.json`/`tsconfig.json`/`next.config.js`, deployed via one POST to Vercel's deployments API (`lib/vercel.ts` → `deployToVercel`). There is no existing precedent for shipping hand-written, deterministic files alongside the LLM-generated page — this plan adds that capability. All 11 new generated-site files are **fully static** (no per-site templating needed): every per-site value (admin email, password hash, secrets) lives in either a Vercel project env var (`PARISH_BOOTSTRAP_SECRET`, `PARISH_SESSION_SECRET` — set by [the companion backend plan](2026-06-20-parish-calendar-backend.md)) or in the project's own Vercel Blob store at runtime, never baked into the file contents themselves.

**Dependency:** Requires [2026-06-20-parish-calendar-backend.md](2026-06-20-parish-calendar-backend.md) to ship first — specifically Task 4 (`setProjectEnvVars`) and Task 5 (the generate-site hook that sets `PARISH_BOOTSTRAP_SECRET`/`PARISH_SESSION_SECRET` and creates the DB row). Task 6/7 of that plan (verify / resend-credentials) call the `/api/parish-admin/bootstrap` and `/api/parish-admin/admin-reset` routes this plan creates — so this plan is also what makes those two backend routes actually succeed instead of always 404ing.

**Admin credential storage — read this before touching the code:** Credentials live in the generated site's *own* Blob store as `parish-admin.json`, never in env vars (env vars only update on redeploy; Blob updates are instant, matching how `parish-calendar.json` already has to work for the no-redeploy requirement). `PARISH_BOOTSTRAP_SECRET` is the one shared secret insixlive uses to call into this site's `bootstrap`/`admin-reset` endpoints; `PARISH_SESSION_SECRET` signs this site's own admin login JWT and is never shared with insixlive.

**⚠️ Verify before merging:** This plan's `@vercel/blob` usage (`put`/`list` with `addRandomSuffix: false, allowOverwrite: true`) is written from current knowledge of the SDK, not confirmed against live docs in this session. Before Task 1 ships, check the current `@vercel/blob` README/docs for the exact `put()`/`list()` signatures — that surface has changed before (the original spec flagged the same risk for the Storage-creation API; the read/write SDK is more stable but still worth a 2-minute check).

**Two other deliberate deviations from the original spec, both narrowing exposure:**
1. The spec described the public component fetching `parish-calendar.json` "from the Blob public URL" directly. This plan instead adds a same-origin `pages/api/parish-calendar.ts` route that reads the blob server-side and returns only non-hidden events. Fetching the raw Blob URL directly would also make hidden events (and, if anyone guessed the adjacent pathname, the admin password hash file) reachable by anyone who finds the URL — the client-side `hidden` filter the spec describes only controls what's *displayed*, not what's fetchable. The extra API route closes that gap for a few lines of code.
2. The spec describes a `calendarModuleEnabled` boolean column on the `Site` model. This plan instead treats the *existence* of a `parish_calendar_modules` row as the flag (see the backend plan's Task 1) — avoids adding a column to a `sites` table that's already known to be out of sync between its migration script and production (see that plan's "Known existing issue" note), with identical behavior.

**Tech Stack (generated site's *new* dependencies — added only when this module is enabled):** `bcryptjs`, `jose`, `@vercel/blob`. None of these are added to insixlive's own `package.json` — they're only added to the *customer's* generated `package.json`.

---

## Existing Infrastructure (do NOT re-create these)

- `lib/vercel.ts` → `deployToVercel(projectName, code, options)` — the single deploy call. This plan extends its `options` type and file-list construction; it does not change its calling convention.
- `app/api/generate-site/route.ts` — builds the Claude prompt (the function returning the big template string ending in `${features.length > 0 ? ... }`, ~line 267-365) and calls `generateWebsiteCode()` then `deployToVercel()`. This plan adds one conditional prompt instruction and passes new deploy options through — it does not change the overall flow.
- The companion backend plan's `parish_calendar_modules` row and the two env vars it sets.

---

### Task 1: Shared helper files (Blob + session) as template strings

**Files:**
- Create: `lib/parish-calendar-templates.ts`

These three files (`types/parish.ts`, `lib/parish-blob.ts`, `lib/parish-session.ts`) will be shipped into every parish-calendar-enabled generated site at the listed paths. They're authored once here, as string constants, because they're never written to insixlive's own disk as real files — they only ever exist inside the customer's deployed project.

- [x] **Step 1: Create the file with the first three template strings**

```ts
// lib/parish-calendar-templates.ts
//
// Static file contents shipped into every "editable weekly calendar"
// generated site. See docs/superpowers/plans/2026-06-20-parish-calendar-generated-site.md.
// Every value here is static — per-site secrets/credentials are read at
// runtime from env vars (PARISH_BOOTSTRAP_SECRET, PARISH_SESSION_SECRET,
// auto-injected BLOB_READ_WRITE_TOKEN) or from the project's own Blob store.

const TYPES_PARISH = `export interface ParishEvent {
  id: string;
  title: string;
  dayOfWeek: number;
  specificDate: string | null;
  time: string;
  recurring: boolean;
  hidden: boolean;
  notes: string | null;
}

export interface ParishCalendarData {
  events: ParishEvent[];
  lastUpdated: string;
}

export interface ParishAdminData {
  email: string;
  passwordHash: string;
  mustChangePassword: boolean;
}
`;

const LIB_PARISH_BLOB = `import { put, list } from "@vercel/blob";

export async function readBlobJson<T>(pathname: string): Promise<T | null> {
  const { blobs } = await list({ prefix: pathname, limit: 1 });
  const match = blobs.find((b) => b.pathname === pathname);
  if (!match) return null;
  const res = await fetch(match.url, { cache: "no-store" });
  if (!res.ok) return null;
  return (await res.json()) as T;
}

export async function writeBlobJson(pathname: string, data: unknown): Promise<void> {
  await put(pathname, JSON.stringify(data), {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
  });
}
`;

const LIB_PARISH_SESSION = `import { SignJWT, jwtVerify } from "jose";

function key() {
  const secret = process.env.PARISH_SESSION_SECRET;
  if (!secret) throw new Error("PARISH_SESSION_SECRET is not set");
  return new TextEncoder().encode(secret);
}

export async function signAdminSession(): Promise<string> {
  return new SignJWT({ role: "parish-admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(key());
}

export async function verifyAdminSession(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, key(), { algorithms: ["HS256"] });
    return payload.role === "parish-admin";
  } catch {
    return false;
  }
}

export function parseCookie(header: string | undefined, name: string): string | undefined {
  if (!header) return undefined;
  const match = header.split(";").map((p) => p.trim()).find((p) => p.startsWith(\`\${name}=\`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : undefined;
}
`;
```

- [x] **Step 2: Typecheck**

Run: `npx tsc --noEmit -p .`
Expected: no errors. (These are just string constants at this point — nothing consumes them yet, so this mainly checks the file's own template-literal escaping is valid, e.g. the `${name}=` interpolation inside `parseCookie` had to be escaped as `\${name}=` since it's nested inside an outer template literal — double check that escaping is present exactly as shown above.)

- [x] **Step 3: Commit**

```bash
git add lib/parish-calendar-templates.ts
git commit -m "feat(parish-calendar): add shared blob/session template files"
```

---

### Task 2: API route template strings

**Files:**
- Modify: `lib/parish-calendar-templates.ts`

- [x] **Step 1: Add the six API route templates**

Append these six constants to `lib/parish-calendar-templates.ts` (after `LIB_PARISH_SESSION`):

```ts
const API_BOOTSTRAP = `import type { NextApiRequest, NextApiResponse } from "next";
import { readBlobJson, writeBlobJson } from "../../../lib/parish-blob";
import type { ParishAdminData, ParishCalendarData } from "../../../types/parish";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  if (req.headers["x-bootstrap-secret"] !== process.env.PARISH_BOOTSTRAP_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { email, passwordHash } = req.body as { email?: string; passwordHash?: string };
  if (!email || !passwordHash) return res.status(400).json({ error: "email and passwordHash are required" });

  try {
    const existing = await readBlobJson<ParishAdminData>("parish-admin.json");
    if (!existing) {
      await writeBlobJson("parish-admin.json", { email, passwordHash, mustChangePassword: true });
    }
    const events = await readBlobJson<ParishCalendarData>("parish-calendar.json");
    if (!events) {
      await writeBlobJson("parish-calendar.json", { events: [], lastUpdated: new Date().toISOString() });
    }
    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: err instanceof Error ? err.message : "Bootstrap failed" });
  }
}
`;

const API_ADMIN_RESET = `import type { NextApiRequest, NextApiResponse } from "next";
import { readBlobJson, writeBlobJson } from "../../../lib/parish-blob";
import type { ParishAdminData } from "../../../types/parish";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  if (req.headers["x-bootstrap-secret"] !== process.env.PARISH_BOOTSTRAP_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { passwordHash } = req.body as { passwordHash?: string };
  if (!passwordHash) return res.status(400).json({ error: "passwordHash is required" });

  const existing = await readBlobJson<ParishAdminData>("parish-admin.json");
  if (!existing) return res.status(404).json({ error: "Admin not bootstrapped yet" });

  await writeBlobJson("parish-admin.json", { ...existing, passwordHash, mustChangePassword: true });
  return res.status(200).json({ success: true });
}
`;

const API_LOGIN = `import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";
import { readBlobJson } from "../../../lib/parish-blob";
import { signAdminSession } from "../../../lib/parish-session";
import type { ParishAdminData } from "../../../types/parish";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { email, password } = req.body as { email?: string; password?: string };
  if (!email || !password) return res.status(400).json({ error: "email and password are required" });

  const admin = await readBlobJson<ParishAdminData>("parish-admin.json");
  if (!admin) return res.status(503).json({ error: "Admin login is not set up yet. Storage may not be connected." });

  if (admin.email.toLowerCase() !== email.toLowerCase()) return res.status(401).json({ error: "Invalid email or password" });
  const ok = await bcrypt.compare(password, admin.passwordHash);
  if (!ok) return res.status(401).json({ error: "Invalid email or password" });

  const token = await signAdminSession();
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  res.setHeader("Set-Cookie", \`parish_admin_session=\${encodeURIComponent(token)}; HttpOnly; Path=/; Max-Age=28800; SameSite=Lax\${secure}\`);
  return res.status(200).json({ success: true, mustChangePassword: admin.mustChangePassword });
}
`;

const API_CHANGE_PASSWORD = `import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";
import { readBlobJson, writeBlobJson } from "../../../lib/parish-blob";
import { verifyAdminSession, parseCookie } from "../../../lib/parish-session";
import type { ParishAdminData } from "../../../types/parish";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const token = parseCookie(req.headers.cookie, "parish_admin_session");
  if (!(await verifyAdminSession(token))) return res.status(401).json({ error: "Not authenticated" });

  const { newPassword } = req.body as { newPassword?: string };
  if (!newPassword || newPassword.length < 8) return res.status(400).json({ error: "Password must be at least 8 characters" });

  const admin = await readBlobJson<ParishAdminData>("parish-admin.json");
  if (!admin) return res.status(404).json({ error: "Admin not found" });

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await writeBlobJson("parish-admin.json", { ...admin, passwordHash, mustChangePassword: false });
  return res.status(200).json({ success: true });
}
`;

const API_EVENTS = `import type { NextApiRequest, NextApiResponse } from "next";
import { readBlobJson, writeBlobJson } from "../../../lib/parish-blob";
import { verifyAdminSession, parseCookie } from "../../../lib/parish-session";
import type { ParishCalendarData, ParishEvent } from "../../../types/parish";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = parseCookie(req.headers.cookie, "parish_admin_session");
  if (!(await verifyAdminSession(token))) return res.status(401).json({ error: "Not authenticated" });

  if (req.method === "GET") {
    const data = await readBlobJson<ParishCalendarData>("parish-calendar.json");
    return res.status(200).json(data ?? { events: [], lastUpdated: new Date().toISOString() });
  }

  if (req.method === "PUT") {
    const { events } = req.body as { events?: ParishEvent[] };
    if (!Array.isArray(events)) return res.status(400).json({ error: "events must be an array" });
    const data: ParishCalendarData = { events, lastUpdated: new Date().toISOString() };
    await writeBlobJson("parish-calendar.json", data);
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
`;

const API_PUBLIC_CALENDAR = `import type { NextApiRequest, NextApiResponse } from "next";
import { readBlobJson } from "../../lib/parish-blob";
import type { ParishCalendarData } from "../../types/parish";

export default async function handler(_req: NextApiRequest, res: NextApiResponse) {
  const data = await readBlobJson<ParishCalendarData>("parish-calendar.json");
  if (!data) return res.status(200).json({ events: [] });
  res.status(200).json({ events: data.events.filter((e) => !e.hidden) });
}
`;
```

- [x] **Step 2: Typecheck**

Run: `npx tsc --noEmit -p .`
Expected: no errors. Pay attention to the `Set-Cookie` line in `API_LOGIN` — it nests a template literal inside the outer one (`\`parish_admin_session=...\``), make sure the inner backticks and `${...}` are escaped (`\${...}`) exactly as shown.

- [x] **Step 3: Commit**

```bash
git add lib/parish-calendar-templates.ts
git commit -m "feat(parish-calendar): add API route template files"
```

---

### Task 3: Public component + admin page template strings, and the exported map

**Files:**
- Modify: `lib/parish-calendar-templates.ts`

- [x] **Step 1: Add the public `ThisWeekAtChurch` component**

```ts
const COMPONENT_THIS_WEEK = `import { useEffect, useState } from "react";

interface ParishEvent {
  id: string;
  title: string;
  dayOfWeek: number;
  specificDate: string | null;
  time: string;
  recurring: boolean;
  hidden: boolean;
  notes: string | null;
}

function getThisWeekOccurrences(events: ParishEvent[]): { event: ParishEvent; date: Date }[] {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setHours(0, 0, 0, 0);
  startOfWeek.setDate(now.getDate() - now.getDay());
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7);

  const occurrences: { event: ParishEvent; date: Date }[] = [];
  for (const ev of events) {
    if (ev.hidden) continue;
    if (ev.recurring) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + ev.dayOfWeek);
      const [h, m] = ev.time.split(":").map(Number);
      date.setHours(h, m, 0, 0);
      occurrences.push({ event: ev, date });
    } else if (ev.specificDate) {
      const date = new Date(ev.specificDate);
      const [h, m] = ev.time.split(":").map(Number);
      date.setHours(h, m, 0, 0);
      if (date >= startOfWeek && date < endOfWeek) occurrences.push({ event: ev, date });
    }
  }
  return occurrences.sort((a, b) => a.date.getTime() - b.date.getTime());
}

export default function ThisWeekAtChurch() {
  const [state, setState] = useState<"loading" | "ready" | "empty" | "error">("loading");
  const [occurrences, setOccurrences] = useState<{ event: ParishEvent; date: Date }[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/parish-calendar")
      .then((res) => { if (!res.ok) throw new Error("fetch failed"); return res.json(); })
      .then((data: { events: ParishEvent[] }) => {
        if (cancelled) return;
        const occ = getThisWeekOccurrences(data.events || []);
        setOccurrences(occ);
        setState(occ.length > 0 ? "ready" : "empty");
      })
      .catch(() => { if (!cancelled) setState("error"); });
    return () => { cancelled = true; };
  }, []);

  if (state === "loading") return null;

  if (state === "error" || state === "empty") {
    return (
      <section style={{ padding: "48px 24px", textAlign: "center" }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>This Week</h2>
        <p style={{ color: "#666" }}>Schedule coming soon — please check back.</p>
      </section>
    );
  }

  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  return (
    <section style={{ padding: "48px 24px", maxWidth: 640, margin: "0 auto" }}>
      <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 20, textAlign: "center" }}>This Week</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {occurrences.map(({ event, date }) => (
          <div key={event.id} style={{ display: "flex", justifyContent: "space-between", padding: "14px 18px", borderRadius: 10, background: "#f4f4f5" }}>
            <div>
              <div style={{ fontWeight: 600 }}>{event.title}</div>
              {event.notes && <div style={{ fontSize: 13, color: "#71717a" }}>{event.notes}</div>}
            </div>
            <div style={{ textAlign: "right", fontSize: 14, color: "#3f3f46" }}>
              <div>{dayNames[date.getDay()]}</div>
              <div>{event.time}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
`;
```

- [x] **Step 2: Add the `/admin` page**

```ts
const PAGE_ADMIN = `import { useEffect, useState } from "react";

interface ParishEvent {
  id: string;
  title: string;
  dayOfWeek: number;
  specificDate: string | null;
  time: string;
  recurring: boolean;
  hidden: boolean;
  notes: string | null;
}

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function emptyEvent(): ParishEvent {
  return { id: crypto.randomUUID(), title: "", dayOfWeek: 0, specificDate: null, time: "09:00", recurring: true, hidden: false, notes: null };
}

export default function AdminPage() {
  const [view, setView] = useState<"login" | "changePassword" | "events">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState<ParishEvent[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  const loadEvents = async () => {
    const res = await fetch("/api/parish-admin/events");
    if (res.status === 401) { setView("login"); return; }
    const data = await res.json();
    setEvents(data.events || []);
  };

  useEffect(() => {
    fetch("/api/parish-admin/events").then((res) => {
      if (res.ok) { setView("events"); res.json().then((d) => setEvents(d.events || [])); }
    });
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/parish-admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Login failed"); return; }
      if (data.mustChangePassword) setView("changePassword");
      else { await loadEvents(); setView("events"); }
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (newPassword.length < 8) { setError("Password must be at least 8 characters"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/parish-admin/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Could not change password"); return; }
      await loadEvents();
      setView("events");
    } finally {
      setLoading(false);
    }
  };

  const saveEvents = async () => {
    setSaving(true);
    setSaveMessage("");
    try {
      const res = await fetch("/api/parish-admin/events", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ events }),
      });
      setSaveMessage(res.ok ? "Saved." : "Could not save.");
    } finally {
      setSaving(false);
    }
  };

  const updateEvent = (id: string, patch: Partial<ParishEvent>) =>
    setEvents((evs) => evs.map((e) => (e.id === id ? { ...e, ...patch } : e)));

  const deleteEvent = (id: string) => setEvents((evs) => evs.filter((e) => e.id !== id));

  const inputStyle: React.CSSProperties = { padding: "8px 10px", borderRadius: 8, border: "1px solid #d4d4d8", fontSize: 14, width: "100%" };

  if (view === "login") {
    return (
      <div style={{ maxWidth: 360, margin: "80px auto", padding: 24, fontFamily: "-apple-system,sans-serif" }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Admin login</h1>
        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <input style={inputStyle} type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input style={inputStyle} type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          {error && <p style={{ color: "#dc2626", fontSize: 13, margin: 0 }}>{error}</p>}
          <button type="submit" disabled={loading} style={{ padding: "10px 16px", borderRadius: 8, border: "none", background: "#09090b", color: "#fff", fontWeight: 600, cursor: "pointer" }}>
            {loading ? "Logging in…" : "Log in"}
          </button>
        </form>
      </div>
    );
  }

  if (view === "changePassword") {
    return (
      <div style={{ maxWidth: 360, margin: "80px auto", padding: 24, fontFamily: "-apple-system,sans-serif" }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Set a new password</h1>
        <p style={{ fontSize: 13, color: "#71717a", marginBottom: 16 }}>This is your first login — choose a permanent password.</p>
        <form onSubmit={handleChangePassword} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <input style={inputStyle} type="password" placeholder="New password (min. 8 characters)" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
          {error && <p style={{ color: "#dc2626", fontSize: 13, margin: 0 }}>{error}</p>}
          <button type="submit" disabled={loading} style={{ padding: "10px 16px", borderRadius: 8, border: "none", background: "#09090b", color: "#fff", fontWeight: 600, cursor: "pointer" }}>
            {loading ? "Saving…" : "Set password"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 720, margin: "40px auto", padding: 24, fontFamily: "-apple-system,sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700 }}>This week's schedule</h1>
        <button onClick={() => setEvents((evs) => [...evs, emptyEvent()])} style={{ padding: "8px 14px", borderRadius: 8, border: "1px dashed #a1a1aa", background: "transparent", cursor: "pointer" }}>
          + Add event
        </button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {events.map((ev) => (
          <div key={ev.id} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr auto auto auto", gap: 8, alignItems: "center", padding: 10, borderRadius: 8, background: ev.hidden ? "#f4f4f5" : "#fff", border: "1px solid #ececee", opacity: ev.hidden ? 0.5 : 1 }}>
            <input style={inputStyle} value={ev.title} placeholder="Title" onChange={(e) => updateEvent(ev.id, { title: e.target.value })} />
            <select style={inputStyle} value={ev.dayOfWeek} onChange={(e) => updateEvent(ev.id, { dayOfWeek: Number(e.target.value) })}>
              {DAY_NAMES.map((d, i) => <option key={d} value={i}>{d}</option>)}
            </select>
            <input style={inputStyle} type="time" value={ev.time} onChange={(e) => updateEvent(ev.id, { time: e.target.value })} />
            <label style={{ fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}>
              <input type="checkbox" checked={ev.hidden} onChange={(e) => updateEvent(ev.id, { hidden: e.target.checked })} /> Hide
            </label>
            <button onClick={() => deleteEvent(ev.id)} style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid #fca5a5", background: "#fff", color: "#dc2626", cursor: "pointer", fontSize: 12 }}>
              Delete
            </button>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 20, display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={saveEvents} disabled={saving} style={{ padding: "10px 20px", borderRadius: 8, border: "none", background: "#09090b", color: "#fff", fontWeight: 600, cursor: "pointer" }}>
          {saving ? "Saving…" : "Save"}
        </button>
        {saveMessage && <span style={{ fontSize: 13, color: "#71717a" }}>{saveMessage}</span>}
      </div>
    </div>
  );
}
`;
```

- [x] **Step 3: Export the assembled file map**

Append to the end of the file:

```ts
export const PARISH_CALENDAR_FILES: Record<string, string> = {
  "types/parish.ts": TYPES_PARISH,
  "lib/parish-blob.ts": LIB_PARISH_BLOB,
  "lib/parish-session.ts": LIB_PARISH_SESSION,
  "pages/api/parish-admin/bootstrap.ts": API_BOOTSTRAP,
  "pages/api/parish-admin/admin-reset.ts": API_ADMIN_RESET,
  "pages/api/parish-admin/login.ts": API_LOGIN,
  "pages/api/parish-admin/change-password.ts": API_CHANGE_PASSWORD,
  "pages/api/parish-admin/events.ts": API_EVENTS,
  "pages/api/parish-calendar.ts": API_PUBLIC_CALENDAR,
  "components/ThisWeekAtChurch.tsx": COMPONENT_THIS_WEEK,
  "pages/admin.tsx": PAGE_ADMIN,
};

export const PARISH_CALENDAR_DEPENDENCIES: Record<string, string> = {
  bcryptjs: "^3.0.3",
  jose: "^6.2.3",
  "@vercel/blob": "^0.27.0",
};
```

(`@vercel/blob` version: confirm the latest stable on npm at implementation time — `^0.27.0` is a placeholder for "current stable," not a verified pin. This is the one number in this plan that should be double-checked rather than typed verbatim.)

- [x] **Step 4: Typecheck**

Run: `npx tsc --noEmit -p .`
Expected: no errors.

- [x] **Step 5: Sanity-check the embedded code is valid TS/TSX on its own**

These strings never get typechecked by insixlive's own `tsc` (they're just string literals here). Verify them independently:

```bash
mkdir -p /tmp/parish-template-check && cd /tmp/parish-template-check
node -e "
const { PARISH_CALENDAR_FILES } = require('$(pwd)/../websitebuilder/lib/parish-calendar-templates.ts');
" 2>&1 | head -5
```

This will fail directly (Node can't `require` a `.ts` file) — that's expected and not the real check. Instead, write each value of `PARISH_CALENDAR_FILES` to a real file under `/tmp/parish-template-check/` with its key as the relative path, then run `npx tsc --noEmit --jsx preserve --esModuleInterop --skipLibCheck /tmp/parish-template-check/**/*.ts /tmp/parish-template-check/**/*.tsx` (install `bcryptjs`, `jose`, `@vercel/blob`, `@types/bcryptjs`, `react`, `@types/react`, `next` into that temp dir first via `npm init -y && npm i ...`). Confirm zero TypeScript errors. This is the only reliable way to catch a typo in a string that itself contains TypeScript — don't skip it.

- [x] **Step 6: Commit**

```bash
git add lib/parish-calendar-templates.ts
git commit -m "feat(parish-calendar): add public component, admin page, and exported file map"
```

---

### Task 4: Wire `deployToVercel` to ship the files conditionally

**Files:**
- Modify: `lib/vercel.ts`

- [x] **Step 1: Extend the options type and packageJson construction**

In `lib/vercel.ts`, update the `deployToVercel` signature and the `packageJson`/files construction (~lines 13-94):

```ts
export async function deployToVercel(
  projectName: string,
  code: string,
  options?: {
    userToken?: string;
    teamId?: string | null;
    staticImages?: StaticImage[];
    parishCalendarFiles?: Record<string, string>;
  }
): Promise<{ id: string; url: string; projectId: string | null }> {
  const token = options?.userToken ?? process.env.VERCEL_API_TOKEN;
  const teamId = options?.teamId;

  if (!token) {
    throw new Error("No Vercel token available. VERCEL_API_TOKEN not set.");
  }

  const extraDeps = options?.parishCalendarFiles
    ? { bcryptjs: "^3.0.3", jose: "^6.2.3", "@vercel/blob": "^0.27.0" }
    : {};

  const packageJson = JSON.stringify(
    {
      name: projectName,
      version: "0.1.0",
      scripts: { dev: "next dev", build: "next build", start: "next start" },
      dependencies: {
        next: "^14.2.0",
        react: "^18.3.0",
        "react-dom": "^18.3.0",
        ...extraDeps,
      },
      devDependencies: {
        typescript: "^5.0.0",
        "@types/react": "^18.3.0",
        "@types/node": "^20.0.0",
        "@types/react-dom": "^18.3.0",
      },
    },
    null,
    2
  );
```

- [x] **Step 2: Add the conditional files to the deploy payload**

In the same function's `files` array (~line 83-94), add the parish files after the static images:

```ts
        files: [
          { file: "package.json", data: packageJson },
          { file: "tsconfig.json", data: tsConfig },
          { file: "next.config.js", data: `/** @type {import('next').NextConfig} */\nmodule.exports = { typescript: { ignoreBuildErrors: true }, eslint: { ignoreDuringBuilds: true } };` },
          { file: "pages/index.tsx", data: code },
          ...(options?.staticImages ?? []).map(img => ({
            file: `public/${img.path}`,
            data: img.base64,
            encoding: "base64",
          })),
          ...Object.entries(options?.parishCalendarFiles ?? {}).map(([file, data]) => ({ file, data })),
        ],
```

- [x] **Step 3: Typecheck**

Run: `npx tsc --noEmit -p .`
Expected: no errors.

- [x] **Step 4: Commit**

```bash
git add lib/vercel.ts
git commit -m "feat(parish-calendar): support shipping fixed files in deployToVercel"
```

---

### Task 5: Wire generate-site to pass the files and instruct the LLM to render the component

**Files:**
- Modify: `app/api/generate-site/route.ts`

The generated `pages/index.tsx` is 100% LLM-authored — it will only render `<ThisWeekAtChurch />` if explicitly told to. This task adds that instruction to the prompt and passes the file map into `deployToVercel`.

- [x] **Step 1: Import the template map**

```ts
import { PARISH_CALENDAR_FILES } from "@/lib/parish-calendar-templates";
```

- [x] **Step 2: Add the LLM prompt instruction**

Find the prompt-building function (the one returning the big template string with `${features.length > 0 ? ...}`, ~line 365). Add a new line right after that `features` block:

```ts
${f.pages.calendarModuleEnabled ? `IMPORTANT — editable weekly schedule:\nThis site includes a pre-built component at "../components/ThisWeekAtChurch" (relative to pages/index.tsx). Import it with: import ThisWeekAtChurch from "../components/ThisWeekAtChurch"; and render <ThisWeekAtChurch /> as its own section in a sensible place in the page (e.g. directly after the hero, or in a dedicated "This Week" / "Schedule" section). Do not attempt to build your own schedule UI — this component handles its own data fetching and empty states. Do not pass it any props. Do NOT add a link to "/admin" anywhere in the navigation, footer, or body content — it is a password-protected staff-only page and must not appear in any menu.` : ""}
```

- [x] **Step 3: Pass the file map into `deployToVercel`**

In the new-site deploy call (~line 477):

```ts
    const deployment = await deployToVercel(projectName, websiteCode, {
      userToken: vercelToken.token,
      teamId: vercelToken.teamId,
      staticImages,
      parishCalendarFiles: f.pages.calendarModuleEnabled ? PARISH_CALENDAR_FILES : undefined,
    });
```

(Match the exact existing argument names — `userToken`/`teamId`/`staticImages` — to whatever the surrounding code already uses; only the new `parishCalendarFiles` line is being added.)

- [x] **Step 4: Typecheck**

Run: `npx tsc --noEmit -p .`
Expected: no errors.

- [x] **Step 5: Commit**

```bash
git add app/api/generate-site/route.ts
git commit -m "feat(parish-calendar): ship calendar files on deploy and instruct the LLM to render the component"
```

---

### Task 6: End-to-end manual verification

No automated test runner exists in this codebase (checked: `package.json` has no `test` script, no jest/vitest config). Verify manually:

- [ ] **Step 1: Generate a real site with the toggle on**

`npm run dev`, go through `/generate` with a connected Vercel account, enable "Editable weekly calendar" in Finishing Touches, submit.

- [ ] **Step 2: Confirm the deploy includes the new files**

```bash
curl -s "https://api.vercel.com/v13/deployments/<deploymentId>/files" -H "Authorization: Bearer <token>" | grep -o "parish-admin\|ThisWeekAtChurch\|parish-calendar"
```

Expected: all three substrings present.

- [ ] **Step 3: Confirm the public page renders the schedule section**

Open the deployed `vercel_url` in a browser. Expected: a "This Week" section showing "Schedule coming soon — please check back." (Blob isn't connected yet, so the public API returns no events — this is the correct graceful-empty-state path, not a bug.)

- [ ] **Step 4: Connect Blob manually, then verify from insixlive's dashboard**

In the Vercel dashboard, connect a Blob store to the generated project (per the email instructions from the companion plan). Then in insixlive's dashboard, click "I've connected it, check now" on the `ParishCalendarCard`. Expected: status flips to "Connected."

- [ ] **Step 5: Log in as the priest**

Open `<vercel_url>/admin`, log in with the emailed temp password. Expected: forced password-change screen, then the empty events table after setting a new password.

- [ ] **Step 6: Add an event and confirm it appears publicly without a redeploy**

Add an event for today's day-of-week, save. Reload the public homepage (no redeploy triggered) — expected: the event now appears in the public "This Week" section within seconds.

- [ ] **Step 7: Test "Resend admin credentials"**

From insixlive's dashboard, click "Resend admin credentials." Expected: a new email arrives with a new temp password; the old password no longer works at `/admin`; the new one does and forces a password change again.

---

## What this plan does NOT do (by design)

- Does not add a UI for hiding/showing the module on an *existing* site (creation-time only, same limitation as the backend plan).
- Does not attempt automatic Blob store creation via Vercel's Storage API — manual connection only, per the spec's own deferred V2 step.
- Does not add a `cookie` npm package — cookie parsing/setting is hand-rolled in `lib/parish-session.ts` to keep the generated site's dependency footprint minimal.
