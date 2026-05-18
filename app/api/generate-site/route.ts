import { NextRequest, NextResponse } from "next/server";
import { generateWebsiteCode } from "@/lib/anthropic";
import { deployToVercel } from "@/lib/vercel";
import { getSession } from "@/lib/session";
import { getUserById, saveSiteWithVercel } from "@/lib/db";
import type { WizardData } from "@/app/components/GenerateWizard";

export const maxDuration = 300;

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
    "modern-sans":   "Inter / Helvetica Neue style — clean geometric sans-serif",
    "classic-serif": "Georgia / Playfair Display style — classic serif, elegant and trustworthy",
    "geo-bold":      "heavy bold display sans-serif, strong visual weight, impactful headlines",
    "mono":          "JetBrains Mono / Courier style — monospace, technical and precise",
    "playful":       "rounded friendly typeface, casual and warm, slightly larger letter-spacing",
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

  const templateNames: Record<string, string> = {
    "dentist": "Dental Practice", "gym-coach": "Gym / Fitness Coach",
    "kindergarten": "Kindergarten", "coffee-shop": "Coffee Shop",
    "fine-dining": "Fine Dining Restaurant", "bakery": "Bakery",
    "law-firm": "Law Firm", "real-estate": "Real Estate Agency",
    "hair-salon": "Hair Salon", "auto-repair": "Auto Repair Shop",
    "vet-clinic": "Vet Clinic", "yoga-studio": "Yoga Studio",
    "tattoo-studio": "Tattoo Studio", "florist": "Florist",
    "bookstore": "Bookstore", "saas-startup": "SaaS / Tech Startup",
  };

  return `Create a complete, professional, production-ready Next.js website for a ${f.business.type.toLowerCase()} business.
${f.templateId && templateNames[f.templateId] ? `\nStarting template: "${templateNames[f.templateId]}" — use this as the primary visual reference for industry conventions, layout patterns, and aesthetic direction. Adapt it to the specific design settings and business details below.\n` : ""}
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
${f.logo.uploaded ? "Logo: A logo file was provided — include a <img> tag in the header with src set to '/logo.png' and size it appropriately (height ~40px in nav)." : "Logo: No logo uploaded — create a text-based logo using the business name, styled with the brand colors."}

════════════════════════════════════════════════
PAGES & CONTENT
════════════════════════════════════════════════
Pages to include (create dedicated sections or full pages for each):
${allPages.map(p => `• ${p}`).join("\n")}

Primary call-to-action: ${ctaMap[f.pages.primaryCTA] || f.pages.primaryCTA}
Content tone: ${toneMap[f.pages.contentTone] || f.pages.contentTone}

════════════════════════════════════════════════
FEATURES & BEHAVIOUR
════════════════════════════════════════════════
${features.length > 0 ? `Special features:\n${features.map(feat => `• ${feat}`).join("\n")}` : "No additional special features."}
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
    const { formData, tier = "website_5" } = body as {
      formData: WizardData;
      tier?: "website" | "website_5";
    };

    // Payment suspended during beta — no payment check

    if (!formData) {
      return NextResponse.json({ error: "Missing form data." }, { status: 400 });
    }

    const siteName = formData.business.name;
    if (!siteName || !formData.business.description) {
      return NextResponse.json({ error: "Business name and description are required." }, { status: 400 });
    }

    // Use user's Vercel token if connected, otherwise fall back to app token
    const vercelToken = user.vercel_access_token ?? undefined;
    const vercelTeam = user.vercel_team_id ?? undefined;
    void vercelToken; void vercelTeam; // used below

    const prompt = buildPrompt(formData);
    console.log("Starting site generation for:", siteName);

    console.log("Calling Claude API...");
    const websiteCode = await generateWebsiteCode(prompt);
    console.log("✅ Code generated");

    // Deploy directly to user's Vercel account — no GitHub needed
    const projectName = `${siteName.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").slice(0, 40)}-${Date.now()}`;
    console.log("Deploying to user's Vercel...");
    const deployment = await deployToVercel(projectName, websiteCode, {
      userToken: user.vercel_access_token ?? undefined,
      teamId: user.vercel_team_id ?? undefined,
    });
    console.log("✅ Deployed:", deployment.url);

    const siteUrl = `https://${deployment.url}`;

    const site = await saveSiteWithVercel(
      user.id,
      siteName,
      formData.business.type,
      siteUrl,
      projectName,
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
