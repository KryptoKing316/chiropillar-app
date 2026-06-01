'use client'
import { useState, useRef, useEffect, useCallback } from 'react'

type Msg = { role: 'user' | 'assistant'; content: string }

// Mix of substantive + casual questions to set the tone
const QUICK_QUESTIONS = [
  '🏢 What is my business worth right now?',
  '💸 What are add-backs and how do I find them?',
  '🤝 How does a finder\'s fee work in M&A?',
  '📈 What deal structures work best for SBA buyers?',
  '🎯 Who would buy my company?',
  '🙏 What does Kingdom Broker stand for?',
]

// Web Speech API — lets users actually SPEAK to Eric
type SpeechRecognitionType = {
  continuous: boolean
  interimResults: boolean
  lang: string
  start: () => void
  stop: () => void
  onresult: ((event: { results: { [key: number]: { [key: number]: { transcript: string } } } }) => void) | null
  onend: (() => void) | null
  onerror: (() => void) | null
}

declare global {
  interface Window {
    webkitSpeechRecognition?: new () => SpeechRecognitionType
    SpeechRecognition?: new () => SpeechRecognitionType
  }
}

const GREETINGS = [
  "Hey, Eric AI here. I'm a world-class business advisor powered by Kingdom Broker. Available 24/7. Ask me anything about selling your business, valuations, deal structures, or how we match $1M-$20M owners with the right buyers.",
  "Eric AI, your virtual business advisor. I hold the deepest M&A, valuation, and deal structure knowledge in the industry, delivered in Eric Skeldon's voice. Ask me anything — I'm here all night.",
  "Eric AI here. World-class business advisor and broker knowledge, available 24/7. I work with $1M-$20M owners on exits, valuations, and deal structures. Faith-driven, numbers-first. What's on your mind?",
]

