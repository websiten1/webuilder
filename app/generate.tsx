// app/generate.tsx - Generate new website page

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function GeneratePage() {
  const router = useRouter();
  const [siteName, setSiteName] = useState("");
  const [businessType, setBusinessType] = useState("restaurant");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      router.push("/login");
    }
  }, [router]);

  const handleGenerateSite = async (e: React.FormEvent) => {
    e.preventDefault();
    const runId = `legacy-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    // #region agent log
    fetch('http://127.0.0.1:7469/ingest/a117af1e-34fc-4785-aeae-36ebe2d13be6',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'dfd4e1'},body:JSON.stringify({sessionId:'dfd4e1',runId,hypothesisId:'H7',location:'app/generate.tsx:26',message:'legacy generate submit clicked',data:{hasSiteName:!!siteName,hasDescription:!!description,businessType},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    setLoading(true);
    setError("");
    setProgress(0);

    try {
      if (!siteName || !description) {
        setError("Please fill in all fields");
        setLoading(false);
        return;
      }

      const userId = localStorage.getItem("userId");

      // Show progress
      setProgress(25);

      // Call the API endpoint
      const response = await fetch("/api/generate-site", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: `Create a professional website for a ${businessType}: ${siteName}. Description: ${description}. Make it visually appealing, responsive, and include relevant sections.`,
          siteName,
          userId,
        }),
      });
      // #region agent log
      fetch('http://127.0.0.1:7469/ingest/a117af1e-34fc-4785-aeae-36ebe2d13be6',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'dfd4e1'},body:JSON.stringify({sessionId:'dfd4e1',runId,hypothesisId:'H7',location:'app/generate.tsx:55',message:'legacy generate response received',data:{status:response.status,ok:response.ok},timestamp:Date.now()})}).catch(()=>{});
      // #endregion

      setProgress(75);

      if (!response.ok) {
        const errorData = await response.json();
        // #region agent log
        fetch('http://127.0.0.1:7469/ingest/a117af1e-34fc-4785-aeae-36ebe2d13be6',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'dfd4e1'},body:JSON.stringify({sessionId:'dfd4e1',runId,hypothesisId:'H7',location:'app/generate.tsx:61',message:'legacy generate response not ok',data:{status:response.status,error:errorData?.error??null},timestamp:Date.now()})}).catch(()=>{});
        // #endregion
        throw new Error(errorData.error || "Failed to generate site");
      }

      const data = await response.json();
      // #region agent log
      fetch('http://127.0.0.1:7469/ingest/a117af1e-34fc-4785-aeae-36ebe2d13be6',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'dfd4e1'},body:JSON.stringify({sessionId:'dfd4e1',runId,hypothesisId:'H7',location:'app/generate.tsx:66',message:'legacy generate succeeded',data:{repoName:data?.repoName??null,siteUrl:data?.siteUrl??null},timestamp:Date.now()})}).catch(()=>{});
      // #endregion

      setProgress(100);

      // Save site to localStorage
      const sites = JSON.parse(localStorage.getItem("sites") || "[]");
      sites.push({
        id: data.repoName,
        name: siteName,
        url: data.siteUrl,
        githubUrl: data.githubUrl,
        status: "deployed",
        createdAt: new Date().toISOString(),
      });
      localStorage.setItem("sites", JSON.stringify(sites));

      // Redirect to success page
      router.push(`/success/${data.repoName}`);
    } catch (err) {
      // #region agent log
      fetch('http://127.0.0.1:7469/ingest/a117af1e-34fc-4785-aeae-36ebe2d13be6',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'dfd4e1'},body:JSON.stringify({sessionId:'dfd4e1',runId,hypothesisId:'H7',location:'app/generate.tsx:84',message:'legacy generate failed',data:{error:err instanceof Error?err.message:String(err)},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      setError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100">
      {/* Navigation */}
      <nav className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-blue-600">
            WebBuilder
          </Link>
          <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
            Back to Dashboard
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Create Your Website
        </h1>
        <p className="text-gray-600 mb-8">
          Describe your business and we'll create a professional website in seconds
        </p>

        <form onSubmit={handleGenerateSite} className="bg-white rounded-lg shadow-lg p-8">
          {error && (
            <div className="bg-red-100 text-red-700 p-4 rounded mb-6">
              {error}
            </div>
          )}

          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Website Name
            </label>
            <input
              type="text"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              placeholder="e.g., John's Pizza Place"
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
              required
              disabled={loading}
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Business Type
            </label>
            <select
              value={businessType}
              onChange={(e) => setBusinessType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
              disabled={loading}
            >
              <option value="restaurant">Restaurant</option>
              <option value="salon">Hair Salon</option>
              <option value="photography">Photography</option>
              <option value="plumbing">Plumbing</option>
              <option value="consulting">Consulting</option>
              <option value="dental">Dental</option>
              <option value="ecommerce">E-commerce</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell us about your business... (services, location, unique features, etc.)"
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-600 h-32"
              required
              disabled={loading}
            />
          </div>

          {loading && (
            <div className="mb-6">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-center text-gray-600 mt-2">
                {progress === 25 && "Claude is generating your website..."}
                {progress === 75 && "Uploading to GitHub..."}
                {progress === 100 && "Deploying to Vercel..."}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white font-bold py-3 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Generating..." : "Generate My Website"}
          </button>
        </form>
      </div>
    </div>
  );
}