import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Share2, Twitter, Facebook, Linkedin, Link as LinkIcon, Check } from 'lucide-react'
import type { Bill } from '../types'
import type { Translation } from '../i18n/translations'

interface ShareButtonProps {
  bill: Bill
  darkMode: boolean
  t: Translation
}

export default function ShareButton({ bill, darkMode }: ShareButtonProps) {
  const [showMenu, setShowMenu] = useState(false)
  const [copied, setCopied] = useState(false)

  const billUrl = `${window.location.origin}${window.location.pathname}?bill=${encodeURIComponent(bill.doc_number)}`
  const shareText = `${bill.doc_number}: ${bill.caption}`

  const handleShare = (platform: string) => {
    const encodedUrl = encodeURIComponent(billUrl)
    const encodedText = encodeURIComponent(shareText)

    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    }

    if (platform in urls) {
      window.open(urls[platform as keyof typeof urls], '_blank', 'width=600,height=400')
    }
    setShowMenu(false)
  }

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(billUrl)
      setCopied(true)
      setTimeout(() => {
        setCopied(false)
        setShowMenu(false)
      }, 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowMenu(!showMenu)}
        style={{
          background: darkMode 
            ? 'linear-gradient(135deg, #667eea, #764ba2)'
            : 'linear-gradient(135deg, #667eea, #764ba2)',
          border: 'none',
          color: 'white',
          padding: '8px 16px',
          borderRadius: '8px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.9em',
        }}
        aria-label="Share bill"
      >
        <Share2 size={16} />
        <span>Share</span>
      </motion.button>

      <AnimatePresence>
        {showMenu && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              right: 0,
              background: darkMode ? 'rgba(30, 30, 30, 0.98)' : 'rgba(255, 255, 255, 0.98)',
              border: darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)',
              borderRadius: '12px',
              padding: '8px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
              backdropFilter: 'blur(10px)',
              zIndex: 1000,
              minWidth: '200px',
            }}
          >
            <button
              onClick={() => handleShare('twitter')}
              style={{
                width: '100%',
                padding: '10px 12px',
                background: 'transparent',
                border: 'none',
                color: darkMode ? 'white' : 'black',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                borderRadius: '8px',
                fontSize: '0.9em',
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
              }}
            >
              <Twitter size={18} style={{ color: '#1DA1F2' }} />
              <span>Share on Twitter</span>
            </button>

            <button
              onClick={() => handleShare('facebook')}
              style={{
                width: '100%',
                padding: '10px 12px',
                background: 'transparent',
                border: 'none',
                color: darkMode ? 'white' : 'black',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                borderRadius: '8px',
                fontSize: '0.9em',
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
              }}
            >
              <Facebook size={18} style={{ color: '#4267B2' }} />
              <span>Share on Facebook</span>
            </button>

            <button
              onClick={() => handleShare('linkedin')}
              style={{
                width: '100%',
                padding: '10px 12px',
                background: 'transparent',
                border: 'none',
                color: darkMode ? 'white' : 'black',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                borderRadius: '8px',
                fontSize: '0.9em',
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
              }}
            >
              <Linkedin size={18} style={{ color: '#0077B5' }} />
              <span>Share on LinkedIn</span>
            </button>

            <div style={{ height: '1px', background: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)', margin: '4px 0' }} />

            <button
              onClick={copyLink}
              style={{
                width: '100%',
                padding: '10px 12px',
                background: 'transparent',
                border: 'none',
                color: darkMode ? 'white' : 'black',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                borderRadius: '8px',
                fontSize: '0.9em',
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
              }}
            >
              {copied ? (
                <>
                  <Check size={18} style={{ color: '#10b981' }} />
                  <span style={{ color: '#10b981' }}>Link copied!</span>
                </>
              ) : (
                <>
                  <LinkIcon size={18} />
                  <span>Copy link</span>
                </>
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {showMenu && (
        <div
          onClick={() => setShowMenu(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999,
          }}
        />
      )}
    </div>
  )
}
