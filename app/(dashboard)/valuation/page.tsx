'use client'

// ChiroPillar · AI Valuation
// Shows a fully-populated example valuation for one clinic (Piedmont Spine —
// the hero deal from /pipeline). Mirrors the app.KingdomBroker.com valuation
// pattern but themed for chiropractic with Wagner-specific deal structure.

import { useState } from 'react'

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
  if (n >= 1_000_000) return '$' + (n / 1_000_000).toFixed(2) + 'M'
  if (n >= 1_000) return '$' + Math.round(n / 1_000) + 'K'
  return '$' + Math.round(n)
}

// ── The hero clinic: Piedmont Spine & Wellness ──────────────────────────
const CLINIC = {
  name: 'Piedmont Spine & Wellness',
  owner: 'Dr. Marcus Bell',
  city: 'Charlottesville',
  state: 'VA',
  years: 14,
  employees: 8,
  practice_type: 'Multi-DC · 2 associates',
}

// 3 years of financials (most recent first)
const FINANCIALS = [
  { year: 2025, revenue: 1_300_000, ebitda:   485_000, owner_comp: 245_000 },
  { year: 2024, revenue: 1_185_000, ebitda:   420_000, owner_comp: 230_000 },
  { year: 2023, revenue: 1_050_000, ebitda:   365_000, owner_comp: 215_000 },
]

const ADD_BACKS = [
  { label: 'Owner compensation above market',    amount: 65_000, reason: 'Owner draws $245K; market rate $180K for 1-DC clinic of this size' },
  { label: 'Personal vehicle expense',           amount: 22_000, reason: '2024 Tesla Model Y written through practice' },
  { label: 'One-time legal · associate buyout',  amount: 28_000, reason: '2024 only · departing associate equity unwind' },
  { label: 'CME + family travel (Hawaii Conf.)', amount: 15_000, reason: '2024 + 2025 · personal trip flagged as CME' },
]
const totalAddBacks = ADD_BACKS.reduce((s, a) => s + a.amount, 0)
const normalizedEbitda2025 = FINANCIALS[0].ebitda + totalAddBacks   // 485 + 130 = 615K

// Valuation band · solo profile · 1.46× SDE median ± 30%
const sde2025 = normalizedEbitda2025 + FINANCIALS[0].owner_comp  // 615 + 245 = 860K
const COMP_MULT = 1.46
const valLow  = sde2025 * 1.08
const valMid  = sde2025 * COMP_MULT
const valHigh = sde2025 * 2.05

// Wagner deal structure recommendation
const cashAtClose       = valMid * 0.50
const sellerNote        = valMid * 0.40
const rolloverEquity    = valMid * 0.10
const profitSharePct    = 4
const annualProfitShare = normalizedEbitda2025 * (profitSharePct / 100)
const medTeamLift       = 250_000   // Wagner playbook
const exitMultiple      = 9

// Comparable transactions (from the ~200-deal dataset)
const COMPS = [
  { name: 'Roanoke Family Chiro',     state: 'VA', rev:   980_000, sde:  315_000, mult: 1.52, year: 2024 },
  { name: 'Lynchburg Spine Center',   state: 'VA', rev: 1_180_000, sde:  410_000, mult: 1.45, year: 2025 },
  { name: 'Asheville Wellness Group', state: 'NC', rev: 1_055_000, sde:  385_000, mult: 1.62, year: 2024 },
  { name: 'Knoxville Chiro Practice', state: 'TN', rev: 1_290_000, sde:  430_000, mult: 1.41, year: 2023 },
  { name: 'Macon Spine & Sport',      state: 'GA', rev: 1_150_000, sde:  395_000, mult: 1.38, year: 2025 },
  { name: 'Greenville Family',        state: 'SC', rev: 1_080_000, sde:  370_000, mult: 1.55, year: 2024 },
  { name: 'Charlottesville Athletic', state: 'VA', rev: 1_400_000, sde:  510_000, mult: 1.49, year: 2025 },
]

const TABS = [
  { key: 'summary',   label: 'Summary'           },
  { key: 'financials', label: 'Financials (3-yr)' },
  { key: 'addbacks',  label: 'Add-backs'         },
  { key: 'comps',     label: 'Comparables'       },
  { key: 'structure', label: 'Deal Structure'    },
  { key: 'risks',     label: 'Risks & Drivers'   },
]

