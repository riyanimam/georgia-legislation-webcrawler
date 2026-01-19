import { describe, it, expect } from 'vitest'

// Mock bill data for testing sorting
const mockBills = [
  {
    doc_number: 'HB 15',
    caption: 'Test Bill',
    sponsors: ['John Doe'],
    committees: ['Judiciary'],
    detail_url: 'https://example.com',
    status_history: [{ date: '2024-03-15', status: 'Introduced' }],
  },
  {
    doc_number: 'SB 3',
    caption: 'Test Bill 2',
    sponsors: ['Jane Smith'],
    committees: ['Finance'],
    detail_url: 'https://example.com',
    status_history: [{ date: '2024-01-10', status: 'Passed' }],
  },
  {
    doc_number: 'HB 200',
    caption: 'Test Bill 3',
    sponsors: ['Bob Jones'],
    committees: ['Education'],
    detail_url: 'https://example.com',
    status_history: [{ date: '2024-02-20', status: 'Committee' }],
  },
  {
    doc_number: 'SB 45',
    caption: 'Test Bill 4',
    sponsors: ['Alice Brown'],
    committees: ['Health'],
    detail_url: 'https://example.com',
    status_history: [{ date: '2024-04-01', status: 'Introduced' }],
  },
  {
    doc_number: 'HB 2',
    caption: 'Test Bill 5',
    sponsors: ['Charlie Wilson'],
    committees: ['Transportation'],
    detail_url: 'https://example.com',
    status_history: [{ date: '2024-01-05', status: 'Passed' }],
  },
]

describe('Bill Sorting Logic', () => {
  it('should sort bills by number ascending (HB then SB, numerically)', () => {
    const sorted = [...mockBills].sort((a, b) => {
      const aType = a.doc_number.match(/^[A-Z]+/)?.[0] || ''
      const bType = b.doc_number.match(/^[A-Z]+/)?.[0] || ''
      const aNum = parseInt(a.doc_number.match(/\d+/)?.[0] || '0')
      const bNum = parseInt(b.doc_number.match(/\d+/)?.[0] || '0')
      
      if (aType !== bType) return aType.localeCompare(bType)
      return aNum - bNum
    })

    expect(sorted[0].doc_number).toBe('HB 2')
    expect(sorted[1].doc_number).toBe('HB 15')
    expect(sorted[2].doc_number).toBe('HB 200')
    expect(sorted[3].doc_number).toBe('SB 3')
    expect(sorted[4].doc_number).toBe('SB 45')
  })

  it('should sort bills by number descending (SB then HB, numerically descending)', () => {
    const sorted = [...mockBills].sort((a, b) => {
      const aType = a.doc_number.match(/^[A-Z]+/)?.[0] || ''
      const bType = b.doc_number.match(/^[A-Z]+/)?.[0] || ''
      const aNum = parseInt(a.doc_number.match(/\d+/)?.[0] || '0')
      const bNum = parseInt(b.doc_number.match(/\d+/)?.[0] || '0')
      
      if (aType !== bType) return bType.localeCompare(aType)
      return bNum - aNum
    })

    expect(sorted[0].doc_number).toBe('SB 45')
    expect(sorted[1].doc_number).toBe('SB 3')
    expect(sorted[2].doc_number).toBe('HB 200')
    expect(sorted[3].doc_number).toBe('HB 15')
    expect(sorted[4].doc_number).toBe('HB 2')
  })

  it('should sort bills by date ascending', () => {
    const getLastDate = (bill: typeof mockBills[0]): string => {
      if (!bill.status_history || bill.status_history.length === 0) return '1970-01-01'
      return bill.status_history[bill.status_history.length - 1].date || '1970-01-01'
    }

    const sorted = [...mockBills].sort((a, b) => {
      return new Date(getLastDate(a)).getTime() - new Date(getLastDate(b)).getTime()
    })

    expect(sorted[0].doc_number).toBe('HB 2') // 2024-01-05
    expect(sorted[1].doc_number).toBe('SB 3') // 2024-01-10
    expect(sorted[2].doc_number).toBe('HB 200') // 2024-02-20
    expect(sorted[3].doc_number).toBe('HB 15') // 2024-03-15
    expect(sorted[4].doc_number).toBe('SB 45') // 2024-04-01
  })

  it('should sort bills by date descending', () => {
    const getLastDate = (bill: typeof mockBills[0]): string => {
      if (!bill.status_history || bill.status_history.length === 0) return '1970-01-01'
      return bill.status_history[bill.status_history.length - 1].date || '1970-01-01'
    }

    const sorted = [...mockBills].sort((a, b) => {
      return new Date(getLastDate(b)).getTime() - new Date(getLastDate(a)).getTime()
    })

    expect(sorted[0].doc_number).toBe('SB 45') // 2024-04-01
    expect(sorted[1].doc_number).toBe('HB 15') // 2024-03-15
    expect(sorted[2].doc_number).toBe('HB 200') // 2024-02-20
    expect(sorted[3].doc_number).toBe('SB 3') // 2024-01-10
    expect(sorted[4].doc_number).toBe('HB 2') // 2024-01-05
  })
})
