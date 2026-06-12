"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

// ─── Design tokens ────────────────────────────────────────────────────────────
const T = {
  ink:      "#0A0E14",
  bg:       "#FFFFFF",
  bg2:      "#F7F7F8",
  line:     "#ECECEC",
  muted:    "#6B7180",
  emerald2: "#009062",
  emeraldSoft: "#E5F7EE",
  six:      "#FF5A1F",
  font:     '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", system-ui, sans-serif',
  mono:     'ui-monospace, "SF Mono", "JetBrains Mono", Menlo, monospace',
};

function Mark({ size = 28 }: { size?: number }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: size * 0.28,
      background: T.ink, display: "flex", alignItems: "center",
      justifyContent: "center", flexShrink: 0,
    }}>
      <span style={{ fontFamily: T.font, fontSize: size * 0.62, fontWeight: 800, color: T.six, letterSpacing: -0.5, lineHeight: 1 }}>6</span>
    </div>
  );
}

function FormField({ label, value, placeholder, type = "text", onChange }: {
  label: string; value: string; placeholder: string;
  type?: string; onChange: (v: string) => void;
}) {
  const active = value.length > 0;
  return (
    <div style={{
      border: active ? `1.5px solid ${T.ink}` : `1px solid ${T.line}`,
      borderRadius: 14, padding: "10px 16px", background: T.bg,
      boxShadow: active ? "0 0 0 4px rgba(10,14,20,0.05)" : "none",
      transition: "border .15s, box-shadow .15s",
    }}>
      <div style={{ fontFamily: T.font, fontSize: 11, fontWeight: 600, color: active ? T.ink : T.muted, letterSpacing: 0.4, textTransform: "uppercase" as const }}>{label}</div>
      <input
        type={type} value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%", border: "none", outline: "none", background: "transparent",
          fontFamily: T.font, fontSize: 16, fontWeight: 500,
          color: active ? T.ink : "#B0AC9F", marginTop: 2, padding: 0,
        }}
      />
    </div>
  );
}

