import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import PublishedPostEditPage from './page'
import { getPublishedPostForEdit } from '@/external/repositories/postRepository.server'
import { getCategories } from '@/external/repositories/categoryRepository'
import { getTagOptions } from '@/external/repositories/tagRepository.server'
import { notFound } from 'next/navigation'
import type { PostForEdit } from '@/types/post'
import type { Category } from '@/types/category'
import type { Tag } from '@/types/tag'

vi.mock('@/external/repositories/postRepository.server', () => ({
  getPublishedPostForEdit: vi.fn(),
}))
vi.mock('@/external/repositories/categoryRepository', () => ({
  getCategories: vi.fn(),
}))
vi.mock('@/external/repositories/tagRepository.server', () => ({
  getTagOptions: vi.fn(),
}))
vi.mock('@/features/posts/components/PostEdit', () => ({
  default: (props: unknown) => <div data-testid="post-edit">{JSON.stringify(props)}</div>,
}))
vi.mock('next/navigation', () => ({
  notFound: vi.fn(() => {
    throw new Error('NEXT_NOT_FOUND')
  }),
}))

const categories: Category[] = [{ id: 'c1', name: 'ニュース', slug: 'news' }]
const tags: Tag[] = [{ id: 't1', name: 'グルメ', slug: 'gourmet', created_at: '2026-01-01' }]

const post: PostForEdit = {
  id: 'post1',
  title: 'タイトル',
  slug: 'my-slug',
  image_path: null,
  content: '本文',
  status: 'published',
  published_at: '2026-01-01T00:00:00.000Z',
  category_id: 'c1',
  author_id: 'a1',
  post_tags: [],
}

describe('PublishedPostEditPage', () => {
  it('公開記事が見つかった場合はPostEditにpost/categories/tagsを渡す', async () => {
    vi.mocked(getPublishedPostForEdit).mockResolvedValue(post)
    vi.mocked(getCategories).mockResolvedValue(categories)
    vi.mocked(getTagOptions).mockResolvedValue(tags)

    const jsx = await PublishedPostEditPage({ params: Promise.resolve({ slug: 'my-slug' }) })
    render(jsx)

    expect(getPublishedPostForEdit).toHaveBeenCalledWith('my-slug')
    expect(screen.getByRole('heading', { name: '記事を編集' })).toBeInTheDocument()

    const props = JSON.parse(screen.getByTestId('post-edit').textContent ?? '{}')
    expect(props).toEqual({ post, categories, tags })
  })

  it('公開記事が見つからない場合はnotFoundを呼ぶ', async () => {
    vi.mocked(getPublishedPostForEdit).mockResolvedValue(null)
    vi.mocked(getCategories).mockResolvedValue(categories)
    vi.mocked(getTagOptions).mockResolvedValue(tags)

    await expect(
      PublishedPostEditPage({ params: Promise.resolve({ slug: 'missing' }) })
    ).rejects.toThrow('NEXT_NOT_FOUND')
    expect(notFound).toHaveBeenCalled()
  })
})
