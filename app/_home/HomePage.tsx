"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { DM_Sans, Poppins } from "next/font/google";
import type { HomeCopy } from "./copy";

const _cosmica = DM_Sans({ subsets: ["latin"], weight: ["300","400","500","600","700"], variable: "--font-cosmica" });
const poppins  = Poppins({ subsets: ["latin","latin-ext"], weight: ["300","400","500","600","700"], variable: "--font-poppins" });

// ─── Video assets ────────────────────────────────────────────────────────────
const VID_MAIN   = "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260506_081238_406ed0e3-5d83-436e-a512-0bbff7ec5b95.mp4";
const VID_SECOND = "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_105406_16f4600d-7a92-4292-b96e-b19156c7830a.mp4";
const PILL_IMG   = "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=200&h=100&fit=crop&auto=format";

// ─── Nav items ───────────────────────────────────────────────────────────────
const NAV = [
  { label: "Cum funcționează", href: "#cum-functioneaza" },
  { label: "Servicii",         href: "#servicii" },
  { label: "Prețuri",         href: "#preturi" },
  { label: "Contact",          href: "#contact" },
] as const;

// ─── Offerings ───────────────────────────────────────────────────────────────
const SERVICII = [
  { name: "Website de prezentare",  detail: "Site profesional pentru afacerea ta, cu design modern, copywriting generat AI și SEO optimizat." },
  { name: "Landing page",           detail: "O pagină dedicată conversiei — perfectă pentru campanii, produse noi sau portofoliu." },
  { name: "Website e-commerce",     detail: "Magazin online complet, cu coș de cumpărături, plăți integrate și gestionare produse." },
  { name: "Redesign rapid",         detail: "Transformă un site vechi sau generic într-un design modern și consistent cu brandul tău." },
];

// ─── Pricing ─────────────────────────────────────────────────────────────────
const PLANURI = [
  {
    name: "Standard",
    price: "€49.99",
    tag: "plată unică",
    features: ["Website de prezentare", "Implementare în Vercel", "Cod sursă complet", "Design responsiv", "SEO de bază"],
    featured: false,
  },
  {
    name: "Professional",
    price: "€89.99",
    tag: "plată unică",
    features: ["Tot din Standard", "Landing page inclus", "Integrare formular contact", "Suport prioritar 30 zile", "Revizuire design"],
    featured: true,
  },
  {
    name: "Enterprise",
    price: "La cerere",
    tag: "personalizat",
    features: ["Portofoliu multi-site", "Integrări personalizate", "Consultanță dedicată", "SLA garantat", "Facturare B2B"],
    featured: false,
  },
];

// ─── Testimoniale ─────────────────────────────────────────────────────────────
const TESTIMONIALE = [
  { quote: "Site-ul a fost gata în mai puțin de 10 minute. Nu am crezut că e posibil.", name: "Mihai D.", biz: "Servicii auto, Cluj" },
  { quote: "Design profesional, cod curat. Exact ce aveam nevoie fără să plătesc o agenție.", name: "Ioana P.", biz: "Cabinet stomatologic, București" },
  { quote: "Am lansat campania cu landing page-ul generat. Rata de conversie a crescut cu 40%.", name: "Andrei L.", biz: "Marketing digital, Timișoara" },
];

// ─── Sub-components ──────────────────────────────────────────────────────────
function ArrowUpRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 17L17 7M7 7h10v10"/>
    </svg>
  );
}

