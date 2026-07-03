import { NextRequest, NextResponse } from "next/server";
import { getUserByEmail, saveVerificationCode, canSendVerificationCode } from "@/lib/db";
import { sendVerificationCode } from "@/lib/email";
import { generateVerificationCode, RESEND_MIN_INTERVAL_MS } from "@/lib/verification";
import { genericErrorResponse, logServerError, newErrorId } from "@/lib/api-error";

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

    if (!(await canSendVerificationCode(user.id, RESEND_MIN_INTERVAL_MS))) {
      return NextResponse.json({ success: true });
    }

    const code = generateVerificationCode();
    const expires = new Date(Date.now() + 15 * 60 * 1000);

    await saveVerificationCode(user.id, code, expires);
    await sendVerificationCode(email.toLowerCase(), code, user.preferred_language);

    return NextResponse.json({ success: true });
  } catch (error) {
    const errorId = newErrorId();
    logServerError(errorId, "auth/resend-verification", error);
    return genericErrorResponse(errorId);
  }
}
