# ChiroPillar App · Deploy Guide

**Target domain:** `wagner.kingdombroker.com` (temp) → `app.chiropillar.com` (once domain acquired)
**3-user MVP:** Dr. Scott Wagner · Eric Skeldon · Scott McGrath
**Forked from:** `app.kingdombroker.com` codebase

---

## What's built in this fork

### Public surfaces
- **`/intake`** — Chiropractor partnership application form
  - Wagner's verbatim 7 metrics (gross/net rev, new-patient avg 2-yr, retention, services, employees, geo, owner role)
  - 6-step wizard with progress bar
  - Client-side qualification logic (volume floor, retention threshold, spike detector, owner-role check)
  - "See If You Qualify" gate at the end
  - Result screen: `qualified` (✓ green) / `maybe` (◐ gold) / `not_yet` (◯ gray)
  - POST → `/api/intake` → writes to `chiropillar_targets` table

### Authenticated surfaces (admin only · 3-user whitelist)
- **`/calculator`** — Deal Calculator (ported from KB.com/chiropractor static page)
  - 11 sliders · live recalculation
  - **🎯 "Hide Rollup" toggle** — when ON, shows ONLY conservative single-office valuation (chiropractor view). When OFF, shows full platform math + Wagner 80% / KB 20% cap table at exit. Per Wagner's directive: "We don't want the client knowing that their true value is really 10 times."
  - In chiropractor-view mode, displays:
    - "Practice Valuation · Estimated Range" (capped at 3-4× multiple)
    - "What ChiroPillar partnership can do for you" (+$250K take-home framing)
  - In admin-view mode, displays:
    - Seller payout (per-office)
    - Platform economics (12+ offices)
    - Exit scenarios (Conservative 8× · Base · Premium 10×)
    - Cap table (Wagner 80% · KB 20%)

### Backend
- **`/api/intake` POST** — receives intake submissions, writes to Supabase
- **`supabase/chiropillar-schema.sql`** — 3 tables:
  - `chiropillar_targets` — intake submissions + qualification verdict
  - `chiropillar_team` — 3-user email whitelist for admin access
  - `chiropillar_scenarios` — saved calculator scenarios per user

---

## Still to do before launch

### Quick wins (1-2 hours)
- [ ] Update `components/dashboard/Sidebar.tsx` — strip KB-specific nav items, leave only:
  - Calculator
  - Targets (intake submissions list)
  - Settings
