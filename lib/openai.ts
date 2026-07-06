import fs from "fs";
import path from "path";
import { buildSupportSystemPrompt } from "@/lib/support-knowledge";

export type SupportChatMessage = {
  role: "user" | "assistant";
  content: string;
};

function getApiKey(): string {
  const fromEnv = process.env.OPENAI_API_KEY;
  if (fromEnv) return fromEnv;

  const envPath = path.join(process.cwd(), ".env.local");
  try {
    const content = fs.readFileSync(envPath, "utf8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (trimmed.startsWith("OPENAI_API_KEY=")) {
        const key = trimmed.slice("OPENAI_API_KEY=".length).trim();
        if (key) return key;
      }
    }
  } catch {
    // ignore
  }

  throw new Error("OPENAI_API_KEY is not set. Add it to .env.local.");
}

export async function chatSupport(
  messages: SupportChatMessage[],
  locale = "en",
): Promise<string> {
  const apiKey = getApiKey();
  const model = process.env.OPENAI_SUPPORT_MODEL ?? "gpt-4o-mini";

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.35,
      max_tokens: 900,
      messages: [
        { role: "system", content: buildSupportSystemPrompt(locale) },
        ...messages,
      ],
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`OpenAI API error (${res.status}): ${body.slice(0, 300)}`);
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string | null } }[];
  };

  const text = data.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error("OpenAI returned an empty response.");
  return text;
}
