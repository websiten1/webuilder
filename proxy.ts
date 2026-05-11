import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "@/lib/session";

// Routes that require a valid, email-verified session
const protectedRoutes = ["/dashboard", "/generate", "/success", "/edit", "/domains"];
// Routes that logged-in users should skip
const authRoutes = ["/login", "/signup"];

export default async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isProtected = protectedRoutes.some((r) => path.startsWith(r));
  const isAuthRoute = authRoutes.some((r) => path.startsWith(r));

  const token = req.cookies.get("session")?.value;
  const session = await decrypt(token);

  // Not logged in → redirect to login
  if (isProtected && !session?.userId) {
    const url = new URL("/login", req.nextUrl);
    url.searchParams.set("from", path);
    return NextResponse.redirect(url);
  }

  // Logged in but email not verified → only allow /verify-email
  if (
    session?.userId &&
    !session.emailVerified &&
    isProtected &&
    !path.startsWith("/verify-email")
  ) {
    return NextResponse.redirect(new URL("/verify-email", req.nextUrl));
  }

  // Already logged in + verified → skip login/signup
  if (isAuthRoute && session?.userId && session.emailVerified) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};
