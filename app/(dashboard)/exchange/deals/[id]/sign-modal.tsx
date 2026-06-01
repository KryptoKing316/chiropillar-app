'use client'

import { useState } from 'react'

type DocType = 'loi' | 'purchase_agreement' | 'custom'

interface Props {
  dealId: string
  dealTitle: string
  initialDocType: DocType
  onClose: () => void
}

const DOC_TYPE_LABELS: Record<DocType, { title: string; subtitle: string; emoji: string; defaultName: (deal: string) => string }> = {
  loi: {
    emoji: '📝',
    title: 'Send LOI for Signature',
    subtitle: 'Upload your firm\'s Letter of Intent. Both parties sign via DocuSeal. KB never templates LOIs — you bring your own.',
    defaultName: (deal) => `LOI · ${deal}`,
  },
  purchase_agreement: {
    emoji: '🤝',
    title: 'Send Purchase Agreement',
    subtitle: 'Upload the final close documents. Once both parties sign, the deal closes on the Exchange.',
    defaultName: (deal) => `Purchase Agreement · ${deal}`,
  },
  custom: {
    emoji: '📎',
    title: 'Upload Custom Document',
    subtitle: 'Send any PDF your firm needs signed (term sheet, engagement letter, side letter, etc).',
    defaultName: (deal) => `Document · ${deal}`,
  },
}

