"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

/* ── Design tokens ─────────────────────────────────────────────────────────── */
const C = {
  ink:        "#0A0E14",
  ink2:       "#1B2230",
  muted:      "#6B7180",
  soft:       "#B0AC9F",
  bg:         "#FAFAF7",
  bg2:        "#F3F0E9",
  line:       "#E8E3D6",
  line2:      "#D8D2C2",
  six:        "#FF5A1F",
  six2:       "#E54B14",
  sixSoft:    "#FFEDE4",
  em:         "#00B377",
  em2:        "#009062",
  emSoft:     "#E5F7EE",
  techBg:     "#0A0D14",
  techText:   "#D4D8E0",
  techMuted:  "#6B7383",
  techGreen:  "#4ADE80",
  techSky:    "#7DD3FC",
  techAmber:  "#FBBF24",
  techPlum:   "#C792EA",
  font:       '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "Inter", system-ui, sans-serif',
  mono:       'ui-monospace, "SF Mono", "JetBrains Mono", Menlo, Consolas, monospace',
};

/* ── Types ──────────────────────────────────────────────────────────────────── */
type Site = {
  id: string; name: string; vercel_url: string; github_url: string | null;
  status: string; current_version: number; edit_count: number;
  custom_domain: string | null; pricing_tier: string | null;
  free_edits_remaining: number; total_edits_included: number; created_at: string;
  business_type: string | null;
  design_preferences: Record<string, unknown> | null;
};
type User = { id: string; email: string; paymentStatus: string };

/* ── Brand components ───────────────────────────────────────────────────────── */
function Mark({ size = 30 }: { size?: number }) {
  return (
    <div style={{ width: size, height: size, borderRadius: size * 0.28, background: C.ink, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <span style={{ fontSize: size * 0.62, fontWeight: 800, color: C.six, letterSpacing: -0.5, lineHeight: 1 }}>6</span>
    </div>
  );
}
function Wordmark({ size = 22 }: { size?: number }) {
  return <span style={{ fontSize: size, fontWeight: 700, letterSpacing: -0.6, color: C.ink }}>in<span style={{ color: C.six }}>six</span>live</span>;
}
function Eyebrow({ children, color = C.six }: { children: React.ReactNode; color?: string }) {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: C.mono, fontSize: 11.5, fontWeight: 600, letterSpacing: 0.6, textTransform: "uppercase", color }}>
      <span style={{ width: 5, height: 5, borderRadius: 3, background: color }}/>
      {children}
    </div>
  );
}

