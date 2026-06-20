"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Plus_Jakarta_Sans } from "next/font/google";

// ─── Awesomic design system tokens (hero section only) ───────────────────
const cosmica = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"], variable: "--font-cosmica" });
const AW = {
  obsidian: "#09090b",
  ink:      "#18181b",
  graphite: "#3f3f46",
  steel:    "#71717a",
  ash:      "#a1a1aa",
  pebble:   "#d4d4d8",
  fog:      "#ececee",
  mist:     "#f4f4f5",
  snow:     "#ffffff",
  font:     "var(--font-cosmica), ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
};

// ─── Light theme tokens ────────────────────────────────────────────────────
const P = {
  ink:     "#0A0E14",
  ink2:    "#1B2230",
  inkSoft: "#2A3242",
  muted:   "#6B7180",
  bg:      "#FAFAF7",
  bg2:     "#F3F0E9",
  line:    "#E8E3D6",
  six:     "#FF5A1F",
  sixSoft: "#FFEDE4",
  em:      "#00B377",
  em2:     "#009062",
  emSoft:  "#E5F7EE",
  font:    '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "Inter", system-ui, sans-serif',
  mono:    'ui-monospace, "SF Mono", "JetBrains Mono", Menlo, Consolas, monospace',
};

// ─── Dark / tech theme tokens ─────────────────────────────────────────────
const T = {
  bg:    "#0A0D14",
  bg2:   "#11151E",
  line:  "rgba(255,255,255,0.07)",
  text:  "#D4D8E0",
  muted: "#6B7383",
  green: "#4ADE80",
  plum:  "#C792EA",
  sky:   "#7DD3FC",
  amber: "#FBBF24",
  six:   "#FF5A1F",
};

// ─── Primitives ────────────────────────────────────────────────────────────
function Mark({ size = 28 }: { size?: number }) {
  return (
    <div style={{ width: size, height: size, borderRadius: size * 0.28, background: P.ink, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <span style={{ fontFamily: P.font, fontSize: size * 0.62, fontWeight: 800, color: P.six, letterSpacing: -0.5, lineHeight: 1 }}>6</span>
    </div>
  );
}

function Eyebrow({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
  const c = dark ? T.green : P.six;
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: P.mono, fontSize: 12, fontWeight: 600, letterSpacing: 0.4, textTransform: "uppercase" as const, color: c, marginBottom: 18 }}>
      <span style={{ width: 6, height: 6, borderRadius: 3, background: c, boxShadow: dark ? `0 0 8px ${c}` : "none" }}/>
      {children}
    </div>
  );
}

function DotGrid({ opacity = 0.06 }: { opacity?: number }) {
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", backgroundImage: `radial-gradient(rgba(255,255,255,${opacity}) 1px, transparent 1px)`, backgroundSize: "18px 18px" }}/>
  );
}

function TechBadge({ children, color = T.green }: { children: React.ReactNode; color?: string }) {
  const bg     = color === T.green ? "rgba(74,222,128,0.08)"  : color === T.six ? "rgba(255,90,31,0.10)"  : "rgba(255,255,255,0.04)";
  const border = color === T.green ? "rgba(74,222,128,0.30)"  : color === T.six ? "rgba(255,90,31,0.35)"  : "rgba(255,255,255,0.10)";
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: P.mono, fontSize: 10.5, fontWeight: 700, color, letterSpacing: 0.5, textTransform: "uppercase" as const, padding: "5px 9px", borderRadius: 999, background: bg, border: `1px solid ${border}` }}>
      <span style={{ width: 5, height: 5, borderRadius: 3, background: color, boxShadow: `0 0 8px ${color}` }}/>
      {children}
    </span>
  );
}

function CheckIcon({ size = 10, color = P.em2 }: { size?: number; color?: string }) {
  return <svg width={size} height={size} viewBox="0 0 10 10"><path d="M2 5l2 2 4-4" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}

function SiteMock({ name, kind, tint = "dark", accent = P.six, pages = [], slug }: { name: string; kind: string; tint?: string; accent?: string; pages?: string[]; slug?: string }) {
  const dark = tint === "dark";
  const bg = dark ? "#0F1A2A" : tint === "warm" ? "#FFEDE4" : "#FFFFFF";
  const fg = dark ? "#FFFFFF" : "#0A0E14";
  const headline: Record<string, React.ReactNode> = {
    "Acme Plumbing":  <>Burst pipe?<br/>18 min away.</>,
    "Maria's Hair":   <>Cuts &amp; color,<br/>by Maria.</>,
    "Lia · Photo":    <>Weddings,<br/>told softly.</>,
    "Bistro Marin":   <>The Med,<br/>plated nightly.</>,
    "Dr. Kohl Dental":<>Calm dental<br/>care, Munich.</>,
    "Forge Fitness":  <>Train hard.<br/>Eat well.</>,
    "Sole Café":      <>Coffee,<br/>slow &amp; dark.</>,
    "Stein & Co.":    <>Counsel, on<br/>tap.</>,
    "Bloom Studio":   <>Florals for<br/>the moment.</>,
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
            {headline[name] ?? <>Crafted for<br/>{name}.</>}
          </div>
          <div style={{ marginTop: 8, display: "flex", gap: 4 }}>
            <div style={{ background: accent, color: "#fff", padding: "4px 8px", borderRadius: 4, fontFamily: P.font, fontSize: 9, fontWeight: 600 }}>
              {name === "Acme Plumbing" ? "Call now" : name === "Bistro Marin" ? "Reserve" : "Get in touch"}
            </div>
            <div style={{ border: `1px solid ${dark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.15)"}`, color: fg, padding: "4px 8px", borderRadius: 4, fontFamily: P.font, fontSize: 9, fontWeight: 600 }}>Menu</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Plan card ─────────────────────────────────────────────────────────────
const PLANS = [
  { id: "website", name: "Website", price: 59.99, tag: "One website. Fully yours. Forever.", cta: "Build my website", after: "Domain not included — purchase separately on Vercel", badge: null as string|null,
    items: [["AI-generated professional website",true],["Deployed to your own Vercel account",true],["Full source code ownership — keep it forever",true],["Mobile-responsive · SSL · custom domain ready",true],["Custom domain not included — buy on Vercel (~€12–30/yr)",false]] as [string,boolean][] },
];

function PlanCard({ plan, ctaHref }: { plan: typeof PLANS[0]; ctaHref: string }) {
  const f = plan.badge != null;
  return (
    <div style={{ position: "relative", padding: "32px 28px", borderRadius: 18, background: f ? T.bg : "#fff", color: f ? "#fff" : P.ink, border: f ? "none" : `1px solid ${P.line}`, boxShadow: f ? "0 24px 60px rgba(10,14,20,0.28)" : "0 1px 0 rgba(0,0,0,0.02)", overflow: "hidden" }}>
      {f && <><DotGrid opacity={0.05}/><div style={{ position: "absolute", top: -60, right: -60, width: 220, height: 220, borderRadius: 110, background: "radial-gradient(circle, rgba(255,90,31,0.45), rgba(255,90,31,0) 65%)" }}/></>}
      <div style={{ position: "relative" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <span style={{ fontFamily: P.mono, fontSize: 12, fontWeight: 700, color: f ? T.muted : P.muted, letterSpacing: 0.8, textTransform: "uppercase" as const }}>{plan.name}</span>
          {plan.badge && <TechBadge color={T.six}>{plan.badge}</TechBadge>}
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 4 }}>
          <span style={{ fontFamily: P.mono, fontSize: 52, fontWeight: 700, letterSpacing: -2, color: f ? "#fff" : P.ink }}>€{plan.price.toFixed(2)}</span>
          <span style={{ fontFamily: P.font, fontSize: 14, color: f ? T.muted : P.muted }}>one-time</span>
        </div>
        <div style={{ fontFamily: P.font, fontSize: 14, color: f ? "rgba(255,255,255,0.65)" : P.muted, marginBottom: 24 }}>{plan.tag}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
          {plan.items.map(([text, ok], i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontFamily: P.font, fontSize: 14, color: f ? "rgba(255,255,255,0.85)" : P.inkSoft }}>
              <div style={{ width: 18, height: 18, borderRadius: 9, background: ok ? (f ? "rgba(74,222,128,0.15)" : P.emSoft) : (f ? "rgba(255,255,255,0.06)" : P.bg2), display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                {ok ? <CheckIcon size={10} color={f ? T.green : P.em2}/> : <svg width="9" height="9" viewBox="0 0 9 9"><path d="M2 4.5h5" stroke={f ? T.muted : P.muted} strokeWidth="1.5" strokeLinecap="round"/></svg>}
              </div>
              {text}
            </div>
          ))}
        </div>
        <Link href={ctaHref} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: f ? "linear-gradient(180deg,#FF6A33 0%,#E54B14 100%)" : P.ink, color: "#fff", padding: "14px 22px", borderRadius: 10, fontFamily: P.font, fontSize: 15, fontWeight: 600, textDecoration: "none", boxShadow: f ? "0 1px 0 rgba(255,255,255,0.20) inset,0 14px 30px rgba(255,90,31,0.32)" : "0 8px 22px rgba(10,14,20,0.18)" }}>
          {plan.cta}
        </Link>
        <div style={{ marginTop: 14, fontFamily: P.mono, fontSize: 11, color: f ? T.muted : P.muted, textAlign: "center" as const }}>{plan.after}</div>
      </div>
    </div>
  );
}

