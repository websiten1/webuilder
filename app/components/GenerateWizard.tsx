"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { TemplateGallery } from "@/app/components/TemplateGallery";

// ─── Types ───────────────────────────────────────────────────────────────────

export type DayHours = { open: string; close: string; closed: boolean };
export type TeamMember = { name: string; role: string; bio: string; photo: string; fileName: string };
export type PageDesc = { description: string; aiRephrase: boolean; image: string; imageName: string };

export type WizardData = {
  templateId: string;
  business: {
    name: string; type: string; description: string;
    aboutText: string; aboutAiRephrase: boolean;
    hasLocation: boolean; location: string; locationCity: string; locationCountry: string; serviceArea: string;
    email: string; hasPhone: boolean; phone: string;
    openingHours: string; ownerName: string; experience: string;
  };
  schedule: { type: "no-schedule" | "online" | "always-open" | "custom"; hours: { [day: string]: DayHours } };
  goals: { mainGoal: string; visitorFeel: string; problemSolved: string; whyChoose: string; idealCustomer: string };
  services: { offersType: string; list: string[]; priceVisibility: string };
  design: { style: string; primaryColor: string; secondaryColor: string; darkMode: boolean; personalityLevel: string; backgroundStyle: string; animations: string };
  typography: { fontFamily: string; imageryStyle: string; heroPreference: string };
  team: { enabled: boolean; members: TeamMember[] };
  pages: { selected: string[]; primaryCTA: string; contentTone: string; specialFeatures: string[]; additionalNotes: string; pageDescriptions: { [id: string]: PageDesc } };
  useEmojis: boolean;
  websiteLanguage: string;
  logo: { uploaded: boolean; dataUrl: string; fileName: string };
};

// ─── Constants ────────────────────────────────────────────────────────────────

const DAYS = ["monday","tuesday","wednesday","thursday","friday","saturday","sunday"] as const;
const DAY_LABELS: Record<string, string> = { monday:"Mon",tuesday:"Tue",wednesday:"Wed",thursday:"Thu",friday:"Fri",saturday:"Sat",sunday:"Sun" };
const DEFAULT_HOURS = Object.fromEntries(DAYS.map(d => [d, { open: "09:00", close: "17:00", closed: d === "saturday" || d === "sunday" }]));

const DEFAULT: WizardData = {
  templateId: "",
  business: { name: "", type: "Restaurant", description: "", aboutText: "", aboutAiRephrase: true, hasLocation: true, location: "", locationCity: "", locationCountry: "", serviceArea: "", email: "", hasPhone: true, phone: "", openingHours: "", ownerName: "", experience: "" },
  schedule: { type: "no-schedule", hours: DEFAULT_HOURS },
  goals: { mainGoal: "", visitorFeel: "", problemSolved: "", whyChoose: "", idealCustomer: "" },
  services: { offersType: "", list: [], priceVisibility: "" },
  design: { style: "minimalist", primaryColor: "#FF5A1F", secondaryColor: "#0e1a2b", darkMode: false, personalityLevel: "balanced", backgroundStyle: "ai-decide", animations: "moderate" },
  typography: { fontFamily: "modern-sans", imageryStyle: "stock-photos", heroPreference: "ai-decide" },
  team: { enabled: false, members: [] },
  pages: { selected: ["home","services","about","contact"], primaryCTA: "contact-form", contentTone: "professional-approachable", specialFeatures: [], additionalNotes: "", pageDescriptions: {} },
  useEmojis: false,
  websiteLanguage: "English",
  logo: { uploaded: false, dataUrl: "", fileName: "" },
};

const STRIPE_PAYMENT_LINK = "https://buy.stripe.com/bJeeV5dFPc6TdqAaG600000";
const PRICE = 59.99;

type TemplateMapTo = { businessType: string; style: string; primaryColor: string; secondaryColor: string; darkMode: boolean; fontFamily: string };

const VISUAL_STYLES = [
  { id: "minimalist",   name: "Minimalist",          desc: "Modern, premium brands" },
  { id: "modern-clean", name: "Modern & Clean",       desc: "Tech, services" },
  { id: "bold-dark",    name: "Bold & Dark",          desc: "Creative, trendy brands" },
  { id: "corporate",    name: "Corporate",            desc: "Law, finance, consulting" },
  { id: "creative",     name: "Creative & Vibrant",   desc: "Design, marketing agencies" },
  { id: "elegant",      name: "Elegant & Luxury",     desc: "Fashion, jewelry, high-end" },
  { id: "warm",         name: "Warm & Friendly",      desc: "Health, beauty, community" },
  { id: "futuristic",   name: "High Tech",            desc: "Tech, SaaS, startups" },
  { id: "playful",      name: "Playful & Fun",        desc: "Kids, lifestyle, entertainment" },
];
const PERSONALITY_LEVELS = [
  { id: "minimal",   name: "Very simple",        desc: "Content first, minimal decoration" },
  { id: "balanced",  name: "Balanced",           desc: "Professional with personality" },
  { id: "strong",    name: "Strong personality", desc: "Bold, memorable, distinctive" },
  { id: "ai-decide", name: "AI decides",         desc: "Best match for your style" },
];
const BACKGROUND_STYLES = [
  { id: "white",     label: "White / Light" },
  { id: "cream",     label: "Cream / Warm" },
  { id: "dark",      label: "Dark" },
  { id: "gradient",  label: "Gradient" },
  { id: "photo",     label: "Photo background" },
  { id: "ai-decide", label: "AI decides" },
];
const ANIMATION_OPTS = [
  { id: "minimal",   name: "Minimal",    desc: "Fast loading, no animations" },
  { id: "moderate",  name: "Moderate",   desc: "Smooth, professional transitions" },
  { id: "rich",      name: "Rich",       desc: "Engaging, modern interactions" },
  { id: "ai-decide", name: "AI decides", desc: "Best for your style" },
];
const FONTS = [
  { id: "modern-sans",     name: "Modern Sans",      desc: "Tech, modern services",       sample: "Aa", style: { fontFamily: "ui-sans-serif,system-ui,sans-serif", fontWeight: 400 } },
  { id: "classic-serif",   name: "Classic Serif",    desc: "Law, finance, editorial",     sample: "Aa", style: { fontFamily: "Georgia,'Times New Roman',serif", fontWeight: 400 } },
  { id: "geo-bold",        name: "Geometric Bold",   desc: "Creative, design, startups",  sample: "Aa", style: { fontFamily: "ui-sans-serif,system-ui,sans-serif", fontWeight: 900 } },
  { id: "mono",            name: "Monospace",         desc: "Tech, developer-focused",     sample: "Aa", style: { fontFamily: "ui-monospace,'Cascadia Code',monospace", fontWeight: 400 } },
  { id: "playful",         name: "Playful Rounded",  desc: "Kids, lifestyle, community",  sample: "Aa", style: { fontFamily: "Georgia,sans-serif", fontWeight: 700 } },
  { id: "humanist-sans",   name: "Humanist Sans",    desc: "Wellness, beauty, lifestyle", sample: "Aa", style: { fontFamily: "'Manrope',ui-sans-serif,sans-serif", fontWeight: 400 } },
  { id: "luxury-serif",    name: "Luxury Serif",     desc: "Fashion, fine dining",        sample: "Aa", style: { fontFamily: "'Cormorant Garamond','Palatino Linotype',serif", fontWeight: 400, fontStyle: "italic" as const } },
  { id: "editorial-serif", name: "Editorial Serif",  desc: "Publishing, restaurants",     sample: "Aa", style: { fontFamily: "'Fraunces',Georgia,serif", fontWeight: 500 } },
  { id: "space-grotesk",   name: "Space Grotesk",    desc: "Tech, Web3, creative studios",sample: "Aa", style: { fontFamily: "'Space Grotesk',ui-sans-serif,sans-serif", fontWeight: 500 } },
];
const IMAGERY_STYLES = [
  { id: "photography",   name: "Photography Heavy",    desc: "Professional photos throughout" },
  { id: "illustrations", name: "Illustrations & Icons",desc: "Custom icons and illustrations" },
  { id: "minimal-img",   name: "Minimalist",           desc: "Mostly text and solid colors" },
  { id: "stock-photos",  name: "Stock Photos",         desc: "Professional stock imagery" },
  { id: "mixed",         name: "Mixed Style",          desc: "Illustrations + photos combined" },
];
const HERO_PREFS = [
  { id: "bg-image",  name: "Background image",         desc: "Full-bleed photo behind content" },
  { id: "gradient",  name: "Gradient background",      desc: "Color gradient, no photo" },
  { id: "overlay",   name: "Image with text overlay",  desc: "Hero photo with text on top" },
  { id: "ai-decide", name: "Let AI decide",            desc: "Best choice for your style" },
];

const SCHEDULE_TYPES = [
  { id: "no-schedule", label: "I don't have a schedule", desc: "No regular hours" },
  { id: "online",      label: "Fully online",             desc: "No physical hours" },
  { id: "always-open", label: "Always open / 24·7",       desc: "Round-the-clock access" },
  { id: "custom",      label: "I have specific hours",    desc: "Set hours per day" },
] as const;

const BUSINESS_TYPES = [
  "Restaurant","Hair Salon","Photography","Dental Clinic","Consulting","E-commerce",
  "Real Estate","Fitness","Law Firm","Architecture","Plumbing","Accounting",
  "Marketing Agency","Medical Clinic","Tech Startup","Beauty/Spa","Other",
];
const EXPERIENCE_OPTIONS = [
  { id: "", label: "Select…" },
  { id: "new", label: "New / Just started" },
  { id: "1-2", label: "1–2 years" },
  { id: "3-5", label: "3–5 years" },
  { id: "5-10", label: "5–10 years" },
  { id: "10+", label: "10+ years" },
  { id: "20+", label: "20+ years" },
];

