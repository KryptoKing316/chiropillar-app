import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'
import { INDUSTRY_MULTIPLES, calculateValuation, type FinancialYear } from '@/lib/server/valuation-engine'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const SUPABASE_SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY!
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY!

// Map Exchange industry strings → valuation engine industry keys
function normalizeIndustry(input: string): string {
  const i = (input || '').toLowerCase()
  if (i.includes('hvac')) return 'HVAC / Home Services'
  if (i.includes('plumbing')) return 'Plumbing'
  if (i.includes('electrical')) return 'Electrical'
  if (i.includes('roofing')) return 'Roofing'
  if (i.includes('manufacturing') || i.includes('cnc') || i.includes('machin') || i.includes('fab')) return 'Manufacturing'
  if (i.includes('construction') || i.includes('contract')) return 'Construction / GC'
  if (i.includes('auto')) return 'Auto Repair'
  if (i.includes('dental')) return 'Dental Practice'
  if (i.includes('medical')) return 'Medical Practice'
  if (i.includes('veterinary') || i.includes('vet')) return 'Veterinary'
  if (i.includes('food')) return 'Distribution / Wholesale'
  if (i.includes('cleaning')) return 'Commercial Cleaning'
  if (i.includes('environmental')) return 'Manufacturing'
  return 'Manufacturing'  // safe fallback
}

// POST /api/exchange/deals/[id]/extract
// Pulls the CIM from Supabase Storage, runs Claude extraction,
// computes NAICS-keyed valuation, updates the deal row.
// Returns the valuation result for immediate UI display.
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const cookieStore = await cookies()
  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON, {
    cookies: { get: (name: string) => cookieStore.get(name)?.value },
  })
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE)

  // Fetch deal + verify ownership
  const { data: deal, error: dealErr } = await admin
    .from('coalition_deals')
    .select('*')
    .eq('id', id)
    .single()
  if (dealErr || !deal) return NextResponse.json({ error: 'Deal not found' }, { status: 404 })

  if (!deal.cim_pdf_path) {
    return NextResponse.json({ error: 'No CIM uploaded for this deal' }, { status: 400 })
  }

  // Download CIM from Supabase Storage
  const { data: cimBlob, error: dlErr } = await admin.storage
    .from('coalition-cim')
    .download(deal.cim_pdf_path)
  if (dlErr || !cimBlob) {
    return NextResponse.json({ error: 'Failed to download CIM: ' + (dlErr?.message || 'unknown') }, { status: 500 })
  }

  // Convert to base64 for Claude PDF input
  const buf = Buffer.from(await cimBlob.arrayBuffer())
  const base64Pdf = buf.toString('base64')
  const pdfSizeMB = (buf.length / 1024 / 1024).toFixed(2)

  // Ask Claude to extract financials
  const anthropic = new Anthropic({ apiKey: ANTHROPIC_KEY })
  const t0 = Date.now()

  let extraction: {
    business_summary: string
    industry_code: string
    years_of_data: number
    financials: FinancialYear[]
    confidence: 'high' | 'medium' | 'low'
    extraction_notes: string
  }

  try {
    const msg = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4000,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'document',
            source: { type: 'base64', media_type: 'application/pdf', data: base64Pdf }
          },
          {
            type: 'text',
            text: `You are a Kingdom Broker financial analyst extracting financials from this CIM PDF.

Return ONLY valid JSON matching this schema (no markdown, no commentary):

{
  "business_summary": "1-2 sentence summary of the business",
  "industry_code": "Choose closest: HVAC, Plumbing, Electrical, Roofing, Manufacturing, Construction, Auto Repair, Dental Practice, Medical Practice, Veterinary, Food Distribution, Commercial Cleaning, Environmental",
  "years_of_data": 1-3,
  "financials": [
    {
      "year": 2023,
      "gross_revenue": 0,
      "gross_profit": 0,
      "operating_expenses": 0,
      "ebitda": 0,
      "owner_compensation": 0,
      "depreciation": 0,
      "amortization": 0,
      "interest_expense": 0,
      "add_backs": [
        {"category": "owner_compensation_excess", "amount": 0, "description": "Amount above market rate"},
        {"category": "one_time_items", "amount": 0, "description": "Description"}
      ]
    }
  ],
  "confidence": "high | medium | low",
  "extraction_notes": "What was missing or unclear, if anything"
}

Add-back categories must be one of: owner_compensation_excess, owner_health_insurance, owner_vehicles, one_time_items, depreciation, amortization, interest_expense, personal_expenses, family_payroll, rent_above_market

Return the most recent 3 years of data if available. If only 1-2 years, use that.
If a field is missing in the CIM, use 0 (not null).
Output JSON only.`
          }
        ]
      }]
    })
    const text = msg.content[0].type === 'text' ? msg.content[0].text : ''
    // Strip code fences if any
    const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    extraction = JSON.parse(clean)
  } catch (e) {
    return NextResponse.json({ error: 'AI extraction failed: ' + (e instanceof Error ? e.message : 'unknown') }, { status: 500 })
  }

  const extractionTime = Date.now() - t0

  // Run valuation
  const industryKey = normalizeIndustry(extraction.industry_code)
  const valuation = calculateValuation(extraction.financials, industryKey)
  const multiples = INDUSTRY_MULTIPLES[industryKey]

  // Persist to coalition_deals
  await admin
    .from('coalition_deals')
    .update({
      ai_valuation_low: valuation.valuation_low,
      ai_valuation_mid: valuation.valuation_mid,
      ai_valuation_high: valuation.valuation_high,
      ai_multiple_low: valuation.multiple_low,
      ai_multiple_high: valuation.multiple_high,
      ai_valuation_notes: `${extraction.business_summary}\n\nIndustry: ${industryKey} (${multiples?.notes ?? ''})\nAvg normalized EBITDA: $${Math.round(valuation.avg_normalized_ebitda).toLocaleString()}\nRevenue trend: ${valuation.revenue_trend}\nDeal structure rec: ${valuation.deal_structure_recommendation}\nExtraction confidence: ${extraction.confidence}\nNotes: ${extraction.extraction_notes}`,
      private_full_financials: extraction.financials as unknown as Record<string, unknown>,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  return NextResponse.json({
    success: true,
    extraction_time_ms: extractionTime,
    pdf_size_mb: pdfSizeMB,
    business_summary: extraction.business_summary,
    industry: industryKey,
    avg_normalized_ebitda: valuation.avg_normalized_ebitda,
    revenue_trend: valuation.revenue_trend,
    valuation_low: valuation.valuation_low,
    valuation_mid: valuation.valuation_mid,
    valuation_high: valuation.valuation_high,
    multiple_low: valuation.multiple_low,
    multiple_high: valuation.multiple_high,
    deal_structure: valuation.deal_structure_recommendation,
    extraction_confidence: extraction.confidence,
    extraction_notes: extraction.extraction_notes,
    industry_notes: multiples?.notes ?? '',
  })
}
