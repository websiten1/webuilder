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

function SiteMock({ name, kind, tint = "dark", accent = P.six, pages = [], slug }: { name: string; kind: string; tint?: string; accent?: string; pages?: string[]; slug?: string }) {
  const dark = tint === "dark";
  const bg = dark ? "#0F1A2A" : tint === "warm" ? "#FFEDE4" : "#FFFFFF";
  const fg = dark ? "#FFFFFF" : "#0A0E14";
  const headlines: Record<string, React.ReactNode> = {
    "Acme Plumbing":   <>Burst pipe?<br/>18 min away.</>,
    "Maria&apos;s Hair":   <>Cuts &amp; color,<br/>by Maria.</>,
    "Lia · Photo":     <>Weddings,<br/>told softly.</>,
    "Bistro Marin":    <>The Med,<br/>plated nightly.</>,
    "Dr. Kohl Dental": <>Calm dental<br/>care, Munich.</>,
    "Forge Fitness":   <>Train hard.<br/>Eat well.</>,
    "Sole Café":       <>Coffee,<br/>slow &amp; dark.</>,
    "Stein & Co.":     <>Counsel, on<br/>tap.</>,
    "Bloom Studio":    <>Florals for<br/>the moment.</>,
    "Volt Electric":   <>24/7 electrical<br/>service.</>,
    "Maison Léa":      <>French pastry,<br/>handmade.</>,
    "Nordic PT":       <>Move better.<br/>Live longer.</>,
  };
  return (
    <div style={{ borderRadius: 14, overflow: "hidden", border: `1px solid ${P.line}`, background: "#fff", boxShadow: "0 12px 30px rgba(10,14,20,0.06)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", background: P.bg2, borderBottom: `1px solid ${P.line}` }}>
        <div style={{ display: "flex", gap: 4 }}>
          {["#FF5F57","#FEBC2E","#28C840"].map(c => <div key={c} style={{ width: 8, height: 8, borderRadius: 4, background: c }}/>)}
        </div>
        <div style={{ flex: 1, fontFamily: P.mono, fontSize: 10.5, color: P.muted }}>{slug || "example.com"}</div>
      </div>
      <div style={{ height: 180, background: bg, position: "relative", overflow: "hidden", padding: "16px 18px" }}>
        <div style={{ position: "absolute", top: -40, right: -30, width: 200, height: 200, borderRadius: 100, background: `radial-gradient(circle, ${accent}66, transparent 70%)`, filter: "blur(8px)" }}/>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative" }}>
          <span style={{ fontFamily: P.font, fontSize: 11, fontWeight: 700, color: fg }}>{name}</span>
          <div style={{ display: "flex", gap: 8 }}>
            {pages.slice(0,3).map(pg => <span key={pg} style={{ fontFamily: P.font, fontSize: 9, color: dark ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.55)" }}>{pg}</span>)}
          </div>
        </div>
        <div style={{ position: "relative", marginTop: 26 }}>
          <div style={{ fontFamily: P.mono, fontSize: 7, fontWeight: 700, color: accent, textTransform: "uppercase" as const, letterSpacing: 1.4, marginBottom: 4 }}>{kind}</div>
          <div style={{ fontFamily: P.font, fontSize: 18, fontWeight: 700, color: fg, letterSpacing: -0.5, lineHeight: 1.0 }}>
            {headlines[name] ?? <>Crafted for<br/>{name}.</>}
          </div>
          <div style={{ marginTop: 8, display: "flex", gap: 4 }}>
            <div style={{ background: accent, color: "#fff", padding: "4px 8px", borderRadius: 4, fontFamily: P.font, fontSize: 9, fontWeight: 600 }}>
              {name === "Acme Plumbing" || name === "Volt Electric" ? "Call now" : name === "Bistro Marin" || name === "Maison Léa" ? "Reserve" : "Get in touch"}
            </div>
            <div style={{ border: `1px solid ${dark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.15)"}`, color: fg, padding: "4px 8px", borderRadius: 4, fontFamily: P.font, fontSize: 9, fontWeight: 600 }}>Learn more</div>
          </div>
        </div>
      </div>
    </div>
  );
}

const ALL_EXAMPLES = [
  { name: "Acme Plumbing",   kind: "24/7 Emergency",    tint: "dark",  accent: T.six,   pages: ["Home","Services","Contact"], slug: "acme-plumbing.vercel.app",  industry: "Trades",       plan: "Pro"     },
  { name: "Maria's Hair",    kind: "Salon · Munich",    tint: "white", accent: P.six,   pages: ["Home","Menu","Book"],        slug: "marias-hair.com",            industry: "Beauty",       plan: "Basic"   },
  { name: "Lia · Photo",     kind: "Wedding portfolio", tint: "warm",  accent: P.ink,   pages: ["Work","About","Contact"],    slug: "liaphoto.de",                industry: "Creative",     plan: "Pro"     },
  { name: "Bistro Marin",    kind: "Restaurant",        tint: "dark",  accent: T.amber, pages: ["Menu","Reservations"],       slug: "bistromarin.fr",             industry: "Hospitality",  plan: "Basic"   },
  { name: "Dr. Kohl Dental", kind: "Clinic · Berlin",   tint: "white", accent: T.sky,   pages: ["Care","Book","Insurance"],   slug: "kohl-dental.de",             industry: "Health",       plan: "Premium" },
  { name: "Forge Fitness",   kind: "Personal coach",    tint: "dark",  accent: T.green, pages: ["Programs","Coach","Reviews"],slug: "forgefit.io",                industry: "Health",       plan: "Pro"     },
  { name: "Sole Café",       kind: "Coffee shop",       tint: "dark",  accent: T.amber, pages: ["Menu","Location","Story"],   slug: "sole-cafe.vercel.app",       industry: "Hospitality",  plan: "Basic"   },
  { name: "Stein & Co.",     kind: "Law firm · Munich", tint: "white", accent: P.ink,   pages: ["Practice","Team","Contact"], slug: "stein-co.de",                industry: "Professional", plan: "Pro"     },
  { name: "Bloom Studio",    kind: "Florist",           tint: "warm",  accent: P.six,   pages: ["Arrangements","Events","Shop"],slug: "bloom-studio.vercel.app",  industry: "Creative",     plan: "Basic"   },
  { name: "Volt Electric",   kind: "Electrician",       tint: "dark",  accent: T.amber, pages: ["Services","Quote","Contact"],slug: "volt-electric.de",           industry: "Trades",       plan: "Basic"   },
  { name: "Maison Léa",      kind: "Patisserie",        tint: "warm",  accent: P.ink,   pages: ["Menu","About","Order"],      slug: "maison-lea.fr",              industry: "Hospitality",  plan: "Pro"     },
  { name: "Nordic PT",       kind: "Physiotherapy",     tint: "white", accent: T.green, pages: ["Services","Book","Blog"],    slug: "nordic-pt.com",              industry: "Health",       plan: "Premium" },
];

const INDUSTRIES = ["All", "Trades", "Beauty", "Hospitality", "Health", "Creative", "Professional"];

const TESTIMONIALS = [
  { name: "Markus Lehmann", biz: "Acme Plumbing · Munich",  plan: "Pro",     accent: P.six,   quote: "I described the business in two sentences. Six minutes later I had a website I could send to the printer. No subscription, no monthly bill." },
  { name: "Maria Coelho",   biz: "Maria's Hair · Lisbon",   plan: "Basic",   accent: T.green, quote: "My old site was on a builder I was paying €18/month for. I rebuilt with insixlive and now I just own the code. The math is brutal in their favor." },
  { name: "Dr. Anna Kohl",  biz: "Kohl Dental · Berlin",    plan: "Premium", accent: T.sky,   quote: "I wanted a clean, calm, trustworthy site. The first draft was 80% of the way there — three small edits and we shipped it." },
];

export default function ExamplesPage() {
  const [filter, setFilter] = useState("All");
  const filtered = filter === "All" ? ALL_EXAMPLES : ALL_EXAMPLES.filter(e => e.industry === filter);

  return (
    <>
      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        html{overflow-x:hidden}
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
      <section className="pp" style={{ padding: "80px 32px 60px", maxWidth: 1200, margin: "0 auto" }}>
        <Eyebrow>// shipped sites</Eyebrow>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 24 }}>
          <div>
            <h1 style={{ fontFamily: P.font, fontSize: "clamp(2.4rem,5vw,64px)", fontWeight: 700, letterSpacing: -2.5, lineHeight: 0.98, color: P.ink, margin: "0 0 16px" }}>
              Websites built<br/><span style={{ color: P.muted }}>with insixlive.</span>
            </h1>
            <p style={{ fontFamily: P.font, fontSize: 18, lineHeight: 1.5, color: P.muted, maxWidth: 560 }}>
              From emergency plumbers to wedding photographers, fine-dining restaurants to dental clinics — all built with one description and paid for once.
            </p>
          </div>
          <Link href="/signup" style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "linear-gradient(180deg,#FF6A33 0%,#E54B14 100%)", color: "#fff", padding: "12px 20px", borderRadius: 10, fontFamily: P.font, fontSize: 14, fontWeight: 600, flexShrink: 0, boxShadow: "0 8px 20px rgba(255,90,31,0.28)" }}>
            Build yours
            <svg width="14" height="14" viewBox="0 0 14 14"><path d="M3 7h8M8 4l3 3-3 3" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </Link>
        </div>
      </section>

      {/* ── FILTER TABS ── */}
      <div style={{ borderTop: `1px solid ${P.line}`, borderBottom: `1px solid ${P.line}`, background: "#fff" }}>
        <div className="pp" style={{ maxWidth: 1200, margin: "0 auto", padding: "0 32px", display: "flex", gap: 4, overflowX: "auto", whiteSpace: "nowrap" as const }}>
          {INDUSTRIES.map(ind => (
            <button
              key={ind}
              onClick={() => setFilter(ind)}
              style={{
                padding: "14px 16px",
                fontFamily: P.mono,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 0.4,
                textTransform: "uppercase" as const,
                color: filter === ind ? P.ink : P.muted,
                background: "none",
                border: "none",
                cursor: "pointer",
                borderBottom: filter === ind ? `2px solid ${P.six}` : "2px solid transparent",
                transition: "all .15s",
              }}
            >
              {ind}
            </button>
          ))}
        </div>
      </div>

      {/* ── GALLERY ── */}
      <section className="pp" style={{ padding: "56px 32px 104px", maxWidth: 1200, margin: "0 auto" }}>
        <div className="g3" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24 }}>
          {filtered.map(e => (
            <div key={e.name}>
              <SiteMock name={e.name} kind={e.kind} tint={e.tint} accent={e.accent} pages={e.pages} slug={e.slug}/>
              <div style={{ marginTop: 12, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontFamily: P.font, fontSize: 14, fontWeight: 700, color: P.ink }}>{e.name}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                    <span style={{ fontFamily: P.mono, fontSize: 11, color: P.muted }}>{e.kind}</span>
                    <span style={{ width: 3, height: 3, borderRadius: 2, background: P.line }}/>
                    <span style={{ fontFamily: P.mono, fontSize: 10, fontWeight: 700, color: P.muted, textTransform: "uppercase" as const, letterSpacing: 0.3 }}>{e.plan}</span>
                  </div>
                </div>
                <span style={{ fontFamily: P.mono, fontSize: 11, fontWeight: 600, color: P.six }}>{e.industry}</span>
              </div>
            </div>
          ))}
        </div>
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "48px 0", fontFamily: P.font, fontSize: 16, color: P.muted }}>
            No examples in this category yet.
          </div>
        )}
      </section>

      {/* ── TESTIMONIALS ── */}
      <section style={{ background: P.bg2, borderTop: `1px solid ${P.line}`, padding: "104px 0" }}>
        <div className="pp" style={{ maxWidth: 1200, margin: "0 auto", padding: "0 32px" }}>
          <Eyebrow>// real businesses</Eyebrow>
          <h2 style={{ fontFamily: P.font, fontSize: "clamp(1.8rem,3vw,48px)", fontWeight: 700, letterSpacing: -1.4, lineHeight: 1.02, color: P.ink, margin: "0 0 12px" }}>
            What they say.
          </h2>
          <p style={{ fontFamily: P.font, fontSize: 18, lineHeight: 1.5, color: P.muted, margin: "0 0 56px", maxWidth: 580 }}>
            Real feedback from small business owners who used insixlive during private beta.
          </p>
          <div className="g3" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
            {TESTIMONIALS.map(t => (
              <div key={t.name} style={{ padding: 28, borderRadius: 16, background: "#fff", border: `1px solid ${P.line}` }}>
                <svg width="22" height="22" viewBox="0 0 22 22" style={{ marginBottom: 18, color: t.accent }} fill="currentColor">
                  <path d="M4 14c0-4 3-7 6-7v3c-1 0-3 1-3 4h3v6H4v-6zM13 14c0-4 3-7 6-7v3c-1 0-3 1-3 4h3v6h-6v-6z" opacity="0.85"/>
                </svg>
                <p style={{ fontFamily: P.font, fontSize: 15, lineHeight: 1.6, color: P.ink, marginBottom: 22 }}>{t.quote}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 18, background: P.bg2, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: P.font, fontSize: 13, fontWeight: 700, color: P.ink, flexShrink: 0 }}>
                    {t.name.split(" ").map((p: string) => p[0]).slice(0,2).join("")}
                  </div>
                  <div>
                    <div style={{ fontFamily: P.font, fontSize: 14, fontWeight: 600, color: P.ink }}>{t.name}</div>
                    <div style={{ fontFamily: P.mono, fontSize: 11, color: P.muted }}>{t.biz} · {t.plan}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ background: T.bg, padding: "120px 32px", position: "relative", overflow: "hidden", textAlign: "center" as const }}>
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", backgroundImage: `radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)`, backgroundSize: "18px 18px" }}/>
        <div style={{ position: "absolute", top: -200, left: "50%", transform: "translateX(-50%)", width: 900, height: 900, borderRadius: 450, background: "radial-gradient(circle,rgba(255,90,31,0.22),rgba(255,90,31,0) 60%)", filter: "blur(20px)", pointerEvents: "none" }}/>
        <div style={{ maxWidth: 720, margin: "0 auto", position: "relative" }}>
          <Eyebrow dark>// your turn</Eyebrow>
          <h2 style={{ fontFamily: P.font, fontSize: "clamp(2.2rem,4.5vw,64px)", fontWeight: 700, letterSpacing: -2.5, lineHeight: 0.98, color: "#fff", margin: "0 0 20px" }}>
            Your business,<br/><span style={{ color: T.six }}>next on this page.</span>
          </h2>
          <p style={{ fontFamily: P.font, fontSize: 18, lineHeight: 1.5, color: "rgba(255,255,255,0.55)", margin: "0 auto 32px", maxWidth: 480 }}>
            From description to live website in six minutes. One-time payment. Full ownership.
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
