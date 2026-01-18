import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { Plus, Heart, Download, Share2, X } from 'lucide-react'
import type { Bill } from '../types'

interface QuickActionsProps {
  darkMode: boolean
  onExportView: () => void
  onShareBill?: () => void
  currentBill?: Bill | null
  onAddFavorite?: () => void
}

export default function QuickActions({ 
  darkMode, 
  onExportView, 
  onShareBill,
  currentBill,
  onAddFavorite 
}: QuickActionsProps) {
  const [isOpen, setIsOpen] = useState(false)

  const actions = [
    { 
      icon: Heart, 
      label: 'Add Favorite', 
      onClick: onAddFavorite,
      color: '#ef4444',
      disabled: !currentBill
    },
    { 
      icon: Download, 
      label: 'Export View', 
      onClick: onExportView,
      color: '#3b82f6'
    },
    { 
      icon: Share2, 
      label: 'Share', 
      onClick: onShareBill || (() => {
        navigator.clipboard.writeText(window.location.href)
        alert('Link copied to clipboard!')
      }),
      color: '#10b981'
    },
  ]

  return (
    <div style={{
      position: 'fixed',
      bottom: '32px',
      right: '32px',
      zIndex: 100,
    }}>
      {/* Action Buttons */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              marginBottom: '16px',
            }}
          >
            {actions.map((action, index) => {
              const Icon = action.icon
              return (
                <motion.button
                  key={action.label}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 50 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.05, x: -5 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    action.onClick?.()
                    setIsOpen(false)
                  }}
                  disabled={action.disabled}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 20px',
                    background: action.disabled
                      ? darkMode ? 'rgba(100, 100, 100, 0.5)' : 'rgba(200, 200, 200, 0.5)'
                      : darkMode 
                        ? 'rgba(36, 36, 36, 0.95)'
                        : 'rgba(255, 255, 255, 0.95)',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
                    cursor: action.disabled ? 'not-allowed' : 'pointer',
                    color: 'var(--text-primary)',
                    fontSize: '0.9em',
                    fontWeight: 500,
                    backdropFilter: 'blur(10px)',
                    opacity: action.disabled ? 0.5 : 1,
                  }}
                >
                  <Icon size={20} color={action.color} />
                  <span style={{ whiteSpace: 'nowrap' }}>{action.label}</span>
                </motion.button>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main FAB Button */}
      <motion.button
        whileHover={{ scale: 1.1, rotate: isOpen ? 45 : 0 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          border: 'none',
          background: darkMode 
            ? 'linear-gradient(135deg, #f97316, #fb923c)'
            : 'linear-gradient(135deg, #667eea, #764ba2)',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          transition: 'transform 0.2s ease',
        }}
      >
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.2 }}
        >
          {isOpen ? <X size={28} /> : <Plus size={28} />}
        </motion.div>
      </motion.button>
    </div>
  )
}
