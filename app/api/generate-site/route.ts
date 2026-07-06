import { NextRequest, NextResponse } from "next/server";
import { generateWebsiteCode } from "@/lib/anthropic";
import { deployToVercel, deployStaticSiteToVercel, getValidVercelToken, setProjectEnvVars, createAndConnectBlobStore, deleteVercelProject, normalizeDeploymentUrl, resolveVercelDeployName, VercelAuthError, VERCEL_RECONNECT_MESSAGE } from "@/lib/vercel";
import { isPresetTemplate, generatePresetPersonalization, buildPresetDeployFiles, type StaticDeployFile } from "@/lib/preset-site";
import { getSession } from "@/lib/session";
import { getUserById, saveSiteWithVercel, getSiteById, updateSiteAfterRegeneration, createParishCalendarModule, setParishCalendarBlobConnected, claimOrderForGeneration, getOrderByStripeSessionId, completeOrder, failOrder, type Order } from "@/lib/db";
import { sendParishCalendarSetupEmail, sendWebsiteCreatedEmail } from "@/lib/email";
import { encryptToken } from "@/lib/encryption";
import { genericErrorResponse, logServerError, newErrorId } from "@/lib/api-error";
import { PARISH_CALENDAR_FILES } from "@/lib/parish-calendar-templates";
import type { WizardData } from "@/app/components/GenerateWizard";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import bcrypt from "bcryptjs";

export const maxDuration = 300;

// ─── Template CSS extraction ───────────────────────────────────────────────────

const TEMPLATE_FILES: Record<string, string> = {
  "dentist":          "01-dentist.html",
  "gym-coach":        "02-gym-coach.html",
  "kindergarten":     "03-kindergarten.html",
  "coffee-shop":      "04-coffee-shop.html",
  "fine-dining":      "05-fine-dining.html",
  "bakery":           "06-bakery.html",
  "law-firm":         "07-law-firm.html",
  "real-estate":      "08-real-estate.html",
  "hair-salon":       "09-hair-salon.html",
  "auto-repair":      "10-auto-repair.html",
  "vet-clinic":       "11-vet-clinic.html",
  "yoga-studio":      "12-yoga-studio.html",
  "tattoo-studio":    "13-tattoo-studio.html",
  "florist":          "14-florist.html",
  "bookstore":        "15-bookstore.html",
  "saas-startup":     "16-saas-startup.html",
  "creative-agency":  "17-creative-agency.html",
  "personal-portfolio":"18-personal-portfolio.html",
  "consultant-coach": "19-consultant-coach.html",
  "editorial-blog":   "20-editorial-blog.html",
  "podcast":          "21-podcast.html",
  "conference-event": "22-conference-event.html",
  "marketing-landing":"23-marketing-landing.html",
  "online-course":    "24-online-course.html",
  "community":        "25-community.html",
  "ai-product":       "26-ai-product.html",
  "mobile-app":       "27-mobile-app.html",
  "web3-crypto":      "28-web3-crypto.html",
  "job-board":        "29-job-board.html",
  "marketplace":      "30-marketplace.html",
  "nonprofit":        "31-nonprofit.html",
  "coworking":        "32-coworking.html",
  "boutique-hotel":   "33-boutique-hotel.html",
  "travel-guide":     "34-travel-guide.html",
  "fashion-label":    "35-fashion-label.html",
  "skincare":         "36-skincare.html",
  "furniture":        "37-furniture.html",
  "plants":           "38-plants.html",
  "wine-shop":        "39-wine-shop.html",
  "cleaning-service": "40-cleaning-service.html",
  "moving-service":   "41-moving-service.html",
  "photography":      "42-photography.html",
};

function getTemplateDesignSpec(templateId: string): string {
  try {
    const file = TEMPLATE_FILES[templateId];
    if (!file) return "";
    const htmlPath = path.join(process.cwd(), "public", "templates", file);
    const html = fs.readFileSync(htmlPath, "utf-8");

    // Extract :root CSS custom properties
    const rootMatch = html.match(/:root\s*\{([^}]+)\}/);
    const cssVars = rootMatch
      ? rootMatch[1].trim().split("\n").map(l => "  " + l.trim()).filter(l => l.trim().startsWith("--")).join("\n")
      : "";

    // Extract Google Fonts URL
    const fontLinkMatch = html.match(/fonts\.googleapis\.com\/css2[^"']*/);
    const fontUrl = fontLinkMatch ? `https://${fontLinkMatch[0]}` : "";

    if (!cssVars) return "";
    return `
════════════════════════════════════════════════
EXACT TEMPLATE DESIGN TOKENS — YOU MUST USE THESE
════════════════════════════════════════════════
The user chose the "${TEMPLATE_NAMES[templateId] || templateId}" template.
Apply these EXACT CSS custom properties — do not approximate or substitute colours.

:root {
${cssVars}
}
${fontUrl ? `\nFont import: ${fontUrl}\nLoad this Google Font in a <link> tag in your <style> or component head.` : ""}

Match the template's overall aesthetic: background colour, text colour, primary accent, card
surfaces, borders, and typography scale. Your generated site must look like a refined
production version of this template for the user's specific business.
`;
  } catch (err) {
    console.warn("⚠️  Could not read template file for", templateId, err);
    return "";
  }
}

// ─── Image extraction: build vision inputs + static deployment files ──────────

export type ImageInput = {
  label: string;
  placeholder: string;
  base64: string;
  mediaType: string;
};

function parseDataUrl(dataUrl: string): { base64: string; mediaType: string } | null {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) return null;
  return { mediaType: match[1], base64: match[2] };
}

