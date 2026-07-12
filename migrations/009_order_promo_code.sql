-- 009_order_promo_code.sql
--
-- Tracks whether a one-time 100%-off retry promo code has already been
-- issued for a failed order, so a repeated failure on the same order
-- doesn't mint a fresh code every time.
--
-- Apply manually, once:
--   psql "$DATABASE_URL" -f migrations/009_order_promo_code.sql

ALTER TABLE orders ADD COLUMN IF NOT EXISTS promo_code_issued TEXT;