// ─── FAQ ───────────────────────────────────────────────────────────────────
const FAQ_ITEMS: [string, string][] = [
  ["Do I need to know how to code?",     "No. You describe your business in plain English. We generate the site, deploy it, and you can edit later through your dashboard or in the code directly."],
  ["Who owns the website?",              "You do. The code is yours, the Vercel project is in your account, and the domain (if you connect one) belongs to you."],
  ["Is there a subscription?",           "No. You pay €59.99 once. Vercel hosting is free for most small sites. Custom domains are purchased separately on Vercel (typically €12–30/yr)."],
  ["What happens after I pay?",          "We generate the site, push it to your Vercel, and send you the deploy URL. The whole flow takes around six minutes."],
  ["Can I connect my own domain?",       "Yes. You buy a domain separately on Vercel or any registrar (GoDaddy, Namecheap, Cloudflare, etc.) and connect it from your dashboard."],
  ["Can I update my website?",           "You can generate a new version of your website at any time. Each generation creates a fresh AI-built website based on your updated brief."],
  ["Can I move away from Vercel?",       "Yes. The code is a standard Next.js project — host it anywhere that runs Node or static sites."],
  ["Do you include hosting?",            "We deploy to your Vercel account. Their Hobby plan is free and works for most small sites. Hosting cost on Vercel is separate from us."],
];

