import { neon } from "@neondatabase/serverless";

function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url || url === "postgresql://user:pass@host/db") {
    throw new Error(
      "DATABASE_URL is not configured. Set it in .env.local to your Neon connection string."
    );
  }
  return neon(url);
}

export type User = {
  id: string;
  email: string;
  password_hash: string;
  email_verified: boolean;
  verification_token: string | null;
  verification_token_expires: Date | null;
  payment_status: "pending" | "paid" | "failed";
  payment_date: Date | null;
  stripe_customer_id: string | null;
  stripe_session_id: string | null;
  created_at: Date;
  updated_at: Date;
};

export type Site = {
  id: string;
  user_id: string;
  name: string;
  business_type: string | null;
  github_url: string | null;
  vercel_url: string | null;
  repo_name: string | null;
  status: string;
  created_at: Date;
};

export async function getUserByEmail(email: string): Promise<User | null> {
  const sql = getDb();
  const rows = await sql`
    SELECT * FROM users WHERE email = ${email} LIMIT 1
  `;
  return (rows[0] as User) || null;
}

export async function getUserById(id: string): Promise<User | null> {
  const sql = getDb();
  const rows = await sql`
    SELECT * FROM users WHERE id = ${id} LIMIT 1
  `;
  return (rows[0] as User) || null;
}

export async function createUser(
  email: string,
  passwordHash: string,
  verificationToken: string,
  tokenExpires: Date
): Promise<User> {
  const sql = getDb();
  const rows = await sql`
    INSERT INTO users (email, password_hash, verification_token, verification_token_expires)
    VALUES (${email}, ${passwordHash}, ${verificationToken}, ${tokenExpires})
    RETURNING *
  `;
  return rows[0] as User;
}

export async function getUserByVerificationToken(
  token: string
): Promise<User | null> {
  const sql = getDb();
  const rows = await sql`
    SELECT * FROM users
    WHERE verification_token = ${token}
      AND verification_token_expires > NOW()
    LIMIT 1
  `;
  return (rows[0] as User) || null;
}

export async function verifyUserEmail(userId: string): Promise<void> {
  const sql = getDb();
  await sql`
    UPDATE users
    SET email_verified = TRUE,
        verification_token = NULL,
        verification_token_expires = NULL,
        updated_at = NOW()
    WHERE id = ${userId}
  `;
}

export async function updateVerificationToken(
  userId: string,
  token: string,
  expires: Date
): Promise<void> {
  const sql = getDb();
  await sql`
    UPDATE users
    SET verification_token = ${token},
        verification_token_expires = ${expires},
        updated_at = NOW()
    WHERE id = ${userId}
  `;
}

export async function markUserPaid(
  userId: string,
  stripeSessionId: string,
  stripeCustomerId: string | null
): Promise<void> {
  const sql = getDb();
  await sql`
    UPDATE users
    SET payment_status = 'paid',
        payment_date = NOW(),
        stripe_session_id = ${stripeSessionId},
        stripe_customer_id = ${stripeCustomerId},
        updated_at = NOW()
    WHERE id = ${userId}
  `;
}

export async function saveSite(
  userId: string,
  name: string,
  businessType: string,
  githubUrl: string,
  vercelUrl: string,
  repoName: string
): Promise<Site> {
  const sql = getDb();
  const rows = await sql`
    INSERT INTO sites (user_id, name, business_type, github_url, vercel_url, repo_name)
    VALUES (${userId}, ${name}, ${businessType}, ${githubUrl}, ${vercelUrl}, ${repoName})
    RETURNING *
  `;
  return rows[0] as Site;
}

export async function getSitesByUserId(userId: string): Promise<Site[]> {
  const sql = getDb();
  const rows = await sql`
    SELECT * FROM sites WHERE user_id = ${userId} ORDER BY created_at DESC
  `;
  return rows as Site[];
}
