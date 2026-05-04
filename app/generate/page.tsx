"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const STYLES = [
  {
    id: "minimalist",
    name: "Minimalist",
    description: "Clean, spacious, nothing wasted",
    prompt: "minimalist design: white backgrounds, generous whitespace, thin typography, subtle borders, no decorative elements",
    preview: (
      <div className="h-24 bg-white border border-gray-100 p-3 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <div className="h-1.5 w-10 bg-gray-300 rounded-full" />
          <div className="flex gap-1.5">
            <div className="h-1 w-5 bg-gray-200 rounded-full" />
            <div className="h-1 w-5 bg-gray-200 rounded-full" />
          </div>
        </div>
        <div>
          <div className="h-2.5 w-24 bg-gray-800 rounded-full mb-1.5" />
          <div className="h-1 w-16 bg-gray-200 rounded-full mb-2.5" />
          <div className="h-5 w-14 border border-gray-800 rounded" />
        </div>
      </div>
    ),
  },
  {
    id: "bold",
    name: "Bold & Dark",
    description: "High contrast, strong statements",
    prompt: "bold dark design: black or very dark backgrounds, large impactful typography, strong contrast, white text on dark surfaces, minimal color accents",
    preview: (
      <div className="h-24 bg-gray-950 p-3 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <div className="h-1.5 w-10 bg-white rounded-full" />
          <div className="flex gap-1.5">
            <div className="h-1 w-5 bg-gray-600 rounded-full" />
            <div className="h-1 w-5 bg-gray-600 rounded-full" />
          </div>
        </div>
        <div>
          <div className="h-3 w-20 bg-white rounded-full mb-1.5" />
          <div className="h-1.5 w-14 bg-gray-600 rounded-full mb-2.5" />
          <div className="h-5 w-14 bg-white rounded" />
        </div>
      </div>
    ),
  },
  {
    id: "corporate",
    name: "Corporate",
    description: "Professional, structured, trustworthy",
    prompt: "corporate professional design: navy or deep blue palette, structured grid layouts, clean sans-serif typography, conveying trust and authority",
    preview: (
      <div className="h-24 bg-slate-700 p-3 flex flex-col justify-between">
        <div className="flex items-center justify-between bg-slate-800 -mx-3 -mt-3 px-3 py-1.5 mb-2">
          <div className="h-1.5 w-10 bg-white rounded-full" />
          <div className="flex gap-1.5">
            <div className="h-1 w-5 bg-slate-500 rounded-full" />
            <div className="h-1 w-5 bg-slate-500 rounded-full" />
            <div className="h-1 w-5 bg-slate-500 rounded-full" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-1.5 flex-1">
          <div className="bg-slate-600 rounded col-span-2 p-1.5">
            <div className="h-2 w-12 bg-white rounded-full mb-1" />
            <div className="h-1 w-8 bg-slate-400 rounded-full" />
          </div>
          <div className="bg-blue-600 rounded" />
        </div>
      </div>
    ),
  },
  {
    id: "creative",
    name: "Creative",
    description: "Vibrant, expressive, memorable",
    prompt: "creative expressive design: bold gradients (purple to blue or pink to orange), playful but purposeful layouts, vibrant colors, dynamic sections with varied backgrounds",
    preview: (
      <div className="h-24 p-3 flex flex-col justify-between" style={{ background: "linear-gradient(135deg, #7c3aed 0%, #db2777 100%)" }}>
        <div className="flex items-center justify-between">
          <div className="h-1.5 w-10 bg-white rounded-full" />
          <div className="flex gap-1.5">
            <div className="h-1 w-5 bg-white/40 rounded-full" />
            <div className="h-1 w-5 bg-white/40 rounded-full" />
          </div>
        </div>
        <div>
          <div className="h-3 w-20 bg-white rounded-full mb-1.5" />
          <div className="h-1.5 w-14 bg-white/50 rounded-full mb-2.5" />
          <div className="h-5 w-14 bg-white rounded-full" />
        </div>
      </div>
    ),
  },
  {
    id: "elegant",
    name: "Elegant",
    description: "Refined, premium, timeless",
    prompt: "elegant luxury design: warm cream or off-white backgrounds (#faf8f5), thin serif or refined sans-serif typography, gold or warm bronze accents, generous spacing, premium feel",
    preview: (
      <div className="h-24 p-3 flex flex-col justify-between" style={{ backgroundColor: "#faf8f5" }}>
        <div className="flex items-center justify-between border-b border-stone-200 pb-1.5">
          <div className="h-1.5 w-10 rounded-full" style={{ backgroundColor: "#a67c52" }} />
          <div className="flex gap-2">
            <div className="h-1 w-4 bg-stone-300 rounded-full" />
            <div className="h-1 w-4 bg-stone-300 rounded-full" />
            <div className="h-1 w-4 bg-stone-300 rounded-full" />
          </div>
        </div>
        <div className="text-center">
          <div className="h-2 w-16 bg-stone-800 rounded-full mb-1.5 mx-auto" />
          <div className="h-1 w-10 bg-stone-300 rounded-full mb-2 mx-auto" />
          <div className="h-4 w-12 border rounded mx-auto" style={{ borderColor: "#a67c52" }} />
        </div>
      </div>
    ),
  },
];

