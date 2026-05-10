import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { saveVercelAuth } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    }

    const { token } = await request.json();
    if (!token || typeof token !== "string" || !token.trim()) {
      return NextResponse.json({ error: "Token is required." }, { status: 400 });
    }

    const t = token.trim();

    // Verify the token works by calling the Vercel API
    const checkRes = await fetch("https://api.vercel.com/v2/user", {
      headers: { Authorization: `Bearer ${t}` },
    });

    if (!checkRes.ok) {
      return NextResponse.json(
        { error: "Invalid token — Vercel rejected it. Make sure you copied the full token." },
        { status: 400 }
      );
    }

    const userData = await checkRes.json();
    const vercelUserId = userData.user?.id ?? null;
    const teamId: string | null = null; // personal token — no team

    await saveVercelAuth(session.userId, t, vercelUserId, teamId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Save Vercel token error:", error);
    return NextResponse.json(
      { error: "Failed to save token. Please try again." },
      { status: 500 }
    );
  }
}
