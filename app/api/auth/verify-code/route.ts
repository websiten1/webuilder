import { NextRequest, NextResponse } from "next/server";
import {
  getUserByEmail,
  getUserByVerificationCode,
  clearVerificationCode,
  incrementVerificationAttempts,
  invalidateVerificationCode,
} from "@/lib/db";
import { createSession } from "@/lib/session";
import {
  INVALID_VERIFICATION_CODE_MESSAGE,
  MAX_VERIFICATION_ATTEMPTS,
} from "@/lib/verification";
import { genericErrorResponse, logServerError, newErrorId } from "@/lib/api-error";
import { isActionLocked, recordActionFailure, clearActionFailures } from "@/lib/rate-limit";

const VERIFY_ACTION = "verify_code";
const MAX_LOCKOUT_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000;

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json(
        { error: "Email and code are required." },
        { status: 400 }
      );
    }

    const cleanCode = String(code).replace(/\D/g, "").trim();
    if (cleanCode.length !== 6) {
      return NextResponse.json(
        { error: "Please enter the 6-digit code." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase();

    // Lockout persists across code resends — capped at MAX_LOCKOUT_ATTEMPTS
    // wrong guesses per email within LOCKOUT_MS, independent of the per-code
    // attempt counter below (which only protects a single issued code).
    if (await isActionLocked(normalizedEmail, VERIFY_ACTION)) {
      return NextResponse.json(
        { error: INVALID_VERIFICATION_CODE_MESSAGE },
        { status: 429 }
      );
    }

    const user = await getUserByEmail(normalizedEmail);

    // Opaque response — same message whether the email is unknown, the code is
    // wrong, expired, or locked out after too many attempts.
    if (!user) {
      return NextResponse.json(
        { error: INVALID_VERIFICATION_CODE_MESSAGE },
        { status: 400 }
      );
    }

    if ((user.verification_attempts ?? 0) >= MAX_VERIFICATION_ATTEMPTS) {
      await invalidateVerificationCode(user.id);
      await recordActionFailure(normalizedEmail, VERIFY_ACTION, MAX_LOCKOUT_ATTEMPTS, LOCKOUT_MS);
      return NextResponse.json(
        { error: INVALID_VERIFICATION_CODE_MESSAGE },
        { status: 400 }
      );
    }

    const matched = await getUserByVerificationCode(normalizedEmail, cleanCode);
    if (!matched) {
      const attempts = await incrementVerificationAttempts(user.id);
      if (attempts >= MAX_VERIFICATION_ATTEMPTS) {
        await invalidateVerificationCode(user.id);
      }
      await recordActionFailure(normalizedEmail, VERIFY_ACTION, MAX_LOCKOUT_ATTEMPTS, LOCKOUT_MS);
      return NextResponse.json(
        { error: INVALID_VERIFICATION_CODE_MESSAGE },
        { status: 400 }
      );
    }

    await clearActionFailures(normalizedEmail, VERIFY_ACTION);
    await clearVerificationCode(matched.id);

    await createSession({
      userId: matched.id,
      emailVerified: true,
      paymentStatus: matched.payment_status,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const errorId = newErrorId();
    logServerError(errorId, "auth/verify-code", error);
    return genericErrorResponse(errorId);
  }
}
