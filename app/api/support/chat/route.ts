import { NextRequest, NextResponse } from "next/server";
import { genericErrorResponse, logServerError, newErrorId } from "@/lib/api-error";
import { chatSupport, type SupportChatMessage } from "@/lib/openai";

const MAX_MESSAGE_LENGTH = 2000;
const MAX_HISTORY = 20;
const MAX_REQUESTS_PER_HOUR = 40;
const RATE_WINDOW_MS = 60 * 60 * 1000;

const buckets = new Map<string, { count: number; reset: number }>();

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const bucket = buckets.get(ip);

  if (!bucket || now > bucket.reset) {
    buckets.set(ip, { count: 1, reset: now + RATE_WINDOW_MS });
    return false;
  }

  if (bucket.count >= MAX_REQUESTS_PER_HOUR) return true;
  bucket.count++;
  return false;
}

function sanitizeMessages(raw: unknown): SupportChatMessage[] | null {
  if (!Array.isArray(raw)) return null;

  const messages: SupportChatMessage[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") return null;
    const role = (item as { role?: unknown }).role;
    const content = (item as { content?: unknown }).content;
    if ((role !== "user" && role !== "assistant") || typeof content !== "string") return null;
    const trimmed = content.trim();
    if (!trimmed || trimmed.length > MAX_MESSAGE_LENGTH) return null;
    messages.push({ role, content: trimmed });
  }

  if (messages.length === 0) return null;
  if (messages[messages.length - 1]?.role !== "user") return null;

  return messages.slice(-MAX_HISTORY);
}

export async function POST(request: NextRequest) {
  const errorId = newErrorId();

  try {
    const ip = getClientIp(request);
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Prea multe mesaje. Așteaptă puțin sau scrie la support@insixlive.com." },
        { status: 429 },
      );
    }

    const body = await request.json();
    const messages = sanitizeMessages(body?.messages);
    if (!messages) {
      return NextResponse.json({ error: "Istoric de mesaje invalid." }, { status: 400 });
    }

    const locale = typeof body?.locale === "string" ? body.locale : "ro";
    const reply = await chatSupport(messages, locale);

    return NextResponse.json({ reply });
  } catch (error) {
    logServerError(errorId, "support/chat", error);
    const message = error instanceof Error ? error.message : String(error);

    if (message.includes("OPENAI_API_KEY")) {
      return NextResponse.json(
        { error: "Suportul nu e configurat. Adaugă OPENAI_API_KEY în .env.local și repornește serverul." },
        { status: 503 },
      );
    }

    if (process.env.NODE_ENV === "development") {
      return NextResponse.json({ error: message.slice(0, 400), errorId }, { status: 500 });
    }

    return genericErrorResponse(errorId);
  }
}
