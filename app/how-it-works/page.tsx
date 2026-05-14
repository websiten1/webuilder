"use client";
import Link from "next/link";
import { useState } from "react";
import SiteNav from "@/app/components/SiteNav";
import SiteFooter from "@/app/components/SiteFooter";
import { P, T } from "@/lib/design";

function Eyebrow({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
  const c = dark ? T.green : P.six;
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: P.mono, fontSize: 12, fontWeight: 600, letterSpacing: 0.4, textTransform: "uppercase" as const, color: c, marginBottom: 18 }}>
      <span style={{ width: 6, height: 6, borderRadius: 3, background: c, boxShadow: dark ? `0 0 8px ${c}` : "none" }}/>
      {children}
    </div>
  );
}

function Check({ size = 10, color = P.em2 }: { size?: number; color?: string }) {
  return <svg width={size} height={size} viewBox="0 0 10 10"><path d="M2 5l2 2 4-4" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}

function Badge({ children, color = T.green }: { children: React.ReactNode; color?: string }) {
  const bg = color === T.green ? "rgba(74,222,128,0.08)" : "rgba(255,90,31,0.10)";
  const bd = color === T.green ? "rgba(74,222,128,0.30)" : "rgba(255,90,31,0.35)";
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: P.mono, fontSize: 10.5, fontWeight: 700, color, letterSpacing: 0.5, textTransform: "uppercase" as const, padding: "5px 9px", borderRadius: 999, background: bg, border: `1px solid ${bd}` }}>
      <span style={{ width: 5, height: 5, borderRadius: 3, background: color, boxShadow: `0 0 8px ${color}` }}/>
      {children}
    </span>
  );
}

const STEPS = [
  {
    n: "01", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
    t: "Describe your business",
    s: "Tell us your business name, what you do, who you serve, your location, and the tone you want. Plain English — no jargon needed.",
    detail: ["Business name & tagline", "Services or products offered", "Target customers", "Location or service area", "Tone: friendly, professional, bold, calm…"],
  },
  {
    n: "02", icon: "M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01",
    t: "Choose your look",
    s: "Pick the visual style and palette that fits your brand. We have curated presets so you don't have to guess what looks good.",
    detail: ["Style: minimal, bold, warm, technical", "Color scheme from curated palettes", "Typography pairing", "Layout preference"],
  },
  {
    n: "03", icon: "M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z",
    t: "Pick your pages",
    s: "Choose which pages to include. Every site gets a Home page. Add exactly what you need — nothing more.",
    detail: ["Home (always included)", "About / Our story", "Services or Products", "Contact form", "Booking / Appointments", "Testimonials", "FAQ", "Gallery"],
  },
  {
    n: "04", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
    t: "Review the brief",
    s: "Before we generate anything, you see a full summary of your inputs. Confirm you're happy, or go back and change anything.",
    detail: ["Full summary of your inputs", "Page list confirmation", "Style preview", "Edit anything before continuing"],
  },
  {
    n: "05", icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z",
    t: "Pay once",
    s: "Stripe checkout. Choose your plan. That's it — no subscription, no monthly fee. You'll get a receipt by email.",
    detail: ["Stripe-secured checkout", "Basic: €49.99 — website generation", "Pro: €59.99 — includes 5 free edits", "Premium: €79.99 — 15 free edits", "Receipt emailed automatically"],
  },
  {
    n: "06", icon: "M5 3l14 9-14 9V3z",
    t: "Go live",
    s: "Claude Sonnet writes your Next.js code. We push it to your Vercel account. Your site is deployed globally in around six minutes.",
    detail: ["AI generates all pages & components", "Code pushed to your Vercel project", "Site goes live on a Vercel URL", "Deploy URL emailed to you", "Full source code in your repo"],
    highlight: true,
  },
];

const TECH_STACK = [
  { label: "Claude Sonnet",  sub: "Writes your Next.js code",      color: T.plum  },
  { label: "Next.js 16",     sub: "App Router · React 19",          color: T.sky   },
  { label: "Vercel Edge",    sub: "Global CDN · 99.9% uptime",      color: T.green },
  { label: "Tailwind CSS 4", sub: "Responsive · Mobile-first",      color: T.amber },
];

