-- ===========================================================================
-- Migration · 2026-05-28
-- Documents: uniqueness constraint for upsert + extracted_data column
-- ---------------------------------------------------------------------------
-- Supports:
--   * folder-upload flow (deal_id + doc_type + year is the natural key)
--   * trades-tuned AI extraction stored as JSONB on the document row
--   * financial_analysis insert path for the valuation builder
-- ===========================================================================

-- 1. financial_documents — add extracted_data JSONB if missing,
--    add unique constraint that the upsert relies on
DO $$
BEGIN
  -- Add extracted_data column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'financial_documents'
      AND column_name = 'extracted_data'
  ) THEN
    ALTER TABLE public.financial_documents
      ADD COLUMN extracted_data JSONB;
  END IF;

  -- Add unique constraint for the upsert key — drop the equivalent index first
  -- if it already exists in a different form (defensive against re-runs).
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'financial_documents_deal_doc_year_key'
  ) THEN
    ALTER TABLE public.financial_documents
      ADD CONSTRAINT financial_documents_deal_doc_year_key
      UNIQUE (deal_id, doc_type, year);
  END IF;
END $$;

-- 2. financial_analysis — ensure source_doc column exists (FK-like pointer
--    back to financial_documents.id so the dashboard can trace per-year
--    numbers back to the originating PDF/image)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'financial_analysis'
      AND column_name = 'source_doc'
  ) THEN
    ALTER TABLE public.financial_analysis
      ADD COLUMN source_doc UUID;
  END IF;
END $$;

-- 3. Helpful indexes
CREATE INDEX IF NOT EXISTS idx_financial_documents_deal
  ON public.financial_documents (deal_id);
CREATE INDEX IF NOT EXISTS idx_financial_documents_status
  ON public.financial_documents (upload_status);
CREATE INDEX IF NOT EXISTS idx_financial_analysis_deal_year
  ON public.financial_analysis (deal_id, year);

-- ===========================================================================
-- ROLLBACK (do not run in production unless reverting this migration)
-- ===========================================================================
-- ALTER TABLE public.financial_documents
--   DROP CONSTRAINT IF EXISTS financial_documents_deal_doc_year_key;
-- ALTER TABLE public.financial_documents
--   DROP COLUMN IF EXISTS extracted_data;
-- ALTER TABLE public.financial_analysis
--   DROP COLUMN IF EXISTS source_doc;
-- DROP INDEX IF EXISTS idx_financial_documents_deal;
-- DROP INDEX IF EXISTS idx_financial_documents_status;
-- DROP INDEX IF EXISTS idx_financial_analysis_deal_year;
