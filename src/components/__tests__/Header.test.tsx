import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Header from '../Header'

describe('Header', () => {
  it('should render the header title', () => {
    render(<Header />)
    expect(screen.getByText('Georgia Legislation Explorer')).toBeInTheDocument()
  })

  it('should render with correct animation', () => {
    const { container } = render(<Header />)
    const header = container.querySelector('header')
    expect(header).toBeInTheDocument()
  })
})
