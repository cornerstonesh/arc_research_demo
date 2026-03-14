import { NextRequest, NextResponse } from 'next/server'
import { truncateDoc } from '@/lib/arc'

const MAX_BYTES = 20 * 1024 * 1024 // 20MB
const FETCH_TIMEOUT_MS = 10_000

async function extractPdfText(buffer: Buffer): Promise<string> {
  try {
    // pdfjs-dist references DOMMatrix (a browser API) during module init.
    // It's not available in Node.js serverless — stub it out before importing.
    if (typeof (globalThis as Record<string, unknown>).DOMMatrix === 'undefined') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(globalThis as any).DOMMatrix = class {}
    }
    const { PDFParse } = await import('pdf-parse')
    const parser = new PDFParse({ data: buffer })
    const result = await parser.getText()
    return result.text
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    throw new Error(`PDF parse failed: ${msg}`)
  }
}

async function fetchPdfFromUrl(url: string): Promise<Buffer> {
  if (!url.startsWith('https://')) {
    throw new Error('URL must start with https://')
  }

  const controller = new AbortController()
  // Timeout applies to both connect and body read — abort() fires on the whole fetch
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

  try {
    const res = await fetch(url, { signal: controller.signal })
    if (!res.ok) {
      throw new Error(`Failed to fetch PDF: ${res.status}`)
    }

    const contentLength = res.headers.get('content-length')
    if (contentLength && parseInt(contentLength, 10) > MAX_BYTES) {
      throw new Error('PDF exceeds 20MB size limit')
    }

    const arrayBuffer = await res.arrayBuffer()
    if (arrayBuffer.byteLength > MAX_BYTES) {
      throw new Error('PDF exceeds 20MB size limit')
    }

    return Buffer.from(arrayBuffer)
  } finally {
    clearTimeout(timer)
  }
}

export async function POST(request: NextRequest) {
  try {
    let buffer: Buffer
    let pdfSource: { type: 'url' | 'base64'; value: string }

    const contentType = request.headers.get('content-type') ?? ''

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()
      const file = formData.get('file') as File | null
      if (!file) {
        return NextResponse.json({ error: 'No file provided' }, { status: 400 })
      }
      if (file.size > MAX_BYTES) {
        return NextResponse.json({ error: 'File exceeds 20MB limit' }, { status: 413 })
      }

      const arrayBuffer = await file.arrayBuffer()
      buffer = Buffer.from(arrayBuffer)
      pdfSource = { type: 'base64', value: buffer.toString('base64') }
    } else {
      const body = await request.json()
      const { url } = body as { url?: string }
      if (!url) {
        return NextResponse.json({ error: 'No URL provided' }, { status: 400 })
      }

      buffer = await fetchPdfFromUrl(url)
      pdfSource = { type: 'url', value: url }
    }

    const rawText = await extractPdfText(buffer)
    const text = truncateDoc(rawText)

    if (!text.trim()) {
      return NextResponse.json(
        { error: 'Could not extract text from PDF. The file may be scanned or image-only.' },
        { status: 422 },
      )
    }

    // Return text + pdfSource only — classification is done separately by /api/classify
    return NextResponse.json({ text, pdfSource })
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      return NextResponse.json({ error: 'PDF fetch timed out (10s limit)' }, { status: 504 })
    }
    const message = err instanceof Error ? err.message : 'Upload failed'
    const status = message.includes('20MB') ? 413 : 500
    return NextResponse.json({ error: message }, { status })
  }
}
