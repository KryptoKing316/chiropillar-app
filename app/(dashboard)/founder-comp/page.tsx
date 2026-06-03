// ChiroPillar · Founder Comp Breakdown (Eric + Scott split)
// ADMIN-ONLY: hidden from public /launch-plan. Eric reviews this internally
// to track his vs McGrath's individual takes. Wagner does NOT see this page.
// Eric and Scott discuss the split separately.

export const dynamic = 'force-dynamic'

const C = {
  bg: '#0B1B3E',
  bg2: '#0F2347',
  bg3: '#152C58',
  text: '#F2EEE7',
  muted: '#9BA8C0',
  faint: '#4A5880',
  border: 'rgba(255,255,255,0.08)',
  gold: '#C9A84C',
  goldLight: '#E8C96A',
  green: '#2ECC8B',
  align: '#2E75B6',
}

const F = {
  display: '"Playfair Display", Georgia, serif',
  body: '"DM Sans", system-ui, sans-serif',
  mono: '"DM Mono", "JetBrains Mono", monospace',
}

const fmtMoney = (n: number) => {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`
  return `$${n.toLocaleString()}`
}

// Same constants as launch-plan/page.tsx — kept in sync manually
// Last sync: 2026-06-03 (33-close accelerated timeline)
const totalAcqValue = 62_700_000  // 33 clinics × $1.9M avg
const totalAcqCount = 33
const avgAcqRevenue = 1_600_000
const kbOneTimeFee = totalAcqValue * 0.04
const kbRevenueShare5yr = totalAcqCount * avgAcqRevenue * 0.05 * 5
const scaleSvcsRevenue3yr = 1_650_000 + 2_800_000 + 4_200_000
const kbScaleShare = scaleSvcsRevenue3yr * 0.05
const finalEbitda = 9_200_000  // Mo 24 ChiroPillar acquired-clinic EBITDA
const exitLow = (25_000_000 + finalEbitda) * 8
const exitHigh = (25_000_000 + finalEbitda) * 10
const exitMid = (exitLow + exitHigh) / 2
const chiroPillarSliceOfExit = (finalEbitda / (25_000_000 + finalEbitda)) * exitMid
const kbExitFee = chiroPillarSliceOfExit * 0.05

// ChiroPillar entity equity ownership · 80/20 Eric/Wagner
const ericChiroPillarPct = 0.80
const wagnerChiroPillarPct = 0.20

function PlatformCostPill({ label }: { label: string }) {
  return (
    <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(46,117,182,0.10)', border: '1px solid rgba(46,117,182,0.25)', fontSize: 12.5, color: '#FFFFFF', fontWeight: 600, lineHeight: 1.4 }}>
      {label}
    </div>
  )
}

function YearScenarioCard({ who, accent, base, acq, exit, total }: { who: string; accent: string; base: string; acq: string; exit: string; total: string }) {
  return (
    <div style={{ background: C.bg3, border: `1px solid ${C.border}`, borderLeft: `4px solid ${accent}`, borderRadius: 12, padding: '18px 20px' }}>
      <div style={{ fontFamily: F.mono, fontSize: 11, color: accent, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 800, marginBottom: 12 }}>{who}</div>
      <div style={{ display: 'grid', gap: 8, marginBottom: 12 }}>
        <div>
          <div style={{ fontFamily: F.mono, fontSize: 10, color: '#9BA8C0', letterSpacing: '0.10em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 2 }}>Base</div>
          <div style={{ fontSize: 13, color: '#FFFFFF', lineHeight: 1.4 }}>{base}</div>
        </div>
        <div>
          <div style={{ fontFamily: F.mono, fontSize: 10, color: '#9BA8C0', letterSpacing: '0.10em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 2 }}>Acquisition fee</div>
          <div style={{ fontSize: 13, color: '#FFFFFF', lineHeight: 1.4 }}>{acq}</div>
        </div>
        <div>
          <div style={{ fontFamily: F.mono, fontSize: 10, color: '#9BA8C0', letterSpacing: '0.10em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 2 }}>Exit fee</div>
          <div style={{ fontSize: 13, color: '#FFFFFF', lineHeight: 1.4 }}>{exit}</div>
        </div>
      </div>
      <div style={{ padding: '10px 14px', background: `${accent}22`, borderRadius: 8, fontFamily: F.display, fontSize: 18, fontWeight: 800, color: accent, textAlign: 'right' }}>
        {total}
      </div>
    </div>
  )
}

function FounderLine({ label, val, note, accent }: { label: string; val: string; note: string; accent?: string }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 12, padding: '10px 14px', borderRadius: 8, background: 'rgba(255,255,255,0.025)', border: `1px solid ${C.border}`, alignItems: 'baseline' }}>
      <div>
        <div style={{ fontSize: 14, color: '#FFFFFF', fontWeight: 600, lineHeight: 1.3 }}>{label}</div>
        <div style={{ fontSize: 12, color: '#FFFFFF', marginTop: 2, fontStyle: 'italic' }}>{note}</div>
      </div>
      <div style={{ fontFamily: F.display, fontSize: 17, fontWeight: 800, color: accent || C.text, textAlign: 'right' }}>{val}</div>
    </div>
  )
}

export default function FounderCompPage() {
  return (
    <div style={{ padding: '32px 32px 80px', maxWidth: 1320, margin: '0 auto', fontFamily: F.body, color: C.text }}>

      {/* HEADER */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontFamily: F.mono, fontSize: 11, color: '#E87373', letterSpacing: '0.22em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 8 }}>
          Internal · Founder Comp Proposal · admin-only
        </div>
        <h1 style={{ fontFamily: F.display, fontSize: 'clamp(30px, 4vw, 42px)', fontWeight: 700, margin: '0 0 8px', letterSpacing: '-0.02em' }}>
          Eric + Scott · how the KB fees split internally.
        </h1>
        <p style={{ fontSize: 15, color: '#9BA8C0', margin: 0, maxWidth: 880, lineHeight: 1.55 }}>
          Wagner does <strong style={{ color: '#E87373' }}>NOT</strong> see this page. The /launch-plan deck only shows ChiroPillar&apos;s total fee structure. Internal split between Eric and Scott is discussed separately — this page is the working proposal Eric uses to track his vs McGrath&apos;s personal takes.
        </p>
      </div>

      {/* THE BREAKDOWN · same content that used to live on /launch-plan */}
      <div style={{
        background: `linear-gradient(135deg, rgba(201,168,76,0.08), ${C.bg3})`,
        border: `1px solid rgba(201,168,76,0.30)`, borderRadius: 14, padding: '24px 28px',
        marginBottom: 32,
      }}>
        <div style={{ fontFamily: F.mono, fontSize: 13, color: C.gold, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 800, marginBottom: 8 }}>
          ★ Founder Comp · Eric + Scott individual takes
        </div>
        <h2 style={{ fontFamily: F.display, fontSize: 24, fontWeight: 700, color: C.text, margin: '0 0 18px', letterSpacing: '-0.01em' }}>
          Base + acquisition fee + exit fee. Aligned with deal flow.
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }} className="kb-founder-grid">
          {/* ERIC */}
          <div style={{ background: C.bg3, border: `1px solid ${C.border}`, borderLeft: `4px solid ${C.gold}`, borderRadius: 12, padding: '22px 24px' }}>
            <div style={{ fontFamily: F.display, fontSize: 20, fontWeight: 700, color: '#FFFFFF', marginBottom: 4 }}>Eric Skeldon · Founder/CEO · ChiroPillar owner</div>
            <div style={{ fontSize: 13, color: C.gold, fontFamily: F.mono, letterSpacing: '0.10em', marginBottom: 16, fontWeight: 700 }}>FULL-TIME · DAY 0</div>
            <div style={{ display: 'grid', gap: 8, marginBottom: 16 }}>
              <FounderLine label="Upfront on signing"               val="$25,000"                                    note="cash at term-sheet execution" accent={C.gold} />
              <FounderLine label="Monthly draw × 24mo"               val={`$12,500/mo · ${fmtMoney(12_500 * 24)}`}    note="paid from Wagner operating check" />
              <FounderLine label="2% acq consulting fee"             val={fmtMoney(totalAcqValue * 0.02)}             note="~$38K per $1.9M close · 33 closes by Mo 24 · half of KB's 4%" accent={C.green} />
              <FounderLine label="2.5% exit fee · ChiroPillar slice" val={fmtMoney(kbExitFee * 0.5)}                  note="paid at eventual platform sale · half of 5%" accent={C.goldLight} />
            </div>
            <div style={{ padding: '12px 16px', background: 'rgba(201,168,76,0.14)', borderRadius: 8, fontSize: 14, color: '#FFFFFF', fontFamily: F.mono, fontWeight: 700, display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: C.gold }}>ERIC DIRECT COMP (24mo + exit)</span>
              <span style={{ fontFamily: F.display, fontSize: 20, color: C.gold }}>{fmtMoney(25_000 + 12_500 * 24 + totalAcqValue * 0.02 + kbExitFee * 0.5)}</span>
            </div>
            <div style={{ marginTop: 8, fontSize: 11.5, color: '#9BA8C0', lineHeight: 1.5, fontStyle: 'italic' }}>
              + ChiroPillar entity equity (80%) appreciates from ongoing 5% rev share — separate line, see Platform Operating Capital below.
            </div>
          </div>

          {/* SCOTT MCGRATH */}
          <div style={{ background: C.bg3, border: `1px solid ${C.border}`, borderLeft: `4px solid ${C.green}`, borderRadius: 12, padding: '22px 24px' }}>
            <div style={{ fontFamily: F.display, fontSize: 20, fontWeight: 700, color: '#FFFFFF', marginBottom: 4 }}>Scott McGrath · BD Partner</div>
            <div style={{ fontSize: 13, color: C.green, fontFamily: F.mono, letterSpacing: '0.10em', marginBottom: 16, fontWeight: 700 }}>FRACTIONAL · DAY 0 · BROUGHT WAGNER</div>
            <div style={{ display: 'grid', gap: 8, marginBottom: 16 }}>
              <FounderLine label="Monthly base × 24mo"               val={`$5,000/mo · ${fmtMoney(5_000 * 24)}`}      note="consultant retainer · paid monthly" accent={C.gold} />
              <FounderLine label="2% acq consulting fee"             val={fmtMoney(totalAcqValue * 0.02)}             note="~$38K per $1.9M close · 33 closes · half of KB's 4%" accent={C.green} />
              <FounderLine label="2.5% exit fee · ChiroPillar slice" val={fmtMoney(kbExitFee * 0.5)}                  note="paid at eventual platform sale · half of 5%" accent={C.goldLight} />
            </div>
            <div style={{ padding: '12px 16px', background: 'rgba(46,204,139,0.14)', borderRadius: 8, fontSize: 14, color: '#FFFFFF', fontFamily: F.mono, fontWeight: 700, display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: C.green }}>SCOTT TOTAL (24mo + exit)</span>
              <span style={{ fontFamily: F.display, fontSize: 20, color: C.green }}>{fmtMoney(5_000 * 24 + totalAcqValue * 0.02 + kbExitFee * 0.5)}</span>
            </div>
          </div>
        </div>
        <div style={{ marginTop: 18, fontSize: 14, color: '#FFFFFF', lineHeight: 1.65, padding: '14px 20px', background: 'rgba(46,117,182,0.06)', border: '1px solid rgba(46,117,182,0.18)', borderRadius: 10 }}>
          <strong style={{ color: '#FFFFFF' }}>How Scott and Eric win:</strong> base salary + 2% acquisition consulting fee (each, half of KB&apos;s 4%) <strong style={{ color: C.green }}>only on platform-sourced clinic closes</strong> + 2.5% exit fee (each, half of KB&apos;s 5%) <strong style={{ color: C.green }}>only on the eventual sale of platform-sourced clinics we helped scale</strong>. Equal split on every transaction-level fee. <strong style={{ color: C.gold }}>The ongoing 5% rev share is platform operating capital</strong> — it funds the dev team, IT, hosting, coders, and infrastructure to run the platform. Surplus accrues to ChiroPillar entity equity (Eric 80% / Wagner 20%).
        </div>
      </div>

      {/* PLATFORM OPERATING CAPITAL · 5% rev share framed correctly */}
      <div style={{
        background: `linear-gradient(135deg, rgba(46,117,182,0.10), ${C.bg3})`,
        border: `2px solid rgba(46,117,182,0.40)`, borderRadius: 14, padding: '24px 28px',
        marginBottom: 24,
      }}>
        <div style={{ fontFamily: F.mono, fontSize: 13, color: C.align, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 800, marginBottom: 8 }}>
          ★ ChiroPillar Platform Operating Capital · 5% Ongoing Rev Share
        </div>
        <h2 style={{ fontFamily: F.display, fontSize: 22, fontWeight: 700, color: C.text, margin: '0 0 14px', letterSpacing: '-0.01em' }}>
          The 5% rev share funds the platform. Equity surplus splits 80/20 Eric/Wagner.
        </h2>
        <p style={{ fontSize: 14, color: '#FFFFFF', lineHeight: 1.65, marginTop: 0, marginBottom: 18 }}>
          The 5% ongoing rev share is <strong style={{ color: C.gold }}>not founder pay</strong> — it&apos;s the platform&apos;s operating budget. Pays dev team, platform engineers, IT, hosting, infrastructure, marketing tools, agency overflow, and everything needed to keep ChiroPillar running at scale. <strong style={{ color: C.text }}>What&apos;s left over after platform costs is ChiroPillar entity value</strong> — equity owned <strong style={{ color: C.gold }}>80% Eric / 20% Wagner</strong>. Wagner&apos;s 20% catches the platform value appreciation alongside Eric.
        </p>
        <div style={{ fontFamily: F.mono, fontSize: 12, color: '#FFFFFF', letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 800, marginBottom: 12 }}>
          What the 5% rev share funds
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10, marginBottom: 18 }}>
          <PlatformCostPill label="Dev team · platform engineers" />
          <PlatformCostPill label="IT · DevOps · security" />
          <PlatformCostPill label="Hosting · Vercel · Supabase · CDN" />
          <PlatformCostPill label="Coders · feature build-out" />
          <PlatformCostPill label="Marketing tools + agency overflow" />
          <PlatformCostPill label="Data + AI infrastructure" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div style={{ background: C.bg3, border: `1px solid ${C.border}`, borderLeft: `4px solid ${C.gold}`, borderRadius: 10, padding: '18px 20px' }}>
            <div style={{ fontFamily: F.mono, fontSize: 11, color: C.gold, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 800, marginBottom: 6 }}>Eric · founder/CEO/operator</div>
            <div style={{ fontFamily: F.display, fontSize: 48, fontWeight: 800, color: C.gold, lineHeight: 1, marginBottom: 8 }}>80%</div>
            <div style={{ fontSize: 12.5, color: '#FFFFFF', lineHeight: 1.5 }}>ChiroPillar entity equity. Operator control + majority of platform value appreciation.</div>
          </div>
          <div style={{ background: C.bg3, border: `1px solid ${C.border}`, borderLeft: `4px solid ${C.align}`, borderRadius: 10, padding: '18px 20px' }}>
            <div style={{ fontFamily: F.mono, fontSize: 11, color: C.align, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 800, marginBottom: 6 }}>Wagner · funder/clinical partner</div>
            <div style={{ fontFamily: F.display, fontSize: 48, fontWeight: 800, color: C.align, lineHeight: 1, marginBottom: 8 }}>20%</div>
            <div style={{ fontSize: 12.5, color: '#FFFFFF', lineHeight: 1.5 }}>Equity in platform he funded. Catches 20% of platform value appreciation. <strong>Separate from his 100% clinic equity.</strong></div>
          </div>
        </div>
        <div style={{ fontSize: 13, color: '#FFFFFF', lineHeight: 1.65, padding: '12px 18px', background: 'rgba(46,117,182,0.08)', border: '1px solid rgba(46,117,182,0.20)', borderRadius: 10 }}>
          <strong style={{ color: '#FFFFFF' }}>Why this works for Wagner:</strong> He funds the $1.71M Y1 build + $31M+ acquisition cash + personally backstops $31M+ bank debt. In exchange he gets <strong style={{ color: C.gold }}>100% of every clinic + all multiple arbitrage at exit + 20% of ChiroPillar entity</strong>. <strong style={{ color: C.green }}>Why this works for Eric:</strong> 80% operator control + majority economics of the platform he&apos;s building. Standard founder/CEO equity. Frames the 5% rev share as platform fuel, not personal income.
        </div>
      </div>

      {/* 3-YEAR + 5-YEAR PROJECTIONS · what Eric and Scott actually take */}
      <div style={{
        background: `linear-gradient(135deg, rgba(46,204,139,0.08), ${C.bg3})`,
        border: `1px solid rgba(46,204,139,0.30)`, borderRadius: 14, padding: '24px 28px',
        marginBottom: 24,
      }}>
        <div style={{ fontFamily: F.mono, fontSize: 13, color: C.green, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 800, marginBottom: 8 }}>
          ★ Eric + Scott · 3-yr conservative + 5-yr scenarios
        </div>
        <h2 style={{ fontFamily: F.display, fontSize: 22, fontWeight: 700, color: C.text, margin: '0 0 18px', letterSpacing: '-0.01em' }}>
          Direct compensation projected at Y3 + Y5.
        </h2>

        {/* Y3 CONSERVATIVE */}
        <div style={{ fontFamily: F.mono, fontSize: 12, color: '#FFFFFF', letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 800, marginBottom: 12 }}>
          Y3 CONSERVATIVE · 50 cumulative clinics · no exit yet
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 22 }}>
          <YearScenarioCard
            who="ERIC · Y3 direct comp"
            accent={C.gold}
            base="$525K base (36mo × $12.5K + $25K upfront + $50K Y3)"
            acq="$1.9M (2% × $95M EV from 50 clinics)"
            exit="(no exit yet)"
            total="~$2.5M"
          />
          <YearScenarioCard
            who="SCOTT · Y3 direct comp"
            accent={C.green}
            base="$180K base (36mo × $5K)"
            acq="$1.9M (2% × $95M EV from 50 clinics)"
            exit="(no exit yet)"
            total="~$2.1M"
          />
        </div>

        {/* Y5 WITH EXIT */}
        <div style={{ fontFamily: F.mono, fontSize: 12, color: '#FFFFFF', letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 800, marginBottom: 12 }}>
          Y5 WITH EXIT · 100 cumulative clinics · platform exit at 8-10×
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
          <YearScenarioCard
            who="ERIC · Y5 direct comp"
            accent={C.gold}
            base="$900K base (60mo × $12.5K + $25K + Y3-Y5 retention)"
            acq="$3.8M (2% × $190M EV from 100 clinics)"
            exit="~$8M (2.5% × ChiroPillar slice at 9×)"
            total="~$12.7M direct comp + ChiroPillar equity 80%"
          />
          <YearScenarioCard
            who="SCOTT · Y5 direct comp"
            accent={C.green}
            base="$300K base (60mo × $5K)"
            acq="$3.8M (2% × $190M EV from 100 clinics)"
            exit="~$8M (2.5% × ChiroPillar slice at 9×)"
            total="~$12.1M direct comp"
          />
        </div>
        <div style={{ fontSize: 13, color: '#FFFFFF', lineHeight: 1.65, padding: '12px 18px', background: 'rgba(46,204,139,0.08)', border: '1px solid rgba(46,204,139,0.18)', borderRadius: 10 }}>
          <strong style={{ color: '#FFFFFF' }}>Note on the gap:</strong> Y5 direct comp is roughly equal between Eric and Scott (~$12M each) because base + 2% acq + 2.5% exit are symmetric. The actual difference is the <strong style={{ color: C.gold }}>80% ChiroPillar entity equity</strong> Eric retains — at Y5 with $40-60M/yr in platform revenue, ChiroPillar entity could be worth $200-400M+ standalone, of which Eric&apos;s 80% = $160-320M+ in equity value. That&apos;s where Eric&apos;s operator upside lives. Scott&apos;s comp is clean fee-based · no platform equity exposure (clean exit, easy to walk away).
        </div>
      </div>

      <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 12, padding: '20px 24px', marginBottom: 18 }}>
        <div style={{ fontFamily: F.mono, fontSize: 11, color: '#E87373', letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 800, marginBottom: 8 }}>
          ⚠️ Internal note
        </div>
        <p style={{ fontSize: 14, color: '#FFFFFF', lineHeight: 1.6, margin: 0 }}>
          This split (2/2 on the 4% acq + 2.5/2.5 on the 5% exit) is the current working proposal. Eric and Scott to discuss + lock in writing before Wagner signs the term sheet. Wagner sees only the ChiroPillar-level fee structure on /launch-plan — never this internal allocation.
        </p>
      </div>

    </div>
  )
}
