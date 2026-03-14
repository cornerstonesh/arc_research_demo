'use client'

import { useState, useEffect, useRef } from 'react'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore — react-pdf CSS side-effect imports
import 'react-pdf/dist/Page/AnnotationLayer.css'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore — react-pdf CSS side-effect imports
import 'react-pdf/dist/Page/TextLayer.css'

interface PdfSource {
  type: 'url' | 'base64'
  value: string
}

interface DocumentPanelProps {
  pdfSource: PdfSource
  text: string
}

const SKELETON_WIDTHS = ['85%', '92%', '78%', '88%', '70%', '95%', '82%', '75%']

function SkeletonView() {
  return (
    <div
      style={{
        height: '100%',
        overflowY: 'auto',
        background: 'var(--surface)',
        padding: '28px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
      }}
    >
      {/* Fake page header */}
      <div className="skeleton" style={{ width: '55%', height: '20px', marginBottom: '8px' }} />
      {SKELETON_WIDTHS.map((width, i) => (
        <div
          key={i}
          className="skeleton"
          style={{ width, height: '14px', animationDelay: `${i * 60}ms` }}
        />
      ))}
      {/* Second paragraph group */}
      <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {SKELETON_WIDTHS.map((width, i) => (
          <div
            key={i + SKELETON_WIDTHS.length}
            className="skeleton"
            style={{ width: SKELETON_WIDTHS[(i + 3) % SKELETON_WIDTHS.length], height: '14px', animationDelay: `${(i + SKELETON_WIDTHS.length) * 60}ms` }}
          />
        ))}
      </div>
      {/* Third paragraph group */}
      <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {[80, 65, 90, 72, 85].map((w, i) => (
          <div
            key={`p3-${i}`}
            className="skeleton"
            style={{ width: `${w}%`, height: '14px', animationDelay: `${(i + 16) * 60}ms` }}
          />
        ))}
      </div>
    </div>
  )
}

function TextView({ text }: { text: string }) {
  return (
    <div
      style={{
        height: '100%',
        overflowY: 'auto',
        background: 'var(--surface)',
        padding: '24px 28px',
      }}
    >
      <pre
        style={{
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          fontFamily: 'inherit',
          fontSize: '13.5px',
          lineHeight: '1.8',
          color: 'var(--text-primary)',
          margin: 0,
          letterSpacing: '0.01em',
        }}
      >
        {text}
      </pre>
    </div>
  )
}

export default function DocumentPanel({ pdfSource, text }: DocumentPanelProps) {
  const [pdfLoading, setPdfLoading] = useState(true)
  const [PdfComponents, setPdfComponents] = useState<{
    Document: React.ComponentType<any>
    Page: React.ComponentType<any>
  } | null>(null)
  const [numPages, setNumPages] = useState<number>(0)
  const [pageNumber, setPageNumber] = useState(1)
  const [pdfError, setPdfError] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const [panelWidth, setPanelWidth] = useState(600)

  useEffect(() => {
    import('react-pdf').then(({ Document, Page, pdfjs }) => {
      pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`
      setPdfComponents({ Document, Page })
    }).catch(() => {
      // react-pdf failed to load — will show text fallback
    }).finally(() => {
      setPdfLoading(false)
    })
  }, [])

  // Reset page number when source changes
  useEffect(() => {
    setPageNumber(1)
    setNumPages(0)
    setPdfError(false)
  }, [pdfSource])

  // Measure container width for page rendering
  useEffect(() => {
    if (!containerRef.current) return
    const observer = new ResizeObserver(entries => {
      setPanelWidth(entries[0].contentRect.width)
    })
    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  const file =
    pdfSource.type === 'url'
      ? pdfSource.value
      : `data:application/pdf;base64,${pdfSource.value}`

  if (pdfLoading) {
    return <SkeletonView />
  }

  if (!PdfComponents || pdfError) {
    return <TextView text={text} />
  }

  const { Document, Page } = PdfComponents

  return (
    <div
      ref={containerRef}
      style={{
        height: '100%',
        overflowY: 'auto',
        background: 'var(--surface)',
        borderRight: '1px solid var(--border)',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
      }}
    >
      <Document
        file={file}
        onLoadSuccess={({ numPages }: { numPages: number }) => {
          setNumPages(numPages)
          setPageNumber(1)
        }}
        onLoadError={() => setPdfError(true)}
        loading={null}
        error={null}
      >
        <Page
          pageNumber={pageNumber}
          width={panelWidth - 32}
          loading={null}
          error={null}
          renderAnnotationLayer={true}
          renderTextLayer={true}
        />
      </Document>

      {/* Page navigation — only shown for multi-page PDFs */}
      {numPages > 1 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '8px 16px',
            background: 'var(--surface-2)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            flexShrink: 0,
          }}
        >
          <button
            onClick={() => setPageNumber(p => Math.max(1, p - 1))}
            disabled={pageNumber <= 1}
            style={{
              background: 'none',
              border: 'none',
              color: pageNumber <= 1 ? 'var(--text-muted)' : 'var(--text-primary)',
              cursor: pageNumber <= 1 ? 'not-allowed' : 'pointer',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '13px',
              fontWeight: 500,
              transition: 'color 0.15s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
            aria-label="Previous page"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Prev
          </button>

          <span
            style={{
              fontSize: '13px',
              color: 'var(--text-secondary)',
              minWidth: '80px',
              textAlign: 'center',
            }}
          >
            {pageNumber} / {numPages}
          </span>

          <button
            onClick={() => setPageNumber(p => Math.min(numPages, p + 1))}
            disabled={pageNumber >= numPages}
            style={{
              background: 'none',
              border: 'none',
              color: pageNumber >= numPages ? 'var(--text-muted)' : 'var(--text-primary)',
              cursor: pageNumber >= numPages ? 'not-allowed' : 'pointer',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '13px',
              fontWeight: 500,
              transition: 'color 0.15s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
            aria-label="Next page"
          >
            Next
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}
