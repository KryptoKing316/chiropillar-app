'use client'

// Data Room upload zone + QuickBooks connect card
// Visually functional — drag/drop UI, file picker, QB button — but every
// action surfaces a polished "Coming Soon" inline notice. Mirrors the
// app.KingdomBroker.com documents pattern, themed for ChiroPillar.

import { useState, useRef, useCallback } from 'react'

type Toast = { kind: 'soon' | 'qb'; visible: boolean }

export default function UploadZone() {
  const [dragOver, setDragOver] = useState(false)
  const [toast, setToast] = useState<Toast>({ kind: 'soon', visible: false })
  const fileInputRef = useRef<HTMLInputElement>(null)
  const folderInputRef = useRef<HTMLInputElement>(null)

  const flash = useCallback((kind: 'soon' | 'qb') => {
    setToast({ kind, visible: true })
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 6000)
  }, [])

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragOver(true) }
  const onDragLeave = (e: React.DragEvent) => { e.preventDefault(); setDragOver(false) }
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    flash('soon')
  }

  const onFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) flash('soon')
    e.target.value = ''
  }

  return (
    <div style={{ marginBottom: 36 }}>
      <div style={{
        fontFamily: "'JetBrains Mono', monospace", fontSize: 11,
        letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 700,
        color: 'var(--kb-accent)', marginBottom: 12,
      }}>
        Clinic financial uploads
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: 'minmax(0,2fr) minmax(0,1fr)',
        gap: 16,
      }} className="kb-upload-grid">

        {/* ── DROP ZONE ─────────────────────────────────────────────────── */}
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => flash('soon')}
          style={{
            background: dragOver
              ? 'linear-gradient(135deg, rgba(46,117,182,0.16), rgba(201,168,76,0.10))'
              : 'linear-gradient(135deg, rgba(46,117,182,0.06), rgba(201,168,76,0.03))',
            border: `2px dashed ${dragOver ? '#2E75B6' : 'rgba(46,117,182,0.35)'}`,
            borderRadius: 14, padding: '36px 32px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', transition: 'all 0.2s',
            minHeight: 240,
          }}
        >
          {/* Cloud-upload icon */}
          <div style={{ marginBottom: 16 }}>
            <svg viewBox="0 0 64 64" width="56" height="56" fill="none" stroke="#2E75B6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 44a10 10 0 0 1 2-19.8A14 14 0 0 1 46 22a10 10 0 0 1 2 22" />
              <path d="M32 30v18" />
              <polyline points="24,38 32,30 40,38" />
            </svg>
          </div>
          <div style={{
            fontFamily: 'Georgia, "Playfair Display", serif',
            fontSize: 22, fontWeight: 600, color: 'var(--kb-text)',
            marginBottom: 6, textAlign: 'center', letterSpacing: '-0.01em',
          }}>
            Drop tax returns, P&Ls, bank statements
          </div>
          <div style={{ fontSize: 14, color: 'var(--kb-text-secondary)', textAlign: 'center', marginBottom: 18, maxWidth: 440 }}>
            Drag any PDF or an entire folder. Claude extracts financials, normalizes EBITDA, identifies add-backs, prices against the 158-comp set.
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
              Choose Files
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
          <input
            ref={fileInputRef} type="file" multiple accept=".pdf,.csv,.xlsx"
            onChange={onFilePick} style={{ display: 'none' }}
          />
          <input
            ref={folderInputRef} type="file" multiple
            // @ts-expect-error · webkitdirectory enables folder picker
            webkitdirectory="" directory=""
            onChange={onFilePick} style={{ display: 'none' }}
          />
        </div>

        {/* ── QUICKBOOKS CONNECT ────────────────────────────────────────── */}
        <button
          type="button"
          onClick={() => flash('qb')}
          style={{
            background: 'var(--kb-bg-panel)', border: '1px solid var(--kb-border)',
            borderRadius: 14, padding: 24, cursor: 'pointer',
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            textAlign: 'left', minHeight: 240,
            fontFamily: "'Inter', system-ui, sans-serif", color: 'var(--kb-text)',
          }}
        >
          <div>
            {/* QB logo mark — green circle with QB */}
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

      {/* ── INLINE "COMING SOON" NOTICE (slides in after click) ─────────── */}
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
            animation: 'fadeIn 0.25s ease',
          }}
        >
          <span style={{
            padding: '4px 10px', borderRadius: 999,
            background: toast.kind === 'qb' ? '#2CA01C' : '#C9A84C',
            color: '#0B1B3E',
            fontFamily: "'JetBrains Mono', monospace", fontSize: 10, fontWeight: 800,
            letterSpacing: '0.16em', textTransform: 'uppercase',
          }}>
            {toast.kind === 'qb' ? 'QB Sync' : 'Upload'} · Coming Soon
          </span>
          <div style={{ flex: 1, fontSize: 14, color: 'var(--kb-text)', lineHeight: 1.55 }}>
            {toast.kind === 'qb'
              ? <>QuickBooks OAuth + automatic financial sync ships in <strong style={{ color: '#2CA01C' }}>Phase 3</strong> alongside the per-clinic data room. Builds out once Wagner signs the partnership term sheet.</>
              : <>Per-clinic financial ingestion ships in <strong style={{ color: '#C9A84C' }}>Phase 3</strong>. PDFs land in Supabase Storage, Claude extracts the chart of accounts, valuation engine runs automatically.</>
            }
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
        @media (max-width: 880px) {
          .kb-upload-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
