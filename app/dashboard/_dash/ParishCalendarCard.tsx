"use client";
import { useState } from "react";
import { Icons } from "./icons";
import { Pill, Row } from "./primitives";
import { tt, type Lang } from "./i18n";

export function ParishCalendarCard({
  siteId,
  siteName,
  blobConnected,
  lang,
}: {
  siteId: string;
  siteName: string;
  blobConnected: boolean;
  lang: Lang;
}) {
  const [checking, setChecking] = useState(false);
  const [resending, setResending] = useState(false);
  const [connected, setConnected] = useState(blobConnected);
  const [message, setMessage] = useState<string | null>(null);

  const checkNow = async () => {
    setChecking(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/parish-calendar/${siteId}/verify`, { method: "POST" });
      const data = await res.json();
      setConnected(!!data.connected);
      setMessage(
        data.connected
          ? tt(lang, "Connected — admin login now works.", "Conectat — autentificarea adminului funcționează acum.")
          : tt(lang, "Not connected yet. Finish the Storage step in Vercel, then check again.", "Încă neconectat. Termină pasul Storage din Vercel, apoi verifică din nou.")
      );
    } catch {
      setMessage(tt(lang, "Could not check right now. Try again in a moment.", "Nu am putut verifica acum. Încearcă din nou peste puțin timp."));
    } finally {
      setChecking(false);
    }
  };

  const resend = async () => {
    setResending(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/parish-calendar/${siteId}/resend-credentials`, { method: "POST" });
      setMessage(res.ok ? tt(lang, "New credentials sent to the admin email on file.", "Credențiale noi trimise pe adresa de email a adminului.") : tt(lang, "Could not resend credentials. Try again in a moment.", "Nu am putut retrimite credențialele. Încearcă din nou peste puțin timp."));
    } catch {
      setMessage(tt(lang, "Could not resend credentials. Try again in a moment.", "Nu am putut retrimite credențialele. Încearcă din nou peste puțin timp."));
    } finally {
      setResending(false);
    }
  };

  return (
    <Row
      icon={<Icons.clock size={16} />}
      title={
        <>
          {siteName} — {tt(lang, "Editable weekly calendar", "Calendar săptămânal editabil")}{" "}
          {connected ? <Pill kind="ok" dot>{tt(lang, "Connected", "Conectat")}</Pill> : <Pill kind="warn" dot>{tt(lang, "Manual setup needed", "Configurare manuală necesară")}</Pill>}
        </>
      }
      desc={
        <>
          {connected
            ? tt(lang, "Storage is connected — the admin can log in and update the schedule without a redeploy.", "Storage este conectat — adminul se poate autentifica și actualiza programul fără o nouă publicare.")
            : tt(lang, "Connect a Blob store to this site's Vercel project to activate admin login. Setup steps were emailed when the site was created.", "Conectează un Blob store la proiectul Vercel al acestui site pentru a activa autentificarea adminului. Pașii de configurare au fost trimiși prin email la crearea site-ului.")}
          {message && <div style={{ marginTop: 6, color: "var(--text-3)" }}>{message}</div>}
        </>
      }
    >
      <div style={{ display: "flex", gap: 8 }}>
        <button className="b b-ghost b-sm" onClick={checkNow} disabled={checking}>
          {checking ? tt(lang, "Checking…", "Se verifică…") : tt(lang, "Check now", "Verifică acum")}
        </button>
        <button className="b b-primary b-sm" onClick={resend} disabled={resending}>
          {resending ? tt(lang, "Sending…", "Se trimite…") : tt(lang, "Resend credentials", "Retrimite credențialele")}
        </button>
      </div>
    </Row>
  );
}
