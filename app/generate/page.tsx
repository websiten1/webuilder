"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import GenerateWizard from "@/app/components/GenerateWizard";

const C = {
  ink: "#09090b",
  bg: "#09090b",
  bg2: "#18181b",
  border: "rgba(255,255,255,0.08)",
  muted: "rgba(255,255,255,0.4)",
  accent: "#ff5a00",
  ok: "#22c55e",
  font: "'DM Sans', -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
  mono: 'ui-monospace,"SF Mono",Menlo,monospace',
};

function Spinner() {
  return (
    <div style={{ background: C.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 28, height: 28, border: "2px solid rgba(10,14,20,0.1)", borderTopColor: C.accent, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function Gate({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: C.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: C.font }}>
      <style>{`*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}`}</style>
      <div style={{ width: "100%", maxWidth: 480, background: C.bg2, borderRadius: 20, border: `1px solid ${C.border}`, padding: "40px 36px", boxShadow: "0 4px 64px rgba(0,0,0,0.4)" }}>
        {children}
      </div>
    </div>
  );
}

// ─── Terms Gate ───────────────────────────────────────────────────────────────

function TermsGate({ onAgree }: { onAgree: () => void }) {
  const [checked, setChecked] = useState(false);
  return (
    <Gate>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
        <span style={{ fontFamily: C.font, fontSize: 26, fontWeight: 200, color: "#fff", letterSpacing: "-0.02em", lineHeight: 1 }}>6</span>
        <span style={{ fontSize: 17, fontWeight: 600, color: "#fff", letterSpacing: -0.3 }}>insixlive</span>
      </div>

      <h1 style={{ fontSize: 22, fontWeight: 700, color: "#fff", letterSpacing: -0.5, marginBottom: 8 }}>Înainte să începi</h1>
      <p style={{ fontSize: 14.5, color: C.muted, lineHeight: 1.6, marginBottom: 20 }}>
        Citește și confirmă aceste puncte înainte de a folosi generatorul de site-uri.
      </p>

      <div style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${C.border}`, borderRadius: 12, padding: "16px 18px", marginBottom: 20, display: "flex", flexDirection: "column", gap: 10 }}>
        {[
          { icon: "🚫", text: "Site-ul nu poate procesa vânzări online, rezervări sau programări. Vizitatorii te contactează direct prin telefon sau email." },
          { icon: "🔒", text: "Odată generat, conținutul site-ului nu poate fi editat prin insixlive. Modificările necesită o nouă generare (achiziție nouă)." },
          { icon: "💳", text: "Plățile nu sunt rambursabile odată ce generarea a început. Dacă generarea eșuează și nu este livrat niciun site, contactează suportul." },
        ].map(({ icon, text }) => (
          <div key={text} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <span style={{ fontSize: 16, flexShrink: 0 }}>{icon}</span>
            <span style={{ fontSize: 13.5, color: "rgba(255,255,255,0.7)", lineHeight: 1.5 }}>{text}</span>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24, cursor: "pointer" }}
        onClick={() => setChecked(c => !c)}>
        <div style={{
          width: 20, height: 20, borderRadius: 6, border: checked ? `2px solid ${C.ok}` : `2px solid ${C.border}`,
          background: checked ? C.ok : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all .15s",
        }}>
          {checked && <svg viewBox="0 0 12 12" fill="none" width="10" height="10"><path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
        </div>
        <span style={{ fontSize: 13.5, color: "rgba(255,255,255,0.7)", lineHeight: 1.45 }}>
          Am citit și sunt de acord cu{" "}
          <Link href="/terms" target="_blank" style={{ color: C.accent, textDecoration: "underline" }}>Termenii de utilizare</Link>
          {" "}și{" "}
          <Link href="/privacy" target="_blank" style={{ color: C.accent, textDecoration: "underline" }}>Politica de confidențialitate</Link>.
        </span>
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <a href="https://insixlive.com" style={{
          flex: 1, height: 48, borderRadius: 12, border: `1px solid ${C.border}`, background: "transparent",
          color: C.muted, fontFamily: C.font, fontSize: 15, fontWeight: 500, display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none",
        }}>
          Nu sunt de acord
        </a>
        <button type="button" disabled={!checked} onClick={onAgree} style={{
          flex: 2, height: 48, borderRadius: 12, border: "none",
          background: checked ? "#fff" : "rgba(255,255,255,0.08)",
          color: checked ? "#09090b" : C.muted,
          fontFamily: C.font, fontSize: 15, fontWeight: 600, cursor: checked ? "pointer" : "default",
          transition: "background .15s, color .15s",
        }}>
          Sunt de acord — hai să construim
        </button>
      </div>
    </Gate>
  );
}

// ─── Vercel Gate ──────────────────────────────────────────────────────────────

const VERCEL_ERROR_MESSAGES: Record<string, string> = {
  vercel_denied: "Ai anulat autorizarea Vercel. Apasă mai jos pentru a încerca din nou.",
  vercel_state_mismatch: "Ceva nu a mers bine cu fluxul de autorizare. Încearcă din nou.",
  vercel_no_code: "Vercel nu a returnat un cod de autorizare. Încearcă din nou.",
  vercel_callback_failed: "Autorizarea Vercel a eșuat. Încearcă din nou sau contactează suportul.",
  vercel_not_configured: "OAuth-ul Vercel nu este configurat. Contactează suportul.",
};

function VercelGate({ error, detail }: { error: string | null; detail: string | null }) {
  return (
    <Gate>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
        <span style={{ fontFamily: C.font, fontSize: 26, fontWeight: 200, color: "#fff", letterSpacing: "-0.02em", lineHeight: 1 }}>6</span>
        <span style={{ fontSize: 17, fontWeight: 600, color: "#fff", letterSpacing: -0.3 }}>insixlive</span>
      </div>

      <h1 style={{ fontSize: 22, fontWeight: 700, color: "#fff", letterSpacing: -0.5, marginBottom: 8 }}>Conectează-ți contul Vercel</h1>
      <p style={{ fontSize: 14.5, color: C.muted, lineHeight: 1.6, marginBottom: 20 }}>
        Site-ul tău va fi publicat în contul tău Vercel. Apasă mai jos pentru a autoriza accesul — durează aproximativ 10 secunde.
      </p>

      {error && (
        <div style={{ background: "rgba(255,90,0,0.08)", border: "1px solid rgba(255,90,0,0.2)", borderRadius: 10, padding: "12px 14px", marginBottom: 16, fontSize: 13.5, color: "#ff7a50", lineHeight: 1.5 }}>
          {VERCEL_ERROR_MESSAGES[error] ?? "Something went wrong. Please try again."}
          {detail && <div style={{ marginTop: 8, fontFamily: "monospace", fontSize: 11, wordBreak: "break-all", opacity: 0.7 }}>{detail}</div>}
        </div>
      )}

      <div style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${C.border}`, borderRadius: 12, padding: "16px 18px", marginBottom: 20, display: "flex", flexDirection: "column", gap: 10 }}>
        {[
          { icon: "🔒", text: "Solicităm acces doar pentru a crea și gestiona publicările tale." },
          { icon: "⚡", text: "Site-ul tău este live în propriul cont Vercel — îl deții complet." },
          { icon: "🔗", text: "Poți revoca accesul oricând din tabloul de bord Vercel." },
        ].map(({ icon, text }) => (
          <div key={text} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <span style={{ fontSize: 16, flexShrink: 0 }}>{icon}</span>
            <span style={{ fontSize: 13.5, color: "rgba(255,255,255,0.7)", lineHeight: 1.5 }}>{text}</span>
          </div>
        ))}
      </div>

      <a href="/api/auth/vercel/authorize" style={{
        display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
        width: "100%", height: 48, borderRadius: 12,
        background: C.ink, color: "#fff",
        fontFamily: C.font, fontSize: 15, fontWeight: 600,
        textDecoration: "none",
      }}>
        <svg width="18" height="16" viewBox="0 0 76 65" fill="currentColor">
          <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" />
        </svg>
        Conectează cu Vercel
      </a>
    </Gate>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

type Gate = "loading" | "terms" | "vercel" | "ready";

function GenerateContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editSiteId = searchParams.get("edit") ?? undefined;
  const vercelJustAuthorized = searchParams.get("vercel_authorized") === "true";
  const vercelError = searchParams.get("error") ?? null;
  const vercelDetail = searchParams.get("detail") ?? null;
  const [gate, setGate] = useState<Gate>("loading");

  useEffect(() => {
    const termsAgreed = typeof window !== "undefined" && localStorage.getItem("terms_agreed") === "1";

    Promise.all([fetch("/api/auth/me"), fetch("/api/auth/vercel/connection")])
      .then(async ([meRes, connRes]) => {
        const data = await meRes.json();
        const conn = await connRes.json().catch(() => ({ connected: false }));
        if (!data.user) { router.push("/login"); return; }
        if (!termsAgreed) { setGate("terms"); return; }
        if (!conn.connected) { setGate("vercel"); return; }
        setGate("ready");
      })
      .catch(() => router.push("/login"));
  }, [router, vercelJustAuthorized]);

  const handleTermsAgree = () => {
    localStorage.setItem("terms_agreed", "1");
    fetch("/api/auth/vercel/connection")
      .then(r => r.json())
      .then(conn => setGate(conn.connected ? "ready" : "vercel"));
  };

  if (gate === "loading") return <Spinner />;
  if (gate === "terms")   return <TermsGate onAgree={handleTermsAgree} />;
  if (gate === "vercel")  return <VercelGate error={vercelError} detail={vercelDetail} />;
  return <GenerateWizard editSiteId={editSiteId} />;
}

export default function GeneratePage() {
  return (
    <Suspense fallback={<Spinner />}>
      <GenerateContent />
    </Suspense>
  );
}
