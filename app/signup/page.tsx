"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const handleSignup = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, confirmPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Signup failed. Please try again.");
        return;
      }
      setDone(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
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
          <div className="text-center" style={{ maxWidth: 400 }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                background: "rgba(99,102,241,0.12)",
                border: "1px solid rgba(99,102,241,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 24px",
              }}
            >
              <svg
                width="24"
                height="24"
                fill="none"
                viewBox="0 0 24 24"
                stroke="#a5b4fc"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h1
              className="font-bold tracking-tight mb-2"
              style={{ fontSize: "1.6rem" }}
            >
              Check your inbox
            </h1>
            <p
              className="mb-6"
              style={{ color: "var(--text2)", fontSize: 14, lineHeight: 1.7 }}
            >
              We sent a verification link to{" "}
              <strong style={{ color: "#fff" }}>{email}</strong>. Click it to
              verify your email and continue to payment.
            </p>
            <p style={{ color: "var(--text3)", fontSize: 12 }}>
              Didn&apos;t get it? Check your spam folder or{" "}
              <button
                onClick={() => {
                  setDone(false);
                  router.push("/verify-email");
                }}
                style={{
                  color: "var(--accent)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                resend the email
              </button>
              .
            </p>
          </div>
        </div>
      </div>
    );
  }

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
                "radial-gradient(circle, rgba(168,85,247,0.15), transparent 70%)",
              pointerEvents: "none",
            }}
          />

          <div className="relative">
            {/* Steps */}
            <div className="flex items-center gap-2 mb-8">
              {[
                { n: 1, label: "Account", active: true },
                { n: 2, label: "Verify email", done: false },
                { n: 3, label: "Payment", done: false },
              ].map((step, i) => (
                <div key={step.n} className="flex items-center gap-2">
                  {i > 0 && (
                    <div
                      style={{
                        width: 24,
                        height: 1,
                        background: "rgba(255,255,255,0.1)",
                      }}
                    />
                  )}
                  <div className="flex items-center gap-1.5">
                    <div
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 10,
                        fontWeight: 700,
                        background: step.active
                          ? "linear-gradient(135deg,#6366f1,#a855f7)"
                          : "rgba(255,255,255,0.05)",
                        color: step.active ? "#fff" : "rgba(255,255,255,0.3)",
                      }}
                    >
                      {step.n}
                    </div>
                    <span
                      className="text-xs"
                      style={{
                        color: step.active ? "#fff" : "rgba(255,255,255,0.25)",
                      }}
                    >
                      {step.label}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mb-8">
              <h1
                className="font-bold tracking-tight mb-1"
                style={{ fontSize: "1.8rem" }}
              >
                Create your account
              </h1>
              <p className="text-sm" style={{ color: "var(--text2)" }}>
                Get your professional website in 100 seconds.
              </p>
            </div>

            <form onSubmit={handleSignup} className="space-y-4">
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
                <label
                  className="block text-xs font-medium mb-1.5"
                  style={{ color: "var(--text2)" }}
                >
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  className="inp"
                  minLength={8}
                  required
                />
              </div>

              <div>
                <label
                  className="block text-xs font-medium mb-1.5"
                  style={{ color: "var(--text2)" }}
                >
                  Confirm password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your password"
                  className="inp"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full rounded-xl py-3.5 text-sm mt-2"
              >
                {loading ? "Creating account…" : "Create account"}
              </button>
            </form>

            <p
              className="text-xs text-center mt-3"
              style={{ color: "var(--text3)" }}
            >
              You&apos;ll complete payment after verifying your email.
            </p>

            <p
              className="text-sm text-center mt-6"
              style={{ color: "var(--text2)" }}
            >
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-medium"
                style={{ color: "var(--accent)" }}
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
