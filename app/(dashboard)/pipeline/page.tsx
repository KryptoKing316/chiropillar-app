import PipelineTimelineMockup from '@/components/dashboard/PipelineTimelineMockup'

const STAGES = ['Onboarding', 'Active', 'Matched', 'LOI', 'Diligence', 'Closed']

export default function PipelinePage() {
  return (
    <div style={{ padding: '32px 36px', fontFamily: "'Inter', system-ui, sans-serif", color: 'var(--kb-text)', maxWidth: '1200px' }}>
      <div style={{ fontSize: '11px', color: 'var(--kb-text-muted)', letterSpacing: '0.08em', fontWeight: 510, textTransform: 'uppercase', marginBottom: '6px' }}>Deal Pipeline</div>
      <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '28px', fontWeight: 600, margin: '0 0 5px', letterSpacing: '-0.3px' }}>Legacy HVAC Services</h1>
      <p style={{ fontSize: '15px', color: 'var(--kb-text-secondary)', margin: '0 0 26px', lineHeight: 1.5 }}>Dallas, TX &middot; $4.8M asking &middot; $910K EBITDA &middot; 7 matched buyers</p>

      {/* HERO · pitch-deck-style live deal timeline preview */}
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(340px, 1fr) minmax(420px, 1.05fr)',
          gap: '36px',
          alignItems: 'center',
          background: 'linear-gradient(135deg, rgba(11,27,62,0.5) 0%, rgba(15,35,71,0.3) 100%)',
          border: '1px solid rgba(201,168,76,0.18)',
          borderRadius: '20px',
          padding: '36px 32px',
          marginBottom: '28px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(ellipse at 80% 20%, rgba(201,168,76,0.08), transparent 60%)',
            pointerEvents: 'none',
          }}
        />

        <div style={{ position: 'relative' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              fontFamily: "'DM Mono', monospace",
              fontSize: '11px',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: '#C9A84C',
              background: 'rgba(201,168,76,0.10)',
              border: '1px solid rgba(201,168,76,0.30)',
              borderRadius: '999px',
              padding: '6px 12px',
              marginBottom: '20px',
            }}
          >
            <span style={{ display: 'inline-block', width: '5px', height: '5px', borderRadius: '50%', background: '#C9A84C' }} />
            Live Deal Tracking
          </div>

          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(22px, 2.8vw, 30px)',
              fontWeight: 700,
              color: '#F2EEE7',
              margin: 0,
              lineHeight: 1.15,
              letterSpacing: '-0.01em',
            }}
          >
            Every milestone, every buyer touch.{' '}
            <span style={{ color: '#C9A84C', fontStyle: 'italic' }}>In one timeline you can show your spouse.</span>
          </h2>

          <p
            style={{
              fontSize: '14.5px',
              color: 'rgba(242,238,231,0.75)',
              lineHeight: 1.65,
              margin: '14px 0 22px',
              maxWidth: '440px',
            }}
          >
            From doc upload to close, every stage is tracked with auto-updated status pulled from buyer responses, signed NDAs, LOI receipts, and DD checkpoint completion. Below is a sample of what your timeline looks like at Day 24.
          </p>

          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              'Real-time stage progression (Onboarding → Closed)',
              'Auto-updates from agent + buyer activity',
              'NDA / LOI / DD checkpoint tracking',
              'KPI tiles: active days · matches · NDAs · time-to-close',
            ].map((b, i) => (
              <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '14px', color: 'rgba(242,238,231,0.85)', lineHeight: 1.5 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '2px' }}>
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>

        <div style={{ position: 'relative' }}>
          <PipelineTimelineMockup />
        </div>
      </section>

      {/* Stage Tracker */}
      <div style={{ background: 'var(--kb-bg-card)', border: '1px solid var(--kb-border)', borderRadius: '8px', padding: '24px', marginBottom: '16px' }}>
        <div style={{ fontSize: '14px', fontWeight: 510, marginBottom: '20px' }}>Current Stage: <span style={{ color: 'var(--kb-accent)' }}>LOI Received</span></div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {STAGES.map((s, i) => {
            const done = i < 3, curr = i === 3, last = i === STAGES.length - 1
            return (
              <div key={s} style={{ display: 'flex', alignItems: 'center', flex: last ? 0 : 1 }}>
                <div style={{ textAlign: 'center', minWidth: '84px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', margin: '0 auto 8px', background: done ? '#2ECC8B' : curr ? '#C9A84C' : 'var(--kb-bg-raised)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', color: done || curr ? 'var(--kb-bg)' : 'var(--kb-text-muted)', fontWeight: 590 }}>
                    {done ? <svg viewBox="0 0 14 14" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="3,7 6,10 11,4"/></svg> : i + 1}
                  </div>
                  <div style={{ fontSize: '12px', color: curr ? '#C9A84C' : done ? '#2ECC8B' : 'var(--kb-text-muted)', fontWeight: curr || done ? 510 : 400 }}>{s}</div>
                </div>
                {!last && <div style={{ flex: 1, height: '2px', background: done ? '#2ECC8B' : curr ? 'linear-gradient(90deg, #C9A84C, var(--kb-border-subtle))' : 'var(--kb-bg-raised)', margin: '0 2px 20px', borderRadius: '1px' }} />}
              </div>
            )
          })}
        </div>
      </div>

      {/* KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '16px' }}>
        {[
          { label: 'Matched Buyers', value: '7', color: 'var(--kb-text)' },
          { label: 'NDAs Signed', value: '4', color: 'var(--kb-green)' },
          { label: 'LOIs Received', value: '1', color: 'var(--kb-accent)' },
          { label: 'Days Active', value: '32', color: 'var(--kb-text)' },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--kb-bg-surface)', border: '1px solid var(--kb-border-subtle)', borderRadius: '8px', padding: '16px 20px' }}>
            <div style={{ fontSize: '12px', color: 'var(--kb-text-secondary)', fontWeight: 510, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '6px' }}>{s.label}</div>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '24px', fontWeight: 510, color: s.color, fontVariantNumeric: 'tabular-nums' }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Two columns */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
        {/* Docs */}
        <div style={{ background: 'var(--kb-bg-card)', border: '1px solid var(--kb-border)', borderRadius: '8px', padding: '22px' }}>
          <div style={{ fontSize: '14px', fontWeight: 510, marginBottom: '14px' }}>Document Checklist</div>
          {[
            { label: '5-Year Tax Returns', done: true },
            { label: 'P&L Statements', done: true },
            { label: 'Bank Statements', done: true },
            { label: 'Confidential Info Memorandum', done: true },
            { label: 'NDA (4 signed)', done: true },
            { label: 'LOI from Mesa Verde Partners', done: true, gold: true },
            { label: 'Purchase Agreement', done: false, note: 'Pending' },
          ].map((d, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '11px', padding: '9px 0', borderBottom: '1px solid var(--kb-border-subtle)' }}>
              <div style={{ width: '20px', height: '20px', borderRadius: '4px', background: d.done ? (d.gold ? '#C9A84C' : '#2ECC8B') : 'var(--kb-bg-raised)', border: d.done ? 'none' : '1.5px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {d.done && <svg viewBox="0 0 14 14" width="12" height="12" fill="none" stroke="var(--kb-bg)" strokeWidth="2.5" strokeLinecap="round"><polyline points="3,7 6,10 11,4"/></svg>}
              </div>
              <span style={{ fontSize: '14px', color: d.done ? 'var(--kb-text)' : 'var(--kb-text-secondary)', flex: 1, fontWeight: d.gold ? 590 : 400 }}>{d.label}</span>
              {d.note && <span style={{ fontSize: '12px', color: 'var(--kb-text-secondary)' }}>{d.note}</span>}
            </div>
          ))}
        </div>

        {/* Buyer Engagement */}
        <div style={{ background: 'var(--kb-bg-card)', border: '1px solid var(--kb-border)', borderRadius: '8px', padding: '22px' }}>
          <div style={{ fontSize: '14px', fontWeight: 510, marginBottom: '14px' }}>Buyer Engagement</div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>{['Buyer', 'Status', 'Date', 'Activity'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '6px 8px', fontSize: '11px', color: 'var(--kb-text-secondary)', fontWeight: 590, letterSpacing: '0.05em', textTransform: 'uppercase', borderBottom: '1px solid var(--kb-border-subtle)' }}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {[
                { buyer: 'Mesa Verde Partners', status: 'LOI Submitted', date: 'Mar 28', activity: '$4.6M offer', sc: '#C9A84C', bold: true },
                { buyer: 'TX HVAC Rollup', status: 'Due Diligence', date: 'Mar 25', activity: 'Data room access', sc: '#2ECC8B' },
                { buyer: 'Sunbelt Family Capital', status: 'NDA Signed', date: 'Mar 22', activity: 'Reviewing CIM', sc: '#2ECC8B' },
                { buyer: 'Lone Star Equity', status: 'NDA Signed', date: 'Mar 20', activity: 'Call scheduled Apr 2', sc: '#2ECC8B' },
                { buyer: 'Callais Capital', status: 'Contacted', date: 'Mar 18', activity: 'Email opened 4x', sc: '#C9A84C' },
                { buyer: 'DFW Services Group', status: 'Contacted', date: 'Mar 17', activity: 'Follow up sent', sc: '#C9A84C' },
                { buyer: 'Cypress PE Partners', status: 'Identified', date: 'Mar 15', activity: 'Fit score: 91', sc: 'var(--kb-text-muted)' },
              ].map((r, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--kb-border-subtle)', background: r.bold ? 'rgba(201,168,76,0.04)' : 'transparent' }}>
                  <td style={{ padding: '10px 8px', fontSize: '13px', fontWeight: r.bold ? 590 : 400 }}>{r.buyer}</td>
                  <td style={{ padding: '10px 8px' }}><span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '4px', background: `${r.sc}18`, color: r.sc, fontWeight: 510 }}>{r.status}</span></td>
                  <td style={{ padding: '10px 8px', color: 'var(--kb-text-secondary)', fontSize: '12px', fontFamily: "'DM Mono', monospace", fontVariantNumeric: 'tabular-nums' }}>{r.date}</td>
                  <td style={{ padding: '10px 8px', color: 'var(--kb-text-secondary)', fontSize: '12px' }}>{r.activity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* LOI Card */}
      <div style={{ background: 'var(--kb-accent-dim)', border: '1px solid var(--kb-accent-border)', borderRadius: '8px', padding: '28px', marginBottom: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--kb-accent)', fontWeight: 510, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px' }}>Letter of Intent Received</div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', fontWeight: 600, marginBottom: '8px' }}>Mesa Verde Partners</div>
            <div style={{ fontSize: '14px', color: 'var(--kb-text-secondary)', lineHeight: 1.6, maxWidth: '500px' }}>
              Family office specializing in essential services acquisitions. $4.6M offer with SBA 7(a) financing. 90-day close timeline. Seller note for 10% of purchase price.
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '28px', fontWeight: 510, color: 'var(--kb-accent)', fontVariantNumeric: 'tabular-nums' }}>$4.6M</div>
            <div style={{ fontSize: '12px', color: 'var(--kb-text-secondary)', marginTop: '4px' }}>Offer Price</div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginTop: '20px' }}>
          {[
            { label: 'Structure', value: 'SBA 7(a)' },
            { label: 'Down Payment', value: '10% ($460K)' },
            { label: 'Seller Note', value: '10% ($460K)' },
            { label: 'Close Target', value: '90 days' },
          ].map(t => (
            <div key={t.label} style={{ padding: '12px', background: 'var(--kb-accent-dim)', borderRadius: '6px' }}>
              <div style={{ fontSize: '11px', color: 'var(--kb-text-secondary)', fontWeight: 510, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>{t.label}</div>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '14px', fontWeight: 510, color: 'var(--kb-text)', fontVariantNumeric: 'tabular-nums' }}>{t.value}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
          <button style={{ padding: '10px 24px', background: 'var(--kb-accent)', border: 'none', borderRadius: '6px', color: 'var(--kb-bg)', fontSize: '14px', fontWeight: 590, cursor: 'pointer', boxShadow: 'rgba(201,168,76,0.25) 0px 2px 8px' }}>Review Full LOI</button>
          <button style={{ padding: '10px 24px', background: 'var(--kb-bg-card)', border: '1px solid var(--kb-border)', borderRadius: '6px', color: 'var(--kb-text)', fontSize: '14px', fontWeight: 510, cursor: 'pointer' }}>Counter Offer</button>
          <button style={{ padding: '10px 24px', background: 'var(--kb-bg-card)', border: '1px solid var(--kb-border)', borderRadius: '6px', color: 'var(--kb-text-secondary)', fontSize: '14px', fontWeight: 510, cursor: 'pointer' }}>Decline</button>
        </div>
      </div>

      {/* Activity Feed */}
      <div style={{ background: 'var(--kb-bg-card)', border: '1px solid var(--kb-border)', borderRadius: '8px', padding: '22px' }}>
        <div style={{ fontSize: '14px', fontWeight: 510, marginBottom: '14px' }}>Recent Activity</div>
        {[
          { date: 'Mar 28', event: 'LOI received from Mesa Verde Partners', detail: '$4.6M offer, SBA 7(a) structure', color: 'var(--kb-accent)' },
          { date: 'Mar 25', event: 'TX HVAC Rollup entered due diligence', detail: 'Data room access granted', color: 'var(--kb-green)' },
          { date: 'Mar 22', event: 'NDA signed by Sunbelt Family Capital', detail: 'CIM sent automatically', color: 'var(--kb-green)' },
          { date: 'Mar 20', event: 'NDA signed by Lone Star Equity', detail: 'Call scheduled for Apr 2', color: 'var(--kb-green)' },
          { date: 'Mar 18', event: 'Outreach sent to Callais Capital', detail: 'Personalized pitch email delivered', color: 'var(--kb-text-secondary)' },
          { date: 'Mar 15', event: 'New buyer identified: Cypress PE Partners', detail: 'Fit score 91, HVAC thesis match', color: 'var(--kb-text-secondary)' },
          { date: 'Mar 12', event: 'CIM completed and approved', detail: '22 pages, PDF exported', color: 'var(--kb-green)' },
          { date: 'Mar 1', event: 'Financial analysis complete', detail: 'EBITDA normalized to $910K, 3 add-backs found', color: 'var(--kb-green)' },
        ].map((a, i) => (
          <div key={i} style={{ display: 'flex', gap: '12px', padding: '10px 0', borderBottom: i < 7 ? '1px solid rgba(255,255,255,0.03)' : 'none' }}>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '12px', color: 'var(--kb-text-muted)', fontVariantNumeric: 'tabular-nums', minWidth: '52px', flexShrink: 0 }}>{a.date}</div>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: a.color, flexShrink: 0, marginTop: '5px' }} />
            <div>
              <div style={{ fontSize: '13px', color: 'var(--kb-text)', fontWeight: 510 }}>{a.event}</div>
              <div style={{ fontSize: '12px', color: 'var(--kb-text-secondary)', marginTop: '2px' }}>{a.detail}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ─────────────────────────────────────────────────────────────
            DIRECT MAIL STRATEGY · 6,000+ pre-scored seller leads
            Premium boomer-targeted direct mail to $1-20M trades owners
         ───────────────────────────────────────────────────────────── */}
      <div style={{
        marginTop: '48px',
        position: 'relative',
        background: 'linear-gradient(180deg, rgba(11,27,62,0.55) 0%, rgba(11,27,62,0.25) 100%)',
        border: '1px solid rgba(201,168,76,0.20)',
        borderRadius: '14px',
        padding: '40px 44px',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse 60% 50% at 90% 10%, rgba(201,168,76,0.10), transparent 65%)',
          pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative' }}>
          <div style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: '13px',
            letterSpacing: '0.22em',
            color: '#C9A84C',
            textTransform: 'uppercase',
            marginBottom: '18px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            fontWeight: 600,
          }}>
            <span style={{ width: '36px', height: '1px', background: '#C9A84C' }} />
            Direct Mail Engine
          </div>

          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(28px, 3.6vw, 40px)',
            fontWeight: 700,
            color: 'var(--kb-text)',
            margin: '0 0 14px',
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
            maxWidth: '900px',
          }}>
            6,000+ pre-scored seller leads.<br />
            <span style={{ color: '#C9A84C' }}>$1M–$20M trade businesses.</span> Mailed personally.
          </h2>

          <p style={{
            fontSize: '17px',
            color: 'var(--kb-text-secondary)',
            lineHeight: 1.55,
            margin: '0 0 36px',
            maxWidth: '780px',
          }}>
            Baby boomer owners don&apos;t respond to cold email as much. They respond to premium,
            personally-addressed mail that lands on their desk with a real stamp. Our scored
            list flags ownership-transition signals, growth plateau, and category-consolidation
            momentum then sends each owner a one-of-one mailer with their business name,
            valuation range, and a path to talk.
          </p>

          {/* Stat strip */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '14px',
            marginBottom: '40px',
          }}>
            {[
              { num: '6,000+', lbl: 'Pre-scored leads in database' },
              { num: '$1M–$20M', lbl: 'Revenue range targeted' },
              { num: '50+', lbl: 'Owner-age floor (boomer focus)' },
              { num: '4–8%', lbl: 'Expected response rate' },
            ].map((s, i) => (
              <div key={i} style={{
                padding: '18px 20px',
                background: 'var(--kb-bg-card)',
                border: '1px solid var(--kb-border)',
                borderRadius: '10px',
              }}>
                <div style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: '26px',
                  fontWeight: 700,
                  color: '#E8C96A',
                  letterSpacing: '-0.02em',
                  lineHeight: 1,
                  marginBottom: '8px',
                }}>{s.num}</div>
                <div style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: '10px',
                  letterSpacing: '0.14em',
                  color: 'var(--kb-text-secondary)',
                  textTransform: 'uppercase',
                  lineHeight: 1.4,
                }}>{s.lbl}</div>
              </div>
            ))}
          </div>

          {/* Postcard mockup row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '24px',
            marginBottom: '24px',
          }}>
            {[
              {
                src: '/direct-mail/kb-HVAC-LakeComo.png',
                vertical: 'HVAC',
                template: 'Lake Como',
                sample: 'Sample · Dallas, TX HVAC operator · $4.2M revenue · 32 yrs in business',
              },
              {
                src: '/direct-mail/kb-Landscaping-Europe.png',
                vertical: 'Landscaping',
                template: 'European Estate',
                sample: 'Sample · Charlotte, NC landscaping co · $3.8M revenue · 28 yrs in business',
              },
            ].map((card, i) => (
              <div key={i} style={{
                background: 'var(--kb-bg-card)',
                border: '1px solid var(--kb-border)',
                borderRadius: '12px',
                overflow: 'hidden',
              }}>
                <div style={{
                  background: '#0B1B3E',
                  padding: '20px',
                  borderBottom: '1px solid var(--kb-border-subtle)',
                }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={card.src}
                    alt={`KB direct mail · ${card.vertical} · ${card.template} template`}
                    style={{
                      display: 'block',
                      width: '100%',
                      height: 'auto',
                      borderRadius: '6px',
                      boxShadow: '0 12px 32px rgba(0,0,0,0.35), 0 0 0 1px rgba(201,168,76,0.10)',
                    }}
                  />
                </div>
                <div style={{ padding: '18px 22px' }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    marginBottom: '8px',
                    gap: '12px',
                  }}>
                    <div style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: '18px',
                      fontWeight: 600,
                      color: 'var(--kb-text)',
                    }}>{card.vertical} · {card.template}</div>
                    <div style={{
                      fontFamily: "'DM Mono', monospace",
                      fontSize: '10px',
                      letterSpacing: '0.14em',
                      color: '#C9A84C',
                      textTransform: 'uppercase',
                      padding: '3px 8px',
                      background: 'rgba(201,168,76,0.12)',
                      border: '1px solid rgba(201,168,76,0.25)',
                      borderRadius: '4px',
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                    }}>6×11 Premium</div>
                  </div>
                  <div style={{
                    fontSize: '13px',
                    color: 'var(--kb-text-secondary)',
                    lineHeight: 1.5,
                  }}>{card.sample}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Why it works */}
          <div style={{
            padding: '20px 24px',
            background: 'var(--kb-accent-dim)',
            border: '1px solid rgba(201,168,76,0.18)',
            borderRadius: '10px',
          }}>
            <div style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: '10px',
              letterSpacing: '0.16em',
              color: '#C9A84C',
              textTransform: 'uppercase',
              fontWeight: 600,
              marginBottom: '8px',
            }}>Why baby boomer owners answer this</div>
            <div style={{
              fontSize: '15px',
              color: 'var(--kb-text)',
              lineHeight: 1.6,
            }}>
              Premium full-color 6×11 mailer. Live first-class postage. <strong style={{ color: '#E8C96A' }}>Personally addressed</strong> with owner first name + business name + city. Opens with their valuation range and a believable base offer — then routes to phone, QR code to <strong>/valuation</strong>, or web. Lands on the desk of the owner who built it, not the spam folder of the assistant who manages it.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
