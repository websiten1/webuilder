import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getUserById, updateUserEmailPreferences, type EmailPreferences } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const user = await getUserById(session.userId);
  if (!user) return NextResponse.json({ error: "User not found." }, { status: 404 });

  return NextResponse.json({
    email: user.email,
    preferences: user.email_preferences,
  });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const body = await request.json();
  const prefs: EmailPreferences = {
    websiteUpdates: !!body.websiteUpdates,
    rewards: !!body.rewards,
    tips: !!body.tips,
    promotions: !!body.promotions,
  };

  await updateUserEmailPreferences(session.userId, prefs);
  return NextResponse.json({ success: true });
}
