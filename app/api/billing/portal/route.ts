import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getSession } from "@/lib/session";
import { getUserById } from "@/lib/db";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || key === "sk_test_xxxxx") {
    throw new Error("STRIPE_SECRET_KEY is not configured in .env.local");
  }
  return new Stripe(key);
}

export async function POST() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const user = await getUserById(session.userId);
  if (!user?.stripe_customer_id) {
    return NextResponse.json(
      { error: "No payment history yet — the portal becomes available after your first purchase." },
      { status: 404 }
    );
  }

  const stripe = getStripe();
  const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";
  const portalSession = await stripe.billingPortal.sessions.create({
    customer: user.stripe_customer_id,
    return_url: `${baseUrl}/dashboard`,
  });

  return NextResponse.json({ url: portalSession.url });
}
