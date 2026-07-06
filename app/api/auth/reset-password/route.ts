import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getUserByPasswordResetToken, updateUserPassword } from "@/lib/db";
import { passwordValidationError } from "@/lib/password";
import { genericErrorResponse, logServerError, newErrorId } from "@/lib/api-error";

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json();

    if (!token || typeof token !== "string" || !password) {
      return NextResponse.json(
        { error: "Token and new password are required." },
        { status: 400 }
      );
    }

    const passwordError = passwordValidationError(password, "en");
    if (passwordError) {
      return NextResponse.json({ error: passwordError }, { status: 400 });
    }

    const user = await getUserByPasswordResetToken(token);
    if (!user) {
      return NextResponse.json(
        { error: "This reset link is invalid or has expired." },
        { status: 400 }
      );
    }

    const newHash = await bcrypt.hash(password, 12);
    await updateUserPassword(user.id, newHash);

    return NextResponse.json({ success: true });
  } catch (error) {
    const errorId = newErrorId();
    logServerError(errorId, "auth/reset-password", error);
    return genericErrorResponse(errorId);
  }
}
