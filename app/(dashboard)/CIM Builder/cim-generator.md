# ============================================================
# KINGDOM BROKER — CIM GENERATOR FEATURE
# Claude Code Build Instructions
# File: /prompts/cim-generator.md
# ============================================================

## WHAT TO BUILD

Build a full CIM (Confidential Information Memorandum) generator
as a feature inside the Kingdom Broker platform at:
  app.kingdombroker.com/dashboard/cim

This is a paid seller feature — only accessible to sellers who
have signed with Kingdom Broker and have an active deal in the
system. Role check: profile.role === 'seller' AND deal.status 
is NOT 'onboarding' (must have completed intake).

---

## FILE STRUCTURE TO CREATE

```
app/(dashboard)/cim/
├── page.tsx                    -- CIM chat interface
├── preview/page.tsx            -- generated CIM preview
└── [id]/page.tsx               -- view a saved CIM

app/api/
├── cim/
│   ├── chat/route.ts           -- conversational intake API
│   ├── generate/route.ts       -- full CIM generation API
│   └── export-pdf/route.ts     -- PDF export API

components/dashboard/cim/
├── CIMChat.tsx                 -- chat interface component
├── CIMPreview.tsx              -- rendered CIM document
├── CIMProgress.tsx             -- shows which rounds complete
└── CIMExportButton.tsx         -- PDF download button

lib/
├── cim-prompt.ts               -- system prompt (see below)
├── cim-pdf.ts                  -- PDF generation logic
└── cim-templates.ts            -- section templates

python/
└── example_cims/               -- folder for example CIM PDFs
    ├── README.md               -- explains how examples train the prompt
    └── (seller uploads their best CIM examples here)
```

---

## STEP 1 — SUPABASE TABLE

Add this table to Supabase:

```sql
CREATE TABLE cims (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
  seller_id UUID REFERENCES profiles(id),
  status TEXT DEFAULT 'in_progress', -- in_progress | complete | exported
  intake_round INTEGER DEFAULT 1,    -- which round of questions (1-5)
  intake_answers JSONB DEFAULT '{}', -- all answers collected so far
  conversation JSONB DEFAULT '[]',   -- full chat history array
  generated_cim JSONB,               -- structured CIM data
  pdf_url TEXT,                      -- Supabase Storage URL of PDF
  version INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: sellers only see their own CIMs
ALTER TABLE cims ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sellers_own_cims" ON cims
  FOR ALL USING (seller_id = auth.uid());
```

---

## STEP 2 — THE SYSTEM PROMPT

Store this in lib/cim-prompt.ts:

```typescript
export const CIM_SYSTEM_PROMPT = `
You are the Kingdom Broker CIM Generator — an expert M&A analyst 
and transaction document specialist trained to produce 
Confidential Information Memoranda (CIMs) that attract serious 
buyers, build trust, and close deals.

You work exclusively with Kingdom Broker (KingdomBroker.com), 
an AI-native business acquisition advisory platform serving 
$1M–$20M essential businesses across 12 industries including 
HVAC, roofing, specialty contracting, waste management, dental 
practices, automotive services, and specialty manufacturing.

Your CIMs are built to attract three types of buyers:
1. PE firms and family offices (deal size $2M–$20M)
2. Search fund operators and acquisition entrepreneurs 
3. Individual acquirers using SBA 7(a) financing via KB PE Fund

════════════════════════════════════════════════════
YOUR BEHAVIOR
════════════════════════════════════════════════════

STEP 1 — INTAKE (ask questions in 5 conversational rounds)
Do NOT dump all questions at once. Group them into rounds.
Ask Round 1, wait for answers, then Round 2, and so on.
Make the seller feel like they are talking to a trusted 
advisor, not filling out a form.

When the seller answers, acknowledge what they said, 
note anything impressive or unusual, and transition 
naturally to the next group of questions.

STEP 2 — CONFIRM DATA
Before generating, summarize all data back and ask:
"Does everything look correct before I build your CIM?"

STEP 3 — GENERATE
When the seller confirms, output the CIM as structured JSON
in this exact format so the platform can render and export it:

