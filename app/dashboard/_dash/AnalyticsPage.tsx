"use client";
import React from "react";
import { Icons } from "./icons";
import { Section } from "./primitives";
import type { DashSite, PageId } from "./types";
import { tt, type Lang } from "./i18n";

function fmt(n: number) {
  return Math.round(n).toLocaleString("ro-RO");
}

type AnalyticsRow = Record<string, string | number>;

type AnalyticsData = {
  enabled: true;
  range: string;
  visitors: number;
  views: number;
  prevVisitors: number;
  prevViews: number;
  series: AnalyticsRow[];
  pages: AnalyticsRow[];
  referrers: AnalyticsRow[];
  countries: AnalyticsRow[];
  browsers: AnalyticsRow[];
  devices: AnalyticsRow[];
};

type AnalyticsUnavailable = {
  enabled: false;
  reason: "not_deployed" | "not_connected" | "not_enabled";
  enableUrl?: string;
};

type AnalyticsResponse = AnalyticsData | AnalyticsUnavailable;

function pctDelta(current: number, prev: number): number {
  if (prev <= 0) return current > 0 ? 100 : 0;
  return +(((current - prev) / prev) * 100).toFixed(1);
}

function Delta({ value }: { value: number }) {
  const up = value >= 0;
  const Ic = up ? Icons.trendUp : Icons.trendDown;
  return (
    <span className={"delta " + (up ? "up" : "down")}>
      <Ic />
      {up ? "+" : ""}
      {value}%
    </span>
  );
}

