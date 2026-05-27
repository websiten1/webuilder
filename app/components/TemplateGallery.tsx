"use client";

import { useState, useEffect, useCallback, useRef } from "react";

/* ─── Types ─────────────────────────────────────────────────────────────────── */
export type TemplateMapTo = {
  businessType: string; style: string;
  primaryColor: string; secondaryColor: string;
  darkMode: boolean; fontFamily: string;
};

type Template = {
  id: string;
  file: string;           // path inside /templates/
  name: string;
  category: string;
  tagline: string;
  accent: string;         // primary accent for the category badge
  dark: boolean;          // dark or light background
  mapTo: TemplateMapTo;
};

/* ─── Template registry ──────────────────────────────────────────────────────── */
const TEMPLATES: Template[] = [
  {
    id: "dentist", file: "01-dentist.html",
    name: "Dental Practice", category: "Healthcare",
    tagline: "Clean, minimal — clinics & medical",
    accent: "#3a8a78", dark: false,
    mapTo: { businessType: "Dental Clinic", style: "minimalist", primaryColor: "#3a8a78", secondaryColor: "#9fd9c8", darkMode: false, fontFamily: "classic-serif" },
  },
  {
    id: "gym-coach", file: "02-gym-coach.html",
    name: "Gym & Coach", category: "Fitness",
    tagline: "Bold, dark — gyms & personal trainers",
    accent: "#ff4d1a", dark: true,
    mapTo: { businessType: "Fitness", style: "bold-dark", primaryColor: "#ff4d1a", secondaryColor: "#f5c542", darkMode: true, fontFamily: "geo-bold" },
  },
  {
    id: "kindergarten", file: "03-kindergarten.html",
    name: "Kindergarten", category: "Education",
    tagline: "Playful, warm — schools & daycares",
    accent: "#ff8b66", dark: false,
    mapTo: { businessType: "Other", style: "playful", primaryColor: "#ff8b66", secondaryColor: "#ffd166", darkMode: false, fontFamily: "playful" },
  },
  {
    id: "coffee-shop", file: "04-coffee-shop.html",
    name: "Coffee Shop", category: "Food & Drink",
    tagline: "Warm, artisan — cafés & tea rooms",
    accent: "#b85c2c", dark: false,
    mapTo: { businessType: "Restaurant", style: "warm", primaryColor: "#b85c2c", secondaryColor: "#f8f2e6", darkMode: false, fontFamily: "classic-serif" },
  },
  {
    id: "fine-dining", file: "05-fine-dining.html",
    name: "Fine Dining", category: "Restaurant",
    tagline: "Elegant, dark — upscale restaurants",
    accent: "#c9a96e", dark: true,
    mapTo: { businessType: "Restaurant", style: "elegant", primaryColor: "#c9a96e", secondaryColor: "#f1ece2", darkMode: true, fontFamily: "classic-serif" },
  },
  {
    id: "bakery", file: "06-bakery.html",
    name: "Bakery", category: "Food & Drink",
    tagline: "Cosy, artisan — bakeries & patisseries",
    accent: "#d4a056", dark: false,
    mapTo: { businessType: "Other", style: "warm", primaryColor: "#d4a056", secondaryColor: "#e9a1a1", darkMode: false, fontFamily: "playful" },
  },
  {
    id: "law-firm", file: "07-law-firm.html",
    name: "Law Firm", category: "Legal",
    tagline: "Authoritative, formal — legal services",
    accent: "#15294a", dark: false,
    mapTo: { businessType: "Law Firm", style: "corporate", primaryColor: "#15294a", secondaryColor: "#a98531", darkMode: false, fontFamily: "classic-serif" },
  },
  {
    id: "real-estate", file: "08-real-estate.html",
    name: "Real Estate", category: "Property",
    tagline: "Natural, trusted — estate agencies",
    accent: "#7d8a6e", dark: false,
    mapTo: { businessType: "Real Estate", style: "minimalist", primaryColor: "#7d8a6e", secondaryColor: "#525e44", darkMode: false, fontFamily: "modern-sans" },
  },
  {
    id: "hair-salon", file: "09-hair-salon.html",
    name: "Hair Salon", category: "Beauty",
    tagline: "Chic, elegant — salons & studios",
    accent: "#b2756a", dark: false,
    mapTo: { businessType: "Hair Salon", style: "elegant", primaryColor: "#b2756a", secondaryColor: "#e8c5b4", darkMode: false, fontFamily: "classic-serif" },
  },
  {
    id: "auto-repair", file: "10-auto-repair.html",
    name: "Auto Repair", category: "Automotive",
    tagline: "Industrial, bold — garages & mechanics",
    accent: "#f5c542", dark: true,
    mapTo: { businessType: "Other", style: "bold-dark", primaryColor: "#f5c542", secondaryColor: "#f37a23", darkMode: true, fontFamily: "geo-bold" },
  },
  {
    id: "vet-clinic", file: "11-vet-clinic.html",
    name: "Vet Clinic", category: "Healthcare",
    tagline: "Caring, warm — vets & pet services",
    accent: "#5c8b6e", dark: false,
    mapTo: { businessType: "Medical Clinic", style: "warm", primaryColor: "#5c8b6e", secondaryColor: "#a5cae0", darkMode: false, fontFamily: "modern-sans" },
  },
  {
    id: "yoga-studio", file: "12-yoga-studio.html",
    name: "Yoga Studio", category: "Wellness",
    tagline: "Calming, earthy — wellness studios",
    accent: "#c87f5b", dark: false,
    mapTo: { businessType: "Fitness", style: "warm", primaryColor: "#c87f5b", secondaryColor: "#7a8a6a", darkMode: false, fontFamily: "classic-serif" },
  },
  {
    id: "tattoo-studio", file: "13-tattoo-studio.html",
    name: "Tattoo Studio", category: "Creative",
    tagline: "Edgy, dark — tattoo & body art",
    accent: "#8a2424", dark: true,
    mapTo: { businessType: "Other", style: "bold-dark", primaryColor: "#8a2424", secondaryColor: "#b89968", darkMode: true, fontFamily: "geo-bold" },
  },
  {
    id: "florist", file: "14-florist.html",
    name: "Florist", category: "Beauty",
    tagline: "Romantic, soft — flower shops",
    accent: "#b97a6f", dark: false,
    mapTo: { businessType: "Other", style: "elegant", primaryColor: "#b97a6f", secondaryColor: "#e1aaa1", darkMode: false, fontFamily: "classic-serif" },
  },
  {
    id: "bookstore", file: "15-bookstore.html",
    name: "Bookstore", category: "Retail",
    tagline: "Literary, warm — bookshops & libraries",
    accent: "#7a2828", dark: false,
    mapTo: { businessType: "Other", style: "elegant", primaryColor: "#7a2828", secondaryColor: "#a25234", darkMode: false, fontFamily: "classic-serif" },
  },
  {
    id: "saas-startup", file: "16-saas-startup.html",
    name: "SaaS Startup", category: "Technology",
    tagline: "Tech-forward, dark — SaaS & startups",
    accent: "#a8ff5c", dark: true,
    mapTo: { businessType: "Tech Startup", style: "futuristic", primaryColor: "#a8ff5c", secondaryColor: "#7a5cff", darkMode: true, fontFamily: "mono" },
  },
  {
    id: "creative-agency", file: "17-creative-agency.html",
    name: "Creative Agency", category: "Creative",
    tagline: "Bold, editorial — agencies & studios",
    accent: "#ff5630", dark: false,
    mapTo: { businessType: "Other", style: "creative", primaryColor: "#ff5630", secondaryColor: "#0a0a0a", darkMode: false, fontFamily: "editorial-serif" },
  },
  {
    id: "personal-portfolio", file: "18-personal-portfolio.html",
    name: "Personal Portfolio", category: "Creative",
    tagline: "Clean, literary — portfolios & CVs",
    accent: "#1f1fbf", dark: false,
    mapTo: { businessType: "Other", style: "minimalist", primaryColor: "#1f1fbf", secondaryColor: "#111", darkMode: false, fontFamily: "modern-sans" },
  },
  {
    id: "consultant-coach", file: "19-consultant-coach.html",
    name: "Consultant & Coach", category: "Creative",
    tagline: "Professional, trust-building — consultants",
    accent: "#2253ff", dark: false,
    mapTo: { businessType: "Other", style: "corporate", primaryColor: "#2253ff", secondaryColor: "#0e1623", darkMode: false, fontFamily: "modern-sans" },
  },
  {
    id: "editorial-blog", file: "20-editorial-blog.html",
    name: "Editorial Blog", category: "Media",
    tagline: "Literary, editorial — blogs & magazines",
    accent: "#b8442e", dark: false,
    mapTo: { businessType: "Other", style: "elegant", primaryColor: "#b8442e", secondaryColor: "#161513", darkMode: false, fontFamily: "classic-serif" },
  },
  {
    id: "podcast", file: "21-podcast.html",
    name: "Podcast", category: "Media",
    tagline: "Bold, editorial — podcasts & audio shows",
    accent: "#ff5a3c", dark: false,
    mapTo: { businessType: "Other", style: "creative", primaryColor: "#ff5a3c", secondaryColor: "#0d0d0d", darkMode: false, fontFamily: "space-grotesk" },
  },
  {
    id: "conference-event", file: "22-conference-event.html",
    name: "Conference & Event", category: "Creative",
    tagline: "Geometric, bold — events & conferences",
    accent: "#2c40ff", dark: false,
    mapTo: { businessType: "Other", style: "minimalist", primaryColor: "#2c40ff", secondaryColor: "#0e0e0e", darkMode: false, fontFamily: "space-grotesk" },
  },
  {
    id: "marketing-landing", file: "23-marketing-landing.html",
    name: "Marketing Landing", category: "Technology",
    tagline: "Conversion-focused — marketing & SaaS",
    accent: "#6e3aff", dark: false,
    mapTo: { businessType: "Tech Startup", style: "modern-clean", primaryColor: "#6e3aff", secondaryColor: "#0a0a14", darkMode: false, fontFamily: "humanist-sans" },
  },
  {
    id: "online-course", file: "24-online-course.html",
    name: "Online Course", category: "Education",
    tagline: "Learning-focused — courses & e-learning",
    accent: "#3a5cff", dark: false,
    mapTo: { businessType: "Other", style: "warm", primaryColor: "#3a5cff", secondaryColor: "#1a1b1f", darkMode: false, fontFamily: "modern-sans" },
  },
  {
    id: "community", file: "25-community.html",
    name: "Community", category: "Creative",
    tagline: "Open, welcoming — communities & networks",
    accent: "#0066ff", dark: false,
    mapTo: { businessType: "Other", style: "minimalist", primaryColor: "#0066ff", secondaryColor: "#111421", darkMode: false, fontFamily: "humanist-sans" },
  },
  {
    id: "ai-product", file: "26-ai-product.html",
    name: "AI Product", category: "Technology",
    tagline: "Minimal, technical — AI & developer tools",
    accent: "#0d9a44", dark: false,
    mapTo: { businessType: "Tech Startup", style: "minimalist", primaryColor: "#0d9a44", secondaryColor: "#0a0a0a", darkMode: false, fontFamily: "mono" },
  },
  {
    id: "mobile-app", file: "27-mobile-app.html",
    name: "Mobile App", category: "Technology",
    tagline: "Fresh, vibrant — mobile & app launches",
    accent: "#ff4d6d", dark: false,
    mapTo: { businessType: "Tech Startup", style: "modern-clean", primaryColor: "#ff4d6d", secondaryColor: "#0a0a14", darkMode: false, fontFamily: "humanist-sans" },
  },
  {
    id: "web3-crypto", file: "28-web3-crypto.html",
    name: "Web3 & Crypto", category: "Technology",
    tagline: "Dark, futuristic — crypto & blockchain",
    accent: "#62ffae", dark: true,
    mapTo: { businessType: "Tech Startup", style: "futuristic", primaryColor: "#62ffae", secondaryColor: "#06070b", darkMode: true, fontFamily: "space-grotesk" },
  },
  {
    id: "job-board", file: "29-job-board.html",
    name: "Job Board", category: "Technology",
    tagline: "Clean, professional — job listings & hiring",
    accent: "#0a8a4e", dark: false,
    mapTo: { businessType: "Other", style: "minimalist", primaryColor: "#0a8a4e", secondaryColor: "#0d1421", darkMode: false, fontFamily: "modern-sans" },
  },
  {
    id: "marketplace", file: "30-marketplace.html",
    name: "Marketplace", category: "Retail",
    tagline: "Bold, clean — e-commerce & marketplaces",
    accent: "#ff5a4a", dark: false,
    mapTo: { businessType: "Other", style: "minimalist", primaryColor: "#ff5a4a", secondaryColor: "#15161a", darkMode: false, fontFamily: "modern-sans" },
  },
  {
    id: "nonprofit", file: "31-nonprofit.html",
    name: "Nonprofit", category: "Creative",
    tagline: "Warm, purposeful — nonprofits & charities",
    accent: "#c44a2b", dark: false,
    mapTo: { businessType: "Other", style: "warm", primaryColor: "#c44a2b", secondaryColor: "#1a1d18", darkMode: false, fontFamily: "editorial-serif" },
  },
  {
    id: "coworking", file: "32-coworking.html",
    name: "Coworking Space", category: "Property",
    tagline: "Warm, communal — coworking & flex offices",
    accent: "#ff7a00", dark: false,
    mapTo: { businessType: "Other", style: "warm", primaryColor: "#ff7a00", secondaryColor: "#15161a", darkMode: false, fontFamily: "humanist-sans" },
  },
  {
    id: "boutique-hotel", file: "33-boutique-hotel.html",
    name: "Boutique Hotel", category: "Wellness",
    tagline: "Luxurious, artisan — boutique hotels & B&Bs",
    accent: "#9d6e3e", dark: false,
    mapTo: { businessType: "Other", style: "elegant", primaryColor: "#9d6e3e", secondaryColor: "#1f1a13", darkMode: false, fontFamily: "luxury-serif" },
  },
  {
    id: "travel-guide", file: "34-travel-guide.html",
    name: "Travel Guide", category: "Media",
    tagline: "Adventurous, editorial — travel & guides",
    accent: "#0a8094", dark: false,
    mapTo: { businessType: "Other", style: "minimalist", primaryColor: "#0a8094", secondaryColor: "#0e1a2b", darkMode: false, fontFamily: "classic-serif" },
  },
  {
    id: "fashion-label", file: "35-fashion-label.html",
    name: "Fashion Label", category: "Retail",
    tagline: "Stark, editorial — fashion & apparel",
    accent: "#a8927a", dark: false,
    mapTo: { businessType: "Other", style: "minimalist", primaryColor: "#a8927a", secondaryColor: "#1a1612", darkMode: false, fontFamily: "geo-bold" },
  },
  {
    id: "skincare", file: "36-skincare.html",
    name: "Skincare", category: "Beauty",
    tagline: "Refined, minimal — skincare & cosmetics",
    accent: "#1f3a2a", dark: false,
    mapTo: { businessType: "Other", style: "elegant", primaryColor: "#1f3a2a", secondaryColor: "#f7f1e8", darkMode: false, fontFamily: "luxury-serif" },
  },
  {
    id: "furniture", file: "37-furniture.html",
    name: "Furniture Store", category: "Retail",
    tagline: "Artisan, editorial — furniture & interiors",
    accent: "#9c5a2a", dark: false,
    mapTo: { businessType: "Other", style: "warm", primaryColor: "#9c5a2a", secondaryColor: "#1a1a1a", darkMode: false, fontFamily: "editorial-serif" },
  },
  {
    id: "plants", file: "38-plants.html",
    name: "Plant Shop", category: "Retail",
    tagline: "Natural, earthy — plant shops & gardens",
    accent: "#3d6e3a", dark: false,
    mapTo: { businessType: "Other", style: "warm", primaryColor: "#3d6e3a", secondaryColor: "#16201a", darkMode: false, fontFamily: "editorial-serif" },
  },
  {
    id: "wine-shop", file: "39-wine-shop.html",
    name: "Wine Shop", category: "Restaurant",
    tagline: "Luxurious, dark — wine bars & spirits",
    accent: "#c89758", dark: true,
    mapTo: { businessType: "Restaurant", style: "elegant", primaryColor: "#c89758", secondaryColor: "#1a1410", darkMode: true, fontFamily: "luxury-serif" },
  },
  {
    id: "cleaning-service", file: "40-cleaning-service.html",
    name: "Cleaning Service", category: "Wellness",
    tagline: "Fresh, professional — cleaning & hygiene",
    accent: "#1ea7c5", dark: false,
    mapTo: { businessType: "Other", style: "minimalist", primaryColor: "#1ea7c5", secondaryColor: "#0d1e2b", darkMode: false, fontFamily: "humanist-sans" },
  },
  {
    id: "moving-service", file: "41-moving-service.html",
    name: "Moving Service", category: "Property",
    tagline: "Bold, reliable — moving & logistics",
    accent: "#ff5e00", dark: false,
    mapTo: { businessType: "Other", style: "modern-clean", primaryColor: "#ff5e00", secondaryColor: "#1a1a1a", darkMode: false, fontFamily: "geo-bold" },
  },
  {
    id: "photography", file: "42-photography.html",
    name: "Photography Studio", category: "Creative",
    tagline: "Refined, artistic — photographers & studios",
    accent: "#3a3a3a", dark: false,
    mapTo: { businessType: "Other", style: "minimalist", primaryColor: "#1a1a1a", secondaryColor: "#cdc4b5", darkMode: false, fontFamily: "luxury-serif" },
  },
];