const FONTS = [
  {
    id: "modern-sans",
    name: "Modern Sans",
    description: "Clean & geometric",
    prompt: "modern geometric sans-serif typography (similar to Inter or Helvetica Neue)",
    sample: "Aa",
    style: { fontFamily: "ui-sans-serif, system-ui, -apple-system, sans-serif", fontWeight: 400 },
  },
  {
    id: "classic-serif",
    name: "Classic Serif",
    description: "Trustworthy & traditional",
    prompt: "classic serif typography (similar to Georgia or Playfair Display), elegant and trustworthy",
    sample: "Aa",
    style: { fontFamily: "Georgia, 'Times New Roman', serif", fontWeight: 400 },
  },
  {
    id: "bold-display",
    name: "Bold Display",
    description: "Impactful & confident",
    prompt: "bold heavy display typography with strong visual weight and impact",
    sample: "Aa",
    style: { fontFamily: "ui-sans-serif, system-ui, sans-serif", fontWeight: 900 },
  },
  {
    id: "mono-tech",
    name: "Mono / Tech",
    description: "Precise & technical",
    prompt: "monospace or technical typography (similar to JetBrains Mono or Courier), giving a precise, developer-friendly feel",
    sample: "Aa",
    style: { fontFamily: "ui-monospace, 'Cascadia Code', 'Source Code Pro', monospace", fontWeight: 400 },
  },
];

const PAGES = [
  { id: "home", label: "Home", required: true },
  { id: "about", label: "About Us" },
  { id: "services", label: "Services" },
  { id: "portfolio", label: "Portfolio" },
  { id: "pricing", label: "Pricing" },
  { id: "team", label: "Team" },
  { id: "contact", label: "Contact" },
  { id: "faq", label: "FAQ" },
  { id: "blog", label: "Blog" },
  { id: "testimonials", label: "Testimonials" },
];

const BUSINESS_TYPES = [
  "Restaurant", "Hair Salon", "Photography", "Dental", "Consulting",
  "E-commerce", "Real Estate", "Fitness", "Law Firm", "Architecture",
  "Plumbing", "Accounting", "Marketing Agency", "Medical Clinic", "Other",
];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <span className="text-xs font-semibold tracking-widest text-gray-400 uppercase">{children}</span>
      <div className="flex-1 h-px bg-gray-100" />
    </div>
  );
}

