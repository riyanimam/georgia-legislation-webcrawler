import { motion, AnimatePresence } from 'framer-motion'
import { X, Download, GitCompare, Calendar, Users, FileText } from 'lucide-react'
import { useState } from 'react'
import type { Bill } from '../types'

interface BillComparisonProps {
  bills: Bill[]
  isOpen: boolean
  onClose: () => void
  darkMode: boolean
}

export function BillComparison({ bills, isOpen, onClose, darkMode }: BillComparisonProps) {
  const [syncScroll, setSyncScroll] = useState(true)

  const handleScroll = (e: React.UIEvent<HTMLDivElement>, index: number) => {
    if (!syncScroll) return
    
    const scrollTop = e.currentTarget.scrollTop
    const allColumns = document.querySelectorAll('.comparison-column')
    allColumns.forEach((col, i) => {
      if (i !== index && col instanceof HTMLElement) {
        col.scrollTop = scrollTop
      }
    })
  }

  const exportComparison = () => {
    const comparisonData = {
      comparedAt: new Date().toISOString(),
      bills: bills.map(bill => ({
        number: bill.doc_number,
        caption: bill.caption,
        sponsors: bill.sponsors,
        status: bill.status_history?.[0] || 'Unknown',
        summary: bill.summary,
      })),
    }

    const dataStr = JSON.stringify(comparisonData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `bill-comparison-${Date.now()}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const getLatestStatus = (bill: Bill): string => {
    if (!bill.status_history || bill.status_history.length === 0) return 'Unknown'
    return bill.status_history[0].status
  }

  const getStatusDate = (bill: Bill): string => {
    if (!bill.status_history || bill.status_history.length === 0) return 'Unknown'
    return new Date(bill.status_history[0].date).toLocaleDateString()
  }

  const findDifferences = () => {
    if (bills.length < 2) return []

    const differences: string[] = []

    // Compare sponsors
    const sponsors = bills.map(b => Array.isArray(b.sponsors) ? b.sponsors : [b.sponsors])
    const allSame = sponsors.every((s, i) => i === 0 || JSON.stringify(s) === JSON.stringify(sponsors[0]))
    if (!allSame) differences.push('Sponsors differ')

    // Compare status
    const statuses = bills.map(b => getLatestStatus(b))
    if (new Set(statuses).size > 1) differences.push('Different legislative statuses')

    return differences
  }

  const differences = findDifferences()

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            padding: '20px',
          }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: darkMode ? '#1e293b' : 'white',
              borderRadius: '20px',
              width: '95%',
              maxWidth: '1400px',
              height: '90vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: '24px',
                borderBottom: darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '16px',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <GitCompare size={28} color="var(--accent-primary)" />
                  <h2 style={{ margin: 0, fontSize: '1.8em', color: 'var(--text-primary)' }}>
                    Bill Comparison
                  </h2>
                </div>
                {differences.length > 0 && (
                  <div
                    style={{
                      fontSize: '0.9em',
                      color: darkMode ? '#f59e0b' : '#d97706',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <span>⚠️ {differences.length} key difference{differences.length > 1 ? 's' : ''} found</span>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '0.9em',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={syncScroll}
                    onChange={(e) => setSyncScroll(e.target.checked)}
                    style={{ cursor: 'pointer' }}
                  />
                  Sync Scroll
                </label>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={exportComparison}
                  style={{
                    padding: '10px 16px',
                    background: darkMode ? 'rgba(34, 197, 94, 0.2)' : 'rgba(34, 197, 94, 0.1)',
                    color: darkMode ? '#4ade80' : '#16a34a',
                    border: darkMode ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(34, 197, 94, 0.2)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '0.9em',
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Download size={16} />
                  Export
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '8px',
                    color: 'var(--text-secondary)',
                  }}
                  aria-label="Close comparison"
                >
                  <X size={24} />
                </motion.button>
              </div>
            </div>

            {/* Key Differences Banner */}
            {differences.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  padding: '16px 24px',
                  background: darkMode ? 'rgba(245, 158, 11, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                  borderBottom: darkMode ? '1px solid rgba(245, 158, 11, 0.2)' : '1px solid rgba(245, 158, 11, 0.2)',
                }}
              >
                <strong style={{ color: darkMode ? '#fbbf24' : '#d97706', marginRight: '12px' }}>
                  Key Differences:
                </strong>
                <span style={{ color: 'var(--text-secondary)' }}>
                  {differences.join(' • ')}
                </span>
              </motion.div>
            )}

            {/* Comparison Grid */}
            <div
              style={{
                flex: 1,
                display: 'grid',
                gridTemplateColumns: `repeat(${bills.length}, 1fr)`,
                overflow: 'hidden',
              }}
            >
              {bills.map((bill, index) => (
                <div
                  key={bill.doc_number}
                  className="comparison-column"
                  onScroll={(e) => handleScroll(e, index)}
                  style={{
                    overflowY: 'auto',
                    padding: '24px',
                    borderRight: index < bills.length - 1
                      ? darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)'
                      : 'none',
                  }}
                >
                  {/* Bill Number */}
                  <div
                    style={{
                      background: 'var(--accent-primary)',
                      color: 'white',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      marginBottom: '20px',
                      textAlign: 'center',
                      fontWeight: 700,
                      fontSize: '1.2em',
                    }}
                  >
                    {bill.doc_number}
                  </div>

                  {/* Caption */}
                  <section style={{ marginBottom: '24px' }}>
                    <h3
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '1em',
                        fontWeight: 600,
                        color: 'var(--text-secondary)',
                        marginBottom: '12px',
                      }}
                    >
                      <FileText size={18} />
                      Caption
                    </h3>
                    <p style={{ color: 'var(--text-primary)', lineHeight: 1.6, fontSize: '0.95em' }}>
                      {bill.caption}
                    </p>
                  </section>

                  {/* Sponsors */}
                  <section style={{ marginBottom: '24px' }}>
                    <h3
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '1em',
                        fontWeight: 600,
                        color: 'var(--text-secondary)',
                        marginBottom: '12px',
                      }}
                    >
                      <Users size={18} />
                      Sponsor{Array.isArray(bill.sponsors) && bill.sponsors.length > 1 ? 's' : ''}
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {Array.isArray(bill.sponsors) ? (
                        bill.sponsors.map((sponsor, i) => (
                          <div
                            key={i}
                            style={{
                              padding: '8px 12px',
                              background: darkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.08)',
                              borderRadius: '8px',
                              color: 'var(--text-primary)',
                              fontSize: '0.9em',
                            }}
                          >
                            {sponsor}
                          </div>
                        ))
                      ) : (
                        <div
                          style={{
                            padding: '8px 12px',
                            background: darkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.08)',
                            borderRadius: '8px',
                            color: 'var(--text-primary)',
                            fontSize: '0.9em',
                          }}
                        >
                          {bill.sponsors}
                        </div>
                      )}
                    </div>
                  </section>

                  {/* Status */}
                  <section style={{ marginBottom: '24px' }}>
                    <h3
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '1em',
                        fontWeight: 600,
                        color: 'var(--text-secondary)',
                        marginBottom: '12px',
                      }}
                    >
                      <Calendar size={18} />
                      Current Status
                    </h3>
                    <div
                      style={{
                        padding: '12px',
                        background: darkMode ? 'rgba(34, 197, 94, 0.1)' : 'rgba(34, 197, 94, 0.08)',
                        borderRadius: '8px',
                        marginBottom: '8px',
                      }}
                    >
                      <div style={{ color: 'var(--text-primary)', fontWeight: 500, marginBottom: '4px' }}>
                        {getLatestStatus(bill)}
                      </div>
                      <div style={{ fontSize: '0.85em', color: 'var(--text-secondary)' }}>
                        {getStatusDate(bill)}
                      </div>
                    </div>
                  </section>

                  {/* Summary */}
                  {bill.summary && (
                    <section style={{ marginBottom: '24px' }}>
                      <h3
                        style={{
                          fontSize: '1em',
                          fontWeight: 600,
                          color: 'var(--text-secondary)',
                          marginBottom: '12px',
                        }}
                      >
                        Summary
                      </h3>
                      <div
                        style={{
                          padding: '16px',
                          background: darkMode ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                          borderRadius: '8px',
                          color: 'var(--text-secondary)',
                          lineHeight: 1.7,
                          fontSize: '0.9em',
                        }}
                      >
                        {bill.summary}
                      </div>
                    </section>
                  )}

                  {/* Status History */}
                  {bill.status_history && bill.status_history.length > 1 && (
                    <section style={{ marginBottom: '24px' }}>
                      <h3
                        style={{
                          fontSize: '1em',
                          fontWeight: 600,
                          color: 'var(--text-secondary)',
                          marginBottom: '12px',
                        }}
                      >
                        Legislative History
                      </h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {bill.status_history.slice(0, 5).map((statusItem, i) => (
                          <div
                            key={i}
                            style={{
                              padding: '10px 12px',
                              background: darkMode ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                              borderLeft: '3px solid var(--accent-primary)',
                              borderRadius: '4px',
                              fontSize: '0.85em',
                            }}
                          >
                            <div style={{ color: 'var(--text-primary)', marginBottom: '4px' }}>
                              {statusItem.status}
                            </div>
                            <div style={{ fontSize: '0.9em', color: 'var(--text-secondary)' }}>
                              {new Date(statusItem.date).toLocaleDateString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
