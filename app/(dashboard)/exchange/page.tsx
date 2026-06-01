import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/auth-helpers-nextjs'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getExchangeMember, listVisibleDeals, getCoverPhoto, EXCHANGE_HERO_COVER } from '@/lib/exchange'

export const metadata = {
  title: 'DealExchange · Kingdom Broker Exchange',
  description: 'Private marketplace for Exchange broker partners',
}

export default async function ExchangeDashboard() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name: string) => cookieStore.get(name)?.value } }
  )
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) redirect('/login?next=/exchange')

  const member = await getExchangeMember(session.user.id)
  const isAdmin = session.user.email === 'eric@kingdombroker.com'

  if (!member && !isAdmin) {
    return (
      <main style={containerStyle}>
        <div style={lockedCardStyle}>
          <div style={{ fontSize: 60, marginBottom: 20 }}>🔒</div>
          <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 36, color: '#0B1B3E', margin: '0 0 12px' }}>
            Exchange Access
          </h1>
          <p style={{ fontSize: 16, color: '#475569', lineHeight: 1.6, margin: '0 0 28px', maxWidth: 480 }}>
            DealExchange is a private platform for Kingdom Broker Exchange member firms.
            Interested in becoming a founding partner? Reach out to Eric directly.
          </p>
          <a href="mailto:Eric@KingdomBroker.com" style={ctaPrimaryStyle}>
            Request Access →
          </a>
        </div>
      </main>
    )
  }

  const firmName = member?.coalition_firms?.firm_name ?? 'Kingdom Broker'
  const firmTier = (member?.coalition_firms?.tier ?? 'founder') as string
  const firmEquity = member?.coalition_firms?.equity_pct ?? 0

  const allDeals = await listVisibleDeals(member?.id ?? '', { limit: 30 })
  const ownDeals = member ? allDeals.filter((d) => d.source_firm_id === member.firm_id) : []
  const otherDeals = member ? allDeals.filter((d) => d.source_firm_id !== member.firm_id) : allDeals

  // Stats
  const totalAggregateValuation = otherDeals.reduce((sum, d) => {
    const v = d.ai_valuation_mid as number | undefined
    return sum + (v ?? 0)
  }, 0)

  return (
    <div style={pageStyle}>
      {/* HERO with cover image overlay */}
      <section style={heroStyle}>
        {/* Background cover image with gradient overlay */}
        <div style={heroCoverImageStyle}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={EXCHANGE_HERO_COVER}
            alt=""
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: 0.18,
            }}
          />
          <div style={heroGradientOverlayStyle} />
        </div>

        <div style={heroInnerStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 24 }}>
            <div style={{ flex: 1, minWidth: 320 }}>
              <div style={kickerStyle}>
                DealExchange · Exchange v1.0
              </div>
              <h1 style={heroTitleStyle}>
                Welcome, <span style={{ color: '#C9A84C' }}>{firmName}</span>
              </h1>
              <p style={heroSubStyle}>
                Private marketplace for top broker firms. Share anonymized deals, get AI valuations in 60 seconds, match buyers from our 1,127+ buyer database.
              </p>
              <div style={{ display: 'flex', gap: 10, marginTop: 18, flexWrap: 'wrap' }}>
                <span style={tierBadgeStyle(firmTier)}>
                  {firmTier === 'founder' ? '★ FOUNDING PARTNER' : firmTier.toUpperCase()}
                </span>
                {firmEquity > 0 && (
                  <span style={equityBadgeStyle}>
                    {firmEquity}% Equity Stake
                  </span>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <Link href="/exchange/deals/new" style={ctaPrimaryStyle}>
                List a Deal
              </Link>
              <Link href="/exchange/browse" style={ctaSecondaryStyle}>
                Browse Marketplace
              </Link>
            </div>
          </div>
        </div>

        {/* Stats banner */}
        <div style={statsBannerStyle}>
          <Stat label="Your Listed" value={ownDeals.filter(d => d.status === 'listed').length.toString()} />
          <Stat label="Exchange Deals" value={allDeals.length.toString()} accent />
          <Stat label="Aggregate Valuation" value={formatM(totalAggregateValuation)} />
          <Stat label="Buyer Database" value="1,127+" sub="curated buyers" />
          <Stat label="AI Valuation Time" value="60s" sub="NAICS-keyed" />
        </div>
      </section>

      {/* MAIN CONTENT */}
      <main style={mainStyle}>
        {/* YOUR DEALS */}
        <section style={{ marginBottom: 56 }}>
          <SectionHeader
            title="Your Active Deals"
            subtitle={`${ownDeals.length} deal${ownDeals.length === 1 ? '' : 's'} from ${firmName}`}
            actionHref="/exchange/deals/new"
            actionLabel="+ New Deal"
          />
          {ownDeals.length === 0 ? (
            <EmptyState
              title="No deals listed yet"
              body="List your first deal to share it with the Exchange. AI runs a NAICS-keyed valuation in under 60 seconds."
              ctaHref="/exchange/deals/new"
              ctaLabel="List Your First Deal →"
            />
          ) : (
            <div style={gridStyle}>
              {ownDeals.map((d) => <DealCard key={d.id} deal={d} own />)}
            </div>
          )}
        </section>

        {/* COALITION FEED */}
        <section>
          <SectionHeader
            title="Exchange Deal Flow"
            subtitle="Anonymized listings from partner firms. Request NDA to unlock details."
            actionHref="/exchange/browse"
            actionLabel="View All →"
          />
          {otherDeals.length === 0 ? (
            <EmptyState
              title="Exchange is just getting started"
              body="Once Voyage Acquisitions, Vant Group, Empowered, and God Bless Retirement onboard, their deals appear here."
            />
          ) : (
            <div style={gridStyle}>
              {otherDeals.map((d) => <DealCard key={d.id} deal={d} />)}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

// ─── STYLES ────────────────────────────────────────────────────────────────

const pageStyle: React.CSSProperties = {
  minHeight: '100vh',
  background: 'linear-gradient(180deg, #0a1730 0%, #0b1b3e 100%)',
  color: '#F2EEE7',
  fontFamily: "'Inter', 'DM Sans', system-ui, sans-serif",
}

const heroStyle: React.CSSProperties = {
  position: 'relative',
  background: 'linear-gradient(180deg, #0F2347 0%, #0B1B3E 100%)',
  borderBottom: '1px solid rgba(255,255,255,0.06)',
  overflow: 'hidden',
}

const heroCoverImageStyle: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  zIndex: 0,
  pointerEvents: 'none',
}

const heroGradientOverlayStyle: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  background: 'linear-gradient(135deg, rgba(11,27,62,0.85) 0%, rgba(15,35,71,0.92) 60%, rgba(11,27,62,0.96) 100%)',
}

const heroInnerStyle: React.CSSProperties = {
  position: 'relative',
  zIndex: 1,
  maxWidth: 1280,
  margin: '0 auto',
  padding: '56px 32px 36px',
}

const containerStyle: React.CSSProperties = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 32,
  background: '#F2EEE7',
}

const lockedCardStyle: React.CSSProperties = {
  background: 'white',
  border: '1px solid #E8E5DC',
  borderRadius: 16,
  padding: '48px 56px',
  textAlign: 'center',
  maxWidth: 560,
  boxShadow: '0 4px 24px rgba(11,27,62,0.08)',
}

const kickerStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
  color: '#C9A84C',
  marginBottom: 12,
}

