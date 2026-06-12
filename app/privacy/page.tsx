import SiteNav from "@/app/components/SiteNav";
import SiteFooter from "@/app/components/SiteFooter";
import { P } from "@/lib/design";

export const metadata = {
  title: "Privacy Policy — insixlive",
  description: "How insixlive collects, uses, and protects your personal data.",
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
};

export default function PrivacyPage() {
  return (
    <div style={S.page}>
      <style>{`*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}html{overflow-x:hidden}body{overflow-x:hidden}`}</style>
      <SiteNav />

      <div style={S.hero}>
        <p style={S.heroEye}>// legal</p>
        <h1 style={S.heroTitle}>Privacy Policy</h1>
      </div>

      <div style={S.body}>
        <p style={S.updated}>Last updated: 12 June 2026</p>

        <p style={S.p}>
          insixlive (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) operates the website insixlive.com and provides AI-powered website generation services. This Privacy Policy explains what personal data we collect, why we collect it, and your rights regarding that data. By using our service you agree to this policy.
        </p>

        <h2 style={S.h2}>1. Who we are</h2>
        <p style={S.p}>
          Data controller: insixlive, reachable at <a href="mailto:support@insixlive.com" style={S.link}>support@insixlive.com</a>. If you have any questions about this policy or your data, please contact us at that address.
        </p>

        <h2 style={S.h2}>2. Data we collect</h2>
        <p style={S.p}>We collect only what is necessary to provide the service:</p>
        <ul style={S.ul}>
          <li style={S.li}><strong>Account data</strong> — email address and hashed password when you create an account.</li>
          <li style={S.li}><strong>Payment data</strong> — payments are processed by Stripe. We receive a confirmation record (Stripe session ID and payment status) but never see or store card details.</li>
          <li style={S.li}><strong>Website generation inputs</strong> — the business information you enter in the form (business name, description, services, etc.) used solely to generate your website.</li>
          <li style={S.li}><strong>Vercel OAuth token</strong> — if you connect your Vercel account, we store an access token to deploy your site. This token is stored encrypted and never shared with third parties.</li>
          <li style={S.li}><strong>Usage logs</strong> — basic server logs (IP address, timestamp, route) retained for up to 30 days for security and debugging purposes.</li>
        </ul>
        <p style={S.p}>We do not collect, and our service is not directed to, children under the age of 13. If we become aware that a child under 13 has provided us personal data, we will delete it immediately. Parents or guardians who believe their child has provided us data should contact <a href="mailto:support@insixlive.com" style={S.link}>support@insixlive.com</a>.</p>

        <h2 style={S.h2}>3. Legal bases for processing (GDPR)</h2>
        <ul style={S.ul}>
          <li style={S.li}><strong>Contract performance</strong> — account management, site generation, and deployment.</li>
          <li style={S.li}><strong>Legitimate interests</strong> — security logging, fraud prevention.</li>
          <li style={S.li}><strong>Legal obligation</strong> — where required by applicable law.</li>
        </ul>

        <h2 style={S.h2}>4. How we use your data</h2>
        <ul style={S.ul}>
          <li style={S.li}>Authenticate your account and protect it against unauthorised access.</li>
          <li style={S.li}>Process your payment and generate your website.</li>
          <li style={S.li}>Deploy your generated website to your Vercel account.</li>
          <li style={S.li}>Send transactional emails (verification code, payment receipt) — no marketing emails unless you opt in explicitly.</li>
          <li style={S.li}>Improve the service and fix technical issues using anonymised analytics.</li>
        </ul>

        <h2 style={S.h2}>5. Data sharing and third parties</h2>
        <p style={S.p}>We use the following sub-processors to operate the service:</p>
        <ul style={S.ul}>
          <li style={S.li}><strong>Stripe</strong> — payment processing (PCI-DSS Level 1 certified).</li>
          <li style={S.li}><strong>Vercel</strong> — hosting of insixlive.com and deployment of your site.</li>
          <li style={S.li}><strong>Neon / PostgreSQL</strong> — encrypted database storage of account records.</li>
          <li style={S.li}><strong>OpenAI / AI providers</strong> — your business inputs are sent to generate website content. Inputs are not retained by the AI provider for training under our enterprise agreement.</li>
        </ul>
        <p style={S.p}>We do not sell your personal data. We do not share it with advertisers or data brokers.</p>

        <h2 style={S.h2}>6. Data retention</h2>
        <ul style={S.ul}>
          <li style={S.li}>Account data is retained for as long as your account exists. You may request deletion at any time (see §8).</li>
          <li style={S.li}>Generated website files are stored on your own Vercel account once deployed; we retain a copy for 30 days in case of regeneration requests, then delete it.</li>
          <li style={S.li}>Payment records are retained for 7 years to comply with financial regulations.</li>
          <li style={S.li}>Server logs are retained for 30 days.</li>
        </ul>

        <h2 style={S.h2}>7. Security</h2>
        <p style={S.p}>
          We use HTTPS/TLS for all data in transit. Passwords are hashed with bcrypt (never stored in plain text). Session tokens are short-lived (15-minute inactivity timeout) and stored as httpOnly cookies. Access to production systems is restricted to authorised personnel only. We will notify affected users within 72 hours of discovering a data breach as required by GDPR.
        </p>

        <h2 style={S.h2}>8. Your rights</h2>
        <p style={S.p}>Under GDPR and equivalent legislation you have the right to:</p>
        <ul style={S.ul}>
          <li style={S.li}><strong>Access</strong> — request a copy of the personal data we hold about you.</li>
          <li style={S.li}><strong>Rectification</strong> — ask us to correct inaccurate data.</li>
          <li style={S.li}><strong>Erasure</strong> — request deletion of your account and associated personal data (subject to legal retention obligations).</li>
          <li style={S.li}><strong>Portability</strong> — receive your data in a machine-readable format.</li>
          <li style={S.li}><strong>Restriction</strong> — ask us to pause processing in certain circumstances.</li>
          <li style={S.li}><strong>Objection</strong> — object to processing based on legitimate interests.</li>
          <li style={S.li}><strong>Withdraw consent</strong> — where processing is based on consent, you may withdraw it at any time.</li>
        </ul>
        <p style={S.p}>To exercise any of these rights, email <a href="mailto:support@insixlive.com" style={S.link}>support@insixlive.com</a>. We will respond within 30 days. You also have the right to lodge a complaint with your national data protection authority.</p>

        <h2 style={S.h2}>9. Cookies</h2>
        <p style={S.p}>
          We use one functional cookie (&quot;session&quot;) that is strictly necessary to keep you logged in. It is httpOnly, secure, and expires when you close your browser or after 15 minutes of inactivity. We do not use advertising or tracking cookies. Our cookie banner allows you to acknowledge this.
        </p>

        <h2 style={S.h2}>10. International transfers</h2>
        <p style={S.p}>
          Our service infrastructure is hosted primarily in the EU. If data is processed outside the EEA (e.g. by AI providers operating in the US), we ensure appropriate safeguards are in place via Standard Contractual Clauses (SCCs) or equivalent mechanisms.
        </p>

        <h2 style={S.h2}>11. Changes to this policy</h2>
        <p style={S.p}>
          We may update this policy from time to time. The &quot;Last updated&quot; date at the top will reflect any changes. For material changes, we will notify you via email. Continued use of the service after the effective date constitutes acceptance of the revised policy.
        </p>

        <h2 style={S.h2}>12. Contact</h2>
        <p style={S.p}>
          For any privacy-related questions or requests: <a href="mailto:support@insixlive.com" style={S.link}>support@insixlive.com</a>
        </p>
      </div>

      <SiteFooter />
    </div>
  );
}
