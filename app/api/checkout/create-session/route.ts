import { NextRequest, NextResponse } from "next/server";
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

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    }

    const user = await getUserById(session.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 401 });
    }

    if (!user.email_verified) {
      return NextResponse.json(
        { error: "Please verify your email first." },
        { status: 403 }
      );
    }

    if (user.payment_status === "paid") {
      return NextResponse.json(
        { error: "Payment already completed." },
        { status: 400 }
      );
    }

    const stripe = getStripe();
    const baseUrl =
      process.env.NEXT_PUBLIC_URL || "http://localhost:3000";

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: user.email,
      line_items: [
        {
          price_data: {
            currency: "eur",
            unit_amount: 4999,
            product_data: {
              name: "WebBuilder — Professional Website",
              description:
                "AI-generated, production-ready website. One-time payment. You own the code forever.",
            },
          },
          quantity: 1,
        },
      ],
      metadata: { userId: user.id },
      success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/checkout`,
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("Create checkout session error:", error);
    return NextResponse.json(
      { error: "Failed to create payment session. Please try again." },
      { status: 500 }
    );
  }
}