export default function ValuationPage() {
  const [tab, setTab] = useState<string>('summary')
  const maxRev = Math.max(...FINANCIALS.map(f => f.revenue))

  return (
    <div style={{ padding: '32px 32px 80px', maxWidth: 1280, margin: '0 auto', fontFamily: F.body, color: C.text }}>

      {/* HEADER */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontFamily: F.mono, fontSize: 11, color: C.gold, letterSpacing: '0.22em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 8 }}>
          AI Valuation · per-clinic example
        </div>
        <h1 style={{ fontFamily: F.display, fontSize: 'clamp(30px, 4vw, 40px)', fontWeight: 700, margin: '0 0 6px', letterSpacing: '-0.02em' }}>
          {CLINIC.name}
        </h1>
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', fontSize: 14, color: C.muted, lineHeight: 1.6 }}>
          <span>{CLINIC.owner}</span>
          <span>·</span>
          <span>{CLINIC.city}, {CLINIC.state}</span>
          <span>·</span>
          <span>{CLINIC.years} yrs in business</span>
          <span>·</span>
          <span>{CLINIC.employees} employees</span>
          <span>·</span>
          <span>{CLINIC.practice_type}</span>
        </div>
      </div>

      {/* ── VALUATION GAUGE HERO ────────────────────────────────────── */}
      <div style={{
        background: `linear-gradient(135deg, rgba(201,168,76,0.10) 0%, ${C.bg3} 100%)`,
        border: `1px solid rgba(201,168,76,0.30)`, borderRadius: 14,
        padding: '32px 36px', marginBottom: 24,
      }}>
        <div style={{ fontFamily: F.mono, fontSize: 11, color: C.gold, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 14 }}>
          ★ Estimated Valuation Range
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 18, marginBottom: 20 }} className="kb-val-grid">
          <Pillar label="Conservative"  val={fmtMoney(valLow)}  sub="P25 of comp set"   color={C.muted}     />
          <Pillar label="Fair Market"    val={fmtMoney(valMid)}  sub="Median 1.46× SDE"  color={C.gold} big />
          <Pillar label="Premium"       val={fmtMoney(valHigh)} sub="P75 of comp set"   color={C.green}     />
        </div>

        {/* Range bar */}
        <div style={{ position: 'relative', height: 14, background: 'rgba(255,255,255,0.06)', borderRadius: 7, marginBottom: 14, overflow: 'hidden' }}>
          <div style={{
            position: 'absolute', left: '0%', right: '0%', top: 0, bottom: 0,
            background: `linear-gradient(90deg, rgba(155,168,192,0.3), ${C.gold}, ${C.green})`,
            borderRadius: 7,
          }} />
          <div style={{ position: 'absolute', left: '50%', top: -3, bottom: -3, width: 3, background: '#FFFFFF', boxShadow: '0 0 8px rgba(255,255,255,0.6)' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: F.mono, fontSize: 10, color: C.faint, letterSpacing: '0.06em' }}>
          <span>{fmtMoney(valLow)}</span>
          <span style={{ color: C.gold, fontWeight: 700 }}>FMV · {fmtMoney(valMid)}</span>
          <span>{fmtMoney(valHigh)}</span>
        </div>

        <div style={{ marginTop: 20, padding: '14px 18px', background: 'rgba(46,117,182,0.06)', border: `1px solid rgba(46,117,182,0.18)`, borderRadius: 10, fontSize: 13, color: C.muted, lineHeight: 1.6 }}>
          <strong style={{ color: C.text }}>Calibrated to nearly 200 chiropractic deals analyzed.</strong> Solo-profile median 1.46× SDE · P25–P75 1.08–2.05× · Sources: BizBuySell, Progressive Practice Sales, William David Co, JYNT 10-K. Asking-price-derived — closing typically 85–95% of FMV.
        </div>
      </div>

      {/* KPI strip · the math behind the band */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14,
        background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 14,
        padding: '20px 24px', marginBottom: 32,
      }}>
        <Kpi label="2025 Revenue"          val={fmtMoney(FINANCIALS[0].revenue)} color={C.text} />
        <Kpi label="Reported EBITDA"       val={fmtMoney(FINANCIALS[0].ebitda)}   color={C.muted} />
        <Kpi label="Add-backs found"       val={fmtMoney(totalAddBacks)}          color={C.green} sub="+27% lift" />
        <Kpi label="Normalized EBITDA"     val={fmtMoney(normalizedEbitda2025)}   color={C.green} sub="2025" />
        <Kpi label="SDE"                   val={fmtMoney(sde2025)}                 color={C.gold}  sub="EBITDA + owner" />
        <Kpi label="Applied multiple"      val={`${COMP_MULT}×`}                    color={C.goldLight} sub="solo median" />
      </div>

      {/* TABS */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 18 }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} type="button" style={{
            padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
            fontFamily: F.body, fontSize: 13, fontWeight: tab === t.key ? 700 : 500,
            background: tab === t.key ? C.gold : 'rgba(255,255,255,0.04)',
            color: tab === t.key ? C.bg : C.muted,
            transition: 'all 0.15s',
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* TAB · SUMMARY */}
      {tab === 'summary' && (
        <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 14, padding: '24px 28px' }}>
          <SectionTitle eyebrow="Claude's narrative" title="The story buyers see." />
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 24 }} className="kb-val-grid">
            <div>
              <p style={{ fontSize: 14.5, color: C.text, lineHeight: 1.75, marginBottom: 16 }}>
                <strong style={{ color: C.gold }}>Piedmont Spine & Wellness</strong> is a mature, owner-managed multi-DC chiropractic practice in Charlottesville, VA — Dr. Wagner&apos;s primary market — with 14 years of operating history, two associate DCs, and 78 new patients per month. The clinic shows <strong>consistent year-over-year revenue growth (+10.7% CAGR)</strong> with strong patient retention (28-visit avg), placing it in the upper quartile of comparable independent chiropractic practices in the South.
              </p>
              <p style={{ fontSize: 14.5, color: C.text, lineHeight: 1.75, marginBottom: 16 }}>
                Reported EBITDA of <strong>$485K</strong> normalizes to <strong>{fmtMoney(normalizedEbitda2025)}</strong> after legitimate add-backs (above-market owner comp, vehicle, one-time legal, personal travel). At the comp-set median of 1.46× SDE, fair-market value lands at <strong style={{ color: C.gold }}>{fmtMoney(valMid)}</strong> — defensible against the ~200-deal benchmark.
              </p>
              <p style={{ fontSize: 14.5, color: C.text, lineHeight: 1.75, margin: 0 }}>
                The practice is an <strong style={{ color: C.green }}>ideal ChiroPillar partnership candidate</strong>: owner is mostly-management (ready to step out), service mix supports medical-team bolt-on, and the geographic position inside Wagner&apos;s 7-county footprint enables direct playbook installation with no operator-training delay.
              </p>
            </div>

            {/* Match score panel */}
            <div style={{ background: C.bg3, border: `1px solid ${C.border}`, borderRadius: 12, padding: '22px 24px' }}>
              <div style={{ fontFamily: F.mono, fontSize: 10, color: C.green, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 14 }}>
                ChiroPillar fit score
              </div>
              <div style={{ fontFamily: F.display, fontSize: 56, fontWeight: 800, color: C.green, lineHeight: 1, marginBottom: 4 }}>
                94<span style={{ fontSize: 22, color: C.faint }}>/100</span>
              </div>
              <div style={{ fontSize: 12, color: C.muted, marginBottom: 18, fontStyle: 'italic' }}>"Top-decile partnership candidate"</div>

              <FitRow label="Wagner geography (VA)"     score={100} accent={C.gold}      />
              <FitRow label="40+ new patients/mo"        score={100} accent={C.green}     />
              <FitRow label="Owner ready to step out"    score={95}  accent={C.green}     />
              <FitRow label="Retention (24+ visit avg)"  score={92}  accent={C.green}     />
              <FitRow label="Service mix supports medical" score={88} accent={C.goldLight} />
              <FitRow label="3yr revenue trend (growing)" score={90}  accent={C.green}     />
            </div>
          </div>
        </div>
      )}

      {/* TAB · FINANCIALS */}
      {tab === 'financials' && (
        <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 14, padding: '24px 28px' }}>
          <SectionTitle eyebrow="3-year financial trajectory" title="Revenue + EBITDA, year over year." />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 30, alignItems: 'end' }}>
            {/* Revenue bars */}
            <div>
              <div style={{ fontFamily: F.mono, fontSize: 10, color: C.faint, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 10 }}>
                Gross revenue
              </div>
              {[...FINANCIALS].reverse().map((f, i) => (
                <div key={f.year} style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 13 }}>
                    <span style={{ color: C.muted, fontFamily: F.mono }}>{f.year}</span>
                    <span style={{ color: C.text, fontWeight: 700, fontFamily: F.display, fontSize: 17 }}>{fmtMoney(f.revenue)}</span>
                  </div>
                  <div style={{ height: 14, background: 'rgba(255,255,255,0.04)', borderRadius: 7, overflow: 'hidden' }}>
                    <div style={{ width: `${(f.revenue / maxRev) * 100}%`, height: '100%', background: `linear-gradient(90deg, ${C.gold}, ${C.goldLight})`, borderRadius: 7 }} />
                  </div>
                </div>
              ))}
            </div>
            {/* EBITDA bars */}
            <div>
              <div style={{ fontFamily: F.mono, fontSize: 10, color: C.faint, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 10 }}>
                EBITDA (reported)
              </div>
              {[...FINANCIALS].reverse().map(f => (
                <div key={f.year} style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 13 }}>
                    <span style={{ color: C.muted, fontFamily: F.mono }}>{f.year}</span>
                    <span style={{ color: C.green, fontWeight: 700, fontFamily: F.display, fontSize: 17 }}>{fmtMoney(f.ebitda)}</span>
                  </div>
                  <div style={{ height: 14, background: 'rgba(255,255,255,0.04)', borderRadius: 7, overflow: 'hidden' }}>
                    <div style={{ width: `${(f.ebitda / maxRev) * 100}%`, height: '100%', background: `linear-gradient(90deg, ${C.green}, ${C.green}88)`, borderRadius: 7 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3-year table */}
          <div style={{ marginTop: 32 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr 1fr 1fr 1fr', gap: 14, padding: '10px 12px', borderBottom: `1px solid ${C.border}`, fontFamily: F.mono, fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.faint, fontWeight: 700 }}>
              <div>Year</div>
              <div style={{ textAlign: 'right' }}>Revenue</div>
              <div style={{ textAlign: 'right' }}>EBITDA</div>
              <div style={{ textAlign: 'right' }}>Margin</div>
              <div style={{ textAlign: 'right' }}>Owner Comp</div>
            </div>
            {FINANCIALS.map(f => (
              <div key={f.year} style={{ display: 'grid', gridTemplateColumns: '100px 1fr 1fr 1fr 1fr', gap: 14, padding: '14px 12px', borderBottom: `1px solid ${C.border}`, fontSize: 14, alignItems: 'baseline' }}>
                <div style={{ fontFamily: F.mono, fontWeight: 700, color: C.gold }}>{f.year}</div>
                <div style={{ textAlign: 'right', fontFamily: F.display, fontWeight: 700, color: C.text }}>{fmtMoney(f.revenue)}</div>
                <div style={{ textAlign: 'right', fontFamily: F.display, fontWeight: 700, color: C.green }}>{fmtMoney(f.ebitda)}</div>
                <div style={{ textAlign: 'right', color: C.muted, fontFamily: F.mono }}>{((f.ebitda / f.revenue) * 100).toFixed(1)}%</div>
                <div style={{ textAlign: 'right', color: C.muted, fontFamily: F.mono }}>{fmtMoney(f.owner_comp)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB · ADD-BACKS */}
      {tab === 'addbacks' && (
        <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 14, padding: '24px 28px' }}>
          <SectionTitle eyebrow="Claude AI · add-back detection" title="Where the +27% EBITDA lift comes from." />
          <div style={{ display: 'flex', gap: 14, alignItems: 'baseline', marginBottom: 24, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: 11, color: C.faint, fontFamily: F.mono, letterSpacing: '0.10em', textTransform: 'uppercase' }}>Reported EBITDA</div>
              <div style={{ fontFamily: F.display, fontSize: 28, fontWeight: 700, color: C.muted }}>{fmtMoney(FINANCIALS[0].ebitda)}</div>
            </div>
            <div style={{ color: C.gold, fontSize: 22 }}>+</div>
            <div>
              <div style={{ fontSize: 11, color: C.faint, fontFamily: F.mono, letterSpacing: '0.10em', textTransform: 'uppercase' }}>Add-backs</div>
              <div style={{ fontFamily: F.display, fontSize: 28, fontWeight: 700, color: C.green }}>+{fmtMoney(totalAddBacks)}</div>
            </div>
            <div style={{ color: C.gold, fontSize: 22 }}>=</div>
            <div>
              <div style={{ fontSize: 11, color: C.faint, fontFamily: F.mono, letterSpacing: '0.10em', textTransform: 'uppercase' }}>Normalized EBITDA</div>
              <div style={{ fontFamily: F.display, fontSize: 32, fontWeight: 800, color: C.gold }}>{fmtMoney(normalizedEbitda2025)}</div>
            </div>
          </div>

          {ADD_BACKS.map((a, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 110px 2fr', gap: 14, padding: '14px 14px', borderBottom: i < ADD_BACKS.length - 1 ? `1px solid ${C.border}` : 'none', alignItems: 'baseline' }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{a.label}</div>
              <div style={{ textAlign: 'right', fontFamily: F.display, fontWeight: 800, fontSize: 18, color: C.green }}>+{fmtMoney(a.amount)}</div>
              <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.5 }}>{a.reason}</div>
            </div>
          ))}
        </div>
      )}

      {/* TAB · COMPS */}
      {tab === 'comps' && (
        <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 14, padding: '24px 28px' }}>
          <SectionTitle eyebrow="Closest comparables" title="7 most-similar chiropractic deals from the ~200-deal set." />
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 50px 110px 110px 90px 70px', gap: 14, padding: '10px 14px', borderBottom: `1px solid ${C.border}`, fontFamily: F.mono, fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.faint, fontWeight: 700 }}>
            <div>Practice</div>
            <div>St</div>
            <div style={{ textAlign: 'right' }}>Revenue</div>
            <div style={{ textAlign: 'right' }}>SDE</div>
            <div style={{ textAlign: 'right' }}>Multiple</div>
            <div style={{ textAlign: 'right' }}>Year</div>
          </div>
          {COMPS.map((c, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1.4fr 50px 110px 110px 90px 70px', gap: 14, padding: '14px', borderBottom: i < COMPS.length - 1 ? `1px solid ${C.border}` : 'none', fontSize: 13, alignItems: 'baseline' }}>
              <div style={{ color: C.text, fontWeight: 500 }}>{c.name}</div>
              <div style={{ color: C.gold, fontFamily: F.mono, fontWeight: 700 }}>{c.state}</div>
              <div style={{ textAlign: 'right', color: C.muted, fontFamily: F.mono }}>{fmtMoney(c.rev)}</div>
              <div style={{ textAlign: 'right', color: C.green, fontFamily: F.mono, fontWeight: 700 }}>{fmtMoney(c.sde)}</div>
              <div style={{ textAlign: 'right', color: C.gold, fontFamily: F.display, fontWeight: 800, fontSize: 16 }}>{c.mult}×</div>
              <div style={{ textAlign: 'right', color: C.faint, fontFamily: F.mono, fontSize: 11 }}>{c.year}</div>
            </div>
          ))}
        </div>
      )}

      {/* TAB · DEAL STRUCTURE */}
      {tab === 'structure' && (
        <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 14, padding: '24px 28px' }}>
          <SectionTitle eyebrow="Recommended deal structure" title="Wagner's 4-stream offer formula." />
          <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.6, marginBottom: 24 }}>
            Based on practice size + owner role + seller cash-flow needs, Claude recommends a structure that beats Dr. Bell&apos;s standalone alternative across all four streams: cash now, secured note, ongoing profit share, and platform-equity rollover.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginBottom: 28 }}>
            <Stream pct="50%" amount={fmtMoney(cashAtClose)} title="Cash at close" sub="Funded by Wagner Family Office" accent={C.gold} />
            <Stream pct="40%" amount={fmtMoney(sellerNote)}  title="Seller note · 5 yr"  sub="6% interest · paid from clinic cash flow" accent={C.align} />
            <Stream pct="10%" amount={fmtMoney(rolloverEquity)} title="ChiroPillar rollover" sub="Re-rated at 8–10× at exit" accent={C.green} />
            <Stream pct={`${profitSharePct}%`} amount={`${fmtMoney(annualProfitShare)}/yr`} title="Profit share" sub={`On improved clinic EBITDA · ongoing`} accent={C.goldLight} />
          </div>

          {/* Wagner playbook lift */}
          <div style={{ background: 'rgba(46,204,139,0.08)', border: '1px solid rgba(46,204,139,0.25)', borderRadius: 12, padding: '18px 22px', marginBottom: 16 }}>
            <div style={{ fontFamily: F.mono, fontSize: 10, color: C.green, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 8 }}>
              ★ Wagner medical-team add-on
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 12 }}>
              <div style={{ fontSize: 14, color: C.text, lineHeight: 1.6, maxWidth: 700 }}>
                Once the playbook is installed (pain mgmt + diagnostic billing + medical-team handoff), per-office EBITDA lifts approximately <strong style={{ color: C.green }}>+{fmtMoney(medTeamLift)}</strong>. Bell&apos;s improved EBITDA: <strong>{fmtMoney(normalizedEbitda2025 + medTeamLift)}</strong>. At exit multiple of 9×, his rollover share is worth <strong style={{ color: C.gold }}>{fmtMoney(rolloverEquity * 5)}</strong> alone.
              </div>
            </div>
          </div>

          {/* Total payout */}
          <div style={{ background: C.bg3, border: `1px solid ${C.border}`, borderRadius: 12, padding: '18px 22px' }}>
            <div style={{ fontFamily: F.mono, fontSize: 10, color: C.faint, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 12 }}>
              Total seller-economic value (5-year)
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
              <SellerLine label="Cash at close"                       val={fmtMoney(cashAtClose)} />
              <SellerLine label="Seller note (principal + interest)" val={fmtMoney(sellerNote * 1.18)} />
              <SellerLine label="5-yr profit share (improved EBITDA)" val={fmtMoney((normalizedEbitda2025 + medTeamLift) * 0.04 * 5)} />
              <SellerLine label="Rollover at exit (9× of lifted EBITDA × 10%)" val={fmtMoney((normalizedEbitda2025 + medTeamLift) * exitMultiple * 0.10)} />
            </div>
            <div style={{ marginTop: 16, paddingTop: 14, borderTop: `2px solid ${C.gold}`, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontFamily: F.mono, fontSize: 11, color: C.gold, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 800 }}>Total 5-yr value to Bell</span>
              <span style={{ fontFamily: F.display, fontSize: 28, fontWeight: 800, color: C.gold }}>
                {fmtMoney(cashAtClose + sellerNote * 1.18 + (normalizedEbitda2025 + medTeamLift) * 0.04 * 5 + (normalizedEbitda2025 + medTeamLift) * exitMultiple * 0.10)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB · RISKS & DRIVERS */}
      {tab === 'risks' && (
        <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 14, padding: '24px 28px' }}>
          <SectionTitle eyebrow="Risk + value drivers" title="What pulls the band up — and what pulls it down." />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }} className="kb-val-grid">

            {/* Value drivers */}
            <div>
              <div style={{ fontFamily: F.mono, fontSize: 11, color: C.green, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 7 }}>
                ↗ Value drivers
              </div>
              {[
                { title: '14-year operating history',         desc: 'De-risks every diligence question. Buyers pay for tenure.' },
                { title: 'Strong patient retention · 28 visits', desc: 'Top quartile. Reduces marketing-spend assumption for buyer.' },
                { title: '2 associate DCs in place',          desc: 'Owner-not-job structure. Premium SDE multiple justified.' },
                { title: 'Charlottesville · Wagner home turf', desc: 'Geographic alignment with Wagner playbook = fastest install.' },
                { title: 'Recent revenue growth · +10.7% CAGR',  desc: 'Story is "growing platform," not "stable plateau."' },
              ].map((d, i) => (
                <DriverRow key={i} title={d.title} desc={d.desc} pos />
              ))}
            </div>

            {/* Risks */}
            <div>
              <div style={{ fontFamily: F.mono, fontSize: 11, color: C.coral, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 7 }}>
                ↘ Risk factors
              </div>
              {[
                { title: 'Owner concentration',                  desc: 'Bell still personally treats 35% of patients. Mitigated by 4% profit share + mostly_management transition plan.' },
                { title: 'Single-location footprint',            desc: 'No 2nd location to absorb buyer overhead. Roll-up structure resolves this.' },
                { title: 'No medical billing yet',               desc: 'Pure cash chiropractic. Medical-team install opens the diagnostic billing line — that&apos;s the +$250K lift.' },
                { title: 'PI cases at 8% of mix',                desc: 'Lower than Wagner-portfolio average of 15%. Modest growth opportunity.' },
                { title: 'Lease expires 2027',                   desc: 'Renewal at market rate is a hidden cost. Negotiation lever for Wagner before LOI.' },
              ].map((d, i) => (
                <DriverRow key={i} title={d.title} desc={d.desc} />
              ))}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 880px) {
          .kb-val-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}

