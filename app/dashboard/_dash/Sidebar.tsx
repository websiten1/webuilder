"use client";
import React from "react";
import { Icons } from "./icons";
import type { PageId } from "./types";

const NAV: { grp: string; items: { id: PageId; label: string; icon: React.ComponentType<{ size?: number }>; badge?: string; dot?: boolean }[] }[] = [
  {
    grp: "Workspace",
    items: [
      { id: "overview", label: "Overview", icon: Icons.grid },
      { id: "analytics", label: "Analytics", icon: Icons.chart },
      { id: "domains", label: "Domains", icon: Icons.globe },
    ],
  },
  {
    grp: "Account",
    items: [
      { id: "profile", label: "Profile", icon: Icons.user },
      { id: "security", label: "Security", icon: Icons.shield },
      { id: "connected", label: "Connected accounts", icon: Icons.plug },
      { id: "billing", label: "Billing", icon: Icons.card },
      { id: "notifications", label: "Notifications", icon: Icons.bell },
    ],
  },
];

export function Sidebar({
  page,
  go,
  open,
  close,
  editsLeft,
  openBuy,
  siteCount,
  domainCount,
}: {
  page: PageId;
  go: (p: PageId) => void;
  open: boolean;
  close: () => void;
  editsLeft: number;
  openBuy: () => void;
  siteCount: number;
  domainCount: number;
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
        {NAV.map((g) => (
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
          <div className="pc-k">Edit credits</div>
          <div className="pc-row">
            <div className="pc-h">{editsLeft} available</div>
          </div>
          <div className="pc-d" style={{ marginTop: 6 }}>
            Every edit is paid · <b>€10.00</b> each
          </div>
          <button className="b b-primary b-sm" style={{ width: "100%", marginTop: 12 }} onClick={openBuy}>
            <Icons.plus size={14} />
            Buy edits
          </button>
        </div>
      </div>
    </nav>
  );
}
