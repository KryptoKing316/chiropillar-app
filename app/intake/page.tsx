'use client'

// ChiroPillar · Chiropractor Intake Form
// Publicly accessible at /intake — surface chiropractors land on
// from the $1/day ad funnel ("How would you like to make $250K more
// per year by doing exactly what you're doing?")
//
// Spec source: Dr. Scott Wagner verbatim on the 2026 strategy call.
// Filed at: knowledge/deals/chiropillar/source-docs/wagner-mcgrath-rollup-strategy-transcript.txt
//
// Form captures Wagner's 7 metrics + a "See If You Qualify" gate at the end.
// Submissions land in the chiropillar_targets table for the dashboard.

import { useState } from 'react'

type FormState = {
  // Contact (added — required to follow up)
  full_name: string
  email: string
  phone: string
  practice_name: string
  city: string
  state: string

  // Wagner's 7 metrics
  gross_revenue_last_year: string
  net_revenue_last_year: string
  new_patients_per_month_avg_2yr: string
  avg_visits_per_patient: string // retention proxy
  services_provided: string[]
  services_provided_other: string
  employee_count: string
  geographic_location_notes: string
  owner_role: '' | 'full_clinical' | 'mostly_clinical_some_management' | 'mostly_management' | 'wants_to_step_out'

  // Soft signal — Wagner flagged the desperate-spike pattern
  past_12mo_was_spike: '' | 'no' | 'yes' | 'unsure'

  // Marketing consent
  ok_to_contact: boolean
}

const INITIAL: FormState = {
  full_name: '', email: '', phone: '', practice_name: '', city: '', state: '',
  gross_revenue_last_year: '', net_revenue_last_year: '',
  new_patients_per_month_avg_2yr: '', avg_visits_per_patient: '',
  services_provided: [], services_provided_other: '',
  employee_count: '', geographic_location_notes: '',
  owner_role: '',
  past_12mo_was_spike: '',
  ok_to_contact: true,
}

const SERVICES = [
  'Adjustments (manual)',
  'Spinal decompression',
  'Massage therapy',
  'Cold laser / low-level laser',
  'Shockwave therapy',
  'Dry needling',
  'Rehab / corrective exercise',
  'X-ray on-site',
  'Supplements / orthotics retail',
  'Personal injury (PI) cases',
  'Sports / extremity adjusting',
]

// ── Qualification logic (per Wagner's spec) ───────────────────────────────
// Volume floor: 40+ new patients/mo
// Retention: 18+ visit average (closer to his stated 24+ target)
// No suspicious spike in past 12 months
// Owner willing to step out of full clinical (room for medical team to operate)
function qualify(s: FormState): { status: 'qualified' | 'maybe' | 'not_yet'; reasons: string[]; pitch: string } {
  const newPts  = parseInt(s.new_patients_per_month_avg_2yr, 10) || 0
  const visits  = parseInt(s.avg_visits_per_patient, 10) || 0
  const gross   = parseInt(s.gross_revenue_last_year.replace(/[^0-9]/g, ''), 10) || 0
  const spike   = s.past_12mo_was_spike === 'yes'
  const lockedToFullClinical = s.owner_role === 'full_clinical'

  const reasons: string[] = []
  if (newPts >= 40) reasons.push('Hits Wagner\'s 40+/mo new-patient volume floor.')
  if (visits >= 18) reasons.push('Patient retention is in the strong band (24+ visit avg targeted).')
  if (gross >= 750_000) reasons.push('Revenue base is large enough for medical-team economics.')
  if (s.owner_role === 'mostly_management' || s.owner_role === 'wants_to_step_out') {
    reasons.push('Owner is willing to step out of full clinical — room for the medical team to operate.')
  }

  if (spike) {
    return {
      status: 'not_yet',
      reasons: ['Past 12 months looks like a recent spike, not a stable two-year baseline.'],
      pitch: 'We want to see 2-year stability before partnering. Reach out again in 6 months with clean trailing data.',
    }
  }

  if (newPts < 20) {
    return {
      status: 'not_yet',
      reasons: ['New-patient volume below the 20/mo floor needed for the medical-team economics to work.'],
      pitch: 'Let\'s focus on marketing first. We have a $1/day system that can scale you to 40+ new patients per month. Then revisit the partnership.',
    }
  }

  const qualifies = newPts >= 40 && !spike && !lockedToFullClinical
  if (qualifies) {
    return {
      status: 'qualified',
      reasons,
      pitch: 'You qualify. Dr. Wagner\'s team will reach out within 48 hours to walk you through the ChiroPillar partnership — including the medical-team add-on that targets +$250K in your first year.',
    }
  }

  return {
    status: 'maybe',
    reasons: reasons.length ? reasons : ['Some signals are in range; others need a conversation.'],
    pitch: 'You\'re in the conversation zone. Dr. Wagner\'s team will review your numbers and reach out within a week to discuss next steps.',
  }
}

