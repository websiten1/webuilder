import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getSiteById, getParishCalendarModuleBySiteId, setParishCalendarBlobConnected } from "@/lib/db";
import { readToken } from "@/lib/encryption";

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

  const bootstrapSecret = readToken(module_.bootstrap_secret_encrypted);

  try {
    const res = await fetch(`${site.vercel_url}/api/parish-admin/bootstrap`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-bootstrap-secret": bootstrapSecret },
      body: JSON.stringify({ email: module_.admin_email, passwordHash: module_.admin_password_hash }),
    });

    if (!res.ok) {
      await setParishCalendarBlobConnected(siteId, false);
      return NextResponse.json({ connected: false, reason: `Site responded ${res.status}` });
    }

    await setParishCalendarBlobConnected(siteId, true);
    return NextResponse.json({ connected: true });
  } catch (err) {
    await setParishCalendarBlobConnected(siteId, false);
    return NextResponse.json({ connected: false, reason: err instanceof Error ? err.message : "Unknown error" });
  }
}
