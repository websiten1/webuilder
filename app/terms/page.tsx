import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "inSIXlive — Terms of Service",
  description: "Terms and conditions for using the inSIXlive website generation service.",
};

type Lang = "en" | "ro";

const COPY = {
  en: {
    title: "Terms of Service",
    updated: "Last updated: June 21, 2026",
    tocTitle: "Contents",
    sections: [
      { id: "accept", title: "Acceptance of terms" },
      { id: "eligibility", title: "Eligibility" },
      { id: "account", title: "Your account" },
      { id: "use", title: "Acceptable use" },
      { id: "content", title: "Your content & ownership" },
      { id: "limitations", title: "Important limitations" },
      { id: "plans", title: "Plans & payments" },
      { id: "availability", title: "Service availability" },
      { id: "warranties", title: "Disclaimer of warranties" },
      { id: "liability", title: "Limitation of liability" },
      { id: "termination", title: "Termination" },
      { id: "law", title: "Governing law" },
      { id: "changes", title: "Changes to these terms" },
      { id: "contact", title: "Contact us" },
    ],
    body: {
      accept: <p>By creating an account or using inSIXlive, you agree to these Terms of Service in full. If you do not agree, please do not use the platform.</p>,
      eligibility: <p>You must be at least 18 years old to use inSIXlive. By using the service you represent that you are 18 or older and have the legal capacity to enter into these Terms.</p>,
      account: (
        <>
          <p>You are responsible for keeping your login details secure and for all activity that happens under your account. Notify us immediately if you suspect unauthorised use of your account.</p>
        </>
      ),
      use: (
        <>
          <p>You agree not to misuse the platform. In particular, you must not use inSIXlive to generate websites that:</p>
          <ul>
            <li>Publish illegal, harmful, or infringing content, or promote activities prohibited by applicable law.</li>
            <li>Contain hate speech, harassment, or sexually explicit material.</li>
            <li>Constitute spam, phishing, or other deceptive content, or impersonate another business or individual.</li>
            <li>Attempt to disrupt, hack, or overload our systems, or resell the service without our written permission.</li>
          </ul>
          <p>We reserve the right to refuse service or terminate accounts that violate these restrictions.</p>
        </>
      ),
      content: (
        <>
          <p>You retain full ownership of the business information, images, and content you provide. Once generated, the website code and content belong to you — you may download, host, modify, or delete it at any time.</p>
          <p>By publishing with inSIXlive, you grant us a limited, non-exclusive licence to use your inputs solely to generate and deploy your website. You warrant that your inputs do not infringe any third-party rights and do not contain unlawful content.</p>
        </>
      ),
      limitations: (
        <>
          <p>The following limitations are fundamental to how the service works:</p>
          <ul>
            <li><strong>No online shop or booking system.</strong> Generated websites are informational only. They cannot process online payments, sell products directly, or manage bookings or appointments — visitors are directed to contact you by phone or email.</li>
            <li><strong>Websites cannot be edited after generation</strong> except through a paid edit request or regeneration. There is no live content editor.</li>
            <li><strong>A connected Vercel account is required</strong> before you can start the website generation wizard, since your site deploys directly to your own Vercel account. You are responsible for your Vercel account and any costs associated with hosting or custom domains there. We are not affiliated with Vercel Inc.</li>
          </ul>
        </>
      ),
      plans: (
        <>
          <p>Some features, including additional edits and premium websites, require payment. Fees are shown before you purchase and are processed securely through Stripe — we never see or store your card details. Free credits, such as those earned through referrals, have no cash value and may expire.</p>
          <p>Because generation begins immediately after payment and produces a unique digital deliverable, <strong>payments are non-refundable once the generation process has started.</strong> If generation fails entirely and no website is delivered, contact support — we will refund or retry at our discretion.</p>
        </>
      ),
      availability: <p>We work hard to keep inSIXlive running smoothly, but we cannot guarantee uninterrupted service. We may update, suspend, or change features to improve the platform.</p>,
      warranties: <p>The service is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind, express or implied. We do not warrant that AI-generated content will be accurate, complete, or fit for any particular purpose — you are responsible for reviewing and approving your generated website before publishing it.</p>,
      liability: <p>To the maximum extent permitted by law, inSIXlive and its affiliates are not liable for any indirect, incidental, consequential, or punitive damages arising from your use of the service. Our total liability for any claim shall not exceed the amount you paid us in the three months preceding the claim.</p>,
      termination: <p>You may close your account at any time. We may suspend or terminate accounts that violate these terms. Upon termination, your published websites may be taken offline (websites already deployed to your own Vercel account are unaffected, since you own that deployment).</p>,
      law: <p>These Terms are governed by the laws of Romania, without regard to conflict of law principles. Disputes are subject to the exclusive jurisdiction of the courts of Romania. If you are a consumer in the EU, you may also bring proceedings before the courts of your country of residence.</p>,
      changes: <p>We may update these Terms from time to time. The &quot;Last updated&quot; date above reflects any changes. For material changes, we will notify you by email. Continued use of the service after the effective date constitutes acceptance of the revised Terms.</p>,
      contact: <p>Questions about these terms? Reach our team at <a className="inline" href="mailto:insixlive@outlook.com">insixlive@outlook.com</a>.</p>,
    },
  },
  ro: {
    title: "Termeni și condiții",
    updated: "Ultima actualizare: 21 iunie 2026",
    tocTitle: "Cuprins",
    sections: [
      { id: "accept", title: "Acceptarea termenilor" },
      { id: "eligibility", title: "Eligibilitate" },
      { id: "account", title: "Contul tău" },
      { id: "use", title: "Utilizare acceptabilă" },
      { id: "content", title: "Conținutul tău și dreptul de proprietate" },
      { id: "limitations", title: "Limitări importante" },
      { id: "plans", title: "Planuri și plăți" },
      { id: "availability", title: "Disponibilitatea serviciului" },
      { id: "warranties", title: "Declinarea garanțiilor" },
      { id: "liability", title: "Limitarea răspunderii" },
      { id: "termination", title: "Încetare" },
      { id: "law", title: "Legea aplicabilă" },
      { id: "changes", title: "Modificări ale acestor termeni" },
      { id: "contact", title: "Contactează-ne" },
    ],
    body: {
      accept: <p>Prin crearea unui cont sau prin utilizarea inSIXlive, ești de acord integral cu acești Termeni și condiții. Dacă nu ești de acord, te rugăm să nu folosești platforma.</p>,
      eligibility: <p>Trebuie să ai cel puțin 18 ani pentru a folosi inSIXlive. Prin utilizarea serviciului, declari că ai 18 ani sau mai mult și că ai capacitatea legală de a încheia acești Termeni.</p>,
      account: <p>Ești responsabil pentru păstrarea în siguranță a datelor tale de autentificare și pentru toată activitatea desfășurată în contul tău. Notifică-ne imediat dacă suspectezi o utilizare neautorizată a contului tău.</p>,
      use: (
        <>
          <p>Ești de acord să nu folosești greșit platforma. În special, nu ai voie să folosești inSIXlive pentru a genera site-uri care:</p>
          <ul>
            <li>Publică conținut ilegal, dăunător sau care încalcă drepturi, sau promovează activități interzise de legea aplicabilă.</li>
            <li>Conțin discurs instigator la ură, hărțuire sau material sexual explicit.</li>
            <li>Constituie spam, phishing sau alt conținut înșelător, sau impersonează o altă afacere sau persoană.</li>
            <li>Încearcă să perturbe, să spargă sau să suprasolicite sistemele noastre, sau revând serviciul fără permisiunea noastră scrisă.</li>
          </ul>
          <p>Ne rezervăm dreptul de a refuza serviciul sau de a închide conturile care încalcă aceste restricții.</p>
        </>
      ),
      content: (
        <>
          <p>Păstrezi dreptul de proprietate deplin asupra informațiilor de afaceri, imaginilor și conținutului pe care le furnizezi. Odată generat, codul și conținutul site-ului îți apartin — îl poți descărca, găzdui, modifica sau șterge oricând.</p>
          <p>Prin publicarea cu inSIXlive, ne acorzi o licență limitată, neexclusivă de a folosi datele tale exclusiv pentru a genera și implementa site-ul tău. Garantezi că datele tale nu încalcă drepturile vreunei terțe părți și nu conțin conținut ilegal.</p>
        </>
      ),
      limitations: (
        <>
          <p>Următoarele limitări sunt fundamentale pentru modul în care funcționează serviciul:</p>
          <ul>
            <li><strong>Fără magazin online sau sistem de rezervări.</strong> Site-urile generate sunt doar informative. Nu pot procesa plăți online, nu pot vinde produse direct și nu pot gestiona rezervări sau programări — vizitatorii sunt îndrumați să te contacteze telefonic sau prin email.</li>
            <li><strong>Site-urile nu pot fi editate după generare</strong> decât printr-o cerere de editare plătită sau o regenerare. Nu există un editor de conținut live.</li>
            <li><strong>Este necesar un cont Vercel conectat</strong> înainte de a putea începe expertul de generare a site-ului, deoarece site-ul tău se implementează direct în contul tău Vercel. Ești responsabil pentru contul tău Vercel și pentru orice costuri asociate găzduirii sau domeniilor personalizate de acolo. Nu suntem afiliați cu Vercel Inc.</li>
          </ul>
        </>
      ),
      plans: (
        <>
          <p>Unele funcții, inclusiv editările suplimentare și site-urile premium, necesită plată. Tarifele sunt afișate înainte de cumpărare și sunt procesate în siguranță prin Stripe — nu vedem și nu stocăm niciodată datele cardului tău. Creditele gratuite, precum cele câștigate prin recomandări, nu au valoare în bani și pot expira.</p>
          <p>Deoarece generarea începe imediat după plată și produce un rezultat digital unic, <strong>plățile nu sunt rambursabile odată ce procesul de generare a început.</strong> Dacă generarea eșuează complet și niciun site nu este livrat, contactează suportul — vom rambursa sau reîncerca, la discreția noastră.</p>
        </>
      ),
      availability: <p>Depunem eforturi pentru ca inSIXlive să funcționeze fără probleme, dar nu putem garanta un serviciu neîntrerupt. Putem actualiza, suspenda sau modifica funcții pentru a îmbunătăți platforma.</p>,
      warranties: <p>Serviciul este oferit &quot;ca atare&quot; și &quot;în limita disponibilității&quot;, fără garanții de niciun fel, expres sau implicit. Nu garantăm că conținutul generat de AI va fi corect, complet sau adecvat unui scop anume — ești responsabil să revizuiești și să aprobi site-ul generat înainte de a-l publica.</p>,
      liability: <p>În limita maximă permisă de lege, inSIXlive și afiliații săi nu sunt responsabili pentru daune indirecte, incidentale, subsecvente sau punitive rezultate din utilizarea serviciului. Răspunderea noastră totală pentru orice pretenție nu va depăși suma pe care ne-ai plătit-o în cele trei luni precedente pretenției.</p>,
      termination: <p>Îți poți închide contul oricând. Putem suspenda sau închide conturile care încalcă acești termeni. La încetare, site-urile tale publicate pot fi scoase din funcțiune (site-urile deja implementate în propriul tău cont Vercel nu sunt afectate, deoarece deții acea implementare).</p>,
      law: <p>Acești Termeni sunt guvernați de legile României, fără a ține cont de principiile conflictului de legi. Disputele sunt supuse jurisdicției exclusive a instanțelor din România. Dacă ești consumator în UE, poți de asemenea iniția proceduri la instanțele din țara ta de reședință.</p>,
      changes: <p>Putem actualiza acești Termeni din timp în timp. Data &quot;Ultima actualizare&quot; de mai sus reflectă orice modificare. Pentru modificări importante, te vom notifica prin email. Utilizarea continuă a serviciului după data de intrare în vigoare constituie acceptarea Termenilor revizuiți.</p>,
      contact: <p>Întrebări despre acești termeni? Contactează echipa noastră la <a className="inline" href="mailto:insixlive@outlook.com">insixlive@outlook.com</a>.</p>,
    },
  },
} as const satisfies Record<Lang, unknown>;

const FOOTER_LABELS = {
  en: { rights: "All rights reserved.", privacy: "Privacy Policy", terms: "Terms of Service", prefs: "Email Preferences" },
  ro: { rights: "Toate drepturile rezervate.", privacy: "Politica de confidențialitate", terms: "Termeni și condiții", prefs: "Preferințe email" },
} as const;

export default async function TermsPage({
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
                <a href="/terms?lang=en" className={lang === "en" ? "active" : ""}>EN</a>
                <a href="/terms?lang=ro" className={lang === "ro" ? "active" : ""}>RO</a>
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
