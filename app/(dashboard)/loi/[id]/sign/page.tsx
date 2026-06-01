'use client'
import { useState, useEffect, Suspense } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function LOISignPage() {
  return (
    <Suspense>
      <LOISignPageInner />
    </Suspense>
  )
}

function LOISignPageInner() {
  const { id } = useParams<{ id: string }>()
  const searchParams = useSearchParams()
  const router = useRouter()

  const event = searchParams.get('event')
  const role = searchParams.get('role') as 'buyer' | 'seller' | null

  const [loading, setLoading] = useState(true)
  const [signingUrl, setSigningUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [noDocuSign, setNoDocuSign] = useState(false)
  const [session, setSession] = useState<{ access_token: string } | null>(null)

  // Signing complete, DocuSign returned us here
  const signingComplete = event === 'signing_complete'

  useEffect(() => {
    if (signingComplete) {
      setLoading(false)
      return
    }

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setSession(data.session)
        fetchSigningUrl(data.session.access_token)
      } else {
        setLoading(false)
        setError('You must be logged in to sign this LOI.')
      }
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function fetchSigningUrl(token: string) {
    try {
      const res = await fetch('/api/loi/signing-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          loi_id: id,
          signer_role: role || 'buyer',
        }),
      })

      const data = await res.json() as {
        signing_url?: string
        error?: string
        code?: string
        message?: string
      }

      if (data.code === 'no_docusign') {
        setNoDocuSign(true)
        setLoading(false)
        return
      }

      if (data.signing_url) {
        setSigningUrl(data.signing_url)
        // Redirect to DocuSign
        window.location.href = data.signing_url
      } else {
        setError(data.error || 'Could not get signing link')
        setLoading(false)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get signing link')
      setLoading(false)
    }
  }

  // ============================================================
  // SIGNING COMPLETE VIEW
  // ============================================================
  if (signingComplete) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Inter', system-ui, sans-serif",
        padding: '40px',
        background: 'var(--kb-bg)',
      }}>
        <div style={{
          background: 'var(--kb-bg-panel)',
          border: '1px solid rgba(46,204,139,0.3)',
          borderRadius: '12px',
          padding: '52px 48px',
          maxWidth: '520px',
          width: '100%',
          textAlign: 'center',
        }}>
          <div style={{ marginBottom: "12px", color: "#C9A84C" }}><svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/></svg></div>
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: '26px',
            color: 'var(--kb-text)',
            marginBottom: '12px',
          }}>
            {role === 'seller' ? 'LOI Fully Executed!' : 'You\'ve Signed the LOI'}
          </h1>
          <p style={{ fontSize: '15px', color: 'var(--kb-text-secondary)', lineHeight: 1.7, marginBottom: '28px' }}>
            {role === 'seller'
              ? 'Both parties have signed. This Letter of Intent is now fully executed. Eric Skeldon has been notified and will be in touch within 48 hours.'
              : 'Your signature has been recorded. The LOI will now be sent to the seller for their countersignature. You\'ll receive an email when they sign.'}
          </p>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <Link href={`/loi/${id}`} style={{ textDecoration: 'none' }}>
              <button style={{
                padding: '13px 28px',
                background: 'var(--kb-accent)',
                color: 'var(--kb-bg)',
                fontWeight: 590,
                fontSize: '15px',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontFamily: "'Inter', system-ui, sans-serif",
              }}>
                View LOI
              </button>
            </Link>
            <Link href="/overview" style={{ textDecoration: 'none' }}>
              <button style={{
                padding: '13px 24px',
                background: 'transparent',
                border: '1px solid var(--kb-border)',
                borderRadius: '8px',
                color: 'var(--kb-text-secondary)',
                fontSize: '15px',
                cursor: 'pointer',
                fontFamily: "'Inter', system-ui, sans-serif",
              }}>
                Dashboard
              </button>
            </Link>
          </div>

          <p style={{ marginTop: '24px', fontSize: '13px', color: 'var(--kb-text-muted)' }}>
            Questions? Reach Eric directly at{' '}
            <a href="mailto:Eric@KingdomBroker.com" style={{ color: 'var(--kb-accent)' }}>Eric@KingdomBroker.com</a>
            {' '}or 469-494-9890.
          </p>
        </div>
      </div>
    )
  }

  // ============================================================
  // DOCUSIGN NOT CONFIGURED
  // ============================================================
  if (noDocuSign) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Inter', system-ui, sans-serif",
        padding: '40px',
        background: 'var(--kb-bg)',
      }}>
        <div style={{
          background: 'var(--kb-bg-panel)',
          border: '1px solid rgba(245,158,11,0.3)',
          borderRadius: '12px',
          padding: '52px 48px',
          maxWidth: '520px',
          width: '100%',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}></div>
          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: '22px',
            color: 'var(--kb-text)',
            marginBottom: '12px',
          }}>
            Check Your Email
          </h2>
          <p style={{ fontSize: '15px', color: 'var(--kb-text-secondary)', lineHeight: 1.7, marginBottom: '28px' }}>
            Electronic signing is being set up. Please check your email for a signing link, or contact Eric Skeldon directly to complete your signature.
          </p>
          <a href="mailto:Eric@KingdomBroker.com" style={{ textDecoration: 'none' }}>
            <button style={{
              padding: '13px 28px',
              background: 'var(--kb-accent)',
              color: 'var(--kb-bg)',
              fontWeight: 590,
              fontSize: '15px',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontFamily: "'Inter', system-ui, sans-serif",
            }}>
              Email Eric
            </button>
          </a>
          <div style={{ marginTop: '16px' }}>
            <Link href={`/loi/${id}`} style={{ color: 'var(--kb-text-secondary)', fontSize: '14px' }}>
              Back to LOI
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // ============================================================
  // ERROR STATE
  // ============================================================
  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Inter', system-ui, sans-serif",
        padding: '40px',
        background: 'var(--kb-bg)',
      }}>
        <div style={{
          background: 'var(--kb-bg-panel)',
          border: '1px solid rgba(248,113,113,0.3)',
          borderRadius: '12px',
          padding: '48px',
          maxWidth: '480px',
          width: '100%',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '40px', marginBottom: '16px' }}>NOTICE:</div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', color: 'var(--kb-text)', marginBottom: '12px' }}>
            Something went wrong
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--kb-text-secondary)', marginBottom: '24px' }}>{error}</p>
          <Link href={`/loi/${id}`} style={{ textDecoration: 'none' }}>
            <button style={{
              padding: '12px 24px',
              background: 'var(--kb-accent)',
              color: 'var(--kb-bg)',
              fontWeight: 590,
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontFamily: "'Inter', system-ui, sans-serif",
            }}>
              Back to LOI
            </button>
          </Link>
        </div>
      </div>
    )
  }

  // ============================================================
  // LOADING / REDIRECTING TO DOCUSIGN
  // ============================================================
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Inter', system-ui, sans-serif",
      background: 'var(--kb-bg)',
    }}>
      <div style={{ textAlign: 'center', color: 'var(--kb-text-secondary)' }}>
        <div style={{
          width: '48px',
          height: '48px',
          border: '3px solid rgba(201,168,76,0.2)',
          borderTopColor: '#C9A84C',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
          margin: '0 auto 20px',
        }} />
        <div style={{ fontSize: '16px', color: 'var(--kb-text)', marginBottom: '8px' }}>
          Preparing your signing session...
        </div>
        <div style={{ fontSize: '14px' }}>
          You will be redirected to DocuSign momentarily.
        </div>
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  )
}
