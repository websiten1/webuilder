"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import GenerateWizard from "@/app/components/GenerateWizard";

const C = {
  ink: "#0A0E14",
  bg: "#F7F7F8",
  bg2: "#FFFFFF",
  border: "#ECECEC",
  muted: "#6B7180",
  accent: "#FF5A1F",
  ok: "#009062",
  font: '-apple-system,BlinkMacSystemFont,"SF Pro Text",system-ui,sans-serif',
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
      <div style={{ width: "100%", maxWidth: 480, background: C.bg2, borderRadius: 20, border: `1px solid ${C.border}`, padding: "40px 36px", boxShadow: "0 4px 32px rgba(10,14,20,0.07)" }}>
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
        <div style={{ width: 32, height: 32, borderRadius: 9, background: C.ink, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontFamily: C.font, fontSize: 20, fontWeight: 800, color: C.accent, lineHeight: 1 }}>6</span>
        </div>
        <span style={{ fontSize: 17, fontWeight: 700, color: C.ink, letterSpacing: -0.4 }}>in<span style={{ color: C.accent }}>six</span>live</span>
      </div>

      <h1 style={{ fontSize: 22, fontWeight: 700, color: C.ink, letterSpacing: -0.5, marginBottom: 8 }}>Before you start</h1>
      <p style={{ fontSize: 14.5, color: C.muted, lineHeight: 1.6, marginBottom: 20 }}>
        Please read and agree to these key points before using the website generator.
      </p>

      <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 12, padding: "16px 18px", marginBottom: 20, display: "flex", flexDirection: "column", gap: 10 }}>
        {[
          { icon: "🚫", text: "This website cannot process online sales, bookings, or appointments. Visitors contact you directly by phone or email." },
          { icon: "🔒", text: "Once your website is generated, content cannot be edited through insixlive. Changes require a new generation (new purchase)." },
          { icon: "💳", text: "Payments are non-refundable once generation begins. If generation fails and no site is delivered, contact support." },
        ].map(({ icon, text }) => (
          <div key={text} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <span style={{ fontSize: 16, flexShrink: 0 }}>{icon}</span>
            <span style={{ fontSize: 13.5, color: C.ink, lineHeight: 1.5 }}>{text}</span>
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
        <span style={{ fontSize: 13.5, color: C.ink, lineHeight: 1.45 }}>
          I have read and agree to the{" "}
          <Link href="/terms" target="_blank" style={{ color: C.accent, textDecoration: "underline" }}>Terms of Use</Link>
          {" "}and{" "}
          <Link href="/privacy" target="_blank" style={{ color: C.accent, textDecoration: "underline" }}>Privacy Policy</Link>.
        </span>
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <a href="https://insixlive.com" style={{
          flex: 1, height: 48, borderRadius: 12, border: `1px solid ${C.border}`, background: "transparent",
          color: C.muted, fontFamily: C.font, fontSize: 15, fontWeight: 500, display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none",
        }}>
          I don&apos;t agree
        </a>
        <button type="button" disabled={!checked} onClick={onAgree} style={{
          flex: 2, height: 48, borderRadius: 12, border: "none",
          background: checked ? C.ink : C.border, color: checked ? "#fff" : C.muted,
          fontFamily: C.font, fontSize: 15, fontWeight: 600, cursor: checked ? "pointer" : "default",
          transition: "background .15s, color .15s",
        }}>
          I agree — start building
        </button>
      </div>
    </Gate>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

type Gate = "loading" | "terms" | "ready";

function GenerateContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editSiteId = searchParams.get("edit") ?? undefined;
  const [gate, setGate] = useState<Gate>("loading");

  useEffect(() => {
    const termsAgreed = typeof window !== "undefined" && localStorage.getItem("terms_agreed") === "1";

    fetch("/api/auth/me")
      .then(r => r.json())
      .then(data => {
        if (!data.user) { router.push("/login"); return; }
        if (!termsAgreed) { setGate("terms"); return; }
        setGate("ready");
      })
      .catch(() => router.push("/login"));
  }, [router]);

  const handleTermsAgree = () => {
    localStorage.setItem("terms_agreed", "1");
    setGate("ready");
  };

  if (gate === "loading") return <Spinner />;
  if (gate === "terms")   return <TermsGate onAgree={handleTermsAgree} />;
  return <GenerateWizard editSiteId={editSiteId} />;
}

export default function GeneratePage() {
  return (
    <Suspense fallback={<Spinner />}>
      <GenerateContent />
    </Suspense>
  );
}
