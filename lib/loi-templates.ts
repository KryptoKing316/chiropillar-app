// ============================================================
// KINGDOM BROKER — LOI TEMPLATES
// Three complete LOI templates written in plain-English,
// Boomer-friendly language. No jargon. Legacy first.
// ============================================================

export type FieldType = 'text' | 'email' | 'tel' | 'date' | 'currency' | 'number' | 'textarea' | 'select'

export interface LOIField {
  key: string
  label: string
  type: FieldType
  options?: string[]
  placeholder?: string
  section?: string
}

export interface LOITemplate {
  id: string
  name: string
  description: string
  features: string[]
  fields: LOIField[]
  html_template: string
}

export type TemplateType = 'all_cash' | 'seller_financed' | 'sba_7a'

// ============================================================
// INDUSTRY-SPECIFIC LANGUAGE
// ============================================================

export const INDUSTRY_LANGUAGE: Record<string, string> = {
  'HVAC': `We understand that an HVAC business runs on relationships — the homeowners who call you every season, the contractors who trust your team, and the technicians who know these systems better than anyone. We are committed to keeping those relationships intact.`,

  'Plumbing': `We know that a plumbing business is built on trust — homeowners who call you at 2am and contractors who rely on your crew showing up. We intend to keep every one of those relationships strong.`,

  'Electrical': `We understand that an electrical contracting business lives or dies by reputation and licensing. We will protect the license structure, retain your team, and continue the quality work {{business_name}} is known for.`,

  'Roofing': `Roofing is a relationship business. Homeowners choose who to trust with their biggest investment. We intend to honor the reputation {{business_name}} has built in {{city}} and keep the crew that built it.`,

  'Contracting': `We know that a contracting business is its reputation. Every project completed on time and on budget is why customers call back. We intend to protect everything you have built.`,

  'Waste': `We understand that waste and septic service is essential infrastructure. Customers depend on you for consistent, reliable service. We are committed to maintaining that level of service without interruption.`,

  'Septic': `We understand that septic service customers depend on reliability above all else. We will keep your service routes, your team, and your commitment to the community exactly as you have built them.`,

  'Dental': `A dental practice is built on patient trust and clinical reputation. Patients who have seen the same dentist for years will not leave easily — and we have no intention of disrupting those relationships. We will retain your clinical team and maintain the patient experience your practice is known for.`,

  'Veterinary': `Pet owners trust their veterinarian with their family members. That trust takes years to build. We intend to honor it by retaining your clinical team, your protocols, and the atmosphere that keeps clients coming back.`,

  'Manufacturing': `We understand that manufacturing is built on process, precision, and the people who keep production running. We will retain your floor team, protect your customer relationships, and invest in the equipment and processes that make {{business_name}} a reliable supplier.`,

  'Auto Repair': `Auto repair shops run on repeat customers and word-of-mouth. We know your customers by name — and so does your team. We will keep the people who built those relationships and maintain the quality of work that has made {{business_name}} a trusted name in {{city}}.`,

  'Funeral Home': `We understand that a funeral home carries a profound responsibility. Families turn to you at the hardest moments of their lives. We will honor that responsibility by retaining your staff, maintaining your facilities, and continuing to serve families in {{city}} with the same care and dignity you have always provided.`,
}

export function getIndustryParagraph(industry: string): string {
  if (!industry) return ''

  // Try exact match first
  if (INDUSTRY_LANGUAGE[industry]) return INDUSTRY_LANGUAGE[industry]

  // Try partial match
  for (const key of Object.keys(INDUSTRY_LANGUAGE)) {
    if (industry.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(industry.toLowerCase())) {
      return INDUSTRY_LANGUAGE[key]
    }
  }

  // Default paragraph
  return `We have done our homework on {{business_name}} and the {{industry}} market in {{city}}, {{state}}. We believe in what you have built, and we are committed to continuing it.`
}

// ============================================================
// SHARED OPENING — used by all 3 templates
// ============================================================

