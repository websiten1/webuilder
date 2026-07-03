-- 002_orders_claimed_at.sql
--
-- Stale-claim recovery: claimed_at records when an order was claimed for
-- generation. If a generation process crashes before reaching its
-- success/failure handling, the order would be stuck in 'generating'
-- forever and the paying customer could never retry. The claim query
-- (lib/db.ts claimOrderForGeneration) therefore also re-claims 'generating'
-- rows whose claim is older than 15 minutes (generation's maxDuration is
-- 300s, so 15 minutes means the previous attempt is certainly dead).
--
-- Note: databases created from 001_create_orders.sql already have this
-- column; the IF NOT EXISTS makes this a safe no-op there.
--
-- Apply manually, once:
--   psql "$DATABASE_URL" -f migrations/002_orders_claimed_at.sql

ALTER TABLE orders ADD COLUMN IF NOT EXISTS claimed_at TIMESTAMPTZ;
