import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import crypto from "crypto";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const clientId = process.env.VERCEL_OAUTH_CLIENT_ID;
  const redirectUri = process.env.VERCEL_OAUTH_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    console.error("Vercel OAuth credentials not configured");
    return NextResponse.redirect(
      new URL("/generate?error=vercel_not_configured", request.url)
    );
  }

  // CSRF state — stored in a short-lived cookie
  const state = crypto.randomBytes(16).toString("hex");

  const url = new URL("https://vercel.com/oauth/authorize");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("state", state);

  const response = NextResponse.redirect(url);
  response.cookies.set("vercel_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600, // 10 minutes
    path: "/",
  });
  return response;
}
