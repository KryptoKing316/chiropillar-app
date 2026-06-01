'use client'

import { useState } from 'react'
import Link from 'next/link'
import { getCoverPhoto } from '@/lib/exchange'
import NDAModal from './nda-modal'
import SignModal from './sign-modal'
import type { PendingNdaRequest, SigStats, BuyerMatch } from './types'

type SignModalState = null | 'loi' | 'purchase_agreement' | 'custom'

type Deal = {
  id: string
  public_title: string
  public_summary?: string
  industry?: string
  city_region?: string
  state?: string
  revenue_band?: string
  ebitda_band?: string
  asking_price_band?: string
  years_in_business?: number
  team_size_band?: string
  private_business_name?: string
  private_owner_name?: string
  cim_pdf_path?: string
  ai_valuation_low?: number
  ai_valuation_mid?: number
  ai_valuation_high?: number
  ai_multiple_low?: number
  ai_multiple_high?: number
  ai_valuation_notes?: string
  status: string
  listed_at?: string
  coalition_firms?: { slug: string; firm_name: string; logo_url?: string; brand_primary?: string }
}

type ExtractionResult = {
  success: boolean
  extraction_time_ms: number
  pdf_size_mb: string
  business_summary: string
  industry: string
  avg_normalized_ebitda: number
  revenue_trend: string
  valuation_low: number
  valuation_mid: number
  valuation_high: number
  multiple_low: number
  multiple_high: number
  deal_structure: string
  extraction_confidence: string
  extraction_notes: string
  industry_notes: string
}

