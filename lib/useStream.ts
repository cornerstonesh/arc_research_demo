'use client'
import { useState, useRef, useCallback } from 'react'

type StreamStatus = 'idle' | 'loading' | 'streaming' | 'done' | 'error'

interface UseStreamReturn {
  content: string
  status: StreamStatus
  error: string | null
  start: (url: string, body: Record<string, unknown>) => Promise<void>
  reset: () => void
}

export function useStream(): UseStreamReturn {
  const [content, setContent] = useState('')
  const [status, setStatus] = useState<StreamStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const reset = useCallback(() => {
    abortRef.current?.abort()
    setContent('')
    setStatus('idle')
    setError(null)
  }, [])

  const start = useCallback(async (url: string, body: Record<string, unknown>) => {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setContent('')
    setError(null)
    setStatus('loading')

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal,
      })

      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        throw new Error((json as { error?: string }).error ?? `Request failed: ${res.status}`)
      }

      setStatus('streaming')

      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let finished = false

      while (!finished) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6).trim()
          if (data === '[DONE]') {
            finished = true
            break
          }
          try {
            const parsed = JSON.parse(data)
            const token = parsed.choices?.[0]?.delta?.content
            if (typeof token === 'string') {
              setContent(prev => prev + token)
            }
          } catch {
            // skip malformed lines
          }
        }
      }

      setStatus('done')
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return
      setError(err instanceof Error ? err.message : 'Stream failed')
      setStatus('error')
    }
  }, [])

  return { content, status, error, start, reset }
}
