"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DemoBistro, DemoPhoto, DemoPlumbing } from "@/app/components/SiteDemos";

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
      <span style={{ fontFamily: T.font, fontSize: size * 0.62, fontWeight: 800, color: T.six, letterSpacing: -0.5, lineHeight: 1 }}>6</span>
    </div>
  );
}

type Site = { id: string; name: string; vercel_url: string; github_url: string; status: string; current_version: number; edit_count: number; custom_domain: string | null; created_at: string; };
type User = { id: string; email: string; paymentStatus: string; };

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const r = await fetch("/api/auth/me");
        if (!r.ok) { router.push("/login"); return; }
        const d = await r.json();
        setUser(d.user);
        const sr = await fetch("/api/sites");
        if (sr.ok) setSites((await sr.json()).sites || []);
      } catch { router.push("/login"); }
      finally { setLoading(false); }
    }
    load();
  }, [router]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  };

  if (loading) return (
    <div style={{ background: T.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 28, height: 28, borderRadius: 14, border: `2px solid ${T.line}`, borderTopColor: T.six, animation: "dspin .8s linear infinite" }}/>
      <style>{`@keyframes dspin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <>
      <style>{`*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; } @keyframes dspin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ background: T.bg, minHeight: "100vh", fontFamily: T.font }}>

        {/* ── NAV ─────────────────────────────────────────────── */}
        <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, background: "rgba(250,250,248,.94)", backdropFilter: "blur(14px)", borderBottom: `1px solid ${T.line}`, height: 58 }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 28px", height: "100%", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: 9, textDecoration: "none" }}>
              <Mark size={24} />
              <span style={{ fontFamily: T.font, fontSize: 16, fontWeight: 700, color: T.ink, letterSpacing: -0.5 }}>insixlive</span>
            </Link>
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <span style={{ fontFamily: T.mono, fontSize: 11, color: T.muted, letterSpacing: 0.2 }}>{user?.email}</span>
              <Link href="/help/setup-custom-domain" style={{ fontFamily: T.font, fontSize: 13, color: T.muted, textDecoration: "none" }}>Domain setup</Link>
              <button onClick={handleLogout} style={{ fontFamily: T.font, fontSize: 13, color: T.muted, background: "none", border: "none", cursor: "pointer" }}>Log out</button>
            </div>
          </div>
        </nav>

        {/* ── CONTENT ─────────────────────────────────────────── */}
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "80px 28px 60px" }}>

          {/* Header */}
          <div style={{ paddingTop: 32, marginBottom: 40, display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
            <div>
              <span style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, letterSpacing: "0.14em", textTransform: "uppercase" as const }}>Dashboard</span>
              <h1 style={{ fontFamily: T.font, fontSize: "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1.1, color: T.ink, marginTop: 10 }}>
                My websites
              </h1>
            </div>
            <Link href="/generate" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: T.ink, color: "#fff", padding: "12px 24px", borderRadius: 12, fontFamily: T.font, fontSize: 14, fontWeight: 600, textDecoration: "none", boxShadow: "0 4px 14px rgba(10,14,20,0.14)" }}>
              + New website
            </Link>
          </div>

          {/* Empty state */}
          {sites.length === 0 && (
            <div>
              {/* Example sites */}
              <div style={{ marginBottom: 14 }}>
                <span style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, letterSpacing: "0.12em", textTransform: "uppercase" as const }}>Example sites made with insixlive</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18, marginBottom: 48 }}>
                <DemoBistro compact />
                <DemoPhoto compact />
                <DemoPlumbing compact />
              </div>

              {/* CTA card */}
              <div style={{ border: `1.5px dashed ${T.line}`, borderRadius: 16, padding: "52px 32px", textAlign: "center", background: T.bg2 }}>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: T.bg, border: `1px solid ${T.line}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px" }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={T.six} strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14"/></svg>
                </div>
                <p style={{ fontFamily: T.font, fontSize: 18, fontWeight: 700, color: T.ink, margin: "0 0 8px", letterSpacing: -0.4 }}>No websites yet</p>
                <p style={{ fontFamily: T.font, fontSize: 14, color: T.muted, margin: "0 0 24px", lineHeight: 1.65 }}>
                  Create your first AI-generated website in six minutes.
                </p>
                <Link href="/generate" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: T.ink, color: "#fff", padding: "13px 28px", borderRadius: 12, fontFamily: T.font, fontSize: 14, fontWeight: 600, textDecoration: "none" }}>
                  Create your first website
                  <svg width="14" height="14" viewBox="0 0 16 16"><path d="M3 8h10M9 4l4 4-4 4" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </Link>
              </div>
            </div>
          )}

          {/* Site cards */}
          {sites.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
              {sites.map(site => (
                <div key={site.id} style={{ background: "#fff", border: `1px solid ${T.line}`, borderRadius: 14, padding: 20, display: "flex", flexDirection: "column" }}>
                  {/* Mini browser preview */}
                  <div style={{ height: 120, background: T.ink, borderRadius: 10, marginBottom: 16, overflow: "hidden", position: "relative" }}>
                    {/* Browser chrome mini */}
                    <div style={{ height: 24, background: "#1A1A1A", display: "flex", alignItems: "center", padding: "0 10px", gap: 5 }}>
                      {["#FF5F57","#FEBC2E","#28C840"].map(c => <div key={c} style={{ width: 7, height: 7, borderRadius: "50%", background: c }}/>)}
                      <div style={{ flex: 1, height: 14, background: "#2A2A2A", borderRadius: 3, marginLeft: 6, display: "flex", alignItems: "center", padding: "0 6px" }}>
                        <span style={{ fontFamily: T.mono, fontSize: 7, color: "#666", letterSpacing: 0.2 }}>{site.vercel_url?.replace("https://","")}</span>
                      </div>
                    </div>
                    {/* Site preview */}
                    <div style={{ padding: "8px 10px" }}>
                      <div style={{ height: 4, width: "45%", background: T.six, borderRadius: 2, marginBottom: 5 }}/>
                      <div style={{ height: 3, width: "70%", background: "rgba(255,255,255,0.2)", borderRadius: 2, marginBottom: 4 }}/>
                      <div style={{ height: 3, width: "55%", background: "rgba(255,255,255,0.12)", borderRadius: 2, marginBottom: 8 }}/>
                      <div style={{ display: "flex", gap: 5 }}>
                        <div style={{ width: 44, height: 14, background: T.six, borderRadius: 3 }}/>
                        <div style={{ width: 36, height: 14, border: "1px solid rgba(255,255,255,0.2)", borderRadius: 3 }}/>
                      </div>
                    </div>
                  </div>

                  {/* Card info */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                    <div>
                      <h3 style={{ fontFamily: T.font, fontSize: 15, fontWeight: 700, color: T.ink, margin: "0 0 4px", letterSpacing: -0.3 }}>{site.name}</h3>
                      <p style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, margin: 0, letterSpacing: 0.2 }}>
                        {new Date(site.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: 5, background: T.emSoft, borderRadius: 99, padding: "3px 9px" }}>
                        <div style={{ width: 5, height: 5, borderRadius: 3, background: T.em }}/>
                        <span style={{ fontFamily: T.mono, fontSize: 9, color: T.em2, letterSpacing: 0.5 }}>Live</span>
                      </div>
                      {(site.current_version ?? 1) > 1 && (
                        <div style={{ background: T.bg2, border: `1px solid ${T.line}`, borderRadius: 99, padding: "3px 8px" }}>
                          <span style={{ fontFamily: T.mono, fontSize: 9, color: T.muted }}>v{site.current_version}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <p style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, marginBottom: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {site.vercel_url?.replace("https://","")}
                  </p>

                  <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: "auto" }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <a href={site.vercel_url} target="_blank" rel="noopener noreferrer" style={{ flex: 1, background: T.ink, color: "#fff", padding: "9px 0", borderRadius: 9, fontFamily: T.font, fontSize: 13, fontWeight: 600, textDecoration: "none", textAlign: "center" as const }}>View site</a>
                      <a href={site.github_url} target="_blank" rel="noopener noreferrer" style={{ flex: 1, border: `1px solid ${T.line}`, color: T.ink, padding: "9px 0", borderRadius: 9, fontFamily: T.font, fontSize: 13, textDecoration: "none", textAlign: "center" as const }}>View code</a>
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <Link href={`/domains/${site.id}`} style={{ flex: 1, border: `1px solid ${T.line}`, color: T.muted, padding: "9px 0", borderRadius: 9, fontFamily: T.font, fontSize: 12, textDecoration: "none", textAlign: "center" as const, display: "block" }}>
                        {site.custom_domain ? `🌐 ${site.custom_domain}` : "+ Domain"}
                      </Link>
                      <Link href={`/edit/${site.id}`} style={{ flex: 1, border: `1px solid ${T.six}`, color: T.six, padding: "9px 0", borderRadius: 9, fontFamily: T.font, fontSize: 12, fontWeight: 500, textDecoration: "none", textAlign: "center" as const, display: "block" }}>
                        Edit — €15
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
