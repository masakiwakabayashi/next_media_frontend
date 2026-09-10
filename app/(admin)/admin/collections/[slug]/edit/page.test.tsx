import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import CollectionEditPage from './page'
import {
  getCollectionForEdit,
  type CollectionForEdit,
} from '@/external/repositories/collectionRepository'
import {
  getPostOptions,
  type PostOption,
} from '@/external/repositories/postRepository.server'
import { notFound } from 'next/navigation'

vi.mock('@/external/repositories/collectionRepository', () => ({
  getCollectionForEdit: vi.fn(),
}))
vi.mock('@/external/repositories/postRepository.server', () => ({
  getPostOptions: vi.fn(),
}))
vi.mock('@/features/collections/components/CollectionEdit', () => ({
  default: (props: unknown) => (
    <div data-testid="collection-edit">{JSON.stringify(props)}</div>
  ),
}))
vi.mock('next/navigation', () => ({
  notFound: vi.fn(() => {
    throw new Error('NEXT_NOT_FOUND')
  }),
}))

const collection: CollectionForEdit = {
  id: 'col1',
  title: 'タイトル',
  slug: 'my-collection',
  description: '説明',
  image_path: null,
  status: 'published',
  published_at: '2026-01-01T00:00:00.000Z',
  posts: [{ id: 'p1', title: '記事1', slug: 'post-1' }],
}

const postOptions: PostOption[] = [
  { id: 'p1', title: '記事1', slug: 'post-1' },
  { id: 'p2', title: '記事2', slug: 'post-2' },
]

describe('CollectionEditPage', () => {
  it('特集が見つかった場合はCollectionEditにcollectionとpostOptionsを渡す', async () => {
    vi.mocked(getCollectionForEdit).mockResolvedValue(collection)
    vi.mocked(getPostOptions).mockResolvedValue(postOptions)

    const jsx = await CollectionEditPage({
      params: Promise.resolve({ slug: 'my-collection' }),
    })
    render(jsx)

    expect(getCollectionForEdit).toHaveBeenCalledWith('my-collection')
    expect(screen.getByRole('heading', { name: '特集を編集' })).toBeInTheDocument()

    const props = JSON.parse(
      screen.getByTestId('collection-edit').textContent ?? '{}'
    )
    expect(props).toEqual({ collection, postOptions })
  })

  it('特集が見つからない場合はnotFoundを呼ぶ', async () => {
    vi.mocked(getCollectionForEdit).mockResolvedValue(null)
    vi.mocked(getPostOptions).mockResolvedValue(postOptions)

    await expect(
      CollectionEditPage({ params: Promise.resolve({ slug: 'missing' }) })
    ).rejects.toThrow('NEXT_NOT_FOUND')
    expect(notFound).toHaveBeenCalled()
  })
})
