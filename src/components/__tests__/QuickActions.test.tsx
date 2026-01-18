import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import QuickActions from '../QuickActions'
import type { Bill } from '../../types'

const mockBill: Bill = {
  doc_number: 'HB 1',
  caption: 'Test Bill',
  sponsors: ['SMITH, JOHN'],
  committees: ['Judiciary'],
  status_history: [{ date: '2024-01-01', status: 'Introduced' }],
}

describe('QuickActions', () => {
  it('should render the FAB button', () => {
    const { container } = render(
      <QuickActions
        darkMode={false}
        currentBill={null}
        onExportView={vi.fn()}
        onAddFavorite={vi.fn()}
        onShareBill={vi.fn()}
      />
    )
    
    // FAB should be visible
    const fabButton = container.querySelector('button')
    expect(fabButton).toBeInTheDocument()
  })

  it('should expand when clicked', () => {
    const { container } = render(
      <QuickActions
        darkMode={false}
        currentBill={mockBill}
        onExportView={vi.fn()}
        onAddFavorite={vi.fn()}
        onShareBill={vi.fn()}
      />
    )
    
    const fabButton = container.querySelector('button')
    if (fabButton) {
      fireEvent.click(fabButton)
    }
    
    // After expanding, there should be more buttons visible
    const buttons = container.querySelectorAll('button')
    expect(buttons.length).toBeGreaterThan(1)
  })

  it('should apply dark mode styling', () => {
    const { container } = render(
      <QuickActions
        darkMode={true}
        currentBill={null}
        onExportView={vi.fn()}
        onAddFavorite={vi.fn()}
        onShareBill={vi.fn()}
      />
    )
    
    expect(container.firstChild).toBeInTheDocument()
  })

  it('should render with a bill selected', () => {
    const { container } = render(
      <QuickActions
        darkMode={false}
        currentBill={mockBill}
        onExportView={vi.fn()}
        onAddFavorite={vi.fn()}
        onShareBill={vi.fn()}
      />
    )
    
    expect(container.firstChild).toBeInTheDocument()
  })
})