const SHARED_OPENING = `
<div class="loi-date">{{date}}</div>

<div class="loi-label">CONFIDENTIAL — PRIVATE OFFER</div>

<div class="loi-addressee">
  <strong>{{business_name}}</strong><br/>
  Attn: {{seller_name}}<br/>
  {{city}}, {{state}}
</div>

<p>Thank you for taking the time to share your business and your story with us. After {{years_in_business}} years of building {{business_name}} into the trusted operation it is today in {{city}}, {{state}}, we understand the weight of this decision — and we do not take that lightly.</p>

<p>Kingdom Broker was built for exactly this moment: helping owners like you find a buyer who will honor what you have built, take care of your team, and continue serving your customers the right way.</p>

<p>We are a values-based buyer. We think in decades, not years. Legacy first. Deal second.</p>

<p>{{industry_paragraph}}</p>

<p>Based on our review of {{business_name}}'s financial records, our conversations, and our research into your market and industry, we are pleased to submit the following offer:</p>

<div class="loi-section-header">KEEPING THIS PRIVATE</div>
<p>Before we go further — please keep this offer between us. We ask that you not share the terms with employees, customers, or vendors at this stage. We will do the same. Your team and your customers will not know anything is happening unless and until you decide to tell them.</p>
`

// ============================================================
// SHARED CLOSING — used by all 3 templates
// ============================================================

const SHARED_CLOSING = `
<div class="loi-section-header">OWNER TRANSITION</div>
<p>We will need your help to make this transition smooth. We ask that you remain available for {{transition_weeks}} weeks after closing to introduce us to key customers and vendors, walk us through your processes, and answer questions that come up. We will compensate you fairly for this time.</p>

<div class="loi-section-header">NON-COMPETE AGREEMENT</div>
<p>As part of this agreement, we ask that you agree not to open or work for a competing business in the {{city}} area for {{noncompete_years}} years after closing. This is standard in business acquisitions — it protects the goodwill you are selling us. It does not prevent you from working in a different industry or location.</p>

<div class="loi-section-header">EXCLUSIVITY</div>
<p>We ask for {{exclusivity_days}} days of exclusivity from the time you sign this letter. That means during our review period, you agree not to accept or actively pursue other offers for {{business_name}}. This allows us to invest the time and money needed to complete our review with confidence. If we fail to close for reasons within our control, you are free to pursue other buyers.</p>

<div class="loi-section-header">EMPLOYEE COMMITMENT</div>
<p>It is our intention to retain the existing team at {{business_name}}. Your {{employee_count}} employees are part of what makes this business valuable, and we intend to honor the culture and relationships you have built. We will not be making wholesale changes to your team as part of this transition.</p>

<div class="loi-section-header">KEEPING THIS BETWEEN US</div>
<p>We ask that you keep the terms of this offer confidential. We will do the same. Your employees, customers, and vendors will not know about this process unless and until you decide to tell them. Confidentiality protects both of us during this process.</p>

<div class="loi-section-header">WHAT THIS LETTER IS — AND IS NOT</div>
<p>This offer is non-binding. That means it is not a final contract — it is our commitment to work toward one in good faith. Think of it as a handshake agreement to proceed. The final transaction would be documented in a Purchase Agreement reviewed by both of our attorneys. At that point, both sides are fully protected.</p>

{{contingencies_section}}

<div class="loi-section-header">WHAT HAPPENS NEXT</div>
<ol class="loi-numbered">
  <li>If this offer looks right to you, sign below and we will begin our review process immediately.</li>
  <li>We will be in touch within 48 hours of your signature to schedule our first call and outline next steps.</li>
  <li>Most transactions like this are completed within 60–90 days of a signed offer.</li>
  <li>You can reach Eric Skeldon directly at any time: <a href="mailto:Eric@KingdomBroker.com">Eric@KingdomBroker.com</a> or 469-494-9890.</li>
</ol>

<p>We are honored to be considered as the next steward of what you have built.</p>

<p>With deep respect,</p>

<div class="loi-signature-block">
  <div class="loi-signature-line">
    <div class="signature-line-underline"></div>
    <div><strong>{{buyer_name}}</strong></div>
    <div>{{buyer_email}} | {{buyer_phone}}</div>
    <div>Date: _______________</div>
  </div>

  <div style="margin-top: 40px;">
    <div class="loi-label" style="font-size:13px;margin-bottom:12px;">SELLER ACCEPTANCE</div>
    <div class="loi-signature-line">
      <div class="signature-line-underline"></div>
      <div><strong>{{seller_name}}</strong></div>
      <div>{{business_name}}</div>
      <div>Date: _______________</div>
    </div>
  </div>
</div>
`

