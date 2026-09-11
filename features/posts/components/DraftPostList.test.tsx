import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import DraftPostList from './DraftPostList'
import { getDraftPosts } from '@/external/repositories/postRepository.server'
import type { PostSummary } from '@/types/post'

vi.mock('@/external/repositories/postRepository.server', () => ({
  getDraftPosts: vi.fn(),
}))

const post: PostSummary = {
  id: 'p1',
  title: '下書き記事',
  slug: 'draft-post',
  image_path: null,
  content: 'い'.repeat(120),
  status: 'draft',
  published_at: null,
  created_at: '2026-02-01T00:00:00.000Z',
  author: { display_name: '山田太郎' },
  category: { name: 'ニュース', slug: 'news' },
  post_tags: [{ tag: { id: 't1', name: 'グルメ', slug: 'gourmet' } }],
}

describe('DraftPostList', () => {
  it('下書きがない場合は案内文を表示する', async () => {
    vi.mocked(getDraftPosts).mockResolvedValue([])

    const jsx = await DraftPostList()
    render(jsx)

    expect(screen.getByText('下書きがありません')).toBeInTheDocument()
  })

  it('下書き記事一覧を表示する', async () => {
    vi.mocked(getDraftPosts).mockResolvedValue([post])

    const jsx = await DraftPostList()
    render(jsx)

    expect(screen.getByText('下書き')).toBeInTheDocument()
    expect(screen.getByText('ニュース')).toBeInTheDocument()
    expect(screen.getByText('2026年2月1日')).toBeInTheDocument()
    expect(screen.getByText('下書き記事')).toBeInTheDocument()
    expect(screen.getByText(`${'い'.repeat(100)}...`)).toBeInTheDocument()
    expect(screen.getByText('#グルメ')).toBeInTheDocument()
    expect(screen.getByText('山田太郎')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '編集' })).toHaveAttribute(
      'href',
      '/admin/posts/drafts/draft-post/edit'
    )
  })
})
