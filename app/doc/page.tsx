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
        color: 'var(--text-muted)',
        fontSize: '0.875rem',
      }}>
        Loading...
      </div>
    )
  }

  // docKey for tab remounting — use a hash of text length + first 100 chars
  const docKey = `${docData.text.length}-${docData.text.slice(0, 50)}`

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
        padding: '0.75rem 1.5rem',
        borderBottom: '1px solid var(--border)',
        background: 'var(--surface)',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{
            fontSize: '0.875rem',
            fontWeight: 600,
            letterSpacing: '0.08em',
            color: 'var(--text-primary)',
            textTransform: 'uppercase',
          }}>
            Research
          </span>
          <ClassificationBadge category={category} />
        </div>
        <button
          onClick={() => {
            sessionStorage.removeItem('arc_doc')
            router.push('/')
          }}
          style={{
            background: 'var(--surface-2)',
            border: '1px solid var(--border)',
            borderRadius: '6px',
            color: 'var(--text-secondary)',
            padding: '0.4rem 0.875rem',
            fontSize: '0.8125rem',
            cursor: 'pointer',
          }}
        >
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
