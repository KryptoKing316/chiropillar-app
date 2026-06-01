'use client'
import { useState, useEffect } from 'react'
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
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
  'VA','WA','WV','WI','WY',
]

const REVENUE_RANGES = [
  { label: 'Under $500K',    value: 400000 },
  { label: '$500K – $1M',   value: 750000 },
  { label: '$1M – $2M',     value: 1500000 },
  { label: '$2M – $5M',     value: 3500000 },
  { label: '$5M – $10M',    value: 7500000 },
  { label: '$10M – $20M',   value: 15000000 },
  { label: 'Over $20M',     value: 25000000 },
]

const EBITDA_RANGES = [
  { label: 'Under $100K',    value: 75000 },
  { label: '$100K – $250K', value: 175000 },
  { label: '$250K – $500K', value: 375000 },
  { label: '$500K – $750K', value: 625000 },
  { label: '$750K – $1M',   value: 875000 },
  { label: '$1M – $2M',     value: 1500000 },
  { label: '$2M – $5M',     value: 3500000 },
  { label: 'Over $5M',      value: 6000000 },
]

const ASK_RANGES = [
  { label: 'Under $1M',      value: 800000 },
  { label: '$1M – $2M',     value: 1500000 },
  { label: '$2M – $5M',     value: 3500000 },
  { label: '$5M – $10M',    value: 7500000 },
  { label: '$10M – $20M',   value: 15000000 },
  { label: 'Over $20M',     value: 25000000 },
  { label: 'Not sure yet',  value: 0 },
]

const REASONS = [
  'Retirement', 'Ready for next chapter', 'Partner buyout', 'Health reasons',
  'Family transition', 'Capital raise / fund growth', 'Unsolicited interest created momentum', 'Other',
]

const BEST_TIMES = ['Morning (8am–12pm)', 'Afternoon (12pm–5pm)', 'Evening (5pm–8pm)', 'Anytime']

type Client = { name: string; revenue_pct: string; years: string }
type Staff  = { role: string; stays_post_sale: boolean }

type FormData = {
  // Step 1
  business_name: string; website: string; linkedin_url: string; industry: string
  city: string; state: string; years_in_business: string; employee_count: string
  // Step 2
  revenue_range: string; revenue_num: number; ebitda_range: string; ebitda_num: number
  asking_price_range: string; asking_price_num: number; reason_for_selling: string
  // Step 3
  top_clients: Client[]; key_staff: Staff[]; defensibility: string; owner_role: string
  // Step 4
  owner_name: string; owner_phone: string; best_time_to_call: string
}

const EMPTY: FormData = {
  business_name: '', website: '', linkedin_url: '', industry: '', city: '', state: '',
  years_in_business: '', employee_count: '',
  revenue_range: '', revenue_num: 0, ebitda_range: '', ebitda_num: 0,
  asking_price_range: '', asking_price_num: 0, reason_for_selling: '',
  top_clients: [
    { name: '', revenue_pct: '', years: '' },
    { name: '', revenue_pct: '', years: '' },
    { name: '', revenue_pct: '', years: '' },
  ],
  key_staff: [{ role: '', stays_post_sale: true }],
  defensibility: '', owner_role: '',
  owner_name: '', owner_phone: '', best_time_to_call: '',
}

const STEPS = [
  { num: '01', label: 'Business Profile' },
  { num: '02', label: 'Financial Snapshot' },
  { num: '03', label: 'Business Story' },
  { num: '04', label: 'Your Info' },
]

