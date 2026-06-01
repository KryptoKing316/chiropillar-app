'use client'

// ---------------------------------------------------------------------------
// PipelineTimelineMockup — Pitch-deck-style timeline of a deal moving
// through stages, using TX Oasis Landscaping as the demo business so the
// brand consistency matches the CIM cover mockup.
// ---------------------------------------------------------------------------

const TIMELINE = [
  {
    day: 'Day 1',
    title: 'Documents uploaded',
    description: 'Seller drags 3-year financials folder. Trades-tuned Claude extraction surfaces 7 add-back candidates worth $284K.',
    status: 'complete' as const,
  },
  {
    day: 'Day 3',
    title: 'AI valuation built',
    description: '$8.4M TTM revenue, $1.8M normalized EBITDA, valuation range $7.5M–$9.5M against landscape-services comps.',
    status: 'complete' as const,
  },
  {
    day: 'Day 12',
    title: 'CIM generated',
    description: 'Confidential Information Memorandum produced by the KB Engine — reviewed + approved by Eric, exported to PDF.',
    status: 'complete' as const,
  },
  {
    day: 'Day 18',
    title: 'Buyer matching complete',
    description: '24 vetted buyers from the 2,500+ network scored. 9 high-fit (80+). Personalized pitches drafted for top 7.',
    status: 'complete' as const,
  },
  {
    day: 'Day 24',
    title: 'Outreach launched',
    description: 'Pitches sent. 4 buyers signed NDA within 72 hours. 2 first-call requests. 1 site visit scheduled.',
    status: 'in_progress' as const,
  },
  {
    day: 'Day 45',
    title: 'LOI received',
    description: 'Lone Star Capital Partners (Houston family office) submits non-binding LOI at $9.2M.',
    status: 'pending' as const,
  },
  {
    day: 'Day 60–90',
    title: 'Diligence + close',
    description: 'Data room shared, financial + ops + legal diligence runs in parallel. Target close: Day 90.',
    status: 'pending' as const,
  },
]

const STATUS_STYLES = {
  complete: { dot: '#2ECC8B', text: '#2ECC8B', label: '✓ Complete' },
  in_progress: { dot: '#C9A84C', text: '#C9A84C', label: 'In Progress' },
  pending: { dot: 'rgba(255,255,255,0.25)', text: 'rgba(242,238,231,0.4)', label: 'Pending' },
}

export default function PipelineTimelineMockup() {
  return (
    <div
      style={{
        background: 'linear-gradient(180deg, #0B1B3E 0%, #0F2347 100%)',
        border: '1px solid rgba(201,168,76,0.22)',
        borderRadius: '16px',
        padding: '32px',
        fontFamily: "'DM Sans', system-ui, sans-serif",
        color: '#F2EEE7',
        boxShadow: '0 30px 80px -20px rgba(0,0,0,0.55)',
        maxWidth: '560px',
        margin: '0 auto',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '18px', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <div
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: '10px',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: '#C9A84C',
              marginBottom: '4px',
            }}
          >
            Live Deal Timeline · Sample
          </div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', fontWeight: 700, color: '#F2EEE7', lineHeight: 1.1 }}>
            TX Oasis Landscaping
          </div>
          <div style={{ fontSize: '11.5px', color: 'rgba(242,238,231,0.55)', marginTop: '2px', fontFamily: "'DM Mono', monospace", letterSpacing: '0.08em' }}>
            DFW · Austin · $9.5M ask
          </div>
        </div>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(201,168,76,0.10)',
            border: '1px solid rgba(201,168,76,0.30)',
            borderRadius: '999px',
            padding: '4px 10px',
            fontSize: '10px',
            fontFamily: "'DM Mono', monospace",
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: '#C9A84C',
          }}
        >
          <span style={{ width: '5px', height: '5px', background: '#C9A84C', borderRadius: '50%', animation: 'pulse 2s ease-in-out infinite' }} />
          Day 24 · Active Outreach
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '10px', fontFamily: "'DM Mono', monospace", letterSpacing: '0.1em', color: 'rgba(242,238,231,0.55)' }}>
          <span>Onboarding</span>
          <span>Active</span>
          <span>Matched</span>
          <span>LOI</span>
          <span>DD</span>
          <span>Closed</span>
        </div>
        <div style={{ position: 'relative', height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              height: '100%',
              width: '50%',
              background: 'linear-gradient(90deg, #2ECC8B, #C9A84C)',
              borderRadius: '4px',
            }}
          />
        </div>
      </div>

      {/* Timeline */}
      <div style={{ position: 'relative' }}>
        {/* Vertical line */}
        <div
          style={{
            position: 'absolute',
            left: '14px',
            top: '6px',
            bottom: '6px',
            width: '2px',
            background: 'linear-gradient(180deg, #2ECC8B 0%, #2ECC8B 50%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.1) 100%)',
          }}
        />

        {TIMELINE.map((step, i) => {
          const s = STATUS_STYLES[step.status]
          return (
            <div key={i} style={{ display: 'flex', gap: '14px', marginBottom: i === TIMELINE.length - 1 ? 0 : '16px', position: 'relative' }}>
              <div
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  background: '#0B1B3E',
                  border: `2px solid ${s.dot}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  zIndex: 1,
                  boxShadow: step.status === 'in_progress' ? '0 0 12px rgba(201,168,76,0.5)' : 'none',
                }}
              >
                {step.status === 'complete' && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#2ECC8B" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
                {step.status === 'in_progress' && (
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#C9A84C', animation: 'pulse 1.5s ease-in-out infinite' }} />
                )}
              </div>
              <div style={{ flex: 1, paddingTop: '2px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '3px', gap: '8px' }}>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '15.5px', color: '#F2EEE7', fontWeight: 600, lineHeight: 1.2 }}>
                    {step.title}
                  </div>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '10px', letterSpacing: '0.12em', color: s.text, whiteSpace: 'nowrap' }}>
                    {step.day}
                  </div>
                </div>
                <div style={{ fontSize: '12.5px', color: 'rgba(242,238,231,0.7)', lineHeight: 1.5 }}>
                  {step.description}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer KPIs */}
      <div
        style={{
          marginTop: '20px',
          padding: '14px 16px',
          background: 'rgba(46,204,139,0.06)',
          border: '1px solid rgba(46,204,139,0.22)',
          borderRadius: '10px',
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '10px',
        }}
      >
        {[
          { l: 'Active days', v: '24' },
          { l: 'NDAs signed', v: '4' },
          { l: 'Matched buyers', v: '9' },
          { l: 'Days to close', v: '~60' },
        ].map((k, i) => (
          <div key={i} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '8.5px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(242,238,231,0.55)', fontFamily: "'DM Mono', monospace", marginBottom: '2px' }}>
              {k.l}
            </div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: '#2ECC8B', fontFamily: "'Playfair Display', serif", lineHeight: 1 }}>
              {k.v}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
