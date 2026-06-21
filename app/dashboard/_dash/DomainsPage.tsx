"use client";
import React from "react";
import { Icons } from "./icons";
import { Pill, Callout } from "./primitives";
import type { DashSite } from "./types";
import { tt, type Lang } from "./i18n";

function StatusPill({ state, lang }: { state: "checking" | "ok" | "pending"; lang: Lang }) {
  if (state === "checking") return <Pill kind="mute">{tt(lang, "Checking…", "Se verifică…")}</Pill>;
  if (state === "ok")
    return (
      <Pill kind="ok" dot>
        {tt(lang, "Active", "Activ")}
      </Pill>
    );
  return (
    <Pill kind="warn" dot>
      {tt(lang, "Pending", "În așteptare")}
    </Pill>
  );
}

export function DomainsPage({ sites, toast, lang }: { sites: DashSite[]; toast: (m: string) => void; lang: Lang }) {
  const domained = sites.filter((s) => s.domain);
  const [status, setStatus] = React.useState<Record<string, "checking" | "ok" | "pending">>({});

  React.useEffect(() => {
    domained.forEach((s) => {
      if (!s.domain) return;
      setStatus((p) => ({ ...p, [s.domain as string]: "checking" }));
      fetch(`/api/domains/check-status?domain=${encodeURIComponent(s.domain)}`)
        .then((r) => r.json())
        .then((d) => setStatus((p) => ({ ...p, [s.domain as string]: d.configured ? "ok" : "pending" })))
        .catch(() => setStatus((p) => ({ ...p, [s.domain as string]: "pending" })));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sites.length]);

  return (
    <div className="page view-enter">
      <div className="page-head flex">
        <div>
          <div className="kicker">// {tt(lang, "Workspace", "Spațiu de lucru")}</div>
          <h1 className="page-title">{tt(lang, "Domains", "Domenii")}</h1>
          <p className="page-sub">{tt(lang, "Every custom domain across your sites, in one place — with live DNS status.", "Fiecare domeniu propriu pentru site-urile tale, într-un singur loc — cu status DNS live.")}</p>
        </div>
        <button className="b b-primary" onClick={() => toast(tt(lang, "Open a site's domain page to buy or connect a domain", "Deschide pagina de domeniu a unui site pentru a cumpăra sau conecta un domeniu"))}>
          <Icons.search size={15} />
          {tt(lang, "Buy a domain", "Cumpără un domeniu")}
        </button>
      </div>

      {domained.length === 0 ? (
        <div className="empty">
          <div className="em-ic">
            <Icons.globe size={26} />
          </div>
          <div className="em-h">{tt(lang, "No custom domains yet", "Niciun domeniu propriu încă")}</div>
          <div className="em-d">{tt(lang, "Connect a custom domain from any site's page, or launch on a free .vercel.app address for now.", "Conectează un domeniu propriu din pagina oricărui site, sau lansează pe o adresă gratuită .vercel.app pentru acum.")}</div>
        </div>
      ) : (
        <div className="list">
          <div className="lrow head">
            <div className="lcell grow">{tt(lang, "Domain", "Domeniu")}</div>
            <div className="lcell" style={{ flex: "0 0 120px" }}>
              DNS
            </div>
            <div className="lcell" style={{ flex: "0 0 110px" }}>
              SSL
            </div>
            <div className="lcell" style={{ flex: "0 0 40px" }}></div>
          </div>
          {domained.map((s) => {
            const st = (s.domain && status[s.domain]) || "checking";
            return (
              <div className="lrow" key={s.id}>
                <div className="lcell grow">
                  <div className="lc-h" style={{ display: "flex", alignItems: "center", gap: 9 }}>
                    <Icons.globe size={16} style={{ color: "var(--text-3)" }} />
                    {s.domain}
                    <a className="b-link" style={{ fontSize: 12 }} href={`https://${s.domain}`} target="_blank" rel="noopener noreferrer">
                      <Icons.arrowUpRight size={13} />
                    </a>
                  </div>
                  <div className="lc-s">{s.name}</div>
                </div>
                <div className="lcell" style={{ flex: "0 0 120px" }}>
                  <StatusPill state={st} lang={lang} />
                </div>
                <div className="lcell" style={{ flex: "0 0 110px" }}>
                  <StatusPill state={st} lang={lang} />
                </div>
                <div className="lcell" style={{ flex: "0 0 40px" }}>
                  <button className="site-menu" onClick={() => toast(tt(lang, `Open ${s.name}'s domain settings to manage ${s.domain}`, `Deschide setările de domeniu ale lui ${s.name} pentru a gestiona ${s.domain}`))}>
                    <Icons.dots size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div style={{ marginTop: 14 }}>
        <Callout kind="info" icon={<Icons.question />} title={tt(lang, "Don't have a domain yet?", "Nu ai încă un domeniu?")}>
          {tt(lang, "You can launch on a free", "Poți lansa pe o adresă gratuită")} <span className="mono" style={{ color: "var(--text-2)" }}>.vercel.app</span> {tt(lang, "address and connect a custom domain whenever you're ready — from each site's domain page.", "și conectezi un domeniu propriu când ești pregătit — din pagina de domeniu a fiecărui site.")}
        </Callout>
      </div>
    </div>
  );
}
