'use client'
import { useState, useEffect, useCallback } from 'react'

type Ambassador = {
  id: string; name: string; email: string; phone: string; company: string;
  how_connected: string; referral_code: string; status: string;
  total_referrals: number; total_signed: number; total_closed: number;
  total_earned: number; created_at: string;
}

type Referral = {
  id: string; ambassador_id: string; owner_name: string; owner_email: string;
  owner_phone: string; business_name: string; industry: string; city: string;
  state: string; estimated_revenue: string; status: string; deal_value: number;
  success_fee: number; signing_bonus_amount: number; signing_bonus_paid: boolean;
  commission_rate: number; commission_amount: number; commission_paid: boolean;
  created_at: string; notes: string;
}

const STATUS_OPTS = ['referred', 'contacted', 'signed', 'active', 'closed', 'lost']
const AMB_STATUS_OPTS = ['pending', 'approved', 'active', 'inactive']
const STATUS_COLORS: Record<string, string> = {
  pending: 'var(--kb-text-secondary)', approved: '#5b8dee', active: '#2ECC8B', inactive: 'var(--kb-text-muted)',
  referred: '#5b8dee', contacted: '#C9A84C', signed: '#2ECC8B', closed: '#C9A84C', lost: '#E84949',
}

const card = { background: 'var(--kb-bg-card)', border: '1px solid var(--kb-border)', borderRadius: '8px', padding: '24px' } as const
const inputStyle = { padding: '8px 12px', background: 'var(--kb-bg)', border: '1px solid var(--kb-border)', borderRadius: '6px', color: 'var(--kb-text)', fontSize: '13px', outline: 'none', fontFamily: "'Inter', system-ui, sans-serif" } as const

