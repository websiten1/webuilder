import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "inSIXlive — Privacy Policy",
  description: "How inSIXlive collects, uses, and protects your personal data.",
};

type Lang = "en" | "ro";

const COPY = {
  en: {
    title: "Privacy Policy",
    updated: "Last updated: June 21, 2026",
    tocTitle: "Contents",
    sections: [
      { id: "info", title: "Information we collect" },
      { id: "use", title: "How we use it" },
      { id: "sharing", title: "Sharing & disclosure" },
      { id: "cookies", title: "Cookies" },
      { id: "security", title: "Data security" },
      { id: "rights", title: "Your rights" },
      { id: "retention", title: "Data retention" },
      { id: "contact", title: "Contact us" },
    ],
    body: {
      info: (
        <>
          <p>When you create an account and build a website with inSIXlive, we collect information you provide directly to us, including:</p>
          <ul>
            <li>Account details such as your name and email address.</li>
            <li>Content you add to your website — text, images, and settings.</li>
            <li>Usage data, such as the pages you edit and features you use.</li>
            <li>Technical data including your browser type, device, and IP address.</li>
          </ul>
        </>
      ),
      use: <p>We use your information to operate, maintain, and improve inSIXlive, to publish and host your website, to communicate with you about your account, and to keep our platform safe and secure.</p>,
      sharing: <p>We do not sell your personal data. We share information only with trusted service providers who help us run the platform (such as hosting and email delivery), or when required by law.</p>,
      cookies: <p>We use cookies and similar technologies to keep you signed in, remember your preferences, and understand how the platform is used. You can control cookies through your browser settings.</p>,
      security: <p>We use industry-standard measures to protect your data, including encryption in transit. No method of transmission is completely secure, but we work hard to safeguard your information.</p>,
      rights: <p>You have the right to access, correct, export, or delete your personal data at any time. To exercise these rights, contact us using the details below.</p>,
      retention: <p>We keep your information for as long as your account is active or as needed to provide our services. When you delete your account, we remove your personal data within a reasonable period, except where retention is required by law.</p>,
      contact: <p>If you have any questions about this Privacy Policy, reach our team at <a className="inline" href="mailto:insixlive@outlook.com">insixlive@outlook.com</a>.</p>,
    },
  },
  ro: {
    title: "Politica de confidențialitate",
    updated: "Ultima actualizare: 21 iunie 2026",
    tocTitle: "Cuprins",
    sections: [
      { id: "info", title: "Informațiile pe care le colectăm" },
      { id: "use", title: "Cum le folosim" },
      { id: "sharing", title: "Partajare și divulgare" },
      { id: "cookies", title: "Cookie-uri" },
      { id: "security", title: "Securitatea datelor" },
      { id: "rights", title: "Drepturile tale" },
      { id: "retention", title: "Păstrarea datelor" },
      { id: "contact", title: "Contactează-ne" },
    ],
    body: {
      info: (
        <>
          <p>Când îți creezi un cont și construiești un site cu inSIXlive, colectăm informațiile pe care ni le furnizezi direct, inclusiv:</p>
          <ul>
            <li>Detalii de cont, precum numele și adresa de email.</li>
            <li>Conținutul pe care îl adaugi pe site — text, imagini și setări.</li>
            <li>Date de utilizare, precum paginile pe care le editezi și funcțiile pe care le folosești.</li>
            <li>Date tehnice, inclusiv tipul de browser, dispozitivul și adresa IP.</li>
          </ul>
        </>
      ),
      use: <p>Folosim informațiile tale pentru a opera, întreține și îmbunătăți inSIXlive, pentru a-ți publica și găzdui site-ul, pentru a comunica cu tine despre contul tău și pentru a menține platforma sigură și securizată.</p>,
      sharing: <p>Nu vindem datele tale personale. Partajăm informații doar cu furnizori de servicii de încredere care ne ajută să operăm platforma (precum găzduirea și livrarea emailurilor) sau atunci când legea o cere.</p>,
      cookies: <p>Folosim cookie-uri și tehnologii similare pentru a te menține autentificat, a-ți reține preferințele și a înțelege cum este folosită platforma. Poți controla cookie-urile din setările browserului.</p>,
      security: <p>Folosim măsuri conforme cu standardele industriei pentru a-ți proteja datele, inclusiv criptarea în tranzit. Nicio metodă de transmitere nu este complet sigură, dar depunem eforturi mari pentru a-ți proteja informațiile.</p>,
      rights: <p>Ai dreptul de a accesa, corecta, exporta sau șterge datele tale personale oricând. Pentru a-ți exercita aceste drepturi, contactează-ne folosind detaliile de mai jos.</p>,
      retention: <p>Păstrăm informațiile tale atât timp cât contul tău este activ sau cât este necesar pentru a furniza serviciile noastre. Când îți ștergi contul, eliminăm datele tale personale într-o perioadă rezonabilă, cu excepția cazurilor în care păstrarea este cerută de lege.</p>,
      contact: <p>Dacă ai întrebări despre această Politică de confidențialitate, contactează echipa noastră la <a className="inline" href="mailto:insixlive@outlook.com">insixlive@outlook.com</a>.</p>,
    },
  },
} as const satisfies Record<Lang, unknown>;

const FOOTER_LABELS = {
  en: { rights: "All rights reserved.", privacy: "Privacy Policy", terms: "Terms of Service", prefs: "Email Preferences" },
  ro: { rights: "Toate drepturile rezervate.", privacy: "Politica de confidențialitate", terms: "Termeni și condiții", prefs: "Preferințe email" },
} as const;

