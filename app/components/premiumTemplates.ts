// ─── Premium design registry ──────────────────────────────────────────────
// Prebuilt premium designs served from /public/preset-sites/<slug>/index.html.
// Source packs (Vite/React) live outside the repo; only built bundles ship.

export type PremiumMapTo = {
  businessType: string;
  style: string;
  primaryColor: string;
  secondaryColor: string;
  darkMode: boolean;
  fontFamily: string;
};

export type PremiumTemplate = {
  id: string;       // wizard templateId (the design slug)
  slug: string;     // folder under /preset-sites/
  name: string;
  category: string; // must match TemplateGallery categories
  tagline: string;
  accent: string;
  dark: boolean;
  mapTo: PremiumMapTo;
};

function p(
  slug: string,
  name: string,
  tagline: string,
  category: string,
  accent: string,
  dark: boolean,
  style: string = dark ? "futuristic" : "modern-clean",
  businessType: string = "Other",
  fontFamily: string = "modern-sans"
): PremiumTemplate {
  return {
    id: slug,
    slug,
    name,
    category,
    tagline,
    accent,
    dark,
    mapTo: {
      businessType,
      style,
      primaryColor: accent,
      secondaryColor: dark ? "#0a0a0f" : "#15161a",
      darkMode: dark,
      fontFamily,
    },
  };
}

