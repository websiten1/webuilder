"use client";

import { useState, useEffect } from "react";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("cookies_accepted")) setVisible(true);
  }, []);

  const accept = () => {
    localStorage.setItem("cookies_accepted", "1");
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem("cookies_accepted", "0");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div style={{
      position: "fixed", bottom: 20, left: "50%", transform: "translateX(-50%)",
      zIndex: 9999, width: "calc(100% - 32px)", maxWidth: 560,
      background: "#0A0E14",
      borderRadius: 14,
      padding: "14px 18px",
      display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap",
      boxShadow: "0 8px 32px rgba(0,0,0,0.28), 0 0 0 1px rgba(255,255,255,0.06)",
    }}>
      {/* Cookie icon */}
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, opacity: 0.7 }}>
        <circle cx="12" cy="12" r="10" stroke="#FF5A1F" strokeWidth="1.5"/>
        <circle cx="9" cy="9" r="1.5" fill="#FF5A1F"/>
        <circle cx="14" cy="8" r="1" fill="rgba(255,255,255,0.5)"/>
        <circle cx="15" cy="13" r="1.5" fill="#FF5A1F"/>
        <circle cx="9" cy="14.5" r="1" fill="rgba(255,255,255,0.5)"/>
        <circle cx="12" cy="11" r="1" fill="rgba(255,255,255,0.4)"/>
      </svg>

      <p style={{
        flex: 1, minWidth: 0,
        fontFamily: '-apple-system, BlinkMacSystemFont, system-ui, sans-serif',
        fontSize: 13, lineHeight: 1.5,
        color: "rgba(255,255,255,0.65)",
        margin: 0,
      }}>
        We use cookies to improve your experience.{" "}
        <a href="/privacy" style={{ color: "rgba(255,255,255,0.4)", textDecoration: "underline", fontSize: 12 }}>
          Learn more
        </a>
      </p>

      <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
        <button onClick={decline} style={{
          background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)",
          color: "rgba(255,255,255,0.5)", borderRadius: 8,
          padding: "7px 14px", fontSize: 12, fontWeight: 500, cursor: "pointer",
          fontFamily: '-apple-system, system-ui, sans-serif',
        }}>
          Decline
        </button>
        <button onClick={accept} style={{
          background: "#FF5A1F", border: "none",
          color: "#fff", borderRadius: 8,
          padding: "7px 16px", fontSize: 12, fontWeight: 600, cursor: "pointer",
          fontFamily: '-apple-system, system-ui, sans-serif',
          boxShadow: "0 2px 8px rgba(255,90,31,0.35)",
        }}>
          Accept
        </button>
      </div>
    </div>
  );
}