export default async function PrivacyPage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const sp = await searchParams;
  const lang: Lang = sp.lang === "ro" ? "ro" : "en";
  const c = COPY[lang];
  const f = FOOTER_LABELS[lang];

  return (
    <>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f8f8f8; color: #1a1a1a; line-height: 1.6; }
        .lp-page { padding: 20px; }
        .lp-container { max-width: 720px; margin: 0 auto; }
        .lp-wrapper { background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.08); }
        .lp-accent-bar { height: 6px; background: linear-gradient(90deg, #ff6b35 0%, #ffbf00 25%, #2ec4b6 50%, #3a86ff 75%, #6a4c93 100%); }
        .lp-topbar { padding: 24px 40px; border-bottom: 1px solid #f0f0f0; display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
        .lp-brand { display: flex; align-items: center; gap: 10px; }
        .lp-brand .lp-logo { font-size: 28px; font-weight: 900; color: #ff6b35; line-height: 1; }
        .lp-brand-name { font-size: 18px; font-weight: 700; letter-spacing: -0.5px; color: #1a1a1a; }
        .lp-lang-switch { display: flex; gap: 6px; }
        .lp-lang-switch a { font-size: 13px; font-weight: 600; text-decoration: none; color: #888888; padding: 5px 12px; border: 1px solid #e8e8e8; border-radius: 20px; }
        .lp-lang-switch a.active { background: #ff6b35; color: #ffffff; border-color: #ff6b35; }
        .lp-content { padding: 40px; }
        .lp-title { font-size: 32px; font-weight: 700; letter-spacing: -0.5px; margin-bottom: 8px; color: #1a1a1a; }
        .lp-updated { font-size: 14px; color: #999999; margin-bottom: 32px; }
        .lp-toc { background: #fafafa; border: 1px solid #f0f0f0; border-radius: 12px; padding: 20px 24px; margin-bottom: 36px; }
        .lp-toc-title { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #999999; margin-bottom: 12px; }
        .lp-toc ol { margin: 0; padding-left: 18px; columns: 2; column-gap: 24px; }
        .lp-toc li { font-size: 14px; margin-bottom: 6px; break-inside: avoid; }
        .lp-toc a { color: #ff6b35; text-decoration: none; }
        .lp-section { margin-bottom: 32px; }
        .lp-h2 { font-size: 19px; font-weight: 700; letter-spacing: -0.3px; margin-bottom: 10px; color: #1a1a1a; display: flex; align-items: baseline; gap: 10px; }
        .lp-h2 .lp-num { color: #ff6b35; font-size: 15px; font-weight: 700; }
        .lp-content p { font-size: 15px; color: #555555; margin-bottom: 12px; }
        .lp-content ul { margin: 0 0 12px 0; padding-left: 20px; }
        .lp-content li { font-size: 15px; color: #555555; margin-bottom: 6px; }
        a.inline { color: #ff6b35; text-decoration: none; font-weight: 500; }
        .lp-footer { padding: 24px 40px; border-top: 1px solid #f0f0f0; text-align: center; background: #fafafa; }
        .lp-footer-text { color: #999999; font-size: 12px; line-height: 1.5; margin-bottom: 12px; }
        .lp-footer-links { display: flex; justify-content: center; gap: 16px; flex-wrap: wrap; }
        .lp-footer-link { color: #ff6b35; text-decoration: none; font-size: 12px; }
        .lp-divider { color: #ddd; }
        @media (max-width: 560px) {
          .lp-content, .lp-topbar, .lp-footer { padding-left: 24px; padding-right: 24px; }
          .lp-toc ol { columns: 1; }
          .lp-title { font-size: 26px; }
        }
      `}</style>
      <div className="lp-page">
        <div className="lp-container">
          <div className="lp-wrapper">
            <div className="lp-accent-bar" />
            <div className="lp-topbar">
              <div className="lp-brand">
                <span className="lp-logo">6</span>
                <span className="lp-brand-name">inSIXlive</span>
              </div>
              <div className="lp-lang-switch">
                <a href="/privacy?lang=en" className={lang === "en" ? "active" : ""}>EN</a>
                <a href="/privacy?lang=ro" className={lang === "ro" ? "active" : ""}>RO</a>
              </div>
            </div>

            <div className="lp-content">
              <h1 className="lp-title">{c.title}</h1>
              <p className="lp-updated">{c.updated}</p>

              <div className="lp-toc">
                <div className="lp-toc-title">{c.tocTitle}</div>
                <ol>
                  {c.sections.map((s) => (
                    <li key={s.id}><a href={`#${s.id}`}>{s.title}</a></li>
                  ))}
                </ol>
              </div>

              {c.sections.map((s, i) => (
                <section className="lp-section" id={s.id} key={s.id}>
                  <h2 className="lp-h2"><span className="lp-num">{String(i + 1).padStart(2, "0")}</span> {s.title}</h2>
                  {c.body[s.id as keyof typeof c.body]}
                </section>
              ))}
            </div>

            <div className="lp-footer">
              <p className="lp-footer-text">© 2026 inSIXlive. {f.rights}</p>
              <div className="lp-footer-links">
                <a href={`/privacy?lang=${lang}`} className="lp-footer-link">{f.privacy}</a>
                <span className="lp-divider">•</span>
                <a href={`/terms?lang=${lang}`} className="lp-footer-link">{f.terms}</a>
                <span className="lp-divider">•</span>
                <a href={`/email-preferences?lang=${lang}`} className="lp-footer-link">{f.prefs}</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
