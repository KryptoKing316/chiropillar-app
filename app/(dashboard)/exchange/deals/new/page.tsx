'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

// ---------------------------------------------------------------------------
// New Deal Wizard — 3-step flow for dealmakers listing into the KB Exchange
// Step 1 · Public Card    (what brokers + buyers see in the Exchange feed)
// Step 2 · Deal Mechanics (financials, structure, valuation drivers)
// Step 3 · Confidential   (identity, CIM PDF — NDA-locked)
//
// Right-rail live preview shows the public listing card as it would appear
// in the Exchange — updates as the user types.
// ---------------------------------------------------------------------------

const INDUSTRIES = [
  'HVAC', 'Plumbing', 'Electrical', 'Roofing', 'Specialty Contracting',
  'Manufacturing — Metal Fab', 'Manufacturing — CNC / Machining',
  'Manufacturing — Plastics', 'Manufacturing — Other',
  'Construction', 'Landscape Services', 'Pool Services', 'Pest Control',
  'Auto Repair', 'Body Shop', 'Dental Practice', 'Medical / Healthcare',
  'Veterinary', 'Food Distribution', 'Environmental Services',
  'Waste Management', 'Cleaning Services', 'Other Trades', 'Other',
]

const REVENUE_BANDS = ['Under $1M', '$1M–$3M', '$3M–$5M', '$5M–$10M', '$10M–$20M', '$20M–$50M', '$50M–$100M', '$100M+']
const EBITDA_BANDS = ['Under $250K', '$250K–$500K', '$500K–$1M', '$1M–$2M', '$2M–$5M', '$5M–$10M', '$10M+']
const TEAM_BANDS = ['Under 10', '10–25', '25–50', '50–100', '100–250', '250+']
const STRUCTURES = ['Open to all', 'Asset sale only', 'Stock sale only', 'Earnout / seller financing OK', 'No earnout', 'SBA-friendly', 'Rollover equity desired']
const TIMING = ['Ready now', '30–60 days', '60–90 days', '90+ days', 'Exploring only']

type StepId = 1 | 2 | 3

const STEPS: { id: StepId; label: string; sub: string }[] = [
  { id: 1, label: 'Public Card',  sub: 'What brokers + buyers see' },
  { id: 2, label: 'Deal Mechanics', sub: 'Financials + structure' },
  { id: 3, label: 'Confidential', sub: 'Identity + CIM upload' },
]

