import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import { Building, Calendar, Download, Heart, RefreshCw, Sparkles, Users, X } from 'lucide-react'
import { useAISummary } from '../hooks/useAISummary'
import type { Translation } from '../i18n/translations'
import type { Bill } from '../types'
import { exportToCSV, exportToJSON, formatDate, getLatestStatus, getSponsorNames } from '../utils'
import { BillSimilarity } from './BillSimilarity'
import RelatedBills from './RelatedBills.tsx'
import ShareButtons from './ShareButtons'

interface BillModalProps {
  bill: Bill
  allBills: Bill[]
  onClose: () => void
  isFavorited: boolean
  onToggleFavorite: () => void
  onSelectBill: (bill: Bill) => void
  onViewRepresentative?: (sponsorName: string) => void
  darkMode: boolean
  t: Translation
}

export default function BillModal({
  bill,
  allBills,
  onClose,
  isFavorited,
  onToggleFavorite,
  onSelectBill,
  onViewRepresentative,
  darkMode,
  t,
}: BillModalProps) {
  const {
    summary: aiSummary,
    isLoading: isSummaryLoading,
    model: summaryModel,
    generatedAt: summaryGeneratedAt,
  } = useAISummary(bill)

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
          maxWidth: '800px',
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
            background: 'linear-gradient(135deg, #ff6b6b, #ee5a24, #ffa502)',
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
            aria-label="Close modal"
          >
            <X size={24} color="white" />
          </motion.button>

          <motion.h2
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            style={{
              fontSize: '2em',
              fontWeight: 700,
              marginBottom: '8px',
            }}
          >
            {bill.doc_number}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.9 }}
            transition={{ delay: 0.1 }}
            style={{
              fontSize: '1.1em',
              lineHeight: 1.5,
            }}
          >
            {bill.caption}
          </motion.p>
        </div>

        {/* Content */}
        <div style={{ padding: '32px' }}>
          {/* Action Buttons */}
          <div
            style={{
              display: 'flex',
              gap: '12px',
              marginBottom: '24px',
              flexWrap: 'wrap',
            }}
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onToggleFavorite}
              style={{
                background: isFavorited ? '#ef4444' : 'var(--border-color)',
                color: isFavorited ? 'white' : 'var(--text-primary)',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 20px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.95em',
                fontWeight: 500,
              }}
            >
              <Heart size={16} fill={isFavorited ? 'white' : 'none'} />
              {isFavorited ? t.removeFromFavorites : t.addToFavorites}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => exportToCSV(bill)}
              style={{
                background: 'var(--accent-primary)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 20px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.95em',
                fontWeight: 500,
              }}
            >
              <Download size={16} />
              Export CSV
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => exportToJSON(bill)}
              style={{
                background: 'var(--accent-secondary)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 20px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.95em',
                fontWeight: 500,
              }}
            >
              <Download size={16} />
              {t.exportJSON}
            </motion.button>
          </div>

          {/* Share Buttons */}
          <div style={{ marginBottom: '24px' }}>
            <ShareButtons bill={bill} darkMode={darkMode} />
          </div>

          {/* AI Summary Section */}
          {(aiSummary || isSummaryLoading) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: darkMode
                  ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(168, 85, 247, 0.1))'
                  : 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(168, 85, 247, 0.05))',
                border: darkMode
                  ? '1px solid rgba(139, 92, 246, 0.3)'
                  : '1px solid rgba(139, 92, 246, 0.2)',
                padding: '20px',
                borderRadius: '16px',
                marginBottom: '24px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: aiSummary ? '12px' : '0',
                }}
              >
                <Sparkles size={20} color="#8b5cf6" />
                <h3
                  style={{
                    fontSize: '1.1em',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    margin: 0,
                  }}
                >
                  {t.aiSummary || 'AI Summary'}
                </h3>
              </div>

              {isSummaryLoading && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    color: 'var(--text-secondary)',
                    padding: '8px 0',
                  }}
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    <RefreshCw size={18} color="#8b5cf6" />
                  </motion.div>
                  <span>{t.generatingSummary || 'Loading summary...'}</span>
                </div>
              )}

              {aiSummary && (
                <div>
                  <p
                    style={{
                      color: 'var(--text-secondary)',
                      lineHeight: 1.7,
                      margin: 0,
                      fontSize: '1em',
                    }}
                  >
                    {aiSummary}
                  </p>
                  {summaryModel && summaryGeneratedAt && (
                    <p
                      style={{
                        color: 'var(--text-tertiary)',
                        fontSize: '0.75em',
                        margin: '12px 0 0 0',
                      }}
                    >
                      Generated by {summaryModel} · {new Date(summaryGeneratedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* Primary Bill Information */}
          <div style={{ display: 'grid', gap: '24px', marginBottom: '32px' }}>
            <DetailSection
              icon={Users}
              title="Sponsors"
              content={
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {getSponsorNames(bill).map((sponsor, i) => (
                    <motion.span
                      key={i}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => onViewRepresentative?.(sponsor)}
                      style={{
                        background: darkMode
                          ? 'linear-gradient(135deg, rgba(249, 115, 22, 0.2), rgba(251, 146, 60, 0.2))'
                          : 'linear-gradient(135deg, rgba(249, 115, 22, 0.1), rgba(251, 146, 60, 0.1))',
                        color: darkMode ? '#fb923c' : '#f97316',
                        padding: '6px 14px',
                        borderRadius: '16px',
                        fontSize: '0.9em',
                        fontWeight: 500,
                        border: darkMode
                          ? '1px solid rgba(249, 115, 22, 0.3)'
                          : '1px solid rgba(249, 115, 22, 0.2)',
                        cursor: onViewRepresentative ? 'pointer' : 'default',
                      }}
                    >
                      {sponsor}
                    </motion.span>
                  ))}
                  {getSponsorNames(bill).length === 0 && 'N/A'}
                </div>
              }
              darkMode={darkMode}
            />

            <DetailSection
              icon={Building}
              title="Committees"
              content={
                Array.isArray(bill.committees)
                  ? bill.committees.join(', ')
                  : bill.committees || 'N/A'
              }
              darkMode={darkMode}
            />

            <DetailSection
              icon={Calendar}
              title={t.latestStatus}
              content={getLatestStatus(bill)}
              darkMode={darkMode}
            />

            {bill.first_reader_summary && (
              <DetailSection
                icon={null}
                title={t.modalSummary}
                content={bill.first_reader_summary}
                darkMode={darkMode}
              />
            )}

            {bill.status_history && bill.status_history.length > 0 && (
              <div>
                <h3
                  style={{
                    fontSize: '1.2em',
                    fontWeight: 600,
                    marginBottom: '12px',
                    color: 'var(--text-primary)',
                  }}
                >
                  {t.history}
                </h3>
                <div style={{ display: 'grid', gap: '12px' }}>
                  {bill.status_history.map((status, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      style={{
                        background: 'var(--bg-secondary)',
                        padding: '16px',
                        borderRadius: '12px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                        {status.status}
                      </span>
                      <span style={{ color: 'var(--text-tertiary)', fontSize: '0.9em' }}>
                        {formatDate(status.date)}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Related Content Section */}
          <div style={{
            borderTop: '1px solid var(--border-color)',
            paddingTop: '24px',
          }}>
            {/* Similar Bills */}
            <BillSimilarity
              currentBill={bill}
              allBills={allBills}
              onSelectBill={(newBill) => {
                onClose()
                setTimeout(() => onSelectBill(newBill), 100)
              }}
              darkMode={darkMode}
            />

            {/* Related Bills */}
            <RelatedBills
              currentBill={bill}
              allBills={allBills}
              darkMode={darkMode}
              onSelectBill={(newBill) => {
                onClose()
                setTimeout(() => onSelectBill(newBill), 100)
              }}
            />
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

interface DetailSectionProps {
  icon: LucideIcon | null
  title: string
  content: React.ReactNode
  darkMode: boolean
}

function DetailSection({ icon: Icon, title, content, darkMode }: DetailSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'var(--bg-secondary)',
        padding: '20px',
        borderRadius: '12px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '12px',
        }}
      >
        {Icon && <Icon size={20} color="var(--accent-primary)" />}
        <h3
          style={{
            fontSize: '1.1em',
            fontWeight: 600,
            color: 'var(--text-primary)',
            margin: 0,
          }}
        >
          {title}
        </h3>
      </div>
      <div
        style={{
          color: 'var(--text-secondary)',
          lineHeight: 1.6,
          margin: 0,
        }}
      >
        {content}
      </div>
    </motion.div>
  )
}
