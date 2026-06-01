'use client'
import { useState } from 'react'

const card = {
  background: 'var(--kb-bg-panel)',
  border: '1px solid var(--kb-border)',
  borderRadius: '12px',
  padding: '28px 32px',
} as const

const goldBorder = {
  background: 'var(--kb-accent-dim)',
  border: '1px solid var(--kb-accent-border)',
  borderRadius: '12px',
  padding: '28px 32px',
} as const

const inputStyle = {
  width: '100%',
  padding: '12px 16px',
  background: 'var(--kb-bg)',
  border: '1px solid var(--kb-border)',
  borderRadius: '8px',
  color: 'var(--kb-text)',
  fontSize: '15px',
  outline: 'none',
  fontFamily: "'Inter', system-ui, sans-serif",
} as const

const FEE_EXAMPLES = [
  { deal: '$2M', ambassador: '$20,000', upfront: '$2,000', total: '$22,000' },
  { deal: '$5M', ambassador: '$40,000', upfront: '$2,000', total: '$42,000' },
  { deal: '$10M', ambassador: '$70,000', upfront: '$2,000', total: '$72,000' },
]

const BENEFITS = [
  { title: '$2,000 Cash on Signing', desc: 'Paid within 5 business days of your referral signing the engagement and paying their deposit.' },
  { title: '20% Commission per Closed Deal', desc: 'When the deal closes, you earn your 20% commission. On a $5M deal, that is $40,000, on top of the $2,000 you already pocketed.' },
  { title: 'Unique Referral Link', desc: 'Track every referral. See when they sign, when their deal progresses, and when your commission is earned.' },
  { title: 'Ambassador Dashboard', desc: 'Your own portal to track referrals, commissions earned, and payouts. Full transparency.' },
]

