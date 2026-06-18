"use client";
import React from "react";
import { Icons } from "./icons";
import { Section, Pill } from "./primitives";
import type { DashSite } from "./types";

function fmt(n: number) {
  return Math.round(n).toLocaleString("en-US");
}

function hashId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function mulberry(a: number) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function genSeries(n: number, base: number, seed: number) {
  const r = mulberry(seed * 977 + n);
  const out: number[] = [];
  for (let i = 0; i < n; i++) {
    const wave = 0.72 + 0.42 * Math.sin((i / n) * Math.PI * 2 + seed);
    const noise = 0.62 + r() * 0.8;
    out.push(Math.max(1, Math.round(base * wave * noise)));
  }
  return out;
}

const TICKS: Record<string, string[]> = {
  "24h": ["00:00", "06:00", "12:00", "18:00", "now"],
  "7d": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  "30d": ["30d", "24d", "18d", "12d", "6d", "now"],
  "90d": ["90d", "72d", "54d", "36d", "18d", "now"],
};
const TOP_PAGES = [
  { path: "/", pct: 41 }, { path: "/services", pct: 18 }, { path: "/about", pct: 12 },
  { path: "/contact", pct: 11 }, { path: "/pricing", pct: 9 }, { path: "/gallery", pct: 6 }, { path: "/blog", pct: 3 },
];
const REFERRERS = [
  { src: "Direct", pct: 37 }, { src: "Google", pct: 32 }, { src: "Instagram", pct: 12 },
  { src: "Facebook", pct: 8 }, { src: "maps.google.com", pct: 6 }, { src: "Bing", pct: 5 },
];
const COUNTRIES = [
  { cc: "RO", name: "Romania", pct: 63 }, { cc: "MD", name: "Moldova", pct: 10 }, { cc: "IT", name: "Italy", pct: 8 },
  { cc: "DE", name: "Germany", pct: 7 }, { cc: "GB", name: "United Kingdom", pct: 6 }, { cc: "US", name: "United States", pct: 4 },
];
const BROWSERS = [
  { name: "Chrome", pct: 61 }, { name: "Safari", pct: 23 }, { name: "Edge", pct: 8 }, { name: "Firefox", pct: 5 }, { name: "Other", pct: 3 },
];

function analyticsFor(site: DashSite, range: string) {
  const w = site.weight || 1;
  const cfg = ({ "24h": 24, "7d": 7, "30d": 30, "90d": 13 } as Record<string, number>)[range];
  const perPoint = (range === "24h" ? 30 : range === "90d" ? 2500 : range === "30d" ? 400 : 390) * w;
  const idNum = hashId(site.id);
  const seed = idNum * 31 + cfg;
  const series = genSeries(cfg, perPoint, seed);
  const visitors = series.reduce((a, b) => a + b, 0);
  const viewRatio = 2.05;
  const views = Math.round(visitors * viewRatio);
  const f = range === "24h" ? 0.45 : range === "90d" ? 1.6 : 1;
  const d = (n: number) => +(n * f).toFixed(1);
  const deltas = { visitors: d(12.4), views: d(9.6), bounce: d(-3.1), dur: d(7.2) };
  const bounce = 38 + (idNum % 3) * 3;
  const durS = 96 + (idNum % 50) * 11;
  const dur = Math.floor(durS / 60) + "m " + (durS % 60) + "s";
  const slice = <T extends { pct: number }>(arr: T[], total: number) => arr.map((x) => ({ ...x, v: Math.round((total * x.pct) / 100) }));
  const vitals: Record<string, { v: string; unit: string; rating: string; dist: number[] }> = {
    lcp: { v: "1.4", unit: "s", rating: "good", dist: [88, 9, 3] },
    inp: { v: "94", unit: "ms", rating: "good", dist: [91, 7, 2] },
    cls: { v: "0.04", unit: "", rating: "good", dist: [94, 4, 2] },
    fcp: { v: "1.1", unit: "s", rating: "good", dist: [90, 8, 2] },
    ttfb: { v: "0.31", unit: "s", rating: "good", dist: [85, 12, 3] },
  };
  let res = 94;
  if (idNum % 3 === 0) {
    vitals.lcp = { v: "2.7", unit: "s", rating: "ni", dist: [56, 33, 11] };
    vitals.ttfb = { v: "0.62", unit: "s", rating: "ni", dist: [62, 28, 10] };
    res = 81;
  }
  return {
    visitors, views, viewRatio, bounce, dur, deltas, series, ticks: TICKS[range],
    pages: slice(TOP_PAGES, views), referrers: slice(REFERRERS, visitors),
    countries: slice(COUNTRIES, visitors), browsers: slice(BROWSERS, visitors),
    devices: { desktop: Math.round(visitors * 0.58), mobile: Math.round(visitors * 0.38), tablet: Math.round(visitors * 0.04) },
    vitals, res,
  };
}

