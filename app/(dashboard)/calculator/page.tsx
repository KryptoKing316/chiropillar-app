'use client'

// ChiroPillar · Deal Calculator (authenticated, admin view)
// Ported from the static HTML version at KingdomBroker.com/chiropractor.
// This version supports the "Hide Rollup" toggle — when ON, the screen
// shows ONLY the conservative single-office seller payout (what a
// chiropractor would see). When OFF, it shows the full platform math
// Equity structure (Wagner / KB) intentionally not yet displayed —
// to be set in definitive documentation. Public + chiropractor-view
// already hide it; admin view shows "TBD" placeholder.
//
// Per Dr. Wagner's directive: "We don't want the client knowing that
// their true value is really 10 times. We only want them to see that
// the current value with this one business is about three times or
// four times, but we know if we put all these together it's really
// 10 times the value."

import { useEffect, useState } from 'react'

type Inputs = {
  ebitda: number      // per-office EBITDA at purchase ($K)
  pmult: number       // purchase multiple
  cashPct: number     // % at close
  rate: number        // seller note rate
  psharePct: number   // ongoing profit share %
  n: number           // # offices in platform
  uplift: number      // per-office EBITDA uplift ($K)
  mso: number         // MSO overhead ($K)
  hold: number        // hold years
  emult: number       // base-case exit multiple
  rollPct: number     // seller rollover %
}

const DEFAULTS: Inputs = {
  ebitda: 250, pmult: 4, cashPct: 50, rate: 7, psharePct: 4,
  n: 12, uplift: 250, mso: 1000, hold: 4, emult: 9, rollPct: 0,
}

function fmtMoney(n: number) {
  if (Math.abs(n) >= 1_000_000) return '$' + (n/1_000_000).toFixed(2) + 'M'
  if (Math.abs(n) >= 1_000)     return '$' + Math.round(n/1_000) + 'K'
  return '$' + Math.round(n)
}
function fmtMshort(n: number) {
  if (Math.abs(n) >= 1_000_000) return '$' + (n/1_000_000).toFixed(1) + 'M'
  if (Math.abs(n) >= 1_000)     return '$' + Math.round(n/1_000) + 'K'
  return '$' + Math.round(n)
}

