"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { P, NAV_LINKS } from "@/lib/design";

export default function SiteNav() {
  const [loggedIn, setLoggedIn] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    fetch("/api/auth/me")
      .then(r => r.json())
      .then(d => setLoggedIn(!!d.user))
      .catch(() => setLoggedIn(false));
  }, []);

  const ctaHref = loggedIn ? "/dashboard" : "/signup";

  return (
    <>
      <style>{`
        .snav-links { display: flex; gap: 26px; flex: 1; }
        @media(max-width:900px) { .snav-links { display: none !important; } }
      `}</style>
      <header style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: "rgba(250,250,247,0.88)",
        backdropFilter: "blur(14px) saturate(180%)",
        borderBottom: `1px solid ${P.line}`,
      }}>
        <div style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 32px",
          display: "flex",
          alignItems: "center",
          gap: 32,
          height: 68,
        }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <div style={{ width: 28, height: 28, borderRadius: 7.84, background: P.ink, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ fontFamily: P.font, fontSize: 17, fontWeight: 800, color: P.six, lineHeight: 1 }}>6</span>
            </div>
            <span style={{ fontFamily: P.font, fontSize: 22, fontWeight: 700, color: P.ink, letterSpacing: -0.6 }}>
              insix<span style={{ color: P.six }}>live</span>
            </span>
          </Link>
          <nav className="snav-links">
            {NAV_LINKS.map(([href, label]) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  style={{
                    fontFamily: P.font,
                    fontSize: 14,
                    fontWeight: active ? 600 : 500,
                    color: active ? P.ink : P.muted,
                    textDecoration: "none",
                    borderBottom: active ? `2px solid ${P.six}` : "2px solid transparent",
                    paddingBottom: 2,
                  }}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {loggedIn
              ? <Link href="/dashboard" style={{ fontFamily: P.font, fontSize: 14, fontWeight: 500, color: P.inkSoft, textDecoration: "none" }}>Dashboard</Link>
              : <Link href="/login" style={{ fontFamily: P.font, fontSize: 14, fontWeight: 500, color: P.inkSoft, textDecoration: "none" }}>Log in</Link>
            }
            <Link href={ctaHref} style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "linear-gradient(180deg,#FF6A33 0%,#E54B14 100%)",
              color: "#fff",
              padding: "9px 18px",
              borderRadius: 8,
              fontFamily: P.font,
              fontSize: 14,
              fontWeight: 600,
              textDecoration: "none",
              boxShadow: "0 1px 0 rgba(255,255,255,0.20) inset,0 8px 20px rgba(255,90,31,0.28)",
            }}>
              Build my site{" "}
              <svg width="14" height="14" viewBox="0 0 14 14"><path d="M3 7h8M8 4l3 3-3 3" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </Link>
          </div>
        </div>
      </header>
    </>
  );
}
