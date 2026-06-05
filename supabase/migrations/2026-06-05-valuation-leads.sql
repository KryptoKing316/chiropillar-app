-- ChiroPillar · valuation-lead capture table
-- For /value-my-clinic public funnel + /intake fallback path
-- Created 2026-06-05
--
-- TO RUN: paste this whole file into the Supabase SQL editor and click Run.
-- (One-time. Takes ~2 seconds.)

create table if not exists public.chiropillar_valuation_leads (
  id                   uuid default gen_random_uuid() primary key,
  email                text not null,
  full_name            text,
  practice_name        text,
  estimated_value_mid  numeric,
  revenue              numeric,
  owner_role           text,
  new_patients_mo      integer,
  source               text default '/value-my-clinic',
  user_agent           text,
  created_at           timestamptz default now()
);

create index if not exists idx_valuation_leads_email   on public.chiropillar_valuation_leads (email);
create index if not exists idx_valuation_leads_created on public.chiropillar_valuation_leads (created_at desc);

-- Service-role-only writes; no public reads.
alter table public.chiropillar_valuation_leads enable row level security;
revoke all on public.chiropillar_valuation_leads from public;
revoke all on public.chiropillar_valuation_leads from anon;

-- ── Same for the intake-app submissions (used as a fallback path) ──
create table if not exists public.chiropillar_targets (
  id                                 uuid default gen_random_uuid() primary key,
  email                              text,
  full_name                          text,
  phone                              text,
  practice_name                      text,
  city                               text,
  state                              text,
  gross_revenue_last_year            numeric,
  net_revenue_last_year              numeric,
  new_patients_per_month_avg_2yr     integer,
  avg_visits_per_patient             integer,
  services_provided                  text[],
  services_provided_other            text,
  employee_count                     text,
  geographic_location_notes          text,
  owner_role                         text,
  past_12mo_was_spike                text,
  ok_to_contact                      boolean default true,
  qualification                      text,
  qualification_reasons              jsonb,
  valuation_profile                  text,
  valuation_low                      numeric,
  valuation_mid                      numeric,
  valuation_high                     numeric,
  source                             text,
  created_at                         timestamptz default now()
);

create index if not exists idx_chiropillar_targets_email   on public.chiropillar_targets (email);
create index if not exists idx_chiropillar_targets_created on public.chiropillar_targets (created_at desc);
alter table public.chiropillar_targets enable row level security;
revoke all on public.chiropillar_targets from public;
revoke all on public.chiropillar_targets from anon;

-- Smoke-test row so Wagner sees something in the dashboard before the first
-- real lead lands.
insert into public.chiropillar_valuation_leads (email, full_name, practice_name, estimated_value_mid, revenue, owner_role, new_patients_mo, source)
values ('seed@chiropillar.com', 'Seed Demo', 'Demo Spine & Wellness', 1365000, 1300000, 'mostly_management', 42, '/value-my-clinic')
on conflict do nothing;
