'use client'
import { useState } from 'react'

const C = {
  gold: 'var(--kb-accent)', green: 'var(--kb-green)', navy: 'var(--kb-bg)', navy2: 'var(--kb-bg-panel)',
  navy3: 'var(--kb-bg-surface)', text: 'var(--kb-text)', muted: 'var(--kb-text-secondary)', faint: 'var(--kb-text-muted)',
  border: 'var(--kb-border)',
}

const CORRECT = 'investor'

function Gate({ children }: { children: React.ReactNode }) {
  const [ok, setOk] = useState(false)
  const [pw, setPw] = useState('')
  const [err, setErr] = useState(false)

  if (ok) return <>{children}</>

  return (
    <div style={{ minHeight: '100vh', background: 'var(--kb-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', system-ui, sans-serif", padding: '20px' }}>
      <div style={{ width: '100%', maxWidth: '420px', textAlign: 'center' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/kb-logo.png" alt="Kingdom Broker" style={{ height: '36px', marginBottom: '32px' }} />
        <div style={{ fontSize: '11px', color: C.faint, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '24px' }}>Investor Data Room</div>
        <form onSubmit={e => { e.preventDefault(); pw === CORRECT ? setOk(true) : (setErr(true), setPw(''), setTimeout(() => setErr(false), 2000)) }}>
          <input value={pw} onChange={e => setPw(e.target.value)} type="password" placeholder="Enter access code" style={{ width: '100%', padding: '14px 18px', background: 'var(--kb-bg-raised)', border: `1px solid ${err ? '#E74C3C' : C.border}`, borderRadius: '8px', color: C.text, fontSize: '16px', textAlign: 'center', outline: 'none', marginBottom: '16px' }} />
          <button type="submit" style={{ width: '100%', padding: '14px', background: C.gold, border: 'none', borderRadius: '8px', color: 'var(--kb-bg)', fontSize: '15px', fontWeight: 590, cursor: 'pointer' }}>Access Data Room</button>
        </form>
      </div>
    </div>
  )
}

const PARTNERS = [
  { name: 'Dennis Yu', role: 'Advisor', desc: 'Managed $1B+ in ads for Nike, Red Bull, Starbucks. Co-author of The Great Wealth Transfer. Drives the $1/day content authority strategy and billion-impression distribution engine.', color: '#5b8dee' },
  { name: 'Scott McGrath', role: 'Nexxess Business Advisors · Trust & Tax', desc: '1,000+ trusts structured. 15–30% tax savings for exiting business owners via Infinite Banking IUL and Irrevocable Trust structures. Free consultation for every KB seller. Costs structured from exit proceeds.', color: C.gold },
  { name: 'M&A Influencers', role: 'Buyer Distribution · 20,000+ Members', desc: 'Strategic partnerships with top M&A educators and acquisition influencers provide a warm audience of 20,000+ active buyers. Pre-vetted members feed directly into KB deal flow with defined buy boxes and closing capital.', color: C.green },
  { name: 'Cory Huddleston', role: 'Sypnios Private Equity · Capital', desc: 'PE operator with portfolios across DFW, Kansas City, OKC, and Naples. Provides capital partnerships and roll-up acquisition expertise for KB platform deals.', color: C.gold },
  { name: 'Sean Kouplen', role: 'Regent Bank CEO · SBA Financing', desc: '51 companies, $5B bank. Validates the KB roll-up thesis from the lender side. SBA 7(a) financing pipeline for qualified KB seller deals.', color: '#5b8dee' },
  { name: 'Top Business Broker Partner', role: 'Deal Flow Feeder', desc: 'National brokerage partner with 71 offices. Refers $1M-$100M sellers to KB for larger deals that fit our platform.', color: 'var(--kb-text-secondary)' },
]

// 5-year projection — from kingdombroker.com/deck
const FIVE_YEAR = [
  { year: 'Year 1', revenue: '$1.8M', ebitda: '$350K', milestone: '$5M anchor acquisition' },
  { year: 'Year 2', revenue: '$3.7M', ebitda: '$900K', milestone: '$10M bolt-on' },
  { year: 'Year 3', revenue: '$6.1M', ebitda: '$1.5M', milestone: '$20M platform' },
  { year: 'Year 4', revenue: '$11.5M', ebitda: '$3M', milestone: '$35M scale' },
  { year: 'Year 5', revenue: '$22M', ebitda: '$6M', milestone: '$50M exit ready' },
]

// Exit scenarios for 10% equity stake
const EXITS = [
  { scenario: 'Conservative', portfolio: '$34M', return10pct: '$3.4M', multiple: '3.4×' },
  { scenario: 'Base / Target', portfolio: '$75M', return10pct: '$7.5M', multiple: '7.5×', highlight: true },
  { scenario: 'Premium', portfolio: '$100M+', return10pct: '$10M+', multiple: '10×+' },
]

// Target industries from the deck
const INDUSTRIES = [
  { name: 'Specialty Manufacturing', detail: 'Fabrication, machining, defense supply', multiple: '3.5–6×', margin: '20–30%' },
  { name: 'Trades & Mechanical', detail: 'HVAC, plumbing, electrical', multiple: '4–6×', margin: '25–35%' },
  { name: 'Supply Chain & Distribution', detail: 'Warehousing, logistics', multiple: '3.5–5.5×', margin: '20–30%' },
  { name: 'Industrial Operations', detail: 'Waste, environmental, fleet', multiple: '4–6×', margin: '30–40%' },
]

const REVENUE_SCENARIOS = [
  { label: 'Conservative', deals: 8, avgDeal: '$3M', fee: '7-10%', revenue: '$1.8M', adSpend: '$100K' },
  { label: 'Target', deals: 15, avgDeal: '$3.5M', fee: '7-10%', revenue: '$3.7M', adSpend: '$175K' },
  { label: 'Aggressive', deals: 25, avgDeal: '$4M', fee: '7-10%', revenue: '$7M', adSpend: '$250K' },
]

const ASSETS = [
  { label: 'Seller Leads Generated', value: '5,600+', sub: 'AI sourced + outreach ready across 21 industries, 10 states' },
  { label: 'Qualified Buyers', value: '2,500+', sub: 'Family offices, PE funds, search funds, strategic — defined buy box' },
  { label: 'Active Campaigns', value: '6', sub: 'Instantly sequences running 24/7, 565+ leads queued' },
  { label: 'AI Agents Running', value: '12', sub: 'Search, score, enrich, outreach, export — proprietary Deal Intelligence Desk' },
]

export default function InvestorPage() {
  return (
    <Gate>
      <div style={{ fontFamily: "'Inter', system-ui, sans-serif", color: C.text, background: C.navy }}>

        {/* HERO */}
        <div style={{ padding: '80px 36px 60px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-20%', right: '-10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(201,168,76,0.06) 0%, transparent 65%)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative', maxWidth: '800px', margin: '0 auto' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/kb-logo.png" alt="Kingdom Broker" style={{ height: '44px', marginBottom: '24px' }} />
            <div style={{ fontSize: '11px', color: C.gold, fontWeight: 510, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '16px' }}>Investor Data Room</div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '42px', fontWeight: 600, lineHeight: 1.1, marginBottom: '16px', letterSpacing: '-0.5px' }}>
              The $10 Trillion Wealth Transfer.<br /><span style={{ color: C.gold }}>We Built the Platform to Capture It.</span>
            </h1>
            <p style={{ fontSize: '18px', color: C.muted, lineHeight: 1.7, maxWidth: '600px', margin: '0 auto' }}>
              Kingdom Broker is the first AI-native M&A advisory for $1M-$20M essential American businesses. 12 AI agents. 2,500+ qualified buyers. A book launch, content engine, and referral network ready to deploy.
            </p>
          </div>
        </div>

        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 36px 80px' }}>

          {/* MARKET OPPORTUNITY */}
          <div style={{ marginBottom: '48px' }}>
            <div style={{ fontSize: '11px', color: C.faint, fontWeight: 510, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px' }}>Market Opportunity</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
              {[
                { val: '$10T', label: 'Baby boomer business assets changing hands over the next decade' },
                { val: '70%', label: 'Of small businesses have no succession plan' },
                { val: '$1M-$20M', label: 'The sweet spot PE overlooks and brokers underserve' },
              ].map((m, i) => (
                <div key={i} style={{ background: C.navy2, border: `1px solid ${C.border}`, borderRadius: '8px', padding: '24px', textAlign: 'center' }}>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '28px', fontWeight: 510, color: C.gold, fontVariantNumeric: 'tabular-nums', marginBottom: '8px' }}>{m.val}</div>
                  <div style={{ fontSize: '14px', color: C.muted, lineHeight: 1.5 }}>{m.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* WHAT WE HAVE */}
          <div style={{ marginBottom: '48px' }}>
            <div style={{ fontSize: '11px', color: C.faint, fontWeight: 510, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px' }}>What We Have Built</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {ASSETS.map((a, i) => (
                <div key={i} style={{ background: 'var(--kb-bg-surface)', border: `1px solid ${C.border}`, borderRadius: '8px', padding: '20px' }}>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '24px', fontWeight: 510, color: C.text, fontVariantNumeric: 'tabular-nums', marginBottom: '4px' }}>{a.value}</div>
                  <div style={{ fontSize: '14px', color: C.gold, fontWeight: 510, marginBottom: '4px' }}>{a.label}</div>
                  <div style={{ fontSize: '13px', color: C.muted }}>{a.sub}</div>
                </div>
              ))}
            </div>
          </div>

          {/* LAUNCH WEAPONS */}
          <div style={{ marginBottom: '48px' }}>
            <div style={{ fontSize: '11px', color: C.faint, fontWeight: 510, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px' }}>Launch Weapons</div>
            <div style={{ background: C.navy2, border: `1px solid ${C.border}`, borderRadius: '8px', padding: '24px' }}>
              {[
                { title: 'The Great Wealth Transfer (Book)', desc: '53-page book co-authored with Dennis Yu. Authority positioning for the $10T wealth transfer. Hard copy + digital + audiobook. Launch vehicle for the $27/$97 KWS product funnel.' },
                { title: 'AI Agentic Platform (First to Market)', desc: '12 AI agents that search, score, enrich, and match buyers and sellers. No other M&A advisory in the $1M-$20M space has this. Full dashboard at app.kingdombroker.com.' },
                { title: 'Sustainable Fee Model', desc: '7-10% sliding scale. 40% reinvested in PE cash flow fund. 10% to charity. Sellers get quarterly returns from the fee they paid. Full breakdown at kingdombroker.com/sustainable.' },
                { title: 'Legacy Gold Package', desc: '$10,000 retainer. Covers marketplace listings, buyer matching, add-back analysis, CIM prep, deal data room. Fully credited against success fee at close. Sales page at kingdombroker.com/seller.' },
                { title: '$1/Day Content Strategy', desc: 'Dennis Yu distribution engine. Daily content, free valuation tool, blog articles, podcast. Builds authority in DFW metroplex first, then nationally. Costs almost nothing at scale.' },
                { title: 'Ambassador Referral Network', desc: 'CPAs, attorneys, wealth advisors earn $1,000 on signing + 20% of success fee. Custom referral links, portal, marketing toolkit. Built and live at app.kingdombroker.com/ambassadors.' },
              ].map((w, i) => (
                <div key={i} style={{ padding: '16px 0', borderBottom: i < 5 ? `1px solid rgba(255,255,255,0.03)` : 'none' }}>
                  <div style={{ fontSize: '15px', fontWeight: 590, color: C.text, marginBottom: '4px' }}>{w.title}</div>
                  <div style={{ fontSize: '14px', color: C.muted, lineHeight: 1.6 }}>{w.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* PARTNERS */}
          <div style={{ marginBottom: '48px' }}>
            <div style={{ fontSize: '11px', color: C.faint, fontWeight: 510, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px' }}>Strategic Partners</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {PARTNERS.map((p, i) => (
                <div key={i} style={{ background: 'var(--kb-bg-card)', border: `1px solid ${C.border}`, borderLeft: `3px solid ${p.color}`, borderRadius: '8px', padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                    <div style={{ fontSize: '16px', fontWeight: 590, color: C.text }}>{p.name}</div>
                    <div style={{ fontSize: '12px', color: p.color, fontWeight: 510, padding: '2px 10px', background: `${p.color}15`, border: `1px solid ${p.color}30`, borderRadius: '4px' }}>{p.role}</div>
                  </div>
                  <div style={{ fontSize: '14px', color: C.muted, lineHeight: 1.6 }}>{p.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* REVENUE MODEL */}
          <div style={{ marginBottom: '48px' }}>
            <div style={{ fontSize: '11px', color: C.faint, fontWeight: 510, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px' }}>Year 1 Revenue Scenarios</div>
            <div style={{ background: C.navy2, border: `1px solid ${C.border}`, borderRadius: '8px', overflow: 'hidden' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', background: 'var(--kb-bg-surface)', padding: '14px 20px', gap: '8px' }}>
                {['Scenario', 'Deals Closed', 'Avg Deal', 'Fee Rate', 'Ad Budget', 'Revenue'].map(h => (
                  <div key={h} style={{ fontSize: '12px', color: C.muted, fontWeight: 590, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</div>
                ))}
              </div>
              {REVENUE_SCENARIOS.map((r, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', padding: '16px 20px', gap: '8px', borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.03)' : 'none', background: i === 1 ? 'rgba(201,168,76,0.04)' : 'transparent' }}>
                  <div style={{ fontSize: '14px', fontWeight: 590, color: i === 1 ? C.gold : C.text }}>{r.label}</div>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '14px', color: C.text, fontVariantNumeric: 'tabular-nums' }}>{r.deals}</div>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '14px', color: C.text, fontVariantNumeric: 'tabular-nums' }}>{r.avgDeal}</div>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '14px', color: C.muted, fontVariantNumeric: 'tabular-nums' }}>{r.fee}</div>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '14px', color: C.muted, fontVariantNumeric: 'tabular-nums' }}>{r.adSpend}</div>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '16px', fontWeight: 510, color: C.green, fontVariantNumeric: 'tabular-nums' }}>{r.revenue}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: '12px', fontSize: '13px', color: C.faint, lineHeight: 1.6 }}>
              Based on 7-10% sliding scale success fee on $3M-$4M average deal size. DFW metroplex focus first 12 months. Full projections at <a href="https://kingdombroker.com/revenueplan" target="_blank" rel="noopener" style={{ color: C.gold, textDecoration: 'none' }}>kingdombroker.com/revenueplan</a>
            </div>
          </div>

          {/* INVESTMENT ASK */}
          <div style={{ marginBottom: '48px' }}>
            <div style={{ fontSize: '11px', color: C.faint, fontWeight: 510, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px' }}>The Ask</div>
            <div style={{ background: 'var(--kb-accent-dim)', border: '1px solid var(--kb-accent-border)', borderRadius: '12px', padding: '32px', textAlign: 'center' }}>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '36px', fontWeight: 510, color: C.gold, marginBottom: '8px', fontVariantNumeric: 'tabular-nums' }}>$1,000,000</div>
              <div style={{ fontSize: '16px', color: C.text, fontWeight: 510, marginBottom: '8px' }}>Raising at a $10M valuation for 10% of Kingdom Broker Inc.</div>
              <div style={{ fontSize: '13px', color: C.muted, marginBottom: '24px' }}>Min check: $250,000 · Base case: 4.4× · Optimistic: 8.8×</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '14px' }}>
                {[
                  { label: 'Raise', val: '$1M' },
                  { label: 'Valuation', val: '$10M' },
                  { label: 'Equity', val: '10%' },
                  { label: 'Min Check', val: '$250K' },
                ].map((b, i) => (
                  <div key={i} style={{ padding: '16px', background: 'var(--kb-accent-dim)', borderRadius: '8px' }}>
                    <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '22px', fontWeight: 510, color: C.gold, fontVariantNumeric: 'tabular-nums', marginBottom: '4px' }}>{b.val}</div>
                    <div style={{ fontSize: '11px', color: C.muted, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{b.label}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: '24px', padding: '18px 22px', background: 'rgba(46,204,139,0.06)', border: '1px solid rgba(46,204,139,0.2)', borderRadius: '8px', textAlign: 'left' }}>
                <div style={{ fontSize: '12px', color: 'var(--kb-green)', fontWeight: 590, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px' }}>Use of Funds — 50/50 Split</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div style={{ padding: '14px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px' }}>
                    <div style={{ fontSize: '11px', color: C.gold, fontWeight: 590, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '6px' }}>$500K</div>
                    <div style={{ fontSize: '13px', color: C.text, lineHeight: 1.55 }}>SBA 7(a) down payment on <strong>first $5M acquisition</strong> (the anchor).</div>
                  </div>
                  <div style={{ padding: '14px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px' }}>
                    <div style={{ fontSize: '11px', color: C.gold, fontWeight: 590, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '6px' }}>$500K</div>
                    <div style={{ fontSize: '13px', color: C.text, lineHeight: 1.55 }}>Revenue engine — book launch, education platform, advisory services, team, technology.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 5-YEAR PROJECTIONS */}
          <div style={{ marginBottom: '48px' }}>
            <div style={{ fontSize: '11px', color: C.faint, fontWeight: 510, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px' }}>5-Year Projections</div>
            <div style={{ background: 'var(--kb-bg-panel)', border: `1px solid ${C.border}`, borderRadius: '12px', overflow: 'hidden' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 2fr', padding: '14px 22px', background: 'var(--kb-bg-raised)', borderBottom: `1px solid ${C.border}`, fontSize: '11px', color: C.faint, fontWeight: 590, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                <div>Year</div>
                <div>Revenue</div>
                <div>EBITDA</div>
                <div>Milestone</div>
              </div>
              {FIVE_YEAR.map((y, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 2fr', padding: '14px 22px', borderBottom: i < FIVE_YEAR.length - 1 ? `1px solid ${C.border}` : 'none', fontFamily: "'DM Mono', monospace", fontSize: '14px', fontVariantNumeric: 'tabular-nums' }}>
                  <div style={{ color: C.gold, fontWeight: 510 }}>{y.year}</div>
                  <div style={{ color: C.text }}>{y.revenue}</div>
                  <div style={{ color: 'var(--kb-green)' }}>{y.ebitda}</div>
                  <div style={{ color: C.muted, fontFamily: "'Inter', system-ui, sans-serif", fontSize: '13px' }}>{y.milestone}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: '12px', fontSize: '13px', color: C.muted, lineHeight: 1.6, fontStyle: 'italic' }}>
              "Buy at 3–4×. Exit at 5–9×." Plus quarterly distributions: $25K–$75K/quarter from portfolio cash flow. 10–30% annual cash-on-cash returns pre-exit.
            </div>
          </div>

          {/* EXIT SCENARIOS */}
          <div style={{ marginBottom: '48px' }}>
            <div style={{ fontSize: '11px', color: C.faint, fontWeight: 510, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px' }}>Exit Scenarios (Year 3–5) · 10% Equity Stake</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
              {EXITS.map((e, i) => (
                <div key={i} style={{ padding: '22px', background: e.highlight ? 'var(--kb-accent-dim)' : 'var(--kb-bg-panel)', border: `1px solid ${e.highlight ? 'var(--kb-accent-border)' : C.border}`, borderRadius: '10px', textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: e.highlight ? C.gold : C.muted, fontWeight: 590, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px' }}>{e.scenario}</div>
                  <div style={{ fontSize: '13px', color: C.muted, marginBottom: '4px' }}>Portfolio Value</div>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '22px', color: C.text, fontWeight: 510, marginBottom: '12px', fontVariantNumeric: 'tabular-nums' }}>{e.portfolio}</div>
                  <div style={{ fontSize: '13px', color: C.muted, marginBottom: '4px' }}>Your 10%</div>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '28px', color: 'var(--kb-green)', fontWeight: 510, marginBottom: '6px', fontVariantNumeric: 'tabular-nums' }}>{e.return10pct}</div>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '14px', color: C.gold, fontVariantNumeric: 'tabular-nums' }}>{e.multiple} return</div>
                </div>
              ))}
            </div>
          </div>

          {/* TARGET INDUSTRIES */}
          <div style={{ marginBottom: '48px' }}>
            <div style={{ fontSize: '11px', color: C.faint, fontWeight: 510, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px' }}>Target Industries — Acquisition Buy Box</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {INDUSTRIES.map((ind, i) => (
                <div key={i} style={{ padding: '18px 20px', background: 'var(--kb-bg-panel)', border: `1px solid ${C.border}`, borderRadius: '8px' }}>
                  <div style={{ fontSize: '14px', color: C.gold, fontWeight: 590, marginBottom: '4px' }}>{ind.name}</div>
                  <div style={{ fontSize: '13px', color: C.muted, marginBottom: '10px' }}>{ind.detail}</div>
                  <div style={{ display: 'flex', gap: '14px' }}>
                    <div style={{ fontSize: '11px', color: C.faint }}>
                      <span style={{ color: C.text, fontFamily: "'DM Mono', monospace", fontSize: '13px' }}>{ind.multiple}</span> multiple
                    </div>
                    <div style={{ fontSize: '11px', color: C.faint }}>
                      <span style={{ color: 'var(--kb-green)', fontFamily: "'DM Mono', monospace", fontSize: '13px' }}>{ind.margin}</span> margins
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* LINKS */}
          <div style={{ marginBottom: '48px' }}>
            <div style={{ fontSize: '11px', color: C.faint, fontWeight: 510, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px' }}>Live Pages</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {[
                { label: 'Revenue Plan', href: 'https://kingdombroker.com/revenueplan', desc: 'Full financial projections and funnel economics' },
                { label: 'Sustainable Fee Model', href: 'https://kingdombroker.com/sustainable', desc: '7-10% fee breakdown, PE fund, trust savings' },
                { label: 'Seller Sales Page', href: 'https://kingdombroker.com/seller', desc: 'Legacy Gold Package, $10K retainer' },
                { label: 'Platform Demo', href: '/demo', desc: '10-step clickable deal walkthrough' },
                { label: 'Free Valuation Tool', href: 'https://kingdombroker.com/valuation', desc: 'Lead magnet, works today' },
                { label: 'Ambassador Program', href: '/ambassadors', desc: '$1K signing + 20% referral commissions' },
              ].map((l, i) => (
                <a key={i} href={l.href} target={l.href.startsWith('http') ? '_blank' : undefined} rel="noopener" style={{ display: 'block', padding: '16px 20px', background: 'var(--kb-bg-card)', border: `1px solid ${C.border}`, borderRadius: '8px', textDecoration: 'none' }}>
                  <div style={{ fontSize: '14px', fontWeight: 590, color: C.gold, marginBottom: '4px' }}>{l.label}</div>
                  <div style={{ fontSize: '13px', color: C.muted }}>{l.desc}</div>
                </a>
              ))}
            </div>
          </div>

          {/* MISSION */}
          <div style={{ textAlign: 'center', padding: '40px 24px', background: 'var(--kb-accent-dim)', border: '1px solid rgba(201,168,76,0.15)', borderRadius: '12px' }}>
            <div style={{ fontSize: '11px', color: C.gold, fontWeight: 510, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px' }}>Our Mission</div>
            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', fontWeight: 600, color: C.text, lineHeight: 1.4, margin: '0 0 8px' }}>Help 10,000 families exit well on their terms and preserve legacy in ten years.</p>
            <p style={{ fontSize: '15px', color: C.muted, margin: '0 0 24px' }}>Exits that honor what owners built. Legacy. Family. Stewardship.</p>
            <div style={{ fontSize: '14px', color: C.faint }}>
              Eric Skeldon, Founder &middot; Eric@KingdomBroker.com &middot; 469-494-9890
            </div>
          </div>

        </div>
      </div>
    </Gate>
  )
}