function BkRow({ label, v, max, total, mono, chip, cc }: { label: string; v: number; max: number; total: number; mono?: boolean; chip?: string; cc?: string }) {
  const pct = total > 0 ? Math.round((v / total) * 100) : 0;
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
        <i style={{ width: (max > 0 ? (v / max) * 100 : 0) + "%" }}></i>
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

function pickTicks(series: AnalyticsRow[], lang: Lang, count = 6): string[] {
  if (series.length === 0) return [];
  const locale = lang === "ro" ? "ro-RO" : "en-US";
  const idxs = new Set<number>();
  const step = Math.max(1, Math.floor((series.length - 1) / (count - 1)));
  for (let i = 0; i < series.length; i += step) idxs.add(i);
  idxs.add(series.length - 1);
  return [...idxs].sort((a, b) => a - b).map((i) => {
    const ts = series[i]?.timestamp;
    if (!ts) return "";
    return new Date(String(ts)).toLocaleDateString(locale, { day: "numeric", month: "short" });
  });
}

function dimValue(row: AnalyticsRow, key: string): string {
  const v = row[key];
  return v == null || v === "" ? "—" : String(v);
}

function AnalyticsBody({ site, range, lang, onNavigate }: { site: DashSite; range: string; lang: Lang; onNavigate: (p: PageId) => void }) {
  const [data, setData] = React.useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [metric, setMetric] = React.useState<"visitors" | "views">("visitors");

  const load = React.useCallback(() => {
    setLoading(true);
    fetch(`/api/analytics/${site.id}?range=${range}`)
      .then((r) => r.json())
      .then((d: AnalyticsResponse) => setData(d))
      .catch(() => setData({ enabled: false, reason: "not_connected" }))
      .finally(() => setLoading(false));
  }, [site.id, range]);

  React.useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div className="stats">
        {[0, 1, 2, 3].map((i) => (
          <div className="stat" key={i}>
            <div className="skel" style={{ width: 70, height: 10, marginBottom: 14 }} />
            <div className="skel" style={{ width: 50, height: 22 }} />
          </div>
        ))}
      </div>
    );
  }

  if (!data || !data.enabled) {
    const reason = data?.reason ?? "not_connected";
    if (reason === "not_connected") {
      return (
        <div className="empty">
          <div className="em-ic"><Icons.link size={26} /></div>
          <div className="em-h">{tt(lang, "Connect Vercel to see real stats", "Conectează Vercel pentru statistici reale")}</div>
          <div className="em-d">{tt(lang, "insixlive reads visitor data straight from your own Vercel project — connect your account first.", "insixlive citește datele vizitatorilor direct din proiectul tău Vercel — conectează-ți contul mai întâi.")}</div>
          <button className="b b-primary" onClick={() => onNavigate("connected")}><Icons.link size={15} />{tt(lang, "Connect Vercel", "Conectează Vercel")}</button>
        </div>
      );
    }
    if (reason === "not_deployed") {
      return (
        <div className="empty">
          <div className="em-ic"><Icons.rocket size={26} /></div>
          <div className="em-h">{tt(lang, "Not published yet", "Nepublicat încă")}</div>
          <div className="em-d">{tt(lang, "Publish this site to start collecting visits.", "Publică acest site pentru a începe colectarea vizitelor.")}</div>
        </div>
      );
    }
    return (
      <div className="empty">
        <div className="em-ic"><Icons.window size={26} /></div>
        <div className="em-h">{tt(lang, "Real stats aren't turned on yet", "Statisticile reale nu sunt activate încă")}</div>
        <div className="em-d">{tt(lang, "Enable Web Analytics once on this site's Vercel project — it's free up to 50k visits/month. Then come back and refresh.", "Activează o singură dată Web Analytics pe proiectul Vercel al acestui site — e gratuit până la 50.000 de vizite/lună. Apoi revino și reîmprospătează.")}</div>
        <div className="row" style={{ gap: 8 }}>
          {(data as AnalyticsUnavailable)?.enableUrl && (
            <a className="b b-primary" href={(data as AnalyticsUnavailable).enableUrl} target="_blank" rel="noopener noreferrer">
              <Icons.vercel size={15} />{tt(lang, "Enable on Vercel", "Activează pe Vercel")}
            </a>
          )}
          <button className="b b-ghost" onClick={load}><Icons.refresh size={15} />{tt(lang, "Refresh", "Reîmprospătează")}</button>
        </div>
      </div>
    );
  }

  const series = data.series.map((r) => Number(r[metric === "views" ? "pageviews" : "visitors"]) || 0);
  const max = Math.max(1, ...series);
  const ticks = pickTicks(data.series, lang);

  const topPage = data.pages[0];
  const topCountry = data.countries[0];
  const pagesTotal = data.pages.reduce((a, r) => a + (Number(r.pageviews) || 0), 0);
  const referrersTotal = data.referrers.reduce((a, r) => a + (Number(r.visitors) || 0), 0);
  const countriesTotal = data.countries.reduce((a, r) => a + (Number(r.visitors) || 0), 0);
  const browsersTotal = data.browsers.reduce((a, r) => a + (Number(r.visitors) || 0), 0);
  const devicesTotal = data.devices.reduce((a, r) => a + (Number(r.visitors) || 0), 0);
  const mx = (rows: AnalyticsRow[], field: string) => Math.max(1, ...rows.map((r) => Number(r[field]) || 0));

  const deviceColors: Record<string, string> = { desktop: "var(--accent)", mobile: "#2b3240", tablet: "var(--violet)" };

  return (
    <>
      <div className="stats stagger">
        <div className="stat">
          <div className="s-k"><Icons.user size={13} />{tt(lang, "Visitors", "Vizitatori")}</div>
          <div className="s-v">{fmt(data.visitors)}</div>
          <div className="s-d"><Delta value={pctDelta(data.visitors, data.prevVisitors)} /> {tt(lang, "vs prev", "vs. anterior")}</div>
        </div>
        <div className="stat">
          <div className="s-k"><Icons.window size={13} />{tt(lang, "Page views", "Vizualizări de pagină")}</div>
          <div className="s-v">{fmt(data.views)}</div>
          <div className="s-d"><Delta value={pctDelta(data.views, data.prevViews)} /> {tt(lang, "vs prev", "vs. anterior")}</div>
        </div>
        <div className="stat">
          <div className="s-k"><Icons.window size={13} />{tt(lang, "Top page", "Pagina de top")}</div>
          <div className="s-v" style={{ fontSize: 18, fontFamily: "var(--font-mono)" }}>{topPage ? dimValue(topPage, "requestPath") : "—"}</div>
          <div className="s-d">{topPage ? `${fmt(Number(topPage.pageviews) || 0)} ${tt(lang, "views", "vizualizări")}` : tt(lang, "No data yet", "Fără date încă")}</div>
        </div>
        <div className="stat">
          <div className="s-k"><Icons.globe size={13} />{tt(lang, "Top country", "Țara de top")}</div>
          <div className="s-v" style={{ fontSize: 18 }}>{topCountry ? dimValue(topCountry, "country") : "—"}</div>
          <div className="s-d">{topCountry ? `${fmt(Number(topCountry.visitors) || 0)} ${tt(lang, "visitors", "vizitatori")}` : tt(lang, "No data yet", "Fără date încă")}</div>
        </div>
      </div>

      <Section
        kicker="01"
        title={metric === "views" ? tt(lang, "Page views", "Vizualizări de pagină") : tt(lang, "Visitors", "Vizitatori")}
        action={
          <div className="seg">
            <button className={metric === "visitors" ? "on" : ""} onClick={() => setMetric("visitors")}>{tt(lang, "Visitors", "Vizitatori")}</button>
            <button className={metric === "views" ? "on" : ""} onClick={() => setMetric("views")}>{tt(lang, "Page views", "Vizualizări de pagină")}</button>
          </div>
        }
      >
        <div className="card">
          {series.length === 0 || data.visitors === 0 ? (
            <div className="card-pad" style={{ textAlign: "center", color: "var(--text-3)", fontSize: 13.5, padding: "36px 0" }}>
              {tt(lang, "No visits recorded yet for this range.", "Nicio vizită înregistrată încă pentru acest interval.")}
            </div>
          ) : (
            <>
              <div className="chart">
                {series.map((v, i) => (
                  <div className="bar" key={i} style={{ height: Math.max(3, Math.round((v / max) * 100)) + "%" }} title={fmt(v)}></div>
                ))}
              </div>
              <div className="chart-axis">
                {ticks.map((t, i) => <span key={i}>{t}</span>)}
              </div>
            </>
          )}
        </div>
      </Section>

      <div className="grid2" style={{ marginTop: 14 }}>
        <div className="card"><div className="card-pad">
          <div className="section-title" style={{ marginBottom: 4 }}><Icons.window size={15} style={{ color: "var(--text-3)" }} />{tt(lang, "Top pages", "Pagini de top")}</div>
          <div className="bk">
            {data.pages.length === 0
              ? <p style={{ fontSize: 13, color: "var(--text-3)" }}>{tt(lang, "No data yet", "Fără date încă")}</p>
              : data.pages.map((p, i) => <BkRow key={i} mono label={dimValue(p, "requestPath")} v={Number(p.pageviews) || 0} max={mx(data.pages, "pageviews")} total={pagesTotal} />)}
          </div>
        </div></div>
        <div className="card"><div className="card-pad">
          <div className="section-title" style={{ marginBottom: 4 }}><Icons.link size={15} style={{ color: "var(--text-3)" }} />{tt(lang, "Top referrers", "Surse de trafic")}</div>
          <div className="bk">
            {data.referrers.length === 0
              ? <p style={{ fontSize: 13, color: "var(--text-3)" }}>{tt(lang, "No data yet", "Fără date încă")}</p>
              : data.referrers.map((r, i) => {
                  const src = dimValue(r, "referrerHostname");
                  return <BkRow key={i} chip={src === "—" ? "•" : src[0].toUpperCase()} label={src === "—" ? tt(lang, "Direct", "Direct") : src} v={Number(r.visitors) || 0} max={mx(data.referrers, "visitors")} total={referrersTotal} />;
                })}
          </div>
        </div></div>
      </div>

      <div className="grid2" style={{ marginTop: 14 }}>
        <div className="card"><div className="card-pad">
          <div className="section-title" style={{ marginBottom: 4 }}><Icons.globe size={15} style={{ color: "var(--text-3)" }} />{tt(lang, "Countries", "Țări")}</div>
          <div className="bk">
            {data.countries.length === 0
              ? <p style={{ fontSize: 13, color: "var(--text-3)" }}>{tt(lang, "No data yet", "Fără date încă")}</p>
              : data.countries.map((c, i) => <BkRow key={i} cc={dimValue(c, "country")} label={dimValue(c, "country")} v={Number(c.visitors) || 0} max={mx(data.countries, "visitors")} total={countriesTotal} />)}
          </div>
        </div></div>
        <div className="card"><div className="card-pad">
          <div className="section-title" style={{ marginBottom: 12 }}><Icons.device size={15} style={{ color: "var(--text-3)" }} />{tt(lang, "Devices", "Dispozitive")}</div>
          {devicesTotal === 0 ? (
            <p style={{ fontSize: 13, color: "var(--text-3)" }}>{tt(lang, "No data yet", "Fără date încă")}</p>
          ) : (
            <>
              <div className="split">
                {data.devices.map((d, i) => {
                  const key = dimValue(d, "deviceType").toLowerCase();
                  return <i key={i} style={{ width: ((Number(d.visitors) || 0) / devicesTotal) * 100 + "%", background: deviceColors[key] ?? "var(--text-4)" }}></i>;
                })}
              </div>
              <div className="legend">
                {data.devices.map((d, i) => {
                  const key = dimValue(d, "deviceType").toLowerCase();
                  const v = Number(d.visitors) || 0;
                  return (
                    <span className="lg" key={i}>
                      <span className="sw" style={{ background: deviceColors[key] ?? "var(--text-4)" }}></span>
                      {dimValue(d, "deviceType")} <b>{Math.round((v / devicesTotal) * 100)}%</b>
                    </span>
                  );
                })}
              </div>
            </>
          )}
          <div className="section-title" style={{ margin: "22px 0 4px" }}><Icons.window size={15} style={{ color: "var(--text-3)" }} />{tt(lang, "Browsers", "Browsere")}</div>
          <div className="bk">
            {data.browsers.length === 0
              ? <p style={{ fontSize: 13, color: "var(--text-3)" }}>{tt(lang, "No data yet", "Fără date încă")}</p>
              : data.browsers.map((b, i) => <BkRow key={i} label={dimValue(b, "browserName")} v={Number(b.visitors) || 0} max={mx(data.browsers, "visitors")} total={browsersTotal} />)}
          </div>
        </div></div>
      </div>
    </>
  );
}

