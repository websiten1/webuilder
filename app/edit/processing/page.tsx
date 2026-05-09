"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

type Stage = {
  label: string;
  duration: number; // approx seconds for progress animation
};

const STAGES: Stage[] = [
  { label: "Verifying payment…", duration: 3 },
  { label: "Reading your current website…", duration: 5 },
  { label: "Sending changes to Claude AI…", duration: 40 },
  { label: "Applying your changes…", duration: 30 },
  { label: "Pushing updated code to GitHub…", duration: 10 },
  { label: "Deploying to Vercel…", duration: 15 },
  { label: "Finalising…", duration: 5 },
];

function ProcessingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get("session_id");
  const editId = searchParams.get("edit_id");

  const [stageIndex, setStageIndex] = useState(0);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [siteUrl, setSiteUrl] = useState("");
  const called = useRef(false);

  // Advance the visual stage indicator over time
  useEffect(() => {
    if (done || error) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    let elapsed = 0;
    STAGES.forEach((s, i) => {
      elapsed += s.duration * 1000;
      timers.push(setTimeout(() => {
        if (i + 1 < STAGES.length) setStageIndex(i + 1);
      }, elapsed));
    });
    return () => timers.forEach(clearTimeout);
  }, [done, error]);

  // Trigger the actual processing once
  useEffect(() => {
    if (!sessionId || !editId || called.current) return;
    called.current = true;

    async function process() {
      try {
        const res = await fetch("/api/edits/process", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId, editId }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Processing failed.");
          return;
        }
        setSiteUrl(data.siteUrl || "");
        setDone(true);
        setTimeout(() => router.push("/dashboard"), 4000);
      } catch {
        setError("Network error during processing. Your payment may have been refunded.");
      }
    }

    process();
  }, [sessionId, editId, router]);

  if (!sessionId || !editId) {
    return (
      <div style={{ background: "#050510", minHeight: "100vh", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="text-center">
          <p className="mb-4" style={{ color: "rgba(255,255,255,0.5)" }}>Invalid session.</p>
          <Link href="/dashboard" style={{ color: "var(--accent)", fontSize: 14 }}>Back to dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "#050510", minHeight: "100vh", color: "#fff" }} className="flex flex-col">
      <div style={{ position: "fixed", top: 0, left: "50%", transform: "translateX(-50%)", width: 600, height: 400, background: done ? "radial-gradient(ellipse, rgba(16,185,129,0.14) 0%, transparent 70%)" : "radial-gradient(ellipse, rgba(99,102,241,0.14) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0, transition: "background 1s" }} />

      <nav className="relative px-6 h-16 flex items-center" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", zIndex: 10 }}>
        <Link href="/" className="font-bold tracking-tight text-sm">WebBuilder</Link>
      </nav>

      <div className="relative flex-1 flex items-center justify-center px-6 py-16" style={{ zIndex: 1 }}>
        <div className="w-full text-center" style={{ maxWidth: 480 }}>

          {!done && !error && (
            <>
              {/* Spinner */}
              <div style={{ width: 60, height: 60, borderRadius: "50%", border: "3px solid rgba(99,102,241,0.15)", borderTopColor: "#6366f1", animation: "spin 1s linear infinite", margin: "0 auto 32px" }} />
              <h1 className="font-bold tracking-tight mb-3" style={{ fontSize: "1.6rem" }}>
                Applying your changes…
              </h1>
              <p className="mb-10" style={{ color: "var(--text2)", fontSize: 14 }}>
                This usually takes 1–2 minutes. Don&apos;t close this tab.
              </p>

              {/* Stage list */}
              <div className="glass rounded-2xl p-5 text-left space-y-3">
                {STAGES.map((stage, i) => {
                  const isActive = i === stageIndex;
                  const isDone = i < stageIndex;
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <div style={{ width: 20, height: 20, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
                        background: isDone ? "rgba(16,185,129,0.15)" : isActive ? "rgba(99,102,241,0.15)" : "rgba(255,255,255,0.04)",
                        border: isDone ? "1px solid rgba(16,185,129,0.3)" : isActive ? "1px solid rgba(99,102,241,0.3)" : "1px solid rgba(255,255,255,0.08)" }}>
                        {isDone ? (
                          <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="#10b981" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                        ) : isActive ? (
                          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#6366f1", animation: "pulse 1s ease-in-out infinite" }} />
                        ) : (
                          <div style={{ width: 5, height: 5, borderRadius: "50%", background: "rgba(255,255,255,0.15)" }} />
                        )}
                      </div>
                      <span className="text-sm" style={{ color: isDone ? "#6ee7b7" : isActive ? "#fff" : "rgba(255,255,255,0.3)", fontWeight: isActive ? 500 : 400 }}>
                        {stage.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {done && (
            <>
              <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
                <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="#10b981" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              </div>
              <h1 className="font-bold tracking-tight mb-2" style={{ fontSize: "1.8rem" }}>Your website has been updated!</h1>
              <p className="mb-6" style={{ color: "var(--text2)", fontSize: 15 }}>
                Changes are live. Redirecting to your dashboard…
              </p>
              {siteUrl && (
                <a href={siteUrl} target="_blank" rel="noopener noreferrer" className="btn-primary rounded-xl px-8 py-3 text-sm inline-block" style={{ textDecoration: "none" }}>
                  View Updated Site
                </a>
              )}
              <div className="mt-4">
                <Link href="/dashboard" className="text-sm" style={{ color: "var(--text3)" }}>Go to dashboard</Link>
              </div>
            </>
          )}

          {error && (
            <>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#f87171" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </div>
              <h1 className="font-bold tracking-tight mb-2" style={{ fontSize: "1.5rem" }}>Something went wrong</h1>
              <p className="mb-6" style={{ color: "var(--text2)", fontSize: 14, lineHeight: 1.7 }}>{error}</p>
              <Link href="/dashboard" className="btn-ghost rounded-xl px-8 py-3 text-sm inline-block" style={{ textDecoration: "none" }}>Back to Dashboard</Link>
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
      `}</style>
    </div>
  );
}

export default function EditProcessingPage() {
  return (
    <Suspense>
      <ProcessingContent />
    </Suspense>
  );
}
