import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { checkApiRateLimit } from "@/lib/rate-limit";
import { genericErrorResponse, logServerError, newErrorId } from "@/lib/api-error";

const PEXELS_MAX_REQUESTS = 60;
const PEXELS_WINDOW_MS = 60 * 60 * 1000; // 60 requests per hour per user

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    }

    const allowed = await checkApiRateLimit(
      session.userId,
      "pexels",
      PEXELS_MAX_REQUESTS,
      PEXELS_WINDOW_MS
    );
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many image search requests. Please try again later." },
        { status: 429 }
      );
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query")?.trim();
    const page = searchParams.get("page") || "1";
    const per_page = searchParams.get("per_page") || "24";

    if (!query) {
      return NextResponse.json({ error: "query is required" }, { status: 400 });
    }

    const apiKey = process.env.PEXELS_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Pexels API key not configured" }, { status: 500 });
    }

    const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&page=${page}&per_page=${per_page}&orientation=landscape`;

    const res = await fetch(url, {
      headers: { Authorization: apiKey },
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Pexels API error" }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    const errorId = newErrorId();
    logServerError(errorId, "pexels", error);
    return genericErrorResponse(errorId);
  }
}
