"use client";
import React from "react";
import { Icons } from "./icons";
import { Section, Row, Pill, Callout } from "./primitives";
import type { VercelConnection } from "./types";

export function ConnectedPage({
  vercel,
  loading,
  onDisconnect,
  toast,
}: {
  vercel: VercelConnection | null;
  loading: boolean;
  onDisconnect: () => void;
  toast: (m: string) => void;
}) {
  const connected = !!vercel?.connected;
  const since = vercel?.since ? new Date(vercel.since).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : null;

  return (
    <div className="page narrow view-enter">
      <div className="page-head">
        <div className="kicker">// Account</div>
        <h1 className="page-title">Connected accounts</h1>
        <p className="page-sub">insixlive deploys each site straight to your own hosting. Connect the accounts it needs to publish on your behalf.</p>
      </div>

      <div className="card">
        <div className="conn">
          <div className="c-logo" style={{ color: "#000" }}>
            <Icons.vercel size={26} />
          </div>
          <div className="c-body">
            <div className="c-h">
              Vercel{" "}
              {loading ? (
                <Pill kind="mute">Checking…</Pill>
              ) : connected ? (
                <Pill kind="ok" dot>
                  Connected
                </Pill>
              ) : (
                <Pill kind="mute">Not connected</Pill>
              )}
            </div>
            {connected ? (
              <div className="c-d">
                Linked to <b>{vercel?.account ?? "your Vercel account"}</b>
                {vercel?.email ? ` · ${vercel.email}` : ""}
              </div>
            ) : (
              <div className="c-d">New sites will fall back to insixlive&apos;s shared hosting.</div>
            )}
          </div>
          {connected ? (
            <button className="b b-quiet" onClick={onDisconnect}>
              Disconnect
            </button>
          ) : (
            <a className="b b-primary" href="/api/auth/vercel/authorize">
              <Icons.link size={15} />
              Connect
            </a>
          )}
        </div>
        {connected && (
          <>
            <div className="lrow head">
              <div className="lcell grow">Connection</div>
              <div className="lcell">Team</div>
              <div className="lcell">Since</div>
            </div>
            <div className="lrow">
              <div className="lcell grow">
                <div className="lc-h">{vercel?.account ?? "—"}</div>
                {vercel?.email && <div className="lc-s">{vercel.email}</div>}
              </div>
              <div className="lcell" style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>
                {vercel?.teamId ?? "Personal"}
              </div>
              <div className="lcell" style={{ whiteSpace: "nowrap" }}>
                {since ?? "—"}
              </div>
            </div>
            <div className="row" style={{ justifyContent: "flex-end" }}>
              <a className="b b-ghost b-sm" href="/api/auth/vercel/authorize">
                <Icons.refresh size={15} />
                Reconnect
              </a>
            </div>
          </>
        )}
      </div>

      {!connected && !loading && (
        <div style={{ marginTop: 14 }}>
          <Callout kind="warn" icon={<Icons.alert />} title="Sites will use shared hosting">
            Without your own Vercel connection, new sites deploy to insixlive&apos;s shared account and you won&apos;t have direct dashboard access. Connect any time.
          </Callout>
        </div>
      )}

      <Section kicker="02" title="Available integrations">
        <div className="card">
          <Row icon={<Icons.stripe size={19} />} title="Stripe" desc="Already handling your one-time payments and invoices.">
            <Pill kind="ok" dot>
              Active
            </Pill>
          </Row>
          <Row icon={<Icons.mail size={19} />} title="Custom SMTP" desc="Send transactional email from your own domain.">
            <button className="b b-quiet b-sm" onClick={() => toast("Coming soon")}>
              Soon
            </button>
          </Row>
          <Row icon={<Icons.globe size={19} />} title="Cloudflare" desc="Bring your own DNS and CDN for connected domains.">
            <button className="b b-quiet b-sm" onClick={() => toast("Coming soon")}>
              Soon
            </button>
          </Row>
        </div>
      </Section>
    </div>
  );
}