export default function NewDealPage() {
  const router = useRouter()
  const [step, setStep] = useState<StepId>(1)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  // ── Step 1 · Public Card ──
  const [publicTitle, setPublicTitle] = useState('')
  const [publicSummary, setPublicSummary] = useState('')
  const [industry, setIndustry] = useState('')
  const [cityRegion, setCityRegion] = useState('')
  const [stateCode, setStateCode] = useState('TX')
  const [yearsInBusiness, setYearsInBusiness] = useState('')
  const [teamSizeBand, setTeamSizeBand] = useState('')

  // ── Step 2 · Deal Mechanics ──
  const [revenueBand, setRevenueBand] = useState('')
  const [ebitdaBand, setEbitdaBand] = useState('')
  const [askingPriceBand, setAskingPriceBand] = useState('')
  const [structurePref, setStructurePref] = useState('')
  const [timing, setTiming] = useState('')
  const [growthRate, setGrowthRate] = useState('')
  const [recurringPct, setRecurringPct] = useState('')

  // ── Step 3 · Confidential ──
  const [businessName, setBusinessName] = useState('')
  const [ownerName, setOwnerName] = useState('')
  const [cimFile, setCimFile] = useState<File | null>(null)

  // ── Computed helpers ──
  const completionPct = useMemo(() => {
    const required = [publicTitle, industry, revenueBand, ebitdaBand]
    const optional = [publicSummary, cityRegion, yearsInBusiness, teamSizeBand, askingPriceBand, structurePref, timing, growthRate, recurringPct, businessName, ownerName]
    const reqDone = required.filter(Boolean).length / required.length
    const optDone = optional.filter(Boolean).length / optional.length
    return Math.round((reqDone * 0.7 + optDone * 0.3) * 100)
  }, [publicTitle, industry, revenueBand, ebitdaBand, publicSummary, cityRegion, yearsInBusiness, teamSizeBand, askingPriceBand, structurePref, timing, growthRate, recurringPct, businessName, ownerName])

  const canAdvance = useMemo(() => {
    if (step === 1) return !!publicTitle && !!industry
    if (step === 2) return !!revenueBand && !!ebitdaBand
    return true
  }, [step, publicTitle, industry, revenueBand, ebitdaBand])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setErr(null)

    try {
      const fd = new FormData()
      fd.append('public_title', publicTitle)
      fd.append('public_summary', publicSummary)
      fd.append('industry', industry)
      fd.append('city_region', cityRegion)
      fd.append('state', stateCode)
      fd.append('revenue_band', revenueBand)
      fd.append('ebitda_band', ebitdaBand)
      fd.append('asking_price_band', askingPriceBand)
      fd.append('years_in_business', yearsInBusiness)
      fd.append('team_size_band', teamSizeBand)
      fd.append('private_business_name', businessName)
      fd.append('private_owner_name', ownerName)
      if (cimFile) fd.append('cim_pdf', cimFile)

      const res = await fetch('/api/exchange/deals', { method: 'POST', body: fd })
      if (!res.ok) {
        const e = await res.json().catch(() => ({}))
        throw new Error(e.error || 'Failed to create deal')
      }
      const { id } = await res.json()
      router.push(`/exchange/deals/${id}`)
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Unknown error')
      setBusy(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--kb-bg)', color: 'var(--kb-text)', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 36px 80px' }}>

        {/* ── Back link ── */}
        <div style={{ marginBottom: '14px' }}>
          <Link href="/exchange" style={{ fontSize: '12px', color: 'var(--kb-text-muted)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ color: '#C9A84C' }}>←</span> Back to Exchange
          </Link>
        </div>

        {/* ── Header ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '24px', marginBottom: '28px', flexWrap: 'wrap' }}>
          <div>
            <div style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: '10px',
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: '#C9A84C',
              marginBottom: '6px',
            }}>
              KB Exchange · List a Deal
            </div>
            <h1 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(28px, 4vw, 38px)',
              fontWeight: 700,
              color: 'var(--kb-text)',
              margin: 0,
              lineHeight: 1.1,
              letterSpacing: '-0.015em',
            }}>
              Bring it to the bench.{' '}
              <span style={{ color: '#C9A84C', fontStyle: 'italic' }}>The right buyer is one NDA away.</span>
            </h1>
            <p style={{ fontSize: '14.5px', color: 'var(--kb-text-secondary)', margin: '8px 0 0', maxWidth: '640px' }}>
              List a deal publicly (anonymized), and NDA-vetted brokers + buyers can request access to the confidential details. AI valuation runs in 60 seconds against 25-industry comp data.
            </p>
          </div>

          {/* Completion meter */}
          <div style={{
            background: 'var(--kb-bg-card)',
            border: '1px solid var(--kb-border)',
            borderRadius: '12px',
            padding: '14px 18px',
            minWidth: '200px',
          }}>
            <div style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: '10px',
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: 'var(--kb-text-secondary)',
              marginBottom: '6px',
            }}>
              Completion
            </div>
            <div style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '24px',
              fontWeight: 700,
              color: completionPct >= 80 ? '#2ECC8B' : completionPct >= 40 ? '#C9A84C' : 'var(--kb-text-secondary)',
              lineHeight: 1,
              marginBottom: '8px',
            }}>
              {completionPct}%
            </div>
            <div style={{ height: '4px', background: 'var(--kb-bg-raised)', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{
                width: `${completionPct}%`,
                height: '100%',
                background: completionPct >= 80 ? 'linear-gradient(90deg, #2ECC8B, #3DDDA0)' : 'linear-gradient(90deg, #C9A84C, #E8C96A)',
                transition: 'width 0.3s ease',
              }} />
            </div>
          </div>
        </div>

        {/* ── Step Navigation ── */}
        <div style={{
          display: 'flex',
          gap: '4px',
          background: 'var(--kb-bg-raised)',
          borderRadius: '12px',
          padding: '4px',
          width: 'fit-content',
          marginBottom: '24px',
          flexWrap: 'wrap',
        }}>
          {STEPS.map((s) => {
            const isActive = step === s.id
            const isComplete = step > s.id
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setStep(s.id)}
                style={{
                  padding: '10px 18px',
                  borderRadius: '9px',
                  border: 'none',
                  background: isActive ? '#C9A84C' : 'transparent',
                  color: isActive ? 'var(--kb-bg)' : isComplete ? '#2ECC8B' : 'var(--kb-text-secondary)',
                  fontSize: '13px',
                  fontWeight: isActive ? 700 : 500,
                  fontFamily: "'Inter', system-ui, sans-serif",
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s',
                }}
              >
                <span style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  background: isActive ? 'rgba(11,27,62,0.25)' : isComplete ? 'rgba(46,204,139,0.15)' : 'rgba(255,255,255,0.06)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px',
                  fontFamily: "'DM Mono', monospace",
                  fontWeight: 700,
                }}>
                  {isComplete ? '✓' : s.id}
                </span>
                {s.label}
              </button>
            )
          })}
        </div>

        <form onSubmit={submit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 360px', gap: '32px', alignItems: 'start' }}>

            {/* ── Left · Form steps ── */}
            <div>
              {step === 1 && (
                <Section
                  badge="Step 1 · Public Card"
                  title="Make the bench want to know more."
                  description="This is what shows in the public Exchange feed. Anonymize aggressively — the goal is to attract the right buyer to ask for the NDA."
                  accent="#C9A84C"
                >
                  <Field label="Public Title" required hint="Anchor with industry + geography + revenue band. Hide the company name.">
                    <input
                      value={publicTitle}
                      onChange={(e) => setPublicTitle(e.target.value)}
                      placeholder="Profitable HVAC Operator · DFW Metro · $5–10M Revenue"
                      style={input}
                      required
                    />
                  </Field>

                  <Field label="Public Summary" hint="1–2 sentences. Hooks: years in biz, customer base, owner status, reason for sale.">
                    <textarea
                      value={publicSummary}
                      onChange={(e) => setPublicSummary(e.target.value)}
                      placeholder="35-year residential HVAC operator in N. Texas. 3,000+ verified Google reviews. Owner retiring; team + customer base stable."
                      rows={3}
                      style={{ ...input, fontFamily: "'Inter', system-ui, sans-serif", resize: 'vertical' }}
                    />
                  </Field>

                  <div style={twoCol}>
                    <Field label="Industry" required>
                      <select value={industry} onChange={(e) => setIndustry(e.target.value)} style={input} required>
                        <option value="">Select…</option>
                        {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
                      </select>
                    </Field>
                    <Field label="City / Region">
                      <input
                        value={cityRegion}
                        onChange={(e) => setCityRegion(e.target.value)}
                        placeholder="DFW Metro · North Texas"
                        style={input}
                      />
                    </Field>
                  </div>

                  <div style={threeCol}>
                    <Field label="State">
                      <input value={stateCode} onChange={(e) => setStateCode(e.target.value.toUpperCase().slice(0, 2))} maxLength={2} style={input} />
                    </Field>
                    <Field label="Years in Business">
                      <input type="number" value={yearsInBusiness} onChange={(e) => setYearsInBusiness(e.target.value)} placeholder="35" style={input} />
                    </Field>
                    <Field label="Team Size">
                      <select value={teamSizeBand} onChange={(e) => setTeamSizeBand(e.target.value)} style={input}>
                        <option value="">Select…</option>
                        {TEAM_BANDS.map((b) => <option key={b} value={b}>{b}</option>)}
                      </select>
                    </Field>
                  </div>
                </Section>
              )}

              {step === 2 && (
                <Section
                  badge="Step 2 · Deal Mechanics"
                  title="Numbers + structure."
                  description="The financial shape of the deal. Stay in ranges — the buyer will see exact figures only after NDA approval."
                  accent="#5BB8F5"
                >
                  <div style={threeCol}>
                    <Field label="Revenue Band" required>
                      <select value={revenueBand} onChange={(e) => setRevenueBand(e.target.value)} style={input} required>
                        <option value="">Select…</option>
                        {REVENUE_BANDS.map((b) => <option key={b} value={b}>{b}</option>)}
                      </select>
                    </Field>
                    <Field label="EBITDA Band" required>
                      <select value={ebitdaBand} onChange={(e) => setEbitdaBand(e.target.value)} style={input} required>
                        <option value="">Select…</option>
                        {EBITDA_BANDS.map((b) => <option key={b} value={b}>{b}</option>)}
                      </select>
                    </Field>
                    <Field label="Asking Price Band">
                      <select value={askingPriceBand} onChange={(e) => setAskingPriceBand(e.target.value)} style={input}>
                        <option value="">Select…</option>
                        {REVENUE_BANDS.map((b) => <option key={b} value={b}>{b}</option>)}
                      </select>
                    </Field>
                  </div>

                  <div style={twoCol}>
                    <Field label="Deal Structure Preference">
                      <select value={structurePref} onChange={(e) => setStructurePref(e.target.value)} style={input}>
                        <option value="">Select…</option>
                        {STRUCTURES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </Field>
                    <Field label="Seller Timing">
                      <select value={timing} onChange={(e) => setTiming(e.target.value)} style={input}>
                        <option value="">Select…</option>
                        {TIMING.map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </Field>
                  </div>

                  <div style={twoCol}>
                    <Field label="3-Yr Revenue Growth (%)" hint="Optional but powerful. Buyers filter on this.">
                      <input
                        type="number"
                        value={growthRate}
                        onChange={(e) => setGrowthRate(e.target.value)}
                        placeholder="12"
                        style={input}
                      />
                    </Field>
                    <Field label="Recurring Revenue (%)" hint="Maintenance contracts, subscriptions, repeat customers.">
                      <input
                        type="number"
                        value={recurringPct}
                        onChange={(e) => setRecurringPct(e.target.value)}
                        placeholder="35"
                        style={input}
                      />
                    </Field>
                  </div>

                  <div style={{
                    marginTop: '20px',
                    padding: '14px 16px',
                    background: 'rgba(46,204,139,0.06)',
                    border: '1px solid rgba(46,204,139,0.22)',
                    borderRadius: '10px',
                    fontSize: '12.5px',
                    color: 'var(--kb-text-secondary)',
                    lineHeight: 1.6,
                  }}>
                    <strong style={{ color: '#2ECC8B' }}>💡 Smart-fill:</strong> Once you upload a CIM on Step 3, the KB Engine will auto-extract financials and pre-fill missing fields. Skip what you don&rsquo;t know — the AI will fill it in.
                  </div>
                </Section>
              )}

              {step === 3 && (
                <Section
                  badge="Step 3 · Confidential"
                  title="NDA-locked details."
                  description="Only visible to Exchange brokers + buyers after they request access and you approve their NDA. Everything below stays locked until then."
                  accent="#C9A84C"
                  locked
                >
                  <Field label="Business Name (legal)">
                    <input
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="A/C Unlimited, Inc."
                      style={input}
                    />
                  </Field>

                  <Field label="Owner Name">
                    <input
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      placeholder="Troy Fewell"
                      style={input}
                    />
                  </Field>

                  <Field label="Upload CIM (PDF)" hint="AI extracts financials + runs NAICS-keyed valuation in ~60 seconds.">
                    <label style={{
                      display: 'block',
                      border: '2px dashed var(--kb-border)',
                      borderRadius: '12px',
                      padding: '28px 20px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      background: cimFile ? 'rgba(46,204,139,0.05)' : 'var(--kb-bg-raised)',
                      transition: 'background 0.2s, border 0.2s',
                    }}>
                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={(e) => setCimFile(e.target.files?.[0] ?? null)}
                        style={{ display: 'none' }}
                      />
                      {cimFile ? (
                        <>
                          <div style={{ fontSize: '14px', color: '#2ECC8B', fontWeight: 600, marginBottom: '4px' }}>
                            ✓ {cimFile.name}
                          </div>
                          <div style={{ fontSize: '11.5px', color: 'var(--kb-text-muted)' }}>
                            {(cimFile.size / 1024 / 1024).toFixed(2)} MB · Click to replace
                          </div>
                        </>
                      ) : (
                        <>
                          <div style={{ fontSize: '14px', color: 'var(--kb-text)', marginBottom: '4px' }}>
                            Drop CIM PDF here or <span style={{ color: '#C9A84C', textDecoration: 'underline' }}>click to browse</span>
                          </div>
                          <div style={{ fontSize: '11.5px', color: 'var(--kb-text-muted)' }}>
                            AI will extract financials + run valuation
                          </div>
                        </>
                      )}
                    </label>
                  </Field>

                  <div style={{
                    marginTop: '14px',
                    padding: '12px 14px',
                    background: 'rgba(201,168,76,0.06)',
                    border: '1px solid rgba(201,168,76,0.20)',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: 'var(--kb-text-secondary)',
                    lineHeight: 1.6,
                  }}>
                    <strong style={{ color: '#C9A84C' }}>🔒 Encryption + Storage:</strong> CIM files are encrypted-at-rest in Supabase Storage. Only NDA-approved buyers + Exchange brokers can request access; you approve each request individually.
                  </div>
                </Section>
              )}

              {/* Error display */}
              {err && (
                <div style={{
                  marginTop: '20px',
                  padding: '14px 18px',
                  background: 'rgba(232,73,73,0.10)',
                  border: '1px solid rgba(232,73,73,0.30)',
                  borderRadius: '10px',
                  color: '#E84949',
                  fontSize: '13.5px',
                }}>
                  {err}
                </div>
              )}

              {/* Step controls */}
              <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => step > 1 && setStep((step - 1) as StepId)}
                  disabled={step === 1}
                  style={{
                    padding: '12px 22px',
                    background: 'transparent',
                    color: step === 1 ? 'var(--kb-text-muted)' : 'var(--kb-text)',
                    border: '1px solid var(--kb-border)',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 500,
                    fontFamily: "'Inter', system-ui, sans-serif",
                    cursor: step === 1 ? 'not-allowed' : 'pointer',
                    opacity: step === 1 ? 0.4 : 1,
                  }}
                >
                  ← Back
                </button>

                {step < 3 ? (
                  <button
                    type="button"
                    onClick={() => canAdvance && setStep((step + 1) as StepId)}
                    disabled={!canAdvance}
                    style={{
                      padding: '12px 26px',
                      background: canAdvance ? '#C9A84C' : 'rgba(201,168,76,0.25)',
                      color: canAdvance ? '#0B1B3E' : 'rgba(11,27,62,0.5)',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: 700,
                      fontFamily: "'Inter', system-ui, sans-serif",
                      cursor: canAdvance ? 'pointer' : 'not-allowed',
                      boxShadow: canAdvance ? '0 6px 16px rgba(201,168,76,0.25)' : 'none',
                      transition: 'transform 0.12s, box-shadow 0.15s',
                    }}
                  >
                    Continue → {STEPS[step].label}
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={busy}
                    style={{
                      padding: '12px 28px',
                      background: busy ? 'rgba(46,204,139,0.4)' : 'linear-gradient(90deg, #2ECC8B, #3DDDA0)',
                      color: '#0B1B3E',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: 700,
                      fontFamily: "'Inter', system-ui, sans-serif",
                      cursor: busy ? 'not-allowed' : 'pointer',
                      boxShadow: busy ? 'none' : '0 6px 16px rgba(46,204,139,0.30)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    {busy ? 'Listing…' : (
                      <>
                        <span>⚡</span>
                        List Deal + Run AI Valuation
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* ── Right · Live Public Card Preview ── */}
            <div style={{ position: 'sticky', top: '24px' }}>
              <div style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: '10px',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: '#C9A84C',
                marginBottom: '10px',
              }}>
                Live Preview · Public Card
              </div>

              <div style={{
                background: 'linear-gradient(180deg, var(--kb-bg-card), var(--kb-bg-panel))',
                border: '1px solid rgba(201,168,76,0.25)',
                borderRadius: '14px',
                padding: '22px',
                fontFamily: "'DM Sans', system-ui, sans-serif",
                boxShadow: '0 20px 50px -20px rgba(0,0,0,0.4)',
              }}>
                {/* Listing badge */}
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(46,204,139,0.10)',
                  border: '1px solid rgba(46,204,139,0.25)',
                  borderRadius: '999px',
                  padding: '3px 10px',
                  fontSize: '10px',
                  fontFamily: "'DM Mono', monospace",
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: '#2ECC8B',
                  marginBottom: '12px',
                }}>
                  <span style={{ width: '5px', height: '5px', background: '#2ECC8B', borderRadius: '50%' }} />
                  Live · NDA Required for Details
                </div>

                {/* Title */}
                <div style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: '20px',
                  fontWeight: 700,
                  color: 'var(--kb-text)',
                  lineHeight: 1.2,
                  marginBottom: '6px',
                  minHeight: '24px',
                }}>
                  {publicTitle || <span style={{ color: 'var(--kb-text-muted)', fontStyle: 'italic', fontSize: '14px', fontFamily: "'Inter', sans-serif" }}>Listing title appears here…</span>}
                </div>

                {/* Industry chip + location */}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
                  {industry && (
                    <span style={{
                      fontSize: '10.5px',
                      padding: '3px 8px',
                      background: 'rgba(201,168,76,0.10)',
                      border: '1px solid rgba(201,168,76,0.25)',
                      borderRadius: '5px',
                      color: '#C9A84C',
                      fontWeight: 600,
                    }}>
                      {industry}
                    </span>
                  )}
                  {(cityRegion || stateCode) && (
                    <span style={{
                      fontSize: '10.5px',
                      padding: '3px 8px',
                      background: 'rgba(91,184,245,0.10)',
                      border: '1px solid rgba(91,184,245,0.25)',
                      borderRadius: '5px',
                      color: '#5BB8F5',
                      fontWeight: 600,
                    }}>
                      {cityRegion}{cityRegion && stateCode && ', '}{stateCode}
                    </span>
                  )}
                </div>

                {/* Summary */}
                <div style={{
                  fontSize: '13px',
                  color: 'var(--kb-text-secondary)',
                  lineHeight: 1.55,
                  marginBottom: '16px',
                  minHeight: '36px',
                }}>
                  {publicSummary || <span style={{ color: 'var(--kb-text-muted)', fontStyle: 'italic' }}>Summary appears here…</span>}
                </div>

                {/* Metrics grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '6px',
                  marginBottom: '14px',
                }}>
                  {[
                    { l: 'Revenue', v: revenueBand || '—' },
                    { l: 'EBITDA', v: ebitdaBand || '—' },
                    { l: 'Asking', v: askingPriceBand || '—' },
                  ].map((m, i) => (
                    <div key={i} style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid var(--kb-border-subtle)',
                      borderRadius: '6px',
                      padding: '8px 10px',
                    }}>
                      <div style={{
                        fontSize: '8.5px',
                        letterSpacing: '0.16em',
                        textTransform: 'uppercase',
                        color: 'var(--kb-text-muted)',
                        fontFamily: "'DM Mono', monospace",
                        marginBottom: '2px',
                      }}>
                        {m.l}
                      </div>
                      <div style={{
                        fontSize: '12.5px',
                        fontWeight: 700,
                        color: m.v === '—' ? 'var(--kb-text-muted)' : '#C9A84C',
                        fontFamily: "'Playfair Display', serif",
                      }}>
                        {m.v}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer row */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '10.5px',
                  fontFamily: "'DM Mono', monospace",
                  letterSpacing: '0.12em',
                  color: 'var(--kb-text-muted)',
                  paddingTop: '12px',
                  borderTop: '1px solid var(--kb-border-subtle)',
                }}>
                  <span>
                    {yearsInBusiness && `${yearsInBusiness}yr · `}
                    {teamSizeBand && `Team ${teamSizeBand} · `}
                    {timing && timing}
                  </span>
                  <span style={{ color: '#C9A84C' }}>Request NDA →</span>
                </div>
              </div>

              {/* Helper text */}
              <div style={{
                marginTop: '14px',
                padding: '12px 14px',
                background: 'rgba(91,184,245,0.06)',
                border: '1px solid rgba(91,184,245,0.18)',
                borderRadius: '10px',
                fontSize: '12px',
                color: 'var(--kb-text-secondary)',
                lineHeight: 1.55,
              }}>
                This card updates live as you type. <strong style={{ color: 'var(--kb-text)' }}>Tighten the title</strong> and add the summary first — those drive 80% of NDA requests.
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Styled subcomponents ─────────────────────────────────────────────────

