"use client";
import React from "react";
import { Icons } from "./icons";
import { Section, Pill } from "./primitives";
import type { Invoice } from "./types";
import { tt, type Lang } from "./i18n";

export function BillingPage({
  editsLeft,
  openBuy,
  invoices,
  lifetimeSpend,
  loading,
  hasStripeCustomer,
  toast,
  lang,
}: {
  editsLeft: number;
  openBuy: (site: null) => void;
  invoices: Invoice[];
  lifetimeSpend: number;
  loading: boolean;
  hasStripeCustomer: boolean;
  toast: (m: string) => void;
  lang: Lang;
}) {
  const openPortal = async () => {
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      const data = await res.json();
      if (!res.ok) return toast(data.error || tt(lang, "Couldn't open the billing portal", "Nu am putut deschide portalul de facturare"));
      window.location.href = data.url;
    } catch {
      toast(tt(lang, "Couldn't open the billing portal", "Nu am putut deschide portalul de facturare"));
    }
  };

  return (
    <div className="page view-enter">
      <div className="page-head">
        <div className="kicker">// {tt(lang, "Account", "Cont")}</div>
        <h1 className="page-title">{tt(lang, "Billing", "Facturare")}</h1>
        <p className="page-sub">{tt(lang, "insixlive is one-time per site — no subscription. Manage your payment methods and download receipts here.", "insixlive este plată unică per site — fără abonament. Gestionează metodele de plată și descarcă chitanțele aici.")}</p>
      </div>

      <div className="stats" style={{ gridTemplateColumns: "repeat(3,1fr)" }}>
        <div className="stat">
          <div className="s-k">
            <Icons.bolt size={13} />
            {tt(lang, "Edit credits", "Credite modificări")}
          </div>
          <div className="s-v">{editsLeft}</div>
          <div className="s-d">{tt(lang, "€10.00 per edit · pay as you go", "10,00 € per modificare · plătești pe măsură ce folosești")}</div>
        </div>
        <div className="stat">
          <div className="s-k">
            <Icons.receipt size={13} />
            {tt(lang, "Lifetime spend", "Cheltuit total")}
          </div>
          <div className="s-v">€{lifetimeSpend.toFixed(2)}</div>
          <div className="s-d">
            <b>{invoices.length}</b> {tt(lang, `payment${invoices.length === 1 ? "" : "s"}`, invoices.length === 1 ? "plată" : "plăți")} · {tt(lang, "all one-time", "toate unice")}
          </div>
        </div>
        <div className="stat">
          <div className="s-k">
            <Icons.card size={13} />
            {tt(lang, "Payment method", "Metodă de plată")}
          </div>
          <div className="s-v" style={{ fontSize: 16, marginTop: 14 }}>
            {hasStripeCustomer ? tt(lang, "Managed via Stripe", "Gestionată prin Stripe") : tt(lang, "No card on file", "Niciun card înregistrat")}
          </div>
          <div className="s-d">{hasStripeCustomer ? tt(lang, "View or update in the customer portal", "Vizualizează sau actualizează în portalul de clienți") : tt(lang, "Added at checkout", "Adăugată la finalizarea plății")}</div>
        </div>
      </div>

      <Section kicker="01" title={tt(lang, "Edit credits", "Credite modificări")}>
        <div className="card">
          <div className="conn">
            <div className="c-logo" style={{ color: "var(--accent)" }}>
              <Icons.bolt size={26} />
            </div>
            <div className="c-body">
              <div className="c-h">{editsLeft} {tt(lang, "edits available", "modificări disponibile")}</div>
              <div className="c-d">
                {tt(lang, "Each edit regenerates and redeploys a site. Every edit is paid — buy credits and use them on any site, any time. They never expire.", "Fiecare modificare regenerează și republică un site. Fiecare modificare e plătită — cumpără credite și folosește-le pe orice site, oricând. Nu expiră niciodată.")}
              </div>
            </div>
            <button className="b b-primary" onClick={() => openBuy(null)}>
              <Icons.plus size={15} />
              {tt(lang, "Buy edits", "Cumpără modificări")}
            </button>
          </div>
        </div>
      </Section>

      <Section kicker="02" title={tt(lang, "Payment & receipts", "Plăți și chitanțe")}>
        <div className="card">
          <div className="conn">
            <div className="c-logo" style={{ color: "#635bff" }}>
              <Icons.stripe size={26} />
            </div>
            <div className="c-body">
              <div className="c-h">{tt(lang, "Stripe customer portal", "Portal de clienți Stripe")}</div>
              <div className="c-d">{tt(lang, "Update your card, change billing details, and view every receipt — securely hosted by Stripe.", "Actualizează-ți cardul, schimbă detaliile de facturare și vezi fiecare chitanță — găzduit securizat de Stripe.")}</div>
            </div>
            <button className="b b-ghost" onClick={openPortal} disabled={!hasStripeCustomer}>
              <Icons.ext size={15} />
              {tt(lang, "Open portal", "Deschide portalul")}
            </button>
          </div>
        </div>
      </Section>

      <Section kicker="03" title={tt(lang, "Payment history", "Istoric plăți")}>
        {loading ? (
          <div className="card card-pad" style={{ color: "var(--text-3)", fontSize: 13.5 }}>
            {tt(lang, "Loading…", "Se încarcă…")}
          </div>
        ) : invoices.length === 0 ? (
          <div className="card card-pad" style={{ color: "var(--text-3)", fontSize: 13.5 }}>
            {tt(lang, "No payments yet.", "Nicio plată încă.")}
          </div>
        ) : (
          <div className="list">
            <div className="lrow head">
              <div className="lcell" style={{ flex: "0 0 92px" }}>
                {tt(lang, "Invoice", "Factură")}
              </div>
              <div className="lcell grow">{tt(lang, "Description", "Descriere")}</div>
              <div className="lcell" style={{ flex: "0 0 120px" }}>
                {tt(lang, "Date", "Data")}
              </div>
              <div className="lcell num" style={{ flex: "0 0 80px" }}>
                {tt(lang, "Amount", "Sumă")}
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
                    <Pill kind={inv.type === "site" ? "accent" : "mute"}>{inv.type === "site" ? tt(lang, "Site", "Site") : tt(lang, "Edit", "Modificare")}</Pill>
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