const fmt = (n?: number) => {
  if (n == null) return '—'
  if (n >= 1_000_000) return '$' + (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return '$' + Math.round(n / 1_000) + 'K'
  return '$' + n
}

export default function DealDetailClient({
  deal: initialDeal,
  isOwnFirm,
  isAdmin,
  pendingNdaRequests: initialPending,
  sigStats,
  initialMatches,
}: {
  deal: Deal
  isOwnFirm: boolean
  isAdmin: boolean
  pendingNdaRequests: PendingNdaRequest[]
  sigStats: SigStats
  initialMatches: BuyerMatch[]
}) {
  const [deal, setDeal] = useState<Deal>(initialDeal)
  const [extracting, setExtracting] = useState(false)
  const [result, setResult] = useState<ExtractionResult | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [publishing, setPublishing] = useState(false)
  const [pendingNdaRequests, setPendingNdaRequests] = useState<PendingNdaRequest[]>(initialPending)
  const [stats, setStats] = useState<SigStats>(sigStats)
  const [matching, setMatching] = useState(false)
  const [matches, setMatches] = useState<BuyerMatch[] | null>(initialMatches.length > 0 ? initialMatches : null)
  const [matchErr, setMatchErr] = useState<string | null>(null)
  const [matchRequested, setMatchRequested] = useState(false)

  const hasValuation = deal.ai_valuation_mid != null && deal.ai_valuation_mid > 0
  const coverPhoto = getCoverPhoto(deal.industry)
  const [ndaModalOpen, setNdaModalOpen] = useState(false)
  const [signModal, setSignModal] = useState<SignModalState>(null)

  async function handleNdaAction(ndaId: string, action: 'approve' | 'decline', reason?: string) {
    const res = await fetch(`/api/exchange/deals/${deal.id}/nda/${ndaId}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, reason }),
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      throw new Error(data.error || `${action} failed`)
    }
    setPendingNdaRequests((prev) => prev.filter((r) => r.id !== ndaId))
    if (action === 'approve') {
      setStats((s) => ({ ...s, nda: s.nda + 1 }))
    }
  }

  async function runBuyerMatching() {
    setMatching(true); setMatchErr(null); setMatches(null)
    try {
      const res = await fetch(`/api/exchange/deals/${deal.id}/match-buyers`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Match failed')
      setMatches(data.matches as BuyerMatch[])
    } catch (e) {
      setMatchErr(e instanceof Error ? e.message : 'Unknown error')
    } finally { setMatching(false) }
  }

  async function runExtraction() {
    setExtracting(true); setErr(null); setResult(null)
    try {
      const res = await fetch(`/api/exchange/deals/${deal.id}/extract`, { method: 'POST' })
      if (!res.ok) throw new Error((await res.json()).error || 'Extraction failed')
      const data = (await res.json()) as ExtractionResult
      setResult(data)
      setDeal({
        ...deal,
        ai_valuation_low: data.valuation_low,
        ai_valuation_mid: data.valuation_mid,
        ai_valuation_high: data.valuation_high,
        ai_multiple_low: data.multiple_low,
        ai_multiple_high: data.multiple_high,
      })
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Unknown error')
    } finally { setExtracting(false) }
  }

  async function publish() {
    if (!confirm('List this deal to the Exchange? All members will see the anonymized version.')) return
    setPublishing(true)
    try {
      const res = await fetch(`/api/exchange/deals/${deal.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'listed', listed_at: new Date().toISOString() }),
      })
      if (!res.ok) throw new Error('Publish failed')
      setDeal({ ...deal, status: 'listed' })
    } catch (e) { setErr(e instanceof Error ? e.message : 'Unknown error') }
    finally { setPublishing(false) }
  }

  return (
    <div style={pageStyle}>
      {/* HERO with industry cover photo */}
      <header style={headerStyle}>
        <div style={headerCoverWrapStyle}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={coverPhoto} alt={deal.industry ?? 'Deal'} style={headerCoverImgStyle} />
          <div style={headerCoverGradientStyle} />
        </div>

        <div style={headerInnerStyle}>
          <Link href="/exchange" style={backLinkStyle}>← Exchange</Link>

          <div style={headerRowStyle}>
            <div style={{ flex: 1 }}>
              <div style={kickerStyle}>
                {deal.coalition_firms?.firm_name ?? 'Exchange Deal'} · {deal.industry ?? 'Industry'}
              </div>
              <h1 style={titleStyle}>{deal.public_title}</h1>
              {deal.public_summary && <p style={summaryStyle}>{deal.public_summary}</p>}
            </div>
            <div style={statusBoxStyle}>
              <StatusPill status={deal.status} large />
            </div>
          </div>
        </div>
      </header>

      <main style={mainStyle}>
        {/* TOP-LEVEL METRICS BAND */}
        <section style={metricsBandStyle}>
          <MetricCard label="Revenue Band" value={deal.revenue_band || '—'} />
          <MetricCard label="EBITDA Band" value={deal.ebitda_band || '—'} />
          <MetricCard label="Asking Price" value={deal.asking_price_band || '—'} />
          <MetricCard label="Years In Biz" value={deal.years_in_business ? String(deal.years_in_business) : '—'} />
          <MetricCard label="Team Size" value={deal.team_size_band || '—'} />
          <MetricCard label="Location" value={[deal.city_region, deal.state].filter(Boolean).join(', ') || '—'} />
        </section>

        {/* AI VALUATION — magic moment */}
        <section style={hasValuation ? valuationActiveStyle : valuationPendingStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div style={kickerGoldStyle}>⚡ AI Valuation Engine</div>
              <h2 style={sectionTitleStyle}>NAICS-keyed valuation in ~60 seconds</h2>
              <p style={{ color: '#9BA8C0', fontSize: 14, margin: '4px 0 0', maxWidth: 540 }}>
                Proprietary KB multiples database across 25 industries. Reads CIM, normalizes EBITDA, applies industry-keyed comp range.
              </p>
            </div>
            {deal.cim_pdf_path && isOwnFirm && (
              <button onClick={runExtraction} disabled={extracting} style={ctaPrimaryStyle}>
                {extracting ? '⚡ Extracting...' : hasValuation ? 'Re-run Valuation' : 'Run AI Valuation'}
              </button>
            )}
          </div>

          {!deal.cim_pdf_path && isOwnFirm && (
            <div style={infoBoxStyle}>
              <strong style={{ color: '#C9A84C' }}>📄 No CIM uploaded yet.</strong> Upload a CIM PDF to unlock automatic valuation extraction.
            </div>
          )}

          {extracting && (
            <div style={extractingBoxStyle}>
              <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 22, color: '#C9A84C', marginBottom: 6 }}>
                ⚡ Extracting financials + running valuation...
              </div>
              <div style={{ color: '#9BA8C0', fontSize: 14 }}>Reading PDF · normalizing EBITDA · applying NAICS multiples</div>
              <div style={{ color: '#4A5880', fontSize: 12, marginTop: 14 }}>Typically completes in 30 to 60 seconds</div>
            </div>
          )}

          {err && (
            <div style={errorBoxStyle}>{err}</div>
          )}

          {(hasValuation || result) && !extracting && (
            <div>
              <div style={valuationGridStyle}>
                <ValBox label="Low" amount={result?.valuation_low ?? deal.ai_valuation_low} />
                <ValBox label="Mid (Most Likely)" amount={result?.valuation_mid ?? deal.ai_valuation_mid} primary />
                <ValBox label="High" amount={result?.valuation_high ?? deal.ai_valuation_high} />
              </div>

              <div style={valuationStatsRowStyle}>
                <Stat label="Multiple Range" value={`${result?.multiple_low ?? deal.ai_multiple_low}x – ${result?.multiple_high ?? deal.ai_multiple_high}x`} />
                {result && <Stat label="Avg Normalized EBITDA" value={fmt(result.avg_normalized_ebitda)} />}
                {result && <Stat label="Revenue Trend" value={result.revenue_trend} />}
                {result && <Stat label="Confidence" value={result.extraction_confidence} />}
              </div>

              {(result?.industry_notes || result?.deal_structure) && (
                <div style={notesBoxStyle}>
                  {result?.industry_notes && (
                    <div style={{ marginBottom: 8 }}>
                      <span style={{ color: '#C9A84C', fontWeight: 700, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Industry Note</span>
                      <div style={{ marginTop: 4 }}>{result.industry_notes}</div>
                    </div>
                  )}
                  {result?.deal_structure && (
                    <div style={{ marginBottom: 4 }}>
                      <span style={{ color: '#C9A84C', fontWeight: 700, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Recommended Structure</span>
                      <div style={{ marginTop: 4 }}>{result.deal_structure}</div>
                    </div>
                  )}
                  {result?.extraction_time_ms && (
                    <div style={{ color: '#4A5880', fontSize: 12, marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                      ⚡ Extracted in {(result.extraction_time_ms / 1000).toFixed(1)}s from {result.pdf_size_mb} MB CIM
                    </div>
                  )}
                </div>
              )}

              {!result && deal.ai_valuation_notes && (
                <div style={{ ...notesBoxStyle, whiteSpace: 'pre-wrap', fontSize: 13, color: '#9BA8C0' }}>
                  {deal.ai_valuation_notes}
                </div>
              )}
            </div>
          )}
        </section>

        {/* DOC ACTIVITY STATS — what's been sent + signed on this deal */}
        <section style={statsBandStyle}>
          <StatCard label="NDAs Approved" value={stats.nda} icon="🔒" />
          <StatCard label="LOIs Sent" value={stats.loi} icon="📝" />
          <StatCard label="Purchase Agreements" value={stats.purchase_agreement} icon="🤝" />
          <StatCard label="Custom Documents" value={stats.custom} icon="📎" />
        </section>

        {/* NDA APPROVAL QUEUE — source firm only, only if there are pending requests */}
        {isOwnFirm && pendingNdaRequests.length > 0 && (
          <section style={ndaQueueStyle}>
            <div style={{ marginBottom: 18 }}>
              <div style={kickerGoldStyle}>🔔 Action Required</div>
              <h2 style={sectionTitleStyle}>
                {pendingNdaRequests.length} Pending NDA Request{pendingNdaRequests.length === 1 ? '' : 's'}
              </h2>
              <p style={{ color: '#9BA8C0', fontSize: 14, margin: '4px 0 0', maxWidth: 600 }}>
                Other Exchange firms have requested NDA access to view full deal details. Review their buyer profile and approve or decline.
              </p>
            </div>
            <div style={{ display: 'grid', gap: 12 }}>
              {pendingNdaRequests.map((req) => (
                <NDAApprovalCard key={req.id} request={req} onAction={handleNdaAction} />
              ))}
            </div>
          </section>
        )}

        {/* AI BUYER MATCHING — source firm sees matches Eric ran. Only Eric can run the engine. */}
        {isOwnFirm && (
          <section style={hasValuation ? buyerMatchActiveStyle : valuationPendingStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
              <div>
                <div style={kickerGoldStyle}>🎯 KB Concierge · Buyer Matching</div>
                <h2 style={sectionTitleStyle}>
                  {isAdmin ? 'Match Buyers from KB Master Database (1,127+)' : 'Eric-Curated Buyer Matches'}
                </h2>
                <p style={{ color: '#9BA8C0', fontSize: 14, margin: '4px 0 0', maxWidth: 620 }}>
                  {isAdmin
                    ? 'Run Claude against the 1,127+ KB buyer database. Filtered by industry, geography, and check-size, then AI-ranked with reasoning.'
                    : 'Eric personally curates buyer matches against KB\'s proprietary 1,127+ buyer database (family offices, PE funds, search funds, strategics). Concierge service for active clients.'}
                </p>
              </div>
              {isAdmin && (
                <button onClick={runBuyerMatching} disabled={matching} style={ctaPrimaryStyle}>
                  {matching ? '⚡ Matching...' : matches ? 'Re-run Match' : 'Match Top 10 Buyers'}
                </button>
              )}
            </div>

            {matchErr && <div style={errorBoxStyle}>{matchErr}</div>}

            {matching && (
              <div style={extractingBoxStyle}>
                <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 22, color: '#C9A84C', marginBottom: 6 }}>
                  ⚡ Scanning buyer database + ranking with Claude...
                </div>
                <div style={{ color: '#9BA8C0', fontSize: 14 }}>Filtering by industry · geography · check-size fit</div>
              </div>
            )}

            {/* Matches exist — show to both Eric + client */}
            {matches && matches.length > 0 && !matching && (
              <div style={{ display: 'grid', gap: 12 }}>
                {matches.map((m) => <BuyerMatchCard key={m.id} match={m} />)}
              </div>
            )}

            {/* No matches yet + client (not admin) → show concierge CTA */}
            {(!matches || matches.length === 0) && !matching && !isAdmin && (
              <div style={conciergeCtaStyle}>
                {matchRequested ? (
                  <>
                    <div style={{ fontSize: 32, marginBottom: 12 }}>✓</div>
                    <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 22, margin: '0 0 8px', color: '#F2EEE7' }}>
                      Request Received
                    </h3>
                    <p style={{ color: '#9BA8C0', fontSize: 14, margin: '0 auto', maxWidth: 460, lineHeight: 1.6 }}>
                      Eric will run a curated match against the 1,127+ buyer database and post the results here within 24-48 hours. You&apos;ll get an email when ready.
                    </p>
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: 28, marginBottom: 12 }}>🔒</div>
                    <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 22, margin: '0 0 8px', color: '#F2EEE7' }}>
                      Concierge Match · By Request
                    </h3>
                    <p style={{ color: '#9BA8C0', fontSize: 14, margin: '0 auto 18px', maxWidth: 480, lineHeight: 1.6 }}>
                      Buyer matching is a curated concierge service. Eric personally vets buyer fit against your deal and posts the top 10 ranked matches here.
                    </p>
                    <a
                      href={`mailto:eric@kingdombroker.com?subject=Buyer Match Request · ${encodeURIComponent(deal.public_title)}&body=Hi Eric%2C%0A%0APlease run a buyer match for%3A%0A${encodeURIComponent(deal.public_title)}%0ADeal URL%3A ${typeof window !== 'undefined' ? window.location.href : ''}%0A%0AThanks.`}
                      onClick={() => setMatchRequested(true)}
                      style={{ ...ctaPrimaryStyle, textDecoration: 'none' }}
                    >
                      Request Match from Eric →
                    </a>
                  </>
                )}
              </div>
            )}

            {/* No matches + Eric viewing → simple hint */}
            {(!matches || matches.length === 0) && !matching && isAdmin && (
              <div style={infoBoxStyle}>
                No matches run yet. Click &quot;Match Top 10 Buyers&quot; above to score the database against this deal. Empty result usually means <code style={{ fontFamily: 'DM Mono, monospace' }}>exchange_buyers</code> isn&apos;t populated — run <code style={{ fontFamily: 'DM Mono, monospace' }}>scripts/migrate_buyers_to_supabase.py</code>.
              </div>
            )}
          </section>
        )}

        {/* 3-COLUMN: SIGNING ACTIONS + PRIVATE DATA + NEXT STEPS */}
        <section style={twoColStyle}>
          {/* SIGNING ACTIONS (DocuSeal flow) */}
          <div style={cardStyle}>
            <div style={kickerStyle}>Exchange Workflow</div>
            <h3 style={cardTitleStyle}>Sign Deal Documents</h3>
            <p style={{ color: '#9BA8C0', fontSize: 13, margin: '8px 0 18px', lineHeight: 1.55 }}>
              Send + sign NDA, LOI, or Purchase Agreement directly on DealExchange. Buyers and sellers sign on-platform via DocuSeal.
            </p>

            <div style={{ display: 'grid', gap: 10 }}>
              <SignButton icon="🔒" label="Send NDA" sublabel="Standard mutual NDA · KB template (auto-fills)" onClick={() => setNdaModalOpen(true)} />
              <SignButton icon="📝" label="Send LOI" sublabel="Upload your firm's Letter of Intent PDF" onClick={() => setSignModal('loi')} />
              <SignButton icon="🤝" label="Send Purchase Agreement" sublabel="Upload your firm's PA · Final close docs" onClick={() => setSignModal('purchase_agreement')} />
              <SignButton icon="📎" label="Send Custom Document" sublabel="Upload any PDF for signature (term sheet, side letter, etc)" onClick={() => setSignModal('custom')} />
            </div>
          </div>

          {/* PRIVATE DATA — own firm only */}
          {isOwnFirm ? (
            <div style={cardStyle}>
              <div style={kickerStyle}>🔒 Private · Your Firm Only</div>
              <h3 style={cardTitleStyle}>Confidential Details</h3>
              <p style={{ color: '#9BA8C0', fontSize: 13, margin: '8px 0 18px', lineHeight: 1.55 }}>
                Visible only to your firm + members with approved NDAs.
              </p>
              <Field label="Business Name" value={deal.private_business_name} />
              <Field label="Owner Name" value={deal.private_owner_name} />
              <Field label="CIM PDF" value={deal.cim_pdf_path ? '✓ Uploaded' : 'Not yet uploaded'} />
              <Field label="Listed" value={deal.listed_at ? new Date(deal.listed_at).toLocaleDateString() : 'Draft'} />
            </div>
          ) : (
            <div style={{ ...cardStyle, background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.25)' }}>
              <div style={kickerGoldStyle}>🔒 NDA-Locked</div>
              <h3 style={cardTitleStyle}>Want full details?</h3>
              <p style={{ color: '#9BA8C0', fontSize: 13, margin: '8px 0 18px', lineHeight: 1.55 }}>
                Request NDA to access business name, owner contact, CIM PDF, and full financials. {deal.coalition_firms?.firm_name} will approve or decline.
              </p>
              <button
                onClick={() => setNdaModalOpen(true)}
                style={{ ...ctaPrimaryStyle, width: '100%', textAlign: 'center' }}
              >
                Request NDA Access →
              </button>
            </div>
          )}
        </section>

        {/* PUBLISH ACTION */}
        {isOwnFirm && deal.status === 'draft' && (
          <section style={publishBannerStyle}>
            <div>
              <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 22, margin: '0 0 6px', color: '#F2EEE7' }}>
                Ready to publish?
              </h3>
              <p style={{ color: '#9BA8C0', fontSize: 14, margin: 0, maxWidth: 560 }}>
                When you list this deal, all Exchange members see the public fields. Private details stay locked until they NDA-request access.
              </p>
            </div>
            <button onClick={publish} disabled={publishing} style={ctaPrimaryStyle}>
              {publishing ? 'Publishing...' : 'List to Exchange →'}
            </button>
          </section>
        )}
      </main>

      {/* NDA Modal — opens for both own-firm (outbound to buyer) + visiting firm (request access) */}
      {ndaModalOpen && (
        <NDAModal
          dealId={deal.id}
          dealTitle={deal.public_title}
          sourceFirmName={deal.coalition_firms?.firm_name ?? 'Source Firm'}
          flow={isOwnFirm ? 'outbound' : 'request'}
          onClose={() => setNdaModalOpen(false)}
        />
      )}

      {/* Sign Modal — LOI / Purchase Agreement / Custom document upload + DocuSeal send */}
      {signModal && (
        <SignModal
          dealId={deal.id}
          dealTitle={deal.public_title}
          initialDocType={signModal}
          onClose={() => setSignModal(null)}
        />
      )}
    </div>
  )
}

