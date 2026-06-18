"use client";
import React from "react";
import { Icons } from "./icons";
import { Pill, Callout } from "./primitives";
import type { DashSite } from "./types";

function StatusPill({ state }: { state: "checking" | "ok" | "pending" }) {
  if (state === "checking") return <Pill kind="mute">Checking…</Pill>;
  if (state === "ok")
    return (
      <Pill kind="ok" dot>
        Active
      </Pill>
    );
  return (
    <Pill kind="warn" dot>
      Pending
    </Pill>
  );
}

export function DomainsPage({ sites, toast }: { sites: DashSite[]; toast: (m: string) => void }) {
  const domained = sites.filter((s) => s.domain);
  const [status, setStatus] = React.useState<Record<string, "checking" | "ok" | "pending">>({});

  React.useEffect(() => {
    domained.forEach((s) => {
      if (!s.domain) return;
      setStatus((p) => ({ ...p, [s.domain as string]: "checking" }));
      fetch(`/api/domains/check-status?domain=${encodeURIComponent(s.domain)}`)
        .then((r) => r.json())
        .then((d) => setStatus((p) => ({ ...p, [s.domain as string]: d.configured ? "ok" : "pending" })))
        .catch(() => setStatus((p) => ({ ...p, [s.domain as string]: "pending" })));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sites.length]);

  return (
    <div className="page view-enter">
      <div className="page-head flex">
        <div>
          <div className="kicker">// Workspace</div>
          <h1 className="page-title">Domains</h1>
          <p className="page-sub">Every custom domain across your sites, in one place — with live DNS status.</p>
        </div>
        <button className="b b-primary" onClick={() => toast("Open a site's domain page to buy or connect a domain")}>
          <Icons.search size={15} />
          Buy a domain
        </button>
      </div>

      {domained.length === 0 ? (
        <div className="empty">
          <div className="em-ic">
            <Icons.globe size={26} />
          </div>
          <div className="em-h">No custom domains yet</div>
          <div className="em-d">Connect a custom domain from any site&apos;s page, or launch on a free .vercel.app address for now.</div>
        </div>
      ) : (
        <div className="list">
          <div className="lrow head">
            <div className="lcell grow">Domain</div>
            <div className="lcell" style={{ flex: "0 0 120px" }}>
              DNS
            </div>
            <div className="lcell" style={{ flex: "0 0 110px" }}>
              SSL
            </div>
            <div className="lcell" style={{ flex: "0 0 40px" }}></div>
          </div>
          {domained.map((s) => {
            const st = (s.domain && status[s.domain]) || "checking";
            return (
              <div className="lrow" key={s.id}>
                <div className="lcell grow">
                  <div className="lc-h" style={{ display: "flex", alignItems: "center", gap: 9 }}>
                    <Icons.globe size={16} style={{ color: "var(--text-3)" }} />
                    {s.domain}
                    <a className="b-link" style={{ fontSize: 12 }} href={`https://${s.domain}`} target="_blank" rel="noopener noreferrer">
                      <Icons.arrowUpRight size={13} />
                    </a>
                  </div>
                  <div className="lc-s">{s.name}</div>
                </div>
                <div className="lcell" style={{ flex: "0 0 120px" }}>
                  <StatusPill state={st} />
                </div>
                <div className="lcell" style={{ flex: "0 0 110px" }}>
                  <StatusPill state={st} />
                </div>
                <div className="lcell" style={{ flex: "0 0 40px" }}>
                  <button className="site-menu" onClick={() => toast(`Open ${s.name}'s domain settings to manage ${s.domain}`)}>
                    <Icons.dots size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div style={{ marginTop: 14 }}>
        <Callout kind="info" icon={<Icons.question />} title="Don't have a domain yet?">
          You can launch on a free <span className="mono" style={{ color: "var(--text-2)" }}>.vercel.app</span> address and connect a custom domain whenever you&apos;re ready — from each site&apos;s domain page.
        </Callout>
      </div>
    </div>
  );
}
