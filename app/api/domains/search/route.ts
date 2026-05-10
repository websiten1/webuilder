import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import dns from "dns/promises";

// Approximate annual prices in EUR
const TLD_PRICES: Record<string, number> = {
  com: 12, net: 13, org: 13, io: 35, co: 26,
  app: 14, dev: 12, eu: 8, de: 8, fr: 9,
  uk: 10, nl: 10, es: 9, it: 10,
};

const POPULAR_TLDS = ["com", "io", "co", "net", "org", "app", "dev", "eu", "de"];

async function isDomainAvailable(domain: string): Promise<boolean> {
  try {
    // If NS records exist → domain is registered
    const records = await dns.resolveNs(domain);
    return records.length === 0;
  } catch (err: unknown) {
    const code = (err as NodeJS.ErrnoException).code;
    // ENOTFOUND / ENODATA = no DNS = likely available
    if (code === "ENOTFOUND" || code === "ENODATA" || code === "ESERVFAIL") {
      return true;
    }
    return false; // unknown error → assume taken
  }
}

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const q = new URL(request.url).searchParams.get("q")?.toLowerCase().trim();
  if (!q || q.length < 2) return NextResponse.json({ results: [] });

  // Strip any existing TLD the user might have typed
  const name = q.replace(/\.[a-z]{2,}$/, "").replace(/[^a-z0-9-]/g, "-");
  if (!name) return NextResponse.json({ results: [] });

  // Check all TLDs in parallel (with timeout)
  const checks = POPULAR_TLDS.map(async (tld) => {
    const domain = `${name}.${tld}`;
    const available = await Promise.race([
      isDomainAvailable(domain),
      new Promise<boolean>((res) => setTimeout(() => res(false), 2500)),
    ]);
    return { name: domain, tld, available, price: TLD_PRICES[tld] ?? 14 };
  });

  const results = await Promise.all(checks);

  // Sort: available first, then by price
  results.sort((a, b) => {
    if (a.available !== b.available) return a.available ? -1 : 1;
    return a.price - b.price;
  });

  return NextResponse.json({ results, name });
}