export default function IntakePage() {
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<FormState>(INITIAL)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<ReturnType<typeof qualify> | null>(null)

  const update = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(f => ({ ...f, [k]: e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value }))
  }
  const toggleService = (svc: string) => {
    setForm(f => ({
      ...f,
      services_provided: f.services_provided.includes(svc)
        ? f.services_provided.filter(x => x !== svc)
        : [...f.services_provided, svc],
    }))
  }

  async function handleSubmit() {
    setSubmitting(true)
    const verdict = qualify(form)
    try {
      await fetch('/api/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, qualification: verdict.status, qualification_reasons: verdict.reasons }),
      })
    } catch {
      // Soft-fail — we still show the verdict locally
    }
    setResult(verdict)
    setSubmitting(false)
    setStep(99) // jump to result screen
  }

  const steps = [
    { label: 'Practice', n: 0 },
    { label: 'Revenue',  n: 1 },
    { label: 'Patients', n: 2 },
    { label: 'Services', n: 3 },
    { label: 'Operator', n: 4 },
    { label: 'Submit',   n: 5 },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#F7F4ED', fontFamily: "'Inter', system-ui, sans-serif", color: '#1a1a1a' }}>

      {/* Top bar · ChiroPillar brand lockup on white (logo designed for light bg) */}
      <div style={{ background: 'white', borderBottom: '1px solid rgba(31,78,121,0.10)', boxShadow: '0 2px 8px rgba(31,78,121,0.04)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '20px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
          <a href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }} aria-label="ChiroPillar home">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/chiropillar-logo.png"
              alt="ChiroPillar · Strength in Alignment"
              style={{ height: 64, width: 'auto', display: 'block' }}
            />
          </a>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.18em', color: '#7A6A45', textTransform: 'uppercase', fontWeight: 700, padding: '5px 11px', background: 'rgba(201,168,76,0.10)', border: '1px solid rgba(201,168,76,0.30)', borderRadius: 999 }}>
              Confidential
            </div>
            <div style={{ color: '#1F4E79', fontFamily: 'Georgia, serif', fontSize: 14, fontWeight: 500, fontStyle: 'italic' }}>
              Chiropractor Partnership Application
            </div>
          </div>
        </div>
        <div style={{ height: 4, background: 'linear-gradient(90deg, #1F4E79 0%, #2E75B6 50%, #C9A84C 100%)' }} />
      </div>

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '40px 24px 80px' }}>

        {/* HERO */}
        {step === 0 && (
          <div style={{ marginBottom: 36, textAlign: 'center' }}>
            <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(32px, 4.5vw, 44px)', fontWeight: 700, lineHeight: 1.1, color: '#1F4E79', margin: '0 0 14px', letterSpacing: '-0.02em' }}>
              Earn an extra <span style={{ color: '#C9A84C' }}>$250,000+ a year</span><br />
              doing exactly what you&apos;re already doing.
            </h1>
            <p style={{ fontSize: 18, color: '#555', lineHeight: 1.55, maxWidth: 620, margin: '0 auto 28px' }}>
              Help your patients get better. Be a better doctor for your patients. Raise the value of your practice — without learning a single new technique. The right chiropractors qualify for Dr. Scott Wagner&apos;s medical-operator partnership program. <strong style={{ color: '#1F4E79' }}>Three minutes. See if you qualify.</strong>
            </p>
          </div>
        )}

        {/* Step indicator */}
        {step < 99 && (
          <div style={{ display: 'flex', gap: 6, marginBottom: 32, padding: '0 4px' }}>
            {steps.map(s => (
              <div key={s.n} style={{
                flex: 1, height: 6, borderRadius: 3,
                background: s.n <= step ? '#2E75B6' : 'rgba(31,78,121,0.12)',
                transition: 'background 0.2s',
              }} />
            ))}
          </div>
        )}

        {/* Card wrapper */}
        {step < 99 && (
          <div style={{ background: 'white', borderRadius: 14, padding: 'clamp(20px, 4vw, 36px)', boxShadow: '0 12px 40px rgba(31,78,121,0.08), 0 0 0 1px rgba(31,78,121,0.06)' }}>

            {/* STEP 0: Practice */}
            {step === 0 && (
              <>
                <h2 style={CSS.h2}>Tell us about your practice</h2>
                <div style={CSS.grid2}>
                  <Field label="Your name *"><input value={form.full_name} onChange={update('full_name')} style={CSS.input}/></Field>
                  <Field label="Practice name *"><input value={form.practice_name} onChange={update('practice_name')} style={CSS.input}/></Field>
                  <Field label="Email *"><input type="email" value={form.email} onChange={update('email')} style={CSS.input}/></Field>
                  <Field label="Mobile *"><input type="tel" value={form.phone} onChange={update('phone')} style={CSS.input}/></Field>
                  <Field label="City *"><input value={form.city} onChange={update('city')} style={CSS.input}/></Field>
                  <Field label="State *"><input value={form.state} onChange={update('state')} style={CSS.input} placeholder="TX, FL, VA..."/></Field>
                </div>
              </>
            )}

            {/* STEP 1: Revenue */}
            {step === 1 && (
              <>
                <h2 style={CSS.h2}>Revenue · last full year</h2>
                <p style={CSS.sub}>Round figures are fine. We&apos;ll verify against bank statements + tax returns if you move forward — no need for exact numbers here.</p>
                <div style={CSS.grid2}>
                  <Field label="Gross revenue (last year)">
                    <input value={form.gross_revenue_last_year} onChange={update('gross_revenue_last_year')} placeholder="$1,250,000" style={CSS.input}/>
                  </Field>
                  <Field label="Net revenue / take-home (after expenses)">
                    <input value={form.net_revenue_last_year} onChange={update('net_revenue_last_year')} placeholder="$350,000" style={CSS.input}/>
                  </Field>
                  <Field label="# of employees (full + part-time)">
                    <input value={form.employee_count} onChange={update('employee_count')} placeholder="6" style={CSS.input}/>
                  </Field>
                  <Field label="Years in business">
                    <input value={form.geographic_location_notes} onChange={update('geographic_location_notes')} placeholder="22 years" style={CSS.input}/>
                  </Field>
                </div>
              </>
            )}

            {/* STEP 2: Patients */}
            {step === 2 && (
              <>
                <h2 style={CSS.h2}>Patient flow</h2>
                <p style={CSS.sub}>Wagner&apos;s diagnostic-medical-team model needs steady volume, not a recent spike. Both fields below should reflect a <strong>2-year average</strong>, not just last month.</p>
                <div style={CSS.grid2}>
                  <Field label="New patients per month · 2-yr average">
                    <input value={form.new_patients_per_month_avg_2yr} onChange={update('new_patients_per_month_avg_2yr')} placeholder="48" style={CSS.input}/>
                  </Field>
                  <Field label="Average # visits per patient (retention)">
                    <input value={form.avg_visits_per_patient} onChange={update('avg_visits_per_patient')} placeholder="22" style={CSS.input}/>
                  </Field>
                </div>
                <Field label="Has the last 12 months been a normal year, or an unusual spike?">
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 6 }}>
                    {[
                      ['no', 'Steady — last 12 mo looks like the prior year'],
                      ['unsure', 'About the same, maybe a little better'],
                      ['yes', 'Honest answer: last 12 mo was a clear spike vs prior years'],
                    ].map(([val, label]) => (
                      <label key={val} style={{
                        flex: '1 1 200px', padding: '12px 14px',
                        background: form.past_12mo_was_spike === val ? 'rgba(46,117,182,0.08)' : 'white',
                        border: form.past_12mo_was_spike === val ? '2px solid #2E75B6' : '1px solid rgba(31,78,121,0.15)',
                        borderRadius: 8, cursor: 'pointer', fontSize: 13, lineHeight: 1.4,
                      }}>
                        <input
                          type="radio"
                          name="spike"
                          value={val}
                          checked={form.past_12mo_was_spike === val}
                          onChange={() => setForm(f => ({ ...f, past_12mo_was_spike: val as FormState['past_12mo_was_spike'] }))}
                          style={{ marginRight: 8 }}
                        />
                        {label}
                      </label>
                    ))}
                  </div>
                </Field>
              </>
            )}

            {/* STEP 3: Services */}
            {step === 3 && (
              <>
                <h2 style={CSS.h2}>Services you currently provide</h2>
                <p style={CSS.sub}>Check all that apply. We&apos;re looking at what you bill for today vs what the medical-team add-on can layer on top.</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
                  {SERVICES.map(svc => {
                    const on = form.services_provided.includes(svc)
                    return (
                      <label key={svc} style={{
                        padding: '10px 14px',
                        background: on ? 'rgba(46,117,182,0.08)' : 'white',
                        border: on ? '2px solid #2E75B6' : '1px solid rgba(31,78,121,0.15)',
                        borderRadius: 8, cursor: 'pointer', fontSize: 13.5, display: 'flex', alignItems: 'center', gap: 8,
                      }}>
                        <input type="checkbox" checked={on} onChange={() => toggleService(svc)} />
                        {svc}
                      </label>
                    )
                  })}
                </div>
                <Field label="Anything else (optional)">
                  <input value={form.services_provided_other} onChange={update('services_provided_other')} placeholder="DOT physicals, work comp, etc." style={CSS.input}/>
                </Field>
              </>
            )}

            {/* STEP 4: Operator */}
            {step === 4 && (
              <>
                <h2 style={CSS.h2}>Your role today</h2>
                <p style={CSS.sub}>Honest answer wins. The partnership works best when there&apos;s room for the medical team to handle diagnostic + Medicare-billable workflows you can&apos;t today.</p>
                <div style={{ display: 'grid', gap: 10 }}>
                  {[
                    { v: 'full_clinical', label: 'I am the practice. I adjust patients all day, every day. No one else does what I do here.' },
                    { v: 'mostly_clinical_some_management', label: 'I adjust most of the day but spend ~10 hrs/wk on management.' },
                    { v: 'mostly_management', label: 'I have associate DCs doing most adjustments. I run the business + see select patients.' },
                    { v: 'wants_to_step_out', label: 'I want to step out of clinical care entirely or partially within the next 24 months.' },
                  ].map(opt => (
                    <label key={opt.v} style={{
                      padding: '14px 16px',
                      background: form.owner_role === opt.v ? 'rgba(46,117,182,0.08)' : 'white',
                      border: form.owner_role === opt.v ? '2px solid #2E75B6' : '1px solid rgba(31,78,121,0.15)',
                      borderRadius: 8, cursor: 'pointer', fontSize: 14, lineHeight: 1.45, display: 'flex', alignItems: 'flex-start', gap: 12,
                    }}>
                      <input
                        type="radio"
                        name="owner_role"
                        value={opt.v}
                        checked={form.owner_role === opt.v}
                        onChange={() => setForm(f => ({ ...f, owner_role: opt.v as FormState['owner_role'] }))}
                        style={{ marginTop: 3 }}
                      />
                      <span>{opt.label}</span>
                    </label>
                  ))}
                </div>
              </>
            )}

            {/* STEP 5: Submit */}
            {step === 5 && (
              <>
                <h2 style={CSS.h2}>See if you qualify</h2>
                <p style={CSS.sub}>Hit submit and we&apos;ll score your practice against Dr. Wagner&apos;s qualification criteria. Qualified practices get a direct call from his team within 48 hours.</p>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: 14, background: '#F7F4ED', borderRadius: 8, fontSize: 13, lineHeight: 1.5, marginBottom: 20 }}>
                  <input type="checkbox" checked={form.ok_to_contact} onChange={update('ok_to_contact')} style={{ marginTop: 4 }}/>
                  <span>OK to contact me by phone, email, and text about the ChiroPillar partnership program. We never spam and never share your info.</span>
                </label>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting || !form.full_name || !form.email || !form.ok_to_contact}
                  style={{
                    width: '100%', padding: '16px 24px',
                    background: submitting ? '#9CC4E4' : '#1F4E79',
                    color: 'white', border: 'none', borderRadius: 8,
                    fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 700, letterSpacing: '0.14em',
                    textTransform: 'uppercase', cursor: submitting ? 'wait' : 'pointer',
                  }}
                >
                  {submitting ? 'Scoring…' : 'See If I Qualify →'}
                </button>
              </>
            )}

            {/* Nav buttons */}
            {step < 5 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 32, gap: 12 }}>
                <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0} style={{ ...CSS.btnGhost, opacity: step === 0 ? 0.3 : 1 }}>← Back</button>
                <button onClick={() => setStep(s => s + 1)} style={CSS.btnPrimary}>Continue →</button>
              </div>
            )}
          </div>
        )}

        {/* RESULT SCREEN */}
        {step === 99 && result && (
          <div style={{
            background: 'white', borderRadius: 14, padding: 40,
            boxShadow: '0 12px 40px rgba(31,78,121,0.08), 0 0 0 1px rgba(31,78,121,0.06)',
            textAlign: 'center',
          }}>
            <div style={{
              display: 'inline-block', padding: '6px 16px',
              background: result.status === 'qualified' ? '#2ECC8B' : result.status === 'maybe' ? '#C9A84C' : '#9BA8C0',
              color: result.status === 'qualified' ? 'white' : result.status === 'maybe' ? '#5A4A1A' : 'white',
              borderRadius: 999, fontFamily: "'JetBrains Mono', monospace", fontSize: 11,
              letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 24,
            }}>
              {result.status === 'qualified' ? '✓ You Qualify' : result.status === 'maybe' ? '◐ In The Conversation' : '◯ Not Yet'}
            </div>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 30, color: '#1F4E79', margin: '0 0 16px', letterSpacing: '-0.02em' }}>
              {result.status === 'qualified' && 'Welcome to the ChiroPillar shortlist.'}
              {result.status === 'maybe' && 'Strong signals — let\'s talk.'}
              {result.status === 'not_yet' && 'Not the right fit yet — here\'s the path.'}
            </h2>
            <p style={{ fontSize: 16, color: '#444', lineHeight: 1.6, marginBottom: 28 }}>{result.pitch}</p>

            {result.reasons.length > 0 && (
              <div style={{ background: '#F7F4ED', borderRadius: 10, padding: 22, marginBottom: 24, textAlign: 'left' }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.18em', color: '#7A6A45', textTransform: 'uppercase', fontWeight: 700, marginBottom: 12 }}>
                  What we noticed
                </div>
                <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14, color: '#444', lineHeight: 1.7 }}>
                  {result.reasons.map((r, i) => <li key={i}>{r}</li>)}
                </ul>
              </div>
            )}

            <div style={{ fontSize: 13, color: '#7A8AA8', fontFamily: "'JetBrains Mono', monospace" }}>
              Reference ID: CP-{Date.now().toString(36).toUpperCase()}
            </div>
          </div>
        )}

        {/* Footer disclaimer */}
        <div style={{ marginTop: 32, fontSize: 11, color: '#999', fontFamily: "'JetBrains Mono', monospace", textAlign: 'center', lineHeight: 1.6 }}>
          ChiroPillar · Wagner Family Office · Confidential application form.<br/>
          Submission does not create a binding partnership offer. All financial structures subject to definitive documentation.
        </div>
      </div>
    </div>
  )
}

