import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Users, Tag, FileText } from 'lucide-react'
import { useState, useMemo } from 'react'
import type { Bill } from '../types'
import { generateBillTags } from '../utils'

interface BillSimilarityProps {
  currentBill: Bill
  allBills: Bill[]
  onSelectBill: (bill: Bill) => void
  darkMode: boolean
}

interface SimilarBill {
  bill: Bill
  score: number
  reasons: string[]
}

export function BillSimilarity({ currentBill, allBills, onSelectBill, darkMode }: BillSimilarityProps) {
  const [expanded, setExpanded] = useState(false)

  // Calculate similarity scores
  const similarBills = useMemo(() => {
    const results: SimilarBill[] = []

    for (const bill of allBills) {
      if (bill.doc_number === currentBill.doc_number) continue

      let score = 0
      const reasons: string[] = []

      // Compare sponsors (highest weight)
      const currentSponsors = Array.isArray(currentBill.sponsors) 
        ? currentBill.sponsors 
        : [currentBill.sponsors]
      const billSponsors = Array.isArray(bill.sponsors) 
        ? bill.sponsors 
        : [bill.sponsors]
      
      const sharedSponsors = currentSponsors.filter(s => billSponsors.includes(s))
      if (sharedSponsors.length > 0) {
        score += sharedSponsors.length * 40
        reasons.push(`Shared sponsor${sharedSponsors.length > 1 ? 's' : ''}: ${sharedSponsors[0]}`)
      }

      // Compare tags
      const currentTags = generateBillTags(currentBill)
      const billTags = generateBillTags(bill)
      const sharedTags = currentTags.filter(tag => billTags.includes(tag))
      if (sharedTags.length > 0) {
        score += sharedTags.length * 20
        reasons.push(`${sharedTags.length} shared tag${sharedTags.length > 1 ? 's' : ''}`)
      }

      // Compare caption text (simple word matching)
      const currentWords = new Set(
        currentBill.caption
          .toLowerCase()
          .split(/\W+/)
          .filter(w => w.length > 4) // Only significant words
      )
      const billWords = bill.caption
        .toLowerCase()
        .split(/\W+/)
        .filter(w => w.length > 4)
      
      const sharedWords = billWords.filter(w => currentWords.has(w))
      if (sharedWords.length > 3) {
        score += Math.min(sharedWords.length * 5, 30)
        reasons.push('Similar topics')
      }

      // Compare committees
      const currentCommittees = Array.isArray(currentBill.committees)
        ? currentBill.committees
        : [currentBill.committees]
      const billCommittees = Array.isArray(bill.committees)
        ? bill.committees
        : [bill.committees]
      
      const sharedCommittees = currentCommittees.filter(c => billCommittees.includes(c))
      if (sharedCommittees.length > 0) {
        score += sharedCommittees.length * 15
        reasons.push(`Same committee: ${sharedCommittees[0]}`)
      }

      // Compare status
      if (currentBill.status_history[0]?.status === bill.status_history[0]?.status) {
        score += 5
      }

      if (score > 20) {
        results.push({ bill, score, reasons })
      }
    }

    return results.sort((a, b) => b.score - a.score).slice(0, 5)
  }, [currentBill, allBills])

  if (similarBills.length === 0) return null

  return (
    <div style={{ marginTop: '24px' }}>
      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={() => setExpanded(!expanded)}
        style={{
          width: '100%',
          padding: '16px',
          background: darkMode 
            ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(99, 102, 241, 0.1))'
            : 'linear-gradient(135deg, rgba(139, 92, 246, 0.12), rgba(99, 102, 241, 0.08))',
          border: darkMode 
            ? '2px solid rgba(139, 92, 246, 0.3)' 
            : '2px solid rgba(139, 92, 246, 0.25)',
          borderRadius: '12px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          color: 'var(--text-primary)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
              borderRadius: '10px',
              padding: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Sparkles size={22} color="white" strokeWidth={2.5} />
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontWeight: 600, fontSize: '1.1em', marginBottom: '4px' }}>
              Similar Bills Found
            </div>
            <div style={{ fontSize: '0.85em', color: 'var(--text-secondary)' }}>
              {similarBills.length} bill{similarBills.length > 1 ? 's' : ''} with related content
            </div>
          </div>
        </div>
        <motion.div
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          style={{ color: darkMode ? '#a78bfa' : '#8b5cf6' }}
        >
          ▼
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {similarBills.map(({ bill, score, reasons }) => (
                <motion.div
                  key={bill.doc_number}
                  whileHover={{ scale: 1.01, x: 4 }}
                  onClick={() => onSelectBill(bill)}
                  style={{
                    background: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
                    border: darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)',
                    borderRadius: '12px',
                    padding: '16px',
                    cursor: 'pointer',
                    position: 'relative',
                  }}
                >
                  {/* Similarity Score Badge */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      background: 
                        score > 70 
                          ? 'linear-gradient(135deg, #10b981, #059669)'
                          : score > 40
                          ? 'linear-gradient(135deg, #f59e0b, #d97706)'
                          : 'linear-gradient(135deg, #6366f1, #4f46e5)',
                      color: 'white',
                      padding: '4px 10px',
                      borderRadius: '20px',
                      fontSize: '0.75em',
                      fontWeight: 700,
                    }}
                  >
                    {Math.round(score)}% match
                  </div>

                  {/* Bill Number */}
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 12px',
                      background: 'var(--accent-primary)',
                      color: 'white',
                      borderRadius: '8px',
                      fontSize: '0.9em',
                      fontWeight: 600,
                      marginBottom: '12px',
                    }}
                  >
                    <FileText size={14} />
                    {bill.doc_number}
                  </div>

                  {/* Caption */}
                  <p
                    style={{
                      margin: '0 0 12px 0',
                      color: 'var(--text-primary)',
                      fontSize: '0.95em',
                      lineHeight: 1.5,
                      paddingRight: '80px', // Space for badge
                    }}
                  >
                    {bill.caption}
                  </p>

                  {/* Similarity Reasons */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {reasons.map((reason, i) => (
                      <div
                        key={i}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '4px 10px',
                          background: darkMode ? 'rgba(139, 92, 246, 0.15)' : 'rgba(139, 92, 246, 0.12)',
                          borderRadius: '6px',
                          fontSize: '0.8em',
                          color: darkMode ? '#c4b5fd' : '#7c3aed',
                        }}
                      >
                        {reason.includes('sponsor') ? (
                          <Users size={12} />
                        ) : reason.includes('tag') ? (
                          <Tag size={12} />
                        ) : (
                          <Sparkles size={12} />
                        )}
                        {reason}
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
