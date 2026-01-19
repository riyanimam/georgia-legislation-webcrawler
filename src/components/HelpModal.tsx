import { motion, AnimatePresence } from 'framer-motion'
import { X, Keyboard, Search, Heart, XCircle } from 'lucide-react'

interface HelpModalProps {
  isOpen: boolean
  onClose: () => void
  darkMode: boolean
}

export default function HelpModal({ isOpen, onClose, darkMode }: HelpModalProps) {
  const shortcuts = [
    {
      icon: XCircle,
      key: 'Esc',
      description: 'Close modals and dialogs',
    },
    {
      icon: Search,
      key: 'Ctrl + K',
      description: 'Focus search input (quick search)',
    },
    {
      icon: Heart,
      key: 'F',
      description: 'Toggle favorites sidebar',
    },
    {
      icon: Keyboard,
      key: '?',
      description: 'Show this help dialog',
    },
  ]

  return (
    <AnimatePresence>
      {isOpen && (
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
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: darkMode ? 'rgba(30, 30, 30, 0.98)' : 'rgba(255, 255, 255, 0.98)',
              borderRadius: '20px',
              padding: '32px',
              maxWidth: '500px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
              position: 'relative',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3)',
              border: '1px solid var(--border-color)',
            }}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '8px',
                color: 'var(--text-tertiary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '8px',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--border-color)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
              }}
              aria-label="Close help"
            >
              <X size={24} />
            </button>

            {/* Header */}
            <div style={{ marginBottom: '24px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '12px',
                }}
              >
                <Keyboard size={32} color="#667eea" />
                <h2
                  style={{
                    fontSize: '1.75em',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    margin: 0,
                  }}
                >
                  Keyboard Shortcuts
                </h2>
              </div>
              <p
                style={{
                  color: 'var(--text-secondary)',
                  margin: 0,
                  fontSize: '0.95em',
                }}
              >
                Power user features to navigate faster
              </p>
            </div>

            {/* Shortcuts list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {shortcuts.map((shortcut, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '16px',
                    background: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
                    borderRadius: '12px',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <div
                    style={{
                      background: 'linear-gradient(135deg, #667eea, #764ba2)',
                      borderRadius: '10px',
                      padding: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minWidth: '40px',
                      minHeight: '40px',
                    }}
                  >
                    <shortcut.icon size={20} color="white" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: '0.95em',
                        color: 'var(--text-secondary)',
                        marginBottom: '4px',
                      }}
                    >
                      {shortcut.description}
                    </div>
                    <kbd
                      style={{
                        background: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '0.85em',
                        fontWeight: 600,
                        fontFamily: 'monospace',
                        color: 'var(--text-primary)',
                        border: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'}`,
                      }}
                    >
                      {shortcut.key}
                    </kbd>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Footer tip */}
            <div
              style={{
                marginTop: '24px',
                padding: '16px',
                background: 'linear-gradient(135deg, #667eea20, #764ba220)',
                borderRadius: '12px',
                border: '1px solid #667eea40',
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: '0.9em',
                  color: 'var(--text-secondary)',
                  textAlign: 'center',
                }}
              >
                <strong style={{ color: 'var(--text-primary)' }}>Pro tip:</strong> Press{' '}
                <kbd
                  style={{
                    background: darkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontWeight: 600,
                  }}
                >
                  ?
                </kbd>{' '}
                anytime to open this help dialog
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