export function AnalyticsPage({ sites, toast, lang, onNavigate }: { sites: DashSite[]; toast: (m: string) => void; lang: Lang; onNavigate: (p: PageId) => void }) {
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
          <div className="kicker">// {tt(lang, "Workspace", "Spațiu de lucru")}</div>
          <h1 className="page-title">{tt(lang, "Analytics", "Statistici")}</h1>
        </div>
        <div className="empty">
          <div className="em-ic"><Icons.rocket size={26} /></div>
          <div className="em-h">{tt(lang, "No sites yet", "Niciun site încă")}</div>
          <div className="em-d">{tt(lang, "Generate your first website to see analytics here.", "Generează primul tău site pentru a vedea statisticile aici.")}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="page view-enter">
      <div className="page-head flex">
        <div>
          <div className="kicker">// {tt(lang, "Workspace", "Spațiu de lucru")}</div>
          <h1 className="page-title">{tt(lang, "Analytics", "Statistici")}</h1>
          <p className="page-sub">{tt(lang, "Real visitor data read from this site's Vercel project.", "Date reale despre vizitatori, citite din proiectul Vercel al acestui site.")}</p>
        </div>
        <div className="an-toolbar">
          <SiteSelect sites={sites} sel={sel} onSelect={setSel} />
          <div className="seg">{ranges.map((r) => <button key={r} className={range === r ? "on" : ""} onClick={() => setRange(r)}>{r}</button>)}</div>
        </div>
      </div>
      {site.status === "draft" ? (
        <div className="empty">
          <div className="em-ic"><Icons.rocket size={26} /></div>
          <div className="em-h">{tt(lang, "No analytics yet", "Nicio statistică încă")}</div>
          <div className="em-d"><b style={{ color: "var(--text-2)" }}>{site.name}</b> {tt(lang, "is still a draft.", "este încă o ciornă.")}</div>
          <button className="b b-primary" onClick={() => toast(tt(lang, "Open the site to publish it", "Deschide site-ul pentru a-l publica"))}><Icons.rocket size={15} />{tt(lang, "Publish site", "Publică site-ul")}</button>
        </div>
      ) : (
        <AnalyticsBody site={site} range={range} lang={lang} onNavigate={onNavigate} />
      )}
    </div>
  );
}
