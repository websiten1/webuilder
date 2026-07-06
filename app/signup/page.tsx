"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const AURORA_VIDEO =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260506_081238_406ed0e3-5d83-436e-a512-0bbff7ec5b95.mp4";

const A = {
  black:  "#09090b",
  panel:  "#09090b",
  gray:   "#18181b",
  gray2:  "#222222",
  white:  "#ffffff",
  six:    "#ff5a00",
  m20:    "rgba(255,255,255,0.20)",
  m30:    "rgba(255,255,255,0.30)",
  m40:    "rgba(255,255,255,0.40)",
  m60:    "rgba(255,255,255,0.60)",
  font:   "'DM Sans', -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
  mono:   'ui-monospace, "SF Mono", "JetBrains Mono", Menlo, monospace',
};

function Mark({ size = 28 }: { size?: number }) {
  return (
    <span style={{ fontFamily: A.font, fontSize: size, fontWeight: 200, color: "#fff", letterSpacing: "-0.02em", lineHeight: 1 }}>6</span>
  );
}

// ─── Aurora step card ─────────────────────────────────────────────────────────
function StepCard({ number, text, active = false }: { number: number; text: string; active?: boolean }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 14,
      borderRadius: 16, padding: "13px 16px",
      background: active ? A.white : A.gray,
      color: active ? A.black : A.white,
    }}>
      <span style={{
        width: 32, height: 32, borderRadius: 16, flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 13, fontWeight: 700, fontFamily: A.font,
        background: active ? A.black : "rgba(255,255,255,0.1)",
        color: active ? A.white : "rgba(255,255,255,0.35)",
      }}>{number}</span>
      <span style={{ fontFamily: A.font, fontSize: 14, fontWeight: 500 }}>{text}</span>
    </div>
  );
}

