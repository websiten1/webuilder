import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getSession, createSession } from "@/lib/session";
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
      return NextResponse.json(
        { error: "Session ID is required." },
        { status: 400 }
      );
    }

    const authSession = await getSession();
    if (!authSession) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    }

    const stripe = getStripe();
    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);

    if (
      checkoutSession.payment_status !== "paid" ||
      checkoutSession.metadata?.userId !== authSession.userId
    ) {
      return NextResponse.json(
        { error: "Payment could not be verified." },
        { status: 400 }
      );
    }

    await markUserPaid(
      authSession.userId,
      sessionId,
      checkoutSession.customer as string | null
    );

    const user = await getUserById(authSession.userId);
    if (user) {
      await createSession({
        userId: user.id,
        emailVerified: user.email_verified,
        paymentStatus: "paid",
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Verify session error:", error);
    return NextResponse.json(
      { error: "Failed to verify payment. Please contact support." },
      { status: 500 }
    );
  }
}
