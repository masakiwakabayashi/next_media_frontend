import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import CollectionList from './CollectionList'
import {
  getCollections,
  type Collection,
} from '@/external/repositories/collectionRepository'

vi.mock('@/external/repositories/collectionRepository', () => ({
  getCollections: vi.fn(),
}))

function makeCollection(overrides: Partial<Collection> = {}): Collection {
  return {
    id: 'c1',
    title: '特集タイトル',
    slug: 'feature-1',
    description: '特集の説明',
    image_path: null,
    published_at: '2026-01-15T00:00:00.000Z',
    ...overrides,
  }
}

beforeEach(() => {
  vi.mocked(getCollections).mockReset()
})

describe('CollectionList', () => {
  it('見出しを常に表示する', async () => {
    vi.mocked(getCollections).mockResolvedValue([])

    render(await CollectionList())

    expect(
      screen.getByRole('heading', { level: 1, name: '特集記事' })
    ).toBeInTheDocument()
  })

  it('特集が無い場合は案内文を表示する', async () => {
    vi.mocked(getCollections).mockResolvedValue([])

    render(await CollectionList())

    expect(screen.getByText('特集記事はありません')).toBeInTheDocument()
  })

  it('取得した特集を一覧表示し、詳細ページへのリンクを張る', async () => {
    vi.mocked(getCollections).mockResolvedValue([
      makeCollection({
        id: 'c1',
        title: 'グルメ特集',
        slug: 'gourmet',
        description: '美味しいお店',
      }),
      makeCollection({
        id: 'c2',
        title: '旅行特集',
        slug: 'travel',
        description: null,
      }),
    ])

    render(await CollectionList())

    expect(
      screen.getByRole('heading', { name: 'グルメ特集' })
    ).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '旅行特集' })).toBeInTheDocument()
    expect(screen.getByText('美味しいお店')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /グルメ特集/ })).toHaveAttribute(
      'href',
      '/collections/gourmet'
    )
    expect(screen.getByRole('link', { name: /旅行特集/ })).toHaveAttribute(
      'href',
      '/collections/travel'
    )
    expect(screen.queryByText('特集記事はありません')).not.toBeInTheDocument()
  })
})
