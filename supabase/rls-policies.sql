-- ============================================================
-- Kingdom Broker — Row Level Security Policies
-- Run this in Supabase Dashboard > SQL Editor
-- ============================================================

-- ============================================================
-- STEP 1: Enable RLS on every table
-- ============================================================

ALTER TABLE profiles               ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_documents    ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_analysis     ENABLE ROW LEVEL SECURITY;
ALTER TABLE buyer_leads            ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller_leads           ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_runs             ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_matches           ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log           ENABLE ROW LEVEL SECURITY;
ALTER TABLE investor_sessions      ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- STEP 2: Helper function — check if current user is admin
-- ============================================================

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- ============================================================
-- STEP 3: profiles — users see only their own profile
-- ============================================================

DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (id = auth.uid() OR is_admin());

DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (id = auth.uid() OR is_admin());

-- ============================================================
-- STEP 4: deals — sellers see only their own deal; admin sees all
-- ============================================================

DROP POLICY IF EXISTS "deals_select" ON deals;
CREATE POLICY "deals_select" ON deals
  FOR SELECT USING (seller_id = auth.uid() OR is_admin());

DROP POLICY IF EXISTS "deals_insert" ON deals;
CREATE POLICY "deals_insert" ON deals
  FOR INSERT WITH CHECK (seller_id = auth.uid() OR is_admin());

DROP POLICY IF EXISTS "deals_update" ON deals;
CREATE POLICY "deals_update" ON deals
  FOR UPDATE USING (seller_id = auth.uid() OR is_admin());

-- Sellers cannot delete their own deal — only admin
DROP POLICY IF EXISTS "deals_delete" ON deals;
CREATE POLICY "deals_delete" ON deals
  FOR DELETE USING (is_admin());

-- ============================================================
-- STEP 5: financial_documents — tied to deal ownership
-- ============================================================

DROP POLICY IF EXISTS "financial_documents_select" ON financial_documents;
CREATE POLICY "financial_documents_select" ON financial_documents
  FOR SELECT USING (
    deal_id IN (SELECT id FROM deals WHERE seller_id = auth.uid())
    OR is_admin()
  );

DROP POLICY IF EXISTS "financial_documents_insert" ON financial_documents;
CREATE POLICY "financial_documents_insert" ON financial_documents
  FOR INSERT WITH CHECK (
    deal_id IN (SELECT id FROM deals WHERE seller_id = auth.uid())
    OR is_admin()
  );

DROP POLICY IF EXISTS "financial_documents_update" ON financial_documents;
CREATE POLICY "financial_documents_update" ON financial_documents
  FOR UPDATE USING (
    deal_id IN (SELECT id FROM deals WHERE seller_id = auth.uid())
    OR is_admin()
  );

DROP POLICY IF EXISTS "financial_documents_delete" ON financial_documents;
CREATE POLICY "financial_documents_delete" ON financial_documents
  FOR DELETE USING (is_admin());

-- ============================================================
-- STEP 6: financial_analysis — same as financial_documents
-- ============================================================

DROP POLICY IF EXISTS "financial_analysis_select" ON financial_analysis;
CREATE POLICY "financial_analysis_select" ON financial_analysis
  FOR SELECT USING (
    deal_id IN (SELECT id FROM deals WHERE seller_id = auth.uid())
    OR is_admin()
  );

DROP POLICY IF EXISTS "financial_analysis_insert" ON financial_analysis;
CREATE POLICY "financial_analysis_insert" ON financial_analysis
  FOR INSERT WITH CHECK (is_admin());

DROP POLICY IF EXISTS "financial_analysis_update" ON financial_analysis;
CREATE POLICY "financial_analysis_update" ON financial_analysis
  FOR UPDATE USING (is_admin());

-- ============================================================
-- STEP 7: buyer_leads, seller_leads, agent_runs — ADMIN ONLY
-- ============================================================

DROP POLICY IF EXISTS "buyer_leads_admin_only" ON buyer_leads;
CREATE POLICY "buyer_leads_admin_only" ON buyer_leads
  FOR ALL USING (is_admin());

