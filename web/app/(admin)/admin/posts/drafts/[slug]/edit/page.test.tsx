import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import DraftEditPage from './page'
import { getDraftPostForEdit } from '@/external/repositories/postRepository.server'
import { getCategories } from '@/external/repositories/categoryRepository'
import { getTagOptions } from '@/external/repositories/tagRepository.server'
import { notFound } from 'next/navigation'
import type { PostForEdit } from '@/types/post'
import type { Category } from '@/types/category'
import type { Tag } from '@/types/tag'

vi.mock('@/external/repositories/postRepository.server', () => ({
  getDraftPostForEdit: vi.fn(),
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
  status: 'draft',
  published_at: null,
  category_id: 'c1',
  author_id: 'a1',
  post_tags: [],
}

describe('DraftEditPage', () => {
  it('下書きが見つかった場合はPostEditにpost/categories/tagsを渡す', async () => {
    vi.mocked(getDraftPostForEdit).mockResolvedValue(post)
    vi.mocked(getCategories).mockResolvedValue(categories)
    vi.mocked(getTagOptions).mockResolvedValue(tags)

    const jsx = await DraftEditPage({ params: Promise.resolve({ slug: 'my-slug' }) })
    render(jsx)

    expect(getDraftPostForEdit).toHaveBeenCalledWith('my-slug')
    expect(screen.getByRole('heading', { name: '下書きを編集' })).toBeInTheDocument()

    const props = JSON.parse(screen.getByTestId('post-edit').textContent ?? '{}')
    expect(props).toEqual({ post, categories, tags })
  })

  it('下書きが見つからない場合はnotFoundを呼ぶ', async () => {
    vi.mocked(getDraftPostForEdit).mockResolvedValue(null)
    vi.mocked(getCategories).mockResolvedValue(categories)
    vi.mocked(getTagOptions).mockResolvedValue(tags)

    await expect(
      DraftEditPage({ params: Promise.resolve({ slug: 'missing' }) })
    ).rejects.toThrow('NEXT_NOT_FOUND')
    expect(notFound).toHaveBeenCalled()
  })
})
