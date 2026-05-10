"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// ─── Design tokens (from insixlive Signup.html) ───────────────────────────────
const T = {
  ink:      "#0A0E14",
  ink2:     "#1B2230",
  inkSoft:  "#2A3242",
  bg:       "#FFFFFF",
  bg2:      "#F7F7F8",
  line:     "#ECECEC",
  muted:    "#6B7180",
  emerald:  "#00B377",
  emerald2: "#009062",
  emeraldSoft: "#E5F7EE",
  six:      "#FF5A1F",
  sixSoft:  "#FFEDE4",
  font:     '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", system-ui, sans-serif',
  mono:     'ui-monospace, "SF Mono", "JetBrains Mono", Menlo, monospace',
};

// ─── Primitives ───────────────────────────────────────────────────────────────

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

function Wordmark({ size = 20 }: { size?: number }) {
  return (
    <span style={{ fontFamily: T.font, fontSize: size, fontWeight: 700, color: T.ink, letterSpacing: -0.5, lineHeight: 1 }}>
      insixlive
    </span>
  );
}

function LiveChip() {
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "5px 11px", borderRadius: 999,
      background: T.emeraldSoft, color: T.emerald2,
      fontFamily: T.font, fontSize: 12, fontWeight: 600,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: 3, background: T.emerald }} />
      Live in 6 minutes
    </div>
  );
}

function FormField({ label, value, placeholder, type = "text", onChange, filled }: {
  label: string; value: string; placeholder: string;
  type?: string; onChange: (v: string) => void; filled?: boolean;
}) {
  const active = filled ?? value.length > 0;
  return (
    <div style={{
      border: active ? `1.5px solid ${T.ink}` : `1px solid ${T.line}`,
      borderRadius: 14, padding: "10px 16px",
      background: T.bg,
      boxShadow: active ? `0 0 0 4px rgba(10,14,20,0.05)` : "none",
      transition: "border .15s, box-shadow .15s",
    }}>
      <div style={{ fontFamily: T.font, fontSize: 11, fontWeight: 600, color: active ? T.ink : T.muted, letterSpacing: 0.4, textTransform: "uppercase" as const }}>{label}</div>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%", border: "none", outline: "none", background: "transparent",
          fontFamily: type === "password" ? T.mono : T.font,
          fontSize: 16, fontWeight: 500, color: active ? T.ink : "#B0AC9F",
          marginTop: 2, padding: 0,
        }}
      />
    </div>
  );
}

