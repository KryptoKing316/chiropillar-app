'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import LOITemplateSelector from '@/components/dashboard/loi/LOITemplateSelector'
import LOIEditor from '@/components/dashboard/loi/LOIEditor'
import LOIPreview from '@/components/dashboard/loi/LOIPreview'
import { TEMPLATES, renderTemplate } from '@/lib/loi-templates'
import type { TemplateType } from '@/lib/loi-templates'

type Step = 1 | 2 | 3

export default function NewLOIPage() {
  const router = useRouter()

  const [step, setStep] = useState<Step>(1)
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType | null>(null)
  const [fields, setFields] = useState<Record<string, string>>({})
  const [loiHtml, setLoiHtml] = useState<string>('')
  const [aiLoading, setAiLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)
  const [confirmSend, setConfirmSend] = useState(false)
  const [dealId, setDealId] = useState<string | null>(null)
  const [session, setSession] = useState<{ access_token: string } | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setSession(data.session)
        // Get user's deal
        supabase
          .from('deals')
          .select('id')
          .eq('seller_id', data.session.user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()
          .then(({ data: deal }) => {
            if (deal) setDealId(deal.id)
          })
      }
    })
  }, [])

  // Regenerate HTML whenever fields change
  useEffect(() => {
    if (!selectedTemplate || Object.keys(fields).length === 0) return
    const template = TEMPLATES[selectedTemplate]
    const rendered = renderTemplate(template, fields)
    setLoiHtml(rendered)
  }, [fields, selectedTemplate])

  function handleFieldChange(key: string, value: string) {
    setFields((prev) => ({ ...prev, [key]: value }))
  }

  async function handleContinueFromStep1() {
    if (!selectedTemplate) return
    setStep(2)
    setAiLoading(true)

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (session?.access_token) headers['Authorization'] = `Bearer ${session.access_token}`

      const res = await fetch('/api/loi/generate', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          deal_id: dealId,
          template_type: selectedTemplate,
        }),
      })

      const data = await res.json() as { fields?: Record<string, string>; deal_id?: string; error?: string }

      if (data.fields) {
        setFields(data.fields)
        if (data.deal_id) setDealId(data.deal_id)
      } else {
        console.error('AI fill error:', data.error)
        // Use empty fields, user fills manually
      }
    } catch (err) {
      console.error('AI fill fetch error:', err)
    } finally {
      setAiLoading(false)
    }
  }

  async function handleSendForSignature() {
    if (!selectedTemplate || !loiHtml) return
    setSending(true)
    setSendError(null)

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (session?.access_token) headers['Authorization'] = `Bearer ${session.access_token}`

      // 1. Create LOI record in Supabase
      const { data: { session: latestSession } } = await supabase.auth.getSession()
      const userId = latestSession?.user.id

      const loiInsert = {
        deal_id: dealId,
        buyer_id: userId,
        created_by: userId,
        template_type: selectedTemplate,
        loi_data: fields,
        loi_html: loiHtml,
        status: 'draft',
      }

      const { data: newLoi, error: insertErr } = await supabase
        .from('lois')
        .insert(loiInsert)
        .select('id')
        .single()

      if (insertErr || !newLoi) {
        // Demo mode, skip DB insert and show success
        setSendError(null)
        router.push('/loi')
        return
      }

      // 2. Send to DocuSign / create envelope
      const envelopeRes = await fetch('/api/loi/create-envelope', {
        method: 'POST',
        headers,
        body: JSON.stringify({ loi_id: newLoi.id }),
      })

      const envelopeData = await envelopeRes.json() as {
        success?: boolean
        status?: string
        notConfigured?: boolean
        error?: string
        envelope_id?: string
      }

      if (envelopeData.success) {
        router.push(`/loi/${newLoi.id}`)
      } else if (envelopeData.notConfigured) {
        // DocuSign not set up, still show success
        router.push(`/loi/${newLoi.id}`)
      } else {
        setSendError(envelopeData.error || 'Something went wrong. Please try again.')
      }
    } catch (err) {
      setSendError(err instanceof Error ? err.message : 'Failed to send LOI')
    } finally {
      setSending(false)
      setConfirmSend(false)
    }
  }

  const template = selectedTemplate ? TEMPLATES[selectedTemplate] : null

  return (
    <div style={{
      padding: '40px',
      fontFamily: "'Inter', system-ui, sans-serif",
      color: 'var(--kb-text)',
      maxWidth: '1400px',
      margin: '0 auto',
    }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <button
          onClick={() => step === 1 ? router.push('/loi') : setStep((s) => (s - 1) as Step)}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--kb-text-secondary)',
            fontSize: '14px',
            cursor: 'pointer',
            padding: '0',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontFamily: "'Inter', system-ui, sans-serif",
          }}
        >
          ← {step === 1 ? 'Back to LOI List' : 'Back'}
        </button>

        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: '28px',
          color: 'var(--kb-text)',
          marginBottom: '8px',
        }}>
          Create Letter of Intent
        </h1>

        {/* Step indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '16px' }}>
          {[
            { n: 1, label: 'Choose Structure' },
            { n: 2, label: 'Review & Edit' },
            { n: 3, label: 'Preview & Send' },
          ].map(({ n, label }, idx) => (
            <div key={n} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {idx > 0 && (
                <div style={{ width: '32px', height: '1px', background: step > n ? '#C9A84C' : 'rgba(255,255,255,0.08)' }} />
              )}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}>
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: step === n ? '#C9A84C' : step > n ? 'rgba(201,168,76,0.3)' : 'rgba(255,255,255,0.08)',
                  color: step === n ? 'var(--kb-bg)' : step > n ? '#C9A84C' : 'var(--kb-text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '13px',
                  fontWeight: 590,
                  flexShrink: 0,
                }}>
                  {step > n ? '✓' : n}
                </div>
                <span style={{
                  fontSize: '13px',
                  color: step === n ? 'var(--kb-text)' : step > n ? 'var(--kb-text-secondary)' : 'var(--kb-text-muted)',
                  fontWeight: step === n ? 600 : 400,
                }}>
                  {label}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ============================================================ */}
      {/* STEP 1: TEMPLATE SELECTOR */}
      {/* ============================================================ */}
      {step === 1 && (
        <div>
          <LOITemplateSelector
            selected={selectedTemplate}
            onSelect={setSelectedTemplate}
          />

          <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={handleContinueFromStep1}
              disabled={!selectedTemplate}
              style={{
                padding: '14px 36px',
                background: selectedTemplate ? '#C9A84C' : 'rgba(201,168,76,0.3)',
                color: 'var(--kb-bg)',
                fontWeight: 590,
                fontSize: '16px',
                border: 'none',
                borderRadius: '8px',
                cursor: selectedTemplate ? 'pointer' : 'not-allowed',
                fontFamily: "'Inter', system-ui, sans-serif",
              }}
            >
              Continue →
            </button>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* STEP 2: EDITOR + LIVE PREVIEW */}
      {/* ============================================================ */}
      {step === 2 && template && (
        <div>
          {aiLoading && (
            <div style={{
              padding: '20px',
              background: 'var(--kb-accent-dim)',
              border: '1px solid var(--kb-accent-border)',
              borderRadius: '10px',
              marginBottom: '28px',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              color: 'var(--kb-accent)',
            }}>
              <div style={{
                width: '20px',
                height: '20px',
                border: '2px solid rgba(201,168,76,0.3)',
                borderTopColor: '#C9A84C',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
                flexShrink: 0,
              }} />
              <div>
                <div style={{ fontWeight: 590, marginBottom: '3px' }}>AI is pre-filling your offer...</div>
                <div style={{ fontSize: '13px', color: 'var(--kb-text-secondary)' }}>
                  Claude is reading your deal data and writing the LOI. This takes 5–10 seconds.
                </div>
              </div>
            </div>
          )}

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '32px',
            alignItems: 'start',
          }}>
            {/* Left: Editor */}
            <div style={{
              background: 'var(--kb-bg-panel)',
              border: '1px solid var(--kb-border)',
              borderRadius: '8px',
              padding: '28px 32px',
            }}>
              <h2 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: '20px',
                color: 'var(--kb-text)',
                marginBottom: '4px',
              }}>
                {template.name}
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--kb-text-secondary)', marginBottom: '24px' }}>
                {template.description}
              </p>

              {!aiLoading && (
                <LOIEditor
                  template={template}
                  fields={fields}
                  onChange={handleFieldChange}
                />
              )}
            </div>

            {/* Right: Live Preview */}
            <div style={{ position: 'sticky', top: '24px' }}>
              <div style={{
                fontSize: '12px',
                fontWeight: 590,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--kb-text-muted)',
                marginBottom: '12px',
              }}>
                Live Preview
              </div>
              <LOIPreview loiHtml={loiHtml} compact />
            </div>
          </div>

          <div style={{
            marginTop: '32px',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
          }}>
            <button
              onClick={() => setStep(3)}
              disabled={Object.keys(fields).length === 0}
              style={{
                padding: '14px 36px',
                background: Object.keys(fields).length > 0 ? '#C9A84C' : 'rgba(201,168,76,0.3)',
                color: 'var(--kb-bg)',
                fontWeight: 590,
                fontSize: '16px',
                border: 'none',
                borderRadius: '8px',
                cursor: Object.keys(fields).length > 0 ? 'pointer' : 'not-allowed',
                fontFamily: "'Inter', system-ui, sans-serif",
              }}
            >
              Looks Good → Preview & Send
            </button>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* STEP 3: FULL PREVIEW + SEND */}
      {/* ============================================================ */}
      {step === 3 && (
        <div>
          <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h2 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: '22px',
                color: 'var(--kb-text)',
                marginBottom: '4px',
              }}>
                Review Your LOI
              </h2>
              <p style={{ fontSize: '14px', color: 'var(--kb-text-secondary)' }}>
                This is exactly what the buyer and seller will see. Review carefully before sending.
              </p>
            </div>

            {!confirmSend ? (
              <button
                onClick={() => setConfirmSend(true)}
                style={{
                  padding: '14px 32px',
                  background: 'var(--kb-accent)',
                  color: 'var(--kb-bg)',
                  fontWeight: 590,
                  fontSize: '15px',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontFamily: "'Inter', system-ui, sans-serif",
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                 Send for Signature
              </button>
            ) : (
              <div style={{
                background: 'var(--kb-bg-panel)',
                border: '1px solid var(--kb-accent-border)',
                borderRadius: '12px',
                padding: '20px 24px',
                maxWidth: '440px',
              }}>
                <div style={{ fontSize: '15px', fontWeight: 590, color: 'var(--kb-text)', marginBottom: '8px' }}>
                  Ready to send this LOI?
                </div>
                <div style={{ fontSize: '14px', color: 'var(--kb-text-secondary)', marginBottom: '16px', lineHeight: 1.6 }}>
                  This will send the offer to{' '}
                  <strong style={{ color: 'var(--kb-text)' }}>{fields.seller_name || 'the seller'}</strong>{' '}
                  {fields.seller_email ? `at ${fields.seller_email}` : ''}. Both parties will sign electronically.
                </div>

                {sendError && (
                  <div style={{
                    padding: '10px 14px',
                    background: 'rgba(248,113,113,0.1)',
                    border: '1px solid rgba(248,113,113,0.3)',
                    borderRadius: '8px',
                    color: '#f87171',
                    fontSize: '14px',
                    marginBottom: '14px',
                  }}>
                    {sendError}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={handleSendForSignature}
                    disabled={sending}
                    style={{
                      flex: 1,
                      padding: '12px',
                      background: sending ? 'rgba(201,168,76,0.5)' : '#C9A84C',
                      color: 'var(--kb-bg)',
                      fontWeight: 590,
                      fontSize: '14px',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: sending ? 'not-allowed' : 'pointer',
                      fontFamily: "'Inter', system-ui, sans-serif",
                    }}
                  >
                    {sending ? 'Sending...' : 'Send LOI'}
                  </button>
                  <button
                    onClick={() => setConfirmSend(false)}
                    style={{
                      padding: '12px 20px',
                      background: 'transparent',
                      border: '1px solid var(--kb-border)',
                      borderRadius: '8px',
                      color: 'var(--kb-text-secondary)',
                      fontSize: '14px',
                      cursor: 'pointer',
                      fontFamily: "'Inter', system-ui, sans-serif",
                    }}
                  >
                    Edit More
                  </button>
                </div>
              </div>
            )}
          </div>

          <LOIPreview loiHtml={loiHtml} />
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
