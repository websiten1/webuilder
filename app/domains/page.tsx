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

const REGISTRARS = [
  { name: "Namecheap",   note: "Add A record in Advanced DNS" },
  { name: "GoDaddy",     note: "Manage DNS → Add record" },
  { name: "Porkbun",     note: "DNS → Edit records" },
  { name: "Cloudflare",  note: "DNS settings → Add record (proxy off)" },
  { name: "Vercel",      note: "Buy directly from your Vercel dashboard" },
  { name: "Ionos",       note: "Domain → DNS settings" },
  { name: "Squarespace", note: "Domains → DNS settings" },
  { name: "Hover",       note: "DNS → Edit A record" },
];

const DOMAIN_FAQ: [string, string][] = [
  ["How long does DNS propagation take?",        "Usually 15–30 minutes, occasionally up to 48 hours depending on your registrar and TTL settings. Most people see it working within 20 minutes."],
  ["What if I already have a website at that domain?", "You can point the domain to insixlive at any time — just update your DNS records when you're ready to switch. Your old site stays up until you change the DNS."],
  ["Can I use a subdomain like www.mybusiness.com?", "Yes. You can use the root domain (@), www, or any subdomain. We'll give you the exact CNAME record to add for subdomains."],
  ["Do I need to buy a domain to get started?",  "No. Your site goes live immediately on a free Vercel URL (yourbusiness.vercel.app). You can add a custom domain later at any time from your dashboard."],
  ["Do you sell domains?",                       "Not directly. We recommend Namecheap (~€10–12/yr), Porkbun (~€8–10/yr), or Cloudflare Registrar (at-cost pricing). You can also buy one through Vercel during setup."],
  ["Is SSL included with a custom domain?",      "Yes. Vercel automatically provisions and renews a free SSL certificate for your custom domain. HTTPS just works — nothing to install."],
];

