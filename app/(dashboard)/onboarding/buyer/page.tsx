'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

const INDUSTRIES = [
  'HVAC / Mechanical', 'Roofing / Specialty Contracting', 'Plumbing', 'Electrical',
  'Waste / Environmental', 'Specialty Manufacturing', 'Automotive Services',
  'Dental Practices', 'Veterinary Practices', 'Physical Therapy / Med Spa',
  'Facility / Cleaning Services', 'Landscaping / Lawn Care', 'Pest Control',
  'Food / Cold Chain Distribution', 'Funeral Homes / Cemeteries',
  'Physical Security / Guard Services', 'Municipal Infrastructure',
  'IT / Managed Services', 'Commercial Painting', 'Restoration / Remediation',
  'Pool / Spa Services', 'Fire Protection', 'Elevator Services', 'Staffing',
  'Other Essential Services',
]

const STATES = [
  'National (Any)', 'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA',
  'HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS',
  'MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA',
  'RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY',
]

const FUNDING = [
  { id: 'sba_7a', label: 'SBA 7(a) Loan', desc: 'Up to $5M, 10% down, 10-yr terms' },
  { id: 'cash', label: 'All Cash', desc: 'Self-funded or personal capital' },
  { id: 'pe_fund', label: 'PE Fund / Fundless Sponsor', desc: 'Equity raise per deal' },
  { id: 'family_office', label: 'Family Office', desc: 'Private family capital' },
  { id: 'search_fund', label: 'Search Fund / ETA', desc: 'Entrepreneurship through acquisition' },
  { id: 'other', label: 'Other', desc: 'Seller note, hybrid, creative structure' },
]

const TIMELINES = [
  { id: 'asap', label: 'ASAP', desc: 'Actively closing deals now' },
  { id: '3_months', label: '1–3 Months', desc: 'Deals in process or near LOI' },
  { id: '6_months', label: '3–6 Months', desc: 'Building pipeline actively' },
  { id: '12_months', label: '6–12 Months', desc: 'Early stage, qualifying deals' },
  { id: 'exploring', label: 'Just Exploring', desc: 'Learning the market' },
]

type FormData = {
  deal_size_min: string
  deal_size_max: string
  target_industries: string[]
  target_geography: string[]
  funding_method: string
  previous_acquisitions: string
  timeline: string
  why_buying: string
  thesis_pdf_path: string
}

const EMPTY: FormData = {
  deal_size_min: '', deal_size_max: '',
  target_industries: [], target_geography: [],
  funding_method: '', previous_acquisitions: '0',
  timeline: '', why_buying: '', thesis_pdf_path: '',
}

