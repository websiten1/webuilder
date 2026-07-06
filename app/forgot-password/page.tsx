"use client";

import { useState } from "react";
import Link from "next/link";

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

function AInput({
  label, value, placeholder, type = "text", onChange,
}: {
  label: string; value: string; placeholder: string;
  type?: string; onChange: (v: string) => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <label style={{ fontFamily: A.font, fontSize: 14, fontWeight: 500, color: A.white }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%", height: 44, borderRadius: 12,
          border: "1px solid rgba(255,255,255,0.08)", outline: "none",
          background: A.gray,
          padding: "0 16px",
          fontFamily: A.font, fontSize: 15,
          color: A.white, boxSizing: "border-box" as const,
          transition: "border-color .18s",
        }}
        onFocus={e => (e.currentTarget.style.borderColor = "rgba(255,90,0,0.5)")}
        onBlur={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")}
      />
    </div>
  );
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Ceva nu a mers bine. Încearcă din nou."); return; }
      setSent(true);
    } catch { setError("Eroare de rețea. Încearcă din nou."); }
    finally { setLoading(false); }
  };

  const canSubmit = !loading && !!email;

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

      <div style={{ minHeight: "100vh", background: A.black, padding: 8, display: "flex" }}>
        <div style={{ display: "flex", flex: 1, borderRadius: 20, overflow: "hidden" }}>

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

            <div style={{ position: "absolute", top: 36, left: 40, right: 40, zIndex: 3 }}>
              <Wordmark />
            </div>

            <div style={{ position: "relative", zIndex: 2 }}>
              <h1 className="font-display" style={{ fontSize: "clamp(2rem,2.8vw,2.6rem)", color: A.white, lineHeight: 1.1, marginBottom: 12 }}>
                Se întâmplă<br/>tuturor.<br/><span style={{ color: A.six }}>Hai să rezolvăm.</span>
              </h1>
              <p style={{ fontFamily: A.font, fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 1.6, maxWidth: 300 }}>
                Îți trimitem un link pe email ca să îți alegi o parolă nouă.
              </p>
            </div>
          </section>

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
                    Ai uitat parola?
                  </h2>
                  <p style={{ fontFamily: A.font, fontSize: 14, color: A.m40, lineHeight: 1.5 }}>
                    Introdu emailul contului tău și îți trimitem un link de resetare.
                  </p>
                </div>

                {sent ? (
                  <div style={{ padding: "14px 16px", borderRadius: 12, background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.2)", fontFamily: A.font, fontSize: 14, color: "#4ade80", lineHeight: 1.5 }}>
                    Dacă există un cont pentru acest email, am trimis un link de resetare a parolei. Verifică inbox-ul (și folderul de spam).
                  </div>
                ) : (
                  <>
                    {error && (
                      <div style={{ padding: "12px 16px", borderRadius: 12, background: "rgba(255,90,0,0.08)", border: "1px solid rgba(255,90,0,0.2)", fontFamily: A.font, fontSize: 14, color: "#ff7a50", display: "flex", gap: 10, alignItems: "flex-start" }}>
                        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
                          <circle cx="7.5" cy="7.5" r="6.5" stroke="#ff7a50" strokeWidth="1.5"/>
                          <path d="M7.5 4.5v4M7.5 10v.5" stroke="#ff7a50" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                        {error}
                      </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                      <AInput label="Email" value={email} placeholder="tu@afacereata.ro" onChange={setEmail}/>

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
                          ? <><span style={{ width: 16, height: 16, borderRadius: 8, border: "2px solid rgba(0,0,0,0.15)", borderTopColor: A.black, animation: "au-spin .8s linear infinite", display: "inline-block" }}/> Se trimite…</>
                          : "Trimite linkul de resetare"
                        }
                      </button>
                    </form>
                  </>
                )}

                <div style={{ textAlign: "center", fontFamily: A.font, fontSize: 14, color: A.m40 }}>
                  <Link href="/login" style={{ color: A.white, fontWeight: 600, textDecoration: "none" }}>← Înapoi la autentificare</Link>
                </div>

              </div>
            </div>
          </section>

        </div>
      </div>
    </>
  );
}
