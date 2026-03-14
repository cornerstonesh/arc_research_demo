'use client'
import { useState } from 'react'
import SummaryTab from '@/components/SummaryTab'
import KeyPointsTab from '@/components/KeyPointsTab'
import QATab from '@/components/QATab'

type TabId = 'summary' | 'keypoints' | 'qa'

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  {
    id: 'summary',
    label: 'Summary',
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="21" y1="10" x2="7" y2="10" />
        <line x1="21" y1="6" x2="3" y2="6" />
        <line x1="21" y1="14" x2="3" y2="14" />
        <line x1="21" y1="18" x2="7" y2="18" />
      </svg>
    ),
  },
  {
    id: 'keypoints',
    label: 'Key Points',
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
  },
  {
    id: 'qa',
    label: 'Q&A',
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
]

interface AnalysisPanelProps {
  text: string
  docKey: string
}

export default function AnalysisPanel({ text, docKey }: AnalysisPanelProps) {
  const [activeTab, setActiveTab] = useState<TabId>('summary')
  const [hoveredTab, setHoveredTab] = useState<TabId | null>(null)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--surface)' }}>
      {/* Tab bar */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid var(--border)',
        padding: '0 0.75rem',
        flexShrink: 0,
        gap: '2px',
      }}>
        {TABS.map(tab => {
          const isActive = activeTab === tab.id
          const isHovered = hoveredTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              onMouseEnter={() => setHoveredTab(tab.id)}
              onMouseLeave={() => setHoveredTab(null)}
              style={{
                background: isHovered && !isActive ? 'var(--surface-2)' : 'none',
                border: 'none',
                borderBottom: isActive ? '2px solid var(--accent)' : '2px solid transparent',
                color: isActive ? 'var(--text-primary)' : isHovered ? 'var(--text-primary)' : 'var(--text-secondary)',
                padding: '0.625rem 0.875rem',
                fontSize: '0.8125rem',
                fontWeight: isActive ? 600 : 400,
                cursor: 'pointer',
                transition: 'color 0.12s ease, background 0.12s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                borderRadius: '4px 4px 0 0',
                letterSpacing: '0.01em',
              }}
            >
              <span style={{
                opacity: isActive ? 1 : 0.6,
                transition: 'opacity 0.12s ease',
              }}>
                {tab.icon}
              </span>
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab content — all mounted, only active visible */}
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        <div style={{ display: activeTab === 'summary' ? 'block' : 'none', height: '100%', overflowY: 'auto' }}>
          <SummaryTab key={`summary-${docKey}`} text={text} active={activeTab === 'summary'} />
        </div>
        <div style={{ display: activeTab === 'keypoints' ? 'block' : 'none', height: '100%', overflowY: 'auto' }}>
          <KeyPointsTab key={`keypoints-${docKey}`} text={text} active={activeTab === 'keypoints'} />
        </div>
        <div style={{ display: activeTab === 'qa' ? 'block' : 'none', height: '100%', overflowY: 'auto' }}>
          <QATab key={`qa-${docKey}`} text={text} />
        </div>
      </div>
    </div>
  )
}
