import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Moon, Sun, Download, Upload } from 'lucide-react'
import type { Bill, FilterState } from './types'
import { getBillIssue, getLatestStatus } from './utils'
import { translations, type Language } from './i18n/translations'
import Header from './components/Header.tsx'
import Stats from './components/Stats.tsx'
import Filters from './components/Filters.tsx'
import BillGrid from './components/BillGrid.tsx'
import BillModal from './components/BillModal.tsx'
import FavoritesModal from './components/FavoritesModal.tsx'
import LoadingAnimation from './components/LoadingAnimation.tsx'
import AnimatedBackground from './components/AnimatedBackground.tsx'
import Sidebar from './components/Sidebar.tsx'
import LanguageSelector from './components/LanguageSelector.tsx'
import './App.css'

const ITEMS_PER_PAGE = 20

function App() {
  // Initialize from URL parameters for shareable links
  const urlParams = new URLSearchParams(window.location.search)
  
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true'
  })
  const [language, setLanguage] = useState<Language>(() => {
    const urlLang = urlParams.get('lang')
    if (urlLang && ['en', 'es', 'fr', 'zh', 'ja', 'ko', 'hi', 'ur', 'ar', 'vi', 'tl', 'ru', 'pt', 'de'].includes(urlLang)) {
      return urlLang as Language
    }
    const stored = localStorage.getItem('language')
    return (stored as Language) || 'en'
  })
  const [bills, setBills] = useState<Bill[]>([])
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(() => {
    const page = urlParams.get('page')
    return page ? Number.parseInt(page, 10) : 1
  })
  const [selectedBill, setSelectedBill] = useState<Bill | null>(() => {
    return null // Will be set by URL effect
  })
  const [showFavorites, setShowFavorites] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [favorites, setFavorites] = useState<string[]>(() => {
    const stored = localStorage.getItem('georgia-bills-favorites')
    return stored ? JSON.parse(stored) : []
  })

  const [filters, setFilters] = useState<FilterState>(() => {
    return {
      search: urlParams.get('search') || '',
      type: urlParams.get('type') || '',
      issues: urlParams.get('issues')?.split(',').filter(Boolean) || [],
      sponsor: urlParams.get('sponsor') || '',
      status: urlParams.get('status') || '',
      dateFrom: urlParams.get('dateFrom') || '',
      dateTo: urlParams.get('dateTo') || '',
      summarySearch: urlParams.get('summarySearch') || '',
      sortBy: (urlParams.get('sortBy') || 'date-desc') as FilterState['sortBy'],
    }
  })

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode')
    } else {
      document.body.classList.remove('dark-mode')
    }
    localStorage.setItem('darkMode', darkMode.toString())
  }, [darkMode])

  useEffect(() => {
    localStorage.setItem('language', language)
    // Set document direction for RTL languages
    document.documentElement.dir = ['ar', 'ur'].includes(language) ? 'rtl' : 'ltr'
    document.documentElement.lang = language
  }, [language])

  useEffect(() => {
    localStorage.setItem('georgia-bills-favorites', JSON.stringify(favorites))
  }, [favorites])

  useEffect(() => {
    // Auto-load data in production (GitHub Pages)
    const isProduction = import.meta.env.PROD
    if (isProduction) {
      setLoading(true)
      const basePath = import.meta.env.BASE_URL || '/'
      fetch(`${basePath}ga_legislation.json`)
        .then((res) => {
          if (!res.ok) throw new Error('Failed to load data')
          return res.json()
        })
        .then((data) => {
          console.log('Auto-loaded data from repo:', data.length, 'bills')
          setBills(data)
          setLoading(false)
        })
        .catch((error) => {
          console.error('Error auto-loading data:', error)
          setLoading(false)
          // File upload still available as fallback
        })
    }
  }, [])

  // Sync state to URL for shareable links
  useEffect(() => {
    const params = new URLSearchParams()
    if (filters.search) params.set('search', filters.search)
    if (filters.type) params.set('type', filters.type)
    if (filters.issues.length > 0) params.set('issues', filters.issues.join(','))
    if (filters.sponsor) params.set('sponsor', filters.sponsor)
    if (filters.status) params.set('status', filters.status)
    if (filters.dateFrom) params.set('dateFrom', filters.dateFrom)
    if (filters.dateTo) params.set('dateTo', filters.dateTo)
    if (filters.summarySearch) params.set('summarySearch', filters.summarySearch)
    if (filters.sortBy !== 'date-desc') params.set('sortBy', filters.sortBy)
    if (currentPage !== 1) params.set('page', currentPage.toString())
    if (language !== 'en') params.set('lang', language)
    
    const newUrl = params.toString() ? `?${params.toString()}` : window.location.pathname
    window.history.replaceState({}, '', newUrl)
  }, [filters, currentPage, language])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape - close modals
      if (e.key === 'Escape') {
        setSelectedBill(null)
        setShowFavorites(false)
        setSidebarOpen(false)
      }
      
      // Ctrl/Cmd + K - focus search (command palette style)
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement
        searchInput?.focus()
      }
      
      // F - toggle sidebar
      if (e.key === 'f' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const activeElement = document.activeElement
        if (activeElement?.tagName !== 'INPUT' && activeElement?.tagName !== 'TEXTAREA') {
          setSidebarOpen(prev => !prev)
        }
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    console.log('File selected:', file.name, file.size, 'bytes')
    setLoading(true)
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string)
        console.log('Parsed JSON data:', data.length, 'bills')
        console.log('First bill:', data[0])
        setBills(data)
        setCurrentPage(1)
      } catch (error) {
        console.error('Error parsing JSON:', error)
        alert('Error parsing JSON file. Please check the file format.')
      } finally {
        setLoading(false)
      }
    }
    reader.readAsText(file)
  }

  const getLastDate = (bill: Bill): string => {
    if (!bill.status_history || bill.status_history.length === 0) return '1970-01-01'
    return bill.status_history[bill.status_history.length - 1].date || '1970-01-01'
  }

  const filteredBills = useMemo(() => {
    console.log('Filtering bills, total bills:', bills.length)
    let result = [...bills]

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      result = result.filter((bill) => {
        const sponsorsStr = Array.isArray(bill.sponsors)
          ? bill.sponsors.join(' ')
          : bill.sponsors || ''
        const committeesStr = Array.isArray(bill.committees)
          ? bill.committees.join(' ')
          : bill.committees || ''
        const searchText =
          `${bill.doc_number} ${bill.caption} ${sponsorsStr} ${committeesStr}`.toLowerCase()
        return searchText.includes(searchLower)
      })
    }

    // Type filter
    if (filters.type) {
      result = result.filter((bill) => bill.doc_number.startsWith(filters.type))
    }

    // Issue filter
    if (filters.issues.length > 0) {
      result = result.filter((bill) => {
        const billIssue = getBillIssue(bill)
        return billIssue && filters.issues.includes(billIssue)
      })
    }

    // Sponsor filter
    if (filters.sponsor) {
      const sponsorLower = filters.sponsor.toLowerCase()
      result = result.filter((bill) => {
        const sponsorsStr = Array.isArray(bill.sponsors)
          ? bill.sponsors.join(' ')
          : bill.sponsors || ''
        return sponsorsStr.toLowerCase().includes(sponsorLower)
      })
    }

    // Status filter
    if (filters.status) {
      result = result.filter((bill) => {
        const status = getLatestStatus(bill)
        return status.toLowerCase().includes(filters.status.toLowerCase())
      })
    }

    // Summary search
    if (filters.summarySearch) {
      const summaryLower = filters.summarySearch.toLowerCase()
      result = result.filter((bill) => {
        const summary = bill.first_reader_summary || bill.summary || ''
        return summary.toLowerCase().includes(summaryLower)
      })
    }

    // Date filters
    if (filters.dateFrom || filters.dateTo) {
      result = result.filter((bill) => {
        if (!bill.status_history || bill.status_history.length === 0) return false
        const billDate = new Date(bill.status_history[bill.status_history.length - 1].date)
        if (filters.dateFrom && billDate < new Date(filters.dateFrom)) return false
        if (filters.dateTo && billDate > new Date(filters.dateTo)) return false
        return true
      })
    }

    // Sort
    result.sort((a, b) => {
      switch (filters.sortBy) {
        case 'date-desc':
          return (
            new Date(getLastDate(b)).getTime() - new Date(getLastDate(a)).getTime()
          )
        case 'date-asc':
          return (
            new Date(getLastDate(a)).getTime() - new Date(getLastDate(b)).getTime()
          )
        case 'bill-asc': {
          // Sort by bill type (HB, SB) then by number
          const aType = a.doc_number.match(/^[A-Z]+/)?.[0] || ''
          const bType = b.doc_number.match(/^[A-Z]+/)?.[0] || ''
          const aNum = parseInt(a.doc_number.match(/\d+/)?.[0] || '0')
          const bNum = parseInt(b.doc_number.match(/\d+/)?.[0] || '0')
          
          if (aType !== bType) return aType.localeCompare(bType)
          return aNum - bNum
        }
        case 'bill-desc': {
          // Sort by bill type (SB, HB) then by number descending
          const aType = a.doc_number.match(/^[A-Z]+/)?.[0] || ''
          const bType = b.doc_number.match(/^[A-Z]+/)?.[0] || ''
          const aNum = parseInt(a.doc_number.match(/\d+/)?.[0] || '0')
          const bNum = parseInt(b.doc_number.match(/\d+/)?.[0] || '0')
          
          if (aType !== bType) return bType.localeCompare(aType)
          return bNum - aNum
        }
        default:
          return 0
      }
    })

    console.log('Filtered bills count:', result.length)
    return result
  }, [bills, filters])

  const paginatedBills = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    const end = start + ITEMS_PER_PAGE
    console.log('Paginating bills, showing', start, 'to', end, 'of', filteredBills.length)
    return filteredBills.slice(start, end)
  }, [filteredBills, currentPage])

  const totalPages = Math.ceil(filteredBills.length / ITEMS_PER_PAGE)

  const toggleFavorite = (billNumber: string) => {
    setFavorites((prev) =>
      prev.includes(billNumber)
        ? prev.filter((bn) => bn !== billNumber)
        : [...prev, billNumber]
    )
  }

  const resetFilters = () => {
    setFilters({
      search: '',
      type: '',
      issues: [],
      sponsor: '',
      status: '',
      dateFrom: '',
      dateTo: '',
      summarySearch: '',
      sortBy: 'date-desc',
    })
    setCurrentPage(1)
  }

  const exportFilteredBillsJSON = () => {
    const dataStr = JSON.stringify(filteredBills, null, 2)
    const blob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `filtered-bills-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const exportFavoritesJSON = () => {
    const favoritedBills = bills.filter((bill) => favorites.includes(bill.doc_number))
    const dataStr = JSON.stringify(favoritedBills, null, 2)
    const blob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `favorites-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const t = translations[language]

  return (
    <div style={{ minHeight: '100vh', padding: '20px', position: 'relative' }}>
      <AnimatedBackground />
      <LanguageSelector
        currentLanguage={language}
        onLanguageChange={setLanguage}
        darkMode={darkMode}
      />
      <div style={{ maxWidth: '1400px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <Header t={t} />

        {/* Dark Mode Toggle */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.1 }}
          onClick={() => setDarkMode(!darkMode)}
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            background: 'rgba(255, 255, 255, 0.15)',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            color: 'white',
            padding: '12px',
            borderRadius: '50%',
            cursor: 'pointer',
            zIndex: 999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          aria-label="Toggle dark mode"
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </motion.button>

        {/* Export Button */}
        {filteredBills.length > 0 && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.15 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={exportFilteredBillsJSON}
            style={{
              position: 'fixed',
              bottom: '152px',
              right: '24px',
              background: 'linear-gradient(135deg, #ffa502, #ffd700)',
              border: 'none',
              color: 'white',
              padding: '12px',
              borderRadius: '50%',
              cursor: 'pointer',
              zIndex: 999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-lg)',
            }}
            aria-label="Export filtered results"
          >
            <Download size={20} />
          </motion.button>
        )}

        {/* File Upload */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.2 }}
          style={{
            background: darkMode ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.95)',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '24px',
            boxShadow: 'var(--shadow-md)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <label
            htmlFor="file-upload"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              cursor: 'pointer',
              color: 'var(--text-primary)',
            }}
          >
            <Upload size={24} />
            <span style={{ fontSize: '1.1em', fontWeight: 500 }}>
              {bills.length > 0 
                ? `${bills.length} bills loaded` 
                : import.meta.env.PROD 
                  ? 'Upload additional data (JSON)' 
                  : 'Load legislation data (JSON)'}
            </span>
          </label>
          <input
            id="file-upload"
            type="file"
            accept=".json"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
        </motion.div>

        {loading && <LoadingAnimation />}

        {bills.length > 0 && (
          <>
            <Stats bills={bills} filteredBills={filteredBills} darkMode={darkMode} />
            <Filters
              filters={filters}
              setFilters={setFilters}
              onReset={resetFilters}
              darkMode={darkMode}
            />
            {filteredBills.length > 0 ? (
              <BillGrid
                bills={paginatedBills}
                favorites={favorites}
                onToggleFavorite={toggleFavorite}
                onSelectBill={setSelectedBill}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                darkMode={darkMode}
                loading={loading}
              />
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                  textAlign: 'center',
                  padding: '60px 20px',
                  background: darkMode ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.95)',
                  borderRadius: '16px',
                  color: 'var(--text-primary)',
                }}
              >
                <h3 style={{ fontSize: '1.5em', marginBottom: '12px' }}>No bills found</h3>
                <p style={{ color: 'var(--text-secondary)' }}>
                  Try adjusting your filters or search criteria
                </p>
              </motion.div>
            )}
          </>
        )}

        <AnimatePresence>
          {selectedBill && (
            <BillModal
              bill={selectedBill}
              onClose={() => setSelectedBill(null)}
              isFavorited={favorites.includes(selectedBill.doc_number)}
              onToggleFavorite={() => toggleFavorite(selectedBill.doc_number)}
              darkMode={darkMode}
            />
          )}

          {showFavorites && (
            <FavoritesModal
              favorites={favorites}
              bills={bills}
              onClose={() => setShowFavorites(false)}
              onToggleFavorite={toggleFavorite}
              onSelectBill={setSelectedBill}
              darkMode={darkMode}
            />
          )}
        </AnimatePresence>

        {/* Sidebar for Favorites */}
        <Sidebar
          favorites={favorites}
          bills={bills}
          isOpen={sidebarOpen}
          onToggleOpen={() => setSidebarOpen(!sidebarOpen)}
          onToggleFavorite={toggleFavorite}
          onSelectBill={setSelectedBill}
          onExport={exportFavoritesJSON}
          darkMode={darkMode}
        />
      </div>
    </div>
  )
}

export default App
