'use client'

// ---------------------------------------------------------------------------
// /admin/stewardship-model — INTERNAL ONLY
// Kingdom Broker × Firma Labs · Stewardship Acquisition Model · v5
// The end-goal vision of Kingdom Broker. Saved here for reference until
// Firma Labs funds the implementation. Full source markdown lives at
// docs/stewardship-acquisition-model.md
// ---------------------------------------------------------------------------

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const SECTIONS = [
  { n: '00', title: 'A note on language' },
  { n: '01', title: 'The model in one paragraph' },
  { n: '02', title: 'Debt vs. stewardship' },
  { n: '03', title: 'How a deal moves' },
  { n: '04', title: 'Ownership earned' },
  { n: '05', title: 'Four participants' },
  { n: '06', title: 'The flourishing flywheel' },
  { n: '07', title: 'Why the business runs better' },
  { n: '08', title: 'The open door' },
  { n: '09', title: 'Where Kingdom Brokers fits' },
  { n: '10', title: 'The five principles' },
  { n: '11', title: 'Next steps' },
]

const PALETTE = {
  navy: '#0B1B3E',
  navy2: '#0F2347',
  navy3: '#152C58',
  gold: '#C9A84C',
  goldLight: '#FFD66E',
  cream: '#F2EEE7',
  muted: '#9BA8C0',
  faint: '#4A5880',
  green: '#2ECC8B',
}

// ─── Small helpers ─────────────────────────────────────────────────────────

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontFamily: "'DM Mono', monospace",
        fontSize: '10px',
        letterSpacing: '0.24em',
        textTransform: 'uppercase',
        color: PALETTE.gold,
        marginBottom: '8px',
      }}
    >
      {children}
    </div>
  )
}

function SectionWrap({
  id,
  num,
  eyebrow,
  title,
  children,
}: {
  id: string
  num: string
  eyebrow: string
  title: string
  children: React.ReactNode
}) {
  return (
    <section
      id={id}
      style={{
        padding: '64px 0',
        borderBottom: '1px solid rgba(201,168,76,0.12)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: '20px',
          marginBottom: '8px',
        }}
      >
        <span
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: '11px',
            letterSpacing: '0.2em',
            color: PALETTE.gold,
            border: `1px solid ${PALETTE.gold}55`,
            padding: '3px 10px',
            borderRadius: '4px',
          }}
        >
          [{num}/11]
        </span>
        <Eyebrow>Section {num} · {eyebrow}</Eyebrow>
      </div>
      <h2
        style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 'clamp(28px, 3.4vw, 40px)',
          fontWeight: 700,
          color: PALETTE.cream,
          letterSpacing: '-0.015em',
          lineHeight: 1.1,
          margin: '0 0 24px',
        }}
      >
        {title}
      </h2>
      {children}
    </section>
  )
}

function PullQuote({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontFamily: "'Playfair Display', serif",
        fontStyle: 'italic',
        fontSize: '22px',
        lineHeight: 1.4,
        color: PALETTE.cream,
        borderLeft: `3px solid ${PALETTE.gold}`,
        paddingLeft: '20px',
        margin: '24px 0 28px',
      }}
    >
      {children}
    </div>
  )
}

function Body({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        fontSize: '16.5px',
        lineHeight: 1.72,
        color: 'rgba(242,238,231,0.86)',
        marginBottom: '18px',
      }}
    >
      {children}
    </p>
  )
}

