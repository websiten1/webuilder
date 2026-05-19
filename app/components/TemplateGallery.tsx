"use client";

import { useState, useEffect, useCallback } from "react";

/* ─── Types ─────────────────────────────────────────────────────────────────── */
export type TemplateMapTo = {
  businessType: string; style: string;
  primaryColor: string; secondaryColor: string;
  darkMode: boolean; fontFamily: string;
};

type Feature = { icon: string; title: string; desc: string };

type TemplateDesign = {
  id: string; name: string; category: string; tagline: string;
  // palette
  bg: string; navBg: string; navText: string; navMuted: string;
  hero: string; headingColor: string; bodyColor: string;
  primary: string; ctaText: string; cardBg: string; cardBorder: string;
  dark: boolean;
  // copy
  brand: string; navLinks: string[];
  eyebrow: string; headline: string[]; subtext: string; cta: string;
  features: Feature[];
  mapTo: TemplateMapTo;
};

/* ─── Template data ──────────────────────────────────────────────────────────── */
const DESIGNS: TemplateDesign[] = [
  {
    id: "dentist", name: "Dental Practice", category: "Healthcare",
    tagline: "Clean, trustworthy — ideal for clinics & medical practices",
    bg: "#f6faf8", navBg: "#ffffff", navText: "#0e2a26", navMuted: "#5a7570",
    hero: "#f6faf8", headingColor: "#0e2a26", bodyColor: "#5a7570",
    primary: "#3a8a78", ctaText: "#ffffff", cardBg: "#ffffff", cardBorder: "#dceae5", dark: false,
    brand: "BrightSmile Dental", navLinks: ["Services", "About", "Booking"],
    eyebrow: "Trusted dental care", headline: ["Healthy Smiles,", "Brighter Lives."],
    subtext: "Comprehensive family dentistry with a gentle touch.", cta: "Book Appointment",
    features: [
      { icon: "◈", title: "General Dentistry", desc: "Cleanings & preventive care" },
      { icon: "✦", title: "Cosmetic", desc: "Whitening & veneers" },
      { icon: "⊕", title: "Emergency", desc: "Same-day appointments" },
    ],
    mapTo: { businessType: "Dental Clinic", style: "minimalist", primaryColor: "#3a8a78", secondaryColor: "#9fd9c8", darkMode: false, fontFamily: "classic-serif" },
  },
  {
    id: "gym-coach", name: "Gym & Fitness", category: "Fitness",
    tagline: "Bold, high-energy — for gyms, coaches & personal trainers",
    bg: "#0d0d0d", navBg: "#0d0d0d", navText: "#f5f1ea", navMuted: "#8a8580",
    hero: "#0d0d0d", headingColor: "#f5f1ea", bodyColor: "#8a8580",
    primary: "#ff4d1a", ctaText: "#ffffff", cardBg: "#161412", cardBorder: "#1f1d1b", dark: true,
    brand: "ForgeElite Gym", navLinks: ["Programs", "Coaches", "Book"],
    eyebrow: "Train harder", headline: ["Forge Your", "Best Self."],
    subtext: "Elite coaching, real results. Join 2,000+ members transforming their lives.", cta: "Start Free Trial",
    features: [
      { icon: "◈", title: "HIIT & Strength", desc: "Expert-led daily classes" },
      { icon: "✦", title: "Nutrition Plans", desc: "Custom meal strategies" },
      { icon: "⊕", title: "1-on-1 Coaching", desc: "Dedicated personal trainer" },
    ],
    mapTo: { businessType: "Fitness", style: "bold-dark", primaryColor: "#ff4d1a", secondaryColor: "#f5c542", darkMode: true, fontFamily: "geo-bold" },
  },
  {
    id: "kindergarten", name: "Kindergarten", category: "Education",
    tagline: "Playful, colorful — for schools, daycares & learning centres",
    bg: "#fff8ec", navBg: "#fffaf0", navText: "#2a2046", navMuted: "#6f6488",
    hero: "#fff8ec", headingColor: "#2a2046", bodyColor: "#6f6488",
    primary: "#ff8b66", ctaText: "#ffffff", cardBg: "#fffaf0", cardBorder: "#ecdfca", dark: false,
    brand: "Sunshine Academy", navLinks: ["Programs", "Gallery", "Enroll"],
    eyebrow: "Ages 2–6", headline: ["Where Little", "Minds Bloom."],
    subtext: "A nurturing space where curiosity meets creativity every single day.", cta: "Schedule a Visit",
    features: [
      { icon: "◈", title: "Play-Based Learning", desc: "Curiosity-first curriculum" },
      { icon: "✦", title: "Certified Teachers", desc: "Experienced early educators" },
      { icon: "⊕", title: "Safe Environment", desc: "Monitored, caring space" },
    ],
    mapTo: { businessType: "Other", style: "playful", primaryColor: "#ff8b66", secondaryColor: "#ffd166", darkMode: false, fontFamily: "playful" },
  },
  {
    id: "coffee-shop", name: "Coffee Shop", category: "Food & Drink",
    tagline: "Warm, artisan — for cafés, tea rooms & specialty drinks",
    bg: "#f3ece1", navBg: "#f8f2e6", navText: "#2a1d12", navMuted: "#7a6a58",
    hero: "#f3ece1", headingColor: "#2a1d12", bodyColor: "#7a6a58",
    primary: "#b85c2c", ctaText: "#ffffff", cardBg: "#f8f2e6", cardBorder: "#e3d6c1", dark: false,
    brand: "Ember & Bean", navLinks: ["Menu", "Reserve", "Story"],
    eyebrow: "Specialty coffee", headline: ["Every Cup", "Tells a Story."],
    subtext: "Single-origin beans, slow-roasted with care. Your ritual starts here.", cta: "See Our Menu",
    features: [
      { icon: "◈", title: "Single Origin", desc: "Sourced from 12 farms" },
      { icon: "✦", title: "House Roasted", desc: "Fresh weekly batches" },
      { icon: "⊕", title: "Seasonal Menu", desc: "New drinks each season" },
    ],
    mapTo: { businessType: "Restaurant", style: "warm", primaryColor: "#b85c2c", secondaryColor: "#f8f2e6", darkMode: false, fontFamily: "classic-serif" },
  },
  {
    id: "fine-dining", name: "Fine Dining", category: "Restaurant",
    tagline: "Elegant, dark luxury — for restaurants & high-end dining",
    bg: "#0a0a0a", navBg: "#0a0a0a", navText: "#f1ece2", navMuted: "#8a8378",
    hero: "#0a0a0a", headingColor: "#f1ece2", bodyColor: "#8a8378",
    primary: "#c9a96e", ctaText: "#0a0a0a", cardBg: "#141210", cardBorder: "#1f1d1a", dark: true,
    brand: "Maison Laurent", navLinks: ["Menu", "Events", "Reserve"],
    eyebrow: "Michelin-starred dining", headline: ["An Unforgettable", "Experience."],
    subtext: "Seasonal French cuisine crafted with rare ingredients and meticulous technique.", cta: "Reserve a Table",
    features: [
      { icon: "◈", title: "Tasting Menu", desc: "8-course chef's selection" },
      { icon: "✦", title: "Wine Cellar", desc: "3,000+ curated labels" },
      { icon: "⊕", title: "Private Events", desc: "Intimate dining spaces" },
    ],
    mapTo: { businessType: "Restaurant", style: "elegant", primaryColor: "#c9a96e", secondaryColor: "#f1ece2", darkMode: true, fontFamily: "classic-serif" },
  },
  {
    id: "bakery", name: "Bakery & Patisserie", category: "Food & Drink",
    tagline: "Warm & artisan — for bakeries, patisseries & food shops",
    bg: "#fbf3ea", navBg: "#fff8ed", navText: "#3c2820", navMuted: "#8d7363",
    hero: "#fbf3ea", headingColor: "#3c2820", bodyColor: "#8d7363",
    primary: "#d4a056", ctaText: "#ffffff", cardBg: "#fff8ed", cardBorder: "#e9dcc9", dark: false,
    brand: "La Petite Miette", navLinks: ["Menu", "Order", "About"],
    eyebrow: "Handmade daily", headline: ["Baked with", "Love Since 1985."],
    subtext: "Traditional recipes, local flour, and a kitchen full of good intentions.", cta: "Order Online",
    features: [
      { icon: "◈", title: "Sourdough Breads", desc: "72-hour fermented doughs" },
      { icon: "✦", title: "Viennoiserie", desc: "Croissants & pastries daily" },
      { icon: "⊕", title: "Custom Cakes", desc: "Celebrations & weddings" },
    ],
    mapTo: { businessType: "Other", style: "warm", primaryColor: "#d4a056", secondaryColor: "#e9a1a1", darkMode: false, fontFamily: "playful" },
  },
  {
    id: "law-firm", name: "Law Firm", category: "Legal",
    tagline: "Authoritative, corporate — for law firms & legal services",
    bg: "#f5f3ee", navBg: "#15294a", navText: "#ffffff", navMuted: "rgba(255,255,255,0.6)",
    hero: "#f5f3ee", headingColor: "#0e1a2b", bodyColor: "#5a6478",
    primary: "#15294a", ctaText: "#ffffff", cardBg: "#ffffff", cardBorder: "#dad4c8", dark: false,
    brand: "Morrison & Cole LLP", navLinks: ["Practice Areas", "Team", "Contact"],
    eyebrow: "Trusted legal counsel", headline: ["Your Rights,", "Fiercely Protected."],
    subtext: "30 years of expertise across commercial litigation, M&A, and regulatory law.", cta: "Schedule Consultation",
    features: [
      { icon: "◈", title: "Commercial Law", desc: "Contracts & compliance" },
      { icon: "✦", title: "Litigation", desc: "Court & arbitration" },
      { icon: "⊕", title: "M&A Advisory", desc: "Deals from $1M to $1B" },
    ],
    mapTo: { businessType: "Law Firm", style: "corporate", primaryColor: "#15294a", secondaryColor: "#a98531", darkMode: false, fontFamily: "classic-serif" },
  },
  {
    id: "real-estate", name: "Real Estate", category: "Property",
    tagline: "Natural, trustworthy — for estate agents & property firms",
    bg: "#eef0eb", navBg: "#eef0eb", navText: "#1a2218", navMuted: "#697063",
    hero: "#eef0eb", headingColor: "#1a2218", bodyColor: "#697063",
    primary: "#7d8a6e", ctaText: "#ffffff", cardBg: "#ffffff", cardBorder: "#d5d8cd", dark: false,
    brand: "Verdant Estates", navLinks: ["Buy", "Sell", "Rentals", "Team"],
    eyebrow: "Property specialists", headline: ["Find Your", "Perfect Home."],
    subtext: "Curated properties across the city. Expert guidance from first view to final key.", cta: "Browse Listings",
    features: [
      { icon: "◈", title: "500+ Listings", desc: "Updated daily" },
      { icon: "✦", title: "Market Reports", desc: "Neighbourhood insights" },
      { icon: "⊕", title: "Free Valuation", desc: "No obligation quotes" },
    ],
    mapTo: { businessType: "Real Estate", style: "minimalist", primaryColor: "#7d8a6e", secondaryColor: "#525e44", darkMode: false, fontFamily: "modern-sans" },
  },
  {
    id: "hair-salon", name: "Hair Salon", category: "Beauty",
    tagline: "Chic & elegant — for salons, spas & beauty studios",
    bg: "#f6efe9", navBg: "#fcf7f2", navText: "#231711", navMuted: "#7a655a",
    hero: "#f6efe9", headingColor: "#231711", bodyColor: "#7a655a",
    primary: "#b2756a", ctaText: "#ffffff", cardBg: "#fcf7f2", cardBorder: "#e5d6ca", dark: false,
    brand: "Atelier Rouge", navLinks: ["Services", "Book", "Gallery"],
    eyebrow: "Award-winning salon", headline: ["Style Meets", "Artistry."],
    subtext: "Transform your look with our team of internationally trained stylists.", cta: "Book Your Visit",
    features: [
      { icon: "◈", title: "Cut & Style", desc: "From £55" },
      { icon: "✦", title: "Colour & Balayage", desc: "From £85" },
      { icon: "⊕", title: "Treatments", desc: "Keratin & Olaplex" },
    ],
    mapTo: { businessType: "Hair Salon", style: "elegant", primaryColor: "#b2756a", secondaryColor: "#e8c5b4", darkMode: false, fontFamily: "classic-serif" },
  },
  {
    id: "auto-repair", name: "Auto Repair", category: "Automotive",
    tagline: "Industrial, bold — for garages, mechanics & auto shops",
    bg: "#161614", navBg: "#1d1d1a", navText: "#f4f1e8", navMuted: "#8a867b",
    hero: "#161614", headingColor: "#f4f1e8", bodyColor: "#8a867b",
    primary: "#f5c542", ctaText: "#161614", cardBg: "#1d1d1a", cardBorder: "#2e2d29", dark: true,
    brand: "Apex Garage", navLinks: ["Services", "Booking", "About"],
    eyebrow: "Certified mechanics", headline: ["Your Car, Our", "Expertise."],
    subtext: "Honest diagnostics, transparent pricing, and work guaranteed for 12 months.", cta: "Book a Service",
    features: [
      { icon: "◈", title: "Full Service", desc: "Oil, brakes & tyres" },
      { icon: "✦", title: "Diagnostics", desc: "All makes & models" },
      { icon: "⊕", title: "MOT & Bodywork", desc: "Next-day bookings" },
    ],
    mapTo: { businessType: "Other", style: "bold-dark", primaryColor: "#f5c542", secondaryColor: "#f37a23", darkMode: true, fontFamily: "geo-bold" },
  },
  {
    id: "vet-clinic", name: "Vet Clinic", category: "Healthcare",
    tagline: "Caring, warm — for vets, pet care & animal services",
    bg: "#f4f7f2", navBg: "#ffffff", navText: "#1f2a23", navMuted: "#6c7a70",
    hero: "#f4f7f2", headingColor: "#1f2a23", bodyColor: "#6c7a70",
    primary: "#5c8b6e", ctaText: "#ffffff", cardBg: "#ffffff", cardBorder: "#cdddd4", dark: false,
    brand: "Paws & Care Vet", navLinks: ["Services", "Team", "Book"],
    eyebrow: "Compassionate care", headline: ["Your Pet's Health,", "Our Mission."],
    subtext: "Comprehensive veterinary care for cats, dogs, and small animals.", cta: "Book an Appointment",
    features: [
      { icon: "◈", title: "Wellness Checks", desc: "Annual health reviews" },
      { icon: "✦", title: "Surgery", desc: "Routine & emergency ops" },
      { icon: "⊕", title: "Dental Care", desc: "Pet teeth cleaning" },
    ],
    mapTo: { businessType: "Medical Clinic", style: "warm", primaryColor: "#5c8b6e", secondaryColor: "#a5cae0", darkMode: false, fontFamily: "modern-sans" },
  },
  {
    id: "yoga-studio", name: "Yoga Studio", category: "Wellness",
    tagline: "Calming, earthy — for yoga, mindfulness & wellness studios",
    bg: "#e8e0d2", navBg: "#f5efe1", navText: "#2a261f", navMuted: "#736959",
    hero: "#e8e0d2", headingColor: "#2a261f", bodyColor: "#736959",
    primary: "#c87f5b", ctaText: "#ffffff", cardBg: "#f5efe1", cardBorder: "#d6cdba", dark: false,
    brand: "Sattva Studio", navLinks: ["Classes", "Teachers", "Retreats"],
    eyebrow: "Mind · Body · Soul", headline: ["Find Your", "Balance."],
    subtext: "Daily yoga, meditation, and breathwork classes for every level.", cta: "View Timetable",
    features: [
      { icon: "◈", title: "Hot Yoga", desc: "26-posture bikram series" },
      { icon: "✦", title: "Vinyasa Flow", desc: "Dynamic movement practice" },
      { icon: "⊕", title: "Meditation", desc: "Daily guided sessions" },
    ],
    mapTo: { businessType: "Fitness", style: "warm", primaryColor: "#c87f5b", secondaryColor: "#7a8a6a", darkMode: false, fontFamily: "classic-serif" },
  },
  {
    id: "tattoo-studio", name: "Tattoo Studio", category: "Creative",
    tagline: "Edgy, dark — for tattoo studios, piercing & body art",
    bg: "#0a0a0a", navBg: "#13110f", navText: "#efe8db", navMuted: "#7a7367",
    hero: "#0a0a0a", headingColor: "#efe8db", bodyColor: "#7a7367",
    primary: "#8a2424", ctaText: "#efe8db", cardBg: "#13110f", cardBorder: "#1d1c1a", dark: true,
    brand: "Inkwell Studio", navLinks: ["Artists", "Portfolio", "Book"],
    eyebrow: "Custom fine-line art", headline: ["Art That", "Lasts Forever."],
    subtext: "Award-winning tattoo artists specialising in fine-line, realism, and neo-traditional.", cta: "Book a Consultation",
    features: [
      { icon: "◈", title: "Fine Line", desc: "Delicate precision work" },
      { icon: "✦", title: "Realism", desc: "Portrait & photorealistic" },
      { icon: "⊕", title: "Neo-Traditional", desc: "Bold illustrative style" },
    ],
    mapTo: { businessType: "Other", style: "bold-dark", primaryColor: "#8a2424", secondaryColor: "#b89968", darkMode: true, fontFamily: "geo-bold" },
  },
  {
    id: "florist", name: "Florist", category: "Beauty",
    tagline: "Romantic, delicate — for florists, flower shops & events",
    bg: "#f5f0ea", navBg: "#fbf7f0", navText: "#2c2a23", navMuted: "#7a7466",
    hero: "#f5f0ea", headingColor: "#2c2a23", bodyColor: "#7a7466",
    primary: "#b97a6f", ctaText: "#ffffff", cardBg: "#fbf7f0", cardBorder: "#e8ddd4", dark: false,
    brand: "Bloom & Co.", navLinks: ["Shop", "Weddings", "Subscriptions"],
    eyebrow: "Fresh daily arrangements", headline: ["Blooms for", "Every Moment."],
    subtext: "Hand-tied bouquets, same-day delivery, and bespoke wedding floristry.", cta: "Shop Flowers",
    features: [
      { icon: "◈", title: "Same-Day Delivery", desc: "Order by 2pm for today" },
      { icon: "✦", title: "Wedding Floristry", desc: "Full-day service" },
      { icon: "⊕", title: "Subscriptions", desc: "Weekly or monthly" },
    ],
    mapTo: { businessType: "Other", style: "elegant", primaryColor: "#b97a6f", secondaryColor: "#e1aaa1", darkMode: false, fontFamily: "classic-serif" },
  },
  {
    id: "bookstore", name: "Bookstore", category: "Retail",
    tagline: "Literary, warm — for bookshops, libraries & publishers",
    bg: "#f3eddf", navBg: "#fbf6e8", navText: "#1f1812", navMuted: "#6a5e4b",
    hero: "#f3eddf", headingColor: "#1f1812", bodyColor: "#6a5e4b",
    primary: "#7a2828", ctaText: "#ffffff", cardBg: "#fbf6e8", cardBorder: "#d8cdb2", dark: false,
    brand: "The Printed Page", navLinks: ["Browse", "New Arrivals", "Events"],
    eyebrow: "Est. 1974 · Independent", headline: ["Stories Worth", "Living For."],
    subtext: "A curated collection of over 20,000 titles across every genre, hand-picked by our team.", cta: "Browse Books",
    features: [
      { icon: "◈", title: "20,000+ Titles", desc: "Fiction, non-fiction & rare" },
      { icon: "✦", title: "Author Events", desc: "Monthly readings & signings" },
      { icon: "⊕", title: "Staff Picks", desc: "Curated recommendations" },
    ],
    mapTo: { businessType: "Other", style: "elegant", primaryColor: "#7a2828", secondaryColor: "#a25234", darkMode: false, fontFamily: "classic-serif" },
  },
  {
    id: "saas-startup", name: "SaaS Startup", category: "Technology",
    tagline: "Modern, tech-forward — for SaaS products & startups",
    bg: "#0a0b0d", navBg: "#0a0b0d", navText: "#f5f5f7", navMuted: "#8a8c93",
    hero: "#0a0b0d", headingColor: "#f5f5f7", bodyColor: "#8a8c93",
    primary: "#a8ff5c", ctaText: "#0a0b0d", cardBg: "#13151a", cardBorder: "#1e2026", dark: true,
    brand: "Nexus Platform", navLinks: ["Product", "Pricing", "Docs"],
    eyebrow: "Developer-first platform", headline: ["Build Faster.", "Scale Further."],
    subtext: "The all-in-one infrastructure platform trusted by 50,000+ engineering teams worldwide.", cta: "Start Free Trial",
    features: [
      { icon: "◈", title: "Auto-Scaling", desc: "Zero-config deployments" },
      { icon: "✦", title: "Edge Network", desc: "190 global PoPs" },
      { icon: "⊕", title: "99.99% SLA", desc: "Enterprise-grade uptime" },
    ],
    mapTo: { businessType: "Tech Startup", style: "futuristic", primaryColor: "#a8ff5c", secondaryColor: "#7a5cff", darkMode: true, fontFamily: "mono" },
  },
];