const CATEGORIES = ["All", "Healthcare", "Fitness", "Wellness", "Education", "Food & Drink", "Restaurant", "Beauty", "Legal", "Property", "Automotive", "Retail", "Creative", "Media", "Technology"];

/* ─── Scaled iframe card preview ─────────────────────────────────────────────── */
// We design at 1280px wide and scale down to fit the card.
const DESIGN_W = 1280;
const DESIGN_H = 820;

function CardPreview({ template, cardWidth }: { template: Template; cardWidth: number }) {
  const scale = cardWidth / DESIGN_W;
  const displayH = Math.round(DESIGN_H * scale);

  return (
    <div style={{ width: cardWidth, height: displayH, overflow: "hidden", position: "relative", background: template.dark ? "#0a0a0a" : "#fafafa" }}>
      <iframe
        src={`/templates/${template.file}`}
        scrolling="no"
        style={{
          width: DESIGN_W,
          height: DESIGN_H,
          border: "none",
          transformOrigin: "top left",
          transform: `scale(${scale})`,
          pointerEvents: "none",
          display: "block",
        }}
        title={template.name}
        loading="lazy"
      />
    </div>
  );
}

/* ─── Template card ──────────────────────────────────────────────────────────── */
function TemplateCard({ template, isSelected, cardWidth, onPreview, onSelect }: {
  template: Template;
  isSelected: boolean;
  cardWidth: number;
  onPreview: () => void;
  onSelect: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const displayH = Math.round(DESIGN_H * (cardWidth / DESIGN_W));

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius: 12,
        overflow: "hidden",
        border: isSelected ? "2.5px solid #6366f1" : "2.5px solid transparent",
        boxShadow: isSelected
          ? "0 0 0 4px rgba(99,102,241,0.2), 0 8px 32px rgba(10,14,20,0.12)"
          : hovered
          ? "0 16px 48px rgba(10,14,20,0.16)"
          : "0 2px 8px rgba(10,14,20,0.07)",
        transition: "box-shadow 0.2s, transform 0.2s, border-color 0.15s",
        transform: hovered ? "translateY(-4px)" : "none",
        cursor: "pointer",
        background: "#fff",
      }}
    >
      {/* Preview */}
      <div style={{ position: "relative" }}>
        <CardPreview template={template} cardWidth={cardWidth}/>

        {/* Selected badge */}
        {isSelected && (
          <div style={{
            position: "absolute", top: 10, right: 10,
            width: 26, height: 26, borderRadius: 13,
            background: "#6366f1",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 14, color: "#fff",
            boxShadow: "0 2px 8px rgba(99,102,241,0.4)",
          }}>✓</div>
        )}

        {/* Hover overlay */}
        <div style={{
          position: "absolute", inset: 0,
          background: "rgba(10,14,20,0.65)",
          backdropFilter: "blur(3px)",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          gap: 10,
          opacity: hovered ? 1 : 0,
          transition: "opacity 0.18s",
          pointerEvents: hovered ? "auto" : "none",
        }}>
          <button
            onClick={(e) => { e.stopPropagation(); onPreview(); }}
            style={{
              width: 160, height: 42, borderRadius: 9,
              border: "1.5px solid rgba(255,255,255,0.8)",
              background: "transparent", color: "#fff",
              fontSize: 13, fontWeight: 600, cursor: "pointer",
              letterSpacing: 0.1,
            }}
          >
            Full preview
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onSelect(); }}
            style={{
              width: 160, height: 42, borderRadius: 9,
              border: "none",
              background: "#fff", color: "#0A0E14",
              fontSize: 13, fontWeight: 700, cursor: "pointer",
            }}
          >
            Use template
          </button>
        </div>
      </div>

      {/* Label row */}
      <div style={{
        padding: "11px 14px 12px",
        background: "#fff",
        borderTop: "1px solid #F0EDE8",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#0A0E14", letterSpacing: -0.2 }}>{template.name}</p>
          <p style={{ margin: "2px 0 0", fontSize: 11, color: "#8a8c93", fontFamily: "monospace" }}>{template.category}</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 10, height: 10, borderRadius: 5, background: template.accent }}/>
          {isSelected && <span style={{ fontSize: 11, color: "#6366f1", fontWeight: 600 }}>Selected</span>}
        </div>
      </div>
    </div>
  );
}

