import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { saveVercelAuth } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(
      new URL("/generate?error=vercel_denied", request.url)
    );
  }

  // Verify CSRF state
  const storedState = request.cookies.get("vercel_oauth_state")?.value;
  if (!storedState || storedState !== state) {
    return NextResponse.redirect(
      new URL("/generate?error=vercel_state_mismatch", request.url)
    );
  }

  if (!code) {
    return NextResponse.redirect(
      new URL("/generate?error=vercel_no_code", request.url)
    );
  }

  const session = await getSession();
  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    // Exchange code for access token
    const tokenRes = await fetch("https://api.vercel.com/v2/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.VERCEL_OAUTH_CLIENT_ID!,
        client_secret: process.env.VERCEL_OAUTH_CLIENT_SECRET!,
        code,
        redirect_uri: process.env.VERCEL_OAUTH_REDIRECT_URI!,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenRes.ok) {
      const body = await tokenRes.text();
      console.error("Vercel token exchange failed:", body);
      throw new Error("Token exchange failed");
    }

    const { access_token, team_id, user_id } = await tokenRes.json();

    if (!access_token) throw new Error("No access token in response");

    await saveVercelAuth(session.userId, access_token, user_id ?? null, team_id ?? null);

    // Clear the CSRF cookie and redirect back to wizard
    const response = NextResponse.redirect(
      new URL("/generate?vercel_authorized=true", request.url)
    );
    response.cookies.delete("vercel_oauth_state");
    return response;
  } catch (err) {
    console.error("Vercel callback error:", err);
    return NextResponse.redirect(
      new URL("/generate?error=vercel_callback_failed", request.url)
    );
  }
}
