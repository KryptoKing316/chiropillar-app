'use client'
import { useState } from 'react'
import { DEMO_BUYERS } from '@/lib/demo-data'
import BuyerMatchPreview from '@/components/dashboard/BuyerMatchPreview'

function fmt(n: number) { return '$' + (n / 1000000).toFixed(1) + 'M' }

const STATUS_COLOR: Record<string, string> = {
  'Identified': 'var(--kb-text-muted)',
  'Contacted': '#C9A84C',
  'Scheduled Call': '#2ECC8B',
  'Interested': '#2ECC8B',
  'LOI': '#C9A84C',
  'Passed': 'var(--kb-text-secondary)',
}

export default function BuyersPage() {
  const [open, setOpen] = useState<string | null>(null)

  return (
    <div style={{ padding: '32px 36px', fontFamily: "'Inter', system-ui, sans-serif", color: 'var(--kb-text)', maxWidth: '1200px' }}>
      <div style={{ fontSize: '11px', color: 'var(--kb-text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 510, marginBottom: '6px' }}>Buyer Matches</div>
      <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '28px', fontWeight: 600, margin: '0 0 5px', letterSpacing: '-0.3px' }}>Matched Buyers</h1>
      <p style={{ fontSize: '15px', color: 'var(--kb-text-secondary)', margin: '0 0 24px', lineHeight: 1.5 }}>AI matched buyers ranked by fit score. Scores reflect geography, check size, industry thesis, and financing likelihood.</p>

      {/* HERO · pitch-deck-style preview of a high-fit match */}
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(340px, 1fr) minmax(380px, 1.1fr)',
          gap: '36px',
          alignItems: 'center',
          background: 'linear-gradient(135deg, rgba(11,27,62,0.5) 0%, rgba(15,35,71,0.3) 100%)',
          border: '1px solid rgba(201,168,76,0.18)',
          borderRadius: '20px',
          padding: '36px 32px',
          marginBottom: '28px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(ellipse at 80% 20%, rgba(46,204,139,0.08), transparent 60%)',
            pointerEvents: 'none',
          }}
        />

        {/* Left: explainer + CTA */}
        <div style={{ position: 'relative' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              fontFamily: "'DM Mono', monospace",
              fontSize: '11px',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: '#2ECC8B',
              background: 'rgba(46,204,139,0.10)',
              border: '1px solid rgba(46,204,139,0.30)',
              borderRadius: '999px',
              padding: '6px 12px',
              marginBottom: '20px',
            }}
          >
            <span
              style={{
                display: 'inline-block',
                width: '5px',
                height: '5px',
                borderRadius: '50%',
                background: '#2ECC8B',
                boxShadow: '0 0 8px rgba(46,204,139,0.6)',
              }}
            />
            AI Buyer Matching
          </div>

          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(22px, 2.8vw, 30px)',
              fontWeight: 700,
              color: '#F2EEE7',
              margin: 0,
              lineHeight: 1.15,
              letterSpacing: '-0.01em',
            }}
          >
            The KB Engine doesn&rsquo;t broadcast your deal.{' '}
            <span style={{ color: '#C9A84C', fontStyle: 'italic' }}>It curates buyers worth the call.</span>
          </h2>

          <p
            style={{
              fontSize: '14.5px',
              color: 'rgba(242,238,231,0.75)',
              lineHeight: 1.65,
              margin: '14px 0 22px',
              maxWidth: '440px',
            }}
          >
            Every buyer in our 2,500+ network is scored against your business on 4 dimensions: geography fit, check-size fit, industry thesis match, and financing likelihood. The Pitch Personalization Agent writes a tailored outbound email per buyer. You see only the matches with fit-score 80+.
          </p>

          <ul
            style={{
              listStyle: 'none',
              padding: 0,
              margin: '0 0 24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            {[
              'Family offices, PE funds, search funds, strategics',
              'Personalized pitch email drafted per buyer',
              'Outreach status tracker (Identified → LOI → Passed)',
              'No public-marketplace exposure of your deal',
            ].map((b, i) => (
              <li
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  fontSize: '14px',
                  color: 'rgba(242,238,231,0.85)',
                  lineHeight: 1.5,
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '2px' }}>
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Right: sample match card */}
        <div
          style={{
            position: 'relative',
            transform: 'rotate(1.5deg)',
            transition: 'transform 0.4s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'rotate(0deg) scale(1.02)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'rotate(1.5deg) scale(1)'
          }}
        >
          <BuyerMatchPreview />
        </div>
      </section>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', marginBottom: '22px' }}>
        {[
          { label: 'Total Matches', value: '5' },
          { label: 'Avg Fit Score', value: '87' },
          { label: 'Outreach Sent', value: '2' },
          { label: 'Calls Scheduled', value: '1' },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--kb-bg-surface)', border: '1px solid var(--kb-border-subtle)', borderRadius: '8px', padding: '16px 20px' }}>
            <div style={{ fontSize: '12px', color: 'var(--kb-text-secondary)', fontWeight: 510, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '6px' }}>{s.label}</div>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '24px', fontWeight: 500, color: 'var(--kb-text)', fontVariantNumeric: 'tabular-nums' }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {DEMO_BUYERS.map(b => {
          const sc = b.fit_score >= 85 ? '#2ECC8B' : b.fit_score >= 70 ? '#C9A84C' : 'var(--kb-text-secondary)'
          const isOpen = open === b.id
          return (
            <div key={b.id} style={{ background: 'var(--kb-bg-card)', border: '1px solid var(--kb-border)', borderRadius: '8px', padding: '20px' }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                {/* Score */}
                <div style={{ width: '50px', height: '50px', borderRadius: '50%', border: `2px solid ${sc}`, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${sc}14`, flexShrink: 0 }}>
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '15px', fontWeight: 500, color: sc, fontVariantNumeric: 'tabular-nums' }}>{b.fit_score}</span>
                </div>
                {/* Info */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '7px' }}>
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: 590, marginBottom: '4px' }}>{b.firm_name}</div>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span style={{ fontSize: '11px', padding: '2px 8px', background: 'rgba(29,155,240,0.1)', color: '#5BB8F5', borderRadius: '4px', fontWeight: 500 }}>{b.investor_type}</span>
                        <span style={{ fontSize: '12px', color: 'var(--kb-text-secondary)' }}>{fmt(b.deal_size_min)} – {fmt(b.deal_size_max)}</span>
                        <span style={{ fontSize: '12px', color: 'var(--kb-text-secondary)' }}>{b.geography.join(', ')}</span>
                      </div>
                    </div>
                    <span style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '6px', background: `${STATUS_COLOR[b.outreach_status] || 'var(--kb-text-muted)'}1F`, color: STATUS_COLOR[b.outreach_status] || 'var(--kb-text-muted)', fontWeight: 500, border: `1px solid ${STATUS_COLOR[b.outreach_status] || 'var(--kb-text-muted)'}35`, whiteSpace: 'nowrap' }}>
                      {b.outreach_status}
                    </span>
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--kb-text-secondary)', marginBottom: '10px', lineHeight: 1.6 }}>{b.score_reason}</div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {['Geography', 'Check Size', 'Industry Thesis', 'Financing Likely'].map(tag => (
                      <span key={tag} style={{ fontSize: '11px', padding: '3px 8px', background: 'rgba(46,204,139,0.12)', border: '1px solid rgba(46,204,139,0.18)', borderRadius: '4px', color: 'var(--kb-green)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        {tag}
                        <svg viewBox="0 0 14 14" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3,7 6,10 11,4"/></svg>
                      </span>
                    ))}
                  </div>
                </div>
                <button onClick={() => setOpen(isOpen ? null : b.id)} style={{ padding: '8px 16px', background: 'var(--kb-bg-card)', border: '1px solid var(--kb-border)', color: 'var(--kb-text)', borderRadius: '6px', fontSize: '14px', fontWeight: 510, cursor: 'pointer', fontFamily: "'Inter', system-ui, sans-serif", whiteSpace: 'nowrap', flexShrink: 0 }}>
                  {isOpen ? 'Close ↑' : 'View Pitch →'}
                </button>
              </div>

              {isOpen && (
                <div style={{ marginTop: '16px', padding: '16px', background: 'var(--kb-bg-raised)', border: '1px solid var(--kb-border)', borderRadius: '10px' }}>
                  <div style={{ fontSize: '10px', color: 'var(--kb-accent)', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>Personalized Pitch Email</div>
                  <div style={{ fontSize: '12px', color: 'var(--kb-text-secondary)', marginBottom: '10px' }}>Subject: {b.pitch_subject}</div>
                  <pre style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '13px', color: 'var(--kb-text)', lineHeight: 1.75, whiteSpace: 'pre-wrap', margin: 0 }}>{b.pitch_email}</pre>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
