"use client";
import React from "react";
import { Icons } from "./icons";
import { Section, Row, Toggle } from "./primitives";

export function NotificationsPage({ toast, onDelete }: { toast: (m: string) => void; onDelete: () => void }) {
  const [pref, setPref] = React.useState({ started: true, completed: true, failed: true, product: false, tips: true });
  const set = (k: keyof typeof pref, v: boolean) => {
    setPref((p) => ({ ...p, [k]: v }));
    toast("Saved for this session — preferences aren't persisted yet");
  };
  return (
    <div className="page narrow view-enter">
      <div className="page-head">
        <div className="kicker">// Account</div>
        <h1 className="page-title">Notifications</h1>
        <p className="page-sub">Choose which emails insixlive sends you. Transactional updates keep you posted on your builds.</p>
      </div>

      <Section kicker="01" title="Build emails" desc="Recommended">
        <div className="card">
          <Row title="Edit started" desc="When an edit begins generating.">
            <Toggle on={pref.started} onChange={(v) => set("started", v)} />
          </Row>
          <Row title="Edit completed" desc="When your site is rebuilt and redeployed.">
            <Toggle on={pref.completed} onChange={(v) => set("completed", v)} />
          </Row>
          <Row title="Build failed" desc="If something goes wrong so you can retry.">
            <Toggle on={pref.failed} onChange={(v) => set("failed", v)} />
          </Row>
        </div>
      </Section>

      <Section kicker="02" title="From insixlive">
        <div className="card">
          <Row title="Product updates" desc="New templates, features, and improvements.">
            <Toggle on={pref.product} onChange={(v) => set("product", v)} />
          </Row>
          <Row title="Tips & guides" desc="Occasional advice on getting the most from your site.">
            <Toggle on={pref.tips} onChange={(v) => set("tips", v)} />
          </Row>
        </div>
      </Section>

      <Section kicker="03" title="Danger zone">
        <div className="danger-zone">
          <div className="dz-row">
            <div className="itile" style={{ color: "var(--danger)", borderColor: "var(--danger-line)", background: "var(--danger-soft)" }}>
              <Icons.trash size={19} />
            </div>
            <div className="row-main">
              <div className="row-h">Delete account</div>
              <div className="row-d">
                Permanently delete your account. Your code already lives in your own repos and Vercel — but billing history and edit credits are erased.
              </div>
            </div>
            <button className="b b-danger b-sm" onClick={onDelete}>
              Delete account
            </button>
          </div>
        </div>
      </Section>
    </div>
  );
}
