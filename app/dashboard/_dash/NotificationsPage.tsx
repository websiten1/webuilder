"use client";
import React from "react";
import { Icons } from "./icons";
import { Section, Row, Toggle } from "./primitives";
import { tt, type Lang } from "./i18n";

export function NotificationsPage({ toast, onDelete, lang }: { toast: (m: string) => void; onDelete: () => void; lang: Lang }) {
  const [pref, setPref] = React.useState({ started: true, completed: true, failed: true, product: false, tips: true });
  const set = (k: keyof typeof pref, v: boolean) => {
    setPref((p) => ({ ...p, [k]: v }));
    toast(tt(lang, "Saved for this session — preferences aren't persisted yet", "Salvat pentru această sesiune — preferințele nu sunt încă salvate permanent"));
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
          <Row title={tt(lang, "Edit started", "Modificare începută")} desc={tt(lang, "When an edit begins generating.", "Când o modificare începe să se genereze.")}>
            <Toggle on={pref.started} onChange={(v) => set("started", v)} />
          </Row>
          <Row title={tt(lang, "Edit completed", "Modificare finalizată")} desc={tt(lang, "When your site is rebuilt and redeployed.", "Când site-ul tău este reconstruit și republicat.")}>
            <Toggle on={pref.completed} onChange={(v) => set("completed", v)} />
          </Row>
          <Row title={tt(lang, "Build failed", "Construire eșuată")} desc={tt(lang, "If something goes wrong so you can retry.", "Dacă ceva nu funcționează, ca să poți încerca din nou.")}>
            <Toggle on={pref.failed} onChange={(v) => set("failed", v)} />
          </Row>
        </div>
      </Section>

      <Section kicker="02" title={tt(lang, "From insixlive", "De la insixlive")}>
        <div className="card">
          <Row title={tt(lang, "Product updates", "Actualizări de produs")} desc={tt(lang, "New templates, features, and improvements.", "Șabloane noi, funcționalități și îmbunătățiri.")}>
            <Toggle on={pref.product} onChange={(v) => set("product", v)} />
          </Row>
          <Row title={tt(lang, "Tips & guides", "Sfaturi și ghiduri")} desc={tt(lang, "Occasional advice on getting the most from your site.", "Sfaturi ocazionale pentru a profita la maximum de site-ul tău.")}>
            <Toggle on={pref.tips} onChange={(v) => set("tips", v)} />
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