function LoginContent() {
  const searchParams = useSearchParams();
  void searchParams;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [unverified, setUnverified] = useState(false);
  const [resendSent, setResendSent] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const handleLogin = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true); setError(""); setUnverified(false);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.code === "EMAIL_NOT_VERIFIED") setUnverified(true);
        else setError(data.error || "Invalid email or password.");
        return;
      }
      // Full reload so proxy picks up the new session cookie immediately
      window.location.href = "/dashboard";
    } catch { setError("Network error. Please try again."); }
    finally { setLoading(false); }
  };

  const handleResend = async () => {
    setResendLoading(true);
    try {
      await fetch("/api/auth/resend-verification", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setResendSent(true);
    } finally { setResendLoading(false); }
  };

  return (
    <>
      <style>{`
        @keyframes ispin { to { transform: rotate(360deg); } }
        *, *::before, *::after { box-sizing: border-box; }
        html, body { margin: 0; background: ${T.bg2}; overflow-x: hidden; }
        .auth-panel { display: flex; }
        .auth-left  { width: 42%; min-width: 340px; }
        .auth-right { flex: 1; }
        @media (max-width: 700px) {
          .auth-panel { display: block; }
          .auth-left  { display: none !important; }
          .auth-right { min-height: 100vh; padding: 48px 24px 40px !important; display: flex; align-items: flex-start !important; justify-content: center; }
          .auth-right > div { max-width: 100% !important; width: 100% !important; }
        }
      `}</style>

      <div className="auth-panel" style={{ minHeight: "100vh", background: T.bg2, display: "flex", alignItems: "stretch" }}>

        {/* ── Left: branding panel ─────────────────────────────── */}
        <div className="auth-left" style={{
          width: "42%", minWidth: 340, background: T.ink, position: "relative",
          overflow: "hidden", display: "flex", flexDirection: "column", padding: "36px 44px",
        }}>
          {/* Grid */}
          <svg style={{ position: "absolute", inset: 0, opacity: 0.05, width: "100%", height: "100%" }}>
            <defs>
              <pattern id="lg" width="24" height="24" patternUnits="userSpaceOnUse">
                <path d="M24 0H0v24" stroke="#fff" strokeWidth="0.5" fill="none"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#lg)"/>
          </svg>
          <div style={{ position: "absolute", top: -100, right: -60, width: 360, height: 360, borderRadius: 180, background: "radial-gradient(circle, rgba(255,90,31,0.4), rgba(255,90,31,0) 65%)", pointerEvents: "none" }}/>
          <div style={{ position: "absolute", bottom: -80, left: -40, width: 280, height: 280, borderRadius: 140, background: "radial-gradient(circle, rgba(255,90,31,0.15), rgba(255,90,31,0) 65%)", pointerEvents: "none" }}/>

          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, position: "relative", zIndex: 2 }}>
            <Mark size={28} />
            <span style={{ fontFamily: T.font, fontSize: 17, fontWeight: 700, color: "#fff", letterSpacing: -0.5 }}>in<span style={{ color: T.six }}>six</span>live</span>
          </div>

          {/* Quote */}
          <div style={{ position: "relative", zIndex: 2, marginTop: "auto" }}>
            <div style={{ width: 40, height: 3, background: T.six, borderRadius: 2, marginBottom: 24 }}/>
            <p style={{ fontFamily: T.font, fontSize: "clamp(1.6rem, 2.5vw, 2.1rem)", fontWeight: 700, letterSpacing: -0.8, color: "#fff", lineHeight: 1.15, margin: "0 0 20px" }}>
              Your website.<br/>Live in 6 minutes.
            </p>
            <p style={{ fontFamily: T.font, fontSize: 15, lineHeight: 1.6, color: "rgba(255,255,255,0.5)", margin: 0, maxWidth: 300 }}>
              Describe your business, choose your design, pay once. Deployed to your Vercel. No subscriptions.
            </p>

            {/* Stats */}
            <div style={{ marginTop: 36, display: "flex", gap: 28 }}>
              {[["€49.99", "one-time"], ["6 min", "to go live"], ["100%", "yours forever"]].map(([v, l]) => (
                <div key={l}>
                  <p style={{ fontFamily: T.font, fontSize: 22, fontWeight: 700, letterSpacing: -0.8, color: "#fff", margin: 0 }}>{v}</p>
                  <p style={{ fontFamily: T.mono, fontSize: 10, color: "rgba(255,255,255,0.4)", margin: "3px 0 0", letterSpacing: 0.4, textTransform: "uppercase" as const }}>{l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right: login form ─────────────────────────────────── */}
        <div className="auth-right" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 48px" }}>
          <div style={{ width: "100%", maxWidth: 400 }}>

            <h2 style={{ fontFamily: T.font, fontSize: 28, fontWeight: 700, letterSpacing: -0.7, color: T.ink, margin: "0 0 6px" }}>
              Welcome back
            </h2>
            <p style={{ fontFamily: T.font, fontSize: 15, color: T.muted, margin: "0 0 28px", lineHeight: 1.45 }}>
              Sign in to manage and generate websites.
            </p>

            {/* Email not verified warning */}
            {unverified && (
              <div style={{ marginBottom: 18, padding: "14px 16px", borderRadius: 12, background: "#FFFBEB", border: "1px solid rgba(234,179,8,0.25)", fontFamily: T.font, fontSize: 14 }}>
                <p style={{ margin: "0 0 6px", fontWeight: 600, color: "#92400e" }}>Email not verified</p>
                <p style={{ margin: "0 0 10px", color: "#92400e", fontSize: 13, opacity: 0.8 }}>Check your inbox for the 6-digit code.</p>
                {!resendSent ? (
                  <button onClick={handleResend} disabled={resendLoading} style={{ background: "none", border: "none", cursor: "pointer", color: "#92400e", fontWeight: 600, fontSize: 13, fontFamily: T.font, padding: 0, textDecoration: "underline" }}>
                    {resendLoading ? "Sending…" : "Resend verification code"}
                  </button>
                ) : (
                  <span style={{ color: T.emerald2, fontSize: 13, fontWeight: 600 }}>✓ Code sent — check your inbox</span>
                )}
              </div>
            )}

            {/* Error */}
            {error && (
              <div style={{ marginBottom: 18, padding: "12px 16px", borderRadius: 12, background: "#FFF0EE", border: "1px solid rgba(255,90,31,0.25)", fontFamily: T.font, fontSize: 14, color: "#C43600", display: "flex", gap: 10, alignItems: "flex-start" }}>
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
                  <circle cx="7.5" cy="7.5" r="6.5" stroke="#C43600" strokeWidth="1.5"/>
                  <path d="M7.5 4.5v4M7.5 10v.5" stroke="#C43600" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <FormField label="Email" value={email} placeholder="you@yourbusiness.com" onChange={setEmail} />
              <FormField label="Password" value={password} placeholder="••••••••" type="password" onChange={setPassword} />

              <div style={{ marginTop: 4 }}>
                <button type="submit" disabled={loading || !email || !password} style={{
                  width: "100%", height: 56, borderRadius: 14, border: "none",
                  background: loading || !email || !password ? "#E2E2E5" : T.ink,
                  color: loading || !email || !password ? "#A0A0A8" : "#fff",
                  fontFamily: T.font, fontSize: 16, fontWeight: 600, letterSpacing: -0.2,
                  cursor: loading || !email || !password ? "default" : "pointer",
                  boxShadow: loading || !email || !password ? "none" : "0 1px 0 rgba(255,255,255,0.08) inset, 0 6px 16px rgba(10,14,20,0.16)",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  transition: "background .15s",
                }}>
                  {loading
                    ? <><span style={{ width: 16, height: 16, borderRadius: 8, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", animation: "ispin .8s linear infinite", display: "inline-block" }} />Signing in…</>
                    : <>Sign in <svg width="16" height="16" viewBox="0 0 16 16"><path d="M3 8h10M9 4l4 4-4 4" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg></>
                  }
                </button>
              </div>
            </form>

            {/* Benefits row */}
            <div style={{ marginTop: 22, display: "flex", flexDirection: "column", gap: 8 }}>
              {["Your site lives on your Vercel account", "No lock-in — download anytime"].map((s) => (
                <div key={s} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 18, height: 18, borderRadius: 9, background: T.emeraldSoft, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <svg width="10" height="10" viewBox="0 0 10 10"><path d="M2 5l2 2 4-4" stroke={T.emerald2} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                  <span style={{ fontFamily: T.font, fontSize: 13, color: T.muted }}>{s}</span>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 22, textAlign: "center", fontFamily: T.font, fontSize: 14, color: T.muted }}>
              No account?{" "}
              <Link href="/signup" style={{ color: T.ink, fontWeight: 600, textDecoration: "none" }}>Create one free</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}
