# ChiroPillar Deploy · Final 4 Steps (you do these · 30 min total)

The fork is built, branded, committed locally. To put it live at
`wagner.kingdombroker.com` you need to do four things — copy-paste ready.

---

## 1 · Create the GitHub repo (2 min)

Open https://github.com/new in a browser:

| Field | Value |
|---|---|
| Owner | `KryptoKing316` |
| Repository name | `chiropillar-app` |
| Visibility | **Private** |
| Initialize | **Leave EVERYTHING unchecked** (no README, no .gitignore, no license) |

Click **Create repository**.

Then push the local commit:

```powershell
cd c:\Users\eric\code\chiropillar-app
git remote add origin https://github.com/KryptoKing316/chiropillar-app.git
git push -u origin main
```

(Git will prompt for your GitHub login if it doesn't have credentials cached.)

---

## 2 · Create the ChiroPillar Supabase project (10 min)

Open https://supabase.com/dashboard and click **New Project**:

| Field | Value |
|---|---|
| Project name | `chiropillar` |
| Database password | (generate a strong one · save in 1Password) |
| Region | `us-east-1` (or whatever's closest to your team) |
| Pricing | Free tier is fine for MVP |

Wait ~2 min for it to provision.

Once it's up:

**a)** Run the schema · go to **SQL Editor** → paste the contents of
[`supabase/chiropillar-schema.sql`](supabase/chiropillar-schema.sql) →
**Run**.

**b)** **Update the seeded team emails** — open the file first and replace
the placeholders with Wagner's + McGrath's real emails before running the
INSERT, OR run this update after the initial seed:

```sql
UPDATE chiropillar_team SET email = '<wagner's real email>' WHERE email = 'wagner@chiropillar.com';
UPDATE chiropillar_team SET email = '<mcgrath's real email>' WHERE email = 'mcgrath@kingdombroker.com';
```

**c)** Copy the keys · go to **Project Settings → API** and grab:

- `Project URL` → save as `NEXT_PUBLIC_SUPABASE_URL`
- `anon public` key → save as `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `service_role` key → save as `SUPABASE_SERVICE_ROLE_KEY`

---

## 3 · Deploy to Vercel (10 min)

Open https://vercel.com/new and:

1. Click **Import Git Repository** → pick `KryptoKing316/chiropillar-app`
2. Project name: `chiropillar-app`
3. Framework preset: Next.js (auto-detected)
4. **Environment Variables** — add the 3 Supabase keys from step 2c:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
5. Click **Deploy**

Wait ~2 min for the build. When it's green, you'll get a default URL like
`chiropillar-app-xxx.vercel.app`. Open it and confirm:

- `/` redirects to `/intake` (the chiropractor application form)
- `/calculator` redirects to `/login` (auth working)
- The ChiroPillar logo loads in the intake page header

---

## 4 · Wire DNS · wagner.kingdombroker.com (5 min)

In the Vercel project settings → **Domains** → **Add Domain** → enter:
```
wagner.kingdombroker.com
```

Vercel will give you a CNAME target like `cname.vercel-dns.com`.

Wherever kingdombroker.com's DNS lives (Cloudflare? Netlify DNS? Namecheap?):

| Type | Name | Value | TTL |
|---|---|---|---|
| CNAME | `wagner` | `cname.vercel-dns.com` | Auto (300) |

DNS propagates in 1-5 min. Vercel will auto-issue an SSL cert.

When done, https://wagner.kingdombroker.com goes live.

---

## What's the result?

- **Public**: anyone with the URL `wagner.kingdombroker.com` lands on the
  chiropractor intake form (`/intake`).
- **Admin (you / Wagner / McGrath)**: log in with magic link to your
  whitelisted email → access the Deal Calculator (`/calculator`) with
  the "Hide Rollup" toggle, and the Intake Submissions dashboard
  (`/targets`) showing every chiropractor who's applied.

---

## When chiropillar.com is acquired

Add it as an additional Vercel domain (Vercel project → Domains →
Add Domain → `app.chiropillar.com`). Keep `wagner.kingdombroker.com`
active in parallel for the first 30-60 days to give Wagner + McGrath
a stable URL during transition.

---

## Quick smoke test (after step 4)

```
1. Open https://wagner.kingdombroker.com  → should land on /intake
2. Fill out the form with test data  → should see qualification result
3. Check Supabase Table Editor → chiropillar_targets  → row should be there
4. Open https://wagner.kingdombroker.com/calculator  → should redirect to /login
5. Log in with eric@kingdombroker.com (magic link)  → should land on /calculator
6. Toggle "Hide Rollup" on/off  → outputs should swap
7. Open /targets → your test submission should be listed
```
