"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

type State = "loading" | "success" | "error";

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get("session_id");
  const [state, setState] = useState<State>("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!sessionId) {
      setState("error");
      setErrorMsg("No session ID found. Please contact support.");
      return;
    }

    async function verify() {
      try {
        const res = await fetch("/api/checkout/verify-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        });
        const data = await res.json();
        if (res.ok) {
          setState("success");
          setTimeout(() => router.push("/dashboard"), 3000);
        } else {
          setState("error");
          setErrorMsg(data.error || "Could not verify payment.");
        }
      } catch {
        setState("error");
        setErrorMsg("Network error. Please try again or contact support.");
      }
    }

    verify();
  }, [sessionId, router]);

  return (
    <div
      style={{ background: "#050510", minHeight: "100vh", color: "#fff" }}
      className="flex flex-col"
    >
      <div
        style={{
          position: "fixed",
          top: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: 600,
          height: 400,
          background:
            "radial-gradient(ellipse, rgba(16,185,129,0.14) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <nav
        className="relative px-6 h-16 flex items-center"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", zIndex: 10 }}
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
                  border: "3px solid rgba(16,185,129,0.2)",
                  borderTopColor: "#10b981",
                  borderRadius: "50%",
                  animation: "spin 0.8s linear infinite",
                  margin: "0 auto 24px",
                }}
              />
              <h1
                className="font-bold tracking-tight mb-2"
                style={{ fontSize: "1.5rem" }}
              >
                Confirming your payment…
              </h1>
              <p style={{ color: "var(--text2)", fontSize: 14 }}>
                This only takes a moment.
              </p>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </>
          )}

          {state === "success" && (
            <>
              <div
                style={{
                  width: 64,
                  height: 64,
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
                  width="28"
                  height="28"
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
                style={{ fontSize: "1.8rem" }}
              >
                Payment successful!
              </h1>
              <p
                className="mb-6"
                style={{ color: "var(--text2)", fontSize: 15 }}
              >
                Welcome to WebBuilder. You&apos;re ready to create your website.
              </p>
              <p style={{ color: "var(--text3)", fontSize: 13 }}>
                Redirecting to your dashboard…
              </p>
              <Link
                href="/dashboard"
                className="btn-primary rounded-xl px-8 py-3 text-sm mt-6 inline-block"
              >
                Go to Dashboard
              </Link>
            </>
          )}

          {state === "error" && (
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
                    d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                  />
                </svg>
              </div>
              <h1
                className="font-bold tracking-tight mb-2"
                style={{ fontSize: "1.5rem" }}
              >
                Something went wrong
              </h1>
              <p
                className="mb-6"
                style={{ color: "var(--text2)", fontSize: 14 }}
              >
                {errorMsg}
              </p>
              <p className="text-sm" style={{ color: "var(--text3)" }}>
                If your card was charged, contact us at{" "}
                <a
                  href="mailto:support@webbuilder.app"
                  style={{ color: "var(--accent)" }}
                >
                  support@webbuilder.app
                </a>
              </p>
              <Link
                href="/checkout"
                className="btn-ghost rounded-xl px-8 py-3 text-sm mt-6 inline-block"
              >
                Try again
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense>
      <CheckoutSuccessContent />
    </Suspense>
  );
}
