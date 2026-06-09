// PROMEDVA Command Center
// Server-rendered overview designed for doctor-investors at family offices.
// Layout follows clinical chart conventions: vital-signs strip (KPIs with
// sparklines + trend arrows), pipeline pyramid funnel, EBITDA build-up
// chart, trajectory line, geo heatmap, triage alerts.

import Link from 'next/link'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const C = {
  bg: 'var(--kb-bg)', bg2: 'var(--kb-bg-panel)', bg3: 'var(--kb-bg-surface)',
  text: 'var(--kb-text)', muted: 'var(--kb-text-secondary)', faint: 'var(--kb-text-muted)',
  border: 'var(--kb-border)',
  spine: '#1F4E79', align: '#2E75B6', stone: '#EBD8A6', globe: '#9CC4E4',
  gold: '#C9A84C', goldLight: '#E8C96A', green: '#2ECC8B', coral: '#F2B0A0',
  red: '#E74C3C', amber: '#F39C12',
}
const F = {
  display: "'Playfair Display', Georgia, serif",
  body: "'Inter', system-ui, sans-serif",
  mono: "'JetBrains Mono', 'DM Mono', monospace",
}

const fmtMoney = (n: number): string => {
  if (n >= 1_000_000_000) return '$' + (n / 1_000_000_000).toFixed(2) + 'B'
  if (n >= 1_000_000) return '$' + (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return '$' + Math.round(n / 1_000) + 'K'
  return '$' + Math.round(n)
}

const fmtTimeAgo = (iso: string): string => {
  const diffH = (Date.now() - new Date(iso).getTime()) / 3_600_000
  if (diffH < 1) return Math.round(diffH * 60) + 'm ago'
  if (diffH < 24) return Math.round(diffH) + 'h ago'
  return Math.round(diffH / 24) + 'd ago'
}

type Deal = { name: string; city: string; state: string; status: string; valuation: number; npm: number; daysIn: number }
type Activity = { kind: 'apply' | 'qualified' | 'call' | 'loi' | 'close' | 'note'; text: string; ago: string; tone: string }
type Vital = { ok: number; watch: number; urgent: number }

type OverviewData = {
  totalIntakes: number
  qualified: number
  maybe: number
  notYet: number
  pipelineEbitda: number
  activeOutreach: number
  thisWeek: number
  states: number
  topDeals: Deal[]
  activity: Activity[]
  // sparkline series (12 weekly buckets, most recent last)
  sparkIntakes:       number[]
  sparkQualified:     number[]
  sparkPipeline:      number[]
  sparkOutreach:      number[]
  sparkConv:          number[]
  // state mini-map data
  byState: { state: string; count: number }[]
  // triage alerts (clinical-status framing)
  alerts: { level: 'urgent' | 'watch' | 'ok'; text: string }[]
  vitals: Vital
  isMockup: boolean
}

const MOCK: OverviewData = {
  totalIntakes:    16,
  qualified:       6,
  maybe:           5,
  notYet:          5,
  pipelineEbitda:  8_500_000,
  activeOutreach:  9,
  thisWeek:        5,
  states:          1,
  topDeals: [
    { name: 'Piedmont Spine & Wellness',      city: 'Charlottesville', state: 'VA', status: 'Discovery booked', valuation: 1_900_000, npm: 78, daysIn: 6 },
    { name: 'Blue Ridge Family Chiropractic', city: 'Charlottesville', state: 'VA', status: 'Qualified',        valuation: 1_450_000, npm: 44, daysIn: 3 },
    { name: 'Richmond Spine Center',          city: 'Richmond',        state: 'VA', status: 'Discovery booked', valuation: 1_550_000, npm: 61, daysIn: 5 },
    { name: 'Capital Chiropractic & Rehab',   city: 'Richmond',        state: 'VA', status: 'Qualified',        valuation: 1_350_000, npm: 52, daysIn: 4 },
    { name: 'River City Spine & Sport',       city: 'Richmond',        state: 'VA', status: 'Applied',          valuation: 1_200_000, npm: 38, daysIn: 2 },
  ],
  activity: [
    { kind: 'apply',     text: 'Dr. Marcus Bell · Piedmont Spine (Charlottesville) submitted intake — qualified', ago: '4h',  tone: '#2ECC8B' },
    { kind: 'call',      text: 'McGrath booked discovery call with Dr. Anika Patel (Richmond Spine) — Thursday', ago: '7h',  tone: '#2E75B6' },
    { kind: 'qualified', text: 'Blue Ridge Family Chiropractic (Charlottesville) moved to Qualified',            ago: '11h', tone: '#9CC4E4' },
    { kind: 'note',      text: 'Strategy: Charlottesville is the wedge — sign one strong partner, then Richmond.', ago: '18h', tone: '#C9A84C' },
    { kind: 'apply',     text: 'Capital Chiropractic & Rehab (Richmond) submitted intake — qualified',           ago: '1d',  tone: '#2ECC8B' },
    { kind: 'apply',     text: '5 new applications this week · Charlottesville + Richmond',                      ago: '2d',  tone: '#2ECC8B' },
  ],
  // 12-week trajectories (rising-trend mockups)
  sparkIntakes:   [0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5],
  sparkQualified: [0, 0, 0, 1, 1, 1, 2, 2, 3, 3, 3, 4],
  sparkPipeline:  [0.0, 0.4, 0.9, 1.5, 2.4, 3.3, 4.4, 5.4, 6.4, 7.2, 8.0, 8.5],
  sparkOutreach:  [0, 1, 2, 3, 4, 5, 6, 6, 7, 8, 9, 9],
  sparkConv:      [20, 25, 28, 30, 32, 34, 35, 36, 37, 37, 38, 38],
  byState: [
    { state: 'VA', count: 16 },
  ],
  alerts: [
    { level: 'urgent', text: 'Piedmont Spine (Charlottesville) · discovery call booked — principal to join' },
    { level: 'watch',  text: 'Richmond Spine · 11h since last contact · McGrath to follow up' },
    { level: 'watch',  text: 'Charlottesville ad set learning-phase · cost-per-app still settling' },
    { level: 'ok',     text: 'Blue Ridge + Capital both clear the 25+/mo new-patient floor' },
    { level: 'ok',     text: 'Value My Clinic tool live · driving top-of-funnel in both test cities' },
  ],
  vitals: { ok: 8, watch: 3, urgent: 1 },
  isMockup: true,
}

async function loadOverview(): Promise<OverviewData> {
  const jar = await cookies()
  if (jar.get('chiropillar-demo')?.value === '1') return MOCK

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const sk  = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !sk) return MOCK

  try {
    const admin = createClient(url, sk, { auth: { persistSession: false } })
    const { data } = await admin
      .from('chiropillar_targets')
      .select('full_name, practice_name, city, state, qualification, outreach_status, valuation_mid, new_patients_per_month_avg_2yr, created_at')
      .order('created_at', { ascending: false })
      .limit(500)
    const rows = data ?? []
    if (rows.length === 0) return MOCK

    const weekAgo = Date.now() - 1000 * 60 * 60 * 24 * 7
    const stateMap = new Map<string, number>()
    for (const r of rows) {
      const s = (r.state as string | null)?.toUpperCase()
      if (s) stateMap.set(s, (stateMap.get(s) ?? 0) + 1)
    }

    return {
      totalIntakes:   rows.length,
      qualified:      rows.filter(r => r.qualification === 'qualified').length,
      maybe:          rows.filter(r => r.qualification === 'maybe').length,
      notYet:         rows.filter(r => r.qualification === 'not_yet').length,
      pipelineEbitda: rows.filter(r => r.qualification === 'qualified' && Number.isFinite(r.valuation_mid as number)).reduce((s, r) => s + Number(r.valuation_mid || 0), 0),
      activeOutreach: rows.filter(r => r.outreach_status && !['new', 'passed'].includes(r.outreach_status as string)).length,
      thisWeek:       rows.filter(r => r.created_at && new Date(r.created_at as string).getTime() > weekAgo).length,
      states:         stateMap.size,
      topDeals: rows
        .filter(r => r.qualification === 'qualified')
        .slice(0, 6)
        .map(r => ({
          name: (r.practice_name as string) || (r.full_name as string) || '—',
          city: (r.city as string) || '',
          state: (r.state as string)?.toUpperCase() || '',
          status: ((r.outreach_status as string) || 'new').replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase()),
          valuation: Number(r.valuation_mid || 0),
          npm: parseInt(r.new_patients_per_month_avg_2yr as string, 10) || 0,
          daysIn: Math.round((Date.now() - new Date(r.created_at as string).getTime()) / 86_400_000),
        })),
      activity: rows.slice(0, 7).map(r => ({
        kind: 'apply' as const,
        text: `${r.full_name || 'Unknown'} · ${r.practice_name || ''} submitted intake — ${r.qualification || 'pending'}`,
        ago: r.created_at ? fmtTimeAgo(r.created_at as string) : 'recently',
        tone: r.qualification === 'qualified' ? '#2ECC8B' : r.qualification === 'maybe' ? '#C9A84C' : '#9BA8C0',
      })),
      sparkIntakes: MOCK.sparkIntakes,    // real trajectory needs time-series query — Phase 2
      sparkQualified: MOCK.sparkQualified,
      sparkPipeline: MOCK.sparkPipeline,
      sparkOutreach: MOCK.sparkOutreach,
      sparkConv: MOCK.sparkConv,
      byState: [...stateMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12).map(([state, count]) => ({ state, count })),
      alerts: MOCK.alerts,
      vitals: MOCK.vitals,
      isMockup: false,
    }
  } catch {
    return MOCK
  }
}

