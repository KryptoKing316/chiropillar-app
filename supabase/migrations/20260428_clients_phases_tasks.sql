-- ════════════════════════════════════════════════════════════════
-- Kingdom Broker — Client Portal schema
-- Tables: clients, phases, tasks
-- ════════════════════════════════════════════════════════════════

-- ─── CLIENTS ────────────────────────────────────────────────────
create table if not exists public.clients (
  id              uuid primary key default gen_random_uuid(),
  slug            text unique not null,
  business_name   text not null,
  display_name    text,
  city            text,
  state           text,
  industry        text,
  owner_name      text,
  owner_email     text,
  owner_phone     text,
  signed_date     date,
  exit_target_date date,
  exit_target_price_low  numeric,
  exit_target_price_high numeric,
  current_fair_market    numeric,
  run_rate_revenue       numeric,
  normalized_ebitda      numeric,
  current_multiple       numeric,
  target_multiple        numeric,
  total_owner_benefit    numeric,
  upfront_fee     numeric default 10000,
  success_fee_pct numeric default 0.07,
  status          text default 'active',
  charity_pct     numeric default 0,
  is_demo         boolean default false,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- ─── PHASES (Phase 1 / 2 / 3 of the engagement) ─────────────────
create table if not exists public.phases (
  id           uuid primary key default gen_random_uuid(),
  client_id    uuid references public.clients(id) on delete cascade,
  phase_number int not null,
  name         text not null,
  tagline      text,
  start_date   date,
  end_date     date,
  status       text default 'pending',
  sort_order   int,
  created_at   timestamptz default now()
);

-- ─── TASKS (the "$1M valuation roadmap" line items) ─────────────
create table if not exists public.tasks (
  id           uuid primary key default gen_random_uuid(),
  client_id    uuid references public.clients(id) on delete cascade,
  phase_id     uuid references public.phases(id) on delete cascade,
  title        text not null,
  description  text,
  owner        text,
  category     text,
  status       text default 'pending',
  priority     text default 'medium',
  due_date     date,
  completed_at timestamptz,
  sort_order   int,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- ─── INDEXES ────────────────────────────────────────────────────
create index if not exists idx_phases_client on public.phases(client_id);
create index if not exists idx_tasks_client on public.tasks(client_id);
create index if not exists idx_tasks_phase on public.tasks(phase_id);
create index if not exists idx_tasks_status on public.tasks(status);

-- ─── RLS ────────────────────────────────────────────────────────
alter table public.clients enable row level security;
alter table public.phases enable row level security;
alter table public.tasks enable row level security;

-- Clients: owner can read their own; admins/eric can read all
drop policy if exists "client_self_read" on public.clients;
create policy "client_self_read" on public.clients for select
  using (
    auth.jwt() ->> 'email' = owner_email
    or auth.jwt() ->> 'email' = 'eric@kingdombroker.com'
    or is_demo = true
  );

drop policy if exists "phases_via_client" on public.phases;
create policy "phases_via_client" on public.phases for select
  using (
    client_id in (
      select id from public.clients
      where auth.jwt() ->> 'email' = owner_email
         or auth.jwt() ->> 'email' = 'eric@kingdombroker.com'
         or is_demo = true
    )
  );

drop policy if exists "tasks_via_client" on public.tasks;
create policy "tasks_via_client" on public.tasks for select
  using (
    client_id in (
      select id from public.clients
      where auth.jwt() ->> 'email' = owner_email
         or auth.jwt() ->> 'email' = 'eric@kingdombroker.com'
         or is_demo = true
    )
  );

-- Service role bypasses RLS automatically; admins write through service role.

-- ════════════════════════════════════════════════════════════════
-- DEMO DATA (anonymized — for prospect/investor walkthroughs)
-- ════════════════════════════════════════════════════════════════
insert into public.clients (
  slug, business_name, display_name, city, state, industry,
  owner_name, owner_email, signed_date, exit_target_date,
  exit_target_price_low, exit_target_price_high, current_fair_market,
  run_rate_revenue, normalized_ebitda, current_multiple, target_multiple,
  total_owner_benefit, upfront_fee, success_fee_pct, status, is_demo
) values (
  'demo-hvac', 'Acme HVAC LLC', 'Acme HVAC', 'Dallas', 'TX', 'Residential HVAC',
  'John Owner', 'demo@kingdombroker.com',
  '2026-04-27'::date, '2027-01-27'::date,
  1000000, 1500000, 850000,
  770000, 200000, 4.25, 5.5,
  650000, 10000, 0.07, 'active', true
) on conflict (slug) do nothing;

-- Phases for demo client
with c as (select id from public.clients where slug='demo-hvac')
insert into public.phases (client_id, phase_number, name, tagline, start_date, end_date, status, sort_order)
select c.id, 1, 'Build the Asset', 'Foundation: financials, licenses, owner-independence', '2026-04-27'::date, '2026-07-27'::date, 'in_progress', 1 from c
union all select c.id, 2, 'Drive the Multiple', 'Recurring revenue, customer diversification, marketing', '2026-07-28'::date, '2026-10-27'::date, 'pending', 2 from c
union all select c.id, 3, 'Package + Sell', 'CIM, buyer outreach, LOI, due diligence, close', '2026-10-28'::date, '2027-01-27'::date, 'pending', 3 from c
on conflict do nothing;

-- Tasks for the $1M valuation roadmap (~30 tasks across 3 phases)
with c as (select id from public.clients where slug='demo-hvac'),
     p1 as (select id from public.phases where client_id=(select id from c) and phase_number=1),
     p2 as (select id from public.phases where client_id=(select id from c) and phase_number=2),
     p3 as (select id from public.phases where client_id=(select id from c) and phase_number=3)
insert into public.tasks (client_id, phase_id, title, owner, category, status, priority, due_date, sort_order) values
  -- ── Phase 1: Build the Asset (Months 1-3) ──
  ((select id from c), (select id from p1), 'Send 3 years P&L + tax returns to KB CPA partner', 'Owner', 'Financials', 'in_progress', 'high', '2026-05-04'::date, 1),
  ((select id from c), (select id from p1), 'Identify all add-backs for normalized EBITDA', 'KB CPA', 'Financials', 'pending', 'high', '2026-05-15'::date, 2),
  ((select id from c), (select id from p1), 'Audit personal vehicle / phone / credit card on company books', 'KB CPA', 'Financials', 'pending', 'medium', '2026-05-15'::date, 3),
  ((select id from c), (select id from p1), 'Set up CallRail tracked numbers for all marketing channels', 'Daniel', 'Marketing', 'pending', 'medium', '2026-05-20'::date, 4),
  ((select id from c), (select id from p1), 'Lock canonical NAP across Google / BBB / Yelp / Facebook / website', 'Dennis', 'Marketing', 'pending', 'high', '2026-05-22'::date, 5),
  ((select id from c), (select id from p1), 'Launch Google Review harvest campaign (target 100+ reviews in 90 days)', 'Dennis', 'Marketing', 'pending', 'high', '2026-06-01'::date, 6),
  ((select id from c), (select id from p1), 'Identify key employee for license transition (electrical/HVAC/plumbing)', 'Owner + Eric', 'Operations', 'pending', 'high', '2026-06-15'::date, 7),
  ((select id from c), (select id from p1), 'Document 5 SOPs for top revenue-generating workflows', 'Owner', 'Operations', 'pending', 'medium', '2026-06-20'::date, 8),
  ((select id from c), (select id from p1), 'Set up dispatch software (ServiceTitan or equivalent)', 'Daniel + Owner', 'Operations', 'pending', 'high', '2026-06-25'::date, 9),
  ((select id from c), (select id from p1), 'Onboard 10-year $1,500 warranty product (build sales script)', 'Eric', 'Product', 'pending', 'high', '2026-07-01'::date, 10),
  ((select id from c), (select id from p1), 'Record 4 testimonial videos from past customers', 'Owner + Dennis', 'Marketing', 'pending', 'medium', '2026-07-15'::date, 11),

  -- ── Phase 2: Drive the Multiple (Months 4-6) ──
  ((select id from c), (select id from p2), 'Hire 2nd technician for service division ramp', 'Owner', 'Operations', 'pending', 'high', '2026-08-01'::date, 1),
  ((select id from c), (select id from p2), 'Launch Dope Marketing automated direct mail (~3,000 postcards/mo)', 'Eric + Dennis', 'Marketing', 'pending', 'high', '2026-08-15'::date, 2),
  ((select id from c), (select id from p2), 'Diversify top customer concentration (target <30% top-1)', 'Owner', 'Sales', 'pending', 'high', '2026-09-01'::date, 3),
  ((select id from c), (select id from p2), 'Build $1/day Dollar-a-Day content engine (Dennis Yu framework)', 'Dennis', 'Marketing', 'pending', 'medium', '2026-09-01'::date, 4),
  ((select id from c), (select id from p2), 'Identify roll-in acquisition target (sub-$1M HVAC adjacent)', 'Eric', 'M&A', 'pending', 'medium', '2026-09-15'::date, 5),
  ((select id from c), (select id from p2), 'Document recurring service contract base (target $10K/day cash run-rate)', 'Owner', 'Operations', 'pending', 'high', '2026-10-01'::date, 6),
  ((select id from c), (select id from p2), 'Update CEO Dashboard with KPIs for buyer review', 'Daniel', 'Operations', 'pending', 'medium', '2026-10-15'::date, 7),
  ((select id from c), (select id from p2), 'Quality of earnings audit pre-work (KB CPA partner)', 'KB CPA', 'Financials', 'pending', 'high', '2026-10-25'::date, 8),

  -- ── Phase 3: Package + Sell (Months 7-9) ──
  ((select id from c), (select id from p3), 'CIM (Confidential Information Memorandum) drafted by KB', 'Eric', 'Deal', 'pending', 'high', '2026-11-15'::date, 1),
  ((select id from c), (select id from p3), 'NDA template circulated to KB curated buyer database', 'Eric', 'Deal', 'pending', 'high', '2026-11-20'::date, 2),
  ((select id from c), (select id from p3), 'First 10 buyer outreach emails sent', 'Eric', 'Deal', 'pending', 'high', '2026-11-25'::date, 3),
  ((select id from c), (select id from p3), 'First 5 buyer Zooms scheduled', 'Eric + Owner', 'Deal', 'pending', 'high', '2026-12-05'::date, 4),
  ((select id from c), (select id from p3), 'Solicit 2-3 LOIs (Letter of Intent)', 'Eric', 'Deal', 'pending', 'high', '2026-12-15'::date, 5),
  ((select id from c), (select id from p3), 'Negotiate top LOI to definitive purchase agreement', 'Eric + Legal', 'Deal', 'pending', 'high', '2027-01-05'::date, 6),
  ((select id from c), (select id from p3), 'Buyer-side QoE audit completed', 'KB CPA', 'Financials', 'pending', 'high', '2027-01-10'::date, 7),
  ((select id from c), (select id from p3), 'Tax structure finalized (Spendthrift Trust + IUL via Nexxess)', 'Eric + Tax', 'Financials', 'pending', 'high', '2027-01-15'::date, 8),
  ((select id from c), (select id from p3), 'Due diligence quarterback by KB through DD period', 'Eric', 'Deal', 'pending', 'high', '2027-01-20'::date, 9),
  ((select id from c), (select id from p3), 'Close transaction + wire instructions', 'Eric + Legal', 'Deal', 'pending', 'high', '2027-01-27'::date, 10),
  ((select id from c), (select id from p3), 'Tail period: 12-month KB advisor access post-close', 'Eric', 'Post-Close', 'pending', 'low', '2028-01-27'::date, 11)
on conflict do nothing;
