// Shared placeholder for dashboard surfaces that are wired in the nav
// but not yet built. Lets the Wagner Loom show the full platform shape
// without 404s on unbuilt routes.

type Bullet = { title: string; desc: string }

export default function ComingSoon({
  title,
  eyebrow,
  description,
  bullets,
  eta,
}: {
  title: string
  eyebrow: string
  description: string
  bullets: Bullet[]
  eta?: string
}) {
  return (
    <div style={{
      padding: '48px 56px 80px', maxWidth: 1100, margin: '0 auto',
      fontFamily: "'Inter', 'DM Sans', system-ui, sans-serif",
      color: 'var(--kb-text)',
    }}>
      {/* Eyebrow */}
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        padding: '6px 14px', borderRadius: 999,
        background: 'rgba(46,117,182,0.10)', border: '1px solid rgba(46,117,182,0.25)',
        fontFamily: "'JetBrains Mono', monospace", fontSize: 11,
        letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 700,
        color: 'var(--kb-accent)', marginBottom: 22,
      }}>
        <span style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--kb-accent)' }} />
        {eyebrow}
      </div>

      {/* Title */}
      <h1 style={{
        fontFamily: 'Georgia, "Playfair Display", serif',
        fontSize: 'clamp(36px, 4.5vw, 52px)', fontWeight: 700,
        letterSpacing: '-0.02em', lineHeight: 1.1, margin: '0 0 16px',
        color: 'var(--kb-text)',
      }}>
        {title}
      </h1>

      {/* Description */}
      <p style={{
        fontSize: 19, lineHeight: 1.55, maxWidth: 760,
        color: 'var(--kb-text-secondary)', margin: '0 0 36px',
      }}>
        {description}
      </p>

      {/* Status badge */}
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 10,
        padding: '10px 18px', borderRadius: 10,
        background: 'rgba(201,168,76,0.10)', border: '1px solid rgba(201,168,76,0.30)',
        marginBottom: 40,
      }}>
        <span style={{
          fontFamily: "'JetBrains Mono', monospace", fontSize: 11,
          letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 700,
          color: '#C9A84C',
        }}>
          ⏳ In Development
        </span>
        {eta && (
          <span style={{ fontSize: 13, color: 'var(--kb-text-secondary)' }}>
            · ETA {eta}
          </span>
        )}
      </div>

      {/* Bullets — what the page will do */}
      <div style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid var(--kb-border)', borderRadius: 14,
        padding: '32px 36px', maxWidth: 880,
      }}>
        <div style={{
          fontFamily: "'JetBrains Mono', monospace", fontSize: 11,
          letterSpacing: '0.20em', textTransform: 'uppercase', fontWeight: 700,
          color: 'var(--kb-accent)', marginBottom: 22,
        }}>
          What this surface will do
        </div>
        <div style={{ display: 'grid', gap: 22 }}>
          {bullets.map((b, i) => (
            <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              <div style={{
                flexShrink: 0, width: 28, height: 28, borderRadius: 7,
                background: 'rgba(46,117,182,0.15)', border: '1px solid rgba(46,117,182,0.30)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: 700,
                color: 'var(--kb-accent)',
              }}>
                {String(i + 1).padStart(2, '0')}
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--kb-text)', marginBottom: 4 }}>
                  {b.title}
                </div>
                <div style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--kb-text-secondary)' }}>
                  {b.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Demo footer */}
      <div style={{
        marginTop: 40, padding: '20px 24px',
        background: 'rgba(46,117,182,0.05)', border: '1px dashed rgba(46,117,182,0.25)',
        borderRadius: 10, fontSize: 13, lineHeight: 1.6,
        color: 'var(--kb-text-secondary)',
      }}>
        <strong style={{ color: 'var(--kb-accent)' }}>Demo view:</strong> This surface is wired in the nav and the schema is in place. Implementation kicks off once Wagner signs the partnership term sheet.
      </div>
    </div>
  )
}
