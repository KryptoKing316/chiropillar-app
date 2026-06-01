'use client'
import { useState } from 'react'
import KingdomBrokerRollup from '@/components/dashboard/KingdomBrokerRollup'

const F = { display: "'Playfair Display', serif", body: "'Inter', system-ui, sans-serif", mono: "'DM Mono', monospace" }
const C = { text: 'var(--kb-text)', muted: 'var(--kb-text-muted)', secondary: 'var(--kb-text-secondary)', accent: 'var(--kb-accent)', green: 'var(--kb-green)', bg: 'var(--kb-bg)', panel: 'var(--kb-bg-panel)', card: 'var(--kb-bg-card)', border: 'var(--kb-border)', accentDim: 'var(--kb-accent-dim)', accentBorder: 'var(--kb-accent-border)' }

const card = { background: C.panel, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '28px 32px' }
const goldCard = { background: C.accentDim, border: `1px solid ${C.accentBorder}`, borderRadius: '12px', padding: '28px 32px' }

export default function SeedRoundPage() {
  const [tab, setTab] = useState<'overview' | 'rollup' | 'revenue' | 'proforma'>('overview')

  const TABS = [
    { id: 'overview' as const, label: 'The Opportunity' },
    { id: 'rollup' as const, label: '$500K Acquisition Model' },
    { id: 'revenue' as const, label: '$500K Revenue Engine' },
    { id: 'proforma' as const, label: 'Combined Pro Forma' },
  ]

  return (
    <div style={{ padding: '28px 32px 80px', fontFamily: F.body, color: C.text, maxWidth: '1100px' }}>

      {/* Header */}
      <div style={{ marginBottom: '8px' }}>
        <div style={{ fontFamily: F.mono, fontSize: '11px', color: C.accent, letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: '6px' }}>
          CONFIDENTIAL · KINGDOM BROKER INC · SEED ROUND
        </div>
        <h1 style={{ fontFamily: F.display, fontSize: '34px', fontWeight: 600, margin: '0 0 10px', letterSpacing: '-0.3px' }}>
          The $5 Trillion Great Wealth Transfer
        </h1>
        <p style={{ fontSize: '17px', color: C.secondary, margin: '0 0 24px', lineHeight: 1.7, maxWidth: '780px' }}>
          Deal intelligence platform + cash flowing business acquisitions. $500K buys the best $5M business our Deal Intelligence Desk sources through relationships, referral networks, and proprietary deal flow. $500K builds the revenue engine through book authority, education, and advisory services. Combined: a vertically integrated M&A machine that compounds.
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '28px', flexWrap: 'wrap' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: '12px 22px', borderRadius: '10px', cursor: 'pointer',
            border: `1px solid ${tab === t.id ? C.accentBorder : C.border}`,
            background: tab === t.id ? C.accentDim : 'transparent',
            color: tab === t.id ? C.accent : C.muted,
            fontSize: '14px', fontWeight: tab === t.id ? 590 : 400,
            fontFamily: F.body, transition: 'all 0.15s',
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === 'overview' && <OverviewTab />}
      {tab === 'rollup' && <RollupTab />}
      {tab === 'revenue' && <RevenueTab />}
      {tab === 'proforma' && <ProFormaTab />}
    </div>
  )
}

