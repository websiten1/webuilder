"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { Icons } from "./icons";
import { Callout } from "./primitives";
import type { DashSite } from "./types";

export function BuyEditsModal({ site, sites, onClose }: { site: DashSite | null; sites: DashSite[]; onClose: () => void }) {
  const router = useRouter();
  const go = (id: string) => {
    onClose();
    router.push(`/edit/${id}`);
  };
  return (
    <div className="modal-scrim" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal">
        <div className="modal-head">
          <div className="mt">
            <span className="itile accent" style={{ width: 34, height: 34 }}>
              <Icons.bolt size={18} />
            </span>
            Buy an edit
          </div>
          <div className="msb">
            {site ? (
              <span>
                Describe the change you want on <b style={{ color: "var(--text)" }}>{site.name}</b> and pay €10.00 — it&apos;s applied right away.
              </span>
            ) : (
              "Pick a site below. Each edit is €10.00, described up front and applied immediately — there's no separate credit wallet to pre-buy."
            )}
          </div>
        </div>
        <div className="modal-body">
          {site ? (
            <Callout kind="info" icon={<Icons.card />} title="Secure one-time payment">
              You&apos;ll describe the change on the next page, then pay via Stripe before it&apos;s generated and redeployed.
            </Callout>
          ) : (
            <div className="list">
              {sites.map((s) => (
                <button
                  key={s.id}
                  className="lrow"
                  style={{ width: "100%", border: 0, background: "transparent", cursor: "pointer", textAlign: "left" }}
                  onClick={() => go(s.id)}
                >
                  <div className="site-fav" style={{ width: 32, height: 32, fontSize: 12, background: s.color }}>{s.fav}</div>
                  <div className="lcell grow">
                    <div className="lc-h">{s.name}</div>
                    <div className="lc-s">{s.edits} free edit{s.edits === 1 ? "" : "s"} remaining</div>
                  </div>
                  <Icons.chevRight size={16} />
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="modal-foot">
          <div className="mf-total">{site ? <>Edit price <b>€10.00</b></> : <span style={{ color: "var(--text-3)" }}>Choose a site to continue</span>}</div>
          <div style={{ display: "flex", gap: 9 }}>
            <button className="b b-quiet" onClick={onClose}>Cancel</button>
            {site && <button className="b b-primary" onClick={() => go(site.id)}>Continue</button>}
          </div>
        </div>
      </div>
    </div>
  );
}
