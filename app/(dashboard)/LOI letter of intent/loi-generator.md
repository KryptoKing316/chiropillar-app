# ============================================================
# KINGDOM BROKER — LOI GENERATOR + DOCUSIGN SIGNING
# Claude Code Build Instructions
# File: /prompts/loi-generator.md
# ============================================================

## WHAT TO BUILD

Build a complete LOI (Letter of Intent) system inside the
Kingdom Broker platform at:
  app.kingdombroker.com/dashboard/loi

This feature serves TWO users:
  1. BUYERS — generate and send an LOI to a seller on the platform
  2. ERIC (admin) — send an LOI on behalf of Kingdom Broker 
     to any business being acquired

The LOI feature includes:
  - 3 template types (see below)
  - AI-assisted fill based on deal data already in the system
  - Preview before sending
  - DocuSign embedded signing (buyer + seller both sign inside the app)
  - Status tracking on the deal card
  - PDF download of signed document
  - Email notifications to both parties

---

## ENVIRONMENT VARIABLES TO ADD

```bash
# .env.local
DOCUSIGN_INTEGRATION_KEY=        # from DocuSign developer portal
DOCUSIGN_USER_ID=                # your DocuSign user GUID
DOCUSIGN_ACCOUNT_ID=             # your DocuSign account ID
DOCUSIGN_PRIVATE_KEY=            # RSA private key (base64 encoded)
DOCUSIGN_BASE_PATH=https://na4.docusign.net/restapi   # production
# For dev/testing use: https://demo.docusign.net/restapi
```

Add to Vercel environment variables after testing.

---

## FILE STRUCTURE TO CREATE

```
app/(dashboard)/loi/
├── page.tsx                     -- LOI list + create button
├── new/page.tsx                 -- LOI generator (AI fill + edit)
├── [id]/page.tsx                -- View/sign a specific LOI
└── [id]/sign/page.tsx           -- DocuSign embedded signing page

app/api/loi/
├── generate/route.ts            -- AI generates LOI from deal data
├── create-envelope/route.ts     -- sends to DocuSign
├── signing-url/route.ts         -- gets embedded signing URL
├── status/route.ts              -- polls DocuSign for envelope status
└── download/route.ts            -- downloads signed PDF

components/dashboard/loi/
├── LOIList.tsx                  -- list of all LOIs for this deal
├── LOITemplateSelector.tsx      -- pick which template to use
├── LOIEditor.tsx                -- editable form fields before sending
├── LOIPreview.tsx               -- rendered LOI preview (read-only)
├── LOISigningModal.tsx          -- DocuSign embedded iframe/redirect
└── LOIStatusBadge.tsx           -- Draft | Sent | Viewed | Signed | Declined

lib/
├── docusign.ts                  -- DocuSign client setup
├── loi-templates.ts             -- 3 LOI template objects
└── loi-ai.ts                    -- AI auto-fill from deal data
```

---

## STEP 1 — SUPABASE TABLE

```sql
CREATE TABLE lois (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
  buyer_id UUID REFERENCES profiles(id),
  seller_id UUID REFERENCES profiles(id),
  created_by UUID REFERENCES profiles(id),  -- admin or buyer
  
  -- LOI content
  template_type TEXT,  -- all_cash | seller_financed | sba_7a
  loi_data JSONB,      -- all filled-in fields
  loi_html TEXT,       -- rendered HTML version
  
  -- DocuSign tracking
  envelope_id TEXT,    -- DocuSign envelope ID
  status TEXT DEFAULT 'draft',
  -- draft | sent | delivered | viewed | signed | declined | voided
  buyer_signed_at TIMESTAMPTZ,
  seller_signed_at TIMESTAMPTZ,
  signed_pdf_url TEXT, -- Supabase Storage URL of completed PDF
  
  -- Metadata
  sent_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,  -- LOI expiry (typically 5 business days)
  version INTEGER DEFAULT 1,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE lois ENABLE ROW LEVEL SECURITY;

-- Buyers see LOIs they created
-- Sellers see LOIs sent to them
-- Admin sees all
CREATE POLICY "loi_access" ON lois
  FOR ALL USING (
    buyer_id = auth.uid() OR 
    seller_id = auth.uid() OR
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );
```

