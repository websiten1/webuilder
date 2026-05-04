import { NextRequest, NextResponse } from "next/server";
import { generateWebsiteCode } from "@/lib/anthropic";
import { createGitHubRepository, pushCodeToGitHub } from "@/lib/github";
import { deployToVercel } from "@/lib/vercel";
import type { WizardData } from "@/app/components/GenerateWizard";

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

  const features = f.features.specialFeatures.map(id => {
    const labels: Record<string, string> = {
      testimonials:  "customer testimonials section",
      social:        "social media icon links",
      newsletter:    "email newsletter signup",
      search:        "search bar",
      multilang:     "language switcher (English + one other)",
      accessibility: "ARIA labels, alt text, and WCAG 2.1 AA compliance",
      analytics:     "Google Analytics script placeholder",
    };
    return labels[id] || id;
  });

  const animMap: Record<string, string> = {
    "minimal":   "no animations — static, instant-load",
    "moderate":  "subtle fade-ins on scroll, smooth hover transitions",
    "rich":      "scroll-triggered animations, parallax, engaging micro-interactions",
    "ai-decide": "appropriate animations for the chosen style",
  };

  const layoutMap: Record<string, string> = {
    "traditional": "sidebar navigation on larger screens, classic layout",
    "modern":      "full-width sections, horizontal top nav, large heroes",
    "minimal-l":   "ultra-minimal layout, centered content, max 720px content width",
    "ai-decide":   "the layout that best suits the style and business type",
  };

  const mobileMap: Record<string, string> = {
    "mobile-first": "design mobile-first; desktop is an enhancement",
    "equal":        "equal priority for desktop and mobile — balanced breakpoints",
    "desktop":      "desktop-optimized, with a clean mobile fallback",
    "ai-decide":    "appropriate mobile strategy for the business type",
  };

  const speedMap: Record<string, string> = {
    "fast":      "minimal images and animations to maximize performance",
    "balanced":  "good balance of visuals and performance",
    "rich":      "rich visuals; performance is secondary to appearance",
    "ai-decide": "appropriate speed/visual balance",
  };

  return `Create a complete, professional, production-ready Next.js website for a ${f.business.type.toLowerCase()} business.

════════════════════════════════════════════════
BUSINESS DETAILS
════════════════════════════════════════════════
Business name: ${f.business.name}
Business type: ${f.business.type}
Description: ${f.business.description}${f.business.targetAudience ? `\nTarget audience: ${f.business.targetAudience}` : ""}${f.business.location ? `\nLocation: ${f.business.location}` : ""}${f.business.ownerName ? `\nOwner/contact name: ${f.business.ownerName}` : ""}

════════════════════════════════════════════════
DESIGN & VISUAL IDENTITY
════════════════════════════════════════════════
Design style: ${styleMap[f.design.style] || f.design.style}
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
Animations: ${animMap[f.features.animations] || f.features.animations}
Layout preference: ${layoutMap[f.features.layout] || f.features.layout}
Mobile strategy: ${mobileMap[f.features.mobileOptimization] || f.features.mobileOptimization}
Speed priority: ${speedMap[f.features.speedPriority] || f.features.speedPriority}
${f.features.additionalNotes ? `\nAdditional notes from client:\n${f.features.additionalNotes}` : ""}

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
    const body = await request.json();
    const { formData, userId } = body as { formData: WizardData; userId: string };

    if (!formData || !userId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const siteName = formData.business.name;
    if (!siteName || !formData.business.description) {
      return NextResponse.json({ error: "Business name and description are required" }, { status: 400 });
    }

    const prompt = buildPrompt(formData);
    console.log("Starting site generation for:", siteName);

    console.log("Calling Claude API...");
    const websiteCode = await generateWebsiteCode(prompt);
    console.log("✅ Code generated");

    const repoName = `website-${userId}-${Date.now()}`;
    console.log("Creating GitHub repo:", repoName);
    const repo = await createGitHubRepository(repoName, `AI-generated website: ${siteName}`);
    console.log("✅ GitHub repo created:", repo.html_url);

    console.log("Pushing code to GitHub...");
    await pushCodeToGitHub(repo.owner, repo.name, websiteCode);
    console.log("✅ Code pushed to GitHub");

    console.log("Deploying to Vercel...");
    const deployment = await deployToVercel(repoName, websiteCode);
    console.log("✅ Deployment started:", deployment.url);

    return NextResponse.json({
      success: true,
      siteUrl: `https://${deployment.url}`,
      githubUrl: repo.html_url,
      repoName: repo.name,
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
