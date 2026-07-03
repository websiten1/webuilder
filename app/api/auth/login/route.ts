import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getUserByEmail } from "@/lib/db";
import { createSession } from "@/lib/session";
import { clearLoginFailures, isLoginLocked, recordLoginFailure } from "@/lib/rate-limit";
import { genericErrorResponse, logServerError, newErrorId } from "@/lib/api-error";

const INVALID_CREDENTIALS = "Invalid email or password.";
// Always compared so unknown-email and wrong-password paths take equal time.
const TIMING_DUMMY_HASH = "$2b$12$wX9KLZcyIJlc1bTxv8xD8.xMDHlXSeqfAnPRRxaefiw./tAxPujq2";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase();

    if (await isLoginLocked(normalizedEmail)) {
      await bcrypt.compare(password, TIMING_DUMMY_HASH);
      return NextResponse.json({ error: INVALID_CREDENTIALS }, { status: 401 });
    }

    const user = await getUserByEmail(normalizedEmail);
    const hashToCompare = user?.password_hash ?? TIMING_DUMMY_HASH;
    const passwordValid = await bcrypt.compare(password, hashToCompare);

    if (!user || !passwordValid) {
      await recordLoginFailure(normalizedEmail);
      return NextResponse.json({ error: INVALID_CREDENTIALS }, { status: 401 });
    }

    if (!user.email_verified) {
      return NextResponse.json(
        {
          error: "Please verify your email before logging in.",
          code: "EMAIL_NOT_VERIFIED",
        },
        { status: 403 }
      );
    }

    await clearLoginFailures(normalizedEmail);

    await createSession({
      userId: user.id,
      emailVerified: user.email_verified,
      paymentStatus: user.payment_status,
    });

    return NextResponse.json({ success: true, redirectTo: "/dashboard" });
  } catch (error) {
    const errorId = newErrorId();
    logServerError(errorId, "auth/login", error);
    return genericErrorResponse(errorId);
  }
}