function ext(mediaType: string): string {
  const map: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif" };
  return map[mediaType] ?? "jpg";
}

export function extractImages(formData: WizardData): ImageInput[] {
  const images: ImageInput[] = [];

  if (formData.logo?.uploaded && formData.logo.dataUrl) {
    const p = parseDataUrl(formData.logo.dataUrl);
    if (p) images.push({ label: `LOGO — use src="/logo.${ext(p.mediaType)}" in the navbar`, placeholder: `/logo.${ext(p.mediaType)}`, ...p });
  }

  (formData.gallery ?? []).forEach((dataUrl, i) => {
    if (dataUrl) {
      const p = parseDataUrl(dataUrl);
      if (p) images.push({ label: `GALLERY PHOTO ${i + 1} — use src="/gallery-${i}.${ext(p.mediaType)}"`, placeholder: `/gallery-${i}.${ext(p.mediaType)}`, ...p });
    }
  });

  (formData.galleryMembers ?? []).filter(m => m.photo).forEach((m, i) => {
    const p = parseDataUrl(m.photo);
    if (p) images.push({ label: `TEAM PHOTO of ${m.name || `member ${i + 1}`} — use src="/team-${i}.${ext(p.mediaType)}"`, placeholder: `/team-${i}.${ext(p.mediaType)}`, ...p });
  });

  Object.entries(formData.pages?.pageDescriptions ?? {}).forEach(([pageId, desc]) => {
    if (desc?.image) {
      const p = parseDataUrl(desc.image);
      if (p) images.push({ label: `SECTION IMAGE for "${pageId}" — use src="/section-${pageId}.${ext(p.mediaType)}"`, placeholder: `/section-${pageId}.${ext(p.mediaType)}`, ...p });
    }
  });

  return images;
}

const TEMPLATE_NAMES: Record<string, string> = {
  "dentist": "Dental Practice", "gym-coach": "Gym / Fitness Coach",
  "kindergarten": "Kindergarten", "coffee-shop": "Coffee Shop",
  "fine-dining": "Fine Dining Restaurant", "bakery": "Bakery",
  "law-firm": "Law Firm", "real-estate": "Real Estate Agency",
  "hair-salon": "Hair Salon", "auto-repair": "Auto Repair Shop",
  "vet-clinic": "Vet Clinic", "yoga-studio": "Yoga Studio",
  "tattoo-studio": "Tattoo Studio", "florist": "Florist",
  "bookstore": "Bookstore", "saas-startup": "SaaS / Tech Startup",
  "creative-agency": "Creative Agency", "personal-portfolio": "Personal Portfolio",
  "consultant-coach": "Consultant & Coach", "editorial-blog": "Editorial Blog",
  "podcast": "Podcast", "conference-event": "Conference & Event",
  "marketing-landing": "Marketing Landing Page", "online-course": "Online Course",
  "community": "Community", "ai-product": "AI Product",
  "mobile-app": "Mobile App", "web3-crypto": "Web3 & Crypto",
  "job-board": "Job Board", "marketplace": "Marketplace",
  "nonprofit": "Nonprofit", "coworking": "Coworking Space",
  "boutique-hotel": "Boutique Hotel", "travel-guide": "Travel Guide",
  "fashion-label": "Fashion Label", "skincare": "Skincare Brand",
  "furniture": "Furniture Store", "plants": "Plant Shop",
  "wine-shop": "Wine Shop", "cleaning-service": "Cleaning Service",
  "moving-service": "Moving Service", "photography": "Photography Studio",
};

