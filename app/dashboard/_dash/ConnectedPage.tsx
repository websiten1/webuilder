"use client";
import React from "react";
import { Icons } from "./icons";
import { Section, Row, Pill, Callout } from "./primitives";
import type { VercelConnection } from "./types";
import { tt, type Lang } from "./i18n";

export function ConnectedPage({
  vercel,
  loading,
  onDisconnect,
  toast,
  lang,
}: {
  vercel: VercelConnection | null;
  loading: boolean;
  onDisconnect: () => void;
  toast: (m: string) => void;
  lang: Lang;
}) {
  const connected = !!vercel?.connected;
  const since = vercel?.since ? new Date(vercel.since).toLocaleDateString("ro-RO", { day: "numeric", month: "short", year: "numeric" }) : null;

  return (
    <div className="page narrow view-enter">
      <div className="page-head">
        <div className="kicker">// {tt(lang, "Account", "Cont")}</div>
        <h1 className="page-title">{tt(lang, "Connected accounts", "Conturi conectate")}</h1>
        <p className="page-sub">{tt(lang, "insixlive deploys each site straight to your own hosting. Connect the accounts it needs to publish on your behalf.", "insixlive publică fiecare site direct pe propria ta găzduire. Conectează conturile necesare pentru a publica în numele tău.")}</p>
      </div>

      <div className="card">
        <div className="conn">
          <div className="c-logo" style={{ color: "#000" }}>
            <Icons.vercel size={26} />
          </div>
          <div className="c-body">
            <div className="c-h">
              Vercel{" "}
              {loading ? (
                <Pill kind="mute">{tt(lang, "Checking…", "Se verifică…")}</Pill>
              ) : connected ? (
                <Pill kind="ok" dot>
                  {tt(lang, "Connected", "Conectat")}
                </Pill>
              ) : (
                <Pill kind="mute">{tt(lang, "Not connected", "Neconectat")}</Pill>
              )}
            </div>
            {connected ? (
              <div className="c-d">
                {tt(lang, "Linked to", "Conectat la")} <b>{vercel?.account ?? tt(lang, "your Vercel account", "contul tău Vercel")}</b>
                {vercel?.email ? ` · ${vercel.email}` : ""}
              </div>
            ) : (
              <div className="c-d">{tt(lang, "New sites will fall back to insixlive's shared hosting.", "Site-urile noi vor folosi găzduirea partajată insixlive.")}</div>
            )}
          </div>
          {connected ? (
            <button className="b b-quiet" onClick={onDisconnect}>
              {tt(lang, "Disconnect", "Deconectează")}
            </button>
          ) : (
            <a className="b b-primary" href="/api/auth/vercel/authorize">
              <Icons.link size={15} />
              {tt(lang, "Connect", "Conectează")}
            </a>
          )}
        </div>
        {connected && (
          <>
            <div className="lrow head">
              <div className="lcell grow">{tt(lang, "Connection", "Conexiune")}</div>
              <div className="lcell">{tt(lang, "Team", "Echipă")}</div>
              <div className="lcell">{tt(lang, "Since", "De la")}</div>
            </div>
            <div className="lrow">
              <div className="lcell grow">
                <div className="lc-h">{vercel?.account ?? "—"}</div>
                {vercel?.email && <div className="lc-s">{vercel.email}</div>}
              </div>
              <div className="lcell" style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>
                {vercel?.teamId ?? tt(lang, "Personal", "Personal")}
              </div>
              <div className="lcell" style={{ whiteSpace: "nowrap" }}>
                {since ?? "—"}
              </div>
            </div>
            <div className="row" style={{ justifyContent: "flex-end" }}>
              <a className="b b-ghost b-sm" href="/api/auth/vercel/authorize">
                <Icons.refresh size={15} />
                {tt(lang, "Reconnect", "Reconectează")}
              </a>
            </div>
          </>
        )}
      </div>

      {!connected && !loading && (
        <div style={{ marginTop: 14 }}>
          <Callout kind="warn" icon={<Icons.alert />} title={tt(lang, "Sites will use shared hosting", "Site-urile vor folosi găzduire partajată")}>
            {tt(lang, "Without your own Vercel connection, new sites deploy to insixlive's shared account and you won't have direct dashboard access. Connect any time.", "Fără propria ta conexiune Vercel, site-urile noi se publică pe contul partajat insixlive și nu vei avea acces direct la panou. Te poți conecta oricând.")}
          </Callout>
        </div>
      )}

      <Section kicker="02" title={tt(lang, "Available integrations", "Integrări disponibile")}>
        <div className="card">
          <Row icon={<Icons.stripe size={19} />} title="Stripe" desc={tt(lang, "Already handling your one-time payments and invoices.", "Gestionează deja plățile unice și facturile tale.")}>
            <Pill kind="ok" dot>
              {tt(lang, "Active", "Activ")}
            </Pill>
          </Row>
          <Row icon={<Icons.mail size={19} />} title={tt(lang, "Custom SMTP", "SMTP personalizat")} desc={tt(lang, "Send transactional email from your own domain.", "Trimite email-uri tranzacționale de pe propriul tău domeniu.")}>
            <button className="b b-quiet b-sm" onClick={() => toast(tt(lang, "Coming soon", "În curând"))}>
              {tt(lang, "Soon", "În curând")}
            </button>
          </Row>
          <Row icon={<Icons.globe size={19} />} title="Cloudflare" desc={tt(lang, "Bring your own DNS and CDN for connected domains.", "Adu propriul DNS și CDN pentru domeniile conectate.")}>
            <button className="b b-quiet b-sm" onClick={() => toast(tt(lang, "Coming soon", "În curând"))}>
              {tt(lang, "Soon", "În curând")}
            </button>
          </Row>
        </div>
      </Section>
    </div>
  );
}
