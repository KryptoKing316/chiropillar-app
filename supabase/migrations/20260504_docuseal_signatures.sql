-- DocuSeal signature requests
-- Each row tracks a document KB sent for signing — could be MSA, LOI, NDA,
-- engagement letter, charity donation form, anything else needing signature.

create table if not exists public.signature_requests (
  id                  uuid primary key default gen_random_uuid(),
  client_id           uuid references public.clients(id) on delete cascade,

  -- DocuSeal-side identifiers
  docuseal_submission_id   text,         -- The submission ID returned by DocuSeal API
  docuseal_template_id     text,         -- Template ID if reusing a template
  docuseal_audit_url       text,         -- Audit trail URL for completed signing

  -- Document metadata
  document_name        text not null,   -- e.g. "AC Unlimited MSA — May 2026"
  document_type        text,            -- 'msa' | 'loi' | 'nda' | 'engagement' | 'other'
  source_url           text,            -- Optional: link back to KB-generated PDF source

  -- Signing flow
  signers              jsonb,            -- [{ name, email, role, status, signed_at, ip }]
  status               text default 'draft',  -- 'draft' | 'sent' | 'in_progress' | 'completed' | 'declined' | 'expired'

  -- Lifecycle timestamps
  sent_at              timestamptz,
  completed_at         timestamptz,
  expires_at           timestamptz,

  created_by           text,           -- email of admin who initiated
  created_at           timestamptz default now(),
  updated_at           timestamptz default now()
);

create index if not exists idx_signatures_client       on public.signature_requests(client_id);
create index if not exists idx_signatures_status       on public.signature_requests(status);
create index if not exists idx_signatures_docuseal_id  on public.signature_requests(docuseal_submission_id);

alter table public.signature_requests enable row level security;

-- Same access pattern as documents/activity_log: owner OR admin OR demo
drop policy if exists "signature_requests_select" on public.signature_requests;
create policy "signature_requests_select" on public.signature_requests for select
  using (
    client_id in (
      select id from public.clients
      where auth.jwt() ->> 'email' = owner_email
         or auth.jwt() ->> 'email' = 'eric@kingdombroker.com'
         or is_demo = true
    )
  );

-- Admin can update (for status sync from webhook)
drop policy if exists "signature_requests_admin_update" on public.signature_requests;
create policy "signature_requests_admin_update" on public.signature_requests for update
  using (auth.jwt() ->> 'email' = 'eric@kingdombroker.com')
  with check (auth.jwt() ->> 'email' = 'eric@kingdombroker.com');

-- Seed a demo signature request for demo-hvac so the portal shows a live example
insert into public.signature_requests
  (client_id, document_name, document_type, status, signers, sent_at, completed_at)
select
  c.id,
  'Master Services Agreement — Acme HVAC',
  'msa',
  'completed',
  '[{"name":"John Owner","email":"demo@kingdombroker.com","role":"signer","status":"signed","signed_at":"2026-04-27T15:30:00Z"},{"name":"Eric Skeldon","email":"eric@kingdombroker.com","role":"counter-signer","status":"signed","signed_at":"2026-04-27T16:14:00Z"}]'::jsonb,
  '2026-04-27T15:00:00Z'::timestamptz,
  '2026-04-27T16:14:00Z'::timestamptz
from public.clients c
where c.slug = 'demo-hvac'
on conflict do nothing;

insert into public.signature_requests
  (client_id, document_name, document_type, status, signers, sent_at)
select
  c.id,
  'Engagement Letter — Phase 1 Kickoff',
  'engagement',
  'in_progress',
  '[{"name":"John Owner","email":"demo@kingdombroker.com","role":"signer","status":"pending"},{"name":"Eric Skeldon","email":"eric@kingdombroker.com","role":"counter-signer","status":"pending"}]'::jsonb,
  now() - interval '2 days'
from public.clients c
where c.slug = 'demo-hvac'
on conflict do nothing;
