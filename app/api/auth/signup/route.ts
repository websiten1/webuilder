import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createUser, getUserByEmail, saveVerificationCode, updateUserPassword } from "@/lib/db";
import { sendVerificationCode } from "@/lib/email";
import { detectLangFromHeader } from "@/lib/locale";

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

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
      if (existing.email_verified) {
        return NextResponse.json(
          { error: "An account with this email already exists." },
          { status: 409 }
        );
      }
      // Unverified account — update password and resend code
      const passwordHash = await bcrypt.hash(password, 12);
      await updateUserPassword(existing.id, passwordHash);
      const code = generateCode();
      const codeExpires = new Date(Date.now() + 15 * 60 * 1000);
      await saveVerificationCode(existing.id, code, codeExpires);
      let emailWarning: string | null = null;
      try {
        await sendVerificationCode(email.toLowerCase(), code, existing.preferred_language);
      } catch (emailError) {
        console.error("Code email failed:", emailError);
        emailWarning = "Could not send the verification code. Please try again.";
      }
      return NextResponse.json({ success: true, emailWarning: emailWarning ?? null });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const lang = detectLangFromHeader(request.headers.get("accept-language"));

    // Create user — verification_token unused in new flow, but column required
    const user = await createUser(
      email.toLowerCase(),
      passwordHash,
      "unused",
      new Date(0), // far-past expiry so the old link flow never works
      lang
    );

    // Generate + store 6-digit code (15 min expiry)
    const code = generateCode();
    const codeExpires = new Date(Date.now() + 15 * 60 * 1000);
    await saveVerificationCode(user.id, code, codeExpires);

    // Send code email — if it fails, account still exists, user can resend
    let emailWarning: string | null = null;
    try {
      await sendVerificationCode(email.toLowerCase(), code, lang);
    } catch (emailError) {
      console.error("Code email failed:", emailError);
      emailWarning = "Account created but we could not send the code. Check server console or use Resend below.";
    }

    return NextResponse.json({
      success: true,
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
