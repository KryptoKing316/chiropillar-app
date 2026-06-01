'use client'

// ---------------------------------------------------------------------------
// FolderUploader — bulk drag-drop folder upload with client-side auto-classify
// ---------------------------------------------------------------------------
// Lets a seller drag a whole "Financials 2023" folder onto the dashboard.
// Each file is:
//   1. Classified client-side by filename (year + doc_type guess)
//   2. Uploaded to /api/upload-document with the inferred slot
//   3. Triggered for AI extraction via /api/analyze-documents
//
// Accepts: PDF, JPG, JPEG, PNG, WEBP. iPhone HEICs should be converted by
// the OS to JPEG on selection in modern browsers; if not, user gets a clear
// error and a "Save as JPEG and retry" hint.
//
// This component is purely additive — does NOT replace the manual 23-slot
// grid below it. Sellers can use either flow.
// ---------------------------------------------------------------------------

import { useCallback, useRef, useState } from 'react'

interface ClassifiedFile {
  id: string
  file: File
  inferredDocType: string
  inferredYear: number | null
  confidence: number
  status: 'queued' | 'uploading' | 'processing' | 'complete' | 'error'
  errorMessage?: string
  addBacksFound?: number
}

// Client-side classifier — mirrors the server-side classifyDocument()
// in lib/extract-financials.ts so users see a guess before upload.
function classifyByFilename(filename: string): {
  docType: string
  year: number | null
  confidence: number
} {
  const lower = filename.toLowerCase()

  let year: number | null = null
  const yearMatch = lower.match(/\b(20[1-3][0-9])\b/g)
  if (yearMatch) year = Math.max(...yearMatch.map((y) => parseInt(y, 10)))

  const scores: Record<string, number> = {
    tax_return: 0,
    pl_statement: 0,
    bank_statements: 0,
    balance_sheet: 0,
    ar_aging: 0,
    equipment_list: 0,
    lease_agreements: 0,
    customer_list: 0,
    employee_roster: 0,
    other: 1,
  }

  if (/tax|1120|1040|schedule.?c|irs/.test(lower)) scores.tax_return += 5
  if (/profit.?loss|p.?l|income.statement/.test(lower)) scores.pl_statement += 5
  if (/bank.?statement|chase|wells|bofa/.test(lower)) scores.bank_statements += 5
  if (/balance.sheet/.test(lower)) scores.balance_sheet += 5
  if (/a.?r.aging|accounts.receivable/.test(lower)) scores.ar_aging += 5
  if (/equipment.list|fixed.asset/.test(lower)) scores.equipment_list += 4
  if (/lease.agreement/.test(lower)) scores.lease_agreements += 4
  if (/customer.list|client.list/.test(lower)) scores.customer_list += 4
  if (/employee|payroll|staff.list/.test(lower)) scores.employee_roster += 4

  const top = Object.entries(scores).sort(([, a], [, b]) => b - a)[0]
  return {
    docType: top[0],
    year,
    confidence: Math.min(10, top[1] * 2),
  }
}

const DOC_TYPE_LABELS: Record<string, string> = {
  tax_return: 'Tax Return',
  pl_statement: 'P&L Statement',
  bank_statements: 'Bank Statements',
  balance_sheet: 'Balance Sheet',
  ar_aging: 'A/R Aging',
  equipment_list: 'Equipment List',
  lease_agreements: 'Lease Agreement',
  customer_list: 'Customer List',
  employee_roster: 'Employee Roster',
  other: 'Other Document',
}

const ACCEPTED_EXT = /\.(pdf|jpe?g|png|webp)$/i

interface FolderUploaderProps {
  dealId: string
  onComplete?: (results: ClassifiedFile[]) => void
}

