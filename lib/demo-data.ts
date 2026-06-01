export const DEMO_DEAL = {
  id: 'demo-001',
  business_name: 'Legacy HVAC Services',
  industry: 'Home Services',
  status: 'matched',
  asking_price: 4800000,
  ttm_revenue: 4200000,
  ttm_ebitda: 910000,
  normalized_ebitda: 1050000,
  valuation_low: 3600000,
  valuation_mid: 4400000,
  valuation_high: 5500000,
  ebitda_multiple_low: 3.9,
  ebitda_multiple_high: 5.9,
  city: 'Dallas',
  state: 'TX',
  years_in_business: 18,
  employee_count: 14,
  deal_structure: 'SBA 7(a)',
  ai_summary: 'Legacy HVAC Services represents a compelling acquisition opportunity in the Dallas-Fort Worth home services market. With 18 years of operational history, a recurring residential customer base of 2,400+ clients, and demonstrated revenue growth of 35% over three years, this business exhibits the durability that sophisticated buyers prioritize. The owner-operator model creates a clean transition opportunity for a qualified buyer with operational experience in skilled trades.',
  ai_risk_assessment: 'Primary risk is owner dependency — the current owner manages 3–4 key commercial accounts directly. Mitigated by a strong technician team averaging 7 years tenure. Revenue concentration is low (no single customer exceeds 8%). Market position is strong: 4.2-star Google rating across 680+ reviews.',
  ai_buyer_profile: 'Ideal buyer is an operationally experienced individual, search fund, or family office with prior exposure to home services or skilled trades. SBA 7(a) financing is highly likely given the business profile. A seller note of 10–15% would improve deal attractiveness significantly.',
}

export const DEMO_FINANCIALS = [
  { year: 2021, gross_revenue: 3100000, ebitda: 580000, normalized_ebitda: 720000, owner_compensation: 180000 },
  { year: 2022, gross_revenue: 3700000, ebitda: 740000, normalized_ebitda: 890000, owner_compensation: 180000 },
  { year: 2023, gross_revenue: 4200000, ebitda: 910000, normalized_ebitda: 1050000, owner_compensation: 180000 },
]

export const DEMO_ADDBACKS = [
  { description: 'Owner Salary Excess (above market rate)', amount: 180000, reason: 'Market rate for GM role is $95K — owner pays himself $275K' },
  { description: 'One-time Equipment Repair', amount: 45000, reason: 'Non-recurring emergency compressor replacement, 2023' },
  { description: 'Personal Vehicle Expense', amount: 28500, reason: 'Owner personal use vehicles expensed through business' },
  { description: 'Owner Health Insurance', amount: 18400, reason: 'Standard add-back per M&A convention' },
]

