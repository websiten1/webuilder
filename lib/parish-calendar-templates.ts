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
