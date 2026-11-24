import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import CollectionDetail from './CollectionDetail'
import { getCollection } from '@/external/repositories/collectionRepository'
import type { Collection, CollectionPost } from '@/types/collection'
import { notFound } from 'next/navigation'

vi.mock('@/external/repositories/collectionRepository', () => ({
  getCollection: vi.fn(),
}))
vi.mock('next/navigation', () => ({
  notFound: vi.fn(() => {
    throw new Error('NEXT_NOT_FOUND')
  }),
}))
vi.mock('./CollectionAdminEditLink', () => ({
  default: ({ slug }: { slug: string }) => (
    <div data-testid="collection-admin-edit-link">{slug}</div>
  ),
}))

const collection: Collection = {
  id: 'c1',
  title: 'グルメ特集',
  slug: 'gourmet',
  description: '美味しいお店を集めました',
  image_path: null,
  image_url: null,
  published_at: '2026-01-15T00:00:00.000Z',
}

function makePost(
  overrides: Partial<CollectionPost['post']> = {}
): CollectionPost['post'] {
  return {
    id: 'p1',
    title: '記事1',
    slug: 'post-1',
    image_path: null,
    image_url: null,
    content: '本文',
    published_at: '2026-01-15T00:00:00.000Z',
    category: { name: 'ニュース', slug: 'news' },
    ...overrides,
  }
}

beforeEach(() => {
  vi.mocked(getCollection).mockReset()
  vi.mocked(notFound).mockClear()
})

describe('CollectionDetail', () => {
  it('特集が見つからない場合はnotFoundを呼ぶ', async () => {
    vi.mocked(getCollection).mockResolvedValue({ collection: null, posts: [] })

    await expect(
      CollectionDetail({ collectionSlug: 'missing' })
    ).rejects.toThrow('NEXT_NOT_FOUND')
    expect(getCollection).toHaveBeenCalledWith('missing')
    expect(notFound).toHaveBeenCalled()
  })

  it('特集の情報と管理者用編集リンクを表示し、記事が無ければ案内文を出す', async () => {
    vi.mocked(getCollection).mockResolvedValue({ collection, posts: [] })

    render(await CollectionDetail({ collectionSlug: 'gourmet' }))

    expect(
      screen.getByRole('heading', { name: 'グルメ特集' })
    ).toBeInTheDocument()
    expect(screen.getByText('美味しいお店を集めました')).toBeInTheDocument()
    expect(screen.getByTestId('collection-admin-edit-link')).toHaveTextContent(
      'gourmet'
    )
    expect(screen.getByText('この特集に記事はありません')).toBeInTheDocument()
  })

  it('紐づく記事を一覧表示し、カテゴリー・公開日・記事へのリンクを張る', async () => {
    vi.mocked(getCollection).mockResolvedValue({
      collection,
      posts: [
        makePost({ id: 'p1', title: '記事1', slug: 'post-1' }),
        makePost({
          id: 'p2',
          title: '記事2',
          slug: 'post-2',
          published_at: null,
          category: null,
        }),
      ],
    })

    render(await CollectionDetail({ collectionSlug: 'gourmet' }))

    expect(screen.getByRole('link', { name: '記事1' })).toHaveAttribute(
      'href',
      '/posts/post-1'
    )
    expect(screen.getByRole('link', { name: '記事2' })).toHaveAttribute(
      'href',
      '/posts/post-2'
    )
    expect(screen.getByRole('link', { name: 'ニュース' })).toHaveAttribute(
      'href',
      '/categories/news'
    )
    expect(screen.getByText('2026年1月15日')).toBeInTheDocument()
    expect(
      screen.queryByText('この特集に記事はありません')
    ).not.toBeInTheDocument()
  })

  it('カテゴリーが無い記事ではカテゴリーリンクを表示しない', async () => {
    vi.mocked(getCollection).mockResolvedValue({
      collection,
      posts: [makePost({ category: null })],
    })

    render(await CollectionDetail({ collectionSlug: 'gourmet' }))

    expect(
      screen.queryByRole('link', { name: 'ニュース' })
    ).not.toBeInTheDocument()
  })

  it('説明が無い特集では説明文を表示しない', async () => {
    vi.mocked(getCollection).mockResolvedValue({
      collection: { ...collection, description: null },
      posts: [],
    })

    render(await CollectionDetail({ collectionSlug: 'gourmet' }))

    expect(
      screen.queryByText('美味しいお店を集めました')
    ).not.toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'グルメ特集' })
    ).toBeInTheDocument()
  })
})