function OverviewTab() {
  return (
    <div>
      {/* The Thesis */}
      <div style={{ ...goldCard, marginBottom: '20px' }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '24px', fontWeight: 600, color: 'var(--kb-text)', marginBottom: '14px' }}>
          The Thesis
        </div>
        <p style={{ fontSize: '17px', color: 'var(--kb-text)', lineHeight: 1.85, margin: '0 0 16px' }}>
          Kingdom Broker is not just a brokerage. It is a vertically integrated M&A intelligence platform that sources deals, matches buyers, closes transactions, and now acquires businesses directly. The $1M seed round funds two sides of the same flywheel:
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div style={{ padding: '20px', background: 'var(--kb-bg-raised)', border: '1px solid var(--kb-border)', borderRadius: '10px' }}>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '28px', fontWeight: 600, color: 'var(--kb-accent)', marginBottom: '6px' }}>$500K</div>
            <div style={{ fontSize: '15px', fontWeight: 590, color: 'var(--kb-text)', marginBottom: '6px' }}>Acquire a $5M Business</div>
            <div style={{ fontSize: '14px', color: 'var(--kb-text-secondary)', lineHeight: 1.65 }}>Our Deal Intelligence Desk sources the best deal through relationships, referral networks, and proprietary deal flow. 30% EBITDA target. SBA 7(a) financed. $500K down payment. Day 1 cash flow. Scale and roll up over 3 years to $50M portfolio valued at $40M to $90M.</div>
          </div>
          <div style={{ padding: '20px', background: 'var(--kb-bg-raised)', border: '1px solid var(--kb-border)', borderRadius: '10px' }}>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '28px', fontWeight: 600, color: 'var(--kb-green)', marginBottom: '6px' }}>$500K</div>
            <div style={{ fontSize: '15px', fontWeight: 590, color: 'var(--kb-text)', marginBottom: '6px' }}>Build the Revenue Engine</div>
            <div style={{ fontSize: '14px', color: 'var(--kb-text-secondary)', lineHeight: 1.65 }}>Book authority launch, GTM engine (LinkedIn outreach + cold email + demos), strategic platform partnerships (Jobber, ServiceTitan, Meriton), and $10K + 7% advisory engagements. Path to $2.81M net revenue in 12 months on $227K invested. 12.4x return.</div>
          </div>
        </div>
      </div>

      {/* Why This Works */}
      <div style={{ ...card, marginBottom: '20px' }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', fontWeight: 600, color: 'var(--kb-text)', marginBottom: '18px' }}>
          Why This is Lethal Combined
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '14px' }}>
          {[
            { title: 'Data Flywheel', desc: 'Every deal through our platform generates proprietary data on valuations, buyer behavior, and market multiples. More deals = better intelligence = better deals sourced.' },
            { title: 'Technology + Cash Flow', desc: 'A technology-enabled deal intelligence company valued at 10-20x revenue combined with cash flowing businesses valued at 4-6x EBITDA. The technology multiplier applies to the entire portfolio.' },
            { title: 'Vertical Integration', desc: 'We source the deal, match the buyer, close the transaction, AND own the business. Every layer of the stack generates revenue.' },
            { title: 'Platform + Portfolio', desc: 'The brokerage generates fees. The portfolio generates cash flow. The technology compounds both. Three revenue engines, one machine.' },
          ].map(i => (
            <div key={i.title} style={{ padding: '18px', background: 'var(--kb-bg-raised)', border: '1px solid var(--kb-border)', borderRadius: '10px' }}>
              <div style={{ fontSize: '15px', fontWeight: 590, color: 'var(--kb-accent)', marginBottom: '8px' }}>{i.title}</div>
              <div style={{ fontSize: '14px', color: 'var(--kb-text-secondary)', lineHeight: 1.65 }}>{i.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* What's Built */}
      <div style={{ ...card, marginBottom: '20px' }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', fontWeight: 600, color: 'var(--kb-text)', marginBottom: '18px' }}>
          What is Already Built
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
          {[
            { stat: '5,600+', label: 'Seller Leads in Database' },
            { stat: '700+', label: 'Buyer Leads (PE, Family Offices)' },
            { stat: '1', label: 'Signed Client Engagement' },
            { stat: '4', label: 'Live Demo Client Portals' },
            { stat: '43', label: 'API Endpoints (Live)' },
            { stat: '30+', label: 'App Routes (Built)' },
            { stat: '5', label: 'Branded Email Templates' },
            { stat: '120+', label: 'Demo Tasks Across Verticals' },
            { stat: '3', label: 'Sites (KB, App, Ambassador)' },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center', padding: '16px', background: 'var(--kb-bg-raised)', border: '1px solid var(--kb-border)', borderRadius: '10px' }}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '28px', fontWeight: 600, color: 'var(--kb-accent)', marginBottom: '4px' }}>{s.stat}</div>
              <div style={{ fontSize: '12px', color: 'var(--kb-text-muted)', fontWeight: 510 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Live Demo Client Portals — investor click-through */}
      <div style={{ ...goldCard, marginBottom: '20px' }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', fontWeight: 600, color: 'var(--kb-text)', marginBottom: '6px' }}>
          Live Demo Client Portals
        </div>
        <p style={{ fontSize: '14px', color: 'var(--kb-text-secondary)', lineHeight: 1.7, margin: '0 0 18px' }}>
          Click any portal below to see the actual product an investor would see if they were a Kingdom Broker client. Each is a fully working portal with industry-specific tasks, exit math, document vault, and AI buyer-matching pipeline. <strong>This is what we ship today.</strong>
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' }}>
          {[
            { slug: 'demo-hvac', name: 'Acme HVAC', city: 'Dallas, TX', rev: '$770K', ebitda: '$200K', target: '$1M-$1.5M' },
            { slug: 'demo-plumbing', name: 'Lone Star Plumbing', city: 'San Antonio, TX', rev: '$1.2M', ebitda: '$300K', target: '$1.2M-$1.5M' },
            { slug: 'demo-machineshop', name: 'Crown Tooling & Machine', city: 'Midland, TX', rev: '$3.5M', ebitda: '$720K', target: '$3.5M-$5M' },
            { slug: 'demo-roofing', name: 'Heritage Roofing', city: 'Houston, TX', rev: '$4.2M', ebitda: '$890K', target: '$3.1M-$4.9M' },
          ].map(d => (
            <a
              key={d.slug}
              href={`/clients/${d.slug}`}
              style={{
                display: 'block',
                padding: '16px 18px',
                background: 'var(--kb-bg-panel)',
                border: '1px solid var(--kb-border)',
                borderRadius: '10px',
                textDecoration: 'none',
                color: 'inherit',
                transition: 'all 0.15s',
              }}
            >
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '10px', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--kb-accent)', fontWeight: 700, marginBottom: '6px' }}>{d.city}</div>
              <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--kb-text)', marginBottom: '8px' }}>{d.name}</div>
              <div style={{ fontSize: '12px', color: 'var(--kb-text-muted)', marginBottom: '6px' }}>{d.rev} rev · {d.ebitda} EBITDA</div>
              <div style={{ fontSize: '12px', color: 'var(--kb-green)', fontWeight: 600 }}>Target Exit: {d.target}</div>
              <div style={{ fontSize: '11px', color: 'var(--kb-accent)', marginTop: '10px', fontWeight: 600 }}>View Portal →</div>
            </a>
          ))}
        </div>
      </div>

      {/* Strategic Partner Pipeline */}
      <div style={{ ...card, marginBottom: '20px' }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', fontWeight: 600, color: 'var(--kb-text)', marginBottom: '6px' }}>
          Strategic Partner Pipeline (Active Outreach)
        </div>
        <p style={{ fontSize: '14px', color: 'var(--kb-text-secondary)', lineHeight: 1.7, margin: '0 0 18px' }}>
          7 partnerships in active outreach across 2 categories: app-marketplace integrations (where KB embeds as the M&amp;A advisor in 110K+ trades operator dashboards) and strategic acquirers (where KB sources qualified $5-20M tuck-ins for established roll-up platforms). <strong>Neither ServiceTitan nor Jobber has an M&amp;A advisor in their marketplace today — open whitespace.</strong>
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px' }}>
          {[
            { name: 'Jobber', type: 'Platform Partner', priority: '1st', detail: '~100K customers · CRO Shawn Cadeau · Marketplace listing + free valuation widget API + 15-20% rev-share. 30-45 days to launch.' },
            { name: 'ServiceTitan', type: 'Platform Partner ($20B public)', priority: '2nd', detail: '~10,800 customers · CBO Connor Theilmann · 3-tier program (Silver/Gold/Titanium). Equity discussion only at Titanium tier.' },
            { name: 'Midwest Hose & Specialty', type: 'Strategic Acquirer', priority: 'Highest', detail: 'OKC, $100-250M rev · Ryan Sparkman (next-gen). Industrial hose distribution. KB pilot territory.' },
            { name: 'Meriton LLC', type: 'HVAC Roll-Up', priority: 'High', detail: 'Irving TX, $380M consolidated · Jerry Braun (CEO, Catholic Charities Dallas board — faith-aligned warm path).' },
            { name: 'Wholesale Electric Supply Co.', type: 'Strategic Acquirer', priority: 'High', detail: 'Texarkana TX, 70-85+ branches across 7 states · Buddy McCulloch (3-gen family business).' },
            { name: 'Houk Air Conditioning', type: 'Acquirer or Future Seller', priority: 'High', detail: '$180M family-owned HVAC, 350 employees, 4 TX metros · Doug Waidelich (President). Just opened HQ down the highway from KB Grand Prairie.' },
            { name: 'Molto Properties', type: 'Industrial RE Partnership', priority: 'Medium', detail: 'Chicago HQ, $1.2B+ AUM · Ryan Lovell (TX VP). Their tenants ARE KB pipeline.' },
          ].map(p => (
            <div key={p.name} style={{ padding: '14px 16px', background: 'var(--kb-bg-raised)', border: '1px solid var(--kb-border)', borderRadius: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--kb-text)' }}>{p.name}</div>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '9px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--kb-accent)', fontWeight: 700, padding: '2px 7px', borderRadius: '4px', background: 'var(--kb-accent-dim)' }}>{p.priority}</div>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--kb-accent)', fontWeight: 510, marginBottom: '6px' }}>{p.type}</div>
              <div style={{ fontSize: '12px', color: 'var(--kb-text-secondary)', lineHeight: 1.5 }}>{p.detail}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Partners */}
      <div style={{ ...card, marginBottom: '20px' }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', fontWeight: 600, color: 'var(--kb-text)', marginBottom: '18px' }}>
          Strategic Partners
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {[
            { name: 'Dennis Yu', role: 'Co-Founder', org: 'BlitzMetrics', desc: '$1B+ in managed ad spend for Nike, Red Bull, Starbucks, Golden State Warriors. Brings marketing and growth strategy to Kingdom Broker.', img: '/partner-dennis-yu.jpeg', initials: 'DY' },
            { name: 'Scott McGrath', role: 'Partner', org: 'Nexxess Business Advisors', desc: 'Trust and estate planning. 1,000+ trusts created. 10,000+ analyzed. Saves sellers 15-30% in taxes before exit. Bedford, TX.', img: '/partner-scott-mcgrath.jpg', initials: 'SM' },
            { name: 'Strategic Platform Partners', role: 'Distribution Layer', org: 'Jobber + ServiceTitan + Meriton', desc: 'Two app-marketplace partnerships in active outreach (Jobber CRO Shawn Cadeau, ServiceTitan CBO Connor Theilmann). Embedded distribution into 110K+ trades operators. Plus 5 strategic acquirers in pipeline (Meriton HVAC roll-up, Wholesale Electric, Midwest Hose, Houk, Molto Properties).', initials: 'SP' },
            { name: 'Cory Huddleston', role: 'Strategic Partner', org: 'Sypnios Private Equity', desc: 'PE firm investing in leaders aligned with their calling. Portfolio: KMG, Agora, BAS, Solutions Now. DFW, Kansas City, OKC, Naples.', img: '/partner-cory-huddleston.jpg', initials: 'CH' },
            { name: 'Sean Kouplen', role: 'Strategic Advisor', org: '51 Companies + $5B Bank', desc: '51 boring business companies in portfolio. Runs a $5B bank. Proves the roll-up thesis at massive scale with values-driven leadership.', img: '/partner-sean-kouplen.webp', initials: 'SK' },
            { name: 'Pete VanderVeen', role: 'Capital Partner', org: 'Agora Partners Holdings', desc: 'Private credit fund. ~12% targeted returns. First-lien secured. KB gets GP equity + finders fee on every deal with capital deployed.', img: '/partner-pete-vanderveen.jpg', initials: 'PV' },
          ].map(p => (
            <div key={p.name} style={{ padding: '20px', background: 'var(--kb-bg-raised)', border: '1px solid var(--kb-border)', borderRadius: '10px', display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
              <div style={{
                width: '52px', height: '52px', borderRadius: '50%', flexShrink: 0, overflow: 'hidden',
                background: p.img ? 'transparent' : 'linear-gradient(135deg, #C9A84C, #E8C96A)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '18px', fontWeight: 600, color: '#0B1B3E',
              }}>
                {p.img ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.img} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : p.initials}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '16px', fontWeight: 590, color: 'var(--kb-text)', marginBottom: '2px' }}>{p.name}</div>
                <div style={{ fontSize: '12px', color: 'var(--kb-accent)', fontWeight: 510, marginBottom: '8px' }}>{p.role} · {p.org}</div>
                <div style={{ fontSize: '13px', color: 'var(--kb-text-secondary)', lineHeight: 1.6 }}>{p.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Target Acquisition Profile */}
      <div style={{ ...card, marginBottom: '20px' }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', fontWeight: 600, color: 'var(--kb-text)', marginBottom: '18px' }}>
          Target Acquisition: The Ideal $5M Texas Deal
        </div>
        <p style={{ fontSize: '15px', color: 'var(--kb-text-secondary)', lineHeight: 1.7, margin: '0 0 18px' }}>
          We are not buying anything that shows up on a listing site. We are hunting specific businesses through relationships, referral networks, and our Deal Intelligence Desk. Here is the exact profile we target:
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
          <div style={{ padding: '20px', background: 'var(--kb-accent-dim)', border: '1px solid var(--kb-accent-border)', borderRadius: '10px' }}>
            <div style={{ fontSize: '14px', fontWeight: 590, color: 'var(--kb-accent)', marginBottom: '12px' }}>The Business We Buy</div>
            {['$3M-$7M revenue, sweet spot $5M', 'Essential services: HVAC, plumbing, electrical, waste, manufacturing', '25-35% EBITDA margins (not 10-15%)', '10+ years operating, established reputation', '15+ employees with licensed technicians', 'DFW / Texas / Sun Belt markets', 'Owner is 55+ and ready to transition', 'Recurring revenue from service contracts', 'Clean books, verifiable financials, low customer concentration'].map(item => (
              <div key={item} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', marginBottom: '8px', fontSize: '14px', color: 'var(--kb-text)', lineHeight: 1.6 }}>
                <span style={{ color: 'var(--kb-green)', flexShrink: 0, marginTop: '3px' }}><svg viewBox="0 0 14 14" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="3,7 6,10 11,4"/></svg></span>
                {item}
              </div>
            ))}
          </div>
          <div style={{ padding: '20px', background: 'var(--kb-bg-raised)', border: '1px solid var(--kb-border)', borderRadius: '10px' }}>
            <div style={{ fontSize: '14px', fontWeight: 590, color: 'var(--kb-text)', marginBottom: '12px' }}>Why Texas, Why Now</div>
            {[
              { stat: '29M', label: 'People in Texas, fastest growing state in the US' },
              { stat: '0%', label: 'State income tax. More cash stays in the business.' },
              { stat: '#1', label: 'State for small business growth (Forbes, 2025)' },
              { stat: '10K+', label: 'Baby boomers retiring daily. Once in a generation buyer\'s market.' },
              { stat: '4-6x', label: 'EBITDA multiples for essential services in DFW (we buy at 3-4x)' },
              { stat: '$50B+', label: 'Annual transaction volume in lower middle market acquisitions' },
            ].map(s => (
              <div key={s.label} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '20px', fontWeight: 600, color: 'var(--kb-accent)', minWidth: '60px' }}>{s.stat}</div>
                <div style={{ fontSize: '13px', color: 'var(--kb-text-secondary)', lineHeight: 1.6 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ padding: '20px', background: 'var(--kb-bg-raised)', border: '1px solid var(--kb-border)', borderRadius: '10px' }}>
          <div style={{ fontSize: '14px', fontWeight: 590, color: 'var(--kb-accent)', marginBottom: '12px' }}>Eric Skeldon's Scaling Playbook</div>
          <p style={{ fontSize: '14px', color: 'var(--kb-text-secondary)', lineHeight: 1.7, margin: '0 0 12px' }}>
            Eric does not just find the deal. He scales it. Here is what happens in the first 12 months after acquisition:
          </p>
          {[
            'Day 1-30: Install financial controls, normalize reporting, meet every employee and key customer personally',
            'Month 1-3: Document every process (SOPs for operations, sales, service, hiring). Reduce owner dependency to zero.',
            'Month 3-6: Activate the Deal Intelligence Desk to source bolt-on targets. Launch marketing and brand authority campaigns to drive inbound seller leads.',
            'Month 6-9: First bolt-on acquisition. Use anchor cash flow as equity contribution. EBITDA stacks. Buyers start seeing a platform.',
            'Month 9-12: Centralize back-office across both businesses. Shared ops, branding, and management layer. Multiple begins expanding from 4x toward 5-6x.',
            'Year 2-3: Continue bolt-on acquisitions through relationships and referral network. Each acquisition adds revenue AND increases the multiple on the entire portfolio.',
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', marginBottom: '10px', fontSize: '14px', color: 'var(--kb-text)', lineHeight: 1.65 }}>
              <span style={{ color: 'var(--kb-accent)', fontWeight: 590, flexShrink: 0 }}>{i + 1}.</span>
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* Top Industries to Roll Up */}
      <div style={{ ...card, marginBottom: '20px' }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', fontWeight: 600, color: 'var(--kb-text)', marginBottom: '18px' }}>
          Top 5 Industries to Roll Up in Texas
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '14px' }}>
          {[
            { name: 'HVAC / Mechanical', mult: '4-6x', margin: '25-35%', why: 'Recurring maintenance contracts, licensed labor moat, DFW heat drives year-round demand' },
            { name: 'Waste / Environmental', mult: '4-6x', margin: '30-40%', why: 'Route density creates natural monopoly. Contract based. Hard to displace once established.' },
            { name: 'Specialty Manufacturing', mult: '3.5-5.5x', margin: '20-30%', why: 'DFW corridor has massive demand. Equipment and workforce create barriers to entry.' },
            { name: 'Plumbing / Electrical', mult: '3.5-5.5x', margin: '25-35%', why: 'Master license requirement limits competition. 24/7 emergency service drives premium pricing.' },
            { name: 'Dental / Medical', mult: '4-7x', margin: '30-45%', why: 'Patient base is the moat. DSOs paying premium multiples. Trust planning saves doctors 30% on exit.' },
          ].map(ind => (
            <div key={ind.name} style={{ padding: '18px', background: 'var(--kb-bg-raised)', border: '1px solid var(--kb-border)', borderRadius: '10px' }}>
              <div style={{ fontSize: '15px', fontWeight: 590, color: 'var(--kb-text)', marginBottom: '4px' }}>{ind.name}</div>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', color: 'var(--kb-accent)', fontWeight: 510, padding: '2px 8px', background: 'var(--kb-accent-dim)', border: '1px solid var(--kb-accent-border)', borderRadius: '4px' }}>{ind.mult} EBITDA</span>
                <span style={{ fontSize: '12px', color: 'var(--kb-green)', fontWeight: 510, padding: '2px 8px', background: 'rgba(46,204,139,0.08)', border: '1px solid rgba(46,204,139,0.2)', borderRadius: '4px' }}>{ind.margin} margin</span>
              </div>
              <div style={{ fontSize: '13px', color: 'var(--kb-text-secondary)', lineHeight: 1.6 }}>{ind.why}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Fee Structure Visualization — from kingdombroker.com/sustainable */}
      <div style={{ background: 'var(--kb-bg-panel)', border: '1px solid var(--kb-border)', borderRadius: '16px', padding: '40px 36px', marginBottom: '20px', textAlign: 'center' }}>
        <div style={{ fontFamily: F.mono, fontSize: '11px', color: C.accent, letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: '8px' }}>Exit Economics</div>
        <div style={{ fontFamily: F.display, fontSize: '28px', fontWeight: 600, color: C.text, marginBottom: '10px' }}>The Success Fee That Pays You Back</div>
        <p style={{ fontSize: '16px', color: C.secondary, lineHeight: 1.7, maxWidth: '680px', margin: '0 auto 12px' }}>
          7-10% sliding scale fee. Including charity. Our success fee is not just a cost, it is a flywheel. Designed so your exit keeps working for you, your community, and the next generation of purpose driven businesses.
        </p>
        <p style={{ fontFamily: F.display, fontSize: '16px', color: C.text, fontStyle: 'italic', marginBottom: '32px' }}>
          "A good man leaves an inheritance for his children's children." Proverbs 13:22
        </p>

        <div style={{ fontFamily: F.mono, fontSize: '11px', color: C.accent, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '6px' }}>Where Your Fee Goes</div>
        <div style={{ fontFamily: F.display, fontSize: '22px', fontWeight: 600, color: C.text, marginBottom: '6px' }}>One Fee. Three Purposes.</div>
        <p style={{ fontSize: '14px', color: C.secondary, marginBottom: '28px' }}>Not a transaction, a legacy investment with a built in dividend and a Kingdom impact.</p>

        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '40px', flexWrap: 'wrap', marginBottom: '28px' }}>
          {/* Pie Chart */}
          <div style={{ position: 'relative', width: '180px', height: '180px', borderRadius: '50%', background: `conic-gradient(#C9A84C 0deg 180deg, #2ECC8B 180deg 216deg, #4A9EDB 216deg 360deg)`, flexShrink: 0 }}>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '100px', height: '100px', borderRadius: '50%', background: 'var(--kb-bg-panel)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ fontFamily: F.display, fontSize: '26px', fontWeight: 600, color: C.accent }}>7-10%</div>
              <div style={{ fontSize: '10px', color: C.muted, fontWeight: 510 }}>Total Fee</div>
            </div>
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
            {[
              { pct: '50%', color: '#C9A84C', label: 'Exit Operations', desc: 'Brokerage, marketing, buyer matching & deal execution' },
              { pct: '10%', color: '#2ECC8B', label: 'Your Charity', desc: 'Directed to the cause or ministry you choose' },
              { pct: '40%', color: '#4A9EDB', label: 'Roll-Up Fund', desc: 'Reinvested into our own acquisitions for 3-year exit' },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: F.display, fontSize: '16px', fontWeight: 600, flexShrink: 0 }}>{item.pct}</div>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 590, color: C.text }}>{item.label}</div>
                  <div style={{ fontSize: '13px', color: C.secondary, lineHeight: 1.5 }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sliding Scale */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
          {[
            { range: '$1M-$3M', rate: '10%' },
            { range: '$3M-$7M', rate: '8%' },
            { range: '$7M-$10M+', rate: '7%' },
          ].map(tier => (
            <div key={tier.range} style={{ padding: '16px 28px', background: 'var(--kb-bg-raised)', border: '1px solid var(--kb-border)', borderRadius: '10px', textAlign: 'center' }}>
              <div style={{ fontFamily: F.display, fontSize: '28px', fontWeight: 600, color: C.accent }}>{tier.rate}</div>
              <div style={{ fontSize: '15px', color: C.text, fontWeight: 510, marginTop: '6px' }}>{tier.range}</div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: '14px', color: C.text, marginTop: '14px', fontWeight: 510 }}>Bigger deal, lower rate. 40% of every fee is reinvested into acquisitions on your behalf.</div>
      </div>

      {/* The Ask */}
      <div style={{ ...goldCard }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '24px', fontWeight: 600, color: 'var(--kb-text)', marginBottom: '14px' }}>
          The Ask: $1M Seed Round
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '18px' }}>
          <div style={{ padding: '20px', background: 'var(--kb-bg-raised)', border: '1px solid var(--kb-border)', borderRadius: '10px', textAlign: 'center' }}>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '36px', fontWeight: 600, color: 'var(--kb-accent)' }}>$500K</div>
            <div style={{ fontSize: '14px', fontWeight: 590, color: 'var(--kb-text)', marginTop: '4px' }}>Acquire First Business</div>
            <div style={{ fontSize: '13px', color: 'var(--kb-text-secondary)', marginTop: '6px' }}>SBA 7(a) down payment on $5M business. 30% EBITDA. Day 1 cash flow.</div>
          </div>
          <div style={{ padding: '20px', background: 'var(--kb-bg-raised)', border: '1px solid var(--kb-border)', borderRadius: '10px', textAlign: 'center' }}>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '36px', fontWeight: 600, color: 'var(--kb-green)' }}>$500K</div>
            <div style={{ fontSize: '14px', fontWeight: 590, color: 'var(--kb-text)', marginTop: '4px' }}>Revenue Engine + Operations</div>
            <div style={{ fontSize: '13px', color: 'var(--kb-text-secondary)', marginTop: '6px' }}>Book launch, KWS education, advisory ops, AI platform scaling.</div>
          </div>
        </div>
        <div style={{ padding: '16px 20px', background: 'var(--kb-bg-raised)', border: '1px solid var(--kb-border)', borderRadius: '10px' }}>
          <div style={{ fontSize: '14px', color: 'var(--kb-text)', lineHeight: 1.7 }}>
            <strong style={{ color: 'var(--kb-accent)' }}>3-Year Target:</strong> $50M portfolio revenue, $10M-$15M EBITDA, valued at $40M-$90M at exit. Plus ongoing brokerage, education, and technology revenue. $500K in, potential $20M-$40M+ out.
          </div>
        </div>
      </div>
    </div>
  )
}

function RollupTab() {
  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', fontWeight: 600, color: 'var(--kb-text)', marginBottom: '8px' }}>
          $500K Acquisition + Roll-Up Model
        </div>
        <p style={{ fontSize: '15px', color: 'var(--kb-text-secondary)', lineHeight: 1.7, margin: '0 0 20px' }}>
          Our Deal Intelligence Desk sources the best $5M business through direct relationships, broker referral networks, and proprietary deal flow that no one else sees. Use SBA 7(a) financing (10% down, 10-year term). Scale operations, add bolt-on acquisitions through the same network, and build a $50M portfolio valued at $40M-$90M over 3-5 years.
        </p>
      </div>
      <div style={{ background: '#faf9f6', border: '1px solid var(--kb-border)', borderRadius: '12px', padding: '16px', overflow: 'auto' }}>
        <KingdomBrokerRollup />
      </div>
    </div>
  )
}

function RevenueTab() {
  return (
    <div>
      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', fontWeight: 600, color: 'var(--kb-text)', marginBottom: '8px' }}>
        $500K Revenue Engine: Budget + Revenue
      </div>
      <p style={{ fontSize: '15px', color: 'var(--kb-text-secondary)', lineHeight: 1.7, margin: '0 0 24px' }}>
        The $500K funds the platform, the book launch, the education business, and the outreach operation. Here is where it goes, and what it generates.
      </p>

      {/* HOW THE $500K IS SPENT */}
      <div style={{ background: 'var(--kb-bg-panel)', border: '1px solid var(--kb-border)', borderRadius: '12px', padding: '28px', marginBottom: '20px' }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '20px', fontWeight: 600, color: 'var(--kb-text)', marginBottom: '18px' }}>
          How the $500K is Deployed
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '14px' }}>
          {[
            { item: 'Book Launch + Authority', amount: '$75K', desc: '"The Great Wealth Transfer" book funnel. Positions Eric as the authority. Drives leads at every price point.' },
            { item: 'Education + Authority', amount: '$100K', desc: 'Kingdom Wealth Society book funnel, /case-studies content, comparison page (KB vs traditional broker), 30-day pre-approach polish before partner outreach.' },
            { item: 'Outreach + Deal Sourcing', amount: '$100K', desc: 'Cold outreach, ambassador network build, strategic alliance partnerships (CPAs, attorneys, wealth advisors).' },
            { item: 'Technology + Operations', amount: '$75K', desc: 'Deal Intelligence Desk, bookkeeping automation, CRM, knowledge transfer system, platform maintenance.' },
            { item: 'Team + Advisory', amount: '$100K', desc: 'First hires: deal analyst, outreach coordinator, operations support. Advisory board compensation.' },
            { item: 'Working Capital Reserve', amount: '$50K', desc: 'Buffer for opportunities, unexpected costs, and bridge between revenue milestones.' },
          ].map(b => (
            <div key={b.item} style={{ padding: '16px', background: 'var(--kb-bg-raised)', border: '1px solid var(--kb-border)', borderRadius: '10px' }}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', fontWeight: 600, color: 'var(--kb-accent)', marginBottom: '4px' }}>{b.amount}</div>
              <div style={{ fontSize: '14px', fontWeight: 590, color: 'var(--kb-text)', marginBottom: '6px' }}>{b.item}</div>
              <div style={{ fontSize: '13px', color: 'var(--kb-text-secondary)', lineHeight: 1.6 }}>{b.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* REVENUE STREAMS — THE PRODUCT LADDER */}
      <div style={{ background: 'var(--kb-accent-dim)', border: '1px solid var(--kb-accent-border)', borderRadius: '12px', padding: '28px', marginBottom: '20px' }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '20px', fontWeight: 600, color: 'var(--kb-text)', marginBottom: '6px' }}>
          The Revenue Ladder: $27 to $90K Per Client
        </div>
        <p style={{ fontSize: '14px', color: 'var(--kb-text-secondary)', lineHeight: 1.7, margin: '0 0 18px' }}>
          Every lead enters through the book or free valuation. Each step up the ladder increases revenue per client. Trust sales at exit are the highest margin product we offer.
        </p>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--kb-accent-border)' }}>
                {['Product', 'Price', 'Margin', 'Volume Target'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: '11px', fontWeight: 590, color: 'var(--kb-accent)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { product: 'The Great Wealth Transfer (book)', price: '$27', margin: '80%+', volume: '500-2,000 copies/mo' },
                { product: 'Kingdom Wealth Society (course)', price: '$97', margin: '90%', volume: '100-300/mo' },
                { product: 'Empowered Starter (self-serve)', price: '$497 one-time', margin: '85%', volume: '20-50/mo' },
                { product: 'Empowered Growth (coaching)', price: '$997/mo × 6 mo', margin: '70%', volume: '10-30 clients' },
                { product: 'Empowered Elite (done for you)', price: '$4,997/mo × 3 mo', margin: '60%', volume: '5-15 clients' },
                { product: 'Brokerage Success Fee', price: '7-10% of deal', margin: '50% (after ops)', volume: '4-12 deals/yr' },
                { product: 'Trust Planning (Nexxess)', price: '30% of $30K-$90K trust', margin: '100% referral fee', volume: 'Every exiting seller' },
                { product: 'Bookkeeping + Accounting', price: '$500-$2,000/mo', margin: '60%', volume: '20-50 clients' },
              ].map((r, i) => (
                <tr key={r.product} style={{ borderBottom: '1px solid var(--kb-border)', background: i >= 5 ? 'rgba(46,204,139,0.04)' : 'transparent' }}>
                  <td style={{ padding: '12px 14px', fontWeight: i >= 5 ? 590 : 400, color: 'var(--kb-text)' }}>{r.product}</td>
                  <td style={{ padding: '12px 14px', color: 'var(--kb-accent)', fontWeight: 590 }}>{r.price}</td>
                  <td style={{ padding: '12px 14px', color: 'var(--kb-green)', fontWeight: 510 }}>{r.margin}</td>
                  <td style={{ padding: '12px 14px', color: 'var(--kb-text-secondary)' }}>{r.volume}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ marginTop: '14px', padding: '14px 18px', background: 'var(--kb-bg-raised)', border: '1px solid var(--kb-border)', borderRadius: '8px' }}>
          <div style={{ fontSize: '14px', color: 'var(--kb-text)', lineHeight: 1.7 }}>
            <strong style={{ color: 'var(--kb-accent)' }}>The Trust Sale is the Highest Margin Product.</strong> Every business owner who exits through Kingdom Broker gets introduced to Scott McGrath at Nexxess for trust planning. The trust costs the seller $30K-$90K and saves them $750K-$3M in taxes. We earn 30% of the trust sale as a referral fee. On a $60K trust, that is $18K in pure profit per exiting client, on top of the brokerage fee.
          </div>
        </div>
      </div>

      {/* EMPOWERED TIERS */}
      <div style={{ background: 'var(--kb-bg-panel)', border: '1px solid var(--kb-border)', borderRadius: '12px', padding: '28px', marginBottom: '20px' }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '20px', fontWeight: 600, color: 'var(--kb-text)', marginBottom: '6px' }}>
          Empowered: Seller Advisory Tiers
        </div>
        <p style={{ fontSize: '14px', color: 'var(--kb-text-secondary)', lineHeight: 1.7, margin: '0 0 18px' }}>
          Sellers who are not ready to list today still pay to prepare. These advisory tiers generate recurring revenue while building the seller pipeline for future brokerage fees.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
          {[
            {
              tier: 'Starter', price: '$497', freq: 'one-time', color: 'var(--kb-text-secondary)',
              features: ['Valuation report', 'Exit readiness scorecard', 'Books cleanup checklist', 'Monthly group coaching', 'Buyer network access'],
              earn: '$497 in prep fees + 20% at close',
            },
            {
              tier: 'Growth', price: '$997/mo', freq: '6 month minimum', color: 'var(--kb-accent)',
              features: ['Exit coach with daily prompts', 'Weekly group coaching call', '1:1 advisor call per month', 'EBITDA + books cleanup plan', 'Active buyer matching'],
              earn: '$5,982 in prep fees + 20% at close',
            },
            {
              tier: 'Elite', price: '$4,997/mo', freq: '3 month minimum', color: 'var(--kb-green)',
              features: ['Dedicated KB advisor, white glove', 'Weekly 1:1 advisory calls', 'Full CIM prepared by KB team', 'Books + financials cleaned up', 'Active buyer outreach from day one', 'Priority listing when ready'],
              earn: '$14,991 in prep fees + 20% at close',
            },
          ].map(t => (
            <div key={t.tier} style={{ padding: '22px', background: 'var(--kb-bg-raised)', border: '1px solid var(--kb-border)', borderRadius: '10px' }}>
              <div style={{ fontSize: '12px', color: 'var(--kb-text-muted)', fontWeight: 510, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '4px' }}>{t.tier}</div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '28px', fontWeight: 600, color: t.color, marginBottom: '2px' }}>{t.price}</div>
              <div style={{ fontSize: '12px', color: 'var(--kb-text-muted)', marginBottom: '14px' }}>{t.freq}</div>
              {t.features.map(f => (
                <div key={f} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginBottom: '6px', fontSize: '13px', color: 'var(--kb-text-secondary)', lineHeight: 1.5 }}>
                  <span style={{ color: 'var(--kb-green)', flexShrink: 0, marginTop: '2px' }}><svg viewBox="0 0 14 14" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="3,7 6,10 11,4"/></svg></span>
                  {f}
                </div>
              ))}
              <div style={{ marginTop: '12px', padding: '8px 12px', background: 'var(--kb-accent-dim)', border: '1px solid var(--kb-accent-border)', borderRadius: '6px', fontSize: '12px', color: 'var(--kb-accent)', fontWeight: 510 }}>
                {t.earn}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* PROJECTED PLATFORM REVENUE */}
      <div style={{ background: 'var(--kb-bg-panel)', border: '1px solid var(--kb-border)', borderRadius: '12px', padding: '28px', marginBottom: '20px' }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '20px', fontWeight: 600, color: 'var(--kb-text)', marginBottom: '18px' }}>
          Year 1 Platform Revenue Projection (Conservative)
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--kb-accent-border)' }}>
                {['Revenue Stream', 'Avg Price', 'Volume', 'Annual Revenue'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: h === 'Annual Revenue' ? 'right' : 'left', fontSize: '11px', fontWeight: 590, color: 'var(--kb-accent)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { stream: 'Book Sales ($27-$97)', price: '$47 avg', vol: '200/mo', rev: '$112,800' },
                { stream: 'Empowered Starter', price: '$497', vol: '15/mo', rev: '$89,460' },
                { stream: 'Empowered Growth', price: '$997/mo', vol: '10 clients', rev: '$119,640' },
                { stream: 'Empowered Elite', price: '$4,997/mo', vol: '3 clients', rev: '$179,892' },
                { stream: 'Brokerage Fees (7-10%)', price: '$250K avg', vol: '4 deals', rev: '$1,000,000' },
                { stream: 'Trust Referral Fees (30%)', price: '$18K avg', vol: '4 trusts', rev: '$72,000' },
                { stream: 'Bookkeeping/Accounting', price: '$1,000/mo', vol: '15 clients', rev: '$180,000' },
                { stream: 'Ambassador Payouts', price: '-20%', vol: '', rev: '($200,000)' },
              ].map((r, i) => (
                <tr key={r.stream} style={{ borderBottom: '1px solid var(--kb-border)', background: r.stream.includes('Ambassador') ? 'rgba(232,73,73,0.04)' : i === 4 ? 'rgba(46,204,139,0.04)' : 'transparent' }}>
                  <td style={{ padding: '12px 14px', color: 'var(--kb-text)', fontWeight: i === 4 ? 590 : 400 }}>{r.stream}</td>
                  <td style={{ padding: '12px 14px', color: 'var(--kb-text-secondary)' }}>{r.price}</td>
                  <td style={{ padding: '12px 14px', color: 'var(--kb-text-secondary)' }}>{r.vol}</td>
                  <td style={{ padding: '12px 14px', textAlign: 'right', color: r.stream.includes('Ambassador') ? 'var(--kb-red, #E84949)' : 'var(--kb-green)', fontWeight: 590 }}>{r.rev}</td>
                </tr>
              ))}
              <tr style={{ borderTop: '2px solid var(--kb-accent-border)' }}>
                <td colSpan={3} style={{ padding: '14px', fontFamily: "'Playfair Display', serif", fontSize: '16px', fontWeight: 600, color: 'var(--kb-text)' }}>Year 1 Net Platform Revenue</td>
                <td style={{ padding: '14px', textAlign: 'right', fontFamily: "'Playfair Display', serif", fontSize: '22px', fontWeight: 600, color: 'var(--kb-green)' }}>$1.55M</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Fee Flywheel */}
      <div style={{ background: 'var(--kb-accent-dim)', border: '1px solid var(--kb-accent-border)', borderRadius: '12px', padding: '28px', marginBottom: '20px' }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '20px', fontWeight: 600, color: 'var(--kb-text)', marginBottom: '12px' }}>
          The Fee Structure: Every Deal Compounds
        </div>
        <p style={{ fontSize: '15px', color: 'var(--kb-text-secondary)', lineHeight: 1.7, margin: '0 0 14px' }}>
          Every brokerage fee is split three ways: 50% operations, 10% charity (seller's choice), 40% reinvested into our own acquisitions. Every deal we close funds the next deal we buy. The fee is not a cost, it is a compounding asset.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
          {[
            { pct: '50%', label: 'Exit Operations', desc: 'Brokerage, marketing, buyer matching' },
            { pct: '10%', label: 'Charity', desc: 'Directed to seller\'s cause or ministry' },
            { pct: '40%', label: 'Roll-Up Fund', desc: 'Reinvested into our own acquisitions' },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center', padding: '24px', background: 'var(--kb-bg-raised)', border: '1px solid var(--kb-border)', borderRadius: '10px' }}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '36px', fontWeight: 600, color: 'var(--kb-accent)' }}>{s.pct}</div>
              <div style={{ fontSize: '16px', fontWeight: 590, color: 'var(--kb-text)', marginTop: '6px' }}>{s.label}</div>
              <div style={{ fontSize: '14px', color: 'var(--kb-text-secondary)', marginTop: '6px' }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ fontSize: '14px', color: 'var(--kb-text-secondary)', lineHeight: 1.7 }}>
        <strong style={{ color: 'var(--kb-text)' }}>Full revenue plan:</strong>{' '}
        <a href="https://kingdombroker.com/revenueplan" target="_blank" style={{ color: 'var(--kb-accent)' }}>kingdombroker.com/revenueplan</a>
        {' | '}
        <strong style={{ color: 'var(--kb-text)' }}>Fee structure:</strong>{' '}
        <a href="https://kingdombroker.com/sustainable" target="_blank" style={{ color: 'var(--kb-accent)' }}>kingdombroker.com/sustainable</a>
        {' | '}
        <strong style={{ color: 'var(--kb-text)' }}>Empowered tiers:</strong>{' '}
        <a href="https://kingdombroker.com/empowered" target="_blank" style={{ color: 'var(--kb-accent)' }}>kingdombroker.com/empowered</a>
      </div>
    </div>
  )
}

