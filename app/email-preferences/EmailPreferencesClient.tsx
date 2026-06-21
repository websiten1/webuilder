"use client";
import { useEffect, useState } from "react";
import type { EmailPreferences } from "@/lib/db";

type Lang = "en" | "ro";

const COPY = {
  en: {
    title: "Email preferences",
    intro: "Choose which emails you'd like to receive from inSIXlive.",
    loading: "Loading your preferences…",
    loginPrompt: "Log in to manage your email preferences.",
    loginCta: "Log in",
    account: { name: "Account & security", desc: "Verification codes, sign-in alerts, and important account notices. Required." },
    websiteUpdates: { name: "Website updates", desc: "Confirmations when your website is published or changed." },
    rewards: { name: "Rewards & referrals", desc: "Invite offers and free edits or websites you've earned." },
    tips: { name: "Tips & product news", desc: "Guides, new features, and ways to get more from inSIXlive." },
    promotions: { name: "Promotions & offers", desc: "Occasional discounts and special deals." },
    unsubAll: { name: "Unsubscribe from all", desc: "Turn off every optional email. You'll still receive account & security messages." },
    save: "Save preferences",
    saving: "Saving…",
    saved: "✓ Preferences saved",
    rights: "All rights reserved.",
    privacy: "Privacy Policy",
    terms: "Terms of Service",
    prefs: "Email Preferences",
  },
  ro: {
    title: "Preferințe email",
    intro: "Alege ce emailuri dorești să primești de la inSIXlive.",
    loading: "Se încarcă preferințele tale…",
    loginPrompt: "Autentifică-te pentru a-ți gestiona preferințele de email.",
    loginCta: "Autentificare",
    account: { name: "Cont și securitate", desc: "Coduri de verificare, alerte de autentificare și notificări importante de cont. Obligatoriu." },
    websiteUpdates: { name: "Actualizări site", desc: "Confirmări când site-ul tău este publicat sau modificat." },
    rewards: { name: "Recompense și recomandări", desc: "Oferte de invitație și editări sau site-uri gratuite câștigate." },
    tips: { name: "Sfaturi și noutăți", desc: "Ghiduri, funcții noi și moduri de a profita mai mult de inSIXlive." },
    promotions: { name: "Promoții și oferte", desc: "Reduceri ocazionale și oferte speciale." },
    unsubAll: { name: "Dezabonează-te de la toate", desc: "Oprește toate emailurile opționale. Vei primi în continuare mesaje de cont și securitate." },
    save: "Salvează preferințele",
    saving: "Se salvează…",
    saved: "✓ Preferințe salvate",
    rights: "Toate drepturile rezervate.",
    privacy: "Politica de confidențialitate",
    terms: "Termeni și condiții",
    prefs: "Preferințe email",
  },
} as const;

const DEFAULT_PREFS: EmailPreferences = { websiteUpdates: true, rewards: true, tips: false, promotions: false };

function Toggle({ on, locked, onToggle }: { on: boolean; locked?: boolean; onToggle?: () => void }) {
  return (
    <button
      className={`ep-toggle${on ? " on" : ""}`}
      onClick={locked ? undefined : onToggle}
      disabled={locked}
      aria-label="Toggle"
      type="button"
    >
      <span className="ep-knob" />
    </button>
  );
}

