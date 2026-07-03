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
