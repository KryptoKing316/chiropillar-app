// ChiroPillar · 24-Month Launch Plan
// REVISED MODEL — Wagner finances acquisitions through senior debt secured
// by his existing $25M medical-practice EBITDA. He writes ONE small check
// to ChiroPillar for operating capital (team + marketing + SaaS). KB earns
// 5% of platform-tracked revenue going forward.
//
// Numbers benchmarked against:
//   - LinkedIn salary data (Dallas/Charlottesville chiropractic + M&A roles)
//   - Facebook Ads chiropractic CAC ($80-180/lead industry blended)
//   - Direct mail benchmarks (lists $0.45-0.70/piece, 0.4-1.2% reply)
//   - SBA 7(a) healthcare lending rates (prime + 2.75-4.75%, $5M cap)
//   - Live Oak Bank healthcare M&A deal volume (#1 SBA lender 5+ years)
//   - BHG Financial healthcare practice loan structures
//   - Senior debt pricing for $25M+ EBITDA borrowers (prime + 2-3%)

import Link from 'next/link'

export const dynamic = 'force-dynamic'

const C = {
  bg: 'var(--kb-bg)', bg2: 'var(--kb-bg-panel)', bg3: 'var(--kb-bg-surface)',
  text: 'var(--kb-text)', muted: 'var(--kb-text-secondary)', faint: 'var(--kb-text-muted)',
  border: 'var(--kb-border)',
  spine: '#1F4E79', align: '#2E75B6', stone: '#EBD8A6', globe: '#9CC4E4',
  gold: '#C9A84C', goldLight: '#E8C96A', green: '#2ECC8B', coral: '#F2B0A0',
  red: '#E74C3C', amber: '#F39C12',
}
const F = {
  display: "'Playfair Display', Georgia, serif",
  body: "'Inter', system-ui, sans-serif",
  mono: "'JetBrains Mono', 'DM Mono', monospace",
}

const fmtMoney = (n: number) => {
  if (n >= 1_000_000) return '$' + (n / 1_000_000).toFixed(2) + 'M'
  if (n >= 1_000) return '$' + Math.round(n / 1_000).toLocaleString() + 'K'
  return '$' + Math.round(n).toLocaleString()
}

// ── VALUE CHAIN ─────────────────────────────────────────────────────────
type Stage = {
  num: string
  name: string
  ownership: string
  tools: string[]
  metrics: { label: string; val: string }[]
  monthly_cost: number
  what: string
  accent: string
}

const VALUE_CHAIN: Stage[] = [
  {
    num: '01',
    name: 'Ads · Top of Funnel',
    ownership: 'Eric + part-time media buyer',
    tools: ['Facebook Ads', 'Google Search', 'YouTube pre-roll', 'BlitzMetrics partner'],
    metrics: [
      { label: 'Ad spend',      val: '$1/day × DCs targeted = $12K/mo' },
      { label: 'Impressions',   val: '~480K/mo · DC + spouse audiences' },
      { label: 'Landing clicks',val: '~6,400/mo at $1.85 CPC blended' },
      { label: 'Form starts',   val: '~960/mo at 15% click-to-start' },
    ],
    monthly_cost: 18_000,
    what: 'Hyper-targeted ad creative: "Earn $250K more without learning a new technique." Targets DCs $750K-$3M, 35-65, married, US South. Lands on chiropillar.com/intake.',
    accent: '#2E75B6',
  },
  {
    num: '02',
    name: 'Direct Mail · Outbound',
    ownership: 'Eric + agency vendor',
    tools: ['LetterHead.com', 'Apollo lists', 'Personalized print', 'QR code tracking'],
    metrics: [
      { label: 'List built',     val: '~12,000 DCs nationwide @ $1M+ rev' },
      { label: 'Pieces / mo',    val: '2,000 first 6 mo, 4,000 thereafter' },
      { label: 'Cost / piece',   val: '$0.62 (list + print + postage)' },
      { label: 'Response rate',  val: '0.8% blended (QR scan + call)' },
    ],
    monthly_cost: 2_500,
    what: '"Your competitor just sold for $3.2M. Here\'s what your practice is worth." Postcards with QR code to chiropillar.com/intake + a phone number routing to McGrath\'s line.',
    accent: '#C9A84C',
  },
  {
    num: '03',
    name: 'Intake & Auto-Qualify',
    ownership: 'Platform · zero human touch',
    tools: ['chiropillar.com/intake', 'Wagner 7-metric scoring', 'Resend email', 'Supabase'],
    metrics: [
      { label: 'Form submits / mo',  val: '~150 once full funnel scaled' },
      { label: 'Auto-qualify rate',  val: '~28% qualified · 35% maybe · 37% not_yet' },
      { label: 'Cost / qualified',   val: '~$140 blended (ads + mail)' },
      { label: 'Time to first email', val: '< 60 seconds (Resend triggered)' },
    ],
    monthly_cost: 350,
    what: '7-field form auto-scores against Wagner\'s qualification criteria. Returns instant valuation band. Qualified → routed to McGrath. Maybe → routed to Scale Services. Not_yet → 90-day nurture drip.',
    accent: '#2ECC8B',
  },
  {
    num: '04',
    name: 'Biz Dev · McGrath',
    ownership: 'McGrath + 1 SDR (month 4+)',
    tools: ['Instantly.ai', 'Apollo enrichment', 'Aircall', 'Calendly'],
    metrics: [
      { label: 'Discovery calls / mo', val: '~35 qualified leads contacted' },
      { label: 'Show rate',            val: '65% (Calendly reminders + SMS)' },
      { label: 'Held / mo',            val: '~23 calls' },
      { label: 'Qualified -> diligence', val: '~30%' },
    ],
    monthly_cost: 17_500,
    what: 'McGrath runs the relationship side. Senior DC operator credentials open doors. SDR (hired month 4) handles outbound cold + inbound triage to free McGrath for closing conversations.',
    accent: '#9CC4E4',
  },
  {
    num: '05',
    name: 'Diligence + Structure',
    ownership: 'Eric + outside legal',
    tools: ['Per-clinic Data Room', 'Claude PDF extraction', 'AI Valuation engine', 'DocuSeal'],
    metrics: [
      { label: 'Deals in diligence',    val: '4-6 concurrent at steady state' },
      { label: 'Time to LOI',           val: '14 days from financials in hand' },
      { label: 'NDA sign-through rate', val: '92% (in-platform DocuSeal flow)' },
      { label: 'LOI accept rate',       val: '55%' },
    ],
    monthly_cost: 11_500,
    what: 'Eric structures the 4-stream offer (cash + note + rollover + profit share). Per-clinic data room holds financials. Outside legal on retainer for APA + state DSO/MSO compliance.',
    accent: '#1F4E79',
  },
  {
    num: '06',
    name: 'Closing + Integration',
    ownership: 'Eric + Wagner + Operations Lead',
    tools: ['DocuSeal APA', 'Wire instructions', 'Onboarding playbook', 'Operations dashboard'],
    metrics: [
      { label: 'Close rate (LOI -> wire)', val: '85%' },
      { label: 'Time LOI -> close',         val: '60-90 days' },
      { label: 'Year-1 EBITDA lift',        val: '+$250K per acquired clinic' },
      { label: 'Acquisitions / quarter',    val: '3-5 (steady state from month 9)' },
    ],
    monthly_cost: 14_000,
    what: 'Ops Lead (hired month 6) runs the post-close integration: medical-team install, EMR migration, billing setup, brand transition. Wagner advises clinically.',
    accent: '#C9A84C',
  },
]

// ── TEAM HIRES ──────────────────────────────────────────────────────────
type Hire = {
  role: string
  when: string
  comp: string
  comp_low: number
  comp_high: number
  fulltime: boolean
  responsibilities: string
}

const HIRES: Hire[] = [
  // ─── DAY 0 · PARTNERS ───
  { role: 'Eric Skeldon · Founder/CEO',              when: 'Day 0',   comp: '$25K upfront + $12.5K/mo + 2% acq + 2.5% exit',           comp_low: 162_500, comp_high: 162_500, fulltime: true,  responsibilities: 'Platform · deal structure · Wagner relationship · final closing · ChiroPillar owner · 2% of each acq EV ($38K/close) + 2.5% of exit slice + 5% ongoing rev share flows to ChiroPillar' },
  { role: 'Scott McGrath · BD Partner',              when: 'Day 0',   comp: '$5K/mo + 2% acq + 2.5% exit',     comp_low: 60_000,  comp_high: 60_000,   fulltime: false, responsibilities: 'Brought Dr. Wagner to the table · sources seller chiropractors · 2% of each acq EV ($38K/close · ~$950K over 25 closes) + 2.5% of exit slice (his half of KB\'s 4% acq + 5% exit fees)' },
  { role: 'Dr. Scott Wagner · Clinical Partner',     when: 'Day 0',   comp: 'Owns clinics outright',           comp_low: 0,       comp_high: 0,        fulltime: false, responsibilities: 'Clinical playbook · medical-team install · operator credibility' },

  // ─── 90-120 DAY HIRES · full sales + ops engine built in Q1-Q2 ───
  { role: 'Operations Lead',                          when: 'Month 3', comp: '$95-130K',                        comp_low: 95_000,  comp_high: 130_000, fulltime: true, responsibilities: 'Post-close integration playbook · acquired-clinic onboarding · standard playbook install' },
  { role: 'Junior Marketer / Media Buyer',           when: 'Month 3', comp: '$60-80K',                          comp_low: 60_000,  comp_high: 80_000,  fulltime: true, responsibilities: 'Daily ad management (FB + Google) · creative testing · direct mail vendor · BlitzMetrics liaison' },
  { role: 'Appointment Setter #1',                   when: 'Month 4', comp: '$45K base + $75/appt set ($55-72K OTE)', comp_low: 55_000, comp_high: 72_000, fulltime: true, responsibilities: 'High-volume dials · 80-100/day · books discovery calls · works inbound triage' },
  { role: 'BDR / Cold Outreach Specialist',          when: 'Month 4', comp: '$65K base + commission ($85-105K OTE)',  comp_low: 85_000, comp_high: 105_000, fulltime: true, responsibilities: 'Owns Instantly + Apollo · personalized cold email · LinkedIn · qualifies down to discovery' },
  { role: 'Sales Closer / Account Executive #1',     when: 'Month 4', comp: '$95K base + commission ($155-200K OTE)', comp_low: 155_000, comp_high: 200_000, fulltime: true, responsibilities: 'Closes acquisition LOIs · handles seller objections · works alongside McGrath on warm leads' },

  // ─── MONTH 8-9 · RETENTION + BACK-OFFICE ───
  { role: 'Appointment Setter #2',                   when: 'Month 8', comp: '$45K base + $75/appt set ($55-72K OTE)', comp_low: 55_000, comp_high: 72_000, fulltime: true, responsibilities: 'Doubles dial capacity once funnel proves out · also books Scale Services strategy calls' },
  { role: 'Account Manager #1 · Scale Services',     when: 'Month 9', comp: '$75K base + bonus ($90-110K OTE)', comp_low: 90_000,  comp_high: 110_000, fulltime: true, responsibilities: 'Mastermind cohort + Practice Audit clients + Medical-Team Install customers · retention + upsell' },
  { role: 'Bookkeeper / Controller (FT)',            when: 'Month 9', comp: '$65-85K',                          comp_low: 65_000,  comp_high: 85_000,  fulltime: true, responsibilities: 'Per-clinic books · roll-up consolidation · 5% rev share calc · investor reporting' },

  // ─── MONTH 12+ · SCALE THE ENGINE ───
  { role: 'Diligence Analyst',                       when: 'Month 12', comp: '$80-110K',                        comp_low: 80_000,  comp_high: 110_000, fulltime: true, responsibilities: 'Owns Data Room + AI Valuation workflow · prepares LOI packets · runs Claude PDF extractions' },
  { role: 'Sales Closer / Account Executive #2',     when: 'Month 15', comp: '$95K base + commission ($155-200K OTE)', comp_low: 155_000, comp_high: 200_000, fulltime: true, responsibilities: 'Doubles closing capacity as deal volume scales to 5+ per quarter' },
  { role: 'Account Manager #2 · Acquired Clinic Liaison', when: 'Month 15', comp: '$70-90K + bonus',         comp_low: 75_000,  comp_high: 95_000,  fulltime: true, responsibilities: 'Single point of contact for acquired DCs post-close · monitors satisfaction + identifies network referral opportunities' },
]

