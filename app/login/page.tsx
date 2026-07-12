"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { type Lang, tt, detectLang, persistLang } from "@/lib/i18n";
import { translateAuthError } from "@/lib/auth-errors";

const AURORA_VIDEO =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260506_081238_406ed0e3-5d83-436e-a512-0bbff7ec5b95.mp4";

const A = {
  black:  "#09090b",
  panel:  "#09090b",
  gray:   "#18181b",
  white:  "#ffffff",
  six:    "#ff5a00",
  m20:    "rgba(255,255,255,0.20)",
  m30:    "rgba(255,255,255,0.30)",
  m40:    "rgba(255,255,255,0.40)",
  font:   "'DM Sans', -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
};

function Wordmark({ style }: { style?: React.CSSProperties }) {
  return (
    <span style={{
      display: "block",
      width: "100%",
      fontFamily: A.font,
      fontSize: "clamp(1.0625rem, 3vw, 1.125rem)",
      fontWeight: 600,
      letterSpacing: "-0.02em",
      color: A.white,
      lineHeight: 1.2,
      ...style,
    }}>
      insixlive
    </span>
  );
}

function LangToggle({ lang, setLang }: { lang: Lang; setLang: (l: Lang) => void }) {
  const pill = (active: boolean): React.CSSProperties => ({
    fontSize: 11, fontWeight: 700, fontFamily: A.font, padding: "4px 9px", borderRadius: 6,
    border: "none", cursor: "pointer",
    background: active ? A.white : "transparent",
    color: active ? A.black : "rgba(255,255,255,0.45)",
  });
  return (
    <div style={{
      position: "fixed", top: 16, right: 16, zIndex: 20,
      display: "flex", gap: 2, background: "rgba(255,255,255,0.06)",
      border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, padding: 3,
      backdropFilter: "blur(8px)",
    }}>
      <button onClick={() => setLang("ro")} style={pill(lang === "ro")}>RO</button>
      <button onClick={() => setLang("en")} style={pill(lang === "en")}>EN</button>
    </div>
  );
}

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
            border: "1px solid rgba(255,255,255,0.08)", outline: "none",
            background: A.gray,
            padding: suffix ? "0 44px 0 16px" : "0 16px",
            fontFamily: A.font, fontSize: 15,
            color: A.white, boxSizing: "border-box" as const,
            transition: "border-color .18s",
          }}
          onFocus={e => (e.currentTarget.style.borderColor = "rgba(255,90,0,0.5)")}
          onBlur={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")}
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

function EyeIcon({ visible }: { visible: boolean }) {
  return visible
    ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
    : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
}

function LoginContent() {
  const searchParams = useSearchParams();
  void searchParams;

  const [lang, setLangState] = useState<Lang>("en");
  useEffect(() => { setLangState(detectLang()); }, []);
  const setLang = (l: Lang) => { setLangState(l); persistLang(l); };

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
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
        else setError(data.error ? translateAuthError(data.error, lang) : tt(lang, "Incorrect email or password.", "Email sau parolă incorecte."));
        return;
      }
      window.location.href = "/dashboard";
    } catch { setError(tt(lang, "Network error. Try again.", "Eroare de rețea. Încearcă din nou.")); }
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

  const canSubmit = !loading && !!email && !!password;

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
          .au-mobile-logo { display: block !important; }
          .au-right { padding: 32px 24px 48px !important; min-height: 100vh; align-items: flex-start !important; justify-content: flex-start !important; }
          .au-right-inner { padding-top: 8px !important; }
        }
        @media (max-width: 480px) {
          .au-right { padding: 24px 20px 40px !important; }
        }
      `}</style>

      <LangToggle lang={lang} setLang={setLang} />

      <div style={{ minHeight: "100vh", background: A.black, padding: 8, display: "flex" }}>
        <div style={{ display: "flex", flex: 1, borderRadius: 20, overflow: "hidden" }}>

          {/* ── Left: video ── */}
          <section className="au-left" style={{
            width: "50%", flexShrink: 0, position: "relative",
            flexDirection: "column", justifyContent: "flex-end",
            overflow: "hidden", padding: "44px 40px",
          }}>
            <video autoPlay muted loop playsInline
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}>
              <source src={AURORA_VIDEO} type="video/mp4"/>
            </video>
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.88) 100%)", zIndex: 1 }}/>

            {/* Logo — pinned to top */}
            <div style={{ position: "absolute", top: 36, left: 40, right: 40, zIndex: 3 }}>
              <Wordmark />
            </div>

            {/* Bottom */}
            <div style={{ position: "relative", zIndex: 2, display: "flex", flexDirection: "column", gap: 28 }}>
              <div>
                <h1 className="font-display" style={{ fontSize: "clamp(2rem,2.8vw,2.6rem)", color: A.white, lineHeight: 1.1, marginBottom: 12 }}>
                  {tt(lang,
                    <>Your site.<br/>Your code.<br/><span style={{ color: A.six }}>Yours forever.</span></>,
                    <>Site-ul tău.<br/>Codul tău.<br/><span style={{ color: A.six }}>Al tău pentru totdeauna.</span></>
                  )}
                </h1>
                <p style={{ fontFamily: A.font, fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 1.6, maxWidth: 300 }}>
                  {tt(lang, "Describe your business and we generate a complete site — code, hosting, everything.", "Descrie afacerea ta și generăm un site complet — cod, hosting și tot.")}
                </p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <StepCard number={1} text={tt(lang, "Sign in to your account", "Autentifică-te în cont")} active={true}/>
                <StepCard number={2} text={tt(lang, "Open the dashboard", "Deschide tabloul de bord")} active={false}/>
                <StepCard number={3} text={tt(lang, "Launch or generate sites", "Lansează sau generează site-uri")} active={false}/>
              </div>
            </div>
          </section>

          {/* ── Right: form ── */}
          <section className="au-right" style={{
            flex: 1, background: A.panel,
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            overflowY: "auto",
          }}>

            <div className="au-fade au-right-inner" style={{ width: "100%", maxWidth: 460 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>

                <div>
                  <div className="au-mobile-logo" style={{ marginBottom: 8 }}>
                    <Wordmark />
                  </div>
                  <h2 className="font-display" style={{ fontSize: 30, color: A.white, marginBottom: 8 }}>
                    {tt(lang, "Welcome back", "Bun venit înapoi")}
                  </h2>
                  <p style={{ fontFamily: A.font, fontSize: 14, color: A.m40, lineHeight: 1.5 }}>
                    {tt(lang, "Sign in to manage and generate sites.", "Autentifică-te pentru a gestiona și genera site-uri.")}
                  </p>
                </div>

                {/* Unverified email */}
                {unverified && (
                  <div style={{ padding: "12px 16px", borderRadius: 12, background: "rgba(234,179,8,0.08)", border: "1px solid rgba(234,179,8,0.2)", fontFamily: A.font, fontSize: 14, color: "#EAB308" }}>
                    <p style={{ margin: "0 0 6px", fontWeight: 600 }}>{tt(lang, "Email not verified", "Email neverificat")}</p>
                    <p style={{ margin: "0 0 10px", fontSize: 13, opacity: 0.8 }}>{tt(lang, "Check your inbox for the 6-digit code.", "Verifică inbox-ul pentru codul de 6 cifre.")}</p>
                    {!resendSent
                      ? <button onClick={handleResend} disabled={resendLoading} style={{ background: "none", border: "none", cursor: "pointer", color: "#EAB308", fontWeight: 600, fontSize: 13, fontFamily: A.font, padding: 0, textDecoration: "underline" }}>
                          {resendLoading ? tt(lang, "Sending…", "Se trimite…") : tt(lang, "Resend verification code", "Retrimite codul de verificare")}
                        </button>
                      : <span style={{ color: "#4ade80", fontSize: 13, fontWeight: 600 }}>{tt(lang, "✓ Code sent — check your inbox", "✓ Cod trimis — verifică inbox-ul")}</span>
                    }
                  </div>
                )}

                {/* Eroare */}
                {error && (
                  <div style={{ padding: "12px 16px", borderRadius: 12, background: "rgba(255,90,0,0.08)", border: "1px solid rgba(255,90,0,0.2)", fontFamily: A.font, fontSize: 14, color: "#ff7a50", display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
                      <circle cx="7.5" cy="7.5" r="6.5" stroke="#ff7a50" strokeWidth="1.5"/>
                      <path d="M7.5 4.5v4M7.5 10v.5" stroke="#ff7a50" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                    {error}
                  </div>
                )}

                <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <AInput label="Email" value={email} placeholder="tu@afacereata.ro" onChange={setEmail}/>
                  <AInput
                    label={tt(lang, "Password", "Parolă")} value={password}
                    placeholder={tt(lang, "Your password", "Parola ta")}
                    type={showPw ? "text" : "password"}
                    onChange={setPassword}
                    suffix={
                      <button type="button" onClick={() => setShowPw(v => !v)}
                        style={{ background: "none", border: "none", color: A.m40, cursor: "pointer", lineHeight: 0, padding: 0 }}>
                        <EyeIcon visible={showPw}/>
                      </button>
                    }
                  />

                  <div style={{ textAlign: "right", marginTop: -6 }}>
                    <Link href="/forgot-password" style={{ fontFamily: A.font, fontSize: 13, fontWeight: 600, color: A.white, textDecoration: "underline" }}>
                      {tt(lang, "Forgot your password?", "Ai uitat parola?")}
                    </Link>
                  </div>

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
                      ? <><span style={{ width: 16, height: 16, borderRadius: 8, border: "2px solid rgba(0,0,0,0.15)", borderTopColor: A.black, animation: "au-spin .8s linear infinite", display: "inline-block" }}/> {tt(lang, "Signing in…", "Se autentifică…")}</>
                      : tt(lang, "Sign in", "Autentifică-te")
                    }
                  </button>
                </form>

                <div style={{ textAlign: "center", fontFamily: A.font, fontSize: 14, color: A.m40 }}>
                  {tt(lang, "Don't have an account?", "Nu ai cont?")}{" "}
                  <Link href="/signup" style={{ color: A.white, fontWeight: 600, textDecoration: "none" }}>{tt(lang, "Create one for free", "Creează unul gratuit")}</Link>
                </div>

              </div>
            </div>
          </section>

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
