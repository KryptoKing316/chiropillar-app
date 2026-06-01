import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'We Know the Trades | Kingdom Broker',
  description: 'Kingdom Broker is embedded in the trades. Dennis Yu has spent years interviewing and advising top operators in HVAC, plumbing, roofing, and home services.',
}

const people = [
  { name: 'Joe Crisara',                         title: 'HVAC Industry Legend',          industry: 'HVAC',                 note: 'Met at an HVAC show — one of the most recognized names in residential service sales.',              photo: '/images/trades/joe-crisara.jpeg',           color: '#3b82f6', facePos: '60% 44%' },
  { name: 'Roger Wakefield',                     title: 'Top Plumbing Influencer',        industry: 'Plumbing',             note: 'Built a 7-figure plumbing business and one of the most-followed trades voices online.',              photo: '/images/trades/roger-wakefield.jpg',        color: '#06b6d4', facePos: '50% 18%' },
  { name: 'Richard McClure',                     title: 'HVAC Operator — Dallas, TX',     industry: 'HVAC',                 note: 'Owner of Fox Air and Heat. Real operator, real growth, right here in DFW.',                        photo: '/images/trades/richard-mcclure.jpeg',       color: '#3b82f6', facePos: '50% 15%' },
  { name: 'Josh Nelson',                         title: 'Home Services Marketing',        industry: 'Plumbing / HVAC',      note: 'Helping plumbing and HVAC businesses grow predictably through proven marketing systems.',           photo: '/images/trades/josh-nelson.jpg',            color: '#0891b2', facePos: '50% 18%' },
  { name: 'Dan Antonelli',                       title: 'Contractor Branding Expert',     industry: 'Contracting',          note: 'Founder of Kickcharge Creative — the gold standard for contractor brand identity.',                 photo: '/images/trades/dan-antonelli.jpg',          color: '#f97316', facePos: '50% 20%' },
  { name: 'David Carroll',                       title: 'Dope Marketing — Minneapolis',   industry: 'Home Services',        note: 'Elite operator-focused growth strategies for trades businesses that want to dominate locally.',     photo: '/images/trades/david-carroll.jpg',          color: '#10b981', facePos: '50% 20%' },
  { name: 'Jack Wendt & Ross Franklin',          title: 'Trades Growth Leaders',          industry: 'Home Services',        note: 'Two of the sharpest minds in scaling home service businesses from good to great.',                 photo: '/images/trades/jack-wendt-ross-franklin.jpg', color: '#10b981', facePos: '50% 18%' },
  { name: 'Jeremy Newman',                       title: 'Trades Business Owner',          industry: 'Home Services',        note: 'Building real local authority and a brand that outlasts any single job or season.',                 photo: '/images/trades/jeremy-newman.jpg',          color: '#10b981', facePos: '62% 44%' },
  { name: 'Anthony Hilb',                        title: 'Contractor & Operator',          industry: 'Contracting',          note: 'A builder in every sense — putting in the work to own his market and his future.',                 photo: '/images/trades/anthony-hilb.jpg',           color: '#f97316', facePos: '50% 42%' },
  { name: 'Perry Marshall',                      title: 'Business Strategy Author',       industry: 'Strategy',             note: 'Author of 80/20 Sales & Marketing — required reading for any serious business owner.',             photo: '/images/trades/perry-marshall.jpg',         color: '#8b5cf6', facePos: '50% 40%' },
  { name: 'David Meerman Scott & Dr. Hugh Flax', title: 'Authority & Influence Leaders',  industry: 'Professional Services', note: 'David wrote the book on digital marketing. Dr. Flax proves authority transcends industry.',       photo: '/images/trades/david-meerman-scott.jpg',    color: '#ec4899', facePos: '50% 12%' },
  { name: 'Rehan Allahwala',                     title: 'Global Entrepreneur',            industry: 'Technology',           note: 'A visionary operator who has built businesses across continents and industries.',                  photo: '/images/trades/rehan-allahwala.jpg',        color: '#6366f1', facePos: '50% 15%' },
  { name: 'Matthew Januszek & Jack Wendt',       title: 'Fitness & Trades Operators',     industry: 'Home Services',        note: 'Different industries, same mindset: build systems, build teams, build legacy.',                   photo: '/images/trades/matthew-januszek.jpg',       color: '#10b981', facePos: '50% 48%' },
  { name: 'Michael Jensen — Boostability',       title: 'Digital Marketing Leader',       industry: 'Marketing',            note: 'Scaling local businesses through smart, repeatable digital marketing at volume.',                  photo: '/images/trades/michael-jensen.jpg',         color: '#f59e0b', facePos: '50% 18%' },
]