export default function SignModal({ dealId, dealTitle, initialDocType, onClose }: Props) {
  const cfg = DOC_TYPE_LABELS[initialDocType]
  const [docType, setDocType] = useState<DocType>(initialDocType)
  const [docName, setDocName] = useState(cfg.defaultName(dealTitle))
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [cpName, setCpName] = useState('')
  const [cpEmail, setCpEmail] = useState('')
  const [cpRole, setCpRole] = useState(initialDocType === 'loi' ? 'Buyer' : initialDocType === 'purchase_agreement' ? 'Buyer' : 'Counterparty')
  const [message, setMessage] = useState('')

  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [result, setResult] = useState<null | {
    success: boolean
    signature_id: string
    document_type: DocType
    document_name: string
    docuseal_submission_id: number
    submitters?: Array<{ email: string; name?: string; role?: string; embed_src?: string; status: string }>
  }>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setErr(null)
    if (!pdfFile) { setErr('Please attach a PDF'); setBusy(false); return }

    try {
      const fd = new FormData()
      fd.append('pdf', pdfFile)
      fd.append('document_type', docType)
      fd.append('document_name', docName)
      fd.append('counterparty_name', cpName)
      fd.append('counterparty_email', cpEmail)
      fd.append('counterparty_role', cpRole)
      if (message) fd.append('message', message)

      const res = await fetch(`/api/exchange/deals/${dealId}/sign`, {
        method: 'POST',
        body: fd,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Send failed')
      setResult(data)
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setBusy(false)
    }
  }

  const currentCfg = DOC_TYPE_LABELS[docType]

  return (
    <div style={overlayStyle} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={modalStyle}>
        <button onClick={onClose} style={closeBtnStyle} aria-label="Close">✕</button>

        <div style={modalHeaderStyle}>
          <div style={kickerStyle}>
            {currentCfg.emoji} {docType === 'loi' ? 'Letter of Intent' : docType === 'purchase_agreement' ? 'Purchase Agreement' : 'Custom Document'}
          </div>
          <h2 style={titleStyle}>{currentCfg.title}</h2>
          <p style={subStyle}>For: <strong style={{ color: '#F2EEE7' }}>{dealTitle}</strong></p>
        </div>

        {result?.success ? (
          <div style={successBoxStyle}>
            <div style={{ fontSize: 36, marginBottom: 14 }}>✅</div>
            <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 22, margin: '0 0 10px', color: '#F2EEE7' }}>
              {result.document_name} sent via DocuSeal
            </h3>
            <p style={{ color: '#9BA8C0', fontSize: 14, lineHeight: 1.6, margin: '0 0 18px' }}>
              DocuSeal emailed signing links to both parties. Once both sign, the deal advances + audit trail is logged on the Exchange.
            </p>

            {result.submitters && result.submitters.length > 0 && (
              <div style={{ marginBottom: 18 }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#9BA8C0', marginBottom: 8 }}>
                  Signing Status
                </div>
                {result.submitters.map((s, i) => (
                  <div key={i} style={submitterRowStyle}>
                    <div>
                      <div style={{ fontWeight: 600, color: '#F2EEE7', fontSize: 14 }}>{s.name ?? s.email}</div>
                      <div style={{ fontSize: 12, color: '#9BA8C0', marginTop: 2 }}>{s.role} · {s.email}</div>
                    </div>
                    <span style={badgeOfStatus(s.status)}>{s.status}</span>
                  </div>
                ))}
              </div>
            )}

            <div style={{ fontSize: 12, color: '#4A5880', marginBottom: 16 }}>
              DocuSeal Submission ID: <code style={{ fontFamily: 'DM Mono, monospace' }}>{result.docuseal_submission_id}</code>
            </div>

            <button onClick={onClose} style={primaryBtnStyle}>Done</button>
          </div>
        ) : (
          <form onSubmit={submit}>
            <p style={{ fontSize: 13, color: '#9BA8C0', lineHeight: 1.55, margin: '0 0 18px' }}>
              {currentCfg.subtitle}
            </p>

            {/* Doc type quick-switcher */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
              {(Object.keys(DOC_TYPE_LABELS) as DocType[]).map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    setDocType(t)
                    setDocName(DOC_TYPE_LABELS[t].defaultName(dealTitle))
                  }}
                  style={{
                    flex: 1,
                    padding: '10px 12px',
                    background: docType === t ? 'rgba(201,168,76,0.15)' : 'rgba(255,255,255,0.03)',
                    border: docType === t ? '1px solid #C9A84C' : '1px solid rgba(255,255,255,0.08)',
                    color: docType === t ? '#C9A84C' : '#9BA8C0',
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 600,
                    letterSpacing: '0.04em',
                    cursor: 'pointer',
                  }}
                >
                  {DOC_TYPE_LABELS[t].emoji} {t === 'loi' ? 'LOI' : t === 'purchase_agreement' ? 'Purchase' : 'Custom'}
                </button>
              ))}
            </div>

            <Field label="Document Name" required>
              <input
                value={docName}
                onChange={(e) => setDocName(e.target.value)}
                required
                style={inputStyle}
              />
            </Field>

            <Field label={`Upload PDF (your firm's ${docType === 'custom' ? 'document' : docType.toUpperCase()})`} required>
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => setPdfFile(e.target.files?.[0] ?? null)}
                required
                style={{ ...inputStyle, padding: '10px' }}
              />
              {pdfFile && (
                <div style={{ fontSize: 12, color: '#5fc28a', marginTop: 6 }}>
                  📎 {pdfFile.name} · {(pdfFile.size / 1024).toFixed(0)} KB
                </div>
              )}
            </Field>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <Field label="Counterparty Name" required>
                <input
                  value={cpName}
                  onChange={(e) => setCpName(e.target.value)}
                  placeholder="Jane Buyer"
                  required
                  style={inputStyle}
                />
              </Field>
              <Field label="Their Role">
                <select
                  value={cpRole}
                  onChange={(e) => setCpRole(e.target.value)}
                  style={inputStyle}
                >
                  <option value="Buyer">Buyer</option>
                  <option value="Seller">Seller</option>
                  <option value="Counterparty">Counterparty</option>
                  <option value="Partner">Partner</option>
                  <option value="Other">Other</option>
                </select>
              </Field>
            </div>

            <Field label="Counterparty Email" required>
              <input
                type="email"
                value={cpEmail}
                onChange={(e) => setCpEmail(e.target.value)}
                placeholder="jane@buyer.com"
                required
                style={inputStyle}
              />
            </Field>

            <Field label="Custom Email Message (optional)">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Pre-fills the DocuSeal email body. Leave blank for default."
                rows={3}
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </Field>

            <div style={{ fontSize: 12, color: '#9BA8C0', marginBottom: 14, lineHeight: 1.55 }}>
              DocuSeal generates a one-off template from your PDF + sends signing emails to both you and the counterparty. After both sign, the audit trail and signed PDF are logged to this deal automatically.
            </div>

            {err && <div style={errBoxStyle}>{err}</div>}

            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <button type="submit" disabled={busy} style={{ ...primaryBtnStyle, flex: 1 }}>
                {busy ? 'Uploading + Sending via DocuSeal...' : 'Send for Signature →'}
              </button>
              <button type="button" onClick={onClose} style={secondaryBtnStyle}>Cancel</button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={fieldLabelStyle}>
        {label} {required && <span style={{ color: '#C9A84C' }}>*</span>}
      </label>
      {children}
    </div>
  )
}

