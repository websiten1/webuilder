"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { DemoConsult } from "@/app/components/SiteDemos";

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

const FAQ_ITEMS: [string, string][] = [
  ["Do I need to know how to code?",     "No. You describe your business in plain English. We generate the site, deploy it, and you can edit later through your dashboard or in the code directly."],
  ["Who owns the website?",              "You do. The code is yours, the Vercel project is in your account, and the domain (if you connect one) belongs to you."],
  ["Is there a subscription?",           "No subscription on the generated website. You pay once. Vercel hosting is free for most small sites. Custom domains are paid separately to a registrar."],
  ["What happens after I pay?",          "We generate the site, push it to your Vercel, and send you the deploy URL. The whole flow takes around six minutes."],
  ["Can I connect my own domain?",       "Yes. You can connect a domain from any registrar (GoDaddy, Namecheap, Porkbun, Cloudflare, etc.) or buy a new one separately."],
  ["What counts as a change?",           "Updating copy, swapping a section, adjusting colors, adding a service, changing contact info. Custom backends and complex integrations are out of scope."],
  ["Can I move away from Vercel?",       "Yes. The code is a standard Next.js project — host it anywhere that runs Node or static sites."],
  ["Do you include hosting?",            "We deploy to your Vercel account. Their Hobby plan is free and works for most small sites. Hosting cost on Vercel is separate from us."],
];