// ─── Shared styles ────────────────────────────────────────────────────────────
const card: React.CSSProperties = {
  background: 'var(--kb-bg-panel)', border: '1px solid var(--kb-border)',
  borderRadius: '8px', padding: '28px',
}
const label: React.CSSProperties = {
  fontSize: '13px', fontWeight: 590, color: 'var(--kb-accent)', fontFamily: "'DM Mono', monospace", fontVariantNumeric: 'tabular-nums',
  marginBottom: '8px', display: 'block',
  fontFamily: "'DM Mono', monospace", letterSpacing: '0.05em',
}
const sublabel: React.CSSProperties = {
  fontSize: '12px', color: '#6A7A9A', marginBottom: '8px', display: 'block',
}
const input: React.CSSProperties = {
  width: '100%', padding: '11px 14px',
  background: 'var(--kb-bg-raised)', border: '1px solid var(--kb-border)',
  borderRadius: '8px', color: 'var(--kb-text)', fontSize: '14px',
  fontFamily: "'Inter', system-ui, sans-serif", outline: 'none',
  boxSizing: 'border-box',
}
const select: React.CSSProperties = {
  ...input, appearance: 'none', cursor: 'pointer',
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%239BA8C0' strokeWidth='1.5' fill='none'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center',
  paddingRight: '36px',
}
const textarea: React.CSSProperties = {
  ...input, minHeight: '90px', resize: 'vertical', lineHeight: 1.6,
}
const fieldGroup: React.CSSProperties = { marginBottom: '20px' }
const row2: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }

function RadioCards({ options, value, onChange }: {
  options: { label: string; desc?: string; value: string }[]
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '8px' }}>
      {options.map(opt => (
        <button key={opt.value} type="button" onClick={() => onChange(opt.value)} style={{
          padding: '10px 12px', textAlign: 'left', cursor: 'pointer',
          background: value === opt.value ? 'rgba(201,168,76,0.1)' : 'rgba(255,255,255,0.03)',
          border: `1px solid ${value === opt.value ? 'rgba(201,168,76,0.5)' : 'rgba(255,255,255,0.08)'}`,
          borderRadius: '8px', transition: 'all 0.2s',
        }}>
          <div style={{ fontSize: '13px', fontWeight: 590, color: value === opt.value ? '#C9A84C' : 'var(--kb-text)' }}>{opt.label}</div>
          {opt.desc && <div style={{ fontSize: '11px', color: '#6A7A9A', marginTop: '3px', lineHeight: 1.4 }}>{opt.desc}</div>}
        </button>
      ))}
    </div>
  )
}