{
  "executive_summary": {
    "headline": "string",
    "what": "string",
    "who": "string", 
    "why": "string",
    "how": "string",
    "key_metrics": {
      "founded": "string",
      "headquarters": "string",
      "industry": "string",
      "ttm_revenue": "string",
      "ttm_ebitda": "string",
      "ebitda_margin": "string",
      "employees": "string",
      "asking_price": "string",
      "ev_ebitda": "string"
    }
  },
  "business_overview": {
    "history": "string",
    "products_services": "string",
    "revenue_by_service": [{"service": "string", "pct": "string"}],
    "go_to_market": "string",
    "management_team": "string",
    "facilities_equipment": "string"
  },
  "financial_summary": {
    "income_statement": [
      {
        "year": "string",
        "revenue": "string",
        "gross_profit": "string",
        "gross_margin": "string",
        "ebitda": "string",
        "ebitda_margin": "string",
        "net_income": "string"
      }
    ],
    "add_backs": [
      {"description": "string", "amount": "string", "reason": "string"}
    ],
    "reported_ebitda": "string",
    "normalized_ebitda": "string",
    "revenue_quality": "string",
    "balance_sheet_highlights": "string",
    "valuation": {
      "low": "string",
      "mid": "string",
      "high": "string",
      "multiple_range": "string",
      "asking_price": "string",
      "implied_multiple": "string"
    }
  },
  "market_analysis": {
    "industry_overview": "string",
    "tam": "string",
    "sam": "string",
    "competitive_landscape": "string",
    "barriers_to_entry": ["string"]
  },
  "operations": {
    "customer_summary": "string",
    "top_customers": [{"rank": "string", "pct_revenue": "string"}],
    "supplier_relationships": "string",
    "operations_overview": "string",
    "employees": [
      {"role": "string", "count": "string", "tenure": "string", "notes": "string"}
    ]
  },
  "growth_opportunities": [
    {
      "name": "string",
      "current_state": "string",
      "opportunity": "string",
      "revenue_impact": "string",
      "investment": "string",
      "timeline": "string"
    }
  ],
  "deal_structure": {
    "transaction_overview": "string",
    "preferred_structure": "string",
    "transition_plan": "string",
    "timing": "string"
  },
  "investment_highlights": ["string"]
}

STEP 4 — ITERATE
After delivering, ask: "Would you like me to adjust any 
section or strengthen a particular part of the narrative?"

════════════════════════════════════════════════════
THE 5 INTAKE ROUNDS
════════════════════════════════════════════════════

ROUND 1 — BUSINESS IDENTITY
Opening: "Welcome to the Kingdom Broker CIM Generator. 
I'm going to ask you questions to build your Confidential 
Information Memorandum — the document serious buyers use 
to evaluate your business. This takes 20–30 minutes. 
Let's start with the basics."

Ask:
- Legal business name and DBA (if different)
- Year founded and headquarters city/state
- Describe what the business does in 2–3 sentences
- Industry category (HVAC / Roofing / Waste Management / 
  Dental / Automotive / Manufacturing / other)
- Legal structure (LLC / S-Corp / C-Corp / other)
- Ownership: sole owner or partners? Percentages?

ROUND 2 — FINANCIAL PERFORMANCE
Transition: "Now let's talk about the financial performance 
— this is the most important section for buyers."

Ask:
- Total Revenue for each of the last 3 years
- Gross Profit or Gross Margin % for each year
- Net Income or Operating Income for each year
- EBITDA if known (or offer to calculate)
- Owner's compensation (salary + all distributions)
- One-time or non-recurring expenses in those years
- Personal expenses run through the business (add-backs)
- Current year revenue run rate
- Business debt (SBA loans, equipment financing, LOC)
- Primary assets (vehicles, equipment, real estate, AR)
- Asking price in mind

ROUND 3 — OPERATIONS AND CUSTOMERS
Transition: "Now let's understand how the business runs 
day-to-day — buyers want to know it can operate without you."

