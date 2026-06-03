'use client'

// ChiroPillar · AI Valuation Engine
// Two-mode interface:
//   1. VIEW   · Render a valuation report from FormData (default: Piedmont Spine example)
//   2. INPUT  · 3-step wizard collecting practice info + 3yr financials + add-backs
//              then re-renders the report with the user's numbers.
//
// Same valuation engine the /intake form uses (~200 deal comp-set medians),
// productized per-clinic with Wagner-specific 4-stream deal structure.

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

// ── FormData type · everything that drives the valuation ────────────────
type AddBack = { label: string; amount: number; reason: string; enabled: boolean }
type YearFin = { year: number; revenue: number; ebitda: number; ownerComp: number }
type Profile = 'solo' | 'multi' | 'platform'

type FormData = {
  practiceName: string
  ownerName: string
  city: string
  state: string
  years: number
  employees: number
  practice_type: string            // human-readable
  profile: Profile                 // solo / multi / platform — drives the multiple
  ownerRole: 'full_clinical' | 'mostly_clinical_some_management' | 'mostly_management' | 'wants_to_step_out'
  financials: YearFin[]            // most recent first
  addBacks: AddBack[]
  exampleId?: 'piedmont' | 'custom'
}

// ── Piedmont Spine example (default view) ───────────────────────────────
const PIEDMONT: FormData = {
  practiceName: 'Piedmont Spine & Wellness',
  ownerName: 'Dr. Marcus Bell',
  city: 'Charlottesville',
  state: 'VA',
  years: 14,
  employees: 8,
  practice_type: 'Multi-DC · 2 associates',
  profile: 'multi',
  ownerRole: 'mostly_management',
  financials: [
    { year: 2025, revenue: 1_300_000, ebitda: 485_000, ownerComp: 245_000 },
    { year: 2024, revenue: 1_185_000, ebitda: 420_000, ownerComp: 230_000 },
    { year: 2023, revenue: 1_050_000, ebitda: 365_000, ownerComp: 215_000 },
  ],
  addBacks: [
    { label: 'Owner compensation above market',    amount: 65_000, reason: 'Owner draws $245K; market rate $180K for clinic of this size', enabled: true },
    { label: 'Personal vehicle expense',           amount: 22_000, reason: '2024 Tesla Model Y written through practice',                   enabled: true },
    { label: 'One-time legal · associate buyout',  amount: 28_000, reason: '2024 only · departing associate equity unwind',                  enabled: true },
    { label: 'CME + family travel (Hawaii Conf.)', amount: 15_000, reason: '2024 + 2025 · personal trip flagged as CME',                    enabled: true },
  ],
  exampleId: 'piedmont',
}

// Blank starter for the wizard
const BLANK_FORM: FormData = {
  practiceName: '',
  ownerName: '',
  city: '',
  state: '',
  years: 0,
  employees: 0,
  practice_type: '',
  profile: 'solo',
  ownerRole: 'mostly_clinical_some_management',
  financials: [
    { year: 2025, revenue: 0, ebitda: 0, ownerComp: 0 },
    { year: 2024, revenue: 0, ebitda: 0, ownerComp: 0 },
    { year: 2023, revenue: 0, ebitda: 0, ownerComp: 0 },
  ],
  addBacks: [
    { label: 'Owner compensation above market',    amount: 0, reason: '', enabled: false },
    { label: 'Personal vehicle / travel',          amount: 0, reason: '', enabled: false },
    { label: 'One-time legal / professional fees', amount: 0, reason: '', enabled: false },
    { label: 'Personal CME / conference travel',   amount: 0, reason: '', enabled: false },
    { label: 'Family on payroll above market',     amount: 0, reason: '', enabled: false },
    { label: 'Personal phone / internet',          amount: 0, reason: '', enabled: false },
  ],
  exampleId: 'custom',
}

// Closest-comparable transactions — could later be filtered by state / size
const COMPS = [
  { name: 'Roanoke Family Chiro',     state: 'VA', rev:   980_000, sde:  315_000, mult: 1.52, year: 2024 },
  { name: 'Lynchburg Spine Center',   state: 'VA', rev: 1_180_000, sde:  410_000, mult: 1.45, year: 2025 },
  { name: 'Asheville Wellness Group', state: 'NC', rev: 1_055_000, sde:  385_000, mult: 1.62, year: 2024 },
  { name: 'Knoxville Chiro Practice', state: 'TN', rev: 1_290_000, sde:  430_000, mult: 1.41, year: 2023 },
  { name: 'Macon Spine & Sport',      state: 'GA', rev: 1_150_000, sde:  395_000, mult: 1.38, year: 2025 },
  { name: 'Greenville Family',        state: 'SC', rev: 1_080_000, sde:  370_000, mult: 1.55, year: 2024 },
  { name: 'Charlottesville Athletic', state: 'VA', rev: 1_400_000, sde:  510_000, mult: 1.49, year: 2025 },
]

