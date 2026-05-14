"use client";
import SiteNav from "@/app/components/SiteNav";
import SiteFooter from "@/app/components/SiteFooter";
import { PageHero, FinalCTA, Section, Container, TechWindow, CodeStream, PLANS } from "@/app/components/ui";
import { T, P } from "@/lib/design";

const HOW_DETAIL = [
  { n: "01", t: "Create your account",    d: "Sign up with email and password. Verify your email. Access your dashboard.", mock: "account" },
  { n: "02", t: "Connect Vercel",         d: "Authorize insixlive to deploy into your Vercel account. Your website will belong to your workspace.", mock: "vercel" },
  { n: "03", t: "Describe your business", d: "Business name, services, audience, location, contact info, tone, goals.", mock: "describe" },
  { n: "04", t: "Choose the look",        d: "Visual style, colors, typography, page structure, features.", mock: "style" },
  { n: "05", t: "Choose your plan",       d: "Basic, Pro, or Premium. One-time payment through Stripe.", mock: "plan" },
  { n: "06", t: "AI generates your site", d: "Claude writes the code. The site is built with Next.js and Tailwind.", mock: "generate" },
  { n: "07", t: "Deployment",             d: "Pushed to your Vercel account. You receive a live .vercel.app URL.", mock: "deploy" },
  { n: "08", t: "Add a custom domain",    d: "Connect a domain you already own, or buy one separately. SSL configured automatically.", mock: "domain" },
  { n: "09", t: "Request changes later",  d: "Edit through your dashboard. Free or paid edits depend on your plan.", mock: "edits" },
];

