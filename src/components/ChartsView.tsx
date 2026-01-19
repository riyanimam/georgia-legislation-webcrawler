import { motion } from 'framer-motion'
import type { Bill } from '../types'
import type { Translation } from '../i18n/translations'
import { useMemo, useState } from 'react'
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { getBillIssue, getSponsorNames } from '../utils'
import { Download } from 'lucide-react'

interface ChartsViewProps {
  bills: Bill[]
  darkMode: boolean
  t: Translation
}

export function ChartsView({ bills, darkMode }: ChartsViewProps) {
  const [activeChart, setActiveChart] = useState<'status' | 'sponsors' | 'issues' | 'activity'>('status')

  // Bills by Status (Pie Chart)
  const statusData = useMemo(() => {
    const statusCount: Record<string, number> = {}
    
    bills.forEach(bill => {
      if (!bill.status_history || bill.status_history.length === 0) {
        statusCount['Unknown'] = (statusCount['Unknown'] || 0) + 1
        return
      }
      
      const latestStatus = bill.status_history[bill.status_history.length - 1].status
      // Simplify status names
      let category = 'Other'
      const statusLower = latestStatus.toLowerCase()
      
      if (statusLower.includes('introduc') || statusLower.includes('filed')) category = 'Introduced'
      else if (statusLower.includes('committee')) category = 'In Committee'
      else if (statusLower.includes('passed') || statusLower.includes('adopted')) category = 'Passed'
      else if (statusLower.includes('sign') || statusLower.includes('enacted')) category = 'Signed/Enacted'
      else if (statusLower.includes('veto') || statusLower.includes('failed')) category = 'Vetoed/Failed'
      
      statusCount[category] = (statusCount[category] || 0) + 1
    })
    
    return Object.entries(statusCount).map(([name, value]) => ({ name, value }))
  }, [bills])

  // Top Sponsors (Bar Chart)
  const sponsorsData = useMemo(() => {
    const sponsorCount: Record<string, number> = {}
    
    bills.forEach(bill => {
      const sponsors = getSponsorNames(bill)
      sponsors.forEach(sponsor => {
        sponsorCount[sponsor] = (sponsorCount[sponsor] || 0) + 1
      })
    })
    
    return Object.entries(sponsorCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }))
  }, [bills])

  // Issue Areas (Bar Chart)
  const issuesData = useMemo(() => {
    const issueCount: Record<string, number> = {}
    
    bills.forEach(bill => {
      const issue = getBillIssue(bill)
      if (issue) {
        const formatted = issue.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
        issueCount[formatted] = (issueCount[formatted] || 0) + 1
      } else {
        issueCount['General'] = (issueCount['General'] || 0) + 1
      }
    })
    
    return Object.entries(issueCount)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }))
  }, [bills])

  // Activity Over Time (Line Chart)
  const activityData = useMemo(() => {
    const monthCount: Record<string, number> = {}
    
    bills.forEach(bill => {
      if (bill.status_history && bill.status_history.length > 0) {
        bill.status_history.forEach(history => {
          if (history.date) {
            const date = new Date(history.date)
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
            monthCount[monthKey] = (monthCount[monthKey] || 0) + 1
          }
        })
      }
    })
    
    return Object.entries(monthCount)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-12) // Last 12 months
      .map(([month, count]) => ({ month, count }))
  }, [bills])

  const COLORS = darkMode 
    ? ['#f97316', '#fb923c', '#fdba74', '#fcd34d', '#60a5fa', '#a78bfa', '#34d399', '#f472b6']
    : ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444', '#ec4899', '#14b8a6', '#f97316']

  const exportChart = (chartName: string) => {
    // In a real implementation, you'd use html2canvas or similar
    alert(`Exporting ${chartName} chart... (Feature coming soon!)`)
  }

  return (
    <div style={{
      background: darkMode ? 'rgba(36, 36, 36, 0.8)' : 'rgba(255, 255, 255, 0.9)',
      borderRadius: '16px',
      padding: '32px',
      backdropFilter: 'blur(10px)',
      border: '1px solid var(--border-color)',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
      }}>
        <div>
          <h2 style={{ 
            marginBottom: '8px', 
            color: 'var(--text-primary)',
            fontSize: '1.8em',
            fontWeight: 700
          }}>
            Interactive Charts
          </h2>
          <p style={{ 
            color: 'var(--text-secondary)', 
            lineHeight: 1.6
          }}>
            Visual analytics and statistics for legislative data
          </p>
        </div>
      </div>

      {/* Chart Selector */}
      <div style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '32px',
        flexWrap: 'wrap',
      }}>
        {[
          { id: 'status', label: 'Bills by Status' },
          { id: 'sponsors', label: 'Top Sponsors' },
          { id: 'issues', label: 'Issue Areas' },
          { id: 'activity', label: 'Activity Timeline' },
        ].map(chart => (
          <motion.button
            key={chart.id}
            onClick={() => setActiveChart(chart.id as typeof activeChart)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              border: 'none',
              background: activeChart === chart.id
                ? darkMode 
                  ? 'linear-gradient(135deg, #f97316, #fb923c)'
                  : 'linear-gradient(135deg, #667eea, #764ba2)'
                : darkMode 
                  ? 'rgba(255, 255, 255, 0.1)'
                  : 'rgba(0, 0, 0, 0.05)',
              color: activeChart === chart.id ? '#ffffff' : 'var(--text-secondary)',
              fontWeight: activeChart === chart.id ? 600 : 500,
              fontSize: '0.9em',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            {chart.label}
          </motion.button>
        ))}
      </div>

      {/* Chart Container */}
      <motion.div
        key={activeChart}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        style={{
          background: darkMode ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.02)',
          borderRadius: '12px',
          padding: '24px',
          minHeight: '400px',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
        }}>
          <h3 style={{
            fontSize: '1.2em',
            fontWeight: 600,
            color: 'var(--text-primary)',
          }}>
            {activeChart === 'status' && 'Bills by Status Distribution'}
            {activeChart === 'sponsors' && 'Top 10 Sponsors by Bill Count'}
            {activeChart === 'issues' && 'Bills by Issue Area'}
            {activeChart === 'activity' && 'Legislative Activity (Last 12 Months)'}
          </h3>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => exportChart(activeChart)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              background: darkMode 
                ? 'rgba(255, 255, 255, 0.1)'
                : 'rgba(0, 0, 0, 0.05)',
              color: 'var(--text-secondary)',
              fontSize: '0.85em',
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            <Download size={16} />
            Export
          </motion.button>
        </div>

        <ResponsiveContainer width="100%" height={400}>
          {activeChart === 'status' && (
            <PieChart>
              <Pie
                data={statusData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={120}
                label={(entry) => `${entry.name} (${entry.value})`}
                labelLine={true}
              >
                {statusData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  background: darkMode ? 'rgba(36, 36, 36, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                }}
              />
              <Legend />
            </PieChart>
          )}

          {activeChart === 'sponsors' && (
            <BarChart data={sponsorsData}>
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
              <XAxis 
                dataKey="name" 
                angle={-45}
                textAnchor="end"
                height={120}
                tick={{ fill: darkMode ? '#d1d5db' : '#6b7280', fontSize: 12 }}
              />
              <YAxis tick={{ fill: darkMode ? '#d1d5db' : '#6b7280' }} />
              <Tooltip 
                contentStyle={{
                  background: darkMode ? 'rgba(36, 36, 36, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                }}
              />
              <Bar dataKey="count" fill={darkMode ? '#f97316' : '#3b82f6'} radius={[8, 8, 0, 0]} />
            </BarChart>
          )}

          {activeChart === 'issues' && (
            <BarChart data={issuesData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
              <XAxis type="number" tick={{ fill: darkMode ? '#d1d5db' : '#6b7280' }} />
              <YAxis 
                type="category" 
                dataKey="name" 
                width={150}
                tick={{ fill: darkMode ? '#d1d5db' : '#6b7280', fontSize: 12 }}
              />
              <Tooltip 
                contentStyle={{
                  background: darkMode ? 'rgba(36, 36, 36, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                }}
              />
              <Bar dataKey="count" fill={darkMode ? '#fb923c' : '#8b5cf6'} radius={[0, 8, 8, 0]} />
            </BarChart>
          )}

          {activeChart === 'activity' && (
            <LineChart data={activityData}>
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
              <XAxis 
                dataKey="month" 
                tick={{ fill: darkMode ? '#d1d5db' : '#6b7280', fontSize: 12 }}
              />
              <YAxis tick={{ fill: darkMode ? '#d1d5db' : '#6b7280' }} />
              <Tooltip 
                contentStyle={{
                  background: darkMode ? 'rgba(36, 36, 36, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke={darkMode ? '#f97316' : '#3b82f6'} 
                strokeWidth={3}
                dot={{ fill: darkMode ? '#f97316' : '#3b82f6', r: 4 }}
                name="Activity Count"
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </motion.div>
    </div>
  )
}
