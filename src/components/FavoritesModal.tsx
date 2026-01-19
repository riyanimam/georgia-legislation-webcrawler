import { motion } from 'framer-motion'
import { X, Heart, Download, Trash2 } from 'lucide-react'
import type { Bill } from '../types'
import type { Translation } from '../i18n/translations'

interface FavoritesModalProps {
  favorites: string[]
  bills: Bill[]
  onClose: () => void
  onToggleFavorite: (billNumber: string) => void
  onSelectBill: (bill: Bill) => void
  darkMode: boolean
  t: Translation
}

export default function FavoritesModal({
  favorites,
  bills,
  onClose,
  onToggleFavorite,
  onSelectBill,
  darkMode,
  t,
}: FavoritesModalProps) {
  const favoritedBills = bills.filter((bill) => favorites.includes(bill.doc_number))

  const exportFavoritesJSON = () => {
    const dataStr = JSON.stringify(favoritedBills, null, 2)
    const blob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `favorites-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px',
        overflowY: 'auto',
      }}
    >
      <motion.div
        initial={{ scale: 0.95, y: 10 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 10 }}
        transition={{ duration: 0.15 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: darkMode ? 'var(--bg-secondary)' : 'white',
          borderRadius: '24px',
          maxWidth: '900px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          position: 'relative',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        {/* Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #ff6b6b, #ffa502, #ffd700)',
            padding: '32px',
            borderRadius: '24px 24px 0 0',
            color: 'white',
            position: 'relative',
          }}
        >
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '50%',
              padding: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            aria-label="Close favorites modal"
          >
            <X size={24} color="white" />
          </motion.button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <Heart size={32} fill="white" />
            <h2 style={{ fontSize: '2em', fontWeight: 700, margin: 0 }}>
              {t.favoritesTitle}
            </h2>
          </div>
          <p style={{ opacity: 0.9, fontSize: '1.1em' }}>
            {favoritedBills.length} {favoritedBills.length === 1 ? 'bill' : 'bills'} saved
          </p>
        </div>

        {/* Content */}
        <div style={{ padding: '32px' }}>
          {favoritedBills.length > 0 ? (
            <>
              {/* Export Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={exportFavoritesJSON}
                style={{
                  background: 'var(--accent-primary)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '14px 24px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '1em',
                  fontWeight: 500,
                  marginBottom: '24px',
                  width: '100%',
                  justifyContent: 'center',
                }}
              >
                <Download size={20} />
                {t.exportAll}
              </motion.button>

              {/* Favorites List */}
              <div style={{ display: 'grid', gap: '16px' }}>
                {favoritedBills.map((bill) => (
                  <motion.div
                    key={bill.doc_number}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    whileHover={{ scale: 1.01 }}
                    style={{
                      background: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
                      borderRadius: '12px',
                      padding: '20px',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '16px',
                      border: '2px solid',
                      borderColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                      transition: 'all 0.05s ease',
                    }}
                    onClick={() => {
                      onSelectBill(bill)
                      onClose()
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <h3
                        style={{
                          fontSize: '1.2em',
                          fontWeight: 600,
                          marginBottom: '8px',
                          color: 'var(--accent-primary)',
                        }}
                      >
                        {bill.doc_number}
                      </h3>
                      <p
                        style={{
                          color: 'var(--text-primary)',
                          fontSize: '0.95em',
                          lineHeight: 1.5,
                          margin: 0,
                        }}
                      >
                        {bill.caption}
                      </p>
                      {bill.sponsors && (
                        <p
                          style={{
                            color: 'var(--text-tertiary)',
                            fontSize: '0.85em',
                            marginTop: '8px',
                            margin: 0,
                          }}
                        >
                          {t.billSponsor}:{' '}
                          {Array.isArray(bill.sponsors) ? bill.sponsors.join(', ') : bill.sponsors}
                        </p>
                      )}
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation()
                        onToggleFavorite(bill.doc_number)
                      }}
                      style={{
                        background: '#ef4444',
                        border: 'none',
                        borderRadius: '50%',
                        padding: '12px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                      aria-label="Remove from favorites"
                    >
                      <Trash2 size={20} color="white" />
                    </motion.button>
                  </motion.div>
                ))}
              </div>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                textAlign: 'center',
                padding: '60px 20px',
                color: 'var(--text-secondary)',
              }}
            >
              <Heart size={64} strokeWidth={1} style={{ marginBottom: '24px', opacity: 0.5 }} />
              <h3 style={{ fontSize: '1.5em', marginBottom: '12px' }}>{t.noFavorites}</h3>
              <p>{t.noFavoritesMessage}</p>
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
