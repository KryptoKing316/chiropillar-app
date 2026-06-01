'use client'
import { useState, useEffect, useCallback } from 'react'

type Client = {
  id: string
  email: string
  full_name: string
  role: string
  company_name: string
  created_at: string
  is_demo: boolean
  deals: { id: string; business_name: string; status: string; asking_price: number; industry: string }[]
  buyer_profiles: { id: string; deal_size_min: number; deal_size_max: number; onboarding_complete: boolean; funding_method: string }[]
}

const ROLE_COLORS: Record<string, string> = {
  seller: '#C9A84C',
  buyer: '#4A9EDB',
  admin: '#E87373',
}

const STATUS_COLORS: Record<string, string> = {
  onboarding: 'var(--kb-text-secondary)',
  active: '#C9A84C',
  matched: '#4A9EDB',
  loi: '#A78BFA',
  due_diligence: '#F59E0B',
  closed: '#2ECC8B',
}

function fmt(n: number) {
  if (!n) return '—'
  if (n >= 1000000) return '$' + (n / 1000000).toFixed(1) + 'M'
  if (n >= 1000) return '$' + Math.round(n / 1000) + 'K'
  return '$' + n
}

export default function AdminPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'seller' | 'buyer'>('all')
  const [magicLinks, setMagicLinks] = useState<Record<string, string>>({})
  const [linkLoading, setLinkLoading] = useState<Record<string, boolean>>({})
  const [newClient, setNewClient] = useState({ full_name: '', email: '', role: 'seller' })
  const [creating, setCreating] = useState(false)
  const [createSuccess, setCreateSuccess] = useState('')
  const [createError, setCreateError] = useState('')

  // Quick magic link form (works for ANY email — bypasses Supabase rate limit via service role)
  const [quickEmail, setQuickEmail] = useState('')
  const [quickLoading, setQuickLoading] = useState(false)
  const [quickResult, setQuickResult] = useState<{ link?: string; error?: string; redirect?: string }>({})

  const fetchClients = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/clients${filter !== 'all' ? `?role=${filter}` : ''}`)
      const data = await res.json()
      setClients(data.clients ?? [])
      setTotal(data.total ?? 0)
    } catch {
      console.error('Failed to fetch clients')
    }
    setLoading(false)
  }, [filter])

  useEffect(() => { fetchClients() }, [fetchClients])

  const sendMagicLink = async (email: string, clientId: string) => {
    setLinkLoading(p => ({ ...p, [clientId]: true }))
    try {
      const res = await fetch('/api/admin/send-magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (data.magic_link) {
        setMagicLinks(p => ({ ...p, [clientId]: data.magic_link }))
      } else {
        alert(data.error ?? 'Failed to generate link')
      }
    } catch {
      alert('Failed to generate magic link')
    }
    setLinkLoading(p => ({ ...p, [clientId]: false }))
  }

  const sendQuickMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!quickEmail.trim()) return
    setQuickLoading(true)
    setQuickResult({})
    try {
      const res = await fetch('/api/admin/send-magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: quickEmail.trim().toLowerCase() }),
      })
      const data = await res.json()
      if (data.magic_link) {
        setQuickResult({ link: data.magic_link, redirect: data.redirect_path })
      } else {
        setQuickResult({ error: data.error ?? 'Failed to generate link' })
      }
    } catch {
      setQuickResult({ error: 'Network error generating link' })
    }
    setQuickLoading(false)
  }

  const createClient = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    setCreateError('')
    setCreateSuccess('')
    try {
      const res = await fetch('/api/admin/create-client', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newClient),
      })
      const data = await res.json()
      if (data.success) {
        setCreateSuccess(`<svg viewBox="0 0 14 14" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3,7 6,10 11,4"/></svg> Created ${data.email} as ${data.role}`)
        setNewClient({ full_name: '', email: '', role: 'seller' })
        fetchClients()
      } else {
        setCreateError(data.error ?? 'Failed to create client')
      }
    } catch {
      setCreateError('Failed to create client')
    }
    setCreating(false)
  }

  const sellers = clients.filter(c => c.role === 'seller').length
  const buyers = clients.filter(c => c.role === 'buyer').length
  const pending = clients.filter(c => {
    if (c.role === 'seller') return c.deals?.[0]?.status === 'onboarding'
    if (c.role === 'buyer') return !c.buyer_profiles?.[0]?.onboarding_complete
    return false
  }).length

  const S = {
    card: { background: 'var(--kb-bg-panel)', border: '1px solid var(--kb-border)', borderRadius: '8px', padding: '20px 24px' } as React.CSSProperties,
    label: { fontSize: '11px', color: 'var(--kb-text-muted)', textTransform: 'uppercase' as const, letterSpacing: '0.1em', marginBottom: '4px' },
    input: { width: '100%', padding: '11px 14px', background: 'var(--kb-bg-raised)', border: '1px solid var(--kb-border)', borderRadius: '9px', color: 'var(--kb-text)', fontSize: '14px', fontFamily: "'Inter', system-ui, sans-serif", outline: 'none' } as React.CSSProperties,
  }

  return (
    <div style={{ padding: '32px 36px', fontFamily: "'Inter', system-ui, sans-serif", color: 'var(--kb-text)', maxWidth: '1200px' }}>

      {/* Header */}
      <div style={{ marginBottom: '28px', display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div>
          <div style={{ fontSize: '11px', color: '#E87373', fontWeight: 590, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ background: 'rgba(231,76,60,0.12)', border: '1px solid rgba(232,73,73,0.3)', borderRadius: '4px', padding: '2px 8px' }}>Admin Only</span>
          </div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '28px', fontWeight: 600, margin: '0 0 6px', letterSpacing: '-0.3px', color: 'var(--kb-text)' }}>Client Management</h1>
          <p style={{ fontSize: '15px', color: 'var(--kb-text-secondary)', margin: 0 }}>Create clients, send magic links, track onboarding status.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="kb-grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '24px' }}>
        {[
          { label: 'Total Clients', value: total, color: 'var(--kb-text)' },
          { label: 'Sellers', value: sellers, color: 'var(--kb-accent)' },
          { label: 'Buyers', value: buyers, color: '#4A9EDB' },
          { label: 'Pending Onboarding', value: pending, color: '#F59E0B' },
        ].map(s => (
          <div key={s.label} style={S.card}>
            <div style={S.label}>{s.label}</div>
            <div style={{ fontSize: '28px', fontWeight: 590, color: s.color, fontFamily: "'Playfair Display', serif" }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '16px' }}>
        {(['all', 'seller', 'buyer'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '7px 16px', borderRadius: '8px', border: 'none',
            background: filter === f ? '#C9A84C' : 'var(--kb-bg-raised)',
            color: filter === f ? 'var(--kb-bg)' : 'var(--kb-text-secondary)',
            fontSize: '13px', fontWeight: filter === f ? 700 : 400,
            fontFamily: "'Inter', system-ui, sans-serif", cursor: 'pointer',
            textTransform: 'capitalize',
          }}>{f === 'all' ? 'All Clients' : f + 's'}</button>
        ))}
      </div>

      {/* Client Table */}
      <div style={{ ...S.card, padding: '0', marginBottom: '24px', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--kb-text-muted)' }}>Loading clients…</div>
        ) : clients.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--kb-text-muted)' }}>No clients yet. Create your first one below.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--kb-border)' }}>
                {['Name / Email', 'Role', 'Deal / Status', 'Onboarding', 'Joined', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '14px 16px', textAlign: 'left', color: 'var(--kb-text-muted)', fontSize: '11px', fontWeight: 590, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {clients.map(c => {
                const deal = c.deals?.[0]
                const bp = c.buyer_profiles?.[0]
                const onboardingDone = c.role === 'seller'
                  ? (deal && deal.status !== 'onboarding')
                  : bp?.onboarding_complete
                const magicLink = magicLinks[c.id]

                return (
                  <>
                    <tr key={c.id} style={{ borderBottom: magicLink ? 'none' : '1px solid var(--kb-border-subtle)' }}>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 590, color: 'var(--kb-text)', marginBottom: '2px' }}>{c.full_name || '—'}</div>
                        <div style={{ fontSize: '12px', color: 'var(--kb-text-muted)' }}>{c.email}</div>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ background: `${ROLE_COLORS[c.role] ?? 'var(--kb-text-secondary)'}18`, border: `1px solid ${ROLE_COLORS[c.role] ?? 'var(--kb-text-secondary)'}40`, borderRadius: '12px', padding: '3px 10px', fontSize: '12px', fontWeight: 590, color: ROLE_COLORS[c.role] ?? 'var(--kb-text-secondary)', textTransform: 'capitalize' }}>
                          {c.role}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        {c.role === 'seller' && deal ? (
                          <div>
                            <div style={{ fontSize: '13px', color: 'var(--kb-text)', marginBottom: '3px' }}>{deal.business_name || 'Unnamed deal'}</div>
                            <span style={{ background: `${STATUS_COLORS[deal.status] ?? 'var(--kb-text-secondary)'}18`, border: `1px solid ${STATUS_COLORS[deal.status] ?? 'var(--kb-text-secondary)'}40`, borderRadius: '4px', padding: '2px 8px', fontSize: '11px', fontWeight: 590, color: STATUS_COLORS[deal.status] ?? 'var(--kb-text-secondary)', textTransform: 'capitalize' }}>
                              {deal.status}
                            </span>
                            {deal.asking_price && <span style={{ fontSize: '12px', color: 'var(--kb-text-secondary)', marginLeft: '8px' }}>{fmt(deal.asking_price)}</span>}
                          </div>
                        ) : c.role === 'buyer' && bp ? (
                          <div style={{ fontSize: '13px', color: 'var(--kb-text-secondary)' }}>
                            {bp.deal_size_min ? `${fmt(bp.deal_size_min)} – ${fmt(bp.deal_size_max)}` : 'No buy box yet'}
                            {bp.funding_method && <div style={{ fontSize: '12px', color: 'var(--kb-text-muted)', textTransform: 'capitalize' }}>{bp.funding_method.replace(/_/g, ' ')}</div>}
                          </div>
                        ) : <span style={{ color: '#3A4860' }}>—</span>}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ fontSize: '13px', color: onboardingDone ? '#2ECC8B' : '#F59E0B', fontWeight: 600 }}>
                          {onboardingDone ? '✓ Complete' : ' Pending'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: '12px', color: 'var(--kb-text-muted)' }}>
                        {new Date(c.created_at).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <button
                          onClick={() => sendMagicLink(c.email, c.id)}
                          disabled={linkLoading[c.id]}
                          style={{ padding: '7px 14px', background: 'var(--kb-accent-dim)', border: '1px solid var(--kb-accent-border)', borderRadius: '7px', color: 'var(--kb-accent)', fontSize: '12px', fontWeight: 590, fontFamily: "'Inter', system-ui, sans-serif", cursor: 'pointer', whiteSpace: 'nowrap' }}
                        >
                          {linkLoading[c.id] ? '…' : ' Send Link'}
                        </button>
                      </td>
                    </tr>
                    {magicLink && (
                      <tr key={`${c.id}-link`} style={{ borderBottom: '1px solid var(--kb-border-subtle)', background: 'var(--kb-accent-dim)' }}>
                        <td colSpan={6} style={{ padding: '10px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '12px', color: 'var(--kb-accent)', fontWeight: 590, whiteSpace: 'nowrap' }}>Magic Link:</span>
                            <code style={{ fontSize: '11px', color: 'var(--kb-text-secondary)', background: 'var(--kb-bg-raised)', padding: '6px 10px', borderRadius: '6px', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                              {magicLink}
                            </code>
                            <button onClick={() => navigator.clipboard.writeText(magicLink)} style={{ padding: '6px 12px', background: 'var(--kb-accent)', border: 'none', borderRadius: '6px', color: 'var(--kb-bg)', fontSize: '12px', fontWeight: 590, fontFamily: "'Inter', system-ui, sans-serif", cursor: 'pointer', whiteSpace: 'nowrap' }}>
                              Copy
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Quick Magic Link — works for ANY email, bypasses rate limit */}
      <div style={S.card}>
        <div style={{ fontSize: '13px', fontWeight: 590, color: 'var(--kb-accent)', fontFamily: "'DM Mono', monospace", letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>
          Send Magic Link to Any Email
        </div>
        <div style={{ fontSize: '12px', color: 'var(--kb-text-muted)', marginBottom: '14px', lineHeight: 1.6 }}>
          Generates a fresh single-use login link via the admin API (bypasses Supabase user-side rate limits). System auto-detects if the email belongs to a client and routes them directly to their portal. <strong>Use this for Troy or any signed client when emailed magic links fail.</strong>
        </div>

        <form onSubmit={sendQuickMagicLink}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '12px', alignItems: 'end' }}>
            <div>
              <div style={S.label}>Recipient Email</div>
              <input style={S.input} type="email" placeholder="acunlimited@yahoo.com" value={quickEmail} onChange={e => setQuickEmail(e.target.value)} required />
            </div>
            <button type="submit" disabled={quickLoading} style={{ padding: '11px 22px', background: quickLoading ? 'rgba(201,168,76,0.4)' : '#C9A84C', border: 'none', borderRadius: '9px', color: 'var(--kb-bg)', fontSize: '14px', fontWeight: 590, fontFamily: "'Inter', system-ui, sans-serif", cursor: quickLoading ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap' }}>
              {quickLoading ? 'Generating…' : '⚡ Send Magic Link'}
            </button>
          </div>
        </form>

        {quickResult.error && (
          <div style={{ marginTop: '14px', background: 'rgba(232,73,73,0.1)', border: '1px solid rgba(232,73,73,0.3)', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: '#E87373' }}>
            {quickResult.error}
          </div>
        )}
        {quickResult.link && (
          <div style={{ marginTop: '14px', background: 'rgba(46,204,139,0.10)', border: '1px solid rgba(46,204,139,0.3)', borderRadius: '8px', padding: '14px 16px' }}>
            <div style={{ fontSize: '12px', color: 'var(--kb-green)', fontWeight: 600, marginBottom: '8px', letterSpacing: '0.04em' }}>
              ✅ Link generated — single-use, expires in 1 hour
              {quickResult.redirect && quickResult.redirect !== '/overview' && (
                <span style={{ marginLeft: '8px', color: 'var(--kb-text-muted)', fontWeight: 400 }}>· redirects to {quickResult.redirect}</span>
              )}
            </div>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '11px', wordBreak: 'break-all', color: 'var(--kb-text)', background: 'var(--kb-bg-raised)', padding: '10px 12px', borderRadius: '6px', userSelect: 'all' }}>
              {quickResult.link}
            </div>
            <button
              type="button"
              onClick={() => { navigator.clipboard.writeText(quickResult.link ?? ''); }}
              style={{ marginTop: '10px', padding: '6px 14px', background: 'transparent', border: '1px solid var(--kb-accent-border)', borderRadius: '6px', color: 'var(--kb-accent)', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
            >
              Copy Link
            </button>
          </div>
        )}
      </div>

      {/* Create New Client */}
      <div style={S.card}>
        <div style={{ fontSize: '13px', fontWeight: 590, color: 'var(--kb-accent)', fontFamily: "'DM Mono', monospace", fontVariantNumeric: 'tabular-nums', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '18px' }}>
          Create New Client
        </div>

        {createSuccess && (
          <div style={{ background: 'rgba(46,204,139,0.12)', border: '1px solid rgba(46,204,139,0.3)', borderRadius: '8px', padding: '10px 14px', marginBottom: '14px', fontSize: '13px', color: 'var(--kb-green)' }}>
            {createSuccess}
          </div>
        )}
        {createError && (
          <div style={{ background: 'rgba(232,73,73,0.1)', border: '1px solid rgba(232,73,73,0.3)', borderRadius: '8px', padding: '10px 14px', marginBottom: '14px', fontSize: '13px', color: '#E87373' }}>
            {createError}
          </div>
        )}

        <form onSubmit={createClient}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 180px auto', gap: '12px', alignItems: 'end' }}>
            <div>
              <div style={S.label}>Full Name</div>
              <input style={S.input} placeholder="John Smith" value={newClient.full_name} onChange={e => setNewClient(p => ({ ...p, full_name: e.target.value }))} />
            </div>
            <div>
              <div style={S.label}>Email</div>
              <input style={S.input} type="email" placeholder="john@company.com" value={newClient.email} onChange={e => setNewClient(p => ({ ...p, email: e.target.value }))} required />
            </div>
            <div>
              <div style={S.label}>Role</div>
              <select style={{ ...S.input, cursor: 'pointer' }} value={newClient.role} onChange={e => setNewClient(p => ({ ...p, role: e.target.value }))}>
                <option value="seller">Seller</option>
                <option value="buyer">Buyer</option>
              </select>
            </div>
            <button type="submit" disabled={creating} style={{ padding: '11px 22px', background: creating ? 'rgba(201,168,76,0.4)' : '#C9A84C', border: 'none', borderRadius: '9px', color: 'var(--kb-bg)', fontSize: '14px', fontWeight: 590, fontFamily: "'Inter', system-ui, sans-serif", cursor: creating ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap' }}>
              {creating ? 'Creating…' : '+ Create Client'}
            </button>
          </div>
        </form>

        <div style={{ marginTop: '16px', padding: '12px 16px', background: 'var(--kb-bg-raised)', borderRadius: '8px', fontSize: '12px', color: 'var(--kb-text-muted)', lineHeight: 1.7 }}>
          <strong style={{ color: 'var(--kb-text-secondary)' }}>Workflow:</strong> Create client, click "Send Link", they get a magic link by email + you can copy it directly, one click gets them into their dashboard, seller uploads docs, buyer fills buy box.
        </div>

        {/* Ambassador Management Link */}
        <a href="/admin/ambassadors" style={{ display: 'block', marginTop: '20px', padding: '18px 24px', background: 'var(--kb-accent-dim)', border: '1px solid var(--kb-accent-border)', borderRadius: '12px', textDecoration: 'none' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '16px', fontWeight: 590, color: 'var(--kb-accent)', marginBottom: '4px' }}>Ambassador Management</div>
              <div style={{ fontSize: '13px', color: 'var(--kb-text-secondary)' }}>View ambassadors, manage referrals, update deal status, mark commissions paid</div>
            </div>
            <svg viewBox="0 0 18 18" width="18" height="18" fill="none" stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round"><line x1="5" y1="9" x2="13" y2="9"/><polyline points="10,6 13,9 10,12"/></svg>
          </div>
        </a>
      </div>
    </div>
  )
}
