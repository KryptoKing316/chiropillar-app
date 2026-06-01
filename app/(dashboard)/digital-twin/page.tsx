'use client'
import { useState, useEffect, useRef, useCallback } from 'react'

// ─── Design Tokens ────────────────────────────────────────────────────────────
const C = {
  navy: 'var(--kb-bg)', card: 'var(--kb-bg-panel)', card2: 'var(--kb-bg-surface)',
  gold: 'var(--kb-accent)', goldDim: 'var(--kb-accent-dim)', goldBorder: 'var(--kb-accent-border)',
  green: 'var(--kb-green)', greenDim: 'var(--kb-accent-dim)',
  text: 'var(--kb-text)', muted: 'var(--kb-text-secondary)', readable: 'var(--kb-text-secondary)',
  border: 'var(--kb-border)', faint: 'var(--kb-text-muted)',
}
const F = { display: "'Playfair Display', serif", body: "'Inter', system-ui, sans-serif", mono: "'DM Mono', monospace" }
const card = { background: C.card, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '24px 28px' }

// ─── Interview Modules ─────────────────────────────────────────────────────────
const MODULES = [
  {
    id: 'business-overview', num: '01', title: 'The Business in Plain English',
    subtitle: 'How you would explain your business to a neighbor',
    questions: [
      'Describe your business to someone who knows nothing about your industry.',
      'What do you actually sell, and why do customers choose you over competitors?',
      'Walk me through a typical Monday morning at your company.',
      'What is the one thing that, if it stopped working, your business would be in serious trouble within 30 days?',
      'What do you personally do every week that nobody else at the company does?',
    ]
  },
  {
    id: 'customers', num: '02', title: 'Customer Relationships',
    subtitle: 'The relationships that took 20 years to build',
    questions: [
      'Who are your top 5 customers by revenue? Tell me about each one personally, not just their company name.',
      'How did you originally win each of those relationships? What was the real reason they chose you?',
      'Which customers might leave if YOU personally left, and what specifically keeps them loyal to you?',
      'Are there any customer quirks, preferences, or history that a new owner absolutely must know?',
      'Who at each key account should the new owner call first, and what is the right way to approach that first conversation?',
    ]
  },
  {
    id: 'employees', num: '03', title: 'Your Team',
    subtitle: 'The people who make it all work',
    questions: [
      'Who are your key people, and what would specifically break if each one left?',
      'Who might be underpaid and knows it? Who might leave if the new owner changes things too quickly?',
      'Who on your team has leadership potential that a smart new owner should invest in?',
      'Are there any interpersonal dynamics, rivalries, loyalties, sensitivities, a new owner needs to understand?',
      'Beyond their paycheck, what motivates each of your key people to come in every day?',
    ]
  },
  {
    id: 'operations', num: '04', title: 'Operations & Vendors',
    subtitle: 'How the machine actually runs day to day',
    questions: [
      'Walk me through how a job, order, or new client gets processed from start to finish.',
      'Which vendors or suppliers are critical to you? What are your actual terms versus their published rates?',
      'Are there any handshake deals, verbal agreements, or relationship-based pricing a new owner needs to know about?',
      'What processes or systems break down under pressure, and what is the workaround your team uses?',
      'What does your best employee do differently that has never been written down anywhere?',
    ]
  },
  {
    id: 'growth', num: '05', title: 'Growth Opportunities',
    subtitle: 'What you know would work but haven\'t done yet',
    questions: [
      'What growth opportunities have you NOT pursued that the right new owner could capture quickly?',
      'Which service line or product has the most untapped profit margin if someone focused on it?',
      'Are there geographic markets or customer types you could expand to but have not yet?',
      'Who has asked to buy from you that you couldn\'t service, had to turn away, or just never had time for?',
      'If you were starting fresh with this business today, what would you do differently in year one?',
    ]
  },
  {
    id: 'risks', num: '06', title: 'Risks & Honest Challenges',
    subtitle: 'Honesty here actually builds buyer confidence',
    questions: [
      'What keeps you up at night about this business?',
      'Is there a customer, contract, or key relationship that could change or go away after you leave?',
      'Are there any regulatory, licensing, or compliance items the new owner absolutely must understand?',
      'What has gone seriously wrong in the past that could go wrong again?',
      'Is there anything a new owner might discover 6 months in that would surprise them?',
    ]
  },
  {
    id: 'transition', num: '07', title: 'The Transition Playbook',
    subtitle: 'Your 90-day handoff guide for the new owner',
    questions: [
      'If you had 90 days to transfer everything you know, what would you teach first?',
      'Who inside the company can help the new owner learn the business quickly?',
      'Which outside relationships, accountant, banker, attorney, insurance broker, are critical to keep?',
      'What decisions should the new owner absolutely NOT change in the first 6 months?',
      'What is your most honest advice to the buyer for surviving and thriving in year one?',
    ]
  },
  {
    id: 'story', num: '08', title: 'Your Story',
    subtitle: 'The soul of the business, for buyers and legacy',
    questions: [
      'Why did you originally start or buy this business?',
      'What are you most proud of building over the years?',
      'What do you want your legacy to be, for your employees, your customers, and your community?',
      'Why are you selling now, and why is this actually the right time for a new owner to step in?',
      'What would the ideal new owner look like? What kind of person would be truly perfect for this business?',
    ]
  },
]

type Answers = Record<string, Record<number, string>>
type ChatMsg = { role: 'user' | 'assistant'; content: string }

