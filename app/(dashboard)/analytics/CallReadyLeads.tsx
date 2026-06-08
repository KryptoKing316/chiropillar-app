'use client'

// Call-ready leads, by city. City tabs across the top; the active city shows every
// ranked clinic in a clean, dial-from-this table (rank, name, rating, reviews, focus,
// site). Sits below the command-center console on the Virginia Map page.
import { useState } from 'react'
import { VA_CHIROS, type VAChiro } from './vaChiros'

type Tier = 'primary' | 'test2' | 'scale' | 'tail'
const TIER: Record<Tier, { label: string; color: string }> = {
  primary: { label: 'Primary test', color: '#C9A84C' },
  test2: { label: 'Test city #2', color: '#2E75B6' },
  scale: { label: 'Scale', color: '#7FB0E8' },
  tail: { label: 'Long tail', color: '#8893ad' },
}
const ORDER: Record<Tier, number> = { primary: 0, test2: 1, scale: 2, tail: 3 }

function tierOf(city: string): Tier {
  const c = city.toLowerCase()
  if (c.includes('charlottesville')) return 'primary'
  if (c.includes('richmond') || c.includes('virginia beach')) return 'test2'
  if (c.includes('williamsburg') || c.includes('waynesboro') || c.includes('staunton') || c.includes('orange')) return 'tail'
  return 'scale'
}
const isChain = (x: VAChiro) => /chain|franchise/i.test(x.dominantSignal) || /the joint/i.test(x.name)
const cityShort = (s: string) => s.replace(/, Virginia$/i, '')

const C = {
  text: 'var(--kb-text)', muted: 'var(--kb-text-secondary)', faint: 'var(--kb-text-muted)',
  bg2: 'var(--kb-bg-panel)', bg3: 'var(--kb-bg-surface)', border: 'var(--kb-border)',
  gold: '#C9A84C', goldLight: '#E8C96A',
}
const F = { display: "'Playfair Display', Georgia, serif", body: "'Inter', system-ui, sans-serif", mono: "'JetBrains Mono', monospace" }

