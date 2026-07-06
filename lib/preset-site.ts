// lib/preset-site.ts — exact-design instantiation for premium preset templates.
//
// When a user picks a premium design, we do NOT ask the LLM to generate a page.
// Instead we deploy the prebuilt design bundle byte-for-byte and inject the
// user's content through the design's built-in runtime customization layer
// (the "draftly-customization-data" JSON embedded in each bundle's index.html:
// text replacements, document title, logo, social links). The design itself
// stays pixel-identical.

import fs from "fs";
import path from "path";
import Anthropic from "@anthropic-ai/sdk";
import { getAnthropicApiKey } from "@/lib/anthropic";
import presetTexts from "@/lib/preset-texts.json";
import type { WizardData } from "@/app/components/GenerateWizard";

const PRESET_TEXTS = presetTexts as Record<string, string[]>;

export function isPresetTemplate(templateId?: string | null): templateId is string {
  return !!templateId && Object.prototype.hasOwnProperty.call(PRESET_TEXTS, templateId);
}

export type PresetPersonalization = {
  replacements: { from: string; to: string }[];
  title: string;
  description: string;
};

export type StaticDeployFile = { file: string; data: string; encoding?: "base64" };

// ─── Personalized copy via Claude ──────────────────────────────────────────────

function businessBrief(f: WizardData): string {
  const serviceItems = (f.services?.serviceItems ?? []).filter(s => s.name?.trim());
  const simpleList = (f.services?.list ?? []).filter(Boolean);
  const team = (f.galleryMembers ?? []).filter(m => m.name?.trim());
  return [
    `Business name: ${f.business.name}`,
    `Business type: ${f.business.type}`,
    `Description: ${f.business.description}`,
    f.business.locationCity || f.business.locationCountry
      ? `Location: ${[f.business.locationCity, f.business.locationCountry].filter(Boolean).join(", ")}`
      : "",
    f.business.email ? `Email: ${f.business.email}` : "",
    f.business.hasPhone && f.business.phone ? `Phone: ${f.business.phone}` : "",
    f.business.aboutText ? `About: ${f.business.aboutText}` : "",
    f.goals?.whyChoose ? `Differentiator: ${f.goals.whyChoose}` : "",
    serviceItems.length > 0
      ? `Services: ${serviceItems.map(s => `${s.name}${s.price ? ` (${s.price})` : ""}`).join("; ")}`
      : simpleList.length > 0
      ? `Services: ${simpleList.join("; ")}`
      : "",
    team.length > 0 ? `Team: ${team.map(m => `${m.name}${m.role ? ` (${m.role})` : ""}`).join("; ")}` : "",
    `Website language: ${f.websiteLanguage || "English"}`,
  ]
    .filter(Boolean)
    .join("\n");
}

const PERSONALIZATION_SYSTEM = `You personalize a fixed, pre-designed website for a specific business by producing TEXT REPLACEMENTS only. The design, layout, colors, and imagery never change — only visible copy is swapped at runtime by an engine that does exact substring replacement on DOM text nodes.

OUTPUT: a single JSON object, no markdown, no code fences:
{
  "title": "<browser tab title, '<Business name> — <short tagline>'>",
  "description": "<meta description, max 160 chars>",
  "replacements": [{ "from": "<exact original string>", "to": "<personalized string>" }, ...]
}

RULES:
1. "from" MUST be copied verbatim from the provided design strings (or an exact substring of one). The engine does exact matching — any invented or paraphrased "from" silently does nothing.
2. Only replace human-visible copy: brand names, headlines, taglines, paragraphs, button labels, nav labels, stats, service names, footer text. NEVER touch strings that look like CSS classes, code, file paths, colors, or URLs.
3. Replace the design's demo brand name with the business name EVERYWHERE it appears (add one replacement per distinct spelling/casing found in the strings).
4. Keep each "to" roughly the same length as its "from" (within ±40%) so the layout is preserved. Headlines must stay punchy — never stuff long sentences into short display text.
5. Write ALL "to" text in the requested website language.
6. Adapt the design's narrative to the business: rewrite headlines/taglines/paragraphs so they genuinely describe this business, not the demo company. Replace demo contact details (emails, phones, addresses) with the real ones when provided.
7. Do not replace single generic words (e.g. "and", "the") that would corrupt unrelated sentences. Every "from" should be distinctive enough to only match where intended.
8. 20–60 replacements is the right range. Prioritize: brand name, hero headline, hero paragraph, section headings, services, footer.`;