const MAIN_GOALS = [
  { id: "calls",       name: "Get phone calls",             desc: "Drive call inquiries from the homepage" },
  { id: "bookings",    name: "Get bookings / appointments", desc: "Fill your calendar online" },
  { id: "sell",        name: "Sell products online",        desc: "E-commerce or direct sales" },
  { id: "leads",       name: "Generate leads",              desc: "B2B inquiries & quote requests" },
  { id: "present",     name: "Present services",            desc: "Showcase what you offer" },
  { id: "credibility", name: "Build credibility",           desc: "Establish authority & trust" },
  { id: "portfolio",   name: "Show portfolio / gallery",    desc: "Display your creative work" },
  { id: "info",        name: "Share information",           desc: "Nonprofit, education, community" },
];
const VISITOR_FEELS = ["Trust","Excitement","Calm","Luxury","Safety","Professionalism","Warmth","Innovation","Creativity","Fun"];

const OFFERS_TYPES = [
  { id: "services",  name: "Services",                desc: "I provide services to clients" },
  { id: "products",  name: "Products",                desc: "I sell physical or digital products" },
  { id: "both",      name: "Both",                    desc: "Services and products" },
  { id: "info",      name: "Information / Portfolio", desc: "No direct sales — just showcasing" },
];
const PRICE_VISIBILITY = [
  { id: "exact",    label: "Show exact prices" },
  { id: "from",     label: "Show 'from' prices" },
  { id: "packages", label: "Packages only" },
  { id: "quote",    label: "Request a quote" },
  { id: "hide",     label: "Hide prices" },
];

const CORE_PAGES = [
  { id: "home",     label: "Home",              desc: "Always included",  required: true },
  { id: "services", label: "Services/Products", desc: "What you offer",   required: false },
  { id: "about",    label: "About Us",          desc: "Your story",       required: false },
  { id: "contact",  label: "Contact",           desc: "Get in touch",     required: false },
];
const EXTRA_PAGES = [
  { id: "portfolio",    label: "Portfolio/Gallery",   desc: "Showcase your work" },
  { id: "pricing",      label: "Pricing/Plans",       desc: "Service pricing" },
  { id: "team",         label: "Team/Staff",          desc: "Meet the team" },
  { id: "faq",          label: "FAQ/Help",            desc: "Common questions" },
  { id: "blog",         label: "Blog/News",           desc: "Articles & updates" },
  { id: "testimonials", label: "Testimonials",        desc: "Customer reviews" },
  { id: "privacy",      label: "Privacy Policy",      desc: "Legal page" },
  { id: "terms",        label: "Terms of Service",    desc: "Legal page" },
  { id: "booking",      label: "Booking",             desc: "Appointments" },
  { id: "newsletter",   label: "Newsletter Signup",   desc: "Email list" },
];

const CTA_OPTIONS = [
  { id: "contact-form", label: "Contact form" },
  { id: "phone",        label: "Phone call" },
  { id: "email",        label: "Email" },
  { id: "booking",      label: "Booking/Appointment" },
  { id: "shop",         label: "Shop/Buy" },
  { id: "newsletter",   label: "Newsletter signup" },
  { id: "multiple",     label: "Multiple CTAs" },
];
const TONE_OPTIONS = [
  { id: "formal",                   label: "Professional & Formal" },
  { id: "professional-approachable", label: "Professional & Approachable" },
  { id: "casual",                   label: "Casual & Friendly" },
  { id: "creative",                 label: "Creative & Expressive" },
  { id: "ai-decide",                label: "Let AI decide" },
];
const SPECIAL_FEATURES = [
  { id: "testimonials",  label: "Customer testimonials section" },
  { id: "social",        label: "Social media integration" },
  { id: "newsletter",    label: "Email newsletter signup" },
  { id: "search",        label: "Search functionality" },
  { id: "multilang",     label: "Multi-language support" },
  { id: "accessibility", label: "Accessibility features (WCAG)" },
  { id: "analytics",     label: "Analytics integration" },
];
const LANGUAGES = ["English","Español","Français","Deutsch","Italiano","Português","Türkçe","Nederlands","العربية","中文","日本語","Română","Polski","Русский"];

const COLOR_GROUPS: { label: string; colors: { hex: string; name: string }[] }[] = [
  { label: "Neutrals", colors: [
    { hex: "#0e1a2b", name: "Ink" },{ hex: "#1f2937", name: "Charcoal" },{ hex: "#374151", name: "Dark Gray" },
    { hex: "#6b7280", name: "Gray" },{ hex: "#9ca3af", name: "Light Gray" },{ hex: "#f5f5f5", name: "Off White" },
    { hex: "#ffffff", name: "White" },
  ]},
  { label: "Blues", colors: [
    { hex: "#1e3a5f", name: "Navy" },{ hex: "#1d4ed8", name: "Dark Blue" },{ hex: "#2563eb", name: "Royal Blue" },
    { hex: "#3b82f6", name: "Blue" },{ hex: "#60a5fa", name: "Sky Blue" },
  ]},
  { label: "Purples & Indigos", colors: [
    { hex: "#4f46e5", name: "Deep Indigo" },{ hex: "#7c3aed", name: "Deep Violet" },{ hex: "#8b5cf6", name: "Violet" },
    { hex: "#a855f7", name: "Purple" },{ hex: "#c084fc", name: "Light Purple" },
  ]},
  { label: "Greens", colors: [
    { hex: "#065f46", name: "Dark Green" },{ hex: "#059669", name: "Forest" },{ hex: "#10b981", name: "Green" },
    { hex: "#34d399", name: "Emerald" },{ hex: "#6b7c3f", name: "Olive" },
  ]},
  { label: "Reds & Burgundy", colors: [
    { hex: "#800020", name: "Burgundy" },{ hex: "#991b1b", name: "Deep Crimson" },{ hex: "#dc2626", name: "Red" },
    { hex: "#ef4444", name: "Bright Red" },{ hex: "#f87171", name: "Coral" },
  ]},
  { label: "Pinks", colors: [
    { hex: "#9d174d", name: "Deep Pink" },{ hex: "#be185d", name: "Dark Pink" },{ hex: "#ec4899", name: "Pink" },
    { hex: "#f9a8d4", name: "Light Pink" },
  ]},
  { label: "Oranges & Ambers", colors: [
    { hex: "#c2410c", name: "Burnt Orange" },{ hex: "#ea580c", name: "Deep Orange" },{ hex: "#f0502a", name: "Orange" },
    { hex: "#FF5A1F", name: "Vivid Orange" },{ hex: "#f59e0b", name: "Gold" },{ hex: "#fbbf24", name: "Amber" },
  ]},
  { label: "Teals & Cyans", colors: [
    { hex: "#134e4a", name: "Deep Teal" },{ hex: "#0891b2", name: "Teal" },{ hex: "#06b6d4", name: "Cyan" },
    { hex: "#0a8094", name: "Ocean" },{ hex: "#22d3ee", name: "Sky Cyan" },
  ]},
  { label: "Browns & Warm", colors: [
    { hex: "#3d2b1f", name: "Chocolate" },{ hex: "#78350f", name: "Dark Brown" },{ hex: "#a67c52", name: "Bronze" },
    { hex: "#c8b8a2", name: "Warm Beige" },{ hex: "#faf8f5", name: "Warm White" },
  ]},
];

// ─── SVG Icons ────────────────────────────────────────────────────────────────

const ICheck = () => (
  <svg viewBox="0 0 16 16" fill="none" width="12" height="12">
    <path d="M3.5 8.2 6.6 11.3 12.5 4.8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const ISpark = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path d="M12 3l1.6 5.4L19 10l-5.4 1.6L12 17l-1.6-5.4L5 10l5.4-1.6L12 3z" fill="currentColor" />
  </svg>
);
const IPlus = () => (
  <svg viewBox="0 0 16 16" fill="none" width="13" height="13">
    <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);
const ITrash = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
    <path d="M3 4.5h10M6.5 4V3h3v1M5 4.5l.5 8h5l.5-8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const IArrowR = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const IArrowL = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
    <path d="M13 8H3M7 4 3 8l4 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const IUpload = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M12 15V4m0 0L8 8m4-4 4 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M5 16v2a2 2 0 002 2h10a2 2 0 002-2v-2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
  </svg>
);
const IX = () => (
  <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
    <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);