export default function AdminAmbassadors() {
  const [ambassadors, setAmbassadors] = useState<Ambassador[]>([])
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/ambassadors')
      const data = await res.json()
      setAmbassadors(data.ambassadors || [])
      setReferrals(data.referrals || [])
    } catch { /* silent */ }
    setLoading(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const updateAmbassador = async (id: string, patch: Partial<Ambassador>) => {
    setSaving(id)
    await fetch('/api/admin/ambassadors', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ table: 'ambassadors', id, patch }),
    })
    await fetchData()
    setSaving(null)
  }

  const updateReferral = async (id: string, patch: Partial<Referral>) => {
    setSaving(id)
    await fetch('/api/admin/ambassadors', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ table: 'ambassador_referrals', id, patch }),
    })
    await fetchData()
    setSaving(null)
  }

  const selectedAmb = ambassadors.find(a => a.id === selected)
  const selectedRefs = referrals.filter(r => r.ambassador_id === selected)

  const totalPaidOut = referrals.filter(r => r.commission_paid).reduce((s, r) => s + (r.commission_amount || 0), 0) +
    referrals.filter(r => r.signing_bonus_paid).length * 1000
  const totalPending = referrals.filter(r => r.status === 'closed' && !r.commission_paid).reduce((s, r) => s + (r.commission_amount || 0), 0)

  return (
    <div style={{ padding: '40px 32px 80px', maxWidth: '1100px', margin: '0 auto', fontFamily: "'Inter', system-ui, sans-serif" }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <div style={{ fontSize: '11px', color: '#E87373', fontWeight: 590, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '6px' }}>Admin Only</div>
          <h1 style={{ fontFamily: "'DM Mono', monospace", fontSize: '24px', fontWeight: 510, color: 'var(--kb-text)', fontVariantNumeric: 'tabular-nums' }}>Ambassador Management</h1>
        </div>
        <a href="/admin" style={{ padding: '8px 16px', background: 'transparent', border: '1px solid var(--kb-border)', borderRadius: '6px', color: 'var(--kb-text-secondary)', fontSize: '13px', textDecoration: 'none' }}>Back to Admin</a>
      </div>

      {/* Summary Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', marginBottom: '28px' }}>
        {[
          { label: 'Ambassadors', value: ambassadors.length, color: 'var(--kb-text)' },
          { label: 'Total Referrals', value: referrals.length, color: '#5b8dee' },
          { label: 'Signed', value: referrals.filter(r => ['signed', 'active', 'closed'].includes(r.status)).length, color: 'var(--kb-green)' },
          { label: 'Total Paid Out', value: `$${totalPaidOut.toLocaleString()}`, color: 'var(--kb-accent)' },
          { label: 'Pending Payout', value: `$${totalPending.toLocaleString()}`, color: '#E87373' },
        ].map((s, i) => (
          <div key={i} style={{ ...card, textAlign: 'center', padding: '16px' }}>
            <div style={{ fontSize: '24px', fontFamily: "'Playfair Display', serif", fontWeight: 600, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '11px', color: 'var(--kb-text-secondary)', letterSpacing: '0.06em', textTransform: 'uppercase', marginTop: '4px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '20px' }}>

        {/* Ambassador List */}
        <div style={{ ...card, padding: '0', maxHeight: '70vh', overflowY: 'auto' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--kb-border)', fontSize: '14px', fontWeight: 590, color: 'var(--kb-text)' }}>
            Ambassadors ({ambassadors.length})
          </div>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--kb-text-muted)' }}>Loading...</div>
          ) : ambassadors.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--kb-text-muted)' }}>No ambassadors yet</div>
          ) : ambassadors.map(a => (
            <div key={a.id} onClick={() => setSelected(a.id)} style={{
              padding: '14px 20px', borderBottom: '1px solid var(--kb-border-subtle)', cursor: 'pointer',
              background: selected === a.id ? 'rgba(201,168,76,0.08)' : 'transparent',
              borderLeft: selected === a.id ? '3px solid #C9A84C' : '3px solid transparent',
            }}>
              <div style={{ fontSize: '14px', fontWeight: 590, color: 'var(--kb-text)' }}>{a.name}</div>
              <div style={{ fontSize: '12px', color: 'var(--kb-text-secondary)', marginTop: '2px' }}>{a.email}</div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '6px', alignItems: 'center' }}>
                <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '4px', fontWeight: 590, textTransform: 'uppercase', letterSpacing: '0.05em', color: STATUS_COLORS[a.status] || 'var(--kb-text-secondary)', background: `${STATUS_COLORS[a.status] || 'var(--kb-text-secondary)'}15`, border: `1px solid ${STATUS_COLORS[a.status] || 'var(--kb-text-secondary)'}30` }}>{a.status}</span>
                <span style={{ fontSize: '11px', color: 'var(--kb-text-muted)' }}>{a.total_referrals} referrals</span>
              </div>
            </div>
          ))}
        </div>

        {/* Detail Panel */}
        <div>
          {!selectedAmb ? (
            <div style={{ ...card, textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ marginBottom: '12px', color: 'var(--kb-text-muted)' }}>
                <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M16 16v-1.5c0-2-1.5-3.5-3.5-3.5h-1"/><circle cx="9" cy="6" r="3"/><path d="M2 16v-1.5c0-2 1.5-3.5 3.5-3.5h1"/></svg>
              </div>
              <p style={{ fontSize: '15px', color: 'var(--kb-text-secondary)' }}>Select an ambassador to manage</p>
            </div>
          ) : (
            <>
              {/* Ambassador Info */}
              <div style={{ ...card, marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div>
                    <h2 style={{ fontSize: '20px', color: 'var(--kb-text)', fontWeight: 600 }}>{selectedAmb.name}</h2>
                    <div style={{ fontSize: '13px', color: 'var(--kb-text-secondary)', marginTop: '2px' }}>{selectedAmb.email} {selectedAmb.phone && `| ${selectedAmb.phone}`}</div>
                    {selectedAmb.company && <div style={{ fontSize: '13px', color: 'var(--kb-text-muted)', marginTop: '2px' }}>{selectedAmb.company}</div>}
                    {selectedAmb.how_connected && <div style={{ fontSize: '12px', color: 'var(--kb-text-muted)', marginTop: '4px', fontStyle: 'italic' }}>"{selectedAmb.how_connected}"</div>}
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', color: 'var(--kb-text-secondary)', fontFamily: "'DM Mono', monospace" }}>{selectedAmb.referral_code}</span>
                    <select
                      value={selectedAmb.status}
                      onChange={e => updateAmbassador(selectedAmb.id, { status: e.target.value } as Partial<Ambassador>)}
                      style={{ ...inputStyle, cursor: 'pointer', padding: '6px 10px' }}
                    >
                      {AMB_STATUS_OPTS.map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                  {[
                    { l: 'Referrals', v: selectedRefs.length },
                    { l: 'Signed', v: selectedRefs.filter(r => ['signed', 'active', 'closed'].includes(r.status)).length },
                    { l: 'Closed', v: selectedRefs.filter(r => r.status === 'closed').length },
                    { l: 'Total Earned', v: `$${(selectedAmb.total_earned || 0).toLocaleString()}` },
                  ].map((s, i) => (
                    <div key={i} style={{ padding: '10px', background: 'var(--kb-bg-raised)', borderRadius: '6px', textAlign: 'center' }}>
                      <div style={{ fontSize: '18px', fontWeight: 590, color: 'var(--kb-text)' }}>{s.v}</div>
                      <div style={{ fontSize: '10px', color: 'var(--kb-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.l}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Referrals Management */}
              <div style={{ ...card }}>
                <h3 style={{ fontSize: '16px', color: 'var(--kb-text)', fontWeight: 590, marginBottom: '16px' }}>Referrals ({selectedRefs.length})</h3>
                {selectedRefs.length === 0 ? (
                  <p style={{ color: 'var(--kb-text-muted)', fontSize: '14px' }}>No referrals yet</p>
                ) : selectedRefs.map(ref => (
                  <div key={ref.id} style={{ padding: '16px', background: 'var(--kb-bg-card)', border: '1px solid var(--kb-border-subtle)', borderRadius: '8px', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <div>
                        <div style={{ fontSize: '15px', fontWeight: 590, color: 'var(--kb-text)' }}>{ref.business_name || 'No business name'}</div>
                        <div style={{ fontSize: '13px', color: 'var(--kb-text-secondary)' }}>{ref.owner_name} {ref.owner_email && `| ${ref.owner_email}`} {ref.owner_phone && `| ${ref.owner_phone}`}</div>
                        <div style={{ fontSize: '12px', color: 'var(--kb-text-muted)', marginTop: '2px' }}>{[ref.industry, ref.city, ref.state, ref.estimated_revenue].filter(Boolean).join(' | ')}</div>
                      </div>
                      <select
                        value={ref.status}
                        onChange={e => updateReferral(ref.id, { status: e.target.value } as Partial<Referral>)}
                        style={{ ...inputStyle, cursor: 'pointer', padding: '6px 10px', fontSize: '12px' }}
                      >
                        {STATUS_OPTS.map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
                      </select>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                      {/* Deal Value */}
                      <div>
                        <div style={{ fontSize: '10px', color: 'var(--kb-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>Deal Value</div>
                        <input
                          style={{ ...inputStyle, width: '100%' }}
                          placeholder="$3,000,000"
                          defaultValue={ref.deal_value || ''}
                          onBlur={e => {
                            const val = parseFloat(e.target.value.replace(/[$,]/g, ''))
                            if (val) {
                              const fee = val * 0.05
                              const comm = fee * 0.20
                              updateReferral(ref.id, { deal_value: val, success_fee: fee, commission_amount: comm } as Partial<Referral>)
                            }
                          }}
                        />
                      </div>

                      {/* Success Fee (auto calc) */}
                      <div>
                        <div style={{ fontSize: '10px', color: 'var(--kb-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>KB Fee (5%)</div>
                        <div style={{ padding: '8px 12px', background: 'var(--kb-bg)', borderRadius: '6px', color: 'var(--kb-text-secondary)', fontSize: '13px' }}>
                          {ref.success_fee ? `$${ref.success_fee.toLocaleString()}` : 'Enter deal value'}
                        </div>
                      </div>

                      {/* Signing Bonus */}
                      <div>
                        <div style={{ fontSize: '10px', color: 'var(--kb-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>$1K Bonus</div>
                        <button
                          onClick={() => updateReferral(ref.id, { signing_bonus_paid: !ref.signing_bonus_paid } as Partial<Referral>)}
                          disabled={saving === ref.id}
                          style={{ ...inputStyle, width: '100%', cursor: 'pointer', textAlign: 'center', fontWeight: 590, color: ref.signing_bonus_paid ? '#2ECC8B' : '#E87373', background: ref.signing_bonus_paid ? 'rgba(46,204,139,0.1)' : 'var(--kb-bg)' }}
                        >
                          {ref.signing_bonus_paid ? 'PAID' : 'UNPAID'}
                        </button>
                      </div>

                      {/* Commission */}
                      <div>
                        <div style={{ fontSize: '10px', color: 'var(--kb-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
                          20% Comm {ref.commission_amount ? `($${ref.commission_amount.toLocaleString()})` : ''}
                        </div>
                        <button
                          onClick={() => updateReferral(ref.id, { commission_paid: !ref.commission_paid } as Partial<Referral>)}
                          disabled={saving === ref.id || !ref.commission_amount}
                          style={{ ...inputStyle, width: '100%', cursor: ref.commission_amount ? 'pointer' : 'not-allowed', textAlign: 'center', fontWeight: 590, color: ref.commission_paid ? '#2ECC8B' : ref.commission_amount ? '#E87373' : 'var(--kb-text-muted)', background: ref.commission_paid ? 'rgba(46,204,139,0.1)' : 'var(--kb-bg)', opacity: ref.commission_amount ? 1 : 0.5 }}
                        >
                          {ref.commission_paid ? 'PAID' : ref.commission_amount ? 'UNPAID' : 'AT CLOSE'}
                        </button>
                      </div>
                    </div>

                    {/* Notes */}
                    <div style={{ marginTop: '8px' }}>
                      <input
                        style={{ ...inputStyle, width: '100%', fontSize: '12px' }}
                        placeholder="Add notes..."
                        defaultValue={ref.notes || ''}
                        onBlur={e => { if (e.target.value !== (ref.notes || '')) updateReferral(ref.id, { notes: e.target.value } as Partial<Referral>) }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
