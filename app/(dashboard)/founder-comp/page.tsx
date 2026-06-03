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
const totalAcqValue = 47_500_000
const totalAcqCount = 25
const avgAcqRevenue = 1_600_000
const kbOneTimeFee = totalAcqValue * 0.04
const kbRevenueShare5yr = totalAcqCount * avgAcqRevenue * 0.05 * 5
const scaleSvcsRevenue3yr = 1_650_000 + 2_800_000 + 4_200_000
const kbScaleShare = scaleSvcsRevenue3yr * 0.05
const finalEbitda = 7_260_000
const exitLow = (25_000_000 + finalEbitda) * 8
const exitHigh = (25_000_000 + finalEbitda) * 10
const exitMid = (exitLow + exitHigh) / 2
const chiroPillarSliceOfExit = (finalEbitda / (25_000_000 + finalEbitda)) * exitMid
const kbExitFee = chiroPillarSliceOfExit * 0.05

function FounderLine({ label, val, note, accent }: { label: string; val: string; note: string; accent?: string }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 12, padding: '10px 14px', borderRadius: 8, background: 'rgba(255,255,255,0.025)', border: `1px solid ${C.border}`, alignItems: 'baseline' }}>
      <div>
        <div style={{ fontSize: 14, color: '#FFFFFF', fontWeight: 600, lineHeight: 1.3 }}>{label}</div>
        <div style={{ fontSize: 12, color: '#C9CCDB', marginTop: 2, fontStyle: 'italic' }}>{note}</div>
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
              <FounderLine label="2% acq consulting fee"             val={fmtMoney(totalAcqValue * 0.02)}             note="~$38K per $1.9M close · 25 closes · half of KB's 4%" accent={C.green} />
              <FounderLine label="2.5% exit fee · ChiroPillar slice" val={fmtMoney(kbExitFee * 0.5)}                  note="paid at eventual platform sale · half of 5%" accent={C.goldLight} />
              <FounderLine label="5% ongoing rev share → ChiroPillar" val={fmtMoney(kbRevenueShare5yr + kbScaleShare)} note="flows to ChiroPillar entity (Eric owns)" accent={C.gold} />
            </div>
            <div style={{ padding: '12px 16px', background: 'rgba(201,168,76,0.14)', borderRadius: 8, fontSize: 14, color: '#FFFFFF', fontFamily: F.mono, fontWeight: 700, display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: C.gold }}>ERIC TOTAL (24mo + hold + exit)</span>
              <span style={{ fontFamily: F.display, fontSize: 20, color: C.gold }}>{fmtMoney(25_000 + 12_500 * 24 + totalAcqValue * 0.02 + kbExitFee * 0.5 + kbRevenueShare5yr + kbScaleShare)}</span>
            </div>
          </div>

          {/* SCOTT MCGRATH */}
          <div style={{ background: C.bg3, border: `1px solid ${C.border}`, borderLeft: `4px solid ${C.green}`, borderRadius: 12, padding: '22px 24px' }}>
            <div style={{ fontFamily: F.display, fontSize: 20, fontWeight: 700, color: '#FFFFFF', marginBottom: 4 }}>Scott McGrath · BD Partner</div>
            <div style={{ fontSize: 13, color: C.green, fontFamily: F.mono, letterSpacing: '0.10em', marginBottom: 16, fontWeight: 700 }}>FRACTIONAL · DAY 0 · BROUGHT WAGNER</div>
            <div style={{ display: 'grid', gap: 8, marginBottom: 16 }}>
              <FounderLine label="Monthly base × 24mo"               val={`$5,000/mo · ${fmtMoney(5_000 * 24)}`}      note="consultant retainer · paid monthly" accent={C.gold} />
              <FounderLine label="2% acq consulting fee"             val={fmtMoney(totalAcqValue * 0.02)}             note="~$38K per $1.9M close · 25 closes · half of KB's 4%" accent={C.green} />
              <FounderLine label="2.5% exit fee · ChiroPillar slice" val={fmtMoney(kbExitFee * 0.5)}                  note="paid at eventual platform sale · half of 5%" accent={C.goldLight} />
              <FounderLine label="No ongoing rev share"               val="—"                                          note="ongoing 5% flows to ChiroPillar entity" />
              <FounderLine label="No equity"                           val="—"                                          note="all comp is fee-based · clean" />
            </div>
            <div style={{ padding: '12px 16px', background: 'rgba(46,204,139,0.14)', borderRadius: 8, fontSize: 14, color: '#FFFFFF', fontFamily: F.mono, fontWeight: 700, display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: C.green }}>SCOTT TOTAL (24mo + exit)</span>
              <span style={{ fontFamily: F.display, fontSize: 20, color: C.green }}>{fmtMoney(5_000 * 24 + totalAcqValue * 0.02 + kbExitFee * 0.5)}</span>
            </div>
          </div>
        </div>
        <div style={{ marginTop: 18, fontSize: 14, color: '#C9CCDB', lineHeight: 1.65, padding: '14px 20px', background: 'rgba(46,117,182,0.06)', border: '1px solid rgba(46,117,182,0.18)', borderRadius: 10 }}>
          <strong style={{ color: '#FFFFFF' }}>How Scott and Eric win:</strong> base salary + 2% acquisition consulting fee (each, half of KB&apos;s 4%) <strong style={{ color: C.green }}>only on platform-sourced clinic closes</strong> + 2.5% exit fee (each, half of KB&apos;s 5%) <strong style={{ color: C.green }}>only on the eventual sale of platform-sourced clinics we helped scale</strong>. Equal split on transaction-level fees. The ongoing 5% revenue share is a ChiroPillar entity fee on revenue from platform-sourced clinics + Scale Services — Eric owns ChiroPillar, so it accrues to him as owner equity value, not a personal line item.
        </div>
      </div>

      <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 12, padding: '20px 24px', marginBottom: 18 }}>
        <div style={{ fontFamily: F.mono, fontSize: 11, color: '#E87373', letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 800, marginBottom: 8 }}>
          ⚠️ Internal note
        </div>
        <p style={{ fontSize: 14, color: '#C9CCDB', lineHeight: 1.6, margin: 0 }}>
          This split (2/2 on the 4% acq + 2.5/2.5 on the 5% exit) is the current working proposal. Eric and Scott to discuss + lock in writing before Wagner signs the term sheet. Wagner sees only the ChiroPillar-level fee structure on /launch-plan — never this internal allocation.
        </p>
      </div>

    </div>
  )
}
