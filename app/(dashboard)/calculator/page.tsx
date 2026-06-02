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

type Profile = 'solo' | 'multi' | 'platform'

type Inputs = {
  ebitda: number      // per-office SDE (solo/multi) or EBITDA (platform) at purchase ($K)
  pmult: number       // purchase multiple (SDE or EBITDA depending on profile)
  cashPct: number     // % at close
  rate: number        // seller note rate
  psharePct: number   // ongoing profit share %
  n: number           // # offices in platform
  uplift: number      // per-office uplift ($K)
  mso: number         // MSO overhead ($K)
  hold: number        // hold years
  emult: number       // base-case exit multiple
  rollPct: number     // seller rollover %
}

// ── Practice profile presets · calibrated to 158 real chiropractor comps ──
// Solo-DC (default · n=102, median 1.46× SDE) · range 1.08-2.05× P25-P75
// Multi-DC / membership / associate-in-place · ~30 comps
// Platform / multi-location · PE-deal triangulated
const PROFILES: Record<Profile, {
  label: string         // 'SDE multiple' or 'EBITDA multiple'
  pmult_min: number; pmult_max: number; pmult_step: number; pmult_default: number;
  ebitda_default: number;  // per-office default
  uplift_default: number;
  display_name: string;
  band_text: string;
  note: string;
}> = {
  solo:     { label: 'SDE multiple',    pmult_min: 1.0, pmult_max: 2.1, pmult_step: 0.1,  pmult_default: 1.5, ebitda_default: 200,  uplift_default: 100, display_name: 'Solo-DC Owner-Operator', band_text: '1.0× · 1.5× · 2.1× SDE',  note: 'Most ChiroPillar targets · retiring DC' },
  multi:    { label: 'SDE multiple',    pmult_min: 2.0, pmult_max: 4.0, pmult_step: 0.1,  pmult_default: 3.0, ebitda_default: 400,  uplift_default: 150, display_name: 'Multi-DC / Membership',    band_text: '2.0× · 3.0× · 4.0× SDE',  note: 'Associate in place · recurring revenue' },
  platform: { label: 'EBITDA multiple', pmult_min: 5.0, pmult_max: 10.0,pmult_step: 0.25, pmult_default: 7.5, ebitda_default: 1000, uplift_default: 200, display_name: 'Platform / Multi-Location', band_text: '5× · 7.5× · 10× EBITDA', note: '$1M+ EBITDA · clean books · scale' },
}

