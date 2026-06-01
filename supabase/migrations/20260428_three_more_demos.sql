-- ════════════════════════════════════════════════════════════════
-- 3 additional demo clients: plumbing, machine shop, roofing
-- Same scaffold as demo-hvac (3 phases × ~10 tasks each)
-- ════════════════════════════════════════════════════════════════

-- ─── DEMO 2: PLUMBING ──────────────────────────────────────────
insert into public.clients (
  slug, business_name, display_name, city, state, industry,
  owner_name, owner_email, signed_date, exit_target_date,
  exit_target_price_low, exit_target_price_high, current_fair_market,
  run_rate_revenue, normalized_ebitda, current_multiple, target_multiple,
  total_owner_benefit, upfront_fee, success_fee_pct, status, is_demo
) values (
  'demo-plumbing', 'Lone Star Plumbing LLC', 'Lone Star Plumbing', 'San Antonio', 'TX', 'Residential + Commercial Plumbing',
  'Maria Owner', 'demo@kingdombroker.com',
  '2026-04-28'::date, '2027-01-28'::date,
  1200000, 1500000, 1050000,
  1200000, 300000, 3.5, 5.0,
  500000, 10000, 0.07, 'active', true
) on conflict (slug) do nothing;

with c as (select id from public.clients where slug='demo-plumbing')
insert into public.phases (client_id, phase_number, name, tagline, start_date, end_date, status, sort_order)
select c.id, 1, 'Build the Asset', 'License transition + service contract base + financial cleanup', '2026-04-28'::date, '2026-07-28'::date, 'in_progress', 1 from c
union all select c.id, 2, 'Drive the Multiple', 'Recurring revenue + truck fleet optimization + commercial mix shift', '2026-07-29'::date, '2026-10-28'::date, 'pending', 2 from c
union all select c.id, 3, 'Package + Sell', 'CIM, buyer outreach to plumbing roll-ups, LOI, close', '2026-10-29'::date, '2027-01-28'::date, 'pending', 3 from c
on conflict do nothing;

with c as (select id from public.clients where slug='demo-plumbing'),
     p1 as (select id from public.phases where client_id=(select id from c) and phase_number=1),
     p2 as (select id from public.phases where client_id=(select id from c) and phase_number=2),
     p3 as (select id from public.phases where client_id=(select id from c) and phase_number=3)