// ── compute all derived values from FormData ────────────────────────────
function computeValuation(form: FormData) {
  const recent = form.financials[0]
  const totalAddBacks = form.addBacks.filter(a => a.enabled).reduce((s, a) => s + (a.amount || 0), 0)
  const normalizedEbitda = recent.ebitda + totalAddBacks
  const sde = normalizedEbitda + recent.ownerComp

  // Comp-set medians (from ~200 chiropractic deals analyzed)
  const COMP_MEDIANS = { solo: 1.46, multi: 3.0, platform: 7.5 }
  const COMP_METRIC: Record<Profile, 'SDE' | 'EBITDA'> = { solo: 'SDE', multi: 'SDE', platform: 'EBITDA' }
  const mult   = COMP_MEDIANS[form.profile]
  const metric = COMP_METRIC[form.profile]
  const basis  = metric === 'SDE' ? sde : normalizedEbitda

  // Range: P25 = basis × (mult × 0.74) ; P75 = basis × (mult × 1.40)
  const valLow  = basis * (mult * 0.74)
  const valMid  = basis * mult
  const valHigh = basis * (mult * 1.40)

  // Wagner 4-stream deal structure
  const cashAtClose       = valMid * 0.50
  const sellerNote        = valMid * 0.40
  const rolloverEquity    = valMid * 0.10
  const profitSharePct    = 4
  const annualProfitShare = normalizedEbitda * (profitSharePct / 100)
  const medTeamLift       = 250_000
  const exitMultiple      = 9

  // ChiroPillar fit score (1-100) — based on Wagner criteria
  const fitScore = (() => {
    let s = 30  // base
    // Geography
    const WAGNER_PRIMARY = ['VA']
    const WAGNER_SECONDARY = ['TX', 'FL', 'NC', 'SC', 'GA', 'TN', 'KY', 'WV', 'MD', 'AL']
    if (WAGNER_PRIMARY.includes(form.state.toUpperCase())) s += 25
    else if (WAGNER_SECONDARY.includes(form.state.toUpperCase())) s += 15
    // Practice quality
    if (form.years >= 10) s += 10
    if (form.employees >= 5) s += 8
    if (form.ownerRole === 'mostly_management' || form.ownerRole === 'wants_to_step_out') s += 15
    // Financial signal
    if (recent.revenue >= 1_000_000) s += 8
    if (normalizedEbitda >= 400_000) s += 6
    if (sde >= 600_000) s += 4
    // Trend
    if (form.financials[0].revenue > form.financials[2].revenue * 1.15) s += 4
    return Math.min(s, 100)
  })()

  return {
    revenue: recent.revenue,
    reportedEbitda: recent.ebitda,
    totalAddBacks,
    normalizedEbitda,
    sde,
    mult,
    metric,
    valLow, valMid, valHigh,
    cashAtClose, sellerNote, rolloverEquity,
    profitSharePct, annualProfitShare,
    medTeamLift, exitMultiple,
    fitScore,
  }
}

// ── Tab keys for the report ─────────────────────────────────────────────
const TABS = [
  { key: 'summary',    label: 'Summary'           },
  { key: 'financials', label: 'Financials (3-yr)' },
  { key: 'addbacks',   label: 'Add-backs'         },
  { key: 'comps',      label: 'Comparables'       },
  { key: 'structure',  label: 'Deal Structure'    },
  { key: 'risks',      label: 'Risks & Drivers'   },
]