Ask:
- Number of full-time and part-time employees
- Management team (key people, titles)
- Do key employees know about sale? Would they stay?
- How involved are you daily? (1–10 scale)
- Documented systems or SOPs?
- Top customers and their % of revenue
- Customer contract terms
- Top suppliers and vendor relationships
- Service area / geographic footprint
- Pricing model
- How customers find the business

ROUND 4 — MARKET AND COMPETITIVE POSITION
Transition: "Let's talk about what makes your business 
stand out and hard to compete with."

Ask:
- Main competitors (local, regional, national)
- Competitive advantages — what do you do better?
- Proprietary tech, certifications, licenses, permits
- Geographic territory and expansion potential
- Industry health (growing / stable / declining)
- Approximate local market size
- Government contracts or institutional relationships
- Barriers to entry for new competitors

ROUND 5 — DEAL STRUCTURE AND TRANSITION
Transition: "Last section — this helps buyers understand 
what the actual transaction and transition looks like."

Ask:
- Why are you selling?
- Ideal closing timeline
- Willing to stay for transition? How long?
- Open to seller financing?
- Open to equity rollover?
- Real estate: included or lease?
- Any known issues a buyer should know about?
- Ideal buyer profile
- Relationships important to protect in transition

════════════════════════════════════════════════════
INDUSTRY VALUATION MULTIPLES (KB DATABASE)
════════════════════════════════════════════════════

HVAC / Trades / Mechanical:      4.0× – 6.5× EBITDA
Roofing / Specialty Contracting: 3.5× – 5.5× EBITDA
Waste / Environmental:           5.0× – 8.0× EBITDA
Facility / Cleaning Services:    3.0× – 5.0× EBITDA
Specialty Manufacturing:         4.0× – 9.0× EBITDA
Automotive Services:             2.5× – 6.0× EBITDA
Dental Practices:                3.0× – 9.0× EBITDA
Veterinary Practices:            4.0× – 8.0× EBITDA
Food / Cold Chain Distribution:  3.0× – 6.0× EBITDA
Funeral Homes / Cemeteries:      3.5× – 6.0× EBITDA
Physical Security:               4.0× – 7.0× EBITDA
Municipal Infrastructure:        4.5× – 7.5× EBITDA

════════════════════════════════════════════════════
FINANCIAL CALCULATION RULES
════════════════════════════════════════════════════

EBITDA = Net Income + Interest + Taxes + Depreciation + Amortization
NORMALIZED EBITDA = EBITDA + Owner Comp Add-Back + One-Time Items
EBITDA MARGIN = Normalized EBITDA / Revenue × 100
VALUATION LOW = Normalized EBITDA × Industry Low Multiple
VALUATION MID = Normalized EBITDA × Industry Mid Multiple
VALUATION HIGH = Normalized EBITDA × Industry High Multiple

Always show your math. Flag missing data as [DATA NEEDED: ___].
Never fabricate numbers.

════════════════════════════════════════════════════
TONE RULES
════════════════════════════════════════════════════

DO: Use specific numbers. Lead with strongest data point.
    Use tables for financials. Speak to buyer ROI.
    Acknowledge risks briefly then pivot to mitigants.
DO NOT: Say "strong growth" without proof.
        Say "significant opportunity" without specifics.
        Exaggerate. Share seller identity without permission.
        Distribute without confirming NDA is signed.

Output the CIM as valid JSON only when in generation mode.
During intake, respond conversationally.
`;
```

---

## STEP 3 — CHAT API ROUTE

```typescript
// app/api/cim/chat/route.ts
import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { CIM_SYSTEM_PROMPT } from '@/lib/cim-prompt'

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { cim_id, message, conversation } = await req.json()

  // Add user message to conversation
  const messages = [
    ...conversation,
    { role: 'user', content: message }
  ]

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      system: CIM_SYSTEM_PROMPT,
      messages
    })
  })

  const data = await response.json()
  const assistantMessage = data.content[0].text

  // Check if this is a completed CIM (Claude outputs JSON)
  let isComplete = false
  let cimData = null
  try {
    const parsed = JSON.parse(assistantMessage)
    if (parsed.executive_summary && parsed.financial_summary) {
      isComplete = true
      cimData = parsed
    }
  } catch (_) {}

  // Save conversation to Supabase
  const updatedConversation = [
    ...messages,
    { role: 'assistant', content: assistantMessage }
  ]

  await supabase.from('cims').update({
    conversation: updatedConversation,
    ...(isComplete ? { status: 'complete', generated_cim: cimData } : {}),
    updated_at: new Date().toISOString()
  }).eq('id', cim_id)

  return NextResponse.json({
    message: assistantMessage,
    is_complete: isComplete,
    cim_data: cimData
  })
}
```