const ILock = () => (
  <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
    <rect x="3" y="7" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
    <path d="M5 7V5a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);
const ITriangle = () => (
  <svg width="18" height="16" viewBox="0 0 24 22" fill="none">
    <path d="M12 1l11 19H1L12 1z" fill="var(--wf-ok)" />
  </svg>
);

// ─── Primitive UI Components ──────────────────────────────────────────────────

function StepHead({ idx, total, kicker, title, sub }: { idx: number; total: number; kicker: string; title: string; sub: string }) {
  return (
    <div className="wf-step-head">
      <div className="wf-eyebrow"><span className="wf-idx">{String(idx).padStart(2,"0")}/{String(total).padStart(2,"0")}</span> {kicker}</div>
      <h1 className="wf-step-title">{title}</h1>
      <p className="wf-step-sub">{sub}</p>
    </div>
  );
}

function Block({ label, required, optional, note, children }: { label?: string; required?: boolean; optional?: boolean; note?: string; children: React.ReactNode }) {
  return (
    <div className="wf-block">
      {label && (
        <div className="wf-blabel">
          {label}
          {required && <span className="req">*</span>}
          {optional && <span className="opt">(optional)</span>}
        </div>
      )}
      {note && <div className="wf-bnote">{note}</div>}
      {children}
    </div>
  );
}

function WizInput({ value, onChange, placeholder, type = "text", disabled }: { value: string; onChange: (v: string) => void; placeholder?: string; type?: string; disabled?: boolean }) {
  return (
    <input className="wf-input" type={type} value={value || ""} placeholder={placeholder}
      onChange={e => onChange(e.target.value)} disabled={disabled}
      style={disabled ? { opacity: 0.4 } : undefined} />
  );
}

function WizTextarea({ value, onChange, placeholder, maxLength = 500, aiOn, onAiToggle }: {
  value: string; onChange: (v: string) => void; placeholder?: string; maxLength?: number;
  aiOn?: boolean; onAiToggle?: (v: boolean) => void;
}) {
  const len = (value || "").length;
  return (
    <div className="wf-field">
      <div style={{ position: "relative" }}>
        <textarea className="wf-textarea" value={value || ""} placeholder={placeholder}
          maxLength={maxLength} onChange={e => onChange(e.target.value)} />
        <div className={`wf-charcount${len > maxLength * 0.88 ? " warn" : ""}`}>{len}/{maxLength}</div>
      </div>
      {onAiToggle !== undefined && (
        <div className={`wf-ai${aiOn ? "" : " off"}`} onClick={() => onAiToggle(!aiOn)}>
          <span className="wf-ai-icon"><ISpark /></span>
          <div className="wf-ai-body">
            <div className="wf-ai-h">AI will rephrase this for better quality <span className="wf-ai-tag">{aiOn ? "On" : "Off"}</span></div>
            <div className="wf-ai-d">{aiOn ? "AI improves grammar, tone & clarity while keeping your message." : "Keeping your exact wording — AI rephrasing is off."}</div>
          </div>
          <div className={`wf-switch${aiOn ? " on" : ""}`}><i /></div>
        </div>
      )}
    </div>
  );
}

function WizOptGrid({ options, value, onChange, cols = 2 }: { options: { id: string; name: string; desc?: string; icon?: React.ReactNode }[]; value: string; onChange: (v: string) => void; cols?: 2 | 3 | 4 }) {
  return (
    <div className={`wf-opt-grid wf-og-${cols}`}>
      {options.map(o => {
        const sel = value === o.id;
        return (
          <button key={o.id} type="button" className={`wf-opt-card${sel ? " sel" : ""}`} onClick={() => onChange(o.id)}>
            <span className="wf-tick"><ICheck /></span>
            {o.icon && <span style={{ marginBottom: 6 }}>{o.icon}</span>}
            <span className="wf-oct">{o.name}</span>
            {o.desc && <span className="wf-ocd">{o.desc}</span>}
          </button>
        );
      })}
    </div>
  );
}

function WizChipSelect({ options, value, onChange, multi = false }: { options: { id: string; label: string }[]; value: string | string[]; onChange: (v: string | string[]) => void; multi?: boolean }) {
  const arr = multi ? (value as string[]) || [] : value;
  const toggle = (id: string) => {
    if (multi) {
      const set = new Set(arr as string[]);
      set.has(id) ? set.delete(id) : set.add(id);
      onChange([...set]);
    } else {
      onChange(id);
    }
  };
  return (
    <div className="wf-chip-wrap">
      {options.map(o => {
        const on = multi ? (arr as string[]).includes(o.id) : arr === o.id;
        return (
          <button key={o.id} type="button" className={`wf-chip${on ? " on" : ""}`} onClick={() => toggle(o.id)}>
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function WizCheckRow({ label, on, onToggle }: { label: string; on: boolean; onToggle: (v: boolean) => void }) {
  return (
    <div className={`wf-checkrow${on ? " on" : ""}`} onClick={() => onToggle(!on)} style={{ cursor: "pointer" }}>
      <span className="wf-checkbox"><ICheck /></span>
      {label}
    </div>
  );
}

function WizSwitch({ on, onToggle }: { on: boolean; onToggle: (v: boolean) => void }) {
  return (
    <div className={`wf-switch${on ? " on" : ""}`} onClick={() => onToggle(!on)} style={{ cursor: "pointer" }}><i /></div>
  );
}

function WizColorPicker({ value, onChange, label = "Selected" }: { value: string; onChange: (v: string) => void; label?: string }) {
  return (
    <div>
      <div className="wf-color-readout">
        <span className="wf-color-big" style={{ background: value }} />
        <div>
          <div className="wf-color-lbl">{label}</div>
          <div className="wf-color-hex">{value}</div>
        </div>
        <label className="wf-custom-color">
          Custom
          <input type="color" value={value} onChange={e => onChange(e.target.value)}
            style={{ width: 26, height: 26, border: "none", cursor: "pointer", borderRadius: 5, padding: 1, background: "transparent" }} />
        </label>
      </div>
      <div className="wf-swatch-stack">
        {COLOR_GROUPS.map(g => (
          <div className="wf-swatch-group" key={g.label}>
            <div className="wf-sg-lbl">{g.label}</div>
            <div className="wf-swatch-row">
              {g.colors.map(c => (
                <button key={c.hex} type="button" title={c.name}
                  className={`wf-swatch${value.toLowerCase() === c.hex.toLowerCase() ? " sel" : ""}`}
                  style={{ background: c.hex }} onClick={() => onChange(c.hex)} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function WizRepeater({ items, onChange, placeholder = "e.g. Deep tissue massage" }: { items: string[]; onChange: (v: string[]) => void; placeholder?: string }) {
  const list = items && items.length ? items : [""];
  const set = (i: number, v: string) => { const next = [...list]; next[i] = v; onChange(next); };
  const add = () => onChange([...list, ""]);
  const del = (i: number) => { const next = list.filter((_, j) => j !== i); onChange(next.length ? next : [""]); };
  return (
    <div className="wf-rep">
      {list.map((it, i) => (
        <div className="wf-rep-item" key={i}>
          <span style={{ fontFamily: "var(--wf-mono)", fontSize: 11, color: "var(--wf-text3)", flexShrink: 0 }}>{String(i + 1).padStart(2, "0")}</span>
          <input className="wf-input" value={it} placeholder={placeholder} onChange={e => set(i, e.target.value)} />
          <button type="button" className="wf-rep-del" onClick={() => del(i)} aria-label="Remove"><ITrash /></button>
        </div>
      ))}
      <button type="button" className="wf-add-item" onClick={add}><IPlus /> Add item</button>
    </div>
  );
}

// ─── Location Autocomplete ─────────────────────────────────────────────────────

type NominatimResult = {
  place_id: number; display_name: string; name: string; lat: string; lon: string;
  type: string; class: string;
  address: { city?: string; town?: string; village?: string; municipality?: string; state?: string; country?: string; country_code?: string };
};

function flagEmoji(code: string): string {
  if (!code || code.length !== 2) return "";
  return code.toUpperCase().split("").map(c => String.fromCodePoint(c.charCodeAt(0) + 0x1F1A5)).join("");
}

function LocationAutocomplete({ city, country, disabled, onSelect, onClear }: {
  city: string; country: string; disabled?: boolean;
  onSelect: (city: string, country: string) => void;
  onClear: () => void;
}) {
  const [query, setQuery] = useState(city ? `${city}${country ? `, ${country}` : ""}` : "");
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setQuery(city ? `${city}${country ? `, ${country}` : ""}` : ""); }, [city, country]);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const search = async (q: string) => {
    if (q.length < 2) { setResults([]); setOpen(false); return; }
    setLoading(true);
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=8&addressdetails=1&accept-language=en`;
      const res = await fetch(url, { headers: { "User-Agent": "insixlive-website-builder/1.0" } });
      const data: NominatimResult[] = await res.json();
      const filtered = data.filter(r => r.class === "place" || ["city","town","village","administrative","hamlet"].includes(r.type)).slice(0, 7);
      setResults(filtered); setOpen(filtered.length > 0);
    } catch { setResults([]); }
    finally { setLoading(false); }
  };

  const handleChange = (val: string) => {
    setQuery(val);
    if (city) onClear();
    clearTimeout(timer.current);
    timer.current = setTimeout(() => search(val), 350);
  };
  const handleSelect = (r: NominatimResult) => {
    const c = r.address.city || r.address.town || r.address.village || r.address.municipality || r.name;
    const co = r.address.country || "";
    setQuery(`${c}${co ? `, ${co}` : ""}`);
    setResults([]); setOpen(false);
    onSelect(c, co);
  };

  return (
    <div ref={wrapRef} style={{ position: "relative" }}>
      <div style={{ position: "relative" }}>
        <input className="wf-input" value={query} disabled={disabled}
          onChange={e => handleChange(e.target.value)}
          placeholder="Search for a city…" autoComplete="off"
          onFocus={() => { if (results.length > 0) setOpen(true); }}
          style={{ paddingRight: 40, opacity: disabled ? 0.4 : 1 }} />
        <div style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", display: "flex", gap: 4 }}>
          {loading && <svg width="14" height="14" viewBox="0 0 14 14" style={{ animation: "spin 0.7s linear infinite" }}><circle cx="7" cy="7" r="5" fill="none" stroke="var(--wf-border)" strokeWidth="2"/><path d="M7 2a5 5 0 015 5" fill="none" stroke="var(--wf-text3)" strokeWidth="2" strokeLinecap="round"/></svg>}
          {city && !loading && <button type="button" onClick={onClear} style={{ width: 18, height: 18, borderRadius: "50%", background: "var(--wf-surf3)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--wf-text2)" }}><IX /></button>}
        </div>
      </div>
      {open && results.length > 0 && (
        <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, zIndex: 200, background: "var(--wf-bg2)", border: "1px solid var(--wf-border)", borderRadius: 12, boxShadow: "var(--wf-shadow)", overflow: "hidden" }}>
          {results.map(r => {
            const c = r.address.city || r.address.town || r.address.village || r.address.municipality || r.name;
            const co = r.address.country || "";
            const flag = r.address.country_code ? flagEmoji(r.address.country_code) : "";
            const sub = [r.address.state, r.address.country].filter(Boolean).join(", ");
            return (
              <button key={r.place_id} type="button" onMouseDown={e => { e.preventDefault(); handleSelect(r); }}
                style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", border: "none", borderBottom: "1px solid var(--wf-surf3)", background: "transparent", cursor: "pointer", textAlign: "left" }}
                onMouseEnter={e => (e.currentTarget.style.background = "var(--wf-surf2)")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                {flag && <span style={{ fontSize: 18 }}>{flag}</span>}
                <div>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "var(--wf-text)" }}>{c}{co ? `, ${co}` : ""}</p>
                  {sub && sub !== co && <p style={{ margin: 0, fontSize: 11, color: "var(--wf-text3)" }}>{sub}</p>}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Schedule Picker ──────────────────────────────────────────────────────────

function SchedulePicker({ schedule, onChange }: { schedule: WizardData["schedule"]; onChange: (s: WizardData["schedule"]) => void }) {
  const setType = (type: WizardData["schedule"]["type"]) => onChange({ ...schedule, type });
  const setDay = (day: string, field: keyof DayHours, val: string | boolean) =>
    onChange({ ...schedule, hours: { ...schedule.hours, [day]: { ...schedule.hours[day], [field]: val } } });

  const times: string[] = [];
  for (let h = 0; h < 24; h++) { ["00","30"].forEach(m => times.push(`${String(h).padStart(2,"0")}:${m}`)); }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div className="wf-opt-grid wf-og-2">
        {SCHEDULE_TYPES.map(s => {
          const on = schedule.type === s.id;
          return (
            <button key={s.id} type="button" className={`wf-opt-card${on ? " sel" : ""}`}
              onClick={() => setType(s.id as WizardData["schedule"]["type"])}>
              <span className="wf-tick"><ICheck /></span>
              <span className="wf-oct">{s.label}</span>
              <span className="wf-ocd">{s.desc}</span>
            </button>
          );
        })}
      </div>
      {schedule.type === "custom" && (
        <div className="wf-sched">
          {DAYS.map(day => {
            const h = schedule.hours[day] ?? { open: "09:00", close: "17:00", closed: false };
            return (
              <div key={day} className={`wf-srow${h.closed ? " closed" : ""}`}>
                <span className="wf-sday">{DAY_LABELS[day]}</span>
                <WizSwitch on={!h.closed} onToggle={v => setDay(day, "closed", !v)} />
                <div className="wf-stimes">
                  {h.closed ? <span>Closed</span> : (
                    <>
                      <select value={h.open} disabled={h.closed} onChange={e => setDay(day, "open", e.target.value)}
                        style={{ background: "var(--wf-surf3)", border: "1px solid var(--wf-border)", borderRadius: 6, padding: "4px 8px", fontFamily: "var(--wf-mono)", fontSize: 11, color: "var(--wf-text)" }}>
                        {times.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                      <span>—</span>
                      <select value={h.close} disabled={h.closed} onChange={e => setDay(day, "close", e.target.value)}
                        style={{ background: "var(--wf-surf3)", border: "1px solid var(--wf-border)", borderRadius: 6, padding: "4px 8px", fontFamily: "var(--wf-mono)", fontSize: 11, color: "var(--wf-text)" }}>
                        {times.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Step 01 — Template ───────────────────────────────────────────────────────

function Step01Template({ data, setData }: { data: WizardData; setData: React.Dispatch<React.SetStateAction<WizardData>> }) {
  const handleSelect = (id: string, mapTo: unknown) => {
    const m = mapTo as TemplateMapTo;
    setData(p => ({
      ...p,
      templateId: id,
      ...(id && m ? {
        business: { ...p.business, type: m.businessType },
        design: { ...p.design, style: m.style, primaryColor: m.primaryColor, secondaryColor: m.secondaryColor, darkMode: m.darkMode },
        typography: { ...p.typography, fontFamily: m.fontFamily },
      } : {}),
    }));
  };

  return (
    <div>
      <StepHead idx={1} total={10} kicker="Pick your starting point" title="Choose a template"
        sub="Start from an industry template — or choose scratch to configure everything yourself." />
      <TemplateGallery selectedId={data.templateId} onSelect={handleSelect} />
    </div>
  );
}

// ─── Step 02 — Design Style ───────────────────────────────────────────────────

function Step02Design({ data, setData }: { data: WizardData; setData: React.Dispatch<React.SetStateAction<WizardData>> }) {
  const d = data.design;
  const set = <K extends keyof WizardData["design"]>(k: K, v: WizardData["design"][K]) =>
    setData(p => ({ ...p, design: { ...p.design, [k]: v } }));

  return (
    <div>
      <StepHead idx={2} total={10} kicker="Design aesthetic" title="Pick your visual style"
        sub="The overall personality and mood of your site. Fine-tune colours and type in the next two steps." />
      <Block label="Visual style" required>
        <WizOptGrid cols={3} options={VISUAL_STYLES.map(s => ({ id: s.id, name: s.name, desc: s.desc }))}
          value={d.style} onChange={v => set("style", v)} />
      </Block>
      <Block label="Personality level">
        <WizOptGrid cols={2} options={PERSONALITY_LEVELS.map(s => ({ id: s.id, name: s.name, desc: s.desc }))}
          value={d.personalityLevel} onChange={v => set("personalityLevel", v)} />
      </Block>
      <Block label="Background style">
        <WizChipSelect options={BACKGROUND_STYLES.map(s => ({ id: s.id, label: s.label }))}
          value={d.backgroundStyle} onChange={v => set("backgroundStyle", v as string)} />
      </Block>
    </div>
  );
}

// ─── Step 03 — Colors & Motion ────────────────────────────────────────────────

function Step03Colors({ data, setData }: { data: WizardData; setData: React.Dispatch<React.SetStateAction<WizardData>> }) {
  const d = data.design;
  const set = <K extends keyof WizardData["design"]>(k: K, v: WizardData["design"][K]) =>
    setData(p => ({ ...p, design: { ...p.design, [k]: v } }));

  return (
    <div>
      <StepHead idx={3} total={10} kicker="Colour & motion" title="Your brand colours"
        sub="These flow straight into the generated site — pick a primary, an accent, and how lively it should feel." />
      <Block label="Primary brand color" required note="The dominant colour — buttons, links, key highlights.">
        <WizColorPicker value={d.primaryColor} onChange={v => set("primaryColor", v)} label="Primary" />
      </Block>
      <Block label="Accent / secondary color" note="Used for supporting elements and contrast.">
        <WizColorPicker value={d.secondaryColor} onChange={v => set("secondaryColor", v)} label="Accent" />
      </Block>
      <Block label="Animations & interactions">
        <WizOptGrid cols={2} options={ANIMATION_OPTS.map(a => ({ id: a.id, name: a.name, desc: a.desc }))}
          value={d.animations} onChange={v => set("animations", v)} />
      </Block>
      <Block label="Dark mode">
        <WizCheckRow label="Include a dark variant — appealing on mobile, modern UX"
          on={d.darkMode} onToggle={v => set("darkMode", v)} />
      </Block>
    </div>
  );
}

// ─── Step 04 — Type & Imagery ─────────────────────────────────────────────────

function Step04TypeImagery({ data, setData }: { data: WizardData; setData: React.Dispatch<React.SetStateAction<WizardData>> }) {
  const t = data.typography;
  const l = data.logo;
  const setTypo = <K extends keyof WizardData["typography"]>(k: K, v: WizardData["typography"][K]) =>
    setData(p => ({ ...p, typography: { ...p.typography, [k]: v } }));
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = ev => setData(p => ({ ...p, logo: { uploaded: true, dataUrl: ev.target?.result as string, fileName: f.name } }));
    reader.readAsDataURL(f);
  };

  return (
    <div>
      <StepHead idx={4} total={10} kicker="Typography & imagery" title="Type, photos & your logo"
        sub="Lock in the lettering and the visual language, then drop in a logo if you have one." />
      <Block label="Typography style" required>
        <div className="wf-opt-grid wf-og-3">
          {FONTS.map(f => {
            const sel = t.fontFamily === f.id;
            return (
              <button key={f.id} type="button" className={`wf-opt-card${sel ? " sel" : ""}`}
                onClick={() => setTypo("fontFamily", f.id)}>
                <span className="wf-tick"><ICheck /></span>
                <span style={{ ...f.style, fontSize: 28, lineHeight: 1, marginBottom: 7, color: "var(--wf-text)", display: "block" }}>{f.sample}</span>
                <span className="wf-oct">{f.name}</span>
                <span className="wf-ocd">{f.desc}</span>
              </button>
            );
          })}
        </div>
      </Block>
      <Block label="Imagery style">
        <WizOptGrid cols={3} options={IMAGERY_STYLES.map(i => ({ id: i.id, name: i.name, desc: i.desc }))}
          value={t.imageryStyle} onChange={v => setTypo("imageryStyle", v)} />
      </Block>
      <Block label="Hero section style">
        <WizOptGrid cols={2} options={HERO_PREFS.map(h => ({ id: h.id, name: h.name, desc: h.desc }))}
          value={t.heroPreference} onChange={v => setTypo("heroPreference", v)} />
      </Block>
      <Block label="Logo" optional note="PNG, SVG, JPG or WebP · Max 5MB — AI places it in the header, sized for navigation.">
        {l.uploaded && l.dataUrl ? (
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <img src={l.dataUrl} alt={l.fileName} style={{ height: 48, maxWidth: 120, objectFit: "contain", borderRadius: 8, border: "1px solid var(--wf-border)" }} />
            <div>
              <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: "var(--wf-text2)" }}>{l.fileName}</p>
              <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                <button type="button" onClick={() => fileRef.current?.click()} style={{ fontSize: 11, color: "var(--wf-acc)", background: "none", border: "none", cursor: "pointer", padding: 0 }}>Replace</button>
                <button type="button" onClick={() => setData(p => ({ ...p, logo: { uploaded: false, dataUrl: "", fileName: "" } }))} style={{ fontSize: 11, color: "#ef4444", background: "none", border: "none", cursor: "pointer", padding: 0 }}>Remove</button>
              </div>
            </div>
          </div>
        ) : (
          <label className="wf-upload" style={{ display: "block" }}>
            <input ref={fileRef} type="file" accept=".png,.svg,.jpg,.jpeg,.webp" style={{ display: "none" }} onChange={handleFile} />
            <div className="wf-up-ico"><IUpload /></div>
            <div className="wf-up-h">Upload your logo</div>
            <div className="wf-up-d">Drag & drop or click to browse</div>
          </label>
        )}
      </Block>
    </div>
  );
}

// ─── Step 05 — Business ───────────────────────────────────────────────────────

function Step05Business({ data, setData }: { data: WizardData; setData: React.Dispatch<React.SetStateAction<WizardData>> }) {
  const b = data.business;
  const set = <K extends keyof WizardData["business"]>(k: K, v: WizardData["business"][K]) =>
    setData(p => ({ ...p, business: { ...p.business, [k]: v } }));

  return (
    <div>
      <StepHead idx={5} total={10} kicker="Tell us about your business" title="The basics"
        sub="Name, contact details, location and opening hours. This grounds everything the AI writes for you." />

      <Block label="Business name" required>
        <WizInput value={b.name} onChange={v => set("name", v)} placeholder="e.g. Northside Dental" />
      </Block>

      <Block label="Business type" required>
        <select className="wf-input" value={b.type} onChange={e => set("type", e.target.value)}>
          {BUSINESS_TYPES.map(t => <option key={t}>{t}</option>)}
        </select>
      </Block>

      <Block label="Business description" required note="What you do, in a sentence or two. The AI turns this into your hero and intro copy.">
        <WizTextarea value={b.description} onChange={v => set("description", v)}
          placeholder="What you do, who you serve, what makes you different…"
          maxLength={500} aiOn={b.aboutAiRephrase} onAiToggle={v => set("aboutAiRephrase", v)} />
      </Block>

      <Block label="About your business" optional>
        <WizTextarea value={b.aboutText} onChange={v => set("aboutText", v)}
          placeholder="Your story, mission, what makes you different…" maxLength={800}
          aiOn={b.aboutAiRephrase} onAiToggle={v => set("aboutAiRephrase", v)} />
      </Block>

      <Block label="Location" required={b.hasLocation}>
        <LocationAutocomplete city={b.locationCity} country={b.locationCountry} disabled={!b.hasLocation}
          onSelect={(city, country) => setData(p => ({ ...p, business: { ...p.business, locationCity: city, locationCountry: country, location: `${city}${country ? `, ${country}` : ""}` } }))}
          onClear={() => setData(p => ({ ...p, business: { ...p.business, locationCity: "", locationCountry: "", location: "" } }))} />
        <div style={{ marginTop: 10 }}>
          <WizCheckRow label="I don't have a physical location" on={!b.hasLocation} onToggle={v => set("hasLocation", !v)} />
        </div>
        {b.hasLocation && (
          <div style={{ marginTop: 10 }}>
            <div className="wf-blabel">Service area <span className="opt">(optional)</span></div>
            <WizInput value={b.serviceArea} onChange={v => set("serviceArea", v)} placeholder="e.g. Greater London, nationwide, remote" />
          </div>
        )}
      </Block>

      <Block>
        <div className="wf-grid2">
          <div>
            <div className="wf-blabel">Email <span className="opt">(optional)</span></div>
            <WizInput value={b.email} onChange={v => set("email", v)} placeholder="hello@business.com" type="email" />
          </div>
          <div>
            <div className="wf-blabel">Phone <span className="req">*</span></div>
            <WizInput value={b.phone} onChange={v => set("phone", v)} placeholder="+1 555 000 0000" disabled={!b.hasPhone} />
          </div>
        </div>
        <div style={{ marginTop: 10 }}>
          <WizCheckRow label="I don't have a phone number" on={!b.hasPhone} onToggle={v => set("hasPhone", !v)} />
        </div>
      </Block>

      <Block label="Business schedule">
        <SchedulePicker schedule={data.schedule} onChange={s => setData(p => ({ ...p, schedule: s }))} />
      </Block>

      <Block>
        <div className="wf-grid2">
          <div>
            <div className="wf-blabel">Years in business <span className="opt">(optional)</span></div>
            <select className="wf-input" value={b.experience} onChange={e => set("experience", e.target.value)}>
              {EXPERIENCE_OPTIONS.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
            </select>
          </div>
          <div>
            <div className="wf-blabel">Your name <span className="opt">(optional)</span></div>
            <WizInput value={b.ownerName} onChange={v => set("ownerName", v)} placeholder="So we can address you" />
          </div>
        </div>
      </Block>
    </div>
  );
}

// ─── Step 06 — Goals & Audience ───────────────────────────────────────────────

function Step06Goals({ data, setData }: { data: WizardData; setData: React.Dispatch<React.SetStateAction<WizardData>> }) {
  const g = data.goals;
  const set = <K extends keyof WizardData["goals"]>(k: K, v: WizardData["goals"][K]) =>
    setData(p => ({ ...p, goals: { ...p.goals, [k]: v } }));

  return (
    <div>
      <StepHead idx={6} total={10} kicker="Goals & audience" title="What should it accomplish?"
        sub="Tell us the job your website needs to do and who it's speaking to — we optimise the layout around it." />
      <Block label="Main goal" required note="What's the #1 thing a visitor should do?">
        <WizOptGrid cols={2} options={MAIN_GOALS.map(m => ({ id: m.id, name: m.name, desc: m.desc }))}
          value={g.mainGoal} onChange={v => set("mainGoal", v)} />
      </Block>
      <Block label="How should visitors feel when they land?" note="Pick one — this shapes colour, copy and imagery.">
        <WizChipSelect options={VISITOR_FEELS.map(f => ({ id: f, label: f }))}
          value={g.visitorFeel} onChange={v => set("visitorFeel", v as string)} />
      </Block>
      <Block label="Who is your ideal customer?" optional>
        <WizInput value={g.idealCustomer} onChange={v => set("idealCustomer", v)}
          placeholder="e.g. busy parents, local homeowners, founders…" />
      </Block>
      <Block label="What problem do you solve for them?" optional>
        <WizTextarea value={g.problemSolved} onChange={v => set("problemSolved", v)}
          placeholder="The core pain you take away" maxLength={300} />
      </Block>
      <Block label="Why should they choose you over competitors?" optional>
        <WizTextarea value={g.whyChoose} onChange={v => set("whyChoose", v)}
          placeholder="Your edge — experience, price, care, speed…" maxLength={300} />
      </Block>
    </div>
  );
}

// ─── Step 07 — Services & Pricing ─────────────────────────────────────────────

function Step07Services({ data, setData }: { data: WizardData; setData: React.Dispatch<React.SetStateAction<WizardData>> }) {
  const s = data.services;
  const set = <K extends keyof WizardData["services"]>(k: K, v: WizardData["services"][K]) =>
    setData(p => ({ ...p, services: { ...p.services, [k]: v } }));

  return (
    <div>
      <StepHead idx={7} total={10} kicker="Services & pricing" title="What you offer"
        sub="List what you sell and choose how prices appear. Leave the descriptions to us if you like." />
      <Block label="What do you offer?" required>
        <WizOptGrid cols={2} options={OFFERS_TYPES.map(o => ({ id: o.id, name: o.name, desc: o.desc }))}
          value={s.offersType} onChange={v => set("offersType", v)} />
      </Block>
      <Block label="List your main services or products" optional note="AI will generate polished descriptions for each one.">
        <WizRepeater items={s.list} onChange={v => set("list", v)} placeholder="e.g. Full website redesign" />
      </Block>
      <Block label="How should pricing be shown?">
        <WizChipSelect options={PRICE_VISIBILITY.map(p => ({ id: p.id, label: p.label }))}
          value={s.priceVisibility} onChange={v => set("priceVisibility", v as string)} />
      </Block>
    </div>
  );
}

// ─── Step 08 — Pages ──────────────────────────────────────────────────────────

function Step08Pages({ data, setData }: { data: WizardData; setData: React.Dispatch<React.SetStateAction<WizardData>> }) {
  const pg = data.pages;
  const selected = pg.selected || [];

  const toggle = (id: string, required: boolean) => {
    if (required) return;
    const next = selected.includes(id) ? selected.filter(s => s !== id) : [...selected, id];
    setData(p => ({ ...p, pages: { ...p.pages, selected: next } }));
  };

  return (
    <div>
      <StepHead idx={8} total={10} kicker="Pages & structure" title="Which pages do you need?"
        sub="Home is always included. Toggle the rest — then drop in anything you want the AI to say per section." />

      <Block label="Core pages" note="The essentials — Home is always included.">
        <div className="wf-opt-grid wf-og-2">
          {CORE_PAGES.map(p => {
            const on = p.required || selected.includes(p.id);
            return (
              <button key={p.id} type="button"
                className={`wf-opt-card${on ? " sel" : ""}`}
                onClick={() => toggle(p.id, p.required)}
                style={p.required ? { cursor: "default" } : undefined}>
                <span className="wf-tick">{p.required ? <ILock /> : <ICheck />}</span>
                <span className="wf-oct">{p.label}</span>
                <span className="wf-ocd">{p.required ? "Always included" : p.desc}</span>
              </button>
            );
          })}
        </div>
      </Block>

      <Block label="Add more pages" optional>
        <div className="wf-opt-grid wf-og-3">
          {EXTRA_PAGES.map(p => {
            const on = selected.includes(p.id);
            return (
              <button key={p.id} type="button" className={`wf-opt-card${on ? " sel" : ""}`} onClick={() => toggle(p.id, false)}>
                <span className="wf-tick"><ICheck /></span>
                <span className="wf-oct">{p.label}</span>
                <span className="wf-ocd">{p.desc}</span>
              </button>
            );
          })}
        </div>
      </Block>

      <Block label="Additional notes for the AI" optional note="Anything specific you want included or avoided on any page.">
        <WizTextarea value={pg.additionalNotes} onChange={v => setData(p => ({ ...p, pages: { ...p.pages, additionalNotes: v } }))}
          placeholder="e.g. Make the About page personal, no stock photo clichés, include our founding story…" maxLength={600} />
      </Block>
    </div>
  );
}

// ─── Step 09 — Finishing Touches ──────────────────────────────────────────────

function Step09Finishing({ data, setData }: { data: WizardData; setData: React.Dispatch<React.SetStateAction<WizardData>> }) {
  const pg = data.pages;
  const setPg = <K extends keyof WizardData["pages"]>(k: K, v: WizardData["pages"][K]) =>
    setData(p => ({ ...p, pages: { ...p.pages, [k]: v } }));

  return (
    <div>
      <StepHead idx={9} total={10} kicker="Finishing touches" title="Tone & the final details"
        sub="The last few choices that give your site personality and tell visitors exactly what to do." />

      <Block label="Primary call-to-action" required note="The main action you want visitors to take.">
        <WizChipSelect options={CTA_OPTIONS.map(c => ({ id: c.id, label: c.label }))}
          value={pg.primaryCTA} onChange={v => setPg("primaryCTA", v as string)} />
      </Block>

      <Block label="Content tone">
        <WizOptGrid cols={3} options={TONE_OPTIONS.map(t => ({ id: t.id, name: t.label }))}
          value={pg.contentTone} onChange={v => setPg("contentTone", v)} />
      </Block>

      <Block label="Team section">
        <WizOptGrid cols={2} options={[
          { id: "no",  name: "No team section",       desc: "Skip the team section" },
          { id: "yes", name: "Yes, add team members", desc: "Feature your team on the website" },
        ]} value={data.team.enabled ? "yes" : "no"}
          onChange={v => setData(p => ({ ...p, team: { ...p.team, enabled: v === "yes" } }))} />
      </Block>

      <Block label="Special features to include" optional>
        <WizChipSelect options={SPECIAL_FEATURES.map(f => ({ id: f.id, label: f.label }))}
          value={pg.specialFeatures} onChange={v => setPg("specialFeatures", v as string[])} multi />
      </Block>

      <Block label="Use emojis in your website?">
        <WizOptGrid cols={2} options={[
          { id: "no",  name: "No, keep it professional", desc: "Clean and formal — no emojis" },
          { id: "yes", name: "Yes, add personality",     desc: "Emojis to make it feel friendly" },
        ]} value={data.useEmojis ? "yes" : "no"}
          onChange={v => setData(p => ({ ...p, useEmojis: v === "yes" }))} />
      </Block>

      <Block label="Website language" note="All content will be generated in this language.">
        <select className="wf-input" value={data.websiteLanguage}
          onChange={e => setData(p => ({ ...p, websiteLanguage: e.target.value }))}>
          {LANGUAGES.map(l => <option key={l}>{l}</option>)}
        </select>
      </Block>
    </div>
  );
}

// ─── Step 10 — Review ─────────────────────────────────────────────────────────

function Step10Review({ data, goTo, onGenerate, loading, vercelAuthorized, isEditMode }: {
  data: WizardData; goTo: (n: number) => void; onGenerate: () => void;
  loading: boolean; vercelAuthorized: boolean | null; isEditMode: boolean;
}) {
  const dash = (v: string | undefined) => v || "—";
  const goalLabel = MAIN_GOALS.find(g => g.id === data.goals.mainGoal)?.name;
  const offerLabel = OFFERS_TYPES.find(o => o.id === data.services.offersType)?.name;
  const toneLabel = TONE_OPTIONS.find(t => t.id === data.pages.contentTone)?.label;
  const ctaLabel = CTA_OPTIONS.find(c => c.id === data.pages.primaryCTA)?.label;
  const styleLabel = VISUAL_STYLES.find(s => s.id === data.design.style)?.name;
  const fontLabel = FONTS.find(f => f.id === data.typography.fontFamily)?.name;
  const imageryLabel = IMAGERY_STYLES.find(i => i.id === data.typography.imageryStyle)?.name;
  const activePages = (data.pages.selected || []).join(", ") || "home, services, about, contact";

  return (
    <div>
      <StepHead idx={10} total={10} kicker="Review & generate" title="Everything look good?"
        sub="A quick scan before we build. Click any Edit link to jump back and change it." />

      <div className="wf-rev-grid">
        <div className="wf-rev-card">
          <button type="button" className="wf-edit" onClick={() => goTo(0)}>Edit</button>
          <div className="wf-rk">Template</div>
          <div className="wf-rv">{data.templateId ? `Template ${data.templateId}` : <span style={{ fontStyle: "italic", color: "var(--wf-text3)" }}>Custom / scratch</span>}</div>
        </div>
        <div className="wf-rev-card">
          <button type="button" className="wf-edit" onClick={() => goTo(4)}>Edit</button>
          <div className="wf-rk">Business</div>
          <div className={`wf-rv${!data.business.name ? " muted" : ""}`}>{dash(data.business.name)}{data.business.type ? ` · ${data.business.type}` : ""}</div>
        </div>
        <div className="wf-rev-card">
          <button type="button" className="wf-edit" onClick={() => goTo(4)}>Edit</button>
          <div className="wf-rk">Description</div>
          <div className={`wf-rv${!data.business.description ? " muted" : ""}`} style={{ fontSize: 13, WebkitLineClamp: 3, display: "-webkit-box", WebkitBoxOrient: "vertical", overflow: "hidden" }}>{dash(data.business.description)}</div>
        </div>
        <div className="wf-rev-card">
          <button type="button" className="wf-edit" onClick={() => goTo(4)}>Edit</button>
          <div className="wf-rk">Location</div>
          <div className={`wf-rv${!data.business.location && data.business.hasLocation ? " muted" : ""}`}>{!data.business.hasLocation ? "No physical location" : dash(data.business.location)}</div>
        </div>
        <div className="wf-rev-card">
          <button type="button" className="wf-edit" onClick={() => goTo(5)}>Edit</button>
          <div className="wf-rk">Main goal</div>
          <div className={`wf-rv${!goalLabel ? " muted" : ""}`}>{dash(goalLabel)}</div>
        </div>
        <div className="wf-rev-card">
          <button type="button" className="wf-edit" onClick={() => goTo(6)}>Edit</button>
          <div className="wf-rk">What you offer</div>
          <div className={`wf-rv${!offerLabel ? " muted" : ""}`}>{dash(offerLabel)}</div>
        </div>
        <div className="wf-rev-card">
          <button type="button" className="wf-edit" onClick={() => goTo(1)}>Edit</button>
          <div className="wf-rk">Design style</div>
          <div className={`wf-rv${!styleLabel ? " muted" : ""}`}>{dash(styleLabel)}</div>
        </div>
        <div className="wf-rev-card">
          <button type="button" className="wf-edit" onClick={() => goTo(2)}>Edit</button>
          <div className="wf-rk">Colours</div>
          <div className="wf-rv">
            <div className="wf-rev-swatches">
              <i style={{ background: data.design.primaryColor }} />
              <i style={{ background: data.design.secondaryColor }} />
              <span style={{ fontFamily: "var(--wf-mono)", fontSize: 11, color: "var(--wf-text3)", alignSelf: "center", marginLeft: 4 }}>{data.design.primaryColor} · {data.design.secondaryColor}</span>
            </div>
          </div>
        </div>
        <div className="wf-rev-card">
          <button type="button" className="wf-edit" onClick={() => goTo(3)}>Edit</button>
          <div className="wf-rk">Typography</div>
          <div className={`wf-rv${!fontLabel ? " muted" : ""}`}>{dash(fontLabel)}</div>
        </div>
        <div className="wf-rev-card">
          <button type="button" className="wf-edit" onClick={() => goTo(3)}>Edit</button>
          <div className="wf-rk">Imagery</div>
          <div className={`wf-rv${!imageryLabel ? " muted" : ""}`}>{dash(imageryLabel)}</div>
        </div>
        <div className="wf-rev-card">
          <button type="button" className="wf-edit" onClick={() => goTo(7)}>Edit</button>
          <div className="wf-rk">Pages</div>
          <div className="wf-rv" style={{ fontSize: 13 }}>{activePages}</div>
        </div>
        <div className="wf-rev-card">
          <button type="button" className="wf-edit" onClick={() => goTo(8)}>Edit</button>
          <div className="wf-rk">Primary CTA</div>
          <div className={`wf-rv${!ctaLabel ? " muted" : ""}`}>{dash(ctaLabel)}</div>
        </div>
        <div className="wf-rev-card">
          <button type="button" className="wf-edit" onClick={() => goTo(8)}>Edit</button>
          <div className="wf-rk">Content tone</div>
          <div className={`wf-rv${!toneLabel ? " muted" : ""}`}>{dash(toneLabel)}</div>
        </div>
      </div>

      <div className="wf-deploy-card">
        <div className="wf-deploy-ico"><ITriangle /></div>
        <div style={{ flex: 1 }}>
          <div className="wf-vh">Vercel connected <span style={{ color: "var(--wf-ok)" }}>✓</span></div>
          <div className="wf-vd">Your generated website deploys directly to your own Vercel project. You keep the code, forever.</div>
        </div>
        {vercelAuthorized === false && (
          <a href="/api/auth/vercel" style={{ flexShrink: 0, marginLeft: "auto", fontFamily: "var(--wf-mono)", fontSize: 11.5, fontWeight: 600, padding: "7px 13px", borderRadius: 7, background: "var(--wf-text)", color: "#fff", textDecoration: "none" }}>Connect Vercel</a>
        )}
      </div>

      {isEditMode ? (
        <button type="button" className="wf-btn wf-btn-pay" onClick={onGenerate} disabled={loading}
          style={{ width: "100%" }}>
          {loading ? "Regenerating…" : "Regenerate my website →"}
        </button>
      ) : (
        <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <button type="button" className="wf-btn wf-btn-pay" onClick={onGenerate}>
            Continue to payment →
          </button>
          <span style={{ fontFamily: "var(--wf-mono)", fontSize: 11.5, color: "var(--wf-text3)" }}>
            €59.99 one-time · no edits included · domain sold separately on Vercel
          </span>
        </div>
      )}
    </div>
  );
}

// ─── Payment Overlay ──────────────────────────────────────────────────────────

const DEPLOY_LINES = [
  ["00:02", "cfg", "reading your answers · 24 fields"],
  ["00:05", "ai",  "writing copy & sections"],
  ["00:09", "pkg", "building Next.js project · 4.1 MB"],
  ["00:13", "cdn", "uploading assets"],
  ["00:16", "ssl", "certificate issued"],
  ["00:18", "live","https://your-site.vercel.app"],
];

function GenerateOverlay({ siteName, countdown, stageMsg }: { siteName: string; countdown: number; stageMsg: string }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (n >= DEPLOY_LINES.length) return;
    const t = setTimeout(() => setN(n + 1), n === 0 ? 400 : 700);
    return () => clearTimeout(t);
  }, [n]);
  const done = n >= DEPLOY_LINES.length;
  const slug = siteName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "my-site";

  return (
    <div className="wf-overlay">
      <div className="wf-overlay-box">
        <div className="wf-code-win">
          <div className="wf-cw-bar"><i className="cr" /><i className="cy" /><i className="cg" /><span className="wf-cw-title">vercel · deploy — {slug}</span></div>
          <div className="wf-cw-prog"><i style={{ width: `${Math.round(n / DEPLOY_LINES.length * 100)}%` }} /></div>
          <div className="wf-cw-body">
            <div className="wf-tok-acc">$ insixlive generate --deploy</div>
            <div style={{ height: 10 }} />
            {DEPLOY_LINES.slice(0, n).map((l, i) => (
              <div key={i} className="wf-gen-line" style={{ animationDelay: `${i * 0.04}s` }}>
                <span className="wf-tok-cmt">{l[0]}</span>{"  "}
                <span className="wf-tok-attr">{l[1]}</span>{"  "}
                <span style={{ color: l[1] === "live" ? "var(--wf-ok)" : "var(--wf-text2)" }}>{l[2]}</span>
              </div>
            ))}
            {!done && <div><span className="wf-caret" /></div>}
            {done && (
              <div className="wf-gen-ready" style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid var(--wf-border)" }}>
                <div style={{ color: "var(--wf-ok)", fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
                  <span className="wf-live-dot" /> READY · your site is live
                </div>
              </div>
            )}
          </div>
        </div>
        {stageMsg && (
          <p style={{ textAlign: "center", marginTop: 14, fontFamily: "var(--wf-mono)", fontSize: 12, color: "var(--wf-text3)" }}>
            {stageMsg} · {countdown}s remaining
          </p>
        )}
        {!stageMsg && !done && (
          <p style={{ textAlign: "center", marginTop: 14, fontFamily: "var(--wf-mono)", fontSize: 12, color: "var(--wf-text3)" }}>
            Building your website — takes approximately 100 seconds.
          </p>
        )}
      </div>
    </div>
  );
}

function PaymentOverlay({ data, onCancel, onPay }: { data: WizardData; onCancel: () => void; onPay: () => void }) {
  const [card, setCard] = useState("");
  const [exp, setExp] = useState("");
  const [cvc, setCvc] = useState("");
  const [name, setName] = useState("");
  const [phase, setPhase] = useState<"form" | "redirecting">("form");

  const digits = (s: string) => s.replace(/\D/g, "");
  const fmtCard = (s: string) => digits(s).slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1 ");
  const fmtExp  = (s: string) => { const d = digits(s).slice(0, 4); return d.length > 2 ? d.slice(0, 2) + " / " + d.slice(2) : d; };
  const ready = digits(card).length === 16 && digits(exp).length === 4 && digits(cvc).length >= 3 && name.trim().length > 1;

  const autofill = () => { setCard("4242 4242 4242 4242"); setExp("12 / 29"); setCvc("424"); setName(data.business.ownerName || data.business.name || "Test Customer"); };

  const pay = () => {
    if (!ready || phase !== "form") return;
    setPhase("redirecting");
    setTimeout(onPay, 900);
  };

  return (
    <div className="wf-overlay">
      <div className="wf-pay-modal">
        {phase === "form" && <button type="button" className="wf-pay-close" onClick={onCancel} aria-label="Close"><IX /></button>}

        <div className="wf-pay-sum">
          <div className="wf-pay-brand"><span className="wf-pay-badge">6</span> insixlive</div>
          <div className="wf-pay-item">Website build &amp; deploy</div>
          <div className="wf-pay-price">€{PRICE.toFixed(2).replace(".", ",")}<span></span></div>
          <div className="wf-pay-meta">One-time · no subscription · no edits included. Domain not included — purchase separately on Vercel (~€12–30/yr).</div>
        </div>

        <div className="wf-pay-body">
          {phase === "redirecting" ? (
            <div style={{ textAlign: "center", padding: "24px 0" }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", border: "2.5px solid var(--wf-border)", borderTopColor: "#635bff", animation: "spin .8s linear infinite", margin: "0 auto 14px" }} />
              <p style={{ fontFamily: "var(--wf-mono)", fontSize: 13, color: "var(--wf-text2)" }}>Redirecting to Stripe…</p>
            </div>
          ) : (
            <>
              <button type="button" className="wf-pay-link" onClick={onPay}><b>Link</b> Pay faster with Link</button>
              <div className="wf-pay-div"><span>Or pay with card</span></div>

              <div className="wf-pay-lab">Card information</div>
              <div className="wf-pay-group">
                <div className="wf-pay-row">
                  <input className="wf-pay-in" inputMode="numeric" autoComplete="cc-number"
                    placeholder="1234 1234 1234 1234" value={card}
                    onChange={e => setCard(fmtCard(e.target.value))} />
                  <span className="wf-pay-brands"><i>VISA</i><i>MC</i><i>AMEX</i></span>
                </div>
                <div className="wf-pay-split">
                  <input className="wf-pay-in" inputMode="numeric" autoComplete="cc-exp"
                    placeholder="MM / YY" value={exp} onChange={e => setExp(fmtExp(e.target.value))} />
                  <input className="wf-pay-in" inputMode="numeric" autoComplete="cc-csc"
                    placeholder="CVC" value={cvc} onChange={e => setCvc(digits(e.target.value).slice(0, 4))} />
                </div>
              </div>

              <div className="wf-pay-lab">Name on card</div>
              <input className="wf-pay-solo" autoComplete="cc-name" placeholder="Full name"
                value={name} onChange={e => setName(e.target.value)} />

              <button type="button" className="wf-pay-btn" disabled={!ready} onClick={pay}>
                <ILock /> Pay €{PRICE.toFixed(2)}
              </button>

              <button type="button" className="wf-pay-demo" onClick={autofill}>
                Demo · fill test card 4242 4242 4242 4242
              </button>
              <div className="wf-pay-foot">Powered by <b>stripe</b> <span>·</span> <span style={{ textDecoration: "underline", cursor: "pointer" }}>Terms</span></div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Steps config ─────────────────────────────────────────────────────────────

const STEPS = [
  { name: "Template"  },
  { name: "Design"    },
  { name: "Colours"   },
  { name: "Type"      },
  { name: "Business"  },
  { name: "Goals"     },
  { name: "Services"  },
  { name: "Pages"     },
  { name: "Finishing" },
  { name: "Review"    },
];
const GROUPS = [
  { label: "Look & feel", steps: [0, 1, 2, 3] },
  { label: "Your content", steps: [4, 5, 6, 7, 8] },
  { label: "Ship it",      steps: [9] },
];
const TOTAL = STEPS.length;

const STAGE_MESSAGES: Record<number, string> = {
  100: "Starting generation...",
  85: "AI is writing your code...",
  65: "Crafting your design...",
  45: "Pushing to GitHub...",
  25: "Vercel is building...",
  10: "Almost live...",
  0:  "Going live now...",
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function GenerateWizard({ editSiteId }: { editSiteId?: string }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<WizardData>(DEFAULT);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(100);
  const [stageMsg, setStageMsg] = useState("");
  const [vercelAuthorized, setVercelAuthorized] = useState<boolean | null>(null);
  const [editSiteName, setEditSiteName] = useState("");
  const [showPayment, setShowPayment] = useState(false);
  const [showGenerate, setShowGenerate] = useState(false);
  const dirRef = useRef(1);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isEditMode = !!editSiteId;

  // Check Vercel auth
  useEffect(() => {
    fetch("/api/auth/me").then(r => r.json())
      .then(d => setVercelAuthorized(d.user?.vercelAuthorized ?? false))
      .catch(() => setVercelAuthorized(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Load edit-mode data
  useEffect(() => {
    if (!editSiteId) return;
    fetch(`/api/sites/${editSiteId}`).then(r => r.json())
      .then(({ site }) => {
        if (!site) return;
        setEditSiteName(site.name ?? "");
        const p = (site.design_preferences ?? {}) as Partial<WizardData>;
        setData({
          ...DEFAULT, ...p,
          business: { ...DEFAULT.business, ...p.business, locationCity: p.business?.locationCity ?? "", locationCountry: p.business?.locationCountry ?? "" },
          schedule:  { ...DEFAULT.schedule,  ...p.schedule,  hours: { ...DEFAULT_HOURS, ...(p.schedule?.hours ?? {}) } },
          goals:     { ...DEFAULT.goals,     ...p.goals },
          services:  { ...DEFAULT.services,  ...p.services },
          design:    { ...DEFAULT.design,    ...p.design },
          typography:{ ...DEFAULT.typography,...p.typography },
          team:      { ...DEFAULT.team,      ...p.team },
          pages:     { ...DEFAULT.pages,     ...p.pages, pageDescriptions: p.pages?.pageDescriptions ?? {} },
          logo:      { ...DEFAULT.logo,      ...p.logo, dataUrl: "" },
          useEmojis: p.useEmojis ?? false,
          websiteLanguage: p.websiteLanguage ?? "English",
        });
      })
      .catch(err => console.error("Failed to load site for edit:", err));
  }, [editSiteId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Restore from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("wizard_data");
    if (!saved) return;
    try {
      const p = JSON.parse(saved) as Partial<WizardData>;
      setData({
        ...DEFAULT, ...p,
        schedule:  { ...DEFAULT.schedule,  ...p.schedule,  hours: { ...DEFAULT_HOURS, ...(p.schedule?.hours ?? {}) } },
        goals:     { ...DEFAULT.goals,     ...p.goals },
        services:  { ...DEFAULT.services,  ...p.services },
        design:    { ...DEFAULT.design,    ...p.design },
        typography:{ ...DEFAULT.typography,...p.typography },
        team:      { ...DEFAULT.team,      ...p.team },
        pages:     { ...DEFAULT.pages,     ...p.pages, pageDescriptions: p.pages?.pageDescriptions ?? {} },
        logo:      { ...DEFAULT.logo,      ...p.logo },
        useEmojis: p.useEmojis ?? false,
        websiteLanguage: p.websiteLanguage ?? "English",
        business: { ...DEFAULT.business, ...p.business, locationCity: p.business?.locationCity ?? "", locationCountry: p.business?.locationCountry ?? "" },
      });
    } catch { localStorage.removeItem("wizard_data"); }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Save to localStorage (strip base64 images)
  useEffect(() => {
    try {
      const stripped: WizardData = {
        ...data,
        logo: { ...data.logo, dataUrl: "" },
        team: { ...data.team, members: data.team.members.map(m => ({ ...m, photo: "" })) },
        pages: { ...data.pages, pageDescriptions: Object.fromEntries(Object.entries(data.pages.pageDescriptions).map(([k, v]) => [k, { ...v, image: "" }])) },
      };
      localStorage.setItem("wizard_data", JSON.stringify(stripped));
    } catch { /* QuotaExceededError */ }
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

  const goTo = (n: number) => {
    const clamped = Math.max(0, Math.min(TOTAL - 1, n));
    dirRef.current = clamped >= step ? 1 : -1;
    setStep(clamped);
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  };
  const next = () => goTo(step + 1);
  const back = () => goTo(step - 1);

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    setShowGenerate(true);
    try {
      const res = await fetch("/api/generate-site", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formData: data, tier: "website", ...(isEditMode && editSiteId ? { siteId: editSiteId } : {}) }),
      });
      if (!res.ok) {
        let errMsg = `Server error ${res.status}`;
        try { const e = await res.json(); errMsg = e.error || errMsg; } catch { errMsg = await res.text().catch(() => errMsg); }
        throw new Error(errMsg);
      }
      const result = await res.json();
      localStorage.removeItem("wizard_data");
      router.push(`/success/${result.siteId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setLoading(false);
      setShowGenerate(false);
    }
  };

  const handlePayWithStripe = () => {
    try { localStorage.setItem("pending_tier", "website"); } catch {}
    window.location.href = STRIPE_PAYMENT_LINK;
  };

  const handleReviewGenerate = () => {
    if (isEditMode) {
      handleSubmit();
    } else {
      setShowPayment(true);
    }
  };

  const pct = Math.round((step + 1) / TOTAL * 100);

  return (
    <div className="wf-wrap wf-app">
      {/* ── Sidebar ── */}
      <aside className="wf-sidebar wf-dotgrid">
        <Link href="/" className="wf-brand" style={{ textDecoration: "none" }}>
          <div className="wf-brand-badge">6</div>
          <span className="wf-brand-word">in<span>six</span>live</span>
        </Link>

        <div className="wf-kicker">Build wizard · {String(step + 1).padStart(2, "0")}/{TOTAL}</div>
        <div className="wf-prog-rail"><i style={{ width: pct + "%" }} /></div>

        <ul className="wf-stepper">
          {GROUPS.map(g => (
            <li key={g.label} style={{ listStyle: "none", padding: 0 }}>
              <div className="wf-grp">{g.label}</div>
              {g.steps.map(i => (
                <div key={i} className={`wf-step-item${i === step ? " active" : i < step ? " done" : ""}`}
                  onClick={() => goTo(i)}>
                  <span className="wf-num">
                    {i < step ? <ICheck /> : String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="wf-sname">{STEPS[i].name}</span>
                </div>
              ))}
            </li>
          ))}
        </ul>

        <div className="wf-side-foot">
          <div className="wf-side-save"><span className="wf-sdot" /> Progress saved automatically</div>
          <div>One-time · deploys to your Vercel</div>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="wf-main">
        {/* Mobile top bar */}
        <div className="wf-topbar" style={{ display: "none" }}>
          <Link href="/" className="wf-brand" style={{ textDecoration: "none", marginBottom: 0 }}>
            <div className="wf-brand-badge" style={{ width: 24, height: 24 }}>6</div>
            <span className="wf-brand-word" style={{ fontSize: 15 }}>in<span>six</span>live</span>
          </Link>
          <div className="wf-tbstep">
            <span className="wf-tbidx">{String(step + 1).padStart(2, "0")}/{TOTAL}</span> {STEPS[step].name}
          </div>
          <div className="wf-tbprog"><div className="wf-tbfill" style={{ width: pct + "%" }} /></div>
        </div>
        <style>{`@media(max-width:900px){.wf-topbar{display:flex!important}}`}</style>

        {/* Edit mode banner */}
        {isEditMode && editSiteName && (
          <div style={{ padding: "11px 40px", background: "#eff6ff", borderBottom: "1px solid #bfdbfe", display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 13, color: "#1e40af" }}>
              <strong>Editing:</strong> {editSiteName} — your previous answers are loaded
            </span>
            <Link href="/dashboard" style={{ marginLeft: "auto", fontSize: 12, color: "#1e40af" }}>Cancel</Link>
          </div>
        )}

        {/* Scrollable content */}
        <div className="wf-scroll wf-dotgrid" ref={scrollRef}>
          <div className={`wf-stage${step === 0 ? " wide" : ""}`}>

            {error && (
              <div style={{ marginBottom: 20, fontSize: 13, padding: "12px 16px", borderRadius: 12, background: "#FFF0EE", border: "1px solid rgba(255,90,31,.2)", color: "#C43600" }}>
                {error}
              </div>
            )}

            <div key={step} className={`wf-enter${dirRef.current < 0 ? " back" : ""}`}>
              {step === 0 && <Step01Template data={data} setData={setData} />}
              {step === 1 && <Step02Design   data={data} setData={setData} />}
              {step === 2 && <Step03Colors   data={data} setData={setData} />}
              {step === 3 && <Step04TypeImagery data={data} setData={setData} />}
              {step === 4 && <Step05Business data={data} setData={setData} />}
              {step === 5 && <Step06Goals    data={data} setData={setData} />}
              {step === 6 && <Step07Services data={data} setData={setData} />}
              {step === 7 && <Step08Pages    data={data} setData={setData} />}
              {step === 8 && <Step09Finishing data={data} setData={setData} />}
              {step === 9 && (
                <Step10Review
                  data={data} goTo={goTo} onGenerate={handleReviewGenerate}
                  loading={loading} vercelAuthorized={vercelAuthorized} isEditMode={isEditMode}
                />
              )}
            </div>
          </div>
        </div>

        {/* Footer nav */}
        <div className="wf-foot">
          {step > 0 ? (
            <button type="button" className="wf-btn wf-btn-ghost" onClick={back}><IArrowL /> Back</button>
          ) : (
            <span />
          )}
          <span className="wf-spacer" />
          <span className="wf-save-hint"><span className="wf-sdot" /> Saved</span>
          {step < TOTAL - 1 && (
            <button type="button" className="wf-btn wf-btn-primary" onClick={next}>
              Continue <IArrowR />
            </button>
          )}
        </div>
      </div>

      {/* Payment overlay */}
      {showPayment && (
        <PaymentOverlay
          data={data}
          onCancel={() => setShowPayment(false)}
          onPay={() => { setShowPayment(false); handlePayWithStripe(); }}
        />
      )}

      {/* Generate overlay (edit mode) */}
      {showGenerate && loading && (
        <GenerateOverlay siteName={data.business.name} countdown={countdown} stageMsg={stageMsg} />
      )}
    </div>
  );
}
