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

const FAQ_CATEGORIES = [
  {
    id: "start",
    label: "Getting started",
    items: [
      ["Do I need to know how to code?",        "No. You describe your business in plain English — name, services, audience, tone. We generate the site, deploy it, and give you the code. No technical knowledge required."],
      ["How long does it take?",                 "The generation and deployment takes around six minutes after payment. The wizard (answering questions and reviewing your brief) takes another 5–10 minutes. Start to live URL: under 20 minutes."],
      ["What if I'm not happy with the result?", "Contact us at support@insixlive.com. We handle every case individually and want you to be happy with your website. We can't automatically refund after generation since real compute has been used, but we'll work with you."],
      ["Can I see a demo before paying?",        "You can review the full brief — your inputs, page list, and style choices — before checkout. You don't see the generated website until after payment, since generation takes real compute time. Check the Examples page to see sites we've built."],
      ["What kind of businesses does this work for?", "Any local or small business that needs a presence website: trades (plumbers, electricians), health (dentists, physios, coaches), hospitality (restaurants, cafés), creative (photographers, florists), professional services (lawyers, consultants), and more."],
    ],
  },
  {
    id: "ownership",
    label: "Ownership & code",
    items: [
      ["Who owns the website?",                  "You do, completely. The code is yours, the Vercel project is deployed under your account, and the domain (if you connect one) belongs to you. We have no ongoing access to your site."],
      ["Do I get the source code?",              "Yes. You get a full Next.js + Tailwind project in your own repository. Every file, every component, every page. You can open it in any code editor or hand it to a developer."],
      ["Can I move away from Vercel?",           "Yes. The project is a standard Next.js application — you can host it on any platform that supports Node.js or static exports (Railway, Render, Fly.io, etc.) without touching the code."],
      ["Can a developer take over after launch?","Yes. It's a standard Next.js + Tailwind + TypeScript project. Any developer familiar with these tools can continue working on it immediately."],
      ["Is there lock-in?",                      "No. You own the code, the deployment, and the domain. You can take everything and leave at any time. We deliberately chose an open stack so you never depend on us."],
    ],
  },
  {
    id: "domains",
    label: "Domains",
    items: [
      ["Can I connect my own domain?",           "Yes. Your site launches on a free Vercel URL first. You can connect a domain you already own by adding two DNS records to your registrar. Full instructions are in your dashboard."],
      ["What registrars do you support?",        "Any registrar that lets you edit DNS records — Namecheap, GoDaddy, Porkbun, Cloudflare, Ionos, Hover, Squarespace Domains, and others. If you can add an A record, it works."],
      ["Do you include hosting?",                "We deploy to your Vercel account. Vercel's Hobby plan is free and supports most small sites. You pay Vercel separately if you need a paid plan, but most businesses never need it."],
      ["Does the site include SSL (HTTPS)?",     "Yes. Vercel automatically issues and renews a free SSL certificate for both your Vercel URL and any custom domain you connect. HTTPS is always on."],
      ["Do you sell domains?",                   "Not directly. We recommend Namecheap (~€10–12/yr), Porkbun (~€8–10/yr), or Cloudflare Registrar (at-cost). You can also buy through Vercel when connecting a domain."],
    ],
  },
  {
    id: "pricing",
    label: "Pricing & payment",
    items: [
      ["Is there a subscription?",               "No. You pay once for the website generation. Vercel hosting is free on their Hobby plan. Custom domains are paid separately to a registrar. That's it."],
      ["What's included in each plan?",          "Basic (€49.99): website generation, Vercel deployment, full source code. Pro (€59.99): everything in Basic plus 5 free edits. Premium (€79.99): everything in Pro plus 15 free edits."],
      ["What happens after I pay?",              "We start generating your website immediately. Claude Sonnet writes the code, we deploy it to your Vercel account, and email you the live URL. The whole thing takes around six minutes."],
      ["Is there a refund policy?",              "Reach out to support@insixlive.com. We work case-by-case. Since generation uses real compute resources, we can't automatically refund after the site has been built, but we'll make it right."],
      ["How do I pay?",                          "Stripe checkout. Credit card, debit card, or anything Stripe supports in your country. You get an email receipt immediately after payment."],
    ],
  },
  {
    id: "edits",
    label: "Changes & edits",
    items: [
      ["What counts as a change?",               "Updating copy, swapping a section, adjusting colors or typography, adding a service or page, changing contact info, adding a photo. Each change is one edit request. Complex integrations (backends, payment systems, custom databases) are out of scope."],
      ["How long does a change take?",           "Around 6 minutes — same as the initial generation. We regenerate the relevant parts of your website and redeploy automatically."],
      ["How much do extra changes cost?",        "€15 per change. Basic plan: €15 from the first change. Pro plan: €15 after the 5 free edits. Premium plan: €15 after the 15 free edits. You buy them individually — no bundles, no surprises."],
      ["Can I make changes myself?",             "Yes. You have the full source code. Any developer can make changes directly in the code. If you're not technical, use the dashboard to request changes from us."],
      ["Do free edits expire?",                  "No. Your free edits (on Pro and Premium plans) don't expire. Use them whenever you need them."],
    ],
  },
];

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState("start");
  const [openItem, setOpenItem] = useState(-1);

  const currentCategory = FAQ_CATEGORIES.find(c => c.id === activeCategory) ?? FAQ_CATEGORIES[0];

  const handleCategoryChange = (id: string) => {
    setActiveCategory(id);
    setOpenItem(-1);
  };

  return (
    <>
      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        html{overflow-x:hidden;scroll-behavior:smooth}
        body{background:${P.bg};color:${P.ink};font-family:${P.font};overflow-x:hidden}
        a{text-decoration:none;color:inherit}
        .g2{display:grid}
        @media(max-width:900px){
          .g2{grid-template-columns:1fr!important}
          .faq-layout{flex-direction:column!important}
          .faq-cats{flex-direction:row!important;overflow-x:auto;white-space:nowrap}
          .pp{padding-left:20px!important;padding-right:20px!important}
        }
        @media(max-width:600px){
          .pp{padding-left:16px!important;padding-right:16px!important}
        }
      `}</style>

      <SiteNav/>

      {/* ── HERO ── */}
      <section className="pp" style={{ padding: "80px 32px 60px", maxWidth: 920, margin: "0 auto", textAlign: "center" as const }}>
        <Eyebrow>// questions & answers</Eyebrow>
        <h1 style={{ fontFamily: P.font, fontSize: "clamp(2.4rem,5vw,64px)", fontWeight: 700, letterSpacing: -2.5, lineHeight: 0.98, color: P.ink, margin: "0 0 16px" }}>
          Common questions.
        </h1>
        <p style={{ fontFamily: P.font, fontSize: 18, lineHeight: 1.55, color: P.muted, margin: "0 auto 12px", maxWidth: 540 }}>
          Everything you need to know about insixlive. If you can&apos;t find your answer here, email us.
        </p>
        <a href="mailto:support@insixlive.com" style={{ fontFamily: P.mono, fontSize: 13, color: P.six, fontWeight: 600, textDecoration: "none" }}>
          support@insixlive.com
        </a>
      </section>

      {/* ── FAQ BODY ── */}
      <section className="pp" style={{ padding: "0 32px 104px", maxWidth: 1100, margin: "0 auto" }}>
        <div className="faq-layout" style={{ display: "flex", gap: 40, alignItems: "flex-start" }}>

          {/* Category sidebar */}
          <div className="faq-cats" style={{ display: "flex", flexDirection: "column", gap: 4, width: 220, flexShrink: 0, position: "sticky" as const, top: 88 }}>
            {FAQ_CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id)}
                style={{
                  padding: "10px 14px",
                  borderRadius: 8,
                  fontFamily: P.font,
                  fontSize: 14,
                  fontWeight: activeCategory === cat.id ? 600 : 400,
                  color: activeCategory === cat.id ? P.ink : P.muted,
                  background: activeCategory === cat.id ? "#fff" : "transparent",
                  border: activeCategory === cat.id ? `1px solid ${P.line}` : "1px solid transparent",
                  cursor: "pointer",
                  textAlign: "left" as const,
                  transition: "all .15s",
                }}
              >
                {cat.label}
              </button>
            ))}
            <div style={{ marginTop: 20, padding: "16px 14px", borderRadius: 10, background: P.bg2, border: `1px solid ${P.line}` }}>
              <div style={{ fontFamily: P.mono, fontSize: 10, fontWeight: 700, color: P.muted, textTransform: "uppercase" as const, letterSpacing: 0.6, marginBottom: 8 }}>Still stuck?</div>
              <a href="mailto:support@insixlive.com" style={{ fontFamily: P.font, fontSize: 13, color: P.six, fontWeight: 500, textDecoration: "none" }}>
                support@insixlive.com
              </a>
            </div>
          </div>

          {/* FAQ items */}
          <div style={{ flex: 1, borderTop: `1px solid ${P.line}` }}>
            <div style={{ marginBottom: 24, paddingTop: 2 }}>
              <span style={{ fontFamily: P.mono, fontSize: 11, fontWeight: 700, color: P.muted, textTransform: "uppercase" as const, letterSpacing: 0.6 }}>
                {currentCategory.label}
              </span>
            </div>
            {currentCategory.items.map(([q, a], i) => (
              <div key={q} style={{ borderBottom: `1px solid ${P.line}` }}>
                <button
                  onClick={() => setOpenItem(openItem === i ? -1 : i)}
                  style={{ width: "100%", padding: "20px 0", display: "flex", alignItems: "center", justifyContent: "space-between", background: "none", border: "none", cursor: "pointer", textAlign: "left" as const, fontFamily: P.font, fontSize: 17, fontWeight: 600, color: P.ink, letterSpacing: -0.2 }}
                >
                  {q}
                  <span style={{ width: 30, height: 30, borderRadius: 15, background: openItem === i ? P.ink : P.bg2, color: openItem === i ? "#fff" : P.ink, display: "flex", alignItems: "center", justifyContent: "center", transition: "all .2s", flexShrink: 0, marginLeft: 16 }}>
                    <svg width="12" height="12" viewBox="0 0 12 12"><path d={openItem === i ? "M2 6h8" : "M2 6h8M6 2v8"} stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                  </span>
                </button>
                {openItem === i && (
                  <div style={{ paddingBottom: 22, fontFamily: P.font, fontSize: 15, color: P.inkSoft, lineHeight: 1.65, maxWidth: 720 }}>{a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── QUICK LINKS ── */}
      <section style={{ background: P.bg2, borderTop: `1px solid ${P.line}`, padding: "72px 0" }}>
        <div className="pp" style={{ maxWidth: 1100, margin: "0 auto", padding: "0 32px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 20, marginBottom: 32 }}>
            <div>
              <div style={{ fontFamily: P.mono, fontSize: 11, fontWeight: 700, color: P.muted, textTransform: "uppercase" as const, letterSpacing: 0.6, marginBottom: 8 }}>// useful links</div>
              <h2 style={{ fontFamily: P.font, fontSize: "clamp(1.4rem,2.5vw,32px)", fontWeight: 700, letterSpacing: -0.8, color: P.ink, margin: 0 }}>Explore more.</h2>
            </div>
          </div>
          <div className="g2" style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12 }}>
            {[
              { href: "/how-it-works", title: "How it works", sub: "The six-step process from description to live site" },
              { href: "/examples",    title: "Examples",      sub: "See real websites built with insixlive" },
              { href: "/pricing",     title: "Pricing",       sub: "One-time plans with full ownership" },
              { href: "/domains",     title: "Domains",       sub: "Connect your own domain in two DNS records" },
            ].map(link => (
              <Link key={link.href} href={link.href} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 20px", borderRadius: 12, background: "#fff", border: `1px solid ${P.line}`, gap: 16 }}>
                <div>
                  <div style={{ fontFamily: P.font, fontSize: 15, fontWeight: 700, color: P.ink, marginBottom: 2 }}>{link.title}</div>
                  <div style={{ fontFamily: P.font, fontSize: 13, color: P.muted }}>{link.sub}</div>
                </div>
                <svg width="14" height="14" viewBox="0 0 14 14" style={{ flexShrink: 0 }}><path d="M3 7h8M8 4l3 3-3 3" stroke={P.muted} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ background: T.bg, padding: "120px 32px", position: "relative", overflow: "hidden", textAlign: "center" as const }}>
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", backgroundImage: `radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)`, backgroundSize: "18px 18px" }}/>
        <div style={{ position: "absolute", top: -200, left: "50%", transform: "translateX(-50%)", width: 900, height: 900, borderRadius: 450, background: "radial-gradient(circle,rgba(255,90,31,0.22),rgba(255,90,31,0) 60%)", filter: "blur(20px)", pointerEvents: "none" }}/>
        <div style={{ maxWidth: 720, margin: "0 auto", position: "relative" }}>
          <Eyebrow dark>// ready?</Eyebrow>
          <h2 style={{ fontFamily: P.font, fontSize: "clamp(2.2rem,4.5vw,64px)", fontWeight: 700, letterSpacing: -2.5, lineHeight: 0.98, color: "#fff", margin: "0 0 20px" }}>
            Six minutes from now,<br/><span style={{ color: T.six }}>you&apos;re live.</span>
          </h2>
          <p style={{ fontFamily: P.font, fontSize: 18, lineHeight: 1.5, color: "rgba(255,255,255,0.55)", margin: "0 auto 32px", maxWidth: 480 }}>
            Stop renting a website that doesn&apos;t belong to you. Build something you own.
          </p>
          <Link href="/signup" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "linear-gradient(180deg,#FF6A33 0%,#E54B14 100%)", color: "#fff", padding: "16px 28px", borderRadius: 12, fontFamily: P.font, fontSize: 16, fontWeight: 700, boxShadow: "0 1px 0 rgba(255,255,255,0.20) inset,0 14px 30px rgba(255,90,31,0.32)" }}>
            Build my website — from €49
            <svg width="14" height="14" viewBox="0 0 14 14"><path d="M3 7h8M8 4l3 3-3 3" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </Link>
          <p style={{ fontFamily: P.mono, fontSize: 12, color: "rgba(255,255,255,0.3)", letterSpacing: "0.08em", textTransform: "uppercase" as const, marginTop: 18 }}>One-time · Stripe-secured · Yours forever</p>
        </div>
      </section>

      <SiteFooter/>
    </>
  );
}
