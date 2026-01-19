import { describe, it, expect } from 'vitest'
import {
  getBillIssue,
  getLatestStatus,
  generateBillTags,
  formatDate,
  normalizeSponsorName,
  getSponsorNames,
} from '../utils'
import type { Bill } from '../types'

// Mock bill factory for testing
function createMockBill(overrides: Partial<Bill> = {}): Bill {
  return {
    doc_number: 'HB 1',
    caption: 'Test Bill',
    sponsors: ['SMITH, JOHN'],
    committees: ['Judiciary'],
    status_history: [{ date: '2024-01-01', status: 'Introduced' }],
    ...overrides,
  }
}

describe('getBillIssue', () => {
  it('should identify healthcare bills', () => {
    const bill = createMockBill({ caption: 'A bill relating to healthcare reform' })
    expect(getBillIssue(bill)).toBe('healthcare')
  })

  it('should identify education bills', () => {
    const bill = createMockBill({ caption: 'A bill relating to school funding' })
    expect(getBillIssue(bill)).toBe('education')
  })

  it('should identify criminal justice bills', () => {
    const bill = createMockBill({ caption: 'A bill relating to prison reform' })
    expect(getBillIssue(bill)).toBe('criminal-justice')
  })

  it('should identify tax bills', () => {
    const bill = createMockBill({ caption: 'A bill relating to income tax rates' })
    expect(getBillIssue(bill)).toBe('taxes')
  })

  it('should return null for bills with no matching issues', () => {
    const bill = createMockBill({ caption: 'A general appropriations bill' })
    expect(getBillIssue(bill)).toBeNull()
  })

  it('should search in summary as well', () => {
    const bill = createMockBill({
      caption: 'A general bill',
      first_reader_summary: 'This bill addresses healthcare costs',
    })
    expect(getBillIssue(bill)).toBe('healthcare')
  })
})

describe('getLatestStatus', () => {
  it('should return the most recent status', () => {
    const bill = createMockBill({
      status_history: [
        { date: '2024-01-01', status: 'Introduced' },
        { date: '2024-02-01', status: 'Committee' },
        { date: '2024-03-01', status: 'Passed' },
      ],
    })
    expect(getLatestStatus(bill)).toBe('Passed')
  })

  it('should handle unsorted status history', () => {
    const bill = createMockBill({
      status_history: [
        { date: '2024-03-01', status: 'Passed' },
        { date: '2024-01-01', status: 'Introduced' },
        { date: '2024-02-01', status: 'Committee' },
      ],
    })
    expect(getLatestStatus(bill)).toBe('Passed')
  })

  it('should return Unknown for empty status history', () => {
    const bill = createMockBill({ status_history: [] })
    expect(getLatestStatus(bill)).toBe('Unknown')
  })

  it('should return Unknown for undefined status history', () => {
    const bill = createMockBill({ status_history: undefined })
    expect(getLatestStatus(bill)).toBe('Unknown')
  })
})

describe('generateBillTags', () => {
  it('should generate tags based on keywords in caption', () => {
    const bill = createMockBill({ caption: 'A bill about school education reform' })
    const tags = generateBillTags(bill)
    expect(tags).toContain('school')
    expect(tags).toContain('education')
  })

  it('should return General for bills with no matching keywords', () => {
    const bill = createMockBill({ caption: 'A general appropriations bill' })
    const tags = generateBillTags(bill)
    expect(tags).toEqual(['General'])
  })

  it('should limit tags to 4', () => {
    const bill = createMockBill({
      caption: 'Healthcare education tax school student teacher crime',
    })
    const tags = generateBillTags(bill)
    expect(tags.length).toBeLessThanOrEqual(4)
  })
})

describe('formatDate', () => {
  it('should format date strings correctly', () => {
    const result = formatDate('2024-01-15')
    expect(result).toContain('Jan')
    expect(result).toContain('2024')
    // Date may vary by timezone (14 or 15)
    expect(result).toMatch(/1[45]/)
  })

  it('should return N/A for undefined dates', () => {
    expect(formatDate(undefined)).toBe('N/A')
  })

  it('should return N/A for empty strings', () => {
    expect(formatDate('')).toBe('N/A')
  })

  it('should handle invalid date strings gracefully', () => {
    const result = formatDate('not-a-date')
    expect(result).toBeTruthy()
  })
})

describe('normalizeSponsorName', () => {
  it('should convert "LAST, FIRST" format to "First Last"', () => {
    expect(normalizeSponsorName('SMITH, JOHN')).toBe('John Smith')
  })

  it('should convert "LAST, FIRST MIDDLE" format to "First Middle Last"', () => {
    expect(normalizeSponsorName('DOE, JANE MARIE')).toBe('Jane Marie Doe')
  })

  it('should handle already normalized names', () => {
    expect(normalizeSponsorName('John Smith')).toBe('John Smith')
  })

  it('should handle lowercase names', () => {
    expect(normalizeSponsorName('smith, john')).toBe('John Smith')
  })

  it('should handle empty strings', () => {
    expect(normalizeSponsorName('')).toBe('')
  })

  it('should handle whitespace-only strings', () => {
    expect(normalizeSponsorName('   ')).toBe('')
  })

  it('should trim extra whitespace', () => {
    expect(normalizeSponsorName('  SMITH , JOHN  ')).toBe('John Smith')
  })
})

describe('getSponsorNames', () => {
  it('should extract and normalize sponsors from array', () => {
    const bill = createMockBill({ sponsors: ['SMITH, JOHN', 'DOE, JANE'] })
    const names = getSponsorNames(bill)
    expect(names).toEqual(['John Smith', 'Jane Doe'])
  })

  it('should handle single sponsor string', () => {
    const bill = createMockBill({ sponsors: 'SMITH, JOHN' as unknown as string[] })
    const names = getSponsorNames(bill)
    expect(names).toEqual(['John Smith'])
  })

  it('should filter out empty sponsors', () => {
    const bill = createMockBill({ sponsors: ['SMITH, JOHN', '', '  ', 'DOE, JANE'] })
    const names = getSponsorNames(bill)
    expect(names).toEqual(['John Smith', 'Jane Doe'])
  })

  it('should return empty array for no sponsors', () => {
    const bill = createMockBill({ sponsors: [] })
    expect(getSponsorNames(bill)).toEqual([])
  })

  it('should return empty array for undefined sponsors', () => {
    const bill = createMockBill({ sponsors: undefined })
    expect(getSponsorNames(bill)).toEqual([])
  })
})