export const PREMIUM_TEMPLATES: PremiumTemplate[] = [
  p("acreage-nike",         "Acreage",          "Spotlight hero — sport & lifestyle brands",   "Creative",   "#d4ff3f", true, "bold-dark"),
  p("asme",                 "Asme",             "Curiosity studio — bold creative work",       "Creative",   "#ff5630", true, "creative"),
  p("aurora-signup",        "Aurora",           "Aurora gradients — product sign-ups",         "Technology", "#7a5cff", true, undefined, "Tech Startup"),
  p("auto-machines",        "Auto Machines",    "Industrial automation — heavy tech",          "Technology", "#ffb02e", true, undefined, "Tech Startup"),
  p("axion-studio",         "Axion Studio",     "Motion-first — creative studios",             "Creative",   "#8b5cf6", true, "creative"),
  p("baby-track-automation","Baby Track",       "Business automation — friendly SaaS",         "Technology", "#5c8bff", false, undefined, "Tech Startup"),
  p("bionova",              "Bionova",          "Biotech consulting — science & health",       "Healthcare", "#4ade80", true, undefined, "Medical Clinic"),
  p("brandly-agency",       "Brandly Agency",   "Fullscreen video hero — brand agencies",      "Creative",   "#1a1a1a", false, "creative"),
  p("brandly",              "Brandly",          "Brands that resonate — warm agency",          "Creative",   "#e0532f", false, "creative"),
  p("cinematic-cloud",      "Cinematic Cloud",  "Dark video hero — film & media",              "Media",      "#64cefb", true),
  p("cinematic-stream",     "Framecast",        "Cinematic streaming — video platforms",       "Media",      "#ff3d5a", true),
  p("cognitra",             "Cognitra",         "AI agency — intelligent products",            "Technology", "#62ffae", true, undefined, "Tech Startup", "space-grotesk"),
  p("datacore",             "Datacore",         "Hotel booking video hero — hospitality",      "Property",   "#c9a96e", true, "elegant"),
  p("designpro",            "DesignPro",        "Product design education — courses",          "Education",  "#6e3aff", false),
  p("ecovolta",             "EcoVolta",         "Renewable power — green energy",              "Technology", "#3ddc84", true),
  p("equilibrium",          "Equilibrium",      "Calming, balanced — wellness brands",         "Wellness",   "#7a8a6a", false, "warm"),
  p("foundation-epoch",     "Foundation Epoch", "Digital epoch — future-facing tech",          "Technology", "#ff5a00", true, undefined, "Tech Startup"),
  p("gsap-pill-nav",        "Arc Pace",         "Animated pill nav — modern landings",         "Creative",   "#ffd166", true, "creative"),
  p("guardnet",             "Guardnet",         "Security & privacy — trust-first",            "Technology", "#4ade80", true, undefined, "Tech Startup", "mono"),
  p("halo-usd",             "Halo",             "Fintech halo — payments & finance",           "Technology", "#f5c542", true, undefined, "Tech Startup"),
  p("jack-3d-creator",      "Jack 3D",          "3D creator portfolio — makers",               "Creative",   "#ff4d6d", true, "creative"),
  p("linkflow",             "LinkFlow",         "Boomerang video hero — link tools",           "Technology", "#5c8bff", true, undefined, "Tech Startup"),
  p("lumina",               "Lumina",           "Video hero, glass footer — premium feel",     "Media",      "#e8e4da", true, "elegant"),
  p("max-reed",             "Max Reed",         "Personal portfolio — features grid",          "Creative",   "#1f1fbf", false, "minimalist"),
  p("metricx-studio",       "MetricX",          "Creative studio hero — agencies",             "Creative",   "#ff5630", true, "creative"),
  p("micro-organized",      "Micro Workspace",  "Organized, minimal — productivity",           "Technology", "#0d9a44", false, "minimalist", "Tech Startup"),
  p("mindloop",             "Mindloop",         "Newsletter-first — writers & media",          "Media",      "#ff8b66", false, "warm"),
  p("power-ai",             "Power AI",         "Dark video hero — AI products",               "Technology", "#a8ff5c", true, undefined, "Tech Startup", "space-grotesk"),
  p("pureflow-one",         "PureFlow One",     "Spotlight reveal — single product",           "Technology", "#64cefb", true, undefined, "Tech Startup"),
  p("reposit-solar",        "Reposit",          "Solar energy hero — clean power",             "Technology", "#ffd166", false),
  p("rivr-defi",            "RIVR",             "DeFi dashboard hero — web3 finance",          "Technology", "#62ffae", true, undefined, "Tech Startup", "space-grotesk"),
  p("rivr-fluid",           "Cascade Fluid",    "Glass DeFi hero — fluid gradients",           "Technology", "#7a5cff", true, undefined, "Tech Startup", "space-grotesk"),
  p("securify",             "Securify",         "Data security — sharp and technical",         "Technology", "#4ade80", true, undefined, "Tech Startup", "mono"),
  p("stellar-ai",           "Stellar.ai",       "Tabbed video hero — AI platforms",            "Technology", "#8b5cf6", true, undefined, "Tech Startup"),
  p("stretch-beauty",       "Stretch",          "Ethical beauty — clean cosmetics",            "Beauty",     "#e9a1a1", false, "elegant"),
  p("targo-logistics",      "Targo",            "Swift, simple — transport & logistics",       "Property",   "#ff5e00", false),
  p("terra-geo",            "Terra",            "Geo map builder — location products",         "Technology", "#0a8094", true, undefined, "Tech Startup"),
  p("toonhub",              "ToonHub",          "Playful, animated — entertainment",           "Media",      "#ff4d6d", false, "playful"),
  p("transform-data",       "Transform Data",   "Data platform — pipelines & insight",         "Technology", "#2253ff", true, undefined, "Tech Startup"),
  p("ui-rocket",            "UI Rocket",        "Parallax hero — product landings",            "Technology", "#ff5a3c", true, undefined, "Tech Startup"),
  p("unleash-scroll-hero",  "Unleash",          "Scroll-driven HLS hero — max impact",         "Media",      "#ff3d5a", true),
  p("vaultshield",          "VaultShield",      "Password manager — security SaaS",            "Technology", "#62ffae", true, undefined, "Tech Startup", "mono"),
  p("velorah",              "Velorah",          "Electric RV — adventure mobility",            "Automotive", "#3ddc84", true),
  p("velorix",              "Velorix",          "Precision automation — robotics",             "Technology", "#f5c542", true, undefined, "Tech Startup"),
  p("viralmedia-ai",        "ViralMedia",       "AI web design — bold agency",                 "Creative",   "#ff5630", true, "creative"),
  p("wanderful",            "Wanderful",        "Roam without borders — travel",               "Media",      "#0a8094", false, "warm"),
  p("web3-eos",             "Web3 EOS",         "Speed of experience — web3 infra",            "Technology", "#62ffae", true, undefined, "Tech Startup", "space-grotesk"),
  p("zenith-realty",        "Zenith Realty",    "Luxury real estate — high-end listings",      "Property",   "#c9a96e", true, "elegant", "Real Estate", "luxury-serif"),
];

export const premiumPreviewPath = (slug: string) => `/preset-sites/${slug}/index.html`;
