import { NextRequest, NextResponse } from "next/server";
import { generateWebsiteCode } from "@/lib/anthropic";
import { deployToVercel, getValidVercelToken, setProjectEnvVars, createAndConnectBlobStore } from "@/lib/vercel";
import { getSession } from "@/lib/session";
import { getUserByEmail, getUserById, saveSiteWithVercel, getSiteById, updateSiteAfterRegeneration, createParishCalendarModule, setParishCalendarBlobConnected } from "@/lib/db";
import { sendParishCalendarSetupEmail, sendWebsiteCreatedEmail } from "@/lib/email";
import { encryptToken } from "@/lib/encryption";
import { PARISH_CALENDAR_FILES } from "@/lib/parish-calendar-templates";
import type { WizardData } from "@/app/components/GenerateWizard";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import Stripe from "stripe";

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

function buildEmergencyWebsiteCode(f: WizardData): string {
  const businessName = JSON.stringify((f.business.name || "Your Business").trim());
  const businessType = JSON.stringify((f.business.type || "Business").trim());
  const description = JSON.stringify((f.business.description || "Professional services tailored to your needs.").trim());
  const primaryColor = JSON.stringify(f.design.primaryColor || "#FF5A1F");
  const secondaryColor = JSON.stringify(f.design.secondaryColor || "#0A0E14");
  const location = JSON.stringify(
    [f.business.locationCity, f.business.locationCountry].filter(Boolean).join(", ") || f.business.location || ""
  );
  const phone = JSON.stringify(f.business.phone || "");
  const email = JSON.stringify(f.business.email || "");
  const ctaHref = f.business.hasPhone && f.business.phone ? JSON.stringify(`tel:${f.business.phone}`) : f.business.email ? JSON.stringify(`mailto:${f.business.email}`) : JSON.stringify("#");
  const ctaLabel = JSON.stringify(f.business.hasPhone && f.business.phone ? "Call now" : f.business.email ? "Send us an email" : "Contact us");

  return `export default function Page() {
  const businessName = ${businessName};
  const businessType = ${businessType};
  const description = ${description};
  const primaryColor = ${primaryColor};
  const secondaryColor = ${secondaryColor};
  const location = ${location};
  const phone = ${phone};
  const email = ${email};
  const ctaHref = ${ctaHref};
  const ctaLabel = ${ctaLabel};

  return (
    <div style={{ fontFamily: "Inter, Arial, sans-serif", color: "#111827", background: "#f8fafc", minHeight: "100vh" }}>
      <header style={{ position: "sticky", top: 0, zIndex: 10, background: "#ffffff", borderBottom: "1px solid #e5e7eb" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <strong style={{ color: secondaryColor }}>{businessName}</strong>
          <a href={ctaHref} style={{ background: primaryColor, color: "#fff", textDecoration: "none", padding: "10px 14px", borderRadius: 10, fontWeight: 600 }}>
            {ctaLabel}
          </a>
        </div>
      </header>

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "48px 20px 64px" }}>
        <section style={{ background: "#fff", borderRadius: 20, border: "1px solid #e5e7eb", padding: "36px 28px", marginBottom: 24 }}>
          <p style={{ margin: 0, color: primaryColor, fontWeight: 700, letterSpacing: 0.2 }}>Professional {businessType}</p>
          <h1 style={{ margin: "10px 0 12px", fontSize: "clamp(30px,5vw,48px)", lineHeight: 1.1, color: secondaryColor }}>{businessName}</h1>
          <p style={{ margin: 0, color: "#374151", fontSize: 18, lineHeight: 1.6, maxWidth: 760 }}>{description}</p>
          <div style={{ marginTop: 22, display: "flex", gap: 10, flexWrap: "wrap" }}>
            {location ? <span style={{ border: "1px solid #e5e7eb", borderRadius: 999, padding: "8px 12px", fontSize: 14 }}>Location: {location}</span> : null}
            {phone ? <span style={{ border: "1px solid #e5e7eb", borderRadius: 999, padding: "8px 12px", fontSize: 14 }}>Phone: {phone}</span> : null}
            {email ? <span style={{ border: "1px solid #e5e7eb", borderRadius: 999, padding: "8px 12px", fontSize: 14 }}>Email: {email}</span> : null}
          </div>
        </section>

        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 16 }}>
          <article style={{ background: "#fff", borderRadius: 16, border: "1px solid #e5e7eb", padding: 20 }}>
            <h2 style={{ margin: "0 0 8px", color: secondaryColor }}>What we do</h2>
            <p style={{ margin: 0, color: "#4b5563", lineHeight: 1.6 }}>
              We provide reliable, professional service with fast communication and transparent delivery.
            </p>
          </article>
          <article style={{ background: "#fff", borderRadius: 16, border: "1px solid #e5e7eb", padding: 20 }}>
            <h2 style={{ margin: "0 0 8px", color: secondaryColor }}>Why clients choose us</h2>
            <p style={{ margin: 0, color: "#4b5563", lineHeight: 1.6 }}>
              Practical expertise, clear timelines, and attention to detail from first contact to final result.
            </p>
          </article>
          <article style={{ background: "#fff", borderRadius: 16, border: "1px solid #e5e7eb", padding: 20 }}>
            <h2 style={{ margin: "0 0 8px", color: secondaryColor }}>Get started</h2>
            <p style={{ margin: "0 0 14px", color: "#4b5563", lineHeight: 1.6 }}>
              Reach out today and we will help you plan the best next step for your project.
            </p>
            <a href={ctaHref} style={{ color: primaryColor, fontWeight: 700, textDecoration: "none" }}>{ctaLabel} →</a>
          </article>
        </section>
      </main>

      <footer style={{ borderTop: "1px solid #e5e7eb", background: "#fff" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "18px 20px", color: "#6b7280", fontSize: 14 }}>
          © {new Date().getFullYear()} {businessName}. All rights reserved.
        </div>
      </footer>
    </div>
  );
}`;
}

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

