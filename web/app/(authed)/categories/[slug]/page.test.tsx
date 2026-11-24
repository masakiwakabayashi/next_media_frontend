import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import CategoryPage from './page'
import { getCategoryBySlug } from '@/external/repositories/categoryRepository'

vi.mock('@/external/repositories/categoryRepository', () => ({
  getCategoryBySlug: vi.fn(),
}))

vi.mock('@/features/posts/components/CategoryPostList', () => ({
  default: ({
    categorySlug,
    categoryName,
  }: {
    categorySlug: string
    categoryName: string | null
  }) => (
    <div data-testid="category-post-list">
      {categorySlug}:{String(categoryName)}
    </div>
  ),
}))

describe('CategoryPage', () => {
  it('paramsのslugと取得したカテゴリー名をCategoryPostListに渡す', async () => {
    vi.mocked(getCategoryBySlug).mockResolvedValue({
      id: 'c1',
      name: 'ニュース',
      slug: 'news',
    })

    const jsx = await CategoryPage({ params: Promise.resolve({ slug: 'news' }) })
    render(jsx)

    expect(getCategoryBySlug).toHaveBeenCalledWith('news')
    expect(screen.getByTestId('category-post-list')).toHaveTextContent(
      'news:ニュース'
    )
  })

  it('カテゴリーが見つからない場合はcategoryNameにnullを渡す', async () => {
    vi.mocked(getCategoryBySlug).mockResolvedValue(null)

    const jsx = await CategoryPage({ params: Promise.resolve({ slug: 'news' }) })
    render(jsx)

    expect(screen.getByTestId('category-post-list')).toHaveTextContent(
      'news:null'
    )
  })
})
