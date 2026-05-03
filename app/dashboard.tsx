// app/dashboard.tsx - User dashboard showing all their sites

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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Get user info from localStorage
    const storedEmail = localStorage.getItem("email");
    const userId = localStorage.getItem("userId");

    if (!userId) {
      router.push("/login");
      return;
    }

    setEmail(storedEmail || "User");

    // Load sites from localStorage (for demo)
    const storedSites = localStorage.getItem("sites");
    if (storedSites) {
      setSites(JSON.parse(storedSites));
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("userId");
    localStorage.removeItem("email");
    localStorage.removeItem("sites");
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation */}
      <nav className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-blue-600">
            WebBuilder
          </Link>
          <div className="flex items-center space-x-6">
            <span className="text-gray-600">{email}</span>
            <button
              onClick={handleLogout}
              className="text-gray-600 hover:text-gray-900"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-gray-900">My Websites</h1>
          <Link
            href="/generate"
            className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700"
          >
            + Create New Website
          </Link>
        </div>

        {/* Sites List */}
        {sites.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-600 text-lg mb-4">
              You haven't created any websites yet.
            </p>
            <Link
              href="/generate"
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 inline-block"
            >
              Create Your First Website
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sites.map((site) => (
              <div key={site.id} className="bg-white rounded-lg shadow p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {site.name}
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  Created: {new Date(site.createdAt).toLocaleDateString()}
                </p>
                <div className="space-y-3">
                  <a
                    href={site.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full bg-green-600 text-white py-2 rounded text-center hover:bg-green-700"
                  >
                    View Site
                  </a>
                  <a
                    href={site.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full bg-gray-800 text-white py-2 rounded text-center hover:bg-gray-900"
                  >
                    View Code
                  </a>
                </div>
                <p className="text-sm text-gray-500 mt-4">
                  Status: <span className="font-bold text-green-600">{site.status}</span>
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}