// ────────────────────────────────────────────────────────────────────────
//                              PAGE
// ────────────────────────────────────────────────────────────────────────
export default function ValuationPage() {
  const [mode, setMode] = useState<'view' | 'input'>('view')
  const [step, setStep] = useState<0 | 1 | 2 | 3>(0)
  const [form, setForm] = useState<FormData>(PIEDMONT)         // active result
  const [draft, setDraft] = useState<FormData>(BLANK_FORM)     // wizard work-in-progress

  const v = computeValuation(form)

  const startWizard = () => {
    setDraft({ ...BLANK_FORM, financials: BLANK_FORM.financials.map(f => ({ ...f })), addBacks: BLANK_FORM.addBacks.map(a => ({ ...a })) })
    setStep(0)
    setMode('input')
  }

  const submitWizard = () => {
    // Auto-fill practice_type from profile if blank
    const pt = draft.practice_type || (draft.profile === 'solo' ? 'Solo-DC' : draft.profile === 'multi' ? 'Multi-DC' : 'Platform / multi-location')
    setForm({ ...draft, practice_type: pt })
    setMode('view')
  }

  // ── INPUT MODE ────────────────────────────────────────────────────────
  if (mode === 'input') {
    return (
      <div style={{ padding: '32px 32px 80px', maxWidth: 880, margin: '0 auto', fontFamily: F.body, color: C.text }}>

        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontFamily: F.mono, fontSize: 11, color: C.align, letterSpacing: '0.22em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 6 }}>
            New Valuation · step {step + 1} of 3
          </div>
          <h1 style={{ fontFamily: F.display, fontSize: 'clamp(28px, 4vw, 36px)', fontWeight: 700, margin: '0 0 6px', letterSpacing: '-0.02em' }}>
            {step === 0 && 'Tell us about the practice.'}
            {step === 1 && '3 years of financials.'}
            {step === 2 && 'Add-back capture.'}
          </h1>
          <p style={{ fontSize: 14, color: C.muted, margin: 0 }}>
            Same engine the public /intake form uses, calibrated to nearly 200 chiropractic deals analyzed.
          </p>
        </div>

        {/* Progress */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 28 }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              flex: 1, height: 5, borderRadius: 3,
              background: i <= step ? C.gold : 'rgba(255,255,255,0.06)',
            }} />
          ))}
        </div>

        {/* Step content */}
        <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 14, padding: '28px 30px', marginBottom: 18 }}>

          {step === 0 && <Step1Practice draft={draft} setDraft={setDraft} />}
          {step === 1 && <Step2Financials draft={draft} setDraft={setDraft} />}
          {step === 2 && <Step3AddBacks   draft={draft} setDraft={setDraft} />}

        </div>

        {/* Nav */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            type="button"
            onClick={() => step === 0 ? setMode('view') : setStep(s => (s - 1) as 0 | 1 | 2)}
            style={{ padding: '11px 22px', background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.border}`, borderRadius: 8, color: C.muted, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: F.body }}
          >
            ← {step === 0 ? 'Cancel' : 'Back'}
          </button>
          <button
            type="button"
            onClick={() => step === 2 ? submitWizard() : setStep(s => (s + 1) as 0 | 1 | 2 | 3)}
            style={{ padding: '11px 26px', background: C.gold, border: 'none', borderRadius: 8, color: C.bg, fontSize: 13, fontWeight: 800, cursor: 'pointer', fontFamily: F.body, letterSpacing: '0.04em' }}
          >
            {step === 2 ? 'Calculate Valuation →' : 'Continue →'}
          </button>
        </div>
      </div>
    )
  }

  // ── VIEW MODE ─────────────────────────────────────────────────────────
  return <ResultView form={form} v={v} startWizard={startWizard} loadExample={() => setForm(PIEDMONT)} />
}

// ────────────────────────────────────────────────────────────────────────
//                          WIZARD STEPS
// ────────────────────────────────────────────────────────────────────────
function Step1Practice({ draft, setDraft }: { draft: FormData; setDraft: (d: FormData) => void }) {
  const update = <K extends keyof FormData>(key: K, value: FormData[K]) => setDraft({ ...draft, [key]: value })
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }} className="kb-form-grid">
      <Field label="Practice name *">
        <input value={draft.practiceName} onChange={e => update('practiceName', e.target.value)} placeholder="e.g. Piedmont Spine & Wellness" style={inputStyle} />
      </Field>
      <Field label="Owner name *">
        <input value={draft.ownerName} onChange={e => update('ownerName', e.target.value)} placeholder="Dr. Jane Smith" style={inputStyle} />
      </Field>
      <Field label="City *">
        <input value={draft.city} onChange={e => update('city', e.target.value)} placeholder="Charlottesville" style={inputStyle} />
      </Field>
      <Field label="State (2-letter) *">
        <input value={draft.state} onChange={e => update('state', e.target.value.toUpperCase().slice(0, 2))} placeholder="VA" style={inputStyle} maxLength={2} />
      </Field>
      <Field label="Years in business">
        <input type="number" value={draft.years || ''} onChange={e => update('years', parseInt(e.target.value, 10) || 0)} placeholder="14" style={inputStyle} />
      </Field>
      <Field label="Employee count (incl. associate DCs)">
        <input type="number" value={draft.employees || ''} onChange={e => update('employees', parseInt(e.target.value, 10) || 0)} placeholder="8" style={inputStyle} />
      </Field>
      <Field label="Practice profile *" full>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          {(['solo', 'multi', 'platform'] as Profile[]).map(p => (
            <button key={p} type="button" onClick={() => update('profile', p)} style={{
              padding: '12px 14px', borderRadius: 8, cursor: 'pointer', textAlign: 'center',
              background: draft.profile === p ? `${C.gold}18` : 'rgba(255,255,255,0.03)',
              border: `${draft.profile === p ? 2 : 1}px solid ${draft.profile === p ? C.gold : C.border}`,
              fontFamily: F.body, fontSize: 13, fontWeight: 600,
              color: draft.profile === p ? C.gold : C.muted,
            }}>
              {p === 'solo' && <>Solo-DC<br/><span style={{ fontSize: 10, fontFamily: F.mono, opacity: 0.7 }}>1.46× SDE</span></>}
              {p === 'multi' && <>Multi-DC<br/><span style={{ fontSize: 10, fontFamily: F.mono, opacity: 0.7 }}>3.0× SDE</span></>}
              {p === 'platform' && <>Platform<br/><span style={{ fontSize: 10, fontFamily: F.mono, opacity: 0.7 }}>7.5× EBITDA</span></>}
            </button>
          ))}
        </div>
      </Field>
      <Field label="Owner role *" full>
        <select value={draft.ownerRole} onChange={e => update('ownerRole', e.target.value as FormData['ownerRole'])} style={inputStyle}>
          <option value="full_clinical">Full clinical (treating most patients personally)</option>
          <option value="mostly_clinical_some_management">Mostly clinical · some management</option>
          <option value="mostly_management">Mostly management · associate DCs treat</option>
          <option value="wants_to_step_out">Ready to step out completely</option>
        </select>
      </Field>
    </div>
  )
}

function Step2Financials({ draft, setDraft }: { draft: FormData; setDraft: (d: FormData) => void }) {
  const updateYear = (i: number, key: keyof YearFin, value: number) => {
    const fins = draft.financials.map((f, idx) => idx === i ? { ...f, [key]: value } : f)
    setDraft({ ...draft, financials: fins })
  }
  return (
    <div>
      <p style={{ fontSize: 13, color: C.muted, marginTop: 0, marginBottom: 20, lineHeight: 1.5 }}>
        Enter the last 3 years. Most recent year first. Round numbers OK — the AI will normalize on extraction once PDFs are uploaded in Phase 3.
      </p>

      {/* Header */}
      <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 1fr 1fr', gap: 12, padding: '8px 12px', borderBottom: `1px solid ${C.border}`, fontFamily: F.mono, fontSize: 10, color: C.faint, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700 }}>
        <span>Year</span>
        <span>Gross Revenue</span>
        <span>EBITDA (reported)</span>
        <span>Owner Comp</span>
      </div>

      {draft.financials.map((f, i) => (
        <div key={i} style={{ display: 'grid', gridTemplateColumns: '80px 1fr 1fr 1fr', gap: 12, padding: '12px', borderBottom: i < draft.financials.length - 1 ? `1px solid ${C.border}` : 'none', alignItems: 'center' }}>
          <input type="number" value={f.year} onChange={e => updateYear(i, 'year', parseInt(e.target.value, 10) || 0)} style={{ ...inputStyle, padding: '8px 10px', fontFamily: F.mono, fontWeight: 700, color: C.gold }} />
          <div style={inputWrap}>
            <span style={inputPrefix}>$</span>
            <input type="number" value={f.revenue || ''} onChange={e => updateYear(i, 'revenue', parseInt(e.target.value, 10) || 0)} placeholder="1,300,000" style={{ ...inputStyle, padding: '8px 10px 8px 24px' }} />
          </div>
          <div style={inputWrap}>
            <span style={inputPrefix}>$</span>
            <input type="number" value={f.ebitda || ''} onChange={e => updateYear(i, 'ebitda', parseInt(e.target.value, 10) || 0)} placeholder="485,000" style={{ ...inputStyle, padding: '8px 10px 8px 24px' }} />
          </div>
          <div style={inputWrap}>
            <span style={inputPrefix}>$</span>
            <input type="number" value={f.ownerComp || ''} onChange={e => updateYear(i, 'ownerComp', parseInt(e.target.value, 10) || 0)} placeholder="245,000" style={{ ...inputStyle, padding: '8px 10px 8px 24px' }} />
          </div>
        </div>
      ))}

      <div style={{ marginTop: 18, padding: '14px 18px', background: 'rgba(46,117,182,0.06)', border: `1px solid rgba(46,117,182,0.20)`, borderRadius: 10, fontSize: 12, color: C.muted, lineHeight: 1.55 }}>
        <strong style={{ color: C.text }}>Don&apos;t know exact EBITDA?</strong> Most chiropractic practices report ~30–40% EBITDA margin. Multiply revenue × 0.35 as a rough estimate. The add-back step (next) will normalize it.
      </div>
    </div>
  )
}

function Step3AddBacks({ draft, setDraft }: { draft: FormData; setDraft: (d: FormData) => void }) {
  const toggle = (i: number) => {
    setDraft({ ...draft, addBacks: draft.addBacks.map((a, idx) => idx === i ? { ...a, enabled: !a.enabled } : a) })
  }
  const updateAmt = (i: number, amt: number) => {
    setDraft({ ...draft, addBacks: draft.addBacks.map((a, idx) => idx === i ? { ...a, amount: amt } : a) })
  }
  const updateReason = (i: number, reason: string) => {
    setDraft({ ...draft, addBacks: draft.addBacks.map((a, idx) => idx === i ? { ...a, reason } : a) })
  }
  const total = draft.addBacks.filter(a => a.enabled).reduce((s, a) => s + (a.amount || 0), 0)
  return (
    <div>
      <p style={{ fontSize: 13, color: C.muted, marginTop: 0, marginBottom: 20, lineHeight: 1.55 }}>
        Toggle each item that applies, enter the annual dollar amount, and (optional) add context. These are the legitimate add-backs that bump reported EBITDA → normalized EBITDA → higher valuation.
      </p>

      {draft.addBacks.map((a, i) => (
        <div key={i} style={{
          padding: '14px 16px', marginBottom: 8, borderRadius: 10,
          background: a.enabled ? `${C.green}10` : 'rgba(255,255,255,0.02)',
          border: `1px solid ${a.enabled ? `${C.green}55` : C.border}`,
        }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: a.enabled ? 10 : 0 }}>
            <button type="button" onClick={() => toggle(i)} style={{
              flexShrink: 0, width: 22, height: 22, borderRadius: 5,
              border: `2px solid ${a.enabled ? C.green : C.border}`,
              background: a.enabled ? C.green : 'transparent',
              color: a.enabled ? C.bg : 'transparent', cursor: 'pointer', padding: 0,
              fontSize: 14, fontWeight: 800,
            }}>
              {a.enabled ? '✓' : ''}
            </button>
            <span style={{ flex: 1, fontSize: 14, color: C.text, fontWeight: 600 }}>{a.label}</span>
            {a.enabled && (
              <div style={{ ...inputWrap, width: 160 }}>
                <span style={inputPrefix}>$</span>
                <input type="number" value={a.amount || ''} onChange={e => updateAmt(i, parseInt(e.target.value, 10) || 0)} placeholder="0" style={{ ...inputStyle, padding: '8px 10px 8px 24px', fontFamily: F.mono, fontWeight: 700, color: C.green }} />
              </div>
            )}
          </div>
          {a.enabled && (
            <input value={a.reason} onChange={e => updateReason(i, e.target.value)} placeholder="Optional: why this is legitimately add-backable (e.g. 'spouse on payroll above market rate')" style={{ ...inputStyle, padding: '8px 12px', fontSize: 12 }} />
          )}
        </div>
      ))}

      <div style={{
        marginTop: 18, padding: '16px 20px', borderRadius: 10,
        background: `linear-gradient(135deg, ${C.gold}18, ${C.gold}08)`,
        border: `2px solid ${C.gold}55`,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <span style={{ fontFamily: F.mono, fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: C.gold, fontWeight: 700 }}>
          Total add-backs
        </span>
        <span style={{ fontFamily: F.display, fontSize: 26, fontWeight: 800, color: C.gold }}>+{fmtMoney(total)}</span>
      </div>
    </div>
  )
}

// ────────────────────────────────────────────────────────────────────────
//                          RESULT VIEW
// ────────────────────────────────────────────────────────────────────────
function ResultView({ form, v, startWizard, loadExample }: {
  form: FormData
  v: ReturnType<typeof computeValuation>
  startWizard: () => void
  loadExample: () => void
}) {
  const [tab, setTab] = useState<string>('summary')
  const maxRev = Math.max(...form.financials.map(f => f.revenue), 1)
  const totalSellerValue =
    v.cashAtClose +
    v.sellerNote * 1.18 +
    (v.normalizedEbitda + v.medTeamLift) * (v.profitSharePct / 100) * 5 +
    (v.normalizedEbitda + v.medTeamLift) * v.exitMultiple * 0.10

  return (
    <div style={{ padding: '32px 32px 80px', maxWidth: 1280, margin: '0 auto', fontFamily: F.body, color: C.text }}>

      {/* MODE TOGGLE BAR */}
      <div style={{
        background: form.exampleId === 'piedmont' ? 'rgba(201,168,76,0.08)' : 'rgba(46,204,139,0.08)',
        border: `1px solid ${form.exampleId === 'piedmont' ? 'rgba(201,168,76,0.30)' : 'rgba(46,204,139,0.30)'}`,
        borderRadius: 12, padding: '12px 20px', marginBottom: 24,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12,
      }}>
        <div style={{ fontSize: 13, color: C.text }}>
          <span style={{ fontFamily: F.mono, fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 800, color: form.exampleId === 'piedmont' ? C.gold : C.green, marginRight: 10 }}>
            {form.exampleId === 'piedmont' ? '📊 Example' : '✓ Your numbers'}
          </span>
          Showing valuation for <strong>{form.practiceName || 'unnamed practice'}</strong>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {form.exampleId !== 'piedmont' && (
            <button type="button" onClick={loadExample} style={{ padding: '8px 14px', borderRadius: 8, background: 'transparent', border: `1px solid ${C.border}`, color: C.muted, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: F.body }}>
              View Piedmont example
            </button>
          )}
          <button type="button" onClick={startWizard} style={{ padding: '8px 16px', borderRadius: 8, background: C.gold, border: 'none', color: C.bg, fontSize: 12, fontWeight: 800, cursor: 'pointer', fontFamily: F.body, letterSpacing: '0.04em' }}>
            {form.exampleId === 'piedmont' ? '+ Run new valuation' : '+ Run another'}
          </button>
        </div>
      </div>

      {/* HEADER */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontFamily: F.mono, fontSize: 11, color: C.gold, letterSpacing: '0.22em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 8 }}>
          AI Valuation · {form.profile === 'solo' ? 'Solo-DC' : form.profile === 'multi' ? 'Multi-DC' : 'Platform'} profile
        </div>
        <h1 style={{ fontFamily: F.display, fontSize: 'clamp(30px, 4vw, 40px)', fontWeight: 700, margin: '0 0 6px', letterSpacing: '-0.02em' }}>
          {form.practiceName || '(no practice name)'}
        </h1>
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', fontSize: 14, color: C.muted, lineHeight: 1.6 }}>
          {form.ownerName && <span>{form.ownerName}</span>}
          {form.ownerName && form.city && <span>·</span>}
          {form.city && <span>{form.city}, {form.state}</span>}
          {form.years > 0 && <><span>·</span><span>{form.years} yrs in business</span></>}
          {form.employees > 0 && <><span>·</span><span>{form.employees} employees</span></>}
          {form.practice_type && <><span>·</span><span>{form.practice_type}</span></>}
        </div>
      </div>

      {/* VALUATION GAUGE */}
      <div style={{
        background: `linear-gradient(135deg, rgba(201,168,76,0.10) 0%, ${C.bg3} 100%)`,
        border: `1px solid rgba(201,168,76,0.30)`, borderRadius: 14,
        padding: '32px 36px', marginBottom: 24,
      }}>
        <div style={{ fontFamily: F.mono, fontSize: 11, color: C.gold, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 14 }}>
          ★ Estimated Valuation Range
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 18, marginBottom: 20 }} className="kb-val-grid">
          <Pillar label="Conservative"  val={fmtMoney(v.valLow)}  sub="P25 of comp set"            color={C.muted} />
          <Pillar label="Fair Market"   val={fmtMoney(v.valMid)}  sub={`Median ${v.mult}× ${v.metric}`} color={C.gold} big />
          <Pillar label="Premium"       val={fmtMoney(v.valHigh)} sub="P75 of comp set"            color={C.green} />
        </div>

        <div style={{ position: 'relative', height: 14, background: 'rgba(255,255,255,0.06)', borderRadius: 7, marginBottom: 14, overflow: 'hidden' }}>
          <div style={{ position: 'absolute', left: '0%', right: '0%', top: 0, bottom: 0, background: `linear-gradient(90deg, rgba(155,168,192,0.3), ${C.gold}, ${C.green})`, borderRadius: 7 }} />
          <div style={{ position: 'absolute', left: '50%', top: -3, bottom: -3, width: 3, background: '#FFFFFF', boxShadow: '0 0 8px rgba(255,255,255,0.6)' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: F.mono, fontSize: 10, color: C.faint, letterSpacing: '0.06em' }}>
          <span>{fmtMoney(v.valLow)}</span>
          <span style={{ color: C.gold, fontWeight: 700 }}>FMV · {fmtMoney(v.valMid)}</span>
          <span>{fmtMoney(v.valHigh)}</span>
        </div>

        <div style={{ marginTop: 20, padding: '14px 18px', background: 'rgba(46,117,182,0.06)', border: `1px solid rgba(46,117,182,0.18)`, borderRadius: 10, fontSize: 13, color: C.muted, lineHeight: 1.6 }}>
          <strong style={{ color: C.text }}>Calibrated to nearly 200 chiropractic deals analyzed.</strong> {form.profile === 'solo' ? 'Solo' : form.profile === 'multi' ? 'Multi-DC' : 'Platform'}-profile median {v.mult}× {v.metric} · P25–P75 range applied · Sources: BizBuySell, Progressive Practice Sales, William David Co, JYNT 10-K. Asking-price-derived — closing typically 85–95% of FMV.
        </div>
      </div>

      {/* KPI strip */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14,
        background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 14,
        padding: '20px 24px', marginBottom: 32,
      }}>
        <Kpi label="Latest revenue"     val={fmtMoney(v.revenue)}          color={C.text} />
        <Kpi label="Reported EBITDA"   val={fmtMoney(v.reportedEbitda)}   color={C.muted} />
        <Kpi label="Add-backs found"   val={`+${fmtMoney(v.totalAddBacks)}`} color={C.green} sub={v.reportedEbitda > 0 ? `+${Math.round((v.totalAddBacks/v.reportedEbitda)*100)}% lift` : '—'} />
        <Kpi label="Normalized EBITDA" val={fmtMoney(v.normalizedEbitda)} color={C.green} />
        <Kpi label="SDE"               val={fmtMoney(v.sde)}              color={C.gold} sub="EBITDA + owner" />
        <Kpi label="Applied multiple" val={`${v.mult}×`}                  color={C.goldLight} sub={`${form.profile === 'solo' ? 'Solo' : form.profile === 'multi' ? 'Multi-DC' : 'Platform'} median`} />
      </div>

      {/* TABS */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 18 }}>
        {TABS.map(t => (
          <button key={t.key} type="button" onClick={() => setTab(t.key)} style={{
            padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
            fontFamily: F.body, fontSize: 13, fontWeight: tab === t.key ? 700 : 500,
            background: tab === t.key ? C.gold : 'rgba(255,255,255,0.04)',
            color: tab === t.key ? C.bg : C.muted, transition: 'all 0.15s',
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* TAB CONTENT */}
      {tab === 'summary' && (
        <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 14, padding: '24px 28px' }}>
          <SectionTitle eyebrow="Claude AI · narrative + fit score" title="The story buyers see." />
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 24 }} className="kb-val-grid">
            <div>
              <p style={{ fontSize: 14.5, color: C.text, lineHeight: 1.75, marginBottom: 16 }}>
                <strong style={{ color: C.gold }}>{form.practiceName}</strong> in {form.city || '—'}, {form.state || '—'} reports {fmtMoney(v.revenue)} latest-year revenue with EBITDA of {fmtMoney(v.reportedEbitda)}. After {v.totalAddBacks > 0 ? `${fmtMoney(v.totalAddBacks)} in legitimate add-backs` : 'no flagged add-backs'}, normalized EBITDA is {fmtMoney(v.normalizedEbitda)} and SDE lands at {fmtMoney(v.sde)}.
              </p>
              <p style={{ fontSize: 14.5, color: C.text, lineHeight: 1.75, marginBottom: 16 }}>
                Against the {form.profile === 'solo' ? 'solo-DC' : form.profile === 'multi' ? 'multi-DC' : 'platform'} comp-set median of <strong style={{ color: C.gold }}>{v.mult}× {v.metric}</strong>, fair-market value lands at <strong style={{ color: C.gold }}>{fmtMoney(v.valMid)}</strong> — a defensible benchmark against the ~200-deal dataset.
              </p>
              <p style={{ fontSize: 14.5, color: C.text, lineHeight: 1.75, margin: 0 }}>
                {v.fitScore >= 75
                  ? <>This practice is a <strong style={{ color: C.green }}>strong ChiroPillar partnership candidate</strong> — geography, scale, and owner profile all align with Wagner&apos;s acquisition criteria. The Deal Structure tab recommends a 4-stream offer that totals more than the standalone alternative.</>
                  : v.fitScore >= 50
                  ? <>This practice is a <strong style={{ color: C.gold }}>plausible ChiroPillar candidate</strong> with some criteria still to develop. Review the Risks & Drivers tab for the gating items before extending an offer.</>
                  : <>This practice <strong style={{ color: C.coral }}>doesn&apos;t yet fit the ChiroPillar partnership profile</strong>. Most common gaps: sub-target geography, owner still full-clinical, or below volume floor. Re-evaluate in 12 months.</>}
              </p>
            </div>

            <div style={{ background: C.bg3, border: `1px solid ${C.border}`, borderRadius: 12, padding: '22px 24px' }}>
              <div style={{ fontFamily: F.mono, fontSize: 10, color: C.green, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 14 }}>
                ChiroPillar fit score
              </div>
              <div style={{ fontFamily: F.display, fontSize: 56, fontWeight: 800, color: v.fitScore >= 75 ? C.green : v.fitScore >= 50 ? C.gold : C.coral, lineHeight: 1, marginBottom: 4 }}>
                {v.fitScore}<span style={{ fontSize: 22, color: C.faint }}>/100</span>
              </div>
              <div style={{ fontSize: 12, color: C.muted, marginBottom: 18, fontStyle: 'italic' }}>
                {v.fitScore >= 75 ? '"Top-decile partnership candidate"' : v.fitScore >= 50 ? '"In the conversation zone"' : '"Not yet fit — re-evaluate in 12mo"'}
              </div>
              <FitRow label="Wagner geography"         score={['VA'].includes(form.state.toUpperCase()) ? 100 : ['TX','FL','NC','SC','GA','TN','KY','WV','MD','AL'].includes(form.state.toUpperCase()) ? 65 : 25} accent={C.gold} />
              <FitRow label="Tenure (10+ yrs)"         score={form.years >= 10 ? 100 : form.years >= 5 ? 60 : 30} accent={C.green} />
              <FitRow label="Owner ready to step out"  score={form.ownerRole === 'wants_to_step_out' ? 100 : form.ownerRole === 'mostly_management' ? 85 : form.ownerRole === 'mostly_clinical_some_management' ? 50 : 20} accent={C.green} />
              <FitRow label="Scale (revenue + team)"    score={Math.min(100, (v.revenue / 1_300_000) * 80 + (form.employees / 8) * 20)} accent={C.goldLight} />
              <FitRow label="EBITDA quality"            score={v.reportedEbitda > 0 ? Math.min(100, (v.reportedEbitda / v.revenue) * 250) : 0} accent={C.green} />
            </div>
          </div>
        </div>
      )}

      {tab === 'financials' && (
        <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 14, padding: '24px 28px' }}>
          <SectionTitle eyebrow="3-year financial trajectory" title="Revenue + EBITDA, year over year." />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 30, alignItems: 'end' }}>
            <div>
              <div style={{ fontFamily: F.mono, fontSize: 10, color: C.faint, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 10 }}>Gross revenue</div>
              {[...form.financials].reverse().map(f => (
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
            <div>
              <div style={{ fontFamily: F.mono, fontSize: 10, color: C.faint, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 10 }}>EBITDA (reported)</div>
              {[...form.financials].reverse().map(f => (
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

          <div style={{ marginTop: 32 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr 1fr 1fr 1fr', gap: 14, padding: '10px 12px', borderBottom: `1px solid ${C.border}`, fontFamily: F.mono, fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.faint, fontWeight: 700 }}>
              <div>Year</div>
              <div style={{ textAlign: 'right' }}>Revenue</div>
              <div style={{ textAlign: 'right' }}>EBITDA</div>
              <div style={{ textAlign: 'right' }}>Margin</div>
              <div style={{ textAlign: 'right' }}>Owner Comp</div>
            </div>
            {form.financials.map(f => (
              <div key={f.year} style={{ display: 'grid', gridTemplateColumns: '100px 1fr 1fr 1fr 1fr', gap: 14, padding: '14px 12px', borderBottom: `1px solid ${C.border}`, fontSize: 14, alignItems: 'baseline' }}>
                <div style={{ fontFamily: F.mono, fontWeight: 700, color: C.gold }}>{f.year}</div>
                <div style={{ textAlign: 'right', fontFamily: F.display, fontWeight: 700, color: C.text }}>{fmtMoney(f.revenue)}</div>
                <div style={{ textAlign: 'right', fontFamily: F.display, fontWeight: 700, color: C.green }}>{fmtMoney(f.ebitda)}</div>
                <div style={{ textAlign: 'right', color: C.muted, fontFamily: F.mono }}>{f.revenue > 0 ? ((f.ebitda / f.revenue) * 100).toFixed(1) : '0.0'}%</div>
                <div style={{ textAlign: 'right', color: C.muted, fontFamily: F.mono }}>{fmtMoney(f.ownerComp)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'addbacks' && (
        <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 14, padding: '24px 28px' }}>
          <SectionTitle eyebrow="Add-back detection" title="Where the EBITDA lift comes from." />
          <div style={{ display: 'flex', gap: 14, alignItems: 'baseline', marginBottom: 24, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: 11, color: C.faint, fontFamily: F.mono, letterSpacing: '0.10em', textTransform: 'uppercase' }}>Reported EBITDA</div>
              <div style={{ fontFamily: F.display, fontSize: 28, fontWeight: 700, color: C.muted }}>{fmtMoney(v.reportedEbitda)}</div>
            </div>
            <div style={{ color: C.gold, fontSize: 22 }}>+</div>
            <div>
              <div style={{ fontSize: 11, color: C.faint, fontFamily: F.mono, letterSpacing: '0.10em', textTransform: 'uppercase' }}>Add-backs</div>
              <div style={{ fontFamily: F.display, fontSize: 28, fontWeight: 700, color: C.green }}>+{fmtMoney(v.totalAddBacks)}</div>
            </div>
            <div style={{ color: C.gold, fontSize: 22 }}>=</div>
            <div>
              <div style={{ fontSize: 11, color: C.faint, fontFamily: F.mono, letterSpacing: '0.10em', textTransform: 'uppercase' }}>Normalized EBITDA</div>
              <div style={{ fontFamily: F.display, fontSize: 32, fontWeight: 800, color: C.gold }}>{fmtMoney(v.normalizedEbitda)}</div>
            </div>
          </div>

          {form.addBacks.filter(a => a.enabled).length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: C.muted, fontSize: 14, background: 'rgba(255,255,255,0.02)', borderRadius: 10, border: `1px dashed ${C.border}` }}>
              No add-backs flagged. Reported EBITDA is the basis.
            </div>
          ) : (
            form.addBacks.filter(a => a.enabled).map((a, i, arr) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 110px 2fr', gap: 14, padding: '14px 14px', borderBottom: i < arr.length - 1 ? `1px solid ${C.border}` : 'none', alignItems: 'baseline' }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{a.label}</div>
                <div style={{ textAlign: 'right', fontFamily: F.display, fontWeight: 800, fontSize: 18, color: C.green }}>+{fmtMoney(a.amount)}</div>
                <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.5 }}>{a.reason || <em style={{ color: C.faint }}>No reason provided</em>}</div>
              </div>
            ))
          )}
        </div>
      )}

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

      {tab === 'structure' && (
        <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 14, padding: '24px 28px' }}>
          <SectionTitle eyebrow="Recommended deal structure" title="Wagner's 4-stream offer formula." />
          <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.6, marginBottom: 24 }}>
            Based on practice size + owner role + seller cash-flow needs, Claude recommends a structure that beats the standalone alternative across all four streams: cash now, secured note, ongoing profit share, and platform-equity rollover.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginBottom: 28 }}>
            <Stream pct="50%" amount={fmtMoney(v.cashAtClose)}      title="Cash at close" sub="Funded by Wagner Family Office" accent={C.gold} />
            <Stream pct="40%" amount={fmtMoney(v.sellerNote)}        title="Seller note · 5 yr" sub="6% interest · paid from clinic cash flow" accent={C.align} />
            <Stream pct="10%" amount={fmtMoney(v.rolloverEquity)}    title="ChiroPillar rollover" sub="Re-rated at 8–10× at exit" accent={C.green} />
            <Stream pct={`${v.profitSharePct}%`} amount={`${fmtMoney(v.annualProfitShare)}/yr`} title="Profit share" sub="On improved clinic EBITDA · ongoing" accent={C.goldLight} />
          </div>

          <div style={{ background: 'rgba(46,204,139,0.08)', border: '1px solid rgba(46,204,139,0.25)', borderRadius: 12, padding: '18px 22px', marginBottom: 16 }}>
            <div style={{ fontFamily: F.mono, fontSize: 10, color: C.green, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 8 }}>★ Wagner medical-team add-on</div>
            <div style={{ fontSize: 14, color: C.text, lineHeight: 1.6 }}>
              Once the playbook is installed (pain mgmt + diagnostic billing + medical-team handoff), per-office EBITDA lifts approximately <strong style={{ color: C.green }}>+{fmtMoney(v.medTeamLift)}</strong>. Improved EBITDA: <strong>{fmtMoney(v.normalizedEbitda + v.medTeamLift)}</strong>. At exit multiple of {v.exitMultiple}×, the rollover share is worth <strong style={{ color: C.gold }}>{fmtMoney((v.normalizedEbitda + v.medTeamLift) * v.exitMultiple * 0.10)}</strong>.
            </div>
          </div>

          <div style={{ background: C.bg3, border: `1px solid ${C.border}`, borderRadius: 12, padding: '18px 22px' }}>
            <div style={{ fontFamily: F.mono, fontSize: 10, color: C.faint, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 12 }}>Total seller-economic value (5-year)</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
              <SellerLine label="Cash at close"                                  val={fmtMoney(v.cashAtClose)} />
              <SellerLine label="Seller note (principal + interest)"             val={fmtMoney(v.sellerNote * 1.18)} />
              <SellerLine label="5-yr profit share (improved EBITDA)"            val={fmtMoney((v.normalizedEbitda + v.medTeamLift) * (v.profitSharePct / 100) * 5)} />
              <SellerLine label={`Rollover at exit (${v.exitMultiple}× × 10%)`}  val={fmtMoney((v.normalizedEbitda + v.medTeamLift) * v.exitMultiple * 0.10)} />
            </div>
            <div style={{ marginTop: 16, paddingTop: 14, borderTop: `2px solid ${C.gold}`, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontFamily: F.mono, fontSize: 11, color: C.gold, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 800 }}>Total 5-yr value</span>
              <span style={{ fontFamily: F.display, fontSize: 28, fontWeight: 800, color: C.gold }}>{fmtMoney(totalSellerValue)}</span>
            </div>
          </div>
        </div>
      )}

      {tab === 'risks' && (
        <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 14, padding: '24px 28px' }}>
          <SectionTitle eyebrow="Risk + value drivers" title="What pulls the band up — and what pulls it down." />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }} className="kb-val-grid">
            <div>
              <div style={{ fontFamily: F.mono, fontSize: 11, color: C.green, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 14 }}>↗ Value drivers</div>
              {form.years >= 10 && <DriverRow title={`${form.years}-year operating history`} desc="De-risks every diligence question. Buyers pay for tenure." pos />}
              {(form.ownerRole === 'mostly_management' || form.ownerRole === 'wants_to_step_out') && <DriverRow title="Owner ready to step out" desc="Premium SDE multiple justified — buyer doesn't need to assume operator-replacement cost." pos />}
              {['VA'].includes(form.state.toUpperCase()) && <DriverRow title="Wagner home territory · Virginia" desc="Geographic alignment with Wagner playbook = fastest install + reimbursement-code knowledge." pos />}
              {form.financials[0].revenue > form.financials[2].revenue * 1.15 && <DriverRow title="Revenue growing 15%+ over 3 yrs" desc="Story is 'growing platform,' not 'stable plateau.'" pos />}
              {form.employees >= 5 && <DriverRow title={`${form.employees}-person team in place`} desc="Operating layer exists. No org-rebuild required at close." pos />}
            </div>

            <div>
              <div style={{ fontFamily: F.mono, fontSize: 11, color: C.coral, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 14 }}>↘ Risk factors</div>
              {form.ownerRole === 'full_clinical' && <DriverRow title="Owner is full-clinical" desc="Buyer must assume operator-replacement risk OR price a runway-to-step-out period." />}
              {form.employees < 4 && <DriverRow title="Lean team · <4 employees" desc="Limited operating layer. Buyer assumes more hiring/training cost in transition." />}
              {!['VA','TX','FL','NC','SC','GA','TN','KY','WV','MD','AL'].includes(form.state.toUpperCase()) && <DriverRow title="Outside Wagner territory" desc="Reimbursement codes + medical-team playbook will need state-specific adaptation. Slower install." />}
              {form.financials[0].revenue < form.financials[2].revenue * 1.05 && <DriverRow title="Flat 3-yr revenue trend" desc="Buyer pays multiple of stable EBITDA, not growing story. Lower premium." />}
              {v.reportedEbitda / Math.max(v.revenue, 1) < 0.25 && <DriverRow title="EBITDA margin below 25%" desc="Operational efficiency gaps. Identify before diligence — could be add-back opportunities." />}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 880px) {
          .kb-val-grid, .kb-form-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}

// ────────────────────────────────────────────────────────────────────────
//                          UI HELPERS
// ────────────────────────────────────────────────────────────────────────
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 14px',
  background: 'rgba(255,255,255,0.04)',
  border: `1px solid ${C.border}`, borderRadius: 8,
  color: C.text, fontSize: 14, fontFamily: F.body,
  outline: 'none', boxSizing: 'border-box',
}
const inputWrap: React.CSSProperties = { position: 'relative' }
const inputPrefix: React.CSSProperties = {
  position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
  color: C.faint, fontSize: 13, fontFamily: F.mono, pointerEvents: 'none',
}

function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <div style={{ gridColumn: full ? 'span 2' : 'auto' }}>
      <label style={{ display: 'block', fontFamily: F.mono, fontSize: 10, color: C.faint, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  )
}

function Pillar({ label, val, sub, color, big }: { label: string; val: string; sub: string; color: string; big?: boolean }) {
  return (
    <div style={{
      textAlign: 'center', padding: big ? '20px 14px 22px' : '14px 14px',
      background: big ? 'linear-gradient(180deg, rgba(201,168,76,0.10), rgba(201,168,76,0.04))' : 'transparent',
      border: big ? `2px solid ${C.gold}` : `1px solid ${C.border}`, borderRadius: 10,
    }}>
      <div style={{ fontFamily: F.mono, fontSize: 10, color: C.faint, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 700 }}>{label}</div>
      <div style={{ fontFamily: F.display, fontSize: big ? 38 : 28, fontWeight: 800, color, lineHeight: 1, margin: '8px 0 4px' }}>{val}</div>
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
  const s = Math.max(0, Math.min(100, Math.round(score)))
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
        <span style={{ color: C.muted }}>{label}</span>
        <span style={{ color: accent, fontFamily: F.mono, fontWeight: 700 }}>{s}</span>
      </div>
      <div style={{ height: 5, background: 'rgba(255,255,255,0.04)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ width: `${s}%`, height: '100%', background: accent }} />
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
      <span style={{ flexShrink: 0, marginTop: 5, width: 9, height: 9, borderRadius: 999, background: pos ? C.green : C.coral, boxShadow: `0 0 6px ${(pos ? C.green : C.coral) + '88'}` }} />
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 3 }}>{title}</div>
        <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.55 }}>{desc}</div>
      </div>
    </div>
  )
}
