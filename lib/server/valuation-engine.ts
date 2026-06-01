// ============================================================
// PROPRIETARY — Kingdom Broker Valuation Engine
// SERVER-SIDE ONLY. Never import this from a client component.
// This file will cause a build error if imported client-side.
// ============================================================
import 'server-only'

// Industry multiples table — 25 industries
// Source: Kingdom Broker proprietary transaction database + BizBuySell comps
// DO NOT expose these ranges publicly or to clients directly.
export const INDUSTRY_MULTIPLES: Record<string, { low: number; mid: number; high: number; notes: string }> = {
  'HVAC / Home Services':        { low: 3.5, mid: 4.5, high: 6.0, notes: 'SBA-eligible; strong recurring revenue premium' },
  'Plumbing':                    { low: 3.0, mid: 4.0, high: 5.5, notes: 'Similar to HVAC; license value important' },
  'Electrical':                  { low: 3.0, mid: 4.2, high: 5.8, notes: 'Master license adds 0.3–0.5x premium' },
  'Roofing':                     { low: 2.5, mid: 3.5, high: 5.0, notes: 'Storm-driven revenue discounted by buyers' },
  'Landscaping':                 { low: 2.5, mid: 3.5, high: 4.5, notes: 'Route density premium up to 0.5x' },
  'Auto Repair':                 { low: 2.5, mid: 3.5, high: 4.5, notes: 'Real estate included adds premium' },
  'Dental Practice':             { low: 4.0, mid: 5.5, high: 7.5, notes: 'DSO acquisition targets 5–8x; insurance mix matters' },
  'Medical Practice':            { low: 3.5, mid: 5.0, high: 7.0, notes: 'Specialty premium; payer mix critical' },
  'Veterinary':                  { low: 4.0, mid: 5.5, high: 8.0, notes: 'Consolidation frenzy; strategic buyers pay 6–10x' },
  'Optometry':                   { low: 3.5, mid: 5.0, high: 7.0, notes: 'VSP/insurance mix matters; DSO interest high' },
  'Insurance Agency':            { low: 1.5, mid: 2.5, high: 3.5, notes: 'Priced on revenue (1.5–3x rev) not EBITDA' },
  'Accounting / CPA Firm':       { low: 4.0, mid: 5.0, high: 7.0, notes: 'Client retention key; 1-year earnout common' },
  'IT / MSP':                    { low: 4.0, mid: 5.5, high: 8.0, notes: 'MRR premium; recurring revenue 6–10x' },
  'Digital Marketing Agency':    { low: 3.0, mid: 4.5, high: 6.5, notes: 'Client concentration risk; retainer % matters' },
  'E-commerce':                  { low: 2.5, mid: 3.5, high: 5.5, notes: 'Amazon dependency penalized; DTC premium' },
  'Manufacturing':               { low: 3.5, mid: 4.5, high: 6.5, notes: 'Equipment age and capacity utilization matter' },
  'Distribution / Wholesale':    { low: 3.0, mid: 4.0, high: 5.5, notes: 'Customer concentration risk; national reach premium' },
  'Construction / GC':           { low: 2.5, mid: 3.5, high: 5.0, notes: 'Backlog size critical; bonding capacity matters' },
  'Staffing':                    { low: 2.5, mid: 3.5, high: 5.0, notes: 'Margin compression; recurring contracts premium' },
  'Childcare / Daycare':         { low: 3.5, mid: 5.0, high: 7.0, notes: 'License and enrollment at capacity premium' },
  'Senior Care / Home Health':   { low: 3.5, mid: 5.0, high: 7.5, notes: 'Medicare/Medicaid licensing adds value' },
  'Physical Therapy':            { low: 3.5, mid: 5.0, high: 7.0, notes: 'Insurance mix; payer diversification matters' },
  'Pest Control':                { low: 4.0, mid: 5.0, high: 7.0, notes: 'Recurring route value; Rollins-style multiples' },
  'Commercial Cleaning':         { low: 2.5, mid: 3.5, high: 5.0, notes: 'Contract quality and term length matter' },
  'Restaurant / Food Service':   { low: 1.5, mid: 2.5, high: 4.0, notes: 'Lowest multiples; SDE basis; location key' },
}

