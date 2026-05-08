import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { markUserPaid } from "@/lib/db";

export async function POST(request: NextRequest) {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripeKey || stripeKey === "sk_test_xxxxx") {
    return NextResponse.json(
      { error: "Stripe not configured." },
      { status: 500 }
    );
  }

  const stripe = new Stripe(stripeKey);
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  let event: Stripe.Event;

  try {
    if (!webhookSecret || !sig) {
      // In development without webhook secret, parse raw event
      event = JSON.parse(body) as Stripe.Event;
    } else {
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    }
  } catch (err) {
    console.error("Webhook signature error:", err);
    return NextResponse.json(
      { error: "Webhook signature verification failed." },
      { status: 400 }
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    if (
      session.payment_status === "paid" &&
      session.metadata?.userId
    ) {
      await markUserPaid(
        session.metadata.userId,
        session.id,
        session.customer as string | null
      );
    }
  }

  return NextResponse.json({ received: true });
}
