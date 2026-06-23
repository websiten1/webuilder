"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { HomeCopy } from "./copy";

const HERO_VIDEO     = "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260421_074215_f4339e1c-0b1a-4f60-98b2-90e3d7840cb7.mp4";
const SECURITY_VIDEO = "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260421_072418_508a7d2e-396d-4f6f-9d42-ec920fcf7755.mp4";
const BENEFITS_VIDEO = "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260421_072701_f6a01abb-eb30-4559-9d6e-774362defbc3.mp4";

const GRADIENT_CTA = "linear-gradient(90deg, #FA8453 0%, #F8C9B2 100%)";

const NAV = [
  { label: "produs",    href: "#securitate" },
  { label: "industrii", href: "#industrii" },
  { label: "beneficii", href: "#beneficii" },
  { label: "contact",   href: "#contact" },
] as const;

function LogoMark({ className = "", fill = "currentColor" }: { className?: string; fill?: string }) {
  return (
    <svg viewBox="0 0 256 256" className={className} fill={fill} aria-hidden>
      <path d="M 128 192 L 128 256 L 64.5 256 L 32 223 L 0 192 L 0 128 L 64 128 Z M 256 192 L 256 256 L 192.5 256 L 160 223 L 128 192 L 128 128 L 192 128 Z M 128 64 L 128 128 L 64.5 128 L 32 95 L 0 64 L 0 0 L 64 0 Z M 256 64 L 256 128 L 192.5 128 L 160 95 L 128 64 L 128 0 L 192 0 Z" />
    </svg>
  );
}

