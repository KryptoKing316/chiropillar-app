'use client'

// ChiroPillar self-demo guide · interactive stepper + live stats strip
// Mirrors the app.KingdomBroker.com walkthrough pattern, themed for the
// chiropractic-roll-up workflow.

import { useState } from 'react'
import Link from 'next/link'

type LiveStats = {
  totalIntakes: number
  qualified: number
  maybe: number
  notYet: number
  pipelineEbitda: number
  activeOutreach: number
  thisWeek: number
  states: number
  isDemo: boolean
}

const C = {
  bg: 'var(--kb-bg)', bg2: 'var(--kb-bg-panel)', bg3: 'var(--kb-bg-surface)',
  text: 'var(--kb-text)', muted: 'var(--kb-text-secondary)', faint: 'var(--kb-text-muted)',
  border: 'var(--kb-border)',
  spine: '#1F4E79', align: '#2E75B6', stone: '#EBD8A6', globe: '#9CC4E4',
  gold: '#C9A84C', goldLight: '#E8C96A',
  green: '#2ECC8B',
}
const F = {
  display: "'Playfair Display', Georgia, serif",
  body: "'Inter', system-ui, sans-serif",
  mono: "'JetBrains Mono', 'DM Mono', monospace",
}

const fmtMoney = (n: number): string => {
  if (n >= 1_000_000) return '$' + (n / 1_000_000).toFixed(2) + 'M'
  if (n >= 1_000) return '$' + Math.round(n / 1_000) + 'K'
  if (n > 0) return '$' + n
  return '$0'
}

