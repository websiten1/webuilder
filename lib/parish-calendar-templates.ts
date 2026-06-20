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