// ============================================================
// SHARED CSS — injected into every LOI HTML document
// ============================================================

export const LOI_DOCUMENT_CSS = `
<style>
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=DM+Sans:wght@400;500;600&display=swap');

  .loi-document {
    font-family: 'DM Sans', Georgia, serif;
    font-size: 16px;
    line-height: 1.75;
    color: #1a1a1a;
    background: #ffffff;
    max-width: 780px;
    margin: 0 auto;
    padding: 60px 64px;
  }

  .loi-document h1 {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: 26px;
    font-weight: 700;
    color: #0B1B3E;
    text-align: center;
    margin-bottom: 8px;
  }

  .loi-document h2 {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: 18px;
    color: #0B1B3E;
    margin-top: 32px;
    margin-bottom: 8px;
  }

  .loi-logo {
    text-align: center;
    margin-bottom: 32px;
  }

  .loi-logo img {
    max-width: 200px;
    height: auto;
  }

  .loi-date {
    text-align: right;
    color: #555;
    margin-bottom: 24px;
    font-size: 15px;
  }

  .loi-label {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #C9A84C;
    margin-bottom: 8px;
  }

  .loi-addressee {
    margin-bottom: 28px;
    color: #1a1a1a;
    line-height: 1.6;
  }

  .loi-section-header {
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #0B1B3E;
    border-bottom: 2px solid #C9A84C;
    padding-bottom: 6px;
    margin-top: 32px;
    margin-bottom: 14px;
  }

  .loi-terms-box {
    background: #f8f7f3;
    border-left: 4px solid #C9A84C;
    border-radius: 4px;
    padding: 24px 28px;
    margin: 20px 0;
  }

  .loi-terms-box p {
    margin: 8px 0;
  }

  .loi-terms-item {
    padding: 10px 0;
    border-bottom: 1px solid #e8e5df;
  }

  .loi-terms-item:last-child {
    border-bottom: none;
  }

  .loi-terms-item strong {
    color: #0B1B3E;
    display: block;
    margin-bottom: 3px;
  }

  .loi-numbered {
    padding-left: 22px;
  }

  .loi-numbered li {
    margin-bottom: 10px;
  }

  .loi-signature-block {
    margin-top: 48px;
  }

  .loi-signature-line {
    margin-bottom: 8px;
  }

  .signature-line-underline {
    border-bottom: 1px solid #333;
    height: 40px;
    margin-bottom: 8px;
    width: 100%;
  }

  .loi-document p {
    margin: 0 0 16px 0;
  }

  a {
    color: #0B1B3E;
  }

  @media print {
    .loi-document {
      padding: 40px;
      max-width: 100%;
    }
  }
</style>
`

// ============================================================
// TEMPLATE 1: ALL CASH
// ============================================================

