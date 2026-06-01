'use client'
import { useState, useCallback } from 'react'
import CIMChat from '@/components/dashboard/cim/CIMChat'
import CIMPreview from '@/components/dashboard/cim/CIMPreview'
import CIMProgress from '@/components/dashboard/cim/CIMProgress'
import CIMExportButton from '@/components/dashboard/cim/CIMExportButton'
import CIMCoverMockup from '@/components/dashboard/cim/CIMCoverMockup'

type Tab = 'build' | 'preview'

export default function CIMPage() {
  const [activeTab, setActiveTab] = useState<Tab>('build')
  const [currentRound, setCurrentRound] = useState(1)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [generatedCIM, setGeneratedCIM] = useState<Record<string, any> | null>(null)
  const [hasStarted, setHasStarted] = useState(false)

  const handleRoundChange = useCallback((round: number) => {
    setCurrentRound(round)
    if (round > 1) setHasStarted(true)
  }, [])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleComplete = useCallback((cimData: Record<string, any>) => {
    setGeneratedCIM(cimData)
    setActiveTab('preview')
  }, [])

  const isComplete = !!generatedCIM

  return (
    <div
      style={{
        padding: '28px 32px 80px',
        fontFamily: "'Inter', system-ui, sans-serif",
        color: 'var(--kb-text)',
        maxWidth: '1200px',
        margin: '0 auto',
      }}
    >
      {/* ── HEADER ── */}
      <div
        style={{
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <div
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: '10px',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: '#C9A84C',
              marginBottom: '6px',
            }}
          >
            Confidential Information Memorandum
          </div>
          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '32px',
              fontWeight: 700,
              color: 'var(--kb-text)',
              margin: 0,
              letterSpacing: '-0.01em',
              lineHeight: 1.1,
            }}
          >
            CIM Builder
          </h1>
          <p
            style={{
              fontSize: '14px',
              color: 'var(--kb-text-secondary)',
              margin: '6px 0 0',
              maxWidth: '560px',
            }}
          >
            Build a buyer-ready CIM in 5 conversational rounds &mdash; about 20 minutes. Designed to match
            the polish of an investment-bank pitch book.
          </p>
        </div>
        {isComplete && <CIMExportButton cimData={generatedCIM} />}
      </div>

      {/* ── PROGRESS BAR ── */}
      <CIMProgress currentRound={currentRound} complete={isComplete} />

      {/* ── HERO MOCKUP (shown only before user has started) ── */}
      {!hasStarted && !isComplete && (
        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(340px, 1fr) 1.1fr',
            gap: '36px',
            alignItems: 'center',
            background:
              'linear-gradient(135deg, rgba(11,27,62,0.5) 0%, rgba(15,35,71,0.3) 100%)',
            border: '1px solid rgba(201,168,76,0.18)',
            borderRadius: '20px',
            padding: '40px 36px',
            marginBottom: '28px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Decorative radial */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'radial-gradient(ellipse at 80% 20%, rgba(201,168,76,0.08), transparent 60%)',
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
                color: '#C9A84C',
                background: 'rgba(201,168,76,0.10)',
                border: '1px solid rgba(201,168,76,0.25)',
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
                  background: '#C9A84C',
                }}
              />
              Pitch-Deck Quality
            </div>

            <h2
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 'clamp(24px, 3vw, 32px)',
                fontWeight: 700,
                color: '#F2EEE7',
                margin: 0,
                lineHeight: 1.15,
                letterSpacing: '-0.01em',
              }}
            >
              Your business deserves an{' '}
              <span style={{ color: '#C9A84C', fontStyle: 'italic' }}>
                investment-bank-grade
              </span>{' '}
              CIM.
            </h2>

            <p
              style={{
                fontSize: '15px',
                color: 'rgba(242,238,231,0.75)',
                lineHeight: 1.65,
                margin: '16px 0 24px',
                maxWidth: '440px',
              }}
            >
              Here&rsquo;s a sample of what the KB Engine produces. Beautifully typeset cover page,
              normalized EBITDA, valuation range, growth narrative &mdash; the same caliber of
              document the bulge-bracket banks deliver to PE buyers.
            </p>

            {/* Highlight bullets */}
            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: '0 0 28px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}
            >
              {[
                'Auto-typeset cover + executive summary',
                'Normalized EBITDA with trades-tuned add-backs',
                'Valuation range backed by 2024–2026 transaction data',
                'Buyer-ready PDF export in one click',
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
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#C9A84C"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ flexShrink: 0, marginTop: '2px' }}
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>{b}</span>
                </li>
              ))}
            </ul>

            <button
              type="button"
              onClick={() => {
                setHasStarted(true)
                document
                  .getElementById('cim-builder-section')
                  ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                background: '#C9A84C',
                color: '#0B1B3E',
                padding: '14px 26px',
                borderRadius: '10px',
                border: 'none',
                fontSize: '14px',
                fontWeight: 700,
                fontFamily: "'Inter', system-ui, sans-serif",
                cursor: 'pointer',
                boxShadow: '0 8px 20px rgba(201,168,76,0.25)',
                transition: 'transform .12s, box-shadow .15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)'
                e.currentTarget.style.boxShadow = '0 12px 28px rgba(201,168,76,0.35)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(201,168,76,0.25)'
              }}
            >
              Start Building Yours
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          </div>

          {/* Right: cover mockup (rotation isolated from pill so pill never overlaps cover text) */}
          <div style={{ position: 'relative', paddingBottom: '40px' }}>
            <div
              style={{
                transform: 'rotate(2deg)',
                transition: 'transform 0.4s ease',
                transformOrigin: 'center center',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'rotate(0deg) scale(1.02)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'rotate(2deg) scale(1)'
              }}
            >
              <CIMCoverMockup />
            </div>
            {/* Pill positioned in the non-rotated parent — stays straight + sits below cover */}
            <div
              style={{
                position: 'absolute',
                bottom: '0',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'rgba(11,27,62,0.97)',
                border: '1px solid rgba(201,168,76,0.3)',
                borderRadius: '999px',
                padding: '7px 16px',
                fontFamily: "'DM Mono', monospace",
                fontSize: '10px',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: '#C9A84C',
                whiteSpace: 'nowrap',
                boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
              }}
            >
              Sample &middot; TX Oasis Landscaping
            </div>
          </div>
        </section>
      )}

      {/* ── TABS ── */}
      <div
        id="cim-builder-section"
        style={{
          display: 'flex',
          gap: '4px',
          marginBottom: '20px',
          background: 'var(--kb-bg-raised)',
          borderRadius: '12px',
          padding: '4px',
          width: 'fit-content',
        }}
      >
        {[
          { id: 'build' as Tab, label: 'Build with Clay' },
          { id: 'preview' as Tab, label: 'CIM Preview', disabled: !isComplete },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => !tab.disabled && setActiveTab(tab.id)}
            disabled={tab.disabled}
            style={{
              padding: '10px 22px',
              borderRadius: '9px',
              border: 'none',
              background: activeTab === tab.id ? '#C9A84C' : 'transparent',
              color:
                activeTab === tab.id
                  ? 'var(--kb-bg)'
                  : tab.disabled
                  ? '#3A4860'
                  : 'var(--kb-text-secondary)',
              fontSize: '14px',
              fontWeight: activeTab === tab.id ? 700 : 500,
              fontFamily: "'Inter', system-ui, sans-serif",
              cursor: tab.disabled ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {tab.label}
            {tab.id === 'preview' && !isComplete && (
              <span style={{ marginLeft: '6px', fontSize: '11px', opacity: 0.6 }}>
                (complete build first)
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── CONTENT ── */}
      <div style={{ display: activeTab === 'build' ? 'flex' : 'block', flexDirection: 'column' }}>
        {activeTab === 'build' && (
          <div
            style={{
              background: '#0D1F3C',
              border: '1px solid var(--kb-border)',
              borderRadius: '12px',
              padding: '24px 28px',
              display: 'flex',
              flexDirection: 'column',
              minHeight: '560px',
            }}
          >
            <CIMChat
              cimId="demo"
              initialConversation={[]}
              onRoundChange={handleRoundChange}
              onComplete={handleComplete}
            />
          </div>
        )}

        {activeTab === 'preview' && generatedCIM && (
          <div>
            {/* Export bar */}
            <div
              style={{
                background: 'rgba(46,204,139,0.12)',
                border: '1px solid rgba(46,204,139,0.2)',
                borderRadius: '12px',
                padding: '14px 20px',
                marginBottom: '20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: 'var(--kb-green)',
                    fontFamily: "'DM Mono', monospace",
                    fontVariantNumeric: 'tabular-nums',
                    marginBottom: '3px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <svg viewBox="0 0 14 14" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <polyline points="3,7 6,10 11,4" />
                  </svg>
                  CIM Generation Complete
                </div>
                <div style={{ fontSize: '13px', color: 'var(--kb-text-secondary)' }}>
                  Review your CIM below. Export as PDF or go back to refine any section.
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <button
                  onClick={() => setActiveTab('build')}
                  style={{
                    padding: '10px 18px',
                    background: 'transparent',
                    border: '1px solid var(--kb-border)',
                    borderRadius: '9px',
                    color: 'var(--kb-text-secondary)',
                    fontSize: '13px',
                    fontFamily: "'Inter', system-ui, sans-serif",
                    cursor: 'pointer',
                  }}
                >
                  &larr; Refine with Clay
                </button>
                <CIMExportButton cimData={generatedCIM} />
              </div>
            </div>

            <CIMPreview cim={generatedCIM} />
          </div>
        )}
      </div>
    </div>
  )
}