/* ─── Mini website preview ───────────────────────────────────────────────────── */
function MiniPreview({ t }: { t: TemplateDesign }) {
  return (
    <div style={{ width: "100%", height: "100%", background: t.bg, overflow: "hidden", fontSize: 9, fontFamily: "system-ui, sans-serif", userSelect: "none" }}>
      {/* Nav */}
      <div style={{ background: t.navBg, padding: "0 14px", height: 26, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${t.cardBorder}` }}>
        <span style={{ fontSize: 8, fontWeight: 800, color: t.navText, letterSpacing: -0.2 }}>{t.brand}</span>
        <div style={{ display: "flex", gap: 9 }}>
          {t.navLinks.map(l => <span key={l} style={{ fontSize: 7, color: t.navMuted }}>{l}</span>)}
        </div>
        <div style={{ height: 16, padding: "0 8px", background: t.primary, borderRadius: 3, display: "flex", alignItems: "center" }}>
          <span style={{ fontSize: 6.5, fontWeight: 700, color: t.ctaText }}>Book</span>
        </div>
      </div>

      {/* Hero */}
      <div style={{ padding: "16px 14px 12px", background: t.hero, position: "relative", overflow: "hidden" }}>
        {/* Accent glow for dark templates */}
        {t.dark && <div style={{ position: "absolute", top: -30, right: -20, width: 120, height: 120, borderRadius: 60, background: `${t.primary}22`, filter: "blur(20px)", pointerEvents: "none" }}/>}

        <div style={{ fontSize: 6, fontWeight: 700, color: t.primary, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 5, fontFamily: "monospace", position: "relative" }}>{t.eyebrow}</div>
        <div style={{ fontSize: 20, fontWeight: 800, color: t.headingColor, lineHeight: 1.05, letterSpacing: -0.6, marginBottom: 8, position: "relative" }}>
          {t.headline[0]}<br/>{t.headline[1]}
        </div>
        <div style={{ fontSize: 7, color: t.bodyColor, lineHeight: 1.5, marginBottom: 10, maxWidth: 160, position: "relative" }}>{t.subtext}</div>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 4, background: t.primary, padding: "5px 11px", borderRadius: 5, position: "relative" }}>
          <span style={{ fontSize: 7, fontWeight: 700, color: t.ctaText }}>{t.cta}</span>
          <span style={{ fontSize: 7, color: t.ctaText, opacity: 0.8 }}>→</span>
        </div>
      </div>

      {/* Feature strip */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 5, padding: "8px 14px 12px", background: t.bg }}>
        {t.features.map((f, i) => (
          <div key={i} style={{ padding: "7px 8px", background: t.cardBg, border: `1px solid ${t.cardBorder}`, borderRadius: 5, overflow: "hidden" }}>
            <div style={{ fontSize: 10, color: t.primary, marginBottom: 3 }}>{f.icon}</div>
            <div style={{ fontSize: 6.5, fontWeight: 700, color: t.headingColor, marginBottom: 2, lineHeight: 1.2 }}>{f.title}</div>
            <div style={{ fontSize: 5.5, color: t.bodyColor, lineHeight: 1.3 }}>{f.desc}</div>
          </div>
        ))}
      </div>

      {/* Footer strip */}
      <div style={{ padding: "6px 14px", background: t.navBg, borderTop: `1px solid ${t.cardBorder}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 5.5, color: t.navMuted, fontFamily: "monospace" }}>{t.brand.toLowerCase().replace(/ /g, "")} .com</span>
        <div style={{ display: "flex", gap: 8 }}>
          {["Privacy", "Terms", "Contact"].map(l => <span key={l} style={{ fontSize: 5, color: t.navMuted }}>{l}</span>)}
        </div>
      </div>
    </div>
  );
}

