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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '1rem' }}>
      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        paddingBottom: '1rem',
      }}>
        {messages.length === 0 && status === 'idle' && (
          <div style={{
            color: 'var(--text-muted)',
            fontSize: '0.875rem',
            textAlign: 'center',
            paddingTop: '2rem',
          }}>
            Ask a question about the document
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} style={{
            display: 'flex',
            justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
          }}>
            <div style={{
              maxWidth: '80%',
              padding: '0.625rem 0.875rem',
              borderRadius: '12px',
              background: msg.role === 'user' ? 'var(--accent)' : 'var(--surface-2)',
              color: 'var(--text-primary)',
              fontSize: '0.9rem',
              lineHeight: 1.6,
              whiteSpace: 'pre-wrap',
            }}>
              {msg.content}
            </div>
          </div>
        ))}
        {/* Live streaming assistant message */}
        {(status === 'loading' || status === 'streaming') && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{
              maxWidth: '80%',
              padding: '0.625rem 0.875rem',
              borderRadius: '12px',
              background: 'var(--surface-2)',
              color: 'var(--text-primary)',
              fontSize: '0.9rem',
              lineHeight: 1.6,
              whiteSpace: 'pre-wrap',
            }}>
              {status === 'loading' ? (
                <span style={{ color: 'var(--text-muted)' }}>...</span>
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
        paddingTop: '0.75rem',
      }}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSubmit()}
          placeholder="Ask a question..."
          disabled={status === 'loading' || status === 'streaming'}
          style={{
            flex: 1,
            background: 'var(--surface-2)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            padding: '0.625rem 0.875rem',
            color: 'var(--text-primary)',
            fontSize: '0.875rem',
            outline: 'none',
          }}
        />
        <button
          onClick={handleSubmit}
          disabled={!input.trim() || status === 'loading' || status === 'streaming'}
          style={{
            background: 'var(--accent)',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            padding: '0.625rem 1rem',
            fontSize: '0.875rem',
            cursor: 'pointer',
            opacity: (!input.trim() || status === 'loading' || status === 'streaming') ? 0.5 : 1,
          }}
        >
          Send
        </button>
      </div>
    </div>
  )
}