export default function AmbassadorsPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', how_heard: '', custom_code: '' })
  const [codeAvailable, setCodeAvailable] = useState<boolean | null>(null)
  const [checkingCode, setCheckingCode] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [resultCode, setResultCode] = useState('')

  const handleSubmit = async () => {
    if (!form.name || !form.email) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/ambassadors/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        const data = await res.json()
        setResultCode(data.referral_code || '')
        setSubmitted(true)
      }
    } catch { /* silent */ }
    setSubmitting(false)
  }

  return (
    <div style={{ padding: '40px 32px 80px', maxWidth: '900px', margin: '0 auto', fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* Logo + Referral Program badge */}
      <div style={{ marginBottom: '24px', display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-start' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/kb-logo.png" alt="Kingdom Broker" style={{ height: '40px', marginBottom: '8px' }} />
        <div style={{
          background: 'var(--kb-accent-dim)', border: '1px solid var(--kb-accent-border)',
          borderRadius: '4px', padding: '5px 14px',
        }}>
          <span style={{ fontSize: '11px', color: 'var(--kb-accent)', fontWeight: 590, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
            Referral Program
          </span>
        </div>
      </div>

      <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '38px', fontWeight: 600, color: 'var(--kb-text)', marginBottom: '12px', lineHeight: 1.15 }}>
        Earn $2,000 Per Referral.<br /><span style={{ color: 'var(--kb-accent)' }}>Plus 20% of Every Deal.</span>
      </h1>
      <p style={{ fontSize: '17px', color: 'var(--kb-text-secondary)', lineHeight: 1.7, marginBottom: '40px', maxWidth: '640px' }}>
        Know a business owner thinking about selling? Refer them to Kingdom Broker. You earn $2,000 cash when they sign on as a client, plus a 20% commission when the deal closes. On a $5M deal, that is $42,000 in your pocket.
      </p>

      {/* How It Works */}
      <div style={{ ...card, marginBottom: '24px' }}>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', color: 'var(--kb-text)', marginBottom: '24px' }}>How It Works</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
          {[
            { step: '01', title: 'Refer', desc: 'Share your unique referral link or introduce us directly to a business owner considering an exit.' },
            { step: '02', title: 'They Sign', desc: 'Once the owner signs with Kingdom Broker and pays their deposit, you receive $2,000 cash within 5 business days.' },
            { step: '03', title: 'Deal Closes', desc: 'When the business sells, you earn your 20% commission. Bigger deal, bigger check.' },
          ].map(s => (
            <div key={s.step} style={{ padding: '20px', background: 'var(--kb-bg-card)', border: '1px solid var(--kb-border-subtle)', borderRadius: '10px' }}>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '24px', fontWeight: 590, color: 'var(--kb-accent)', marginBottom: '10px' }}>{s.step}</div>
              <div style={{ fontSize: '16px', fontWeight: 590, color: 'var(--kb-text)', marginBottom: '6px' }}>{s.title}</div>
              <div style={{ fontSize: '14px', color: 'var(--kb-text-secondary)', lineHeight: 1.6 }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Earnings Table */}
      <div style={{ ...goldBorder, marginBottom: '24px' }}>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', color: 'var(--kb-accent)', marginBottom: '8px' }}>What You Earn</h2>
        <p style={{ fontSize: '14px', color: 'var(--kb-text-secondary)', marginBottom: '24px' }}>You earn $2,000 once they become a client, and a 20% commission at deal close. The bigger the business, the bigger your payout.</p>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '15px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(201,168,76,0.3)' }}>
              <th style={{ padding: '12px 16px', textAlign: 'left', color: 'var(--kb-accent)', fontSize: '12px', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600 }}>Deal Size</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', color: 'var(--kb-accent)', fontSize: '12px', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600 }}>Signing Bonus</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', color: 'var(--kb-accent)', fontSize: '12px', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600 }}>Your 20% at Close</th>
              <th style={{ padding: '12px 16px', textAlign: 'right', color: 'var(--kb-accent)', fontSize: '12px', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600 }}>Total You Earn</th>
            </tr>
          </thead>
          <tbody>
            {FEE_EXAMPLES.map((row, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--kb-border-subtle)' }}>
                <td style={{ padding: '14px 16px', color: 'var(--kb-text)', fontWeight: 600 }}>{row.deal}</td>
                <td style={{ padding: '14px 16px', color: 'var(--kb-green)', fontWeight: 600 }}>$2,000</td>
                <td style={{ padding: '14px 16px', color: 'var(--kb-green)', fontWeight: 600 }}>{row.ambassador}</td>
                <td style={{ padding: '14px 16px', textAlign: 'right', fontFamily: "'Playfair Display', serif", fontSize: '20px', color: 'var(--kb-accent)', fontWeight: 600 }}>{row.total}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ marginTop: '20px', padding: '14px 18px', background: 'rgba(46,204,139,0.08)', border: '1px solid rgba(46,204,139,0.2)', borderRadius: '8px' }}>
          <span style={{ fontSize: '14px', color: 'var(--kb-green)', fontWeight: 600 }}>One referral on a $5M deal = $42,000 to you.</span>
          <span style={{ fontSize: '14px', color: 'var(--kb-text-secondary)' }}> No cap on referrals. The more you refer, the more you earn.</span>
        </div>
      </div>

      {/* Benefits */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
        {BENEFITS.map((b, i) => (
          <div key={i} style={{ ...card, padding: '22px 24px' }}>
            <div style={{ fontSize: '15px', fontWeight: 590, color: 'var(--kb-text)', marginBottom: '6px' }}>{b.title}</div>
            <div style={{ fontSize: '14px', color: 'var(--kb-text-secondary)', lineHeight: 1.6 }}>{b.desc}</div>
          </div>
        ))}
      </div>

      {/* Application Form */}
      <div style={{ ...goldBorder }}>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', color: 'var(--kb-text)', marginBottom: '8px' }}>
          {submitted ? 'Application Received' : 'Apply to Become an Ambassador'}
        </h2>

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '32px 0' }}>
            <div style={{ marginBottom: '16px', color: 'var(--kb-green)' }}>
              <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="8,12 11,15 16,9"/></svg>
            </div>
            <p style={{ fontSize: '18px', color: 'var(--kb-text)', fontWeight: 590, marginBottom: '8px' }}>Welcome to the Kingdom Broker Ambassador Program</p>

            {resultCode && (
              <div style={{ margin: '20px auto', maxWidth: '400px', padding: '18px 24px', background: 'var(--kb-accent-dim)', border: '1px solid var(--kb-accent-border)', borderRadius: '10px' }}>
                <div style={{ fontSize: '12px', color: 'var(--kb-accent)', fontWeight: 590, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>Your Referral Code</div>
                <div style={{ fontSize: '22px', color: 'var(--kb-text)', fontFamily: "'DM Mono', monospace", fontWeight: 590, marginBottom: '12px' }}>{resultCode}</div>
                <div style={{ fontSize: '13px', color: 'var(--kb-text-secondary)', marginBottom: '4px' }}>Email: <span style={{ color: 'var(--kb-text)' }}>{form.email}</span></div>
                <div style={{ fontSize: '12px', color: 'var(--kb-text-muted)', marginTop: '8px' }}>Save this code. You need it + your email to log into your portal.</div>
              </div>
            )}

            <a href="/ambassadors/portal" style={{
              display: 'inline-block', marginTop: '16px', padding: '14px 32px',
              background: 'var(--kb-accent)', color: '#FFFFFF', fontWeight: 590, fontSize: '15px',
              border: 'none', borderRadius: '8px', textDecoration: 'none', cursor: 'pointer',
            }}>Go to Your Ambassador Portal</a>

            <p style={{ fontSize: '13px', color: 'var(--kb-text-secondary)', marginTop: '16px' }}>Log in with your email and the referral code above.</p>
          </div>
        ) : (
          <>
            <p style={{ fontSize: '14px', color: 'var(--kb-text-secondary)', marginBottom: '24px' }}>
              CPAs, attorneys, wealth advisors, business consultants, and anyone connected to business owners are ideal ambassadors.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--kb-text-secondary)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '6px', fontWeight: 600 }}>Full Name *</label>
                <input style={inputStyle} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="John Smith" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--kb-text-secondary)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '6px', fontWeight: 600 }}>Email *</label>
                <input style={inputStyle} type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="john@company.com" />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--kb-text-secondary)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '6px', fontWeight: 600 }}>Phone</label>
                <input style={inputStyle} value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="(214) 555 0000" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--kb-text-secondary)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '6px', fontWeight: 600 }}>Company / Title</label>
                <input style={inputStyle} value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} placeholder="Smith CPA Group" />
              </div>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--kb-text-secondary)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '6px', fontWeight: 600 }}>Choose Your Referral Link (optional)</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0' }}>
                <div style={{ padding: '12px 14px', background: 'var(--kb-bg)', border: '1px solid var(--kb-border)', borderRight: 'none', borderRadius: '8px 0 0 8px', color: 'var(--kb-text-muted)', fontSize: '14px', whiteSpace: 'nowrap' }}>kingdombroker.com/seller?ref=</div>
                <input
                  style={{ ...inputStyle, borderRadius: '0 8px 8px 0', flex: 1, textTransform: 'lowercase' }}
                  value={form.custom_code}
                  onChange={e => {
                    const val = e.target.value.replace(/[^a-zA-Z0-9-]/g, '').toLowerCase()
                    setForm({ ...form, custom_code: val })
                    setCodeAvailable(null)
                  }}
                  onBlur={async () => {
                    if (!form.custom_code || form.custom_code.length < 3) { setCodeAvailable(null); return }
                    setCheckingCode(true)
                    try {
                      const res = await fetch(`/api/ambassadors/check-code?code=${encodeURIComponent(form.custom_code)}`)
                      const data = await res.json()
                      setCodeAvailable(data.available)
                    } catch { setCodeAvailable(null) }
                    setCheckingCode(false)
                  }}
                  placeholder="johncpa"
                />
              </div>
              {checkingCode && <div style={{ fontSize: '12px', color: 'var(--kb-text-secondary)', marginTop: '4px' }}>Checking availability...</div>}
              {codeAvailable === true && <div style={{ fontSize: '12px', color: 'var(--kb-green)', marginTop: '4px' }}>That code is available!</div>}
              {codeAvailable === false && <div style={{ fontSize: '12px', color: 'var(--kb-red)', marginTop: '4px' }}>That code is already taken. Try another.</div>}
              <div style={{ fontSize: '11px', color: 'var(--kb-text-muted)', marginTop: '4px' }}>Letters, numbers, and hyphens only. Min 3 characters. Leave blank for auto-generated.</div>
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--kb-text-secondary)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '6px', fontWeight: 600 }}>How are you connected to business owners?</label>
              <input style={inputStyle} value={form.how_heard} onChange={e => setForm({ ...form, how_heard: e.target.value })} placeholder="CPA with 50+ business owner clients, church network, industry contacts..." />
            </div>
            <button
              onClick={handleSubmit}
              disabled={submitting || !form.name || !form.email}
              style={{
                width: '100%', padding: '16px', background: 'var(--kb-accent)', color: '#FFFFFF',
                fontWeight: 590, fontSize: '16px', letterSpacing: '0.05em', textTransform: 'uppercase',
                border: 'none', borderRadius: '8px', cursor: 'pointer',
                opacity: submitting || !form.name || !form.email ? 0.5 : 1,
              }}
            >
              {submitting ? 'Submitting...' : 'Apply Now'}
            </button>
          </>
        )}
      </div>

      {/* W9 Requirement */}
      <div style={{ ...card, marginTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: '15px', fontWeight: 590, color: 'var(--kb-text)', marginBottom: '4px' }}>W9 Required for Payouts</div>
          <div style={{ fontSize: '14px', color: 'var(--kb-text-secondary)', lineHeight: 1.6 }}>Download, complete, and email your W9 to <a href="mailto:Eric@KingdomBroker.com" style={{ color: 'var(--kb-accent)', textDecoration: 'none' }}>Eric@KingdomBroker.com</a> before your first commission is paid.</div>
        </div>
        <a href="https://www.irs.gov/pub/irs-pdf/fw9.pdf" target="_blank" rel="noopener noreferrer" style={{
          padding: '12px 24px', background: 'var(--kb-accent)', color: '#FFFFFF', fontWeight: 590,
          fontSize: '14px', border: 'none', borderRadius: '6px', cursor: 'pointer', textDecoration: 'none', whiteSpace: 'nowrap',
        }}>Download W9</a>
      </div>

      {/* Fine print */}
      <div style={{ marginTop: '16px', padding: '20px 24px', background: 'var(--kb-bg-panel)', border: '1px solid var(--kb-border)', borderRadius: '8px' }}>
        <p style={{ fontSize: '13px', color: 'var(--kb-text-secondary)', lineHeight: 1.75, margin: 0 }}>
          Ambassador commissions are paid upon verified deal close. The $2,000 signing bonus is paid within 5 business days of the referred client signing their engagement agreement and paying their deposit. The 20% commission is paid within 30 days of deal closing. Kingdom Broker reserves the right to approve or deny Ambassador applications. The referral must be the first point of contact. Existing Kingdom Broker leads do not qualify. A completed W9 must be on file before any payout is processed.
        </p>
      </div>
    </div>
  )
}
