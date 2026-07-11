-- 006_password_reset.sql
--
-- Forgot-password flow: a single-use, time-limited token per user.
--
-- Apply manually, once:
--   psql "$DATABASE_URL" -f migrations/006_password_reset.sql

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS password_reset_token TEXT,
  ADD COLUMN IF NOT EXISTS password_reset_expires TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_users_password_reset_token
  ON users (password_reset_token)
  WHERE password_reset_token IS NOT NULL;
