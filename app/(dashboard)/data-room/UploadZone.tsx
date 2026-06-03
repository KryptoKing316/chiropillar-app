'use client'

// Data Room upload zone + QuickBooks connect.
//
// Behavior:
//   · Drop a PDF (tax return / P&L / bank statement) → POST /api/extract-financials
//     → Claude extracts revenue / EBITDA / owner_comp / add-backs → results render
//     inline with a "Use this for Valuation" button.
//   · QuickBooks connect → still Phase 3 (shows inline notice).
//   · If ANTHROPIC_API_KEY isn't set in the deployment, falls back to a polished
//     "Coming Soon" notice so the demo doesn't break.

import { useState, useRef, useCallback } from 'react'
import Link from 'next/link'

type ExtractedYear = {
  year: number | null
  revenue: number | null
  ebitda: number | null
  owner_compensation: number | null
  net_income: number | null
}
type ExtractedAddBack = { label: string; amount: number; reason: string; confidence: 'high' | 'medium' | 'low' }
type Extraction = {
  doc_type: string
  practice_name: string | null
  years: ExtractedYear[]
  suggested_add_backs: ExtractedAddBack[]
  notes: string[]
  confidence_score: number
}

type Toast = { kind: 'qb' | 'soon-upload'; visible: boolean }

const fmtMoney = (n: number | null): string => {
  if (n == null) return '—'
  if (n >= 1_000_000) return '$' + (n / 1_000_000).toFixed(2) + 'M'
  if (n >= 1_000) return '$' + Math.round(n / 1_000) + 'K'
  return '$' + Math.round(n)
}

