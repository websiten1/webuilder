-- 003_sites_vercel_project_name.sql
--
-- vercel_project_id stores Vercel's internal id (prj_…); vercel_project_name
-- stores the deploy slug used in API calls and *.vercel.app URLs.
--
-- Apply manually, once:
--   psql "$DATABASE_URL" -f migrations/003_sites_vercel_project_name.sql

ALTER TABLE sites ADD COLUMN IF NOT EXISTS vercel_project_name TEXT;
