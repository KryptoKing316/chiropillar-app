'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
// Use @supabase/ssr (the modern, Next 16-compatible package) instead of the
// deprecated @supabase/auth-helpers-nextjs — the old package no longer reliably
// exports createBrowserClient, which is why magic-link sends were silently
// failing with the generic "Something went wrong" catch.
import { createBrowserClient } from '@supabase/ssr'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [demoLoading, setDemoLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const trimmedEmail = email.trim().toLowerCase()

    // Surface a clear error if env vars are missing instead of silently failing
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !anon) {
      setError('Authentication is not configured (missing Supabase environment variables in the deployment). Contact Eric.')
      setLoading(false)
      return
    }

    try {
      const supabase = createBrowserClient(url, anon)
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
        } else if (msg.includes('signup') || msg.includes('signups not allowed')) {
          setError('This email is not on the access list. Contact Eric to be added before logging in.')
        } else if (msg.includes('redirect') || msg.includes('url')) {
          setError(`Supabase rejected the callback URL. The Site URL and redirect-URL list need to include this domain. (${otpError.message})`)
        } else {
          setError(otpError.message)
        }
        setLoading(false)
      } else {
        setLoading(false)
        setSent(true)
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      setError(`Could not send magic link: ${msg}`)
      setLoading(false)
    }
  }

  const loadDemo = async () => {
    setDemoLoading(true)
    try {
      // Set the demo-mode cookie server-side, then drop the user on the platform overview
      await fetch('/api/demo-mode', { method: 'POST' })
      router.replace('/overview')
    } catch {
      setDemoLoading(false)
      setError('Could not start demo session. Please try again.')
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0B1B3E',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Inter', 'DM Sans', system-ui, sans-serif",
      padding: '32px 20px',
    }}>

      {/* Subtle blue glow behind card */}
      <div style={{
        position: 'fixed', top: '40%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '700px', height: '500px',
        background: 'radial-gradient(ellipse, rgba(46,117,182,0.10) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />

      <div style={{ width: '100%', maxWidth: '460px', position: 'relative' }}>

        {/* ChiroPillar lockup · brand-guide mascot (with arms) + solid white text */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/chiropillar-mascot-dark.svg"
            alt="ChiroPillar mascot"
            style={{
              width: 'clamp(84px, 11vw, 104px)',
              height: 'clamp(84px, 11vw, 104px)',
              display: 'inline-block',
            }}
          />
          <div style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 'clamp(30px, 4vw, 38px)',
            fontWeight: 700,
            color: '#FFFFFF',
            letterSpacing: '-0.02em',
            lineHeight: 1,
            marginTop: '14px',
            marginBottom: '8px',
          }}>
            ChiroPillar
          </div>
          <div style={{
            fontFamily: "'JetBrains Mono', 'DM Mono', monospace",
            fontSize: '12px',
            fontWeight: 600,
            color: '#FFFFFF',
            letterSpacing: '0.28em',
            textTransform: 'uppercase',
          }}>
            Strength in Alignment
          </div>
        </div>

        {/* Headline */}
        <h1 style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: '22px', fontWeight: 600,
          color: '#F2EEE7', margin: '0 0 22px',
          textAlign: 'center', lineHeight: 1.3,
        }}>
          Chiropractic Roll-Up Platform
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
                  placeholder="you@chiropillar.com"
                  required
                  style={{
                    width: '100%', padding: '14px 16px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '10px', color: '#F2EEE7',
                    fontSize: '16px', fontFamily: "'Inter', system-ui, sans-serif",
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
                  disabled={loading || demoLoading}
                  style={{
                    width: '100%', padding: '15px',
                    background: loading ? 'rgba(46,117,182,0.5)' : '#2E75B6',
                    color: '#F2EEE7', border: 'none', borderRadius: '10px',
                    fontSize: '16px', fontWeight: 700,
                    fontFamily: "'Inter', system-ui, sans-serif",
                    cursor: (loading || demoLoading) ? 'not-allowed' : 'pointer',
                    transition: 'background 0.2s',
                  }}
                >
                  {loading ? 'Sending magic link...' : 'Send Me a Magic Link'}
                </button>
              </form>
            </div>

            {/* Demo shortcut · matches KB pattern */}
            <div style={{
              border: '1px solid rgba(201,168,76,0.25)',
              borderRadius: '14px',
              padding: '20px 24px',
              marginBottom: '28px',
              background: 'rgba(201,168,76,0.04)',
            }}>
              <div style={{
                fontSize: '12px', fontWeight: 700, color: '#C9A84C',
                letterSpacing: '0.14em', textTransform: 'uppercase',
                marginBottom: '8px',
              }}>
                Live Demo · 30 Min Read-Only
              </div>
              <p style={{
                fontSize: '14px', color: '#9BA8C0',
                lineHeight: 1.65, margin: '0 0 14px',
              }}>
                Tour the full ChiroPillar platform with <strong style={{ color: '#F2EEE7' }}>5 sample chiropractor applications</strong> loaded — qualification badges, valuation bands, and pipeline status. No login required.
              </p>
              <button
                onClick={loadDemo}
                disabled={loading || demoLoading}
                style={{
                  width: '100%', padding: '12px',
                  background: 'transparent',
                  border: '1px solid rgba(201,168,76,0.4)',
                  borderRadius: '8px', color: '#C9A84C',
                  fontSize: '14px', fontWeight: 600,
                  cursor: (loading || demoLoading) ? 'not-allowed' : 'pointer',
                  fontFamily: "'Inter', system-ui, sans-serif",
                }}
              >
                {demoLoading ? 'Loading demo...' : 'View Live Demo →'}
              </button>
            </div>

            {/* Trust stats — traction + reach + impact + goal */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '14px',
              marginBottom: '24px',
            }}>
              {[
                { n: '21',     label: 'Chiropractors Helped' },
                { n: '5,000+', label: 'Patients Served' },
                { n: '$30M',   label: 'Revenue Added' },
                { n: '100',    label: 'Office Goal' },
              ].map(b => (
                <div key={b.label} style={{ textAlign: 'center' }}>
                  <div style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontSize: '20px', color: '#C9A84C', fontWeight: 700,
                    marginBottom: '3px', lineHeight: 1,
                  }}>{b.n}</div>
                  <div style={{ fontSize: '10.5px', color: '#7A8BAA', lineHeight: 1.3 }}>{b.label}</div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div style={{ textAlign: 'center', fontSize: '12px', color: '#3A4860', lineHeight: 1.6 }}>
              By signing in you agree to confidentiality terms.<br />
              ChiroPillar · Wagner Family Office × Kingdom Broker
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
            <div style={{ marginBottom: '18px', color: '#9CC4E4' }}><svg viewBox='0 0 24 24' width='44' height='44' fill='none' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round'><rect x='2' y='5' width='20' height='14' rx='2'/><polyline points='2,5 12,13 22,5'/></svg></div>
            <h2 style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: '24px', color: '#F2EEE7', margin: '0 0 12px',
            }}>Check your inbox</h2>
            <p style={{
              fontSize: '15px', color: '#9BA8C0',
              lineHeight: 1.75, margin: '0 0 24px',
            }}>
              Access link sent to<br />
              <strong style={{ color: '#F2EEE7' }}>{email}</strong>.<br />
              Click the link to open the ChiroPillar platform.<br />Expires in one hour.
            </p>
            <button onClick={() => setSent(false)} style={{
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#9BA8C0', borderRadius: '8px',
              padding: '11px 24px', fontSize: '14px',
              cursor: 'pointer', fontFamily: "'Inter', system-ui, sans-serif",
            }}>
              Use a different email
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
