"use client";
import React from "react";
import { Icons } from "./icons";
import { Section, Row, Toggle } from "./primitives";
import { tt, type Lang } from "./i18n";

type EmailPreferences = {
  websiteUpdates: boolean;
  rewards: boolean;
  tips: boolean;
  promotions: boolean;
};

const DEFAULT_PREFS: EmailPreferences = { websiteUpdates: true, rewards: true, tips: false, promotions: false };

export function NotificationsPage({ toast, onDelete, lang }: { toast: (m: string) => void; onDelete: () => void; lang: Lang }) {
  const [pref, setPref] = React.useState<EmailPreferences>(DEFAULT_PREFS);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch("/api/email-preferences")
      .then((r) => r.json())
      .then((d) => { if (d.preferences) setPref(d.preferences); })
      .finally(() => setLoading(false));
  }, []);

  const set = async (k: keyof EmailPreferences, v: boolean) => {
    const next = { ...pref, [k]: v };
    setPref(next);
    try {
      const res = await fetch("/api/email-preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      });
      if (!res.ok) throw new Error();
      toast(tt(lang, "Saved", "Salvat"));
    } catch {
      setPref(pref);
      toast(tt(lang, "Failed to save. Please try again.", "Salvarea a eșuat. Încearcă din nou."));
    }
  };

  return (
    <div className="page narrow view-enter">
      <div className="page-head">
        <div className="kicker">// {tt(lang, "Account", "Cont")}</div>
        <h1 className="page-title">{tt(lang, "Notifications", "Notificări")}</h1>
        <p className="page-sub">{tt(lang, "Choose which emails insixlive sends you. Transactional updates keep you posted on your builds.", "Alege ce email-uri îți trimite insixlive. Actualizările tranzacționale te țin la curent cu construirea site-urilor tale.")}</p>
      </div>

      <Section kicker="01" title={tt(lang, "Build emails", "Email-uri de construire")} desc={tt(lang, "Recommended", "Recomandat")}>
        <div className="card">
          <Row title={tt(lang, "Website updates", "Actualizări site")} desc={tt(lang, "Confirmations when your website is published or changed.", "Confirmări când site-ul tău este publicat sau modificat.")}>
            <Toggle on={pref.websiteUpdates} onChange={(v) => set("websiteUpdates", v)} disabled={loading} />
          </Row>
        </div>
      </Section>

      <Section kicker="02" title={tt(lang, "From insixlive", "De la insixlive")}>
        <div className="card">
          <Row title={tt(lang, "Rewards & referrals", "Recompense și recomandări")} desc={tt(lang, "Invite offers and free edits or websites you've earned.", "Oferte de invitație și editări sau site-uri gratuite câștigate.")}>
            <Toggle on={pref.rewards} onChange={(v) => set("rewards", v)} disabled={loading} />
          </Row>
          <Row title={tt(lang, "Tips & product news", "Sfaturi și noutăți")} desc={tt(lang, "Guides, new features, and ways to get more from insixlive.", "Ghiduri, funcții noi și moduri de a profita mai mult de insixlive.")}>
            <Toggle on={pref.tips} onChange={(v) => set("tips", v)} disabled={loading} />
          </Row>
          <Row title={tt(lang, "Promotions & offers", "Promoții și oferte")} desc={tt(lang, "Occasional discounts and special deals.", "Reduceri ocazionale și oferte speciale.")}>
            <Toggle on={pref.promotions} onChange={(v) => set("promotions", v)} disabled={loading} />
          </Row>
        </div>
      </Section>

      <Section kicker="03" title={tt(lang, "Danger zone", "Zonă periculoasă")}>
        <div className="danger-zone">
          <div className="dz-row">
            <div className="itile" style={{ color: "var(--danger)", borderColor: "var(--danger-line)", background: "var(--danger-soft)" }}>
              <Icons.trash size={19} />
            </div>
            <div className="row-main">
              <div className="row-h">{tt(lang, "Delete account", "Șterge contul")}</div>
              <div className="row-d">
                {tt(lang, "Permanently delete your account. Your code already lives in your own repos and Vercel — but billing history and edit credits are erased.", "Șterge definitiv contul tău. Codul tău trăiește deja în propriile repo-uri și pe Vercel — dar istoricul de facturare și creditele de modificare sunt eliminate.")}
              </div>
            </div>
            <button className="b b-danger b-sm" onClick={onDelete}>
              {tt(lang, "Delete account", "Șterge contul")}
            </button>
          </div>
        </div>
      </Section>
    </div>
  );
}
