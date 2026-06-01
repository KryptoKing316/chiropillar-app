-- ════════════════════════════════════════════════════════════════
-- Portal: real Documents + Activity Log + Task editing
-- ════════════════════════════════════════════════════════════════

-- ─── DOCUMENTS ──────────────────────────────────────────────────
create table if not exists public.documents (
  id           uuid primary key default gen_random_uuid(),
  client_id    uuid references public.clients(id) on delete cascade,
  doc_group    text not null,            -- 'Tax Returns' | 'P&L Statements' | 'Bank Statements' | 'Operating Documents' | 'Engagement Outputs'
  name         text not null,            -- e.g. 'Federal Tax Return — Year 1 (2023)'
  file_path    text,                     -- Supabase Storage path (null if pending upload)
  file_size    integer,
  mime_type    text,
  status       text default 'pending',   -- 'pending' | 'uploaded' | 'processing'
  meta         text,                     -- short description / KB CPA notes
  uploaded_by  text,                     -- email of uploader
  uploaded_at  timestamptz,
  sort_order   int default 0,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

create index if not exists idx_documents_client on public.documents(client_id);
create index if not exists idx_documents_group  on public.documents(doc_group);

alter table public.documents enable row level security;

drop policy if exists "documents_via_client" on public.documents;
create policy "documents_via_client" on public.documents for select
  using (
    client_id in (
      select id from public.clients
      where auth.jwt() ->> 'email' = owner_email
         or auth.jwt() ->> 'email' = 'eric@kingdombroker.com'
         or is_demo = true
    )
  );

-- ─── ACTIVITY LOG ───────────────────────────────────────────────
create table if not exists public.activity_log (
  id          uuid primary key default gen_random_uuid(),
  client_id   uuid references public.clients(id) on delete cascade,
  who         text not null,             -- 'Eric' | 'Daniel' | 'Dennis' | 'KB CPA' | 'Owner' etc
  verb        text not null,             -- 'uploaded' | 'completed' | 'launched' | 'identified' | 'sent' | 'kicked off'
  what        text not null,             -- the thing they did
  activity_type text default 'task',     -- 'doc' | 'task' | 'launch' | 'finance' | 'deal' | 'milestone'
  metadata    jsonb,                     -- optional extra context
  created_at  timestamptz default now()
);

create index if not exists idx_activity_client_time on public.activity_log(client_id, created_at desc);

alter table public.activity_log enable row level security;

drop policy if exists "activity_via_client" on public.activity_log;
create policy "activity_via_client" on public.activity_log for select
  using (
    client_id in (
      select id from public.clients
      where auth.jwt() ->> 'email' = owner_email
         or auth.jwt() ->> 'email' = 'eric@kingdombroker.com'
         or is_demo = true
    )
  );

-- ─── ALLOW ADMIN UPDATES ON TASKS ───────────────────────────────
-- Tasks already have SELECT policy. Add an UPDATE policy for admins.
drop policy if exists "tasks_admin_update" on public.tasks;
create policy "tasks_admin_update" on public.tasks for update
  using (auth.jwt() ->> 'email' = 'eric@kingdombroker.com')
  with check (auth.jwt() ->> 'email' = 'eric@kingdombroker.com');

-- ─── STORAGE BUCKET ─────────────────────────────────────────────
-- The Supabase Studio interface may need to create the bucket separately.
-- This SQL creates it via the storage schema.
insert into storage.buckets (id, name, public)
values ('client-documents', 'client-documents', false)
on conflict (id) do nothing;

-- Storage policies: only owner_email or eric@kingdombroker.com can read their own client's docs
drop policy if exists "client_docs_owner_read" on storage.objects;
create policy "client_docs_owner_read" on storage.objects for select
  using (
    bucket_id = 'client-documents'
    and (
      auth.jwt() ->> 'email' = 'eric@kingdombroker.com'
      or (storage.foldername(name))[1] in (
        select slug from public.clients where owner_email = auth.jwt() ->> 'email'
      )
    )
  );

drop policy if exists "client_docs_admin_write" on storage.objects;
create policy "client_docs_admin_write" on storage.objects for insert
  with check (
    bucket_id = 'client-documents'
    and auth.jwt() ->> 'email' = 'eric@kingdombroker.com'
  );

drop policy if exists "client_docs_admin_update" on storage.objects;
create policy "client_docs_admin_update" on storage.objects for update
  using (
    bucket_id = 'client-documents'
    and auth.jwt() ->> 'email' = 'eric@kingdombroker.com'
  );

-- ─── SEED ACTIVITY FOR DEMO CLIENTS ─────────────────────────────
-- (Same activity feed as the hardcoded one we shipped, but now real DB rows.)
with c as (select id, slug from public.clients where slug like 'demo-%')
insert into public.activity_log (client_id, who, verb, what, activity_type, created_at)
select c.id, 'Eric', 'uploaded', 'Engagement Roadmap PDF', 'doc', now() - interval '2 hours' from c
union all select c.id, 'Daniel', 'completed', 'CallRail tracked-number setup', 'task', now() - interval '1 day' from c
union all select c.id, 'Dennis', 'launched', 'Google Review harvest campaign · 4 reviews → target 100', 'launch', now() - interval '2 days' from c
union all select c.id, 'KB CPA', 'identified', '4 add-backs in 2024 P&L (~$48K total normalization)', 'finance', now() - interval '3 days' from c
union all select c.id, 'Eric', 'sent', 'NDA outreach to 3 strategic acquirers (1 NDA signed)', 'deal', now() - interval '5 days' from c
union all select c.id, 'Eric', 'kicked off', 'Phase 1 with engagement letter signature', 'milestone', now() - interval '7 days' from c
on conflict do nothing;

-- ─── SEED DEMO DOCUMENTS ───────────────────────────────────────
with c as (select id from public.clients where slug='demo-hvac')
insert into public.documents (client_id, doc_group, name, status, meta, sort_order)
select (select id from c), 'Tax Returns', 'Federal Tax Return — Year 1 (2023)', 'uploaded', 'Form 1120-S · 47 pages · uploaded by KB CPA', 1
union all select (select id from c), 'Tax Returns', 'Federal Tax Return — Year 2 (2024)', 'uploaded', 'Form 1120-S · 52 pages · uploaded by KB CPA', 2
union all select (select id from c), 'Tax Returns', 'Federal Tax Return — Year 3 (2025)', 'processing', 'AI extraction in progress · ETA 5 min', 3
union all select (select id from c), 'P&L Statements', 'P&L — Year 1 (2023, audited)', 'uploaded', 'PDF · KB CPA reviewed · add-backs flagged', 1
union all select (select id from c), 'P&L Statements', 'P&L — Year 2 (2024, audited)', 'uploaded', 'PDF · KB CPA reviewed · 4 add-backs identified', 2
union all select (select id from c), 'P&L Statements', 'P&L — Year 3 (2025 YTD)', 'processing', 'Awaiting Q1 close from owner', 3
union all select (select id from c), 'Bank Statements', 'Operating Account — 2023 (12 months)', 'uploaded', '12 PDFs · reconciled to P&L', 1
union all select (select id from c), 'Bank Statements', 'Operating Account — 2024 (12 months)', 'uploaded', '12 PDFs · reconciled to P&L', 2
union all select (select id from c), 'Bank Statements', 'Operating Account — 2025 YTD', 'pending', 'Awaiting from owner', 3
union all select (select id from c), 'Operating Documents', 'Articles of Incorporation + EIN letter', 'uploaded', null, 1
union all select (select id from c), 'Operating Documents', 'Operating Agreement (current)', 'uploaded', null, 2
union all select (select id from c), 'Operating Documents', 'Commercial Lease (HQ)', 'uploaded', 'Term: 5 yrs remaining · option to extend', 3
union all select (select id from c), 'Operating Documents', 'General Liability + Workers Comp Insurance', 'uploaded', null, 4
union all select (select id from c), 'Operating Documents', 'Employee Handbook + HR Policies', 'pending', null, 5
union all select (select id from c), 'Operating Documents', 'Top 10 Customer Contracts (signed)', 'pending', 'Required for buyer DD', 6
union all select (select id from c), 'Engagement Outputs', 'KB Engagement Roadmap (anonymized PDF)', 'uploaded', 'Generated 2026-04-27 · shared with client', 1
union all select (select id from c), 'Engagement Outputs', 'Multiple Expansion Playbook', 'uploaded', '9-driver scorecard · updated monthly', 2
union all select (select id from c), 'Engagement Outputs', 'Pre-Call Brief PDF', 'uploaded', null, 3
union all select (select id from c), 'Engagement Outputs', 'CIM (Confidential Information Memorandum) — Phase 3', 'pending', 'Drafts in Phase 3 · ~Nov 2026', 4
on conflict do nothing;
