"use client";
import React from "react";
import { Avatar, Field, Pill } from "./primitives";
import { tt, type Lang } from "./i18n";

export function ProfilePage({ email, initials, joined, toast, lang }: { email: string; initials: string; joined: string; toast: (m: string) => void; lang: Lang }) {
  return (
    <div className="page narrow view-enter">
      <div className="page-head">
        <div className="kicker">// {tt(lang, "Account", "Cont")}</div>
        <h1 className="page-title">{tt(lang, "Profile", "Profil")}</h1>
        <p className="page-sub">{tt(lang, "How you appear across insixlive. Your email is the identity tied to every site you own.", "Cum apari pe insixlive. Email-ul tău este identitatea legată de fiecare site pe care îl deții.")}</p>
      </div>

      <div className="card">
        <div className="card-pad">
          <div className="avatar-edit">
            <Avatar initials={initials} size={78} />
            <div className="ae-actions">
              <div className="ae-h">{tt(lang, "Profile photo", "Fotografie de profil")}</div>
              <div className="ae-d">{tt(lang, "Generated from your initials. Upload coming soon.", "Generată din inițialele tale. Încărcarea va fi disponibilă în curând.")}</div>
              <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                <button className="b b-ghost b-sm" disabled>
                  {tt(lang, "Upload", "Încarcă")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 14 }}>
        <div className="card-pad">
          <Field label={tt(lang, "Email address", "Adresă de email")}>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <input className="inp" readOnly value={email} style={{ flex: 1 }} />
              <Pill kind="ok" dot>
                {tt(lang, "Verified", "Verificat")}
              </Pill>
            </div>
            <div className="fhint">{tt(lang, "Contact support to change your account email address.", "Contactează suportul pentru a schimba adresa de email a contului.")}</div>
          </Field>
          <Field label={tt(lang, "Display name", "Nume afișat")} opt={tt(lang, "optional", "opțional")} hint={tt(lang, "Not stored yet — coming soon.", "Nu este încă salvat — disponibil în curând.")}>
            <input className="inp" placeholder={tt(lang, "Your name", "Numele tău")} />
          </Field>
          <Field label={tt(lang, "Company", "Companie")} opt={tt(lang, "optional", "opțional")} hint={tt(lang, "Not stored yet — coming soon.", "Nu este încă salvat — disponibil în curând.")}>
            <input className="inp" placeholder={tt(lang, "Your company", "Compania ta")} />
          </Field>
        </div>
        <div className="row" style={{ borderTop: "1px solid var(--hair)", justifyContent: "space-between" }}>
          <div className="row-d" style={{ margin: 0 }}>
            {tt(lang, `Member since ${joined}`, `Membru din ${joined}`)}
          </div>
          <div style={{ display: "flex", gap: 9 }}>
            <button className="b b-primary" onClick={() => toast(tt(lang, "Display name & company aren't stored yet", "Numele afișat și compania nu sunt încă salvate"))}>
              {tt(lang, "Save changes", "Salvează modificările")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
