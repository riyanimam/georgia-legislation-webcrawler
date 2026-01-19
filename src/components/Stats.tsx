import { motion } from 'framer-motion'
import { FileText, Filter, TrendingUp, Clock } from 'lucide-react'
import type { Bill } from '../types'
import type { Translation } from '../i18n/translations'

interface StatsProps {
  bills: Bill[]
  filteredBills: Bill[]
  darkMode: boolean
  t: Translation
}

export default function Stats({ bills, filteredBills, darkMode, t }: StatsProps) {
  const stats = [
    {
      icon: FileText,
      label: t.totalBills,
      value: bills.length,
      color: '#667eea',
    },
    {
      icon: Filter,
      label: t.billsShowing,
      value: filteredBills.length,
      color: '#10b981',
    },
    {
      icon: TrendingUp,
      label: t.houseBills,
      value: bills.filter((b) => b.doc_number.startsWith('HB')).length,
      color: '#f59e0b',
    },
    {
      icon: Clock,
      label: t.senateBills,
      value: bills.filter((b) => b.doc_number.startsWith('SB')).length,
      color: '#ef4444',
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05, duration: 0.2 }}
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '32px',
      }}
    >
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.05 + index * 0.02, duration: 0.15 }}
          whileHover={{ scale: 1.02, y: -2 }}
          style={{
            background: darkMode ? 'rgba(58, 47, 45, 0.8)' : 'rgba(255, 255, 255, 0.98)',
            borderRadius: '16px',
            padding: '20px',
            boxShadow: 'var(--shadow-md)',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            position: 'relative',
            overflow: 'hidden',
            border: '1px solid var(--border-color)',
            transition: 'all 0.1s ease',
          }}
        >
          <motion.div
            animate={{
              rotate: [0, 360],
            }}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              ease: 'linear',
            }}
            style={{
              background: `linear-gradient(135deg, ${stat.color}20, ${stat.color}10)`,
              borderRadius: '12px',
              padding: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <stat.icon size={28} color={stat.color} />
          </motion.div>
          <div>
            <div
              style={{
                fontSize: '0.9em',
                color: 'var(--text-secondary)',
                marginBottom: '4px',
              }}
            >
              {stat.label}
            </div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.6 + index * 0.1, type: 'spring' }}
              style={{
                fontSize: '2em',
                fontWeight: 700,
                color: stat.color,
              }}
            >
              {stat.value.toLocaleString()}
            </motion.div>
          </div>

          {/* Animated background accent */}
          <motion.div
            animate={{
              x: [-100, 300],
              opacity: [0, 0.5, 0],
            }}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              ease: 'easeInOut',
            }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100px',
              height: '100%',
              background: `linear-gradient(90deg, transparent, ${stat.color}20, transparent)`,
              pointerEvents: 'none',
            }}
          />
        </motion.div>
      ))}
    </motion.div>
  )
}