// ─── COMPONENTS ────────────────────────────────────────────────────────────

function StatusPill({ status, large }: { status: string; large?: boolean }) {
  const colors: Record<string, { bg: string; text: string }> = {
    listed: { bg: 'rgba(46,125,79,0.18)', text: '#5fc28a' },
    matched: { bg: 'rgba(199,123,46,0.2)', text: '#e3a05a' },
    loi: { bg: 'rgba(80,140,230,0.18)', text: '#86b3f0' },
    closed: { bg: 'rgba(155,168,192,0.18)', text: '#cad4e6' },
    draft: { bg: 'rgba(155,168,192,0.1)', text: '#7d8ba5' },
  }
  const c = colors[status] ?? colors.draft
  return (
    <span style={{
      fontSize: large ? 11 : 10,
      fontWeight: 700,
      letterSpacing: '0.14em',
      textTransform: 'uppercase',
      padding: large ? '8px 14px' : '4px 10px',
      borderRadius: 999,
      background: c.bg,
      color: c.text,
      whiteSpace: 'nowrap',
    }}>{status}</span>
  )
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div style={metricCardStyle}>
      <div style={metricCardLabelStyle}>{label}</div>
      <div style={metricCardValueStyle}>{value}</div>
    </div>
  )
}

function ValBox({ label, amount, primary }: { label: string; amount?: number; primary?: boolean }) {
  return (
    <div style={primary ? valBoxPrimaryStyle : valBoxStyle}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: primary ? '#C9A84C' : '#9BA8C0', marginBottom: 10 }}>
        {label}
      </div>
      <div style={{
        fontFamily: "'Playfair Display', Georgia, serif",
        fontSize: primary ? 42 : 32,
        fontWeight: 700,
        color: primary ? '#C9A84C' : '#F2EEE7',
        letterSpacing: '-0.02em',
      }}>{fmt(amount)}</div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div style={statBoxStyle}>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9BA8C0', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 15, fontWeight: 600, color: '#F2EEE7', textTransform: 'capitalize' }}>{value}</div>
    </div>
  )
}

