"use client";
import { useState } from "react";
import SiteNav from "@/app/components/SiteNav";
import SiteFooter from "@/app/components/SiteFooter";
import { PageHero, FinalCTA, Section, Container } from "@/app/components/ui";
import { P } from "@/lib/design";

const FAQ_CATEGORIES: [string, [string, string][]][] = [
  ["Getting started", [
    ["What is insixlive?",           "insixlive generates a complete, professional website for your business in about six minutes. The site is real Next.js code, deployed to your own Vercel account."],
    ["Who is it for?",               "Small businesses, freelancers, and local services who need a professional website without paying agency prices or signing up for monthly subscriptions."],
    ["Do I need technical knowledge?","No. You describe your business in plain English. We handle the code, hosting, and deployment."],
    ["How long does it take?",       "Around six minutes from finished brief to live website. Plus a few minutes to fill out the brief."],
  ]],
  ["Pricing", [
    ["Is it really one-time?",       "Yes. The website itself is a one-time payment (Basic €49.99, Pro €59.99, Premium €79.99). No subscription on the generated site."],
    ["Are there monthly fees?",      "Not from us. Vercel's Hobby plan is free for most small sites. Custom domains are paid separately to your registrar (typically €12–30/yr)."],
    ["What is included in each plan?","Basic gets you the website. Pro adds 5 free edits. Premium adds 15 free edits. Beyond the included edits, additional changes are €15 each."],
    ["Can I upgrade later?",         "Yes. Upgrade from your dashboard at any time — you only pay the difference."],
  ]],
  ["Ownership", [
    ["Do I own the website?",                   "Yes. You own the code, the Vercel project, and the domain (if you connect one)."],
    ["Where is the website hosted?",            "On your own Vercel account. Free Hobby plan covers most small sites; you can upgrade with Vercel separately if you outgrow it."],
    ["Can I move the website away from Vercel?","Yes. The code is a standard Next.js project. Host it anywhere that runs Node or static sites."],
    ["Does insixlive keep access to my website?","We retain access only to run edits you request. You can revoke our access from your Vercel settings at any time."],
  ]],
  ["Domains", [
    ["Can I connect an existing domain?","Yes. Copy two DNS records from your dashboard into your registrar (GoDaddy, Namecheap, Porkbun, Cloudflare, etc.)."],
    ["Can I buy a new domain?",         "Yes — you buy directly from any registrar. The domain belongs to you. We don't bundle domain cost in the website plan."],
    ["How long does DNS take?",         "Anywhere from a few minutes to a few hours. Most registrars update within 30 minutes."],
    ["Is SSL included?",                "Yes. Vercel issues SSL certificates automatically once your DNS resolves."],
  ]],
  ["Edits", [
    ["What counts as an edit?",           "Updating text, swapping a section, changing colors, adding a service, updating contact info, reworking design direction."],
    ["What doesn't count?",               "Custom backends, complex booking systems, e-commerce checkout, manual developer work, logo design."],
    ["How long does an edit take?",       "Most edits complete in under a minute and redeploy immediately."],
    ["Do edits update my custom domain too?","Yes. Every redeploy updates both the Vercel URL and any connected custom domain."],
  ]],
  ["Payments and refunds", [
    ["How do payments work?",     "One-time payment via Stripe at checkout. Edits beyond your free allowance are billed €15 each."],
    ["Is Stripe secure?",         "Yes. We never see or store your card details — Stripe handles all of it."],
    ["Can I get a refund?",       "If generation fails and no website is delivered, yes. Once generation begins and a site is delivered, payments are generally non-refundable."],
  ]],
];

function FAQItem({ q, a, open, onClick }: { q: string; a: string; open: boolean; onClick: () => void }) {
  return (
    <div style={{ borderBottom: `1px solid ${P.line}` }}>
      <button
        onClick={onClick}
        style={{ width: "100%", padding: "20px 0", display: "flex", alignItems: "center", justifyContent: "space-between", background: "none", border: "none", cursor: "pointer", textAlign: "left" as const, fontFamily: P.font, fontSize: 17, fontWeight: 600, color: P.ink, letterSpacing: -0.2 }}
      >
        {q}
        <span style={{ width: 30, height: 30, borderRadius: 15, background: open ? P.ink : P.bg2, color: open ? "#fff" : P.ink, display: "flex", alignItems: "center", justifyContent: "center", transition: "all .2s", flexShrink: 0, marginLeft: 16 }}>
          <svg width="12" height="12" viewBox="0 0 12 12">
            <path d={open ? "M2 6h8" : "M2 6h8M6 2v8"} stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </span>
      </button>
      {open && <div style={{ paddingBottom: 22, fontFamily: P.font, fontSize: 15, color: P.inkSoft, lineHeight: 1.6, maxWidth: 720 }}>{a}</div>}
    </div>
  );
}

export default function FAQPage() {
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const toggle = (key: string) => setOpen(o => ({ ...o, [key]: !o[key] }));

  return (
    <>
      <style>{`*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}html{overflow-x:hidden;scroll-behavior:smooth}body{background:${P.bg};color:${P.ink};font-family:${P.font};overflow-x:hidden}a{text-decoration:none;color:inherit}@media(max-width:900px){.pp{padding-left:20px!important;padding-right:20px!important}}`}</style>

      <SiteNav/>

      <PageHero
        eyebrow="// FAQ"
        title={<>Frequently asked,<br/><span style={{ color: P.muted }}>honestly answered.</span></>}
        sub="If we don't cover your question here, drop us a line — we'll update this page."
      />

      <Section paddingY={48} style={{ background: P.bg2 }}>
        <Container max={920}>
          {FAQ_CATEGORIES.map(([cat, items]) => (
            <div key={cat} style={{ marginBottom: 28 }}>
              <div style={{ fontFamily: P.mono, fontSize: 11, fontWeight: 700, color: P.six, textTransform: "uppercase" as const, letterSpacing: 1.2, marginBottom: 12 }}>
                {cat}
              </div>
              <div style={{ background: "#fff", borderRadius: 14, border: `1px solid ${P.line}`, padding: "0 22px" }}>
                {items.map(([q, a]) => {
                  const key = `${cat}:${q}`;
                  return <FAQItem key={key} q={q} a={a} open={!!open[key]} onClick={() => toggle(key)}/>;
                })}
              </div>
            </div>
          ))}
        </Container>
      </Section>

      <FinalCTA/>
      <SiteFooter/>
    </>
  );
}
