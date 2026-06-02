// ChiroPillar · Self-Demo Guide
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

async function loadLiveStats(): Promise<LiveStats> {
  const jar = await cookies()
  const isDemo = jar.get('chiropillar-demo')?.value === '1'

  // Demo session → return illustrative stats matching the /targets sample data
  if (isDemo) {
    return {
      totalIntakes: 5,
      qualified: 3,
      maybe: 1,
      notYet: 1,
      pipelineEbitda: 1_350_000,   // weighted sum of 3 qualified clinics
      activeOutreach: 3,            // scheduled + called + in_diligence
      thisWeek: 2,
      states: 5,
      isDemo: true,
    }
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const sk  = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !sk) {
    return { totalIntakes: 0, qualified: 0, maybe: 0, notYet: 0, pipelineEbitda: 0, activeOutreach: 0, thisWeek: 0, states: 0, isDemo: false }
  }

  try {
    const admin = createClient(url, sk, { auth: { persistSession: false } })
    const { data } = await admin
      .from('chiropillar_targets')
      .select('qualification, outreach_status, state, valuation_mid, created_at')
      .limit(5000)
    const rows = data ?? []

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
    return { totalIntakes: 0, qualified: 0, maybe: 0, notYet: 0, pipelineEbitda: 0, activeOutreach: 0, thisWeek: 0, states: 0, isDemo: false }
  }
}

export default async function WalkthroughPage() {
  const stats = await loadLiveStats()
  return <WalkthroughClient stats={stats} />
}
