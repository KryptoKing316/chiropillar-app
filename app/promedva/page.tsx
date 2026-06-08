// ProMed VA — Virginia chiropractor partnership landing page.
// Public, no login. The "Add a Quarter Million" offer + two-phase model.
// Ads + the VA email list point here; CTAs route to /intake (qualify) and
// /value-my-clinic (free valuation lead magnet).
//
// Spec: 2026-06-06 Kingdom Broker chiropractor-rollup call (Eric + McGrath + Wagner/Kristin).
// Compliance: cash-services-only framing; no insurance/Medicare referral-fee implications.

const C = {
  bg: '#0B1B3E', bg2: '#0F2347', paper: '#F7F4ED', text: '#F2EEE7', ink: '#1F2A44',
  muted: '#9BA8C0', gold: '#C9A84C', goldLight: '#E8C96A', spine: '#1F4E79',
  align: '#2E75B6', green: '#2ECC8B', coral: '#F2B0A0',
}
const F = {
  display: "'Playfair Display', Georgia, serif",
  body: "'Inter', system-ui, sans-serif",
  mono: "'JetBrains Mono', 'DM Mono', monospace",
}

const VA_CITIES = ['Richmond', 'Virginia Beach', 'Fairfax', 'Fredericksburg', 'Harrisonburg', 'Lynchburg', 'Roanoke', 'Williamsburg', 'Charlottesville', 'Waynesboro', 'Orange']

function CTA({ href, children, primary }: { href: string; children: React.ReactNode; primary?: boolean }) {
  return (
    <a href={href} style={{
      display: 'inline-block', padding: '15px 30px', borderRadius: 10, textDecoration: 'none',
      fontWeight: 800, fontSize: 15, letterSpacing: '0.02em',
      background: primary ? C.gold : 'transparent',
      color: primary ? C.bg : C.text,
      border: primary ? 'none' : `1.5px solid ${C.gold}`,
      boxShadow: primary ? '0 8px 24px rgba(201,168,76,0.40)' : 'none',
    }}>{children}</a>
  )
}

