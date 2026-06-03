'use client'

// ChiroPillar · Acquisition Pipeline
// Top: 6-column Kanban board matching chiropillar_targets.outreach_status enum
// Middle: Bloomberg-terminal-style per-clinic timeline (one selected deal)
// Bottom: Phase-2 build details

import { useState } from 'react'

const C = {
  bg: 'var(--kb-bg)', bg2: 'var(--kb-bg-panel)', bg3: 'var(--kb-bg-surface)',
  text: 'var(--kb-text)', muted: 'var(--kb-text-secondary)', faint: 'var(--kb-text-muted)',
  border: 'var(--kb-border)',
  spine: '#1F4E79', align: '#2E75B6', stone: '#EBD8A6', globe: '#9CC4E4',
  gold: '#C9A84C', goldLight: '#E8C96A', green: '#2ECC8B', coral: '#F2B0A0',
  red: '#E74C3C',
}
const F = {
  display: "'Playfair Display', Georgia, serif",
  body: "'Inter', system-ui, sans-serif",
  mono: "'JetBrains Mono', 'DM Mono', monospace",
}

const fmtMoney = (n: number): string => {
  if (n >= 1_000_000) return '$' + (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return '$' + Math.round(n / 1_000) + 'K'
  return '$' + Math.round(n)
}

// ── Kanban columns matching chiropillar_targets.outreach_status enum ────
type StageKey = 'new' | 'called' | 'scheduled' | 'in_diligence' | 'offer' | 'closed'
const COLUMNS: { key: StageKey; label: string; sub: string; accent: string }[] = [
  { key: 'new',          label: 'New',          sub: 'Just applied',     accent: C.globe     },
  { key: 'called',       label: 'Called',       sub: 'First contact',    accent: C.align     },
  { key: 'scheduled',    label: 'Scheduled',    sub: 'Meeting booked',   accent: C.spine     },
  { key: 'in_diligence', label: 'In Diligence', sub: 'Reviewing books',  accent: C.gold      },
  { key: 'offer',        label: 'LOI / Offer',  sub: 'Term sheet sent',  accent: C.goldLight },
  { key: 'closed',       label: 'Closed',       sub: 'Acquired',         accent: C.green     },
]

type Deal = {
  id: string
  name: string
  city: string
  state: string
  value: number
  npm: number  // new patients/mo
  days: number // days in this stage
  stage: StageKey
}

// 12-15 deals distributed across the 6 stages (Wagner-geo weighted)
const DEALS: Deal[] = [
  // NEW
  { id: 'd1',  name: 'Orlando Wellness Group',     city: 'Orlando',     state: 'FL', value:   980_000, npm: 37, days: 2, stage: 'new' },
  { id: 'd2',  name: 'Raleigh Family Chiropractic', city: 'Raleigh',     state: 'NC', value:   860_000, npm: 29, days: 3, stage: 'new' },
  { id: 'd3',  name: 'Greenville Family Chiro',    city: 'Greenville',  state: 'SC', value:   720_000, npm: 24, days: 4, stage: 'new' },
  // CALLED
  { id: 'd4',  name: 'Richmond Spine Center',      city: 'Richmond',    state: 'VA', value: 1_550_000, npm: 61, days: 4, stage: 'called' },
  { id: 'd5',  name: 'Tampa Bay Spine Care',       city: 'Tampa',       state: 'FL', value: 1_300_000, npm: 49, days: 6, stage: 'called' },
  { id: 'd6',  name: 'Nashville Alignment Center', city: 'Nashville',   state: 'TN', value: 1_180_000, npm: 46, days: 5, stage: 'called' },
  // SCHEDULED
  { id: 'd7',  name: 'Blue Ridge Chiropractic',    city: 'Roanoke',     state: 'VA', value: 1_350_000, npm: 52, days: 6, stage: 'scheduled' },
  { id: 'd8',  name: 'Rivera Chiropractic',        city: 'Austin',      state: 'TX', value: 1_620_000, npm: 65, days: 7, stage: 'scheduled' },
  { id: 'd9',  name: 'Charlotte Spinal Health',    city: 'Charlotte',   state: 'NC', value: 1_080_000, npm: 44, days: 9, stage: 'scheduled' },
  // IN DILIGENCE
  { id: 'd10', name: 'Piedmont Spine & Wellness',  city: 'Charlottesville', state: 'VA', value: 1_900_000, npm: 78, days: 14, stage: 'in_diligence' },
  { id: 'd11', name: 'Dallas Alignment & Sport',   city: 'Plano',       state: 'TX', value: 2_350_000, npm: 88, days: 11, stage: 'in_diligence' },
  { id: 'd12', name: 'Savannah Spine Group',       city: 'Savannah',    state: 'GA', value: 2_050_000, npm: 72, days: 9,  stage: 'in_diligence' },
  // LOI
  { id: 'd13', name: 'Birmingham Spine Institute', city: 'Birmingham',  state: 'AL', value: 1_080_000, npm: 41, days: 21, stage: 'offer' },
  // CLOSED
  { id: 'd14', name: 'Augusta Spine Center',       city: 'Waynesboro',  state: 'VA', value: 1_240_000, npm: 47, days: 0,  stage: 'closed' },
]

// ── Bloomberg-terminal timeline for one selected deal ────────────────────
type TimelineEvent = {
  ts: string       // "06/02 14:23"
  code: string     // e.g. "INTAKE_SUB"
  label: string
  detail: string
  delta?: number   // optional pipeline-value delta in dollars
  status: 'INFO' | 'OK' | 'WARN' | 'ERR' | 'BID' | 'ASK'
}

const TIMELINE_FOR_PIEDMONT: TimelineEvent[] = [
  { ts: '05/20 09:14', code: 'INTAKE_SUB', label: 'Intake submitted',    detail: 'Dr. Marcus Bell · 78 new/mo · 28 visit avg · $1.3M gross',                status: 'INFO' },
  { ts: '05/20 09:14', code: 'AUTO_QUAL',  label: 'Auto-qualification',  detail: 'Verdict: QUALIFIED · 4/4 Wagner criteria met',                            status: 'OK',   delta:  1_300_000 },
  { ts: '05/20 09:15', code: 'VAL_BAND',   label: 'Valuation band',      detail: '$1.2M – $2.1M (mid $1.65M) · solo profile · 1.46× SDE',                  status: 'INFO' },
  { ts: '05/20 11:02', code: 'EMAIL_SENT', label: 'Auto-email Day 0',    detail: '"Welcome to the ChiroPillar shortlist" · opened 11:38',                  status: 'OK' },
  { ts: '05/21 14:50', code: 'CALL_LOG',   label: 'First call · McGrath', detail: '42 min · interested · "willing to step out of clinical"',                status: 'OK' },
  { ts: '05/22 08:30', code: 'STAGE_MV',   label: 'Stage → Scheduled',    detail: 'Calendly: 05/24 11:00 · Wagner + Bell',                                  status: 'INFO' },
  { ts: '05/24 11:00', code: 'MEET_HELD',  label: 'Wagner meeting',       detail: '47 min · "feel like a partner not a buyer"',                             status: 'OK',   delta:    150_000 },
  { ts: '05/26 16:18', code: 'DOCS_REQ',   label: 'Financials requested', detail: '3yr tax returns · P&L · bank statements · lease',                       status: 'BID' },
  { ts: '05/29 09:42', code: 'DOCS_RECV',  label: 'Financials received',  detail: '7 PDFs · uploaded to data room CP-d10',                                  status: 'OK' },
  { ts: '05/29 09:43', code: 'AI_EXTR',    label: 'Claude extraction',    detail: 'EBITDA $485K · add-backs $130K · normalized $615K',                      status: 'OK',   delta:    150_000 },
  { ts: '05/30 13:15', code: 'STAGE_MV',   label: 'Stage → In Diligence', detail: 'Legal review started · McGrath ops review parallel',                    status: 'INFO' },
  { ts: '06/01 10:00', code: 'NDA_SENT',   label: 'Mutual NDA sent',      detail: 'DocuSeal envelope · awaiting signature',                                 status: 'BID' },
  { ts: '06/01 14:22', code: 'NDA_SIGN',   label: 'NDA executed',         detail: 'Bell signed · IP-logged · timestamped',                                   status: 'OK' },
  { ts: '06/02 11:30', code: 'LOI_DRAFT',  label: 'LOI drafted',          detail: '$1.9M · 50% cash + 50% seller note · 4% profit share · 10% rollover',   status: 'ASK', delta:    250_000 },
]

const STATUS_COLOR: Record<TimelineEvent['status'], string> = {
  INFO: C.muted, OK: C.green, WARN: C.gold, ERR: C.coral, BID: C.align, ASK: C.goldLight,
}

export default function PipelinePage() {
  const [selected, setSelected] = useState<string>('d10') // Piedmont default
  const selectedDeal = DEALS.find(d => d.id === selected)

  return (
    <div style={{ padding: '32px 32px 80px', maxWidth: 1400, margin: '0 auto', fontFamily: F.body, color: C.text }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontFamily: F.mono, fontSize: 12.5, color: C.align, letterSpacing: '0.22em', textTransform: 'uppercase', fontWeight: 800, marginBottom: 10 }}>
          Acquisition Pipeline · drag-and-drop in Phase 2
        </div>
        <h1 style={{ fontFamily: F.display, fontSize: 'clamp(34px, 4.5vw, 46px)', fontWeight: 700, margin: '0 0 10px', letterSpacing: '-0.02em' }}>
          Every clinic, every stage, on one board.
        </h1>
        <p style={{ fontSize: 16, color: '#FFFFFF', margin: 0, maxWidth: 760, lineHeight: 1.6, fontWeight: 400 }}>
          Kanban above. Bloomberg-style audit timeline below. Click any card on the board to see its full journey from intake submission to close — Wagner-grade audit trail.
        </p>
      </div>

      {/* ── KANBAN BOARD ─────────────────────────────────────────────────── */}
      <div style={{ marginBottom: 32 }}>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(6, minmax(180px, 1fr))', gap: 12,
          overflowX: 'auto', paddingBottom: 8,
        }} className="kb-kanban">
          {COLUMNS.map(col => {
            const colDeals = DEALS.filter(d => d.stage === col.key)
            const colValue = colDeals.reduce((s, d) => s + d.value, 0)
            return (
              <div key={col.key} style={{
                background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 12,
                display: 'flex', flexDirection: 'column', minHeight: 380,
                boxShadow: '0 4px 12px rgba(0,0,0,0.10)',
              }}>
                <div style={{
                  padding: '14px 16px', borderBottom: `1px solid ${C.border}`,
                  borderTop: `4px solid ${col.accent}`,
                  borderTopLeftRadius: 12, borderTopRightRadius: 12,
                  background: `linear-gradient(180deg, ${col.accent}22 0%, transparent 100%)`,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                    <span style={{ fontSize: 14, fontWeight: 800, color: col.accent, fontFamily: F.mono, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                      {col.label}
                    </span>
                    <span style={{ fontSize: 13, color: '#FFFFFF', fontFamily: F.mono, fontWeight: 800 }}>{colDeals.length}</span>
                  </div>
                  <div style={{ fontSize: 12, color: '#FFFFFF', fontFamily: F.body, letterSpacing: '0.02em', opacity: 0.80, fontWeight: 500 }}>{col.sub}</div>
                  <div style={{ fontSize: 18, color: col.accent, fontFamily: F.display, fontWeight: 800, marginTop: 8, letterSpacing: '-0.02em' }}>
                    {fmtMoney(colValue)}
                  </div>
                </div>

                <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
                  {colDeals.map(d => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setSelected(d.id)}
                      style={{
                        textAlign: 'left',
                        background: selected === d.id ? `${col.accent}25` : C.bg3,
                        border: `${selected === d.id ? 2 : 1}px solid ${selected === d.id ? col.accent : C.border}`,
                        borderLeft: `4px solid ${col.accent}`,
                        borderRadius: 8, padding: '12px 14px', cursor: 'pointer',
                        transition: 'all 0.15s', display: 'flex', flexDirection: 'column', gap: 6,
                      }}
                    >
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#FFFFFF', lineHeight: 1.3, letterSpacing: '-0.01em' }}>{d.name}</div>
                      <div style={{ fontSize: 12, color: '#FFFFFF', fontFamily: F.mono, letterSpacing: '0.04em', opacity: 0.75, fontWeight: 500 }}>
                        {d.city}, {d.state}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 4 }}>
                        <span style={{ fontFamily: F.display, fontSize: 18, fontWeight: 800, color: col.accent, letterSpacing: '-0.02em' }}>
                          {fmtMoney(d.value)}
                        </span>
                        <span style={{ fontSize: 11.5, color: '#FFFFFF', fontFamily: F.mono, opacity: 0.75, fontWeight: 600 }}>
                          d{d.days} · {d.npm}/mo
                        </span>
                      </div>
                    </button>
                  ))}
                  {colDeals.length === 0 && (
                    <div style={{
                      padding: '24px 12px', textAlign: 'center', borderRadius: 8,
                      border: `1px dashed ${C.border}`, color: '#FFFFFF',
                      fontSize: 12, fontFamily: F.mono, letterSpacing: '0.04em', opacity: 0.55, fontWeight: 500,
                    }}>
                      empty
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
        <div style={{ fontSize: 13.5, color: '#FFFFFF', marginTop: 14, fontFamily: F.body, letterSpacing: '0.02em', fontWeight: 500, opacity: 0.85 }}>
          Click any card → audit timeline updates below. Drag-and-drop stage transitions ship in <strong style={{ color: C.gold, opacity: 1 }}>Phase 2</strong>.
        </div>
      </div>

      {/* ── BLOOMBERG TIMELINE ──────────────────────────────────────────── */}
      {selectedDeal && (
        <div style={{
          background: '#02060d', border: `1px solid ${C.border}`, borderRadius: 14,
          marginBottom: 32, overflow: 'hidden',
          boxShadow: '0 0 0 1px rgba(46,204,139,0.15), 0 20px 60px rgba(0,0,0,0.5)',
        }}>
          {/* Terminal header bar */}
          <div style={{
            background: '#0a0e16', padding: '10px 18px',
            borderBottom: '1px solid rgba(46,204,139,0.25)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            fontFamily: F.mono, fontSize: 11, letterSpacing: '0.08em',
          }}>
            <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: 5 }}>
                <span style={{ width: 9, height: 9, borderRadius: 999, background: '#FF5F56' }} />
                <span style={{ width: 9, height: 9, borderRadius: 999, background: '#FFBD2E' }} />
                <span style={{ width: 9, height: 9, borderRadius: 999, background: '#27C93F' }} />
              </div>
              <span style={{ color: C.green, fontWeight: 700, textTransform: 'uppercase' }}>
                CP-TERM · {selectedDeal.id.toUpperCase()} · audit
              </span>
            </div>
            <div style={{ color: C.faint, fontSize: 10 }}>● live · auto-refresh 1.0s</div>
          </div>

          {/* Deal ID bar */}
          <div style={{
            padding: '14px 22px', borderBottom: '1px solid rgba(46,204,139,0.15)',
            display: 'grid', gridTemplateColumns: 'auto 1fr auto auto auto auto', gap: 18,
            alignItems: 'baseline', fontFamily: F.mono, fontSize: 12,
            background: 'linear-gradient(90deg, rgba(46,204,139,0.05), transparent)',
          }}>
            <span style={{ color: C.green, fontWeight: 800, fontSize: 15, letterSpacing: '0.10em' }}>
              {selectedDeal.id.toUpperCase()}
            </span>
            <span style={{ color: C.text, fontWeight: 700, fontSize: 15 }}>
              {selectedDeal.name} <span style={{ color: C.faint, fontWeight: 400 }}>· {selectedDeal.city}, {selectedDeal.state}</span>
            </span>
            <KvTerm label="VAL" val={fmtMoney(selectedDeal.value)} color={C.gold} />
            <KvTerm label="NPM" val={String(selectedDeal.npm)}     color={C.green} />
            <KvTerm label="STG" val={COLUMNS.find(c => c.key === selectedDeal.stage)?.label.toUpperCase() || ''} color={C.align} />
            <KvTerm label="AGE" val={`D+${selectedDeal.days}`}     color={C.muted} />
          </div>

          {/* Timeline rows */}
          <div style={{ fontFamily: F.mono, fontSize: 12, padding: '14px 0' }}>
            {(selectedDeal.id === 'd10' ? TIMELINE_FOR_PIEDMONT : MOCK_TIMELINE_FOR(selectedDeal)).map((ev, i, arr) => (
              <div key={i} style={{
                display: 'grid', gridTemplateColumns: '110px 30px 130px 1fr 90px',
                gap: 14, padding: '5px 22px',
                background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)',
                color: C.text, lineHeight: 1.5,
              }}>
                <span style={{ color: '#FFFFFF', letterSpacing: '0.04em', opacity: 0.85, fontWeight: 600 }}>{ev.ts}</span>
                <span style={{
                  color: STATUS_COLOR[ev.status], fontWeight: 800, letterSpacing: '0.10em',
                }}>{ev.status}</span>
                <span style={{ color: C.green, fontWeight: 800, letterSpacing: '0.06em' }}>{ev.code}</span>
                <span>
                  <span style={{ color: '#FFFFFF', fontWeight: 700 }}>{ev.label}</span>
                  <span style={{ color: '#FFFFFF', opacity: 0.80 }}> · {ev.detail}</span>
                </span>
                <span style={{
                  textAlign: 'right', fontWeight: 800,
                  color: ev.delta ? (ev.delta > 0 ? C.green : C.coral) : '#FFFFFF',
                  opacity: ev.delta ? 1 : 0.60,
                }}>
                  {ev.delta ? (ev.delta > 0 ? '+' : '') + fmtMoney(ev.delta) : '—'}
                </span>
              </div>
            ))}
            {/* Live cursor */}
            <div style={{
              padding: '12px 24px', borderTop: '1px dashed rgba(46,204,139,0.30)',
              color: C.green, fontSize: 13, letterSpacing: '0.08em', display: 'flex', justifyContent: 'space-between', fontWeight: 700,
            }}>
              <span>▶ Awaiting next event…</span>
              <span style={{ color: '#FFFFFF', opacity: 0.75, fontWeight: 600 }}>14 events · audit trail integrity ✓ verified</span>
            </div>
          </div>
        </div>
      )}

      {/* Phase-2 callouts */}
      <div style={{
        background: `linear-gradient(135deg, rgba(46,117,182,0.10), ${C.bg3})`,
        border: '1px solid rgba(46,117,182,0.35)',
        borderRadius: 12, padding: '24px 28px', display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 18,
        fontSize: 14, color: '#FFFFFF', lineHeight: 1.65, fontWeight: 400,
        boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
      }}>
        <div style={{ borderLeft: `4px solid ${C.gold}`, paddingLeft: 14 }}>
          <strong style={{ color: C.gold, fontSize: 15 }}>Phase 2 · Drag-to-move</strong><br/>
          Drag any card between columns to transition stage. DB updates instantly, activity log captures who moved it.
        </div>
        <div style={{ borderLeft: `4px solid ${C.gold}`, paddingLeft: 14 }}>
          <strong style={{ color: C.gold, fontSize: 15 }}>Phase 2 · Slack / SMS alerts</strong><br/>
          New qualified intake → Wagner + Eric notified. Clinic enters LOI → all three get pinged. Configurable per stage.
        </div>
        <div style={{ borderLeft: `4px solid ${C.gold}`, paddingLeft: 14 }}>
          <strong style={{ color: C.gold, fontSize: 15 }}>Phase 2 · Weighted EBITDA forecast</strong><br/>
          Each stage carries a probability weight (10/25/50/80%). Platform shows expected closing EBITDA per quarter.
        </div>
      </div>

      <style>{`
        @media (max-width: 1100px) {
          .kb-kanban { grid-template-columns: repeat(3, minmax(220px, 1fr)) !important; }
        }
        @media (max-width: 700px) {
          .kb-kanban { grid-template-columns: repeat(2, minmax(180px, 1fr)) !important; }
        }
      `}</style>
    </div>
  )
}

function KvTerm({ label, val, color }: { label: string; val: string; color: string }) {
  return (
    <span style={{ display: 'inline-flex', gap: 7, alignItems: 'baseline' }}>
      <span style={{ color: '#FFFFFF', fontSize: 11, letterSpacing: '0.10em', fontWeight: 700, opacity: 0.85 }}>{label}</span>
      <span style={{ color, fontWeight: 800, fontSize: 14 }}>{val}</span>
    </span>
  )
}

// Generic timeline for non-Piedmont deals — derived from stage
function MOCK_TIMELINE_FOR(d: Deal): TimelineEvent[] {
  const base: TimelineEvent[] = [
    { ts: '05/26 10:14', code: 'INTAKE_SUB', label: 'Intake submitted',    detail: `${d.npm} new/mo · ${d.city} ${d.state}`,           status: 'INFO' },
    { ts: '05/26 10:15', code: 'AUTO_QUAL',  label: 'Auto-qualification',  detail: 'Verdict: QUALIFIED · 3/4 Wagner criteria met',     status: 'OK',  delta: d.value * 0.6 },
    { ts: '05/26 10:17', code: 'VAL_BAND',   label: 'Valuation band',      detail: `${fmtMoney(d.value * 0.85)} – ${fmtMoney(d.value * 1.2)} · mid ${fmtMoney(d.value)}`, status: 'INFO' },
    { ts: '05/27 14:30', code: 'EMAIL_SENT', label: 'Auto-email Day 0',    detail: 'Welcome message · opened',                          status: 'OK' },
  ]
  if (d.stage === 'new') return base
  base.push({ ts: '05/28 11:42', code: 'CALL_LOG',  label: 'First call',     detail: 'McGrath · interested',                                  status: 'OK' })
  if (d.stage === 'called') return base
  base.push({ ts: '05/29 09:15', code: 'STAGE_MV', label: 'Stage → Scheduled', detail: 'Wagner meeting booked',                              status: 'INFO' })
  if (d.stage === 'scheduled') return base
  base.push({ ts: '06/01 11:00', code: 'MEET_HELD', label: 'Wagner meeting',  detail: '45 min · seller engaged',                              status: 'OK', delta: d.value * 0.08 })
  base.push({ ts: '06/01 16:20', code: 'DOCS_REQ',  label: 'Financials requested', detail: '3yr tax returns + P&L + bank',                  status: 'BID' })
  if (d.stage === 'in_diligence') return base
  base.push({ ts: '06/02 09:00', code: 'LOI_DRAFT', label: 'LOI drafted',     detail: `${fmtMoney(d.value)} · 50/50 cash+note · 4% profit share`, status: 'ASK', delta: d.value * 0.12 })
  if (d.stage === 'offer') return base
  base.push({ ts: '06/02 14:30', code: 'CLOSED',    label: 'Deal closed',     detail: 'APA signed · funds wired',                               status: 'OK', delta: d.value * 0.05 })
  return base
}
