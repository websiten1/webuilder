"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { TemplateGallery, type TemplateMapTo as GalleryTemplateMapTo } from "@/app/components/TemplateGallery";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!
);

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
    email: string;
    hasPhone: boolean; phone: string;
    openingHours: string; ownerName: string; experience: string;
  };
  schedule: {
    type: "no-schedule" | "online" | "always-open" | "custom";
    hours: { [day: string]: DayHours };
  };
  goals: {
    mainGoal: string; visitorFeel: string;
    problemSolved: string; whyChoose: string; idealCustomer: string;
  };
  services: {
    offersType: string; list: string[]; priceVisibility: string;
  };
  design: {
    style: string; primaryColor: string; secondaryColor: string;
    darkMode: boolean; personalityLevel: string; backgroundStyle: string; animations: string;
  };
  typography: {
    fontFamily: string; imageryStyle: string; heroPreference: string;
  };
  team: { enabled: boolean; members: TeamMember[] };
  pages: {
    selected: string[]; primaryCTA: string; contentTone: string;
    specialFeatures: string[]; additionalNotes: string;
    pageDescriptions: { [id: string]: PageDesc };
  };
  useEmojis: boolean;
  websiteLanguage: string;
  logo: { uploaded: boolean; dataUrl: string; fileName: string };
};

const DAYS = ["monday","tuesday","wednesday","thursday","friday","saturday","sunday"] as const;
const DAY_LABELS: Record<string, string> = { monday:"Monday",tuesday:"Tuesday",wednesday:"Wednesday",thursday:"Thursday",friday:"Friday",saturday:"Saturday",sunday:"Sunday" };
const DEFAULT_HOURS = Object.fromEntries(DAYS.map(d => [d, { open: "09:00", close: "17:00", closed: d === "saturday" || d === "sunday" }]));

const DEFAULT: WizardData = {
  templateId: "",
  business: { name: "", type: "Restaurant", description: "", aboutText: "", aboutAiRephrase: true, hasLocation: true, location: "", locationCity: "", locationCountry: "", serviceArea: "", email: "", hasPhone: true, phone: "", openingHours: "", ownerName: "", experience: "" },
  schedule: { type: "no-schedule", hours: DEFAULT_HOURS },
  goals: { mainGoal: "", visitorFeel: "", problemSolved: "", whyChoose: "", idealCustomer: "" },
  services: { offersType: "", list: [], priceVisibility: "" },
  design: { style: "minimalist", primaryColor: "#6366f1", secondaryColor: "#a855f7", darkMode: false, personalityLevel: "balanced", backgroundStyle: "ai-decide", animations: "moderate" },
  typography: { fontFamily: "modern-sans", imageryStyle: "stock-photos", heroPreference: "ai-decide" },
  team: { enabled: false, members: [] },
  pages: { selected: ["home", "services", "about", "contact"], primaryCTA: "contact-form", contentTone: "professional-approachable", specialFeatures: [], additionalNotes: "", pageDescriptions: {} },
  useEmojis: false,
  websiteLanguage: "English",
  logo: { uploaded: false, dataUrl: "", fileName: "" },
};

// ─── Constants ────────────────────────────────────────────────────────────────