const input: React.CSSProperties = {
  width: '100%',
  background: 'var(--kb-bg-raised)',
  border: '1px solid var(--kb-border)',
  borderRadius: '8px',
  padding: '11px 14px',
  fontSize: '14px',
  color: 'var(--kb-text)',
  fontFamily: "'Inter', system-ui, sans-serif",
  outline: 'none',
  transition: 'border-color 0.15s',
}
const twoCol: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }
const threeCol: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }

function Section({ badge, title, description, children, accent, locked }: {
  badge: string
  title: string
  description: string
  children: React.ReactNode
  accent: string
  locked?: boolean
}) {
  return (
    <section style={{
      background: 'var(--kb-bg-card)',
      border: locked ? `1px solid ${accent}55` : '1px solid var(--kb-border)',
      borderRadius: '16px',
      padding: '28px 28px 24px',
      position: 'relative',
    }}>
      {locked && (
        <div style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
          fontSize: '10px',
          fontFamily: "'DM Mono', monospace",
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          color: accent,
          padding: '3px 10px',
          background: `${accent}15`,
          border: `1px solid ${accent}40`,
          borderRadius: '999px',
        }}>
          🔒 NDA-locked
        </div>
      )}
      <div style={{
        fontFamily: "'DM Mono', monospace",
        fontSize: '10px',
        letterSpacing: '0.22em',
        textTransform: 'uppercase',
        color: accent,
        marginBottom: '8px',
      }}>
        {badge}
      </div>
      <h2 style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: '24px',
        fontWeight: 700,
        color: 'var(--kb-text)',
        margin: 0,
        lineHeight: 1.15,
      }}>
        {title}
      </h2>
      <p style={{ fontSize: '13.5px', color: 'var(--kb-text-secondary)', margin: '6px 0 22px', lineHeight: 1.55 }}>
        {description}
      </p>
      {children}
    </section>
  )
}

function Field({ label, required, hint, children }: {
  label: string
  required?: boolean
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div style={{ marginBottom: '14px' }}>
      <label style={{
        display: 'block',
        fontSize: '11px',
        fontFamily: "'DM Mono', monospace",
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        color: 'var(--kb-text-secondary)',
        fontWeight: 600,
        marginBottom: '6px',
      }}>
        {label} {required && <span style={{ color: '#C9A84C' }}>*</span>}
      </label>
      {children}
      {hint && (
        <div style={{ fontSize: '11.5px', color: 'var(--kb-text-muted)', marginTop: '5px', lineHeight: 1.5 }}>
          {hint}
        </div>
      )}
    </div>
  )
}
