import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getSession } from "@/lib/session";
import { getUserById, markUserPaid, recordPaidOrder } from "@/lib/db";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || key === "sk_test_xxxxx") {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }
  return new Stripe(key);
}

// Verifies that a completed Stripe checkout session belongs to the currently
// authenticated user. Possession of a session_id (URL param, browser history,
// logs) is never treated as proof of identity, and no auth session is minted
// here — an expired browser session must go through login.
export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json();
    if (!sessionId || typeof sessionId !== "string") {
      return NextResponse.json({ error: "Session ID is required." }, { status: 400 });
    }

    const authSession = await getSession();
    if (!authSession) {
      return NextResponse.json(
        { error: "Your session has expired. Please log in to continue.", code: "NOT_AUTHENTICATED" },
        { status: 401 }
      );
    }

    const user = await getUserById(authSession.userId);
    if (!user) {
      return NextResponse.json(
        { error: "Your session has expired. Please log in to continue.", code: "NOT_AUTHENTICATED" },
        { status: 401 }
      );
    }

    const stripe = getStripe();
    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);

    if (checkoutSession.payment_status !== "paid") {
      return NextResponse.json({ error: "Payment has not been completed yet." }, { status: 400 });
    }

    // Ownership check: prefer the userId we attached at checkout creation.
    // Payment Link sessions carry no metadata, so fall back to matching the
    // payer email against the authenticated account's email.
    const metaUserId = checkoutSession.metadata?.userId || checkoutSession.client_reference_id;
    const stripeEmail = (checkoutSession.customer_details?.email || checkoutSession.customer_email || "").toLowerCase();

    const belongsToUser = metaUserId
      ? metaUserId === user.id
      : stripeEmail !== "" && stripeEmail === user.email.toLowerCase();

    if (!belongsToUser) {
      console.error(`verify-session: checkout session ${sessionId} does not belong to user ${user.id}`);
      return NextResponse.json(
        { error: "This payment does not belong to your account." },
        { status: 403 }
      );
    }

    await markUserPaid(user.id, sessionId, checkoutSession.customer as string | null);
    await recordPaidOrder({
      userId: user.id,
      stripeSessionId: sessionId,
      stripeCustomerId: checkoutSession.customer as string | null,
      amountTotal: checkoutSession.amount_total,
      currency: checkoutSession.currency,
      tier: "website",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Verify session error:", error);
    return NextResponse.json({ error: "Payment verification failed. Please try again." }, { status: 500 });
  }
}
