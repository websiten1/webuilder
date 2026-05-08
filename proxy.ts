import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "@/lib/session";

// Routes that require a valid session
const protectedRoutes = ["/dashboard", "/generate", "/success", "/checkout"];
// Routes that paid-and-verified users should be redirected away from
const authRoutes = ["/login", "/signup"];

export default async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;

  const isProtected = protectedRoutes.some((r) => path.startsWith(r));
  const isAuthRoute = authRoutes.some((r) => path.startsWith(r));

  // Read session from cookie (no DB call — proxy uses JWT only)
  const token = req.cookies.get("session")?.value;
  const session = await decrypt(token);

  // Not logged in → redirect to login
  if (isProtected && !session?.userId) {
    const url = new URL("/login", req.nextUrl);
    url.searchParams.set("from", path);
    return NextResponse.redirect(url);
  }

  // Logged in but email not verified → allow only /verify-email and /login
  if (
    session?.userId &&
    !session.emailVerified &&
    isProtected &&
    !path.startsWith("/checkout") &&
    !path.startsWith("/verify-email")
  ) {
    return NextResponse.redirect(new URL("/verify-email", req.nextUrl));
  }

  // Logged in + verified but no payment → redirect to checkout (except /checkout itself)
  if (
    session?.userId &&
    session.emailVerified &&
    session.paymentStatus !== "paid" &&
    isProtected &&
    !path.startsWith("/checkout")
  ) {
    return NextResponse.redirect(new URL("/checkout", req.nextUrl));
  }

  // Already logged in + paid → skip login/signup
  if (isAuthRoute && session?.userId && session.paymentStatus === "paid") {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};