// ── Field helper ──────────────────────────────────────────────────────────
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: 'block', marginBottom: 18 }}>
      <div style={{ fontSize: 12, color: '#1F4E79', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 6 }}>{label}</div>
      {children}
    </label>
  )
}

const CSS = {
  h2: { fontFamily: 'Georgia, serif', fontSize: 26, fontWeight: 700, color: '#1F4E79', letterSpacing: '-0.01em', margin: '0 0 8px' } as React.CSSProperties,
  sub: { fontSize: 14, color: '#666', lineHeight: 1.55, margin: '0 0 22px' } as React.CSSProperties,
  grid2: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 } as React.CSSProperties,
  input: { width: '100%', padding: '11px 14px', fontSize: 15, border: '1px solid rgba(31,78,121,0.20)', borderRadius: 7, outline: 'none', fontFamily: 'inherit', color: '#1a1a1a', background: 'white', boxSizing: 'border-box' } as React.CSSProperties,
  btnPrimary: { padding: '12px 26px', background: '#1F4E79', color: 'white', border: 'none', borderRadius: 7, fontFamily: "'JetBrains Mono', monospace", fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase' as const, fontWeight: 700, cursor: 'pointer' } as React.CSSProperties,
  btnGhost: { padding: '12px 22px', background: 'white', color: '#1F4E79', border: '1px solid #1F4E79', borderRadius: 7, fontFamily: "'JetBrains Mono', monospace", fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase' as const, fontWeight: 700, cursor: 'pointer' } as React.CSSProperties,
}
