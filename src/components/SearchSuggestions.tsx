import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Clock, TrendingUp, X } from 'lucide-react'
import type { Bill } from '../types'

interface SearchSuggestionsProps {
  bills: Bill[]
  value: string
  onChange: (value: string) => void
  darkMode: boolean
  onSelectSuggestion: (suggestion: string) => void
}

export default function SearchSuggestions({
  bills,
  value,
  onChange,
  darkMode,
  onSelectSuggestion,
}: SearchSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Load recent searches from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('georgia-bills-recent-searches')
    if (stored) {
      setRecentSearches(JSON.parse(stored))
    }
  }, [])

  // Generate suggestions based on input
  useEffect(() => {
    if (value.length < 2) {
      setSuggestions([])
      return
    }

    const searchLower = value.toLowerCase()
    const matches = new Set<string>()

    // Search in bill numbers
    bills.forEach(bill => {
      if (bill.doc_number.toLowerCase().includes(searchLower)) {
        matches.add(bill.doc_number)
      }
    })

    // Search in captions (limit to prevent too many results)
    bills.forEach(bill => {
      if (matches.size < 10 && bill.caption.toLowerCase().includes(searchLower)) {
        // Extract relevant portion of caption
        const words = bill.caption.split(' ')
        const relevantWords = words.slice(0, 5).join(' ')
        matches.add(relevantWords)
      }
    })

    // Search in sponsors
    bills.forEach(bill => {
      if (matches.size < 15) {
        const sponsors = Array.isArray(bill.sponsors) ? bill.sponsors : [bill.sponsors]
        sponsors.forEach(sponsor => {
          if (sponsor && sponsor.toLowerCase().includes(searchLower)) {
            matches.add(sponsor)
          }
        })
      }
    })

    setSuggestions(Array.from(matches).slice(0, 8))
  }, [value, bills])

  // Save search to recent searches
  const saveRecentSearch = (search: string) => {
    if (!search.trim()) return
    
    const updated = [search, ...recentSearches.filter(s => s !== search)].slice(0, 10)
    setRecentSearches(updated)
    localStorage.setItem('georgia-bills-recent-searches', JSON.stringify(updated))
  }

  // Handle suggestion selection
  const handleSelect = (suggestion: string) => {
    onChange(suggestion)
    onSelectSuggestion(suggestion)
    saveRecentSearch(suggestion)
    setShowDropdown(false)
    setSelectedIndex(-1)
  }

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const allItems = [...(showDropdown && suggestions.length > 0 ? suggestions : []), ...recentSearches]
    
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => (prev < allItems.length - 1 ? prev + 1 : prev))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1))
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault()
      handleSelect(allItems[selectedIndex])
    } else if (e.key === 'Escape') {
      setShowDropdown(false)
      setSelectedIndex(-1)
    }
  }

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const clearRecentSearch = (search: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const updated = recentSearches.filter(s => s !== search)
    setRecentSearches(updated)
    localStorage.setItem('georgia-bills-recent-searches', JSON.stringify(updated))
  }

  const hasContent = (suggestions.length > 0 && value.length >= 2) || recentSearches.length > 0

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <div style={{ position: 'relative' }}>
        <Search
          size={18}
          style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-tertiary)',
            pointerEvents: 'none',
          }}
        />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value)
            setShowDropdown(true)
          }}
          onFocus={() => setShowDropdown(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search bills, sponsors, or topics..."
          style={{
            width: '100%',
            padding: '12px 12px 12px 40px',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            background: 'var(--bg-input)',
            color: 'var(--text-primary)',
            fontSize: '1em',
          }}
        />
      </div>

      <AnimatePresence>
        {showDropdown && hasContent && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'absolute',
              top: 'calc(100% + 4px)',
              left: 0,
              right: 0,
              background: darkMode ? 'rgba(30, 30, 30, 0.98)' : 'rgba(255, 255, 255, 0.98)',
              border: darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)',
              borderRadius: '12px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
              backdropFilter: 'blur(10px)',
              zIndex: 1000,
              maxHeight: '400px',
              overflowY: 'auto',
            }}
          >
            {/* Suggestions from search */}
            {suggestions.length > 0 && value.length >= 2 && (
              <div style={{ padding: '8px 0' }}>
                <div
                  style={{
                    padding: '8px 16px',
                    fontSize: '0.75em',
                    fontWeight: 600,
                    color: 'var(--text-tertiary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <TrendingUp size={14} />
                  Suggestions
                </div>
                {suggestions.map((suggestion, index) => (
                  <motion.button
                    key={suggestion}
                    whileHover={{ backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)' }}
                    onClick={() => handleSelect(suggestion)}
                    style={{
                      width: '100%',
                      padding: '10px 16px',
                      background: selectedIndex === index
                        ? darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'
                        : 'transparent',
                      border: 'none',
                      textAlign: 'left',
                      cursor: 'pointer',
                      color: 'var(--text-primary)',
                      fontSize: '0.95em',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                    }}
                  >
                    <Search size={14} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
                    <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {suggestion}
                    </span>
                  </motion.button>
                ))}
              </div>
            )}

            {/* Divider */}
            {suggestions.length > 0 && recentSearches.length > 0 && value.length >= 2 && (
              <div style={{ height: '1px', background: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)', margin: '4px 0' }} />
            )}

            {/* Recent searches */}
            {recentSearches.length > 0 && (
              <div style={{ padding: '8px 0' }}>
                <div
                  style={{
                    padding: '8px 16px',
                    fontSize: '0.75em',
                    fontWeight: 600,
                    color: 'var(--text-tertiary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Clock size={14} />
                  Recent Searches
                </div>
                {recentSearches.slice(0, 5).map((search, index) => {
                  const adjustedIndex = suggestions.length > 0 && value.length >= 2 ? suggestions.length + index : index
                  return (
                    <motion.button
                      key={search}
                      whileHover={{ backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)' }}
                      onClick={() => handleSelect(search)}
                      style={{
                        width: '100%',
                        padding: '10px 16px',
                        background: selectedIndex === adjustedIndex
                          ? darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'
                          : 'transparent',
                        border: 'none',
                        textAlign: 'left',
                        cursor: 'pointer',
                        color: 'var(--text-secondary)',
                        fontSize: '0.95em',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                      }}
                    >
                      <Clock size={14} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
                      <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {search}
                      </span>
                      <motion.div
                        whileHover={{ scale: 1.2 }}
                        onClick={(e) => clearRecentSearch(search, e)}
                        style={{
                          padding: '4px',
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <X size={14} style={{ color: 'var(--text-tertiary)' }} />
                      </motion.div>
                    </motion.button>
                  )
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
