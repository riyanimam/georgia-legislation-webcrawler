import { motion } from 'framer-motion'
import type { Bill } from '../types'
import type { Translation } from '../i18n/translations'
import { useMemo } from 'react'
import { TagCloud } from 'react-tagcloud'

interface WordCloudViewProps {
  bills: Bill[]
  darkMode: boolean
  t: Translation
  onFilterByWord?: (word: string) => void
}

export function WordCloudView({ bills, darkMode, onFilterByWord }: WordCloudViewProps) {
  const wordData = useMemo(() => {
    const wordCount: Record<string, number> = {}
    
    // Common stop words to exclude
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
      'by', 'from', 'as', 'is', 'was', 'are', 'be', 'been', 'has', 'have', 'had', 'will',
      'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these',
      'those', 'it', 'its', 'they', 'their', 'them', 'which', 'who', 'whom', 'whose',
      'what', 'when', 'where', 'why', 'how', 'all', 'each', 'every', 'both', 'few',
      'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'same',
      'so', 'than', 'too', 'very', 'any', 'code', 'section', 'act', 'chapter'
    ])
    
    bills.forEach(bill => {
      // Extract words from caption
      const text = `${bill.caption} ${bill.first_reader_summary || ''} ${bill.summary || ''}`
      const words = text.toLowerCase()
        .replace(/[^\w\s-]/g, ' ')
        .split(/\s+/)
        .filter(word => 
          word.length > 3 && 
          !stopWords.has(word) &&
          !/^\d+$/.test(word) // Exclude pure numbers
        )
      
      words.forEach(word => {
        wordCount[word] = (wordCount[word] || 0) + 1
      })
    })
    
    // Get top 50 words, capitalize first letter
    return Object.entries(wordCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 50)
      .map(([value, count]) => ({
        value: value.charAt(0).toUpperCase() + value.slice(1),
        count,
      }))
  }, [bills])

  const customRenderer = (tag: { value: string; count: number }, size: number, color: string) => {
    return (
      <span
        key={tag.value}
        style={{
          fontSize: `${size}px`,
          color,
          margin: '3px',
          padding: '5px 10px',
          display: 'inline-block',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          borderRadius: '6px',
          fontWeight: 500,
        }}
        onClick={() => onFilterByWord?.(tag.value.toLowerCase())}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = darkMode 
            ? 'rgba(249, 115, 22, 0.2)' 
            : 'rgba(102, 126, 234, 0.2)'
          e.currentTarget.style.transform = 'scale(1.1)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent'
          e.currentTarget.style.transform = 'scale(1)'
        }}
      >
        {tag.value}
      </span>
    )
  }

  return (
    <div style={{
      background: darkMode ? 'rgba(36, 36, 36, 0.8)' : 'rgba(255, 255, 255, 0.9)',
      borderRadius: '16px',
      padding: '32px',
      backdropFilter: 'blur(10px)',
      border: '1px solid var(--border-color)',
    }}>
      <h2 style={{ 
        marginBottom: '8px', 
        color: 'var(--text-primary)',
        fontSize: '1.8em',
        fontWeight: 700
      }}>
        Trending Topics Word Cloud
      </h2>
      <p style={{ 
        color: 'var(--text-secondary)', 
        marginBottom: '32px',
        lineHeight: 1.6
      }}>
        Discover the most frequent topics and keywords across all legislation. Click any word to filter bills.
      </p>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        style={{
          background: darkMode ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.02)',
          borderRadius: '12px',
          padding: '40px',
          minHeight: '500px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <TagCloud
          minSize={16}
          maxSize={48}
          tags={wordData}
          colorOptions={{
            luminosity: darkMode ? 'bright' : 'dark',
            hue: darkMode ? 'orange' : 'blue',
          }}
          renderer={customRenderer}
        />
      </motion.div>

      {/* Top Keywords List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        style={{
          marginTop: '32px',
          padding: '20px',
          background: darkMode 
            ? 'linear-gradient(135deg, rgba(249, 115, 22, 0.1), rgba(251, 146, 60, 0.05))'
            : 'linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.05))',
          borderRadius: '12px',
          border: darkMode 
            ? '1px solid rgba(249, 115, 22, 0.2)'
            : '1px solid rgba(102, 126, 234, 0.2)',
        }}
      >
        <h3 style={{
          fontSize: '1em',
          fontWeight: 600,
          color: 'var(--text-primary)',
          marginBottom: '16px',
        }}>
          Top 10 Keywords
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
          gap: '12px',
        }}>
          {wordData.slice(0, 10).map((word, index) => (
            <motion.div
              key={word.value}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.05 }}
              onClick={() => onFilterByWord?.(word.value.toLowerCase())}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 14px',
                background: darkMode ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.5)',
                borderRadius: '8px',
                cursor: 'pointer',
                border: '1px solid var(--border-color)',
              }}
            >
              <span style={{
                fontSize: '0.9em',
                fontWeight: 500,
                color: 'var(--text-primary)',
              }}>
                {word.value}
              </span>
              <span style={{
                fontSize: '0.85em',
                fontWeight: 700,
                color: 'var(--accent-primary)',
              }}>
                {word.count}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