const heroTitleStyle: React.CSSProperties = {
  fontFamily: "'Playfair Display', Georgia, serif",
  fontSize: 48,
  fontWeight: 700,
  lineHeight: 1.1,
  margin: '0 0 12px',
  color: '#F2EEE7',
  letterSpacing: '-0.02em',
}

const heroSubStyle: React.CSSProperties = {
  fontSize: 17,
  color: '#9BA8C0',
  maxWidth: 640,
  lineHeight: 1.55,
  margin: 0,
}

const tierBadgeStyle = (tier: string): React.CSSProperties => ({
  display: 'inline-block',
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: '0.14em',
  padding: '7px 13px',
  borderRadius: 999,
  background: tier === 'founder' ? 'rgba(201,168,76,0.16)' : 'rgba(155,168,192,0.12)',
  color: tier === 'founder' ? '#C9A84C' : '#9BA8C0',
  border: tier === 'founder' ? '1px solid rgba(201,168,76,0.35)' : '1px solid rgba(155,168,192,0.18)',
})

const equityBadgeStyle: React.CSSProperties = {
  display: 'inline-block',
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: '0.14em',
  padding: '7px 13px',
  borderRadius: 999,
  background: 'rgba(46,125,79,0.15)',
  color: '#5fc28a',
  border: '1px solid rgba(46,125,79,0.32)',
}

const ctaPrimaryStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  padding: '12px 22px',
  background: '#C9A84C',
  color: '#0B1B3E',
  fontWeight: 700,
  fontSize: 14,
  borderRadius: 10,
  textDecoration: 'none',
  letterSpacing: '0.01em',
  border: 'none',
  cursor: 'pointer',
  boxShadow: '0 1px 0 rgba(0,0,0,0.05), 0 2px 8px rgba(201,168,76,0.18)',
  transition: 'transform 120ms ease, box-shadow 120ms ease',
}

const ctaSecondaryStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  padding: '12px 22px',
  background: 'rgba(255,255,255,0.04)',
  color: '#F2EEE7',
  fontWeight: 600,
  fontSize: 14,
  borderRadius: 10,
  textDecoration: 'none',
  border: '1px solid rgba(255,255,255,0.12)',
}

