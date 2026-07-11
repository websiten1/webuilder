import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "@/lib/session";

// Routes that require a valid, email-verified session
const protectedRoutes = ["/dashboard", "/generate", "/success", "/edit", "/domains"];
// Routes that logged-in users should skip
const authRoutes = ["/login", "/signup"];

const UNSAFE_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

export default async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isProtected = protectedRoutes.some((r) => path.startsWith(r));
  const isAuthRoute = authRoutes.some((r) => path.startsWith(r));

  // CSRF: reject cross-origin state-changing API requests. Stripe webhooks
  // are exempt — they're verified by signature (constructEvent), not by
  // Origin, and don't carry a browser Origin header at all. Only enforced
  // when Origin is present and mismatched, so non-browser API clients that
  // never send it aren't broken.
  if (
    path.startsWith("/api") &&
    !path.startsWith("/api/webhooks") &&
    UNSAFE_METHODS.has(req.method)
  ) {
    const origin = req.headers.get("origin");
    if (origin && origin !== req.nextUrl.origin) {
      return NextResponse.json({ error: "Cross-origin request blocked." }, { status: 403 });
    }
  }

  // Root homepage: served in Romanian by default, but a non-Romanian visitor
  // (by Accept-Language, or an explicit ?lang= override) gets the English
  // copy — rewritten (not redirected), so the URL stays "/" and both
  // language variants remain statically generated pages.
  if (path === "/") {
    const langParam = req.nextUrl.searchParams.get("lang");
    const acceptLanguage = req.headers.get("accept-language");
    const wantsEnglish = langParam
      ? langParam !== "ro"
      : !(acceptLanguage?.split(",")[0]?.trim().toLowerCase().startsWith("ro") ?? false);
    if (wantsEnglish) {
      return NextResponse.rewrite(new URL("/en", req.nextUrl));
    }
  }

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
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};
