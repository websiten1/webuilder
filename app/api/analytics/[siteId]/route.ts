import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getSiteById } from "@/lib/db";
import {
  getValidVercelToken,
  getVercelAnalyticsEnableUrl,
  getWebAnalyticsCount,
  getWebAnalyticsAggregate,
} from "@/lib/vercel";
import { genericErrorResponse, logServerError, newErrorId } from "@/lib/api-error";

const RANGE_DAYS: Record<string, number> = { "24h": 1, "7d": 7, "30d": 30, "90d": 90 };

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    }

    const { siteId } = await params;
    const site = await getSiteById(siteId, session.userId);
    if (!site) {
      return NextResponse.json({ error: "Site not found." }, { status: 404 });
    }

    if (!site.vercel_project_id) {
      return NextResponse.json({ enabled: false, reason: "not_deployed" });
    }

    const auth = await getValidVercelToken(session.userId);
    if (!auth) {
      return NextResponse.json({ enabled: false, reason: "not_connected" });
    }

    const { searchParams } = new URL(request.url);
    const range = searchParams.get("range") ?? "7d";
    const days = RANGE_DAYS[range] ?? 7;

    const until = new Date();
    const since = new Date(until.getTime() - days * 86400000);
    const prevUntil = since;
    const prevSince = new Date(since.getTime() - days * 86400000);

    const projectId = site.vercel_project_id;
    const range1 = { since: isoDate(since), until: isoDate(until) };

    // Vercel doesn't expose a reliable "is Web Analytics enabled" flag we can
    // pre-check — attempt the query directly and treat any failure (project
    // never had @vercel/analytics deployed, or collection genuinely isn't on)
    // as the "not enabled yet" guidance state.
    try {
      const [current, previous, series, pages, referrers, countries, browsers, devices] =
        await Promise.all([
          getWebAnalyticsCount(auth.token, auth.teamId, projectId, range1.since, range1.until),
          getWebAnalyticsCount(auth.token, auth.teamId, projectId, isoDate(prevSince), isoDate(prevUntil)),
          getWebAnalyticsAggregate(auth.token, auth.teamId, projectId, { ...range1, by: "day" }),
          getWebAnalyticsAggregate(auth.token, auth.teamId, projectId, { ...range1, by: "requestPath", limit: 7 }),
          getWebAnalyticsAggregate(auth.token, auth.teamId, projectId, { ...range1, by: "referrerHostname", limit: 6 }),
          getWebAnalyticsAggregate(auth.token, auth.teamId, projectId, { ...range1, by: "country", limit: 6 }),
          getWebAnalyticsAggregate(auth.token, auth.teamId, projectId, { ...range1, by: "browserName", limit: 6 }),
          getWebAnalyticsAggregate(auth.token, auth.teamId, projectId, { ...range1, by: "deviceType", limit: 3 }),
        ]);

      return NextResponse.json({
        enabled: true,
        range,
        visitors: current.visitors,
        views: current.pageviews,
        prevVisitors: previous.visitors,
        prevViews: previous.pageviews,
        series,
        pages,
        referrers,
        countries,
        browsers,
        devices,
      });
    } catch {
      const enableUrl = await getVercelAnalyticsEnableUrl(
        auth.token,
        auth.teamId,
        site.vercel_project_name ?? ""
      );
      return NextResponse.json({ enabled: false, reason: "not_enabled", enableUrl });
    }
  } catch (error) {
    const errorId = newErrorId();
    logServerError(errorId, "analytics/[siteId]", error);
    return genericErrorResponse(errorId);
  }
}
