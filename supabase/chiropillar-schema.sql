-- ChiroPillar · Wagner Family Office · Supabase schema
-- Run this in the ChiroPillar Supabase project SQL editor.
-- Separate project from app.kingdombroker.com — clean data isolation.

-- ── chiropillar_targets ─────────────────────────────────────────────────
-- Inbound chiropractor partnership applications from /intake.
-- One row per submission. Wagner's qualification logic runs client-side
-- and writes the verdict here for the admin dashboard.

CREATE TABLE IF NOT EXISTS chiropillar_targets (
  id                                UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Contact
  full_name                         TEXT NOT NULL,
  email                             TEXT NOT NULL,
  phone                             TEXT,
  practice_name                     TEXT NOT NULL,
  city                              TEXT,
  state                             TEXT,

  -- Wagner's 7 intake metrics (text fields — owners type round numbers)
  gross_revenue_last_year           TEXT,
  net_revenue_last_year             TEXT,
  new_patients_per_month_avg_2yr    TEXT,
  avg_visits_per_patient            TEXT,
  services_provided                 TEXT[] DEFAULT '{}',
  services_provided_other           TEXT,
  employee_count                    TEXT,
  geographic_location_notes         TEXT,   -- doubles as years-in-business
  owner_role                        TEXT,   -- full_clinical | mostly_clinical_some_management | mostly_management | wants_to_step_out
  past_12mo_was_spike               TEXT,   -- no | unsure | yes

  -- Consent
  ok_to_contact                     BOOLEAN DEFAULT FALSE,

  -- Auto-scored qualification (from the client-side logic)
  qualification                     TEXT,   -- qualified | maybe | not_yet
  qualification_reasons             TEXT[] DEFAULT '{}',

  -- Operational
  outreach_status                   TEXT DEFAULT 'new',   -- new | called | scheduled | in_diligence | offer | closed | passed
  notes                             TEXT,
  assigned_to                       TEXT,   -- email of team member following up

  created_at                        TIMESTAMPTZ DEFAULT NOW(),
  updated_at                        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chiropillar_targets_qualification ON chiropillar_targets (qualification);
CREATE INDEX IF NOT EXISTS idx_chiropillar_targets_status        ON chiropillar_targets (outreach_status);
CREATE INDEX IF NOT EXISTS idx_chiropillar_targets_state         ON chiropillar_targets (state);
CREATE INDEX IF NOT EXISTS idx_chiropillar_targets_created       ON chiropillar_targets (created_at DESC);

-- ── chiropillar_team ────────────────────────────────────────────────────
-- Whitelist of email addresses authorized to access the admin dashboard.
-- Magic-link login validates against this table.

CREATE TABLE IF NOT EXISTS chiropillar_team (
  email     TEXT PRIMARY KEY,
  full_name TEXT,
  role      TEXT DEFAULT 'admin',  -- admin | viewer
  active    BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed the day-1 access list (Wagner + Eric + McGrath)
INSERT INTO chiropillar_team (email, full_name, role) VALUES
  ('eric@kingdombroker.com',  'Eric Skeldon',       'admin'),
  ('wagner@chiropillar.com',  'Dr. Scott Wagner',   'admin'),       -- placeholder — update with his real email
  ('mcgrath@kingdombroker.com', 'Scott McGrath',    'admin')        -- placeholder — update with his real email
ON CONFLICT (email) DO NOTHING;

-- ── chiropillar_scenarios ───────────────────────────────────────────────
-- Saved Deal Calculator scenarios (one per user, named).
-- Lets Wagner / Eric / McGrath save what-ifs without overwriting each other.

CREATE TABLE IF NOT EXISTS chiropillar_scenarios (
  id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_email         TEXT NOT NULL REFERENCES chiropillar_team(email),
  name                TEXT NOT NULL,

  -- Inputs (match the calculator's 11 sliders)
  ebitda_per_office   NUMERIC,
  purchase_multiple   NUMERIC,
  cash_pct            NUMERIC,
  note_rate           NUMERIC,
  profit_share_pct    NUMERIC,
  num_offices         INTEGER,
  ebitda_uplift       NUMERIC,
  mso_overhead        NUMERIC,
  hold_years          INTEGER,
  exit_multiple       NUMERIC,
  rollover_pct        NUMERIC,

  notes               TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chiropillar_scenarios_owner ON chiropillar_scenarios (owner_email);

-- ── RLS policies (lock everything down) ─────────────────────────────────
-- We use the service_role key for all server-side writes (API routes).
-- Client-side reads happen through the dashboard auth flow.

ALTER TABLE chiropillar_targets    ENABLE ROW LEVEL SECURITY;
ALTER TABLE chiropillar_team       ENABLE ROW LEVEL SECURITY;
ALTER TABLE chiropillar_scenarios  ENABLE ROW LEVEL SECURITY;

-- Service role bypasses RLS — no public-facing read on these tables.
-- All client-side dashboard reads will go through server-side API routes
-- that authenticate the user against chiropillar_team first.
