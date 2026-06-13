"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"verifying" | "generating" | "error">("verifying");
  const [message, setMessage] = useState("Verifying your payment…");

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    if (!sessionId) {
      router.replace("/generate");
      return;
    }

    (async () => {
      try {
        // 1. Verify payment
        const verifyRes = await fetch("/api/checkout/verify-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        });
        if (!verifyRes.ok) {
          const err = await verifyRes.json().catch(() => ({}));
          throw new Error(err.error || "Payment verification failed.");
        }

        // 2. Load wizard data — localStorage first, server draft as fallback
        const raw = localStorage.getItem("wizard_data");
        let formData = null;
        if (raw) {
          try { formData = JSON.parse(raw); } catch { /* ignore */ }
        }
        if (!formData) {
          // Fallback: fetch the draft saved to the server before payment
          const draftRes = await fetch("/api/wizard/save-draft");
          if (draftRes.ok) {
            const { data } = await draftRes.json();
            formData = data;
          }
        }
        if (!formData) {
          throw new Error("Wizard data not found. Please contact support — your payment was received.");
        }
        const tier = localStorage.getItem("pending_tier") ?? "website";

        setStatus("generating");
        setMessage("Payment confirmed! Generating your website now…");

        // 3. Generate site
        const genRes = await fetch("/api/generate-site", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ formData, tier }),
        });
        if (!genRes.ok) {
          const err = await genRes.json().catch(() => ({}));
          throw new Error(err.error || `Generation failed (${genRes.status})`);
        }
        const result = await genRes.json();
        localStorage.removeItem("wizard_data");
        localStorage.removeItem("pending_tier");
        router.replace(`/success/${result.siteId}`);
      } catch (err) {
        setStatus("error");
        setMessage(err instanceof Error ? err.message : "Something went wrong.");
      }
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const T = { ink: "#0A0E14", six: "#FF5A1F", em: "#00B377", muted: "#6B7180", line: "#E2E2DE", bg: "#FAFAFA" };

  return (
    <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ maxWidth: 480, width: "100%", textAlign: "center" }}>
        {status === "error" ? (
          <>
            <div style={{ width: 56, height: 56, borderRadius: 28, background: "rgba(239,68,68,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#ef4444" strokeWidth="2"/><path d="M12 8v4M12 16h.01" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"/></svg>
            </div>
            <h1 style={{ fontFamily: "system-ui,sans-serif", fontSize: 22, fontWeight: 700, color: T.ink, marginBottom: 10 }}>Something went wrong</h1>
            <p style={{ fontFamily: "system-ui,sans-serif", fontSize: 15, color: T.muted, marginBottom: 28, lineHeight: 1.55 }}>{message}</p>
            <button
              onClick={() => router.replace("/generate")}
              style={{ padding: "12px 28px", borderRadius: 10, background: T.ink, color: "#fff", fontFamily: "system-ui,sans-serif", fontSize: 14, fontWeight: 600, border: "none", cursor: "pointer" }}
            >
              Back to generator
            </button>
          </>
        ) : (
          <>
            <div style={{ width: 56, height: 56, borderRadius: 28, background: status === "generating" ? "rgba(0,179,119,0.1)" : "rgba(99,102,241,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              {status === "generating" ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke={T.em} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              ) : (
                <span style={{ width: 22, height: 22, border: "2.5px solid rgba(10,14,20,0.15)", borderTopColor: T.six, borderRadius: "50%", animation: "spin 0.8s linear infinite", display: "inline-block" }}/>
              )}
            </div>
            <h1 style={{ fontFamily: "system-ui,sans-serif", fontSize: 22, fontWeight: 700, color: T.ink, marginBottom: 10 }}>
              {status === "generating" ? "Building your website…" : "Verifying payment…"}
            </h1>
            <p style={{ fontFamily: "system-ui,sans-serif", fontSize: 15, color: T.muted, lineHeight: 1.55 }}>{message}</p>
            {status === "generating" && (
              <p style={{ fontFamily: "ui-monospace,monospace", fontSize: 12, color: T.muted, marginTop: 16 }}>
                This takes ~90 seconds. Please don&apos;t close this tab.
              </p>
            )}
          </>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={null}>
      <SuccessContent />
    </Suspense>
  );
}