export default function CallReadyLeads() {
  const cities = [...VA_CHIROS].sort((a, b) => {
    const ta = tierOf(a.city), tb = tierOf(b.city)
    if (ORDER[ta] !== ORDER[tb]) return ORDER[ta] - ORDER[tb]
    return b.chiropractors.length - a.chiropractors.length
  })
  const [active, setActive] = useState(0)
  const city = cities[active]
  const tier = tierOf(city.city)
  const col = TIER[tier].color
  const no1 = city.chiropractors.find(x => !isChain(x))

  const cell: React.CSSProperties = { padding: '9px 12px', borderBottom: `1px solid ${C.border}`, fontSize: 13, color: C.muted, verticalAlign: 'top' }
  const head: React.CSSProperties = { padding: '9px 12px', textAlign: 'left', fontFamily: F.mono, fontSize: 9.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.faint, borderBottom: `1px solid ${C.border}` }

  return (
    <div style={{ padding: '34px 32px 80px', maxWidth: 1180, margin: '0 auto', fontFamily: F.body, color: C.text }}>
      <div style={{ fontFamily: F.mono, fontSize: 11, color: C.gold, letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 800, marginBottom: 8 }}>
        Call-ready leads · by city
      </div>
      <h2 style={{ fontFamily: F.display, fontSize: 'clamp(22px,3vw,32px)', fontWeight: 700, margin: '0 0 6px', letterSpacing: '-0.01em' }}>
        Every ranked clinic, ready to work.
      </h2>
      <p style={{ fontSize: 14, color: C.muted, margin: '0 0 18px', maxWidth: 760, lineHeight: 1.55 }}>
        Pick a city tab and work the list top-down — the <strong style={{ color: C.gold }}>★ top recruit</strong> is the dominant independent; national <span style={{ color: C.faint }}>chains</span> are flagged so you skip them. Verify on Google before you dial.
      </p>

      {/* CITY TABS */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8, marginBottom: 16, borderBottom: `1px solid ${C.border}` }}>
        {cities.map((c, i) => {
          const t = tierOf(c.city); const cc = TIER[t].color; const on = i === active
          return (
            <button key={c.city} onClick={() => setActive(i)} style={{
              flex: 'none', cursor: 'pointer', fontFamily: F.body, display: 'flex', alignItems: 'center', gap: 7,
              background: on ? C.bg3 : 'transparent', color: on ? C.text : C.muted,
              border: `1px solid ${on ? cc : C.border}`, borderRadius: 9, padding: '8px 13px', transition: '.12s',
            }}>
              <span style={{ width: 9, height: 9, borderRadius: '50%', background: cc, flex: 'none' }} />
              <span style={{ fontSize: 13, fontWeight: on ? 700 : 500 }}>{cityShort(c.city)}</span>
              <span style={{ fontFamily: F.mono, fontSize: 10.5, color: C.faint }}>{c.chiropractors.length}</span>
            </button>
          )
        })}
      </div>

      {/* ACTIVE CITY */}
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 10 }}>
        <div>
          <span style={{ fontFamily: F.display, fontSize: 24, fontWeight: 700 }}>{cityShort(city.city)}</span>
          <span style={{ marginLeft: 12, fontFamily: F.mono, fontSize: 10, letterSpacing: '0.12em', color: col, fontWeight: 800, padding: '3px 9px', borderRadius: 999, border: `1px solid ${col}55`, background: `${col}14`, textTransform: 'uppercase' }}>{TIER[tier].label}</span>
        </div>
        <span style={{ fontFamily: F.mono, fontSize: 12, color: C.faint }}>{city.chiropractors.length} clinics ranked</span>
      </div>

      {no1 && (
        <div style={{ background: `${C.gold}10`, border: `1px solid ${C.gold}30`, borderRadius: 10, padding: '10px 14px', marginBottom: 14, fontSize: 13, color: '#FFFFFF', lineHeight: 1.5 }}>
          <span style={{ fontFamily: F.mono, fontSize: 10, letterSpacing: '0.14em', color: C.gold, fontWeight: 800 }}>★ TOP RECRUIT — </span>
          <strong>{no1.name}</strong> ({no1.rating}★ · {no1.reviews} reviews){no1.website ? <> · <a href={no1.website} target="_blank" rel="noopener noreferrer" style={{ color: C.goldLight }}>open site →</a></> : null}
        </div>
      )}

      <table style={{ width: '100%', borderCollapse: 'collapse', background: C.bg2, borderRadius: 12, overflow: 'hidden' }}>
        <thead><tr>
          <th style={{ ...head, width: 30 }}>#</th><th style={head}>Clinic</th>
          <th style={{ ...head, width: 64 }}>Rating</th><th style={{ ...head, width: 60 }}>Reviews</th>
          <th style={head}>Focus</th><th style={{ ...head, width: 60 }}>Site</th>
        </tr></thead>
        <tbody>
          {city.chiropractors.map((x, i) => {
            const chain = isChain(x); const top = no1 && x.name === no1.name
            return (
              <tr key={i} style={{ background: top ? `${C.gold}0c` : 'transparent' }}>
                <td style={{ ...cell, color: C.faint, fontFamily: F.mono }}>{i + 1}</td>
                <td style={{ ...cell, color: C.text, fontWeight: 600 }}>
                  {x.name}
                  {top && <span style={{ marginLeft: 8, fontFamily: F.mono, fontSize: 8.5, letterSpacing: '0.1em', color: C.gold, fontWeight: 800, padding: '2px 6px', borderRadius: 4, background: `${C.gold}1c` }}>TARGET</span>}
                  {chain && <span style={{ marginLeft: 8, fontFamily: F.mono, fontSize: 8.5, letterSpacing: '0.1em', color: C.faint, fontWeight: 700, padding: '2px 6px', borderRadius: 4, border: `1px solid ${C.border}` }}>CHAIN</span>}
                  {x.area && <div style={{ fontSize: 11, color: C.faint, marginTop: 2 }}>{x.area}</div>}
                </td>
                <td style={{ ...cell }}><span style={{ color: C.gold, fontWeight: 700 }}>{x.rating ? x.rating.toFixed(1) : '—'}<span style={{ fontSize: 10 }}> ★</span></span></td>
                <td style={{ ...cell, fontFamily: F.mono, color: C.muted }}>{x.reviews || '—'}</td>
                <td style={{ ...cell, fontSize: 12.5 }}>{x.focus}</td>
                <td style={cell}>{x.website ? <a href={x.website} target="_blank" rel="noopener noreferrer" style={{ color: C.goldLight, fontFamily: F.mono, fontSize: 11 }}>open →</a> : <span style={{ color: C.faint }}>—</span>}</td>
              </tr>
            )
          })}
        </tbody>
      </table>

      <div style={{ fontSize: 11, color: C.faint, marginTop: 12, lineHeight: 1.5 }}>
        Researched/estimated Google data (2026), ranked by rating × review-volume — <strong style={{ color: C.muted }}>verify each on Google before outreach.</strong>
      </div>
    </div>
  )
}
