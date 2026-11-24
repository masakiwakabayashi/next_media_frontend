import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import InviteLayout from './layout'

vi.mock('@/components/Header', () => ({
  default: () => <div data-testid="header" />,
}))
vi.mock('@/components/Footer', () => ({
  default: () => <div data-testid="footer" />,
}))

describe('InviteLayout', () => {
  it('HeaderとFooterに挟まれてchildrenを表示する', () => {
    render(
      <InviteLayout>
        <div data-testid="children">本文</div>
      </InviteLayout>,
    )

    expect(screen.getByTestId('header')).toBeInTheDocument()
    expect(screen.getByTestId('footer')).toBeInTheDocument()
    expect(screen.getByTestId('children')).toHaveTextContent('本文')
  })
})