insert into public.tasks (client_id, phase_id, title, owner, category, status, priority, due_date, sort_order) values
  ((select id from c), (select id from p1), 'Master plumber + gas fitter license transition plan documented', 'Owner + Eric', 'Operations', 'in_progress', 'high', '2026-05-15'::date, 1),
  ((select id from c), (select id from p1), 'Send 3 years P&L + tax returns to KB CPA partner', 'Owner', 'Financials', 'in_progress', 'high', '2026-05-04'::date, 2),
  ((select id from c), (select id from p1), 'Audit truck fleet (12 vehicles): book value, lease vs owned', 'KB CPA', 'Operations', 'pending', 'medium', '2026-05-20'::date, 3),
  ((select id from c), (select id from p1), 'Document recurring backflow testing contracts (TX requires annual)', 'Owner', 'Operations', 'pending', 'high', '2026-05-25'::date, 4),
  ((select id from c), (select id from p1), 'Set up CallRail for residential vs commercial vs emergency line attribution', 'Daniel', 'Marketing', 'pending', 'medium', '2026-06-01'::date, 5),
  ((select id from c), (select id from p1), 'Lock NAP across Google / BBB / HomeAdvisor / Angie / Yelp', 'Dennis', 'Marketing', 'pending', 'high', '2026-06-10'::date, 6),
  ((select id from c), (select id from p1), 'Launch Google Review harvest from 800+ past customer database', 'Dennis', 'Marketing', 'pending', 'high', '2026-06-15'::date, 7),
  ((select id from c), (select id from p1), 'Document drain/sewer service vs new construction revenue split', 'Owner', 'Financials', 'pending', 'medium', '2026-06-20'::date, 8),
  ((select id from c), (select id from p1), 'Set up dispatch software (ServiceTitan or Housecall Pro)', 'Daniel + Owner', 'Operations', 'pending', 'high', '2026-07-05'::date, 9),
  ((select id from c), (select id from p1), 'Build + price annual maintenance plan ($199/yr drain + water heater check)', 'Eric', 'Product', 'pending', 'high', '2026-07-20'::date, 10),
  ((select id from c), (select id from p2), 'Hire 2 additional plumbers; train on commercial backflow', 'Owner', 'Operations', 'pending', 'high', '2026-08-15'::date, 1),
  ((select id from c), (select id from p2), 'Shift mix to 40% commercial (higher margin recurring)', 'Owner + Eric', 'Sales', 'pending', 'high', '2026-09-01'::date, 2),
  ((select id from c), (select id from p2), 'Launch Dope Marketing direct mail to neighbors of every job', 'Eric + Dennis', 'Marketing', 'pending', 'high', '2026-09-15'::date, 3),
  ((select id from c), (select id from p2), 'Diversify customer concentration (no single account >25%)', 'Owner', 'Sales', 'pending', 'high', '2026-09-25'::date, 4),
  ((select id from c), (select id from p2), 'Build Dollar-a-Day content engine (Dennis Yu framework)', 'Dennis', 'Marketing', 'pending', 'medium', '2026-10-05'::date, 5),
  ((select id from c), (select id from p2), 'Identify roll-in plumbing acquisition target ($300K-$800K rev)', 'Eric', 'M&A', 'pending', 'medium', '2026-10-15'::date, 6),
  ((select id from c), (select id from p2), 'Install QoE pre-work for buyer-side audit', 'KB CPA', 'Financials', 'pending', 'high', '2026-10-25'::date, 7),
  ((select id from c), (select id from p3), 'CIM drafted by KB and routed to plumbing roll-up acquirers', 'Eric', 'Deal', 'pending', 'high', '2026-11-15'::date, 1),
  ((select id from c), (select id from p3), 'Contact plumbing PE platforms (Wrench Group, Service Champions)', 'Eric', 'Deal', 'pending', 'high', '2026-11-25'::date, 2),
  ((select id from c), (select id from p3), '5 buyer Zooms scheduled (3 strategic + 2 PE)', 'Eric + Owner', 'Deal', 'pending', 'high', '2026-12-08'::date, 3),
  ((select id from c), (select id from p3), 'Solicit 2-3 LOIs', 'Eric', 'Deal', 'pending', 'high', '2026-12-18'::date, 4),
  ((select id from c), (select id from p3), 'Negotiate top LOI to definitive purchase agreement', 'Eric + Legal', 'Deal', 'pending', 'high', '2027-01-08'::date, 5),
  ((select id from c), (select id from p3), 'Tax structure finalized (Spendthrift Trust + IUL)', 'Eric + Tax', 'Financials', 'pending', 'high', '2027-01-18'::date, 6),
  ((select id from c), (select id from p3), 'Close transaction + wire instructions', 'Eric + Legal', 'Deal', 'pending', 'high', '2027-01-28'::date, 7)
on conflict do nothing;

-- ─── DEMO 3: MACHINE SHOP / OILFIELD MANUFACTURING ─────────────
-- Grounded in the Manufacturing/Fabrication CIM ($2M rev / $413K SDE / $1.5M ask
-- at 3.6x). Scaled up to TX Permian Basin oilfield-tooling profile.
insert into public.clients (
  slug, business_name, display_name, city, state, industry,
  owner_name, owner_email, signed_date, exit_target_date,
  exit_target_price_low, exit_target_price_high, current_fair_market,
  run_rate_revenue, normalized_ebitda, current_multiple, target_multiple,
  total_owner_benefit, upfront_fee, success_fee_pct, status, is_demo
) values (
  'demo-machineshop', 'Crown Tooling & Machine LLC', 'Crown Tooling & Machine', 'Midland', 'TX', 'Oilfield + Industrial CNC Machining',
  'Daniel Owner', 'demo@kingdombroker.com',
  '2026-04-28'::date, '2027-01-28'::date,
  3500000, 5000000, 2900000,
  3500000, 720000, 4.0, 5.5,
  900000, 10000, 0.07, 'active', true
) on conflict (slug) do nothing;

