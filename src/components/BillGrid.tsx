import { motion } from 'framer-motion'
import { Heart, FileText, ChevronLeft, ChevronRight } from 'lucide-react'
import type { Bill } from '../types'
import { generateBillTags, getLatestStatus } from '../utils'

interface BillGridProps {
  bills: Bill[]
  favorites: string[]
  onToggleFavorite: (billNumber: string) => void
  onSelectBill: (bill: Bill) => void
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  darkMode: boolean
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
}: BillGridProps) {
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
        {bills.map((bill, index) => (
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
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '8px',
                zIndex: 10,
              }}
              aria-label="Toggle favorite"
            >
              <Heart
                size={24}
                fill={favorites.includes(bill.doc_number) ? '#ef4444' : 'none'}
                color={favorites.includes(bill.doc_number) ? '#ef4444' : 'var(--text-tertiary)'}
              />
            </motion.button>

            {/* Bill Number Badge */}
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
                marginBottom: '14px',
              }}
            >
              <FileText size={16} />
              {bill.doc_number}
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
              <strong>Status:</strong> {getLatestStatus(bill)}
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
        ))}
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
              Page {currentPage} of {totalPages}
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
                Go
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
    </motion.div>
  )
}
