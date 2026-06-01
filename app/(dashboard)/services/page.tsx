'use client'

// Growth Services hub — single tab in the sidebar, this page lists every offering.
// Right now everything is "Coming Soon" but the page reads as a real product menu
// so clients see what's coming and brokers can reference it on calls.

const SERVICES = [
  {
    id: 'gmb',
    title: 'Google Business Profile Optimization',
    short: 'GMB',
    status: 'Coming Soon',
    headline: 'Rank #1 in your local map pack — without lifting a finger.',
    description:
      'We rebuild your Google Business Profile from the ground up. Keyword-optimized categories, weekly photo and post cadence, review pipeline automation, and local citation cleanup across 50+ directories. Most KB clients see their phone start ringing within 30 days.',
    deliverables: [
      'Full GBP rebuild + category + service-area optimization',
      'Weekly posts + photo uploads (4x/month)',
      'Review request automation + AI response drafts',
      '50+ local citation cleanup + NAP consistency',
      'Monthly local rank tracking dashboard',
    ],
    price: 'From $497/mo',
  },
  {
    id: 'seo',
    title: 'SEO Services',
    short: 'SEO',
    status: 'Coming Soon',
    headline: 'Own your category on Google — before you sell.',
    description:
      'A clean SEO foundation can add 2-4x to your asking price. We build a 12-month organic growth plan: technical audit, content engine, backlink outreach, and topical authority. Designed to compound revenue + multiple at exit.',
    deliverables: [
      'Technical SEO audit + fixes',
      '4 long-form pillar posts/month (broker-grade copy)',
      'Backlink outreach to industry publications',
      'Schema markup + Core Web Vitals optimization',
      'Quarterly content roadmap aligned to acquisition multiples',
    ],
    price: 'From $1,500/mo',
  },
  {
    id: 'marketing',
    title: 'Digital Marketing',
    short: 'Ads',
    status: 'Coming Soon',
    headline: 'A dollar a day on Facebook can pay for the whole platform.',
    description:
      "Our paid playbook uses the exact $1-a-day Facebook formula that's driving inbound for KB's own clients. Lead capture, AI follow-up, and full attribution to closed jobs. We don't believe in vanity metrics. We believe in booked appointments.",
    deliverables: [
      '$1-a-day Facebook + Instagram ad management',
      'Landing page + lead magnet builds',
      'AI follow-up SMS + email sequences',
      'Retargeting + lookalike audience scaling',
      'Monthly attribution: ad spend → booked jobs → revenue',
    ],
    price: 'From $997/mo + ad spend',
  },
  {
    id: 'digital-twin',
    title: 'Digital Twin CEO',
    short: 'Twin',
    status: 'Beta',
    headline: 'Your business runs while you sleep. Literally.',
    description:
      "Digital Twin OS captures your decisions, SOPs, sales scripts, and operations into an AI clone that answers questions, trains staff, and runs the playbook 24/7. The owner becomes optional — which is exactly what buyers pay a premium multiple for.",
    deliverables: [
      'Full business operations capture (SOPs, scripts, decisions)',
      'AI-trained agent for staff training + Q&A',
      'Knowledge base + searchable playbook',
      'Sliding subscription: $497-$2,497/mo by business size',
      "Buyer-ready 'owner-independent' documentation",
    ],
    price: '$497 - $2,497/mo',
  },
]

const CARD_STYLE: React.CSSProperties = {
  background: 'var(--kb-card-bg)',
  border: '1px solid var(--kb-border)',
  borderRadius: '14px',
  padding: '28px 28px',
  display: 'flex',
  flexDirection: 'column',
  gap: '14px',
}

const STATUS_PILL = (status: string): React.CSSProperties => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  fontSize: '10px',
  fontWeight: 700,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  padding: '4px 10px',
  borderRadius: '999px',
  background: status === 'Beta' ? 'rgba(46,204,139,0.12)' : 'rgba(201,168,76,0.12)',
  color: status === 'Beta' ? '#2ECC8B' : '#C9A84C',
})

