-- ChiroPillar · Add valuation columns to chiropillar_targets
-- Run this in the ChiroPillar Supabase SQL editor.
-- Safe to re-run (uses IF NOT EXISTS).

ALTER TABLE chiropillar_targets
  ADD COLUMN IF NOT EXISTS valuation_profile  TEXT,
  ADD COLUMN IF NOT EXISTS valuation_low      NUMERIC,
  ADD COLUMN IF NOT EXISTS valuation_mid      NUMERIC,
  ADD COLUMN IF NOT EXISTS valuation_high     NUMERIC;