// ─── Step components ──────────────────────────────────────────────────────────
function Step1({ form, set }: { form: FormData; set: (p: Partial<FormData>) => void }) {
  return (
    <div>
      <div style={fieldGroup}>
        <label style={label}>Business Name</label>
        <input style={input} placeholder="Acme HVAC Services" value={form.business_name}
          onChange={e => set({ business_name: e.target.value })} />
      </div>

      <div style={fieldGroup}>
        <label style={label}>Company Website <span style={{ color: 'var(--kb-text-muted)', fontWeight: 400 }}>(optional)</span></label>
        <span style={sublabel}>Used for SEO analysis and buyer due diligence, helps buyers evaluate digital presence</span>
        <input style={input} placeholder="www.acmehvac.com" value={form.website}
          onChange={e => set({ website: e.target.value })} />
      </div>

      <div style={fieldGroup}>
        <label style={label}>Owner LinkedIn Profile <span style={{ color: 'var(--kb-text-muted)', fontWeight: 400 }}>(optional)</span></label>
        <span style={sublabel}>Our partner Dennis Yu (BlitzMetrics) uses this to build your authority and enhance your digital footprint before we bring buyers in</span>
        <input style={input} placeholder="linkedin.com/in/johnsmith" value={form.linkedin_url}
          onChange={e => set({ linkedin_url: e.target.value })} />
      </div>

      <div style={fieldGroup}>
        <label style={label}>Industry</label>
        <select style={select} value={form.industry} onChange={e => set({ industry: e.target.value })}>
          <option value="">Select your industry…</option>
          {INDUSTRIES.map(ind => <option key={ind} value={ind}>{ind}</option>)}
        </select>
      </div>

      <div style={{ ...fieldGroup, ...row2 }}>
        <div>
          <label style={label}>City</label>
          <input style={input} placeholder="Dallas" value={form.city}
            onChange={e => set({ city: e.target.value })} />
        </div>
        <div>
          <label style={label}>State</label>
          <select style={select} value={form.state} onChange={e => set({ state: e.target.value })}>
            <option value="">Select…</option>
            {STATES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div style={{ ...fieldGroup, ...row2 }}>
        <div>
          <label style={label}>Years in Business</label>
          <input style={input} type="number" placeholder="12" min="1" max="100"
            value={form.years_in_business}
            onChange={e => set({ years_in_business: e.target.value })} />
        </div>
        <div>
          <label style={label}>Employee Count</label>
          <input style={input} type="number" placeholder="24" min="1"
            value={form.employee_count}
            onChange={e => set({ employee_count: e.target.value })} />
        </div>
      </div>
    </div>
  )
}

function Step2({ form, set }: { form: FormData; set: (p: Partial<FormData>) => void }) {
  return (
    <div>
      <div style={fieldGroup}>
        <label style={label}>Annual Revenue (TTM)</label>
        <span style={sublabel}>Most recent 12-month revenue, approximate is fine</span>
        <RadioCards
          options={REVENUE_RANGES.map(r => ({ label: r.label, value: r.label }))}
          value={form.revenue_range}
          onChange={v => {
            const match = REVENUE_RANGES.find(r => r.label === v)
            set({ revenue_range: v, revenue_num: match?.value ?? 0 })
          }}
        />
      </div>

      <div style={fieldGroup}>
        <label style={label}>EBITDA / Owner Earnings (TTM)</label>
        <span style={sublabel}>Profit before add-backs, we'll calculate normalized EBITDA from your docs</span>
        <RadioCards
          options={EBITDA_RANGES.map(r => ({ label: r.label, value: r.label }))}
          value={form.ebitda_range}
          onChange={v => {
            const match = EBITDA_RANGES.find(r => r.label === v)
            set({ ebitda_range: v, ebitda_num: match?.value ?? 0 })
          }}
        />
      </div>

      <div style={fieldGroup}>
        <label style={label}>Asking Price Expectation</label>
        <span style={sublabel}>Your expectation, KB will build a data-backed valuation from your financials</span>
        <RadioCards
          options={ASK_RANGES.map(r => ({ label: r.label, value: r.label }))}
          value={form.asking_price_range}
          onChange={v => {
            const match = ASK_RANGES.find(r => r.label === v)
            set({ asking_price_range: v, asking_price_num: match?.value ?? 0 })
          }}
        />
      </div>

      <div style={fieldGroup}>
        <label style={label}>Primary Reason for Selling</label>
        <RadioCards
          options={REASONS.map(r => ({ label: r, value: r }))}
          value={form.reason_for_selling}
          onChange={v => set({ reason_for_selling: v })}
        />
      </div>
    </div>
  )
}

function Step3({ form, set }: { form: FormData; set: (p: Partial<FormData>) => void }) {
  const updateClient = (i: number, patch: Partial<Client>) => {
    const clients = [...form.top_clients]
    clients[i] = { ...clients[i], ...patch }
    set({ top_clients: clients })
  }
  const addStaff = () => set({ key_staff: [...form.key_staff, { role: '', stays_post_sale: true }] })
  const updateStaff = (i: number, patch: Partial<Staff>) => {
    const staff = [...form.key_staff]
    staff[i] = { ...staff[i], ...patch }
    set({ key_staff: staff })
  }
  const removeStaff = (i: number) => set({ key_staff: form.key_staff.filter((_, idx) => idx !== i) })

  return (
    <div>
      {/* Top 3 clients */}
      <div style={fieldGroup}>
        <label style={label}>Top Clients / Revenue Concentration</label>
        <span style={sublabel}>Buyers will ask about customer concentration, get ahead of it here. Names are optional.</span>
        {form.top_clients.map((c, i) => (
          <div key={i} style={{
            padding: '14px 16px', marginBottom: '8px',
            background: 'var(--kb-bg-card)', border: '1px solid var(--kb-border-subtle)',
            borderRadius: '10px',
          }}>
            <div style={{ fontSize: '12px', color: 'var(--kb-accent)', fontWeight: 590, marginBottom: '10px', fontFamily: "'DM Mono', monospace", letterSpacing: '0.06em' }}>
              Client {i + 1}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '10px' }}>
              <div>
                <span style={{ ...sublabel, marginBottom: '4px' }}>Name / Description (optional)</span>
                <input style={{ ...input, fontSize: '13px' }} placeholder="e.g. City of Dallas, Anonymous Corp"
                  value={c.name} onChange={e => updateClient(i, { name: e.target.value })} />
              </div>
              <div>
                <span style={{ ...sublabel, marginBottom: '4px' }}>% of Revenue</span>
                <input style={{ ...input, fontSize: '13px' }} placeholder="35%" type="number" min="1" max="100"
                  value={c.revenue_pct} onChange={e => updateClient(i, { revenue_pct: e.target.value })} />
              </div>
              <div>
                <span style={{ ...sublabel, marginBottom: '4px' }}>Relationship (yrs)</span>
                <input style={{ ...input, fontSize: '13px' }} placeholder="7" type="number" min="0"
                  value={c.years} onChange={e => updateClient(i, { years: e.target.value })} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Key staff */}
      <div style={fieldGroup}>
        <label style={label}>Key Staff Who Would Stay Post-Sale</label>
        <span style={sublabel}>Buyers pay premiums for businesses with strong management in place</span>
        {form.key_staff.map((s, i) => (
          <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '8px' }}>
            <input style={{ ...input, flex: 1, fontSize: '13px' }} placeholder="e.g. Operations Manager, Lead Technician (12 yrs)"
              value={s.role} onChange={e => updateStaff(i, { role: e.target.value })} />
            <button type="button" onClick={() => removeStaff(i)} style={{
              width: '32px', height: '32px', flexShrink: 0,
              background: 'rgba(231,76,60,0.08)', border: '1px solid rgba(231,76,60,0.2)',
              borderRadius: '6px', color: 'var(--kb-red)', cursor: 'pointer', fontSize: '16px',
              display: i === 0 ? 'none' : 'flex', alignItems: 'center', justifyContent: 'center',
            }}>×</button>
          </div>
        ))}
        <button type="button" onClick={addStaff} style={{
          padding: '8px 16px', background: 'transparent',
          border: '1px solid var(--kb-accent-border)', borderRadius: '6px',
          color: 'var(--kb-accent)', fontSize: '13px', cursor: 'pointer',
          fontFamily: "'Inter', system-ui, sans-serif", marginTop: '4px',
        }}>+ Add Staff Member</button>
      </div>

      {/* What makes this business defensible */}
      <div style={fieldGroup}>
        <label style={label}>What Makes This Business Defensible?</label>
        <span style={sublabel}>Recurring contracts, licenses, certifications, geographic exclusivity, proprietary systems, brand, anything that protects the business from competition</span>
        <textarea style={textarea} placeholder="e.g. 80% of revenue on 3-year service contracts. We hold 4 municipal contracts. Licensed in all 6 surrounding counties. No direct competitor within 40 miles."
          value={form.defensibility} onChange={e => set({ defensibility: e.target.value })} />
      </div>

      {/* Owner's role day-to-day */}
      <div style={fieldGroup}>
        <label style={label}>Your Role in the Business Day-to-Day</label>
        <span style={sublabel}>Buyers want to know how dependent the business is on you personally</span>
        <textarea style={textarea} placeholder="e.g. I handle sales, bid walks, and key client relationships. Operations manager runs day-to-day. I work about 30 hours/week. The business runs without me for 2–3 weeks at a time."
          value={form.owner_role} onChange={e => set({ owner_role: e.target.value })} />
      </div>
    </div>
  )
}