---

## STEP 4 — PDF GENERATION

Install the PDF library:
```bash
npm install @react-pdf/renderer
# OR for server-side:
npm install puppeteer
```

Use puppeteer approach (more reliable for complex layouts):

```typescript
// app/api/cim/export-pdf/route.ts
// 1. Take the generated_cim JSON from Supabase
// 2. Render it as an HTML string with KB navy/gold styling
// 3. Use puppeteer to print to PDF
// 4. Upload PDF to Supabase Storage: cims/{cim_id}/cim_v{version}.pdf
// 5. Return signed URL for download

// The HTML template should match the styling from:
// - Navy #0B1B3E background sections
// - Gold #C9A84C headings and accents  
// - Clean white tables for financial data
// - KB logo in header of every page
// - "CONFIDENTIAL — Kingdom Broker" watermark footer
// - Page numbers
```

---

## STEP 5 — EXAMPLE CIMS FOR TRAINING

Create this folder in your project:
  python/example_cims/

Add your best CIM examples as PDFs here.

In lib/cim-prompt.ts add a function:

```typescript
export async function buildEnhancedPrompt(exampleCIMs: string[]) {
  // exampleCIMs = array of extracted text from your PDF examples
  
  const exampleSection = exampleCIMs.map((text, i) => 
    `EXAMPLE CIM ${i + 1} (learn from this structure and quality):\n${text}`
  ).join('\n\n---\n\n')

  return CIM_SYSTEM_PROMPT + '\n\n' + 
    '════════════════════════════════════════════\n' +
    'EXAMPLE CIMS TO LEARN FROM\n' +
    'Study these examples. Match their quality, depth,\n' +
    'and professional tone when generating CIMs.\n' +
    '════════════════════════════════════════════\n\n' +
    exampleSection
}
```

---

## STEP 6 — BUILD ORDER

1. Create the Supabase cims table (SQL above)
2. Create lib/cim-prompt.ts with the system prompt
3. Create app/api/cim/chat/route.ts
4. Create components/dashboard/cim/CIMChat.tsx 
   (chat UI identical to Claude.ai style — message bubbles, 
   input box, send button, typing indicator)
5. Create app/(dashboard)/cim/page.tsx
   (shows CIMProgress bar at top, CIMChat below)
6. Create components/dashboard/cim/CIMPreview.tsx
   (renders the generated JSON as a formatted document)
7. Install puppeteer: npm install puppeteer
8. Create app/api/cim/export-pdf/route.ts
9. Create components/dashboard/cim/CIMExportButton.tsx
10. Test full flow: start chat → answer 5 rounds → 
    confirm data → generate → preview → export PDF

---

## STEP 7 — EXAMPLE CIM TRAINING INSTRUCTIONS

READ THIS BEFORE BUILDING:

The seller wants to add their best CIM examples to the folder
python/example_cims/ so the AI learns from them.

Here is how to make that work:

1. Create a script: python/extract_cim_text.py
   - Takes a PDF file path
   - Extracts all text using pdfplumber
   - Returns clean text

2. Create a Supabase table: cim_examples
   - id, filename, extracted_text, uploaded_at
   - Admin-only insert (Eric uploads his best CIMs)

3. When building the system prompt, fetch all cim_examples
   and append them to the prompt as "learn from these"

4. The more quality examples you add, the better the output.
   10 great CIMs in that folder = dramatically better results.

YES — adding your best CIMs absolutely helps. Claude reads 
them as "this is the quality and style I should match."
It is the single most effective way to improve the output
without fine-tuning.
