// ProMed VA · Self-Demo Guide
// Server component pulls LIVE platform stats from chiropillar_targets,
// passes them into a client component for the interactive walkthrough.

import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'
import WalkthroughClient from './WalkthroughClient'

export const dynamic = 'force-dynamic'

type LiveStats = {
  totalIntakes: number
  qualified: number
  maybe: number
  notYet: number
  pipelineEbitda: number // sum of valuation_mid for qualified
  activeOutreach: number // status not in (new, passed)
  thisWeek: number
  states: number
  isDemo: boolean
}

// Mock-up stats for an in-flight ProMed VA platform. Surfaces when the
// production DB is empty (pre-launch) OR when the demo cookie is set, so
// Wagner walks every page and sees the platform LIVE rather than at zero.
const MOCKUP_STATS: LiveStats = {
  totalIntakes:    47,
  qualified:       21,
  maybe:           14,
  notYet:          12,
  pipelineEbitda:  9_800_000,    // weighted sum of 21 qualified at $467K avg
  activeOutreach:  31,            // applicants in called/scheduled/in_diligence/offer
  thisWeek:        8,
  states:          10,
  isDemo:          true,
}

async function loadLiveStats(): Promise<LiveStats> {
  const jar = await cookies()
  const isDemo = jar.get('chiropillar-demo')?.value === '1'
  if (isDemo) return MOCKUP_STATS

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const sk  = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !sk) return MOCKUP_STATS

  try {
    const admin = createClient(url, sk, { auth: { persistSession: false } })
    const { data } = await admin
      .from('chiropillar_targets')
      .select('qualification, outreach_status, state, valuation_mid, created_at')
      .limit(5000)
    const rows = data ?? []

    // Empty production DB (pre-launch) → show mockup so platform looks alive
    if (rows.length === 0) return MOCKUP_STATS

    const weekAgo = Date.now() - 1000 * 60 * 60 * 24 * 7
    const states = new Set(rows.map(r => (r.state as string | null)?.toUpperCase()).filter(Boolean))

    return {
      totalIntakes:   rows.length,
      qualified:      rows.filter(r => r.qualification === 'qualified').length,
      maybe:          rows.filter(r => r.qualification === 'maybe').length,
      notYet:         rows.filter(r => r.qualification === 'not_yet').length,
      pipelineEbitda: rows
        .filter(r => r.qualification === 'qualified' && Number.isFinite(r.valuation_mid as number))
        .reduce((s, r) => s + Number(r.valuation_mid || 0), 0),
      activeOutreach: rows.filter(r => r.outreach_status && !['new', 'passed'].includes(r.outreach_status as string)).length,
      thisWeek:       rows.filter(r => r.created_at && new Date(r.created_at as string).getTime() > weekAgo).length,
      states:         states.size,
      isDemo: false,
    }
  } catch {
    return MOCKUP_STATS
  }
}

export default async function WalkthroughPage() {
  const stats = await loadLiveStats()
  return <WalkthroughClient stats={stats} />
}
