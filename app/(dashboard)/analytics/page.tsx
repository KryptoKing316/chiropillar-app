// ProMed VA · Virginia Map
// Top-rated chiropractors in Dr. Wagner's target cities — the recruiting map.
// Data: app/(dashboard)/analytics/vaChiros.ts (researched, verify before outreach).

import { VA_CHIROS, type VACity, type VAChiro } from './vaChiros'
import VirginiaTerrainMap from './VirginiaTerrainMap'

export const dynamic = 'force-dynamic'

const C = {
  bg: 'var(--kb-bg)', bg2: 'var(--kb-bg-panel)', bg3: 'var(--kb-bg-surface)',
  text: 'var(--kb-text)', muted: 'var(--kb-text-secondary)', faint: 'var(--kb-text-muted)',
  border: 'var(--kb-border)',
  spine: '#1F4E79', align: '#2E75B6', globe: '#9CC4E4', gold: '#C9A84C', goldLight: '#E8C96A', green: '#2ECC8B', coral: '#F2B0A0',
}
const F = {
  display: "'Playfair Display', Georgia, serif",
  body: "'Inter', system-ui, sans-serif",
  mono: "'JetBrains Mono', 'DM Mono', monospace",
}

function tierOf(city: string): { label: string; color: string } {
  const c = city.toLowerCase()
  if (c.includes('charlottesville')) return { label: 'PRIMARY TEST CITY', color: C.gold }
  if (c.includes('richmond') || c.includes('virginia beach')) return { label: 'TEST CITY #2 · CANDIDATE', color: C.align }
  if (c.includes('fairfax') || c.includes('fredericksburg') || c.includes('harrisonburg') || c.includes('lynchburg') || c.includes('roanoke')) return { label: 'SCALE', color: C.globe }
  return { label: 'LONG TAIL', color: C.faint }
}

const isChain = (x: VAChiro) => /chain|franchise/i.test(x.dominantSignal) || /the joint/i.test(x.name)
const topPickIndex = (list: VAChiro[]) => { const i = list.findIndex(x => !isChain(x)); return i < 0 ? 0 : i }
const cityShort = (s: string) => s.replace(/, Virginia$/i, '')

function Stars({ r }: { r: number }) {
  return <span style={{ color: C.gold, fontWeight: 700 }}>{r ? r.toFixed(1) : '—'}<span style={{ fontSize: 11 }}> ★</span></span>
}

const cell: React.CSSProperties = { padding: '8px 10px', borderBottom: `1px solid ${C.border}`, fontSize: 13, color: C.muted, verticalAlign: 'top' }
const cellHead: React.CSSProperties = { padding: '8px 10px', textAlign: 'left', fontFamily: F.mono, fontSize: 9.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.faint, borderBottom: `1px solid ${C.border}` }

