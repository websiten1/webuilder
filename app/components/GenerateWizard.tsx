"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// ─── Types ───────────────────────────────────────────────────────────────────

export type WizardData = {
  business: {
    name: string; type: string; description: string;
    targetAudience: string; location: string; ownerName: string;
  };
  design: {
    style: string; primaryColor: string; secondaryColor: string; darkMode: boolean;
  };
  typography: {
    fontFamily: string; imageryStyle: string; heroPreference: string;
  };
  pages: {
    selected: string[]; primaryCTA: string; contentTone: string;
  };
  features: {
    specialFeatures: string[]; animations: string; layout: string;
    mobileOptimization: string; speedPriority: string; additionalNotes: string;
  };
  logo: { uploaded: boolean; dataUrl: string; fileName: string };
};

const DEFAULT: WizardData = {
  business: { name: "", type: "Restaurant", description: "", targetAudience: "", location: "", ownerName: "" },
  design: { style: "minimalist", primaryColor: "#6366f1", secondaryColor: "#a855f7", darkMode: false },
  typography: { fontFamily: "modern-sans", imageryStyle: "stock-photos", heroPreference: "ai-decide" },
  pages: { selected: ["home", "services", "about", "contact"], primaryCTA: "contact-form", contentTone: "professional-approachable" },
  features: { specialFeatures: [], animations: "moderate", layout: "modern", mobileOptimization: "ai-decide", speedPriority: "balanced", additionalNotes: "" },
  logo: { uploaded: false, dataUrl: "", fileName: "" },
};

// ─── Constants ────────────────────────────────────────────────────────────────

const BUSINESS_TYPES = [
  "Restaurant","Hair Salon","Photography","Dental Clinic","Consulting",
  "E-commerce","Real Estate","Fitness","Law Firm","Architecture",
  "Plumbing","Accounting","Marketing Agency","Medical Clinic",
  "Tech Startup","Beauty/Spa","Other",
];