const HOW_FAQ: [string, string][] = [
  ["Can I see my site before paying?",    "No — generation happens after payment because it takes real compute time. But you review a full brief (your inputs, page list, style choices) before checkout, so you know exactly what we'll build."],
  ["What if I don't like the result?",    "Contact us at support@insixlive.com. We handle every case individually and want you to be happy with your website."],
  ["How long does generation actually take?", "Around six minutes, sometimes a little less. We generate all your pages in one pass, then deploy to Vercel's global edge network."],
  ["Do I need a Vercel account first?",   "No. We create one during the flow, or you can connect your existing Vercel account. Either way, the deployed project ends up under your name."],
  ["Can I edit the code myself?",         "Yes. You get a standard Next.js + Tailwind project. Any developer can pick it up. If you're not technical, you can request changes from your dashboard."],
];

export default function HowItWorksPage() {
  const [open, setOpen] = useState(-1);

  return (
    <>
      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        html{overflow-x:hidden;scroll-behavior:smooth}
        body{background:${P.bg};color:${P.ink};font-family:${P.font};overflow-x:hidden}
        a{text-decoration:none;color:inherit}
        .g2{display:grid}.g3{display:grid}
        @media(max-width:900px){
          .g2{grid-template-columns:1fr!important}
          .g3{grid-template-columns:1fr 1fr!important}
          .pp{padding-left:20px!important;padding-right:20px!important}
        }
        @media(max-width:600px){
          .g3{grid-template-columns:1fr!important}
          .pp{padding-left:16px!important;padding-right:16px!important}
        }
      `}</style>

      <SiteNav/>

      {/* ── HERO ── */}
      <section style={{ background: T.bg, color: "#fff", padding: "100px 0 80px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", backgroundImage: `radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)`, backgroundSize: "18px 18px" }}/>
        <div style={{ position: "absolute", top: -160, right: -120, width: 520, height: 520, borderRadius: 260, background: "radial-gradient(circle,rgba(255,90,31,0.32),rgba(255,90,31,0) 65%)", filter: "blur(20px)", pointerEvents: "none" }}/>
        <div className="pp" style={{ maxWidth: 1200, margin: "0 auto", padding: "0 32px", position: "relative" }}>
          <div style={{ marginBottom: 18, display: "flex", alignItems: "center", gap: 10, fontFamily: P.mono, fontSize: 13 }}>
            <span style={{ color: T.green }}>$</span>
            <span style={{ color: "rgba(255,255,255,0.75)" }}>insixlive create</span>
            <span style={{ color: T.amber }}>--name=my-site</span>
            <span style={{ display: "inline-block", width: 7, height: 14, background: T.green, animation: "caret 1s infinite", verticalAlign: "middle" }}/>
          </div>
          <Eyebrow dark>// from prompt to live</Eyebrow>
          <h1 style={{ fontFamily: P.font, fontSize: "clamp(2.8rem,5.5vw,72px)", lineHeight: 0.98, fontWeight: 700, letterSpacing: -3, color: "#fff", margin: "0 0 20px" }}>
            Six minutes from now,<br/><span style={{ color: T.six }}>your website is live.</span>
          </h1>
          <p style={{ fontFamily: P.font, fontSize: "clamp(1rem,1.5vw,19px)", lineHeight: 1.55, color: "rgba(255,255,255,0.62)", margin: "0 0 32px", maxWidth: 560 }}>
            Most builders take days to learn. Most freelancers take weeks. We take about six minutes — from your first input to a live URL under your name.
          </p>
          <div className="g3" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, maxWidth: 480, marginBottom: 32 }}>
            {[["from €49.99","One-time"],["~6 min","Live"],["100%","Code ownership"]].map(([v, l]) => (
              <div key={l} style={{ padding: "12px 16px", borderRadius: 10, background: "rgba(255,255,255,0.04)", border: `1px solid ${T.line}` }}>
                <div style={{ fontFamily: P.mono, fontSize: 20, fontWeight: 700, color: "#fff", letterSpacing: -0.4 }}>{v}</div>
                <div style={{ fontFamily: P.mono, fontSize: 10.5, color: T.muted, textTransform: "uppercase" as const, letterSpacing: 0.6, marginTop: 3 }}>{l}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link href="/signup" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "linear-gradient(180deg,#FF6A33 0%,#E54B14 100%)", color: "#fff", padding: "14px 22px", borderRadius: 12, fontFamily: P.font, fontSize: 15, fontWeight: 600, boxShadow: "0 1px 0 rgba(255,255,255,0.20) inset,0 14px 30px rgba(255,90,31,0.28)" }}>
              Build my website — from €49
              <svg width="14" height="14" viewBox="0 0 14 14"><path d="M3 7h8M8 4l3 3-3 3" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </Link>
            <Link href="/examples" style={{ display: "inline-flex", alignItems: "center", padding: "14px 22px", borderRadius: 12, fontFamily: P.font, fontSize: 15, fontWeight: 600, background: "rgba(255,255,255,0.05)", color: "#fff", border: "1px solid rgba(255,255,255,0.10)" }}>
              See examples
            </Link>
          </div>
        </div>
      </section>

      {/* ── STEPS ── */}
      <section className="pp" style={{ padding: "104px 32px", maxWidth: 1200, margin: "0 auto" }}>
        <Eyebrow>// the process</Eyebrow>
        <h2 style={{ fontFamily: P.font, fontSize: "clamp(1.8rem,3vw,48px)", fontWeight: 700, letterSpacing: -1.4, lineHeight: 1.02, color: P.ink, margin: "0 0 12px" }}>
          Six steps.<br/><span style={{ color: P.muted }}>One live website.</span>
        </h2>
        <p style={{ fontFamily: P.font, fontSize: 18, lineHeight: 1.5, color: P.muted, margin: "0 0 56px", maxWidth: 580 }}>
          Every step is designed to take as little time as possible. The longest part is waiting for the deploy — and that&apos;s only six minutes.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {STEPS.map((step) => (
            <div key={step.n} style={{ display: "grid", gridTemplateColumns: "60px 1fr", gap: 20, padding: "28px 28px", borderRadius: 16, background: step.highlight ? T.bg : "#fff", border: step.highlight ? "none" : `1px solid ${P.line}`, position: "relative", overflow: "hidden" }}>
              {step.highlight && (
                <>
                  <div style={{ position: "absolute", inset: 0, pointerEvents: "none", backgroundImage: `radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)`, backgroundSize: "18px 18px" }}/>
                  <div style={{ position: "absolute", top: -60, right: -60, width: 280, height: 280, borderRadius: 140, background: "radial-gradient(circle,rgba(255,90,31,0.35),rgba(255,90,31,0) 65%)", filter: "blur(15px)", pointerEvents: "none" }}/>
                </>
              )}
              <div style={{ position: "relative", paddingTop: 4 }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: step.highlight ? "rgba(255,90,31,0.12)" : P.bg2, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={step.highlight ? T.six : P.ink} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d={step.icon}/>
                  </svg>
                </div>
              </div>
              <div style={{ position: "relative" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8, flexWrap: "wrap" }}>
                  <span style={{ fontFamily: P.mono, fontSize: 11, fontWeight: 700, color: step.highlight ? T.six : P.muted, letterSpacing: 1 }}>{step.n}</span>
                  <h3 style={{ fontFamily: P.font, fontSize: 20, fontWeight: 700, color: step.highlight ? "#fff" : P.ink, letterSpacing: -0.4, margin: 0 }}>{step.t}</h3>
                  {step.highlight && <Badge color={T.six}>Live</Badge>}
                </div>
                <p style={{ fontFamily: P.font, fontSize: 15, color: step.highlight ? "rgba(255,255,255,0.62)" : P.muted, lineHeight: 1.6, marginBottom: 16, maxWidth: 640 }}>{step.s}</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                  {step.detail.map(d => (
                    <div key={d} style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: P.font, fontSize: 13, color: step.highlight ? "rgba(255,255,255,0.75)" : P.inkSoft }}>
                      <Check size={10} color={step.highlight ? T.green : P.em2}/>
                      {d}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── UNDER THE HOOD ── */}
      <section style={{ background: T.bg, padding: "104px 0", position: "relative", overflow: "hidden", borderTop: `1px solid ${T.line}` }}>
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", backgroundImage: `radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)`, backgroundSize: "18px 18px" }}/>
        <div style={{ position: "absolute", bottom: -200, left: -100, width: 600, height: 600, borderRadius: 300, background: "radial-gradient(circle,rgba(74,222,128,0.10),rgba(74,222,128,0) 65%)", filter: "blur(20px)", pointerEvents: "none" }}/>
        <div className="pp" style={{ maxWidth: 1200, margin: "0 auto", padding: "0 32px", position: "relative" }}>
          <div className="g2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 56, alignItems: "center" }}>
            <div>
              <Eyebrow dark>// under the hood</Eyebrow>
              <h2 style={{ fontFamily: P.font, fontSize: "clamp(1.8rem,3.5vw,48px)", fontWeight: 700, letterSpacing: -1.4, lineHeight: 1.02, color: "#fff", margin: "0 0 16px" }}>
                Real code. Real stack.<br/><span style={{ color: T.green }}>Yours to keep.</span>
              </h2>
              <p style={{ fontFamily: P.font, fontSize: 17, lineHeight: 1.55, color: "rgba(255,255,255,0.60)", margin: "0 0 32px", maxWidth: 480 }}>
                We don&apos;t use a proprietary builder or locked templates. Claude Sonnet writes real Next.js code. You get a repo, a Vercel project, and every file.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {[
                  ["Next.js App Router", "Standard React components, server-compatible"],
                  ["Tailwind CSS 4", "Utility-first CSS, fully customizable"],
                  ["TypeScript", "Type-safe code from the start"],
                  ["Vercel deployment", "Edge network, global CDN, auto-SSL"],
                  ["Git repository", "Full version history included"],
                  ["No lock-in", "Standard project — host anywhere"],
                ].map(([t, s]) => (
                  <div key={t} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                    <div style={{ width: 20, height: 20, borderRadius: 10, background: "rgba(74,222,128,0.12)", border: "1px solid rgba(74,222,128,0.35)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                      <Check size={10} color={T.green}/>
                    </div>
                    <div>
                      <div style={{ fontFamily: P.font, fontSize: 14, fontWeight: 600, color: "#fff" }}>{t}</div>
                      <div style={{ fontFamily: P.font, fontSize: 13, color: "rgba(255,255,255,0.45)" }}>{s}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {TECH_STACK.map(tech => (
                <div key={tech.label} style={{ padding: "18px 22px", borderRadius: 12, background: "rgba(255,255,255,0.04)", border: `1px solid ${T.line}`, display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 5, background: tech.color, boxShadow: `0 0 10px ${tech.color}`, flexShrink: 0 }}/>
                  <div>
                    <div style={{ fontFamily: P.mono, fontSize: 14, color: "#fff", fontWeight: 600 }}>{tech.label}</div>
                    <div style={{ fontFamily: P.mono, fontSize: 11, color: T.muted, marginTop: 2 }}>{tech.sub}</div>
                  </div>
                </div>
              ))}
              <div style={{ padding: "16px 20px", borderRadius: 12, background: T.bg2, border: `1px solid ${T.line}` }}>
                <div style={{ fontFamily: P.mono, fontSize: 11.5, lineHeight: 1.9, color: T.text }}>
                  {[
                    { t: "00:00", c: T.amber, k: "gen",  v: "claude-sonnet · writing code" },
                    { t: "02:14", c: T.sky,   k: "pkg",  v: "bundling · 47 files" },
                    { t: "04:38", c: T.green, k: "cdn",  v: "deploying to edge network" },
                    { t: "05:51", c: T.green, k: "live", v: "https://your-site.vercel.app" },
                  ].map(({ t, c, k, v }) => (
                    <div key={k} style={{ display: "flex", gap: 10 }}>
                      <span style={{ color: T.muted, width: 44, flexShrink: 0 }}>{t}</span>
                      <span style={{ color: c, fontWeight: 700, width: 36, flexShrink: 0 }}>{k}</span>
                      <span style={{ color: T.text }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="pp" style={{ padding: "104px 32px", maxWidth: 920, margin: "0 auto" }}>
        <Eyebrow>// questions about the process</Eyebrow>
        <h2 style={{ fontFamily: P.font, fontSize: "clamp(1.8rem,3vw,48px)", fontWeight: 700, letterSpacing: -1.4, lineHeight: 1.02, color: P.ink, margin: "0 0 40px" }}>About the process.</h2>
        <div style={{ borderTop: `1px solid ${P.line}` }}>
          {HOW_FAQ.map(([q, a], i) => (
            <div key={q} style={{ borderBottom: `1px solid ${P.line}` }}>
              <button
                onClick={() => setOpen(open === i ? -1 : i)}
                style={{ width: "100%", padding: "20px 0", display: "flex", alignItems: "center", justifyContent: "space-between", background: "none", border: "none", cursor: "pointer", textAlign: "left" as const, fontFamily: P.font, fontSize: 17, fontWeight: 600, color: P.ink, letterSpacing: -0.2 }}
              >
                {q}
                <span style={{ width: 30, height: 30, borderRadius: 15, background: open === i ? P.ink : P.bg2, color: open === i ? "#fff" : P.ink, display: "flex", alignItems: "center", justifyContent: "center", transition: "all .2s", flexShrink: 0, marginLeft: 16 }}>
                  <svg width="12" height="12" viewBox="0 0 12 12"><path d={open === i ? "M2 6h8" : "M2 6h8M6 2v8"} stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                </span>
              </button>
              {open === i && <div style={{ paddingBottom: 22, fontFamily: P.font, fontSize: 15, color: P.inkSoft, lineHeight: 1.65, maxWidth: 720 }}>{a}</div>}
            </div>
          ))}
        </div>
        <div style={{ marginTop: 32, fontFamily: P.font, fontSize: 14, color: P.muted }}>
          More questions?{" "}
          <a href="mailto:support@insixlive.com" style={{ color: P.six, fontWeight: 500, textDecoration: "none" }}>support@insixlive.com</a>
          {" "}or visit the{" "}
          <Link href="/faq" style={{ color: P.six, fontWeight: 500 }}>full FAQ</Link>.
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ background: T.bg, padding: "120px 32px", position: "relative", overflow: "hidden", textAlign: "center" as const }}>
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", backgroundImage: `radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)`, backgroundSize: "18px 18px" }}/>
        <div style={{ position: "absolute", top: -200, left: "50%", transform: "translateX(-50%)", width: 900, height: 900, borderRadius: 450, background: "radial-gradient(circle,rgba(255,90,31,0.22),rgba(255,90,31,0) 60%)", filter: "blur(20px)", pointerEvents: "none" }}/>
        <div style={{ maxWidth: 720, margin: "0 auto", position: "relative" }}>
          <Eyebrow dark>// ready to go</Eyebrow>
          <h2 style={{ fontFamily: P.font, fontSize: "clamp(2.2rem,4.5vw,64px)", fontWeight: 700, letterSpacing: -2.5, lineHeight: 0.98, color: "#fff", margin: "0 0 20px" }}>
            Six minutes from now,<br/><span style={{ color: T.six }}>you&apos;re live.</span>
          </h2>
          <p style={{ fontFamily: P.font, fontSize: 18, lineHeight: 1.5, color: "rgba(255,255,255,0.55)", margin: "0 auto 32px", maxWidth: 480 }}>
            Stop putting it off. The whole process takes less time than a coffee break.
          </p>
          <Link href="/signup" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "linear-gradient(180deg,#FF6A33 0%,#E54B14 100%)", color: "#fff", padding: "16px 28px", borderRadius: 12, fontFamily: P.font, fontSize: 16, fontWeight: 700, boxShadow: "0 1px 0 rgba(255,255,255,0.20) inset,0 14px 30px rgba(255,90,31,0.32)" }}>
            Build my website — from €49
            <svg width="14" height="14" viewBox="0 0 14 14"><path d="M3 7h8M8 4l3 3-3 3" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </Link>
          <p style={{ fontFamily: P.mono, fontSize: 12, color: "rgba(255,255,255,0.3)", letterSpacing: "0.08em", textTransform: "uppercase" as const, marginTop: 18 }}>One-time · Stripe-secured · Yours forever</p>
        </div>
      </section>

      <SiteFooter/>
      <style>{`@keyframes caret{0%,50%{opacity:1}50.01%,100%{opacity:0}}`}</style>
    </>
  );
}
