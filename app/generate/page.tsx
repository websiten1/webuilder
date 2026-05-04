"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const STYLES = [
  {
    id: "minimalist",
    name: "Minimalist",
    description: "Clean & spacious",
    prompt: "minimalist design: white backgrounds, generous whitespace, thin typography, subtle borders, no decorative elements",
    preview: (
      <div style={{ height: 88, background: "#fff", padding: 10, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ height: 5, width: 36, background: "#d1d5db", borderRadius: 99 }} />
          <div style={{ display: "flex", gap: 5 }}>
            <div style={{ height: 3, width: 18, background: "#e5e7eb", borderRadius: 99 }} />
            <div style={{ height: 3, width: 18, background: "#e5e7eb", borderRadius: 99 }} />
          </div>
        </div>
        <div>
          <div style={{ height: 8, width: 80, background: "#1f2937", borderRadius: 99, marginBottom: 5 }} />
          <div style={{ height: 3, width: 55, background: "#e5e7eb", borderRadius: 99, marginBottom: 9 }} />
          <div style={{ height: 18, width: 48, border: "1px solid #374151", borderRadius: 4 }} />
        </div>
      </div>
    ),
  },
  {
    id: "bold",
    name: "Bold & Dark",
    description: "High contrast",
    prompt: "bold dark design: near-black backgrounds, large impactful typography, strong contrast, white text on dark surfaces",
    preview: (
      <div style={{ height: 88, background: "#0a0a0a", padding: 10, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ height: 5, width: 36, background: "#fff", borderRadius: 99 }} />
          <div style={{ display: "flex", gap: 5 }}>
            <div style={{ height: 3, width: 16, background: "#4b5563", borderRadius: 99 }} />
            <div style={{ height: 3, width: 16, background: "#4b5563", borderRadius: 99 }} />
          </div>
        </div>
        <div>
          <div style={{ height: 10, width: 70, background: "#fff", borderRadius: 99, marginBottom: 5 }} />
          <div style={{ height: 4, width: 50, background: "#374151", borderRadius: 99, marginBottom: 9 }} />
          <div style={{ height: 18, width: 48, background: "#fff", borderRadius: 4 }} />
        </div>
      </div>
    ),
  },
  {
    id: "corporate",
    name: "Corporate",
    description: "Professional",
    prompt: "corporate professional design: navy palette, structured grid layouts, clean sans-serif, conveying trust and authority",
    preview: (
      <div style={{ height: 88, background: "#1e3a5f", padding: 0, display: "flex", flexDirection: "column" }}>
        <div style={{ background: "#152c4a", padding: "6px 10px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ height: 5, width: 32, background: "#fff", borderRadius: 99 }} />
          <div style={{ display: "flex", gap: 4 }}>
            <div style={{ height: 3, width: 14, background: "#4a7da8", borderRadius: 99 }} />
            <div style={{ height: 3, width: 14, background: "#4a7da8", borderRadius: 99 }} />
            <div style={{ height: 3, width: 14, background: "#4a7da8", borderRadius: 99 }} />
          </div>
        </div>
        <div style={{ flex: 1, display: "grid", gridTemplateColumns: "2fr 1fr", gap: 5, padding: "8px 10px" }}>
          <div style={{ background: "#244870", borderRadius: 4, padding: 6 }}>
            <div style={{ height: 6, width: 44, background: "#fff", borderRadius: 99, marginBottom: 4 }} />
            <div style={{ height: 3, width: 30, background: "#4a7da8", borderRadius: 99 }} />
          </div>
          <div style={{ background: "#2563eb", borderRadius: 4 }} />
        </div>
      </div>
    ),
  },
  {
    id: "creative",
    name: "Creative",
    description: "Vibrant & bold",
    prompt: "creative expressive design: bold gradients purple to blue or pink to orange, playful but purposeful layouts, vibrant colors, dynamic sections",
    preview: (
      <div style={{ height: 88, background: "linear-gradient(135deg,#7c3aed,#db2777)", padding: 10, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ height: 5, width: 36, background: "#fff", borderRadius: 99 }} />
          <div style={{ display: "flex", gap: 5 }}>
            <div style={{ height: 3, width: 16, background: "rgba(255,255,255,0.4)", borderRadius: 99 }} />
            <div style={{ height: 3, width: 16, background: "rgba(255,255,255,0.4)", borderRadius: 99 }} />
          </div>
        </div>
        <div>
          <div style={{ height: 10, width: 70, background: "#fff", borderRadius: 99, marginBottom: 5 }} />
          <div style={{ height: 4, width: 50, background: "rgba(255,255,255,0.4)", borderRadius: 99, marginBottom: 9 }} />
          <div style={{ height: 18, width: 48, background: "#fff", borderRadius: 99 }} />
        </div>
      </div>
    ),
  },
  {
    id: "elegant",
    name: "Elegant",
    description: "Refined & warm",
    prompt: "elegant luxury design: warm cream backgrounds (#faf8f5), refined typography, gold or warm bronze accents, generous spacing, premium feel",
    preview: (
      <div style={{ height: 88, background: "#faf8f5", padding: 10, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #e7e0d8", paddingBottom: 6 }}>
          <div style={{ height: 5, width: 36, background: "#a67c52", borderRadius: 99 }} />
          <div style={{ display: "flex", gap: 6 }}>
            <div style={{ height: 3, width: 14, background: "#c8b8a2", borderRadius: 99 }} />
            <div style={{ height: 3, width: 14, background: "#c8b8a2", borderRadius: 99 }} />
            <div style={{ height: 3, width: 14, background: "#c8b8a2", borderRadius: 99 }} />
          </div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ height: 6, width: 55, background: "#3d2b1f", borderRadius: 99, margin: "0 auto 5px" }} />
          <div style={{ height: 3, width: 36, background: "#c8b8a2", borderRadius: 99, margin: "0 auto 9px" }} />
          <div style={{ height: 14, width: 40, border: "1px solid #a67c52", borderRadius: 3, margin: "0 auto" }} />
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
    prompt: "modern geometric sans-serif typography (Inter, Helvetica Neue style)",
    sample: "Aa",
    fontStyle: { fontFamily: "ui-sans-serif, system-ui, -apple-system, sans-serif", fontWeight: 400 },
  },
  {
    id: "classic-serif",
    name: "Classic Serif",
    description: "Trustworthy",
    prompt: "classic serif typography (Georgia, Playfair Display style), elegant and trustworthy",
    sample: "Aa",
    fontStyle: { fontFamily: "Georgia, 'Times New Roman', serif", fontWeight: 400 },
  },
  {
    id: "bold-display",
    name: "Bold Display",
    description: "Impactful",
    prompt: "bold heavy display typography with strong visual weight",
    sample: "Aa",
    fontStyle: { fontFamily: "ui-sans-serif, system-ui, sans-serif", fontWeight: 900 },
  },
  {
    id: "mono-tech",
    name: "Mono / Tech",
    description: "Precise & technical",
    prompt: "monospace technical typography (JetBrains Mono, Courier style)",
    sample: "Aa",
    fontStyle: { fontFamily: "ui-monospace, 'Cascadia Code', monospace", fontWeight: 400 },
  },
];

const PAGES = [
  { id: "home",         label: "Home",         required: true },
  { id: "about",        label: "About Us" },
  { id: "services",     label: "Services" },
  { id: "portfolio",    label: "Portfolio" },
  { id: "pricing",      label: "Pricing" },
  { id: "team",         label: "Team" },
  { id: "contact",      label: "Contact" },
  { id: "faq",          label: "FAQ" },
  { id: "blog",         label: "Blog" },
  { id: "testimonials", label: "Testimonials" },
];

const BUSINESS_TYPES = [
  "Restaurant", "Hair Salon", "Photography", "Dental", "Consulting",
  "E-commerce", "Real Estate", "Fitness", "Law Firm", "Architecture",
  "Plumbing", "Accounting", "Marketing Agency", "Medical Clinic", "Other",
];

const STAGE_MESSAGES: Record<number, string> = {
  100: "Starting generation...",
  85:  "AI is writing your code...",
  60:  "Crafting your design...",
  40:  "Pushing to GitHub...",
  25:  "Vercel is building...",
  10:  "Almost live...",
  0:   "Going live now...",
};

function SectionDivider({ label }: { label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
      <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text3)" }}>
        {label}
      </span>
      <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
    </div>
  );
}

export default function GeneratePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [siteName,      setSiteName]      = useState("");
  const [businessType,  setBusinessType]  = useState("Restaurant");
  const [description,   setDescription]   = useState("");
  const [selectedStyle, setSelectedStyle] = useState(STYLES[0].id);
  const [selectedFont,  setSelectedFont]  = useState(FONTS[0].id);
  const [selectedPages, setSelectedPages] = useState<string[]>(["home", "about", "contact"]);
  const [logoFile,      setLogoFile]      = useState<File | null>(null);
  const [logoPreview,   setLogoPreview]   = useState<string | null>(null);
  const [loading,       setLoading]       = useState(false);
  const [error,         setError]         = useState("");
  const [countdown,     setCountdown]     = useState(100);
  const [stageMsg,      setStageMsg]      = useState("");

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) router.push("/login");
  }, [router]);

  useEffect(() => {
    if (!loading) { setCountdown(100); setStageMsg(""); return; }

    setCountdown(100);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        const next = prev > 0 ? prev - 1 : 0;
        const key = Object.keys(STAGE_MESSAGES)
          .map(Number)
          .sort((a, b) => b - a)
          .find((k) => next <= k);
        if (key !== undefined) setStageMsg(STAGE_MESSAGES[key]);
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [loading]);

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
    const font  = FONTS.find((f) => f.id === selectedFont)!;
    const pages = selectedPages.map((id) => PAGES.find((p) => p.id === id)!.label);

    return `Create a professional ${businessType.toLowerCase()} website for: ${siteName}

Business description: ${description}

DESIGN:
- Style: ${style.prompt}
- Typography: ${font.prompt}

PAGES (create sections or navigation for all of these):
${pages.map((p) => `- ${p}`).join("\n")}

${logoFile ? "LOGO: Include a [LOGO] placeholder in the header/navigation where the client's logo will go." : ""}

TECHNICAL:
- Fully responsive (mobile, tablet, desktop)
- Use inline styles or a <style> tag — no external CSS or Tailwind
- Realistic placeholder content for a ${businessType.toLowerCase()}
- Smooth hover effects and transitions
- Production-ready quality
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
      const response = await fetch("/api/generate-site", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: buildPrompt(), siteName, userId }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Generation failed");
      }

      const data = await response.json();
      const sites = JSON.parse(localStorage.getItem("sites") || "[]");
      sites.push({
        id: data.repoName, name: siteName, url: data.siteUrl,
        githubUrl: data.githubUrl, status: "deployed", createdAt: new Date().toISOString(),
      });
      localStorage.setItem("sites", JSON.stringify(sites));
      router.push(`/success/${data.repoName}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const progressPct = loading ? Math.round(((100 - countdown) / 100) * 100) : 0;

  return (
    <div style={{ background: "#050510", minHeight: "100vh", color: "#fff" }}>
      <nav className="fixed top-0 left-0 right-0 z-50 glass"
        style={{ borderTop: "none", borderLeft: "none", borderRight: "none" }}>
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-bold tracking-tight text-sm">WebBuilder</Link>
          <Link href="/dashboard" className="text-sm" style={{ color: "var(--text2)" }}>Dashboard</Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 pt-32 pb-24">
        <div className="mb-12">
          <h1 className="font-bold tracking-tight mb-2" style={{ fontSize: "2rem" }}>Describe your business</h1>
          <p className="text-sm" style={{ color: "var(--text2)" }}>
            The more specific you are, the better the result.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 48 }}>
          {error && (
            <div className="text-sm px-4 py-3 rounded-xl"
              style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#fca5a5" }}>
              {error}
            </div>
          )}

          {/* Business info */}
          <div>
            <SectionDivider label="Business" />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text2)" }}>Website name</label>
                <input
                  type="text"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  placeholder="e.g. Bloom Dental"
                  className="inp"
                  required
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text2)" }}>Business type</label>
                <select
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                  className="inp"
                  disabled={loading}
                >
                  {BUSINESS_TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text2)" }}>Describe your business</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell us what you do, who your customers are, where you're located, what makes you different..."
                className="inp"
                style={{ height: 112, resize: "none" }}
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Style */}
          <div>
            <SectionDivider label="Design style" />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 10 }}>
              {STYLES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSelectedStyle(s.id)}
                  style={{
                    textAlign: "left",
                    borderRadius: 12,
                    border: selectedStyle === s.id
                      ? "2px solid var(--accent)"
                      : "2px solid var(--border)",
                    overflow: "hidden",
                    background: "transparent",
                    cursor: "pointer",
                    transition: "border-color 0.2s",
                    boxShadow: selectedStyle === s.id ? "0 0 0 3px rgba(99,102,241,0.15)" : "none",
                  }}
                >
                  {s.preview}
                  <div style={{ padding: "8px 10px", background: "rgba(255,255,255,0.03)", borderTop: "1px solid var(--border)" }}>
                    <p style={{ fontSize: 11, fontWeight: 600, color: "#fff", marginBottom: 2 }}>{s.name}</p>
                    <p style={{ fontSize: 10, color: "var(--text3)" }}>{s.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Typography */}
          <div>
            <SectionDivider label="Typography" />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
              {FONTS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setSelectedFont(f.id)}
                  style={{
                    textAlign: "left",
                    borderRadius: 12,
                    border: selectedFont === f.id
                      ? "2px solid var(--accent)"
                      : "2px solid var(--border)",
                    overflow: "hidden",
                    background: "transparent",
                    cursor: "pointer",
                    transition: "border-color 0.2s",
                    boxShadow: selectedFont === f.id ? "0 0 0 3px rgba(99,102,241,0.15)" : "none",
                  }}
                >
                  <div style={{ height: 72, background: "rgba(255,255,255,0.04)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ ...f.fontStyle, fontSize: "2rem", color: "#fff" }}>{f.sample}</span>
                  </div>
                  <div style={{ padding: "8px 10px", background: "rgba(255,255,255,0.03)", borderTop: "1px solid var(--border)" }}>
                    <p style={{ fontSize: 11, fontWeight: 600, color: "#fff", marginBottom: 2 }}>{f.name}</p>
                    <p style={{ fontSize: 10, color: "var(--text3)" }}>{f.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Pages */}
          <div>
            <SectionDivider label="Pages" />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 8 }}>
              {PAGES.map((p) => {
                const on = selectedPages.includes(p.id);
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => togglePage(p.id)}
                    disabled={p.required}
                    style={{
                      padding: "9px 8px",
                      borderRadius: 8,
                      border: on ? "1px solid var(--accent)" : "1px solid var(--border)",
                      background: on ? "rgba(99,102,241,0.15)" : "transparent",
                      color: on ? "#a5b4fc" : "var(--text2)",
                      fontSize: 12,
                      fontWeight: 500,
                      cursor: p.required ? "not-allowed" : "pointer",
                      opacity: p.required ? 0.5 : 1,
                      transition: "all 0.15s",
                    }}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Logo */}
          <div>
            <SectionDivider label="Logo" />
            <div style={{ display: "flex", alignItems: "flex-start", gap: 20 }}>
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                  width: 96, height: 96, flexShrink: 0,
                  border: "2px dashed var(--border)",
                  borderRadius: 12,
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  cursor: "pointer",
                  overflow: "hidden",
                  transition: "border-color 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--border-h)")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
              >
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo" style={{ width: "100%", height: "100%", objectFit: "contain", padding: 8 }} />
                ) : (
                  <>
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                      strokeWidth={1.5} style={{ color: "var(--text3)", marginBottom: 4 }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    <span style={{ fontSize: 10, color: "var(--text3)" }}>Upload</span>
                  </>
                )}
              </div>
              <div style={{ paddingTop: 4 }}>
                <p className="font-medium text-sm mb-1">
                  Upload your logo{" "}
                  <span style={{ color: "var(--text3)", fontWeight: 400 }}>(optional)</span>
                </p>
                <p className="text-xs leading-relaxed mb-3" style={{ color: "var(--text2)" }}>
                  PNG, SVG or JPG. The AI will include a logo placeholder in your navigation.
                </p>
                {logoFile ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span className="text-xs" style={{ color: "var(--text2)" }}>{logoFile.name}</span>
                    <button type="button" onClick={() => { setLogoFile(null); setLogoPreview(null); }}
                      className="text-xs" style={{ color: "#f87171" }}>Remove</button>
                  </div>
                ) : (
                  <button type="button" onClick={() => fileInputRef.current?.click()}
                    className="text-xs underline" style={{ color: "var(--text2)" }}>Choose file</button>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleLogoUpload} style={{ display: "none" }} />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div style={{ borderTop: "1px solid var(--border)", paddingTop: 32 }}>
            {loading && (
              <div style={{ marginBottom: 24 }}>
                {/* Countdown */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <p className="text-sm" style={{ color: "var(--text2)" }}>{stageMsg}</p>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                    <span key={countdown} className="countdown-num font-bold" style={{ fontSize: "1.5rem", color: "var(--accent)" }}>
                      {countdown}
                    </span>
                    <span className="text-xs" style={{ color: "var(--text3)" }}>s</span>
                  </div>
                </div>
                {/* Progress bar */}
                <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 99, overflow: "hidden" }}>
                  <div
                    className="shimmer-bar"
                    style={{
                      height: "100%",
                      width: `${progressPct}%`,
                      background: "linear-gradient(135deg, var(--accent), var(--accent2))",
                      borderRadius: 99,
                      transition: "width 0.8s ease",
                    }}
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full rounded-xl py-4"
              style={{ fontSize: 15 }}
            >
              {loading ? "Generating your website..." : "Generate my website"}
            </button>
            <p className="text-xs text-center mt-3" style={{ color: "var(--text3)" }}>
              Takes approximately 100 seconds.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
