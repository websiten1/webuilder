import { NextRequest, NextResponse } from "next/server";
import { getUserByVerificationToken, verifyUserEmail } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: "Verification token is required." },
        { status: 400 }
      );
    }

    const user = await getUserByVerificationToken(token);
    if (!user) {
      return NextResponse.json(
        {
          error:
            "This verification link is invalid or has expired. Please request a new one.",
          code: "INVALID_TOKEN",
        },
        { status: 400 }
      );
    }

    await verifyUserEmail(user.id);

    return NextResponse.json({
      success: true,
      message: "Email verified successfully.",
    });
  } catch (error) {
    console.error("Verify email error:", error);
    return NextResponse.json(
      { error: "Verification failed. Please try again." },
      { status: 500 }
    );
  }
}