export async function generatePresetPersonalization(
  slug: string,
  formData: WizardData,
  editRequests?: string[]
): Promise<PresetPersonalization> {
  const designStrings = PRESET_TEXTS[slug] ?? [];
  const client = new Anthropic({ apiKey: getAnthropicApiKey() });

  const prompt = `DESIGN STRINGS (verbatim copy candidates extracted from the "${slug}" design):
${JSON.stringify(designStrings, null, 0)}

BUSINESS TO PERSONALIZE FOR:
${businessBrief(formData)}
${editRequests && editRequests.length > 0 ? `\nCUSTOMER EDIT REQUESTS (apply ALL of these on top of the base personalization, later ones win):\n${editRequests.map((e, i) => `${i + 1}. ${e}`).join("\n")}` : ""}

Return the JSON object now.`;

  const msg = await client.messages.create({
    model: "claude-opus-4-7",
    max_tokens: 8000,
    system: PERSONALIZATION_SYSTEM,
    messages: [{ role: "user", content: prompt }],
  });

  const text = msg.content
    .map(b => (b.type === "text" ? b.text : ""))
    .join("")
    .trim()
    .replace(/^```(?:json)?\s*\n?/i, "")
    .replace(/\n?```\s*$/m, "");

  let parsed: { title?: string; description?: string; replacements?: { from?: unknown; to?: unknown }[] };
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error(`Preset personalization returned invalid JSON for "${slug}"`);
  }

  const replacements = (parsed.replacements ?? [])
    .filter(
      (r): r is { from: string; to: string } =>
        typeof r.from === "string" && typeof r.to === "string" && r.from.length >= 3 && r.from !== r.to
    )
    .slice(0, 100);

  return {
    replacements,
    title: typeof parsed.title === "string" && parsed.title.trim() ? parsed.title.trim() : formData.business.name,
    description:
      typeof parsed.description === "string" && parsed.description.trim()
        ? parsed.description.trim().slice(0, 200)
        : formData.business.description.slice(0, 160),
  };
}

// ─── Static bundle assembly ────────────────────────────────────────────────────

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function walkFiles(dir: string, out: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walkFiles(p, out);
    else out.push(p);
  }
  return out;
}

export function buildPresetDeployFiles(
  slug: string,
  personalization: PresetPersonalization,
  opts?: {
    logo?: { path: string; base64: string };
    socials?: Record<string, string>;
  }
): StaticDeployFile[] {
  const baseDir = path.join(process.cwd(), "public", "preset-sites", slug);
  let html = fs.readFileSync(path.join(baseDir, "index.html"), "utf8");

  // Title + meta tags
  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(personalization.title)}</title>`);
  html = html.replace(
    /(<meta\s+name="description"\s+content=")[^"]*(")/,
    `$1${escapeHtml(personalization.description)}$2`
  );
  html = html.replace(
    /(<meta\s+property="og:title"\s+content=")[^"]*(")/,
    `$1${escapeHtml(personalization.title)}$2`
  );
  html = html.replace(
    /(<meta\s+property="og:description"\s+content=")[^"]*(")/,
    `$1${escapeHtml(personalization.description)}$2`
  );

  // Inject personalization into the embedded customization config. The bundled
  // apply script (already inline in every preset index.html) performs the
  // text-node replacements, logo swap, and social re-linking at runtime.
  const cfgMatch = html.match(
    /(<script type="application\/json" id="draftly-customization-data">)([\s\S]*?)(<\/script>)/
  );
  if (!cfgMatch) {
    throw new Error(`Preset "${slug}" index.html has no draftly-customization-data block`);
  }
  const cfg = JSON.parse(cfgMatch[2]);
  cfg.title = personalization.title;
  cfg.replacements = [...(cfg.replacements ?? []), ...personalization.replacements];

  const socials: Record<string, string> = {};
  for (const [platform, url] of Object.entries(opts?.socials ?? {})) {
    if (typeof url === "string" && url.trim()) socials[platform] = url.trim();
  }
  cfg.brand = {
    ...(cfg.brand ?? {}),
    ...(opts?.logo ? { logoUrl: `/${opts.logo.path}` } : {}),
    ...(Object.keys(socials).length > 0 ? { socials } : {}),
  };

  // \u003c-escape so serialized JSON can never terminate the <script> tag early
  const serialized = JSON.stringify(cfg).replace(/</g, "\\u003c");
  html = html.replace(cfgMatch[0], `${cfgMatch[1]}${serialized}${cfgMatch[3]}`);

  const files: StaticDeployFile[] = [{ file: "index.html", data: html }];

  // Asset bundle — deployed at the same absolute paths index.html references
  const assetsDir = path.join(baseDir, "assets");
  for (const abs of walkFiles(assetsDir)) {
    const rel = path.relative(baseDir, abs).split(path.sep).join("/");
    files.push({
      file: `preset-sites/${slug}/${rel}`,
      data: fs.readFileSync(abs).toString("base64"),
      encoding: "base64",
    });
  }

  // Shared preview helper referenced by every preset index.html (no-ops outside iframes)
  const sharedNavFix = path.join(process.cwd(), "public", "preset-sites", "_shared", "preset-nav-fix.js");
  if (fs.existsSync(sharedNavFix)) {
    files.push({ file: "preset-sites/_shared/preset-nav-fix.js", data: fs.readFileSync(sharedNavFix, "utf8") });
  }

  if (opts?.logo) {
    files.push({ file: opts.logo.path, data: opts.logo.base64, encoding: "base64" });
  }

  return files;
}
