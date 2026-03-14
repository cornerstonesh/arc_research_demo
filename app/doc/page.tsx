'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import DocumentPanel from '@/components/DocumentPanel'
import AnalysisPanel from '@/components/AnalysisPanel'
import ClassificationBadge from '@/components/ClassificationBadge'

interface PdfSource {
  type: 'url' | 'base64'
  value: string
}

interface DocData {
  text: string
  pdfSource: PdfSource
}

export default function DocPage() {
  const router = useRouter()
  const [docData, setDocData] = useState<DocData | null>(null)
  const [category, setCategory] = useState<string | null>(null)

  useEffect(() => {
    const raw = sessionStorage.getItem('arc_doc')
    if (!raw) {
      router.replace('/')
      return
    }
    try {
      const parsed = JSON.parse(raw) as DocData
      setDocData(parsed)
      // Classify after mounting
      fetch('/api/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: parsed.text }),
      })
        .then(r => r.json())
        .then(j => setCategory(j.category ?? null))
        .catch(() => setCategory('Research'))
    } catch {
      router.replace('/')
    }
  }, [router])

  if (!docData) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg)',
        flexDirection: 'column',
        gap: '1rem',
      }}>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <span className="loading-dot" />
          <span className="loading-dot" />
          <span className="loading-dot" />
        </div>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', letterSpacing: '0.02em' }}>
          Loading document
        </span>
      </div>
    )
  }

  // docKey for tab remounting — combine length + start + end for collision resistance
  const docKey = `${docData.text.length}-${docData.text.slice(0, 100)}-${docData.text.slice(-50)}`

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      background: 'var(--bg)',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.625rem 1.25rem',
        borderBottom: '1px solid var(--border)',
        background: 'var(--surface)',
        flexShrink: 0,
        gap: '1rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Logo mark */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '26px',
            height: '26px',
            borderRadius: '6px',
            background: 'linear-gradient(135deg, var(--accent) 0%, rgba(99,102,241,0.5) 100%)',
            flexShrink: 0,
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          </div>
          <span style={{
            fontSize: '0.8125rem',
            fontWeight: 600,
            letterSpacing: '0.01em',
            color: 'var(--text-primary)',
          }}>
            Document Research
          </span>
          <div style={{
            width: '1px',
            height: '14px',
            background: 'var(--border)',
            flexShrink: 0,
          }} />
          <ClassificationBadge category={category} />
        </div>
        <button
          onClick={() => {
            sessionStorage.removeItem('arc_doc')
            router.push('/')
          }}
          style={{
            background: 'transparent',
            border: '1px solid var(--border)',
            borderRadius: '6px',
            color: 'var(--text-secondary)',
            padding: '0.375rem 0.75rem',
            fontSize: '0.8125rem',
            fontWeight: 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'border-color 0.15s ease, color 0.15s ease',
            flexShrink: 0,
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'var(--text-muted)'
            e.currentTarget.style.color = 'var(--text-primary)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'var(--border)'
            e.currentTarget.style.color = 'var(--text-secondary)'
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Document
        </button>
      </header>

      {/* Two-panel layout */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left: Document */}
        <div style={{
          width: '45%',
          borderRight: '1px solid var(--border)',
          overflowY: 'auto',
          background: 'var(--surface)',
        }}>
          <DocumentPanel pdfSource={docData.pdfSource} text={docData.text} />
        </div>

        {/* Right: Analysis */}
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <AnalysisPanel text={docData.text} docKey={docKey} />
        </div>
      </div>
    </div>
  )
}