function Field({ label, value }: { label: string; value?: string }) {
  return (
    <div style={{ paddingBottom: 12, marginBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#9BA8C0', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 600, color: '#F2EEE7' }}>{value || '—'}</div>
    </div>
  )
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: string }) {
  return (
    <div style={statCardStyle}>
      <div style={{ fontSize: 22, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 28, fontWeight: 700, color: value > 0 ? '#C9A84C' : '#F2EEE7', lineHeight: 1, marginBottom: 6, letterSpacing: '-0.01em' }}>
        {value}
      </div>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#9BA8C0' }}>{label}</div>
    </div>
  )
}

function NDAApprovalCard({ request, onAction }: { request: PendingNdaRequest; onAction: (id: string, action: 'approve' | 'decline', reason?: string) => Promise<void> }) {
  const [busy, setBusy] = useState<'approve' | 'decline' | null>(null)
  const [showDecline, setShowDecline] = useState(false)
  const [declineReason, setDeclineReason] = useState('')
  const [err, setErr] = useState<string | null>(null)

  async function run(action: 'approve' | 'decline') {
    setBusy(action); setErr(null)
    try {
      await onAction(request.id, action, action === 'decline' ? declineReason : undefined)
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Action failed')
      setBusy(null)
    }
  }

  return (
    <div style={ndaCardStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap', marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#C9A84C', marginBottom: 6 }}>
            {request.requester_firm_name}
          </div>
          <div style={{ fontSize: 17, fontWeight: 600, color: '#F2EEE7', marginBottom: 2 }}>
            {request.requester_name}
          </div>
          <div style={{ fontSize: 13, color: '#9BA8C0' }}>
            {[request.requester_title, request.requester_email].filter(Boolean).join(' · ')}
          </div>
        </div>
        <div style={{ fontSize: 11, color: '#4A5880', textAlign: 'right' }}>
          Requested<br/>
          <span style={{ color: '#9BA8C0' }}>{new Date(request.requested_at).toLocaleDateString()}</span>
        </div>
      </div>

      {request.buyer_profile && (
        <div style={{ background: 'rgba(11,27,62,0.55)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '12px 16px', marginBottom: 14, fontSize: 13, color: '#cdd6e8', lineHeight: 1.55 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#9BA8C0', marginBottom: 6 }}>Buyer Profile</div>
          {request.buyer_profile}
        </div>
      )}

      {err && <div style={{ ...errorBoxStyle, marginBottom: 12 }}>{err}</div>}

      {showDecline ? (
        <div style={{ display: 'grid', gap: 10 }}>
          <textarea
            value={declineReason}
            onChange={(e) => setDeclineReason(e.target.value)}
            placeholder="Reason for declining (optional, shared with requester)"
            rows={2}
            style={{ width: '100%', padding: '10px 14px', background: 'rgba(11,27,62,0.6)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, color: '#F2EEE7', fontSize: 14, fontFamily: 'inherit', resize: 'vertical', outline: 'none' }}
          />
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => run('decline')} disabled={busy !== null} style={{ ...declineBtnStyle, flex: 1 }}>
              {busy === 'decline' ? 'Declining...' : 'Confirm Decline'}
            </button>
            <button onClick={() => { setShowDecline(false); setDeclineReason('') }} disabled={busy !== null} style={ghostBtnStyle}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => run('approve')} disabled={busy !== null} style={{ ...approveBtnStyle, flex: 1 }}>
            {busy === 'approve' ? 'Approving + Sending NDA...' : '✓ Approve + Send NDA'}
          </button>
          <button onClick={() => setShowDecline(true)} disabled={busy !== null} style={ghostBtnStyle}>
            Decline
          </button>
        </div>
      )}
    </div>
  )
}

function BuyerMatchCard({ match }: { match: BuyerMatch }) {
  const checkRange =
    match.check_size_min && match.check_size_max
      ? `${fmt(match.check_size_min)} – ${fmt(match.check_size_max)}`
      : null
  return (
    <div style={buyerMatchCardStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 14, marginBottom: 10, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: '#F2EEE7', marginBottom: 4 }}>{match.firm_name}</div>
          <div style={{ fontSize: 13, color: '#9BA8C0' }}>
            {[match.buyer_type, [match.hq_city, match.hq_state].filter(Boolean).join(', ')].filter(Boolean).join(' · ')}
          </div>
          {match.contact_name && (
            <div style={{ fontSize: 12, color: '#9BA8C0', marginTop: 6 }}>
              {match.contact_name}{match.contact_email && <> · <span style={{ color: '#C9A84C' }}>{match.contact_email}</span></>}
            </div>
          )}
        </div>
        <div style={{ textAlign: 'center', padding: '8px 14px', background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.3)', borderRadius: 10, minWidth: 76 }}>
          <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 26, fontWeight: 700, color: '#C9A84C', lineHeight: 1 }}>{match.fit_score}</div>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#9BA8C0', marginTop: 4 }}>Fit Score</div>
        </div>
      </div>

      {(match.industries?.length || checkRange) && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
          {checkRange && (
            <span style={pillStyle}>{checkRange}</span>
          )}
          {(match.industries ?? []).slice(0, 5).map((ind) => (
            <span key={ind} style={pillStyle}>{ind}</span>
          ))}
        </div>
      )}

      <div style={{ fontSize: 13, color: '#cdd6e8', lineHeight: 1.55, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#C9A84C', marginRight: 8 }}>Why this match</span>
        {match.reasoning}
      </div>
    </div>
  )
}

function SignButton({ icon, label, sublabel, onClick }: { icon: string; label: string; sublabel: string; onClick: () => void }) {
  return (
    <button onClick={onClick} style={signButtonStyle}>
      <span style={{ fontSize: 22 }}>{icon}</span>
      <div style={{ flex: 1, textAlign: 'left' }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#F2EEE7' }}>{label}</div>
        <div style={{ fontSize: 12, color: '#9BA8C0', marginTop: 2 }}>{sublabel}</div>
      </div>
      <span style={{ color: '#C9A84C', fontSize: 18 }}>→</span>
    </button>
  )
}

// ─── STYLES ────────────────────────────────────────────────────────────────

const pageStyle: React.CSSProperties = {
  minHeight: '100vh',
  background: 'linear-gradient(180deg, #0a1730 0%, #0b1b3e 100%)',
  color: '#F2EEE7',
  fontFamily: "'Inter', 'DM Sans', system-ui, sans-serif",
}

const headerStyle: React.CSSProperties = {
  position: 'relative',
  overflow: 'hidden',
  background: '#0F2347',
  borderBottom: '1px solid rgba(255,255,255,0.06)',
}

const headerCoverWrapStyle: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  zIndex: 0,
}

const headerCoverImgStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  opacity: 0.35,
}

