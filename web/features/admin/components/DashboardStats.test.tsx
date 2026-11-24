import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import DashboardStats from './DashboardStats'
import { getDashboardStats } from '@/external/repositories/adminRepository'

vi.mock('@/external/repositories/adminRepository', () => ({
  getDashboardStats: vi.fn(),
}))

describe('DashboardStats', () => {
  it('取得した統計値を各カードに表示する', async () => {
    vi.mocked(getDashboardStats).mockResolvedValue({
      publishedCount: 12,
      draftCount: 3,
      categoryCount: 5,
      tagCount: 8,
    })

    const jsx = await DashboardStats()
    render(jsx)

    expect(screen.getByText('公開記事').nextElementSibling).toHaveTextContent('12')
    expect(screen.getByText('下書き').nextElementSibling).toHaveTextContent('3')
    expect(screen.getByText('タグ').nextElementSibling).toHaveTextContent('8')
  })

  it('カテゴリー数はカードとして表示しない', async () => {
    vi.mocked(getDashboardStats).mockResolvedValue({
      publishedCount: 0,
      draftCount: 0,
      categoryCount: 5,
      tagCount: 0,
    })

    const jsx = await DashboardStats()
    render(jsx)

    expect(screen.queryByText('カテゴリー')).not.toBeInTheDocument()
  })
})