function Delta({ value, goodWhenDown }: { value: number; goodWhenDown?: boolean }) {
  const up = value >= 0;
  const good = goodWhenDown ? !up : up;
  const Ic = up ? Icons.trendUp : Icons.trendDown;
  return (
    <span className={"delta " + (good ? "up" : "down")}>
      <Ic />
      {up ? "+" : ""}
      {value}%
    </span>
  );
}

function Gauge({ score }: { score: number }) {
  const R = 52;
  const C = 2 * Math.PI * R;
  const pct = score / 100;
  const color = score >= 90 ? "var(--ok)" : score >= 50 ? "var(--warn)" : "var(--danger)";
  return (
    <div className="gauge">
      <svg width="120" height="120" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={R} fill="none" stroke="var(--surface-3)" strokeWidth="11" />
        <circle
          cx="60" cy="60" r={R} fill="none" stroke={color} strokeWidth="11" strokeLinecap="round"
          strokeDasharray={C} strokeDashoffset={C * (1 - pct)} transform="rotate(-90 60 60)"
        />
      </svg>
      <div className="gv">
        <b style={{ color }}>{score}</b>
        <span>Score</span>
      </div>
    </div>
  );
}

function Vital({ k, v, unit, rating, dist }: { k: string; v: string; unit: string; rating: string; dist: number[] }) {
  const cls = rating === "good" ? "vt-good" : rating === "ni" ? "vt-ni" : "vt-poor";
  const label = rating === "good" ? "Good" : rating === "ni" ? "Needs work" : "Poor";
  return (
    <div className="vital">
      <div className="vt-k">
        {k}
        <span className={cls}>{label}</span>
      </div>
      <div className="vt-v">
        {v}
        {unit && <small>{unit}</small>}
      </div>
      <div className="vt-dist">
        <i className="dot-good" style={{ width: dist[0] + "%" }}></i>
        <i className="dot-ni" style={{ width: dist[1] + "%" }}></i>
        <i className="dot-poor" style={{ width: dist[2] + "%" }}></i>
      </div>
    </div>
  );
}

function BkRow({ label, v, max, total, mono, chip, cc }: { label: string; v: number; max: number; total: number; mono?: boolean; chip?: string; cc?: string }) {
  const pct = Math.round((v / total) * 100);
  return (
    <div className="bk-row">
      <div className="bk-label">
        {cc && <span className="cc">{cc}</span>}
        {chip && <span className="bk-ic">{chip}</span>}
        <span className="nm" style={mono ? { fontFamily: "var(--font-mono)", fontSize: 12.5 } : undefined}>
          {label}
        </span>
      </div>
      <div className="bk-track">
        <i style={{ width: (v / max) * 100 + "%" }}></i>
      </div>
      <div className="bk-val">{fmt(v)}</div>
      <div className="bk-pct">{pct}%</div>
    </div>
  );
}