const headerCoverGradientStyle: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  background: 'linear-gradient(135deg, rgba(11,27,62,0.6) 0%, rgba(15,35,71,0.82) 60%, rgba(11,27,62,0.94) 100%)',
}

const headerInnerStyle: React.CSSProperties = {
  position: 'relative',
  zIndex: 1,
  maxWidth: 1280,
  margin: '0 auto',
  padding: '32px 32px 44px',
}

const backLinkStyle: React.CSSProperties = {
  display: 'inline-block',
  fontSize: 12,
  fontWeight: 600,
  color: '#C9A84C',
  textDecoration: 'none',
  marginBottom: 18,
  letterSpacing: '0.02em',
}

const headerRowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: 24,
  flexWrap: 'wrap',
}

const kickerStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
  color: '#9BA8C0',
  marginBottom: 10,
}

const kickerGoldStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
  color: '#C9A84C',
  marginBottom: 10,
}

const titleStyle: React.CSSProperties = {
  fontFamily: "'Playfair Display', Georgia, serif",
  fontSize: 42,
  fontWeight: 700,
  lineHeight: 1.1,
  letterSpacing: '-0.02em',
  margin: '0 0 12px',
  color: '#F2EEE7',
  maxWidth: 780,
}

const summaryStyle: React.CSSProperties = {
  fontSize: 16,
  color: '#9BA8C0',
  lineHeight: 1.55,
  margin: 0,
  maxWidth: 680,
}