export default function ProMedVALanding() {
  return (
    <div style={{ background: C.bg, color: C.text, fontFamily: F.body, minHeight: '100vh' }}>

      {/* TOP BAR */}
      <div style={{ borderBottom: `1px solid rgba(255,255,255,0.08)` }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', padding: '20px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ lineHeight: 1 }}>
            <div style={{ fontFamily: F.display, fontSize: 26, fontWeight: 800, color: C.text, letterSpacing: '-0.02em' }}>ProMed <span style={{ color: C.gold }}>VA</span></div>
            <div style={{ fontFamily: F.mono, fontSize: 10, fontWeight: 800, color: C.gold, letterSpacing: '0.20em', textTransform: 'uppercase', marginTop: 5 }}>Practice Growth Partners · Virginia</div>
          </div>
          <CTA href="/intake" primary>See if you qualify →</CTA>
        </div>
      </div>

      {/* HERO */}
      <div style={{ maxWidth: 920, margin: '0 auto', padding: '64px 28px 40px', textAlign: 'center' }}>
        <div style={{ fontFamily: F.mono, fontSize: 12, letterSpacing: '0.28em', color: C.gold, textTransform: 'uppercase', fontWeight: 800, marginBottom: 18 }}>
          For Virginia Chiropractors · 45+ · Growth-Minded
        </div>
        <h1 style={{ fontFamily: F.display, fontSize: 'clamp(38px, 6vw, 60px)', fontWeight: 700, lineHeight: 1.08, letterSpacing: '-0.02em', margin: '0 0 20px' }}>
          Add <span style={{ color: C.gold }}>a quarter million</span> to your annual income — doing exactly what you do today.
        </h1>
        <p style={{ fontSize: 19, color: '#C7D0E0', lineHeight: 1.6, maxWidth: 680, margin: '0 auto 32px' }}>
          You built 20 years of patient relationships and community trust. Your accountant calls it nothing. We host a <strong style={{ color: C.text }}>ProMed VA medical office inside your existing clinic</strong> — you collect a monthly base lease plus quarterly performance bonuses and commission on cash services, your patients get better diagnostics, and you finally have a real exit. No new techniques to learn.
        </p>
        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
          <CTA href="/intake" primary>See if your practice qualifies →</CTA>
          <CTA href="/value-my-clinic">Value my clinic (free)</CTA>
        </div>
        <div style={{ marginTop: 16, fontSize: 13, color: C.muted }}>Virginia practices only right now · 3-minute application · no obligation</div>
      </div>

      {/* THE PROBLEM */}
      <div style={{ background: C.bg2, padding: '56px 28px' }}>
        <div style={{ maxWidth: 880, margin: '0 auto' }}>
          <div style={{ fontFamily: F.mono, fontSize: 11, letterSpacing: '0.20em', color: C.coral, textTransform: 'uppercase', fontWeight: 800, marginBottom: 12 }}>The trap</div>
          <h2 style={{ fontFamily: F.display, fontSize: 'clamp(26px, 3.5vw, 34px)', fontWeight: 700, margin: '0 0 18px', letterSpacing: '-0.01em' }}>
            A $1.3M practice that sells for $350K.
          </h2>
          <p style={{ fontSize: 17, color: '#C7D0E0', lineHeight: 1.65, maxWidth: 720 }}>
            Practices get valued on EBITDA alone. The 20 years of relationships, referrals, and reputation you built — your <strong style={{ color: C.gold }}>goodwill</strong> — counts for zero. So most chiropractors are trapped: great income while they work, almost nothing to sell, and a clinic that dies with them. There&apos;s no transfer of equity. We change that.
          </p>
        </div>
      </div>

      {/* TWO-PHASE MODEL */}
      <div style={{ maxWidth: 980, margin: '0 auto', padding: '60px 28px' }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ fontFamily: F.mono, fontSize: 11, letterSpacing: '0.20em', color: C.gold, textTransform: 'uppercase', fontWeight: 800, marginBottom: 12 }}>How the partnership works</div>
          <h2 style={{ fontFamily: F.display, fontSize: 'clamp(26px, 3.5vw, 36px)', fontWeight: 700, margin: 0, letterSpacing: '-0.01em' }}>Partner first. Sell at a real number later.</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 22 }}>
          {/* Phase 1 */}
          <div style={{ background: C.bg2, border: `1px solid rgba(201,168,76,0.3)`, borderRadius: 16, padding: '30px 28px' }}>
            <div style={{ fontFamily: F.mono, fontSize: 11, letterSpacing: '0.16em', color: C.gold, textTransform: 'uppercase', fontWeight: 800, marginBottom: 10 }}>Phase 1 · Lease (now)</div>
            <h3 style={{ fontFamily: F.display, fontSize: 24, fontWeight: 700, margin: '0 0 14px' }}>Up to ~$250K/year, starting almost immediately</h3>
            <ul style={{ margin: 0, paddingLeft: 20, fontSize: 15, color: '#C7D0E0', lineHeight: 1.7 }}>
              <li>You lease space inside your clinic to a ProMed VA <strong style={{ color: C.text }}>medical office</strong> — a <strong style={{ color: C.text }}>$10K/mo base lease</strong> paid to you.</li>
              <li><strong style={{ color: C.text }}>Quarterly performance bonuses</strong> (~$25K each) as your clinic hits the agreed metrics — building the base toward <strong style={{ color: C.text }}>~$200K/yr</strong>.</li>
              <li>Our medical team runs the diagnostics and treatments you can&apos;t (shockwave, regenerative, advanced diagnostics).</li>
              <li>You earn <strong style={{ color: C.text }}>commission on cash services</strong> your team helps deliver.</li>
              <li>You keep adjusting your patients exactly as you do today. Low risk, immediate income.</li>
            </ul>
          </div>
          {/* Phase 2 */}
          <div style={{ background: `linear-gradient(135deg, rgba(46,204,139,0.10), ${C.bg2})`, border: `1px solid rgba(46,204,139,0.4)`, borderRadius: 16, padding: '30px 28px' }}>
            <div style={{ fontFamily: F.mono, fontSize: 11, letterSpacing: '0.16em', color: C.green, textTransform: 'uppercase', fontWeight: 800, marginBottom: 10 }}>Phase 2 · Acquire (later)</div>
            <h3 style={{ fontFamily: F.display, fontSize: 24, fontWeight: 700, margin: '0 0 14px' }}>Your goodwill, finally monetized</h3>
            <ul style={{ margin: 0, paddingLeft: 20, fontSize: 15, color: '#C7D0E0', lineHeight: 1.7 }}>
              <li>After we&apos;ve proven the model together (~2–3 years), we acquire the practice.</li>
              <li>Valued at a <strong style={{ color: C.green }}>platform-level multiple</strong> — not the EBITDA-only number a standalone sale gives you.</li>
              <li>A clear exit on a defined timeline, with the upside you actually built.</li>
              <li>You step back when you&apos;re ready — the practice lives on instead of dying with you.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* WHO QUALIFIES */}
      <div style={{ background: C.bg2, padding: '56px 28px' }}>
        <div style={{ maxWidth: 880, margin: '0 auto' }}>
          <div style={{ fontFamily: F.mono, fontSize: 11, letterSpacing: '0.20em', color: C.gold, textTransform: 'uppercase', fontWeight: 800, marginBottom: 12 }}>Who we partner with</div>
          <h2 style={{ fontFamily: F.display, fontSize: 'clamp(24px, 3.2vw, 32px)', fontWeight: 700, margin: '0 0 20px', letterSpacing: '-0.01em' }}>We pick one strong practice per city. Is it you?</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14, fontSize: 15, color: '#C7D0E0', lineHeight: 1.6 }}>
            {[
              ['25+ new patients / month', 'A real, steady two-year baseline — not a recent spike.'],
              ['45+ and growth-minded', 'You&apos;ve been at it long enough to have built genuine goodwill.'],
              ['Room to host a medical office', 'A couple of rooms / spare square footage in your clinic.'],
              ['Strong retention + care plans', 'Patients stay, refer, and trust you — the moat that matters.'],
              ['You think like an owner', 'You want growth and a real exit, not just another year on the table.'],
              ['Altruistic + cash-service ready', 'You still serve your community and can offer cash services.'],
            ].map(([h, d]) => (
              <div key={h} style={{ background: C.bg, borderRadius: 10, padding: '16px 18px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ color: C.gold, fontWeight: 700, marginBottom: 4 }}>{h}</div>
                <div style={{ fontSize: 13.5 }} dangerouslySetInnerHTML={{ __html: d }} />
              </div>
            ))}
          </div>
          <p style={{ fontSize: 14, color: C.muted, marginTop: 22 }}>
            Qualified practices submit <strong style={{ color: C.text }}>two years of P&amp;Ls</strong> so we can show you what your practice is worth today — and what it could be worth in two years as a partner.
          </p>
        </div>
      </div>

      {/* VIRGINIA */}
      <div style={{ maxWidth: 880, margin: '0 auto', padding: '56px 28px', textAlign: 'center' }}>
        <div style={{ fontFamily: F.mono, fontSize: 11, letterSpacing: '0.20em', color: C.gold, textTransform: 'uppercase', fontWeight: 800, marginBottom: 12 }}>Virginia first</div>
        <h2 style={{ fontFamily: F.display, fontSize: 'clamp(24px, 3.2vw, 32px)', fontWeight: 700, margin: '0 0 18px', letterSpacing: '-0.01em' }}>We&apos;re launching across Virginia.</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center', marginBottom: 12 }}>
          {VA_CITIES.map(city => (
            <span key={city} style={{ padding: '8px 16px', background: C.bg2, border: '1px solid rgba(201,168,76,0.25)', borderRadius: 999, fontSize: 14, color: '#C7D0E0' }}>{city}</span>
          ))}
        </div>
        <p style={{ fontSize: 14, color: C.muted, maxWidth: 600, margin: '8px auto 0' }}>One or two practices per city. If your town isn&apos;t listed and you&apos;re in Virginia, apply anyway — we&apos;re expanding.</p>
      </div>

      {/* FINAL CTA */}
      <div style={{ background: `linear-gradient(135deg, ${C.gold}, ${C.goldLight})`, padding: '56px 28px', textAlign: 'center', color: C.bg }}>
        <h2 style={{ fontFamily: F.display, fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 700, margin: '0 0 14px', letterSpacing: '-0.01em' }}>
          Could your clinic qualify?
        </h2>
        <p style={{ fontSize: 18, margin: '0 auto 26px', maxWidth: 560, lineHeight: 1.55, fontWeight: 500 }}>
          Three minutes to see if you&apos;re a fit for the ProMed VA partnership — and what your goodwill is really worth.
        </p>
        <a href="/intake" style={{ display: 'inline-block', padding: '16px 38px', background: C.bg, color: C.gold, fontWeight: 800, fontSize: 16, textDecoration: 'none', borderRadius: 10, letterSpacing: '0.02em', boxShadow: '0 10px 30px rgba(11,27,62,0.35)' }}>
          See if I qualify →
        </a>
      </div>

      {/* FOOTER / DISCLAIMER */}
      <div style={{ maxWidth: 880, margin: '0 auto', padding: '32px 28px 60px', fontSize: 11.5, color: C.muted, lineHeight: 1.7, textAlign: 'center' }}>
        ProMed VA · Practice Growth Partners · Virginia. Income figures are illustrative, not guarantees. Phase 1 is a commercial lease of space plus commission on <strong style={{ color: '#C7D0E0' }}>cash-pay services</strong>; it is not a referral arrangement and involves no fee-splitting on insurance or Medicare. Any partnership or acquisition is subject to definitive documentation and applicable Virginia law (including corporate-practice-of-medicine requirements). This page is not an offer to buy or sell a practice.
      </div>
    </div>
  )
}
