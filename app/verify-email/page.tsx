"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

const FONT = "'DM Sans', -apple-system, BlinkMacSystemFont, system-ui, sans-serif";

type State = "loading" | "success" | "error" | "no-token";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const [state, setState] = useState<State>(token ? "loading" : "no-token");
  const [errorMsg, setErrorMsg] = useState("");
  const [resendEmail, setResendEmail] = useState("");
  const [resendSent, setResendSent] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  useEffect(() => {
    if (!token) return;

    async function verify() {
      try {
        const res = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        const data = await res.json();
        if (res.ok) {
          setState("success");
          setTimeout(() => router.push("/dashboard"), 2500);
        } else {
          setState("error");
          setErrorMsg(data.error || "Verificare eșuată.");
        }
      } catch {
        setState("error");
        setErrorMsg("Eroare de rețea. Încearcă din nou.");
      }
    }

    verify();
  }, [token, router]);

  async function handleResend(e: React.FormEvent) {
    e.preventDefault();
    setResendLoading(true);
    try {
      await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resendEmail }),
      });
      setResendSent(true);
    } finally {
      setResendLoading(false);
    }
  }

  return (
    <>
      <style>{`
        @keyframes ve-spin { to { transform: rotate(360deg); } }
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { background: #09090b; color: #fff; font-family: ${FONT}; }
        .ve-input {
          width: 100%; height: 44px; border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.1); outline: none;
          background: #18181b; padding: 0 16px;
          font-family: ${FONT}; font-size: 15px; color: #fff;
          transition: border-color .18s;
        }
        .ve-input::placeholder { color: rgba(255,255,255,0.25); }
        .ve-input:focus { border-color: rgba(255,90,0,0.5); }
        .ve-btn {
          width: 100%; height: 48px; border-radius: 12px; border: none;
          cursor: pointer; background: #fff; color: #09090b;
          font-family: ${FONT}; font-size: 15px; font-weight: 600;
          transition: opacity .18s;
        }
        .ve-btn:hover { opacity: 0.88; }
        .ve-btn:disabled { background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.3); cursor: default; opacity: 1; }
      `}</style>
      <div style={{ background: "#09090b", minHeight: "100vh", display: "flex", flexDirection: "column", fontFamily: FONT }}>

        <nav style={{ padding: "0 24px", height: 64, display: "flex", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <Link href="/" style={{ fontWeight: 600, letterSpacing: -0.3, fontSize: 15, color: "#fff", textDecoration: "none" }}>
            insixlive
          </Link>
        </nav>

        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "64px 24px" }}>
          <div style={{ width: "100%", maxWidth: 420, textAlign: "center" }}>

            {state === "loading" && (
              <>
                <div style={{
                  width: 48, height: 48,
                  border: "3px solid rgba(255,90,0,0.2)",
                  borderTopColor: "#ff5a00",
                  borderRadius: "50%",
                  animation: "ve-spin 0.8s linear infinite",
                  margin: "0 auto 24px",
                }}/>
                <h1 style={{ fontSize: "1.5rem", fontWeight: 700, letterSpacing: -0.5, color: "#fff", marginBottom: 8 }}>
                  Se verifică emailul…
                </h1>
                <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14 }}>
                  Așteaptă un moment.
                </p>
              </>
            )}

            {state === "success" && (
              <>
                <div style={{
                  width: 56, height: 56, borderRadius: "50%",
                  background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.3)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 24px",
                }}>
                  <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#10b981" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                  </svg>
                </div>
                <h1 style={{ fontSize: "1.5rem", fontWeight: 700, letterSpacing: -0.5, color: "#fff", marginBottom: 8 }}>
                  Email verificat!
                </h1>
                <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14 }}>
                  Te redirecționăm către tabloul de bord…
                </p>
              </>
            )}

            {(state === "error" || state === "no-token") && (
              <>
                <div style={{
                  width: 56, height: 56, borderRadius: "50%",
                  background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 24px",
                }}>
                  <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#f87171" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </div>
                <h1 style={{ fontSize: "1.5rem", fontWeight: 700, letterSpacing: -0.5, color: "#fff", marginBottom: 8 }}>
                  {state === "no-token" ? "Verifică inbox-ul" : "Link expirat sau invalid"}
                </h1>
                <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, marginBottom: 32 }}>
                  {state === "no-token"
                    ? "Un link de verificare a fost trimis pe email. Apasă-l pentru a-ți verifica contul."
                    : errorMsg}
                </p>

                {!resendSent ? (
                  <form onSubmit={handleResend} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <p style={{ fontSize: 14, fontWeight: 500, color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>
                      Ai nevoie de un link nou? Introdu emailul:
                    </p>
                    <input
                      type="email"
                      value={resendEmail}
                      onChange={(e) => setResendEmail(e.target.value)}
                      placeholder="tu@afacereata.ro"
                      className="ve-input"
                      required
                    />
                    <button type="submit" disabled={resendLoading} className="ve-btn">
                      {resendLoading ? "Se trimite…" : "Retrimite emailul de verificare"}
                    </button>
                  </form>
                ) : (
                  <div style={{
                    fontSize: 14, padding: "12px 16px", borderRadius: 12,
                    background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)",
                    color: "#6ee7b7",
                  }}>
                    Email de verificare trimis. Verifică inbox-ul.
                  </div>
                )}

                <p style={{ fontSize: 14, marginTop: 24, color: "rgba(255,255,255,0.35)" }}>
                  <Link href="/login" style={{ color: "#ff5a00", fontWeight: 600, textDecoration: "none" }}>
                    Înapoi la autentificare
                  </Link>
                </p>
              </>
            )}

          </div>
        </div>
      </div>
    </>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailContent />
    </Suspense>
  );
}
