"use client";
import React from "react";
import { Icons } from "./icons";
import { Section, Row, Field, PasswordInput, Pill, Toggle } from "./primitives";
import { tt, type Lang } from "./i18n";

function describeDevice(): string {
  if (typeof navigator === "undefined") return "Acest dispozitiv";
  const ua = navigator.userAgent;
  const os = /Mac/.test(ua) ? "macOS" : /Windows/.test(ua) ? "Windows" : /iPhone|iPad/.test(ua) ? "iOS" : /Android/.test(ua) ? "Android" : "SO necunoscut";
  const browser = /Edg\//.test(ua) ? "Edge" : /Chrome\//.test(ua) ? "Chrome" : /Safari\//.test(ua) ? "Safari" : /Firefox\//.test(ua) ? "Firefox" : "Browser";
  return `${os} · ${browser}`;
}

export function SecurityPage({ toast, lang }: { toast: (m: string) => void; lang: Lang }) {
  const [current, setCurrent] = React.useState("");
  const [next, setNext] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  const updatePassword = async () => {
    if (!current || !next) return toast(tt(lang, "Fill in both password fields", "Completează ambele câmpuri pentru parolă"));
    if (next !== confirm) return toast(tt(lang, "New passwords don't match", "Parolele noi nu coincid"));
    setSaving(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: current, newPassword: next }),
      });
      const data = await res.json();
      if (!res.ok) return toast(data.error || tt(lang, "Failed to update password", "Actualizarea parolei a eșuat"));
      setCurrent("");
      setNext("");
      setConfirm("");
      toast(tt(lang, "Password updated", "Parolă actualizată"));
    } catch {
      toast(tt(lang, "Failed to update password", "Actualizarea parolei a eșuat"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page narrow view-enter">
      <div className="page-head">
        <div className="kicker">// {tt(lang, "Account", "Cont")}</div>
        <h1 className="page-title">{tt(lang, "Security", "Securitate")}</h1>
        <p className="page-sub">{tt(lang, "Manage your password, two-factor authentication, and the devices signed in to your account.", "Gestionează parola, autentificarea în doi factori și dispozitivele conectate la contul tău.")}</p>
      </div>

      <Section kicker="01" title={tt(lang, "Password", "Parolă")}>
        <div className="card">
          <div className="card-pad">
            <Field label={tt(lang, "Current password", "Parola actuală")}>
              <PasswordInput value={current} onChange={setCurrent} placeholder="••••••••••" />
            </Field>
            <div className="f2">
              <Field label={tt(lang, "New password", "Parolă nouă")} hint={tt(lang, "At least 10 characters.", "Cel puțin 10 caractere.")}>
                <PasswordInput value={next} onChange={setNext} placeholder={tt(lang, "New password", "Parolă nouă")} />
              </Field>
              <Field label={tt(lang, "Confirm new password", "Confirmă parola nouă")}>
                <PasswordInput value={confirm} onChange={setConfirm} placeholder={tt(lang, "Repeat password", "Repetă parola")} />
              </Field>
            </div>
          </div>
          <div className="row" style={{ justifyContent: "flex-end" }}>
            <button className="b b-primary" disabled={saving} onClick={updatePassword}>
              {saving ? tt(lang, "Updating…", "Se actualizează…") : tt(lang, "Update password", "Actualizează parola")}
            </button>
          </div>
        </div>
      </Section>

      <Section kicker="02" title={tt(lang, "Two-factor authentication", "Autentificare în doi factori")}>
        <div className="card">
          <Row
            icon={<Icons.lock size={19} />}
            title={
              <span style={{ display: "flex", alignItems: "center", gap: 9 }}>
                {tt(lang, "Authenticator app", "Aplicație de autentificare")} <Pill kind="mute">{tt(lang, "Coming soon", "În curând")}</Pill>
              </span>
            }
            desc={tt(lang, "Add a one-time code from an authenticator app when you sign in on a new device.", "Adaugă un cod unic dintr-o aplicație de autentificare când te conectezi de pe un dispozitiv nou.")}
          >
            <Toggle on={false} onChange={() => toast(tt(lang, "Two-factor authentication is coming soon", "Autentificarea în doi factori va fi disponibilă în curând"))} disabled />
          </Row>
        </div>
      </Section>

      <Section kicker="03" title={tt(lang, "Active sessions", "Sesiuni active")}>
        <div className="list">
          <div className="lrow">
            <div className="itile ok">
              <Icons.device size={19} />
            </div>
            <div className="lcell grow">
              <div className="lc-h" style={{ display: "flex", alignItems: "center", gap: 9 }}>
                {tt(lang, "This device", "Acest dispozitiv")}{" "}
                <Pill kind="ok" dot>
                  {tt(lang, "Active now", "Activ acum")}
                </Pill>
              </div>
              <div className="lc-s">{describeDevice()}</div>
            </div>
          </div>
        </div>
        <p style={{ fontSize: 12.5, color: "var(--text-3)", marginTop: 10 }}>
          {tt(lang, "insixlive doesn't track sign-ins from other devices yet — your session is a single secure cookie that expires after 15 minutes of inactivity.", "insixlive nu urmărește încă autentificările de pe alte dispozitive — sesiunea ta este un singur cookie securizat care expiră după 15 minute de inactivitate.")}
        </p>
      </Section>
    </div>
  );
}