with c as (select id from public.clients where slug='demo-machineshop')
insert into public.phases (client_id, phase_number, name, tagline, start_date, end_date, status, sort_order)
select c.id, 1, 'Build the Asset', 'Customer concentration mitigation, machine asset audit, ISO/API certification', '2026-04-28'::date, '2026-07-28'::date, 'in_progress', 1 from c
union all select c.id, 2, 'Drive the Multiple', 'Diversify beyond oilfield + add MSA contract base + worker retention plan', '2026-07-29'::date, '2026-10-28'::date, 'pending', 2 from c
union all select c.id, 3, 'Package + Sell', 'CIM, strategic buyer outreach (Permian roll-ups + industrial PE), LOI, close', '2026-10-29'::date, '2027-01-28'::date, 'pending', 3 from c
on conflict do nothing;

with c as (select id from public.clients where slug='demo-machineshop'),
     p1 as (select id from public.phases where client_id=(select id from c) and phase_number=1),
     p2 as (select id from public.phases where client_id=(select id from c) and phase_number=2),
     p3 as (select id from public.phases where client_id=(select id from c) and phase_number=3)
insert into public.tasks (client_id, phase_id, title, owner, category, status, priority, due_date, sort_order) values
  ((select id from c), (select id from p1), 'Document customer concentration: top 3 oilfield ops (current ~65% of revenue)', 'KB CPA', 'Financials', 'in_progress', 'high', '2026-05-04'::date, 1),
  ((select id from c), (select id from p1), 'CNC machine asset audit (5-axis VMC, lathes, EDM, manual mills) + book value', 'KB CPA', 'Operations', 'in_progress', 'high', '2026-05-15'::date, 2),
  ((select id from c), (select id from p1), 'Achieve API Spec Q1 + ISO 9001:2015 recertification (oilfield buyers require)', 'Owner + KB Quality', 'Operations', 'pending', 'high', '2026-06-01'::date, 3),
  ((select id from c), (select id from p1), 'Drug & alcohol testing program documentation (oilfield prime contractor mandate)', 'Owner', 'Operations', 'pending', 'high', '2026-05-20'::date, 4),
  ((select id from c), (select id from p1), 'Real estate review: 18,000 sqft Midland facility (owned vs operating co separation)', 'KB CPA + Legal', 'Financials', 'pending', 'high', '2026-06-10'::date, 5),
  ((select id from c), (select id from p1), 'CNC operator retention plan (5 senior operators, target 100% post-close stay)', 'Owner', 'Operations', 'pending', 'high', '2026-06-15'::date, 6),
  ((select id from c), (select id from p1), 'ERP / scheduling system audit (E2 Shop System or upgrade to Global Shop)', 'Daniel', 'Operations', 'pending', 'medium', '2026-06-25'::date, 7),
  ((select id from c), (select id from p1), 'Document MSA contracts vs job-by-job split (target 40% MSA recurring)', 'Owner', 'Sales', 'pending', 'high', '2026-07-01'::date, 8),
  ((select id from c), (select id from p1), 'Lock NAP + industry directories (ThomasNet, Industry Net, MFG.com)', 'Dennis', 'Marketing', 'pending', 'medium', '2026-07-10'::date, 9),
  ((select id from c), (select id from p1), 'Document part library (estimated 4,500 historical custom parts) for IP value', 'Owner', 'Operations', 'pending', 'medium', '2026-07-25'::date, 10),
  ((select id from c), (select id from p2), 'Diversify into industrial / aerospace / power-gen (target <40% oilfield by exit)', 'Owner + Eric', 'Sales', 'pending', 'high', '2026-08-15'::date, 1),
  ((select id from c), (select id from p2), 'Sign 2 new MSA contracts with Permian primes (Halliburton, Baker Hughes, etc.)', 'Owner', 'Sales', 'pending', 'high', '2026-09-01'::date, 2),
  ((select id from c), (select id from p2), 'Add aerospace certification track (NADCAP heat treat + non-destructive testing)', 'Owner + Eric', 'Operations', 'pending', 'medium', '2026-09-15'::date, 3),
  ((select id from c), (select id from p2), 'Hire 2nd shift supervisor (capacity from 1-shift to 1.5-shift = 30% rev lift)', 'Owner', 'Operations', 'pending', 'high', '2026-09-25'::date, 4),
  ((select id from c), (select id from p2), 'Excess capacity production line: identify product to in-source (margin lift)', 'Owner + Eric', 'Operations', 'pending', 'medium', '2026-10-05'::date, 5),
  ((select id from c), (select id from p2), 'Identify roll-in acquisition target (sub-$1M revenue precision shop)', 'Eric', 'M&A', 'pending', 'medium', '2026-10-15'::date, 6),
  ((select id from c), (select id from p2), 'Quality of earnings + machine value appraisal (KB CPA partner + 3rd-party)', 'KB CPA', 'Financials', 'pending', 'high', '2026-10-25'::date, 7),
  ((select id from c), (select id from p3), 'CIM drafted (Permian + diversified industrial machining package)', 'Eric', 'Deal', 'pending', 'high', '2026-11-15'::date, 1),
  ((select id from c), (select id from p3), 'NDA + outreach to industrial PE platforms (CenterGate, Wind Point, Riverside)', 'Eric', 'Deal', 'pending', 'high', '2026-11-25'::date, 2),
  ((select id from c), (select id from p3), 'Outreach to strategic Permian roll-ups (W74, NOV, Forum Energy Tech)', 'Eric', 'Deal', 'pending', 'high', '2026-11-25'::date, 3),
  ((select id from c), (select id from p3), '6 buyer meetings scheduled (3 industrial PE + 2 strategic + 1 family office)', 'Eric + Owner', 'Deal', 'pending', 'high', '2026-12-08'::date, 4),
  ((select id from c), (select id from p3), 'Solicit 3-4 LOIs', 'Eric', 'Deal', 'pending', 'high', '2026-12-18'::date, 5),
  ((select id from c), (select id from p3), 'Real estate sale or lease-back negotiation (separate transaction)', 'Eric + Legal', 'Deal', 'pending', 'medium', '2026-12-20'::date, 6),
  ((select id from c), (select id from p3), 'Negotiate top LOI to definitive purchase agreement', 'Eric + Legal', 'Deal', 'pending', 'high', '2027-01-08'::date, 7),
  ((select id from c), (select id from p3), 'Tax structure: capital gains, real estate 1031 option, IUL placement', 'Eric + Tax', 'Financials', 'pending', 'high', '2027-01-15'::date, 8),
  ((select id from c), (select id from p3), 'Close transaction + machine + IP transfer + employee transition agreement', 'Eric + Legal', 'Deal', 'pending', 'high', '2027-01-28'::date, 9)