function buildPrompt(f: WizardData): string {
  const styleMap: Record<string, string> = {
    "minimalist":    "minimalist — white backgrounds, generous whitespace, minimal color, thin typography, no decorative elements",
    "modern-clean":  "modern & clean — fresh blue tones, rounded elements, lots of whitespace, contemporary sans-serif",
    "bold-dark":     "bold & dark — near-black backgrounds, large impactful typography, strong contrast, white text on dark",
    "corporate":     "corporate professional — navy/deep blue palette, structured grid, authoritative feel, trust-focused",
    "creative":      "creative & vibrant — bold purple-to-pink gradient, expressive layout, energetic colors, dynamic sections",
    "elegant":       "elegant & luxury — warm cream (#faf8f5), refined typography, gold/warm bronze accents, generous spacing",
    "warm":          "warm & friendly — soft orange-cream palette, rounded corners, approachable feel, welcoming tone",
    "futuristic":    "high-tech — deep dark background, cyan glows, sharp edges, neon accents, cutting-edge aesthetic",
    "playful":       "playful & fun — bright yellow tones, bold rounded shapes, casual and energetic, child-friendly",
  };

  const fontMap: Record<string, string> = {
    "modern-sans":    "Inter / Helvetica Neue style — clean geometric sans-serif",
    "classic-serif":  "Georgia / Playfair Display style — classic serif, elegant and trustworthy",
    "geo-bold":       "heavy bold display sans-serif, strong visual weight, impactful headlines",
    "mono":           "JetBrains Mono / Courier style — monospace, technical and precise",
    "playful":        "rounded friendly typeface, casual and warm, slightly larger letter-spacing",
    "humanist-sans":  "Manrope — warm humanist sans-serif, approachable and modern with subtle personality",
    "luxury-serif":   "Cormorant Garamond — ultra-thin high-contrast luxury serif, refined and elegant, ideal for fashion and premium brands",
    "editorial-serif":"Fraunces — optical size serif with literary character, contemporary editorial quality, great for restaurants and culture",
    "space-grotesk":  "Space Grotesk — geometric grotesque with distinctive quirky details, tech-forward and bold, ideal for Web3 and creative studios",
  };

  const imageryMap: Record<string, string> = {
    "photography":   "heavy use of professional photos throughout all sections",
    "illustrations": "custom icons and illustrations instead of photos",
    "minimal-img":   "mostly text and solid color sections, very few images",
    "stock-photos":  "professional stock photos in hero and key sections",
    "mixed":         "combination of illustrations and photos",
  };

  const heroMap: Record<string, string> = {
    "bg-image":  "full-bleed background photo behind the hero text",
    "gradient":  "color gradient background (no photo) in the hero",
    "overlay":   "hero photo with a dark or color overlay and text on top",
    "ai-decide": "choose the best hero treatment for the chosen style",
  };

  const ctaMap: Record<string, string> = {
    "contact-form": "a contact form with name, email, message",
    "phone":        "a prominent phone number with click-to-call",
    "email":        "an email link / mailto CTA",
    "booking":      "a booking / appointment scheduling widget or form",
    "shop":         "a shop / buy now button leading to products",
    "newsletter":   "an email newsletter signup form",
    "multiple":     "multiple CTAs distributed through the page (contact + phone + booking)",
  };

  const toneMap: Record<string, string> = {
    "formal":                   "formal and professional — polished, authoritative language",
    "professional-approachable":"professional yet approachable — clear, friendly, confidence-inspiring",
    "casual":                   "casual and friendly — conversational, warm, relaxed",
    "creative":                 "creative and expressive — vivid language, personality-driven",
    "ai-decide":                "the tone that best suits the business type and chosen style",
  };

  const pageLabels: Record<string, string> = {
    home:"Home", services:"Services/Products", about:"About Us", contact:"Contact",
    portfolio:"Portfolio/Gallery", pricing:"Pricing/Plans", team:"Team/Staff",
    faq:"FAQ", blog:"Blog/News", testimonials:"Testimonials",
    privacy:"Privacy Policy", terms:"Terms of Service", careers:"Careers",
    booking:"Booking", newsletter:"Newsletter Signup",
  };

  const featureLabels: Record<string, string> = {
    testimonials:  "customer testimonials section",
    social:        "social media icon links",
    newsletter:    "email newsletter signup",
    search:        "search bar",
    multilang:     "language switcher (English + one other)",
    accessibility: "ARIA labels, alt text, and WCAG 2.1 AA compliance",
    analytics:     "Google Analytics script placeholder",
  };
  const features = f.pages.specialFeatures.map((id: string) => featureLabels[id] || id);

  const animMap: Record<string, string> = {
    "minimal":   "no animations — static, instant-load",
    "moderate":  "subtle fade-ins on scroll, smooth hover transitions",
    "rich":      "scroll-triggered animations, parallax, engaging micro-interactions",
    "ai-decide": "appropriate animations for the chosen style",
  };

  // Team members are stored in galleryMembers in the wizard
  const teamMembers = (f.galleryMembers ?? []).filter(m => m.name?.trim());
  const galleryImages = (f.gallery ?? []).filter(Boolean);
  const socials = f.socials ?? {};
  const socialEntries = Object.entries(socials).filter(([, v]) => v?.trim());

  // Services: prefer detailed serviceItems[], fall back to simple list[]
  const serviceItems = (f.services.serviceItems ?? []).filter(s => s.name?.trim());
  const simpleList = (f.services.list ?? []).filter(Boolean);

  return `Create a complete, professional, production-ready Next.js website for a ${f.business.type.toLowerCase()} business.
${f.templateId ? getTemplateDesignSpec(f.templateId) : ""}
════════════════════════════════════════════════
BUSINESS DETAILS
════════════════════════════════════════════════
Business name: ${f.business.name}
Business type: ${f.business.type}
Description: ${f.business.description}${f.business.locationCity || f.business.locationCountry ? `\nLocation: ${[f.business.locationCity, f.business.locationCountry].filter(Boolean).join(", ")}` : f.business.location ? `\nLocation: ${f.business.location}` : ""}${f.business.serviceArea ? `\nService area: ${f.business.serviceArea}` : ""}${f.business.email ? `\nEmail: ${f.business.email}` : ""}${f.business.hasPhone && f.business.phone ? `\nPhone: ${f.business.phone}` : ""}${f.business.ownerName ? `\nOwner/contact name: ${f.business.ownerName}` : ""}${f.business.mapsLink ? `\nGoogle Maps link: ${f.business.mapsLink} — add a "Get directions" button or embedded map section that links to this URL.` : ""}

════════════════════════════════════════════════
GOALS & AUDIENCE
════════════════════════════════════════════════
${f.goals.mainGoal ? `Primary website goal: ${f.goals.mainGoal}` : ""}${f.goals.visitorFeel ? `\nDesired visitor emotion: ${f.goals.visitorFeel}` : ""}${f.goals.idealCustomer ? `\nIdeal customer: ${f.goals.idealCustomer}` : ""}${f.goals.problemSolved ? `\nProblem solved: ${f.goals.problemSolved}` : ""}${f.goals.whyChoose ? `\nKey differentiator / why choose them: ${f.goals.whyChoose}` : ""}

════════════════════════════════════════════════
SERVICES & PRICING
════════════════════════════════════════════════
${f.services.offersType ? `Offers: ${f.services.offersType}` : ""}
${serviceItems.length > 0 ? `Services (use these EXACTLY — do not invent others):\n${serviceItems.map(s => `• ${s.name}${s.description ? ` — ${s.description}` : ""}${s.callForPrice ? " (price: call for quote)" : s.price ? ` (price: ${s.price})` : ""}`).join("\n")}` : simpleList.length > 0 ? `Main services / products:\n${simpleList.map(s => `• ${s}`).join("\n")}` : ""}
${f.services.priceVisibility ? `Pricing display: ${f.services.priceVisibility}` : ""}

════════════════════════════════════════════════
DESIGN & VISUAL IDENTITY
════════════════════════════════════════════════
Design style: ${styleMap[f.design.style] || f.design.style}
Personality level: ${f.design.personalityLevel || "balanced"}
Background style: ${f.design.backgroundStyle || "AI decides"}
Primary color: ${f.design.primaryColor}
Secondary/accent color: ${f.design.secondaryColor}
Dark mode: ${f.design.darkMode ? "Yes — include a dark mode toggle and CSS variables for both themes" : "No — single light/warm theme only"}

Typography: ${fontMap[f.typography.fontFamily] || f.typography.fontFamily}
Imagery style: ${imageryMap[f.typography.imageryStyle] || f.typography.imageryStyle}
Hero section: ${heroMap[f.typography.heroPreference] || f.typography.heroPreference}
${f.logo.uploaded ? "Logo: The user uploaded a logo. Use exactly src=\"/logo.png\" in your <img> tag — this will be replaced with the real file automatically. Size: height 44px, width auto, object-fit contain, in the sticky nav." : "Logo: No logo uploaded — create a text-based wordmark using the business name styled with the primary brand colour."}

════════════════════════════════════════════════
BUSINESS ABOUT & STORY
════════════════════════════════════════════════
${f.business.aboutText ? `About / story: ${f.business.aboutText}${f.business.aboutAiRephrase ? "\n(The client has authorised AI improvement of this text — rephrase for professional quality.)" : "\n(Use this text VERBATIM — the client wants their exact wording.)"}` : ""}
${f.business.experience ? `Years in business: ${f.business.experience}` : ""}

════════════════════════════════════════════════
SCHEDULE & HOURS
════════════════════════════════════════════════
${(() => {
  const s = f.schedule;
  if (!s || s.type === "no-schedule") return "No fixed schedule.";
  if (s.type === "online") return "Fully online business — no physical opening hours.";
  if (s.type === "always-open") return "Open 24/7 — always available.";
  const lines = Object.entries(s.hours ?? {}).map(([day, h]: [string, {open:string;close:string;closed:boolean}]) =>
    h.closed ? `  ${day.charAt(0).toUpperCase()+day.slice(1)}: Closed` : `  ${day.charAt(0).toUpperCase()+day.slice(1)}: ${h.open} – ${h.close}`
  );
  return `Custom hours:\n${lines.join("\n")}`;
})()}

════════════════════════════════════════════════
PAGES & CONTENT
════════════════════════════════════════════════
Pages to include (create dedicated sections or full pages for each):
${f.pages.selected.map(id => {
  const label = pageLabels[id] || id;
  const desc = f.pages.pageDescriptions?.[id];
  const parts: string[] = [];
  if (desc?.description) parts.push(desc.aiRephrase ? `AI may rephrase: "${desc.description}"` : `Use verbatim: "${desc.description}"`);
  if (desc?.image) parts.push(`User provided a photo — use exactly src="/section-image-${id}" on the main <img> for this section; it will be swapped with the real photo automatically. Do NOT use picsum for this section.`);
  return parts.length > 0 ? `• ${label} — ${parts.join(" ")}` : `• ${label}`;
}).join("\n")}

Primary call-to-action: ${ctaMap[f.pages.primaryCTA] || f.pages.primaryCTA}
Content tone: ${toneMap[f.pages.contentTone] || f.pages.contentTone}
Website language: ${f.websiteLanguage || "English"} — ALL copy, headings, labels, and text on the website MUST be written entirely in ${f.websiteLanguage || "English"}. Do not include any English unless the target language IS English.
Emojis: ${f.useEmojis ? "Yes — use emojis tastefully throughout headings and copy for personality" : "No — keep it professional, no emojis"}

${socialEntries.length > 0 ? `════════════════════════════════════════════════
SOCIAL MEDIA LINKS
════════════════════════════════════════════════
Include clickable social media icons in the footer (and optionally in the nav) linking to these EXACT URLs:
${socialEntries.map(([platform, url]) => `• ${platform}: ${url}`).join("\n")}
Do NOT invent social links. Only include the ones listed above.` : ""}

${galleryImages.length > 0 ? `════════════════════════════════════════════════
PHOTO GALLERY
════════════════════════════════════════════════
The user uploaded ${galleryImages.length} real photos for the gallery section.
Use these EXACT placeholder src values — they will be automatically replaced with the real photos:
${galleryImages.map((_, i) => `• src="/gallery-image-${i}"`).join("\n")}
Display them in a responsive photo grid or gallery section. Do NOT use picsum for these — use only the /gallery-image-N placeholders above.` : ""}

${teamMembers.length > 0 ? `════════════════════════════════════════════════
TEAM MEMBERS
════════════════════════════════════════════════
Include a team section featuring EXACTLY these people (do not invent others):
${teamMembers.map((m, i) => `${i+1}. ${m.name}${m.role ? ` — ${m.role}` : ""}${m.photo ? `\n   Photo: use exactly src="/team-photo-${i}" — it will be replaced with the real photo automatically.` : ""}`).join("\n")}` : ""}

════════════════════════════════════════════════
FEATURES & BEHAVIOUR
════════════════════════════════════════════════
${features.length > 0 ? `Special features:\n${features.map((feat: string) => `• ${feat}`).join("\n")}` : "No additional special features."}
Animations: ${animMap[f.design.animations] || f.design.animations}
${f.pages.calendarModuleEnabled ? `IMPORTANT — editable weekly schedule:\nThis site includes a pre-built component at "../components/ThisWeekAtChurch" (relative to pages/index.tsx). Import it with: import ThisWeekAtChurch from "../components/ThisWeekAtChurch"; and render <ThisWeekAtChurch /> as its own section in a sensible place in the page (e.g. directly after the hero, or in a dedicated "This Week" / "Schedule" section). Do not attempt to build your own schedule UI — this component handles its own data fetching and empty states. Do not pass it any props. Do NOT add a link to "/admin" anywhere in the navigation, footer, or body content — it is a password-protected staff-only page and must not appear in any menu.` : ""}
${f.pages.additionalNotes ? `\nAdditional notes from client:\n${f.pages.additionalNotes}` : ""}

════════════════════════════════════════════════
TECHNICAL REQUIREMENTS
════════════════════════════════════════════════
• Single default-export React component — no sub-files
• Inline <style> tag or style attributes only — NO external CSS, NO Tailwind
• Fully responsive across mobile (375px), tablet (768px), and desktop (1280px)
• All placeholder content must be realistic and specific to a ${f.business.type.toLowerCase()}
• ██ PHOTO RULE: ONLY use images whose src placeholders are explicitly listed above. NEVER use picsum.photos or any external image URL. If a section has no listed image, use NO <img> tag — use color/gradient/CSS instead. ██
• Smooth hover effects on buttons and interactive elements
• Sticky header/navigation
• Footer with copyright, social icons, and business name
• Production-ready quality — nothing that looks like a template`;
}

