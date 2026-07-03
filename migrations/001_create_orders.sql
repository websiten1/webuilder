-- 001_create_orders.sql
--
-- One row per Stripe checkout session (payment for a website generation).
-- The UNIQUE constraint on stripe_session_id is the idempotency key that
-- prevents double generation per payment: both entry points (Stripe webhook
-- and the checkout success page) must atomically claim the order
-- (status 'paid'/'failed' -> 'generating') before starting generation.
--
-- No migration tooling is used in this repo. Apply manually, once:
--   psql "$DATABASE_URL" -f migrations/001_create_orders.sql

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stripe_session_id TEXT NOT NULL UNIQUE,
  stripe_customer_id TEXT,
  amount_total INTEGER,          -- minor units, as reported by Stripe
  currency TEXT,
  tier TEXT NOT NULL DEFAULT 'website',
  status TEXT NOT NULL DEFAULT 'paid'
    CHECK (status IN ('paid', 'generating', 'completed', 'failed')),
  site_id UUID REFERENCES sites(id) ON DELETE SET NULL,
  error TEXT,
  claimed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS orders_user_id_idx ON orders(user_id);
