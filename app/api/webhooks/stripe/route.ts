import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { neon } from "@neondatabase/serverless";
import { getUserById, markUserPaid } from "@/lib/db";

function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL not set");
  return neon(url);
}

async function getWizardDraft(userId: string) {
  const sql = getDb();
  try {
    const rows = await sql`SELECT data FROM wizard_drafts WHERE user_id = ${userId} LIMIT 1`;
    return rows[0]?.data ?? null;
  } catch { return null; }
}

export async function POST(request: NextRequest) {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripeKey || stripeKey === "sk_test_xxxxx") {
    return NextResponse.json({ error: "Stripe not configured." }, { status: 500 });
  }

  const stripe = new Stripe(stripeKey);
  const body = await request.text();
  const sig  = request.headers.get("stripe-signature");

  let event: Stripe.Event;
  try {
    if (!webhookSecret || !sig) {
      event = JSON.parse(body) as Stripe.Event;
    } else {
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    }
  } catch (err) {
    console.error("Webhook signature error:", err);
    return NextResponse.json({ error: "Webhook signature verification failed." }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.userId || session.client_reference_id;

    if (session.payment_status === "paid" && userId) {
      await markUserPaid(userId, session.id, session.customer as string | null);

      // Trigger site generation using wizard data saved before payment
      const formData = await getWizardDraft(userId);
      const user = await getUserById(userId);

      if (formData && user) {
        const baseUrl = process.env.NEXT_PUBLIC_URL || "https://insixlive.com";
        // Fire-and-forget — generation runs async
        fetch(`${baseUrl}/api/generate-site`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-internal-secret": process.env.INTERNAL_SECRET || "",
          },
          body: JSON.stringify({
            formData,
            tier: "website",
            userId,
            stripeSessionId: session.id,
          }),
        }).catch(err => console.error("Webhook generate trigger error:", err));
      } else {
        console.log(`Webhook: paid but no wizard draft for user ${userId} — will generate on success page redirect`);
      }
    }
  }

  return NextResponse.json({ received: true });
}
