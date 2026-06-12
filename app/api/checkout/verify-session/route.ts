import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createSession } from "@/lib/session";
import { getUserById, markUserPaid } from "@/lib/db";

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

    // Resolve the user from the Stripe session (no auth cookie needed — the
    // session may have expired while the user was on Stripe's checkout page).
    const userId = checkoutSession.metadata?.userId || checkoutSession.client_reference_id;
    if (!userId) {
      return NextResponse.json({ error: "Could not identify user from payment." }, { status: 400 });
    }

    const user = await getUserById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    await markUserPaid(userId, sessionId, checkoutSession.customer as string | null);

    // Re-issue a fresh session so the subsequent generate-site call succeeds.
    await createSession({ userId: user.id, emailVerified: user.email_verified, paymentStatus: "paid" });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Verify session error:", error);
    return NextResponse.json({ error: "Failed to verify payment. Please contact support." }, { status: 500 });
  }
}
