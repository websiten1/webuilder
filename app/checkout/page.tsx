"use client";

import { useState } from "react";
import Link from "next/link";

function Check() {
  return (
    <svg
      width="15"
      height="15"
      fill="none"
      viewBox="0 0 24 24"
      stroke="#10b981"
      strokeWidth={2.5}
      style={{ flexShrink: 0 }}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

export default function CheckoutPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCheckout = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/checkout/create-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to start checkout.");
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{ background: "#050510", minHeight: "100vh", color: "#fff" }}
      className="flex flex-col"
    >
      {/* Glow */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: 600,
          height: 500,
          background:
            "radial-gradient(ellipse, rgba(99,102,241,0.18) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <nav
        className="relative px-6 h-16 flex items-center justify-between"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", zIndex: 10 }}
      >
        <Link href="/" className="font-bold tracking-tight text-sm">
          WebBuilder
        </Link>
        <Link
          href="/login"
          className="text-xs"
          style={{ color: "var(--text3)" }}
        >
          Already have access? Log in
        </Link>
      </nav>

      <div
        className="relative flex-1 flex items-center justify-center px-6 py-16"
        style={{ zIndex: 1 }}
      >
        <div className="w-full" style={{ maxWidth: 440 }}>
          {/* Steps */}
          <div className="flex items-center gap-2 mb-10">
            {[
              { n: 1, label: "Account", done: true },
              { n: 2, label: "Verify email", done: true },
              { n: 3, label: "Payment", done: false, active: true },
            ].map((step, i) => (
              <div key={step.n} className="flex items-center gap-2">
                {i > 0 && (
                  <div
                    style={{
                      width: 24,
                      height: 1,
                      background: step.done
                        ? "rgba(99,102,241,0.5)"
                        : "rgba(255,255,255,0.1)",
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
                        : step.done
                        ? "rgba(99,102,241,0.2)"
                        : "rgba(255,255,255,0.05)",
                      color: step.active
                        ? "#fff"
                        : step.done
                        ? "#a5b4fc"
                        : "rgba(255,255,255,0.3)",
                    }}
                  >
                    {step.done && !step.active ? "✓" : step.n}
                  </div>
                  <span
                    className="text-xs"
                    style={{
                      color: step.active
                        ? "#fff"
                        : step.done
                        ? "rgba(255,255,255,0.5)"
                        : "rgba(255,255,255,0.25)",
                    }}
                  >
                    {step.label}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mb-6">
            <h1
              className="font-bold tracking-tight mb-1"
              style={{ fontSize: "1.8rem" }}
            >
              Complete your payment
            </h1>
            <p className="text-sm" style={{ color: "var(--text2)" }}>
              One-time payment. Secure checkout via Stripe.
            </p>
          </div>

          {/* Price card */}
          <div
            className="glass rounded-2xl p-6 mb-6"
            style={{ border: "1px solid rgba(99,102,241,0.25)" }}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="font-semibold">Professional Website</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--text3)" }}>
                  AI-generated · Deployed · Code on GitHub
                </p>
              </div>
              <div className="text-right">
                <span
                  className="font-bold"
                  style={{ fontSize: "1.6rem", letterSpacing: "-0.03em" }}
                >
                  €49.99
                </span>
                <p className="text-xs" style={{ color: "var(--text3)" }}>
                  one-time
                </p>
              </div>
            </div>

            <div
              style={{
                borderTop: "1px solid rgba(255,255,255,0.06)",
                paddingTop: 14,
              }}
            >
              <ul className="space-y-2">
                {[
                  "Complete custom website, deployed live",
                  "Full source code pushed to your GitHub",
                  "Fully responsive & mobile-ready",
                  "No monthly fees — yours forever",
                  "Zero lock-in, edit or hire anytime",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-2.5 text-xs"
                    style={{ color: "var(--text2)" }}
                  >
                    <Check />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {error && (
            <div
              className="text-sm px-4 py-3 rounded-xl mb-4"
              style={{
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.2)",
                color: "#fca5a5",
              }}
            >
              {error}
            </div>
          )}

          <button
            onClick={handleCheckout}
            disabled={loading}
            className="btn-primary w-full rounded-xl py-4 text-sm font-semibold"
            style={{ fontSize: 15 }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span
                  style={{
                    width: 14,
                    height: 14,
                    border: "2px solid rgba(255,255,255,0.3)",
                    borderTopColor: "#fff",
                    borderRadius: "50%",
                    animation: "spin 0.8s linear infinite",
                    display: "inline-block",
                  }}
                />
                Redirecting to Stripe…
              </span>
            ) : (
              "Pay €49.99 — Secure Checkout"
            )}
          </button>

          <p className="text-xs text-center mt-3" style={{ color: "var(--text3)" }}>
            Powered by Stripe · 128-bit SSL encryption · Cancel anytime before paying
          </p>

          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    </div>
  );
}
