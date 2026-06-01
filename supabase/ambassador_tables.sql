-- Kingdom Broker Ambassador Program Tables
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/zroyvtumpankgdeuxvbj/sql/new

-- Ambassadors (referral partners)
CREATE TABLE IF NOT EXISTS ambassadors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  company TEXT,
  how_connected TEXT,
  referral_code TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'pending', -- pending | approved | active | inactive
  total_referrals INTEGER DEFAULT 0,
  total_signed INTEGER DEFAULT 0,
  total_closed INTEGER DEFAULT 0,
  total_earned NUMERIC DEFAULT 0,
  payout_method TEXT, -- zelle | wire | check
  payout_details TEXT, -- bank info or zelle email
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ambassador Referrals (each referred business owner)
CREATE TABLE IF NOT EXISTS ambassador_referrals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ambassador_id UUID REFERENCES ambassadors(id) ON DELETE CASCADE,
  referral_code TEXT,
  -- Referred business owner info
  owner_name TEXT,
  owner_email TEXT,
  owner_phone TEXT,
  business_name TEXT,
  industry TEXT,
  estimated_revenue TEXT,
  city TEXT,
  state TEXT,
  -- Deal tracking
  status TEXT DEFAULT 'referred', -- referred | contacted | signed | active | closed | lost
  deal_id UUID REFERENCES deals(id),
  engagement_signed_at TIMESTAMPTZ,
  deal_closed_at TIMESTAMPTZ,
  deal_value NUMERIC,
  success_fee NUMERIC,
  -- Commission tracking
  signing_bonus_amount NUMERIC DEFAULT 1000,
  signing_bonus_paid BOOLEAN DEFAULT FALSE,
  signing_bonus_paid_at TIMESTAMPTZ,
  commission_rate NUMERIC DEFAULT 0.20, -- 20%
  commission_amount NUMERIC, -- calculated: success_fee * 0.20
  commission_paid BOOLEAN DEFAULT FALSE,
  commission_paid_at TIMESTAMPTZ,
  -- Metadata
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE ambassadors ENABLE ROW LEVEL SECURITY;
ALTER TABLE ambassador_referrals ENABLE ROW LEVEL SECURITY;

-- Admin can see all
CREATE POLICY "admin_all_ambassadors" ON ambassadors
  FOR ALL USING (true);
CREATE POLICY "admin_all_referrals" ON ambassador_referrals
  FOR ALL USING (true);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_ambassadors_email ON ambassadors(email);
CREATE INDEX IF NOT EXISTS idx_ambassadors_code ON ambassadors(referral_code);
CREATE INDEX IF NOT EXISTS idx_referrals_ambassador ON ambassador_referrals(ambassador_id);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON ambassador_referrals(status);
