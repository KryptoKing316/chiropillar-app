// ProMed VA · Launch Plan
// Lean, Charlottesville-first two-city Virginia test, managed by Kingdom Broker LLC.
// Replaces the old 24-month / 33-clinic roll-up financial model with the actual
// test budget we're proposing to Dr. Wagner + example performance bonuses.

import Link from 'next/link'

export const dynamic = 'force-dynamic'

const C = {
  bg: 'var(--kb-bg)', bg2: 'var(--kb-bg-panel)', bg3: 'var(--kb-bg-surface)',
  text: 'var(--kb-text)', muted: 'var(--kb-text-secondary)', faint: 'var(--kb-text-muted)',
  border: 'var(--kb-border)',
  spine: '#1F4E79', align: '#2E75B6', globe: '#9CC4E4',
  gold: '#C9A84C', goldLight: '#E8C96A', green: '#2ECC8B', coral: '#F2B0A0',
}
const F = {
  display: "'Playfair Display', Georgia, serif",
  body: "'Inter', system-ui, sans-serif",
  mono: "'JetBrains Mono', 'DM Mono', monospace",
}

// ── Lean two-city test budget (what Dr. Wagner wires to Kingdom Broker LLC) ──
const ONE_TIME = [
  { item: 'Platform, valuation tools & funnels', amount: '$5,000', note: 'Landing page, "Value My Clinic" tool, intake + admin dashboard — already built — configured, localized, and deployed for the VA test.' },
  { item: 'Video + content launch', amount: '$3,000', note: 'AI-avatar + explainer + software-demo videos (problem/solution + Value-My-Clinic demos) — no founder on camera (ProMed VA stays corporate; Wagner not named or shown).' },
]
const MONTHLY = [
  { item: 'Paid ad budget', amount: '$5,000', note: 'Meta + Google, concentrated on the two test cities + traffic to the free Value My Clinic tool.' },
  { item: 'Kingdom Broker management fee — Eric Skeldon', amount: '$3,000', note: 'Manages the build, hires + runs the team, ad spend + outreach, reporting. Cancel anytime, 14-day notice.' },
  { item: 'Team (hired + managed by Kingdom Broker)', amount: '$2,500', note: 'Part-time media buyer + appointment-setter/outreach + content editor.' },
  { item: 'Lists, data, email tooling + hosting', amount: '$500', note: 'Owned 24K DC list (~$0) + sending infra, enrichment, list cleaning; Vercel/Supabase/Claude API/email.' },
]
const TEAM = [
  { role: 'CEO & Platform Operator', who: 'Eric Skeldon (Kingdom Broker)', comp: '$3,000/mo mgmt fee', resp: 'Owns the build, the team, ad spend, outreach + reporting. Cancel anytime, 14-day notice.' },
  { role: 'Media Buyer (part-time)', who: 'Hired by KB', comp: 'in team line', resp: 'Builds + runs the Meta/Google test, geo-fenced to the two cities, daily optimization.' },
  { role: 'Appointment Setter / Outreach', who: 'Hired by KB', comp: 'in team line', resp: 'Works the owned VA list + ad leads; books qualified discovery calls; high-touch follow-up.' },
  { role: 'Content Editor', who: 'Hired by KB', comp: 'in team line', resp: 'Cuts the VSL + ad creatives from Dr. Wagner footage; localizes per city.' },
  { role: 'Medical team', who: 'Dr. Wagner (his side)', comp: '—', resp: 'Runs diagnostics + cash services inside the partner clinic once a partner signs.' },
]
const BONUSES = [
  { trigger: 'First test city hits 10 qualified applications', example: '$2,500 milestone bonus', who: 'Kingdom Broker' },
  { trigger: 'First lease partner signed in the test', example: '$15,000 bonus', who: 'Kingdom Broker' },
  { trigger: 'Each additional lease partner signed', example: '$10,000 per signed chiropractor', who: 'Kingdom Broker (success fee)' },
  { trigger: 'Each Phase-2 acquisition closed', example: '4% of acquisition value + 2% revenue share on the office', who: 'Kingdom Broker (success fee)' },
]
const KPIS = [
  { m: 'Qualified applications', t: '10–20 per test city' },
  { m: 'Signed partners (test)', t: '1 to start (the case study)' },
  { m: 'Cost per qualified application', t: '~$450 (plan; band $350–600)' },
  { m: 'Speed-to-lead', t: '< 1 business hour' },
]

