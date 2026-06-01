'use client'
import { useState, useRef, useCallback } from 'react'
import FolderUploader from '@/components/dashboard/FolderUploader'

const DEMO_DEAL_ID = 'demo-001'

const DOC_SLOTS = [
  // 5 years of tax returns (most recent first)
  { key: 'tax_return_2024',     label: 'Tax Return',       year: 2024, type: 'tax_return' },
  { key: 'tax_return_2023',     label: 'Tax Return',       year: 2023, type: 'tax_return' },
  { key: 'tax_return_2022',     label: 'Tax Return',       year: 2022, type: 'tax_return' },
  { key: 'tax_return_2021',     label: 'Tax Return',       year: 2021, type: 'tax_return' },
  { key: 'tax_return_2020',     label: 'Tax Return',       year: 2020, type: 'tax_return' },
  // 5 years of P&L statements
  { key: 'pl_statement_2024',   label: 'P&L Statement',    year: 2024, type: 'pl_statement' },
  { key: 'pl_statement_2023',   label: 'P&L Statement',    year: 2023, type: 'pl_statement' },
  { key: 'pl_statement_2022',   label: 'P&L Statement',    year: 2022, type: 'pl_statement' },
  { key: 'pl_statement_2021',   label: 'P&L Statement',    year: 2021, type: 'pl_statement' },
  { key: 'pl_statement_2020',   label: 'P&L Statement',    year: 2020, type: 'pl_statement' },
  // 5 years of bank statements
  { key: 'bank_statements_2024',label: 'Bank Statements',  year: 2024, type: 'bank_statements' },
  { key: 'bank_statements_2023',label: 'Bank Statements',  year: 2023, type: 'bank_statements' },
  { key: 'bank_statements_2022',label: 'Bank Statements',  year: 2022, type: 'bank_statements' },
  { key: 'bank_statements_2021',label: 'Bank Statements',  year: 2021, type: 'bank_statements' },
  { key: 'bank_statements_2020',label: 'Bank Statements',  year: 2020, type: 'bank_statements' },
  // Additional documents
  { key: 'balance_sheet',       label: 'Balance Sheet',     year: 0,    type: 'balance_sheet' },
  { key: 'ar_aging',            label: 'A/R Aging Report',  year: 0,    type: 'ar_aging' },
  { key: 'equipment_list',      label: 'Equipment List',    year: 0,    type: 'equipment_list' },
  { key: 'lease_agreements',    label: 'Lease Agreements',  year: 0,    type: 'lease_agreements' },
  { key: 'customer_list',       label: 'Customer List',     year: 0,    type: 'customer_list' },
  { key: 'employee_roster',     label: 'Employee Roster',   year: 0,    type: 'employee_roster' },
  { key: 'other_1',             label: 'Other Document',    year: 0,    type: 'other' },
  { key: 'other_2',             label: 'Other Document',    year: 0,    type: 'other' },
]

type DocStatus = 'pending' | 'uploading' | 'processing' | 'complete' | 'error'
type DocState  = { status: DocStatus; fileName?: string; size?: string; error?: string }

function fmtSize(bytes: number) {
  if (bytes >= 1048576) return (bytes / 1048576).toFixed(1) + ' MB'
  return Math.round(bytes / 1024) + ' KB'
}

const STATUS_COLORS: Record<DocStatus, string> = {
  pending:    'var(--kb-text-muted)',
  uploading:  '#C9A84C',
  processing: '#5BB8F5',
  complete:   '#2ECC8B',
  error:      '#E74C3C',
}

const STATUS_LABELS: Record<DocStatus, string> = {
  pending:    'Pending',
  uploading:  'Uploading…',
  processing: 'KB Engine Processing…',
  complete:   '✓ Complete',
  error:      '<svg viewBox="0 0 14 14" width="14" height="14" fill="none" stroke="#E84949" strokeWidth="2" strokeLinecap="round"><line x1="4" y1="4" x2="10" y2="10"/><line x1="10" y1="4" x2="4" y2="10"/></svg> Error',
}

