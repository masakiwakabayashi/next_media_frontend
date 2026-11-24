import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Footer from './Footer'

describe('Footer', () => {
  it('現在の年を含むコピーライトを表示する', () => {
    render(<Footer />)

    const year = new Date().getFullYear()
    expect(
      screen.getByText(`© ${year} Masaki Wakabayashi`)
    ).toBeInTheDocument()
  })
})
