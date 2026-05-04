"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignup = async (e: React.SyntheticEvent<HTMLFormElement>) => {
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
      setError("Signup failed. Please try again.");
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
          <div style={{
            position: "absolute", left: "50%", top: "30%", transform: "translate(-50%,-50%)",
            width: 400, height: 400,
            background: "radial-gradient(circle, rgba(168,85,247,0.15), transparent 70%)",
            pointerEvents: "none",
          }} />

          <div className="relative">
            <div className="mb-8">
              <h1 className="font-bold tracking-tight mb-1" style={{ fontSize: "1.8rem" }}>Create your account</h1>
              <p className="text-sm" style={{ color: "var(--text2)" }}>Get your website live in 100 seconds.</p>
            </div>

            <form onSubmit={handleSignup} className="space-y-4">
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
                <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text2)" }}>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a secure password"
                  className="inp"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full rounded-xl py-3.5 text-sm mt-2"
              >
                {loading ? "Creating account..." : "Create account — €49.99"}
              </button>
            </form>

            <p className="text-xs text-center mt-3" style={{ color: "var(--text3)" }}>
              One-time payment. No monthly fees. No surprises.
            </p>

            <p className="text-sm text-center mt-6" style={{ color: "var(--text2)" }}>
              Already have an account?{" "}
              <Link href="/login" className="font-medium" style={{ color: "var(--accent)" }}>
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
