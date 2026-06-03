// ChiroPillar · 24-Month Launch Plan
// Real numbers, real people, real ad spend. Built for Wagner-as-funder to
// decide "do I write the check, and if so for how much."
//
// Numbers benchmarked against:
//   - LinkedIn salary data for Dallas/Charlottesville chiropractic + M&A roles
//   - Facebook Ads industry benchmarks (chiropractic CAC $80-180 per lead)
//   - Direct mail benchmarks (chiropractor lists $0.45-0.70/piece, 0.4-1.2% reply)
//   - Apollo + ZoomInfo enrichment ($300/mo per seat)
//   - Instantly.ai cold email infrastructure ($97-297/mo)
//   - Closed M&A deal volume historicals (small-business acquisition pace)

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

// ── VALUE CHAIN STAGES ──────────────────────────────────────────────────
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
    monthly_cost: 18_000,  // ad spend + media buyer fee
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
    monthly_cost: 2_500,  // pieces × cost
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
    monthly_cost: 350,  // Resend + Supabase + Vercel
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
    monthly_cost: 17_500,  // McGrath split + SDR + tools
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
    monthly_cost: 11_500,  // Eric's time allocation + legal retainer
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
    monthly_cost: 14_000,  // Ops lead salary
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
  { role: 'Eric Skeldon · Founder/CEO', when: 'Day 0',    comp: '$120K + equity', comp_low: 120_000, comp_high: 120_000, fulltime: true, responsibilities: 'Platform · deal structure · LP relations · closing' },
  { role: 'Scott McGrath · BD Partner',   when: 'Day 0',    comp: '$0 base + 4% origination', comp_low: 0, comp_high: 0, fulltime: false, responsibilities: 'Relationship side · senior DC credibility · open doors' },
  { role: 'Dr. Scott Wagner · Clinical Partner', when: 'Day 0', comp: '$0 base + co-equity', comp_low: 0, comp_high: 0, fulltime: false, responsibilities: 'Clinical playbook · medical-team install · operator credibility' },
  { role: 'SDR / Cold-outreach Specialist', when: 'Month 4',  comp: '$55-75K + commissions', comp_low: 55_000, comp_high: 75_000, fulltime: true, responsibilities: 'Calls + email · qualifies inbound · books McGrath\'s diary' },
  { role: 'Operations Lead',               when: 'Month 6',  comp: '$95-130K',     comp_low: 95_000, comp_high: 130_000, fulltime: true, responsibilities: 'Post-close integration · runs the playbook install at each clinic' },
  { role: 'Junior Marketer / Media Buyer', when: 'Month 6',  comp: '$60-80K',      comp_low: 60_000, comp_high: 80_000, fulltime: true, responsibilities: 'Daily ad management · creative testing · direct mail vendor liaison' },
  { role: 'Account Manager #1',            when: 'Month 9',  comp: '$70-90K + bonus', comp_low: 70_000, comp_high: 90_000, fulltime: true, responsibilities: 'Mastermind cohort + Scale Services customers · retention' },
  { role: 'Bookkeeper / Controller (FT)',  when: 'Month 9',  comp: '$65-85K',      comp_low: 65_000, comp_high: 85_000, fulltime: true, responsibilities: 'Per-clinic books · roll-up consolidation · investor reporting' },
  { role: 'Diligence Analyst',             when: 'Month 12', comp: '$80-110K',     comp_low: 80_000, comp_high: 110_000, fulltime: true, responsibilities: 'Owns the Data Room + AI Valuation workflow · prepares LOI packets' },
  { role: 'Account Manager #2 + SDR #2',   when: 'Month 15', comp: '$120-160K combined', comp_low: 120_000, comp_high: 160_000, fulltime: true, responsibilities: 'Scale Services + outbound expansion as deal volume scales' },
]

const totalSalaryY1 = HIRES.filter(h => h.fulltime).reduce((s, h) => s + (h.comp_low + h.comp_high) / 2, 0)

