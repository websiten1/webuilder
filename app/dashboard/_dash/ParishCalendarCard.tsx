"use client";
import { useState } from "react";
import { Icons } from "./icons";
import { Pill, Row } from "./primitives";

export function ParishCalendarCard({
  siteId,
  siteName,
  blobConnected,
}: {
  siteId: string;
  siteName: string;
  blobConnected: boolean;
}) {
  const [checking, setChecking] = useState(false);
  const [resending, setResending] = useState(false);
  const [connected, setConnected] = useState(blobConnected);
  const [message, setMessage] = useState<string | null>(null);

  const checkNow = async () => {
    setChecking(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/parish-calendar/${siteId}/verify`, { method: "POST" });
      const data = await res.json();
      setConnected(!!data.connected);
      setMessage(
        data.connected
          ? "Connected — admin login now works."
          : "Not connected yet. Finish the Storage step in Vercel, then check again."
      );
    } catch {
      setMessage("Could not check right now. Try again in a moment.");
    } finally {
      setChecking(false);
    }
  };

  const resend = async () => {
    setResending(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/parish-calendar/${siteId}/resend-credentials`, { method: "POST" });
      setMessage(res.ok ? "New credentials sent to the admin email on file." : "Could not resend credentials. Try again in a moment.");
    } catch {
      setMessage("Could not resend credentials. Try again in a moment.");
    } finally {
      setResending(false);
    }
  };

  return (
    <Row
      icon={<Icons.clock size={16} />}
      title={
        <>
          {siteName} — Editable weekly calendar{" "}
          {connected ? <Pill kind="ok" dot>Connected</Pill> : <Pill kind="warn" dot>Manual setup needed</Pill>}
        </>
      }
      desc={
        <>
          {connected
            ? "Storage is connected — the admin can log in and update the schedule without a redeploy."
            : "Connect a Blob store to this site's Vercel project to activate admin login. Setup steps were emailed when the site was created."}
          {message && <div style={{ marginTop: 6, color: "var(--text-3)" }}>{message}</div>}
        </>
      }
    >
      <div style={{ display: "flex", gap: 8 }}>
        <button className="b b-ghost b-sm" onClick={checkNow} disabled={checking}>
          {checking ? "Checking…" : "Check now"}
        </button>
        <button className="b b-primary b-sm" onClick={resend} disabled={resending}>
          {resending ? "Sending…" : "Resend credentials"}
        </button>
      </div>
    </Row>
  );
}
