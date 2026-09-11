import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import PostDetail from './PostDetail'
import { getPost } from '@/external/repositories/postRepository.server'
import type { Post } from '@/types/post'

vi.mock('@/external/repositories/postRepository.server', () => ({
  getPost: vi.fn(),
}))
vi.mock('./AdminEditLink', () => ({
  default: ({ slug }: { slug: string }) => <div data-testid="admin-edit-link">{slug}</div>,
}))

const post: Post = {
  id: 'p1',
  title: 'テスト記事のタイトル',
  slug: 'test-post',
  image_path: null,
  content: '1行目\n2行目',
  google_maps_url: 'https://maps.google.com/?q=test',
  status: 'published',
  published_at: '2026-01-15T00:00:00.000Z',
  created_at: '2026-01-15T00:00:00.000Z',
  author: { display_name: '山田太郎', bio: 'よろしくお願いします', avatar_url: null },
  category: { name: 'ニュース', slug: 'news' },
  post_tags: [{ tag: { id: 't1', name: 'グルメ', slug: 'gourmet' } }],
}

describe('PostDetail', () => {
  it('記事が見つからない場合は案内文を表示する', async () => {
    vi.mocked(getPost).mockResolvedValue(null)

    const jsx = await PostDetail({ slug: 'missing' })
    render(jsx)

    expect(getPost).toHaveBeenCalledWith('missing')
    expect(screen.getByText('記事が見つかりませんでした')).toBeInTheDocument()
  })

  it('記事の詳細を表示する', async () => {
    vi.mocked(getPost).mockResolvedValue(post)

    const jsx = await PostDetail({ slug: 'test-post' })
    render(jsx)

    expect(screen.getByRole('heading', { name: 'テスト記事のタイトル' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'ニュース' })).toHaveAttribute(
      'href',
      '/categories/news'
    )
    expect(screen.getByText('2026年1月15日')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '#グルメ' })).toHaveAttribute('href', '/tags/gourmet')
    expect(screen.getByText('1行目')).toBeInTheDocument()
    expect(screen.getByText('2行目')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Googleマップで見る' })).toHaveAttribute(
      'href',
      'https://maps.google.com/?q=test'
    )
    expect(screen.getByTestId('admin-edit-link')).toHaveTextContent('test-post')
    expect(screen.getByText('山田太郎')).toBeInTheDocument()
    expect(screen.getByText('よろしくお願いします')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /記事一覧に戻る/ })).toHaveAttribute('href', '/')
  })

  it('アバター画像がない場合は頭文字を表示する', async () => {
    vi.mocked(getPost).mockResolvedValue(post)

    const jsx = await PostDetail({ slug: 'test-post' })
    render(jsx)

    expect(screen.getByText('山')).toBeInTheDocument()
  })

  it('Googleマップのリンクがない場合は表示しない', async () => {
    vi.mocked(getPost).mockResolvedValue({ ...post, google_maps_url: null })

    const jsx = await PostDetail({ slug: 'test-post' })
    render(jsx)

    expect(screen.queryByRole('link', { name: 'Googleマップで見る' })).not.toBeInTheDocument()
  })
})