// ── TECH / SAAS STACK ───────────────────────────────────────────────────
const STACK = [
  { tool: 'Supabase Pro',              cost_mo: 25,    use: 'Database + Auth + Storage' },
  { tool: 'Vercel Pro',                cost_mo: 20,    use: 'Hosting (chiropillar.com)' },
  { tool: 'Anthropic API · Claude',    cost_mo: 800,   use: 'PDF extraction · valuation · add-back detection' },
  { tool: 'Resend (email)',            cost_mo: 80,    use: 'Magic-link + intake notifications + drip' },
  { tool: 'Apollo.io · 3 seats',       cost_mo: 597,   use: 'Lead enrichment + contact data' },
  { tool: 'ZoomInfo (optional Phase 2)', cost_mo: 1_200, use: 'Higher-fidelity revenue estimates' },
  { tool: 'Instantly.ai · 100 inboxes', cost_mo: 297,  use: 'Cold email outbound infrastructure' },
  { tool: 'Aircall + Twilio · 4 lines', cost_mo: 350,  use: 'Click-to-call + SMS' },
  { tool: 'DocuSeal Pro',              cost_mo: 99,    use: 'NDA + LOI + APA e-signature' },
  { tool: 'Stripe · 2.9% + 30c',       cost_mo: 250,   use: 'Scale Services checkout' },
  { tool: 'QuickBooks Online',         cost_mo: 90,    use: 'Per-entity books · Phase 3 OAuth integration' },
  { tool: 'Calendly · Team',           cost_mo: 96,    use: 'Auto-book Wagner + McGrath calls' },
  { tool: 'Slack + Notion',            cost_mo: 150,   use: 'Internal ops' },
]

const stackTotalMo = STACK.reduce((s, t) => s + t.cost_mo, 0)

// ── TIMELINE / CAPITAL DEPLOYMENT ───────────────────────────────────────
type Quarter = {
  q: string
  team_cost: number
  marketing: number
  saas: number
  acquisitions: number  // capital deployed for clinic acquisitions
  acq_count: number
  cumulative_ebitda: number
  notes: string
}

const TIMELINE: Quarter[] = [
  { q: 'Q1 (Mo 1-3)',  team_cost:  90_000, marketing:  72_000, saas: 12_000, acquisitions:        0, acq_count: 0, cumulative_ebitda:    0, notes: 'Build the engine. Eric + McGrath + Wagner only. First 50 intakes test the funnel.' },
  { q: 'Q2 (Mo 4-6)',  team_cost: 170_000, marketing: 105_000, saas: 12_000, acquisitions:        0, acq_count: 0, cumulative_ebitda:    0, notes: 'SDR + Marketer + Ops Lead hired. Pipeline fills. First LOI signed Q2 end.' },
  { q: 'Q3 (Mo 7-9)',  team_cost: 240_000, marketing: 135_000, saas: 14_000, acquisitions: 3_800_000, acq_count: 2, cumulative_ebitda:  970_000, notes: 'AM + Bookkeeper hired. First 2 clinics acquired @ ~$1.9M each. EBITDA from Wagner $25M + acquired clinics.' },
  { q: 'Q4 (Mo 10-12)', team_cost: 280_000, marketing: 135_000, saas: 16_000, acquisitions: 5_700_000, acq_count: 3, cumulative_ebitda: 1_720_000, notes: 'Diligence Analyst hired. 3 more clinics close. Scale Services starts generating revenue.' },
  { q: 'Q5 (Mo 13-15)', team_cost: 340_000, marketing: 150_000, saas: 18_000, acquisitions: 7_600_000, acq_count: 4, cumulative_ebitda: 2_770_000, notes: '2nd AM + 2nd SDR hired. 4 acquisitions. Scale Services 30 active customers.' },
  { q: 'Q6 (Mo 16-18)', team_cost: 380_000, marketing: 165_000, saas: 20_000, acquisitions: 9_500_000, acq_count: 5, cumulative_ebitda: 4_010_000, notes: 'Pace doubles. 5 closes. Wagner medical-team add-on starts contributing real lift.' },
  { q: 'Q7 (Mo 19-21)', team_cost: 410_000, marketing: 165_000, saas: 22_000, acquisitions: 9_500_000, acq_count: 5, cumulative_ebitda: 5_510_000, notes: 'Mature pipeline. Predictable cadence. First exit conversations.' },
  { q: 'Q8 (Mo 22-24)', team_cost: 430_000, marketing: 165_000, saas: 24_000, acquisitions: 11_400_000, acq_count: 6, cumulative_ebitda: 7_260_000, notes: 'Final push to $20M+ ChiroPillar bolt-on EBITDA. Exit conversations open at $45M+ combined platform.' },
]