// ── TECH / SAAS STACK ───────────────────────────────────────────────────
const STACK = [
  { tool: 'Supabase Pro',              cost_mo: 25,    use: 'Database + Auth + Storage' },
  { tool: 'Vercel Pro',                cost_mo: 20,    use: 'Hosting (chiropillar.com)' },
  { tool: 'Anthropic API · Claude',    cost_mo: 800,   use: 'PDF extraction · valuation · add-back detection' },
  { tool: 'Resend (email)',            cost_mo: 80,    use: 'Magic-link + intake notifications + drip' },
  { tool: 'Clay.com Pro · 10K credits/mo', cost_mo: 720, use: 'Lead enrichment · multi-source waterfalls (Apollo + ZoomInfo + RocketReach + Hunter + 50+ providers)' },
  { tool: 'Clay.com Enterprise upgrade · Phase 2', cost_mo: 1_500, use: 'Higher credit cap + custom waterfalls as deal volume scales' },
  { tool: 'Instantly.ai · 100 inboxes', cost_mo: 297,  use: 'Cold email outbound infrastructure' },
  { tool: 'Aircall + Twilio · 4 lines', cost_mo: 350,  use: 'Click-to-call + SMS' },
  { tool: 'DocuSeal Pro',              cost_mo: 99,    use: 'NDA + LOI + APA e-signature' },
  { tool: 'Stripe · 2.9% + 30c',       cost_mo: 250,   use: 'Scale Services checkout' },
  { tool: 'QuickBooks Online',         cost_mo: 90,    use: 'Per-entity books · Phase 3 OAuth integration' },
  { tool: 'Calendly · Team',           cost_mo: 96,    use: 'Auto-book Wagner + McGrath calls' },
  { tool: 'Slack + Notion',            cost_mo: 150,   use: 'Internal ops' },
]
const stackTotalMo = STACK.reduce((s, t) => s + t.cost_mo, 0)

// ── BANKS / LENDERS Wagner can use ─────────────────────────────────────
type Lender = { name: string; type: string; max_size: string; rate: string; best_for: string; accent: string }
const LENDERS: Lender[] = [
  {
    name: 'Live Oak Bank',
    type: 'SBA 7(a) + Conventional · #1 SBA lender 5+ years',
    max_size: 'Up to $5M per loan (SBA cap) · $15M+ conventional',
    rate: 'Prime + 2.75-3.75% (SBA) · Prime + 1.5-2.5% (conventional)',
    best_for: 'First 5-8 acquisitions via stacked SBA 7(a). Each clinic becomes a separate 10-year amortizing loan. Wagner\'s personal guarantee + acquired clinic assets secure it. Fastest underwriting in healthcare (4-6 weeks).',
    accent: '#2E75B6',
  },
  {
    name: 'BHG Financial · Healthcare Business Group',
    type: 'Non-bank healthcare-only lender · Direct-to-doctor',
    max_size: 'Up to $1.5M per loan (unsecured) · stacked deals OK',
    rate: 'Fixed 9-12% APR · 10-year amort · no prepay penalty',
    best_for: 'Bolt-on acquisitions under $1.5M where speed matters more than rate. Wagner\'s personal balance sheet + clinic revenue underwrite. Funding in 7-14 days. Use for the Stage-1 Wagner-network wins (his 9 warm Charlottesville practices).',
    accent: '#C9A84C',
  },
  {
    name: 'First Citizens Bank · Healthcare Commercial Lending',
    type: 'Senior secured + ABL · post-First Republic acquisition',
    max_size: '$5M-$50M per facility · $100M+ portfolio capacity',
    rate: 'Prime + 1.5-2.5% (variable) · SOFR + 2-3% (term)',
    best_for: 'Larger consolidated facility once 5+ clinics are stacked. Cross-collateralized against Wagner\'s existing $25M EBITDA. Drawable line for in-flight acquisitions. Strongest relationship pricing once portfolio scales.',
    accent: '#9CC4E4',
  },
  {
    name: 'Bank of America Practice Solutions',
    type: 'Healthcare practice acquisition loans · national footprint',
    max_size: 'Up to $5M SBA · $10M+ conventional',
    rate: 'Prime + 2-3.25%',
    best_for: 'When Wagner wants a banking-relationship bundle (treasury + acquisition + commercial card). BAML\'s healthcare team has decades of medical-practice lending. Slower than Live Oak but more flexible structuring.',
    accent: '#2ECC8B',
  },
  {
    name: 'Pinnacle Financial Partners',
    type: 'Southeast regional · healthcare specialty',
    max_size: '$5M-$25M per facility',
    rate: 'Prime + 1.75-2.75%',
    best_for: 'Wagner-territory match — Pinnacle is HQ\'d Nashville with strong VA/NC/TN/GA presence. Faster decisions, in-region banker, relationship-driven. Good Stage-2 partner once you\'re past first 5 clinics.',
    accent: '#1F4E79',
  },
  {
    name: 'U.S. Bank Practice Finance',
    type: 'Healthcare practice loans · SBA preferred lender',
    max_size: 'Up to $5M SBA · larger conventional available',
    rate: 'Prime + 2.5-3.5%',
    best_for: 'Fallback option + diversification once a primary relationship is established. Strong in MD/medical-group acquisitions vs pure DC. Good backup for any deal Live Oak passes on.',
    accent: '#F39C12',
  },
]

// ── REVISED TIMELINE · operating + financing separated ─────────────────
type Quarter = {
  q: string
  team_cost: number
  marketing: number
  saas: number
  acq_count: number
  acq_value: number      // total purchase price closed
  wagner_cash: number    // 50% cash at close (financed by bank)
  bank_debt: number      // new bank debt drawn (same as cash)
  cumulative_ebitda: number
  notes: string
}

const TIMELINE: Quarter[] = [
  { q: 'Q1 (Mo 1-3)',   team_cost: 165_000, marketing:  72_000, saas: 14_000, acq_count: 0, acq_value:          0, wagner_cash:         0, bank_debt:         0, cumulative_ebitda:        0, notes: 'Eric ($25K upfront + $12.5K/mo) + McGrath ($5K/mo) + Wagner Day 0. Ops Lead + Marketer onboarded Month 3. Engine being built. First 50 intakes test funnel.' },
  { q: 'Q2 (Mo 4-6)',   team_cost: 295_000, marketing: 105_000, saas: 14_000, acq_count: 0, acq_value:          0, wagner_cash:         0, bank_debt:         0, cumulative_ebitda:        0, notes: 'Sales engine fully staffed Month 4: Appt Setter + BDR + Closer #1 on board. Pipeline fills. First LOI signed end-Q2.' },
  { q: 'Q3 (Mo 7-9)',   team_cost: 350_000, marketing: 135_000, saas: 16_000, acq_count: 2, acq_value:  3_800_000, wagner_cash: 1_900_000, bank_debt: 1_900_000, cumulative_ebitda:   970_000, notes: 'Appt Setter #2 + Account Manager + Bookkeeper added. First 2 clinics @ $1.9M each. Sales team converting.' },
  { q: 'Q4 (Mo 10-12)', team_cost: 390_000, marketing: 135_000, saas: 18_000, acq_count: 3, acq_value:  5_700_000, wagner_cash: 2_850_000, bank_debt: 2_850_000, cumulative_ebitda: 1_720_000, notes: 'Diligence Analyst hired. 3 more closes. Scale Services revenue ramping under AM #1.' },
  { q: 'Q5 (Mo 13-15)', team_cost: 490_000, marketing: 150_000, saas: 20_000, acq_count: 4, acq_value:  7_600_000, wagner_cash: 3_800_000, bank_debt: 3_800_000, cumulative_ebitda: 2_770_000, notes: 'Closer #2 + AM #2 (acquired-clinic liaison) hired. 4 acquisitions. 30 active Scale Services customers.' },
  { q: 'Q6 (Mo 16-18)', team_cost: 535_000, marketing: 165_000, saas: 22_000, acq_count: 5, acq_value:  9_500_000, wagner_cash: 4_750_000, bank_debt: 4_750_000, cumulative_ebitda: 4_010_000, notes: 'Sales engine at full headcount: 2 setters + 1 BDR + 2 Closers + 2 AMs. Pace doubles. 5 closes.' },
  { q: 'Q7 (Mo 19-21)', team_cost: 555_000, marketing: 165_000, saas: 24_000, acq_count: 5, acq_value:  9_500_000, wagner_cash: 4_750_000, bank_debt: 4_750_000, cumulative_ebitda: 5_510_000, notes: 'Mature pipeline. Predictable cadence. Closer commission load fully running. First exit conversations.' },
  { q: 'Q8 (Mo 22-24)', team_cost: 580_000, marketing: 165_000, saas: 26_000, acq_count: 6, acq_value: 11_400_000, wagner_cash: 5_700_000, bank_debt: 5_700_000, cumulative_ebitda: 7_260_000, notes: 'Final push to $20M+ ChiroPillar bolt-on EBITDA. Exit conversations open at $45M+ combined platform.' },
]

// Monthly burn approximations for the headline (used by KPI strip)
const monthlyBurnY1 = (TIMELINE[0].team_cost + TIMELINE[1].team_cost + TIMELINE[2].team_cost + TIMELINE[3].team_cost
                      + TIMELINE[0].marketing + TIMELINE[1].marketing + TIMELINE[2].marketing + TIMELINE[3].marketing
                      + TIMELINE[0].saas + TIMELINE[1].saas + TIMELINE[2].saas + TIMELINE[3].saas) / 12
const monthlyBurnY2 = (TIMELINE[4].team_cost + TIMELINE[5].team_cost + TIMELINE[6].team_cost + TIMELINE[7].team_cost
                      + TIMELINE[4].marketing + TIMELINE[5].marketing + TIMELINE[6].marketing + TIMELINE[7].marketing
                      + TIMELINE[4].saas + TIMELINE[5].saas + TIMELINE[6].saas + TIMELINE[7].saas) / 12
const monthlyBurnAvg = (monthlyBurnY1 + monthlyBurnY2) / 2

const totalOperating = TIMELINE.reduce((s, q) => s + q.team_cost + q.marketing + q.saas, 0)
const totalAcqValue  = TIMELINE.reduce((s, q) => s + q.acq_value, 0)
const totalAcqCount  = TIMELINE.reduce((s, q) => s + q.acq_count, 0)
const totalWagnerCash = TIMELINE.reduce((s, q) => s + q.wagner_cash, 0)
const totalBankDebt   = TIMELINE.reduce((s, q) => s + q.bank_debt, 0)
const finalEbitda     = TIMELINE[TIMELINE.length - 1].cumulative_ebitda
const exitLow         = (25_000_000 + finalEbitda) * 8
const exitHigh        = (25_000_000 + finalEbitda) * 10

