import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getSiteById, getParishCalendarModuleBySiteId, resetParishCalendarAdminPassword } from "@/lib/db";
import { readToken } from "@/lib/encryption";
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
    const bootstrapSecret = readToken(updated.bootstrap_secret_encrypted);
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