/* ── Icons ──────────────────────────────────────────────────────────────────── */
const Globe = ({ s = 16, c = "currentColor" }: { s?: number; c?: string }) => (
  <svg width={s} height={s} viewBox="0 0 20 20" fill="none">
    <circle cx="10" cy="10" r="7.5" stroke={c} strokeWidth="1.5"/>
    <path d="M2.5 10h15M10 2.5c2.5 3 2.5 12 0 15M10 2.5c-2.5 3-2.5 12 0 15" stroke={c} strokeWidth="1.5"/>
  </svg>
);
const ArrowUR = ({ s = 13, c = "currentColor" }: { s?: number; c?: string }) => (
  <svg width={s} height={s} viewBox="0 0 14 14" fill="none">
    <path d="M4 10l6-6M5 4h5v5" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const ArrowR = ({ s = 13, c = "currentColor" }: { s?: number; c?: string }) => (
  <svg width={s} height={s} viewBox="0 0 14 14" fill="none">
    <path d="M3 7h8M8 4l3 3-3 3" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const Refresh = ({ s = 13, c = "currentColor" }: { s?: number; c?: string }) => (
  <svg width={s} height={s} viewBox="0 0 14 14" fill="none">
    <path d="M2.5 7a4.5 4.5 0 017.7-3.2L12 5.5M12 2v3.5H8.5M11.5 7a4.5 4.5 0 01-7.7 3.2L2 8.5M2 12V8.5h3.5" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const Plus = ({ s = 14, c = "currentColor" }: { s?: number; c?: string }) => (
  <svg width={s} height={s} viewBox="0 0 14 14" fill="none">
    <path d="M7 2v10M2 7h10" stroke={c} strokeWidth="2" strokeLinecap="round"/>
  </svg>
);
const Search = ({ s = 14, c = "currentColor" }: { s?: number; c?: string }) => (
  <svg width={s} height={s} viewBox="0 0 14 14" fill="none">
    <circle cx="6" cy="6" r="4" stroke={c} strokeWidth="1.5"/>
    <path d="M9 9l3 3" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);
const More = ({ s = 16, c = "currentColor" }: { s?: number; c?: string }) => (
  <svg width={s} height={s} viewBox="0 0 16 16" fill={c}>
    <circle cx="3.5" cy="8" r="1.4"/><circle cx="8" cy="8" r="1.4"/><circle cx="12.5" cy="8" r="1.4"/>
  </svg>
);
const VercelTri = () => <svg width="13" height="11" viewBox="0 0 13 11" fill={C.ink}><path d="M6.5 0L13 11H0z"/></svg>;
const GridIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <rect x="1" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4"/>
    <rect x="8" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4"/>
    <rect x="1" y="8" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4"/>
    <rect x="8" y="8" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4"/>
  </svg>
);
const ListIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M2 3.5h10M2 7h10M2 10.5h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
  </svg>
);

/* ── Colour swatch preview ──────────────────────────────────────────────────── */

// Business-type fallbacks when no design_preferences are stored (legacy sites)
const BIZ_COLORS: Record<string, string> = {
  "Restaurant":        "#b85c2c",
  "Dental Clinic":     "#3a8a78",
  "Hair Salon":        "#b2756a",
  "Fitness":           "#ff4d1a",
  "Law Firm":          "#15294a",
  "Real Estate":       "#7d8a6e",
  "Medical Clinic":    "#5c8b6e",
  "Tech Startup":      "#a8ff5c",
  "Beauty/Spa":        "#b97a6f",
  "Photography":       "#7a2828",
  "E-commerce":        "#0066CC",
  "Consulting":        "#1a365d",
  "Marketing Agency":  "#7c3aed",
  "Architecture":      "#374151",
  "Accounting":        "#065f46",
  "Plumbing":          "#1e40af",
};

function getSiteColor(site: Site): string {
  // 1 — stored in design_preferences (full formData saved on generation)
  const prefs = site.design_preferences as Record<string, unknown> | null;
  const design = prefs?.design as Record<string, unknown> | undefined;
  if (typeof design?.primaryColor === "string" && design.primaryColor) return design.primaryColor;
  // 2 — business type fallback
  return BIZ_COLORS[site.business_type ?? ""] ?? C.six;
}


function ColorSwatch({ site, height = 72 }: { site: Site; height?: number }) {
  const color = getSiteColor(site);
  return (
    <div style={{ width: "100%", height, background: color }}/>
  );
}

/* ── Status pill ────────────────────────────────────────────────────────────── */
function StatusPill({ status }: { status: string }) {
  const map: Record<string, { c: string; bg: string; label: string; dot: string }> = {
    live:  { c: C.em2,    bg: C.emSoft,  label: "Live",     dot: C.em },
    draft: { c: "#8A6500",bg: "#FFF6DE", label: "Draft",    dot: C.techAmber },
    build: { c: "#0066CC",bg: "#E5F0FF", label: "Building", dot: "#0066CC" },
  };
  const m = map[status] ?? map.live;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 10px", borderRadius: 999, background: m.bg, color: m.c, fontFamily: C.mono, fontSize: 10.5, fontWeight: 700, letterSpacing: 0.4, textTransform: "uppercase" }}>
      <span style={{ width: 6, height: 6, borderRadius: 3, background: m.dot }}/>
      {m.label}
    </span>
  );
}