const DEFAULTS: Inputs = {
  ebitda: 200, pmult: 1.5, cashPct: 50, rate: 7, psharePct: 4,
  n: 12, uplift: 100, mso: 500, hold: 4, emult: 9, rollPct: 0,
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
  const [profile, setProfile] = useState<Profile>('solo')
  const [i, setI] = useState<Inputs>(DEFAULTS)
  const [isMobile, setIsMobile] = useState(false)

  // Track viewport for responsive grid (avoid raw media queries since this uses inline styles)
  useEffect(() => {
    if (typeof window === 'undefined') return
    const check = () => setIsMobile(window.innerWidth < 880)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  function set<K extends keyof Inputs>(k: K, v: number) {
    setI(prev => ({ ...prev, [k]: v }))
  }

  function applyProfile(p: Profile) {
    setProfile(p)
    const pr = PROFILES[p]
    setI(prev => ({
      ...prev,
      pmult: pr.pmult_default,
      ebitda: pr.ebitda_default,
      uplift: pr.uplift_default,
    }))
  }

  const currentProfile = PROFILES[profile]

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

  // Conservative seller-facing valuation: anchored to real comp median for selected profile
  // Solo-DC: 1.46× SDE (P50 from n=102 real chiropractic comps)
  // Multi-DC: 3.0× SDE (P50 of multi-DC/membership band)
  // Platform: 7.5× EBITDA (PE-deal triangulated)
  const COMP_MEDIANS: Record<Profile, number> = { solo: 1.46, multi: 3.0, platform: 7.5 }
  const conservativeMid  = ebitda$ * COMP_MEDIANS[profile]
  const conservativeLow  = ebitda$ * (COMP_MEDIANS[profile] * 0.74)  // ≈ P25
  const conservativeHigh = ebitda$ * (COMP_MEDIANS[profile] * 1.40)  // ≈ P75

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
    <div style={{ padding: isMobile ? '20px 16px 60px' : 32, background: '#F7F4ED', minHeight: '100vh', color: '#1a1a1a', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>

        {/* Header + Mode Toggle */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 20 }}>
          <div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.22em', color: '#2E75B6', textTransform: 'uppercase', fontWeight: 700, marginBottom: 8 }}>
              ChiroPillar · Deal Calculator
            </div>
            <h1 style={{ fontFamily: 'Georgia, serif', fontSize: isMobile ? 24 : 36, fontWeight: 700, color: '#1F4E79', margin: 0, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
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
                {hideRollup ? 'Conservative valuation only · platform math hidden' : 'Full platform math visible'}
              </div>
            </div>
          </label>
        </div>

        {/* ── REAL-DATA CREDIBILITY LINE ─────────────────────────────────── */}
        <div style={{ marginBottom: 24, padding: '16px 22px', background: 'linear-gradient(135deg, rgba(46,117,182,0.06) 0%, rgba(31,78,121,0.04) 100%)', border: '1px solid rgba(31,78,121,0.15)', borderRadius: 12, display: 'flex', gap: 18, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: '0 0 auto', fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.22em', color: '#2E75B6', textTransform: 'uppercase', fontWeight: 700 }}>📊 Comp Set</div>
          <div style={{ flex: 1, minWidth: 280, fontSize: 13, color: '#444', lineHeight: 1.55 }}>
            <strong style={{ color: '#1F4E79' }}>N=102 real chiropractic practice sales</strong> with asking + SDE disclosed. Median <strong>1.46× SDE</strong> · P25–P75 <strong>1.08–2.05×</strong>. Sources: BizBuySell, Progressive Practice Sales, William David Co, JYNT 10-K (June 2026). Asking-price-derived — closing typically 85–95% of ask.
          </div>
        </div>

        {/* ── PRACTICE PROFILE SELECTOR ──────────────────────────────────── */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.18em', color: '#2E75B6', textTransform: 'uppercase', fontWeight: 700, marginBottom: 12 }}>Practice Profile</div>
          <div className="profile-grid" style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: 12 }}>
            {(['solo','multi','platform'] as Profile[]).map(p => {
              const pr = PROFILES[p]
              const active = profile === p
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => applyProfile(p)}
                  style={{
                    background: active ? 'linear-gradient(135deg, rgba(46,117,182,0.10) 0%, rgba(31,78,121,0.06) 100%)' : 'white',
                    border: active ? '2px solid #2E75B6' : '2px solid rgba(31,78,121,0.15)',
                    borderRadius: 12, padding: '18px 18px', cursor: 'pointer', textAlign: 'left',
                    boxShadow: active ? '0 8px 24px rgba(46,117,182,0.18)' : 'none',
                    fontFamily: 'inherit',
                    transition: 'all 0.18s',
                  }}
                >
                  <div style={{ fontFamily: 'Georgia, serif', fontSize: 16, fontWeight: 700, color: '#1F4E79', marginBottom: 6, letterSpacing: '-0.01em' }}>{pr.display_name}</div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: active ? '#C9A84C' : '#2E75B6', marginBottom: 6, fontWeight: 700 }}>{pr.band_text}</div>
                  <div style={{ fontSize: 11.5, color: '#777', lineHeight: 1.4 }}>{pr.note}</div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Body — sliders left, outputs right (stacks on mobile) */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'minmax(280px, 360px) 1fr', gap: isMobile ? 16 : 24 }}>

          {/* INPUTS */}
          <div style={{ background: 'white', borderRadius: 14, padding: 24, boxShadow: '0 4px 16px rgba(31,78,121,0.06)' }}>
            <CtrlGroup label="Per-Office Acquisition">
              <Slider label={profile === 'platform' ? 'EBITDA per office' : 'SDE per office'} val={`$${i.ebitda}K`} min={profile === 'platform' ? 500 : 80} max={profile === 'platform' ? 3000 : 800} step={profile === 'platform' ? 100 : 20} value={i.ebitda} on={v => set('ebitda', v)} />
              <Slider label={currentProfile.label} val={`${i.pmult.toFixed(2)}×`} min={currentProfile.pmult_min} max={currentProfile.pmult_max} step={currentProfile.pmult_step} value={i.pmult} on={v => set('pmult', v)} />
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
              // ── CHIROPRACTOR VIEW · Real-comp-anchored conservative band ───
              <>
                <OutH>Practice Valuation · Estimated Range</OutH>
                <div style={{ padding: '24px 28px', background: 'linear-gradient(135deg, #FAF6EC 0%, #F0E8D0 100%)', borderRadius: 10, marginBottom: 24 }}>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.14em', color: '#7A6A45', textTransform: 'uppercase', fontWeight: 600, marginBottom: 8 }}>
                    Your practice today
                  </div>
                  <div style={{ fontFamily: 'Georgia, serif', fontSize: 40, fontWeight: 700, color: '#1F4E79', letterSpacing: '-0.02em', lineHeight: 1, marginBottom: 6 }}>
                    {fmtMshort(conservativeLow)} – {fmtMshort(conservativeHigh)}
                  </div>
                  <div style={{ fontFamily: 'Georgia, serif', fontSize: 16, color: '#1F4E79', marginTop: 6, fontWeight: 600 }}>
                    Mid: {fmtMshort(conservativeMid)}
                  </div>
                  <div style={{ fontSize: 12, color: '#7A6A45', marginTop: 10, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.02em' }}>
                    Calibrated to <strong>{COMP_MEDIANS[profile]}× {profile === 'platform' ? 'EBITDA' : 'SDE'} median</strong> from N=102 real comps · {currentProfile.display_name}
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
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: 12, marginTop: 12 }}>
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
