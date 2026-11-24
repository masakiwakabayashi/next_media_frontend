import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import AdminPage from './page'

vi.mock('@/features/admin/components/AdminQuickLinks', () => ({
  default: () => <div data-testid="admin-quick-links" />,
}))
vi.mock('@/features/admin/components/DashboardStats', () => ({
  default: () => <div data-testid="dashboard-stats" />,
}))

describe('AdminPage', () => {
  it('見出しと各セクションを表示する', () => {
    render(<AdminPage />)

    expect(screen.getByRole('heading', { name: 'ダッシュボード' })).toBeInTheDocument()
    expect(screen.getByTestId('admin-quick-links')).toBeInTheDocument()
    expect(screen.getByTestId('dashboard-stats')).toBeInTheDocument()
  })
})
