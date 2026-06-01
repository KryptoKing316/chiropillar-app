'use client'
import { useState, useRef, useEffect } from 'react'

type Message = { role: 'user' | 'assistant'; content: string }

interface CIMChatProps {
  cimId: string
  initialConversation: Message[]
  onRoundChange: (round: number) => void
  onComplete: (cimData: Record<string, unknown>) => void
}

function detectRound(conversation: Message[]): number {
  const assistantMessages = conversation.filter(m => m.role === 'assistant').length
  if (assistantMessages <= 1) return 1
  if (assistantMessages <= 8) return 2
  if (assistantMessages <= 19) return 3
  if (assistantMessages <= 27) return 4
  if (assistantMessages <= 36) return 5
  return 5
}

const ROUND_LABELS = ['Business Identity', 'Financials', 'Operations', 'Market Position', 'Deal Structure']

// KB advisor avatar
function KBAvatar({ size = 36 }: { size?: number }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: 'linear-gradient(135deg, #C9A84C 0%, #A8873A 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: '0 0 0 2px rgba(201,168,76,0.25)',
    }}>
      <span style={{
        fontFamily: "'DM Mono', monospace", fontSize: `${size * 0.32}px`,
        fontWeight: 700, color: '#0B1B3E', letterSpacing: '-0.02em',
      }}>KB</span>
    </div>
  )
}

// Render assistant message with basic markdown-like formatting
function AssistantBubble({ content }: { content: string }) {
  // Bold text between **
  const formatted = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
  return (
    <div
      style={{
        maxWidth: '82%',
        padding: '16px 20px',
        borderRadius: '4px 18px 18px 18px',
        background: '#0F2347',
        border: '1px solid rgba(201,168,76,0.14)',
        fontSize: '16px',
        color: '#F2EEE7',
        lineHeight: 1.75,
        fontFamily: "'DM Sans', sans-serif",
        whiteSpace: 'pre-wrap',
      }}
      dangerouslySetInnerHTML={{ __html: formatted }}
    />
  )
}

