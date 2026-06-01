-- ════════════════════════════════════════════════════════════════
-- Exchange Week 1.5 — LOI/PA/Custom uploads + 1,127 buyer database
-- ════════════════════════════════════════════════════════════════

-- ─── EXCHANGE SIGNATURES (NDA / LOI / PA / Custom) ──────────────
-- Any signed document on a deal lives here. NDA already tracked separately
-- in coalition_nda_requests; this table handles LOI/PA/Custom uploads.
create table if not exists public.exchange_signatures (
  id                    uuid primary key default gen_random_uuid(),
  deal_id               uuid references public.coalition_deals(id) on delete cascade,
  document_type         text not null,  -- nda | loi | purchase_agreement | custom
  document_name         text not null,  -- "LOI · ACME Holdings buying TX HVAC"
  source_firm_id        uuid references public.coalition_firms(id),
  source_member_id      uuid references public.coalition_members(id),
  pdf_path              text,  -- Supabase storage path
  docuseal_template_id  bigint,
  docuseal_submission_id bigint,
  signers               jsonb default '[]',  -- [{name, email, role, status, signed_at}]
  status                text default 'pending',  -- pending | sent | signed | declined | expired
  sent_at               timestamptz,
  completed_at          timestamptz,
  audit_url             text,
  notes                 text,
  created_at            timestamptz default now()
);

create index if not exists idx_exchange_signatures_deal on public.exchange_signatures(deal_id);
create index if not exists idx_exchange_signatures_type on public.exchange_signatures(document_type);
create index if not exists idx_exchange_signatures_status on public.exchange_signatures(status);

alter table public.exchange_signatures enable row level security;
create policy "service_all_sigs" on public.exchange_signatures
  for all using (auth.jwt() ->> 'role' = 'service_role');
create policy "members_see_own_firm_sigs" on public.exchange_signatures for select
  using (exists (
    select 1 from public.coalition_members m
    where m.user_id = auth.uid()
      and (m.firm_id = exchange_signatures.source_firm_id
           or m.firm_id = (select source_firm_id from public.coalition_deals d where d.id = exchange_signatures.deal_id))
  ));


-- ─── EXCHANGE BUYERS (migrated from Google Sheets master book) ──
-- The 1,127+ buyer database — family offices, PE, VC, search funds, strategics
create table if not exists public.exchange_buyers (
  id                    uuid primary key default gen_random_uuid(),
  firm_name             text not null,
  contact_name          text,
  contact_email         text,
  contact_phone         text,
  contact_linkedin      text,
  -- Buyer profile
  buyer_type            text,  -- pe | family_office | search_fund | strategic | individual
  hq_city               text,
  hq_state              text,
  -- Sweet spot
  check_size_min        numeric,  -- USD
  check_size_max        numeric,
  deal_size_min         numeric,
  deal_size_max         numeric,
  -- Focus
  industries            text[],  -- HVAC, Plumbing, Manufacturing, etc.
  geography             text[],  -- TX, FL, Sunbelt, National
  ebitda_min            numeric,
  ebitda_max            numeric,
  -- Meta
  source_tab            text,  -- 🏦 All Buyers | 🏛 Family Offices | 💼 PE/VC/JV Club | etc.
  source_row            int,
  notes                 text,
  is_active             boolean default true,
  last_contacted        date,
  created_at            timestamptz default now(),
  updated_at            timestamptz default now()
);

create index if not exists idx_exchange_buyers_type on public.exchange_buyers(buyer_type);
create index if not exists idx_exchange_buyers_state on public.exchange_buyers(hq_state);
create index if not exists idx_exchange_buyers_email on public.exchange_buyers(contact_email);
create index if not exists idx_exchange_buyers_industries on public.exchange_buyers using gin(industries);
create index if not exists idx_exchange_buyers_active on public.exchange_buyers(is_active);

alter table public.exchange_buyers enable row level security;
-- All coalition members can read buyers (it's the shared deal-flow asset)
create policy "members_read_buyers" on public.exchange_buyers for select
  using (exists (
    select 1 from public.coalition_members m
    where m.user_id = auth.uid() and m.is_active = true
  ));
create policy "service_all_buyers" on public.exchange_buyers
  for all using (auth.jwt() ->> 'role' = 'service_role');