export default function HomePage({ copy: _copy }: { copy: HomeCopy }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    router.push(email ? `/signup?email=${encodeURIComponent(email)}` : "/signup");
  };

  return (
    <div style={{ fontFamily: "'Futura Md BT Medium', system-ui, -apple-system, sans-serif", background: "#fff", color: "#1d1d1f" }}>
      <style>{`
        @import url('https://db.onlinewebfonts.com/c/e55e9079ee863276569c8a68d776ef04?family=Futura+Md+BT+Medium');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; background: #fff; }
        body { background: #fff; color: #1d1d1f; -webkit-font-smoothing: antialiased; }
        a { color: inherit; text-decoration: none; }
        button { font-family: inherit; cursor: pointer; border: none; background: none; padding: 0; }
        video { display: block; }
        input, textarea { font-family: inherit; }
        .gn-hero-title { letter-spacing: -0.04em; line-height: 0.95; }
      `}</style>

      {/* ─── Navbar ──────────────────────────────────────────────────────── */}
      {/* Grid layout: 1fr [logo] | auto [nav] | 1fr [cta] → nav is always centred */}
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
            <a key={link.href} href={link.href} style={{ display: "block", borderRadius: 9999, padding: "8px 20px", fontSize: 14, color: "rgba(200,200,200,1)", letterSpacing: "-0.01em", transition: "color .2s", whiteSpace: "nowrap" }}
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
          <button onClick={() => setMenuOpen(!menuOpen)} className="flex md:hidden" style={{ width: 40, height: 40, borderRadius: 9999, background: "rgba(23,23,23,0.9)", backdropFilter: "blur(12px)", alignItems: "center", justifyContent: "center" }} aria-label="meniu">
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
              <a key={link.href} href={link.href} onClick={() => setMenuOpen(false)}
                style={{ padding: "16px 0", fontSize: "1.5rem", fontWeight: 300, color: "#fff", letterSpacing: "-0.03em", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                {link.label}
              </a>
            ))}
          </nav>
          <div style={{ padding: 20 }}>
            <a href="/signup" onClick={() => setMenuOpen(false)} style={{ display: "block", borderRadius: 9999, padding: "16px 0", textAlign: "center", fontSize: 14, color: "#000", background: GRADIENT_CTA }}>
              începe azi
            </a>
          </div>
        </div>
      )}

      {/* ─── Hero (dark video — stays black) ────────────────────────────── */}
      <section id="hero" style={{ position: "relative", width: "100%", overflow: "hidden", background: "#000", height: "100svh", minHeight: "100vh" }}>
        <video style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} src={HERO_VIDEO} autoPlay loop muted playsInline />

        <div style={{ position: "relative", margin: "0 auto", height: "100%", width: "100%", maxWidth: 1320 }}>
          <h1 className="gn-hero-title" style={{ position: "absolute", left: "clamp(12px,3vw,40px)", top: "18%", fontSize: "clamp(3rem,18vw,18vw)", fontWeight: 500, color: "#fff" }}>website-uri</h1>
          <h1 className="gn-hero-title" style={{ position: "absolute", right: "clamp(12px,3vw,40px)", top: "38%", fontSize: "clamp(3rem,18vw,18vw)", fontWeight: 500, color: "#fff" }}>în 6</h1>
          <h1 className="gn-hero-title" style={{ position: "absolute", left: "clamp(5%,18%,28%)", top: "58%", fontSize: "clamp(3rem,18vw,18vw)", fontWeight: 500, color: "#fff" }}>minute</h1>

          <p style={{ position: "absolute", left: "clamp(16px,4vw,40px)", top: "47%", maxWidth: "clamp(200px,28vw,340px)", fontSize: "clamp(13px,1.4vw,18px)", fontWeight: 300, lineHeight: 1.55, letterSpacing: "-0.01em", color: "rgba(255,255,255,0.88)" }}>
            construim website-uri profesionale,<br/>implementate în contul tău Vercel<br/>în mai puțin de 6 minute
          </p>

          {/* Stat bottom-left */}
          <div style={{ position: "absolute", bottom: "clamp(80px,10vw,96px)", left: "clamp(16px,4vw,40px)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div>
                <p style={{ fontSize: "clamp(1.5rem,3.5vw,3.5rem)", fontWeight: 500, letterSpacing: "-0.04em", lineHeight: 1, color: "#fff" }}>+1k</p>
                <p style={{ marginTop: 4, fontSize: "clamp(10px,1vw,14px)", fontWeight: 300, color: "rgba(255,255,255,0.55)", letterSpacing: "-0.01em" }}>website-uri lansate</p>
              </div>
              <span className="hidden md:block" style={{ height: 1, width: 96, background: "rgba(255,255,255,0.3)", transform: "rotate(-20deg)" }} aria-hidden />
            </div>
          </div>

          {/* Stat top-right */}
          <div style={{ position: "absolute", top: "20%", right: "clamp(16px,4vw,40px)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span className="hidden md:block" style={{ height: 1, width: 96, background: "rgba(255,255,255,0.3)", transform: "rotate(20deg)" }} aria-hidden />
              <div>
                <p style={{ fontSize: "clamp(1.5rem,3.5vw,3.5rem)", fontWeight: 500, letterSpacing: "-0.04em", lineHeight: 1, color: "#fff" }}>€49.99</p>
                <p style={{ marginTop: 4, fontSize: "clamp(10px,1vw,14px)", fontWeight: 300, color: "rgba(255,255,255,0.55)", letterSpacing: "-0.01em" }}>plată unică</p>
              </div>
            </div>
          </div>

          {/* Stat bottom-right */}
          <div style={{ position: "absolute", bottom: "clamp(80px,10vw,96px)", right: "clamp(16px,4vw,40px)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span className="hidden md:block" style={{ height: 1, width: 96, background: "rgba(255,255,255,0.3)", transform: "rotate(-20deg)" }} aria-hidden />
              <div>
                <p style={{ fontSize: "clamp(1.5rem,3.5vw,3.5rem)", fontWeight: 500, letterSpacing: "-0.04em", lineHeight: 1, color: "#fff" }}>6min</p>
                <p style={{ marginTop: 4, fontSize: "clamp(10px,1vw,14px)", fontWeight: 300, color: "rgba(255,255,255,0.55)", letterSpacing: "-0.01em" }}>timp mediu</p>
              </div>
            </div>
          </div>
        </div>

        {/* Fade to WHITE (not black) so the transition into the next section is smooth */}
        <div style={{ pointerEvents: "none", position: "absolute", bottom: 0, left: 0, right: 0, height: 192, background: "linear-gradient(to bottom, transparent, #fff)" }} aria-hidden />
      </section>

      {/* ─── Security / Cum funcționează (dark video) ────────────────────── */}
      <section id="securitate" style={{ position: "relative", width: "100%", overflow: "hidden", background: "#000", height: "100svh", minHeight: 600, scrollMarginTop: 96 }}>
        <video style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} src={SECURITY_VIDEO} autoPlay loop muted playsInline />

        {/* Fade FROM white at the top */}
        <div style={{ pointerEvents: "none", position: "absolute", top: 0, left: 0, right: 0, zIndex: 10, height: 192, background: "linear-gradient(to bottom, #fff, transparent)" }} aria-hidden />

        <div style={{ position: "relative", margin: "0 auto", height: "100%", width: "100%", maxWidth: 1100 }}>
          {/* Floating pill */}
          <div style={{ position: "absolute", left: "50%", top: "clamp(24px,5vw,40px)", zIndex: 20, transform: "translateX(-50%)", width: "max-content", maxWidth: "95vw" }}>
            <div style={{ background: "rgba(23,23,23,0.8)", backdropFilter: "blur(12px)", borderRadius: 9999, padding: 8, display: "flex", alignItems: "center", gap: 8 }}>
              <a href="/signup" style={{ display: "inline-block", whiteSpace: "nowrap", borderRadius: 9999, padding: "8px 20px", fontSize: "clamp(11px,1.1vw,14px)", color: "rgba(255,255,255,0.85)", fontWeight: 300 }}>
                generare automată
              </a>
              <a href="/signup" style={{ display: "inline-block", whiteSpace: "nowrap", borderRadius: 9999, padding: "8px 20px", fontSize: "clamp(11px,1.1vw,14px)", color: "#000", background: GRADIENT_CTA, fontWeight: 400 }}>
                rulează demo
              </a>
            </div>
          </div>

          <p style={{ position: "absolute", left: "clamp(16px,6vw,64px)", top: "clamp(55%,56%,60%)", maxWidth: "clamp(240px,35vw,440px)", fontSize: "clamp(13px,1.4vw,18px)", fontWeight: 300, lineHeight: 1.6, color: "rgba(255,255,255,0.78)" }}>
            generăm website-ul tău complet cu AI, cu design profesional și cod curat, implementat direct în contul tău
          </p>

          <p style={{ position: "absolute", right: "clamp(16px,6vw,64px)", top: "clamp(26%,34%,36%)", maxWidth: "clamp(240px,40vw,500px)", fontSize: "clamp(13px,1.4vw,18px)", fontWeight: 300, lineHeight: 1.6, color: "rgba(255,255,255,0.88)" }}>
            Prin colaborarea cu insixlive, o afacere mică poate lansa o prezență online profesională în câteva minute. Design modern, copywriting optimizat și implementare automată pe Vercel — fără costuri lunare.
          </p>
        </div>

        {/* Fade to white at the bottom */}
        <div style={{ pointerEvents: "none", position: "absolute", bottom: 0, left: 0, right: 0, height: 192, background: "linear-gradient(to bottom, transparent, #fff)" }} aria-hidden />
      </section>

      {/* ─── Industries — WHITE ──────────────────────────────────────────── */}
      <section id="industrii" style={{ position: "relative", width: "100%", background: "#fff", scrollMarginTop: 96, padding: "clamp(48px,8vw,80px) clamp(16px,4vw,40px)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "clamp(12px,1.5vw,16px)" }} className="md:grid-cols-4">
          {[
            { label: "HoReCa",   glow: "#1e3a8a", pos: "top-left" },
            { label: "retail",   glow: "#FA8453", glow2: "#F5D547", pos: "top-left" },
            { label: "servicii", glow: "#F5D547", pos: "bottom-left" },
            { label: "medical",  glow: "#1e3a8a", pos: "right" },
          ].map(item => (
            <div key={item.label} style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", height: "clamp(96px,12vw,144px)", overflow: "hidden", borderRadius: 16, background: "#f2f2f2" }}>
              {item.pos === "top-left" && <div style={{ position: "absolute", top: -96, left: -96, width: 160, height: 160, borderRadius: "50%", background: item.glow, opacity: 0.25, filter: "blur(48px)" }} />}
              {item.glow2 && <div style={{ position: "absolute", bottom: -96, right: -96, width: 160, height: 160, borderRadius: "50%", background: item.glow2, opacity: 0.2, filter: "blur(48px)" }} />}
              {item.pos === "bottom-left" && <div style={{ position: "absolute", bottom: -96, left: -96, width: 160, height: 160, borderRadius: "50%", background: item.glow, opacity: 0.2, filter: "blur(48px)" }} />}
              {item.pos === "right" && <div style={{ position: "absolute", right: -112, top: "50%", transform: "translateY(-50%)", width: 192, height: 192, borderRadius: "50%", background: item.glow, opacity: 0.25, filter: "blur(48px)" }} />}
              <span style={{ position: "relative", zIndex: 10, fontSize: "clamp(1.1rem,2.5vw,1.9rem)", fontWeight: 600, letterSpacing: "-0.03em", color: "#1d1d1f" }}>{item.label}</span>
            </div>
          ))}
        </div>

        <div style={{ marginTop: "clamp(64px,10vw,112px)", display: "flex", flexDirection: "column", alignItems: "flex-start", justifyContent: "space-between", gap: 32 }} className="md:flex-row md:items-center md:ml-auto md:w-[70%]">
          <p style={{ maxWidth: 400, fontSize: "clamp(13px,1.4vw,18px)", fontWeight: 300, lineHeight: 1.6, color: "rgba(0,0,0,0.52)", letterSpacing: "-0.01em" }}>
            generăm website-uri profesionale pentru orice tip de afacere mică, cu design adaptat industriei tale
          </p>
          <a href="/signup" style={{ display: "inline-block", flexShrink: 0, borderRadius: 9999, padding: "12px 32px", fontSize: 14, color: "#000", background: GRADIENT_CTA, letterSpacing: "-0.01em", fontWeight: 400, whiteSpace: "nowrap" }}>
            rulează demo
          </a>
        </div>
      </section>

      {/* ─── Benefits — WHITE (video card stays dark) ────────────────────── */}
      <section id="beneficii" style={{ position: "relative", width: "100%", background: "#fff", scrollMarginTop: 96, padding: "clamp(48px,8vw,80px) clamp(16px,4vw,40px)" }}>
        <h2 style={{ marginBottom: "clamp(48px,8vw,96px)", textAlign: "center", fontSize: "clamp(2rem,4vw,3.2rem)", fontWeight: 300, letterSpacing: "-0.04em", color: "#1d1d1f" }}>
          beneficii cheie
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "clamp(12px,1.5vw,16px)" }} className="md:grid-cols-3">
          {/* Card 1 — light */}
          <div style={{ position: "relative", height: "clamp(380px,35vw,460px)", overflow: "hidden", borderRadius: 16, background: "#f2f2f2", padding: "clamp(24px,3vw,32px)" }}>
            <div style={{ position: "absolute", top: "50%", left: -420, width: 460, height: 460, transform: "translateY(-50%)", borderRadius: "50%", background: "#1e3a8a", opacity: 0.18, filter: "blur(60px)" }} />
            <div style={{ position: "relative", zIndex: 10 }}>
              <h3 style={{ fontSize: "clamp(1.1rem,1.8vw,1.5rem)", fontWeight: 300, lineHeight: 1.3, letterSpacing: "-0.025em", color: "#1d1d1f" }}>
                generare cod<br/>și implementare automată
              </h3>
              <p style={{ marginTop: "clamp(48px,8vw,80px)", maxWidth: 280, fontSize: "clamp(12px,1vw,14px)", fontWeight: 300, lineHeight: 1.6, color: "rgba(0,0,0,0.52)", letterSpacing: "-0.01em" }}>
                AI generează întregul cod sursă al website-ului și îl implementează automat în contul tău Vercel — fără să trebuiască să știi programare.
              </p>
            </div>
          </div>

          {/* Card 2 — dark (video) */}
          <div style={{ position: "relative", display: "flex", flexDirection: "column", height: "clamp(380px,35vw,460px)", overflow: "hidden", borderRadius: 16, background: "#0a0a0a" }}>
            <div style={{ position: "relative", width: "100%", overflow: "hidden", height: "75%" }}>
              <video style={{ display: "block", width: "100%", height: "100%", objectFit: "cover" }} src={BENEFITS_VIDEO} autoPlay loop muted playsInline />
              <div style={{ pointerEvents: "none", position: "absolute", bottom: 0, left: 0, right: 0, height: 128, background: "linear-gradient(to bottom, transparent, #0a0a0a)" }} aria-hidden />
            </div>
            <div style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "flex-start", padding: "clamp(24px,3vw,32px)" }}>
              <h3 style={{ fontSize: "clamp(1.1rem,1.8vw,1.5rem)", fontWeight: 300, lineHeight: 1.3, letterSpacing: "-0.025em", color: "#fff" }}>
                design profesional<br/>adaptat afacerii tale
              </h3>
            </div>
          </div>

          {/* Card 3 — light */}
          <div style={{ position: "relative", display: "flex", flexDirection: "column", height: "clamp(380px,35vw,460px)", overflow: "hidden", borderRadius: 16, background: "#f2f2f2", padding: "clamp(24px,3vw,32px)" }}>
            <div style={{ position: "absolute", top: -112, right: -112, width: 224, height: 224, borderRadius: "50%", background: "#1e3a8a", opacity: 0.18, filter: "blur(60px)" }} />
            <div style={{ position: "relative", zIndex: 10, display: "flex", height: "100%", flexDirection: "column" }}>
              <h3 style={{ fontSize: "clamp(1.1rem,1.8vw,1.5rem)", fontWeight: 300, lineHeight: 1.3, letterSpacing: "-0.025em", color: "#1d1d1f" }}>
                cod sursă<br/>proprietatea ta
              </h3>
              <p style={{ marginTop: "auto", maxWidth: 320, fontSize: "clamp(12px,1vw,14px)", fontWeight: 300, lineHeight: 1.6, color: "rgba(0,0,0,0.52)", letterSpacing: "-0.01em" }}>
                Primești codul sursă complet. Fără lock-in, fără abonamente ascunse. Hosted pe contul tău Vercel pentru totdeauna.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Pricing — WHITE ─────────────────────────────────────────────── */}
      <section id="preturi" style={{ position: "relative", width: "100%", background: "#fff", scrollMarginTop: 96, padding: "clamp(48px,8vw,80px) clamp(16px,4vw,40px)" }}>
        <div style={{ maxWidth: 560, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ marginBottom: 16, fontSize: "clamp(2rem,4vw,3.2rem)", fontWeight: 300, letterSpacing: "-0.04em", color: "#1d1d1f" }}>
            un singur preț
          </h2>
          <p style={{ marginBottom: 48, fontSize: "clamp(13px,1.4vw,18px)", fontWeight: 300, color: "rgba(0,0,0,0.45)", letterSpacing: "-0.01em" }}>
            fără abonamente, fără surprize
          </p>

          <div style={{ position: "relative", borderRadius: 16, background: "#f2f2f2", padding: "clamp(32px,5vw,56px)", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -80, left: "50%", transform: "translateX(-50%)", width: 160, height: 160, borderRadius: "50%", background: "#FA8453", opacity: 0.15, filter: "blur(60px)" }} />
            <p style={{ fontSize: "clamp(4rem,9vw,7rem)", fontWeight: 500, letterSpacing: "-0.04em", lineHeight: 1, color: "#1d1d1f" }}>€49.99</p>
            <p style={{ marginTop: 8, fontSize: 13, fontWeight: 300, color: "rgba(0,0,0,0.38)", letterSpacing: "-0.01em" }}>plată unică</p>
            <ul style={{ marginTop: 32, display: "flex", flexDirection: "column", gap: 12, textAlign: "left" }}>
              {[
                "website profesional generat de AI",
                "implementare în contul tău Vercel",
                "cod sursă complet — al tău",
                "design responsiv pentru mobile",
                "SEO de bază inclus",
              ].map(item => (
                <li key={item} style={{ display: "flex", gap: 12, fontSize: "clamp(13px,1.1vw,15px)", fontWeight: 300, color: "rgba(0,0,0,0.62)", letterSpacing: "-0.01em" }}>
                  <span style={{ color: "#FA8453", flexShrink: 0 }}>✓</span> {item}
                </li>
              ))}
            </ul>
            <a href="/signup" style={{ display: "block", marginTop: 32, borderRadius: 9999, padding: "14px 0", textAlign: "center", fontSize: 14, fontWeight: 500, color: "#000", background: GRADIENT_CTA, letterSpacing: "-0.01em" }}>
              începe acum
            </a>
          </div>
        </div>
      </section>

      {/* ─── Contact — WHITE ─────────────────────────────────────────────── */}
      <section id="contact" style={{ position: "relative", width: "100%", background: "#fff", scrollMarginTop: 96, padding: "clamp(48px,8vw,80px) clamp(16px,4vw,40px)" }}>
        <div style={{ maxWidth: 560, margin: "0 auto" }}>
          <h2 style={{ marginBottom: 16, fontSize: "clamp(2rem,4vw,3.2rem)", fontWeight: 300, letterSpacing: "-0.04em", color: "#1d1d1f" }}>
            hai să vorbim
          </h2>
          <p style={{ marginBottom: 40, fontSize: "clamp(13px,1.4vw,18px)", fontWeight: 300, color: "rgba(0,0,0,0.45)", letterSpacing: "-0.01em" }}>
            spune-ne despre afacerea ta
          </p>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <input
              type="email" required value={email} onChange={e => setEmail(e.target.value)}
              placeholder="email@afacereata.ro"
              style={{ width: "100%", borderRadius: 12, background: "#f2f2f2", padding: "16px 20px", fontSize: 14, fontWeight: 300, color: "#1d1d1f", border: "1px solid rgba(0,0,0,0.1)", outline: "none", letterSpacing: "-0.01em", transition: "border-color .2s" }}
              onFocus={e => e.target.style.borderColor = "rgba(0,0,0,0.28)"}
              onBlur={e => e.target.style.borderColor = "rgba(0,0,0,0.1)"}
            />
            <textarea
              rows={4} placeholder="Descrie-ți afacerea..."
              style={{ width: "100%", borderRadius: 12, background: "#f2f2f2", padding: "16px 20px", fontSize: 14, fontWeight: 300, color: "#1d1d1f", border: "1px solid rgba(0,0,0,0.1)", outline: "none", letterSpacing: "-0.01em", resize: "vertical", transition: "border-color .2s" }}
              onFocus={e => e.target.style.borderColor = "rgba(0,0,0,0.28)"}
              onBlur={e => e.target.style.borderColor = "rgba(0,0,0,0.1)"}
            />
            <button type="submit" style={{ borderRadius: 9999, padding: "14px 0", fontSize: 14, fontWeight: 500, color: "#000", background: GRADIENT_CTA, letterSpacing: "-0.01em", cursor: "pointer" }}>
              trimite mesaj
            </button>
          </form>
        </div>
      </section>

      {/* ─── Footer — WHITE ──────────────────────────────────────────────── */}
      <footer style={{ width: "100%", background: "#fff", padding: "clamp(24px,4vw,32px) clamp(16px,4vw,40px)", borderTop: "1px solid rgba(0,0,0,0.08)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <a href="/" style={{ display: "flex", alignItems: "center", gap: 8, color: "#1d1d1f" }}>
            <LogoMark className="h-4 w-4" fill="#1d1d1f" />
            <span style={{ fontSize: 14, fontWeight: 500, letterSpacing: "-0.02em" }}>insixlive</span>
          </a>
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            {NAV.map(link => (
              <a key={link.href} href={link.href} style={{ fontSize: 13, fontWeight: 300, color: "rgba(0,0,0,0.38)", letterSpacing: "-0.01em" }}>{link.label}</a>
            ))}
            <a href="/privacy" style={{ fontSize: 13, fontWeight: 300, color: "rgba(0,0,0,0.38)", letterSpacing: "-0.01em" }}>confidențialitate</a>
          </div>
          <p style={{ fontSize: 12, fontWeight: 300, color: "rgba(0,0,0,0.3)", letterSpacing: "-0.01em" }}>© {new Date().getFullYear()} insixlive</p>
        </div>
      </footer>
    </div>
  );
}
