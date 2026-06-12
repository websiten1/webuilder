"use client";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

const INACTIVE_MS = 15 * 60 * 1000; // 15 minutes
const REFRESH_THROTTLE_MS = 60 * 1000; // refresh at most once per minute

const PUBLIC_PATHS = ["/", "/login", "/signup", "/pricing", "/how-it-works", "/faq", "/privacy", "/terms", "/verify"];

export default function InactivityWatcher() {
  const pathname = usePathname();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastRefreshRef = useRef(0);

  const isProtected = !PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith(p + "/") && p !== "/");

  useEffect(() => {
    if (!isProtected) return;

    const refresh = async () => {
      const now = Date.now();
      if (now - lastRefreshRef.current < REFRESH_THROTTLE_MS) return;
      lastRefreshRef.current = now;
      try { await fetch("/api/auth/refresh", { method: "POST" }); } catch { /* network error, ignore */ }
    };

    const resetTimer = () => {
      refresh();
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        window.location.href = "/login?reason=inactivity";
      }, INACTIVE_MS);
    };

    const events = ["mousemove", "mousedown", "keydown", "touchstart", "scroll"];
    events.forEach(e => window.addEventListener(e, resetTimer, { passive: true }));
    resetTimer();

    return () => {
      events.forEach(e => window.removeEventListener(e, resetTimer));
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isProtected, pathname]);

  return null;
}
