"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { DemoBistro, DemoConsult } from "@/app/components/SiteDemos";

// ─── Animated counter ─────────────────────────────────────────────────────────
function useCountUp(target: number, duration = 1600, started = false) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!started) return;
    let start: number | null = null;
    const step = (ts: number) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setValue(Math.round(ease * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, started]);
  return value;
}

function MetricCounter({ value, suffix, label, prefix }: { value: number; suffix?: string; label: string; prefix?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);
  const count = useCountUp(value, 1400, started);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setStarted(true); obs.disconnect(); } }, { threshold: 0.4 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} style={{ textAlign: "center" as const }}>
      <div style={{ fontFamily: '-apple-system, system-ui, sans-serif', fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 800, color: "#fff", letterSpacing: -1.5, lineHeight: 1 }}>
        {prefix}{count.toLocaleString()}{suffix}
      </div>
      <div style={{ fontFamily: 'ui-monospace, monospace', fontSize: 10, color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em", textTransform: "uppercase" as const, marginTop: 8 }}>{label}</div>
    </div>
  );
}

const T = {
  ink:  "#0A0E14",
  six:  "#FF5A1F",
  em:   "#00B377",
  em2:  "#009062",
  emSoft: "#E5F7EE",
  bg:   "#FAFAFA",
  bg2:  "#F2F2EF",
  line: "#E2E2DE",
  muted:"#6B7180",
  font: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
  mono: 'ui-monospace, "SF Mono", "JetBrains Mono", Menlo, monospace',
};

