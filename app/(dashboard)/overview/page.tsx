// ChiroPillar Command Center · live overview
// Server component pulls live state + falls back to mockup when production
// DB is empty (pre-launch) so the surface looks alive in every condition.
// Layout mirrors the KB Overview pattern: KPI strip, deal cards, activity
// feed, EBITDA tracker, quick actions, geographic snapshot.

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

type OverviewData = {
  totalIntakes: number
  qualified: number
  maybe: number
  notYet: number
  pipelineEbitda: number
  activeOutreach: number
  thisWeek: number
  states: number
  topDeals: Array<{ name: string; city: string; state: string; status: string; valuation: number; npm: number; daysIn: number }>
  activity: Array<{ kind: 'apply' | 'qualified' | 'call' | 'loi' | 'close' | 'note'; text: string; ago: string; tone: string }>
  isMockup: boolean
}

const MOCK: OverviewData = {
  totalIntakes:    47,
  qualified:       21,
  maybe:           14,
  notYet:          12,
  pipelineEbitda:  9_800_000,
  activeOutreach:  31,
  thisWeek:        8,
  states:          10,
  topDeals: [
    { name: 'Piedmont Spine & Wellness', city: 'Charlottesville', state: 'VA', status: 'In Diligence',   valuation: 1_900_000, npm: 78, daysIn: 14 },
    { name: 'Dallas Alignment & Sport',  city: 'Plano',           state: 'TX', status: 'In Diligence',   valuation: 2_350_000, npm: 88, daysIn: 11 },
    { name: 'Savannah Spine Group',      city: 'Savannah',        state: 'GA', status: 'In Diligence',   valuation: 2_050_000, npm: 72, daysIn: 9  },
    { name: 'Richmond Spine Center',     city: 'Richmond',        state: 'VA', status: 'Called',          valuation: 1_550_000, npm: 61, daysIn: 5  },
    { name: 'Blue Ridge Chiropractic',   city: 'Roanoke',         state: 'VA', status: 'Scheduled',       valuation: 1_350_000, npm: 52, daysIn: 4  },
    { name: 'Tampa Bay Spine Care',      city: 'Tampa',           state: 'FL', status: 'Called',          valuation: 1_300_000, npm: 49, daysIn: 6  },
  ],
  activity: [
    { kind: 'apply',     text: 'Dr. Marcus Bell · Piedmont Spine submitted intake — qualified',                                ago: '4h',   tone: '#2ECC8B' },
    { kind: 'call',      text: 'McGrath logged call with Dr. Brandon Cooper (Dallas Alignment) — 42 min',                       ago: '7h',   tone: '#2E75B6' },
    { kind: 'qualified', text: 'Dr. Anika Patel · Richmond Spine moved to Called',                                              ago: '11h',  tone: '#9CC4E4' },
    { kind: 'note',      text: 'Wagner: "Dallas + Richmond should pair on same LOI. Mirror clinic ops."',                       ago: '18h',  tone: '#C9A84C' },
    { kind: 'apply',     text: 'Dr. Daniel Ortiz · Nashville Alignment submitted intake — qualified',                          ago: '1d',   tone: '#2ECC8B' },
    { kind: 'loi',       text: 'Dr. Robert Hayes · Savannah Spine LOI drafted — sent to legal',                                ago: '2d',   tone: '#C9A84C' },
    { kind: 'apply',     text: '8 new intake submissions this week · TX, VA, FL clustering',                                    ago: '2d',   tone: '#2ECC8B' },
  ],
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
    const stateSet = new Set(rows.map(r => (r.state as string | null)?.toUpperCase()).filter(Boolean))

    return {
      totalIntakes:   rows.length,
      qualified:      rows.filter(r => r.qualification === 'qualified').length,
      maybe:          rows.filter(r => r.qualification === 'maybe').length,
      notYet:         rows.filter(r => r.qualification === 'not_yet').length,
      pipelineEbitda: rows.filter(r => r.qualification === 'qualified' && Number.isFinite(r.valuation_mid as number)).reduce((s, r) => s + Number(r.valuation_mid || 0), 0),
      activeOutreach: rows.filter(r => r.outreach_status && !['new', 'passed'].includes(r.outreach_status as string)).length,
      thisWeek:       rows.filter(r => r.created_at && new Date(r.created_at as string).getTime() > weekAgo).length,
      states:         stateSet.size,
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
      isMockup: false,
    }
  } catch {
    return MOCK
  }
}

