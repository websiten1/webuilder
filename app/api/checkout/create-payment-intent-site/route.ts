import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getSession } from "@/lib/session";
import { getUserById } from "@/lib/db";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || key === "sk_test_xxxxx") throw new Error("STRIPE_SECRET_KEY not configured");
  return new Stripe(key);
}

export async function POST() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

    const user = await getUserById(session.userId);
    if (!user) return NextResponse.json({ error: "User not found." }, { status: 401 });

    // Already paid — no need to create a new PaymentIntent
    if (user.payment_status === "paid") {
      return NextResponse.json({ alreadyPaid: true });
    }

    const stripe = getStripe();

    const paymentIntent = await stripe.paymentIntents.create({
      amount: 4999,
      currency: "eur",
      metadata: { userId: user.id, type: "site_generation" },
      description: "WebBuilder — Professional Website Generation",
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error("Create payment intent error:", error);
    return NextResponse.json(
      { error: "Failed to initialise payment." },
      { status: 500 }
    );
  }
}