function CompareTable({ left, right, leftTitle, rightTitle }: {
  left: string[]
  right: string[]
  leftTitle: string
  rightTitle: string
}) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '0',
        background: 'rgba(255,255,255,0.02)',
        border: `1px solid ${PALETTE.gold}22`,
        borderRadius: '12px',
        overflow: 'hidden',
        margin: '20px 0',
      }}
    >
      <div style={{ padding: '14px 22px', background: 'rgba(232,73,73,0.06)', borderBottom: `1px solid ${PALETTE.gold}22`, borderRight: `1px solid ${PALETTE.gold}15` }}>
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '10px', letterSpacing: '0.16em', textTransform: 'uppercase', color: '#E84949' }}>
          {leftTitle}
        </div>
      </div>
      <div style={{ padding: '14px 22px', background: 'rgba(46,204,139,0.06)', borderBottom: `1px solid ${PALETTE.gold}22` }}>
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '10px', letterSpacing: '0.16em', textTransform: 'uppercase', color: PALETTE.green }}>
          {rightTitle}
        </div>
      </div>
      {left.map((l, i) => (
        <div key={`row-${i}`} style={{ display: 'contents' }}>
          <div style={{ padding: '14px 22px', fontSize: '14.5px', color: 'rgba(242,238,231,0.78)', lineHeight: 1.55, borderTop: i === 0 ? 'none' : `1px solid ${PALETTE.gold}10`, borderRight: `1px solid ${PALETTE.gold}15` }}>
            {l}
          </div>
          <div style={{ padding: '14px 22px', fontSize: '14.5px', color: 'rgba(242,238,231,0.92)', lineHeight: 1.55, borderTop: i === 0 ? 'none' : `1px solid ${PALETTE.gold}10` }}>
            {right[i]}
          </div>
        </div>
      ))}
    </div>
  )
}

function NumberedStep({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
      <div
        style={{
          flexShrink: 0,
          width: '38px',
          height: '38px',
          borderRadius: '50%',
          background: `${PALETTE.gold}18`,
          border: `1px solid ${PALETTE.gold}55`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: "'DM Mono', monospace",
          fontSize: '13px',
          color: PALETTE.gold,
          fontWeight: 600,
        }}
      >
        {n}
      </div>
      <div>
        <div
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: '18px',
            color: PALETTE.cream,
            marginBottom: '4px',
            fontWeight: 600,
          }}
        >
          {title}
        </div>
        <div style={{ fontSize: '14.5px', lineHeight: 1.65, color: 'rgba(242,238,231,0.75)' }}>
          {body}
        </div>
      </div>
    </div>
  )
}

function ParticipantCard({ role, title, body }: { role: string; title: string; body: string }) {
  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: `1px solid ${PALETTE.gold}25`,
        borderRadius: '14px',
        padding: '24px',
      }}
    >
      <div
        style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: '10px',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: PALETTE.gold,
          marginBottom: '4px',
        }}
      >
        {role}
      </div>
      <div
        style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: '22px',
          fontWeight: 700,
          color: PALETTE.cream,
          marginBottom: '10px',
        }}
      >
        {title}
      </div>
      <div style={{ fontSize: '14px', color: 'rgba(242,238,231,0.78)', lineHeight: 1.6 }}>
        {body}
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────