// ─── Aurora dark input ────────────────────────────────────────────────────────
function AInput({
  label, value, placeholder, type = "text", onChange, suffix,
}: {
  label: string; value: string; placeholder: string;
  type?: string; onChange: (v: string) => void; suffix?: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <label style={{ fontFamily: A.font, fontSize: 14, fontWeight: 500, color: A.white }}>{label}</label>
      <div style={{ position: "relative" }}>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={{
            width: "100%", height: 44, borderRadius: 12,
            border: "none", outline: "none",
            background: A.gray,
            padding: suffix ? "0 44px 0 16px" : "0 16px",
            fontFamily: A.font, fontSize: 15,
            color: A.white, boxSizing: "border-box" as const,
          }}
        />
        {suffix && (
          <div style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)" }}>
            {suffix}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Eye toggle SVG ──────────────────────────────────────────────────────────
function EyeIcon({ visible }: { visible: boolean }) {
  return visible
    ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
    : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
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
    digits.split("").forEach((d, idx) => { if (idx < 6) next[idx] = d; });
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
          className="au-otp"
          style={{
            width: 52, height: 64, borderRadius: 14,
            border: digit ? `2px solid ${A.white}` : `1.5px solid rgba(255,255,255,0.12)`,
            background: digit ? "rgba(255,255,255,0.08)" : A.gray,
            fontFamily: A.mono, fontSize: "1.75rem", fontWeight: 700,
            textAlign: "center" as const, outline: "none", color: A.white,
            transition: "border .12s, background .12s",
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
  const [showPw, setShowPw] = useState(false);
  const [showCpw, setShowCpw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [verifying, setVerifying] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [emailWarning, setEmailWarning] = useState("");

  useEffect(() => {
    const prefill = new URLSearchParams(window.location.search).get("email");
    if (prefill) setEmail(prefill);
  }, []);

  useEffect(() => {
    if (showOtp && digits.every((d) => d !== "")) handleVerify(digits.join(""));
  }, [digits, showOtp]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  const handleSignup = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, confirmPassword }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Înregistrarea a eșuat. Încearcă din nou."); return; }
      if (data.emailWarning) setEmailWarning(data.emailWarning);
      setShowOtp(true);
    } catch { setError("Eroare de rețea. Încearcă din nou."); }
    finally { setLoading(false); }
  };

  const handleVerify = async (code: string) => {
    if (verifying) return;
    setVerifying(true); setOtpError("");
    try {
      const res = await fetch("/api/auth/verify-code", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.toLowerCase(), code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setOtpError(data.error || "Cod incorect. Încearcă din nou.");
        setDigits(["", "", "", "", "", ""]); setVerifying(false); return;
      }
      router.push("/dashboard");
    } catch { setOtpError("Eroare de rețea. Încearcă din nou."); setVerifying(false); }
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

  const canSubmit = !loading && !!email && !!password && !!confirmPassword;

  return (
    <>
      <style>{`
        @keyframes au-spin { to { transform: rotate(360deg); } }
        @keyframes au-fade-up { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { background: #09090b; overflow-x: hidden; }
        input::placeholder { color: rgba(255,255,255,0.18) !important; }
        .au-fade { animation: au-fade-up 0.65s cubic-bezier(0.16,1,0.3,1) both; }
        .au-left { display: flex !important; }
        .au-right { padding: 48px 64px; }
        .au-mobile-logo { display: none !important; }
        @media (max-width: 1024px) {
          .au-left { display: none !important; }
          .au-mobile-logo { display: flex !important; }
          .au-right { padding: 32px 24px 48px !important; min-height: 100vh; align-items: flex-start !important; justify-content: flex-start !important; }
          .au-right-inner { padding-top: 8px !important; }
        }
        @media (max-width: 480px) {
          .au-right { padding: 24px 20px 40px !important; }
          .au-otp { width: 42px !important; height: 54px !important; font-size: 1.4rem !important; }
        }
      `}</style>

      {/* Outer: black wrapper with 8px inset padding — Aurora's signature */}
      <div style={{ minHeight: "100vh", background: A.black, padding: 8, display: "flex" }}>
        <div style={{ display: "flex", flex: 1, borderRadius: 20, overflow: "hidden" }}>

          {/* ── Left: video panel ───────────────────────────────────────────── */}
          <section className="au-left" style={{
            width: "50%", flexShrink: 0, position: "relative",
            flexDirection: "column", justifyContent: "flex-end",
            overflow: "hidden", padding: "44px 40px",
          }}>
            <video
              autoPlay muted loop playsInline
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
            >
              <source src={AURORA_VIDEO} type="video/mp4"/>
            </video>
            {/* Bottom-heavy vignette */}
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.88) 100%)", zIndex: 1 }}/>

            {/* Logo — pinned to top-left */}
            <div style={{ position: "absolute", top: 36, left: 40, zIndex: 3, display: "flex", alignItems: "center", gap: 10 }}>
              <Mark size={28}/>
              <span style={{ fontFamily: A.font, fontSize: 17, fontWeight: 600, color: A.white, letterSpacing: -0.3 }}>
                insixlive
              </span>
            </div>

            {/* Bottom content */}
            <div style={{ position: "relative", zIndex: 2, display: "flex", flexDirection: "column", gap: 28 }}>
              <div>
                <h1 className="font-display" style={{ fontSize: "clamp(2rem,2.8vw,2.6rem)", color: A.white, lineHeight: 1.1, marginBottom: 12 }}>
                  Site-ul tău.<br/>Codul tău.<br/><span style={{ color: A.six }}>Al tău pentru totdeauna.</span>
                </h1>
                <p style={{ fontFamily: A.font, fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 1.6, maxWidth: 300 }}>
                  Descrie afacerea ta și generăm un site complet — cod, hosting și tot.
                </p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <StepCard number={1} text="Creează-ți contul" active={!showOtp}/>
                <StepCard number={2} text="Verifică-ți emailul" active={showOtp}/>
                <StepCard number={3} text="Lansează în 6 minute" active={false}/>
              </div>

            </div>
          </section>

          {/* ── Dreapta: formular ── */}
          <section className="au-right" style={{
            flex: 1, background: A.panel,
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            overflowY: "auto",
          }}>

            {/* Logo mobil */}
            <div className="au-mobile-logo" style={{
              alignSelf: "stretch", alignItems: "center", gap: 10,
              padding: "20px 24px 0",
            }}>
              <Mark size={26}/>
              <span style={{ fontFamily: A.font, fontSize: 17, fontWeight: 600, color: A.white, letterSpacing: -0.3 }}>
                insixlive
              </span>
            </div>

            <div className="au-fade au-right-inner" key={showOtp ? "otp" : "form"} style={{ width: "100%", maxWidth: 460 }}>

              {/* ── STEP 1: Create account ── */}
              {!showOtp && (
                <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>

                  <div>
                    <h2 className="font-display" style={{ fontSize: 30, color: A.white, marginBottom: 8 }}>
                      Creează cont nou
                    </h2>
                    <p style={{ fontFamily: A.font, fontSize: 14, color: A.m40, lineHeight: 1.5 }}>
                      Completează datele pentru a începe. 30 de secunde, fără card.
                    </p>
                  </div>

                  {error && (
                    <div style={{
                      padding: "12px 16px", borderRadius: 12,
                      background: "rgba(255,90,0,0.08)", border: "1px solid rgba(255,90,0,0.2)",
                      fontFamily: A.font, fontSize: 14, color: "#ff7a50",
                      display: "flex", gap: 10, alignItems: "flex-start",
                    }}>
                      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
                        <circle cx="7.5" cy="7.5" r="6.5" stroke="#ff7a50" strokeWidth="1.5"/>
                        <path d="M7.5 4.5v4M7.5 10v.5" stroke="#ff7a50" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleSignup} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    <AInput label="Email" value={email} placeholder="tu@afacereata.ro" onChange={setEmail}/>
                    <AInput
                      label="Parolă" value={password}
                      placeholder="Min. 8 caractere"
                      type={showPw ? "text" : "password"}
                      onChange={setPassword}
                      suffix={
                        <button type="button" onClick={() => setShowPw(v => !v)}
                          style={{ background: "none", border: "none", color: A.m40, cursor: "pointer", lineHeight: 0, padding: 0 }}>
                          <EyeIcon visible={showPw}/>
                        </button>
                      }
                    />
                    <AInput
                      label="Confirmă parola" value={confirmPassword}
                      placeholder="Repetă parola"
                      type={showCpw ? "text" : "password"}
                      onChange={setConfirmPassword}
                      suffix={
                        <button type="button" onClick={() => setShowCpw(v => !v)}
                          style={{ background: "none", border: "none", color: A.m40, cursor: "pointer", lineHeight: 0, padding: 0 }}>
                          <EyeIcon visible={showCpw}/>
                        </button>
                      }
                    />
                    <p style={{ fontFamily: A.font, fontSize: 12, color: "rgba(255,255,255,0.25)", marginTop: -4 }}>
                      Cel puțin 8 caractere.
                    </p>

                    <button
                      type="submit"
                      disabled={!canSubmit}
                      style={{
                        marginTop: 4, width: "100%", height: 56, borderRadius: 12,
                        border: "none", cursor: canSubmit ? "pointer" : "default",
                        background: canSubmit ? A.white : "rgba(255,255,255,0.1)",
                        color: canSubmit ? A.black : "rgba(255,255,255,0.3)",
                        fontFamily: A.font, fontSize: 16, fontWeight: 600,
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                        transition: "background .18s, color .18s, opacity .18s",
                      }}
                      onMouseEnter={e => { if (canSubmit) (e.currentTarget as HTMLButtonElement).style.opacity = "0.88"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = "1"; }}
                    >
                      {loading
                        ? <><span style={{ width: 16, height: 16, borderRadius: 8, border: "2px solid rgba(0,0,0,0.15)", borderTopColor: A.black, animation: "au-spin .8s linear infinite", display: "inline-block" }}/> Se creează contul…</>
                        : "Creează cont"
                      }
                    </button>
                  </form>

                  <div style={{ textAlign: "center", fontFamily: A.font, fontSize: 14, color: A.m40 }}>
                    Ai deja cont?{" "}
                    <Link href="/login" style={{ color: A.white, fontWeight: 600, textDecoration: "none" }}>Autentifică-te</Link>
                  </div>
                  <div style={{ textAlign: "center", fontFamily: A.font, fontSize: 12, color: "rgba(255,255,255,0.22)" }}>
                    Continuând, ești de acord cu{" "}
                    <span style={{ color: A.m40, fontWeight: 600 }}>Termenii</span> și{" "}
                    <span style={{ color: A.m40, fontWeight: 600 }}>Politica de confidențialitate</span>.
                  </div>

                </div>
              )}

              {/* ── STEP 2: OTP verification ── */}
              {showOtp && (
                <div style={{ display: "flex", flexDirection: "column", gap: 24, textAlign: "center" }}>

                  <div style={{ width: 60, height: 60, borderRadius: 18, background: A.gray, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto" }}>
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={A.white} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                    </svg>
                  </div>

                  <div>
                    <h2 className="font-display" style={{ fontSize: 28, color: A.white, marginBottom: 8 }}>
                      Verifică inbox-ul
                    </h2>
                    <p style={{ fontFamily: A.font, fontSize: 14, color: A.m40, marginBottom: 4, lineHeight: 1.5 }}>
                      Am trimis un cod de 6 cifre la
                    </p>
                    <p style={{ fontFamily: A.font, fontSize: 15, fontWeight: 600, color: A.white }}>{email}</p>
                  </div>

                  {emailWarning && (
                    <div style={{ padding: "12px 16px", borderRadius: 12, background: "rgba(234,179,8,0.08)", border: "1px solid rgba(234,179,8,0.2)", fontFamily: A.font, fontSize: 13, color: "#EAB308", textAlign: "left" }}>
                      {emailWarning}
                    </div>
                  )}

                  <OtpBoxes value={digits} onChange={setDigits} disabled={verifying}/>

                  {verifying && (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: A.font, fontSize: 14, color: A.m40 }}>
                      <span style={{ width: 14, height: 14, borderRadius: 7, border: "2px solid rgba(255,255,255,0.12)", borderTopColor: A.white, animation: "au-spin .8s linear infinite", display: "inline-block" }}/>
                      Se verifică…
                    </div>
                  )}

                  {otpError && (
                    <div style={{ padding: "12px 16px", borderRadius: 12, background: "rgba(255,90,0,0.08)", border: "1px solid rgba(255,90,0,0.2)", fontFamily: A.font, fontSize: 14, color: "#ff7a50", display: "flex", gap: 10, alignItems: "flex-start", textAlign: "left" }}>
                      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
                        <circle cx="7.5" cy="7.5" r="6.5" stroke="#ff7a50" strokeWidth="1.5"/>
                        <path d="M7.5 4.5v4M7.5 10v.5" stroke="#ff7a50" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                      {otpError}
                    </div>
                  )}

                  <div style={{ fontFamily: A.font, fontSize: 14, color: A.m40 }}>
                    Nu ai primit codul?{" "}
                    {resendCooldown > 0
                      ? <span>Retrimite în {resendCooldown}s</span>
                      : (
                        <button onClick={handleResend} disabled={resendLoading} style={{
                          background: "none", border: "none", cursor: "pointer",
                          color: A.white, fontWeight: 600, fontSize: 14, fontFamily: A.font, padding: 0,
                        }}>
                          {resendLoading ? "Se trimite…" : "Retrimite codul"}
                        </button>
                      )
                    }
                  </div>

                  <button
                    onClick={() => { setShowOtp(false); setDigits(["","","","","",""]); setOtpError(""); }}
                    style={{ background: "none", border: "none", cursor: "pointer", fontFamily: A.font, fontSize: 13, color: "rgba(255,255,255,0.3)", padding: 0 }}
                  >
                    ← Folosește alt email
                  </button>

                </div>
              )}

            </div>
          </section>

        </div>
      </div>
    </>
  );
}