const statusBoxStyle: React.CSSProperties = {
  paddingTop: 4,
}

const mainStyle: React.CSSProperties = {
  maxWidth: 1280,
  margin: '0 auto',
  padding: '40px 32px 80px',
}

const metricsBandStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
  gap: 1,
  marginBottom: 36,
  background: 'rgba(255,255,255,0.06)',
  borderRadius: 14,
  overflow: 'hidden',
  border: '1px solid rgba(255,255,255,0.06)',
}

const metricCardStyle: React.CSSProperties = {
  background: '#0B1B3E',
  padding: '18px 22px',
}

const metricCardLabelStyle: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  color: '#9BA8C0',
  marginBottom: 6,
}

const metricCardValueStyle: React.CSSProperties = {
  fontSize: 17,
  fontWeight: 700,
  color: '#F2EEE7',
  letterSpacing: '-0.01em',
}

const valuationActiveStyle: React.CSSProperties = {
  background: 'linear-gradient(140deg, rgba(201,168,76,0.06) 0%, rgba(15,35,71,0.4) 100%)',
  border: '1px solid rgba(201,168,76,0.32)',
  borderRadius: 16,
  padding: '32px 32px',
  marginBottom: 36,
}

const valuationPendingStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.025)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 16,
  padding: '32px 32px',
  marginBottom: 36,
}

