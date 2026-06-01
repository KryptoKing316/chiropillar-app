'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import LOIStatusBadge from '@/components/dashboard/loi/LOIStatusBadge'

interface LOIRow {
  id: string
  template_type: string
  status: string
  created_at: string
  sent_at: string | null
  loi_data: Record<string, string> | null
}

const TEMPLATE_LABELS: Record<string, string> = {
  all_cash: 'All Cash',
  seller_financed: 'Seller Financed',
  sba_7a: 'SBA 7(a)',
}

export default function LOIListPage() {
  const router = useRouter()
  const [lois, setLois] = useState<LOIRow[]>([])
  const [loading, setLoading] = useState(true)
  const [dealId, setDealId] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const { data: { session } } = await supabase.auth.getSession()

        if (session?.user) {
          // Get user's deal
          const { data: deal } = await supabase
            .from('deals')
            .select('id')
            .eq('seller_id', session.user.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single()

          if (deal) setDealId(deal.id)

          // Get all LOIs for user
          const { data: loiData } = await supabase
            .from('lois')
            .select('*')
            .or(`buyer_id.eq.${session.user.id},seller_id.eq.${session.user.id}`)
            .order('created_at', { ascending: false })

          setLois(loiData || [])
        }
      } catch {
        // Demo mode, load placeholder data
        setLois([
          {
            id: 'demo-loi-1',
            template_type: 'all_cash',
            status: 'draft',
            created_at: new Date().toISOString(),
            sent_at: null,
            loi_data: {
              business_name: 'Legacy HVAC Services',
              purchase_price: '$4,800,000',
            },
          },
        ])
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  return (
    <div style={{
      padding: '40px 40px',
      fontFamily: "'Inter', system-ui, sans-serif",
      color: 'var(--kb-text)',
      maxWidth: '1100px',
      margin: '0 auto',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '32px',
        flexWrap: 'wrap',
        gap: '16px',
      }}>
        <div>
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: '30px',
            color: 'var(--kb-text)',
            marginBottom: '8px',
          }}>
            Letter of Intent
          </h1>
          <p style={{ fontSize: '15px', color: 'var(--kb-text-secondary)' }}>
            Create and send professional acquisition offers, pre-filled by AI, signed electronically.
          </p>
        </div>

        <Link href="/loi/new" style={{ textDecoration: 'none' }}>
          <button style={{
            padding: '13px 28px',
            background: 'var(--kb-accent)',
            color: 'var(--kb-bg)',
            fontWeight: 590,
            fontSize: '15px',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontFamily: "'Inter', system-ui, sans-serif",
          }}>
            <span></span>
            Create New LOI
          </button>
        </Link>
      </div>

      {/* Explainer cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px',
        marginBottom: '36px',
      }}>
        {[
          { icon: '', label: 'AI Pre-Fills the Offer', desc: 'Claude reads your deal data and writes a complete, professional LOI in seconds.' },
          { icon: '', label: 'Electronic Signatures', desc: 'Buyer and seller both sign digitally via DocuSign, no printing, no scanning.' },
          { icon: '', label: 'Legally Sound Language', desc: 'Written in plain English. Non-binding and standard for business acquisitions.' },
        ].map((item) => (
          <div key={item.label} style={{
            background: 'var(--kb-bg-panel)',
            border: '1px solid var(--kb-border)',
            borderRadius: '12px',
            padding: '20px',
          }}>
            <div style={{ fontSize: '24px', marginBottom: '10px' }}>{item.icon}</div>
            <div style={{ fontSize: '14px', fontWeight: 590, color: 'var(--kb-text)', marginBottom: '6px' }}>{item.label}</div>
            <div style={{ fontSize: '13px', color: 'var(--kb-text-secondary)', lineHeight: 1.6 }}>{item.desc}</div>
          </div>
        ))}
      </div>

      {/* LOI Table */}
      <div style={{
        background: 'var(--kb-bg-panel)',
        border: '1px solid var(--kb-border)',
        borderRadius: '8px',
        overflow: 'hidden',
      }}>
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--kb-text-secondary)' }}>
            <div style={{ fontSize: '24px', marginBottom: '12px', opacity: 0.5 }}></div>
            Loading your LOIs...
          </div>
        ) : lois.length === 0 ? (
          <div style={{ padding: '80px 40px', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.3 }}></div>
            <h3 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '22px',
              color: 'var(--kb-text)',
              marginBottom: '10px',
            }}>
              No offers yet
            </h3>
            <p style={{ fontSize: '15px', color: 'var(--kb-text-secondary)', marginBottom: '28px', maxWidth: '420px', margin: '0 auto 28px' }}>
              Create your first LOI to begin the negotiation. Kingdom Broker will pre-fill the offer from your deal data in seconds.
            </p>
            {!dealId && (
              <p style={{ fontSize: '14px', color: 'var(--kb-text-muted)', marginBottom: '16px' }}>
                You need a completed business profile first.{' '}
                <Link href="/onboarding/seller" style={{ color: 'var(--kb-accent)' }}>Complete your profile →</Link>
              </p>
            )}
            <Link href="/loi/new" style={{ textDecoration: 'none' }}>
              <button style={{
                padding: '13px 32px',
                background: 'var(--kb-accent)',
                color: 'var(--kb-bg)',
                fontWeight: 590,
                fontSize: '15px',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontFamily: "'Inter', system-ui, sans-serif",
              }}>
                Create First LOI
              </button>
            </Link>
          </div>
        ) : (
          <>
            {/* Table header */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1.2fr 1.5fr 1.2fr 1.2fr 1.4fr',
              padding: '14px 24px',
              borderBottom: '1px solid var(--kb-border-subtle)',
              fontSize: '12px',
              color: 'var(--kb-text-muted)',
              fontWeight: 590,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}>
              <span>Business</span>
              <span>Structure</span>
              <span>Amount</span>
              <span>Status</span>
              <span>Created</span>
              <span>Actions</span>
            </div>

            {/* Rows */}
            {lois.map((loi) => {
              const data = loi.loi_data || {}
              const businessName = data.business_name || 'Unnamed Business'
              const amount = data.purchase_price || '—'
              const createdDate = new Date(loi.created_at).toLocaleDateString('en-US', {
                month: 'short', day: 'numeric', year: 'numeric',
              })

              return (
                <div
                  key={loi.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1.2fr 1.5fr 1.2fr 1.2fr 1.4fr',
                    padding: '18px 24px',
                    borderBottom: '1px solid var(--kb-border-subtle)',
                    alignItems: 'center',
                    transition: 'background 0.1s',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: 590, color: 'var(--kb-text)' }}>
                      {businessName}
                    </div>
                  </div>

                  <div style={{ fontSize: '13px', color: 'var(--kb-text-secondary)' }}>
                    {TEMPLATE_LABELS[loi.template_type] || loi.template_type}
                  </div>

                  <div style={{ fontSize: '15px', color: 'var(--kb-accent)', fontWeight: 590, fontFamily: "'DM Mono', monospace" }}>
                    {amount}
                  </div>

                  <div>
                    <LOIStatusBadge status={loi.status} />
                  </div>

                  <div style={{ fontSize: '13px', color: 'var(--kb-text-secondary)' }}>
                    {createdDate}
                  </div>

                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <Link href={`/loi/${loi.id}`} style={{ textDecoration: 'none' }}>
                      <button style={{
                        padding: '7px 16px',
                        background: 'transparent',
                        border: '1px solid var(--kb-border)',
                        borderRadius: '7px',
                        color: 'var(--kb-text-secondary)',
                        fontSize: '13px',
                        cursor: 'pointer',
                        fontFamily: "'Inter', system-ui, sans-serif",
                      }}>
                        View
                      </button>
                    </Link>

                    {(loi.status === 'signed' || loi.status === 'completed') && (
                      <button
                        onClick={() => router.push(`/api/loi/download?loi_id=${loi.id}`)}
                        style={{
                          padding: '7px 16px',
                          background: 'rgba(46,204,139,0.12)',
                          border: '1px solid rgba(46,204,139,0.3)',
                          borderRadius: '7px',
                          color: 'var(--kb-green)',
                          fontSize: '13px',
                          cursor: 'pointer',
                          fontFamily: "'Inter', system-ui, sans-serif",
                        }}
                      >
                        Download
                      </button>
                    )}

                    {(loi.status === 'sent' || loi.status === 'delivered') && (
                      <Link href={`/loi/${loi.id}/sign?role=buyer`} style={{ textDecoration: 'none' }}>
                        <button style={{
                          padding: '7px 16px',
                          background: 'var(--kb-accent-dim)',
                          border: '1px solid var(--kb-accent-border)',
                          borderRadius: '7px',
                          color: 'var(--kb-accent)',
                          fontSize: '13px',
                          cursor: 'pointer',
                          fontFamily: "'Inter', system-ui, sans-serif",
                        }}>
                          Sign
                        </button>
                      </Link>
                    )}
                  </div>
                </div>
              )
            })}
          </>
        )}
      </div>
    </div>
  )
}