export async function POST(request: NextRequest) {
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

    // Allow webhook calls using an internal secret, or normal session-cookie calls
    const internalSecret = request.headers.get("x-internal-secret");
    const isWebhook = internalSecret && internalSecret === (process.env.INTERNAL_SECRET || "");
    const runId = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
    // #region agent log
    fetch('http://127.0.0.1:7469/ingest/a117af1e-34fc-4785-aeae-36ebe2d13be6',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'dfd4e1'},body:JSON.stringify({sessionId:'dfd4e1',runId,hypothesisId:'H1',location:'app/api/generate-site/route.ts:408',message:'generate-site request received',data:{isWebhook:!!isWebhook,hasWebhookUserId:!!webhookUserId,hasFormData:!!formData,tier,editSiteId:editSiteId??null,hasInternalSecretHeader:!!internalSecret},timestamp:Date.now()})}).catch(()=>{});
    // #endregion

    let resolvedUserId: string;
    if (isWebhook && webhookUserId) {
      resolvedUserId = webhookUserId;
    } else {
      const session = await getSession();
      if (session) {
        resolvedUserId = session.userId;
      } else if (checkoutSessionId) {
        const stripeKey = process.env.STRIPE_SECRET_KEY;
        if (!stripeKey || stripeKey === "sk_test_xxxxx") {
          return NextResponse.json({ error: "Payment verification not configured." }, { status: 500 });
        }
        const stripe = new Stripe(stripeKey);
        const checkoutSession = await stripe.checkout.sessions.retrieve(checkoutSessionId);
        if (checkoutSession.payment_status !== "paid") {
          return NextResponse.json({ error: "Payment is not completed for this session." }, { status: 401 });
        }
        const stripeUserId = checkoutSession.metadata?.userId || checkoutSession.client_reference_id;
        const stripeEmail = checkoutSession.customer_details?.email || checkoutSession.customer_email || null;
        const stripeUser = stripeUserId ? await getUserById(stripeUserId) : (stripeEmail ? await getUserByEmail(stripeEmail) : null);
        if (!stripeUser) {
          return NextResponse.json({ error: "Could not identify paid user for generation." }, { status: 401 });
        }
        resolvedUserId = stripeUser.id;
        // #region agent log
        fetch('http://127.0.0.1:7469/ingest/a117af1e-34fc-4785-aeae-36ebe2d13be6',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'dfd4e1'},body:JSON.stringify({sessionId:'dfd4e1',runId,hypothesisId:'H8',location:'app/api/generate-site/route.ts:433',message:'resolved user via stripe checkout fallback',data:{checkoutSessionId,hasStripeUserId:!!stripeUserId,hasStripeEmail:!!stripeEmail,resolvedUserId:stripeUser.id},timestamp:Date.now()})}).catch(()=>{});
        // #endregion
      } else {
        return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
      }
    }

    const user = await getUserById(resolvedUserId);
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 401 });
    }

    const vercelAuth = await getValidVercelToken(resolvedUserId);
    const userVercelToken = vercelAuth?.token;
    const userTeamId = vercelAuth?.teamId ?? undefined;
    // #region agent log
    fetch('http://127.0.0.1:7469/ingest/a117af1e-34fc-4785-aeae-36ebe2d13be6',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'dfd4e1'},body:JSON.stringify({sessionId:'dfd4e1',runId,hypothesisId:'H4',location:'app/api/generate-site/route.ts:429',message:'user and vercel auth resolved',data:{resolvedUserId,userFound:!!user,hasUserToken:!!userVercelToken,userTeamId:userTeamId??null,usingFallbackToken:!userVercelToken},timestamp:Date.now()})}).catch(()=>{});
    // #endregion

    if (!formData) {
      return NextResponse.json({ error: "Missing form data." }, { status: 400 });
    }

    const siteName = formData.business.name;
    if (!siteName || !formData.business.description) {
      return NextResponse.json({ error: "Business name and description are required." }, { status: 400 });
    }

    const prompt = buildPrompt(formData);

    console.log(`Starting ${editSiteId ? "re-generation" : "generation"} for: ${siteName}`);
    console.log(`🎨 Template: ${formData.templateId || "custom"}`);
    console.log(`🖼️  Logo uploaded: ${formData.logo?.uploaded ? `yes (${formData.logo.fileName})` : "no"}`);

    const images = extractImages(formData);
    console.log(`🖼️  Passing ${images.length} images to Claude: ${images.map(i => i.placeholder).join(', ') || 'none'}`);
    // Images are deployed as real static files — no base64 embedding in code
    const staticImages = images.map(img => ({ path: img.placeholder.replace(/^\//, ""), base64: img.base64 }));
    let usedEmergencyFallback = false;
    let websiteCode: string;
    try {
      websiteCode = await generateWebsiteCode(prompt, images);
      console.log("✅ Code generated");
    } catch (genErr) {
      const genMessage = genErr instanceof Error ? genErr.message : String(genErr);
      const lowerGenMessage = genMessage.toLowerCase();
      const isAnthropicCreditIssue =
        lowerGenMessage.includes("credit balance is too low") ||
        lowerGenMessage.includes("insufficient_credit") ||
        (lowerGenMessage.includes("anthropic") && lowerGenMessage.includes("plans & billing"));
      if (!isAnthropicCreditIssue) throw genErr;

      usedEmergencyFallback = true;
      websiteCode = buildEmergencyWebsiteCode(formData);
      // #region agent log
      fetch('http://127.0.0.1:7469/ingest/a117af1e-34fc-4785-aeae-36ebe2d13be6',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'dfd4e1'},body:JSON.stringify({sessionId:'dfd4e1',runId,hypothesisId:'H11',location:'app/api/generate-site/route.ts:532',message:'used emergency fallback code due to AI credit depletion',data:{reason:genMessage.slice(0,300),businessName:formData.business.name||null},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
    }

    // ── UPDATE existing site ────────────────────────────────────────────────
    if (editSiteId) {
      const existingSite = await getSiteById(editSiteId, resolvedUserId);
      if (!existingSite) {
        return NextResponse.json({ error: "Site not found." }, { status: 404 });
      }

      console.log(`🔁 Updating site ${editSiteId}, project=${existingSite.vercel_project_id}`);
      // #region agent log
      fetch('http://127.0.0.1:7469/ingest/a117af1e-34fc-4785-aeae-36ebe2d13be6',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'dfd4e1'},body:JSON.stringify({sessionId:'dfd4e1',runId,hypothesisId:'H2',location:'app/api/generate-site/route.ts:462',message:'starting regeneration deploy',data:{editSiteId,existingProjectId:existingSite.vercel_project_id??null,staticImagesCount:staticImages.length,hasUserToken:!!userVercelToken,userTeamId:userTeamId??null},timestamp:Date.now()})}).catch(()=>{});
      // #endregion

      const deployment = await deployToVercel(existingSite.vercel_project_id!, websiteCode, {
        staticImages,
        userToken: userVercelToken,
        teamId: userTeamId,
      });

      const vercelProjectId = deployment.projectId ?? existingSite.vercel_project_id!;
      const siteUrl = `https://${existingSite.vercel_project_id}.vercel.app`;
      // #region agent log
      fetch('http://127.0.0.1:7469/ingest/a117af1e-34fc-4785-aeae-36ebe2d13be6',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'dfd4e1'},body:JSON.stringify({sessionId:'dfd4e1',runId,hypothesisId:'H2',location:'app/api/generate-site/route.ts:473',message:'regeneration deploy completed',data:{deploymentId:deployment.id,deploymentUrl:deployment.url,deploymentProjectId:deployment.projectId??null,resolvedProjectId:vercelProjectId,computedSiteUrl:siteUrl},timestamp:Date.now()})}).catch(()=>{});
      // #endregion

      await updateSiteAfterRegeneration(
        editSiteId,
        siteUrl,
        deployment.id,
        vercelProjectId,
        formData as unknown as Record<string, unknown>
      );

      console.log("✅ Site updated:", siteUrl);
      return NextResponse.json({ success: true, siteId: editSiteId, siteUrl, message: "Your website has been updated!", emergencyFallbackUsed: usedEmergencyFallback });
    }

    // ── CREATE new site ─────────────────────────────────────────────────────
    const projectName = siteName.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "").slice(0, 63);
    console.log("Deploying to user's Vercel...");
    // #region agent log
    fetch('http://127.0.0.1:7469/ingest/a117af1e-34fc-4785-aeae-36ebe2d13be6',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'dfd4e1'},body:JSON.stringify({sessionId:'dfd4e1',runId,hypothesisId:'H3',location:'app/api/generate-site/route.ts:489',message:'starting new-site deploy',data:{projectName,siteNameLength:siteName.length,staticImagesCount:staticImages.length,calendarModuleEnabled:!!formData.pages.calendarModuleEnabled,hasUserToken:!!userVercelToken,userTeamId:userTeamId??null},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    const deployment = await deployToVercel(projectName, websiteCode, {
      staticImages,
      userToken: userVercelToken,
      teamId: userTeamId,
      parishCalendarFiles: formData.pages.calendarModuleEnabled ? PARISH_CALENDAR_FILES : undefined,
    });
    const vercelProjectId = deployment.projectId ?? projectName;
    console.log("✅ Deployed:", deployment.url, "| vercel project id:", vercelProjectId);

    const siteUrl = `https://${projectName}.vercel.app`;
    // #region agent log
    fetch('http://127.0.0.1:7469/ingest/a117af1e-34fc-4785-aeae-36ebe2d13be6',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'dfd4e1'},body:JSON.stringify({sessionId:'dfd4e1',runId,hypothesisId:'H3',location:'app/api/generate-site/route.ts:501',message:'new-site deploy completed',data:{deploymentId:deployment.id,deploymentUrl:deployment.url,deploymentProjectId:deployment.projectId??null,resolvedProjectId:vercelProjectId,computedSiteUrl:siteUrl},timestamp:Date.now()})}).catch(()=>{});
    // #endregion

    const site = await saveSiteWithVercel(
      user.id,
      siteName,
      formData.business.type,
      siteUrl,
      vercelProjectId,
      deployment.id,
      formData as unknown as Record<string, unknown>,
      tier
    );

    try {
      await sendWebsiteCreatedEmail(user.email, { siteName: site.name, siteUrl }, user.preferred_language);
    } catch (emailError) {
      console.error("Website created email failed:", emailError);
    }

    if (formData.pages.calendarModuleEnabled) {
      try {
        const adminEmail = formData.business.email?.trim() || user.email;
        const tempPassword = crypto.randomBytes(9).toString("base64").replace(/[^a-zA-Z0-9]/g, "").slice(0, 12);
        const passwordHash = await bcrypt.hash(tempPassword, 10);
        const bootstrapSecret = crypto.randomBytes(24).toString("hex");
        const sessionSecret = crypto.randomBytes(24).toString("hex");

        const projectToken = userVercelToken ?? process.env.VERCEL_API_TOKEN!;

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
      emergencyFallbackUsed: usedEmergencyFallback,
    });
  } catch (error) {
    const rawError = error instanceof Error ? error.message : String(error);
    const lowerError = rawError.toLowerCase();
    const isAnthropicCreditIssue =
      lowerError.includes("credit balance is too low") ||
      lowerError.includes("insufficient_credit") ||
      (lowerError.includes("anthropic") && lowerError.includes("plans & billing"));
    // #region agent log
    fetch('http://127.0.0.1:7469/ingest/a117af1e-34fc-4785-aeae-36ebe2d13be6',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'dfd4e1'},body:JSON.stringify({sessionId:'dfd4e1',runId:'unavailable',hypothesisId:'H5',location:'app/api/generate-site/route.ts:596',message:'generate-site request failed',data:{error:rawError,isAnthropicCreditIssue},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    console.error("Error generating site:", error);
    if (isAnthropicCreditIssue) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Website generation is temporarily unavailable because the AI provider credits are depleted. Please contact support/admin to top up credits and retry.",
          code: "AI_CREDITS_DEPLETED",
        },
        { status: 402 }
      );
    }
    return NextResponse.json(
      { success: false, error: rawError || "Unknown error occurred" },
      { status: 500 }
    );
  }
}