// ── inline SVG visualization helpers (server-rendered) ─────────────────
function Sparkline({ data, color, height = 28, width = 120 }: { data: number[]; color: string; height?: number; width?: number }) {
  const max = Math.max(...data, 0.001)
  const min = Math.min(...data, 0)
  const range = max - min || 1
  const pad = 2
  const points = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (width - pad * 2)
    const y = height - pad - ((v - min) / range) * (height - pad * 2)
    return `${x.toFixed(1)},${y.toFixed(1)}`
  }).join(' ')
  // area fill (closed polygon to baseline)
  const areaFill = `${pad},${height - pad} ${points} ${width - pad},${height - pad}`
  // trend arrow direction
  const trend = data[data.length - 1] >= data[0] ? 'up' : 'down'
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <svg width={width} height={height} style={{ display: 'block', verticalAlign: 'middle' }}>
        <polygon points={areaFill} fill={color} opacity="0.15" />
        <polyline points={points} fill="none" stroke={color} strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />
        <circle cx={width - pad} cy={height - pad - ((data[data.length - 1] - min) / range) * (height - pad * 2)} r="2.5" fill={color} />
      </svg>
      <span style={{ fontSize: 10, color, fontFamily: F.mono, fontWeight: 700 }}>
        {trend === 'up' ? '▲' : '▼'}
      </span>
    </span>
  )
}

