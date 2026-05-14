"use client";
import Link from "next/link";
import { P, T } from "@/lib/design";

export default function SiteFooter() {
  return (
    <>
      <style>{`
        .sfooter-grid { display: grid; grid-template-columns: 1.4fr repeat(4,1fr); gap: 40px; }
        @media(max-width:900px) { .sfooter-grid { grid-template-columns: 1fr 1fr; gap: 28px; } }
        @media(max-width:600px) { .sfooter-grid { grid-template-columns: 1fr 1fr; gap: 24px; } }
      `}</style>
      <footer style={{
        background: T.bg,
        color: T.text,
        padding: "72px 0 32px",
        position: "relative",
        overflow: "hidden",
        borderTop: `1px solid ${T.line}`,
      }}>
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", backgroundImage: `radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)`, backgroundSize: "18px 18px" }}/>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 32px", position: "relative" }}>
          <div className="sfooter-grid">
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <div style={{ width: 28, height: 28, borderRadius: 7.84, background: P.ink, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ fontFamily: P.font, fontSize: 17, fontWeight: 800, color: P.six, lineHeight: 1 }}>6</span>
                </div>
                <span style={{ fontFamily: P.font, fontSize: 22, fontWeight: 700, color: "#fff", letterSpacing: -0.6 }}>
                  insix<span style={{ color: P.six }}>live</span>
                </span>
              </div>
              <div style={{ fontFamily: P.font, fontSize: 14, color: "rgba(255,255,255,0.55)", lineHeight: 1.5, maxWidth: 280 }}>
                Own your website. Don&apos;t rent it.<br/>AI builds it. Vercel hosts it. You own every line.
              </div>
              <div style={{ marginTop: 18, display: "flex", gap: 8, alignItems: "center", fontFamily: P.mono, fontSize: 11, color: T.muted }}>
                <span style={{ width: 6, height: 6, borderRadius: 3, background: T.green, boxShadow: `0 0 6px ${T.green}` }}/>
                <span>status · all systems live</span>
              </div>
            </div>
            {[
              ["Product",  [["How it works","/how-it-works"],["Examples","/examples"],["Pricing","/pricing"],["Domains","/domains"],["FAQ","/faq"]]],
              ["Account",  [["Log in","/login"],["Sign up","/signup"],["Dashboard","/dashboard"]]],
              ["Support",  [["Domain setup","/help/setup-custom-domain"],["Help center","/help/setup-custom-domain"]]],
              ["Legal",    [["Terms","#"],["Privacy","#"],["Cookies","#"]]],
            ].map(([title, items]) => (
              <div key={title as string}>
                <div style={{ fontFamily: P.mono, fontSize: 10.5, fontWeight: 700, color: T.muted, textTransform: "uppercase" as const, letterSpacing: 0.8, marginBottom: 14 }}>{title}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {(items as [string, string][]).map(([label, href]) => (
                    <Link key={label} href={href} style={{ fontFamily: P.font, fontSize: 13.5, color: "rgba(255,255,255,0.7)", textDecoration: "none" }}>{label}</Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 56, paddingTop: 24, borderTop: `1px solid ${T.line}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, fontFamily: P.mono, fontSize: 11.5, color: T.muted }}>
            <div>© 2026 insixlive · AI-powered website generation</div>
            <div style={{ display: "flex", gap: 18 }}>
              <span>Next.js</span><span style={{ opacity: 0.3 }}>·</span>
              <span>Vercel Edge</span><span style={{ opacity: 0.3 }}>·</span>
              <span>Stripe</span>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