function HowMock({ kind }: { kind: string }) {
  switch (kind) {
    case "account":
      return (
        <TechWindow title="signup" height={210}>
          <div style={{ padding: 20, fontFamily: P.mono, fontSize: 12, color: T.text, lineHeight: 1.8 }}>
            <div><span style={{ color: T.muted }}>email</span>{"  "}<span style={{ color: T.green }}>maria@hair.studio</span></div>
            <div><span style={{ color: T.muted }}>verified</span>{" "}<span style={{ color: T.green }}>✓</span></div>
            <div style={{ marginTop: 10, padding: 8, background: "rgba(74,222,128,0.06)", borderRadius: 6, color: T.green }}>account ready</div>
          </div>
        </TechWindow>
      );
    case "vercel":
      return (
        <TechWindow title="oauth" height={210}>
          <div style={{ padding: 18 }}>
            <div style={{ fontFamily: P.mono, fontSize: 11, color: T.muted, marginBottom: 10 }}>OAUTH · vercel</div>
            <div style={{ padding: 12, borderRadius: 8, background: "rgba(255,255,255,0.04)", border: `1px solid ${T.line}`, marginBottom: 10 }}>
              <div style={{ fontFamily: P.mono, fontSize: 13, color: "#fff" }}>scope: deploy projects</div>
              <div style={{ fontFamily: P.mono, fontSize: 11, color: T.muted, marginTop: 4 }}>read · write · cancel anytime</div>
            </div>
            <button style={{ width: "100%", height: 36, borderRadius: 8, background: "rgba(255,255,255,0.05)", color: "#fff", border: "1px solid rgba(255,255,255,0.10)", fontFamily: P.font, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Authorize</button>
          </div>
        </TechWindow>
      );
    case "describe":
      return <TechWindow title="brief.md" height={210}><CodeStream count={6} hi={3} caret={false}/></TechWindow>;
    case "style":
      return (
        <TechWindow title="style.json" height={210}>
          <div style={{ padding: 18, display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
            {[["Light","#fff","#0A0E14"],["Dark",T.bg2,"#fff"],["Bold",T.six,"#fff"]].map(([n, bg, c]) => (
              <div key={n} style={{ padding: 18, borderRadius: 8, background: bg as string, border: `1px solid ${T.line}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: P.font, fontSize: 13, fontWeight: 600, color: c as string }}>{n}</div>
            ))}
          </div>
        </TechWindow>
      );
    case "plan":
      return (
        <TechWindow title="pricing" height={210}>
          <div style={{ padding: 18 }}>
            {PLANS.map(p => (
              <div key={p.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderRadius: 8, marginBottom: 6, background: p.badge ? "rgba(255,90,31,0.08)" : "rgba(255,255,255,0.03)", border: `1px solid ${p.badge ? "rgba(255,90,31,0.30)" : T.line}` }}>
                <span style={{ fontFamily: P.mono, fontSize: 12, color: "#fff", fontWeight: 600 }}>{p.name}</span>
                <span style={{ fontFamily: P.mono, fontSize: 13, color: p.badge ? T.six : T.text, fontWeight: 700 }}>€{p.price.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </TechWindow>
      );
    case "generate":
      return (
        <TechWindow title="job#fz-3a1c" height={210}>
          <div style={{ padding: "12px 16px", fontFamily: P.mono, fontSize: 11.5, lineHeight: "20px" }}>
            {[["LLM",T.plum,"claude-sonnet · 4192 tok"],["gen",T.plum,"app/page.tsx"],["gen",T.plum,"components/Hero.tsx"],["css",T.sky,"tailwind · #FF5A1F"],["ok",T.green,"4 pages generated"]].map(([k,c,v],i) => (
              <div key={i} style={{ display: "flex", gap: 10 }}>
                <span style={{ color: c as string, fontWeight: 700, width: 36 }}>{k}</span>
                <span style={{ color: T.text }}>{v}</span>
              </div>
            ))}
          </div>
        </TechWindow>
      );
    case "deploy":
      return (
        <TechWindow title="deploy log" height={210}>
          <div style={{ padding: 18, color: T.text }}>
            <div style={{ fontFamily: P.mono, fontSize: 11, color: T.muted, marginBottom: 6 }}>VERCEL · DEPLOY</div>
            <div style={{ fontFamily: P.mono, fontSize: 16, color: T.green, marginBottom: 14 }}>● ready</div>
            <div style={{ fontFamily: P.mono, fontSize: 12 }}>acme-plumbing<span style={{ color: T.muted }}>.vercel.app</span></div>
            <div style={{ marginTop: 12, height: 6, background: "rgba(255,255,255,0.05)", borderRadius: 3, overflow: "hidden" }}>
              <div style={{ width: "100%", height: "100%", background: `linear-gradient(90deg,${T.green},${T.sky})` }}/>
            </div>
          </div>
        </TechWindow>
      );
    case "domain":
      return (
        <TechWindow title="DNS" height={210}>
          <div style={{ padding: 18, fontFamily: P.mono, fontSize: 12, lineHeight: 1.8 }}>
            <div><span style={{ color: T.muted }}>type</span>{"  "}<span style={{ color: T.amber }}>A</span></div>
            <div><span style={{ color: T.muted }}>name</span>{"  @"}</div>
            <div><span style={{ color: T.muted }}>value</span>{" "}<span style={{ color: T.sky }}>76.76.21.21</span></div>
            <div style={{ marginTop: 10, color: T.green }}>✓ SSL · acme-plumbing.de</div>
          </div>
        </TechWindow>
      );
    case "edits":
      return (
        <TechWindow title="edit · req" height={210}>
          <div style={{ padding: 18, fontFamily: P.mono, fontSize: 12, lineHeight: 1.8 }}>
            <div style={{ color: T.text }}>&quot;Update hours to 7am–9pm&quot;</div>
            <div style={{ color: T.muted, marginTop: 4 }}>↳ queued · pro plan · 1/5 free edits used</div>
            <div style={{ marginTop: 14, padding: 8, background: "rgba(74,222,128,0.06)", borderRadius: 6, color: T.green }}>deployed in 38s</div>
          </div>
        </TechWindow>
      );
    default: return null;
  }
}

export default function HowItWorksPage() {
  return (
    <>
      <style>{`*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}html{overflow-x:hidden;scroll-behavior:smooth}body{background:${P.bg};color:${P.ink};font-family:${P.font};overflow-x:hidden}a{text-decoration:none;color:inherit}@keyframes caret{0%,50%{opacity:1}50.01%,100%{opacity:0}}@media(max-width:900px){.step-grid{grid-template-columns:1fr!important}.pp{padding-left:20px!important;padding-right:20px!important}}`}</style>

      <SiteNav/>

      <PageHero
        eyebrow="// the flow"
        title={<>From business idea<br/><span style={{ color: P.six }}>to live website in minutes.</span></>}
        sub="Answer a few questions, choose a style, pay once, and your website is generated and deployed to your own Vercel account."
      />

      <Section paddingY={48} style={{ background: P.bg2 }}>
        <Container>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {HOW_DETAIL.map((s, i) => (
              <div key={s.n} className="step-grid" style={{
                display: "grid",
                gridTemplateColumns: i % 2 === 0 ? "0.9fr 1.1fr" : "1.1fr 0.9fr",
                gap: 32, alignItems: "center",
                padding: 28, borderRadius: 18, background: "#fff", border: `1px solid ${P.line}`,
              }}>
                <div style={{ order: i % 2 === 0 ? 0 : 1 }}>
                  <div style={{ fontFamily: P.mono, fontSize: 11, fontWeight: 700, color: P.six, letterSpacing: 1, marginBottom: 12 }}>STEP {s.n}</div>
                  <div style={{ fontFamily: P.font, fontSize: 30, fontWeight: 700, color: P.ink, letterSpacing: -0.8, marginBottom: 10 }}>{s.t}</div>
                  <div style={{ fontFamily: P.font, fontSize: 15.5, color: P.muted, lineHeight: 1.5 }}>{s.d}</div>
                </div>
                <div style={{ order: i % 2 === 0 ? 1 : 0 }}>
                  <HowMock kind={s.mock}/>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      <FinalCTA/>
      <SiteFooter/>
    </>
  );
}