// Add-back categories — which expenses are standard add-backs in M&A
// Used to guide Claude's financial extraction prompt.
export const STANDARD_ADDBACK_CATEGORIES = [
  'owner_compensation_excess',  // Amount above market-rate GM salary
  'owner_health_insurance',     // Personal health insurance through business
  'owner_vehicles',             // Personal vehicles expensed through business
  'one_time_items',             // Non-recurring expenses (repairs, legal, etc.)
  'depreciation',               // Added back in EBITDA calculation
  'amortization',               // Added back in EBITDA calculation
  'interest_expense',           // Added back in EBITDA calculation
  'personal_expenses',          // Any personal expenses through business
  'family_payroll',             // Family members on payroll above market rate
  'rent_above_market',          // Owner-occupied real estate at above-market rent
] as const

export type AddbackCategory = typeof STANDARD_ADDBACK_CATEGORIES[number]

export interface FinancialYear {
  year: number
  gross_revenue: number
  gross_profit: number
  operating_expenses: number
  ebitda: number
  owner_compensation: number
  depreciation: number
  amortization: number
  interest_expense: number
  add_backs: Array<{ category: AddbackCategory; amount: number; description: string }>
}

export interface ValuationResult {
  normalized_ebitda_per_year: number[]
  avg_normalized_ebitda: number
  industry: string
  multiple_low: number
  multiple_mid: number
  multiple_high: number
  valuation_low: number
  valuation_mid: number
  valuation_high: number
  deal_structure_recommendation: string
  revenue_trend: 'growing' | 'stable' | 'declining'
}

// Core valuation calculation — runs server-side only
export function calculateValuation(
  financials: FinancialYear[],
  industry: string
): ValuationResult {
  const multiples = INDUSTRY_MULTIPLES[industry] ?? { low: 3.0, mid: 4.0, high: 5.5, notes: '' }

  // Step 1: Normalize EBITDA per year
  const normalizedPerYear = financials.map(yr => {
    const totalAddbacks = yr.add_backs.reduce((sum, ab) => sum + ab.amount, 0)
    return yr.ebitda + totalAddbacks
  })

  // Step 2: Weighted average — weight most recent year higher
  // Weights: oldest=1, middle=1.5, most recent=2 (normalized to sum=1)
  let avgNormalized: number
  if (normalizedPerYear.length === 3) {
    avgNormalized = (
      normalizedPerYear[0] * 1 +
      normalizedPerYear[1] * 1.5 +
      normalizedPerYear[2] * 2
    ) / 4.5
  } else if (normalizedPerYear.length === 2) {
    avgNormalized = (normalizedPerYear[0] * 1 + normalizedPerYear[1] * 2) / 3
  } else {
    avgNormalized = normalizedPerYear[0] ?? 0
  }

  // Step 3: Apply multiples
  const low = Math.round(avgNormalized * multiples.low / 1000) * 1000
  const mid = Math.round(avgNormalized * multiples.mid / 1000) * 1000
  const high = Math.round(avgNormalized * multiples.high / 1000) * 1000

  // Step 4: Revenue trend
  let trend: ValuationResult['revenue_trend'] = 'stable'
  if (financials.length >= 2) {
    const first = financials[0].gross_revenue
    const last = financials[financials.length - 1].gross_revenue
    const change = (last - first) / first
    if (change > 0.05) trend = 'growing'
    else if (change < -0.05) trend = 'declining'
  }

  // Step 5: Deal structure recommendation
  let dealStructure = 'SBA 7(a) Loan'
  if (avgNormalized > 2000000) dealStructure = 'Conventional + Seller Note'
  if (avgNormalized > 4000000) dealStructure = 'Private Equity / Institutional'

  return {
    normalized_ebitda_per_year: normalizedPerYear,
    avg_normalized_ebitda: Math.round(avgNormalized),
    industry,
    multiple_low: multiples.low,
    multiple_mid: multiples.mid,
    multiple_high: multiples.high,
    valuation_low: low,
    valuation_mid: mid,
    valuation_high: high,
    deal_structure_recommendation: dealStructure,
    revenue_trend: trend,
  }
}
