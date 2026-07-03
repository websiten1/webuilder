-- 005_rate_limits.sql
--
-- Per-identifier login brute-force protection and per-user API rate caps.
--
-- Apply manually, once:
--   psql "$DATABASE_URL" -f migrations/005_rate_limits.sql

CREATE TABLE IF NOT EXISTS login_rate_limits (
  email TEXT PRIMARY KEY,
  failed_attempts INT NOT NULL DEFAULT 0,
  locked_until TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS api_rate_limits (
  user_id UUID NOT NULL,
  route TEXT NOT NULL,
  window_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  request_count INT NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, route)
);
