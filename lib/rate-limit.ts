import { neon } from "@neondatabase/serverless";
import type { NextRequest } from "next/server";

/** Client IP from Vercel's edge-set header (overwritten, not appended, on Vercel). */
export function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return "unknown";
}

function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url || url === "postgresql://user:pass@host/db") {
    throw new Error("DATABASE_URL is not configured");
  }
  return neon(url);
}

export const MAX_LOGIN_ATTEMPTS = 5;
export const LOGIN_LOCKOUT_MS = 15 * 60 * 1000;

export async function isLoginLocked(email: string): Promise<boolean> {
  const sql = getDb();
  const rows = await sql`
    SELECT locked_until FROM login_rate_limits
    WHERE email = ${email.toLowerCase()} AND locked_until > NOW()
    LIMIT 1
  `;
  return rows.length > 0;
}

/** Records a failed login. Returns true if the identifier is now locked out. */
export async function recordLoginFailure(email: string): Promise<boolean> {
  const sql = getDb();
  const normalized = email.toLowerCase();
  const rows = await sql`
    INSERT INTO login_rate_limits (email, failed_attempts, locked_until, updated_at)
    VALUES (${normalized}, 1, NULL, NOW())
    ON CONFLICT (email) DO UPDATE
      SET failed_attempts = login_rate_limits.failed_attempts + 1,
          locked_until = CASE
            WHEN login_rate_limits.failed_attempts + 1 >= ${MAX_LOGIN_ATTEMPTS}
            THEN NOW() + INTERVAL '15 minutes'
            ELSE login_rate_limits.locked_until
          END,
          updated_at = NOW()
    RETURNING failed_attempts, locked_until
  `;
  const row = rows[0] as { failed_attempts: number; locked_until: Date | null };
  return row.failed_attempts >= MAX_LOGIN_ATTEMPTS || (row.locked_until !== null && new Date(row.locked_until) > new Date());
}

export async function clearLoginFailures(email: string): Promise<void> {
  const sql = getDb();
  await sql`DELETE FROM login_rate_limits WHERE email = ${email.toLowerCase()}`;
}

// ─── Generic key+action rate limiting ───────────────────────────────────────
// For pre-session endpoints (signup, forgot-password, resend-verification,
// OTP verify) where there's no user_id yet — keyed by IP address or email
// instead. Backed by request_rate_limits (migration 007).

/** Sliding-window request cap, keyed by an arbitrary string (IP, email, ...). */
export async function checkRequestRateLimit(
  key: string,
  action: string,
  maxRequests: number,
  windowMs: number
): Promise<boolean> {
  const sql = getDb();
  const rows = await sql`
    INSERT INTO request_rate_limits (key, action, window_start, request_count, updated_at)
    VALUES (${key}, ${action}, NOW(), 1, NOW())
    ON CONFLICT (key, action) DO UPDATE
      SET request_count = CASE
            WHEN request_rate_limits.window_start < NOW() - (${windowMs}::int * INTERVAL '1 millisecond')
            THEN 1
            ELSE request_rate_limits.request_count + 1
          END,
          window_start = CASE
            WHEN request_rate_limits.window_start < NOW() - (${windowMs}::int * INTERVAL '1 millisecond')
            THEN NOW()
            ELSE request_rate_limits.window_start
          END,
          updated_at = NOW()
    RETURNING request_count
  `;
  const count = Number(rows[0]?.request_count ?? 0);
  return count <= maxRequests;
}

/** Whether key+action is currently locked out after too many failures. */
export async function isActionLocked(key: string, action: string): Promise<boolean> {
  const sql = getDb();
  const rows = await sql`
    SELECT locked_until FROM request_rate_limits
    WHERE key = ${key} AND action = ${action} AND locked_until > NOW()
    LIMIT 1
  `;
  return rows.length > 0;
}

/** Records a failure; locks key+action out once maxAttempts is reached. */
export async function recordActionFailure(
  key: string,
  action: string,
  maxAttempts: number,
  lockoutMs: number
): Promise<void> {
  const sql = getDb();
  await sql`
    INSERT INTO request_rate_limits (key, action, failed_attempts, locked_until, updated_at)
    VALUES (${key}, ${action}, 1, NULL, NOW())
    ON CONFLICT (key, action) DO UPDATE
      SET failed_attempts = request_rate_limits.failed_attempts + 1,
          locked_until = CASE
            WHEN request_rate_limits.failed_attempts + 1 >= ${maxAttempts}
            THEN NOW() + (${lockoutMs}::int * INTERVAL '1 millisecond')
            ELSE request_rate_limits.locked_until
          END,
          updated_at = NOW()
  `;
}

export async function clearActionFailures(key: string, action: string): Promise<void> {
  const sql = getDb();
  await sql`DELETE FROM request_rate_limits WHERE key = ${key} AND action = ${action}`;
}

/** Sliding-window rate limit. Returns true if the request is allowed. */
export async function checkApiRateLimit(
  userId: string,
  route: string,
  maxRequests: number,
  windowMs: number
): Promise<boolean> {
  const sql = getDb();
  const rows = await sql`
    INSERT INTO api_rate_limits (user_id, route, window_start, request_count)
    VALUES (${userId}, ${route}, NOW(), 1)
    ON CONFLICT (user_id, route) DO UPDATE
      SET request_count = CASE
            WHEN api_rate_limits.window_start < NOW() - (${windowMs}::int * INTERVAL '1 millisecond')
            THEN 1
            ELSE api_rate_limits.request_count + 1
          END,
          window_start = CASE
            WHEN api_rate_limits.window_start < NOW() - (${windowMs}::int * INTERVAL '1 millisecond')
            THEN NOW()
            ELSE api_rate_limits.window_start
          END
    RETURNING request_count
  `;
  const count = Number(rows[0]?.request_count ?? 0);
  return count <= maxRequests;
}
