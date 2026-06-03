// ChiroPillar Scale Services
// Wagner's standalone consulting catalog — productized so any chiropractor
// can buy time/coaching/installation without joining the roll-up partnership.
// This is Wagner's PERSONAL monetization play; revenue routes to his
// account separate from the platform-acquisition pool.

import Link from 'next/link'

export const dynamic = 'force-dynamic'

const C = {
  bg: 'var(--kb-bg)', bg2: 'var(--kb-bg-panel)', bg3: 'var(--kb-bg-surface)',
  text: 'var(--kb-text)', muted: 'var(--kb-text-secondary)', faint: 'var(--kb-text-muted)',
  border: 'var(--kb-border)',
  spine: '#1F4E79', align: '#2E75B6', stone: '#EBD8A6', globe: '#9CC4E4',
  gold: '#C9A84C', goldLight: '#E8C96A', green: '#2ECC8B', coral: '#F2B0A0',
}
const F = {
  display: "'Playfair Display', Georgia, serif",
  body: "'Inter', system-ui, sans-serif",
  mono: "'JetBrains Mono', 'DM Mono', monospace",
}

type Package = {
  key: string
  category: string
  name: string
  tagline: string
  priceLabel: string
  priceLow: number
  priceHigh: number
  duration: string
  format: string
  deliverable: string
  audience: string
  features: string[]
  accent: string
  badge?: string
}

const PACKAGES: Package[] = [
  {
    key: 'strategy-call',
    category: 'Entry · 1-on-1',
    name: 'Strategy Call with Dr. Wagner',
    tagline: 'One 60-minute call. Diagnose the biggest growth lever.',
    priceLabel: '$500–$2,500',
    priceLow: 500, priceHigh: 2500,
    duration: '60 minutes',
    format: 'Zoom · recorded',
    deliverable: 'Recording + 1-page action summary emailed within 24h.',
    audience: 'Single-location DCs doing $400K–$1.5M who want a senior MD/operator second opinion before making a hire, opening a 2nd location, or selling.',
    features: [
      'Practice diagnostic: where is the growth lever?',
      'Medical-team feasibility (your numbers, your state)',
      'New-patient acquisition assessment',
      'Honest answer on whether your practice is sellable today',
      'No upsell pressure — single call, no follow-up subscription',
    ],
    accent: '#9CC4E4',
  },
  {
    key: 'practice-audit',
    category: 'Diagnostic · 2 weeks',
    name: 'Full Practice Audit',
    tagline: 'P&L review. KPI benchmark. 90-day action plan.',
    priceLabel: '$5,000–$10,000',
    priceLow: 5_000, priceHigh: 10_000,
    duration: '10–14 days',
    format: '2 calls + written report',
    deliverable: 'Multi-page diagnostic PDF + 90-day action plan + 1 follow-up call.',
    audience: 'DCs serious about growth or selling. Want to know the gaps between where they are and where they need to be.',
    features: [
      '3 years of financials reviewed (we sign NDA)',
      'KPI vs comp-set benchmark (vs nearly 200 deals analyzed)',
      'Medical-team feasibility deep dive · ROI projection',
      'Marketing audit · CAC vs LTV gap analysis',
      'Written 90-day action plan with weekly milestones',
      'Follow-up call at day 30 to course-correct',
    ],
    accent: '#C9A84C',
    badge: 'Most booked',
  },
  {
    key: 'medical-install',
    category: 'Done-with-you · 90 days',
    name: 'Medical-Team Installation',
    tagline: 'We install Wagner\'s medical-operator playbook in your practice.',
    priceLabel: '$25,000–$50,000',
    priceLow: 25_000, priceHigh: 50_000,
    duration: '90 days',
    format: 'On-site + weekly coaching',
    deliverable: 'Fully operational medical-team add-on at end of 90 days. Targeting +$250K EBITDA in year 1.',
    audience: 'DCs hitting 40+ new patients/mo who want the diagnostic billing + medical-team line WITHOUT selling. Keep 100% ownership, add a revenue line.',
    features: [
      'MD/NP hiring + credentialing handled',
      'Diagnostic billing setup (Medicare codes + commercial)',
      'EMR + practice management integration',
      'Compliance + malpractice coverage walk-through',
      'Weekly 1-on-1 with Wagner for 90 days',
      'Patient-flow scripts + handoff protocols',
      'Targeting +$250K EBITDA lift in year 1, +$400K by year 3',
    ],
    accent: '#C9A84C',
    badge: '⭐ Wagner signature',
  },
  {
    key: 'mastermind',
    category: 'Ongoing · annual',
    name: 'ChiroPillar Mastermind',
    tagline: '20–30 DCs scaling together. Quarterly in-person + monthly virtual.',
    priceLabel: '$12,000 / year',
    priceLow: 12_000, priceHigh: 12_000,
    duration: '12 months',
    format: '4 in-person retreats + 12 monthly calls',
    deliverable: 'Membership in Wagner\'s peer network of growth-stage DCs. Annual renewal.',
    audience: 'DCs doing $750K+ who want to scale without selling. Want peer accountability + Wagner-curated guest operators.',
    features: [
      '4 quarterly in-person retreats (rotating Wagner-territory cities)',
      '12 monthly group calls (90 min each)',
      'Private Slack with the cohort + Wagner',
      'Curated guest operators each quarter (HVAC roll-up CEO, medical-spa M&A operator, etc.)',
      'Annual goal-setting + accountability framework',
      'Discount on all other Scale Services packages (20%)',
    ],
    accent: '#2ECC8B',
  },
]

