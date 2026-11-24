import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import PostList from './PostList'
import { getPostsPageAction } from '@/external/handler/post/getPostsPage'
import type { PostSummary, PostsPage } from '@/types/post'

vi.mock('@/external/handler/post/getPostsPage', () => ({
  getPostsPageAction: vi.fn(),
}))

function makePost(overrides: Partial<PostSummary> = {}): PostSummary {
  return {
    id: 'p1',
    title: 'テスト記事',
    slug: 'test-post',
    image_path: null,
    image_url: null,
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
  vi.mocked(getPostsPageAction).mockImplementation(async () => {
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
  vi.mocked(getPostsPageAction).mockReset()
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

describe('PostList', () => {
  it('取得した記事を一覧表示し、次ページが無ければ終端メッセージを出す', async () => {
    mockPages([{ posts: [makePost()], nextCursor: null }])

    renderWithClient(<PostList />)

    expect(
      await screen.findByRole('link', { name: 'テスト記事' })
    ).toHaveAttribute('href', '/posts/test-post')
    expect(screen.getByText('ニュース')).toBeInTheDocument()
    expect(screen.getByText('2026年1月15日')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '#グルメ' })).toHaveAttribute(
      'href',
      '/tags/gourmet'
    )
    expect(screen.getByText('山田太郎')).toBeInTheDocument()
    expect(screen.getByText('すべての記事を表示しました')).toBeInTheDocument()
  })

  it('記事が無い場合は案内文を表示する', async () => {
    mockPages([{ posts: [], nextCursor: null }])

    renderWithClient(<PostList />)

    expect(await screen.findByText('記事がありません')).toBeInTheDocument()
  })

  it('検索クエリありで記事が無い場合はキーワードを含む案内文を表示する', async () => {
    mockPages([{ posts: [], nextCursor: null }])

    renderWithClient(<PostList query="キーワード" />)

    expect(
      await screen.findByText('「キーワード」に一致する記事がありません')
    ).toBeInTheDocument()
  })

  it('sentinel が可視になると次ページを取得して追記する', async () => {
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

    renderWithClient(<PostList />)

    expect(await screen.findByText('1件目')).toBeInTheDocument()

    await act(async () => {
      triggerIntersection()
    })

    expect(await screen.findByText('2件目')).toBeInTheDocument()
    expect(screen.getByText('1件目')).toBeInTheDocument()
    expect(screen.getByText('すべての記事を表示しました')).toBeInTheDocument()
    expect(getPostsPageAction).toHaveBeenCalledWith({
      query: undefined,
      cursor: { publishedAt: '2026-01-15T00:00:00.000Z', id: 'p1' },
    })
  })

  it('取得に失敗した場合はエラーメッセージを表示する', async () => {
    vi.mocked(getPostsPageAction).mockRejectedValue(new Error('boom'))

    renderWithClient(<PostList />)

    expect(
      await screen.findByText('記事の読み込みに失敗しました')
    ).toBeInTheDocument()
  })
})
