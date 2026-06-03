'use client'

// ChiroPillar Analytics · client-rendered interactive surface.
// Geographic priorities per Wagner strategy-call transcript:
//   - Virginia is the primary market (Charlottesville home base, 18 nearby practices)
//   - DFW Texas + Florida + Carolinas form the secondary cluster

import { useState } from 'react'
import type { AnalyticsStats } from './page'

const C = {
  bg: 'var(--kb-bg)', bg2: 'var(--kb-bg-panel)', bg3: 'var(--kb-bg-surface)',
  text: 'var(--kb-text)', muted: 'var(--kb-text-secondary)', faint: 'var(--kb-text-muted)',
  border: 'var(--kb-border)',
  spine: '#1F4E79', align: '#2E75B6', stone: '#EBD8A6', globe: '#9CC4E4',
  gold: '#C9A84C', goldLight: '#E8C96A',
  green: '#2ECC8B', coral: '#F2B0A0',
}
const F = {
  display: "'Playfair Display', Georgia, serif",
  body: "'Inter', system-ui, sans-serif",
  mono: "'JetBrains Mono', 'DM Mono', monospace",
}

const fmtMoney = (n: number): string => {
  if (n >= 1_000_000) return '$' + (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return '$' + Math.round(n / 1_000) + 'K'
  if (n > 0) return '$' + n
  return '$0'
}

// US-states tilegram layout · {row, col} positions for a stylized US grid.
// Higher-density Wagner-priority states (VA, TX, FL, NC, SC, GA, TN) get
// gold/blue intensity; the rest are calm gray.
const TILEGRAM: { state: string; row: number; col: number }[] = [
  // Row 0 (top — Pacific Northwest + far north)
  { state: 'WA', row: 0, col: 1 }, { state: 'MT', row: 0, col: 3 }, { state: 'ND', row: 0, col: 5 }, { state: 'MN', row: 0, col: 6 }, { state: 'WI', row: 0, col: 7 }, { state: 'MI', row: 0, col: 9 }, { state: 'NY', row: 0, col: 10 }, { state: 'VT', row: 0, col: 11 }, { state: 'ME', row: 0, col: 12 },
  // Row 1
  { state: 'OR', row: 1, col: 1 }, { state: 'ID', row: 1, col: 2 }, { state: 'WY', row: 1, col: 3 }, { state: 'SD', row: 1, col: 5 }, { state: 'IA', row: 1, col: 6 }, { state: 'IL', row: 1, col: 7 }, { state: 'IN', row: 1, col: 8 }, { state: 'OH', row: 1, col: 9 }, { state: 'PA', row: 1, col: 10 }, { state: 'NJ', row: 1, col: 11 }, { state: 'NH', row: 1, col: 12 },
  // Row 2
  { state: 'CA', row: 2, col: 1 }, { state: 'NV', row: 2, col: 2 }, { state: 'UT', row: 2, col: 3 }, { state: 'CO', row: 2, col: 4 }, { state: 'NE', row: 2, col: 5 }, { state: 'MO', row: 2, col: 6 }, { state: 'KY', row: 2, col: 8 }, { state: 'WV', row: 2, col: 9 }, { state: 'VA', row: 2, col: 10 }, { state: 'MD', row: 2, col: 11 }, { state: 'DE', row: 2, col: 12 },
  // Row 3
  { state: 'AZ', row: 3, col: 2 }, { state: 'NM', row: 3, col: 3 }, { state: 'KS', row: 3, col: 4 }, { state: 'AR', row: 3, col: 5 }, { state: 'TN', row: 3, col: 7 }, { state: 'NC', row: 3, col: 9 }, { state: 'SC', row: 3, col: 10 },
  // Row 4
  { state: 'TX', row: 4, col: 3 }, { state: 'OK', row: 4, col: 4 }, { state: 'LA', row: 4, col: 5 }, { state: 'MS', row: 4, col: 6 }, { state: 'AL', row: 4, col: 7 }, { state: 'GA', row: 4, col: 8 }, { state: 'FL', row: 4, col: 9 },
  // Row 5 (bottom — AK + HI tucked at left)
  { state: 'AK', row: 5, col: 0 }, { state: 'HI', row: 5, col: 1 },
]

// Wagner's stated target states (per call transcript)
const WAGNER_PRIMARY = new Set(['VA'])
const WAGNER_SECONDARY = new Set(['TX', 'FL', 'NC', 'SC', 'GA', 'TN', 'KY', 'WV', 'MD'])

// ── 18 practices in Wagner's primary territory ──────────────────────────
// Wagner's service area per scottwagnerintegratedmedicine.com:
// Charlottesville + Albemarle, Greene, Madison, Fluvanna, Nelson, Augusta Counties.
// Status: hq (Wagner's own) | wagner_network (warm intro) | in_conversation
// (already applied via intake) | cold (no contact yet) | competitor (direct overlap)
const CHARLOTTESVILLE_PRACTICES: Array<{ name: string; area: string; note: string; status: 'hq' | 'wagner_network' | 'in_conversation' | 'cold' | 'competitor' }> = [
  { name: 'Scott Wagner Integrated Medicine', area: 'Charlottesville',  note: '★ Wagner HQ · pain mgmt + chiro',  status: 'hq' },
  { name: 'Pantops Chiropractic & Wellness',   area: 'East Charlottesville', note: 'Submitted intake · scheduled',  status: 'in_conversation' },
  { name: 'Charlottesville Spine Center',      area: 'Downtown',           note: 'Met at VA Chiro Assoc',          status: 'wagner_network' },
  { name: 'Hollymead Chiropractic',            area: 'Albemarle Co',       note: 'Mutual referral history',         status: 'wagner_network' },
  { name: 'UVA Wellness Chiropractic',         area: 'Near UVA',           note: 'Student-heavy · direct overlap',  status: 'competitor' },
  { name: 'Blue Ridge Family Chiropractic',    area: 'Crozet',             note: 'On the target list',              status: 'cold' },
  { name: 'Ivy Road Spine & Sport',            area: 'West Charlottesville', note: 'Submitted intake · called',     status: 'in_conversation' },
  { name: 'Greene County Chiropractic',        area: 'Stanardsville',      note: 'Rural · solo DC',                 status: 'cold' },
  { name: 'Madison Family Chiropractic',       area: 'Madison Co',         note: 'McGrath has a referral',          status: 'wagner_network' },
  { name: 'Pantops Activator Method',          area: 'East CHO',           note: 'Activator method · overlap',      status: 'competitor' },
  { name: 'Albemarle Chiropractic',            area: 'Crozet',             note: 'On the target list',              status: 'cold' },
  { name: 'Locust Grove Wellness',             area: 'Louisa border',      note: 'Small practice',                  status: 'cold' },
  { name: 'Fluvanna Family Chiropractic',      area: 'Palmyra',            note: 'Submitted intake · maybe',        status: 'in_conversation' },
  { name: 'Nelson County Chiropractic',        area: 'Lovingston',         note: 'Rural · solo DC',                 status: 'cold' },
  { name: 'Augusta Spine Center',              area: 'Waynesboro',         note: 'Submitted intake · qualified',    status: 'in_conversation' },
  { name: 'Charlottesville Athletic Chiro',    area: 'Rio Rd',             note: 'Sports/PI focus · friendly',      status: 'wagner_network' },
  { name: 'Forest Lakes Chiropractic',         area: 'Northside',          note: 'Mutual patient referrals',        status: 'wagner_network' },
  { name: 'Court Square Chiropractic',         area: 'Downtown',           note: 'Most direct competitor',          status: 'competitor' },
]

const stateColor = (count: number, isPrimary: boolean, isSecondary: boolean) => {
  if (isPrimary) {
    if (count >= 10) return { bg: C.gold,      fg: C.bg,    border: C.gold }
    if (count >= 3)  return { bg: '#E8C96A',   fg: C.bg,    border: C.gold }
    return                  { bg: 'rgba(201,168,76,0.30)', fg: C.text, border: 'rgba(201,168,76,0.55)' }
  }
  if (isSecondary) {
    if (count >= 5)  return { bg: C.align,    fg: C.bg,    border: C.align }
    if (count >= 1)  return { bg: 'rgba(46,117,182,0.40)', fg: C.text, border: 'rgba(46,117,182,0.70)' }
    return                  { bg: 'rgba(46,117,182,0.10)', fg: C.muted, border: 'rgba(46,117,182,0.25)' }
  }
  if (count >= 5)  return   { bg: 'rgba(46,204,139,0.40)', fg: C.text, border: 'rgba(46,204,139,0.70)' }
  if (count >= 1)  return   { bg: 'rgba(155,168,192,0.15)', fg: C.muted, border: 'rgba(155,168,192,0.35)' }
  return                    { bg: 'rgba(255,255,255,0.03)', fg: C.faint, border: 'rgba(255,255,255,0.06)' }
}

export default function AnalyticsClient({ stats }: { stats: AnalyticsStats }) {
  const [selectedState, setSelectedState] = useState<string | null>(null)
  const stateData = new Map(stats.byState.map(s => [s.state, s]))
  const q = stats.quizFunnel
  const p = stats.pipelineFunnel

  // Pre-compute quiz funnel rows w/ drop-off %
  const quizRows = [
    { stage: 'Landed on /intake',         count: q.pageVisit,     conv: 100, accent: C.globe   },
    { stage: 'Step 1 · Practice details', count: q.step0Practice, conv: q.pageVisit ? (q.step0Practice / q.pageVisit) * 100 : 0, accent: C.align },
    { stage: 'Step 2 · Revenue',          count: q.step1Revenue,  conv: q.step0Practice ? (q.step1Revenue / q.step0Practice) * 100 : 0, accent: C.align },
    { stage: 'Step 3 · Patient volume',   count: q.step2Patients, conv: q.step1Revenue ? (q.step2Patients / q.step1Revenue) * 100 : 0, accent: C.spine },
    { stage: 'Step 4 · Services',         count: q.step3Services, conv: q.step2Patients ? (q.step3Services / q.step2Patients) * 100 : 0, accent: C.spine },
    { stage: 'Step 5 · Operator profile', count: q.step4Operator, conv: q.step3Services ? (q.step4Operator / q.step3Services) * 100 : 0, accent: C.gold  },
    { stage: 'Submitted application',     count: q.submitted,     conv: q.step4Operator ? (q.submitted / q.step4Operator) * 100 : 0, accent: C.green },
  ]
  const maxQuiz = Math.max(...quizRows.map(r => r.count), 1)

  // Pipeline funnel rows
  const pipelineRows = [
    { stage: 'New (qualified, untouched)', count: p.new,          accent: C.globe },
    { stage: 'Called',                     count: p.called,       accent: C.align },
    { stage: 'Scheduled',                  count: p.scheduled,    accent: C.spine },
    { stage: 'In Diligence',               count: p.in_diligence, accent: C.gold  },
    { stage: 'Offer / LOI',                count: p.offer,        accent: C.goldLight },
    { stage: 'Closed',                     count: p.closed,       accent: C.green },
  ]
  const maxPipeline = Math.max(...pipelineRows.map(r => r.count), 1)

  return (
    <div style={{ padding: '32px 32px 80px', fontFamily: F.body, color: C.text, maxWidth: 1200, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontFamily: F.mono, fontSize: 11, color: C.align, letterSpacing: '0.22em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 8 }}>
          Analytics · Where ChiroPillar is acquiring
        </div>
        <h1 style={{ fontFamily: F.display, fontSize: 'clamp(32px, 4.5vw, 44px)', fontWeight: 700, margin: '0 0 8px', letterSpacing: '-0.02em' }}>
          The map. The funnel. The pipeline.
        </h1>
        <p style={{ fontSize: 16, color: C.muted, margin: 0, maxWidth: 760, lineHeight: 1.6 }}>
          Geographic priorities reflect Dr. Wagner&apos;s strategy-call directive: Virginia first (Charlottesville home market · 18 known practices), then Texas, Florida, and the Carolinas. {stats.isDemo ? 'Numbers below are sample data from the demo session.' : 'All numbers are live from the production database.'}
        </p>
      </div>

      {/* KPI strip */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 14,
        marginBottom: 36,
        background: `linear-gradient(135deg, rgba(46,117,182,0.08), ${C.bg3})`,
        border: `1px solid ${C.border}`, borderRadius: 14, padding: '20px 24px',
      }}>
        <Kpi label="Applications"  val={String(stats.totalApplications)} color={C.gold}  isDemo={stats.isDemo} />
        <Kpi label="Qualified"     val={String(stats.qualified)}          color={C.green} isDemo={stats.isDemo} />
        <Kpi label="Conv. rate"    val={`${stats.conversionRate}%`}        color={C.goldLight} isDemo={stats.isDemo} />
        <Kpi label="Pipeline EBITDA" val={fmtMoney(stats.pipelineEbitda)} color={C.gold}  isDemo={stats.isDemo} />
        <Kpi label="This week"     val={String(stats.thisWeek)}            color={C.green} isDemo={stats.isDemo} />
        <Kpi label="States active" val={String(stats.byState.length)}      color={C.align} isDemo={stats.isDemo} />
      </div>

      {/* ── 1. CHARLOTTESVILLE GOOGLE MAPS DEEP-DIVE (moved to TOP per Eric directive) ── */}
      <SectionHead eyebrow="Wagner's home market · Charlottesville VA + Albemarle County" title="The 18 nearby practices — mapped + listed." />
      <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 14, overflow: 'hidden', marginBottom: 40 }}>
        <div style={{ padding: '20px 28px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontFamily: F.mono, fontSize: 10, color: C.gold, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 4 }}>
              Wagner Primary Market
            </div>
            <div style={{ fontFamily: F.display, fontSize: 22, fontWeight: 600, color: C.text }}>
              Charlottesville, Virginia · Albemarle County
            </div>
            <div style={{ fontSize: 13, color: C.muted, fontStyle: 'italic', marginTop: 2 }}>
              &quot;I know the reimbursement codes. I know the area. I know exactly what markets to attack.&quot;
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
            <MiniStat label="Known practices" val="18" accent={C.gold} />
            <MiniStat label="Wagner reach"    val="9" accent={C.align} />
            <MiniStat label="Stage 1 target"  val="3-5" accent={C.green} />
          </div>
        </div>

        <iframe
          title="Charlottesville + Albemarle County chiropractic market"
          src="https://maps.google.com/maps?q=chiropractor+OR+chiropractic+Charlottesville+Albemarle+County+VA&t=m&z=10&ie=UTF8&iwloc=&output=embed"
          style={{ width: '100%', height: 480, border: 0, display: 'block' }}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />

        <div style={{ padding: '24px 28px', borderTop: `1px solid ${C.border}` }}>
          <div style={{
            fontFamily: F.mono, fontSize: 10, color: C.gold, letterSpacing: '0.18em',
            textTransform: 'uppercase', fontWeight: 700, marginBottom: 14,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
          }}>
            <span>📍 18 known practices · Wagner&apos;s local network</span>
            <span style={{ display: 'flex', gap: 14, fontSize: 9, color: C.faint, letterSpacing: '0.08em', flexWrap: 'wrap' }}>
              <PinLegend dot={C.goldLight} label="★ Wagner HQ" />
              <PinLegend dot={C.green}     label="In conversation" />
              <PinLegend dot={C.gold}      label="Wagner network" />
              <PinLegend dot={C.align}     label="Cold target" />
              <PinLegend dot={C.coral}     label="Direct competitor" />
            </span>
          </div>

          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(245px, 1fr))', gap: 8,
          }}>
            {CHARLOTTESVILLE_PRACTICES.map((p, i) => {
              const tone = p.status === 'hq'              ? C.goldLight
                         : p.status === 'in_conversation' ? C.green
                         : p.status === 'wagner_network'  ? C.gold
                         : p.status === 'competitor'      ? C.coral
                         : C.align
              const bg = p.status === 'hq'              ? 'rgba(232,201,106,0.15)'
                       : p.status === 'in_conversation' ? 'rgba(46,204,139,0.08)'
                       : p.status === 'wagner_network'  ? 'rgba(201,168,76,0.08)'
                       : p.status === 'competitor'      ? 'rgba(242,176,160,0.10)'
                       : 'rgba(46,117,182,0.05)'
              const border = p.status === 'hq'              ? '2px solid rgba(232,201,106,0.55)'
                           : p.status === 'in_conversation' ? '1px solid rgba(46,204,139,0.25)'
                           : p.status === 'wagner_network'  ? '1px solid rgba(201,168,76,0.25)'
                           : p.status === 'competitor'      ? '1px solid rgba(242,176,160,0.25)'
                           : '1px solid rgba(46,117,182,0.15)'
              return (
                <div key={i} style={{
                  display: 'flex', gap: 10, alignItems: 'flex-start',
                  padding: '10px 12px', borderRadius: 8,
                  background: bg, border,
                }}>
                  <span style={{
                    flexShrink: 0, marginTop: 5,
                    width: p.status === 'hq' ? 12 : 9,
                    height: p.status === 'hq' ? 12 : 9,
                    borderRadius: 999,
                    background: tone,
                    boxShadow: `0 0 ${p.status === 'hq' ? 10 : 6}px ${tone}aa`,
                  }} />
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{
                      fontSize: 13, fontWeight: p.status === 'hq' ? 800 : 600,
                      color: p.status === 'hq' ? C.goldLight : C.text,
                      lineHeight: 1.2, marginBottom: 2,
                    }}>
                      {p.name}
                    </div>
                    <div style={{ fontSize: 11, color: C.muted, fontFamily: F.mono, letterSpacing: '0.02em' }}>
                      {p.area} · {p.note}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div style={{ padding: '16px 28px', borderTop: `1px solid ${C.border}`, fontSize: 13, color: C.muted, lineHeight: 1.55 }}>
          <strong style={{ color: C.text }}>Why start here:</strong>{' '}
          Wagner&apos;s personal network covers <strong style={{ color: C.gold }}>9 of the 18 practices</strong>. Local credibility + reimbursement-code knowledge = highest-probability first wins. Branded as &quot;corporate company offering medical add-ons,&quot; not &quot;Dr. Wagner buying you out.&quot;
        </div>
      </div>

      {/* ── 2. INTAKE QUIZ FUNNEL ────────────────────────────────────────── */}
      <SectionHead eyebrow="Intake Quiz Funnel · where chiropractors drop off" title="Where they fall out of the form." />
      <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 14, padding: '24px 28px', marginBottom: 40 }}>
        {quizRows.map((row, i) => {
          const w = (row.count / maxQuiz) * 100
          const dropFromPrev = i > 0 ? quizRows[i - 1].count - row.count : 0
          return (
            <div key={i} style={{ marginBottom: i < quizRows.length - 1 ? 18 : 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6, gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                  <span style={{ fontFamily: F.mono, fontSize: 10, color: C.faint, fontWeight: 700, letterSpacing: '0.10em', width: 22 }}>
                    {String(i).padStart(2, '0')}
                  </span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{row.stage}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
                  <span style={{ fontFamily: F.display, fontSize: 22, fontWeight: 700, color: row.accent }}>
                    {row.count.toLocaleString()}
                  </span>
                  <span style={{ fontFamily: F.mono, fontSize: 11, color: C.faint, minWidth: 64, textAlign: 'right' }}>
                    {row.conv.toFixed(0)}%
                  </span>
                </div>
              </div>
              <div style={{ position: 'relative', height: 14, background: 'rgba(255,255,255,0.04)', borderRadius: 7, overflow: 'hidden' }}>
                <div style={{
                  position: 'absolute', left: 0, top: 0, bottom: 0, width: `${w}%`,
                  background: `linear-gradient(90deg, ${row.accent}, ${row.accent}88)`,
                  borderRadius: 7, transition: 'width 0.4s ease',
                }} />
              </div>
              {i > 0 && dropFromPrev > 0 && (
                <div style={{ fontSize: 11, color: C.coral, marginTop: 4, fontFamily: F.mono, letterSpacing: '0.04em', textAlign: 'right' }}>
                  −{dropFromPrev.toLocaleString()} dropped
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* ── 2. US TILEGRAM HEATMAP ───────────────────────────────────────── */}
      <SectionHead eyebrow="Geographic heatmap · per Wagner directive" title="Virginia first. Then the South." />
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.55fr) minmax(280px,1fr)', gap: 18, marginBottom: 18 }} className="kb-geo-grid">

        {/* US tilegram */}
        <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 14, padding: '24px 28px' }}>
          <div style={{ fontFamily: F.mono, fontSize: 10, color: C.faint, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 14 }}>
            US state activity tilegram
          </div>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(13, 1fr)', gap: 6,
            aspectRatio: '13 / 6',
          }}>
            {Array.from({ length: 6 * 13 }, (_, idx) => {
              const row = Math.floor(idx / 13)
              const col = idx % 13
              const tile = TILEGRAM.find(t => t.row === row && t.col === col)
              if (!tile) return <div key={idx} />
              const data = stateData.get(tile.state)
              const count = data?.total ?? 0
              const isPrimary = WAGNER_PRIMARY.has(tile.state)
              const isSecondary = WAGNER_SECONDARY.has(tile.state)
              const colors = stateColor(count, isPrimary, isSecondary)
              const isSelected = selectedState === tile.state
              return (
                <button
                  key={idx}
                  onClick={() => setSelectedState(isSelected ? null : tile.state)}
                  type="button"
                  style={{
                    background: colors.bg, color: colors.fg,
                    border: `${isSelected ? 2 : 1}px solid ${isSelected ? C.gold : colors.border}`,
                    borderRadius: 6, padding: 0, cursor: 'pointer',
                    fontFamily: F.mono, fontSize: 11, fontWeight: 700, letterSpacing: '0.04em',
                    transition: 'all 0.15s', position: 'relative',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    minHeight: 0,
                  }}
                  title={`${tile.state} · ${count} applicant${count === 1 ? '' : 's'}`}
                >
                  <span>{tile.state}</span>
                  {count > 0 && (
                    <span style={{ fontSize: 9, opacity: 0.85, marginTop: 1 }}>{count}</span>
                  )}
                  {isPrimary && (
                    <span style={{ position: 'absolute', top: 2, right: 3, width: 6, height: 6, borderRadius: 999, background: C.gold, boxShadow: `0 0 6px ${C.gold}` }} />
                  )}
                </button>
              )
            })}
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', gap: 18, marginTop: 18, flexWrap: 'wrap', fontSize: 11, color: C.muted, fontFamily: F.body }}>
            <Legend swatch={C.gold}    label="Wagner Primary (VA)" />
            <Legend swatch={C.align}   label="Wagner Secondary (TX/FL/NC/SC/GA/TN)" />
            <Legend swatch="rgba(46,204,139,0.40)" label="Other active" />
            <Legend swatch="rgba(255,255,255,0.05)" label="No activity" />
          </div>
        </div>

        {/* Selected-state detail */}
        <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 14, padding: '24px 28px' }}>
          <div style={{ fontFamily: F.mono, fontSize: 10, color: C.faint, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 14 }}>
            {selectedState ? `Selected · ${selectedState}` : 'Click any state'}
          </div>
          {selectedState && stateData.has(selectedState) ? (
            <StateDetail row={stateData.get(selectedState)!} />
          ) : selectedState ? (
            <div style={{ fontSize: 14, color: C.muted, lineHeight: 1.6 }}>
              No applicants from <strong style={{ color: C.text }}>{selectedState}</strong> yet. Open the Outreach Campaigns tab to set up the targeted drip for this state.
            </div>
          ) : (
            <>
              <div style={{ fontSize: 14, color: C.muted, lineHeight: 1.6, marginBottom: 18 }}>
                Click a state tile to see the per-state breakdown. Gold-haloed states are Wagner&apos;s declared primary markets from the strategy call.
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {stats.byState.slice(0, 5).map(s => (
                  <button
                    key={s.state}
                    type="button"
                    onClick={() => setSelectedState(s.state)}
                    style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '10px 14px', borderRadius: 8,
                      background: WAGNER_PRIMARY.has(s.state) ? 'rgba(201,168,76,0.10)' : C.bg3,
                      border: `1px solid ${WAGNER_PRIMARY.has(s.state) ? 'rgba(201,168,76,0.35)' : C.border}`,
                      cursor: 'pointer', color: C.text, fontFamily: F.body,
                      textAlign: 'left',
                    }}
                  >
                    <span style={{ fontFamily: F.mono, fontWeight: 700, color: WAGNER_PRIMARY.has(s.state) ? C.gold : C.text, width: 32 }}>
                      {s.state}
                    </span>
                    <span style={{ flex: 1, fontSize: 13, color: C.muted, marginLeft: 8 }}>
                      {s.total} · {s.qualified} qualified
                    </span>
                    <span style={{ fontSize: 12, fontFamily: F.mono, color: C.gold }}>{fmtMoney(s.pipelineValue)}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── 4. OUTREACH PIPELINE FUNNEL ─────────────────────────────────── */}
      <SectionHead eyebrow="Outreach pipeline · post-qualification flow" title="From qualified to closed." />
      <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 14, padding: '24px 28px', marginBottom: 40 }}>
        {pipelineRows.map((row, i) => {
          const w = (row.count / maxPipeline) * 100
          return (
            <div key={i} style={{ marginBottom: i < pipelineRows.length - 1 ? 16 : 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{row.stage}</span>
                <span style={{ fontFamily: F.display, fontSize: 22, fontWeight: 700, color: row.accent }}>{row.count}</span>
              </div>
              <div style={{ position: 'relative', height: 12, background: 'rgba(255,255,255,0.04)', borderRadius: 6, overflow: 'hidden' }}>
                <div style={{
                  position: 'absolute', left: 0, top: 0, bottom: 0, width: `${Math.max(w, 1)}%`,
                  background: `linear-gradient(90deg, ${row.accent}, ${row.accent}88)`,
                  borderRadius: 6, transition: 'width 0.4s ease',
                }} />
              </div>
            </div>
          )
        })}
      </div>

      {/* ── 5. STATE PIPELINE TABLE ─────────────────────────────────────── */}
      <SectionHead eyebrow="Per-state pipeline · weighted EBITDA" title="Where the money is." />
      <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 14, overflow: 'hidden' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '80px 1fr 100px 100px 130px 100px',
          gap: 12, padding: '14px 22px',
          background: C.bg3, borderBottom: `1px solid ${C.border}`,
          fontFamily: F.mono, fontSize: 10, letterSpacing: '0.14em',
          textTransform: 'uppercase', color: C.muted, fontWeight: 700,
        }}>
          <div>State</div>
          <div>Wagner band</div>
          <div style={{ textAlign: 'right' }}>Apps</div>
          <div style={{ textAlign: 'right' }}>Qual.</div>
          <div style={{ textAlign: 'right' }}>Pipeline EBITDA</div>
          <div style={{ textAlign: 'right' }}>Conv %</div>
        </div>
        {stats.byState.map((s, i) => {
          const isPrimary = WAGNER_PRIMARY.has(s.state)
          const isSecondary = WAGNER_SECONDARY.has(s.state)
          const band = isPrimary ? 'PRIMARY' : isSecondary ? 'Secondary' : 'Opportunistic'
          const bandColor = isPrimary ? C.gold : isSecondary ? C.align : C.muted
          const conv = s.total ? Math.round((s.qualified / s.total) * 100) : 0
          return (
            <div key={s.state} style={{
              display: 'grid', gridTemplateColumns: '80px 1fr 100px 100px 130px 100px',
              gap: 12, padding: '14px 22px',
              borderBottom: i < stats.byState.length - 1 ? `1px solid ${C.border}` : 'none',
              background: isPrimary ? 'rgba(201,168,76,0.05)' : 'transparent',
              color: C.text, fontSize: 14,
              alignItems: 'center',
            }}>
              <div style={{ fontFamily: F.mono, fontWeight: 800, color: bandColor, letterSpacing: '0.04em' }}>
                {s.state}
              </div>
              <div style={{
                fontFamily: F.mono, fontSize: 10, color: bandColor,
                letterSpacing: '0.16em', fontWeight: 700, textTransform: 'uppercase',
              }}>
                {isPrimary && '★ '}{band}
              </div>
              <div style={{ textAlign: 'right', fontFamily: F.mono, color: C.text }}>{s.total}</div>
              <div style={{ textAlign: 'right', fontFamily: F.mono, color: C.green }}>{s.qualified}</div>
              <div style={{ textAlign: 'right', fontFamily: F.display, fontWeight: 700, color: C.gold }}>
                {fmtMoney(s.pipelineValue)}
              </div>
              <div style={{ textAlign: 'right', fontFamily: F.mono, color: C.muted }}>{conv}%</div>
            </div>
          )
        })}
      </div>

      <style>{`
        @media (max-width: 880px) {
          .kb-geo-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}

// ── small sub-components ────────────────────────────────────────────────
function Kpi({ label, val, color, isDemo }: { label: string; val: string; color: string; isDemo: boolean }) {
  return (
    <div>
      <div style={{ fontFamily: F.mono, fontSize: 10, color: C.faint, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
        {label}
        <span style={{ width: 5, height: 5, borderRadius: 999, background: isDemo ? C.gold : C.green, boxShadow: `0 0 8px ${isDemo ? C.gold : C.green}` }} />
      </div>
      <div style={{ fontSize: 22, fontWeight: 700, color, fontFamily: F.display, lineHeight: 1 }}>{val}</div>
    </div>
  )
}

function SectionHead({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontFamily: F.mono, fontSize: 10, color: C.align, letterSpacing: '0.20em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 6 }}>
        {eyebrow}
      </div>
      <h2 style={{ fontFamily: F.display, fontSize: 24, fontWeight: 600, margin: 0, letterSpacing: '-0.01em' }}>
        {title}
      </h2>
    </div>
  )
}

function Legend({ swatch, label }: { swatch: string; label: string }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
      <span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: 3, background: swatch, border: '1px solid rgba(255,255,255,0.10)' }} />
      {label}
    </span>
  )
}

function PinLegend({ dot, label }: { dot: string; label: string }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
      <span style={{ display: 'inline-block', width: 7, height: 7, borderRadius: 999, background: dot, boxShadow: `0 0 4px ${dot}aa` }} />
      {label}
    </span>
  )
}

function MiniStat({ label, val, accent }: { label: string; val: string; accent: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '8px 12px', background: 'rgba(255,255,255,0.03)', border: `1px solid ${C.border}`, borderRadius: 8, minWidth: 90 }}>
      <div style={{ fontFamily: F.mono, fontSize: 9, color: C.faint, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700 }}>{label}</div>
      <div style={{ fontFamily: F.display, fontSize: 20, fontWeight: 700, color: accent, lineHeight: 1, marginTop: 2 }}>{val}</div>
    </div>
  )
}

function StateDetail({ row }: { row: { state: string; total: number; qualified: number; maybe: number; pipelineValue: number } }) {
  const isPrimary = WAGNER_PRIMARY.has(row.state)
  const isSecondary = WAGNER_SECONDARY.has(row.state)
  return (
    <div>
      <div style={{ fontFamily: F.display, fontSize: 36, fontWeight: 700, color: isPrimary ? C.gold : C.text, marginBottom: 4 }}>
        {row.state}
      </div>
      <div style={{ fontFamily: F.mono, fontSize: 10, color: isPrimary ? C.gold : isSecondary ? C.align : C.muted, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 18 }}>
        {isPrimary ? '★ Wagner primary' : isSecondary ? 'Wagner secondary' : 'Opportunistic'}
      </div>
      <div style={{ display: 'grid', gap: 10 }}>
        <RowKv label="Applications"    val={row.total.toString()}    color={C.text} />
        <RowKv label="Qualified"       val={row.qualified.toString()} color={C.green} />
        <RowKv label="Maybe"           val={row.maybe.toString()}     color={C.gold} />
        <RowKv label="Pipeline EBITDA" val={fmtMoney(row.pipelineValue)} color={C.gold} />
      </div>
    </div>
  )
}

function RowKv({ label, val, color }: { label: string; val: string; color: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBottom: `1px solid ${C.border}`, paddingBottom: 8 }}>
      <span style={{ fontSize: 12, color: C.faint, fontFamily: F.mono, letterSpacing: '0.10em', textTransform: 'uppercase' }}>{label}</span>
      <span style={{ fontSize: 17, fontWeight: 700, color, fontFamily: F.display }}>{val}</span>
    </div>
  )
}
