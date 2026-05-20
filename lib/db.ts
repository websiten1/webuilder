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
  verification_code: string | null;
  verification_code_expires: Date | null;
  payment_status: "pending" | "paid" | "failed";
  payment_date: Date | null;
  stripe_customer_id: string | null;
  stripe_session_id: string | null;
  vercel_access_token: string | null;
  vercel_user_id: string | null;
  vercel_team_id: string | null;
  vercel_authorized: boolean;
  vercel_authorized_at: Date | null;
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
  vercel_project_id: string | null;
  vercel_deployment_id: string | null;
  deployment_status: string;
  status: string;
  current_version: number;
  edit_count: number;
  design_preferences: Record<string, unknown> | null;
  custom_domain: string | null;
  custom_domain_connected: boolean;
  custom_domain_connected_at: Date | null;
  vercel_domain_id: string | null;
  total_edits: number;
  pricing_tier: "website" | "website_5";
  free_edits_remaining: number;
  total_edits_included: number;
  created_at: Date;
};

export type SiteEdit = {
  id: string;
  site_id: string;
  user_id: string;
  description: string;
  status: "pending" | "paid" | "processing" | "completed" | "failed";
  stripe_session_id: string | null;
  stripe_payment_intent_id: string | null;
  previous_vercel_url: string | null;
  new_vercel_url: string | null;
  created_at: Date;
  completed_at: Date | null;
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
  repoName: string,
  designPreferences?: Record<string, unknown>
): Promise<Site> {
  const sql = getDb();
  const prefs = designPreferences ? JSON.stringify(designPreferences) : null;
  const rows = await sql`
    INSERT INTO sites (user_id, name, business_type, github_url, vercel_url, repo_name, design_preferences)
    VALUES (${userId}, ${name}, ${businessType}, ${githubUrl}, ${vercelUrl}, ${repoName}, ${prefs}::jsonb)
    RETURNING *
  `;
  return rows[0] as Site;
}

export async function getSiteById(id: string, userId: string): Promise<Site | null> {
  const sql = getDb();
  const rows = await sql`
    SELECT * FROM sites WHERE id = ${id} AND user_id = ${userId} LIMIT 1
  `;
  return (rows[0] as Site) || null;
}

export async function createSiteEdit(
  siteId: string,
  userId: string,
  description: string
): Promise<SiteEdit> {
  const sql = getDb();
  const rows = await sql`
    INSERT INTO site_edits (site_id, user_id, description)
    VALUES (${siteId}, ${userId}, ${description})
    RETURNING *
  `;
  return rows[0] as SiteEdit;
}

export async function updateSiteEditStatus(
  editId: string,
  status: SiteEdit["status"],
  fields?: {
    stripeSessionId?: string;
    stripePaymentIntentId?: string;
    newVercelUrl?: string;
    previousVercelUrl?: string;
    completedAt?: Date;
  }
): Promise<void> {
  const sql = getDb();
  await sql`
    UPDATE site_edits
    SET status = ${status},
        stripe_session_id = COALESCE(${fields?.stripeSessionId ?? null}, stripe_session_id),
        stripe_payment_intent_id = COALESCE(${fields?.stripePaymentIntentId ?? null}, stripe_payment_intent_id),
        new_vercel_url = COALESCE(${fields?.newVercelUrl ?? null}, new_vercel_url),
        previous_vercel_url = COALESCE(${fields?.previousVercelUrl ?? null}, previous_vercel_url),
        completed_at = COALESCE(${fields?.completedAt ?? null}, completed_at)
    WHERE id = ${editId}
  `;
}

export async function getSiteEditById(id: string): Promise<SiteEdit | null> {
  const sql = getDb();
  const rows = await sql`
    SELECT * FROM site_edits WHERE id = ${id} LIMIT 1
  `;
  return (rows[0] as SiteEdit) || null;
}

export async function getSiteEditsBysite(siteId: string, userId: string): Promise<SiteEdit[]> {
  const sql = getDb();
  const rows = await sql`
    SELECT se.* FROM site_edits se
    JOIN sites s ON s.id = se.site_id
    WHERE se.site_id = ${siteId} AND s.user_id = ${userId}
    ORDER BY se.created_at DESC
  `;
  return rows as SiteEdit[];
}

export async function incrementSiteVersion(siteId: string): Promise<void> {
  const sql = getDb();
  await sql`
    UPDATE sites
    SET current_version = current_version + 1,
        edit_count = edit_count + 1
    WHERE id = ${siteId}
  `;
}

