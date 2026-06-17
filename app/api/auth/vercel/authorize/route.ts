import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import crypto from "crypto";

export async function GET(request: NextRequest) {
  const state = crypto.randomBytes(16).toString("hex");

  const session = await getSession();
  const statePayload = JSON.stringify({
    state,
    loggedIn: !!session,
    userId: session?.userId ?? null,
  });

  const vercelUrl = new URL("https://vercel.com/integrations/insixlive/add");
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
