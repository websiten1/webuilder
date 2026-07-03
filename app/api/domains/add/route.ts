import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getSiteById, saveDomainToSite } from "@/lib/db";
import { resolveVercelApiAuth, vercelTeamQuery } from "@/lib/vercel";
import { genericErrorResponse, logServerError, newErrorId } from "@/lib/api-error";

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

    const { token, teamId } = await resolveVercelApiAuth(session.userId);
    const apiUrl = `https://api.vercel.com/v10/projects/${site.vercel_project_id}/domains${vercelTeamQuery(teamId)}`;

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

    await saveDomainToSite(siteId, cleanDomain);

    const dnsRecords = buildDnsInstructions(cleanDomain, data);

    return NextResponse.json({
      success: true,
      domain: cleanDomain,
      verified: data.verified ?? false,
      dnsRecords,
    });
  } catch (err) {
    const errorId = newErrorId();
    logServerError(errorId, "domains/add", err);
    return genericErrorResponse(errorId);
  }
}

function buildDnsInstructions(domain: string, vercelData: Record<string, unknown>) {
  const records = [];

  if (domain.startsWith("www.") || !domain.includes(".")) {
    records.push({ type: "CNAME", name: domain, value: "cname.vercel-dns.com" });
  } else {
    records.push({ type: "A", name: "@", value: "76.76.21.21" });
    records.push({ type: "CNAME", name: "www", value: "cname.vercel-dns.com" });
  }

  const challenges = (vercelData as Record<string, unknown[]>).verification ?? [];
  for (const c of challenges as Array<{ type: string; domain: string; value: string }>) {
    records.push({ type: c.type, name: c.domain, value: c.value, purpose: "verification" });
  }

  return records;
}
