// PROMEDVA · Data Room
// Live PDF library for Wagner/McGrath/Eric — the canonical strategy
// documents are stored under /public/data-room/ and rendered here with
// view + download links. Above the library: clinic-financials upload
// drop zone + QuickBooks connect (both "coming soon" on click).

import Link from 'next/link'
import UploadZone from './UploadZone'

export const dynamic = 'force-dynamic'

type Doc = {
  title: string
  oneLiner: string
  paragraph: string
  href: string
  fileName: string
  category: 'thesis' | 'brand' | 'product' | 'ecosystem'
  accent: string
  cover: string                  // image to show at the top of the tile
  coverFit?: 'cover' | 'contain' // how to fit the image
  coverPosition?: string         // CSS object-position
}

const DOCS: Doc[] = [
  {
    title: 'Executive Summary — The Virginia Plan',
    fileName: 'ProMedVA_Executive_Summary_VA_Plan.pdf',
    href: '/data-room/ProMedVA_Executive_Summary_VA_Plan.pdf',
    oneLiner: 'The whole model on a few pages — lease now, acquire later.',
    paragraph: 'How PROMEDVA turns a chiropractor\'s overlooked goodwill into a quarter-million-a-year partnership and, eventually, a real exit. The goodwill trap, the two-phase model (Phase 1 lease: $10K/mo base + quarterly performance bonuses on hitting the metrics → ~$200K/yr + cash-service commission, up to ~$250K; Phase 2 acquire at 50% cash / 50% seller note + 4% profit share at a platform multiple), why Virginia first, and the lean Kingdom-Broker-managed two-city test.',
    category: 'thesis',
    accent: '#C9A84C',
    cover: '/data-room/cover-exec.svg',
    coverFit: 'cover',
    coverPosition: 'center center',
  },
  {
    title: 'Target Chiropractor ICP + Ad Copy',
    fileName: 'ProMedVA_Target_Chiropractor_ICP_and_Ad_Copy.pdf',
    href: '/data-room/ProMedVA_Target_Chiropractor_ICP_and_Ad_Copy.pdf',
    oneLiner: 'Exactly who we target — and compliance-clean ad copy ready to run.',
    paragraph: '"The Town\'s One Guy" — the dominant 45-60 Virginia chiropractor sitting on 20 years of uncashable goodwill. His pains in Dr. Wagner\'s own words, the ranked ad angles (retirement/college squeeze leads), and ready-to-run Meta ads, cold emails, and video hooks — all scrubbed for compliance (cash-only, no income guarantees, no medical claims, rollup hidden) — plus the Virginia targeting plan.',
    category: 'product',
    accent: '#2E75B6',
    cover: '/data-room/cover-icp.svg',
    coverFit: 'cover',
    coverPosition: 'center center',
  },
  {
    title: 'Virginia Rollout Plan + KPIs',
    fileName: 'ProMedVA_Virginia_Rollout_KPIs.pdf',
    href: '/data-room/ProMedVA_Virginia_Rollout_KPIs.pdf',
    oneLiner: 'One dominant partner per city. Two cities first, then scale.',
    paragraph: 'The city-by-city rollout: target the single dominant chiropractor in each Virginia market, start with a lean two-city test (Charlottesville + one metro), and the KPIs to run it — funnel conversion targets, ~$450 cost-per-qualified-application, the "good partner" qualification gate, and the reset month-1 success criteria.',
    category: 'ecosystem',
    accent: '#9CC4E4',
    cover: '/data-room/cover-rollout.svg',
    coverFit: 'cover',
    coverPosition: 'center center',
  },
  {
    title: 'Virginia Test — Engagement & Budget',
    fileName: 'ProMedVA_Test_Engagement_and_Budget.pdf',
    href: '/data-room/ProMedVA_Test_Engagement_and_Budget.pdf',
    oneLiner: 'The budget to get the first chiropractor office onboard — and the terms.',
    paragraph: 'The lean two-city test budget — a one-time $8K setup (platform/funnels already built + video) folded into month 1, then $5K/mo ads, lists/tooling, the team Eric hires, and a $3K/mo Kingdom Broker management fee. $19K month 1, then $11K/mo total. Plus Day-30/60 milestone off-ramps, objective Exhibit A definitions, and a success fee on signed lease partners (split — half on signing, half once the partnership goes live). Acquisition (Phase 2) kept separate: a one-time 4%-of-acquisition-value fee only if PROMEDVA later acquires a clinic.',
    category: 'brand',
    accent: '#2ECC8B',
    cover: '/data-room/cover-budget.svg',
    coverFit: 'cover',
    coverPosition: 'center center',
  },
]

