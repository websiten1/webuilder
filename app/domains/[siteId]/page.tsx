"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

const T = {
  ink: "#0A0E14", six: "#FF5A1F", em: "#00B377", em2: "#009062",
  emSoft: "#E5F7EE", bg: "#FAFAFA", bg2: "#F2F2EF", line: "#E2E2DE",
  muted: "#6B7180",
  font: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
  mono: 'ui-monospace, "SF Mono", "JetBrains Mono", Menlo, monospace',
};

type DomainResult = { name: string; tld: string; available: boolean; price: number; };
type DnsRecord = { type: string; name: string; value: string; purpose?: string; };
type Site = { id: string; name: string; vercel_url: string; vercel_project_id: string; custom_domain: string | null; };

function Mark({ size = 24 }: { size?: number }) {
  return (
    <div style={{ width: size, height: size, borderRadius: size * 0.28, background: T.ink, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <span style={{ fontFamily: T.font, fontSize: size * 0.62, fontWeight: 800, color: T.six, lineHeight: 1 }}>6</span>
    </div>
  );
}

function DomainsContent() {
  const params = useParams();
  const router = useRouter();
  const siteId = params.siteId as string;

  const [site, setSite] = useState<Site | null>(null);
  const [loadingPage, setLoadingPage] = useState(true);
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<DomainResult[]>([]);
  const [selected, setSelected] = useState<DomainResult | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [connectError, setConnectError] = useState("");
  const [dnsRecords, setDnsRecords] = useState<DnsRecord[]>([]);
  const [connected, setConnected] = useState(false);
  const [manualDomain, setManualDomain] = useState("");
  const [showManual, setShowManual] = useState(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetch("/api/auth/me").then(r => r.json()).then(d => {
      if (!d.user) { router.push("/login"); return; }
    }).catch(() => router.push("/login"));

    fetch("/api/sites").then(r => r.json()).then(d => {
      const s = (d.sites as Site[])?.find(s => s.id === siteId);
      if (s) { setSite(s); if (s.custom_domain) setConnected(true); }
    }).finally(() => setLoadingPage(false));
  }, [siteId, router]);

  const handleSearch = (q: string) => {
    setQuery(q);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (q.trim().length < 2) { setResults([]); return; }
    searchTimer.current = setTimeout(async () => {
      setSearching(true);
      try {
        const r = await fetch(`/api/domains/search?q=${encodeURIComponent(q.trim())}`);
        const d = await r.json();
        setResults(d.results ?? []);
      } finally { setSearching(false); }
    }, 400);
  };

  const handleConnect = async (domainName: string) => {
    setConnecting(true); setConnectError(""); setDnsRecords([]);
    try {
      const r = await fetch("/api/domains/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteId, domain: domainName }),
      });
      const d = await r.json();
      if (!r.ok) { setConnectError(d.error || "Failed to connect domain."); return; }
      setDnsRecords(d.dnsRecords ?? []);
      setConnected(true);
      setSite(prev => prev ? { ...prev, custom_domain: domainName } : prev);
    } catch { setConnectError("Network error. Please try again."); }
    finally { setConnecting(false); }
  };

  if (loadingPage) return (
    <div style={{ background: T.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 28, height: 28, borderRadius: 14, border: `2px solid ${T.line}`, borderTopColor: T.six, animation: "dsp .8s linear infinite" }}/>
      <style>{`@keyframes dsp { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <>
      <style>{`*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; } body { background: ${T.bg}; } @keyframes dsp { to { transform: rotate(360deg); } } @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } } .dr { animation: fadeIn .25s ease both; }`}</style>
      <div style={{ background: T.bg, minHeight: "100vh", fontFamily: T.font }}>

        {/* Nav */}
        <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, background: "rgba(250,250,248,.94)", backdropFilter: "blur(14px)", borderBottom: `1px solid ${T.line}`, height: 58 }}>
          <div style={{ maxWidth: 860, margin: "0 auto", padding: "0 28px", height: "100%", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
              <Mark size={24} />
              <span style={{ fontSize: 16, fontWeight: 700, color: T.ink, letterSpacing: -0.5 }}>insixlive</span>
            </Link>
            <Link href="/dashboard" style={{ fontSize: 13, color: T.muted, textDecoration: "none" }}>← Dashboard</Link>
          </div>
        </nav>

        <div style={{ maxWidth: 680, margin: "0 auto", padding: "88px 28px 60px" }}>

          {/* Header */}
          <div style={{ marginBottom: 36 }}>
            <span style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, letterSpacing: "0.14em", textTransform: "uppercase" as const }}>Custom Domain</span>
            <h1 style={{ fontFamily: T.font, fontSize: "clamp(1.6rem, 3vw, 2.2rem)", fontWeight: 800, letterSpacing: "-0.04em", color: T.ink, marginTop: 10, marginBottom: 6 }}>
              {site?.name ?? "Your site"}
            </h1>
            <p style={{ fontFamily: T.font, fontSize: 14, color: T.muted, lineHeight: 1.65 }}>
              Currently live at <a href={site?.vercel_url} target="_blank" rel="noopener noreferrer" style={{ color: T.six, textDecoration: "none", fontFamily: T.mono, fontSize: 12 }}>{site?.vercel_url?.replace("https://","")}</a>
            </p>
          </div>

          {/* Already connected */}
          {connected && site?.custom_domain && dnsRecords.length === 0 && (
            <div style={{ background: T.emSoft, border: `1px solid rgba(0,179,119,0.25)`, borderRadius: 14, padding: "18px 22px", marginBottom: 28, display: "flex", gap: 12, alignItems: "center" }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="9" stroke={T.em2} strokeWidth="1.5"/><path d="M6 10l3 3 5-5" stroke={T.em2} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <div>
                <p style={{ fontWeight: 600, fontSize: 14, color: T.em2, margin: 0 }}>Domain connected: {site.custom_domain}</p>
                <p style={{ fontSize: 12, color: T.em2, opacity: 0.8, margin: "3px 0 0" }}>Configure DNS records below to make it live.</p>
              </div>
            </div>
          )}

          {/* DNS Records after connection */}
          {dnsRecords.length > 0 && (
            <div className="dr" style={{ marginBottom: 28, border: `1px solid ${T.line}`, borderRadius: 14, overflow: "hidden" }}>
              <div style={{ background: T.ink, padding: "14px 20px" }}>
                <p style={{ fontFamily: T.mono, fontSize: 10, color: "rgba(255,255,255,.5)", letterSpacing: "0.12em", textTransform: "uppercase" as const, margin: 0 }}>Configure these DNS records at your registrar</p>
              </div>
              <div style={{ background: T.bg2 }}>
                {dnsRecords.filter(r => !r.purpose).map((r, i) => (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "60px 80px 1fr", gap: 12, padding: "14px 20px", borderBottom: i < dnsRecords.filter(r => !r.purpose).length - 1 ? `1px solid ${T.line}` : "none", alignItems: "center" }}>
                    <span style={{ fontFamily: T.mono, fontSize: 11, fontWeight: 700, color: T.six, background: "rgba(255,90,31,0.08)", padding: "2px 6px", borderRadius: 4, textAlign: "center" as const }}>{r.type}</span>
                    <span style={{ fontFamily: T.mono, fontSize: 12, color: T.muted }}>{r.name}</span>
                    <span style={{ fontFamily: T.mono, fontSize: 12, color: T.ink, wordBreak: "break-all" as const }}>{r.value}</span>
                  </div>
                ))}
              </div>
              <div style={{ padding: "12px 20px", background: T.bg, borderTop: `1px solid ${T.line}` }}>
                <p style={{ fontFamily: T.font, fontSize: 12, color: T.muted, margin: 0 }}>DNS changes take 5–60 minutes to propagate. Your site will be live at <strong style={{ color: T.ink }}>{site?.custom_domain}</strong> once DNS is configured.</p>
              </div>
            </div>
          )}

          {/* Search section */}
          {!connected && (
            <>
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontFamily: T.mono, fontSize: 10, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: T.muted, display: "block", marginBottom: 8 }}>
                  Search for a domain
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type="text" value={query}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="e.g. medicalscrubs, joanrestaurant, plumberberlin…"
                    style={{ width: "100%", border: query ? `1.5px solid ${T.ink}` : `1px solid ${T.line}`, borderRadius: 12, padding: "13px 16px 13px 42px", background: "#fff", fontFamily: T.font, fontSize: 15, color: T.ink, outline: "none", boxShadow: query ? `0 0 0 4px rgba(10,14,20,0.05)` : "none" }}
                  />
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={T.muted} strokeWidth="2" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }}>
                    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35" strokeLinecap="round"/>
                  </svg>
                  {searching && <div style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, borderRadius: 7, border: `2px solid ${T.line}`, borderTopColor: T.ink, animation: "dsp .8s linear infinite" }}/>}
                </div>
              </div>

              {/* Search results */}
              {results.length > 0 && (
                <div style={{ marginBottom: 28, border: `1px solid ${T.line}`, borderRadius: 14, overflow: "hidden" }}>
                  {results.map((r, i) => (
                    <div key={r.name} className="dr" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderBottom: i < results.length - 1 ? `1px solid ${T.line}` : "none", background: selected?.name === r.name ? "rgba(10,14,20,0.03)" : "#fff", cursor: r.available ? "pointer" : "default" }}
                      onClick={() => r.available && setSelected(r)}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 8, height: 8, borderRadius: 4, background: r.available ? T.em : T.line, flexShrink: 0 }}/>
                        <span style={{ fontFamily: T.mono, fontSize: 14, color: r.available ? T.ink : T.muted, fontWeight: r.available ? 500 : 400 }}>{r.name}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        {r.available ? (
                          <>
                            <span style={{ fontFamily: T.mono, fontSize: 12, color: T.muted }}>€{r.price}/yr</span>
                            <span style={{ fontFamily: T.font, fontSize: 12, fontWeight: 600, color: T.em2, background: T.emSoft, padding: "3px 8px", borderRadius: 6 }}>Available</span>
                          </>
                        ) : (
                          <span style={{ fontFamily: T.font, fontSize: 12, color: T.muted }}>Taken</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Selected domain actions */}
              {selected && (
                <div className="dr" style={{ border: `1.5px solid ${T.ink}`, borderRadius: 14, padding: "22px 22px", marginBottom: 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                    <div>
                      <p style={{ fontFamily: T.mono, fontSize: 15, fontWeight: 700, color: T.ink, margin: 0 }}>{selected.name}</p>
                      <p style={{ fontFamily: T.font, fontSize: 13, color: T.muted, marginTop: 3 }}>€{selected.price}/year · available now</p>
                    </div>
                    <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", cursor: "pointer", color: T.muted, fontSize: 18 }}>×</button>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {/* Buy on Vercel */}
                    <a href={`https://vercel.com/domains?search=${selected.name}`} target="_blank" rel="noopener noreferrer"
                      style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: T.ink, color: "#fff", padding: "13px 20px", borderRadius: 10, fontFamily: T.font, fontSize: 14, fontWeight: 600, textDecoration: "none", boxShadow: "0 4px 14px rgba(10,14,20,0.14)" }}>
                      <svg width="16" height="16" viewBox="0 0 76 76" fill="currentColor"><path d="M37.5274 0L75.0548 65H0L37.5274 0Z"/></svg>
                      Buy on Vercel
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/></svg>
                    </a>
                    <div style={{ textAlign: "center", fontFamily: T.font, fontSize: 12, color: T.muted }}>— or buy at Namecheap, GoDaddy, etc. —</div>
                    {/* Connect after buying */}
                    <button onClick={() => handleConnect(selected.name)} disabled={connecting}
                      style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, border: `1.5px solid ${T.em}`, color: T.em2, background: T.emSoft, padding: "12px 20px", borderRadius: 10, fontFamily: T.font, fontSize: 14, fontWeight: 600, cursor: connecting ? "default" : "pointer" }}>
                      {connecting
                        ? <><span style={{ width: 14, height: 14, borderRadius: 7, border: `2px solid rgba(0,144,98,0.3)`, borderTopColor: T.em2, animation: "dsp .8s linear infinite", display: "inline-block" }}/> Connecting…</>
                        : <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg> I already own it — Connect now</>}
                    </button>
                  </div>
                  {connectError && <p style={{ fontFamily: T.font, fontSize: 13, color: "#C43600", marginTop: 12, marginBottom: 0 }}>{connectError}</p>}
                </div>
              )}
            </>
          )}

          {/* Already have a domain elsewhere */}
          {!connected && (
            <div style={{ marginTop: 24 }}>
              <button onClick={() => setShowManual((m: boolean) => !m)} style={{ fontFamily: T.font, fontSize: 13, color: T.muted, background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: showManual ? "rotate(90deg)" : "none", transition: "transform .2s" }}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
                I already have a domain — connect it manually
              </button>
              {showManual && (
                <div className="dr" style={{ marginTop: 14, border: `1px solid ${T.line}`, borderRadius: 12, padding: "18px 20px" }}>
                  <p style={{ fontFamily: T.font, fontSize: 13, color: T.muted, marginBottom: 12 }}>
                    Enter any domain you own (bought anywhere — Namecheap, GoDaddy, Vercel, etc.)
                  </p>
                  <div style={{ display: "flex", gap: 10 }}>
                    <input
                      type="text" value={manualDomain}
                      onChange={(e) => setManualDomain(e.target.value)}
                      placeholder="yourbusiness.com"
                      style={{ flex: 1, border: manualDomain ? `1.5px solid ${T.ink}` : `1px solid ${T.line}`, borderRadius: 10, padding: "11px 14px", fontFamily: T.mono, fontSize: 14, color: T.ink, background: "#fff", outline: "none" }}
                      onKeyDown={(e) => { if (e.key === "Enter" && manualDomain.trim()) handleConnect(manualDomain.trim()); }}
                    />
                    <button onClick={() => handleConnect(manualDomain.trim())} disabled={!manualDomain.trim() || connecting}
                      style={{ background: manualDomain.trim() && !connecting ? T.ink : "#E2E2E5", color: manualDomain.trim() && !connecting ? "#fff" : "#A0A0A8", border: "none", borderRadius: 10, padding: "0 18px", fontFamily: T.font, fontSize: 14, fontWeight: 600, cursor: manualDomain.trim() && !connecting ? "pointer" : "default" }}>
                      {connecting ? "…" : "Connect"}
                    </button>
                  </div>
                  {connectError && <p style={{ fontFamily: T.font, fontSize: 13, color: "#C43600", marginTop: 10, marginBottom: 0 }}>{connectError}</p>}
                </div>
              )}
            </div>
          )}

          {/* Back to site */}
          <div style={{ marginTop: 40, paddingTop: 24, borderTop: `1px solid ${T.line}` }}>
            <Link href="/dashboard" style={{ fontFamily: T.font, fontSize: 13, color: T.muted, textDecoration: "none" }}>← Back to dashboard</Link>
          </div>
        </div>
      </div>
    </>
  );
}

export default function DomainsPage() {
  return <Suspense><DomainsContent /></Suspense>;
}
