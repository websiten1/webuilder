"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { Icons } from "./icons";
import { Callout } from "./primitives";
import type { DashSite } from "./types";
import { tt, type Lang } from "./i18n";

export function BuyEditsModal({ site, sites, onClose, lang }: { site: DashSite | null; sites: DashSite[]; onClose: () => void; lang: Lang }) {
  const router = useRouter();
  const go = (id: string) => {
    onClose();
    router.push(`/edit/${id}`);
  };
  return (
    <div className="modal-scrim" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal">
        <div className="modal-head">
          <div className="mt">
            <span className="itile accent" style={{ width: 34, height: 34 }}>
              <Icons.bolt size={18} />
            </span>
            {tt(lang, "Buy an edit", "Cumpără o modificare")}
          </div>
          <div className="msb">
            {site ? (
              <span>
                {tt(lang, "Describe the change you want on", "Descrie schimbarea pe care o dorești pentru")} <b style={{ color: "var(--text)" }}>{site.name}</b> {tt(lang, "and pay €10.00 — it's applied right away.", "și plătește 10,00 € — se aplică imediat.")}
              </span>
            ) : (
              tt(lang, "Pick a site below. Each edit is €10.00, described up front and applied immediately — there's no separate credit wallet to pre-buy.", "Alege un site mai jos. Fiecare modificare costă 10,00 €, este descrisă din timp și aplicată imediat — nu există un portofel de credite separat de precomandat.")
            )}
          </div>
        </div>
        <div className="modal-body">
          {site ? (
            <Callout kind="info" icon={<Icons.card />} title={tt(lang, "Secure one-time payment", "Plată unică securizată")}>
              {tt(lang, "You'll describe the change on the next page, then pay via Stripe before it's generated and redeployed.", "Vei descrie schimbarea pe pagina următoare, apoi vei plăti prin Stripe înainte ca aceasta să fie generată și republicată.")}
            </Callout>
          ) : (
            <div className="list">
              {sites.map((s) => (
                <button
                  key={s.id}
                  className="lrow"
                  style={{ width: "100%", border: 0, background: "transparent", cursor: "pointer", textAlign: "left" }}
                  onClick={() => go(s.id)}
                >
                  <div className="site-fav" style={{ width: 32, height: 32, fontSize: 12, background: s.color }}>{s.fav}</div>
                  <div className="lcell grow">
                    <div className="lc-h">{s.name}</div>
                    <div className="lc-s">{s.edits} {tt(lang, `free edit${s.edits === 1 ? "" : "s"} remaining`, `${s.edits === 1 ? "modificare gratuită" : "modificări gratuite"} rămase`)}</div>
                  </div>
                  <Icons.chevRight size={16} />
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="modal-foot">
          <div className="mf-total">{site ? <>{tt(lang, "Edit price", "Preț modificare")} <b>€10.00</b></> : <span style={{ color: "var(--text-3)" }}>{tt(lang, "Choose a site to continue", "Alege un site pentru a continua")}</span>}</div>
          <div style={{ display: "flex", gap: 9 }}>
            <button className="b b-quiet" onClick={onClose}>{tt(lang, "Cancel", "Anulează")}</button>
            {site && <button className="b b-primary" onClick={() => go(site.id)}>{tt(lang, "Continue", "Continuă")}</button>}
          </div>
        </div>
      </div>
    </div>
  );
}