export default function DomainsPage() {
  const [open, setOpen] = useState(-1);

  return (
    <>
      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        html{overflow-x:hidden;scroll-behavior:smooth}
        body{background:${P.bg};color:${P.ink};font-family:${P.font};overflow-x:hidden}
        a{text-decoration:none;color:inherit}
        .g2{display:grid}.g3{display:grid}.g4{display:grid}
        @media(max-width:900px){
          .g2{grid-template-columns:1fr!important}
          .g3{grid-template-columns:1fr 1fr!important}
          .g4{grid-template-columns:1fr 1fr!important}
          .pp{padding-left:20px!important;padding-right:20px!important}
        }
        @media(max-width:600px){
          .g3{grid-template-columns:1fr!important}
          .pp{padding-left:16px!important;padding-right:16px!important}
        }
      `}</style>

      <SiteNav/>

      {/* ── HERO ── */}
      <section className="pp" style={{ padding: "80px 32px 72px", maxWidth: 1200, margin: "0 auto" }}>
        <div className="g2" style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 56, alignItems: "center" }}>
          <div>
            <Eyebrow>// domains</Eyebrow>
            <h1 style={{ fontFamily: P.font, fontSize: "clamp(2.4rem,5vw,64px)", fontWeight: 700, letterSpacing: -2.5, lineHeight: 0.98, color: P.ink, margin: "0 0 16px" }}>
              Your domain.<br/><span style={{ color: P.muted }}>Not ours.</span>
            </h1>
            <p style={{ fontFamily: P.font, fontSize: 18, lineHeight: 1.55, color: P.muted, margin: "0 0 28px", maxWidth: 520 }}>
              Your site launches immediately on a free Vercel URL. Then connect <b style={{ color: P.ink }}>any domain you own</b> — or buy a new one from any registrar. Two DNS records, 20 minutes, done.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 28 }}>
              {[
                ["Connect a domain you already own",     "Copy-paste two DNS records · works with any registrar"],
                ["Buy a new domain separately",          "Typically €8–20/yr · paid to the domain provider"],
                ["SSL automatically issued on connect",  "Vercel handles HTTPS — no certificates to configure"],
              ].map(([t, s]) => (
                <div key={t} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <div style={{ width: 22, height: 22, borderRadius: 11, background: P.sixSoft, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                    <Check size={10} color={P.six}/>
                  </div>
                  <div>
                    <div style={{ fontFamily: P.font, fontSize: 15, fontWeight: 600, color: P.ink }}>{t}</div>
                    <div style={{ fontFamily: P.font, fontSize: 13.5, color: P.muted }}>{s}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ fontFamily: P.font, fontSize: 14, color: P.muted }}>
              Custom domain is <b style={{ color: P.ink }}>not included</b> in any plan — you buy it directly from your registrar.{" "}
              <a href="#setup" style={{ color: P.six, fontWeight: 500 }}>See setup guide ↓</a>
            </div>
          </div>

          {/* DNS preview card */}
          <div style={{ background: T.bg, borderRadius: 18, padding: 28, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", inset: 0, pointerEvents: "none", backgroundImage: `radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)`, backgroundSize: "18px 18px" }}/>
            <div style={{ position: "absolute", top: -100, right: -80, width: 320, height: 320, borderRadius: 160, background: "radial-gradient(circle,rgba(255,90,31,0.28),rgba(255,90,31,0) 65%)", filter: "blur(15px)", pointerEvents: "none" }}/>
            <div style={{ position: "relative" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
                <span style={{ fontFamily: P.mono, fontSize: 11, fontWeight: 700, color: T.muted, textTransform: "uppercase" as const, letterSpacing: 0.6 }}>DNS · A record</span>
                <Badge color={T.green}>Connected</Badge>
              </div>
              <div style={{ fontFamily: P.mono, fontSize: 16, color: "#fff", marginBottom: 6 }}>
                acme-plumbing<span style={{ color: T.muted }}>.vercel.app</span>
              </div>
              <div style={{ fontFamily: P.mono, fontSize: 13, color: T.muted, marginBottom: 14 }}>↓ connect domain</div>
              <div style={{ fontFamily: P.mono, fontSize: 16, color: T.green, marginBottom: 24 }}>acme-plumbing.de</div>
              <div style={{ padding: "14px 16px", borderRadius: 10, background: "rgba(255,255,255,0.04)", border: `1px solid ${T.line}`, fontFamily: P.mono, fontSize: 12, lineHeight: 1.8 }}>
                {[["type", T.amber, "A"], ["name", "#fff", "@"], ["value", T.sky, "76.76.21.21"], ["ttl", "#fff", "3600"]].map(([k, c, v]) => (
                  <div key={k as string} style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: T.muted }}>{k}</span>
                    <span style={{ color: c as string }}>{v}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 10, padding: "12px 14px", borderRadius: 10, background: "rgba(74,222,128,0.06)", border: "1px solid rgba(74,222,128,0.25)", display: "flex", alignItems: "center", gap: 8, fontFamily: P.mono, fontSize: 12, color: T.green }}>
                <Check size={11} color={T.green}/> SSL issued · HTTPS active
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS (3 steps) ── */}
      <section style={{ background: P.bg2, borderTop: `1px solid ${P.line}`, padding: "104px 0" }}>
        <div className="pp" style={{ maxWidth: 1200, margin: "0 auto", padding: "0 32px" }}>
          <Eyebrow>// the process</Eyebrow>
          <h2 style={{ fontFamily: P.font, fontSize: "clamp(1.8rem,3vw,48px)", fontWeight: 700, letterSpacing: -1.4, lineHeight: 1.02, color: P.ink, margin: "0 0 12px" }}>
            Three steps to your own domain.
          </h2>
          <p style={{ fontFamily: P.font, fontSize: 18, lineHeight: 1.5, color: P.muted, margin: "0 0 48px", maxWidth: 580 }}>
            No nameserver transfers, no complicated dashboards. Just two records.
          </p>
          <div className="g3" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
            {[
              {
                n: "01",
                t: "Site goes live on Vercel",
                s: "Right after payment, your site deploys to a free URL: yourbusiness.vercel.app. Share it, test it, or use it permanently.",
                icon: "M5 3l14 9-14 9V3z",
                color: T.sky,
              },
              {
                n: "02",
                t: "Add two DNS records",
                s: "Log in to your domain registrar (Namecheap, GoDaddy, etc.) and add the A record and CNAME we give you. Takes about 5 minutes.",
                icon: "M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4",
                color: T.amber,
              },
              {
                n: "03",
                t: "Domain propagates + SSL",
                s: "Within 15–30 minutes your domain points to your site and Vercel issues a free SSL certificate. HTTPS is automatic.",
                icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
                color: T.green,
              },
            ].map(step => (
              <div key={step.n} style={{ padding: "26px 24px", borderRadius: 16, background: "#fff", border: `1px solid ${P.line}` }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: P.bg2, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={P.ink} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d={step.icon}/>
                  </svg>
                </div>
                <div style={{ fontFamily: P.mono, fontSize: 11, fontWeight: 700, color: step.color, letterSpacing: 1, marginBottom: 8 }}>{step.n}</div>
                <div style={{ fontFamily: P.font, fontSize: 18, fontWeight: 700, color: P.ink, letterSpacing: -0.3, marginBottom: 8 }}>{step.t}</div>
                <div style={{ fontFamily: P.font, fontSize: 14, color: P.muted, lineHeight: 1.55 }}>{step.s}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DNS RECORDS ── */}
      <section id="setup" style={{ background: T.bg, padding: "104px 0", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", backgroundImage: `radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)`, backgroundSize: "18px 18px" }}/>
        <div style={{ position: "absolute", top: -160, right: -100, width: 500, height: 500, borderRadius: 250, background: "radial-gradient(circle,rgba(125,211,252,0.12),rgba(125,211,252,0) 65%)", filter: "blur(20px)", pointerEvents: "none" }}/>
        <div className="pp" style={{ maxWidth: 1200, margin: "0 auto", padding: "0 32px", position: "relative" }}>
          <div className="g2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 56, alignItems: "start" }}>
            <div>
              <Eyebrow dark>// dns records</Eyebrow>
              <h2 style={{ fontFamily: P.font, fontSize: "clamp(1.8rem,3.5vw,48px)", fontWeight: 700, letterSpacing: -1.4, lineHeight: 1.02, color: "#fff", margin: "0 0 16px" }}>
                Exactly two records.<br/><span style={{ color: T.sky }}>That&apos;s it.</span>
              </h2>
              <p style={{ fontFamily: P.font, fontSize: 17, lineHeight: 1.55, color: "rgba(255,255,255,0.60)", margin: "0 0 28px", maxWidth: 480 }}>
                Add these two DNS records to your registrar. Your dashboard will give you the exact values — the IP address and CNAME are specific to your Vercel project.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  ["Record 1 — A record",    "Points your root domain (@) to Vercel"],
                  ["Record 2 — CNAME record","Points www to Vercel's CNAME"],
                  ["Propagation time",       "Usually 15–30 minutes"],
                  ["SSL certificate",        "Issued automatically by Vercel"],
                ].map(([t, s]) => (
                  <div key={t} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <div style={{ width: 18, height: 18, borderRadius: 9, background: "rgba(125,211,252,0.12)", border: "1px solid rgba(125,211,252,0.30)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                      <Check size={9} color={T.sky}/>
                    </div>
                    <div>
                      <span style={{ fontFamily: P.font, fontSize: 13.5, fontWeight: 600, color: "#fff" }}>{t} </span>
                      <span style={{ fontFamily: P.font, fontSize: 13.5, color: "rgba(255,255,255,0.50)" }}>— {s}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* A record */}
              <div style={{ borderRadius: 14, overflow: "hidden", border: `1px solid ${T.line}` }}>
                <div style={{ padding: "10px 16px", background: T.bg2, borderBottom: `1px solid ${T.line}`, fontFamily: P.mono, fontSize: 11, fontWeight: 700, color: T.muted, textTransform: "uppercase" as const, letterSpacing: 0.6, display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ color: T.amber }}>Record 1</span>
                  <span>— A record (root domain)</span>
                </div>
                <div style={{ padding: "16px", background: T.bg }}>
                  {[["type", T.amber, "A"], ["name", "#fff", "@  (or leave blank)"], ["value", T.sky, "76.76.21.21"], ["ttl", "#fff", "3600  (or Auto)"]].map(([k, c, v]) => (
                    <div key={k as string} style={{ display: "flex", justifyContent: "space-between", fontFamily: P.mono, fontSize: 12, lineHeight: 1.9 }}>
                      <span style={{ color: T.muted, width: 60 }}>{k}</span>
                      <span style={{ color: c as string }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* CNAME record */}
              <div style={{ borderRadius: 14, overflow: "hidden", border: `1px solid ${T.line}` }}>
                <div style={{ padding: "10px 16px", background: T.bg2, borderBottom: `1px solid ${T.line}`, fontFamily: P.mono, fontSize: 11, fontWeight: 700, color: T.muted, textTransform: "uppercase" as const, letterSpacing: 0.6, display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ color: T.plum }}>Record 2</span>
                  <span>— CNAME record (www)</span>
                </div>
                <div style={{ padding: "16px", background: T.bg }}>
                  {[["type", T.plum, "CNAME"], ["name", "#fff", "www"], ["value", T.sky, "cname.vercel-dns.com"], ["ttl", "#fff", "3600  (or Auto)"]].map(([k, c, v]) => (
                    <div key={k as string} style={{ display: "flex", justifyContent: "space-between", fontFamily: P.mono, fontSize: 12, lineHeight: 1.9 }}>
                      <span style={{ color: T.muted, width: 60 }}>{k}</span>
                      <span style={{ color: c as string }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ padding: "12px 16px", borderRadius: 10, background: "rgba(74,222,128,0.06)", border: "1px solid rgba(74,222,128,0.20)", fontFamily: P.mono, fontSize: 12, color: T.green, display: "flex", alignItems: "center", gap: 8 }}>
                <Check size={11} color={T.green}/> After 15–30 min: domain live + SSL issued
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── REGISTRARS ── */}
      <section className="pp" style={{ padding: "104px 32px", maxWidth: 1200, margin: "0 auto" }}>
        <Eyebrow>// compatible registrars</Eyebrow>
        <h2 style={{ fontFamily: P.font, fontSize: "clamp(1.8rem,3vw,48px)", fontWeight: 700, letterSpacing: -1.4, lineHeight: 1.02, color: P.ink, margin: "0 0 12px" }}>
          Works with any registrar.
        </h2>
        <p style={{ fontFamily: P.font, fontSize: 18, lineHeight: 1.5, color: P.muted, margin: "0 0 48px", maxWidth: 560 }}>
          As long as your registrar lets you edit DNS records (they all do), you can connect your domain. Here are the most common ones:
        </p>
        <div className="g4" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
          {REGISTRARS.map(r => (
            <div key={r.name} style={{ padding: "20px 18px", borderRadius: 12, background: "#fff", border: `1px solid ${P.line}` }}>
              <div style={{ fontFamily: P.font, fontSize: 16, fontWeight: 700, color: P.ink, marginBottom: 6 }}>{r.name}</div>
              <div style={{ fontFamily: P.font, fontSize: 13, color: P.muted, lineHeight: 1.4 }}>{r.note}</div>
            </div>
          ))}
        </div>
        <p style={{ marginTop: 20, fontFamily: P.font, fontSize: 14, color: P.muted }}>
          Not seeing yours? Any registrar with DNS management works the same way.
        </p>
      </section>

      {/* ── FAQ ── */}
      <section style={{ background: P.bg2, borderTop: `1px solid ${P.line}`, padding: "104px 0" }}>
        <div className="pp" style={{ maxWidth: 920, margin: "0 auto", padding: "0 32px" }}>
          <Eyebrow>// domain questions</Eyebrow>
          <h2 style={{ fontFamily: P.font, fontSize: "clamp(1.8rem,3vw,48px)", fontWeight: 700, letterSpacing: -1.4, lineHeight: 1.02, color: P.ink, margin: "0 0 40px" }}>
            Common domain questions.
          </h2>
          <div style={{ borderTop: `1px solid ${P.line}` }}>
            {DOMAIN_FAQ.map(([q, a], i) => (
              <div key={q} style={{ borderBottom: `1px solid ${P.line}` }}>
                <button
                  onClick={() => setOpen(open === i ? -1 : i)}
                  style={{ width: "100%", padding: "20px 0", display: "flex", alignItems: "center", justifyContent: "space-between", background: "none", border: "none", cursor: "pointer", textAlign: "left" as const, fontFamily: P.font, fontSize: 17, fontWeight: 600, color: P.ink, letterSpacing: -0.2 }}
                >
                  {q}
                  <span style={{ width: 30, height: 30, borderRadius: 15, background: open === i ? P.ink : "#fff", color: open === i ? "#fff" : P.ink, display: "flex", alignItems: "center", justifyContent: "center", transition: "all .2s", flexShrink: 0, marginLeft: 16, border: `1px solid ${P.line}` }}>
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
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ background: T.bg, padding: "120px 32px", position: "relative", overflow: "hidden", textAlign: "center" as const }}>
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", backgroundImage: `radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)`, backgroundSize: "18px 18px" }}/>
        <div style={{ position: "absolute", top: -200, left: "50%", transform: "translateX(-50%)", width: 900, height: 900, borderRadius: 450, background: "radial-gradient(circle,rgba(255,90,31,0.22),rgba(255,90,31,0) 60%)", filter: "blur(20px)", pointerEvents: "none" }}/>
        <div style={{ maxWidth: 720, margin: "0 auto", position: "relative" }}>
          <Eyebrow dark>// get started</Eyebrow>
          <h2 style={{ fontFamily: P.font, fontSize: "clamp(2.2rem,4.5vw,64px)", fontWeight: 700, letterSpacing: -2.5, lineHeight: 0.98, color: "#fff", margin: "0 0 20px" }}>
            Your site first.<br/><span style={{ color: T.six }}>Domain when you&apos;re ready.</span>
          </h2>
          <p style={{ fontFamily: P.font, fontSize: 18, lineHeight: 1.5, color: "rgba(255,255,255,0.55)", margin: "0 auto 32px", maxWidth: 480 }}>
            Start with a free Vercel URL. Connect your domain later — no rush.
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
