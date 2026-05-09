import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createUser, getUserByEmail } from "@/lib/db";
import { sendVerificationEmail } from "@/lib/email";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const { email, password, confirmPassword } = await request.json();

    if (!email || !password || !confirmPassword) {
      return NextResponse.json(
        { error: "All fields are required." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters." },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: "Passwords do not match." },
        { status: 400 }
      );
    }

    const existing = await getUserByEmail(email.toLowerCase());
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await createUser(
      email.toLowerCase(),
      passwordHash,
      verificationToken,
      tokenExpires
    );

    // Try to send the email — if it fails, the account still exists and the
    // user can request a new link from /verify-email. Log the link for dev use.
    let emailWarning: string | null = null;
    try {
      await sendVerificationEmail(email.toLowerCase(), verificationToken);
    } catch (emailError) {
      console.error("Email send failed:", emailError);
      emailWarning =
        "Account created but we could not send the verification email. " +
        "Check the server console for the verification link (development), " +
        "or use 'Resend verification email' on the next page.";
    }

    return NextResponse.json({
      success: true,
      message: emailWarning ?? "Account created! Check your email for the verification link.",
      emailWarning: emailWarning ?? null,
    });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Failed to create account. Please try again." },
      { status: 500 }
    );
  }
}