on conflict do nothing;

-- ─── DEMO 4: ROOFING ───────────────────────────────────────────
insert into public.clients (
  slug, business_name, display_name, city, state, industry,
  owner_name, owner_email, signed_date, exit_target_date,
  exit_target_price_low, exit_target_price_high, current_fair_market,
  run_rate_revenue, normalized_ebitda, current_multiple, target_multiple,
  total_owner_benefit, upfront_fee, success_fee_pct, status, is_demo
) values (
  'demo-roofing', 'Heritage Roofing Co.', 'Heritage Roofing', 'Houston', 'TX', 'Residential + Storm-Restoration Roofing',
  'Marcus Owner', 'demo@kingdombroker.com',
  '2026-04-28'::date, '2027-01-28'::date,
  3100000, 4900000, 2900000,
  4200000, 890000, 3.3, 5.5,
  900000, 10000, 0.07, 'active', true
) on conflict (slug) do nothing;

with c as (select id from public.clients where slug='demo-roofing')
insert into public.phases (client_id, phase_number, name, tagline, start_date, end_date, status, sort_order)
select c.id, 1, 'Build the Asset', 'Crew retention, manufacturer certification, insurance/storm doc cleanup', '2026-04-28'::date, '2026-07-28'::date, 'in_progress', 1 from c
union all select c.id, 2, 'Drive the Multiple', 'Retail mix shift, commercial expansion, warranty backlog cleanup', '2026-07-29'::date, '2026-10-28'::date, 'pending', 2 from c
union all select c.id, 3, 'Package + Sell', 'CIM, roofing roll-up outreach, LOI, transition', '2026-10-29'::date, '2027-01-28'::date, 'pending', 3 from c
on conflict do nothing;

with c as (select id from public.clients where slug='demo-roofing'),
     p1 as (select id from public.phases where client_id=(select id from c) and phase_number=1),
     p2 as (select id from public.phases where client_id=(select id from c) and phase_number=2),
     p3 as (select id from public.phases where client_id=(select id from c) and phase_number=3)