function PrimaryBtn({ children, onClick, disabled, loading }: {
  children: React.ReactNode; onClick?: () => void;
  disabled?: boolean; loading?: boolean;
}) {
  return (
    <button onClick={onClick} disabled={disabled || loading} style={{
      width: "100%", height: 56, borderRadius: 14, border: "none",
      background: disabled || loading ? "#E2E2E5" : T.ink,
      color: disabled || loading ? "#A0A0A8" : "#fff",
      fontFamily: T.font, fontSize: 16, fontWeight: 600, letterSpacing: -0.2,
      cursor: disabled || loading ? "default" : "pointer",
      boxShadow: disabled || loading ? "none" : "0 1px 0 rgba(255,255,255,0.08) inset, 0 6px 16px rgba(10,14,20,0.16)",
      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
      transition: "background .15s",
    }}>
      {loading
        ? <><span style={{ width: 16, height: 16, borderRadius: 8, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", animation: "ispin .8s linear infinite", display: "inline-block" }} /><span>Creating account…</span></>
        : children}
    </button>
  );
}

// ─── OTP boxes ────────────────────────────────────────────────────────────────
function OtpBoxes({ value, onChange, disabled }: { value: string[]; onChange: (v: string[]) => void; disabled: boolean }) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (i: number, raw: string) => {
    const digit = raw.replace(/\D/g, "").slice(-1);
    const next = [...value]; next[i] = digit;
    onChange(next);
    if (digit && i < 5) setTimeout(() => refs.current[i + 1]?.focus(), 0);
  };
  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace") {
      if (value[i]) { const n = [...value]; n[i] = ""; onChange(n); }
      else if (i > 0) refs.current[i - 1]?.focus();
    } else if (e.key === "ArrowLeft" && i > 0) refs.current[i - 1]?.focus();
    else if (e.key === "ArrowRight" && i < 5) refs.current[i + 1]?.focus();
  };
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const digits = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!digits) return;
    const next = [...value];
    digits.split("").forEach((d, i) => { if (i < 6) next[i] = d; });
    onChange(next);
    setTimeout(() => refs.current[Math.min(digits.length, 5)]?.focus(), 0);
  };

  return (
    <div style={{ display: "flex", gap: 10, justifyContent: "center" }} onPaste={handlePaste}>
      {value.map((digit, i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          type="text" inputMode="numeric" maxLength={1} value={digit}
          disabled={disabled}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onFocus={(e) => e.target.select()}
          style={{
            width: 52, height: 64, borderRadius: 14,
            border: digit ? `2px solid ${T.ink}` : `1.5px solid ${T.line}`,
            background: digit ? T.bg : T.bg2,
            boxShadow: digit ? `0 0 0 4px rgba(10,14,20,0.05)` : "none",
            fontFamily: T.mono, fontSize: "1.75rem", fontWeight: 700,
            textAlign: "center" as const, outline: "none", color: T.ink,
            transition: "border .12s, box-shadow .12s",
          }}
        />
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [verifying, setVerifying] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [emailWarning, setEmailWarning] = useState("");

  // Auto-verify when all 6 digits filled
  useEffect(() => {
    if (showOtp && digits.every((d) => d !== "")) {
      handleVerify(digits.join(""));
    }
  }, [digits, showOtp]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  const handleSignup = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, confirmPassword }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Signup failed. Please try again."); return; }
      if (data.emailWarning) setEmailWarning(data.emailWarning);
      setShowOtp(true);
    } catch { setError("Network error. Please try again."); }
    finally { setLoading(false); }
  };

  const handleVerify = async (code: string) => {
    if (verifying) return;
    setVerifying(true); setOtpError("");
    try {
      const res = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.toLowerCase(), code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setOtpError(data.error || "Incorrect code. Please try again.");
        setDigits(["", "", "", "", "", ""]); setVerifying(false); return;
      }
      router.push("/dashboard");
    } catch { setOtpError("Network error. Please try again."); setVerifying(false); }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || resendLoading) return;
    setResendLoading(true); setOtpError("");
    try {
      await fetch("/api/auth/resend-verification", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.toLowerCase() }),
      });
      setResendCooldown(60); setDigits(["", "", "", "", "", ""]);
    } finally { setResendLoading(false); }
  };

  const benefits = [
    ["Your Vercel deployment", "Site lives on your own account — not ours"],
    ["Code on GitHub", "Full source code, yours forever"],
    ["No marketing email", "Only updates about your site"],
    ["Zero lock-in", "Download and host anywhere, anytime"],
  ];

  return (
    <>
      <style>{`
        @keyframes ispin { to { transform: rotate(360deg); } }
        @keyframes iblink { 50% { opacity: 0.4; } }
        * { box-sizing: border-box; }
        body { margin: 0; background: ${T.bg2}; }
      `}</style>

      <div style={{ minHeight: "100vh", background: T.bg2, display: "flex", alignItems: "stretch" }}>

        {/* ── Left panel: dark hero ─────────────────────────────── */}
        <div style={{
          width: "42%", minWidth: 360, background: T.ink, position: "relative",
          overflow: "hidden", display: "flex", flexDirection: "column",
          padding: "36px 44px",
        }}>
          {/* Grid texture */}
          <svg style={{ position: "absolute", inset: 0, opacity: 0.05, width: "100%", height: "100%" }}>
            <defs>
              <pattern id="sg" width="24" height="24" patternUnits="userSpaceOnUse">
                <path d="M24 0H0v24" stroke="#fff" strokeWidth="0.5" fill="none"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#sg)"/>
          </svg>
          {/* Orange glow */}
          <div style={{ position: "absolute", top: -120, right: -80, width: 400, height: 400, borderRadius: 200, background: "radial-gradient(circle, rgba(255,90,31,0.5), rgba(255,90,31,0) 65%)", pointerEvents: "none" }}/>
          {/* Bottom glow */}
          <div style={{ position: "absolute", bottom: -100, left: -50, width: 320, height: 320, borderRadius: 160, background: "radial-gradient(circle, rgba(255,90,31,0.18), rgba(255,90,31,0) 65%)", pointerEvents: "none" }}/>

          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, position: "relative", zIndex: 2 }}>
            <Mark size={28} />
            <span style={{ fontFamily: T.font, fontSize: 17, fontWeight: 700, color: "#fff", letterSpacing: -0.5 }}>insixlive</span>
          </div>

          {/* Stacked site previews */}
          <div style={{ position: "relative", zIndex: 2, marginTop: 48, display: "flex", flexDirection: "column", gap: 10, transform: "rotate(-2deg)" }}>
            {[
              { bg: "#FFFFFF", accent: T.six,    label: "Maria's Hair Studio",    dark: false },
              { bg: "#0F1A2A", accent: T.emerald, label: "Acme Plumbing · 24/7", dark: true },
              { bg: T.sixSoft, accent: T.ink,    label: "Lia · Photographer",    dark: false },
            ].map((s, i) => (
              <div key={i} style={{
                background: s.bg, borderRadius: 12, padding: "10px 14px",
                display: "flex", alignItems: "center", gap: 10,
                boxShadow: "0 6px 18px rgba(0,0,0,0.28)",
                border: "1px solid rgba(255,255,255,0.1)",
                transform: `translateX(${i * 16}px)`,
              }}>
                <div style={{ display: "flex", gap: 4 }}>
                  {[0,1,2].map(j => <div key={j} style={{ width: 7, height: 7, borderRadius: 4, background: s.dark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.12)" }}/>)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ height: 5, width: "65%", background: s.accent, borderRadius: 2, marginBottom: 4 }}/>
                  <div style={{ height: 3, width: "45%", background: s.dark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.1)", borderRadius: 2 }}/>
                </div>
                <span style={{ fontFamily: T.mono, fontSize: 9, color: s.dark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.4)", whiteSpace: "nowrap" }}>{s.label}</span>
              </div>
            ))}
          </div>

          {/* Hero copy */}
          <div style={{ position: "relative", zIndex: 2, marginTop: "auto", paddingTop: 48 }}>
            <LiveChip />
            <h1 style={{
              fontFamily: T.font, fontSize: "clamp(2rem, 3vw, 2.6rem)", lineHeight: 1.05,
              fontWeight: 700, letterSpacing: -1.2, color: "#fff",
              margin: "16px 0 14px",
            }}>
              Your website.<br/>€49.99.<br/><span style={{ color: T.six }}>Yours forever.</span>
            </h1>
            <p style={{ fontFamily: T.font, fontSize: 15, lineHeight: 1.55, color: "rgba(255,255,255,0.55)", margin: 0, maxWidth: 320 }}>
              Describe your business. We generate a complete website — code, hosting, and all. No subscriptions. You own everything.
            </p>
          </div>
        </div>

        {/* ── Right panel: form ─────────────────────────────────── */}
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 48px" }}>
          <div style={{ width: "100%", maxWidth: 420 }}>

            {/* ── Step 1: Account form ────────────────────────────── */}
            {!showOtp && (
              <>
                <h2 style={{ fontFamily: T.font, fontSize: 28, fontWeight: 700, letterSpacing: -0.7, color: T.ink, margin: "0 0 6px" }}>
                  Create your account
                </h2>
                <p style={{ fontFamily: T.font, fontSize: 15, color: T.muted, margin: "0 0 28px", lineHeight: 1.45 }}>
                  Takes 30 seconds. No card required yet.
                </p>

                {error && (
                  <div style={{
                    marginBottom: 18, padding: "12px 16px", borderRadius: 12,
                    background: "#FFF0EE", border: `1px solid rgba(255,90,31,0.25)`,
                    fontFamily: T.font, fontSize: 14, color: "#C43600", display: "flex", gap: 10, alignItems: "flex-start",
                  }}>
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
                      <circle cx="7.5" cy="7.5" r="6.5" stroke="#C43600" strokeWidth="1.5"/>
                      <path d="M7.5 4.5v4M7.5 10v.5" stroke="#C43600" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                    {error}
                  </div>
                )}

                <form onSubmit={handleSignup} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <FormField label="Email" value={email} placeholder="you@yourbusiness.com" onChange={setEmail} />
                  <FormField label="Password" value={password} placeholder="Min. 8 characters" type="password" onChange={setPassword} />
                  <FormField label="Confirm password" value={confirmPassword} placeholder="Repeat password" type="password" onChange={setConfirmPassword} />

                  <div style={{ marginTop: 4 }}>
                    <PrimaryBtn loading={loading} disabled={!email || !password || !confirmPassword}>
                      Create account
                      <svg width="16" height="16" viewBox="0 0 16 16"><path d="M3 8h10M9 4l4 4-4 4" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </PrimaryBtn>
                  </div>
                </form>

                {/* Benefits */}
                <div style={{ marginTop: 22, display: "flex", flexDirection: "column", gap: 10 }}>
                  {benefits.map(([title, sub]) => (
                    <div key={title} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                      <div style={{ width: 20, height: 20, borderRadius: 10, background: T.emeraldSoft, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                        <svg width="11" height="11" viewBox="0 0 10 10"><path d="M2 5l2 2 4-4" stroke={T.emerald2} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </div>
                      <div>
                        <div style={{ fontFamily: T.font, fontSize: 13, fontWeight: 600, color: T.ink }}>{title}</div>
                        <div style={{ fontFamily: T.font, fontSize: 12, color: T.muted, marginTop: 1 }}>{sub}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: 22, textAlign: "center", fontFamily: T.font, fontSize: 14, color: T.muted }}>
                  Already have an account?{" "}
                  <Link href="/login" style={{ color: T.ink, fontWeight: 600, textDecoration: "none" }}>Sign in</Link>
                </div>
                <div style={{ marginTop: 10, textAlign: "center", fontFamily: T.font, fontSize: 12, color: T.muted }}>
                  By continuing you agree to our{" "}
                  <span style={{ color: T.ink, fontWeight: 600 }}>Terms</span> &{" "}
                  <span style={{ color: T.ink, fontWeight: 600 }}>Privacy</span>.
                </div>
              </>
            )}

            {/* ── Step 2: OTP verification ─────────────────────────── */}
            {showOtp && (
              <div style={{ textAlign: "center" }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 16, background: T.inkSoft,
                  display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px",
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={T.six} strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                  </svg>
                </div>

                <h2 style={{ fontFamily: T.font, fontSize: 26, fontWeight: 700, letterSpacing: -0.6, color: T.ink, margin: "0 0 6px" }}>
                  Check your inbox
                </h2>
                <p style={{ fontFamily: T.font, fontSize: 15, color: T.muted, margin: "0 0 4px", lineHeight: 1.5 }}>
                  We sent a 6-digit code to
                </p>
                <p style={{ fontFamily: T.font, fontSize: 15, fontWeight: 600, color: T.ink, margin: "0 0 28px" }}>
                  {email}
                </p>

                {emailWarning && (
                  <div style={{ marginBottom: 20, padding: "12px 16px", borderRadius: 12, background: "#FFFBEB", border: "1px solid rgba(234,179,8,0.25)", fontFamily: T.font, fontSize: 13, color: "#92400e", textAlign: "left" }}>
                    {emailWarning}
                  </div>
                )}

                <OtpBoxes value={digits} onChange={setDigits} disabled={verifying} />

                {verifying && (
                  <div style={{ marginTop: 18, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: T.font, fontSize: 14, color: T.muted }}>
                    <span style={{ width: 14, height: 14, borderRadius: 7, border: `2px solid ${T.line}`, borderTopColor: T.ink, animation: "ispin .8s linear infinite", display: "inline-block" }}/>
                    Verifying…
                  </div>
                )}

                {otpError && (
                  <div style={{ marginTop: 16, padding: "12px 16px", borderRadius: 12, background: "#FFF0EE", border: "1px solid rgba(255,90,31,0.2)", fontFamily: T.font, fontSize: 14, color: "#C43600", display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
                      <circle cx="7.5" cy="7.5" r="6.5" stroke="#C43600" strokeWidth="1.5"/>
                      <path d="M7.5 4.5v4M7.5 10v.5" stroke="#C43600" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                    {otpError}
                  </div>
                )}

                <div style={{ marginTop: 22, fontFamily: T.font, fontSize: 14, color: T.muted }}>
                  Didn&apos;t receive it?{" "}
                  {resendCooldown > 0 ? (
                    <span style={{ color: T.muted }}>Resend in {resendCooldown}s</span>
                  ) : (
                    <button onClick={handleResend} disabled={resendLoading} style={{
                      background: "none", border: "none", cursor: "pointer",
                      color: T.ink, fontWeight: 600, fontSize: 14, fontFamily: T.font, padding: 0,
                    }}>
                      {resendLoading ? "Sending…" : "Resend code"}
                    </button>
                  )}
                </div>

                <button onClick={() => { setShowOtp(false); setDigits(["","","","","",""]); setOtpError(""); }}
                  style={{ marginTop: 16, background: "none", border: "none", cursor: "pointer", fontFamily: T.font, fontSize: 13, color: T.muted }}>
                  ← Use a different email
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
