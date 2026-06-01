'use client'

import { useState } from 'react'

type Flow = 'outbound' | 'request'

interface Props {
  dealId: string
  dealTitle: string
  sourceFirmName: string
  flow: Flow  // 'outbound' if own firm; 'request' if other firm
  onClose: () => void
}

export default function NDAModal({ dealId, dealTitle, sourceFirmName, flow, onClose }: Props) {
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [result, setResult] = useState<null | {
    success: boolean
    flow: Flow
    docuseal_submission_id?: number
    nda_request_id?: string
    submitters?: Array<{ email: string; name?: string; role?: string; embed_src?: string; status: string }>
    message?: string
  }>(null)

  // Outbound fields
  const [cpName, setCpName] = useState('')
  const [cpEmail, setCpEmail] = useState('')
  const [cpCompany, setCpCompany] = useState('')
  const [customMessage, setCustomMessage] = useState('')

  // Request fields
  const [buyerProfile, setBuyerProfile] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setErr(null)
    try {
      const body: Record<string, unknown> = { flow }
      if (flow === 'outbound') {
        body.counterparty_name = cpName
        body.counterparty_email = cpEmail
        body.counterparty_company = cpCompany || undefined
        body.message = customMessage || undefined
      } else {
        // Request flow — counterparty is the source firm contact
        body.counterparty_name = sourceFirmName
        body.counterparty_email = `noreply@${dealId.slice(0, 8)}.kb`  // placeholder; backend creates pending request
        body.buyer_profile = buyerProfile || undefined
      }
      const res = await fetch(`/api/exchange/deals/${dealId}/nda`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'NDA send failed')
      setResult(data)
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div style={overlayStyle} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={modalStyle}>
        <button onClick={onClose} style={closeBtnStyle} aria-label="Close">✕</button>

        <div style={modalHeaderStyle}>
          <div style={kickerStyle}>{flow === 'outbound' ? 'Send NDA' : 'Request NDA'}</div>
          <h2 style={titleStyle}>
            {flow === 'outbound' ? 'Mutual NDA · DocuSeal' : `Request NDA Access from ${sourceFirmName}`}
          </h2>
          <p style={subStyle}>
            For: <strong style={{ color: '#F2EEE7' }}>{dealTitle}</strong>
          </p>
        </div>

        {result?.success ? (
          // ─── SUCCESS STATE ────────────────────────────────────────
          <div style={successBoxStyle}>
            <div style={{ fontSize: 36, marginBottom: 14 }}>✅</div>
            <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 22, margin: '0 0 10px', color: '#F2EEE7' }}>
              {result.flow === 'outbound' ? 'NDA Sent via DocuSeal' : 'NDA Request Submitted'}
            </h3>
            <p style={{ color: '#9BA8C0', fontSize: 14, lineHeight: 1.6, margin: '0 0 18px' }}>
              {result.message ?? `DocuSeal emailed the NDA to both parties. Once both sign, the source firm can share the CIM + private details.`}
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

            {result.docuseal_submission_id && (
              <div style={{ fontSize: 12, color: '#4A5880', marginBottom: 16 }}>
                DocuSeal Submission ID: <code style={{ fontFamily: 'DM Mono, monospace' }}>{result.docuseal_submission_id}</code>
              </div>
            )}

            <button onClick={onClose} style={primaryBtnStyle}>Done</button>
          </div>
        ) : (
          // ─── FORM STATE ───────────────────────────────────────────
          <form onSubmit={submit}>
            {flow === 'outbound' ? (
              <>
                <Field label="Counterparty Name" required>
                  <input
                    value={cpName}
                    onChange={(e) => setCpName(e.target.value)}
                    placeholder="Jane Buyer"
                    required
                    style={inputStyle}
                  />
                </Field>

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

                <Field label="Company">
                  <input
                    value={cpCompany}
                    onChange={(e) => setCpCompany(e.target.value)}
                    placeholder="Acme Holdings LLC"
                    style={inputStyle}
                  />
                </Field>

                <Field label="Custom Message (optional)">
                  <textarea
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    placeholder="Optional — pre-fills the DocuSeal email body. Leave blank for KB default."
                    rows={3}
                    style={{ ...inputStyle, resize: 'vertical' }}
                  />
                </Field>

                <div style={{ fontSize: 12, color: '#9BA8C0', marginTop: 6, marginBottom: 16, lineHeight: 1.55 }}>
                  Uses the KB Mutual NDA template (DocuSeal template ID 3631570). Both parties sign electronically. DocuSeal auto-sends signing-link emails.
                </div>
              </>
            ) : (
              <>
                <Field label="Buyer Profile (helps source firm approve faster)" required>
                  <textarea
                    value={buyerProfile}
                    onChange={(e) => setBuyerProfile(e.target.value)}
                    placeholder="e.g. PE fund $10-50M check size · HVAC roll-up focus · 5+ years platform play"
                    rows={4}
                    required
                    style={{ ...inputStyle, resize: 'vertical' }}
                  />
                </Field>

                <div style={{ fontSize: 12, color: '#9BA8C0', marginTop: 6, marginBottom: 16, lineHeight: 1.55 }}>
                  Sends a pending request to <strong style={{ color: '#F2EEE7' }}>{sourceFirmName}</strong>. They approve or decline. Once approved, the NDA fires and you see the full CIM + financials.
                </div>
              </>
            )}

            {err && (
              <div style={errBoxStyle}>{err}</div>
            )}

            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <button type="submit" disabled={busy} style={{ ...primaryBtnStyle, flex: 1 }}>
                {busy
                  ? (flow === 'outbound' ? 'Sending via DocuSeal...' : 'Submitting request...')
                  : (flow === 'outbound' ? 'Send NDA via DocuSeal →' : 'Submit Request →')}
              </button>
              <button type="button" onClick={onClose} style={secondaryBtnStyle}>Cancel</button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

// ─── Helpers + Styles ──────────────────────────────────────────────────

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
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: '0.12em',
    textTransform: 'uppercase' as const,
    padding: '4px 9px',
    borderRadius: 999,
    background: v.bg,
    color: v.fg,
    whiteSpace: 'nowrap' as const,
  }
}