insert into public.tasks (client_id, phase_id, title, owner, category, status, priority, due_date, sort_order) values
  ((select id from c), (select id from p1), 'Document insurance work vs retail revenue mix (storm season impact)', 'KB CPA', 'Financials', 'in_progress', 'high', '2026-05-04'::date, 1),
  ((select id from c), (select id from p1), 'Achieve GAF Master Elite certification (top 3% of contractors)', 'Owner + Eric', 'Operations', 'pending', 'high', '2026-05-30'::date, 2),
  ((select id from c), (select id from p1), 'Crew retention plan: 6 lead foremen with post-sale retention bonuses', 'Owner', 'Operations', 'in_progress', 'high', '2026-05-25'::date, 3),
  ((select id from c), (select id from p1), 'Warranty obligations audit (lifetime + 50-year + 10-year stack)', 'KB Legal', 'Operations', 'pending', 'high', '2026-06-10'::date, 4),
  ((select id from c), (select id from p1), 'Set up CallRail with separate storm-event vs retail tracking', 'Daniel', 'Marketing', 'pending', 'medium', '2026-06-15'::date, 5),
  ((select id from c), (select id from p1), 'Lock NAP + Better Business Bureau A+ everywhere', 'Dennis', 'Marketing', 'pending', 'high', '2026-06-20'::date, 6),
  ((select id from c), (select id from p1), 'Storm photo + estimate AI tool integration (AccuLynx + EagleView)', 'Daniel + Owner', 'Operations', 'pending', 'medium', '2026-06-30'::date, 7),
  ((select id from c), (select id from p1), 'Document insurance company supplements + adjuster relationships', 'Owner', 'Operations', 'pending', 'high', '2026-07-15'::date, 8),
  ((select id from c), (select id from p1), 'Build 5-star testimonial library (24 customer videos)', 'Dennis + Owner', 'Marketing', 'pending', 'medium', '2026-07-25'::date, 9),
  ((select id from c), (select id from p2), 'Shift mix to 40% retail (less storm-cycle dependent)', 'Owner + Eric', 'Sales', 'pending', 'high', '2026-08-15'::date, 1),
  ((select id from c), (select id from p2), 'Launch commercial division (low-slope, TPO, EPDM capacity)', 'Owner', 'Operations', 'pending', 'high', '2026-09-01'::date, 2),
  ((select id from c), (select id from p2), 'Door-to-door storm canvassing playbook documented + trained', 'Owner + Eric', 'Sales', 'pending', 'medium', '2026-09-15'::date, 3),
  ((select id from c), (select id from p2), 'Diversify so no insurance carrier >30% of insurance revenue', 'Owner', 'Sales', 'pending', 'high', '2026-09-25'::date, 4),
  ((select id from c), (select id from p2), 'Build Dollar-a-Day content engine (storm prep + roof inspection content)', 'Dennis', 'Marketing', 'pending', 'medium', '2026-10-05'::date, 5),
  ((select id from c), (select id from p2), 'QoE pre-work + warranty obligation reserves documented', 'KB CPA', 'Financials', 'pending', 'high', '2026-10-25'::date, 6),
  ((select id from c), (select id from p3), 'CIM drafted (TX gulf-coast residential + commercial roofing)', 'Eric', 'Deal', 'pending', 'high', '2026-11-15'::date, 1),
  ((select id from c), (select id from p3), 'Outreach to 10 roofing roll-up acquirers (Centerline, RSI, etc.)', 'Eric', 'Deal', 'pending', 'high', '2026-11-25'::date, 2),
  ((select id from c), (select id from p3), '6 buyer Zooms scheduled (4 strategic + 2 PE)', 'Eric + Owner', 'Deal', 'pending', 'high', '2026-12-08'::date, 3),
  ((select id from c), (select id from p3), 'Solicit 3-4 LOIs', 'Eric', 'Deal', 'pending', 'high', '2026-12-18'::date, 4),
  ((select id from c), (select id from p3), 'Negotiate top LOI to definitive purchase agreement', 'Eric + Legal', 'Deal', 'pending', 'high', '2027-01-08'::date, 5),
  ((select id from c), (select id from p3), 'Tax structure: capital gains + Spendthrift Trust + IUL', 'Eric + Tax', 'Financials', 'pending', 'high', '2027-01-15'::date, 6),
  ((select id from c), (select id from p3), 'Close transaction + warranty assignment to acquirer', 'Eric + Legal', 'Deal', 'pending', 'high', '2027-01-28'::date, 7)
on conflict do nothing;
