'use client'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const NODES = [
  {
    id: 1,
    lines: ['M&A', 'Influencers'],
    tag: 'DEAL BUYERS',
    shortLabel: 'M&A Influencers',
    full: 'Partnerships with top M&A educators and acquisition influencers bring 20,000+ active buyers into the KB flywheel. Their audiences need qualified, pre-vetted targets — our AI pipeline matches them to exact buy boxes.',
    color: 'var(--kb-accent)',
  },
  {
    id: 2,
    lines: ['Nexxess X', 'KB PE Fund'],
    tag: 'CAPITAL CLOSE',
    shortLabel: 'Nexxess X KB PE Fund',
    full: 'The Nexxess X KB PE Fund finances the down payment so deals actually close. Capital removes the final barrier between a motivated buyer and a signed LOI.',
    color: 'var(--kb-green)',
  },
  {
    id: 3,
    lines: ['KB Deal', 'Intelligence'],
    tag: 'AI ENGINE',
    shortLabel: 'KB Deal Intelligence',
    full: 'KB Deal Intelligence finds motivated sellers and matches them to qualified buyers. Every match gets smarter with each deal closed, the system compounds automatically.',
    color: 'var(--kb-accent)',
  },
  {
    id: 4,
    lines: ['Top Business Broker Partner', 'Network'],
    tag: 'DEAL FLOW',
    shortLabel: 'Top Business Broker Partner Network',
    full: 'Top Business Broker Partner refers $1M–$5M sellers to KB. We prepare them for market and bring white-glove $10M–$100M clients to Empowered Business Brokers, earning 20% of their 7–9% success fee plus retainers.',
    color: 'var(--kb-green)',
  },
  {
    id: 5,
    lines: ['KB Investment', 'Club'],
    tag: 'DISTRIBUTION',
    shortLabel: 'KB Investment Club',
    full: '10,000 warm contacts in the KB Investment Club provide instant distribution for every new deal. Zero cold outreach. Every deal has a ready audience before it hits the market.',
    color: 'var(--kb-accent)',
  },
  {
    id: 6,
    lines: ['Kingdom Wealth', 'Society'],
    tag: 'STRUCTURE',
    shortLabel: 'Kingdom Wealth Society',
    full: "Kingdom Wealth Society gives buyers proven deal structure frameworks and faith-driven acquisition education. Better-prepared buyers close at a higher rate and generate stronger returns for everyone in the flywheel.",
    color: 'var(--kb-green)',
  },
  {
    id: 7,
    lines: ['Dennis Yu', 'Distribution'],
    tag: 'MEDIA',
    shortLabel: 'Dennis Yu Distribution',
    full: "Dennis Yu's billion-impression ad experience drives organic content distribution. More sellers find Kingdom Broker every week without a single dollar of cold outreach.",
    color: 'var(--kb-accent)',
  },
  {
    id: 8,
    lines: ['Data', 'Flywheel'],
    tag: 'INTELLIGENCE',
    shortLabel: 'Data Flywheel',
    full: 'Every closed deal feeds richer data into KB Deal Intelligence. Matching improves automatically. Valuations sharpen. The system grows smarter with every transaction, the moat widens.',
    color: 'var(--kb-green)',
  },
  {
    id: 9,
    lines: ['PE Fund', 'Growth'],
    tag: 'SCALE',
    shortLabel: 'PE Fund Growth',
    full: 'As the KB PE Fund grows, more buyers can afford to close deals. More capital in the system means faster deal velocity, and the flywheel spins harder with every cycle.',
    color: 'var(--kb-accent)',
  },
]

// SVG coordinate system (internal units, NOT pixels on screen)
const V = 600        // viewBox size
const CX = 300       // center x
const CY = 300       // center y
const RING_R = 228   // node orbit radius

function getPos(i: number) {
  const angle = (i / NODES.length) * 2 * Math.PI - Math.PI / 2
  return { x: CX + RING_R * Math.cos(angle), y: CY + RING_R * Math.sin(angle) }
}

function arcPath(p1: { x: number; y: number }, p2: { x: number; y: number }) {
  const mx = (p1.x + p2.x) / 2
  const my = (p1.y + p2.y) / 2
  const dx = CX - mx
  const dy = CY - my
  const d = Math.sqrt(dx * dx + dy * dy) || 1
  return `M ${p1.x} ${p1.y} Q ${mx + (dx / d) * 24} ${my + (dy / d) * 24} ${p2.x} ${p2.y}`
}