export default function EricAIChat() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [listening, setListening] = useState(false)
  const [voiceSupported, setVoiceSupported] = useState(false)
  const [greeting] = useState(() => GREETINGS[Math.floor(Math.random() * GREETINGS.length)])
  const bottomRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<SpeechRecognitionType | null>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  // Initialize Web Speech API for voice input
  useEffect(() => {
    if (typeof window === 'undefined') return
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) return
    setVoiceSupported(true)
    const recognition = new SR()
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = 'en-US'
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      setInput(transcript)
      setListening(false)
      // Auto-send if we got a real sentence
      if (transcript.split(' ').length >= 3) {
        setTimeout(() => send(transcript), 200)
      }
    }
    recognition.onend = () => setListening(false)
    recognition.onerror = () => setListening(false)
    recognitionRef.current = recognition
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const send = useCallback(async (text?: string) => {
    const msg = (text || input).trim()
    if (!msg || loading) return
    setInput('')
    const newMsgs: Msg[] = [...messages, { role: 'user', content: msg }]
    setMessages(newMsgs)
    setLoading(true)

    try {
      const res = await fetch('/api/digital-twin/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: msg, persona_slug: 'eric-jr' }),
      })
      const data = await res.json()
      setMessages([...newMsgs, { role: 'assistant', content: data.answer || 'Hmm, my brain hiccupped. Try that again?' }])
    } catch {
      setMessages([...newMsgs, { role: 'assistant', content: 'Looks like my connection dropped. Mind giving it another shot?' }])
    }
    setLoading(false)
  }, [input, loading, messages])

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  const toggleVoice = () => {
    if (!recognitionRef.current) return
    if (listening) {
      recognitionRef.current.stop()
      setListening(false)
    } else {
      try {
        recognitionRef.current.start()
        setListening(true)
      } catch {
        setListening(false)
      }
    }
  }

  // Floating bubble (closed state)
  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        aria-label="Talk with Eric AI — World-Class Business Advisor"
        title="Talk with Eric AI — Online 24/7"
        style={{
          position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999,
          padding: '10px 16px 10px 10px',
          borderRadius: '999px',
          background: 'linear-gradient(135deg, #C9A84C, #E8C96A)',
          border: 'none', cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(201,168,76,0.45)',
          display: 'flex', alignItems: 'center', gap: '10px',
          transition: 'transform 0.2s, box-shadow 0.2s',
          fontFamily: "'Inter', system-ui, sans-serif",
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px) scale(1.04)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(201,168,76,0.6)' }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(201,168,76,0.45)' }}
      >
        <div style={{
          width: '40px', height: '40px', borderRadius: '50%',
          background: '#0B1B3E',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#C9A84C', fontWeight: 700, fontSize: '15px',
          fontFamily: "'Playfair Display', Georgia, serif",
          letterSpacing: '0.04em',
          position: 'relative',
        }}>
          ES
          <span style={{
            position: 'absolute', bottom: '-2px', right: '-2px',
            width: '12px', height: '12px', borderRadius: '50%',
            background: '#22c55e', border: '2px solid #C9A84C',
            animation: 'kbPulse 2s ease-in-out infinite',
          }}/>
        </div>
        <div style={{ textAlign: 'left' }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#0B1B3E', lineHeight: 1.1 }}>Talk to Eric AI</div>
          <div style={{ fontSize: '10px', color: 'rgba(11,27,62,0.7)', lineHeight: 1.3, marginTop: '2px' }}>
            World-Class Business Advisor · 24/7
          </div>
        </div>
        <style>{`
          @keyframes kbPulse {
            0%, 100% { box-shadow: 0 0 0 0 rgba(34,197,94,0.6); }
            50% { box-shadow: 0 0 0 8px rgba(34,197,94,0); }
          }
        `}</style>
      </button>
    )
  }

  return (
    <div style={{
      position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999,
      width: '420px', maxHeight: '640px', height: '75vh',
      borderRadius: '16px', overflow: 'hidden',
      background: 'var(--kb-bg-panel, #0F2347)',
      border: '1px solid var(--kb-accent-border, rgba(201,168,76,0.2))',
      boxShadow: '0 12px 48px rgba(0,0,0,0.45)',
      display: 'flex', flexDirection: 'column',
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 18px',
        background: 'linear-gradient(135deg, rgba(201,168,76,0.18), transparent)',
        borderBottom: '1px solid var(--kb-border, rgba(255,255,255,0.08))',
        display: 'flex', alignItems: 'center', gap: '12px',
      }}>
        <div style={{
          width: '44px', height: '44px', borderRadius: '50%',
          background: 'linear-gradient(135deg, #C9A84C, #E8C96A)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '16px', fontWeight: 700, color: '#0B1B3E',
          fontFamily: "'Playfair Display', Georgia, serif",
          letterSpacing: '0.04em',
          position: 'relative',
        }}>
          ES
          <span style={{
            position: 'absolute', bottom: '0px', right: '0px',
            width: '12px', height: '12px', borderRadius: '50%',
            background: '#22c55e', border: '2px solid #0F2347',
          }}/>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--kb-text, #F2EEE7)' }}>
            Eric AI
          </div>
          <div style={{ fontSize: '11px', color: 'var(--kb-text-muted, #9BA8C0)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e' }}/>
            World-Class Business Advisor · Online 24/7
          </div>
        </div>
        {messages.length > 0 && (
          <button onClick={() => setMessages([])} title="Start fresh" style={{
            background: 'none', border: '1px solid var(--kb-border, rgba(255,255,255,0.08))',
            cursor: 'pointer', padding: '5px 10px', borderRadius: '6px',
            color: 'var(--kb-accent, #C9A84C)', fontSize: '11px', fontWeight: 510,
            fontFamily: "'Inter', system-ui, sans-serif",
          }}>
            New Chat
          </button>
        )}
        <button onClick={() => setOpen(false)} title="Minimize" style={{
          background: 'none', border: 'none', cursor: 'pointer', padding: '4px',
          color: 'var(--kb-text-muted, #9BA8C0)',
        }}>
          <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M4 4l8 8M12 4l-8 8"/>
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: '16px',
        display: 'flex', flexDirection: 'column', gap: '12px',
      }}>
        {messages.length === 0 && (
          <div>
            <div style={{
              padding: '14px 16px', borderRadius: '12px',
              background: 'var(--kb-accent-dim, rgba(201,168,76,0.10))',
              border: '1px solid var(--kb-accent-border, rgba(201,168,76,0.18))',
              fontSize: '14px', color: 'var(--kb-text, #F2EEE7)', lineHeight: 1.65,
              marginBottom: '14px',
            }}>
              {greeting}
              {voiceSupported && (
                <div style={{ marginTop: '10px', fontSize: '11.5px', color: 'var(--kb-text-muted, #9BA8C0)' }}>
                  💬 Type below or 🎙️ tap the mic to speak
                </div>
              )}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--kb-text-muted, #9BA8C0)', fontWeight: 510, marginBottom: '8px', letterSpacing: '0.05em' }}>
              ASK ABOUT
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {QUICK_QUESTIONS.map(q => (
                <button key={q} onClick={() => send(q.replace(/^[\u{1F300}-\u{1F9FF}]\s*/u, ''))} style={{
                  textAlign: 'left', padding: '10px 14px', cursor: 'pointer',
                  background: 'var(--kb-bg-card, rgba(255,255,255,0.03))',
                  border: '1px solid var(--kb-border, rgba(255,255,255,0.08))',
                  borderRadius: '8px', fontSize: '13px',
                  color: 'var(--kb-text-secondary, #CDD8EC)',
                  transition: 'all 0.15s',
                  fontFamily: "'Inter', system-ui, sans-serif",
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--kb-accent, #C9A84C)'; e.currentTarget.style.background = 'rgba(201,168,76,0.06)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--kb-border, rgba(255,255,255,0.08))'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)' }}
                >{q}</button>
              ))}
            </div>
            <div style={{
              marginTop: '14px', padding: '10px 14px',
              borderRadius: '8px',
              background: 'rgba(255,255,255,0.02)',
              border: '1px dashed rgba(201,168,76,0.25)',
              fontSize: '11.5px', color: 'var(--kb-text-muted, #9BA8C0)',
              textAlign: 'center',
            }}>
              Want to talk to the real Eric?{' '}
              <a href="https://calendly.com/ericskeldon/kingdombroker" target="_blank" rel="noopener" style={{ color: 'var(--kb-accent, #C9A84C)', textDecoration: 'none', fontWeight: 600 }}>
                Book a 15-min call →
              </a>
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} style={{
            display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start',
          }}>
            <div style={{
              maxWidth: '85%', padding: '10px 14px', borderRadius: '12px',
              fontSize: '13.5px', lineHeight: 1.65,
              ...(m.role === 'user' ? {
                background: 'var(--kb-accent, #C9A84C)',
                color: '#0B1B3E', fontWeight: 450,
                borderBottomRightRadius: '4px',
              } : {
                background: 'var(--kb-bg-card, rgba(255,255,255,0.04))',
                border: '1px solid var(--kb-border, rgba(255,255,255,0.08))',
                color: 'var(--kb-text, #F2EEE7)',
                borderBottomLeftRadius: '4px',
                whiteSpace: 'pre-wrap' as const,
              }),
            }}>
              {m.content}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 0', color: 'var(--kb-text-muted, #9BA8C0)', fontSize: '12px' }}>
            <div style={{ display: 'flex', gap: '4px' }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{
                  width: '7px', height: '7px', borderRadius: '50%',
                  background: 'var(--kb-accent, #C9A84C)', opacity: 0.4,
                  animation: `pulse 1.2s ease-in-out ${i * 0.15}s infinite`,
                }} />
              ))}
            </div>
            <span style={{ fontStyle: 'italic' }}>Eric AI is thinking...</span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: '12px 14px',
        borderTop: '1px solid var(--kb-border, rgba(255,255,255,0.08))',
        display: 'flex', gap: '8px', alignItems: 'center',
      }}>
        {voiceSupported && (
          <button
            onClick={toggleVoice}
            title={listening ? 'Listening... tap to stop' : 'Tap to speak'}
            style={{
              padding: '10px', borderRadius: '50%', border: 'none',
              background: listening ? '#ef4444' : 'rgba(201,168,76,0.15)',
              color: listening ? '#fff' : 'var(--kb-accent, #C9A84C)',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.15s',
              animation: listening ? 'micPulse 1s ease-in-out infinite' : 'none',
              flexShrink: 0,
            }}
          >
            <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
              <path d="M8 1a2 2 0 0 0-2 2v5a2 2 0 0 0 4 0V3a2 2 0 0 0-2-2zM5 8a3 3 0 0 0 6 0v-.5a.5.5 0 0 1 1 0V8a4 4 0 0 1-3.5 3.97V13.5h2a.5.5 0 0 1 0 1h-5a.5.5 0 0 1 0-1h2v-1.53A4 4 0 0 1 4 8v-.5a.5.5 0 0 1 1 0V8z"/>
            </svg>
          </button>
        )}
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder={listening ? 'Listening...' : 'Ask Eric AI anything, or tap mic to speak...'}
          style={{
            flex: 1, padding: '10px 14px',
            background: 'var(--kb-bg-raised, rgba(255,255,255,0.04))',
            border: '1px solid var(--kb-border, rgba(255,255,255,0.08))',
            borderRadius: '8px', color: 'var(--kb-text, #F2EEE7)',
            fontSize: '13px', outline: 'none',
            fontFamily: "'Inter', system-ui, sans-serif",
          }}
        />
        <button
          onClick={() => send()}
          disabled={!input.trim() || loading}
          title="Send message"
          style={{
            padding: '10px 14px', borderRadius: '8px', border: 'none',
            background: input.trim() && !loading ? 'var(--kb-accent, #C9A84C)' : 'rgba(201,168,76,0.2)',
            color: input.trim() && !loading ? '#0B1B3E' : 'var(--kb-text-muted, #9BA8C0)',
            cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
            fontWeight: 590, fontSize: '13px',
            fontFamily: "'Inter', system-ui, sans-serif",
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M14 2L7 9M14 2l-5 12-2-5-5-2z"/>
          </svg>
        </button>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.1); }
        }
        @keyframes micPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.6); }
          50% { box-shadow: 0 0 0 6px rgba(239,68,68,0); }
        }
      `}</style>
    </div>
  )
}
