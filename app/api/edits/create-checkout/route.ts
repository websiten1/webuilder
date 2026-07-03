import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getSiteById, createSiteEdit, updateSiteEditStatus, decrementFreeEdits } from "@/lib/db";
import { getStripe } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

    const { siteId, description } = await request.json();

    if (!siteId || !description?.trim()) {
      return NextResponse.json({ error: "Site ID and description are required." }, { status: 400 });
    }
    if (description.trim().length < 10) {
      return NextResponse.json({ error: "Description must be at least 10 characters." }, { status: 400 });
    }
    if (description.trim().length > 500) {
      return NextResponse.json({ error: "Description must be 500 characters or fewer." }, { status: 400 });
    }

    const site = await getSiteById(siteId, session.userId);
    if (!site) {
      return NextResponse.json({ error: "Site not found." }, { status: 404 });
    }

    // Create the edit record
    const edit = await createSiteEdit(siteId, session.userId, description.trim());

    // Check if the site has free edits remaining
    const freeEdits = site.free_edits_remaining ?? 0;
    if (freeEdits > 0) {
      // Mark as paid (free) and deduct from remaining
      await updateSiteEditStatus(edit.id, "paid", { stripeSessionId: "free" });
      await decrementFreeEdits(siteId);
      const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";
      return NextResponse.json({ free: true, editId: edit.id, remainingAfter: freeEdits - 1, redirectTo: `${baseUrl}/edit/processing?free=true&edit_id=${edit.id}` });
    }

    // No free edits — charge via Stripe
    const stripe = getStripe();
    const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{
        price_data: {
          currency: "eur",
          unit_amount: 1000,
          product_data: {
            name: `Website Edit — ${site.name}`,
            description: description.trim().slice(0, 120),
          },
        },
        quantity: 1,
      }],
      metadata: { type: "edit", editId: edit.id, siteId: site.id, userId: session.userId },
      success_url: `${baseUrl}/edit/processing?session_id={CHECKOUT_SESSION_ID}&edit_id=${edit.id}`,
      cancel_url: `${baseUrl}/edit/${siteId}`,
    });

    await updateSiteEditStatus(edit.id, "pending", { stripeSessionId: checkoutSession.id });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("Create edit checkout error:", error);
    return NextResponse.json({ error: "Failed to create checkout session." }, { status: 500 });
  }
}
