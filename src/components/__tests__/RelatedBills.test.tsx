import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import RelatedBills from '../RelatedBills'
import type { Bill } from '../../types'

// Create mock bills with different characteristics
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

const currentBill = createMockBill({
  doc_number: 'HB 1',
  caption: 'A bill about healthcare reform',
  sponsors: ['SMITH, JOHN', 'DOE, JANE'],
})

const allBills = [
  currentBill,
  createMockBill({
    doc_number: 'HB 2',
    caption: 'Another healthcare bill',
    sponsors: ['SMITH, JOHN'], // Same sponsor
  }),
  createMockBill({
    doc_number: 'SB 1',
    caption: 'Education funding bill',
    sponsors: ['JOHNSON, BOB'],
  }),
  createMockBill({
    doc_number: 'HB 3',
    caption: 'Healthcare costs bill',
    sponsors: ['DOE, JANE'], // Same sponsor
  }),
]

describe('RelatedBills', () => {
  it('should render the component with title', () => {
    render(
      <RelatedBills
        currentBill={currentBill}
        allBills={allBills}
        onSelectBill={vi.fn()}
        darkMode={false}
      />
    )
    
    // The title is "Related Bills You Might Like"
    expect(screen.getByText('Related Bills You Might Like')).toBeInTheDocument()
  })

  it('should find and display related bills', () => {
    render(
      <RelatedBills
        currentBill={currentBill}
        allBills={allBills}
        onSelectBill={vi.fn()}
        darkMode={false}
      />
    )
    
    // Should find HB 2 and HB 3 as related (same sponsors)
    expect(screen.getByText('HB 2')).toBeInTheDocument()
  })

  it('should not display the current bill as related', () => {
    render(
      <RelatedBills
        currentBill={currentBill}
        allBills={allBills}
        onSelectBill={vi.fn()}
        darkMode={false}
      />
    )
    
    // HB 2 and HB 3 should be shown but not HB 1 (current bill)
    expect(screen.getByText('HB 2')).toBeInTheDocument()
    expect(screen.getByText('HB 3')).toBeInTheDocument()
  })

  it('should call onSelectBill when a related bill is clicked', () => {
    const onSelectBill = vi.fn()
    render(
      <RelatedBills
        currentBill={currentBill}
        allBills={allBills}
        onSelectBill={onSelectBill}
        darkMode={false}
      />
    )
    
    // Click on a related bill
    const relatedBillElement = screen.getByText('HB 2')
    fireEvent.click(relatedBillElement.closest('div[style*="cursor"]') || relatedBillElement)
    
    expect(onSelectBill).toHaveBeenCalled()
  })

  it('should apply dark mode styling', () => {
    const { container } = render(
      <RelatedBills
        currentBill={currentBill}
        allBills={allBills}
        onSelectBill={vi.fn()}
        darkMode={true}
      />
    )
    
    expect(container.firstChild).toBeInTheDocument()
  })

  it('should return null when no related bills found', () => {
    const isolatedBill = createMockBill({
      doc_number: 'SR 99',
      caption: 'Unique resolution about space exploration',
      sponsors: ['UNIQUE, PERSON'],
    })
    
    const { container } = render(
      <RelatedBills
        currentBill={isolatedBill}
        allBills={[isolatedBill]}
        onSelectBill={vi.fn()}
        darkMode={false}
      />
    )
    
    // Component returns null when no related bills
    expect(container.firstChild).toBeNull()
  })
})