export default async function OverviewPage() {
  const d = await loadOverview()

  // Wagner+ChiroPillar platform EBITDA target
  const wagnerBase = 25_000_000
  const chiroTarget = 20_000_000
  const platformTarget = wagnerBase + chiroTarget // $45M
  const progress = Math.min((d.pipelineEbitda / chiroTarget) * 100, 100)

  return (
    <div style={{ padding: '32px 32px 80px', maxWidth: 1280, margin: '0 auto', fontFamily: F.body, color: C.text }}>

      {/* HEADER + LIVE BADGE */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16, marginBottom: 28 }}>
        <div>
          <div style={{ fontFamily: F.mono, fontSize: 11, color: C.align, letterSpacing: '0.22em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 8 }}>
            Command Center · {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </div>
          <h1 style={{ fontFamily: F.display, fontSize: 'clamp(34px, 4.5vw, 48px)', fontWeight: 700, margin: '0 0 6px', letterSpacing: '-0.02em' }}>
            ChiroPillar at a glance.
          </h1>
          <p style={{ fontSize: 15, color: C.muted, margin: 0, maxWidth: 760, lineHeight: 1.55 }}>
            Every number that matters on one screen — pipeline · qualification · geography · combined-EBITDA tracker against the $45M target.
          </p>
        </div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '7px 14px', borderRadius: 999, background: 'rgba(46,204,139,0.12)', border: '1px solid rgba(46,204,139,0.30)', fontFamily: F.mono, fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 800, color: C.green }}>
          <span style={{ width: 7, height: 7, borderRadius: 999, background: C.green, boxShadow: `0 0 10px ${C.green}` }} />
          {d.isMockup ? 'Demo · Sample Data' : 'Live'}
        </div>
      </div>

      {/* KPI STRIP */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14,
        background: `linear-gradient(135deg, rgba(46,117,182,0.10), ${C.bg3})`,
        border: `1px solid ${C.border}`, borderRadius: 14, padding: '22px 26px',
        marginBottom: 32,
      }}>
        <Kpi label="Applications"    val={String(d.totalIntakes)}      color={C.gold}      sub="all-time" />
        <Kpi label="Qualified"       val={String(d.qualified)}          color={C.green}     sub={`${Math.round((d.qualified / Math.max(d.totalIntakes, 1)) * 100)}% conv`} />
        <Kpi label="Active Outreach" val={String(d.activeOutreach)}     color={C.align}     sub="post-call" />
        <Kpi label="Pipeline EBITDA" val={fmtMoney(d.pipelineEbitda)}   color={C.gold}      sub="weighted" />
        <Kpi label="This Week"       val={String(d.thisWeek)}            color={C.goldLight} sub="new intakes" />
        <Kpi label="States Active"   val={String(d.states)}              color={C.globe}     sub="Wagner geo" />
      </div>

      {/* 2-col: Deals on left, Activity + EBITDA tracker on right */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.65fr) minmax(280px,1fr)', gap: 18, marginBottom: 32 }} className="kb-overview-grid">

        {/* ── TOP DEALS ────────────────────────────────────────────────── */}
        <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ padding: '18px 24px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <div>
              <div style={{ fontFamily: F.mono, fontSize: 10, color: C.gold, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 700 }}>
                Active Deals · top 6 by pipeline value
              </div>
              <div style={{ fontFamily: F.display, fontSize: 18, fontWeight: 600, color: C.text, marginTop: 4 }}>
                Where the platform is winning.
              </div>
            </div>
            <Link href="/targets" style={{ fontSize: 12, color: C.align, textDecoration: 'none', fontFamily: F.mono, letterSpacing: '0.06em' }}>
              View all →
            </Link>
          </div>
          <div>
            {d.topDeals.map((deal, i) => (
              <div key={i} style={{
                display: 'grid', gridTemplateColumns: '1fr 110px 110px 120px',
                gap: 12, padding: '14px 24px',
                borderBottom: i < d.topDeals.length - 1 ? `1px solid ${C.border}` : 'none',
                alignItems: 'center',
              }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 2 }}>{deal.name}</div>
                  <div style={{ fontSize: 12, color: C.muted, fontFamily: F.mono, letterSpacing: '0.04em' }}>
                    {deal.city}, {deal.state} · {deal.npm} new/mo · day {deal.daysIn}
                  </div>
                </div>
                <div style={{
                  fontFamily: F.mono, fontSize: 10, letterSpacing: '0.14em',
                  textTransform: 'uppercase', fontWeight: 700, textAlign: 'center',
                  padding: '4px 8px', borderRadius: 6,
                  background: deal.status.includes('Diligence') ? 'rgba(201,168,76,0.15)' : deal.status.includes('Scheduled') ? 'rgba(46,117,182,0.15)' : 'rgba(155,168,192,0.12)',
                  color: deal.status.includes('Diligence') ? C.gold : deal.status.includes('Scheduled') ? C.align : C.muted,
                }}>
                  {deal.status}
                </div>
                <div style={{ fontFamily: F.display, fontSize: 18, fontWeight: 700, color: C.gold, textAlign: 'right' }}>
                  {fmtMoney(deal.valuation)}
                </div>
                <Link href={`/targets`} style={{ fontSize: 12, color: C.align, textAlign: 'right', textDecoration: 'none', fontFamily: F.mono, letterSpacing: '0.04em' }}>
                  Open →
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* ── ACTIVITY FEED + EBITDA TRACKER ──────────────────────────── */}
        <div style={{ display: 'grid', gap: 18 }}>

          {/* EBITDA tracker */}
          <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 14, padding: '20px 22px' }}>
            <div style={{ fontFamily: F.mono, fontSize: 10, color: C.gold, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 4 }}>
              Combined Platform EBITDA
            </div>
            <div style={{ fontFamily: F.display, fontSize: 16, color: C.text, fontWeight: 600, marginBottom: 16 }}>
              Wagner $25M + ChiroPillar $20M+ target
            </div>

            {/* Tracker bar */}
            <div style={{ position: 'relative', height: 16, background: 'rgba(255,255,255,0.05)', borderRadius: 8, overflow: 'hidden', marginBottom: 8 }}>
              {/* Wagner base */}
              <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${(wagnerBase / platformTarget) * 100}%`, background: C.align, borderRadius: 8 }} />
              {/* ChiroPillar pipeline portion */}
              <div style={{ position: 'absolute', left: `${(wagnerBase / platformTarget) * 100}%`, top: 0, bottom: 0, width: `${(d.pipelineEbitda / platformTarget) * 100}%`, background: `linear-gradient(90deg, ${C.gold}, ${C.goldLight})` }} />
              {/* Target marker */}
              <div style={{ position: 'absolute', right: 0, top: -3, bottom: -3, width: 2, background: 'rgba(255,255,255,0.45)' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: F.mono, fontSize: 10, color: C.faint, letterSpacing: '0.04em', marginBottom: 14 }}>
              <span>$0</span>
              <span style={{ color: C.align }}>${wagnerBase / 1_000_000}M Wagner</span>
              <span style={{ color: C.text }}>${platformTarget / 1_000_000}M target</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 14 }}>
              <KvSmall label="ChiroPillar pipeline" val={fmtMoney(d.pipelineEbitda)} color={C.gold} />
              <KvSmall label="Combined total" val={fmtMoney(wagnerBase + d.pipelineEbitda)} color={C.text} />
              <KvSmall label="% to ChiroPillar goal" val={`${progress.toFixed(0)}%`} color={C.green} />
              <KvSmall label="Implied exit @ 9×" val={fmtMoney((wagnerBase + d.pipelineEbitda) * 9)} color={C.goldLight} />
            </div>
          </div>

          {/* Activity feed */}
          <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 14, padding: '20px 22px' }}>
            <div style={{ fontFamily: F.mono, fontSize: 10, color: C.align, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 14 }}>
              Recent activity
            </div>
            <div>
              {d.activity.map((a, i) => (
                <div key={i} style={{
                  display: 'flex', gap: 11, paddingBottom: 12, marginBottom: 12,
                  borderBottom: i < d.activity.length - 1 ? `1px dashed ${C.border}` : 'none',
                  alignItems: 'flex-start',
                }}>
                  <span style={{
                    flexShrink: 0, marginTop: 6,
                    width: 8, height: 8, borderRadius: 999,
                    background: a.tone, boxShadow: `0 0 6px ${a.tone}88`,
                  }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, color: C.text, lineHeight: 1.5 }}>{a.text}</div>
                    <div style={{ fontSize: 10, color: C.faint, fontFamily: F.mono, letterSpacing: '0.06em', marginTop: 3 }}>{a.ago}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* QUICK ACTIONS */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontFamily: F.mono, fontSize: 10, color: C.faint, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 12 }}>
          Quick actions
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
          <QuickAction href="/targets"    label="Intake Submissions" desc={`${d.totalIntakes} applications · ${d.qualified} qualified`} accent={C.green} />
          <QuickAction href="/calculator" label="Deal Calculator"    desc="Drag sliders · live roll-up math" accent={C.align} />
          <QuickAction href="/analytics"  label="Analytics + Geo Map" desc={`${d.states} states · Wagner-aligned heatmap`} accent={C.goldLight} />
          <QuickAction href="/data-room"  label="Data Room"           desc="4 strategy PDFs · upload clinic financials" accent={C.gold} />
        </div>
      </div>

      <style>{`
        @media (max-width: 880px) {
          .kb-overview-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}

