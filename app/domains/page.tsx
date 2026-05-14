"use client";
import SiteNav from "@/app/components/SiteNav";
import SiteFooter from "@/app/components/SiteFooter";
import { PageHero, FinalCTA, Section, Container, Eyebrow, H2, Lead, Check, TechBadge, DotGrid } from "@/app/components/ui";
import { P, T } from "@/lib/design";

export default function DomainsPage() {
  return (
    <>
      <style>{`*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}html{overflow-x:hidden;scroll-behavior:smooth}body{background:${P.bg};color:${P.ink};font-family:${P.font};overflow-x:hidden}a{text-decoration:none;color:inherit}@media(max-width:900px){.opts-grid{grid-template-columns:1fr!important}.pp{padding-left:20px!important;padding-right:20px!important}}`}</style>

      <SiteNav/>

      <PageHero
        dark
        eyebrow="// domains"
        title={<>Your website<br/><span style={{ color: T.green }}>deserves a real domain.</span></>}
        sub="Start with a Vercel URL. Then connect a custom domain like yourbusiness.com — one you already own, or one you buy."
      />

      {/* Two options */}
      <Section paddingY={88}>
        <Container>
          <div className="opts-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>

            {/* Option 1 — connect existing */}
            <div style={{ padding: 32, borderRadius: 18, background: "#fff", border: `1px solid ${P.line}` }}>
              <TechBadge color={T.six}>Option 1</TechBadge>
              <H2 size={26} style={{ marginTop: 16 }}>Connect a domain you already own</H2>
              <p style={{ fontFamily: P.font, fontSize: 14.5, color: P.muted, lineHeight: 1.5, marginBottom: 18 }}>
                Works with GoDaddy, Namecheap, Porkbun, Cloudflare, and most other registrars. Copy two DNS records, paste them in, wait a few minutes.
              </p>
              <div style={{ padding: 16, borderRadius: 10, background: T.bg, fontFamily: P.mono, fontSize: 12, color: T.text, lineHeight: 1.7 }}>
                <div style={{ color: T.muted, marginBottom: 4 }}># A record</div>
                <div>@ → <span style={{ color: T.sky }}>76.76.21.21</span></div>
                <div style={{ color: T.muted, marginTop: 10, marginBottom: 4 }}># CNAME</div>
                <div>www → <span style={{ color: T.sky }}>cname.vercel-dns.com</span></div>
              </div>
            </div>

            {/* Option 2 — buy new */}
            <div style={{ padding: 32, borderRadius: 18, background: T.bg, color: "#fff", position: "relative", overflow: "hidden" }}>
              <DotGrid opacity={0.04}/>
              <div style={{ position: "absolute", top: -80, right: -60, width: 240, height: 240, borderRadius: 120, background: "radial-gradient(circle,rgba(74,222,128,0.20),rgba(74,222,128,0) 65%)", filter: "blur(15px)", pointerEvents: "none" }}/>
              <div style={{ position: "relative" }}>
                <TechBadge color={T.green}>Option 2</TechBadge>
                <H2 size={26} dark style={{ marginTop: 16 }}>Buy a new domain</H2>
                <p style={{ fontFamily: P.font, fontSize: 14.5, color: "rgba(255,255,255,0.55)", lineHeight: 1.5, marginBottom: 18 }}>
                  Most domains cost €12–30/year. You buy from any registrar — the domain belongs to you. insixlive does not bundle domain cost.
                </p>
                <div style={{ padding: 16, borderRadius: 10, background: "rgba(255,255,255,0.04)", border: `1px solid ${T.line}`, fontFamily: P.mono, fontSize: 12, lineHeight: 1.7 }}>
                  <div style={{ color: T.muted, marginBottom: 4 }}># typical pricing</div>
                  {[[".com","€10–18/yr"],[".de / .fr","€8–15/yr"],[".studio / .agency","€20–35/yr"]].map(([ext, price]) => (
                    <div key={ext} style={{ display: "flex", justifyContent: "space-between" }}>
                      <span>{ext}</span><span style={{ color: T.amber }}>{price}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* HTTPS automatic */}
      <Section paddingY={88} style={{ background: P.bg2 }}>
        <Container max={900}>
          <Eyebrow>// what happens</Eyebrow>
          <H2 size={36}>Secure HTTPS is automatic.</H2>
          <Lead>Once your DNS resolves correctly, Vercel issues an SSL certificate automatically. No certificates to install, no renewal to track.</Lead>

          <div style={{ marginTop: 32, padding: 28, borderRadius: 14, background: "#fff", border: `1px solid ${P.line}` }}>
            {[
              ["DNS propagates",      "A few minutes to a few hours · varies by registrar"],
              ["SSL is issued",       "Automatic via Vercel · Let's Encrypt"],
              ["HTTPS is enforced",   "http traffic is redirected to https"],
              ["Subdomains work too", "www, blog, shop — point as many as you want"],
            ].map(([t, s]) => (
              <div key={t} style={{ display: "flex", gap: 12, padding: "12px 0", borderBottom: `1px solid ${P.line}` }}>
                <div style={{ width: 22, height: 22, borderRadius: 11, background: P.emSoft, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                  <Check size={11}/>
                </div>
                <div>
                  <div style={{ fontFamily: P.font, fontSize: 15, fontWeight: 600, color: P.ink }}>{t}</div>
                  <div style={{ fontFamily: P.font, fontSize: 13.5, color: P.muted }}>{s}</div>
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