/* ─── Full-size website preview (for modal) ──────────────────────────────────── */
function FullPreview({ t }: { t: TemplateDesign }) {
  return (
    <div style={{ background: t.bg, fontFamily: "system-ui, sans-serif", minHeight: "100%" }}>
      {/* Nav */}
      <div style={{ background: t.navBg, padding: "0 40px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${t.cardBorder}`, position: "sticky", top: 0, zIndex: 10 }}>
        <span style={{ fontSize: 18, fontWeight: 800, color: t.navText, letterSpacing: -0.5 }}>{t.brand}</span>
        <div style={{ display: "flex", gap: 28 }}>
          {t.navLinks.map(l => <span key={l} style={{ fontSize: 14, color: t.navMuted, cursor: "pointer" }}>{l}</span>)}
        </div>
        <div style={{ height: 40, padding: "0 20px", background: t.primary, borderRadius: 8, display: "flex", alignItems: "center", cursor: "pointer" }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: t.ctaText }}>Get Started</span>
        </div>
      </div>

      {/* Hero */}
      <div style={{ padding: "80px 40px 72px", background: t.hero, position: "relative", overflow: "hidden" }}>
        {t.dark && <>
          <div style={{ position: "absolute", top: -100, right: -60, width: 500, height: 500, borderRadius: 250, background: `${t.primary}18`, filter: "blur(60px)", pointerEvents: "none" }}/>
          <div style={{ position: "absolute", bottom: -80, left: -40, width: 300, height: 300, borderRadius: 150, background: `${t.primary}10`, filter: "blur(40px)", pointerEvents: "none" }}/>
        </>}
        <div style={{ position: "relative", maxWidth: 680 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: t.primary, letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 20, fontFamily: "monospace" }}>
            ● {t.eyebrow}
          </div>
          <h1 style={{ margin: "0 0 24px", fontSize: 64, fontWeight: 800, color: t.headingColor, lineHeight: 1.0, letterSpacing: -2 }}>
            {t.headline[0]}<br/>{t.headline[1]}
          </h1>
          <p style={{ margin: "0 0 36px", fontSize: 17, color: t.bodyColor, lineHeight: 1.65, maxWidth: 480 }}>{t.subtext}</p>
          <div style={{ display: "flex", gap: 12 }}>
            <button style={{ height: 52, padding: "0 28px", background: t.primary, border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, color: t.ctaText, cursor: "pointer" }}>{t.cta}</button>
            <button style={{ height: 52, padding: "0 28px", background: "transparent", border: `1.5px solid ${t.cardBorder}`, borderRadius: 10, fontSize: 15, fontWeight: 600, color: t.headingColor, cursor: "pointer" }}>Learn more</button>
          </div>
        </div>
      </div>

      {/* Features */}
      <div style={{ padding: "64px 40px", background: t.bg }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: t.primary, letterSpacing: "0.14em", textTransform: "uppercase", fontFamily: "monospace", marginBottom: 12 }}>What we offer</div>
          <h2 style={{ margin: 0, fontSize: 38, fontWeight: 800, color: t.headingColor, letterSpacing: -1 }}>Everything you need</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 }}>
          {t.features.map((f, i) => (
            <div key={i} style={{ padding: "32px 28px", background: t.cardBg, border: `1px solid ${t.cardBorder}`, borderRadius: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: t.primary + "22", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20, fontSize: 20, color: t.primary }}>{f.icon}</div>
              <h3 style={{ margin: "0 0 10px", fontSize: 18, fontWeight: 700, color: t.headingColor }}>{f.title}</h3>
              <p style={{ margin: 0, fontSize: 14, color: t.bodyColor, lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Banner */}
      <div style={{ margin: "0 40px 64px", padding: "56px 48px", background: t.primary, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 40 }}>
        <div>
          <h2 style={{ margin: "0 0 8px", fontSize: 34, fontWeight: 800, color: t.ctaText, letterSpacing: -1 }}>Ready to get started?</h2>
          <p style={{ margin: 0, fontSize: 16, color: t.ctaText, opacity: 0.8 }}>Join thousands of happy customers today.</p>
        </div>
        <button style={{ height: 52, padding: "0 32px", background: t.ctaText, border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, color: t.primary, cursor: "pointer", flexShrink: 0 }}>
          {t.cta} →
        </button>
      </div>

      {/* Footer */}
      <div style={{ padding: "28px 40px", borderTop: `1px solid ${t.cardBorder}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: t.navText }}>{t.brand}</span>
        <span style={{ fontFamily: "monospace", fontSize: 12, color: t.navMuted }}>© 2026 {t.brand}. All rights reserved.</span>
      </div>
    </div>
  );
}

/* ─── Preview modal ──────────────────────────────────────────────────────────── */
function PreviewModal({ template, allTemplates, onClose, onSelect, selectedId }: {
  template: TemplateDesign;
  allTemplates: TemplateDesign[];
  onClose: () => void;
  onSelect: (id: string, mapTo: TemplateMapTo) => void;
  selectedId: string;
}) {
  const idx = allTemplates.findIndex(t => t.id === template.id);
  const [current, setCurrent] = useState(idx);
  const t = allTemplates[current];
  const isSelected = selectedId === t.id;

  const prev = useCallback(() => setCurrent(i => (i - 1 + allTemplates.length) % allTemplates.length), [allTemplates.length]);
  const next = useCallback(() => setCurrent(i => (i + 1) % allTemplates.length), [allTemplates.length]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, prev, next]);

  useEffect(() => { document.body.style.overflow = "hidden"; return () => { document.body.style.overflow = ""; }; }, []);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", background: "rgba(10,14,20,0.88)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }}>

      {/* Close */}
      <button onClick={onClose} style={{ position: "absolute", top: 20, right: 20, zIndex: 10, width: 40, height: 40, borderRadius: 10, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>✕</button>

      {/* Prev / Next */}
      {[["←", prev, "left: 16px"], ["→", next, "right: 16px"]].map(([icon, fn, pos]) => (
        <button key={String(icon)} onClick={fn as () => void} style={{ position: "absolute", top: "50%", transform: "translateY(-50%)", [pos as string]: 16, zIndex: 10, width: 44, height: 44, borderRadius: 12, background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.18)", color: "#fff", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>{icon as string}</button>
      ))}

      {/* Preview pane */}
      <div style={{ flex: 1, overflowY: "auto", margin: "20px 0 20px 70px" }}>
        <div style={{ borderRadius: 14, overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 40px 80px rgba(0,0,0,0.6)" }}>
          <FullPreview t={t}/>
        </div>
      </div>

      {/* Info panel */}
      <div style={{ width: 320, flexShrink: 0, padding: "32px 28px", display: "flex", flexDirection: "column", gap: 20, overflowY: "auto" }}>
        {/* Progress dots */}
        <div style={{ display: "flex", gap: 5 }}>
          {allTemplates.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)} style={{ width: i === current ? 18 : 6, height: 6, borderRadius: 3, background: i === current ? t.primary : "rgba(255,255,255,0.2)", border: "none", cursor: "pointer", transition: "all 0.2s" }}/>
          ))}
        </div>

        <div>
          <span style={{ fontFamily: "monospace", fontSize: 10.5, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: t.primary }}>{t.category}</span>
          <h2 style={{ margin: "8px 0 10px", fontSize: 28, fontWeight: 800, color: "#fff", letterSpacing: -0.8 }}>{t.name}</h2>
          <p style={{ margin: 0, fontSize: 14, color: "rgba(255,255,255,0.6)", lineHeight: 1.6 }}>{t.tagline}</p>
        </div>

        {/* Palette */}
        <div>
          <p style={{ margin: "0 0 10px", fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Colour palette</p>
          <div style={{ display: "flex", gap: 8 }}>
            {[t.bg, t.primary, t.headingColor, t.cardBg].map((c, i) => (
              <div key={i} title={c} style={{ width: 32, height: 32, borderRadius: 8, background: c, border: "1.5px solid rgba(255,255,255,0.12)" }}/>
            ))}
          </div>
        </div>

        {/* Features */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {t.features.map((f, i) => (
            <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <div style={{ width: 28, height: 28, borderRadius: 7, background: t.primary + "22", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 14, color: t.primary }}>{f.icon}</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#fff", marginBottom: 2 }}>{f.title}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>{f.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 10 }}>
          <button onClick={() => { onSelect(t.id, t.mapTo); onClose(); }} style={{ height: 50, borderRadius: 12, border: "none", background: isSelected && t.id === selectedId ? t.primary : t.primary, color: t.ctaText, fontSize: 15, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            {isSelected ? "✓ Template selected" : "Use this template"}
          </button>
          <button onClick={onClose} style={{ height: 44, borderRadius: 12, border: "1.5px solid rgba(255,255,255,0.15)", background: "transparent", color: "rgba(255,255,255,0.7)", fontSize: 14, cursor: "pointer" }}>
            Continue browsing
          </button>
        </div>

        <p style={{ margin: 0, fontSize: 11.5, color: "rgba(255,255,255,0.3)", textAlign: "center" }}>
          Use ← → keys to navigate · Esc to close
        </p>
      </div>
    </div>
  );
}

/* ─── Template card ──────────────────────────────────────────────────────────── */
function TemplateCard({ t, isSelected, onSelect, onPreview }: {
  t: TemplateDesign; isSelected: boolean;
  onSelect: () => void; onPreview: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ borderRadius: 14, overflow: "hidden", position: "relative", cursor: "pointer", border: isSelected ? `2px solid #6366f1` : "2px solid transparent", boxShadow: isSelected ? "0 0 0 4px rgba(99,102,241,0.18)" : hovered ? "0 12px 40px rgba(10,14,20,0.18)" : "0 2px 8px rgba(10,14,20,0.06)", transition: "box-shadow 0.2s, transform 0.2s", transform: hovered ? "translateY(-3px)" : "translateY(0)" }}
    >
      {/* Preview area */}
      <div style={{ height: 200, position: "relative", overflow: "hidden" }}>
        <MiniPreview t={t}/>

        {/* Hover overlay */}
        <div style={{ position: "absolute", inset: 0, background: "rgba(10,14,20,0.72)", backdropFilter: "blur(2px)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, opacity: hovered ? 1 : 0, transition: "opacity 0.2s", pointerEvents: hovered ? "auto" : "none" }}>
          <button onClick={(e) => { e.stopPropagation(); onPreview(); }} style={{ height: 40, padding: "0 20px", borderRadius: 9, border: "1.5px solid rgba(255,255,255,0.7)", background: "transparent", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", width: 160 }}>
            Preview
          </button>
          <button onClick={(e) => { e.stopPropagation(); onSelect(); }} style={{ height: 40, padding: "0 20px", borderRadius: 9, border: "none", background: "#fff", color: "#0A0E14", fontSize: 13, fontWeight: 700, cursor: "pointer", width: 160 }}>
            Use Template
          </button>
        </div>

        {/* Selected badge */}
        {isSelected && (
          <div style={{ position: "absolute", top: 10, right: 10, width: 24, height: 24, borderRadius: 12, background: "#6366f1", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: "#fff" }}>✓</div>
        )}
      </div>

      {/* Label */}
      <div style={{ padding: "12px 14px 13px", background: "#fff", borderTop: "1px solid #f0ede8" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#0A0E14", letterSpacing: -0.2 }}>{t.name}</p>
            <p style={{ margin: "2px 0 0", fontSize: 11, color: "#8a8c93", fontFamily: "monospace" }}>{t.category}</p>
          </div>
          <div style={{ width: 10, height: 10, borderRadius: 5, background: t.primary, flexShrink: 0 }}/>
        </div>
      </div>
    </div>
  );
}

/* ─── Scratch card ───────────────────────────────────────────────────────────── */
function ScratchCard({ isSelected, onSelect }: { isSelected: boolean; onSelect: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={onSelect}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ borderRadius: 14, overflow: "hidden", cursor: "pointer", border: isSelected ? "2px solid #6366f1" : "2px dashed #D8D2C2", boxShadow: isSelected ? "0 0 0 4px rgba(99,102,241,0.18)" : "none", transition: "all 0.2s", transform: hovered ? "translateY(-3px)" : "translateY(0)" }}
    >
      <div style={{ height: 200, background: hovered ? "#F3F0E9" : "#FAFAF7", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, transition: "background 0.2s" }}>
        <div style={{ width: 52, height: 52, borderRadius: 14, background: "#fff", border: "1px solid #E8E3D6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, boxShadow: "0 4px 12px rgba(10,14,20,0.06)" }}>✦</div>
        <div style={{ textAlign: "center" }}>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#0A0E14" }}>Start from scratch</p>
          <p style={{ margin: "4px 0 0", fontSize: 12, color: "#6B7180", maxWidth: 140, lineHeight: 1.4 }}>Customise every design detail yourself</p>
        </div>
      </div>
      <div style={{ padding: "12px 14px 13px", background: "#fff", borderTop: "1px solid #f0ede8" }}>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#0A0E14" }}>Custom design</p>
        <p style={{ margin: "2px 0 0", fontSize: 11, color: "#8a8c93", fontFamily: "monospace" }}>All industries</p>
      </div>
    </div>
  );
}

/* ─── Category filter bar ────────────────────────────────────────────────────── */
const CATEGORIES = ["All", "Healthcare", "Fitness", "Wellness", "Education", "Food & Drink", "Restaurant", "Beauty", "Legal", "Property", "Automotive", "Retail", "Creative", "Technology"];

/* ─── Main gallery ───────────────────────────────────────────────────────────── */
export function TemplateGallery({ selectedId, onSelect }: {
  selectedId: string;
  onSelect: (id: string, mapTo: TemplateMapTo) => void;
}) {
  const [previewTemplate, setPreviewTemplate] = useState<TemplateDesign | null>(null);
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered = activeCategory === "All" ? DESIGNS : DESIGNS.filter(t => t.category === activeCategory);

  return (
    <>
      <style>{`
        @keyframes tg-fadeUp { from { opacity: 0; transform: translateY(8px) } to { opacity: 1; transform: translateY(0) } }
        .tg-card { animation: tg-fadeUp 0.3s ease-out both; }
      `}</style>

      {/* Category filter */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 20 }}>
        {CATEGORIES.map(cat => {
          const on = activeCategory === cat;
          return (
            <button key={cat} onClick={() => setActiveCategory(cat)} style={{ height: 30, padding: "0 13px", borderRadius: 8, border: on ? "none" : "1px solid #E8E3D6", background: on ? "#0A0E14" : "transparent", color: on ? "#fff" : "#6B7180", fontSize: 12, fontWeight: on ? 600 : 500, cursor: "pointer", transition: "all 0.15s", fontFamily: "system-ui, sans-serif" }}>
              {cat}
            </button>
          );
        })}
      </div>

      {/* Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
        {filtered.map((t, i) => (
          <div key={t.id} className="tg-card" style={{ animationDelay: `${i * 0.04}s` }}>
            <TemplateCard
              t={t}
              isSelected={selectedId === t.id}
              onSelect={() => onSelect(t.id, t.mapTo)}
              onPreview={() => setPreviewTemplate(t)}
            />
          </div>
        ))}
        {/* Scratch card only shown when "All" or no category matches */}
        {activeCategory === "All" && (
          <div className="tg-card" style={{ animationDelay: `${filtered.length * 0.04}s` }}>
            <ScratchCard
              isSelected={selectedId === ""}
              onSelect={() => onSelect("", { businessType: "Restaurant", style: "minimalist", primaryColor: "#6366f1", secondaryColor: "#a855f7", darkMode: false, fontFamily: "modern-sans" })}
            />
          </div>
        )}
      </div>

      {/* Selected template indicator */}
      {selectedId && selectedId !== "" && (
        <div style={{ marginTop: 16, padding: "10px 16px", background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 14, color: "#6366f1" }}>✓</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#0A0E14" }}>
              {DESIGNS.find(t => t.id === selectedId)?.name ?? "Template"} selected
            </span>
          </div>
          <button onClick={() => onSelect("", { businessType: "Restaurant", style: "minimalist", primaryColor: "#6366f1", secondaryColor: "#a855f7", darkMode: false, fontFamily: "modern-sans" })} style={{ fontSize: 12, color: "#6B7180", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>
            Clear
          </button>
        </div>
      )}

      {/* Preview modal */}
      {previewTemplate && (
        <PreviewModal
          template={previewTemplate}
          allTemplates={DESIGNS}
          onClose={() => setPreviewTemplate(null)}
          onSelect={onSelect}
          selectedId={selectedId}
        />
      )}
    </>
  );
}