---

## STEP 2 — THE THREE LOI TEMPLATES

Build these in lib/loi-templates.ts

Each template is a TypeScript object with:
- name: display name
- description: when to use this template
- fields: all variable fields with labels and types
- html_template: the full LOI as an HTML string with {{PLACEHOLDERS}}

### TEMPLATE 1: ALL CASH LOI
Based on the Smart Nature LOI structure from the platform.

```typescript
export const ALL_CASH_TEMPLATE = {
  name: "All Cash Offer",
  description: "Clean all-cash acquisition. No seller financing. Fast close.",
  fields: [
    { key: "date", label: "Date", type: "date" },
    { key: "seller_name", label: "Seller Name", type: "text" },
    { key: "business_name", label: "Business Name", type: "text" },
    { key: "purchase_price", label: "Purchase Price", type: "currency" },
    { key: "earnest_money", label: "Earnest Money Deposit", type: "currency" },
    { key: "due_diligence_days", label: "Due Diligence Period (days)", type: "number" },
    { key: "close_by_date", label: "Target Close Date", type: "date" },
    { key: "transition_weeks", label: "Transition Period (weeks)", type: "number" },
    { key: "noncompete_years", label: "Non-Compete Duration (years)", type: "number" },
    { key: "buyer_name", label: "Buyer Name / Entity", type: "text" },
    { key: "buyer_email", label: "Buyer Email", type: "email" },
    { key: "buyer_phone", label: "Buyer Phone", type: "tel" },
    { key: "assets_included", label: "Assets Included", type: "textarea" },
    { key: "contingencies", label: "Contingencies (if any)", type: "textarea" },
    { key: "exclusivity_days", label: "Exclusivity Period (days)", type: "number" },
  ],
  html_template: `
    [Date: {{date}}]
    CONFIDENTIAL

    {{business_name}}
    Dear {{seller_name}},

    Thank you for the discussion regarding {{business_name}}. Based on our review 
    of the information provided and our discussions, Kingdom Broker is pleased to 
    provide this Indication of Interest in pursuing the acquisition of {{business_name}}.

    In addition to our call, our research and diligence into the industry has confirmed 
    that we are an ideal partner for {{business_name}} because of our management 
    experience, ability to facilitate transition, and interest in continuing growth 
    for the business.

    Our position as a values-based buyer aligns well to your key priorities — 
    continuing and expanding on the work you have done to date, and achieving a 
    fair valuation for your business. When investing, we think in decades, not years.

    TERMS OF PROPOSAL:

    Purchase Price: {{purchase_price}} all cash at closing.

    Assets Included: {{assets_included}}

    Earnest Money: {{earnest_money}} deposited within 5 business days of LOI execution.

    Due Diligence: {{due_diligence_days}} business days from LOI execution, including 
    review of historical financial data, customer base survey, key vendor meetings, 
    employee discussions, and standard legal, accounting, and IT diligence.

    Close Date: Target closing on or before {{close_by_date}}.

    Owner Transition: All owners to remain available for {{transition_weeks}} weeks 
    post-closing for knowledge transfer and customer introductions.

    Non-Compete: All owners to sign a {{noncompete_years}}-year non-compete agreement.

    Exclusivity: Seller agrees to a {{exclusivity_days}}-day exclusive negotiation 
    period from LOI execution. Seller will not solicit or entertain other offers 
    during this period.

    This Indication of Interest is non-binding and subject to satisfactory due 
    diligence and execution of a definitive purchase agreement containing 
    representations and warranties standard for a transaction of this type.

    Please keep the terms of this Indication of Interest confidential.

    Best Regards,

    [BUYER SIGNATURE]

    {{buyer_name}}
    {{buyer_email}}
    {{buyer_phone}}

    [SELLER ACKNOWLEDGMENT SIGNATURE]

    {{seller_name}}
    {{business_name}}
  `
}
```