export default function EmailPreferencesClient({ lang }: { lang: Lang }) {
  const c = COPY[lang];
  const [status, setStatus] = useState<"loading" | "ready" | "loggedOut">("loading");
  const [email, setEmail] = useState("");
  const [prefs, setPrefs] = useState<EmailPreferences>(DEFAULT_PREFS);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/email-preferences")
      .then((res) => {
        if (res.status === 401) {
          setStatus("loggedOut");
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (!data) return;
        setEmail(data.email);
        setPrefs({ ...DEFAULT_PREFS, ...data.preferences });
        setStatus("ready");
      })
      .catch(() => setStatus("loggedOut"));
  }, []);

  const unsubAll = !prefs.websiteUpdates && !prefs.rewards && !prefs.tips && !prefs.promotions;

  const toggle = (key: keyof EmailPreferences) => {
    setPrefs((p) => ({ ...p, [key]: !p[key] }));
    setSaved(false);
  };

  const toggleUnsubAll = () => {
    if (unsubAll) {
      setPrefs(DEFAULT_PREFS);
    } else {
      setPrefs({ websiteUpdates: false, rewards: false, tips: false, promotions: false });
    }
    setSaved(false);
  };

  const save = async () => {
    setSaving(true);
    try {
      await fetch("/api/email-preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(prefs),
      });
      setSaved(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f8f8f8; color: #1a1a1a; line-height: 1.6; }
        .ep-page { padding: 20px; }
        .ep-container { max-width: 600px; margin: 0 auto; }
        .ep-wrapper { background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.08); }
        .ep-accent-bar { height: 6px; background: linear-gradient(90deg, #ff6b35 0%, #ffbf00 25%, #2ec4b6 50%, #3a86ff 75%, #6a4c93 100%); }
        .ep-topbar { padding: 24px 32px; border-bottom: 1px solid #f0f0f0; display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
        .ep-brand { display: flex; align-items: center; gap: 10px; }
        .ep-brand .ep-logo { font-size: 28px; font-weight: 900; color: #ff6b35; line-height: 1; }
        .ep-brand-name { font-size: 18px; font-weight: 700; letter-spacing: -0.5px; color: #1a1a1a; }
        .ep-lang-switch { display: flex; gap: 6px; }
        .ep-lang-switch a { font-size: 13px; font-weight: 600; text-decoration: none; color: #888888; padding: 5px 12px; border: 1px solid #e8e8e8; border-radius: 20px; }
        .ep-lang-switch a.active { background: #ff6b35; color: #ffffff; border-color: #ff6b35; }
        .ep-content { padding: 36px 32px 8px 32px; }
        .ep-title { font-size: 26px; font-weight: 700; letter-spacing: -0.5px; margin-bottom: 8px; color: #1a1a1a; }
        .ep-intro { font-size: 15px; color: #666666; margin-bottom: 8px; }
        .ep-chip { display: inline-block; background: #f5f5f5; color: #444444; font-size: 13px; font-weight: 600; padding: 4px 12px; border-radius: 20px; margin-bottom: 28px; }
        .ep-row { display: flex; align-items: center; justify-content: space-between; gap: 20px; padding: 18px 0; border-bottom: 1px solid #f0f0f0; }
        .ep-row-info { flex: 1; }
        .ep-row-name { font-size: 16px; font-weight: 600; color: #1a1a1a; margin-bottom: 2px; }
        .ep-row-desc { font-size: 13.5px; color: #888888; }
        .ep-toggle { flex: 0 0 auto; width: 48px; height: 28px; border-radius: 999px; background: #d8d8d8; position: relative; cursor: pointer; border: none; }
        .ep-toggle:disabled { cursor: not-allowed; }
        .ep-knob { position: absolute; top: 3px; left: 3px; width: 22px; height: 22px; border-radius: 50%; background: #ffffff; box-shadow: 0 1px 3px rgba(0,0,0,0.2); transition: transform 0.2s ease; display: block; }
        .ep-toggle.on { background: #ff6b35; }
        .ep-toggle.on .ep-knob { transform: translateX(20px); }
        .ep-unsub { display: flex; align-items: center; justify-content: space-between; gap: 20px; padding: 20px 0 4px 0; margin-top: 8px; border-top: 1px solid #f0f0f0; }
        .ep-save-bar { padding: 20px 32px 28px 32px; background: #fafafa; border-top: 1px solid #f0f0f0; display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
        .ep-save-button { padding: 12px 28px; background: #ff6b35; color: #ffffff; border: none; border-radius: 8px; font-weight: 600; font-size: 15px; font-family: inherit; cursor: pointer; }
        .ep-save-button:disabled { opacity: 0.6; cursor: not-allowed; }
        .ep-saved-msg { font-size: 14px; font-weight: 600; color: #14a085; }
        .ep-footer { padding: 24px 32px; border-top: 1px solid #f0f0f0; text-align: center; background: #fafafa; }
        .ep-footer-text { color: #999999; font-size: 12px; line-height: 1.5; margin-bottom: 12px; }
        .ep-footer-links { display: flex; justify-content: center; gap: 16px; flex-wrap: wrap; }
        .ep-footer-link { color: #ff6b35; text-decoration: none; font-size: 12px; }
        .ep-divider { color: #ddd; }
        .ep-empty { padding: 60px 32px; text-align: center; color: #666666; }
        .ep-login-link { display: inline-block; margin-top: 16px; padding: 10px 22px; background: #09090b; color: #fff; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; }
        @media (max-width: 560px) {
          .ep-content, .ep-topbar, .ep-footer, .ep-save-bar { padding-left: 24px; padding-right: 24px; }
        }
      `}</style>
      <div className="ep-page">
        <div className="ep-container">
          <div className="ep-wrapper">
            <div className="ep-accent-bar" />
            <div className="ep-topbar">
              <div className="ep-brand">
                <span className="ep-logo">6</span>
                <span className="ep-brand-name">inSIXlive</span>
              </div>
              <div className="ep-lang-switch">
                <a href="/email-preferences?lang=en" className={lang === "en" ? "active" : ""}>EN</a>
                <a href="/email-preferences?lang=ro" className={lang === "ro" ? "active" : ""}>RO</a>
              </div>
            </div>

            {status === "loading" && <div className="ep-empty">{c.loading}</div>}

            {status === "loggedOut" && (
              <div className="ep-empty">
                <p>{c.loginPrompt}</p>
                <a className="ep-login-link" href={`/login?from=${encodeURIComponent(`/email-preferences?lang=${lang}`)}`}>{c.loginCta}</a>
              </div>
            )}

            {status === "ready" && (
              <>
                <div className="ep-content">
                  <h1 className="ep-title">{c.title}</h1>
                  <p className="ep-intro">{c.intro}</p>
                  <span className="ep-chip">{email}</span>

                  <div className="ep-row">
                    <div className="ep-row-info">
                      <div className="ep-row-name">{c.account.name}</div>
                      <div className="ep-row-desc">{c.account.desc}</div>
                    </div>
                    <Toggle on locked />
                  </div>

                  <div className="ep-row">
                    <div className="ep-row-info">
                      <div className="ep-row-name">{c.websiteUpdates.name}</div>
                      <div className="ep-row-desc">{c.websiteUpdates.desc}</div>
                    </div>
                    <Toggle on={prefs.websiteUpdates} onToggle={() => toggle("websiteUpdates")} />
                  </div>

                  <div className="ep-row">
                    <div className="ep-row-info">
                      <div className="ep-row-name">{c.rewards.name}</div>
                      <div className="ep-row-desc">{c.rewards.desc}</div>
                    </div>
                    <Toggle on={prefs.rewards} onToggle={() => toggle("rewards")} />
                  </div>

                  <div className="ep-row">
                    <div className="ep-row-info">
                      <div className="ep-row-name">{c.tips.name}</div>
                      <div className="ep-row-desc">{c.tips.desc}</div>
                    </div>
                    <Toggle on={prefs.tips} onToggle={() => toggle("tips")} />
                  </div>

                  <div className="ep-row">
                    <div className="ep-row-info">
                      <div className="ep-row-name">{c.promotions.name}</div>
                      <div className="ep-row-desc">{c.promotions.desc}</div>
                    </div>
                    <Toggle on={prefs.promotions} onToggle={() => toggle("promotions")} />
                  </div>

                  <div className="ep-unsub">
                    <div className="ep-row-info">
                      <div className="ep-row-name">{c.unsubAll.name}</div>
                      <div className="ep-row-desc">{c.unsubAll.desc}</div>
                    </div>
                    <Toggle on={unsubAll} onToggle={toggleUnsubAll} />
                  </div>
                </div>

                <div className="ep-save-bar">
                  <button className="ep-save-button" onClick={save} disabled={saving}>
                    {saving ? c.saving : c.save}
                  </button>
                  {saved && <span className="ep-saved-msg">{c.saved}</span>}
                </div>
              </>
            )}

            <div className="ep-footer">
              <p className="ep-footer-text">© 2026 inSIXlive. {c.rights}</p>
              <div className="ep-footer-links">
                <a href={`/privacy?lang=${lang}`} className="ep-footer-link">{c.privacy}</a>
                <span className="ep-divider">•</span>
                <a href={`/terms?lang=${lang}`} className="ep-footer-link">{c.terms}</a>
                <span className="ep-divider">•</span>
                <a href={`/email-preferences?lang=${lang}`} className="ep-footer-link">{c.prefs}</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
