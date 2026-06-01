'use client'

// Diagonal watermark tiles over main content area only — no top banner overlap
export default function DemoWatermark() {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: '248px',
      right: 0,
      bottom: 0,
      zIndex: 998,
      pointerEvents: 'none',
      overflow: 'hidden',
    }}>
      {Array.from({ length: 40 }).map((_, i) => {
        const row = Math.floor(i / 5)
        const col = i % 5
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              top: `${row * 22 + (col % 2 === 0 ? 0 : 11)}%`,
              left: `${col * 22 - 5}%`,
              transform: 'rotate(-30deg)',
              fontSize: '11px',
              fontFamily: "'DM Mono', monospace",
              fontWeight: 600,
              letterSpacing: '0.1em',
              color: 'rgba(201,168,76,0.04)',
              whiteSpace: 'nowrap',
              userSelect: 'none',
            }}
          >
            DEMO — KingdomBroker.com
          </div>
        )
      })}
    </div>
  )
}
