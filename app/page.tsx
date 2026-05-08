"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const BG = "#050510";

const advantages = [
  {
    icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
    title: "You own the code",
    body: "Full source code pushed to your GitHub. No lock-in, no dependency on us.",
  },
  {
    icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: "Live in 100 seconds",
    body: "AI generates and Vercel deploys your site before you finish your coffee.",
  },
  {
    icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "Pay once, keep forever",
    body: "€49.99 flat. No monthly fees, no cancellation anxiety, no surprises.",
  },
  {
    icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: "Production quality",
    body: "Next.js, fully responsive, fast — the same stack Fortune 500 companies use.",
  },
  {
    icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
      </svg>
    ),
    title: "Deployed globally",
    body: "Hosted on Vercel's edge network. Fast everywhere, no server management.",
  },
  {
    icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
      </svg>
    ),
    title: "Editable anytime",
    body: "Hire a developer later, or edit it yourself. Full flexibility, zero friction.",
  },
];

const competitors = [
  { name: "WebBuilder", price: "€49.99", per: "one-time", ai: true, owns: true, setup: "100 sec", highlight: true },
  { name: "Wix",        price: "€17",    per: "/mo",      ai: false, owns: false, setup: "Hours" },
  { name: "Squarespace",price: "€16",    per: "/mo",      ai: false, owns: false, setup: "Hours" },
  { name: "Webflow",    price: "€14",    per: "/mo",      ai: false, owns: false, setup: "Days"  },
];

const infra = [
  { name: "Vercel",      label: "Deployment & CDN" },
  { name: "GitHub",      label: "Code storage" },
  { name: "Next.js",     label: "Framework" },
  { name: "AI Engine",   label: "Code generation" },
];

