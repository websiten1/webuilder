"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import "./dashboard.css";
import { Icons } from "./_dash/icons";
import { Avatar } from "./_dash/primitives";
import { Sidebar } from "./_dash/Sidebar";
import { AccountMenu } from "./_dash/AccountMenu";
import { OverviewPage } from "./_dash/OverviewPage";
import { ProfilePage } from "./_dash/ProfilePage";
import { SecurityPage } from "./_dash/SecurityPage";
import { ConnectedPage } from "./_dash/ConnectedPage";
import { BillingPage } from "./_dash/BillingPage";
import { DomainsPage } from "./_dash/DomainsPage";
import { NotificationsPage } from "./_dash/NotificationsPage";
import { AnalyticsPage } from "./_dash/AnalyticsPage";
import { BuyEditsModal } from "./_dash/BuyEditsModal";
import { DeleteModal } from "./_dash/DeleteModal";
import type { DashSite, Invoice, PageId, User, VercelConnection } from "./_dash/types";

type RawSite = {
  id: string; name: string; vercel_url: string; github_url: string | null;
  status: string; current_version: number; edit_count: number;
  custom_domain: string | null; pricing_tier: string | null;
  free_edits_remaining: number; total_edits_included: number; created_at: string;
  business_type: string | null;
  design_preferences: Record<string, unknown> | null;
  parish_calendar_blob_connected: boolean | null;
};

const BIZ_COLORS: Record<string, string> = {
  "Restaurant": "#b85c2c", "Dental Clinic": "#3a8a78", "Hair Salon": "#b2756a",
  "Fitness": "#ff4d1a", "Law Firm": "#15294a", "Real Estate": "#7d8a6e",
  "Medical Clinic": "#5c8b6e", "Tech Startup": "#a8ff5c", "Beauty/Spa": "#b97a6f",
  "Photography": "#7a2828", "E-commerce": "#0066CC", "Consulting": "#1a365d",
  "Marketing Agency": "#7c3aed", "Architecture": "#374151", "Accounting": "#065f46",
  "Plumbing": "#1e40af",
};

function colorFor(site: RawSite): string {
  const prefs = site.design_preferences as Record<string, unknown> | null;
  const design = prefs?.design as Record<string, unknown> | undefined;
  if (typeof design?.primaryColor === "string" && design.primaryColor) return design.primaryColor;
  return BIZ_COLORS[site.business_type ?? ""] ?? "#FF5A1F";
}

