import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import Home from './page'

vi.mock('@/external/repositories/postRepository.server', () => ({
  getPostsPage: vi.fn().mockResolvedValue({ posts: [], nextCursor: null }),
}))
vi.mock('@/features/posts/components/PostList', () => ({
  default: ({ query }: { query?: string }) => (
    <div data-testid="post-list">{JSON.stringify({ query })}</div>
  ),
}))
vi.mock('@/features/posts/components/SearchForm', () => ({
  default: ({ defaultValue }: { defaultValue?: string }) => (
    <div data-testid="search-form">{defaultValue}</div>
  ),
}))

function renderWithClient(ui: ReactNode) {
  return render(
    <QueryClientProvider client={new QueryClient()}>{ui}</QueryClientProvider>
  )
}

describe('Home', () => {
  it('検索クエリをSearchFormとPostListに渡す', async () => {
    const jsx = await Home({
      searchParams: Promise.resolve({ q: 'キーワード' }),
    })
    renderWithClient(jsx)

    expect(screen.getByTestId('search-form')).toHaveTextContent('キーワード')
    expect(
      JSON.parse(screen.getByTestId('post-list').textContent ?? '{}')
    ).toEqual({ query: 'キーワード' })
  })

  it('1ページ目をサーバーでプリフェッチする', async () => {
    const { getPostsPage } = await import(
      '@/external/repositories/postRepository.server'
    )

    const jsx = await Home({ searchParams: Promise.resolve({}) })
    renderWithClient(jsx)

    expect(getPostsPage).toHaveBeenCalledWith({ query: undefined })
  })
})
