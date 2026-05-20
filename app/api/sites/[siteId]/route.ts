import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getSiteById } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const { siteId } = await params;
  const site = await getSiteById(siteId, session.userId);
  if (!site) return NextResponse.json({ error: "Not found." }, { status: 404 });

  return NextResponse.json({ site });
}
