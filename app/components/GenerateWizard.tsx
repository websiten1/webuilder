"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { TemplateGallery } from "@/app/components/TemplateGallery";

// ─── Types ───────────────────────────────────────────────────────────────────

export type DayHours = { open: string; close: string; closed: boolean };
export type TeamMember = { name: string; role: string; bio: string; photo: string; fileName: string };
export type PageDesc = { description: string; aiRephrase: boolean; image: string; imageName: string };

export type GalleryMember = { name: string; role: string; photo: string };
export type Socials = { instagram?: string; facebook?: string; tiktok?: string; youtube?: string; linkedin?: string; whatsapp?: string };

export type ServiceItem = { name: string; description: string; price: string; callForPrice: boolean };

export type WizardData = {
  templateId: string;
  lang: "ro" | "en";
  business: {
    name: string; type: string; description: string;
    aboutText: string; aboutAiRephrase: boolean;
    hasLocation: boolean; location: string; locationCity: string; locationCountry: string;
    mapsLink: string; serviceArea: string;
    email: string; hasPhone: boolean; phone: string;
    openingHours: string; ownerName: string; experience: string;
  };
  schedule: { type: "no-schedule" | "online" | "always-open" | "custom"; hours: { [day: string]: DayHours } };
  goals: { mainGoal: string; visitorFeel: string; problemSolved: string; whyChoose: string; idealCustomer: string };
  services: {
    offersType: string;
    list: string[];
    serviceItems: ServiceItem[];
    priceVisibility: string;
    quoteContacts: { phone: string; email: string; instagram: string; facebook: string; whatsapp: string };
  };
  design: { style: string; primaryColor: string; secondaryColor: string; darkMode: boolean; personalityLevel: string; backgroundStyle: string; animations: string };
  typography: { fontFamily: string; imageryStyle: string; heroPreference: string };
  team: { enabled: boolean; members: TeamMember[] };
  gallery: string[];
  galleryMembers: GalleryMember[];
  socials: Socials;
  pages: { selected: string[]; primaryCTA: string; contentTone: string; specialFeatures: string[]; calendarModuleEnabled: boolean; additionalNotes: string; pageDescriptions: { [id: string]: PageDesc } };
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
  lang: "ro",
  business: { name: "", type: "", description: "", aboutText: "", aboutAiRephrase: true, hasLocation: true, location: "", locationCity: "", locationCountry: "", mapsLink: "", serviceArea: "", email: "", hasPhone: true, phone: "", openingHours: "", ownerName: "", experience: "" },
  schedule: { type: "no-schedule", hours: DEFAULT_HOURS },
  goals: { mainGoal: "", visitorFeel: "", problemSolved: "", whyChoose: "", idealCustomer: "" },
  services: { offersType: "", list: [], serviceItems: [], priceVisibility: "", quoteContacts: { phone: "", email: "", instagram: "", facebook: "", whatsapp: "" } },
  design: { style: "minimalist", primaryColor: "#FF5A1F", secondaryColor: "#0e1a2b", darkMode: false, personalityLevel: "balanced", backgroundStyle: "ai-decide", animations: "moderate" },
  typography: { fontFamily: "modern-sans", imageryStyle: "no-images", heroPreference: "ai-decide" },
  team: { enabled: false, members: [] },
  gallery: [],
  galleryMembers: [],
  socials: {},
  pages: { selected: ["home","services","about","contact"], primaryCTA: "phone", contentTone: "professional-approachable", specialFeatures: [], calendarModuleEnabled: false, additionalNotes: "", pageDescriptions: {} },
  useEmojis: false,
  websiteLanguage: "Română",
  logo: { uploaded: false, dataUrl: "", fileName: "" },
};

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
  { id: "no-images",    name: "No images",             desc: "Text and colours only — clean, professional look" },
  { id: "own-images",   name: "I will add my own images", desc: "Upload your photos in the gallery section later in this form" },
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
  { id: "leads",       name: "Generate leads",              desc: "B2B inquiries & quote requests" },
  { id: "present",     name: "Present services",            desc: "Showcase what you offer" },
  { id: "credibility", name: "Build credibility",           desc: "Establish authority & trust" },
  { id: "portfolio",   name: "Show portfolio / gallery",    desc: "Display your creative work" },
  { id: "info",        name: "Share information",           desc: "Nonprofit, education, community" },
];
const VISITOR_FEELS = ["Trust","Excitement","Calm","Luxury","Safety","Professionalism","Warmth","Innovation","Creativity","Fun"];

const OFFERS_TYPES = [
  { id: "services",  name: "Services",                desc: "I provide services to clients" },
  { id: "products",  name: "Physical products (in-person)", desc: "I sell physical products — not through this website" },
  { id: "info",      name: "Information / Portfolio", desc: "No direct sales — just showcasing" },
];
const PRICE_VISIBILITY = [
  { id: "exact",    label: "Show exact prices" },
  { id: "quote",    label: "Request a quote" },
  { id: "hide",     label: "Hide prices" },
];

const CORE_PAGES = [
  { id: "home",     label: "Home",     desc: "Always included", required: true },
  { id: "services", label: "Services", desc: "What you offer",  required: false },
  { id: "about",    label: "About Us", desc: "Your story",      required: false },
  { id: "contact",  label: "Contact",  desc: "Get in touch",    required: false },
];
const EXTRA_PAGES = [
  { id: "portfolio",    label: "Portfolio/Gallery", desc: "Showcase your work" },
  { id: "pricing",      label: "Pricing/Plans",     desc: "Service pricing" },
  { id: "team",         label: "Team/Staff",        desc: "Meet the team" },
  { id: "faq",          label: "FAQ/Help",          desc: "Common questions" },
  { id: "blog",         label: "Blog/News",         desc: "Articles & updates" },
  { id: "testimonials", label: "Testimonials",      desc: "Customer reviews" },
  { id: "privacy",      label: "Privacy Policy",    desc: "Legal page" },
  { id: "terms",        label: "Terms of Service",  desc: "Legal page" },
  { id: "booking",      label: "Booking",           desc: "Appointments" },
];