/* ─── Full preview modal ─────────────────────────────────────────────────────── */
function PreviewModal({ template, allTemplates, selectedId, onClose, onSelect }: {
  template: Template;
  allTemplates: Template[];
  selectedId: string;
  onClose: () => void;
  onSelect: (id: string, mapTo: TemplateMapTo) => void;
}) {
  const idx = allTemplates.findIndex(t => t.id === template.id);
  const [current, setCurrent] = useState(idx);
  const t = allTemplates[current];
  const isSelected = selectedId === t.id;

  const prev = useCallback(() => setCurrent(i => (i - 1 + allTemplates.length) % allTemplates.length), [allTemplates.length]);
  const next = useCallback(() => setCurrent(i => (i + 1) % allTemplates.length), [allTemplates.length]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, prev, next]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "rgba(8,10,14,0.92)",
      backdropFilter: "blur(10px)",
      WebkitBackdropFilter: "blur(10px)",
      display: "flex", flexDirection: "column",
      animation: "tg-modal-in 0.2s ease-out",
    }}>
      {/* Top bar */}
      <div style={{
        height: 56, flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 24px",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
      }}>
        {/* Nav arrows + counter */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={prev} style={arrowBtn}>←</button>
          <button onClick={next} style={arrowBtn}>→</button>
          <span style={{ fontFamily: "monospace", fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
            {current + 1} / {allTemplates.length}
          </span>
        </div>

        {/* Template info */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 10, height: 10, borderRadius: 5, background: t.accent }}/>
          <span style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>{t.name}</span>
          <span style={{ fontFamily: "monospace", fontSize: 11, color: "rgba(255,255,255,0.4)", padding: "2px 8px", background: "rgba(255,255,255,0.06)", borderRadius: 4 }}>{t.category}</span>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            onClick={() => { onSelect(t.id, t.mapTo); onClose(); }}
            style={{
              height: 38, padding: "0 20px", borderRadius: 9,
              border: isSelected ? "1px solid rgba(99,102,241,0.4)" : "none",
              background: isSelected ? "rgba(99,102,241,0.2)" : "#fff",
              color: isSelected ? "#a5b4fc" : "#0A0E14",
              fontSize: 13, fontWeight: 700, cursor: "pointer",
              display: "flex", alignItems: "center", gap: 8,
            } as React.CSSProperties}
          >
            {isSelected ? "✓ Selected" : "Use this template"}
          </button>
          <button onClick={onClose} style={{
            width: 38, height: 38, borderRadius: 9,
            background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)",
            color: "rgba(255,255,255,0.7)", fontSize: 17, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>✕</button>
        </div>
      </div>

      {/* Main preview area */}
      <div style={{ flex: 1, overflow: "hidden", position: "relative", display: "flex" }}>
        {/* Browser chrome wrapper */}
        <div style={{
          flex: 1, display: "flex", flexDirection: "column",
          margin: "20px 24px",
          borderRadius: 12, overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 32px 80px rgba(0,0,0,0.6)",
        }}>
          {/* Browser chrome bar */}
          <div style={{
            height: 38, flexShrink: 0,
            background: "#1e2028",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            display: "flex", alignItems: "center",
            padding: "0 14px", gap: 8,
          }}>
            <div style={{ display: "flex", gap: 6 }}>
              {["#FF5F57","#FEBC2E","#28C840"].map(c => (
                <span key={c} style={{ width: 11, height: 11, borderRadius: 6, background: c, display: "block" }}/>
              ))}
            </div>
            <div style={{
              flex: 1, maxWidth: 420, margin: "0 auto",
              height: 24, background: "rgba(255,255,255,0.06)",
              borderRadius: 6, display: "flex", alignItems: "center",
              paddingLeft: 10, gap: 6,
            }}>
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.25)" }}>🔒</span>
              <span style={{ fontFamily: "monospace", fontSize: 11, color: "rgba(255,255,255,0.35)" }}>
                yourwebsite.com
              </span>
            </div>
          </div>

          {/* Iframe — actual template */}
          <div style={{ flex: 1, overflow: "auto", background: t.dark ? "#0a0a0a" : "#fafafa" }}>
            <iframe
              key={t.id}
              src={`/templates/${t.file}`}
              style={{
                width: "100%",
                height: "100%",
                minHeight: 900,
                border: "none",
                display: "block",
              }}
              title={`Preview: ${t.name}`}
            />
          </div>
        </div>
      </div>

      {/* Bottom dot navigation */}
      <div style={{
        height: 48, flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
        borderTop: "1px solid rgba(255,255,255,0.06)",
      }}>
        {allTemplates.map((tmpl, i) => (
          <button
            key={tmpl.id}
            onClick={() => setCurrent(i)}
            title={tmpl.name}
            style={{
              width: i === current ? 22 : 7,
              height: 7,
              borderRadius: 4,
              background: i === current ? t.accent : "rgba(255,255,255,0.2)",
              border: "none", cursor: "pointer",
              transition: "all 0.2s",
            }}
          />
        ))}
        <span style={{ marginLeft: 12, fontFamily: "monospace", fontSize: 10, color: "rgba(255,255,255,0.25)" }}>
          ← → keys to navigate · Esc to close
        </span>
      </div>
    </div>
  );
}