export const ALL_CASH_TEMPLATE: LOITemplate = {
  id: 'all_cash',
  name: 'All Cash Offer',
  description: 'Clean offer. Full amount at closing. Sellers love certainty.',
  features: [
    'Full purchase price paid at closing',
    'No seller financing or installments',
    'Fastest and cleanest structure',
    '30-day due diligence period',
  ],
  fields: [
    { key: 'date', label: 'Offer Date', type: 'date', section: 'basics' },
    { key: 'seller_name', label: 'Seller Full Name', type: 'text', section: 'basics' },
    { key: 'seller_email', label: 'Seller Email', type: 'email', section: 'basics' },
    { key: 'seller_phone', label: 'Seller Phone', type: 'tel', section: 'basics' },
    { key: 'business_name', label: 'Business Name', type: 'text', section: 'basics' },
    { key: 'city', label: 'City', type: 'text', section: 'basics' },
    { key: 'state', label: 'State', type: 'text', section: 'basics' },
    { key: 'years_in_business', label: 'Years in Business', type: 'number', section: 'basics' },
    { key: 'industry', label: 'Industry', type: 'text', section: 'basics' },
    { key: 'employee_count', label: 'Number of Employees', type: 'number', section: 'basics' },
    { key: 'purchase_price', label: 'Purchase Price', type: 'currency', section: 'terms' },
    { key: 'earnest_money', label: 'Earnest Money Deposit', type: 'currency', section: 'terms' },
    { key: 'assets_included', label: 'Assets Included', type: 'textarea', section: 'terms', placeholder: 'e.g., All equipment, vehicles, customer lists, goodwill, trade name...' },
    { key: 'due_diligence_days', label: 'Due Diligence Period (days)', type: 'number', section: 'terms' },
    { key: 'close_by_date', label: 'Target Close Date', type: 'date', section: 'terms' },
    { key: 'transition_weeks', label: 'Transition Period (weeks)', type: 'number', section: 'terms' },
    { key: 'noncompete_years', label: 'Non-Compete Duration (years)', type: 'number', section: 'terms' },
    { key: 'exclusivity_days', label: 'Exclusivity Period (days)', type: 'number', section: 'terms' },
    { key: 'contingencies', label: 'Contingencies (optional)', type: 'textarea', section: 'terms', placeholder: 'e.g., Subject to satisfactory review of lease assignment...' },
    { key: 'buyer_name', label: 'Buyer Name / Entity', type: 'text', section: 'buyer' },
    { key: 'buyer_email', label: 'Buyer Email', type: 'email', section: 'buyer' },
    { key: 'buyer_phone', label: 'Buyer Phone', type: 'tel', section: 'buyer' },
  ],
  html_template: `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Letter of Intent — {{business_name}}</title>
${LOI_DOCUMENT_CSS}
</head>
<body>
<div class="loi-document">

  <div class="loi-logo">
    <img src="/kb-logo.png" alt="Kingdom Broker" />
  </div>

  <h1>Letter of Intent</h1>
  <p style="text-align:center;color:#555;margin-bottom:32px;">All Cash Acquisition Offer — {{business_name}}</p>

  ${SHARED_OPENING}

  <div class="loi-section-header">TERMS OF THIS OFFER</div>

  <div class="loi-terms-box">
    <div class="loi-terms-item">
      <strong>Purchase Price</strong>
      We are offering {{purchase_price}} for {{business_name}} — paid in full at closing. No installments. No seller financing. The full amount is yours on the day we close.
    </div>

    <div class="loi-terms-item">
      <strong>What Is Included</strong>
      {{assets_included}}
    </div>

    <div class="loi-terms-item">
      <strong>Earnest Money</strong>
      {{earnest_money}} deposited within 5 business days of your signature. This is held in escrow — meaning it sits in a neutral third-party account, not ours. It is applied toward the purchase price at closing. If we walk away without cause, you keep it.
    </div>

    <div class="loi-terms-item">
      <strong>Our Review Period</strong>
      {{due_diligence_days}} days from signing. During this time, we will review your financial records, meet your key team members, and confirm everything we need to close. We will move quickly and respect your time. No unnecessary disruption to your operations.
    </div>

    <div class="loi-terms-item">
      <strong>Target Closing Date</strong>
      On or before {{close_by_date}}. We are motivated to close on time.
    </div>
  </div>

  ${SHARED_CLOSING}

</div>
</body>
</html>`,
}

// ============================================================
// TEMPLATE 2: SELLER FINANCED
// ============================================================

