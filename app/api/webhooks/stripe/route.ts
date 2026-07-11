import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { neon } from "@neondatabase/serverless";
import { getUserById, markUserPaid, recordPaidOrder, markOrderRefunded, markOrderDisputed } from "@/lib/db";
import { getStripe } from "@/lib/stripe";
import { sendOpsAlert } from "@/lib/email";
import * as Sentry from "@sentry/nextjs";

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
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is not set — refusing to process webhooks.");
    return NextResponse.json({ error: "Webhook not configured." }, { status: 500 });
  }

  const stripe = getStripe();
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "Missing stripe-signature header." }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error("Webhook signature error:", err);
    return NextResponse.json({ error: "Webhook signature verification failed." }, { status: 400 });
  }

  if (
    event.type === "checkout.session.completed" ||
    event.type === "checkout.session.async_payment_succeeded"
  ) {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.userId || session.client_reference_id;

    // Trust payment_status, not the event alone (async/out-of-order events).
    // "no_payment_required" covers 100%-off promotion codes.
    const settled = session.payment_status === "paid" || session.payment_status === "no_payment_required";
    if (settled && userId) {
      await markUserPaid(userId, session.id, session.customer as string | null);
      await recordPaidOrder({
        userId,
        stripeSessionId: session.id,
        stripeCustomerId: session.customer as string | null,
        amountTotal: session.amount_total,
        currency: session.currency,
        tier: "website",
      });

      // Trigger site generation using wizard data saved before payment
      const formData = await getWizardDraft(userId);
      const user = await getUserById(userId);

      if (formData && user) {
        const internalSecret = process.env.INTERNAL_SECRET;
        if (!internalSecret) {
          // Without the shared secret the internal call would be rejected —
          // fail loudly instead of silently 401ing on every webhook. The
          // success-page redirect will still pick up the generation.
          console.error("INTERNAL_SECRET is not set — skipping webhook-triggered generation.");
          return NextResponse.json({ received: true });
        }
        const baseUrl = process.env.NEXT_PUBLIC_URL || "https://insixlive.com";
        // Fire-and-forget — generation runs async. generate-site claims the
        // order atomically, so a concurrent success-page trigger can't double it.
        fetch(`${baseUrl}/api/generate-site`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-internal-secret": internalSecret,
          },
          body: JSON.stringify({
            formData,
            tier: "website",
            userId,
            checkoutSessionId: session.id,
          }),
        }).catch(err => console.error("Webhook generate trigger error:", err));
      } else {
        console.log(`Webhook: paid but no wizard draft for user ${userId} — will generate on success page redirect`);
      }
    }
  } else if (event.type === "charge.refunded") {
    // Covers refunds issued from the Stripe dashboard directly, not just
    // ones our own issueRefund() call triggers — either way, the order
    // record should reflect it instead of staying "paid" forever.
    const charge = event.data.object as Stripe.Charge;
    if (charge.payment_intent) {
      try {
        const stripe = getStripe();
        const sessions = await stripe.checkout.sessions.list({
          payment_intent: charge.payment_intent as string,
          limit: 1,
        });
        const session = sessions.data[0];
        if (session) await markOrderRefunded(session.id);
      } catch (e) {
        console.error("Failed to record refund against order:", e);
        Sentry.captureException(e, { tags: { area: "webhook-refund" } });
      }
    }
  } else if (event.type === "charge.dispute.created") {
    // A chargeback — real money at risk and a response deadline from
    // Stripe. Needs a human immediately, there's no automated recovery.
    const dispute = event.data.object as Stripe.Dispute;
    Sentry.captureMessage("Stripe dispute created", { level: "error", extra: { disputeId: dispute.id, chargeId: dispute.charge, amount: dispute.amount, reason: dispute.reason } });
    await sendOpsAlert(
      "Stripe dispute opened",
      `A customer disputed a charge.\n\nDispute ID: ${dispute.id}\nCharge: ${dispute.charge}\nAmount: ${(dispute.amount / 100).toFixed(2)} ${dispute.currency?.toUpperCase()}\nReason: ${dispute.reason}\n\nRespond in the Stripe dashboard before the evidence deadline.`
    );
    const disputePaymentIntent = typeof dispute.payment_intent === "string" ? dispute.payment_intent : dispute.payment_intent?.id;
    if (disputePaymentIntent) {
      try {
        const stripe = getStripe();
        const sessions = await stripe.checkout.sessions.list({ payment_intent: disputePaymentIntent, limit: 1 });
        const session = sessions.data[0];
        if (session) await markOrderDisputed(session.id);
      } catch (e) {
        console.error("Failed to record dispute against order:", e);
      }
    }
  } else if (event.type === "checkout.session.expired") {
    // Informational — someone started checkout and never paid. No order
    // row exists yet at this point, nothing to reconcile.
    const session = event.data.object as Stripe.Checkout.Session;
    console.log(`Webhook: checkout session expired, user ${session.metadata?.userId ?? "unknown"}`);
  } else if (event.type === "payment_intent.payment_failed") {
    const intent = event.data.object as Stripe.PaymentIntent;
    console.log(`Webhook: payment failed for intent ${intent.id}: ${intent.last_payment_error?.message ?? "unknown reason"}`);
  }

  return NextResponse.json({ received: true });
}