function SiteSelect({ sites, sel, onSelect }: { sites: DashSite[]; sel: string; onSelect: (id: string) => void }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  const cur = sites.find((s) => s.id === sel) || sites[0];
  return (
    <div className="site-select" ref={ref}>
      <button className="site-select-btn" onClick={() => setOpen((o) => !o)}>
        <span className="ssb-fav" style={{ background: cur.color }}>{cur.fav}</span>
        <span>{cur.name}</span>
        <Icons.chevDown />
      </button>
      {open && (
        <div className="site-select-menu">
          {sites.map((s) => (
            <button key={s.id} className="ssm-item" onClick={() => { onSelect(s.id); setOpen(false); }}>
              <span className="ssb-fav" style={{ background: s.color }}>{s.fav}</span>
              <span className="nm">{s.name}</span>
              {s.id === sel && <Icons.check className="ck" size={15} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function AnalyticsBody({ site, range }: { site: DashSite; range: string }) {
  const [metric, setMetric] = React.useState<"visitors" | "views">("visitors");
  const A = React.useMemo(() => analyticsFor(site, range), [site, range]);
  const series = metric === "views" ? A.series.map((v) => Math.round(v * A.viewRatio)) : A.series;
  const max = Math.max(...series);
  const devTotal = A.devices.desktop + A.devices.mobile + A.devices.tablet;
  const mx = (a: { v: number }[]) => Math.max(...a.map((x) => x.v));
  return (
    <>
      <div className="stats stagger">
        <div className="stat">
          <div className="s-k"><Icons.user size={13} />Visitors</div>
          <div className="s-v">{fmt(A.visitors)}</div>
          <div className="s-d"><Delta value={A.deltas.visitors} /> vs prev</div>
        </div>
        <div className="stat">
          <div className="s-k"><Icons.window size={13} />Page views</div>
          <div className="s-v">{fmt(A.views)}</div>
          <div className="s-d"><Delta value={A.deltas.views} /> vs prev</div>
        </div>
        <div className="stat">
          <div className="s-k"><Icons.trendDown size={13} />Bounce rate</div>
          <div className="s-v">{A.bounce}<small>%</small></div>
          <div className="s-d"><Delta value={A.deltas.bounce} goodWhenDown /> vs prev</div>
        </div>
        <div className="stat">
          <div className="s-k"><Icons.clock size={13} />Avg. duration</div>
          <div className="s-v" style={{ fontSize: 23 }}>{A.dur}</div>
          <div className="s-d"><Delta value={A.deltas.dur} /> vs prev</div>
        </div>
      </div>

      <Section
        kicker="01"
        title={metric === "views" ? "Page views" : "Visitors"}
        action={
          <div className="seg">
            <button className={metric === "visitors" ? "on" : ""} onClick={() => setMetric("visitors")}>Visitors</button>
            <button className={metric === "views" ? "on" : ""} onClick={() => setMetric("views")}>Page views</button>
          </div>
        }
      >
        <div className="card">
          <div className="chart">
            {series.map((v, i) => (
              <div className="bar" key={i} style={{ height: Math.max(3, Math.round((v / max) * 100)) + "%" }} title={fmt(v)}></div>
            ))}
          </div>
          <div className="chart-axis">
            {A.ticks.map((t, i) => <span key={i}>{t}</span>)}
          </div>
        </div>
      </Section>

      <div className="grid2" style={{ marginTop: 14 }}>
        <div className="card"><div className="card-pad">
          <div className="section-title" style={{ marginBottom: 4 }}><Icons.window size={15} style={{ color: "var(--text-3)" }} />Top pages</div>
          <div className="bk">{A.pages.map((p, i) => <BkRow key={i} mono label={p.path} v={p.v} max={mx(A.pages)} total={A.views} />)}</div>
        </div></div>
        <div className="card"><div className="card-pad">
          <div className="section-title" style={{ marginBottom: 4 }}><Icons.link size={15} style={{ color: "var(--text-3)" }} />Top referrers</div>
          <div className="bk">{A.referrers.map((p, i) => <BkRow key={i} chip={p.src[0]} label={p.src} v={p.v} max={mx(A.referrers)} total={A.visitors} />)}</div>
        </div></div>
      </div>

      <div className="grid2" style={{ marginTop: 14 }}>
        <div className="card"><div className="card-pad">
          <div className="section-title" style={{ marginBottom: 4 }}><Icons.globe size={15} style={{ color: "var(--text-3)" }} />Countries</div>
          <div className="bk">{A.countries.map((p, i) => <BkRow key={i} cc={p.cc} label={p.name} v={p.v} max={mx(A.countries)} total={A.visitors} />)}</div>
        </div></div>
        <div className="card"><div className="card-pad">
          <div className="section-title" style={{ marginBottom: 12 }}><Icons.device size={15} style={{ color: "var(--text-3)" }} />Devices</div>
          <div className="split">
            <i style={{ width: (A.devices.desktop / devTotal) * 100 + "%", background: "var(--accent)" }}></i>
            <i style={{ width: (A.devices.mobile / devTotal) * 100 + "%", background: "#2b3240" }}></i>
            <i style={{ width: (A.devices.tablet / devTotal) * 100 + "%", background: "var(--violet)" }}></i>
          </div>
          <div className="legend">
            <span className="lg"><span className="sw" style={{ background: "var(--accent)" }}></span>Desktop <b>{Math.round((A.devices.desktop / devTotal) * 100)}%</b></span>
            <span className="lg"><span className="sw" style={{ background: "#2b3240" }}></span>Mobile <b>{Math.round((A.devices.mobile / devTotal) * 100)}%</b></span>
            <span className="lg"><span className="sw" style={{ background: "var(--violet)" }}></span>Tablet <b>{Math.round((A.devices.tablet / devTotal) * 100)}%</b></span>
          </div>
          <div className="section-title" style={{ margin: "22px 0 4px" }}><Icons.window size={15} style={{ color: "var(--text-3)" }} />Browsers</div>
          <div className="bk">{A.browsers.map((p, i) => <BkRow key={i} label={p.name} v={p.v} max={mx(A.browsers)} total={A.visitors} />)}</div>
        </div></div>
      </div>

      <Section kicker="02" title="Speed Insights" desc="Core Web Vitals · real users">
        <div className="card res-card">
          <Gauge score={A.res} />
          <div>
            <div className="section-title" style={{ marginBottom: 6 }}>Real Experience Score</div>
            <p style={{ margin: 0, fontSize: 13.5, color: "var(--text-2)", lineHeight: 1.55, maxWidth: "48ch" }}>
              Measured from real visits over the last {range}. {A.res >= 90 ? "Visitors are getting a fast, stable experience." : "A couple of metrics need attention to reach “Good”."}
            </p>
            <div style={{ display: "flex", gap: 8, marginTop: 13, flexWrap: "wrap" }}>
              {A.res >= 90 ? <Pill kind="ok" dot>Good</Pill> : <Pill kind="warn" dot>Needs improvement</Pill>}
              <span className="poweredby"><Icons.vercel />Vercel Speed Insights</span>
            </div>
          </div>
        </div>
        <div className="vitals" style={{ marginTop: 14 }}>
          <Vital k="LCP" {...A.vitals.lcp} />
          <Vital k="INP" {...A.vitals.inp} />
          <Vital k="CLS" {...A.vitals.cls} />
          <Vital k="FCP" {...A.vitals.fcp} />
          <Vital k="TTFB" {...A.vitals.ttfb} />
        </div>
      </Section>
    </>
  );
}

export function AnalyticsPage({ sites, toast }: { sites: DashSite[]; toast: (m: string) => void }) {
  const live = sites.filter((s) => s.status === "live");
  const initial = (live[0] || sites[0])?.id ?? "";
  const [sel, setSel] = React.useState(initial);
  const [range, setRange] = React.useState("7d");
  const site = sites.find((s) => s.id === sel) || sites[0];
  const ranges = ["24h", "7d", "30d", "90d"];

  if (!site) {
    return (
      <div className="page view-enter">
        <div className="page-head">
          <div className="kicker">// Workspace</div>
          <h1 className="page-title">Analytics</h1>
        </div>
        <div className="empty">
          <div className="em-ic"><Icons.rocket size={26} /></div>
          <div className="em-h">No sites yet</div>
          <div className="em-d">Generate your first website to see analytics here.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="page view-enter">
      <div className="page-head flex">
        <div>
          <div className="kicker">// Workspace</div>
          <h1 className="page-title">Analytics</h1>
          <p className="page-sub">Demo data shown below — connect Vercel Web Analytics &amp; Speed Insights on a site&apos;s Vercel project for real numbers.</p>
        </div>
        <div className="an-toolbar">
          <SiteSelect sites={sites} sel={sel} onSelect={setSel} />
          <div className="seg">{ranges.map((r) => <button key={r} className={range === r ? "on" : ""} onClick={() => setRange(r)}>{r}</button>)}</div>
        </div>
      </div>
      {site.status === "draft" ? (
        <div className="empty">
          <div className="em-ic"><Icons.rocket size={26} /></div>
          <div className="em-h">No analytics yet</div>
          <div className="em-d"><b style={{ color: "var(--text-2)" }}>{site.name}</b> is still a draft.</div>
          <button className="b b-primary" onClick={() => toast("Open the site to publish it")}><Icons.rocket size={15} />Publish site</button>
        </div>
      ) : (
        <AnalyticsBody site={site} range={range} />
      )}
    </div>
  );
}
