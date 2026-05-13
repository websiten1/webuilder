"use client";

import { useState } from "react";
import Link from "next/link";

const T = {
  ink: "#0A0E14", six: "#FF5A1F", em: "#00B377", em2: "#009062",
  emSoft: "#E5F7EE", bg: "#FAFAFA", bg2: "#F2F2EF", line: "#E2E2DE",
  muted: "#6B7180",
  font: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
  mono: 'ui-monospace, "SF Mono", "JetBrains Mono", Menlo, monospace',
};

function Mark({ size = 26 }: { size?: number }) {
  return (
    <div style={{ width: size, height: size, borderRadius: size * 0.28, background: T.ink, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <span style={{ fontFamily: T.font, fontSize: size * 0.62, fontWeight: 800, color: T.six, lineHeight: 1 }}>6</span>
    </div>
  );
}

function Check({ color = T.em2 }: { color?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 10 10" fill="none" style={{ flexShrink: 0, marginTop: 2 }}>
      <path d="M2 5l2 2 4-4" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function Dash() {
  return <span style={{ color: T.muted, fontSize: 14 }}>—</span>;
}

const FAQS = [
  { q: "What about custom domains?", a: "Custom domains (e.g. yourname.com) are not included. You buy them separately — €12–30/year from Vercel or any registrar. We automatically configure it if you buy through us, or we show you DNS records to add manually." },
  { q: "What counts as a 'change'?", a: "Anything! Change colours, add pages, update text, add features, redesign sections. Any modification counts as one change. We regenerate your entire website with your new requirements." },
  { q: "How long does a change take?", a: "About 2 minutes. We regenerate your website with AI and redeploy it instantly. Your website updates on all domains simultaneously." },
  { q: "Can I use a domain I already own?", a: "Yes. If you own a domain anywhere (Namecheap, GoDaddy, Porkbun etc.), we show you two DNS records to add. Usually live within 15–30 minutes." },
  { q: "Do I really own my website?", a: "Completely. You own the code, the Vercel project, everything. Download it anytime. Move it to any host. We cannot touch your website after it's created." },
  { q: "What happens after my 5 free changes?", a: "Each additional change is €10. You control the total cost entirely — or keep the website as-is forever with no further charges." },
  { q: "Is there a refund policy?", a: "Reach out to support@insixlive.com. We work case-by-case and want you to be happy with your website." },
  { q: "Is there a subscription?", a: "No. Everything is one-time. €49 or €69. That's it. No monthly fees, no annual renewals, no hidden charges." },
  { q: "Can I upgrade from €49 to €69?", a: "Yes — contact support@insixlive.com and we'll sort it out." },
];

export default function PricingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { background: ${T.bg}; color: ${T.ink}; font-family: ${T.font}; overflow-x: hidden; }
        .pricing-cards { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 18px; }
        .comp-table { overflow-x: auto; }
        @media (max-width: 900px) { .pricing-cards { grid-template-columns: 1fr; } }
        @media (max-width: 600px) { .pricing-cards { grid-template-columns: 1fr; } }
      `}</style>

      <div style={{ background: T.bg, minHeight: "100vh" }}>

        {/* Nav */}
        <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, background: "rgba(250,250,248,.94)", backdropFilter: "blur(14px)", borderBottom: `1px solid ${T.line}`, height: 58 }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 28px", height: "100%", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: 9, textDecoration: "none" }}>
              <Mark size={24} />
              <span style={{ fontFamily: T.font, fontSize: 16, fontWeight: 700, color: T.ink, letterSpacing: -0.5 }}>insixlive</span>
            </Link>
            <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
              <Link href="/" style={{ fontFamily: T.font, fontSize: 14, color: T.muted, textDecoration: "none" }}>Home</Link>
              <Link href="/signup" style={{ background: T.ink, color: "#fff", padding: "9px 20px", borderRadius: 10, fontFamily: T.font, fontSize: 14, fontWeight: 600, textDecoration: "none" }}>Get started</Link>
            </div>
          </div>
        </nav>

        {/* Hero */}
        <div style={{ paddingTop: 100, paddingBottom: 60, textAlign: "center", padding: "100px 28px 60px" }}>
          <span style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, letterSpacing: "0.14em", textTransform: "uppercase" as const }}>Pricing</span>
          <h1 style={{ fontFamily: T.font, fontSize: "clamp(2.4rem, 5vw, 4rem)", fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1.06, color: T.ink, marginTop: 14, marginBottom: 16 }}>
            Transparent Pricing.<br/>No Surprises.
          </h1>
          <p style={{ fontFamily: T.font, fontSize: "clamp(1rem, 1.5vw, 1.15rem)", color: T.muted, maxWidth: 500, margin: "0 auto 10px", lineHeight: 1.7 }}>
            Professional websites from €49. One-time payment. Full ownership. No monthly fees — ever.
          </p>
          <p style={{ fontFamily: T.mono, fontSize: 11, color: T.muted, letterSpacing: "0.08em", textTransform: "uppercase" as const }}>
            Custom domain purchased separately · €12–30/year
          </p>
        </div>

        {/* Pricing cards */}
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 28px 80px" }}>
          <div className="pricing-cards">

            {/* Card 1 — Website */}
            <div style={{ border: `1px solid ${T.line}`, borderRadius: 18, padding: "32px 28px", background: "#fff", display: "flex", flexDirection: "column" }}>
              <span style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, letterSpacing: "0.12em", textTransform: "uppercase" as const, marginBottom: 16 }}>Website Generation</span>
              <div style={{ marginBottom: 6 }}>
                <span style={{ fontFamily: T.font, fontSize: "3rem", fontWeight: 800, letterSpacing: "-0.05em", color: T.ink, lineHeight: 1 }}>€49</span>
              </div>
              <p style={{ fontFamily: T.mono, fontSize: 11, color: T.muted, letterSpacing: "0.06em", textTransform: "uppercase" as const, marginBottom: 28 }}>One-time payment</p>

              <div style={{ borderTop: `1px solid ${T.line}`, paddingTop: 22, marginBottom: 22 }}>
                <p style={{ fontFamily: T.font, fontSize: 11, fontWeight: 600, color: T.muted, letterSpacing: "0.1em", textTransform: "uppercase" as const, marginBottom: 12 }}>Included</p>
                {["AI-generated professional website", "Deployed to your Vercel account", "Full source code ownership", "Mobile-responsive design", "SSL certificate (auto-renewed)", "Global CDN · 99.9% uptime"].map(f => (
                  <div key={f} style={{ display: "flex", gap: 9, alignItems: "flex-start", marginBottom: 9 }}>
                    <Check />
                    <span style={{ fontFamily: T.font, fontSize: 13, color: T.ink, lineHeight: 1.5 }}>{f}</span>
                  </div>
                ))}
              </div>

              <div style={{ background: T.bg2, border: `1px solid ${T.line}`, borderRadius: 10, padding: "12px 14px", marginBottom: 22 }}>
                <p style={{ fontFamily: T.font, fontSize: 12, fontWeight: 600, color: T.muted, marginBottom: 4 }}>Not included</p>
                <p style={{ fontFamily: T.font, fontSize: 13, color: T.muted }}>Custom domain <span style={{ color: T.ink }}>(€12–30/yr, optional)</span></p>
              </div>

              <div style={{ marginBottom: 28 }}>
                <p style={{ fontFamily: T.font, fontSize: 13, color: T.muted, marginBottom: 4 }}>Future changes</p>
                <p style={{ fontFamily: T.font, fontSize: 18, fontWeight: 700, color: T.ink }}>€10 <span style={{ fontSize: 13, fontWeight: 400, color: T.muted }}>per change</span></p>
              </div>

              <div style={{ marginBottom: 28, flex: 1 }}>
                <p style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, letterSpacing: "0.1em", textTransform: "uppercase" as const, marginBottom: 6 }}>Best for</p>
                <p style={{ fontFamily: T.font, fontSize: 14, fontStyle: "italic", color: T.ink }}>"I just need a website."</p>
              </div>

              <Link href="/signup" style={{ display: "block", textAlign: "center", background: T.ink, color: "#fff", padding: "14px 0", borderRadius: 12, fontFamily: T.font, fontSize: 14, fontWeight: 600, textDecoration: "none", boxShadow: "0 4px 14px rgba(10,14,20,0.14)" }}>
                Get started
              </Link>
            </div>

            {/* Card 2 — Website + 5 Changes (highlighted) */}
            <div style={{ border: `2px solid ${T.ink}`, borderRadius: 18, padding: "32px 28px", background: T.ink, display: "flex", flexDirection: "column", position: "relative" }}>
              {/* Badge */}
              <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: T.six, color: "#fff", fontFamily: T.mono, fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, padding: "4px 14px", borderRadius: 99, whiteSpace: "nowrap" as const }}>
                Most popular
              </div>

              <span style={{ fontFamily: T.mono, fontSize: 10, color: "rgba(255,255,255,.45)", letterSpacing: "0.12em", textTransform: "uppercase" as const, marginBottom: 16 }}>Website + 5 Changes</span>
              <div style={{ marginBottom: 6 }}>
                <span style={{ fontFamily: T.font, fontSize: "3rem", fontWeight: 800, letterSpacing: "-0.05em", color: "#fff", lineHeight: 1 }}>€69</span>
              </div>
              <p style={{ fontFamily: T.mono, fontSize: 11, color: "rgba(255,255,255,.4)", letterSpacing: "0.06em", textTransform: "uppercase" as const, marginBottom: 28 }}>One-time payment</p>

              <div style={{ borderTop: "1px solid rgba(255,255,255,.1)", paddingTop: 22, marginBottom: 22 }}>
                <p style={{ fontFamily: T.font, fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,.45)", letterSpacing: "0.1em", textTransform: "uppercase" as const, marginBottom: 12 }}>Included</p>
                {["AI-generated professional website", "Deployed to your Vercel account", "Full source code ownership", "Mobile-responsive design", "SSL certificate (auto-renewed)", "Global CDN · 99.9% uptime", "5 FREE changes included"].map((f, i) => (
                  <div key={f} style={{ display: "flex", gap: 9, alignItems: "flex-start", marginBottom: 9 }}>
                    <Check color={i === 6 ? T.six : T.em} />
                    <span style={{ fontFamily: T.font, fontSize: 13, color: i === 6 ? T.six : "rgba(255,255,255,.85)", lineHeight: 1.5, fontWeight: i === 6 ? 600 : 400 }}>{f}</span>
                  </div>
                ))}
              </div>

              <div style={{ background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 10, padding: "12px 14px", marginBottom: 22 }}>
                <p style={{ fontFamily: T.font, fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,.45)", marginBottom: 4 }}>Not included</p>
                <p style={{ fontFamily: T.font, fontSize: 13, color: "rgba(255,255,255,.6)" }}>Custom domain <span style={{ color: "rgba(255,255,255,.85)" }}>(€12–30/yr, optional)</span></p>
              </div>

              <div style={{ marginBottom: 22 }}>
                <p style={{ fontFamily: T.font, fontSize: 13, color: "rgba(255,255,255,.5)", marginBottom: 4 }}>After 5 free changes</p>
                <p style={{ fontFamily: T.font, fontSize: 18, fontWeight: 700, color: "#fff" }}>€10 <span style={{ fontSize: 13, fontWeight: 400, color: "rgba(255,255,255,.5)" }}>per change</span></p>
              </div>

              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,90,31,0.15)", border: "1px solid rgba(255,90,31,0.3)", borderRadius: 8, padding: "8px 14px", marginBottom: 22 }}>
                <span style={{ fontFamily: T.font, fontSize: 13, fontWeight: 700, color: T.six }}>You save €50</span>
                <span style={{ fontFamily: T.font, fontSize: 12, color: "rgba(255,255,255,.5)" }}>vs buying changes separately</span>
              </div>

              <div style={{ marginBottom: 28, flex: 1 }}>
                <p style={{ fontFamily: T.mono, fontSize: 10, color: "rgba(255,255,255,.35)", letterSpacing: "0.1em", textTransform: "uppercase" as const, marginBottom: 6 }}>Best for</p>
                <p style={{ fontFamily: T.font, fontSize: 14, fontStyle: "italic", color: "rgba(255,255,255,.8)" }}>"I want to refine my website."</p>
              </div>

              <Link href="/signup" style={{ display: "block", textAlign: "center", background: T.six, color: "#fff", padding: "14px 0", borderRadius: 12, fontFamily: T.font, fontSize: 14, fontWeight: 700, textDecoration: "none", boxShadow: "0 6px 20px rgba(255,90,31,0.35)" }}>
                Get started
              </Link>
            </div>

            {/* Card 3 — Single Change */}
            <div style={{ border: `1px solid ${T.line}`, borderRadius: 18, padding: "32px 28px", background: "#fff", display: "flex", flexDirection: "column" }}>
              <span style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, letterSpacing: "0.12em", textTransform: "uppercase" as const, marginBottom: 16 }}>Single Change</span>
              <div style={{ marginBottom: 6 }}>
                <span style={{ fontFamily: T.font, fontSize: "3rem", fontWeight: 800, letterSpacing: "-0.05em", color: T.ink, lineHeight: 1 }}>€10</span>
              </div>
              <p style={{ fontFamily: T.mono, fontSize: 11, color: T.muted, letterSpacing: "0.06em", textTransform: "uppercase" as const, marginBottom: 28 }}>Per change</p>

              <div style={{ borderTop: `1px solid ${T.line}`, paddingTop: 22, marginBottom: 22 }}>
                <p style={{ fontFamily: T.font, fontSize: 11, fontWeight: 600, color: T.muted, letterSpacing: "0.1em", textTransform: "uppercase" as const, marginBottom: 12 }}>Included</p>
                {["One website modification", "AI regeneration of entire site", "Instant redeployment", "Live in ~2 minutes", "Updates all domains at once"].map(f => (
                  <div key={f} style={{ display: "flex", gap: 9, alignItems: "flex-start", marginBottom: 9 }}>
                    <Check />
                    <span style={{ fontFamily: T.font, fontSize: 13, color: T.ink, lineHeight: 1.5 }}>{f}</span>
                  </div>
                ))}
              </div>

              <div style={{ background: T.bg2, border: `1px solid ${T.line}`, borderRadius: 10, padding: "12px 14px", marginBottom: 28, flex: 1 }}>
                <p style={{ fontFamily: T.font, fontSize: 13, color: T.muted, lineHeight: 1.65 }}>
                  Available in your dashboard for any existing website.
                </p>
              </div>

              <div style={{ marginBottom: 28 }}>
                <p style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, letterSpacing: "0.1em", textTransform: "uppercase" as const, marginBottom: 6 }}>Best for</p>
                <p style={{ fontFamily: T.font, fontSize: 14, fontStyle: "italic", color: T.ink }}>"Just a quick tweak."</p>
              </div>

              <Link href="/dashboard" style={{ display: "block", textAlign: "center", border: `1px solid ${T.line}`, color: T.ink, padding: "13px 0", borderRadius: 12, fontFamily: T.font, fontSize: 14, fontWeight: 600, textDecoration: "none" }}>
                Go to dashboard
              </Link>
            </div>
          </div>

          {/* Domain note */}
          <div style={{ textAlign: "center", marginTop: 28 }}>
            <p style={{ fontFamily: T.font, fontSize: 13, color: T.muted }}>
              Custom domain not included in any plan.{" "}
              <Link href="/help/setup-custom-domain" style={{ color: T.six, textDecoration: "none", fontWeight: 500 }}>Learn about adding a domain →</Link>
            </p>
          </div>
        </div>

        {/* Comparison table */}
        <div style={{ background: T.bg2, borderTop: `1px solid ${T.line}`, borderBottom: `1px solid ${T.line}`, padding: "72px 28px" }}>
          <div style={{ maxWidth: 900, margin: "0 auto" }}>
            <span style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, letterSpacing: "0.14em", textTransform: "uppercase" as const }}>Compare</span>
            <h2 style={{ fontFamily: T.font, fontSize: "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 800, letterSpacing: "-0.04em", marginTop: 12, marginBottom: 40 }}>Side by side.</h2>

            <div className="comp-table">
              <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: T.font, fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${T.line}`, background: T.bg }}>
                    <th style={{ padding: "12px 18px", textAlign: "left", fontFamily: T.mono, fontSize: 10, color: T.muted, letterSpacing: "0.1em", textTransform: "uppercase" as const, width: "30%" }}>Feature</th>
                    <th style={{ padding: "12px 18px", textAlign: "center", fontFamily: T.mono, fontSize: 10, color: T.muted, letterSpacing: "0.1em", textTransform: "uppercase" as const }}>Website<br/>€49</th>
                    <th style={{ padding: "12px 18px", textAlign: "center", fontFamily: T.mono, fontSize: 10, color: T.six, letterSpacing: "0.1em", textTransform: "uppercase" as const, background: "rgba(10,14,20,0.03)" }}>Website + 5<br/>€69</th>
                    <th style={{ padding: "12px 18px", textAlign: "center", fontFamily: T.mono, fontSize: 10, color: T.muted, letterSpacing: "0.1em", textTransform: "uppercase" as const }}>Single Change<br/>€10</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["AI-generated website", "✓", "✓", "—"],
                    ["Code ownership", "✓", "✓", "—"],
                    ["Vercel deployment", "✓", "✓", "—"],
                    ["Mobile responsive", "✓", "✓", "—"],
                    ["SSL certificate", "✓", "✓", "—"],
                    ["Free changes included", "0", "5", "—"],
                    ["Cost per change", "€10", "€10 (after 5)", "€10"],
                    ["Custom domain", "Separate", "Separate", "—"],
                    ["Forever ownership", "✓", "✓", "—"],
                    ["Total: 0 changes", "€49", "€69", "—"],
                    ["Total: 5 changes", "€99", "€69 ✓", "€50"],
                    ["Total: 10 changes", "€149", "€119", "€100"],
                  ].map(([feat, c1, c2, c3], i) => (
                    <tr key={feat} style={{ borderBottom: `1px solid ${T.line}`, background: i % 2 === 0 ? "#fff" : T.bg }}>
                      <td style={{ padding: "12px 18px", color: T.ink, fontWeight: feat.startsWith("Total") ? 600 : 400 }}>{feat}</td>
                      <td style={{ padding: "12px 18px", textAlign: "center", color: c1 === "✓" ? T.em2 : c1.startsWith("€") ? T.ink : T.muted }}>{c1}</td>
                      <td style={{ padding: "12px 18px", textAlign: "center", color: c2 === "✓" || c2.endsWith("✓") ? T.em2 : c2.startsWith("€") ? T.ink : T.muted, background: "rgba(10,14,20,0.025)", fontWeight: c2.endsWith("✓") ? 700 : 400 }}>{c2}</td>
                      <td style={{ padding: "12px 18px", textAlign: "center", color: c3 === "✓" ? T.em2 : c3.startsWith("€") ? T.ink : T.muted }}>{c3}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "72px 28px" }}>
          <span style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, letterSpacing: "0.14em", textTransform: "uppercase" as const }}>FAQ</span>
          <h2 style={{ fontFamily: T.font, fontSize: "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 800, letterSpacing: "-0.04em", marginTop: 12, marginBottom: 36 }}>Common questions.</h2>

          {FAQS.map((faq, i) => (
            <div key={i} style={{ borderBottom: `1px solid ${T.line}` }}>
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                style={{ width: "100%", padding: "18px 0", display: "flex", justifyContent: "space-between", alignItems: "center", background: "none", border: "none", cursor: "pointer", textAlign: "left" as const }}>
                <span style={{ fontFamily: T.font, fontSize: 15, fontWeight: 600, color: T.ink }}>{faq.q}</span>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, marginLeft: 16, transform: openFaq === i ? "rotate(180deg)" : "none", transition: "transform .2s" }}>
                  <path d="M2 5l5 5 5-5" stroke={T.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              {openFaq === i && (
                <p style={{ fontFamily: T.font, fontSize: 14, color: T.muted, lineHeight: 1.75, paddingBottom: 18 }}>{faq.a}</p>
              )}
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{ background: T.ink, padding: "72px 28px", textAlign: "center" }}>
          <p style={{ fontFamily: T.mono, fontSize: 10, color: "rgba(255,255,255,.3)", letterSpacing: "0.14em", textTransform: "uppercase" as const, marginBottom: 20 }}>Ready?</p>
          <h2 style={{ fontFamily: T.font, fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 800, letterSpacing: "-0.04em", color: "#F9F9F7", marginBottom: 28 }}>
            Own your website.<br/>Starting at €49.
          </h2>
          <Link href="/signup" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#F9F9F7", color: T.ink, padding: "15px 32px", borderRadius: 12, fontFamily: T.font, fontSize: 15, fontWeight: 700, textDecoration: "none" }}>
            Build my website →
          </Link>
          <p style={{ fontFamily: T.mono, fontSize: 10, color: "rgba(255,255,255,.2)", letterSpacing: "0.08em", textTransform: "uppercase" as const, marginTop: 18 }}>One-time · No subscription · Yours forever</p>
        </div>

        {/* Footer */}
        <div style={{ borderTop: `1px solid ${T.line}`, background: T.bg, padding: "20px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Mark size={20} />
            <span style={{ fontFamily: T.font, fontSize: 14, fontWeight: 700, color: T.ink }}>insixlive</span>
          </div>
          <p style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, letterSpacing: "0.06em" }}>© 2026 INSIXLIVE</p>
          <Link href="/" style={{ fontFamily: T.font, fontSize: 13, color: T.muted, textDecoration: "none" }}>← Back to home</Link>
        </div>
      </div>
    </>
  );
}