DROP POLICY IF EXISTS "seller_leads_admin_only" ON seller_leads;
CREATE POLICY "seller_leads_admin_only" ON seller_leads
  FOR ALL USING (is_admin());

DROP POLICY IF EXISTS "agent_runs_admin_only" ON agent_runs;
CREATE POLICY "agent_runs_admin_only" ON agent_runs
  FOR ALL USING (is_admin());

-- ============================================================
-- STEP 8: deal_matches — seller sees their own matches; admin sees all
-- ============================================================

DROP POLICY IF EXISTS "deal_matches_select" ON deal_matches;
CREATE POLICY "deal_matches_select" ON deal_matches
  FOR SELECT USING (
    deal_id IN (SELECT id FROM deals WHERE seller_id = auth.uid())
    OR is_admin()
  );

DROP POLICY IF EXISTS "deal_matches_insert_admin" ON deal_matches;
CREATE POLICY "deal_matches_insert_admin" ON deal_matches
  FOR INSERT WITH CHECK (is_admin());

DROP POLICY IF EXISTS "deal_matches_update_admin" ON deal_matches;
CREATE POLICY "deal_matches_update_admin" ON deal_matches
  FOR UPDATE USING (is_admin());

-- ============================================================
-- STEP 9: activity_log — seller sees their own deal's activity
-- ============================================================

DROP POLICY IF EXISTS "activity_log_select" ON activity_log;
CREATE POLICY "activity_log_select" ON activity_log
  FOR SELECT USING (
    deal_id IN (SELECT id FROM deals WHERE seller_id = auth.uid())
    OR is_admin()
  );

DROP POLICY IF EXISTS "activity_log_insert" ON activity_log;
CREATE POLICY "activity_log_insert" ON activity_log
  FOR INSERT WITH CHECK (is_admin());

-- ============================================================
-- STEP 10: investor_sessions — logged-in users insert their own; admin reads all
-- Run AFTER creating the table:
-- CREATE TABLE investor_sessions (
--   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
--   investor_id UUID REFERENCES auth.users(id),
--   investor_name TEXT,
--   section_viewed TEXT,
--   time_on_section INTEGER DEFAULT 0,
--   document_downloaded TEXT,
--   ip_address TEXT,
--   created_at TIMESTAMPTZ DEFAULT NOW()
-- );
-- ============================================================

DROP POLICY IF EXISTS "investor_sessions_insert_own" ON investor_sessions;
CREATE POLICY "investor_sessions_insert_own" ON investor_sessions
  FOR INSERT WITH CHECK (investor_id = auth.uid() OR is_admin());

DROP POLICY IF EXISTS "investor_sessions_select_admin" ON investor_sessions;
CREATE POLICY "investor_sessions_select_admin" ON investor_sessions
  FOR SELECT USING (is_admin());

-- ============================================================
-- STEP 11: Storage bucket — ensure documents bucket is private
-- Run this AFTER creating the bucket in Storage dashboard
-- ============================================================

-- In the Supabase Storage dashboard:
-- 1. Create bucket named "documents"
-- 2. Set to PRIVATE (not public)
-- 3. Then run the signed URL generation in your API:
--    const { data } = await supabase.storage
--      .from('documents')
--      .createSignedUrl(filePath, 3600) // 1-hour expiry

-- Storage RLS policies (run in SQL editor):
DROP POLICY IF EXISTS "storage_documents_select" ON storage.objects;
CREATE POLICY "storage_documents_select" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'documents'
    AND (
      -- Path format: deals/{dealId}/...
      -- Extract dealId and check ownership
      (storage.foldername(name))[1] = 'deals'
      AND EXISTS (
        SELECT 1 FROM deals
        WHERE id::text = (storage.foldername(name))[2]
        AND seller_id = auth.uid()
      )
    )
    OR is_admin()
  );

DROP POLICY IF EXISTS "storage_documents_insert" ON storage.objects;
CREATE POLICY "storage_documents_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'documents'
    AND (
      (storage.foldername(name))[1] = 'deals'
      AND EXISTS (
        SELECT 1 FROM deals
        WHERE id::text = (storage.foldername(name))[2]
        AND seller_id = auth.uid()
      )
    )
    OR is_admin()
  );
