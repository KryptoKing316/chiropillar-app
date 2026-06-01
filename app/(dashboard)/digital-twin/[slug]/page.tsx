'use client'
import { useState, useEffect, useRef, useCallback, use } from 'react'

// ─── Design Tokens ─────────────────────────────────────────────────────────────
const C = {
  navy: 'var(--kb-bg)', card: 'var(--kb-bg-panel)', card2: 'var(--kb-bg-surface)',
  gold: 'var(--kb-accent)', goldDim: 'var(--kb-accent-dim)', goldBorder: 'var(--kb-accent-border)',
  green: 'var(--kb-green)', greenDim: 'var(--kb-accent-dim)', greenBorder: 'rgba(46,204,139,0.22)',
  blue: '#5b8dee', blueDim: 'rgba(91,141,238,0.10)', blueBorder: 'rgba(91,141,238,0.22)',
  text: 'var(--kb-text)', muted: 'var(--kb-text-secondary)', readable: 'var(--kb-text-secondary)',
  border: 'var(--kb-border)', faint: 'var(--kb-text-muted)',
}
const F = { display: "'Playfair Display', serif", body: "'Inter', system-ui, sans-serif", mono: "'DM Mono', monospace" }
const card = { background: C.card, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '24px 28px' } as React.CSSProperties

// ─── Advisor Interview Modules (reframed for advisors, not sellers) ─────────────
const ADVISOR_MODULES = [
  {
    id: 'philosophy', num: '01', title: 'Philosophy & Framework',
    subtitle: 'The principles behind 20 years of advisory work',
    questions: [
      'How do you fundamentally think about business exit planning — what is it really about for the owner at its core?',
      'What is the single most important question you ask a new client in your very first meeting together?',
      'Walk me through your process from the initial call to a signed engagement letter.',
      'What do most business owners get fundamentally wrong about selling their company?',
      'How has your advisory philosophy evolved across 20 years and 1,000+ exits?',
    ],
  },
  {
    id: 'ideal-client', num: '02', title: 'Your Ideal Client',
    subtitle: 'Who you do your absolute best work for',
    questions: [
      'Describe the client you do your absolute best work for — business size, situation, mindset.',
      'What signals tell you a client is truly ready to sell versus just curious about the idea?',
      'What type of client or situation is genuinely not a good fit for your firm?',
      'How do you evaluate whether a business is actually sellable at the price the owner has in mind?',
      'What is the most common gap between what an owner thinks their business is worth and what the market will actually pay?',
    ],
  },
  {
    id: 'deal-structures', num: '03', title: 'Deal Structures & Capital',
    subtitle: 'How the money actually works at the closing table',
    questions: [
      'Walk me through the main deal structures you use — SBA 7(a), seller note, equity rollover, full cash.',
      'When do you recommend seller financing and when do you actively recommend against it?',
      'What is your framework for advising on equity rollover — keeping a piece of the business post-sale?',
      'How do PE firms and family offices evaluate deals differently than individual buyers or search funds?',
      'What does a buyer actually need to qualify for SBA 7(a) financing in today\'s lending environment?',
    ],
  },
  {
    id: 'trusts-estate', num: '04', title: 'Trust & Estate Structures',
    subtitle: 'Protecting wealth before, during, and after the closing',
    questions: [
      'What trust structures do you most commonly set up for business owners selling above $5M?',
      'How do you coordinate with the seller\'s CPA and estate attorney through a transaction?',
      'What is the most common tax mistake you see sellers make during or right before a transaction?',
      'How do you protect a seller\'s wealth after closing — what happens to the proceeds?',
      'When does it make sense for an owner to sell inside a trust versus personally?',
    ],
  },
  {
    id: 'what-kills-deals', num: '05', title: 'What Kills Deals',
    subtitle: 'The patterns that derail transactions',
    questions: [
      'What are the top three reasons deals fall apart after a Letter of Intent is signed?',
      'What seller behaviors or mindsets consistently kill deals, even strong ones?',
      'What due diligence discoveries most often derail transactions you thought were solid?',
      'How do you handle it when a seller changes their mind or gets cold feet mid-process?',
      'What is the most common buyer mistake you see in transactions?',
    ],
  },
  {
    id: 'advisory-process', num: '06', title: 'The Advisory Process',
    subtitle: 'What working with your firm actually looks like',
    questions: [
      'Walk me through the full engagement from the first conversation to the closing wire.',
      'What does your firm charge and how is the fee structured — upfront, success fee, or both?',
      'What do you do for a client that a standard business broker cannot or will not do?',
      'How long does a typical transaction take from engagement letter to closing?',
      'What is the most valuable thing you bring to a transaction that never appears on any checklist?',
    ],
  },
  {
    id: 'client-stories', num: '07', title: 'Client Stories & Lessons',
    subtitle: 'Real wisdom that only comes from 1,000+ exits',
    questions: [
      'Tell me about a transaction you are most proud of — what made it work when it could have failed?',
      'Tell me about a deal that almost fell apart and how you saved it.',
      'What is the single biggest pattern you have observed across 1,000 or more business exits?',
      'What does a client transformation look like — from stressed seller to liberated, confident next chapter?',
      'What do clients say they wish they had known before they started the exit process?',
    ],
  },
  {
    id: 'vision-story', num: '08', title: 'Your Story & Vision',
    subtitle: 'Why you do this work and where it is heading',
    questions: [
      'How did you end up in exit planning and M&A advisory — what is the origin story?',
      'What drives you to keep doing this work after 20 years?',
      'Where is the business exit market headed over the next five years?',
      'What is your vision for your firm in the next phase of growth?',
      'What advice would you give a business owner who is five years away from wanting to sell?',
    ],
  },
]

