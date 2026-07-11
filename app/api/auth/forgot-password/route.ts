import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { getUserByEmail, savePasswordResetToken } from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/email";
import { genericErrorResponse, logServerError, newErrorId } from "@/lib/api-error";
import { checkRequestRateLimit, getClientIp } from "@/lib/rate-limit";

const OK_MESSAGE =
  "If an account exists for this email, we sent a link to reset your password.";

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const ipAllowed = await checkRequestRateLimit(ip, "forgot_password", 8, 60 * 60 * 1000);
    if (!ipAllowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const { email } = await request.json();
    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    const normalized = email.toLowerCase().trim();

    // Capped per-email too, so one target's inbox can't be hammered from many
    // IPs — but silently, returning the same generic response either way, so
    // this never becomes a side channel for whether the email exists.
    const emailAllowed = await checkRequestRateLimit(normalized, "forgot_password_email", 3, 60 * 60 * 1000);

    const user = await getUserByEmail(normalized);

    if (user?.email_verified && emailAllowed) {
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
