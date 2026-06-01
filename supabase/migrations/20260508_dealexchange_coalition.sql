-- ════════════════════════════════════════════════════════════════
-- Kingdom Broker — DealExchange Coalition Platform v1
-- Brokerages share deals, AI valuations + buyer matching, fee splits
-- Day 1 of 30-day MVP build (2026-05-08)
-- ════════════════════════════════════════════════════════════════

-- ─── COALITION FIRMS ─────────────────────────────────────────────
-- Each broker firm that joins the Coalition
create table if not exists public.coalition_firms (
  id              uuid primary key default gen_random_uuid(),
  slug            text unique not null,             -- voyage-acquisitions, vant-group, etc
  firm_name       text not null,                    -- "Voyage Acquisitions"
  legal_name      text,
  hq_city         text,
  hq_state        text,
  website         text,
  logo_url        text,                             -- white-label branding
  brand_primary   text default '#0B1B3E',           -- white-label colors
  brand_accent    text default '#C9A84C',
  tier            text default 'founder',           -- founder | affiliate | self_serve
  equity_pct      numeric default 0,                -- 0.5-2% for founders
  finder_fee_pct  numeric default 0.50,             -- 50/50 default for founders
  status          text default 'invited',           -- invited | active | paused | terminated
  signed_date     date,
  primary_contact_name  text,
  primary_contact_email text,
  primary_contact_phone text,
  notes           text,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- ─── COALITION MEMBERS ───────────────────────────────────────────
-- Individual brokers under each firm (each broker = 1 row, gets a login)
create table if not exists public.coalition_members (
  id              uuid primary key default gen_random_uuid(),
  firm_id         uuid references public.coalition_firms(id) on delete cascade,
  user_id         uuid,                             -- auth.users id once they sign up
  first_name      text not null,
  last_name       text not null,
  email           text unique not null,
  phone           text,
  title           text,                             -- "Founder", "Senior Advisor", etc
  role            text default 'broker',            -- broker | admin | viewer
  is_active       boolean default true,
  created_at      timestamptz default now()
);

-- ─── COALITION DEALS ─────────────────────────────────────────────
-- A deal listed by a Coalition broker firm — visible to other firms
create table if not exists public.coalition_deals (
  id              uuid primary key default gen_random_uuid(),
  source_firm_id  uuid references public.coalition_firms(id),
  source_member_id uuid references public.coalition_members(id),
  -- Public/anonymized fields (visible to all Coalition members pre-NDA)
  public_title    text not null,                    -- "Profitable HVAC Operator — DFW"
  public_summary  text,                             -- 1-2 sentence anonymized teaser
  industry        text,
  city_region     text,                             -- "DFW Metro" not exact city
  state           text,
  revenue_band    text,                             -- "$5M-$10M"
  ebitda_band     text,                             -- "$1M-$2M"
  asking_price_band text,                           -- "$8M-$12M"
  years_in_business int,
  team_size_band  text,                             -- "20-50 employees"
  -- Private/locked fields (only after NDA approved)
  private_business_name text,
  private_address text,
  private_owner_name text,
  private_full_financials jsonb,                    -- 3yr P&Ls, normalized EBITDA, add-backs
  cim_pdf_path    text,                             -- Supabase storage path
  -- AI valuation
  ai_valuation_low  numeric,
  ai_valuation_mid  numeric,
  ai_valuation_high numeric,
  ai_naics_code   text,
  ai_multiple_low  numeric,
  ai_multiple_high numeric,
  ai_valuation_notes text,
  -- Status
  status          text default 'draft',             -- draft | listed | matched | loi | closed | withdrawn
  listed_at       timestamptz,
  closed_at       timestamptz,
  closed_price    numeric,
  buyer_firm_id   uuid references public.coalition_firms(id), -- who brought the buyer
  buyer_member_id uuid references public.coalition_members(id),
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- ─── NDA REQUESTS ────────────────────────────────────────────────
-- Broker A requests access to Broker B's deal CIM
create table if not exists public.coalition_nda_requests (
  id              uuid primary key default gen_random_uuid(),
  deal_id         uuid references public.coalition_deals(id) on delete cascade,
  requester_firm_id   uuid references public.coalition_firms(id),
  requester_member_id uuid references public.coalition_members(id),
  buyer_profile   text,                             -- "PE fund, $5-15M deals, HVAC focus"
  status          text default 'pending',           -- pending | approved | declined | expired
  approved_at     timestamptz,
  approved_by_member_id uuid references public.coalition_members(id),
  declined_reason text,
  docuseal_submission_id text,                      -- if NDA is sent via DocuSeal
  created_at      timestamptz default now(),
  expires_at      timestamptz default (now() + interval '14 days')
);

-- ─── DEAL-BUYER MATCHES ──────────────────────────────────────────
-- AI-generated buyer matches per deal (links to KB's existing buyer_leads)
create table if not exists public.coalition_buyer_matches (
  id              uuid primary key default gen_random_uuid(),
  deal_id         uuid references public.coalition_deals(id) on delete cascade,
  buyer_lead_id   uuid,                             -- references buyer_leads if exists; otherwise external
  buyer_firm_name text,
  buyer_contact_name text,
  buyer_contact_email text,
  buyer_type      text,                             -- pe | family_office | search_fund | strategic
  match_score     int,                              -- 1-100
  match_reasoning text,                             -- why the AI matched them
  industries_match jsonb,
  size_match      boolean,
  geo_match       boolean,
  status          text default 'identified',        -- identified | introduced | engaged | passed | loi | closed
  created_at      timestamptz default now()
);

-- ─── FEE SPLITS ──────────────────────────────────────────────────
-- When a Coalition deal closes, track fee distribution
create table if not exists public.coalition_fee_splits (
  id              uuid primary key default gen_random_uuid(),
  deal_id         uuid references public.coalition_deals(id) on delete cascade,
  total_fee       numeric not null,                 -- full commission collected
  -- Splits
  source_firm_id  uuid references public.coalition_firms(id),
  source_firm_amount numeric,                       -- typically 40-50%
  buyer_firm_id   uuid references public.coalition_firms(id),
  buyer_firm_amount  numeric,                       -- typically 40-50%
  platform_fee    numeric,                          -- KB takes ~5-10% as platform fee
  charity_amount  numeric,                          -- 10% to seller-designated charity
  impact_fund_amount numeric,                       -- optional voluntary post-close LP
  -- Status
  status          text default 'pending',           -- pending | paid | reconciled
  paid_at         timestamptz,
  notes           text,
  created_at      timestamptz default now()
);

-- ─── INDEXES ─────────────────────────────────────────────────────
create index if not exists idx_coalition_deals_status on public.coalition_deals(status);
create index if not exists idx_coalition_deals_source_firm on public.coalition_deals(source_firm_id);
create index if not exists idx_coalition_deals_industry on public.coalition_deals(industry);
create index if not exists idx_coalition_deals_listed_at on public.coalition_deals(listed_at desc);
create index if not exists idx_nda_requests_deal on public.coalition_nda_requests(deal_id);
create index if not exists idx_nda_requests_requester on public.coalition_nda_requests(requester_firm_id);
create index if not exists idx_buyer_matches_deal on public.coalition_buyer_matches(deal_id);
create index if not exists idx_members_firm on public.coalition_members(firm_id);
create index if not exists idx_members_email on public.coalition_members(email);

-- ─── RLS (will tune in week 2) ───────────────────────────────────
alter table public.coalition_firms enable row level security;
alter table public.coalition_members enable row level security;
alter table public.coalition_deals enable row level security;
alter table public.coalition_nda_requests enable row level security;
alter table public.coalition_buyer_matches enable row level security;
alter table public.coalition_fee_splits enable row level security;

-- Service role can do everything (for admin tools + backend logic)
create policy "service_all_firms"    on public.coalition_firms    for all using (auth.jwt() ->> 'role' = 'service_role');
create policy "service_all_members"  on public.coalition_members  for all using (auth.jwt() ->> 'role' = 'service_role');
create policy "service_all_deals"    on public.coalition_deals    for all using (auth.jwt() ->> 'role' = 'service_role');
create policy "service_all_ndas"     on public.coalition_nda_requests for all using (auth.jwt() ->> 'role' = 'service_role');
create policy "service_all_matches"  on public.coalition_buyer_matches for all using (auth.jwt() ->> 'role' = 'service_role');
create policy "service_all_fees"     on public.coalition_fee_splits for all using (auth.jwt() ->> 'role' = 'service_role');

-- Coalition members can see all firms (directory)
create policy "members_see_firms" on public.coalition_firms for select using (
  exists (select 1 from public.coalition_members m where m.user_id = auth.uid() and m.is_active = true)
);

-- Coalition members can see all listed/active deals (anonymized fields only enforced at API layer)
create policy "members_see_listed_deals" on public.coalition_deals for select using (
  status in ('listed','matched','loi') and
  exists (select 1 from public.coalition_members m where m.user_id = auth.uid() and m.is_active = true)
);

-- Members can manage their own firm's deals
create policy "members_manage_own_firm_deals" on public.coalition_deals for all using (
  exists (
    select 1 from public.coalition_members m
    where m.user_id = auth.uid()
      and m.firm_id = coalition_deals.source_firm_id
      and m.is_active = true
  )
);

-- Members can see their own NDA requests
create policy "members_see_own_ndas" on public.coalition_nda_requests for select using (
  exists (
    select 1 from public.coalition_members m
    where m.user_id = auth.uid()
      and (m.id = coalition_nda_requests.requester_member_id
           or m.firm_id = (select source_firm_id from public.coalition_deals d where d.id = coalition_nda_requests.deal_id))
  )
);

-- ─── SEED DATA: KB as founding firm ──────────────────────────────
insert into public.coalition_firms (slug, firm_name, hq_city, hq_state, tier, equity_pct, status, primary_contact_name, primary_contact_email)
values ('kingdom-broker', 'Kingdom Broker', 'Bedford', 'TX', 'founder', 0, 'active', 'Eric Skeldon', 'Eric@KingdomBroker.com')
on conflict (slug) do nothing;

-- ─── INVITE PLACEHOLDERS for Voyage + others (status=invited until they sign) ───
insert into public.coalition_firms (slug, firm_name, hq_city, hq_state, tier, equity_pct, status, primary_contact_name)
values
  ('voyage-acquisitions', 'Voyage Acquisitions', 'Houston', 'TX', 'founder', 2.0, 'invited', 'Andy Erskine'),
  ('vant-group', 'The Vant Group', 'Dallas', 'TX', 'founder', 1.5, 'invited', 'Alex Vantarakis'),
  ('empowered-business-brokers', 'Empowered Business Brokers', 'Dallas', 'TX', 'founder', 1.5, 'invited', 'Earl Kemper'),
  ('god-bless-retirement', 'God Bless Retirement', 'Fort Worth', 'TX', 'founder', 1.5, 'invited', 'Brandon Chicotsky'),
  ('calder-capital', 'Calder Capital', 'Grand Rapids', 'MI', 'founder', 1.0, 'invited', 'TBD')
on conflict (slug) do nothing;
