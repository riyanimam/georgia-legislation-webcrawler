import { motion } from 'framer-motion'
import { Share2, Twitter, Facebook, Linkedin, Link2, Check } from 'lucide-react'
import { useState } from 'react'
import type { Bill } from '../types'

interface ShareButtonsProps {
  bill: Bill
  darkMode: boolean
}

export default function ShareButtons({ bill, darkMode }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false)

  const billUrl = `${window.location.origin}${window.location.pathname}?bill=${encodeURIComponent(bill.doc_number)}`
  const shareText = `Check out ${bill.doc_number}: ${bill.caption}`

  const copyToClipboard = () => {
    navigator.clipboard.writeText(billUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shareOnTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(billUrl)}`
    window.open(url, '_blank', 'width=550,height=420')
  }

  const shareOnFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(billUrl)}`
    window.open(url, '_blank', 'width=550,height=420')
  }

  const shareOnLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(billUrl)}`
    window.open(url, '_blank', 'width=550,height=420')
  }

  const shareButtons = [
    {
      icon: Twitter,
      label: 'Twitter',
      onClick: shareOnTwitter,
      color: '#1DA1F2',
    },
    {
      icon: Facebook,
      label: 'Facebook',
      onClick: shareOnFacebook,
      color: '#1877F2',
    },
    {
      icon: Linkedin,
      label: 'LinkedIn',
      onClick: shareOnLinkedIn,
      color: '#0A66C2',
    },
    {
      icon: copied ? Check : Link2,
      label: copied ? 'Copied!' : 'Copy Link',
      onClick: copyToClipboard,
      color: copied ? '#10b981' : '#667eea',
    },
  ]

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        flexWrap: 'wrap',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          color: 'var(--text-secondary)',
          fontSize: '0.9em',
          fontWeight: 500,
        }}
      >
        <Share2 size={16} />
        <span>Share:</span>
      </div>
      {shareButtons.map((button, index) => (
        <motion.button
          key={index}
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={button.onClick}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 14px',
            background: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
            border: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '0.85em',
            fontWeight: 500,
            color: button.color,
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = `${button.color}15`
            e.currentTarget.style.borderColor = `${button.color}40`
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'
            e.currentTarget.style.borderColor = darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
          }}
        >
          <button.icon size={16} />
          <span>{button.label}</span>
        </motion.button>
      ))}
    </div>
  )
}
