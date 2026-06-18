"use client";
import React from "react";
import { Icons } from "./icons";
import { Section, Row, Field, PasswordInput, Pill, Toggle } from "./primitives";

function describeDevice(): string {
  if (typeof navigator === "undefined") return "This device";
  const ua = navigator.userAgent;
  const os = /Mac/.test(ua) ? "macOS" : /Windows/.test(ua) ? "Windows" : /iPhone|iPad/.test(ua) ? "iOS" : /Android/.test(ua) ? "Android" : "Unknown OS";
  const browser = /Edg\//.test(ua) ? "Edge" : /Chrome\//.test(ua) ? "Chrome" : /Safari\//.test(ua) ? "Safari" : /Firefox\//.test(ua) ? "Firefox" : "Browser";
  return `${os} · ${browser}`;
}

export function SecurityPage({ toast }: { toast: (m: string) => void }) {
  const [current, setCurrent] = React.useState("");
  const [next, setNext] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  const updatePassword = async () => {
    if (!current || !next) return toast("Fill in both password fields");
    if (next !== confirm) return toast("New passwords don't match");
    setSaving(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: current, newPassword: next }),
      });
      const data = await res.json();
      if (!res.ok) return toast(data.error || "Failed to update password");
      setCurrent("");
      setNext("");
      setConfirm("");
      toast("Password updated");
    } catch {
      toast("Failed to update password");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page narrow view-enter">
      <div className="page-head">
        <div className="kicker">// Account</div>
        <h1 className="page-title">Security</h1>
        <p className="page-sub">Manage your password, two-factor authentication, and the devices signed in to your account.</p>
      </div>

      <Section kicker="01" title="Password">
        <div className="card">
          <div className="card-pad">
            <Field label="Current password">
              <PasswordInput value={current} onChange={setCurrent} placeholder="••••••••••" />
            </Field>
            <div className="f2">
              <Field label="New password" hint="At least 10 characters.">
                <PasswordInput value={next} onChange={setNext} placeholder="New password" />
              </Field>
              <Field label="Confirm new password">
                <PasswordInput value={confirm} onChange={setConfirm} placeholder="Repeat password" />
              </Field>
            </div>
          </div>
          <div className="row" style={{ justifyContent: "flex-end" }}>
            <button className="b b-primary" disabled={saving} onClick={updatePassword}>
              {saving ? "Updating…" : "Update password"}
            </button>
          </div>
        </div>
      </Section>

      <Section kicker="02" title="Two-factor authentication">
        <div className="card">
          <Row
            icon={<Icons.lock size={19} />}
            title={
              <span style={{ display: "flex", alignItems: "center", gap: 9 }}>
                Authenticator app <Pill kind="mute">Coming soon</Pill>
              </span>
            }
            desc="Add a one-time code from an authenticator app when you sign in on a new device."
          >
            <Toggle on={false} onChange={() => toast("Two-factor authentication is coming soon")} disabled />
          </Row>
        </div>
      </Section>

      <Section kicker="03" title="Active sessions">
        <div className="list">
          <div className="lrow">
            <div className="itile ok">
              <Icons.device size={19} />
            </div>
            <div className="lcell grow">
              <div className="lc-h" style={{ display: "flex", alignItems: "center", gap: 9 }}>
                This device{" "}
                <Pill kind="ok" dot>
                  Active now
                </Pill>
              </div>
              <div className="lc-s">{describeDevice()}</div>
            </div>
          </div>
        </div>
        <p style={{ fontSize: 12.5, color: "var(--text-3)", marginTop: 10 }}>
          insixlive doesn&apos;t track sign-ins from other devices yet — your session is a single secure cookie that expires after 15 minutes of inactivity.
        </p>
      </Section>
    </div>
  );
}
