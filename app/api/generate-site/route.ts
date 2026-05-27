import { NextRequest, NextResponse } from "next/server";
import { generateWebsiteCode } from "@/lib/anthropic";
import { deployToVercel } from "@/lib/vercel";
import { getSession } from "@/lib/session";
import { getUserById, saveSiteWithVercel, getSiteById, updateSiteAfterRegeneration } from "@/lib/db";
import type { WizardData } from "@/app/components/GenerateWizard";
import fs from "fs";
import path from "path";

export const maxDuration = 300;

// ─── Template CSS extraction ───────────────────────────────────────────────────

const TEMPLATE_FILES: Record<string, string> = {
  "dentist":       "01-dentist.html",
  "gym-coach":     "02-gym-coach.html",
  "kindergarten":  "03-kindergarten.html",
  "coffee-shop":   "04-coffee-shop.html",
  "fine-dining":   "05-fine-dining.html",
  "bakery":        "06-bakery.html",
  "law-firm":      "07-law-firm.html",
  "real-estate":   "08-real-estate.html",
  "hair-salon":    "09-hair-salon.html",
  "auto-repair":   "10-auto-repair.html",
  "vet-clinic":    "11-vet-clinic.html",
  "yoga-studio":   "12-yoga-studio.html",
  "tattoo-studio": "13-tattoo-studio.html",
  "florist":       "14-florist.html",
  "bookstore":     "15-bookstore.html",
  "saas-startup":  "16-saas-startup.html",
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

// ─── Logo / image post-processing ─────────────────────────────────────────────

function embedUploads(code: string, formData: WizardData): string {
  let result = code;

  // Replace /logo.png placeholder with the actual uploaded logo data URL
  if (formData.logo?.uploaded && formData.logo.dataUrl) {
    const logoDataUrl = formData.logo.dataUrl;
    console.log(`📎 Embedding logo: ${formData.logo.fileName} (${Math.round(logoDataUrl.length / 1024)} KB as base64)`);
    result = result
      .replace(/src="\/logo\.png"/g, `src="${logoDataUrl}"`)
      .replace(/src='\/logo\.png'/g, `src='${logoDataUrl}'`);
  }

  // Replace per-section image placeholders with uploaded images
  const descs = formData.pages?.pageDescriptions ?? {};
  for (const [pageId, desc] of Object.entries(descs)) {
    if (desc?.image) {
      const placeholder = `/section-image-${pageId}`;
      result = result
        .replace(new RegExp(`src="${placeholder}[^"]*"`, "g"), `src="${desc.image}"`)
        .replace(new RegExp(`src='${placeholder}[^']*'`, "g"), `src='${desc.image}'`);
    }
  }

  return result;
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

  const allPages = f.pages.selected.map(id => {
    const labels: Record<string, string> = {
      home:"Home", services:"Services/Products", about:"About Us", contact:"Contact",
      portfolio:"Portfolio/Gallery", pricing:"Pricing/Plans", team:"Team/Staff",
      faq:"FAQ", blog:"Blog/News", testimonials:"Testimonials",
      privacy:"Privacy Policy", terms:"Terms of Service", careers:"Careers",
      booking:"Booking", newsletter:"Newsletter Signup",
    };
    return labels[id] || id;
  });

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

  return `Create a complete, professional, production-ready Next.js website for a ${f.business.type.toLowerCase()} business.
${f.templateId ? getTemplateDesignSpec(f.templateId) : ""}
════════════════════════════════════════════════
BUSINESS DETAILS
════════════════════════════════════════════════
Business name: ${f.business.name}
Business type: ${f.business.type}
Description: ${f.business.description}${f.business.location ? `\nLocation: ${f.business.location}` : ""}${f.business.serviceArea ? `\nService area: ${f.business.serviceArea}` : ""}${f.business.openingHours ? `\nOpening hours: ${f.business.openingHours}` : ""}${f.business.email ? `\nEmail: ${f.business.email}` : ""}${f.business.phone ? `\nPhone: ${f.business.phone}` : ""}${f.business.ownerName ? `\nOwner/contact name: ${f.business.ownerName}` : ""}

════════════════════════════════════════════════
GOALS & AUDIENCE
════════════════════════════════════════════════
${f.goals.mainGoal ? `Primary website goal: ${f.goals.mainGoal}` : ""}${f.goals.visitorFeel ? `\nDesired visitor emotion: ${f.goals.visitorFeel}` : ""}${f.goals.idealCustomer ? `\nIdeal customer: ${f.goals.idealCustomer}` : ""}${f.goals.problemSolved ? `\nProblem solved: ${f.goals.problemSolved}` : ""}${f.goals.whyChoose ? `\nKey differentiator / why choose them: ${f.goals.whyChoose}` : ""}

════════════════════════════════════════════════
SERVICES & PRICING
════════════════════════════════════════════════
${f.services.offersType ? `Offers: ${f.services.offersType}` : ""}${f.services.list.filter(Boolean).length > 0 ? `\nMain services / products:\n${f.services.list.filter(Boolean).map(s => `• ${s}`).join("\n")}` : ""}${f.services.priceVisibility ? `\nPricing display: ${f.services.priceVisibility}` : ""}

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
${allPages.map(p => {
  const desc = f.pages.pageDescriptions?.[p.toLowerCase().replace(/[^a-z]/g,"")];
  if (desc?.description) {
    const text = desc.aiRephrase ? `AI may rephrase: "${desc.description}"` : `Use verbatim: "${desc.description}"`;
    return `• ${p} — ${text}`;
  }
  return `• ${p}`;
}).join("\n")}

Primary call-to-action: ${ctaMap[f.pages.primaryCTA] || f.pages.primaryCTA}
Content tone: ${toneMap[f.pages.contentTone] || f.pages.contentTone}
Website language: ${f.websiteLanguage || "English"} — ALL copy, headings, labels, and text on the website MUST be written entirely in ${f.websiteLanguage || "English"}. Do not include any English unless the target language IS English.
Emojis: ${f.useEmojis ? "Yes — use emojis tastefully throughout headings and copy for personality" : "No — keep it professional, no emojis"}

${f.team?.enabled && f.team.members.length > 0 ? `════════════════════════════════════════════════
TEAM MEMBERS
════════════════════════════════════════════════
Include a team section featuring these people:
${f.team.members.map((m, i) => `${i+1}. ${m.name}${m.role ? ` — ${m.role}` : ""}${m.bio ? `\n   Bio: ${m.bio}` : ""}`).join("\n")}` : ""}

════════════════════════════════════════════════
FEATURES & BEHAVIOUR
════════════════════════════════════════════════
${features.length > 0 ? `Special features:\n${features.map((feat: string) => `• ${feat}`).join("\n")}` : "No additional special features."}
Animations: ${animMap[f.design.animations] || f.design.animations}
${f.pages.additionalNotes ? `\nAdditional notes from client:\n${f.pages.additionalNotes}` : ""}

════════════════════════════════════════════════
TECHNICAL REQUIREMENTS
════════════════════════════════════════════════
• Single default-export React component — no sub-files
• Inline <style> tag or style attributes only — NO external CSS, NO Tailwind
• Fully responsive across mobile (375px), tablet (768px), and desktop (1280px)
• All placeholder content must be realistic and specific to a ${f.business.type.toLowerCase()}
• Use placeholder images from https://picsum.photos/ for any photo areas
• Smooth hover effects on buttons and interactive elements
• Sticky header/navigation
• Footer with copyright, social icons, and business name
• Production-ready quality — nothing that looks like a template`;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    }

    const user = await getUserById(session.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 401 });
    }

    const body = await request.json();
    const { formData, tier = "website_5", siteId: editSiteId } = body as {
      formData: WizardData;
      tier?: "website" | "website_5";
      siteId?: string;          // present when updating an existing site
    };

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

    const rawCode = await generateWebsiteCode(prompt);
    console.log("✅ Code generated, post-processing uploads...");
    const websiteCode = embedUploads(rawCode, formData);
    console.log("✅ Uploads embedded");

    // ── UPDATE existing site ────────────────────────────────────────────────
    if (editSiteId) {
      const existingSite = await getSiteById(editSiteId, session.userId);
      if (!existingSite) {
        return NextResponse.json({ error: "Site not found." }, { status: 404 });
      }

      // Smart token selection — same logic as edits/process to hit the right account
      const vercelAuthorizedAt = user.vercel_authorized_at ? new Date(user.vercel_authorized_at) : null;
      const siteCreatedAt = existingSite.created_at ? new Date(existingSite.created_at) : null;
      const siteOwnedByUser = !!(user.vercel_access_token && vercelAuthorizedAt && siteCreatedAt && vercelAuthorizedAt < siteCreatedAt);
      const editToken  = siteOwnedByUser ? (user.vercel_access_token ?? undefined) : process.env.VERCEL_API_TOKEN;
      const editTeamId = siteOwnedByUser ? (user.vercel_team_id ?? undefined) : undefined;

      console.log(`🔁 Updating site ${editSiteId}, project=${existingSite.vercel_project_id}, token=${siteOwnedByUser ? "user" : "app"}`);

      const deployment = await deployToVercel(existingSite.vercel_project_id!, websiteCode, {
        userToken: editToken,
        teamId: editTeamId,
      });

      const siteUrl = `https://${deployment.url}`;
      const vercelProjectId = deployment.projectId ?? existingSite.vercel_project_id!;

      await updateSiteAfterRegeneration(
        editSiteId,
        siteUrl,
        deployment.id,
        vercelProjectId,
        formData as unknown as Record<string, unknown>
      );

      console.log("✅ Site updated:", siteUrl);
      return NextResponse.json({ success: true, siteId: editSiteId, siteUrl, message: "Your website has been updated!" });
    }

    // ── CREATE new site ─────────────────────────────────────────────────────
    const projectName = `${siteName.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").slice(0, 40)}-${Date.now()}`;
    console.log("Deploying to user's Vercel...");
    const deployment = await deployToVercel(projectName, websiteCode, {
      userToken: user.vercel_access_token ?? undefined,
      teamId: user.vercel_team_id ?? undefined,
    });
    const vercelProjectId = deployment.projectId ?? projectName;
    console.log("✅ Deployed:", deployment.url, "| vercel project id:", vercelProjectId);

    const siteUrl = `https://${deployment.url}`;

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

    return NextResponse.json({
      success: true,
      siteId: site.id,
      siteUrl,
      message: "Your website is ready!",
    });
  } catch (error) {
    console.error("Error generating site:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error occurred" },
      { status: 500 }
    );
  }
}