function FAQSection() {
  const [open, setOpen] = useState<number>(0);
  return (
    <section id="faq" style={{ padding: "clamp(52px, 8.7vw, 104px) 32px", maxWidth: 920, margin: "0 auto" }}>
      <Eyebrow>// FAQ</Eyebrow>
      <h2 style={{ fontFamily: P.font, fontSize: "clamp(1.8rem,3vw,48px)", fontWeight: 700, letterSpacing: -1.4, lineHeight: 1.02, color: P.ink, margin: "0 0 40px" }}>Common questions.</h2>
      <div style={{ borderTop: `1px solid ${P.line}` }}>
        {FAQ_ITEMS.map(([q, a], i) => (
          <div key={q} style={{ borderBottom: `1px solid ${P.line}` }}>
            <button onClick={() => setOpen(open === i ? -1 : i)} style={{ width: "100%", padding: "20px 0", display: "flex", alignItems: "center", justifyContent: "space-between", background: "none", border: "none", cursor: "pointer", textAlign: "left" as const, fontFamily: P.font, fontSize: 17, fontWeight: 600, color: P.ink, letterSpacing: -0.2 }}>
              {q}
              <span style={{ width: 30, height: 30, borderRadius: 15, background: open === i ? P.ink : P.bg2, color: open === i ? "#fff" : P.ink, display: "flex", alignItems: "center", justifyContent: "center", transition: "all .2s", flexShrink: 0, marginLeft: 16 }}>
                <svg width="12" height="12" viewBox="0 0 12 12"><path d={open === i ? "M2 6h8" : "M2 6h8M6 2v8"} stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              </span>
            </button>
            {open === i && <div style={{ paddingBottom: 22, fontFamily: P.font, fontSize: 15, color: P.inkSoft, lineHeight: 1.65, maxWidth: 720 }}>{a}</div>}
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Examples data ─────────────────────────────────────────────────────────
const EXAMPLES = [
  { name: "Acme Plumbing",   kind: "24/7 Emergency",    tint: "dark",  accent: T.six,   pages: ["Home","Services","Contact"], slug: "acme-plumbing.vercel.app" },
  { name: "Maria's Hair",    kind: "Salon · Munich",    tint: "white", accent: P.six,   pages: ["Home","Menu","Book"],        slug: "marias-hair.com" },
  { name: "Lia · Photo",     kind: "Wedding portfolio", tint: "warm",  accent: P.ink,   pages: ["Work","About","Contact"],    slug: "liaphoto.de" },
  { name: "Bistro Marin",    kind: "Restaurant",        tint: "dark",  accent: T.amber, pages: ["Menu","Reservations"],       slug: "bistromarin.fr" },
  { name: "Dr. Kohl Dental", kind: "Clinic",            tint: "white", accent: T.sky,   pages: ["Care","Book","Insurance"],   slug: "kohl-dental.de" },
  { name: "Forge Fitness",   kind: "Coach",             tint: "dark",  accent: T.green, pages: ["Programs","Coach","Reviews"],slug: "forgefit.io" },
];

// ─── Comparison data ───────────────────────────────────────────────────────
const COMP_ROWS = [
  { name: "insixlive",              upfront: "€59.99",       monthly: "€0",      yr1: "€59.99",       yr5: "€59.99",       own: "Yes",     lock: "No",      active: true  },
  { name: "Wix / Squarespace",      upfront: "low",         monthly: "monthly", yr1: "€200+",       yr5: "€1,000+",     own: "No",      lock: "Yes",     active: false },
  { name: "Webflow",                upfront: "medium",      monthly: "monthly", yr1: "€200+",       yr5: "€1,000+",     own: "Partial", lock: "Partial", active: false },
  { name: "Durable / Hostinger AI", upfront: "low",         monthly: "monthly", yr1: "€300+",       yr5: "€1,500+",     own: "No",      lock: "Yes",     active: false },
  { name: "Freelancer",             upfront: "€500–3,000",  monthly: "varies",  yr1: "high",        yr5: "varies",      own: "Maybe",   lock: "Maybe",   active: false },
  { name: "Agency",                 upfront: "€3,000+",     monthly: "often",   yr1: "very high",   yr5: "very high",   own: "Maybe",   lock: "Maybe",   active: false },
];

// ─── Arrow icon ────────────────────────────────────────────────────────────
function ArrowR({ color = "#fff" }: { color?: string }) {
  return <svg width="14" height="14" viewBox="0 0 14 14"><path d="M3 7h8M8 4l3 3-3 3" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}

// ─── Page ──────────────────────────────────────────────────────────────────
export default function Home() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    fetch("/api/auth/me").then(r => r.json()).then(d => setLoggedIn(!!d.user)).catch(() => setLoggedIn(false));
    const obs = new IntersectionObserver(entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("visible"); }), { threshold: 0.1 });
    document.querySelectorAll(".scroll-in").forEach(el => obs.observe(el));
    const onScroll = () => setScrolled(window.scrollY > 320);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { obs.disconnect(); window.removeEventListener("scroll", onScroll); };
  }, []);

  const ctaHref = loggedIn ? "/dashboard" : "/signup";

  return (
    <>
      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        html{overflow-x:hidden;scroll-behavior:smooth}
        body{background:${P.bg};color:${P.ink};font-family:${P.font};overflow-x:hidden}
        a{text-decoration:none;color:inherit}
        @keyframes caret{0%,50%{opacity:1}50.01%,100%{opacity:0}}
        @keyframes ticker{from{transform:translateX(0)}to{transform:translateX(-50%)}}
        .tk{animation:ticker 32s linear infinite}.tk:hover{animation-play-state:paused}
        @keyframes scrollIn{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:translateY(0)}}
        .scroll-in{opacity:0}.scroll-in.visible{animation:scrollIn .55s ease both}
        .nav-hamburger{display:none}
        .nav-float{display:none}
        @keyframes slideDown{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
        @media(max-width:900px){
          .g2,.g3{grid-template-columns:1fr!important}
          .nav-links{display:none!important}
          .nav-login{display:none!important}
          .nav-desktop-cta{display:none!important}
          .nav-hamburger{display:flex!important}
          .nav-float{display:flex!important}
          .pp{padding-left:20px!important;padding-right:20px!important}
          .comp-table{overflow-x:auto}
          .comp-table>div{min-width:700px}
        }
        @media(max-width:600px){
          .pp{padding-left:16px!important;padding-right:16px!important}
        }
      `}</style>

      {/* ── NAV ────────────────────────────────────────────────── */}
      <header style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(250,250,247,0.88)", backdropFilter: "blur(14px) saturate(180%)", borderBottom: `1px solid ${P.line}` }}>
        <div className="pp" style={{ maxWidth: 1200, margin: "0 auto", padding: "0 32px", display: "flex", alignItems: "center", gap: 32, height: 68 }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Mark size={28}/>
            <span style={{ fontFamily: P.font, fontSize: 22, fontWeight: 700, color: P.ink, letterSpacing: -0.6 }}>in<span style={{ color: P.six }}>six</span>live</span>
          </Link>
          <nav className="nav-links" style={{ display: "flex", gap: 26, flex: 1 }}>
            {[["/how-it-works","How it works"],["/examples","Examples"],["/pricing","Pricing"],["/domains","Domains"],["/faq","FAQ"]].map(([h,l]) => (
              <a key={h} href={h} style={{ fontFamily: P.font, fontSize: 14, fontWeight: 500, color: P.muted }}>{l}</a>
            ))}
          </nav>
          <div className="nav-login" style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {loggedIn
              ? <Link href="/dashboard" style={{ fontFamily: P.font, fontSize: 14, fontWeight: 500, color: P.inkSoft }}>Dashboard</Link>
              : <Link href="/login" style={{ fontFamily: P.font, fontSize: 14, fontWeight: 500, color: P.inkSoft }}>Log in</Link>}
          </div>
          <div className="nav-desktop-cta" style={{ display: "flex" }}>
            <Link href={ctaHref} style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "linear-gradient(180deg,#FF6A33 0%,#E54B14 100%)", color: "#fff", padding: "9px 18px", borderRadius: 8, fontFamily: P.font, fontSize: 14, fontWeight: 600, boxShadow: "0 1px 0 rgba(255,255,255,0.20) inset,0 8px 20px rgba(255,90,31,0.28)" }}>
              Build my site <ArrowR/>
            </Link>
          </div>
          <button className="nav-hamburger" onClick={() => setMenuOpen(o => !o)} aria-label="Open menu" style={{ background: "none", border: "none", cursor: "pointer", padding: 8, marginLeft: "auto", alignItems: "center", justifyContent: "center", borderRadius: 8, color: P.ink }}>
            {menuOpen
              ? <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 4l14 14M18 4L4 18"/></svg>
              : <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 6h16M3 11h16M3 16h16"/></svg>
            }
          </button>
        </div>
      </header>

      {/* ── MOBILE MENU OVERLAY ─────────────────────────────────── */}
      {menuOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 200, background: P.ink, display: "flex", flexDirection: "column", animation: "slideDown .2s ease both" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", height: 68, borderBottom: "1px solid rgba(255,255,255,0.08)", flexShrink: 0 }}>
            <Link href="/" onClick={() => setMenuOpen(false)} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Mark size={28}/>
              <span style={{ fontFamily: P.font, fontSize: 22, fontWeight: 700, color: "#fff", letterSpacing: -0.6 }}>in<span style={{ color: P.six }}>six</span>live</span>
            </Link>
            <button onClick={() => setMenuOpen(false)} aria-label="Close menu" style={{ background: "none", border: "none", cursor: "pointer", padding: 8, color: "rgba(255,255,255,0.7)", display: "flex" }}>
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 4l14 14M18 4L4 18"/></svg>
            </button>
          </div>
          <nav style={{ flex: 1, display: "flex", flexDirection: "column", padding: "24px 20px", gap: 4, overflowY: "auto" }}>
            {[["/how-it-works","How it works"],["/examples","Examples"],["/pricing","Pricing"],["/domains","Domains"],["/faq","FAQ"]].map(([h,l]) => (
              <Link key={h} href={h} onClick={() => setMenuOpen(false)} style={{ display: "block", padding: "14px 0", fontFamily: P.font, fontSize: 22, fontWeight: 600, color: "#fff", textDecoration: "none", borderBottom: "1px solid rgba(255,255,255,0.07)", letterSpacing: -0.4 }}>{l}</Link>
            ))}
          </nav>
          <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 10, borderTop: "1px solid rgba(255,255,255,0.08)", flexShrink: 0 }}>
            <Link href={ctaHref} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "linear-gradient(180deg,#FF6A33 0%,#E54B14 100%)", color: "#fff", padding: 16, borderRadius: 12, fontFamily: P.font, fontSize: 16, fontWeight: 700, textDecoration: "none", boxShadow: "0 1px 0 rgba(255,255,255,0.20) inset,0 12px 28px rgba(255,90,31,0.32)" }}>
              Build my site — €59.99 <ArrowR/>
            </Link>
            {loggedIn
              ? <Link href="/dashboard" style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 14, borderRadius: 12, fontFamily: P.font, fontSize: 15, color: "rgba(255,255,255,0.7)", textDecoration: "none", border: "1px solid rgba(255,255,255,0.12)" }}>Dashboard</Link>
              : <Link href="/login" style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 14, borderRadius: 12, fontFamily: P.font, fontSize: 15, color: "rgba(255,255,255,0.7)", textDecoration: "none", border: "1px solid rgba(255,255,255,0.12)" }}>Log in</Link>
            }
          </div>
        </div>
      )}

      {/* ── FLOATING CTA (mobile, on scroll) ────────────────────── */}
      <div className="nav-float" style={{ position: "fixed", bottom: 24, left: "50%", transform: `translateX(-50%) translateY(${scrolled ? 0 : 12}px)`, opacity: scrolled ? 1 : 0, zIndex: 90, pointerEvents: scrolled ? "auto" : "none", transition: "opacity .3s ease,transform .3s ease", display: "none" }}>
        <Link href={ctaHref} style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "linear-gradient(180deg,#FF6A33 0%,#E54B14 100%)", color: "#fff", padding: "14px 24px", borderRadius: 999, fontFamily: P.font, fontSize: 15, fontWeight: 700, textDecoration: "none", boxShadow: "0 4px 24px rgba(255,90,31,0.45),0 1px 0 rgba(255,255,255,0.20) inset", whiteSpace: "nowrap" as const }}>
          Get started <ArrowR/>
        </Link>
      </div>

      {/* ── HERO (Awesomic design system) ───────────────────────── */}
      <section className={cosmica.variable} style={{ background: AW.mist, color: AW.ink, padding: "clamp(72px, 10vw, 120px) 0 clamp(56px, 7vw, 96px)", position: "relative" }}>
        <div className="pp" style={{ maxWidth: 1200, margin: "0 auto", padding: "0 32px" }}>
          <div className="g2" style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 48, alignItems: "center" }}>
            <div>
              <h1 style={{ fontFamily: AW.font, fontSize: "clamp(2.6rem,5.5vw,64px)", lineHeight: 1.12, fontWeight: 700, color: AW.obsidian, margin: "0 0 20px" }}>
                Stop renting<br/><span style={{ color: AW.ash }}>your website.</span>
              </h1>
              <div className="g3" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20, maxWidth: 540, marginTop: 40 }}>
                {[["€59.99","One-time"],["~6 min","Live"],["100%","Code ownership"]].map(([v,l]) => (
                  <div key={l}>
                    <div style={{ fontFamily: AW.font, fontSize: 40, fontWeight: 700, color: AW.obsidian, lineHeight: 1, whiteSpace: "nowrap" as const }}>{v}</div>
                    <div style={{ fontFamily: AW.font, fontSize: 13, fontWeight: 400, color: AW.steel, lineHeight: 1.56, marginTop: 4 }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p style={{ fontFamily: AW.font, fontSize: 16, fontWeight: 400, lineHeight: 1.5, color: AW.ink, margin: "0 0 24px" }}>
                Generate a professional website, deploy it under your own Vercel account, and keep the code forever. No monthly fees.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <Link href={ctaHref} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, background: AW.obsidian, color: AW.snow, padding: "12px 16px", borderRadius: 36, fontFamily: AW.font, fontSize: 16, fontWeight: 500, boxShadow: "rgba(255, 255, 255, 0.5) 0px 0.5px 0px 0px inset, rgba(117, 123, 133, 0.4) 0px 9px 14px -5px inset, rgb(44, 46, 52) 0px 0px 0px 1.5px, rgba(0, 0, 0, 0.14) 0px 4px 6px 0px" }}>
                  Build my website — €59.99 <ArrowR/>
                </Link>
                <a href="#examples" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", background: AW.snow, color: AW.graphite, border: `1px solid ${AW.graphite}`, borderRadius: 36, padding: 20, fontFamily: AW.font, fontSize: 16, fontWeight: 500 }}>
                  See examples
                </a>
              </div>
              <div style={{ fontFamily: AW.font, fontSize: 10, fontWeight: 500, lineHeight: 1.8, color: AW.steel, marginTop: 18 }}>
                One-time payment · No subscriptions · Full ownership
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TICKER ──────────────────────────────────────────────── */}
      <div style={{ borderTop: `1px solid ${P.line}`, borderBottom: `1px solid ${P.line}`, overflow: "hidden", height: 40, display: "flex", alignItems: "center" }}>
        <div className="tk" style={{ display: "flex", whiteSpace: "nowrap" }}>
          {[...Array(2)].flatMap((_,p) =>
            ["Next.js","Vercel","Stripe","Claude AI","€59.99 one-time","~6 minutes","Zero lock-in","100% yours","No subscriptions","Production-ready"].map(item => (
              <span key={`${p}-${item}`} style={{ fontFamily: P.mono, fontSize: 10, color: P.muted, letterSpacing: "0.12em", textTransform: "uppercase" as const, padding: "0 24px" }}>{item} ·</span>
            ))
          )}
        </div>
      </div>

      {/* ── PAIN ────────────────────────────────────────────────── */}
      <section className="pp scroll-in" style={{ padding: "clamp(52px, 8.7vw, 104px) 32px", maxWidth: 1200, margin: "0 auto" }}>
        <Eyebrow>// the rental trap</Eyebrow>
        <h2 style={{ fontFamily: P.font, fontSize: "clamp(1.8rem,3vw,48px)", fontWeight: 700, letterSpacing: -1.4, lineHeight: 1.02, color: P.ink, margin: "0 0 12px" }}>
          Your business needs a website.<br/><span style={{ color: P.muted }}>Agencies know that.</span>
        </h2>
        <p style={{ fontFamily: P.font, fontSize: 18, lineHeight: 1.5, color: P.muted, margin: "0 0 48px", maxWidth: 720 }}>
          A small business website should not cost €1,000 upfront and another monthly fee just to stay online. Most local businesses need a clean, professional website that works — and belongs to them.
        </p>
        <div className="g2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <div style={{ padding: 32, borderRadius: 18, background: "#fff", border: `1px solid ${P.line}` }}>
            <div style={{ fontFamily: P.mono, fontSize: 11, fontWeight: 700, color: P.muted, textTransform: "uppercase" as const, letterSpacing: 0.8, marginBottom: 14 }}>Traditional website</div>
            <div style={{ fontFamily: P.font, fontSize: 32, fontWeight: 700, letterSpacing: -1, marginBottom: 4, color: P.ink }}>€1,000+</div>
            <div style={{ fontFamily: P.font, fontSize: 13, color: P.muted, marginBottom: 22 }}>upfront, plus monthly fees</div>
            {["Weeks of back-and-forth","Locked inside a closed platform","Changes of generated websites are not available","You don't fully own the result"].map(s => (
              <div key={s} style={{ display: "flex", gap: 10, padding: "8px 0", fontFamily: P.font, fontSize: 14, color: P.inkSoft, borderBottom: `1px solid ${P.line}` }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke={P.six} strokeWidth="1.6" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 1 }}><path d="M4 4l8 8M12 4l-8 8"/></svg>
                {s}
              </div>
            ))}
          </div>
          <div style={{ padding: 32, borderRadius: 18, background: T.bg, position: "relative", overflow: "hidden" }}>
            <DotGrid opacity={0.05}/>
            <div style={{ position: "absolute", top: -80, right: -60, width: 240, height: 240, borderRadius: 120, background: "radial-gradient(circle,rgba(74,222,128,0.30),rgba(74,222,128,0) 65%)", filter: "blur(15px)", pointerEvents: "none" }}/>
            <div style={{ position: "relative" }}>
              <TechBadge>insixlive</TechBadge>
              <div style={{ fontFamily: P.mono, fontSize: 36, fontWeight: 700, letterSpacing: -1, marginTop: 14, marginBottom: 4, color: "#fff" }}>€59.99</div>
              <div style={{ fontFamily: P.font, fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 22 }}>one-time, then free</div>
              {["Live in around 6 minutes","Deployed to your own Vercel","Full source code in your inbox","No subscription, ever"].map(s => (
                <div key={s} style={{ display: "flex", gap: 10, padding: "8px 0", fontFamily: P.font, fontSize: 14, color: "rgba(255,255,255,0.85)", borderBottom: `1px solid ${T.line}` }}>
                  <CheckIcon size={14} color={T.green}/>
                  {s}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── SOLUTION ────────────────────────────────────────────── */}
      <section className="pp scroll-in" style={{ padding: "clamp(52px, 8.7vw, 104px) 32px", background: P.bg2, borderTop: `1px solid ${P.line}` }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <Eyebrow>// the solution</Eyebrow>
          <h2 style={{ fontFamily: P.font, fontSize: "clamp(1.8rem,3vw,48px)", fontWeight: 700, letterSpacing: -1.4, lineHeight: 1.02, color: P.ink, margin: "0 0 12px" }}>
            A real website, generated by AI,<br/><span style={{ color: P.six }}>deployed to your account.</span>
          </h2>
          <p style={{ fontFamily: P.font, fontSize: 18, lineHeight: 1.5, color: P.muted, margin: "0 0 56px", maxWidth: 720 }}>
            insixlive turns your business description into a complete professional website. Answer a few questions, choose your style, pay once — deployed to your own Vercel account.
          </p>
          <div className="g3" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
            {[
              { d:"M12 3v18M3 12h18",            t:"AI-generated website",          b:"Professional copy, layout, sections, responsive design — all written for your business." },
              { d:"M3 16l9-13 9 13H3z",           t:"Deployed to your Vercel",       b:"Your website lives in your own account. Not inside a closed builder." },
              { d:"M8 7l-5 5 5 5M16 7l5 5-5 5M14 4l-4 16", t:"Full source code ownership", b:"Keep it, edit it, move it, or hand it to a developer. Every file is yours." },
              { d:"M12 22c5.5 0 10-4.5 10-10S17.5 2 12 2 2 6.5 2 12s4.5 10 10 10zM12 8v4l3 2", t:"No monthly fees", b:"Pay once for the website. Vercel hosting stays free for most small sites." },
              { d:"M12 22c5.5 0 10-4.5 10-10S17.5 2 12 2 2 6.5 2 12s4.5 10 10 10zM3 12h18M12 3a13 13 0 010 18", t:"Custom domain ready", b:"Connect a domain you already own, or buy one separately — your call." },
              { d:"M3 12L12 3l9 9-9 9z",          t:"Built in real Next.js",         b:"No proprietary builder. Standard React, Tailwind, and a Vercel deploy." },
            ].map(f => (
              <div key={f.t} style={{ padding: 24, borderRadius: 14, background: "#fff", border: `1px solid ${P.line}` }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: P.bg2, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={P.ink} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d={f.d}/></svg>
                </div>
                <div style={{ fontFamily: P.font, fontSize: 17, fontWeight: 700, color: P.ink, marginBottom: 6, letterSpacing: -0.3 }}>{f.t}</div>
                <div style={{ fontFamily: P.font, fontSize: 14, lineHeight: 1.5, color: P.muted }}>{f.b}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────── */}
      <section id="how" className="pp scroll-in" style={{ padding: "clamp(52px, 8.7vw, 104px) 32px", maxWidth: 1200, margin: "0 auto" }}>
        <Eyebrow>// from prompt to live</Eyebrow>
        <h2 style={{ fontFamily: P.font, fontSize: "clamp(1.8rem,3vw,48px)", fontWeight: 700, letterSpacing: -1.4, lineHeight: 1.02, color: P.ink, margin: "0 0 12px" }}>
          Six steps.<br/><span style={{ color: P.muted }}>One live website.</span>
        </h2>
        <p style={{ fontFamily: P.font, fontSize: 18, lineHeight: 1.5, color: P.muted, margin: "0 0 48px", maxWidth: 640 }}>
          Most builders take days. Most freelancers take weeks. We take about six minutes.
        </p>
        <div className="g3" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
          {[
            ["01","Describe your business",  "Name, services, audience, location, tone."],
            ["02","Choose the look",         "Style, colors, typography, layout."],
            ["03","Pick your pages",         "Home, About, Services, Contact, Booking…"],
            ["04","Review the brief",        "Check the plan before generation starts."],
            ["05","Pay once",                "Stripe checkout, no recurring charge."],
            ["06","Go live",                 "Generated, deployed to your Vercel, in ~6 min."],
          ].map(([n,t,s],i,arr) => (
            <div key={n} style={{ padding: "24px 22px", borderRadius: 14, background: "#fff", border: `1px solid ${P.line}`, position: "relative", overflow: "hidden" }}>
              <div style={{ fontFamily: P.mono, fontSize: 11, fontWeight: 700, color: i === arr.length-1 ? P.six : P.muted, letterSpacing: 1, marginBottom: 12 }}>{n}</div>
              <div style={{ fontFamily: P.font, fontSize: 17, fontWeight: 700, color: P.ink, letterSpacing: -0.3, marginBottom: 4 }}>{t}</div>
              <div style={{ fontFamily: P.font, fontSize: 13.5, color: P.muted, lineHeight: 1.5 }}>{s}</div>
              {i === arr.length-1 && <div style={{ position: "absolute", top: 12, right: 12 }}><TechBadge color={T.six}>Live</TechBadge></div>}
            </div>
          ))}
        </div>
      </section>

      {/* ── EXAMPLES ────────────────────────────────────────────── */}
      <section id="examples" className="pp scroll-in" style={{ padding: "clamp(52px, 8.7vw, 104px) 32px", background: P.bg2, borderTop: `1px solid ${P.line}` }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 18, marginBottom: 40 }}>
            <div>
              <Eyebrow>// shipped sites</Eyebrow>
              <h2 style={{ fontFamily: P.font, fontSize: "clamp(1.8rem,3vw,48px)", fontWeight: 700, letterSpacing: -1.4, lineHeight: 1.02, color: P.ink, margin: 0 }}>
                Websites built<br/>with insixlive.
              </h2>
            </div>
            <Link href={ctaHref} style={{ display: "inline-flex", alignItems: "center", gap: 6, border: `1px solid ${P.line}`, color: P.ink, padding: "12px 18px", borderRadius: 10, fontFamily: P.font, fontSize: 14, fontWeight: 500, flexShrink: 0 }}>
              Build yours <ArrowR color={P.ink}/>
            </Link>
          </div>
          <div className="g3" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18 }}>
            {EXAMPLES.map(e => (
              <div key={e.name}>
                <SiteMock {...e}/>
                <div style={{ marginTop: 10, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontFamily: P.font, fontSize: 14, fontWeight: 700, color: P.ink }}>{e.name}</div>
                    <div style={{ fontFamily: P.mono, fontSize: 11, color: P.muted, marginTop: 1 }}>{e.kind}</div>
                  </div>
                  <span style={{ fontFamily: P.mono, fontSize: 11, fontWeight: 600, color: P.ink }}>View ↗</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── OWNERSHIP (dark) ─────────────────────────────────────── */}
      <section style={{ background: T.bg, padding: "clamp(52px, 8.7vw, 104px) 0", position: "relative", overflow: "hidden" }}>
        <DotGrid opacity={0.04}/>
        <div style={{ position: "absolute", top: 0, right: -200, width: 600, height: 600, borderRadius: 300, background: "radial-gradient(circle,rgba(255,90,31,0.18),rgba(255,90,31,0) 65%)", filter: "blur(20px)", pointerEvents: "none" }}/>
        <div className="pp" style={{ maxWidth: 1200, margin: "0 auto", padding: "0 32px", position: "relative" }}>
          <div className="g2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 56, alignItems: "center" }}>
            <div>
              <Eyebrow dark>// ownership</Eyebrow>
              <h2 style={{ fontFamily: P.font, fontSize: "clamp(1.8rem,3.5vw,52px)", fontWeight: 700, letterSpacing: -1.4, lineHeight: 1.02, color: "#fff", margin: "0 0 12px" }}>
                You don&apos;t rent your website.<br/><span style={{ color: T.green }}>You own it.</span>
              </h2>
              <p style={{ fontFamily: P.font, fontSize: 18, lineHeight: 1.5, color: "rgba(255,255,255,0.62)", margin: "0 0 28px", maxWidth: 500 }}>
                Most website builders keep your business inside their platform. insixlive gives you a real website deployed to your own Vercel account, with code you can keep forever.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {[["Full source code","Every file in your repo."],["Your Vercel account","The site is deployed under your control."],["Your custom domain","Use one you own or buy one separately."],["No lock-in","Move the code anywhere later."],["No subscription","Pay once for the generated website."]].map(([t,s]) => (
                  <div key={t} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                    <div style={{ width: 22, height: 22, borderRadius: 11, background: "rgba(74,222,128,0.12)", border: "1px solid rgba(74,222,128,0.35)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                      <CheckIcon size={11} color={T.green}/>
                    </div>
                    <div>
                      <div style={{ fontFamily: P.font, fontSize: 15, fontWeight: 600, color: "#fff" }}>{t}</div>
                      <div style={{ fontFamily: P.font, fontSize: 13.5, color: "rgba(255,255,255,0.5)" }}>{s}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                { label: "Your business info",        sub: "name · services · vibe",          color: T.text,  bg: "rgba(255,255,255,0.05)" },
                { label: "insixlive · AI generation", sub: "claude-sonnet · Next.js · 6 min", color: T.plum,  bg: "rgba(199,146,234,0.10)" },
                { label: "Your Vercel account",       sub: "deploy under your name",          color: T.sky,   bg: "rgba(125,211,252,0.10)" },
                { label: "Your live website + code",  sub: "yourbusiness.com · forever",      color: T.green, bg: "rgba(74,222,128,0.10)" },
              ].map((row,i,arr) => (
                <div key={row.label}>
                  <div style={{ padding: "18px 22px", borderRadius: 12, background: row.bg, border: `1px solid ${T.line}`, display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 5, background: row.color, boxShadow: `0 0 10px ${row.color}`, flexShrink: 0 }}/>
                    <div>
                      <div style={{ fontFamily: P.mono, fontSize: 14, color: "#fff", fontWeight: 600 }}>{row.label}</div>
                      <div style={{ fontFamily: P.mono, fontSize: 11, color: T.muted, marginTop: 2 }}>{row.sub}</div>
                    </div>
                  </div>
                  {i < arr.length-1 && <div style={{ textAlign: "center" as const, color: T.muted, fontFamily: P.mono, fontSize: 16, lineHeight: "28px" }}>↓</div>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── COMPARISON ──────────────────────────────────────────── */}
      <section className="pp scroll-in" style={{ padding: "clamp(52px, 8.7vw, 104px) 32px", maxWidth: 1200, margin: "0 auto" }}>
        <Eyebrow>// the math</Eyebrow>
        <h2 style={{ fontFamily: P.font, fontSize: "clamp(1.8rem,3vw,48px)", fontWeight: 700, letterSpacing: -1.4, lineHeight: 1.02, color: P.ink, margin: "0 0 12px" }}>The math is simple.</h2>
        <p style={{ fontFamily: P.font, fontSize: 18, lineHeight: 1.5, color: P.muted, margin: "0 0 36px", maxWidth: 640 }}>insixlive vs. the usual suspects. Pricing is illustrative — competitor plans change.</p>
        <div className="comp-table">
          <div style={{ borderRadius: 16, overflow: "hidden", border: `1px solid ${P.line}`, background: "#fff" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1.5fr repeat(6,1fr)", background: P.bg2, borderBottom: `1px solid ${P.line}` }}>
              {["Option","Upfront","Monthly","Year 1","Year 5","Own code","Lock-in"].map(h => (
                <div key={h} style={{ padding: "14px 16px", fontFamily: P.mono, fontSize: 11, fontWeight: 700, color: P.muted, textTransform: "uppercase" as const, letterSpacing: 0.6 }}>{h}</div>
              ))}
            </div>
            {COMP_ROWS.map((r,i) => (
              <div key={r.name} style={{ display: "grid", gridTemplateColumns: "1.5fr repeat(6,1fr)", borderBottom: i < COMP_ROWS.length-1 ? `1px solid ${P.line}` : "none", background: r.active ? "rgba(255,90,31,0.04)" : "transparent" }}>
                <div style={{ padding: "16px 16px", fontFamily: P.font, fontSize: 13.5, display: "flex", alignItems: "center", gap: 8, fontWeight: r.active ? 700 : 500 }}>
                  {r.active && <span style={{ width: 6, height: 6, borderRadius: 3, background: P.six, boxShadow: `0 0 6px ${P.six}` }}/>}
                  {r.name}
                </div>
                {[r.upfront,r.monthly,r.yr1,r.yr5].map((v,j) => (
                  <div key={j} style={{ padding: "16px 16px", fontFamily: P.mono, fontSize: 13.5, color: r.active ? P.ink : P.inkSoft }}>{v}</div>
                ))}
                <div style={{ padding: "16px 16px", fontFamily: P.mono, fontSize: 13.5, color: r.own==="Yes" ? P.em2 : r.own==="No" ? P.six : P.muted, fontWeight: 600 }}>{r.own}</div>
                <div style={{ padding: "16px 16px", fontFamily: P.mono, fontSize: 13.5, color: r.lock==="No" ? P.em2 : r.lock==="Yes" ? P.six : P.muted, fontWeight: 600 }}>{r.lock}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ marginTop: 14, fontFamily: P.mono, fontSize: 11.5, color: P.muted }}>* Competitor pricing varies. We use &ldquo;typical&rdquo; or &ldquo;from&rdquo; numbers based on public plans as of 2026.</div>
      </section>

      {/* ── PRICING ─────────────────────────────────────────────── */}
      <section id="pricing" className="pp scroll-in" style={{ padding: "clamp(52px, 8.7vw, 104px) 32px", background: P.bg2, borderTop: `1px solid ${P.line}` }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 18, marginBottom: 40 }}>
            <div>
              <Eyebrow>// one-time pricing</Eyebrow>
              <h2 style={{ fontFamily: P.font, fontSize: "clamp(1.8rem,3vw,48px)", fontWeight: 700, letterSpacing: -1.4, lineHeight: 1.02, color: P.ink, margin: 0 }}>
                One-time pricing.<br/><span style={{ color: P.muted }}>No monthly website rent.</span>
              </h2>
            </div>
            <Link href="/pricing" style={{ display: "inline-flex", alignItems: "center", gap: 6, border: `1px solid ${P.line}`, color: P.ink, padding: "12px 18px", borderRadius: 10, fontFamily: P.font, fontSize: 14, fontWeight: 500 }}>
              See all plan details <ArrowR color={P.ink}/>
            </Link>
          </div>
          <div className="g3" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18, alignItems: "stretch" }}>
            {PLANS.map(p => <PlanCard key={p.id} plan={p} ctaHref={ctaHref}/>)}
          </div>
          <div style={{ marginTop: 22, padding: "14px 18px", borderRadius: 12, background: "#fff", border: `1px solid ${P.line}`, display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
            <span style={{ fontFamily: P.mono, fontSize: 11, fontWeight: 700, color: P.muted, textTransform: "uppercase" as const, letterSpacing: 0.6 }}>Note</span>
            <span style={{ fontFamily: P.font, fontSize: 14, color: P.inkSoft }}>
              Custom domains are <b style={{ color: P.ink }}>not included</b> — purchase a domain separately on Vercel (typically €12–30/yr). If you want changes to the site, simply regenerate for €59.99.
            </span>
          </div>
        </div>
      </section>

      {/* ── DOMAINS ─────────────────────────────────────────────── */}
      <section id="domains" className="pp scroll-in" style={{ padding: "clamp(52px, 8.7vw, 104px) 32px", maxWidth: 1200, margin: "0 auto" }}>
        <div className="g2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center" }}>
          <div>
            <Eyebrow>// domains</Eyebrow>
            <h2 style={{ fontFamily: P.font, fontSize: "clamp(1.8rem,3vw,48px)", fontWeight: 700, letterSpacing: -1.4, lineHeight: 1.02, color: P.ink, margin: "0 0 12px" }}>
              Use your own domain.<br/><span style={{ color: P.muted }}>Or buy one separately.</span>
            </h2>
            <p style={{ fontFamily: P.font, fontSize: 18, lineHeight: 1.5, color: P.muted, margin: "0 0 28px", maxWidth: 500 }}>
              Your generated website goes live first on a Vercel URL. Then you can connect a custom domain like <b style={{ color: P.ink }}>yourbusiness.com</b> — one you already own, or one you buy from any registrar.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                ["Connect a domain you already own","Copy-paste DNS records · GoDaddy, Namecheap, Porkbun, Cloudflare"],
                ["Buy a new domain separately","Typically €12–30/yr · paid to the domain provider"],
                ["Automatic SSL after connection","Vercel handles HTTPS — no certificates to install"],
              ].map(([t,s]) => (
                <div key={t} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <div style={{ width: 22, height: 22, borderRadius: 11, background: P.sixSoft, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                    <CheckIcon size={11} color={P.six}/>
                  </div>
                  <div>
                    <div style={{ fontFamily: P.font, fontSize: 15, fontWeight: 600, color: P.ink }}>{t}</div>
                    <div style={{ fontFamily: P.font, fontSize: 13.5, color: P.muted }}>{s}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 22 }}>
              <Link href="/help/setup-custom-domain" style={{ display: "inline-flex", alignItems: "center", gap: 6, border: `1px solid ${P.line}`, color: P.ink, padding: "12px 18px", borderRadius: 10, fontFamily: P.font, fontSize: 14, fontWeight: 500 }}>
                How domain setup works <ArrowR color={P.ink}/>
              </Link>
            </div>
          </div>

          {/* DNS card */}
          <div style={{ background: T.bg, borderRadius: 18, padding: 28, position: "relative", overflow: "hidden" }}>
            <DotGrid opacity={0.04}/>
            <div style={{ position: "absolute", top: -100, right: -80, width: 320, height: 320, borderRadius: 160, background: "radial-gradient(circle,rgba(255,90,31,0.30),rgba(255,90,31,0) 65%)", filter: "blur(15px)", pointerEvents: "none" }}/>
            <div style={{ position: "relative" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
                <span style={{ fontFamily: P.mono, fontSize: 11, fontWeight: 700, color: T.muted, textTransform: "uppercase" as const, letterSpacing: 0.6 }}>DNS · A record</span>
                <TechBadge color={T.green}>connected</TechBadge>
              </div>
              <div style={{ fontFamily: P.mono, fontSize: 16, color: "#fff", marginBottom: 6 }}>acme-plumbing<span style={{ color: T.muted }}>.vercel.app</span></div>
              <div style={{ fontFamily: P.mono, fontSize: 13, color: T.muted, marginBottom: 16 }}>↓</div>
              <div style={{ fontFamily: P.mono, fontSize: 16, color: T.green, marginBottom: 24 }}>acme-plumbing.de</div>
              <div style={{ padding: "14px 16px", borderRadius: 10, background: "rgba(255,255,255,0.04)", border: `1px solid ${T.line}`, fontFamily: P.mono, fontSize: 12, lineHeight: 1.7 }}>
                {[["type",T.amber,"A"],["name","#fff","@"],["value",T.sky,"76.76.21.21"],["ttl","#fff","3600"]].map(([k,vc,v]) => (
                  <div key={k as string} style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: T.muted }}>{k}</span><span style={{ color: vc as string }}>{v}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 12, padding: "14px 16px", borderRadius: 10, background: "rgba(74,222,128,0.06)", border: "1px solid rgba(74,222,128,0.25)", display: "flex", alignItems: "center", gap: 8, fontFamily: P.mono, fontSize: 12, color: T.green }}>
                <CheckIcon size={12} color={T.green}/> SSL issued · HTTPS active
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PROOF ───────────────────────────────────────────────── */}
      <section className="pp scroll-in" style={{ padding: "clamp(52px, 8.7vw, 104px) 32px", background: P.bg2, borderTop: `1px solid ${P.line}` }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <Eyebrow>// real businesses</Eyebrow>
          <h2 style={{ fontFamily: P.font, fontSize: "clamp(1.8rem,3vw,48px)", fontWeight: 700, letterSpacing: -1.4, lineHeight: 1.02, color: P.ink, margin: "0 0 12px" }}>
            Built for small business owners<br/><span style={{ color: P.muted }}>who need a real website without agency prices.</span>
          </h2>
          <p style={{ fontFamily: P.font, fontSize: 18, lineHeight: 1.5, color: P.muted, margin: "0 0 56px", maxWidth: 640 }}>Tested with salons, trades, clinics, and freelancers across the EU during private beta.</p>
          <div className="g3" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
            {[
              { name:"Markus Lehmann", biz:"Acme Plumbing · Munich", quote:"I described the business in two sentences. Six minutes later I had a website I could send to the printer. No subscription, no monthly bill.", plan:"Pro",     accent: P.six  },
              { name:"Maria Coelho",   biz:"Maria's Hair · Lisbon",  quote:"My old site was on a builder I was paying €18/month for. I rebuilt with insixlive and now I just own the code. The math is brutal in their favor.", plan:"Basic",   accent: T.green },
              { name:"Dr. Anna Kohl", biz:"Kohl Dental · Berlin",   quote:"I wanted a clean, calm, trustworthy site. The first draft was 80% of the way there — three small edits and we shipped it.", plan:"Premium", accent: T.sky   },
            ].map(t => (
              <div key={t.name} style={{ padding: 28, borderRadius: 16, background: "#fff", border: `1px solid ${P.line}` }}>
                <svg width="22" height="22" viewBox="0 0 22 22" style={{ marginBottom: 18, color: t.accent, flexShrink: 0 }}>
                  <path d="M4 14c0-4 3-7 6-7v3c-1 0-3 1-3 4h3v6H4v-6zM13 14c0-4 3-7 6-7v3c-1 0-3 1-3 4h3v6h-6v-6z" fill="currentColor" opacity="0.85"/>
                </svg>
                <p style={{ fontFamily: P.font, fontSize: 16, lineHeight: 1.55, color: P.ink, marginBottom: 22 }}>{t.quote}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
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

      {/* ── FAQ ─────────────────────────────────────────────────── */}
      <FAQSection/>

      {/* ── FINAL CTA ───────────────────────────────────────────── */}
      <section style={{ background: T.bg, padding: "clamp(60px, 10vw, 120px) 32px", position: "relative", overflow: "hidden", textAlign: "center" as const }}>
        <DotGrid opacity={0.05}/>
        <div style={{ position: "absolute", top: -200, left: "50%", transform: "translateX(-50%)", width: 900, height: 900, borderRadius: 450, background: "radial-gradient(circle,rgba(255,90,31,0.25),rgba(255,90,31,0) 60%)", filter: "blur(20px)", pointerEvents: "none" }}/>
        <div style={{ maxWidth: 800, margin: "0 auto", position: "relative" }}>
          <Eyebrow dark>// six minutes</Eyebrow>
          <h2 style={{ fontFamily: P.font, fontSize: "clamp(2.4rem,5vw,72px)", fontWeight: 700, letterSpacing: -3, lineHeight: 0.98, color: "#fff", margin: "0 0 22px" }}>
            Six minutes from now,<br/><span style={{ color: T.six }}>you&apos;re live.</span>
          </h2>
          <p style={{ fontFamily: P.font, fontSize: 20, lineHeight: 1.5, color: "rgba(255,255,255,0.62)", margin: "0 auto 36px", maxWidth: 560 }}>
            Stop renting a website that doesn&apos;t belong to you. Build something you own.
          </p>
          <Link href={ctaHref} style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "linear-gradient(180deg,#FF6A33 0%,#E54B14 100%)", color: "#fff", padding: "18px 32px", borderRadius: 14, fontFamily: P.font, fontSize: 16, fontWeight: 700, boxShadow: "0 1px 0 rgba(255,255,255,0.20) inset,0 16px 36px rgba(255,90,31,0.36)" }}>
            Build my website — €59.99 <ArrowR/>
          </Link>
          <p style={{ fontFamily: P.mono, fontSize: 12, color: "rgba(255,255,255,0.35)", letterSpacing: "0.08em", textTransform: "uppercase" as const, marginTop: 18 }}>
            One-time · Stripe-secured · Yours forever
          </p>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────── */}
      <footer style={{ background: T.bg, color: T.text, padding: "72px 0 32px", position: "relative", overflow: "hidden", borderTop: `1px solid ${T.line}` }}>
        <DotGrid opacity={0.04}/>
        <div className="pp" style={{ maxWidth: 1200, margin: "0 auto", padding: "0 32px", position: "relative" }}>
          <div className="hp-footer-grid">
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <Mark size={28}/>
                <span style={{ fontFamily: P.font, fontSize: 22, fontWeight: 700, color: "#fff", letterSpacing: -0.6 }}>in<span style={{ color: P.six }}>six</span>live</span>
              </div>
              <div style={{ fontFamily: P.font, fontSize: 14, color: "rgba(255,255,255,0.55)", lineHeight: 1.5, maxWidth: 280 }}>
                Own your website. Don&apos;t rent it.<br/>AI builds it. Vercel hosts it. You own every line.
              </div>
              <div style={{ marginTop: 18, display: "flex", gap: 8, alignItems: "center", fontFamily: P.mono, fontSize: 11, color: T.muted }}>
                <span style={{ width: 6, height: 6, borderRadius: 3, background: T.green, boxShadow: `0 0 6px ${T.green}` }}/>
                <span>status · all systems live</span>
              </div>
            </div>
            {([
              ["Product",  [["How it works","/how-it-works"],["Examples","/examples"],["Pricing","/pricing"],["Domains","/domains"],["FAQ","/faq"]]],
              ["Account",  [["Log in","/login"],["Sign up","/signup"],["Dashboard","/dashboard"]]],
              ["Support",  [["Domain setup","/help/setup-custom-domain"],["Help center","/help/setup-custom-domain"]]],
              ["Legal",    [["Terms","#"],["Privacy","#"],["Cookies","#"]]],
            ] as [string, [string,string][]][]).map(([title, items]) => (
              <div key={title}>
                <div style={{ fontFamily: P.mono, fontSize: 10.5, fontWeight: 700, color: T.muted, textTransform: "uppercase" as const, letterSpacing: 0.8, marginBottom: 14 }}>{title}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {items.map(([label, href]) => (
                    <Link key={label} href={href} style={{ fontFamily: P.font, fontSize: 13.5, color: "rgba(255,255,255,0.7)" }}>{label}</Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 56, paddingTop: 24, borderTop: `1px solid ${T.line}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, fontFamily: P.mono, fontSize: 11.5, color: T.muted }}>
            <div>© 2026 insixlive · AI-powered website generation</div>
            <div style={{ display: "flex", gap: 18 }}>
              <span>Next.js</span><span style={{ opacity: 0.3 }}>·</span>
              <span>Vercel Edge</span><span style={{ opacity: 0.3 }}>·</span>
              <span>Stripe</span>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
