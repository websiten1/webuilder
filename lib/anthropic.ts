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

  // Brace balance check
  let depth = 0;
  for (const ch of code) {
    if (ch === "{") depth++;
    else if (ch === "}") depth--;
    if (depth < -1) return { valid: false, reason: "Unbalanced braces (too many closing)" };
  }
  if (depth !== 0) {
    return { valid: false, reason: `Unbalanced braces (depth=${depth} at end)` };
  }

  // Backtick balance (rough check — counts unescaped backticks outside strings)
  let backticks = 0;
  let inSingleQuote = false;
  let inDoubleQuote = false;
  let prev = "";
  for (const ch of code) {
    if (ch === "'" && !inDoubleQuote && prev !== "\\") inSingleQuote = !inSingleQuote;
    else if (ch === '"' && !inSingleQuote && prev !== "\\") inDoubleQuote = !inDoubleQuote;
    else if (ch === "`" && !inSingleQuote && !inDoubleQuote && prev !== "\\") backticks++;
    prev = ch;
  }
  if (backticks % 2 !== 0) {
    return { valid: false, reason: `Odd backtick count (${backticks}) — unclosed template literal` };
  }

  return { valid: true };
}

const SYSTEM = `You are an elite web developer and UI/UX designer specialising in Next.js. Your job is to generate a single, complete, production-ready Next.js page component.

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
13. CRITICAL — TEMPLATE LITERALS: Every backtick (\`) you open MUST be closed with another backtick. Never leave a template literal unclosed. The most common mistake is forgetting to close a \`...\` string inside a style object or variable before the return() — double-check every backtick pair before finishing.
14. CRITICAL — QUOTES IN JSX STYLE PROPS: Inside JSX style={{ }} objects, use only double-quoted strings or backtick template literals. Never use single-quoted strings for property values that contain apostrophes — use double quotes instead (e.g. fontFamily: "Inter, sans-serif" not fontFamily: 'Inter, sans-serif').`;

async function generateOnce(client: Anthropic, prompt: string): Promise<{ code: string; stopReason: string }> {
  let fullText = "";
  let stopReason = "";

  const stream = client.messages.stream({
    model: "claude-opus-4-7",
    max_tokens: 32000,
    system: SYSTEM,
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

  return { code: stripCodeFences(fullText), stopReason };
}

export async function generateWebsiteCode(prompt: string): Promise<string> {
  const apiKey = getApiKey();
  const client = new Anthropic({ apiKey });

  const MAX_ATTEMPTS = 3;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    console.log(`🤖 Generation attempt ${attempt}/${MAX_ATTEMPTS}`);
    const { code, stopReason } = await generateOnce(client, prompt);

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
