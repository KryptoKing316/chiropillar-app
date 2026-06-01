'use client'

import { useEffect, useState } from 'react'

// ── BROKER ROSTER ─────────────────────────────────────────────────────────────
// Eric at #1, Scott McGrath in podium, 15 other Texan brokers w/ varying perf.
// Numbers tuned to feel competitive and earned (not absurd).

type Broker = {
  rank: number
  name: string
  city: string
  initials: string
  avatarBg: string
  calls: number
  emails: number
  revenue: number
  profit: number
  clients: number
  streak: number // current days-on-fire
  trend: number  // +/- % vs last month
  badge: 'blazing' | 'rising' | 'steady' | 'pushing'
}

const BROKERS: Broker[] = [
  { rank: 1,  name: 'Eric Skeldon',     city: 'Plano, TX',         initials: 'ES', avatarBg: 'linear-gradient(135deg,#C9A84C,#E8C96A)', calls: 487, emails: 1243, revenue: 2_180_000, profit: 1_420_000, clients: 34, streak: 21, trend: 18, badge: 'blazing' },
  { rank: 2,  name: 'Scott McGrath',    city: 'Bedford, TX',       initials: 'SM', avatarBg: 'linear-gradient(135deg,#9BA8C0,#C0CADC)', calls: 412, emails: 1087, revenue: 1_840_000, profit: 1_180_000, clients: 28, streak: 14, trend: 11, badge: 'blazing' },
  { rank: 3,  name: 'Marcus Reyes',     city: 'Houston, TX',       initials: 'MR', avatarBg: 'linear-gradient(135deg,#B97A56,#D49A75)', calls: 398, emails: 956,  revenue: 1_470_000, profit: 902_000,   clients: 22, streak: 9,  trend: 9,  badge: 'rising' },
  { rank: 4,  name: 'Sarah Mendoza',    city: 'Austin, TX',        initials: 'SM', avatarBg: 'linear-gradient(135deg,#7BA08F,#A2C3B3)', calls: 367, emails: 1012, revenue: 1_320_000, profit: 821_000,   clients: 24, streak: 12, trend: 14, badge: 'rising' },
  { rank: 5,  name: 'Daniel Whitfield', city: 'Dallas, TX',        initials: 'DW', avatarBg: 'linear-gradient(135deg,#7B8AA0,#9CA9BD)', calls: 354, emails: 887,  revenue: 1_210_000, profit: 748_000,   clients: 19, streak: 6,  trend: 4,  badge: 'rising' },
  { rank: 6,  name: 'Jessica Hartman',  city: 'San Antonio, TX',   initials: 'JH', avatarBg: 'linear-gradient(135deg,#A07B8A,#BD9DAA)', calls: 318, emails: 794,  revenue: 1_080_000, profit: 662_000,   clients: 21, streak: 8,  trend: 7,  badge: 'rising' },
  { rank: 7,  name: 'Brandon Castillo', city: 'Fort Worth, TX',    initials: 'BC', avatarBg: 'linear-gradient(135deg,#8A7BA0,#A89BBD)', calls: 287, emails: 723,  revenue: 972_000,   profit: 584_000,   clients: 17, streak: 5,  trend: 2,  badge: 'steady' },
  { rank: 8,  name: 'Ashley Brennan',   city: 'The Woodlands, TX', initials: 'AB', avatarBg: 'linear-gradient(135deg,#7BA0A0,#A2C3C3)', calls: 264, emails: 681,  revenue: 895_000,   profit: 537_000,   clients: 15, streak: 4,  trend: 5,  badge: 'steady' },
  { rank: 9,  name: 'Tyler Donovan',    city: 'Frisco, TX',        initials: 'TD', avatarBg: 'linear-gradient(135deg,#A09B7B,#BDB89C)', calls: 251, emails: 619,  revenue: 824_000,   profit: 487_000,   clients: 16, streak: 3,  trend: 1,  badge: 'steady' },
  { rank: 10, name: 'Megan Kowalski',   city: 'McKinney, TX',      initials: 'MK', avatarBg: 'linear-gradient(135deg,#7B95A0,#9DB6BD)', calls: 238, emails: 567,  revenue: 743_000,   profit: 441_000,   clients: 14, streak: 7,  trend: 6,  badge: 'steady' },
  { rank: 11, name: 'Ryan Vasquez',     city: 'Lubbock, TX',       initials: 'RV', avatarBg: 'linear-gradient(135deg,#A07B7B,#BD9D9D)', calls: 219, emails: 524,  revenue: 681_000,   profit: 398_000,   clients: 13, streak: 2,  trend: -2, badge: 'steady' },
  { rank: 12, name: 'Hannah Sutton',    city: 'Sugar Land, TX',    initials: 'HS', avatarBg: 'linear-gradient(135deg,#7B7BA0,#9D9DBD)', calls: 198, emails: 481,  revenue: 612_000,   profit: 356_000,   clients: 12, streak: 5,  trend: 3,  badge: 'steady' },
  { rank: 13, name: 'Jordan Pierce',    city: 'El Paso, TX',       initials: 'JP', avatarBg: 'linear-gradient(135deg,#A08F7B,#BDB09D)', calls: 184, emails: 442,  revenue: 548_000,   profit: 317_000,   clients: 11, streak: 1,  trend: -1, badge: 'steady' },
  { rank: 14, name: 'Caleb Anderson',   city: 'Tyler, TX',         initials: 'CA', avatarBg: 'linear-gradient(135deg,#7B907B,#9DB29D)', calls: 167, emails: 398,  revenue: 487_000,   profit: 278_000,   clients: 9,  streak: 3,  trend: 2,  badge: 'pushing' },
  { rank: 15, name: 'Olivia Reinhart',  city: 'Round Rock, TX',    initials: 'OR', avatarBg: 'linear-gradient(135deg,#A07B95,#BD9DB2)', calls: 152, emails: 351,  revenue: 421_000,   profit: 239_000,   clients: 8,  streak: 2,  trend: -3, badge: 'pushing' },
  { rank: 16, name: 'Caroline Briggs',  city: 'Waco, TX',          initials: 'CB', avatarBg: 'linear-gradient(135deg,#7B7BA0,#9D9DBD)', calls: 138, emails: 312,  revenue: 362_000,   profit: 204_000,   clients: 7,  streak: 1,  trend: -5, badge: 'pushing' },
  { rank: 17, name: 'Connor Hayes',     city: 'Midland, TX',       initials: 'CH', avatarBg: 'linear-gradient(135deg,#A09B7B,#BDB89C)', calls: 124, emails: 287,  revenue: 304_000,   profit: 171_000,   clients: 6,  streak: 0,  trend: -8, badge: 'pushing' },
]