const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  zIndex: 1000,
  background: 'rgba(8,15,30,0.78)',
  backdropFilter: 'blur(6px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 20,
  fontFamily: "'Inter', 'DM Sans', system-ui, sans-serif",
}

const modalStyle: React.CSSProperties = {
  position: 'relative',
  width: '100%',
  maxWidth: 560,
  maxHeight: '90vh',
  overflow: 'auto',
  background: 'linear-gradient(180deg, #0F2347 0%, #0B1B3E 100%)',
  border: '1px solid rgba(201,168,76,0.25)',
  borderRadius: 18,
  padding: '34px 34px 28px',
  boxShadow: '0 24px 60px rgba(0,0,0,0.45)',
  color: '#F2EEE7',
}

const closeBtnStyle: React.CSSProperties = {
  position: 'absolute',
  top: 16,
  right: 18,
  background: 'transparent',
  border: 'none',
  color: '#9BA8C0',
  fontSize: 18,
  cursor: 'pointer',
  padding: 6,
  lineHeight: 1,
}

const modalHeaderStyle: React.CSSProperties = {
  marginBottom: 22,
}

const kickerStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
  color: '#C9A84C',
  marginBottom: 8,
}

const titleStyle: React.CSSProperties = {
  fontFamily: "'Playfair Display', Georgia, serif",
  fontSize: 24,
  fontWeight: 700,
  lineHeight: 1.2,
  margin: '0 0 6px',
  color: '#F2EEE7',
}

const subStyle: React.CSSProperties = {
  fontSize: 14,
  color: '#9BA8C0',
  margin: 0,
  lineHeight: 1.5,
}

const fieldLabelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: '0.12em',
  textTransform: 'uppercase' as const,
  color: '#9BA8C0',
  marginBottom: 6,
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '11px 14px',
  background: 'rgba(11,27,62,0.6)',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 8,
  color: '#F2EEE7',
  fontSize: 14,
  fontFamily: 'inherit',
  outline: 'none',
}

const primaryBtnStyle: React.CSSProperties = {
  padding: '12px 22px',
  background: '#C9A84C',
  color: '#0B1B3E',
  fontWeight: 700,
  fontSize: 14,
  borderRadius: 10,
  border: 'none',
  cursor: 'pointer',
  letterSpacing: '0.01em',
}

const secondaryBtnStyle: React.CSSProperties = {
  padding: '12px 22px',
  background: 'rgba(255,255,255,0.04)',
  color: '#F2EEE7',
  fontWeight: 600,
  fontSize: 14,
  borderRadius: 10,
  border: '1px solid rgba(255,255,255,0.12)',
  cursor: 'pointer',
}

const errBoxStyle: React.CSSProperties = {
  background: 'rgba(168,51,46,0.15)',
  border: '1px solid rgba(168,51,46,0.45)',
  borderRadius: 8,
  padding: '10px 14px',
  fontSize: 13,
  color: '#f0a0a0',
  marginBottom: 12,
}

const successBoxStyle: React.CSSProperties = {
  textAlign: 'center',
  padding: '16px 4px 8px',
}

const submitterRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '10px 14px',
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.06)',
  borderRadius: 8,
  marginBottom: 8,
  textAlign: 'left',
}
