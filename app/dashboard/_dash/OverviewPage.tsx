"use client";
import React, { useEffect } from "react";
import { Icons } from "./icons";
import { Section, Pill, LiveBadge } from "./primitives";
import { ParishCalendarCard } from "./ParishCalendarCard";
import type { DashSite, PageId } from "./types";
import { tt, type Lang } from "./i18n";

function SitePreview({ site }: { site: DashSite }) {
  return (
    <div className={"site-prev" + (site.status === "draft" ? " draft" : "")}>
      <div className="pv-bar">
        <i></i>
        <i></i>
        <i></i>
        <span className="pv-url">{site.domain || site.vercel}</span>
      </div>
      <div className="pv-body">
        <div className="pv-h" style={{ background: `linear-gradient(90deg, ${site.accent}, transparent)` }}></div>
        <div className="pv-l s"></div>
        <div className="pv-l m"></div>
        <div className="pv-row">
          <div className="pv-chip acc"></div>
          <div className="pv-chip"></div>
        </div>
        <div className="pv-l xs" style={{ marginTop: "auto" }}></div>
      </div>
    </div>
  );
}

export function SiteCard({
  site,
  openBuy,
  onOpen,
  onDomain,
  lang,
}: {
  site: DashSite;
  openBuy: (site: DashSite) => void;
  onOpen: () => void;
  onDomain: () => void;
  lang: Lang;
}) {
  return (
    <div className="site" onClick={onOpen}>
      <SitePreview site={site} />
      <div className="site-meta">
        <div className="site-fav" style={{ background: site.color }}>
          {site.fav}
        </div>
        <div className="site-info">
          <div className="site-name">
            {site.name}
            {site.status === "live" ? <LiveBadge lang={lang} /> : <Pill kind="mute" dot>{tt(lang, "Draft", "Ciornă")}</Pill>}
          </div>
          <div className="site-dom">{site.domain || site.vercel}</div>
        </div>
        <button
          className="site-menu"
          onClick={(e) => {
            e.stopPropagation();
            onDomain();
          }}
        >
          <Icons.dots size={18} />
        </button>
      </div>
      <div className="site-foot">
        <span className="sf-edits">
          <Icons.bolt size={13} />
          <b>{site.edits}</b> {tt(lang, `edit${site.edits === 1 ? "" : "s"} left`, `${site.edits === 1 ? "modificare" : "modificări"} rămase`)}
        </span>
        <button
          className="b b-ghost b-sm sf-buy"
          onClick={(e) => {
            e.stopPropagation();
            openBuy(site);
          }}
        >
          {tt(lang, "Buy edits", "Cumpără modificări")}
        </button>
      </div>
    </div>
  );
}

