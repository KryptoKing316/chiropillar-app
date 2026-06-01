'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'

const BUSINESS_VALUES = [
  '$1M – $2M', '$2M – $5M', '$5M – $10M', '$10M – $20M', 'Over $20M', 'Not sure yet',
]

const TIMELINES = [
  'Within 1 year', '1–3 years', '3–5 years', '5+ years', 'Just learning',
]

const TRUST_STATUS = [
  { id: 'yes',   label: 'Yes, already have one',         desc: 'But want it reviewed for an exit' },
  { id: 'no',    label: 'No, starting fresh',            desc: 'No trust structure in place yet' },
  { id: 'maybe', label: "Not sure, it's complicated",    desc: "Let Scott's team assess" },
]

const GOALS = [
  { id: 'tax',     label: 'Minimize exit taxes',       icon: '' },
  { id: 'tithe',   label: 'Set aside for tithing',     icon: '' },
  { id: 'kids',    label: 'Fund childrens future',      icon: '' },
  { id: 'legacy',  label: 'Multi-gen wealth transfer',  icon: '' },
  { id: 'protect', label: 'Asset protection',           icon: '' },
  { id: 'charity', label: 'Charitable giving',          icon: '' },
]

const card: React.CSSProperties = {
  background: 'var(--kb-bg-panel)', border: '1px solid var(--kb-border)',
  borderRadius: '8px', padding: '32px',
}

function RadioCards({ options, value, onChange }: {
  options: { id: string; label: string; desc?: string }[]
  value: string; onChange: (v: string) => void
}) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px,1fr))', gap: '10px' }}>
      {options.map(o => (
        <button key={o.id} type="button" onClick={() => onChange(o.id)} style={{
          padding: '14px 16px', textAlign: 'left', cursor: 'pointer',
          background: value === o.id ? 'var(--kb-accent-dim)' : 'var(--kb-bg-card)',
          border: `2px solid ${value === o.id ? 'var(--kb-accent)' : 'var(--kb-border)'}`,
          borderRadius: '8px', transition: 'all 0.2s', color: 'var(--kb-text)',
        }}>
          <div style={{ fontSize: '14px', fontWeight: 590, color: value === o.id ? 'var(--kb-accent)' : 'var(--kb-text)' }}>{o.label}</div>
          {o.desc && <div style={{ fontSize: '12px', color: 'var(--kb-text-muted)', marginTop: '4px' }}>{o.desc}</div>}
        </button>
      ))}
    </div>
  )
}