- [ ] Update `app/login/page.tsx` auth check to validate against `chiropillar_team` whitelist
- [ ] Build `app/(dashboard)/targets/page.tsx` — table view of intake submissions
- [ ] Update colors in `app/globals.css` to ChiroPillar palette (Deep Spine Blue #1F4E79, Align Blue #2E75B6, Column Stone #EBD8A6)
- [ ] Replace `public/kb-logo.png` with `public/chiropillar-logo.png` (in `kingdombroker-site/chiropractor/assets/`)

### Routes to delete (or hide from nav) — KB-specific, not relevant
The following routes were inherited from the KB fork and should either be deleted or have their sidebar links removed:
- `/buyers` `/pipeline` `/deal-stage` `/financials` `/cim` `/loi` `/exchange` `/agents` `/ambassadors` `/services` `/digital-twin` `/marketing` `/investor` `/leaderboard` `/seed-round` `/walkthrough` `/trust` `/flywheel` `/demo` `/clients/[slug]` `/overview`
- `/api/*` for: plaid, qbo, docuseal, docusign, loi, ambassadors, agents, etc.

Recommended: keep them in the codebase for now (don't break the build) but strip from the Sidebar. Delete in a later cleanup pass.

### Deployment (1 hour)
- [ ] **Create new Supabase project** (don't reuse the KB project — clean data isolation)
  - Run `supabase/chiropillar-schema.sql` in the SQL editor
  - Update emails in the seed `INSERT INTO chiropillar_team` statement (Wagner's real email, McGrath's real email)
  - Copy `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` + `SUPABASE_SERVICE_ROLE_KEY` to `.env.local`
- [ ] **Create GitHub repo** `chiropillar-app` and push:
  ```bash
  cd c:/Users/eric/code/chiropillar-app
  git init
  git add .
  git -c user.name="KryptoKing316" -c user.email="ericcskeldon@gmail.com" commit -m "NEW: ChiroPillar Wagner Family Office MVP · intake form + deal calc"
  gh repo create KryptoKing316/chiropillar-app --private --push --source .
  ```
- [ ] **Deploy to Vercel**:
  - Import the new repo at vercel.com
  - Add env vars from `.env.local`
  - Configure custom domain: `wagner.kingdombroker.com`
- [ ] **DNS**: Add CNAME record `wagner` → `cname.vercel-dns.com` on the kingdombroker.com zone (Cloudflare / wherever it lives)

### Brand polish (after launch)
- [ ] Add real Cap mascot graphics (the brand pack PNG/SVG) to `/public/` and use in the intake form hero
- [ ] Footer with confidentiality notice + Wagner Family Office attribution
- [ ] When `app.chiropillar.com` domain is acquired tomorrow, add as additional Vercel domain → migrate

---

## Architecture notes

### Why a fork (not a fresh app)
Eric explicitly requested using the `app.kingdombroker.com` code platform as the base. Forking inherits:
- Existing Supabase auth helpers + magic-link flow
- Next.js 16 + React 19 + Tailwind 4 setup
- Tested build/deploy pattern already deployed at vercel
- Component library (Sidebar, ThemeToggle, etc.) we can rebrand vs rebuild

The trade-off: ~200 inherited files of KB-specific code that don't apply. The cleanup is in passes — first pass (this one) gets the MVP shipping. Subsequent passes strip the unused routes.

### Why a separate Supabase project (not the KB one)
Clean data isolation. ChiroPillar's chiropractor-applicant data should never mix with KB's HVAC/plumbing/roofing seller deals. Different MSO/PC compliance posture (healthcare data), different exit story (sellable as standalone vertical SaaS), different RLS surface area.

### Why the "Hide Rollup" toggle in the calculator
Wagner's exact directive in the strategy call: *"We don't want the client knowing that their true value is really 10 times. We only want them to see that the current value with this one business is about three times or four times, but we know if we put all these together it's really 10 times the value."*

Implementing this as a single toggle keeps the same calculator codebase doing double duty — admin view for Wagner/Eric/McGrath sees the full platform math + cap table. Chiropractor view (toggle ON) sees only conservative single-office valuation with the $250K medical-team-uplift framing.

### Why call it ChiroPillar (not Wagner Family Office)
Per the Brand Brief PDF: the name is the moat. "ChiroPillar" = Chiro (spine) + Pillar (strong upright support). Wagner Family Office is the LEGAL ownership; ChiroPillar is the consumer-facing + chiropractor-facing brand. The app reflects this — chiropractors see "ChiroPillar partnership program," team members see "ChiroPillar Admin · Wagner Family Office" in the nav.

### Future modules (not in MVP scope)
- Per-clinic data room (financials upload, AI extraction, valuation engine, MSO/PC structuring checklist)
- Operating dashboards (uplift tracking, RCM recovery, membership conversion)
- ChiroPillar Digital MVP (Free/$9/$74 consumer app + RTM/telehealth billing)
- Digital Twin of Wagner's clinical decisioning (port from KB app's `/digital-twin` route)
- Selling-chiropractor guest accounts during DD

---

## Files added in this fork

```
chiropillar-app/
├── app/
│   ├── intake/page.tsx                  ← Wagner's 7-metric intake form
│   ├── api/intake/route.ts              ← POST handler · writes to Supabase
│   ├── (dashboard)/calculator/page.tsx  ← Deal Calculator w/ hide-rollup toggle
│   └── page.tsx                          ← (updated) redirect to /intake
├── supabase/
│   └── chiropillar-schema.sql           ← chiropillar_targets + team + scenarios
└── CHIROPILLAR-DEPLOY.md                 ← this file
```

Everything else is inherited from the KB fork as-is (sidebar, layout, auth helpers, Tailwind config, etc.) — to be customized in subsequent passes.
