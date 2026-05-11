import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getSiteById, saveDomainToSite } from "@/lib/db";

const TEAM_ID = "team_f7GtKyI6RueAw15YIqyJz8qA";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

    const { siteId, domainName } = await request.json();
    if (!siteId || !domainName) {
      return NextResponse.json({ error: "siteId and domainName required." }, { status: 400 });
    }

    const cleanDomain = domainName.toLowerCase().trim()
      .replace(/^https?:\/\//, "").replace(/\/$/, "");

    const site = await getSiteById(siteId, session.userId);
    if (!site) return NextResponse.json({ error: "Site not found." }, { status: 404 });
    if (!site.vercel_project_id) {
      return NextResponse.json({ error: "Site has no Vercel project." }, { status: 400 });
    }

    // Use user's Vercel token if connected, otherwise app token
    const { getUserById } = await import("@/lib/db");
    const user = await getUserById(session.userId);
    const token = user?.vercel_access_token ?? process.env.VERCEL_API_TOKEN;
    const teamParam = user?.vercel_team_id
      ? `?teamId=${user.vercel_team_id}`
      : `?teamId=${TEAM_ID}`;

    const apiUrl = `https://api.vercel.com/v10/projects/${site.vercel_project_id}/domains${teamParam}`;

    const res = await fetch(apiUrl, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ name: cleanDomain }),
    });

    const data = await res.json();

    if (!res.ok) {
      const msg = data?.error?.message ?? "Failed to add domain to project.";
      console.error("Vercel add domain error:", res.status, data);
      // Domain might already be connected — treat as success
      if (res.status === 400 && msg.includes("already")) {
        await saveDomainToSite(siteId, cleanDomain, null);
        return NextResponse.json({ success: true, domain: cleanDomain, alreadyConnected: true });
      }
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    // Save to DB with Vercel domain ID
    await saveDomainToSite(siteId, cleanDomain, data.name ?? null);

    const dnsRecords = [
      { type: "A",     name: "@",   value: "76.76.21.21" },
      { type: "CNAME", name: "www", value: "cname.vercel-dns.com" },
    ];

    return NextResponse.json({
      success: true,
      domain: cleanDomain,
      verified: data.verified ?? false,
      dnsRecords,
      liveUrl: `https://${cleanDomain}`,
    });
  } catch (err) {
    console.error("Auto-connect domain error:", err);
    return NextResponse.json({ error: "Failed to connect domain." }, { status: 500 });
  }
}
