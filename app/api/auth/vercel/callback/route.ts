import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { saveVercelAuth } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  // Where to redirect after success/failure — back to the wizard
  const baseUrl = process.env.NEXT_PUBLIC_URL || new URL(request.url).origin;

  if (error) {
    console.log("Vercel OAuth denied:", error);
    return NextResponse.redirect(`${baseUrl}/generate?error=vercel_denied`);
  }

  // Lenient state check — cookie may be absent if the authorize and callback
  // ran on different domains (e.g. webuilder-rnpp.vercel.app → insixlive.com)
  const storedState = request.cookies.get("vercel_oauth_state")?.value;
  if (storedState && state && storedState !== state) {
    console.error("Vercel OAuth state mismatch");
    return NextResponse.redirect(`${baseUrl}/generate?error=vercel_state_mismatch`);
  }

  if (!code) {
    return NextResponse.redirect(`${baseUrl}/generate?error=vercel_no_code`);
  }

  const session = await getSession();
  if (!session) {
    return NextResponse.redirect(`${baseUrl}/login`);
  }

  // Must match exactly what was sent in the authorize step
  const redirectUri = `${baseUrl}/api/auth/vercel/callback`;

  try {
    // Vercel token endpoint requires JSON (not form-encoded)
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
      return NextResponse.redirect(`${baseUrl}/generate?error=vercel_callback_failed`);
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

    const response = NextResponse.redirect(`${baseUrl}/generate?vercel_authorized=true`);
    response.cookies.delete("vercel_oauth_state");
    return response;
  } catch (err) {
    console.error("Vercel callback error:", err);
    return NextResponse.redirect(`${baseUrl}/generate?error=vercel_callback_failed`);
  }
}
