'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function OnboardingPage() {
  const router = useRouter()
  const [selected, setSelected] = useState<'seller' | 'buyer' | null>(null)

  const proceed = () => {
    if (selected === 'seller') router.push('/onboarding/seller')
    if (selected === 'buyer') router.push('/onboarding/buyer')
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '32px', fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      <div style={{ maxWidth: '620px', width: '100%' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/kb-logo.png" alt="Kingdom Broker" style={{ height: '48px', marginBottom: '24px' }} />
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '30px', color: 'var(--kb-text)', marginBottom: '10px', fontWeight: 600 }}>
            Welcome to Kingdom Broker
          </h1>
          <p style={{ fontSize: '16px', color: 'var(--kb-text-secondary)', lineHeight: 1.6 }}>
            Tell us what brings you here so we can set up your account.
          </p>
        </div>

        {/* Choice cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '28px' }}>
          {[
            {
              id: 'seller' as const,
              icon: '',
              title: 'Sell My Business',
              desc: 'I own a business ($1M–$20M) and want to explore a confidential sale with qualified buyers.',
              highlights: ['Institutional-grade valuation', 'Matched to 500+ buyers', 'Full CIM generation', 'Confidential process'],
            },
            {
              id: 'buyer' as const,
              icon: '',
              title: 'Acquire a Business',
              desc: 'I\'m looking to buy a business, add a platform company, or deploy capital into essential services.',
              highlights: ['Set your buy box', 'Matched to live deals', 'SBA 7(a) resources', 'Deal flow alerts'],
            },
          ].map(card => (
            <button
              key={card.id}
              onClick={() => setSelected(card.id)}
              style={{
                background: selected === card.id ? 'rgba(201,168,76,0.1)' : 'var(--kb-bg-panel)',
                border: `2px solid ${selected === card.id ? '#C9A84C' : 'rgba(255,255,255,0.08)'}`,
                borderRadius: '12px', padding: '28px 24px',
                cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
                color: 'var(--kb-text)',
              }}
            >
              <div style={{ fontSize: '36px', marginBottom: '14px' }}>{card.icon}</div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '20px', fontWeight: 600, marginBottom: '10px', color: selected === card.id ? '#C9A84C' : 'var(--kb-text)' }}>
                {card.title}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--kb-text-secondary)', lineHeight: 1.6, marginBottom: '16px' }}>
                {card.desc}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                {card.highlights.map(h => (
                  <div key={h} style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '12px', color: selected === card.id ? '#C9A84C' : 'var(--kb-text-muted)' }}>
                    <span style={{ color: 'var(--kb-green)', fontWeight: 590 }}><svg viewBox="0 0 14 14" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3,7 6,10 11,4"/></svg></span> {h}
                  </div>
                ))}
              </div>
            </button>
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={proceed}
          disabled={!selected}
          style={{
            width: '100%', padding: '16px',
            background: selected ? '#C9A84C' : 'rgba(201,168,76,0.25)',
            border: 'none', borderRadius: '12px',
            color: selected ? 'var(--kb-bg)' : 'var(--kb-text-muted)',
            fontSize: '16px', fontWeight: 590,
            fontFamily: "'Inter', system-ui, sans-serif",
            cursor: selected ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s',
          }}
        >
          {selected === 'seller' ? 'Continue to Business Profile →'
            : selected === 'buyer' ? 'Continue to Buy Box Setup →'
            : 'Select an option above'}
        </button>

        {/* Demo note */}
        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <a href="/overview" style={{
            fontSize: '16px', color: 'var(--kb-text-secondary)', textDecoration: 'underline',
            textUnderlineOffset: '3px', fontWeight: 510,
          }}>
            Not ready yet? Explore the live demo first →
          </a>
        </div>
      </div>
    </div>
  )
}