export default function CalculatorPage() {
  const [hideRollup, setHideRollup] = useState(false)
  const [i, setI] = useState<Inputs>(DEFAULTS)

  function set<K extends keyof Inputs>(k: K, v: number) {
    setI(prev => ({ ...prev, [k]: v }))
  }

  // ── Derived values (same math as the static calc) ──────────────────────
  const ebitda$       = i.ebitda * 1000
  const ev            = ebitda$ * i.pmult
  const cashClose     = ev * (i.cashPct / 100)
  const notePrincipal = ev * (1 - i.cashPct / 100)
  const noteInterest  = notePrincipal * (i.rate / 100) * i.hold * 0.55
  const upliftEbitda  = ebitda$ + i.uplift * 1000
  const pshareTotal   = upliftEbitda * (i.psharePct / 100) * i.hold
  const rolledIn      = cashClose * (i.rollPct / 100)
  const rollGain      = rolledIn * (i.emult / i.pmult)
  const cashClosePost = cashClose - rolledIn
  const sellerTotal   = cashClosePost + notePrincipal + noteInterest + pshareTotal + rollGain
  const standalone    = ebitda$ * i.hold

  // Conservative seller-facing valuation: just buy at purchase multiple, no platform talk
  const conservativeVal = ebitda$ * Math.max(3, i.pmult - 1) // show them 3-4×, not the platform 9×

  // Platform side
  const aggEbitda    = ebitda$ * i.n
  const totalPrice   = aggEbitda * i.pmult
  const upliftAgg    = upliftEbitda * i.n
  const platEbitda   = upliftAgg - i.mso * 1000
  const postMult     = totalPrice / Math.max(platEbitda, 1)
  const evLow        = platEbitda * 8
  const evBase       = platEbitda * i.emult
  const evHigh       = platEbitda * 10
  const moicBase     = evBase / totalPrice

  return (
    <div style={{ padding: 32, background: '#F7F4ED', minHeight: '100vh', color: '#1a1a1a', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>

        {/* Header + Mode Toggle */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 20 }}>
          <div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.22em', color: '#2E75B6', textTransform: 'uppercase', fontWeight: 700, marginBottom: 8 }}>
              ChiroPillar · Deal Calculator
            </div>
            <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 36, fontWeight: 700, color: '#1F4E79', margin: 0, letterSpacing: '-0.02em' }}>
              Seller Payout × Platform Returns
            </h1>
            <p style={{ color: '#666', fontSize: 14, marginTop: 6 }}>11 flippable assumptions · live recalculation · seller payout + platform returns</p>
          </div>

          {/* HIDE ROLLUP TOGGLE — Wagner's directive */}
          <label style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '10px 18px',
            background: hideRollup ? '#C9A84C' : 'white',
            border: hideRollup ? '2px solid #C9A84C' : '2px solid rgba(31,78,121,0.20)',
            borderRadius: 999, cursor: 'pointer',
            transition: 'all 0.2s',
          }}>
            <input type="checkbox" checked={hideRollup} onChange={e => setHideRollup(e.target.checked)} style={{ width: 16, height: 16 }}/>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: hideRollup ? '#5A4A1A' : '#1F4E79', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                {hideRollup ? '👁 Hide Rollup · Chiropractor View' : '👁 Show Rollup · Admin View'}
              </div>
              <div style={{ fontSize: 11, color: hideRollup ? '#5A4A1A' : '#666', marginTop: 2 }}>
                {hideRollup ? 'Conservative valuation only · platform math hidden' : 'Full platform + 80/20 cap table visible'}
              </div>
            </div>
          </label>
        </div>

        {/* Body */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 360px) 1fr', gap: 24 }}>

          {/* INPUTS */}
          <div style={{ background: 'white', borderRadius: 14, padding: 24, boxShadow: '0 4px 16px rgba(31,78,121,0.06)' }}>
            <CtrlGroup label="Per-Office Acquisition">
              <Slider label="EBITDA per office" val={`$${i.ebitda}K`} min={100} max={600} step={25} value={i.ebitda} on={v => set('ebitda', v)} />
              <Slider label="Purchase multiple" val={`${i.pmult.toFixed(2)}×`} min={2.5} max={6} step={0.25} value={i.pmult} on={v => set('pmult', v)} />
              {!hideRollup && (
                <>
                  <Slider label="Cash at close %" val={`${i.cashPct}%`} min={30} max={80} step={5} value={i.cashPct} on={v => set('cashPct', v)} />
                  <Slider label="Seller note rate" val={`${i.rate.toFixed(1)}%`} min={4} max={12} step={0.5} value={i.rate} on={v => set('rate', v)} />
                  <Slider label="Profit share %" val={`${i.psharePct.toFixed(1)}%`} min={0} max={10} step={0.5} value={i.psharePct} on={v => set('psharePct', v)} />
                </>
              )}
            </CtrlGroup>

            {!hideRollup && (
              <>
                <CtrlGroup label="Platform Operations">
                  <Slider label="# offices in platform" val={`${i.n}`} min={3} max={30} step={1} value={i.n} on={v => set('n', v)} />
                  <Slider label="Per-office uplift" val={`$${i.uplift}K`} min={0} max={500} step={25} value={i.uplift} on={v => set('uplift', v)} />
                  <Slider label="MSO overhead" val={i.mso >= 1000 ? `$${(i.mso/1000).toFixed(1)}M` : `$${i.mso}K`} min={300} max={3000} step={100} value={i.mso} on={v => set('mso', v)} />
                </CtrlGroup>

                <CtrlGroup label="Exit Assumptions">
                  <Slider label="Hold period" val={`${i.hold} yrs`} min={2} max={7} step={1} value={i.hold} on={v => set('hold', v)} />
                  <Slider label="Base exit multiple" val={`${i.emult.toFixed(1)}×`} min={6} max={12} step={0.5} value={i.emult} on={v => set('emult', v)} />
                  <Slider label="Seller rollover %" val={`${i.rollPct}%`} min={0} max={50} step={5} value={i.rollPct} on={v => set('rollPct', v)} />
                </CtrlGroup>
              </>
            )}

            <button onClick={() => setI(DEFAULTS)} style={{
              width: '100%', padding: '11px 14px', background: 'white',
              border: '1px solid rgba(31,78,121,0.15)', borderRadius: 7,
              fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: 600,
              letterSpacing: '0.14em', textTransform: 'uppercase', color: '#1F4E79',
              cursor: 'pointer', marginTop: 8,
            }}>
              ↺ Reset to base case
            </button>
          </div>

          {/* OUTPUTS */}
          <div style={{ background: 'white', borderRadius: 14, padding: 30, boxShadow: '0 4px 16px rgba(31,78,121,0.06)' }}>

            {hideRollup ? (
              // ── CHIROPRACTOR VIEW · Conservative-only ───────────────────────
              <>
                <OutH>Practice Valuation · Estimated Range</OutH>
                <div style={{ padding: '24px 28px', background: 'linear-gradient(135deg, #FAF6EC 0%, #F0E8D0 100%)', borderRadius: 10, marginBottom: 24 }}>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.14em', color: '#7A6A45', textTransform: 'uppercase', fontWeight: 600, marginBottom: 8 }}>
                    Your practice today
                  </div>
                  <div style={{ fontFamily: 'Georgia, serif', fontSize: 44, fontWeight: 700, color: '#1F4E79', letterSpacing: '-0.02em', lineHeight: 1, marginBottom: 6 }}>
                    {fmtMshort(conservativeVal * 0.85)} – {fmtMshort(conservativeVal * 1.15)}
                  </div>
                  <div style={{ fontSize: 13, color: '#7A6A45', marginTop: 8 }}>
                    Based on a {Math.max(3, i.pmult - 1).toFixed(1)}× multiple on your ${i.ebitda}K EBITDA.
                  </div>
                </div>

                <OutH>What ChiroPillar partnership can do for you</OutH>
                <Row lbl="Your current revenue (illustrative)" val={fmtMoney(ebitda$ * 4)} />
                <Row lbl="With ChiroPillar medical-team partnership" val={fmtMoney(ebitda$ * 4 * 5)} highlight />
                <Row lbl="Estimated additional take-home (year 1)" val="+$250,000" highlight gold />
                <Row lbl="Your role going forward" val="Same care · less burden · partner pay" />

                <div style={{ marginTop: 24, padding: 18, background: '#F7F4ED', borderRadius: 10, fontSize: 13, color: '#666', lineHeight: 1.6 }}>
                  <strong style={{ color: '#1F4E79' }}>Note:</strong> This is a planning estimate, not an offer. A full ChiroPillar valuation includes diagnostic billing potential, mobile medical team economics, patient retention upside, and Medicare reimbursement codes that aren&apos;t accessible to chiropractic-only clinics today.
                </div>
              </>
            ) : (
              // ── ADMIN VIEW · Full math ──────────────────────────────────────
              <>
                <OutH>Seller Payout · single ${i.ebitda}K-EBITDA office</OutH>
                <Row lbl="Enterprise value" val={fmtMoney(ev)} />
                <Row lbl="Cash at close" val={fmtMoney(cashClosePost) + (i.rollPct > 0 ? ` (after ${i.rollPct}% roll)` : '')} />
                <Row lbl="Seller note (principal)" val={fmtMoney(notePrincipal)} />
                <Row lbl="Note interest over hold" val={fmtMoney(noteInterest)} />
                <Row lbl={`${i.psharePct}% profit share × ${i.hold} yrs`} val={fmtMoney(pshareTotal)} />
                <Row lbl={`Rollover equity at exit (${i.rollPct}%)`} val={fmtMoney(rollGain)} emerald />
                <Row lbl="Total seller take" val={fmtMoney(sellerTotal)} total />
                <div style={{ fontSize: 11, color: '#888', fontFamily: "'JetBrains Mono', monospace", marginTop: 8 }}>
                  vs. stand-alone hold: {fmtMshort(standalone)} over {i.hold} yrs
                </div>

                <OutH style={{ marginTop: 32 }}>Platform Economics · {i.n} offices</OutH>
                <Row lbl="Aggregate acquired EBITDA" val={fmtMoney(aggEbitda)} />
                <Row lbl="Total purchase price" val={fmtMoney(totalPrice)} />
                <Row lbl="Post-uplift office EBITDA" val={fmtMoney(upliftAgg)} />
                <Row lbl="Less: MSO overhead" val={`(${fmtMoney(i.mso * 1000)})`} />
                <Row lbl="Platform normalized EBITDA" val={fmtMoney(platEbitda)} total />
                <Row lbl="Effective post-synergy multiple" val={`${postMult.toFixed(1)}×`} gold />

                <OutH style={{ marginTop: 32 }}>Exit Enterprise Value</OutH>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 12 }}>
                  <Scenario label="Conservative · 8×" val={fmtMshort(evLow)} moic={`${(evLow/totalPrice).toFixed(1)}× MOIC`} />
                  <Scenario label={`Base · ${i.emult}×`} val={fmtMshort(evBase)} moic={`${moicBase.toFixed(1)}× MOIC`} highlight />
                  <Scenario label="Premium · 10×" val={fmtMshort(evHigh)} moic={`${(evHigh/totalPrice).toFixed(1)}× MOIC`} />
                </div>

                <OutH style={{ marginTop: 32 }}>Equity Structure</OutH>
                <div style={{ background: 'rgba(31,78,121,0.04)', border: '1px dashed rgba(31,78,121,0.20)', borderRadius: 10, padding: 18, textAlign: 'center' }}>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.18em', color: '#2E75B6', textTransform: 'uppercase', fontWeight: 700, marginBottom: 8 }}>To be negotiated</div>
                  <div style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 15, color: '#555', lineHeight: 1.5 }}>
                    Final cap table to be set in definitive documentation between Dr. Wagner and Kingdom Broker.
                  </div>
                </div>
              </>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}

