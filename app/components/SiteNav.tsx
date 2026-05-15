"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { P, NAV_LINKS } from "@/lib/design";

export default function SiteNav() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    fetch("/api/auth/me")
      .then(r => r.json())
      .then(d => setLoggedIn(!!d.user))
      .catch(() => setLoggedIn(false));

    const onScroll = () => setScrolled(window.scrollY > 320);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close overlay when navigating
  useEffect(() => setMenuOpen(false), [pathname]);

  const ctaHref = loggedIn ? "/dashboard" : "/signup";

  return (
    <>
      <style>{`
        html,body{overflow-x:hidden}
        .snav-links { display: flex; gap: 26px; flex: 1; }
        .snav-hamburger { display: none !important; }
        .snav-float { display: none !important; }
        @media(max-width:900px) {
          .snav-links { display: none !important; }
          .snav-hamburger { display: flex !important; }
          .snav-float { display: flex !important; }
          .snav-login { display: none !important; }
          .snav-desktop-cta { display: none !important; }
        }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-8px) } to { opacity: 1; transform: translateY(0) } }
      `}</style>

      {/* ── Main nav bar ── */}
      <header style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(250,250,247,0.88)", backdropFilter: "blur(14px) saturate(180%)", borderBottom: `1px solid ${P.line}` }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px", display: "flex", alignItems: "center", gap: 24, height: 68 }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", flexShrink: 0 }}>
            <div style={{ width: 28, height: 28, borderRadius: 7.84, background: P.ink, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontFamily: P.font, fontSize: 17, fontWeight: 800, color: P.six, lineHeight: 1 }}>6</span>
            </div>
            <span style={{ fontFamily: P.font, fontSize: 22, fontWeight: 700, color: P.ink, letterSpacing: -0.6 }}>
              in<span style={{ color: P.six }}>six</span>live
            </span>
          </Link>

          <nav className="snav-links">
            {NAV_LINKS.map(([href, label]) => {
              const active = pathname === href;
              return (
                <Link key={href} href={href} style={{ fontFamily: P.font, fontSize: 14, fontWeight: active ? 600 : 500, color: active ? P.ink : P.muted, textDecoration: "none", borderBottom: active ? `2px solid ${P.six}` : "2px solid transparent", paddingBottom: 2 }}>
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* Desktop auth + CTA */}
          <div className="snav-login" style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {loggedIn
              ? <Link href="/dashboard" style={{ fontFamily: P.font, fontSize: 14, fontWeight: 500, color: P.inkSoft, textDecoration: "none" }}>Dashboard</Link>
              : <Link href="/login" style={{ fontFamily: P.font, fontSize: 14, fontWeight: 500, color: P.inkSoft, textDecoration: "none" }}>Log in</Link>
            }
          </div>
          <div className="snav-desktop-cta" style={{ display: "flex" }}>
            <Link href={ctaHref} style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "linear-gradient(180deg,#FF6A33 0%,#E54B14 100%)", color: "#fff", padding: "9px 18px", borderRadius: 8, fontFamily: P.font, fontSize: 14, fontWeight: 600, textDecoration: "none", boxShadow: "0 1px 0 rgba(255,255,255,0.20) inset,0 8px 20px rgba(255,90,31,0.28)" }}>
              Build my site{" "}
              <svg width="14" height="14" viewBox="0 0 14 14"><path d="M3 7h8M8 4l3 3-3 3" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </Link>
          </div>

          {/* Hamburger — mobile only */}
          <button
            className="snav-hamburger"
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Open menu"
            style={{ background: "none", border: "none", cursor: "pointer", padding: 8, marginLeft: "auto", display: "none", alignItems: "center", justifyContent: "center", borderRadius: 8, color: P.ink }}
          >
            {menuOpen
              ? <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 4l14 14M18 4L4 18"/></svg>
              : <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 6h16M3 11h16M3 16h16"/></svg>
            }
          </button>
        </div>
      </header>

      {/* ── Mobile overlay menu ── */}
      {menuOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 200, background: P.ink, display: "flex", flexDirection: "column", animation: "slideDown .2s ease both" }}>
          {/* Header row */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", height: 68, borderBottom: `1px solid rgba(255,255,255,0.08)`, flexShrink: 0 }}>
            <Link href="/" onClick={() => setMenuOpen(false)} style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
              <div style={{ width: 28, height: 28, borderRadius: 7.84, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontFamily: P.font, fontSize: 17, fontWeight: 800, color: P.six, lineHeight: 1 }}>6</span>
              </div>
              <span style={{ fontFamily: P.font, fontSize: 22, fontWeight: 700, color: "#fff", letterSpacing: -0.6 }}>
                in<span style={{ color: P.six }}>six</span>live
              </span>
            </Link>
            <button onClick={() => setMenuOpen(false)} aria-label="Close menu" style={{ background: "none", border: "none", cursor: "pointer", padding: 8, color: "rgba(255,255,255,0.7)", display: "flex" }}>
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 4l14 14M18 4L4 18"/></svg>
            </button>
          </div>

          {/* Nav links */}
          <nav style={{ flex: 1, display: "flex", flexDirection: "column", padding: "24px 20px", gap: 4, overflowY: "auto" }}>
            {NAV_LINKS.map(([href, label]) => {
              const active = pathname === href;
              return (
                <Link key={href} href={href} style={{ display: "block", padding: "14px 0", fontFamily: P.font, fontSize: 22, fontWeight: 600, color: active ? P.six : "#fff", textDecoration: "none", borderBottom: "1px solid rgba(255,255,255,0.07)", letterSpacing: -0.4 }}>
                  {label}
                  {active && <span style={{ marginLeft: 8, display: "inline-block", width: 6, height: 6, borderRadius: 3, background: P.six, boxShadow: `0 0 8px ${P.six}`, verticalAlign: "middle" }}/>}
                </Link>
              );
            })}
          </nav>

          {/* Footer actions */}
          <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 10, borderTop: "1px solid rgba(255,255,255,0.08)", flexShrink: 0 }}>
            <Link href={ctaHref} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "linear-gradient(180deg,#FF6A33 0%,#E54B14 100%)", color: "#fff", padding: "16px", borderRadius: 12, fontFamily: P.font, fontSize: 16, fontWeight: 700, textDecoration: "none", boxShadow: "0 1px 0 rgba(255,255,255,0.20) inset,0 12px 28px rgba(255,90,31,0.32)" }}>
              Build my site — from €49
              <svg width="14" height="14" viewBox="0 0 14 14"><path d="M3 7h8M8 4l3 3-3 3" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </Link>
            {loggedIn
              ? <Link href="/dashboard" style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "14px", borderRadius: 12, fontFamily: P.font, fontSize: 15, fontWeight: 500, color: "rgba(255,255,255,0.7)", textDecoration: "none", border: "1px solid rgba(255,255,255,0.12)" }}>Dashboard</Link>
              : <Link href="/login" style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "14px", borderRadius: 12, fontFamily: P.font, fontSize: 15, fontWeight: 500, color: "rgba(255,255,255,0.7)", textDecoration: "none", border: "1px solid rgba(255,255,255,0.12)" }}>Log in</Link>
            }
          </div>
        </div>
      )}

      {/* ── Floating CTA — mobile only, appears on scroll ── */}
      <div
        className="snav-float"
        style={{
          position: "fixed",
          bottom: 24,
          left: "50%",
          transform: `translateX(-50%) translateY(${scrolled ? 0 : 12}px)`,
          opacity: scrolled ? 1 : 0,
          zIndex: 90,
          pointerEvents: scrolled ? "auto" : "none",
          transition: "opacity .3s ease, transform .3s ease",
          display: "none",
        }}
      >
        <Link href={ctaHref} style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "linear-gradient(180deg,#FF6A33 0%,#E54B14 100%)", color: "#fff", padding: "14px 24px", borderRadius: 999, fontFamily: P.font, fontSize: 15, fontWeight: 700, textDecoration: "none", boxShadow: "0 4px 24px rgba(255,90,31,0.45), 0 1px 0 rgba(255,255,255,0.20) inset", whiteSpace: "nowrap" }}>
          Get started
          <svg width="14" height="14" viewBox="0 0 14 14"><path d="M3 7h8M8 4l3 3-3 3" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </Link>
      </div>
    </>
  );
}
