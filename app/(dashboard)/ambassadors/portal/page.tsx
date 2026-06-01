'use client'
import { useState, useEffect } from 'react'

const inputStyle = {
  width: '100%', padding: '12px 16px', background: 'var(--kb-bg)',
  border: '1px solid var(--kb-border)', borderRadius: '8px',
  color: 'var(--kb-text)', fontSize: '15px', outline: 'none', fontFamily: "'Inter', system-ui, sans-serif",
} as const

const card = {
  background: 'var(--kb-bg-panel)', border: '1px solid var(--kb-border)',
  borderRadius: '12px', padding: '24px',
} as const

type Ambassador = {
  id: string; name: string; email: string; referral_code: string;
  status: string; total_referrals: number; total_signed: number;
  total_closed: number; total_earned: number; created_at: string;
}

type Referral = {
  id: string; owner_name: string; business_name: string; industry: string;
  city: string; state: string; status: string; deal_value: number;
  success_fee: number; signing_bonus_paid: boolean; commission_amount: number;
  commission_paid: boolean; created_at: string;
}

export default function AmbassadorPortal() {
  const [email, setEmail] = useState('')
  const [ambassador, setAmbassador] = useState<Ambassador | null>(null)
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Referral form
  const [showForm, setShowForm] = useState(false)
  const [refForm, setRefForm] = useState({ owner_name: '', owner_email: '', owner_phone: '', business_name: '', industry: '', city: '', state: '', estimated_revenue: '' })
  const [refSubmitted, setRefSubmitted] = useState(false)
  const [editingCode, setEditingCode] = useState(false)
  const [newCode, setNewCode] = useState('')
  const [codeMsg, setCodeMsg] = useState('')

  const login = async () => {
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`/api/ambassadors/portal?email=${encodeURIComponent(email)}`)
      const data = await res.json()
      if (data.ambassador) {
        setAmbassador(data.ambassador)
        setReferrals(data.referrals || [])
      } else {
        setError('No ambassador account found with that email. Apply first at /ambassadors.')
      }
    } catch {
      setError('Connection error. Please try again.')
    }
    setLoading(false)
  }

  const submitReferral = async () => {
    if (!refForm.owner_name || !ambassador) return
    try {
      const res = await fetch('/api/ambassadors/refer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ambassador_id: ambassador.id, referral_code: ambassador.referral_code, ...refForm }),
      })
      if (res.ok) {
        setRefSubmitted(true)
        setShowForm(false)
        // Refresh referrals
        const refresh = await fetch(`/api/ambassadors/portal?email=${encodeURIComponent(email)}&code=${encodeURIComponent(code)}`)
        const data = await refresh.json()
        if (data.referrals) setReferrals(data.referrals)
        if (data.ambassador) setAmbassador(data.ambassador)
      }
    } catch { /* silent */ }
  }

  const STATUS_COLORS: Record<string, string> = {
    referred: '#5b8dee', contacted: '#C9A84C', signed: '#2ECC8B',
    active: '#2ECC8B', closed: '#C9A84C', lost: '#E84949',
  }

  // Login screen
  if (!ambassador) {
    return (
      <div style={{ padding: '80px 32px', maxWidth: '440px', margin: '0 auto', fontFamily: "'Inter', system-ui, sans-serif" }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontFamily: "'DM Mono', monospace", fontSize: '24px', fontWeight: 510, color: 'var(--kb-text)', fontVariantNumeric: 'tabular-nums', marginBottom: '8px' }}>
            Ambassador <span style={{ color: 'var(--kb-accent)' }}>Portal</span>
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--kb-text-secondary)' }}>Log in with your email</p>
        </div>
        <div style={{ ...card }}>
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '12px', color: 'var(--kb-text-secondary)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '6px', fontWeight: 600 }}>Email</label>
            <input style={inputStyle} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" onKeyDown={e => e.key === 'Enter' && login()} />
          </div>
          {error && <div style={{ color: 'var(--kb-red)', fontSize: '13px', marginBottom: '16px' }}>{error}</div>}
          <button onClick={login} disabled={loading || !email} style={{
            width: '100%', padding: '14px', background: 'var(--kb-accent)', color: '#FFFFFF',
            fontWeight: 590, fontSize: '15px', border: 'none', borderRadius: '8px', cursor: 'pointer',
            opacity: loading || !email ? 0.5 : 1,
          }}>{loading ? 'Logging in...' : 'Access Portal'}</button>
        </div>
        <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--kb-text-muted)', marginTop: '20px' }}>
          Not an ambassador yet? <a href="/ambassadors" style={{ color: 'var(--kb-accent)', textDecoration: 'none' }}>Apply here</a>
        </p>
      </div>
    )
  }

  // Dashboard
  const totalPending = referrals.filter(r => !r.commission_paid && r.status === 'closed').reduce((sum, r) => sum + (r.commission_amount || 0), 0)
  const totalPaid = referrals.filter(r => r.commission_paid).reduce((sum, r) => sum + (r.commission_amount || 0) + (r.signing_bonus_paid ? 2000 : 0), 0)

  return (
    <div style={{ padding: '40px 32px 80px', maxWidth: '900px', margin: '0 auto', fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <div style={{ fontSize: '12px', color: 'var(--kb-accent)', fontWeight: 590, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>Ambassador Portal</div>
          <h1 style={{ fontFamily: "'DM Mono', monospace", fontSize: '24px', fontWeight: 510, color: 'var(--kb-text)', fontVariantNumeric: 'tabular-nums', marginBottom: '4px' }}>
            Welcome, {ambassador.name.split(' ')[0]}
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--kb-text-secondary)' }}>Code: <span style={{ color: 'var(--kb-accent)', fontFamily: "'DM Mono', monospace" }}>{ambassador.referral_code}</span></p>
        </div>
        <button onClick={() => { setAmbassador(null); setEmail(''); setCode('') }} style={{
          padding: '8px 16px', background: 'transparent', border: '1px solid var(--kb-border)',
          borderRadius: '6px', color: 'var(--kb-text-secondary)', fontSize: '13px', cursor: 'pointer',
        }}>Sign Out</button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '28px' }}>
        {[
          { label: 'Total Referrals', value: referrals.length.toString(), color: 'var(--kb-text)' },
          { label: 'Signed', value: referrals.filter(r => ['signed', 'active', 'closed'].includes(r.status)).length.toString(), color: 'var(--kb-green)' },
          { label: 'Deals Closed', value: referrals.filter(r => r.status === 'closed').length.toString(), color: 'var(--kb-accent)' },
          { label: 'Total Earned', value: `$${(ambassador.total_earned || 0).toLocaleString()}`, color: 'var(--kb-green)' },
        ].map((s, i) => (
          <div key={i} style={{ ...card, textAlign: 'center', padding: '20px' }}>
            <div style={{ fontSize: '28px', fontFamily: "'Playfair Display', serif", fontWeight: 600, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '12px', color: 'var(--kb-text-secondary)', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: '4px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Referral Link */}
      <div style={{ background: 'var(--kb-accent-dim)', border: '1px solid var(--kb-accent-border)', borderRadius: '12px', padding: '20px 24px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '13px', color: 'var(--kb-accent)', fontWeight: 590, marginBottom: '4px' }}>Kingdom Broker Sales Page <span style={{ fontSize: '11px', color: 'var(--kb-text-secondary)', fontWeight: 400 }}>Your Referral Link</span></div>
            <div style={{ fontSize: '15px', color: 'var(--kb-text)', fontFamily: "'DM Mono', monospace" }}>kingdombroker.com/seller?ref={ambassador.referral_code}</div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => navigator.clipboard.writeText(`https://kingdombroker.com/seller?ref=${ambassador.referral_code}`)} style={{
              padding: '10px 20px', background: 'var(--kb-accent)', color: '#FFFFFF', fontWeight: 590,
              fontSize: '13px', border: 'none', borderRadius: '6px', cursor: 'pointer',
            }}>Copy Link</button>
            <button onClick={() => { setEditingCode(!editingCode); setNewCode(ambassador.referral_code); setCodeMsg('') }} style={{
              padding: '10px 16px', background: 'transparent', border: '1px solid var(--kb-accent-border)',
              borderRadius: '6px', color: 'var(--kb-accent)', fontSize: '13px', cursor: 'pointer',
            }}>{editingCode ? 'Cancel' : 'Customize'}</button>
          </div>
        </div>
        {editingCode && (
          <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px solid rgba(201,168,76,0.15)' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', color: 'var(--kb-text-muted)', whiteSpace: 'nowrap' }}>kingdombroker.com/seller?ref=</span>
              <input
                style={{ ...inputStyle, flex: 1 }}
                value={newCode}
                onChange={e => { setNewCode(e.target.value.replace(/[^a-zA-Z0-9-]/g, '').toLowerCase()); setCodeMsg('') }}
                placeholder="your-custom-code"
              />
              <button
                onClick={async () => {
                  if (newCode.length < 3) { setCodeMsg('Min 3 characters'); return }
                  if (newCode === ambassador.referral_code) { setEditingCode(false); return }
                  const check = await fetch(`/api/ambassadors/check-code?code=${encodeURIComponent(newCode)}`)
                  const checkData = await check.json()
                  if (!checkData.available) { setCodeMsg('That code is taken. Try another.'); return }
                  await fetch('/api/admin/ambassadors', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ table: 'ambassadors', id: ambassador.id, patch: { referral_code: newCode } }),
                  })
                  setAmbassador({ ...ambassador, referral_code: newCode })
                  // code updated
                  setEditingCode(false)
                  setCodeMsg('')
                }}
                style={{ padding: '10px 20px', background: '#2ECC8B', color: 'var(--kb-bg)', fontWeight: 590, fontSize: '13px', border: 'none', borderRadius: '6px', cursor: 'pointer', whiteSpace: 'nowrap' }}
              >Save</button>
            </div>
            {codeMsg && <div style={{ fontSize: '12px', color: 'var(--kb-red)', marginTop: '6px' }}>{codeMsg}</div>}
            <div style={{ fontSize: '11px', color: 'var(--kb-text-muted)', marginTop: '6px' }}>Letters, numbers, and hyphens only. Min 3 characters. First come first served.</div>
          </div>
        )}
      </div>

      {/* Free Valuation Lead Magnet Link */}
      <div style={{ background: 'rgba(46,204,139,0.06)', border: '1px solid rgba(46,204,139,0.2)', borderRadius: '12px', padding: '20px 24px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
              <span style={{ fontSize: '14px', color: 'var(--kb-green)', fontWeight: 590 }}>Free Business Valuation Lead Magnet</span>
              <span style={{ fontSize: '11px', color: 'var(--kb-accent)', fontWeight: 590, padding: '2px 8px', background: 'var(--kb-accent-dim)', border: '1px solid var(--kb-accent-border)', borderRadius: '4px' }}>$10K VALUE</span>
              <span style={{ fontSize: '11px', color: 'var(--kb-green)', fontWeight: 590, padding: '2px 8px', background: 'rgba(46,204,139,0.12)', border: '1px solid rgba(46,204,139,0.3)', borderRadius: '4px' }}>FREE</span>
            </div>
            <div style={{ fontSize: '15px', color: 'var(--kb-text)', fontFamily: "'DM Mono', monospace" }}>kingdombroker.com/valuation?ref={ambassador.referral_code}</div>
            <div style={{ fontSize: '13px', color: 'var(--kb-text-secondary)', marginTop: '6px' }}>Share this link to give business owners a free valuation. When they become a client, the referral is tracked to you.</div>
          </div>
          <button onClick={() => navigator.clipboard.writeText(`https://kingdombroker.com/valuation?ref=${ambassador.referral_code}`)} style={{
            padding: '10px 20px', background: '#2ECC8B', color: 'var(--kb-bg)', fontWeight: 590,
            fontSize: '13px', border: 'none', borderRadius: '6px', cursor: 'pointer', whiteSpace: 'nowrap',
          }}>Copy Link</button>
        </div>
      </div>

      {/* Marketing Toolkit */}
      <div style={{ ...card, marginBottom: '16px' }}>
        <h3 style={{ fontSize: '18px', color: 'var(--kb-text)', fontWeight: 590, marginBottom: '16px' }}>Marketing Toolkit</h3>
        <p style={{ fontSize: '14px', color: 'var(--kb-text-secondary)', marginBottom: '20px' }}>Copy and paste these hooks to share with business owners. Replace the link with your referral link above.</p>

        {[
          { title: 'For Business Owners Thinking About Selling', copy: `Do you know what your business is actually worth? Not a guess, a real number based on your industry and financials. Kingdom Broker built a free tool that gives you a data driven valuation in about 10 minutes. No pitch, no obligation. Just clarity.\n\nhttps://kingdombroker.com/valuation?ref=${ambassador.referral_code}` },
          { title: 'For CPAs and Advisors to Share', copy: `I wanted to pass along a free resource for any of your clients thinking about their next chapter. Kingdom Broker offers a free business valuation tool that takes about 10 minutes. It gives owners a real estimate based on EBITDA multiples in their industry. Worth sharing with anyone who has asked "what is my business worth?"\n\nhttps://kingdombroker.com/valuation?ref=${ambassador.referral_code}` },
          { title: 'Social Media Post', copy: `The people quietly building wealth are not starting businesses. They are buying them.\n\nHVAC companies, roofing businesses, dental practices. $1M-$20M businesses with real cash flow.\n\nWant to know what yours is worth? Free valuation tool, takes 10 minutes:\n\nhttps://kingdombroker.com/valuation?ref=${ambassador.referral_code}` },
          { title: 'Text Message to a Business Owner', copy: `Hey, thought of you. Kingdom Broker has a free tool that tells you what your business would sell for today based on real market data. Takes 10 minutes. No strings. Check it out: https://kingdombroker.com/valuation?ref=${ambassador.referral_code}` },
          { title: 'Faith Community Hook', copy: `"A good man leaves an inheritance for his children's children." Proverbs 13:22\n\nIf you have built a business and you are thinking about what is next, this free valuation tool will show you what it is worth today. Built by Kingdom Broker, a faith driven M&A advisory.\n\nhttps://kingdombroker.com/valuation?ref=${ambassador.referral_code}` },
        ].map((hook, i) => (
          <div key={i} style={{ marginBottom: '14px', padding: '16px', background: 'var(--kb-bg-card)', border: '1px solid var(--kb-border-subtle)', borderRadius: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ fontSize: '14px', fontWeight: 590, color: 'var(--kb-accent)', fontFamily: "'DM Mono', monospace", fontVariantNumeric: 'tabular-nums' }}>{hook.title}</div>
              <button onClick={() => navigator.clipboard.writeText(hook.copy)} style={{
                padding: '6px 14px', background: 'var(--kb-accent-dim)', border: '1px solid var(--kb-accent-border)',
                borderRadius: '4px', color: 'var(--kb-accent)', fontSize: '12px', cursor: 'pointer', fontWeight: 590,
              }}>Copy</button>
            </div>
            <pre style={{ fontSize: '13px', color: 'var(--kb-text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: 0, fontFamily: "'Inter', system-ui, sans-serif" }}>{hook.copy}</pre>
          </div>
        ))}
      </div>

      {/* W9 */}
      <div style={{ ...card, marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: '15px', fontWeight: 590, color: 'var(--kb-text)', marginBottom: '4px' }}>W9 for Tax Reporting</div>
          <div style={{ fontSize: '13px', color: 'var(--kb-text-secondary)' }}>Required before your first payout. Download, complete, and email to <a href="mailto:Eric@KingdomBroker.com" style={{ color: 'var(--kb-accent)', textDecoration: 'none' }}>Eric@KingdomBroker.com</a></div>
        </div>
        <a href="https://www.irs.gov/pub/irs-pdf/fw9.pdf" target="_blank" rel="noopener noreferrer" style={{
          padding: '10px 20px', background: 'transparent', border: '1px solid var(--kb-border)',
          borderRadius: '6px', color: 'var(--kb-text)', fontSize: '13px', textDecoration: 'none', fontWeight: 590, whiteSpace: 'nowrap',
        }}>Download W9</a>
      </div>

      {/* Submit Referral Button */}
      <div style={{ marginBottom: '28px' }}>
        {refSubmitted && (
          <div style={{ padding: '14px 18px', background: 'rgba(46,204,139,0.08)', border: '1px solid rgba(46,204,139,0.2)', borderRadius: '8px', marginBottom: '16px' }}>
            <span style={{ fontSize: '14px', color: 'var(--kb-green)', fontWeight: 600 }}>Referral submitted! We will reach out to them within 24 hours.</span>
          </div>
        )}

        {!showForm ? (
          <button onClick={() => setShowForm(true)} style={{
            padding: '14px 28px', background: 'var(--kb-accent)', color: '#FFFFFF', fontWeight: 590,
            fontSize: '15px', border: 'none', borderRadius: '8px', cursor: 'pointer',
          }}>Submit a New Referral</button>
        ) : (
          <div style={{ ...card }}>
            <h3 style={{ fontSize: '18px', color: 'var(--kb-text)', fontWeight: 590, marginBottom: '20px' }}>New Referral</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--kb-text-secondary)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '5px', fontWeight: 600 }}>Owner Name *</label>
                <input style={inputStyle} value={refForm.owner_name} onChange={e => setRefForm({ ...refForm, owner_name: e.target.value })} placeholder="John Smith" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--kb-text-secondary)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '5px', fontWeight: 600 }}>Business Name</label>
                <input style={inputStyle} value={refForm.business_name} onChange={e => setRefForm({ ...refForm, business_name: e.target.value })} placeholder="Smith HVAC" />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--kb-text-secondary)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '5px', fontWeight: 600 }}>Email</label>
                <input style={inputStyle} value={refForm.owner_email} onChange={e => setRefForm({ ...refForm, owner_email: e.target.value })} placeholder="john@smithhvac.com" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--kb-text-secondary)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '5px', fontWeight: 600 }}>Phone</label>
                <input style={inputStyle} value={refForm.owner_phone} onChange={e => setRefForm({ ...refForm, owner_phone: e.target.value })} placeholder="(214) 555 0000" />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--kb-text-secondary)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '5px', fontWeight: 600 }}>Industry</label>
                <input style={inputStyle} value={refForm.industry} onChange={e => setRefForm({ ...refForm, industry: e.target.value })} placeholder="HVAC" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--kb-text-secondary)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '5px', fontWeight: 600 }}>City, State</label>
                <input style={inputStyle} value={refForm.city} onChange={e => setRefForm({ ...refForm, city: e.target.value })} placeholder="Dallas, TX" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--kb-text-secondary)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '5px', fontWeight: 600 }}>Est. Revenue</label>
                <input style={inputStyle} value={refForm.estimated_revenue} onChange={e => setRefForm({ ...refForm, estimated_revenue: e.target.value })} placeholder="$2M" />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={submitReferral} disabled={!refForm.owner_name} style={{
                padding: '12px 24px', background: 'var(--kb-accent)', color: '#FFFFFF', fontWeight: 590,
                fontSize: '14px', border: 'none', borderRadius: '6px', cursor: 'pointer',
                opacity: !refForm.owner_name ? 0.5 : 1,
              }}>Submit Referral</button>
              <button onClick={() => setShowForm(false)} style={{
                padding: '12px 24px', background: 'transparent', border: '1px solid var(--kb-border)',
                borderRadius: '6px', color: 'var(--kb-text-secondary)', fontSize: '14px', cursor: 'pointer',
              }}>Cancel</button>
            </div>
          </div>
        )}
      </div>

      {/* Referrals Table */}
      <div style={{ ...card }}>
        <h3 style={{ fontSize: '18px', color: 'var(--kb-text)', fontWeight: 590, marginBottom: '20px' }}>Your Referrals</h3>
        {referrals.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{ marginBottom: '12px', color: 'var(--kb-text-muted)' }}>
              <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/></svg>
            </div>
            <p style={{ fontSize: '15px', color: 'var(--kb-text-secondary)' }}>No referrals yet. Share your link or submit a referral above.</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--kb-border)' }}>
                {['Business', 'Owner', 'Status', 'Signing Bonus', 'Commission', 'Date'].map(h => (
                  <th key={h} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--kb-text-secondary)', fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {referrals.map(r => (
                <tr key={r.id} style={{ borderBottom: '1px solid var(--kb-border-subtle)' }}>
                  <td style={{ padding: '12px', color: 'var(--kb-text)', fontWeight: 600 }}>{r.business_name || 'Pending'}</td>
                  <td style={{ padding: '12px', color: 'var(--kb-text-secondary)' }}>{r.owner_name}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: 590, letterSpacing: '0.05em', textTransform: 'uppercase', color: STATUS_COLORS[r.status] || 'var(--kb-text-secondary)', background: `${STATUS_COLORS[r.status] || 'var(--kb-text-secondary)'}15`, border: `1px solid ${STATUS_COLORS[r.status] || 'var(--kb-text-secondary)'}30` }}>
                      {r.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px', color: r.signing_bonus_paid ? '#2ECC8B' : 'var(--kb-text-muted)', fontWeight: 600 }}>
                    {r.signing_bonus_paid ? '$2,000 Paid' : '$2,000 Pending'}
                  </td>
                  <td style={{ padding: '12px', color: r.commission_paid ? '#2ECC8B' : 'var(--kb-text-secondary)', fontWeight: 600 }}>
                    {r.commission_amount ? `$${r.commission_amount.toLocaleString()}${r.commission_paid ? ' Paid' : ' Pending'}` : 'At close'}
                  </td>
                  <td style={{ padding: '12px', color: 'var(--kb-text-muted)', fontSize: '13px' }}>
                    {new Date(r.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