// ── Small components ────────────────────────────────────────────────────
function CtrlGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{
        fontFamily: "'JetBrains Mono', monospace", fontSize: 10,
        letterSpacing: '0.16em', textTransform: 'uppercase', color: '#2E75B6',
        marginBottom: 12, fontWeight: 700, paddingBottom: 6,
        borderBottom: '1px solid rgba(31,78,121,0.10)',
      }}>{label}</div>
      {children}
    </div>
  )
}

function Slider({ label, val, min, max, step, value, on }: { label: string; val: string; min: number; max: number; step: number; value: number; on: (v: number) => void }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
        <span style={{ fontSize: 13, color: '#333', fontWeight: 500 }}>{label}</span>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 700, color: '#1F4E79', background: 'white', padding: '3px 8px', borderRadius: 4, border: '1px solid rgba(31,78,121,0.15)' }}>{val}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={e => on(parseFloat(e.target.value))}
        style={{ width: '100%', height: 6, background: 'rgba(31,78,121,0.12)', borderRadius: 3, accentColor: '#2E75B6' }}/>
    </div>
  )
}

function OutH({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      fontFamily: 'Georgia, serif', fontSize: 19, fontWeight: 700, color: '#1F4E79',
      marginBottom: 14, display: 'flex', alignItems: 'center', gap: 12, ...style,
    }}>
      <span style={{ display: 'inline-block', width: 6, height: 20, background: '#C9A84C', borderRadius: 2 }} />
      {children}
    </div>
  )
}

