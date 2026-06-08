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

// ── Lean two-city test budget — the spend to get the first chiropractor office onboard ──
// One-time $8K setup (platform $5K + video $3K) is folded into the Terms note below.
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
  { trigger: 'First lease partner signed in the test', example: '$7,500 on signing + $7,500 once the partnership goes live', who: 'Kingdom Broker' },
  { trigger: 'Each additional lease partner signed', example: '$5,000 on signing + $5,000 once that partnership goes live', who: 'Kingdom Broker (success fee)' },
]
const KPIS = [
  { m: 'Qualified applications', t: '10–20 per test city' },
  { m: 'Signed partners (test)', t: '1 to start (the case study)' },
  { m: 'Cost per qualified application', t: '~$450 (plan; band $350–600)' },
  { m: 'Speed-to-lead', t: '< 1 business hour' },
]
// The Wagner math — his own 6× return thesis (illustrative model economics).
const GOALS = [
  { tag: 'First goal', inv: '$1M', out: '$6M', accent: '#C9A84C', ret: '#E8C96A' },
  { tag: 'Big goal', inv: '$10M', out: '$60M', accent: '#2ECC8B', ret: '#2ECC8B' },
]
const COMPARE = [
  { label: 'A "boring" business', mult: '~2×', pct: 33, gold: false },
  { label: 'This chiropractor model', mult: '6×', pct: 100, gold: true },
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
          A lean, <strong style={{ color: C.gold }}>two-city Virginia test</strong> — Charlottesville first, plus one metro — fully managed by <strong style={{ color: C.text }}>Kingdom Broker LLC (Eric Skeldon)</strong>. Prove the model, sign the first partner, then scale city-by-city.
        </p>
      </div>

      {/* ── THE WAGNER MATH · 6× return ── */}
      <div style={{ position: 'relative', overflow: 'hidden', background: 'radial-gradient(130% 150% at 0% 0%, #14264a 0%, #0a1830 46%, #06122a 100%)', border: `1px solid ${C.gold}44`, borderRadius: 16, padding: '30px 34px 28px', marginBottom: 34, boxShadow: '0 10px 40px rgba(0,0,0,0.35)' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `linear-gradient(${C.gold}0d 1px, transparent 1px), linear-gradient(90deg, ${C.gold}0d 1px, transparent 1px)`, backgroundSize: '34px 34px', pointerEvents: 'none', maskImage: 'radial-gradient(120% 120% at 100% 0%, #000, transparent 75%)' }} />
        <div style={{ position: 'relative' }}>
          <div style={{ fontFamily: F.mono, fontSize: 11, letterSpacing: '0.22em', color: C.gold, textTransform: 'uppercase', fontWeight: 800, marginBottom: 10 }}>The math Dr. Wagner runs</div>
          <h2 style={{ fontFamily: F.display, fontSize: 'clamp(26px,4.2vw,42px)', fontWeight: 800, margin: '0 0 10px', letterSpacing: '-0.02em', color: C.text, lineHeight: 1.05 }}>
            Every <span style={{ color: C.gold }}>$1M</span> deployed returns about <span style={{ color: C.gold }}>$6M</span>.
          </h2>
          <p style={{ fontSize: 15.5, color: '#C7D0E0', margin: '0 0 22px', maxWidth: 780, lineHeight: 1.6 }}>
            &ldquo;Why put money in a <em>boring</em> business?&rdquo; Leasing square footage inside Virginia&apos;s dominant chiropractic clinics — then acquiring and scaling them — is a <strong style={{ color: C.text }}>6&times; engine</strong> on the goodwill a standalone sale throws away. That&apos;s the margin in this model.
          </p>

          {/* goal flows */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: 16 }}>
            {GOALS.map(g => (
              <div key={g.tag} style={{ background: 'rgba(5,16,31,0.5)', border: `1px solid ${g.accent}40`, borderRadius: 13, padding: '15px 18px 17px' }}>
                <div style={{ fontFamily: F.mono, fontSize: 10, letterSpacing: '0.16em', color: g.accent, textTransform: 'uppercase', fontWeight: 800 }}>{g.tag}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 12, flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontFamily: F.display, fontSize: 30, fontWeight: 800, color: C.muted, lineHeight: 1 }}>{g.inv}</div>
                    <div style={{ fontFamily: F.mono, fontSize: 9, letterSpacing: '0.14em', color: C.faint, textTransform: 'uppercase', marginTop: 4 }}>invested</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: F.mono, fontWeight: 800, fontSize: 13, color: '#0B1B3E', background: `linear-gradient(135deg, ${C.goldLight}, ${C.gold})`, padding: '6px 12px', borderRadius: 999, boxShadow: `0 0 18px ${C.gold}66`, alignSelf: 'center' }}>&times;6 &rarr;</div>
                  <div>
                    <div style={{ fontFamily: F.display, fontSize: 46, fontWeight: 800, color: g.ret, lineHeight: 1, textShadow: `0 0 26px ${g.ret}55` }}>{g.out}</div>
                    <div style={{ fontFamily: F.mono, fontSize: 9, letterSpacing: '0.14em', color: C.faint, textTransform: 'uppercase', marginTop: 4 }}>returned</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* return-multiple comparison */}
          <div style={{ marginTop: 22, maxWidth: 600 }}>
            {COMPARE.map(b => (
              <div key={b.label} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 9 }}>
                <div style={{ width: 168, fontSize: 12, color: b.gold ? C.text : C.muted, textAlign: 'right', flex: 'none' }}>{b.label}</div>
                <div style={{ flex: 1, height: 14, background: 'rgba(255,255,255,0.06)', borderRadius: 999, overflow: 'hidden' }}>
                  <div style={{ width: `${b.pct}%`, height: '100%', borderRadius: 999, background: b.gold ? `linear-gradient(90deg, ${C.gold}, ${C.goldLight})` : '#3A4865', boxShadow: b.gold ? `0 0 14px ${C.gold}88` : 'none' }} />
                </div>
                <div style={{ width: 46, fontFamily: F.display, fontWeight: 800, fontSize: 16, color: b.gold ? C.goldLight : C.faint, flex: 'none' }}>{b.mult}</div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 16, fontSize: 11, color: C.faint, lineHeight: 1.5 }}>
            Dr. Wagner&apos;s stated model economics — illustrative, not a guarantee. The lease (square-footage) test below is how we prove it, one city at a time.
          </div>
        </div>
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
      <Section eyebrow="The test budget" title="Budget to get first Chiropractor office onboard">
        <h3 style={{ fontFamily: F.display, fontSize: 16, color: C.text, margin: '0 0 8px' }}>Monthly engagement</h3>
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
          <strong style={{ color: C.green }}>Terms:</strong> Month 1 includes a one-time <strong style={{ color: C.text }}>$8,000 setup</strong> — platform, valuation tools &amp; funnels ($5,000; already built, configured &amp; deployed for the VA test) + video &amp; content launch ($3,000; AI-avatar / explainer / software-demo, no founder on camera). <strong style={{ color: C.text }}>Day-30 &amp; Day-60 off-ramps:</strong> if KB hasn&apos;t delivered a live funnel + first ad data + 15 booked discovery calls (or 5 qualified applications in Charlottesville) by Day 30, Dr. Wagner can stop and owes only the current month — no tail (repeats at Day 60). Retainer paid monthly in advance; cancel with 14 days&apos; notice before the next billing date; current month non-refundable; ad spend is pass-through (unused returned); success-fee tail of 90 days on partners KB sourced. <strong style={{ color: C.text }}>No legal line</strong> — Dr. Wagner engages his own VA counsel.
        </div>
      </Section>

      {/* PERFORMANCE BONUSES */}
      <Section eyebrow="Example performance bonuses" title="Pay for results, not just activity.">
        <p style={{ fontSize: 13.5, color: C.muted, margin: '0 0 12px', lineHeight: 1.6 }}>Examples to align incentives — final numbers to agree with Dr. Wagner. These sit on top of the monthly engagement and reward signed lease (square-footage) partners. &ldquo;Qualified application&rdquo; and &ldquo;signed lease partner&rdquo; are defined objectively in writing (Exhibit A), so fees only trigger on verified outcomes.</p>
        <table style={{ width: '100%', borderCollapse: 'collapse', background: C.bg2, borderRadius: 12, overflow: 'hidden' }}>
          <thead><tr><th style={cellHead}>Trigger</th><th style={cellHead}>Example bonus</th><th style={cellHead}>Paid to</th></tr></thead>
          <tbody>{BONUSES.map(b => (<tr key={b.trigger}><td style={{ ...cell, color: C.text }}>{b.trigger}</td><td style={{ ...cell, color: C.gold, fontFamily: F.mono, fontSize: 12.5 }}>{b.example}</td><td style={cell}>{b.who}</td></tr>))}</tbody>
        </table>
        <div style={{ marginTop: 12, background: `${C.gold}10`, border: `1px solid ${C.gold}33`, borderRadius: 10, padding: '11px 15px', fontSize: 12.5, color: '#C7D0E0', lineHeight: 1.55 }}>
          <strong style={{ color: C.gold }}>Lease deals first.</strong> The big fees are split — half on signing, half once the partnership goes live (ProMed VA operating in the space) — so KB is paid on a real, running partner, not just a signature. <strong style={{ color: C.text }}>Acquisition (Phase 2), kept separate:</strong> if ProMed VA later acquires a partner clinic, KB&apos;s success fee is a one-time <strong style={{ color: C.text }}>4% of the acquisition value</strong> — only if we acquire.
        </div>
      </Section>

      {/* THE ASK */}
      <div style={{ background: `linear-gradient(135deg, ${C.gold}, ${C.goldLight})`, borderRadius: 14, padding: '26px 30px', color: '#0B1B3E' }}>
        <div style={{ fontFamily: F.mono, fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 800, marginBottom: 8 }}>The ask</div>
        <h2 style={{ fontFamily: F.display, fontSize: 'clamp(22px,3vw,30px)', fontWeight: 700, margin: '0 0 10px', letterSpacing: '-0.01em' }}>
          Wire ~$19K to Kingdom Broker LLC to run the 30-day test.
        </h2>
        <p style={{ fontSize: 15, margin: 0, maxWidth: 640, lineHeight: 1.55, fontWeight: 500 }}>
          We build, launch, and manage the two-city Virginia test end-to-end and report results. Goal: 10–20 qualified applications and the first signed partner — the case study to scale across Virginia.
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