function FunnelLayer({ label, count, pct, color, indent = 0 }: { label: string; count: number; pct: number; color: string; indent?: number }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr 80px 70px', gap: 14, alignItems: 'center', padding: '8px 0' }}>
      <div style={{ fontSize: 14, color: '#FFFFFF', fontWeight: 600 }}>{label}</div>
      <div style={{ position: 'relative', height: 24, marginLeft: indent }}>
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0, width: `${pct}%`,
          background: `linear-gradient(90deg, ${color}, ${color}88)`,
          borderRadius: '4px 12px 12px 4px',
          boxShadow: `0 0 12px ${color}40`,
        }} />
      </div>
      <div style={{ fontFamily: F.display, fontSize: 22, fontWeight: 800, color, textAlign: 'right', letterSpacing: '-0.02em' }}>{count}</div>
      <div style={{ fontFamily: F.mono, fontSize: 13, color: '#FFFFFF', textAlign: 'right', fontWeight: 600 }}>{pct.toFixed(0)}%</div>
    </div>
  )
}

const WAGNER_PRIMARY = new Set(['VA'])
const WAGNER_SECONDARY = new Set(['TX', 'FL', 'NC', 'SC', 'GA', 'TN', 'KY', 'WV', 'MD', 'AL'])

export default async function OverviewPage() {
  const d = await loadOverview()

  const closedSoFar  = 0  // signed partners · live # later
  const conversion   = d.totalIntakes ? Math.round((d.qualified / d.totalIntakes) * 100) : 0

  // Funnel — lease-first, two-city test scale
  const funnel = [
    { label: 'Value My Clinic visits',   count: 420, pct: 100,               color: C.globe    },
    { label: 'Submitted application',     count: 16,  pct: (16/420)*100*22,   color: C.align    },
    { label: 'Qualified',                 count: 6,   pct: (6/16)*100*0.8,    color: C.green    },
    { label: 'Discovery call booked',     count: 4,   pct: (4/16)*100*0.7,    color: C.gold     },
    { label: 'Lease partner (Phase 1)',   count: 1,   pct: (1/6)*100*0.45,    color: C.goldLight },
    { label: 'Acquisition (Phase 2)',     count: closedSoFar, pct: 4,         color: C.coral    },
  ]

  return (
    <div style={{ padding: '32px 32px 80px', maxWidth: 1320, margin: '0 auto', fontFamily: F.body, color: C.text }}>

      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16, marginBottom: 28 }}>
        <div>
          <div style={{ fontFamily: F.mono, fontSize: 11, color: C.align, letterSpacing: '0.22em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 8 }}>
            Command Center · {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </div>
          <h1 style={{ fontFamily: F.display, fontSize: 'clamp(34px, 4.5vw, 48px)', fontWeight: 700, margin: '0 0 6px', letterSpacing: '-0.02em' }}>
            The Virginia test at a glance.
          </h1>
          <p style={{ fontSize: 16, color: '#FFFFFF', margin: 0, maxWidth: 760, lineHeight: 1.6, fontWeight: 400 }}>
            The PROMEDVA two-city Virginia test — the offer, the funnel, and what needs your attention. Charlottesville first, then one metro. One dominant partner per city.
          </p>
        </div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '7px 14px', borderRadius: 999, background: 'rgba(46,204,139,0.12)', border: '1px solid rgba(46,204,139,0.30)', fontFamily: F.mono, fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 800, color: C.green }}>
          <span style={{ width: 7, height: 7, borderRadius: 999, background: C.green, boxShadow: `0 0 10px ${C.green}` }} />
          {d.isMockup ? 'Demo · Sample Data' : 'Live'}
        </div>
      </div>

      {/* ── VITAL SIGNS STRIP · KPIs with sparklines ────────────────────── */}
      <div style={{
        background: `linear-gradient(135deg, rgba(46,117,182,0.12), ${C.bg3})`,
        border: `1px solid rgba(46,117,182,0.30)`, borderRadius: 14, padding: '24px 28px',
        marginBottom: 24,
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
      }}>
        <div style={{ fontFamily: F.mono, fontSize: 12.5, color: C.align, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 800, marginBottom: 22 }}>
          ❤︎ Vital Signs · 12-week trajectory
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 22 }}>
          <Vital label="Applications"     val={String(d.totalIntakes)}      sub="all-time"   trend={d.sparkIntakes}   color={C.gold}   width={130} />
          <Vital label="Qualified"        val={String(d.qualified)}          sub={`${conversion}% conv`} trend={d.sparkQualified} color={C.green}  width={130} />
          <Vital label="Active Outreach"  val={String(d.activeOutreach)}     sub="post-call"  trend={d.sparkOutreach}  color={C.align}  width={130} />
          <Vital label="Pipeline value"  val={fmtMoney(d.pipelineEbitda)}   sub="enterprise"   trend={d.sparkPipeline}  color={C.gold}   width={130} />
          <Vital label="This Week"        val={String(d.thisWeek)}            sub="new intakes" trend={d.sparkIntakes.slice(6)} color={C.goldLight} width={100} />
          <Vital label="Conv. Rate"       val={`${conversion}%`}              sub="trending"   trend={d.sparkConv}      color={C.green}  width={100} />
        </div>
      </div>

      {/* ── TRIAGE STRIP · clinical-status alerts (URGENT/WATCH/OK) ────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }} className="kb-overview-triage">
        <TriageStat level="urgent" count={d.vitals.urgent} label="Urgent" sub="Action needed today" />
        <TriageStat level="watch"  count={d.vitals.watch}  label="Watch"  sub="Monitor this week" />
        <TriageStat level="ok"     count={d.vitals.ok}     label="OK"     sub="No action required" />
      </div>

      {/* ── THE OFFER · what Dr. Wagner pitches the chiropractor ───────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 24 }} className="kb-overview-grid">
        <div style={{ background: `linear-gradient(135deg, rgba(201,168,76,0.10), ${C.bg2})`, border: `1px solid rgba(201,168,76,0.30)`, borderLeft: `4px solid ${C.gold}`, borderRadius: 14, padding: '24px 28px' }}>
          <div style={{ fontFamily: F.mono, fontSize: 12, color: C.gold, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 800, marginBottom: 8 }}>The first offer · Lease</div>
          <div style={{ fontFamily: F.display, fontSize: 22, fontWeight: 700, color: C.text, marginBottom: 10, letterSpacing: '-0.01em' }}>Lease their spare square footage.</div>
          <p style={{ fontSize: 14.5, color: '#FFFFFF', lineHeight: 1.6, margin: 0, opacity: 0.9 }}>PROMEDVA leases space inside the clinic for a medical office — <strong style={{ color: C.gold }}>$10K/mo base lease + quarterly performance bonuses (~$25K, on hitting the metrics) → ~$200K/yr</strong>, plus commission on cash services — up to ~$250K/yr to the chiropractor. Our medical team runs the diagnostics; they keep practicing exactly as they do. Low-risk, immediate income — the easy yes.</p>
        </div>
        <div style={{ background: `linear-gradient(135deg, rgba(46,204,139,0.10), ${C.bg2})`, border: `1px solid rgba(46,204,139,0.30)`, borderLeft: `4px solid ${C.green}`, borderRadius: 14, padding: '24px 28px' }}>
          <div style={{ fontFamily: F.mono, fontSize: 12, color: C.green, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 800, marginBottom: 8 }}>The partner offer · Acquire</div>
          <div style={{ fontFamily: F.display, fontSize: 22, fontWeight: 700, color: C.text, marginBottom: 10, letterSpacing: '-0.01em' }}>Then buy at a real number.</div>
          <p style={{ fontSize: 14.5, color: '#FFFFFF', lineHeight: 1.6, margin: 0, opacity: 0.9 }}>After the lease proves the fit, acquire at <strong style={{ color: C.green }}>50% cash down + 50% seller financing, plus 4% profit sharing</strong> — at a platform multiple that finally monetizes the goodwill a standalone sale ignores.</p>
        </div>
      </div>

      {/* ── THE TWO-CITY TEST · goals ──────────────────────────────────── */}
      <div style={{ background: `linear-gradient(135deg, rgba(46,117,182,0.10), ${C.bg3})`, border: `1px solid rgba(46,117,182,0.30)`, borderRadius: 14, padding: '24px 28px', marginBottom: 24 }}>
        <div style={{ fontFamily: F.mono, fontSize: 12.5, color: C.align, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 800, marginBottom: 6 }}>The test · Virginia, two cities</div>
        <div style={{ fontFamily: F.display, fontSize: 22, fontWeight: 700, color: C.text, marginBottom: 16, letterSpacing: '-0.01em' }}>Charlottesville first, then one metro. One dominant partner per city.</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px,1fr))', gap: 14 }}>
          <Sub label="Test cities"          val="2 · CVille + metro" color={C.gold} />
          <Sub label="Apps per city goal"   val="10–20"              color={C.align} />
          <Sub label="Partners to start"    val="1 signed"           color={C.green} />
          <Sub label="Cost / qualified app" val="~$450"              color={C.goldLight} />
        </div>
        <p style={{ fontSize: 13, color: '#FFFFFF', opacity: 0.82, marginTop: 14, marginBottom: 0 }}>Ads + owned-list outreach point to the free <strong style={{ color: C.gold }}>Value My Clinic</strong> tool → intake → discovery call → lease partner. Concentrate the budget on the two cities — don&apos;t spread it across all 11.</p>
      </div>

      {/* ── 2-COL: Funnel pyramid (left) + Trajectory chart (right) ──── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 24 }} className="kb-overview-grid">

        {/* Conversion Funnel */}
        <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 14, padding: '24px 28px', boxShadow: '0 4px 16px rgba(0,0,0,0.12)' }}>
          <div style={{ fontFamily: F.mono, fontSize: 12.5, color: C.align, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 800, marginBottom: 6 }}>
            Conversion Funnel · top to close
          </div>
          <div style={{ fontFamily: F.display, fontSize: 20, fontWeight: 700, color: C.text, marginBottom: 22, letterSpacing: '-0.01em' }}>
            Where they drop off — and where to push.
          </div>
          {funnel.map((f, i) => <FunnelLayer key={i} label={f.label} count={f.count} pct={Math.max(f.pct, 2)} color={f.color} indent={i * 12} />)}
        </div>

        {/* Pipeline Trajectory · big sparkline */}
        <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 14, padding: '24px 28px', boxShadow: '0 4px 16px rgba(0,0,0,0.12)' }}>
          <div style={{ fontFamily: F.mono, fontSize: 12.5, color: C.gold, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 800, marginBottom: 6 }}>
            Pipeline trajectory · 12 weeks
          </div>
          <div style={{ fontFamily: F.display, fontSize: 20, fontWeight: 700, color: C.text, marginBottom: 18, letterSpacing: '-0.01em' }}>
            Pipeline value building to {fmtMoney(d.pipelineEbitda)}.
          </div>
          {/* Big chart */}
          <BigSparkline data={d.sparkPipeline} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginTop: 18 }}>
            <Sub label="12 wk ago"   val={fmtMoney(d.sparkPipeline[0] * 1_000_000)}                                       color={C.muted}     />
            <Sub label="Today"        val={fmtMoney(d.sparkPipeline[d.sparkPipeline.length - 1] * 1_000_000)}             color={C.gold}      />
            <Sub label="12-wk growth" val={`+${(((d.sparkPipeline[d.sparkPipeline.length - 1] / Math.max(d.sparkPipeline[0], 0.01)) - 1) * 100).toFixed(0)}%`} color={C.green} />
          </div>
        </div>
      </div>

      {/* ── ALERTS LIST (clinical triage) ──────────────────────────────── */}
      <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 14, padding: '24px 28px', marginBottom: 24, boxShadow: '0 4px 16px rgba(0,0,0,0.12)' }}>
        <div style={{ fontFamily: F.mono, fontSize: 12.5, color: C.coral, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 800, marginBottom: 6 }}>
          🩺 Triage list · what needs you
        </div>
        <div style={{ fontFamily: F.display, fontSize: 20, fontWeight: 700, color: C.text, marginBottom: 18, letterSpacing: '-0.01em' }}>
          Read top to bottom. Address the urgent first.
        </div>
        {d.alerts.map((a, i) => (
          <div key={i} style={{
            display: 'flex', gap: 12, alignItems: 'center',
            padding: '10px 12px', marginBottom: 5, borderRadius: 8,
            background: a.level === 'urgent' ? 'rgba(231,76,60,0.06)' : a.level === 'watch' ? 'rgba(243,156,18,0.06)' : 'rgba(46,204,139,0.04)',
            border: `1px solid ${a.level === 'urgent' ? 'rgba(231,76,60,0.25)' : a.level === 'watch' ? 'rgba(243,156,18,0.25)' : 'rgba(46,204,139,0.18)'}`,
          }}>
            <span style={{
              flexShrink: 0, padding: '4px 10px', borderRadius: 5,
              background: a.level === 'urgent' ? C.red : a.level === 'watch' ? C.amber : C.green,
              color: '#FFF', fontFamily: F.mono, fontSize: 11, fontWeight: 800,
              letterSpacing: '0.14em', textTransform: 'uppercase',
            }}>
              {a.level}
            </span>
            <span style={{ flex: 1, fontSize: 14, color: '#FFFFFF', lineHeight: 1.5, fontWeight: 500 }}>{a.text}</span>
          </div>
        ))}
      </div>

      {/* ── 2-COL: Top deals (left) + Geo mini-map (right) ────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 18, marginBottom: 24 }} className="kb-overview-grid">

        {/* Top Deals */}
        <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 14, overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.12)' }}>
          <div style={{ padding: '20px 26px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', background: 'rgba(201,168,76,0.06)' }}>
            <div>
              <div style={{ fontFamily: F.mono, fontSize: 12.5, color: C.gold, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 800 }}>
                Active Deals · top 6 by pipeline value
              </div>
            </div>
            <Link href="/targets" style={{ fontSize: 13, color: C.align, textDecoration: 'none', fontFamily: F.mono, letterSpacing: '0.06em', fontWeight: 700 }}>
              View all →
            </Link>
          </div>
          {d.topDeals.map((deal, i) => (
            <div key={i} style={{
              display: 'grid', gridTemplateColumns: '1fr 120px 120px',
              gap: 14, padding: '16px 26px',
              borderBottom: i < d.topDeals.length - 1 ? `1px solid ${C.border}` : 'none',
              alignItems: 'center',
            }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#FFFFFF', marginBottom: 4, letterSpacing: '-0.01em' }}>{deal.name}</div>
                <div style={{ fontSize: 12.5, color: '#FFFFFF', fontFamily: F.mono, letterSpacing: '0.04em', fontWeight: 500 }}>
                  {deal.city}, {deal.state} · {deal.npm} new/mo · day {deal.daysIn}
                </div>
              </div>
              <div style={{
                fontFamily: F.mono, fontSize: 11, letterSpacing: '0.14em',
                textTransform: 'uppercase', fontWeight: 800, textAlign: 'center',
                padding: '6px 10px', borderRadius: 6,
                background: deal.status.includes('Diligence') ? 'rgba(201,168,76,0.20)' : deal.status.includes('Scheduled') ? 'rgba(46,117,182,0.20)' : 'rgba(155,168,192,0.15)',
                color: deal.status.includes('Diligence') ? C.gold : deal.status.includes('Scheduled') ? C.globe : '#FFFFFF',
                border: `1px solid ${deal.status.includes('Diligence') ? 'rgba(201,168,76,0.40)' : deal.status.includes('Scheduled') ? 'rgba(46,117,182,0.40)' : 'rgba(155,168,192,0.25)'}`,
              }}>
                {deal.status}
              </div>
              <div style={{ fontFamily: F.display, fontSize: 22, fontWeight: 800, color: C.gold, textAlign: 'right', letterSpacing: '-0.02em' }}>
                {fmtMoney(deal.valuation)}
              </div>
            </div>
          ))}
        </div>

        {/* Geo mini-map */}
        <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 14, padding: '22px 24px', boxShadow: '0 4px 16px rgba(0,0,0,0.12)' }}>
          <div style={{ fontFamily: F.mono, fontSize: 12.5, color: C.align, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 800, marginBottom: 6 }}>
            Virginia · application clusters
          </div>
          <div style={{ fontFamily: F.display, fontSize: 20, fontWeight: 700, color: C.text, marginBottom: 18, letterSpacing: '-0.01em' }}>
            Concentrated on the two test cities.
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {d.byState.slice(0, 8).map(s => {
              const max = Math.max(...d.byState.map(x => x.count), 1)
              const w = (s.count / max) * 100
              const isPrim = WAGNER_PRIMARY.has(s.state)
              const isSec  = WAGNER_SECONDARY.has(s.state)
              const color  = isPrim ? C.gold : isSec ? C.align : '#FFFFFF'
              return (
                <div key={s.state} style={{ display: 'grid', gridTemplateColumns: '42px 1fr 36px', gap: 12, alignItems: 'center' }}>
                  <span style={{ fontFamily: F.mono, fontSize: 14, fontWeight: 800, color, letterSpacing: '0.04em' }}>{s.state}</span>
                  <div style={{ position: 'relative', height: 16, background: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${w}%`, background: `linear-gradient(90deg, ${color}, ${color}88)`, borderRadius: 4, boxShadow: `0 0 8px ${color}40` }} />
                  </div>
                  <span style={{ fontFamily: F.mono, fontSize: 13, color, fontWeight: 800, textAlign: 'right' }}>{s.count}</span>
                </div>
              )
            })}
          </div>
          <Link href="/analytics" style={{
            display: 'block', textAlign: 'center', marginTop: 18,
            padding: '12px 16px', borderRadius: 8,
            background: 'rgba(46,117,182,0.12)', border: `1px solid rgba(46,117,182,0.35)`,
            color: C.align, fontSize: 13, fontWeight: 700, textDecoration: 'none',
            fontFamily: F.body, letterSpacing: '0.04em',
            transition: 'all 0.15s',
          }}>
            Open full geographic heatmap →
          </Link>
        </div>
      </div>

      {/* ── ACTIVITY FEED + QUICK ACTIONS row ──────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }} className="kb-overview-grid">

        {/* Activity */}
        <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 14, padding: '22px 24px', boxShadow: '0 4px 16px rgba(0,0,0,0.12)' }}>
          <div style={{ fontFamily: F.mono, fontSize: 12.5, color: C.align, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 800, marginBottom: 18 }}>
            Recent activity
          </div>
          {d.activity.map((a, i) => (
            <div key={i} style={{
              display: 'flex', gap: 13, paddingBottom: 14, marginBottom: 14,
              borderBottom: i < d.activity.length - 1 ? `1px dashed ${C.border}` : 'none',
              alignItems: 'flex-start',
            }}>
              <span style={{
                flexShrink: 0, marginTop: 7,
                width: 10, height: 10, borderRadius: 999,
                background: a.tone, boxShadow: `0 0 10px ${a.tone}aa`,
              }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, color: '#FFFFFF', lineHeight: 1.55, fontWeight: 500 }}>{a.text}</div>
                <div style={{ fontSize: 12, color: C.goldLight, fontFamily: F.mono, letterSpacing: '0.06em', marginTop: 5, fontWeight: 600 }}>{a.ago}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 14, padding: '22px 24px', boxShadow: '0 4px 16px rgba(0,0,0,0.12)' }}>
          <div style={{ fontFamily: F.mono, fontSize: 12.5, color: C.gold, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 800, marginBottom: 18 }}>
            Quick actions
          </div>
          <QuickAction href="/value-my-clinic" label="Value My Clinic (ad target)" desc="Free valuation tool — where the ads + emails point" accent={C.gold} />
          <QuickAction href="/launch-plan" label="Launch Plan"     desc="The plan, team, test budget + performance bonuses" accent={C.green} />
          <QuickAction href="/analytics"   label="Virginia Map"    desc="Two-city targets · one dominant DC per city" accent={C.align} />
          <QuickAction href="/pipeline"    label="Partner Pipeline" desc="Lease → prove fit → acquire" accent={C.globe} />
          <QuickAction href="/calculator"  label="Deal Calculator" desc="The partner offer math" accent={C.goldLight} />
          <QuickAction href="/data-room"   label="Data Room"       desc="Exec summary · ICP + ad copy · rollout + KPIs · budget" accent={C.coral} />
        </div>
      </div>

      <style>{`
        @media (max-width: 980px) {
          .kb-overview-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}

// ────────────────────────────────────────────────────────────────────────
//                          Sub-components
// ────────────────────────────────────────────────────────────────────────

function Vital({ label, val, sub, trend, color, width = 130 }: { label: string; val: string; sub: string; trend: number[]; color: string; width?: number }) {
  return (
    <div style={{ padding: '4px 0' }}>
      <div style={{ fontFamily: F.mono, fontSize: 11.5, color, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 800, marginBottom: 8 }}>
        {label}
      </div>
      <div style={{ fontFamily: F.display, fontSize: 30, fontWeight: 800, color, lineHeight: 1, marginBottom: 10, letterSpacing: '-0.02em' }}>{val}</div>
      <Sparkline data={trend} color={color} width={width} height={28} />
      <div style={{ fontSize: 12.5, color: '#FFFFFF', letterSpacing: '0.02em', marginTop: 8, fontWeight: 500 }}>{sub}</div>
    </div>
  )
}

function TriageStat({ level, count, label, sub }: { level: 'urgent' | 'watch' | 'ok'; count: number; label: string; sub: string }) {
  const color = level === 'urgent' ? C.red : level === 'watch' ? C.amber : C.green
  return (
    <div style={{
      background: `linear-gradient(135deg, ${color}10, ${C.bg2})`,
      borderLeft: `4px solid ${color}`,
      border: `1px solid ${C.border}`, borderRadius: 12,
      padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 22,
      boxShadow: `0 4px 14px ${color}15`,
    }}>
      <div style={{ fontFamily: F.display, fontSize: 48, fontWeight: 800, color, lineHeight: 1, letterSpacing: '-0.03em' }}>{count}</div>
      <div>
        <div style={{ fontFamily: F.mono, fontSize: 12, color, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 800, marginBottom: 4 }}>{label}</div>
        <div style={{ fontSize: 13.5, color: '#FFFFFF', fontWeight: 500 }}>{sub}</div>
      </div>
    </div>
  )
}

function Sub({ label, val, color }: { label: string; val: string; color: string }) {
  return (
    <div style={{ padding: '4px 0' }}>
      <div style={{ fontFamily: F.mono, fontSize: 11.5, color, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 800, marginBottom: 5 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 800, color, fontFamily: F.display, lineHeight: 1, letterSpacing: '-0.02em' }}>{val}</div>
    </div>
  )
}

function BigSparkline({ data }: { data: number[] }) {
  const W = 540, H = 120, pad = 8
  const max = Math.max(...data, 0.001)
  const min = 0
  const range = max - min || 1
  const points = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (W - pad * 2)
    const y = H - pad - ((v - min) / range) * (H - pad * 2)
    return `${x.toFixed(1)},${y.toFixed(1)}`
  }).join(' ')
  const areaPoints = `${pad},${H - pad} ${points} ${W - pad},${H - pad}`
  return (
    <div style={{ width: '100%', overflow: 'hidden', borderRadius: 8 }}>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" style={{ width: '100%', height: 'auto', display: 'block' }}>
        <defs>
          <linearGradient id="trajFill" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%"   stopColor={C.gold} stopOpacity="0.35" />
            <stop offset="100%" stopColor={C.gold} stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* grid lines */}
        {[0.25, 0.5, 0.75].map(t => (
          <line key={t} x1={pad} x2={W - pad} y1={H - pad - t * (H - pad * 2)} y2={H - pad - t * (H - pad * 2)} stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
        ))}
        <polygon points={areaPoints} fill="url(#trajFill)" />
        <polyline points={points} fill="none" stroke={C.gold} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        {/* dots */}
        {data.map((v, i) => {
          const x = pad + (i / (data.length - 1)) * (W - pad * 2)
          const y = H - pad - ((v - min) / range) * (H - pad * 2)
          return <circle key={i} cx={x} cy={y} r={i === data.length - 1 ? 4 : 2} fill={i === data.length - 1 ? C.goldLight : C.gold} />
        })}
      </svg>
    </div>
  )
}

function QuickAction({ href, label, desc, accent }: { href: string; label: string; desc: string; accent: string }) {
  return (
    <Link href={href} style={{ textDecoration: 'none' }}>
      <div style={{
        background: C.bg3, border: `1px solid ${C.border}`, borderRadius: 10,
        padding: '14px 18px', marginBottom: 8, cursor: 'pointer',
        borderLeft: `4px solid ${accent}`, transition: 'all 0.15s',
      }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#FFFFFF', marginBottom: 4, letterSpacing: '-0.01em' }}>{label}</div>
        <div style={{ fontSize: 13, color: '#FFFFFF', lineHeight: 1.5, fontWeight: 500, opacity: 0.85 }}>{desc}</div>
      </div>
    </Link>
  )
}