function Row({ lbl, val, total, gold, emerald, highlight }: { lbl: string; val: string; total?: boolean; gold?: boolean; emerald?: boolean; highlight?: boolean }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
      padding: total ? '14px 0 4px' : '10px 0',
      borderTop: total ? '2px solid #1F4E79' : 'none',
      borderBottom: total ? 'none' : '1px dashed rgba(31,78,121,0.10)',
      fontSize: 14, marginTop: total ? 6 : 0,
      background: highlight ? 'rgba(201,168,76,0.08)' : 'transparent',
      paddingLeft: highlight ? 12 : 0, paddingRight: highlight ? 12 : 0,
      borderRadius: highlight ? 6 : 0,
    }}>
      <span style={{ color: total ? '#1F4E79' : '#555', fontWeight: total ? 600 : 400, fontSize: total ? 15 : 14 }}>{lbl}</span>
      <span style={{
        fontFamily: total ? "'Georgia', serif" : "'JetBrains Mono', monospace",
        fontWeight: total ? 700 : 600,
        color: gold ? '#C9A84C' : emerald ? '#2ECC8B' : total ? '#1F4E79' : '#1a1a1a',
        fontSize: total ? 18 : 14,
      }}>{val}</span>
    </div>
  )
}

function Scenario({ label, val, moic, highlight }: { label: string; val: string; moic: string; highlight?: boolean }) {
  return (
    <div style={{
      padding: '16px 14px', borderRadius: 10,
      background: highlight ? 'linear-gradient(180deg, #FFF7E0 0%, #FAF0D0 100%)' : '#F7F4ED',
      border: highlight ? '2px solid #C9A84C' : '1px solid rgba(31,78,121,0.10)',
      textAlign: 'center',
    }}>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, letterSpacing: '0.14em', color: highlight ? '#8B6914' : '#666', textTransform: 'uppercase', marginBottom: 6, fontWeight: 700 }}>{label}</div>
      <div style={{ fontFamily: 'Georgia, serif', fontSize: highlight ? 26 : 22, fontWeight: 700, color: highlight ? '#8B6914' : '#1F4E79', letterSpacing: '-0.02em', lineHeight: 1 }}>{val}</div>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: '#2E75B6', marginTop: 6, fontWeight: 600 }}>{moic}</div>
    </div>
  )
}