function FAQ() {
  const [open, setOpen] = useState<number>(0);
  return (
    <section className="page-pad scroll-in" style={{ padding: "96px 28px", maxWidth: 920, margin: "0 auto" }}>
      <span style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, letterSpacing: "0.14em", textTransform: "uppercase" as const }}>// FAQ</span>
      <h2 style={{ fontFamily: T.font, fontSize: "clamp(1.8rem, 3vw, 2.6rem)", fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1.1, marginTop: 14, marginBottom: 40 }}>Common questions.</h2>
      <div style={{ borderTop: `1px solid ${T.line}` }}>
        {FAQ_ITEMS.map(([q, a], i) => (
          <div key={q} style={{ borderBottom: `1px solid ${T.line}` }}>
            <button
              onClick={() => setOpen(open === i ? -1 : i)}
              style={{ width: "100%", padding: "20px 0", display: "flex", alignItems: "center", justifyContent: "space-between", background: "none", border: "none", cursor: "pointer", textAlign: "left", fontFamily: T.font, fontSize: 16, fontWeight: 600, color: T.ink, letterSpacing: -0.2 }}
            >
              {q}
              <span style={{ width: 30, height: 30, borderRadius: 15, background: open === i ? T.ink : T.bg2, color: open === i ? "#fff" : T.ink, display: "flex", alignItems: "center", justifyContent: "center", transition: "all .2s", flexShrink: 0, marginLeft: 16 }}>
                <svg width="12" height="12" viewBox="0 0 12 12">
                  <path d={open === i ? "M2 6h8" : "M2 6h8M6 2v8"} stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </span>
            </button>
            {open === i && (
              <div style={{ paddingBottom: 22, fontFamily: T.font, fontSize: 15, color: T.muted, lineHeight: 1.65, maxWidth: 720 }}>{a}</div>
            )}
          </div>
        ))}
      </div>
    </section>
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
            <div className="hero-demo" style={{ overflow: "visible" }}>
              <img
                src="/hero.png"
                alt="insixlive — AI website generation"
                style={{
                  width: "120%",
                  marginLeft: "-10%",
                  marginTop: "-4%",
                  display: "block",
                  mixBlendMode: "multiply" as const,
                  pointerEvents: "none",
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

        {/* ── PAIN: Traditional vs insixlive ─────────────────── */}
        <section className="page-pad scroll-in" style={{ padding: "96px 28px", maxWidth: 1200, margin: "0 auto" }}>
          <span style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, letterSpacing: "0.14em", textTransform: "uppercase" as const }}>// the rental trap</span>
          <h2 style={{ fontFamily: T.font, fontSize: "clamp(1.8rem, 3vw, 2.6rem)", fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1.1, marginTop: 14, marginBottom: 16 }}>
            Your business needs a website.<br/><span style={{ color: T.muted }}>Agencies know that.</span>
          </h2>
          <p style={{ fontFamily: T.font, fontSize: 16, color: T.muted, lineHeight: 1.7, maxWidth: 680, marginBottom: 48 }}>
            A small business website should not cost €1,000 upfront and another monthly fee just to stay online. Most local businesses need a clean, professional website that works — and belongs to them.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }} className="hero-grid">
            {/* Traditional */}
            <div style={{ padding: 32, borderRadius: 18, background: "#fff", border: `1px solid ${T.line}` }}>
              <div style={{ fontFamily: T.mono, fontSize: 11, fontWeight: 700, color: T.muted, textTransform: "uppercase" as const, letterSpacing: "0.08em", marginBottom: 14 }}>Traditional website</div>
              <div style={{ fontFamily: T.font, fontSize: 32, fontWeight: 800, letterSpacing: -1, marginBottom: 4, color: T.ink }}>€1,000+</div>
              <div style={{ fontFamily: T.font, fontSize: 13, color: T.muted, marginBottom: 24 }}>upfront, plus monthly fees</div>
              {["Weeks of back-and-forth", "Locked inside a closed platform", "Small changes = extra invoices", "You don't fully own the result"].map(s => (
                <div key={s} style={{ display: "flex", gap: 10, padding: "8px 0", fontFamily: T.font, fontSize: 14, color: "#4A5568", borderBottom: `1px solid ${T.line}` }}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke={T.six} strokeWidth="1.8" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 1 }}><path d="M4 4l8 8M12 4l-8 8"/></svg>
                  {s}
                </div>
              ))}
            </div>
            {/* insixlive */}
            <div style={{ padding: 32, borderRadius: 18, background: T.ink, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: -80, right: -60, width: 240, height: 240, borderRadius: 120, background: "radial-gradient(circle, rgba(0,179,119,0.30), rgba(0,179,119,0) 65%)", filter: "blur(15px)", pointerEvents: "none" }}/>
              <div style={{ position: "relative" }}>
                <div style={{ fontFamily: T.mono, fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,.35)", textTransform: "uppercase" as const, letterSpacing: "0.08em", marginBottom: 14 }}>insixlive</div>
                <div style={{ fontFamily: T.mono, fontSize: 32, fontWeight: 700, letterSpacing: -1, marginTop: 0, marginBottom: 4, color: "#fff" }}>from €49</div>
                <div style={{ fontFamily: T.font, fontSize: 13, color: "rgba(255,255,255,.45)", marginBottom: 24 }}>one-time, then free</div>
                {["Live in around 6 minutes", "Deployed to your own Vercel", "Full source code is yours", "No subscription, ever"].map(s => (
                  <div key={s} style={{ display: "flex", gap: 10, padding: "8px 0", fontFamily: T.font, fontSize: 14, color: "rgba(255,255,255,.85)", borderBottom: "1px solid rgba(255,255,255,.07)" }}>
                    <svg width="14" height="14" viewBox="0 0 10 10" fill="none" style={{ flexShrink: 0, marginTop: 2 }}><path d="M2 5l2 2 4-4" stroke="#4ADE80" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    {s}
                  </div>
                ))}
              </div>
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
                { name: "Markus Lehmann", biz: "Acme Plumbing · Munich", quote: "I described the business in two sentences. Six minutes later I had a website I could send to the printer. No subscription, no monthly bill.", plan: "Pro", accent: T.six },
                { name: "Maria Coelho",   biz: "Maria's Hair · Lisbon",  quote: "My old site was on a builder I was paying €18/month for. I rebuilt with insixlive and now I just own the code. The math is brutal in their favor.", plan: "Basic", accent: "#4ADE80" },
                { name: "Dr. Anna Kohl", biz: "Kohl Dental · Berlin",   quote: "I wanted a clean, calm, trustworthy site. The first draft was 80% of the way there — three small edits and we shipped it.", plan: "Premium", accent: "#7DD3FC" },
              ].map((t, i) => (
                <div key={i} style={{ background: "#fff", border: `1px solid ${T.line}`, borderRadius: 16, padding: "28px", display: "flex", flexDirection: "column" }}>
                  <svg width="22" height="22" viewBox="0 0 22 22" style={{ marginBottom: 18, color: t.accent, flexShrink: 0 }}>
                    <path d="M4 14c0-4 3-7 6-7v3c-1 0-3 1-3 4h3v6H4v-6zM13 14c0-4 3-7 6-7v3c-1 0-3 1-3 4h3v6h-6v-6z" fill="currentColor" opacity="0.85"/>
                  </svg>
                  <p style={{ fontFamily: T.font, fontSize: 15, color: T.ink, lineHeight: 1.6, flex: 1, marginBottom: 22 }}>
                    {t.quote}
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 18, background: T.bg2, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: T.font, fontSize: 13, fontWeight: 700, color: T.ink, flexShrink: 0 }}>
                      {t.name.split(" ").map((p: string) => p[0]).slice(0, 2).join("")}
                    </div>
                    <div>
                      <p style={{ fontFamily: T.font, fontSize: 14, fontWeight: 600, color: T.ink, margin: 0 }}>{t.name}</p>
                      <p style={{ fontFamily: T.mono, fontSize: 11, color: T.muted, margin: "2px 0 0" }}>{t.biz} · {t.plan}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── OWNERSHIP (dark) ─────────────────────────────────── */}
        <section style={{ background: T.ink, padding: "96px 28px", position: "relative", overflow: "hidden" }}>
          {/* Glow */}
          <div style={{ position: "absolute", top: 0, right: -200, width: 600, height: 600, borderRadius: 300, background: "radial-gradient(circle, rgba(255,90,31,0.18), rgba(255,90,31,0) 65%)", filter: "blur(20px)", pointerEvents: "none" }}/>
          <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative" }}>
            <div className="own-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 56, alignItems: "center" }}>
              {/* Left: text + ownership list */}
              <div>
                <span style={{ fontFamily: T.mono, fontSize: 10, color: "rgba(255,255,255,.35)", letterSpacing: "0.14em", textTransform: "uppercase" as const }}>// ownership</span>
                <h2 style={{ fontFamily: T.font, fontSize: "clamp(1.8rem, 3.5vw, 3rem)", fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1.05, color: "#F9F9F7", marginTop: 14, marginBottom: 24, maxWidth: 500 }}>
                  You don&apos;t rent your website.<br/><span style={{ color: "#4ADE80" }}>You own it.</span>
                </h2>
                <p style={{ fontFamily: T.font, fontSize: 16, color: "rgba(255,255,255,.55)", lineHeight: 1.7, maxWidth: 480, marginBottom: 28 }}>
                  Most website builders keep your business inside their platform. insixlive gives you a real website deployed to your own Vercel account, with code you can keep forever.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {[
                    ["Full source code", "Every file in your repo."],
                    ["Your Vercel account", "The site is deployed under your control."],
                    ["Your custom domain", "Use one you own or buy one separately."],
                    ["No lock-in", "Move the code anywhere later."],
                    ["No subscription", "Pay once for the generated website."],
                  ].map(([t, s]) => (
                    <div key={t} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                      <div style={{ width: 22, height: 22, borderRadius: 11, background: "rgba(74,222,128,0.12)", border: "1px solid rgba(74,222,128,0.35)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                        <svg width="10" height="10" viewBox="0 0 10 10"><path d="M2 5l2 2 4-4" stroke="#4ADE80" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </div>
                      <div>
                        <div style={{ fontFamily: T.font, fontSize: 15, fontWeight: 600, color: "#fff" }}>{t}</div>
                        <div style={{ fontFamily: T.font, fontSize: 13, color: "rgba(255,255,255,.45)" }}>{s}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: flow diagram */}
              <div>
                {[
                  { label: "Your business info",        sub: "name · services · vibe",           color: "#D4D8E0", glow: "rgba(212,216,224,0.15)", bg: "rgba(255,255,255,0.05)" },
                  { label: "insixlive · AI generation", sub: "claude-sonnet · Next.js · ~6 min",  color: "#C792EA", glow: "rgba(199,146,234,0.15)", bg: "rgba(199,146,234,0.08)" },
                  { label: "Your Vercel account",       sub: "deploy under your name",            color: "#7DD3FC", glow: "rgba(125,211,252,0.15)", bg: "rgba(125,211,252,0.08)" },
                  { label: "Your live website + code",  sub: "yourbusiness.com · forever",        color: "#4ADE80", glow: "rgba(74,222,128,0.15)", bg: "rgba(74,222,128,0.08)" },
                ].map((row, i, arr) => (
                  <div key={row.label}>
                    <div style={{ padding: "18px 22px", borderRadius: 12, background: row.bg, border: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", gap: 16 }}>
                      <div style={{ width: 10, height: 10, borderRadius: 5, background: row.color, boxShadow: `0 0 10px ${row.color}`, flexShrink: 0 }}/>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontFamily: T.mono, fontSize: 14, color: "#fff", fontWeight: 600 }}>{row.label}</div>
                        <div style={{ fontFamily: T.mono, fontSize: 11, color: "rgba(255,255,255,.35)", marginTop: 2 }}>{row.sub}</div>
                      </div>
                    </div>
                    {i < arr.length - 1 && (
                      <div style={{ textAlign: "center", color: "rgba(255,255,255,.2)", fontFamily: T.mono, fontSize: 18, lineHeight: "28px" }}>↓</div>
                    )}
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
        <FAQ />

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
