import SiteNav from "@/app/components/SiteNav";
import SiteFooter from "@/app/components/SiteFooter";
import { P } from "@/lib/design";

export const metadata = {
  title: "Terms of Use — insixlive",
  description: "Terms and conditions for using the insixlive website generation service.",
};

const S = {
  page: { background: P.bg, color: P.ink, fontFamily: P.font, minHeight: "100vh" } as React.CSSProperties,
  hero: { background: P.ink, padding: "72px 24px 64px", textAlign: "center" as const },
  heroEye: { fontFamily: P.mono, fontSize: 12, letterSpacing: 2, color: "rgba(255,255,255,0.4)", textTransform: "uppercase" as const, marginBottom: 14 },
  heroTitle: { fontFamily: P.font, fontSize: "clamp(2rem,5vw,3rem)", fontWeight: 700, color: "#fff", letterSpacing: -1, lineHeight: 1.1, margin: 0 },
  body: { maxWidth: 780, margin: "0 auto", padding: "64px 24px 80px" },
  updated: { fontFamily: P.mono, fontSize: 12, color: P.muted, marginBottom: 48, letterSpacing: 0.3 },
  h2: { fontFamily: P.font, fontSize: 22, fontWeight: 700, color: P.ink, marginTop: 48, marginBottom: 12, letterSpacing: -0.4 },
  p: { fontFamily: P.font, fontSize: 16, lineHeight: 1.75, color: P.inkSoft, marginBottom: 16 },
  ul: { paddingLeft: 20, marginBottom: 16 },
  li: { fontFamily: P.font, fontSize: 16, lineHeight: 1.75, color: P.inkSoft, marginBottom: 8 },
  link: { color: P.em2, textDecoration: "underline" },
  callout: { background: "rgba(255,90,31,0.06)", border: "1px solid rgba(255,90,31,0.2)", borderRadius: 10, padding: "16px 20px", marginBottom: 24 },
  calloutText: { fontFamily: P.font, fontSize: 15, lineHeight: 1.65, color: P.ink, fontWeight: 500 },
};

