"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

const T = {
  ink: "#0A0E14", six: "#FF5A1F", em: "#00B377", em2: "#009062",
  emSoft: "#E5F7EE", bg: "#FAFAFA", bg2: "#F2F2EF", line: "#E2E2DE",
  muted: "#6B7180",
  font: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
  mono: 'ui-monospace, "SF Mono", "JetBrains Mono", Menlo, monospace',
};

type DomainResult = { name: string; tld: string; available: boolean; price: number; };
type DnsRecord = { type: string; name: string; value: string; };
type Site = { id: string; name: string; vercel_url: string; vercel_project_id: string; custom_domain: string | null; };

function Mark({ size = 24 }: { size?: number }) {
  return (
    <div style={{ width: size, height: size, borderRadius: size * 0.28, background: T.ink, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <span style={{ fontFamily: T.font, fontSize: size * 0.62, fontWeight: 800, color: T.six, lineHeight: 1 }}>6</span>
    </div>
  );
}

function CopyBtn({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      style={{ background: copied ? T.emSoft : T.bg2, border: `1px solid ${copied ? "rgba(0,179,119,0.25)" : T.line}`, color: copied ? T.em2 : T.muted, borderRadius: 7, padding: "4px 10px", fontFamily: T.mono, fontSize: 11, cursor: "pointer", flexShrink: 0, transition: "all .15s" }}>
      {copied ? "Copied!" : (label ?? "Copy")}
    </button>
  );
}

function DnsTable({ domain }: { domain: string }) {
  const records: DnsRecord[] = [
    { type: "A",     name: "@",   value: "76.76.21.21" },
    { type: "CNAME", name: "www", value: "cname.vercel-dns.com" },
  ];
  return (
    <div style={{ border: `1px solid ${T.line}`, borderRadius: 12, overflow: "hidden", marginBottom: 20 }}>
      <div style={{ background: T.ink, padding: "12px 18px" }}>
        <p style={{ fontFamily: T.mono, fontSize: 10, color: "rgba(255,255,255,.5)", letterSpacing: "0.12em", textTransform: "uppercase" as const, margin: 0 }}>
          Add these DNS records at your registrar
        </p>
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: T.font, fontSize: 13, background: T.bg }}>
        <thead>
          <tr style={{ background: T.bg2, borderBottom: `1px solid ${T.line}` }}>
            {["Type", "Name", "Value", ""].map(h => (
              <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontFamily: T.mono, fontSize: 10, color: T.muted, letterSpacing: "0.1em", textTransform: "uppercase" as const, fontWeight: 400 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {records.map((r, i) => (
            <tr key={i} style={{ borderBottom: i < records.length - 1 ? `1px solid ${T.line}` : "none" }}>
              <td style={{ padding: "12px 16px" }}>
                <span style={{ background: r.type === "A" ? "rgba(255,90,31,0.08)" : "rgba(0,0,0,0.04)", border: `1px solid ${r.type === "A" ? "rgba(255,90,31,0.18)" : T.line}`, color: r.type === "A" ? T.six : T.ink, borderRadius: 5, padding: "2px 7px", fontFamily: T.mono, fontSize: 11, fontWeight: 700 }}>{r.type}</span>
              </td>
              <td style={{ padding: "12px 16px", fontFamily: T.mono, fontSize: 12 }}>{r.name}</td>
              <td style={{ padding: "12px 16px", fontFamily: T.mono, fontSize: 12, color: T.ink, wordBreak: "break-all" as const }}>{r.value}</td>
              <td style={{ padding: "12px 16px" }}><CopyBtn text={r.value} /></td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ padding: "12px 16px", background: T.bg2, borderTop: `1px solid ${T.line}` }}>
        <p style={{ fontFamily: T.font, fontSize: 12, color: T.muted, margin: 0 }}>
          After adding records, DNS propagates in <strong style={{ color: T.ink }}>15–60 minutes</strong>. Come back and click "Check Status" to verify.
        </p>
      </div>
    </div>
  );
}

const GUIDES: Record<string, { name: string; url: string; steps: string[] }> = {
  namecheap: {
    name: "Namecheap",
    url: "https://namecheap.com",
    steps: [
      "Log in → click Domain List in the left sidebar",
      "Find your domain → click Manage",
      'Go to the "Advanced DNS" tab',
      'Delete existing A records, then add: Type=A, Host=@, Value=76.76.21.21, TTL=Auto',
      'Add: Type=CNAME, Host=www, Value=cname.vercel-dns.com, TTL=Auto',
      "Click the green checkmark to save each record",
      "Wait 15–30 minutes then click Check Status above",
    ],
  },
  godaddy: {
    name: "GoDaddy",
    url: "https://godaddy.com",
    steps: [
      "Log in → click My Products → find your domain → click DNS",
      "Edit the existing A record: point @ to 76.76.21.21",
      'Add a CNAME record: Name=www, Value=cname.vercel-dns.com',
      "Save all changes",
      "Wait 15–30 minutes then click Check Status above",
    ],
  },
  porkbun: {
    name: "Porkbun",
    url: "https://porkbun.com",
    steps: [
      "Log in → Domain Management → click Manage on your domain",
      "Click DNS Records at the top",
      'Add A record: Host=blank, Answer=76.76.21.21, TTL=600',
      'Add CNAME record: Host=www, Answer=cname.vercel-dns.com, TTL=600',
      "Save → wait 15–30 minutes → Check Status",
    ],
  },
  other: {
    name: "Other registrar",
    url: "#",
    steps: [
      "Log in to your domain registrar",
      "Find DNS management / DNS records / Zone editor",
      "Add an A record: Name=@ (or leave blank), Value=76.76.21.21",
      "Add a CNAME record: Name=www, Value=cname.vercel-dns.com",
      "Save and wait 15–60 minutes, then click Check Status",
    ],
  },
};

function RegistrarGuides({ domain }: { domain: string }) {
  const [open, setOpen] = useState<string | null>(null);
  return (
    <div style={{ marginBottom: 20 }}>
      <p style={{ fontFamily: T.font, fontSize: 13, fontWeight: 600, color: T.ink, marginBottom: 10 }}>Step-by-step guides by registrar:</p>
      {Object.entries(GUIDES).map(([key, guide]) => (
        <div key={key} style={{ border: `1px solid ${T.line}`, borderRadius: 10, marginBottom: 8, overflow: "hidden" }}>
          <button onClick={() => setOpen(open === key ? null : key)}
            style={{ width: "100%", padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", background: open === key ? T.bg2 : T.bg, border: "none", cursor: "pointer", fontFamily: T.font, fontSize: 14, fontWeight: 600, color: T.ink }}>
            <span>{guide.name}</span>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ transform: open === key ? "rotate(180deg)" : "none", transition: "transform .2s" }}>
              <path d="M2 5l5 5 5-5" stroke={T.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          {open === key && (
            <div style={{ padding: "12px 16px 16px", background: T.bg2, borderTop: `1px solid ${T.line}` }}>
              <ol style={{ paddingLeft: 18, margin: 0 }}>
                {guide.steps.map((step, i) => (
                  <li key={i} style={{ fontFamily: T.font, fontSize: 13, color: T.muted, lineHeight: 1.7, marginBottom: 4 }}>{step}</li>
                ))}
              </ol>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function DomainsContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const siteId = params.siteId as string;

  const [site, setSite] = useState<Site | null>(null);
  const [tab, setTab] = useState<"buy" | "existing">(searchParams.get("tab") === "existing" ? "existing" : "buy");

  // Buy tab state
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<DomainResult[]>([]);
  const [selected, setSelected] = useState<DomainResult | null>(null);
  const [buying, setBuying] = useState(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Existing domain tab state
  const [manualDomain, setManualDomain] = useState("");
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);
  const [connectError, setConnectError] = useState("");
  const [dnsRecords, setDnsRecords] = useState<DnsRecord[]>([]);
  const [checkingDns, setCheckingDns] = useState(false);
  const [dnsStatus, setDnsStatus] = useState<{ configured: boolean; message: string } | null>(null);
  const [connectedDomain, setConnectedDomain] = useState("");

  useEffect(() => {
    fetch("/api/auth/me").then(r => r.json()).then(d => {
      if (!d.user) { router.push("/login"); return; }
    });
    fetch("/api/sites").then(r => r.json()).then(d => {
      const s = (d.sites as Site[])?.find(s => s.id === siteId);
      if (s) setSite(s);
    });
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

  const handleBuyViaVercel = async (domain: string) => {
    setBuying(true);
    try {
      const r = await fetch("/api/domains/buy-redirect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domainName: domain, siteId }),
      });
      const d = await r.json();
      // Open Vercel domains page in new tab, show return instructions
      window.open(d.checkoutUrl, "_blank");
      setSelected(null);
      // After buying on Vercel, user will use "I already own it" to connect
      setTab("existing");
      setManualDomain(domain);
    } finally { setBuying(false); }
  };

  const handleConnect = async (domainName: string) => {
    setConnecting(true); setConnectError(""); setDnsRecords([]);
    try {
      const r = await fetch("/api/domains/auto-connect-purchased", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteId, domainName }),
      });
      const d = await r.json();
      if (!r.ok) { setConnectError(d.error || "Failed to connect domain."); return; }
      setDnsRecords(d.dnsRecords ?? [{ type: "A", name: "@", value: "76.76.21.21" }, { type: "CNAME", name: "www", value: "cname.vercel-dns.com" }]);
      setConnected(true);
      setConnectedDomain(domainName);
    } catch { setConnectError("Network error. Please try again."); }
    finally { setConnecting(false); }
  };

  const handleCheckDns = async () => {
    if (!connectedDomain && !manualDomain) return;
    const dom = connectedDomain || manualDomain;
    setCheckingDns(true); setDnsStatus(null);
    try {
      const r = await fetch(`/api/domains/check-status?domain=${encodeURIComponent(dom)}`);
      const d = await r.json();
      setDnsStatus(d);
    } finally { setCheckingDns(false); }
  };

  return (
    <>
      <style>{`*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; } body { background: ${T.bg}; } @keyframes dspin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ background: T.bg, minHeight: "100vh", fontFamily: T.font }}>

        {/* Nav */}
        <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, background: "rgba(250,250,248,.94)", backdropFilter: "blur(14px)", borderBottom: `1px solid ${T.line}`, height: 58 }}>
          <div style={{ maxWidth: 860, margin: "0 auto", padding: "0 20px", height: "100%", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
              <Mark size={24} /><span style={{ fontSize: 16, fontWeight: 700, color: T.ink, letterSpacing: -0.5 }}>in<span style={{ color: T.six }}>six</span>live</span>
            </Link>
            <Link href="/dashboard" style={{ fontSize: 13, color: T.muted, textDecoration: "none" }}>← Dashboard</Link>
          </div>
        </nav>

        <div style={{ maxWidth: 680, margin: "0 auto", padding: "80px 20px 60px" }}>

          {/* Header */}
          <div style={{ marginBottom: 28 }}>
            <span style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, letterSpacing: "0.14em", textTransform: "uppercase" as const }}>Custom Domain</span>
            <h1 style={{ fontFamily: T.font, fontSize: "clamp(1.6rem, 3vw, 2.2rem)", fontWeight: 800, letterSpacing: "-0.04em", color: T.ink, marginTop: 10, marginBottom: 6 }}>
              {site?.name ?? "Your site"}
            </h1>
            {site?.vercel_url && (
              <p style={{ fontFamily: T.font, fontSize: 13, color: T.muted }}>
                Currently at <a href={site.vercel_url} target="_blank" rel="noopener noreferrer" style={{ color: T.six, textDecoration: "none", fontFamily: T.mono, fontSize: 12 }}>{site.vercel_url.replace("https://","")}</a>
              </p>
            )}
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 4, marginBottom: 24, background: T.bg2, borderRadius: 10, padding: 4, border: `1px solid ${T.line}` }}>
            {([["buy","Buy New Domain"],["existing","I Own a Domain"]] as const).map(([key, label]) => (
              <button key={key} onClick={() => setTab(key)}
                style={{ flex: 1, padding: "9px 0", borderRadius: 8, border: "none", cursor: "pointer", fontFamily: T.font, fontSize: 14, fontWeight: 600, transition: "all .15s",
                  background: tab === key ? "#fff" : "transparent",
                  color: tab === key ? T.ink : T.muted,
                  boxShadow: tab === key ? "0 1px 4px rgba(0,0,0,0.08)" : "none" }}>
                {label}
              </button>
            ))}
          </div>

          {/* ── BUY NEW DOMAIN TAB ──────────────────────────── */}
          {tab === "buy" && (
            <div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontFamily: T.mono, fontSize: 10, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: T.muted, display: "block", marginBottom: 8 }}>
                  Search for a domain
                </label>
                <div style={{ position: "relative" }}>
                  <input type="text" value={query} onChange={e => handleSearch(e.target.value)}
                    placeholder="e.g. medicalscrubs, myhairsalon, plumberberlin…"
                    style={{ width: "100%", border: query ? `1.5px solid ${T.ink}` : `1px solid ${T.line}`, borderRadius: 12, padding: "13px 16px 13px 40px", background: "#fff", fontFamily: T.font, fontSize: 15, color: T.ink, outline: "none" }} />
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={T.muted} strokeWidth="2" style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)" }}>
                    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35" strokeLinecap="round"/>
                  </svg>
                  {searching && <div style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, borderRadius: 7, border: `2px solid ${T.line}`, borderTopColor: T.ink, animation: "dspin .8s linear infinite" }}/>}
                </div>
              </div>

              {results.length > 0 && (
                <div style={{ border: `1px solid ${T.line}`, borderRadius: 12, overflow: "hidden", marginBottom: 20 }}>
                  {results.map((r, i) => (
                    <div key={r.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderBottom: i < results.length - 1 ? `1px solid ${T.line}` : "none", background: selected?.name === r.name ? "rgba(10,14,20,0.02)" : "#fff", cursor: r.available ? "pointer" : "default" }}
                      onClick={() => r.available && setSelected(r)}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 7, height: 7, borderRadius: "50%", background: r.available ? T.em : T.line, flexShrink: 0 }}/>
                        <span style={{ fontFamily: T.mono, fontSize: 14, color: r.available ? T.ink : T.muted, fontWeight: r.available ? 500 : 400 }}>{r.name}</span>
                      </div>
                      {r.available
                        ? <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <span style={{ fontFamily: T.mono, fontSize: 12, color: T.muted }}>€{r.price}/yr</span>
                            <span style={{ fontFamily: T.font, fontSize: 12, fontWeight: 600, color: T.em2, background: T.emSoft, padding: "3px 8px", borderRadius: 6 }}>Available</span>
                          </div>
                        : <span style={{ fontFamily: T.font, fontSize: 12, color: T.muted }}>Taken</span>}
                    </div>
                  ))}
                </div>
              )}

              {selected && (
                <div style={{ border: `1.5px solid ${T.ink}`, borderRadius: 14, padding: "20px 20px 18px", marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                    <div>
                      <p style={{ fontFamily: T.mono, fontSize: 15, fontWeight: 700, color: T.ink, margin: 0 }}>{selected.name}</p>
                      <p style={{ fontFamily: T.font, fontSize: 13, color: T.muted, marginTop: 3 }}>€{selected.price}/year · available now</p>
                    </div>
                    <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", cursor: "pointer", color: T.muted, fontSize: 20, lineHeight: 1 }}>×</button>
                  </div>
                  <div style={{ background: T.bg2, border: `1px solid ${T.line}`, borderRadius: 10, padding: "10px 14px", marginBottom: 14 }}>
                    <p style={{ fontFamily: T.font, fontSize: 13, color: T.muted, margin: 0 }}>
                      After purchasing on Vercel, return here and use the <strong style={{ color: T.ink }}>"I Own a Domain"</strong> tab to connect it automatically.
                    </p>
                  </div>
                  <a href={`https://vercel.com/domains?search=${selected.name}`} target="_blank" rel="noopener noreferrer"
                    style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: T.ink, color: "#fff", padding: "13px 20px", borderRadius: 10, fontFamily: T.font, fontSize: 14, fontWeight: 600, textDecoration: "none", boxShadow: "0 4px 14px rgba(10,14,20,0.14)" }}>
                    <svg width="14" height="14" viewBox="0 0 76 76" fill="currentColor"><path d="M37.5274 0L75.0548 65H0L37.5274 0Z"/></svg>
                    Buy on Vercel
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/></svg>
                  </a>
                </div>
              )}

              {!searching && query.length >= 2 && results.length === 0 && (
                <p style={{ fontFamily: T.font, fontSize: 14, color: T.muted, textAlign: "center", padding: "20px 0" }}>No results. Try a different name.</p>
              )}
            </div>
          )}

          {/* ── EXISTING DOMAIN TAB ─────────────────────────── */}
          {tab === "existing" && !connected && (
            <div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontFamily: T.mono, fontSize: 10, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: T.muted, display: "block", marginBottom: 8 }}>
                  Your domain name
                </label>
                <div style={{ display: "flex", gap: 10 }}>
                  <input type="text" value={manualDomain} onChange={e => setManualDomain(e.target.value)}
                    placeholder="medicalscrubs.com"
                    style={{ flex: 1, border: manualDomain ? `1.5px solid ${T.ink}` : `1px solid ${T.line}`, borderRadius: 12, padding: "13px 16px", background: "#fff", fontFamily: T.mono, fontSize: 15, color: T.ink, outline: "none" }}
                    onKeyDown={e => { if (e.key === "Enter" && manualDomain.trim()) handleConnect(manualDomain.trim()); }} />
                  <button onClick={() => handleConnect(manualDomain.trim())} disabled={!manualDomain.trim() || connecting}
                    style={{ background: manualDomain.trim() && !connecting ? T.ink : "#E2E2E5", color: manualDomain.trim() && !connecting ? "#fff" : "#A0A0A8", border: "none", borderRadius: 12, padding: "0 22px", fontFamily: T.font, fontSize: 14, fontWeight: 600, cursor: manualDomain.trim() && !connecting ? "pointer" : "default", flexShrink: 0, display: "flex", alignItems: "center", gap: 8 }}>
                    {connecting ? <><span style={{ width: 14, height: 14, borderRadius: 7, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", animation: "dspin .8s linear infinite", display: "inline-block" }}/> Connecting…</> : "Connect →"}
                  </button>
                </div>
                {connectError && <p style={{ fontFamily: T.font, fontSize: 13, color: "#C43600", marginTop: 10 }}>{connectError}</p>}
              </div>

              {/* DNS records (shown upfront for self-service) */}
              <div style={{ marginBottom: 20 }}>
                <p style={{ fontFamily: T.font, fontSize: 13, color: T.muted, marginBottom: 12 }}>
                  Add these records to your registrar <em>before</em> connecting, or connect first and we'll give you the exact records.
                </p>
                <DnsTable domain={manualDomain || "yourdomain.com"} />
                <RegistrarGuides domain={manualDomain || "yourdomain.com"} />
              </div>
            </div>
          )}

          {/* ── POST-CONNECT: DNS RECORDS + STATUS ─────────── */}
          {connected && (
            <div>
              <div style={{ background: T.emSoft, border: `1px solid rgba(0,179,119,0.25)`, borderRadius: 14, padding: "16px 20px", marginBottom: 24, display: "flex", gap: 12, alignItems: "center" }}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="9" stroke={T.em2} strokeWidth="1.5"/><path d="M6 10l3 3 5-5" stroke={T.em2} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <div>
                  <p style={{ fontWeight: 600, fontSize: 14, color: T.em2, margin: 0 }}>Domain added: <strong>{connectedDomain}</strong></p>
                  <p style={{ fontSize: 12, color: T.em2, opacity: 0.8, margin: "3px 0 0" }}>Configure the DNS records below to make it live.</p>
                </div>
              </div>

              <DnsTable domain={connectedDomain} />
              <RegistrarGuides domain={connectedDomain} />

              {/* DNS Status Check */}
              <button onClick={handleCheckDns} disabled={checkingDns}
                style={{ width: "100%", background: checkingDns ? "#E2E2E5" : T.ink, color: checkingDns ? "#A0A0A8" : "#fff", border: "none", borderRadius: 12, padding: "14px 0", fontFamily: T.font, fontSize: 14, fontWeight: 600, cursor: checkingDns ? "default" : "pointer", marginBottom: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                {checkingDns ? <><span style={{ width: 14, height: 14, borderRadius: 7, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", animation: "dspin .8s linear infinite", display: "inline-block" }}/> Checking DNS…</> : "Check DNS Status"}
              </button>

              {dnsStatus && (
                <div style={{ padding: "14px 18px", borderRadius: 12, background: dnsStatus.configured ? T.emSoft : "rgba(255,90,31,0.06)", border: `1px solid ${dnsStatus.configured ? "rgba(0,179,119,0.25)" : "rgba(255,90,31,0.2)"}`, marginBottom: 16 }}>
                  <p style={{ fontFamily: T.font, fontSize: 13, color: dnsStatus.configured ? T.em2 : T.six, margin: 0, fontWeight: 500 }}>
                    {dnsStatus.configured ? "✓ " : "⏳ "}{dnsStatus.message}
                  </p>
                  {dnsStatus.configured && (
                    <a href={`https://${connectedDomain}`} target="_blank" rel="noopener noreferrer"
                      style={{ display: "inline-block", marginTop: 10, background: T.em2, color: "#fff", padding: "8px 18px", borderRadius: 8, fontFamily: T.font, fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
                      Visit {connectedDomain} ↗
                    </a>
                  )}
                </div>
              )}
            </div>
          )}

          <div style={{ marginTop: 32, paddingTop: 20, borderTop: `1px solid ${T.line}` }}>
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
