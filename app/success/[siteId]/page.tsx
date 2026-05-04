// app/success/[siteId].tsx - Success page after website generation

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

type Site = {
  id: string;
  name: string;
  url: string;
  githubUrl: string;
  status: string;
  createdAt: string;
};

export default function SuccessPage() {
  const params = useParams();
  const router = useRouter();
  const siteId = params.siteId as string;
  const [site, setSite] = useState<Site | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get site from localStorage
    const sites = JSON.parse(localStorage.getItem("sites") || "[]");
    const foundSite = sites.find((s: Site) => s.id === siteId);

    if (foundSite) {
      setSite(foundSite);
    }
    setLoading(false);
  }, [siteId]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!site) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Website not found</p>
          <Link
            href="/dashboard"
            className="text-blue-600 hover:underline"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100">
      {/* Navigation */}
      <nav className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Link href="/" className="text-2xl font-bold text-blue-600">
            WebBuilder
          </Link>
        </div>
      </nav>

      {/* Success Message */}
      <div className="max-w-2xl mx-auto px-6 py-12 text-center">
        <div className="bg-white rounded-lg shadow-lg p-12">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Your Website is Ready!
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            {site.name} is now live and ready to use.
          </p>

          <div className="space-y-4 mb-8">
            {/* Live Website Link */}
            <div className="bg-gray-50 p-6 rounded">
              <p className="text-sm text-gray-600 mb-2">Your Website URL:</p>
              <a
                href={site.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-lg font-mono break-all"
              >
                {site.url}
              </a>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(site.url);
                  alert("URL copied!");
                }}
                className="block mt-2 text-blue-600 hover:underline text-sm"
              >
                Copy URL
              </button>
            </div>

            {/* GitHub Link */}
            <div className="bg-gray-50 p-6 rounded">
              <p className="text-sm text-gray-600 mb-2">Your Code on GitHub:</p>
              <a
                href={site.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-lg font-mono break-all"
              >
                {site.githubUrl}
              </a>
              <p className="text-sm text-gray-600 mt-2">
                You can download, fork, or manage your code here.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <a
              href={site.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-green-600 text-white font-bold py-3 rounded hover:bg-green-700"
            >
              View Your Live Website →
            </a>
            <Link
              href="/dashboard"
              className="block w-full bg-blue-600 text-white font-bold py-3 rounded hover:bg-blue-700"
            >
              Back to Dashboard
            </Link>
            <Link
              href="/generate"
              className="block w-full bg-gray-600 text-white font-bold py-3 rounded hover:bg-gray-700"
            >
              Create Another Website
            </Link>
          </div>

          {/* Info Box */}
          <div className="mt-8 bg-blue-50 border border-blue-200 p-6 rounded">
            <h3 className="font-bold text-blue-900 mb-2">What's Next?</h3>
            <ul className="text-sm text-blue-800 space-y-1 text-left">
              <li>✓ Your website is live and accessible globally</li>
              <li>✓ Your code is stored safely on GitHub</li>
              <li>✓ You can edit the code anytime</li>
              <li>✓ You own your website forever</li>
              <li>✓ Add a custom domain anytime</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}