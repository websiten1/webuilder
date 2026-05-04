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
    <div className="min-h-screen bg-white">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-sm font-semibold tracking-tight text-gray-900">WebBuilder</Link>
          <div className="flex items-center gap-6">
            <span className="text-sm text-gray-400">{email}</span>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
            >
              Log out
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 pt-32 pb-24">
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-2">Dashboard</p>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">My websites</h1>
          </div>
          <Link
            href="/generate"
            className="bg-gray-900 text-white text-sm font-medium px-5 py-2.5 rounded-md hover:bg-gray-700 transition-colors"
          >
            + New website
          </Link>
        </div>

        {sites.length === 0 ? (
          <div className="border border-gray-200 rounded-xl p-16 text-center">
            <p className="text-sm font-medium text-gray-900 mb-1">No websites yet</p>
            <p className="text-sm text-gray-400 mb-6">Create your first AI-generated website in under 5 minutes.</p>
            <Link
              href="/generate"
              className="inline-block bg-gray-900 text-white text-sm font-medium px-6 py-2.5 rounded-md hover:bg-gray-700 transition-colors"
            >
              Create your first website
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sites.map((site) => (
              <div key={site.id} className="border border-gray-200 rounded-xl p-6 hover:border-gray-400 transition-colors group">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">{site.name}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(site.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-xs text-green-700 bg-green-50 border border-green-100 px-2 py-0.5 rounded-full">
                    <span className="w-1 h-1 bg-green-500 rounded-full" />
                    {site.status}
                  </span>
                </div>

                <p className="text-xs text-gray-400 font-mono truncate mb-5">
                  {site.url.replace("https://", "")}
                </p>

                <div className="flex gap-2">
                  <a
                    href={site.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-center text-xs font-medium bg-gray-900 text-white py-2 rounded-md hover:bg-gray-700 transition-colors"
                  >
                    View site
                  </a>
                  <a
                    href={site.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-center text-xs font-medium border border-gray-200 text-gray-600 py-2 rounded-md hover:border-gray-400 hover:text-gray-900 transition-colors"
                  >
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
