"use client";
import React from "react";
import { Icons } from "./icons";
import type { PageId } from "./types";
import { tt, type Lang } from "./i18n";

function navGroups(lang: Lang): { grp: string; items: { id: PageId; label: string; icon: React.ComponentType<{ size?: number }>; badge?: string; dot?: boolean }[] }[] {
  return [
    {
      grp: tt(lang, "Workspace", "Spațiu de lucru"),
      items: [
        { id: "overview", label: tt(lang, "Overview", "Prezentare"), icon: Icons.grid },
        { id: "analytics", label: tt(lang, "Analytics", "Statistici"), icon: Icons.chart },
        { id: "domains", label: tt(lang, "Domains", "Domenii"), icon: Icons.globe },
      ],
    },
    {
      grp: tt(lang, "Account", "Cont"),
      items: [
        { id: "profile", label: tt(lang, "Profile", "Profil"), icon: Icons.user },
        { id: "security", label: tt(lang, "Security", "Securitate"), icon: Icons.shield },
        { id: "connected", label: tt(lang, "Connected accounts", "Conturi conectate"), icon: Icons.plug },
        { id: "billing", label: tt(lang, "Billing", "Facturare"), icon: Icons.card },
        { id: "notifications", label: tt(lang, "Notifications", "Notificări"), icon: Icons.bell },
      ],
    },
  ];
}

export function Sidebar({
  page,
  go,
  open,
  close,
  editsLeft,
  openBuy,
  siteCount,
  domainCount,
  lang,
}: {
  page: PageId;
  go: (p: PageId) => void;
  open: boolean;
  close: () => void;
  editsLeft: number;
  openBuy: () => void;
  siteCount: number;
  domainCount: number;
  lang: Lang;
}) {
  const badges: Partial<Record<PageId, string>> = { overview: String(siteCount), domains: String(domainCount) };
  return (
    <nav className={"nav" + (open ? " open" : "")}>
      <div className="nav-brand">
        <div className="brand-badge">6</div>
        <div className="brand-word">
          in<span className="mid">six</span>live
        </div>
      </div>
      <div className="nav-scroll">
        {navGroups(lang).map((g) => (
          <div className="nav-grp" key={g.grp}>
            <div className="nav-grp-h">{g.grp}</div>
            {g.items.map((it) => {
              const Ic = it.icon;
              const badge = badges[it.id];
              return (
                <button
                  key={it.id}
                  className={"nav-item" + (page === it.id ? " on" : "")}
                  onClick={() => {
                    go(it.id);
                    close();
                  }}
                >
                  <Ic />
                  {it.label}
                  {badge && <span className="ni-badge">{badge}</span>}
                </button>
              );
            })}
          </div>
        ))}
      </div>
      <div className="nav-foot">
        <div className="plan-card">
          <div className="pc-k">{tt(lang, "Edit credits", "Credite modificări")}</div>
          <div className="pc-row">
            <div className="pc-h">{editsLeft} {tt(lang, "available", "disponibile")}</div>
          </div>
          <div className="pc-d" style={{ marginTop: 6 }}>
            {tt(lang, "Every edit is paid", "Fiecare modificare e plătită")} · <b>€10.00</b> {tt(lang, "each", "fiecare")}
          </div>
          <button className="b b-primary b-sm" style={{ width: "100%", marginTop: 12 }} onClick={openBuy}>
            <Icons.plus size={14} />
            {tt(lang, "Buy edits", "Cumpără modificări")}
          </button>
        </div>
      </div>
    </nav>
  );
}