const STYLES = [
  { id: "minimalist",   name: "Minimalist",         desc: "Clean, spacious, nothing wasted", best: "Modern, premium brands",
    preview: <div style={{height:64,background:"#fff",padding:8,display:"flex",flexDirection:"column",justifyContent:"space-between"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><div style={{height:4,width:28,background:"#d1d5db",borderRadius:99}}/><div style={{display:"flex",gap:4}}><div style={{height:2,width:14,background:"#e5e7eb",borderRadius:99}}/><div style={{height:2,width:14,background:"#e5e7eb",borderRadius:99}}/></div></div>
      <div><div style={{height:7,width:60,background:"#111",borderRadius:99,marginBottom:4}}/><div style={{height:2,width:40,background:"#e5e7eb",borderRadius:99,marginBottom:7}}/><div style={{height:14,width:36,border:"1px solid #374151",borderRadius:3}}/></div>
    </div> },
  { id: "modern-clean", name: "Modern & Clean",      desc: "Contemporary, fresh, spacious",   best: "Tech, services",
    preview: <div style={{height:64,background:"#f0f7ff",padding:8,display:"flex",flexDirection:"column",justifyContent:"space-between"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><div style={{height:4,width:28,background:"#3b82f6",borderRadius:99}}/><div style={{display:"flex",gap:4}}><div style={{height:2,width:14,background:"#bfdbfe",borderRadius:99}}/><div style={{height:2,width:14,background:"#bfdbfe",borderRadius:99}}/></div></div>
      <div><div style={{height:7,width:60,background:"#1e40af",borderRadius:99,marginBottom:4}}/><div style={{height:2,width:40,background:"#bfdbfe",borderRadius:99,marginBottom:7}}/><div style={{height:14,width:36,background:"#3b82f6",borderRadius:6}}/></div>
    </div> },
  { id: "bold-dark",    name: "Bold & Dark",         desc: "High contrast, strong statements",best: "Creative, trendy brands",
    preview: <div style={{height:64,background:"#0a0a0a",padding:8,display:"flex",flexDirection:"column",justifyContent:"space-between"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><div style={{height:4,width:28,background:"#fff",borderRadius:99}}/><div style={{display:"flex",gap:4}}><div style={{height:2,width:14,background:"#374151",borderRadius:99}}/><div style={{height:2,width:14,background:"#374151",borderRadius:99}}/></div></div>
      <div><div style={{height:9,width:60,background:"#fff",borderRadius:99,marginBottom:4}}/><div style={{height:2,width:40,background:"#374151",borderRadius:99,marginBottom:7}}/><div style={{height:14,width:36,background:"#fff",borderRadius:3}}/></div>
    </div> },
  { id: "corporate",    name: "Corporate",           desc: "Trust-focused, authoritative",    best: "Law, finance, consulting",
    preview: <div style={{height:64,background:"#1e3a5f",padding:0,display:"flex",flexDirection:"column"}}>
      <div style={{background:"#152c4a",padding:"4px 8px",display:"flex",alignItems:"center",justifyContent:"space-between"}}><div style={{height:4,width:24,background:"#fff",borderRadius:99}}/><div style={{display:"flex",gap:3}}><div style={{height:2,width:10,background:"#4a7da8",borderRadius:99}}/><div style={{height:2,width:10,background:"#4a7da8",borderRadius:99}}/><div style={{height:2,width:10,background:"#4a7da8",borderRadius:99}}/></div></div>
      <div style={{flex:1,display:"grid",gridTemplateColumns:"2fr 1fr",gap:4,padding:"6px 8px"}}><div style={{background:"#244870",borderRadius:4,padding:4}}><div style={{height:5,width:36,background:"#fff",borderRadius:99,marginBottom:3}}/><div style={{height:2,width:24,background:"#4a7da8",borderRadius:99}}/></div><div style={{background:"#2563eb",borderRadius:4}}/></div>
    </div> },
  { id: "creative",     name: "Creative & Vibrant",  desc: "Colorful, expressive, energetic", best: "Design, marketing agencies",
    preview: <div style={{height:64,background:"linear-gradient(135deg,#7c3aed,#db2777)",padding:8,display:"flex",flexDirection:"column",justifyContent:"space-between"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><div style={{height:4,width:28,background:"#fff",borderRadius:99}}/><div style={{display:"flex",gap:4}}><div style={{height:2,width:14,background:"rgba(255,255,255,0.4)",borderRadius:99}}/><div style={{height:2,width:14,background:"rgba(255,255,255,0.4)",borderRadius:99}}/></div></div>
      <div><div style={{height:9,width:60,background:"#fff",borderRadius:99,marginBottom:4}}/><div style={{height:2,width:40,background:"rgba(255,255,255,0.4)",borderRadius:99,marginBottom:7}}/><div style={{height:14,width:36,background:"#fff",borderRadius:99}}/></div>
    </div> },
  { id: "elegant",      name: "Elegant & Luxury",    desc: "Refined, sophisticated, premium", best: "Fashion, jewelry, high-end",
    preview: <div style={{height:64,background:"#faf8f5",padding:8,display:"flex",flexDirection:"column",justifyContent:"space-between"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:"1px solid #e7e0d8",paddingBottom:4}}><div style={{height:4,width:28,background:"#a67c52",borderRadius:99}}/><div style={{display:"flex",gap:4}}><div style={{height:2,width:12,background:"#c8b8a2",borderRadius:99}}/><div style={{height:2,width:12,background:"#c8b8a2",borderRadius:99}}/><div style={{height:2,width:12,background:"#c8b8a2",borderRadius:99}}/></div></div>
      <div style={{textAlign:"center"}}><div style={{height:6,width:50,background:"#3d2b1f",borderRadius:99,margin:"0 auto 4px"}}/><div style={{height:2,width:32,background:"#c8b8a2",borderRadius:99,margin:"0 auto 7px"}}/><div style={{height:12,width:32,border:"1px solid #a67c52",borderRadius:2,margin:"0 auto"}}/></div>
    </div> },
  { id: "warm",         name: "Warm & Friendly",     desc: "Approachable, welcoming, cozy",   best: "Health, beauty, community",
    preview: <div style={{height:64,background:"#fff8f0",padding:8,display:"flex",flexDirection:"column",justifyContent:"space-between"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><div style={{height:4,width:28,background:"#ea580c",borderRadius:99}}/><div style={{display:"flex",gap:4}}><div style={{height:2,width:14,background:"#fed7aa",borderRadius:99}}/><div style={{height:2,width:14,background:"#fed7aa",borderRadius:99}}/></div></div>
      <div><div style={{height:7,width:60,background:"#9a3412",borderRadius:99,marginBottom:4}}/><div style={{height:2,width:40,background:"#fed7aa",borderRadius:99,marginBottom:7}}/><div style={{height:14,width:36,background:"#ea580c",borderRadius:8}}/></div>
    </div> },
  { id: "futuristic",   name: "High Tech",           desc: "Cutting-edge, innovative, modern",best: "Tech, SaaS, startups",
    preview: <div style={{height:64,background:"#030712",padding:8,display:"flex",flexDirection:"column",justifyContent:"space-between"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><div style={{height:4,width:28,background:"#06b6d4",borderRadius:99,boxShadow:"0 0 6px rgba(6,182,212,0.8)"}}/><div style={{display:"flex",gap:4}}><div style={{height:2,width:14,background:"#164e63",borderRadius:99}}/><div style={{height:2,width:14,background:"#164e63",borderRadius:99}}/></div></div>
      <div><div style={{height:7,width:60,background:"#06b6d4",borderRadius:99,marginBottom:4,boxShadow:"0 0 8px rgba(6,182,212,0.5)"}}/><div style={{height:2,width:40,background:"#164e63",borderRadius:99,marginBottom:7}}/><div style={{height:14,width:36,border:"1px solid #06b6d4",borderRadius:3,boxShadow:"0 0 6px rgba(6,182,212,0.3)"}}/></div>
    </div> },
  { id: "playful",      name: "Playful & Fun",       desc: "Casual, energetic, approachable", best: "Kids, lifestyle, entertainment",
    preview: <div style={{height:64,background:"#fef9c3",padding:8,display:"flex",flexDirection:"column",justifyContent:"space-between"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><div style={{height:4,width:28,background:"#f59e0b",borderRadius:99}}/><div style={{display:"flex",gap:4}}><div style={{height:2,width:14,background:"#fde68a",borderRadius:99}}/><div style={{height:2,width:14,background:"#fde68a",borderRadius:99}}/></div></div>
      <div><div style={{height:9,width:60,background:"#92400e",borderRadius:99,marginBottom:4}}/><div style={{height:2,width:40,background:"#fde68a",borderRadius:99,marginBottom:7}}/><div style={{height:14,width:36,background:"#f59e0b",borderRadius:99}}/></div>
    </div> },
];

const FONTS = [
  { id: "modern-sans",   name: "Modern Sans-Serif", desc: "Clean & contemporary", best: "Tech, modern services",  sample: "Aa",  style: {fontFamily:"ui-sans-serif,system-ui,sans-serif",      fontWeight:400} },
  { id: "classic-serif", name: "Classic Serif",     desc: "Trustworthy & elegant", best: "Law, finance, editorial",sample: "Aa",  style: {fontFamily:"Georgia,'Times New Roman',serif",         fontWeight:400} },
  { id: "geo-bold",      name: "Geometric & Bold",  desc: "Striking & impactful",  best: "Creative, design, startups", sample: "Aa", style: {fontFamily:"ui-sans-serif,system-ui,sans-serif",   fontWeight:900} },
  { id: "mono",          name: "Monospace",         desc: "Technical & precise",   best: "Tech, developer-focused",sample: "Aa",  style: {fontFamily:"ui-monospace,'Cascadia Code',monospace", fontWeight:400} },
  { id: "playful",       name: "Playful & Rounded", desc: "Friendly & casual",     best: "Kids, lifestyle, community", sample: "Aa", style: {fontFamily:"Georgia,sans-serif",                 fontWeight:700, letterSpacing:"0.02em"} },
];

const IMAGERY = [
  { id: "photography",  label: "Photography Heavy",   desc: "Professional photos throughout",   best: "Travel, hospitality, real estate" },
  { id: "illustrations",label: "Illustrations & Icons",desc: "Custom icons and illustrations",   best: "Tech, SaaS, creative services" },
  { id: "minimal-img",  label: "Minimalist",          desc: "Mostly text and solid colors",      best: "B2B, professional, minimalist" },
  { id: "stock-photos", label: "Stock Photos",        desc: "Professional stock imagery",        best: "General, broad appeal" },
  { id: "mixed",        label: "Mixed Style",         desc: "Illustrations + photos combined",   best: "Modern, balanced approach" },
];

const HERO_PREFS = [
  { id: "bg-image",    label: "Background image",         desc: "Full-bleed photo behind content" },
  { id: "gradient",    label: "Gradient background",      desc: "Color gradient, no photo" },
  { id: "overlay",     label: "Image with text overlay",  desc: "Hero photo with text on top" },
  { id: "ai-decide",   label: "Let AI decide",            desc: "Best choice for your style" },
];

const ESSENTIAL_PAGES = [
  { id: "home",     label: "Home",             desc: "Always included", required: true },
  { id: "services", label: "Services/Products",desc: "What you offer",  required: false },
  { id: "about",    label: "About Us",         desc: "Your story",      required: false },
  { id: "contact",  label: "Contact",          desc: "Get in touch",    required: false },
];

const EXTRA_PAGES = [
  { id: "portfolio",  label: "Portfolio/Gallery", desc: "Showcase your work" },
  { id: "pricing",    label: "Pricing/Plans",     desc: "Service pricing" },
  { id: "team",       label: "Team/Staff",        desc: "Meet the team" },
  { id: "faq",        label: "FAQ/Help",          desc: "Common questions" },
  { id: "blog",       label: "Blog/News",         desc: "Articles & updates" },
  { id: "testimonials",label:"Testimonials",      desc: "Customer reviews" },
  { id: "privacy",    label: "Privacy Policy",    desc: "Legal page" },
  { id: "terms",      label: "Terms of Service",  desc: "Legal page" },
  { id: "careers",    label: "Careers/Jobs",      desc: "Job listings" },
  { id: "booking",    label: "Booking",           desc: "Appointments" },
  { id: "newsletter", label: "Newsletter Signup", desc: "Email list" },
];

const CTA_OPTIONS = [
  { id: "contact-form",  label: "Contact form",       },
  { id: "phone",         label: "Phone call",          },
  { id: "email",         label: "Email",               },
  { id: "booking",       label: "Booking/Appointment", },
  { id: "shop",          label: "Shop/Buy",            },
  { id: "newsletter",    label: "Newsletter signup",   },
  { id: "multiple",      label: "Multiple CTAs",       },
];

const TONE_OPTIONS = [
  { id: "formal",                  label: "Professional & Formal"       },
  { id: "professional-approachable",label: "Professional & Approachable" },
  { id: "casual",                  label: "Casual & Friendly"           },
  { id: "creative",                label: "Creative & Expressive"       },
  { id: "ai-decide",               label: "Let AI decide"               },
];

const SPECIAL_FEATURES = [
  { id: "testimonials",  label: "Customer testimonials section" },
  { id: "social",        label: "Social media integration"      },
  { id: "newsletter",    label: "Email newsletter signup"       },
  { id: "search",        label: "Search functionality"         },
  { id: "multilang",     label: "Multi-language support"       },
  { id: "accessibility", label: "Accessibility features (WCAG)"},
  { id: "analytics",     label: "Analytics integration"        },
];

const ANIMATION_OPTS = [
  { id: "minimal",  label: "Minimal",   desc: "Fast loading, no animations"  },
  { id: "moderate", label: "Moderate",  desc: "Smooth, professional transitions" },
  { id: "rich",     label: "Rich",      desc: "Engaging, modern interactions" },
  { id: "ai-decide",label: "AI decides",desc: "Best for your style" },
];

const LAYOUT_OPTS = [
  { id: "traditional",label: "Traditional",  desc: "Sidebar navigation" },
  { id: "modern",     label: "Modern",       desc: "Full-width sections" },
  { id: "minimal-l",  label: "Minimal",      desc: "Ultra-clean layout" },
  { id: "ai-decide",  label: "AI decides",   desc: "Best for your style" },
];

const MOBILE_OPTS = [
  { id: "mobile-first",label: "Mobile-first",       desc: "Optimized for phones" },
  { id: "equal",       label: "Desktop & Mobile",   desc: "Equal priority" },
  { id: "desktop",     label: "Desktop-focused",    desc: "Optimized for desktop" },
  { id: "ai-decide",   label: "AI decides",         desc: "Best for your style" },
];

const SPEED_OPTS = [
  { id: "fast",     label: "Lightweight & fast",  desc: "Minimal images, fast load" },
  { id: "balanced", label: "Balanced",            desc: "Good performance + visuals" },
  { id: "rich",     label: "Feature-rich",        desc: "More visuals, may be slower" },
  { id: "ai-decide",label: "AI decides",          desc: "Best for your style" },
];

const COLOR_GROUPS: { label: string; colors: { hex: string; name: string }[] }[] = [
  { label: "Neutrals", colors: [
    { hex: "#ffffff", name: "White" },
    { hex: "#f5f5f5", name: "Off White" },
    { hex: "#e5e7eb", name: "Light Gray" },
    { hex: "#9ca3af", name: "Gray" },
    { hex: "#6b7280", name: "Mid Gray" },
    { hex: "#374151", name: "Dark Gray" },
    { hex: "#1f2937", name: "Charcoal" },
    { hex: "#111827", name: "Near Black" },
    { hex: "#0a0a0a", name: "Black" },
  ]},
  { label: "Blues", colors: [
    { hex: "#bfdbfe", name: "Light Blue" },
    { hex: "#60a5fa", name: "Sky Blue" },
    { hex: "#3b82f6", name: "Blue" },
    { hex: "#2563eb", name: "Royal Blue" },
    { hex: "#1d4ed8", name: "Dark Blue" },
    { hex: "#1e3a5f", name: "Navy" },
    { hex: "#0f172a", name: "Midnight" },
  ]},
  { label: "Purples & Indigos", colors: [
    { hex: "#e9d5ff", name: "Lavender" },
    { hex: "#c084fc", name: "Light Purple" },
    { hex: "#a855f7", name: "Purple" },
    { hex: "#8b5cf6", name: "Violet" },
    { hex: "#7c3aed", name: "Deep Violet" },
    { hex: "#6366f1", name: "Indigo" },
    { hex: "#4f46e5", name: "Deep Indigo" },
  ]},
  { label: "Greens", colors: [
    { hex: "#a7f3d0", name: "Mint" },
    { hex: "#34d399", name: "Emerald" },
    { hex: "#10b981", name: "Green" },
    { hex: "#059669", name: "Forest" },
    { hex: "#065f46", name: "Dark Green" },
    { hex: "#6b7c3f", name: "Olive" },
  ]},
  { label: "Reds & Burgundy", colors: [
    { hex: "#fca5a5", name: "Blush" },
    { hex: "#f87171", name: "Coral" },
    { hex: "#ef4444", name: "Red" },
    { hex: "#dc2626", name: "Dark Red" },
    { hex: "#b91c1c", name: "Crimson" },
    { hex: "#991b1b", name: "Deep Crimson" },
    { hex: "#800020", name: "Burgundy" },
    { hex: "#6b1a1a", name: "Wine" },
    { hex: "#4a0e0e", name: "Maroon" },
  ]},
  { label: "Pinks", colors: [
    { hex: "#fce7f3", name: "Baby Pink" },
    { hex: "#f9a8d4", name: "Light Pink" },
    { hex: "#ec4899", name: "Pink" },
    { hex: "#db2777", name: "Hot Pink" },
    { hex: "#be185d", name: "Deep Pink" },
    { hex: "#9d174d", name: "Magenta" },
  ]},
  { label: "Oranges & Ambers", colors: [
    { hex: "#fef3c7", name: "Cream" },
    { hex: "#fde68a", name: "Light Yellow" },
    { hex: "#fbbf24", name: "Amber" },
    { hex: "#f59e0b", name: "Gold" },
    { hex: "#f97316", name: "Orange" },
    { hex: "#ea580c", name: "Deep Orange" },
    { hex: "#c2410c", name: "Burnt Orange" },
  ]},
  { label: "Teals & Cyans", colors: [
    { hex: "#a5f3fc", name: "Light Cyan" },
    { hex: "#22d3ee", name: "Cyan" },
    { hex: "#06b6d4", name: "Sky Cyan" },
    { hex: "#0891b2", name: "Teal" },
    { hex: "#0e7490", name: "Dark Teal" },
    { hex: "#134e4a", name: "Deep Teal" },
  ]},
  { label: "Browns & Warm", colors: [
    { hex: "#faf8f5", name: "Warm White" },
    { hex: "#c8b8a2", name: "Warm Beige" },
    { hex: "#a67c52", name: "Bronze" },
    { hex: "#92400e", name: "Brown" },
    { hex: "#78350f", name: "Dark Brown" },
    { hex: "#3d2b1f", name: "Chocolate" },
  ]},
];

// ─── Small UI helpers ──────────────────────────────────────────────────────────

function SectionLabel({ label }: { label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
      <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text3)", whiteSpace: "nowrap" }}>
        {label}
      </span>
      <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
    </div>
  );
}

function RadioRow({ options, value, onChange }: {
  options: { id: string; label: string; desc?: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {options.map((o) => {
        const on = value === o.id;
        return (
          <button key={o.id} type="button" onClick={() => onChange(o.id)} style={{
            display: "flex", alignItems: "center", gap: 12, padding: "10px 14px",
            borderRadius: 10, border: on ? "1.5px solid var(--accent)" : "1.5px solid var(--border)",
            background: on ? "rgba(99,102,241,0.08)" : "transparent",
            cursor: "pointer", textAlign: "left", transition: "all 0.15s",
          }}>
            <div style={{
              width: 16, height: 16, borderRadius: "50%", flexShrink: 0,
              border: on ? "5px solid var(--accent)" : "1.5px solid var(--border-h)",
              background: "transparent", transition: "all 0.15s",
            }} />
            <div>
              <p style={{ fontSize: 13, fontWeight: 500, color: on ? "#fff" : "var(--text2)", margin: 0 }}>{o.label}</p>
              {o.desc && <p style={{ fontSize: 11, color: "var(--text3)", margin: "2px 0 0" }}>{o.desc}</p>}
            </div>
          </button>
        );
      })}
    </div>
  );
}

function CheckRow({ options, values, onChange }: {
  options: { id: string; label: string; desc?: string }[];
  values: string[];
  onChange: (v: string[]) => void;
}) {
  const toggle = (id: string) =>
    onChange(values.includes(id) ? values.filter(v => v !== id) : [...values, id]);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {options.map((o) => {
        const on = values.includes(o.id);
        return (
          <button key={o.id} type="button" onClick={() => toggle(o.id)} style={{
            display: "flex", alignItems: "center", gap: 12, padding: "10px 14px",
            borderRadius: 10, border: on ? "1.5px solid var(--accent)" : "1.5px solid var(--border)",
            background: on ? "rgba(99,102,241,0.08)" : "transparent",
            cursor: "pointer", textAlign: "left", transition: "all 0.15s",
          }}>
            <div style={{
              width: 16, height: 16, borderRadius: 4, flexShrink: 0,
              border: on ? "none" : "1.5px solid var(--border-h)",
              background: on ? "var(--accent)" : "transparent",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all 0.15s",
            }}>
              {on && <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg>}
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 500, color: on ? "#fff" : "var(--text2)", margin: 0 }}>{o.label}</p>
              {o.desc && <p style={{ fontSize: 11, color: "var(--text3)", margin: "2px 0 0" }}>{o.desc}</p>}
            </div>
          </button>
        );
      })}
    </div>
  );
}

function Toggle({ checked, onChange, label, desc }: {
  checked: boolean; onChange: (v: boolean) => void; label: string; desc?: string;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", borderRadius: 10, border: "1.5px solid var(--border)", background: checked ? "rgba(99,102,241,0.06)" : "transparent" }}>
      <div>
        <p style={{ fontSize: 13, fontWeight: 500, color: "#fff", margin: 0 }}>{label}</p>
        {desc && <p style={{ fontSize: 11, color: "var(--text3)", margin: "2px 0 0" }}>{desc}</p>}
      </div>
      <div onClick={() => onChange(!checked)} style={{
        width: 40, height: 22, borderRadius: 11, cursor: "pointer", flexShrink: 0,
        background: checked ? "var(--accent)" : "rgba(255,255,255,0.1)",
        position: "relative", transition: "background 0.2s",
      }}>
        <div style={{
          width: 16, height: 16, background: "#fff", borderRadius: "50%",
          position: "absolute", top: 3, left: checked ? 21 : 3, transition: "left 0.2s",
        }} />
      </div>
    </div>
  );
}

function ColorPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {/* Selected color + custom input */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: value, border: "2px solid rgba(255,255,255,0.2)", flexShrink: 0 }} />
        <span style={{ fontSize: 12, fontFamily: "ui-monospace,monospace", color: "var(--text2)" }}>{value}</span>
        <label style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: "auto", fontSize: 11, color: "var(--text3)", cursor: "pointer" }}>
          Custom
          <input type="color" value={value} onChange={e => onChange(e.target.value)}
            style={{ width: 28, height: 28, border: "none", cursor: "pointer", borderRadius: 6, padding: 1, background: "transparent" }} />
        </label>
      </div>
      {/* Grouped palette */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "12px 14px", borderRadius: 12, border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)" }}>
        {COLOR_GROUPS.map(group => (
          <div key={group.label}>
            <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text3)", marginBottom: 5 }}>{group.label}</p>
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
              {group.colors.map(c => {
                const selected = value.toLowerCase() === c.hex.toLowerCase();
                const isLight = c.hex === "#ffffff" || c.hex === "#f5f5f5" || c.hex === "#e5e7eb" || c.hex === "#faf8f5" || c.hex === "#fef3c7" || c.hex === "#fce7f3" || c.hex === "#fde68a" || c.hex === "#a5f3fc" || c.hex === "#a7f3d0" || c.hex === "#bfdbfe" || c.hex === "#e9d5ff" || c.hex === "#f9a8d4" || c.hex === "#fca5a5" || c.hex === "#c8b8a2" || c.hex === "#fef3c7";
                return (
                  <div
                    key={c.hex}
                    title={c.name}
                    onClick={() => onChange(c.hex)}
                    style={{
                      width: 24, height: 24, borderRadius: 6, background: c.hex, cursor: "pointer",
                      border: selected
                        ? "2.5px solid #fff"
                        : isLight ? "1.5px solid rgba(0,0,0,0.15)" : "1.5px solid rgba(255,255,255,0.08)",
                      boxShadow: selected ? "0 0 0 2px rgba(99,102,241,0.7)" : "none",
                      transition: "transform 0.1s, box-shadow 0.1s",
                      transform: selected ? "scale(1.15)" : "scale(1)",
                    }}
                    onMouseEnter={e => { if (!selected) (e.currentTarget as HTMLDivElement).style.transform = "scale(1.1)"; }}
                    onMouseLeave={e => { if (!selected) (e.currentTarget as HTMLDivElement).style.transform = "scale(1)"; }}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Step 1: Business Basics ──────────────────────────────────────────────────

function Step1({ data, onChange }: { data: WizardData["business"]; onChange: (d: WizardData["business"]) => void }) {
  const set = (k: keyof typeof data, v: string) => onChange({ ...data, [k]: v });
  const descLen = data.description.length;
  const descOk = descLen >= 20;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--text2)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.08em" }}>Website name *</label>
        <input className="inp" value={data.name} onChange={e => set("name", e.target.value)}
          placeholder="e.g., John's Plumbing or Luna Photography" />
      </div>
      <div>
        <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--text2)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.08em" }}>Business type *</label>
        <select className="inp" value={data.type} onChange={e => set("type", e.target.value)}>
          {BUSINESS_TYPES.map(t => <option key={t}>{t}</option>)}
        </select>
      </div>
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text2)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Business description *</label>
          <span style={{ fontSize: 11, color: descOk ? "#10b981" : "var(--text3)" }}>{descLen}/500</span>
        </div>
        <textarea className="inp" value={data.description}
          onChange={e => set("description", e.target.value.slice(0, 500))}
          placeholder="What do you do? What services/products do you offer? Target audience? Special features?"
          style={{ height: 110, resize: "none" }} />
        {descLen > 0 && !descOk && <p style={{ fontSize: 11, color: "#f87171", marginTop: 4 }}>Minimum 20 characters for best results.</p>}
      </div>
      <div>
        <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--text2)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.08em" }}>Target audience <span style={{ color: "var(--text3)", fontWeight: 400, textTransform: "none" }}>(optional)</span></label>
        <input className="inp" value={data.targetAudience} onChange={e => set("targetAudience", e.target.value)}
          placeholder="e.g., Busy professionals, college students, local families" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--text2)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.08em" }}>Location <span style={{ color: "var(--text3)", fontWeight: 400, textTransform: "none" }}>(opt.)</span></label>
          <input className="inp" value={data.location} onChange={e => set("location", e.target.value)}
            placeholder="City, Country" />
        </div>
        <div>
          <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--text2)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.08em" }}>Your name <span style={{ color: "var(--text3)", fontWeight: 400, textTransform: "none" }}>(opt.)</span></label>
          <input className="inp" value={data.ownerName} onChange={e => set("ownerName", e.target.value)}
            placeholder="For personalization" />
        </div>
      </div>
    </div>
  );
}

// ─── Step 2: Design Style ─────────────────────────────────────────────────────

function Step2({ data, onChange }: { data: WizardData["design"]; onChange: (d: WizardData["design"]) => void }) {
  const set = (k: keyof typeof data, v: string | boolean) => onChange({ ...data, [k]: v });
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <SectionLabel label="Visual style (choose one)" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
          {STYLES.map(s => {
            const on = data.style === s.id;
            return (
              <button key={s.id} type="button" onClick={() => set("style", s.id)} style={{
                textAlign: "left", borderRadius: 10, cursor: "pointer",
                border: on ? "2px solid var(--accent)" : "2px solid var(--border)",
                overflow: "hidden", background: "transparent", padding: 0,
                transition: "all 0.15s",
                boxShadow: on ? "0 0 0 3px rgba(99,102,241,0.15)" : "none",
              }}>
                {s.preview}
                <div style={{ padding: "6px 8px", background: "rgba(255,255,255,0.03)", borderTop: "1px solid var(--border)" }}>
                  <p style={{ fontSize: 11, fontWeight: 600, color: on ? "#a5b4fc" : "#fff", margin: 0 }}>{s.name}</p>
                  <p style={{ fontSize: 9, color: "var(--text3)", margin: "2px 0 0" }}>{s.best}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <SectionLabel label="Primary brand color" />
        <ColorPicker value={data.primaryColor} onChange={v => set("primaryColor", v)} />
      </div>

      <div>
        <SectionLabel label="Accent / secondary color" />
        <ColorPicker value={data.secondaryColor} onChange={v => set("secondaryColor", v)} />
      </div>

      <Toggle checked={data.darkMode} onChange={v => set("darkMode", v)}
        label="Include dark mode" desc="Adds a dark variant — appealing on mobile, modern UX" />
    </div>
  );
}

// ─── Step 3: Typography & Imagery ─────────────────────────────────────────────

function Step3({ data, onChange, logo, onLogoChange }: {
  data: WizardData["typography"];
  onChange: (d: WizardData["typography"]) => void;
  logo: WizardData["logo"];
  onLogoChange: (d: WizardData["logo"]) => void;
}) {
  const set = (k: keyof typeof data, v: string) => onChange({ ...data, [k]: v });
  const fileRef = useRef<HTMLInputElement>(null);

  const handleLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => onLogoChange({ uploaded: true, dataUrl: ev.target?.result as string, fileName: file.name });
    reader.readAsDataURL(file);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <SectionLabel label="Typography style" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
          {FONTS.map(f => {
            const on = data.fontFamily === f.id;
            return (
              <button key={f.id} type="button" onClick={() => set("fontFamily", f.id)} style={{
                borderRadius: 10, border: on ? "2px solid var(--accent)" : "2px solid var(--border)",
                overflow: "hidden", background: "transparent", cursor: "pointer", padding: 0, transition: "all 0.15s",
                boxShadow: on ? "0 0 0 3px rgba(99,102,241,0.15)" : "none",
              }}>
                <div style={{ height: 60, background: "rgba(255,255,255,0.04)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ ...f.style, fontSize: "1.7rem", color: "#fff" }}>{f.sample}</span>
                </div>
                <div style={{ padding: "6px 8px", background: "rgba(255,255,255,0.03)", borderTop: "1px solid var(--border)" }}>
                  <p style={{ fontSize: 10, fontWeight: 600, color: on ? "#a5b4fc" : "#fff", margin: 0 }}>{f.name}</p>
                  <p style={{ fontSize: 9, color: "var(--text3)", margin: "2px 0 0" }}>{f.best}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <SectionLabel label="Imagery style" />
        <RadioRow options={IMAGERY} value={data.imageryStyle} onChange={v => set("imageryStyle", v)} />
      </div>

      <div>
        <SectionLabel label="Logo (optional)" />
        <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
          <div onClick={() => fileRef.current?.click()} style={{
            width: 80, height: 80, flexShrink: 0, borderRadius: 10, cursor: "pointer",
            border: "2px dashed var(--border)", overflow: "hidden",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            transition: "border-color 0.15s",
          }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--border-h)")}
            onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border)")}
          >
            {logo.uploaded
              ? <img src={logo.dataUrl} alt="logo" style={{ width: "100%", height: "100%", objectFit: "contain", padding: 6 }} />
              : <>
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} style={{ color: "var(--text3)", marginBottom: 3 }}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                  <span style={{ fontSize: 9, color: "var(--text3)" }}>Upload</span>
                </>}
          </div>
          <div>
            <p style={{ fontSize: 13, color: "#fff", fontWeight: 500, marginBottom: 4 }}>PNG, SVG or JPG · Max 5MB</p>
            <p style={{ fontSize: 12, color: "var(--text2)", lineHeight: 1.5, marginBottom: 8 }}>AI will place your logo in the header and match colors to your brand.</p>
            {logo.uploaded
              ? <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <span style={{ fontSize: 12, color: "var(--text2)" }}>{logo.fileName}</span>
                  <button type="button" onClick={() => onLogoChange({ uploaded: false, dataUrl: "", fileName: "" })}
                    style={{ fontSize: 11, color: "#f87171", background: "none", border: "none", cursor: "pointer" }}>Remove</button>
                </div>
              : <button type="button" onClick={() => fileRef.current?.click()}
                  style={{ fontSize: 12, color: "var(--text2)", textDecoration: "underline", background: "none", border: "none", cursor: "pointer" }}>
                  Choose file
                </button>}
            <input ref={fileRef} type="file" accept="image/*" onChange={handleLogo} style={{ display: "none" }} />
          </div>
        </div>
      </div>

      <div>
        <SectionLabel label="Hero section style" />
        <RadioRow options={HERO_PREFS} value={data.heroPreference} onChange={v => set("heroPreference", v)} />
      </div>
    </div>
  );
}

// ─── Step 4: Pages & Content ──────────────────────────────────────────────────

function Step4({ data, onChange }: { data: WizardData["pages"]; onChange: (d: WizardData["pages"]) => void }) {
  const togglePage = (id: string) => {
    if (id === "home") return;
    const sel = data.selected.includes(id)
      ? data.selected.filter(p => p !== id)
      : [...data.selected, id];
    onChange({ ...data, selected: sel });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <SectionLabel label="Essential pages" />
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {ESSENTIAL_PAGES.map(p => {
            const on = data.selected.includes(p.id);
            return (
              <button key={p.id} type="button" onClick={() => togglePage(p.id)} disabled={p.required} style={{
                display: "flex", alignItems: "center", gap: 12, padding: "10px 14px",
                borderRadius: 10, border: on ? "1.5px solid var(--accent)" : "1.5px solid var(--border)",
                background: on ? "rgba(99,102,241,0.08)" : "transparent",
                cursor: p.required ? "not-allowed" : "pointer", textAlign: "left", transition: "all 0.15s",
                opacity: p.required ? 0.7 : 1,
              }}>
                <div style={{
                  width: 16, height: 16, borderRadius: 4, flexShrink: 0,
                  border: on ? "none" : "1.5px solid var(--border-h)",
                  background: on ? "var(--accent)" : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {on && <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg>}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 500, color: on ? "#fff" : "var(--text2)", margin: 0 }}>
                    {p.label} {p.required && <span style={{ fontSize: 10, color: "var(--text3)", fontWeight: 400 }}>(always included)</span>}
                  </p>
                  <p style={{ fontSize: 11, color: "var(--text3)", margin: "2px 0 0" }}>{p.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <SectionLabel label="Additional pages" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
          {EXTRA_PAGES.map(p => {
            const on = data.selected.includes(p.id);
            return (
              <button key={p.id} type="button" onClick={() => togglePage(p.id)} style={{
                display: "flex", alignItems: "center", gap: 8, padding: "9px 12px",
                borderRadius: 9, border: on ? "1.5px solid var(--accent)" : "1.5px solid var(--border)",
                background: on ? "rgba(99,102,241,0.08)" : "transparent",
                cursor: "pointer", textAlign: "left", transition: "all 0.15s",
              }}>
                <div style={{
                  width: 14, height: 14, borderRadius: 3, flexShrink: 0,
                  border: on ? "none" : "1.5px solid var(--border-h)",
                  background: on ? "var(--accent)" : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {on && <svg width="9" height="9" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/></svg>}
                </div>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 500, color: on ? "#fff" : "var(--text2)", margin: 0 }}>{p.label}</p>
                  <p style={{ fontSize: 10, color: "var(--text3)", margin: "1px 0 0" }}>{p.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <SectionLabel label="Primary call-to-action" />
        <RadioRow options={CTA_OPTIONS} value={data.primaryCTA} onChange={v => onChange({ ...data, primaryCTA: v })} />
      </div>

      <div>
        <SectionLabel label="Content tone" />
        <RadioRow options={TONE_OPTIONS} value={data.contentTone} onChange={v => onChange({ ...data, contentTone: v })} />
      </div>
    </div>
  );
}

// ─── Step 5: Features ─────────────────────────────────────────────────────────

function Step5({ data, onChange }: { data: WizardData["features"]; onChange: (d: WizardData["features"]) => void }) {
  const set = (k: keyof typeof data, v: string | string[]) => onChange({ ...data, [k]: v });
  const notesLen = data.additionalNotes.length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <SectionLabel label="Special features" />
        <CheckRow
          options={SPECIAL_FEATURES}
          values={data.specialFeatures}
          onChange={v => set("specialFeatures", v)}
        />
      </div>

      <div>
        <SectionLabel label="Animations & interactions" />
        <RadioRow options={ANIMATION_OPTS} value={data.animations} onChange={v => set("animations", v)} />
      </div>

      <div>
        <SectionLabel label="Layout preference" />
        <RadioRow options={LAYOUT_OPTS} value={data.layout} onChange={v => set("layout", v)} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div>
          <SectionLabel label="Mobile optimization" />
          <RadioRow options={MOBILE_OPTS} value={data.mobileOptimization} onChange={v => set("mobileOptimization", v)} />
        </div>
        <div>
          <SectionLabel label="Speed priority" />
          <RadioRow options={SPEED_OPTS} value={data.speedPriority} onChange={v => set("speedPriority", v)} />
        </div>
      </div>

      <div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <SectionLabel label="Additional notes" />
          <span style={{ fontSize: 11, color: "var(--text3)" }}>{notesLen}/300</span>
        </div>
        <textarea className="inp" value={data.additionalNotes}
          onChange={e => set("additionalNotes", e.target.value.slice(0, 300))}
          placeholder="e.g., 'I have 3 products to showcase', 'Prefer earth tones', 'Need booking form for 2 services'"
          style={{ height: 90, resize: "none" }} />
      </div>
    </div>
  );
}

// ─── Step 6: Review ───────────────────────────────────────────────────────────

function Step6({ data, onEdit, onSubmit, loading, countdown, stageMsg }: {
  data: WizardData;
  onEdit: (step: number) => void;
  onSubmit: () => void;
  loading: boolean;
  countdown: number;
  stageMsg: string;
}) {
  const progressPct = loading ? Math.round(((100 - countdown) / 100) * 100) : 0;
  const style = STYLES.find(s => s.id === data.design.style);
  const font  = FONTS.find(f => f.id === data.typography.fontFamily);
  const imagery = IMAGERY.find(i => i.id === data.typography.imageryStyle);
  const cta = CTA_OPTIONS.find(c => c.id === data.pages.primaryCTA);
  const tone = TONE_OPTIONS.find(t => t.id === data.pages.contentTone);
  const pages = data.pages.selected.map(id => [...ESSENTIAL_PAGES, ...EXTRA_PAGES].find(p => p.id === id)?.label).filter(Boolean);

  const row = (label: string, value: string, step: number) => (
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 11, color: "var(--text3)", margin: 0, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>{label}</p>
        <p style={{ fontSize: 13, color: "var(--text2)", margin: "3px 0 0" }}>{value}</p>
      </div>
      <button type="button" onClick={() => onEdit(step)} style={{
        fontSize: 11, color: "var(--accent)", background: "none", border: "none", cursor: "pointer",
        padding: "2px 0", textDecoration: "underline", flexShrink: 0, marginLeft: 12,
      }}>Edit</button>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      <div className="glass rounded-2xl" style={{ padding: 20, marginBottom: 20 }}>
        {row("Business", `${data.business.name} — ${data.business.type}`, 1)}
        {row("Description", data.business.description.slice(0, 80) + (data.business.description.length > 80 ? "…" : ""), 1)}
        {data.business.targetAudience && row("Target audience", data.business.targetAudience, 1)}
        {data.business.location && row("Location", data.business.location, 1)}
        {row("Design style", style?.name || data.design.style, 2)}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 11, color: "var(--text3)", margin: 0, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>Colors</p>
            <div style={{ display: "flex", gap: 8, marginTop: 6, alignItems: "center" }}>
              <div style={{ width: 20, height: 20, borderRadius: "50%", background: data.design.primaryColor, border: "1.5px solid rgba(255,255,255,0.15)" }} />
              <div style={{ width: 20, height: 20, borderRadius: "50%", background: data.design.secondaryColor, border: "1.5px solid rgba(255,255,255,0.15)" }} />
              {data.design.darkMode && <span style={{ fontSize: 11, color: "var(--text3)" }}>+ dark mode</span>}
            </div>
          </div>
          <button type="button" onClick={() => onEdit(2)} style={{ fontSize: 11, color: "var(--accent)", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>Edit</button>
        </div>
        {row("Typography", font?.name || data.typography.fontFamily, 3)}
        {row("Imagery", imagery?.label || data.typography.imageryStyle, 3)}
        {data.logo.uploaded && row("Logo", data.logo.fileName, 3)}
        {row("Pages", pages.join(", ") || "Home", 4)}
        {row("Primary CTA", cta?.label || data.pages.primaryCTA, 4)}
        {row("Content tone", tone?.label || data.pages.contentTone, 4)}
        {data.features.specialFeatures.length > 0 && row("Special features", data.features.specialFeatures.join(", "), 5)}
        {data.features.additionalNotes && row("Additional notes", data.features.additionalNotes, 5)}
      </div>

      {loading && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <p style={{ fontSize: 13, color: "var(--text2)", margin: 0 }}>{stageMsg}</p>
            <div style={{ display: "flex", alignItems: "baseline", gap: 3 }}>
              <span key={countdown} className="countdown-num" style={{ fontSize: "1.8rem", fontWeight: 700, color: "var(--accent)" }}>{countdown}</span>
              <span style={{ fontSize: 12, color: "var(--text3)" }}>s</span>
            </div>
          </div>
          <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 99, overflow: "hidden" }}>
            <div className="shimmer-bar" style={{
              height: "100%", background: "linear-gradient(135deg,var(--accent),var(--accent2))",
              width: `${progressPct}%`, borderRadius: 99, transition: "width 0.8s ease",
            }} />
          </div>
        </div>
      )}

      <button type="button" onClick={onSubmit} disabled={loading} className="btn-primary rounded-xl py-4 w-full" style={{ fontSize: 16 }}>
        {loading ? "Generating your website..." : "Generate My Website — €49.99"}
      </button>
      <p style={{ fontSize: 12, color: "var(--text3)", textAlign: "center", marginTop: 8 }}>Takes approximately 100 seconds.</p>
    </div>
  );
}

// ─── Main Wizard ──────────────────────────────────────────────────────────────

const STEP_TITLES = [
  { title: "Tell us about your business",        sub: "The more specific, the better the AI understands your needs" },
  { title: "Choose your design aesthetic",        sub: "Pick the vibe that matches your brand" },
  { title: "Define typography and imagery",       sub: "Fonts and imagery shape brand perception" },
  { title: "Pages and content structure",         sub: "Select the pages that matter for your business" },
  { title: "Fine-tune your website",              sub: "Tell us about any special features or preferences" },
  { title: "Review and generate",                 sub: "Make sure everything looks good before we build" },
];

const STAGE_MESSAGES: Record<number, string> = {
  100: "Starting generation...",
  85:  "AI is writing your code...",
  65:  "Crafting your design...",
  45:  "Pushing to GitHub...",
  25:  "Vercel is building...",
  10:  "Almost live...",
  0:   "Going live now...",
};

export default function GenerateWizard() {
  const router = useRouter();
  const [step, setStep]       = useState(1);
  const [data, setData]       = useState<WizardData>(DEFAULT);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [countdown, setCountdown] = useState(100);
  const [stageMsg, setStageMsg]   = useState("");

  // Persist to localStorage
  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) { router.push("/login"); return; }
    const saved = localStorage.getItem("wizard_data");
    if (saved) { try { setData(JSON.parse(saved)); } catch {} }
  }, [router]);

  useEffect(() => {
    localStorage.setItem("wizard_data", JSON.stringify(data));
  }, [data]);

  // Countdown during generation
  useEffect(() => {
    if (!loading) { setCountdown(100); setStageMsg(""); return; }
    setCountdown(100);
    const iv = setInterval(() => {
      setCountdown(prev => {
        const next = prev > 0 ? prev - 1 : 0;
        const key = Object.keys(STAGE_MESSAGES).map(Number).sort((a, b) => b - a).find(k => next <= k);
        if (key !== undefined) setStageMsg(STAGE_MESSAGES[key]);
        return next;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [loading]);

  const step1Valid = data.business.name.trim().length > 0 && data.business.description.trim().length >= 20;

  const canNext = () => {
    if (step === 1) return step1Valid;
    return true;
  };

  const next = () => { if (canNext()) setStep(s => Math.min(s + 1, 6)); };
  const back = () => setStep(s => Math.max(s - 1, 1));

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      const userId = localStorage.getItem("userId");
      const res = await fetch("/api/generate-site", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formData: data, userId }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Generation failed");
      }
      const result = await res.json();
      const sites = JSON.parse(localStorage.getItem("sites") || "[]");
      sites.push({
        id: result.repoName, name: data.business.name,
        url: result.siteUrl, githubUrl: result.githubUrl,
        status: "deployed", createdAt: new Date().toISOString(),
      });
      localStorage.setItem("sites", JSON.stringify(sites));
      localStorage.removeItem("wizard_data");
      router.push(`/success/${result.repoName}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  };

  const { title, sub } = STEP_TITLES[step - 1];

  return (
    <div style={{ background: "#050510", minHeight: "100vh", color: "#fff" }}>
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass" style={{ borderTop: "none", borderLeft: "none", borderRight: "none" }}>
        <div style={{ maxWidth: 680, margin: "0 auto", padding: "0 24px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ fontWeight: 700, fontSize: 15, color: "#fff", textDecoration: "none" }}>WebBuilder</Link>
          <Link href="/dashboard" style={{ fontSize: 13, color: "var(--text2)", textDecoration: "none" }}>Dashboard</Link>
        </div>
      </nav>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "100px 24px 80px" }}>
        {/* Progress */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: "var(--text3)" }}>Step {step} of {STEP_TITLES.length}</span>
            <span style={{ fontSize: 12, color: "var(--text3)" }}>{Math.round((step / STEP_TITLES.length) * 100)}%</span>
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            {STEP_TITLES.map((_, i) => (
              <div key={i} style={{
                flex: 1, height: 3, borderRadius: 99, transition: "background 0.4s",
                background: i < step ? "linear-gradient(90deg,var(--accent),var(--accent2))" : "var(--border)",
              }} />
            ))}
          </div>
        </div>

        {/* Step header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: "1.7rem", fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 6 }}>{title}</h1>
          <p style={{ fontSize: 14, color: "var(--text2)", margin: 0 }}>{sub}</p>
        </div>

        {/* Error */}
        {error && (
          <div style={{ marginBottom: 20, fontSize: 13, padding: "12px 16px", borderRadius: 10,
            background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#fca5a5" }}>
            {error}
          </div>
        )}

        {/* Steps */}
        <div key={step} className="fade-up">
          {step === 1 && <Step1 data={data.business} onChange={d => setData(p => ({ ...p, business: d }))} />}
          {step === 2 && <Step2 data={data.design}   onChange={d => setData(p => ({ ...p, design: d }))} />}
          {step === 3 && (
            <Step3
              data={data.typography}
              onChange={d => setData(p => ({ ...p, typography: d }))}
              logo={data.logo}
              onLogoChange={d => setData(p => ({ ...p, logo: d }))}
            />
          )}
          {step === 4 && <Step4 data={data.pages}    onChange={d => setData(p => ({ ...p, pages: d }))} />}
          {step === 5 && <Step5 data={data.features} onChange={d => setData(p => ({ ...p, features: d }))} />}
          {step === 6 && (
            <Step6
              data={data}
              onEdit={(s) => setStep(s)}
              onSubmit={handleSubmit}
              loading={loading}
              countdown={countdown}
              stageMsg={stageMsg}
            />
          )}
        </div>

        {/* Nav buttons (steps 1-5 only) */}
        {step < 6 && (
          <div style={{ display: "flex", gap: 12, marginTop: 32 }}>
            {step > 1 && (
              <button type="button" onClick={back} className="btn-ghost rounded-xl py-3.5 flex-1 text-sm" style={{ fontWeight: 600 }}>
                Back
              </button>
            )}
            <button type="button" onClick={next} disabled={!canNext()} className="btn-primary rounded-xl py-3.5 text-sm"
              style={{ flex: step > 1 ? 2 : 1, fontSize: 15 }}>
              {step === 5 ? "Review my choices" : "Continue"}
            </button>
          </div>
        )}

        {step < 6 && (
          <p style={{ fontSize: 11, color: "var(--text3)", textAlign: "center", marginTop: 12 }}>
            Your answers are saved automatically.
          </p>
        )}
      </div>
    </div>
  );
}
