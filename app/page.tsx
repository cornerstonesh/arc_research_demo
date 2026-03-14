'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import UploadZone from '@/components/UploadZone'

export default function HomePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleUpload(file: File) {
    setError(null)
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Upload failed')
      sessionStorage.setItem('arc_doc', JSON.stringify({ text: json.text, pdfSource: json.pdfSource }))
      router.push('/doc')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setLoading(false)
    }
  }

  async function handleUrl(url: string) {
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Upload failed')
      sessionStorage.setItem('arc_doc', JSON.stringify({ text: json.text, pdfSource: json.pdfSource }))
      router.push('/doc')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg)',
      padding: '2rem',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Subtle radial glow behind content */}
      <div style={{
        position: 'absolute',
        top: '30%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '600px',
        height: '400px',
        background: 'radial-gradient(ellipse at center, rgba(99, 102, 241, 0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ width: '100%', maxWidth: '480px', position: 'relative' }}>
        {/* Wordmark */}
        <div className="animate-enter" style={{ textAlign: 'center', marginBottom: '3rem', animationDelay: '0ms' }}>
          {/* Icon mark */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, var(--accent) 0%, rgba(99,102,241,0.5) 100%)',
            marginBottom: '1.25rem',
            boxShadow: '0 0 24px rgba(99, 102, 241, 0.3)',
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          </div>
          <h1 style={{
            fontSize: '1.625rem',
            fontWeight: 600,
            letterSpacing: '-0.01em',
            color: 'var(--text-primary)',
            margin: 0,
            lineHeight: 1.2,
          }}>
            Document Research
          </h1>
          <p style={{
            color: 'var(--text-muted)',
            fontSize: '0.875rem',
            marginTop: '0.5rem',
            letterSpacing: '0.01em',
            fontWeight: 400,
          }}>
            Upload a PDF to get instant AI-powered analysis
          </p>
        </div>

        <div className="animate-enter" style={{ animationDelay: '80ms' }}>
          <UploadZone onUpload={handleUpload} onUrl={handleUrl} loading={loading} />
        </div>

        {error && (
          <div className="animate-enter" style={{
            marginTop: '1rem',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            background: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <p style={{
              color: '#ef4444',
              fontSize: '0.8125rem',
              margin: 0,
            }}>
              {error}
            </p>
          </div>
        )}
      </div>
    </main>
  )
}