### TEMPLATE 2: SELLER FINANCED LOI
Based on the Smart Nature structure — mirrors what KB actually used.

```typescript
export const SELLER_FINANCED_TEMPLATE = {
  name: "Seller Financed",
  description: "Seller carries a note. Down payment + monthly payments. Fastest to close.",
  fields: [
    // All fields from Template 1, plus:
    { key: "down_payment", label: "Down Payment", type: "currency" },
    { key: "seller_note_amount", label: "Seller Note Amount", type: "currency" },
    { key: "note_term_months", label: "Note Term (months)", type: "number" },
    { key: "note_interest_rate", label: "Interest Rate (%)", type: "number" },
    { key: "monthly_payment", label: "Monthly Payment (calculated)", type: "currency" },
    { key: "note_security", label: "Note Security / Collateral", type: "textarea" },
  ],
  html_template: `
    // Same opening as Template 1...

    TERMS OF PROPOSAL:

    Purchase Price: Kingdom Broker values {{business_name}} at {{purchase_price}} 
    based on financial statements, our recent call, and business material provided, 
    in addition to review of comparable market transactions.

    Payment Structure:
    (A) Down Payment: {{down_payment}} at closing
    (B) Seller Note: {{seller_note_amount}} payable over {{note_term_months}} months 
        at {{note_interest_rate}}% interest, with monthly payments of {{monthly_payment}}
    (C) Security: The seller note shall be secured by {{note_security}}

    Because this is predominantly seller financed, we could complete this transaction 
    in a matter of weeks, rather than months.

    // Same closing terms as Template 1...
  `
}
```

### TEMPLATE 3: SBA 7(a) LOI
For qualified buyers using SBA financing via KB PE Fund + Nexxess.

```typescript
export const SBA_7A_TEMPLATE = {
  name: "SBA 7(a) Financing",
  description: "Bank/SBA loan + down payment. Larger deals $1M+. 30–90 day close.",
  fields: [
    // All fields from Template 1, plus:
    { key: "down_payment_pct", label: "Down Payment (%)", type: "number" },
    { key: "down_payment_amount", label: "Down Payment Amount", type: "currency" },
    { key: "sba_loan_amount", label: "SBA Loan Amount", type: "currency" },
    { key: "sba_lender", label: "Preferred SBA Lender (if known)", type: "text" },
    { key: "pre_approval_status", label: "Pre-Approval Status", type: "select",
      options: ["Pre-qualified", "Pre-approved", "Letter attached"] },
    { key: "kb_fund_amount", label: "KB PE Fund Contribution (if applicable)", type: "currency" },
  ],
  html_template: `
    // Same opening as Template 1...

    TERMS OF PROPOSAL:

    Purchase Price: {{purchase_price}}

    Financing Structure:
    (A) Buyer Down Payment: {{down_payment_amount}} ({{down_payment_pct}}%) at closing
    (B) SBA 7(a) Loan: {{sba_loan_amount}} through {{sba_lender}}
    (C) KB PE Fund: {{kb_fund_amount}} equity bridge (if applicable, via KB PE Fund 
        in partnership with Nexxess Business Advisors)
    
    Buyer Pre-Approval: {{pre_approval_status}}
    
    Due Diligence: {{due_diligence_days}} business days. SBA lender will conduct 
    independent appraisal and environmental review as required.
    
    Close Date: Target {{close_by_date}}, subject to SBA approval timeline 
    (typically 60–90 days from signed LOI).

    // Same closing terms as Template 1...
  `
}
```

---

## STEP 3 — AI AUTO-FILL

Build lib/loi-ai.ts:

```typescript
// Takes the deal data already in Supabase and pre-fills the LOI fields
// so the buyer/admin only needs to review and adjust, not type from scratch

export async function autoFillLOI(
  deal: Deal,
  buyer: Profile,
  template_type: 'all_cash' | 'seller_financed' | 'sba_7a'
) {
  const prompt = `
    You are filling in an LOI template for a business acquisition.
    
    Deal data:
    ${JSON.stringify(deal)}
    
    Buyer data:
    ${JSON.stringify(buyer)}
    
    Template type: ${template_type}
    
    Fill in all LOI fields as JSON. Today's date: ${new Date().toLocaleDateString()}.
    Use the deal's asking_price as purchase_price.
    Set due_diligence_days to 30 for all_cash, 21 for seller_financed, 45 for sba_7a.
    Set exclusivity_days to 10.
    Set noncompete_years to 5.
    Set transition_weeks to 4.
    
    For seller_financed: down_payment = 60% of asking_price, 
    note = remaining 40% over 24 months at 6% interest.
    Calculate monthly_payment automatically.
    
    For sba_7a: down_payment_pct = 10, calculate amounts from asking_price.
    
    Return ONLY valid JSON matching the template's field keys.
    Never invent financial data not present in the deal object.
  `
  
  // Call Claude API, parse JSON response, return filled fields
}
```

---

## STEP 4 — DOCUSIGN INTEGRATION

### 4A. Install DocuSign SDK
```bash
npm install docusign-esign
```

### 4B. Client Setup (lib/docusign.ts)
```typescript
"use server"
import * as docusign from 'docusign-esign'

export async function getDocuSignClient() {
  const apiClient = new docusign.ApiClient()
  apiClient.setBasePath(process.env.DOCUSIGN_BASE_PATH!)
  
  const privateKey = Buffer.from(process.env.DOCUSIGN_PRIVATE_KEY!, 'base64')
  
  const results = await apiClient.requestJWTUserToken(
    process.env.DOCUSIGN_INTEGRATION_KEY!,
    process.env.DOCUSIGN_USER_ID!,
    ['signature'],
    privateKey,
    3600
  )
  
  apiClient.addDefaultHeader('Authorization', `Bearer ${results.body.access_token}`)
  return apiClient
}
```

### 4C. Create Envelope and Send (app/api/loi/create-envelope/route.ts)
```typescript
// POST { loi_id }
// 1. Fetch LOI from Supabase (get loi_html, buyer, seller)
// 2. Convert HTML to PDF using puppeteer
// 3. Create DocuSign envelope with:
//    - Document: the LOI PDF
//    - Signer 1: buyer (routing order 1)
//      - Sign tab at bottom of document
//      - Date tab
//    - Signer 2: seller (routing order 2, receives after buyer signs)
//      - Sign tab at bottom of document  
//      - Date tab
// 4. Both signers have clientUserId set (for embedded signing)
// 5. Set envelope status to 'sent'
// 6. Save envelope_id to lois table
// 7. Return { envelope_id, success }

// IMPORTANT: Set clientUserId for BOTH signers
// This enables embedded signing (they sign inside the app)
// clientUserId = their Supabase user ID (any unique string works)
```

### 4D. Get Signing URL (app/api/loi/signing-url/route.ts)
```typescript
// POST { loi_id, signer_role: 'buyer' | 'seller' }
// 1. Fetch loi envelope_id from Supabase
// 2. Determine signer email/name/clientUserId based on role
// 3. Call DocuSign createRecipientView:
//    {
//      authenticationMethod: 'none',
//      clientUserId: user.id,
//      recipientId: '1' (buyer) or '2' (seller),
//      returnUrl: `${app_url}/dashboard/loi/${loi_id}/sign/complete`,
//      userName: user.full_name,
//      email: user.email
//    }
// 4. Return { signing_url }
// 5. Frontend embeds this URL in an iframe OR redirects to it
```

### 4E. Signing Page (app/(dashboard)/loi/[id]/sign/page.tsx)
```typescript
// Two approaches — use REDIRECT for mobile reliability:

// APPROACH A (recommended): Full redirect
// 1. Page loads, fetches signing URL from API
// 2. window.location.href = signing_url
// 3. User signs on DocuSign
// 4. DocuSign redirects back to returnUrl with ?event=signing_complete
// 5. App detects event, updates LOI status, shows success

// APPROACH B: Embedded iframe (desktop only)
// 1. Page loads, fetches signing URL
// 2. <iframe src={signing_url} className="w-full h-screen" />
// 3. Poll /api/loi/status every 5 seconds
// 4. When status changes to 'signed', close iframe, show success
```

