import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import ForgotPasswordLayout from './layout'

vi.mock('@/components/Header', () => ({
  default: () => <div data-testid="header" />,
}))
vi.mock('@/components/Footer', () => ({
  default: () => <div data-testid="footer" />,
}))

describe('ForgotPasswordLayout', () => {
  it('HeaderとFooterに挟まれてchildrenを表示する', () => {
    render(
      <ForgotPasswordLayout>
        <div data-testid="children">本文</div>
      </ForgotPasswordLayout>,
    )

    expect(screen.getByTestId('header')).toBeInTheDocument()
    expect(screen.getByTestId('footer')).toBeInTheDocument()
    expect(screen.getByTestId('children')).toHaveTextContent('本文')
  })
})
