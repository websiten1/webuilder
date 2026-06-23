"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import type { HomeCopy } from "./copy";

// ─── Axion assets ─────────────────────────────────────────────────────────────
const SMALL_IMAGE    = "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260516_090123_74be96d4-9c1b-40cf-932a-96f4f4babed3.png&w=1280&q=85";
const LARGE_IMAGE    = "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260516_090133_c157d30b-a99a-4477-bec1-a446149ec3f2.png&w=1280&q=85";
const NARRATIV_VIDEO = "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260516_122702_390f5305-8719-41d5-ae80-d23ab3796c28.mp4";
const LUMINAR_VIDEO  = "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260516_123323_f909c2b8-ff6c-4edf-882b-8ebcdbe389b5.mp4";

const ORANGE     = "#F26522";
const ORANGE_HOV = "#e05a1a";
const EMAIL      = "hello@insixlive.com";

const NAV = [
  { label: "produs",    href: "#studio" },
  { label: "industrii", href: "#projects" },
  { label: "beneficii", href: "#connect" },
  { label: "contact",   href: "#connect" },
] as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function LogoMark({ className = "", fill = "currentColor" }: { className?: string; fill?: string }) {
  return (
    <svg viewBox="0 0 256 256" className={className} fill={fill} aria-hidden>
      <path d="M 128 192 L 128 256 L 64.5 256 L 32 223 L 0 192 L 0 128 L 64 128 Z M 256 192 L 256 256 L 192.5 256 L 160 223 L 128 192 L 128 128 L 192 128 Z M 128 64 L 128 128 L 64.5 128 L 32 95 L 0 64 L 0 0 L 64 0 Z M 256 64 L 256 128 L 192.5 128 L 160 95 L 128 64 L 128 0 L 192 0 Z" />
    </svg>
  );
}

/** Text that rolls up on group-hover */
function TextRoll({ text }: { text: string }) {
  return (
    <span className="inline-flex flex-col overflow-hidden" style={{ height: "1.25rem" }}>
      <span className="flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] group-hover:-translate-y-1/2">
        <span>{text}</span>
        <span aria-hidden>{text}</span>
      </span>
    </span>
  );
}

/** Orange pill CTA with rotating arrow */
function OrangeButton({ text, href = "/signup" }: { text: string; href?: string }) {
  const [hov, setHov] = useState(false);
  return (
    <a href={href} className="group"
      style={{ display: "inline-flex", alignItems: "center", gap: 8, borderRadius: 9999, background: hov ? ORANGE_HOV : ORANGE, padding: "8px 8px 8px 20px", fontSize: 14, fontWeight: 500, color: "#fff", textDecoration: "none", transition: "background .3s", whiteSpace: "nowrap" }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
      <TextRoll text={text} />
      <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 32, height: 32, borderRadius: "50%", background: "#fff", flexShrink: 0, transition: "transform .5s cubic-bezier(0.25,0.1,0.25,1)", transform: hov ? "rotate(-45deg)" : "rotate(0deg)" }}>
        <ArrowRight color={ORANGE} size={16} />
      </span>
    </a>
  );
}

/** Simple SVG arrow-right inline (no lucide dep needed) */
function ArrowRight({ color = "currentColor", size = 16 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 12h14M12 5l7 7-7 7"/>
    </svg>
  );
}

/** Section number + label chip */
function SectionLabel({ num, label }: { num: number; label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
      <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, borderRadius: "50%", background: "#111", fontSize: 11, fontWeight: 700, color: "#fff" }}>{num}</span>
      <span style={{ borderRadius: 9999, border: "1px solid #e5e7eb", padding: "4px 14px", fontSize: 13, fontWeight: 500, color: "#111" }}>{label}</span>
    </div>
  );
}

