import { motion, AnimatePresence } from 'framer-motion'
import { X, User, FileText, CheckCircle, Clock, BarChart2 } from 'lucide-react'
import type { Bill } from '../types'
import { useMemo } from 'react'
import { getSponsorNames, getLatestStatus, getBillIssue } from '../utils'

interface RepresentativeProfileProps {
  sponsorName: string
  allBills: Bill[]
  isOpen: boolean
  onClose: () => void
  onSelectBill: (bill: Bill) => void
  darkMode: boolean
}

export default function RepresentativeProfile({
  sponsorName,
  allBills,
  isOpen,
  onClose,
  onSelectBill,
  darkMode
}: RepresentativeProfileProps) {
  const sponsorStats = useMemo(() => {
    // Find all bills sponsored by this person
    const sponsoredBills = allBills.filter(bill => {
      const sponsors = getSponsorNames(bill)
      return sponsors.some(s => s.toLowerCase() === sponsorName.toLowerCase())
    })

    // Categorize by status
    const statusCounts = {
      passed: 0,
      pending: 0,
      failed: 0,
      total: sponsoredBills.length
    }

    sponsoredBills.forEach(bill => {
      const status = getLatestStatus(bill).toLowerCase()
      if (status.includes('sign') || status.includes('enacted') || status.includes('pass') || status.includes('adopt')) {
        statusCounts.passed++
      } else if (status.includes('veto') || status.includes('failed') || status.includes('reject')) {
        statusCounts.failed++
      } else {
        statusCounts.pending++
      }
    })

    // Find most common issues
    const issueCount: Record<string, number> = {}
    sponsoredBills.forEach(bill => {
      const issue = getBillIssue(bill)
      if (issue) {
        issueCount[issue] = (issueCount[issue] || 0) + 1
      }
    })

    const topIssues = Object.entries(issueCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([issue, count]) => ({
        name: issue.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
        count
      }))

    // Co-sponsors
    const coSponsorCount: Record<string, number> = {}
    sponsoredBills.forEach(bill => {
      const sponsors = getSponsorNames(bill)
      sponsors.forEach(sponsor => {
        if (sponsor.toLowerCase() !== sponsorName.toLowerCase()) {
          coSponsorCount[sponsor] = (coSponsorCount[sponsor] || 0) + 1
        }
      })
    })

    const frequentCoSponsors = Object.entries(coSponsorCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }))

    return {
      bills: sponsoredBills,
      statusCounts,
      successRate: statusCounts.total > 0 
        ? ((statusCounts.passed / statusCounts.total) * 100).toFixed(1)
        : '0',
      topIssues,
      frequentCoSponsors
    }
  }, [sponsorName, allBills])

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
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
          zIndex: 1100,
          padding: '20px',
        }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            background: darkMode ? 'rgba(26, 26, 26, 0.98)' : 'rgba(255, 255, 255, 0.98)',
            borderRadius: '24px',
            width: '100%',
            maxWidth: '700px',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)',
            border: '1px solid var(--border-color)',
          }}
        >
          {/* Header */}
          <div style={{
            padding: '24px',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'sticky',
            top: 0,
            background: darkMode ? 'rgba(26, 26, 26, 0.95)' : 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            zIndex: 10,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: darkMode 
                  ? 'linear-gradient(135deg, #f97316, #fb923c)'
                  : 'linear-gradient(135deg, #667eea, #764ba2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <User size={30} color="white" />
              </div>
              <div>
                <h2 style={{
                  fontSize: '1.5em',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  margin: 0,
                }}>
                  {sponsorName}
                </h2>
                <p style={{
                  fontSize: '0.9em',
                  color: 'var(--text-tertiary)',
                  margin: 0,
                }}>
                  Georgia Legislature Representative
                </p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '8px',
                color: 'var(--text-tertiary)',
              }}
            >
              <X size={24} />
            </motion.button>
          </div>

          {/* Content */}
          <div style={{ padding: '24px' }}>
            {/* Stats Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '16px',
              marginBottom: '32px',
            }}>
              <StatCard
                icon={FileText}
                label="Total Bills"
                value={sponsorStats.statusCounts.total}
                color={darkMode ? '#60a5fa' : '#3b82f6'}
                darkMode={darkMode}
              />
              <StatCard
                icon={CheckCircle}
                label="Passed"
                value={sponsorStats.statusCounts.passed}
                color="#22c55e"
                darkMode={darkMode}
              />
              <StatCard
                icon={Clock}
                label="Pending"
                value={sponsorStats.statusCounts.pending}
                color="#fbbf24"
                darkMode={darkMode}
              />
              <StatCard
                icon={BarChart2}
                label="Success Rate"
                value={`${sponsorStats.successRate}%`}
                color={darkMode ? '#f97316' : '#8b5cf6'}
                darkMode={darkMode}
              />
            </div>

            {/* Top Issues */}
            {sponsorStats.topIssues.length > 0 && (
              <div style={{ marginBottom: '32px' }}>
                <h3 style={{
                  fontSize: '1.1em',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  marginBottom: '16px',
                }}>
                  Most Common Issue Areas
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {sponsorStats.topIssues.map((issue, i) => (
                    <span
                      key={i}
                      style={{
                        background: darkMode 
                          ? 'rgba(249, 115, 22, 0.15)' 
                          : 'rgba(102, 126, 234, 0.1)',
                        color: darkMode ? '#fb923c' : '#667eea',
                        padding: '8px 16px',
                        borderRadius: '20px',
                        fontSize: '0.9em',
                        fontWeight: 500,
                      }}
                    >
                      {issue.name} ({issue.count})
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Frequent Co-Sponsors */}
            {sponsorStats.frequentCoSponsors.length > 0 && (
              <div style={{ marginBottom: '32px' }}>
                <h3 style={{
                  fontSize: '1.1em',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  marginBottom: '16px',
                }}>
                  Frequent Co-Sponsors
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {sponsorStats.frequentCoSponsors.map((coSponsor, i) => (
                    <span
                      key={i}
                      style={{
                        background: darkMode 
                          ? 'rgba(255, 255, 255, 0.1)' 
                          : 'rgba(0, 0, 0, 0.05)',
                        color: 'var(--text-secondary)',
                        padding: '8px 16px',
                        borderRadius: '20px',
                        fontSize: '0.9em',
                        fontWeight: 500,
                        border: '1px solid var(--border-color)',
                      }}
                    >
                      {coSponsor.name} ({coSponsor.count} shared bills)
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Bills */}
            <div>
              <h3 style={{
                fontSize: '1.1em',
                fontWeight: 600,
                color: 'var(--text-primary)',
                marginBottom: '16px',
              }}>
                Sponsored Bills ({sponsorStats.bills.length})
              </h3>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                maxHeight: '300px',
                overflowY: 'auto',
              }}>
                {sponsorStats.bills.slice(0, 15).map((bill, i) => (
                  <motion.div
                    key={bill.doc_number}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    whileHover={{ scale: 1.02, x: 5 }}
                    onClick={() => {
                      onClose()
                      onSelectBill(bill)
                    }}
                    style={{
                      background: darkMode ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.03)',
                      borderRadius: '10px',
                      padding: '12px 16px',
                      cursor: 'pointer',
                      border: '1px solid var(--border-color)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                    }}
                  >
                    <span style={{
                      background: 'linear-gradient(135deg, #667eea, #764ba2)',
                      color: 'white',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '0.8em',
                      fontWeight: 600,
                      flexShrink: 0,
                    }}>
                      {bill.doc_number}
                    </span>
                    <span style={{
                      fontSize: '0.9em',
                      color: 'var(--text-primary)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      {bill.caption}
                    </span>
                  </motion.div>
                ))}
                {sponsorStats.bills.length > 15 && (
                  <p style={{
                    color: 'var(--text-tertiary)',
                    fontSize: '0.9em',
                    textAlign: 'center',
                    padding: '12px',
                  }}>
                    + {sponsorStats.bills.length - 15} more bills
                  </p>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

interface StatCardProps {
  icon: typeof FileText
  label: string
  value: number | string
  color: string
  darkMode: boolean
}

function StatCard({ icon: Icon, label, value, color, darkMode }: StatCardProps) {
  return (
    <div style={{
      background: darkMode ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.03)',
      borderRadius: '12px',
      padding: '16px',
      textAlign: 'center',
      border: '1px solid var(--border-color)',
    }}>
      <Icon size={24} color={color} style={{ marginBottom: '8px' }} />
      <div style={{
        fontSize: '1.5em',
        fontWeight: 700,
        color: color,
        marginBottom: '4px',
      }}>
        {value}
      </div>
      <div style={{
        fontSize: '0.8em',
        color: 'var(--text-tertiary)',
      }}>
        {label}
      </div>
    </div>
  )
}