export default function CIMChat({ cimId, initialConversation, onRoundChange, onComplete }: CIMChatProps) {
  const [conversation, setConversation] = useState<Message[]>(initialConversation)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [started, setStarted] = useState(initialConversation.length > 0)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const currentRound = detectRound(conversation)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [conversation, loading])

  useEffect(() => {
    onRoundChange(currentRound)
  }, [conversation, onRoundChange, currentRound])

  const startSession = async () => {
    setStarted(true)
    setLoading(true)
    try {
      const res = await fetch('/api/cim/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cim_id: cimId, message: 'Start my CIM.', conversation: [] }),
      })
      const data = await res.json()
      setConversation([
        { role: 'user', content: 'Start my CIM.' },
        { role: 'assistant', content: data.message },
      ])
    } catch {
      setConversation([{ role: 'assistant', content: 'Something went wrong. Please try again.' }])
    }
    setLoading(false)
    setTimeout(() => textareaRef.current?.focus(), 200)
  }

  const sendMessage = async () => {
    if (!input.trim() || loading) return
    const userMsg = input.trim()
    setInput('')
    const newConv: Message[] = [...conversation, { role: 'user', content: userMsg }]
    setConversation(newConv)
    setLoading(true)

    try {
      const res = await fetch('/api/cim/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cim_id: cimId, message: userMsg, conversation }),
      })
      const data = await res.json()
      setConversation([...newConv, { role: 'assistant', content: data.message }])
      if (data.is_complete && data.cim_data) {
        onComplete(data.cim_data)
      }
    } catch {
      setConversation([...newConv, { role: 'assistant', content: 'Something went wrong. Please try again.' }])
    }
    setLoading(false)
    setTimeout(() => textareaRef.current?.focus(), 100)
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // ── Welcome screen ──────────────────────────────────────────
  if (!started) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '48px 32px', textAlign: 'center',
        gap: '0',
      }}>
        <style>{`
          @keyframes pulse-ring {
            0%, 100% { box-shadow: 0 0 0 4px rgba(201,168,76,0.15); }
            50% { box-shadow: 0 0 0 8px rgba(201,168,76,0.25); }
          }
        `}</style>

        {/* Avatar */}
        <div style={{
          width: '72px', height: '72px', borderRadius: '50%',
          background: 'linear-gradient(135deg, #C9A84C 0%, #A8873A 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: '24px',
          animation: 'pulse-ring 3s ease-in-out infinite',
        }}>
          <span style={{
            fontFamily: "'DM Mono', monospace", fontSize: '22px',
            fontWeight: 700, color: '#0B1B3E',
          }}>KB</span>
        </div>

        <h2 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: '28px', fontWeight: 600,
          color: '#F2EEE7', marginBottom: '10px', marginTop: 0,
        }}>
          Ready to Build Your CIM
        </h2>

        <p style={{
          fontSize: '17px', color: '#9BA8C0',
          lineHeight: 1.75, maxWidth: '460px',
          margin: '0 auto 10px',
        }}>
          I will ask you <strong style={{ color: '#F2EEE7' }}>one question at a time.</strong> You answer in plain language — no forms, no spreadsheets. I handle the rest.
        </p>

        <p style={{
          fontSize: '15px', color: '#6A7A9A',
          lineHeight: 1.65, maxWidth: '400px',
          margin: '0 auto 36px',
        }}>
          Most business owners finish in about 20 minutes. When we're done, you'll have a professional document that serious buyers use to evaluate and acquire businesses like yours.
        </p>

        {/* 5-round preview */}
        <div style={{
          display: 'flex', gap: '8px', flexWrap: 'wrap',
          justifyContent: 'center', marginBottom: '36px',
        }}>
          {ROUND_LABELS.map((label, i) => (
            <div key={i} style={{
              padding: '7px 14px',
              background: 'rgba(201,168,76,0.07)',
              border: '1px solid rgba(201,168,76,0.18)',
              borderRadius: '20px',
              fontSize: '12px', color: '#C9A84C',
              fontFamily: "'DM Mono', monospace",
              letterSpacing: '0.06em',
            }}>
              {i + 1}. {label.toUpperCase()}
            </div>
          ))}
        </div>

        <button
          onClick={startSession}
          style={{
            padding: '16px 44px',
            background: '#C9A84C', color: '#0B1B3E',
            border: 'none', borderRadius: '10px',
            fontSize: '17px', fontWeight: 700,
            fontFamily: "'DM Sans', sans-serif",
            cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(201,168,76,0.3)',
            transition: 'transform 0.15s, box-shadow 0.15s',
          }}
          onMouseEnter={e => {
            (e.target as HTMLButtonElement).style.transform = 'translateY(-1px)'
            ;(e.target as HTMLButtonElement).style.boxShadow = '0 6px 28px rgba(201,168,76,0.4)'
          }}
          onMouseLeave={e => {
            (e.target as HTMLButtonElement).style.transform = 'translateY(0)'
            ;(e.target as HTMLButtonElement).style.boxShadow = '0 4px 20px rgba(201,168,76,0.3)'
          }}
        >
          Let's Build My CIM
        </button>

        <p style={{ fontSize: '13px', color: '#4A5880', marginTop: '16px' }}>
          Your answers stay private. Nothing is shared without your approval.
        </p>
      </div>
    )
  }

  // ── Chat screen ─────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      <style>{`
        @keyframes dot-bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-5px); opacity: 1; }
        }
        .cim-textarea:focus { outline: none; border-color: rgba(201,168,76,0.45) !important; background: rgba(255,255,255,0.07) !important; }
        .cim-send:hover:not(:disabled) { background: #DDB85A !important; }
        .cim-msg-user { background: rgba(201,168,76,0.1); border: 1px solid rgba(201,168,76,0.22); border-radius: 18px 4px 18px 18px; }
      `}</style>

      {/* Round indicator strip */}
      <div style={{
        display: 'flex', gap: '4px', alignItems: 'center',
        marginBottom: '16px', flexWrap: 'wrap',
      }}>
        {ROUND_LABELS.map((label, i) => {
          const roundNum = i + 1
          const isDone = roundNum < currentRound
          const isActive = roundNum === currentRound
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <div style={{
                padding: '4px 10px',
                borderRadius: '12px',
                fontSize: '11px',
                fontFamily: "'DM Mono', monospace",
                letterSpacing: '0.05em',
                background: isActive
                  ? 'rgba(201,168,76,0.12)'
                  : isDone ? 'rgba(46,204,139,0.08)' : 'transparent',
                border: `1px solid ${isActive ? 'rgba(201,168,76,0.35)' : isDone ? 'rgba(46,204,139,0.25)' : 'rgba(255,255,255,0.07)'}`,
                color: isActive ? '#C9A84C' : isDone ? '#2ECC8B' : '#4A5880',
                transition: 'all 0.3s',
              }}>
                {isDone ? '✓ ' : ''}{roundNum}. {label}
              </div>
              {i < ROUND_LABELS.length - 1 && (
                <div style={{ width: '16px', height: '1px', background: 'rgba(255,255,255,0.08)' }} />
              )}
            </div>
          )
        })}
      </div>

      {/* Messages */}
      <div style={{
        flex: 1, overflowY: 'auto',
        display: 'flex', flexDirection: 'column', gap: '18px',
        paddingRight: '4px',
        paddingBottom: '8px',
      }}>
        {conversation.filter(m => !(m.role === 'user' && m.content === 'Start my CIM.')).map((msg, i) => (
          <div key={i} style={{
            display: 'flex',
            justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
            alignItems: 'flex-start',
            gap: '10px',
          }}>
            {msg.role === 'assistant' && <KBAvatar />}

            {msg.role === 'user' ? (
              <div className="cim-msg-user" style={{
                maxWidth: '75%',
                padding: '14px 18px',
                fontSize: '16px',
                color: '#F2EEE7',
                lineHeight: 1.7,
                fontFamily: "'DM Sans', sans-serif",
                whiteSpace: 'pre-wrap',
              }}>
                {msg.content}
              </div>
            ) : (
              <AssistantBubble content={msg.content} />
            )}
          </div>
        ))}

        {/* Typing indicator */}
        {loading && (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <KBAvatar />
            <div style={{
              padding: '16px 20px',
              background: '#0F2347',
              border: '1px solid rgba(201,168,76,0.14)',
              borderRadius: '4px 18px 18px 18px',
              display: 'flex', gap: '6px', alignItems: 'center',
            }}>
              {[0, 1, 2].map(d => (
                <div key={d} style={{
                  width: '8px', height: '8px', borderRadius: '50%',
                  background: '#C9A84C',
                  animation: `dot-bounce 1.4s ease-in-out ${d * 0.2}s infinite`,
                }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div style={{
        borderTop: '1px solid rgba(255,255,255,0.08)',
        paddingTop: '16px',
        display: 'flex', gap: '10px', alignItems: 'flex-end',
        marginTop: '8px',
      }}>
        <textarea
          ref={textareaRef}
          className="cim-textarea"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Type your answer here…  (Press Enter to send)"
          rows={3}
          style={{
            flex: 1, padding: '14px 16px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '12px', color: '#F2EEE7',
            fontSize: '16px', fontFamily: "'DM Sans', sans-serif",
            resize: 'none', lineHeight: 1.65,
            transition: 'border-color 0.2s, background 0.2s',
          }}
        />
        <button
          className="cim-send"
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          style={{
            padding: '14px 24px',
            background: loading || !input.trim() ? 'rgba(201,168,76,0.35)' : '#C9A84C',
            color: '#0B1B3E', border: 'none', borderRadius: '12px',
            fontSize: '15px', fontWeight: 700,
            fontFamily: "'DM Sans', sans-serif",
            cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
            transition: 'background 0.2s',
            whiteSpace: 'nowrap',
            minHeight: '52px',
          }}
        >
          Send →
        </button>
      </div>

      <div style={{
        fontSize: '12px', color: '#3A4860',
        textAlign: 'center', marginTop: '10px',
      }}>
        Shift + Enter for a new line · Your answers are private and never shared without your approval
      </div>
    </div>
  )
}
