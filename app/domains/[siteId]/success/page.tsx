"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";

const T = {
  ink: "#0A0E14", six: "#FF5A1F", em: "#00B377", em2: "#009062",
  emSoft: "#E5F7EE", bg: "#FAFAFA", bg2: "#F2F2EF", line: "#E2E2DE",
  muted: "#6B7180",
  font: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
  mono: 'ui-monospace, "SF Mono", "JetBrains Mono", Menlo, monospace',
};

function Mark({ size = 26 }: { size?: number }) {
  return (
    <div style={{ width: size, height: size, borderRadius: size * 0.28, background: T.ink, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <span style={{ fontFamily: T.font, fontSize: size * 0.62, fontWeight: 800, color: T.six, lineHeight: 1 }}>6</span>
    </div>
  );
}

type State = "connecting" | "success" | "needs_dns" | "error";

function SuccessContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const siteId = params.siteId as string;
  const domainName = searchParams.get("domain") ?? "";
  const isPurchased = searchParams.get("purchased") === "true";

  const [state, setState] = useState<State>("connecting");
  const [errorMsg, setErrorMsg] = useState("");
  const [dnsConfigured, setDnsConfigured] = useState(false);
  const called = useRef(false);

  useEffect(() => {
    if (!domainName || !siteId || called.current) return;
    called.current = true;
    connect();
  }, [domainName, siteId]); // eslint-disable-line react-hooks/exhaustive-deps

  async function connect() {
    try {
      const r = await fetch("/api/domains/auto-connect-purchased", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteId, domainName }),
      });
      const d = await r.json();
      if (!r.ok) {
        setState("error");
        setErrorMsg(d.error ?? "Could not connect domain.");
        return;
      }
      // Domain was added to Vercel project — check if DNS is already configured
      setState("needs_dns");
    } catch {
      setState("error");
      setErrorMsg("Network error. Please try again.");
    }
  }

  async function checkDns() {
    const r = await fetch(`/api/domains/check-status?domain=${encodeURIComponent(domainName)}`);
    const d = await r.json();
    if (d.configured) {
      setDnsConfigured(true);
      setState("success");
    }
    return d;
  }

  return (
    <>
      <style>{`*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; } body { background: ${T.bg}; } @keyframes dspin { to { transform: rotate(360deg); } } @keyframes fadeIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } } .fi { animation: fadeIn .4s ease both; }`}</style>

      <div style={{ background: T.bg, minHeight: "100vh", fontFamily: T.font }}>

        {/* Nav */}
        <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, background: "rgba(250,250,248,.94)", backdropFilter: "blur(14px)", borderBottom: `1px solid ${T.line}`, height: 58 }}>
          <div style={{ maxWidth: 680, margin: "0 auto", padding: "0 20px", height: "100%", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
              <Mark size={24} /><span style={{ fontSize: 16, fontWeight: 700, color: T.ink, letterSpacing: -0.5 }}>insixlive</span>
            </Link>
            <Link href="/dashboard" style={{ fontSize: 13, color: T.muted, textDecoration: "none" }}>Dashboard</Link>
          </div>
        </nav>

        <div style={{ maxWidth: 560, margin: "0 auto", padding: "100px 20px 60px" }}>

          {/* Connecting */}
          {state === "connecting" && (
            <div className="fi" style={{ textAlign: "center" }}>
              <div style={{ width: 64, height: 64, borderRadius: "50%", border: `3px solid ${T.line}`, borderTopColor: T.six, animation: "dspin 1s linear infinite", margin: "0 auto 28px" }}/>
              <h1 style={{ fontFamily: T.font, fontSize: "1.8rem", fontWeight: 800, letterSpacing: "-0.04em", color: T.ink, marginBottom: 10 }}>Connecting domain…</h1>
              <p style={{ fontFamily: T.font, fontSize: 15, color: T.muted }}>{domainName}</p>
              <p style={{ fontFamily: T.mono, fontSize: 12, color: T.muted, marginTop: 8 }}>Adding to your Vercel project · usually takes 2–5 seconds</p>
            </div>
          )}

          {/* Needs DNS */}
          {(state === "needs_dns") && (
            <div className="fi">
              <div style={{ textAlign: "center", marginBottom: 36 }}>
                <div style={{ width: 64, height: 64, borderRadius: "50%", background: T.emSoft, border: `1px solid rgba(0,179,119,0.25)`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={T.em2} strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                </div>
                <h1 style={{ fontFamily: T.font, fontSize: "1.8rem", fontWeight: 800, letterSpacing: "-0.04em", color: T.ink, marginBottom: 8 }}>Domain added!</h1>
                <p style={{ fontFamily: T.mono, fontSize: 14, color: T.six }}>{domainName}</p>
                <p style={{ fontFamily: T.font, fontSize: 14, color: T.muted, marginTop: 8, lineHeight: 1.65 }}>
                  {isPurchased
                    ? "Your domain was purchased on Vercel and added to your project. Configure DNS below to make it live."
                    : "Your domain was added to your project. Configure DNS at your registrar to make it live."}
                </p>
              </div>

              {/* DNS records */}
              <div style={{ border: `1px solid ${T.line}`, borderRadius: 12, overflow: "hidden", marginBottom: 20 }}>
                <div style={{ background: T.ink, padding: "12px 18px" }}>
                  <p style={{ fontFamily: T.mono, fontSize: 10, color: "rgba(255,255,255,.5)", letterSpacing: "0.12em", textTransform: "uppercase" as const, margin: 0 }}>Add these DNS records at your registrar</p>
                </div>
                <div style={{ background: T.bg }}>
                  {[
                    { type: "A",     name: "@",   value: "76.76.21.21" },
                    { type: "CNAME", name: "www", value: "cname.vercel-dns.com" },
                  ].map((r, i, arr) => (
                    <div key={i} style={{ display: "grid", gridTemplateColumns: "56px 60px 1fr auto", gap: 12, padding: "14px 18px", alignItems: "center", borderBottom: i < arr.length - 1 ? `1px solid ${T.line}` : "none" }}>
                      <span style={{ background: "rgba(255,90,31,0.08)", border: "1px solid rgba(255,90,31,0.18)", color: T.six, borderRadius: 5, padding: "2px 7px", fontFamily: T.mono, fontSize: 11, fontWeight: 700, textAlign: "center" as const }}>{r.type}</span>
                      <span style={{ fontFamily: T.mono, fontSize: 12, color: T.muted }}>{r.name}</span>
                      <span style={{ fontFamily: T.mono, fontSize: 12, color: T.ink }}>{r.value}</span>
                      <button onClick={() => navigator.clipboard.writeText(r.value)}
                        style={{ background: T.bg2, border: `1px solid ${T.line}`, color: T.muted, borderRadius: 7, padding: "4px 10px", fontFamily: T.mono, fontSize: 11, cursor: "pointer" }}>Copy</button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Check Status */}
              <CheckDnsButton onCheck={checkDns} configured={dnsConfigured} domain={domainName} />

              <div style={{ marginTop: 20, textAlign: "center" }}>
                <Link href="/dashboard" style={{ fontFamily: T.font, fontSize: 13, color: T.muted, textDecoration: "none" }}>Back to dashboard — check again later</Link>
              </div>
            </div>
          )}

          {/* Full success */}
          {state === "success" && (
            <div className="fi" style={{ textAlign: "center" }}>
              <div style={{ width: 72, height: 72, borderRadius: "50%", background: T.emSoft, border: `1px solid rgba(0,179,119,0.25)`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={T.em2} strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
              </div>
              <h1 style={{ fontFamily: T.font, fontSize: "2rem", fontWeight: 800, letterSpacing: "-0.04em", color: T.ink, marginBottom: 8 }}>
                Domain connected!
              </h1>
              <p style={{ fontFamily: T.font, fontSize: 15, color: T.muted, marginBottom: 24 }}>
                Your website is live at
              </p>
              <a href={`https://${domainName}`} target="_blank" rel="noopener noreferrer"
                style={{ fontFamily: T.mono, fontSize: 18, fontWeight: 700, color: T.six, textDecoration: "none", display: "block", marginBottom: 28, wordBreak: "break-all" as const }}>
                {domainName}
              </a>
              <div style={{ background: T.emSoft, border: `1px solid rgba(0,179,119,0.2)`, borderRadius: 12, padding: "14px 18px", marginBottom: 28, textAlign: "left" as const }}>
                {[
                  "SSL certificate automatically issued",
                  "Website is secure (HTTPS enabled)",
                  "Changes via edits apply to this domain instantly",
                ].map(s => (
                  <div key={s} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
                    <svg width="13" height="13" viewBox="0 0 10 10"><path d="M2 5l2 2 4-4" stroke={T.em2} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    <span style={{ fontFamily: T.font, fontSize: 13, color: T.em2 }}>{s}</span>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <a href={`https://${domainName}`} target="_blank" rel="noopener noreferrer"
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: T.ink, color: "#fff", padding: "15px 0", borderRadius: 12, fontFamily: T.font, fontSize: 15, fontWeight: 700, textDecoration: "none", boxShadow: "0 4px 16px rgba(10,14,20,0.16)" }}>
                  Visit your website ↗
                </a>
                <Link href="/dashboard" style={{ display: "flex", alignItems: "center", justifyContent: "center", background: T.bg2, border: `1px solid ${T.line}`, color: T.ink, padding: "14px 0", borderRadius: 12, fontFamily: T.font, fontSize: 14, fontWeight: 500, textDecoration: "none" }}>
                  Back to dashboard
                </Link>
              </div>
            </div>
          )}

          {/* Error */}
          {state === "error" && (
            <div className="fi" style={{ textAlign: "center" }}>
              <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(255,90,31,0.08)", border: "1px solid rgba(255,90,31,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={T.six} strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg>
              </div>
              <h1 style={{ fontFamily: T.font, fontSize: "1.6rem", fontWeight: 800, letterSpacing: "-0.04em", color: T.ink, marginBottom: 8 }}>Connection failed</h1>
              <p style={{ fontFamily: T.font, fontSize: 14, color: T.muted, marginBottom: 20, lineHeight: 1.65 }}>{errorMsg}</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <button onClick={() => { setState("connecting"); called.current = false; connect(); }}
                  style={{ background: T.ink, color: "#fff", border: "none", borderRadius: 12, padding: "14px 0", fontFamily: T.font, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
                  Try again
                </button>
                <Link href={`/domains/${siteId}`} style={{ display: "block", background: T.bg2, border: `1px solid ${T.line}`, color: T.ink, padding: "13px 0", borderRadius: 12, fontFamily: T.font, fontSize: 14, textDecoration: "none", textAlign: "center" as const }}>
                  Back to domain setup
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function CheckDnsButton({ onCheck, configured, domain }: { onCheck: () => Promise<{ configured: boolean; message: string }>; configured: boolean; domain: string }) {
  const [checking, setChecking] = useState(false);
  const [status, setStatus] = useState<{ configured: boolean; message: string } | null>(null);
  const [checks, setChecks] = useState(0);

  const check = async () => {
    setChecking(true);
    const result = await onCheck();
    setStatus(result);
    setChecks(c => c + 1);
    setChecking(false);
  };

  return (
    <div>
      <button onClick={check} disabled={checking || configured}
        style={{ width: "100%", background: checking || configured ? "#E2E2E5" : T.ink, color: checking || configured ? "#A0A0A8" : "#fff", border: "none", borderRadius: 12, padding: "14px 0", fontFamily: T.font, fontSize: 14, fontWeight: 600, cursor: checking || configured ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 10 }}>
        {checking ? <><span style={{ width: 14, height: 14, borderRadius: 7, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", animation: "dspin .8s linear infinite", display: "inline-block" }}/> Checking…</> : configured ? "✓ DNS Verified" : `Check DNS Status${checks > 0 ? ` (${checks})` : ""}`}
      </button>
      {status && !status.configured && (
        <div style={{ padding: "12px 16px", borderRadius: 10, background: "rgba(255,90,31,0.06)", border: "1px solid rgba(255,90,31,0.18)", marginBottom: 10 }}>
          <p style={{ fontFamily: T.font, fontSize: 13, color: T.six, margin: 0 }}>⏳ {status.message}</p>
          <p style={{ fontFamily: T.mono, fontSize: 11, color: T.muted, marginTop: 4 }}>Check again in 5–10 minutes.</p>
        </div>
      )}
    </div>
  );
}

export default function DomainSuccessPage() {
  return <Suspense><SuccessContent /></Suspense>;
}
