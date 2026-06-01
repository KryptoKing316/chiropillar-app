import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const SUPABASE_SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY!

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

type CandidateBuyer = {
  id: string
  firm_name: string
  contact_name: string | null
  contact_email: string | null
  buyer_type: string | null
  hq_city: string | null
  hq_state: string | null
  check_size_min: number | null
  check_size_max: number | null
  deal_size_min: number | null
  deal_size_max: number | null
  industries: string[] | null
  geography: string[] | null
  ebitda_min: number | null
  ebitda_max: number | null
}

type RankedBuyer = {
  id: string
  fit_score: number
  reasoning: string
}

/**
 * POST /api/exchange/deals/[id]/match-buyers
 *
 * Pre-filters exchange_buyers by industry/geography overlap, then sends top
 * candidates to Claude for ranking. Returns top 10 with fit_score + reasoning.
 */
export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: dealId } = await params

  const cookieStore = await cookies()
  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON, {
    cookies: { get: (name: string) => cookieStore.get(name)?.value },
  })
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE)
  const isAdmin = session.user.email === 'eric@kingdombroker.com'

  // Buyer matching is a paid concierge service Eric performs on behalf of clients.
  // Only admin (Eric) can run the matching engine; clients view the persisted results.
  if (!isAdmin) {
    return NextResponse.json({
      error: 'Buyer matching is a paid concierge service. Contact Eric at eric@kingdombroker.com to run a match against KB\'s 1,127+ buyer database.',
    }, { status: 403 })
  }

  const { data: deal } = await admin
    .from('coalition_deals')
    .select('id, source_firm_id, public_title, industry, state, city_region, revenue_band, ebitda_band, asking_price_band, ai_valuation_low, ai_valuation_mid, ai_valuation_high, public_summary, private_business_name')
    .eq('id', dealId)
    .single()

  if (!deal) return NextResponse.json({ error: 'Deal not found' }, { status: 404 })

  // Pre-filter the 1,127+ buyer pool by industry + geography overlap.
  // We pull a candidate set, then send to Claude for fine-grained ranking.
  const industry = (deal.industry ?? '').trim()
  const askingMid = deal.ai_valuation_mid ?? null

  let candidatesQuery = admin
    .from('exchange_buyers')
    .select('id, firm_name, contact_name, contact_email, buyer_type, hq_city, hq_state, check_size_min, check_size_max, deal_size_min, deal_size_max, industries, geography, ebitda_min, ebitda_max')
    .eq('is_active', true)
    .limit(60)

  if (industry) {
    candidatesQuery = candidatesQuery.or(`industries.cs.{${industry}},industries.is.null`)
  }

  const { data: candidates, error: candidatesErr } = await candidatesQuery

  if (candidatesErr) {
    return NextResponse.json({ error: 'Buyer query failed: ' + candidatesErr.message }, { status: 500 })
  }

  if (!candidates || candidates.length === 0) {
    return NextResponse.json({ matches: [], note: 'No buyers in exchange_buyers — populate via migration script first.' })
  }

  // Build a compact deal brief for Claude
  const dealBrief = {
    title: deal.public_title,
    industry: deal.industry,
    location: [deal.city_region, deal.state].filter(Boolean).join(', '),
    revenue: deal.revenue_band,
    ebitda: deal.ebitda_band,
    asking: deal.asking_price_band,
    valuation_mid: askingMid,
    summary: deal.public_summary,
  }

  // Send to Claude
  const sys = `You are KB's AI matching engine. Score each buyer 0-100 on fit for this deal.

Scoring weights:
- Industry overlap (0-40): exact match = 40, adjacent = 25, none = 0
- Geography fit (0-20): named state or "National" = 20, regional adjacency = 10
- Check size / deal size fit (0-25): deal valuation falls inside buyer's range = 25
- Buyer type alignment (0-15): family office + boring biz = 15, PE + EBITDA-positive = 15, etc

Return ONLY valid JSON, no prose:
{"ranked": [{"id": "uuid", "fit_score": 0-100, "reasoning": "1-2 short sentence why"}, ...]}

Top 10 only, sorted descending by fit_score. Reasoning must be specific (mention industry/geography/check size — not generic).`

  const userMsg = `DEAL:
${JSON.stringify(dealBrief, null, 2)}

BUYER CANDIDATES (${candidates.length}):
${JSON.stringify(
  (candidates as CandidateBuyer[]).map((c) => ({
    id: c.id,
    firm: c.firm_name,
    type: c.buyer_type,
    hq: [c.hq_city, c.hq_state].filter(Boolean).join(', '),
    industries: c.industries,
    geography: c.geography,
    check: c.check_size_min && c.check_size_max ? `${c.check_size_min}-${c.check_size_max}` : null,
    deal_size: c.deal_size_min && c.deal_size_max ? `${c.deal_size_min}-${c.deal_size_max}` : null,
    ebitda: c.ebitda_min && c.ebitda_max ? `${c.ebitda_min}-${c.ebitda_max}` : null,
  })),
  null,
  2
)}

Rank the top 10. Return JSON only.`

  let ranked: RankedBuyer[] = []
  try {
    const resp = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4000,
      system: sys,
      messages: [{ role: 'user', content: userMsg }],
    })
    const text = resp.content.filter((b) => b.type === 'text').map((b) => (b as { text: string }).text).join('')
    const parsed = JSON.parse(text.trim().replace(/^```json\s*|\s*```$/g, ''))
    ranked = parsed.ranked as RankedBuyer[]
  } catch (e) {
    return NextResponse.json({ error: 'Claude matching failed: ' + (e instanceof Error ? e.message : 'unknown') }, { status: 500 })
  }

  // Join Claude's ranks with full buyer rows
  const byId = new Map((candidates as CandidateBuyer[]).map((c) => [c.id, c]))
  const matches = ranked
    .map((r) => {
      const buyer = byId.get(r.id)
      if (!buyer) return null
      return {
        id: buyer.id,
        firm_name: buyer.firm_name,
        contact_name: buyer.contact_name,
        contact_email: buyer.contact_email,
        buyer_type: buyer.buyer_type,
        hq_city: buyer.hq_city,
        hq_state: buyer.hq_state,
        check_size_min: buyer.check_size_min,
        check_size_max: buyer.check_size_max,
        industries: buyer.industries,
        fit_score: r.fit_score,
        reasoning: r.reasoning,
      }
    })
    .filter((m) => m !== null)

  // Persist matches to coalition_buyer_matches for tracking
  // Replace previous run's matches for this deal (idempotent re-run)
  if (matches.length > 0) {
    await admin.from('coalition_buyer_matches').delete().eq('deal_id', dealId).eq('status', 'identified')
    await admin.from('coalition_buyer_matches').insert(
      matches.map((m) => ({
        deal_id: dealId,
        buyer_lead_id: m!.id,
        buyer_firm_name: m!.firm_name,
        buyer_contact_name: m!.contact_name,
        buyer_contact_email: m!.contact_email,
        buyer_type: m!.buyer_type,
        match_score: m!.fit_score,
        match_reasoning: m!.reasoning,
        status: 'identified',
      }))
    )
  }

  return NextResponse.json({ matches, candidate_count: candidates.length })
}