export const DEMO_BUYERS = [
  {
    id: 'b1',
    firm_name: 'Sunbelt Family Capital',
    investor_type: 'Family Office',
    deal_size_min: 2000000,
    deal_size_max: 8000000,
    geography: ['TX', 'OK', 'LA'],
    fit_score: 94,
    industry_focus: ['Home Services', 'Trades', 'B2C Services'],
    score_reason: 'Perfect geography overlap, check size alignment, active home services thesis, prior HVAC acquisition in 2022.',
    pitch_subject: 'Dallas HVAC Platform — $4.2M Revenue, 18-Year Track Record',
    pitch_email: `Hi [Contact],

We have a deal for you. An 18-year Dallas HVAC business, $4.2M revenue, $910K EBITDA normalized to $1.05M with standard add-backs.

Given your prior home services acquisition and Texas focus, this fits your buy box well:

- $4.8M asking price, 4.4x normalized EBITDA
- 2,400 recurring residential customers
- 14 licensed technicians averaging 7 years tenure
- 4.2 star Google rating across 680 reviews
- SBA 7(a) eligible, 10% down gets you in at roughly $480K equity

Happy to share the full CIM under NDA. Open to a 20-minute call this week?

Eric Skeldon
Kingdom Broker
Eric@KingdomBroker.com`,
    outreach_status: 'Contacted',
  },
  {
    id: 'b2',
    firm_name: 'Mesa Verde Acquisitions',
    investor_type: 'Search Fund',
    deal_size_min: 1500000,
    deal_size_max: 5000000,
    geography: ['TX', 'AZ', 'NM', 'CO'],
    fit_score: 91,
    industry_focus: ['Home Services', 'Field Services', 'Trades'],
    score_reason: 'Search fund operator with trades background, SBA-aligned check size, Southwest geography match.',
    pitch_subject: 'ETA-Ready HVAC Opportunity — Dallas, TX — $910K EBITDA',
    pitch_email: `Hi [Contact],

We have a deal for you. An 18-year HVAC platform in Dallas, $4.2M revenue, $910K reported EBITDA normalized to $1.05M, and a clean SBA 7(a) path.

The seller is motivated for a clean exit and open to a transition period. The team of 14 licensed technicians averages 7 years tenure. This business runs without the owner.

Asking $4.8M. SBA gets you in at roughly $480K equity. Happy to share the CIM.

Eric Skeldon
Kingdom Broker`,
    outreach_status: 'Scheduled Call',
  },
  {
    id: 'b3',
    firm_name: 'TX Home Services Rollup',
    investor_type: 'Strategic',
    deal_size_min: 3000000,
    deal_size_max: 15000000,
    geography: ['National'],
    fit_score: 88,
    industry_focus: ['HVAC', 'Plumbing', 'Electrical', 'Home Services'],
    score_reason: 'Active HVAC rollup, national buyer, platform add-on thesis, revenue base fits minimum threshold.',
    pitch_subject: 'HVAC Add-On — Dallas Market — $4.2M Revenue Platform',
    pitch_email: `Hi [Contact],

We have a deal for you. An 18-year Dallas HVAC platform, $4.2M revenue, 2,400 recurring customers, and 14 licensed techs.

Strong brand in the DFW market. Asking $4.8M at 4.4x normalized EBITDA. Happy to share full financials under NDA.

Eric Skeldon
Kingdom Broker`,
    outreach_status: 'Identified',
  },
  {
    id: 'b4',
    firm_name: 'Cypress PE Partners',
    investor_type: 'PE Fund',
    deal_size_min: 5000000,
    deal_size_max: 20000000,
    geography: ['TX', 'OK', 'LA'],
    fit_score: 82,
    industry_focus: ['Home Services', 'B2B Services', 'Trades'],
    score_reason: 'Texas-focused PE, home services thesis active, slightly above their minimum deal size — worth introducing.',
    pitch_subject: 'Home Services Platform — DFW — $4.2M Revenue',
    pitch_email: `Hi [Contact],

We have a deal for you. An 18-year HVAC business in DFW, $4.2M revenue, $910K EBITDA, asking $4.8M.

Slightly below your typical check size but a strong brand and recurring revenue base. Happy to discuss.

Eric Skeldon
Kingdom Broker`,
    outreach_status: 'Identified',
  },
  {
    id: 'b5',
    firm_name: 'Lone Star Independent Sponsor',
    investor_type: 'Independent Sponsor',
    deal_size_min: 2000000,
    deal_size_max: 6000000,
    geography: ['TX'],
    fit_score: 78,
    industry_focus: ['Home Services', 'Trades', 'Field Services'],
    score_reason: 'Texas independent sponsor, check size aligned, trades sector experience.',
    pitch_subject: 'Dallas HVAC — $4.8M Ask — SBA Eligible',
    pitch_email: `Hi [Contact],

We have a deal for you. Dallas HVAC, $4.2M revenue, $910K EBITDA, 18 years operating. SBA 7(a) eligible. Asking $4.8M.

Happy to share the CIM under NDA.

Eric Skeldon
Kingdom Broker`,
    outreach_status: 'Identified',
  },
]

export const DEMO_ACTIVITY = [
  { id: 1, event: 'Valuation analysis complete', detail: 'Normalized EBITDA: $1.05M. Range: $3.6M to $5.5M', time: '2 hours ago', icon: '📊' },
  { id: 2, event: '5 buyer matches identified', detail: 'Top match: Sunbelt Family Capital at 94% fit score', time: '2 hours ago', icon: '🎯' },
  { id: 3, event: 'Financial documents processed', detail: 'All 9 documents reviewed and ready for buyers', time: '1 day ago', icon: '📄' },
  { id: 4, event: 'Outreach sent to Sunbelt Family Capital', detail: 'Personalized pitch email delivered', time: '3 days ago', icon: '📧' },
  { id: 5, event: 'Call scheduled with Mesa Verde Acquisitions', detail: 'March 25, 2026 at 2:00 PM CT', time: '4 days ago', icon: '📅' },
  { id: 6, event: 'Deal onboarding complete', detail: 'Legacy HVAC Services added to active pipeline', time: '1 week ago', icon: '✅' },
]

export const DEMO_COMPARABLE_TRANSACTIONS = [
  { business: 'DFW HVAC Co.', revenue: '$2.1M', ebitda: '$480K', multiple: '4.1x', close: '2024', price: '$2.0M' },
  { business: 'Austin Climate Control', revenue: '$5.3M', ebitda: '$1.1M', multiple: '5.2x', close: '2023', price: '$5.8M' },
  { business: 'Houston Air Pros', revenue: '$3.2M', ebitda: '$720K', multiple: '4.6x', close: '2024', price: '$3.4M' },
]