// ── ACTIVITY TICKER ──────────────────────────────────────────────────────────
const TICKER: Array<{ who: string; what: string; ts: string; gold?: boolean }> = [
  { who: 'Eric Skeldon',     what: 'closed Legacy HVAC Services · +$162K commission',      ts: '2 min ago',  gold: true },
  { who: 'Sarah Mendoza',    what: 'added 3 new buyers to network',                        ts: '8 min ago' },
  { who: 'Marcus Reyes',     what: 'scheduled discovery call · Precision Dental Labs',     ts: '14 min ago' },
  { who: 'Scott McGrath',    what: 'submitted LOI · Summit Industrial Supply',             ts: '21 min ago', gold: true },
  { who: 'Jessica Hartman',  what: 'closed Carolina Roofing Group · +$98K commission',     ts: '38 min ago' },
  { who: 'Tyler Donovan',    what: 'dialed 47 calls today · 12-call streak',                ts: '1 hr ago' },
  { who: 'Daniel Whitfield', what: 'matched 2 buyers to active deal',                       ts: '1 hr ago' },
  { who: 'Brandon Castillo', what: 'NDA executed · Texas Plumbing Group',                   ts: '2 hr ago' },
  { who: 'Ashley Brennan',   what: 'sent 38 personalized buyer emails',                     ts: '2 hr ago' },
  { who: 'Eric Skeldon',     what: 'onboarded Thompson Tubular · Permian Basin',           ts: '3 hr ago', gold: true },
]

// ── HELPERS ──────────────────────────────────────────────────────────────────
function fmtMoney(n: number) {
  if (n >= 1_000_000) return '$' + (n / 1_000_000).toFixed(2) + 'M'
  if (n >= 1_000)     return '$' + Math.round(n / 1_000) + 'K'
  return '$' + n
}
function fmtNum(n: number) { return n.toLocaleString('en-US') }

