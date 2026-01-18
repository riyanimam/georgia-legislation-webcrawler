import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Header from '../Header'
import { translations } from '../../i18n/translations'

describe('Header', () => {
  it('should render the header title', () => {
    render(<Header t={translations.en} />)
    expect(screen.getByText('Georgia Legislation Tracker')).toBeInTheDocument()
  })

  it('should render with correct animation', () => {
    const { container } = render(<Header t={translations.en} />)
    const header = container.querySelector('header')
    expect(header).toBeInTheDocument()
  })
})