const fmtMoney = (n: number) => '$' + n.toLocaleString('en-US')

export default function ScaleServicesPage() {
  const totalLow = PACKAGES.reduce((s, p) => s + p.priceLow, 0)
  const projectedAnnualRevenue = 1_650_000  // illustrative · 4 calls/wk + 2 audits/mo + 8 installs/yr + 25 mastermind

  return (
    <div style={{ padding: '32px 32px 80px', maxWidth: 1280, margin: '0 auto', fontFamily: F.body, color: C.text }}>

      {/* HEADER */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontFamily: F.mono, fontSize: 11, color: C.gold, letterSpacing: '0.22em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 8 }}>
          Scale Services · Wagner Standalone Revenue
        </div>
        <h1 style={{ fontFamily: F.display, fontSize: 'clamp(34px, 4.5vw, 48px)', fontWeight: 700, margin: '0 0 8px', letterSpacing: '-0.02em' }}>
          Productized consulting — separate from the roll-up.
        </h1>
        <p style={{ fontSize: 16, color: C.muted, margin: 0, maxWidth: 820, lineHeight: 1.55 }}>
          A chiropractor doesn&apos;t have to sell to work with Dr. Wagner. Four packages — strategy calls, practice audits, medical-team installations, and the ChiroPillar Mastermind — productized with clear pricing, Stripe checkout, and Calendly auto-booking. Revenue routes to Wagner&apos;s account separately from acquisition pipeline.
        </p>
      </div>

      {/* PROJECTED ECONOMICS STRIP */}
      <div style={{
        background: `linear-gradient(135deg, rgba(46,204,139,0.08), ${C.bg3})`,
        border: `1px solid rgba(46,204,139,0.20)`, borderRadius: 14, padding: '22px 26px',
        marginBottom: 32, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 20,
      }}>
        <Econ label="Avg. revenue / customer" val="$8,200" sub="weighted across 4 packages" color={C.gold} />
        <Econ label="Margin per package"      val="78%"    sub="Wagner's time is the cost" color={C.green} />
        <Econ label="Year-1 revenue target"   val={fmtMoney(projectedAnnualRevenue)} sub="100 customers, mixed tier" color={C.gold} />
        <Econ label="Year-3 revenue target"   val="$4.2M"  sub="scaled cohort + masterminds" color={C.green} />
        <Econ label="EBITDA contribution"     val="~$1.3M / yr" sub="adds to combined platform"   color={C.goldLight} />
      </div>

      {/* PACKAGES GRID */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontFamily: F.mono, fontSize: 10, color: C.faint, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 14 }}>
          The 4 packages
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: 18 }}>
          {PACKAGES.map(p => (
            <div key={p.key} style={{
              background: C.bg2, border: `1px solid ${C.border}`, borderLeft: `4px solid ${p.accent}`,
              borderRadius: 14, padding: '24px 26px',
              display: 'flex', flexDirection: 'column',
              position: 'relative', overflow: 'hidden',
            }}>
              {p.badge && (
                <div style={{
                  position: 'absolute', top: 16, right: 16,
                  padding: '4px 10px', borderRadius: 6,
                  background: p.accent + '22', border: `1px solid ${p.accent}66`,
                  fontFamily: F.mono, fontSize: 9, fontWeight: 800, letterSpacing: '0.14em',
                  textTransform: 'uppercase', color: p.accent,
                }}>{p.badge}</div>
              )}

              <div style={{ fontFamily: F.mono, fontSize: 10, color: p.accent, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 800, marginBottom: 10 }}>
                {p.category}
              </div>

              <h3 style={{ fontFamily: F.display, fontSize: 22, fontWeight: 700, color: C.text, margin: '0 0 8px', letterSpacing: '-0.01em', lineHeight: 1.2 }}>
                {p.name}
              </h3>

              <p style={{ fontSize: 14, color: C.muted, fontStyle: 'italic', margin: '0 0 18px', lineHeight: 1.5 }}>
                {p.tagline}
              </p>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 14 }}>
                <span style={{ fontFamily: F.display, fontSize: 30, fontWeight: 800, color: p.accent, letterSpacing: '-0.02em', lineHeight: 1 }}>
                  {p.priceLabel}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr', gap: 6, fontSize: 12, marginBottom: 16, lineHeight: 1.55 }}>
                <span style={{ color: C.faint, fontFamily: F.mono, letterSpacing: '0.08em' }}>DURATION</span>
                <span style={{ color: C.text }}>{p.duration}</span>
                <span style={{ color: C.faint, fontFamily: F.mono, letterSpacing: '0.08em' }}>FORMAT</span>
                <span style={{ color: C.text }}>{p.format}</span>
              </div>

              <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.6, marginBottom: 16, fontStyle: 'italic', borderLeft: `2px solid ${C.border}`, paddingLeft: 12 }}>
                <strong style={{ color: C.text, fontStyle: 'normal' }}>Who it&apos;s for:</strong> {p.audience}
              </div>

              <ul style={{ margin: '0 0 18px', padding: 0, listStyle: 'none', flex: 1 }}>
                {p.features.map((f, i) => (
                  <li key={i} style={{ fontSize: 13, color: C.text, padding: '6px 0', display: 'flex', gap: 9, alignItems: 'flex-start', lineHeight: 1.5 }}>
                    <span style={{ flexShrink: 0, marginTop: 6, width: 5, height: 5, borderRadius: 999, background: p.accent }} />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
                <button type="button" style={{
                  flex: 1, padding: '12px 14px', borderRadius: 8, border: 'none',
                  background: p.accent, color: '#0B1B3E',
                  fontFamily: F.body, fontSize: 13, fontWeight: 800, cursor: 'pointer',
                  letterSpacing: '0.04em',
                }}>
                  Book {p.duration.includes('60') ? 'Call' : p.duration.includes('week') ? 'Audit' : p.duration.includes('month') ? 'Seat' : 'Slot'} →
                </button>
                <button type="button" style={{
                  padding: '12px 14px', borderRadius: 8,
                  background: 'transparent', border: `1px solid ${C.border}`,
                  color: C.muted, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  fontFamily: F.body,
                }}>
                  Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* WHY SEPARATE FROM ROLL-UP */}
      <div style={{
        background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 14,
        padding: '26px 30px', marginBottom: 24,
      }}>
        <div style={{ fontFamily: F.mono, fontSize: 10, color: C.gold, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 6 }}>
          Why Scale Services is separate from the roll-up
        </div>
        <h2 style={{ fontFamily: F.display, fontSize: 24, fontWeight: 600, margin: '0 0 16px', letterSpacing: '-0.01em' }}>
          Three reasons this is its own revenue line.
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 18 }}>
          <Reason
            num="01"
            title="Wagner's personal revenue"
            body="Roll-up acquisition pool ≠ Wagner's consulting fees. Scale Services revenue routes to Wagner directly — separate Stripe account, separate K-1. He keeps the upside of his time."
            accent={C.gold}
          />
          <Reason
            num="02"
            title="Captures the 'not_yet' chiros"
            body="The intake form qualifies most chiros as 'maybe' or 'not_yet.' Instead of losing them, route them into the Strategy Call or Practice Audit. Turns unqualified leads into paying customers."
            accent={C.align}
          />
          <Reason
            num="03"
            title="Demonstrates the playbook works"
            body="Every Medical-Team Installation that delivers +$250K EBITDA in year 1 is proof the ChiroPillar acquisition thesis is real. Documented results become acquisition collateral."
            accent={C.green}
          />
        </div>
      </div>

      {/* INTEGRATION ROADMAP */}
      <div style={{
        background: 'rgba(46,117,182,0.05)', border: '1px dashed rgba(46,117,182,0.30)',
        borderRadius: 12, padding: '22px 26px',
      }}>
        <div style={{ fontFamily: F.mono, fontSize: 10, color: C.align, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 14 }}>
          Integration roadmap · go-live checklist
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
          <RoadItem label="Stripe Checkout"    desc="Each package → one-click purchase. Receipt + calendar invite auto-sent." status="Phase 3 · 1 day" color={C.green} />
          <RoadItem label="Calendly auto-book" desc="Strategy Call slot → Wagner's calendar with prep doc emailed in advance."  status="Phase 3 · 4 hr"  color={C.green} />
          <RoadItem label="DocuSeal contracts" desc="Practice Audit + Medical-Team Install need an SOW + NDA. DocuSeal e-sign."   status="Phase 3 · 1 day" color={C.gold}  />
          <RoadItem label="Customer dashboard" desc="Mastermind members get a private cohort dashboard with content + Slack." status="Phase 3 · 2 days" color={C.align} />
          <RoadItem label="Revenue reporting"  desc="Per-package revenue + churn shown on /overview. Routes to Wagner directly." status="Phase 3 · 1 day" color={C.gold}  />
        </div>
        <div style={{ marginTop: 18, fontSize: 13, color: C.muted, lineHeight: 1.55 }}>
          <strong style={{ color: C.text }}>Estimated lift to combined platform EBITDA:</strong> $1.3M / yr by Year 3 from Scale Services alone — separate from the ChiroPillar acquisition pool but feeding the combined $45M+ target.
        </div>
      </div>

      <div style={{ marginTop: 28, padding: '16px 22px', background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.25)', borderRadius: 10, fontSize: 13, color: C.muted, lineHeight: 1.55 }}>
        <strong style={{ color: C.gold }}>For the demo:</strong> Scale Services pricing is locked. Stripe + Calendly integration ships in Phase 3 alongside the per-clinic data room. The Book buttons above will fire real checkout flows once payment is wired.{' '}
        <Link href="/overview" style={{ color: C.align, textDecoration: 'underline' }}>Back to Overview →</Link>
      </div>
    </div>
  )
}

