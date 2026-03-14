'use client'
import { useEffect } from 'react'
import { useStream } from '@/lib/useStream'

interface KeyPointsTabProps {
  text: string
  active: boolean
}

function KeyPointsSkeleton() {
  return (
    <div style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
        <div style={{ display: 'flex', gap: '5px' }}>
          <span className="loading-dot" />
          <span className="loading-dot" />
          <span className="loading-dot" />
        </div>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>Extracting key points...</span>
      </div>
      {[78, 90, 65, 85, 72, 88, 60].map((w, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="skeleton" style={{ width: '6px', height: '6px', borderRadius: '50%', flexShrink: 0, animationDelay: `${i * 60}ms` }} />
          <div className="skeleton" style={{ width: `${w}%`, height: '14px', animationDelay: `${i * 60}ms` }} />
        </div>
      ))}
    </div>
  )
}

export default function KeyPointsTab({ text, active }: KeyPointsTabProps) {
  const { content, status, error, start } = useStream()

  useEffect(() => {
    if (active && status === 'idle') {
      start('/api/analyze', { text, type: 'keypoints' })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active])

  return (
    <div style={{ minHeight: '200px' }}>
      {status === 'loading' && <KeyPointsSkeleton />}
      {(status === 'streaming' || status === 'done') && (
        <div style={{
          padding: '1.75rem',
          color: 'var(--text-primary)',
          lineHeight: 1.75,
          fontSize: '0.9375rem',
          whiteSpace: 'pre-wrap',
          letterSpacing: '0.01em',
        }}>
          {content}
          {status === 'streaming' && <span className="streaming-cursor" />}
        </div>
      )}
      {status === 'error' && (
        <div style={{
          padding: '1.75rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span style={{ color: '#ef4444', fontSize: '0.875rem' }}>
            {error}
          </span>
        </div>
      )}
    </div>
  )
}
