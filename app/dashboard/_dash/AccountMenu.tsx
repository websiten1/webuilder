"use client";
import React from "react";
import { Icons } from "./icons";
import { Avatar } from "./primitives";
import type { PageId } from "./types";
import { tt, type Lang } from "./i18n";

export function AccountMenu({
  go,
  close,
  onLogout,
  email,
  initials,
  planLabel,
  lang,
}: {
  go: (p: PageId) => void;
  close: () => void;
  onLogout: () => void;
  email: string;
  initials: string;
  planLabel: string;
  lang: Lang;
}) {
  React.useEffect(() => {
    const h = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (!t.closest(".menu") && !t.closest(".acct-btn")) close();
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [close]);

  const item = (Ic: React.ComponentType<{ size?: number }>, label: string, onClick: () => void, right?: React.ReactNode) => (
    <button className="menu-item" onClick={onClick}>
      <Ic />
      {label}
      {right}
    </button>
  );

  return (
    <div className="menu">
      <div className="menu-head">
        <Avatar initials={initials} size={42} />
        <div style={{ minWidth: 0 }}>
          <div className="mh-name">{email}</div>
          <div className="mh-mail">{email}</div>
        </div>
        <span className="menu-plan">{planLabel}</span>
      </div>
      <div className="menu-sect">
        {item(Icons.user, tt(lang, "Profile", "Profil"), () => { go("profile"); close(); })}
        {item(Icons.shield, tt(lang, "Security", "Securitate"), () => { go("security"); close(); })}
        {item(Icons.plug, tt(lang, "Connected accounts", "Conturi conectate"), () => { go("connected"); close(); }, <span className="mi-r">Vercel</span>)}
        {item(Icons.card, tt(lang, "Billing", "Facturare"), () => { go("billing"); close(); })}
      </div>
      <div className="menu-sect">
        {item(Icons.question, tt(lang, "Help & Support", "Ajutor și asistență"), () => { window.location.href = "mailto:support@insixlive.com"; close(); })}
        {item(Icons.ext, "insixlive.com", () => { window.open("https://insixlive.com", "_blank"); close(); })}
      </div>
      <div className="menu-sect">
        <button className="menu-item danger" onClick={onLogout}>
          <Icons.logout />
          {tt(lang, "Log out", "Deconectare")}
        </button>
      </div>
    </div>
  );
}
