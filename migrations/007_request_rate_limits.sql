-- 007_request_rate_limits.sql
--
-- Generic rate limiting for unauthenticated/pre-session endpoints (signup,
-- forgot-password, resend-verification, OTP verify), keyed by IP or email
-- rather than user_id. Supports both a sliding-window request cap and a
-- failed-attempt lockout (mirrors login_rate_limits, generalized).
--
-- Apply manually, once:
--   psql "$DATABASE_URL" -f migrations/007_request_rate_limits.sql

CREATE TABLE IF NOT EXISTS request_rate_limits (
  key TEXT NOT NULL,
  action TEXT NOT NULL,
  window_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  request_count INT NOT NULL DEFAULT 0,
  failed_attempts INT NOT NULL DEFAULT 0,
  locked_until TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (key, action)
);