export default function ServicesPage() {
  return (
    <main style={{
      padding: '32px 36px 80px',
      maxWidth: '1280px',
      margin: '0 auto',
      fontFamily: "'Inter', 'DM Sans', system-ui, sans-serif",
    }}>
      {/* Hero */}
      <div style={{ marginBottom: '36px' }}>
        <div style={{
          display: 'inline-block',
          fontSize: '11px', fontWeight: 700, letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: 'var(--kb-accent)',
          padding: '6px 14px',
          background: 'var(--kb-accent-dim)',
          borderRadius: '999px',
          marginBottom: '16px',
        }}>
          Growth Services · Q3 2026
        </div>
        <h1 style={{
          fontSize: '36px',
          lineHeight: 1.12,
          fontWeight: 700,
          color: 'var(--kb-text)',
          margin: '0 0 14px',
          letterSpacing: '-0.02em',
        }}>
          Grow your business 2-4x. Then exit at a premium multiple.
        </h1>
        <p style={{
          fontSize: '16px',
          lineHeight: 1.55,
          color: 'var(--kb-text-secondary)',
          maxWidth: '780px',
          margin: 0,
        }}>
          Most owners don&apos;t need to sell yet. They need to grow first. KB&apos;s Growth Services
          plug into your business while we prep your exit, so the company you sell is worth
          more than the company you have today. All offerings launching Q3 2026.
        </p>
      </div>

      {/* Service cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
        gap: '20px',
      }}>
        {SERVICES.map((svc) => (
          <div key={svc.id} style={CARD_STYLE}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--kb-text-muted)' }}>
                {svc.short}
              </div>
              <span style={STATUS_PILL(svc.status)}>
                <span style={{
                  width: '6px', height: '6px', borderRadius: '50%',
                  background: svc.status === 'Beta' ? '#2ECC8B' : '#C9A84C',
                }} />
                {svc.status}
              </span>
            </div>

            <h2 style={{
              fontSize: '22px',
              lineHeight: 1.2,
              fontWeight: 700,
              color: 'var(--kb-text)',
              margin: 0,
              letterSpacing: '-0.01em',
            }}>
              {svc.title}
            </h2>

            <p style={{
              fontSize: '15px',
              lineHeight: 1.45,
              fontWeight: 600,
              color: 'var(--kb-accent)',
              margin: 0,
            }}>
              {svc.headline}
            </p>

            <p style={{
              fontSize: '14px',
              lineHeight: 1.55,
              color: 'var(--kb-text-secondary)',
              margin: 0,
            }}>
              {svc.description}
            </p>

            <ul style={{
              listStyle: 'none',
              padding: 0,
              margin: '4px 0 0',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}>
              {svc.deliverables.map((d, i) => (
                <li key={i} style={{
                  fontSize: '13px',
                  lineHeight: 1.45,
                  color: 'var(--kb-text)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                }}>
                  <span style={{
                    flexShrink: 0,
                    width: '14px', height: '14px',
                    marginTop: '2px',
                    borderRadius: '50%',
                    background: 'var(--kb-accent-dim)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <span style={{
                      width: '5px', height: '5px',
                      borderRadius: '50%',
                      background: 'var(--kb-accent)',
                    }} />
                  </span>
                  <span>{d}</span>
                </li>
              ))}
            </ul>

            <div style={{
              marginTop: '8px',
              paddingTop: '14px',
              borderTop: '1px solid var(--kb-border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '10px',
            }}>
              <div style={{ fontSize: '13px', color: 'var(--kb-text-muted)' }}>Investment</div>
              <div style={{
                fontSize: '15px',
                fontWeight: 700,
                color: 'var(--kb-text)',
                fontVariantNumeric: 'tabular-nums',
              }}>
                {svc.price}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div style={{
        marginTop: '36px',
        padding: '28px 32px',
        borderRadius: '14px',
        background: 'linear-gradient(135deg, rgba(201,168,76,0.10), rgba(201,168,76,0.04))',
        border: '1px solid var(--kb-accent-border)',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '20px',
      }}>
        <div style={{ maxWidth: '640px' }}>
          <h3 style={{
            fontSize: '20px', fontWeight: 700, margin: '0 0 8px',
            color: 'var(--kb-text)', letterSpacing: '-0.01em',
          }}>
            Want early access?
          </h3>
          <p style={{
            fontSize: '14px', lineHeight: 1.5, margin: 0,
            color: 'var(--kb-text-secondary)',
          }}>
            Founding KB clients get 50% off the first 6 months on every Growth Service.
            Reserve your spot before public launch.
          </p>
        </div>
        <a
          href="https://calendly.com/ericskeldon/kingdombroker"
          target="_blank"
          rel="noopener"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            padding: '14px 22px',
            background: 'var(--kb-accent)',
            color: '#0B1B3E',
            fontSize: '14px',
            fontWeight: 700,
            letterSpacing: '0.02em',
            borderRadius: '10px',
            textDecoration: 'none',
            whiteSpace: 'nowrap',
          }}
        >
          Talk to Eric →
        </a>
      </div>
    </main>
  )
}
