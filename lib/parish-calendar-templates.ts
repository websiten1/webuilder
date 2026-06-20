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
  "@vercel/blob": "^2.4.1",
};
