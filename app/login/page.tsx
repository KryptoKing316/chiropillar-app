'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/auth-helpers-nextjs'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showAdminCode, setShowAdminCode] = useState(false)
  const [adminCode, setAdminCode] = useState('')
  const [adminError, setAdminError] = useState('')
  const router = useRouter()

  const handleAdminCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setAdminError('')
    setLoading(true)
    try {
      const res = await fetch('/api/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: adminCode }),
      })
      const data = await res.json()
      if (res.ok && data.link) {
        // Redirect to the generated magic link — logs in instantly, no email needed
        window.location.href = data.link
      } else {
        setAdminError('Invalid code.')
        setLoading(false)
      }
    } catch {
      setAdminError('Something went wrong.')
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const trimmedEmail = email.trim().toLowerCase()

    // Demo shortcut — no auth needed
    if (trimmedEmail === 'demo@kingdombroker.com') {
      router.replace('/overview?demo=true')
      return
    }

    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: trimmedEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/overview`,
        },
      })
      if (otpError) {
        const msg = otpError.message.toLowerCase()
        if (msg.includes('rate limit') || msg.includes('too many')) {
          setError('Too many login attempts — please wait 10 minutes and try again, or check your inbox for a previously sent link.')
        } else if (msg.includes('invalid email')) {
          setError('Please enter a valid email address.')
        } else {
          setError(otpError.message)
        }
        setLoading(false)
      } else {
        setLoading(false)
        setSent(true)
      }
    } catch {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  const loadDemo = () => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      router.replace('/overview?demo=true')
    }, 900)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#080f1e',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'DM Sans', sans-serif",
      padding: '32px 20px',
    }}>

      {/* Subtle glow behind card */}
      <div style={{
        position: 'fixed', top: '40%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '700px', height: '500px',
        background: 'radial-gradient(ellipse, rgba(201,168,76,0.05) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />

      <div style={{ width: '100%', maxWidth: '440px', position: 'relative' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/kb-logo.png" alt="KingdomBroker.com"
            style={{ height: '38px', width: 'auto', display: 'inline-block' }} />
        </div>

        {/* Headline */}
        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: '28px', fontWeight: 600,
          color: '#F2EEE7', margin: '0 0 28px',
          textAlign: 'center', lineHeight: 1.3,
        }}>
          The Smarter Way to<br />Buy &amp; Sell Businesses
        </h1>

        {!sent ? (
          <>
            {/* Form card */}
            <div style={{
              background: '#0D1F3C',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '16px',
              padding: '32px',
              marginBottom: '16px',
            }}>
              <p style={{
                fontSize: '15px', color: '#9BA8C0',
                margin: '0 0 24px', lineHeight: 1.65, textAlign: 'center',
              }}>
                Enter your email for a secure access link.<br />No password needed.
              </p>

              <form onSubmit={handleSubmit}>
                <label style={{
                  display: 'block', fontSize: '13px', fontWeight: 600,
                  color: '#7A8BAA', letterSpacing: '0.08em',
                  textTransform: 'uppercase', marginBottom: '8px',
                }}>
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  required
                  style={{
                    width: '100%', padding: '14px 16px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '10px', color: '#F2EEE7',
                    fontSize: '16px', fontFamily: "'DM Sans', sans-serif",
                    marginBottom: '14px', boxSizing: 'border-box',
                    outline: 'none',
                  }}
                />
                {error && (
                  <div style={{ padding: '10px 14px', background: 'rgba(232,73,73,0.1)', border: '1px solid rgba(232,73,73,0.25)', borderRadius: '8px', color: '#E87373', fontSize: '13px', marginBottom: '12px' }}>
                    {error}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%', padding: '15px',
                    background: loading ? 'rgba(201,168,76,0.5)' : '#C9A84C',
                    color: '#0B1B3E', border: 'none', borderRadius: '10px',
                    fontSize: '16px', fontWeight: 700,
                    fontFamily: "'DM Sans', sans-serif",
                    cursor: loading ? 'not-allowed' : 'pointer',
                    transition: 'background 0.2s',
                  }}
                >
                  {loading ? 'Sending...' : 'Access My Dashboard'}
                </button>
              </form>
            </div>

            {/* Demo shortcut — lighter treatment */}
            <div style={{
              border: '1px solid rgba(201,168,76,0.18)',
              borderRadius: '14px',
              padding: '20px 24px',
              marginBottom: '28px',
              background: 'rgba(201,168,76,0.04)',
            }}>
              <div style={{
                fontSize: '12px', fontWeight: 700, color: '#C9A84C',
                letterSpacing: '0.12em', textTransform: 'uppercase',
                marginBottom: '8px',
              }}>
                Live Demo
              </div>
              <p style={{
                fontSize: '14px', color: '#9BA8C0',
                lineHeight: 1.65, margin: '0 0 14px',
              }}>
                Enter <strong style={{ color: '#F2EEE7' }}>demo@kingdombroker.com</strong> to tour a real $4.8M HVAC deal — financials, valuation, and matched buyers loaded.
              </p>
              <button
                onClick={loadDemo}
                disabled={loading}
                style={{
                  width: '100%', padding: '12px',
                  background: 'transparent',
                  border: '1px solid rgba(201,168,76,0.3)',
                  borderRadius: '8px', color: '#C9A84C',
                  fontSize: '14px', fontWeight: 600,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {loading ? 'Loading...' : 'Load Demo Account'}
              </button>
            </div>

            {/* Trust stats — clean and spaced */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '36px',
              marginBottom: '24px',
            }}>
              {[
                { n: '80+', label: 'Clients Served' },
                { n: '$1M–$20M', label: 'Deal Range' },
                { n: '15+ Years', label: 'Experience' },
              ].map(b => (
                <div key={b.n} style={{ textAlign: 'center' }}>
                  <div style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: '20px', color: '#C9A84C', fontWeight: 600,
                    marginBottom: '3px',
                  }}>{b.n}</div>
                  <div style={{ fontSize: '12px', color: '#4A5880' }}>{b.label}</div>
                </div>
              ))}
            </div>

            {/* Hidden admin bypass — subtle link, not visible to normal users */}
            {!showAdminCode ? (
              <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                <button
                  onClick={() => setShowAdminCode(true)}
                  style={{ background: 'none', border: 'none', color: '#3A4860', fontSize: '11px', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}
                >
                  ·
                </button>
              </div>
            ) : (
              <form onSubmit={handleAdminCode} style={{ marginBottom: '16px' }}>
                <input
                  type="password"
                  value={adminCode}
                  onChange={e => setAdminCode(e.target.value)}
                  placeholder="Admin code"
                  autoFocus
                  style={{
                    width: '100%', padding: '11px 14px',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '8px', color: '#F2EEE7',
                    fontSize: '14px', fontFamily: "'DM Sans', sans-serif",
                    marginBottom: '8px', boxSizing: 'border-box', outline: 'none',
                  }}
                />
                {adminError && (
                  <div style={{ fontSize: '12px', color: '#E87373', marginBottom: '8px', textAlign: 'center' }}>{adminError}</div>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%', padding: '11px',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px', color: '#9BA8C0',
                    fontSize: '13px', cursor: loading ? 'not-allowed' : 'pointer',
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  {loading ? 'Verifying...' : 'Enter'}
                </button>
              </form>
            )}

            {/* Footer */}
            <div style={{ textAlign: 'center', fontSize: '12px', color: '#3A4860', lineHeight: 1.6 }}>
              By signing in you agree to our Terms of Service.<br />
              Kingdom Broker Inc. · Plano, Texas
            </div>
          </>
        ) : (
          /* Sent confirmation */
          <div style={{
            background: '#0D1F3C',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '16px',
            padding: '40px 32px',
            textAlign: 'center',
          }}>
            <div style={{ marginBottom: '18px', color: '#C9A84C' }}><svg viewBox='0 0 24 24' width='44' height='44' fill='none' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round'><rect x='2' y='5' width='20' height='14' rx='2'/><polyline points='2,5 12,13 22,5'/></svg></div>
            <h2 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '24px', color: '#F2EEE7', margin: '0 0 12px',
            }}>Check your inbox</h2>
            <p style={{
              fontSize: '15px', color: '#9BA8C0',
              lineHeight: 1.75, margin: '0 0 24px',
            }}>
              Access link sent to<br />
              <strong style={{ color: '#F2EEE7' }}>{email}</strong>.<br />
              Click the link to open your dashboard.<br />Expires in one hour.
            </p>
            <button onClick={() => setSent(false)} style={{
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#9BA8C0', borderRadius: '8px',
              padding: '11px 24px', fontSize: '14px',
              cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
            }}>
              Use a different email
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