export async function getSitesByUserId(userId: string): Promise<Site[]> {
  const sql = getDb();
  const rows = await sql`
    SELECT * FROM sites WHERE user_id = ${userId} ORDER BY created_at DESC
  `;
  return rows as Site[];
}

export async function saveVerificationCode(
  userId: string,
  code: string,
  expires: Date
): Promise<void> {
  const sql = getDb();
  await sql`
    UPDATE users
    SET verification_code = ${code},
        verification_code_expires = ${expires},
        updated_at = NOW()
    WHERE id = ${userId}
  `;
}

export async function getUserByVerificationCode(
  email: string,
  code: string
): Promise<User | null> {
  const sql = getDb();
  const rows = await sql`
    SELECT * FROM users
    WHERE email = ${email}
      AND verification_code = ${code}
      AND verification_code_expires > NOW()
    LIMIT 1
  `;
  return (rows[0] as User) || null;
}

export async function clearVerificationCode(userId: string): Promise<void> {
  const sql = getDb();
  await sql`
    UPDATE users
    SET verification_code = NULL,
        verification_code_expires = NULL,
        email_verified = TRUE,
        verification_token = NULL,
        verification_token_expires = NULL,
        updated_at = NOW()
    WHERE id = ${userId}
  `;
}

export async function saveDomainToSite(
  siteId: string,
  domain: string,
  vercelDomainId?: string | null
): Promise<void> {
  const sql = getDb();
  await sql`
    UPDATE sites
    SET custom_domain = ${domain},
        custom_domain_connected = TRUE,
        custom_domain_connected_at = NOW(),
        vercel_domain_id = ${vercelDomainId ?? null}
    WHERE id = ${siteId}
  `;
}

export async function saveVercelAuth(
  userId: string,
  accessToken: string,
  vercelUserId: string | null,
  teamId: string | null
): Promise<void> {
  const sql = getDb();
  await sql`
    UPDATE users
    SET vercel_access_token = ${accessToken},
        vercel_user_id = ${vercelUserId},
        vercel_team_id = ${teamId},
        vercel_authorized = TRUE,
        vercel_authorized_at = NOW(),
        updated_at = NOW()
    WHERE id = ${userId}
  `;
}

export async function saveSiteWithVercel(
  userId: string,
  name: string,
  businessType: string,
  vercelUrl: string,
  vercelProjectId: string,
  vercelDeploymentId: string,
  designPreferences?: Record<string, unknown>,
  pricingTier: "website" | "website_5" = "website"
): Promise<Site> {
  const sql = getDb();
  const prefs = designPreferences ? JSON.stringify(designPreferences) : null;
  const freeEdits = pricingTier === "website_5" ? 5 : 0;
  const rows = await sql`
    INSERT INTO sites (
      user_id, name, business_type, vercel_url,
      vercel_project_id, vercel_deployment_id, deployment_status,
      design_preferences, pricing_tier, free_edits_remaining, total_edits_included
    )
    VALUES (
      ${userId}, ${name}, ${businessType}, ${vercelUrl},
      ${vercelProjectId}, ${vercelDeploymentId}, 'deployed',
      ${prefs}::jsonb, ${pricingTier}, ${freeEdits}, ${freeEdits}
    )
    RETURNING *
  `;
  return rows[0] as Site;
}

export async function updateSiteAfterRegeneration(
  siteId: string,
  vercelUrl: string,
  vercelDeploymentId: string,
  vercelProjectId: string,
  designPreferences: Record<string, unknown>
): Promise<void> {
  const sql = getDb();
  const prefs = JSON.stringify(designPreferences);
  await sql`
    UPDATE sites
    SET vercel_url          = ${vercelUrl},
        vercel_deployment_id = ${vercelDeploymentId},
        vercel_project_id   = ${vercelProjectId},
        design_preferences  = ${prefs}::jsonb,
        current_version     = current_version + 1,
        updated_at          = NOW()
    WHERE id = ${siteId}
  `;
}

export async function updateSiteVercelUrl(siteId: string, vercelUrl: string): Promise<void> {
  const sql = getDb();
  await sql`
    UPDATE sites
    SET vercel_url = ${vercelUrl}, updated_at = NOW()
    WHERE id = ${siteId}
  `;
}

export async function decrementFreeEdits(siteId: string): Promise<void> {
  const sql = getDb();
  await sql`
    UPDATE sites
    SET free_edits_remaining = GREATEST(0, free_edits_remaining - 1)
    WHERE id = ${siteId}
  `;
}
