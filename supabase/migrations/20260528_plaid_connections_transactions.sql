-- ===========================================================================
-- Migration · 2026-05-28
-- Plaid: connections + bank transactions
-- ---------------------------------------------------------------------------
-- Schema for the Plaid bank-connect flow:
--   1. plaid_connections — one row per (deal, institution) pair, holds the
--      long-lived access_token + cursor for incremental sync
--   2. bank_transactions — every transaction synced from Plaid, with
--      trades-business categorization + add-back candidate flag
--
-- Both tables: RLS so a seller can only see their own deal's data.
-- ===========================================================================

-- ── plaid_connections ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.plaid_connections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  deal_id UUID NOT NULL REFERENCES public.deals(id) ON DELETE CASCADE,
  plaid_item_id TEXT NOT NULL UNIQUE,
  access_token TEXT NOT NULL,  -- encrypted-at-rest by Supabase
  cursor TEXT,                  -- transactions/sync cursor
  institution_name TEXT,
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_plaid_connections_deal
  ON public.plaid_connections (deal_id);

ALTER TABLE public.plaid_connections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS sellers_own_plaid_connections ON public.plaid_connections;
CREATE POLICY sellers_own_plaid_connections ON public.plaid_connections
  FOR ALL USING (
    deal_id IN (SELECT id FROM public.deals WHERE seller_id = auth.uid())
  );

-- ── bank_transactions ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.bank_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  deal_id UUID NOT NULL REFERENCES public.deals(id) ON DELETE CASCADE,
  plaid_transaction_id TEXT NOT NULL UNIQUE,
  date DATE NOT NULL,
  name TEXT,
  merchant_name TEXT,
  amount NUMERIC NOT NULL,
  plaid_category TEXT[],
  kb_category TEXT,
  is_add_back_candidate BOOLEAN DEFAULT FALSE,
  add_back_reason TEXT,
  account_id TEXT,
  pending BOOLEAN DEFAULT FALSE,
  seller_reviewed BOOLEAN DEFAULT FALSE,  -- seller approved/rejected the add-back flag
  seller_decision TEXT,                   -- 'approved' | 'rejected' | null
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bank_transactions_deal_date
  ON public.bank_transactions (deal_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_bank_transactions_addback
  ON public.bank_transactions (deal_id, is_add_back_candidate)
  WHERE is_add_back_candidate = TRUE;

ALTER TABLE public.bank_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS sellers_own_bank_transactions ON public.bank_transactions;
CREATE POLICY sellers_own_bank_transactions ON public.bank_transactions
  FOR ALL USING (
    deal_id IN (SELECT id FROM public.deals WHERE seller_id = auth.uid())
  );

-- ===========================================================================
-- ROLLBACK
-- ===========================================================================
-- DROP TABLE IF EXISTS public.bank_transactions;
-- DROP TABLE IF EXISTS public.plaid_connections;