/* ── Action button ──────────────────────────────────────────────────────────── */
function ActionBtn({ children, variant = "light", icon, href, onClick, full = true }: {
  children: React.ReactNode; variant?: "primary"|"light"|"six";
  icon?: React.ReactNode; href?: string; onClick?: () => void; full?: boolean;
}) {
  const styles: Record<string, React.CSSProperties> = {
    primary: { background: C.ink, color: "#fff", border: `1px solid ${C.ink}`, boxShadow: "0 1px 0 rgba(255,255,255,0.08) inset, 0 4px 14px rgba(10,14,20,0.18)" },
    light:   { background: "#fff", color: C.ink, border: `1px solid ${C.line}`, boxShadow: "0 1px 0 rgba(255,255,255,0.5) inset" },
    six:     { background: "#fff", color: C.six2, border: "1px solid #FFCCB3", boxShadow: "none" },
  };
  const base: React.CSSProperties = { display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, height: 44, padding: "0 16px", borderRadius: 10, fontFamily: C.font, fontSize: 14, fontWeight: 600, letterSpacing: -0.1, width: full ? "100%" : "auto", cursor: "pointer", textDecoration: "none", ...styles[variant] };
  if (href) return <a href={href} target="_blank" rel="noopener noreferrer" style={base}>{icon}{children}</a>;
  return <button onClick={onClick} style={base}>{icon}{children}</button>;
}

/* ── Meta row ───────────────────────────────────────────────────────────────── */
function MetaRow({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 12, padding: "8px 0", borderTop: `1px dashed ${C.line}` }}>
      <div style={{ fontFamily: C.mono, fontSize: 10.5, color: C.muted, textTransform: "uppercase", letterSpacing: 0.5, width: 72, flexShrink: 0 }}>{label}</div>
      <div style={{ fontFamily: mono ? C.mono : C.font, fontSize: 13, color: C.ink, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{value}</div>
    </div>
  );
}

