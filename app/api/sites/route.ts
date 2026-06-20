import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getSitesWithCalendarStatusByUserId } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }
  const sites = await getSitesWithCalendarStatusByUserId(session.userId);
  return NextResponse.json({ sites });
}
