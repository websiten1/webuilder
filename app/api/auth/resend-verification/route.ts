import { NextRequest, NextResponse } from "next/server";
import { getUserByEmail, saveVerificationCode } from "@/lib/db";
import { sendVerificationCode } from "@/lib/email";

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    const user = await getUserByEmail(email.toLowerCase());

    // Always return success to prevent email enumeration
    if (!user || user.email_verified) {
      return NextResponse.json({ success: true });
    }

    const code = generateCode();
    const expires = new Date(Date.now() + 15 * 60 * 1000);

    await saveVerificationCode(user.id, code, expires);
    await sendVerificationCode(email.toLowerCase(), code);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Resend code error:", error);
    return NextResponse.json(
      { error: "Failed to send code. Please try again." },
      { status: 500 }
    );
  }
}
