import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { clearVercelAuth } from "@/lib/db";

export async function POST() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  await clearVercelAuth(session.userId);
  return NextResponse.json({ success: true });
}