function Econ({ label, val, sub, color }: { label: string; val: string; sub: string; color: string }) {
  return (
    <div>
      <div style={{ fontFamily: F.mono, fontSize: 10, color: C.faint, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 4 }}>{label}</div>
      <div style={{ fontFamily: F.display, fontSize: 24, fontWeight: 700, color, lineHeight: 1, marginBottom: 4 }}>{val}</div>
      <div style={{ fontFamily: F.mono, fontSize: 10, color: C.faint, letterSpacing: '0.04em' }}>{sub}</div>
    </div>
  )
}

function Reason({ num, title, body, accent }: { num: string; title: string; body: string; accent: string }) {
  return (
    <div style={{ background: C.bg3, border: `1px solid ${C.border}`, borderLeft: `3px solid ${accent}`, borderRadius: 10, padding: '18px 22px' }}>
      <div style={{ fontFamily: F.mono, fontSize: 11, color: accent, letterSpacing: '0.18em', fontWeight: 800, marginBottom: 8 }}>{num}</div>
      <div style={{ fontFamily: F.display, fontSize: 17, fontWeight: 600, color: C.text, marginBottom: 8, letterSpacing: '-0.01em' }}>{title}</div>
      <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.6 }}>{body}</div>
    </div>
  )
}

function RoadItem({ label, desc, status, color }: { label: string; desc: string; status: string; color: string }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{label}</span>
        <span style={{
          fontFamily: 'JetBrains Mono, monospace', fontSize: 9, padding: '2px 6px', borderRadius: 4,
          background: color + '22', color, letterSpacing: '0.08em', fontWeight: 700, textTransform: 'uppercase',
        }}>{status}</span>
      </div>
      <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.5 }}>{desc}</div>
    </div>
  )
}