export const SELLER_FINANCED_TEMPLATE: LOITemplate = {
  id: 'seller_financed',
  name: 'Seller Financed',
  description: 'Down payment + monthly installments paid to you. Fastest to close.',
  features: [
    'Down payment at closing — yours immediately',
    'Monthly payments go directly to you, not a bank',
    'Often closes in weeks, not months',
    'No bank approval required — no SBA timeline',
  ],
  fields: [
    { key: 'date', label: 'Offer Date', type: 'date', section: 'basics' },
    { key: 'seller_name', label: 'Seller Full Name', type: 'text', section: 'basics' },
    { key: 'seller_email', label: 'Seller Email', type: 'email', section: 'basics' },
    { key: 'seller_phone', label: 'Seller Phone', type: 'tel', section: 'basics' },
    { key: 'business_name', label: 'Business Name', type: 'text', section: 'basics' },
    { key: 'city', label: 'City', type: 'text', section: 'basics' },
    { key: 'state', label: 'State', type: 'text', section: 'basics' },
    { key: 'years_in_business', label: 'Years in Business', type: 'number', section: 'basics' },
    { key: 'industry', label: 'Industry', type: 'text', section: 'basics' },
    { key: 'employee_count', label: 'Number of Employees', type: 'number', section: 'basics' },
    { key: 'purchase_price', label: 'Total Purchase Price', type: 'currency', section: 'terms' },
    { key: 'down_payment', label: 'Down Payment (at closing)', type: 'currency', section: 'terms' },
    { key: 'seller_note_amount', label: 'Seller Note Amount', type: 'currency', section: 'terms' },
    { key: 'note_term_months', label: 'Note Term (months)', type: 'number', section: 'terms' },
    { key: 'note_interest_rate', label: 'Interest Rate (%)', type: 'number', section: 'terms' },
    { key: 'monthly_payment', label: 'Monthly Payment (calculated)', type: 'currency', section: 'terms' },
    { key: 'note_security', label: 'Note Security / Collateral', type: 'textarea', section: 'terms', placeholder: 'e.g., The assets of the business, a personal guarantee from the buyer...' },
    { key: 'earnest_money', label: 'Earnest Money Deposit', type: 'currency', section: 'terms' },
    { key: 'assets_included', label: 'Assets Included', type: 'textarea', section: 'terms', placeholder: 'e.g., All equipment, vehicles, customer lists, goodwill, trade name...' },
    { key: 'due_diligence_days', label: 'Due Diligence Period (days)', type: 'number', section: 'terms' },
    { key: 'close_by_date', label: 'Target Close Date', type: 'date', section: 'terms' },
    { key: 'transition_weeks', label: 'Transition Period (weeks)', type: 'number', section: 'terms' },
    { key: 'noncompete_years', label: 'Non-Compete Duration (years)', type: 'number', section: 'terms' },
    { key: 'exclusivity_days', label: 'Exclusivity Period (days)', type: 'number', section: 'terms' },
    { key: 'contingencies', label: 'Contingencies (optional)', type: 'textarea', section: 'terms', placeholder: 'e.g., Subject to satisfactory review of lease assignment...' },
    { key: 'buyer_name', label: 'Buyer Name / Entity', type: 'text', section: 'buyer' },
    { key: 'buyer_email', label: 'Buyer Email', type: 'email', section: 'buyer' },
    { key: 'buyer_phone', label: 'Buyer Phone', type: 'tel', section: 'buyer' },
  ],
  html_template: `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Letter of Intent — {{business_name}}</title>
${LOI_DOCUMENT_CSS}
</head>
<body>
<div class="loi-document">

  <div class="loi-logo">
    <img src="/kb-logo.png" alt="Kingdom Broker" />
  </div>

  <h1>Letter of Intent</h1>
  <p style="text-align:center;color:#555;margin-bottom:32px;">Seller Financed Acquisition Offer — {{business_name}}</p>

  ${SHARED_OPENING}

  <div class="loi-section-header">TERMS OF THIS OFFER</div>

  <div class="loi-terms-box">
    <div class="loi-terms-item">
      <strong>Purchase Price</strong>
      We are offering {{purchase_price}} for {{business_name}}, paid as follows:
      <br/><br/>
      <strong>(A) {{down_payment}} at closing</strong> — yours the day you sign the Purchase Agreement and hand over the keys.
      <br/><br/>
      <strong>(B) {{seller_note_amount}} paid directly to you in monthly installments of {{monthly_payment}}</strong> over {{note_term_months}} months at {{note_interest_rate}}% interest. Think of it like a mortgage — except we pay you, not a bank. The payments come directly into your account every month.
      <br/><br/>
      <strong>(C) Security:</strong> Your installments are protected by {{note_security}}. This means if we ever miss a payment, you have legal recourse to reclaim the business or its assets.
    </div>

    <div class="loi-terms-item">
      <strong>Why Seller Financing Works in Your Favor</strong>
      Because no bank approval is needed, this deal can close in weeks — not months. You receive your down payment immediately, and then a reliable monthly income stream. Many sellers find this structure gives them more total dollars than an all-cash offer, because seller-financed deals often command a higher price.
    </div>

    <div class="loi-terms-item">
      <strong>What Is Included</strong>
      {{assets_included}}
    </div>

    <div class="loi-terms-item">
      <strong>Earnest Money</strong>
      {{earnest_money}} deposited within 5 business days of your signature. Held in escrow (a neutral third-party account). Applied to your down payment at closing. If we walk away without cause, you keep it.
    </div>

    <div class="loi-terms-item">
      <strong>Our Review Period</strong>
      {{due_diligence_days}} days from signing to review financials and confirm our offer. We move fast with seller-financed deals — no bank timelines to wait on.
    </div>

    <div class="loi-terms-item">
      <strong>Target Closing Date</strong>
      On or before {{close_by_date}}.
    </div>
  </div>

  ${SHARED_CLOSING}

</div>
</body>
</html>`,
}

