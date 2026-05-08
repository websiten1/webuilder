import Anthropic from "@anthropic-ai/sdk";
import fs from "fs";
import path from "path";

function getApiKey(): string {
  const fromEnv = process.env.ANTHROPIC_API_KEY;
  if (fromEnv) return fromEnv;

  // Fallback: read directly from .env.local
  const envPath = path.join(process.cwd(), ".env.local");
  try {
    const content = fs.readFileSync(envPath, "utf8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (trimmed.startsWith("ANTHROPIC_API_KEY=")) {
        const key = trimmed.slice("ANTHROPIC_API_KEY=".length).trim();
        if (key) return key;
      }
    }
  } catch {
    // ignore
  }

  throw new Error("ANTHROPIC_API_KEY is not set. Check your .env.local file.");
}

function stripCodeFences(text: string): string {
  // Remove leading code fence with optional language tag
  let result = text.trim();
  result = result.replace(/^```(?:tsx?|jsx?|javascript|typescript|js|ts)?\s*\n?/i, "");
  // Remove trailing code fence
  result = result.replace(/\n?```\s*$/m, "");
  return result.trim();
}

export async function generateWebsiteCode(prompt: string): Promise<string> {
  const apiKey = getApiKey();
  const client = new Anthropic({ apiKey });

  const response = await client.messages.create({
    model: "claude-opus-4-7",
    max_tokens: 16000,
    system: `You are an elite web developer and UI/UX designer specialising in Next.js. Your job is to generate a single, complete, production-ready Next.js page component.

STRICT RULES:
1. Output ONLY valid TypeScript/React code — no markdown, no explanations, no code fences.
2. The component must be a default export: export default function Page() { ... }
3. Use ONLY inline styles or a single <style> JSX tag. No external stylesheets, no Tailwind, no CSS modules.
4. All media (images, videos) must be placeholder URLs from https://picsum.photos/ (e.g. https://picsum.photos/seed/hero/1200/600).
5. The result must render correctly in production. Use only standard React and no server-side features.
6. Make the design pixel-perfect and visually impressive — matching the style brief exactly.
7. Include realistic, specific placeholder copy (not "Lorem ipsum") tailored to the business type.
8. Add smooth CSS transitions on hover, scroll animations via CSS @keyframes where appropriate.
9. Make it fully responsive with appropriate media queries inside the <style> tag.
10. Include a sticky nav, a compelling hero section, all requested pages/sections, and a footer.`,
    messages: [{ role: "user", content: prompt }],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text content in Claude response");
  }

  return stripCodeFences(textBlock.text);
}
