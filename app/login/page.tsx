"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [unverified, setUnverified] = useState(false);
  const [resendSent, setResendSent] = useState(false);

  const handleLogin = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setUnverified(false);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.code === "EMAIL_NOT_VERIFIED") {
          setUnverified(true);
        } else {
          setError(data.error || "Login failed. Please try again.");
        }
        return;
      }
      router.push(data.redirectTo || from);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    await fetch("/api/auth/resend-verification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setResendSent(true);
  };

  return (
    <div
      style={{ background: "#050510", minHeight: "100vh", color: "#fff" }}
      className="flex flex-col"
    >
      <nav
        className="px-6 h-16 flex items-center"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <Link href="/" className="font-bold tracking-tight text-sm">
          WebBuilder
        </Link>
      </nav>

      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full" style={{ maxWidth: 400 }}>
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "30%",
              transform: "translate(-50%,-50%)",
              width: 400,
              height: 400,
              background:
                "radial-gradient(circle, rgba(99,102,241,0.15), transparent 70%)",
              pointerEvents: "none",
            }}
          />

          <div className="relative">
            <div className="mb-8">
              <h1
                className="font-bold tracking-tight mb-1"
                style={{ fontSize: "1.8rem" }}
              >
                Welcome back
              </h1>
              <p className="text-sm" style={{ color: "var(--text2)" }}>
                Sign in to your account.
              </p>
            </div>

            {unverified && (
              <div
                className="text-sm px-4 py-3 rounded-xl mb-4"
                style={{
                  background: "rgba(234,179,8,0.08)",
                  border: "1px solid rgba(234,179,8,0.2)",
                  color: "#fde047",
                }}
              >
                <p className="font-medium mb-1">Email not verified</p>
                <p style={{ color: "rgba(253,224,71,0.7)", fontSize: 12 }}>
                  Check your inbox for the verification link.
                </p>
                {!resendSent ? (
                  <button
                    onClick={handleResend}
                    className="mt-2 text-xs font-medium"
                    style={{ color: "#fde047", textDecoration: "underline" }}
                  >
                    Resend verification email
                  </button>
                ) : (
                  <p className="mt-2 text-xs" style={{ color: "#a3e635" }}>
                    Email sent — check your inbox.
                  </p>
                )}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <div
                  className="text-sm px-4 py-3 rounded-xl"
                  style={{
                    background: "rgba(239,68,68,0.1)",
                    border: "1px solid rgba(239,68,68,0.2)",
                    color: "#fca5a5",
                  }}
                >
                  {error}
                </div>
              )}

              <div>
                <label
                  className="block text-xs font-medium mb-1.5"
                  style={{ color: "var(--text2)" }}
                >
                  Email
                </label>
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
                  <label
                    className="text-xs font-medium"
                    style={{ color: "var(--text2)" }}
                  >
                    Password
                  </label>
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

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full rounded-xl py-3.5 text-sm mt-2"
              >
                {loading ? "Signing in…" : "Sign in"}
              </button>
            </form>

            <p
              className="text-sm text-center mt-6"
              style={{ color: "var(--text2)" }}
            >
              No account?{" "}
              <Link
                href="/signup"
                className="font-medium"
                style={{ color: "var(--accent)" }}
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}