const CTA_OPTIONS = [
  { id: "phone", label: "Phone call" },
  { id: "email", label: "Email" },
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

// ─── i18n ────────────────────────────────────────────────────────────────────

type Lang = "ro" | "en";
const tr = (lang: Lang, ro: string, en: string) => lang === "ro" ? ro : en;

const STEP_NAMES = {
  ro: ["Șablon","Stil vizual","Culori","Tip. & imagini","Afacerea ta","Obiective","Servicii","Pagini","Galerie & social","Detalii finale","Verificare"],
  en: ["Template","Design","Colours","Type & imagery","Business","Goals","Services","Pages","Gallery & social","Finishing","Review"],
};
const STEP_GROUPS = {
  ro: [{ label: "Aspect & stil", steps: [0,1,2,3] }, { label: "Conținutul tău", steps: [4,5,6,7,8,9] }, { label: "Lansare", steps: [10] }],
  en: [{ label: "Look & feel",   steps: [0,1,2,3] }, { label: "Your content",    steps: [4,5,6,7,8,9] }, { label: "Ship it",   steps: [10] }],
};

// RO overrides for option arrays
const VISUAL_STYLES_RO = [
  { id: "minimalist",   name: "Minimalist",           desc: "Branduri moderne, premium" },
  { id: "modern-clean", name: "Modern & Curat",        desc: "Tech, servicii" },
  { id: "bold-dark",    name: "Îndrăzneț & Întunecat", desc: "Branduri creative, în tendințe" },
  { id: "corporate",    name: "Corporate",             desc: "Juridic, finanțe, consultanță" },
  { id: "creative",     name: "Creativ & Vibrant",     desc: "Design, agenții de marketing" },
  { id: "elegant",      name: "Elegant & Lux",         desc: "Modă, bijuterii, high-end" },
  { id: "warm",         name: "Cald & Prietenos",      desc: "Sănătate, frumusețe, comunitate" },
  { id: "futuristic",   name: "High Tech",             desc: "Tech, SaaS, startup-uri" },
  { id: "playful",      name: "Jucăuș & Distractiv",  desc: "Copii, lifestyle, divertisment" },
];
const PERSONALITY_LEVELS_RO = [
  { id: "minimal",   name: "Foarte simplu",         desc: "Conținutul pe primul loc, decor minim" },
  { id: "balanced",  name: "Echilibrat",             desc: "Profesional, cu personalitate" },
  { id: "strong",    name: "Personalitate puternică",desc: "Îndrăzneț, memorabil, distinctiv" },
  { id: "ai-decide", name: "Lasă AI să decidă",      desc: "Cea mai bună potrivire pentru stilul tău" },
];
const BACKGROUND_STYLES_RO = [
  { id: "white",     label: "Alb / Luminos" }, { id: "cream", label: "Crem / Cald" },
  { id: "dark",      label: "Întunecat" },     { id: "gradient", label: "Gradient" },
  { id: "photo",     label: "Fundal foto" },   { id: "ai-decide", label: "AI decide" },
];
const ANIMATION_OPTS_RO = [
  { id: "minimal",   name: "Minimal",     desc: "Încărcare rapidă, fără animații" },
  { id: "moderate",  name: "Moderat",     desc: "Tranziții fine, profesionale" },
  { id: "rich",      name: "Bogat",       desc: "Interacțiuni captivante, moderne" },
  { id: "ai-decide", name: "AI decide",   desc: "Cel mai potrivit pentru stilul tău" },
];
const FONTS_RO = [
  { id: "modern-sans",     name: "Sans Modern",      desc: "Tech, servicii moderne" },
  { id: "classic-serif",   name: "Serif Clasic",     desc: "Juridic, finanțe, editorial" },
  { id: "geo-bold",        name: "Geometric Bold",   desc: "Creativ, design, startup-uri" },
  { id: "mono",            name: "Monospace",         desc: "Tech, orientat developeri" },
  { id: "playful",         name: "Rotunjit & Jucăuș",desc: "Copii, lifestyle, comunitate" },
  { id: "humanist-sans",   name: "Sans Umanist",     desc: "Wellness, frumusețe, lifestyle" },
  { id: "luxury-serif",    name: "Serif de Lux",     desc: "Modă, fine dining" },
  { id: "editorial-serif", name: "Serif Editorial",  desc: "Publicații, restaurante" },
  { id: "space-grotesk",   name: "Space Grotesk",    desc: "Tech, Web3, studiouri" },
];
const IMAGERY_STYLES_RO = [
  { id: "no-images",  name: "Fără imagini",           desc: "Doar text și culori — aspect curat, profesional" },
  { id: "own-images", name: "Voi adăuga propriile imagini", desc: "Încarcă fotografiile în secțiunea galerie mai târziu în formular" },
];
const BIZ_TYPES_RO = ["","Sănătate","Fitness & Wellness","Educație","Mâncare & Băutură","Restaurant / Cafenea","Frumusețe & Saloane","Juridic","Imobiliare","Auto","Comerț / Magazin","Creativ / Agenție","Media","Tehnologie / SaaS","Servicii profesionale","ONG","Altceva"];
const BIZ_TYPES_EN = ["","Restaurant","Hair Salon","Photography","Dental Clinic","Consulting","E-commerce","Real Estate","Fitness","Law Firm","Architecture","Plumbing","Accounting","Marketing Agency","Medical Clinic","Tech Startup","Beauty/Spa","Other"];
const SCHEDULE_TYPES_RO = [
  { id: "no-schedule", label: "Fără program fix",     desc: "Nu am un program" },
  { id: "online",      label: "Complet online",        desc: "Doar online — fără ore fizice" },
  { id: "always-open", label: "Mereu deschis / 24·7", desc: "Acces non-stop" },
  { id: "custom",      label: "Am ore specifice",      desc: "Setează orele pe zile" },
];
const MAIN_GOALS_RO = [
  { id: "calls",       name: "Primește apeluri",           desc: "Generează apeluri direct din pagina principală" },
  { id: "leads",       name: "Generează lead-uri",         desc: "Cereri B2B & solicitări de ofertă" },
  { id: "present",     name: "Prezintă serviciile",        desc: "Arată ce oferi" },
  { id: "credibility", name: "Construiește credibilitate", desc: "Stabilește autoritate & încredere" },
  { id: "portfolio",   name: "Arată portofoliul",          desc: "Expune-ți lucrările creative" },
  { id: "info",        name: "Oferă informații",           desc: "ONG, educație, comunitate" },
];
const VISITOR_FEELS_RO = [
  { id: "Trust", label: "Încredere" }, { id: "Excitement", label: "Entuziasm" }, { id: "Calm", label: "Calm" },
  { id: "Luxury", label: "Lux" }, { id: "Safety", label: "Siguranță" }, { id: "Professionalism", label: "Profesionalism" },
  { id: "Warmth", label: "Căldură" }, { id: "Innovation", label: "Inovație" }, { id: "Creativity", label: "Creativitate" }, { id: "Fun", label: "Distracție" },
];
const OFFERS_TYPES_RO = [
  { id: "services", name: "Servicii",                       desc: "Ofer servicii clienților" },
  { id: "products", name: "Produse fizice (în persoană)",   desc: "Vând produse fizice — nu prin acest site" },
  { id: "info",     name: "Informații / Portofoliu",        desc: "Fără vânzări directe — doar prezentare" },
];
const PRICE_VISIBILITY_RO = [
  { id: "exact", label: "Arată prețuri exacte" },
  { id: "quote", label: "Cere o ofertă" },
  { id: "hide",  label: "Ascunde prețurile" },
];
const EXTRA_PAGES_RO = [
  { id: "portfolio",    label: "Portofoliu / Galerie",  desc: "Prezintă-ți lucrările" },
  { id: "pricing",      label: "Prețuri / Planuri",     desc: "Prețuri servicii" },
  { id: "team",         label: "Echipă / Personal",     desc: "Cunoaște echipa" },
  { id: "faq",          label: "Întrebări frecvente",   desc: "Întrebări comune" },
  { id: "blog",         label: "Blog / Noutăți",        desc: "Articole & actualizări" },
  { id: "testimonials", label: "Testimoniale",          desc: "Recenzii clienți" },
  { id: "privacy",      label: "Confidențialitate",     desc: "Pagină legală" },
  { id: "terms",        label: "Termeni",               desc: "Pagină legală" },
  { id: "booking",      label: "Rezervări",             desc: "Programări" },
];
const CTA_OPTIONS_RO = [
  { id: "phone", label: "Apel telefonic" },
  { id: "email", label: "Email" },
];
const TONE_OPTIONS_RO = [
  { id: "formal",                    label: "Profesional & Formal" },
  { id: "professional-approachable", label: "Profesional & Accesibil" },
  { id: "casual",                    label: "Relaxat & Prietenos" },
  { id: "creative",                  label: "Creativ & Expresiv" },
  { id: "ai-decide",                 label: "Lasă AI să decidă" },
];
const SPECIAL_FEATURES_RO = [
  { id: "testimonials",  label: "Testimoniale clienți" }, { id: "social",   label: "Integrare social media" },
  { id: "newsletter",    label: "Abonare newsletter" },   { id: "search",   label: "Funcție de căutare" },
  { id: "multilang",     label: "Suport multilingv" },    { id: "accessibility", label: "Accesibilitate (WCAG)" },
  { id: "analytics",     label: "Integrare analytics" },
];
const LANGUAGES_RO = ["Română","English","Español","Français","Deutsch","Italiano","Português","Magyar","Українська"];
const CORE_PAGES_RO = [
  { id: "home",     label: "Acasă",             desc: "Inclusă mereu",  required: true },
  { id: "services", label: "Servicii",         desc: "Ce oferi",       required: false },
  { id: "about",    label: "Despre noi",         desc: "Povestea ta",    required: false },
  { id: "contact",  label: "Contact",            desc: "Ia legătura",   required: false },
];

const SOC_NETWORKS = [
  { key: "instagram", label: "Instagram", prefix: "instagram.com/",  ph: "numele_tau" },
  { key: "facebook",  label: "Facebook",  prefix: "facebook.com/",   ph: "afacerea.ta" },
  { key: "tiktok",    label: "TikTok",    prefix: "tiktok.com/@",    ph: "numele_tau" },
  { key: "youtube",   label: "YouTube",   prefix: "youtube.com/@",   ph: "canalul_tau" },
  { key: "linkedin",  label: "LinkedIn",  prefix: "linkedin.com/in/",ph: "profil" },
  { key: "whatsapp",  label: "WhatsApp",  prefix: "+40 ",            ph: "7xx xxx xxx" },
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

const IInstagram = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.7"/><circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.7"/><circle cx="17.2" cy="6.8" r="1.2" fill="currentColor"/></svg>;
const IFacebook  = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M14 8.5V7a1.5 1.5 0 011.5-1.5H17V2.8h-2.4A4 4 0 0010.6 6.8v1.7H8.4v2.9h2.2V21h3.4v-9.6h2.5l.5-2.9H14z" fill="currentColor"/></svg>;
const ITiktok    = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M14.5 3v9.8a3.3 3.3 0 11-3.3-3.3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><path d="M14.5 4.5c.6 2.4 2.3 4 4.7 4.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>;
const IYoutube   = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="2.5" y="5.5" width="19" height="13" rx="4" stroke="currentColor" strokeWidth="1.7"/><path d="M10.2 9.3l5 2.7-5 2.7V9.3z" fill="currentColor"/></svg>;
const ILinkedin  = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.7"/><path d="M7.5 10.2V17M7.5 7.2v.1M11.5 17v-4a2.3 2.3 0 014.6 0v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>;
const IWhatsapp  = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 3.5a8.5 8.5 0 00-7.3 12.8L3.5 20.5l4.4-1.1A8.5 8.5 0 1012 3.5z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/><path d="M9 8.8c0 3.2 3 6.2 6.2 6.2l.9-1.6-2-1.1-.9.8c-.9-.4-1.9-1.4-2.3-2.3l.8-.9-1.1-2L9 8.8z" fill="currentColor"/></svg>;

const SOC_ICON_MAP: Record<string, React.ReactNode> = {
  instagram: <IInstagram/>, facebook: <IFacebook/>, tiktok: <ITiktok/>,
  youtube: <IYoutube/>, linkedin: <ILinkedin/>, whatsapp: <IWhatsapp/>,
};

// ─── Gallery Component ───────────────────────────────────────────────────────

const GALLERY_MAX = 12;

function readPhotoAsDataUrl(file: File, maxDim: number, cb: (src: string) => void, format: "jpeg" | "png" = "jpeg") {
  const url = URL.createObjectURL(file);
  const img = new Image();
  img.onload = () => {
    const k = Math.min(1, maxDim / Math.max(img.width, img.height));
    const w = Math.max(1, Math.round(img.width * k));
    const h = Math.max(1, Math.round(img.height * k));
    const canvas = document.createElement("canvas");
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext("2d")!;
    if (format === "jpeg") {
      // Fill white background for JPEG (no transparency support)
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, w, h);
    }
    ctx.drawImage(img, 0, 0, w, h);
    URL.revokeObjectURL(url);
    cb(format === "png" ? canvas.toDataURL("image/png") : canvas.toDataURL("image/jpeg", 0.82));
  };
  img.onerror = () => URL.revokeObjectURL(url);
  img.src = url;
}

function GalleryGrid({ photos, onChange, lang }: { photos: string[]; onChange: (fn: (p: string[]) => string[]) => void; lang: Lang }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const addFiles = (files: FileList) => {
    Array.from(files).slice(0, GALLERY_MAX - photos.length).forEach(f =>
      readPhotoAsDataUrl(f, 640, src => onChange(prev => prev.length < GALLERY_MAX ? [...prev, src] : prev))
    );
  };
  const del = (i: number) => onChange(prev => prev.filter((_, j) => j !== i));
  return (
    <div>
      <div className="wf-gal-grid">
        {photos.map((src, i) => (
          <div className="wf-gal-item" key={i}>
            <img src={src} alt="" />
            <button type="button" className="wf-gal-del" onClick={() => del(i)} aria-label={tr(lang,"Șterge","Remove")}><IX /></button>
          </div>
        ))}
        {photos.length < GALLERY_MAX && (
          <button type="button" className="wf-gal-add" onClick={() => inputRef.current?.click()}>
            <span className="wf-ga-ico"><IPlus /></span>
            <span className="wf-ga-txt">{tr(lang,"Adaugă poze","Add photos")}</span>
          </button>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/*" multiple style={{ display:"none" }}
        onChange={e => { if (e.target.files) addFiles(e.target.files); e.target.value = ""; }} />
      <div className="wf-note" style={{ marginTop: 8, fontSize: 12, color: "var(--wf-text3)" }}>
        {photos.length}/{GALLERY_MAX} {tr(lang,"poze · JPG, PNG sau WebP — optimizate automat","photos · JPG, PNG or WebP — auto-optimised")}
      </div>
    </div>
  );
}

// ─── Team Editor ─────────────────────────────────────────────────────────────

function TeamMemberRow({ m, onChange, onDelete, lang }: {
  m: GalleryMember; onChange: (p: Partial<GalleryMember>) => void; onDelete: () => void; lang: Lang;
}) {
  const photoRef = useRef<HTMLInputElement>(null);
  return (
    <div className="wf-team-row">
      <button type="button" className={`wf-team-photo${m.photo ? " has" : ""}`}
        onClick={() => photoRef.current?.click()}>
        {m.photo ? <img src={m.photo} alt={m.name} /> : <span className="wf-tp-ico"><IUpload /></span>}
        <span className="wf-tp-hint">{m.photo ? tr(lang,"Schimbă","Change") : tr(lang,"Poză","Photo")}</span>
      </button>
      <input ref={photoRef} type="file" accept="image/*" style={{ display:"none" }}
        onChange={e => { const f = e.target.files?.[0]; if (f) readPhotoAsDataUrl(f, 640, src => onChange({ photo: src })); e.target.value = ""; }} />
      <div className="wf-team-fields">
        <input className="wf-input" value={m.name} placeholder={tr(lang,"ex. Dr. Alina Popescu","e.g. Dr. Jane Smith")}
          onChange={e => onChange({ name: e.target.value })} />
        <input className="wf-input" value={m.role} placeholder={tr(lang,"ex. Medic stomatolog","e.g. Dentist")}
          onChange={e => onChange({ role: e.target.value })} />
      </div>
      <button type="button" className="wf-rep-del" onClick={onDelete}><ITrash /></button>
    </div>
  );
}

function TeamEditor({ members, onChange, lang }: { members: GalleryMember[]; onChange: (v: GalleryMember[]) => void; lang: Lang }) {
  const list = members.length ? members : [{ name: "", role: "", photo: "" }];
  const setMember = (i: number, patch: Partial<GalleryMember>) => onChange(list.map((m, j) => j === i ? { ...m, ...patch } : m));
  const add = () => onChange([...list, { name: "", role: "", photo: "" }]);
  const del = (i: number) => { const next = list.filter((_, j) => j !== i); onChange(next.length ? next : [{ name: "", role: "", photo: "" }]); };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {list.map((m, i) => <TeamMemberRow key={i} m={m} onChange={p => setMember(i, p)} onDelete={() => del(i)} lang={lang} />)}
      <button type="button" className="wf-add-item" onClick={add}><IPlus /> {tr(lang,"Adaugă un membru","Add member")}</button>
    </div>
  );
}

// ─── Social Links ─────────────────────────────────────────────────────────────

function SocialLinksEditor({ socials, onChange, lang }: { socials: Socials; onChange: (v: Socials) => void; lang: Lang }) {
  return (
    <div className="wf-soc-list">
      {SOC_NETWORKS.map(n => {
        const val = (socials as Record<string, string>)[n.key] || "";
        const filled = val.trim().length > 0;
        return (
          <div key={n.key} className={`wf-soc-row${filled ? " on" : ""}`}>
            <span className="wf-soc-ico">{SOC_ICON_MAP[n.key]}</span>
            <span className="wf-soc-name">{n.label}</span>
            <div className="wf-with-prefix" style={{ flex: 1, display: "flex", alignItems: "stretch", background: "var(--wf-surf2)", border: "1px solid var(--wf-border)", borderRadius: "var(--wf-r)", overflow: "hidden" }}>
              <div style={{ padding: "0 10px", background: "var(--wf-surf3)", display: "flex", alignItems: "center", fontSize: 12, fontFamily: "var(--wf-mono)", color: "var(--wf-text3)", borderRight: "1px solid var(--wf-border)", whiteSpace: "nowrap" }}>{n.prefix}</div>
              <input className="wf-input" style={{ border: 0, background: "transparent", borderRadius: 0 }}
                value={val} placeholder={n.ph}
                onChange={e => onChange({ ...socials, [n.key]: e.target.value })} />
            </div>
          </div>
        );
      })}
      <div style={{ fontSize: 12, color: "var(--wf-text3)", marginTop: 8, lineHeight: 1.5 }}>
        {tr(lang,"Completează doar rețelele pe care le folosești — iconițele apar automat pe site.","Only fill in networks you use — icons appear automatically on the site.")}
      </div>
    </div>
  );
}

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

// ─── Country + City Dropdowns ────────────────────────────────────────────────

const COUNTRIES = [
  "Afghanistan","Albania","Algeria","Andorra","Angola","Antigua and Barbuda","Argentina","Armenia","Australia","Austria",
  "Azerbaijan","Bahamas","Bahrain","Bangladesh","Barbados","Belarus","Belgium","Belize","Benin","Bhutan",
  "Bolivia","Bosnia and Herzegovina","Botswana","Brazil","Brunei","Bulgaria","Burkina Faso","Burundi","Cabo Verde","Cambodia",
  "Cameroon","Canada","Central African Republic","Chad","Chile","China","Colombia","Comoros","Congo","Costa Rica",
  "Croatia","Cuba","Cyprus","Czech Republic","Denmark","Djibouti","Dominica","Dominican Republic","Ecuador","Egypt",
  "El Salvador","Equatorial Guinea","Eritrea","Estonia","Eswatini","Ethiopia","Fiji","Finland","France","Gabon",
  "Gambia","Georgia","Germany","Ghana","Greece","Grenada","Guatemala","Guinea","Guinea-Bissau","Guyana",
  "Haiti","Honduras","Hungary","Iceland","India","Indonesia","Iran","Iraq","Ireland","Israel",
  "Italy","Jamaica","Japan","Jordan","Kazakhstan","Kenya","Kiribati","Kuwait","Kyrgyzstan","Laos",
  "Latvia","Lebanon","Lesotho","Liberia","Libya","Liechtenstein","Lithuania","Luxembourg","Madagascar","Malawi",
  "Malaysia","Maldives","Mali","Malta","Marshall Islands","Mauritania","Mauritius","Mexico","Micronesia","Moldova",
  "Monaco","Mongolia","Montenegro","Morocco","Mozambique","Myanmar","Namibia","Nauru","Nepal","Netherlands",
  "New Zealand","Nicaragua","Niger","Nigeria","North Korea","North Macedonia","Norway","Oman","Pakistan","Palau",
  "Panama","Papua New Guinea","Paraguay","Peru","Philippines","Poland","Portugal","Qatar","Romania","Russia",
  "Rwanda","Saint Kitts and Nevis","Saint Lucia","Saint Vincent and the Grenadines","Samoa","San Marino","Sao Tome and Principe",
  "Saudi Arabia","Senegal","Serbia","Seychelles","Sierra Leone","Singapore","Slovakia","Slovenia","Solomon Islands","Somalia",
  "South Africa","South Korea","South Sudan","Spain","Sri Lanka","Sudan","Suriname","Sweden","Switzerland","Syria",
  "Taiwan","Tajikistan","Tanzania","Thailand","Timor-Leste","Togo","Tonga","Trinidad and Tobago","Tunisia","Turkey",
  "Turkmenistan","Tuvalu","Uganda","Ukraine","United Arab Emirates","United Kingdom","United States","Uruguay","Uzbekistan",
  "Vanuatu","Vatican City","Venezuela","Vietnam","Yemen","Zambia","Zimbabwe",
];

// Major cities per country (abbreviated for common countries; others get a text input)
const CITIES_BY_COUNTRY: Record<string, string[]> = {
  "Romania": ["Bucharest","Cluj-Napoca","Timișoara","Iași","Constanța","Craiova","Brașov","Galați","Ploiești","Oradea","Brăila","Arad","Pitești","Sibiu","Bacău","Târgu Mureș","Baia Mare","Buzău","Satu Mare","Râmnicu Vâlcea"],
  "United Kingdom": ["London","Birmingham","Manchester","Glasgow","Leeds","Sheffield","Edinburgh","Liverpool","Bristol","Cardiff","Coventry","Leicester","Bradford","Nottingham","Newcastle","Belfast","Brighton","Hull","Plymouth","Oxford"],
  "United States": ["New York","Los Angeles","Chicago","Houston","Phoenix","Philadelphia","San Antonio","San Diego","Dallas","San Jose","Austin","Jacksonville","Fort Worth","Columbus","Charlotte","Indianapolis","San Francisco","Seattle","Denver","Washington DC"],
  "Germany": ["Berlin","Hamburg","Munich","Cologne","Frankfurt","Stuttgart","Düsseldorf","Dortmund","Essen","Leipzig","Bremen","Dresden","Hannover","Nuremberg","Duisburg","Bochum","Wuppertal","Bielefeld","Bonn","Münster"],
  "France": ["Paris","Lyon","Marseille","Toulouse","Nice","Nantes","Strasbourg","Montpellier","Bordeaux","Lille","Rennes","Reims","Saint-Étienne","Toulon","Grenoble","Dijon","Angers","Nîmes","Villeurbanne","Clermont-Ferrand"],
  "Spain": ["Madrid","Barcelona","Valencia","Seville","Zaragoza","Málaga","Murcia","Palma","Las Palmas","Bilbao","Alicante","Córdoba","Valladolid","Vigo","Gijón","Eixample","Hospitalet","Vitoria-Gasteiz","La Coruña","Santa Cruz de Tenerife"],
  "Italy": ["Rome","Milan","Naples","Turin","Palermo","Genoa","Bologna","Florence","Bari","Catania","Venice","Verona","Messina","Padua","Trieste","Brescia","Taranto","Prato","Reggio Calabria","Modena"],
  "Portugal": ["Lisbon","Porto","Braga","Coimbra","Funchal","Setúbal","Almada","Agualva-Cacém","Queluz","Viseu","Guimarães","Vila Nova de Gaia","Amadora","Aveiro","Odivelas","Barreiro","Loures","Matosinhos","Évora","Faro"],
  "Netherlands": ["Amsterdam","Rotterdam","The Hague","Utrecht","Eindhoven","Tilburg","Groningen","Almere","Breda","Nijmegen","Enschede","Haarlem","Arnhem","Zaanstad","Apeldoorn","Amersfoort","Maastricht","Dordrecht","Leiden","Zoetermeer"],
  "Belgium": ["Brussels","Antwerp","Ghent","Charleroi","Liège","Bruges","Namur","Leuven","Mons","Aalst"],
  "Poland": ["Warsaw","Kraków","Łódź","Wrocław","Poznań","Gdańsk","Szczecin","Bydgoszcz","Lublin","Białystok"],
  "Austria": ["Vienna","Graz","Linz","Salzburg","Innsbruck","Klagenfurt","Villach","Wels","Sankt Pölten","Dornbirn"],
  "Switzerland": ["Zurich","Geneva","Basel","Bern","Lausanne","Winterthur","Lucerne","St. Gallen","Lugano","Biel/Bienne"],
  "Australia": ["Sydney","Melbourne","Brisbane","Perth","Adelaide","Gold Coast","Canberra","Newcastle","Wollongong","Logan City"],
  "Canada": ["Toronto","Montreal","Vancouver","Calgary","Edmonton","Ottawa","Winnipeg","Quebec City","Hamilton","Kitchener"],
  "India": ["Mumbai","Delhi","Bangalore","Hyderabad","Ahmedabad","Chennai","Kolkata","Surat","Pune","Jaipur","Lucknow","Kanpur","Nagpur","Indore","Thane","Bhopal","Visakhapatnam","Pimpri-Chinchwad","Patna","Vadodara"],
  "Brazil": ["São Paulo","Rio de Janeiro","Brasília","Salvador","Fortaleza","Belo Horizonte","Manaus","Curitiba","Recife","Porto Alegre"],
  "Mexico": ["Mexico City","Guadalajara","Monterrey","Puebla","Tijuana","León","Juárez","Zapopan","Nezahualcóyotl","Chihuahua"],
  "China": ["Shanghai","Beijing","Chongqing","Tianjin","Guangzhou","Shenzhen","Chengdu","Wuhan","Xi'an","Hangzhou"],
  "Japan": ["Tokyo","Yokohama","Osaka","Nagoya","Sapporo","Fukuoka","Kobe","Kawasaki","Kyoto","Saitama"],
  "South Korea": ["Seoul","Busan","Incheon","Daegu","Daejeon","Gwangju","Suwon","Ulsan","Sejong","Changwon"],
  "Turkey": ["Istanbul","Ankara","Izmir","Bursa","Adana","Gaziantep","Konya","Antalya","Diyarbakır","Kayseri"],
  "Greece": ["Athens","Thessaloniki","Patras","Heraklion","Larissa","Volos","Rhodes","Ioannina","Chania","Chalcis"],
  "Czech Republic": ["Prague","Brno","Ostrava","Plzeň","Liberec","Olomouc","Ústí nad Labem","České Budějovice","Hradec Králové","Pardubice"],
  "Hungary": ["Budapest","Debrecen","Miskolc","Szeged","Pécs","Győr","Nyíregyháza","Kecskemét","Székesfehérvár","Szombathely"],
  "Sweden": ["Stockholm","Gothenburg","Malmö","Uppsala","Västerås","Örebro","Linköping","Helsingborg","Jönköping","Norrköping"],
  "Denmark": ["Copenhagen","Aarhus","Odense","Aalborg","Frederiksberg","Esbjerg","Gentofte","Gladsaxe","Randers","Kolding"],
  "Norway": ["Oslo","Bergen","Stavanger","Trondheim","Drammen","Fredrikstad","Kristiansand","Asker","Sandnes","Tromsø"],
  "Finland": ["Helsinki","Espoo","Tampere","Vantaa","Oulu","Turku","Jyväskylä","Lahti","Kuopio","Kouvola"],
  "Ireland": ["Dublin","Cork","Limerick","Galway","Waterford","Drogheda","Dundalk","Swords","Bray","Navan"],
  "Ukraine": ["Kyiv","Kharkiv","Odessa","Dnipro","Donetsk","Zaporizhzhia","Lviv","Kryvyi Rih","Mykolaiv","Mariupol"],
  "Russia": ["Moscow","Saint Petersburg","Novosibirsk","Yekaterinburg","Kazan","Nizhny Novgorod","Chelyabinsk","Samara","Ufa","Rostov-on-Don"],
  "South Africa": ["Johannesburg","Cape Town","Durban","Pretoria","Port Elizabeth","Bloemfontein","Nelspruit","Polokwane","Pietermaritzburg","Kimberley"],
  "Argentina": ["Buenos Aires","Córdoba","Rosario","Mendoza","Tucumán","La Plata","Mar del Plata","Salta","Santa Fe","San Juan"],
  "United Arab Emirates": ["Dubai","Abu Dhabi","Sharjah","Al Ain","Ajman","Ras Al Khaimah","Fujairah","Umm Al Quwain"],
};

function LocationDropdowns({ country, city, disabled, onChange }: {
  country: string; city: string; disabled?: boolean;
  onChange: (country: string, city: string) => void;
}) {
  const cities = country && CITIES_BY_COUNTRY[country] ? CITIES_BY_COUNTRY[country] : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, opacity: disabled ? 0.4 : 1 }}>
      <div>
        <div className="wf-blabel" style={{ marginBottom: 6 }}>Country</div>
        <select className="wf-input" value={country} disabled={disabled}
          onChange={e => onChange(e.target.value, "")}>
          <option value="">Select a country…</option>
          {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      {country && (
        <div>
          <div className="wf-blabel" style={{ marginBottom: 6 }}>City</div>
          {cities ? (
            <select className="wf-input" value={city} disabled={disabled}
              onChange={e => onChange(country, e.target.value)}>
              <option value="">Select a city…</option>
              {cities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          ) : (
            <input className="wf-input" value={city} disabled={disabled}
              placeholder="Enter your city…"
              onChange={e => onChange(country, e.target.value)} />
          )}
        </div>
      )}
    </div>
  );
}

// ─── Schedule Picker ──────────────────────────────────────────────────────────

function SchedulePicker({ schedule, onChange, schedTypes, lang }: {
  schedule: WizardData["schedule"]; onChange: (s: WizardData["schedule"]) => void;
  schedTypes?: typeof SCHEDULE_TYPES; lang?: Lang;
}) {
  const L = lang ?? "en";
  const types = schedTypes ?? SCHEDULE_TYPES;
  const setType = (type: WizardData["schedule"]["type"]) => onChange({ ...schedule, type });
  const setDay = (day: string, field: keyof DayHours, val: string | boolean) =>
    onChange({ ...schedule, hours: { ...schedule.hours, [day]: { ...schedule.hours[day], [field]: val } } });

  const times: string[] = [];
  for (let h = 0; h < 24; h++) { ["00","30"].forEach(m => times.push(`${String(h).padStart(2,"0")}:${m}`)); }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div className="wf-opt-grid wf-og-2">
        {types.map(s => {
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
            const dayLabel = L === "ro"
              ? ({ monday:"Lun",tuesday:"Mar",wednesday:"Mie",thursday:"Joi",friday:"Vin",saturday:"Sâm",sunday:"Dum" }[day] ?? day)
              : DAY_LABELS[day];
            return (
              <div key={day} className={`wf-srow${h.closed ? " closed" : ""}`}>
                <span className="wf-sday">{dayLabel}</span>
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

function Step01Template({ data, setData, lang }: { data: WizardData; setData: React.Dispatch<React.SetStateAction<WizardData>>; lang: Lang }) {
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
      <StepHead idx={1} total={11} kicker={tr(lang,"Alege punctul de start","Pick your starting point")}
        title={tr(lang,"Alege un șablon","Choose a template")}
        sub={tr(lang,"Începe de la un șablon de industrie — sau de la zero, pentru un design complet personalizat.","Start from an industry template — or choose scratch to configure everything yourself.")} />
      <TemplateGallery selectedId={data.templateId} onSelect={handleSelect} />
    </div>
  );
}

// ─── Step 02 — Design Style ───────────────────────────────────────────────────

function Step02Design({ data, setData, lang }: { data: WizardData; setData: React.Dispatch<React.SetStateAction<WizardData>>; lang: Lang }) {
  const d = data.design;
  const set = <K extends keyof WizardData["design"]>(k: K, v: WizardData["design"][K]) =>
    setData(p => ({ ...p, design: { ...p.design, [k]: v } }));
  const styles     = lang === "ro" ? VISUAL_STYLES_RO   : VISUAL_STYLES;
  const personals  = lang === "ro" ? PERSONALITY_LEVELS_RO : PERSONALITY_LEVELS;
  const bgs        = lang === "ro" ? BACKGROUND_STYLES_RO  : BACKGROUND_STYLES;

  return (
    <div>
      <StepHead idx={2} total={11} kicker={tr(lang,"Stil vizual","Design aesthetic")}
        title={tr(lang,"Alege-ți stilul vizual","Pick your visual style")}
        sub={tr(lang,"Personalitatea și atmosfera generală a site-ului. Vei ajusta culorile și tipografia în pasul următor.","The overall personality and mood of your site. Fine-tune colours and type in the next two steps.")} />
      <Block label={tr(lang,"Stil vizual","Visual style")} required>
        <WizOptGrid cols={3} options={styles.map(s => ({ id: s.id, name: s.name, desc: s.desc }))}
          value={d.style} onChange={v => set("style", v)} />
      </Block>
      <Block label={tr(lang,"Nivel de personalitate","Personality level")}>
        <WizOptGrid cols={2} options={personals.map(s => ({ id: s.id, name: s.name, desc: s.desc }))}
          value={d.personalityLevel} onChange={v => set("personalityLevel", v)} />
      </Block>
      <Block label={tr(lang,"Stilul fundalului","Background style")}>
        <WizChipSelect options={bgs.map(s => ({ id: s.id, label: s.label }))}
          value={d.backgroundStyle} onChange={v => set("backgroundStyle", v as string)} />
      </Block>
    </div>
  );
}

// ─── Step 03 — Colors & Motion ────────────────────────────────────────────────

function Step03Colors({ data, setData, lang }: { data: WizardData; setData: React.Dispatch<React.SetStateAction<WizardData>>; lang: Lang }) {
  const d = data.design;
  const set = <K extends keyof WizardData["design"]>(k: K, v: WizardData["design"][K]) =>
    setData(p => ({ ...p, design: { ...p.design, [k]: v } }));
  const anims = lang === "ro" ? ANIMATION_OPTS_RO : ANIMATION_OPTS;

  return (
    <div>
      <StepHead idx={3} total={11} kicker={tr(lang,"Culoare & mișcare","Colour & motion")}
        title={tr(lang,"Culorile brandului tău","Your brand colours")}
        sub={tr(lang,"Acestea ajung direct în site-ul generat — alege o culoare principală, una secundară și cât de dinamic să fie.","These flow straight into the generated site — pick a primary, an accent, and how lively it should feel.")} />
      <Block label={tr(lang,"Culoarea principală a brandului","Primary brand color")} required
        note={tr(lang,"Culoarea dominantă — butoane, linkuri, accente cheie.","The dominant colour — buttons, links, key highlights.")}>
        <WizColorPicker value={d.primaryColor} onChange={v => set("primaryColor", v)} label={tr(lang,"Principală","Primary")} />
      </Block>
      <Block label={tr(lang,"Culoare de accent / secundară","Accent / secondary color")}
        note={tr(lang,"Folosită pentru elemente de suport și contrast.","Used for supporting elements and contrast.")}>
        <WizColorPicker value={d.secondaryColor} onChange={v => set("secondaryColor", v)} label={tr(lang,"Accent","Accent")} />
      </Block>
      <Block label={tr(lang,"Animații & interacțiuni","Animations & interactions")}>
        <WizOptGrid cols={2} options={anims.map(a => ({ id: a.id, name: a.name, desc: a.desc }))}
          value={d.animations} onChange={v => set("animations", v)} />
      </Block>
      <Block label={tr(lang,"Mod întunecat","Dark mode")}>
        <WizCheckRow label={tr(lang,"Adaugă o variantă întunecată — atractivă pe mobil, UX modern","Include a dark variant — appealing on mobile, modern UX")}
          on={d.darkMode} onToggle={v => set("darkMode", v)} />
      </Block>
    </div>
  );
}

// ─── Step 04 — Type & Imagery ─────────────────────────────────────────────────

function Step04TypeImagery({ data, setData, lang }: { data: WizardData; setData: React.Dispatch<React.SetStateAction<WizardData>>; lang: Lang }) {
  const t = data.typography;
  const l = data.logo;
  const setTypo = <K extends keyof WizardData["typography"]>(k: K, v: WizardData["typography"][K]) =>
    setData(p => ({ ...p, typography: { ...p.typography, [k]: v } }));
  const fileRef = useRef<HTMLInputElement>(null);
  const fonts   = lang === "ro" ? FONTS_RO    : FONTS;
  const imagery = lang === "ro" ? IMAGERY_STYLES_RO : IMAGERY_STYLES;

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    // PNG preserves transparency for logos
    readPhotoAsDataUrl(f, 800, dataUrl =>
      setData(p => ({ ...p, logo: { uploaded: true, dataUrl, fileName: f.name } }))
    , "png");
  };

  return (
    <div>
      <StepHead idx={4} total={11} kicker={tr(lang,"Tipografie & imagini","Typography & imagery")}
        title={tr(lang,"Tipografie, fotografii & logo","Type, photos & your logo")}
        sub={tr(lang,"Stabilește literele și limbajul vizual — apoi încarcă un logo, dacă ai unul.","Lock in the lettering and the visual language, then drop in a logo if you have one.")} />
      <Block label={tr(lang,"Stil tipografic","Typography style")} required>
        <div className="wf-opt-grid wf-og-3">
          {fonts.map((f, fi) => {
            const fontFull = FONTS[fi] ?? FONTS[0];
            const sel = t.fontFamily === f.id;
            return (
              <button key={f.id} type="button" className={`wf-opt-card${sel ? " sel" : ""}`}
                onClick={() => setTypo("fontFamily", f.id)}>
                <span className="wf-tick"><ICheck /></span>
                <span style={{ ...fontFull.style, fontSize: 28, lineHeight: 1, marginBottom: 7, color: "var(--wf-text)", display: "block" }}>Aa</span>
                <span className="wf-oct">{f.name}</span>
                <span className="wf-ocd">{f.desc}</span>
              </button>
            );
          })}
        </div>
      </Block>
      <Block label={tr(lang,"Stil imagini","Imagery style")} required
        note={t.imageryStyle === "own-images"
          ? tr(lang,"Mai târziu în formular există o secțiune dedicată unde poți încărca fotografiile tale.","Later in this form there is a dedicated section where you can upload your photos.")
          : undefined}>
        <WizOptGrid cols={2} options={imagery.map(i => ({ id: i.id, name: i.name, desc: i.desc }))}
          value={t.imageryStyle} onChange={v => setTypo("imageryStyle", v)} />
      </Block>
      <Block label="Logo" optional note={tr(lang,"PNG, SVG, JPG sau WebP · Max 5MB — AI îl plasează în antet, dimensionat pentru navigare.","PNG, SVG, JPG or WebP · Max 5MB — AI places it in the header, sized for navigation.")}>
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
            <div className="wf-up-h">{tr(lang,"Încarcă logo-ul","Upload your logo")}</div>
            <div className="wf-up-d">{tr(lang,"Trage sau apasă ca să alegi","Drag & drop or click to browse")}</div>
          </label>
        )}
      </Block>
    </div>
  );
}

// ─── Step 05 — Business ───────────────────────────────────────────────────────

function Step05Business({ data, setData, lang }: { data: WizardData; setData: React.Dispatch<React.SetStateAction<WizardData>>; lang: Lang }) {
  const b = data.business;
  const set = <K extends keyof WizardData["business"]>(k: K, v: WizardData["business"][K]) =>
    setData(p => ({ ...p, business: { ...p.business, [k]: v } }));
  const bizTypes = lang === "ro" ? BIZ_TYPES_RO : BIZ_TYPES_EN;
  const schedTypes = (lang === "ro" ? SCHEDULE_TYPES_RO : SCHEDULE_TYPES) as typeof SCHEDULE_TYPES;

  return (
    <div>
      <StepHead idx={5} total={11} kicker={tr(lang,"Spune-ne despre afacerea ta","Tell us about your business")}
        title={tr(lang,"Datele de bază","The basics")}
        sub={tr(lang,"Nume, date de contact, locație și program. Acestea stau la baza a tot ce scrie AI pentru tine.","Name, contact details, location and opening hours. This grounds everything the AI writes for you.")} />

      <Block label={tr(lang,"Numele afacerii","Business name")} required>
        <WizInput value={b.name} onChange={v => set("name", v)} placeholder={tr(lang,"ex. Cabinet Dentar Nord","e.g. Northside Dental")} />
      </Block>

      <Block label={tr(lang,"Tipul afacerii","Business type")} required>
        <select className="wf-input" value={b.type} onChange={e => set("type", e.target.value)}>
          {bizTypes.map((t, i) => <option key={t} value={i === 0 ? "" : t}>{t || tr(lang,"Alege un tip…","Select a type…")}</option>)}
        </select>
      </Block>

      <Block label={tr(lang,"Descrierea afacerii","Business description")} required
        note={tr(lang,"Ce faci, în una-două propoziții. AI transformă asta în textul de hero și introducere.","What you do, in a sentence or two. The AI turns this into your hero and intro copy.")}>
        <WizTextarea value={b.description} onChange={v => set("description", v)}
          placeholder={tr(lang,"Ce faci, în una-două propoziții…","What you do, who you serve, what makes you different…")}
          maxLength={500} aiOn={b.aboutAiRephrase} onAiToggle={v => set("aboutAiRephrase", v)} />
      </Block>

      <Block label={tr(lang,"Despre afacerea ta","About your business")} optional>
        <WizTextarea value={b.aboutText} onChange={v => set("aboutText", v)}
          placeholder={tr(lang,"Povestea ta, misiunea, ce te diferențiază…","Your story, mission, what makes you different…")} maxLength={800}
          aiOn={b.aboutAiRephrase} onAiToggle={v => set("aboutAiRephrase", v)} />
      </Block>

      <Block label={tr(lang,"Ai o locație fizică?","Do you have a physical location?")} required>
        <WizOptGrid cols={2} options={[
          { id: "yes", name: tr(lang,"Da, am o locație fizică","Yes, I have a physical location"), desc: tr(lang,"Clienții pot veni la tine","Customers can visit you") },
          { id: "no",  name: tr(lang,"Nu, fără locație fizică","No physical location"),            desc: tr(lang,"Online sau la client","Online-only or at client's location") },
        ]} value={b.hasLocation ? "yes" : "no"}
          onChange={v => set("hasLocation", v === "yes")} />
      </Block>

      {b.hasLocation && (
        <Block label={tr(lang,"Locație","Location")} required>
          <LocationDropdowns
            country={b.locationCountry}
            city={b.locationCity}
            onChange={(country, city) => setData(p => ({ ...p, business: { ...p.business, locationCountry: country, locationCity: city, location: `${city}${country ? `, ${country}` : ""}` } }))}
          />
          <div className="wf-maps-wrap" style={{ marginTop: 12 }}>
            <div className="wf-blabel">{tr(lang,"Link Google Maps","Google Maps link")} <span className="opt">({tr(lang,"opțional","optional")})</span></div>
            <div className="wf-maps-note">{tr(lang,'Deschide locatia in Google Maps, apasa "Distribuie" si lipeste linkul aici - il integram in site cu harta si buton de indicatii.',"Open your location in Google Maps, tap Share, and paste the link here — we embed it on the site with a map and directions button.")}</div>
            <WizInput value={b.mapsLink} onChange={v => set("mapsLink", v)} placeholder="https://maps.app.goo.gl/…" type="url" />
          </div>
          <div style={{ marginTop: 10 }}>
            <div className="wf-blabel">{tr(lang,"Zona de servicii","Service area")} <span className="opt">({tr(lang,"opțional","optional")})</span></div>
            <WizInput value={b.serviceArea} onChange={v => set("serviceArea", v)} placeholder={tr(lang,"ex. București și împrejurimi","e.g. Greater London, nationwide")} />
          </div>
        </Block>
      )}

      <Block>
        <div className="wf-grid2">
          <div>
            <div className="wf-blabel">Email <span className="opt">({tr(lang,"opțional","optional")})</span></div>
            <WizInput value={b.email} onChange={v => set("email", v)} placeholder={tr(lang,"contact@afacerea.ro","hello@business.com")} type="email" />
          </div>
          <div>
            <div className="wf-blabel">{tr(lang,"Telefon","Phone")} <span className="req">*</span></div>
            <WizInput value={b.phone} onChange={v => set("phone", v)} placeholder={tr(lang,"+40 7xx xxx xxx","+1 555 000 0000")} disabled={!b.hasPhone} />
          </div>
        </div>
        <div style={{ marginTop: 10 }}>
          <WizCheckRow label={tr(lang,"Nu am un număr de telefon","I don't have a phone number")} on={!b.hasPhone} onToggle={v => set("hasPhone", !v)} />
        </div>
      </Block>

      <Block label={tr(lang,"Programul afacerii","Business schedule")}>
        <SchedulePicker schedule={data.schedule} onChange={s => setData(p => ({ ...p, schedule: s }))} schedTypes={schedTypes} lang={lang} />
      </Block>

      <Block>
        <div className="wf-blabel">{tr(lang,"Ani de activitate","Years in business")} <span className="opt">({tr(lang,"opțional","optional")})</span></div>
        <select className="wf-input" value={b.experience} onChange={e => set("experience", e.target.value)}>
          {EXPERIENCE_OPTIONS.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
        </select>
      </Block>
    </div>
  );
}

// ─── Step 06 — Goals & Audience ───────────────────────────────────────────────

function Step06Goals({ data, setData, lang }: { data: WizardData; setData: React.Dispatch<React.SetStateAction<WizardData>>; lang: Lang }) {
  const g = data.goals;
  const set = <K extends keyof WizardData["goals"]>(k: K, v: WizardData["goals"][K]) =>
    setData(p => ({ ...p, goals: { ...p.goals, [k]: v } }));
  const goals   = lang === "ro" ? MAIN_GOALS_RO : MAIN_GOALS;
  const feels   = lang === "ro"
    ? VISITOR_FEELS_RO.map(f => ({ id: f.id, label: f.label }))
    : VISITOR_FEELS.map(f => ({ id: f, label: f }));

  return (
    <div>
      <StepHead idx={6} total={11} kicker={tr(lang,"Obiective & public","Goals & audience")}
        title={tr(lang,"Ce trebuie să realizeze?","What should it accomplish?")}
        sub={tr(lang,"Spune-ne ce sarcină are de îndeplinit site-ul și cui i se adresează — optimizăm aranjamentul în jurul acestui scop.","Tell us the job your website needs to do and who it's speaking to — we optimise the layout around it.")} />
      <Block label={tr(lang,"Obiectiv principal","Main goal")} required
        note={tr(lang,"Care e lucrul #1 pe care ar trebui să-l facă un vizitator?","What's the #1 thing a visitor should do?")}>
        <WizOptGrid cols={2} options={goals.map(m => ({ id: m.id, name: m.name, desc: m.desc }))}
          value={g.mainGoal} onChange={v => set("mainGoal", v)} />
        <div style={{ marginTop: 10, padding: "10px 14px", borderRadius: 8, background: "var(--wf-surf2)", border: "1px solid var(--wf-border)", fontSize: 12.5, color: "var(--wf-text3)", lineHeight: 1.5 }}>
          {tr(lang,
            "Notă: Site-ul generat nu poate procesa plăți online sau rezervări direct. Vizitatorii te vor contacta telefonic sau prin email.",
            "Note: The generated website cannot process online purchases or bookings. Visitors will contact you by phone or email."
          )}
        </div>
      </Block>
      <Block label={tr(lang,"Cum ar trebui să se simtă vizitatorii când ajung pe site?","How should visitors feel when they land?")}
        note={tr(lang,"Alege una — asta modelează culorile, textul și imaginile.","Pick one — this shapes colour, copy and imagery.")}>
        <WizChipSelect options={feels}
          value={g.visitorFeel} onChange={v => set("visitorFeel", v as string)} />
      </Block>
      <Block label={tr(lang,"Cine este clientul tău ideal?","Who is your ideal customer?")} optional>
        <WizInput value={g.idealCustomer} onChange={v => set("idealCustomer", v)}
          placeholder={tr(lang,"ex. părinți ocupați, proprietari locali…","e.g. busy parents, local homeowners, founders…")} />
      </Block>
      <Block label={tr(lang,"Ce problemă le rezolvi?","What problem do you solve for them?")} optional>
        <WizTextarea value={g.problemSolved} onChange={v => set("problemSolved", v)}
          placeholder={tr(lang,"Durerea principală pe care o elimini","The core pain you take away")} maxLength={300} />
      </Block>
      <Block label={tr(lang,"De ce să te aleagă pe tine în locul concurenței?","Why should they choose you over competitors?")} optional>
        <WizTextarea value={g.whyChoose} onChange={v => set("whyChoose", v)}
          placeholder={tr(lang,"Avantajul tău — experiență, preț, grijă, viteză…","Your edge — experience, price, care, speed…")} maxLength={300} />
      </Block>
    </div>
  );
}

// ─── Service Items Editor ─────────────────────────────────────────────────────

function ServiceItemEditor({ items, onChange, lang }: {
  items: ServiceItem[]; onChange: (v: ServiceItem[]) => void; lang: Lang;
}) {
  const list: ServiceItem[] = items && items.length ? items : [{ name: "", description: "", price: "", callForPrice: false }];

  const set = (i: number, patch: Partial<ServiceItem>) =>
    onChange(list.map((m, j) => j === i ? { ...m, ...patch } : m));
  const add = () => onChange([...list, { name: "", description: "", price: "", callForPrice: false }]);
  const del = (i: number) => {
    const next = list.filter((_, j) => j !== i);
    onChange(next.length ? next : [{ name: "", description: "", price: "", callForPrice: false }]);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {list.map((item, i) => (
        <div key={i} style={{ padding: "14px 16px", borderRadius: 10, background: "var(--wf-surf2)", border: "1px solid var(--wf-border)", display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontFamily: "var(--wf-mono)", fontSize: 11, color: "var(--wf-text3)" }}>{tr(lang,"Serviciu","Service")} {String(i + 1).padStart(2, "0")}</span>
            <button type="button" className="wf-rep-del" onClick={() => del(i)} aria-label="Remove"><ITrash /></button>
          </div>
          <input className="wf-input" value={item.name}
            placeholder={tr(lang,"ex. Tuns & coafat","e.g. Hair cut & styling")}
            onChange={e => set(i, { name: e.target.value })} />
          <textarea className="wf-textarea" value={item.description}
            placeholder={tr(lang,"Descrie serviciul — AI va îmbunătăți textul pentru tine","Describe the service — AI will polish the copy for you")}
            onChange={e => set(i, { description: e.target.value })}
            style={{ minHeight: 70, resize: "vertical" as const }} />
          {!item.callForPrice && (
            <input className="wf-input" value={item.price}
              placeholder={tr(lang,"Preț (ex. 150 RON, de la 200 EUR, gratuit)","Price (e.g. €50, from €30, free)")}
              onChange={e => set(i, { price: e.target.value })} />
          )}
          <div className={`wf-checkrow${item.callForPrice ? " on" : ""}`}
            onClick={() => set(i, { callForPrice: !item.callForPrice, price: "" })}
            style={{ cursor: "pointer" }}>
            <span className="wf-checkbox"><ICheck /></span>
            {tr(lang,"Clienții trebuie să sune pentru a afla prețul","Customers must call to get the price")}
          </div>
        </div>
      ))}
      <button type="button" className="wf-add-item" onClick={add}>
        <IPlus /> {tr(lang,"Adaugă un serviciu","Add a service")}
      </button>
    </div>
  );
}

// ─── Step 07 — Services & Pricing ─────────────────────────────────────────────

function Step07Services({ data, setData, lang }: { data: WizardData; setData: React.Dispatch<React.SetStateAction<WizardData>>; lang: Lang }) {
  const s = data.services;
  const set = <K extends keyof WizardData["services"]>(k: K, v: WizardData["services"][K]) =>
    setData(p => ({ ...p, services: { ...p.services, [k]: v } }));
  const offers = lang === "ro" ? OFFERS_TYPES_RO : OFFERS_TYPES;
  const prices = lang === "ro" ? PRICE_VISIBILITY_RO : PRICE_VISIBILITY;
  const qc = s.quoteContacts ?? { phone: "", email: "", instagram: "", facebook: "", whatsapp: "" };
  const setQc = (k: keyof typeof qc, v: string) =>
    setData(p => ({ ...p, services: { ...p.services, quoteContacts: { ...qc, [k]: v } } }));

  return (
    <div>
      <StepHead idx={7} total={11} kicker={tr(lang,"Servicii & prețuri","Services & pricing")}
        title={tr(lang,"Ce oferi","What you offer")}
        sub={tr(lang,"Listează serviciile tale cu o descriere și un preț opțional. Descrierile scurte sunt suficiente — AI le va îmbunătăți.","List your services with a description and optional price. Short notes are fine — AI will improve them.")} />

      <Block label={tr(lang,"Ce oferi?","What do you offer?")} required>
        <WizOptGrid cols={2} options={offers.map(o => ({ id: o.id, name: o.name, desc: o.desc }))}
          value={s.offersType} onChange={v => set("offersType", v)} />
        <div style={{ marginTop: 10, padding: "10px 14px", borderRadius: 8, background: "var(--wf-surf2)", border: "1px solid var(--wf-border)", fontSize: 12.5, color: "var(--wf-text3)", lineHeight: 1.5 }}>
          {tr(lang,
            "Notă: Acest site nu poate procesa vânzări online. Clienții vor vedea produsele/serviciile tale și te vor contacta direct.",
            "Note: This website cannot process online sales. Visitors will see your offerings and contact you directly."
          )}
        </div>
      </Block>

      <Block label={tr(lang,"Listează serviciile principale","List your main services")} optional
        note={tr(lang,"Adaugă fiecare serviciu cu o descriere. AI va îmbunătăți textul.","Add each service with a description. AI will improve the text.")}>
        <ServiceItemEditor
          items={s.serviceItems ?? []}
          onChange={v => setData(p => ({ ...p, services: { ...p.services, serviceItems: v } }))}
          lang={lang}
        />
      </Block>

      <Block label={tr(lang,"Cum ar trebui afișate prețurile?","How should pricing be shown?")}>
        <WizChipSelect options={prices.map(p => ({ id: p.id, label: p.label }))}
          value={s.priceVisibility} onChange={v => set("priceVisibility", v as string)} />
      </Block>

      {s.priceVisibility === "quote" && (
        <Block label={tr(lang,"Date de contact pentru oferte","Contact details for quotes")}
          note={tr(lang,"Clienții vor vedea aceste date pentru a solicita o ofertă.","Visitors will see these details to request a quote.")}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { key: "phone" as const,     label: tr(lang,"Telefon","Phone"),        ph: "+1 555 000 0000" },
              { key: "email" as const,     label: "Email",                           ph: "hello@business.com" },
              { key: "whatsapp" as const,  label: "WhatsApp",                        ph: "+1 555 000 0000" },
              { key: "instagram" as const, label: "Instagram",                       ph: "@yourbusiness" },
              { key: "facebook" as const,  label: "Facebook",                        ph: "facebook.com/yourbusiness" },
            ].map(({ key, label, ph }) => (
              <div key={key} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontFamily: "var(--wf-mono)", fontSize: 11.5, color: "var(--wf-text2)", width: 80, flexShrink: 0 }}>{label}</span>
                <input className="wf-input" value={qc[key]} placeholder={ph}
                  onChange={e => setQc(key, e.target.value)} />
              </div>
            ))}
          </div>
        </Block>
      )}
    </div>
  );
}

// ─── Step 08 — Pages ──────────────────────────────────────────────────────────

function Step08Pages({ data, setData, lang }: { data: WizardData; setData: React.Dispatch<React.SetStateAction<WizardData>>; lang: Lang }) {
  const pg = data.pages;
  const selected = pg.selected || [];
  const corePages  = lang === "ro" ? CORE_PAGES_RO  : CORE_PAGES;
  const extraPages = lang === "ro" ? EXTRA_PAGES_RO : EXTRA_PAGES;
  const allPages   = [...corePages, ...extraPages];

  const toggle = (id: string, required: boolean) => {
    if (required) return;
    const next = selected.includes(id) ? selected.filter(s => s !== id) : [...selected, id];
    setData(p => ({ ...p, pages: { ...p.pages, selected: next } }));
  };

  const setPageDesc = (id: string, patch: Partial<PageDesc>) =>
    setData(p => ({
      ...p,
      pages: {
        ...p.pages,
        pageDescriptions: {
          ...p.pages.pageDescriptions,
          [id]: { ...{ description: "", aiRephrase: false, image: "", imageName: "" }, ...(p.pages.pageDescriptions[id] ?? {}), ...patch },
        },
      },
    }));

  const visiblePageIds = [...new Set(["home", ...selected])];

  return (
    <div>
      <StepHead idx={8} total={11} kicker={tr(lang,"Pagini & structură","Pages & structure")}
        title={tr(lang,"De ce pagini ai nevoie?","Which pages do you need?")}
        sub={tr(lang,"Pagina Acasă este inclusă mereu. Activează-le pe celelalte, apoi adaugă orice vrei să spună AI pe fiecare pagină.","Home is always included. Toggle the rest — then add notes for what you want the AI to say on each page.")} />

      <Block label={tr(lang,"Pagini esențiale","Core pages")} note={tr(lang,"Pagina Acasă este inclusă mereu.","Home is always included.")}>
        <div className="wf-opt-grid wf-og-2">
          {corePages.map(p => {
            const on = p.required || selected.includes(p.id);
            return (
              <button key={p.id} type="button"
                className={`wf-opt-card${on ? " sel" : ""}`}
                onClick={() => toggle(p.id, p.required)}
                style={p.required ? { cursor: "default" } : undefined}>
                <span className="wf-tick">{p.required ? <ILock /> : <ICheck />}</span>
                <span className="wf-oct">{p.label}</span>
                <span className="wf-ocd">{p.required ? tr(lang,"Inclusă mereu","Always included") : p.desc}</span>
              </button>
            );
          })}
        </div>
      </Block>

      <Block label={tr(lang,"Adaugă mai multe pagini","Add more pages")} optional>
        <div className="wf-opt-grid wf-og-3">
          {extraPages.map(p => {
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

      {/* Per-page content notes */}
      <Block label={tr(lang,"Note pe pagini (opțional)","Per-page notes (optional)")} optional
        note={tr(lang,"Adaugă ce vrei să spună AI pe fiecare pagină. Scurt e suficient — AI completează restul.","Tell the AI what to say on each page. A few words is enough — AI does the rest.")}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {visiblePageIds.map(id => {
            const pageMeta = allPages.find(p => p.id === id);
            if (!pageMeta) return null;
            const desc = pg.pageDescriptions[id] ?? { description: "", aiRephrase: false, image: "", imageName: "" };
            const isGallery      = id === "portfolio";
            const isTestimonials = id === "testimonials";
            const isBooking      = id === "booking";

            return (
              <div key={id} style={{ padding: "14px 16px", borderRadius: 10, background: "var(--wf-surf2)", border: "1px solid var(--wf-border)" }}>
                <div style={{ fontFamily: "var(--wf-mono)", fontSize: 11, fontWeight: 600, color: "var(--wf-text2)", marginBottom: 8, textTransform: "uppercase" as const, letterSpacing: 0.5 }}>
                  {pageMeta.label}
                </div>

                {isGallery && (
                  <div style={{ marginBottom: 8, padding: "8px 12px", borderRadius: 6, background: "rgba(0,0,0,0.04)", fontSize: 12.5, color: "var(--wf-text3)", lineHeight: 1.5 }}>
                    {tr(lang,"Pozele pe care le încarci în pasul următor (Galerie) vor apărea pe această pagină.","Photos you upload in the next step (Gallery) will appear on this page.")}
                  </div>
                )}

                {isTestimonials && (
                  <div className={`wf-checkrow${desc.aiRephrase ? " on" : ""}`}
                    onClick={() => setPageDesc(id, { aiRephrase: !desc.aiRephrase })}
                    style={{ cursor: "pointer", marginBottom: 8 }}>
                    <span className="wf-checkbox"><ICheck /></span>
                    {tr(lang,"Lasă AI să genereze testimoniale exemplu","Let AI write sample testimonials")}
                  </div>
                )}

                {isBooking && (
                  <input className="wf-input" value={desc.description.startsWith("phone:") ? desc.description.replace("phone:", "") : ""}
                    placeholder={tr(lang,"Număr de telefon pentru rezervări (ex. +40 722 000 000)","Booking phone number (e.g. +1 555 000 0000)")}
                    onChange={e => setPageDesc(id, { description: `phone:${e.target.value}` })}
                    style={{ marginBottom: 4 }} />
                )}

                {!isBooking && (
                  <textarea className="wf-textarea"
                    value={isTestimonials ? (desc.description || "") : (desc.description || "")}
                    placeholder={
                      isGallery      ? tr(lang,"ex. Galerie cu lucrări, înainte și după…","e.g. Gallery of our work, before and after shots…") :
                      isTestimonials ? tr(lang,"ex. Adaugă 2-3 testimoniale reale ale clienților…","e.g. Add 2-3 real client testimonials… (or let AI generate samples above)") :
                      id === "home"  ? tr(lang,"ex. Evidențiază serviciul X, menționează că suntem deschis și duminica…","e.g. Highlight our X service, mention we are open Sundays…") :
                      tr(lang,"Note pentru AI despre această pagină…","Notes for the AI about this page…")
                    }
                    onChange={e => setPageDesc(id, { description: e.target.value })}
                    style={{ minHeight: 60, resize: "vertical" as const }} />
                )}
              </div>
            );
          })}
        </div>
      </Block>

      <Block label={tr(lang,"Note generale suplimentare","Additional general notes")} optional
        note={tr(lang,"Orice specific pe care vrei să-l incluzi sau să-l eviți pe tot site-ul.","Anything specific you want included or avoided across the whole site.")}>
        <WizTextarea value={pg.additionalNotes} onChange={v => setData(p => ({ ...p, pages: { ...p.pages, additionalNotes: v } }))}
          placeholder={tr(lang,"ex. Pagina Despre noi să fie personală, fără fotografii stock clișeu…","e.g. Make the About page personal, no stock photo clichés, include our founding story…")} maxLength={600} />
      </Block>
    </div>
  );
}

// ─── Step 09 — Gallery, Team & Social ────────────────────────────────────────

function Step09MediaSocial({ data, setData, lang }: { data: WizardData; setData: React.Dispatch<React.SetStateAction<WizardData>>; lang: Lang }) {
  return (
    <div>
      <StepHead idx={9} total={11}
        kicker={tr(lang,"Poze & prezență online","Photos & online presence")}
        title={tr(lang,"Galerie, echipă & social","Gallery, team & social")}
        sub={tr(lang,"Pozele reale vând. Încarcă imagini cu brandul tău, prezintă-ți echipa și leagă-ți rețelele sociale de site.","Real photos sell. Upload brand images, introduce your team, and connect your social networks.")} />

      <Block label={tr(lang,"Galerie foto","Photo gallery")} optional
        note={tr(lang,"Poze cu localul, produsele, lucrările sau atmosfera afacerii tale — apar în galeria site-ului.","Photos of your premises, products, work or atmosphere — shown in the site gallery.")}>
        <GalleryGrid
          photos={data.gallery}
          onChange={fn => setData(p => ({ ...p, gallery: fn(p.gallery) }))}
          lang={lang}
        />
      </Block>

      <Block label={tr(lang,"Secțiunea de echipă","Team section")}>
        <WizOptGrid cols={2} options={[
          { id: "no",  name: tr(lang,"Fără secțiune de echipă","No team section"), desc: tr(lang,"Sări peste secțiunea de echipă","Skip the team section") },
          { id: "yes", name: tr(lang,"Da, adaugă membri","Yes, add members"),      desc: tr(lang,"Prezintă-ți echipa, cu poză și rol","Feature your team with photo and role") },
        ]} value={data.team.enabled ? "yes" : "no"}
          onChange={v => setData(p => ({ ...p, team: { ...p.team, enabled: v === "yes" } }))} />
        {data.team.enabled && (
          <div style={{ marginTop: 16 }}>
            <div className="wf-bnote" style={{ marginBottom: 12 }}>
              {tr(lang,"Adauga fiecare persoana cu numele complet (ex. Dr. Alina Popescu), rolul si o poza.","Add each person with their full name, role, and a photo.")}
            </div>
            <TeamEditor
              members={data.galleryMembers}
              onChange={v => setData(p => ({ ...p, galleryMembers: v }))}
              lang={lang}
            />
          </div>
        )}
      </Block>

      <Block label="Social media" optional>
        <SocialLinksEditor socials={data.socials} onChange={v => setData(p => ({ ...p, socials: v }))} lang={lang} />
      </Block>
    </div>
  );
}

// ─── Step 10 — Finishing Touches ──────────────────────────────────────────────

function Step09Finishing({ data, setData, lang }: { data: WizardData; setData: React.Dispatch<React.SetStateAction<WizardData>>; lang: Lang }) {
  const pg = data.pages;
  const setPg = <K extends keyof WizardData["pages"]>(k: K, v: WizardData["pages"][K]) =>
    setData(p => ({ ...p, pages: { ...p.pages, [k]: v } }));
  const ctas  = lang === "ro" ? CTA_OPTIONS_RO : CTA_OPTIONS;
  const tones = lang === "ro" ? TONE_OPTIONS_RO : TONE_OPTIONS;
  const langs = lang === "ro" ? LANGUAGES_RO    : LANGUAGES;

  return (
    <div>
      <StepHead idx={10} total={11} kicker={tr(lang,"Detalii finale","Finishing touches")}
        title={tr(lang,"Tonul & ultimele detalii","Tone & the final details")}
        sub={tr(lang,"Ultimele alegeri care dau personalitate site-ului și le spun vizitatorilor exact ce să facă.","The last few choices that give your site personality and tell visitors exactly what to do.")} />

      <Block label={tr(lang,"Acțiunea principală (CTA)","Primary call-to-action")} required
        note={tr(lang,"Cum vrei să te contacteze vizitatorii?","How do you want visitors to reach you?")}>
        <WizOptGrid cols={2} options={ctas.map(c => ({ id: c.id, name: c.label }))}
          value={pg.primaryCTA} onChange={v => setPg("primaryCTA", v)} />
      </Block>

      <Block label={tr(lang,"Tonul conținutului","Content tone")}>
        <WizOptGrid cols={3} options={tones.map(t => ({ id: t.id, name: t.label }))}
          value={pg.contentTone} onChange={v => setPg("contentTone", v)} />
      </Block>

      <Block label={tr(lang,"Folosești emoji pe site?","Use emojis in your website?")}>
        <WizOptGrid cols={2} options={[
          { id: "no",  name: tr(lang,"Nu, păstrează-l profesional","No, keep it professional"), desc: tr(lang,"Curat și formal — fără emoji","Clean and formal — no emojis") },
          { id: "yes", name: tr(lang,"Da, adaugă personalitate","Yes, add personality"),       desc: tr(lang,"Emoji ca să pară mai prietenos","Emojis to make it feel friendly") },
        ]} value={data.useEmojis ? "yes" : "no"}
          onChange={v => setData(p => ({ ...p, useEmojis: v === "yes" }))} />
      </Block>

      <Block label={tr(lang,"Calendar săptămânal editabil","Editable weekly calendar")}
        note={tr(lang,"Pentru biserici, parohii sau orice afacere cu un program săptămânal recurent. Adaugă o pagină publică \"Săptămâna aceasta\" pe care o poți actualiza tu, fără cod.","For churches, parishes, or any business with a recurring weekly schedule. Adds a public \"This week\" page you can update yourself, with no code.")}>
        <WizOptGrid cols={2} options={[
          { id: "no",  name: tr(lang,"Nu am nevoie de asta","I don't need this") },
          { id: "yes", name: tr(lang,"Da, adaugă programul editabil","Yes, add the editable schedule") },
        ]} value={pg.calendarModuleEnabled ? "yes" : "no"}
          onChange={v => setPg("calendarModuleEnabled", v === "yes")} />
      </Block>

      <Block label={tr(lang,"Limba site-ului","Website language")} note={tr(lang,"Tot conținutul va fi generat în această limbă.","All content will be generated in this language.")}>
        <select className="wf-input" value={data.websiteLanguage}
          onChange={e => setData(p => ({ ...p, websiteLanguage: e.target.value }))}>
          {langs.map(l => <option key={l}>{l}</option>)}
        </select>
      </Block>
    </div>
  );
}

// ─── Step 11 — Review ─────────────────────────────────────────────────────────

function Step10Review({ data, goTo, onGenerate, loading, isEditMode, lang }: {
  data: WizardData; goTo: (n: number) => void; onGenerate: () => void;
  loading: boolean; isEditMode: boolean; lang: Lang;
}) {
  const dash = (v: string | undefined) => v || "—";
  const goals   = lang === "ro" ? MAIN_GOALS_RO   : MAIN_GOALS;
  const offers  = lang === "ro" ? OFFERS_TYPES_RO : OFFERS_TYPES;
  const tones   = lang === "ro" ? TONE_OPTIONS_RO : TONE_OPTIONS;
  const ctas    = lang === "ro" ? CTA_OPTIONS_RO  : CTA_OPTIONS;
  const styles  = lang === "ro" ? VISUAL_STYLES_RO: VISUAL_STYLES;
  const fonts   = lang === "ro" ? FONTS_RO        : FONTS;
  const imagery = lang === "ro" ? IMAGERY_STYLES_RO : IMAGERY_STYLES;
  const goalLabel    = goals.find(g => g.id === data.goals.mainGoal)?.name;
  const offerLabel   = offers.find(o => o.id === data.services.offersType)?.name;
  const toneLabel    = tones.find(t => t.id === data.pages.contentTone)?.label;
  const ctaLabel     = ctas.find(c => c.id === data.pages.primaryCTA)?.label;
  const styleLabel   = styles.find(s => s.id === data.design.style)?.name;
  const fontLabel    = fonts.find(f => f.id === data.typography.fontFamily)?.name;
  const imageryLabel = imagery.find(i => i.id === data.typography.imageryStyle)?.name;
  const activePages  = (data.pages.selected || []).join(", ") || "home, services, about, contact";
  const calendarModuleLabel = data.pages.calendarModuleEnabled
    ? tr(lang, "Da", "Yes")
    : tr(lang, "Nu", "No");
  const galleryCount = data.gallery.length;
  const teamList     = data.galleryMembers.filter(m => m.name.trim() || m.photo);
  const activeSocials = SOC_NETWORKS.filter(n => ((data.socials as Record<string,string>)[n.key] || "").trim());

  return (
    <div>
      <StepHead idx={11} total={11} kicker={tr(lang,"Verificare & generare","Review & generate")}
        title={tr(lang,"Totul arată bine?","Everything look good?")}
        sub={tr(lang,"O privire rapida inainte de constructie. Apasa orice Editeaza ca sa te intorci.","A quick scan before we build. Click any Edit link to jump back and change it.")} />

      <div className="wf-rev-grid">
        {[
          { k: tr(lang,"Șablon","Template"), step: 0, v: data.templateId
            ? `Template ${data.templateId}`
            : <span style={{ fontStyle:"italic", color:"var(--wf-text3)" }}>{tr(lang,"Personalizat","Custom / scratch")}</span> },
          { k: tr(lang,"Afacere","Business"), step: 4,
            v: `${dash(data.business.name)}${data.business.type ? ` · ${data.business.type}` : ""}`, muted: !data.business.name },
          { k: tr(lang,"Descriere","Description"), step: 4,
            v: dash(data.business.description), muted: !data.business.description, small: true },
          { k: tr(lang,"Locație","Location"), step: 4,
            v: !data.business.hasLocation
              ? tr(lang,"Fără locație fizică","No physical location")
              : dash(data.business.location),
            muted: !data.business.location && data.business.hasLocation,
            extra: data.business.hasLocation && data.business.mapsLink
              ? <span style={{ display:"block",marginTop:4,fontFamily:"var(--wf-mono)",fontSize:11,color:"var(--wf-ok)" }}>✓ Google Maps</span>
              : null },
          { k: tr(lang,"Obiectiv principal","Main goal"), step: 5, v: dash(goalLabel), muted: !goalLabel },
          { k: tr(lang,"Ce oferi","What you offer"), step: 6, v: dash(offerLabel), muted: !offerLabel },
          { k: tr(lang,"Stil de design","Design style"), step: 1, v: dash(styleLabel), muted: !styleLabel },
          { k: tr(lang,"Tipografie","Typography"), step: 3, v: dash(fontLabel), muted: !fontLabel },
        ].map(({ k, step, v, muted, small, extra }) => (
          <div className="wf-rev-card" key={k}>
            <button type="button" className="wf-edit" onClick={() => goTo(step)}>{tr(lang,"Editează","Edit")}</button>
            <div className="wf-rk">{k}</div>
            <div className={`wf-rv${muted ? " muted" : ""}`} style={small ? { fontSize:13, overflow:"hidden", WebkitLineClamp:3, display:"-webkit-box", WebkitBoxOrient:"vertical" } : undefined}>{v}{extra}</div>
          </div>
        ))}
        <div className="wf-rev-card">
          <button type="button" className="wf-edit" onClick={() => goTo(2)}>{tr(lang,"Editează","Edit")}</button>
          <div className="wf-rk">{tr(lang,"Culori","Colours")}</div>
          <div className="wf-rv">
            <div className="wf-rev-swatches">
              <i style={{ background: data.design.primaryColor }} /><i style={{ background: data.design.secondaryColor }} />
              <span style={{ fontFamily:"var(--wf-mono)",fontSize:11,color:"var(--wf-text3)",alignSelf:"center",marginLeft:4 }}>{data.design.primaryColor} · {data.design.secondaryColor}</span>
            </div>
          </div>
        </div>
        {[
          { k: tr(lang,"Imagini","Imagery"),  step: 3, v: dash(imageryLabel), muted: !imageryLabel },
          { k: tr(lang,"Pagini","Pages"),      step: 7, v: activePages, small: true },
          { k: tr(lang,"CTA principal","Primary CTA"), step: 9, v: dash(ctaLabel), muted: !ctaLabel },
          { k: tr(lang,"Tonul conținutului","Content tone"), step: 9, v: dash(toneLabel), muted: !toneLabel },
          { k: tr(lang,"Calendar editabil","Editable calendar"), step: 9, v: calendarModuleLabel },
        ].map(({ k, step, v, muted, small }) => (
          <div className="wf-rev-card" key={k}>
            <button type="button" className="wf-edit" onClick={() => goTo(step)}>{tr(lang,"Editează","Edit")}</button>
            <div className="wf-rk">{k}</div>
            <div className={`wf-rv${muted ? " muted" : ""}`} style={small ? { fontSize:13 } : undefined}>{v}</div>
          </div>
        ))}
        <div className="wf-rev-card">
          <button type="button" className="wf-edit" onClick={() => goTo(8)}>{tr(lang,"Editează","Edit")}</button>
          <div className="wf-rk">{tr(lang,"Galerie foto","Photo gallery")}</div>
          <div className="wf-rv">
            {galleryCount > 0 ? (
              <div className="wf-rev-thumbs">
                {data.gallery.slice(0,6).map((src,i) => <img key={i} src={src} alt="" />)}
                {galleryCount > 6 && <span className="wf-more">+{galleryCount-6}</span>}
              </div>
            ) : <span style={{ fontStyle:"italic",color:"var(--wf-text3)" }}>{tr(lang,"Fără poze","No photos")}</span>}
          </div>
        </div>
        <div className="wf-rev-card">
          <button type="button" className="wf-edit" onClick={() => goTo(8)}>{tr(lang,"Editează","Edit")}</button>
          <div className="wf-rk">{tr(lang,"Echipă","Team")}</div>
          <div className="wf-rv">
            {data.team.enabled && teamList.length > 0 ? (
              <div className="wf-rev-team">
                {teamList.slice(0,4).map((m,i) => (
                  <span key={i} className="wf-rt-chip">
                    {m.photo ? <img src={m.photo} alt={m.name} /> : <i />}
                    {m.name || tr(lang,"Fără nume","No name")}
                  </span>
                ))}
                {teamList.length > 4 && <span className="wf-more">+{teamList.length-4}</span>}
              </div>
            ) : <span style={{ fontStyle:"italic",color:"var(--wf-text3)" }}>{tr(lang,"Fără secțiune de echipă","No team section")}</span>}
          </div>
        </div>
        <div className="wf-rev-card">
          <button type="button" className="wf-edit" onClick={() => goTo(8)}>{tr(lang,"Editează","Edit")}</button>
          <div className="wf-rk">Social media</div>
          <div className="wf-rv" style={{ fontSize:13 }}>
            {activeSocials.length > 0
              ? activeSocials.map(n => n.label).join(", ")
              : <span style={{ fontStyle:"italic",color:"var(--wf-text3)" }}>{tr(lang,"Nicio rețea adăugată","No networks added")}</span>}
          </div>
        </div>
      </div>

      {isEditMode ? (
        <button type="button" className="wf-btn wf-btn-pay" onClick={onGenerate} disabled={loading} style={{ width:"100%" }}>
          {loading ? tr(lang,"Se regenerează…","Regenerating…") : tr(lang,"Regenerează site-ul →","Regenerate my website →")}
        </button>
      ) : (
        <div style={{ display:"flex", alignItems:"center", gap:16, flexWrap:"wrap" }}>
          <button type="button" className="wf-btn wf-btn-pay" onClick={onGenerate}>
            {tr(lang,"Continuă spre plată →","Continue to payment →")}
          </button>
          <span style={{ fontFamily:"var(--wf-mono)",fontSize:11.5,color:"var(--wf-text3)" }}>
            {tr(lang,"59,99 € plată unică · domeniu separat pe Vercel","€59.99 one-time · domain sold separately on Vercel")}
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

function PaymentOverlay({ data, onCancel, onPay, lang, paymentLoading, paymentError, vercelLoading, vercelConnected, vercelAccount }: {
  data: WizardData; onCancel: () => void; onPay: () => void; lang: Lang;
  paymentLoading: boolean; paymentError: string;
  vercelLoading: boolean; vercelConnected: boolean; vercelAccount: string | null;
}) {
  const handlePay = () => { onPay(); };
  const handleConnectVercel = () => {
    try { localStorage.setItem("wizard_pending_payment", "1"); } catch { /* ignore */ }
  };

  return (
    <div className="wf-overlay">
      <div className="wf-pay-modal">
        {!paymentLoading && <button type="button" className="wf-pay-close" onClick={onCancel} aria-label={tr(lang,"Închide","Close")}><IX /></button>}

        <div className="wf-pay-sum">
          <div className="wf-pay-brand"><span className="wf-pay-badge">6</span> insixlive</div>
          <div className="wf-pay-item">{tr(lang,"Creare & publicare website","Website build & deploy")}</div>
          <div className="wf-pay-price">{tr(lang,"59,99 €","€59.99")}</div>
          <div className="wf-pay-meta">
            {tr(lang,
              "Plată unică · fără abonament. Domeniu neinclu — cumpără separat pe Vercel (~12–30 €/an).",
              "One-time · no subscription. Domain not included — purchase separately on Vercel (~€12–30/yr)."
            )}
          </div>
        </div>

        <div className="wf-pay-body">
          {paymentLoading ? (
            <div style={{ textAlign:"center", padding:"24px 0" }}>
              <div style={{ width:32, height:32, borderRadius:"50%", border:"2.5px solid var(--wf-border)", borderTopColor:"#635bff", animation:"spin .8s linear infinite", margin:"0 auto 14px" }} />
              <p style={{ fontFamily:"var(--wf-mono)", fontSize:13, color:"var(--wf-text2)" }}>
                {tr(lang,"Se pregătește plata…","Preparing checkout…")}
              </p>
            </div>
          ) : vercelLoading ? (
            <div style={{ textAlign:"center", padding:"24px 0" }}>
              <div style={{ width:32, height:32, borderRadius:"50%", border:"2.5px solid var(--wf-border)", borderTopColor:"#635bff", animation:"spin .8s linear infinite", margin:"0 auto 14px" }} />
              <p style={{ fontFamily:"var(--wf-mono)", fontSize:13, color:"var(--wf-text2)" }}>
                {tr(lang,"Se verifică conexiunea Vercel…","Checking Vercel connection…")}
              </p>
            </div>
          ) : !vercelConnected ? (
            <>
              <div style={{ padding:"12px 14px", borderRadius:8, background:"#FFF8F0", border:"1px solid rgba(255,90,31,.25)", color:"#9A3412", fontSize:13, marginBottom:14, lineHeight:1.55 }}>
                {tr(lang,
                  "Înainte de plată, conectează contul tău Vercel. Site-ul se publică doar în contul tău — fără conexiune, generarea nu poate continua.",
                  "Before paying, connect your Vercel account. Your site deploys only to your account — without a connection, generation cannot proceed."
                )}
              </div>
              <div className="wf-pay-lab">{tr(lang,"Pas obligatoriu","Required step")}</div>
              <a
                href="/api/auth/vercel/authorize"
                onClick={handleConnectVercel}
                className="wf-pay-btn"
                style={{ marginBottom: 6, display:"flex", alignItems:"center", justifyContent:"center", gap:8, textDecoration:"none" }}
              >
                <svg width="16" height="14" viewBox="0 0 76 65" fill="currentColor" aria-hidden>
                  <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" />
                </svg>
                {tr(lang,"Conectează cu Vercel","Connect with Vercel")}
              </a>
              <p style={{ fontSize:12.5, color:"var(--wf-text3)", textAlign:"center", lineHeight:1.5, margin:"10px 0 0" }}>
                {tr(lang,
                  "Durează ~10 secunde. Vei reveni aici după autorizare.",
                  "Takes ~10 seconds. You'll return here after authorization."
                )}
              </p>
            </>
          ) : (
            <>
              {vercelAccount && (
                <div style={{ padding:"8px 12px", borderRadius:8, background:"#F0FDF4", border:"1px solid rgba(34,197,94,.25)", color:"#166534", fontSize:12.5, marginBottom:12 }}>
                  {tr(lang,"Vercel conectat:","Vercel connected:")} <strong>{vercelAccount}</strong>
                </div>
              )}
              {paymentError && (
                <div style={{ padding:"10px 14px", borderRadius:8, background:"#FFF0EE", border:"1px solid rgba(255,90,31,.2)", color:"#C43600", fontSize:13, marginBottom:12 }}>
                  {paymentError}
                </div>
              )}
              <div className="wf-pay-lab">{tr(lang,"Plată securizată prin Stripe","Secure payment via Stripe")}</div>
              <button type="button" className="wf-pay-btn" onClick={handlePay} style={{ marginBottom: 6 }}>
                <ILock /> {tr(lang,"Plătește 59,99 €","Pay €59.99")}
              </button>
              <p style={{ fontSize:12.5, color:"var(--wf-text3)", textAlign:"center", lineHeight:1.5, margin:"10px 0 0" }}>
                {tr(lang,
                  "Vei fi redirecționat către Stripe. Card de credit sau debit.",
                  "You'll be redirected to Stripe. Credit or debit card."
                )}
              </p>
              <div className="wf-pay-foot" style={{ marginTop:16 }}>
                {tr(lang,"Procesat de","Powered by")} <b>stripe</b>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Steps config ─────────────────────────────────────────────────────────────


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

const TOTAL = 11; // 11 steps (0–10)

export default function GenerateWizard({ editSiteId }: { editSiteId?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState(() => {
    if (typeof window === "undefined") return 0;
    const saved = parseInt(localStorage.getItem("wizard_step") ?? "0", 10);
    return Number.isFinite(saved) && saved >= 0 && saved < TOTAL ? saved : 0;
  });
  const [data, setData] = useState<WizardData>(DEFAULT);
  const lang: Lang = data.lang ?? "ro";
  const setLang = (l: Lang) => setData(p => ({ ...p, lang: l }));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(100);
  const [stageMsg, setStageMsg] = useState("");
  const [editSiteName, setEditSiteName] = useState("");
  const [showPayment, setShowPayment] = useState(false);
  const [showGenerate, setShowGenerate] = useState(false);
  const dirRef = useRef(1);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isEditMode = !!editSiteId;

  // Persist step so OAuth redirect back to /generate lands on the same step
  useEffect(() => {
    if (!editSiteId) localStorage.setItem("wizard_step", String(step));
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [step, editSiteId]);

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
          websiteLanguage: p.websiteLanguage ?? "Română",
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
        team:          { ...DEFAULT.team,          ...p.team },
        pages:         { ...DEFAULT.pages,         ...p.pages, pageDescriptions: p.pages?.pageDescriptions ?? {} },
        logo:          { ...DEFAULT.logo,          ...p.logo },
        gallery:       p.gallery       ?? [],
        galleryMembers:p.galleryMembers ?? [],
        socials:       p.socials        ?? {},
        useEmojis:     p.useEmojis      ?? false,
        websiteLanguage: p.websiteLanguage ?? "Română",
        lang:          p.lang           ?? "ro",
        business: { ...DEFAULT.business, ...p.business, mapsLink: p.business?.mapsLink ?? "", locationCity: p.business?.locationCity ?? "", locationCountry: p.business?.locationCountry ?? "" },
      });
    } catch { localStorage.removeItem("wizard_data"); }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Save to localStorage (strip base64 images)
  useEffect(() => {
    try {
      const stripped: WizardData = {
        ...data,
        logo:          { ...data.logo, dataUrl: "" },
        gallery:       [],
        galleryMembers: data.galleryMembers.map(m => ({ ...m, photo: "" })),
        team:          { ...data.team, members: data.team.members.map(m => ({ ...m, photo: "" })) },
        pages:         { ...data.pages, pageDescriptions: Object.fromEntries(Object.entries(data.pages.pageDescriptions).map(([k, v]) => [k, { ...v, image: "" }])) },
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

  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [vercelLoading, setVercelLoading] = useState(false);
  const [vercelConnected, setVercelConnected] = useState(false);
  const [vercelAccount, setVercelAccount] = useState<string | null>(null);

  const checkVercelConnection = useCallback(async (): Promise<boolean> => {
    setVercelLoading(true);
    try {
      const res = await fetch("/api/auth/vercel/connection");
      const conn = await res.json().catch(() => ({}));
      const connected = res.ok && !!conn.connected;
      setVercelConnected(connected);
      setVercelAccount(connected ? (conn.account ?? null) : null);
      return connected;
    } catch {
      setVercelConnected(false);
      setVercelAccount(null);
      return false;
    } finally {
      setVercelLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!showPayment) return;
    checkVercelConnection();
  }, [showPayment, checkVercelConnection]);

  useEffect(() => {
    const pendingPayment = typeof window !== "undefined" && localStorage.getItem("wizard_pending_payment") === "1";
    const justAuthorized = searchParams.get("vercel_authorized") === "true";
    if (!pendingPayment && !justAuthorized) return;

    checkVercelConnection().then((connected) => {
      try { localStorage.removeItem("wizard_pending_payment"); } catch { /* ignore */ }
      if (connected) setShowPayment(true);
    });
  }, [searchParams, checkVercelConnection]);

  const handlePayWithStripe = async () => {
    setPaymentLoading(true);
    setPaymentError("");
    try {
      const connected = await checkVercelConnection();
      if (!connected) {
        setPaymentError(
          tr(lang,
            "Conectează contul Vercel înainte de plată.",
            "Connect your Vercel account before paying."
          )
        );
        setPaymentLoading(false);
        return;
      }

      // Save wizard data server-side so the webhook can trigger generation
      // even if the browser redirect back to us fails for any reason.
      await fetch("/api/wizard/save-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data }),
      });
      try { localStorage.setItem("pending_tier", "website"); } catch {}
      // API-created checkout session carries metadata.userId, which is how
      // the webhook and verify-session prove the payment belongs to this user.
      const res = await fetch("/api/checkout/create-session", { method: "POST" });
      const checkout = await res.json().catch(() => ({}));
      if (!res.ok || !checkout.url) {
        throw new Error(checkout.error || "Could not start checkout. Please try again.");
      }
      window.location.href = checkout.url;
    } catch (err) {
      setPaymentError(err instanceof Error ? err.message : "Payment error. Please try again.");
      setPaymentLoading(false);
    }
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

        <div className="wf-kicker">{tr(lang,"Asistent de creare","Build wizard")} · {String(step + 1).padStart(2, "0")}/{TOTAL}</div>
        <div className="wf-prog-rail"><i style={{ width: pct + "%" }} /></div>

        <ul className="wf-stepper">
          {STEP_GROUPS[lang].map(g => (
            <li key={g.label} style={{ listStyle: "none", padding: 0 }}>
              <div className="wf-grp">{g.label}</div>
              {g.steps.map(i => (
                <div key={i} className={`wf-step-item${i === step ? " active" : i < step ? " done" : ""}`}
                  onClick={() => goTo(i)}>
                  <span className="wf-num">
                    {i < step ? <ICheck /> : String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="wf-sname">{STEP_NAMES[lang][i]}</span>
                </div>
              ))}
            </li>
          ))}
        </ul>

        <div className="wf-side-foot">
          <div className="wf-side-save"><span className="wf-sdot" /> {tr(lang,"Progres salvat automat","Progress saved automatically")}</div>
          <div style={{ marginTop: 4 }}>{tr(lang,"Plată unică · publicat pe Vercel-ul tău","One-time · deploys to your Vercel")}</div>
          <div className="wf-lang-toggle" style={{ marginTop: 12 }}>
            <button type="button" className={`wf-lang-btn${lang === "ro" ? " active" : ""}`} onClick={() => setLang("ro")}>RO</button>
            <button type="button" className={`wf-lang-btn${lang === "en" ? " active" : ""}`} onClick={() => setLang("en")}>EN</button>
          </div>
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
            <span className="wf-tbidx">{String(step + 1).padStart(2, "0")}/{TOTAL}</span> {STEP_NAMES[lang][step]}
          </div>
          <div className="wf-tbprog"><div className="wf-tbfill" style={{ width: pct + "%" }} /></div>
        </div>

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
              {step === 0  && <Step01Template    data={data} setData={setData} lang={lang} />}
              {step === 1  && <Step02Design      data={data} setData={setData} lang={lang} />}
              {step === 2  && <Step03Colors      data={data} setData={setData} lang={lang} />}
              {step === 3  && <Step04TypeImagery data={data} setData={setData} lang={lang} />}
              {step === 4  && <Step05Business    data={data} setData={setData} lang={lang} />}
              {step === 5  && <Step06Goals       data={data} setData={setData} lang={lang} />}
              {step === 6  && <Step07Services    data={data} setData={setData} lang={lang} />}
              {step === 7  && <Step08Pages       data={data} setData={setData} lang={lang} />}
              {step === 8  && <Step09MediaSocial data={data} setData={setData} lang={lang} />}
              {step === 9  && <Step09Finishing   data={data} setData={setData} lang={lang} />}
              {step === 10 && (
                <Step10Review
                  data={data} goTo={goTo} onGenerate={handleReviewGenerate}
                  loading={loading} isEditMode={isEditMode} lang={lang}
                />
              )}
            </div>
          </div>
        </div>

        {/* Footer nav */}
        <div className="wf-foot">
          {step > 0 ? (
            <button type="button" className="wf-btn wf-btn-ghost" onClick={back}><IArrowL /> {tr(lang,"Înapoi","Back")}</button>
          ) : (
            <span />
          )}
          <span className="wf-spacer" />
          <span className="wf-save-hint"><span className="wf-sdot" /> {tr(lang,"Salvat","Saved")}</span>
          {step < TOTAL - 1 && (
            <button type="button" className="wf-btn wf-btn-primary" onClick={next}>
              {tr(lang,"Continuă","Continue")} <IArrowR />
            </button>
          )}
        </div>
      </div>

      {/* Payment overlay */}
      {showPayment && (
        <PaymentOverlay
          data={data}
          lang={lang}
          paymentLoading={paymentLoading}
          paymentError={paymentError}
          vercelLoading={vercelLoading}
          vercelConnected={vercelConnected}
          vercelAccount={vercelAccount}
          onCancel={() => { if (!paymentLoading) setShowPayment(false); }}
          onPay={handlePayWithStripe}
        />
      )}

      {/* Generate overlay (edit mode) */}
      {showGenerate && loading && (
        <GenerateOverlay siteName={data.business.name} countdown={countdown} stageMsg={stageMsg} />
      )}
    </div>
  );
}