function Step4({ form, set }: { form: FormData; set: (p: Partial<FormData>) => void }) {
  return (
    <div>
      <div style={{
        padding: '16px 18px', marginBottom: '24px',
        background: 'rgba(46,204,139,0.06)', border: '1px solid rgba(46,204,139,0.18)',
        borderRadius: '10px',
      }}>
        <div style={{ fontSize: '13px', color: 'var(--kb-green)', fontWeight: 590, marginBottom: '4px' }}> Confidential</div>
        <div style={{ fontSize: '13px', color: 'var(--kb-text-secondary)', lineHeight: 1.6 }}>
          Your contact info is only shared with Eric Skeldon at Kingdom Broker. We never share seller identity with buyers without your written consent.
        </div>
      </div>

      <div style={fieldGroup}>
        <label style={label}>Your Full Name</label>
        <input style={input} placeholder="John Smith" value={form.owner_name}
          onChange={e => set({ owner_name: e.target.value })} />
      </div>

      <div style={fieldGroup}>
        <label style={label}>Best Phone Number</label>
        <input style={input} placeholder="(214) 555-0100" type="tel" value={form.owner_phone}
          onChange={e => set({ owner_phone: e.target.value })} />
      </div>

      <div style={fieldGroup}>
        <label style={label}>Best Time to Reach You</label>
        <RadioCards
          options={BEST_TIMES.map(t => ({ label: t, value: t }))}
          value={form.best_time_to_call}
          onChange={v => set({ best_time_to_call: v })}
        />
      </div>

      {/* Summary */}
      <div style={{
        marginTop: '28px', padding: '20px 22px',
        background: 'var(--kb-accent-dim)', border: '1px solid rgba(201,168,76,0.14)',
        borderRadius: '12px',
      }}>
        <div style={{ fontSize: '11px', fontWeight: 590, color: 'var(--kb-accent)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '14px', fontFamily: "'DM Mono', monospace" }}>
          Your Submission Summary
        </div>
        {[
          { label: 'Business', value: form.business_name || '—' },
          { label: 'Industry', value: form.industry || '—' },
          { label: 'Location', value: [form.city, form.state].filter(Boolean).join(', ') || '—' },
          { label: 'Revenue', value: form.revenue_range || '—' },
          { label: 'EBITDA', value: form.ebitda_range || '—' },
          { label: 'Asking Price', value: form.asking_price_range || '—' },
          { label: 'Reason', value: form.reason_for_selling || '—' },
        ].map(row => (
          <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid var(--kb-border-subtle)' }}>
            <span style={{ fontSize: '13px', color: '#6A7A9A' }}>{row.label}</span>
            <span style={{ fontSize: '13px', color: 'var(--kb-text)', fontWeight: 500 }}>{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
function NotInvitedScreen() {
  return (
    <div style={{
      minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '32px', fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      <div style={{ maxWidth: '520px', width: '100%', textAlign: 'center' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/kb-logo.png" alt="Kingdom Broker" style={{ height: '40px', marginBottom: '28px' }} />
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '28px', fontWeight: 600, color: 'var(--kb-text)', marginBottom: '12px' }}>
          Seller Onboarding is Invite Only
        </div>
        <p style={{ fontSize: '16px', color: 'var(--kb-text-secondary)', lineHeight: 1.7, marginBottom: '28px' }}>
          Kingdom Broker works with a select number of business owners at a time. To begin the onboarding process, you need a direct invitation from our advisory team.
        </p>
        <div style={{
          padding: '20px 24px', borderRadius: '12px',
          background: 'linear-gradient(135deg, rgba(201,168,76,0.08), var(--kb-bg-panel))',
          border: '1px solid rgba(201,168,76,0.2)', marginBottom: '20px', textAlign: 'left',
        }}>
          <div style={{ fontSize: '14px', fontWeight: 590, color: 'var(--kb-accent)', marginBottom: '8px' }}>How to Get Started</div>
          <div style={{ fontSize: '14px', color: 'var(--kb-text)', lineHeight: 1.7 }}>
            Schedule a free confidential consultation with Eric Skeldon. If your business is a fit, we will send you a private onboarding invitation.
          </div>
        </div>
        <a
          href="https://calendly.com/ericskeldon/kingdombroker"
          target="_blank"
          rel="noreferrer"
          style={{
            display: 'inline-block', padding: '14px 32px',
            background: 'var(--kb-accent)', color: 'var(--kb-bg)',
            borderRadius: '10px', fontSize: '15px', fontWeight: 590,
            textDecoration: 'none', fontFamily: "'Inter', system-ui, sans-serif",
            marginBottom: '16px',
          }}
        >
          Book a Free Consultation
        </a>
        <div style={{ marginTop: '12px' }}>
          <a href="/overview" style={{ fontSize: '14px', color: 'var(--kb-text-muted)', textDecoration: 'underline', textUnderlineOffset: '3px' }}>
            Explore the platform demo instead
          </a>
        </div>
      </div>
    </div>
  )
}

export default function SellerOnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [form, setFormState] = useState<FormData>(EMPTY)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [accessChecked, setAccessChecked] = useState(false)
  const [hasAccess, setHasAccess] = useState(false)

  // Check if user was invited as seller by admin
  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(d => {
        // Admin always has access, invited sellers have role='seller'
        if (d.isAdmin || d.role === 'seller') {
          setHasAccess(true)
        }
        setAccessChecked(true)
      })
      .catch(() => {
        // Demo mode: show the not-invited screen
        setAccessChecked(true)
        setHasAccess(false)
      })
  }, [])

  if (!accessChecked) {
    return (
      <div style={{ padding: '80px', textAlign: 'center', fontFamily: "'Inter', system-ui, sans-serif", color: 'var(--kb-text-muted)' }}>
        Checking access...
      </div>
    )
  }

  if (!hasAccess) return <NotInvitedScreen />

  const set = (patch: Partial<FormData>) => setFormState(prev => ({ ...prev, ...patch }))

  const canAdvance = () => {
    if (step === 0) return form.business_name.trim() && form.industry && form.city && form.state
    if (step === 1) return form.revenue_range && form.ebitda_range && form.asking_price_range && form.reason_for_selling
    if (step === 2) return form.defensibility.trim() && form.owner_role.trim()
    if (step === 3) return form.owner_name.trim() && form.owner_phone.trim() && form.best_time_to_call
    return false
  }

  const next = () => {
    if (step < 3) setStep(s => s + 1)
  }

  const submit = async () => {
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/seller/save-intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) {
        // Demo users, still let them proceed
        if (res.status === 403) {
          router.push('/documents?onboarding=true')
          return
        }
        setError(data.error || 'Something went wrong, please try again.')
        return
      }
      router.push('/documents?onboarding=true')
    } catch {
      setError('Network error, please retry.')
    } finally {
      setSubmitting(false)
    }
  }

  const progress = ((step + 1) / STEPS.length) * 100

  return (
    <div style={{
      minHeight: '100vh', padding: '40px 24px 80px',
      fontFamily: "'Inter', system-ui, sans-serif", color: 'var(--kb-text)',
      maxWidth: '720px', margin: '0 auto',
    }}>

      {/* Header */}
      <div style={{ marginBottom: '36px' }}>
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '10px', color: 'var(--kb-text-muted)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '6px' }}>
          Seller Onboarding
        </div>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '28px', fontWeight: 600, margin: '0 0 6px' }}>
          Tell Us About Your Business
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--kb-text-secondary)', margin: 0, lineHeight: 1.6 }}>
          4 quick steps · About 8 minutes · Everything stays confidential
        </p>
      </div>

      {/* Step indicators */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        {STEPS.map((s, i) => (
          <div key={i} style={{ flex: 1 }}>
            <div style={{
              height: '3px', borderRadius: '2px', marginBottom: '8px',
              background: i <= step ? '#C9A84C' : 'rgba(255,255,255,0.08)',
              transition: 'background 0.4s',
            }} />
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '10px', color: i === step ? '#C9A84C' : i < step ? '#2ECC8B' : 'var(--kb-text-muted)', letterSpacing: '0.1em' }}>
              {i < step ? '<svg viewBox="0 0 14 14" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3,7 6,10 11,4"/></svg> ' : ''}{s.num}
            </div>
            <div style={{ fontSize: '12px', color: i === step ? 'var(--kb-text)' : 'var(--kb-text-muted)', fontWeight: i === step ? 600 : 400, marginTop: '2px' }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div style={{ height: '2px', background: 'var(--kb-bg-raised)', borderRadius: '2px', marginBottom: '28px', overflow: 'hidden' }}>
        <div style={{ width: `${progress}%`, height: '100%', background: 'var(--kb-accent)', borderRadius: '2px', transition: 'width 0.4s' }} />
      </div>

      {/* Step card */}
      <div style={card}>
        <div style={{ fontSize: '17px', fontWeight: 590, color: 'var(--kb-text)', marginBottom: '20px', fontFamily: "'Playfair Display', serif" }}>
          {STEPS[step].label}
        </div>

        {step === 0 && <Step1 form={form} set={set} />}
        {step === 1 && <Step2 form={form} set={set} />}
        {step === 2 && <Step3 form={form} set={set} />}
        {step === 3 && <Step4 form={form} set={set} />}
      </div>

      {/* Error */}
      {error && (
        <div style={{ marginTop: '14px', padding: '12px 16px', background: 'rgba(231,76,60,0.08)', border: '1px solid rgba(231,76,60,0.22)', borderRadius: '8px', color: 'var(--kb-red)', fontSize: '13px' }}>
          {error}
        </div>
      )}

      {/* Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
        <button
          onClick={() => step > 0 ? setStep(s => s - 1) : router.push('/onboarding')}
          style={{
            padding: '11px 22px', background: 'transparent',
            border: '1px solid var(--kb-border)', borderRadius: '8px',
            color: 'var(--kb-text-secondary)', fontSize: '14px', cursor: 'pointer',
            fontFamily: "'Inter', system-ui, sans-serif",
          }}
        >
          ← {step === 0 ? 'Back' : 'Previous'}
        </button>

        {step < 3 ? (
          <button
            onClick={next}
            disabled={!canAdvance()}
            style={{
              padding: '11px 28px',
              background: canAdvance() ? '#C9A84C' : 'rgba(201,168,76,0.2)',
              border: 'none', borderRadius: '8px',
              color: canAdvance() ? 'var(--kb-bg)' : 'var(--kb-text-muted)',
              fontSize: '14px', fontWeight: 590, cursor: canAdvance() ? 'pointer' : 'not-allowed',
              fontFamily: "'Inter', system-ui, sans-serif", transition: 'all 0.2s',
            }}
          >
            Continue → {STEPS[step + 1].label}
          </button>
        ) : (
          <button
            onClick={submit}
            disabled={!canAdvance() || submitting}
            style={{
              padding: '13px 32px',
              background: canAdvance() && !submitting ? '#C9A84C' : 'rgba(201,168,76,0.2)',
              border: 'none', borderRadius: '8px',
              color: canAdvance() && !submitting ? 'var(--kb-bg)' : 'var(--kb-text-muted)',
              fontSize: '15px', fontWeight: 590,
              cursor: canAdvance() && !submitting ? 'pointer' : 'not-allowed',
              fontFamily: "'Inter', system-ui, sans-serif", transition: 'all 0.2s',
            }}
          >
            {submitting ? 'Saving…' : 'Submit & Upload Documents →'}
          </button>
        )}
      </div>

      {/* Skip option */}
      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <button onClick={() => router.push('/documents?onboarding=true')} style={{
          background: 'none', border: 'none', color: 'var(--kb-text-muted)', fontSize: '13px',
          cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: '3px',
          fontFamily: "'Inter', system-ui, sans-serif",
        }}>
          Skip for now, go straight to document upload
        </button>
      </div>

    </div>
  )
}
