import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getUserByEmail } from "@/lib/db";
import { createSession } from "@/lib/session";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    const user = await getUserByEmail(email.toLowerCase());
    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    const passwordValid = await bcrypt.compare(password, user.password_hash);
    if (!passwordValid) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
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

    await createSession({
      userId: user.id,
      emailVerified: user.email_verified,
      paymentStatus: user.payment_status,
    });

    const redirectTo =
      user.payment_status === "paid" ? "/dashboard" : "/checkout";

    return NextResponse.json({ success: true, redirectTo });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Login failed. Please try again." },
      { status: 500 }
    );
  }
}