function Section({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 34 }}>
      <div style={{ fontFamily: F.mono, fontSize: 11, letterSpacing: '0.18em', color: C.gold, textTransform: 'uppercase', fontWeight: 800, marginBottom: 8 }}>{eyebrow}</div>
      <h2 style={{ fontFamily: F.display, fontSize: 'clamp(22px,3vw,30px)', fontWeight: 700, color: C.text, margin: '0 0 16px', letterSpacing: '-0.01em' }}>{title}</h2>
      {children}
    </div>
  )
}

const cell: React.CSSProperties = { padding: '10px 14px', borderBottom: `1px solid ${C.border}`, fontSize: 13.5, color: C.muted, verticalAlign: 'top' }
const cellHead: React.CSSProperties = { padding: '10px 14px', textAlign: 'left', fontFamily: F.mono, fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.faint, borderBottom: `1px solid ${C.border}` }

export default function LaunchPlanPage() {
  return (
    <div style={{ padding: '32px 32px 80px', maxWidth: 1100, margin: '0 auto', fontFamily: F.body, color: C.text }}>

      {/* HEADER */}
      <div style={{ marginBottom: 30 }}>
        <div style={{ fontFamily: F.mono, fontSize: 12.5, color: C.gold, letterSpacing: '0.22em', textTransform: 'uppercase', fontWeight: 800, marginBottom: 10 }}>
          ProMed VA · Virginia Launch Plan
        </div>
        <h1 style={{ fontFamily: F.display, fontSize: 'clamp(32px,4.5vw,46px)', fontWeight: 700, margin: '0 0 12px', letterSpacing: '-0.02em' }}>
          The plan, the team, and the test budget.
        </h1>
        <p style={{ fontSize: 16, color: '#C7D0E0', margin: 0, maxWidth: 820, lineHeight: 1.6 }}>
          A lean, <strong style={{ color: C.gold }}>two-city Virginia test</strong> — Charlottesville first, plus one metro — fully managed by <strong style={{ color: C.text }}>Kingdom Broker LLC (Eric Skeldon)</strong>. Prove the model, sign the first partner, then scale city-by-city. Dr. Wagner funds the test; cancel anytime with 14 days&apos; notice.
        </p>
      </div>

      {/* THE PLAN */}
      <Section eyebrow="The model" title="Partner first. Acquire later.">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18 }}>
          <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderLeft: `4px solid ${C.gold}`, borderRadius: 12, padding: '20px 22px' }}>
            <div style={{ fontFamily: F.mono, fontSize: 11, color: C.gold, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 800, marginBottom: 8 }}>Phase 1 · Lease (income now)</div>
            <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.6, margin: 0 }}>ProMed VA leases space inside the chiropractor&apos;s clinic for a medical office — <strong style={{ color: C.text }}>$10K/mo base lease + quarterly performance bonuses (~$25K each, tied to the metrics) → ~$200K/yr</strong>, plus commission on cash services (up to ~$250K/yr). Our medical team runs the diagnostics. The chiropractor keeps practicing exactly as they do today.</p>
          </div>
          <div style={{ background: C.bg2, border: `1px solid rgba(46,204,139,0.4)`, borderLeft: `4px solid ${C.green}`, borderRadius: 12, padding: '20px 22px' }}>
            <div style={{ fontFamily: F.mono, fontSize: 11, color: C.green, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 800, marginBottom: 8 }}>Phase 2 · Acquire (the exit)</div>
            <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.6, margin: 0 }}>After the partnership proves the fit, acquire at <strong style={{ color: C.text }}>50% cash down + 50% seller financing, plus 4% profit sharing</strong> — at a platform multiple that finally monetizes the goodwill a standalone sale ignores.</p>
          </div>
        </div>
        <p style={{ fontSize: 13.5, color: C.faint, marginTop: 14 }}>Target the <strong style={{ color: C.muted }}>one dominant chiropractor per city</strong> (45+, 25+ new patients/mo, spare space, exit-minded). Full detail in the Data Room: Executive Summary, Target ICP, and Rollout + KPIs.</p>
      </Section>

      {/* THE TEST */}
      <Section eyebrow="The test" title="Two Virginia cities. One signed partner to start.">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 14, marginBottom: 16 }}>
          {KPIS.map(k => (
            <div key={k.m} style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 10, padding: '14px 16px' }}>
              <div style={{ fontFamily: F.display, fontSize: 18, color: C.goldLight, fontWeight: 800, lineHeight: 1.1 }}>{k.t}</div>
              <div style={{ fontSize: 11.5, color: C.faint, marginTop: 5 }}>{k.m}</div>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 13.5, color: C.muted, lineHeight: 1.6, margin: 0 }}>
          Concentrate the full $5K/mo + the owned-list outreach on <strong style={{ color: C.text }}>Charlottesville (warm network) + one metro (Richmond or Virginia Beach)</strong>. Spreading the budget across all 11 cities would clear the application floor in none. Prove two, then scale.
        </p>
      </Section>

      {/* THE TEAM */}
      <Section eyebrow="The team" title="Lean, hired and run by Kingdom Broker.">
        <table style={{ width: '100%', borderCollapse: 'collapse', background: C.bg2, borderRadius: 12, overflow: 'hidden' }}>
          <thead><tr><th style={cellHead}>Role</th><th style={cellHead}>Who</th><th style={cellHead}>Comp</th><th style={cellHead}>Responsibility</th></tr></thead>
          <tbody>{TEAM.map(t => (
            <tr key={t.role}><td style={{ ...cell, color: C.text, fontWeight: 600 }}>{t.role}</td><td style={cell}>{t.who}</td><td style={{ ...cell, color: C.gold, fontFamily: F.mono, fontSize: 12 }}>{t.comp}</td><td style={cell}>{t.resp}</td></tr>
          ))}</tbody>
        </table>
      </Section>

      {/* THE TEST BUDGET */}
      <Section eyebrow="The test budget" title="What Dr. Wagner wires to Kingdom Broker LLC.">
        <h3 style={{ fontFamily: F.display, fontSize: 16, color: C.text, margin: '0 0 8px' }}>One-time setup (Month 1)</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', background: C.bg2, borderRadius: 12, overflow: 'hidden', marginBottom: 18 }}>
          <thead><tr><th style={cellHead}>Item</th><th style={cellHead}>Amount</th><th style={cellHead}>Covers</th></tr></thead>
          <tbody>{ONE_TIME.map(r => (<tr key={r.item}><td style={{ ...cell, color: C.text, fontWeight: 600 }}>{r.item}</td><td style={{ ...cell, color: C.gold, fontFamily: F.mono }}>{r.amount}</td><td style={cell}>{r.note}</td></tr>))}
            <tr><td style={{ ...cell, color: C.text, fontWeight: 700 }}>One-time subtotal</td><td style={{ ...cell, color: C.goldLight, fontFamily: F.mono, fontWeight: 700 }}>$8,000</td><td style={cell}></td></tr>
          </tbody>
        </table>

        <h3 style={{ fontFamily: F.display, fontSize: 16, color: C.text, margin: '0 0 8px' }}>Monthly (cancel anytime · 14-day notice)</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', background: C.bg2, borderRadius: 12, overflow: 'hidden', marginBottom: 18 }}>
          <thead><tr><th style={cellHead}>Item</th><th style={cellHead}>Monthly</th><th style={cellHead}>Covers</th></tr></thead>
          <tbody>{MONTHLY.map(r => (<tr key={r.item}><td style={{ ...cell, color: C.text, fontWeight: 600 }}>{r.item}</td><td style={{ ...cell, color: C.gold, fontFamily: F.mono }}>{r.amount}</td><td style={cell}>{r.note}</td></tr>))}
            <tr><td style={{ ...cell, color: C.text, fontWeight: 700 }}>Monthly subtotal</td><td style={{ ...cell, color: C.goldLight, fontFamily: F.mono, fontWeight: 700 }}>$11,000/mo total</td><td style={cell}></td></tr>
          </tbody>
        </table>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px,1fr))', gap: 12, marginBottom: 16 }}>
          {[['$19K', 'Month 1 (setup + first month)'], ['$11K', 'each month after'], ['~$41K', 'full 3-month lean test']].map(([n, l]) => (
            <div key={l} style={{ background: `linear-gradient(135deg, ${C.gold}22, ${C.bg3})`, border: `1px solid ${C.gold}55`, borderRadius: 10, padding: '14px 16px' }}>
              <div style={{ fontFamily: F.display, fontSize: 22, fontWeight: 800, color: C.gold }}>{n}</div>
              <div style={{ fontSize: 11.5, color: C.muted, marginTop: 4 }}>{l}</div>
            </div>
          ))}
        </div>
        <div style={{ background: `${C.green}12`, border: `1px solid ${C.green}33`, borderRadius: 10, padding: '12px 16px', fontSize: 13, color: '#C7D0E0', lineHeight: 1.6 }}>
          <strong style={{ color: C.green }}>Terms (so nobody works for free):</strong> retainer paid monthly in advance; cancel with 14 days&apos; notice before the next billing date; current month non-refundable; ad spend is pass-through (unused returned); success-fee tail of 90 days on partners KB sourced. <strong style={{ color: C.text }}>No legal line</strong> — Dr. Wagner engages his own VA counsel.
        </div>
      </Section>

      {/* PERFORMANCE BONUSES */}
      <Section eyebrow="Example performance bonuses" title="Pay for results, not just activity.">
        <p style={{ fontSize: 13.5, color: C.muted, margin: '0 0 12px', lineHeight: 1.6 }}>Examples to align incentives — final numbers to agree with Dr. Wagner. These sit on top of the monthly engagement and reward signed partners + closed deals.</p>
        <table style={{ width: '100%', borderCollapse: 'collapse', background: C.bg2, borderRadius: 12, overflow: 'hidden' }}>
          <thead><tr><th style={cellHead}>Trigger</th><th style={cellHead}>Example bonus</th><th style={cellHead}>Paid to</th></tr></thead>
          <tbody>{BONUSES.map(b => (<tr key={b.trigger}><td style={{ ...cell, color: C.text }}>{b.trigger}</td><td style={{ ...cell, color: C.gold, fontFamily: F.mono, fontSize: 12.5 }}>{b.example}</td><td style={cell}>{b.who}</td></tr>))}</tbody>
        </table>
      </Section>

      {/* THE ASK */}
      <div style={{ background: `linear-gradient(135deg, ${C.gold}, ${C.goldLight})`, borderRadius: 14, padding: '26px 30px', color: '#0B1B3E' }}>
        <div style={{ fontFamily: F.mono, fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 800, marginBottom: 8 }}>The ask</div>
        <h2 style={{ fontFamily: F.display, fontSize: 'clamp(22px,3vw,30px)', fontWeight: 700, margin: '0 0 10px', letterSpacing: '-0.01em' }}>
          Wire ~$19K to Kingdom Broker LLC to run the 30-day test.
        </h2>
        <p style={{ fontSize: 15, margin: 0, maxWidth: 640, lineHeight: 1.55, fontWeight: 500 }}>
          We build, launch, and manage the two-city Virginia test end-to-end and report results. Goal: 10–20 qualified applications and the first signed partner — the case study to scale across Virginia. Cancel anytime with 14 days&apos; notice.
        </p>
        <Link href="/data-room" style={{ display: 'inline-block', marginTop: 16, padding: '12px 26px', background: '#0B1B3E', color: C.gold, fontWeight: 800, fontSize: 14, textDecoration: 'none', borderRadius: 9 }}>
          See the full Data Room →
        </Link>
      </div>

      <div style={{ marginTop: 24, fontSize: 11, color: C.faint, lineHeight: 1.6 }}>
        ProMed VA · Kingdom Broker LLC · Confidential. Figures are conservative planning estimates, not guarantees. Management fee cancellable anytime with 14 days&apos; written notice. Success-fee and performance-bonus structures are proposed examples, subject to a written engagement. Excludes Dr. Wagner&apos;s own legal counsel and clinical/medical-team operating costs.
      </div>
    </div>
  )
}
