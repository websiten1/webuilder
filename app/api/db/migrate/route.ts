import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

// POST /api/db/migrate — run once to create tables in your Neon database.
// Call this endpoint after setting DATABASE_URL in .env.local.
export async function POST() {
  const url = process.env.DATABASE_URL;
  if (!url || url === "postgresql://user:pass@host/db") {
    return NextResponse.json(
      { error: "DATABASE_URL is not configured." },
      { status: 500 }
    );
  }

  const sql = neon(url);

  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      email_verified BOOLEAN DEFAULT FALSE,
      verification_token TEXT,
      verification_token_expires TIMESTAMPTZ,
      payment_status TEXT DEFAULT 'pending'
        CHECK (payment_status IN ('pending', 'paid', 'failed')),
      payment_date TIMESTAMPTZ,
      stripe_customer_id TEXT,
      stripe_session_id TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS sites (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      business_type TEXT,
      github_url TEXT,
      vercel_url TEXT,
      repo_name TEXT,
      status TEXT DEFAULT 'deployed',
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  return NextResponse.json({
    success: true,
    message: "Tables created (or already exist).",
  });
}
