'use client'

// ---------------------------------------------------------------------------
// BuyerMatchPreview — pitch-deck-style sample matched-buyer card
// Used on /buyers as a hero/empty-state preview showing the kind of buyer
// matches the KB Engine produces. Demo buyer: "Lone Star Capital Partners"
// matched to TX Oasis Landscaping at fit score 94.
// Real stock photo: Pexels (free commercial license).
// ---------------------------------------------------------------------------

const BUYER_PHOTO_URL =
  'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=800'

export default function BuyerMatchPreview() {
  return (
    <div
      style={{
        maxWidth: '520px',
        margin: '0 auto',
        background: 'linear-gradient(180deg, #0B1B3E 0%, #0F2347 100%)',
        border: '1px solid rgba(201,168,76,0.25)',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow:
          '0 30px 80px -20px rgba(0,0,0,0.55), 0 0 0 1px rgba(201,168,76,0.1)',
        fontFamily: "'DM Sans', system-ui, sans-serif",
        color: '#F2EEE7',
      }}
    >
      {/* ── Header band with firm photo ── */}
      <div
        style={{
          position: 'relative',
          height: '120px',
          backgroundImage: `url('${BUYER_PHOTO_URL}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(135deg, rgba(11,27,62,0.85) 0%, rgba(15,35,71,0.65) 100%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 14,
            left: 16,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            fontFamily: "'DM Mono', monospace",
            fontSize: '10px',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: '#FFD66E',
            textShadow: '0 1px 4px rgba(0,0,0,0.6)',
          }}
        >
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: '#2ECC8B',
              boxShadow: '0 0 8px rgba(46,204,139,0.6)',
            }}
          />
          High-Fit Match
        </div>
        <div
          style={{
            position: 'absolute',
            top: 14,
            right: 16,
            fontFamily: "'DM Mono', monospace",
            fontSize: '10px',
            color: 'rgba(255,255,255,0.8)',
            textShadow: '0 1px 4px rgba(0,0,0,0.6)',
          }}
        >
          Match · 2 days ago
        </div>
        {/* Firm name overlay */}
        <div
          style={{
            position: 'absolute',
            bottom: 14,
            left: 20,
            right: 20,
          }}
        >
          <div
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '22px',
              fontWeight: 700,
              color: '#F2EEE7',
              lineHeight: 1.05,
              textShadow: '0 2px 8px rgba(0,0,0,0.7)',
            }}
          >
            Lone Star Capital Partners
          </div>
          <div
            style={{
              marginTop: '3px',
              fontSize: '11px',
              fontFamily: "'DM Mono', monospace",
              letterSpacing: '0.12em',
              color: 'rgba(255,214,110,0.95)',
              textShadow: '0 1px 4px rgba(0,0,0,0.6)',
            }}
          >
            Family Office · Houston, TX · Est. 2014
          </div>
        </div>
      </div>

      {/* ── Score + Fit row ── */}
      <div
        style={{
          padding: '20px 22px 14px',
          display: 'grid',
          gridTemplateColumns: '78px 1fr',
          gap: '18px',
          alignItems: 'center',
        }}
      >
        {/* Fit score circle */}
        <div
          style={{
            width: '78px',
            height: '78px',
            borderRadius: '50%',
            border: '3px solid #2ECC8B',
            background: 'rgba(46,204,139,0.12)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            boxShadow: '0 0 18px rgba(46,204,139,0.25)',
          }}
        >
          <div
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '30px',
              fontWeight: 700,
              color: '#2ECC8B',
              lineHeight: 1,
            }}
          >
            94
          </div>
          <div
            style={{
              fontSize: '8px',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'rgba(46,204,139,0.85)',
              marginTop: '2px',
            }}
          >
            Fit Score
          </div>
        </div>

        <div>
          <div
            style={{
              fontSize: '10px',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: 'rgba(242,238,231,0.55)',
              fontFamily: "'DM Mono', monospace",
              marginBottom: '6px',
            }}
          >
            Investment Thesis Fit
          </div>
          <div
            style={{
              fontSize: '13.5px',
              color: 'rgba(242,238,231,0.92)',
              lineHeight: 1.55,
            }}
          >
            Active acquirer of TX-based recurring-revenue service businesses.
            <span style={{ color: '#C9A84C' }}> $5M–$15M check size</span>,
            preference for owner-operator transitions with multi-year backlog.
          </div>
        </div>
      </div>

      {/* ── Tag row ── */}
      <div
        style={{
          padding: '0 22px 16px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '6px',
        }}
      >
        {[
          { l: 'Geography ✓', tone: 'green' },
          { l: 'Check Size ✓', tone: 'green' },
          { l: 'Industry Thesis ✓', tone: 'green' },
          { l: 'Recurring Rev ✓', tone: 'green' },
          { l: 'SBA Eligible ✓', tone: 'gold' },
        ].map((t, i) => (
          <span
            key={i}
            style={{
              fontSize: '10.5px',
              padding: '4px 9px',
              borderRadius: '999px',
              background:
                t.tone === 'green'
                  ? 'rgba(46,204,139,0.12)'
                  : 'rgba(201,168,76,0.12)',
              border:
                t.tone === 'green'
                  ? '1px solid rgba(46,204,139,0.3)'
                  : '1px solid rgba(201,168,76,0.3)',
              color: t.tone === 'green' ? '#2ECC8B' : '#C9A84C',
              fontWeight: 600,
              letterSpacing: '0.02em',
            }}
          >
            {t.l}
          </span>
        ))}
      </div>

      {/* ── Stats grid ── */}
      <div
        style={{
          padding: '0 22px 16px',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '8px',
        }}
      >
        {[
          { l: 'AUM', v: '$280M' },
          { l: 'Deals Closed', v: '11' },
          { l: 'Avg Deal', v: '$9.2M' },
        ].map((s, i) => (
          <div
            key={i}
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '8px',
              padding: '8px 11px',
            }}
          >
            <div
              style={{
                fontSize: '8.5px',
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: 'rgba(242,238,231,0.55)',
                fontFamily: "'DM Mono', monospace",
                marginBottom: '2px',
              }}
            >
              {s.l}
            </div>
            <div
              style={{
                fontSize: '17px',
                fontWeight: 700,
                color: '#F2EEE7',
                fontFamily: "'Playfair Display', serif",
                lineHeight: 1.05,
              }}
            >
              {s.v}
            </div>
          </div>
        ))}
      </div>

      {/* ── Personalized pitch preview ── */}
      <div
        style={{
          margin: '0 22px 18px',
          padding: '14px 16px',
          background: 'rgba(201,168,76,0.06)',
          border: '1px solid rgba(201,168,76,0.18)',
          borderRadius: '10px',
        }}
      >
        <div
          style={{
            fontSize: '9.5px',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: '#C9A84C',
            fontFamily: "'DM Mono', monospace",
            marginBottom: '8px',
          }}
        >
          Personalized Pitch — Generated by KB Engine
        </div>
        <div
          style={{
            fontSize: '12px',
            color: 'rgba(242,238,231,0.7)',
            marginBottom: '6px',
            fontFamily: "'DM Mono', monospace",
          }}
        >
          Subject: <span style={{ color: '#F2EEE7' }}>TX Oasis Landscaping — Recurring contracts, owner-operator transition</span>
        </div>
        <div
          style={{
            fontSize: '12.5px',
            color: 'rgba(242,238,231,0.82)',
            lineHeight: 1.55,
            fontStyle: 'italic',
          }}
        >
          &ldquo;Reaching out re: a TX-based commercial landscape platform that fits Lone Star&rsquo;s thesis to a T. $8.4M TTM revenue, $1.8M normalized EBITDA, 240+ contracts, 3-year backlog. Owner ready to roll over 20% equity for second-bite&hellip;&rdquo;
        </div>
      </div>

      {/* ── Footer ── */}
      <div
        style={{
          padding: '10px 22px',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontFamily: "'DM Mono', monospace",
          fontSize: '9.5px',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: 'rgba(242,238,231,0.4)',
        }}
      >
        <span>Status: Pitch Drafted &middot; Awaiting Owner Approval</span>
        <span style={{ color: '#C9A84C' }}>View Full &rarr;</span>
      </div>
    </div>
  )
}
