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

  const system = `You are an elite web developer and UI/UX designer specialising in Next.js. Your job is to generate a single, complete, production-ready Next.js page component.

STRICT RULES:
1. Output ONLY valid TypeScript/React code — no markdown, no explanations, no code fences.
2. The component must be a default export: export default function Page() { ... }
3. Use ONLY inline styles or a single <style> JSX tag. No external stylesheets, no Tailwind, no CSS modules.
4. ████ PERMANENT PHOTO RULE — NEVER OVERRIDE ████
   - The ONLY images allowed in the website are the ones explicitly listed in the prompt (logo, section images, gallery images, team photos).
   - NEVER use picsum.photos, placeholder images, stock photos, or any external image URLs.
   - If no photos are provided for a section, that section must use NO images — use colors, gradients, text, icons, or CSS shapes instead.
   - Do NOT add any <img> tag unless a specific src placeholder for it is listed in the prompt.
   - IMAGE SRC FORMAT: Always write src as a plain HTML string attribute, NEVER as a JSX expression.
     RIGHT:  <img src="/gallery-image-0" alt="..." />
     WRONG:  <img src={"/gallery-image-0"} alt="..." />
     RIGHT (CSS):  backgroundImage: "url('/gallery-image-0')"
     The placeholders will be swapped with real image data automatically — do not change their format.
5. The result must render correctly in production. Use only standard React and no server-side features.
6. Make the design pixel-perfect and visually impressive — matching the style brief exactly.
7. Include realistic, specific placeholder copy (not "Lorem ipsum") tailored to the business type.
8. Add smooth CSS transitions on hover, scroll animations via CSS @keyframes where appropriate.
9. Make it fully responsive with appropriate media queries inside the <style> tag.
10. Include a sticky nav, a compelling hero section, all requested pages/sections, and a footer.
11. CRITICAL: The return() statement and closing brace of the default export MUST be the very last lines of the file. Never truncate the JSX. Always close every tag, every JSX expression, and the function itself.
12. CRITICAL: Never use bare <> fragments as the root — wrap JSX in a single <div> root element.
13. CRITICAL: All template literals inside JSX must be completely closed. Never mix unescaped < or > characters inside template literals — use &lt; / &gt; instead.`;

  let fullText = "";
  let stopReason = "";

  const stream = client.messages.stream({
    model: "claude-opus-4-7",
    max_tokens: 32000,
    system,
    messages: [{ role: "user", content: prompt }],
  });

  for await (const chunk of stream) {
    if (chunk.type === "content_block_delta" && chunk.delta.type === "text_delta") {
      fullText += chunk.delta.text;
    }
    if (chunk.type === "message_delta") {
      stopReason = chunk.delta.stop_reason ?? "";
    }
  }

  if (!fullText) {
    throw new Error("No text content in Claude response");
  }

  if (stopReason === "max_tokens") {
    throw new Error("Generated code was too long and got cut off. Please try again or simplify your requirements.");
  }

  return stripCodeFences(fullText);
}