const sectionTitleStyle: React.CSSProperties = {
  fontFamily: "'Playfair Display', Georgia, serif",
  fontSize: 26,
  fontWeight: 700,
  lineHeight: 1.2,
  margin: 0,
  color: '#F2EEE7',
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
  whiteSpace: 'nowrap',
}

const infoBoxStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 10,
  padding: '14px 18px',
  color: '#9BA8C0',
  fontSize: 14,
}

const extractingBoxStyle: React.CSSProperties = {
  background: 'rgba(201,168,76,0.06)',
  border: '1px solid rgba(201,168,76,0.3)',
  borderRadius: 12,
  padding: '32px 28px',
  textAlign: 'center',
}

const errorBoxStyle: React.CSSProperties = {
  background: 'rgba(168,51,46,0.12)',
  border: '1px solid rgba(168,51,46,0.45)',
  borderRadius: 10,
  padding: '14px 18px',
  color: '#f0a0a0',
  fontSize: 14,
}

const valuationGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: 14,
  marginBottom: 24,
}

const valBoxStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 14,
  padding: '22px 22px',
  textAlign: 'center',
}

const valBoxPrimaryStyle: React.CSSProperties = {
  ...valBoxStyle,
  background: 'rgba(201,168,76,0.08)',
  border: '2px solid #C9A84C',
  boxShadow: '0 8px 32px rgba(201,168,76,0.18)',
}

const valuationStatsRowStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
  gap: 10,
}

const statBoxStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.025)',
  border: '1px solid rgba(255,255,255,0.06)',
  borderRadius: 10,
  padding: '12px 16px',
}

const notesBoxStyle: React.CSSProperties = {
  marginTop: 18,
  background: 'rgba(11,27,62,0.6)',
  border: '1px solid rgba(255,255,255,0.06)',
  borderRadius: 10,
  padding: '16px 20px',
  fontSize: 13,
  color: '#cdd6e8',
  lineHeight: 1.6,
}

const twoColStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
  gap: 20,
  marginBottom: 24,
}

const cardStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.025)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 14,
  padding: '26px 26px',
}

const cardTitleStyle: React.CSSProperties = {
  fontFamily: "'Playfair Display', Georgia, serif",
  fontSize: 22,
  fontWeight: 700,
  lineHeight: 1.2,
  margin: 0,
  color: '#F2EEE7',
}

const signButtonStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 14,
  width: '100%',
  padding: '14px 16px',
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 10,
  cursor: 'pointer',
  textAlign: 'left',
  transition: 'background 160ms ease, border-color 160ms ease',
}

const statsBandStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
  gap: 12,
  marginBottom: 36,
}

const statCardStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.025)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 12,
  padding: '20px 22px',
  textAlign: 'center',
}

const ndaQueueStyle: React.CSSProperties = {
  background: 'linear-gradient(140deg, rgba(201,168,76,0.06) 0%, rgba(15,35,71,0.4) 100%)',
  border: '1px solid rgba(201,168,76,0.32)',
  borderRadius: 16,
  padding: '28px 30px',
  marginBottom: 36,
}

const ndaCardStyle: React.CSSProperties = {
  background: 'rgba(11,27,62,0.6)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 12,
  padding: '20px 22px',
}

const buyerMatchActiveStyle: React.CSSProperties = {
  background: 'linear-gradient(140deg, rgba(201,168,76,0.04) 0%, rgba(15,35,71,0.4) 100%)',
  border: '1px solid rgba(201,168,76,0.22)',
  borderRadius: 16,
  padding: '32px 32px',
  marginBottom: 36,
}

const buyerMatchCardStyle: React.CSSProperties = {
  background: 'rgba(11,27,62,0.6)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 12,
  padding: '18px 22px',
}

const pillStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  padding: '4px 10px',
  borderRadius: 999,
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.1)',
  color: '#9BA8C0',
  letterSpacing: '0.02em',
}

const approveBtnStyle: React.CSSProperties = {
  padding: '11px 18px',
  background: '#C9A84C',
  color: '#0B1B3E',
  fontWeight: 700,
  fontSize: 13,
  borderRadius: 8,
  border: 'none',
  cursor: 'pointer',
  letterSpacing: '0.01em',
}

const declineBtnStyle: React.CSSProperties = {
  padding: '11px 18px',
  background: 'rgba(168,51,46,0.85)',
  color: '#F2EEE7',
  fontWeight: 700,
  fontSize: 13,
  borderRadius: 8,
  border: 'none',
  cursor: 'pointer',
  letterSpacing: '0.01em',
}

const ghostBtnStyle: React.CSSProperties = {
  padding: '11px 18px',
  background: 'rgba(255,255,255,0.04)',
  color: '#F2EEE7',
  fontWeight: 600,
  fontSize: 13,
  borderRadius: 8,
  border: '1px solid rgba(255,255,255,0.12)',
  cursor: 'pointer',
}

const conciergeCtaStyle: React.CSSProperties = {
  textAlign: 'center',
  padding: '32px 28px',
  background: 'rgba(11,27,62,0.55)',
  border: '1px dashed rgba(201,168,76,0.35)',
  borderRadius: 14,
}

const publishBannerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: 24,
  flexWrap: 'wrap',
  background: 'linear-gradient(135deg, rgba(201,168,76,0.1) 0%, rgba(15,35,71,0.5) 100%)',
  border: '1px solid rgba(201,168,76,0.3)',
  borderRadius: 14,
  padding: '24px 28px',
  marginBottom: 24,
}
