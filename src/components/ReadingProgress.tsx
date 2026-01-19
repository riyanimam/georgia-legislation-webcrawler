import { motion } from 'framer-motion'
import { Eye, EyeOff } from 'lucide-react'

interface ReadingProgressBadgeProps {
  isRead: boolean
  compact?: boolean
}

export function ReadingProgressBadge({ isRead, compact = false }: ReadingProgressBadgeProps) {
  if (compact) {
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          background: isRead ? 'rgba(34, 197, 94, 0.2)' : 'rgba(59, 130, 246, 0.2)',
          border: isRead ? '1px solid rgba(34, 197, 94, 0.5)' : '1px solid rgba(59, 130, 246, 0.5)',
        }}
        title={isRead ? 'Read' : 'Unread'}
      >
        {isRead ? (
          <Eye size={12} style={{ color: '#22c55e' }} />
        ) : (
          <EyeOff size={12} style={{ color: '#3b82f6' }} />
        )}
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '4px 10px',
        borderRadius: '12px',
        fontSize: '0.8em',
        fontWeight: 500,
        background: isRead ? 'rgba(34, 197, 94, 0.15)' : 'rgba(59, 130, 246, 0.15)',
        border: isRead ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(59, 130, 246, 0.3)',
        color: isRead ? '#22c55e' : '#3b82f6',
      }}
    >
      {isRead ? <Eye size={14} /> : <EyeOff size={14} />}
      <span>{isRead ? 'Read' : 'New'}</span>
    </motion.div>
  )
}

interface ReadingProgressStatsProps {
  totalBills: number
  readBills: number
  darkMode: boolean
}

export function ReadingProgressStats({ totalBills, readBills, darkMode }: ReadingProgressStatsProps) {
  const percentage = totalBills > 0 ? Math.round((readBills / totalBills) * 100) : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: darkMode
          ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(34, 197, 94, 0.1))'
          : 'rgba(255, 255, 255, 0.8)',
        border: darkMode ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(0, 0, 0, 0.1)',
        borderRadius: '12px',
        padding: '16px 20px',
        marginBottom: '16px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '0.9em', color: 'var(--text-secondary)', fontWeight: 500 }}>
            📖 Reading Progress
          </h3>
          <p style={{ margin: '4px 0 0', fontSize: '1.5em', fontWeight: 700, color: 'var(--text-primary)' }}>
            {readBills} <span style={{ fontSize: '0.6em', fontWeight: 400, color: 'var(--text-secondary)' }}>of {totalBills}</span>
          </p>
        </div>
        <div
          style={{
            fontSize: '2em',
            fontWeight: 700,
            color: percentage > 50 ? '#22c55e' : '#3b82f6',
          }}
        >
          {percentage}%
        </div>
      </div>

      {/* Progress bar */}
      <div
        style={{
          width: '100%',
          height: '8px',
          background: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
          borderRadius: '4px',
          overflow: 'hidden',
        }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          style={{
            height: '100%',
            background: 'linear-gradient(90deg, #3b82f6, #22c55e)',
            borderRadius: '4px',
          }}
        />
      </div>
    </motion.div>
  )
}

// Hook to manage reading progress
export function useReadingProgress() {
  const getReadBills = (): Set<string> => {
    const stored = localStorage.getItem('georgia-bills-read')
    return stored ? new Set(JSON.parse(stored)) : new Set()
  }

  const markAsRead = (billId: string) => {
    const readBills = getReadBills()
    readBills.add(billId)
    localStorage.setItem('georgia-bills-read', JSON.stringify([...readBills]))
  }

  const isRead = (billId: string): boolean => {
    const readBills = getReadBills()
    return readBills.has(billId)
  }

  const getReadCount = (): number => {
    return getReadBills().size
  }

  const clearProgress = () => {
    localStorage.removeItem('georgia-bills-read')
  }

  return {
    markAsRead,
    isRead,
    getReadBills,
    getReadCount,
    clearProgress,
  }
}