export default function GeneratePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [siteName, setSiteName] = useState("");
  const [businessType, setBusinessType] = useState("Restaurant");
  const [description, setDescription] = useState("");
  const [selectedStyle, setSelectedStyle] = useState(STYLES[0].id);
  const [selectedFont, setSelectedFont] = useState(FONTS[0].id);
  const [selectedPages, setSelectedPages] = useState<string[]>(["home", "about", "contact"]);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [stage, setStage] = useState("");

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) router.push("/login");
  }, [router]);

  const togglePage = (id: string) => {
    if (id === "home") return;
    setSelectedPages((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setLogoPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const buildPrompt = () => {
    const style = STYLES.find((s) => s.id === selectedStyle)!;
    const font = FONTS.find((f) => f.id === selectedFont)!;
    const pageLabels = selectedPages.map((id) => PAGES.find((p) => p.id === id)!.label);

    return `Create a professional ${businessType.toLowerCase()} website for: ${siteName}

Business description: ${description}

DESIGN REQUIREMENTS:
- Style: ${style.prompt}
- Typography: ${font.prompt}
- Color scheme: choose colors that match the "${style.name}" aesthetic

PAGES TO INCLUDE (create a multi-section single-page layout covering all of these, or use navigation links between sections):
${pageLabels.map((p) => `- ${p}`).join("\n")}

${logoFile ? `LOGO: The client has a logo. Include a prominent [LOGO] placeholder in the navigation/header where their logo image will be placed.` : ""}

TECHNICAL REQUIREMENTS:
- Fully responsive (mobile, tablet, desktop)
- Use inline styles or a style tag for all CSS (no external stylesheets or Tailwind)
- Include realistic placeholder content appropriate for a ${businessType.toLowerCase()}
- Smooth hover effects and transitions
- Professional production-ready quality
- Single default export React component`;
  };

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!siteName || !description) {
      setError("Please fill in the site name and description.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const userId = localStorage.getItem("userId");
      setStage("Generating your website with AI...");
      const prompt = buildPrompt();

      const response = await fetch("/api/generate-site", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, siteName, userId }),
      });

      setStage("Deploying to Vercel...");

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Generation failed");
      }

      const data = await response.json();

      const sites = JSON.parse(localStorage.getItem("sites") || "[]");
      sites.push({
        id: data.repoName,
        name: siteName,
        url: data.siteUrl,
        githubUrl: data.githubUrl,
        status: "deployed",
        createdAt: new Date().toISOString(),
      });
      localStorage.setItem("sites", JSON.stringify(sites));

      router.push(`/success/${data.repoName}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
      setStage("");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-sm font-semibold tracking-tight">WebBuilder</Link>
          <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Dashboard</Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 pt-32 pb-24">
        <div className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Create your website</h1>
          <p className="text-gray-500 mt-2 text-sm">Fill in the details below — the more specific you are, the better the result.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-16">
          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-100 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          {/* Business Info */}
          <div>
            <SectionLabel>Business</SectionLabel>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Website name</label>
                  <input
                    type="text"
                    value={siteName}
                    onChange={(e) => setSiteName(e.target.value)}
                    placeholder="e.g. Bloom Dental"
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-colors"
                    required
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Business type</label>
                  <select
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-colors bg-white"
                    disabled={loading}
                  >
                    {BUSINESS_TYPES.map((t) => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Describe your business</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell us what you do, who your customers are, what makes you different, where you're located, and anything else that matters..."
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-colors resize-none h-28"
                  required
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* Style */}
          <div>
            <SectionLabel>Style</SectionLabel>
            <div className="grid grid-cols-5 gap-3">
              {STYLES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSelectedStyle(s.id)}
                  className={`text-left rounded-lg border-2 overflow-hidden transition-all ${
                    selectedStyle === s.id
                      ? "border-gray-900 shadow-sm"
                      : "border-gray-200 hover:border-gray-400"
                  }`}
                >
                  {s.preview}
                  <div className="p-2.5 bg-white">
                    <p className="text-xs font-semibold text-gray-900">{s.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5 leading-tight">{s.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Typography */}
          <div>
            <SectionLabel>Typography</SectionLabel>
            <div className="grid grid-cols-4 gap-3">
              {FONTS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setSelectedFont(f.id)}
                  className={`text-left rounded-lg border-2 overflow-hidden transition-all ${
                    selectedFont === f.id
                      ? "border-gray-900 shadow-sm"
                      : "border-gray-200 hover:border-gray-400"
                  }`}
                >
                  <div className="h-20 bg-gray-50 flex items-center justify-center">
                    <span style={{ ...f.style, fontSize: "2rem", color: "#111" }}>{f.sample}</span>
                  </div>
                  <div className="p-2.5 bg-white">
                    <p className="text-xs font-semibold text-gray-900">{f.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{f.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Pages */}
          <div>
            <SectionLabel>Pages</SectionLabel>
            <div className="grid grid-cols-5 gap-2">
              {PAGES.map((p) => {
                const selected = selectedPages.includes(p.id);
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => togglePage(p.id)}
                    disabled={p.required}
                    className={`py-2.5 px-3 rounded-md border text-xs font-medium transition-all ${
                      selected
                        ? "bg-gray-900 text-white border-gray-900"
                        : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                    } ${p.required ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
                  >
                    {p.label}
                    {p.required && <span className="ml-1 text-gray-400 font-normal text-xs">(req.)</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Logo */}
          <div>
            <SectionLabel>Logo</SectionLabel>
            <div className="flex items-start gap-6">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-28 h-28 border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 transition-colors flex-shrink-0 overflow-hidden"
              >
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo preview" className="w-full h-full object-contain p-2" />
                ) : (
                  <>
                    <svg className="w-6 h-6 text-gray-300 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    <span className="text-xs text-gray-400">Upload</span>
                  </>
                )}
              </div>
              <div className="pt-1">
                <p className="text-sm font-medium text-gray-900 mb-1">Upload your logo <span className="text-gray-400 font-normal">(optional)</span></p>
                <p className="text-xs text-gray-500 leading-relaxed mb-3">
                  PNG, SVG, or JPG. If you upload a logo, AI will place it in the navigation and note the colors for a matching design.
                </p>
                {logoFile ? (
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-700 font-medium">{logoFile.name}</span>
                    <button
                      type="button"
                      onClick={() => { setLogoFile(null); setLogoPreview(null); }}
                      className="text-xs text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs text-gray-900 underline hover:no-underline"
                  >
                    Choose file
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="border-t border-gray-100 pt-8">
            {loading && (
              <div className="mb-6">
                <div className="w-full h-0.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gray-900 rounded-full animate-pulse" style={{ width: "60%" }} />
                </div>
                <p className="text-xs text-gray-500 mt-2">{stage}</p>
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gray-900 text-white text-sm font-medium py-3.5 rounded-md hover:bg-gray-700 transition-colors disabled:opacity-40"
            >
              {loading ? "Generating..." : "Generate my website"}
            </button>
            <p className="text-xs text-gray-400 text-center mt-3">Takes about 60–90 seconds.</p>
          </div>
        </form>
      </div>
    </div>
  );
}