function CircleArrow({ href }: { href: string }) {
  return (
    <a href={href} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-zinc-900">
      <ArrowUpRight />
    </a>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default function HomePage({ copy: _copy }: { copy: HomeCopy }) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [heroEmail, setHeroEmail] = useState("");

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    router.push(heroEmail ? `/signup?email=${encodeURIComponent(heroEmail)}` : "/signup");
  };

  const H = "var(--font-poppins), system-ui, sans-serif";
  const BLUE = "hsl(213,85%,68%)";

  return (
    <div className={`${poppins.variable} ${_cosmica.variable}`} style={{ fontFamily: H }}>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; background: #fff; }
        body { color: hsl(0,0%,17%); -webkit-font-smoothing: antialiased; }
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(20px); filter: blur(4px); }
          to   { opacity: 1; transform: translateY(0);    filter: blur(0); }
        }
        .bv-fade   { animation: fade-up 700ms cubic-bezier(0.16,1,0.3,1) both; }
        .bv-fade-d { animation: fade-up 700ms cubic-bezier(0.16,1,0.3,1) 150ms both; }
        input:focus, textarea:focus { outline: none; }
        @media (prefers-reduced-motion: reduce) {
          .bv-fade, .bv-fade-d { animation: none !important; }
        }
      `}</style>

      {/* ─── Navbar ─────────────────────────────────────────────────────── */}
      <header className="relative z-20 flex items-center justify-between px-5 py-5 lg:px-16">
        <a href="/" style={{ fontFamily: H, fontSize: 20, fontWeight: 700, letterSpacing: -0.5, color: "hsl(0,0%,17%)", textDecoration: "none" }}>
          in<span style={{ color: "#FF5A1F" }}>six</span>live
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV.map(n => (
            <a key={n.href} href={n.href} style={{ fontFamily: H, fontSize: 14, fontWeight: 600, color: "rgba(44,44,44,0.65)", textDecoration: "none", transition: "color .15s" }}
              onMouseEnter={e => (e.currentTarget.style.color = "hsl(0,0%,17%)")}
              onMouseLeave={e => (e.currentTarget.style.color = "rgba(44,44,44,0.65)")}
            >
              {n.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-6 md:flex">
          <Link href="/login" style={{ fontFamily: H, fontSize: 14, fontWeight: 600, color: "rgba(44,44,44,0.65)", textDecoration: "none" }}>
            Intră în cont
          </Link>
          <Link href="/signup" style={{ display: "inline-flex", alignItems: "center", gap: 6, borderRadius: 999, background: BLUE, padding: "10px 20px", fontFamily: H, fontSize: 14, fontWeight: 600, color: "#fff", textDecoration: "none" }}>
            Comenză acum <ArrowUpRight />
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(true)}
          className="flex h-10 w-10 items-center justify-center md:hidden"
          style={{ background: "none", border: "none", cursor: "pointer", color: "hsl(0,0%,17%)" }}
          aria-label="Deschide meniu"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12h18M3 6h18M3 18h18"/>
          </svg>
        </button>
      </header>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, background: "#fff", display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 20px" }}>
            <span style={{ fontFamily: H, fontSize: 20, fontWeight: 700, letterSpacing: -0.5 }}>in<span style={{ color: "#FF5A1F" }}>six</span>live</span>
            <button onClick={() => setMenuOpen(false)} style={{ background: "none", border: "none", cursor: "pointer" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>
          <nav style={{ display: "flex", flexDirection: "column", gap: 4, padding: "0 16px", flex: 1 }}>
            {NAV.map(n => (
              <a key={n.href} href={n.href} onClick={() => setMenuOpen(false)}
                style={{ fontFamily: H, fontSize: 18, fontWeight: 600, color: "hsl(0,0%,17%)", textDecoration: "none", padding: "12px 4px", borderBottom: "1px solid hsl(0,0%,93%)" }}>
                {n.label}
              </a>
            ))}
            <a href="/login" onClick={() => setMenuOpen(false)}
              style={{ fontFamily: H, fontSize: 18, fontWeight: 600, color: "rgba(44,44,44,0.55)", textDecoration: "none", padding: "12px 4px" }}>
              Intră în cont
            </a>
          </nav>
          <div style={{ padding: 20, borderTop: "1px solid hsl(0,0%,93%)" }}>
            <a href="/signup" style={{ display: "block", borderRadius: 999, background: BLUE, padding: "14px 0", fontFamily: H, fontSize: 15, fontWeight: 600, color: "#fff", textDecoration: "none", textAlign: "center" }}>
              Comenză acum
            </a>
          </div>
        </div>
      )}

      {/* ─── Hero ────────────────────────────────────────────────────────── */}
      <section id="acasa" className="relative flex min-h-screen flex-col lg:h-screen lg:overflow-hidden">
        <div className="flex flex-1 flex-col px-5 pb-8 lg:px-16 lg:pb-[82px]">
          <div style={{ display: "grid", flex: 1, alignItems: "stretch", gap: 32, gridTemplateColumns: "1fr" }} className="lg:grid-cols-2">

            {/* Left */}
            <div className="bv-fade flex flex-col justify-between">
              <div>
                <h1 style={{ fontFamily: H, fontSize: "clamp(2rem,4vw,4.5rem)", fontWeight: 400, lineHeight: 1.08, letterSpacing: "-0.02em", color: "hsl(0,0%,17%)", margin: 0 }}>
                  <span style={{ display: "inline-flex", flexWrap: "wrap" as const, alignItems: "center", gap: 8 }}>
                    <span
                      style={{ display: "inline-block", width: 80, height: 40, borderRadius: 999, backgroundImage: `url(${PILL_IMG})`, backgroundSize: "cover", backgroundPosition: "center", flexShrink: 0 }}
                      aria-hidden
                    />
                    Website-uri
                  </span>
                  <span style={{ display: "block" }}>profesionale,</span>
                  <span style={{ display: "flex", flexWrap: "wrap" as const, alignItems: "center", gap: 8 }}>
                    implementate
                    <button
                      type="button"
                      onClick={() => document.getElementById("cum-functioneaza")?.scrollIntoView({ behavior: "smooth" })}
                      style={{ display: "inline-flex", alignItems: "center", gap: 7, border: "2px solid hsl(0,0%,17%)", borderRadius: 999, padding: "6px 16px", fontSize: 14, fontWeight: 500, background: "none", cursor: "pointer", fontFamily: H, color: "hsl(0,0%,17%)", whiteSpace: "nowrap" as const }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>
                      Cum funcționează
                    </button>
                  </span>
                  <span style={{ display: "block" }}>în contul tău.</span>
                </h1>

                <div style={{ display: "flex", flexWrap: "wrap" as const, alignItems: "center", gap: 16, paddingTop: 24 }}>
                  <a href="/signup" style={{ display: "inline-flex", alignItems: "center", gap: 8, borderRadius: 999, background: BLUE, padding: "12px 24px", fontFamily: H, fontSize: 14, fontWeight: 600, color: "#fff", textDecoration: "none" }}>
                    Comenză acum <ArrowUpRight />
                  </a>
                  <a href="/signup" style={{ fontFamily: H, fontSize: 14, fontWeight: 600, textDecoration: "underline", textUnderlineOffset: 4, color: "hsl(0,0%,17%)" }}>
                    Solicită o demonstrație
                  </a>
                </div>
              </div>

              <div style={{ marginTop: 48 }} className="hidden max-w-md lg:block">
                <p style={{ fontFamily: H, fontSize: 14, lineHeight: 1.7, color: "rgba(44,44,44,0.62)", margin: 0 }}>
                  insixlive lucrează cu antreprenorii mici pentru a transforma un brief în website profesional complet — implementat în contul tău Vercel, cu cod care îți aparține.
                </p>
                <div style={{ marginTop: 32, display: "flex", flexWrap: "wrap" as const, gap: 24, fontFamily: H, fontSize: 22, fontWeight: 700, letterSpacing: "-0.03em", color: "rgba(44,44,44,0.65)" }}>
                  <span>HoReCa</span>
                  <span>Retail</span>
                  <span>Servicii</span>
                  <span>Medical</span>
                </div>
              </div>
            </div>

            {/* Right: video cards */}
            <div className="bv-fade-d flex flex-col gap-4">
              {/* Main card */}
              <div style={{ position: "relative", display: "flex", minHeight: 200, flex: 1, overflow: "hidden", borderRadius: 24, background: "#000" }} className="lg:rounded-[2.5rem]">
                <video autoPlay muted loop playsInline style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} aria-hidden>
                  <source src={VID_MAIN} type="video/mp4"/>
                </video>
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.15), rgba(0,0,0,0.78))" }}/>
                <div style={{ position: "relative", zIndex: 10, display: "flex", height: "100%", flexDirection: "column", justifyContent: "space-between", padding: 20 }} className="lg:p-8">
                  <h2 style={{ fontFamily: H, maxWidth: 320, fontSize: "clamp(1.1rem,1.8vw,1.5rem)", fontWeight: 400, color: "#fff", lineHeight: 1.3, margin: 0 }}>
                    Dacă ești gata să lansezi website-ul tău, hai să vorbim.
                  </h2>
                  <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16 }}>
                    <p style={{ fontFamily: H, maxWidth: 260, fontSize: 13, color: "rgba(255,255,255,0.85)", lineHeight: 1.55, margin: 0 }}>
                      De la brief la lansare — AI generează codul și îl deployează în contul tău Vercel.
                    </p>
                    <CircleArrow href="/signup" />
                  </div>
                </div>
              </div>

              {/* Two small cards */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, flex: 1 }}>

                {/* Industrii */}
                <div style={{ position: "relative", display: "flex", minHeight: 180, overflow: "hidden", borderRadius: 24, background: "#000", padding: 20 }} className="lg:rounded-[2.5rem] lg:p-8">
                  <video autoPlay muted loop playsInline style={{ position: "absolute", left: "50%", top: "50%", width: "100%", height: "100%", objectFit: "cover", transform: "translate(-50%,-50%) scale(1.5)" }} aria-hidden>
                    <source src={VID_SECOND} type="video/mp4"/>
                  </video>
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(0,0,0,0.28), rgba(0,0,0,0.72))" }}/>
                  <div style={{ position: "relative", zIndex: 10, display: "flex", height: "100%", width: "100%", flexDirection: "column", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                      <span style={{ fontFamily: H, display: "inline-block", borderRadius: 999, background: "#fff", padding: "4px 12px", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "lowercase" as const, color: "#09090b" }}>industrii</span>
                      <CircleArrow href="/signup" />
                    </div>
                    <div>
                      <h3 style={{ fontFamily: H, fontSize: "clamp(1rem,1.4vw,1.15rem)", fontWeight: 400, color: "#fff", margin: "0 0 6px", lineHeight: 1.25 }}>Antreprenori din România</h3>
                      <p style={{ fontFamily: H, fontSize: 12, color: "rgba(255,255,255,0.75)", margin: 0, lineHeight: 1.5 }}>Afaceri locale digitalizate rapid și eficient.</p>
                    </div>
                  </div>
                </div>

                {/* Minute */}
                <div style={{ position: "relative", display: "flex", minHeight: 180, overflow: "hidden", borderRadius: 24, background: "#000", padding: 20 }} className="lg:rounded-[2.5rem] lg:p-8">
                  <video autoPlay muted loop playsInline style={{ position: "absolute", left: "50%", top: "50%", width: "100%", height: "100%", objectFit: "cover", transform: "translate(-50%,-50%) scale(2.8)" }} aria-hidden>
                    <source src={VID_MAIN} type="video/mp4"/>
                  </video>
                  <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.55)" }}/>
                  <div style={{ position: "relative", zIndex: 10, display: "flex", height: "100%", width: "100%", flexDirection: "column", justifyContent: "space-between" }}>
                    <span style={{ fontFamily: H, display: "inline-block", borderRadius: 999, background: "#fff", padding: "4px 12px", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "lowercase" as const, color: "#09090b", width: "fit-content" }}>minute</span>
                    <div>
                      <p style={{ fontFamily: H, fontSize: "clamp(3rem,5.5vw,5.5rem)", fontWeight: 300, color: "#fff", lineHeight: 1, letterSpacing: "-0.04em", margin: "0 0 8px" }}>6</p>
                      <p style={{ fontFamily: H, fontSize: 12, color: "rgba(255,255,255,0.75)", margin: 0, lineHeight: 1.5 }}>Timp mediu de la brief la website live și implementat.</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─── Cum funcționează ────────────────────────────────────────────── */}
      <section id="cum-functioneaza" style={{ scrollMarginTop: 96, borderTop: "1px solid hsl(0,0%,90%)", padding: "112px 20px 64px" }} className="lg:px-16 lg:pb-24 lg:pt-32">
        <div style={{ maxWidth: 768, margin: "0 auto" }}>
          <p style={{ fontFamily: H, fontSize: 11, fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: "0.2em", color: "rgba(44,44,44,0.45)", margin: 0 }}>Cum funcționează</p>
          <h1 style={{ fontFamily: H, marginTop: 16, fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 400, letterSpacing: "-0.02em", lineHeight: 1.1, color: "hsl(0,0%,17%)" }}>
            Website complet, în 6 minute.
          </h1>
          <p style={{ fontFamily: H, marginTop: 24, maxWidth: 560, fontSize: 15, lineHeight: 1.7, color: "rgba(44,44,44,0.62)" }}>
            Descrie-ți afacerea, alege designul, plătești o singură dată. AI generează site-ul și îl implementează direct în contul tău Vercel — tu ești proprietarul codului.
          </p>
        </div>

        <div style={{ borderTop: "1px solid hsl(0,0%,90%)", marginTop: 48, paddingTop: 0 }}>
          <div style={{ maxWidth: 960, margin: "0 auto", display: "grid", gap: 24, paddingTop: 0 }} className="md:grid-cols-3">
            {[
              { title: "Brief AI", body: "Descrie-ți afacerea în câteva propoziții. AI-ul analizează industria, publicul și concurența ta pentru a genera site-ul potrivit." },
              { title: "Generare cod", body: "AI generează site-ul complet — design, copywriting, structură — adaptat afacerii tale. Totul, în câteva minute." },
              { title: "Implementare Vercel", body: "Site-ul este deployat direct în contul tău Vercel. Codul îți aparține complet. Fără abonamente, fără lock-in." },
            ].map(item => (
              <article key={item.title} style={{ borderRadius: 24, border: "1px solid hsl(0,0%,90%)", padding: 24, marginTop: 24 }} className="lg:rounded-[2rem]">
                <h2 style={{ fontFamily: H, fontSize: 17, fontWeight: 600, color: "hsl(0,0%,17%)", margin: 0 }}>{item.title}</h2>
                <p style={{ fontFamily: H, marginTop: 12, fontSize: 14, lineHeight: 1.65, color: "rgba(44,44,44,0.62)", margin: "12px 0 0" }}>{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Servicii ────────────────────────────────────────────────────── */}
      <section id="servicii" style={{ scrollMarginTop: 96, borderTop: "1px solid hsl(0,0%,90%)", padding: "112px 20px 64px" }} className="lg:px-16 lg:pb-24 lg:pt-32">
        <div style={{ maxWidth: 768, margin: "0 auto" }}>
          <p style={{ fontFamily: H, fontSize: 11, fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: "0.2em", color: "rgba(44,44,44,0.45)", margin: 0 }}>Servicii</p>
          <h1 style={{ fontFamily: H, marginTop: 16, fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 400, letterSpacing: "-0.02em", lineHeight: 1.1, color: "hsl(0,0%,17%)" }}>
            Ce construim pentru tine.
          </h1>
          <p style={{ fontFamily: H, marginTop: 24, maxWidth: 560, fontSize: 15, lineHeight: 1.7, color: "rgba(44,44,44,0.62)" }}>
            Pachete adaptate oricărui tip de afacere mică sau medie — de la prezentare simplă până la e-commerce complet.
          </p>
        </div>

        <div style={{ borderTop: "1px solid hsl(0,0%,90%)", marginTop: 48 }}>
          <ul style={{ maxWidth: 768, margin: "0 auto", listStyle: "none", padding: 0 }}>
            {SERVICII.map(item => (
              <li key={item.name} style={{ display: "flex", flexDirection: "column", gap: 8, padding: "24px 0", borderBottom: "1px solid hsl(0,0%,90%)" }} className="sm:flex-row sm:items-center sm:justify-between">
                <span style={{ fontFamily: H, fontSize: 17, fontWeight: 600, color: "hsl(0,0%,17%)" }}>{item.name}</span>
                <span style={{ fontFamily: H, maxWidth: 400, fontSize: 14, color: "rgba(44,44,44,0.62)", lineHeight: 1.55 }}>{item.detail}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ─── Prețuri ─────────────────────────────────────────────────────── */}
      <section id="preturi" style={{ scrollMarginTop: 96, borderTop: "1px solid hsl(0,0%,90%)", padding: "112px 20px 64px" }} className="lg:px-16 lg:pb-24 lg:pt-32">
        <div style={{ maxWidth: 768, margin: "0 auto" }}>
          <p style={{ fontFamily: H, fontSize: 11, fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: "0.2em", color: "rgba(44,44,44,0.45)", margin: 0 }}>Prețuri</p>
          <h1 style={{ fontFamily: H, marginTop: 16, fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 400, letterSpacing: "-0.02em", lineHeight: 1.1, color: "hsl(0,0%,17%)" }}>
            Transparent, o singură plată.
          </h1>
          <p style={{ fontFamily: H, marginTop: 24, maxWidth: 560, fontSize: 15, lineHeight: 1.7, color: "rgba(44,44,44,0.62)" }}>
            Fără abonamente lunare. Plătești o singură dată și site-ul îți aparține pentru totdeauna.
          </p>
        </div>

        <div style={{ borderTop: "1px solid hsl(0,0%,90%)", marginTop: 48, paddingTop: 24 }}>
          <div style={{ maxWidth: 960, margin: "0 auto", display: "grid", gap: 24 }} className="md:grid-cols-3">
            {PLANURI.map(plan => (
              <article
                key={plan.name}
                style={{
                  display: "flex", flexDirection: "column", borderRadius: 24, padding: 24,
                  border: plan.featured ? `2px solid ${BLUE}` : "1px solid hsl(0,0%,90%)",
                  background: plan.featured ? `hsl(213,85%,68%,0.06)` : "transparent",
                }}
                className="lg:rounded-[2rem]"
              >
                <h2 style={{ fontFamily: H, fontSize: 15, fontWeight: 600, color: "rgba(44,44,44,0.5)", margin: 0, textTransform: "uppercase" as const, letterSpacing: "0.1em" }}>{plan.name}</h2>
                <p style={{ fontFamily: H, marginTop: 8, fontSize: "clamp(1.6rem,2.5vw,2rem)", fontWeight: 400, letterSpacing: "-0.02em", color: "hsl(0,0%,17%)" }}>{plan.price}</p>
                <p style={{ fontFamily: H, fontSize: 13, color: "rgba(44,44,44,0.5)", margin: "4px 0 24px" }}>{plan.tag}</p>
                <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px", flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
                  {plan.features.map(f => (
                    <li key={f} style={{ fontFamily: H, fontSize: 14, color: "rgba(44,44,44,0.7)", display: "flex", gap: 8, alignItems: "flex-start" }}>
                      <span style={{ color: BLUE, fontWeight: 700, flexShrink: 0 }}>·</span> {f}
                    </li>
                  ))}
                </ul>
                <a href="/signup" style={{ display: "flex", justifyContent: "center", borderRadius: 999, background: plan.featured ? BLUE : "hsl(0,0%,17%)", padding: "12px 20px", fontFamily: H, fontSize: 14, fontWeight: 600, color: "#fff", textDecoration: "none" }}>
                  Comenză acum
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Testimoniale ────────────────────────────────────────────────── */}
      <section style={{ borderTop: "1px solid hsl(0,0%,90%)", padding: "112px 20px 64px" }} className="lg:px-16 lg:pb-24 lg:pt-32">
        <div style={{ maxWidth: 768, margin: "0 auto" }}>
          <p style={{ fontFamily: H, fontSize: 11, fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: "0.2em", color: "rgba(44,44,44,0.45)", margin: 0 }}>Clienți</p>
          <h1 style={{ fontFamily: H, marginTop: 16, fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 400, letterSpacing: "-0.02em", lineHeight: 1.1, color: "hsl(0,0%,17%)" }}>
            Ce spun clienții noștri.
          </h1>
        </div>

        <div style={{ borderTop: "1px solid hsl(0,0%,90%)", marginTop: 48, paddingTop: 24 }}>
          <div style={{ maxWidth: 960, margin: "0 auto", display: "grid", gap: 24 }} className="md:grid-cols-3">
            {TESTIMONIALE.map(t => (
              <article key={t.name} style={{ borderRadius: 24, border: "1px solid hsl(0,0%,90%)", padding: 28 }} className="lg:rounded-[2rem]">
                <p style={{ fontFamily: H, fontSize: 14, lineHeight: 1.7, color: "rgba(44,44,44,0.75)", margin: "0 0 24px" }}>"{t.quote}"</p>
                <div>
                  <p style={{ fontFamily: H, fontSize: 14, fontWeight: 600, color: "hsl(0,0%,17%)", margin: 0 }}>{t.name}</p>
                  <p style={{ fontFamily: H, fontSize: 12, color: "rgba(44,44,44,0.45)", margin: "4px 0 0" }}>{t.biz}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Contact ─────────────────────────────────────────────────────── */}
      <section id="contact" style={{ scrollMarginTop: 96, borderTop: "1px solid hsl(0,0%,90%)", padding: "112px 20px 64px" }} className="lg:px-16 lg:pb-24 lg:pt-32">
        <div style={{ maxWidth: 768, margin: "0 auto" }}>
          <p style={{ fontFamily: H, fontSize: 11, fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: "0.2em", color: "rgba(44,44,44,0.45)", margin: 0 }}>Contact</p>
          <h1 style={{ fontFamily: H, marginTop: 16, fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 400, letterSpacing: "-0.02em", lineHeight: 1.1, color: "hsl(0,0%,17%)" }}>
            Hai să vorbim.
          </h1>
          <p style={{ fontFamily: H, marginTop: 24, maxWidth: 560, fontSize: 15, lineHeight: 1.7, color: "rgba(44,44,44,0.62)" }}>
            Spune-ne despre afacerea ta — răspundem în maximum 24 de ore.
          </p>
        </div>

        <div style={{ borderTop: "1px solid hsl(0,0%,90%)", marginTop: 48, paddingTop: 40 }}>
          <form onSubmit={handleSubmit} style={{ maxWidth: 560, margin: "0 auto", display: "flex", flexDirection: "column", gap: 16 }}>
            <label style={{ display: "block", fontFamily: H, fontSize: 14, fontWeight: 500, color: "hsl(0,0%,17%)" }}>
              Nume
              <input type="text" placeholder="Ion Popescu" style={{ display: "block", marginTop: 6, width: "100%", borderRadius: 14, border: "1px solid hsl(0,0%,85%)", padding: "12px 16px", fontFamily: H, fontSize: 14, color: "hsl(0,0%,17%)", background: "#fff", boxSizing: "border-box" as const }} />
            </label>
            <label style={{ display: "block", fontFamily: H, fontSize: 14, fontWeight: 500, color: "hsl(0,0%,17%)" }}>
              Email
              <input type="email" required value={heroEmail} onChange={e => setHeroEmail(e.target.value)} placeholder="ion@afacereamea.ro" style={{ display: "block", marginTop: 6, width: "100%", borderRadius: 14, border: "1px solid hsl(0,0%,85%)", padding: "12px 16px", fontFamily: H, fontSize: 14, color: "hsl(0,0%,17%)", background: "#fff", boxSizing: "border-box" as const }} />
            </label>
            <label style={{ display: "block", fontFamily: H, fontSize: 14, fontWeight: 500, color: "hsl(0,0%,17%)" }}>
              Cum te putem ajuta?
              <textarea rows={4} placeholder="Vreau un website pentru..." style={{ display: "block", marginTop: 6, width: "100%", borderRadius: 14, border: "1px solid hsl(0,0%,85%)", padding: "12px 16px", fontFamily: H, fontSize: 14, color: "hsl(0,0%,17%)", background: "#fff", boxSizing: "border-box" as const, resize: "vertical" as const }} />
            </label>
            <button type="submit" style={{ borderRadius: 999, background: BLUE, padding: "14px 28px", fontFamily: H, fontSize: 15, fontWeight: 600, color: "#fff", border: "none", cursor: "pointer", width: "fit-content" }}>
              Trimite mesaj
            </button>
          </form>
        </div>
      </section>

      {/* ─── Footer ──────────────────────────────────────────────────────── */}
      <footer style={{ borderTop: "1px solid hsl(0,0%,90%)", padding: "48px 20px 32px", background: "#fff" }} className="lg:px-16">
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", flexWrap: "wrap" as const, alignItems: "center", justifyContent: "space-between", gap: 24 }}>
          <div>
            <a href="/" style={{ fontFamily: H, fontSize: 18, fontWeight: 700, letterSpacing: -0.5, color: "hsl(0,0%,17%)", textDecoration: "none" }}>
              in<span style={{ color: "#FF5A1F" }}>six</span>live
            </a>
            <p style={{ fontFamily: H, fontSize: 13, color: "rgba(44,44,44,0.45)", marginTop: 8, maxWidth: 320, lineHeight: 1.6 }}>
              Website-uri profesionale generate de AI, implementate în contul tău. Plătești o singură dată — codul îți aparține.
            </p>
          </div>
          <nav style={{ display: "flex", flexWrap: "wrap" as const, gap: 24 }}>
            {NAV.map(n => (
              <a key={n.href} href={n.href} style={{ fontFamily: H, fontSize: 14, color: "rgba(44,44,44,0.55)", textDecoration: "none" }}>{n.label}</a>
            ))}
            <a href="/privacy" style={{ fontFamily: H, fontSize: 14, color: "rgba(44,44,44,0.55)", textDecoration: "none" }}>Confidențialitate</a>
            <a href="/terms" style={{ fontFamily: H, fontSize: 14, color: "rgba(44,44,44,0.55)", textDecoration: "none" }}>Termeni</a>
          </nav>
        </div>
        <div style={{ maxWidth: 1200, margin: "24px auto 0", borderTop: "1px solid hsl(0,0%,90%)", paddingTop: 24 }}>
          <span style={{ fontFamily: H, fontSize: 12, color: "rgba(44,44,44,0.35)" }}>© {new Date().getFullYear()} insixlive. Toate drepturile rezervate.</span>
        </div>
      </footer>

    </div>
  );
}
