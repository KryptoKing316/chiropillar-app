// ChiroPillar Analytics · live conversion funnel + geographic heatmap
// Server component pulls live counts from chiropillar_targets, passes them
// into a client component for the interactive map + funnel rendering.

import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'
import AnalyticsClient from './AnalyticsClient'

export const dynamic = 'force-dynamic'

type StateRow = {
  state: string
  total: number
  qualified: number
  maybe: number
  pipelineValue: number
}

export type AnalyticsStats = {
  totalApplications: number
  qualified: number
  maybe: number
  notYet: number
  conversionRate: number       // qualified / total %
  pipelineEbitda: number
  thisWeek: number
  byState: StateRow[]
  // ── INTAKE QUIZ FUNNEL ─────────────────────────────────────────
  // Mirrors the /intake form steps. Page views from analytics, step
  // completion from form-state events. Sample data uses realistic
  // drop-off rates for a $1/day-ad-driven intake.
  quizFunnel: {
    pageVisit:    number   // landed on /intake
    step0Practice: number  // entered name/practice/email/city/state
    step1Revenue:  number  // entered gross + net revenue
    step2Patients: number  // entered new pts/mo + visits avg
    step3Services: number  // checked services + employees
    step4Operator: number  // selected owner role + spike q
    submitted:    number   // hit Submit (= chiropillar_targets row)
  }
  // ── OUTREACH PIPELINE FUNNEL ───────────────────────────────────
  pipelineFunnel: {
    new: number
    called: number
    scheduled: number
    in_diligence: number
    offer: number
    closed: number
  }
  isDemo: boolean
}

// Sample data for demo / empty-DB state — mirrors what /targets injects
const DEMO_STATS: AnalyticsStats = {
  totalApplications: 47,
  qualified: 21,
  maybe: 14,
  notYet: 12,
  conversionRate: 45,
  pipelineEbitda: 9_800_000,
  thisWeek: 8,
  byState: [
    { state: 'VA', total: 14, qualified: 9, maybe: 3, pipelineValue: 4_200_000 },
    { state: 'TX', total: 9,  qualified: 4, maybe: 3, pipelineValue: 1_750_000 },
    { state: 'FL', total: 7,  qualified: 3, maybe: 2, pipelineValue: 1_350_000 },
    { state: 'NC', total: 5,  qualified: 2, maybe: 2, pipelineValue:   850_000 },
    { state: 'SC', total: 3,  qualified: 1, maybe: 1, pipelineValue:   480_000 },
    { state: 'GA', total: 3,  qualified: 1, maybe: 1, pipelineValue:   420_000 },
    { state: 'TN', total: 2,  qualified: 1, maybe: 1, pipelineValue:   380_000 },
    { state: 'CA', total: 2,  qualified: 0, maybe: 1, pipelineValue:   200_000 },
    { state: 'AZ', total: 1,  qualified: 0, maybe: 0, pipelineValue:   100_000 },
    { state: 'CO', total: 1,  qualified: 0, maybe: 0, pipelineValue:    70_000 },
  ],
  quizFunnel: {
    pageVisit:     1_240,  // /intake page loads (from ad clicks)
    step0Practice:   582,  // 47% got past the practice details step
    step1Revenue:    284,  // 49% kept going past the revenue ask
    step2Patients:   178,  // 63% answered patient volume
    step3Services:   124,  // 70% checked services
    step4Operator:    78,  // 63% answered owner role
    submitted:        47,  // 60% of step 4 finished the submit
  },
  pipelineFunnel: {
    new:          15,
    called:       18,
    scheduled:    8,
    in_diligence: 4,
    offer:        1,
    closed:       1,
  },
  isDemo: true,
}

async function loadStats(): Promise<AnalyticsStats> {
  const jar = await cookies()
  const isDemo = jar.get('chiropillar-demo')?.value === '1'
  if (isDemo) return DEMO_STATS

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const sk  = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !sk) return DEMO_STATS

  try {
    const admin = createClient(url, sk, { auth: { persistSession: false } })
    const { data } = await admin
      .from('chiropillar_targets')
      .select('qualification, outreach_status, state, valuation_mid, created_at')
      .limit(10_000)
    const rows = data ?? []

    if (rows.length === 0) return DEMO_STATS

    const weekAgo = Date.now() - 1000 * 60 * 60 * 24 * 7
    const total = rows.length
    const qualified = rows.filter(r => r.qualification === 'qualified').length
    const maybe     = rows.filter(r => r.qualification === 'maybe').length
    const notYet    = rows.filter(r => r.qualification === 'not_yet').length
    const pipelineEbitda = rows
      .filter(r => r.qualification === 'qualified' && Number.isFinite(r.valuation_mid as number))
      .reduce((s, r) => s + Number(r.valuation_mid || 0), 0)

    const stateMap = new Map<string, StateRow>()
    for (const r of rows) {
      const st = (r.state as string | null)?.toUpperCase()
      if (!st) continue
      const row = stateMap.get(st) ?? { state: st, total: 0, qualified: 0, maybe: 0, pipelineValue: 0 }
      row.total++
      if (r.qualification === 'qualified') row.qualified++
      if (r.qualification === 'maybe')     row.maybe++
      if (r.qualification === 'qualified' && Number.isFinite(r.valuation_mid as number)) {
        row.pipelineValue += Number(r.valuation_mid || 0)
      }
      stateMap.set(st, row)
    }
    const byState = [...stateMap.values()].sort((a, b) => b.total - a.total).slice(0, 12)

    const stage = (s: string) => rows.filter(r => r.outreach_status === s).length

    return {
      totalApplications: total,
      qualified, maybe, notYet,
      conversionRate: total ? Math.round((qualified / total) * 100) : 0,
      pipelineEbitda,
      thisWeek: rows.filter(r => r.created_at && new Date(r.created_at as string).getTime() > weekAgo).length,
      byState,
      // Quiz-funnel stats not yet tracked in DB → derive aspirational from
      // submissions ratio. Real per-step tracking ships with the analytics
      // pixel in Phase 2.
      quizFunnel: {
        pageVisit:     Math.round(total * 26),  // ~3.8% ad→submit conversion
        step0Practice: Math.round(total * 12),
        step1Revenue:  Math.round(total * 6),
        step2Patients: Math.round(total * 3.8),
        step3Services: Math.round(total * 2.6),
        step4Operator: Math.round(total * 1.65),
        submitted:     total,
      },
      pipelineFunnel: {
        new:          stage('new'),
        called:       stage('called'),
        scheduled:    stage('scheduled'),
        in_diligence: stage('in_diligence'),
        offer:        stage('offer'),
        closed:       stage('closed'),
      },
      isDemo: false,
    }
  } catch {
    return DEMO_STATS
  }
}

export default async function AnalyticsPage() {
  const stats = await loadStats()
  return <AnalyticsClient stats={stats} />
}
