"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// ─── OTP Input ────────────────────────────────────────────────────────────────

function OtpInput({
  value,
  onChange,
  disabled,
}: {
  value: string[];
  onChange: (v: string[]) => void;
  disabled: boolean;
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (i: number, raw: string) => {
    const digit = raw.replace(/\D/g, "").slice(-1);
    const next = [...value];
    next[i] = digit;
    onChange(next);
    if (digit && i < 5) setTimeout(() => refs.current[i + 1]?.focus(), 0);
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace") {
      if (value[i]) {
        const next = [...value];
        next[i] = "";
        onChange(next);
      } else if (i > 0) {
        refs.current[i - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && i > 0) {
      refs.current[i - 1]?.focus();
    } else if (e.key === "ArrowRight" && i < 5) {
      refs.current[i + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const digits = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!digits) return;
    const next = [...value];
    digits.split("").forEach((d, i) => { if (i < 6) next[i] = d; });
    onChange(next);
    const focusIdx = Math.min(digits.length, 5);
    setTimeout(() => refs.current[focusIdx]?.focus(), 0);
  };

  const boxStyle = (filled: boolean): React.CSSProperties => ({
    width: 52,
    height: 64,
    borderRadius: 12,
    border: `2px solid ${filled ? "rgba(99,102,241,0.6)" : "rgba(255,255,255,0.1)"}`,
    background: filled ? "rgba(99,102,241,0.08)" : "rgba(255,255,255,0.03)",
    color: "#fff",
    fontSize: "1.8rem",
    fontWeight: 700,
    textAlign: "center" as const,
    outline: "none",
    transition: "border-color 0.15s, background 0.15s",
    caretColor: "transparent",
  });

  return (
    <div style={{ display: "flex", gap: 10, justifyContent: "center" }} onPaste={handlePaste}>
      {value.map((digit, i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          disabled={disabled}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onFocus={(e) => e.target.select()}
          style={boxStyle(!!digit)}
        />
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SignupPage() {
  const router = useRouter();

  // Step 1 state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Step 2 state
  const [showOtp, setShowOtp] = useState(false);
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [verifying, setVerifying] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [emailWarning, setEmailWarning] = useState("");

  // Auto-verify when all 6 digits are filled
  useEffect(() => {
    if (showOtp && digits.every((d) => d !== "")) {
      handleVerify(digits.join(""));
    }
  }, [digits, showOtp]); // eslint-disable-line react-hooks/exhaustive-deps

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  // ── Step 1: Create account ──────────────────────────────────────────────────
  const handleSignup = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, confirmPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Signup failed. Please try again.");
        return;
      }
      if (data.emailWarning) setEmailWarning(data.emailWarning);
      setShowOtp(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Step 2: Verify code ─────────────────────────────────────────────────────
  const handleVerify = async (code: string) => {
    if (verifying) return;
    setVerifying(true);
    setOtpError("");
    try {
      const res = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.toLowerCase(), code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setOtpError(data.error || "Incorrect code. Please try again.");
        setDigits(["", "", "", "", "", ""]);
        setVerifying(false);
        return;
      }
      // Session created — go straight to dashboard
      router.push("/dashboard");
    } catch {
      setOtpError("Network error. Please try again.");
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || resendLoading) return;
    setResendLoading(true);
    setOtpError("");
    try {
      await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.toLowerCase() }),
      });
      setResendCooldown(60);
      setDigits(["", "", "", "", "", ""]);
    } finally {
      setResendLoading(false);
    }
  };

  // ── UI ──────────────────────────────────────────────────────────────────────
  return (
    <div style={{ background: "#050510", minHeight: "100vh", color: "#fff" }} className="flex flex-col">
      {/* Glow */}
      <div style={{ position: "absolute", left: "50%", top: "30%", transform: "translate(-50%,-50%)", width: 500, height: 500, background: "radial-gradient(circle, rgba(168,85,247,0.12), transparent 70%)", pointerEvents: "none" }} />

      <nav className="px-6 h-16 flex items-center" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <Link href="/" className="font-bold tracking-tight text-sm">WebBuilder</Link>
      </nav>

      <div className="relative flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full" style={{ maxWidth: 400 }}>

          {/* ── Step 1: Signup form ─────────────────────────────────────── */}
          {!showOtp && (
            <>
              <div className="mb-8">
                <h1 className="font-bold tracking-tight mb-1" style={{ fontSize: "1.8rem" }}>Create your account</h1>
                <p className="text-sm" style={{ color: "var(--text2)" }}>Get your professional website in 100 seconds.</p>
              </div>

              <form onSubmit={handleSignup} className="space-y-4">
                {error && (
                  <div className="text-sm px-4 py-3 rounded-xl flex items-start gap-2" style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.35)", color: "#fca5a5" }}>
                    <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} style={{ flexShrink: 0, marginTop: 1 }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                    </svg>
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text2)" }}>Email</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="inp" required />
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text2)" }}>Password</label>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Minimum 8 characters" className="inp" minLength={8} required />
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text2)" }}>Confirm password</label>
                  <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repeat your password" className="inp" required />
                </div>

                <button type="submit" disabled={submitting} className="btn-primary w-full rounded-xl py-3.5 text-sm mt-2">
                  {submitting ? "Creating account…" : "Create account"}
                </button>
              </form>

              <p className="text-xs text-center mt-3" style={{ color: "var(--text3)" }}>
                Free to join. Payment only when you generate your website.
              </p>
              <p className="text-sm text-center mt-6" style={{ color: "var(--text2)" }}>
                Already have an account?{" "}
                <Link href="/login" className="font-medium" style={{ color: "var(--accent)" }}>Sign in</Link>
              </p>
            </>
          )}

          {/* ── Step 2: OTP entry ───────────────────────────────────────── */}
          {showOtp && (
            <div className="text-center">
              {/* Icon */}
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#a5b4fc" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>

              <h1 className="font-bold tracking-tight mb-2" style={{ fontSize: "1.6rem" }}>Check your email</h1>
              <p className="mb-1" style={{ color: "var(--text2)", fontSize: 14 }}>
                We sent a 6-digit code to
              </p>
              <p className="mb-8 font-semibold" style={{ fontSize: 14 }}>{email}</p>

              {emailWarning && (
                <div className="text-xs px-4 py-3 rounded-xl mb-6 text-left" style={{ background: "rgba(234,179,8,0.08)", border: "1px solid rgba(234,179,8,0.2)", color: "#fde047" }}>
                  {emailWarning}
                </div>
              )}

              {/* 6-digit input */}
              <div className="mb-6">
                <OtpInput value={digits} onChange={setDigits} disabled={verifying} />
              </div>

              {/* Verifying spinner */}
              {verifying && (
                <div className="flex items-center justify-center gap-2 mb-4" style={{ color: "var(--text2)", fontSize: 14 }}>
                  <span style={{ width: 14, height: 14, border: "2px solid rgba(99,102,241,0.3)", borderTopColor: "#6366f1", borderRadius: "50%", animation: "spin 0.8s linear infinite", display: "inline-block" }} />
                  Verifying…
                </div>
              )}

              {/* Error */}
              {otpError && (
                <div className="text-sm px-4 py-3 rounded-xl mb-4 flex items-start gap-2" style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.35)", color: "#fca5a5", textAlign: "left" }}>
                  <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} style={{ flexShrink: 0, marginTop: 1 }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                  </svg>
                  {otpError}
                </div>
              )}

              {/* Resend */}
              <p className="text-sm" style={{ color: "var(--text3)" }}>
                Didn&apos;t receive it?{" "}
                {resendCooldown > 0 ? (
                  <span style={{ color: "var(--text3)" }}>Resend in {resendCooldown}s</span>
                ) : (
                  <button onClick={handleResend} disabled={resendLoading} style={{ color: "var(--accent)", background: "none", border: "none", cursor: "pointer", fontWeight: 500 }}>
                    {resendLoading ? "Sending…" : "Resend code"}
                  </button>
                )}
              </p>

              <button onClick={() => { setShowOtp(false); setDigits(["","","","","",""]); setOtpError(""); }} style={{ marginTop: 20, color: "var(--text3)", background: "none", border: "none", cursor: "pointer", fontSize: 13 }}>
                ← Use a different email
              </button>
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