// KB compensation structure (per Eric directive · revised 2026-06-03):
//   4% one-time consulting fee on acquisition EV (split 2% Scott / 2% Eric-ChiroPillar) — paid at close
//   5% quarterly revenue share on platform-tracked revenue (100% ChiroPillar) — ongoing
//   5% exit fee on ChiroPillar slice of platform exit (split 2.5% Scott / 2.5% Eric-ChiroPillar) — at sale
// NO equity rollover · Wagner owns 100% of acquired clinics from Day 1 at signing
const avgAcqRevenue = 1_600_000   // avg clinic revenue (post-lift)
const kbOneTimeFee  = totalAcqValue * 0.04  // 4% × total acquisition EV (split 2/2 internally)
const kbRevenueShare5yr = totalAcqCount * avgAcqRevenue * 0.05 * 5  // 5% × 5 years average hold · 100% ChiroPillar
const scaleSvcsRevenue3yr = 1_650_000 + 2_800_000 + 4_200_000  // Y1 + Y2 + Y3 Scale Services
const kbScaleShare = scaleSvcsRevenue3yr * 0.05
// 5% exit fee on ChiroPillar-bolt-on EBITDA × midpoint multiple (9×) · split 2.5/2.5
const exitMid = (exitLow + exitHigh) / 2
const chiroPillarSliceOfExit = (finalEbitda / (25_000_000 + finalEbitda)) * exitMid
const kbExitFee = chiroPillarSliceOfExit * 0.05
const totalKbShare = kbOneTimeFee + kbRevenueShare5yr + kbScaleShare + kbExitFee

// Bank debt service math
const blendedRate = 0.085   // 8.5% blended (SBA 7a + senior mix)
const amortYears = 7
const annualDebtServiceTotal = totalBankDebt * (blendedRate * Math.pow(1 + blendedRate, amortYears)) / (Math.pow(1 + blendedRate, amortYears) - 1)
const dscrAcq = finalEbitda / annualDebtServiceTotal