type Answers = Record<string, Record<number, string>>
type ChatMsg = { role: 'user' | 'assistant'; content: string }
type Source = { type: string; name: string; count: number; created_at: string }
type Persona = {
  id: string; slug: string; name: string; title: string; company: string
  expertise: string; avatar_url: string; greeting: string; persona_type: string
  is_published: boolean
}

// ─── Interview Tab ──────────────────────────────────────────────────────────────
function InterviewTab({
  answers, setAnswers, onSaveAnswer,
}: {
  answers: Answers
  setAnswers: (a: Answers) => void
  onSaveAnswer: (moduleId: string, qIdx: number, answer: string) => Promise<void>
}) {
  const [activeModule, setActiveModule] = useState(0)
  const [activeQ, setActiveQ] = useState(0)
  const [draft, setDraft] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recRef = useRef<any>(null)
  const [recording, setRecording] = useState(false)

  const mod = ADVISOR_MODULES[activeModule]
  const currentAnswer = answers[mod.id]?.[activeQ] ?? ''

  useEffect(() => { setDraft(currentAnswer) }, [activeModule, activeQ, currentAnswer])

  const totalAnswered = ADVISOR_MODULES.reduce((s, m) =>
    s + Object.keys(answers[m.id] ?? {}).length, 0)
  const totalQ = ADVISOR_MODULES.reduce((s, m) => s + m.questions.length, 0)

  const saveAnswer = async () => {
    if (!draft.trim()) return
    setSaving(true)
    const updated = { ...answers, [mod.id]: { ...(answers[mod.id] ?? {}), [activeQ]: draft.trim() } }
    setAnswers(updated)
    await onSaveAnswer(mod.id, activeQ, draft.trim())
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 1800)
  }

  const next = async () => {
    if (draft.trim() && draft.trim() !== currentAnswer) await saveAnswer()
    if (activeQ < mod.questions.length - 1) { setActiveQ(activeQ + 1) }
    else if (activeModule < ADVISOR_MODULES.length - 1) { setActiveModule(activeModule + 1); setActiveQ(0) }
  }

  const startVoice = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) { alert('Voice input is not supported in this browser. Please use Chrome or Safari.'); return }
    const rec = new SR()
    rec.continuous = true
    rec.interimResults = true
    rec.lang = 'en-US'
    let final = draft
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onresult = (e: any) => {
      let interim = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) final += e.results[i][0].transcript
        else interim = e.results[i][0].transcript
      }
      setDraft(final + interim)
    }
    rec.onend = () => setRecording(false)
    recRef.current = rec
    rec.start()
    setRecording(true)
  }

  const stopVoice = () => { recRef.current?.stop(); setRecording(false) }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '20px' }}>
      {/* Module sidebar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div style={{ fontFamily: F.mono, fontSize: '10px', color: C.faint, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '8px' }}>
          {totalAnswered}/{totalQ} answered
        </div>
        {ADVISOR_MODULES.map((m, i) => {
          const count = Object.keys(answers[m.id] ?? {}).length
          const done = count === m.questions.length
          const active = i === activeModule
          return (
            <button key={m.id} onClick={() => { setActiveModule(i); setActiveQ(0) }}
              style={{ textAlign: 'left', padding: '10px 14px', borderRadius: '10px', border: `1px solid ${active ? C.goldBorder : C.border}`, background: active ? C.goldDim : 'transparent', cursor: 'pointer', color: active ? C.gold : done ? C.green : C.muted, fontSize: '13px', fontWeight: active ? 600 : 400, transition: 'all 0.15s' }}>
              <span style={{ fontFamily: F.mono, fontSize: '10px', marginRight: '6px', opacity: 0.6 }}>{m.num}</span>
              {done && <span style={{ marginRight: '4px' }}><svg viewBox="0 0 14 14" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3,7 6,10 11,4"/></svg></span>}
              {m.title}
              <div style={{ fontSize: '10px', color: C.faint, marginTop: '2px', fontFamily: F.mono }}>{count}/{m.questions.length}</div>
            </button>
          )
        })}
      </div>

      {/* Question area */}
      <div>
        <div style={{ fontFamily: F.mono, fontSize: '10px', color: C.gold, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '6px' }}>{mod.num} — {mod.title}</div>
        <div style={{ fontSize: '13px', color: C.muted, marginBottom: '20px' }}>{mod.subtitle}</div>

        {/* Question tabs */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', flexWrap: 'wrap' }}>
          {mod.questions.map((_, qi) => {
            const answered = !!answers[mod.id]?.[qi]
            const active = qi === activeQ
            return (
              <button key={qi} onClick={() => setActiveQ(qi)}
                style={{ width: '36px', height: '36px', borderRadius: '8px', border: `1px solid ${active ? C.goldBorder : answered ? C.greenBorder : C.border}`, background: active ? C.goldDim : answered ? C.greenDim : 'transparent', color: active ? C.gold : answered ? C.green : C.faint, fontSize: '13px', fontWeight: 590, cursor: 'pointer' }}>
                {answered ? '✓' : qi + 1}
              </button>
            )
          })}
        </div>

        {/* Current question */}
        <div style={{ background: 'rgba(201,168,76,0.05)', border: `1px solid ${C.goldBorder}`, borderRadius: '12px', padding: '18px 22px', marginBottom: '16px' }}>
          <div style={{ fontFamily: F.mono, fontSize: '10px', color: C.gold, letterSpacing: '0.12em', marginBottom: '10px', opacity: 0.7 }}>QUESTION {activeQ + 1} OF {mod.questions.length}</div>
          <div style={{ fontSize: '17px', color: C.text, lineHeight: 1.65, fontFamily: F.display, fontWeight: 500 }}>{mod.questions[activeQ]}</div>
        </div>

        {/* Answer area */}
        <textarea
          value={draft}
          onChange={e => setDraft(e.target.value)}
          placeholder="Type your answer here, or use voice recording below..."
          rows={6}
          style={{ width: '100%', boxSizing: 'border-box', background: 'var(--kb-bg-raised)', border: `1px solid ${C.border}`, borderRadius: '12px', padding: '16px 18px', color: C.text, fontSize: '16px', fontFamily: F.body, resize: 'vertical', lineHeight: 1.65, outline: 'none' }}
        />

        {/* Actions */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <button onClick={recording ? stopVoice : startVoice}
            style={{ padding: '10px 18px', background: recording ? 'rgba(231,76,60,0.15)' : C.goldDim, border: `1px solid ${recording ? 'rgba(231,76,60,0.4)' : C.goldBorder}`, borderRadius: '10px', color: recording ? '#E74C3C' : C.gold, fontSize: '14px', cursor: 'pointer', fontFamily: F.body }}>
            {recording ? ' Stop Recording' : ' Speak Answer'}
          </button>

          <button onClick={saveAnswer} disabled={!draft.trim() || saving}
            style={{ padding: '10px 22px', background: !draft.trim() ? 'transparent' : C.gold, border: `1px solid ${!draft.trim() ? C.border : C.gold}`, borderRadius: '10px', color: !draft.trim() ? C.faint : 'var(--kb-bg)', fontSize: '14px', fontWeight: 590, cursor: !draft.trim() ? 'default' : 'pointer', fontFamily: F.body }}>
            {saving ? '⟳ Saving...' : saved ? '<svg viewBox="0 0 14 14" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3,7 6,10 11,4"/></svg> Saved' : 'Save Answer'}
          </button>

          <button onClick={next}
            style={{ padding: '10px 22px', background: 'transparent', border: `1px solid ${C.border}`, borderRadius: '10px', color: C.muted, fontSize: '14px', cursor: 'pointer', fontFamily: F.body, marginLeft: 'auto' }}>
            {activeQ < mod.questions.length - 1 ? 'Next Question →' : activeModule < ADVISOR_MODULES.length - 1 ? 'Next Module →' : 'Finish <svg viewBox="0 0 14 14" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3,7 6,10 11,4"/></svg>'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Knowledge Tab (admin: upload transcripts/docs) ─────────────────────────────
function KnowledgeTab({ personaId, sources, onRefresh }: { personaId: string; sources: Source[]; onRefresh: () => void }) {
  const [mode, setMode] = useState<'pdf' | 'text' | 'video'>('pdf')
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [knowledgeSources, setKnowledgeSources] = useState<{source_type: string; source_name: string; chunks: number; created_at: string}[]>([])
  const [loadingKB, setLoadingKB] = useState(true)

  useEffect(() => {
    fetch(`/api/digital-twin/knowledge?persona_id=${personaId}`)
      .then(r => r.json())
      .then(d => { setKnowledgeSources(d.sources || []); setLoadingKB(false) })
      .catch(() => setLoadingKB(false))
  }, [personaId, result])
  const [transcript, setTranscript] = useState('')
  const [sourceName, setSourceName] = useState('')
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file?.type === 'application/pdf') {
      setPdfFile(file)
      if (!sourceName.trim()) setSourceName(file.name.replace(/\.pdf$/i, ''))
      setResult(null)
    } else {
      setResult({ ok: false, msg: 'Only PDF files are supported. Please drop a .pdf file.' })
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPdfFile(file)
      if (!sourceName.trim()) setSourceName(file.name.replace(/\.pdf$/i, ''))
      setResult(null)
    }
  }

  const uploadPdf = async () => {
    if (!pdfFile || !sourceName.trim()) return
    setUploading(true)
    setResult(null)
    try {
      const form = new FormData()
      form.append('file', pdfFile)
      form.append('persona_id', personaId)
      form.append('source_name', sourceName.trim())
      const res = await fetch('/api/digital-twin/parse-pdf', { method: 'POST', body: form })
      const data = await res.json()
      if (data.success) {
        setResult({ ok: true, msg: `<svg viewBox="0 0 14 14" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3,7 6,10 11,4"/></svg> Stored ${data.chunks_stored} chunks from "${sourceName}" (${data.pages} pages, ${(data.characters / 1000).toFixed(1)}K chars)` })
        setPdfFile(null)
        setSourceName('')
        if (fileInputRef.current) fileInputRef.current.value = ''
        onRefresh()
      } else {
        setResult({ ok: false, msg: data.error ?? 'Upload failed' })
      }
    } catch {
      setResult({ ok: false, msg: 'Network error — please try again' })
    }
    setUploading(false)
  }

  const uploadText = async () => {
    if (!transcript.trim() || !sourceName.trim()) return
    setUploading(true)
    setResult(null)
    try {
      const res = await fetch('/api/digital-twin/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ persona_id: personaId, source_type: 'transcript', source_name: sourceName.trim(), content: transcript }),
      })
      const data = await res.json()
      if (data.success) {
        setResult({ ok: true, msg: `<svg viewBox="0 0 14 14" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3,7 6,10 11,4"/></svg> Stored ${data.chunks_stored} knowledge chunks from "${sourceName}"` })
        setTranscript('')
        setSourceName('')
        onRefresh()
      } else {
        setResult({ ok: false, msg: data.error ?? 'Upload failed' })
      }
    } catch {
      setResult({ ok: false, msg: 'Network error — please try again' })
    }
    setUploading(false)
  }

  const deleteSource = async (name: string) => {
    setDeleting(name)
    await fetch('/api/digital-twin/ingest', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ persona_id: personaId, source_name: name }),
    })
    onRefresh()
    setDeleting(null)
  }

  const canSubmit = mode === 'pdf' ? (!!pdfFile && !!sourceName.trim()) : (!!transcript.trim() && !!sourceName.trim())

  return (
    <div>
      {/* Existing sources */}
      {sources.length > 0 && (
        <div style={{ ...card, marginBottom: '24px' }}>
          <div style={{ fontFamily: F.mono, fontSize: '10px', color: C.gold, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '16px' }}>
            Knowledge Base — {sources.reduce((s, x) => s + x.count, 0)} total chunks
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {sources.map(s => (
              <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: 'var(--kb-bg-raised)', border: `1px solid ${C.border}`, borderRadius: '10px' }}>
                <div style={{ fontSize: '18px' }}>{s.type === 'document' ? '' : s.type === 'transcript' ? '' : ''}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: 510, color: C.text }}>{s.name}</div>
                  <div style={{ fontSize: '11px', color: C.faint, fontFamily: F.mono }}>{s.type} · {s.count} chunks · {new Date(s.created_at).toLocaleDateString()}</div>
                </div>
                <button onClick={() => deleteSource(s.name)} disabled={deleting === s.name}
                  style={{ padding: '5px 12px', background: 'transparent', border: '1px solid rgba(231,76,60,0.3)', borderRadius: '6px', color: deleting === s.name ? C.faint : '#E74C3C', fontSize: '12px', cursor: deleting === s.name ? 'default' : 'pointer', fontFamily: F.body }}>
                  {deleting === s.name ? 'Removing...' : 'Remove'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mode toggle */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        {(['pdf', 'text', 'video'] as const).map(m => (
          <button key={m} onClick={() => { setMode(m); setResult(null) }}
            style={{ padding: '9px 22px', borderRadius: '8px', border: `1px solid ${mode === m ? C.goldBorder : C.border}`, background: mode === m ? C.goldDim : 'transparent', color: mode === m ? C.gold : C.muted, fontSize: '13px', fontWeight: 590, cursor: 'pointer', fontFamily: F.body }}>
            {m === 'pdf' ? 'Upload PDF' : m === 'video' ? 'Video / Audio' : 'Paste Text'}
          </button>
        ))}
      </div>

      <div style={{ ...card }}>
        <div style={{ fontFamily: F.mono, fontSize: '10px', color: C.gold, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '18px' }}>
          {mode === 'pdf' ? 'Add Knowledge: PDF Upload' : mode === 'video' ? 'Add Knowledge: Video / Audio Transcription' : 'Add Knowledge: Paste Text'}
        </div>

        {/* Source name — shared */}
        <div style={{ marginBottom: '14px' }}>
          <label style={{ display: 'block', fontSize: '13px', color: C.muted, marginBottom: '6px' }}>
            Source Name (e.g. &quot;Scott Interview March 2025&quot; or &quot;Nexxess Framework&quot;)
          </label>
          <input
            value={sourceName}
            onChange={e => setSourceName(e.target.value)}
            placeholder="Give this source a clear name..."
            style={{ width: '100%', boxSizing: 'border-box', padding: '12px 16px', background: 'var(--kb-bg-raised)', border: `1px solid ${C.border}`, borderRadius: '10px', color: C.text, fontSize: '15px', fontFamily: F.body, outline: 'none' }}
          />
        </div>

        {/* PDF mode */}
        {mode === 'pdf' && (
          <div style={{ marginBottom: '14px' }}>
            <input ref={fileInputRef} type="file" accept="application/pdf" onChange={handleFileSelect} style={{ display: 'none' }} />
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={e => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleFileDrop}
              style={{
                border: `2px dashed ${dragOver ? C.gold : pdfFile ? C.green : C.border}`,
                borderRadius: '12px',
                padding: '40px 24px',
                textAlign: 'center',
                cursor: 'pointer',
                background: dragOver ? C.goldDim : pdfFile ? C.greenDim : 'rgba(255,255,255,0.02)',
                transition: 'all 0.2s',
              }}
            >
              {pdfFile ? (
                <>
                  <div style={{ marginBottom: "12px", color: "#C9A84C" }}><svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/></svg></div>
                  <div style={{ fontSize: '15px', fontWeight: 590, color: C.green, marginBottom: '4px' }}>{pdfFile.name}</div>
                  <div style={{ fontSize: '12px', color: C.faint }}>{(pdfFile.size / 1024).toFixed(0)} KB · Click to change</div>
                </>
              ) : (
                <>
                  <div style={{ marginBottom: "12px", color: "#C9A84C" }}><svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/></svg></div>
                  <div style={{ fontSize: '15px', fontWeight: 590, color: C.text, marginBottom: '6px' }}>Drop PDF here or click to browse</div>
                  <div style={{ fontSize: '12px', color: C.faint }}>White papers, transcripts, frameworks, reports · Up to 50MB</div>
                </>
              )}
            </div>
            {pdfFile && (
              <div style={{ fontSize: '12px', color: C.faint, marginTop: '8px', fontFamily: F.mono }}>
                Ready to process · text will be extracted and split into ~1,800 char chunks automatically
              </div>
            )}
          </div>
        )}

        {/* Text mode */}
        {mode === 'text' && (
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '13px', color: C.muted, marginBottom: '6px' }}>
              Content — paste interview transcript, white paper text, or framework document
            </label>
            <textarea
              value={transcript}
              onChange={e => setTranscript(e.target.value)}
              placeholder="Paste the full transcript or document text here. Long documents will be automatically split into chunks..."
              rows={14}
              style={{ width: '100%', boxSizing: 'border-box', padding: '14px 16px', background: 'var(--kb-bg-raised)', border: `1px solid ${C.border}`, borderRadius: '10px', color: C.text, fontSize: '15px', fontFamily: F.body, resize: 'vertical', lineHeight: 1.6, outline: 'none' }}
            />
            <div style={{ fontSize: '12px', color: C.faint, marginTop: '6px', fontFamily: F.mono }}>
              {transcript.length > 0 ? `~${Math.ceil(transcript.split(/\s+/).length / 250)} min read · ~${Math.ceil(transcript.length / 1800)} chunks` : 'Accepts transcripts, white papers, frameworks, Q&A sessions — any text'}
            </div>
          </div>
        )}

        {result && (
          <div style={{ padding: '12px 16px', background: result.ok ? C.greenDim : 'rgba(231,76,60,0.08)', border: `1px solid ${result.ok ? C.greenBorder : 'rgba(231,76,60,0.3)'}`, borderRadius: '8px', fontSize: '14px', color: result.ok ? C.green : '#E74C3C', marginBottom: '14px' }}>
            {result.msg}
          </div>
        )}

        {/* Video upload mode */}
        {mode === 'video' && (
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '13px', color: C.muted, marginBottom: '6px' }}>
              Upload a video or audio recording (MP4, MOV, MP3, WAV, M4A). Max 25MB.
            </label>
            <input
              type="file"
              accept="video/*,audio/*,.mp4,.mov,.mp3,.wav,.m4a,.webm"
              onChange={e => {
                const f = e.target.files?.[0]
                if (f) { setVideoFile(f); if (!sourceName.trim()) setSourceName(f.name.replace(/\.[^.]+$/, '')); setResult(null) }
              }}
              style={{ width: '100%', padding: '14px', background: 'var(--kb-bg-raised)', border: `1px solid ${C.border}`, borderRadius: '8px', color: C.text, fontSize: '14px' }}
            />
            {videoFile && (
              <div style={{ fontSize: '13px', color: C.green, marginTop: '8px', fontFamily: F.mono }}>
                {videoFile.name} ({(videoFile.size / 1024 / 1024).toFixed(1)} MB) ready for transcription
              </div>
            )}
            <div style={{ fontSize: '12px', color: C.faint, marginTop: '6px' }}>
              Video will be transcribed using AI and automatically added to the knowledge base. For longer recordings, split into 25MB segments.
            </div>
          </div>
        )}

        {result && (
          <div style={{ padding: '12px 16px', background: result.ok ? C.greenDim : 'rgba(231,76,60,0.08)', border: `1px solid ${result.ok ? C.greenBorder : 'rgba(231,76,60,0.3)'}`, borderRadius: '8px', fontSize: '14px', color: result.ok ? C.green : '#E74C3C', marginBottom: '14px' }}>
            {result.msg}
          </div>
        )}

        <button
          onClick={async () => {
            if (mode === 'video' && videoFile) {
              setUploading(true); setResult(null)
              try {
                const form = new FormData()
                form.append('file', videoFile)
                form.append('persona_id', personaId)
                form.append('source_name', sourceName.trim() || videoFile.name)
                const res = await fetch('/api/digital-twin/transcribe', { method: 'POST', body: form })
                const data = await res.json()
                if (data.success) {
                  setResult({ ok: true, msg: `Transcribed and stored ${data.chunks_stored} chunks. Preview: "${data.preview?.slice(0, 100)}..."` })
                  setVideoFile(null); setSourceName(''); onRefresh()
                } else {
                  setResult({ ok: false, msg: data.error || 'Transcription failed' })
                }
              } catch { setResult({ ok: false, msg: 'Upload failed' }) }
              setUploading(false)
            } else if (mode === 'pdf') {
              uploadPdf()
            } else {
              uploadText()
            }
          }}
          disabled={!canSubmit && !(mode === 'video' && videoFile && sourceName.trim()) || uploading}
          style={{ padding: '14px 32px', background: (canSubmit || (mode === 'video' && videoFile)) && !uploading ? C.gold : 'var(--kb-border)', border: 'none', borderRadius: '8px', color: (canSubmit || (mode === 'video' && videoFile)) && !uploading ? 'var(--kb-bg)' : C.faint, fontSize: '15px', fontWeight: 590, cursor: (canSubmit || (mode === 'video' && videoFile)) && !uploading ? 'pointer' : 'default', fontFamily: F.body }}>
          {uploading ? 'Processing...' : mode === 'pdf' ? 'Parse & Store PDF' : mode === 'video' ? 'Transcribe & Store' : 'Process & Store Text'}
        </button>
      </div>

      {/* Knowledge Base Browser */}
      <div style={{ ...card, marginTop: '20px' }}>
        <div style={{ fontSize: '14px', fontWeight: 590, color: C.text, marginBottom: '16px' }}>Knowledge Base</div>
        {loadingKB ? (
          <div style={{ color: C.faint, fontSize: '14px' }}>Loading sources...</div>
        ) : knowledgeSources.length === 0 ? (
          <div style={{ color: C.faint, fontSize: '14px' }}>No sources uploaded yet. Upload PDFs, video recordings, or paste text above.</div>
        ) : (
          <div>
            <div style={{ fontSize: '12px', color: C.muted, marginBottom: '12px' }}>{knowledgeSources.length} sources, {knowledgeSources.reduce((s, k) => s + k.chunks, 0)} total knowledge chunks</div>
            {knowledgeSources.map((s, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: i < knowledgeSources.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: s.source_type === 'video_transcript' ? '#5b8dee' : s.source_type === 'pdf' ? C.gold : s.source_type === 'interview' ? C.green : C.muted, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 510, color: C.text }}>{s.source_name}</div>
                    <div style={{ fontSize: '12px', color: C.faint }}>{s.source_type.replace('_', ' ')} &middot; {s.chunks} chunks &middot; {new Date(s.created_at).toLocaleDateString()}</div>
                  </div>
                </div>
                <button
                  onClick={async () => {
                    setDeleting(s.source_name)
                    await fetch('/api/digital-twin/knowledge', {
                      method: 'DELETE',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ persona_id: personaId, source_name: s.source_name }),
                    })
                    setKnowledgeSources(prev => prev.filter(k => k.source_name !== s.source_name))
                    setDeleting(null)
                    onRefresh()
                  }}
                  disabled={deleting === s.source_name}
                  style={{ padding: '6px 12px', background: 'rgba(231,76,60,0.08)', border: '1px solid rgba(231,76,60,0.2)', borderRadius: '6px', color: 'var(--kb-red)', fontSize: '12px', fontWeight: 510, cursor: 'pointer' }}
                >
                  {deleting === s.source_name ? '...' : 'Delete'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Chat Tab ──────────────────────────────────────────────────────────────────
function ChatTab({ persona, personaId, totalChunks }: { persona: Persona; personaId: string; totalChunks: number }) {
  const [messages, setMessages] = useState<ChatMsg[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionLoaded, setSessionLoaded] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  const SCOTT_QUESTIONS = [
    'How does the Nexxess Trust protect my assets from lawsuits and creditors?',
    'I am selling my business for $8M. How much could I save in taxes with a trust?',
    'What is the difference between a revocable trust and what Nexxess offers?',
    'How does the trust allow me to pass wealth to my children without them spending it all?',
    'Can the IRS challenge this trust structure? What is your track record with audits?',
    'I own rental properties. How would the trust help with capital gains and rental income?',
    'Walk me through the process from consultation to having my trust set up.',
    'What types of income qualify for tax deferral inside the trust?',
  ]

  const SAMPLE_QUESTIONS = persona.slug === 'scott-mcgrath' ? SCOTT_QUESTIONS : persona.persona_type === 'advisor' ? [
    'What is the most important thing a business owner should do 3 years before selling?',
    'Walk me through how you structure a seller note in a deal.',
    'What trust structures do you typically set up for a $5M+ exit?',
    'What are the top 3 reasons deals fall apart after LOI?',
    'How do you handle a seller who has unrealistic price expectations?',
    'What does your ideal client look like?',
  ] : [
    'Who are the most important customers and how should I approach them?',
    'Which employees are most critical to keep?',
    'What would break first if I made changes too quickly?',
    'What is the biggest growth opportunity I should focus on in year one?',
    'What keeps you up at night about this business?',
    'How should I handle the transition with key vendor relationships?',
  ]

  // Load persistent session
  useEffect(() => {
    async function loadSession() {
      try {
        const res = await fetch(`/api/digital-twin/session?persona_id=${personaId}`)
        const data = await res.json()
        if (data.messages?.length > 0) setMessages(data.messages)
      } catch { /* ignore */ }
      setSessionLoaded(true)
    }
    loadSession()
  }, [personaId])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, loading])

  const saveSession = useCallback(async (msgs: ChatMsg[]) => {
    try {
      await fetch('/api/digital-twin/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ persona_id: personaId, messages: msgs }),
      })
    } catch { /* non-fatal */ }
  }, [personaId])

  const sendMessage = async () => {
    if (!input.trim() || loading || totalChunks === 0) return
    const userMsg = input.trim()
    setInput('')
    const newMsgs: ChatMsg[] = [...messages, { role: 'user', content: userMsg }]
    setMessages(newMsgs)
    setLoading(true)

    try {
      const res = await fetch('/api/digital-twin/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: userMsg, persona_slug: persona.slug }),
      })
      const data = await res.json()
      const final: ChatMsg[] = [...newMsgs, { role: 'assistant', content: data.answer || 'Something went wrong.' }]
      setMessages(final)
      saveSession(final)
    } catch {
      const final: ChatMsg[] = [...newMsgs, { role: 'assistant', content: 'Something went wrong. Please try again.' }]
      setMessages(final)
    }
    setLoading(false)
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  const clearChat = async () => {
    setMessages([])
    await saveSession([])
  }

  const hasKnowledge = totalChunks > 0

  return (
    <div>
      {/* Header */}
      <div style={{ ...card, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ width: '52px', height: '52px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0, border: `2px solid ${C.goldBorder}`, background: C.goldDim, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>
          {persona.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={persona.avatar_url} alt={persona.name} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }} />
          ) : ''}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '17px', fontWeight: 590, color: C.text, marginBottom: '3px' }}>
            {persona.name} — Digital Twin
          </div>
          <div style={{ fontSize: '13px', color: C.muted }}>{persona.title}{persona.company ? ` · ${persona.company}` : ''}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: F.mono, fontSize: '11px', color: hasKnowledge ? C.green : C.gold, letterSpacing: '0.1em' }}>
            {hasKnowledge ? '● Active' : '○ Building Knowledge'}
          </div>
          <div style={{ fontSize: '11px', color: C.faint, marginTop: '2px', fontFamily: F.mono }}>{totalChunks} knowledge chunks</div>
        </div>
        {messages.length > 0 && (
          <button onClick={clearChat} style={{ padding: '6px 12px', background: 'transparent', border: `1px solid ${C.border}`, borderRadius: '7px', color: C.faint, fontSize: '12px', cursor: 'pointer', fontFamily: F.body, whiteSpace: 'nowrap' }}>
            Clear Chat
          </button>
        )}
      </div>

      {!hasKnowledge && (
        <div style={{ background: 'var(--kb-accent-dim)', border: `1px solid ${C.goldBorder}`, borderRadius: '12px', padding: '16px 20px', marginBottom: '16px', display: 'flex', gap: '12px' }}>
          <span style={{ fontSize: '18px' }}></span>
          <div>
            <div style={{ fontSize: '15px', fontWeight: 590, color: C.text, marginBottom: '4px' }}>Knowledge base is empty</div>
            <div style={{ fontSize: '14px', color: C.muted }}>Upload a transcript or complete the Interview tab to activate the Digital Twin chat.</div>
          </div>
        </div>
      )}

      {/* Chat window */}
      <div style={{ ...card, padding: 0, overflow: 'hidden', marginBottom: '12px' }}>
        <div style={{ height: '440px', overflowY: 'auto', padding: '24px 24px 16px' }}>
          {!sessionLoaded ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: C.faint, fontSize: '14px' }}>Loading conversation...</div>
          ) : messages.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div style={{ marginBottom: "12px", color: "#C9A84C" }}><svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/></svg></div>
              <div style={{ fontSize: '16px', fontFamily: F.display, fontWeight: 510, color: C.text, marginBottom: '8px' }}>{persona.greeting}</div>
              <div style={{ fontSize: '14px', color: C.muted, lineHeight: 1.7, maxWidth: '460px', margin: '0 auto 28px' }}>
                Ask anything. Every answer comes directly from {persona.name}&apos;s knowledge — never fabricated.
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
                {SAMPLE_QUESTIONS.map(q => (
                  <button key={q} onClick={() => setInput(q)}
                    style={{ fontSize: '13px', color: C.gold, background: C.goldDim, border: `1px solid ${C.goldBorder}`, borderRadius: '12px', padding: '7px 14px', cursor: 'pointer', textAlign: 'left', maxWidth: '300px', lineHeight: 1.4, fontFamily: F.body }}>
                    {q}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div key={i} style={{ marginBottom: '18px', display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                {msg.role === 'assistant' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '6px' }}>
                    <div style={{ width: '22px', height: '22px', borderRadius: '50%', overflow: 'hidden', background: C.goldDim, border: `1px solid ${C.goldBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px' }}>
                      {persona.avatar_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={persona.avatar_url} alt={persona.name} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }} />
                      ) : ''}
                    </div>
                    <span style={{ fontFamily: F.mono, fontSize: '10px', color: C.gold, letterSpacing: '0.1em' }}>{persona.name.toUpperCase()} · DIGITAL TWIN</span>
                  </div>
                )}
                <div style={{ maxWidth: '82%', padding: '14px 18px', borderRadius: msg.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px', background: msg.role === 'user' ? 'rgba(201,168,76,0.12)' : 'var(--kb-bg-raised)', border: `1px solid ${msg.role === 'user' ? C.goldBorder : C.border}`, fontSize: '15px', color: C.text, lineHeight: 1.75, whiteSpace: 'pre-wrap' }}>
                  {msg.content}
                </div>
              </div>
            ))
          )}
          {loading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
              <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: C.goldDim, border: `1px solid ${C.goldBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px' }}></div>
              <div style={{ padding: '12px 16px', background: 'var(--kb-bg-raised)', border: `1px solid ${C.border}`, borderRadius: '12px', color: C.muted, fontSize: '14px' }}>
                <style>{`@keyframes dt-dot{0%,80%,100%{transform:translateY(0);opacity:.4}40%{transform:translateY(-4px);opacity:1}}`}</style>
                {[0,1,2].map(d => <span key={d} style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: C.gold, margin: '0 2px', animation: `dt-dot 1.3s ease-in-out ${d*0.2}s infinite` }} />)}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
        <div style={{ borderTop: `1px solid ${C.border}`, padding: '14px 18px', display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder={hasKnowledge ? `Ask ${persona.name} anything...  (Enter to send)` : 'Upload knowledge first to activate chat'}
            disabled={!hasKnowledge}
            rows={2}
            style={{ flex: 1, background: 'var(--kb-bg-raised)', border: `1px solid ${C.border}`, borderRadius: '10px', padding: '12px 16px', color: C.text, fontSize: '15px', fontFamily: F.body, resize: 'none', outline: 'none', lineHeight: 1.5, opacity: hasKnowledge ? 1 : 0.5 }}
          />
          <button onClick={sendMessage} disabled={!input.trim() || loading || !hasKnowledge}
            style={{ padding: '12px 22px', background: input.trim() && !loading && hasKnowledge ? C.gold : 'var(--kb-border)', border: 'none', borderRadius: '10px', color: input.trim() && !loading && hasKnowledge ? 'var(--kb-bg)' : C.faint, fontSize: '15px', fontWeight: 590, cursor: input.trim() && !loading && hasKnowledge ? 'pointer' : 'default', whiteSpace: 'nowrap', fontFamily: F.body }}>
            Send →
          </button>
        </div>
      </div>
      <div style={{ fontSize: '12px', color: C.faint, fontFamily: F.mono, textAlign: 'center' }}>
        Shift+Enter for new line · Conversation history saved automatically
      </div>
    </div>
  )
}

// ─── Main Persona Page ──────────────────────────────────────────────────────────
export default function DigitalTwinPersonaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const [persona, setPersona] = useState<Persona | null>(null)
  const [sources, setSources] = useState<Source[]>([])
  const [totalChunks, setTotalChunks] = useState(0)
  const [answers, setAnswers] = useState<Answers>({})
  const [activeTab, setActiveTab] = useState<'about' | 'interview' | 'knowledge' | 'chat'>('chat')
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [canEdit, setCanEdit] = useState(false)

  // Check if user can edit (admin or owner of this twin)
  useEffect(() => {
    // Check if seller owns this twin
    fetch('/api/digital-twin/my-twin').then(r => r.json()).then(d => {
      if (d.slug === slug) setCanEdit(true)
    }).catch(() => {})
    // Check if admin
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (d.isAdmin) setCanEdit(true)
    }).catch(() => {
      // Demo mode: allow editing for demo purposes
      setCanEdit(true)
    })
  }, [slug])

  const loadPersona = useCallback(async () => {
    try {
      const res = await fetch(`/api/digital-twin/persona/${slug}`)
      if (!res.ok) { setNotFound(true); setLoading(false); return }
      const data = await res.json()
      setPersona(data.persona)
      setSources(data.sources ?? [])
      setTotalChunks(data.total_chunks ?? 0)
    } catch {
      setNotFound(true)
    }
    setLoading(false)
  }, [slug])

  useEffect(() => { loadPersona() }, [loadPersona])

  const updateAnswers = useCallback((a: Answers) => {
    setAnswers(a)
    try { localStorage.setItem(`kb_twin_answers_${slug}`, JSON.stringify(a)) } catch { /* ignore */ }
  }, [slug])

  const saveOneAnswer = useCallback(async (moduleId: string, qIdx: number, answer: string) => {
    if (!persona) return
    // Also ingest as knowledge chunk
    try {
      await fetch('/api/digital-twin/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          persona_id: persona.id,
          source_type: 'interview',
          source_name: `Interview — ${moduleId}`,
          content: `Question: ${answer}`,
        }),
      })
      setTotalChunks(c => c + 1)
    } catch { /* non-fatal */ }
  }, [persona])

  if (loading) {
    return (
      <div style={{ padding: '80px', textAlign: 'center', fontFamily: F.body, color: C.muted }}>
        Loading Digital Twin...
      </div>
    )
  }

  if (notFound || !persona) {
    return (
      <div style={{ padding: '80px', textAlign: 'center', fontFamily: F.body, color: C.muted }}>
        <div style={{ marginBottom: "12px", color: "#C9A84C" }}><svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/></svg></div>
        <div style={{ fontFamily: F.display, fontSize: '24px', color: C.text, marginBottom: '12px' }}>Digital Twin Not Found</div>
        <div>No Digital Twin exists at this URL. Check with your Kingdom Broker advisor.</div>
      </div>
    )
  }

  const ALL_TABS = [
    { id: 'chat' as const,      label: ' Ask the Twin',    sub: totalChunks > 0 ? 'Active' : 'No knowledge yet', public: true },
    { id: 'interview' as const, label: ' Interview',        sub: `${Object.values(answers).reduce((s, m) => s + Object.keys(m).length, 0)}/${ADVISOR_MODULES.reduce((s, m) => s + m.questions.length, 0)} answered`, public: false },
    { id: 'knowledge' as const, label: ' Knowledge Base',  sub: `${totalChunks} chunks · ${sources.length} sources`, public: false },
    { id: 'about' as const,     label: ' About',            sub: persona.company, public: true },
  ]
  const TABS = canEdit ? ALL_TABS : ALL_TABS.filter(t => t.public)

  return (
    <div style={{ padding: '32px 36px', fontFamily: F.body, color: C.text, maxWidth: '1100px' }}>

      {/* Persona Header */}
      <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap' }}>
        <div style={{ width: '80px', height: '80px', borderRadius: '50%', overflow: 'hidden', border: `3px solid ${C.goldBorder}`, background: C.goldDim, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px' }}>
          {persona.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={persona.avatar_url} alt={persona.name} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }} />
          ) : ''}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: F.mono, fontSize: '10px', color: C.gold, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '6px' }}>
            AI Digital Twin · Kingdom Broker
          </div>
          <h1 style={{ fontFamily: F.display, fontSize: '32px', fontWeight: 510, margin: '0 0 6px', color: C.text }}>{persona.name}</h1>
          <div style={{ fontSize: '16px', color: C.muted, marginBottom: '8px' }}>{persona.title}{persona.company ? ` · ${persona.company}` : ''}</div>
          {persona.expertise && (
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {persona.expertise.split(',').map(e => (
                <span key={e} style={{ fontFamily: F.mono, fontSize: '10px', color: C.gold, background: C.goldDim, border: `1px solid ${C.goldBorder}`, borderRadius: '12px', padding: '3px 10px', letterSpacing: '0.04em' }}>{e.trim()}</span>
              ))}
            </div>
          )}
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontFamily: F.mono, fontSize: '11px', color: totalChunks > 0 ? C.green : C.gold, letterSpacing: '0.1em' }}>
            {totalChunks > 0 ? '● Knowledge Active' : '○ Building Knowledge'}
          </div>
          <div style={{ fontSize: '12px', color: C.faint, marginTop: '3px', fontFamily: F.mono }}>{totalChunks} chunks across {sources.length} sources</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '28px', flexWrap: 'wrap' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            style={{ padding: '12px 20px', borderRadius: '12px', border: `1px solid ${activeTab === t.id ? C.goldBorder : C.border}`, background: activeTab === t.id ? C.goldDim : 'transparent', color: activeTab === t.id ? C.gold : C.muted, fontSize: '14px', fontWeight: activeTab === t.id ? 600 : 400, cursor: 'pointer', transition: 'all 0.15s', textAlign: 'left', fontFamily: F.body }}>
            <div>{t.label}</div>
            <div style={{ fontSize: '11px', marginTop: '2px', fontFamily: F.mono, color: activeTab === t.id ? 'rgba(201,168,76,0.7)' : C.faint }}>{t.sub}</div>
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'chat' && <ChatTab persona={persona} personaId={persona.id} totalChunks={totalChunks} />}
      {activeTab === 'interview' && <InterviewTab answers={answers} setAnswers={updateAnswers} onSaveAnswer={saveOneAnswer} />}
      {activeTab === 'knowledge' && <KnowledgeTab personaId={persona.id} sources={sources} onRefresh={loadPersona} />}
      {activeTab === 'about' && (
        <div style={{ ...card }}>
          <div style={{ fontFamily: F.mono, fontSize: '10px', color: C.gold, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '16px' }}>About This Digital Twin</div>
          <p style={{ fontSize: '16px', color: C.readable, lineHeight: 1.8, margin: '0 0 20px' }}>
            This is the AI Digital Twin of <strong style={{ color: C.text }}>{persona.name}</strong>
            {persona.title ? `, ${persona.title}` : ''}
            {persona.company ? ` at ${persona.company}` : ''}. Every answer comes directly from{' '}
            {persona.name}&apos;s own words — interviews, white papers, and documented frameworks. Nothing is fabricated.
          </p>
          <p style={{ fontSize: '15px', color: C.muted, lineHeight: 1.75, margin: 0 }}>
            Expertise: {persona.expertise || 'Business advisory, exit planning, deal structuring'}
          </p>
        </div>
      )}
    </div>
  )
}
