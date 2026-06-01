'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

function useTheme() {
  const [t, setT] = useState('dark')
  useEffect(() => {
    const obs = new MutationObserver(() => setT(document.documentElement.getAttribute('data-theme') || 'dark'))
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    setT(document.documentElement.getAttribute('data-theme') || 'dark')
    return () => obs.disconnect()
  }, [])
  return t
}

const C = {
  gold: 'var(--kb-accent)', green: 'var(--kb-green)', navy: 'var(--kb-bg)', navy2: 'var(--kb-bg-panel)',
  navy3: 'var(--kb-bg-surface)', text: 'var(--kb-text)', muted: 'var(--kb-text-secondary)', faint: 'var(--kb-text-muted)',
  border: 'var(--kb-border)',
}

const STEPS = [
  {
    num: '01',
    title: 'Seller Signs Up',
    subtitle: 'A business owner enters the platform through our seller page or a referral link.',
    href: '/onboarding',
    cta: 'See Onboarding',
    annotation: 'The seller chooses their role, creates an account with a magic link (no password), and lands in their personalized dashboard. Ambassadors who referred them are automatically tracked.',
    highlights: [
      'Magic link authentication. One click to get in.',
      'Seller or buyer role selection',
      'Ambassador referral tracking built in',
    ],
    color: C.gold,
  },
  {
    num: '02',
    title: 'Documents Uploaded',
    subtitle: 'Tax returns, P&Ls, and bank statements. The KB Deal Engine reads them automatically.',
    href: '/documents',
    cta: 'See Document Manager',
    annotation: 'The seller uploads up to 5 years of financials. Our AI extraction engine reads every page, identifies revenue, EBITDA, add backs, and flags data quality issues. No manual spreadsheet work.',
    highlights: [
      'Up to 5 years of tax returns, P&Ls, bank statements plus additional docs',
      'AI reads and extracts financials automatically',
      'Real time status: Uploading > Processing > Complete',
    ],
    color: C.gold,
  },
  {
    num: '03',
    title: 'Financial Analysis',
    subtitle: 'The AI engine normalizes EBITDA, identifies add backs, and builds a 3 year financial picture.',
    href: '/financials',
    cta: 'See Financial Analysis',
    annotation: 'Every number is extracted, normalized, and charted. Add backs are identified and explained. The seller sees their real earning power for the first time, not just what the tax return shows.',
    highlights: [
      'Revenue and EBITDA charted across up to 5 years',
      'Add backs identified with explanations',
      'Year over year trends flagged',
      'Data quality scores per document',
    ],
    color: C.green,
  },
  {
    num: '04',
    title: 'AI Valuation Built',
    subtitle: 'Real EBITDA multiples from recent transactions in their industry. Not a guess.',
    href: '/valuation',
    cta: 'See Valuation Dashboard',
    annotation: 'The platform applies industry specific EBITDA multiples from 2024-2025 transaction data. Conservative, target, and premium valuations are calculated. Deal structure recommendations are generated.',
    highlights: [
      'Industry specific multiples (25 industries)',
      'Conservative, target, and premium ranges',
      'Deal structure recommendation (SBA, seller note, equity rollover)',
      'AI narrative: "Your business story for buyers"',
    ],
    color: C.green,
  },
  {
    num: '05',
    title: 'CIM Generated',
    subtitle: 'A professional Confidential Information Memorandum built by our AI in 20 minutes.',
    href: '/cim',
    cta: 'See CIM Builder',
    annotation: 'CLAY, our AI CIM writer, interviews the seller through 5 guided rounds. It produces a 15-25 page professional CIM: business story, financials, team, growth opportunities, and risk factors. Exportable to PDF.',
    highlights: [
      'AI guided interview (5 rounds, ~20 minutes)',
      '15-25 page professional CIM',
      'Financials, team, operations, growth, risks',
      'PDF export ready for buyers',
    ],
    color: C.gold,
  },
  {
    num: '06',
    title: 'Buyers Matched',
    subtitle: '12 AI agents search, score, and match qualified buyers to the deal.',
    href: '/buyers',
    cta: 'See Matched Buyers',
    annotation: 'Our 12 agent AI pipeline searches across family offices, PE funds, search funds, and strategic buyers. Each buyer is scored on geography, check size, industry thesis, and financing likelihood. Personalized pitch emails are written automatically.',
    highlights: [
      'AI fit scoring (geography, check size, industry, financing)',
      'Family offices, PE funds, search funds, strategic buyers',
      'Personalized pitch emails written per buyer',
      '700+ buyers in our database and growing',
    ],
    color: C.green,
  },
  {
    num: '07',
    title: 'NDA Signed',
    subtitle: 'Interested buyers sign a one way NDA protecting the seller. All through the platform.',
    href: '/deal-stage',
    cta: 'See NDA & LOI',
    annotation: 'Kingdom Broker generates a professional NDA customized for each deal. One way protection: the buyer signs, the seller is protected. No contact clause ensures all communication goes through KB. Commission protection is built in.',
    highlights: [
      'One way NDA (buyer signs, seller protected)',
      'No contact clause with seller employees, customers, vendors',
      'Commission protection for 24 months',
      'Digital signature ready',
    ],
    color: C.gold,
  },
  {
    num: '08',
    title: 'LOI Submitted',
    subtitle: 'When a buyer is ready, they submit a Letter of Intent through the platform.',
    href: '/loi',
    cta: 'See LOI Generator',
    annotation: 'The LOI is generated in plain English, not legal jargon. It acknowledges what the seller built, explains every term clearly, and structures the deal for maximum value. The seller reviews and accepts or negotiates directly through the platform.',
    highlights: [
      'Plain English LOI (not legal jargon)',
      'Deal terms: price, structure, timeline, contingencies',
      'Seller reviews and responds in platform',
      'Full audit trail of negotiations',
    ],
    color: C.green,
  },
  {
    num: '09',
    title: 'Due Diligence & Close',
    subtitle: 'Deal pipeline tracks every step from LOI to closing day.',
    href: '/pipeline',
    cta: 'See Deal Pipeline',
    annotation: 'The deal pipeline provides full visibility: NDA signed, LOI accepted, due diligence in progress, purchase agreement drafted, closing scheduled. Both buyer and seller see where they are at every step. No black box.',
    highlights: [
      'Visual pipeline: NDA > LOI > Due Diligence > Purchase Agreement > Closed',
      'Document checklist per stage',
      'Activity feed with timestamps',
      'Estimated timeline to close',
    ],
    color: C.gold,
  },
  {
    num: '10',
    title: 'The KB Flywheel',
    subtitle: 'Every deal makes the next one faster. 9 compounding loops.',
    href: '/flywheel',
    cta: 'See The Flywheel',
    annotation: 'Kingdom Broker is not a traditional brokerage. It is a compounding deal intelligence platform. Every closed deal feeds richer data into the AI engine. Every buyer match sharpens the algorithm. Every seller exit funds the PE cash flow fund. 9 loops, all compounding.',
    highlights: [
      'Ben Kelly Acquisition Ace: 23,000+ buyer network',
      'Top Business Broker Partner: $1M-$100M seller referrals',
      'Dennis Yu: billion impression distribution',
      'AI Deal Engine gets smarter with every deal',
      'PE Cash Flow Fund: 40% of fees reinvested',
    ],
    color: C.gold,
  },
]