const RING_PATH = `M ${CX},${CY - RING_R} A ${RING_R},${RING_R} 0 0,1 ${CX},${CY + RING_R} A ${RING_R},${RING_R} 0 0,1 ${CX},${CY - RING_R}`

export default function FlywheelPage() {
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const [hovered, setHovered] = useState<number | null>(null)
  // px size of the rendered SVG element, used to position node chips
  const [svgPx, setSvgPx] = useState(600)
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    const el = svgRef.current
    if (!el) return
    const update = () => setSvgPx(el.getBoundingClientRect().width)
    update()
    const obs = new ResizeObserver(update)
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    if (paused) return
    const t = setInterval(() => setActive(a => (a + 1) % NODES.length), 3200)
    return () => clearInterval(t)
  }, [paused])

  const positions = NODES.map((_, i) => getPos(i))
  const node = NODES[active]
  // Convert SVG coordinate → screen pixel inside the rendered SVG
  const toScreen = (coord: number) => (coord / V) * svgPx

  return (
    <div style={{
      minHeight: '100vh',
      fontFamily: "'Inter', system-ui, sans-serif",
      padding: '44px 32px 80px 32px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}>

      <style>{`
        @keyframes fw-radar  { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fw-orbit  { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fw-gold   {
          0%,100% { box-shadow: 0 0 0 1px rgba(201,168,76,0.45), 0 0 10px rgba(201,168,76,0.15); }
          50%     { box-shadow: 0 0 0 1px rgba(201,168,76,0.7),  0 0 18px rgba(201,168,76,0.28); }
        }
        @keyframes fw-green  {
          0%,100% { box-shadow: 0 0 0 1px rgba(46,204,139,0.4),  0 0 10px rgba(46,204,139,0.12); }
          50%     { box-shadow: 0 0 0 1px rgba(46,204,139,0.65), 0 0 16px rgba(46,204,139,0.22); }
        }
      `}</style>

      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{ textAlign: 'center', marginBottom: '36px', position: 'relative', zIndex: 2, width: '100%', maxWidth: '640px' }}
      >
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          background: 'var(--kb-accent-dim)', border: '1px solid var(--kb-accent-border)',
          borderRadius: '4px', padding: '5px 18px', marginBottom: '20px',
        }}>
          <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--kb-accent)', display: 'inline-block', boxShadow: '0 0 6px #C9A84C' }} />
          <span style={{ fontSize: '11px', color: 'var(--kb-accent)', fontWeight: 590, letterSpacing: '0.18em', textTransform: 'uppercase', fontFamily: "'DM Mono', monospace" }}>
            9 Compounding Loops · Live Intelligence
          </span>
        </div>

        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 'clamp(32px, 4vw, 46px)', fontWeight: 590,
          color: 'var(--kb-text)', margin: '0 0 12px', lineHeight: 1.12,
        }}>
          The Kingdom Broker Flywheel
        </h1>
        <p style={{ fontSize: '17px', color: '#8A97B4', margin: 0, lineHeight: 1.7 }}>
          Every relationship compounds. Every deal makes the next one faster.
        </p>
      </motion.div>

      {/* ── Mission Statement ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2 }}
        style={{
          position: 'relative', zIndex: 2,
          width: '100%', maxWidth: '640px',
          marginBottom: '24px',
          padding: '22px 28px',
          background: 'var(--kb-bg-panel)',
          border: '1px solid var(--kb-accent-border)',
          borderLeft: '3px solid #C9A84C',
          borderRadius: '10px',
        }}
      >
        <div style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: '10px', color: 'var(--kb-accent)', letterSpacing: '0.18em',
          textTransform: 'uppercase', marginBottom: '10px', opacity: 0.75,
        }}>
          The Mission
        </div>
        <p style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: '19px', fontWeight: 510,
          color: 'var(--kb-text)', lineHeight: 1.65, margin: 0,
        }}>
          Kingdom Broker's Deal Intelligence will multiply and be a dominating platform all over the world, with smart data, the Avengers dream deal team, relentless agents, and a solid marketing budget to{' '}
          <span style={{ color: 'var(--kb-accent)' }}>advance good on the Earth. Bringing eternal returns.</span>
        </p>
      </motion.div>

      {/* ── ROI Equation ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.35 }}
        style={{
          position: 'relative', zIndex: 2,
          width: '100%', maxWidth: '640px',
          marginBottom: '44px',
        }}
      >
        {/* Two ROI definitions side by side */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '12px', alignItems: 'center', marginBottom: '14px' }}>

          {/* Return on Impact */}
          <div style={{
            padding: '18px 20px',
            background: 'rgba(201,168,76,0.05)',
            border: '1px solid var(--kb-accent-border)',
            borderRadius: '10px', textAlign: 'center',
          }}>
            <div style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: '28px', fontWeight: 590,
              color: 'var(--kb-accent)', letterSpacing: '0.04em', lineHeight: 1,
              marginBottom: '8px',
            }}>ROI</div>
            <div style={{ fontSize: '11px', color: '#6A7A9A', fontFamily: "'DM Mono', monospace", letterSpacing: '0.08em', marginBottom: '6px' }}>DEFINED AS</div>
            <div style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '17px', fontWeight: 590, color: 'var(--kb-text)', lineHeight: 1.2,
            }}>Return on<br />Impact</div>
          </div>

          {/* Connector */}
          <div style={{ textAlign: 'center', padding: '0 4px' }}>
            <div style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '26px', color: 'var(--kb-accent)', opacity: 0.5, lineHeight: 1,
              marginBottom: '4px',
            }}>=</div>
            <div style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: '9px', color: 'var(--kb-text-muted)', letterSpacing: '0.12em',
              textTransform: 'uppercase',
            }}>AND</div>
            <div style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '26px', color: 'var(--kb-green)', opacity: 0.5, lineHeight: 1,
              marginTop: '4px',
            }}>=</div>
          </div>

          {/* Return on Investment */}
          <div style={{
            padding: '18px 20px',
            background: 'rgba(46,204,139,0.05)',
            border: '1px solid rgba(46,204,139,0.2)',
            borderRadius: '10px', textAlign: 'center',
          }}>
            <div style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: '28px', fontWeight: 590,
              color: 'var(--kb-green)', letterSpacing: '0.04em', lineHeight: 1,
              marginBottom: '8px',
            }}>ROI</div>
            <div style={{ fontSize: '11px', color: '#6A7A9A', fontFamily: "'DM Mono', monospace", letterSpacing: '0.08em', marginBottom: '6px' }}>DEFINED AS</div>
            <div style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '17px', fontWeight: 590, color: 'var(--kb-text)', lineHeight: 1.2,
            }}>Return on<br />Investment</div>
          </div>
        </div>

        {/* Bottom, achieving both */}
        <div style={{
          padding: '14px 22px',
          background: 'var(--kb-bg-card)',
          border: '1px solid var(--kb-border)',
          borderRadius: '8px',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px',
        }}>
          <div style={{ width: '28px', height: '1px', background: 'rgba(201,168,76,0.3)' }} />
          <div style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: '16px', fontWeight: 590,
            color: 'var(--kb-text)', textAlign: 'center',
          }}>
            Kingdom Broker achieves{' '}
            <span style={{ color: 'var(--kb-accent)' }}>both</span>
            {' '}—{' '}
            <span style={{ color: 'var(--kb-accent)' }}>Profit</span>
            {' '}&{' '}
            <span style={{ color: 'var(--kb-green)' }}>Impact</span>
          </div>
          <div style={{ width: '28px', height: '1px', background: 'rgba(46,204,139,0.3)' }} />
        </div>
      </motion.div>

      {/* ── Flywheel ── */}
      {/* Outer wrapper, same maxWidth as content blocks so node 01 centers under the text */}
      <div style={{
        position: 'relative', zIndex: 2,
        width: '100%', maxWidth: '640px',
      }}>
        {/* SVG scales via viewBox, no fixed pixel dimensions */}
        <svg
          ref={svgRef}
          viewBox={`0 0 ${V} ${V}`}
          width="100%"
          style={{ display: 'block', overflow: 'visible' }}
        >
          <defs>
            <filter id="gs" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="2" result="b" />
              <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <radialGradient id="cog" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#C9A84C" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#C9A84C" stopOpacity="0" />
            </radialGradient>
            <path id="rp" d={RING_PATH} />
          </defs>

          {/* Decorative rings */}
          <circle cx={CX} cy={CY} r={RING_R + 28} fill="none" stroke="rgba(201,168,76,0.08)" strokeWidth="1" />

          {/* Radar sweep */}
          <g style={{ transformOrigin: `${CX}px ${CY}px`, animation: 'fw-radar 12s linear infinite' }}>
            <path
              d={`M${CX} ${CY} L${CX} ${CY - RING_R - 20} A${RING_R + 20},${RING_R + 20} 0 0,1 ${CX + (RING_R + 20) * Math.sin(Math.PI / 9)} ${CY - (RING_R + 20) * Math.cos(Math.PI / 9)} Z`}
              fill="rgba(201,168,76,0.04)"
            />
            <line x1={CX} y1={CY} x2={CX} y2={CY - RING_R - 20} stroke="#C9A84C" strokeWidth="0.8" opacity="0.2" />
          </g>

          {/* Main dashed ring */}
          <circle cx={CX} cy={CY} r={RING_R} fill="none" stroke="rgba(201,168,76,0.14)" strokeWidth="1" strokeDasharray="2 9" />
          {/* Inner ring */}
          <circle cx={CX} cy={CY} r={RING_R - 50} fill="none" stroke="var(--kb-border-subtle)" strokeWidth="1" />

          {/* Curved arcs between adjacent nodes */}
          {positions.map((pos, i) => {
            const next = positions[(i + 1) % NODES.length]
            const isAct = i === active
            return (
              <path key={`a${i}`} d={arcPath(pos, next)} fill="none"
                stroke={isAct ? 'rgba(201,168,76,0.5)' : 'rgba(201,168,76,0.09)'}
                strokeWidth={isAct ? 1.5 : 0.8}
                style={{ transition: 'all 0.5s' }}
              />
            )
          })}

          {/* Spokes from center to each node */}
          {positions.map((pos, i) => (
            <line key={`s${i}`} x1={CX} y1={CY} x2={pos.x} y2={pos.y}
              stroke={i === active ? 'rgba(201,168,76,0.2)' : 'var(--kb-bg-raised)'}
              strokeWidth={i === active ? 1 : 0.7}
              style={{ transition: 'stroke 0.5s' }}
            />
          ))}

          {/* Traveling data dots */}
          {[
            { dur: '9s',  begin: '0s',    r: 4,   color: 'var(--kb-accent)', op: 0.85 },
            { dur: '9s',  begin: '-4.5s', r: 2.5, color: 'var(--kb-accent)', op: 0.4  },
            { dur: '14s', begin: '-2s',   r: 2.2, color: 'var(--kb-green)', op: 0.5  },
          ].map((d, di) => (
            <circle key={di} r={d.r} fill={d.color} opacity={d.op}>
              <animateMotion dur={d.dur} begin={d.begin} repeatCount="indefinite"><mpath href="#rp" /></animateMotion>
            </circle>
          ))}

          {/* Center orb, subtle */}
          <circle cx={CX} cy={CY} r="72" fill="url(#cog)">
            <animate attributeName="opacity" values="0.6;1;0.6" dur="4s" repeatCount="indefinite" />
          </circle>
          <circle cx={CX} cy={CY} r="52" fill="#132952" stroke="rgba(201,168,76,0.18)" strokeWidth="1" />

          {/* Orbiting dot */}
          <g style={{ transformOrigin: `${CX}px ${CY}px`, animation: 'fw-orbit 6s linear infinite' }}>
            <circle cx={CX} cy={CY - 52} r="2.5" fill="#C9A84C" opacity="0.8" />
          </g>

          {/* Center text */}
          <text x={CX} y={CY - 14} textAnchor="middle" fill="#C9A84C" fontSize="9" fontFamily="'DM Mono', monospace" letterSpacing="0.22em" opacity="0.6">THE KB</text>
          <text x={CX} y={CY + 10} textAnchor="middle" fill="var(--kb-text)" fontSize="21" fontFamily="'Playfair Display', serif" fontWeight="600">Flywheel</text>
          <text x={CX} y={CY + 28} textAnchor="middle" fill="#6A7A9A" fontSize="9" fontFamily="'DM Mono', monospace" letterSpacing="0.12em">TAP ANY NODE</text>

          {/* Spinning dashed ring around active node */}
          {(() => {
            const p = positions[active]
            return (
              <circle cx={p.x} cy={p.y} r="38" fill="none"
                stroke={NODES[active].color} strokeWidth="1"
                strokeDasharray="3 8" opacity="0.3"
                style={{ transition: 'cx 0.5s, cy 0.5s' }}
              >
                <animateTransform attributeName="transform" type="rotate"
                  from={`0 ${p.x} ${p.y}`} to={`360 ${p.x} ${p.y}`} dur="8s" repeatCount="indefinite" />
              </circle>
            )
          })()}
        </svg>

        {/* Node chips, absolutely positioned over the SVG using toScreen() */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          {NODES.map((n, i) => {
            const pos = positions[i]
            const isActive = i === active
            const isHov = hovered === i
            const isGold = n.color === '#C9A84C'
            const sx = toScreen(pos.x)
            const sy = toScreen(pos.y)

            return (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.07, duration: 0.42, type: 'spring', stiffness: 180 }}
                onClick={() => { setActive(i); setPaused(true) }}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  position: 'absolute',
                  left: sx, top: sy,
                  transform: `translate(-50%, -50%) scale(${isActive ? 1.1 : isHov ? 1.05 : 1})`,
                  transition: 'transform 0.32s cubic-bezier(0.34,1.56,0.64,1)',
                  cursor: 'pointer', zIndex: 10,
                  pointerEvents: 'auto',
                }}
              >
                <div style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
                  padding: '8px 10px 9px',
                  minWidth: '80px', textAlign: 'center',
                  background: isActive
                    ? (isGold ? 'rgba(201,168,76,0.08)' : 'rgba(46,204,139,0.06)')
                    : 'var(--kb-bg-panel)',
                  border: `1px solid ${isActive
                    ? (isGold ? 'rgba(201,168,76,0.55)' : 'rgba(46,204,139,0.45)')
                    : isHov ? 'rgba(201,168,76,0.2)' : 'rgba(255,255,255,0.1)'}`,
                  borderRadius: '9px',
                  backdropFilter: 'blur(4px)',
                  animation: isActive ? (isGold ? 'fw-gold 2.2s ease-in-out infinite' : 'fw-green 2.2s ease-in-out infinite') : 'none',
                  transition: 'background 0.4s, border-color 0.4s',
                }}>
                  {/* Number */}
                  <div style={{
                    fontFamily: "'DM Mono', monospace", fontSize: '10px', fontWeight: 590,
                    color: isActive ? n.color : '#6A7A9A',
                    letterSpacing: '0.14em', lineHeight: 1, marginBottom: '3px',
                    transition: 'color 0.4s',
                  }}>
                    {String(n.id).padStart(2, '0')}
                  </div>
                  {/* Name, always bright */}
                  {n.lines.map((line, li) => (
                    <div key={li} style={{
                      fontSize: '12px', fontWeight: 590,
                      color: isActive ? 'var(--kb-text)' : '#C5D2E8',
                      lineHeight: 1.25, whiteSpace: 'nowrap',
                      transition: 'color 0.4s',
                    }}>{line}</div>
                  ))}
                  {/* Tag */}
                  <div style={{
                    fontFamily: "'DM Mono', monospace", fontSize: '8px',
                    color: isActive ? n.color : '#6A7A9A',
                    letterSpacing: '0.07em', marginTop: '2px',
                    transition: 'color 0.4s',
                  }}>
                    {n.tag}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* ── Detail Panel ── */}
      <div style={{ width: '100%', maxWidth: '640px', marginTop: '40px', position: 'relative', zIndex: 2 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            style={{
              position: 'relative',
              background: 'var(--kb-bg-panel)',
              border: '1px solid var(--kb-border)',
              borderLeft: `3px solid ${node.color}`,
              borderRadius: '12px',
              padding: '28px 32px',
              overflow: 'hidden',
            }}
          >
            {/* Watermark number */}
            <div style={{
              position: 'absolute', right: '24px', top: '50%',
              transform: 'translateY(-50%)',
              fontFamily: "'Playfair Display', serif",
              fontSize: '100px', fontWeight: 590, lineHeight: 1,
              color: node.color === '#C9A84C' ? 'rgba(201,168,76,0.05)' : 'rgba(46,204,139,0.045)',
              userSelect: 'none', pointerEvents: 'none',
            }}>
              {String(node.id).padStart(2, '0')}
            </div>

            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{
                display: 'inline-block',
                fontFamily: "'DM Mono', monospace",
                fontSize: '10px', fontWeight: 590, letterSpacing: '0.16em',
                color: node.color,
                background: node.color === '#C9A84C' ? 'rgba(201,168,76,0.08)' : 'rgba(46,204,139,0.08)',
                border: `1px solid ${node.color === '#C9A84C' ? 'rgba(201,168,76,0.22)' : 'rgba(46,204,139,0.22)'}`,
                borderRadius: '4px', padding: '4px 12px', marginBottom: '14px',
              }}>
                LOOP {String(node.id).padStart(2, '0')} · {node.tag}
              </div>

              <div style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: '24px', fontWeight: 590,
                color: 'var(--kb-text)', lineHeight: 1.25, marginBottom: '14px',
              }}>
                {node.shortLabel}
              </div>

              <p style={{ fontSize: '17px', color: '#BCC8DC', lineHeight: 1.8, margin: 0 }}>
                {node.full}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation controls */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: '14px', marginTop: '20px',
        }}>
          <button
            onClick={() => { setActive(a => (a - 1 + NODES.length) % NODES.length); setPaused(true) }}
            style={{
              width: '36px', height: '36px', borderRadius: '6px',
              background: 'var(--kb-bg-raised)', border: '1px solid var(--kb-border)',
              color: '#8A97B4', fontSize: '18px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >‹</button>

          <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
            {NODES.map((n, i) => (
              <div key={i} onClick={() => { setActive(i); setPaused(true) }}
                style={{
                  width: i === active ? '22px' : '6px', height: '6px',
                  borderRadius: '3px',
                  background: i === active ? NODES[i].color : 'rgba(255,255,255,0.1)',
                  cursor: 'pointer', transition: 'all 0.32s',
                  boxShadow: i === active ? `0 0 7px ${NODES[i].color}` : 'none',
                }}
              />
            ))}
          </div>

          <button
            onClick={() => { setActive(a => (a + 1) % NODES.length); setPaused(true) }}
            style={{
              width: '36px', height: '36px', borderRadius: '6px',
              background: 'var(--kb-bg-raised)', border: '1px solid var(--kb-border)',
              color: '#8A97B4', fontSize: '18px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >›</button>

          <button
            onClick={() => setPaused(p => !p)}
            style={{
              padding: '7px 18px', background: 'transparent',
              border: `1px solid ${paused ? 'rgba(46,204,139,0.35)' : 'rgba(201,168,76,0.25)'}`,
              borderRadius: '6px',
              color: paused ? '#2ECC8B' : '#C9A84C',
              fontSize: '11px', cursor: 'pointer',
              fontFamily: "'DM Mono', monospace", letterSpacing: '0.1em',
              transition: 'all 0.3s',
            }}
          >{paused ? '▶ RESUME' : 'II PAUSE'}</button>
        </div>
      </div>

      {/* ── All 9 Loops list ── */}
      <div style={{ width: '100%', maxWidth: '640px', marginTop: '56px', position: 'relative', zIndex: 2 }}>
        <div style={{ borderTop: '1px solid var(--kb-border)', paddingTop: '44px' }}>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '28px' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--kb-accent-dim)' }} />
            <span style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: '10px', fontWeight: 590, letterSpacing: '0.18em',
              color: 'var(--kb-text-muted)', textTransform: 'uppercase',
            }}>All 9 Loops</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--kb-accent-dim)' }} />
          </div>

          {NODES.map((n, i) => (
            <div
              key={n.id}
              onClick={() => { setActive(i); setPaused(true); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
              style={{
                display: 'grid', gridTemplateColumns: '80px 1fr',
                gap: '14px', alignItems: 'flex-start',
                padding: '16px 18px', borderRadius: '9px', marginBottom: '4px',
                background: i === active
                  ? `rgba(${n.color === '#C9A84C' ? '201,168,76' : '46,204,139'},0.055)`
                  : 'transparent',
                border: `1px solid ${i === active
                  ? `rgba(${n.color === '#C9A84C' ? '201,168,76' : '46,204,139'},0.18)`
                  : 'transparent'}`,
                cursor: 'pointer', transition: 'all 0.3s',
              }}
            >
              <div>
                <div style={{
                  fontFamily: "'DM Mono', monospace", fontSize: '13px', fontWeight: 590,
                  color: n.color, lineHeight: 1,
                }}>{String(n.id).padStart(2, '0')}</div>
                <div style={{
                  fontFamily: "'DM Mono', monospace", fontSize: '9px',
                  color: n.color === '#C9A84C' ? 'rgba(201,168,76,0.4)' : 'rgba(46,204,139,0.38)',
                  marginTop: '4px', letterSpacing: '0.06em',
                  whiteSpace: 'nowrap',
                }}>{n.tag}</div>
              </div>
              <div>
                <div style={{
                  fontSize: '16px', fontWeight: 590,
                  color: i === active ? 'var(--kb-text)' : '#CDD8EC',
                  marginBottom: '5px', transition: 'color 0.3s',
                }}>{n.shortLabel}</div>
                <div style={{ fontSize: '14px', color: '#8A97B4', lineHeight: 1.7 }}>
                  {n.full}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