export default function StewardshipModelPage() {
  const router = useRouter()
  const [authState, setAuthState] = useState<'checking' | 'allowed' | 'denied'>('checking')

  useEffect(() => {
    let alive = true
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((data) => {
        if (!alive) return
        // /api/auth/me returns { email, isAdmin, isDemo, role } at top level —
        // NOT wrapped in a .user object. Check both isAdmin flag and role string.
        if (data?.isAdmin === true || data?.role === 'admin') setAuthState('allowed')
        else setAuthState('denied')
      })
      .catch(() => {
        if (alive) setAuthState('denied')
      })
    return () => {
      alive = false
    }
  }, [])

  if (authState === 'checking') {
    return (
      <div style={{ padding: '60px 32px', color: PALETTE.muted, fontFamily: "'DM Mono', monospace", fontSize: '13px' }}>
        Verifying access…
      </div>
    )
  }

  if (authState === 'denied') {
    return (
      <div
        style={{
          padding: '80px 32px',
          textAlign: 'center',
          color: PALETTE.muted,
          fontFamily: "'DM Sans', sans-serif",
          maxWidth: '560px',
          margin: '0 auto',
        }}
      >
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#E84949', marginBottom: '12px' }}>
          Restricted · Admin Only
        </div>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '28px', color: PALETTE.cream, marginBottom: '12px' }}>
          Access not authorized
        </h2>
        <p style={{ color: 'rgba(242,238,231,0.7)', marginBottom: '24px' }}>
          This page is internal to Kingdom Broker × Firma Labs. If you should have access, contact Eric.
        </p>
        <button
          type="button"
          onClick={() => router.push('/overview')}
          style={{
            background: PALETTE.gold,
            color: PALETTE.navy,
            padding: '11px 22px',
            borderRadius: '8px',
            border: 'none',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Back to Dashboard
        </button>
      </div>
    )
  }

  return (
    <div
      style={{
        background: PALETTE.navy,
        minHeight: '100vh',
        color: PALETTE.cream,
        fontFamily: "'DM Sans', system-ui, sans-serif",
      }}
    >
      {/* ── Sticky internal banner ── */}
      <div
        style={{
          background: 'rgba(232,73,73,0.10)',
          borderBottom: `1px solid rgba(232,73,73,0.30)`,
          padding: '10px 32px',
          fontFamily: "'DM Mono', monospace",
          fontSize: '11px',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: '#E84949',
          textAlign: 'center',
        }}
      >
        Internal · Kingdom Broker × Firma Labs · Vision Document · Do Not Share Externally
      </div>

      {/* ── Container with side TOC + content ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '240px 1fr',
          gap: '48px',
          maxWidth: '1240px',
          margin: '0 auto',
          padding: '48px 32px 120px',
        }}
      >
        {/* ── Sticky TOC ── */}
        <aside
          style={{
            position: 'sticky',
            top: '24px',
            alignSelf: 'start',
            maxHeight: 'calc(100vh - 48px)',
            overflowY: 'auto',
          }}
        >
          <Eyebrow>Contents</Eyebrow>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '18px', color: PALETTE.cream, marginBottom: '14px', fontWeight: 600 }}>
            The Stewardship Acquisition Model
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {SECTIONS.map((s) => (
              <a
                key={s.n}
                href={`#sec-${s.n}`}
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '12.5px',
                  color: 'rgba(242,238,231,0.65)',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  display: 'flex',
                  gap: '10px',
                  transition: 'all .15s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(201,168,76,0.08)'
                  e.currentTarget.style.color = PALETTE.gold
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = 'rgba(242,238,231,0.65)'
                }}
              >
                <span style={{ fontFamily: "'DM Mono', monospace", color: PALETTE.gold, opacity: 0.7 }}>{s.n}</span>
                <span>{s.title}</span>
              </a>
            ))}
          </div>
          <div style={{ marginTop: '24px', fontSize: '11px', fontFamily: "'DM Mono', monospace", color: PALETTE.faint, letterSpacing: '0.1em', lineHeight: 1.7 }}>
            v5 · 2026-05-27<br />
            Eric Skeldon<br />
            Firma Sovereign Foundation
          </div>
        </aside>

        {/* ── Main content ── */}
        <main>
          {/* HERO */}
          <header style={{ paddingBottom: '40px', borderBottom: `1px solid rgba(201,168,76,0.18)`, marginBottom: '20px' }}>
            <Eyebrow>Kingdom Brokers × Firma · Working Build · v5</Eyebrow>
            <h1
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 'clamp(36px, 5vw, 60px)',
                fontWeight: 700,
                color: PALETTE.cream,
                letterSpacing: '-0.02em',
                lineHeight: 1.05,
                margin: '8px 0 0',
              }}
            >
              The Stewardship
              <br />
              <span style={{ color: PALETTE.gold, fontStyle: 'italic' }}>Acquisition Model</span>
            </h1>
            <div
              style={{
                marginTop: '28px',
                fontFamily: "'Playfair Display', serif",
                fontStyle: 'italic',
                fontSize: '22px',
                color: PALETTE.cream,
                lineHeight: 1.4,
                maxWidth: '720px',
              }}
            >
              We buy the business outright. Then we give it back — to whoever will steward it.
            </div>
            <p style={{ marginTop: '24px', fontSize: '16px', color: 'rgba(242,238,231,0.78)', lineHeight: 1.7, maxWidth: '720px' }}>
              Eric built Kingdom Brokers to help owners of established businesses exit with excellence. This is that engine on Firma rails:{' '}
              <strong style={{ color: PALETTE.gold }}>no debt, no interest, no balloon</strong> hanging over anyone. The owner is paid in full and walks away whole. The business comes onto the substrate. And the person who takes it over earns ownership by stewarding it well — not by spending a decade paying down a loan.
            </p>

            {/* Pills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '28px' }}>
              {['Sovereign Wealth Fund · the buyer', 'No debt · No interest · No personal guarantee', 'Risk on us, not the steward'].map((t) => (
                <span key={t} style={{ fontFamily: "'DM Mono', monospace", fontSize: '10.5px', letterSpacing: '0.14em', textTransform: 'uppercase', color: PALETTE.gold, border: `1px solid ${PALETTE.gold}45`, padding: '6px 12px', borderRadius: '999px', background: `${PALETTE.gold}10` }}>
                  {t}
                </span>
              ))}
            </div>
          </header>

          {/* SECTION 00 */}
          <SectionWrap id="sec-00" num="00" eyebrow="Why the words matter" title="A note on language">
            <PullQuote>The world&rsquo;s vocabulary encodes the world&rsquo;s extraction.</PullQuote>
            <Body>
              The acquisition market runs on words that carry a worldview: <em>acquire, loan, underwrite, foreclose, exit, buy out, leverage</em>. Each one assumes a person&rsquo;s life&rsquo;s work is a commodity to be bought, levered, and resold — and that whoever takes it over does so as a debtor.
            </Body>
            <Body>
              Where this document describes the worldly stack, it uses the world&rsquo;s words, because you need to recognize what we replace. Where it describes what Firma does, it uses our words: <strong style={{ color: PALETTE.gold }}>steward, provision, ownership earned, generosity, flourishing</strong>. Not euphemism — precision. The mechanic is genuinely different, so the words are too.
            </Body>
            <Body>
              <strong>Abundance Over Extraction</strong> is one of our five immutable principles. We cannot carry debt in the ecosystem. Not a preference — a law.
            </Body>
          </SectionWrap>

          {/* SECTION 01 */}
          <SectionWrap id="sec-01" num="01" eyebrow="What this is" title="The model in one paragraph">
            <PullQuote>A non-debt acquisition that hands ownership to the people who carry it.</PullQuote>
            <Body>
              The worldly playbook for buying a business is leverage: a buyer borrows against the business, carries personal liability for a decade, and services debt before they earn a dollar of real ownership. We replace that entirely. Our <strong style={{ color: PALETTE.gold }}>Sovereign Wealth Fund</strong> buys the business outright — the retiring owner is paid in full at close and walks away whole. Then, instead of saddling the next person with a loan, we extend the business to whoever wants to <strong>steward</strong> it — and from day one we allocate them a portion of ownership simply because they&rsquo;re carrying it.
            </Body>
            <Body>
              From there, ownership is <strong style={{ color: PALETTE.gold }}>earned, not repaid</strong>. The more the steward works, the more they get the business going, the more they participate — and the more generous they are — the faster they earn additional stewardship. More stewardship means more revenue and more economic rights. <strong>And if it doesn&rsquo;t work out, they owe us nothing.</strong> There is no debt to collect. We simply own a business, and we find the next steward on 1Accord. The risk is ours. The upside is theirs.
            </Body>
          </SectionWrap>

          {/* SECTION 02 */}
          <SectionWrap id="sec-02" num="02" eyebrow="Debt acquisition vs. stewardship acquisition" title="Why it's different">
            <PullQuote>Same business changing hands. Opposite architecture underneath.</PullQuote>
            <CompareTable
              leftTitle="The worldly debt acquisition"
              rightTitle="The Firma stewardship acquisition"
              left={[
                'Buyer borrows against the business (SBA loan, leverage)',
                'Seller often carries paper or waits on buyer financing',
                'New owner starts owing everything, owns nothing',
                'Ownership earned by paying down a note',
                'If it fails, the owner is buried in personal debt',
                'Business is leveraged, often stripped for returns',
                'One owner extracts; the team are employees',
              ]}
              right={[
                'The Sovereign Wealth Fund buys it outright, debt-free',
                'Seller is paid in full at close — no financing contingency',
                'Steward starts already holding a portion, just for carrying it',
                'Ownership earned by stewarding it well — work, contribution, generosity',
                'If it doesn’t work out, the steward owes nothing — the risk was ours',
                'Business is supported — compute, energy, agentic labor, community backing',
                'The team can hold fractional stewardship; the community can too',
              ]}
            />
            <Body>
              Every row on the left has an extraction point built in — the debt, the leverage, the strip. The right side has none. <strong>That&rsquo;s not a softer version of the same deal. It&rsquo;s a different instrument.</strong>
            </Body>
          </SectionWrap>

          {/* SECTION 03 */}
          <SectionWrap id="sec-03" num="03" eyebrow="From the owner's exit to a living node" title="How a deal moves">
            <PullQuote>Owner paid. Business on the substrate. Steward earning.</PullQuote>
            <NumberedStep n="01" title="Kingdom Brokers brings the owner." body="Eric's advisory does what it already does best — find the right established business, position it, lift the multiple. The difference is the buyer it's matched to." />
            <NumberedStep n="02" title="The Sovereign Wealth Fund buys it outright." body="Debt-free. The owner is paid in full at close and walks away whole. No seller-carry, no waiting on a buyer's bank, no financing contingency. The legacy is honored because the business is bought to be supported, not stripped." />
            <NumberedStep n="03" title="The business comes onto the substrate." body="It connects to the Realm, runs on Edge compute, draws agentic labor and apps from 1Accord, and can generate energy through Photon. It becomes a living productive node — lighter to run, cheaper to operate, more valuable than it was." />
            <NumberedStep n="04" title="It goes up on 1Accord for a steward." body="A human CEO, an agentic team, or a hybrid bids to run it — matched on reputation, not just price. The existing team has standing here: the people who already run it can step into stewardship of what they helped build." />
            <NumberedStep n="05" title="The steward starts already owning a piece." body="From day one we allocate them a portion of stewardship — just for carrying it. They don't start at zero. They start as a part-owner, and everything from here grows that share." />
          </SectionWrap>

          {/* SECTION 04 */}
          <SectionWrap id="sec-04" num="04" eyebrow="Earned, not repaid" title="How ownership is earned">
            <PullQuote>You don&rsquo;t pay us back with money. You earn ownership with stewardship.</PullQuote>
            <Body>
              In a debt deal, the only way to earn ownership is to pay down the loan with cash. Here, ownership grows through everything the steward puts in — and money is only one input. The more of these flow, the faster stewardship transfers:
            </Body>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', margin: '20px 0' }}>
              {[
                { l: 'Revenue', d: 'A portion of revenue flows toward the Fund’s position — not as a debt payment, but as the business earning its way into the steward’s hands.' },
                { l: 'Compute', d: 'The Realm connected to the business contributes compute to the substrate. The business that gives more, earns more.' },
                { l: 'Energy', d: 'Surplus energy through Photon flows back to the ecosystem and counts the same way.' },
                { l: 'Reputation', d: 'Reliability, delivery, how the steward treats their people and customers weights how fast ownership accrues. Character is an input.' },
                { l: 'Generosity', d: 'Sharing back to the community earns economic rights and speeds the whole track. Scaled proportionally — a meaningful slice outpaces a hoarded large one.' },
                { l: 'Bonding curves', d: 'Economic rights accrue along a bonding curve — the position deepens as the business grows. The Fund’s position is steadily outweighed, never collected.' },
              ].map((f) => (
                <div key={f.l} style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${PALETTE.gold}22`, borderRadius: '10px', padding: '16px' }}>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '17px', color: PALETTE.gold, fontWeight: 600, marginBottom: '6px' }}>{f.l}</div>
                  <div style={{ fontSize: '13.5px', color: 'rgba(242,238,231,0.78)', lineHeight: 1.55 }}>{f.d}</div>
                </div>
              ))}
            </div>
            <Body>
              <em>If they aren&rsquo;t successful, they owe us nothing. We own a business, and we find the next steward on 1Accord. If they are successful, they walk a clean road to owning it outright.</em>
            </Body>
          </SectionWrap>

          {/* SECTION 05 */}
          <SectionWrap id="sec-05" num="05" eyebrow="Four participants, one direction" title="Who shares in it">
            <PullQuote>Everyone who pours in, holds a piece.</PullQuote>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', margin: '20px 0' }}>
              <ParticipantCard role="01 · Honored" title="The retiring owner" body="Eric's client. Paid in full at close, walks away whole, legacy intact. May choose to keep a stake — or take clean proceeds and be done. Their choice." />
              <ParticipantCard role="02 · Earning" title="The steward" body="Human CEO, agentic team, or hybrid matched on 1Accord. Starts with allocated portion, earns toward full ownership through revenue, contribution, reputation, generosity." />
              <ParticipantCard role="03 · Stewarding" title="The employees" body="The team that runs the business day to day can hold fractional stewardship — not staff waiting on a paycheck, but part-owners of what they help flourish." />
              <ParticipantCard role="04 · Backing" title="The community" body="Anyone in the ecosystem can support a business they believe in — sow into it, hold a fractional position. Community support gives the business more capital." />
            </div>
            <Body>
              And underneath all four: our <strong style={{ color: PALETTE.gold }}>Sovereign Wealth Fund</strong>, which bought the business, carries the risk, and holds the residual position that gets steadily outweighed as everyone else earns. The Fund&rsquo;s recovered position recycles into the next acquisition. <strong>The model funds its own growth.</strong>
            </Body>
          </SectionWrap>

          {/* SECTION 06 */}
          <SectionWrap id="sec-06" num="06" eyebrow="No extraction point anywhere in it" title="The flourishing flywheel">
            <PullQuote>Everyone&rsquo;s flourishing is upstream of everyone else&rsquo;s.</PullQuote>
            <div style={{ background: `linear-gradient(135deg, ${PALETTE.navy2}, ${PALETTE.navy3})`, border: `1px solid ${PALETTE.gold}33`, borderRadius: '14px', padding: '32px', margin: '24px 0' }}>
              {[
                'The Fund and community support the business.',
                'Supported, the business flourishes — more revenue, more capital, lighter operations.',
                'A flourishing business moves the steward and employees faster toward ownership.',
                'Owners who flourish are generous — sharing back to the community.',
                'A rewarded community has more to support the next business.',
              ].map((step, i) => (
                <div key={i} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', marginBottom: i < 4 ? '14px' : 0 }}>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '11px', color: PALETTE.gold, minWidth: '22px' }}>{String(i + 1).padStart(2, '0')}</div>
                  <div style={{ fontSize: '15px', color: PALETTE.cream, lineHeight: 1.55 }}>{step}</div>
                </div>
              ))}
              <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: `1px dashed ${PALETTE.gold}33`, textAlign: 'center' }}>
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: PALETTE.green }}>
                  Everyone Rises Together · No Extraction Point
                </span>
              </div>
            </div>
            <Body>
              In a debt acquisition, the participants are adversaries: the lender&rsquo;s gain is the borrower&rsquo;s burden, the buyer&rsquo;s return comes out of the business&rsquo;s hide. Here there are no adversaries. The Fund&rsquo;s recovery, the steward&rsquo;s ownership, the employees&rsquo; stake, the community&rsquo;s dividend, and the business&rsquo;s health all move the same direction — or none of them move.
            </Body>
          </SectionWrap>

          {/* SECTION 07 */}
          <SectionWrap id="sec-07" num="07" eyebrow="The substrate lifts the business" title="Why the business runs better">
            <PullQuote>The same business, lighter — and worth more.</PullQuote>
            <Body>
              Eric&rsquo;s advisory already lifts a business&rsquo;s value before sale: installing recurring revenue, reducing owner-dependence, diversifying customers, automating operations. The substrate does those same things natively — so a business on Firma rails is not just debt-free, it&rsquo;s structurally more valuable:
            </Body>
            <CompareTable
              leftTitle="The cost it used to carry"
              rightTitle="What the substrate replaces it with"
              left={[
                'W-2 payroll + benefits burden',
                '$400–$1,200/mo SaaS stack',
                'Cloud compute bills',
                'Utility power',
                'Owner-dependence (a value killer at sale)',
              ]}
              right={[
                '1Accord work market — humans and agents bid per task, in real time',
                'AgentApps from 1Accord, running on the business’s own Edge compute',
                'Realm Node on-site; surplus compute flows back and earns toward ownership',
                'Photon energy where the site suits; surplus flows back and earns too',
                'Theo runs operations; the business runs without any single person',
              ]}
            />
            <Body>
              Lower cost base lifts margin. Higher margin and owner-independence lift the business&rsquo;s value. The same business is worth more on the substrate — which means a stronger position for the Fund, a faster track for the steward, and more to share with everyone holding a piece.
            </Body>
            <div style={{ marginTop: '24px', padding: '20px', background: 'rgba(255,255,255,0.03)', borderLeft: `3px solid ${PALETTE.gold}`, borderRadius: '6px' }}>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase', color: PALETTE.gold, marginBottom: '10px' }}>The businesses this is built for</div>
              <div style={{ fontSize: '15px', color: 'rgba(242,238,231,0.85)', lineHeight: 1.65 }}>
                Not startups. Not tech. The established, essential, durable American businesses Kingdom Brokers already serves — Trades &amp; Mechanical (HVAC, plumbing, electrical), Specialty Contracting, Waste &amp; Environmental, Specialty Manufacturing, Supply Chain &amp; Distribution. <strong style={{ color: PALETTE.gold }}>The ones that have run their communities for decades</strong> and are exactly what this model is meant to carry forward.
              </div>
            </div>
          </SectionWrap>

          {/* SECTION 08 */}
          <SectionWrap id="sec-08" num="08" eyebrow="Full ownership, or stay — their choice" title="The open door">
            <PullQuote>No balloon payment. No maturity date. Just a door that opens when they&rsquo;re ready.</PullQuote>
            <Body>
              As the steward earns, they reach a point where they can take full ownership if they want — buy the whole thing outright at a clean formulaic value — or simply keep it where it is and continue in the shared arrangement, collecting their share while the community and Fund keep theirs.
            </Body>
            <Body>
              There is no forced exit. No clock running out. No moment where a payment comes due and the whole thing is at risk. The steward owns more and more over time, and the door to full ownership stays open — to walk through whenever they choose, or never, as they prefer. <strong>A debt deal ends in a reckoning. This ends in a choice.</strong>
            </Body>
            <PullQuote>
              A debt acquisition asks: can you pay it off before it crushes you?<br />
              The stewardship acquisition asks: <span style={{ color: PALETTE.gold }}>how much do you want to own, and when?</span>
            </PullQuote>
          </SectionWrap>

          {/* SECTION 09 */}
          <SectionWrap id="sec-09" num="09" eyebrow="Eric's engine, on our rails" title="Where Kingdom Brokers fits">
            <PullQuote>The same advisory. A better outcome to offer every owner.</PullQuote>
            <Body>
              Eric built Kingdom Brokers to serve owners — get them what their business is worth, match them to a buyer who honors the legacy, serve 10,000 families. This model gives that mission a buyer it never had before: one that pays in full at close, can&rsquo;t fall through on financing, and turns the business into something that lifts a steward, a team, and a community instead of carrying a debt.
            </Body>
            <CompareTable
              leftTitle="Selling to a worldly buyer"
              rightTitle="Selling to the Fund"
              left={[
                'Deal can collapse at the buyer’s financing step',
                'New owner is loaded with debt; legacy at risk',
                'The team becomes someone else’s employees',
                '"We hope the buyer honors it"',
              ]}
              right={[
                'Paid in full at close — no financing contingency',
                'Business is supported and handed to a steward who earns it cleanly',
                'The team can hold fractional stewardship of what they built',
                'The model is built to honor it — that’s the whole instrument',
              ]}
            />
            <div style={{ marginTop: '30px' }}>
              <Eyebrow>Open threads</Eyebrow>
              {[
                'Which of Eric’s industries map onto the substrate first — HVAC, trades, facility services, distribution? Some are more agent-runnable than others.',
                'The revenue-share rate, the opening stewardship allocation, and the bonding-curve shape — all proposed, all to be set per deal against the Fund’s mandate.',
                'How the existing team’s standing in the 1Accord steward match is structured — first right, reputation head-start, or open match.',
                'The naming we show owners for the Fund and the program — neutral and trustworthy, sovereign-civic, not internal language.',
              ].map((t, i) => (
                <div key={i} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '11px', color: PALETTE.gold, minWidth: '22px' }}>{String(i + 1).padStart(2, '0')}</div>
                  <div style={{ fontSize: '14.5px', color: 'rgba(242,238,231,0.78)', lineHeight: 1.55 }}>{t}</div>
                </div>
              ))}
            </div>
          </SectionWrap>

          {/* SECTION 10 */}
          <SectionWrap id="sec-10" num="10" eyebrow="The five immutable principles" title="Why this fits the principles">
            <PullQuote>The principles do the work.</PullQuote>
            {[
              ['Participation across creation', 'Human stewards, agentic teams, employees, and community all hold real positions and share the upside.'],
              ['Abundance over extraction', 'No debt. No interest. No foreclosure. The risk sits with the Fund; the steward owes nothing if it doesn’t work.'],
              ['The provision is for the vision', 'Every business bought becomes a living node on the substrate — compute, energy, agentic labor, economic activity.'],
              ['Phased disclosure', 'Owner-facing language stays neutral and trustworthy — purchase, stewardship, support. The deeper grounding stays internal.'],
              ['The correction ratchet', 'The model moves the baseline of business succession one direction only — away from debt, toward shared ownership and flourishing.'],
            ].map(([principle, body], i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '20px', padding: '16px 0', borderBottom: i < 4 ? `1px solid ${PALETTE.gold}15` : 'none' }}>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '17px', color: PALETTE.gold, fontWeight: 600 }}>{principle}</div>
                <div style={{ fontSize: '14.5px', color: 'rgba(242,238,231,0.82)', lineHeight: 1.6 }}>{body}</div>
              </div>
            ))}
            <PullQuote>We&rsquo;re not competing with the debt-acquisition world. We&rsquo;re making a different one — and inviting ordinary American businesses into it.</PullQuote>
          </SectionWrap>

          {/* SECTION 11 */}
          <SectionWrap id="sec-11" num="11" eyebrow="From model to first deal" title="Next steps">
            <PullQuote>One business, bought clean, stewarded well — end to end.</PullQuote>
            <NumberedStep n="01" title="Lock the model with the team." body="Eric, Vision, and finance align on revenue-share, opening allocation, and bonding-curve shape." />
            <NumberedStep n="02" title="Stand up the Fund vehicle." body="Legal structures the Sovereign Wealth Fund's acquisition vehicle and the stewardship instrument." />
            <NumberedStep n="03" title="Connect the rails." body="1Accord readied for the steward match; Edge, Realm, and Photon ready to connect the first business." />
            <NumberedStep n="04" title="One deal, all the way through." body="A single business — owner paid in full, business on the substrate, a steward earning toward ownership — before anything scales." />
          </SectionWrap>

          {/* THE CLOSING */}
          <section style={{ padding: '80px 0 40px', textAlign: 'center' }}>
            <Eyebrow>The Closing</Eyebrow>
            <h2
              style={{
                fontFamily: "'Playfair Display', serif",
                fontStyle: 'italic',
                fontSize: 'clamp(28px, 3.8vw, 42px)',
                fontWeight: 600,
                color: PALETTE.cream,
                lineHeight: 1.2,
                margin: '20px auto 28px',
                maxWidth: '780px',
              }}
            >
              The debt world asks if you can pay it off before it crushes you.
              <br />
              <span style={{ color: PALETTE.gold }}>We ask how much you want to own.</span>
            </h2>
            <div style={{ fontSize: '15.5px', color: 'rgba(242,238,231,0.78)', lineHeight: 1.75, maxWidth: '720px', margin: '0 auto' }}>
              The owner who built it is paid in full and walks away whole. <strong style={{ color: PALETTE.cream }}>No one inherits a debt.</strong>
              <br /><br />
              The Fund buys it outright and carries the risk. The business comes onto the substrate and runs lighter than it ever did. Whoever stewards it starts already owning a piece — and earns the rest by working, contributing, and giving. If it doesn&rsquo;t work, they owe nothing. <strong style={{ color: PALETTE.gold }}>If it flourishes, it becomes theirs.</strong>
              <br /><br />
              The team can own what they built. The community can back what they believe in. And every piece of it moves the same direction at once.
            </div>
            <div style={{ marginTop: '40px', fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontSize: '18px', color: PALETTE.gold }}>
              This is the engine Eric built — on rails that finally match the mission behind it.
            </div>
          </section>

          {/* FOOTER */}
          <footer style={{ paddingTop: '40px', borderTop: `1px solid ${PALETTE.gold}22`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', fontFamily: "'DM Mono', monospace", fontSize: '11px', letterSpacing: '0.12em', color: PALETTE.faint }}>
            <span>Kingdom Brokers × Firma Labs · v5 · 2026-05-27</span>
            <span style={{ color: PALETTE.gold }}>Internal · Admin Only</span>
          </footer>
        </main>
      </div>
    </div>
  )
}