export default function DemoPage() {
  const theme = useTheme()
  const logoSrc = theme === 'dark' ? '/kb-logo.png' : '/kb-logo-dark.png'
  const [step, setStep] = useState(0)
  const current = STEPS[step]
  const progress = ((step + 1) / STEPS.length) * 100

  return (
    <div style={{ padding: '32px 36px', fontFamily: "'Inter', system-ui, sans-serif", color: C.text, maxWidth: '960px' }}>

      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoSrc} alt="Kingdom Broker" style={{ height: '32px' }} />
          <div style={{ fontSize: '11px', color: C.gold, fontWeight: 510, letterSpacing: '0.08em', textTransform: 'uppercase', background: 'var(--kb-accent-dim)', padding: '4px 12px', borderRadius: '4px', border: '1px solid var(--kb-accent-border)' }}>Platform Demo</div>
        </div>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '28px', fontWeight: 600, margin: '0 0 6px', letterSpacing: '-0.3px' }}>How a Deal Moves Through Kingdom Broker</h1>
        <p style={{ fontSize: '15px', color: C.muted, margin: 0, lineHeight: 1.5 }}>Click through each step to see how we take a business from first conversation to closed deal. Every step happens on this platform.</p>
      </div>

      {/* Progress bar */}
      <div style={{ height: '4px', background: 'var(--kb-bg-raised)', borderRadius: '9999px', marginBottom: '20px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${progress}%`, background: `linear-gradient(90deg, ${C.gold}, ${C.green})`, borderRadius: '9999px', transition: 'width 0.4s ease' }} />
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <button
          onClick={() => setStep(s => Math.max(0, s - 1))}
          disabled={step === 0}
          style={{ padding: '10px 22px', background: 'var(--kb-bg-card)', border: `1px solid ${step === 0 ? 'var(--kb-bg-raised)' : C.border}`, borderRadius: '6px', color: step === 0 ? C.faint : C.muted, fontSize: '14px', fontWeight: 510, cursor: step === 0 ? 'default' : 'pointer' }}
        >
          Previous
        </button>

        <div style={{ fontSize: '13px', color: C.muted }}>
          Step <span style={{ fontFamily: "'DM Mono', monospace", color: C.gold, fontWeight: 510 }}>{step + 1}</span> of <span style={{ fontFamily: "'DM Mono', monospace" }}>{STEPS.length}</span>
        </div>

        <button
          onClick={() => setStep(s => Math.min(STEPS.length - 1, s + 1))}
          disabled={step === STEPS.length - 1}
          style={{ padding: '10px 22px', background: step === STEPS.length - 1 ? 'rgba(255,255,255,0.02)' : C.gold, border: `1px solid ${step === STEPS.length - 1 ? 'var(--kb-bg-raised)' : C.gold}`, borderRadius: '6px', color: step === STEPS.length - 1 ? C.faint : 'var(--kb-bg)', fontSize: '14px', fontWeight: step === STEPS.length - 1 ? 510 : 590, cursor: step === STEPS.length - 1 ? 'default' : 'pointer', boxShadow: step === STEPS.length - 1 ? 'none' : 'rgba(201,168,76,0.25) 0px 2px 8px' }}
        >
          Next Step
        </button>
      </div>

      {/* Step dots */}
      <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', marginBottom: '24px' }}>
        {STEPS.map((_, i) => (
          <div
            key={i}
            onClick={() => setStep(i)}
            style={{ width: i === step ? '24px' : '8px', height: '8px', borderRadius: '4px', background: i <= step ? (i === step ? C.gold : C.green) : C.faint, cursor: 'pointer', transition: 'all 0.25s', opacity: i <= step ? 1 : 0.4 }}
          />
        ))}
      </div>

      {/* Main content card */}
      <div style={{ background: C.navy2, border: `1px solid ${C.border}`, borderRadius: '12px', overflow: 'hidden', marginBottom: '20px' }}>

        {/* Top stripe with step number and title */}
        <div style={{ background: `linear-gradient(135deg, ${current.color}10, ${C.navy3})`, borderBottom: `1px solid ${C.border}`, padding: '28px 32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: `${current.color}15`, border: `1px solid ${current.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Mono', monospace", fontSize: '18px', fontWeight: 510, color: current.color }}>
              {current.num}
            </div>
            <div>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '24px', fontWeight: 600, margin: 0, color: C.text }}>{current.title}</h2>
              <p style={{ fontSize: '15px', color: C.muted, margin: '4px 0 0', lineHeight: 1.5 }}>{current.subtitle}</p>
            </div>
          </div>
        </div>

        {/* Annotation */}
        <div style={{ padding: '24px 32px', borderBottom: `1px solid ${C.border}` }}>
          <p style={{ fontSize: '16px', color: C.text, lineHeight: 1.7, margin: 0 }}>{current.annotation}</p>
        </div>

        {/* Highlights */}
        <div style={{ padding: '24px 32px' }}>
          <div style={{ fontSize: '11px', color: C.faint, fontWeight: 510, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '14px' }}>Key Features</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {current.highlights.map((h, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <svg viewBox="0 0 14 14" width="16" height="16" fill="none" stroke={current.color} strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0, marginTop: '2px' }}><polyline points="3,7 6,10 11,4"/></svg>
                <span style={{ fontSize: '15px', color: C.muted, lineHeight: 1.5 }}>{h}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA to actual page */}
        <div style={{ padding: '0 32px 28px' }}>
          <Link href={current.href} style={{
            display: 'block', textAlign: 'center', padding: '14px', background: `${current.color}12`, border: `1px solid ${current.color}30`, borderRadius: '8px', color: current.color, fontSize: '14px', fontWeight: 590, textDecoration: 'none', transition: 'all 0.15s',
          }}>
            {current.cta}
          </Link>
        </div>
      </div>

      {/* All steps overview */}
      <div style={{ background: C.navy2, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '24px' }}>
        <div style={{ fontSize: '11px', color: C.faint, fontWeight: 510, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '16px' }}>Full Deal Flow</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
          {STEPS.map((s, i) => (
            <div
              key={s.num}
              onClick={() => setStep(i)}
              style={{
                padding: '12px 8px', borderRadius: '8px', textAlign: 'center', cursor: 'pointer',
                background: i === step ? `${s.color}12` : 'rgba(255,255,255,0.02)',
                border: `1px solid ${i === step ? `${s.color}30` : 'var(--kb-bg-raised)'}`,
                transition: 'all 0.15s',
              }}
            >
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '14px', fontWeight: 510, color: i <= step ? s.color : C.faint, marginBottom: '4px' }}>{s.num}</div>
              <div style={{ fontSize: '11px', color: i === step ? C.text : C.muted, fontWeight: i === step ? 510 : 400, lineHeight: 1.3 }}>{s.title}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Mission */}
      <div style={{ marginTop: '24px', textAlign: 'center', padding: '32px 24px', background: 'var(--kb-accent-dim)', border: '1px solid rgba(201,168,76,0.15)', borderRadius: '12px' }}>
        <div style={{ fontSize: '11px', color: C.gold, fontWeight: 510, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px' }}>Our Mission</div>
        <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '20px', fontWeight: 600, color: C.text, lineHeight: 1.4, margin: '0 0 8px' }}>To glorify Christ and serve 10,000 families in ten years.</p>
        <p style={{ fontSize: '14px', color: C.muted, margin: 0 }}>Exits that fund faith, build legacy, and match owners with buyers who share their values.</p>
      </div>
    </div>
  )
}
