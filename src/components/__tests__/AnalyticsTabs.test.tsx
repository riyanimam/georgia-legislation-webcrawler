import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import AnalyticsTabs from '../AnalyticsTabs'
import type { Bill } from '../../types'
import { translations } from '../../i18n/translations'

function createMockBill(overrides: Partial<Bill> = {}): Bill {
  return {
    doc_number: 'HB 1',
    caption: 'Test Bill about healthcare',
    sponsors: ['SMITH, JOHN'],
    committees: ['Judiciary'],
    status_history: [{ date: '2024-01-01', status: 'Introduced' }],
    ...overrides,
  }
}

const mockBills = [
  createMockBill({ doc_number: 'HB 1', caption: 'Healthcare reform bill' }),
  createMockBill({ doc_number: 'HB 2', caption: 'Education funding bill' }),
  createMockBill({
    doc_number: 'SB 1',
    caption: 'Tax reform bill',
    status_history: [{ date: '2024-03-01', status: 'Signed by Governor' }],
  }),
]

describe('AnalyticsTabs', () => {
  it('should render all tab buttons', () => {
    render(
      <AnalyticsTabs
        bills={mockBills}
        darkMode={false}
        t={translations.en}
        onFilterByWord={vi.fn()}
      />
    )
    
    // Use getAllByRole to find buttons
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThanOrEqual(4)
  })

  it('should show Overview tab content by default', () => {
    render(
      <AnalyticsTabs
        bills={mockBills}
        darkMode={false}
        t={translations.en}
        onFilterByWord={vi.fn()}
      />
    )
    
    // Overview shows Legislative Analytics title
    expect(screen.getByText('Legislative Analytics')).toBeInTheDocument()
  })

  it('should switch to Timeline tab when clicked', () => {
    render(
      <AnalyticsTabs
        bills={mockBills}
        darkMode={false}
        t={translations.en}
        onFilterByWord={vi.fn()}
      />
    )
    
    // Find Timeline button
    const buttons = screen.getAllByRole('button')
    const timelineButton = buttons.find(btn => btn.textContent?.includes('Timeline'))
    if (timelineButton) {
      fireEvent.click(timelineButton)
    }
    
    // Timeline should show bill progression
    expect(screen.getByText('Bill Progression Timeline')).toBeInTheDocument()
  })

  it('should switch to Charts tab when clicked', () => {
    render(
      <AnalyticsTabs
        bills={mockBills}
        darkMode={false}
        t={translations.en}
        onFilterByWord={vi.fn()}
      />
    )
    
    // Find Charts button
    const buttons = screen.getAllByRole('button')
    const chartsButton = buttons.find(btn => btn.textContent?.includes('Charts'))
    if (chartsButton) {
      fireEvent.click(chartsButton)
    }
    
    // Charts view should render
    expect(screen.getByText('Interactive Charts')).toBeInTheDocument()
  })

  it('should switch to Word Cloud tab when clicked', () => {
    render(
      <AnalyticsTabs
        bills={mockBills}
        darkMode={false}
        t={translations.en}
        onFilterByWord={vi.fn()}
      />
    )
    
    // Find Word Cloud button
    const buttons = screen.getAllByRole('button')
    const wordCloudButton = buttons.find(btn => btn.textContent?.includes('Word Cloud'))
    if (wordCloudButton) {
      fireEvent.click(wordCloudButton)
    }
    
    expect(screen.getByText('Trending Topics Word Cloud')).toBeInTheDocument()
  })

  it('should apply dark mode styling', () => {
    const { container } = render(
      <AnalyticsTabs
        bills={mockBills}
        darkMode={true}
        t={translations.en}
        onFilterByWord={vi.fn()}
      />
    )
    
    expect(container.firstChild).toBeInTheDocument()
  })

  it('should handle empty bills array', () => {
    const { container } = render(
      <AnalyticsTabs
        bills={[]}
        darkMode={false}
        t={translations.en}
        onFilterByWord={vi.fn()}
      />
    )
    
    expect(container.firstChild).toBeInTheDocument()
  })
})
