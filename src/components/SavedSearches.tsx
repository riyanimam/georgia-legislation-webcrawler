import { motion, AnimatePresence } from 'framer-motion'
import { Save, X, Download, Upload, Trash2, Search, Check } from 'lucide-react'
import { useState, useEffect } from 'react'

interface SavedSearch {
  id: string
  name: string
  filters: {
    searchQuery: string
    billType: string
    selectedSponsor: string
    selectedStatus: string
    dateFilter: { start: string; end: string }
    issueFilter: string
  }
  timestamp: number
}

interface SavedSearchesProps {
  currentFilters: {
    searchQuery: string
    billType: string
    selectedSponsor: string
    selectedStatus: string
    dateFilter: { start: string; end: string }
    issueFilter: string
  }
  onLoadSearch: (filters: SavedSearch['filters']) => void
  darkMode: boolean
}

const STORAGE_KEY = 'savedSearchPresets'

export function SavedSearches({ currentFilters, onLoadSearch, darkMode }: SavedSearchesProps) {
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([])
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [showLoadDropdown, setShowLoadDropdown] = useState(false)
  const [newSearchName, setNewSearchName] = useState('')
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Load saved searches from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        setSavedSearches(JSON.parse(stored))
      }
    } catch (error) {
      console.error('Failed to load saved searches:', error)
    }
  }, [])

  // Save to localStorage whenever savedSearches changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedSearches))
    } catch (error) {
      console.error('Failed to save searches:', error)
    }
  }, [savedSearches])

  const handleSaveSearch = () => {
    if (!newSearchName.trim()) return

    const newSearch: SavedSearch = {
      id: Date.now().toString(),
      name: newSearchName.trim(),
      filters: { ...currentFilters },
      timestamp: Date.now(),
    }

    setSavedSearches([newSearch, ...savedSearches])
    setNewSearchName('')
    setShowSaveDialog(false)
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 2000)
  }

  const handleDeleteSearch = (id: string) => {
    setSavedSearches(savedSearches.filter(search => search.id !== id))
  }

  const handleLoadSearch = (search: SavedSearch) => {
    onLoadSearch(search.filters)
    setShowLoadDropdown(false)
  }

  const handleExportSearches = () => {
    const dataStr = JSON.stringify(savedSearches, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `saved-searches-${Date.now()}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleImportSearches = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string)
        if (Array.isArray(imported)) {
          setSavedSearches([...imported, ...savedSearches])
        }
      } catch (error) {
        console.error('Failed to import searches:', error)
      }
    }
    reader.readAsText(file)
  }

  const getFilterSummary = (filters: SavedSearch['filters']): string => {
    const parts: string[] = []
    if (filters.searchQuery) parts.push(`"${filters.searchQuery}"`)
    if (filters.billType) parts.push(filters.billType)
    if (filters.selectedSponsor) parts.push(filters.selectedSponsor)
    if (filters.selectedStatus) parts.push(filters.selectedStatus)
    if (filters.issueFilter) parts.push(filters.issueFilter)
    return parts.length > 0 ? parts.join(' • ') : 'No filters'
  }

  return (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
      {/* Save Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowSaveDialog(true)}
        style={{
          padding: '8px 16px',
          background: darkMode ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)',
          color: darkMode ? '#60a5fa' : '#2563eb',
          border: darkMode ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid rgba(59, 130, 246, 0.2)',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '0.9em',
          fontWeight: 500,
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}
      >
        <Save size={16} />
        Save Search
      </motion.button>

      {/* Load Button */}
      <div style={{ position: 'relative' }}>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowLoadDropdown(!showLoadDropdown)}
          disabled={savedSearches.length === 0}
          style={{
            padding: '8px 16px',
            background: darkMode ? 'rgba(34, 197, 94, 0.2)' : 'rgba(34, 197, 94, 0.1)',
            color: darkMode ? '#4ade80' : '#16a34a',
            border: darkMode ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(34, 197, 94, 0.2)',
            borderRadius: '8px',
            cursor: savedSearches.length > 0 ? 'pointer' : 'not-allowed',
            fontSize: '0.9em',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            opacity: savedSearches.length === 0 ? 0.5 : 1,
          }}
        >
          <Search size={16} />
          Load ({savedSearches.length})
        </motion.button>

        {/* Load Dropdown */}
        <AnimatePresence>
          {showLoadDropdown && savedSearches.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                left: 0,
                background: darkMode ? '#1e293b' : 'white',
                border: darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)',
                borderRadius: '12px',
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
                padding: '8px',
                minWidth: '350px',
                maxWidth: '450px',
                maxHeight: '400px',
                overflowY: 'auto',
                zIndex: 1000,
              }}
            >
              {savedSearches.map((search) => (
                <motion.div
                  key={search.id}
                  whileHover={{ background: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)' }}
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    marginBottom: '4px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                  }}
                  onClick={() => handleLoadSearch(search)}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontWeight: 600,
                        color: 'var(--text-primary)',
                        marginBottom: '4px',
                        fontSize: '0.95em',
                      }}
                    >
                      {search.name}
                    </div>
                    <div
                      style={{
                        fontSize: '0.8em',
                        color: 'var(--text-secondary)',
                        marginBottom: '4px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {getFilterSummary(search.filters)}
                    </div>
                    <div style={{ fontSize: '0.75em', color: 'var(--text-secondary)', opacity: 0.7 }}>
                      {new Date(search.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteSearch(search.id)
                    }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '4px',
                      color: darkMode ? 'rgba(239, 68, 68, 0.8)' : 'rgba(220, 38, 38, 0.8)',
                    }}
                    aria-label="Delete search"
                  >
                    <Trash2 size={16} />
                  </motion.button>
                </motion.div>
              ))}
              
              {savedSearches.length > 0 && (
                <div style={{ borderTop: darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)', paddingTop: '8px', marginTop: '8px' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleExportSearches}
                      style={{
                        flex: 1,
                        padding: '8px',
                        background: 'transparent',
                        border: darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.85em',
                        color: 'var(--text-secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                      }}
                    >
                      <Download size={14} />
                      Export
                    </motion.button>
                    <label style={{ flex: 1 }}>
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        style={{
                          padding: '8px',
                          background: 'transparent',
                          border: darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '0.85em',
                          color: 'var(--text-secondary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                        }}
                      >
                        <Upload size={14} />
                        Import
                      </motion.div>
                      <input
                        type="file"
                        accept=".json"
                        onChange={handleImportSearches}
                        style={{ display: 'none' }}
                      />
                    </label>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Save Dialog */}
      <AnimatePresence>
        {showSaveDialog && (
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
              background: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2000,
              padding: '20px',
            }}
            onClick={() => setShowSaveDialog(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: darkMode ? '#1e293b' : 'white',
                borderRadius: '16px',
                padding: '24px',
                maxWidth: '450px',
                width: '100%',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0, fontSize: '1.3em', color: 'var(--text-primary)' }}>
                  Save Search Preset
                </h3>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowSaveDialog(false)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px',
                    color: 'var(--text-secondary)',
                  }}
                >
                  <X size={20} />
                </motion.button>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontSize: '0.9em',
                    fontWeight: 500,
                    color: 'var(--text-secondary)',
                  }}
                >
                  Preset Name
                </label>
                <input
                  type="text"
                  value={newSearchName}
                  onChange={(e) => setNewSearchName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveSearch()
                    if (e.key === 'Escape') setShowSaveDialog(false)
                  }}
                  placeholder="e.g., Education Bills 2025"
                  autoFocus
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)',
                    borderRadius: '8px',
                    background: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                    color: 'var(--text-primary)',
                    fontSize: '1em',
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              <div
                style={{
                  padding: '12px',
                  background: darkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)',
                  borderRadius: '8px',
                  marginBottom: '20px',
                  fontSize: '0.85em',
                  color: 'var(--text-secondary)',
                }}
              >
                <strong style={{ color: darkMode ? '#60a5fa' : '#2563eb' }}>Current filters:</strong>
                <div style={{ marginTop: '8px' }}>
                  {getFilterSummary(currentFilters)}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowSaveDialog(false)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: 'transparent',
                    border: darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '1em',
                    fontWeight: 500,
                    color: 'var(--text-secondary)',
                  }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSaveSearch}
                  disabled={!newSearchName.trim()}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: newSearchName.trim()
                      ? 'linear-gradient(135deg, #3b82f6, #2563eb)'
                      : darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                    color: newSearchName.trim() ? 'white' : 'var(--text-secondary)',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: newSearchName.trim() ? 'pointer' : 'not-allowed',
                    fontSize: '1em',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                >
                  <Save size={18} />
                  Save Preset
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Toast */}
      <AnimatePresence>
        {saveSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            style={{
              position: 'fixed',
              bottom: '24px',
              right: '24px',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: 'white',
              padding: '16px 20px',
              borderRadius: '12px',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              zIndex: 3000,
              fontWeight: 500,
            }}
          >
            <Check size={20} />
            Search preset saved successfully!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
