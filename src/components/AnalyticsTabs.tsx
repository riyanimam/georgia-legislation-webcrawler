import { motion } from 'framer-motion'
import { BarChart3, TrendingUp, Cloud, Grid3X3 } from 'lucide-react'
import { useState } from 'react'
import type { Bill } from '../types'
import type { Translation } from '../i18n/translations'
import { TimelineVisualization } from './TimelineVisualization.tsx'
import { ChartsView } from './ChartsView.tsx'
import { WordCloudView } from './WordCloudView.tsx'

interface AnalyticsTabsProps {
  bills: Bill[]
  darkMode: boolean
  t: Translation
  onFilterByWord?: (word: string) => void
}

type TabType = 'overview' | 'timeline' | 'charts' | 'wordcloud'

export default function AnalyticsTabs({ bills, darkMode, t, onFilterByWord }: AnalyticsTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview')

  const tabs = [
    { id: 'overview' as const, label: 'Overview', icon: Grid3X3 },
    { id: 'timeline' as const, label: 'Timeline', icon: TrendingUp },
    { id: 'charts' as const, label: 'Charts', icon: BarChart3 },
    { id: 'wordcloud' as const, label: 'Word Cloud', icon: Cloud },
  ]

  return (
    <div style={{
      marginTop: '32px',
      marginBottom: '32px',
    }}>
      {/* Tab Navigation */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '24px',
        overflowX: 'auto',
        padding: '4px',
        background: darkMode ? 'rgba(36, 36, 36, 0.6)' : 'rgba(255, 255, 255, 0.6)',
        borderRadius: '12px',
        backdropFilter: 'blur(10px)',
      }}>
        {tabs.map(tab => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          
          return (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 20px',
                border: 'none',
                borderRadius: '8px',
                background: isActive
                  ? darkMode 
                    ? 'linear-gradient(135deg, #f97316, #fb923c)'
                    : 'linear-gradient(135deg, #667eea, #764ba2)'
                  : 'transparent',
                color: isActive 
                  ? '#ffffff'
                  : 'var(--text-secondary)',
                fontWeight: isActive ? 600 : 500,
                fontSize: '0.95em',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap',
              }}
            >
              <Icon size={18} />
              {tab.label}
            </motion.button>
          )
        })}
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === 'overview' && (
          <div style={{
            background: darkMode ? 'rgba(36, 36, 36, 0.8)' : 'rgba(255, 255, 255, 0.9)',
            borderRadius: '16px',
            padding: '32px',
            backdropFilter: 'blur(10px)',
            border: '1px solid var(--border-color)',
          }}>
            <h2 style={{ 
              marginBottom: '16px', 
              color: 'var(--text-primary)',
              fontSize: '1.5em',
              fontWeight: 700
            }}>
              Legislative Analytics
            </h2>
            <p style={{ 
              color: 'var(--text-secondary)', 
              lineHeight: 1.6,
              marginBottom: '24px'
            }}>
              Explore comprehensive visualizations and insights about Georgia legislation. 
              Use the tabs above to view timelines, interactive charts, and trending topics.
            </p>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '16px',
              marginTop: '24px'
            }}>
              {tabs.slice(1).map(tab => {
                const Icon = tab.icon
                return (
                  <motion.div
                    key={tab.id}
                    whileHover={{ scale: 1.05 }}
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      background: darkMode 
                        ? 'linear-gradient(135deg, rgba(249, 115, 22, 0.1), rgba(251, 146, 60, 0.1))'
                        : 'linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1))',
                      padding: '20px',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      border: darkMode 
                        ? '1px solid rgba(249, 115, 22, 0.2)'
                        : '1px solid rgba(102, 126, 234, 0.2)',
                    }}
                  >
                    <Icon size={24} style={{ marginBottom: '12px', color: 'var(--accent-primary)' }} />
                    <h3 style={{ 
                      fontSize: '1.1em', 
                      fontWeight: 600, 
                      marginBottom: '8px',
                      color: 'var(--text-primary)'
                    }}>
                      {tab.label}
                    </h3>
                    <p style={{ fontSize: '0.9em', color: 'var(--text-secondary)' }}>
                      {tab.id === 'timeline' && 'Visualize bill progression through legislative stages'}
                      {tab.id === 'charts' && 'Interactive charts showing bills by status, sponsors, and trends'}
                      {tab.id === 'wordcloud' && 'Discover trending topics and keywords across all bills'}
                    </p>
                  </motion.div>
                )
              })}
            </div>
          </div>
        )}

        {activeTab === 'timeline' && (
          <TimelineVisualization bills={bills} darkMode={darkMode} t={t} />
        )}

        {activeTab === 'charts' && (
          <ChartsView bills={bills} darkMode={darkMode} t={t} />
        )}

        {activeTab === 'wordcloud' && (
          <WordCloudView bills={bills} darkMode={darkMode} t={t} onFilterByWord={onFilterByWord} />
        )}
      </motion.div>
    </div>
  )
}
