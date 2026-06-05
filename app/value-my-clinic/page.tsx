'use client'

// ChiroPillar · "Value My Clinic" — the public, fun, KB-style valuation funnel
// Lives at /value-my-clinic (publicly accessible, no login required).
//
// Two paths:
//   1. Drop a P&L PDF → Claude reads it → instant valuation
//   2. Answer 3 quick questions → instant valuation
//
// Modeled after kingdombroker.com/valuation: progressive form, "Tap to
// discover" reveal mechanic, "While we calculate" engagement screen,
// gauged results with Conservative / Most Likely / Premium bands.

import { useState, useRef } from 'react'

// ── Brand palette ────────────────────────────────────────────────────────────
const C = {
  bg: '#0B1B3E',
  bg2: '#0F2347',
  bg3: '#152C58',
  paper: '#F7F4ED',
  text: '#F2EEE7',
  textInk: '#1F2A44',
  muted: '#9BA8C0',
  gold: '#C9A84C',
  goldLight: '#E8C96A',
  spine: '#1F4E79',
  align: '#2E75B6',
  green: '#2ECC8B',
  coral: '#F2B0A0',
  border: 'rgba(255,255,255,0.08)',
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

// ── Valuation logic · mirrors /intake + /dashboard/valuation ────────────────
type Profile = 'solo' | 'multi' | 'platform'
type OwnerRole = 'full_clinical' | 'mostly_clinical_some_management' | 'mostly_management' | 'wants_to_step_out'

function valuate(gross: number, role: OwnerRole, newPts: number) {
  let profile: Profile = 'solo'
  if (gross >= 3_000_000 && (role === 'mostly_management' || role === 'wants_to_step_out')) profile = 'platform'
  else if (role === 'mostly_management' || role === 'wants_to_step_out') profile = 'multi'

  let sdeMarginLow = 0.25, sdeMarginMid = 0.30, sdeMarginHigh = 0.40
  if (role === 'mostly_management') { sdeMarginLow = 0.28; sdeMarginMid = 0.35; sdeMarginHigh = 0.45 }
  if (role === 'wants_to_step_out') { sdeMarginLow = 0.30; sdeMarginMid = 0.38; sdeMarginHigh = 0.48 }

  const sdeMid = gross * sdeMarginMid
  const COMP_MEDIANS = { solo: 1.46, multi: 3.0, platform: 7.5 }
  const mult = COMP_MEDIANS[profile]
  const valLow  = gross * sdeMarginLow  * (mult * 0.74)
  const valMid  = sdeMid * mult
  const valHigh = gross * sdeMarginHigh * (mult * 1.40)

  const profileLabel = profile === 'solo' ? 'Solo-DC Owner-Operator'
                     : profile === 'multi' ? 'Multi-DC / Associate-in-Place'
                     : 'Platform / Multi-Location'

  // Wagner-style fit hint
  const fitSignal = newPts >= 40 ? 'strong' : newPts >= 20 ? 'moderate' : 'low'

  return { profile, profileLabel, mult, metric: profile === 'platform' ? 'EBITDA' : 'SDE', sdeMid, valLow, valMid, valHigh, fitSignal }
}

// ── Page ────────────────────────────────────────────────────────────────────
type Step = 'intro' | 'choose' | 'pdf-drop' | 'pdf-loading' | 'manual-1' | 'manual-2' | 'manual-3' | 'reveal' | 'calculating' | 'result'

export default function ValueMyClinicPage() {
  const [step, setStep] = useState<Step>('intro')
  const [gross, setGross] = useState('')
  const [newPts, setNewPts] = useState('')
  const [role, setRole] = useState<OwnerRole>('mostly_clinical_some_management')
  const [practiceName, setPracticeName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [calcStep, setCalcStep] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const grossNum = parseInt((gross || '').replace(/[^0-9]/g, ''), 10) || 0
  const newPtsNum = parseInt(newPts || '0', 10) || 0
  const result = grossNum > 0 ? valuate(grossNum, role, newPtsNum) : null

  // Animated "while we calculate" sequence
  const runCalculation = () => {
    setStep('calculating')
    setCalcStep(0)
    const steps = [600, 700, 800, 900, 1000]
    let cum = 0
    steps.forEach((delay, i) => {
      cum += delay
      setTimeout(() => setCalcStep(i + 1), cum)
    })
    setTimeout(() => setStep('result'), cum + 400)
  }

  // PDF upload handler
  const handlePdf = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    const file = files[0]
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setError('Only PDF files for now (CSV + Excel coming soon).')
      return
    }
    setError(null)
    setStep('pdf-loading')
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/extract-financials', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Extraction failed.')
        setStep('pdf-drop')
        return
      }
      const ex = data.extracted
      const recent = ex.years?.[0]
      if (recent?.revenue) {
        setGross(String(recent.revenue))
        if (ex.practice_name) setPracticeName(ex.practice_name)
        // Skip the manual flow — go straight to results
        runCalculation()
      } else {
        setError('Could not read revenue from that PDF. Try the manual entry path.')
        setStep('pdf-drop')
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      setError('Network error: ' + msg)
      setStep('pdf-drop')
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: C.paper, fontFamily: F.body, color: C.textInk }}>

      {/* TOP BAR */}
      <div style={{ background: '#FFFFFF', borderBottom: '1px solid rgba(31,78,121,0.10)', boxShadow: '0 2px 8px rgba(31,78,121,0.04)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '22px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
          <a href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }} aria-label="ChiroPillar">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/chiropillar-logo.png" alt="ChiroPillar" style={{ height: 'clamp(56px, 9vw, 88px)', width: 'auto', display: 'block' }} />
          </a>
          <div style={{ fontFamily: F.mono, fontSize: 11, letterSpacing: '0.20em', color: '#7A6A45', textTransform: 'uppercase', fontWeight: 800, padding: '6px 12px', background: 'rgba(201,168,76,0.10)', border: '1px solid rgba(201,168,76,0.30)', borderRadius: 999 }}>
            Free · 60-second valuation
          </div>
        </div>
      </div>

      {/* MAIN STAGE — switches on step */}
      <div style={{ maxWidth: 920, margin: '0 auto', padding: '48px 28px 80px' }}>

        {/* ───────────────── INTRO ───────────────── */}
        {step === 'intro' && (
          <div style={{ textAlign: 'center', animation: 'cp-fadeIn 0.5s ease' }}>
            <div style={{ fontFamily: F.mono, fontSize: 12, letterSpacing: '0.30em', color: C.spine, textTransform: 'uppercase', fontWeight: 800, marginBottom: 18 }}>
              ChiroPillar Valuation Engine
            </div>
            <h1 style={{ fontFamily: F.display, fontSize: 'clamp(40px, 6vw, 64px)', fontWeight: 700, color: C.spine, margin: '0 0 18px', letterSpacing: '-0.02em', lineHeight: 1.05 }}>
              How much is your <span style={{ color: C.gold, fontStyle: 'italic' }}>chiropractic practice</span> worth?
            </h1>
            <p style={{ fontSize: 19, color: '#3A4865', maxWidth: 620, margin: '0 auto 36px', lineHeight: 1.55 }}>
              Calibrated against <strong style={{ color: C.spine }}>~200 chiropractic transactions</strong>. Drop a P&L or answer 3 questions. Get a real valuation range in under a minute.
            </p>
            <button
              onClick={() => setStep('choose')}
              style={{
                padding: '18px 42px', fontSize: 17, fontWeight: 800, fontFamily: F.body,
                background: C.gold, color: C.bg, border: 'none', borderRadius: 12, cursor: 'pointer',
                letterSpacing: '0.02em', boxShadow: '0 8px 24px rgba(201,168,76,0.45)',
                transition: 'transform 0.12s',
              }}
              onMouseDown={(e) => (e.currentTarget.style.transform = 'translateY(1px)')}
              onMouseUp={(e) => (e.currentTarget.style.transform = '')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = '')}
            >
              Start my valuation →
            </button>

            {/* trust strip */}
            <div style={{ marginTop: 56, display: 'flex', gap: 36, justifyContent: 'center', flexWrap: 'wrap', fontSize: 13, color: '#5A6580' }}>
              <span>✓ No login required</span>
              <span>✓ Numbers stay private</span>
              <span>✓ Real comp data, not a guess</span>
            </div>
          </div>
        )}

        {/* ───────────────── CHOOSE PATH ───────────────── */}
        {step === 'choose' && (
          <div style={{ animation: 'cp-fadeIn 0.4s ease' }}>
            <h2 style={{ fontFamily: F.display, fontSize: 'clamp(28px, 4vw, 38px)', fontWeight: 700, color: C.spine, margin: '0 0 12px', textAlign: 'center', letterSpacing: '-0.01em' }}>
              How do you want to do this?
            </h2>
            <p style={{ textAlign: 'center', color: '#5A6580', fontSize: 15, marginBottom: 36 }}>
              Both paths use the same valuation engine.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18 }}>

              {/* Drop a P&L */}
              <button
                onClick={() => setStep('pdf-drop')}
                style={{
                  textAlign: 'left', padding: '28px 26px', background: '#FFFFFF',
                  border: `2px solid ${C.align}30`, borderRadius: 14, cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(31,78,121,0.06)', transition: 'all 0.18s',
                  fontFamily: F.body, color: C.textInk,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.align; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 30px rgba(31,78,121,0.12)' }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = `${C.align}30`; e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 16px rgba(31,78,121,0.06)' }}
              >
                <div style={{ fontSize: 38, marginBottom: 14 }}>📄</div>
                <div style={{ fontFamily: F.mono, fontSize: 10, letterSpacing: '0.18em', color: C.align, textTransform: 'uppercase', fontWeight: 800, marginBottom: 6 }}>Most accurate · 30 sec</div>
                <div style={{ fontFamily: F.display, fontSize: 24, fontWeight: 700, color: C.spine, marginBottom: 8, letterSpacing: '-0.01em' }}>Drop a P&L PDF</div>
                <div style={{ fontSize: 14, color: '#5A6580', lineHeight: 1.55 }}>
                  Tax return, P&L, or year-end statement. We&apos;ll extract revenue + EBITDA + add-backs automatically.
                </div>
              </button>

              {/* Answer questions */}
              <button
                onClick={() => setStep('manual-1')}
                style={{
                  textAlign: 'left', padding: '28px 26px', background: '#FFFFFF',
                  border: `2px solid ${C.gold}40`, borderRadius: 14, cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(201,168,76,0.06)', transition: 'all 0.18s',
                  fontFamily: F.body, color: C.textInk,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.gold; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 30px rgba(201,168,76,0.18)' }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = `${C.gold}40`; e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 16px rgba(201,168,76,0.06)' }}
              >
                <div style={{ fontSize: 38, marginBottom: 14 }}>✏️</div>
                <div style={{ fontFamily: F.mono, fontSize: 10, letterSpacing: '0.18em', color: C.gold, textTransform: 'uppercase', fontWeight: 800, marginBottom: 6 }}>Fast · 60 sec</div>
                <div style={{ fontFamily: F.display, fontSize: 24, fontWeight: 700, color: C.spine, marginBottom: 8, letterSpacing: '-0.01em' }}>Answer 3 questions</div>
                <div style={{ fontSize: 14, color: '#5A6580', lineHeight: 1.55 }}>
                  Revenue, new patients, your role at the clinic. Range will be slightly wider but still useful.
                </div>
              </button>
            </div>

            <div style={{ textAlign: 'center', marginTop: 28 }}>
              <button onClick={() => setStep('intro')} style={{ background: 'transparent', border: 'none', color: '#7A859C', fontSize: 14, fontFamily: F.body, cursor: 'pointer', textDecoration: 'underline' }}>← back</button>
            </div>
          </div>
        )}

        {/* ───────────────── PDF DROP ───────────────── */}
        {step === 'pdf-drop' && (
          <div style={{ animation: 'cp-fadeIn 0.4s ease' }}>
            <h2 style={{ fontFamily: F.display, fontSize: 'clamp(28px, 4vw, 38px)', fontWeight: 700, color: C.spine, margin: '0 0 12px', textAlign: 'center', letterSpacing: '-0.01em' }}>
              Drop your P&L PDF.
            </h2>
            <p style={{ textAlign: 'center', color: '#5A6580', fontSize: 15, marginBottom: 28 }}>
              We&apos;ll read it with Claude AI and price it against ~200 chiropractic deals.
            </p>

            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); handlePdf(e.dataTransfer.files) }}
              onClick={() => fileInputRef.current?.click()}
              style={{
                background: '#FFFFFF',
                border: `3px dashed ${C.align}60`,
                borderRadius: 18, padding: '60px 40px',
                textAlign: 'center', cursor: 'pointer',
                transition: 'all 0.18s',
                boxShadow: '0 4px 20px rgba(31,78,121,0.06)',
              }}
            >
              <div style={{ fontSize: 56, marginBottom: 14 }}>📂</div>
              <div style={{ fontFamily: F.display, fontSize: 26, fontWeight: 700, color: C.spine, marginBottom: 10, letterSpacing: '-0.01em' }}>
                Drop a PDF here · or click to browse
              </div>
              <div style={{ fontSize: 14, color: '#5A6580', maxWidth: 460, margin: '0 auto', lineHeight: 1.55 }}>
                Tax returns (1040 / 1120-S / 1065), P&L statements, year-end financial summaries — all welcome.
              </div>
              <input ref={fileInputRef} type="file" accept=".pdf" onChange={(e) => handlePdf(e.target.files)} style={{ display: 'none' }} />
            </div>

            {error && (
              <div style={{ marginTop: 16, padding: '12px 16px', background: 'rgba(231,76,60,0.10)', border: '1px solid rgba(231,76,60,0.40)', borderRadius: 8, fontSize: 13, color: '#C0392B', textAlign: 'center' }}>
                {error}
              </div>
            )}

            <div style={{ textAlign: 'center', marginTop: 28 }}>
              <button onClick={() => setStep('choose')} style={{ background: 'transparent', border: 'none', color: '#7A859C', fontSize: 14, fontFamily: F.body, cursor: 'pointer', textDecoration: 'underline' }}>← back · use 3 questions instead</button>
            </div>
          </div>
        )}

        {/* ───────────────── PDF LOADING ───────────────── */}
        {step === 'pdf-loading' && (
          <CalculatingStage subtitle="Claude is reading your PDF…" steps={[
            'Detecting document type',
            'Extracting revenue + COGS + EBITDA',
            'Estimating owner compensation',
            'Flagging potential add-backs',
            'Building your valuation report',
          ]} stepIdx={4} />
        )}

        {/* ───────────────── MANUAL · STEP 1 (Revenue) ───────────────── */}
        {step === 'manual-1' && (
          <ManualStep
            num={1}
            label="Annual revenue"
            title="What was last year's gross revenue?"
            sub="Total collections (not bookings). Round to the nearest $10K is fine."
          >
            <input
              autoFocus
              type="text"
              placeholder="$1,200,000"
              value={gross}
              onChange={(e) => setGross(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && grossNum > 0) setStep('manual-2') }}
              style={inputStyle}
            />
            <NavRow
              onBack={() => setStep('choose')}
              onNext={() => setStep('manual-2')}
              nextDisabled={grossNum < 100_000}
              nextLabel="Next →"
            />
          </ManualStep>
        )}

        {/* ───────────────── MANUAL · STEP 2 (New patients) ───────────────── */}
        {step === 'manual-2' && (
          <ManualStep
            num={2}
            label="Patient flow"
            title="Roughly how many new patients per month?"
            sub="2-year average. This drives demand-side value."
          >
            <input
              autoFocus
              type="number"
              min={0}
              placeholder="40"
              value={newPts}
              onChange={(e) => setNewPts(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && newPtsNum > 0) setStep('manual-3') }}
              style={inputStyle}
            />
            <NavRow
              onBack={() => setStep('manual-1')}
              onNext={() => setStep('manual-3')}
              nextDisabled={newPtsNum <= 0}
              nextLabel="Next →"
            />
          </ManualStep>
        )}

        {/* ───────────────── MANUAL · STEP 3 (Owner role) ───────────────── */}
        {step === 'manual-3' && (
          <ManualStep
            num={3}
            label="The owner's role"
            title="What's your role at the clinic today?"
            sub="This affects the multiple — buyers pay more for a clinic that runs without you."
          >
            <div style={{ display: 'grid', gap: 10 }}>
              {([
                ['full_clinical',                       'Full clinical — I see all the patients',         '1.46× SDE typical'],
                ['mostly_clinical_some_management',     'Mostly clinical, some management',               '1.46× SDE typical'],
                ['mostly_management',                   'Mostly management — associates do the patients', '3.0× SDE typical'],
                ['wants_to_step_out',                   'I want to step out completely',                   '3.0× SDE typical · platform-fit candidate'],
              ] as Array<[OwnerRole, string, string]>).map(([val, txt, mult]) => (
                <button
                  key={val}
                  onClick={() => { setRole(val); setStep('reveal') }}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
                    padding: '16px 20px', background: '#FFFFFF',
                    border: `2px solid ${role === val ? C.gold : '#E5DECC'}`,
                    borderRadius: 10, cursor: 'pointer', textAlign: 'left',
                    transition: 'all 0.15s', fontFamily: F.body,
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.gold; e.currentTarget.style.background = '#FFFBF0' }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = role === val ? C.gold : '#E5DECC'; e.currentTarget.style.background = '#FFFFFF' }}
                >
                  <div style={{ fontSize: 15, fontWeight: 600, color: C.spine }}>{txt}</div>
                  <div style={{ fontFamily: F.mono, fontSize: 10, letterSpacing: '0.10em', color: C.gold, fontWeight: 700, whiteSpace: 'nowrap' }}>{mult}</div>
                </button>
              ))}
            </div>
            <NavRow onBack={() => setStep('manual-2')} onNext={() => setStep('reveal')} nextDisabled={false} nextLabel="See valuation →" />
          </ManualStep>
        )}

        {/* ───────────────── REVEAL ("Tap to discover") ───────────────── */}
        {step === 'reveal' && result && (
          <div style={{ textAlign: 'center', animation: 'cp-fadeIn 0.4s ease' }}>
            <div style={{ fontFamily: F.mono, fontSize: 12, letterSpacing: '0.30em', color: C.spine, textTransform: 'uppercase', fontWeight: 800, marginBottom: 18 }}>
              ✓ All set
            </div>
            <h2 style={{ fontFamily: F.display, fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 700, color: C.spine, margin: '0 0 16px', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
              We have everything we need.
            </h2>
            <p style={{ fontSize: 18, color: '#3A4865', maxWidth: 560, margin: '0 auto 36px', lineHeight: 1.55 }}>
              <strong style={{ color: C.spine }}>{result.profileLabel}</strong> · pricing against {result.profile === 'platform' ? 'platform' : result.profile === 'multi' ? 'multi-DC' : 'solo-DC'} comp medians from ~200 chiropractic deals.
            </p>
            <button
              onClick={runCalculation}
              style={{
                padding: '20px 50px', fontSize: 18, fontWeight: 800, fontFamily: F.body,
                background: C.gold, color: C.bg, border: 'none', borderRadius: 14, cursor: 'pointer',
                letterSpacing: '0.02em', boxShadow: '0 10px 30px rgba(201,168,76,0.50)',
                animation: 'cp-pulse 2.2s ease infinite',
              }}
            >
              Tap to discover what your clinic is worth
            </button>
          </div>
        )}

        {/* ───────────────── CALCULATING ───────────────── */}
        {step === 'calculating' && (
          <CalculatingStage
            subtitle="While we calculate — imagine this:"
            quote="The first thing buyers ask is: 'Could the clinic run a year without the owner here?' That single question moves a clinic from 1.5× to 3× revenue overnight."
            steps={[
              'Identifying your practice profile',
              'Calculating normalized SDE',
              'Applying chiropractic comp medians',
              'Building Conservative / Most Likely / Premium bands',
              'Pricing the Wagner-style deal structure',
            ]}
            stepIdx={calcStep}
          />
        )}

        {/* ───────────────── RESULT ───────────────── */}
        {step === 'result' && result && (
          <div style={{ animation: 'cp-fadeIn 0.5s ease' }}>

            {/* Top banner */}
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <div style={{ fontFamily: F.mono, fontSize: 12, letterSpacing: '0.30em', color: C.gold, textTransform: 'uppercase', fontWeight: 800, marginBottom: 12 }}>
                Your valuation · ChiroPillar Estimate
              </div>
              <h1 style={{ fontFamily: F.display, fontSize: 'clamp(32px, 5vw, 46px)', fontWeight: 700, color: C.spine, margin: '0 0 8px', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                {practiceName ? practiceName : 'Your chiropractic practice'}
              </h1>
              <div style={{ fontSize: 14, color: '#5A6580' }}>{result.profileLabel} · {result.mult}× {result.metric}</div>
            </div>

            {/* MAIN VALUATION CARD */}
            <div style={{
              background: `linear-gradient(135deg, ${C.bg} 0%, ${C.bg2} 100%)`,
              borderRadius: 18, padding: 'clamp(28px, 4vw, 44px)', marginBottom: 24,
              boxShadow: '0 16px 50px rgba(11,27,62,0.30)', color: C.text,
            }}>
              <div style={{ fontFamily: F.mono, fontSize: 11, letterSpacing: '0.18em', color: C.gold, textTransform: 'uppercase', fontWeight: 800, marginBottom: 20, textAlign: 'center' }}>
                ★ Estimated Valuation Range
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
                <Pillar label="Conservative" val={fmtMoney(result.valLow)} sub="P25 of comps" color={C.coral} />
                <Pillar label="Most Likely" val={fmtMoney(result.valMid)} sub={`${result.mult}× ${result.metric}`} color={C.gold} big />
                <Pillar label="Premium" val={fmtMoney(result.valHigh)} sub="P75 of comps" color={C.green} />
              </div>

              {/* Gauge bar */}
              <div style={{ position: 'relative', height: 14, background: 'rgba(255,255,255,0.10)', borderRadius: 7, marginBottom: 14, overflow: 'hidden' }}>
                <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(90deg, ${C.coral}, ${C.gold}, ${C.green})`, borderRadius: 7 }} />
                <div style={{ position: 'absolute', left: '50%', top: -3, bottom: -3, width: 3, background: '#FFFFFF', boxShadow: '0 0 12px rgba(255,255,255,0.9)' }} />
              </div>

              <div style={{ marginTop: 18, padding: '14px 18px', background: 'rgba(201,168,76,0.10)', border: '1px solid rgba(201,168,76,0.30)', borderRadius: 10, fontSize: 13.5, color: C.text, lineHeight: 1.6 }}>
                <strong style={{ color: C.gold }}>Calibrated against ~200 chiropractic transactions.</strong> Sources: BizBuySell, Progressive Practice Sales, William David Co, JYNT 10-K. Asking-price-derived — closings typically land at 85-95% of FMV.
              </div>
            </div>

            {/* KPI strip */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 24, background: '#FFFFFF', borderRadius: 12, padding: '20px 22px', boxShadow: '0 2px 12px rgba(31,78,121,0.06)' }}>
              <KpiBlock label="Revenue" val={fmtMoney(grossNum)} color={C.spine} />
              <KpiBlock label="Est. SDE" val={fmtMoney(result.sdeMid)} color={C.align} />
              <KpiBlock label="Multiple" val={`${result.mult}×`} color={C.gold} />
              {newPtsNum > 0 && <KpiBlock label="New pts/mo" val={String(newPtsNum)} color={C.green} sub={result.fitSignal === 'strong' ? '✓ Strong' : result.fitSignal === 'moderate' ? 'Moderate' : 'Below floor'} />}
            </div>

            {/* What would make it worth more */}
            <div style={{ background: '#FFFFFF', borderRadius: 14, padding: '26px 28px', marginBottom: 22, boxShadow: '0 2px 12px rgba(31,78,121,0.06)' }}>
              <div style={{ fontFamily: F.mono, fontSize: 11, letterSpacing: '0.16em', color: C.spine, textTransform: 'uppercase', fontWeight: 800, marginBottom: 12 }}>
                Want this number higher?
              </div>
              <h3 style={{ fontFamily: F.display, fontSize: 22, fontWeight: 700, color: C.spine, margin: '0 0 14px', letterSpacing: '-0.01em' }}>
                Three levers move it the most.
              </h3>
              <ul style={{ margin: 0, paddingLeft: 22, fontSize: 14.5, color: '#3A4865', lineHeight: 1.7 }}>
                <li><strong style={{ color: C.spine }}>Step out of full-clinical.</strong> Adding an associate DC bumps the multiple from ~1.5× to ~3× — that&apos;s often the difference between $1M and $2M.</li>
                <li><strong style={{ color: C.spine }}>Document 40+ new patients/month sustained.</strong> Buyers discount aggressively when patient flow looks like a recent spike instead of a 24-month baseline.</li>
                <li><strong style={{ color: C.spine }}>Add a medical-team revenue stream.</strong> Wagner&apos;s install playbook adds ~$250K of EBITDA in Year 1 — that&apos;s another ~$750K of valuation at 3×.</li>
              </ul>
            </div>

            {/* CTA */}
            <div style={{
              background: `linear-gradient(135deg, ${C.gold}, ${C.goldLight})`,
              borderRadius: 14, padding: '28px 32px', textAlign: 'center', color: C.bg,
              boxShadow: '0 10px 30px rgba(201,168,76,0.30)',
            }}>
              <div style={{ fontFamily: F.mono, fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 800, marginBottom: 8 }}>
                Want a real conversation?
              </div>
              <h3 style={{ fontFamily: F.display, fontSize: 26, fontWeight: 700, margin: '0 0 12px', letterSpacing: '-0.01em', lineHeight: 1.2 }}>
                Talk to Dr. Wagner about the ChiroPillar partnership.
              </h3>
              <p style={{ fontSize: 15, margin: '0 0 18px', maxWidth: 540, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.55, opacity: 0.88 }}>
                If your numbers look like Wagner&apos;s target profile, we&apos;ll walk through what a partnership would actually look like — including the medical-team add-on.
              </p>
              <a
                href="/intake"
                style={{
                  display: 'inline-block', padding: '14px 32px',
                  background: C.bg, color: C.gold, fontWeight: 800, fontSize: 15,
                  textDecoration: 'none', borderRadius: 10, letterSpacing: '0.03em',
                  boxShadow: '0 4px 14px rgba(11,27,62,0.30)',
                }}
              >
                Apply for the partnership →
              </a>
            </div>

            <div style={{ textAlign: 'center', marginTop: 30 }}>
              <button
                onClick={() => { setStep('intro'); setGross(''); setNewPts(''); setRole('mostly_clinical_some_management'); setPracticeName(''); setError(null) }}
                style={{ background: 'transparent', border: 'none', color: '#7A859C', fontSize: 14, fontFamily: F.body, cursor: 'pointer', textDecoration: 'underline' }}
              >
                Run another valuation
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes cp-fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes cp-pulse  { 0%,100% { transform: scale(1); } 50% { transform: scale(1.025); } }
        @keyframes cp-spin   { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}

// ── Reusable subcomponents ──────────────────────────────────────────────────
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '18px 22px', fontSize: 22, fontFamily: F.display, fontWeight: 700,
  background: '#FFFFFF', border: '2px solid #E5DECC', borderRadius: 12, color: C.spine,
  outline: 'none', boxShadow: '0 2px 10px rgba(31,78,121,0.05)',
}

function ManualStep({ num, label, title, sub, children }: { num: number; label: string; title: string; sub: string; children: React.ReactNode }) {
  return (
    <div style={{ animation: 'cp-fadeIn 0.35s ease' }}>
      {/* Progress dots */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 28 }}>
        {[1, 2, 3].map(i => (
          <div key={i} style={{ width: 32, height: 4, borderRadius: 2, background: i <= num ? C.gold : '#E5DECC' }} />
        ))}
      </div>
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{ fontFamily: F.mono, fontSize: 11, letterSpacing: '0.22em', color: C.gold, textTransform: 'uppercase', fontWeight: 800, marginBottom: 10 }}>
          Step {num} of 3 · {label}
        </div>
        <h2 style={{ fontFamily: F.display, fontSize: 'clamp(28px, 4vw, 38px)', fontWeight: 700, color: C.spine, margin: '0 0 10px', letterSpacing: '-0.02em', lineHeight: 1.15 }}>
          {title}
        </h2>
        <p style={{ fontSize: 15, color: '#5A6580', maxWidth: 480, margin: '0 auto', lineHeight: 1.55 }}>{sub}</p>
      </div>
      <div style={{ maxWidth: 560, margin: '0 auto' }}>{children}</div>
    </div>
  )
}

function NavRow({ onBack, onNext, nextDisabled, nextLabel }: { onBack: () => void; onNext: () => void; nextDisabled: boolean; nextLabel: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 24 }}>
      <button onClick={onBack} style={{ background: 'transparent', border: 'none', color: '#7A859C', fontSize: 14, fontFamily: F.body, cursor: 'pointer', textDecoration: 'underline' }}>
        ← back
      </button>
      <button
        onClick={onNext}
        disabled={nextDisabled}
        style={{
          padding: '13px 28px', fontSize: 15, fontWeight: 800, fontFamily: F.body,
          background: nextDisabled ? '#D1CCB8' : C.gold, color: C.bg, border: 'none', borderRadius: 10,
          cursor: nextDisabled ? 'not-allowed' : 'pointer', letterSpacing: '0.02em',
          boxShadow: nextDisabled ? 'none' : '0 6px 18px rgba(201,168,76,0.40)',
        }}
      >
        {nextLabel}
      </button>
    </div>
  )
}

function CalculatingStage({ subtitle, steps, stepIdx, quote }: { subtitle: string; steps: string[]; stepIdx: number; quote?: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '32px 0', animation: 'cp-fadeIn 0.4s ease' }}>
      <div style={{
        width: 80, height: 80, margin: '0 auto 28px',
        border: '5px solid rgba(201,168,76,0.20)', borderTopColor: C.gold,
        borderRadius: '50%', animation: 'cp-spin 0.9s linear infinite',
      }} />
      <h2 style={{ fontFamily: F.display, fontSize: 'clamp(24px, 3.5vw, 32px)', fontWeight: 700, color: C.spine, margin: '0 0 12px', letterSpacing: '-0.01em' }}>
        {subtitle}
      </h2>
      {quote && (
        <blockquote style={{ maxWidth: 520, margin: '0 auto 26px', padding: '16px 22px', borderLeft: `3px solid ${C.gold}`, fontStyle: 'italic', fontSize: 16, color: '#3A4865', textAlign: 'left', lineHeight: 1.55, background: '#FFFFFF', borderRadius: '0 10px 10px 0', boxShadow: '0 2px 10px rgba(31,78,121,0.05)' }}>
          {quote}
        </blockquote>
      )}
      <div style={{ maxWidth: 460, margin: '0 auto', textAlign: 'left' }}>
        {steps.map((s, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', marginBottom: 6,
            background: i < stepIdx ? 'rgba(46,204,139,0.10)' : '#FFFFFF',
            border: `1px solid ${i < stepIdx ? 'rgba(46,204,139,0.30)' : '#E5DECC'}`,
            borderRadius: 8, transition: 'all 0.25s',
          }}>
            <span style={{ width: 22, height: 22, borderRadius: '50%', background: i < stepIdx ? C.green : '#E5DECC', color: i < stepIdx ? '#FFFFFF' : '#7A859C', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800 }}>
              {i < stepIdx ? '✓' : i + 1}
            </span>
            <span style={{ fontSize: 14, color: i < stepIdx ? '#1F4E79' : '#5A6580', fontWeight: i < stepIdx ? 600 : 500 }}>{s}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function Pillar({ label, val, sub, color, big }: { label: string; val: string; sub: string; color: string; big?: boolean }) {
  return (
    <div style={{
      padding: big ? '22px 18px' : '18px 14px', textAlign: 'center', borderRadius: 12,
      background: big ? 'rgba(255,255,255,0.06)' : 'transparent',
      border: big ? `1px solid ${color}50` : '1px solid transparent',
    }}>
      <div style={{ fontFamily: F.mono, fontSize: 10, letterSpacing: '0.14em', color: color, textTransform: 'uppercase', fontWeight: 800, marginBottom: 8 }}>
        {label}
      </div>
      <div style={{ fontFamily: F.display, fontSize: big ? 'clamp(28px, 4vw, 38px)' : 'clamp(20px, 3vw, 26px)', fontWeight: 800, color: color, lineHeight: 1.1, marginBottom: 6, letterSpacing: '-0.01em' }}>
        {val}
      </div>
      <div style={{ fontSize: 11, color: 'rgba(242,238,231,0.65)', fontFamily: F.mono, letterSpacing: '0.06em' }}>{sub}</div>
    </div>
  )
}

function KpiBlock({ label, val, sub, color }: { label: string; val: string; sub?: string; color: string }) {
  return (
    <div>
      <div style={{ fontFamily: F.mono, fontSize: 10, letterSpacing: '0.14em', color: '#7A859C', textTransform: 'uppercase', fontWeight: 700, marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontFamily: F.display, fontSize: 24, fontWeight: 800, color, lineHeight: 1.1, marginBottom: sub ? 4 : 0 }}>
        {val}
      </div>
      {sub && <div style={{ fontSize: 11.5, color: '#7A859C', fontWeight: 600 }}>{sub}</div>}
    </div>
  )
}
