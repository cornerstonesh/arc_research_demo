'use client'
import { useState } from 'react'
import SummaryTab from '@/components/SummaryTab'
import KeyPointsTab from '@/components/KeyPointsTab'
import QATab from '@/components/QATab'

type TabId = 'summary' | 'keypoints' | 'qa'

const TABS: { id: TabId; label: string }[] = [
  { id: 'summary',   label: 'Summary'    },
  { id: 'keypoints', label: 'Key Points' },
  { id: 'qa',        label: 'Q&A'        },
]

interface AnalysisPanelProps {
  text: string
  docKey: string
}

export default function AnalysisPanel({ text, docKey }: AnalysisPanelProps) {
  const [activeTab, setActiveTab] = useState<TabId>('summary')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--surface)' }}>
      {/* Tab bar */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid var(--border)',
        padding: '0 1rem',
        flexShrink: 0,
      }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              background: 'none',
              border: 'none',
              borderBottom: activeTab === tab.id ? '2px solid var(--accent)' : '2px solid transparent',
              color: activeTab === tab.id ? 'var(--text-primary)' : 'var(--text-secondary)',
              padding: '0.75rem 1rem',
              fontSize: '0.875rem',
              fontWeight: activeTab === tab.id ? 600 : 400,
              cursor: 'pointer',
              transition: 'color 0.15s, border-color 0.15s',
            }}
          >
            {tab.label}
          </button>
        ))}
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
