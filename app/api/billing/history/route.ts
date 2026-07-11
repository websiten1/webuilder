import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getSitesByUserId, getPaidEditsByUserId, getOrdersByUserId } from "@/lib/db";

// Fallback only for sites with no matching order row (created before the
// orders table existed) — everything else uses the real amount Stripe
// charged.
const FALLBACK_SITE_PRICE = 59.99;
const EDIT_PRICE = 10;

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const [sites, edits, orders] = await Promise.all([
    getSitesByUserId(session.userId),
    getPaidEditsByUserId(session.userId),
    getOrdersByUserId(session.userId),
  ]);

  const ordersBySiteId = new Map(orders.filter((o) => o.site_id).map((o) => [o.site_id, o]));

  const siteInvoices = sites.map((s) => {
    const order = ordersBySiteId.get(s.id);
    const amount = order?.amount_total != null ? order.amount_total / 100 : FALLBACK_SITE_PRICE;
    return {
      id: `SITE-${s.id.slice(0, 8)}`,
      date: s.created_at,
      desc: `${s.name} — new site`,
      amount,
      type: "site" as const,
    };
  });

  const editInvoices = edits.map((e) => ({
    id: `EDIT-${e.id.slice(0, 8)}`,
    date: e.created_at,
    desc: `${e.site_name} — paid edit`,
    amount: EDIT_PRICE,
    type: "edit" as const,
  }));

  const invoices = [...siteInvoices, ...editInvoices].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const lifetimeSpend = invoices.reduce((sum, inv) => sum + inv.amount, 0);

  return NextResponse.json({ invoices, lifetimeSpend });
}
