import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getUserById } from "@/lib/db";
import { getValidVercelToken } from "@/lib/vercel";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const user = await getUserById(session.userId);
  const auth = await getValidVercelToken(session.userId);

  if (!user || !auth) {
    return NextResponse.json({ connected: false });
  }

  let account: string | null = null;
  let email: string | null = null;
  try {
    const res = await fetch("https://api.vercel.com/v2/user", {
      headers: { Authorization: `Bearer ${auth.token}` },
    });
    if (res.ok) {
      const data = await res.json();
      account = data.user?.username ?? null;
      email = data.user?.email ?? null;
    }
  } catch {
    // Vercel API unreachable — still report connected from our own stored state
  }

  return NextResponse.json({
    connected: true,
    account,
    email,
    teamId: user.vercel_team_id,
    since: user.vercel_authorized_at,
  });
}
