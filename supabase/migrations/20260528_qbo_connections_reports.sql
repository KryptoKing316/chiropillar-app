-- ===========================================================================
-- Migration · 2026-05-28
-- QuickBooks Online: connections + P&L + Balance Sheet + Chart of Accounts
-- ---------------------------------------------------------------------------
-- Schema for the QBO OAuth + report sync flow:
--   1. qbo_connections — long-lived access_token + refresh_token per
--      (deal, realm) pair
--   2. qbo_profit_loss — raw P&L JSON per (deal, year)
--   3. qbo_balance_sheet — raw Balance Sheet JSON per (deal, year)
--   4. qbo_chart_of_accounts — full CoA JSON per connection
--
-- All raw report data is stored as JSONB so the UI can render flexibly and
-- the reconciler agent can cross-check against Plaid + uploaded docs.
-- RLS so a seller only sees their own deal.
-- ===========================================================================

-- ── qbo_connections ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.qbo_connections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  deal_id UUID NOT NULL REFERENCES public.deals(id) ON DELETE CASCADE,
  realm_id TEXT NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at TIMESTAMPTZ,
  company_name TEXT,
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (deal_id, realm_id)
);

CREATE INDEX IF NOT EXISTS idx_qbo_connections_deal
  ON public.qbo_connections (deal_id);

ALTER TABLE public.qbo_connections ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS sellers_own_qbo_connections ON public.qbo_connections;
CREATE POLICY sellers_own_qbo_connections ON public.qbo_connections
  FOR ALL USING (
    deal_id IN (SELECT id FROM public.deals WHERE seller_id = auth.uid())
  );

-- ── qbo_profit_loss ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.qbo_profit_loss (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  deal_id UUID NOT NULL REFERENCES public.deals(id) ON DELETE CASCADE,
  connection_id UUID REFERENCES public.qbo_connections(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  report_data JSONB NOT NULL,
  fetched_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (deal_id, year)
);

CREATE INDEX IF NOT EXISTS idx_qbo_pl_deal_year
  ON public.qbo_profit_loss (deal_id, year DESC);

ALTER TABLE public.qbo_profit_loss ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS sellers_own_qbo_pl ON public.qbo_profit_loss;
CREATE POLICY sellers_own_qbo_pl ON public.qbo_profit_loss
  FOR ALL USING (
    deal_id IN (SELECT id FROM public.deals WHERE seller_id = auth.uid())
  );

-- ── qbo_balance_sheet ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.qbo_balance_sheet (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  deal_id UUID NOT NULL REFERENCES public.deals(id) ON DELETE CASCADE,
  connection_id UUID REFERENCES public.qbo_connections(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  report_data JSONB NOT NULL,
  fetched_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (deal_id, year)
);

CREATE INDEX IF NOT EXISTS idx_qbo_bs_deal_year
  ON public.qbo_balance_sheet (deal_id, year DESC);

ALTER TABLE public.qbo_balance_sheet ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS sellers_own_qbo_bs ON public.qbo_balance_sheet;
CREATE POLICY sellers_own_qbo_bs ON public.qbo_balance_sheet
  FOR ALL USING (
    deal_id IN (SELECT id FROM public.deals WHERE seller_id = auth.uid())
  );

-- ── qbo_chart_of_accounts ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.qbo_chart_of_accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  deal_id UUID NOT NULL REFERENCES public.deals(id) ON DELETE CASCADE,
  connection_id UUID REFERENCES public.qbo_connections(id) ON DELETE CASCADE,
  accounts_data JSONB NOT NULL,
  fetched_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (deal_id, connection_id)
);

CREATE INDEX IF NOT EXISTS idx_qbo_coa_deal
  ON public.qbo_chart_of_accounts (deal_id);

ALTER TABLE public.qbo_chart_of_accounts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS sellers_own_qbo_coa ON public.qbo_chart_of_accounts;
CREATE POLICY sellers_own_qbo_coa ON public.qbo_chart_of_accounts
  FOR ALL USING (
    deal_id IN (SELECT id FROM public.deals WHERE seller_id = auth.uid())
  );

-- ===========================================================================
-- ROLLBACK
-- ===========================================================================
-- DROP TABLE IF EXISTS public.qbo_chart_of_accounts;
-- DROP TABLE IF EXISTS public.qbo_balance_sheet;
-- DROP TABLE IF EXISTS public.qbo_profit_loss;
-- DROP TABLE IF EXISTS public.qbo_connections;
