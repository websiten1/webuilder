import Anthropic from "@anthropic-ai/sdk";
import fs from "fs";
import path from "path";

function getApiKey(): string {
  const fromEnv = process.env.ANTHROPIC_API_KEY;
  if (fromEnv) return fromEnv;

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
  let result = text.trim();
  result = result.replace(/^```(?:tsx?|jsx?|javascript|typescript|js|ts)?\s*\n?/i, "");
  result = result.replace(/\n?```\s*$/m, "");
  return result.trim();
}

function validateCode(code: string): { valid: boolean; reason?: string } {
  if (!code.includes("export default function")) {
    return { valid: false, reason: "Missing export default function" };
  }

  let depth = 0;
  for (const ch of code) {
    if (ch === "{") depth++;
    else if (ch === "}") depth--;
    if (depth < -1) return { valid: false, reason: "Unbalanced braces (too many closing)" };
  }
  if (depth !== 0) {
    return { valid: false, reason: `Unbalanced braces (depth=${depth} at end)` };
  }

  // Rough backtick balance (ignores escaped backticks but catches most cases)
  let backticks = 0;
  let inSingle = false;
  let inDouble = false;
  let prev = "";
  for (const ch of code) {
    if (ch === "'" && !inDouble && prev !== "\\") inSingle = !inSingle;
    else if (ch === '"' && !inSingle && prev !== "\\") inDouble = !inDouble;
    else if (ch === "`" && !inSingle && !inDouble && prev !== "\\") backticks++;
    prev = ch;
  }
  if (backticks % 2 !== 0) {
    return { valid: false, reason: `Odd backtick count (${backticks}) — unclosed template literal` };
  }

  return { valid: true };
}

export type ImageInput = {
  label: string;
  placeholder: string;
  base64: string;
  mediaType: string;
};

const SYSTEM = `You are an elite web developer and UI/UX designer specialising in Next.js. Your job is to generate a single, complete, production-ready Next.js page component.

STRICT RULES:
1. Output ONLY valid TypeScript/React code — no markdown, no explanations, no code fences.
2. The component must be a default export: export default function Page() { ... }
3. Use ONLY inline styles or a single <style> JSX tag. No external stylesheets, no Tailwind, no CSS modules.
4. ████ PERMANENT PHOTO RULE — NEVER OVERRIDE ████
   - The ONLY images you may use are the ones I attach to this message, identified by their placeholder path.
   - For each attached image I tell you exactly which src placeholder to use. Use that path EXACTLY.
   - NEVER use picsum.photos, placeholder images, stock photos, or any other image source.
   - If no image is provided for a section, use NO <img> there — use colours, gradients, icons or CSS shapes.
   - IMAGE SRC FORMAT: Write src as a plain string attribute — NEVER as a JSX expression.
     RIGHT:  <img src="/gallery-image-0" alt="..." />
     WRONG:  <img src={"/gallery-image-0"} alt="..." />
     RIGHT (CSS bg): backgroundImage: "url('/gallery-image-0')"
     The placeholder paths will be automatically replaced with the real base64 image data after generation.
5. The result must render correctly in production. Use only standard React, no server-side features.
6. Make the design pixel-perfect and visually impressive — matching the style brief exactly.
7. Include realistic, specific placeholder copy (not "Lorem ipsum") tailored to the business type.
8. Add smooth CSS transitions on hover, scroll animations via CSS @keyframes where appropriate.
9. Make it fully responsive with appropriate media queries inside the <style> tag.
10. Include a sticky nav, a compelling hero section, all requested pages/sections, and a footer.
11. CRITICAL: The return() statement and closing brace of the default export MUST be the very last lines of the file. Never truncate the JSX. Always close every tag, every JSX expression, and the function itself.
12. CRITICAL: Never use bare <> fragments as the root — wrap JSX in a single <div> root element.
13. CRITICAL — TEMPLATE LITERALS: Every backtick you open MUST be closed. Never leave a template literal unclosed. Double-check every backtick pair before finishing — unclosed template literals are the most common cause of build failures.
14. CRITICAL — QUOTES IN JSX STYLE PROPS: Inside style={{ }} objects use double-quoted strings. Never use single-quoted strings for values that contain apostrophes.`;

async function generateOnce(
  client: Anthropic,
  prompt: string,
  images: ImageInput[],
): Promise<{ code: string; stopReason: string }> {
  let fullText = "";
  let stopReason = "";

  // Build multimodal message: text prompt + labeled images
  type ContentBlock = Anthropic.TextBlockParam | Anthropic.ImageBlockParam;
  const content: ContentBlock[] = [];

  // Main text prompt
  let textPrompt = prompt;
  if (images.length > 0) {
    textPrompt += `\n\n════════════════════════════════════════════════
REAL USER IMAGES — ${images.length} image(s) attached below
════════════════════════════════════════════════
I am sending you the ACTUAL photos the user uploaded. For each image I label exactly which src placeholder to use in your code. Use those placeholder paths — they will be swapped with the real base64 data after generation.`;
  }
  content.push({ type: "text", text: textPrompt });

  for (const img of images) {
    content.push({ type: "text", text: `\n▶ ${img.label}` });
    content.push({
      type: "image",
      source: {
        type: "base64",
        media_type: img.mediaType as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
        data: img.base64,
      },
    });
  }

  const stream = client.messages.stream({
    model: "claude-opus-4-7",
    max_tokens: 32000,
    system: SYSTEM,
    messages: [{ role: "user", content }],
  });

  for await (const chunk of stream) {
    if (chunk.type === "content_block_delta" && chunk.delta.type === "text_delta") {
      fullText += chunk.delta.text;
    }
    if (chunk.type === "message_delta") {
      stopReason = chunk.delta.stop_reason ?? "";
    }
  }

  return { code: stripCodeFences(fullText), stopReason };
}

export async function generateWebsiteCode(prompt: string, images: ImageInput[] = []): Promise<string> {
  const apiKey = getApiKey();
  const client = new Anthropic({ apiKey });

  const MAX_ATTEMPTS = 3;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    console.log(`🤖 Generation attempt ${attempt}/${MAX_ATTEMPTS} (${images.length} images attached)`);
    const { code, stopReason } = await generateOnce(client, prompt, images);

    if (!code) throw new Error("No text content in Claude response");

    if (stopReason === "max_tokens") {
      throw new Error("Generated code was too long and got cut off. Please try again or simplify your requirements.");
    }

    const check = validateCode(code);
    if (check.valid) {
      console.log(`✅ Code validated on attempt ${attempt}`);
      return code;
    }

    console.warn(`⚠️  Attempt ${attempt} failed validation: ${check.reason}`);
    if (attempt === MAX_ATTEMPTS) {
      throw new Error(`Generated code has syntax errors after ${MAX_ATTEMPTS} attempts: ${check.reason}. Please try again.`);
    }
  }

  throw new Error("Code generation failed");
}