export default function TrustPage() {
  const [form, setForm] = useState({
    full_name: '', email: '', phone: '',
    business_value: '', exit_timeline: '', has_trust: '',
    goals: [] as string[], notes: '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const set = (patch: Partial<typeof form>) => setForm(p => ({ ...p, ...patch }))
  const toggleGoal = (id: string) => {
    set({ goals: form.goals.includes(id) ? form.goals.filter(g => g !== id) : [...form.goals, id] })
  }

  const canSubmit = form.full_name && form.email && form.phone && form.business_value && form.exit_timeline

  const submit = async () => {
    setSubmitting(true)
    await fetch('/api/trust/save-lead', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setSubmitted(true)
    setSubmitting(false)
  }

  return (
    <div style={{ padding: '28px 32px 80px', fontFamily: "'Inter', system-ui, sans-serif", color: 'var(--kb-text)', maxWidth: '1100px', width: '100%' }}>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '13px', color: 'var(--kb-accent)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '8px', fontWeight: 590 }}>
          Trust Planning · Powered by Nexxess
        </div>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '34px', fontWeight: 600, margin: '0 0 10px', letterSpacing: '-0.3px' }}>
          Protect What You Built.<br />Keep More of What You Earned.
        </h1>
        <p style={{ fontSize: '17px', color: 'var(--kb-text-secondary)', margin: '0 0 32px', lineHeight: 1.7, maxWidth: '780px' }}>
          Proper trust structure before your exit can save up to 30% of your sale price in taxes. On a $10M exit that's $3M, money you can use to tithe, fund your childrens future, or build a legacy that outlasts the deal.
        </p>
      </motion.div>

      {/* Video */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.05 }}>
        <div style={{
          ...card,
          marginBottom: '28px',
          border: '1px solid var(--kb-accent-border)',
          background: 'linear-gradient(135deg, var(--kb-accent-dim), var(--kb-bg-panel))',
          padding: '28px',
        }}>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '11px', color: 'var(--kb-accent)', letterSpacing: '0.14em', marginBottom: '6px' }}>
            WATCH
          </div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '26px', fontWeight: 600, color: 'var(--kb-text)', marginBottom: '18px' }}>
            Trust Explained in 1 Minute By Billionaire
          </div>
          <video
            controls
            playsInline
            preload="metadata"
            style={{
              width: '100%',
              maxWidth: '720px',
              borderRadius: '8px',
              border: '1px solid var(--kb-border)',
              background: '#000',
            }}
          >
            <source src="/getty-trust.mp4" type="video/mp4" />
          </video>
        </div>
      </motion.div>

      {/* The Math */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '28px' }}>
          {[
            { label: 'Typical Exit Tax Exposure', value: '30–40%', color: 'var(--kb-red)', sub: 'Federal + state + capital gains without a plan' },
            { label: 'With Proper Trust Structure', value: '15–30%', color: 'var(--kb-green)', sub: 'Legal, licensed, and documented before closing' },
            { label: 'Savings on a $10M Exit', value: '$2M – $3M', color: 'var(--kb-accent)', sub: 'Yours to tithe, invest, or transfer to family' },
          ].map(s => (
            <div key={s.label} style={{ ...card, textAlign: 'center', background: 'linear-gradient(135deg, var(--kb-accent-dim), var(--kb-bg-panel))', border: '1px solid var(--kb-accent-border)' }}>
              <div style={{ fontSize: '15px', color: 'var(--kb-text)', marginBottom: '10px', lineHeight: 1.5, fontWeight: 590 }}>{s.label}</div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '34px', fontWeight: 600, color: s.color, marginBottom: '6px' }}>{s.value}</div>
              <div style={{ fontSize: '14px', color: 'var(--kb-text)', lineHeight: 1.5, fontWeight: 400 }}>{s.sub}</div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* What you can do with the savings */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }}>
        <div style={{ ...card, marginBottom: '28px', borderLeft: '3px solid var(--kb-accent)', background: 'linear-gradient(135deg, var(--kb-accent-dim), var(--kb-bg-panel))', border: '1px solid var(--kb-accent-border)' }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', fontWeight: 600, color: 'var(--kb-accent)', letterSpacing: '0.02em', marginBottom: '4px' }}>
            WHAT YOUR SAVINGS CAN DO
          </div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '28px', fontWeight: 600, color: 'var(--kb-text)', marginBottom: '18px' }}>
            $2M–$3M Back in Your Hands
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px,1fr))', gap: '16px' }}>
            {[
              { icon: '', title: 'Tithe on Your Terms', desc: 'Give 10% of your exit ($300K–$1M+) to the causes and ministries that matter to you, without cutting into your retirement.' },
              { icon: '', title: "Fund Sons & Daughters' Dreams", desc: 'Place exit savings into a Trust High Yield account at 10% APY. The principal never gets touched. Your children live off the interest, dreams funded without depleting wealth.' },
              { icon: '', title: 'Multi-Gen Legacy', desc: 'Structure assets so your grandchildren benefit from what you built, not just your children. Wealth that compounds across generations.' },
              { icon: '', title: 'Charitable Legacy', desc: 'Set up a Donor Advised Fund or charitable trust. Tax benefits now. Impact forever. Your name on something that outlasts the business.' },
            ].map(item => (
              <div key={item.title} style={{ display: 'flex', gap: '12px' }}>
                <div style={{ fontSize: '24px', flexShrink: 0 }}>{item.icon}</div>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 590, color: 'var(--kb-text)', marginBottom: '4px' }}>{item.title}</div>
                  <div style={{ fontSize: '14px', color: 'var(--kb-text-secondary)', lineHeight: 1.65 }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Generational Wealth Formula */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.18 }}>
        <div style={{
          ...card,
          marginBottom: '28px',
          background: 'linear-gradient(135deg, var(--kb-accent-dim), var(--kb-bg-panel))',
          border: '1px solid var(--kb-accent-border)',
          borderLeft: '3px solid var(--kb-accent)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
            <span style={{ fontSize: '28px' }}></span>
            <div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '28px', fontWeight: 600, color: 'var(--kb-accent)', letterSpacing: '0.02em', marginBottom: '4px' }}>
                THE GENERATIONAL WEALTH FORMULA
              </div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', fontWeight: 600, color: 'var(--kb-text)', lineHeight: 1.2 }}>
                10% APY · Trust High Yield Account
              </div>
            </div>
          </div>

          <p style={{ fontSize: '17px', color: 'var(--kb-text-secondary)', lineHeight: 1.8, margin: '0 0 22px', fontFamily: "'Playfair Display', serif", fontStyle: 'italic' }}>
            "Place your exit savings into a safe, trust-held high-yield account earning 10% APY.
            The principle never gets touched, ever.
            Your sons and daughters live off the interest,
            funding their dreams without depleting the wealth you built."
          </p>

          {/* Math example */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px,1fr))', gap: '12px', marginBottom: '18px' }}>
            {[
              { label: 'Trust Savings', value: '$2M', sub: 'After structure & exit', color: 'var(--kb-accent)' },
              { label: 'Annual Interest', value: '$200K/yr', sub: '10% APY on principal', color: 'var(--kb-green)' },
              { label: 'Principal', value: 'Untouched', sub: 'Preserved forever', color: 'var(--kb-accent)' },
              { label: 'Generations', value: '∞', sub: 'Wealth that never ends', color: 'var(--kb-green)' },
            ].map(m => (
              <div key={m.label} style={{
                padding: '14px 16px',
                background: 'var(--kb-bg-raised)',
                border: '1px solid var(--kb-border)',
                borderRadius: '8px', textAlign: 'center',
              }}>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '26px', fontWeight: 600, color: m.color, marginBottom: '4px' }}>{m.value}</div>
                <div style={{ fontSize: '13px', fontWeight: 590, color: 'var(--kb-text)', marginBottom: '3px' }}>{m.label}</div>
                <div style={{ fontSize: '11px', color: 'var(--kb-text-muted)' }}>{m.sub}</div>
              </div>
            ))}
          </div>

          <div style={{
            padding: '12px 16px',
            background: 'var(--kb-accent-dim)',
            border: '1px solid rgba(201,168,76,0.15)',
            borderRadius: '7px',
            fontSize: '13px', color: 'var(--kb-text-secondary)', lineHeight: 1.7,
          }}>
            <span style={{ color: 'var(--kb-accent)', fontWeight: 600 }}>The goal:</span> Fund your sons' and daughters' dreams, education, business ventures, housing, missions, without ever writing a check from principal. The legacy outlives every generation.
          </div>
        </div>
      </motion.div>

      {/* Nexxess Partnership */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
        <div style={{
          ...card,
          marginBottom: '28px',
          border: '1px solid var(--kb-accent-border)',
          background: 'linear-gradient(135deg, var(--kb-accent-dim), var(--kb-bg-panel))',
          padding: '32px',
        }}>
          {/* Logo */}
          <div style={{ marginBottom: '24px' }}>
            <img
              src="/nexxess-logo.png"
              alt="Nexxess Business Advisors"
              style={{ height: '52px', width: 'auto', borderRadius: '8px', display: 'block' }}
            />
          </div>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '11px', color: 'var(--kb-accent)', letterSpacing: '0.16em', marginBottom: '8px' }}>
            PARTNER · NEXXESS.COM
          </div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '28px', fontWeight: 600, marginBottom: '12px' }}>
            Scott McGrath &amp; The Nexxess Team
          </div>
          <p style={{ fontSize: '16px', color: 'var(--kb-text-secondary)', lineHeight: 1.75, margin: '0 0 18px' }}>
            Scott McGrath is a partner in Kingdom Broker and leads trust and estate planning through Nexxess.
            Kingdom Broker is built out of the Nexxess office and studio. Every trust engagement is executed with licensed professionals
            whose only job is correct structure, not advisors selling products.
          </p>
          <a href="https://nexxess.com" target="_blank" rel="noreferrer" style={{
            display: 'inline-block', padding: '8px 20px',
            background: 'var(--kb-accent-dim)', border: '1px solid var(--kb-accent-border)',
            borderRadius: '6px', color: 'var(--kb-accent)', fontSize: '13px', fontWeight: 590,
            textDecoration: 'none', fontFamily: "'Inter', system-ui, sans-serif",
          }}>
            Visit Nexxess.com →
          </a>
        </div>
      </motion.div>

      {/* How It Works */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.25 }}>
        <div style={{ marginBottom: '28px' }}>

          <div style={{
            background: 'linear-gradient(135deg, var(--kb-accent-dim), var(--kb-bg-panel))',
            border: '1px solid var(--kb-accent-border)',
            borderLeft: '3px solid var(--kb-accent)',
            borderRadius: '8px',
            padding: '32px 36px',
            marginBottom: '16px',
          }}>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', fontWeight: 600, color: 'var(--kb-accent)', letterSpacing: '0.02em', marginBottom: '4px' }}>
              HOW IT WORKS
            </div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '28px', fontWeight: 600, color: 'var(--kb-text)', marginBottom: '16px' }}>
              Simple Process. Serious Protection.
            </div>

            <p style={{ fontSize: '16px', color: 'var(--kb-text)', lineHeight: 1.85, margin: '0 0 24px' }}>
              You schedule a consultation. Scott's team at Nexxess reviews your situation, your business, your family goals, and your exit timeline. If a trust makes sense, they build the right structure for you. The entire process is handled by licensed professionals. You stay informed, but you never have to figure it out alone.
            </p>

            {/* Steps */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px,1fr))', gap: '14px', margin: '0 0 24px' }}>
              {[
                { step: '1', title: 'Free Consultation', desc: 'Eric and Scott review your situation and tell you exactly what structure makes sense before your exit.' },
                { step: '2', title: 'Custom Trust Design', desc: 'Licensed attorneys and tax professionals build a trust tailored to your business, family, and goals.' },
                { step: '3', title: 'Implementation', desc: 'Assets are properly structured. Everything is documented, filed, and compliant from day one.' },
                { step: '4', title: 'Ongoing Administration', desc: 'Professional fiduciaries manage the trust. You and your family benefit for generations.' },
              ].map(s => (
                <div key={s.step} style={{
                  padding: '18px',
                  background: 'var(--kb-bg-raised)',
                  border: '1px solid var(--kb-border)',
                  borderRadius: '8px',
                }}>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '28px', fontWeight: 600, color: 'var(--kb-accent)', marginBottom: '6px' }}>{s.step}</div>
                  <div style={{ fontSize: '15px', fontWeight: 590, color: 'var(--kb-text)', marginBottom: '6px' }}>{s.title}</div>
                  <div style={{ fontSize: '14px', color: 'var(--kb-text-secondary)', lineHeight: 1.65 }}>{s.desc}</div>
                </div>
              ))}
            </div>

            {/* Track Record */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', margin: '0 0 24px' }}>
              {[
                { value: '35+', label: 'Years in Operation', color: 'var(--kb-accent)' },
                { value: '1,000+', label: 'Trusts Created', color: 'var(--kb-green)' },
                { value: '10,000+', label: 'Trusts Analyzed', color: 'var(--kb-accent)' },
              ].map(s => (
                <div key={s.label} style={{ textAlign: 'center', padding: '14px', background: 'var(--kb-bg-raised)', border: '1px solid var(--kb-border)', borderRadius: '8px' }}>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '26px', fontWeight: 600, color: s.color, marginBottom: '4px' }}>{s.value}</div>
                  <div style={{ fontSize: '13px', fontWeight: 510, color: 'var(--kb-text)' }}>{s.label}</div>
                </div>
              ))}
            </div>

            <div style={{ borderTop: '1px solid var(--kb-border)', paddingTop: '20px' }}>
              <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '18px', color: 'var(--kb-text)', lineHeight: 1.8, margin: 0, fontStyle: 'italic' }}>
                "When structure is correct, estate documents work as intended. When structure is wrong, no document can prevent conflict. That is why we exist."
              </p>
            </div>
          </div>

        </div>
      </motion.div>

      {/* Lead Form */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
        {submitted ? (
          <div style={{
            ...card, textAlign: 'center', padding: '48px 32px',
            borderColor: 'rgba(46,204,139,0.3)', background: 'rgba(46,204,139,0.05)',
          }}>
            <div style={{ marginBottom: "12px", color: "var(--kb-accent)" }}><svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/></svg></div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '26px', fontWeight: 600, marginBottom: '12px' }}>
              You're on the List
            </div>
            <p style={{ fontSize: '15px', color: 'var(--kb-text-secondary)', lineHeight: 1.7, maxWidth: '480px', margin: '0 auto 20px' }}>
              Scott McGrath's team at Nexxess and Eric will review your information and reach out within 1–2 business days to schedule your trust planning consultation.
            </p>
            <div style={{ fontSize: '13px', color: 'var(--kb-text-muted)' }}>
              Questions in the meantime? Email <span style={{ color: 'var(--kb-accent)' }}>Eric@KingdomBroker.com</span>
            </div>
          </div>
        ) : (
          <div style={{ ...card, border: '2px solid var(--kb-accent-border)', boxShadow: 'var(--kb-shadow-2)' }}>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '11px', color: 'var(--kb-accent)', letterSpacing: '0.14em', marginBottom: '6px' }}>
              GET STARTED
            </div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '30px', fontWeight: 600, marginBottom: '8px' }}>
              Schedule Your Trust Planning Consultation
            </div>
            <p style={{ fontSize: '14px', color: 'var(--kb-text-secondary)', margin: '0 0 24px', lineHeight: 1.6 }}>
              No cost. No obligation. Scott's team reviews your situation and tells you exactly what structure makes sense before your exit. Eric and Scott will reach out directly.
            </p>

            {/* Contact info */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '20px' }}>
              {[
                { label: 'Full Name', key: 'full_name', placeholder: 'John Smith', type: 'text' },
                { label: 'Email Address', key: 'email', placeholder: 'john@acmehvac.com', type: 'email' },
                { label: 'Phone Number', key: 'phone', placeholder: '(214) 555-0100', type: 'tel' },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 590, color: 'var(--kb-accent)', fontFamily: "'DM Mono', monospace", letterSpacing: '0.05em', marginBottom: '6px' }}>
                    {f.label}
                  </label>
                  <input
                    type={f.type} placeholder={f.placeholder}
                    value={(form as unknown as Record<string, string>)[f.key]}
                    onChange={e => set({ [f.key]: e.target.value } as Partial<typeof form>)}
                    style={{
                      width: '100%', padding: '10px 13px', boxSizing: 'border-box',
                      background: 'var(--kb-bg-raised)', border: '1px solid var(--kb-border)',
                      borderRadius: '7px', color: 'var(--kb-text)', fontSize: '13px',
                      fontFamily: "'Inter', system-ui, sans-serif", outline: 'none',
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Business value */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 590, color: 'var(--kb-accent)', fontFamily: "'DM Mono', monospace", letterSpacing: '0.05em', marginBottom: '8px' }}>
                Estimated Business Value
              </label>
              <RadioCards
                options={BUSINESS_VALUES.map(v => ({ id: v, label: v }))}
                value={form.business_value}
                onChange={v => set({ business_value: v })}
              />
            </div>

            {/* Exit timeline */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 590, color: 'var(--kb-accent)', fontFamily: "'DM Mono', monospace", letterSpacing: '0.05em', marginBottom: '8px' }}>
                Expected Exit Timeline
              </label>
              <RadioCards
                options={TIMELINES.map(v => ({ id: v, label: v }))}
                value={form.exit_timeline}
                onChange={v => set({ exit_timeline: v })}
              />
            </div>

            {/* Trust status */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 590, color: 'var(--kb-accent)', fontFamily: "'DM Mono', monospace", letterSpacing: '0.05em', marginBottom: '8px' }}>
                Do You Currently Have a Trust?
              </label>
              <RadioCards
                options={TRUST_STATUS}
                value={form.has_trust}
                onChange={v => set({ has_trust: v })}
              />
            </div>

            {/* Goals */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 590, color: 'var(--kb-accent)', fontFamily: "'DM Mono', monospace", letterSpacing: '0.05em', marginBottom: '8px' }}>
                What Are Your Goals? <span style={{ color: 'var(--kb-text-muted)', fontWeight: 400 }}>(select all that apply)</span>
              </label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {GOALS.map(g => (
                  <button key={g.id} type="button" onClick={() => toggleGoal(g.id)} style={{
                    padding: '10px 16px', cursor: 'pointer',
                    background: form.goals.includes(g.id) ? 'var(--kb-accent-dim)' : 'var(--kb-bg-card)',
                    border: `2px solid ${form.goals.includes(g.id) ? 'var(--kb-accent)' : 'var(--kb-border)'}`,
                    borderRadius: '8px', color: form.goals.includes(g.id) ? 'var(--kb-accent)' : 'var(--kb-text-secondary)',
                    fontSize: '14px', fontWeight: 510, transition: 'all 0.2s',
                    fontFamily: "'Inter', system-ui, sans-serif",
                  }}>
                    {g.icon} {g.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 590, color: 'var(--kb-accent)', fontFamily: "'DM Mono', monospace", letterSpacing: '0.05em', marginBottom: '6px' }}>
                Anything Else Scott &amp; Eric Should Know? <span style={{ color: 'var(--kb-text-muted)', fontWeight: 400 }}>(optional)</span>
              </label>
              <textarea
                rows={3} placeholder="e.g. Already spoken with a CPA. Have an S-corp. Concerned about state taxes in TX."
                value={form.notes}
                onChange={e => set({ notes: e.target.value })}
                style={{
                  width: '100%', padding: '10px 13px', boxSizing: 'border-box',
                  background: 'var(--kb-bg-raised)', border: '1px solid var(--kb-border)',
                  borderRadius: '7px', color: 'var(--kb-text)', fontSize: '13px',
                  fontFamily: "'Inter', system-ui, sans-serif", outline: 'none',
                  lineHeight: 1.6, resize: 'vertical',
                }}
              />
            </div>

            {/* Disclaimer */}
            <div style={{ padding: '12px 16px', marginBottom: '20px', background: 'var(--kb-bg-card)', border: '1px solid var(--kb-border-subtle)', borderRadius: '8px' }}>
              <div style={{ fontSize: '12px', color: 'var(--kb-text-muted)', lineHeight: 1.7 }}>
                 <strong style={{ color: 'var(--kb-text-secondary)' }}>Confidential.</strong> Your information is shared only with Eric Skeldon at Kingdom Broker and Scott McGrath at Nexxess. Kingdom Broker does not practice law, provide tax advice, or act as a fiduciary. All trust and estate planning is executed by Nexxess licensed professionals.
              </div>
            </div>

            <button
              onClick={submit}
              disabled={!canSubmit || submitting}
              style={{
                width: '100%', padding: '15px',
                background: canSubmit && !submitting ? 'var(--kb-accent)' : 'rgba(201,168,76,0.2)',
                border: 'none', borderRadius: '9px',
                color: canSubmit && !submitting ? 'var(--kb-bg)' : 'var(--kb-text-muted)',
                fontSize: '16px', fontWeight: 590,
                cursor: canSubmit && !submitting ? 'pointer' : 'not-allowed',
                fontFamily: "'Inter', system-ui, sans-serif", transition: 'all 0.2s',
              }}
            >
              {submitting ? 'Submitting…' : 'Request My Trust Planning Consultation →'}
            </button>
          </div>
        )}
      </motion.div>

    </div>
  )
}
