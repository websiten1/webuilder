import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { getUserByEmail, savePasswordResetToken } from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/email";
import { genericErrorResponse, logServerError, newErrorId } from "@/lib/api-error";

const OK_MESSAGE =
  "If an account exists for this email, we sent a link to reset your password.";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    const normalized = email.toLowerCase().trim();
    const user = await getUserByEmail(normalized);

    if (user?.email_verified) {
      const token = crypto.randomBytes(32).toString("hex");
      const expires = new Date(Date.now() + 60 * 60 * 1000);
      await savePasswordResetToken(user.id, token, expires);
      try {
        await sendPasswordResetEmail(normalized, token, user.preferred_language);
      } catch (emailError) {
        console.error("Password reset email failed:", emailError);
      }
    } else if (user) {
      // Unverified account — same response, no email (avoid leaking state).
      await bcrypt.compare("timing", user.password_hash);
    }

    return NextResponse.json({ success: true, message: OK_MESSAGE });
  } catch (error) {
    const errorId = newErrorId();
    logServerError(errorId, "auth/forgot-password", error);
    return genericErrorResponse(errorId);
  }
}
