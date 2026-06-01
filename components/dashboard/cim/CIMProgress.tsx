'use client'

const ROUNDS = [
  { n: 1, label: 'Business Identity' },
  { n: 2, label: 'Financials' },
  { n: 3, label: 'Operations' },
  { n: 4, label: 'Market Position' },
  { n: 5, label: 'Deal Structure' },
]

export default function CIMProgress({ currentRound, complete }: { currentRound: number; complete: boolean }) {
  return (
    <div style={{
      background: '#0D1F3C',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: '14px',
      padding: '18px 24px',
      marginBottom: '20px',
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: '14px',
      }}>
        <div style={{ fontSize: '13px', fontWeight: 600, color: '#C9A84C', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          CIM Build Progress
        </div>
        {complete && (
          <div style={{ background: 'rgba(46,204,139,0.12)', border: '1px solid rgba(46,204,139,0.3)', borderRadius: '20px', padding: '3px 12px', fontSize: '12px', fontWeight: 700, color: '#2ECC8B' }}>
            CIM Complete
          </div>
        )}
      </div>
      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
        {ROUNDS.map((r, i) => {
          const done = complete || r.n < currentRound
          const active = !complete && r.n === currentRound
          return (
            <div key={r.n} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{
                height: '4px', borderRadius: '2px',
                background: done || active
                  ? (done ? '#2ECC8B' : '#C9A84C')
                  : 'rgba(255,255,255,0.08)',
                transition: 'background 0.4s',
              }} />
              <div style={{
                fontSize: '10px',
                color: done ? '#2ECC8B' : active ? '#C9A84C' : '#4A5880',
                fontWeight: active ? 600 : 400,
                letterSpacing: '0.04em',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                transition: 'color 0.4s',
              }}>
                {done && !active ? '✓ ' : active ? `${r.n}. ` : `${r.n}. `}{r.label}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
