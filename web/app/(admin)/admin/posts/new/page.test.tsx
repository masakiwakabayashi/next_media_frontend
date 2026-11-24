import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import NewPostPage from './page'
import { getCategories } from '@/external/repositories/categoryRepository'
import { getAuthors } from '@/external/repositories/profileRepository.server'
import { getTagOptions } from '@/external/repositories/tagRepository.server'
import type { Category } from '@/types/category'
import type { Author } from '@/types/profile'
import type { Tag } from '@/types/tag'

vi.mock('@/external/repositories/categoryRepository', () => ({
  getCategories: vi.fn(),
}))
vi.mock('@/external/repositories/profileRepository.server', () => ({
  getAuthors: vi.fn(),
}))
vi.mock('@/external/repositories/tagRepository.server', () => ({
  getTagOptions: vi.fn(),
}))
vi.mock('@/features/posts/components/PostCreate', () => ({
  default: (props: unknown) => <div data-testid="post-create">{JSON.stringify(props)}</div>,
}))

const categories: Category[] = [{ id: 'c1', name: 'ニュース', slug: 'news' }]
const authors: Author[] = [{ id: 'a1', display_name: 'Alice' }]
const tags: Tag[] = [{ id: 't1', name: 'グルメ', slug: 'gourmet', created_at: '2026-01-01' }]

describe('NewPostPage', () => {
  it('カテゴリ・著者・タグをPostCreateに渡す', async () => {
    vi.mocked(getCategories).mockResolvedValue(categories)
    vi.mocked(getAuthors).mockResolvedValue(authors)
    vi.mocked(getTagOptions).mockResolvedValue(tags)

    const jsx = await NewPostPage()
    render(jsx)

    expect(screen.getByRole('heading', { name: '記事を作成' })).toBeInTheDocument()

    const props = JSON.parse(screen.getByTestId('post-create').textContent ?? '{}')
    expect(props).toEqual({
      categories,
      authors,
      tags,
      redirectTo: '/admin/posts/drafts',
    })
  })
})
