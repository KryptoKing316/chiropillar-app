'use client'
import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createBrowserClient } from '@supabase/auth-helpers-nextjs'
import { DEMO_DEAL, DEMO_BUYERS, DEMO_ACTIVITY } from '@/lib/demo-data'

const STAGES = ['Onboarding', 'Active', 'Matched', 'LOI', 'Diligence', 'Closed']
const CURRENT = 2

function fmt(n: number) {
  if (n >= 1000000) return '$' + (n / 1000000).toFixed(1) + 'M'
  if (n >= 1000) return '$' + Math.round(n / 1000) + 'K'
  return '$' + n
}

export default function DashOverview() {
  return (
    <Suspense>
      <DashOverviewInner />
    </Suspense>
  )
}

function DashOverviewInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isDemo = searchParams.get('demo') === 'true'
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (isDemo) { setLoaded(true); return }
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.replace('/login'); return }
      const userEmail = session.user.email?.toLowerCase()
      // Admin (Eric) sees the generic dashboard. Everyone else: redirect to their client portal.
      if (userEmail && userEmail !== 'eric@kingdombroker.com') {
        const { data: ownerClient } = await supabase
          .from('clients')
          .select('slug')
          .eq('owner_email', userEmail)
          .eq('is_demo', false)
          .maybeSingle()
        if (ownerClient?.slug) {
          router.replace(`/clients/${ownerClient.slug}`)
          return
        }
      }
      setLoaded(true)
    })
  }, [router, isDemo])

  if (!loaded) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: 'var(--kb-text-muted)' }}>
      Loading...
    </div>
  )

  return (
    <div className="kb-page-content" style={{ padding: '32px 36px', fontFamily: "'Inter', system-ui, sans-serif", color: 'var(--kb-text)', maxWidth: '1200px' }}>

      {/* Live Deal Counter — creates instant credibility */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '18px', padding: '14px 18px', background: 'linear-gradient(135deg, rgba(201,168,76,0.10), rgba(46,204,139,0.06))', border: '1px solid var(--kb-accent-border)', borderRadius: '8px' }}>
        <div style={{ fontSize: '11px', color: 'var(--kb-accent)', fontWeight: 590, letterSpacing: '0.12em', textTransform: 'uppercase', paddingRight: '14px', borderRight: '1px solid var(--kb-border)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ display: 'inline-block', width: '7px', height: '7px', borderRadius: '50%', background: 'var(--kb-green)', animation: 'pulse 2s infinite' }}></span>
          Live Pipeline
        </div>
        {[
          { label: 'Sellers', val: '2,067', color: 'var(--kb-text)' },
          { label: 'Buyers', val: '713', color: 'var(--kb-text)' },
          { label: 'Active Deals', val: '6', color: 'var(--kb-accent)' },
          { label: 'Capital in Motion', val: '$45M+', color: 'var(--kb-green)' },
          { label: 'Roll-Up Targets', val: '42', color: 'var(--kb-text)' },
        ].map(s => (
          <div key={s.label} style={{ display: 'flex', flexDirection: 'column', gap: '2px', paddingRight: '14px' }}>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '15px', color: s.color, fontWeight: 590, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{s.val}</div>
            <div style={{ fontSize: '10px', color: 'var(--kb-text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Demo notice + Start Tour CTA */}
      <div style={{ background: 'var(--kb-accent-dim)', border: '1px solid var(--kb-accent-border)', borderRadius: '8px', padding: '12px 18px', marginBottom: '28px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '11px', color: 'var(--kb-accent)', fontWeight: 590, letterSpacing: '0.1em', textTransform: 'uppercase', background: 'var(--kb-accent-dim)', padding: '3px 9px', borderRadius: '4px', border: '1px solid var(--kb-accent-border)' }}>Demo Mode</span>
        <span style={{ fontSize: '14px', color: 'var(--kb-text-secondary)', flex: 1 }}>Viewing <strong style={{ color: 'var(--kb-text)' }}>Legacy HVAC Services</strong>, pre-loaded investor demo.</span>
        <a href="/walkthrough" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: 'var(--kb-accent)', color: '#0B1B3E', fontSize: '13px', fontWeight: 600, borderRadius: '6px', textDecoration: 'none', whiteSpace: 'nowrap' }}>
          ▶ Start 2-Min Tour
        </a>
      </div>

      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ fontSize: '11px', color: 'var(--kb-text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px', fontWeight: 510 }}>Deal Overview</div>
        <h1 className="kb-h1" style={{ fontFamily: "'Playfair Display', serif", fontSize: '36px', fontWeight: 600, margin: '0 0 8px', color: 'var(--kb-text)', letterSpacing: '-0.3px' }}>{DEMO_DEAL.business_name}</h1>
        <div style={{ fontSize: '16px', color: 'var(--kb-text-secondary)', lineHeight: 1.5 }}>
          {DEMO_DEAL.city}, {DEMO_DEAL.state} &nbsp;·&nbsp; {DEMO_DEAL.industry} &nbsp;·&nbsp; {DEMO_DEAL.years_in_business} years in business &nbsp;·&nbsp; {DEMO_DEAL.employee_count} employees
        </div>
      </div>

      {/* Deal Stage */}
      <div style={{ background: 'var(--kb-bg-panel)', border: '1px solid var(--kb-border)', borderRadius: '8px', padding: '24px 28px', marginBottom: '22px' }}>
        <div style={{ fontSize: '12px', color: 'var(--kb-accent)', fontWeight: 590, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '20px' }}>Deal Stage</div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {STAGES.map((s, i) => {
            const done = i < CURRENT, curr = i === CURRENT, last = i === STAGES.length - 1
            return (
              <div key={s} style={{ display: 'flex', alignItems: 'center', flex: last ? 0 : 1 }}>
                <div style={{ textAlign: 'center', minWidth: '84px' }}>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '50%', margin: '0 auto 8px',
                    background: done ? 'var(--kb-green)' : curr ? 'var(--kb-accent)' : 'var(--kb-bg-raised)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '13px', color: done || curr ? 'var(--kb-bg)' : 'var(--kb-text-muted)', fontWeight: 590,
                  }}>
                    {done ? <svg viewBox="0 0 14 14" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3,7 6,10 11,4"/></svg> : i + 1}
                  </div>
                  <div style={{ fontSize: '13px', color: curr ? 'var(--kb-accent)' : done ? 'var(--kb-green)' : 'var(--kb-text-muted)', fontWeight: curr ? 510 : 400 }}>{s}</div>
                </div>
                {!last && <div style={{ flex: 1, height: '2px', background: done ? 'var(--kb-green)' : 'var(--kb-border)', margin: '0 4px 16px', borderRadius: '1px' }} />}
              </div>
            )
          })}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="kb-grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px', marginBottom: '22px' }}>
        {[
          { label: 'Asking Price', value: fmt(DEMO_DEAL.asking_price), sub: '4.4x normalized EBITDA', color: 'var(--kb-accent)' },
          { label: 'Annual Revenue', value: fmt(DEMO_DEAL.ttm_revenue), sub: '+13.5% growth last year', color: 'var(--kb-green)' },
          { label: 'EBITDA (Profit)', value: fmt(DEMO_DEAL.ttm_ebitda), sub: fmt(DEMO_DEAL.normalized_ebitda) + ' after add-backs', color: 'var(--kb-green)' },
          { label: 'Valuation Range', value: fmt(DEMO_DEAL.valuation_low) + '–' + fmt(DEMO_DEAL.valuation_high), sub: 'Fair market: ' + fmt(DEMO_DEAL.valuation_mid), color: 'var(--kb-accent)' },
        ].map(m => (
          <div key={m.label} style={{ background: 'var(--kb-bg-surface)', border: '1px solid var(--kb-border)', borderRadius: '8px', padding: '20px' }}>
            <div style={{ fontSize: '12px', color: 'var(--kb-text-secondary)', fontWeight: 510, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '10px' }}>{m.label}</div>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '24px', color: m.color, fontWeight: 510, lineHeight: 1, marginBottom: '7px', fontVariantNumeric: 'tabular-nums' }}>{m.value}</div>
            <div style={{ fontSize: '13px', color: 'var(--kb-text-secondary)' }}>{m.sub}</div>
          </div>
        ))}
      </div>

      {/* Two columns */}
      <div className="kb-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px', marginBottom: '22px' }}>
        <div style={{ background: 'var(--kb-bg-panel)', border: '1px solid var(--kb-border)', borderRadius: '8px', padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ fontSize: '16px', fontWeight: 590 }}>Top Buyer Matches</div>
            <a href="/buyers" style={{ fontSize: '13px', color: 'var(--kb-accent)', textDecoration: 'none', fontWeight: 510 }}>View all</a>
          </div>
          {DEMO_BUYERS.slice(0, 3).map(b => {
            const c = b.fit_score >= 85 ? 'var(--kb-green)' : 'var(--kb-accent)'
            return (
              <div key={b.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid var(--kb-border-subtle)' }}>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 510, marginBottom: '3px' }}>{b.firm_name}</div>
                  <div style={{ fontSize: '13px', color: 'var(--kb-text-secondary)' }}>{b.investor_type}</div>
                </div>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', border: `2px solid ${b.fit_score >= 85 ? '#2ECC8B' : '#C9A84C'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${b.fit_score >= 85 ? '#2ECC8B' : '#C9A84C'}14`, flexShrink: 0 }}>
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '15px', fontWeight: 510, color: b.fit_score >= 85 ? '#2ECC8B' : '#C9A84C', fontVariantNumeric: 'tabular-nums' }}>{b.fit_score}</span>
                </div>
              </div>
            )
          })}
        </div>

        <div style={{ background: 'var(--kb-bg-panel)', border: '1px solid var(--kb-border)', borderRadius: '8px', padding: '22px' }}>
          <div style={{ fontSize: '16px', fontWeight: 590, marginBottom: '16px' }}>Recent Activity</div>
          {DEMO_ACTIVITY.slice(0, 5).map(a => (
            <div key={a.id} style={{ display: 'flex', gap: '13px', padding: '11px 0', borderBottom: '1px solid var(--kb-border-subtle)' }}>
              <span style={{ fontSize: '18px', flexShrink: 0, lineHeight: 1.4 }}>{a.icon}</span>
              <div>
                <div style={{ fontSize: '14px', color: 'var(--kb-text)', marginBottom: '2px' }}>{a.event}</div>
                <div style={{ fontSize: '12px', color: 'var(--kb-text-muted)' }}>{a.time}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Advisor Card */}
      <div style={{ background: 'var(--kb-accent-dim)', border: '1px solid var(--kb-accent-border)', borderRadius: '8px', padding: '26px', textAlign: 'center', maxWidth: '320px' }}>
        <div style={{ width: '80px', height: '80px', borderRadius: '50%', margin: '0 auto 14px', overflow: 'hidden', border: '2px solid var(--kb-accent-border)' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/eric-skeldon.jpeg" alt="Eric Skeldon" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '20px', marginBottom: '4px' }}>Eric Skeldon</div>
        <div style={{ fontSize: '12px', color: 'var(--kb-accent)', fontWeight: 590, marginBottom: '12px', letterSpacing: '0.07em', textTransform: 'uppercase' }}>Founder & CEO</div>
        <a href="https://calendly.com/ericskeldon/kingdombroker" target="_blank" rel="noopener noreferrer"
          style={{ display: 'block', padding: '11px', background: 'var(--kb-accent)', color: '#FFFFFF', borderRadius: '6px', fontSize: '14px', fontWeight: 590, textDecoration: 'none', boxShadow: 'var(--kb-shadow-1)' }}>
          Book a Call
        </a>
      </div>
    </div>
  )
}
