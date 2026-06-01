'use client'
import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import LOIStatusBadge from '@/components/dashboard/loi/LOIStatusBadge'
import LOIPreview from '@/components/dashboard/loi/LOIPreview'

interface LOIRecord {
  id: string
  deal_id: string
  template_type: string
  status: string
  loi_html: string | null
  loi_data: Record<string, string> | null
  envelope_id: string | null
  buyer_signed_at: string | null
  seller_signed_at: string | null
  signed_pdf_url: string | null
  created_at: string
  sent_at: string | null
  expires_at: string | null
}

const TEMPLATE_LABELS: Record<string, string> = {
  all_cash: 'All Cash',
  seller_financed: 'Seller Financed',
  sba_7a: 'SBA 7(a)',
}

export default function LOIDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [loi, setLoi] = useState<LOIRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [sendMsg, setSendMsg] = useState<string | null>(null)
  const [session, setSession] = useState<{ access_token: string } | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setSession(data.session)
    })
  }, [])

  const loadLOI = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('lois')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      setLoi(data as LOIRecord)
    } catch {
      // Demo: show placeholder
      setLoi({
        id,
        deal_id: 'demo',
        template_type: 'all_cash',
        status: 'draft',
        loi_html: null,
        loi_data: { business_name: 'Legacy HVAC Services', purchase_price: '$4,800,000' },
        envelope_id: null,
        buyer_signed_at: null,
        seller_signed_at: null,
        signed_pdf_url: null,
        created_at: new Date().toISOString(),
        sent_at: null,
        expires_at: null,
      })
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { loadLOI() }, [loadLOI])

  // Poll status if sent
  useEffect(() => {
    if (!loi?.envelope_id || loi.status === 'completed') return

    const headers: Record<string, string> = {}
    if (session?.access_token) headers['Authorization'] = `Bearer ${session.access_token}`

    const interval = setInterval(async () => {
      const res = await fetch(`/api/loi/status?loi_id=${id}`, { headers })
      const data = await res.json() as { status?: string }
      if (data.status && data.status !== loi.status) {
        loadLOI()
      }
    }, 10000)

    return () => clearInterval(interval)
  }, [loi?.envelope_id, loi?.status, id, session, loadLOI])

  async function handleSendForSignature() {
    if (!loi) return
    setSending(true)
    setSendMsg(null)

    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (session?.access_token) headers['Authorization'] = `Bearer ${session.access_token}`

    try {
      const res = await fetch('/api/loi/create-envelope', {
        method: 'POST',
        headers,
        body: JSON.stringify({ loi_id: loi.id }),
      })
      const data = await res.json() as { success?: boolean; notConfigured?: boolean; error?: string }

      if (data.success || data.notConfigured) {
        setSendMsg(data.notConfigured
          ? 'LOI saved. DocuSign is not configured, please send the document manually.'
          : 'Sent! Both parties will receive an email with a link to sign.')
        loadLOI()
      } else {
        setSendMsg(data.error || 'Something went wrong')
      }
    } catch (err) {
      setSendMsg(err instanceof Error ? err.message : 'Failed to send')
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '80px 40px', textAlign: 'center', fontFamily: "'Inter', system-ui, sans-serif", color: 'var(--kb-text-secondary)' }}>
        Loading LOI...
      </div>
    )
  }

  if (!loi) {
    return (
      <div style={{ padding: '80px 40px', textAlign: 'center', fontFamily: "'Inter', system-ui, sans-serif", color: 'var(--kb-text-secondary)' }}>
        LOI not found. <Link href="/loi" style={{ color: 'var(--kb-accent)' }}>Back to LOIs</Link>
      </div>
    )
  }

  const data = loi.loi_data || {}
  const businessName = data.business_name || 'Unnamed Business'
  const amount = data.purchase_price || '—'

  return (
    <div style={{
      padding: '40px',
      fontFamily: "'Inter', system-ui, sans-serif",
      color: 'var(--kb-text)',
      maxWidth: '1100px',
      margin: '0 auto',
    }}>
      {/* Back */}
      <Link href="/loi" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--kb-text-secondary)', fontSize: '14px', marginBottom: '24px' }}>
        ← Back to LOIs
      </Link>

      {/* Header */}
      <div style={{
        background: 'var(--kb-bg-panel)',
        border: '1px solid var(--kb-border)',
        borderRadius: '8px',
        padding: '28px 32px',
        marginBottom: '24px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--kb-text-muted)', fontWeight: 590, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px' }}>
              Letter of Intent
            </div>
            <h1 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '26px',
              color: 'var(--kb-text)',
              marginBottom: '8px',
            }}>
              {businessName}
            </h1>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
              <LOIStatusBadge status={loi.status} size="lg" />
              <span style={{ color: 'var(--kb-text-secondary)', fontSize: '14px' }}>
                {TEMPLATE_LABELS[loi.template_type] || loi.template_type}
              </span>
              <span style={{ color: 'var(--kb-accent)', fontSize: '16px', fontWeight: 590, fontFamily: "'DM Mono', monospace" }}>
                {amount}
              </span>
            </div>
          </div>

          {/* Actions based on status */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
            {loi.status === 'draft' && (
              <>
                <Link href={`/loi/new`} style={{ textDecoration: 'none' }}>
                  <button style={{
                    padding: '11px 22px',
                    background: 'transparent',
                    border: '1px solid var(--kb-border)',
                    borderRadius: '8px',
                    color: 'var(--kb-text-secondary)',
                    fontSize: '14px',
                    cursor: 'pointer',
                    fontFamily: "'Inter', system-ui, sans-serif",
                  }}>
                    Edit
                  </button>
                </Link>
                <button
                  onClick={handleSendForSignature}
                  disabled={sending}
                  style={{
                    padding: '11px 24px',
                    background: 'var(--kb-accent)',
                    color: 'var(--kb-bg)',
                    fontWeight: 590,
                    fontSize: '14px',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: sending ? 'not-allowed' : 'pointer',
                    fontFamily: "'Inter', system-ui, sans-serif",
                  }}
                >
                  {sending ? 'Sending...' : ' Send for Signature'}
                </button>
              </>
            )}

            {(loi.status === 'sent' || loi.status === 'delivered' || loi.status === 'viewed') && (
              <Link href={`/loi/${loi.id}/sign?role=buyer`} style={{ textDecoration: 'none' }}>
                <button style={{
                  padding: '11px 24px',
                  background: 'var(--kb-accent)',
                  color: 'var(--kb-bg)',
                  fontWeight: 590,
                  fontSize: '14px',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontFamily: "'Inter', system-ui, sans-serif",
                }}>
                   Sign LOI
                </button>
              </Link>
            )}

            {(loi.status === 'signed' || loi.status === 'completed') && (
              <a href={`/api/loi/download?loi_id=${loi.id}`} download>
                <button style={{
                  padding: '11px 24px',
                  background: 'rgba(46,204,139,0.12)',
                  border: '1px solid rgba(46,204,139,0.3)',
                  borderRadius: '8px',
                  color: 'var(--kb-green)',
                  fontWeight: 590,
                  fontSize: '14px',
                  cursor: 'pointer',
                  fontFamily: "'Inter', system-ui, sans-serif",
                }}>
                   Download Signed PDF
                </button>
              </a>
            )}
          </div>
        </div>

        {/* Status message */}
        {sendMsg && (
          <div style={{
            marginTop: '16px',
            padding: '12px 16px',
            background: sendMsg.includes('not configured') ? 'rgba(245,158,11,0.1)' : 'rgba(46,204,139,0.1)',
            border: `1px solid ${sendMsg.includes('not configured') ? 'rgba(245,158,11,0.3)' : 'rgba(46,204,139,0.3)'}`,
            borderRadius: '8px',
            fontSize: '14px',
            color: sendMsg.includes('not configured') ? '#f59e0b' : '#2ECC8B',
          }}>
            {sendMsg}
          </div>
        )}
      </div>

      {/* Timeline */}
      <div style={{
        background: 'var(--kb-bg-panel)',
        border: '1px solid var(--kb-border)',
        borderRadius: '8px',
        padding: '24px 32px',
        marginBottom: '24px',
      }}>
        <div style={{
          fontSize: '12px',
          fontWeight: 590,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'var(--kb-text-muted)',
          marginBottom: '16px',
        }}>
          Signing Timeline
        </div>

        <div style={{ display: 'flex', gap: '0', alignItems: 'stretch' }}>
          {[
            { label: 'LOI Created', time: loi.created_at, done: true },
            { label: 'Sent for Signature', time: loi.sent_at, done: !!loi.sent_at },
            { label: 'Buyer Signed', time: loi.buyer_signed_at, done: !!loi.buyer_signed_at },
            { label: 'Seller Signed', time: loi.seller_signed_at, done: !!loi.seller_signed_at },
          ].map((item, idx) => (
            <div key={idx} style={{ flex: 1, textAlign: 'center', position: 'relative', padding: '0 8px' }}>
              {idx < 3 && (
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  left: '50%',
                  width: '100%',
                  height: '2px',
                  background: item.done ? '#C9A84C' : 'rgba(255,255,255,0.08)',
                }} />
              )}
              <div style={{
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                background: item.done ? '#C9A84C' : 'rgba(255,255,255,0.08)',
                color: item.done ? 'var(--kb-bg)' : 'var(--kb-text-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 590,
                margin: '0 auto 10px',
                position: 'relative',
                zIndex: 1,
              }}>
                {item.done ? '✓' : idx + 1}
              </div>
              <div style={{ fontSize: '12px', color: item.done ? 'var(--kb-text)' : 'var(--kb-text-muted)', fontWeight: 500 }}>
                {item.label}
              </div>
              {item.time && (
                <div style={{ fontSize: '11px', color: 'var(--kb-text-muted)', marginTop: '4px' }}>
                  {new Date(item.time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* LOI Preview */}
      <LOIPreview loiHtml={loi.loi_html || ''} />
    </div>
  )
}