function Mark({ size = 28 }: { size?: number }) {
  return (
    <div style={{ width: size, height: size, borderRadius: size * 0.28, background: T.ink, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <span style={{ fontFamily: T.font, fontSize: size * 0.62, fontWeight: 800, color: T.six, letterSpacing: -0.5, lineHeight: 1 }}>6</span>
    </div>
  );
}

function LiveChip({ text = "Live in 6 minutes" }: { text?: string }) {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 11px", borderRadius: 999, background: T.emSoft, color: T.em2, fontFamily: T.font, fontSize: 12, fontWeight: 600 }}>
      <span style={{ width: 6, height: 6, borderRadius: 3, background: T.em }} />
      {text}
    </div>
  );
}

export default function Home() {
  const [loggedIn, setLoggedIn] = useState(false);
  useEffect(() => {
    fetch("/api/auth/me").then(r => r.json()).then(d => { setLoggedIn(!!d.user); }).catch(() => { setLoggedIn(false); });
    // Scroll-in observer for sections
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("visible"); } });
    }, { threshold: 0.12 });
    document.querySelectorAll(".scroll-in").forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const ctaHref = loggedIn ? "/dashboard" : "/signup";
  const ctaLabel = loggedIn ? "Go to Dashboard" : "Build my site — from €49";

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { overflow-x: hidden; }
        body { background: ${T.bg}; color: ${T.ink}; font-family: ${T.font}; overflow-x: hidden; }
        @keyframes ticker { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .tk { animation: ticker 32s linear infinite; }
        .tk:hover { animation-play-state: paused; }

        @media (max-width: 900px) {
          .hero-grid  { grid-template-columns: 1fr !important; }
          .own-grid   { grid-template-columns: 1fr !important; }
          .demo-grid  { grid-template-columns: 1fr 1fr !important; }
          .nav-links  { display: none !important; }
          .split      { flex-direction: column !important; align-items: flex-start !important; }
          .stack-grid { grid-template-columns: 1fr 1fr !important; }
          .hero-demo  { display: none !important; }
          .page-pad   { padding-left: 20px !important; padding-right: 20px !important; }
          .stats-row  { gap: 20px !important; flex-wrap: wrap !important; }
        }

        @media (max-width: 600px) {
          .demo-grid  { grid-template-columns: 1fr 1fr !important; }
          .nav-cta-pair { gap: 6px !important; }
          .nav-cta-pair a:first-child { display: none !important; }
          .page-pad   { padding-left: 16px !important; padding-right: 16px !important; }
          .stats-row  { gap: 16px !important; }
          .comparison-wrap { overflow-x: auto !important; -webkit-overflow-scrolling: touch; }
          .comparison-wrap table { min-width: 480px; }
          .pricing-inner { padding: 28px 20px !important; }
          .metrics-grid { grid-template-columns: 1fr 1fr !important; }
          .testi-grid { grid-template-columns: 1fr !important; }
        }
        @keyframes scrollIn {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .scroll-in { opacity: 0; }
        .scroll-in.visible { animation: scrollIn .55s ease both; }

        @keyframes carouselLtr {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @keyframes carouselRtl {
          from { transform: translateX(-50%); }
          to   { transform: translateX(0); }
        }
        .carousel-ltr {
          animation: carouselLtr 40s linear infinite;
        }
        .carousel-rtl {
          animation: carouselRtl 36s linear infinite;
        }
        .carousel-ltr:hover,
        .carousel-rtl:hover {
          animation-play-state: paused;
        }
      `}</style>

      <div style={{ background: T.bg, minHeight: "100vh" }}>

        {/* ── NAV ─────────────────────────────────────────────── */}
        <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, background: "rgba(250,250,248,.92)", backdropFilter: "blur(14px)", borderBottom: `1px solid ${T.line}`, height: 58 }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 28px", height: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24 }}>
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: 9, textDecoration: "none" }}>
              <Mark size={26} />
              <span style={{ fontFamily: T.font, fontSize: 16, fontWeight: 700, color: T.ink, letterSpacing: -0.5 }}>insixlive</span>
            </Link>
            <div className="nav-links" style={{ display: "flex", alignItems: "center", gap: 28 }}>
              {[["#how", "How it works"], ["#demos", "Examples"], ["/pricing", "Pricing"]].map(([h, l]) => (
                <a key={h} href={h} style={{ fontFamily: T.font, fontSize: 14, color: T.muted, textDecoration: "none" }}>{l}</a>
              ))}
            </div>
            {loggedIn ? (
              <Link href="/dashboard" style={{ background: T.ink, color: "#fff", padding: "9px 20px", borderRadius: 10, fontFamily: T.font, fontSize: 14, fontWeight: 600, textDecoration: "none" }}>Dashboard</Link>
            ) : (
              <div className="nav-cta-pair" style={{ display: "flex", gap: 8 }}>
                <Link href="/login" style={{ color: T.muted, padding: "9px 18px", borderRadius: 10, fontFamily: T.font, fontSize: 14, fontWeight: 500, textDecoration: "none", border: `1px solid ${T.line}` }}>Log in</Link>
                <Link href="/signup" style={{ background: T.ink, color: "#fff", padding: "9px 20px", borderRadius: 10, fontFamily: T.font, fontSize: 14, fontWeight: 600, textDecoration: "none", boxShadow: "0 4px 12px rgba(10,14,20,0.14)" }}>Get started</Link>
              </div>
            )}
          </div>
        </nav>

        {/* ── HERO ────────────────────────────────────────────── */}
        <section className="page-pad" style={{ maxWidth: 1200, margin: "0 auto", padding: "80px 28px 60px" }}>
          <div className="hero-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1.1fr", gap: 56, alignItems: "center" }}>
            <div>
              <LiveChip />
              <h1 style={{ fontFamily: T.font, fontSize: "clamp(2.6rem, 5vw, 4.2rem)", fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1.04, color: T.ink, margin: "18px 0 18px" }}>
                Your website.<br/>
                <span style={{ color: T.six }}>Live in six minutes.</span>
              </h1>
              <p style={{ fontFamily: T.font, fontSize: "clamp(1rem, 1.5vw, 1.1rem)", color: T.muted, lineHeight: 1.75, maxWidth: 460, marginBottom: 32 }}>
                Describe your business. Our AI generates a complete, production-ready website and deploys it to your own Vercel account. The code is yours, forever.
              </p>
              <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                <Link href={ctaHref} style={{ background: T.ink, color: "#fff", padding: "15px 30px", borderRadius: 12, fontFamily: T.font, fontSize: 15, fontWeight: 700, textDecoration: "none", letterSpacing: -0.3, boxShadow: "0 6px 20px rgba(10,14,20,0.18)", display: "inline-flex", alignItems: "center", gap: 8 }}>
                  {ctaLabel}
                  <svg width="16" height="16" viewBox="0 0 16 16"><path d="M3 8h10M9 4l4 4-4 4" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </Link>
                <span style={{ fontFamily: T.mono, fontSize: 11, color: T.muted, letterSpacing: "0.06em", textTransform: "uppercase" as const }}>One-time · No subscriptions</span>
              </div>
              {/* Stats */}
              <div className="stats-row" style={{ marginTop: 36, display: "flex", gap: 28 }}>
                {[["from €49", "one-time"], ["6 min", "to live"], ["100%", "yours forever"]].map(([v, l]) => (
                  <div key={l}>
                    <div style={{ fontFamily: T.font, fontSize: 22, fontWeight: 800, color: T.ink, letterSpacing: -0.8 }}>{v}</div>
                    <div style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, marginTop: 2, letterSpacing: "0.08em", textTransform: "uppercase" as const }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>
            {/* Hero image — hidden on mobile */}
            <div className="hero-demo">
              <img
                src="/hero.png"
                alt="insixlive — AI website generation"
                style={{
                  width: "110%",
                  marginLeft: "-5%",
                  display: "block",
                  mixBlendMode: "multiply" as const,
                }}
              />
            </div>
          </div>
        </section>

        {/* ── TICKER ──────────────────────────────────────────── */}
        <div style={{ borderTop: `1px solid ${T.line}`, borderBottom: `1px solid ${T.line}`, overflow: "hidden", height: 40, display: "flex", alignItems: "center" }}>
          <div className="tk" style={{ display: "flex", whiteSpace: "nowrap" }}>
            {[...Array(2)].flatMap((_, p) =>
              ["Next.js", "Vercel", "GitHub", "Claude AI", "€49 one-time", "6 minutes", "Zero lock-in", "100% yours", "No subscriptions", "Production-ready"].map(item => (
                <span key={`${p}-${item}`} style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, letterSpacing: "0.12em", textTransform: "uppercase" as const, padding: "0 24px" }}>{item} ·</span>
              ))
            )}
          </div>
        </div>

        {/* ── METRICS (animated counters) ─────────────────────── */}
        <section style={{ background: T.ink, padding: "64px 28px" }}>
          <div style={{ maxWidth: 960, margin: "0 auto" }}>
            <p style={{ fontFamily: T.mono, fontSize: 10, color: "rgba(255,255,255,.3)", letterSpacing: "0.14em", textTransform: "uppercase" as const, textAlign: "center", marginBottom: 40 }}>
              The numbers
            </p>
            <div className="metrics-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 32 }}>
              <MetricCounter value={6}   suffix=" min" label="Average time to live" />
              <MetricCounter value={49}  prefix="€" suffix="" label="Starting price (one-time)" />
              <MetricCounter value={100} suffix="%" label="Code ownership" />
              <MetricCounter value={0}   suffix="" prefix="€" label="Monthly fees, ever" />
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ────────────────────────────────────── */}
        <section id="how" className="page-pad scroll-in" style={{ padding: "96px 28px", maxWidth: 1200, margin: "0 auto" }}>
          <div className="hero-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 72, alignItems: "start" }}>
            <div>
              <span style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, letterSpacing: "0.14em", textTransform: "uppercase" as const }}>Process</span>
              <h2 style={{ fontFamily: T.font, fontSize: "clamp(1.8rem, 3vw, 2.6rem)", fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1.1, marginTop: 14, marginBottom: 18 }}>
                Six steps.<br/>Six minutes.<br/>One live website.
              </h2>
              <p style={{ fontFamily: T.font, fontSize: 15, color: T.muted, lineHeight: 1.75, maxWidth: 360 }}>
                Every decision is handled — architecture, design, deployment. You fill in a brief. We build the rest.
              </p>
            </div>
            <div>
              {[
                ["01", "Describe your business", "Name, type, services, target audience."],
                ["02", "Choose your aesthetic", "Design style, colour palette, typography."],
                ["03", "Select your pages", "Home, services, about, contact and more."],
                ["04", "Review your choices", "Full summary before anything is generated."],
                ["05", "Complete payment", "€49 one-time via Stripe. Non-recurring."],
                ["06", "Website live", "Code on GitHub, deployed to your Vercel."],
              ].map(([n, t, s], i, arr) => (
                <div key={n} style={{ display: "flex", gap: 18, padding: "18px 0", borderBottom: i < arr.length - 1 ? `1px solid ${T.line}` : "none" }}>
                  <span style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, minWidth: 20, paddingTop: 2, flexShrink: 0 }}>{n}</span>
                  <div>
                    <p style={{ fontFamily: T.font, fontSize: 14, fontWeight: 600, color: T.ink, marginBottom: 4 }}>{t}</p>
                    <p style={{ fontFamily: T.font, fontSize: 13, color: T.muted, lineHeight: 1.55 }}>{s}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── DEMOS (carousel) ────────────────────────────────── */}
        <section id="demos" style={{ background: T.bg2, borderTop: `1px solid ${T.line}`, borderBottom: `1px solid ${T.line}`, padding: "80px 0 72px", overflow: "hidden" }}>
          {/* Header */}
          <div className="page-pad" style={{ maxWidth: 1200, margin: "0 auto 44px", padding: "0 28px", display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 20 }}>
            <div>
              <span style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, letterSpacing: "0.14em", textTransform: "uppercase" as const }}>Results</span>
              <h2 style={{ fontFamily: T.font, fontSize: "clamp(1.8rem, 3vw, 2.6rem)", fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1.1, marginTop: 14 }}>
                Websites built<br/>with insixlive.
              </h2>
            </div>
            <Link href={ctaHref} style={{ border: `1px solid ${T.line}`, color: T.ink, padding: "10px 22px", borderRadius: 10, fontFamily: T.font, fontSize: 14, fontWeight: 500, textDecoration: "none", flexShrink: 0 }}>
              Build yours →
            </Link>
          </div>

          {/* Infinite scroll row 1 — left to right */}
          <div style={{ overflow: "hidden", marginBottom: 16 }}>
            <div className="carousel-ltr" style={{ display: "flex", gap: 16, width: "max-content" }}>
              {[...Array(2)].flatMap(() =>
                [1,2,3,4,5,6,7,8].map(n => (
                  <div key={`r1-${n}`} style={{ width: 360, height: 225, borderRadius: 12, overflow: "hidden", flexShrink: 0, boxShadow: "0 4px 20px rgba(0,0,0,0.10)", border: `1px solid ${T.line}` }}>
                    <img src={`/demos/site-${String(n).padStart(2,"0")}.png`} alt={`Website ${n}`}
                      style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top", display: "block" }} />
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Infinite scroll row 2 — right to left (offset) */}
          <div style={{ overflow: "hidden" }}>
            <div className="carousel-rtl" style={{ display: "flex", gap: 16, width: "max-content" }}>
              {[...Array(2)].flatMap(() =>
                [9,10,11,12,13,14,15,8].map(n => (
                  <div key={`r2-${n}`} style={{ width: 360, height: 225, borderRadius: 12, overflow: "hidden", flexShrink: 0, boxShadow: "0 4px 20px rgba(0,0,0,0.10)", border: `1px solid ${T.line}` }}>
                    <img src={`/demos/site-${String(n).padStart(2,"0")}.png`} alt={`Website ${n}`}
                      style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top", display: "block" }} />
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* ── TESTIMONIALS ────────────────────────────────────── */}
        <section style={{ background: "#FFF8F4", borderTop: `3px solid ${T.six}`, padding: "96px 28px" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 52, flexWrap: "wrap", gap: 16 }}>
              <div>
                <span style={{ fontFamily: T.mono, fontSize: 10, color: T.six, letterSpacing: "0.14em", textTransform: "uppercase" as const }}>What users say</span>
                <h2 style={{ fontFamily: T.font, fontSize: "clamp(1.8rem, 3vw, 2.6rem)", fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1.1, marginTop: 14 }}>
                  Real businesses,<br/>live in minutes.
                </h2>
              </div>
              <div style={{ display: "flex", gap: 4 }}>
                {[...Array(5)].map((_,i) => <span key={i} style={{ color: T.six, fontSize: 18 }}>★</span>)}
                <span style={{ fontFamily: T.font, fontSize: 13, color: T.muted, marginLeft: 8, alignSelf: "center" }}>5.0 average</span>
              </div>
            </div>
            <div className="testi-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18 }}>
              {[
                { name: "Maria S.", role: "Hair Salon Owner · Munich", quote: "I described my salon, clicked generate, and within 2 minutes had a website I'm actually proud to share. Saved me thousands.", tier: "Pro" },
                { name: "Thomas P.", role: "Plumber · Berlin", quote: "Set up my plumbing business website in the morning, had my first online inquiry by afternoon. The ROI on €50 is genuinely insane.", tier: "Basic" },
                { name: "Sophie L.", role: "Photographer · Paris", quote: "Finally a website that looks like I hired a real designer. The code is clean, loads fast, and I can request changes without bugging anyone.", tier: "Premium" },
                { name: "James O.", role: "Consultant · Dublin", quote: "The Pro plan is a no-brainer. Used 3 of my free edits to tweak the messaging. My clients think I paid an agency thousands.", tier: "Pro" },
                { name: "Ana R.", role: "Dental Clinic · Madrid", quote: "We had a website up before I even finished my morning coffee. Patients are already booking online. Completely worth it.", tier: "Premium" },
                { name: "Lukas B.", role: "Electrician · Vienna", quote: "I'm not tech-savvy at all. Just answered some questions and boom — professional website with my logo and colors. Brilliant.", tier: "Basic" },
              ].map((t, i) => (
                <div key={i} style={{ background: "#fff", border: `1px solid ${T.line}`, borderRadius: 16, padding: "24px 22px", display: "flex", flexDirection: "column", gap: 16 }}>
                  <div style={{ display: "flex", gap: 3 }}>
                    {[...Array(5)].map((_,j) => <span key={j} style={{ color: T.six, fontSize: 13 }}>★</span>)}
                  </div>
                  <p style={{ fontFamily: T.font, fontSize: 14, color: T.ink, lineHeight: 1.7, flex: 1, fontStyle: "italic" }}>
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                    <div>
                      <p style={{ fontFamily: T.font, fontSize: 13, fontWeight: 600, color: T.ink, margin: 0 }}>{t.name}</p>
                      <p style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, margin: "2px 0 0", letterSpacing: 0.3 }}>{t.role}</p>
                    </div>
                    <span style={{ fontFamily: T.mono, fontSize: 9, color: T.six, background: "rgba(255,90,31,0.08)", border: "1px solid rgba(255,90,31,0.18)", borderRadius: 6, padding: "3px 8px", letterSpacing: "0.08em", textTransform: "uppercase" as const, flexShrink: 0 }}>
                      {t.tier}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── OWNERSHIP (dark) ─────────────────────────────────── */}
        <section style={{ background: T.ink, padding: "96px 28px" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <span style={{ fontFamily: T.mono, fontSize: 10, color: "rgba(255,255,255,.35)", letterSpacing: "0.14em", textTransform: "uppercase" as const }}>Ownership</span>
            <h2 style={{ fontFamily: T.font, fontSize: "clamp(1.8rem, 3.5vw, 3rem)", fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1.05, color: "#F9F9F7", marginTop: 14, marginBottom: 52, maxWidth: 540 }}>
              You don&apos;t rent a website.<br/>You own one.
            </h2>
            <div className="own-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
              {/* Screenshot demo */}
              <div style={{ background: T.bg, borderRadius: 0, overflow: "hidden" }}>
                <DemoBistro />
              </div>
              {/* Ownership list */}
              <div style={{ background: "rgba(255,255,255,.04)", padding: "40px 38px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                {[
                  ["Full source code", "Every file, every line — pushed to your GitHub immediately."],
                  ["Your Vercel deployment", "Live on your account. You manage it. We can't touch it."],
                  ["Custom domain ready", "Connect any domain in minutes. Full guide included."],
                  ["No recurring fees", "€49 one-time. We make nothing from you after that."],
                  ["Zero lock-in", "Take the code anywhere. Dependency on us: zero."],
                ].map(([title, desc], i, arr) => (
                  <div key={title} style={{ paddingBottom: i < arr.length - 1 ? 20 : 0, marginBottom: i < arr.length - 1 ? 20 : 0, borderBottom: i < arr.length - 1 ? "1px solid rgba(255,255,255,.08)" : "none" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                      <div style={{ width: 18, height: 18, borderRadius: 9, background: "rgba(0,179,119,0.2)", border: "1px solid rgba(0,179,119,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <svg width="9" height="9" viewBox="0 0 10 10"><path d="M2 5l2 2 4-4" stroke="#00B377" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </div>
                      <p style={{ fontFamily: T.font, fontSize: 14, fontWeight: 600, color: "#F9F9F7", margin: 0 }}>{title}</p>
                    </div>
                    <p style={{ fontFamily: T.font, fontSize: 13, color: "rgba(255,255,255,.45)", lineHeight: 1.65, margin: 0, paddingLeft: 26 }}>{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── COMPARISON ──────────────────────────────────────── */}
        <section className="page-pad scroll-in" style={{ padding: "96px 28px", maxWidth: 960, margin: "0 auto" }}>
          <span style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, letterSpacing: "0.14em", textTransform: "uppercase" as const }}>Comparison</span>
          <h2 style={{ fontFamily: T.font, fontSize: "clamp(1.8rem, 3vw, 2.6rem)", fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1.1, marginTop: 14, marginBottom: 44 }}>The math is simple.</h2>
          <div className="comparison-wrap" style={{ border: `1px solid ${T.line}`, overflow: "hidden", borderRadius: 2 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: T.font, fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${T.line}`, background: T.bg2 }}>
                  {["Platform", "Year 1", "Year 5", "Code ownership", "AI-generated"].map(h => (
                    <th key={h} style={{ padding: "12px 20px", textAlign: "left", fontFamily: T.mono, fontSize: 10, fontWeight: 400, color: T.muted, letterSpacing: "0.1em", textTransform: "uppercase" as const }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { name: "insixlive", y1: "from €49", y5: "from €49", owns: true, ai: true, hi: true },
                  { name: "Wix", y1: "€204", y5: "€1,020", owns: false, ai: false, hi: false },
                  { name: "Squarespace", y1: "€192", y5: "€960", owns: false, ai: false, hi: false },
                  { name: "Agency", y1: "€3–10k", y5: "€15k+", owns: true, ai: false, hi: false },
                ].map((row, i, arr) => (
                  <tr key={row.name} style={{ borderBottom: i < arr.length - 1 ? `1px solid ${T.line}` : "none", background: row.hi ? T.bg : "transparent" }}>
                    <td style={{ padding: "14px 20px", fontWeight: row.hi ? 700 : 400 }}>
                      {row.name}
                      {row.hi && <span style={{ marginLeft: 8, fontFamily: T.mono, fontSize: 9, color: T.six, letterSpacing: "0.1em", textTransform: "uppercase" as const }}>← You</span>}
                    </td>
                    <td style={{ padding: "14px 20px", fontWeight: row.hi ? 700 : 400 }}>{row.y1}</td>
                    <td style={{ padding: "14px 20px", fontWeight: row.hi ? 700 : 400 }}>{row.y5}</td>
                    <td style={{ padding: "14px 20px", color: row.owns ? T.em2 : T.muted }}>{row.owns ? "✓" : "—"}</td>
                    <td style={{ padding: "14px 20px", color: row.ai ? T.em2 : T.muted }}>{row.ai ? "✓" : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── PRICING ─────────────────────────────────────────── */}
        <section id="pricing" className="page-pad scroll-in" style={{ background: T.bg2, borderTop: `1px solid ${T.line}`, padding: "96px 28px" }}>
          <div style={{ maxWidth: 640, margin: "0 auto" }}>
            <span style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, letterSpacing: "0.14em", textTransform: "uppercase" as const }}>Pricing</span>
            <h2 style={{ fontFamily: T.font, fontSize: "clamp(1.8rem, 3vw, 2.6rem)", fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1.1, marginTop: 14, marginBottom: 44 }}>One price. No surprises.</h2>
            <div className="pricing-inner" style={{ border: `1px solid ${T.ink}`, background: T.bg, padding: "44px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32, flexWrap: "wrap", gap: 20 }}>
                <div>
                  <p style={{ fontFamily: T.font, fontSize: "clamp(3rem, 5vw, 4.5rem)", fontWeight: 800, letterSpacing: "-0.05em", lineHeight: 1, color: T.ink, margin: 0 }}>€49.99</p>
                  <p style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, letterSpacing: "0.1em", textTransform: "uppercase" as const, marginTop: 6 }}>One-time · No subscription</p>
                </div>
                <div style={{ background: T.emSoft, border: `1px solid ${T.line}`, padding: "12px 18px", alignSelf: "center" }}>
                  <p style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, letterSpacing: "0.1em", textTransform: "uppercase" as const }}>vs Wix (5 years)</p>
                  <p style={{ fontFamily: T.font, fontSize: 20, fontWeight: 800, color: T.em2, margin: "4px 0 0", letterSpacing: -0.5 }}>Save €970</p>
                </div>
              </div>
              <div style={{ borderTop: `1px solid ${T.line}`, paddingTop: 28, marginBottom: 32 }}>
                {["Complete custom website generated by AI", "Deployed to your own Vercel account", "Full source code on your GitHub", "Fully responsive — mobile, tablet, desktop", "Custom domain setup guide included", "Request changes for €10 each", "No monthly fees, ever"].map((item, i) => (
                  <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: i < 6 ? 12 : 0 }}>
                    <span style={{ fontFamily: T.mono, fontSize: 11, color: T.muted, paddingTop: 1, flexShrink: 0 }}>—</span>
                    <span style={{ fontFamily: T.font, fontSize: 14, color: T.muted, lineHeight: 1.55 }}>{item}</span>
                  </div>
                ))}
              </div>
              <Link href={ctaHref} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", background: T.ink, color: "#fff", padding: "16px 24px", borderRadius: 12, fontFamily: T.font, fontSize: 15, fontWeight: 700, textDecoration: "none", letterSpacing: -0.2, boxShadow: "0 6px 20px rgba(10,14,20,0.16)" }}>
                {ctaLabel}
                <svg width="16" height="16" viewBox="0 0 16 16"><path d="M3 8h10M9 4l4 4-4 4" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </Link>
              <p style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, letterSpacing: "0.08em", textTransform: "uppercase" as const, textAlign: "center", marginTop: 14 }}>
                Stripe-secured · No commitment until generation starts
              </p>
            </div>
          </div>
        </section>

        {/* ── FAQ ─────────────────────────────────────────────── */}
        <section className="page-pad scroll-in" style={{ padding: "96px 28px", maxWidth: 800, margin: "0 auto" }}>
          <span style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, letterSpacing: "0.14em", textTransform: "uppercase" as const }}>Questions</span>
          <h2 style={{ fontFamily: T.font, fontSize: "clamp(1.8rem, 3vw, 2.6rem)", fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1.1, marginTop: 14, marginBottom: 48 }}>Common questions.</h2>
          {[
            ["Do I need to know how to code?", "No. Describe your business, choose preferences, pay once — your website is live. Zero technical knowledge required."],
            ["Who owns the website after it's generated?", "You do. Completely. Code is on your GitHub, deployment is on your Vercel. We have no access after generation."],
            ["What if I need changes later?", "Request changes from your dashboard for €10 each. We regenerate and redeploy automatically."],
            ["How long does it actually take?", "Filling out the questionnaire takes 5–10 minutes. Generation and deployment happen in under 2 minutes."],
            ["What if I need to move away from Vercel?", "Download the code and deploy anywhere — Netlify, AWS, a VPS, anything. You're not tied to Vercel."],
          ].map(([q, a], i, arr) => (
            <div key={q} style={{ borderBottom: i < arr.length - 1 ? `1px solid ${T.line}` : "none", paddingBottom: 24, marginBottom: 24 }}>
              <p style={{ fontFamily: T.font, fontSize: 15, fontWeight: 600, color: T.ink, marginBottom: 8 }}>{q}</p>
              <p style={{ fontFamily: T.font, fontSize: 14, color: T.muted, lineHeight: 1.75, maxWidth: 580, margin: 0 }}>{a}</p>
            </div>
          ))}
        </section>

        {/* ── CTA ─────────────────────────────────────────────── */}
        <section style={{ background: T.ink, padding: "96px 28px" }}>
          <div style={{ maxWidth: 680, margin: "0 auto" }}>
            {/* Demo in CTA */}
            <div style={{ marginBottom: 56, opacity: 0.85 }}><DemoConsult /></div>
            <p style={{ fontFamily: T.mono, fontSize: 10, color: "rgba(255,255,255,.3)", letterSpacing: "0.14em", textTransform: "uppercase" as const, marginBottom: 20 }}>Ready when you are</p>
            <h2 style={{ fontFamily: T.font, fontSize: "clamp(2.4rem, 5vw, 4rem)", fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1.04, color: "#F9F9F7", marginBottom: 32 }}>
              Six minutes from now,<br/>you&apos;re live.
            </h2>
            <Link href={ctaHref} style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#F9F9F7", color: T.ink, padding: "16px 32px", borderRadius: 12, fontFamily: T.font, fontSize: 15, fontWeight: 700, textDecoration: "none", letterSpacing: -0.2 }}>
              {ctaLabel}
              <svg width="16" height="16" viewBox="0 0 16 16"><path d="M3 8h10M9 4l4 4-4 4" stroke={T.ink} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </Link>
            <p style={{ fontFamily: T.mono, fontSize: 10, color: "rgba(255,255,255,.2)", letterSpacing: "0.08em", textTransform: "uppercase" as const, marginTop: 18 }}>One-time · Stripe-secured · Yours forever</p>
          </div>
        </section>

        {/* ── FOOTER ──────────────────────────────────────────── */}
        <footer style={{ borderTop: `1px solid ${T.line}`, background: T.bg, padding: "26px 28px" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <Mark size={22} />
              <span style={{ fontFamily: T.font, fontSize: 15, fontWeight: 700, color: T.ink, letterSpacing: -0.5 }}>insixlive</span>
            </div>
            <p style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, letterSpacing: "0.06em", textTransform: "uppercase" as const }}>© 2026 INSIXLIVE · AI-POWERED WEBSITE GENERATION</p>
            <div style={{ display: "flex", gap: 22 }}>
              {loggedIn
                ? <Link href="/dashboard" style={{ fontFamily: T.font, fontSize: 13, color: T.muted, textDecoration: "none" }}>Dashboard</Link>
                : <>
                    <Link href="/login" style={{ fontFamily: T.font, fontSize: 13, color: T.muted, textDecoration: "none" }}>Log in</Link>
                    <Link href="/signup" style={{ fontFamily: T.font, fontSize: 13, color: T.muted, textDecoration: "none" }}>Sign up</Link>
                  </>
              }
              <Link href="/help/setup-custom-domain" style={{ fontFamily: T.font, fontSize: 13, color: T.muted, textDecoration: "none" }}>Domain setup</Link>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