type GenerationStage = "generating_code" | "deploying" | "saving_db";

async function failGenerationOrder(
  order: Order,
  userId: string,
  stage: GenerationStage,
  error: string
): Promise<void> {
  console.error("[generation-failed]", {
    orderId: order.id,
    userId,
    stage,
    error: error.slice(0, 500),
  });
  await failOrder(order.id, `[${stage}] ${error}`);
}

export async function POST(request: NextRequest) {
  let claimedOrder: Order | null = null;
  let stage: GenerationStage = "generating_code";
  let resolvedUserId = "";
  try {
    const body = await request.json();
    const {
      formData,
      tier = "website_5",
      siteId: editSiteId,
      userId: webhookUserId,       // set by webhook (no session cookie available)
      checkoutSessionId,
    } = body as {
      formData: WizardData;
      tier?: "website" | "website_5";
      siteId?: string;
      userId?: string;
      checkoutSessionId?: string;
    };

    // Allow webhook calls using an internal secret, or normal session-cookie calls.
    // A checkout session id is NOT an identity credential — it is only used
    // below to claim the matching paid order for the authenticated user.
    const internalSecretHeader = request.headers.get("x-internal-secret");
    const configuredInternalSecret = process.env.INTERNAL_SECRET;
    const isWebhook = !!(
      internalSecretHeader &&
      configuredInternalSecret &&
      internalSecretHeader.length === configuredInternalSecret.length &&
      crypto.timingSafeEqual(Buffer.from(internalSecretHeader), Buffer.from(configuredInternalSecret))
    );

    if (isWebhook && webhookUserId) {
      resolvedUserId = webhookUserId;
    } else {
      const session = await getSession();
      if (!session) {
        return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
      }
      resolvedUserId = session.userId;
    }

    const user = await getUserById(resolvedUserId);
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 401 });
    }

    // ── Payment gate for new-site generation ────────────────────────────────
    // Each paid Stripe checkout session is recorded as an order (by the
    // verified webhook or verify-session). Generation atomically claims it,
    // so one payment = one generation, no matter how many entry points fire.
    if (!editSiteId) {
      if (!checkoutSessionId) {
        return NextResponse.json(
          { error: "Payment required before generation.", code: "PAYMENT_REQUIRED" },
          { status: 402 }
        );
      }
      claimedOrder = await claimOrderForGeneration(checkoutSessionId, resolvedUserId);
      if (!claimedOrder) {
        const existing = await getOrderByStripeSessionId(checkoutSessionId);
        if (existing && existing.user_id === resolvedUserId) {
          if (existing.status === "completed") {
            return NextResponse.json(
              { error: "This payment was already used to generate a website.", code: "ORDER_ALREADY_COMPLETED", siteId: existing.site_id },
              { status: 409 }
            );
          }
          return NextResponse.json(
            { error: "Your website is already being generated.", code: "GENERATION_IN_PROGRESS" },
            { status: 409 }
          );
        }
        return NextResponse.json(
          { error: "No valid payment found for this request.", code: "PAYMENT_REQUIRED" },
          { status: 402 }
        );
      }
    }

    const vercelAuth = await getValidVercelToken(resolvedUserId);
    const userVercelToken = vercelAuth?.token;
    const userTeamId = vercelAuth?.teamId ?? undefined;

    if (!formData) {
      return NextResponse.json({ error: "Missing form data." }, { status: 400 });
    }

    const siteName = formData.business.name;
    if (!siteName || !formData.business.description) {
      return NextResponse.json({ error: "Business name and description are required." }, { status: 400 });
    }

    console.log(`Starting ${editSiteId ? "re-generation" : "generation"} for: ${siteName}`);
    console.log(`🎨 Template: ${formData.templateId || "custom"}`);
    console.log(`🖼️  Logo uploaded: ${formData.logo?.uploaded ? `yes (${formData.logo.fileName})` : "no"}`);

    const images = extractImages(formData);
    console.log(`🖼️  Passing ${images.length} images to Claude: ${images.map(i => i.placeholder).join(', ') || 'none'}`);
    // Images are deployed as real static files — no base64 embedding in code
    const staticImages = images.map(img => ({ path: img.placeholder.replace(/^\//, ""), base64: img.base64 }));

    // ── Premium preset design: deploy the exact prebuilt bundle, never LLM-generated code ──
    const presetSlug = isPresetTemplate(formData.templateId) ? formData.templateId : null;
    let websiteCode = "";
    let presetFiles: StaticDeployFile[] | null = null;

    stage = "generating_code";
    if (presetSlug) {
      // #region agent log
      fetch('http://127.0.0.1:7469/ingest/a117af1e-34fc-4785-aeae-36ebe2d13be6',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'fdaeb6'},body:JSON.stringify({sessionId:'fdaeb6',location:'generate-site/route.ts:preset-branch',message:'preset branch entered',data:{slug:presetSlug,siteName},hypothesisId:'preset-flow',timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      const personalization = await generatePresetPersonalization(presetSlug, formData);
      const logoImg = images.find(i => i.placeholder.startsWith("/logo."));
      presetFiles = buildPresetDeployFiles(presetSlug, personalization, {
        logo: logoImg ? { path: logoImg.placeholder.replace(/^\//, ""), base64: logoImg.base64 } : undefined,
        socials: formData.socials,
      });
      // #region agent log
      fetch('http://127.0.0.1:7469/ingest/a117af1e-34fc-4785-aeae-36ebe2d13be6',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'fdaeb6'},body:JSON.stringify({sessionId:'fdaeb6',location:'generate-site/route.ts:preset-personalized',message:'preset files built',data:{slug:presetSlug,replacements:personalization.replacements.length,title:personalization.title,fileCount:presetFiles.length},hypothesisId:'preset-flow',timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      console.log(`✅ Preset "${presetSlug}" personalized: ${personalization.replacements.length} replacements, ${presetFiles.length} files`);
    } else {
      const prompt = buildPrompt(formData);
      websiteCode = await generateWebsiteCode(prompt, images);
      console.log("✅ Code generated");
    }

    // User sites deploy only to the customer's Vercel account — never the platform.
    if (!userVercelToken) {
      stage = "deploying";
      if (claimedOrder && resolvedUserId) {
        await failGenerationOrder(claimedOrder, resolvedUserId, stage, VERCEL_RECONNECT_MESSAGE);
      }
      return NextResponse.json(
        { error: VERCEL_RECONNECT_MESSAGE, code: "VERCEL_NOT_CONNECTED" },
        { status: 403 }
      );
    }

    const deployToken = userVercelToken;

    // ── UPDATE existing site ────────────────────────────────────────────────
    if (editSiteId) {
      const existingSite = await getSiteById(editSiteId, resolvedUserId);
      if (!existingSite) {
        return NextResponse.json({ error: "Site not found." }, { status: 404 });
      }

      const deployProjectName = resolveVercelDeployName(existingSite);
      console.log(`🔁 Updating site ${editSiteId}, deployName=${deployProjectName}`);

      stage = "deploying";
      const deployment = presetFiles
        ? await deployStaticSiteToVercel(deployProjectName, presetFiles, {
            userToken: userVercelToken,
            teamId: userTeamId,
            requireUserToken: true,
          })
        : await deployToVercel(deployProjectName, websiteCode, {
            staticImages,
            userToken: userVercelToken,
            teamId: userTeamId,
            requireUserToken: true,
          });

      const vercelProjectId = deployment.projectId ?? existingSite.vercel_project_id!;
      const siteUrl = normalizeDeploymentUrl(deployment.url);

      stage = "saving_db";
      await updateSiteAfterRegeneration(
        editSiteId,
        siteUrl,
        deployment.id,
        vercelProjectId,
        formData as unknown as Record<string, unknown>,
        deployProjectName
      );

      console.log("✅ Site updated:", siteUrl);
      return NextResponse.json({ success: true, siteId: editSiteId, siteUrl, message: "Your website has been updated!" });
    }

    // ── CREATE new site ─────────────────────────────────────────────────────
    const projectName = siteName.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "").slice(0, 63);
    console.log("Deploying to user's Vercel...");
    stage = "deploying";
    const deployment = presetFiles
      ? await deployStaticSiteToVercel(projectName, presetFiles, {
          userToken: userVercelToken,
          teamId: userTeamId,
          requireUserToken: true,
        })
      : await deployToVercel(projectName, websiteCode, {
          staticImages,
          userToken: userVercelToken,
          teamId: userTeamId,
          requireUserToken: true,
          parishCalendarFiles: formData.pages.calendarModuleEnabled ? PARISH_CALENDAR_FILES : undefined,
        });
    const vercelProjectId = deployment.projectId ?? projectName;
    console.log("✅ Deployed:", deployment.url, "| vercel project id:", vercelProjectId);
    // #region agent log
    if (presetSlug) fetch('http://127.0.0.1:7469/ingest/a117af1e-34fc-4785-aeae-36ebe2d13be6',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'fdaeb6'},body:JSON.stringify({sessionId:'fdaeb6',location:'generate-site/route.ts:preset-deployed',message:'preset static deploy done',data:{slug:presetSlug,url:deployment.url,projectId:vercelProjectId},hypothesisId:'preset-flow',timestamp:Date.now()})}).catch(()=>{});
    // #endregion

    const siteUrl = normalizeDeploymentUrl(deployment.url);

    stage = "saving_db";
    let site;
    try {
      site = await saveSiteWithVercel(
        user.id,
        siteName,
        formData.business.type,
        siteUrl,
        vercelProjectId,
        deployment.id,
        formData as unknown as Record<string, unknown>,
        tier,
        projectName
      );
    } catch (dbErr) {
      const compensationTarget = deployment.projectId ?? projectName;
      await deleteVercelProject(compensationTarget, deployToken, userTeamId).catch((delErr) =>
        console.error("[generation-compensation] failed to delete orphan Vercel project:", {
          orderId: claimedOrder?.id,
          userId: resolvedUserId,
          project: compensationTarget,
          error: delErr instanceof Error ? delErr.message : String(delErr),
        })
      );
      throw dbErr;
    }

    if (claimedOrder) {
      await completeOrder(claimedOrder.id, site.id);
    }

    try {
      await sendWebsiteCreatedEmail(user.email, { siteName: site.name, siteUrl }, user.preferred_language);
    } catch (emailError) {
      console.error("Website created email failed:", emailError);
    }

    // Parish calendar needs a Next.js runtime — preset sites are static bundles,
    // so the add-on cannot be provisioned on them.
    if (formData.pages.calendarModuleEnabled && presetSlug) {
      console.warn(`⚠️  Calendar module requested but skipped: preset site "${presetSlug}" is static.`);
    }
    if (formData.pages.calendarModuleEnabled && !presetSlug) {
      try {
        const adminEmail = formData.business.email?.trim() || user.email;
        const tempPassword = crypto.randomBytes(9).toString("base64").replace(/[^a-zA-Z0-9]/g, "").slice(0, 12);
        const passwordHash = await bcrypt.hash(tempPassword, 10);
        const bootstrapSecret = crypto.randomBytes(24).toString("hex");
        const sessionSecret = crypto.randomBytes(24).toString("hex");

        const projectToken = userVercelToken;

        // Try to provision Blob storage ourselves so the customer doesn't have to.
        // Some connected Vercel accounts (OAuth integration tokens) lack storage
        // scope — in that case this throws and we fall back to the manual-setup
        // email exactly as before.
        let blobConnected = false;
        try {
          await createAndConnectBlobStore(vercelProjectId, projectToken, userTeamId, `${projectName}-calendar`);
          blobConnected = true;
        } catch (blobErr) {
          console.warn("⚠️  Could not auto-connect Blob store, falling back to manual setup:", blobErr);
        }

        await setProjectEnvVars(vercelProjectId, projectToken, userTeamId, [
          { key: "PARISH_BOOTSTRAP_SECRET", value: bootstrapSecret },
          { key: "PARISH_SESSION_SECRET", value: sessionSecret },
        ]);

        await createParishCalendarModule(site.id, adminEmail, passwordHash, encryptToken(bootstrapSecret));

        if (blobConnected) {
          // The first deployment ran before these env vars existed — Vercel only
          // injects env vars into a deployment that's built after they're set.
          await deployToVercel(projectName, websiteCode, {
            staticImages,
            userToken: userVercelToken,
            teamId: userTeamId,
            requireUserToken: true,
            parishCalendarFiles: PARISH_CALENDAR_FILES,
          });

          try {
            const bootstrapRes = await fetch(`${siteUrl}/api/parish-admin/bootstrap`, {
              method: "POST",
              headers: { "Content-Type": "application/json", "x-bootstrap-secret": bootstrapSecret },
              body: JSON.stringify({ email: adminEmail, passwordHash }),
            });
            if (bootstrapRes.ok) await setParishCalendarBlobConnected(site.id, true);
          } catch (bootstrapErr) {
            console.warn("⚠️  Auto-bootstrap call failed, customer can use 'Check now' on the dashboard:", bootstrapErr);
          }
        }

        await sendParishCalendarSetupEmail(adminEmail, {
          siteName: site.name,
          adminUrl: `${site.vercel_url}/admin`,
          adminEmail,
          tempPassword,
          vercelProjectName: projectName,
          storageAlreadyConnected: blobConnected,
        });
      } catch (err) {
        console.error("Parish calendar module provisioning failed:", err);
        // Do not fail site generation if this add-on setup fails — the customer
        // already has a working website. They can retry from the dashboard.
      }
    }

    return NextResponse.json({
      success: true,
      siteId: site.id,
      siteUrl,
      message: "Your website is ready!",
    });
  } catch (error) {
    const rawError = error instanceof Error ? error.message : String(error);
    const errorId = newErrorId();
    const lowerError = rawError.toLowerCase();
    const isAnthropicCreditIssue =
      lowerError.includes("credit balance is too low") ||
      lowerError.includes("insufficient_credit") ||
      (lowerError.includes("anthropic") && lowerError.includes("plans & billing"));

    logServerError(errorId, "generate-site", error, {
      orderId: claimedOrder?.id,
      userId: resolvedUserId || undefined,
      stage,
    });

    if (error instanceof VercelAuthError) {
      stage = "deploying";
      if (claimedOrder && resolvedUserId) {
        await failGenerationOrder(claimedOrder, resolvedUserId, stage, error.message).catch((e) =>
          console.error("Failed to mark order failed:", e)
        );
      }
      return NextResponse.json(
        { error: error.message, code: "VERCEL_NOT_CONNECTED", errorId },
        { status: 403 }
      );
    }

    if (claimedOrder && resolvedUserId) {
      await failGenerationOrder(claimedOrder, resolvedUserId, stage, rawError).catch((e) =>
        console.error("Failed to mark order failed:", e)
      );
    }

    if (isAnthropicCreditIssue) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Website generation is temporarily unavailable because the AI provider credits are depleted. Please contact support/admin to top up credits and retry.",
          code: "AI_CREDITS_DEPLETED",
          errorId,
        },
        { status: 402 }
      );
    }
    return genericErrorResponse(errorId);
  }
}
