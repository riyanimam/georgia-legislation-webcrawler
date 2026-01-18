import { motion } from 'framer-motion'
import type { Bill } from '../types'
import type { Translation } from '../i18n/translations'
import { useMemo } from 'react'
import { FileText, GitBranch, Vote, CheckCircle, XCircle, Clock } from 'lucide-react'

interface TimelineVisualizationProps {
  bills: Bill[]
  darkMode: boolean
  t: Translation
}

// Map status keywords to stage categories
function categorizeStatus(status: string): string {
  const statusLower = status.toLowerCase()
  
  if (statusLower.includes('introduc') || statusLower.includes('read first') || statusLower.includes('filed')) {
    return 'introduced'
  }
  if (statusLower.includes('committee') || statusLower.includes('referred') || statusLower.includes('assigned')) {
    return 'committee'
  }
  if (statusLower.includes('vote') || statusLower.includes('passed') || statusLower.includes('adopt') || statusLower.includes('floor')) {
    return 'vote'
  }
  if (statusLower.includes('sign') || statusLower.includes('approved') || statusLower.includes('enacted') || statusLower.includes('became law')) {
    return 'signed'
  }
  if (statusLower.includes('veto') || statusLower.includes('reject') || statusLower.includes('failed') || statusLower.includes('defeated')) {
    return 'rejected'
  }
  
  return 'in-progress'
}

