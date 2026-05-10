"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function Home() {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => { if (d.user) setLoggedIn(true); })
      .catch(() => {});
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=Instrument+Sans:ital,wght@0,400;0,500;0,600;1,400&family=JetBrains+Mono:wght@400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --bg:     #F9F9F7;
          --bg-2:   #F2F2EF;
          --bg-3:   #EAEAE6;
          --ink:    #0A0A0A;
          --ink-2:  #404040;
          --ink-3:  #8C8C89;
          --border: #E2E2DE;
          --fd: 'Syne', system-ui, sans-serif;
          --fb: 'Instrument Sans', system-ui, sans-serif;
          --fm: 'JetBrains Mono', 'Courier New', monospace;
        }

        html { scroll-behavior: smooth; }

        .tag {
          font-family: var(--fm);
          font-size: 10px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--ink-3);
          display: block;
        }

        .ph {
          background: var(--bg-2);
          border: 1.5px dashed var(--border);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 10px;
          color: var(--ink-3);
          font-family: var(--fm);
          font-size: 10px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .ph-dark {
          background: rgba(255,255,255,0.04);
          border: 1.5px dashed rgba(255,255,255,0.12);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 10px;
          color: rgba(255,255,255,0.22);
          font-family: var(--fm);
          font-size: 10px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .btn-blk {
          display: inline-flex; align-items: center; justify-content: center;
          background: var(--ink); color: #F9F9F7;
          padding: 13px 28px;
          font-family: var(--fb); font-size: 14px; font-weight: 500;
          text-decoration: none; border: 1px solid var(--ink);
          cursor: pointer; transition: opacity .15s; white-space: nowrap;
        }
        .btn-blk:hover { opacity: .78; }

        .btn-wht {
          display: inline-flex; align-items: center; justify-content: center;
          background: #F9F9F7; color: var(--ink);
          padding: 13px 28px;
          font-family: var(--fb); font-size: 14px; font-weight: 500;
          text-decoration: none; border: 1px solid rgba(255,255,255,.3);
          cursor: pointer; transition: opacity .15s; white-space: nowrap;
        }
        .btn-wht:hover { opacity: .82; }

        .btn-ghost {
          display: inline-flex; align-items: center; justify-content: center;
          background: transparent; color: var(--ink);
          padding: 12px 27px;
          font-family: var(--fb); font-size: 14px; font-weight: 500;
          text-decoration: none; border: 1px solid var(--border);
          cursor: pointer; transition: border-color .15s; white-space: nowrap;
        }
        .btn-ghost:hover { border-color: var(--ink-2); }

        .step-row {
          display: flex; gap: 20px;
          padding: 22px 0;
          border-bottom: 1px solid var(--border);
        }
        .step-row:last-child { border-bottom: none; }

        @keyframes ticker {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .ticker-track { animation: ticker 30s linear infinite; }
        .ticker-track:hover { animation-play-state: paused; }

        @keyframes fu {
          from { opacity:0; transform:translateY(14px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .fu  { animation: fu .65s ease both; }
        .fu1 { animation: fu .65s .1s ease both; opacity:0; }
        .fu2 { animation: fu .65s .2s ease both; opacity:0; }
        .fu3 { animation: fu .65s .35s ease both; opacity:0; }

        .faq-item { border-bottom: 1px solid var(--border); padding-bottom: 28px; margin-bottom: 28px; }
        .faq-item:last-child { border-bottom: none; }

        /* ── RESPONSIVE ── */
        @media (max-width: 900px) {
          .hero-grid  { grid-template-columns: 1fr !important; }
          .own-grid   { grid-template-columns: 1fr !important; }
          .stack-grid { grid-template-columns: 1fr 1fr !important; }
          .port-grid  { grid-template-columns: 1fr 1fr !important; }
          .split      { flex-direction: column !important; gap: 32px !important; }
        }
        @media (max-width: 600px) {
          .port-grid  { grid-template-columns: 1fr !important; }
          .nav-links  { display: none !important; }
          .stack-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div style={{ background: "var(--bg)", color: "var(--ink)", minHeight: "100vh" }}>

        {/* ─── NAV ──────────────────────────────────────────── */}
        <nav style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
          background: "rgba(249,249,247,.9)", backdropFilter: "blur(14px)",
          borderBottom: "1px solid var(--border)",
          height: 58,
        }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 28px", height: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24 }}>

            {/* Logo */}
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: 9, textDecoration: "none", flexShrink: 0 }}>
              <img src="/logo.png" alt="" style={{ height: 26, width: "auto" }}
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
              <span style={{ fontFamily: "var(--fd)", fontWeight: 700, fontSize: 17, color: "var(--ink)", letterSpacing: "-0.03em" }}>Insixlive</span>
            </Link>

            {/* Links */}
            <div className="nav-links" style={{ display: "flex", alignItems: "center", gap: 28 }}>
              {[["#how", "How it works"], ["#own", "Ownership"], ["#pricing", "Pricing"]].map(([href, label]) => (
                <a key={href} href={href} style={{ fontFamily: "var(--fb)", fontSize: 14, color: "var(--ink-2)", textDecoration: "none", transition: "color .15s" }}
                  onMouseEnter={(e) => ((e.target as HTMLElement).style.color = "var(--ink)")}
                  onMouseLeave={(e) => ((e.target as HTMLElement).style.color = "var(--ink-2)")}>{label}</a>
              ))}
            </div>

            {/* CTA */}
            {loggedIn ? (
              <Link href="/dashboard" className="btn-blk" style={{ padding: "9px 20px" }}>Dashboard</Link>
            ) : (
              <div style={{ display: "flex", gap: 8 }}>
                <Link href="/login" className="btn-ghost" style={{ padding: "9px 18px" }}>Log in</Link>
                <Link href="/signup" className="btn-blk" style={{ padding: "9px 20px" }}>Get started</Link>
              </div>
            )}
          </div>
        </nav>

        {/* ─── HERO ─────────────────────────────────────────── */}
        <section style={{ paddingTop: 110, paddingBottom: 80, padding: "110px 28px 80px", maxWidth: 1200, margin: "0 auto" }}>
          <div className="fu" style={{ maxWidth: 780 }}>
            <span className="tag">AI-generated · Vercel-deployed · Code on GitHub</span>
            <h1 style={{
              fontFamily: "var(--fd)", fontWeight: 800,
              fontSize: "clamp(3rem, 6.5vw, 5.8rem)",
              lineHeight: 1.0, letterSpacing: "-0.04em",
              color: "var(--ink)", margin: "20px 0 22px",
              textWrap: "balance" as never,
            }}>
              Your website.<br />Live in six minutes.
            </h1>
            <p style={{
              fontFamily: "var(--fb)", fontSize: "clamp(1rem, 1.5vw, 1.1rem)",
              color: "var(--ink-2)", lineHeight: 1.75,
              maxWidth: 500, marginBottom: 36,
            }}>
              Describe your business. Our AI generates a production-ready website and deploys it to your own Vercel account. The code is yours, forever.
            </p>
            <div className="fu1" style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
              <Link href={loggedIn ? "/dashboard" : "/signup"} className="btn-blk" style={{ fontSize: 15, padding: "15px 32px" }}>
                {loggedIn ? "Go to Dashboard" : "Build your website — €49.99"}
              </Link>
              <span style={{ fontFamily: "var(--fm)", fontSize: 11, color: "var(--ink-3)", letterSpacing: "0.06em" }}>
                ONE-TIME · NO MONTHLY FEES
              </span>
            </div>
          </div>

          {/* ── Hero video placeholder ── */}
          <div className="fu2 ph" style={{
            marginTop: 60, width: "100%",
            height: "clamp(280px, 44vw, 580px)",
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4}>
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
            <span>Hero demo video or product screenshot</span>
            <span style={{ color: "var(--border)", fontSize: 9 }}>1920 × 1080 recommended · MP4 or PNG</span>
          </div>
        </section>

        {/* ─── TICKER ───────────────────────────────────────── */}
        <div style={{ borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", overflow: "hidden", height: 42, display: "flex", alignItems: "center" }}>
          <div className="ticker-track" style={{ display: "flex", whiteSpace: "nowrap" }}>
            {[...Array(2)].flatMap((_, pass) =>
              ["Next.js", "Vercel", "GitHub", "Claude AI", "€49.99 once", "6 minutes", "Zero lock-in", "100% yours", "No subscriptions", "Production-ready"].map(item => (
                <span key={`${pass}-${item}`} style={{ fontFamily: "var(--fm)", fontSize: 10, color: "var(--ink-3)", letterSpacing: "0.12em", textTransform: "uppercase", padding: "0 28px" }}>
                  {item} ·
                </span>
              ))
            )}
          </div>
        </div>

        {/* ─── HOW IT WORKS ─────────────────────────────────── */}
        <section id="how" style={{ padding: "100px 28px", maxWidth: 1200, margin: "0 auto" }}>
          <div className="hero-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "start" }}>

            {/* Left */}
            <div>
              <span className="tag">Process</span>
              <h2 style={{
                fontFamily: "var(--fd)", fontWeight: 700,
                fontSize: "clamp(2rem, 3.5vw, 3rem)",
                letterSpacing: "-0.04em", lineHeight: 1.05,
                marginTop: 16, marginBottom: 20,
                textWrap: "balance" as never,
              }}>
                Six steps.<br />Six minutes.<br />One live website.
              </h2>
              <p style={{ fontFamily: "var(--fb)", fontSize: 15, color: "var(--ink-2)", lineHeight: 1.75, maxWidth: 360, marginBottom: 40 }}>
                Every decision is handled for you — architecture, design, deployment. You fill in a questionnaire. We build the rest.
              </p>

              {/* Process video placeholder */}
              <div className="ph" style={{ height: 260 }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4}>
                  <polygon points="5 3 19 12 5 21 5 3"/>
                </svg>
                <span>Walkthrough video · 60s</span>
              </div>
            </div>

            {/* Right: numbered steps */}
            <div style={{ paddingTop: 4 }}>
              {[
                ["01", "Describe your business", "Name, type, description, target audience, location."],
                ["02", "Choose your aesthetic", "Design style, colour palette, typography, imagery approach."],
                ["03", "Select your pages", "Home, services, about, contact — plus portfolio, pricing, FAQ and more."],
                ["04", "Review your choices", "A full summary of every decision before anything is generated."],
                ["05", "Complete payment", "€49.99 once via Stripe. Secure, instant, non-recurring."],
                ["06", "Website live", "Code on your GitHub. Deployed to your Vercel. Live globally."],
              ].map(([n, title, sub]) => (
                <div key={n} className="step-row">
                  <span style={{ fontFamily: "var(--fm)", fontSize: 11, color: "var(--ink-3)", minWidth: 22, paddingTop: 2, flexShrink: 0 }}>{n}</span>
                  <div>
                    <p style={{ fontFamily: "var(--fd)", fontWeight: 600, fontSize: 15, color: "var(--ink)", marginBottom: 5 }}>{title}</p>
                    <p style={{ fontFamily: "var(--fb)", fontSize: 13, color: "var(--ink-3)", lineHeight: 1.6 }}>{sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── OWNERSHIP (dark section) ─────────────────────── */}
        <section id="own" style={{ background: "var(--ink)", padding: "100px 28px" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <span className="tag" style={{ color: "rgba(255,255,255,.35)" }}>Ownership</span>
            <h2 style={{
              fontFamily: "var(--fd)", fontWeight: 700,
              fontSize: "clamp(2rem, 3.8vw, 3.2rem)",
              letterSpacing: "-0.04em", lineHeight: 1.05,
              color: "#F9F9F7", marginTop: 16, marginBottom: 56,
              textWrap: "balance" as never, maxWidth: 580,
            }}>
              You don&apos;t rent a website.<br />You own one.
            </h2>

            <div className="own-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>

              {/* Photo placeholder */}
              <div className="ph-dark" style={{ height: 460 }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4}>
                  <rect width="18" height="18" x="3" y="3" rx="1.5"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/>
                </svg>
                <span>Dashboard screenshot or product photo</span>
              </div>

              {/* Ownership list */}
              <div style={{ background: "rgba(255,255,255,.04)", padding: "44px 40px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                {[
                  ["Full source code", "Every file, every line — pushed to your GitHub repository immediately."],
                  ["Your Vercel deployment", "Live on your Vercel account. You manage it. We can't touch it."],
                  ["Custom domain ready", "Connect any domain in minutes. Full step-by-step guide included."],
                  ["No recurring fees", "€49.99 once. We make nothing from you after that point."],
                  ["Zero lock-in", "Download the code and move it anywhere. Dependency on us: zero."],
                ].map(([title, desc], i, arr) => (
                  <div key={title as string} style={{
                    paddingBottom: i < arr.length - 1 ? 22 : 0,
                    marginBottom: i < arr.length - 1 ? 22 : 0,
                    borderBottom: i < arr.length - 1 ? "1px solid rgba(255,255,255,.08)" : "none",
                  }}>
                    <p style={{ fontFamily: "var(--fd)", fontWeight: 600, fontSize: 14, color: "#F9F9F7", marginBottom: 6 }}>{title}</p>
                    <p style={{ fontFamily: "var(--fb)", fontSize: 13, color: "rgba(255,255,255,.45)", lineHeight: 1.65 }}>{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ─── EXAMPLES GRID ────────────────────────────────── */}
        <section style={{ padding: "100px 28px", maxWidth: 1200, margin: "0 auto" }}>
          <div className="split" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 48, gap: 24 }}>
            <div>
              <span className="tag">Results</span>
              <h2 style={{
                fontFamily: "var(--fd)", fontWeight: 700,
                fontSize: "clamp(2rem, 3.5vw, 3rem)",
                letterSpacing: "-0.04em", lineHeight: 1.05,
                marginTop: 16, textWrap: "balance" as never, maxWidth: 460,
              }}>
                Websites built with Insixlive.
              </h2>
            </div>
            <Link href={loggedIn ? "/generate" : "/signup"} className="btn-ghost" style={{ flexShrink: 0 }}>
              Build yours →
            </Link>
          </div>

          <div className="port-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 2 }}>
            {[
              { label: "Restaurant · Bistro Marin", h: 360 },
              { label: "Photography · Sarah A. Studio", h: 360 },
              { label: "Consulting · Meridian Partners", h: 360 },
              { label: "Dental clinic · Dr. Park & Assoc.", h: 260 },
              { label: "Real estate · Kova Realty", h: 260 },
              { label: "Fitness studio · Form", h: 260 },
            ].map((item, i) => (
              <div key={i} className="ph" style={{ height: item.h }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4}>
                  <rect width="18" height="18" x="3" y="3" rx="1.5"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/>
                </svg>
                <span>{item.label}</span>
              </div>
            ))}
          </div>

          <p style={{ fontFamily: "var(--fm)", fontSize: 10, color: "var(--border)", letterSpacing: "0.1em", textTransform: "uppercase", textAlign: "center", marginTop: 20 }}>
            Place real website screenshots here when available
          </p>
        </section>

        {/* ─── INFRASTRUCTURE ───────────────────────────────── */}
        <section style={{ borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", background: "var(--bg-2)", padding: "80px 28px" }}>
          <div className="split" style={{ maxWidth: 1200, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 64 }}>
            <div style={{ maxWidth: 420 }}>
              <span className="tag">Infrastructure</span>
              <h2 style={{ fontFamily: "var(--fd)", fontWeight: 700, fontSize: "clamp(1.8rem, 3vw, 2.4rem)", letterSpacing: "-0.04em", lineHeight: 1.1, marginTop: 16, marginBottom: 18 }}>
                Built on the same stack as the companies you admire.
              </h2>
              <p style={{ fontFamily: "var(--fb)", fontSize: 14, color: "var(--ink-2)", lineHeight: 1.75 }}>
                Next.js, Vercel, GitHub, Claude AI. The infrastructure powering Fortune 500 products — available to every business for €49.99.
              </p>
            </div>
            <div className="stack-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, flexShrink: 0 }}>
              {[
                ["Next.js", "Framework"],
                ["Vercel", "Deployment & CDN"],
                ["GitHub", "Code storage"],
                ["Claude AI", "Code generation"],
              ].map(([name, desc]) => (
                <div key={name} style={{ padding: "26px 28px", background: "var(--bg)", border: "1px solid var(--border)" }}>
                  <p style={{ fontFamily: "var(--fd)", fontWeight: 700, fontSize: 18, color: "var(--ink)", marginBottom: 6 }}>{name}</p>
                  <p style={{ fontFamily: "var(--fm)", fontSize: 10, color: "var(--ink-3)", letterSpacing: "0.1em", textTransform: "uppercase" }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── COMPARISON ───────────────────────────────────── */}
        <section style={{ padding: "100px 28px", maxWidth: 960, margin: "0 auto" }}>
          <span className="tag">Comparison</span>
          <h2 style={{ fontFamily: "var(--fd)", fontWeight: 700, fontSize: "clamp(2rem, 3.5vw, 3rem)", letterSpacing: "-0.04em", lineHeight: 1.05, marginTop: 16, marginBottom: 48 }}>
            The math is simple.
          </h2>
          <div style={{ border: "1px solid var(--border)", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "var(--fb)", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--bg-2)" }}>
                  {["Platform", "Year 1", "Year 5", "Code ownership", "AI-generated"].map(h => (
                    <th key={h} style={{ padding: "12px 20px", textAlign: "left", fontFamily: "var(--fm)", fontSize: 10, fontWeight: 400, color: "var(--ink-3)", letterSpacing: "0.1em", textTransform: "uppercase" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { name: "Insixlive", y1: "€49.99", y5: "€49.99", owns: true, ai: true, hi: true },
                  { name: "Wix", y1: "€204", y5: "€1,020", owns: false, ai: false, hi: false },
                  { name: "Squarespace", y1: "€192", y5: "€960", owns: false, ai: false, hi: false },
                  { name: "Agency", y1: "€3–10k", y5: "€15k+", owns: true, ai: false, hi: false },
                ].map((row, i, arr) => (
                  <tr key={row.name} style={{ borderBottom: i < arr.length - 1 ? "1px solid var(--border)" : "none", background: row.hi ? "var(--bg)" : "transparent" }}>
                    <td style={{ padding: "14px 20px", fontWeight: row.hi ? 600 : 400, fontFamily: row.hi ? "var(--fd)" : "var(--fb)" }}>
                      {row.name}
                      {row.hi && <span style={{ marginLeft: 10, fontFamily: "var(--fm)", fontSize: 9, color: "var(--ink-3)", letterSpacing: "0.12em", textTransform: "uppercase" }}>← You</span>}
                    </td>
                    <td style={{ padding: "14px 20px", fontWeight: row.hi ? 600 : 400 }}>{row.y1}</td>
                    <td style={{ padding: "14px 20px", fontWeight: row.hi ? 600 : 400 }}>{row.y5}</td>
                    <td style={{ padding: "14px 20px", color: row.owns ? "var(--ink)" : "var(--ink-3)" }}>{row.owns ? "✓" : "—"}</td>
                    <td style={{ padding: "14px 20px", color: row.ai ? "var(--ink)" : "var(--ink-3)" }}>{row.ai ? "✓" : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ─── PRICING ──────────────────────────────────────── */}
        <section id="pricing" style={{ background: "var(--bg-2)", padding: "100px 28px", borderTop: "1px solid var(--border)" }}>
          <div style={{ maxWidth: 680, margin: "0 auto" }}>
            <span className="tag">Pricing</span>
            <h2 style={{ fontFamily: "var(--fd)", fontWeight: 700, fontSize: "clamp(2rem, 3.5vw, 3rem)", letterSpacing: "-0.04em", lineHeight: 1.05, marginTop: 16, marginBottom: 48 }}>
              One price.<br />No surprises.
            </h2>

            <div style={{ border: "1px solid var(--ink)", background: "var(--bg)", padding: "44px 44px 40px" }}>
              {/* Price + savings */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 36, flexWrap: "wrap", gap: 20 }}>
                <div>
                  <p style={{ fontFamily: "var(--fd)", fontWeight: 800, fontSize: "clamp(3.5rem, 6vw, 5rem)", letterSpacing: "-0.05em", lineHeight: 1, color: "var(--ink)" }}>€49.99</p>
                  <p style={{ fontFamily: "var(--fm)", fontSize: 10, color: "var(--ink-3)", letterSpacing: "0.12em", textTransform: "uppercase", marginTop: 8 }}>One-time payment · No subscription</p>
                </div>
                <div style={{ background: "var(--bg-2)", border: "1px solid var(--border)", padding: "14px 20px", alignSelf: "center" }}>
                  <p style={{ fontFamily: "var(--fm)", fontSize: 9, color: "var(--ink-3)", letterSpacing: "0.12em", textTransform: "uppercase" }}>vs Wix (5 years)</p>
                  <p style={{ fontFamily: "var(--fd)", fontWeight: 700, fontSize: 22, color: "var(--ink)", marginTop: 4 }}>Save €970</p>
                </div>
              </div>

              {/* Includes list */}
              <div style={{ borderTop: "1px solid var(--border)", paddingTop: 32, marginBottom: 36 }}>
                {[
                  "Complete custom website generated by AI",
                  "Deployed to your own Vercel account — you own the deployment",
                  "Full source code pushed to your GitHub",
                  "Fully responsive — mobile, tablet, desktop",
                  "Custom domain setup guide included",
                  "Request edits via dashboard for €15 per change",
                  "No monthly fees, no subscriptions, ever",
                ].map((item, i, arr) => (
                  <div key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: i < arr.length - 1 ? 14 : 0 }}>
                    <span style={{ fontFamily: "var(--fm)", fontSize: 12, color: "var(--ink-3)", paddingTop: 1, flexShrink: 0 }}>—</span>
                    <span style={{ fontFamily: "var(--fb)", fontSize: 14, color: "var(--ink-2)", lineHeight: 1.55 }}>{item}</span>
                  </div>
                ))}
              </div>

              <Link href="/signup" className="btn-blk" style={{ width: "100%", fontSize: 15, padding: "16px 24px" }}>
                Build your website now →
              </Link>
              <p style={{ fontFamily: "var(--fm)", fontSize: 10, color: "var(--ink-3)", letterSpacing: "0.08em", textTransform: "uppercase", textAlign: "center", marginTop: 16 }}>
                Stripe-secured · No commitment until generation starts
              </p>
            </div>
          </div>
        </section>

        {/* ─── FAQ ──────────────────────────────────────────── */}
        <section style={{ padding: "100px 28px", maxWidth: 820, margin: "0 auto" }}>
          <span className="tag">Questions</span>
          <h2 style={{ fontFamily: "var(--fd)", fontWeight: 700, fontSize: "clamp(2rem, 3vw, 2.6rem)", letterSpacing: "-0.04em", lineHeight: 1.05, marginTop: 16, marginBottom: 52 }}>
            Common questions.
          </h2>
          {[
            ["Do I need to know how to code?", "No. You describe your business, choose design preferences, pay once, and the website is live. Zero technical knowledge required."],
            ["Who owns the website after it's generated?", "You do. Completely. The code is on your GitHub, the deployment is on your Vercel account. We have no access or control after generation."],
            ["What if I need changes later?", "Request changes via your dashboard for €15 each. We regenerate the relevant sections and redeploy automatically."],
            ["How long does it actually take?", "Filling out the questionnaire takes 5–10 minutes. Generation and deployment happens in under 2 minutes."],
            ["What happens if I need to cancel Vercel later?", "You own the code. Download it, deploy to any provider — Netlify, Railway, AWS, a VPS, anything. You're not tied to Vercel."],
            ["What framework does it produce?", "Next.js with TypeScript, deployed to Vercel. The same stack used by major product companies. Fully production-ready output."],
          ].map(([q, a], i, arr) => (
            <div key={i} className="faq-item" style={i === arr.length - 1 ? { borderBottom: "none" } : {}}>
              <p style={{ fontFamily: "var(--fd)", fontWeight: 600, fontSize: 16, color: "var(--ink)", marginBottom: 10 }}>{q}</p>
              <p style={{ fontFamily: "var(--fb)", fontSize: 14, color: "var(--ink-2)", lineHeight: 1.75, maxWidth: 620 }}>{a}</p>
            </div>
          ))}
        </section>

        {/* ─── CTA (dark) ───────────────────────────────────── */}
        <section style={{ background: "var(--ink)", padding: "100px 28px" }}>
          <div style={{ maxWidth: 680, margin: "0 auto" }}>

            {/* Placeholder for hero visual */}
            <div className="ph-dark" style={{ height: 240, marginBottom: 64 }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4}>
                <polygon points="5 3 19 12 5 21 5 3"/>
              </svg>
              <span>Customer testimonial video or social proof visual</span>
            </div>

            <p style={{ fontFamily: "var(--fm)", fontSize: 10, color: "rgba(255,255,255,.3)", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 24 }}>Ready when you are</p>
            <h2 style={{
              fontFamily: "var(--fd)", fontWeight: 800,
              fontSize: "clamp(2.8rem, 5.5vw, 4.5rem)",
              letterSpacing: "-0.04em", lineHeight: 1.0,
              color: "#F9F9F7", marginBottom: 36,
              textWrap: "balance" as never,
            }}>
              Six minutes from now,<br />you&apos;re live.
            </h2>
            <Link href="/signup" className="btn-wht" style={{ fontSize: 15, padding: "16px 36px" }}>
              Build your website — €49.99
            </Link>
            <p style={{ fontFamily: "var(--fm)", fontSize: 10, color: "rgba(255,255,255,.2)", letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 20 }}>
              One-time · Stripe-secured · Yours forever
            </p>
          </div>
        </section>

        {/* ─── FOOTER ───────────────────────────────────────── */}
        <footer style={{ borderTop: "1px solid var(--border)", background: "var(--bg)", padding: "28px" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <img src="/logo.png" alt="" style={{ height: 20, width: "auto" }}
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
              <span style={{ fontFamily: "var(--fd)", fontWeight: 700, fontSize: 15, color: "var(--ink)", letterSpacing: "-0.03em" }}>Insixlive</span>
            </div>
            <p style={{ fontFamily: "var(--fm)", fontSize: 10, color: "var(--ink-3)", letterSpacing: "0.08em" }}>© 2026 INSIXLIVE · AI-POWERED WEBSITE GENERATION</p>
            <div style={{ display: "flex", gap: 22 }}>
              {loggedIn ? (
                <Link href="/dashboard" style={{ fontFamily: "var(--fb)", fontSize: 13, color: "var(--ink-3)", textDecoration: "none" }}>Dashboard</Link>
              ) : (
                <>
                  <Link href="/login" style={{ fontFamily: "var(--fb)", fontSize: 13, color: "var(--ink-3)", textDecoration: "none" }}>Log in</Link>
                  <Link href="/signup" style={{ fontFamily: "var(--fb)", fontSize: 13, color: "var(--ink-3)", textDecoration: "none" }}>Sign up</Link>
                </>
              )}
              <Link href="/help/setup-custom-domain" style={{ fontFamily: "var(--fb)", fontSize: 13, color: "var(--ink-3)", textDecoration: "none" }}>Domain setup</Link>
            </div>
          </div>
        </footer>

      </div>
    </>
  );
}
