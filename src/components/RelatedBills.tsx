import { motion } from 'framer-motion'
import { FileText, Tag } from 'lucide-react'
import type { Bill } from '../types'
import { useMemo } from 'react'
import { generateBillTags, getBillIssue, getSponsorNames } from '../utils'

interface RelatedBillsProps {
  currentBill: Bill
  allBills: Bill[]
  darkMode: boolean
  onSelectBill: (bill: Bill) => void
  maxBills?: number
}

export default function RelatedBills({ 
  currentBill, 
  allBills, 
  darkMode, 
  onSelectBill,
  maxBills = 5 
}: RelatedBillsProps) {
  const relatedBills = useMemo(() => {
    const currentTags = new Set(generateBillTags(currentBill))
    const currentSponsors = new Set(getSponsorNames(currentBill))
    const currentIssue = getBillIssue(currentBill)

    // Score each bill based on similarity
    const scoredBills = allBills
      .filter(bill => bill.doc_number !== currentBill.doc_number)
      .map(bill => {
        let score = 0
        const billTags = generateBillTags(bill)
        const billSponsors = getSponsorNames(bill)
        const billIssue = getBillIssue(bill)

        // Tag matches (2 points each)
        billTags.forEach(tag => {
          if (currentTags.has(tag)) score += 2
        })

        // Sponsor matches (3 points each - more significant)
        billSponsors.forEach(sponsor => {
          if (currentSponsors.has(sponsor)) score += 3
        })

        // Same issue area (4 points)
        if (currentIssue && billIssue === currentIssue) {
          score += 4
        }

        // Same bill type (1 point)
        const currentType = currentBill.doc_number.match(/^[A-Z]+/)?.[0]
        const billType = bill.doc_number.match(/^[A-Z]+/)?.[0]
        if (currentType === billType) {
          score += 1
        }

        return { bill, score }
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, maxBills)
      .map(item => ({ 
        ...item, 
        matchReasons: getMatchReasons(currentBill, item.bill, currentTags, currentSponsors, currentIssue)
      }))

    return scoredBills
  }, [currentBill, allBills, maxBills])

  if (relatedBills.length === 0) {
    return null
  }

  return (
    <div style={{
      marginTop: '32px',
      paddingTop: '24px',
      borderTop: '1px solid var(--border-color)',
    }}>
      <h3 style={{
        fontSize: '1.2em',
        fontWeight: 700,
        marginBottom: '16px',
        color: 'var(--text-primary)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}>
        <Tag size={20} />
        Related Bills You Might Like
      </h3>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}>
        {relatedBills.map(({ bill, matchReasons }, index) => (
          <motion.div
            key={bill.doc_number}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02, x: 5 }}
            onClick={() => onSelectBill(bill)}
            style={{
              background: darkMode ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.03)',
              borderRadius: '12px',
              padding: '16px',
              cursor: 'pointer',
              border: '1px solid var(--border-color)',
              transition: 'all 0.2s ease',
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                borderRadius: '8px',
                padding: '8px 12px',
                color: 'white',
                fontSize: '0.85em',
                fontWeight: 600,
                flexShrink: 0,
              }}>
                <FileText size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                {bill.doc_number}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  fontSize: '0.95em',
                  fontWeight: 500,
                  color: 'var(--text-primary)',
                  marginBottom: '8px',
                  lineHeight: 1.4,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}>
                  {bill.caption}
                </p>
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '6px',
                }}>
                  {matchReasons.map((reason, i) => (
                    <span
                      key={i}
                      style={{
                        fontSize: '0.75em',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        background: darkMode 
                          ? 'rgba(249, 115, 22, 0.15)' 
                          : 'rgba(102, 126, 234, 0.1)',
                        color: darkMode ? '#fb923c' : '#667eea',
                      }}
                    >
                      {reason}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function getMatchReasons(
  _currentBill: Bill, 
  otherBill: Bill,
  currentTags: Set<string>,
  currentSponsors: Set<string>,
  currentIssue: string | null
): string[] {
  const reasons: string[] = []
  
  const billSponsors = getSponsorNames(otherBill)
  const sharedSponsors = billSponsors.filter(s => currentSponsors.has(s))
  if (sharedSponsors.length > 0) {
    reasons.push(`Shared sponsor: ${sharedSponsors[0]}`)
  }

  const billIssue = getBillIssue(otherBill)
  if (currentIssue && billIssue === currentIssue) {
    const formatted = currentIssue.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    reasons.push(`Same issue: ${formatted}`)
  }

  const billTags = generateBillTags(otherBill)
  const sharedTags = billTags.filter(t => currentTags.has(t))
  if (sharedTags.length > 0 && reasons.length < 3) {
    reasons.push(`Similar topic: ${sharedTags[0]}`)
  }

  return reasons.slice(0, 3)
}