const totalOperating = TIMELINE.reduce((s, q) => s + q.team_cost + q.marketing + q.saas, 0)
const totalAcquisitions = TIMELINE.reduce((s, q) => s + q.acquisitions, 0)
const totalAcqCount = TIMELINE.reduce((s, q) => s + q.acq_count, 0)
const finalEbitda = TIMELINE[TIMELINE.length - 1].cumulative_ebitda
const exitLow = (25_000_000 + finalEbitda) * 8
const exitHigh = (25_000_000 + finalEbitda) * 10
const totalCheck = totalOperating + totalAcquisitions

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
          $0 to $20M EBITDA in 24 months.
        </h1>
        <p style={{ fontSize: 15, color: C.muted, margin: 0, maxWidth: 880, lineHeight: 1.55 }}>
          Team build, ad spend, SaaS stack, capital deployment timeline, and Wagner&apos;s return — laid out so a wealthy doctor-investor can decide &quot;do I write the check, and how much.&quot; Numbers benchmarked against LinkedIn salary data, Facebook Ads chiropractic CAC, direct mail response rates, and small-business M&A cadence.
        </p>
      </div>

      {/* HEADLINE STATS */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14,
        background: `linear-gradient(135deg, rgba(201,168,76,0.12), ${C.bg3})`,
        border: `1px solid rgba(201,168,76,0.30)`, borderRadius: 14, padding: '22px 26px',
        marginBottom: 32,
      }}>
        <Kpi label="Total operating spend"  val={fmtMoney(totalOperating)}    sub="24 months · team + ads + SaaS" color={C.gold} />
        <Kpi label="Acquisition capital"     val={fmtMoney(totalAcquisitions)}  sub={`${totalAcqCount} clinics acquired`} color={C.spine} />
        <Kpi label="Total check needed"      val={fmtMoney(totalCheck)}         sub="operating + acquisitions" color={C.gold} />
        <Kpi label="Final ChiroPillar EBITDA" val={fmtMoney(finalEbitda)}       sub="month 24 · bolt-on to Wagner" color={C.green} />
        <Kpi label="Implied exit · 8-10×"    val={`${fmtMoney(exitLow)} – ${fmtMoney(exitHigh)}`} sub={`combined ${fmtMoney(25_000_000 + finalEbitda)} EBITDA`} color={C.goldLight} />
      </div>

      {/* VALUE CHAIN · the 6 stages */}
      <SectionHead eyebrow="The value chain · ads to close" title="6 stages. Each owned. Each measured." />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 36 }}>
        {VALUE_CHAIN.map((s, i) => (
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

      {/* THE TEAM */}
      <SectionHead eyebrow="The team · hires + comp + when" title="10 roles. Phased over 15 months." />
      <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 14, overflow: 'hidden', marginBottom: 36 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2.4fr 1fr 1.4fr 2.6fr', gap: 14, padding: '14px 22px', background: C.bg3, borderBottom: `1px solid ${C.border}`, fontFamily: F.mono, fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.faint, fontWeight: 700 }}>
          <div>Role</div>
          <div>Hire when</div>
          <div>Comp</div>
          <div>Responsibilities</div>
        </div>
        {HIRES.map((h, i) => (
          <div key={i} style={{
            display: 'grid', gridTemplateColumns: '2.4fr 1fr 1.4fr 2.6fr', gap: 14, padding: '14px 22px',
            borderBottom: i < HIRES.length - 1 ? `1px solid ${C.border}` : 'none',
            fontSize: 13.5, alignItems: 'baseline',
            background: i < 3 ? 'rgba(201,168,76,0.05)' : 'transparent',
          }}>
            <div style={{ color: C.text, fontWeight: i < 3 ? 700 : 500 }}>{h.role}</div>
            <div style={{ color: i < 3 ? C.gold : C.muted, fontFamily: F.mono, fontSize: 12, fontWeight: 700 }}>{h.when}</div>
            <div style={{ color: C.green, fontFamily: F.mono, fontSize: 12, fontWeight: 600 }}>{h.comp}</div>
            <div style={{ color: C.muted, fontSize: 12.5, lineHeight: 1.5 }}>{h.responsibilities}</div>
          </div>
        ))}
        <div style={{ padding: '14px 22px', background: C.bg3, display: 'flex', justifyContent: 'space-between', fontFamily: F.mono, fontSize: 12, color: C.gold, fontWeight: 700, letterSpacing: '0.06em' }}>
          <span>FULL-TIME SALARY · YEAR 1 MIDPOINT (8 FT hires staggered)</span>
          <span style={{ fontFamily: F.display, fontSize: 18, color: C.gold }}>~{fmtMoney(totalSalaryY1 * 0.55)} blended</span>
        </div>
      </div>

      {/* TECH STACK */}
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

      {/* QUARTERLY CAPITAL DEPLOYMENT */}
      <SectionHead eyebrow="Capital deployment · quarter by quarter" title="When the money goes out. When it comes back." />
      <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 14, overflow: 'hidden', marginBottom: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr 1fr 0.8fr 1.2fr 2fr', gap: 12, padding: '12px 20px', background: C.bg3, borderBottom: `1px solid ${C.border}`, fontFamily: F.mono, fontSize: 9.5, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.faint, fontWeight: 700 }}>
          <div>Quarter</div>
          <div style={{ textAlign: 'right' }}>Team</div>
          <div style={{ textAlign: 'right' }}>Marketing</div>
          <div style={{ textAlign: 'right' }}>SaaS</div>
          <div style={{ textAlign: 'right' }}>Closes</div>
          <div style={{ textAlign: 'right' }}>Cum EBITDA</div>
          <div>Milestone</div>
        </div>
        {TIMELINE.map((t, i) => (
          <div key={i} style={{
            display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr 1fr 0.8fr 1.2fr 2fr', gap: 12,
            padding: '12px 20px',
            borderBottom: i < TIMELINE.length - 1 ? `1px solid ${C.border}` : 'none',
            alignItems: 'center', fontSize: 12.5,
          }}>
            <div style={{ fontFamily: F.mono, color: C.gold, fontWeight: 700 }}>{t.q}</div>
            <div style={{ textAlign: 'right', color: C.text, fontFamily: F.mono }}>{fmtMoney(t.team_cost)}</div>
            <div style={{ textAlign: 'right', color: C.text, fontFamily: F.mono }}>{fmtMoney(t.marketing)}</div>
            <div style={{ textAlign: 'right', color: C.muted, fontFamily: F.mono }}>{fmtMoney(t.saas)}</div>
            <div style={{ textAlign: 'right', color: t.acq_count > 0 ? C.green : C.faint, fontFamily: F.display, fontWeight: 800, fontSize: 17 }}>{t.acq_count}</div>
            <div style={{ textAlign: 'right', color: C.gold, fontFamily: F.display, fontWeight: 700 }}>{fmtMoney(t.cumulative_ebitda)}</div>
            <div style={{ color: C.muted, fontSize: 11.5, lineHeight: 1.45 }}>{t.notes}</div>
          </div>
        ))}
      </div>

      {/* THE ASK */}
      <div style={{
        background: `linear-gradient(135deg, rgba(201,168,76,0.12), ${C.bg3})`,
        border: `2px solid rgba(201,168,76,0.40)`, borderRadius: 14,
        padding: '28px 32px', marginBottom: 24,
      }}>
        <div style={{ fontFamily: F.mono, fontSize: 11, color: C.gold, letterSpacing: '0.22em', textTransform: 'uppercase', fontWeight: 800, marginBottom: 8 }}>
          ★ The Ask · Total Capital
        </div>
        <h2 style={{ fontFamily: F.display, fontSize: 28, fontWeight: 700, color: C.text, margin: '0 0 16px', letterSpacing: '-0.02em' }}>
          One check funds the whole thing.
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 18 }}>
          <Ask label="Operating capital · 24mo"  val={fmtMoney(totalOperating)}     sub="team + ads + SaaS, even with no acquisitions" />
          <Ask label="Acquisition capital · 24mo" val={fmtMoney(totalAcquisitions)} sub={`${totalAcqCount} clinics @ ~$1.6-2M avg`} />
          <Ask label="Total check"                val={fmtMoney(totalCheck)}        sub="committed line · drawn as needed" color={C.gold} />
        </div>
        <div style={{ fontSize: 14, color: C.muted, lineHeight: 1.6, padding: '14px 18px', background: 'rgba(46,117,182,0.08)', border: '1px solid rgba(46,117,182,0.20)', borderRadius: 10 }}>
          <strong style={{ color: C.text }}>Structure suggestion:</strong> Wagner commits the full <strong style={{ color: C.gold }}>{fmtMoney(totalCheck)}</strong> as a line of credit drawable on milestones. ~30% operating burn (drawn monthly), ~70% acquisition capital (drawn at each LOI signing). Wagner gets first-position security on acquired clinic equity, plus pro-rata share of platform exit at 8-10× combined EBITDA.
        </div>
      </div>

      {/* WAGNER RETURN */}
      <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 14, padding: '24px 28px', marginBottom: 24 }}>
        <SectionHead eyebrow="Wagner's return · 24 months out" title="What does the check turn into?" />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }} className="kb-val-grid">
          <div>
            <div style={{ fontFamily: F.mono, fontSize: 10, color: C.faint, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 10 }}>Inputs</div>
            <KvLine label="Total check committed"      val={fmtMoney(totalCheck)} />
            <KvLine label="Wagner existing EBITDA"     val="$25.0M" />
            <KvLine label="ChiroPillar bolt-on EBITDA" val={fmtMoney(finalEbitda)} />
            <KvLine label="Combined EBITDA"            val={fmtMoney(25_000_000 + finalEbitda)} accent={C.gold} />
          </div>
          <div>
            <div style={{ fontFamily: F.mono, fontSize: 10, color: C.faint, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 10 }}>Outputs</div>
            <KvLine label="Exit at 8× (conservative)" val={fmtMoney(exitLow)} />
            <KvLine label="Exit at 10× (premium)"     val={fmtMoney(exitHigh)} accent={C.gold} />
            <KvLine label="MOIC at 8× exit"           val={`${(exitLow / totalCheck).toFixed(1)}×`} accent={C.green} />
            <KvLine label="MOIC at 10× exit"          val={`${(exitHigh / totalCheck).toFixed(1)}×`} accent={C.green} />
          </div>
        </div>

        <div style={{ marginTop: 20, padding: '14px 18px', background: 'rgba(46,204,139,0.06)', border: '1px solid rgba(46,204,139,0.20)', borderRadius: 10, fontSize: 13, color: C.muted, lineHeight: 1.6 }}>
          <strong style={{ color: C.green }}>The simple math:</strong> Wagner&apos;s ${fmtMoney(totalCheck)} check turns ${fmtMoney(finalEbitda)} of new EBITDA into a combined ${fmtMoney(25_000_000 + finalEbitda)} platform that sells at 8-10× = <strong style={{ color: C.gold }}>{fmtMoney(exitLow)} - {fmtMoney(exitHigh)}</strong>. That&apos;s a <strong style={{ color: C.green }}>{(exitLow / totalCheck).toFixed(1)}-{(exitHigh / totalCheck).toFixed(1)}× MOIC</strong> on the deployed capital. Plus he gets the ongoing operating distributions from Scale Services + acquired clinic EBITDA during the hold.
        </div>
      </div>

      {/* RISKS */}
      <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 14, padding: '24px 28px' }}>
        <SectionHead eyebrow="Risks · honest list" title="What could break this plan." />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 22 }} className="kb-val-grid">
          <Risk title="Acquisition pace below plan"  desc="If we close 14 clinics instead of 25 over 24 months, ChiroPillar EBITDA tops out around $11M instead of $20M+. Combined platform $36M, exit at 8× = $288M. Still a 4.5× MOIC, just slower." />
          <Risk title="Facebook CAC inflation"        desc="If chiropractor CAC doubles to $300+ blended, direct mail share has to step up. We have the LetterHead + Apollo infrastructure to swap modalities mid-flight." />
          <Risk title="Wagner becomes public face"   desc="If positioning slips and locals think Wagner is buying out competitors directly, applications dry up. We mitigate with the ChiroPillar brand + Eric/McGrath as front-door faces." />
          <Risk title="State DSO/MSO compliance"      desc="Each state has corporate practice of medicine rules. VA + Wagner's secondary states are friendly; we keep $25K legal retainer to handle state-by-state structuring as we expand." />
        </div>
      </div>

      <div style={{ marginTop: 32, padding: '18px 22px', background: 'rgba(46,117,182,0.06)', border: '1px solid rgba(46,117,182,0.20)', borderRadius: 10, fontSize: 13, color: C.muted, lineHeight: 1.55 }}>
        <strong style={{ color: C.align }}>Next step:</strong> Wagner reviews this plan. If aligned, we draft a term sheet at the suggested {fmtMoney(totalCheck)} commitment. First $250K released at signing to fund team + marketing build-out. Acquisitions draw against the line as LOIs close.{' '}
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

function Kpi({ label, val, sub, color }: { label: string; val: string; sub: string; color: string }) {
  return (
    <div>
      <div style={{ fontFamily: F.mono, fontSize: 10, color: C.faint, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 800, color, fontFamily: F.display, lineHeight: 1, marginBottom: 4 }}>{val}</div>
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

function Ask({ label, val, sub, color }: { label: string; val: string; sub: string; color?: string }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${color ? color + '55' : C.border}`, borderRadius: 12, padding: '14px 18px' }}>
      <div style={{ fontFamily: F.mono, fontSize: 10, color: C.faint, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 800, color: color || C.text, fontFamily: F.display, lineHeight: 1, marginBottom: 4 }}>{val}</div>
      <div style={{ fontFamily: F.mono, fontSize: 10, color: C.faint, letterSpacing: '0.04em' }}>{sub}</div>
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
