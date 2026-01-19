import { motion, AnimatePresence } from 'framer-motion'
import { X, Star, Calendar, TrendingUp, Users } from 'lucide-react'
import { useState, useEffect } from 'react'
import type { Bill } from '../types'
import type { Translation } from '../i18n/translations'
import { getLatestStatus } from '../utils'

interface BillOfTheDayProps {
  bills: Bill[]
  onSelectBill: (bill: Bill) => void
  darkMode: boolean
  t: Translation
}

export default function BillOfTheDay({ bills, onSelectBill, darkMode }: BillOfTheDayProps) {
  const [featuredBill, setFeaturedBill] = useState<Bill | null>(null)
  const [showBanner, setShowBanner] = useState(true)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (bills.length === 0) return

    const today = new Date().toDateString()
    const stored = localStorage.getItem('georgia-bills-featured')
    const storedData = stored ? JSON.parse(stored) : null

    // Check if we need a new featured bill (different day or no stored bill)
    if (!storedData || storedData.date !== today) {
      // Select an interesting bill (recently updated, has activity)
      const recentBills = bills
        .filter(bill => {
          const hasRecentActivity = bill.status_history && bill.status_history.length > 0
          return hasRecentActivity
        })
        .sort((a, b) => {
          // Prioritize bills with more recent activity
          const aDate = a.status_history?.[a.status_history.length - 1]?.date || ''
          const bDate = b.status_history?.[b.status_history.length - 1]?.date || ''
          return bDate.localeCompare(aDate)
        })
        .slice(0, 20) // Top 20 most recent

      // Pick random from top recent bills
      const randomBill = recentBills[Math.floor(Math.random() * recentBills.length)]
      
      if (randomBill) {
        setFeaturedBill(randomBill)
        localStorage.setItem('georgia-bills-featured', JSON.stringify({
          date: today,
          billId: randomBill.doc_number
        }))
      }
    } else {
      // Load stored featured bill
      const bill = bills.find(b => b.doc_number === storedData.billId)
      if (bill) setFeaturedBill(bill)
    }

    // Check if user dismissed today's banner
    const dismissedDate = localStorage.getItem('georgia-bills-featured-dismissed')
    if (dismissedDate === today) {
      setShowBanner(false)
      setDismissed(true)
    }
  }, [bills])

  const handleDismiss = () => {
    const today = new Date().toDateString()
    localStorage.setItem('georgia-bills-featured-dismissed', today)
    setShowBanner(false)
    setDismissed(true)
  }

  if (!featuredBill || dismissed) return null

  const latestStatus = getLatestStatus(featuredBill)
  const statusDate = featuredBill.status_history?.[featuredBill.status_history.length - 1]?.date

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ opacity: 0, y: -20, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto' }}
          exit={{ opacity: 0, y: -20, height: 0 }}
          transition={{ duration: 0.3 }}
          style={{
            marginBottom: '24px',
            overflow: 'hidden',
          }}
        >
          <motion.div
            whileHover={{ scale: 1.01 }}
            style={{
              background: darkMode
                ? 'linear-gradient(135deg, rgba(30, 30, 40, 0.95), rgba(20, 20, 30, 0.98))'
                : 'linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(250, 250, 255, 0.95))',
              border: darkMode
                ? '3px solid rgba(255, 215, 0, 0.5)'
                : '3px solid rgba(255, 165, 0, 0.6)',
              borderRadius: '16px',
              padding: '24px',
              position: 'relative',
              cursor: 'pointer',
              boxShadow: darkMode
                ? '0 8px 32px rgba(255, 215, 0, 0.15), inset 0 1px 0 rgba(255, 215, 0, 0.1)'
                : '0 8px 32px rgba(255, 165, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
            }}
            onClick={() => onSelectBill(featuredBill)}
          >
            {/* Close button */}
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation()
                handleDismiss()
              }}
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                background: darkMode ? 'rgba(255, 215, 0, 0.2)' : 'rgba(255, 165, 0, 0.15)',
                border: darkMode ? '1px solid rgba(255, 215, 0, 0.4)' : '1px solid rgba(255, 165, 0, 0.3)',
                borderRadius: '50%',
                padding: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10,
              }}
              aria-label="Dismiss bill of the day"
            >
              <X size={18} color={darkMode ? '#ffd700' : '#ff8c00'} strokeWidth={2.5} />
            </motion.button>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
              {/* Icon */}
              <motion.div
                animate={{
                  rotate: [0, -10, 10, -10, 0],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 3,
                }}
                style={{
                  background: 'linear-gradient(135deg, #ffd700, #ffa500)',
                  borderRadius: '12px',
                  padding: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: '0 4px 12px rgba(255, 165, 0, 0.4)',
                }}
              >
                <Star size={32} color="white" fill="white" strokeWidth={2} />
              </motion.div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                  <h3
                    style={{
                      fontSize: '1.2em',
                      fontWeight: 700,
                      color: darkMode ? '#ffd700' : '#ff8c00',
                      margin: 0,
                      textShadow: darkMode ? '0 2px 4px rgba(0, 0, 0, 0.3)' : 'none',
                    }}
                  >
                    ⭐ Bill of the Day
                  </h3>
                  {statusDate && (
                    <span
                      style={{
                        fontSize: '0.85em',
                        color: darkMode ? 'rgba(255, 215, 0, 0.85)' : 'rgba(255, 140, 0, 0.9)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontWeight: 600,
                      }}
                    >
                      <TrendingUp size={14} />
                      Active {new Date(statusDate).toLocaleDateString()}
                    </span>
                  )}
                </div>

                <h4
                  style={{
                    fontSize: '1.3em',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    margin: '0 0 8px 0',
                  }}
                >
                  {featuredBill.doc_number}
                </h4>

                <p
                  style={{
                    fontSize: '1em',
                    lineHeight: 1.6,
                    color: 'var(--text-secondary)',
                    margin: '0 0 12px 0',
                  }}
                >
                  {featuredBill.caption}
                </p>

                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '0.9em' }}>
                  {featuredBill.sponsors && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
                      <Users size={16} />
                      <span>{Array.isArray(featuredBill.sponsors) ? featuredBill.sponsors[0] : featuredBill.sponsors}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
                    <Calendar size={16} />
                    <span>{latestStatus}</span>
                  </div>
                </div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  style={{
                    marginTop: '12px',
                    padding: '14px',
                    background: darkMode 
                      ? 'rgba(255, 215, 0, 0.08)' 
                      : 'rgba(255, 215, 0, 0.12)',
                    border: darkMode
                      ? '1px solid rgba(255, 215, 0, 0.25)'
                      : '1px solid rgba(255, 165, 0, 0.25)',
                    borderRadius: '8px',
                    fontSize: '0.9em',
                    color: 'var(--text-secondary)',
                  }}
                >
                  💡 <strong style={{ color: darkMode ? '#ffd700' : '#ff8c00' }}>Why this matters:</strong> This bill has shown recent legislative activity, making it 
                  particularly relevant to current discussions in the Georgia legislature.
                </motion.div>
              </div>
            </div>

            <div
              style={{
                marginTop: '16px',
                textAlign: 'center',
                fontSize: '0.9em',
                color: darkMode ? 'rgba(255, 215, 0, 0.9)' : 'rgba(255, 140, 0, 1)',
                fontWeight: 600,
              }}
            >
              Click to view full details →
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
