import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import AdminTagsPage from './page'
import { getTags } from '@/external/repositories/tagRepository.server'
import type { TagWithCount } from '@/types/tag'

vi.mock('@/external/repositories/tagRepository.server', () => ({
  getTags: vi.fn(),
}))
vi.mock('@/features/tags/components/TagManager', () => ({
  default: ({ initialTags }: { initialTags: unknown }) => (
    <div data-testid="tag-manager">{JSON.stringify(initialTags)}</div>
  ),
}))

const tags: TagWithCount[] = [
  { id: 't1', name: 'グルメ', slug: 'gourmet', created_at: '2026-01-01', postCount: 3 },
]

describe('AdminTagsPage', () => {
  it('取得したタグをTagManagerに渡す', async () => {
    vi.mocked(getTags).mockResolvedValue(tags)

    const jsx = await AdminTagsPage()
    render(jsx)

    expect(screen.getByRole('heading', { name: 'タグ管理' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '← ダッシュボードへ' })).toHaveAttribute(
      'href',
      '/admin'
    )
    expect(JSON.parse(screen.getByTestId('tag-manager').textContent ?? '[]')).toEqual(tags)
  })
})
