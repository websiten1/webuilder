"use client";
import React from "react";
import { Icons } from "./icons";
import { Section, Pill } from "./primitives";
import type { Invoice } from "./types";

export function BillingPage({
  editsLeft,
  openBuy,
  invoices,
  lifetimeSpend,
  loading,
  hasStripeCustomer,
  toast,
}: {
  editsLeft: number;
  openBuy: (site: null) => void;
  invoices: Invoice[];
  lifetimeSpend: number;
  loading: boolean;
  hasStripeCustomer: boolean;
  toast: (m: string) => void;
}) {
  const openPortal = async () => {
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      const data = await res.json();
      if (!res.ok) return toast(data.error || "Couldn't open the billing portal");
      window.location.href = data.url;
    } catch {
      toast("Couldn't open the billing portal");
    }
  };

  return (
    <div className="page view-enter">
      <div className="page-head">
        <div className="kicker">// Account</div>
        <h1 className="page-title">Billing</h1>
        <p className="page-sub">insixlive is one-time per site — no subscription. Manage your payment methods and download receipts here.</p>
      </div>

      <div className="stats" style={{ gridTemplateColumns: "repeat(3,1fr)" }}>
        <div className="stat">
          <div className="s-k">
            <Icons.bolt size={13} />
            Edit credits
          </div>
          <div className="s-v">{editsLeft}</div>
          <div className="s-d">€10.00 per edit · pay as you go</div>
        </div>
        <div className="stat">
          <div className="s-k">
            <Icons.receipt size={13} />
            Lifetime spend
          </div>
          <div className="s-v">€{lifetimeSpend.toFixed(2)}</div>
          <div className="s-d">
            <b>{invoices.length}</b> payment{invoices.length === 1 ? "" : "s"} · all one-time
          </div>
        </div>
        <div className="stat">
          <div className="s-k">
            <Icons.card size={13} />
            Payment method
          </div>
          <div className="s-v" style={{ fontSize: 16, marginTop: 14 }}>
            {hasStripeCustomer ? "Managed via Stripe" : "No card on file"}
          </div>
          <div className="s-d">{hasStripeCustomer ? "View or update in the customer portal" : "Added at checkout"}</div>
        </div>
      </div>

      <Section kicker="01" title="Edit credits">
        <div className="card">
          <div className="conn">
            <div className="c-logo" style={{ color: "var(--accent)" }}>
              <Icons.bolt size={26} />
            </div>
            <div className="c-body">
              <div className="c-h">{editsLeft} edits available</div>
              <div className="c-d">
                Each edit regenerates and redeploys a site. Every edit is paid — buy credits and use them on any site, any time. They never expire.
              </div>
            </div>
            <button className="b b-primary" onClick={() => openBuy(null)}>
              <Icons.plus size={15} />
              Buy edits
            </button>
          </div>
        </div>
      </Section>

      <Section kicker="02" title="Payment & receipts">
        <div className="card">
          <div className="conn">
            <div className="c-logo" style={{ color: "#635bff" }}>
              <Icons.stripe size={26} />
            </div>
            <div className="c-body">
              <div className="c-h">Stripe customer portal</div>
              <div className="c-d">Update your card, change billing details, and view every receipt — securely hosted by Stripe.</div>
            </div>
            <button className="b b-ghost" onClick={openPortal} disabled={!hasStripeCustomer}>
              <Icons.ext size={15} />
              Open portal
            </button>
          </div>
        </div>
      </Section>

      <Section kicker="03" title="Payment history">
        {loading ? (
          <div className="card card-pad" style={{ color: "var(--text-3)", fontSize: 13.5 }}>
            Loading…
          </div>
        ) : invoices.length === 0 ? (
          <div className="card card-pad" style={{ color: "var(--text-3)", fontSize: 13.5 }}>
            No payments yet.
          </div>
        ) : (
          <div className="list">
            <div className="lrow head">
              <div className="lcell" style={{ flex: "0 0 92px" }}>
                Invoice
              </div>
              <div className="lcell grow">Description</div>
              <div className="lcell" style={{ flex: "0 0 120px" }}>
                Date
              </div>
              <div className="lcell num" style={{ flex: "0 0 80px" }}>
                Amount
              </div>
            </div>
            {invoices.map((inv) => (
              <div className="lrow" key={inv.id}>
                <div className="lcell" style={{ flex: "0 0 92px", fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-3)" }}>
                  {inv.id}
                </div>
                <div className="lcell grow">
                  <div className="lc-h" style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 13.5 }}>
                    {inv.desc}
                    <Pill kind={inv.type === "site" ? "accent" : "mute"}>{inv.type === "site" ? "Site" : "Edit"}</Pill>
                  </div>
                </div>
                <div className="lcell" style={{ flex: "0 0 120px", color: "var(--text-3)" }}>
                  {new Date(inv.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                </div>
                <div className="lcell num" style={{ flex: "0 0 80px", color: "var(--text)", fontWeight: 650 }}>
                  €{inv.amount.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}
