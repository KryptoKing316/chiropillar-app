# Client Portal — Deploy Guide

What was built today:

- `/clients/[slug]` route with full server-side auth gate
- Overview tab: KPI grid, Exit Countdown, overall progress
- Scale Plan tab: 3 phases × ~30 tasks with owner / due date / status
- Static demo at `/clients/demo-hvac` (no login required)
- KB-branded magic link email template (HTML) ready to paste into Supabase
- KB favicons synced from kingdombroker.com
- Sidebar link "Client Portal Demo" added

Three one-time setup steps Eric needs to do:

## 1. Apply Supabase schema (~30 seconds)

1. Open https://supabase.com/dashboard/project/zroyvtumpankgdeuxvbj
2. Click **SQL Editor** (left sidebar)
3. Click **New query**
4. Paste the contents of `supabase/migrations/20260428_clients_phases_tasks.sql`
5. Click **Run**
6. Verify: in **Table Editor**, you should now see 3 new tables: `clients`, `phases`, `tasks`. Click `clients` — should show 1 demo row.

## 2. Customize the magic link email (~2 minutes)

1. In the Supabase Dashboard, navigate to **Authentication → Email Templates**
2. Click **Magic Link**
3. Copy the contents of `supabase/email_templates/magic_link.html` (this directory)
4. Paste into the **Message body (HTML)** field
5. Update **Subject heading** to: `Your Kingdom Broker login link`
6. Click **Save**

That's it — every magic link email from now on uses the KB-branded template (logo, navy + gold, Playfair display, faith-driven framing) instead of the generic Supabase one.

## 3. Make Troy a client (when you're ready, after the demo proves itself)

In the Supabase SQL Editor, run:

```sql
-- Replace placeholders with Troy's real data, then run
update public.clients
set
  slug         = 'ac-unlimited',
  business_name = 'A/C Unlimited Inc.',
  display_name  = 'A/C Unlimited',
  city          = 'Frisco',
  state         = 'TX',
  industry      = 'Residential HVAC',
  owner_name    = 'Troy Fewell',
  owner_email   = 'troy@acunlimitedinc.net',  -- or his real email
  is_demo       = false
where slug = 'demo-hvac';
```

Wait — that overwrites the demo. Better: insert a new row alongside the demo:

```sql
insert into public.clients (
  slug, business_name, display_name, city, state, industry,
  owner_name, owner_email, signed_date, exit_target_date,
  exit_target_price_low, exit_target_price_high, current_fair_market,
  run_rate_revenue, normalized_ebitda, current_multiple, target_multiple,
  total_owner_benefit, upfront_fee, success_fee_pct, status, is_demo
) values (
  'ac-unlimited', 'A/C Unlimited Inc.', 'A/C Unlimited', 'Frisco', 'TX', 'Residential HVAC',
  'Troy Fewell', 'troy@acunlimitedinc.net',
  '2026-04-27', '2027-01-27',
  1200000, 1500000, 850000,
  770000, 200000, 4.25, 5.5,
  650000, 10000, 0.07, 'active', false
);
-- Then copy the same task structure as demo-hvac (or generate a custom set)
```

Then send Troy a magic link from the admin panel:
1. Visit `https://app.kingdombroker.com/admin`
2. Enter Troy's email
3. Click "Send magic link"
4. He gets the KB-branded email
5. Clicks → lands on `/overview` (or `/clients/ac-unlimited` after we wire that as default)

## URLs after deploy

| URL | Audience | Auth required |
|---|---|---|
| https://app.kingdombroker.com/clients/demo-hvac | Investors, prospects | No (demo bypass) |
| https://app.kingdombroker.com/clients/ac-unlimited | Troy only | Yes (magic link) |
| https://app.kingdombroker.com/admin | Eric | Yes (admin code) |

## Tabs status

| Tab | Status |
|---|---|
| Overview | ✅ Live (KPIs + Exit Countdown + Progress) |
| Scale Plan | ✅ Live (Phase 1/2/3 with 30 tasks) |
| Financials | ⚪ Stub (Coming Soon screen) |
| Marketing | ⚪ Stub |
| Pipeline | ⚪ Stub |
| Acquisition | ⚪ Stub |
| Documents | ⚪ Stub |
| Charity | ⚪ Stub |

The 6 remaining tabs are stubs — they show "Coming Soon" and the Overview/Scale Plan are the high-value tabs for Troy + investors right now.

## What to expect when you visit /clients/demo-hvac

- Sidebar with KB Portal · Beta header
- "John Owner · Acme HVAC · Owner" identity card
- 8 nav tabs (only Overview + Scale Plan have content)
- DEMO banner across top
- Overview KPIs: Target Exit $1M-$1.5M, Days to Exit, $770K Run Rate, $200K EBITDA
- Exit Countdown 4-card grid: As-Is $850K → Target $1M-$1.5M → +$650K Lift → +$650K Total Benefit
- Overall Progress: % complete (0% on day 1, climbs as you mark tasks complete in Supabase)
- Scale Plan: Phase 1 Build / Phase 2 Drive / Phase 3 Sell with 30 tasks, owner + due date + category