const stats = [
  { num: '$1B+', label: 'Ad Spend Managed' },
  { num: '14+', label: 'Industry Leaders Interviewed' },
  { num: '$1M–$10M', label: 'Businesses We Help Scale' },
  { num: '100%', label: 'Exit-Ready Focus' },
]

export default function MarketingPage() {
  return (
    <div style={{ fontFamily: "'Playfair Display', serif", background: 'linear-gradient(160deg, var(--kb-bg) 0%, var(--kb-bg-panel) 50%, var(--kb-bg) 100%)', color: '#fff', minHeight: '100vh' }}>
      <div style={{ height: 3, background: 'linear-gradient(90deg, transparent, #e8c84a, transparent)' }} />

      {/* HERO */}
      <section style={{ textAlign: 'center', padding: '52px 24px 44px', borderBottom: '1px solid var(--kb-border-subtle)' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, background: 'rgba(232,200,74,0.08)', border: '1px solid rgba(232,200,74,0.25)', borderRadius: 50, padding: '8px 20px 8px 8px', marginBottom: 28 }}>
          <div style={{ width: 42, height: 42, borderRadius: '50%', overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
            <Image src="/images/trades/dennis-yu.jpeg" alt="Dennis Yu" fill style={{ objectFit: 'cover', objectPosition: '50% 20%' }} sizes="42px" />
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: 13, fontWeight: 590, color: '#e8c84a', fontFamily: "'Inter', system-ui, sans-serif" }}>Dennis Yu — Co-Founder</div>
            <div style={{ fontSize: 10, color: '#8a9ab5', fontFamily: "'Inter', system-ui, sans-serif" }}>Fractional CMO · BlitzMetrics · Local Service Spotlight</div>
          </div>
        </div>
        <p style={{ fontSize: 10, letterSpacing: 4, textTransform: 'uppercase', color: '#e8c84a', marginBottom: 12, fontStyle: 'italic', fontFamily: "'Inter', system-ui, sans-serif" }}>In the Room Where It Happens</p>
        <h1 style={{ fontSize: 'clamp(26px, 5vw, 52px)', fontWeight: 590, lineHeight: 1.1, letterSpacing: '-1.5px', marginBottom: 16 }}>
          We Know the Trades.<br /><span style={{ color: '#e8c84a' }}>We Know Your World.</span>
        </h1>
        <p style={{ fontSize: 'clamp(13px, 1.8vw, 17px)', color: '#8a9ab5', maxWidth: 580, margin: '0 auto 20px', lineHeight: 1.65, fontStyle: 'italic', fontFamily: "'Inter', system-ui, sans-serif" }}>
          Our team has spent years interviewing, advising, and sitting across the table from the best operators in HVAC, plumbing, roofing, contracting, and home services. We&apos;re embedded in the trades.
        </p>
        <p style={{ fontSize: 12, color: '#e8c84a', letterSpacing: 2, textTransform: 'uppercase', fontFamily: "'Inter', system-ui, sans-serif" }}>Legacy first. Deal second. — Prov. 13:22</p>
      </section>

      {/* STATS */}
      <div style={{ display: 'flex', flexWrap: 'wrap', borderBottom: '1px solid var(--kb-border-subtle)' }}>
        {stats.map((s, i) => (
          <div key={i} style={{ flex: '1 1 140px', padding: '22px 16px', textAlign: 'center', borderRight: i < stats.length - 1 ? '1px solid var(--kb-border-subtle)' : 'none' }}>
            <div style={{ fontSize: 'clamp(20px, 3vw, 32px)', fontWeight: 590, color: '#e8c84a', letterSpacing: '-1px', marginBottom: 4 }}>{s.num}</div>
            <div style={{ fontSize: 9, color: '#8a9ab5', textTransform: 'uppercase', letterSpacing: 1, fontFamily: "'Inter', system-ui, sans-serif" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* PEOPLE GRID */}
      <section style={{ padding: '56px 20px 72px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <p style={{ fontSize: 10, letterSpacing: 4, textTransform: 'uppercase', color: '#e8c84a', marginBottom: 10, fontStyle: 'italic', fontFamily: "'Inter', system-ui, sans-serif" }}>The Network</p>
          <h2 style={{ fontSize: 'clamp(22px, 3.5vw, 36px)', fontWeight: 590, letterSpacing: '-1px', marginBottom: 10 }}>Operators, Experts &amp; Industry Voices</h2>
          <p style={{ fontSize: 13, color: '#8a9ab5', fontStyle: 'italic', fontFamily: "'Inter', system-ui, sans-serif" }}>Every photo is a relationship. Every relationship is a door for your business.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 18 }}>
          {people.map((p, i) => <PersonCard key={i} person={p} />)}
        </div>
      </section>

      {/* CTA */}
      <section style={{ borderTop: '1px solid var(--kb-border)', padding: '60px 24px', textAlign: 'center', background: 'linear-gradient(160deg, rgba(232,200,74,0.04), transparent)' }}>
        <p style={{ fontSize: 10, letterSpacing: 4, textTransform: 'uppercase', color: '#e8c84a', marginBottom: 12, fontStyle: 'italic', fontFamily: "'Inter', system-ui, sans-serif" }}>Now We Help You</p>
        <h2 style={{ fontSize: 'clamp(24px, 4vw, 44px)', fontWeight: 590, letterSpacing: '-1.5px', marginBottom: 12 }}>
          Scale Your Trades Business.<br /><span style={{ color: '#e8c84a' }}>Exit on Your Terms.</span>
        </h2>
        <p style={{ fontSize: 14, color: '#8a9ab5', fontStyle: 'italic', maxWidth: 480, margin: '0 auto 32px', lineHeight: 1.6, fontFamily: "'Inter', system-ui, sans-serif" }}>
          Kingdom Broker works with $1M–$10M businesses in roofing, HVAC, plumbing, waste management, and more — helping you grow and exit with purpose.
        </p>
        <Link href="/valuation" style={{ display: 'inline-block', background: 'linear-gradient(135deg, rgba(232,200,74,0.12), rgba(232,200,74,0.06))', border: '1px solid rgba(232,200,74,0.35)', borderRadius: 14, padding: '24px 44px', textDecoration: 'none' }}>
          <div style={{ fontSize: 18, fontWeight: 590, color: '#fff', marginBottom: 6, fontFamily: "'Inter', system-ui, sans-serif" }}>Start with a Free Business Valuation</div>
          <div style={{ fontSize: 13, color: '#e8c84a', fontStyle: 'italic', fontFamily: "'Inter', system-ui, sans-serif" }}>KingdomBroker.com/valuation</div>
        </Link>
        <p style={{ marginTop: 32, fontSize: 11, color: '#4a5568', letterSpacing: 1, fontFamily: "'Inter', system-ui, sans-serif" }}>In partnership with Dennis Yu · Local Service Spotlight · BlitzMetrics</p>
      </section>

      <div style={{ height: 3, background: 'linear-gradient(90deg, transparent, #e8c84a, transparent)' }} />
    </div>
  )
}

function PersonCard({ person }: { person: typeof people[0] }) {
  return (
    <div style={{ background: 'linear-gradient(160deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))', border: '1px solid var(--kb-border)', borderRadius: 14, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div style={{ width: '100%', paddingBottom: '70%', position: 'relative', background: '#0d1828', overflow: 'hidden' }}>
        <Image
          src={person.photo}
          alt={person.name}
          fill
          style={{ objectFit: 'cover', objectPosition: person.facePos, filter: 'brightness(0.88)' }}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
        <div style={{ position: 'absolute', top: 10, left: 10, borderRadius: 20, padding: '3px 10px', fontSize: 9, fontWeight: 590, letterSpacing: 1, textTransform: 'uppercase', backdropFilter: 'blur(8px)', background: person.color + '22', border: `1px solid ${person.color}66`, color: person.color, fontFamily: "'Inter', system-ui, sans-serif" }}>
          {person.industry}
        </div>
      </div>
      <div style={{ padding: '14px 14px 16px', flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ fontSize: 13, fontWeight: 590, color: '#fff', lineHeight: 1.3 }}>{person.name}</div>
        <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 590, marginTop: 2, color: person.color, fontFamily: "'Inter', system-ui, sans-serif" }}>{person.title}</div>
        <div style={{ fontSize: 11, color: '#8a9ab5', lineHeight: 1.5, marginTop: 6, fontStyle: 'italic', fontFamily: "'Inter', system-ui, sans-serif" }}>{person.note}</div>
      </div>
      <div style={{ height: 2, background: `linear-gradient(90deg, ${person.color}44, transparent)` }} />
    </div>
  )
}
