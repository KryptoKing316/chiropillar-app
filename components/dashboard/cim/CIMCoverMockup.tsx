'use client'

// ---------------------------------------------------------------------------
// CIMCoverMockup — Pitch-deck-quality CIM cover for TX Oasis Landscaping
// ---------------------------------------------------------------------------
// Modeled on the structure of real CIMs (reference: FL Cuttings CIM in
// python/example_cims/). Real CIM covers lead with:
//   1. "Available for Acquisition" / "Offering Memorandum" / "Confidential"
//   2. Company name + address
//   3. Year established + headline operational stats
//   4. Broker contact info at the bottom
//
// This mockup adapts that structure but adds a hero stock photo of a
// commercial-quality manicured lawn so it visually screams "landscape
// business" at first glance.
//
// Photo: "Luxury estate with manicured lawn and modern architectural design"
// Pexels #8143668 — free for commercial use, no attribution required
// ---------------------------------------------------------------------------

const HERO_PHOTO_URL =
  'https://images.pexels.com/photos/8143668/pexels-photo-8143668.jpeg?auto=compress&cs=tinysrgb&w=1200'

export default function CIMCoverMockup() {
  return (
    <div
      style={{
        position: 'relative',
        aspectRatio: '8.5 / 11',
        maxWidth: '480px',
        margin: '0 auto',
        background: '#0B1B3E',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow:
          '0 30px 80px -20px rgba(0,0,0,0.6), 0 0 0 1px rgba(201,168,76,0.18), inset 0 1px 0 rgba(255,255,255,0.04)',
        fontFamily: "'DM Sans', system-ui, sans-serif",
        color: '#F2EEE7',
      }}
    >
      {/* ── HERO PHOTO (full top 58%) ── */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '58%',
          backgroundImage: `url('${HERO_PHOTO_URL}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundColor: '#1a2f1a',
        }}
      />

      {/* Subtle navy tint over photo for KB brand cohesion (light) */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '58%',
          background:
            'linear-gradient(180deg, rgba(11,27,62,0.20) 0%, rgba(11,27,62,0.05) 30%, rgba(11,27,62,0.10) 60%, rgba(11,27,62,0.85) 95%, #0B1B3E 100%)',
        }}
      />

      {/* ── TOP BAR: Confidential + Doc # ── */}
      <div
        style={{
          position: 'relative',
          padding: '14px 22px 0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 2,
        }}
      >
        <div
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: '9px',
            letterSpacing: '0.28em',
            textTransform: 'uppercase',
            color: '#FFFFFF',
            background: 'rgba(11,27,62,0.85)',
            padding: '5px 10px',
            borderRadius: '4px',
            border: '1px solid rgba(255,214,110,0.4)',
            backdropFilter: 'blur(6px)',
          }}
        >
          <span
            style={{
              display: 'inline-block',
              width: '5px',
              height: '5px',
              background: '#E84949',
              borderRadius: '50%',
              marginRight: '7px',
              verticalAlign: 'middle',
              boxShadow: '0 0 8px rgba(232,73,73,0.8)',
            }}
          />
          Strictly Confidential
        </div>
        <div
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: '8.5px',
            color: '#FFFFFF',
            background: 'rgba(11,27,62,0.85)',
            padding: '5px 10px',
            borderRadius: '4px',
            border: '1px solid rgba(255,255,255,0.15)',
            letterSpacing: '0.15em',
            backdropFilter: 'blur(6px)',
          }}
        >
          KB-2026-04
        </div>
      </div>

      {/* ── REAL-CIM HEADER (over photo) ── */}
      <div
        style={{
          position: 'relative',
          padding: '16px 28px 0',
          textAlign: 'center',
          zIndex: 2,
        }}
      >
        <div
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: '10px',
            letterSpacing: '0.32em',
            textTransform: 'uppercase',
            color: '#FFD66E',
            textShadow: '0 2px 8px rgba(0,0,0,0.7)',
            marginBottom: '4px',
          }}
        >
          Available for Acquisition
        </div>
        <div
          style={{
            fontFamily: "'Playfair Display', serif",
            fontStyle: 'italic',
            fontSize: '13px',
            color: '#F2EEE7',
            textShadow: '0 2px 8px rgba(0,0,0,0.8)',
            letterSpacing: '0.04em',
          }}
        >
          Confidential Information Memorandum
        </div>
      </div>

      {/* ── COMPANY NAME (sits in photo→navy transition) ── */}
      <div
        style={{
          position: 'absolute',
          top: '40%',
          left: 0,
          right: 0,
          padding: '0 28px',
          textAlign: 'center',
          zIndex: 3,
        }}
      >
        <h1
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: '44px',
            fontWeight: 700,
            color: '#F2EEE7',
            margin: 0,
            lineHeight: 1.0,
            letterSpacing: '-0.015em',
            textShadow: '0 4px 18px rgba(0,0,0,0.7)',
          }}
        >
          TX Oasis
        </h1>
        <h1
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: '44px',
            fontWeight: 700,
            color: '#FFD66E',
            margin: 0,
            lineHeight: 1.0,
            letterSpacing: '-0.015em',
            fontStyle: 'italic',
            textShadow: '0 4px 18px rgba(0,0,0,0.7)',
          }}
        >
          Landscaping
        </h1>

        <div
          style={{
            marginTop: '14px',
            fontSize: '10.5px',
            fontFamily: "'DM Mono', monospace",
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: '#FFFFFF',
            textShadow: '0 2px 8px rgba(0,0,0,0.7)',
            opacity: 0.95,
          }}
        >
          Commercial &amp; Residential Landscape Services
        </div>
      </div>

      {/* ── ADDRESS / EST. (just below company name on navy) ── */}
      <div
        style={{
          position: 'absolute',
          top: '63%',
          left: 0,
          right: 0,
          padding: '0 28px',
          textAlign: 'center',
          zIndex: 2,
        }}
      >
        <div
          style={{
            display: 'inline-block',
            padding: '0 14px',
            fontFamily: "'DM Mono', monospace",
            fontSize: '10px',
            letterSpacing: '0.15em',
            color: 'rgba(201,168,76,0.95)',
            position: 'relative',
          }}
        >
          <span
            style={{
              display: 'inline-block',
              width: '24px',
              height: '1px',
              background: 'rgba(201,168,76,0.5)',
              marginRight: '12px',
              verticalAlign: 'middle',
            }}
          />
          DFW · Austin · San Antonio · Est. 2009
          <span
            style={{
              display: 'inline-block',
              width: '24px',
              height: '1px',
              background: 'rgba(201,168,76,0.5)',
              marginLeft: '12px',
              verticalAlign: 'middle',
            }}
          />
        </div>
      </div>

      {/* ── KEY METRICS (4 tiles in a row) ── */}
      <div
        style={{
          position: 'absolute',
          top: '70%',
          left: 0,
          right: 0,
          padding: '0 22px',
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '6px',
        }}
      >
        {[
          { l: 'TTM Rev', v: '$8.4M' },
          { l: 'EBITDA', v: '$1.8M' },
          { l: 'Ask', v: '$9.5M' },
          { l: 'Mult', v: '5.3×' },
        ].map((m, i) => (
          <div
            key={i}
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(201,168,76,0.22)',
              borderRadius: '6px',
              padding: '7px 8px',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontSize: '8px',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'rgba(242,238,231,0.55)',
                fontFamily: "'DM Mono', monospace",
                marginBottom: '1px',
              }}
            >
              {m.l}
            </div>
            <div
              style={{
                fontSize: '14.5px',
                fontWeight: 700,
                color: '#C9A84C',
                fontFamily: "'Playfair Display', serif",
                lineHeight: 1.05,
              }}
            >
              {m.v}
            </div>
          </div>
        ))}
      </div>

      {/* ── PREPARED BY (broker block, like real CIMs) ── */}
      <div
        style={{
          position: 'absolute',
          bottom: '50px',
          left: 0,
          right: 0,
          padding: '0 28px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontSize: '9px',
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: 'rgba(242,238,231,0.45)',
            fontFamily: "'DM Mono', monospace",
            marginBottom: '5px',
          }}
        >
          Prepared By
        </div>
        <div
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: '14px',
            color: '#F2EEE7',
            letterSpacing: '0.02em',
          }}
        >
          Kingdom Broker Inc.
        </div>
        <div
          style={{
            fontSize: '9px',
            fontFamily: "'DM Mono', monospace",
            color: 'rgba(201,168,76,0.75)',
            letterSpacing: '0.1em',
            marginTop: '2px',
          }}
        >
          Eric Skeldon &middot; Plano, TX &middot; KingdomBroker.com
        </div>
      </div>

      {/* ── BOTTOM CONFIDENTIAL FOOTER STRIP ── */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          padding: '11px 22px',
          borderTop: '1px solid rgba(201,168,76,0.25)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          fontFamily: "'DM Mono', monospace",
          fontSize: '7.5px',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: 'rgba(242,238,231,0.55)',
          background: 'rgba(5,13,32,0.85)',
        }}
      >
        Property of Kingdom Broker &middot; NDA Required &middot; Do Not Distribute
      </div>
    </div>
  )
}
