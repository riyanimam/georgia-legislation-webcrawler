import { motion } from 'framer-motion'
import { Search, Filter as FilterIcon, X } from 'lucide-react'
import type { FilterState } from '../types'

interface FiltersProps {
  filters: FilterState
  setFilters: (filters: FilterState) => void
  onReset: () => void
  darkMode: boolean
}

const issueOptions = [
  { value: 'gun-control', label: 'Gun Control & Safety' },
  { value: 'lgbtqia', label: 'LGBTQIA+ Rights' },
  { value: 'healthcare', label: 'Healthcare & Welfare' },
  { value: 'education', label: 'Education & Schools' },
  { value: 'environment', label: 'Environment & Energy' },
  { value: 'criminal-justice', label: 'Criminal Justice' },
  { value: 'taxes', label: 'Taxes & Budget' },
  { value: 'immigration', label: 'Immigration' },
  { value: 'voting-rights', label: 'Voting Rights' },
  { value: 'reproductive', label: 'Reproductive Rights' },
  { value: 'workers-rights', label: 'Workers Rights' },
]

export default function Filters({ filters, setFilters, onReset, darkMode }: FiltersProps) {
  const updateFilter = (key: keyof FilterState, value: string | string[]) => {
    setFilters({ ...filters, [key]: value })
  }

  const toggleIssue = (issue: string) => {
    const newIssues = filters.issues.includes(issue)
      ? filters.issues.filter((i) => i !== issue)
      : [...filters.issues, issue]
    updateFilter('issues', newIssues)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.2 }}
      style={{
        background: darkMode ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.95)',
        borderRadius: '16px',
        padding: '32px',
        marginBottom: '32px',
        boxShadow: 'var(--shadow-md)',
        backdropFilter: 'blur(10px)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '24px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <FilterIcon size={24} color="var(--accent-primary)" />
          <h2 style={{ fontSize: '1.5em', fontWeight: 600, margin: 0, color: 'var(--text-primary)' }}>
            Filters & Search
          </h2>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onReset}
          style={{
            background: 'var(--accent-primary)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '10px 20px',
            cursor: 'pointer',
            fontSize: '0.95em',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <X size={16} />
          Reset Filters
        </motion.button>
      </div>

      <div style={{ display: 'grid', gap: '20px' }}>
        {/* Search Input */}
        <div style={{ position: 'relative' }}>
          <Search
            size={20}
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-tertiary)',
            }}
          />
          <input
            type="text"
            placeholder="Search by bill number, caption, sponsor, or committee..."
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            style={{
              width: '100%',
              padding: '12px 12px 12px 44px',
              border: '2px solid var(--border-color)',
              borderRadius: '12px',
              fontSize: '1em',
              background: 'var(--bg-primary)',
              color: 'var(--text-primary)',
              transition: 'all 0.05s ease',
            }}
          />
        </div>

        {/* Filter Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
          {/* Type Filter */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9em', fontWeight: 500, color: 'var(--text-secondary)' }}>
              Bill Type
            </label>
            <select
              value={filters.type}
              onChange={(e) => updateFilter('type', e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid var(--border-color)',
                borderRadius: '12px',
                fontSize: '1em',
                background: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                cursor: 'pointer',
              }}
            >
              <option value="">All Types</option>
              <option value="HB">House Bill (HB)</option>
              <option value="SB">Senate Bill (SB)</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9em', fontWeight: 500, color: 'var(--text-secondary)' }}>
              Sort By
            </label>
            <select
              value={filters.sortBy}
              onChange={(e) => updateFilter('sortBy', e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid var(--border-color)',
                borderRadius: '12px',
                fontSize: '1em',
                background: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                cursor: 'pointer',
              }}
            >
              <option value="date-desc">Latest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="bill-asc">Bill Number (A-Z)</option>
              <option value="bill-desc">Bill Number (Z-A)</option>
            </select>
          </div>

          {/* Sponsor Filter */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9em', fontWeight: 500, color: 'var(--text-secondary)' }}>
              Sponsor
            </label>
            <input
              type="text"
              placeholder="Filter by sponsor name..."
              value={filters.sponsor}
              onChange={(e) => updateFilter('sponsor', e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid var(--border-color)',
                borderRadius: '12px',
                fontSize: '1em',
                background: 'var(--bg-primary)',
                color: 'var(--text-primary)',
              }}
            />
          </div>

          {/* Status Filter */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9em', fontWeight: 500, color: 'var(--text-secondary)' }}>
              Status
            </label>
            <input
              type="text"
              placeholder="Filter by status..."
              value={filters.status}
              onChange={(e) => updateFilter('status', e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid var(--border-color)',
                borderRadius: '12px',
                fontSize: '1em',
                background: 'var(--bg-primary)',
                color: 'var(--text-primary)',
              }}
            />
          </div>
        </div>

        {/* Date Range Filters */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9em', fontWeight: 500, color: 'var(--text-secondary)' }}>
              Date From
            </label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => updateFilter('dateFrom', e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid var(--border-color)',
                borderRadius: '12px',
                fontSize: '1em',
                background: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                cursor: 'pointer',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9em', fontWeight: 500, color: 'var(--text-secondary)' }}>
              Date To
            </label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => updateFilter('dateTo', e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid var(--border-color)',
                borderRadius: '12px',
                fontSize: '1em',
                background: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                cursor: 'pointer',
              }}
            />
          </div>
        </div>

        {/* Summary Search */}
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9em', fontWeight: 500, color: 'var(--text-secondary)' }}>
            Search in Summary
          </label>
          <input
            type="text"
            placeholder="Search within bill summaries..."
            value={filters.summarySearch}
            onChange={(e) => updateFilter('summarySearch', e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              border: '2px solid var(--border-color)',
              borderRadius: '12px',
              fontSize: '1em',
              background: 'var(--bg-primary)',
              color: 'var(--text-primary)',
            }}
          />
        </div>

        {/* Issue Checkboxes */}
        <div>
          <label style={{ display: 'block', marginBottom: '12px', fontSize: '0.9em', fontWeight: 500, color: 'var(--text-secondary)' }}>
            Key Issues
          </label>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '12px',
            }}
          >
            {issueOptions.map((option) => (
              <motion.label
                key={option.value}
                whileHover={{ scale: 1.02 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px',
                  background: filters.issues.includes(option.value)
                    ? 'var(--accent-primary)'
                    : 'var(--bg-secondary)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.05s ease',
                  color: filters.issues.includes(option.value) ? 'white' : 'var(--text-primary)',
                }}
              >
                <input
                  type="checkbox"
                  checked={filters.issues.includes(option.value)}
                  onChange={() => toggleIssue(option.value)}
                  style={{ cursor: 'pointer' }}
                />
                <span style={{ fontSize: '0.9em' }}>{option.label}</span>
              </motion.label>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
