'use client'
import { useEffect } from 'react'
import { useStream } from '@/lib/useStream'

interface SummaryTabProps {
  text: string
  active: boolean
}

export default function SummaryTab({ text, active }: SummaryTabProps) {
  const { content, status, error, start } = useStream()

  useEffect(() => {
    if (active && status === 'idle') {
      start('/api/analyze', { text, type: 'summarize' })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active])

  return (
    <div style={{ padding: '1.5rem', minHeight: '200px' }}>
      {status === 'loading' && (
        <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          Analyzing document...
        </div>
      )}
      {(status === 'streaming' || status === 'done') && (
        <div style={{
          color: 'var(--text-primary)',
          lineHeight: 1.7,
          fontSize: '0.9375rem',
          whiteSpace: 'pre-wrap',
        }}>
          {content}
          {status === 'streaming' && <span className="streaming-cursor" />}
        </div>
      )}
      {status === 'error' && (
        <div style={{ color: '#ef4444', fontSize: '0.875rem' }}>
          Error: {error}
        </div>
      )}
    </div>
  )
}