// ─── PAGE ───────────────────────────────────────────────────────────────
export default function LaunchPlanPage() {
  return (
    <div style={{ padding: '32px 32px 80px', maxWidth: 1320, margin: '0 auto', fontFamily: F.body, color: C.text }}>

      {/* HEADER */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontFamily: F.mono, fontSize: 11, color: C.gold, letterSpacing: '0.22em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 8 }}>
          24-Month Launch Plan · Real Numbers
        </div>
        <h1 style={{ fontFamily: F.display, fontSize: 'clamp(34px, 4.5vw, 48px)', fontWeight: 700, margin: '0 0 8px', letterSpacing: '-0.02em' }}>
          One small check. Acquisitions on bank debt or cash. Wagner owns clinics from Day 1.
        </h1>
        <p style={{ fontSize: 15, color: C.muted, margin: 0, maxWidth: 880, lineHeight: 1.55 }}>
          Wagner writes <strong style={{ color: C.gold }}>{fmtMoney(monthlyBurnY1 * 12)}</strong> over the first 12 months for operating capital — drawn monthly. <strong style={{ color: C.green }}>Y2 self-funds</strong> from clinic cash flow. Acquisitions paid via <strong style={{ color: C.gold }}>bank debt or cash</strong>. <strong style={{ color: C.text }}>Wagner owns 100% of every clinic from Day 1.</strong> <strong style={{ color: C.gold }}>All multiple arbitrage on exit goes to Wagner.</strong>
        </p>
      </div>

      {/* HEADLINE STATS · operating ask only · brighter colors for readability */}
      <div style={{
        background: `linear-gradient(135deg, rgba(201,168,76,0.14), ${C.bg3})`,
        border: `2px solid rgba(201,168,76,0.45)`, borderRadius: 14, padding: '26px 30px',
        marginBottom: 18,
      }}>
        {/* WAGNER MONTHLY DRAW · the headline ask (12-month framing) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 24, alignItems: 'center', paddingBottom: 22, marginBottom: 20, borderBottom: `1px solid ${C.border}` }} className="kb-wagner-hero">
          <div>
            <div style={{ fontFamily: F.mono, fontSize: 11, color: C.gold, letterSpacing: '0.20em', textTransform: 'uppercase', fontWeight: 800, marginBottom: 6 }}>
              ★ Monthly Draw · to build platform + roll-up
            </div>
            <div style={{ fontFamily: F.display, fontSize: 'clamp(48px, 6vw, 64px)', fontWeight: 800, color: C.gold, lineHeight: 1, marginBottom: 8, letterSpacing: '-0.02em' }}>
              ~${Math.round(monthlyBurnY1 / 1_000)}K<span style={{ fontSize: '0.5em', color: C.goldLight, fontWeight: 600 }}>/mo</span>
            </div>
            <div style={{ fontFamily: F.mono, fontSize: 12, color: C.goldLight, letterSpacing: '0.06em', fontWeight: 700 }}>
              Y1 average · drawn monthly per signed expense forecast · {fmtMoney(monthlyBurnY1 * 12)} for the first 12 months
            </div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.border}`, borderRadius: 12, padding: '18px 22px' }}>
            <div style={{ fontFamily: F.mono, fontSize: 10, color: C.faint, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 8 }}>
              Operating Capital Over 12 Months*
            </div>
            <div style={{ fontFamily: F.display, fontSize: 28, fontWeight: 800, color: C.text, lineHeight: 1.1, marginBottom: 6 }}>
              {fmtMoney(monthlyBurnY1 * 12)} total
            </div>
            <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.5 }}>
              Team + marketing + SaaS for Y1 build. <span style={{ color: C.goldLight, fontFamily: F.mono }}>*</span>Wagner releases first <strong style={{ color: C.text }}>$120K at signing</strong> for Day-1 hires, then monthly thereafter. <strong style={{ color: C.green }}>Y2 is self-funding</strong> from clinic cash flow + Scale Services revenue.
            </div>
          </div>
        </div>

        {/* SUPPORTING KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
          <Kpi label="Acquisition value funded"   val={fmtMoney(totalAcqValue)}     sub={`${totalAcqCount} clinics @ ~$1.9M avg · 24mo`} color={C.goldLight} />
          <Kpi label="Wagner cash at close (50%)" val={fmtMoney(totalWagnerCash)}   sub="from $25M+ EBITDA cash flow · debt OR cash option" color={C.globe} />
          <Kpi label="Bank debt drawn"            val={fmtMoney(totalBankDebt)}     sub="cross-collateralized · prime + 2-3.75%" color={C.align} />
          <Kpi label="ChiroPillar EBITDA · Mo 24"  val={fmtMoney(finalEbitda)}       sub="acquired-clinic bolt-on · see build-up below for full" color={C.green} />
          <Kpi label="Exit · 8-10×"               val={`${fmtMoney(exitLow)}-${fmtMoney(exitHigh)}`} sub={`combined ${fmtMoney(25_000_000 + finalEbitda)} EBITDA`} color={C.goldLight} />
        </div>
      </div>

      {/* MONTHLY BURN STRIP · what Wagner actually writes per month (Y1 only — Y2 self-funded) */}
      <div style={{
        background: `linear-gradient(135deg, rgba(46,117,182,0.10), ${C.bg3})`,
        border: `1px solid rgba(46,117,182,0.30)`, borderRadius: 14, padding: '22px 28px',
        marginBottom: 24,
      }}>
        <div style={{ fontFamily: F.mono, fontSize: 11, color: C.align, letterSpacing: '0.20em', textTransform: 'uppercase', fontWeight: 800, marginBottom: 10 }}>
          💸 Monthly draw schedule · Y1 Wagner-funded · Y2 self-funded from operations
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          <BurnPill label="Q1 (Mo 1-3) · build phase"           val={`$${Math.round(((TIMELINE[0].team_cost + TIMELINE[0].marketing + TIMELINE[0].saas) / 3) / 1_000)}K/mo`} sub="Eric + McGrath + Ops Lead + Marketer · Wagner-funded" color={C.globe} />
          <BurnPill label="Q2 (Mo 4-6) · sales staffed"         val={`$${Math.round(((TIMELINE[1].team_cost + TIMELINE[1].marketing + TIMELINE[1].saas) / 3) / 1_000)}K/mo`} sub="8 people · full sales engine · Wagner-funded" color={C.align} />
          <BurnPill label="★ Y1 average · Wagner ask"           val={`$${Math.round(monthlyBurnY1 / 1_000)}K/mo`} sub={`${fmtMoney(monthlyBurnY1 * 12)} total over 12 months`} color={C.gold} bold />
          <BurnPill label="Y2 average · SELF-FUNDED"            val={`$${Math.round(monthlyBurnY2 / 1_000)}K/mo`} sub="paid from clinic cash flow + Scale Services revenue" color={C.green} />
        </div>
        <div style={{ marginTop: 16, padding: '12px 18px', background: 'rgba(255,255,255,0.04)', borderRadius: 10, fontSize: 13, color: C.muted, lineHeight: 1.6 }}>
          <strong style={{ color: C.text }}>Practical draw schedule:</strong> Wagner wires the Y1 average (<strong style={{ color: C.gold }}>~${Math.round(monthlyBurnY1 / 1_000)}K/month</strong>) for the first 12 months — <strong style={{ color: C.gold }}>{fmtMoney(monthlyBurnY1 * 12)} total Y1 ask</strong>. First $120K released at signing to cover Day-1 hires (Eric + McGrath) and Month-3 onboarding (Ops Lead + Marketer). Subsequent draws monthly against signed expense forecast. <strong style={{ color: C.green }}>Y2 (months 13-24) is self-funded</strong> from clinic cash flow + Scale Services revenue — by month 12 ChiroPillar EBITDA covers the Y2 burn with cushion.
        </div>
      </div>

      {/* CHIROPILLAR EBITDA BUILD-UP · where the $7.26M comes from + 3-5yr scale */}
      <div style={{
        background: `linear-gradient(135deg, rgba(46,204,139,0.08), ${C.bg3})`,
        border: `1px solid rgba(46,204,139,0.30)`, borderRadius: 14, padding: '24px 28px',
        marginBottom: 32,
      }}>
        <div style={{ fontFamily: F.mono, fontSize: 11, color: C.green, letterSpacing: '0.20em', textTransform: 'uppercase', fontWeight: 800, marginBottom: 8 }}>
          ChiroPillar EBITDA build-up · where the {fmtMoney(finalEbitda)} comes from
        </div>
        <h2 style={{ fontFamily: F.display, fontSize: 22, fontWeight: 700, color: C.text, margin: '0 0 14px', letterSpacing: '-0.01em' }}>
          3 EBITDA engines. 24-month base. 3-5 year scale.
        </h2>
        <p style={{ fontSize: 13.5, color: C.muted, lineHeight: 1.6, margin: '0 0 18px' }}>
          The {fmtMoney(finalEbitda)} headline is the <strong style={{ color: C.text }}>acquired-clinic bolt-on</strong> at month 24 — the EBITDA that adds to Wagner&apos;s existing $25M+ for the exit re-rate. <strong style={{ color: C.green }}>Total ChiroPillar EBITDA (incl. Scale Services + Digital app)</strong> at month 24 is materially higher, and the 3-5 year trajectory scales dramatically beyond that as the acquisition engine compounds.
        </p>

        {/* THREE EBITDA SOURCES at Month 24 */}
        <div style={{ fontFamily: F.mono, fontSize: 10, color: C.faint, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 10 }}>
          Month 24 · ChiroPillar EBITDA sources
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginBottom: 18 }}>
          <Sub label="1. Acquired clinics · 25 closed × ~$290K avg" val={fmtMoney(finalEbitda)} color={C.spine} />
          <Sub label="2. Scale Services · $2.8M rev × 75% margin"   val={fmtMoney(2_100_000)} color={C.gold} />
          <Sub label="3. Digital app · $825K rev × 85% margin"      val={fmtMoney(700_000)}   color={C.green} />
          <Sub label="TOTAL ChiroPillar EBITDA · Mo 24"             val={fmtMoney(finalEbitda + 2_100_000 + 700_000)} color={C.goldLight} />
        </div>

        {/* 3-5 YEAR SCALE PROJECTION */}
        <div style={{ fontFamily: F.mono, fontSize: 10, color: C.faint, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 700, marginTop: 22, marginBottom: 10 }}>
          3-5 year scale projection · post month 24
        </div>
        <div style={{ background: C.bg3, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden', marginBottom: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr 1fr 1fr 1fr 1.4fr', gap: 12, padding: '12px 18px', background: 'rgba(255,255,255,0.04)', borderBottom: `1px solid ${C.border}`, fontFamily: F.mono, fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#FFFFFF', fontWeight: 700 }}>
            <div>Year</div>
            <div style={{ textAlign: 'right' }}>Clinics owned</div>
            <div style={{ textAlign: 'right' }}>Clinic EBITDA</div>
            <div style={{ textAlign: 'right' }}>Scale Svcs EBITDA</div>
            <div style={{ textAlign: 'right' }}>Total CP EBITDA</div>
            <div>Combined w/ Wagner $25M+ · 9× midpoint</div>
          </div>
          <ScaleRow year="Y2 · Mo 24" clinics="25" clinicEb={finalEbitda} scaleEb={2_800_000} note="$32M+ combined · ~$290M exit potential" totalColor={C.gold} />
          <ScaleRow year="Y3" clinics="45" clinicEb={13_500_000} scaleEb={4_500_000} note="$43M+ combined · ~$385M exit potential" totalColor={C.gold} />
          <ScaleRow year="Y4" clinics="70" clinicEb={22_400_000} scaleEb={7_200_000} note="$54M+ combined · ~$490M exit potential" totalColor={C.goldLight} />
          <ScaleRow year="Y5" clinics="100" clinicEb={34_000_000} scaleEb={10_500_000} note="$69M+ combined · ~$625M exit potential" totalColor={C.goldLight} bold />
        </div>

        <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.65, padding: '14px 18px', background: 'rgba(46,117,182,0.06)', border: '1px solid rgba(46,117,182,0.18)', borderRadius: 10 }}>
          <strong style={{ color: C.text }}>How the engine compounds:</strong> By month 24 the sales engine is fully built and running at <strong style={{ color: C.green }}>~5-6 closes per quarter</strong>. Y3 accelerates to <strong style={{ color: C.gold }}>~20 closes/yr</strong> as the playbook is proven and Wagner&apos;s medical-team install is repeatable. By Y5 we&apos;ve closed <strong style={{ color: C.gold }}>~100 clinics</strong> across Wagner&apos;s 7-state territory + adjacent expansion. Scale Services revenue compounds at ~50%/yr (each acquired clinic seeds 5-10 Scale Services customers from its referral network). Digital app reaches <strong style={{ color: C.green }}>200K+ users</strong> by Y5. <strong style={{ color: C.gold }}>This is the 3-5 year vision Wagner needs to see — the platform isn&apos;t a 24-month bolt-on, it&apos;s the platform Wagner exits at $500-625M+ off his combined EBITDA.</strong>
        </div>
      </div>

      {/* KB COMPENSATION CALLOUT · 4% one-time + 5% ongoing */}
      <div style={{
        background: `linear-gradient(135deg, rgba(46,204,139,0.10), ${C.bg3})`,
        border: `1px solid rgba(46,204,139,0.35)`, borderRadius: 14, padding: '24px 28px',
        marginBottom: 32,
      }}>
        <div style={{ fontFamily: F.mono, fontSize: 11, color: C.gold, letterSpacing: '0.20em', textTransform: 'uppercase', fontWeight: 800, marginBottom: 8 }}>
          ★ Wagner gets · all equity · all multiple arbitrage · the system to scale
        </div>
        <h2 style={{ fontFamily: F.display, fontSize: 24, fontWeight: 700, color: C.text, margin: '0 0 14px', letterSpacing: '-0.01em' }}>
          Wagner keeps 100% of every clinic. KB earns only on deals we source.
        </h2>
        <div style={{ fontSize: 14, color: C.muted, lineHeight: 1.65, marginBottom: 18 }}>
          <strong style={{ color: C.text }}>Wagner walks away with:</strong> 100% equity in every acquired clinic, all the multiple arbitrage on exit (2.4× cost basis → 8-10× platform), the entire acquisition + roll-up engine (sales team + ad system + intake funnel + CRM + Clay enrichment), the ChiroPillar tech platform (digital twin + dashboards + AI-tracked attribution that earns a higher tech multiple at exit), and Wagner&apos;s existing $25M+ EBITDA re-rated from 5-7× siloed to 8-10× platform. <strong style={{ color: C.green }}>KB only earns on the deals KB actually sources and the offices we bring on — and only on the exit of those specific deals we sourced and helped scale.</strong>
        </div>

        <div style={{ fontFamily: F.mono, fontSize: 10, color: C.faint, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 10 }}>
          KB compensation · on platform-sourced deals only
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 18 }}>
          <Sub label="4% acq consulting · on platform-sourced closes only"  val={fmtMoney(kbOneTimeFee)}       color={C.green} />
          <Sub label="5% × revenue from platform-sourced clinics × 5yr"     val={fmtMoney(kbRevenueShare5yr)} color={C.gold} />
          <Sub label="5% × Scale Services revenue (Y1-Y3)"                   val={fmtMoney(kbScaleShare)}      color={C.green} />
          <Sub label="5% × exit of platform-sourced clinics · 2.5/2.5"      val={fmtMoney(kbExitFee)}         color={C.goldLight} />
          <Sub label="Total KB earned (24mo + hold + exit)"                  val={fmtMoney(totalKbShare)}     color={C.gold} />
        </div>
        <div style={{ fontSize: 13.5, color: C.muted, lineHeight: 1.65, padding: '14px 18px', background: 'rgba(46,117,182,0.06)', border: '1px solid rgba(46,117,182,0.18)', borderRadius: 10 }}>
          <strong style={{ color: C.text }}>The 4% acquisition fee</strong> is paid <strong style={{ color: C.green }}>only on chiropractor offices KB sources through the platform</strong> (intake funnel, ad-driven leads, McGrath relationship intros, KB sales team closes). If Wagner finds a deal independently outside the platform, KB earns nothing on it. Sized on EV — <strong style={{ color: C.green }}>$1.9M clinic = ~$76K to KB at close</strong>, split 2% Eric/ChiroPillar + 2% McGrath. <strong style={{ color: C.text }}>The 5% ongoing</strong> is tracked through the platform (Stripe + intake attribution + CRM) and paid quarterly net of refunds — <strong style={{ color: C.text }}>flows 100% to ChiroPillar</strong> on revenue from platform-sourced clinics + Scale Services. <strong style={{ color: C.text }}>The 5% exit fee</strong> applies <strong style={{ color: C.green }}>only on the platform-sourced clinics KB helped scale</strong> when Wagner sells them individually or rolls them into a strategic/PE exit — split 2.5% Eric/ChiroPillar + 2.5% McGrath. Wagner can audit at any time.
        </div>
      </div>

      {/* FOUNDER COMP BREAKDOWN · Eric vs McGrath individual takes */}
      <div style={{
        background: `linear-gradient(135deg, rgba(201,168,76,0.08), ${C.bg3})`,
        border: `1px solid rgba(201,168,76,0.30)`, borderRadius: 14, padding: '24px 28px',
        marginBottom: 32,
      }}>
        <div style={{ fontFamily: F.mono, fontSize: 11, color: C.gold, letterSpacing: '0.20em', textTransform: 'uppercase', fontWeight: 800, marginBottom: 8 }}>
          ★ Founder Comp · Eric + Scott individual takes
        </div>
        <h2 style={{ fontFamily: F.display, fontSize: 22, fontWeight: 700, color: C.text, margin: '0 0 14px', letterSpacing: '-0.01em' }}>
          Base + acquisition fee + exit fee. Aligned with deal flow.
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }} className="kb-founder-grid">
          {/* ERIC */}
          <div style={{ background: C.bg3, border: `1px solid ${C.border}`, borderLeft: `4px solid ${C.gold}`, borderRadius: 12, padding: '20px 22px' }}>
            <div style={{ fontFamily: F.display, fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 4 }}>Eric Skeldon · Founder/CEO · ChiroPillar owner</div>
            <div style={{ fontSize: 12, color: C.gold, fontFamily: F.mono, letterSpacing: '0.10em', marginBottom: 14, fontWeight: 700 }}>FULL-TIME · DAY 0</div>
            <div style={{ display: 'grid', gap: 8, marginBottom: 14 }}>
              <FounderLine label="Upfront on signing"          val="$25,000"                                    note="cash at term-sheet execution" accent={C.gold} />
              <FounderLine label="Monthly draw × 24mo"          val={`$12,500/mo · ${fmtMoney(12_500 * 24)}`}    note="paid from Wagner operating check" />
              <FounderLine label="2% acq consulting fee"        val={`${fmtMoney(totalAcqValue * 0.02)}`}        note="~$38K per $1.9M close · 25 closes · half of KB's 4%" accent={C.green} />
              <FounderLine label="2.5% exit fee · ChiroPillar slice" val={`${fmtMoney(kbExitFee * 0.5)}`}         note="paid at eventual platform sale · half of 5%" accent={C.goldLight} />
              <FounderLine label="5% ongoing rev share · to ChiroPillar" val={fmtMoney(kbRevenueShare5yr + kbScaleShare)} note="flows to ChiroPillar entity (Eric owns)" accent={C.gold} />
            </div>
            <div style={{ padding: '10px 14px', background: 'rgba(201,168,76,0.10)', borderRadius: 8, fontSize: 13, color: C.text, fontFamily: F.mono, fontWeight: 700, display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: C.gold }}>ERIC TOTAL (24mo + hold + exit)</span>
              <span style={{ fontFamily: F.display, fontSize: 18, color: C.gold }}>{fmtMoney(25_000 + 12_500 * 24 + totalAcqValue * 0.02 + kbExitFee * 0.5 + kbRevenueShare5yr + kbScaleShare)}</span>
            </div>
          </div>

          {/* SCOTT MCGRATH */}
          <div style={{ background: C.bg3, border: `1px solid ${C.border}`, borderLeft: `4px solid ${C.green}`, borderRadius: 12, padding: '20px 22px' }}>
            <div style={{ fontFamily: F.display, fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 4 }}>Scott McGrath · BD Partner</div>
            <div style={{ fontSize: 12, color: C.green, fontFamily: F.mono, letterSpacing: '0.10em', marginBottom: 14, fontWeight: 700 }}>FRACTIONAL · DAY 0 · BROUGHT WAGNER</div>
            <div style={{ display: 'grid', gap: 8, marginBottom: 14 }}>
              <FounderLine label="Monthly base × 24mo"          val={`$5,000/mo · ${fmtMoney(5_000 * 24)}`}      note="consultant retainer · paid monthly" accent={C.gold} />
              <FounderLine label="2% acq consulting fee"        val={`${fmtMoney(totalAcqValue * 0.02)}`}        note="~$38K per $1.9M close · 25 closes · half of KB's 4%" accent={C.green} />
              <FounderLine label="2.5% exit fee · ChiroPillar slice" val={`${fmtMoney(kbExitFee * 0.5)}`}         note="paid at eventual platform sale · half of 5%" accent={C.goldLight} />
              <FounderLine label="No ongoing rev share"          val="—"                                          note="ongoing 5% flows to ChiroPillar entity" />
              <FounderLine label="No equity"                      val="—"                                          note="all comp is fee-based · clean" />
            </div>
            <div style={{ padding: '10px 14px', background: 'rgba(46,204,139,0.10)', borderRadius: 8, fontSize: 13, color: C.text, fontFamily: F.mono, fontWeight: 700, display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: C.green }}>SCOTT TOTAL (24mo + exit)</span>
              <span style={{ fontFamily: F.display, fontSize: 18, color: C.green }}>{fmtMoney(5_000 * 24 + totalAcqValue * 0.02 + kbExitFee * 0.5)}</span>
            </div>
          </div>
        </div>
        <div style={{ marginTop: 16, fontSize: 13, color: C.muted, lineHeight: 1.65, padding: '12px 18px', background: 'rgba(46,117,182,0.06)', border: '1px solid rgba(46,117,182,0.18)', borderRadius: 10 }}>
          <strong style={{ color: C.text }}>How Scott and Eric win:</strong> base salary + 2% acquisition consulting fee (each, half of KB&apos;s 4%) <strong style={{ color: C.green }}>only on platform-sourced clinic closes</strong> + 2.5% exit fee (each, half of KB&apos;s 5%) <strong style={{ color: C.green }}>only on the eventual sale of platform-sourced clinics we helped scale</strong>. Equal split on transaction-level fees. The ongoing 5% revenue share is a ChiroPillar entity fee on revenue from platform-sourced clinics + Scale Services — Eric owns ChiroPillar, so it accrues to him as owner equity value, not a personal line item.
        </div>
      </div>

      {/* VALUE CHAIN */}
      <SectionHead eyebrow="The value chain · ads to close" title="6 stages. Each owned. Each measured." />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 36 }}>
        {VALUE_CHAIN.map(s => (
          <div key={s.num} style={{
            background: C.bg2, border: `1px solid ${C.border}`, borderLeft: `4px solid ${s.accent}`,
            borderRadius: 14, padding: '22px 26px',
            display: 'grid', gridTemplateColumns: '60px 1fr 280px', gap: 22, alignItems: 'flex-start',
          }} className="kb-chain-row">
            <div style={{ fontFamily: F.display, fontSize: 36, fontWeight: 800, color: s.accent, lineHeight: 1 }}>{s.num}</div>
            <div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 6, flexWrap: 'wrap' }}>
                <h3 style={{ fontFamily: F.display, fontSize: 22, fontWeight: 700, color: C.text, margin: 0, letterSpacing: '-0.01em' }}>{s.name}</h3>
                <span style={{ fontSize: 11, color: s.accent, fontFamily: F.mono, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700 }}>{s.ownership}</span>
              </div>
              <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.6, margin: '0 0 14px' }}>{s.what}</p>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
                {s.tools.map(t => (
                  <span key={t} style={{ fontSize: 11, padding: '3px 9px', borderRadius: 5, background: `${s.accent}18`, color: s.accent, fontFamily: F.mono, fontWeight: 700, letterSpacing: '0.04em' }}>{t}</span>
                ))}
              </div>
            </div>
            <div style={{ background: C.bg3, border: `1px solid ${C.border}`, borderRadius: 10, padding: '14px 16px' }}>
              <div style={{ fontFamily: F.mono, fontSize: 9, color: C.faint, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 10 }}>Metrics</div>
              {s.metrics.map((m, j) => (
                <div key={j} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', fontSize: 11.5, color: C.muted }}>
                  <span>{m.label}</span>
                  <span style={{ color: C.text, fontFamily: F.mono, fontWeight: 700 }}>{m.val}</span>
                </div>
              ))}
              <div style={{ marginTop: 8, paddingTop: 8, borderTop: `1px dashed ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontFamily: F.mono, fontSize: 10, color: s.accent, letterSpacing: '0.10em', textTransform: 'uppercase', fontWeight: 800 }}>Run rate</span>
                <span style={{ fontFamily: F.display, fontSize: 17, fontWeight: 800, color: s.accent }}>{fmtMoney(s.monthly_cost)}/mo</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── ACQUISITION FINANCING STRATEGY ──────────────────────────────── */}
      <SectionHead eyebrow="Acquisition financing · debt or cash · Wagner's $25M+ EBITDA as backstop" title="How acquisitions get paid for." />

      <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 14, padding: '26px 30px', marginBottom: 24 }}>
        <h3 style={{ fontFamily: F.display, fontSize: 22, fontWeight: 700, color: C.text, margin: '0 0 16px', letterSpacing: '-0.01em' }}>
          Bank debt or all-cash. Wagner owns 100% from Day 1. KB earns fees.
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 18 }}>
          {/* SELLER PAYOUT side */}
          <div style={{ background: C.bg3, border: `1px solid ${C.border}`, borderRadius: 12, padding: '18px 22px' }}>
            <div style={{ fontFamily: F.mono, fontSize: 10, color: C.gold, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 12 }}>
              Seller payout · 100% of EV
            </div>
            <div style={{ display: 'grid', gap: 10 }}>
              <Stream pct="50%" amount="Cash at close" sub="Wagner picks: bank debt OR all-cash from practice cash flow · seller wired at close" accent={C.gold} />
              <Stream pct="50%" amount="Seller note" sub="Paid from clinic cash flow · 5-7 yr · 6% int" accent={C.align} />
            </div>
            <div style={{ marginTop: 12, padding: '10px 14px', background: 'rgba(46,117,182,0.06)', borderRadius: 8, fontSize: 12, color: C.muted, lineHeight: 1.5 }}>
              No equity rollover. Seller cashes out fully via cash + note. <strong style={{ color: C.text }}>Wagner owns 100% of the clinic from Day 1</strong> — the moment the seller chiropractor signs. All multiple arbitrage on exit accrues to Wagner.
            </div>
          </div>

          {/* KB FEES side */}
          <div style={{ background: C.bg3, border: `2px solid rgba(46,204,139,0.40)`, borderRadius: 12, padding: '18px 22px' }}>
            <div style={{ fontFamily: F.mono, fontSize: 10, color: C.green, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 12 }}>
              ★ KB Fees · how we get paid (3 layers)
            </div>
            <div style={{ display: 'grid', gap: 10 }}>
              <Stream pct="4%" amount="One-time consulting fee" sub={`On each acquisition EV · ~$76K/close · split 2% Eric/CP + 2% Scott · ${fmtMoney(kbOneTimeFee)} total`} accent={C.green} />
              <Stream pct="5%" amount="Quarterly revenue share" sub={`Of platform-tracked clinic + Scale Services revenue · 100% to ChiroPillar · ${fmtMoney(kbRevenueShare5yr + kbScaleShare)} over 5yr hold`} accent={C.goldLight} />
              <Stream pct="5%" amount="Exit fee at eventual sale" sub={`On ChiroPillar slice · split 2.5% Eric/CP + 2.5% Scott · ~${fmtMoney(kbExitFee)} at midpoint 9× multiple`} accent={C.gold} />
            </div>
            <div style={{ marginTop: 12, padding: '10px 14px', background: 'rgba(46,204,139,0.06)', borderRadius: 8, fontSize: 12, color: C.muted, lineHeight: 1.5 }}>
              4% at close (split 2/2) · 5% quarterly (ChiroPillar) · 5% at exit (split 2.5/2.5). <strong style={{ color: C.green }}>Aligned with deal volume, revenue growth, AND the eventual exit re-rate.</strong>
            </div>
          </div>
        </div>

        <div style={{ background: C.bg3, border: `1px solid ${C.border}`, borderRadius: 12, padding: '18px 22px', marginBottom: 18 }}>
          <div style={{ fontFamily: F.mono, fontSize: 10, color: C.gold, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 12 }}>
            Bank debt math · 24-month aggregate (if Wagner uses leverage path)
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
            <Sub label="Total clinic value" val={fmtMoney(totalAcqValue)} color={C.text} />
            <Sub label="Wagner cash (50%)" val={fmtMoney(totalWagnerCash)} color={C.spine} />
            <Sub label="Bank debt drawn (50%)" val={fmtMoney(totalBankDebt)} color={C.align} />
            <Sub label="Annual debt service" val={`~${fmtMoney(annualDebtServiceTotal)}/yr`} color={C.coral} />
            <Sub label="DSCR (Y2+ acquired EBITDA)" val={`${dscrAcq.toFixed(2)}×`} color={C.green} />
          </div>
        </div>

        <div style={{ fontSize: 14, color: C.muted, lineHeight: 1.65, padding: '14px 18px', background: 'rgba(46,117,182,0.06)', border: '1px solid rgba(46,117,182,0.18)', borderRadius: 10 }}>
          <strong style={{ color: C.text }}>Why this works:</strong> Wagner has $25M+ existing EBITDA. At 3× senior leverage, that supports <strong style={{ color: C.gold }}>$75M+ debt capacity</strong> — comfortably above the <strong style={{ color: C.align }}>{fmtMoney(totalBankDebt)}</strong> needed over 24 months. Wagner can also choose <strong style={{ color: C.gold }}>all-cash on individual deals</strong> from practice cash flow when rate environment or deal economics favor it. Each acquired clinic generates <strong style={{ color: C.green }}>+$250K-$500K EBITDA</strong> in year 1 (Wagner&apos;s medical-team install), which covers debt service with cushion. By month 24, acquired-clinic cash flow alone services the debt — Wagner&apos;s existing $25M+ is locked into the platform for the exit re-rate, not at risk for operating coverage.
        </div>
      </div>

      {/* BANK / LENDER OPTIONS */}
      <SectionHead eyebrow="Best lenders · ranked for Wagner's profile" title="6 banks + 1 non-bank specialist." />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: 14, marginBottom: 36 }}>
        {LENDERS.map(l => (
          <div key={l.name} style={{
            background: C.bg2, border: `1px solid ${C.border}`, borderLeft: `4px solid ${l.accent}`,
            borderRadius: 14, padding: '22px 24px',
          }}>
            <div style={{ fontFamily: F.display, fontSize: 20, fontWeight: 700, color: C.text, marginBottom: 4, letterSpacing: '-0.01em' }}>{l.name}</div>
            <div style={{ fontSize: 12, color: l.accent, fontFamily: F.mono, letterSpacing: '0.08em', marginBottom: 14, fontWeight: 700 }}>{l.type}</div>
            <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr', gap: 8, fontSize: 12.5, lineHeight: 1.55, marginBottom: 14 }}>
              <span style={{ color: C.faint, fontFamily: F.mono, letterSpacing: '0.08em' }}>SIZE</span>
              <span style={{ color: C.text }}>{l.max_size}</span>
              <span style={{ color: C.faint, fontFamily: F.mono, letterSpacing: '0.08em' }}>RATE</span>
              <span style={{ color: C.green, fontFamily: F.mono, fontWeight: 700 }}>{l.rate}</span>
            </div>
            <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.6, padding: '12px 14px', background: `${l.accent}10`, borderRadius: 8, border: `1px solid ${l.accent}30` }}>
              <strong style={{ color: l.accent }}>Best for:</strong> {l.best_for}
            </div>
          </div>
        ))}
      </div>

      {/* THE TEAM */}
      <SectionHead eyebrow="The team · hires + comp + when" title="10 roles. Phased over 15 months." />
      <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 14, overflow: 'hidden', marginBottom: 36 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2.4fr 1fr 1.6fr 2.6fr', gap: 14, padding: '14px 22px', background: C.bg3, borderBottom: `1px solid ${C.border}`, fontFamily: F.mono, fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.faint, fontWeight: 700 }}>
          <div>Role</div>
          <div>Hire when</div>
          <div>Comp</div>
          <div>Responsibilities</div>
        </div>
        {HIRES.map((h, i) => (
          <div key={i} style={{
            display: 'grid', gridTemplateColumns: '2.4fr 1fr 1.6fr 2.6fr', gap: 14, padding: '14px 22px',
            borderBottom: i < HIRES.length - 1 ? `1px solid ${C.border}` : 'none',
            fontSize: 13.5, alignItems: 'baseline',
            background: i < 3 ? 'rgba(201,168,76,0.05)' : 'transparent',
          }}>
            <div style={{ color: C.text, fontWeight: i < 3 ? 700 : 500 }}>{h.role}</div>
            <div style={{ color: i < 3 ? C.gold : C.muted, fontFamily: F.mono, fontSize: 12, fontWeight: 700 }}>{h.when}</div>
            <div style={{ color: C.green, fontFamily: F.mono, fontSize: 11.5, fontWeight: 600 }}>{h.comp}</div>
            <div style={{ color: C.muted, fontSize: 12.5, lineHeight: 1.5 }}>{h.responsibilities}</div>
          </div>
        ))}
      </div>

      {/* SAAS STACK */}
      <SectionHead eyebrow="SaaS + Tech Stack" title="13 line items. Total cost predictable." />
      <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 14, overflow: 'hidden', marginBottom: 36 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 110px 2.6fr', gap: 14, padding: '12px 22px', background: C.bg3, borderBottom: `1px solid ${C.border}`, fontFamily: F.mono, fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.faint, fontWeight: 700 }}>
          <div>Tool</div>
          <div style={{ textAlign: 'right' }}>$/mo</div>
          <div>What it does</div>
        </div>
        {STACK.map((s, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '1.8fr 110px 2.6fr', gap: 14, padding: '11px 22px', borderBottom: i < STACK.length - 1 ? `1px solid ${C.border}` : 'none', fontSize: 13, alignItems: 'baseline' }}>
            <div style={{ color: C.text, fontWeight: 600 }}>{s.tool}</div>
            <div style={{ textAlign: 'right', color: C.gold, fontFamily: F.mono, fontWeight: 700 }}>${s.cost_mo.toLocaleString()}</div>
            <div style={{ color: C.muted, fontSize: 12.5 }}>{s.use}</div>
          </div>
        ))}
        <div style={{ padding: '14px 22px', background: C.bg3, display: 'flex', justifyContent: 'space-between', fontFamily: F.mono, fontSize: 12, color: C.gold, fontWeight: 700, letterSpacing: '0.06em' }}>
          <span>STACK SUBTOTAL · MONTHLY</span>
          <span style={{ fontFamily: F.display, fontSize: 18, color: C.gold }}>${stackTotalMo.toLocaleString()}/mo</span>
        </div>
      </div>

      {/* QUARTERLY DEPLOYMENT · revised */}
      <SectionHead eyebrow="Capital deployment · operating vs acquisitions" title="Wagner's check on the left. Bank debt on the right." />
      <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 14, overflow: 'hidden', marginBottom: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '120px 100px 100px 90px 80px 120px 120px 1.5fr', gap: 12, padding: '14px 22px', background: C.bg3, borderBottom: `1px solid ${C.border}`, fontFamily: F.mono, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#FFFFFF', fontWeight: 700 }}>
          <div>Quarter</div>
          <div style={{ textAlign: 'right' }}>Team</div>
          <div style={{ textAlign: 'right' }}>Mkt</div>
          <div style={{ textAlign: 'right' }}>SaaS</div>
          <div style={{ textAlign: 'right' }}>Closes</div>
          <div style={{ textAlign: 'right' }}>Wagner $</div>
          <div style={{ textAlign: 'right' }}>Bank $</div>
          <div>Milestone</div>
        </div>
        {TIMELINE.map((t, i) => (
          <div key={i} style={{
            display: 'grid', gridTemplateColumns: '120px 100px 100px 90px 80px 120px 120px 1.5fr', gap: 12,
            padding: '14px 22px',
            borderBottom: i < TIMELINE.length - 1 ? `1px solid ${C.border}` : 'none',
            alignItems: 'center', fontSize: 14,
          }}>
            <div style={{ fontFamily: F.mono, color: C.gold, fontWeight: 800, fontSize: 13 }}>{t.q}</div>
            <div style={{ textAlign: 'right', color: '#FFFFFF', fontFamily: F.mono, fontWeight: 600 }}>{fmtMoney(t.team_cost)}</div>
            <div style={{ textAlign: 'right', color: '#FFFFFF', fontFamily: F.mono, fontWeight: 600 }}>{fmtMoney(t.marketing)}</div>
            <div style={{ textAlign: 'right', color: '#C9CCDB', fontFamily: F.mono, fontWeight: 500 }}>{fmtMoney(t.saas)}</div>
            <div style={{ textAlign: 'right', color: t.acq_count > 0 ? C.green : C.faint, fontFamily: F.display, fontWeight: 800, fontSize: 20 }}>{t.acq_count}</div>
            <div style={{ textAlign: 'right', color: C.globe, fontFamily: F.display, fontWeight: 800, fontSize: 15 }}>{fmtMoney(t.wagner_cash)}</div>
            <div style={{ textAlign: 'right', color: C.goldLight, fontFamily: F.display, fontWeight: 800, fontSize: 15 }}>{fmtMoney(t.bank_debt)}</div>
            <div style={{ color: '#C9CCDB', fontSize: 13, lineHeight: 1.55 }}>{t.notes}</div>
          </div>
        ))}
      </div>

      {/* THE NEW ASK */}
      <div style={{
        background: `linear-gradient(135deg, rgba(201,168,76,0.14), ${C.bg3})`,
        border: `2px solid rgba(201,168,76,0.45)`, borderRadius: 14,
        padding: '28px 32px', marginBottom: 24,
      }}>
        <div style={{ fontFamily: F.mono, fontSize: 11, color: C.gold, letterSpacing: '0.22em', textTransform: 'uppercase', fontWeight: 800, marginBottom: 8 }}>
          ★ The Ask · Y1 Operating Capital Only (Y2 self-funded)
        </div>
        <h2 style={{ fontFamily: F.display, fontSize: 32, fontWeight: 700, color: C.text, margin: '0 0 16px', letterSpacing: '-0.02em' }}>
          {fmtMoney(monthlyBurnY1 * 12)} over 12 months. That&apos;s it.
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 18 }}>
          <Ask label="Operating capital · 12mo"  val={fmtMoney(monthlyBurnY1 * 12)} sub={`~$${Math.round(monthlyBurnY1 / 1_000)}K/mo · team + marketing + SaaS · drawn monthly`} color={C.gold} />
          <Ask label="Y2 (months 13-24)"          val="Self-funded"                 sub="from clinic cash flow + Scale Services revenue · no further Wagner capital" color={C.green} />
          <Ask label="Acquisitions"               val="Debt OR cash"                 sub={`Wagner picks per deal · ${fmtMoney(totalWagnerCash)} cash from $25M+ EBITDA + ${fmtMoney(totalBankDebt)} senior debt (if leveraged)`} />
          <Ask label="KB compensation"            val="4% + 5% + 5%"                sub="acq consulting (2/2) · ongoing rev share (100% CP) · exit fee (2.5/2.5)" color={C.green} />
        </div>
        <div style={{ fontSize: 14, color: C.muted, lineHeight: 1.65, padding: '16px 20px', background: 'rgba(46,117,182,0.08)', border: '1px solid rgba(46,117,182,0.20)', borderRadius: 10 }}>
          <strong style={{ color: C.text }}>Why the small ask works:</strong> Wagner&apos;s $25M+ existing EBITDA gives him $75M+ senior debt capacity at favorable rates — <strong style={{ color: C.gold }}>or he can pay all-cash on individual deals from practice cash flow</strong> when he prefers to skip leverage. Either way, we don&apos;t need his cash for acquisitions, we need his <strong style={{ color: C.gold }}>credit profile and EBITDA backstop</strong>. KB needs only <strong style={{ color: C.gold }}>{fmtMoney(monthlyBurnY1 * 12)} for Y1</strong> to run the engine (build the team, run the ads, pay the SaaS). <strong style={{ color: C.green }}>By month 12, ChiroPillar EBITDA + Scale Services cash flow covers Y2 burn with cushion — the platform pays for itself.</strong> KB takes 4% one-time consulting fee on deals sourced on platform (split 2% Eric / 2% Scott), 5% of revenue ongoing (100% to ChiroPillar), and 5% of ChiroPillar&apos;s slice of the eventual exit (split 2.5% Eric / 2.5% Scott). <strong style={{ color: C.green }}>Wagner owns 100% of every clinic from Day 1</strong> the moment each seller signs — no PE waterfalls, no carry splits, no LP commitments. All multiple arbitrage on exit accrues to Wagner.
        </div>
      </div>

      {/* ── PRO FORMA · FULL REVENUE LADDER ─────────────────────────────── */}
      <SectionHead eyebrow="Pro Forma · the full value ladder" title="$9/mo app to $25M acquisition · 3-year build." />

      <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 14, padding: '24px 28px', marginBottom: 18 }}>
        <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.65, marginTop: 0, marginBottom: 22 }}>
          Same audience, escalating ticket size. The <strong style={{ color: C.green }}>$9/month ChiroPillar Digital app</strong> is the top of funnel — a chiropractor whose patient sees the app eventually subscribes themselves. <strong style={{ color: C.gold }}>Scale Services</strong> ($500 → $50K) productizes Wagner&apos;s playbook for chiros who don&apos;t want to sell. <strong style={{ color: C.spine }}>Acquisition</strong> ($1.9M each) captures the operators ready to step out. <strong style={{ color: C.goldLight }}>Multiple arbitrage</strong> on exit re-rates every dollar of EBITDA from 1.5–3× (cost basis) to 8–10× (platform).
        </p>

        {/* The 5-tier value ladder visualized */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
          <LadderRow tier="TIER 1" name="ChiroPillar Digital App · $9/mo or $74/yr"  audience="Patients (consumer)"  price="$9-74"      y3="$3.0M / yr" accent={C.green}    width={20} />
          <LadderRow tier="TIER 2" name="Strategy Call · 60-min 1:1 with Wagner"     audience="DCs · single touch"  price="$500-2.5K"  y3="$420K / yr" accent={C.globe}    width={35} />
          <LadderRow tier="TIER 3" name="Practice Audit · 2-week diagnostic + plan"  audience="DCs · committed"     price="$5-10K"     y3="$680K / yr" accent={C.align}    width={50} />
          <LadderRow tier="TIER 4" name="Medical-Team Installation · 90-day install" audience="DCs · serious scaling" price="$25-50K"  y3="$1.4M / yr" accent={C.gold}     width={65} />
          <LadderRow tier="TIER 5" name="ChiroPillar Mastermind · 12-mo cohort"      audience="DCs · scaling without selling" price="$12K/yr" y3="$700K / yr" accent={C.goldLight} width={75} />
          <LadderRow tier="TIER 6" name="Acquisition · 4-stream offer + medical-team add-on" audience="DCs · ready to step out" price="$1.9M avg" y3="25 clinics" accent={C.spine}    width={100} />
        </div>

        {/* 3-year pro forma table */}
        <div style={{ marginBottom: 22 }}>
          <div style={{ fontFamily: F.mono, fontSize: 10, color: C.gold, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 12 }}>
            3-Year Revenue Pro Forma (annualized run rate)
          </div>
          <div style={{ background: C.bg3, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2.2fr 0.7fr 0.9fr 1fr 1fr', gap: 12, padding: '12px 18px', background: 'rgba(255,255,255,0.04)', borderBottom: `1px solid ${C.border}`, fontFamily: F.mono, fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.faint, fontWeight: 700 }}>
              <div>Revenue Line</div>
              <div style={{ textAlign: 'right' }}>Units Y3</div>
              <div style={{ textAlign: 'right' }}>Y1</div>
              <div style={{ textAlign: 'right' }}>Y2</div>
              <div style={{ textAlign: 'right' }}>Y3</div>
            </div>
            <ProFormaRow line="ChiroPillar Digital App · $9/mo + $74/yr blended"            units="50,000 users"  y1={100_000}    y2={825_000}    y3={3_000_000}  accent={C.green} />
            <ProFormaRow line="Strategy Calls · $500-$2.5K"                                  units="280 calls/yr"  y1={120_000}    y2={250_000}    y3={420_000}    accent={C.globe} />
            <ProFormaRow line="Practice Audits · $5-10K"                                     units="85 audits/yr"  y1={180_000}    y2={400_000}    y3={680_000}    accent={C.align} />
            <ProFormaRow line="Medical-Team Installations · $25-50K"                         units="35 installs/yr" y1={350_000}    y2={825_000}    y3={1_400_000}  accent={C.gold} />
            <ProFormaRow line="Mastermind · $12K/yr × 60 members"                           units="60 members"    y1={300_000}    y2={500_000}    y3={700_000}    accent={C.goldLight} />
            <ProFormaRow line="Acquired clinic revenue (post-lift, blended)"                units="25 clinics"    y1={8_000_000}  y2={27_750_000} y3={52_500_000} accent={C.spine} bold />
            <ProFormaRow line="TOTAL ANNUALIZED REVENUE"                                    units="—"             y1={9_050_000}  y2={30_550_000} y3={58_700_000} accent={C.gold} total />
          </div>
        </div>

        {/* KB 5% share of the totals */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 18 }}>
          <Sub label="KB 5% of Y1 revenue"   val={fmtMoney(9_050_000 * 0.05)}  color={C.green} />
          <Sub label="KB 5% of Y2 revenue"   val={fmtMoney(30_550_000 * 0.05)} color={C.gold} />
          <Sub label="KB 5% of Y3 revenue"   val={fmtMoney(58_700_000 * 0.05)} color={C.gold} />
          <Sub label="KB 3-yr cumulative"     val={fmtMoney((9_050_000 + 30_550_000 + 58_700_000) * 0.05)} color={C.goldLight} />
        </div>
      </div>

      {/* ── MULTIPLE ARBITRAGE BREAKDOWN ────────────────────────────────── */}
      <div style={{
        background: `linear-gradient(135deg, rgba(201,168,76,0.10), ${C.bg3})`,
        border: `2px solid rgba(201,168,76,0.40)`, borderRadius: 14,
        padding: '26px 30px', marginBottom: 32,
      }}>
        <div style={{ fontFamily: F.mono, fontSize: 11, color: C.gold, letterSpacing: '0.22em', textTransform: 'uppercase', fontWeight: 800, marginBottom: 8 }}>
          ★ Multiple Arbitrage · The Real Prize
        </div>
        <h3 style={{ fontFamily: F.display, fontSize: 26, fontWeight: 700, color: C.text, margin: '0 0 18px', letterSpacing: '-0.02em' }}>
          Buy at 2–3× SDE. Exit at 8–10× EBITDA. Re-rate every dollar.
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }} className="kb-val-grid">

          {/* Cost basis side */}
          <div style={{ background: C.bg3, border: `1px solid ${C.border}`, borderRadius: 12, padding: '20px 22px' }}>
            <div style={{ fontFamily: F.mono, fontSize: 10, color: C.muted, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 14 }}>Cost basis · what we paid</div>
            <KvLine label="25 clinics × ~$1.9M each"             val={fmtMoney(47_500_000)} />
            <KvLine label="Multiple paid (avg)"                   val="2.4× SDE" />
            <KvLine label="ChiroPillar acquired EBITDA (post-lift)" val={fmtMoney(7_260_000)} />
            <KvLine label="Wagner existing EBITDA · siloed value (5-7×)" val={`${fmtMoney(25_000_000 * 5)}-${fmtMoney(25_000_000 * 7)}`} accent={C.spine} />
            <KvLine label="Total cost basis"                       val={fmtMoney(47_500_000 + 25_000_000 * 6)} accent={C.text} />
          </div>

          {/* Exit value side */}
          <div style={{ background: C.bg3, border: `2px solid rgba(46,204,139,0.40)`, borderRadius: 12, padding: '20px 22px' }}>
            <div style={{ fontFamily: F.mono, fontSize: 10, color: C.green, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 14 }}>Exit value · what we sell for</div>
            <KvLine label="Combined EBITDA at exit"                val={fmtMoney(32_260_000)} accent={C.gold} />
            <KvLine label="Exit multiple applied"                   val="8–10×" />
            <KvLine label="Exit at 8× (conservative)"               val={fmtMoney(258_080_000)} />
            <KvLine label="Exit at 10× (premium)"                   val={fmtMoney(322_600_000)} accent={C.green} />
            <KvLine label="Multiple arbitrage gain"                 val={`${fmtMoney(258_080_000 - 47_500_000 - 25_000_000 * 6)} – ${fmtMoney(322_600_000 - 47_500_000 - 25_000_000 * 6)}`} accent={C.gold} />
          </div>
        </div>

        <div style={{ marginTop: 20, padding: '16px 22px', background: 'rgba(46,117,182,0.06)', border: '1px solid rgba(46,117,182,0.20)', borderRadius: 10, fontSize: 14, color: C.muted, lineHeight: 1.7 }}>
          <strong style={{ color: C.gold }}>Two arbitrage engines firing at once:</strong>
          <br/><br/>
          <strong style={{ color: C.green }}>1. Clinic-level re-rate:</strong> ChiroPillar buys clinics at <strong style={{ color: C.text }}>2.4× SDE</strong> (~$1.9M each). Wagner installs the medical-team playbook → EBITDA lifts $250K-$500K Y1. At exit, those clinics are valued at the <strong style={{ color: C.gold }}>platform-level 8-10× EBITDA</strong>{' '}instead of the standalone solo-DC multiple. That&apos;s a 3-4× re-rate per clinic on the EBITDA we created.
          <br/><br/>
          <strong style={{ color: C.green }}>2. Wagner-existing-EBITDA re-rate:</strong> Wagner&apos;s $25M of medical-practice EBITDA today is valued <strong style={{ color: C.spine }}>at 5-7× siloed</strong> ($125-175M). Once inside the combined <strong style={{ color: C.gold }}>$32.3M ChiroPillar+Wagner platform</strong> with national brand, RTM/telehealth recurring revenue layer, and proven roll-up engine, every dollar of that same $25M trades at <strong style={{ color: C.gold }}>8-10× alongside the new EBITDA</strong>. That alone is a <strong style={{ color: C.green }}>$25-75M re-rate</strong> on EBITDA Wagner already owns.
          <br/><br/>
          <strong style={{ color: C.text }}>The arbitrage isn&apos;t just on the new acquisitions — it&apos;s on the rerating of the entire enterprise.</strong>
        </div>
      </div>

      {/* WAGNER RETURN · revised MOIC math */}
      <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 14, padding: '24px 28px', marginBottom: 24 }}>
        <SectionHead eyebrow="Wagner's return · 24 months out" title="What does the small check turn into?" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }} className="kb-val-grid">
          <div>
            <div style={{ fontFamily: F.mono, fontSize: 10, color: C.faint, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 10 }}>What Wagner puts in</div>
            <KvLine label="Operating capital (KB run rate)"  val={fmtMoney(totalOperating)} />
            <KvLine label="Cash at close (50% per deal)"      val={fmtMoney(totalWagnerCash)} />
            <KvLine label="Total Wagner cash deployed"        val={fmtMoney(totalOperating + totalWagnerCash)} accent={C.gold} />
            <KvLine label="Bank debt (separate · serviced by acquired EBITDA)" val={fmtMoney(totalBankDebt)} accent={C.align} />
          </div>
          <div>
            <div style={{ fontFamily: F.mono, fontSize: 10, color: C.faint, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 10 }}>What Wagner gets</div>
            <KvLine label="ChiroPillar EBITDA at month 24"   val={fmtMoney(finalEbitda)} />
            <KvLine label="Combined platform EBITDA"          val={fmtMoney(25_000_000 + finalEbitda)} accent={C.gold} />
            <KvLine label="Exit at 8× (conservative)"          val={fmtMoney(exitLow)} />
            <KvLine label="Exit at 10× (premium)"              val={fmtMoney(exitHigh)} accent={C.green} />
          </div>
        </div>
        <div style={{ marginTop: 20, padding: '18px 22px', background: 'rgba(46,204,139,0.08)', border: '1px solid rgba(46,204,139,0.28)', borderRadius: 10, fontSize: 13.5, color: C.muted, lineHeight: 1.7 }}>
          <strong style={{ color: C.green }}>The math:</strong> Wagner&apos;s total cash deployed = <strong style={{ color: C.gold }}>{fmtMoney(totalOperating + totalWagnerCash)}</strong> ({fmtMoney(totalOperating)} operating + {fmtMoney(totalWagnerCash)} cash at close). His existing $25M EBITDA gets re-rated at <strong style={{ color: C.gold }}>8-10× inside the combined platform</strong>. That alone is <strong style={{ color: C.green }}>${(25_000_000 * 8 / 1_000_000).toFixed(0)}M-${(25_000_000 * 10 / 1_000_000).toFixed(0)}M of platform-multiple-arbitrage value</strong> on EBITDA he already owns — before counting the ChiroPillar acquisitions. Plus the {fmtMoney(finalEbitda)} of new acquired EBITDA at 8-10× = ${(finalEbitda * 8 / 1_000_000).toFixed(1)}-${(finalEbitda * 10 / 1_000_000).toFixed(1)}M more. Total exit <strong style={{ color: C.gold }}>{fmtMoney(exitLow)}-{fmtMoney(exitHigh)}</strong>. Bank debt of <strong style={{ color: C.align }}>{fmtMoney(totalBankDebt)}</strong> retired at exit from cash flow, leaving Wagner with <strong style={{ color: C.gold }}>{fmtMoney(exitLow - totalBankDebt)}-{fmtMoney(exitHigh - totalBankDebt)}</strong> net.
        </div>
      </div>

      {/* KB SHARE EXPLAINER */}
      <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 14, padding: '24px 28px', marginBottom: 24 }}>
        <SectionHead eyebrow="KB's compensation · 5% revenue share" title="How KB makes money. Aligned with Wagner." />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }} className="kb-val-grid">
          <div>
            <div style={{ fontFamily: F.mono, fontSize: 10, color: C.faint, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 10 }}>What KB tracks (5% of)</div>
            <KvLine label="Acquired clinic revenue (post-lift)" val={`~${fmtMoney(totalAcqCount * avgAcqRevenue)}/yr`} />
            <KvLine label="Scale Services revenue (Y1)"          val="$1.65M/yr ramping" />
            <KvLine label="Direct-response acquired customers"   val="100% tracked via UTM + QR" />
            <KvLine label="Audit access for Wagner"               val="Real-time dashboard" />
          </div>
          <div>
            <div style={{ fontFamily: F.mono, fontSize: 10, color: C.faint, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 10 }}>What KB earns</div>
            <KvLine label="5yr acquired-clinic share"            val={fmtMoney(kbRevenueShare5yr)} accent={C.gold} />
            <KvLine label="3yr Scale Services share"              val={fmtMoney(kbScaleShare)} />
            <KvLine label="Total KB earned through exit"          val={fmtMoney(totalKbShare)} accent={C.green} />
            <KvLine label="Effective KB yield vs Wagner check"    val={`${(totalKbShare / totalOperating).toFixed(1)}× of operating cap`} accent={C.gold} />
          </div>
        </div>
        <div style={{ marginTop: 18, padding: '14px 18px', background: 'rgba(46,117,182,0.06)', border: '1px solid rgba(46,117,182,0.18)', borderRadius: 10, fontSize: 13, color: C.muted, lineHeight: 1.6 }}>
          <strong style={{ color: C.text }}>Why 5%, why revenue not profit:</strong> KB controls the inputs (ads, marketing, platform, intake). Wagner controls the outputs (clinical install, EBITDA margins). Tying KB&apos;s compensation to revenue means KB is incentivized to drive volume + quality leads — not to cut corners that hurt the eventual EBITDA. KB doesn&apos;t get to make excuses about Wagner&apos;s margins. Wagner doesn&apos;t get to hide profit. Clean.
        </div>
      </div>

      {/* RISKS */}
      <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 14, padding: '24px 28px' }}>
        <SectionHead eyebrow="Risks · honest list" title="What could break this plan." />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 22 }} className="kb-val-grid">
          <Risk title="Bank tightens / rates spike" desc="If Fed pushes prime to 11%+, debt service tightens. Mitigation: Live Oak SBA pricing partly insulated by SBA guarantee. Secondary lenders (BHG, BAML) provide diversification. Worst case: slow acquisition pace to maintain DSCR > 1.4×." />
          <Risk title="Acquisition pace below plan" desc="If we close 14 clinics instead of 25, ChiroPillar EBITDA tops out around $11M instead of $20M+. Combined $36M, exit at 8× = $288M. Still a strong return. The 5% rev share to KB scales proportionally — alignment intact." />
          <Risk title="Wagner becomes public face" desc="If locals figure out Wagner is behind ChiroPillar, applications dry up. Mitigation: ChiroPillar brand stays front-door. Wagner stays clinical advisor. Eric + McGrath are the human faces of outreach." />
          <Risk title="State DSO/MSO compliance" desc="Each state has corporate-practice-of-medicine rules. VA + Wagner's secondary states are friendly. Keep $25K legal retainer for state-by-state structuring. Live Oak + Pinnacle know these structures cold." />
        </div>
      </div>

      <div style={{ marginTop: 32, padding: '18px 22px', background: 'rgba(46,117,182,0.06)', border: '1px solid rgba(46,117,182,0.20)', borderRadius: 10, fontSize: 13, color: C.muted, lineHeight: 1.55 }}>
        <strong style={{ color: C.align }}>Next step:</strong> Wagner reviews this plan. If aligned, we draft a term sheet at {fmtMoney(totalOperating)} operating capital commitment + 5% revenue share. First {fmtMoney(120_000)} released at signing to fund team + marketing build-out + Live Oak/BHG intro calls. Acquisitions draw bank debt as LOIs close.{' '}
        <Link href="/overview" style={{ color: C.align, textDecoration: 'underline' }}>Back to Overview →</Link>
      </div>

      <style>{`
        @media (max-width: 980px) {
          .kb-chain-row { grid-template-columns: 1fr !important; }
          .kb-val-grid  { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}

function Kpi({ label, val, sub, color, big }: { label: string; val: string; sub: string; color: string; big?: boolean }) {
  return (
    <div style={big ? { padding: '8px 0', borderLeft: `3px solid ${color}`, paddingLeft: 14 } : {}}>
      <div style={{ fontFamily: F.mono, fontSize: 10, color: big ? color : C.faint, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 800, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: big ? 30 : 22, fontWeight: 800, color, fontFamily: F.display, lineHeight: 1, marginBottom: 4 }}>{val}</div>
      <div style={{ fontFamily: F.mono, fontSize: 10, color: C.faint, letterSpacing: '0.04em' }}>{sub}</div>
    </div>
  )
}

function SectionHead({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontFamily: F.mono, fontSize: 10, color: C.align, letterSpacing: '0.20em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 6 }}>{eyebrow}</div>
      <h2 style={{ fontFamily: F.display, fontSize: 24, fontWeight: 600, margin: 0, letterSpacing: '-0.01em' }}>{title}</h2>
    </div>
  )
}

function Sub({ label, val, color }: { label: string; val: string; color: string }) {
  return (
    <div>
      <div style={{ fontFamily: F.mono, fontSize: 9, color: C.faint, letterSpacing: '0.10em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 800, color, fontFamily: F.display, lineHeight: 1 }}>{val}</div>
    </div>
  )
}

function Ask({ label, val, sub, color }: { label: string; val: string; sub: string; color?: string }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${color ? color + '55' : C.border}`, borderRadius: 12, padding: '14px 18px' }}>
      <div style={{ fontFamily: F.mono, fontSize: 10, color: C.faint, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 800, color: color || C.text, fontFamily: F.display, lineHeight: 1, marginBottom: 4 }}>{val}</div>
      <div style={{ fontFamily: F.mono, fontSize: 10, color: C.faint, letterSpacing: '0.04em' }}>{sub}</div>
    </div>
  )
}

function Stream({ pct, amount, sub, accent }: { pct: string; amount: string; sub: string; accent: string }) {
  return (
    <div style={{ background: C.bg3, border: `1px solid ${C.border}`, borderRadius: 12, padding: '16px 18px', borderLeft: `3px solid ${accent}` }}>
      <div style={{ fontFamily: F.mono, fontSize: 10, color: accent, letterSpacing: '0.14em', fontWeight: 800 }}>{pct}</div>
      <div style={{ fontFamily: F.display, fontSize: 18, fontWeight: 800, color: accent, lineHeight: 1.1, margin: '4px 0 6px' }}>{amount}</div>
      <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.45 }}>{sub}</div>
    </div>
  )
}

function KvLine({ label, val, accent }: { label: string; val: string; accent?: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '8px 0', borderBottom: `1px solid ${C.border}` }}>
      <span style={{ fontSize: 13, color: C.muted }}>{label}</span>
      <span style={{ fontFamily: F.display, fontSize: 18, fontWeight: 800, color: accent || C.text }}>{val}</span>
    </div>
  )
}

function BurnPill({ label, val, sub, color, bold }: { label: string; val: string; sub: string; color: string; bold?: boolean }) {
  return (
    <div style={{ padding: bold ? '14px 18px' : '12px 16px', background: bold ? `${color}15` : 'rgba(255,255,255,0.04)', border: `${bold ? 2 : 1}px solid ${bold ? color : C.border}`, borderRadius: 10 }}>
      <div style={{ fontFamily: F.mono, fontSize: 10, color: bold ? color : C.faint, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 6 }}>{label}</div>
      <div style={{ fontFamily: F.display, fontSize: bold ? 28 : 24, fontWeight: 800, color, lineHeight: 1, marginBottom: 4 }}>{val}</div>
      <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.45 }}>{sub}</div>
    </div>
  )
}

function FounderLine({ label, val, note, accent }: { label: string; val: string; note: string; accent?: string }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 12, padding: '8px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.025)', border: `1px solid ${C.border}`, alignItems: 'baseline' }}>
      <div>
        <div style={{ fontSize: 13, color: C.text, fontWeight: 600, lineHeight: 1.3 }}>{label}</div>
        <div style={{ fontSize: 11, color: C.muted, marginTop: 2, fontStyle: 'italic' }}>{note}</div>
      </div>
      <div style={{ fontFamily: F.display, fontSize: 16, fontWeight: 800, color: accent || C.text, textAlign: 'right' }}>{val}</div>
    </div>
  )
}

function ScaleRow({ year, clinics, clinicEb, scaleEb, note, totalColor, bold }: { year: string; clinics: string; clinicEb: number; scaleEb: number; note: string; totalColor: string; bold?: boolean }) {
  const total = clinicEb + scaleEb
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '90px 1fr 1fr 1fr 1fr 1.4fr', gap: 12, padding: '14px 18px',
      borderBottom: `1px solid ${C.border}`,
      fontSize: 13, alignItems: 'baseline',
      background: bold ? 'rgba(201,168,76,0.08)' : 'transparent',
    }}>
      <div style={{ color: bold ? C.gold : C.text, fontFamily: F.mono, fontWeight: 800, fontSize: bold ? 14 : 13, letterSpacing: '0.04em' }}>{year}</div>
      <div style={{ textAlign: 'right', color: '#FFFFFF', fontFamily: F.display, fontWeight: 800, fontSize: bold ? 18 : 16 }}>{clinics}</div>
      <div style={{ textAlign: 'right', color: '#C9CCDB', fontFamily: F.mono, fontWeight: 600 }}>{fmtMoney(clinicEb)}</div>
      <div style={{ textAlign: 'right', color: '#C9CCDB', fontFamily: F.mono, fontWeight: 600 }}>{fmtMoney(scaleEb)}</div>
      <div style={{ textAlign: 'right', color: totalColor, fontFamily: F.display, fontWeight: 800, fontSize: bold ? 18 : 16 }}>{fmtMoney(total)}</div>
      <div style={{ color: bold ? C.gold : '#C9CCDB', fontSize: bold ? 13 : 12, fontWeight: bold ? 700 : 500, lineHeight: 1.45 }}>{note}</div>
    </div>
  )
}

function LadderRow({ tier, name, audience, price, y3, accent, width }: { tier: string; name: string; audience: string; price: string; y3: string; accent: string; width: number }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '70px 1fr 140px 100px 130px', gap: 14, padding: '12px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.025)', border: `1px solid ${C.border}`, alignItems: 'center' }}>
      <div style={{ fontFamily: F.mono, fontSize: 10, color: accent, letterSpacing: '0.14em', fontWeight: 800 }}>{tier}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 13, color: C.text, fontWeight: 600, flexShrink: 0 }}>{name}</span>
        <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,0.04)', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{ width: `${width}%`, height: '100%', background: `linear-gradient(90deg, ${accent}, ${accent}88)`, borderRadius: 3 }} />
        </div>
      </div>
      <div style={{ fontSize: 11, color: C.muted, fontFamily: F.mono, letterSpacing: '0.04em' }}>{audience}</div>
      <div style={{ fontSize: 12, color: accent, fontFamily: F.display, fontWeight: 800, textAlign: 'right' }}>{price}</div>
      <div style={{ fontSize: 13, color: C.green, fontFamily: F.display, fontWeight: 700, textAlign: 'right' }}>{y3}</div>
    </div>
  )
}

function ProFormaRow({ line, units, y1, y2, y3, accent, bold, total }: { line: string; units: string; y1: number; y2: number; y3: number; accent: string; bold?: boolean; total?: boolean }) {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '2.2fr 0.7fr 0.9fr 1fr 1fr', gap: 12,
      padding: '11px 18px',
      borderBottom: total ? 'none' : `1px solid ${C.border}`,
      borderTop: total ? `2px solid ${accent}` : 'none',
      background: total ? `${accent}10` : 'transparent',
      alignItems: 'baseline',
      fontSize: 12.5,
    }}>
      <div style={{ color: total ? accent : (bold ? C.text : C.muted), fontWeight: total || bold ? 800 : 500, fontFamily: total ? F.display : F.body, fontSize: total ? 14 : 12.5 }}>{line}</div>
      <div style={{ textAlign: 'right', color: C.faint, fontFamily: F.mono, fontSize: 11 }}>{units}</div>
      <div style={{ textAlign: 'right', color: total ? accent : C.muted, fontFamily: F.mono, fontWeight: total ? 800 : 500 }}>{fmtMoneyShort(y1)}</div>
      <div style={{ textAlign: 'right', color: total ? accent : C.text, fontFamily: F.mono, fontWeight: total ? 800 : 600 }}>{fmtMoneyShort(y2)}</div>
      <div style={{ textAlign: 'right', color: total ? accent : C.gold, fontFamily: total ? F.display : F.mono, fontWeight: 800, fontSize: total ? 16 : 13 }}>{fmtMoneyShort(y3)}</div>
    </div>
  )
}

function fmtMoneyShort(n: number) {
  if (n >= 1_000_000) return '$' + (n / 1_000_000).toFixed(2) + 'M'
  if (n >= 1_000) return '$' + Math.round(n / 1_000) + 'K'
  return '$' + n
}

function Risk({ title, desc }: { title: string; desc: string }) {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
      <span style={{ flexShrink: 0, marginTop: 5, width: 9, height: 9, borderRadius: 999, background: C.coral, boxShadow: `0 0 6px ${C.coral}88` }} />
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 4 }}>{title}</div>
        <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.55 }}>{desc}</div>
      </div>
    </div>
  )
}