// ── STEPS · ChiroPillar platform tabs in the order they're used ─────────────
const STEPS = [
  {
    num: '01',
    label: 'Overview',
    href: '/overview',
    color: C.gold,
    status: 'Soon',
    tagline: 'The ChiroPillar command center',
    what: 'Single screen with every number that matters: applicants this week, qualified pipeline, weighted EBITDA in motion, conversion funnel from intake → LOI → close, and the live platform-EBITDA tracker against the $20M+ ChiroPillar target.',
    features: [
      { title: 'Live KPI strip', desc: 'Total intakes · qualified count · pipeline value · weighted EBITDA · time-to-close — refreshed every hour from the database.' },
      { title: 'Conversion funnel', desc: 'Intake → Qualified → Called → LOI → Closed with stage-by-stage drop-off and root-cause notes for each stage.' },
      { title: 'Geographic heatmap', desc: 'US map of incoming applications by state. Density highlights regions ready for cluster acquisition (TX, AZ, the Carolinas first).' },
      { title: 'Activity feed', desc: 'Last 20 platform events — new applications, status changes, calls logged, term sheets sent.' },
      { title: 'Platform-EBITDA tracker', desc: 'Vertical thermometer: $25M Wagner base + acquired ChiroPillar EBITDA toward the $45M+ combined target.' },
    ],
    callout: 'This is the page Wagner opens first thing every morning. Everything else feeds data into this one summary.',
    visualKeys: ['totalIntakes', 'qualified', 'pipelineEbitda', 'activeOutreach', 'thisWeek', 'states'] as const,
  },
  {
    num: '02',
    label: 'Intake Submissions',
    href: '/targets',
    color: C.green,
    status: 'Live',
    tagline: 'Every chiropractor who has applied',
    what: 'Every chiropractor who has filled out the /intake form lands here as a row. Wagner\'s 7 qualification metrics are auto-scored on submit — qualified, maybe, or not yet — and an instant valuation band is calculated from the 158-comp set.',
    features: [
      { title: 'Auto-qualification verdict', desc: 'Each row gets a colored badge: ✓ Qualified (green), ◐ Maybe (gold), ◯ Not Yet (gray). Logic mirrors your exact spec from the strategy call.' },
      { title: 'Wagner\'s 7 metrics surfaced', desc: 'Gross revenue, net revenue, new patients/mo, retention, services offered, employee count, owner role — every column shown in the table.' },
      { title: 'Valuation band stored', desc: 'Each submission saves valuation_low / valuation_mid / valuation_high — calibrated to the 158 real-comp dataset (median 1.46× SDE).' },
      { title: 'Outreach status tracking', desc: 'New → Called → Scheduled → In Diligence → Offer → Closed. Status changes timestamp + log who moved the row.' },
      { title: 'Filter + sort', desc: 'Filter by state, qualification, status. Sort by recent, by score, by gross revenue. Find the next call instantly.' },
    ],
    callout: 'This is the surface that turns a $1/day ad spend into a qualified deal pipeline. Every applicant lands here pre-scored against your criteria.',
    visualKeys: ['totalIntakes', 'qualified', 'maybe', 'notYet', 'activeOutreach', 'states'] as const,
  },
  {
    num: '03',
    label: 'Deal Calculator',
    href: '/calculator',
    color: C.green,
    status: 'Live',
    tagline: 'The 158-comp roll-up math, live',
    what: 'Drag the sliders, pick the Practice Profile (Solo / Multi / Platform), watch the platform re-rate in real time. Every multiple is calibrated to N=102 real chiropractic practice sales — not industry article guesses.',
    features: [
      { title: 'Practice Profile selector', desc: 'Solo-DC (1.0–2.1× SDE) · Multi-DC (2.0–4.0× SDE) · Platform (5–10× EBITDA). Each profile pre-loads the comp band that matches.' },
      { title: 'Hide Rollup toggle', desc: 'Per your directive — "we don\'t want the client knowing their true value is really 10×." One toggle hides the platform-side rollup multiple from the seller view.' },
      { title: 'Seller payout breakdown', desc: 'Cash at close + seller note + ongoing profit share + optional rollover equity. The 4-stream total that beats their stand-alone alternative.' },
      { title: 'Exit scenarios', desc: 'Conservative 8× / Base 9× / Premium 10× exit modeled side-by-side. MOIC, IRR, and platform EV update live.' },
      { title: 'Comp set credibility line', desc: 'N=102 real practice sales · median 1.46× SDE · P25–P75 1.08–2.05× shown in-page. Defensible math you can hand a seller.' },
    ],
    callout: 'This is the page you walk every prospect through on screen-share. The math itself sells the partnership.',
    visualKeys: ['totalIntakes', 'qualified', 'pipelineEbitda'] as const,
  },
  {
    num: '04',
    label: 'AI Valuation',
    href: '/valuation',
    color: C.gold,
    status: 'Soon',
    tagline: '158-comp valuation, productized per clinic',
    what: 'Drop in 3 years of P&L + tax returns + bank statements. Claude extracts revenue, owner comp, normalizes EBITDA, identifies add-backs — then prices the practice against the live N=102 comp set.',
    features: [
      { title: 'PDF financial extraction', desc: 'Upload PDFs, Claude parses each document and produces a clean financial summary. No manual transcription.' },
      { title: 'Auto add-back detection', desc: 'AI flags owner comp, family payroll, personal vehicle, travel, one-time legal — the standard chiro add-back stack — with reasoning.' },
      { title: 'Comp-based valuation band', desc: 'Returns low/mid/high range calibrated to N=102 real sales. Same engine the public /intake uses, but with full 3-year normalization.' },
      { title: 'Deal-structure recommendation', desc: 'Claude suggests the cash / seller-note / profit-share / rollover-equity mix based on practice size and seller cash-flow needs.' },
      { title: 'Comparable transactions tab', desc: '10 closest comps from the N=102 set with revenue, SDE, multiple, sale year — defensible math, in 30 seconds.' },
    ],
    callout: 'This is what plugs into the Deal Calculator once a clinic moves past first call. Goes live Phase 2.',
    visualKeys: ['qualified', 'pipelineEbitda'] as const,
  },
  {
    num: '05',
    label: 'Acquisition Pipeline',
    href: '/pipeline',
    color: C.gold,
    status: 'Soon',
    tagline: 'Every clinic, every stage, on one board',
    what: 'Kanban + timeline view of the chiropractic roll-up pipeline. Each card is a clinic moving through New → Called → Scheduled → Diligence → LOI → Closed. Drag between columns to update status.',
    features: [
      { title: 'Kanban pipeline board', desc: 'Six columns matching the outreach_status enum. Drag forward → DB updates + activity log captures who moved it.' },
      { title: 'Per-clinic timeline', desc: 'Click any clinic to see the full audit history: intake → call → financials → term sheet → signature → close.' },
      { title: 'Weighted-EBITDA forecast', desc: 'Each stage has a probability weight. Platform shows projected EBITDA closing this quarter, by clinic.' },
      { title: 'Assignment + handoff', desc: 'Wagner runs clinical diligence, McGrath runs ops, Eric runs structure. Handoff notifications fire on stage transitions.' },
      { title: 'Slack / SMS alerts', desc: 'New qualified intake → Wagner + Eric notified. Clinic enters LOI → all three get an alert. Configurable per stage.' },
    ],
    callout: 'The board Wagner + McGrath + Eric all check daily. No clinic falls through the cracks.',
    visualKeys: ['qualified', 'activeOutreach', 'pipelineEbitda', 'thisWeek'] as const,
  },
  {
    num: '06',
    label: 'Per-Clinic Data Room',
    href: '/data-room',
    color: C.gold,
    status: 'Soon',
    tagline: 'One secure room per clinic. NDA-gated.',
    what: 'Each clinic in active diligence gets its own data room: tax returns, P&Ls, bank statements, lease, malpractice records, license verifications, NDAs, term sheets — all in one place, fully access-controlled.',
    features: [
      { title: 'Document upload + AI extraction', desc: 'Seller uploads PDFs, Claude extracts structured financial data, populates the AI Valuation engine automatically.' },
      { title: 'Granular access control', desc: 'Wagner sees clinical/ops. Eric sees structure/legal. McGrath sees ops/playbook. Sellers see only what we choose to share.' },
      { title: 'Watermarked downloads', desc: 'Every document downloaded gets a per-user watermark with timestamp. Leakage is traceable.' },
      { title: 'NDA-gated entry', desc: 'Outside diligence teams (lenders, lawyers, lender accountants) sign DocuSeal NDA before any room access.' },
      { title: 'Diligence checklist', desc: 'Standard chiropractic-acquisition diligence checklist auto-applied. System blocks LOI until critical items clear.' },
    ],
    callout: 'Phase 3, post-term-sheet. The room each acquired clinic lives in until close.',
    visualKeys: ['qualified', 'activeOutreach'] as const,
  },
  {
    num: '07',
    label: 'Scale Services',
    href: '/scale',
    color: C.align,
    status: 'Soon',
    tagline: 'Wagner\'s consulting catalog · productized',
    what: 'Standalone packages chiropractors can purchase without joining the roll-up partnership. You monetize the playbook directly: consulting calls, masterminds, full operating-system installs, and the medical-team add-on as a service.',
    features: [
      { title: 'Stripe checkout per package', desc: 'One-click purchase. Receipts auto-generated. Revenue per package + per buyer in the Scale Services dashboard.' },
      { title: 'Strategy Call · $500–2,500', desc: '60-min 1:1 with Wagner. Practice diagnostics, growth bottlenecks, medical-team feasibility. Calendly auto-booking, recorded.' },
      { title: 'Practice Audit · $5,000–10,000', desc: 'Multi-day diagnostic: P&L review, KPI assessment, medical-team feasibility, written report + 90-day action plan.' },
      { title: 'Medical-Team Installation · $25,000–50,000', desc: 'Wagner team installs the medical-operator playbook in the buyer\'s practice over 90 days: credentialing, billing, hiring, compliance.' },
      { title: 'ChiroPillar Mastermind · $12,000/yr', desc: 'Quarterly in-person + monthly group calls. 20–30 chiropractors who want to scale without selling.' },
    ],
    callout: 'A separate revenue line from the roll-up. Even the chiropractors who don\'t qualify for partnership become Scale Services customers.',
    visualKeys: ['totalIntakes', 'notYet', 'maybe'] as const,
  },
  {
    num: '08',
    label: 'Outreach Campaigns',
    href: '/outreach',
    color: C.align,
    status: 'Soon',
    tagline: 'Drip on every applicant. Never lose a maybe.',
    what: 'Multi-channel outreach automation built around the chiropillar_targets table. Every intake triggers a personalized sequence — qualified, maybe, and not-yet leads each get their own track.',
    features: [
      { title: 'Email drip · Resend', desc: 'Day 0 thank-you with valuation band → Day 3 case study → Day 7 calendar link → Day 14 Wagner personal note. Each step editable.' },
      { title: 'SMS · Twilio', desc: 'Optional opt-in SMS reminder 24 hrs before a scheduled call. Reduces no-shows from chiros who forget after submitting.' },
      { title: 'Auto-dial integration', desc: 'Qualified intakes get added to an Instantly / Aircall dialer queue. McGrath\'s team gets a list with valuation context attached.' },
      { title: 'A/B test framework', desc: 'Try two pitch angles — financial vs. "be a better doctor" — let conversion data pick which gets promoted.' },
      { title: 'Re-engagement for "not yet"', desc: '90-day nurture: $1/day marketing playbook, growth tips, then re-application invite once they hit 40+ new patients/mo.' },
    ],
    callout: 'The flywheel. Once this is on, every applicant — qualified or not — generates measurable value.',
    visualKeys: ['totalIntakes', 'maybe', 'notYet', 'thisWeek'] as const,
  },
]