// ============================================================
// TEMPLATE 3: SBA 7(a)
// ============================================================

export const SBA_7A_TEMPLATE: LOITemplate = {
  id: 'sba_7a',
  name: 'SBA 7(a) Financing',
  description: 'Government-backed loan. Most common structure. 60-90 day close.',
  features: [
    'SBA 7(a) is the most common way businesses like yours are purchased',
    'Down payment from buyer at closing',
    'Bank carries the loan — not you',
    'Typical 60–90 day close from signed LOI',
  ],
  fields: [
    { key: 'date', label: 'Offer Date', type: 'date', section: 'basics' },
    { key: 'seller_name', label: 'Seller Full Name', type: 'text', section: 'basics' },
    { key: 'seller_email', label: 'Seller Email', type: 'email', section: 'basics' },
    { key: 'seller_phone', label: 'Seller Phone', type: 'tel', section: 'basics' },
    { key: 'business_name', label: 'Business Name', type: 'text', section: 'basics' },
    { key: 'city', label: 'City', type: 'text', section: 'basics' },
    { key: 'state', label: 'State', type: 'text', section: 'basics' },
    { key: 'years_in_business', label: 'Years in Business', type: 'number', section: 'basics' },
    { key: 'industry', label: 'Industry', type: 'text', section: 'basics' },
    { key: 'employee_count', label: 'Number of Employees', type: 'number', section: 'basics' },
    { key: 'purchase_price', label: 'Total Purchase Price', type: 'currency', section: 'terms' },
    { key: 'down_payment_pct', label: 'Down Payment (%)', type: 'number', section: 'terms' },
    { key: 'down_payment_amount', label: 'Down Payment Amount', type: 'currency', section: 'terms' },
    { key: 'sba_loan_amount', label: 'SBA Loan Amount', type: 'currency', section: 'terms' },
    { key: 'sba_lender', label: 'SBA Lender (if known)', type: 'text', section: 'terms', placeholder: 'e.g., Live Oak Bank, Huntington National Bank, or TBD' },
    { key: 'pre_approval_status', label: 'Buyer Pre-Approval Status', type: 'select', options: ['Pre-qualified', 'Pre-approved', 'Letter attached'], section: 'terms' },
    { key: 'kb_fund_amount', label: 'KB / Nexxess Fund Contribution (if applicable)', type: 'currency', section: 'terms' },
    { key: 'earnest_money', label: 'Earnest Money Deposit', type: 'currency', section: 'terms' },
    { key: 'assets_included', label: 'Assets Included', type: 'textarea', section: 'terms', placeholder: 'e.g., All equipment, vehicles, customer lists, goodwill, trade name...' },
    { key: 'due_diligence_days', label: 'Due Diligence Period (days)', type: 'number', section: 'terms' },
    { key: 'close_by_date', label: 'Target Close Date', type: 'date', section: 'terms' },
    { key: 'transition_weeks', label: 'Transition Period (weeks)', type: 'number', section: 'terms' },
    { key: 'noncompete_years', label: 'Non-Compete Duration (years)', type: 'number', section: 'terms' },
    { key: 'exclusivity_days', label: 'Exclusivity Period (days)', type: 'number', section: 'terms' },
    { key: 'contingencies', label: 'Contingencies (optional)', type: 'textarea', section: 'terms', placeholder: 'e.g., Subject to SBA lender approval, satisfactory appraisal...' },
    { key: 'buyer_name', label: 'Buyer Name / Entity', type: 'text', section: 'buyer' },
    { key: 'buyer_email', label: 'Buyer Email', type: 'email', section: 'buyer' },
    { key: 'buyer_phone', label: 'Buyer Phone', type: 'tel', section: 'buyer' },
  ],
  html_template: `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Letter of Intent — {{business_name}}</title>
${LOI_DOCUMENT_CSS}
</head>
<body>
<div class="loi-document">

  <div class="loi-logo">
    <img src="/kb-logo.png" alt="Kingdom Broker" />
  </div>

  <h1>Letter of Intent</h1>
  <p style="text-align:center;color:#555;margin-bottom:32px;">SBA 7(a) Acquisition Offer — {{business_name}}</p>

  ${SHARED_OPENING}

  <div class="loi-section-header">TERMS OF THIS OFFER</div>

  <div class="loi-terms-box">
    <div class="loi-terms-item">
      <strong>Purchase Price</strong>
      We are offering {{purchase_price}} for {{business_name}}, financed as follows:
      <br/><br/>
      <strong>(A) {{down_payment_amount}} ({{down_payment_pct}}%) from the buyer at closing.</strong> This comes directly from our funds — no waiting.
      <br/><br/>
      <strong>(B) {{sba_loan_amount}} through an SBA 7(a) loan via {{sba_lender}}.</strong> The SBA 7(a) program is the most common way small businesses are purchased in America. It is a government-backed loan — meaning a bank lends us the money, with the U.S. government guaranteeing a portion of it. You receive the full purchase price at closing. You are not carrying any risk after that point.
      <br/><br/>
      {{kb_fund_section}}
    </div>

    <div class="loi-terms-item">
      <strong>Buyer Pre-Approval Status</strong>
      {{pre_approval_status}}. We have done the work to confirm we can close this deal.
    </div>

    <div class="loi-terms-item">
      <strong>What Is Included</strong>
      {{assets_included}}
    </div>

    <div class="loi-terms-item">
      <strong>Earnest Money</strong>
      {{earnest_money}} deposited within 5 business days of your signature. Held in escrow — a neutral third-party account. Applied to the purchase price at closing.
    </div>

    <div class="loi-terms-item">
      <strong>Our Review Period</strong>
      {{due_diligence_days}} days from signing to complete our review of your financial records. The SBA lender will also conduct their own review and appraisal as part of the loan process. We will coordinate everything so it does not disrupt your daily operations.
    </div>

    <div class="loi-terms-item">
      <strong>Target Closing Date</strong>
      On or before {{close_by_date}}. SBA 7(a) loans typically close within 60–90 days of a signed offer. We will keep you informed at every step.
    </div>
  </div>

  ${SHARED_CLOSING}

</div>
</body>
</html>`,
}

