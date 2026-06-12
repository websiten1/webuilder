"use client";
import SiteNav from "@/app/components/SiteNav";
import SiteFooter from "@/app/components/SiteFooter";
import { PageHero, FinalCTA, Section, Container, Eyebrow, H2, Lead, Btn, ArrowR, Check, XIcon, PLANS, PlanCard } from "@/app/components/ui";
import { P, T } from "@/lib/design";

export default function PricingPage() {
  return (
    <>
      <style>{`*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}html{overflow-x:hidden;scroll-behavior:smooth}body{background:${P.bg};color:${P.ink};font-family:${P.font};overflow-x:hidden}a{text-decoration:none;color:inherit}@media(max-width:900px){.pricing-cards{grid-template-columns:1fr!important}.change-grid{grid-template-columns:1fr!important}.pp{padding-left:20px!important;padding-right:20px!important}}`}</style>

      <SiteNav/>

      <PageHero
        dark
        eyebrow="// no monthly rent"
        title={<>Transparent pricing.<br/><span style={{ color: T.green }}>No website subscriptions.</span></>}
        sub="€59.99. One-time payment. Full ownership. No subscriptions. Custom domains are purchased separately on Vercel (usually €12–30/year)."
      />

      {/* Plan cards */}
      <Section paddingY={64}>
        <Container>
          <div style={{ maxWidth: 440, margin: "0 auto" }}>
            {PLANS.map(p => <PlanCard key={p.id} plan={p}/>)}
          </div>
        </Container>
      </Section>

      {/* What's included */}
      <Section paddingY={88} style={{ background: P.bg2 }}>
        <Container max={760}>
          <Eyebrow>// what&apos;s included</Eyebrow>
          <H2>One price. Everything in it.</H2>
          <Lead>€59.99 covers the full generation and deployment. No hidden extras.</Lead>
          <div style={{ marginTop: 32, display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              ["AI-generated professional website, built with Next.js and Tailwind", true],
              ["Deployed directly to your own Vercel account", true],
              ["Full source code — download, edit, host anywhere", true],
              ["Mobile-responsive, SSL, fast — production-ready out of the box", true],
              ["Custom domain not included — purchase separately on Vercel (~€12–30/yr)", false],
            ].map(([text, ok], i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "14px 18px", borderRadius: 12, background: ok ? P.emSoft : P.bg2, border: `1px solid ${ok ? "rgba(0,144,98,0.25)" : P.line}`, fontFamily: P.font, fontSize: 15, color: ok ? P.ink : P.muted }}>
                <div style={{ width: 20, height: 20, borderRadius: 10, background: ok ? P.emSoft : "rgba(0,0,0,0.04)", border: `1px solid ${ok ? "rgba(0,144,98,0.25)" : P.line}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                  {ok ? <Check size={11} color={P.em2}/> : <XIcon size={11}/>}
                </div>
                {text as string}
              </div>
            ))}
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