// ─── Coming Soon, Product Showcase ──────────────────────────────────────────
function AboutTab({ onStartInterview }: { onStartInterview: () => void }) {
  return (
    <div>
      {/* Hero */}
      <div style={{ textAlign: 'center', padding: '48px 20px 56px', maxWidth: '780px', margin: '0 auto' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: C.goldDim, border: `1px solid ${C.goldBorder}`, borderRadius: '12px', padding: '6px 16px', marginBottom: '28px' }}>
          <span style={{ fontSize: '16px' }}></span>
          <span style={{ fontFamily: F.mono, fontSize: '11px', color: C.gold, letterSpacing: '0.2em', textTransform: 'uppercase' }}>Now Live · Beta · Kingdom Broker Exclusive</span>
        </div>
        <h1 style={{ fontFamily: F.display, fontSize: '42px', fontWeight: 510, lineHeight: 1.2, margin: '0 0 22px', color: C.text }}>
          Everything You Know About Your Business —<br />
          <span style={{ color: C.gold }}>Captured Forever.</span>
        </h1>
        <p style={{ fontSize: '19px', color: C.readable, lineHeight: 1.75, margin: '0 0 12px' }}>
          After 20 or 30 years of running a business, most of what makes it valuable only exists in one place, <strong style={{ color: C.text }}>your head.</strong>
        </p>
        <p style={{ fontSize: '18px', color: C.muted, lineHeight: 1.75, margin: '0' }}>
          We sit down with you for a guided conversation. You talk. We listen. Your Kingdom Digital Twin captures every relationship,
          every shortcut, every vendor deal, every customer quirk, and preserves it so the next owner can
          run the business as well as you do, starting on day one, and so you can exit into your next chapter with nothing left behind.
        </p>
      </div>

      {/* Simple Analogy Block */}
      <div style={{ ...card, marginBottom: '24px', background: 'var(--kb-bg)', borderColor: C.goldBorder, textAlign: 'center', padding: '32px 36px' }}>
        <div style={{ marginBottom: "12px", color: "#C9A84C" }}><svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/></svg></div>
        <p style={{ fontSize: '20px', color: C.text, lineHeight: 1.7, margin: '0', maxWidth: '680px', marginLeft: 'auto', marginRight: 'auto' }}>
          Think of it like recording 30 years of experience into a bottle —
          so when a new owner steps in, they can ask any question
          and get <em style={{ color: C.gold }}>your exact answer</em>, any time of day, forever.
        </p>
      </div>

      {/* What Gets Captured */}
      <div style={{ ...card, marginBottom: '32px' }}>
        <div style={{ fontFamily: F.mono, fontSize: '11px', color: C.gold, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '20px' }}>What Gets Captured</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          {[
            { icon: '', title: 'Customer Relationships', desc: 'Who your top clients are, how you won them, what keeps them loyal, and how to approach each one.' },
            { icon: '', title: 'Your Team', desc: 'Who is critical, who might leave, who has hidden leadership potential, and what motivates each person.' },
            { icon: '', title: 'How It Really Runs', desc: 'The vendor deals nobody wrote down. The workarounds your best employee uses. The real process, not the manual.' },
            { icon: '', title: 'Growth Opportunities', desc: 'The moves you know would work but never had time to execute. The buyer gets a roadmap, not a mystery.' },
            { icon: '', title: 'Honest Risks', desc: 'What could go wrong. What to watch. A new owner who knows the risks is far more likely to succeed.' },
            { icon: '', title: 'Your Story', desc: 'Why you built this, what you\'re proud of, and what kind of person would be perfect to carry it forward.' },
          ].map(item => (
            <div key={item.title} style={{ background: 'var(--kb-bg-raised)', border: `1px solid ${C.border}`, borderRadius: '12px', padding: '20px' }}>
              <div style={{ fontSize: '28px', marginBottom: '10px' }}>{item.icon}</div>
              <div style={{ fontSize: '15px', fontWeight: 590, color: C.text, marginBottom: '8px' }}>{item.title}</div>
              <div style={{ fontSize: '14px', color: C.readable, lineHeight: 1.65 }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Three Products */}
      <div style={{ fontFamily: F.mono, fontSize: '11px', color: C.gold, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '16px' }}>Three Ways to Use This</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '40px' }}>

        {/* Product 1 */}
        <div style={{ ...card, borderColor: C.goldBorder, display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
          <div style={{ background: C.goldDim, border: `1px solid ${C.goldBorder}`, borderRadius: '12px', padding: '14px 16px', flexShrink: 0, textAlign: 'center', minWidth: '68px' }}>
            <div style={{ marginBottom: "12px", color: "#C9A84C" }}><svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/></svg></div>
            <div style={{ fontFamily: F.mono, fontSize: '10px', color: C.gold, marginTop: '6px', letterSpacing: '0.1em' }}>INCLUDED</div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: F.mono, fontSize: '10px', color: C.gold, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '6px' }}>Product 1, Included with Kingdom Broker</div>
            <div style={{ fontSize: '20px', fontWeight: 590, color: C.text, marginBottom: '10px' }}>Your Digital Twin is Part of the Deal</div>
            <p style={{ fontSize: '15px', color: C.readable, lineHeight: 1.7, margin: '0 0 12px' }}>
              Every seller we represent gets a Digital Twin built as part of the process.
              When a buyer is considering your business, instead of just seeing spreadsheets,
              they can ask questions and get answers, in your voice, about every detail of the company.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {['Included at no extra cost', 'Used during buyer due diligence', 'Increases sale price 10–20%', 'No broker has this'].map(t => (
                <span key={t} style={{ fontSize: '13px', color: C.green, background: C.greenDim, border: '1px solid rgba(46,204,139,0.2)', borderRadius: '6px', padding: '4px 10px' }}><svg viewBox="0 0 14 14" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3,7 6,10 11,4"/></svg> {t}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Product 2 */}
        <div style={{ ...card, display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
          <div style={{ background: 'rgba(91,184,245,0.08)', border: '1px solid rgba(91,184,245,0.25)', borderRadius: '12px', padding: '14px 16px', flexShrink: 0, textAlign: 'center', minWidth: '68px' }}>
            <div style={{ marginBottom: "12px", color: "#C9A84C" }}><svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/></svg></div>
            <div style={{ fontFamily: F.mono, fontSize: '10px', color: '#5BB8F5', marginTop: '6px', letterSpacing: '0.1em' }}>$5K–$15K</div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: F.mono, fontSize: '10px', color: '#5BB8F5', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '6px' }}>Product 2, Business Transition Package</div>
            <div style={{ fontSize: '20px', fontWeight: 590, color: C.text, marginBottom: '10px' }}>90 Days of AI-Powered Transition Support</div>
            <p style={{ fontSize: '15px', color: C.readable, lineHeight: 1.7, margin: '0 0 12px' }}>
              After the sale closes, the buyer gets 90-day access to your Digital Twin.
              They can ask it questions at 2am on a Sunday about a specific customer or vendor —
              and get your answer. You did the interview once. The knowledge lasts forever.
              This is the difference between a smooth handoff and a post-close lawsuit.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {['Buyer access for 90 days after close', 'Seller answers once, paid at closing', 'Prevents post-close disputes', 'Gives buyers the confidence to close faster'].map(t => (
                <span key={t} style={{ fontSize: '13px', color: '#5BB8F5', background: 'rgba(91,184,245,0.08)', border: '1px solid rgba(91,184,245,0.2)', borderRadius: '6px', padding: '4px 10px' }}><svg viewBox="0 0 14 14" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3,7 6,10 11,4"/></svg> {t}</span>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* CTA */}
      <div style={{ ...card, textAlign: 'center', padding: '40px 32px', background: 'linear-gradient(135deg, var(--kb-accent-dim), var(--kb-bg-panel))', borderColor: C.goldBorder }}>
        <div style={{ marginBottom: "12px", color: "#C9A84C" }}><svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/></svg></div>
        <h2 style={{ fontFamily: F.display, fontSize: '28px', fontWeight: 510, margin: '0 0 12px' }}>Ready to Start?</h2>
        <p style={{ fontSize: '16px', color: C.readable, margin: '0 0 28px', maxWidth: '480px', marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.7 }}>
          The interview takes 2–3 hours total and can be done across multiple sessions.
          You can speak your answers out loud or type them. Start with any module, there&apos;s no required order.
        </p>
        <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={onStartInterview}
            style={{ display: 'inline-block', padding: '14px 36px', background: C.gold, color: 'var(--kb-bg)', borderRadius: '10px', fontWeight: 590, fontSize: '16px', border: 'none', cursor: 'pointer', letterSpacing: '0.02em' }}>
            Start My Knowledge Interview →
          </button>
          <a href="mailto:Eric@KingdomBroker.com?subject=Digital Twin CEO, Enterprise Inquiry"
            style={{ display: 'inline-block', padding: '14px 28px', background: 'transparent', color: C.gold, borderRadius: '10px', fontWeight: 590, fontSize: '15px', textDecoration: 'none', border: `1px solid ${C.goldBorder}` }}>
            Inquire About Enterprise Build
          </a>
        </div>
      </div>
    </div>
  )
}

// ─── Interview Tab ────────────────────────────────────────────────────────────
function InterviewTab({ answers, setAnswers, onSaveAnswer }: { answers: Answers; setAnswers: (a: Answers) => void; onSaveAnswer: (moduleId: string, qIndex: number, answer: string) => void }) {
  const [activeModule, setActiveModule] = useState(0)
  const [activeQ, setActiveQ] = useState(0)
  const [currentAnswer, setCurrentAnswer] = useState('')
  const [recording, setRecording] = useState(false)
  const [saved, setSaved] = useState(false)
  const recognitionRef = useRef<{ stop: () => void } | null>(null)

  const totalAnswered = Object.values(answers).reduce((sum, mod) => sum + Object.keys(mod).length, 0)
  const totalQuestions = MODULES.reduce((sum, m) => sum + m.questions.length, 0)

  // Load existing answer when question changes
  useEffect(() => {
    const moduleId = MODULES[activeModule].id
    const existing = answers[moduleId]?.[activeQ] || ''
    setCurrentAnswer(existing)
    setSaved(false)
  }, [activeModule, activeQ, answers])

  const saveAnswer = useCallback(() => {
    if (!currentAnswer.trim()) return
    const moduleId = MODULES[activeModule].id
    const updated = {
      ...answers,
      [moduleId]: { ...answers[moduleId], [activeQ]: currentAnswer.trim() }
    }
    setAnswers(updated)
    setSaved(true)
    setTimeout(() => setSaved(false), 1800)
    // Fire-and-forget to Supabase, localStorage already updated above
    onSaveAnswer(moduleId, activeQ, currentAnswer.trim())
  }, [currentAnswer, activeModule, activeQ, answers, setAnswers, onSaveAnswer])

  const goNext = useCallback(() => {
    saveAnswer()
    const mod = MODULES[activeModule]
    setTimeout(() => {
      if (activeQ < mod.questions.length - 1) {
        setActiveQ(q => q + 1)
      } else if (activeModule < MODULES.length - 1) {
        setActiveModule(m => m + 1)
        setActiveQ(0)
      }
    }, 120)
  }, [activeModule, activeQ, saveAnswer])

  const startRecording = useCallback(() => {
    const win = window as Window & {
      SpeechRecognition?: new () => { continuous: boolean; interimResults: boolean; lang: string; onresult: ((e: { resultIndex: number; results: { isFinal: boolean; [i: number]: { transcript: string } }[] }) => void) | null; onend: (() => void) | null; onerror: (() => void) | null; start: () => void; stop: () => void }
      webkitSpeechRecognition?: new () => { continuous: boolean; interimResults: boolean; lang: string; onresult: ((e: { resultIndex: number; results: { isFinal: boolean; [i: number]: { transcript: string } }[] }) => void) | null; onend: (() => void) | null; onerror: (() => void) | null; start: () => void; stop: () => void }
    }
    const SR = win.SpeechRecognition || win.webkitSpeechRecognition
    if (!SR) { alert('Voice recording requires Chrome or Safari. Please type your answer.'); return }
    const recognition = new SR()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'
    let finalText = currentAnswer ? currentAnswer + ' ' : ''
    recognition.onresult = (e) => {
      let interim = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) finalText += e.results[i][0].transcript + ' '
        else interim += e.results[i][0].transcript
      }
      setCurrentAnswer(finalText + interim)
    }
    recognition.onend = () => setRecording(false)
    recognition.onerror = () => setRecording(false)
    recognitionRef.current = recognition
    recognition.start()
    setRecording(true)
  }, [currentAnswer])

  const stopRecording = useCallback(() => { recognitionRef.current?.stop(); setRecording(false) }, [])

  const mod = MODULES[activeModule]
  const hasAnswer = !!answers[mod.id]?.[activeQ]

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '20px' }}>

      {/* Module List */}
      <div>
        <div style={{ fontFamily: F.mono, fontSize: '10px', color: C.muted, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '10px', padding: '0 4px' }}>
          {totalAnswered} / {totalQuestions} answered
        </div>
        <div style={{ background: 'var(--kb-accent-dim)', borderRadius: '6px', height: '5px', marginBottom: '16px' }}>
          <div style={{ background: C.gold, height: '5px', borderRadius: '6px', transition: 'width 0.4s', width: `${(totalAnswered / totalQuestions) * 100}%` }} />
        </div>
        {MODULES.map((m, mi) => {
          const modAnswered = Object.keys(answers[m.id] || {}).length
          const isActive = mi === activeModule
          const isDone = modAnswered >= m.questions.length
          return (
            <button key={m.id} onClick={() => { setActiveModule(mi); setActiveQ(0) }}
              style={{ width: '100%', textAlign: 'left', padding: '12px 14px', borderRadius: '10px', marginBottom: '4px', cursor: 'pointer', transition: 'all 0.15s', border: `1px solid ${isActive ? C.goldBorder : 'transparent'}`, background: isActive ? C.goldDim : 'transparent' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '7px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 590, fontFamily: F.mono, background: isDone ? 'rgba(46,204,139,0.15)' : isActive ? C.goldDim : 'rgba(255,255,255,0.04)', color: isDone ? C.green : isActive ? C.gold : C.faint }}>
                  {isDone ? '✓' : m.num}
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: isActive ? 600 : 400, color: isActive ? C.gold : isDone ? C.text : C.muted, lineHeight: 1.3 }}>{m.title}</div>
                  <div style={{ fontSize: '11px', color: C.faint, marginTop: '2px' }}>{modAnswered}/{m.questions.length} answered</div>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Question Panel */}
      <div>
        <div style={{ ...card, marginBottom: '16px' }}>
          {/* Module header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '22px', paddingBottom: '18px', borderBottom: `1px solid ${C.border}` }}>
            <div style={{ fontFamily: F.mono, fontSize: '22px', fontWeight: 590, color: C.gold, opacity: 0.4 }}>{mod.num}</div>
            <div>
              <div style={{ fontSize: '18px', fontWeight: 590, color: C.text }}>{mod.title}</div>
              <div style={{ fontSize: '13px', color: C.muted, marginTop: '2px' }}>{mod.subtitle}</div>
            </div>
          </div>

          {/* Question tabs */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '22px', flexWrap: 'wrap' }}>
            {mod.questions.map((_, qi) => {
              const done = !!answers[mod.id]?.[qi]
              const active = qi === activeQ
              return (
                <button key={qi} onClick={() => setActiveQ(qi)} style={{ width: '34px', height: '34px', borderRadius: '8px', border: `1px solid ${active ? C.goldBorder : done ? 'rgba(46,204,139,0.3)' : C.border}`, background: active ? C.goldDim : done ? 'rgba(46,204,139,0.08)' : 'transparent', color: active ? C.gold : done ? C.green : C.muted, fontSize: '13px', fontWeight: 590, cursor: 'pointer', transition: 'all 0.15s' }}>
                  {done ? '✓' : qi + 1}
                </button>
              )
            })}
          </div>

          {/* Current question */}
          <div style={{ background: 'rgba(201,168,76,0.05)', border: `1px solid rgba(201,168,76,0.15)`, borderRadius: '10px', padding: '16px 20px', marginBottom: '18px' }}>
            <div style={{ fontFamily: F.mono, fontSize: '10px', color: C.gold, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '8px' }}>Question {activeQ + 1} of {mod.questions.length}</div>
            <div style={{ fontSize: '17px', color: C.text, lineHeight: 1.65, fontWeight: 500 }}>{mod.questions[activeQ]}</div>
          </div>

          {/* Voice / Text input */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <div style={{ fontFamily: F.mono, fontSize: '10px', color: C.muted, letterSpacing: '0.15em', textTransform: 'uppercase' }}>Your Answer</div>
              <button onClick={recording ? stopRecording : startRecording}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '5px 14px', borderRadius: '12px', border: `1px solid ${recording ? 'rgba(232,73,73,0.4)' : C.goldBorder}`, background: recording ? 'rgba(232,73,73,0.1)' : C.goldDim, color: recording ? '#E87373' : C.gold, fontSize: '12px', fontWeight: 590, cursor: 'pointer', transition: 'all 0.2s' }}>
                <span style={{ fontSize: '14px' }}>{recording ? '' : ''}</span>
                {recording ? 'Stop Recording' : 'Speak Your Answer'}
                {recording && <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#E87373', animation: 'pulse 1s infinite' }} />}
              </button>
              <span style={{ fontSize: '12px', color: C.faint }}>or type below</span>
            </div>
            <textarea
              value={currentAnswer}
              onChange={e => setCurrentAnswer(e.target.value)}
              placeholder="Take your time. Speak freely. The more detail you give, the better your Digital Twin will be for the buyer..."
              rows={7}
              style={{ width: '100%', background: 'var(--kb-bg-raised)', border: `1px solid ${C.border}`, borderRadius: '10px', padding: '16px', color: C.text, fontSize: '15px', lineHeight: 1.7, resize: 'vertical', fontFamily: F.body, outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button onClick={saveAnswer} disabled={!currentAnswer.trim()}
              style={{ padding: '10px 24px', background: 'transparent', border: `1px solid ${C.goldBorder}`, borderRadius: '8px', color: C.gold, fontSize: '14px', fontWeight: 590, cursor: currentAnswer.trim() ? 'pointer' : 'default', opacity: currentAnswer.trim() ? 1 : 0.4 }}>
              {saved ? 'Saved' : 'Save Answer'}
            </button>
            <button onClick={goNext}
              style={{ padding: '10px 24px', background: C.gold, border: 'none', borderRadius: '8px', color: 'var(--kb-bg)', fontSize: '14px', fontWeight: 590, cursor: 'pointer' }}>
              {activeQ < mod.questions.length - 1 ? 'Next Question →' : activeModule < MODULES.length - 1 ? 'Next Module →' : 'Finish Interview <svg viewBox="0 0 14 14" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3,7 6,10 11,4"/></svg>'}
            </button>
            {hasAnswer && !currentAnswer && (
              <span style={{ fontSize: '13px', color: C.green }}><svg viewBox="0 0 14 14" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3,7 6,10 11,4"/></svg> Already answered</span>
            )}
          </div>
        </div>

        {/* Tips */}
        <div style={{ background: 'var(--kb-bg-card)', border: `1px solid ${C.border}`, borderRadius: '12px', padding: '16px 20px', marginTop: '8px', display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
          <span style={{ fontSize: '16px', flexShrink: 0 }}></span>
          <div style={{ fontSize: '13px', color: C.muted, lineHeight: 1.65 }}>
            <strong style={{ color: C.readable }}>Tip: </strong>Don&apos;t overthink it. Speak like you&apos;re explaining to a trusted friend who just bought your business. Specific names, dollar amounts, and real stories are what your Digital Twin needs to answer questions exactly the way you would. Everything you share honors the business you built. You can always come back and add more.
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Chat Tab ─────────────────────────────────────────────────────────────────
function ChatTab({ answers }: { answers: Answers }) {
  const [messages, setMessages] = useState<ChatMsg[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  const totalAnswered = Object.values(answers).reduce((sum, mod) => sum + Object.keys(mod).length, 0)
  const totalQuestions = MODULES.reduce((sum, m) => sum + m.questions.length, 0)
  const hasEnoughContext = totalAnswered >= 5

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const sendMessage = useCallback(async () => {
    if (!input.trim() || loading) return
    const question = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: question }])
    setLoading(true)
    try {
      const res = await fetch('/api/digital-twin/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, answers, deal_name: 'Legacy HVAC Services' })
      })
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.answer || 'I couldn\'t find a specific answer for that in my knowledge base.' }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'There was a connection error. Please try again.' }])
    }
    setLoading(false)
  }, [input, loading, answers])

  const handleKey = (e: React.KeyboardEvent) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }

  // Sample questions based on what was answered
  const SAMPLE_QUESTIONS = [
    'Who are the most important customers and how should I approach them?',
    'What would break first if I made changes too quickly?',
    'Which employees are most critical to keep?',
    'What is the biggest growth opportunity I should focus on in year one?',
    'What keeps you up at night about this business?',
    'How should I handle the transition with key vendor relationships?',
  ]

  return (
    <div>
      {/* Header */}
      <div style={{ ...card, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: C.goldDim, border: `2px solid ${C.goldBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', flexShrink: 0 }}>
          
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '18px', fontWeight: 590, color: C.text, marginBottom: '4px' }}>Digital Twin CEO, Legacy HVAC Services</div>
          <div style={{ fontSize: '14px', color: C.muted }}>
            Ask any question about the business. Answers are based on the interview responses and financial documents.
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: F.mono, fontSize: '11px', color: hasEnoughContext ? C.green : C.gold, letterSpacing: '0.1em' }}>
            {hasEnoughContext ? '● Active' : '○ Building Context'}
          </div>
          <div style={{ fontSize: '12px', color: C.muted, marginTop: '3px' }}>{totalAnswered}/{totalQuestions} questions answered</div>
        </div>
      </div>

      {!hasEnoughContext && (
        <div style={{ background: 'var(--kb-accent-dim)', border: `1px solid ${C.goldBorder}`, borderRadius: '12px', padding: '16px 20px', marginBottom: '20px', display: 'flex', gap: '14px', alignItems: 'center' }}>
          <span style={{ fontSize: '20px' }}></span>
          <div>
            <div style={{ fontSize: '15px', fontWeight: 590, color: C.text, marginBottom: '4px' }}>Answer a few interview questions first</div>
            <div style={{ fontSize: '14px', color: C.muted }}>Complete at least 5 interview questions so the Digital Twin has enough context to answer accurately. The more you answer, the better it gets.</div>
          </div>
        </div>
      )}

      {/* Chat Window */}
      <div style={{ ...card, padding: '0', overflow: 'hidden', marginBottom: '16px' }}>
        <div style={{ height: '420px', overflowY: 'auto', padding: '24px 24px 16px' }}>
          {messages.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div style={{ marginBottom: "12px", color: "#C9A84C" }}><svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/></svg></div>
              <div style={{ fontSize: '16px', color: C.muted, lineHeight: 1.7, maxWidth: '480px', margin: '0 auto 28px' }}>
                Ask any question about this business, how it runs, who the key customers are, what to watch out for, where the growth is.
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
                {SAMPLE_QUESTIONS.map(q => (
                  <button key={q} onClick={() => setInput(q)} style={{ fontSize: '13px', color: C.gold, background: C.goldDim, border: `1px solid ${C.goldBorder}`, borderRadius: '12px', padding: '7px 14px', cursor: 'pointer', textAlign: 'left', maxWidth: '280px', lineHeight: 1.4 }}>
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}
          {messages.map((msg, i) => (
            <div key={i} style={{ marginBottom: '18px', display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
              {msg.role === 'assistant' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '6px' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: C.goldDim, border: `1px solid ${C.goldBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}></div>
                  <span style={{ fontFamily: F.mono, fontSize: '10px', color: C.gold, letterSpacing: '0.1em' }}>DIGITAL TWIN CEO</span>
                </div>
              )}
              <div style={{ maxWidth: '82%', padding: '14px 18px', borderRadius: msg.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px', background: msg.role === 'user' ? 'rgba(201,168,76,0.12)' : 'var(--kb-bg-raised)', border: `1px solid ${msg.role === 'user' ? C.goldBorder : C.border}`, fontSize: '15px', color: C.text, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: C.goldDim, border: `1px solid ${C.goldBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}></div>
              <div style={{ padding: '12px 16px', background: 'var(--kb-bg-raised)', border: `1px solid ${C.border}`, borderRadius: '12px', color: C.muted, fontSize: '14px' }}>Thinking...</div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={{ borderTop: `1px solid ${C.border}`, padding: '16px 20px', display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask anything about this business..."
            rows={2}
            style={{ flex: 1, background: 'var(--kb-bg-raised)', border: `1px solid ${C.border}`, borderRadius: '10px', padding: '12px 16px', color: C.text, fontSize: '15px', fontFamily: F.body, resize: 'none', outline: 'none', lineHeight: 1.5 }}
          />
          <button onClick={sendMessage} disabled={!input.trim() || loading || !hasEnoughContext}
            style={{ padding: '12px 22px', background: input.trim() && !loading && hasEnoughContext ? C.gold : 'var(--kb-border)', border: 'none', borderRadius: '10px', color: input.trim() && !loading && hasEnoughContext ? 'var(--kb-bg)' : C.faint, fontSize: '15px', fontWeight: 590, cursor: input.trim() && !loading && hasEnoughContext ? 'pointer' : 'default', transition: 'all 0.2s', whiteSpace: 'nowrap' }}>
            Ask →
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
function ScottMcGrathTab() {
  const [pw, setPw] = useState('')
  const [error, setError] = useState(false)

  const attempt = () => {
    if (pw.trim().toLowerCase() === 'nexxess') {
      window.location.href = '/digital-twin/scott-mcgrath'
    } else {
      setError(true)
      setPw('')
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '48px 44px', maxWidth: '420px', width: '100%', textAlign: 'center' }}>
        <div style={{ marginBottom: "12px", color: "#C9A84C" }}><svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/></svg></div>
        <div style={{ fontFamily: F.display, fontSize: '24px', fontWeight: 510, color: C.text, marginBottom: '8px' }}>Scott McGrath</div>
        <div style={{ fontSize: '14px', color: C.muted, marginBottom: '28px', lineHeight: 1.6 }}>
          AI Digital Brain · Nexxess International<br />
          <span style={{ fontFamily: F.mono, fontSize: '11px', color: C.faint }}>Password required to access</span>
        </div>
        <input
          type="password"
          value={pw}
          onChange={e => { setPw(e.target.value); setError(false) }}
          onKeyDown={e => e.key === 'Enter' && attempt()}
          placeholder="Enter password..."
          autoFocus
          style={{ width: '100%', boxSizing: 'border-box', padding: '14px 18px', background: 'var(--kb-bg-raised)', border: `1px solid ${error ? 'rgba(231,76,60,0.5)' : C.border}`, borderRadius: '10px', color: C.text, fontSize: '16px', fontFamily: F.body, outline: 'none', marginBottom: '12px', textAlign: 'center', letterSpacing: '0.1em' }}
        />
        {error && (
          <div style={{ fontSize: '13px', color: 'var(--kb-red)', marginBottom: '12px' }}>Incorrect password — try again</div>
        )}
        <button onClick={attempt}
          style={{ width: '100%', padding: '14px', background: C.gold, border: 'none', borderRadius: '10px', color: 'var(--kb-bg)', fontSize: '15px', fontWeight: 590, cursor: 'pointer', fontFamily: F.body }}>
          Access Digital Twin →
        </button>
      </div>
    </div>
  )
}

// ─── Knowledge Base Tab ─────────────────────────────────────────────────────
function KnowledgeBaseTab({ personaId }: { personaId: string }) {
  const [mode, setMode] = useState<'pdf' | 'text' | 'video'>('pdf')
  const [sourceName, setSourceName] = useState('')
  const [transcript, setTranscript] = useState('')
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null)
  const [sources, setSources] = useState<{ source_type: string; source_name: string; chunks: number; created_at: string }[]>([])
  const [loadingKB, setLoadingKB] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/digital-twin/knowledge?persona_id=${personaId}`)
      .then(r => r.json())
      .then(d => { setSources(d.sources || []); setLoadingKB(false) })
      .catch(() => setLoadingKB(false))
  }, [personaId, result])

  const upload = async () => {
    setUploading(true); setResult(null)
    try {
      if (mode === 'video' && videoFile) {
        const form = new FormData()
        form.append('file', videoFile)
        form.append('persona_id', personaId)
        form.append('source_name', sourceName.trim() || videoFile.name)
        const res = await fetch('/api/digital-twin/transcribe', { method: 'POST', body: form })
        const data = await res.json()
        if (data.success) {
          setResult({ ok: true, msg: `Transcribed and stored ${data.chunks_stored} knowledge chunks.` })
          setVideoFile(null); setSourceName('')
        } else { setResult({ ok: false, msg: data.error || 'Transcription failed' }) }
      } else if (mode === 'pdf' && pdfFile) {
        const form = new FormData()
        form.append('file', pdfFile)
        form.append('persona_id', personaId)
        form.append('source_name', sourceName.trim() || pdfFile.name)
        const res = await fetch('/api/digital-twin/parse-pdf', { method: 'POST', body: form })
        const data = await res.json()
        if (data.success) {
          setResult({ ok: true, msg: `Parsed and stored ${data.chunks_stored} knowledge chunks.` })
          setPdfFile(null); setSourceName('')
        } else { setResult({ ok: false, msg: data.error || 'Parse failed' }) }
      } else if (mode === 'text' && transcript.trim()) {
        const res = await fetch('/api/digital-twin/ingest', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ persona_id: personaId, source_type: 'transcript', source_name: sourceName.trim() || 'Pasted text', content: transcript }),
        })
        const data = await res.json()
        if (data.success) {
          setResult({ ok: true, msg: `Stored ${data.chunks_stored} knowledge chunks.` })
          setTranscript(''); setSourceName('')
        } else { setResult({ ok: false, msg: data.error || 'Ingest failed' }) }
      }
    } catch { setResult({ ok: false, msg: 'Upload failed. Please try again.' }) }
    setUploading(false)
  }

  const deleteSource = async (name: string) => {
    setDeleting(name)
    await fetch('/api/digital-twin/knowledge', {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ persona_id: personaId, source_name: name }),
    })
    setSources(prev => prev.filter(s => s.source_name !== name))
    setDeleting(null)
  }

  const sourceColors: Record<string, string> = { video_transcript: '#5b8dee', pdf: C.gold, transcript: C.green, interview: C.green }

  return (
    <div>
      {/* Upload Section */}
      <div style={{ ...card, marginBottom: '20px' }}>
        <div style={{ fontSize: '16px', fontWeight: 590, color: C.text, marginBottom: '16px' }}>Add Knowledge</div>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          {(['pdf', 'text', 'video'] as const).map(m => (
            <button key={m} onClick={() => { setMode(m); setResult(null) }}
              style={{ padding: '9px 20px', borderRadius: '8px', border: `1px solid ${mode === m ? C.goldBorder : C.border}`, background: mode === m ? C.goldDim : 'transparent', color: mode === m ? C.gold : C.muted, fontSize: '13px', fontWeight: 590, cursor: 'pointer' }}>
              {m === 'pdf' ? 'Upload PDF' : m === 'video' ? 'Video / Audio' : 'Paste Text'}
            </button>
          ))}
        </div>

        <div style={{ marginBottom: '14px' }}>
          <label style={{ display: 'block', fontSize: '12px', color: C.muted, marginBottom: '6px', fontWeight: 510 }}>Source Name</label>
          <input value={sourceName} onChange={e => setSourceName(e.target.value)} placeholder="e.g. Q1 Operations Review, CEO Interview Part 2"
            style={{ width: '100%', padding: '10px 14px', background: 'var(--kb-bg-raised)', border: `1px solid ${C.border}`, borderRadius: '8px', color: C.text, fontSize: '14px', outline: 'none' }} />
        </div>

        {mode === 'pdf' && (
          <div style={{ marginBottom: '14px' }}>
            <input type="file" accept=".pdf" onChange={e => { const f = e.target.files?.[0]; if (f) { setPdfFile(f); if (!sourceName) setSourceName(f.name.replace(/\.pdf$/i, '')) } }}
              style={{ width: '100%', padding: '14px', background: 'var(--kb-bg-raised)', border: `1px solid ${C.border}`, borderRadius: '8px', color: C.text, fontSize: '14px' }} />
            {pdfFile && <div style={{ fontSize: '13px', color: C.green, marginTop: '6px' }}>{pdfFile.name} ({(pdfFile.size / 1024).toFixed(0)} KB)</div>}
          </div>
        )}

        {mode === 'video' && (
          <div style={{ marginBottom: '14px' }}>
            <input type="file" accept="video/*,audio/*,.mp4,.mov,.mp3,.wav,.m4a,.webm" onChange={e => { const f = e.target.files?.[0]; if (f) { setVideoFile(f); if (!sourceName) setSourceName(f.name.replace(/\.[^.]+$/, '')) } }}
              style={{ width: '100%', padding: '14px', background: 'var(--kb-bg-raised)', border: `1px solid ${C.border}`, borderRadius: '8px', color: C.text, fontSize: '14px' }} />
            {videoFile && <div style={{ fontSize: '13px', color: C.green, marginTop: '6px' }}>{videoFile.name} ({(videoFile.size / 1024 / 1024).toFixed(1)} MB)</div>}
            <div style={{ fontSize: '12px', color: C.faint, marginTop: '6px' }}>MP4, MOV, MP3, WAV, M4A, WebM. Max 25MB. AI will transcribe and store automatically.</div>
          </div>
        )}

        {mode === 'text' && (
          <div style={{ marginBottom: '14px' }}>
            <textarea value={transcript} onChange={e => setTranscript(e.target.value)} placeholder="Paste transcript, SOP, white paper, or any text content..."
              rows={10} style={{ width: '100%', padding: '14px', background: 'var(--kb-bg-raised)', border: `1px solid ${C.border}`, borderRadius: '8px', color: C.text, fontSize: '14px', resize: 'vertical', lineHeight: 1.6, outline: 'none' }} />
            {transcript.length > 0 && <div style={{ fontSize: '12px', color: C.faint, marginTop: '6px' }}>~{Math.ceil(transcript.length / 1800)} knowledge chunks</div>}
          </div>
        )}

        {result && (
          <div style={{ padding: '12px 16px', background: result.ok ? 'rgba(46,204,139,0.08)' : 'rgba(231,76,60,0.08)', border: `1px solid ${result.ok ? 'rgba(46,204,139,0.2)' : 'rgba(231,76,60,0.2)'}`, borderRadius: '8px', fontSize: '14px', color: result.ok ? C.green : '#E74C3C', marginBottom: '14px' }}>
            {result.msg}
          </div>
        )}

        <button onClick={upload} disabled={uploading || (!pdfFile && !videoFile && !transcript.trim())}
          style={{ padding: '12px 28px', background: (!pdfFile && !videoFile && !transcript.trim()) || uploading ? 'var(--kb-bg-raised)' : C.gold, border: 'none', borderRadius: '8px', color: (!pdfFile && !videoFile && !transcript.trim()) || uploading ? C.faint : 'var(--kb-bg)', fontSize: '14px', fontWeight: 590, cursor: uploading ? 'default' : 'pointer' }}>
          {uploading ? 'Processing...' : mode === 'pdf' ? 'Parse & Store PDF' : mode === 'video' ? 'Transcribe & Store' : 'Process & Store Text'}
        </button>
      </div>

      {/* Knowledge Base Browser */}
      <div style={{ ...card }}>
        <div style={{ fontSize: '16px', fontWeight: 590, color: C.text, marginBottom: '16px' }}>Knowledge Base</div>
        {loadingKB ? (
          <div style={{ color: C.faint }}>Loading...</div>
        ) : sources.length === 0 ? (
          <div style={{ color: C.faint, fontSize: '14px', padding: '20px 0', textAlign: 'center' }}>No knowledge sources yet. Upload PDFs, video recordings, SOPs, or paste text above to build the knowledge base.</div>
        ) : (
          <div>
            <div style={{ fontSize: '12px', color: C.muted, marginBottom: '14px' }}>{sources.length} sources, {sources.reduce((s, k) => s + k.chunks, 0)} total knowledge chunks</div>
            {sources.map((s, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: i < sources.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: sourceColors[s.source_type] || C.muted, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 510, color: C.text }}>{s.source_name}</div>
                    <div style={{ fontSize: '12px', color: C.faint }}>{s.source_type.replace(/_/g, ' ')} &middot; {s.chunks} chunks &middot; {new Date(s.created_at).toLocaleDateString()}</div>
                  </div>
                </div>
                <button onClick={() => deleteSource(s.source_name)} disabled={deleting === s.source_name}
                  style={{ padding: '6px 12px', background: 'rgba(231,76,60,0.08)', border: '1px solid rgba(231,76,60,0.2)', borderRadius: '6px', color: 'var(--kb-red)', fontSize: '12px', fontWeight: 510, cursor: 'pointer' }}>
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

export default function DigitalTwinPage() {
  const [activeTab, setActiveTab] = useState<'about' | 'interview' | 'knowledge' | 'chat' | 'scott'>('about')
  const [answers, setAnswers] = useState<Answers>({})
  const [syncStatus, setSyncStatus] = useState<'idle' | 'saving' | 'saved' | 'local'>('idle')
  const [myTwin, setMyTwin] = useState<{ slug: string; business_name: string } | null>(null)

  // Check if seller has their own Digital Twin
  useEffect(() => {
    fetch('/api/digital-twin/my-twin').then(r => r.json()).then(d => {
      if (d.slug) setMyTwin(d)
    }).catch(() => {})
  }, [])

  // On mount: load from Supabase first, fall back to localStorage
  useEffect(() => {
    async function loadAnswers() {
      // Always load localStorage immediately for instant render
      try {
        const local = localStorage.getItem('kb_twin_answers')
        if (local) setAnswers(JSON.parse(local))
      } catch { /* ignore */ }

      // Then try Supabase, if authenticated, it wins (most up-to-date)
      try {
        const res = await fetch('/api/digital-twin/load')
        const data = await res.json()
        if (data.answers && Object.keys(data.answers).length > 0) {
          setAnswers(data.answers)
          // Sync Supabase data back to localStorage as backup
          localStorage.setItem('kb_twin_answers', JSON.stringify(data.answers))
          setSyncStatus('saved')
        } else if (data.reason === 'unauthenticated') {
          setSyncStatus('local') // demo mode, localStorage only
        }
      } catch { /* network error, localStorage data still shown */ }
    }
    loadAnswers()
  }, [])

  // updateAnswers: update state + localStorage immediately, fire Supabase save in background
  const updateAnswers = useCallback((a: Answers) => {
    setAnswers(a)
    try { localStorage.setItem('kb_twin_answers', JSON.stringify(a)) } catch { /* ignore */ }
  }, [])

  // saveOneAnswer: called by InterviewTab with the specific answer that changed
  const saveOneAnswer = useCallback(async (moduleId: string, qIndex: number, answer: string) => {
    setSyncStatus('saving')
    try {
      const res = await fetch('/api/digital-twin/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ module_id: moduleId, question_index: qIndex, answer }),
      })
      const data = await res.json()
      setSyncStatus(data.saved ? 'saved' : 'local')
    } catch {
      setSyncStatus('local') // saved to localStorage at minimum
    }
  }, [])

  const totalAnswered = Object.values(answers).reduce((sum, mod) => sum + Object.keys(mod).length, 0)
  const totalQuestions = MODULES.reduce((sum, m) => sum + m.questions.length, 0)
  const personaId = 'default-ceo-twin'

  const TABS = [
    { id: 'about', label: 'About This Feature', sub: 'What it is & how it works' },
    { id: 'interview', label: 'CEO Interview', sub: `${totalAnswered}/${totalQuestions} answered` },
    { id: 'knowledge', label: 'Knowledge Base', sub: 'PDFs, videos, SOPs, recordings' },
    { id: 'chat', label: 'Ask the CEO', sub: totalAnswered >= 5 ? 'Digital Twin active' : 'Complete interview first' },
    { id: 'scott', label: 'Scott McGrath', sub: 'Nexxess · AI Digital Brain' },
  ] as const

  return (
    <div style={{ padding: '32px 36px', fontFamily: F.body, color: C.text, maxWidth: '1100px' }}>

      {/* Page Header */}
      <div style={{ marginBottom: '28px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ fontFamily: F.mono, fontSize: '11px', color: C.gold, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '8px' }}>AI Technology</div>
          <h1 style={{ fontFamily: F.display, fontSize: '36px', fontWeight: 510, margin: '0 0 8px', color: C.text }}>Digital Twin CEO</h1>
          <p style={{ fontSize: '16px', color: C.muted, margin: 0, lineHeight: 1.6 }}>
            Capture everything a 20-year owner knows, so it transfers to the buyer with the business.
          </p>
        </div>
        {/* Sync status indicator */}
        <div style={{ fontSize: '12px', fontFamily: F.mono, padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--kb-border)', color: syncStatus === 'saved' ? C.green : syncStatus === 'saving' ? C.gold : syncStatus === 'local' ? C.muted : 'transparent', background: 'var(--kb-bg-raised)', whiteSpace: 'nowrap' }}>
          {syncStatus === 'saved' && 'Saved to your account'}
          {syncStatus === 'saving' && '⟳ Saving...'}
          {syncStatus === 'local' && '◌ Saved locally (demo mode)'}
        </div>
      </div>

      {/* My Twin Banner (for sellers who completed onboarding) */}
      {myTwin && (
        <a href={`/digital-twin/${myTwin.slug}`} style={{
          display: 'flex', alignItems: 'center', gap: '14px',
          padding: '16px 22px', marginBottom: '20px', borderRadius: '12px',
          background: 'linear-gradient(135deg, var(--kb-accent-dim), var(--kb-bg-panel))',
          border: '1px solid var(--kb-accent-border)',
          textDecoration: 'none', transition: 'all 0.2s',
        }}>
          <div style={{
            width: '44px', height: '44px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #C9A84C, #E8C96A)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '18px', color: '#0B1B3E', fontWeight: 600, flexShrink: 0,
          }}>{(myTwin.business_name || 'B')[0]}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '15px', fontWeight: 590, color: C.text }}>Your Digital Twin: {myTwin.business_name}</div>
            <div style={{ fontSize: '12px', color: C.muted, marginTop: '2px' }}>Complete the interview, upload docs, and train your AI twin for buyers</div>
          </div>
          <div style={{ fontSize: '13px', color: C.gold, fontWeight: 510 }}>Open →</div>
        </a>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '28px', flexWrap: 'wrap' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            style={{ padding: '12px 20px', borderRadius: '12px', border: `1px solid ${activeTab === t.id ? C.goldBorder : C.border}`, background: activeTab === t.id ? C.goldDim : 'transparent', color: activeTab === t.id ? C.gold : C.muted, fontSize: '14px', fontWeight: activeTab === t.id ? 600 : 400, cursor: 'pointer', transition: 'all 0.15s', textAlign: 'left' }}>
            <div>{t.label}</div>
            <div style={{ fontSize: '11px', marginTop: '2px', fontFamily: F.mono, color: activeTab === t.id ? 'rgba(201,168,76,0.7)' : C.faint }}>{t.sub}</div>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'about' && <AboutTab onStartInterview={() => setActiveTab('interview')} />}
      {activeTab === 'interview' && <InterviewTab answers={answers} setAnswers={updateAnswers} onSaveAnswer={saveOneAnswer} />}
      {activeTab === 'knowledge' && <KnowledgeBaseTab personaId={personaId} />}
      {activeTab === 'chat' && <ChatTab answers={answers} />}
      {activeTab === 'scott' && <ScottMcGrathTab />}
    </div>
  )
}
