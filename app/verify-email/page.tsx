"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

type State = "loading" | "success" | "error" | "no-token";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const [state, setState] = useState<State>(token ? "loading" : "no-token");
  const [errorMsg, setErrorMsg] = useState("");
  const [resendEmail, setResendEmail] = useState("");
  const [resendSent, setResendSent] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  useEffect(() => {
    if (!token) return;

    async function verify() {
      try {
        const res = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        const data = await res.json();
        if (res.ok) {
          setState("success");
          setTimeout(() => router.push("/checkout"), 2500);
        } else {
          setState("error");
          setErrorMsg(data.error || "Verification failed.");
        }
      } catch {
        setState("error");
        setErrorMsg("Network error. Please try again.");
      }
    }

    verify();
  }, [token, router]);

  async function handleResend(e: React.FormEvent) {
    e.preventDefault();
    setResendLoading(true);
    try {
      await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resendEmail }),
      });
      setResendSent(true);
    } finally {
      setResendLoading(false);
    }
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
        <div className="w-full text-center" style={{ maxWidth: 420 }}>
          {state === "loading" && (
            <>
              <div
                style={{
                  width: 48,
                  height: 48,
                  border: "3px solid rgba(99,102,241,0.2)",
                  borderTopColor: "#6366f1",
                  borderRadius: "50%",
                  animation: "spin 0.8s linear infinite",
                  margin: "0 auto 24px",
                }}
              />
              <h1
                className="font-bold tracking-tight mb-2"
                style={{ fontSize: "1.5rem" }}
              >
                Verifying your email…
              </h1>
              <p style={{ color: "var(--text2)", fontSize: 14 }}>
                Please wait a moment.
              </p>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </>
          )}

          {state === "success" && (
            <>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  background: "rgba(16,185,129,0.12)",
                  border: "1px solid rgba(16,185,129,0.3)",
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
                  stroke="#10b981"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h1
                className="font-bold tracking-tight mb-2"
                style={{ fontSize: "1.5rem" }}
              >
                Email verified!
              </h1>
              <p style={{ color: "var(--text2)", fontSize: 14 }}>
                Redirecting you to complete your payment…
              </p>
            </>
          )}

          {(state === "error" || state === "no-token") && (
            <>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  background: "rgba(239,68,68,0.1)",
                  border: "1px solid rgba(239,68,68,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 24px",
                }}
              >
                <svg
                  width="22"
                  height="22"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="#f87171"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h1
                className="font-bold tracking-tight mb-2"
                style={{ fontSize: "1.5rem" }}
              >
                {state === "no-token"
                  ? "Check your inbox"
                  : "Link expired or invalid"}
              </h1>
              <p
                className="mb-8"
                style={{ color: "var(--text2)", fontSize: 14 }}
              >
                {state === "no-token"
                  ? "A verification link was sent to your email. Click it to verify your account."
                  : errorMsg}
              </p>

              {!resendSent ? (
                <form onSubmit={handleResend} className="space-y-3">
                  <p
                    className="text-sm font-medium mb-3"
                    style={{ color: "var(--text2)" }}
                  >
                    Need a new link? Enter your email:
                  </p>
                  <input
                    type="email"
                    value={resendEmail}
                    onChange={(e) => setResendEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="inp"
                    required
                  />
                  <button
                    type="submit"
                    disabled={resendLoading}
                    className="btn-primary w-full rounded-xl py-3 text-sm"
                  >
                    {resendLoading ? "Sending…" : "Resend verification email"}
                  </button>
                </form>
              ) : (
                <div
                  className="text-sm px-4 py-3 rounded-xl"
                  style={{
                    background: "rgba(16,185,129,0.08)",
                    border: "1px solid rgba(16,185,129,0.2)",
                    color: "#6ee7b7",
                  }}
                >
                  Verification email sent. Check your inbox.
                </div>
              )}

              <p className="text-sm mt-6" style={{ color: "var(--text2)" }}>
                <Link href="/login" style={{ color: "var(--accent)" }}>
                  Back to login
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailContent />
    </Suspense>
  );
}
