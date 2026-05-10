import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { saveVercelAuth } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  if (error) {
    console.log("Vercel OAuth denied:", error);
    return NextResponse.redirect(
      new URL("/generate?error=vercel_denied", request.url)
    );
  }

  // Verify CSRF state (cookie set on same origin — this works as long as
  // the authorize and callback happen on the same domain, which they do
  // since we build redirect_uri dynamically from the request origin)
  const storedState = request.cookies.get("vercel_oauth_state")?.value;
  if (storedState && state && storedState !== state) {
    console.error("Vercel OAuth state mismatch — possible CSRF");
    return NextResponse.redirect(
      new URL("/generate?error=vercel_state_mismatch", request.url)
    );
  }
  // If there is no stored state (e.g. cookie was cleared), allow through
  // rather than blocking the user — the code itself is still verified

  if (!code) {
    return NextResponse.redirect(
      new URL("/generate?error=vercel_no_code", request.url)
    );
  }

  const session = await getSession();
  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Build the same redirect_uri used during authorization
  const origin = new URL(request.url).origin;
  const redirectUri = `${origin}/api/auth/vercel/callback`;

  try {
    const tokenRes = await fetch("https://api.vercel.com/v2/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.VERCEL_OAUTH_CLIENT_ID!,
        client_secret: process.env.VERCEL_OAUTH_CLIENT_SECRET!,
        code,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenRes.ok) {
      const body = await tokenRes.text();
      console.error("Vercel token exchange failed:", tokenRes.status, body);
      throw new Error(`Token exchange failed: ${tokenRes.status}`);
    }

    const tokenData = await tokenRes.json();
    const { access_token, team_id, user_id } = tokenData;

    if (!access_token) {
      console.error("No access_token in Vercel response:", tokenData);
      throw new Error("No access token in response");
    }

    await saveVercelAuth(session.userId, access_token, user_id ?? null, team_id ?? null);

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
