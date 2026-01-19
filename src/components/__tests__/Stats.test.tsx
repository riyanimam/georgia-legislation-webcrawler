import { describe, it, expect } from 'vitest'
import { render, within } from '@testing-library/react'
import Stats from '../Stats'
import { translations } from '../../i18n/translations'

describe('Stats', () => {
  const t = translations.en
  const mockBills = [
    {
      doc_number: 'HB 1',
      caption: 'Test Bill',
      sponsors: ['John Doe'],
      committees: ['Judiciary'],
      detail_url: 'https://example.com',
      status_history: [{ date: '2024-01-01', status: 'Introduced' }],
    },
    {
      doc_number: 'SB 2',
      caption: 'Test Bill 2',
      sponsors: ['Jane Smith'],
      committees: ['Finance'],
      detail_url: 'https://example.com',
      status_history: [{ date: '2024-01-02', status: 'Passed' }],
    },
  ]

  it('should display total bills count', () => {
    const { container } = render(<Stats bills={mockBills} filteredBills={mockBills} darkMode={false} t={t} />)
    const cards = container.querySelectorAll('[style*="border-radius: 16px"]')
    expect(cards.length).toBeGreaterThan(0)
    const firstCard = within(cards[0] as HTMLElement)
    expect(firstCard.getByText('Total Bills')).toBeInTheDocument()
    expect(firstCard.getByText('2')).toBeInTheDocument()
  })

  it('should display filtered results count', () => {
    const filtered = [mockBills[0]]
    const { container } = render(<Stats bills={mockBills} filteredBills={filtered} darkMode={false} t={t} />)
    const cards = container.querySelectorAll('[style*="border-radius: 16px"]')
    const secondCard = within(cards[1] as HTMLElement)
    expect(secondCard.getByText('Showing')).toBeInTheDocument()
    expect(secondCard.getByText('1')).toBeInTheDocument()
  })

  it('should display House bills count', () => {
    const { container } = render(<Stats bills={mockBills} filteredBills={mockBills} darkMode={false} t={t} />)
    const cards = container.querySelectorAll('[style*="border-radius: 16px"]')
    const thirdCard = within(cards[2] as HTMLElement)
    expect(thirdCard.getByText('House Bills')).toBeInTheDocument()
    expect(thirdCard.getByText('1')).toBeInTheDocument()
  })

  it('should display Senate bills count', () => {
    const { container } = render(<Stats bills={mockBills} filteredBills={mockBills} darkMode={false} t={t} />)
    const cards = container.querySelectorAll('[style*="border-radius: 16px"]')
    const fourthCard = within(cards[3] as HTMLElement)
    expect(fourthCard.getByText('Senate Bills')).toBeInTheDocument()
    expect(fourthCard.getByText('1')).toBeInTheDocument()
  })

  it('should apply dark mode styling', () => {
    const { container } = render(<Stats bills={mockBills} filteredBills={mockBills} darkMode={true} t={t} />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('should handle empty bills array', () => {
    const { container } = render(<Stats bills={[]} filteredBills={[]} darkMode={false} t={t} />)
    const cards = container.querySelectorAll('[style*="border-radius: 16px"]')
    const firstCard = within(cards[0] as HTMLElement)
    expect(firstCard.getByText('Total Bills')).toBeInTheDocument()
    expect(firstCard.getByText('0')).toBeInTheDocument()
  })
})