export default function TermsPage() {
  return (
    <div style={S.page}>
      <style>{`*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}html{overflow-x:hidden}body{overflow-x:hidden}`}</style>
      <SiteNav />

      <div style={S.hero}>
        <p style={S.heroEye}>// legal</p>
        <h1 style={S.heroTitle}>Terms of Use</h1>
      </div>

      <div style={S.body}>
        <p style={S.updated}>Last updated: 12 June 2026</p>

        <div style={S.callout}>
          <p style={{ ...S.calloutText, margin: 0 }}>
            By accessing or using the insixlive website generation service you agree to these Terms of Use in full. If you do not agree, do not use the service.
          </p>
        </div>

        <h2 style={S.h2}>1. The service</h2>
        <p style={S.p}>
          insixlive provides an AI-powered website generation and deployment service (&quot;the Service&quot;). You provide business information through our wizard; we generate a website using AI and deploy it to your connected Vercel account. The Service is offered on a one-time payment basis with no ongoing subscription.
        </p>

        <h2 style={S.h2}>2. Eligibility</h2>
        <p style={S.p}>You must be at least 18 years old to use this Service. By using the Service you represent that you are 18 or older and have the legal capacity to enter into these Terms.</p>

        <h2 style={S.h2}>3. Account and security</h2>
        <ul style={S.ul}>
          <li style={S.li}>You are responsible for maintaining the confidentiality of your account credentials.</li>
          <li style={S.li}>You are responsible for all activity that occurs under your account.</li>
          <li style={S.li}>You must notify us immediately if you suspect unauthorised use of your account.</li>
        </ul>

        <h2 style={S.h2}>4. Important limitations — please read carefully</h2>
        <div style={S.callout}>
          <p style={{ ...S.calloutText, margin: "0 0 10px" }}>The following limitations are fundamental to how the Service works:</p>
          <ul style={{ ...S.ul, marginBottom: 0 }}>
            <li style={S.li}><strong>No online shop or booking system.</strong> Generated websites are informational websites only. They cannot process online payments, sell products directly, or manage bookings or appointments. Visitors are directed to contact you by phone or email.</li>
            <li style={S.li}><strong>Websites cannot be edited after generation.</strong> Once your website has been generated and deployed, the content cannot be edited or modified through insixlive. If you need changes, you must regenerate a new version (which is a new purchase).</li>
            <li style={S.li}><strong>No refunds once generation has started.</strong> Because website generation begins immediately after payment and produces a unique digital deliverable, all payments are non-refundable once the generation process has started. If generation fails entirely and no website is delivered, please contact support — we will refund or retry at our discretion.</li>
          </ul>
        </div>

        <h2 style={S.h2}>5. Payment</h2>
        <ul style={S.ul}>
          <li style={S.li}>Payment is processed securely through Stripe. We do not store card details.</li>
          <li style={S.li}>All prices are shown inclusive of applicable taxes where required by law.</li>
          <li style={S.li}>You authorise us to charge the displayed amount for the selected service.</li>
          <li style={S.li}>As stated in §4, payments are non-refundable once generation has started.</li>
        </ul>

        <h2 style={S.h2}>6. Vercel account requirement</h2>
        <p style={S.p}>
          To deploy your generated website you must connect a Vercel account. You must connect your Vercel account before beginning the website generation wizard. You are responsible for your Vercel account, including any costs associated with hosting and custom domains on Vercel. We are not affiliated with Vercel Inc.
        </p>

        <h2 style={S.h2}>7. Your content and ownership</h2>
        <ul style={S.ul}>
          <li style={S.li}>You retain full ownership of the business information you provide and any images you upload.</li>
          <li style={S.li}>Once generated, the website code and content belong to you. You may download, host, modify, or delete it at any time.</li>
          <li style={S.li}>You grant us a limited, non-exclusive licence to use your inputs solely to generate your website.</li>
          <li style={S.li}>You warrant that your inputs do not infringe any third-party rights and do not contain unlawful content.</li>
        </ul>

        <h2 style={S.h2}>8. Acceptable use</h2>
        <p style={S.p}>You may not use the Service to generate websites that:</p>
        <ul style={S.ul}>
          <li style={S.li}>Promote illegal activities or content prohibited by applicable law.</li>
          <li style={S.li}>Infringe the intellectual property rights of any third party.</li>
          <li style={S.li}>Contain hate speech, harassment, or sexually explicit material.</li>
          <li style={S.li}>Constitute spam, phishing, or other deceptive content.</li>
          <li style={S.li}>Impersonate another business or individual.</li>
        </ul>
        <p style={S.p}>We reserve the right to refuse service or terminate accounts that violate these restrictions.</p>

        <h2 style={S.h2}>9. Disclaimer of warranties</h2>
        <p style={S.p}>
          The Service is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind, whether express or implied. We do not warrant that the Service will be uninterrupted, error-free, or that AI-generated content will be accurate, complete, or fit for any particular purpose. You are responsible for reviewing and approving the generated website before publishing it.
        </p>

        <h2 style={S.h2}>10. Limitation of liability</h2>
        <p style={S.p}>
          To the maximum extent permitted by applicable law, insixlive and its affiliates shall not be liable for any indirect, incidental, consequential, or punitive damages arising from your use of the Service. Our total aggregate liability to you for any claim arising out of these Terms or the Service shall not exceed the amount you paid us in the three months preceding the claim.
        </p>

        <h2 style={S.h2}>11. Intellectual property</h2>
        <p style={S.p}>
          The insixlive platform, branding, and software (excluding your generated website) are the intellectual property of insixlive and may not be copied, modified, or distributed without our written permission.
        </p>

        <h2 style={S.h2}>12. Governing law</h2>
        <p style={S.p}>
          These Terms are governed by and construed in accordance with the laws of Romania, without regard to conflict of law principles. Any disputes shall be subject to the exclusive jurisdiction of the courts of Romania. If you are a consumer in the EU, you may also bring proceedings before the courts of your country of residence.
        </p>

        <h2 style={S.h2}>13. Changes to these Terms</h2>
        <p style={S.p}>
          We may update these Terms from time to time. The &quot;Last updated&quot; date will reflect changes. Continued use of the Service after the effective date constitutes acceptance of the revised Terms. Material changes will be notified by email.
        </p>

        <h2 style={S.h2}>14. Contact</h2>
        <p style={S.p}>
          For any questions about these Terms: <a href="mailto:support@insixlive.com" style={S.link}>support@insixlive.com</a>
        </p>
      </div>

      <SiteFooter />
    </div>
  );
}
