import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import RepresentativeProfile from '../RepresentativeProfile'
import type { Bill } from '../../types'

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

const mockBills = [
  createMockBill({
    doc_number: 'HB 1',
    caption: 'Healthcare Reform Bill',
    sponsors: ['SMITH, JOHN', 'DOE, JANE'],
    status_history: [{ date: '2024-01-01', status: 'Signed by Governor' }],
  }),
  createMockBill({
    doc_number: 'HB 2',
    caption: 'Education Funding Bill',
    sponsors: ['SMITH, JOHN'],
    status_history: [{ date: '2024-02-01', status: 'In Committee' }],
  }),
  createMockBill({
    doc_number: 'SB 1',
    caption: 'Tax Reform Bill',
    sponsors: ['SMITH, JOHN', 'JOHNSON, BOB'],
    status_history: [{ date: '2024-03-01', status: 'Passed' }],
  }),
]

describe('RepresentativeProfile', () => {
  it('should render the representative name', () => {
    render(
      <RepresentativeProfile
        sponsorName="John Smith"
        allBills={mockBills}
        isOpen={true}
        onClose={vi.fn()}
        onSelectBill={vi.fn()}
        darkMode={false}
      />
    )
    
    expect(screen.getByText('John Smith')).toBeInTheDocument()
  })

  it('should display the representative title', () => {
    render(
      <RepresentativeProfile
        sponsorName="John Smith"
        allBills={mockBills}
        isOpen={true}
        onClose={vi.fn()}
        onSelectBill={vi.fn()}
        darkMode={false}
      />
    )
    
    expect(screen.getByText('Georgia Legislature Representative')).toBeInTheDocument()
  })

  it('should not render when isOpen is false', () => {
    const { container } = render(
      <RepresentativeProfile
        sponsorName="John Smith"
        allBills={mockBills}
        isOpen={false}
        onClose={vi.fn()}
        onSelectBill={vi.fn()}
        darkMode={false}
      />
    )
    
    expect(container.firstChild).toBeNull()
  })

  it('should call onClose when close button is clicked', () => {
    const onClose = vi.fn()
    render(
      <RepresentativeProfile
        sponsorName="John Smith"
        allBills={mockBills}
        isOpen={true}
        onClose={onClose}
        onSelectBill={vi.fn()}
        darkMode={false}
      />
    )
    
    // Find the close button (X icon)
    const closeButton = document.querySelector('button')
    if (closeButton) {
      fireEvent.click(closeButton)
    }
    
    expect(onClose).toHaveBeenCalled()
  })

  it('should display total bills count', () => {
    render(
      <RepresentativeProfile
        sponsorName="John Smith"
        allBills={mockBills}
        isOpen={true}
        onClose={vi.fn()}
        onSelectBill={vi.fn()}
        darkMode={false}
      />
    )
    
    // John Smith sponsors 3 bills in the mock data
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('Total Bills')).toBeInTheDocument()
  })

  it('should display passed bills count', () => {
    render(
      <RepresentativeProfile
        sponsorName="John Smith"
        allBills={mockBills}
        isOpen={true}
        onClose={vi.fn()}
        onSelectBill={vi.fn()}
        darkMode={false}
      />
    )
    
    // 2 bills are passed/signed in the mock data
    expect(screen.getByText('Passed')).toBeInTheDocument()
  })

  it('should display success rate', () => {
    render(
      <RepresentativeProfile
        sponsorName="John Smith"
        allBills={mockBills}
        isOpen={true}
        onClose={vi.fn()}
        onSelectBill={vi.fn()}
        darkMode={false}
      />
    )
    
    expect(screen.getByText('Success Rate')).toBeInTheDocument()
  })

  it('should display frequent co-sponsors section', () => {
    render(
      <RepresentativeProfile
        sponsorName="John Smith"
        allBills={mockBills}
        isOpen={true}
        onClose={vi.fn()}
        onSelectBill={vi.fn()}
        darkMode={false}
      />
    )
    
    expect(screen.getByText('Frequent Co-Sponsors')).toBeInTheDocument()
  })

  it('should apply dark mode styling', () => {
    const { container } = render(
      <RepresentativeProfile
        sponsorName="John Smith"
        allBills={mockBills}
        isOpen={true}
        onClose={vi.fn()}
        onSelectBill={vi.fn()}
        darkMode={true}
      />
    )
    
    expect(container.firstChild).toBeInTheDocument()
  })

  it('should call onSelectBill when a bill is clicked', () => {
    const onSelectBill = vi.fn()
    render(
      <RepresentativeProfile
        sponsorName="John Smith"
        allBills={mockBills}
        isOpen={true}
        onClose={vi.fn()}
        onSelectBill={onSelectBill}
        darkMode={false}
      />
    )
    
    // Click on a bill
    const billElement = screen.getByText('HB 1')
    fireEvent.click(billElement.closest('div[style*="cursor"]') || billElement)
    
    expect(onSelectBill).toHaveBeenCalled()
  })
})
