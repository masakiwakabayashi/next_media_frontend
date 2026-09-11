import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import CategoryPostList from './CategoryPostList'
import { getPostsByCategoryPageAction } from '@/external/handler/post/getPostsByCategoryPage'
import type { PostSummary, PostsPage } from '@/types/post'

vi.mock('@/external/handler/post/getPostsByCategoryPage', () => ({
  getPostsByCategoryPageAction: vi.fn(),
}))

function makePost(overrides: Partial<PostSummary> = {}): PostSummary {
  return {
    id: 'p1',
    title: 'テスト記事',
    slug: 'test-post',
    image_path: null,
    content: 'あ'.repeat(120),
    status: 'published',
    published_at: '2026-01-15T00:00:00.000Z',
    created_at: '2026-01-15T00:00:00.000Z',
    author: { display_name: '山田太郎' },
    category: { name: 'ニュース', slug: 'news' },
    post_tags: [{ tag: { id: 't1', name: 'グルメ', slug: 'gourmet' } }],
    ...overrides,
  }
}

let intersectionCallbacks: IntersectionObserverCallback[] = []

function triggerIntersection() {
  intersectionCallbacks.forEach((cb) =>
    cb(
      [{ isIntersecting: true } as IntersectionObserverEntry],
      {} as IntersectionObserver
    )
  )
}

function mockPages(pages: PostsPage[]) {
  let call = 0
  vi.mocked(getPostsByCategoryPageAction).mockImplementation(async () => {
    const page = pages[Math.min(call, pages.length - 1)]
    call += 1
    return page
  })
}

function renderWithClient(ui: ReactNode) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={client}>{ui}</QueryClientProvider>
  )
}

beforeEach(() => {
  vi.mocked(getPostsByCategoryPageAction).mockReset()
  intersectionCallbacks = []
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      constructor(cb: IntersectionObserverCallback) {
        intersectionCallbacks.push(cb)
      }
      observe() {}
      unobserve() {}
      disconnect() {}
      takeRecords() {
        return []
      }
    }
  )
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('CategoryPostList', () => {
  it('カテゴリー名を見出しに表示する', () => {
    mockPages([{ posts: [], nextCursor: null }])

    renderWithClient(
      <CategoryPostList categorySlug="news" categoryName="ニュース" />
    )

    expect(
      screen.getByRole('heading', { name: 'ニュース' })
    ).toBeInTheDocument()
  })

  it('カテゴリー名が無い場合はslugを見出しに表示する', () => {
    mockPages([{ posts: [], nextCursor: null }])

    renderWithClient(
      <CategoryPostList categorySlug="news" categoryName={null} />
    )

    expect(screen.getByRole('heading', { name: 'news' })).toBeInTheDocument()
  })

  it('記事が無い場合は案内文を表示する', async () => {
    mockPages([{ posts: [], nextCursor: null }])

    renderWithClient(
      <CategoryPostList categorySlug="news" categoryName="ニュース" />
    )

    expect(
      await screen.findByText('このカテゴリーの記事はありません')
    ).toBeInTheDocument()
  })

  it('記事一覧を表示し、sentinel が可視になると次ページを追記する', async () => {
    mockPages([
      {
        posts: [makePost({ id: 'p1', title: '1件目', slug: 'first' })],
        nextCursor: { publishedAt: '2026-01-15T00:00:00.000Z', id: 'p1' },
      },
      {
        posts: [makePost({ id: 'p2', title: '2件目', slug: 'second' })],
        nextCursor: null,
      },
    ])

    renderWithClient(
      <CategoryPostList categorySlug="news" categoryName="ニュース" />
    )

    expect(await screen.findByText('1件目')).toBeInTheDocument()

    await act(async () => {
      triggerIntersection()
    })

    expect(await screen.findByText('2件目')).toBeInTheDocument()
    expect(screen.getByText('1件目')).toBeInTheDocument()
    expect(screen.getByText('すべての記事を表示しました')).toBeInTheDocument()
    expect(getPostsByCategoryPageAction).toHaveBeenCalledWith({
      categorySlug: 'news',
      cursor: { publishedAt: '2026-01-15T00:00:00.000Z', id: 'p1' },
    })
  })

  it('取得に失敗した場合はエラーメッセージを表示する', async () => {
    vi.mocked(getPostsByCategoryPageAction).mockRejectedValue(new Error('boom'))

    renderWithClient(
      <CategoryPostList categorySlug="news" categoryName="ニュース" />
    )

    expect(
      await screen.findByText('記事の読み込みに失敗しました')
    ).toBeInTheDocument()
  })
})
