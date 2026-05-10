import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getSiteById, saveDomainToSite } from "@/lib/db";

const TEAM_ID = "team_f7GtKyI6RueAw15YIqyJz8qA";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

    const { siteId, domain } = await request.json();
    if (!siteId || !domain) {
      return NextResponse.json({ error: "siteId and domain required." }, { status: 400 });
    }

    const cleanDomain = domain.toLowerCase().trim().replace(/^https?:\/\//, "").replace(/\/$/, "");
    if (!/^[a-z0-9][a-z0-9.-]+\.[a-z]{2,}$/.test(cleanDomain)) {
      return NextResponse.json({ error: "Invalid domain name." }, { status: 400 });
    }

    const site = await getSiteById(siteId, session.userId);
    if (!site) return NextResponse.json({ error: "Site not found." }, { status: 404 });

    if (!site.vercel_project_id) {
      return NextResponse.json({ error: "Site has no Vercel project." }, { status: 400 });
    }

    // Use user's own Vercel token if connected, otherwise app token
    const token = (site as unknown as { user_vercel_token?: string }).user_vercel_token
      ?? process.env.VERCEL_API_TOKEN;

    const apiUrl = `https://api.vercel.com/v10/projects/${site.vercel_project_id}/domains?teamId=${TEAM_ID}`;

    const res = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: cleanDomain }),
    });

    const data = await res.json();

    if (!res.ok) {
      const msg = data?.error?.message ?? "Failed to add domain to Vercel.";
      console.error("Vercel add domain error:", res.status, data);
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    // Save to DB
    await saveDomainToSite(siteId, cleanDomain);

    // Build DNS instructions from Vercel response
    const dnsRecords = buildDnsInstructions(cleanDomain, data);

    return NextResponse.json({
      success: true,
      domain: cleanDomain,
      verified: data.verified ?? false,
      dnsRecords,
    });
  } catch (err) {
    console.error("Add domain error:", err);
    return NextResponse.json({ error: "Failed to add domain." }, { status: 500 });
  }
}

function buildDnsInstructions(domain: string, vercelData: Record<string, unknown>) {
  // Vercel returns verification records if the domain isn't verified yet
  const records = [];

  if (domain.startsWith("www.") || !domain.includes(".")) {
    records.push({ type: "CNAME", name: domain, value: "cname.vercel-dns.com" });
  } else {
    // Apex domain — use A records
    records.push({ type: "A", name: "@", value: "76.76.21.21" });
    records.push({ type: "CNAME", name: "www", value: "cname.vercel-dns.com" });
  }

  // Include any verification challenge records from Vercel
  const challenges = (vercelData as Record<string, unknown[]>).verification ?? [];
  for (const c of challenges as Array<{ type: string; domain: string; value: string }>) {
    records.push({ type: c.type, name: c.domain, value: c.value, purpose: "verification" });
  }

  return records;
}