### 4F. Status Webhook (app/api/loi/status/route.ts)
```typescript
// GET ?loi_id=xxx
// Poll DocuSign for envelope status
// Update lois table with current status
// When status === 'completed':
//   1. Download signed PDF from DocuSign
//   2. Upload to Supabase Storage: lois/{loi_id}/signed_loi.pdf
//   3. Save signed_pdf_url to lois table
//   4. Update deal.status to 'loi' stage
//   5. Send email to Eric: "LOI signed for [business_name]"
//   6. Log to activity_log

// DocuSign envelope statuses to handle:
// sent → delivered → completed (all signed) → voided/declined
```

---

## STEP 5 — THE LOI PAGE UI

### app/(dashboard)/loi/page.tsx
```
[+ Create New LOI] button — opens template selector

List of LOIs for this deal:
  [Smart Nature LOI]  |  All Cash  |  $42,000  |  ● Signed  |  [Download] [View]
  [HVAC Deal LOI]     |  SBA 7(a)  |  $4.8M    |  ● Sent    |  [Sign Now] [View]
  [Roofing LOI]       |  Seller Fin|  $2.1M    |  ○ Draft   |  [Edit] [Send]
```

### app/(dashboard)/loi/new/page.tsx
Three-step flow:

STEP 1: Choose Template
  [All Cash]         [Seller Financed]      [SBA 7(a)]
  Clean all-cash.    Note + down payment.   Bank/SBA loan.
  Fast close.        Fastest to close.      Larger deals.

STEP 2: Review and Edit Fields
  - Show AI pre-filled form
  - Every field is editable
  - Live preview on right side updates as user types
  - "Looks good" button proceeds to Step 3

STEP 3: Preview + Send
  - Full rendered LOI on screen
  - "Send for Signature" button
  - Confirmation: "This will send the LOI to [seller name] 
    at [seller email]. Both you and the seller will sign 
    electronically. Ready to send?"
  - [Send LOI] [Edit More]

### Signing flow for buyer:
1. Buyer clicks "Sign LOI" button
2. Page redirects to DocuSign (or opens modal with iframe)
3. Buyer reviews and signs
4. Returns to app — status updates to "Buyer Signed"
5. System automatically sends to seller for countersignature
6. Seller receives email: "You have an LOI to review and sign"
7. Seller clicks link → lands on app → signs embedded
8. Both signed → status "Completed" → PDF saved → Eric notified

---

## STEP 6 — ADMIN SEND LOI (ERIC'S FLOW)

Eric can send an LOI on behalf of Kingdom Broker to any seller
in the system without the seller being a registered platform user.

In the admin deal view, add:
  [Send LOI to Seller] button