export default function UploadZone() {
  const [dragOver, setDragOver] = useState(false)
  const [toast, setToast] = useState<Toast>({ kind: 'soon-upload', visible: false })
  const [extracting, setExtracting] = useState(false)
  const [extracted, setExtracted] = useState<Extraction | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const folderInputRef = useRef<HTMLInputElement>(null)

  const flashToast = useCallback((kind: Toast['kind']) => {
    setToast({ kind, visible: true })
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 7000)
  }, [])

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return
    const file = files[0]
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setError('Only PDF files are supported. CSV + Excel ship in Phase 3.')
      return
    }
    setError(null)
    setExtracted(null)
    setFileName(file.name)
    setExtracting(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/extract-financials', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) {
        if (data.coming_soon) {
          flashToast('soon-upload')
          setFileName(null)
        } else {
          setError(data.error || 'Extraction failed.')
        }
        setExtracting(false)
        return
      }
      setExtracted(data.extracted as Extraction)
      setExtracting(false)
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      setError('Network error: ' + msg)
      setExtracting(false)
    }
  }, [flashToast])

  const onDragOver  = (e: React.DragEvent) => { e.preventDefault(); setDragOver(true) }
  const onDragLeave = (e: React.DragEvent) => { e.preventDefault(); setDragOver(false) }
  const onDrop      = (e: React.DragEvent) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files) }
  const onPick      = (e: React.ChangeEvent<HTMLInputElement>) => { handleFiles(e.target.files); e.target.value = '' }

  return (
    <div style={{ marginBottom: 36 }}>
      <div style={{
        fontFamily: "'JetBrains Mono', monospace", fontSize: 11,
        letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 700,
        color: 'var(--kb-accent)', marginBottom: 12,
      }}>
        Clinic financial uploads · AI extraction
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: 'minmax(0,2fr) minmax(0,1fr)',
        gap: 16,
      }} className="kb-upload-grid">

        {/* ── DROP ZONE · live AI extraction ───────────────────────────── */}
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => !extracting && fileInputRef.current?.click()}
          style={{
            background: dragOver
              ? 'linear-gradient(135deg, rgba(46,117,182,0.16), rgba(201,168,76,0.10))'
              : 'linear-gradient(135deg, rgba(46,117,182,0.06), rgba(201,168,76,0.03))',
            border: `2px dashed ${dragOver ? '#2E75B6' : 'rgba(46,117,182,0.35)'}`,
            borderRadius: 14, padding: '36px 32px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            cursor: extracting ? 'wait' : 'pointer', transition: 'all 0.2s',
            minHeight: 240,
          }}
        >
          {extracting ? (
            <>
              <div style={{
                width: 56, height: 56, marginBottom: 16,
                border: '4px solid rgba(46,117,182,0.20)',
                borderTopColor: '#C9A84C',
                borderRadius: '50%',
                animation: 'kb-spin 0.8s linear infinite',
              }} />
              <div style={{ fontFamily: 'Georgia, "Playfair Display", serif', fontSize: 22, fontWeight: 600, color: 'var(--kb-text)', marginBottom: 6, textAlign: 'center', letterSpacing: '-0.01em' }}>
                Claude is reading the PDF…
              </div>
              <div style={{ fontSize: 13, color: 'var(--kb-text-secondary)', textAlign: 'center', maxWidth: 440 }}>
                Extracting revenue, EBITDA, owner comp, and flagging add-backs. ~10-30 sec.
              </div>
              {fileName && (
                <div style={{ marginTop: 14, fontSize: 12, color: 'var(--kb-text-muted)', fontFamily: "'JetBrains Mono', monospace" }}>{fileName}</div>
              )}
            </>
          ) : (
            <>
              <div style={{ marginBottom: 16 }}>
                <svg viewBox="0 0 64 64" width="56" height="56" fill="none" stroke="#2E75B6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 44a10 10 0 0 1 2-19.8A14 14 0 0 1 46 22a10 10 0 0 1 2 22" />
                  <path d="M32 30v18" />
                  <polyline points="24,38 32,30 40,38" />
                </svg>
              </div>
              <div style={{ fontFamily: 'Georgia, "Playfair Display", serif', fontSize: 22, fontWeight: 600, color: 'var(--kb-text)', marginBottom: 6, textAlign: 'center', letterSpacing: '-0.01em' }}>
                Drop tax returns, P&Ls, bank statements
              </div>
              <div style={{ fontSize: 14, color: 'var(--kb-text-secondary)', textAlign: 'center', marginBottom: 18, maxWidth: 440 }}>
                Claude extracts financials, normalizes EBITDA, identifies add-backs, prices against nearly 200 chiropractic deals analyzed.
              </div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click() }}
                  style={{
                    padding: '11px 22px', borderRadius: 8, border: 'none',
                    background: '#2E75B6', color: '#F2EEE7',
                    fontFamily: "'Inter', system-ui, sans-serif",
                    fontSize: 13, fontWeight: 700, cursor: 'pointer',
                  }}
                >
                  Choose PDF
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); folderInputRef.current?.click() }}
                  style={{
                    padding: '11px 22px', borderRadius: 8,
                    background: 'transparent', border: '1px solid rgba(46,117,182,0.40)',
                    color: '#9CC4E4',
                    fontFamily: "'Inter', system-ui, sans-serif",
                    fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  Choose Folder
                </button>
              </div>
            </>
          )}
          <input ref={fileInputRef}   type="file" accept=".pdf"               onChange={onPick} style={{ display: 'none' }} />
          <input ref={folderInputRef} type="file" multiple
            // @ts-expect-error · webkitdirectory enables folder picker
            webkitdirectory="" directory=""
            onChange={onPick} style={{ display: 'none' }} />
        </div>

        {/* ── QUICKBOOKS CONNECT ────────────────────────────────────────── */}
        <button
          type="button"
          onClick={() => flashToast('qb')}
          style={{
            background: 'var(--kb-bg-panel)', border: '1px solid var(--kb-border)',
            borderRadius: 14, padding: 24, cursor: 'pointer',
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            textAlign: 'left', minHeight: 240,
            fontFamily: "'Inter', system-ui, sans-serif", color: 'var(--kb-text)',
          }}
        >
          <div>
            <div style={{
              width: 56, height: 56, borderRadius: 14,
              background: '#2CA01C',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'Arial, sans-serif', fontWeight: 800, fontSize: 22, color: 'white',
              marginBottom: 16,
              boxShadow: '0 4px 12px rgba(44,160,28,0.30)',
            }}>QB</div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 700, color: '#2CA01C', marginBottom: 8 }}>
              Live Integration
            </div>
            <div style={{ fontFamily: 'Georgia, serif', fontSize: 20, fontWeight: 600, color: 'var(--kb-text)', marginBottom: 8, lineHeight: 1.2 }}>
              Connect QuickBooks
            </div>
            <div style={{ fontSize: 13, color: 'var(--kb-text-secondary)', lineHeight: 1.5 }}>
              One-click sync of clinic books. Revenue, COGS, owner comp, add-backs — pulled directly, refreshed daily.
            </div>
          </div>
          <div style={{
            marginTop: 18, padding: '10px 14px', borderRadius: 8,
            background: 'rgba(44,160,28,0.10)', border: '1px solid rgba(44,160,28,0.30)',
            color: '#2CA01C', fontSize: 13, fontWeight: 700, textAlign: 'center',
          }}>
            Connect QuickBooks →
          </div>
        </button>
      </div>

      {/* ── EXTRACTION RESULT CARD ──────────────────────────────────────── */}
      {extracted && <ExtractionCard ex={extracted} fileName={fileName} />}

      {/* ── ERROR NOTICE ────────────────────────────────────────────────── */}
      {error && (
        <div style={{
          marginTop: 14, padding: '12px 18px',
          background: 'rgba(231,76,60,0.10)', border: '1px solid rgba(231,76,60,0.30)',
          borderRadius: 10, fontSize: 13, color: '#E74C3C', fontFamily: "'Inter', system-ui, sans-serif",
        }}>
          <strong>Upload error:</strong> {error}
        </div>
      )}

      {/* ── "COMING SOON" TOAST (only for QB or when API key missing) ───── */}
      {toast.visible && (
        <div
          role="status"
          style={{
            marginTop: 16,
            background: toast.kind === 'qb'
              ? 'linear-gradient(135deg, rgba(44,160,28,0.10), rgba(44,160,28,0.04))'
              : 'linear-gradient(135deg, rgba(201,168,76,0.14), rgba(201,168,76,0.04))',
            border: `1px solid ${toast.kind === 'qb' ? 'rgba(44,160,28,0.40)' : 'rgba(201,168,76,0.40)'}`,
            borderRadius: 12, padding: '16px 22px',
            display: 'flex', alignItems: 'center', gap: 14,
            fontFamily: "'Inter', system-ui, sans-serif",
            animation: 'kb-fadeIn 0.25s ease',
          }}
        >
          <span style={{
            padding: '4px 10px', borderRadius: 999,
            background: toast.kind === 'qb' ? '#2CA01C' : '#C9A84C',
            color: '#0B1B3E',
            fontFamily: "'JetBrains Mono', monospace", fontSize: 10, fontWeight: 800,
            letterSpacing: '0.16em', textTransform: 'uppercase',
          }}>
            {toast.kind === 'qb' ? 'QB Sync' : 'AI Extraction'} · Coming Soon
          </span>
          <div style={{ flex: 1, fontSize: 14, color: 'var(--kb-text)', lineHeight: 1.55 }}>
            {toast.kind === 'qb'
              ? <>QuickBooks OAuth + automatic financial sync ships in <strong style={{ color: '#2CA01C' }}>Phase 3</strong> alongside the per-clinic data room.</>
              : <>AI extraction requires the Anthropic API key in the deployment env. Will be wired in <strong style={{ color: '#C9A84C' }}>Phase 2</strong>.</>}
          </div>
        </div>
      )}

      <style>{`
        @keyframes kb-fadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes kb-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @media (max-width: 880px) {
          .kb-upload-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}

// ────────────────────────────────────────────────────────────────────────
//                       EXTRACTION RESULT CARD
// ────────────────────────────────────────────────────────────────────────
function ExtractionCard({ ex, fileName }: { ex: Extraction; fileName: string | null }) {
  const recent = ex.years[0]
  const totalAddBacks = ex.suggested_add_backs.reduce((s, a) => s + (a.amount || 0), 0)

  // Build the prefill URL for /valuation — passes practice info + financials + add-backs
  const params = new URLSearchParams()
  if (ex.practice_name) params.set('practice_name', ex.practice_name)
  if (recent?.year) params.set('year', String(recent.year))
  if (recent?.revenue) params.set('revenue', String(recent.revenue))
  if (recent?.ebitda) params.set('ebitda', String(recent.ebitda))
  if (recent?.owner_compensation) params.set('owner_comp', String(recent.owner_compensation))
  const prefillUrl = `/valuation?${params.toString()}`

  return (
    <div style={{
      marginTop: 16,
      background: 'linear-gradient(135deg, rgba(46,204,139,0.10), rgba(46,204,139,0.04))',
      border: '1px solid rgba(46,204,139,0.35)',
      borderRadius: 14, padding: '22px 26px',
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
        <div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 800, color: '#2ECC8B', marginBottom: 4 }}>
            ✓ Claude extracted · confidence {ex.confidence_score}/10
          </div>
          <div style={{ fontFamily: 'Georgia, serif', fontSize: 20, fontWeight: 600, color: 'var(--kb-text)' }}>
            {ex.practice_name || '(unnamed practice)'}
          </div>
          {fileName && <div style={{ fontSize: 11, color: 'var(--kb-text-muted)', fontFamily: "'JetBrains Mono', monospace", marginTop: 2 }}>{fileName} · {ex.doc_type.replace('_', ' ')}</div>}
        </div>
        <Link
          href={prefillUrl}
          style={{
            padding: '10px 18px', borderRadius: 8, background: '#C9A84C',
            color: '#0B1B3E', fontSize: 13, fontWeight: 800,
            textDecoration: 'none', letterSpacing: '0.04em',
          }}
        >
          Use for Valuation →
        </Link>
      </div>

      {/* Years grid */}
      {ex.years.length > 0 && (
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.14em', color: 'var(--kb-text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: 10 }}>
            Financial summary
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '70px 1fr 1fr 1fr', gap: 12, padding: '8px 12px', borderBottom: '1px solid var(--kb-border)', fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.10em', color: 'var(--kb-text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
            <span>Year</span>
            <span style={{ textAlign: 'right' }}>Revenue</span>
            <span style={{ textAlign: 'right' }}>EBITDA</span>
            <span style={{ textAlign: 'right' }}>Owner Comp</span>
          </div>
          {ex.years.map((y, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '70px 1fr 1fr 1fr', gap: 12, padding: '10px 12px', fontSize: 13, alignItems: 'baseline' }}>
              <span style={{ color: '#C9A84C', fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>{y.year ?? '—'}</span>
              <span style={{ textAlign: 'right', color: 'var(--kb-text)', fontWeight: 600 }}>{fmtMoney(y.revenue)}</span>
              <span style={{ textAlign: 'right', color: '#2ECC8B', fontWeight: 600 }}>{fmtMoney(y.ebitda)}</span>
              <span style={{ textAlign: 'right', color: 'var(--kb-text-secondary)' }}>{fmtMoney(y.owner_compensation)}</span>
            </div>
          ))}
        </div>
      )}

      {/* Add-backs */}
      {ex.suggested_add_backs.length > 0 && (
        <div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.14em', color: 'var(--kb-text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: 10 }}>
            Suggested add-backs · +{fmtMoney(totalAddBacks)}
          </div>
          {ex.suggested_add_backs.map((a, i) => (
            <div key={i} style={{ padding: '10px 12px', marginBottom: 6, borderRadius: 8, background: 'rgba(46,204,139,0.06)', border: '1px solid rgba(46,204,139,0.20)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--kb-text)' }}>{a.label}</span>
                <span style={{ display: 'flex', gap: 10, alignItems: 'baseline' }}>
                  <span style={{
                    fontFamily: "'JetBrains Mono', monospace", fontSize: 9, padding: '2px 7px',
                    borderRadius: 4, fontWeight: 700, letterSpacing: '0.08em',
                    background: a.confidence === 'high' ? 'rgba(46,204,139,0.15)' : a.confidence === 'medium' ? 'rgba(201,168,76,0.15)' : 'rgba(155,168,192,0.15)',
                    color:      a.confidence === 'high' ? '#2ECC8B' : a.confidence === 'medium' ? '#C9A84C' : '#9BA8C0',
                  }}>{a.confidence.toUpperCase()}</span>
                  <span style={{ fontFamily: 'Georgia, serif', fontWeight: 800, color: '#2ECC8B', fontSize: 16 }}>+{fmtMoney(a.amount)}</span>
                </span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--kb-text-secondary)', lineHeight: 1.45 }}>{a.reason}</div>
            </div>
          ))}
        </div>
      )}

      {/* Notes */}
      {ex.notes.length > 0 && (
        <div style={{ marginTop: 14, padding: '10px 14px', background: 'rgba(46,117,182,0.06)', borderLeft: '3px solid #2E75B6', borderRadius: 6, fontSize: 12, color: 'var(--kb-text-secondary)' }}>
          <strong style={{ color: 'var(--kb-text)' }}>Notes:</strong> {ex.notes.join(' · ')}
        </div>
      )}
    </div>
  )
}