const arrowBtn: React.CSSProperties = {
  width: 34, height: 34, borderRadius: 8,
  background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)",
  color: "rgba(255,255,255,0.7)", fontSize: 15, cursor: "pointer",
  display: "flex", alignItems: "center", justifyContent: "center",
};

/* ─── Scratch option ─────────────────────────────────────────────────────────── */
function ScratchCard({ isSelected, cardWidth, onSelect }: {
  isSelected: boolean; cardWidth: number; onSelect: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const displayH = Math.round(DESIGN_H * (cardWidth / DESIGN_W));
  return (
    <div
      onClick={onSelect}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius: 12, overflow: "hidden", cursor: "pointer",
        border: isSelected ? "2.5px solid #6366f1" : "2.5px dashed #D8D2C2",
        boxShadow: isSelected ? "0 0 0 4px rgba(99,102,241,0.2)" : "none",
        transition: "all 0.2s",
        transform: hovered ? "translateY(-4px)" : "none",
        background: "#fff",
      }}
    >
      <div style={{
        height: displayH,
        background: hovered ? "#F3F0E9" : "#FAFAF7",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: 14,
        transition: "background 0.2s",
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: 16,
          background: "#fff", border: "1px solid #E8E3D6",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 24, boxShadow: "0 4px 12px rgba(10,14,20,0.06)",
        }}>✦</div>
        <div style={{ textAlign: "center", padding: "0 24px" }}>
          <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#0A0E14" }}>Start from scratch</p>
          <p style={{ margin: "6px 0 0", fontSize: 13, color: "#6B7180", lineHeight: 1.5 }}>
            Choose your own colours, fonts, and style in the next steps
          </p>
        </div>
      </div>
      <div style={{ padding: "11px 14px 12px", background: "#fff", borderTop: "1px solid #F0EDE8" }}>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#0A0E14" }}>Custom design</p>
        <p style={{ margin: "2px 0 0", fontSize: 11, color: "#8a8c93", fontFamily: "monospace" }}>All industries</p>
      </div>
    </div>
  );
}

