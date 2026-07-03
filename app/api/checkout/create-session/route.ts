import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getUserById } from "@/lib/db";
import { getStripe } from "@/lib/stripe";
import { checkUserVercelConnection, VERCEL_RECONNECT_MESSAGE } from "@/lib/vercel";

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

    const vercel = await checkUserVercelConnection(session.userId);
    if (!vercel.connected) {
      return NextResponse.json(
        { error: VERCEL_RECONNECT_MESSAGE, code: "VERCEL_NOT_CONNECTED" },
        { status: 403 }
      );
    }

    const stripe = getStripe();
    const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: user.email,
      line_items: [
        {
          price_data: {
            currency: "eur",
            unit_amount: 5999,
            product_data: {
              name: "insixlive — Professional Website",
              description:
                "AI-generated, production-ready website deployed to your Vercel account. One-time payment. You own the code forever.",
            },
          },
          quantity: 1,
        },
      ],
      metadata: { userId: user.id },
      client_reference_id: user.id,
      success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/generate`,
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