export default function FolderUploader({ dealId, onComplete }: FolderUploaderProps) {
  const [files, setFiles] = useState<ClassifiedFile[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const folderInputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFiles = useCallback((fileList: FileList | File[]) => {
    const accepted: ClassifiedFile[] = []
    let rejected = 0

    Array.from(fileList).forEach((f, i) => {
      if (!ACCEPTED_EXT.test(f.name)) {
        rejected++
        return
      }
      if (f.size > 25 * 1024 * 1024) {
        rejected++
        return
      }
      const classification = classifyByFilename(f.name)
      accepted.push({
        id: `${Date.now()}-${i}-${f.name}`,
        file: f,
        inferredDocType: classification.docType,
        inferredYear: classification.year,
        confidence: classification.confidence,
        status: 'queued',
      })
    })

    setFiles((prev) => [...prev, ...accepted])
    if (rejected > 0) {
      // Non-blocking notice — show in console; toast would be nicer but keeping deps minimal
      console.warn(`${rejected} file(s) rejected (not PDF/JPEG/PNG/WEBP or >25MB)`)
    }
  }, [])

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      if (!e.dataTransfer.files) return
      handleFiles(e.dataTransfer.files)
    },
    [handleFiles]
  )

  const updateOne = useCallback((id: string, patch: Partial<ClassifiedFile>) => {
    setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)))
  }, [])

  const removeOne = useCallback((id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id))
  }, [])

  const updateDocType = useCallback(
    (id: string, docType: string) => {
      updateOne(id, { inferredDocType: docType })
    },
    [updateOne]
  )

  const updateYear = useCallback(
    (id: string, year: number) => {
      updateOne(id, { inferredYear: year })
    },
    [updateOne]
  )

  const processAll = useCallback(async () => {
    if (isProcessing) return
    setIsProcessing(true)

    const toProcess = files.filter((f) => f.status === 'queued')

    // Process serially to avoid overwhelming Claude rate limits.
    // Could be Promise.all with concurrency limit for speed if needed.
    for (const item of toProcess) {
      updateOne(item.id, { status: 'uploading' })

      try {
        const form = new FormData()
        form.append('file', item.file)
        form.append('dealId', dealId)
        form.append('docType', item.inferredDocType)
        form.append('year', String(item.inferredYear ?? new Date().getFullYear()))

        const uploadRes = await fetch('/api/upload-document', {
          method: 'POST',
          body: form,
        })

        if (!uploadRes.ok) {
          const data = await uploadRes.json().catch(() => ({}))
          updateOne(item.id, {
            status: 'error',
            errorMessage: data.error || `Upload failed (${uploadRes.status})`,
          })
          continue
        }

        const uploadData = await uploadRes.json()
        if (!uploadData.doc_id) {
          updateOne(item.id, {
            status: 'error',
            errorMessage: 'Upload succeeded but doc_id missing — contact support.',
          })
          continue
        }

        updateOne(item.id, { status: 'processing' })

        const analyzeRes = await fetch('/api/analyze-documents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            deal_id: dealId,
            doc_id: uploadData.doc_id,
            doc_type: item.inferredDocType,
            year: item.inferredYear ?? new Date().getFullYear(),
          }),
        })

        if (!analyzeRes.ok) {
          updateOne(item.id, {
            status: 'error',
            errorMessage: 'AI analysis failed — document saved, retry shortly.',
          })
          continue
        }

        const analyzeData = await analyzeRes.json()
        updateOne(item.id, {
          status: 'complete',
          addBacksFound: analyzeData.add_backs_found,
        })
      } catch (e) {
        updateOne(item.id, {
          status: 'error',
          errorMessage: e instanceof Error ? e.message : 'Network error.',
        })
      }
    }

    setIsProcessing(false)
    if (onComplete) onComplete(files)
  }, [files, dealId, isProcessing, updateOne, onComplete])

  const queued = files.filter((f) => f.status === 'queued').length
  const complete = files.filter((f) => f.status === 'complete').length
  const errored = files.filter((f) => f.status === 'error').length

  return (
    <div
      style={{
        background: 'var(--kb-bg-panel)',
        border: '1px solid var(--kb-border)',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '24px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '14px' }}>
        <div>
          <div
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: '10px',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: '#C9A84C',
              marginBottom: '4px',
            }}
          >
            Quick Upload
          </div>
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '20px',
              fontWeight: 600,
              margin: 0,
              color: 'var(--kb-text)',
            }}
          >
            Drag a folder of financials — we'll sort it for you
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--kb-text-secondary)', margin: '4px 0 0' }}>
            PDF, JPEG, PNG, WEBP · iPhone scans welcome · Max 25 MB each
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            onClick={() => folderInputRef.current?.click()}
            style={{
              background: '#C9A84C',
              color: '#0B1B3E',
              padding: '8px 16px',
              border: 'none',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Choose Folder
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            style={{
              background: 'transparent',
              color: 'var(--kb-text)',
              padding: '8px 16px',
              border: '1px solid var(--kb-border)',
              borderRadius: '6px',
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            Choose Files
          </button>
        </div>
      </div>

      {/* Hidden inputs */}
      <input
        ref={folderInputRef}
        type="file"
        // @ts-expect-error — webkitdirectory is non-standard but supported in all evergreen browsers
        webkitdirectory=""
        directory=""
        multiple
        style={{ display: 'none' }}
        accept=".pdf,.jpg,.jpeg,.png,.webp"
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
      />
      <input
        ref={fileInputRef}
        type="file"
        multiple
        style={{ display: 'none' }}
        accept=".pdf,.jpg,.jpeg,.png,.webp"
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
      />

      {/* Drop zone */}
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        style={{
          border: `2px dashed ${isDragging ? '#C9A84C' : 'var(--kb-border)'}`,
          background: isDragging ? 'rgba(201,168,76,0.06)' : 'var(--kb-bg-raised)',
          borderRadius: '10px',
          padding: '32px 20px',
          textAlign: 'center',
          transition: 'border-color 0.15s, background 0.15s',
          cursor: 'pointer',
        }}
        onClick={() => folderInputRef.current?.click()}
      >
        <div style={{ fontSize: '14px', color: 'var(--kb-text-secondary)', marginBottom: '6px' }}>
          {isDragging ? 'Drop to upload' : 'Drag your financials folder here or click to browse'}
        </div>
        <div style={{ fontSize: '12px', color: 'var(--kb-text-muted)' }}>
          We'll auto-classify each file by name (tax returns, P&Ls, bank statements, etc.) and pull out the year.
        </div>
      </div>

      {/* File list */}
      {files.length > 0 && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', marginBottom: '10px' }}>
            <div style={{ fontSize: '13px', color: 'var(--kb-text-secondary)' }}>
              {files.length} file{files.length === 1 ? '' : 's'} · {complete} complete · {errored} errored · {queued} queued
            </div>
            <button
              type="button"
              onClick={processAll}
              disabled={isProcessing || queued === 0}
              style={{
                background: queued > 0 && !isProcessing ? '#2ECC8B' : 'var(--kb-bg-raised)',
                color: queued > 0 && !isProcessing ? '#0B1B3E' : 'var(--kb-text-muted)',
                padding: '8px 18px',
                border: 'none',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: queued > 0 && !isProcessing ? 'pointer' : 'not-allowed',
              }}
            >
              {isProcessing ? 'Processing…' : `Process ${queued} file${queued === 1 ? '' : 's'}`}
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {files.map((f) => (
              <div
                key={f.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 160px 90px 110px 30px',
                  gap: '12px',
                  alignItems: 'center',
                  padding: '10px 14px',
                  background: 'var(--kb-bg-raised)',
                  border: `1px solid ${f.status === 'complete' ? 'rgba(46,204,139,0.25)' : f.status === 'error' ? 'rgba(231,76,60,0.25)' : 'var(--kb-border)'}`,
                  borderRadius: '8px',
                }}
              >
                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '13px' }}>
                  {f.file.name}
                  <div style={{ fontSize: '11px', color: 'var(--kb-text-muted)' }}>
                    {(f.file.size / 1024).toFixed(0)} KB · confidence {f.confidence}/10
                  </div>
                </div>
                <select
                  value={f.inferredDocType}
                  onChange={(e) => updateDocType(f.id, e.target.value)}
                  disabled={f.status !== 'queued'}
                  style={{
                    fontSize: '12px',
                    padding: '6px 8px',
                    background: 'var(--kb-bg-panel)',
                    color: 'var(--kb-text)',
                    border: '1px solid var(--kb-border)',
                    borderRadius: '4px',
                  }}
                >
                  {Object.entries(DOC_TYPE_LABELS).map(([k, label]) => (
                    <option key={k} value={k}>
                      {label}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  value={f.inferredYear ?? ''}
                  onChange={(e) => updateYear(f.id, parseInt(e.target.value, 10) || 0)}
                  disabled={f.status !== 'queued'}
                  placeholder="Year"
                  min={2018}
                  max={2030}
                  style={{
                    fontSize: '12px',
                    padding: '6px 8px',
                    background: 'var(--kb-bg-panel)',
                    color: 'var(--kb-text)',
                    border: '1px solid var(--kb-border)',
                    borderRadius: '4px',
                  }}
                />
                <div style={{ fontSize: '11px', textAlign: 'center' }}>
                  {f.status === 'queued' && <span style={{ color: 'var(--kb-text-muted)' }}>Ready</span>}
                  {f.status === 'uploading' && <span style={{ color: '#C9A84C' }}>Uploading…</span>}
                  {f.status === 'processing' && <span style={{ color: '#5BB8F5' }}>AI extracting…</span>}
                  {f.status === 'complete' && (
                    <span style={{ color: '#2ECC8B' }}>
                      ✓ {f.addBacksFound != null ? `${f.addBacksFound} add-backs` : 'Done'}
                    </span>
                  )}
                  {f.status === 'error' && (
                    <span style={{ color: '#E84949' }} title={f.errorMessage}>
                      Error
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => removeOne(f.id)}
                  disabled={f.status === 'uploading' || f.status === 'processing'}
                  style={{
                    background: 'transparent',
                    color: 'var(--kb-text-muted)',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '16px',
                    lineHeight: 1,
                  }}
                  title="Remove"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