const statsBannerStyle: React.CSSProperties = {
  position: 'relative',
  zIndex: 1,
  maxWidth: 1280,
  margin: '0 auto',
  padding: '0 32px 36px',
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
  gap: 1,
  background: 'rgba(255,255,255,0.05)',
  borderRadius: 14,
  overflow: 'hidden',
  border: '1px solid rgba(255,255,255,0.06)',
}

function Stat({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: boolean }) {
  return (
    <div style={{
      background: '#0B1B3E',
      padding: '20px 24px',
    }}>
      <div style={{
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color: '#9BA8C0',
        marginBottom: 8,
      }}>{label}</div>
      <div style={{
        fontFamily: "'Playfair Display', Georgia, serif",
        fontSize: 30,
        fontWeight: 700,
        lineHeight: 1,
        color: accent ? '#C9A84C' : '#F2EEE7',
      }}>{value}</div>
      {sub && (
        <div style={{ fontSize: 11, color: '#4A5880', marginTop: 4, letterSpacing: '0.02em' }}>{sub}</div>
      )}
    </div>
  )
}

const mainStyle: React.CSSProperties = {
  maxWidth: 1280,
  margin: '0 auto',
  padding: '48px 32px 80px',
}

function SectionHeader({ title, subtitle, actionHref, actionLabel }: { title: string; subtitle: string; actionHref?: string; actionLabel?: string }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      marginBottom: 24,
      paddingBottom: 16,
      borderBottom: '1px solid rgba(255,255,255,0.08)',
    }}>
      <div>
        <h2 style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: 28,
          fontWeight: 700,
          margin: '0 0 4px',
          color: '#F2EEE7',
          letterSpacing: '-0.01em',
        }}>{title}</h2>
        <p style={{
          fontSize: 14,
          color: '#9BA8C0',
          margin: 0,
        }}>{subtitle}</p>
      </div>
      {actionHref && (
        <Link href={actionHref} style={{
          fontSize: 13,
          fontWeight: 600,
          color: '#C9A84C',
          textDecoration: 'none',
        }}>
          {actionLabel}
        </Link>
      )}
    </div>
  )
}

const gridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
  gap: 20,
}

function DealCard({ deal, own }: { deal: Record<string, unknown>; own?: boolean }) {
  const firmRel = deal.coalition_firms as { firm_name?: string } | undefined
  const dealId = deal.id as string
  const title = (deal.public_title as string) || 'Untitled Deal'
  const summary = (deal.public_summary as string) || ''
  const industry = (deal.industry as string) || '—'
  const city = (deal.city_region as string) || ''
  const state = (deal.state as string) || ''
  const rev = (deal.revenue_band as string) || ''
  const ebitda = (deal.ebitda_band as string) || ''
  const asking = (deal.asking_price_band as string) || ''
  const valuation = deal.ai_valuation_mid as number | undefined
  const status = (deal.status as string) || 'draft'
  const years = deal.years_in_business as number | undefined
  const coverPhoto = getCoverPhoto(industry)

  return (
    <Link href={`/exchange/deals/${dealId}`} style={{ textDecoration: 'none' }}>
      <div style={dealCardStyle}>
        {/* Cover photo */}
        <div style={dealCoverWrapperStyle}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={coverPhoto} alt={industry} style={dealCoverImageStyle} />
          <div style={dealCoverOverlayStyle} />
          {/* Industry pill overlaid on photo */}
          <span style={industryPillOverlayStyle}>{industry}</span>
          <span style={statusPillOverlayStyle}>
            <StatusPill status={status} />
          </span>
        </div>

        {/* Card body */}
        <div style={{ padding: '18px 20px 18px' }}>
          {/* Title */}
          <h3 style={dealTitleStyle}>{title}</h3>

          {/* Summary */}
          {summary && (
            <p style={dealSummaryStyle}>{summary}</p>
          )}

          {/* Metadata row */}
          <div style={{ display: 'flex', gap: 14, fontSize: 12, color: '#9BA8C0', marginBottom: 14, flexWrap: 'wrap' }}>
            {(city || state) && <span>📍 {[city, state].filter(Boolean).join(', ')}</span>}
            {years && <span>🗓 {years} yrs</span>}
            {firmRel?.firm_name && !own && <span style={{ color: '#C9A84C' }}>via {firmRel.firm_name}</span>}
            {own && <span style={{ color: '#C9A84C', fontWeight: 600 }}>● Your Firm</span>}
          </div>

          {/* Financial highlights */}
          <div style={dealFinancialsStyle}>
            <div style={dealMetricStyle}>
              <div style={dealMetricLabelStyle}>Revenue</div>
              <div style={dealMetricValueStyle}>{rev || '—'}</div>
            </div>
            <div style={dealMetricStyle}>
              <div style={dealMetricLabelStyle}>EBITDA</div>
              <div style={dealMetricValueStyle}>{ebitda || '—'}</div>
            </div>
            <div style={dealMetricStyle}>
              <div style={dealMetricLabelStyle}>{valuation ? 'AI Valuation' : 'Asking'}</div>
              <div style={{ ...dealMetricValueStyle, color: valuation ? '#C9A84C' : '#F2EEE7' }}>
                {valuation ? formatM(valuation) : (asking || '—')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

const dealCardStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.025)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 14,
  overflow: 'hidden',
  cursor: 'pointer',
  transition: 'border-color 160ms ease, transform 160ms ease, background 160ms ease',
}

const dealCoverWrapperStyle: React.CSSProperties = {
  position: 'relative',
  width: '100%',
  height: 180,
  overflow: 'hidden',
  background: '#0F2347',
}

const dealCoverImageStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  display: 'block',
  transition: 'transform 320ms ease',
}

