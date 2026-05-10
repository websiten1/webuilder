"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

type Site = {
  id: string;
  name: string;
  vercel_url: string;
  github_url: string;
  status: string;
  created_at: string;
};

function CheckCircle() {
  return (
    <svg width="56" height="56" fill="none" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="12" fill="rgba(16,185,129,0.12)" />
      <circle cx="12" cy="12" r="11" stroke="rgba(16,185,129,0.3)" strokeWidth="1" fill="none" />
      <path d="M7 12.5l3.5 3.5 6-7" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={copy}
      style={{
        fontSize: 11, padding: "4px 10px", borderRadius: 6, cursor: "pointer",
        background: copied ? "rgba(16,185,129,0.12)" : "rgba(255,255,255,0.06)",
        border: copied ? "1px solid rgba(16,185,129,0.3)" : "1px solid rgba(255,255,255,0.1)",
        color: copied ? "#6ee7b7" : "rgba(255,255,255,0.5)",
        transition: "all 0.2s",
      }}
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

export default function SuccessPage() {
  const params = useParams();
  const siteId = params.siteId as string;
  const [site, setSite] = useState<Site | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/sites");
        if (res.ok) {
          const data = await res.json();
          const found = (data.sites as Site[]).find((s) => s.id === siteId);
          if (found) setSite(found);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [siteId]);

  if (loading) {
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

  return (
    <div style={{ background: "#FAFAFA", minHeight: "100vh", color: "#0A0E14" }}>
      <div style={{
        position: "fixed", top: 0, left: "50%", transform: "translateX(-50%)",
        width: 600, height: 400,
        background: "radial-gradient(ellipse, rgba(16,185,129,0.12) 0%, transparent 70%)",
        pointerEvents: "none", zIndex: 0,
      }} />

      <nav style={{ position: "relative", zIndex: 10, borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "0 24px", height: 64, display: "flex", alignItems: "center" }}>
        <Link href="/" style={{ fontWeight: 700, fontSize: 15, letterSpacing: "-0.02em", color: "#fff", textDecoration: "none" }}>
          WebBuilder
        </Link>
      </nav>

      <div style={{ position: "relative", zIndex: 1, maxWidth: 560, margin: "0 auto", padding: "64px 24px 96px" }}>
        <div className="fade-up text-center mb-12">
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
            <CheckCircle />
          </div>
          <h1 style={{ fontSize: "2.2rem", fontWeight: 700, letterSpacing: "-0.03em", marginBottom: 8 }}>
            Your website is live.
          </h1>
          <p style={{ color: "var(--text2)", fontSize: "1rem" }}>
            {site.name} is deployed and accessible globally.
          </p>
        </div>

        <div className="fade-up-1 glass rounded-2xl p-5 mb-4">
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text3)", marginBottom: 10 }}>
            Live website
          </p>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <a href={site.vercel_url} target="_blank" rel="noopener noreferrer"
              style={{ color: "#a5b4fc", fontSize: 13, fontFamily: "ui-monospace, monospace", wordBreak: "break-all", textDecoration: "none", flex: 1 }}>
              {site.vercel_url}
            </a>
            <CopyButton text={site.vercel_url} />
          </div>
        </div>

        <div className="fade-up-2 glass rounded-2xl p-5 mb-8">
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text3)", marginBottom: 10 }}>
            Source code on GitHub
          </p>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <a href={site.github_url} target="_blank" rel="noopener noreferrer"
              style={{ color: "var(--text2)", fontSize: 13, fontFamily: "ui-monospace, monospace", wordBreak: "break-all", textDecoration: "none", flex: 1 }}>
              {site.github_url}
            </a>
            <CopyButton text={site.github_url} />
          </div>
          <p style={{ fontSize: 12, color: "var(--text3)", marginTop: 8 }}>Download, fork, or edit your code anytime.</p>
        </div>

        <div className="fade-up-3" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <a href={site.vercel_url} target="_blank" rel="noopener noreferrer"
            className="btn-primary rounded-xl py-3.5 w-full text-sm"
            style={{ textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            View your live website
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
          <Link href="/dashboard" className="btn-ghost rounded-xl py-3.5 w-full text-sm text-center" style={{ textDecoration: "none" }}>
            Back to dashboard
          </Link>
          <Link href="/generate" className="btn-ghost rounded-xl py-3.5 w-full text-sm text-center" style={{ textDecoration: "none" }}>
            Create another website
          </Link>
        </div>

        <div className="fade-up-4 glass rounded-2xl p-6 mt-8">
          <p style={{ fontSize: 12, fontWeight: 600, marginBottom: 14, color: "var(--text2)" }}>What you now have</p>
          <ul style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {[
              "Website live and accessible globally",
              "Source code on your GitHub",
              "Edit or extend the code anytime",
              "You own it forever — no monthly fees",
              "Add a custom domain anytime",
            ].map((item) => (
              <li key={item} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "var(--text2)" }}>
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#10b981" strokeWidth={2.5} style={{ flexShrink: 0 }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Edit CTA */}
        <div className="fade-up-4 glass rounded-2xl p-6 mt-4" style={{ border: "1px solid rgba(99,102,241,0.15)" }}>
          <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 4, color: "var(--text2)" }}>Want to make changes later?</p>
          <p style={{ fontSize: 12, color: "var(--text3)", marginBottom: 14, lineHeight: 1.6 }}>
            Come back to your dashboard anytime. Click &quot;Request Changes&quot; for €15 per edit — Claude regenerates and redeploys in ~2 minutes.
          </p>
          <Link href={`/edit/${siteId}`} style={{ fontSize: 12, color: "var(--accent)", textDecoration: "none" }}>
            Request changes →
          </Link>
        </div>
      </div>
    </div>
  );
}
