import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getSession, createSession } from "@/lib/session";
import { getUserById, getUserByEmail, markUserPaid } from "@/lib/db";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || key === "sk_test_xxxxx") {
    throw new Error("STRIPE_SECRET_KEY is not configured in .env.local");
  }
  return new Stripe(key);
}

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json();
    if (!sessionId) {
      return NextResponse.json({ error: "Session ID is required." }, { status: 400 });
    }

    const stripe = getStripe();
    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);

    if (checkoutSession.payment_status !== "paid") {
      return NextResponse.json({ error: "Payment has not been completed yet." }, { status: 400 });
    }

    // 1. Try metadata / client_reference_id (set by Checkout Session API)
    const metaUserId = checkoutSession.metadata?.userId || checkoutSession.client_reference_id;

    // 2. Try active session cookie (set when user logged in)
    const authSession = await getSession();

    // 3. Try email from Stripe (works with Payment Links)
    const stripeEmail = checkoutSession.customer_details?.email || checkoutSession.customer_email;

    let user = null;

    if (metaUserId) {
      user = await getUserById(metaUserId);
    }
    if (!user && authSession?.userId) {
      user = await getUserById(authSession.userId);
    }
    if (!user && stripeEmail) {
      user = await getUserByEmail(stripeEmail);
    }

    if (!user) {
      return NextResponse.json({ error: "Could not identify user from payment. Please log in and try again." }, { status: 400 });
    }

    await markUserPaid(user.id, sessionId, checkoutSession.customer as string | null);

    // Re-issue a fresh session so the subsequent generate-site call succeeds.
    await createSession({ userId: user.id, emailVerified: user.email_verified, paymentStatus: "paid" });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Verify session error:", error);
    return NextResponse.json({ error: "Failed to verify payment. Please contact support." }, { status: 500 });
  }
}