export default function DocumentsPage() {
  const [docs, setDocs] = useState<Record<string, DocState>>(
    Object.fromEntries(DOC_SLOTS.map(s => [s.key, { status: 'pending' }]))
  )
  const [activeKey, setActiveKey] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const setDoc = useCallback((key: string, patch: Partial<DocState>) => {
    setDocs(prev => ({ ...prev, [key]: { ...prev[key], ...patch } }))
  }, [])

  const handleUploadClick = useCallback((key: string) => {
    setActiveKey(key)
    fileInputRef.current?.click()
  }, [])

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !activeKey) return
    e.target.value = ''

    const slot = DOC_SLOTS.find(s => s.key === activeKey)
    if (!slot) return

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setDoc(activeKey, { status: 'error', error: 'PDF files only.' })
      return
    }
    if (file.size > 25 * 1024 * 1024) {
      setDoc(activeKey, { status: 'error', error: 'Max 25 MB per file.' })
      return
    }

    setDoc(activeKey, { status: 'uploading', fileName: file.name, size: fmtSize(file.size) })

    try {
      // Step 1, upload to Supabase Storage via API
      const form = new FormData()
      form.append('file', file)
      form.append('dealId', DEMO_DEAL_ID)
      form.append('docType', slot.type)
      form.append('year', String(slot.year))

      const uploadRes = await fetch('/api/upload-document', { method: 'POST', body: form })

      if (!uploadRes.ok) {
        const data = await uploadRes.json().catch(() => ({}))
        // Demo accounts are blocked from writing, show friendly message
        if (uploadRes.status === 403) {
          setDoc(activeKey, { status: 'error', error: 'Live uploads available on a paid account. Demo data shown below.' })
          return
        }
        setDoc(activeKey, { status: 'error', error: data.error || 'Upload failed.' })
        return
      }

      const { doc_id } = await uploadRes.json()

      // Step 2, trigger Claude AI extraction
      setDoc(activeKey, { status: 'processing' })

      const analyzeRes = await fetch('/api/analyze-documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deal_id: DEMO_DEAL_ID, doc_id, doc_type: slot.type, year: slot.year }),
      })

      if (!analyzeRes.ok) {
        setDoc(activeKey, { status: 'error', error: 'AI analysis failed, document saved, retry shortly.' })
        return
      }

      setDoc(activeKey, { status: 'complete' })
    } catch {
      setDoc(activeKey, { status: 'error', error: 'Network error, please retry.' })
    }
  }, [activeKey, setDoc])

  const completed = Object.values(docs).filter(d => d.status === 'complete').length
  const total     = DOC_SLOTS.length

  return (
    <div style={{ padding: '28px 32px', fontFamily: "'Inter', system-ui, sans-serif", color: 'var(--kb-text)' }}>
      {/* Header */}
      <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '10px', color: 'var(--kb-text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '6px' }}>Documents</div>
      <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '28px', fontWeight: 600, margin: '0 0 5px', letterSpacing: '-0.3px' }}>Analyzing Financials</h1>
      <p style={{ fontSize: '14px', color: 'var(--kb-text-secondary)', margin: '0 0 24px', lineHeight: 1.5 }}>
        Upload your 9 financial documents. Kingdom Broker's Deal Intelligence Engine reads every number automatically, revenue, EBITDA, add-backs, and populates your Financial Analysis dashboard.
      </p>

      {/* Quick folder uploader — auto-classifies dragged folder by filename */}
      <FolderUploader dealId={DEMO_DEAL_ID} />

      {/* Summary bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px', marginBottom: '22px' }}>
        {[
          { label: 'Documents Uploaded', value: `${completed} / ${total}`, color: completed === total ? '#2ECC8B' : '#C9A84C' },
          { label: 'KB Extraction',      value: completed === total ? 'Complete' : completed > 0 ? 'In Progress' : 'Awaiting Upload', color: completed === total ? '#2ECC8B' : 'var(--kb-text-secondary)' },
          { label: 'Required Documents', value: '9 Total', color: 'var(--kb-text-secondary)' },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--kb-bg-panel)', border: '1px solid var(--kb-border-subtle)', borderRadius: '8px', padding: '16px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', color: 'var(--kb-text-secondary)' }}>{s.label}</span>
            <span style={{ fontSize: '14px', fontWeight: 590, color: s.color }}>{s.value}</span>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div style={{ background: 'var(--kb-bg-panel)', border: '1px solid var(--kb-border)', borderRadius: '10px', padding: '14px 18px', marginBottom: '22px', display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{ flex: 1, background: 'var(--kb-bg-raised)', borderRadius: '6px', height: '8px', overflow: 'hidden' }}>
          <div style={{ width: `${(completed / total) * 100}%`, height: '100%', background: '#2ECC8B', borderRadius: '6px', transition: 'width 0.4s' }} />
        </div>
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '12px', color: 'var(--kb-text-secondary)', whiteSpace: 'nowrap' }}>{Math.round((completed / total) * 100)}% complete</span>
      </div>

      {/* Document grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px', marginBottom: '24px' }}>
        {DOC_SLOTS.map(slot => {
          const doc   = docs[slot.key]
          const color = STATUS_COLORS[doc.status]
          const isActive = doc.status === 'uploading' || doc.status === 'processing'
          return (
            <div key={slot.key} style={{ background: 'var(--kb-bg-panel)', border: `1px solid ${doc.status === 'complete' ? 'rgba(46,204,139,0.2)' : doc.status === 'error' ? 'rgba(231,76,60,0.2)' : 'var(--kb-border)'}`, borderRadius: '12px', padding: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 510, marginBottom: '2px' }}>{slot.label}</div>
                  <div style={{ fontSize: '12px', color: 'var(--kb-text-secondary)' }}>{slot.year > 0 ? slot.year : 'Current'}</div>
                </div>
                <span style={{ fontSize: '10px', padding: '3px 8px', background: `${color}18`, color, borderRadius: '4px', fontWeight: 510, border: `1px solid ${color}40`, whiteSpace: 'nowrap' }}>
                  {isActive
                    ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: color, display: 'inline-block', animation: 'pulse 1s infinite' }} />
                        {STATUS_LABELS[doc.status]}
                      </span>
                    : STATUS_LABELS[doc.status]}
                </span>
              </div>

              {doc.fileName && (
                <div style={{ fontSize: '11px', color: 'var(--kb-text-muted)', marginBottom: '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {doc.fileName} · {doc.size}
                </div>
              )}

              {doc.error && (
                <div style={{ fontSize: '11px', color: 'var(--kb-red)', marginBottom: '8px', lineHeight: 1.4 }}>{doc.error}</div>
              )}

              <button
                onClick={() => handleUploadClick(slot.key)}
                disabled={isActive}
                style={{
                  width: '100%', padding: '7px',
                  background: doc.status === 'complete' ? 'transparent' : 'rgba(201,168,76,0.08)',
                  border: `1px solid ${doc.status === 'complete' ? 'var(--kb-border)' : 'rgba(201,168,76,0.25)'}`,
                  borderRadius: '6px',
                  color: doc.status === 'complete' ? 'var(--kb-text-secondary)' : '#C9A84C',
                  fontSize: '12px', cursor: isActive ? 'default' : 'pointer',
                  fontFamily: "'Inter', system-ui, sans-serif", fontWeight: 510,
                  opacity: isActive ? 0.5 : 1,
                }}
              >
                {doc.status === 'complete' ? 'Re-upload' : doc.status === 'error' ? 'Retry Upload' : '↑ Upload PDF'}
              </button>
            </div>
          )
        })}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,application/pdf"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      {/* What happens next */}
      <div style={{ background: 'var(--kb-accent-dim)', border: '1px solid var(--kb-accent-border)', borderRadius: '8px', padding: '22px' }}>
        <div style={{ fontSize: '11px', fontWeight: 590, color: 'var(--kb-accent)', marginBottom: '14px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>What happens when you upload</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px' }}>
          {[
            { step: '01', label: 'PDF Uploaded', desc: 'Stored securely in private Supabase Storage' },
            { step: '02', label: 'KB Engine Reads It', desc: 'Deal Intelligence extracts revenue, EBITDA, every line item' },
            { step: '03', label: 'Add-Backs Found', desc: 'Owner comp, one-time items, personal expenses flagged' },
            { step: '04', label: 'Dashboard Updates', desc: 'Financial Analysis + Valuation populate automatically' },
          ].map(s => (
            <div key={s.step}>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '10px', color: 'var(--kb-accent)', marginBottom: '4px' }}>{s.step}</div>
              <div style={{ fontSize: '13px', fontWeight: 510, marginBottom: '3px' }}>{s.label}</div>
              <div style={{ fontSize: '11px', color: 'var(--kb-text-secondary)', lineHeight: 1.5 }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <style>{`@keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:0.4 } }`}</style>
    </div>
  )
}