/* ── Site card (grid view) ──────────────────────────────────────────────────── */
function SiteCard({ site, onDomain, onEdit }: { site: Site; onDomain: () => void; onEdit: () => void }) {
  const domain = site.custom_domain ?? site.vercel_url?.replace("https://","");
  const vercelUrl = site.vercel_url ?? "https://vercel.com/dashboard";
  const freeLeft = site.free_edits_remaining ?? 0;
  const tier = site.pricing_tier ?? "website";
  const created = new Date(site.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  const tags = ["Website", tier === "website_5" ? "+5 Changes" : null].filter(Boolean) as string[];

  return (
    <article style={{ background: "#fff", border: `1px solid ${C.line}`, borderRadius: 18, boxShadow: "0 1px 0 rgba(255,255,255,0.5) inset, 0 14px 40px rgba(10,14,20,0.04)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Preview */}
      <div style={{ position: "relative", overflow: "hidden", borderRadius: "18px 18px 0 0" }}>
        <ColorSwatch site={site}/>
        <span style={{ position: "absolute", top: 12, right: 12 }}><StatusPill status="live"/></span>
      </div>

      {/* Body */}
      <div style={{ padding: "20px 22px 22px", display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Title row */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
          <div style={{ minWidth: 0 }}>
            <h3 style={{ margin: 0, fontSize: 22, fontWeight: 700, letterSpacing: -0.6, color: C.ink }}>{site.name}</h3>
            <a href={`https://${domain}`} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 5, marginTop: 4, fontFamily: C.mono, fontSize: 12.5, color: C.muted }}>
              {domain} <ArrowUR s={11} c={C.muted}/>
            </a>
          </div>
          <button style={{ width: 32, height: 32, borderRadius: 8, background: "#fff", border: `1px solid ${C.line}`, display: "flex", alignItems: "center", justifyContent: "center", color: C.muted, cursor: "pointer" }}>
            <More s={15} c={C.muted}/>
          </button>
        </div>

        {/* Tags */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {tags.map((t, i) => (
            <span key={t} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 9px", borderRadius: 5, background: i === 0 ? C.bg2 : "transparent", border: `1px solid ${C.line}`, fontFamily: C.mono, fontSize: 10.5, fontWeight: 600, color: i === 0 ? C.ink : C.muted, textTransform: "uppercase", letterSpacing: 0.5 }}>
              {t}
            </span>
          ))}
        </div>

        {/* Meta */}
        <div>
          <MetaRow label="Deploy" value={created}/>
          <MetaRow label="Domain" value={domain} mono/>
          <MetaRow label="Changes" value={freeLeft > 0 ? `${freeLeft} free remaining` : "€10 per change"}/>
        </div>

        {/* Actions */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <ActionBtn variant="primary" icon={<ArrowR s={13} c="#fff"/>} href={vercelUrl}>View site</ActionBtn>
          <ActionBtn variant="light" icon={<VercelTri/>} href={vercelUrl}>
            Vercel&nbsp;<ArrowUR s={11} c={C.muted}/>
          </ActionBtn>
          <ActionBtn variant="light" icon={<Globe s={15} c={C.muted}/>} onClick={onDomain}>
            {site.custom_domain ? "Manage domain" : "Add domain"}
          </ActionBtn>
          <ActionBtn variant="six" icon={<Refresh s={13} c={C.six2}/>} onClick={onEdit}>
            Change&nbsp;<span style={{ color: C.soft, fontWeight: 500 }}>— {freeLeft > 0 ? "Free" : "€10"}</span>
          </ActionBtn>
        </div>
      </div>
    </article>
  );
}

/* ── Site row (list view) ────────────────────────────────────────────────────── */
function SiteRow({ site, onDomain, onEdit }: { site: Site; onDomain: () => void; onEdit: () => void }) {
  const domain = site.custom_domain ?? site.vercel_url?.replace("https://","");
  const vercelUrl = site.vercel_url ?? "https://vercel.com/dashboard";
  const freeLeft = site.free_edits_remaining ?? 0;
  const created = new Date(site.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  return (
    <div style={{ display: "grid", gridTemplateColumns: "88px 1fr auto auto", alignItems: "center", gap: 22, padding: "16px 22px", background: "#fff", border: `1px solid ${C.line}`, borderRadius: 14, boxShadow: "0 1px 0 rgba(255,255,255,0.5) inset" }}>
      <div style={{ width: 88, height: 64, borderRadius: 8, overflow: "hidden", border: `1px solid ${C.line}`, flexShrink: 0 }}>
        <ColorSwatch site={site} height={64}/>
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, letterSpacing: -0.4 }}>{site.name}</h3>
          <StatusPill status="live"/>
        </div>
        <div style={{ display: "flex", gap: 14, fontFamily: C.mono, fontSize: 12, color: C.muted }}>
          <span>{domain}</span>
          <span style={{ opacity: 0.4 }}>·</span>
          <span>{created}</span>
        </div>
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        <ActionBtn variant="primary" icon={<ArrowR s={13} c="#fff"/>} href={vercelUrl} full={false}>View site</ActionBtn>
        <ActionBtn variant="light" icon={<VercelTri/>} href={vercelUrl} full={false}>Vercel <ArrowUR s={11} c={C.muted}/></ActionBtn>
        <ActionBtn variant="light" icon={<Globe s={14} c={C.muted}/>} onClick={onDomain} full={false}>Domain</ActionBtn>
        <ActionBtn variant="six" icon={<Refresh s={13} c={C.six2}/>} onClick={onEdit} full={false}>
          Change <span style={{ color: C.soft, fontWeight: 500, marginLeft: 4 }}>— {freeLeft > 0 ? "Free" : "€10"}</span>
        </ActionBtn>
      </div>
      <button style={{ width: 32, height: 32, borderRadius: 8, background: "#fff", border: `1px solid ${C.line}`, display: "flex", alignItems: "center", justifyContent: "center", color: C.muted, cursor: "pointer" }}>
        <More s={15} c={C.muted}/>
      </button>
    </div>
  );
}

/* ── New slot card ───────────────────────────────────────────────────────────── */
function NewSlotCard({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} style={{ background: "transparent", border: `1.5px dashed ${C.line2}`, borderRadius: 18, minHeight: 520, padding: 40, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: C.muted, cursor: "pointer", width: "100%" }}>
      <div style={{ width: 56, height: 56, borderRadius: 14, background: "#fff", border: `1px solid ${C.line}`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 20px rgba(10,14,20,0.04)" }}>
        <Plus s={20} c={C.ink}/>
      </div>
      <div style={{ fontSize: 18, fontWeight: 700, color: C.ink, letterSpacing: -0.3 }}>Generate another</div>
      <div style={{ maxWidth: 240, textAlign: "center", fontSize: 13.5, lineHeight: 1.5 }}>
        One-time payment, deployed to your Vercel, live in around six minutes.
      </div>
      <div style={{ fontFamily: C.mono, fontSize: 11, color: C.six, marginTop: 4 }}>FROM €49.99</div>
    </button>
  );
}

/* ── Stats strip ─────────────────────────────────────────────────────────────── */
function Sparkline({ data, w = 72, h = 24 }: { data: number[]; w?: number; h?: number }) {
  const max = Math.max(...data), min = Math.min(...data), range = max - min || 1;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * (h - 4) - 2}`).join(" ");
  return (
    <svg width={w} height={h} style={{ display: "block" }}>
      <polyline points={pts} fill="none" stroke={C.six} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx={w} cy={h - ((data[data.length - 1] - min) / range) * (h - 4) - 2} r="2.5" fill={C.six}/>
    </svg>
  );
}
function StatsStrip({ sites }: { sites: Site[] }) {
  const live = sites.length;
  const totalFree = sites.reduce((s, x) => s + (x.free_edits_remaining ?? 0), 0);
  const stats = [
    { label: "Live sites",   value: String(live),    foot: `${live} active · 0 paused` },
    { label: "Visits · 30d", value: "—",             foot: "Analytics coming soon", spark: [3,5,4,7,6,9,8,11,10,14] },
    { label: "Avg load",     value: "—",             foot: "Vercel Edge · fra1" },
    { label: "Free changes", value: String(totalFree), foot: totalFree > 0 ? `${totalFree} regenerations left` : "€10 per change" },
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 0, border: `1px solid ${C.line}`, borderRadius: 14, background: "#fff", overflow: "hidden", marginBottom: 32 }}>
      {stats.map((s, i) => (
        <div key={s.label} style={{ padding: "18px 22px", borderRight: i < stats.length - 1 ? `1px solid ${C.line}` : "none", display: "flex", flexDirection: "column", gap: 4 }}>
          <div style={{ fontFamily: C.mono, fontSize: 10.5, fontWeight: 600, letterSpacing: 0.6, textTransform: "uppercase", color: C.muted }}>{s.label}</div>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
            <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: -0.8, color: C.ink }}>{s.value}</div>
            {s.spark && <Sparkline data={s.spark}/>}
          </div>
          <div style={{ fontSize: 12, color: C.muted }}>{s.foot}</div>
        </div>
      ))}
    </div>
  );
}

/* ── Filter bar ──────────────────────────────────────────────────────────────── */
function FilterBar({ filter, setFilter, layout, setLayout, sites }: {
  filter: string; setFilter: (f: string) => void;
  layout: "grid"|"list"; setLayout: (l: "grid"|"list") => void;
  sites: Site[];
}) {
  const tabs: [string, number][] = [
    ["All", sites.length],
    ["Live", sites.length],
    ["Draft", 0],
    ["Archived", 0],
  ];
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, marginBottom: 20, flexWrap: "wrap" }}>
      <div style={{ display: "flex", gap: 4, background: C.bg2, border: `1px solid ${C.line}`, padding: 4, borderRadius: 10 }}>
        {tabs.map(([label, count]) => {
          const on = filter === label;
          return (
            <button key={label} onClick={() => setFilter(label)} style={{ display: "inline-flex", alignItems: "center", gap: 6, height: 32, padding: "0 12px", borderRadius: 7, background: on ? "#fff" : "transparent", border: "none", fontSize: 13, fontWeight: 500, letterSpacing: -0.1, color: on ? C.ink : C.muted, boxShadow: on ? `0 1px 2px rgba(10,14,20,0.06), 0 0 0 1px ${C.line}` : "none", cursor: "pointer" }}>
              {label}
              <span style={{ fontFamily: C.mono, fontSize: 10.5, color: on ? C.muted : C.soft }}>{count}</span>
            </button>
          );
        })}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, height: 40, padding: "0 12px", background: "#fff", border: `1px solid ${C.line}`, borderRadius: 10, width: 220 }}>
          <Search s={14} c={C.muted}/>
          <input placeholder="Search sites…" style={{ border: "none", outline: "none", background: "transparent", fontFamily: C.font, fontSize: 13, color: C.ink, width: "100%" }}/>
          <span style={{ fontFamily: C.mono, fontSize: 10.5, color: C.soft, padding: "2px 5px", border: `1px solid ${C.line}`, borderRadius: 4 }}>⌘K</span>
        </div>
        <div style={{ display: "flex", background: "#fff", border: `1px solid ${C.line}`, borderRadius: 10, overflow: "hidden" }}>
          {([["grid", GridIcon], ["list", ListIcon]] as [string, React.ComponentType][]).map(([k, Ico]) => (
            <button key={k} onClick={() => setLayout(k as "grid"|"list")} style={{ width: 40, height: 40, border: "none", background: layout === k ? C.bg2 : "#fff", color: layout === k ? C.ink : C.muted, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <Ico/>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Activity panel ──────────────────────────────────────────────────────────── */
function Activity({ sites }: { sites: Site[] }) {
  const latest = sites[0];
  const domain = latest?.custom_domain ?? latest?.vercel_url?.replace("https://","") ?? "yoursite.vercel.app";
  const items = latest ? [
    ["now",     "live",  C.em,       <><b>{domain}</b> is live</>],
    ["—",       "ssl",   C.em,       <>SSL certificate active · {domain}</>],
    ["—",       "dns",   C.techSky,  <>DNS verified · CNAME → cname.vercel-dns.com</>],
    ["—",       "build", C.techPlum, <>Build complete · Next.js · Vercel Edge</>],
    ["—",       "gen",   C.six,      <>Site generated · ~100s · insixlive</>],
  ] : [
    ["—", "idle", C.techMuted, <>No sites deployed yet</>],
  ];
  return (
    <aside style={{ background: C.techBg, borderRadius: 18, padding: "22px 24px", color: C.techText, position: "relative", overflow: "hidden", border: "1px solid rgba(255,255,255,0.04)" }}>
      <div style={{ position: "absolute", inset: 0, opacity: 0.5, pointerEvents: "none", backgroundImage: "radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)", backgroundSize: "18px 18px" }}/>
      <div style={{ position: "relative" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
          <Eyebrow color={C.techGreen}>Activity</Eyebrow>
          <span style={{ fontFamily: C.mono, fontSize: 10.5, color: C.techMuted }}>live ●</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {items.map(([t, tag, c, body], i) => (
            <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", fontFamily: C.mono, fontSize: 12, lineHeight: 1.5 }}>
              <span style={{ color: C.techMuted, width: 48, flexShrink: 0 }}>{t as string}</span>
              <span style={{ color: c as string, fontWeight: 700, width: 42, flexShrink: 0 }}>{tag as string}</span>
              <span style={{ color: C.techText, fontFamily: C.font, fontSize: 13 }}>{body as React.ReactNode}</span>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 22, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "space-between", fontFamily: C.mono, fontSize: 11.5, color: C.techMuted }}>
          <span>insixlive · vercel</span>
          <a href="https://vercel.com/dashboard" target="_blank" rel="noopener noreferrer" style={{ color: C.techSky }}>dashboard →</a>
        </div>
      </div>
    </aside>
  );
}

/* ── Empty state ─────────────────────────────────────────────────────────────── */
function EmptyState() {
  return (
    <div style={{ border: `1.5px dashed ${C.line}`, borderRadius: 18, padding: "64px 32px", textAlign: "center", background: C.bg2 }}>
      <div style={{ width: 56, height: 56, borderRadius: 14, background: "#fff", border: `1px solid ${C.line}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", boxShadow: "0 8px 20px rgba(10,14,20,0.04)" }}>
        <Plus s={22} c={C.ink}/>
      </div>
      <p style={{ fontSize: 20, fontWeight: 700, color: C.ink, margin: "0 0 10px", letterSpacing: -0.4 }}>No websites yet</p>
      <p style={{ fontSize: 14.5, color: C.muted, margin: "0 0 28px", lineHeight: 1.65, maxWidth: 360, marginLeft: "auto", marginRight: "auto" }}>
        Create your first AI-generated website in around six minutes, deployed live on Vercel.
      </p>
      <Link href="/generate" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: C.ink, color: "#fff", padding: "13px 28px", borderRadius: 12, fontFamily: C.font, fontSize: 14, fontWeight: 600, textDecoration: "none", boxShadow: "0 4px 14px rgba(10,14,20,0.18)" }}>
        <Plus s={13} c="#fff"/>
        Generate your first website
        <span style={{ fontFamily: C.mono, fontSize: 11, color: "rgba(255,255,255,0.5)", marginLeft: 4, padding: "2px 6px", borderRadius: 4, border: "1px solid rgba(255,255,255,0.18)" }}>from €49.99</span>
      </Link>
    </div>
  );
}

/* ── Dashboard ───────────────────────────────────────────────────────────────── */
export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [layout, setLayout] = useState<"grid"|"list">("grid");

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/auth/me");
        if (!r.ok) { router.push("/login"); return; }
        const d = await r.json();
        setUser(d.user);
        const sr = await fetch("/api/sites");
        if (sr.ok) setSites((await sr.json()).sites ?? []);
      } catch { router.push("/login"); }
      finally { setLoading(false); }
    })();
  }, [router]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  };

  const initials = user?.email?.slice(0, 2).toUpperCase() ?? "??";

  const visible = useMemo(() => {
    if (filter === "Live")     return sites;
    if (filter === "Draft")    return [];
    if (filter === "Archived") return [];
    return sites;
  }, [sites, filter]);

  if (loading) return (
    <div style={{ background: C.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <style>{`@keyframes dspin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ width: 28, height: 28, borderRadius: 14, border: `2px solid ${C.line}`, borderTopColor: C.six, animation: "dspin .8s linear infinite" }}/>
    </div>
  );

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; }
        body { margin: 0; }
        @keyframes dspin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(6px) } to { opacity: 1; transform: translateY(0) } }
        @keyframes pulse { 0%, 100% { opacity: 1 } 50% { opacity: 0.45 } }
        .db-stats { grid-template-columns: repeat(4,1fr) !important; }
        .db-main-grid { grid-template-columns: minmax(0,1fr) 360px !important; }
        .db-cards { grid-template-columns: 1fr 1fr !important; }
        @media (max-width: 1100px) {
          .db-main-grid { grid-template-columns: 1fr !important; }
          .db-cards { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 860px) {
          .db-stats { grid-template-columns: repeat(2,1fr) !important; }
          .db-row-actions { flex-wrap: wrap !important; }
        }
        @media (max-width: 640px) {
          .db-stats { grid-template-columns: 1fr 1fr !important; }
          .db-site-row { grid-template-columns: 1fr !important; }
          .db-row-thumb { display: none !important; }
          .db-row-actions { display: none !important; }
        }
      `}</style>

      <div style={{ background: C.bg, minHeight: "100vh", fontFamily: C.font, color: C.ink }}>

        {/* ── TOP NAV ─────────────────────────────────────────────────────── */}
        <header style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(250,250,247,0.82)", backdropFilter: "blur(14px) saturate(180%)", WebkitBackdropFilter: "blur(14px) saturate(180%)", borderBottom: `1px solid ${C.line}` }}>
          <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 32px", height: 68, display: "flex", alignItems: "center", gap: 24 }}>
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
              <Mark size={32}/><Wordmark size={22}/>
            </Link>
            <nav style={{ flex: 1, display: "flex", gap: 4, marginLeft: 24 }}>
              {[["Websites", true], ["Domains", false], ["Billing", false]].map(([l, on]) => (
                <a key={String(l)} href={l === "Domains" ? "/help/setup-custom-domain" : "#"} style={{ position: "relative", padding: "24px 14px", fontSize: 14, fontWeight: 500, color: on ? C.ink : C.muted, textDecoration: "none" }}>
                  {l}
                  {on && <span style={{ position: "absolute", left: 14, right: 14, bottom: -1, height: 2, background: C.six, borderRadius: 1 }}/>}
                </a>
              ))}
            </nav>
            <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
              <span style={{ fontFamily: C.mono, fontSize: 12.5, color: C.muted }}>{user?.email}</span>
              <button onClick={handleLogout} style={{ fontSize: 14, color: C.muted, background: "none", border: "none", cursor: "pointer" }}>Log out</button>
              <div style={{ width: 32, height: 32, borderRadius: 16, background: C.ink, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12, fontWeight: 600, letterSpacing: 0.2 }}>{initials}</div>
            </div>
          </div>
        </header>

        <main style={{ maxWidth: 1280, margin: "0 auto", padding: "0 32px 0" }}>

          {/* ── PAGE HEADER ──────────────────────────────────────────────── */}
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 40, paddingTop: 56, paddingBottom: 32, flexWrap: "wrap" }}>
            <div>
              <Eyebrow>Dashboard</Eyebrow>
              <h1 style={{ margin: "10px 0 0", fontSize: "clamp(28px,3vw,40px)", fontWeight: 700, letterSpacing: 1.5, lineHeight: 1.1, color: C.ink, textTransform: "uppercase" as const }}>My websites</h1>
              <p style={{ margin: "14px 0 0", maxWidth: 480, fontSize: 15, lineHeight: 1.5, color: C.muted }}>
                Every site you&apos;ve generated with insixlive. Manage the domain, open the Vercel project, or roll a new version for €10.
              </p>
            </div>
            <Link href="/generate" style={{ display: "inline-flex", alignItems: "center", gap: 10, background: C.ink, color: "#fff", border: "none", height: 52, padding: "0 22px", borderRadius: 12, fontSize: 15, fontWeight: 600, letterSpacing: -0.1, flexShrink: 0, boxShadow: "0 1px 0 rgba(255,255,255,0.08) inset, 0 12px 30px rgba(10,14,20,0.22)", textDecoration: "none" }}>
              <Plus s={13} c="#fff"/>
              New website
              <span style={{ fontFamily: C.mono, fontSize: 11, color: "rgba(255,255,255,0.55)", marginLeft: 4, padding: "2px 6px", borderRadius: 4, border: "1px solid rgba(255,255,255,0.18)" }}>from €49.99</span>
            </Link>
          </div>

          {/* ── STATS STRIP ──────────────────────────────────────────────── */}
          {sites.length > 0 && <StatsStrip sites={sites}/>}

          {/* ── FILTER BAR ───────────────────────────────────────────────── */}
          {sites.length > 0 && <FilterBar filter={filter} setFilter={setFilter} layout={layout} setLayout={setLayout} sites={sites}/>}

          {/* ── EMPTY STATE ──────────────────────────────────────────────── */}
          {sites.length === 0 && <EmptyState/>}

          {/* ── SITE GRID / LIST ─────────────────────────────────────────── */}
          {sites.length > 0 && (
            <div className="db-main-grid" style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 360px", gap: 24, alignItems: "flex-start" }}>
              <div>
                {layout === "grid" ? (
                  <div className="db-cards" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                    {visible.map(s => (
                      <SiteCard key={s.id} site={s}
                        onDomain={() => router.push(`/domains/${s.id}`)}
                        onEdit={() => router.push(`/generate?edit=${s.id}`)}
                      />
                    ))}
                    <NewSlotCard onClick={() => router.push("/generate")}/>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {visible.map(s => (
                      <SiteRow key={s.id} site={s}
                        onDomain={() => router.push(`/domains/${s.id}`)}
                        onEdit={() => router.push(`/generate?edit=${s.id}`)}
                      />
                    ))}
                  </div>
                )}
              </div>
              <div style={{ position: "sticky", top: 84 }}>
                <Activity sites={sites}/>
              </div>
            </div>
          )}

          {/* ── FOOTER ───────────────────────────────────────────────────── */}
          <footer style={{ marginTop: 72, padding: "28px 0 40px", borderTop: `1px solid ${C.line}`, display: "flex", alignItems: "center", justifyContent: "space-between", fontFamily: C.mono, fontSize: 11.5, color: C.muted, flexWrap: "wrap", gap: 16 }}>
            <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 7, height: 7, borderRadius: 4, background: C.em }}/>
                All systems operational
              </span>
              <span style={{ opacity: 0.4 }}>·</span>
              <span>Vercel Edge · fra1</span>
            </div>
            <div style={{ display: "flex", gap: 18 }}>
              <Link href="/how-it-works" style={{ color: C.muted, textDecoration: "none" }}>Docs</Link>
              <Link href="/faq" style={{ color: C.muted, textDecoration: "none" }}>FAQ</Link>
              <a href="mailto:support@insixlive.com" style={{ color: C.muted, textDecoration: "none" }}>Support</a>
              <span>© 2026 insixlive</span>
            </div>
          </footer>
        </main>
      </div>
    </>
  );
}
