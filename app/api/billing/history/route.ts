import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getSitesByUserId, getPaidEditsByUserId } from "@/lib/db";

const SITE_PRICE: Record<string, number> = {
  website: 49.99,
  website_5: 59.99,
};
const EDIT_PRICE = 10;

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const [sites, edits] = await Promise.all([
    getSitesByUserId(session.userId),
    getPaidEditsByUserId(session.userId),
  ]);

  const siteInvoices = sites.map((s) => ({
    id: `SITE-${s.id.slice(0, 8)}`,
    date: s.created_at,
    desc: `${s.name} — new site`,
    amount: SITE_PRICE[s.pricing_tier] ?? SITE_PRICE.website,
    type: "site" as const,
  }));

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