const dealCoverOverlayStyle: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  background: 'linear-gradient(180deg, rgba(11,27,62,0.18) 0%, rgba(11,27,62,0.55) 65%, rgba(11,27,62,0.85) 100%)',
  pointerEvents: 'none',
}

const industryPillOverlayStyle: React.CSSProperties = {
  position: 'absolute',
  top: 14,
  left: 14,
  display: 'inline-block',
  fontSize: 10.5,
  fontWeight: 700,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  padding: '6px 12px',
  borderRadius: 999,
  background: 'rgba(201,168,76,0.95)',
  color: '#0B1B3E',
  boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
  zIndex: 2,
}

const statusPillOverlayStyle: React.CSSProperties = {
  position: 'absolute',
  top: 14,
  right: 14,
  zIndex: 2,
}

const dealTitleStyle: React.CSSProperties = {
  fontFamily: "'Playfair Display', Georgia, serif",
  fontSize: 19,
  fontWeight: 600,
  margin: '0 0 8px',
  color: '#F2EEE7',
  lineHeight: 1.3,
}

const dealSummaryStyle: React.CSSProperties = {
  fontSize: 13,
  color: '#9BA8C0',
  lineHeight: 1.5,
  margin: '0 0 14px',
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
}

const dealFinancialsStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: 8,
  paddingTop: 14,
  borderTop: '1px solid rgba(255,255,255,0.06)',
}

const dealMetricStyle: React.CSSProperties = {
  textAlign: 'left',
}

const dealMetricLabelStyle: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 600,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: '#4A5880',
  marginBottom: 4,
}

const dealMetricValueStyle: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 600,
  color: '#F2EEE7',
  letterSpacing: '-0.01em',
}

function StatusPill({ status }: { status: string }) {
  const colors: Record<string, { bg: string; text: string }> = {
    listed: { bg: 'rgba(46,125,79,0.18)', text: '#5fc28a' },
    matched: { bg: 'rgba(199,123,46,0.18)', text: '#e3a05a' },
    loi: { bg: 'rgba(80,140,230,0.18)', text: '#86b3f0' },
    closed: { bg: 'rgba(155,168,192,0.18)', text: '#cad4e6' },
    draft: { bg: 'rgba(155,168,192,0.1)', text: '#7d8ba5' },
  }
  const c = colors[status] ?? colors.draft
  return (
    <span style={{
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: '0.12em',
      textTransform: 'uppercase',
      padding: '4px 10px',
      borderRadius: 6,
      background: c.bg,
      color: c.text,
    }}>{status}</span>
  )
}

function EmptyState({ title, body, ctaHref, ctaLabel }: { title: string; body: string; ctaHref?: string; ctaLabel?: string }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.02)',
      border: '1px dashed rgba(255,255,255,0.12)',
      borderRadius: 14,
      padding: '48px 32px',
      textAlign: 'center',
    }}>
      <div style={{
        fontFamily: "'Playfair Display', Georgia, serif",
        fontSize: 22,
        color: '#F2EEE7',
        margin: '0 0 8px',
        fontWeight: 600,
      }}>{title}</div>
      <p style={{
        fontSize: 14,
        color: '#9BA8C0',
        maxWidth: 480,
        margin: '0 auto 24px',
        lineHeight: 1.6,
      }}>{body}</p>
      {ctaHref && ctaLabel && (
        <Link href={ctaHref} style={ctaPrimaryStyle}>{ctaLabel}</Link>
      )}
    </div>
  )
}

// Format $X (M)
function formatM(n?: number): string {
  if (!n) return '—'
  if (n >= 1_000_000) return '$' + (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return '$' + Math.round(n / 1_000) + 'K'
  return '$' + n
}
