/**
 * GET /api/admin/perf
 * Returns live pipeline stats + saved weekly report history.
 * Admin-only.
 *
 * Supabase table needed (run once in SQL editor):
 *
 * CREATE TABLE IF NOT EXISTS perf_reports (
 *   id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
 *   report_date      DATE NOT NULL DEFAULT CURRENT_DATE,
 *   week_label       TEXT,
 *   sellers_total    INTEGER DEFAULT 0,
 *   sellers_queued   INTEGER DEFAULT 0,
 *   sellers_contacted INTEGER DEFAULT 0,
 *   sellers_with_email INTEGER DEFAULT 0,
 *   sellers_new_week INTEGER DEFAULT 0,
 *   buyers_total     INTEGER DEFAULT 0,
 *   buyers_queued    INTEGER DEFAULT 0,
 *   buyers_contacted INTEGER DEFAULT 0,
 *   buyers_new_week  INTEGER DEFAULT 0,
 *   seller_campaign_active BOOLEAN DEFAULT false,
 *   buyer_campaign_active  BOOLEAN DEFAULT false,
 *   buyer_campaign_steps   INTEGER DEFAULT 0,
 *   agent_runs_week  INTEGER DEFAULT 0,
 *   total_cost_week  NUMERIC DEFAULT 0,
 *   notes            TEXT,
 *   created_at       TIMESTAMPTZ DEFAULT NOW()
 * );
 */

import { NextRequest, NextResponse } from 'next/server'
import { corsCheck, requireAdmin } from '@/lib/auth'
import { getAdminSupabase } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const cors = corsCheck(req)
  if (cors) return cors

  const { user, error } = await requireAdmin(req)
  if (error) return error
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = getAdminSupabase()
  const now   = new Date()
  const weekAgo  = new Date(now.getTime() - 7  * 86400000).toISOString()
  const monthAgo = new Date(now.getTime() - 90 * 86400000).toISOString()

  const [
    sellersRes,
    buyersRes,
    runsRes,
    reportsRes,
  ] = await Promise.all([
    // Live seller stats
    admin.from('seller_leads')
      .select('id, outreach_status, sell_readiness_score, owner_email, date_found', { count: 'exact' })
      .limit(2000),

    // Live buyer stats
    admin.from('buyer_leads')
      .select('id, outreach_status, fit_score, email, date_found, investor_type', { count: 'exact' })
      .limit(2000),

    // Agent runs last 90 days
    admin.from('agent_runs')
      .select('id, run_type, status, seller_leads_found, buyer_leads_found, total_cost_usd, started_at')
      .gte('started_at', monthAgo)
      .order('started_at', { ascending: false })
      .limit(50),

    // Saved weekly reports — last 12 weeks
    admin.from('perf_reports')
      .select('*')
      .order('report_date', { ascending: false })
      .limit(12),
  ])

  const sellers = sellersRes.data ?? []
  const buyers  = buyersRes.data  ?? []
  const runs    = runsRes.data    ?? []
  const reports = reportsRes.data ?? []

  // ── Live stats ───────────────────────────────────────────────────────────
  const weekAgoDate = weekAgo.slice(0, 10)

  const live = {
    sellers: {
      total:      sellers.length,
      queued:     sellers.filter(s => s.outreach_status === 'Queued').length,
      contacted:  sellers.filter(s => s.outreach_status === 'Contacted').length,
      not_contacted: sellers.filter(s => s.outreach_status === 'Not Contacted').length,
      with_email: sellers.filter(s => s.owner_email).length,
      new_week:   sellers.filter(s => (s.date_found ?? '') >= weekAgoDate).length,
      high_score: sellers.filter(s => (s.sell_readiness_score ?? 0) >= 8).length,
    },
    buyers: {
      total:      buyers.length,
      queued:     buyers.filter(b => b.outreach_status === 'Queued').length,
      contacted:  buyers.filter(b => b.outreach_status === 'Contacted').length,
      not_contacted: buyers.filter(b => ['Not Contacted','Not Sent'].includes(b.outreach_status ?? '')).length,
      bounced:    buyers.filter(b => b.outreach_status === 'Bounced').length,
      new_week:   buyers.filter(b => (b.date_found ?? '') >= weekAgoDate).length,
      high_score: buyers.filter(b => (b.fit_score ?? 0) >= 8).length,
      by_type:    Object.entries(
        buyers.reduce((acc: Record<string,number>, b) => {
          const t = b.investor_type ?? 'unknown'
          acc[t] = (acc[t] ?? 0) + 1
          return acc
        }, {})
      ).sort((a, b) => b[1] - a[1]),
    },
    runs: {
      total:        runs.length,
      this_week:    runs.filter(r => r.started_at >= weekAgo).length,
      completed:    runs.filter(r => r.status === 'complete').length,
      cost_week:    runs
        .filter(r => r.started_at >= weekAgo)
        .reduce((s, r) => s + (r.total_cost_usd ?? 0), 0),
      cost_total:   runs.reduce((s, r) => s + (r.total_cost_usd ?? 0), 0),
    },
    // Build 8-week rolling chart data from saved reports
    chart: buildChartData(reports),
  }

  return NextResponse.json({ live, reports, runs: runs.slice(0, 20) })
}

// ── POST: save a new weekly snapshot (called by weekly_report.py) ─────────────
export async function POST(req: NextRequest) {
  const cors = corsCheck(req)
  if (cors) return cors

  const { user, error } = await requireAdmin(req)
  if (error) return error

  try {
    const body = await req.json()
    const admin = getAdminSupabase()

    // Upsert by report_date so re-runs overwrite same week
    const { data, error: dbErr } = await admin
      .from('perf_reports')
      .upsert({
        report_date:           body.report_date ?? new Date().toISOString().slice(0, 10),
        week_label:            body.week_label,
        sellers_total:         body.sellers_total ?? 0,
        sellers_queued:        body.sellers_queued ?? 0,
        sellers_contacted:     body.sellers_contacted ?? 0,
        sellers_with_email:    body.sellers_with_email ?? 0,
        sellers_new_week:      body.sellers_new_week ?? 0,
        buyers_total:          body.buyers_total ?? 0,
        buyers_queued:         body.buyers_queued ?? 0,
        buyers_contacted:      body.buyers_contacted ?? 0,
        buyers_new_week:       body.buyers_new_week ?? 0,
        seller_campaign_active: body.seller_campaign_active ?? false,
        buyer_campaign_active:  body.buyer_campaign_active  ?? false,
        buyer_campaign_steps:   body.buyer_campaign_steps   ?? 0,
        agent_runs_week:        body.agent_runs_week ?? 0,
        total_cost_week:        body.total_cost_week ?? 0,
        notes:                  body.notes ?? null,
      }, { onConflict: 'report_date' })
      .select()
      .single()

    if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 })
    return NextResponse.json({ saved: true, id: data?.id })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

function buildChartData(reports: Record<string, unknown>[]) {
  return reports
    .slice(0, 8)
    .reverse()
    .map(r => ({
      week:      String(r.week_label ?? r.report_date ?? '').slice(0, 6),
      sellers_q: r.sellers_queued  as number ?? 0,
      sellers_c: r.sellers_contacted as number ?? 0,
      buyers_q:  r.buyers_queued   as number ?? 0,
      buyers_c:  r.buyers_contacted as number ?? 0,
    }))
}