// ============================================================
// TEMPLATES MAP
// ============================================================

export const TEMPLATES: Record<TemplateType, LOITemplate> = {
  all_cash: ALL_CASH_TEMPLATE,
  seller_financed: SELLER_FINANCED_TEMPLATE,
  sba_7a: SBA_7A_TEMPLATE,
}

// ============================================================
// RENDER TEMPLATE
// Replace all {{placeholders}} with actual values
// ============================================================

export function renderTemplate(template: LOITemplate, data: Record<string, string>): string {
  let html = template.html_template

  // Inject industry-specific paragraph
  const industryPara = getIndustryParagraph(data.industry || '')
  const resolvedIndustryPara = industryPara
    .replace(/\{\{business_name\}\}/g, data.business_name || 'the business')
    .replace(/\{\{city\}\}/g, data.city || '')
    .replace(/\{\{state\}\}/g, data.state || '')
    .replace(/\{\{industry\}\}/g, data.industry || '')
  html = html.replace('{{industry_paragraph}}', resolvedIndustryPara)

  // Handle contingencies section
  const contingenciesSection = data.contingencies && data.contingencies.trim()
    ? `<div class="loi-section-header">ADDITIONAL CONDITIONS</div>
       <p>${data.contingencies}</p>`
    : ''
  html = html.replace('{{contingencies_section}}', contingenciesSection)

  // Handle KB fund section for SBA template
  if (data.kb_fund_amount && data.kb_fund_amount !== '$0' && data.kb_fund_amount !== '0') {
    const kbFundSection = `<strong>(C) {{kb_fund_amount}} from the Kingdom Broker / Nexxess equity fund.</strong> This additional capital bridges any gap between the down payment and the SBA loan, ensuring a smooth and complete close.`
      .replace('{{kb_fund_amount}}', data.kb_fund_amount)
    html = html.replace('{{kb_fund_section}}', kbFundSection)
  } else {
    html = html.replace('{{kb_fund_section}}', '')
  }

  // Replace all remaining {{field}} placeholders
  for (const [key, value] of Object.entries(data)) {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g')
    html = html.replace(regex, value || '')
  }

  // Clean up any remaining unfilled placeholders
  html = html.replace(/\{\{[a-z_]+\}\}/g, '')

  return html
}