/* ─── Main gallery component ─────────────────────────────────────────────────── */
export function TemplateGallery({ selectedId, onSelect }: {
  selectedId: string;
  onSelect: (id: string, mapTo: TemplateMapTo) => void;
}) {
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [activeCategory, setActiveCategory] = useState("All");
  const gridRef = useRef<HTMLDivElement>(null);
  const [cardWidth, setCardWidth] = useState(200);

  // Measure grid to compute card width
  useEffect(() => {
    const measure = () => {
      if (!gridRef.current) return;
      const w = gridRef.current.clientWidth;
      // 3 cols, 14px gaps
      setCardWidth(Math.floor((w - 28) / 3));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const filtered = activeCategory === "All"
    ? TEMPLATES
    : TEMPLATES.filter(t => t.category === activeCategory);

  const handleClear = () => onSelect("", {
    businessType: "Restaurant", style: "minimalist",
    primaryColor: "#6366f1", secondaryColor: "#a855f7",
    darkMode: false, fontFamily: "modern-sans",
  });

  return (
    <>
      <style>{`
        @keyframes tg-fade { from { opacity:0; transform:translateY(6px) } to { opacity:1; transform:translateY(0) } }
        @keyframes tg-modal-in { from { opacity:0 } to { opacity:1 } }
        .tg-item { animation: tg-fade 0.3s ease-out both; }
      `}</style>

      {/* Category filter */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 18 }}>
        {CATEGORIES.map(cat => {
          const on = activeCategory === cat;
          return (
            <button key={cat} onClick={() => setActiveCategory(cat)} style={{
              height: 28, padding: "0 12px", borderRadius: 7,
              border: on ? "none" : "1px solid #E8E3D6",
              background: on ? "#0A0E14" : "transparent",
              color: on ? "#fff" : "#6B7180",
              fontSize: 12, fontWeight: on ? 600 : 500,
              cursor: "pointer", transition: "all 0.15s",
              fontFamily: "system-ui, sans-serif",
            }}>
              {cat}
            </button>
          );
        })}
      </div>

      {/* Grid */}
      <div
        ref={gridRef}
        style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}
      >
        {filtered.map((t, i) => (
          <div key={t.id} className="tg-item" style={{ animationDelay: `${i * 0.035}s` }}>
            <TemplateCard
              template={t}
              isSelected={selectedId === t.id}
              cardWidth={cardWidth}
              onPreview={() => setPreviewTemplate(t)}
              onSelect={() => onSelect(t.id, t.mapTo)}
            />
          </div>
        ))}

        {activeCategory === "All" && (
          <div className="tg-item" style={{ animationDelay: `${filtered.length * 0.035}s` }}>
            <ScratchCard
              isSelected={!selectedId}
              cardWidth={cardWidth}
              onSelect={handleClear}
            />
          </div>
        )}
      </div>

      {/* Selection banner */}
      {selectedId && (
        <div style={{
          marginTop: 14, padding: "10px 16px",
          background: "rgba(99,102,241,0.08)",
          border: "1px solid rgba(99,102,241,0.22)",
          borderRadius: 10,
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ color: "#6366f1", fontSize: 14 }}>✓</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#0A0E14" }}>
              {TEMPLATES.find(t => t.id === selectedId)?.name ?? "Template"} selected
            </span>
            <span style={{ fontSize: 11, color: "#6B7180" }}>
              — {TEMPLATES.find(t => t.id === selectedId)?.tagline}
            </span>
          </div>
          <button onClick={handleClear} style={{
            fontSize: 12, color: "#6B7180", background: "none",
            border: "none", cursor: "pointer", textDecoration: "underline",
          }}>
            Clear
          </button>
        </div>
      )}

      {/* Modal */}
      {previewTemplate && (
        <PreviewModal
          template={previewTemplate}
          allTemplates={TEMPLATES}
          selectedId={selectedId}
          onClose={() => setPreviewTemplate(null)}
          onSelect={(id, mapTo) => { onSelect(id, mapTo); }}
        />
      )}
    </>
  );
}
