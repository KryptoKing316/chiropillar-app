// ============================================================
// KINGDOM BROKER — LOI AI AUTO-FILL
// Uses Claude to pre-fill LOI fields from deal data.
// Applies Boomer-friendly language rules throughout.
// ============================================================

import Anthropic from '@anthropic-ai/sdk'
import type { TemplateType } from './loi-templates'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

// Standard amortization monthly payment formula
function calcMonthlyPayment(principal: number, annualRate: number, months: number): number {
  if (annualRate === 0) return principal / months
  const r = annualRate / 100 / 12
  return (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1)
}

function formatCurrency(n: number): string {
  return '$' + Math.round(n).toLocaleString('en-US')
}

function addMonthsToToday(months: number): string {
  const d = new Date()
  d.setMonth(d.getMonth() + months)
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

// ============================================================
// DEAL + BUYER TYPES (lightweight, not importing DB types)
// ============================================================

interface DealData {
  id?: string
  business_name?: string
  industry?: string
  city?: string
  state?: string
  years_in_business?: number
  employee_count?: number
  asking_price?: number
  ttm_revenue?: number
  ttm_ebitda?: number
  normalized_ebitda?: number
  valuation_low?: number
  valuation_mid?: number
  valuation_high?: number
  deal_structure?: string
  ai_summary?: string
  ai_buyer_profile?: string
  seller_name?: string
  seller_email?: string
  seller_phone?: string
}

interface BuyerData {
  id?: string
  full_name?: string
  email?: string
  phone?: string
  company_name?: string
}

// ============================================================
// AUTO-FILL FUNCTION
// ============================================================

export async function autoFillLOI(
  deal: DealData,
  buyer: BuyerData,
  templateType: TemplateType
): Promise<Record<string, string>> {
  const today = new Date()
  const todayFormatted = today.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  // Pre-calculate key financial figures based on template type
  const askingPrice = deal.asking_price || deal.valuation_mid || 0
  const earnestMoneyAmount = Math.max(5000, Math.round(askingPrice * 0.01 / 1000) * 1000)

  // Seller financed calculations
  const sfDownPayment = Math.round(askingPrice * 0.6)
  const sfNoteAmount = askingPrice - sfDownPayment
  const sfTermMonths = 24
  const sfRate = 6
  const sfMonthly = calcMonthlyPayment(sfNoteAmount, sfRate, sfTermMonths)

  // SBA calculations
  const sbaDownPaymentPct = 10
  const sbaDownPayment = Math.round(askingPrice * (sbaDownPaymentPct / 100))
  const sbaLoanAmount = askingPrice - sbaDownPayment

  const dueDiligenceDays = templateType === 'all_cash' ? 30
    : templateType === 'seller_financed' ? 21
    : 45

  const closeDate = templateType === 'sba_7a'
    ? addMonthsToToday(3)
    : addMonthsToToday(2)

  const prompt = `You are a Kingdom Broker deal assistant. Your job is to fill in the fields of an LOI (Letter of Intent) for the acquisition of a small business.

DEAL INFORMATION:
${JSON.stringify(deal, null, 2)}

BUYER INFORMATION:
${JSON.stringify(buyer, null, 2)}

TEMPLATE TYPE: ${templateType}

TODAY'S DATE: ${todayFormatted}

YOUR RULES — follow every one of these:

1. TONE: Write for a business owner who is 55–72 years old, not a finance professional. Plain American English. Short sentences. No jargon.

2. FORBIDDEN WORDS — never use these:
   - synergies, leverage, arbitrage, exit multiple, EBITDA
   - runway, stakeholders, scalable, disruption, pivot
   Use "annual profit" instead of EBITDA. Use "growth" instead of "scalable."

3. USE THE BUSINESS NAME frequently — it makes the document feel personal.

4. CITY AND STATE — always include the city and state when describing the business.

5. YEARS IN BUSINESS — acknowledge how long the owner has been building this.

6. EMPLOYEE COUNT — mention the team by number where it adds warmth.

7. PURCHASE PRICE — state it clearly in plain English. Never use jargon.

8. SELLER NOTE EXPLANATION — if seller financed, explain it simply: "you receive monthly payments, like a mortgage but we pay you."

9. ASSETS INCLUDED — write a clear, plain-English description based on the industry.
   For service businesses: "All equipment, vehicles, tools, customer lists, trade name, phone numbers, website, and goodwill."
   For retail: "All inventory, fixtures, equipment, customer lists, trade name, and goodwill."
   Customize for the actual industry: ${deal.industry || 'business'}.

Return ONLY a valid JSON object with these exact keys and no extra text:

For ALL templates, always include:
- date: "${todayFormatted}"
- seller_name: seller's full name (use deal.seller_name if available, else "Business Owner")
- seller_email: seller's email (use deal.seller_email if available, else "")
- seller_phone: seller's phone (use deal.seller_phone if available, else "")
- business_name: "${deal.business_name || 'the business'}"
- city: "${deal.city || ''}"
- state: "${deal.state || ''}"
- years_in_business: "${deal.years_in_business || '20'}+"
- industry: "${deal.industry || 'business services'}"
- employee_count: "${deal.employee_count || '10'}"
- purchase_price: "${formatCurrency(askingPrice)}"
- earnest_money: "${formatCurrency(earnestMoneyAmount)}"
- assets_included: [write a 2–3 sentence plain-English description of assets for this industry]
- due_diligence_days: "${dueDiligenceDays}"
- close_by_date: "${closeDate}"
- transition_weeks: "4"
- noncompete_years: "5"
- exclusivity_days: "10"
- contingencies: ""
- buyer_name: "${buyer.full_name || buyer.company_name || 'Kingdom Broker'}"
- buyer_email: "${buyer.email || 'Eric@KingdomBroker.com'}"
- buyer_phone: "${buyer.phone || '469-494-9890'}"

${templateType === 'seller_financed' ? `
Also include these seller-financed specific fields:
- down_payment: "${formatCurrency(sfDownPayment)}"
- seller_note_amount: "${formatCurrency(sfNoteAmount)}"
- note_term_months: "${sfTermMonths}"
- note_interest_rate: "${sfRate}"
- monthly_payment: "${formatCurrency(sfMonthly)}"
- note_security: "the assets and equipment of ${deal.business_name || 'the business'}, and a personal guarantee from the buyer"
` : ''}

${templateType === 'sba_7a' ? `
Also include these SBA-specific fields:
- down_payment_pct: "${sbaDownPaymentPct}"
- down_payment_amount: "${formatCurrency(sbaDownPayment)}"
- sba_loan_amount: "${formatCurrency(sbaLoanAmount)}"
- sba_lender: "Live Oak Bank"
- pre_approval_status: "Pre-qualified"
- kb_fund_amount: ""
` : ''}

Return ONLY the JSON. No markdown. No explanation. No extra keys.`

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }],
    })

    const content = response.content[0]
    if (content.type !== 'text') throw new Error('Unexpected response type from Claude')

    // Extract JSON even if Claude adds some extra text
    const text = content.text.trim()
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON found in Claude response')

    const parsed = JSON.parse(jsonMatch[0]) as Record<string, string>
    return parsed
  } catch (err) {
    console.error('[LOI AI] Auto-fill error:', err instanceof Error ? err.message : String(err))

    // Return safe defaults if AI fails
    const defaults: Record<string, string> = {
      date: todayFormatted,
      seller_name: deal.seller_name || 'Business Owner',
      seller_email: deal.seller_email || '',
      seller_phone: deal.seller_phone || '',
      business_name: deal.business_name || 'Your Business',
      city: deal.city || '',
      state: deal.state || '',
      years_in_business: String(deal.years_in_business || ''),
      industry: deal.industry || '',
      employee_count: String(deal.employee_count || ''),
      purchase_price: formatCurrency(askingPrice),
      earnest_money: formatCurrency(earnestMoneyAmount),
      assets_included: 'All equipment, vehicles, tools, customer lists, trade name, website, phone numbers, and goodwill.',
      due_diligence_days: String(dueDiligenceDays),
      close_by_date: closeDate,
      transition_weeks: '4',
      noncompete_years: '5',
      exclusivity_days: '10',
      contingencies: '',
      buyer_name: buyer.full_name || buyer.company_name || 'Kingdom Broker',
      buyer_email: buyer.email || 'Eric@KingdomBroker.com',
      buyer_phone: buyer.phone || '469-494-9890',
    }

    if (templateType === 'seller_financed') {
      defaults.down_payment = formatCurrency(sfDownPayment)
      defaults.seller_note_amount = formatCurrency(sfNoteAmount)
      defaults.note_term_months = String(sfTermMonths)
      defaults.note_interest_rate = String(sfRate)
      defaults.monthly_payment = formatCurrency(sfMonthly)
      defaults.note_security = `the assets and equipment of ${deal.business_name || 'the business'}, and a personal guarantee from the buyer`
    }

    if (templateType === 'sba_7a') {
      defaults.down_payment_pct = String(sbaDownPaymentPct)
      defaults.down_payment_amount = formatCurrency(sbaDownPayment)
      defaults.sba_loan_amount = formatCurrency(sbaLoanAmount)
      defaults.sba_lender = 'Live Oak Bank'
      defaults.pre_approval_status = 'Pre-qualified'
      defaults.kb_fund_amount = ''
    }

    return defaults
  }
}
