import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
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
}
