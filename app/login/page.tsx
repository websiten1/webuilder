"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (email && password) {
        localStorage.setItem("userId", "user-" + Date.now());
        localStorage.setItem("email", email);
        router.push("/dashboard");
      } else {
        setError("Please fill in all fields.");
      }
    } catch {
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: "#050510", minHeight: "100vh", color: "#fff" }} className="flex flex-col">
      <nav className="px-6 h-16 flex items-center" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <Link href="/" className="font-bold tracking-tight text-sm">WebBuilder</Link>
      </nav>

      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full" style={{ maxWidth: 400 }}>
          {/* Glow */}
          <div style={{
            position: "absolute", left: "50%", top: "30%", transform: "translate(-50%,-50%)",
            width: 400, height: 400,
            background: "radial-gradient(circle, rgba(99,102,241,0.15), transparent 70%)",
            pointerEvents: "none",
          }} />

          <div className="relative">
            <div className="mb-8">
              <h1 className="font-bold tracking-tight mb-1" style={{ fontSize: "1.8rem" }}>Welcome back</h1>
              <p className="text-sm" style={{ color: "var(--text2)" }}>Sign in to your account to continue.</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <div className="text-sm px-4 py-3 rounded-xl"
                  style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#fca5a5" }}>
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text2)" }}>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="inp"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium" style={{ color: "var(--text2)" }}>Password</label>
                  <span className="text-xs cursor-pointer" style={{ color: "var(--accent)" }}>Forgot password?</span>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="inp"
                  required
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="remember"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  style={{ accentColor: "var(--accent)", width: 14, height: 14 }}
                />
                <label htmlFor="remember" className="text-xs" style={{ color: "var(--text2)" }}>Remember me</label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full rounded-xl py-3.5 text-sm mt-2"
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </form>

            <p className="text-sm text-center mt-6" style={{ color: "var(--text2)" }}>
              No account?{" "}
              <Link href="/signup" className="font-medium" style={{ color: "var(--accent)" }}>
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