function Kpi({ label, val, color, sub }: { label: string; val: string; color: string; sub: string }) {
  return (
    <div>
      <div style={{ fontFamily: F.mono, fontSize: 10, color: C.faint, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, color, fontFamily: F.display, lineHeight: 1, marginBottom: 4 }}>{val}</div>
      <div style={{ fontFamily: F.mono, fontSize: 10, color: C.faint, letterSpacing: '0.06em' }}>{sub}</div>
    </div>
  )
}

function KvSmall({ label, val, color }: { label: string; val: string; color: string }) {
  return (
    <div>
      <div style={{ fontFamily: F.mono, fontSize: 9, color: C.faint, letterSpacing: '0.10em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 17, fontWeight: 700, color, fontFamily: F.display, lineHeight: 1 }}>{val}</div>
    </div>
  )
}

function QuickAction({ href, label, desc, accent }: { href: string; label: string; desc: string; accent: string }) {
  return (
    <Link href={href} style={{ textDecoration: 'none' }}>
      <div style={{
        background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 12,
        padding: '16px 18px', cursor: 'pointer', height: '100%',
        transition: 'all 0.15s',
        borderLeft: `3px solid ${accent}`,
      }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 4 }}>{label}</div>
        <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.45 }}>{desc}</div>
      </div>
    </Link>
  )
}
