import { motion, AnimatePresence } from 'framer-motion'
import { Heart, ChevronLeft, ChevronRight, Download, Trash2, X } from 'lucide-react'
import type { Bill } from '../types'
import { getLatestStatus } from '../utils'

interface SidebarProps {
  favorites: string[]
  bills: Bill[]
  isOpen: boolean
  onToggleOpen: () => void
  onToggleFavorite: (billNumber: string) => void
  onSelectBill: (bill: Bill) => void
  onExport: () => void
  darkMode: boolean
}

export default function Sidebar({
  favorites,
  bills,
  isOpen,
  onToggleOpen,
  onToggleFavorite,
  onSelectBill,
  onExport,
  darkMode,
}: SidebarProps) {
  const favoritedBills = bills.filter((bill) => favorites.includes(bill.doc_number))

  return (
    <>
      {/* Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onToggleOpen}
        style={{
          position: 'fixed',
          top: '50%',
          right: isOpen ? '320px' : '0',
          transform: 'translateY(-50%)',
          background: 'linear-gradient(135deg, #ff6b6b, #ffa502)',
          border: 'none',
          borderRadius: isOpen ? '12px 0 0 12px' : '12px',
          padding: '16px 12px',
          cursor: 'pointer',
          zIndex: 1001,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          boxShadow: 'var(--shadow-lg)',
          transition: 'right 0.15s ease',
        }}
        aria-label={isOpen ? 'Close sidebar' : 'Open favorites sidebar'}
      >
        {isOpen ? <ChevronRight size={20} color="white" /> : <ChevronLeft size={20} color="white" />}
        <Heart size={20} color="white" fill={favorites.length > 0 ? 'white' : 'none'} />
        {favorites.length > 0 && (
          <span
            style={{
              fontSize: '0.75em',
              color: 'white',
              fontWeight: 600,
            }}
          >
            {favorites.length}
          </span>
        )}
      </motion.button>

      {/* Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: 320 }}
            animate={{ x: 0 }}
            exit={{ x: 320 }}
            transition={{ duration: 0.15, ease: 'easeInOut' }}
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              width: '320px',
              height: '100vh',
              background: darkMode ? 'rgba(42, 34, 32, 0.98)' : 'rgba(255, 255, 255, 0.98)',
              borderLeft: `2px solid var(--border-color)`,
              boxShadow: '-4px 0 16px rgba(0, 0, 0, 0.2)',
              zIndex: 1000,
              display: 'flex',
              flexDirection: 'column',
              backdropFilter: 'blur(10px)',
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: '24px 20px',
                borderBottom: `2px solid var(--border-color)`,
                background: 'linear-gradient(135deg, #ff6b6b, #ffa502, #ffd700)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '8px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Heart size={24} color="white" fill="white" />
                  <h3 style={{ margin: 0, fontSize: '1.3em', fontWeight: 600, color: 'white' }}>
                    Favorites
                  </h3>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onToggleOpen}
                  style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    border: 'none',
                    borderRadius: '50%',
                    padding: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  aria-label="Close sidebar"
                >
                  <X size={20} color="white" />
                </motion.button>
              </div>
              <p style={{ margin: 0, fontSize: '0.9em', color: 'rgba(255, 255, 255, 0.9)' }}>
                {favoritedBills.length} {favoritedBills.length === 1 ? 'bill' : 'bills'} saved
              </p>
            </div>

            {/* Export Button */}
            {favoritedBills.length > 0 && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onExport}
                style={{
                  margin: '16px 16px 0',
                  background: 'var(--accent-primary)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  fontSize: '0.95em',
                  fontWeight: 500,
                }}
              >
                <Download size={18} />
                Export All (JSON)
              </motion.button>
            )}

            {/* Bills List */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '16px',
              }}
            >
              {favoritedBills.length > 0 ? (
                <div style={{ display: 'grid', gap: '12px' }}>
                  {favoritedBills.map((bill, index) => (
                    <motion.div
                      key={bill.doc_number}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      whileHover={{ scale: 1.02 }}
                      style={{
                        background: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
                        borderRadius: '12px',
                        padding: '12px',
                        cursor: 'pointer',
                        border: '2px solid',
                        borderColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
                        position: 'relative',
                        transition: 'all 0.05s ease',
                      }}
                      onClick={() => onSelectBill(bill)}
                    >
                      {/* Remove Button */}
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation()
                          onToggleFavorite(bill.doc_number)
                        }}
                        style={{
                          position: 'absolute',
                          top: '8px',
                          right: '8px',
                          background: '#ef4444',
                          border: 'none',
                          borderRadius: '50%',
                          padding: '6px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                        aria-label="Remove from favorites"
                      >
                        <Trash2 size={14} color="white" />
                      </motion.button>

                      {/* Bill Number */}
                      <div
                        style={{
                          fontSize: '1em',
                          fontWeight: 600,
                          color: 'var(--accent-primary)',
                          marginBottom: '6px',
                          paddingRight: '32px',
                        }}
                      >
                        {bill.doc_number}
                      </div>

                      {/* Caption */}
                      <p
                        style={{
                          margin: 0,
                          fontSize: '0.85em',
                          color: 'var(--text-primary)',
                          lineHeight: 1.4,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {bill.caption}
                      </p>

                      {/* Status */}
                      <div
                        style={{
                          marginTop: '8px',
                          fontSize: '0.75em',
                          color: 'var(--text-tertiary)',
                          paddingTop: '8px',
                          borderTop: '1px solid var(--border-color)',
                        }}
                      >
                        {getLatestStatus(bill)}
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{
                    textAlign: 'center',
                    padding: '40px 20px',
                    color: 'var(--text-secondary)',
                  }}
                >
                  <Heart
                    size={48}
                    strokeWidth={1}
                    style={{ marginBottom: '16px', opacity: 0.4, color: 'var(--text-tertiary)' }}
                  />
                  <p style={{ fontSize: '0.95em', lineHeight: 1.5, margin: 0 }}>
                    No favorites yet. Click the heart icon on any bill to save it here!
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