export function TimelineVisualization({ bills, darkMode }: TimelineVisualizationProps) {
  const statusCategories = useMemo(() => {
    const categories = {
      introduced: [] as Bill[],
      committee: [] as Bill[],
      vote: [] as Bill[],
      signed: [] as Bill[],
      rejected: [] as Bill[],
      'in-progress': [] as Bill[],
    }

    bills.forEach(bill => {
      if (!bill.status_history || bill.status_history.length === 0) {
        categories['in-progress'].push(bill)
        return
      }

      const latestStatus = bill.status_history[bill.status_history.length - 1].status
      const category = categorizeStatus(latestStatus)
      categories[category as keyof typeof categories].push(bill)
    })

    return categories
  }, [bills])

  const stages = [
    { 
      key: 'introduced', 
      label: 'Introduced', 
      icon: FileText, 
      color: darkMode ? '#60a5fa' : '#3b82f6',
      description: 'Bills filed and given first reading'
    },
    { 
      key: 'committee', 
      label: 'In Committee', 
      icon: GitBranch, 
      color: darkMode ? '#a78bfa' : '#8b5cf6',
      description: 'Under review by legislative committees'
    },
    { 
      key: 'vote', 
      label: 'Up for Vote', 
      icon: Vote, 
      color: darkMode ? '#fbbf24' : '#f59e0b',
      description: 'On the floor, passed house, or awaiting final vote'
    },
    { 
      key: 'signed', 
      label: 'Signed into Law', 
      icon: CheckCircle, 
      color: darkMode ? '#34d399' : '#10b981',
      description: 'Approved by the governor, enacted'
    },
    { 
      key: 'rejected', 
      label: 'Rejected/Failed', 
      icon: XCircle, 
      color: darkMode ? '#f87171' : '#ef4444',
      description: 'Vetoed, defeated, or failed to pass'
    },
    { 
      key: 'in-progress', 
      label: 'In Progress', 
      icon: Clock, 
      color: darkMode ? '#9ca3af' : '#6b7280',
      description: 'Other statuses or awaiting updates'
    },
  ]

  const totalBills = bills.length
  const maxCount = Math.max(...Object.values(statusCategories).map(arr => arr.length))

  return (
    <div style={{
      background: darkMode ? 'rgba(36, 36, 36, 0.8)' : 'rgba(255, 255, 255, 0.9)',
      borderRadius: '16px',
      padding: '32px',
      backdropFilter: 'blur(10px)',
      border: '1px solid var(--border-color)',
    }}>
      <h2 style={{ 
        marginBottom: '8px', 
        color: 'var(--text-primary)',
        fontSize: '1.8em',
        fontWeight: 700
      }}>
        Bill Progression Timeline
      </h2>
      <p style={{ 
        color: 'var(--text-secondary)', 
        marginBottom: '32px',
        lineHeight: 1.6
      }}>
        Visualize where bills are in the legislative process. Track progress from introduction to final approval.
      </p>

      {/* Timeline Stages */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
      }}>
        {stages.map((stage, index) => {
          const Icon = stage.icon
          const count = statusCategories[stage.key as keyof typeof statusCategories].length
          const percentage = totalBills > 0 ? (count / totalBills) * 100 : 0
          const barWidth = maxCount > 0 ? (count / maxCount) * 100 : 0

          return (
            <motion.div
              key={stage.key}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              style={{
                position: 'relative',
              }}
            >
              {/* Stage Header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '12px',
                gap: '12px',
              }}>
                <div style={{
                  background: stage.color,
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <Icon size={20} color="#ffffff" />
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{
                    fontSize: '1.1em',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    marginBottom: '4px',
                  }}>
                    {stage.label}
                  </h3>
                  <p style={{
                    fontSize: '0.85em',
                    color: 'var(--text-tertiary)',
                  }}>
                    {stage.description}
                  </p>
                </div>
                <div style={{
                  textAlign: 'right',
                  minWidth: '80px',
                }}>
                  <div style={{
                    fontSize: '1.5em',
                    fontWeight: 700,
                    color: stage.color,
                  }}>
                    {count}
                  </div>
                  <div style={{
                    fontSize: '0.85em',
                    color: 'var(--text-tertiary)',
                  }}>
                    {percentage.toFixed(1)}%
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div style={{
                background: darkMode ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.05)',
                borderRadius: '8px',
                height: '12px',
                overflow: 'hidden',
                position: 'relative',
              }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${barWidth}%` }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  style={{
                    background: `linear-gradient(90deg, ${stage.color}, ${stage.color}dd)`,
                    height: '100%',
                    borderRadius: '8px',
                  }}
                />
              </div>

              {/* Connector Line */}
              {index < stages.length - 1 && (
                <div style={{
                  position: 'absolute',
                  left: '20px',
                  top: '52px',
                  width: '2px',
                  height: '32px',
                  background: darkMode 
                    ? 'linear-gradient(180deg, rgba(156, 163, 175, 0.3), rgba(156, 163, 175, 0.1))'
                    : 'linear-gradient(180deg, rgba(156, 163, 175, 0.2), rgba(156, 163, 175, 0.05))',
                }}/>
              )}
            </motion.div>
          )
        })}
      </div>

      {/* Summary Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        style={{
          marginTop: '32px',
          padding: '20px',
          background: darkMode 
            ? 'linear-gradient(135deg, rgba(249, 115, 22, 0.1), rgba(251, 146, 60, 0.05))'
            : 'linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.05))',
          borderRadius: '12px',
          border: darkMode 
            ? '1px solid rgba(249, 115, 22, 0.2)'
            : '1px solid rgba(102, 126, 234, 0.2)',
        }}
      >
        <h3 style={{
          fontSize: '1em',
          fontWeight: 600,
          color: 'var(--text-primary)',
          marginBottom: '12px',
        }}>
          Quick Insights
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
        }}>
          <div>
            <div style={{ fontSize: '0.85em', color: 'var(--text-tertiary)', marginBottom: '4px' }}>
              Total Bills
            </div>
            <div style={{ fontSize: '1.3em', fontWeight: 700, color: 'var(--accent-primary)' }}>
              {totalBills}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.85em', color: 'var(--text-tertiary)', marginBottom: '4px' }}>
              Success Rate
            </div>
            <div style={{ fontSize: '1.3em', fontWeight: 700, color: '#10b981' }}>
              {totalBills > 0 
                ? ((statusCategories.signed.length / totalBills) * 100).toFixed(1)
                : 0}%
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.85em', color: 'var(--text-tertiary)', marginBottom: '4px' }}>
              Active in Process
            </div>
            <div style={{ fontSize: '1.3em', fontWeight: 700, color: '#f59e0b' }}>
              {statusCategories.committee.length + statusCategories.vote.length + statusCategories['in-progress'].length}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
