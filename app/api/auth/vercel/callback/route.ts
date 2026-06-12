import { NextRequest, NextResponse } from "next/server";
import { getSession, createSession } from "@/lib/session";
import { getUserById, saveVercelAuth } from "@/lib/db";

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

  // Validate state and extract the userId stored at authorize time.
  const cookieRaw = request.cookies.get("vercel_oauth_state")?.value;
  let stateUserId: string | null = null;

  if (cookieRaw && state) {
    try {
      const parsed = JSON.parse(cookieRaw);
      if (parsed.state !== state) {
        console.error("Vercel OAuth state mismatch");
        return NextResponse.redirect(`${baseUrl}/generate?error=vercel_state_mismatch`);
      }
      stateUserId = parsed.userId ?? null;
    } catch {
      // Cookie is old format (plain string)
      if (cookieRaw !== state) {
        console.error("Vercel OAuth state mismatch (legacy)");
        return NextResponse.redirect(`${baseUrl}/generate?error=vercel_state_mismatch`);
      }
    }
  }

  if (!code) {
    return NextResponse.redirect(`${baseUrl}/generate?error=vercel_no_code`);
  }

  // Prefer active session; fall back to the userId embedded in the state cookie
  // (the JWT may have expired while the user was on Vercel's consent screen).
  const session = await getSession();
  const userId = session?.userId ?? stateUserId;

  if (!userId) {
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

    await saveVercelAuth(userId, access_token, user_id ?? null, team_id ?? null);

    // Re-issue a fresh session so the user is not logged out after OAuth redirect.
    const user = await getUserById(userId);
    if (user) {
      await createSession({ userId: user.id, emailVerified: user.email_verified, paymentStatus: user.payment_status as "pending" | "paid" | "failed" });
    }

    const response = NextResponse.redirect(`${baseUrl}/generate?vercel_authorized=true`);
    response.cookies.delete("vercel_oauth_state");
    return response;
  } catch (err) {
    console.error("Vercel callback error:", err);
    return NextResponse.redirect(`${baseUrl}/generate?error=vercel_callback_failed`);
  }
}
