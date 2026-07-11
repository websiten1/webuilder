-- 008_order_refund_status.sql
--
-- Lets the Stripe webhook record refunds and disputes against an order,
-- instead of those events leaving no trace in the DB.
--
-- Apply manually, once:
--   psql "$DATABASE_URL" -f migrations/008_order_refund_status.sql

ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE orders ADD CONSTRAINT orders_status_check
  CHECK (status IN ('paid', 'generating', 'completed', 'failed', 'refunded', 'disputed'));