function Pillar({ label, val, sub, color, big }: { label: string; val: string; sub: string; color: string; big?: boolean }) {
  return (
    <div style={{
      textAlign: 'center', padding: big ? '20px 14px 22px' : '14px 14px',
      background: big ? `linear-gradient(180deg, rgba(201,168,76,0.10), rgba(201,168,76,0.04))` : 'transparent',
      border: big ? `2px solid ${C.gold}` : `1px solid ${C.border}`,
      borderRadius: 10,
    }}>
      <div style={{ fontFamily: F.mono, fontSize: 10, color: C.faint, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 700 }}>
        {label}
      </div>
      <div style={{ fontFamily: F.display, fontSize: big ? 38 : 28, fontWeight: 800, color, lineHeight: 1, margin: '8px 0 4px' }}>
        {val}
      </div>
      <div style={{ fontFamily: F.mono, fontSize: 10, color: C.faint, letterSpacing: '0.06em' }}>{sub}</div>
    </div>
  )
}

function Kpi({ label, val, color, sub }: { label: string; val: string; color: string; sub?: string }) {
  return (
    <div>
      <div style={{ fontFamily: F.mono, fontSize: 10, color: C.faint, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700, color, fontFamily: F.display, lineHeight: 1 }}>{val}</div>
      {sub && <div style={{ fontFamily: F.mono, fontSize: 10, color: C.faint, marginTop: 3, letterSpacing: '0.04em' }}>{sub}</div>}
    </div>
  )
}

function SectionTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontFamily: F.mono, fontSize: 10, color: C.align, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 6 }}>{eyebrow}</div>
      <h2 style={{ fontFamily: F.display, fontSize: 22, fontWeight: 600, margin: 0, letterSpacing: '-0.01em' }}>{title}</h2>
    </div>
  )
}

function FitRow({ label, score, accent }: { label: string; score: number; accent: string }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
        <span style={{ color: C.muted }}>{label}</span>
        <span style={{ color: accent, fontFamily: F.mono, fontWeight: 700 }}>{score}</span>
      </div>
      <div style={{ height: 5, background: 'rgba(255,255,255,0.04)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ width: `${score}%`, height: '100%', background: accent }} />
      </div>
    </div>
  )
}

function Stream({ pct, amount, title, sub, accent }: { pct: string; amount: string; title: string; sub: string; accent: string }) {
  return (
    <div style={{ background: C.bg3, border: `1px solid ${C.border}`, borderRadius: 12, padding: '18px 20px', borderLeft: `3px solid ${accent}` }}>
      <div style={{ fontFamily: F.mono, fontSize: 10, color: accent, letterSpacing: '0.14em', fontWeight: 800 }}>{pct}</div>
      <div style={{ fontFamily: F.display, fontSize: 22, fontWeight: 800, color: accent, lineHeight: 1, margin: '4px 0 8px' }}>{amount}</div>
      <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 3 }}>{title}</div>
      <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.45 }}>{sub}</div>
    </div>
  )
}

function SellerLine({ label, val }: { label: string; val: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '6px 0' }}>
      <span style={{ fontSize: 13, color: C.muted }}>{label}</span>
      <span style={{ fontFamily: F.display, fontSize: 17, fontWeight: 700, color: C.text }}>{val}</span>
    </div>
  )
}

function DriverRow({ title, desc, pos }: { title: string; desc: string; pos?: boolean }) {
  return (
    <div style={{ display: 'flex', gap: 12, marginBottom: 14, alignItems: 'flex-start' }}>
      <span style={{
        flexShrink: 0, marginTop: 5,
        width: 9, height: 9, borderRadius: 999,
        background: pos ? C.green : C.coral,
        boxShadow: `0 0 6px ${(pos ? C.green : C.coral) + '88'}`,
      }} />
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 3 }}>{title}</div>
        <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.55 }}>{desc}</div>
      </div>
    </div>
  )
}