function ProFormaTab() {
  const years = [
    { year: 'Year 1', brokerage: 200000, education: 50000, twin: 25000, portfolio: 1500000, ebitda: 350000, totalRev: 1775000 },
    { year: 'Year 2', brokerage: 400000, education: 150000, twin: 100000, portfolio: 3000000, ebitda: 900000, totalRev: 3650000 },
    { year: 'Year 3', brokerage: 600000, education: 250000, twin: 200000, portfolio: 5000000, ebitda: 1500000, totalRev: 6050000 },
    { year: 'Year 4', brokerage: 800000, education: 350000, twin: 300000, portfolio: 10000000, ebitda: 3000000, totalRev: 11450000 },
    { year: 'Year 5', brokerage: 1000000, education: 500000, twin: 500000, portfolio: 20000000, ebitda: 6000000, totalRev: 22000000 },
  ]

  function fmt(n: number) {
    if (n >= 1000000) return '$' + (n / 1000000).toFixed(1) + 'M'
    return '$' + (n / 1000).toFixed(0) + 'K'
  }

  return (
    <div>
      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', fontWeight: 600, color: 'var(--kb-text)', marginBottom: '8px' }}>
        Combined Pro Forma: Platform + Portfolio
      </div>
      <p style={{ fontSize: '15px', color: 'var(--kb-text-secondary)', lineHeight: 1.7, margin: '0 0 24px' }}>
        This is where it gets powerful. A technology-enabled deal intelligence company (valued at 10-20x revenue) combined with cash flowing businesses (valued at 4-6x EBITDA). The technology multiplier applies to the combined entity. More deals generate more proprietary data. Better data finds better deals. Better deals generate more cash flow. The cycle compounds.
      </p>

      {/* Pro Forma Table */}
      <div style={{ overflowX: 'auto', marginBottom: '24px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--kb-accent-border)' }}>
              {['', 'Brokerage Fees', 'Education', 'Subscriptions', 'Portfolio Revenue', 'Portfolio EBITDA', 'Total Revenue'].map(h => (
                <th key={h} style={{ padding: '12px 14px', textAlign: h === '' ? 'left' : 'right', fontSize: '11px', fontWeight: 590, color: 'var(--kb-accent)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {years.map((y, i) => (
              <tr key={y.year} style={{ borderBottom: '1px solid var(--kb-border)', background: i === 4 ? 'var(--kb-accent-dim)' : 'transparent' }}>
                <td style={{ padding: '14px', fontWeight: 590, color: 'var(--kb-text)' }}>{y.year}</td>
                <td style={{ padding: '14px', textAlign: 'right', color: 'var(--kb-text-secondary)' }}>{fmt(y.brokerage)}</td>
                <td style={{ padding: '14px', textAlign: 'right', color: 'var(--kb-text-secondary)' }}>{fmt(y.education)}</td>
                <td style={{ padding: '14px', textAlign: 'right', color: 'var(--kb-text-secondary)' }}>{fmt(y.twin)}</td>
                <td style={{ padding: '14px', textAlign: 'right', color: 'var(--kb-text-secondary)' }}>{fmt(y.portfolio)}</td>
                <td style={{ padding: '14px', textAlign: 'right', color: 'var(--kb-green)', fontWeight: 590 }}>{fmt(y.ebitda)}</td>
                <td style={{ padding: '14px', textAlign: 'right', fontFamily: "'Playfair Display', serif", fontSize: '16px', color: i === 4 ? 'var(--kb-accent)' : 'var(--kb-text)', fontWeight: 600 }}>{fmt(y.totalRev)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Valuation Scenarios */}
      <div style={{ ...goldCard, marginBottom: '24px' }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', fontWeight: 600, color: 'var(--kb-text)', marginBottom: '18px' }}>
          Year 5 Valuation Scenarios
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          {[
            { label: 'Conservative', desc: 'Portfolio at 4x EBITDA + Platform at 5x revenue', value: '$34M', color: 'var(--kb-text-secondary)' },
            { label: 'Base Case', desc: 'Portfolio at 5x EBITDA + Platform at 10x revenue', value: '$50M', color: 'var(--kb-accent)' },
            { label: 'Premium', desc: 'Portfolio at 6x EBITDA + Platform at 15x revenue', value: '$75M+', color: 'var(--kb-green)' },
          ].map(v => (
            <div key={v.label} style={{ textAlign: 'center', padding: '24px', background: 'var(--kb-bg-raised)', border: '1px solid var(--kb-border)', borderRadius: '12px' }}>
              <div style={{ fontSize: '13px', color: 'var(--kb-text-muted)', fontWeight: 510, marginBottom: '8px' }}>{v.label}</div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '36px', fontWeight: 600, color: v.color, marginBottom: '8px' }}>{v.value}</div>
              <div style={{ fontSize: '12px', color: 'var(--kb-text-muted)', lineHeight: 1.5 }}>{v.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* The Multiplier */}
      <div style={{ ...card }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '20px', fontWeight: 600, color: 'var(--kb-text)', marginBottom: '14px' }}>
          Why AI + Cash Flow Multiplies Everything
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[
            'Cash flowing businesses alone are valued at 4-6x EBITDA. Good but linear.',
            'AI technology companies are valued at 10-20x revenue. Exponential.',
            'Combined: the technology platform is the operating system for the portfolio. Each business feeds data into the AI. The AI optimizes every business in the portfolio.',
            'A buyer of the Kingdom Broker portfolio is not buying a collection of HVAC companies. They are buying a technology-enabled services platform with proprietary deal intelligence, 5,600+ seller relationships, and a vertically integrated acquisition operation built on real relationships.',
            'That is not a 4x exit. That is a 10x+ exit.',
          ].map((t, i) => (
            <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <span style={{ color: 'var(--kb-accent)', fontWeight: 590, flexShrink: 0, marginTop: '2px' }}>
                <svg viewBox="0 0 14 14" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3,7 6,10 11,4"/></svg>
              </span>
              <span style={{ fontSize: '15px', color: 'var(--kb-text)', lineHeight: 1.7 }}>{t}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
