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
    }}>
      <div style={{ width: '100%', maxWidth: '480px' }}>
        {/* Wordmark */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: 700,
            letterSpacing: '0.15em',
            color: 'var(--text-primary)',
            margin: 0,
            textTransform: 'uppercase',
          }}>
            RESEARCH
          </h1>
          <p style={{
            color: 'var(--text-muted)',
            fontSize: '0.875rem',
            marginTop: '0.5rem',
            letterSpacing: '0.05em',
          }}>
            Arc Demo
          </p>
        </div>

        <UploadZone onUpload={handleUpload} onUrl={handleUrl} loading={loading} />

        {error && (
          <p style={{
            color: '#ef4444',
            fontSize: '0.85rem',
            marginTop: '0.75rem',
            textAlign: 'center',
          }}>
            ⚠ {error}
          </p>
        )}
      </div>
    </main>
  )
}