export default function BuyerOnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<FormData>(EMPTY)
  const [saving, setSaving] = useState(false)
  const [pdfUploading, setPdfUploading] = useState(false)
  const [pdfExtracted, setPdfExtracted] = useState(false)
  const [pdfNote, setPdfNote] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const toggleIndustry = (ind: string) => {
    setForm(p => ({
      ...p,
      target_industries: p.target_industries.includes(ind)
        ? p.target_industries.filter(i => i !== ind)
        : [...p.target_industries, ind],
    }))
  }

  const toggleGeo = (geo: string) => {
    if (geo === 'National (Any)') {
      setForm(p => ({ ...p, target_geography: ['National'] }))
      return
    }
    setForm(p => ({
      ...p,
      target_geography: p.target_geography.includes(geo)
        ? p.target_geography.filter(g => g !== geo)
        : [...p.target_geography.filter(g => g !== 'National'), geo],
    }))
  }

  const handlePdfUpload = async (file: File) => {
    if (!file || file.type !== 'application/pdf') {
      setPdfNote('Please upload a PDF file.')
      return
    }
    setPdfUploading(true)
    setPdfNote('AI is reading your thesis…')
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/buyer/extract-buybox', { method: 'POST', body: fd })
      const data = await res.json()
      if (data.extracted) {
        const ex = data.extracted
        setForm(p => ({
          ...p,
          deal_size_min: ex.deal_size_min ? String(ex.deal_size_min) : p.deal_size_min,
          deal_size_max: ex.deal_size_max ? String(ex.deal_size_max) : p.deal_size_max,
          target_industries: ex.target_industries?.length ? ex.target_industries : p.target_industries,
          target_geography: ex.target_geography?.length ? ex.target_geography : p.target_geography,
          funding_method: ex.funding_method ?? p.funding_method,
          timeline: ex.timeline ?? p.timeline,
          why_buying: ex.why_buying ?? p.why_buying,
          thesis_pdf_path: data.storage_path ?? '',
        }))
        setPdfExtracted(true)
        const conf = ex.confidence_score ?? 0
        setPdfNote(conf >= 6
          ? `<svg viewBox="0 0 14 14" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3,7 6,10 11,4"/></svg> KB engine read your buy box (confidence: ${conf}/10). Review and confirm below.`
          : `NOTICE: Partial extraction (confidence: ${conf}/10). Please review and fill any missing fields.`)
      } else {
        setPdfNote(data.error ?? 'Could not extract from PDF. Please fill in manually.')
      }
    } catch {
      setPdfNote('Upload failed. Please fill in manually.')
    }
    setPdfUploading(false)
  }

  const submit = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/buyer/save-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          deal_size_min: Number(form.deal_size_min) || null,
          deal_size_max: Number(form.deal_size_max) || null,
          previous_acquisitions: Number(form.previous_acquisitions) || 0,
        }),
      })
      const data = await res.json()
      if (data.success) {
        router.push('/overview?welcome=buyer')
      } else {
        alert(data.error ?? 'Failed to save. Please try again.')
      }
    } catch {
      alert('Something went wrong. Please try again.')
    }
    setSaving(false)
  }

  const S = {
    card: { background: 'var(--kb-bg-panel)', border: '1px solid var(--kb-border)', borderRadius: '12px', padding: '28px 32px' } as React.CSSProperties,
    label: { fontSize: '11px', color: 'var(--kb-text-muted)', textTransform: 'uppercase' as const, letterSpacing: '0.1em', marginBottom: '6px', fontWeight: 600 },
    input: { width: '100%', padding: '12px 14px', background: 'var(--kb-bg-raised)', border: '1px solid var(--kb-border)', borderRadius: '9px', color: 'var(--kb-text)', fontSize: '15px', fontFamily: "'Inter', system-ui, sans-serif", outline: 'none', boxSizing: 'border-box' } as React.CSSProperties,
    sectionTitle: { fontFamily: "'Playfair Display', serif", fontSize: '20px', color: 'var(--kb-text)', fontWeight: 600, marginBottom: '6px' },
    hint: { fontSize: '13px', color: 'var(--kb-text-secondary)', marginBottom: '20px', lineHeight: 1.6 },
  }

  return (
    <div style={{ padding: '32px 36px', fontFamily: "'Inter', system-ui, sans-serif", color: 'var(--kb-text)', maxWidth: '800px', margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ fontSize: '12px', color: 'var(--kb-accent)', fontWeight: 590, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '8px' }}>Buyer Onboarding</div>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '30px', fontWeight: 600, margin: '0 0 8px', color: 'var(--kb-text)' }}>Set Up Your Buy Box</h1>
        <p style={{ fontSize: '15px', color: 'var(--kb-text-secondary)', margin: 0 }}>Tell us what you're looking for so we can match you to live deals.</p>
      </div>

      {/* Progress dots */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '28px', alignItems: 'center' }}>
        {[1, 2, 3, 4].map(n => (
          <div key={n} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '28px', height: '28px', borderRadius: '50%',
              background: n < step ? '#2ECC8B' : n === step ? '#C9A84C' : 'var(--kb-bg-raised)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '12px', fontWeight: 590,
              color: n < step ? 'var(--kb-bg)' : n === step ? 'var(--kb-bg)' : 'var(--kb-text-muted)',
            }}>
              {n < step ? '✓' : n}
            </div>
            <span style={{ fontSize: '12px', color: n === step ? '#C9A84C' : n < step ? '#2ECC8B' : 'var(--kb-text-muted)', fontWeight: n === step ? 600 : 400 }}>
              {['Deal Criteria', 'Funding & Background', 'Your Thesis', 'Review'][n - 1]}
            </span>
            {n < 4 && <div style={{ width: '24px', height: '1px', background: n < step ? '#2ECC8B' : 'rgba(255,255,255,0.1)' }} />}
          </div>
        ))}
      </div>

      {/* ── STEP 1: Deal Criteria ── */}
      {step === 1 && (
        <div style={S.card}>
          <div style={S.sectionTitle}>Deal Criteria</div>
          <p style={S.hint}>What size deals are you looking for and which industries?</p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
            <div>
              <div style={S.label}>Min Deal Size</div>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--kb-text-secondary)', fontSize: '15px' }}>$</span>
                <input style={{ ...S.input, paddingLeft: '26px' }} type="number" placeholder="1,000,000" value={form.deal_size_min} onChange={e => setForm(p => ({ ...p, deal_size_min: e.target.value }))} />
              </div>
            </div>
            <div>
              <div style={S.label}>Max Deal Size</div>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--kb-text-secondary)', fontSize: '15px' }}>$</span>
                <input style={{ ...S.input, paddingLeft: '26px' }} type="number" placeholder="5,000,000" value={form.deal_size_max} onChange={e => setForm(p => ({ ...p, deal_size_max: e.target.value }))} />
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <div style={S.label}>Target Industries <span style={{ color: 'var(--kb-text-muted)', textTransform: 'none', fontSize: '11px' }}>({form.target_industries.length} selected)</span></div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
              {INDUSTRIES.map(ind => {
                const on = form.target_industries.includes(ind)
                return (
                  <button key={ind} onClick={() => toggleIndustry(ind)} style={{
                    padding: '8px 10px', borderRadius: '7px', border: `1px solid ${on ? 'rgba(201,168,76,0.5)' : 'rgba(255,255,255,0.08)'}`,
                    background: on ? 'rgba(201,168,76,0.12)' : 'rgba(255,255,255,0.03)',
                    color: on ? '#C9A84C' : 'var(--kb-text-secondary)', fontSize: '12px', cursor: 'pointer',
                    fontFamily: "'Inter', system-ui, sans-serif", textAlign: 'left', transition: 'all 0.15s',
                  }}>
                    {on ? '<svg viewBox="0 0 14 14" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3,7 6,10 11,4"/></svg> ' : ''}{ind}
                  </button>
                )
              })}
            </div>
          </div>

          <div style={{ marginBottom: '8px' }}>
            <div style={S.label}>Target Geography <span style={{ color: 'var(--kb-text-muted)', textTransform: 'none', fontSize: '11px' }}>({form.target_geography.length} selected)</span></div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
              {STATES.map(st => {
                const key = st === 'National (Any)' ? 'National' : st
                const on = form.target_geography.includes(key)
                return (
                  <button key={st} onClick={() => toggleGeo(st)} style={{
                    padding: '5px 10px', borderRadius: '6px', border: `1px solid ${on ? 'rgba(201,168,76,0.5)' : 'rgba(255,255,255,0.08)'}`,
                    background: on ? 'rgba(201,168,76,0.12)' : 'rgba(255,255,255,0.03)',
                    color: on ? '#C9A84C' : 'var(--kb-text-secondary)', fontSize: '12px', cursor: 'pointer',
                    fontFamily: "'Inter', system-ui, sans-serif", transition: 'all 0.15s',
                  }}>
                    {on ? '<svg viewBox="0 0 14 14" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3,7 6,10 11,4"/></svg> ' : ''}{st}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── STEP 2: Funding & Background ── */}
      {step === 2 && (
        <div style={S.card}>
          <div style={S.sectionTitle}>Funding & Background</div>
          <p style={S.hint}>How do you fund acquisitions and what's your experience level?</p>

          <div style={{ marginBottom: '24px' }}>
            <div style={S.label}>Funding Method</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {FUNDING.map(f => {
                const on = form.funding_method === f.id
                return (
                  <button key={f.id} onClick={() => setForm(p => ({ ...p, funding_method: f.id }))} style={{
                    padding: '14px 16px', borderRadius: '10px', border: `2px solid ${on ? '#C9A84C' : 'rgba(255,255,255,0.08)'}`,
                    background: on ? 'rgba(201,168,76,0.1)' : 'rgba(255,255,255,0.03)',
                    cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
                  }}>
                    <div style={{ fontSize: '14px', fontWeight: 590, color: on ? '#C9A84C' : 'var(--kb-text)', marginBottom: '3px', fontFamily: "'Inter', system-ui, sans-serif" }}>{f.label}</div>
                    <div style={{ fontSize: '12px', color: 'var(--kb-text-secondary)', fontFamily: "'Inter', system-ui, sans-serif" }}>{f.desc}</div>
                  </button>
                )
              })}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
            <div>
              <div style={S.label}>Previous Acquisitions</div>
              <input style={S.input} type="number" min="0" placeholder="0" value={form.previous_acquisitions} onChange={e => setForm(p => ({ ...p, previous_acquisitions: e.target.value }))} />
              <div style={{ fontSize: '11px', color: 'var(--kb-text-muted)', marginTop: '5px' }}>How many businesses have you acquired before?</div>
            </div>
          </div>

          <div>
            <div style={S.label}>Acquisition Timeline</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              {TIMELINES.map(t => {
                const on = form.timeline === t.id
                return (
                  <button key={t.id} onClick={() => setForm(p => ({ ...p, timeline: t.id }))} style={{
                    padding: '12px 14px', borderRadius: '9px', border: `2px solid ${on ? '#C9A84C' : 'rgba(255,255,255,0.08)'}`,
                    background: on ? 'rgba(201,168,76,0.1)' : 'rgba(255,255,255,0.03)',
                    cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
                  }}>
                    <div style={{ fontSize: '13px', fontWeight: 590, color: on ? '#C9A84C' : 'var(--kb-text)', marginBottom: '2px', fontFamily: "'Inter', system-ui, sans-serif" }}>{t.label}</div>
                    <div style={{ fontSize: '11px', color: 'var(--kb-text-secondary)', fontFamily: "'Inter', system-ui, sans-serif" }}>{t.desc}</div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── STEP 3: Thesis ── */}
      {step === 3 && (
        <div style={S.card}>
          <div style={S.sectionTitle}>Your Investment Thesis</div>
          <p style={S.hint}>Tell us why you're acquiring and upload your buy box if you have one.</p>

          {/* PDF Upload */}
          <div style={{ background: 'rgba(201,168,76,0.05)', border: '1px solid var(--kb-accent-border)', borderRadius: '12px', padding: '20px 24px', marginBottom: '24px' }}>
            <div style={{ fontSize: '14px', fontWeight: 590, color: 'var(--kb-accent)', fontFamily: "'DM Mono', monospace", fontVariantNumeric: 'tabular-nums', marginBottom: '6px' }}> Upload Your Buy Box PDF</div>
            <div style={{ fontSize: '13px', color: 'var(--kb-text-secondary)', marginBottom: '14px', lineHeight: 1.6 }}>
              Have an investment thesis or buy box document? Upload it and the KB Deal Engine will read it and pre-fill your acquisition profile automatically.
            </div>
            <input ref={fileRef} type="file" accept=".pdf" style={{ display: 'none' }} onChange={e => { if (e.target.files?.[0]) handlePdfUpload(e.target.files[0]) }} />
            <button onClick={() => fileRef.current?.click()} disabled={pdfUploading} style={{
              padding: '10px 20px', background: pdfUploading ? 'rgba(201,168,76,0.3)' : 'rgba(201,168,76,0.15)', border: '1px solid rgba(201,168,76,0.4)', borderRadius: '8px',
              color: 'var(--kb-accent)', fontSize: '13px', fontWeight: 590, fontFamily: "'Inter', system-ui, sans-serif", cursor: pdfUploading ? 'not-allowed' : 'pointer',
            }}>
              {pdfUploading ? ' Reading PDF…' : ' Upload PDF (optional)'}
            </button>
            {pdfNote && (
              <div style={{ marginTop: '10px', fontSize: '13px', color: pdfExtracted ? '#2ECC8B' : '#F59E0B', lineHeight: 1.6 }}>
                {pdfNote}
              </div>
            )}
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <div style={S.label}>Why are you looking to acquire?</div>
              <span style={{ fontSize: '11px', color: 'var(--kb-text-muted)' }}>{form.why_buying.length}/500</span>
            </div>
            <textarea
              value={form.why_buying}
              onChange={e => setForm(p => ({ ...p, why_buying: e.target.value.slice(0, 500) }))}
              placeholder="Describe your acquisition thesis, what type of business you're looking for, and what you bring to a deal as an operator or capital partner…"
              rows={5}
              style={{ ...S.input, resize: 'none', lineHeight: 1.65 }}
            />
          </div>
        </div>
      )}

      {/* ── STEP 4: Review ── */}
      {step === 4 && (
        <div style={S.card}>
          <div style={S.sectionTitle}>Review & Submit</div>
          <p style={S.hint}>Confirm your buy box, you can update this anytime from your dashboard.</p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '24px' }}>
            {[
              { label: 'Deal Size Range', value: form.deal_size_min && form.deal_size_max ? `$${Number(form.deal_size_min).toLocaleString()} – $${Number(form.deal_size_max).toLocaleString()}` : '—' },
              { label: 'Funding Method', value: FUNDING.find(f => f.id === form.funding_method)?.label ?? '—' },
              { label: 'Timeline', value: TIMELINES.find(t => t.id === form.timeline)?.label ?? '—' },
              { label: 'Prior Acquisitions', value: form.previous_acquisitions || '0' },
            ].map(row => (
              <div key={row.label} style={{ background: 'var(--kb-bg-raised)', borderRadius: '10px', padding: '14px 16px' }}>
                <div style={S.label}>{row.label}</div>
                <div style={{ fontSize: '15px', color: 'var(--kb-text)', fontWeight: 600 }}>{row.value}</div>
              </div>
            ))}
          </div>

          {form.target_industries.length > 0 && (
            <div style={{ marginBottom: '14px' }}>
              <div style={S.label}>Target Industries ({form.target_industries.length})</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                {form.target_industries.map(i => (
                  <span key={i} style={{ background: 'var(--kb-accent-dim)', border: '1px solid var(--kb-accent-border)', borderRadius: '6px', padding: '4px 10px', fontSize: '12px', color: 'var(--kb-accent)' }}>{i}</span>
                ))}
              </div>
            </div>
          )}

          {form.target_geography.length > 0 && (
            <div style={{ marginBottom: '14px' }}>
              <div style={S.label}>Geography ({form.target_geography.length})</div>
              <div style={{ fontSize: '14px', color: 'var(--kb-text-secondary)', marginTop: '4px' }}>{form.target_geography.join(', ')}</div>
            </div>
          )}

          {form.why_buying && (
            <div style={{ marginBottom: '8px' }}>
              <div style={S.label}>Investment Thesis</div>
              <div style={{ fontSize: '14px', color: 'var(--kb-text-secondary)', marginTop: '4px', lineHeight: 1.7, background: 'var(--kb-bg-raised)', borderRadius: '8px', padding: '12px 14px' }}>{form.why_buying}</div>
            </div>
          )}

          <div style={{ marginTop: '20px', padding: '14px 16px', background: 'rgba(46,204,139,0.06)', border: '1px solid rgba(46,204,139,0.2)', borderRadius: '10px', fontSize: '13px', color: 'var(--kb-text-secondary)', lineHeight: 1.7 }}>
            <strong style={{ color: 'var(--kb-green)' }}>What happens next:</strong> Eric Skeldon will personally review your buy box and match you to live deals. You'll receive deal alerts when new opportunities match your criteria. All deals are under NDA.
          </div>
        </div>
      )}

      {/* Nav buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
        <button
          onClick={() => step > 1 ? setStep(s => s - 1) : null}
          style={{
            padding: '12px 24px', background: 'transparent', border: '1px solid var(--kb-border)',
            borderRadius: '10px', color: 'var(--kb-text-secondary)', fontSize: '14px', fontFamily: "'Inter', system-ui, sans-serif",
            cursor: step > 1 ? 'pointer' : 'not-allowed', opacity: step > 1 ? 1 : 0.3,
          }}
        >
          ← Back
        </button>

        {step < 4 ? (
          <button onClick={() => setStep(s => s + 1)} style={{
            padding: '12px 28px', background: 'var(--kb-accent)', border: 'none', borderRadius: '10px',
            color: 'var(--kb-bg)', fontSize: '15px', fontWeight: 590, fontFamily: "'Inter', system-ui, sans-serif", cursor: 'pointer',
          }}>
            Continue →
          </button>
        ) : (
          <button onClick={submit} disabled={saving} style={{
            padding: '12px 28px', background: saving ? 'rgba(46,204,139,0.4)' : '#2ECC8B', border: 'none', borderRadius: '10px',
            color: 'var(--kb-bg)', fontSize: '15px', fontWeight: 590, fontFamily: "'Inter', system-ui, sans-serif",
            cursor: saving ? 'not-allowed' : 'pointer',
          }}>
            {saving ? 'Submitting…' : '<svg viewBox="0 0 14 14" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3,7 6,10 11,4"/></svg> Submit My Buy Box'}
          </button>
        )}
      </div>
    </div>
  )
}
