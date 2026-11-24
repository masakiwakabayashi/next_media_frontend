import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import LoginLayout from './layout'

vi.mock('@/components/Header', () => ({
  default: () => <div data-testid="header" />,
}))
vi.mock('@/components/Footer', () => ({
  default: () => <div data-testid="footer" />,
}))

describe('LoginLayout', () => {
  it('HeaderとFooterに挟まれてchildrenを表示する', () => {
    render(
      <LoginLayout>
        <div data-testid="children">本文</div>
      </LoginLayout>,
    )

    expect(screen.getByTestId('header')).toBeInTheDocument()
    expect(screen.getByTestId('footer')).toBeInTheDocument()
    expect(screen.getByTestId('children')).toHaveTextContent('本文')
  })
})
