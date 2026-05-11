import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import dns from "dns/promises";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const domain = new URL(request.url).searchParams.get("domain")?.toLowerCase().trim();
  if (!domain) return NextResponse.json({ error: "domain parameter required." }, { status: 400 });

  try {
    // Check if the domain resolves to Vercel's IP (76.76.21.21)
    let configured = false;
    let ipFound: string | null = null;
    let cnameFound: string | null = null;

    try {
      const addresses = await dns.resolve4(domain);
      ipFound = addresses[0] ?? null;
      configured = addresses.includes("76.76.21.21");
    } catch { /* no A record */ }

    if (!configured) {
      try {
        const cnames = await dns.resolveCname(domain);
        cnameFound = cnames[0] ?? null;
        configured = (cnameFound ?? "").includes("vercel");
      } catch { /* no CNAME */ }
    }

    const message = configured
      ? "DNS configured correctly — your site is live at this domain."
      : ipFound || cnameFound
      ? `DNS record found (${ipFound ?? cnameFound}) but not pointing to Vercel. Please check your records.`
      : "No DNS record found yet. Changes can take up to 48 hours to propagate.";

    return NextResponse.json({ domain, configured, ip: ipFound, cname: cnameFound, message });
  } catch (err) {
    console.error("DNS check error:", err);
    return NextResponse.json({ domain, configured: false, message: "Could not check DNS. Please try again shortly." });
  }
}
