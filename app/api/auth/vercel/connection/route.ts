import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { checkUserVercelConnection } from "@/lib/vercel";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const status = await checkUserVercelConnection(session.userId);

  if (!status.connected) {
    return NextResponse.json({ connected: false });
  }

  return NextResponse.json({
    connected: true,
    account: status.account,
    email: status.email,
    teamId: status.teamId,
    since: status.since,
  });
}
