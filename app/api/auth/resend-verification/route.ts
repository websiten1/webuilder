import { NextRequest, NextResponse } from "next/server";
import { getUserByEmail, updateVerificationToken } from "@/lib/db";
import { sendVerificationEmail } from "@/lib/email";
import crypto from "crypto";

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

    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await updateVerificationToken(user.id, token, expires);
    await sendVerificationEmail(email.toLowerCase(), token);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Resend verification error:", error);
    return NextResponse.json(
      { error: "Failed to send email. Please try again." },
      { status: 500 }
    );
  }
}
