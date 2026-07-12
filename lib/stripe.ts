import Stripe from "stripe";

// Pinned to match the Stripe dashboard webhook endpoint version.
// stripe@22.1.1 defaults to this version; explicit pin prevents silent drift
// when the SDK is upgraded.
export const STRIPE_API_VERSION = "2026-04-22.dahlia" as const;

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || key === "sk_test_xxxxx") {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }
  return new Stripe(key, { apiVersion: STRIPE_API_VERSION });
}

// A single reusable 100%-off coupon backs every retry code — the coupon
// defines the discount, each failure gets its own single-use promotion
// code redeeming it. Deterministic id so repeated calls reuse the same
// coupon instead of creating a new one every time.
const RETRY_COUPON_ID = "insixlive_generation_failed_100";

async function getOrCreateRetryCoupon(stripe: Stripe): Promise<string> {
  try {
    await stripe.coupons.retrieve(RETRY_COUPON_ID);
    return RETRY_COUPON_ID;
  } catch {
    await stripe.coupons.create({
      id: RETRY_COUPON_ID,
      percent_off: 100,
      duration: "once",
      name: "Generation failed — free retry",
    });
    return RETRY_COUPON_ID;
  }
}

/**
 * Issues a one-time, single-use 100%-off promotion code so a customer whose
 * paid generation failed can retry through the normal checkout flow (which
 * already accepts promo codes) without paying again.
 *
 * Not restricted to a specific Stripe customer: /api/checkout/create-session
 * creates each session from customer_email rather than a persistent
 * customer id, so a customer-scoped restriction would silently fail to
 * validate on retry. max_redemptions: 1 plus only ever emailing it to the
 * affected address is the access control here — the same model Stripe's
 * own docs use for one-off discount codes sent by email.
 */
export async function issueRetryPromoCode(): Promise<string> {
  const stripe = getStripe();
  const couponId = await getOrCreateRetryCoupon(stripe);
  const promotionCode = await stripe.promotionCodes.create({
    promotion: { type: "coupon", coupon: couponId },
    max_redemptions: 1,
    expires_at: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, // 30 days
  });
  return promotionCode.code;
}