function favFor(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function relativeTime(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const days = Math.floor(ms / 86400000);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} week${Math.floor(days / 7) > 1 ? "s" : ""} ago`;
  return `${Math.floor(days / 30)} month${Math.floor(days / 30) > 1 ? "s" : ""} ago`;
}

function toDashSite(s: RawSite, i: number): DashSite {
  const color = colorFor(s);
  return {
    id: s.id,
    name: s.name,
    fav: favFor(s.name),
    color,
    status: s.status === "failed" ? "draft" : "live",
    domain: s.custom_domain,
    vercel: (s.vercel_url ?? "").replace("https://", ""),
    edits: s.free_edits_remaining ?? 0,
    updated: relativeTime(s.created_at),
    accent: color,
    weight: 0.5 + ((i * 37) % 100) / 100,
    createdAt: s.created_at,
    calendarBlobConnected: s.parish_calendar_blob_connected,
  };
}

const PAGE_META: Record<PageId, { grp: string; label: string }> = {
  overview: { grp: "Workspace", label: "Overview" },
  analytics: { grp: "Workspace", label: "Analytics" },
  domains: { grp: "Workspace", label: "Domains" },
  profile: { grp: "Account", label: "Profile" },
  security: { grp: "Account", label: "Security" },
  connected: { grp: "Account", label: "Connected accounts" },
  billing: { grp: "Account", label: "Billing" },
  notifications: { grp: "Account", label: "Notifications" },
};

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [sites, setSites] = useState<DashSite[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [lifetimeSpend, setLifetimeSpend] = useState(0);
  const [billingLoading, setBillingLoading] = useState(true);
  const [vercel, setVercel] = useState<VercelConnection | null>(null);
  const [vercelLoading, setVercelLoading] = useState(true);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState<PageId>("overview");
  const [menuOpen, setMenuOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [del, setDel] = useState(false);
  const [buy, setBuy] = useState<{ site: DashSite | null } | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const scrollRef = useRef<HTMLDivElement>(null);

  const toast = useCallback((m: string) => {
    setToastMsg(m);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(null), 2600);
  }, []);

  const go = useCallback((p: PageId) => {
    setPage(p);
    history.replaceState(null, "", "#" + p);
    scrollRef.current?.scrollTop && (scrollRef.current.scrollTop = 0);
  }, []);

  useEffect(() => {
    const h = (location.hash || "").replace("#", "") as PageId;
    if (PAGE_META[h]) setPage(h);

    (async () => {
      try {
        const r = await fetch("/api/auth/me");
        if (!r.ok) { router.push("/login"); return; }
        const d = await r.json();
        setUser(d.user);

        const sr = await fetch("/api/sites");
        if (sr.ok) {
          const raw: RawSite[] = (await sr.json()).sites ?? [];
          setSites(raw.map(toDashSite));
        }
      } catch {
        router.push("/login");
      } finally {
        setLoading(false);
      }
    })();

    fetch("/api/auth/vercel/connection")
      .then((r) => r.json())
      .then((d) => setVercel(d))
      .catch(() => setVercel({ connected: false, account: null, email: null, teamId: null, since: null }))
      .finally(() => setVercelLoading(false));

    fetch("/api/billing/history")
      .then((r) => r.json())
      .then((d) => { setInvoices(d.invoices ?? []); setLifetimeSpend(d.lifetimeSpend ?? 0); })
      .catch(() => {})
      .finally(() => setBillingLoading(false));
  }, [router]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  };

  const handleDisconnectVercel = async () => {
    await fetch("/api/auth/vercel/disconnect", { method: "POST" });
    setVercel({ connected: false, account: null, email: null, teamId: null, since: null });
    toast("Vercel disconnected");
  };

  const editsLeft = useMemo(() => sites.reduce((s, x) => s + x.edits, 0), [sites]);
  const initials = user?.email?.slice(0, 2).toUpperCase() ?? "??";
  const meta = PAGE_META[page];

  if (loading) {
    return (
      <div className="dash" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <style>{`@keyframes dspin { to { transform: rotate(360deg); } }`}</style>
        <div style={{ width: 28, height: 28, borderRadius: 14, border: "2px solid #e8e3d6", borderTopColor: "#FF5A1F", animation: "dspin .8s linear infinite" }} />
      </div>
    );
  }

  return (
    <div className="dash">
      <Sidebar
        page={page}
        go={go}
        open={navOpen}
        close={() => setNavOpen(false)}
        editsLeft={editsLeft}
        openBuy={() => setBuy({ site: null })}
        siteCount={sites.length}
        domainCount={sites.filter((s) => s.domain).length}
      />
      {navOpen && <div className="scrim" onClick={() => setNavOpen(false)}></div>}
      <div className="main">
        <header className="topbar">
          <button className="tb-icon nav-toggle" onClick={() => setNavOpen(true)}>
            <Icons.grid size={17} />
          </button>
          <div className="crumb">
            <span>{meta.grp}</span>
            <Icons.chevRight size={14} />
            <span className="c-now">{meta.label}</span>
          </div>
          <div className="tb-spacer"></div>
          <div className="tb-search" onClick={() => toast("Search coming soon")}>
            <Icons.search />
            <span>Search sites…</span>
            <span className="kbd">⌘K</span>
          </div>
          <button className="tb-icon" onClick={() => go("notifications")}>
            <Icons.bell />
          </button>
          <div style={{ position: "relative" }}>
            <button className="acct-btn" onClick={() => setMenuOpen((o) => !o)}>
              <Avatar initials={initials} size={32} />
              <Icons.chevDown />
            </button>
            {menuOpen && (
              <AccountMenu
                go={go}
                close={() => setMenuOpen(false)}
                onLogout={handleLogout}
                email={user?.email ?? ""}
                initials={initials}
                planLabel="PAYG"
              />
            )}
          </div>
        </header>
        <main className="scroll dotgrid" ref={scrollRef}>
          {page === "overview" && (
            <OverviewPage
              sites={sites}
              editsLeft={editsLeft}
              openBuy={(site) => setBuy({ site })}
              go={go}
              onOpenSite={(site) => window.open(`https://${site.domain ?? site.vercel}`, "_blank")}
              onDomain={(site) => router.push(`/domains/${site.id}`)}
              lifetimeSpend={lifetimeSpend}
            />
          )}
          {page === "analytics" && <AnalyticsPage sites={sites} toast={toast} />}
          {page === "domains" && <DomainsPage sites={sites} toast={toast} />}
          {page === "profile" && (
            <ProfilePage
              email={user?.email ?? ""}
              initials={initials}
              joined={sites.length ? new Date(sites[sites.length - 1].createdAt).toLocaleDateString("en-GB", { month: "long", year: "numeric" }) : "—"}
              toast={toast}
            />
          )}
          {page === "security" && <SecurityPage toast={toast} />}
          {page === "connected" && (
            <ConnectedPage vercel={vercel} loading={vercelLoading} onDisconnect={handleDisconnectVercel} toast={toast} />
          )}
          {page === "billing" && (
            <BillingPage
              editsLeft={editsLeft}
              openBuy={(site) => setBuy({ site })}
              invoices={invoices}
              lifetimeSpend={lifetimeSpend}
              loading={billingLoading}
              hasStripeCustomer={user?.paymentStatus === "paid"}
              toast={toast}
            />
          )}
          {page === "notifications" && <NotificationsPage toast={toast} onDelete={() => setDel(true)} />}
        </main>
      </div>
      {del && <DeleteModal onClose={() => setDel(false)} toast={toast} />}
      {buy && <BuyEditsModal site={buy.site} sites={sites} onClose={() => setBuy(null)} />}
      {toastMsg && (
        <div className="toast">
          <Icons.checkCircle />
          {toastMsg}
        </div>
      )}
    </div>
  );
}