export function OverviewPage({
  sites,
  editsLeft,
  openBuy,
  go,
  onOpenSite,
  onDomain,
  lifetimeSpend,
  lang,
}: {
  sites: DashSite[];
  editsLeft: number;
  openBuy: (site: DashSite | null) => void;
  go: (p: PageId) => void;
  onOpenSite: (site: DashSite) => void;
  onDomain: (site: DashSite) => void;
  lifetimeSpend: number;
  lang: Lang;
}) {
  const live = sites.filter((s) => s.status === "live").length;
  const drafts = sites.length - live;
  const domains = sites.filter((s) => s.domain).length;
  const calendarSites = sites.filter((s) => s.calendarBlobConnected !== null);

  useEffect(() => {
    // #region agent log
    const statsEl = document.querySelector(".stats") as HTMLElement | null;
    const heroEl = document.querySelector(".hero-panel") as HTMLElement | null;
    const firstSiteEl = document.querySelector(".site") as HTMLElement | null;
    const siteFootEl = document.querySelector(".site-foot") as HTMLElement | null;
    const buyBtnEl = document.querySelector(".sf-buy") as HTMLElement | null;
    fetch('http://127.0.0.1:7469/ingest/a117af1e-34fc-4785-aeae-36ebe2d13be6',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'dfd4e1'},body:JSON.stringify({sessionId:'dfd4e1',runId:`mobile-overview-${Date.now()}`,hypothesisId:'H12',location:'app/dashboard/_dash/OverviewPage.tsx:116',message:'overview mobile layout metrics',data:{innerWidth:window.innerWidth,docScrollWidth:document.documentElement.scrollWidth,statsGridTemplate:statsEl?getComputedStyle(statsEl).gridTemplateColumns:null,heroPadding:heroEl?getComputedStyle(heroEl).padding:null,firstSiteWidth:firstSiteEl?Math.round(firstSiteEl.getBoundingClientRect().width):null,siteFootWidth:siteFootEl?Math.round(siteFootEl.getBoundingClientRect().width):null,buyButtonWidth:buyBtnEl?Math.round(buyBtnEl.getBoundingClientRect().width):null,sitesCount:sites.length},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
  }, [sites.length]);

  return (
    <div className="page view-enter">
      <div className="page-head flex hero-panel">
        <div>
          <div className="kicker">// {tt(lang, "Workspace", "Spațiu de lucru")}</div>
          <h1 className="page-title">{tt(lang, "Your sites", "Site-urile tale")}</h1>
          <p className="page-sub">
            {tt(lang, "Every site you've generated with insixlive — deployed to your own Vercel, yours to keep forever.", "Fiecare site generat cu insixlive — publicat pe propriul tău Vercel, al tău pentru totdeauna.")}
          </p>
        </div>
        <a className="b b-primary b-lg" href="/generate">
          <Icons.plus size={16} />
          {tt(lang, "New site", "Site nou")}
        </a>
      </div>

      <div className="stats stagger">
        <div className="stat">
          <div className="s-k">
            <Icons.layers size={13} />
            {tt(lang, "Total sites", "Total site-uri")}
          </div>
          <div className="s-v">{sites.length}</div>
          <div className="s-d">
            <b>{live}</b> {tt(lang, "live", "online")} · {drafts} {tt(lang, "draft", "ciornă")}
          </div>
        </div>
        <div className="stat">
          <div className="s-k">
            <Icons.bolt size={13} />
            {tt(lang, "Edit credits", "Credite modificări")}
          </div>
          <div className="s-v">{editsLeft}</div>
          <div className="s-d">
            {tt(lang, "Use on any site", "Folosește pe orice site")} ·{" "}
            <a className="b-link" style={{ fontSize: 12 }} onClick={() => openBuy(null)}>
              {tt(lang, "Buy more", "Cumpără mai multe")}
            </a>
          </div>
        </div>
        <div className="stat">
          <div className="s-k">
            <Icons.globe size={13} />
            {tt(lang, "Custom domains", "Domenii proprii")}
          </div>
          <div className="s-v">
            {domains}
            <small>/{sites.length}</small>
          </div>
          <div className="s-d">
            <a className="b-link" style={{ fontSize: 12 }} onClick={() => go("domains")}>
              {tt(lang, "Manage domains →", "Gestionează domeniile →")}
            </a>
          </div>
        </div>
        <div className="stat accent">
          <div className="s-k">
            <Icons.receipt size={13} />
            {tt(lang, "Lifetime spend", "Cheltuit total")}
          </div>
          <div className="s-v">€{lifetimeSpend.toFixed(2)}</div>
          <div className="s-d">{tt(lang, "One-time · no subscriptions", "Plată unică · fără abonamente")}</div>
        </div>
      </div>

      <Section kicker="04" title={tt(lang, "All sites", "Toate site-urile")} action={<button className="b-link" onClick={() => go("analytics")}>{tt(lang, "View analytics →", "Vezi statisticile →")}</button>}>
        {sites.length === 0 ? (
          <div className="empty">
            <div className="em-ic">
              <Icons.rocket size={26} />
            </div>
            <div className="em-h">{tt(lang, "No websites yet", "Niciun site încă")}</div>
            <div className="em-d">{tt(lang, "Create your first AI-generated website in around six minutes, deployed live on Vercel.", "Creează-ți primul site generat de AI în aproximativ șase minute, publicat live pe Vercel.")}</div>
            <a className="b b-primary" href="/generate">
              <Icons.plus size={15} />
              {tt(lang, "Generate your first website", "Generează-ți primul site")}
            </a>
          </div>
        ) : (
          <div className="sites">
            {sites.map((site) => (
              <SiteCard key={site.id} site={site} openBuy={openBuy} onOpen={() => onOpenSite(site)} onDomain={() => onDomain(site)} lang={lang} />
            ))}
            <a className="site-new" href="/generate">
              <div className="sn-ic">
                <Icons.plus size={22} />
              </div>
              <div className="sn-h">{tt(lang, "Generate a new site", "Generează un site nou")}</div>
              <div className="sn-d">{tt(lang, "From €49.99 · one-time", "De la 49,99 € · plată unică")}</div>
            </a>
          </div>
        )}
      </Section>

      {calendarSites.length > 0 && (
        <Section kicker="05" title={tt(lang, "Editable weekly calendars", "Calendare săptămânale editabile")}>
          <div className="list">
            {calendarSites.map((s) => (
              <ParishCalendarCard key={s.id} siteId={s.id} siteName={s.name} blobConnected={!!s.calendarBlobConnected} lang={lang} />
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}