export const DEMO_SELLER_LEADS = [
  { id: 's1', business_name: 'Precision Plumbing TX', owner_name: 'Mike Torres', owner_phone: '5122348910', owner_email: 'mike@precisionplumbing.com', industry: 'Plumbing', state: 'TX', score: 8, est_value: '$2.1M – $3.4M', status: 'Not Contacted', personalized_email: 'Hi Mike, I noticed Precision Plumbing has been serving Austin for 12+ years. We work with qualified buyers specifically looking for established trade businesses in Texas...' },
  { id: 's2', business_name: 'Gulf Coast Roofing', owner_name: 'James Broussard', owner_phone: '7135559021', owner_email: 'james@gulfcoastroofing.com', industry: 'Roofing', state: 'TX', score: 9, est_value: '$3.8M – $5.2M', status: 'Email Sent', personalized_email: 'Hi James, Gulf Coast Roofing has built a strong reputation across Houston — the kind of recurring revenue and tenure buyers pay premiums for...' },
  { id: 's3', business_name: 'Austin Dental Group', owner_name: 'Dr. Sarah Nguyen', owner_phone: '5124471833', owner_email: 'sarah@austindentalgroup.com', industry: 'Healthcare', state: 'TX', score: 7, est_value: '$1.8M – $2.9M', status: 'Not Contacted', personalized_email: 'Hi Dr. Nguyen, dental practices with strong patient retention and established staff are exactly what our healthcare-focused buyers are seeking right now...' },
  { id: 's4', business_name: 'Lone Star Landscaping', owner_name: 'Carlos Reyes', owner_phone: '9728834422', owner_email: 'carlos@lonestarlandscaping.com', industry: 'Landscaping', state: 'TX', score: 6, est_value: '$1.2M – $1.9M', status: 'Not Contacted', personalized_email: 'Hi Carlos, recurring commercial landscaping contracts are a strong foundation for a clean business sale...' },
  { id: 's5', business_name: 'DFW Auto Body', owner_name: 'Randy Kowalski', owner_phone: '9724519900', owner_email: 'randy@dfwautobody.com', industry: 'Auto Services', state: 'TX', score: 8, est_value: '$2.4M – $3.8M', status: 'Email Sent', personalized_email: 'Hi Randy, DFW Auto Body\'s insurance network relationships and 15-year reputation make this a compelling acquisition target...' },
]

export const DEMO_BUYER_LEADS = [
  { id: 'bl1', firm: 'Ridge Capital Partners', contact_name: 'William Hatch', contact_phone: '2149871100', contact_email: 'whatch@ridgecapital.com', type: 'Family Office', deal_size: '$2M – $10M', score: 9, status: 'Not Contacted', pitch_email: 'Hi William, we have a Dallas HVAC business — $4.2M revenue, $910K EBITDA, 18 years in business, SBA eligible. Given Ridge Capital\'s home services focus, this fits your buy box well...' },
  { id: 'bl2', firm: 'Apex Search Partners', contact_name: 'Jordan Mills', contact_phone: '5128833301', contact_email: 'jordan@apexsearchpartners.com', type: 'Search Fund', deal_size: '$1M – $5M', score: 8, status: 'Email Sent', pitch_email: 'Hi Jordan, ETA-ready HVAC opportunity in Dallas — 14 tenured technicians, 2,400 recurring customers, 4.2 stars. SBA 7(a) eligible, 10% down.' },
  { id: 'bl3', firm: 'Southwest Growth Equity', contact_name: 'Dana Reeves', contact_phone: '4808810033', contact_email: 'dreeves@swgrowth.com', type: 'PE Fund', deal_size: '$5M – $25M', score: 7, status: 'Not Contacted', pitch_email: 'Hi Dana, we\'re building a home services roll-up conversation and wanted to share a platform-ready HVAC business in Dallas...' },
  { id: 'bl4', firm: 'Frontier Independent Sponsor', contact_name: 'Brett Calloway', contact_phone: '7138842200', contact_email: 'brett@frontierisponsor.com', type: 'Ind. Sponsor', deal_size: '$2M – $8M', score: 9, status: 'Responded', pitch_email: 'Hi Brett, following up on our earlier conversation — the Legacy HVAC CIM is ready for NDA. $4.8M asking, seller open to 10% note.' },
  { id: 'bl5', firm: 'Valor Family Office', contact_name: 'Patricia Owens', contact_phone: '9726650044', contact_email: 'powens@valorfamily.com', type: 'Family Office', deal_size: '$3M – $15M', score: 8, status: 'Not Contacted', pitch_email: 'Hi Patricia, Valor\'s Texas focus and home services thesis align well with a Dallas HVAC deal we\'re bringing to market...' },
]
