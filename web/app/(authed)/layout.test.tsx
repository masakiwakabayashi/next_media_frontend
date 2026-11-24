import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import SiteLayout from './layout'

vi.mock('@/components/Header', () => ({
  default: () => <div data-testid="header" />,
}))
vi.mock('@/components/Footer', () => ({
  default: () => <div data-testid="footer" />,
}))
vi.mock('@/components/Sidebar', () => ({
  default: () => <div data-testid="sidebar" />,
}))
vi.mock('@/features/auth/components/RequireAuth', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="require-auth">{children}</div>
  ),
}))

describe('SiteLayout', () => {
  it('Header・Footer・SidebarとchildrenをRequireAuthでラップして表示する', () => {
    render(
      <SiteLayout>
        <div data-testid="children">本文</div>
      </SiteLayout>,
    )

    expect(screen.getByTestId('header')).toBeInTheDocument()
    expect(screen.getByTestId('footer')).toBeInTheDocument()
    expect(screen.getByTestId('sidebar')).toBeInTheDocument()

    const requireAuth = screen.getByTestId('require-auth')
    expect(requireAuth).toContainElement(screen.getByTestId('children'))
    expect(screen.getByTestId('children')).toHaveTextContent('本文')
  })
})
