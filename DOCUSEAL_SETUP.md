# DocuSeal Setup — Kingdom Broker

DocuSeal Cloud (free tier) replaces DocuSign for all KB document signing.

Free tier limits: Unlimited documents, signers, storage. Zero per-envelope fees.

## Step 1 — Sign up for DocuSeal Cloud (5 min)

1. Go to **https://www.docuseal.com**
2. Click **Sign Up Free**
3. Use `eric@kingdombroker.com` for the account
4. Verify email
5. Set up your DocuSeal workspace (call it "Kingdom Broker")

## Step 2 — Get your API key

1. In DocuSeal, click **Settings** (top-right gear icon)
2. Click **API**
3. Copy the **API Token** (looks like a 40-character string)

## Step 3 — Add the API key to KB env

Edit `kingdom-broker/.env.local`:

```bash
# DocuSeal — replaces DocuSign for all signing
DOCUSEAL_API_URL=https://api.docuseal.com
DOCUSEAL_API_KEY=<paste-your-40-char-token-here>
DOCUSEAL_WEBHOOK_SECRET=<optional-set-later-when-you-configure-webhook>
```

Save the file. Vercel will pick this up on next deploy. For local dev, restart `npm run dev`.

## Step 4 — Configure the webhook (one-time)

DocuSeal calls KB whenever a signature changes status (sent, opened, signed, declined). Wire this:

1. In DocuSeal, **Settings → Webhooks → Add Webhook**
2. URL: `https://app.kingdombroker.com/api/webhooks/docuseal`
3. Events: check ALL of these:
   - `submission.created`
   - `submission.opened`
   - `submission.completed`
   - `submission.declined`
   - `submission.expired`
4. Click **Save**
5. (Optional) Copy the webhook secret if shown — paste into `DOCUSEAL_WEBHOOK_SECRET` in `.env.local`

## Step 5 — Upload your first templates

Templates are reusable PDF layouts (KB MSA, KB LOI, KB engagement letter, etc.) with signature fields pre-placed. You upload once, send unlimited times.

1. In DocuSeal, click **Templates → New Template**
2. Click **Upload PDF** or drag a PDF in
3. Drag signature/date/text fields onto the PDF where signers should fill
4. Set the signer roles ("Owner", "Eric", "Witness", etc.)
5. **Save** the template
6. Note the **Template ID** in the URL after save (e.g. `app.docuseal.com/templates/123` → ID is `123`)

Recommended templates to upload first:
- KB Master Services Agreement (MSA)
- KB Engagement Letter — $10K + 7%
- KB NDA (Mutual)
- KB LOI (Letter of Intent)
- KB Direct Mail Customer Authorization (charity 10% allocation)

## Step 6 — Send your first document

There are 2 ways to send a document:

### Option A — Via DocuSeal UI directly
For one-off sends. In DocuSeal:
1. Templates → click your template
2. Click **Send**
3. Add signers (name + email)
4. Click **Send to All**

DocuSeal emails them. Status updates flow back to KB via webhook automatically.

### Option B — Via KB API (programmatic)
For when you want to send from KB admin or trigger from a portal action:

```bash
curl -X POST https://app.kingdombroker.com/api/portal/signatures \
  -H "Content-Type: application/json" \
  -H "Cookie: <your-admin-session-cookie>" \
  -d '{
    "client_slug": "ac-unlimited",
    "document_name": "AC Unlimited MSA — May 2026",
    "document_type": "msa",
    "template_id": 123,
    "signers": [
      {"name": "Troy Fewell", "email": "acunlimited@yahoo.com", "role": "Owner"},
      {"name": "Eric Skeldon", "email": "eric@kingdombroker.com", "role": "Counter-signer"}
    ]
  }'
```

The signature request appears in the client portal **Documents tab → "Documents to Sign"** section. Both signers get a DocuSeal email with a signing link. Status updates live as they sign.

## What clients see in their portal

When you send a signature request to Troy:

1. Troy goes to `/clients/ac-unlimited` → Documents tab
2. Sees "Documents to Sign" section at top with the new request
3. Status badge shows "Sent" (then "In Progress" after he opens, "Signed" when complete)
4. Click "Sign Now →" button opens DocuSeal signing flow in a new tab
5. After signing, status updates instantly via webhook
6. Audit trail PDF link appears for completed documents

## Migrating existing DocuSign envelopes

The existing `/loi/[id]/sign` flow uses DocuSign. We'll migrate that in Phase 2. For now:

- **NEW signing requests** → use DocuSeal (this Phase 1)
- **EXISTING DocuSign envelopes** → continue working as before until completed
- **Phase 2** (next session) → swap LOI flow to DocuSeal templates, retire DocuSign

## Troubleshooting

| Problem | Fix |
|---|---|
| API call returns "DOCUSEAL_API_KEY not set" | Confirm `.env.local` has the key + restart dev server |
| Webhook not firing | Confirm webhook URL in DocuSeal Settings · check Vercel logs for `/api/webhooks/docuseal` |
| Signers not receiving email | Check DocuSeal Settings → Email Settings · ensure send-email is on for the submission |
| Need to revoke a sent document | DocuSeal UI → Submissions → click → Archive |
| Want custom branding on signing page | DocuSeal Settings → Branding → upload KB logo + colors (free tier) |

## Cost vs DocuSign

| | DocuSeal Free | DocuSign Starter ($15/mo/seat) |
|---|---|---|
| Documents/year | Unlimited | 100 envelopes |
| Signers/document | Unlimited | 5 signers |
| Templates | Unlimited | Limited |
| API access | Yes | Yes (paid tier) |
| Bulk send | Yes | Yes |
| Audit trail | Yes | Yes |
| Self-host option | Yes | No |
| Cost at 50 docs/mo | $0 | $180+ |

For KB at 5-20 documents/month volume, DocuSeal saves $180-300/year vs DocuSign.
