"use client";

import { useState } from "react";
import Link from "next/link";
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

function Check({ color = P.em2 }: { color?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 10 10" fill="none" style={{ flexShrink: 0, marginTop: 2 }}>
      <path d="M2 5l2 2 4-4" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

const PLANS = [
  {
    id: "basic",
    label: "Website Generation",
    name: "Basic",
    price: "€49.99",
    tag: "I just need a website.",
    cta: "Get Basic",
    ctaHref: "/signup",
    featured: false,
    after: "€15 per change after launch",
    savings: null as string | null,
    features: [
      "AI-generated professional website",
      "Deployed to your Vercel account",
      "Full source code ownership",
      "Mobile-responsive design",
      "SSL certificate (auto-renewed)",
      "Global CDN · 99.9% uptime",
    ],
    notIncluded: "0 free changes",
  },
  {
    id: "pro",
    label: "Website + 5 Changes",
    name: "Pro",
    price: "€59.99",
    tag: "I want to refine my site.",
    cta: "Get Pro",
    ctaHref: "/signup",
    featured: true,
    after: "€15 per change after the first 5",
    savings: "You save €75 vs buying changes separately",
    features: [
      "Everything in Basic",
      "5 free changes included",
      "Change tracking in dashboard",
      "Priority generation queue",
      "Priority email support",
    ],
    notIncluded: null,
  },
  {
    id: "premium",
    label: "Website + 15 Changes",
    name: "Premium",
    price: "€79.99",
    tag: "I want room to grow.",
    cta: "Get Premium",
    ctaHref: "/signup",
    featured: false,
    after: "€15 per change after the first 15",
    savings: null,
    features: [
      "Everything in Pro",
      "15 free changes included",
      "Best for evolving businesses",
      "1:1 onboarding call (optional)",
    ],
    notIncluded: null,
  },
];

const COMPARE_ROWS = [
  ["AI-generated website",  "✓",      "✓",       "✓"     ],
  ["Code ownership",        "✓",      "✓",       "✓"     ],
  ["Vercel deployment",     "✓",      "✓",       "✓"     ],
  ["Mobile responsive",     "✓",      "✓",       "✓"     ],
  ["SSL certificate",       "✓",      "✓",       "✓"     ],
  ["Free changes",          "0",      "5",       "15"    ],
  ["Cost per change",       "€15",    "€15",     "€15"   ],
  ["Custom domain",         "Separate","Separate","Separate"],
  ["Total: 0 changes",      "€49.99", "€59.99",  "€79.99"],
  ["Total: 5 changes",      "€124.99","€59.99 ✓","€79.99"],
  ["Total: 15 changes",     "€274.99","€209.99", "€79.99 ✓"],
];

const PRICING_FAQ: [string, string][] = [
  ["What counts as a change?",           "Updating copy, swapping sections, adjusting colors, adding a service or page, changing contact info. Custom backends and complex integrations are out of scope."],
  ["How long does a change take?",       "Around 6 minutes. We regenerate the relevant parts of your site and redeploy automatically."],
  ["Do free changes expire?",            "No. Your free changes (on Pro and Premium) don't expire. Use them whenever you need them."],
  ["Is there a subscription?",           "No. Everything is one-time. No monthly fees, no annual renewals, no hidden charges."],
  ["What about custom domains?",         "Custom domains are not included. You buy them separately — €8–20/yr from any registrar. We give you the DNS records to add."],
  ["Is there a refund policy?",          "Reach out to support@insixlive.com. We work case-by-case and want you to be happy with your website."],
];

export default function PricingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <>
      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        html{overflow-x:hidden;scroll-behavior:smooth}
        body{background:${P.bg};color:${P.ink};font-family:${P.font};overflow-x:hidden}
        a{text-decoration:none;color:inherit}
        .pricing-cards{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;align-items:stretch}
        .comp-table{overflow-x:auto}
        @media(max-width:900px){
          .pricing-cards{grid-template-columns:1fr}
          .pp{padding-left:20px!important;padding-right:20px!important}
        }
        @media(max-width:600px){
          .pp{padding-left:16px!important;padding-right:16px!important}
        }
      `}</style>

      <SiteNav/>

      {/* ── HERO ── */}
      <section className="pp" style={{ padding: "80px 32px 60px", maxWidth: 900, margin: "0 auto", textAlign: "center" as const }}>
        <Eyebrow>// one-time pricing</Eyebrow>
        <h1 style={{ fontFamily: P.font, fontSize: "clamp(2.4rem,5vw,64px)", fontWeight: 700, letterSpacing: -2.5, lineHeight: 0.98, color: P.ink, margin: "0 0 16px" }}>
          Transparent pricing.<br/><span style={{ color: P.muted }}>No surprises.</span>
        </h1>
        <p style={{ fontFamily: P.font, fontSize: 18, lineHeight: 1.55, color: P.muted, margin: "0 auto 10px", maxWidth: 520 }}>
          Professional websites from €49.99. One-time payment. Full ownership. No monthly fees — ever.
        </p>
        <p style={{ fontFamily: P.mono, fontSize: 11, color: P.muted, letterSpacing: "0.08em", textTransform: "uppercase" as const }}>
          Custom domain purchased separately · €8–20/year
        </p>
      </section>

      {/* ── PLAN CARDS ── */}
      <section className="pp" style={{ maxWidth: 1100, margin: "0 auto", padding: "0 32px 80px" }}>
        <div className="pricing-cards">
          {PLANS.map(plan => (
            <div key={plan.id} style={{
              position: "relative",
              padding: "32px 28px",
              borderRadius: 18,
              background: plan.featured ? T.bg : "#fff",
              border: plan.featured ? "none" : `1px solid ${P.line}`,
              boxShadow: plan.featured ? "0 24px 60px rgba(10,14,20,0.28)" : "none",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}>
              {plan.featured && (
                <>
                  <div style={{ position: "absolute", inset: 0, pointerEvents: "none", backgroundImage: `radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)`, backgroundSize: "18px 18px" }}/>
                  <div style={{ position: "absolute", top: -60, right: -60, width: 240, height: 240, borderRadius: 120, background: "radial-gradient(circle,rgba(255,90,31,0.40),rgba(255,90,31,0) 65%)", pointerEvents: "none" }}/>
                  <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: P.six, color: "#fff", fontFamily: P.mono, fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, padding: "4px 14px", borderRadius: 99, whiteSpace: "nowrap" as const, zIndex: 1 }}>
                    Most popular
                  </div>
                </>
              )}
              <div style={{ position: "relative" }}>
                <div style={{ fontFamily: P.mono, fontSize: 10, color: plan.featured ? "rgba(255,255,255,0.45)" : P.muted, letterSpacing: "0.12em", textTransform: "uppercase" as const, marginBottom: 14 }}>{plan.label}</div>
                <div style={{ marginBottom: 4 }}>
                  <span style={{ fontFamily: P.mono, fontSize: 52, fontWeight: 700, letterSpacing: -2, color: plan.featured ? "#fff" : P.ink, lineHeight: 1 }}>{plan.price}</span>
                </div>
                <p style={{ fontFamily: P.mono, fontSize: 11, color: plan.featured ? "rgba(255,255,255,0.40)" : P.muted, letterSpacing: "0.06em", textTransform: "uppercase" as const, marginBottom: 28 }}>One-time payment</p>

                <div style={{ borderTop: plan.featured ? "1px solid rgba(255,255,255,0.10)" : `1px solid ${P.line}`, paddingTop: 22, marginBottom: 22 }}>
                  <p style={{ fontFamily: P.font, fontSize: 11, fontWeight: 600, color: plan.featured ? "rgba(255,255,255,0.45)" : P.muted, letterSpacing: "0.1em", textTransform: "uppercase" as const, marginBottom: 12 }}>Included</p>
                  {plan.features.map((f, i) => (
                    <div key={f} style={{ display: "flex", gap: 9, alignItems: "flex-start", marginBottom: 9 }}>
                      <Check color={plan.featured ? (i === plan.features.length - 1 && plan.id === "pro" ? P.six : T.green) : P.em2}/>
                      <span style={{ fontFamily: P.font, fontSize: 13, color: plan.featured ? "rgba(255,255,255,0.85)" : P.ink, lineHeight: 1.5 }}>{f}</span>
                    </div>
                  ))}
                </div>

                {plan.notIncluded && (
                  <div style={{ background: plan.featured ? "rgba(255,255,255,0.06)" : P.bg2, border: plan.featured ? "1px solid rgba(255,255,255,0.10)" : `1px solid ${P.line}`, borderRadius: 10, padding: "12px 14px", marginBottom: 22 }}>
                    <p style={{ fontFamily: P.font, fontSize: 13, color: plan.featured ? "rgba(255,255,255,0.5)" : P.muted }}>
                      Free changes: <span style={{ color: plan.featured ? "rgba(255,255,255,0.85)" : P.ink, fontWeight: 600 }}>none</span>
                    </p>
                  </div>
                )}

                {plan.savings && (
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,90,31,0.15)", border: "1px solid rgba(255,90,31,0.3)", borderRadius: 8, padding: "8px 14px", marginBottom: 22 }}>
                    <span style={{ fontFamily: P.font, fontSize: 13, fontWeight: 700, color: P.six }}>{plan.savings}</span>
                  </div>
                )}

                <div style={{ marginBottom: 22, flex: 1 }}>
                  <p style={{ fontFamily: P.mono, fontSize: 10, color: plan.featured ? "rgba(255,255,255,0.35)" : P.muted, letterSpacing: "0.1em", textTransform: "uppercase" as const, marginBottom: 6 }}>Best for</p>
                  <p style={{ fontFamily: P.font, fontSize: 14, fontStyle: "italic", color: plan.featured ? "rgba(255,255,255,0.75)" : P.ink }}>{plan.tag}</p>
                </div>

                <Link href={plan.ctaHref} style={{
                  display: "block",
                  textAlign: "center",
                  background: plan.featured ? "linear-gradient(180deg,#FF6A33 0%,#E54B14 100%)" : P.ink,
                  color: "#fff",
                  padding: "14px 0",
                  borderRadius: 12,
                  fontFamily: P.font,
                  fontSize: 14,
                  fontWeight: plan.featured ? 700 : 600,
                  textDecoration: "none",
                  boxShadow: plan.featured ? "0 6px 20px rgba(255,90,31,0.35)" : "0 8px 22px rgba(10,14,20,0.16)",
                }}>
                  {plan.cta}
                </Link>
                <p style={{ marginTop: 12, fontFamily: P.mono, fontSize: 11, color: plan.featured ? "rgba(255,255,255,0.35)" : P.muted, textAlign: "center" as const }}>{plan.after}</p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 22, padding: "14px 18px", borderRadius: 12, background: "#fff", border: `1px solid ${P.line}`, display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
          <span style={{ fontFamily: P.mono, fontSize: 11, fontWeight: 700, color: P.muted, textTransform: "uppercase" as const, letterSpacing: 0.6 }}>Note</span>
          <span style={{ fontFamily: P.font, fontSize: 14, color: P.inkSoft }}>
            Custom domains are <b style={{ color: P.ink }}>not included</b> and cost €8–20/year from any registrar.{" "}
            <Link href="/domains" style={{ color: P.six, fontWeight: 500 }}>Domain setup guide →</Link>
          </span>
        </div>
      </section>

      {/* ── COMPARISON TABLE ── */}
      <section style={{ background: P.bg2, borderTop: `1px solid ${P.line}`, padding: "72px 0" }}>
        <div className="pp" style={{ maxWidth: 900, margin: "0 auto", padding: "0 32px" }}>
          <Eyebrow>// compare</Eyebrow>
          <h2 style={{ fontFamily: P.font, fontSize: "clamp(1.8rem,3vw,40px)", fontWeight: 700, letterSpacing: -1.2, color: P.ink, margin: "0 0 36px" }}>Side by side.</h2>
          <div className="comp-table">
            <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: P.font, fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${P.line}`, background: "#fff" }}>
                  <th style={{ padding: "12px 18px", textAlign: "left" as const, fontFamily: P.mono, fontSize: 10, color: P.muted, letterSpacing: "0.1em", textTransform: "uppercase" as const, width: "32%" }}>Feature</th>
                  <th style={{ padding: "12px 18px", textAlign: "center" as const, fontFamily: P.mono, fontSize: 10, color: P.muted, letterSpacing: "0.1em", textTransform: "uppercase" as const }}>Basic<br/>€49.99</th>
                  <th style={{ padding: "12px 18px", textAlign: "center" as const, fontFamily: P.mono, fontSize: 10, color: P.six, letterSpacing: "0.1em", textTransform: "uppercase" as const, background: "rgba(10,14,20,0.03)" }}>Pro<br/>€59.99</th>
                  <th style={{ padding: "12px 18px", textAlign: "center" as const, fontFamily: P.mono, fontSize: 10, color: P.muted, letterSpacing: "0.1em", textTransform: "uppercase" as const }}>Premium<br/>€79.99</th>
                </tr>
              </thead>
              <tbody>
                {COMPARE_ROWS.map(([feat, c1, c2, c3], i) => (
                  <tr key={feat} style={{ borderBottom: `1px solid ${P.line}`, background: i % 2 === 0 ? "#fff" : P.bg }}>
                    <td style={{ padding: "12px 18px", color: P.ink, fontWeight: feat.startsWith("Total") ? 600 : 400 }}>{feat}</td>
                    <td style={{ padding: "12px 18px", textAlign: "center" as const, color: c1 === "✓" ? P.em2 : c1.startsWith("€") ? P.ink : P.muted }}>{c1}</td>
                    <td style={{ padding: "12px 18px", textAlign: "center" as const, color: c2 === "✓" || c2.endsWith("✓") ? P.em2 : c2.startsWith("€") ? P.ink : P.muted, background: "rgba(10,14,20,0.025)", fontWeight: c2.endsWith("✓") ? 700 : 400 }}>{c2}</td>
                    <td style={{ padding: "12px 18px", textAlign: "center" as const, color: c3 === "✓" || c3.endsWith("✓") ? P.em2 : c3.startsWith("€") ? P.ink : P.muted, fontWeight: c3.endsWith("✓") ? 700 : 400 }}>{c3}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="pp" style={{ maxWidth: 720, margin: "0 auto", padding: "72px 32px" }}>
        <Eyebrow>// pricing questions</Eyebrow>
        <h2 style={{ fontFamily: P.font, fontSize: "clamp(1.8rem,3vw,40px)", fontWeight: 700, letterSpacing: -1.2, color: P.ink, margin: "0 0 36px" }}>Common questions.</h2>
        {PRICING_FAQ.map((faq, i) => (
          <div key={i} style={{ borderBottom: `1px solid ${P.line}` }}>
            <button
              onClick={() => setOpenFaq(openFaq === i ? null : i)}
              style={{ width: "100%", padding: "18px 0", display: "flex", justifyContent: "space-between", alignItems: "center", background: "none", border: "none", cursor: "pointer", textAlign: "left" as const }}
            >
              <span style={{ fontFamily: P.font, fontSize: 16, fontWeight: 600, color: P.ink }}>{faq[0]}</span>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, marginLeft: 16, transform: openFaq === i ? "rotate(180deg)" : "none", transition: "transform .2s" }}>
                <path d="M2 5l5 5 5-5" stroke={P.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            {openFaq === i && (
              <p style={{ fontFamily: P.font, fontSize: 14, color: P.muted, lineHeight: 1.75, paddingBottom: 18 }}>{faq[1]}</p>
            )}
          </div>
        ))}
        <div style={{ marginTop: 28, fontFamily: P.font, fontSize: 14, color: P.muted }}>
          More questions? <a href="mailto:support@insixlive.com" style={{ color: P.six, fontWeight: 500, textDecoration: "none" }}>support@insixlive.com</a>
          {" "}or see the{" "}
          <Link href="/faq" style={{ color: P.six, fontWeight: 500 }}>full FAQ</Link>.
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ background: T.bg, padding: "104px 32px", position: "relative", overflow: "hidden", textAlign: "center" as const }}>
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", backgroundImage: `radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)`, backgroundSize: "18px 18px" }}/>
        <div style={{ position: "absolute", top: -200, left: "50%", transform: "translateX(-50%)", width: 900, height: 900, borderRadius: 450, background: "radial-gradient(circle,rgba(255,90,31,0.22),rgba(255,90,31,0) 60%)", filter: "blur(20px)", pointerEvents: "none" }}/>
        <div style={{ maxWidth: 720, margin: "0 auto", position: "relative" }}>
          <Eyebrow dark>// ready?</Eyebrow>
          <h2 style={{ fontFamily: P.font, fontSize: "clamp(2.2rem,4.5vw,60px)", fontWeight: 700, letterSpacing: -2.5, lineHeight: 0.98, color: "#fff", margin: "0 0 20px" }}>
            Own your website.<br/><span style={{ color: T.six }}>Starting at €49.99.</span>
          </h2>
          <p style={{ fontFamily: P.font, fontSize: 18, lineHeight: 1.5, color: "rgba(255,255,255,0.55)", margin: "0 auto 32px", maxWidth: 440 }}>
            One-time payment. No subscriptions. Your code, your Vercel, your domain.
          </p>
          <Link href="/signup" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "linear-gradient(180deg,#FF6A33 0%,#E54B14 100%)", color: "#fff", padding: "16px 28px", borderRadius: 12, fontFamily: P.font, fontSize: 16, fontWeight: 700, textDecoration: "none", boxShadow: "0 1px 0 rgba(255,255,255,0.20) inset,0 14px 30px rgba(255,90,31,0.32)" }}>
            Build my website →
          </Link>
          <p style={{ fontFamily: P.mono, fontSize: 11, color: "rgba(255,255,255,0.25)", letterSpacing: "0.08em", textTransform: "uppercase" as const, marginTop: 18 }}>One-time · No subscription · Yours forever</p>
        </div>
      </section>

      <SiteFooter/>
    </>
  );
}