const BUSINESS_TYPES = [
  "Restaurant","Hair Salon","Photography","Dental Clinic","Consulting",
  "E-commerce","Real Estate","Fitness","Law Firm","Architecture",
  "Plumbing","Accounting","Marketing Agency","Medical Clinic",
  "Tech Startup","Beauty/Spa","Other",
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

const SCHEDULE_TYPES = [
  { id: "no-schedule",  label: "I don't have a schedule",    desc: "No regular hours" },
  { id: "online",       label: "Fully online (no physical hours)", desc: "Online only business" },
  { id: "always-open",  label: "Always open / 24/7",         desc: "Round-the-clock access" },
  { id: "custom",       label: "I have specific hours",      desc: "Set hours per day" },
] as const;

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

// ─── Industry Templates ───────────────────────────────────────────────────────

type TemplateMapTo = {
  businessType: string; style: string;
  primaryColor: string; secondaryColor: string;
  darkMode: boolean; fontFamily: string;
};

const TEMPLATES: {
  id: string; name: string; category: string; desc: string;
  preview: React.ReactNode; mapTo: TemplateMapTo;
}[] = [
  {
    id: "dentist", name: "Dental Practice", category: "Healthcare",
    desc: "Clean & trustworthy",
    preview: <div style={{ height: 64, background: "#f6faf8", padding: 8, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><div style={{ height: 4, width: 24, background: "#3a8a78", borderRadius: 99 }} /><div style={{ display: "flex", gap: 3 }}><div style={{ height: 2, width: 10, background: "#9fd9c8", borderRadius: 99 }}/><div style={{ height: 2, width: 10, background: "#9fd9c8", borderRadius: 99 }}/></div></div>
      <div><div style={{ height: 5, width: 40, background: "#0e2a26", borderRadius: 99, marginBottom: 3 }}/><div style={{ height: 2, width: 28, background: "#5a7570", borderRadius: 99, marginBottom: 5 }}/><div style={{ height: 11, width: 26, background: "#3a8a78", borderRadius: 4 }}/></div>
    </div>,
    mapTo: { businessType: "Dental Clinic", style: "minimalist", primaryColor: "#3a8a78", secondaryColor: "#9fd9c8", darkMode: false, fontFamily: "classic-serif" },
  },
  {
    id: "gym-coach", name: "Gym / Fitness Coach", category: "Fitness",
    desc: "Bold, high-energy, dark",
    preview: <div style={{ height: 64, background: "#0d0d0d", padding: 8, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><div style={{ height: 4, width: 24, background: "#ff4d1a", borderRadius: 99 }} /><div style={{ display: "flex", gap: 3 }}><div style={{ height: 2, width: 10, background: "#333", borderRadius: 99 }}/><div style={{ height: 2, width: 10, background: "#333", borderRadius: 99 }}/></div></div>
      <div><div style={{ height: 6, width: 40, background: "#f5f1ea", borderRadius: 99, marginBottom: 3 }}/><div style={{ height: 2, width: 28, background: "#555", borderRadius: 99, marginBottom: 5 }}/><div style={{ height: 11, width: 26, background: "#ff4d1a", borderRadius: 3 }}/></div>
    </div>,
    mapTo: { businessType: "Fitness", style: "bold-dark", primaryColor: "#ff4d1a", secondaryColor: "#f5c542", darkMode: true, fontFamily: "geo-bold" },
  },
  {
    id: "kindergarten", name: "Kindergarten", category: "Education",
    desc: "Playful, colorful, friendly",
    preview: <div style={{ height: 64, background: "#fff8ec", padding: 8, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><div style={{ height: 4, width: 24, background: "#ff8b66", borderRadius: 99 }} /><div style={{ display: "flex", gap: 3 }}><div style={{ height: 2, width: 10, background: "#ffd166", borderRadius: 99 }}/><div style={{ height: 2, width: 10, background: "#7ec8a7", borderRadius: 99 }}/></div></div>
      <div><div style={{ height: 6, width: 40, background: "#2a2046", borderRadius: 99, marginBottom: 3 }}/><div style={{ height: 2, width: 28, background: "#6f6488", borderRadius: 99, marginBottom: 5 }}/><div style={{ height: 11, width: 26, background: "#ff8b66", borderRadius: 99 }}/></div>
    </div>,
    mapTo: { businessType: "Other", style: "playful", primaryColor: "#ff8b66", secondaryColor: "#ffd166", darkMode: false, fontFamily: "playful" },
  },
  {
    id: "coffee-shop", name: "Coffee Shop", category: "Food & Drink",
    desc: "Warm, cozy, inviting",
    preview: <div style={{ height: 64, background: "#f3ece1", padding: 8, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><div style={{ height: 4, width: 24, background: "#b85c2c", borderRadius: 99 }} /><div style={{ display: "flex", gap: 3 }}><div style={{ height: 2, width: 10, background: "#e3d6c1", borderRadius: 99 }}/><div style={{ height: 2, width: 10, background: "#e3d6c1", borderRadius: 99 }}/></div></div>
      <div><div style={{ height: 5, width: 40, background: "#2a1d12", borderRadius: 99, marginBottom: 3 }}/><div style={{ height: 2, width: 28, background: "#7a6a58", borderRadius: 99, marginBottom: 5 }}/><div style={{ height: 11, width: 26, background: "#b85c2c", borderRadius: 4 }}/></div>
    </div>,
    mapTo: { businessType: "Restaurant", style: "warm", primaryColor: "#b85c2c", secondaryColor: "#f8f2e6", darkMode: false, fontFamily: "classic-serif" },
  },
  {
    id: "fine-dining", name: "Fine Dining", category: "Restaurant",
    desc: "Elegant, dark, luxurious",
    preview: <div style={{ height: 64, background: "#0a0a0a", padding: 8, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><div style={{ height: 4, width: 24, background: "#c9a96e", borderRadius: 99 }} /><div style={{ display: "flex", gap: 3 }}><div style={{ height: 2, width: 10, background: "#1f1d1a", borderRadius: 99 }}/><div style={{ height: 2, width: 10, background: "#1f1d1a", borderRadius: 99 }}/></div></div>
      <div><div style={{ height: 5, width: 40, background: "#f1ece2", borderRadius: 99, marginBottom: 3 }}/><div style={{ height: 2, width: 28, background: "#8a8378", borderRadius: 99, marginBottom: 5 }}/><div style={{ height: 11, width: 26, border: "1px solid #c9a96e", borderRadius: 3 }}/></div>
    </div>,
    mapTo: { businessType: "Restaurant", style: "elegant", primaryColor: "#c9a96e", secondaryColor: "#f1ece2", darkMode: true, fontFamily: "classic-serif" },
  },
  {
    id: "bakery", name: "Bakery", category: "Food & Drink",
    desc: "Warm, artisan, charming",
    preview: <div style={{ height: 64, background: "#fbf3ea", padding: 8, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><div style={{ height: 4, width: 24, background: "#d4a056", borderRadius: 99 }} /><div style={{ display: "flex", gap: 3 }}><div style={{ height: 2, width: 10, background: "#e9a1a1", borderRadius: 99 }}/><div style={{ height: 2, width: 10, background: "#a8b89a", borderRadius: 99 }}/></div></div>
      <div><div style={{ height: 5, width: 40, background: "#3c2820", borderRadius: 99, marginBottom: 3 }}/><div style={{ height: 2, width: 28, background: "#8d7363", borderRadius: 99, marginBottom: 5 }}/><div style={{ height: 11, width: 26, background: "#d4a056", borderRadius: 4 }}/></div>
    </div>,
    mapTo: { businessType: "Other", style: "warm", primaryColor: "#d4a056", secondaryColor: "#e9a1a1", darkMode: false, fontFamily: "playful" },
  },
  {
    id: "law-firm", name: "Law Firm", category: "Legal",
    desc: "Authoritative, corporate, formal",
    preview: <div style={{ height: 64, background: "#f5f3ee", padding: 0, display: "flex", flexDirection: "column" }}>
      <div style={{ background: "#15294a", padding: "4px 8px", display: "flex", alignItems: "center", justifyContent: "space-between" }}><div style={{ height: 4, width: 20, background: "#fff", borderRadius: 99 }}/><div style={{ display: "flex", gap: 3 }}><div style={{ height: 2, width: 8, background: "#4a7da8", borderRadius: 99 }}/><div style={{ height: 2, width: 8, background: "#4a7da8", borderRadius: 99 }}/><div style={{ height: 2, width: 8, background: "#a98531", borderRadius: 99 }}/></div></div>
      <div style={{ flex: 1, padding: "6px 8px" }}><div style={{ height: 5, width: 40, background: "#0e1a2b", borderRadius: 99, marginBottom: 3 }}/><div style={{ height: 2, width: 28, background: "#5a6478", borderRadius: 99, marginBottom: 5 }}/><div style={{ height: 11, width: 26, background: "#15294a", borderRadius: 2 }}/></div>
    </div>,
    mapTo: { businessType: "Law Firm", style: "corporate", primaryColor: "#15294a", secondaryColor: "#a98531", darkMode: false, fontFamily: "classic-serif" },
  },
  {
    id: "real-estate", name: "Real Estate", category: "Property",
    desc: "Clean, natural, trustworthy",
    preview: <div style={{ height: 64, background: "#eef0eb", padding: 8, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><div style={{ height: 4, width: 24, background: "#7d8a6e", borderRadius: 99 }} /><div style={{ display: "flex", gap: 3 }}><div style={{ height: 2, width: 10, background: "#d5d8cd", borderRadius: 99 }}/><div style={{ height: 2, width: 10, background: "#d5d8cd", borderRadius: 99 }}/></div></div>
      <div><div style={{ height: 5, width: 40, background: "#1a2218", borderRadius: 99, marginBottom: 3 }}/><div style={{ height: 2, width: 28, background: "#697063", borderRadius: 99, marginBottom: 5 }}/><div style={{ height: 11, width: 26, background: "#525e44", borderRadius: 4 }}/></div>
    </div>,
    mapTo: { businessType: "Real Estate", style: "minimalist", primaryColor: "#7d8a6e", secondaryColor: "#525e44", darkMode: false, fontFamily: "modern-sans" },
  },
  {
    id: "hair-salon", name: "Hair Salon", category: "Beauty",
    desc: "Chic, elegant, feminine",
    preview: <div style={{ height: 64, background: "#f6efe9", padding: 8, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><div style={{ height: 4, width: 24, background: "#b2756a", borderRadius: 99 }} /><div style={{ display: "flex", gap: 3 }}><div style={{ height: 2, width: 10, background: "#e8c5b4", borderRadius: 99 }}/><div style={{ height: 2, width: 10, background: "#e8c5b4", borderRadius: 99 }}/></div></div>
      <div><div style={{ height: 5, width: 40, background: "#231711", borderRadius: 99, marginBottom: 3 }}/><div style={{ height: 2, width: 28, background: "#7a655a", borderRadius: 99, marginBottom: 5 }}/><div style={{ height: 11, width: 26, background: "#b2756a", borderRadius: 4 }}/></div>
    </div>,
    mapTo: { businessType: "Hair Salon", style: "elegant", primaryColor: "#b2756a", secondaryColor: "#e8c5b4", darkMode: false, fontFamily: "classic-serif" },
  },
  {
    id: "auto-repair", name: "Auto Repair Shop", category: "Automotive",
    desc: "Industrial, bold, reliable",
    preview: <div style={{ height: 64, background: "#161614", padding: 8, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><div style={{ height: 4, width: 24, background: "#f5c542", borderRadius: 99 }} /><div style={{ display: "flex", gap: 3 }}><div style={{ height: 2, width: 10, background: "#2e2d29", borderRadius: 99 }}/><div style={{ height: 2, width: 10, background: "#2e2d29", borderRadius: 99 }}/></div></div>
      <div><div style={{ height: 5, width: 40, background: "#f4f1e8", borderRadius: 99, marginBottom: 3 }}/><div style={{ height: 2, width: 28, background: "#8a867b", borderRadius: 99, marginBottom: 5 }}/><div style={{ height: 11, width: 26, background: "#f5c542", borderRadius: 2 }}/></div>
    </div>,
    mapTo: { businessType: "Other", style: "bold-dark", primaryColor: "#f5c542", secondaryColor: "#f37a23", darkMode: true, fontFamily: "geo-bold" },
  },
  {
    id: "vet-clinic", name: "Vet Clinic", category: "Healthcare",
    desc: "Caring, friendly, professional",
    preview: <div style={{ height: 64, background: "#f4f7f2", padding: 8, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><div style={{ height: 4, width: 24, background: "#5c8b6e", borderRadius: 99 }} /><div style={{ display: "flex", gap: 3 }}><div style={{ height: 2, width: 10, background: "#a5cae0", borderRadius: 99 }}/><div style={{ height: 2, width: 10, background: "#ffc9a8", borderRadius: 99 }}/></div></div>
      <div><div style={{ height: 5, width: 40, background: "#1f2a23", borderRadius: 99, marginBottom: 3 }}/><div style={{ height: 2, width: 28, background: "#6c7a70", borderRadius: 99, marginBottom: 5 }}/><div style={{ height: 11, width: 26, background: "#5c8b6e", borderRadius: 4 }}/></div>
    </div>,
    mapTo: { businessType: "Medical Clinic", style: "warm", primaryColor: "#5c8b6e", secondaryColor: "#a5cae0", darkMode: false, fontFamily: "modern-sans" },
  },
  {
    id: "yoga-studio", name: "Yoga Studio", category: "Wellness",
    desc: "Calming, earthy, mindful",
    preview: <div style={{ height: 64, background: "#e8e0d2", padding: 8, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><div style={{ height: 4, width: 24, background: "#c87f5b", borderRadius: 99 }} /><div style={{ display: "flex", gap: 3 }}><div style={{ height: 2, width: 10, background: "#d6cdba", borderRadius: 99 }}/><div style={{ height: 2, width: 10, background: "#7a8a6a", borderRadius: 99 }}/></div></div>
      <div><div style={{ height: 5, width: 40, background: "#2a261f", borderRadius: 99, marginBottom: 3 }}/><div style={{ height: 2, width: 28, background: "#736959", borderRadius: 99, marginBottom: 5 }}/><div style={{ height: 11, width: 26, background: "#c87f5b", borderRadius: 4 }}/></div>
    </div>,
    mapTo: { businessType: "Fitness", style: "warm", primaryColor: "#c87f5b", secondaryColor: "#7a8a6a", darkMode: false, fontFamily: "classic-serif" },
  },
  {
    id: "tattoo-studio", name: "Tattoo Studio", category: "Creative",
    desc: "Edgy, dark, artistic",
    preview: <div style={{ height: 64, background: "#0a0a0a", padding: 8, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><div style={{ height: 4, width: 24, background: "#8a2424", borderRadius: 99 }} /><div style={{ display: "flex", gap: 3 }}><div style={{ height: 2, width: 10, background: "#1d1c1a", borderRadius: 99 }}/><div style={{ height: 2, width: 10, background: "#1d1c1a", borderRadius: 99 }}/></div></div>
      <div><div style={{ height: 5, width: 40, background: "#efe8db", borderRadius: 99, marginBottom: 3 }}/><div style={{ height: 2, width: 28, background: "#7a7367", borderRadius: 99, marginBottom: 5 }}/><div style={{ height: 11, width: 26, background: "#8a2424", borderRadius: 2 }}/></div>
    </div>,
    mapTo: { businessType: "Other", style: "bold-dark", primaryColor: "#8a2424", secondaryColor: "#b89968", darkMode: true, fontFamily: "geo-bold" },
  },
  {
    id: "florist", name: "Florist", category: "Retail",
    desc: "Delicate, romantic, natural",
    preview: <div style={{ height: 64, background: "#f5f0ea", padding: 8, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><div style={{ height: 4, width: 24, background: "#b97a6f", borderRadius: 99 }} /><div style={{ display: "flex", gap: 3 }}><div style={{ height: 2, width: 10, background: "#e1aaa1", borderRadius: 99 }}/><div style={{ height: 2, width: 10, background: "#7d9173", borderRadius: 99 }}/></div></div>
      <div><div style={{ height: 5, width: 40, background: "#2c2a23", borderRadius: 99, marginBottom: 3 }}/><div style={{ height: 2, width: 28, background: "#7a7466", borderRadius: 99, marginBottom: 5 }}/><div style={{ height: 11, width: 26, background: "#b97a6f", borderRadius: 4 }}/></div>
    </div>,
    mapTo: { businessType: "Other", style: "elegant", primaryColor: "#b97a6f", secondaryColor: "#e1aaa1", darkMode: false, fontFamily: "classic-serif" },
  },
  {
    id: "bookstore", name: "Bookstore", category: "Retail",
    desc: "Literary, warm, inviting",
    preview: <div style={{ height: 64, background: "#f3eddf", padding: 8, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><div style={{ height: 4, width: 24, background: "#7a2828", borderRadius: 99 }} /><div style={{ display: "flex", gap: 3 }}><div style={{ height: 2, width: 10, background: "#d8cdb2", borderRadius: 99 }}/><div style={{ height: 2, width: 10, background: "#d8cdb2", borderRadius: 99 }}/></div></div>
      <div><div style={{ height: 5, width: 40, background: "#1f1812", borderRadius: 99, marginBottom: 3 }}/><div style={{ height: 2, width: 28, background: "#6a5e4b", borderRadius: 99, marginBottom: 5 }}/><div style={{ height: 11, width: 26, background: "#7a2828", borderRadius: 3 }}/></div>
    </div>,
    mapTo: { businessType: "Other", style: "elegant", primaryColor: "#7a2828", secondaryColor: "#a25234", darkMode: false, fontFamily: "classic-serif" },
  },
  {
    id: "saas-startup", name: "SaaS / Tech Startup", category: "Technology",
    desc: "Modern, neon, tech-forward",
    preview: <div style={{ height: 64, background: "#0a0b0d", padding: 8, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><div style={{ height: 4, width: 24, background: "#a8ff5c", borderRadius: 99 }} /><div style={{ display: "flex", gap: 3 }}><div style={{ height: 2, width: 10, background: "#1e2026", borderRadius: 99 }}/><div style={{ height: 2, width: 10, background: "#1e2026", borderRadius: 99 }}/></div></div>
      <div><div style={{ height: 5, width: 40, background: "#f5f5f7", borderRadius: 99, marginBottom: 3 }}/><div style={{ height: 2, width: 28, background: "#8a8c93", borderRadius: 99, marginBottom: 5 }}/><div style={{ height: 11, width: 26, background: "#a8ff5c", borderRadius: 3 }}/></div>
    </div>,
    mapTo: { businessType: "Tech Startup", style: "futuristic", primaryColor: "#a8ff5c", secondaryColor: "#7a5cff", darkMode: true, fontFamily: "mono" },
  },
];

// ─── Goals & Audience constants ───────────────────────────────────────────────

const MAIN_GOALS = [
  { id: "calls",      label: "Get phone calls",            desc: "Drive call inquiries from the homepage" },
  { id: "bookings",   label: "Get bookings / appointments",desc: "Fill your calendar online" },
  { id: "sell",       label: "Sell products online",       desc: "E-commerce or direct sales" },
  { id: "leads",      label: "Generate leads",             desc: "B2B inquiries & quote requests" },
  { id: "present",    label: "Present services",           desc: "Showcase what you offer" },
  { id: "credibility",label: "Build credibility",          desc: "Establish authority & trust" },
  { id: "portfolio",  label: "Show portfolio / gallery",   desc: "Display your creative work" },
  { id: "info",       label: "Share information",          desc: "Nonprofit, education, community" },
];

const VISITOR_FEELS = [
  "Trust", "Excitement", "Calm", "Luxury",
  "Safety", "Professionalism", "Warmth", "Innovation", "Creativity", "Fun",
];

// ─── Services constants ────────────────────────────────────────────────────────

const OFFERS_TYPES = [
  { id: "services", label: "Services",               desc: "I provide services to clients" },
  { id: "products", label: "Products",               desc: "I sell physical or digital products" },
  { id: "both",     label: "Both",                   desc: "Services and products" },
  { id: "info",     label: "Information / Portfolio",desc: "No direct sales — just showcasing" },
];

const PRICE_VISIBILITY = [
  { id: "exact",    label: "Show exact prices" },
  { id: "from",     label: "Show 'from' prices" },
  { id: "packages", label: "Packages only" },
  { id: "quote",    label: "Request a quote" },
  { id: "hide",     label: "Hide prices" },
];

// ─── Design extra constants ────────────────────────────────────────────────────

const PERSONALITY_LEVELS = [
  { id: "minimal",   label: "Very simple",        desc: "Content first, minimal decoration" },
  { id: "balanced",  label: "Balanced",           desc: "Professional with personality" },
  { id: "strong",    label: "Strong personality", desc: "Bold, memorable, distinctive" },
  { id: "ai-decide", label: "AI decides",         desc: "Best match for your style" },
];

const BACKGROUND_STYLES = [
  { id: "white",     label: "White / Light" },
  { id: "cream",     label: "Cream / Warm" },
  { id: "dark",      label: "Dark" },
  { id: "gradient",  label: "Gradient" },
  { id: "photo",     label: "Photo background" },
  { id: "ai-decide", label: "AI decides" },
];

// ─── Small UI helpers ──────────────────────────────────────────────────────────

function SectionLabel({ label }: { label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
      <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#374151", whiteSpace: "nowrap" }}>
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
              <p style={{ fontSize: 13, fontWeight: 500, color: on ? "#111827" : "#374151", margin: 0 }}>{o.label}</p>
              {o.desc && <p style={{ fontSize: 11, color: "#6B7180", margin: "2px 0 0" }}>{o.desc}</p>}
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
              <p style={{ fontSize: 13, fontWeight: 500, color: on ? "#111827" : "#374151", margin: 0 }}>{o.label}</p>
              {o.desc && <p style={{ fontSize: 11, color: "#6B7180", margin: "2px 0 0" }}>{o.desc}</p>}
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
        <p style={{ fontSize: 13, fontWeight: 500, color: "#111827", margin: 0 }}>{label}</p>
        {desc && <p style={{ fontSize: 11, color: "#6B7180", margin: "2px 0 0" }}>{desc}</p>}
      </div>
      <div onClick={() => onChange(!checked)} style={{
        width: 40, height: 22, borderRadius: 11, cursor: "pointer", flexShrink: 0,
        background: checked ? "var(--accent)" : "#e5e7eb",
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
        <label style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: "auto", fontSize: 11, color: "#6B7180", cursor: "pointer" }}>
          Custom
          <input type="color" value={value} onChange={e => onChange(e.target.value)}
            style={{ width: 28, height: 28, border: "none", cursor: "pointer", borderRadius: 6, padding: 1, background: "transparent" }} />
        </label>
      </div>
      {/* Grouped palette */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "12px 14px", borderRadius: 12, border: "1px solid var(--border)", background: "#f9fafb" }}>
        {COLOR_GROUPS.map(group => (
          <div key={group.label}>
            <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#6B7180", marginBottom: 5 }}>{group.label}</p>
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

// ─── Location autocomplete ────────────────────────────────────────────────────

type NominatimResult = {
  place_id: number; display_name: string; name: string; lat: string; lon: string;
  type: string; class: string;
  address: { city?: string; town?: string; village?: string; municipality?: string; state?: string; country?: string; country_code?: string; };
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

  useEffect(() => {
    setQuery(city ? `${city}${country ? `, ${country}` : ""}` : "");
  }, [city, country]);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const search = async (q: string) => {
    if (q.length < 2) { setResults([]); setOpen(false); return; }
    setLoading(true);
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=8&addressdetails=1&accept-language=en`;
      const res = await fetch(url, { headers: { "User-Agent": "insixlive-website-builder/1.0" } });
      const data: NominatimResult[] = await res.json();
      const filtered = data.filter(r => r.class === "place" || ["city","town","village","administrative","hamlet"].includes(r.type)).slice(0, 7);
      setResults(filtered);
      setOpen(filtered.length > 0);
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
        <input className="inp" value={query} disabled={disabled}
          onChange={e => handleChange(e.target.value)}
          placeholder="Search for a city…" autoComplete="off"
          onFocus={() => { if (results.length > 0) setOpen(true); }}
          style={{ paddingRight: 40, opacity: disabled ? 0.4 : 1, transition: "opacity 0.2s" }}
        />
        <div style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", display: "flex", alignItems: "center", gap: 4 }}>
          {loading && (
            <svg width="14" height="14" viewBox="0 0 14 14" style={{ animation: "spin 0.7s linear infinite", display: "block" }}>
              <circle cx="7" cy="7" r="5" fill="none" stroke="#E2E2DE" strokeWidth="2"/>
              <path d="M7 2a5 5 0 015 5" fill="none" stroke="#6B7180" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          )}
          {city && !loading && (
            <button type="button" onClick={onClear} style={{ width: 18, height: 18, borderRadius: "50%", background: "#e5e7eb", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: "#374151", lineHeight: 1, padding: 0 }}>×</button>
          )}
        </div>
      </div>

      {open && results.length > 0 && (
        <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, zIndex: 200, background: "#fff", border: "1px solid #E2E2DE", borderRadius: 12, boxShadow: "0 8px 24px rgba(10,14,20,0.12)", overflow: "hidden", animation: "fadeUp 0.15s ease-out" }}>
          {results.map(r => {
            const c = r.address.city || r.address.town || r.address.village || r.address.municipality || r.name;
            const co = r.address.country || "";
            const flag = r.address.country_code ? flagEmoji(r.address.country_code) : "";
            const sub = [r.address.state, r.address.country].filter(Boolean).join(", ");
            return (
              <button key={r.place_id} type="button"
                onMouseDown={e => { e.preventDefault(); handleSelect(r); }}
                style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", border: "none", borderBottom: "1px solid #f3f4f6", background: "transparent", cursor: "pointer", textAlign: "left", transition: "background 0.1s" }}
                onMouseEnter={e => (e.currentTarget.style.background = "#f9fafb")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                {flag && <span style={{ fontSize: 20, lineHeight: 1, flexShrink: 0 }}>{flag}</span>}
                <div style={{ minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#111827" }}>{c}{co ? `, ${co}` : ""}</p>
                  {sub && sub !== co && <p style={{ margin: 0, fontSize: 11, color: "#6B7180", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{sub}</p>}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Language selector ────────────────────────────────────────────────────────

const LANGUAGES = [
  { code: "af", name: "Afrikaans",             flag: "🇿🇦" },
  { code: "sq", name: "Albanian",               flag: "🇦🇱" },
  { code: "ar", name: "Arabic",                 flag: "🇸🇦" },
  { code: "hy", name: "Armenian",               flag: "🇦🇲" },
  { code: "eu", name: "Basque",                 flag: "🏴" },
  { code: "bn", name: "Bengali",                flag: "🇧🇩" },
  { code: "bg", name: "Bulgarian",              flag: "🇧🇬" },
  { code: "ca", name: "Catalan",                flag: "🏴" },
  { code: "zh-CN", name: "Chinese (Simplified)",flag: "🇨🇳" },
  { code: "zh-TW", name: "Chinese (Traditional)",flag: "🇹🇼" },
  { code: "hr", name: "Croatian",               flag: "🇭🇷" },
  { code: "cs", name: "Czech",                  flag: "🇨🇿" },
  { code: "da", name: "Danish",                 flag: "🇩🇰" },
  { code: "nl", name: "Dutch",                  flag: "🇳🇱" },
  { code: "en", name: "English",                flag: "🇬🇧" },
  { code: "et", name: "Estonian",               flag: "🇪🇪" },
  { code: "fi", name: "Finnish",                flag: "🇫🇮" },
  { code: "fr", name: "French",                 flag: "🇫🇷" },
  { code: "ka", name: "Georgian",               flag: "🇬🇪" },
  { code: "de", name: "German",                 flag: "🇩🇪" },
  { code: "el", name: "Greek",                  flag: "🇬🇷" },
  { code: "gu", name: "Gujarati",               flag: "🇮🇳" },
  { code: "he", name: "Hebrew",                 flag: "🇮🇱" },
  { code: "hi", name: "Hindi",                  flag: "🇮🇳" },
  { code: "hu", name: "Hungarian",              flag: "🇭🇺" },
  { code: "is", name: "Icelandic",              flag: "🇮🇸" },
  { code: "id", name: "Indonesian",             flag: "🇮🇩" },
  { code: "ga", name: "Irish",                  flag: "🇮🇪" },
  { code: "it", name: "Italian",                flag: "🇮🇹" },
  { code: "ja", name: "Japanese",               flag: "🇯🇵" },
  { code: "kn", name: "Kannada",                flag: "🇮🇳" },
  { code: "ko", name: "Korean",                 flag: "🇰🇷" },
  { code: "lv", name: "Latvian",                flag: "🇱🇻" },
  { code: "lt", name: "Lithuanian",             flag: "🇱🇹" },
  { code: "lb", name: "Luxembourgish",          flag: "🇱🇺" },
  { code: "mk", name: "Macedonian",             flag: "🇲🇰" },
  { code: "ms", name: "Malay",                  flag: "🇲🇾" },
  { code: "mr", name: "Marathi",                flag: "🇮🇳" },
  { code: "no", name: "Norwegian",              flag: "🇳🇴" },
  { code: "fa", name: "Persian",                flag: "🇮🇷" },
  { code: "pl", name: "Polish",                 flag: "🇵🇱" },
  { code: "pt", name: "Portuguese",             flag: "🇵🇹" },
  { code: "ro", name: "Romanian",               flag: "🇷🇴" },
  { code: "ru", name: "Russian",                flag: "🇷🇺" },
  { code: "sa", name: "Sanskrit",               flag: "🇮🇳" },
  { code: "sr", name: "Serbian",                flag: "🇷🇸" },
  { code: "sk", name: "Slovak",                 flag: "🇸🇰" },
  { code: "sl", name: "Slovenian",              flag: "🇸🇮" },
  { code: "es", name: "Spanish",                flag: "🇪🇸" },
  { code: "sv", name: "Swedish",                flag: "🇸🇪" },
  { code: "ta", name: "Tamil",                  flag: "🇱🇰" },
  { code: "te", name: "Telugu",                 flag: "🇮🇳" },
  { code: "th", name: "Thai",                   flag: "🇹🇭" },
  { code: "tr", name: "Turkish",                flag: "🇹🇷" },
  { code: "uk", name: "Ukrainian",              flag: "🇺🇦" },
  { code: "ur", name: "Urdu",                   flag: "🇵🇰" },
  { code: "vi", name: "Vietnamese",             flag: "🇻🇳" },
  { code: "cy", name: "Welsh",                  flag: "🏴󠁧󠁢󠁷󠁬󠁳󠁿" },
];

function LanguageSelect({ value, onChange }: { value: string; onChange: (lang: string) => void }) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const selected = LANGUAGES.find(l => l.name === value);
  const filtered = search ? LANGUAGES.filter(l => l.name.toLowerCase().includes(search.toLowerCase())) : LANGUAGES;

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) { setOpen(false); setSearch(""); } };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const openDropdown = () => { setOpen(true); setTimeout(() => inputRef.current?.focus(), 10); };

  return (
    <div ref={wrapRef} style={{ position: "relative" }}>
      <button type="button" onClick={() => open ? setOpen(false) : openDropdown()} style={{ width: "100%", padding: "12px 16px", background: "#fff", border: "1px solid #E2E2DE", borderRadius: 12, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 15, color: "#111827", fontFamily: "var(--font)", textAlign: "left" }}>
        <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {selected?.flag && <span style={{ fontSize: 20, lineHeight: 1 }}>{selected.flag}</span>}
          <span style={{ fontWeight: selected ? 500 : 400, color: selected ? "#111827" : "#9CA3AF" }}>{selected?.name ?? "Select a language…"}</span>
        </span>
        <span style={{ fontSize: 10, color: "#6B7180", transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>▾</span>
      </button>

      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, zIndex: 200, background: "#fff", border: "1px solid #E2E2DE", borderRadius: 12, boxShadow: "0 8px 28px rgba(10,14,20,0.14)", overflow: "hidden", animation: "fadeUp 0.15s ease-out" }}>
          <div style={{ padding: "8px 10px", borderBottom: "1px solid #f3f4f6" }}>
            <input ref={inputRef} className="inp" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search language…" style={{ height: 36, borderRadius: 8, fontSize: 13 }}/>
          </div>
          <div style={{ maxHeight: 260, overflowY: "auto" }}>
            {filtered.map(l => {
              const sel = l.name === value;
              return (
                <button key={l.code} type="button"
                  onMouseDown={() => { onChange(l.name); setOpen(false); setSearch(""); }}
                  style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "9px 14px", border: "none", background: sel ? "rgba(255,90,31,0.06)" : "transparent", cursor: "pointer", textAlign: "left", fontSize: 14, color: sel ? "var(--accent)" : "#374151", fontWeight: sel ? 600 : 400, transition: "background 0.1s" }}
                  onMouseEnter={e => { if (!sel) e.currentTarget.style.background = "#f9fafb"; }}
                  onMouseLeave={e => { if (!sel) e.currentTarget.style.background = "transparent"; }}
                >
                  {l.flag && <span style={{ fontSize: 18, lineHeight: 1, flexShrink: 0 }}>{l.flag}</span>}
                  <span style={{ flex: 1 }}>{l.name}</span>
                  {sel && <span style={{ fontSize: 13, color: "var(--accent)" }}>✓</span>}
                </button>
              );
            })}
            {filtered.length === 0 && <p style={{ padding: "12px 14px", fontSize: 13, color: "#6B7180", margin: 0 }}>No languages found</p>}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Image uploader ──────────────────────────────────────────────────────────
// Uses <label htmlFor> — never needs programmatic .click(), works everywhere.

const IMG_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"];
const IMG_MAX_MB = 10; // validated before compression; after compression will be much smaller

type ImgValue = { dataUrl: string; fileName: string } | null;

// Compress an image data URL using the browser Canvas API.
// Resizes to maxDim on the longest side and re-encodes.
// SVGs are returned as-is (text-based, already small).
function compressImage(dataUrl: string, maxDim = 1200, quality = 0.78): Promise<string> {
  if (dataUrl.startsWith("data:image/svg")) return Promise.resolve(dataUrl);
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height, 1));
      const w = Math.max(1, Math.round(img.width * scale));
      const h = Math.max(1, Math.round(img.height * scale));
      try {
        const canvas = document.createElement("canvas");
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) { resolve(dataUrl); return; }
        ctx.drawImage(img, 0, 0, w, h);
        // Keep PNG for transparency; compress everything else as JPEG
        const isPng = dataUrl.startsWith("data:image/png");
        const out = isPng ? canvas.toDataURL("image/png") : canvas.toDataURL("image/jpeg", quality);
        resolve(out.length < dataUrl.length ? out : dataUrl);
      } catch { resolve(dataUrl); }
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

function ImageUploader({
  id, value, onChange, label = "Upload image",
  shape = "square", previewW = 56, previewH = 56,
}: {
  id: string; value: ImgValue;
  onChange: (v: ImgValue) => void;
  label?: string; shape?: "square" | "circle";
  previewW?: number; previewH?: number;
}) {
  const [err, setErr] = useState("");
  const [compressing, setCompressing] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    setErr("");
    const file = e.target.files?.[0];
    if (!file) return;
    if (!IMG_TYPES.includes(file.type)) {
      setErr("Please upload a JPG, PNG, GIF, WebP, or SVG image.");
      e.target.value = ""; return;
    }
    if (file.size > IMG_MAX_MB * 1024 * 1024) {
      setErr(`Max ${IMG_MAX_MB}MB — this file is ${(file.size / 1024 / 1024).toFixed(1)}MB.`);
      e.target.value = ""; return;
    }
    setCompressing(true);
    const reader = new FileReader();
    reader.onerror = () => { setErr("Could not read the image. Please try again."); e.target.value = ""; setCompressing(false); };
    reader.onload = async ev => {
      try {
        const raw = ev.target?.result as string;
        if (!raw) { setErr("Could not read the image."); return; }
        const compressed = await compressImage(raw);
        onChange({ dataUrl: compressed, fileName: file.name });
      } catch { setErr("Could not process image. Please try again."); }
      finally { setCompressing(false); e.target.value = ""; }
    };
    reader.readAsDataURL(file);
  };

  const borderRadius = shape === "circle" ? "50%" : 8;

  return (
    <div style={{ display: "inline-flex", flexDirection: "column", gap: 6 }}>
      {compressing && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#6B7180" }}>
          <svg width="14" height="14" viewBox="0 0 14 14" style={{ animation: "spin 0.7s linear infinite", flexShrink: 0 }}>
            <circle cx="7" cy="7" r="5" fill="none" stroke="#E2E2DE" strokeWidth="2"/>
            <path d="M7 2a5 5 0 015 5" fill="none" stroke="#6B7180" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Optimising…
        </div>
      )}
      {!compressing && !!value && (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <img src={value.dataUrl} alt={value.fileName}
            style={{ width: previewW, height: previewH, objectFit: "cover", borderRadius, border: "1px solid var(--border)", flexShrink: 0 }}/>
          <div>
            <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: "#374151", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{value.fileName}</p>
            <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
              <label htmlFor={id} style={{ fontSize: 11, color: "var(--accent)", cursor: "pointer", textDecoration: "underline" }}>Replace</label>
              <button type="button" onClick={() => { onChange(null); setErr(""); }}
                style={{ fontSize: 11, color: "#ef4444", background: "none", border: "none", cursor: "pointer", padding: 0 }}>Remove</button>
            </div>
          </div>
        </div>
      )}
      {!compressing && !value && (
        <label htmlFor={id} style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          padding: "6px 13px", borderRadius: 8, cursor: "pointer",
          border: "1.5px dashed var(--border)",
          fontSize: 12, color: "#6B7180", fontFamily: "var(--font)",
          transition: "border-color 0.15s, color 0.15s",
          userSelect: "none",
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "#374151"; e.currentTarget.style.color = "#374151"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "#6B7180"; }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
          {label}
        </label>
      )}
      {err && <p style={{ margin: 0, fontSize: 11, color: "#ef4444" }}>{err}</p>}
      {/* Hidden input — label triggers it via htmlFor, no JS click needed */}
      <input id={id} type="file" accept={IMG_TYPES.join(",")} onChange={handleChange} style={{ display: "none" }}/>
    </div>
  );
}

// ─── AI rephrase toggle ───────────────────────────────────────────────────────

function AiToggle({ value, onChange, label = "AI will rephrase this for better quality" }: {
  value: boolean; onChange: (v: boolean) => void; label?: string;
}) {
  return (
    <div style={{ marginTop: 10 }}>
      <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
        <div
          onClick={() => onChange(!value)}
          style={{
            width: 36, height: 20, borderRadius: 10, flexShrink: 0, position: "relative",
            background: value ? "var(--accent)" : "var(--border)", transition: "background 0.2s", cursor: "pointer",
          }}
        >
          <span style={{
            position: "absolute", top: 2, left: value ? 18 : 2,
            width: 16, height: 16, borderRadius: 8, background: "#fff",
            transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
          }}/>
        </div>
        <span style={{ fontSize: 12, color: value ? "#111827" : "#374151", fontWeight: 600 }}>
          {value ? "✓ " : ""}{label}
        </span>
      </label>
      <p style={{ fontSize: 11, color: "#6B7180", margin: "5px 0 0 46px", lineHeight: 1.5 }}>
        {value
          ? "AI will improve grammar, tone, and clarity while keeping your message. Toggle off to keep your exact wording."
          : "Your exact text will be used as-is, without any AI edits."}
      </p>
    </div>
  );
}

// ─── Skip checkbox ────────────────────────────────────────────────────────────

function SkipCheck({ checked, onChange, label, helpText }: {
  checked: boolean; onChange: (v: boolean) => void; label: string; helpText: string;
}) {
  return (
    <label style={{ display: "flex", alignItems: "flex-start", gap: 8, marginTop: 8, cursor: "pointer" }}>
      <div
        onClick={() => onChange(!checked)}
        style={{
          width: 16, height: 16, marginTop: 1, borderRadius: 4, flexShrink: 0, border: checked ? "none" : "1.5px solid var(--border-h)",
          background: checked ? "var(--accent)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
        }}
      >
        {checked && <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg>}
      </div>
      <div>
        <span style={{ fontSize: 12, color: "#111827", fontWeight: 600 }}>{label}</span>
        {checked && <p style={{ margin: "3px 0 0", fontSize: 11, color: "#6B7180", lineHeight: 1.4 }}>{helpText}</p>}
      </div>
    </label>
  );
}

// ─── Schedule picker ──────────────────────────────────────────────────────────

function SchedulePicker({ schedule, onChange }: {
  schedule: WizardData["schedule"];
  onChange: (s: WizardData["schedule"]) => void;
}) {
  const setType = (type: WizardData["schedule"]["type"]) => onChange({ ...schedule, type });
  const setDay = (day: string, field: keyof DayHours, val: string | boolean) =>
    onChange({ ...schedule, hours: { ...schedule.hours, [day]: { ...schedule.hours[day], [field]: val } } });

  const applyWeekdayHours = () => {
    const mon = schedule.hours["monday"];
    const next = { ...schedule.hours };
    ["tuesday","wednesday","thursday","friday"].forEach(d => { next[d] = { ...mon, closed: false }; });
    onChange({ ...schedule, hours: next });
  };

  const times: string[] = [];
  for (let h = 0; h < 24; h++) {
    ["00","30"].forEach(m => times.push(`${String(h).padStart(2,"0")}:${m}`));
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {SCHEDULE_TYPES.map(s => {
          const on = schedule.type === s.id;
          return (
            <button key={s.id} type="button" onClick={() => setType(s.id as WizardData["schedule"]["type"])} style={{
              textAlign: "left", padding: "10px 12px", borderRadius: 9, cursor: "pointer",
              border: on ? "2px solid var(--accent)" : "2px solid var(--border)",
              background: on ? "rgba(99,102,241,0.08)" : "transparent", transition: "all 0.15s",
            }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: on ? "var(--accent)" : "#374151", margin: 0 }}>{s.label}</p>
              <p style={{ fontSize: 10, color: "#6B7180", margin: "2px 0 0" }}>{s.desc}</p>
            </button>
          );
        })}
      </div>

      {schedule.type === "custom" && (
        <div style={{ marginTop: 4 }}>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
            <button type="button" onClick={applyWeekdayHours} style={{
              fontSize: 11, color: "var(--accent)", background: "none", border: "1px solid var(--border)",
              borderRadius: 6, padding: "4px 10px", cursor: "pointer",
            }}>
              ↕ Same hours Mon–Fri
            </button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {DAYS.map(day => {
              const h = schedule.hours[day] ?? { open: "09:00", close: "17:00", closed: false };
              return (
                <div key={day} style={{
                  display: "grid", gridTemplateColumns: "88px 1fr 24px 1fr auto",
                  gap: 8, alignItems: "center",
                  padding: "8px 12px", borderRadius: 8,
                  background: h.closed ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.04)",
                  border: "1px solid var(--border)",
                  opacity: h.closed ? 0.5 : 1, transition: "opacity 0.15s",
                }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#374151" }}>{DAY_LABELS[day]}</span>
                  <select
                    className="inp" value={h.open} disabled={h.closed}
                    onChange={e => setDay(day, "open", e.target.value)}
                    style={{ fontSize: 12, padding: "5px 8px", height: 32 }}
                  >
                    {times.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <span style={{ textAlign: "center", fontSize: 11, color: "#6B7180" }}>–</span>
                  <select
                    className="inp" value={h.close} disabled={h.closed}
                    onChange={e => setDay(day, "close", e.target.value)}
                    style={{ fontSize: 12, padding: "5px 8px", height: 32 }}
                  >
                    {times.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <label style={{ display: "flex", alignItems: "center", gap: 4, cursor: "pointer", whiteSpace: "nowrap" }}>
                    <input type="checkbox" checked={h.closed} onChange={e => setDay(day, "closed", e.target.checked)} style={{ accentColor: "var(--accent)" }}/>
                    <span style={{ fontSize: 11, color: "#6B7180" }}>Closed</span>
                  </label>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Step 1: Template Selection ───────────────────────────────────────────────

function StepTemplate({ selectedId, onSelect }: {
  selectedId: string;
  onSelect: (id: string, mapTo: TemplateMapTo) => void;
}) {
  return (
    <TemplateGallery
      selectedId={selectedId}
      onSelect={(id, mapTo) => onSelect(id, mapTo as unknown as TemplateMapTo)}
    />
  );
}

// ─── Step 2: Business Basics ──────────────────────────────────────────────────

const lbl = (text: string, required?: boolean) => (
  <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#111827", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.08em" }}>
    {text}{required && <span style={{ color: "#ef4444", marginLeft: 3 }}>*</span>}
    {!required && <span style={{ color: "#6B7180", fontWeight: 400, textTransform: "none", marginLeft: 4 }}>(optional)</span>}
  </label>
);

function Step2Business({ data, schedule, onChange, onScheduleChange }: {
  data: WizardData["business"];
  schedule: WizardData["schedule"];
  onChange: (d: WizardData["business"]) => void;
  onScheduleChange: (s: WizardData["schedule"]) => void;
}) {
  const set = <K extends keyof WizardData["business"]>(k: K, v: WizardData["business"][K]) => onChange({ ...data, [k]: v });
  const descLen = data.description.length;
  const descOk = descLen >= 20;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* ── Core identity ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div>
          {lbl("Business name", true)}
          <input className="inp" value={data.name} onChange={e => set("name", e.target.value)}
            placeholder="e.g., Bella Roma or Luna Photography" />
        </div>
        <div>
          {lbl("Business type", true)}
          <select className="inp" value={data.type} onChange={e => set("type", e.target.value)}>
            {BUSINESS_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
      </div>

      {/* ── Short description ── */}
      <div style={{ padding: "16px", background: "#f9fafb", border: "1px solid var(--border)", borderRadius: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          {lbl("Business description", true)}
          <span style={{ fontSize: 11, color: descOk ? "#10b981" : "var(--text3)" }}>{descLen}/500</span>
        </div>
        <textarea className="inp" value={data.description}
          onChange={e => set("description", e.target.value.slice(0, 500))}
          placeholder="What do you do? Who do you serve? Write rough notes — AI will polish it into professional copy."
          style={{ height: 90, resize: "none" }} />
        {descLen > 0 && !descOk && <p style={{ fontSize: 11, color: "#f87171", marginTop: 4 }}>Minimum 20 characters for best results.</p>}
        <p style={{ fontSize: 11, color: "#6B7180", marginTop: 6 }}>This information helps us understand your business needs.</p>
        <AiToggle value={data.aboutAiRephrase} onChange={v => set("aboutAiRephrase", v)}/>
      </div>

      {/* ── About / story ── */}
      <div style={{ padding: "16px", background: "#f9fafb", border: "1px solid var(--border)", borderRadius: 12 }}>
        {lbl("About your business")}
        <textarea className="inp" value={data.aboutText}
          onChange={e => set("aboutText", e.target.value.slice(0, 800))}
          placeholder="Describe your business's approach, philosophy, story, or what makes you different…"
          style={{ height: 90, resize: "none" }} />
        <p style={{ fontSize: 11, color: "#6B7180", marginTop: 6 }}>This information helps us understand your business needs.</p>
        <AiToggle value={data.aboutAiRephrase} onChange={v => set("aboutAiRephrase", v)} label="AI will rephrase this for better quality"/>
      </div>

      {/* ── Location ── */}
      <div>
        {lbl("Location", data.hasLocation)}
        <LocationAutocomplete
          city={data.locationCity}
          country={data.locationCountry}
          disabled={!data.hasLocation}
          onSelect={(city, country) => onChange({ ...data, locationCity: city, locationCountry: country, location: `${city}${country ? `, ${country}` : ""}` })}
          onClear={() => onChange({ ...data, locationCity: "", locationCountry: "", location: "" })}
        />
        <SkipCheck
          checked={!data.hasLocation}
          onChange={v => set("hasLocation", !v)}
          label="I don't have a physical location"
          helpText="That's fine — select this and continue. Your website will be tailored for an online-only business."
        />
        {data.hasLocation && (
          <div style={{ marginTop: 10 }}>
            {lbl("Service area")}
            <input className="inp" value={data.serviceArea} onChange={e => set("serviceArea", e.target.value)}
              placeholder="e.g., Greater London, Online only" />
          </div>
        )}
      </div>

      {/* ── Contact ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div>
          {lbl("Email")}
          <input className="inp" type="email" value={data.email} onChange={e => set("email", e.target.value)}
            placeholder="contact@yourbusiness.com" />
        </div>
        <div>
          {lbl("Phone", data.hasPhone)}
          <input className="inp" type="tel" value={data.phone} onChange={e => set("phone", e.target.value)}
            disabled={!data.hasPhone}
            placeholder="+1 555 000 1234" style={{ opacity: data.hasPhone ? 1 : 0.4, transition: "opacity 0.2s" }} />
          <SkipCheck
            checked={!data.hasPhone}
            onChange={v => set("hasPhone", !v)}
            label="I don't have a phone number"
            helpText="No problem — you can skip this and visitors will contact you by email or form instead."
          />
        </div>
      </div>

      {/* ── Business schedule ── */}
      <div>
        <SectionLabel label="Business schedule" />
        <SchedulePicker schedule={schedule} onChange={onScheduleChange}/>
      </div>

      {/* ── Experience + owner ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div>
          {lbl("Years in business")}
          <select className="inp" value={data.experience} onChange={e => set("experience", e.target.value)}>
            {EXPERIENCE_OPTIONS.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
          </select>
        </div>
        <div>
          {lbl("Your name")}
          <input className="inp" value={data.ownerName} onChange={e => set("ownerName", e.target.value)}
            placeholder="For personalization" />
        </div>
      </div>
    </div>
  );
}

// ─── Step 3: Goals & Audience ─────────────────────────────────────────────────

function StepGoals({ data, onChange }: { data: WizardData["goals"]; onChange: (d: WizardData["goals"]) => void }) {
  const set = (k: keyof typeof data, v: string) => onChange({ ...data, [k]: v });
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <SectionLabel label="Main goal — what should your website accomplish?" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {MAIN_GOALS.map(g => {
            const on = data.mainGoal === g.id;
            return (
              <button key={g.id} type="button" onClick={() => set("mainGoal", g.id)} style={{
                textAlign: "left", padding: "12px 14px", borderRadius: 10, cursor: "pointer",
                border: on ? "2px solid var(--accent)" : "2px solid var(--border)",
                background: on ? "rgba(99,102,241,0.08)" : "transparent",
                transition: "all 0.15s",
              }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: on ? "var(--accent)" : "#111827", margin: 0 }}>{g.label}</p>
                <p style={{ fontSize: 11, color: "#6B7180", margin: "3px 0 0" }}>{g.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <SectionLabel label="How should visitors feel when they land on your site?" />
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {VISITOR_FEELS.map(feel => {
            const on = data.visitorFeel === feel;
            return (
              <button key={feel} type="button" onClick={() => set("visitorFeel", on ? "" : feel)} style={{
                padding: "8px 16px", borderRadius: 999, fontSize: 13, fontWeight: 500, cursor: "pointer",
                border: on ? "2px solid var(--accent)" : "2px solid var(--border)",
                background: on ? "rgba(99,102,241,0.12)" : "transparent",
                color: on ? "var(--accent)" : "#374151", transition: "all 0.15s",
              }}>{feel}</button>
            );
          })}
        </div>
      </div>

      <div>
        <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#111827", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.08em" }}>
          Who is your ideal customer? <span style={{ color: "#6B7180", fontWeight: 400, textTransform: "none" }}>(optional)</span>
        </label>
        <input className="inp" value={data.idealCustomer} onChange={e => set("idealCustomer", e.target.value)}
          placeholder="e.g., Busy professionals aged 30–50 looking for quick, reliable service" />
      </div>

      <div>
        <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#111827", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.08em" }}>
          What problem do you solve for them? <span style={{ color: "#6B7180", fontWeight: 400, textTransform: "none" }}>(optional)</span>
        </label>
        <textarea className="inp" value={data.problemSolved} onChange={e => set("problemSolved", e.target.value)}
          placeholder="e.g., We fix plumbing emergencies fast without overcharging — fully transparent pricing"
          style={{ height: 80, resize: "none" }} />
      </div>

      <div>
        <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#111827", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.08em" }}>
          Why should they choose you over competitors? <span style={{ color: "#6B7180", fontWeight: 400, textTransform: "none" }}>(optional)</span>
        </label>
        <textarea className="inp" value={data.whyChoose} onChange={e => set("whyChoose", e.target.value)}
          placeholder="e.g., Family-owned since 1998, certified professionals, same-day guarantee, 500+ 5-star reviews"
          style={{ height: 80, resize: "none" }} />
      </div>
    </div>
  );
}

// ─── Step 4: Services & Pricing ───────────────────────────────────────────────

function StepServices({ data, onChange }: { data: WizardData["services"]; onChange: (d: WizardData["services"]) => void }) {
  const set = <K extends keyof WizardData["services"]>(k: K, v: WizardData["services"][K]) =>
    onChange({ ...data, [k]: v });

  const addItem = () => set("list", [...data.list, ""]);
  const updateItem = (i: number, v: string) => {
    const next = [...data.list]; next[i] = v; set("list", next);
  };
  const removeItem = (i: number) => set("list", data.list.filter((_, idx) => idx !== i));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <SectionLabel label="What do you offer?" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {OFFERS_TYPES.map(o => {
            const on = data.offersType === o.id;
            return (
              <button key={o.id} type="button" onClick={() => set("offersType", o.id)} style={{
                textAlign: "left", padding: "12px 14px", borderRadius: 10, cursor: "pointer",
                border: on ? "2px solid var(--accent)" : "2px solid var(--border)",
                background: on ? "rgba(99,102,241,0.08)" : "transparent", transition: "all 0.15s",
              }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: on ? "var(--accent)" : "#111827", margin: 0 }}>{o.label}</p>
                <p style={{ fontSize: 11, color: "#6B7180", margin: "3px 0 0" }}>{o.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <SectionLabel label="List your main services or products (optional — AI will generate descriptions)" />
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {data.list.map((item, i) => (
            <div key={i} style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input className="inp" value={item} onChange={e => updateItem(i, e.target.value)}
                placeholder={`e.g., ${i === 0 ? "Haircut & Styling" : i === 1 ? "Color & Highlights" : "Deep Conditioning"}`}
                style={{ flex: 1 }} />
              <button type="button" onClick={() => removeItem(i)} style={{
                flexShrink: 0, width: 32, height: 32, borderRadius: 8, border: "1.5px solid var(--border)",
                background: "transparent", color: "#f87171", cursor: "pointer", fontSize: 16, lineHeight: 1,
              }}>×</button>
            </div>
          ))}
          <button type="button" onClick={addItem} style={{
            alignSelf: "flex-start", padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 500,
            border: "1.5px dashed var(--border)", background: "transparent", color: "var(--text2)", cursor: "pointer",
          }}>+ Add item</button>
        </div>
      </div>

      <div>
        <SectionLabel label="How should pricing be shown on the website?" />
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {PRICE_VISIBILITY.map(p => {
            const on = data.priceVisibility === p.id;
            return (
              <button key={p.id} type="button" onClick={() => set("priceVisibility", p.id)} style={{
                padding: "8px 16px", borderRadius: 999, fontSize: 13, fontWeight: 500, cursor: "pointer",
                border: on ? "2px solid var(--accent)" : "2px solid var(--border)",
                background: on ? "rgba(99,102,241,0.12)" : "transparent",
                color: on ? "var(--accent)" : "#374151", transition: "all 0.15s",
              }}>{p.label}</button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Step 5: Design Style ─────────────────────────────────────────────────────

function Step3Design({ data, onChange }: { data: WizardData["design"]; onChange: (d: WizardData["design"]) => void }) {
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
                <div style={{ padding: "6px 8px", background: "#f9fafb", borderTop: "1px solid var(--border)" }}>
                  <p style={{ fontSize: 11, fontWeight: 600, color: on ? "var(--accent)" : "#111827", margin: 0 }}>{s.name}</p>
                  <p style={{ fontSize: 9, color: "#6B7180", margin: "2px 0 0" }}>{s.best}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <SectionLabel label="Personality level" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
          {PERSONALITY_LEVELS.map(p => {
            const on = data.personalityLevel === p.id;
            return (
              <button key={p.id} type="button" onClick={() => set("personalityLevel", p.id)} style={{
                textAlign: "left", padding: "10px 12px", borderRadius: 10, cursor: "pointer",
                border: on ? "2px solid var(--accent)" : "2px solid var(--border)",
                background: on ? "rgba(99,102,241,0.08)" : "transparent", transition: "all 0.15s",
              }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: on ? "var(--accent)" : "#111827", margin: 0 }}>{p.label}</p>
                <p style={{ fontSize: 10, color: "#6B7180", margin: "3px 0 0" }}>{p.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <SectionLabel label="Background style" />
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {BACKGROUND_STYLES.map(b => {
            const on = data.backgroundStyle === b.id;
            return (
              <button key={b.id} type="button" onClick={() => set("backgroundStyle", b.id)} style={{
                padding: "8px 16px", borderRadius: 999, fontSize: 13, fontWeight: 500, cursor: "pointer",
                border: on ? "2px solid var(--accent)" : "2px solid var(--border)",
                background: on ? "rgba(99,102,241,0.12)" : "transparent",
                color: on ? "var(--accent)" : "#374151", transition: "all 0.15s",
              }}>{b.label}</button>
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

      <div>
        <SectionLabel label="Animations & interactions" />
        <RadioRow options={ANIMATION_OPTS} value={data.animations} onChange={v => set("animations", v)} />
      </div>

      <Toggle checked={data.darkMode} onChange={v => set("darkMode", v)}
        label="Include dark mode" desc="Adds a dark variant — appealing on mobile, modern UX" />
    </div>
  );
}

// ─── Step 6: Typography & Imagery ─────────────────────────────────────────────

function Step4Typography({ data, onChange, logo, onLogoChange }: {
  data: WizardData["typography"];
  onChange: (d: WizardData["typography"]) => void;
  logo: WizardData["logo"];
  onLogoChange: (d: WizardData["logo"]) => void;
}) {
  const set = (k: keyof typeof data, v: string) => onChange({ ...data, [k]: v });

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
                <div style={{ height: 60, background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ ...f.style, fontSize: "1.7rem", color: "#111827" }}>{f.sample}</span>
                </div>
                <div style={{ padding: "6px 8px", background: "#f9fafb", borderTop: "1px solid var(--border)" }}>
                  <p style={{ fontSize: 10, fontWeight: 600, color: on ? "var(--accent)" : "#111827", margin: 0 }}>{f.name}</p>
                  <p style={{ fontSize: 9, color: "#6B7180", margin: "2px 0 0" }}>{f.best}</p>
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
        <p style={{ fontSize: 12, color: "#6B7180", marginBottom: 10, marginTop: -8 }}>PNG, SVG, JPG or WebP · Max 5MB — AI places it in the header, sized for navigation.</p>
        <ImageUploader
          id="logo-upload"
          value={logo.uploaded ? { dataUrl: logo.dataUrl, fileName: logo.fileName } : null}
          onChange={v => onLogoChange(v ? { uploaded: true, dataUrl: v.dataUrl, fileName: v.fileName } : { uploaded: false, dataUrl: "", fileName: "" })}
          label="Upload your logo"
          previewW={80} previewH={80}
        />
      </div>

      <div>
        <SectionLabel label="Hero section style" />
        <RadioRow options={HERO_PREFS} value={data.heroPreference} onChange={v => set("heroPreference", v)} />
      </div>
    </div>
  );
}

// ─── Page description block ────────────────────────────────────────────────────

function PageDescBlock({ pageId, pageName, desc, onChange }: {
  pageId: string; pageName: string;
  desc: PageDesc;
  onChange: (d: PageDesc) => void;
}) {
  return (
    <div style={{ marginTop: 8, padding: "12px 14px", background: "#eef2ff", border: "1px solid #c7d2fe", borderRadius: 10, display: "flex", flexDirection: "column", gap: 8, animation: "fadeUp 0.2s ease-out" }}>
      <p style={{ fontSize: 11, fontWeight: 700, color: "#374151", margin: 0, textTransform: "uppercase", letterSpacing: "0.08em" }}>{pageName} section</p>
      <textarea className="inp" value={desc.description}
        onChange={e => onChange({ ...desc, description: e.target.value })}
        placeholder="Describe this section in a few words…"
        style={{ height: 64, resize: "none", fontSize: 13 }} />
      <AiToggle value={desc.aiRephrase} onChange={v => onChange({ ...desc, aiRephrase: v })} label="AI will rephrase this for better quality"/>
      <ImageUploader
        id={`section-img-${pageId}`}
        value={desc.image ? { dataUrl: desc.image, fileName: desc.imageName } : null}
        onChange={v => onChange({ ...desc, image: v?.dataUrl ?? "", imageName: v?.fileName ?? "" })}
        label="+ Add image for this section"
        previewW={72} previewH={52}
      />
    </div>
  );
}

// ─── Team section ─────────────────────────────────────────────────────────────

function TeamSection({ team, onChange }: {
  team: WizardData["team"];
  onChange: (t: WizardData["team"]) => void;
}) {
  const addMember = () => onChange({ ...team, members: [...team.members, { name: "", role: "", bio: "", photo: "", fileName: "" }] });
  const removeMember = (i: number) => onChange({ ...team, members: team.members.filter((_, idx) => idx !== i) });
  const setMember = (i: number, field: keyof TeamMember, val: string) => {
    const next = team.members.map((m, idx) => idx === i ? { ...m, [field]: val } : m);
    onChange({ ...team, members: next });
  };
  const setPhoto = (i: number, v: ImgValue) => {
    const next = team.members.map((m, idx) => idx === i ? { ...m, photo: v?.dataUrl ?? "", fileName: v?.fileName ?? "" } : m);
    onChange({ ...team, members: next });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {[{id:"no",label:"No team section",desc:"Skip the team section"},{id:"yes",label:"Yes, add team members",desc:"Feature your team on the website"}].map(o => {
          const on = team.enabled === (o.id === "yes");
          return (
            <button key={o.id} type="button" onClick={() => onChange({ ...team, enabled: o.id === "yes" })} style={{
              textAlign: "left", padding: "10px 12px", borderRadius: 9, cursor: "pointer",
              border: on ? "2px solid var(--accent)" : "2px solid var(--border)",
              background: on ? "rgba(99,102,241,0.08)" : "transparent", transition: "all 0.15s",
            }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: on ? "var(--accent)" : "#374151", margin: 0 }}>{o.label}</p>
              <p style={{ fontSize: 10, color: "#6B7180", margin: "2px 0 0" }}>{o.desc}</p>
            </button>
          );
        })}
      </div>

      {team.enabled && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12, animation: "fadeUp 0.2s ease-out" }}>
          {team.members.map((m, i) => (
            <div key={i} style={{ padding: "14px 16px", background: "#f3f4f6", border: "1px solid var(--border)", borderRadius: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#6B7180", textTransform: "uppercase", letterSpacing: "0.08em" }}>Team member {i + 1}</span>
                <button type="button" onClick={() => removeMember(i)} style={{ fontSize: 11, color: "#f87171", background: "none", border: "none", cursor: "pointer" }}>Remove</button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                <div>
                  {lbl("Name")}
                  <input className="inp" value={m.name} onChange={e => setMember(i, "name", e.target.value)} placeholder="e.g., Sarah Johnson"/>
                </div>
                <div>
                  {lbl("Role / Position")}
                  <input className="inp" value={m.role} onChange={e => setMember(i, "role", e.target.value)} placeholder="e.g., Head Chef"/>
                </div>
              </div>
              {lbl("Short bio")}
              <textarea className="inp" value={m.bio} onChange={e => setMember(i, "bio", e.target.value)}
                placeholder="A brief description of their experience or background…"
                style={{ height: 64, resize: "none", marginBottom: 10 }}/>
              <ImageUploader
                id={`team-photo-${i}`}
                value={m.photo ? { dataUrl: m.photo, fileName: m.fileName } : null}
                onChange={v => setPhoto(i, v)}
                label="+ Add photo"
                shape="circle"
                previewW={44} previewH={44}
              />
            </div>
          ))}
          <button type="button" onClick={addMember} style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            padding: "10px", borderRadius: 9, border: "1.5px dashed var(--border)",
            background: "transparent", color: "#6B7180", fontSize: 13, cursor: "pointer",
          }}>
            + Add team member
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Step 5: Pages & Content ──────────────────────────────────────────────────

function Step5Pages({ data, team, useEmojis, websiteLanguage, onChange, onTeamChange, onEmojisChange, onLanguageChange }: {
  data: WizardData["pages"];
  team: WizardData["team"];
  useEmojis: boolean;
  websiteLanguage: string;
  onChange: (d: WizardData["pages"]) => void;
  onTeamChange: (t: WizardData["team"]) => void;
  onEmojisChange: (v: boolean) => void;
  onLanguageChange: (lang: string) => void;
}) {
  const togglePage = (id: string) => {
    if (id === "home") return;
    const sel = data.selected.includes(id)
      ? data.selected.filter(p => p !== id)
      : [...data.selected, id];
    // Remove description when deselecting
    const pageDescriptions = { ...data.pageDescriptions };
    if (data.selected.includes(id)) delete pageDescriptions[id];
    onChange({ ...data, selected: sel, pageDescriptions });
  };
  const setPageDesc = (id: string, desc: PageDesc) => onChange({ ...data, pageDescriptions: { ...data.pageDescriptions, [id]: desc } });
  const getDesc = (id: string): PageDesc => data.pageDescriptions[id] ?? { description: "", aiRephrase: true, image: "", imageName: "" };
  const allPages = [...ESSENTIAL_PAGES, ...EXTRA_PAGES];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* ── Pages ── */}
      <div>
        <SectionLabel label="Pages to include" />
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {allPages.map(p => {
            const on = data.selected.includes(p.id);
            const isHome = p.id === "home";
            const isRequired = (p as { required?: boolean }).required;
            return (
              <div key={p.id}>
                <button type="button" onClick={() => togglePage(p.id)} disabled={isRequired} style={{
                  width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "10px 14px",
                  borderRadius: 10, border: on ? "1.5px solid var(--accent)" : "1.5px solid var(--border)",
                  background: on ? "rgba(99,102,241,0.08)" : "transparent",
                  cursor: isRequired ? "not-allowed" : "pointer", textAlign: "left", transition: "all 0.15s",
                  opacity: isRequired ? 0.75 : 1,
                }}>
                  <div style={{ width: 16, height: 16, borderRadius: 4, flexShrink: 0, border: on ? "none" : "1.5px solid var(--border-h)", background: on ? "var(--accent)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {on && <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg>}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, fontWeight: 500, color: on ? "#111827" : "#374151", margin: 0 }}>
                      {p.label}
                      {isHome && <span style={{ fontSize: 10, color: "#6B7180", fontWeight: 400, marginLeft: 6 }}>(always included)</span>}
                    </p>
                    <p style={{ fontSize: 11, color: "#6B7180", margin: "2px 0 0" }}>{p.desc}</p>
                  </div>
                </button>
                {on && !isHome && (
                  <PageDescBlock
                    pageId={p.id} pageName={p.label}
                    desc={getDesc(p.id)}
                    onChange={d => setPageDesc(p.id, d)}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── CTA & Tone ── */}
      <div>
        <SectionLabel label="Primary call-to-action" />
        <RadioRow options={CTA_OPTIONS} value={data.primaryCTA} onChange={v => onChange({ ...data, primaryCTA: v })} />
      </div>
      <div>
        <SectionLabel label="Content tone" />
        <RadioRow options={TONE_OPTIONS} value={data.contentTone} onChange={v => onChange({ ...data, contentTone: v })} />
      </div>

      {/* ── Team ── */}
      <div>
        <SectionLabel label="Team section" />
        <TeamSection team={team} onChange={onTeamChange}/>
      </div>

      {/* ── Special features ── */}
      <div>
        <SectionLabel label="Special features to include" />
        <CheckRow options={SPECIAL_FEATURES} values={data.specialFeatures} onChange={v => onChange({ ...data, specialFeatures: v })}/>
      </div>

      {/* ── Emojis ── */}
      <div>
        <SectionLabel label="Use emojis in your website?" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {[
            { id: false, label: "No, keep it professional", desc: "No emojis — clean and formal" },
            { id: true,  label: "Yes, add emojis for personality", desc: "Emojis to make it feel friendly" },
          ].map(o => {
            const on = useEmojis === o.id;
            return (
              <button key={String(o.id)} type="button" onClick={() => onEmojisChange(o.id)} style={{
                textAlign: "left", padding: "10px 12px", borderRadius: 9, cursor: "pointer",
                border: on ? "2px solid var(--accent)" : "2px solid var(--border)",
                background: on ? "rgba(99,102,241,0.08)" : "transparent", transition: "all 0.15s",
              }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: on ? "var(--accent)" : "#374151", margin: 0 }}>{o.label}</p>
                <p style={{ fontSize: 10, color: "#6B7180", margin: "2px 0 0" }}>{o.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Website language ── */}
      <div>
        <SectionLabel label="Website language" />
        <LanguageSelect value={websiteLanguage} onChange={onLanguageChange}/>
        <p style={{ fontSize: 11, color: "#6B7180", marginTop: 7 }}>All website content will be generated in this language.</p>
      </div>

      {/* ── Additional notes ── */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <SectionLabel label="Anything else to tell the AI?" />
          <span style={{ fontSize: 11, color: "#6B7180" }}>{data.additionalNotes.length}/300</span>
        </div>
        <textarea className="inp" value={data.additionalNotes}
          onChange={e => onChange({ ...data, additionalNotes: e.target.value.slice(0, 300) })}
          placeholder="e.g., 'Include a before/after gallery', 'Prefer earth tones', 'We have 3 locations'"
          style={{ height: 90, resize: "none" }} />
      </div>
    </div>
  );
}

// ─── Step 7: Review ───────────────────────────────────────────────────────────

function Step7Review({ data, onEdit, onSubmit, loading, countdown, stageMsg, vercelAuthorized }: {
  data: WizardData;
  onEdit: (step: number) => void;
  onSubmit: () => void;
  loading: boolean;
  countdown: number;
  stageMsg: string;
  vercelAuthorized: boolean | null;
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
        <p style={{ fontSize: 11, color: "#6B7180", margin: 0, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>{label}</p>
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
        {row("Business", `${data.business.name} — ${data.business.type}`, 2)}
        {row("Description", data.business.description.slice(0, 80) + (data.business.description.length > 80 ? "…" : ""), 2)}
        {data.business.location && row("Location", `${data.business.location}${data.business.serviceArea ? ` · ${data.business.serviceArea}` : ""}`, 2)}
        {data.business.email && row("Contact", `${data.business.email}${data.business.phone ? ` · ${data.business.phone}` : ""}`, 2)}
        {data.goals.mainGoal && row("Main goal", MAIN_GOALS.find(g => g.id === data.goals.mainGoal)?.label || data.goals.mainGoal, 3)}
        {data.goals.visitorFeel && row("Visitor feeling", data.goals.visitorFeel, 3)}
        {data.goals.whyChoose && row("Your edge", data.goals.whyChoose.slice(0, 80) + (data.goals.whyChoose.length > 80 ? "…" : ""), 3)}
        {data.services.offersType && row("What you offer", OFFERS_TYPES.find(o => o.id === data.services.offersType)?.label || data.services.offersType, 4)}
        {data.services.list.length > 0 && row("Services / products", data.services.list.filter(Boolean).join(", ").slice(0, 80), 4)}
        {row("Design style", style?.name || data.design.style, 5)}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 11, color: "#6B7180", margin: 0, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>Colors</p>
            <div style={{ display: "flex", gap: 8, marginTop: 6, alignItems: "center" }}>
              <div style={{ width: 20, height: 20, borderRadius: "50%", background: data.design.primaryColor, border: "1.5px solid rgba(255,255,255,0.15)" }} />
              <div style={{ width: 20, height: 20, borderRadius: "50%", background: data.design.secondaryColor, border: "1.5px solid rgba(255,255,255,0.15)" }} />
              {data.design.darkMode && <span style={{ fontSize: 11, color: "#6B7180" }}>+ dark mode</span>}
            </div>
          </div>
          <button type="button" onClick={() => onEdit(5)} style={{ fontSize: 11, color: "var(--accent)", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>Edit</button>
        </div>
        {row("Typography", font?.name || data.typography.fontFamily, 6)}
        {row("Imagery", imagery?.label || data.typography.imageryStyle, 6)}
        {data.logo.uploaded && row("Logo", data.logo.fileName, 6)}
        {row("Pages", pages.join(", ") || "Home", 7)}
        {row("Primary CTA", cta?.label || data.pages.primaryCTA, 7)}
        {row("Content tone", tone?.label || data.pages.contentTone, 7)}
        {data.pages.specialFeatures.length > 0 && row("Special features", data.pages.specialFeatures.join(", "), 7)}
        {data.pages.additionalNotes && row("Additional notes", data.pages.additionalNotes, 7)}
      </div>

      {loading && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <p style={{ fontSize: 13, color: "var(--text2)", margin: 0 }}>{stageMsg}</p>
            <div style={{ display: "flex", alignItems: "baseline", gap: 3 }}>
              <span key={countdown} className="countdown-num" style={{ fontSize: "1.8rem", fontWeight: 700, color: "var(--accent)" }}>{countdown}</span>
              <span style={{ fontSize: 12, color: "#6B7180" }}>s</span>
            </div>
          </div>
          <div style={{ height: 4, background: "#eef2ff", borderRadius: 99, overflow: "hidden" }}>
            <div className="shimmer-bar" style={{
              height: "100%", background: "linear-gradient(135deg,var(--accent),var(--accent2))",
              width: `${progressPct}%`, borderRadius: 99, transition: "width 0.8s ease",
            }} />
          </div>
        </div>
      )}

      {/* ── Vercel connection status ── */}
      {!loading && (
        <div style={{ marginBottom: 16, padding: "14px 16px", borderRadius: 12, border: "1px solid", borderColor: vercelAuthorized ? "#bbf7d0" : "#fed7aa", background: vercelAuthorized ? "#f0fdf4" : "#fff7ed", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
            <span style={{ fontSize: 20, lineHeight: 1, marginTop: 1 }}>{vercelAuthorized === null ? "⏳" : vercelAuthorized ? "✅" : "⚠️"}</span>
            <div>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: vercelAuthorized ? "#166534" : "#92400e" }}>
                {vercelAuthorized === null ? "Checking Vercel…" : vercelAuthorized ? "Vercel connected — site deploys to your account" : "Vercel not connected"}
              </p>
              <p style={{ margin: "3px 0 0", fontSize: 12, color: vercelAuthorized ? "#166534" : "#b45309", lineHeight: 1.4 }}>
                {vercelAuthorized
                  ? "Your generated website will be deployed directly to your own Vercel project."
                  : "Connect your Vercel account so the site is deployed under your ownership. You can also continue without connecting — we'll deploy it on your behalf."}
              </p>
            </div>
          </div>
          {!vercelAuthorized && vercelAuthorized !== null && (
            <a href="/api/auth/vercel/authorize" style={{ flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 5, padding: "7px 14px", borderRadius: 8, background: "#0A0E14", color: "#fff", fontSize: 12, fontWeight: 600, textDecoration: "none", whiteSpace: "nowrap" }}>
              Connect Vercel ↗
            </a>
          )}
        </div>
      )}

      <button type="button" onClick={onSubmit} disabled={loading} className="btn-primary rounded-xl py-4 w-full" style={{ fontSize: 16 }}>
        {loading ? "Generating your website..." : "Generate My Website →"}
      </button>
      <p style={{ fontSize: 12, color: "#6B7180", textAlign: "center", marginTop: 8 }}>Takes approximately 100 seconds. Free while in beta.</p>
    </div>
  );
}

// ─── Pricing Step ─────────────────────────────────────────────────────────────

const PLANS = [
  {
    id: "website" as const,
    name: "Website",
    price: 49,
    edits: 0,
    editNote: "€10 per change",
    savings: null,
    badge: null,
    features: ["AI-generated website", "Deployed to your Vercel", "Full code ownership"],
  },
  {
    id: "website_5" as const,
    name: "Website + 5 Changes",
    price: 69,
    edits: 5,
    editNote: "€10/change after 5",
    savings: "Save €50",
    badge: "Most popular",
    features: ["Everything in Website", "5 FREE changes included", "Custom domain ready"],
  },
] as const;

function PricingStep({
  selected, onSelect, onGenerate, onBack, loading, stageMsg, countdown,
}: {
  selected: "website" | "website_5";
  onSelect: (t: "website" | "website_5") => void;
  onGenerate: () => void;
  onBack: () => void;
  loading: boolean;
  stageMsg: string;
  countdown: number;
}) {
  const T = { ink: "#0A0E14", six: "#FF5A1F", em: "#00B377", emSoft: "#E5F7EE", em2: "#009062", line: "#E2E2DE", muted: "#6B7180", bg2: "#F2F2EF" };
  const plan = PLANS.find(p => p.id === selected)!;

  return (
    <div>
      {/* Beta banner */}
      <div style={{ background: T.emSoft, border: `1px solid rgba(0,179,119,0.2)`, borderRadius: 10, padding: "10px 14px", marginBottom: 22, display: "flex", gap: 8, alignItems: "center" }}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6.5" stroke={T.em2} strokeWidth="1.5"/><path d="M7 4v4M7 9.5v.5" stroke={T.em2} strokeWidth="1.5" strokeLinecap="round"/></svg>
        <p style={{ fontFamily: "system-ui,sans-serif", fontSize: 13, color: T.em2, margin: 0 }}>
          <strong>Beta:</strong> All plans are free during our launch period. Select your plan for when billing activates.
        </p>
      </div>

      {/* Plan cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 20 }}>
        {PLANS.map(p => {
          const isSel = selected === p.id;
          return (
            <button key={p.id} onClick={() => onSelect(p.id)} style={{
              border: isSel ? `2px solid ${T.ink}` : `1px solid ${T.line}`,
              borderRadius: 14, padding: "16px 14px", background: isSel ? T.ink : "#fff",
              cursor: "pointer", textAlign: "left" as const, position: "relative",
              boxShadow: isSel ? "0 4px 18px rgba(10,14,20,0.16)" : "none",
              transition: "all .15s",
            }}>
              {p.badge && (
                <div style={{ position: "absolute", top: -10, left: "50%", transform: "translateX(-50%)", background: T.six, color: "#fff", fontFamily: "ui-monospace,monospace", fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" as const, padding: "3px 9px", borderRadius: 99, whiteSpace: "nowrap" as const }}>
                  {p.badge}
                </div>
              )}
              <p style={{ fontFamily: "system-ui,sans-serif", fontSize: 13, fontWeight: 700, color: isSel ? "#fff" : T.ink, margin: "0 0 4px" }}>{p.name}</p>
              <p style={{ fontFamily: "system-ui,sans-serif", fontSize: 22, fontWeight: 800, color: isSel ? T.six : T.ink, margin: "0 0 8px", letterSpacing: -0.8 }}>€{p.price}</p>
              {p.savings && <p style={{ fontFamily: "ui-monospace,monospace", fontSize: 10, color: isSel ? "rgba(255,255,255,.6)" : T.em2, margin: "0 0 8px", fontWeight: 600 }}>{p.savings}</p>}
              <p style={{ fontFamily: "system-ui,sans-serif", fontSize: 11, color: isSel ? "rgba(255,255,255,.65)" : T.muted, margin: 0, lineHeight: 1.5 }}>
                {p.edits > 0 ? <><strong style={{ color: isSel ? "#fff" : T.ink }}>{p.edits} free edits</strong><br/></> : "No free edits\n"}
                {p.editNote}
              </p>
            </button>
          );
        })}
      </div>

      {/* Features of selected plan */}
      <div style={{ background: T.bg2, border: `1px solid ${T.line}`, borderRadius: 12, padding: "14px 16px", marginBottom: 20 }}>
        <p style={{ fontFamily: "ui-monospace,monospace", fontSize: 10, color: T.muted, letterSpacing: "0.12em", textTransform: "uppercase" as const, margin: "0 0 10px" }}>
          {plan.name} plan includes
        </p>
        {plan.features.map(f => (
          <div key={f} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
            <svg width="12" height="12" viewBox="0 0 10 10"><path d="M2 5l2 2 4-4" stroke={T.em2} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
            <span style={{ fontFamily: "system-ui,sans-serif", fontSize: 13, color: T.ink }}>{f}</span>
          </div>
        ))}
      </div>

      {/* Generate button */}
      {loading && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <p style={{ fontSize: 13, color: T.muted, margin: 0 }}>{stageMsg}</p>
            <div style={{ display: "flex", alignItems: "baseline", gap: 3 }}>
              <span style={{ fontSize: "1.8rem", fontWeight: 700, color: T.six }}>{countdown}</span>
              <span style={{ fontSize: 12, color: T.muted }}>s</span>
            </div>
          </div>
          <div style={{ height: 4, background: T.line, borderRadius: 99, overflow: "hidden" }}>
            <div style={{ height: "100%", borderRadius: 99, background: `linear-gradient(90deg,${T.six},#FF8A4C)`, width: `${100 - countdown}%`, transition: "width 1s linear" }}/>
          </div>
        </div>
      )}

      <button
        onClick={onGenerate}
        disabled={loading}
        style={{ width: "100%", height: 54, borderRadius: 12, border: "none", background: loading ? "#E2E2E5" : T.ink, color: loading ? "#A0A0A8" : "#fff", fontFamily: "system-ui,sans-serif", fontSize: 15, fontWeight: 700, cursor: loading ? "default" : "pointer", letterSpacing: -0.2, boxShadow: loading ? "none" : "0 4px 16px rgba(10,14,20,0.16)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
      >
        {loading
          ? <><span style={{ width: 16, height: 16, borderRadius: 8, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", animation: "spin 0.8s linear infinite", display: "inline-block" }}/> Generating your website…</>
          : `Generate with ${plan.name} Plan →`
        }
      </button>
      <p style={{ fontSize: 11, color: T.muted, textAlign: "center", marginTop: 8 }}>Free during beta · €{plan.price} one-time when billing activates · Custom domain separate</p>

      <button onClick={onBack} style={{ display: "block", margin: "14px auto 0", background: "none", border: "none", cursor: "pointer", fontFamily: "system-ui,sans-serif", fontSize: 13, color: T.muted }}>
        ← Back to review
      </button>
    </div>
  );
}

// ─── Vercel Auth Step ─────────────────────────────────────────────────────────

function VercelAuthStep({
  onSaved,
  onBack,
}: {
  onSaved: () => void;
  onBack: () => void;
}) {
  const [token, setToken] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const handleSave = async () => {
    const t = token.trim();
    if (!t) { setErr("Please paste your Vercel token."); return; }
    setSaving(true); setErr("");
    try {
      const res = await fetch("/api/auth/vercel/save-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: t }),
      });
      const d = await res.json();
      if (!res.ok) { setErr(d.error || "Failed to save token."); return; }
      onSaved();
    } catch { setErr("Network error. Please try again."); }
    finally { setSaving(false); }
  };

  const T = { ink: "#0A0E14", six: "#FF5A1F", em: "#00B377", emSoft: "#E5F7EE", em2: "#009062", line: "#E2E2DE", muted: "#6B7180", bg2: "#F2F2EF" };

  return (
    <div>
      {/* Steps card */}
      <div style={{ background: T.bg2, border: `1px solid ${T.line}`, borderRadius: 14, padding: "20px 22px", marginBottom: 20 }}>
        <p style={{ fontFamily: "ui-monospace,monospace", fontSize: 10, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: T.muted, marginBottom: 14 }}>
          One-time setup · 30 seconds
        </p>
        {[
          ["01", "Open", <a key="l" href="https://vercel.com/account/tokens" target="_blank" rel="noopener noreferrer" style={{ color: T.six, textDecoration: "none", fontWeight: 600 }}>vercel.com/account/tokens ↗</a>],
          ["02", "Click", <span key="b"><strong>Create</strong> → name it &quot;insixlive&quot; → set <strong>No expiration</strong></span>],
          ["03", "Copy", <span key="c">the token that appears (starts with <code style={{ fontFamily: "ui-monospace,monospace", background: T.line, padding: "1px 5px", borderRadius: 4 }}>vercel_</code>)</span>],
          ["04", "Paste", "it in the field below"],
        ].map(([n, label, detail]) => (
          <div key={n as string} style={{ display: "flex", gap: 12, marginBottom: 10 }}>
            <span style={{ fontFamily: "ui-monospace,monospace", fontSize: 10, color: T.muted, minWidth: 20, paddingTop: 2, flexShrink: 0 }}>{n}</span>
            <div style={{ fontSize: 13, color: T.ink, lineHeight: 1.55 }}>
              <strong>{label}</strong> {detail}
            </div>
          </div>
        ))}
      </div>

      {/* Token input */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontFamily: "ui-monospace,monospace", fontSize: 10, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: T.muted, display: "block", marginBottom: 8 }}>
          Vercel Token
        </label>
        <input
          type="password"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="vercel_xxxxxxxxxxxxxxxxxxxx"
          style={{
            width: "100%", border: token ? `1.5px solid ${T.ink}` : `1px solid ${T.line}`,
            borderRadius: 12, padding: "12px 16px", background: "#fff",
            fontFamily: "ui-monospace,monospace", fontSize: 14, color: T.ink,
            outline: "none", boxShadow: token ? `0 0 0 4px rgba(10,14,20,0.05)` : "none",
          }}
          onKeyDown={(e) => { if (e.key === "Enter") handleSave(); }}
        />
      </div>

      {err && (
        <div style={{ marginBottom: 14, padding: "10px 14px", borderRadius: 10, background: "#FFF0EE", border: "1px solid rgba(255,90,31,0.2)", fontSize: 13, color: "#C43600" }}>
          {err}
        </div>
      )}

      {/* Security note */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 18, padding: "10px 14px", background: T.emSoft, border: `1px solid rgba(0,179,119,0.2)`, borderRadius: 10 }}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, marginTop: 1 }}><path d="M2 6V4a5 5 0 0110 0v2M2 6h10v6H2V6z" stroke={T.em2} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
        <p style={{ fontSize: 12, color: T.em2, margin: 0, lineHeight: 1.6 }}>
          We only use this token to deploy websites you create here. It is encrypted at rest and never shared.
        </p>
      </div>

      <button
        type="button"
        onClick={handleSave}
        disabled={saving || !token.trim()}
        style={{
          width: "100%", height: 52, borderRadius: 12, border: "none",
          background: saving || !token.trim() ? "#E2E2E5" : T.ink,
          color: saving || !token.trim() ? "#A0A0A8" : "#fff",
          fontFamily: "var(--font)", fontSize: 15, fontWeight: 600, cursor: saving || !token.trim() ? "default" : "pointer",
          boxShadow: saving || !token.trim() ? "none" : "0 4px 14px rgba(10,14,20,0.14)",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        }}
      >
        {saving
          ? <><span style={{ width: 14, height: 14, borderRadius: 7, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", animation: "spin 0.8s linear infinite", display: "inline-block" }}/> Saving…</>
          : "Save & Continue →"
        }
      </button>

      <button
        type="button"
        onClick={onBack}
        style={{
          marginTop: 16,
          width: "100%",
          background: "none",
          border: "none",
          color: "#6B7180",
          fontSize: 13,
          cursor: "pointer",
          padding: "8px 0",
        }}
      >
        ← Back to review
      </button>
    </div>
  );
}

// ─── Payment Step ─────────────────────────────────────────────────────────────

function PaymentStepInner({
  formData,
  onSuccess,
  onBack,
}: {
  formData: WizardData;
  onSuccess: (paymentIntentId: string) => void;
  onBack: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");

  const handlePay = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setPaying(true);
    setError("");

    // Save formData for 3DS redirect recovery — images stripped to avoid QuotaExceededError
    try { localStorage.setItem("wizard_data", JSON.stringify({ ...formData, logo: { ...formData.logo, dataUrl: "" } })); } catch {}

    const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
      confirmParams: {
        return_url: `${window.location.origin}/generate/complete`,
      },
    });

    if (stripeError) {
      setError(stripeError.message ?? "Payment failed.");
      setPaying(false);
      return;
    }

    if (paymentIntent?.status === "succeeded") {
      onSuccess(paymentIntent.id);
    } else {
      setError("Payment could not be confirmed. Please try again.");
      setPaying(false);
    }
  };

  const pages = formData.pages.selected.length;
  const styleName =
    formData.design.style.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div>
      {/* Summary card */}
      <div
        style={{
          background: "rgba(99,102,241,0.06)",
          border: "1px solid rgba(99,102,241,0.2)",
          borderRadius: 16,
          padding: "20px 24px",
          marginBottom: 24,
        }}
      >
        <p
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "#6B7180",
            marginBottom: 14,
          }}
        >
          Your website summary
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "10px 24px",
          }}
        >
          {[
            ["Business", formData.business.name],
            ["Type", formData.business.type],
            ["Style", styleName],
            ["Pages", `${pages} page${pages !== 1 ? "s" : ""}`],
            ["Primary colour", formData.design.primaryColor],
            ["Dark mode", formData.design.darkMode ? "Yes" : "No"],
          ].map(([label, value]) => (
            <div key={label}>
              <p style={{ fontSize: 11, color: "#6B7180", marginBottom: 2 }}>{label}</p>
              <p
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                {label === "Primary colour" ? (
                  <>
                    <span
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: "50%",
                        background: value,
                        border: "1px solid rgba(255,255,255,0.2)",
                        flexShrink: 0,
                      }}
                    />
                    {value}
                  </>
                ) : (
                  value
                )}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Price */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 20px",
          background: "#f9fafb",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 12,
          marginBottom: 24,
        }}
      >
        <div>
          <p style={{ fontWeight: 600, fontSize: 14 }}>Professional Website</p>
          <p style={{ fontSize: 12, color: "#6B7180", marginTop: 2 }}>
            One-time · Deployed to Vercel · Code on GitHub
          </p>
        </div>
        <div style={{ textAlign: "right" }}>
          <p
            style={{
              fontWeight: 700,
              fontSize: "1.6rem",
              letterSpacing: "-0.03em",
            }}
          >
            €49.99
          </p>
          <p style={{ fontSize: 11, color: "#6B7180" }}>one-time</p>
        </div>
      </div>

      {/* Stripe form */}
      <form onSubmit={handlePay}>
        <div
          style={{
            background: "#f9fafb",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 12,
            padding: "20px",
            marginBottom: 16,
          }}
        >
          <PaymentElement
            options={{
              layout: "tabs",
              fields: { billingDetails: { name: "auto" } },
            }}
          />
        </div>

        {error && (
          <div
            style={{
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.2)",
              borderRadius: 10,
              padding: "12px 16px",
              color: "#fca5a5",
              fontSize: 13,
              marginBottom: 16,
            }}
          >
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={paying || !stripe}
          className="btn-primary w-full rounded-xl py-4"
          style={{ fontSize: 15, fontWeight: 600 }}
        >
          {paying ? (
            <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <span
                style={{
                  width: 14,
                  height: 14,
                  border: "2px solid rgba(255,255,255,0.3)",
                  borderTopColor: "#fff",
                  borderRadius: "50%",
                  animation: "spin 0.8s linear infinite",
                  display: "inline-block",
                }}
              />
              Processing payment…
            </span>
          ) : (
            "Pay €49.99 & Generate Website"
          )}
        </button>

        <p
          style={{
            fontSize: 11,
            color: "#6B7180",
            textAlign: "center",
            marginTop: 10,
          }}
        >
          Powered by Stripe · SSL encrypted · No monthly fees
        </p>
      </form>

      <button
        type="button"
        onClick={onBack}
        style={{
          marginTop: 16,
          width: "100%",
          background: "none",
          border: "none",
          color: "#6B7180",
          fontSize: 13,
          cursor: "pointer",
          padding: "8px 0",
        }}
      >
        ← Back to review
      </button>
    </div>
  );
}

// ─── Main Wizard ──────────────────────────────────────────────────────────────

const STEP_TITLES = [
  { title: "Choose a starting template",          sub: "Pick an industry template or skip to customize everything from scratch" },
  { title: "Tell us about your business",         sub: "Name, contact details, location, and opening hours" },
  { title: "Goals & audience",                    sub: "What your website needs to accomplish and who it's for" },
  { title: "Services & pricing",                  sub: "What you offer and how you want pricing displayed" },
  { title: "Design aesthetic",                    sub: "Visual style, personality, colors, and mood" },
  { title: "Typography & imagery",                sub: "Fonts, photos, and your logo" },
  { title: "Pages & finishing touches",           sub: "Page structure, CTA, tone, and anything extra to tell the AI" },
  { title: "Review and generate",                 sub: "Everything looks good? Let's build your website" },
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
  const [clientSecret, setClientSecret] = useState("");
  const [selectedTier, setSelectedTier] = useState<"website" | "website_5">("website_5");
  const [vercelAuthorized, setVercelAuthorized] = useState<boolean | null>(null);

  // Check Vercel auth status once on mount
  useEffect(() => {
    fetch("/api/auth/me")
      .then(r => r.json())
      .then(d => setVercelAuthorized(d.user?.vercelAuthorized ?? false))
      .catch(() => setVercelAuthorized(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Restore wizard progress — deep-merge with DEFAULT so new fields from
  // schema updates are always present even when older data is in localStorage.
  useEffect(() => {
    const saved = localStorage.getItem("wizard_data");
    if (!saved) return;
    try {
      const p = JSON.parse(saved) as Partial<WizardData>;
      setData({
        ...DEFAULT,
        ...p,

        schedule:   { ...DEFAULT.schedule,   ...p.schedule, hours: { ...DEFAULT_HOURS, ...(p.schedule?.hours ?? {}) } },
        goals:      { ...DEFAULT.goals,      ...p.goals },
        services:   { ...DEFAULT.services,   ...p.services },
        design:     { ...DEFAULT.design,     ...p.design },
        typography: { ...DEFAULT.typography, ...p.typography },
        team:       { ...DEFAULT.team,       ...p.team },
        pages:      { ...DEFAULT.pages,      ...p.pages, pageDescriptions: p.pages?.pageDescriptions ?? {} },
        logo:       { ...DEFAULT.logo,       ...p.logo },
        useEmojis:       p.useEmojis ?? false,
        websiteLanguage: p.websiteLanguage ?? "English",
        business: { ...DEFAULT.business, ...p.business, locationCity: p.business?.locationCity ?? "", locationCountry: p.business?.locationCountry ?? "" },
      });
    } catch {
      localStorage.removeItem("wizard_data");
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Save wizard progress — strip base64 images to avoid QuotaExceededError.
  // Images are kept in React state and sent directly to the API on submit.
  useEffect(() => {
    try {
      const stripped: WizardData = {
        ...data,
        logo: { ...data.logo, dataUrl: "" },
        team: { ...data.team, members: data.team.members.map(m => ({ ...m, photo: "" })) },
        pages: {
          ...data.pages,
          pageDescriptions: Object.fromEntries(
            Object.entries(data.pages.pageDescriptions).map(([k, v]) => [k, { ...v, image: "" }])
          ),
        },
      };
      localStorage.setItem("wizard_data", JSON.stringify(stripped));
    } catch { /* QuotaExceededError — silently skip */ }
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

  const step2Valid =
    data.business.name.trim().length > 0 &&
    data.business.description.trim().length >= 20 &&
    (!data.business.hasLocation || data.business.location.trim().length > 0) &&
    (!data.business.hasPhone    || data.business.phone.trim().length > 0);

  const canNext = () => {
    if (step === 2) return step2Valid;
    return true;
  };

  const next = () => { if (canNext()) setStep(s => Math.min(s + 1, 8)); };
  const back = () => setStep(s => Math.max(s - 1, 1));

  // Go to pricing step (step 9) before generating
  const handleGoToPayment = () => {
    setStep(9);
  };

  const applyTemplate = (id: string, mapTo: TemplateMapTo) => {
    setData(p => ({
      ...p,
      templateId: id,
      ...(id ? {
        business: { ...p.business, type: mapTo.businessType },
        design: { ...p.design, style: mapTo.style, primaryColor: mapTo.primaryColor, secondaryColor: mapTo.secondaryColor, darkMode: mapTo.darkMode },
        typography: { ...p.typography, fontFamily: mapTo.fontFamily },
      } : {}),
    }));
  };

  const handleSubmit = async (paymentIntentId?: string, tier?: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/generate-site", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formData: data, paymentIntentId, tier: tier ?? selectedTier }),
      });
      if (!res.ok) {
        let errMsg = `Server error ${res.status}`;
        try {
          const err = await res.json();
          errMsg = err.error || errMsg;
        } catch {
          errMsg = await res.text().catch(() => errMsg);
        }
        throw new Error(errMsg);
      }
      const result = await res.json();
      localStorage.removeItem("wizard_data");
      router.push(`/success/${result.siteId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  const stepEntry =
    step <= 8
      ? STEP_TITLES[step - 1]
      : step === 9
      ? { title: "Choose your plan", sub: "Select the plan that fits your business — all plans free during beta" }
      : { title: "Complete payment", sub: "Secure checkout — then we generate and deploy your website instantly" };
  const { title, sub } = stepEntry;

  return (
    <div style={{ background: "#FAFAFA", minHeight: "100vh", color: "#0A0E14" }}>
      {/* Nav */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, background: "rgba(250,250,248,.94)", backdropFilter: "blur(14px)", borderBottom: "1px solid #E2E2DE", height: 58 }}>
        <div style={{ maxWidth: 680, margin: "0 auto", padding: "0 24px", height: "100%", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
            <div style={{ width: 24, height: 24, borderRadius: 7, background: "#0A0E14", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontFamily: "system-ui", fontSize: 14, fontWeight: 800, color: "#FF5A1F", lineHeight: 1 }}>6</span>
            </div>
            <span style={{ fontWeight: 700, fontSize: 15, color: "#0A0E14", letterSpacing: -0.4 }}>in<span style={{ color: "#FF5A1F" }}>six</span>live</span>
          </Link>
          <Link href="/dashboard" style={{ fontSize: 13, color: "#6B7180", textDecoration: "none" }}>Dashboard</Link>
        </div>
      </nav>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "100px 24px 80px" }}>
        {/* Progress */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: "#6B7180" }}>
              {step <= 8 ? `Step ${step} of 8` : step === 9 ? "Choose plan" : "Payment"}
            </span>
            <span style={{ fontSize: 12, color: "#6B7180" }}>
              {step <= 8 ? `${Math.round((step / 8) * 100)}%` : "100%"}
            </span>
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            {STEP_TITLES.map((_, i) => (
              <div key={i} style={{
                flex: 1, height: 3, borderRadius: 99, transition: "background 0.4s",
                background: i < Math.min(step, 8) ? "linear-gradient(90deg,var(--accent),var(--accent2))" : "var(--border)",
              }} />
            ))}
          </div>
        </div>

        {/* Step header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: "1.7rem", fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 6 }}>{title}</h1>
          <p style={{ fontSize: 14, color: "#374151", margin: 0 }}>{sub}</p>
        </div>

        {/* Error */}
        {error && (
          <div style={{ marginBottom: 20, fontSize: 13, padding: "12px 16px", borderRadius: 12,
            background: "#FFF0EE", border: "1px solid rgba(255,90,31,0.2)", color: "#C43600",
            display: "flex", gap: 10, alignItems: "flex-start" }}>
            <svg width="14" height="14" viewBox="0 0 15 15" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
              <circle cx="7.5" cy="7.5" r="6.5" stroke="#C43600" strokeWidth="1.5"/>
              <path d="M7.5 4.5v4M7.5 10v.5" stroke="#C43600" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            {error}
          </div>
        )}

        {/* Steps */}
        <div key={step} className="fade-up">
          {step === 1 && <StepTemplate selectedId={data.templateId} onSelect={applyTemplate} />}
          {step === 2 && <Step2Business data={data.business} schedule={data.schedule} onChange={(d: WizardData["business"]) => setData(p => ({ ...p, business: d }))} onScheduleChange={(s: WizardData["schedule"]) => setData(p => ({ ...p, schedule: s }))} />}
          {step === 3 && <StepGoals data={data.goals} onChange={(d: WizardData["goals"]) => setData(p => ({ ...p, goals: d }))} />}
          {step === 4 && <StepServices data={data.services} onChange={(d: WizardData["services"]) => setData(p => ({ ...p, services: d }))} />}
          {step === 5 && <Step3Design data={data.design} onChange={(d: WizardData["design"]) => setData(p => ({ ...p, design: d }))} />}
          {step === 6 && (
            <Step4Typography
              data={data.typography}
              onChange={(d: WizardData["typography"]) => setData(p => ({ ...p, typography: d }))}
              logo={data.logo}
              onLogoChange={(d: WizardData["logo"]) => setData(p => ({ ...p, logo: d }))}
            />
          )}
          {step === 7 && <Step5Pages data={data.pages} team={data.team} useEmojis={data.useEmojis} websiteLanguage={data.websiteLanguage} onChange={(d: WizardData["pages"]) => setData(p => ({ ...p, pages: d }))} onTeamChange={(t: WizardData["team"]) => setData(p => ({ ...p, team: t }))} onEmojisChange={(v: boolean) => setData(p => ({ ...p, useEmojis: v }))} onLanguageChange={(lang: string) => setData(p => ({ ...p, websiteLanguage: lang }))} />}
          {step === 8 && (
            <Step7Review
              data={data}
              onEdit={(s: number) => setStep(s)}
              onSubmit={handleGoToPayment}
              loading={loading}
              countdown={countdown}
              stageMsg={stageMsg}
              vercelAuthorized={vercelAuthorized}
            />
          )}
          {/* Step 9 — Pricing plan selection */}
          {step === 9 && (
            <PricingStep
              selected={selectedTier}
              onSelect={setSelectedTier}
              onGenerate={() => handleSubmit(undefined, selectedTier)}
              onBack={() => setStep(8)}
              loading={loading}
              stageMsg={stageMsg}
              countdown={countdown}
            />
          )}

          {/* Step 10 — Payment */}
          {step === 10 && clientSecret && (
            <Elements
              stripe={stripePromise}
              options={{
                clientSecret,
                appearance: {
                  theme: "night",
                  variables: {
                    colorPrimary: "#6366f1",
                    colorBackground: "#0d0d1a",
                    colorText: "#ffffff",
                    colorTextSecondary: "rgba(255,255,255,0.55)",
                    borderRadius: "10px",
                    fontFamily: "system-ui, sans-serif",
                  },
                },
              }}
            >
              <PaymentStepInner
                formData={data}
                onBack={() => { setStep(9); setClientSecret(""); }}
                onSuccess={(piId) => handleSubmit(piId)}
              />
            </Elements>
          )}
        </div>

        {/* Nav buttons (steps 1–7 only) */}
        {step < 8 && (
          <div style={{ display: "flex", gap: 12, marginTop: 32 }}>
            {step > 1 && (
              <button type="button" onClick={back} className="btn-ghost rounded-xl py-3.5 flex-1 text-sm" style={{ fontWeight: 600 }}>
                Back
              </button>
            )}
            <button type="button" onClick={next} disabled={!canNext()} className="btn-primary rounded-xl py-3.5 text-sm"
              style={{ flex: step > 1 ? 2 : 1, fontSize: 15 }}>
              {step === 7 ? "Review my choices" : step === 1 ? (data.templateId ? "Continue with template" : "Skip — customize from scratch") : "Continue"}
            </button>
          </div>
        )}

        {step < 8 && (
          <p style={{ fontSize: 11, color: "#6B7180", textAlign: "center", marginTop: 12 }}>
            Your answers are saved automatically.
          </p>
        )}
      </div>
    </div>
  );
}
