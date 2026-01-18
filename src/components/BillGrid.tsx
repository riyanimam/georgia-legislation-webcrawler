import { motion } from 'framer-motion'
import { Heart, FileText, ChevronLeft, ChevronRight, GitCompare } from 'lucide-react'
import type { Bill } from '../types'
import { generateBillTags, getLatestStatus } from '../utils'
import SkeletonCard from './SkeletonCard'
import { ReadingProgressBadge, useReadingProgress } from './ReadingProgress.tsx'
import type { Translation } from '../i18n/translations'
import { useState } from 'react'
import { BillComparison } from './BillComparison'

interface BillGridProps {
  bills: Bill[]
  favorites: string[]
  onToggleFavorite: (billNumber: string) => void
  onSelectBill: (bill: Bill) => void
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  darkMode: boolean
  loading?: boolean
  t: Translation
}

export default function BillGrid({
  bills,
  favorites,
  onToggleFavorite,
  onSelectBill,
  currentPage,
  totalPages,
  onPageChange,
  darkMode,
  loading = false,
  t,
}: BillGridProps) {
  const { isRead } = useReadingProgress()
  const [selectedForComparison, setSelectedForComparison] = useState<string[]>([])
  const [showComparison, setShowComparison] = useState(false)

  const toggleComparisonSelection = (billNumber: string) => {
    setSelectedForComparison(prev => 
      prev.includes(billNumber)
        ? prev.filter(n => n !== billNumber)
        : [...prev, billNumber].slice(0, 3) // Max 3 bills
    )
  }

  const handleCompare = () => {
    if (selectedForComparison.length >= 2) {
      setShowComparison(true)
    }
  }

  const comparisonBills = bills.filter(b => selectedForComparison.includes(b.doc_number))
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: '24px',
          marginBottom: '32px',
        }}
      >
        {loading ? (
          // Show skeleton cards while loading
          Array.from({ length: 6 }).map((_, index) => (
            <SkeletonCard key={index} darkMode={darkMode} />
          ))
        ) : (
          bills.map((bill, index) => (
            <motion.div
              key={bill.doc_number}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.02, duration: 0.2 }}
              whileHover={{ scale: 1.02, y: -3 }}
              style={{
                background: darkMode ? 'rgba(58, 47, 45, 0.8)' : 'rgba(255, 255, 255, 0.98)',
                borderRadius: '16px',
                padding: '20px',
                boxShadow: 'var(--shadow-md)',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
                backdropFilter: 'blur(10px)',
                border: '1px solid var(--border-color)',
                transition: 'all 0.1s ease',
              }}
              onClick={() => onSelectBill(bill)}
            >
              {/* Top Controls Row */}
              <div
                style={{
                  position: 'absolute',
                  top: '12px',
                  left: '12px',
                  right: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  zIndex: 10,
                  pointerEvents: 'none', // Allow clicks to pass through container
                }}
              >
                {/* Comparison Checkbox */}
                <motion.label
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                    padding: '6px 10px',
                    background: selectedForComparison.includes(bill.doc_number)
                      ? darkMode ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.2)'
                      : darkMode ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.8)',
                    borderRadius: '8px',
                    fontSize: '0.8em',
                    fontWeight: 500,
                    color: selectedForComparison.includes(bill.doc_number)
                      ? darkMode ? '#60a5fa' : '#2563eb'
                      : 'var(--text-secondary)',
                    border: selectedForComparison.includes(bill.doc_number)
                      ? darkMode ? '1px solid rgba(59, 130, 246, 0.5)' : '1px solid rgba(59, 130, 246, 0.3)'
                      : darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)',
                    pointerEvents: 'auto', // Enable clicks on this element
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedForComparison.includes(bill.doc_number)}
                    onChange={() => toggleComparisonSelection(bill.doc_number)}
                    style={{ cursor: 'pointer', accentColor: 'var(--accent-primary)', margin: 0 }}
                  />
                  <span style={{ whiteSpace: 'nowrap' }}>Compare</span>
                </motion.label>

                {/* Favorite Button */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.1 }}
                  onClick={(e) => {
                    e.stopPropagation()
                    onToggleFavorite(bill.doc_number)
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '8px',
                    pointerEvents: 'auto', // Enable clicks on this element
                  }}
                  aria-label="Toggle favorite"
                >
                  <Heart
                    size={22}
                    fill={favorites.includes(bill.doc_number) ? '#ef4444' : 'none'}
                    color={favorites.includes(bill.doc_number) ? '#ef4444' : 'var(--text-tertiary)'}
                  />
                </motion.button>
              </div>

              {/* Bill Number Badge */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', marginTop: '44px' }}>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: 'linear-gradient(135deg, #667eea, #764ba2)',
                    color: 'white',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    fontSize: '0.875em',
                    fontWeight: 600,
                  }}
                >
                  <FileText size={16} />
                  {bill.doc_number}
                </div>
                <ReadingProgressBadge isRead={isRead(bill.doc_number)} compact />
              </div>

              {/* Caption */}
              <h3
                style={{
                  fontSize: '1.05em',
                  fontWeight: 600,
                  marginBottom: '14px',
                  color: 'var(--text-primary)',
                  lineHeight: 1.5,
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  minHeight: '63px',
                }}
              >
                {bill.caption}
              </h3>

              {/* Tags */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px', minHeight: '28px' }}>
                {generateBillTags(bill).slice(0, 3).map((tag, i) => (
                  <span
                    key={i}
                    style={{
                      background: darkMode ? 'rgba(255, 214, 165, 0.15)' : 'rgba(102, 126, 234, 0.1)',
                      color: 'var(--text-secondary)',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '0.75em',
                      fontWeight: 500,
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Status */}
              <div
                style={{
                  fontSize: '0.85em',
                  color: 'var(--text-tertiary)',
                  marginTop: '12px',
                  paddingTop: '12px',
                  borderTop: '1px solid var(--border-color)',
                }}
              >
                <strong>{t.billStatus}:</strong> {getLatestStatus(bill)}
              </div>

              {/* Animated Gradient Accent */}
              <motion.div
                animate={{
                  x: [-50, 150],
                  opacity: [0, 0.3, 0],
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
                  background: 'linear-gradient(90deg, transparent, #667eea20, transparent)',
                  pointerEvents: 'none',
                }}
              />
            </motion.div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '16px',
            padding: '24px',
          }}
        >
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            style={{
              background: currentPage === 1 ? 'var(--border-color)' : 'var(--accent-primary)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '12px',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <ChevronLeft size={20} />
          </motion.button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ color: 'white', fontWeight: 500, fontSize: '1.1em' }}>
              {t.pageText} {currentPage} {t.ofText} {totalPages}
            </span>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="number"
                min="1"
                max={totalPages}
                value={currentPage}
                onChange={(e) => {
                  const page = Number.parseInt(e.target.value)
                  if (page >= 1 && page <= totalPages) {
                    onPageChange(page)
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const page = Number.parseInt((e.target as HTMLInputElement).value)
                    if (page >= 1 && page <= totalPages) {
                      onPageChange(page)
                    }
                  }
                }}
                style={{
                  width: '60px',
                  padding: '8px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  background: darkMode ? 'rgba(58, 47, 45, 0.6)' : 'rgba(255, 255, 255, 0.9)',
                  color: darkMode ? 'white' : '#2c3e50',
                  fontSize: '0.95em',
                  textAlign: 'center',
                }}
                aria-label="Jump to page"
              />
              <button
                onClick={() => {
                  const input = document.querySelector('input[type="number"]') as HTMLInputElement
                  if (input) {
                    const page = Number.parseInt(input.value)
                    if (page >= 1 && page <= totalPages) {
                      onPageChange(page)
                    }
                  }
                }}
                style={{
                  background: 'var(--accent-secondary)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  cursor: 'pointer',
                  fontSize: '0.9em',
                  fontWeight: 500,
                }}
              >
                {t.goButton}
              </button>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            style={{
              background: currentPage === totalPages ? 'var(--border-color)' : 'var(--accent-primary)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '12px',
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <ChevronRight size={20} />
          </motion.button>
        </motion.div>
      )}

      {/* Floating Compare Button */}
      {selectedForComparison.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.8 }}
          style={{
            position: 'fixed',
            bottom: '32px',
            right: '32px',
            zIndex: 1000,
          }}
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCompare}
            disabled={selectedForComparison.length < 2}
            style={{
              background: selectedForComparison.length >= 2
                ? 'linear-gradient(135deg, #3b82f6, #2563eb)'
                : darkMode ? 'rgba(100, 100, 100, 0.8)' : 'rgba(200, 200, 200, 0.8)',
              color: 'white',
              border: 'none',
              borderRadius: '16px',
              padding: '16px 24px',
              cursor: selectedForComparison.length >= 2 ? 'pointer' : 'not-allowed',
              fontSize: '1.1em',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              boxShadow: selectedForComparison.length >= 2
                ? '0 10px 40px rgba(59, 130, 246, 0.4)'
                : '0 4px 12px rgba(0, 0, 0, 0.2)',
            }}
          >
            <GitCompare size={24} />
            <span>
              Compare {selectedForComparison.length} Bill{selectedForComparison.length > 1 ? 's' : ''}
            </span>
            {selectedForComparison.length < 2 && (
              <span style={{ fontSize: '0.85em', opacity: 0.8 }}>
                (Select {2 - selectedForComparison.length} more)
              </span>
            )}
          </motion.button>
        </motion.div>
      )}

      {/* Bill Comparison Modal */}
      <BillComparison
        bills={comparisonBills}
        isOpen={showComparison}
        onClose={() => setShowComparison(false)}
        darkMode={darkMode}
      />
    </motion.div>
  )
}
