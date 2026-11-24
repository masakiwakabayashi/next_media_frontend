import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import TagPage from './page'
import { getTagBySlug } from '@/external/repositories/tagRepository.server'

vi.mock('@/external/repositories/tagRepository.server', () => ({
  getTagBySlug: vi.fn(),
}))

vi.mock('@/features/posts/components/TagPostList', () => ({
  default: ({
    tagSlug,
    tagName,
  }: {
    tagSlug: string
    tagName: string | null
  }) => (
    <div data-testid="tag-post-list">
      {tagSlug}:{String(tagName)}
    </div>
  ),
}))

describe('TagPage', () => {
  it('paramsのslugと取得したタグ名をTagPostListに渡す', async () => {
    vi.mocked(getTagBySlug).mockResolvedValue({
      id: 't1',
      name: 'グルメ',
      slug: 'gourmet',
      created_at: '2026-01-01T00:00:00.000Z',
    })

    const jsx = await TagPage({ params: Promise.resolve({ slug: 'gourmet' }) })
    render(jsx)

    expect(getTagBySlug).toHaveBeenCalledWith('gourmet')
    expect(screen.getByTestId('tag-post-list')).toHaveTextContent(
      'gourmet:グルメ'
    )
  })

  it('タグが見つからない場合はtagNameにnullを渡す', async () => {
    vi.mocked(getTagBySlug).mockResolvedValue(null)

    const jsx = await TagPage({ params: Promise.resolve({ slug: 'gourmet' }) })
    render(jsx)

    expect(screen.getByTestId('tag-post-list')).toHaveTextContent('gourmet:null')
  })
})
