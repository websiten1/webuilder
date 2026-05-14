"use client";
import SiteNav from "@/app/components/SiteNav";
import SiteFooter from "@/app/components/SiteFooter";
import { PageHero, FinalCTA, Section, Container, Eyebrow, H2, Lead, Btn, ArrowR, Check, XIcon, PLANS, PlanCard } from "@/app/components/ui";
import { P, T } from "@/lib/design";

const CHANGE_DOES = [
  "Updating text or copy",
  "Changing colors or fonts",
  "Replacing or reordering sections",
  "Adding a new service or page",
  "Adjusting layout details",
  "Updating contact information",
  "Reworking design direction",
];

const CHANGE_DOESNT = [
  "Custom backend systems",
  "Complex booking systems",
  "E-commerce checkout flows",
  "Custom third-party integrations",
  "Manual developer work beyond AI generation",
  "Logo design or copywriting strategy",
  "Domain purchase cost",
];

export default function PricingPage() {
  return (
    <>
      <style>{`*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}html{overflow-x:hidden;scroll-behavior:smooth}body{background:${P.bg};color:${P.ink};font-family:${P.font};overflow-x:hidden}a{text-decoration:none;color:inherit}@media(max-width:900px){.pricing-cards{grid-template-columns:1fr!important}.change-grid{grid-template-columns:1fr!important}.pp{padding-left:20px!important;padding-right:20px!important}}`}</style>

      <SiteNav/>

      <PageHero
        dark
        eyebrow="// no monthly rent"
        title={<>Transparent pricing.<br/><span style={{ color: T.green }}>No website subscriptions.</span></>}
        sub="Professional websites from €49.99. One-time payment. Full ownership. No subscriptions. Custom domains are purchased separately and usually cost €12–30/year."
      />

      {/* Plan cards */}
      <Section paddingY={64}>
        <Container>
          <div className="pricing-cards" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20, alignItems: "stretch" }}>
            {PLANS.map(p => <PlanCard key={p.id} plan={p}/>)}
          </div>
        </Container>
      </Section>

      {/* What counts as a change */}
      <Section paddingY={88} style={{ background: P.bg2 }}>
        <Container>
          <Eyebrow>// edits</Eyebrow>
          <H2>What counts as a change?</H2>
          <Lead>The short answer: most copy, design, and layout tweaks. Custom backends are out of scope.</Lead>

          <div className="change-grid" style={{ marginTop: 40, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div style={{ padding: 28, borderRadius: 16, background: "#fff", border: `1px solid ${P.line}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <div style={{ width: 28, height: 28, borderRadius: 14, background: P.emSoft, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Check size={13} color={P.em2}/>
                </div>
                <span style={{ fontFamily: P.font, fontSize: 17, fontWeight: 700, color: P.ink }}>A change is…</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {CHANGE_DOES.map(s => (
                  <div key={s} style={{ display: "flex", gap: 10, fontFamily: P.font, fontSize: 14.5, color: P.inkSoft }}>
                    <Check size={11} color={P.em2}/>{s}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ padding: 28, borderRadius: 16, background: "#fff", border: `1px solid ${P.line}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <div style={{ width: 28, height: 28, borderRadius: 14, background: P.sixSoft, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <XIcon size={13}/>
                </div>
                <span style={{ fontFamily: P.font, fontSize: 17, fontWeight: 700, color: P.ink }}>A change isn&apos;t…</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {CHANGE_DOESNT.map(s => (
                  <div key={s} style={{ display: "flex", gap: 10, fontFamily: P.font, fontSize: 14.5, color: P.inkSoft }}>
                    <XIcon size={11}/>{s}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* Refund */}
      <Section paddingY={88}>
        <Container max={900}>
          <Eyebrow>// refunds</Eyebrow>
          <H2 size={36}>If generation fails,<br/><span style={{ color: P.muted }}>you don&apos;t pay.</span></H2>
          <div style={{ marginTop: 24, padding: 28, borderRadius: 16, background: P.bg2, border: `1px solid ${P.line}` }}>
            <div style={{ fontFamily: P.font, fontSize: 16, color: P.inkSoft, lineHeight: 1.6, marginBottom: 14 }}>
              Because generation starts immediately after payment and produces a digital website, payments are generally non-refundable once generation begins. If generation fails and no website is delivered, contact support and we&apos;ll refund or retry.
            </div>
            <Btn variant="ghost" href="mailto:support@insixlive.com" size="sm">
              Contact support <ArrowR color={P.ink}/>
            </Btn>
          </div>
        </Container>
      </Section>

      <FinalCTA/>
      <SiteFooter/>
    </>
  );
}