const CAT_LABEL: Record<Doc['category'], string> = {
  thesis: '01 · The Plan',
  product: '02 · Target Customer',
  ecosystem: '03 · Rollout + KPIs',
  brand: '04 · Engagement + Budget',
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
          display: 'inline-flex', alignItems: 'center', gap: 10,
          padding: '8px 16px', borderRadius: 999,
          background: 'rgba(46,117,182,0.14)', border: '1px solid rgba(46,117,182,0.35)',
          fontFamily: "'JetBrains Mono', monospace", fontSize: 12.5,
          letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 800,
          color: '#9CC4E4', marginBottom: 22,
        }}>
          <span style={{ width: 8, height: 8, borderRadius: 999, background: '#9CC4E4', boxShadow: '0 0 8px #9CC4E4' }} />
          PROMEDVA · Data Room
        </div>

        <h1 style={{
          fontFamily: 'Georgia, "Playfair Display", serif',
          fontSize: 'clamp(36px, 4.5vw, 52px)', fontWeight: 700,
          letterSpacing: '-0.02em', lineHeight: 1.1, margin: '0 0 14px',
          color: 'var(--kb-text)',
        }}>
          Data Room
        </h1>
        <p style={{
          fontSize: 17, lineHeight: 1.6, maxWidth: 780,
          color: '#FFFFFF', margin: 0, fontWeight: 400,
        }}>
          Upload clinic financials, connect QuickBooks, or download the canonical PROMEDVA strategy documents. Per-clinic acquisition rooms ship in Phase 3.
        </p>
      </div>

      {/* ── UPLOAD ZONE + QUICKBOOKS CONNECT (interactive client component) ── */}
      <UploadZone />

      {/* Section divider for the strategy library */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 18,
        marginBottom: 26,
      }}>
        <div style={{
          fontFamily: "'JetBrains Mono', monospace", fontSize: 13,
          letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 800,
          color: '#C9A84C',
        }}>
          ★ Strategy library · canonical docs
        </div>
        <div style={{ flex: 1, height: 1, background: 'var(--kb-border)' }} />
      </div>

      {/* PDF tiles */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: 18, marginBottom: 40,
      }}>
        {DOCS.map(d => (
          <div key={d.href} style={{
            background: 'var(--kb-bg-panel)', border: `1px solid var(--kb-border)`,
            borderRadius: 14, display: 'flex', flexDirection: 'column',
            position: 'relative', overflow: 'hidden',
            boxShadow: '0 4px 24px rgba(0,0,0,0.20)',
          }}>
            {/* ── COVER IMAGE · 200px hero header per tile ────────────────── */}
            <div style={{
              position: 'relative', height: 200, overflow: 'hidden',
              background: `linear-gradient(135deg, ${d.accent}22, ${d.accent}08)`,
            }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={d.cover}
                alt={`${d.title} cover`}
                style={{
                  width: '100%', height: '100%', display: 'block',
                  objectFit: d.coverFit ?? 'cover',
                  objectPosition: d.coverPosition ?? 'center',
                }}
              />
              {/* Bottom-to-top gradient for category-label legibility */}
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(180deg, transparent 50%, rgba(11,27,62,0.85) 100%)',
                pointerEvents: 'none',
              }} />
              {/* Category eyebrow over the image */}
              <div style={{
                position: 'absolute', left: 18, bottom: 16,
                fontFamily: "'JetBrains Mono', monospace", fontSize: 12,
                letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 800,
                color: '#FFFFFF',
                textShadow: '0 2px 4px rgba(0,0,0,0.7)',
              }}>
                {CAT_LABEL[d.category]}
              </div>
              {/* Accent ribbon — top-right corner */}
              <div style={{
                position: 'absolute', top: 16, right: 16,
                padding: '6px 12px', borderRadius: 6,
                background: d.accent, color: '#0B1B3E',
                fontFamily: "'JetBrains Mono', monospace", fontSize: 11.5, fontWeight: 800,
                letterSpacing: '0.14em',
                boxShadow: `0 4px 12px ${d.accent}50`,
              }}>
                PDF
              </div>
            </div>

            {/* ── BODY ────────────────────────────────────────────────────── */}
            <div style={{ padding: 26, display: 'flex', flexDirection: 'column', flex: 1 }}>

            <h3 style={{
              fontFamily: 'Georgia, "Playfair Display", serif',
              fontSize: 24, fontWeight: 700, color: 'var(--kb-text)',
              margin: '0 0 8px', letterSpacing: '-0.01em', lineHeight: 1.2,
            }}>
              {d.title}
            </h3>
            <div style={{
              fontFamily: 'Georgia, serif', fontSize: 15.5,
              fontStyle: 'italic', fontWeight: 600,
              color: d.accent, marginBottom: 16, lineHeight: 1.45,
            }}>
              {d.oneLiner}
            </div>
            <p style={{
              fontSize: 14.5, color: '#FFFFFF',
              lineHeight: 1.65, margin: '0 0 22px', flex: 1, fontWeight: 400, opacity: 0.90,
            }}>
              {d.paragraph}
            </p>

            <div style={{
              fontFamily: "'JetBrains Mono', monospace", fontSize: 11.5,
              color: '#FFFFFF', letterSpacing: '0.05em',
              marginBottom: 14, opacity: 0.65, fontWeight: 600,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {d.fileName}
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <Link
                href={d.href} target="_blank" rel="noopener"
                style={{
                  flex: 1, padding: '13px 16px', borderRadius: 8,
                  background: d.accent, color: '#0B1B3E',
                  fontSize: 14, fontWeight: 800, textAlign: 'center',
                  textDecoration: 'none', fontFamily: "'Inter', system-ui, sans-serif",
                  letterSpacing: '0.02em', boxShadow: `0 4px 12px ${d.accent}30`,
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
            </div>{/* ← body */}
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
            Financials · tax returns · lease · malpractice records · license verifications · diligence checklist · access-controlled per user, watermarked downloads, full audit log. Ships in Phase 3.
          </div>
        </div>
      </div>
    </div>
  )
}
