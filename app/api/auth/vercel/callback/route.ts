import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { saveVercelAuth } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  const baseUrl = process.env.NEXT_PUBLIC_URL || new URL(request.url).origin;

  if (error) {
    console.log("Vercel OAuth denied:", error);
    return NextResponse.redirect(`${baseUrl}/generate?error=vercel_denied`);
  }

  // Validate state — the cookie now holds a JSON payload
  const cookieRaw = request.cookies.get("vercel_oauth_state")?.value;
  if (cookieRaw && state) {
    try {
      const parsed = JSON.parse(cookieRaw);
      if (parsed.state !== state) {
        console.error("Vercel OAuth state mismatch");
        return NextResponse.redirect(`${baseUrl}/generate?error=vercel_state_mismatch`);
      }
    } catch {
      // Cookie is old format (plain string) — compare directly
      if (cookieRaw !== state) {
        console.error("Vercel OAuth state mismatch (legacy)");
        return NextResponse.redirect(`${baseUrl}/generate?error=vercel_state_mismatch`);
      }
    }
  }

  if (!code) {
    return NextResponse.redirect(`${baseUrl}/generate?error=vercel_no_code`);
  }

  const session = await getSession();
  if (!session) {
    // User completed Vercel OAuth but is not logged in to insixlive.
    // Redirect to login — they can connect Vercel again after logging in.
    return NextResponse.redirect(`${baseUrl}/login?next=vercel_connect`);
  }

  const redirectUri = `${baseUrl}/api/auth/vercel/callback`;

  try {
    const tokenRes = await fetch("https://api.vercel.com/v2/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: process.env.VERCEL_OAUTH_CLIENT_ID,
        client_secret: process.env.VERCEL_OAUTH_CLIENT_SECRET,
        code,
        redirect_uri: redirectUri,
      }),
    });

    const tokenBody = await tokenRes.text();
    console.log("Vercel token response:", tokenRes.status, tokenBody);

    if (!tokenRes.ok) {
      console.error("Vercel token exchange failed:", tokenRes.status, tokenBody);
      const detail = encodeURIComponent(tokenRes.status + ":" + tokenBody.slice(0, 120));
      return NextResponse.redirect(`${baseUrl}/generate?error=vercel_callback_failed&detail=${detail}`);
    }

    let tokenData: Record<string, string>;
    try { tokenData = JSON.parse(tokenBody); }
    catch { tokenData = Object.fromEntries(new URLSearchParams(tokenBody)); }

    const { access_token, team_id, user_id } = tokenData;

    if (!access_token) {
      console.error("No access_token in Vercel response:", tokenBody);
      return NextResponse.redirect(`${baseUrl}/generate?error=vercel_callback_failed`);
    }

    await saveVercelAuth(session.userId, access_token, user_id ?? null, team_id ?? null);

    // Return to generate with success flag — wizard JS will clean the URL
    // and step is already persisted in localStorage so the user lands on step 10
    const response = NextResponse.redirect(`${baseUrl}/generate?vercel_authorized=true`);
    response.cookies.delete("vercel_oauth_state");
    return response;
  } catch (err) {
    console.error("Vercel callback error:", err);
    return NextResponse.redirect(`${baseUrl}/generate?error=vercel_callback_failed`);
  }
}
