import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { neon } from "@neondatabase/serverless";

function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL not set");
  return neon(url);
}

async function ensureTable() {
  const sql = getDb();
  await sql`
    CREATE TABLE IF NOT EXISTS wizard_drafts (
      user_id TEXT PRIMARY KEY,
      data    JSONB NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { data } = await req.json();
  if (!data) return NextResponse.json({ error: "No data" }, { status: 400 });

  await ensureTable();
  const sql = getDb();
  await sql`
    INSERT INTO wizard_drafts (user_id, data, updated_at)
    VALUES (${session.userId}, ${JSON.stringify(data)}::jsonb, NOW())
    ON CONFLICT (user_id) DO UPDATE
      SET data = EXCLUDED.data, updated_at = NOW()
  `;
  return NextResponse.json({ ok: true });
}

export async function GET(req: NextRequest) {
  void req;
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  await ensureTable();
  const sql = getDb();
  const rows = await sql`SELECT data FROM wizard_drafts WHERE user_id = ${session.userId} LIMIT 1`;
  return NextResponse.json({ data: rows[0]?.data ?? null });
}