function statValue(key: string, stats: LiveStats): { val: string; color: string; label: string } {
  switch (key) {
    case 'totalIntakes':   return { label: 'Total Intakes',      val: String(stats.totalIntakes),       color: C.gold }
    case 'qualified':      return { label: 'Qualified',          val: String(stats.qualified),          color: C.green }
    case 'maybe':          return { label: 'Maybe',              val: String(stats.maybe),              color: C.gold }
    case 'notYet':         return { label: 'Not Yet',            val: String(stats.notYet),             color: C.muted }
    case 'pipelineEbitda': return { label: 'Pipeline Value',     val: fmtMoney(stats.pipelineEbitda),   color: C.gold }
    case 'activeOutreach': return { label: 'Active Outreach',    val: String(stats.activeOutreach),     color: C.align }
    case 'thisWeek':       return { label: 'This Week',          val: String(stats.thisWeek),           color: C.green }
    case 'states':         return { label: 'States Represented', val: String(stats.states),             color: C.align }
    default:               return { label: key, val: '—', color: C.muted }
  }
}

export default function WalkthroughClient({ stats }: { stats: LiveStats }) {
  const [step, setStep] = useState(0)
  const current = STEPS[step]

  return (
    <div style={{ padding: '32px 32px 80px', fontFamily: F.body, color: C.text, maxWidth: 1100, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontFamily: F.mono, fontSize: 11, color: C.align, letterSpacing: '0.22em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 8 }}>
          Self-Demo Guide
        </div>
        <h1 style={{ fontFamily: F.display, fontSize: 'clamp(32px, 4.5vw, 44px)', fontWeight: 700, margin: '0 0 8px', letterSpacing: '-0.02em', color: C.text }}>
          How the ChiroPillar platform works
        </h1>
        <p style={{ fontSize: 16, color: C.muted, margin: 0, maxWidth: 760, lineHeight: 1.6 }}>
          A plain-English tour of every tab. {stats.isDemo ? 'Numbers below are sample data from the demo session.' : 'All numbers are live from the production database.'}
        </p>
      </div>

      {/* LIVE STATS STRIP — mirrors app.KingdomBroker.com pattern */}
      <div style={{
        background: `linear-gradient(135deg, rgba(46,117,182,0.08) 0%, ${C.bg3} 100%)`,
        border: `1px solid ${C.border}`, borderRadius: 14, padding: '20px 24px',
        marginBottom: 32, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 18,
      }}>
        <StatPill label="Total Intakes"      val={String(stats.totalIntakes)}            color={C.gold}  isDemo={stats.isDemo} />
        <StatPill label="Qualified"          val={String(stats.qualified)}               color={C.green} isDemo={stats.isDemo} />
        <StatPill label="Maybe"              val={String(stats.maybe)}                   color={C.gold}  isDemo={stats.isDemo} />
        <StatPill label="Pipeline EBITDA"    val={fmtMoney(stats.pipelineEbitda)}        color={C.gold}  isDemo={stats.isDemo} />
        <StatPill label="Active Outreach"    val={String(stats.activeOutreach)}          color={C.align} isDemo={stats.isDemo} />
        <StatPill label="This Week"          val={String(stats.thisWeek)}                color={C.green} isDemo={stats.isDemo} />
        <StatPill label="States"             val={String(stats.states)}                  color={C.align} isDemo={stats.isDemo} />
      </div>

      {/* STEP NAV PILLS */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 24 }}>
        {STEPS.map((s, i) => (
          <button
            key={s.num}
            onClick={() => setStep(i)}
            style={{
              padding: '7px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
              fontFamily: F.body, fontSize: 12, fontWeight: step === i ? 700 : 500,
              background: step === i ? s.color : 'rgba(255,255,255,0.04)',
              color: step === i ? C.bg : C.muted,
              transition: 'all 0.15s',
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            <span style={{ fontFamily: F.mono, fontSize: 10, opacity: 0.7 }}>{s.num}</span>
            {s.label}
            {s.status === 'Live' && step !== i && (
              <span style={{ fontSize: 8, fontWeight: 800, padding: '1px 5px', borderRadius: 3, background: 'rgba(46,204,139,0.15)', color: C.green, letterSpacing: '0.08em' }}>LIVE</span>
            )}
          </button>
        ))}
      </div>

      {/* PREV/NEXT controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <button
          onClick={() => setStep(s => Math.max(0, s - 1))}
          disabled={step === 0}
          style={{ padding: '9px 22px', background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.border}`, borderRadius: 8, color: step === 0 ? C.faint : C.muted, fontSize: 13, fontWeight: 600, cursor: step === 0 ? 'default' : 'pointer', fontFamily: F.body }}
        >
          ← Previous
        </button>
        <div style={{ display: 'flex', gap: 7, alignItems: 'center' }}>
          {STEPS.map((_, i) => (
            <div
              key={i}
              onClick={() => setStep(i)}
              style={{ width: i === step ? 24 : 7, height: 7, borderRadius: 4, background: i === step ? current.color : C.faint, cursor: 'pointer', transition: 'all 0.2s' }}
            />
          ))}
        </div>
        <button
          onClick={() => setStep(s => Math.min(STEPS.length - 1, s + 1))}
          disabled={step === STEPS.length - 1}
          style={{ padding: '9px 22px', background: step === STEPS.length - 1 ? 'rgba(255,255,255,0.02)' : current.color, border: `1px solid ${step === STEPS.length - 1 ? C.border : current.color}`, borderRadius: 8, color: step === STEPS.length - 1 ? C.faint : C.bg, fontSize: 13, fontWeight: 700, cursor: step === STEPS.length - 1 ? 'default' : 'pointer', fontFamily: F.body }}
        >
          Next →
        </button>
      </div>

      {/* MAIN CARD */}
      <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 14, overflow: 'hidden', marginBottom: 24 }}>

        {/* Top stripe */}
        <div style={{ background: `linear-gradient(135deg, ${current.color}14, ${C.bg3})`, borderBottom: `1px solid ${C.border}`, padding: '26px 32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
            <div style={{ fontFamily: F.mono, fontSize: 11, color: current.color, letterSpacing: '0.20em', background: `${current.color}18`, border: `1px solid ${current.color}40`, padding: '4px 12px', borderRadius: 6 }}>
              TAB {current.num}
            </div>
            {current.status === 'Live' ? (
              <span style={{ fontSize: 10, fontWeight: 800, padding: '4px 9px', borderRadius: 4, background: 'rgba(46,204,139,0.18)', color: C.green, letterSpacing: '0.16em', textTransform: 'uppercase' }}>● Live</span>
            ) : (
              <span style={{ fontSize: 10, fontWeight: 800, padding: '4px 9px', borderRadius: 4, background: 'rgba(201,168,76,0.15)', color: C.gold, letterSpacing: '0.16em', textTransform: 'uppercase' }}>◐ Soon</span>
            )}
            <div style={{ flex: 1, height: 1, background: `${current.color}30` }} />
            <Link
              href={current.href}
              style={{ padding: '8px 20px', background: current.color, color: C.bg, borderRadius: 8, fontSize: 13, fontWeight: 700, textDecoration: 'none', fontFamily: F.body }}
            >
              Open Tab →
            </Link>
          </div>
          <h2 style={{ fontFamily: F.display, fontSize: 32, fontWeight: 600, margin: '0 0 6px', letterSpacing: '-0.02em', color: C.text }}>
            {current.label}
          </h2>
          <div style={{ fontSize: 17, color: current.color, fontWeight: 500, fontStyle: 'italic', margin: '0 0 14px' }}>
            {current.tagline}
          </div>
          <p style={{ fontSize: 15, color: C.muted, margin: 0, lineHeight: 1.75, maxWidth: 720 }}>
            {current.what}
          </p>
        </div>

        {/* Body split: features on left, numbers on right */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 300px', gap: 0 }} className="walk-body">

          {/* Features list */}
          <div style={{ padding: '28px 32px', borderRight: `1px solid ${C.border}` }}>
            <div style={{ fontFamily: F.mono, fontSize: 10, color: C.faint, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 18 }}>
              What this tab does
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {current.features.map((f, i) => (
                <div key={i} style={{ display: 'flex', gap: 14, paddingBottom: 18, marginBottom: 18, borderBottom: i < current.features.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                  <div style={{ width: 26, height: 26, borderRadius: 7, background: `${current.color}15`, border: `1px solid ${current.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1, fontFamily: F.mono, fontSize: 11, fontWeight: 700, color: current.color }}>
                    {String(i + 1).padStart(2, '0')}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 4 }}>{f.title}</div>
                    <div style={{ fontSize: 13.5, color: C.muted, lineHeight: 1.7 }}>{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ background: `${current.color}0d`, border: `1px solid ${current.color}30`, borderRadius: 10, padding: '16px 18px', marginTop: 6 }}>
              <div style={{ fontFamily: F.mono, fontSize: 10, color: current.color, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 8 }}>
                Why this matters
              </div>
              <p style={{ fontSize: 13.5, color: C.text, margin: 0, lineHeight: 1.7 }}>{current.callout}</p>
            </div>
          </div>

          {/* Right panel — live numbers */}
          <div style={{ padding: '28px 24px', background: C.bg3 }}>
            <div style={{ fontFamily: F.mono, fontSize: 10, color: C.faint, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 16 }}>
              {stats.isDemo ? 'Demo numbers' : 'Live numbers'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
              {current.visualKeys.map((k, i) => {
                const v = statValue(k, stats)
                return (
                  <div key={i} style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 9, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div style={{ fontSize: 10, color: C.faint, fontFamily: F.mono, letterSpacing: '0.10em', textTransform: 'uppercase', fontWeight: 600 }}>{v.label}</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: v.color, fontFamily: F.display }}>{v.val}</div>
                  </div>
                )
              })}
            </div>

            <Link
              href={current.href}
              style={{ display: 'block', textAlign: 'center', padding: '12px', background: `${current.color}15`, border: `1px solid ${current.color}40`, borderRadius: 9, color: current.color, fontSize: 13, fontWeight: 700, textDecoration: 'none', fontFamily: F.body }}
            >
              Open {current.label} →
            </Link>
          </div>
        </div>
      </div>

      {/* QUICK REF GRID */}
      <div style={{ marginTop: 36, background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 12, padding: 24 }}>
        <div style={{ fontFamily: F.mono, fontSize: 10, color: C.faint, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 18 }}>
          All tabs · quick reference
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px,1fr))', gap: 12 }}>
          {STEPS.map((s, i) => (
            <Link key={s.num} href={s.href} style={{ textDecoration: 'none' }}>
              <div
                onClick={() => setStep(i)}
                style={{ padding: '14px 16px', background: step === i ? `${s.color}10` : C.bg3, border: `1px solid ${step === i ? s.color + '40' : C.border}`, borderRadius: 10, cursor: 'pointer', transition: 'all 0.15s', height: '100%' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span style={{ fontFamily: F.mono, fontSize: 10, color: s.color, fontWeight: 700 }}>{s.num}</span>
                  {s.status === 'Live' && (
                    <span style={{ fontSize: 8, fontWeight: 800, padding: '1px 5px', borderRadius: 3, background: 'rgba(46,204,139,0.15)', color: C.green, letterSpacing: '0.08em' }}>LIVE</span>
                  )}
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: step === i ? s.color : C.text, marginBottom: 4 }}>{s.label}</div>
                <div style={{ fontSize: 12, color: C.faint, lineHeight: 1.5 }}>{s.tagline}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

function StatPill({ label, val, color, isDemo }: { label: string; val: string; color: string; isDemo: boolean }) {
  return (
    <div>
      <div style={{ fontFamily: F.mono, fontSize: 10, color: C.faint, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
        {label}
        <span style={{
          width: 5, height: 5, borderRadius: 999,
          background: isDemo ? C.gold : C.green,
          boxShadow: `0 0 8px ${isDemo ? C.gold : C.green}`,
        }} />
      </div>
      <div style={{ fontSize: 22, fontWeight: 700, color, fontFamily: F.display }}>{val}</div>
    </div>
  )
}
