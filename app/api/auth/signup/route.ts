import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createUser, getUserByEmail, saveVerificationCode, updateUserPassword } from "@/lib/db";
import { sendVerificationCode } from "@/lib/email";
import { detectLangFromHeader } from "@/lib/locale";
import { generateVerificationCode } from "@/lib/verification";
import { genericErrorResponse, logServerError, newErrorId } from "@/lib/api-error";
import { passwordValidationError } from "@/lib/password";
import { checkRequestRateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const allowed = await checkRequestRateLimit(ip, "signup", 10, 60 * 60 * 1000);
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many signup attempts. Please try again later." },
        { status: 429 }
      );
    }

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

    const passwordError = passwordValidationError(password, "en");
    if (passwordError) {
      return NextResponse.json({ error: passwordError }, { status: 400 });
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
      const passwordHash = await bcrypt.hash(password, 12);
      await updateUserPassword(existing.id, passwordHash);
      const code = generateVerificationCode();
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

    const user = await createUser(
      email.toLowerCase(),
      passwordHash,
      "unused",
      new Date(0),
      lang
    );

    const code = generateVerificationCode();
    const codeExpires = new Date(Date.now() + 15 * 60 * 1000);
    await saveVerificationCode(user.id, code, codeExpires);

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
    const errorId = newErrorId();
    logServerError(errorId, "auth/signup", error);
    return genericErrorResponse(errorId);
  }
}
