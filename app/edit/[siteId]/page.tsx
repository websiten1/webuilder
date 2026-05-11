"use client";

import { useState, useEffect, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

type Site = {
  id: string;
  name: string;
  vercel_url: string;
  github_url: string;
  business_type: string;
  edit_count: number;
  current_version: number;
};

function EditFormContent() {
  const params = useParams();
  const router = useRouter();
  const siteId = params.siteId as string;

  const [site, setSite] = useState<Site | null>(null);
  const [loadingPage, setLoadingPage] = useState(true);
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (!d.user) { router.push("/login"); return; }
        if (d.user.paymentStatus !== "paid") { router.push("/checkout"); return; }
      })
      .catch(() => router.push("/login"));

    fetch("/api/sites")
      .then((r) => r.json())
      .then((d) => {
        const found = (d.sites as Site[])?.find((s) => s.id === siteId);
        if (found) setSite(found);
      })
      .finally(() => setLoadingPage(false));
  }, [siteId, router]);

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/edits/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteId, description }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to start checkout.");
        return;
      }
      // Free edit (no Stripe) — go straight to processing
      if (data.free) {
        window.location.href = data.redirectTo;
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingPage) {
    return (
      <div style={{ background: "#050510", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 28, height: 28, border: "2px solid rgba(99,102,241,0.3)", borderTopColor: "var(--accent)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!site) {
    return (
      <div style={{ background: "#FAFAFA", minHeight: "100vh", color: "#0A0E14", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="text-center">
          <p className="mb-4" style={{ color: "rgba(255,255,255,0.5)" }}>Website not found.</p>
          <Link href="/dashboard" style={{ color: "var(--accent)", fontSize: 14 }}>Back to dashboard</Link>
        </div>
      </div>
    );
  }

  const charCount = description.length;
  const charOk = charCount >= 10 && charCount <= 500;

  return (
    <div style={{ background: "#FAFAFA", minHeight: "100vh", color: "#0A0E14" }} className="flex flex-col">
      {/* Glow */}
      <div style={{ position: "fixed", top: 0, left: "50%", transform: "translateX(-50%)", width: 600, height: 400, background: "radial-gradient(ellipse, rgba(99,102,241,0.14) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />

      <nav className="relative px-6 h-16 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", zIndex: 10 }}>
        <Link href="/" className="font-bold tracking-tight text-sm">WebBuilder</Link>
        <Link href="/dashboard" className="text-sm" style={{ color: "var(--text2)" }}>← Dashboard</Link>
      </nav>

      <div className="relative flex-1 flex items-center justify-center px-6 py-16" style={{ zIndex: 1 }}>
        <div className="w-full" style={{ maxWidth: 520 }}>
          {/* Site info */}
          <div className="glass rounded-2xl p-5 mb-6 flex items-center gap-4">
            <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} style={{ color: "var(--accent)" }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">{site.name}</p>
              <p className="text-xs mt-0.5 truncate" style={{ color: "var(--text3)" }}>
                v{site.current_version} · {site.edit_count === 0 ? "No edits yet" : `${site.edit_count} edit${site.edit_count !== 1 ? "s" : ""}`}
              </p>
            </div>
            <a href={site.vercel_url} target="_blank" rel="noopener noreferrer" className="text-xs flex items-center gap-1" style={{ color: "var(--accent)", flexShrink: 0 }}>
              View site
              <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
            </a>
          </div>

          <div className="mb-6">
            <h1 className="font-bold tracking-tight mb-1" style={{ fontSize: "1.8rem" }}>Request changes</h1>
            <p className="text-sm" style={{ color: "var(--text2)" }}>
              Describe what you&apos;d like different. Claude will regenerate and redeploy your site.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="text-sm px-4 py-3 rounded-xl" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#fca5a5" }}>
                {error}
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium" style={{ color: "var(--text2)" }}>What would you like changed?</label>
                <span className="text-xs" style={{ color: charCount > 500 ? "#f87171" : charCount >= 10 ? "#10b981" : "var(--text3)" }}>
                  {charCount}/500
                </span>
              </div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={'e.g. "Add a customer testimonials section with 3 reviews"\n"Change the color scheme to dark blue and gold"\n"Add a team page with 3 staff members"'}
                rows={5}
                className="inp"
                style={{ resize: "vertical", minHeight: 120, lineHeight: 1.6 }}
                required
                minLength={10}
                maxLength={500}
              />
              <p className="text-xs mt-1.5" style={{ color: "var(--text3)" }}>
                Be specific — the more detail you give, the better the result.
              </p>
            </div>

            {/* Price card */}
            <div className="glass rounded-xl p-4 flex items-center justify-between" style={{ border: "1px solid rgba(99,102,241,0.2)" }}>
              <div>
                <p className="font-semibold text-sm">One-time edit fee</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--text3)" }}>Full regeneration · Live in ~2 min</p>
              </div>
              <div className="text-right">
                <span className="font-bold" style={{ fontSize: "1.4rem", letterSpacing: "-0.03em" }}>€15</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || !charOk}
              className="btn-primary w-full rounded-xl py-4 text-sm font-semibold"
              style={{ fontSize: 15 }}
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.8s linear infinite", display: "inline-block" }} />
                  Redirecting to payment…
                </span>
              ) : "Pay €15 — Apply Changes"}
            </button>

            <p className="text-xs text-center" style={{ color: "var(--text3)" }}>
              Secure checkout via Stripe · Automatic refund if generation fails
            </p>
          </form>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function EditPage() {
  return (
    <Suspense>
      <EditFormContent />
    </Suspense>
  );
}
