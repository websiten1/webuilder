import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const { domainName, siteId } = await request.json();
  if (!domainName || !siteId) {
    return NextResponse.json({ error: "domainName and siteId required." }, { status: 400 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_URL || "https://insixlive.com";
  // After purchase the user comes back here to connect the domain
  const returnUrl = `${baseUrl}/domains/${siteId}/success?domain=${encodeURIComponent(domainName)}&purchased=true`;

  // Vercel domains purchase page with the domain pre-filled
  // Note: Vercel doesn't support an OAuth redirect after purchase without a Marketplace
  // Integration, so we pre-fill the search and show a "Come back here" instruction.
  const vercelUrl = new URL("https://vercel.com/domains");
  vercelUrl.searchParams.set("search", domainName);

  return NextResponse.json({
    checkoutUrl: vercelUrl.toString(),
    returnUrl,
    message: "After purchasing, return to insixlive to connect the domain.",
  });
}
