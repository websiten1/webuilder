"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Site = {
  id: string;
  name: string;
  url: string;
  githubUrl: string;
  status: string;
  createdAt: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const [sites, setSites] = useState<Site[]>([]);
  const [email, setEmail] = useState("");

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) { router.push("/login"); return; }
    setEmail(localStorage.getItem("email") || "");
    const stored = localStorage.getItem("sites");
    if (stored) setSites(JSON.parse(stored));
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("userId");
    localStorage.removeItem("email");
    localStorage.removeItem("sites");
    router.push("/");
  };

  return (
    <div style={{ background: "#050510", minHeight: "100vh", color: "#fff" }}>
      <nav className="fixed top-0 left-0 right-0 z-50 glass" style={{ borderTop: "none", borderLeft: "none", borderRight: "none" }}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-bold tracking-tight text-sm">WebBuilder</Link>
          <div className="flex items-center gap-6">
            <span className="text-sm" style={{ color: "var(--text3)" }}>{email}</span>
            <button
              onClick={handleLogout}
              className="text-sm"
              style={{ color: "var(--text2)" }}
            >
              Log out
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 pt-32 pb-24">
        <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
          <div>
            <p className="text-xs font-semibold tracking-widest mb-2"
              style={{ color: "var(--text3)", textTransform: "uppercase" }}>Dashboard</p>
            <h1 className="font-bold tracking-tight" style={{ fontSize: "2rem" }}>My websites</h1>
          </div>
          <Link href="/generate" className="btn-primary rounded-xl px-6 py-3 text-sm">
            + New website
          </Link>
        </div>

        {sites.length === 0 ? (
          <div className="glass rounded-2xl p-16 text-center">
            <div className="w-14 h-14 rounded-2xl mx-auto mb-5 flex items-center justify-center"
              style={{ background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.2)" }}>
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                strokeWidth={1.6} style={{ color: "var(--accent)" }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" />
              </svg>
            </div>
            <p className="font-semibold mb-1">No websites yet</p>
            <p className="text-sm mb-8" style={{ color: "var(--text2)" }}>
              Create your first AI-generated website in 100 seconds.
            </p>
            <Link href="/generate" className="btn-primary rounded-xl px-7 py-3 text-sm">
              Create your first website
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sites.map((site) => (
              <div key={site.id} className="glass glass-hover rounded-2xl p-6 flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0 mr-3">
                    <h3 className="font-semibold truncate">{site.name}</h3>
                    <p className="text-xs mt-0.5" style={{ color: "var(--text3)" }}>
                      {new Date(site.createdAt).toLocaleDateString("en-GB", {
                        day: "numeric", month: "short", year: "numeric",
                      })}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full flex-shrink-0"
                    style={{ background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.2)", color: "#6ee7b7" }}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#10b981" }} />
                    {site.status}
                  </span>
                </div>

                <p className="text-xs font-mono mb-5 truncate" style={{ color: "var(--text3)" }}>
                  {site.url.replace("https://", "")}
                </p>

                <div className="flex gap-2 mt-auto">
                  <a href={site.url} target="_blank" rel="noopener noreferrer"
                    className="btn-primary flex-1 rounded-lg py-2.5 text-xs">
                    View site
                  </a>
                  <a href={site.githubUrl} target="_blank" rel="noopener noreferrer"
                    className="btn-ghost flex-1 rounded-lg py-2.5 text-xs">
                    View code
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