// ─── Hero shader background (CSS approximation of ChromaFlow + Swirl) ─────────
function HeroShaderBg() {
  const glowRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = glowRef.current;
    if (!el) return;
    const section = el.closest("section") as HTMLElement;
    sectionRef.current = section;

    const onMove = (e: MouseEvent) => {
      const rect = section.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      el.style.background = `radial-gradient(700px circle at ${x}% ${y}%, rgba(242,101,34,0.18) 0%, rgba(242,101,34,0.06) 40%, transparent 70%)`;
    };
    section.addEventListener("mousemove", onMove);
    return () => section.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none" }}>
      {/* Base */}
      <div style={{ position: "absolute", inset: 0, background: "#EFEFEF" }} />
      {/* Ambient orange blobs */}
      <div style={{ position: "absolute", top: "60%", left: "30%", width: 480, height: 480, borderRadius: "50%", background: "radial-gradient(circle, rgba(242,101,34,0.12) 0%, transparent 70%)", filter: "blur(60px)", animation: "ax-blob1 8s ease-in-out infinite" }} />
      <div style={{ position: "absolute", top: "20%", right: "20%", width: 320, height: 320, borderRadius: "50%", background: "radial-gradient(circle, rgba(242,101,34,0.08) 0%, transparent 70%)", filter: "blur(40px)", animation: "ax-blob2 11s ease-in-out infinite" }} />
      {/* Mouse-reactive glow */}
      <div ref={glowRef} style={{ position: "absolute", inset: 0, transition: "background 0.08s linear" }} />
      {/* Film grain */}
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.055 }} aria-hidden>
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/>
          <feColorMatrix type="saturate" values="0"/>
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function HomePage({ copy: _copy }: { copy: HomeCopy }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    router.push(email ? `/signup?email=${encodeURIComponent(email)}` : "/signup");
  };

  return (
    <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Inter', 'Helvetica Neue', Arial, sans-serif", background: "#fff", color: "#111" }}>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; background: #fff; }
        body { background: #fff; color: #111; -webkit-font-smoothing: antialiased; }
        a { color: inherit; text-decoration: none; }
        button { font-family: inherit; cursor: pointer; border: none; background: none; padding: 0; }
        video { display: block; }
        input, textarea { font-family: inherit; }
        @keyframes ax-blob1 {
          0%, 100% { transform: translate(0,0) scale(1); }
          50% { transform: translate(-40px, -60px) scale(1.2); }
        }
        @keyframes ax-blob2 {
          0%, 100% { transform: translate(0,0) scale(1); }
          50% { transform: translate(30px, 40px) scale(0.85); }
        }
      `}</style>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* NAVBAR — unchanged from current design                             */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <nav style={{
        position: "absolute", inset: "0 0 auto 0", zIndex: 20,
        display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center",
        padding: "clamp(16px,3vw,24px) clamp(12px,3vw,40px)",
      }}>
        {/* Logo — left */}
        <a href="/" style={{ display: "flex", alignItems: "center", gap: 8, borderRadius: 9999, padding: "10px 16px", background: "rgba(23,23,23,0.9)", backdropFilter: "blur(12px)", color: "#fff", width: "fit-content" }}>
          <LogoMark className="h-4 w-4 sm:h-5 sm:w-5" fill="white" />
          <span style={{ fontSize: 14, letterSpacing: "-0.02em", whiteSpace: "nowrap" }}>insixlive</span>
        </a>

        {/* Nav links — centre */}
        <div className="hidden md:flex" style={{ borderRadius: 9999, padding: "8px 4px", background: "rgba(23,23,23,0.9)", backdropFilter: "blur(12px)" }}>
          {NAV.map(link => (
            <a key={link.href + link.label} href={link.href}
              style={{ display: "block", borderRadius: 9999, padding: "8px 20px", fontSize: 14, color: "rgba(200,200,200,1)", letterSpacing: "-0.01em", transition: "color .2s", whiteSpace: "nowrap" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
              onMouseLeave={e => (e.currentTarget.style.color = "rgba(200,200,200,1)")}>
              {link.label}
            </a>
          ))}
        </div>

        {/* CTA + hamburger — right */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 12 }}>
          <a href="/signup" style={{ borderRadius: 9999, padding: "10px 24px", fontSize: 14, color: "#000", background: "#fff", letterSpacing: "-0.01em", whiteSpace: "nowrap", transition: "background .2s" }}
            onMouseEnter={e => (e.currentTarget.style.background = "#e5e5e5")}
            onMouseLeave={e => (e.currentTarget.style.background = "#fff")}>
            începe azi
          </a>
          <button onClick={() => setMenuOpen(!menuOpen)} className="flex md:hidden"
            style={{ width: 40, height: 40, borderRadius: 9999, background: "rgba(23,23,23,0.9)", backdropFilter: "blur(12px)", alignItems: "center", justifyContent: "center" }}
            aria-label="meniu">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", flexDirection: "column", background: "rgba(0,0,0,0.97)", backdropFilter: "blur(20px)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 20px 0" }}>
            <span style={{ fontSize: 14, fontWeight: 500, color: "#fff" }}>insixlive</span>
            <button onClick={() => setMenuOpen(false)} style={{ color: "rgba(255,255,255,0.7)" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>
          <nav style={{ flex: 1, display: "flex", flexDirection: "column", padding: "40px 20px 0" }}>
            {NAV.map(link => (
              <a key={link.href + link.label} href={link.href} onClick={() => setMenuOpen(false)}
                style={{ padding: "16px 0", fontSize: "1.5rem", fontWeight: 300, color: "#fff", letterSpacing: "-0.03em", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                {link.label}
              </a>
            ))}
          </nav>
          <div style={{ padding: 20 }}>
            <a href="/signup" onClick={() => setMenuOpen(false)}
              style={{ display: "block", borderRadius: 9999, padding: "16px 0", textAlign: "center", fontSize: 14, color: "#fff", background: ORANGE }}>
              începe azi
            </a>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* HERO — Axion style: #EFEFEF + shader bg + heading pinned bottom    */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <section id="hero" style={{ position: "relative", display: "flex", flexDirection: "column", minHeight: "100svh", background: "#EFEFEF", overflow: "hidden" }}>
        <HeroShaderBg />

        <div style={{ position: "relative", zIndex: 10, display: "flex", flex: 1, flexDirection: "column" }}>
          <div style={{ flex: 1 }} />
          <div style={{ margin: "0 auto", width: "100%", maxWidth: 1440, padding: "0 clamp(20px,4vw,48px) clamp(56px,6vw,80px)" }}>
            <p style={{ marginBottom: "clamp(20px,3vw,32px)", fontSize: 13, letterSpacing: "0.04em", color: "#111" }}>insixlive</p>
            <h1 style={{ maxWidth: 900, fontSize: "clamp(1.75rem,7vw,4.2rem)", fontWeight: 500, lineHeight: 1.08, letterSpacing: "-0.03em", color: "#111" }}>
              Creăm website-uri profesionale<br/>
              pentru afaceri gata să domine<br/>
              online.
            </h1>
            <div style={{ marginTop: "clamp(32px,4vw,48px)", display: "flex", flexWrap: "wrap", alignItems: "center", gap: 16 }}>
              <OrangeButton text="Începe un proiect" href="/signup" />
              {/* Partner badge */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, borderRadius: 4, background: "#fff", padding: "8px 12px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={ORANGE} strokeWidth="2" strokeLinecap="round" aria-hidden>
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                <span style={{ fontSize: 13, fontWeight: 500, color: "#111" }}>AI Verified</span>
                <span style={{ background: "#111", color: "#fff", fontSize: 10, fontWeight: 600, padding: "2px 6px", borderRadius: 4 }}>NEW</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* ABOUT — white bg, two images + text                                */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <section id="studio" style={{ background: "#fff", padding: "clamp(64px,8vw,128px) 0", overflow: "hidden", scrollMarginTop: 96 }}>
        <div style={{ margin: "0 auto", width: "100%", maxWidth: 1440 }}>
          {/* Label */}
          <div style={{ padding: "0 clamp(20px,4vw,48px)", marginBottom: 8 }}>
            <SectionLabel num={1} label="Despre insixlive" />
          </div>

          <h2 style={{ padding: "0 clamp(20px,4vw,48px)", marginBottom: "clamp(48px,6vw,112px)", fontSize: "clamp(1.5rem,4vw,3.2rem)", fontWeight: 500, lineHeight: 1.12, letterSpacing: "-0.02em", color: "#111" }}>
            Website-uri generate de AI,<br/>
            livrate în 6 minute.
          </h2>

          {/* Mobile layout */}
          <div style={{ padding: "0 clamp(20px,4vw,48px)" }} className="lg:hidden">
            <p style={{ fontSize: 15, fontWeight: 500, lineHeight: 1.6, color: "#111", marginBottom: 24 }}>
              Prin AI și automatizare, ajutăm micile afaceri să lanseze prezențe online profesionale rapid — fără bătăi de cap și fără costuri lunare.
            </p>
            <OrangeButton text="Despre noi" href="/signup" />
            <div style={{ marginTop: 32, display: "flex", flexDirection: "column", gap: 16 }} className="sm:flex-row sm:gap-5">
              <img src={SMALL_IMAGE} alt="" style={{ width: "100%", borderRadius: 12, objectFit: "cover", aspectRatio: "438/346", display: "block" }} className="sm:w-[45%]" />
              <img src={LARGE_IMAGE} alt="" style={{ width: "100%", borderRadius: 12, objectFit: "cover", aspectRatio: "3/2", display: "block" }} className="sm:w-[55%]" />
            </div>
          </div>

          {/* Desktop layout */}
          <div style={{ display: "none", padding: "0 clamp(20px,4vw,48px)" }} className="lg:grid lg:grid-cols-[26%_1fr_48%] lg:items-end lg:gap-6">
            <img src={SMALL_IMAGE} alt="" style={{ width: "100%", borderRadius: 16, objectFit: "cover", aspectRatio: "438/346", display: "block", alignSelf: "end" }} />
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", alignSelf: "flex-start" }}>
              <p style={{ fontSize: 16, fontWeight: 500, lineHeight: 1.65, color: "#111", whiteSpace: "nowrap" }}>
                Prin AI și automatizare,<br/>ajutăm micile afaceri să lanseze<br/>prezențe online profesionale rapid.
              </p>
              <div style={{ marginTop: 32 }}>
                <OrangeButton text="Despre noi" href="/signup" />
              </div>
            </div>
            <img src={LARGE_IMAGE} alt="" style={{ width: "100%", borderRadius: 16, objectFit: "cover", aspectRatio: "3/2", display: "block", alignSelf: "end" }} />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* CASE STUDIES — #F5F5F5 bg, two video cards with hover effect       */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <section id="projects" style={{ background: "#F5F5F5", padding: "clamp(64px,8vw,112px) 0", scrollMarginTop: 96 }}>
        <div style={{ margin: "0 auto", width: "100%", maxWidth: 1440 }}>
          <div style={{ padding: "0 clamp(20px,4vw,48px)", marginBottom: 8 }}>
            <SectionLabel num={2} label="Proiecte recente" />
          </div>

          <h2 style={{ padding: "0 clamp(20px,4vw,48px)", marginBottom: "clamp(40px,5vw,64px)", fontSize: "clamp(1.75rem,7vw,4.2rem)", fontWeight: 500, lineHeight: 1.08, letterSpacing: "-0.03em", color: "#111" }}>
            Proiectele noastre
          </h2>

          <div style={{ padding: "0 clamp(20px,4vw,48px)", display: "grid", gridTemplateColumns: "1fr", gap: 20 }} className="md:grid-cols-2">
            {/* Narrativ card */}
            <NarrativCard />
            {/* Luminar card */}
            <LuminarCard />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* CONNECT — white bg, contact form                                   */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <section id="connect" style={{ background: "#fff", padding: "clamp(64px,8vw,96px) clamp(20px,4vw,48px)", scrollMarginTop: 96 }}>
        <div style={{ maxWidth: 1440, margin: "0 auto" }}>
          <SectionLabel num={3} label="Contact" />
          <h2 style={{ fontSize: "clamp(1.75rem,5vw,3rem)", fontWeight: 500, lineHeight: 1.08, letterSpacing: "-0.03em", color: "#111", marginBottom: 16 }}>
            Hai să vorbim
          </h2>
          <p style={{ maxWidth: 520, fontSize: 15, lineHeight: 1.7, color: "#444", marginBottom: 24 }}>
            Spune-ne despre afacerea ta — răspundem în maximum două zile lucrătoare.
          </p>
          <p style={{ marginBottom: 40 }}>
            <a href={`mailto:${EMAIL}`} style={{ fontSize: 15, fontWeight: 500, color: "#111", textDecoration: "underline", textDecorationColor: "#ccc", textUnderlineOffset: 4 }}
              onMouseEnter={e => (e.currentTarget.style.textDecorationColor = "#111")}
              onMouseLeave={e => (e.currentTarget.style.textDecorationColor = "#ccc")}>
              {EMAIL}
            </a>
          </p>

          {/* Contact form */}
          <form onSubmit={(e) => { e.preventDefault(); router.push(email ? `/signup?email=${encodeURIComponent(email)}` : "/signup"); }}
            style={{ maxWidth: 480, display: "flex", flexDirection: "column", gap: 12, marginBottom: 40 }}>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
              placeholder="email@afacereata.ro"
              style={{ width: "100%", borderRadius: 10, background: "#f5f5f5", padding: "14px 18px", fontSize: 14, color: "#111", border: "1px solid #e5e7eb", outline: "none", transition: "border-color .2s" }}
              onFocus={e => e.target.style.borderColor = "#999"}
              onBlur={e => e.target.style.borderColor = "#e5e7eb"}
            />
            <textarea rows={4} placeholder="Descrie-ți afacerea..."
              style={{ width: "100%", borderRadius: 10, background: "#f5f5f5", padding: "14px 18px", fontSize: 14, color: "#111", border: "1px solid #e5e7eb", outline: "none", resize: "vertical", transition: "border-color .2s" }}
              onFocus={e => e.target.style.borderColor = "#999"}
              onBlur={e => e.target.style.borderColor = "#e5e7eb"}
            />
            <div>
              <OrangeButton text="Trimite mesajul" href="#" />
            </div>
          </form>

          <OrangeButton text="Rezervă o consultație" href={`mailto:${EMAIL}?subject=Consultatie`} />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* FOOTER                                                              */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <footer style={{ background: "#fff", borderTop: "1px solid #e5e7eb", padding: "clamp(24px,4vw,32px) clamp(20px,4vw,48px)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <a href="/" style={{ display: "flex", alignItems: "center", gap: 8, color: "#111" }}>
            <LogoMark className="h-4 w-4" fill="#111" />
            <span style={{ fontSize: 14, fontWeight: 500, letterSpacing: "-0.02em" }}>insixlive</span>
          </a>
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            {NAV.map(link => (
              <a key={link.href + link.label} href={link.href} style={{ fontSize: 13, color: "#999", letterSpacing: "-0.01em" }}>{link.label}</a>
            ))}
            <a href="/privacy" style={{ fontSize: 13, color: "#999" }}>confidențialitate</a>
          </div>
          <p style={{ fontSize: 12, color: "#bbb" }}>© {new Date().getFullYear()} insixlive</p>
        </div>
      </footer>
    </div>
  );
}

// ─── Case study card components ───────────────────────────────────────────────
function NarrativCard() {
  return (
    <article>
      <div className="group" style={{ position: "relative", aspectRatio: "329/246", cursor: "pointer", overflow: "hidden", borderRadius: 16, background: "#1a1d2e" }}>
        <video src={NARRATIV_VIDEO} autoPlay muted loop playsInline style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        <ExpandButton label="Află mai mult" dark={false} />
      </div>
      <p style={{ marginTop: 16, fontSize: 13, lineHeight: 1.6, color: "#666" }}>
        Website premium cu animații 3D — experiență digitală care generează engagement record
      </p>
      <h3 style={{ marginTop: 4, fontSize: 14, fontWeight: 600, color: "#111" }}>Narrativ</h3>
    </article>
  );
}

function LuminarCard() {
  return (
    <article>
      <div className="group" style={{ position: "relative", aspectRatio: "1/1", cursor: "pointer", overflow: "hidden", borderRadius: 16, background: "#6b6b6b" }}>
        <video src={LUMINAR_VIDEO} autoPlay muted loop playsInline style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        <ExpandButton label="Vezi studiul de caz" dark={true} />
      </div>
      <p style={{ marginTop: 16, fontSize: 13, lineHeight: 1.6, color: "#666" }}>
        Transformarea unei platforme învechite într-o experiență de brand orientată spre conversii
      </p>
      <h3 style={{ marginTop: 4, fontSize: 14, fontWeight: 600, color: "#111" }}>Luminar</h3>
    </article>
  );
}

function ExpandButton({ label, dark }: { label: string; dark: boolean }) {
  return (
    <div style={{
      position: "absolute", bottom: 16, left: 16,
      display: "flex", alignItems: "center", overflow: "hidden",
      height: 36, width: 36, borderRadius: 9999,
      background: dark ? "#111" : "#fff",
      transition: "width .3s ease-in-out",
    }}
      className="group-hover:!w-[160px]">
      <span style={{ marginLeft: 0, whiteSpace: "nowrap", padding: "0 12px", fontSize: 13, fontWeight: 500, color: dark ? "#fff" : "#111", opacity: 0, transition: "opacity .2s .1s" }}
        className="group-hover:!opacity-100">
        {label}
      </span>
      <svg style={{ position: "absolute", right: 10, flexShrink: 0, transform: "rotate(-45deg)", transition: "transform .3s", color: dark ? "#fff" : "#111" }}
        className="group-hover:!rotate-0"
        width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M5 12h14M12 5l7 7-7 7"/>
      </svg>
    </div>
  );
}