This opens the same LOI generator but:
- Buyer fields pre-filled as "Kingdom Broker" 
- Seller email entered manually (they don't need an account)
- DocuSign sends email directly to seller's inbox
- Seller clicks the link in their email to sign
- No embedded signing needed for external sellers
- Set clientUserId = null for external signers (standard email flow)

This matches how the Smart Nature LOI worked — KB sent it to Merce 
who signed via email, not through the platform.

---

## STEP 7 — STATUS TRACKING ON DEAL CARD

On the deal overview page, show LOI status in the pipeline tracker:

Deal Pipeline:
  [Onboarding] → [Active] → [Matched] → [LOI ●] → [Due Diligence] → [Closed]

LOI status shows:
  ○ No LOI yet
  ◐ Draft created
  → Sent to buyer
  ✓ Buyer signed — pending seller
  ✓✓ Both signed — moving to due diligence
  ✗ Declined

Add to activity_log:
  "LOI created — All Cash — $4.8M"
  "LOI sent to buyer: John Smith"  
  "Buyer signed LOI — awaiting seller countersignature"
  "LOI fully executed — moving to due diligence"

---

## STEP 8 — EMAIL NOTIFICATIONS

Use Resend (npm install resend) for transactional emails:

Trigger emails:
  1. LOI sent to buyer → "You have an LOI to review at app.kingdombroker.com"
  2. Buyer signed → "Your LOI has been countersigned — seller review pending"
  3. Seller receives → "Kingdom Broker has submitted an LOI for [business]"
  4. Fully executed → "Congratulations — your LOI is fully signed"
     (send to buyer, seller, AND Eric)
  5. Eric notification → "LOI executed: [business] — [amount] — [template type]"

All emails branded in KB navy and gold.
Include "Sign Now" or "View Signed Document" CTA button.

---

## STEP 9 — BUILD ORDER

1. Supabase lois table (SQL above)
2. lib/loi-templates.ts (3 templates)
3. lib/docusign.ts (client setup)
4. lib/loi-ai.ts (auto-fill from deal data)
5. app/api/loi/generate/route.ts (AI fill API)
6. components/dashboard/loi/LOITemplateSelector.tsx
7. components/dashboard/loi/LOIEditor.tsx
8. components/dashboard/loi/LOIPreview.tsx
9. app/(dashboard)/loi/new/page.tsx (3-step flow)
10. Install puppeteer for HTML → PDF conversion
11. app/api/loi/create-envelope/route.ts (DocuSign send)
12. app/api/loi/signing-url/route.ts (get signing URL)
13. app/(dashboard)/loi/[id]/sign/page.tsx (signing page)
14. app/api/loi/status/route.ts (webhook + polling)
15. components/dashboard/loi/LOIStatusBadge.tsx
16. app/(dashboard)/loi/page.tsx (LOI list)
17. Deal card LOI status integration
18. Email notifications via Resend
19. Admin "Send LOI externally" flow
20. Test full round-trip: create → sign buyer → sign seller → PDF saved

---

## STEP 10 — DOCUSIGN ACCOUNT SETUP

Before running any of this, Eric needs to:

1. Sign up at developers.docusign.com (free developer account)
2. Create an Integration Key (Settings → Apps and Keys)
3. Enable JWT Grant:
   - Add RSA keypair
   - Copy private key → base64 encode → DOCUSIGN_PRIVATE_KEY
   - Copy Integration Key → DOCUSIGN_INTEGRATION_KEY
4. Get Account ID from top-right of DocuSign dashboard → DOCUSIGN_ACCOUNT_ID  
5. Get User ID from Settings → My Profile → API Username → DOCUSIGN_USER_ID
6. Switch to production:
   - Update DOCUSIGN_BASE_PATH to https://na4.docusign.net/restapi
   - (development uses https://demo.docusign.net/restapi)

DocuSign free tier: 1,000 envelopes/month — more than enough for KB.
Production tier: starting at ~$25/month for higher volume.

---

## DOCUSIGN vs ALTERNATIVE

DocuSign is the right choice for Kingdom Broker because:
- Legally binding in all 50 states
- Buyers and sellers recognize the brand → trust
- Nexxess and PE firms already use it
- Carl Allen community is familiar with it
- Embedded signing works seamlessly in Next.js
- Webhook/polling for status updates is reliable

Alternative if DocuSign is too complex to start:
  HelloSign / Dropbox Sign API — simpler implementation,
  same legal validity, easier Next.js integration.
  npm install @hellosign/openapi-javascript-sdk
  Swap out in lib/docusign.ts without changing any other files.

---

## SMART NATURE LOI CONTEXT

The platform has an existing LOI from December 2023 for Smart Nature
(valued at $42,000). This LOI:
- Was all-cash + seller financed ($25K down, $17K over 6 months)
- Had standard terms (5-year non-compete, 4–6 week transition)
- Was issued by Kingdom Broker on behalf of a buyer
- Used the KB logo and professional formatting

Use this as the baseline for Template 1 (Seller Financed) language
and tone. The platform should generate LOIs that look and feel 
identical to this document — professional, values-based, specific.