function Check({ dim }: { dim?: boolean }) {
  return (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
      style={{ color: dim ? "rgba(255,255,255,0.3)" : "#10b981", flexShrink: 0 }}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function Cross() {
  return (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
      style={{ color: "rgba(255,255,255,0.2)", flexShrink: 0 }}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

export default function Home() {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => { if (d.user) setLoggedIn(true); })
      .catch(() => {});
  }, []);

  return (
    <div style={{ background: BG, color: "#fff", minHeight: "100vh" }}>

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass" style={{ borderTop: "none", borderLeft: "none", borderRight: "none" }}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="font-bold tracking-tight" style={{ fontSize: 17 }}>WebBuilder</span>
          <div className="flex items-center gap-6">
            <a href="#how-it-works" className="text-sm hidden md:block" style={{ color: "var(--text2)" }}>How it works</a>
            <a href="#pricing"      className="text-sm hidden md:block" style={{ color: "var(--text2)" }}>Pricing</a>
            {loggedIn ? (
              <Link href="/dashboard" className="btn-primary px-5 py-2 text-sm rounded-lg">Go to Dashboard</Link>
            ) : (
              <>
                <Link href="/login"  className="text-sm" style={{ color: "var(--text2)" }}>Login</Link>
                <Link href="/signup" className="btn-primary px-5 py-2 text-sm rounded-lg">Get started</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden pt-36 pb-28 px-6 text-center">
        {/* Gradient orbs */}
        <div style={{
          position: "absolute", top: "-10%", left: "50%", transform: "translateX(-50%)",
          width: 700, height: 500,
          background: "radial-gradient(ellipse, rgba(99,102,241,0.22) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", top: "30%", left: "5%", width: 300, height: 300,
          background: "radial-gradient(circle, rgba(168,85,247,0.12), transparent)",
          borderRadius: "50%", filter: "blur(40px)", pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", top: "20%", right: "5%", width: 250, height: 250,
          background: "radial-gradient(circle, rgba(6,182,212,0.1), transparent)",
          borderRadius: "50%", filter: "blur(40px)", pointerEvents: "none",
        }} />

        <div className="relative max-w-4xl mx-auto">
          <div className="fade-up inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 text-xs font-medium mb-8"
            style={{ color: "var(--text2)" }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#10b981" }} />
            Launch price — Limited time offer
          </div>

          <h1 className="fade-up-1 font-bold tracking-tight mb-6"
            style={{ fontSize: "clamp(2.6rem, 5vw, 4.5rem)", lineHeight: 1.06 }}>
            Professional Website<br />
            <span className="grad-text">in 100 Seconds.</span>
          </h1>

          <p className="fade-up-2 mx-auto mb-10" style={{
            fontSize: "1.2rem", lineHeight: 1.75,
            color: "var(--text2)", maxWidth: 560,
          }}>
            Describe your business. AI generates a complete, production-ready website and deploys it live. The code is yours. No monthly fees, ever.
          </p>

          <div className="fade-up-3 flex items-center justify-center gap-4 flex-wrap">
            <Link href={loggedIn ? "/dashboard" : "/signup"} className="btn-primary rounded-xl px-8 py-4" style={{ fontSize: 16 }}>
              {loggedIn ? "Go to Dashboard" : "Get Started — €49.99"}
            </Link>
            <a href="#how-it-works" className="text-sm" style={{ color: "var(--text3)" }}>
              See how it works →
            </a>
          </div>

          {/* Stats */}
          <div className="fade-up-4 flex items-center justify-center gap-8 mt-14 flex-wrap">
            {[
              { v: "100s",  l: "Time to live" },
              { v: "€49.99", l: "One-time price" },
              { v: "100%",  l: "Code ownership" },
              { v: "0",     l: "Monthly fees" },
            ].map((s) => (
              <div key={s.l} className="text-center">
                <p className="font-bold" style={{ fontSize: "1.5rem" }}>{s.v}</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--text3)" }}>{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Infrastructure */}
      <section style={{ borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", background: "rgba(255,255,255,0.02)" }}>
        <div className="max-w-4xl mx-auto px-6 py-12">
          <p className="text-center text-xs font-semibold tracking-widest mb-8" style={{ color: "var(--text3)", textTransform: "uppercase" }}>
            Built on world-class infrastructure
          </p>
          <div className="grid grid-cols-4 gap-4">
            {infra.map((i) => (
              <div key={i.name} className="text-center">
                <p className="font-semibold text-sm">{i.name}</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--text3)" }}>{i.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <p className="text-xs font-semibold tracking-widest mb-3" style={{ color: "var(--text3)", textTransform: "uppercase" }}>Process</p>
          <h2 className="font-bold tracking-tight mb-16" style={{ fontSize: "2.4rem" }}>Three steps to live.</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { n: "01", title: "Describe", body: "Enter your business name, type, and a description. Choose your design style, typography, and which pages to include." },
              { n: "02", title: "Generate", body: "AI writes a complete, responsive website tailored to your business. Custom design, real content — not a template." },
              { n: "03", title: "Own it", body: "Deployed to Vercel. Code on GitHub. Yours permanently — no lock-in, no recurring fees." },
            ].map((s) => (
              <div key={s.n} className="glass glass-hover rounded-2xl p-7">
                <span className="text-xs font-bold tracking-widest" style={{ color: "var(--text3)", textTransform: "uppercase" }}>{s.n}</span>
                <h3 className="font-semibold mt-4 mb-2" style={{ fontSize: "1.15rem" }}>{s.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text2)" }}>{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why us */}
      <section style={{ borderTop: "1px solid var(--border)" }} className="py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <p className="text-xs font-semibold tracking-widest mb-3" style={{ color: "var(--text3)", textTransform: "uppercase" }}>Advantages</p>
          <h2 className="font-bold tracking-tight mb-16" style={{ fontSize: "2.4rem" }}>Why WebBuilder.</h2>
          <div className="grid md:grid-cols-3 gap-5">
            {advantages.map((a) => (
              <div key={a.title} className="glass glass-hover rounded-2xl p-6">
                <div className="mb-4" style={{ color: "var(--accent)" }}>{a.icon}</div>
                <h3 className="font-semibold mb-2">{a.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text2)" }}>{a.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who we are */}
      <section style={{ borderTop: "1px solid var(--border)" }} className="py-28 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-xs font-semibold tracking-widest mb-3" style={{ color: "var(--text3)", textTransform: "uppercase" }}>Who we are</p>
            <h2 className="font-bold tracking-tight mb-6" style={{ fontSize: "2.2rem" }}>Built out of frustration.</h2>
            <p className="leading-relaxed mb-4" style={{ color: "var(--text2)", fontSize: "0.96rem" }}>
              Getting a professional website meant paying thousands to an agency, spending weeks on a page builder, or learning to code yourself.
            </p>
            <p className="leading-relaxed" style={{ color: "var(--text2)", fontSize: "0.96rem" }}>
              We combined AI with production-grade infrastructure to make a professional web presence accessible to any business — at a fair, one-time price.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { v: "100s",   l: "Average generation" },
              { v: "€49.99", l: "Flat price, forever" },
              { v: "100%",   l: "Code ownership" },
              { v: "0",      l: "Monthly fees" },
            ].map((s) => (
              <div key={s.l} className="glass rounded-2xl p-6">
                <p className="font-bold tracking-tight" style={{ fontSize: "1.8rem" }}>{s.v}</p>
                <p className="text-xs mt-1" style={{ color: "var(--text3)" }}>{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section style={{ borderTop: "1px solid var(--border)" }} className="py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <p className="text-xs font-semibold tracking-widest mb-3" style={{ color: "var(--text3)", textTransform: "uppercase" }}>Comparison</p>
          <h2 className="font-bold tracking-tight mb-4" style={{ fontSize: "2.4rem" }}>How we compare.</h2>
          <p className="mb-12 text-sm" style={{ color: "var(--text2)" }}>
            Wix costs €204/year. Squarespace €192/year. WebBuilder: €49.99 once.
          </p>
          <div className="overflow-hidden rounded-2xl" style={{ border: "1px solid var(--border)" }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)", background: "rgba(255,255,255,0.03)" }}>
                  {["Platform", "Price", "AI generation", "Code ownership", "Time to live"].map((h) => (
                    <th key={h} className="text-left px-6 py-4 font-medium" style={{ color: "var(--text3)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {competitors.map((c) => (
                  <tr key={c.name} style={{
                    borderBottom: "1px solid var(--border)",
                    background: c.highlight ? "rgba(99,102,241,0.08)" : "transparent",
                  }}>
                    <td className="px-6 py-4 font-semibold">
                      {c.name}
                      {c.highlight && (
                        <span className="ml-2 text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{ background: "rgba(99,102,241,0.25)", color: "#a5b4fc" }}>
                          You
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold">{c.price}</span>
                      <span className="ml-1 text-xs" style={{ color: "var(--text3)" }}>{c.per}</span>
                    </td>
                    <td className="px-6 py-4">{c.ai    ? <Check /> : <Cross />}</td>
                    <td className="px-6 py-4">{c.owns  ? <Check /> : <Cross />}</td>
                    <td className="px-6 py-4" style={{ color: c.highlight ? "#fff" : "var(--text2)" }}>{c.setup}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" style={{ borderTop: "1px solid var(--border)" }} className="py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <p className="text-xs font-semibold tracking-widest mb-3" style={{ color: "var(--text3)", textTransform: "uppercase" }}>Pricing</p>
          <h2 className="font-bold tracking-tight mb-16" style={{ fontSize: "2.4rem" }}>Simple, honest pricing.</h2>
          <div className="max-w-sm">
            <div className="relative glass rounded-2xl p-8" style={{ border: "1px solid rgba(99,102,241,0.3)" }}>
              {/* Launch badge */}
              <div className="absolute -top-3 left-6">
                <span className="text-xs font-bold px-3 py-1 rounded-full"
                  style={{ background: "linear-gradient(135deg,#6366f1,#a855f7)", color: "#fff", letterSpacing: "0.08em" }}>
                  LAUNCH PRICE
                </span>
              </div>

              <div className="mt-2 mb-1 flex items-baseline gap-2">
                <span className="font-bold tracking-tight" style={{ fontSize: "3.5rem" }}>€49.99</span>
                <span className="line-through text-lg" style={{ color: "var(--text3)" }}>€99.99</span>
              </div>
              <p className="text-sm mb-8" style={{ color: "var(--text2)" }}>One-time payment — yours forever</p>

              <ul className="space-y-3 mb-8">
                {[
                  "Complete custom website",
                  "Deployed live on Vercel",
                  "Code on your GitHub",
                  "Fully responsive & mobile-ready",
                  "No monthly fees, ever",
                  "You own it, zero lock-in",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm" style={{ color: "var(--text2)" }}>
                    <Check />
                    {item}
                  </li>
                ))}
              </ul>

              <Link href={loggedIn ? "/dashboard" : "/signup"} className="btn-primary w-full rounded-xl py-3.5 text-sm">
                {loggedIn ? "Go to Dashboard" : "Get Started — €49.99"}
              </Link>
              <p className="text-xs text-center mt-3" style={{ color: "var(--text3)" }}>
                Save €144/year vs Wix · Save €192/year vs Squarespace
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ borderTop: "1px solid var(--border)" }} className="py-28 px-6 text-center relative overflow-hidden">
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse 60% 60% at 50% 100%, rgba(99,102,241,0.18), transparent)",
          pointerEvents: "none",
        }} />
        <div className="relative max-w-2xl mx-auto">
          <h2 className="font-bold tracking-tight mb-4" style={{ fontSize: "2.8rem" }}>Ready to go live?</h2>
          <p className="mb-8" style={{ color: "var(--text2)", fontSize: "1.1rem" }}>
            100 seconds from now, you'll have a live website. Yours forever.
          </p>
          <Link href={loggedIn ? "/dashboard" : "/signup"} className="btn-primary rounded-xl px-10 py-4" style={{ fontSize: 16 }}>
            {loggedIn ? "Go to Dashboard" : "Create Your Website — €49.99"}
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid var(--border)" }} className="py-8 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <span className="font-semibold text-sm">WebBuilder</span>
          <p className="text-xs" style={{ color: "var(--text3)" }}>© 2026 WebBuilder. All rights reserved.</p>
          <div className="flex items-center gap-6">
            {loggedIn ? (
              <Link href="/dashboard" className="text-xs" style={{ color: "var(--text3)" }}>Dashboard</Link>
            ) : (
              <>
                <Link href="/login"  className="text-xs" style={{ color: "var(--text3)" }}>Login</Link>
                <Link href="/signup" className="text-xs" style={{ color: "var(--text3)" }}>Sign up</Link>
              </>
            )}
          </div>
        </div>
      </footer>

    </div>
  );
}
