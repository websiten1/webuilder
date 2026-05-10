import { NextRequest, NextResponse } from "next/server";
import { getUserByVerificationCode, clearVerificationCode } from "@/lib/db";
import { createSession } from "@/lib/session";

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

    const user = await getUserByVerificationCode(email.toLowerCase(), cleanCode);

    if (!user) {
      return NextResponse.json(
        { error: "Incorrect code or it has expired. Try resending." },
        { status: 400 }
      );
    }

    // Mark verified + clear code
    await clearVerificationCode(user.id);

    // Create session so user is immediately logged in — no extra sign-in needed
    await createSession({
      userId: user.id,
      emailVerified: true,
      paymentStatus: user.payment_status,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Verify code error:", error);
    return NextResponse.json(
      { error: "Verification failed. Please try again." },
      { status: 500 }
    );
  }
}
