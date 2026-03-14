'use client'
import { useState, useRef, useEffect } from 'react'
import { useStream } from '@/lib/useStream'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface QATabProps {
  text: string
}

export default function QATab({ text }: QATabProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const { content, status, start, reset } = useStream()
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, content])

  // When stream finishes, add assistant message to history
  useEffect(() => {
    if (status === 'done' && content) {
      setMessages(prev => [...prev, { role: 'assistant', content }])
      reset()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

  async function handleSubmit() {
    const q = input.trim()
    if (!q || status === 'loading' || status === 'streaming') return

    const userMsg: Message = { role: 'user', content: q }
    setMessages(prev => [...prev, userMsg])
    setInput('')

    await start('/api/chat', {
      text,
      messages: [...messages, userMsg],
    })
  }

  const isBusy = status === 'loading' || status === 'streaming'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        padding: '1.25rem 1.25rem 0.75rem',
      }}>
        {messages.length === 0 && status === 'idle' && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            paddingTop: '3rem',
            paddingBottom: '1rem',
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'var(--surface-2)',
              border: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>
                Ask about this document
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                Get specific answers from the text
              </p>
            </div>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} style={{
            display: 'flex',
            justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
          }}>
            <div style={{
              maxWidth: '82%',
              padding: '0.625rem 0.875rem',
              borderRadius: msg.role === 'user' ? '12px 12px 3px 12px' : '12px 12px 12px 3px',
              background: msg.role === 'user' ? 'var(--accent)' : 'var(--surface-2)',
              border: msg.role === 'user' ? 'none' : '1px solid var(--border)',
              color: 'var(--text-primary)',
              fontSize: '0.875rem',
              lineHeight: 1.65,
              whiteSpace: 'pre-wrap',
            }}>
              {msg.content}
            </div>
          </div>
        ))}
        {/* Live streaming assistant message */}
        {isBusy && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{
              maxWidth: '82%',
              padding: '0.625rem 0.875rem',
              borderRadius: '12px 12px 12px 3px',
              background: 'var(--surface-2)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
              fontSize: '0.875rem',
              lineHeight: 1.65,
              whiteSpace: 'pre-wrap',
            }}>
              {status === 'loading' ? (
                <div style={{ display: 'flex', gap: '5px', alignItems: 'center', padding: '2px 0' }}>
                  <span className="loading-dot" />
                  <span className="loading-dot" />
                  <span className="loading-dot" />
                </div>
              ) : (
                <>
                  {content}
                  <span className="streaming-cursor" />
                </>
              )}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input row */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        borderTop: '1px solid var(--border)',
        padding: '0.875rem 1.25rem',
        background: 'var(--surface)',
        flexShrink: 0,
      }}>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSubmit()}
          placeholder="Ask a question..."
          disabled={isBusy}
          style={{
            flex: 1,
            background: 'var(--surface-2)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            padding: '0.625rem 0.875rem',
            color: 'var(--text-primary)',
            fontSize: '0.875rem',
            outline: 'none',
            transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
          }}
          onFocus={e => {
            e.currentTarget.style.borderColor = 'var(--accent)'
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.12)'
          }}
          onBlur={e => {
            e.currentTarget.style.borderColor = 'var(--border)'
            e.currentTarget.style.boxShadow = 'none'
          }}
        />
        <button
          onClick={handleSubmit}
          disabled={!input.trim() || isBusy}
          style={{
            background: !input.trim() || isBusy ? 'var(--surface-2)' : 'var(--accent)',
            color: !input.trim() || isBusy ? 'var(--text-muted)' : '#fff',
            border: '1px solid',
            borderColor: !input.trim() || isBusy ? 'var(--border)' : 'var(--accent)',
            borderRadius: '8px',
            padding: '0.625rem 0.875rem',
            fontSize: '0.875rem',
            fontWeight: 500,
            cursor: !input.trim() || isBusy ? 'not-allowed' : 'pointer',
            transition: 'background 0.15s ease, color 0.15s ease, border-color 0.15s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            flexShrink: 0,
          }}
          onMouseEnter={e => {
            if (input.trim() && !isBusy) {
              e.currentTarget.style.background = 'var(--accent-hover)'
              e.currentTarget.style.borderColor = 'var(--accent-hover)'
            }
          }}
          onMouseLeave={e => {
            if (input.trim() && !isBusy) {
              e.currentTarget.style.background = 'var(--accent)'
              e.currentTarget.style.borderColor = 'var(--accent)'
            }
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
          Send
        </button>
      </div>
    </div>
  )
}
