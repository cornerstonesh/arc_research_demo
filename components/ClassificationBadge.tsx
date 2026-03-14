'use client'

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  Legal:     { bg: 'rgba(239, 68, 68, 0.12)',  text: '#ef4444' },
  Medical:   { bg: 'rgba(34, 197, 94, 0.12)',  text: '#22c55e' },
  Finance:   { bg: 'rgba(234, 179, 8, 0.12)',  text: '#eab308' },
  Technical: { bg: 'rgba(99, 102, 241, 0.12)', text: '#6366f1' },
  Research:  { bg: 'rgba(168, 85, 247, 0.12)', text: '#a855f7' },
}
const DEFAULT_COLORS = { bg: 'rgba(136, 136, 136, 0.12)', text: '#888888' }

interface ClassificationBadgeProps {
  category: string | null
}

export default function ClassificationBadge({ category }: ClassificationBadgeProps) {
  const pillStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '3px 10px',
    borderRadius: '999px',
    fontSize: '0.75rem',
    fontWeight: 500,
  }

  if (category === null) {
    return (
      <span style={{
        ...pillStyle,
        background: 'var(--surface-2)',
        color: 'var(--text-muted)',
      }}>
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          style={{ animation: 'spin 0.8s linear infinite', flexShrink: 0 }}
        >
          <circle
            cx="6"
            cy="6"
            r="4.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeDasharray="14 7"
            strokeLinecap="round"
          />
        </svg>
        Classifying...
      </span>
    )
  }

  const colors = CATEGORY_COLORS[category] ?? DEFAULT_COLORS

  return (
    <span style={{
      ...pillStyle,
      background: colors.bg,
      color: colors.text,
    }}>
      <span style={{
        width: '6px',
        height: '6px',
        borderRadius: '50%',
        background: colors.text,
        flexShrink: 0,
      }} />
      {category}
    </span>
  )
}
