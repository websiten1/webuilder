"use client";
import React from "react";
import { Icons } from "./icons";
import { Section, Pill, LiveBadge } from "./primitives";
import { ParishCalendarCard } from "./ParishCalendarCard";
import type { DashSite, PageId } from "./types";

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
}: {
  site: DashSite;
  openBuy: (site: DashSite) => void;
  onOpen: () => void;
  onDomain: () => void;
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
            {site.status === "live" ? <LiveBadge /> : <Pill kind="mute" dot>Draft</Pill>}
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
          <b>{site.edits}</b> edit{site.edits === 1 ? "" : "s"} left
        </span>
        <button
          className="b b-ghost b-sm sf-buy"
          onClick={(e) => {
            e.stopPropagation();
            openBuy(site);
          }}
        >
          Buy edits
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
}: {
  sites: DashSite[];
  editsLeft: number;
  openBuy: (site: DashSite | null) => void;
  go: (p: PageId) => void;
  onOpenSite: (site: DashSite) => void;
  onDomain: (site: DashSite) => void;
  lifetimeSpend: number;
}) {
  const live = sites.filter((s) => s.status === "live").length;
  const drafts = sites.length - live;
  const domains = sites.filter((s) => s.domain).length;
  const calendarSites = sites.filter((s) => s.calendarBlobConnected !== null);
  return (
    <div className="page view-enter">
      <div className="page-head flex">
        <div>
          <div className="kicker">// Workspace</div>
          <h1 className="page-title">Your sites</h1>
          <p className="page-sub">
            Every site you&apos;ve generated with insixlive — deployed to your own Vercel, yours to keep forever.
          </p>
        </div>
        <a className="b b-primary b-lg" href="/generate">
          <Icons.plus size={16} />
          New site
        </a>
      </div>

      <div className="stats stagger">
        <div className="stat">
          <div className="s-k">
            <Icons.layers size={13} />
            Total sites
          </div>
          <div className="s-v">{sites.length}</div>
          <div className="s-d">
            <b>{live}</b> live · {drafts} draft
          </div>
        </div>
        <div className="stat">
          <div className="s-k">
            <Icons.bolt size={13} />
            Edit credits
          </div>
          <div className="s-v">{editsLeft}</div>
          <div className="s-d">
            Use on any site ·{" "}
            <a className="b-link" style={{ fontSize: 12 }} onClick={() => openBuy(null)}>
              Buy more
            </a>
          </div>
        </div>
        <div className="stat">
          <div className="s-k">
            <Icons.globe size={13} />
            Custom domains
          </div>
          <div className="s-v">
            {domains}
            <small>/{sites.length}</small>
          </div>
          <div className="s-d">
            <a className="b-link" style={{ fontSize: 12 }} onClick={() => go("domains")}>
              Manage domains →
            </a>
          </div>
        </div>
        <div className="stat accent">
          <div className="s-k">
            <Icons.receipt size={13} />
            Lifetime spend
          </div>
          <div className="s-v">€{lifetimeSpend.toFixed(2)}</div>
          <div className="s-d">One-time · no subscriptions</div>
        </div>
      </div>

      <Section kicker="04" title="All sites" action={<button className="b-link" onClick={() => go("analytics")}>View analytics →</button>}>
        {sites.length === 0 ? (
          <div className="empty">
            <div className="em-ic">
              <Icons.rocket size={26} />
            </div>
            <div className="em-h">No websites yet</div>
            <div className="em-d">Create your first AI-generated website in around six minutes, deployed live on Vercel.</div>
            <a className="b b-primary" href="/generate">
              <Icons.plus size={15} />
              Generate your first website
            </a>
          </div>
        ) : (
          <div className="sites">
            {sites.map((site) => (
              <SiteCard key={site.id} site={site} openBuy={openBuy} onOpen={() => onOpenSite(site)} onDomain={() => onDomain(site)} />
            ))}
            <a className="site-new" href="/generate">
              <div className="sn-ic">
                <Icons.plus size={22} />
              </div>
              <div className="sn-h">Generate a new site</div>
              <div className="sn-d">From €49.99 · one-time</div>
            </a>
          </div>
        )}
      </Section>

      {calendarSites.length > 0 && (
        <Section kicker="05" title="Editable weekly calendars">
          <div className="list">
            {calendarSites.map((s) => (
              <ParishCalendarCard key={s.id} siteId={s.id} siteName={s.name} blobConnected={!!s.calendarBlobConnected} />
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}