function badgeOfStatus(status: string): React.CSSProperties {
  const c: Record<string, { bg: string; fg: string }> = {
    awaiting: { bg: 'rgba(155,168,192,0.18)', fg: '#9BA8C0' },
    opened: { bg: 'rgba(80,140,230,0.18)', fg: '#86b3f0' },
    completed: { bg: 'rgba(46,125,79,0.18)', fg: '#5fc28a' },
    declined: { bg: 'rgba(168,51,46,0.2)', fg: '#f08a8a' },
  }
  const v = c[status] ?? c.awaiting
  return {
    fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' as const,
    padding: '4px 9px', borderRadius: 999, background: v.bg, color: v.fg, whiteSpace: 'nowrap' as const,
  }
}

const overlayStyle: React.CSSProperties = {
  position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(8,15,30,0.78)', backdropFilter: 'blur(6px)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
  fontFamily: "'Inter', 'DM Sans', system-ui, sans-serif",
}
const modalStyle: React.CSSProperties = {
  position: 'relative', width: '100%', maxWidth: 580, maxHeight: '90vh', overflow: 'auto',
  background: 'linear-gradient(180deg, #0F2347 0%, #0B1B3E 100%)',
  border: '1px solid rgba(201,168,76,0.25)', borderRadius: 18, padding: '34px 34px 28px',
  boxShadow: '0 24px 60px rgba(0,0,0,0.45)', color: '#F2EEE7',
}
const closeBtnStyle: React.CSSProperties = {
  position: 'absolute', top: 16, right: 18, background: 'transparent', border: 'none',
  color: '#9BA8C0', fontSize: 18, cursor: 'pointer', padding: 6, lineHeight: 1,
}
const modalHeaderStyle: React.CSSProperties = { marginBottom: 18 }
const kickerStyle: React.CSSProperties = {
  fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase',
  color: '#C9A84C', marginBottom: 8,
}
const titleStyle: React.CSSProperties = {
  fontFamily: "'Playfair Display', Georgia, serif", fontSize: 24, fontWeight: 700,
  lineHeight: 1.2, margin: '0 0 6px', color: '#F2EEE7',
}
const subStyle: React.CSSProperties = { fontSize: 14, color: '#9BA8C0', margin: 0, lineHeight: 1.5 }
const fieldLabelStyle: React.CSSProperties = {
  display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em',
  textTransform: 'uppercase' as const, color: '#9BA8C0', marginBottom: 6,
}
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '11px 14px', background: 'rgba(11,27,62,0.6)',
  border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, color: '#F2EEE7',
  fontSize: 14, fontFamily: 'inherit', outline: 'none',
}
const primaryBtnStyle: React.CSSProperties = {
  padding: '12px 22px', background: '#C9A84C', color: '#0B1B3E', fontWeight: 700,
  fontSize: 14, borderRadius: 10, border: 'none', cursor: 'pointer', letterSpacing: '0.01em',
}
const secondaryBtnStyle: React.CSSProperties = {
  padding: '12px 22px', background: 'rgba(255,255,255,0.04)', color: '#F2EEE7',
  fontWeight: 600, fontSize: 14, borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)', cursor: 'pointer',
}
const errBoxStyle: React.CSSProperties = {
  background: 'rgba(168,51,46,0.15)', border: '1px solid rgba(168,51,46,0.45)', borderRadius: 8,
  padding: '10px 14px', fontSize: 13, color: '#f0a0a0', marginBottom: 12,
}
const successBoxStyle: React.CSSProperties = { textAlign: 'center', padding: '16px 4px 8px' }
const submitterRowStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  padding: '10px 14px', background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, marginBottom: 8, textAlign: 'left',
}
