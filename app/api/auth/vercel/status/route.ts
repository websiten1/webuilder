import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

// Diagnostic endpoint — visit /api/auth/vercel/status to check OAuth config
export async function GET() {
  const session = await getSession();
  const baseUrl = process.env.NEXT_PUBLIC_URL || "not set";
  const clientId = process.env.VERCEL_OAUTH_CLIENT_ID || "not set";
  const hasSecret = !!process.env.VERCEL_OAUTH_CLIENT_SECRET;
  const redirectUri = `${baseUrl}/api/auth/vercel/callback`;

  return NextResponse.json({
    sessionPresent: !!session,
    userId: session?.userId ?? null,
    clientId,
    hasSecret,
    redirectUri,
    baseUrl,
  });
}
