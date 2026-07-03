-- 004_verification_attempts.sql
--
-- Per-email verification code brute-force protection and resend rate limiting.
--
-- Apply manually, once:
--   psql "$DATABASE_URL" -f migrations/004_verification_attempts.sql

ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_attempts INT NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_code_sent_at TIMESTAMPTZ;
