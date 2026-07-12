import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { updateUserPreferredLanguage } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    }

    const { lang } = await request.json();
    if (lang !== "en" && lang !== "ro") {
      return NextResponse.json({ error: "Invalid language." }, { status: 400 });
    }

    await updateUserPreferredLanguage(session.userId, lang);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to update language." }, { status: 500 });
  }
}
