import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import crypto from "crypto";

export async function GET(request: NextRequest) {
  const clientId = process.env.VERCEL_OAUTH_CLIENT_ID;
  if (!clientId) {
    console.error("VERCEL_OAUTH_CLIENT_ID not set");
    return NextResponse.redirect(
      new URL("/generate?error=vercel_not_configured", request.url)
    );
  }

  const baseUrl = process.env.NEXT_PUBLIC_URL || new URL(request.url).origin;
  const redirectUri = `${baseUrl}/api/auth/vercel/callback`;

  const state = crypto.randomBytes(16).toString("hex");

  const session = await getSession();
  const statePayload = JSON.stringify({
    state,
    loggedIn: !!session,
    userId: session?.userId ?? null,
  });

  const vercelUrl = new URL("https://vercel.com/oauth/authorize");
  vercelUrl.searchParams.set("client_id", clientId);
  vercelUrl.searchParams.set("redirect_uri", redirectUri);
  vercelUrl.searchParams.set("response_type", "code");
  vercelUrl.searchParams.set("state", state);

  const response = NextResponse.redirect(vercelUrl);
  response.cookies.set("vercel_oauth_state", statePayload, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });
  return response;
}
