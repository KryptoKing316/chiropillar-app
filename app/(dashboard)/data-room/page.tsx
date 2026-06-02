// ChiroPillar · Data Room
// Live PDF library for Wagner/McGrath/Eric — the canonical strategy
// documents are stored under /public/data-room/ and rendered here with
// view + download links. Per-clinic data rooms remain Phase 3.

import Link from 'next/link'

export const dynamic = 'force-dynamic'

type Doc = {
  title: string
  oneLiner: string
  paragraph: string
  href: string
  fileName: string
  category: 'thesis' | 'brand' | 'product' | 'ecosystem'
  accent: string
}

const DOCS: Doc[] = [
  {
    title: 'Master Executive Summary',
    fileName: 'ChiroPillar_Master_Executive_Summary.pdf',
    href: '/data-room/ChiroPillar_Master_Executive_Summary.pdf',
    oneLiner: 'The 360° rollup thesis. Print it and hand it to any LP.',
    paragraph: 'The canonical ChiroPillar document. Covers the market opportunity ($8B US chiropractic, 70K DCs, 58% solo), the roll-up thesis (acquire at 2–3×, install playbook, exit at 8–10×), the partnership math with Dr. Wagner ($25M existing + $20M+ ChiroPillar bolt-on = $45M+ combined platform), the team, and the path to a $360–450M exit.',
    category: 'thesis',
    accent: '#C9A84C',
  },
  {
    title: 'Ecosystem Executive Summary',
    fileName: 'ChiroPillar_Ecosystem_Executive_Summary.pdf',
    href: '/data-room/ChiroPillar_Ecosystem_Executive_Summary.pdf',
    oneLiner: 'How the five engines compound into one platform.',
    paragraph: 'The ChiroPillar ecosystem operates five engines that feed each other: (1) Clinic Roll-Up at the core, (2) ChiroPillar Digital app + telehealth as the recurring-revenue layer, (3) Consulting + masterminds as lead generation, (4) Scale Services as a standalone revenue stream, and (5) Conferences + brand as the visibility flywheel. Each engine lowers customer-acquisition cost for the others and adds to the EBITDA that gets re-rated at exit.',
    category: 'ecosystem',
    accent: '#2E75B6',
  },
  {
    title: 'App + Telehealth Deep Dive',
    fileName: 'ChiroPillar_App_Telehealth_DeepDive.pdf',
    href: '/data-room/ChiroPillar_App_Telehealth_DeepDive.pdf',
    oneLiner: 'The ChiroPillar Digital product. AI triage, RTM billing, MRR layer.',
    paragraph: 'Detailed technical and business case for the consumer-facing ChiroPillar Digital app. Covers the freemium-to-$9/mo-to-$74/yr funnel, the AI back-pain triage flow, telehealth integration, RTM (Remote Therapeutic Monitoring) billing through partner providers, and the MRR layer that turns one-time chiropractic visits into a recurring patient relationship. Drives platform multiple expansion via SaaS-like revenue mix.',
    category: 'product',
    accent: '#9CC4E4',
  },
  {
    title: 'Brand Brief',
    fileName: 'ChiroPillar_Brand_Brief.pdf',
    href: '/data-room/ChiroPillar_Brand_Brief.pdf',
    oneLiner: 'The official brand guide. Logo, palette, voice, mascot system.',
    paragraph: 'The visual and verbal identity standard for ChiroPillar. Documents the column-mascot lockup, color palette (Deep Spine Blue, Align Blue, Column Stone, Globe Blue, Cheek Coral), typography (Playfair Display serif + Inter sans + JetBrains Mono), the "Strength in Alignment" tagline system, and brand-voice guidelines. Required reading before producing any chiropractor-facing or partner-facing collateral.',
    category: 'brand',
    accent: '#EBD8A6',
  },
]

const CAT_LABEL: Record<Doc['category'], string> = {
  thesis: '01 · Thesis',
  ecosystem: '02 · Ecosystem',
  product: '03 · Product',
  brand: '04 · Brand',
}