function CityCard({ c }: { c: VACity }) {
  const t = tierOf(c.city)
  const pick = topPickIndex(c.chiropractors)
  const top = c.chiropractors[pick]
  return (
    <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderTop: `3px solid ${t.color}`, borderRadius: 14, overflow: 'hidden', marginBottom: 20, boxShadow: '0 4px 16px rgba(0,0,0,0.12)' }}>
      <div style={{ padding: '18px 22px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <span style={{ fontFamily: F.display, fontSize: 22, fontWeight: 700, color: C.text }}>{cityShort(c.city)}</span>
          <span style={{ marginLeft: 12, fontFamily: F.mono, fontSize: 10, letterSpacing: '0.12em', color: t.color, fontWeight: 800, padding: '3px 9px', borderRadius: 999, border: `1px solid ${t.color}55`, background: `${t.color}14` }}>{t.label}</span>
        </div>
        <span style={{ fontSize: 12.5, color: C.faint, fontFamily: F.mono }}>{c.chiropractors.length} clinics ranked</span>
      </div>

      {top && (
        <div style={{ padding: '12px 22px', background: `${C.gold}10`, borderBottom: `1px solid ${C.border}`, fontSize: 13, color: '#FFFFFF', lineHeight: 1.5 }}>
          <span style={{ fontFamily: F.mono, fontSize: 10, letterSpacing: '0.14em', color: C.gold, fontWeight: 800 }}>★ TOP RECRUIT — </span>
          <strong style={{ color: C.text }}>{top.name}</strong> ({top.rating ? top.rating.toFixed(1) : '—'}★ · {top.reviews} reviews). <span style={{ color: C.muted }}>{top.dominantSignal}</span>
        </div>
      )}

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead><tr><th style={{ ...cellHead, width: 26 }}>#</th><th style={cellHead}>Clinic</th><th style={{ ...cellHead, width: 70 }}>Rating</th><th style={{ ...cellHead, width: 64 }}>Reviews</th><th style={cellHead}>Focus</th></tr></thead>
        <tbody>
          {c.chiropractors.map((x, i) => {
            const chain = isChain(x)
            const isTop = i === pick
            return (
              <tr key={i} style={{ background: isTop ? `${C.gold}0c` : 'transparent' }}>
                <td style={{ ...cell, color: C.faint, fontFamily: F.mono }}>{i + 1}</td>
                <td style={{ ...cell, color: C.text, fontWeight: 600 }}>
                  {x.website ? <a href={x.website} target="_blank" rel="noopener noreferrer" style={{ color: isTop ? C.gold : C.text, textDecoration: 'none' }}>{x.name}</a> : x.name}
                  {isTop && <span style={{ marginLeft: 8, fontFamily: F.mono, fontSize: 8.5, letterSpacing: '0.1em', color: C.gold, fontWeight: 800, padding: '2px 6px', borderRadius: 4, background: `${C.gold}1c` }}>TARGET</span>}
                  {chain && <span style={{ marginLeft: 8, fontFamily: F.mono, fontSize: 8.5, letterSpacing: '0.1em', color: C.faint, fontWeight: 700, padding: '2px 6px', borderRadius: 4, border: `1px solid ${C.border}` }}>CHAIN</span>}
                  {x.area && <div style={{ fontSize: 11, color: C.faint, marginTop: 2 }}>{x.area}</div>}
                </td>
                <td style={cell}><Stars r={x.rating} /></td>
                <td style={{ ...cell, fontFamily: F.mono, color: C.muted }}>{x.reviews || '—'}</td>
                <td style={{ ...cell, fontSize: 12.5 }}>{x.focus}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default function VirginiaMapPage() {
  const totalClinics = VA_CHIROS.reduce((s, c) => s + c.chiropractors.length, 0)
  // order: test cities first (Charlottesville, Richmond, VA Beach), then rest as given
  const order = (c: VACity) => {
    const n = c.city.toLowerCase()
    if (n.includes('charlottesville')) return 0
    if (n.includes('richmond')) return 1
    if (n.includes('virginia beach')) return 2
    return 5
  }
  const cities = [...VA_CHIROS].sort((a, b) => order(a) - order(b))

  return (
    <div style={{ padding: '32px 32px 80px', maxWidth: 1180, margin: '0 auto', fontFamily: F.body, color: C.text }}>
      {/* HEADER */}
      <div style={{ marginBottom: 22 }}>
        <div style={{ fontFamily: F.mono, fontSize: 11, color: C.gold, letterSpacing: '0.22em', textTransform: 'uppercase', fontWeight: 800, marginBottom: 10 }}>
          Virginia Map · Recruiting Targets
        </div>
        <h1 style={{ fontFamily: F.display, fontSize: 'clamp(30px, 4vw, 44px)', fontWeight: 700, margin: '0 0 10px', letterSpacing: '-0.02em' }}>
          The top-rated chiropractors in each Virginia city.
        </h1>
        <p style={{ fontSize: 15.5, color: '#FFFFFF', margin: 0, maxWidth: 820, lineHeight: 1.6, opacity: 0.9 }}>
          One dominant partner per city. Start with <strong style={{ color: C.gold }}>Charlottesville</strong> (Dr. Wagner&apos;s warm network) + one metro. The <strong style={{ color: C.gold }}>★ top recruit</strong> per city is the highest-rated, highest-volume <em>independent</em> (national chains like The Joint are flagged and skipped as partners).
        </p>
      </div>

      {/* INTERACTIVE TERRAIN MAP */}
      <VirginiaTerrainMap />

      {/* SUMMARY STRIP */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 22 }}>
        {[['11', 'VA cities mapped'], [String(totalClinics), 'clinics ranked'], ['Charlottesville', 'primary test city'], ['Richmond / VA Beach', 'test city #2']].map(([n, l]) => (
          <div key={l} style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 10, padding: '14px 16px' }}>
            <div style={{ fontFamily: F.display, fontSize: 19, color: C.goldLight, fontWeight: 800, lineHeight: 1.1 }}>{n}</div>
            <div style={{ fontSize: 11.5, color: C.faint, marginTop: 5 }}>{l}</div>
          </div>
        ))}
      </div>

      <div style={{ background: `${C.align}12`, border: `1px solid ${C.align}33`, borderRadius: 10, padding: '12px 16px', marginBottom: 24, fontSize: 12.5, color: '#FFFFFF', lineHeight: 1.55 }}>
        <strong style={{ color: C.globe }}>Note:</strong> ratings &amp; review counts are from web research (2026) and ranked by rating × review volume — <strong>verify on Google before outreach.</strong> Some figures are best estimates where Google data wasn&apos;t separately confirmed.
      </div>

      {cities.map((c, i) => <CityCard key={i} c={c} />)}
    </div>
  )
}