const BADGES = {
  blazing: { label: 'BLAZING', bg: 'rgba(232,73,73,0.14)', color: '#FF7B5C', border: 'rgba(232,73,73,0.35)', icon: '🔥' },
  rising:  { label: 'RISING',  bg: 'rgba(201,168,76,0.14)', color: '#E8C96A', border: 'rgba(201,168,76,0.35)', icon: '⬆' },
  steady:  { label: 'STEADY',  bg: 'rgba(155,168,192,0.10)', color: '#9BA8C0', border: 'rgba(155,168,192,0.25)', icon: '→' },
  pushing: { label: 'PUSHING', bg: 'rgba(122,138,168,0.08)', color: '#7A8AA8', border: 'rgba(122,138,168,0.20)', icon: '↻' },
}

// ── PAGE ─────────────────────────────────────────────────────────────────────
export default function LeaderboardPage() {
  const [tickerIdx, setTickerIdx] = useState(0)
  const [pulse, setPulse] = useState(0)

  useEffect(() => {
    const tInt = setInterval(() => setTickerIdx((i) => (i + 1) % TICKER.length), 3800)
    const pInt = setInterval(() => setPulse((p) => p + 1), 1100)
    return () => { clearInterval(tInt); clearInterval(pInt) }
  }, [])

  const top3 = BROKERS.slice(0, 3)
  const rest = BROKERS.slice(3)
  const maxRevenue = Math.max(...BROKERS.map(b => b.revenue))

  // Days-until-quarter-end (static demo: pretend Q3 ends 47 days out)
  const daysToReset = 47

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--kb-bg, #060912)',
      color: 'var(--kb-text, #F2EEE7)',
      fontFamily: "'Inter', 'DM Sans', system-ui, sans-serif",
      padding: '32px 32px 80px',
    }}>

      {/* HERO BANNER */}
      <div style={{
        position: 'relative',
        background: 'linear-gradient(135deg, rgba(201,168,76,0.10) 0%, rgba(11,27,62,0.40) 50%, rgba(11,27,62,0.20) 100%)',
        border: '1px solid rgba(201,168,76,0.25)',
        borderRadius: '18px',
        padding: '36px 40px',
        marginBottom: '28px',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse 60% 50% at 80% 30%, rgba(201,168,76,0.16), transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', fontFamily: "'DM Mono', monospace", fontSize: '11px', letterSpacing: '0.2em', color: '#C9A84C', textTransform: 'uppercase', marginBottom: '14px', padding: '6px 12px', background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.3)', borderRadius: '999px' }}>
              <span style={{ width: '6px', height: '6px', background: '#C9A84C', borderRadius: '50%', boxShadow: pulse % 2 ? '0 0 0 6px rgba(201,168,76,0)' : '0 0 0 0 rgba(201,168,76,0.5)', transition: 'box-shadow 0.5s' }} />
              Q3 2026 · Live Leaderboard
            </div>
            <h1 style={{ fontSize: 'clamp(36px, 4.5vw, 52px)', fontWeight: 700, lineHeight: 1.0, letterSpacing: '-0.025em', margin: 0, marginBottom: '12px', fontFamily: "'Playfair Display', serif" }}>
              The Kingdom Broker <span style={{ background: 'linear-gradient(90deg,#C9A84C 0%,#E8C96A 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>Scorecard</span>
            </h1>
            <p style={{ fontSize: '16px', color: '#9BA8C0', margin: 0, maxWidth: '660px', lineHeight: 1.5 }}>
              Calls dialed. Deals closed. Legacies preserved. Top 3 each quarter win <strong style={{ color: '#E8C96A' }}>$17,500 in cash + family trips</strong> — and the <strong style={{ color: '#E8C96A' }}>#1 broker earns vested equity in Kingdom Broker Inc.</strong> Stack quarters. Compound ownership.
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '11px', letterSpacing: '0.18em', color: '#9BA8C0', textTransform: 'uppercase', marginBottom: '4px' }}>
              Quarter Resets In
            </div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '64px', fontWeight: 700, lineHeight: 1, color: '#C9A84C', letterSpacing: '-0.02em' }}>
              {daysToReset}<span style={{ fontSize: '20px', color: '#9BA8C0', marginLeft: '6px' }}>days</span>
            </div>
          </div>
        </div>
      </div>

      {/* LIVE ACTIVITY TICKER */}
      <div style={{
        background: 'rgba(11,27,62,0.4)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '12px',
        padding: '16px 22px',
        marginBottom: '32px',
        display: 'flex', alignItems: 'center', gap: '20px',
        overflow: 'hidden',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <span style={{ width: '8px', height: '8px', background: '#2ECC8B', borderRadius: '50%', boxShadow: '0 0 0 4px rgba(46,204,139,0.2)' }} />
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '10px', letterSpacing: '0.2em', color: '#2ECC8B', textTransform: 'uppercase', fontWeight: 600 }}>Live</span>
        </div>
        <div style={{ flex: 1, fontSize: '14px', color: '#F2EEE7', overflow: 'hidden' }}>
          <span style={{ color: TICKER[tickerIdx].gold ? '#E8C96A' : '#F2EEE7', fontWeight: 600 }}>{TICKER[tickerIdx].who}</span>
          <span style={{ color: '#9BA8C0', marginLeft: '8px' }}>{TICKER[tickerIdx].what}</span>
        </div>
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '11px', color: '#7A8AA8', flexShrink: 0 }}>
          {TICKER[tickerIdx].ts}
        </div>
      </div>

      {/* PODIUM — TOP 3 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '18px', marginBottom: '40px' }}>
        {/* Reorder: 2nd / 1st / 3rd for actual podium feel */}
        {[top3[1], top3[0], top3[2]].map((b, i) => {
          const isKing = b.rank === 1
          const medal = b.rank === 1 ? '👑' : b.rank === 2 ? '🥈' : '🥉'
          const podiumHeight = b.rank === 1 ? 0 : b.rank === 2 ? 18 : 28
          return (
            <div key={b.rank} style={{ marginTop: `${podiumHeight}px` }}>
              <div style={{
                position: 'relative',
                background: isKing ? 'linear-gradient(180deg, rgba(201,168,76,0.18) 0%, rgba(11,27,62,0.6) 100%)' : 'linear-gradient(180deg, rgba(15,35,71,0.8) 0%, rgba(11,27,62,0.6) 100%)',
                border: isKing ? '2px solid #C9A84C' : '1px solid rgba(255,255,255,0.08)',
                borderRadius: '16px',
                padding: '28px 24px',
                textAlign: 'center',
                boxShadow: isKing ? '0 16px 56px rgba(201,168,76,0.18), 0 0 0 1px rgba(201,168,76,0.3)' : '0 8px 24px rgba(0,0,0,0.3)',
              }}>
                {isKing && (
                  <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(90deg, #C9A84C, #E8C96A)', color: '#0B1B3E', padding: '5px 14px', borderRadius: '999px', fontFamily: "'DM Mono', monospace", fontSize: '10px', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
                    King Of The Hill
                  </div>
                )}
                <div style={{ fontSize: '40px', marginBottom: '12px', filter: isKing ? 'drop-shadow(0 0 12px rgba(201,168,76,0.6))' : 'none' }}>
                  {medal}
                </div>
                <div style={{
                  width: '76px', height: '76px', margin: '0 auto 16px',
                  borderRadius: '50%',
                  background: b.avatarBg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: "'Playfair Display', serif", fontSize: '28px', fontWeight: 700, color: '#0B1B3E',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.4)',
                }}>
                  {b.initials}
                </div>
                <div style={{ fontSize: '20px', fontWeight: 600, color: '#F2EEE7', marginBottom: '4px' }}>
                  {b.name}
                </div>
                <div style={{ fontSize: '12px', color: '#9BA8C0', marginBottom: '20px', fontFamily: "'DM Mono', monospace", letterSpacing: '0.08em' }}>
                  {b.city}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '18px' }}>
                  <div style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.04)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '9px', letterSpacing: '0.14em', color: '#7A8AA8', textTransform: 'uppercase', marginBottom: '4px' }}>Revenue</div>
                    <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', fontWeight: 700, color: isKing ? '#E8C96A' : '#F2EEE7' }}>{fmtMoney(b.revenue)}</div>
                  </div>
                  <div style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.04)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '9px', letterSpacing: '0.14em', color: '#7A8AA8', textTransform: 'uppercase', marginBottom: '4px' }}>Clients</div>
                    <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', fontWeight: 700, color: '#2ECC8B' }}>{b.clients}</div>
                  </div>
                </div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 12px', background: 'rgba(232,73,73,0.12)', border: '1px solid rgba(232,73,73,0.3)', borderRadius: '999px' }}>
                  <span style={{ fontSize: '14px' }}>🔥</span>
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '11px', color: '#FF7B5C', fontWeight: 600, letterSpacing: '0.08em' }}>
                    {b.streak}-DAY STREAK
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* MAIN LEADERBOARD TABLE */}
      <div style={{
        background: 'rgba(11,27,62,0.4)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '14px',
        overflow: 'hidden',
      }}>
        {/* Table header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '60px 1.6fr 80px 80px 130px 130px 80px 130px 100px',
          gap: '14px',
          padding: '16px 24px',
          background: 'rgba(11,27,62,0.6)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          fontFamily: "'DM Mono', monospace", fontSize: '10px', letterSpacing: '0.16em', color: '#7A8AA8', textTransform: 'uppercase', fontWeight: 600,
        }}>
          <div>Rank</div>
          <div>Broker</div>
          <div style={{ textAlign: 'right' }}>Calls</div>
          <div style={{ textAlign: 'right' }}>Emails</div>
          <div style={{ textAlign: 'right' }}>Revenue</div>
          <div style={{ textAlign: 'right' }}>Profit</div>
          <div style={{ textAlign: 'right' }}>Clients</div>
          <div style={{ textAlign: 'center' }}>Streak / Trend</div>
          <div style={{ textAlign: 'center' }}>Status</div>
        </div>

        {/* Rows: ALL brokers (re-include top 3 in table for completeness) */}
        {BROKERS.map((b) => {
          const isEric = b.rank === 1
          const badge = BADGES[b.badge]
          const revPct = (b.revenue / maxRevenue) * 100
          const rankDisplay = b.rank === 1 ? '👑' : b.rank === 2 ? '🥈' : b.rank === 3 ? '🥉' : `#${b.rank}`
          return (
            <div key={b.rank} style={{
              display: 'grid',
              gridTemplateColumns: '60px 1.6fr 80px 80px 130px 130px 80px 130px 100px',
              gap: '14px',
              padding: '16px 24px',
              alignItems: 'center',
              borderBottom: '1px solid rgba(255,255,255,0.04)',
              background: isEric ? 'linear-gradient(90deg, rgba(201,168,76,0.10), rgba(201,168,76,0) 60%)' : 'transparent',
              position: 'relative',
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => { if (!isEric) (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.025)' }}
            onMouseLeave={(e) => { if (!isEric) (e.currentTarget as HTMLDivElement).style.background = 'transparent' }}
            >
              {/* Revenue bar (background) */}
              <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', borderRadius: '2px' }}>
                <div style={{
                  position: 'absolute', left: 0, bottom: 0, height: '2px',
                  width: `${revPct}%`,
                  background: isEric ? 'linear-gradient(90deg, #C9A84C, #E8C96A)' : 'linear-gradient(90deg, rgba(155,168,192,0.4), rgba(155,168,192,0.15))',
                  transition: 'width 0.4s',
                }} />
              </div>

              {/* RANK */}
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: b.rank <= 3 ? '22px' : '18px', fontWeight: 700, color: isEric ? '#E8C96A' : '#9BA8C0', letterSpacing: '-0.02em', position: 'relative' }}>
                {rankDisplay}
              </div>

              {/* BROKER */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', position: 'relative' }}>
                <div style={{
                  width: '38px', height: '38px', borderRadius: '50%',
                  background: b.avatarBg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: "'Playfair Display', serif", fontSize: '14px', fontWeight: 700, color: '#0B1B3E',
                  flexShrink: 0,
                  boxShadow: isEric ? '0 0 0 2px rgba(201,168,76,0.35)' : 'inset 0 1px 0 rgba(255,255,255,0.3)',
                }}>
                  {b.initials}
                </div>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 600, color: isEric ? '#E8C96A' : '#F2EEE7' }}>{b.name}</div>
                  <div style={{ fontSize: '11px', color: '#7A8AA8', fontFamily: "'DM Mono', monospace", letterSpacing: '0.06em', marginTop: '1px' }}>{b.city}</div>
                </div>
              </div>

              {/* CALLS */}
              <div style={{ textAlign: 'right', fontFamily: "'DM Mono', monospace", fontSize: '14px', color: '#F2EEE7', fontWeight: 500, position: 'relative' }}>
                {fmtNum(b.calls)}
              </div>

              {/* EMAILS */}
              <div style={{ textAlign: 'right', fontFamily: "'DM Mono', monospace", fontSize: '14px', color: '#F2EEE7', fontWeight: 500, position: 'relative' }}>
                {fmtNum(b.emails)}
              </div>

              {/* REVENUE */}
              <div style={{ textAlign: 'right', fontFamily: "'Playfair Display', serif", fontSize: '17px', fontWeight: 700, color: isEric ? '#E8C96A' : '#F2EEE7', position: 'relative', letterSpacing: '-0.02em' }}>
                {fmtMoney(b.revenue)}
              </div>

              {/* PROFIT */}
              <div style={{ textAlign: 'right', fontFamily: "'Playfair Display', serif", fontSize: '15px', fontWeight: 600, color: '#2ECC8B', position: 'relative', letterSpacing: '-0.02em' }}>
                {fmtMoney(b.profit)}
              </div>

              {/* CLIENTS */}
              <div style={{ textAlign: 'right', fontFamily: "'DM Mono', monospace", fontSize: '14px', color: '#F2EEE7', fontWeight: 600, position: 'relative' }}>
                {b.clients}
              </div>

              {/* STREAK / TREND */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', position: 'relative' }}>
                {b.streak >= 3 && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', padding: '3px 8px', background: 'rgba(232,73,73,0.10)', border: '1px solid rgba(232,73,73,0.25)', borderRadius: '999px', fontFamily: "'DM Mono', monospace", fontSize: '10px', color: '#FF7B5C', fontWeight: 600 }}>
                    🔥 {b.streak}
                  </span>
                )}
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '11px', fontWeight: 600, color: b.trend > 0 ? '#2ECC8B' : b.trend < 0 ? '#FF7B5C' : '#9BA8C0' }}>
                  {b.trend > 0 ? '▲' : b.trend < 0 ? '▼' : '→'} {Math.abs(b.trend)}%
                </span>
              </div>

              {/* STATUS BADGE */}
              <div style={{ textAlign: 'center', position: 'relative' }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '5px',
                  padding: '5px 10px',
                  background: badge.bg, border: `1px solid ${badge.border}`,
                  borderRadius: '6px',
                  fontFamily: "'DM Mono', monospace", fontSize: '9.5px', fontWeight: 700, letterSpacing: '0.1em',
                  color: badge.color,
                }}>
                  <span>{badge.icon}</span>{badge.label}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* PRIZE BANNER (bottom) — 3-tier prize structure */}
      <div style={{ marginTop: '40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '11px', letterSpacing: '0.22em', color: '#C9A84C', textTransform: 'uppercase', marginBottom: '12px', display: 'inline-flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ width: '28px', height: '1px', background: '#C9A84C', display: 'inline-block' }} />
            This Quarter&apos;s Prize Pool · $17,500 + Family Trips + KB Inc. Equity
            <span style={{ width: '28px', height: '1px', background: '#C9A84C', display: 'inline-block' }} />
          </div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(28px, 3.4vw, 38px)', fontWeight: 700, color: '#F2EEE7', margin: 0, lineHeight: 1.1, letterSpacing: '-0.02em' }}>
            Closers win. <span style={{ color: '#E8C96A' }}>Families come along for the ride.</span>
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          {/* 1st place */}
          <div style={{
            position: 'relative',
            background: 'linear-gradient(180deg, rgba(201,168,76,0.16) 0%, rgba(11,27,62,0.5) 100%)',
            border: '2px solid #C9A84C',
            borderRadius: '16px',
            padding: '28px 26px',
            boxShadow: '0 16px 48px rgba(201,168,76,0.18)',
          }}>
            <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(90deg,#C9A84C,#E8C96A)', color: '#0B1B3E', padding: '5px 14px', borderRadius: '999px', fontFamily: "'DM Mono', monospace", fontSize: '10px', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
              Grand Prize
            </div>
            <div style={{ fontSize: '40px', marginBottom: '12px', textAlign: 'center', filter: 'drop-shadow(0 0 12px rgba(201,168,76,0.6))' }}>👑</div>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '10px', letterSpacing: '0.16em', color: '#C9A84C', textTransform: 'uppercase', textAlign: 'center', marginBottom: '8px' }}>1st Place</div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '40px', fontWeight: 700, color: '#E8C96A', textAlign: 'center', letterSpacing: '-0.02em', lineHeight: 1, marginBottom: '4px' }}>
              $10,000
            </div>
            <div style={{ fontSize: '13px', color: '#9BA8C0', textAlign: 'center', marginBottom: '20px', fontFamily: "'DM Mono', monospace", letterSpacing: '0.05em' }}>cash bonus</div>
            <div style={{ padding: '14px 16px', background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(201,168,76,0.25)', borderRadius: '10px', marginBottom: '12px' }}>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '9px', letterSpacing: '0.14em', color: '#C9A84C', textTransform: 'uppercase', marginBottom: '6px' }}>+ Family Experience</div>
              <div style={{ fontSize: '15px', fontWeight: 600, color: '#F2EEE7', marginBottom: '4px' }}>🏝 5-Day Hawaii Trip</div>
              <div style={{ fontSize: '12px', color: '#9BA8C0', lineHeight: 1.45 }}>Flights for 4 · 4-star oceanfront resort · $1,500 spending stipend</div>
            </div>
            <div style={{ padding: '12px 14px', background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: '10px' }}>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '9px', letterSpacing: '0.14em', color: '#C9A84C', textTransform: 'uppercase', marginBottom: '6px' }}>+ Equity in KB Inc.</div>
              <div style={{ fontSize: '13px', color: '#F2EEE7', lineHeight: 1.45 }}>Top brokers earn <strong style={{ color: '#E8C96A' }}>vested shares</strong> of Kingdom Broker Inc. Quarterly grants scale with your metrics — more calls, more closes, more clients = more ownership. Shares stack year over year. Top closers become real owners at exit.</div>
            </div>
          </div>

          {/* 2nd place */}
          <div style={{
            position: 'relative',
            background: 'linear-gradient(180deg, rgba(155,168,192,0.10) 0%, rgba(11,27,62,0.5) 100%)',
            border: '1px solid rgba(155,168,192,0.35)',
            borderRadius: '16px',
            padding: '28px 26px',
            marginTop: '14px',
          }}>
            <div style={{ fontSize: '36px', marginBottom: '12px', textAlign: 'center' }}>🥈</div>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '10px', letterSpacing: '0.16em', color: '#9BA8C0', textTransform: 'uppercase', textAlign: 'center', marginBottom: '8px' }}>2nd Place</div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '36px', fontWeight: 700, color: '#F2EEE7', textAlign: 'center', letterSpacing: '-0.02em', lineHeight: 1, marginBottom: '4px' }}>
              $5,000
            </div>
            <div style={{ fontSize: '13px', color: '#9BA8C0', textAlign: 'center', marginBottom: '20px', fontFamily: "'DM Mono', monospace", letterSpacing: '0.05em' }}>cash bonus</div>
            <div style={{ padding: '14px 16px', background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(155,168,192,0.2)', borderRadius: '10px', marginBottom: '12px' }}>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '9px', letterSpacing: '0.14em', color: '#9BA8C0', textTransform: 'uppercase', marginBottom: '6px' }}>+ Family Experience</div>
              <div style={{ fontSize: '15px', fontWeight: 600, color: '#F2EEE7', marginBottom: '4px' }}>🏖 Long Weekend Resort Stay</div>
              <div style={{ fontSize: '12px', color: '#9BA8C0', lineHeight: 1.45 }}>Flights for 4 · 3 nights · winner&apos;s choice of resort up to $3,000</div>
            </div>
            <div style={{ padding: '12px 14px', background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(155,168,192,0.15)', borderRadius: '10px' }}>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '9px', letterSpacing: '0.14em', color: '#9BA8C0', textTransform: 'uppercase', marginBottom: '6px' }}>+ Gift Cards</div>
              <div style={{ fontSize: '13px', color: '#F2EEE7', lineHeight: 1.45 }}>$2,500 across Amex, Amazon, Apple, Disney, &amp; restaurant picks</div>
            </div>
          </div>

          {/* 3rd place */}
          <div style={{
            position: 'relative',
            background: 'linear-gradient(180deg, rgba(185,122,86,0.10) 0%, rgba(11,27,62,0.5) 100%)',
            border: '1px solid rgba(185,122,86,0.35)',
            borderRadius: '16px',
            padding: '28px 26px',
            marginTop: '24px',
          }}>
            <div style={{ fontSize: '32px', marginBottom: '12px', textAlign: 'center' }}>🥉</div>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '10px', letterSpacing: '0.16em', color: '#D49A75', textTransform: 'uppercase', textAlign: 'center', marginBottom: '8px' }}>3rd Place</div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '32px', fontWeight: 700, color: '#F2EEE7', textAlign: 'center', letterSpacing: '-0.02em', lineHeight: 1, marginBottom: '4px' }}>
              $2,500
            </div>
            <div style={{ fontSize: '13px', color: '#9BA8C0', textAlign: 'center', marginBottom: '20px', fontFamily: "'DM Mono', monospace", letterSpacing: '0.05em' }}>cash bonus</div>
            <div style={{ padding: '14px 16px', background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(185,122,86,0.2)', borderRadius: '10px', marginBottom: '12px' }}>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '9px', letterSpacing: '0.14em', color: '#D49A75', textTransform: 'uppercase', marginBottom: '6px' }}>+ Family Experience</div>
              <div style={{ fontSize: '15px', fontWeight: 600, color: '#F2EEE7', marginBottom: '4px' }}>🎢 Theme Park Weekend</div>
              <div style={{ fontSize: '12px', color: '#9BA8C0', lineHeight: 1.45 }}>Disney / Universal / Six Flags · 4 park-hopper passes + 2 nights</div>
            </div>
            <div style={{ padding: '12px 14px', background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(185,122,86,0.15)', borderRadius: '10px' }}>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '9px', letterSpacing: '0.14em', color: '#D49A75', textTransform: 'uppercase', marginBottom: '6px' }}>+ Gift Cards</div>
              <div style={{ fontSize: '13px', color: '#F2EEE7', lineHeight: 1.45 }}>$1,000 in winner&apos;s-choice premium gift cards</div>
            </div>
          </div>
        </div>

        {/* Current leader strip */}
        <div style={{
          marginTop: '24px',
          background: 'rgba(11,27,62,0.5)',
          border: '1px solid rgba(201,168,76,0.25)',
          borderRadius: '12px',
          padding: '18px 28px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px', flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <span style={{ fontSize: '30px' }}>👑</span>
            <div>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '10px', letterSpacing: '0.18em', color: '#9BA8C0', textTransform: 'uppercase' }}>Currently In 1st</div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '26px', fontWeight: 700, color: '#E8C96A', letterSpacing: '-0.02em' }}>
                Eric Skeldon · Plano, TX
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '9px', letterSpacing: '0.16em', color: '#7A8AA8', textTransform: 'uppercase' }}>Ahead by</div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', fontWeight: 700, color: '#F2EEE7' }}>$340K rev</div>
            </div>
            <div>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '9px', letterSpacing: '0.16em', color: '#7A8AA8', textTransform: 'uppercase' }}>Resets In</div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', fontWeight: 700, color: '#C9A84C' }}>47 days</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── EQUITY PLAN DISCLOSURE ────────────────────────────── */}
      <div style={{
        marginTop: '48px',
        padding: '40px 44px',
        background: 'rgba(11,27,62,0.35)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '14px',
      }}>
        <div style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: '13px',
          letterSpacing: '0.22em',
          color: '#C9A84C',
          textTransform: 'uppercase',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          fontWeight: 600,
        }}>
          <span style={{ width: '36px', height: '1px', background: '#C9A84C' }} />
          The Kingdom Broker Equity Plan
        </div>
        <p style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: '24px',
          fontWeight: 500,
          color: '#F2EEE7',
          lineHeight: 1.5,
          margin: '0 0 28px',
          maxWidth: '960px',
          letterSpacing: '-0.005em',
        }}>
          Every team member earns ownership in the company they help build. Top-performing brokers earn metrics-weighted quarterly equity grants. Every employee earns base equity vesting on
          <strong style={{ color: '#E8C96A', fontWeight: 600 }}> time-in-service</strong> and
          <strong style={{ color: '#E8C96A', fontWeight: 600 }}> revenue contribution</strong> — stacked together, scaling with tenure and impact.
        </p>
        <p style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: '15px',
          color: '#B8C0CC',
          lineHeight: 1.7,
          margin: 0,
          maxWidth: '960px',
          letterSpacing: '0.005em',
          fontWeight: 400,
        }}>
          <strong style={{ color: '#E8C96A', textTransform: 'uppercase', letterSpacing: '0.14em', fontSize: '12px', fontFamily: "'DM Mono', monospace", display: 'block', marginBottom: '10px' }}>Disclaimer</strong>
          This page describes the intended structure of the Kingdom Broker Equity Plan. Final vesting schedules, share counts, dilution mechanics, eligibility, and tax treatment will be governed by the formal Kingdom Broker Inc. Equity Incentive Plan adopted under separate written documentation, subject to board approval and applicable securities law. Leaderboard metrics displayed here are illustrative and do not, on their own, grant any equity rights or constitute an offer of securities. Nothing on this page constitutes a binding commitment, employment contract, or compensation agreement.
        </p>
      </div>

    </div>
  )
}