export default function DataRoomPage() {
  return (
    <div style={{
      padding: '40px 40px 80px', maxWidth: 1180, margin: '0 auto',
      fontFamily: "'Inter', system-ui, sans-serif", color: 'var(--kb-text)',
    }}>

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '6px 14px', borderRadius: 999,
          background: 'rgba(46,117,182,0.10)', border: '1px solid rgba(46,117,182,0.25)',
          fontFamily: "'JetBrains Mono', monospace", fontSize: 11,
          letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 700,
          color: 'var(--kb-accent)', marginBottom: 22,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--kb-accent)' }} />
          ChiroPillar · Data Room
        </div>

        <h1 style={{
          fontFamily: 'Georgia, "Playfair Display", serif',
          fontSize: 'clamp(34px, 4.5vw, 48px)', fontWeight: 700,
          letterSpacing: '-0.02em', lineHeight: 1.1, margin: '0 0 12px',
          color: 'var(--kb-text)',
        }}>
          Strategy library
        </h1>
        <p style={{
          fontSize: 17, lineHeight: 1.6, maxWidth: 780,
          color: 'var(--kb-text-secondary)', margin: 0,
        }}>
          The canonical ChiroPillar documents — thesis, ecosystem, product, brand. Click any tile to read in-browser or download. Per-clinic acquisition rooms (one per deal in flight) ship in Phase 3.
        </p>
      </div>

      {/* PDF tiles */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: 18, marginBottom: 40,
      }}>
        {DOCS.map(d => (
          <div key={d.href} style={{
            background: 'var(--kb-bg-panel)', border: `1px solid var(--kb-border)`,
            borderRadius: 14, padding: 24, display: 'flex', flexDirection: 'column',
            position: 'relative', overflow: 'hidden',
          }}>
            {/* Accent stripe */}
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: 3,
              background: `linear-gradient(90deg, ${d.accent} 0%, transparent 100%)`,
            }} />

            <div style={{
              fontFamily: "'JetBrains Mono', monospace", fontSize: 10,
              letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 700,
              color: d.accent, marginBottom: 14, marginTop: 4,
            }}>
              {CAT_LABEL[d.category]}
            </div>

            {/* PDF visual */}
            <div style={{
              width: 64, height: 80, marginBottom: 18,
              background: `linear-gradient(180deg, ${d.accent}22, ${d.accent}08)`,
              border: `1px solid ${d.accent}44`, borderRadius: 6,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              position: 'relative',
            }}>
              <div style={{
                fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: 800,
                color: d.accent, letterSpacing: '0.10em',
              }}>PDF</div>
              {/* Folded corner */}
              <div style={{
                position: 'absolute', top: 0, right: 0, width: 14, height: 14,
                background: `linear-gradient(225deg, ${d.accent}55 50%, transparent 50%)`,
              }} />
            </div>

            <h3 style={{
              fontFamily: 'Georgia, "Playfair Display", serif',
              fontSize: 22, fontWeight: 600, color: 'var(--kb-text)',
              margin: '0 0 6px', letterSpacing: '-0.01em', lineHeight: 1.2,
            }}>
              {d.title}
            </h3>
            <div style={{
              fontFamily: 'Georgia, serif', fontSize: 14,
              fontStyle: 'italic', fontWeight: 500,
              color: d.accent, marginBottom: 14, lineHeight: 1.45,
            }}>
              {d.oneLiner}
            </div>
            <p style={{
              fontSize: 13.5, color: 'var(--kb-text-secondary)',
              lineHeight: 1.65, margin: '0 0 20px', flex: 1,
            }}>
              {d.paragraph}
            </p>

            <div style={{
              fontFamily: "'JetBrains Mono', monospace", fontSize: 10,
              color: 'var(--kb-text-muted)', letterSpacing: '0.05em',
              marginBottom: 12, opacity: 0.7,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {d.fileName}
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <Link
                href={d.href} target="_blank" rel="noopener"
                style={{
                  flex: 1, padding: '11px 14px', borderRadius: 8,
                  background: d.accent, color: '#0B1B3E',
                  fontSize: 13, fontWeight: 700, textAlign: 'center',
                  textDecoration: 'none', fontFamily: "'Inter', system-ui, sans-serif",
                }}
              >
                View PDF →
              </Link>
              <a
                href={d.href} download
                title="Download"
                style={{
                  padding: '11px 16px', borderRadius: 8,
                  background: 'transparent', border: `1px solid ${d.accent}55`,
                  color: d.accent, fontSize: 14, fontWeight: 700,
                  textDecoration: 'none', fontFamily: "'Inter', system-ui, sans-serif",
                  display: 'flex', alignItems: 'center', gap: 4,
                }}
              >
                ↓ Download
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Per-clinic data rooms — Phase 3 marker */}
      <div style={{
        background: 'rgba(46,117,182,0.05)',
        border: '1px dashed rgba(46,117,182,0.30)',
        borderRadius: 14, padding: '24px 28px',
        display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 22, alignItems: 'center',
      }}>
        <div style={{
          width: 44, height: 44, borderRadius: 10,
          background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.30)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 20,
        }}>🔒</div>
        <div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 700, color: '#C9A84C', marginBottom: 6 }}>
            Per-clinic data rooms · Phase 3
          </div>
          <div style={{ fontSize: 15, color: 'var(--kb-text)', fontWeight: 500, marginBottom: 4 }}>
            One NDA-gated room per acquisition target in flight.
          </div>
          <div style={{ fontSize: 13, color: 'var(--kb-text-secondary)', lineHeight: 1.6 }}>
            Financials · tax returns · lease · malpractice records · license verifications · diligence checklist · access-controlled per user, watermarked downloads, full audit log. Ships once Wagner signs the partnership term sheet.
          </div>
        </div>
      </div>
    </div>
  )
}
